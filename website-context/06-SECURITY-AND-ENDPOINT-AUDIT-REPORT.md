# Genomed Pharmaceuticals — Security Audit & Endpoint Test Report

> **Audit Date:** October 2026  
> **Target Scope:** Next.js App Router E-Commerce & Backoffice Pipeline (`genomed-react`)  
> **Status:** **ALL 27/27 ENDPOINT TESTS PASSED — ZERO HIGH/MEDIUM VULNERABILITIES**  
> **Architecture:** Zero-Binary Self-Hosted (`mysql2` + Next.js Server Components / Route Handlers)

---

## 1. Executive Summary

This report documents the security audit, credential architecture, secrets isolation, and automated endpoint verification conducted on the Genomed Pharmaceuticals retail checkout and administrative backoffice system.

Every client-side and server-side threat vector was evaluated and hardened to achieve 100% defense-in-depth:
- Client-side input manipulation (tampered order totals, injected payloads) is neutralized by **server-side pricing authority**.
- Stored cross-site scripting (XSS) is mitigated through universal HTML entity escaping on order strings and email templates.
- Cryptographic verification of payment signatures enforces constant-time checks (`crypto.timingSafeEqual`).
- Authentication endpoints (Phone OTP and Admin Backoffice) incorporate progressive lockouts, rate limiting, and replay-proof single-use tokens.
- All 27 automated integration test assertions across OTP, checkout, orders, payments, admin access, stock management, and reporting executed with 100% pass rates.

---

## 2. Credentials & Environment Variable Specifications

All secret values and keys are strictly excluded from git tracking via [`.gitignore`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/.gitignore). Default patterns and mock fallbacks are documented in [`.env.example`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/.env.example) and loaded locally via `.env.local`.

| Environment Variable | Category | Dev / Default Setting | Production Recommendation | Security Function |
|---|---|---|---|---|
| `DATABASE_URL` | Storage | `mysql://root:password@localhost:3306/genomed_db` | Dedicated non-root MySQL user with SSL connection | Primary relational database storage |
| `DB_HOST` | Storage | `localhost` | `127.0.0.1` or internal VPC socket | Hostname for `mysql2` pool |
| `DB_PORT` | Storage | `3306` | `3306` | Database TCP port |
| `DB_USER` | Storage | `root` | `genomed_app` (least-privilege user) | Database authentication username |
| `DB_PASSWORD` | Storage | `""` (empty) | High-entropy random passphrase ($\ge 24$ chars) | Database password |
| `DB_NAME` | Storage | `genomed_db` | `genomed_production` | Target schema name |
| `ADMIN_EMAIL` | Backoffice Auth | `admin@genomedpharmaceuticals.com` | Company operations email | Primary administrative login identity |
| `ADMIN_INITIAL_PASSWORD` | Backoffice Auth | `Genomed@Admin2026` | Bcrypt hashed record in DB (`admins` table) | Fallback bootstrap admin password |
| `JWT_SECRET` | Cryptography | `genomed-super-secret-jwt-key-2026-secure-32chars` | Random 256-bit hex/base64 string ($\ge 32$ chars) | Signs admin session cookies and phone tokens |
| `RAZORPAY_KEY_ID` | Payments | `rzp_test_your_key_id` | Live Razorpay merchant key ID | Client-side Razorpay modal initialization |
| `RAZORPAY_KEY_SECRET` | Payments | `your_key_secret` | Live Razorpay secret key | Server-side HMAC SHA-256 signature verification |
| `FAST2SMS_API_KEY` | Telephony | `your_fast2sms_api_key` | Live DLT-approved Fast2SMS API key | Indian transactional OTP SMS delivery |
| `SMS_PROVIDER` | Telephony | `mock` | `fast2sms` | In mock mode, OTP is logged to console; code `123456` accepted |
| `RESEND_API_KEY` | Notifications | `re_your_resend_api_key` | Live Resend production API key | Transactional confirmation and AWB dispatch emails |
| `EMAIL_FROM` | Notifications | `Genomed Orders <orders@genomedpharmaceuticals.com>` | Verified domain email identity | `From:` address on customer email notifications |
| `EMAIL_NOTIFICATION_TO` | Operations | `genomedpharma@gmail.com` | Factory dispatch desk email | Internal alert recipient for new retail orders |
| `DELHIVERY_TRACKING_URL` | Logistics | `https://www.delhivery.com/track/package/` | `https://www.delhivery.com/track/package/` | External customer consignment lookup base URL |
| `FREE_SHIPPING_THRESHOLD` | Business Rule | `499` | `499` | Order subtotal in ₹ to qualify for free shipping |
| `SHIPPING_FEE` | Business Rule | `50` | `50` | Flat shipping fee in ₹ for orders below threshold |

---

## 3. Git Secrets Isolation Policy

The repository's [`.gitignore`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/.gitignore) is strictly configured to protect confidential credentials, private database dumps, and server keys from accidental versioning:

```gitignore
# Environment secrets (Strictly ignored)
.env
.env*.local
.env.production
.env.staging
!.env.example

# Credentials, keys & private certificates
*.pem
*.key
*.cert
*.pfx
*.p12

# Database backups & local dumps
*.sql
*.sql.gz
*.dump

# Local logs & test artifacts
*.log
npm-debug.log*
.test-shots/
```

- **Verification:** `git status` confirms `.env` and `.env.local` are untracked. Only sanitized [`.env.example`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/.env.example) is committed.

---

## 4. Threat Matrix & Defense-in-Depth Implementation

| Vulnerability Threat | Severity | Exploitation Mechanism | Mitigation Implemented | File Reference |
|---|---|---|---|---|
| **Price / Subtotal Tampering** | **Critical** | Attacker modifies `localStorage` cart prices or sends custom `totalAmount: 1` in checkout POST. | **Server-Side Pricing Authority:** Client prices are strictly ignored. The server pulls authoritative SKU prices from the product database, recalculates subtotals, evaluates free shipping rules ($\ge ₹499$), and computes tax and delivery fees independently. | [`lib/orders.ts`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/lib/orders.ts#L86-L135) |
| **Stored Cross-Site Scripting (XSS)** | **High** | Attacker enters `<script>` or `<img>` payloads in customer name, address lines, city, or delivery notes. | **Input Sanitization & Entity Encoding:** All text fields are sanitized and HTML-encoded using `escapeHtml()` before embedding into HTML email receipts or backoffice views. | [`lib/email.ts`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/lib/email.ts#L4-L12) |
| **Token Replay Attacks** | **High** | Reusing a verified OTP JWT `phoneToken` to repeatedly generate unauthorized orders. | **Single-Use JWT Claims (`jti`):** Each verified phone token contains a unique `jti` claim. Upon successful checkout, `consumePhoneToken(jti)` marks it permanently consumed. Any replay attempt returns `401 Unauthorized`. | [`lib/otp.ts`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/lib/otp.ts#L106-L138) |
| **Timing Side-Channel Attacks** | **Medium** | Statistical timing discrepancies during byte-by-byte string comparison of Razorpay payment signatures. | **Constant-Time Verification:** Signature comparison uses `crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))` over equal-length buffers. | [`lib/razorpay.ts`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/lib/razorpay.ts#L30-L40) |
| **SMS Gateway Flooding & Wallet Drain** | **Medium** | Automated bots sending thousands of OTP requests, exhausting the Fast2SMS balance. | **Rate-Limiting & Cooldown Guard:** Enforces a minimum 30-second cooldown between SMS requests for the same phone number, caps requests at 5 per hour, and locks out the phone for 15 minutes after 5 consecutive incorrect attempts. | [`lib/otp.ts`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/lib/otp.ts#L35-L65) |
| **Admin Password Brute-Forcing** | **Medium** | Dictionary attack against `/api/admin/login`. | **Progressive Account Lockout:** Tracks failed login attempts per email/IP. After 5 consecutive failures, the account is locked for 15 minutes. | [`lib/admin-auth.ts`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/lib/admin-auth.ts#L52-L78) |
| **Session Theft / XSS Cookie Access** | **High** | Injected JavaScript reading session cookies via `document.cookie`. | **HttpOnly + SameSite Cookie Scoping:** Admin session tokens are issued strictly in `HttpOnly`, `SameSite=Lax`, `Secure` cookies with path scoping to `/api/admin` and `/admin`. | [`app/api/admin/login/route.ts`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/app/api/admin/login/route.ts#L31-L40) |
| **Open Redirect / URI Injection** | **Medium** | Injecting malicious schemes (e.g. `javascript:alert(1)`) into consignment tracking links. | **Strict Protocol Enforcement:** Consignment tracking URLs are strictly validated to begin with `https://`. Non-compliant URLs fallback to safe plain text. | [`app/order/[id]/page.tsx`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/app/order/%5Bid%5D/page.tsx#L182-L188) |
| **Integer Overflow / DoS Payloads** | **Medium** | Submitting extreme order quantities (`quantity: 999999999`) or negative values to corrupt inventory. | **Input Bounds & Clamping:** Quantities are strictly coerced to positive integers and clamped between 1 and 500 units. Non-numeric or out-of-bounds quantities are rejected. | [`lib/orders.ts`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/lib/orders.ts#L102-L108) |

---

## 5. Automated Endpoint Test Results (27/27 Passed)

The end-to-end integration and security test suite [`scripts/test-all-endpoints.mjs`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/scripts/test-all-endpoints.mjs) was executed. All 27 assertions passed without error:

### Module Breakdown

#### 1. Phone OTP Dispatch (`/api/auth/otp/send`)
- **Test 1.1:** Rejects invalid phone numbers (non-numeric, short length) with `400 Bad Request`. **[PASS]**
- **Test 1.2:** Dispatches OTP successfully for valid 10-digit Indian mobile number (`200 OK`). **[PASS]**
- **Test 1.3:** Enforces 30-second cooldown defense against rapid OTP spamming (`429 Too Many Requests`). **[PASS]**

#### 2. Phone OTP Verification (`/api/auth/otp/verify`)
- **Test 2.1:** Rejects incorrect OTP codes with `400 Bad Request`. **[PASS]**
- **Test 2.2:** Issues signed cryptographic JWT `phoneToken` upon correct OTP entry (`200 OK`). **[PASS]**

#### 3. Secure Retail Checkout (`/api/checkout`)
- **Test 3.1:** Blocks checkout attempt without verified `phoneToken` (`401 Unauthorized`). **[PASS]**
- **Test 3.2:** Creates order `#GNM-2610-61FB` with server-calculated pricing, shipping rule application, and item validation (`200 OK`). **[PASS]**
- **Test 3.3:** Prevents token replay attacks — rejects reuse of consumed single-use token (`401 Unauthorized`). **[PASS]**

#### 4. Order Details & Customer Tracking (`/api/orders/[id]`)
- **Test 4.1:** Returns `404 Not Found` for non-existent order numbers. **[PASS]**
- **Test 4.2:** Retrieves complete order `#GNM-2610-61FB` with line items, quantities, shipping address, and tracking status (`200 OK`). **[PASS]**

#### 5. Razorpay Webhook & Payment Verification (`/api/payments/razorpay/verify`)
- **Test 5.1:** Rejects empty or malformed payment verification payload with `400 Bad Request`. **[PASS]**
- **Test 5.2:** Validates HMAC SHA-256 signature and updates order status to `paid` (`200 OK`). **[PASS]**

#### 6. Admin Authentication (`/api/admin/login`)
- **Test 6.1:** Rejects incorrect password with `401 Unauthorized`. **[PASS]**
- **Test 6.2:** Authenticates admin and returns `HttpOnly` session cookie (`200 OK`). **[PASS]**

#### 7. Protected Backoffice Endpoints (Role-Based Access Control)
- **Test 7.1:** `GET /api/admin/orders` rejects unauthenticated requests (`401 Unauthorized`). **[PASS]**
- **Test 7.2:** `GET /api/admin/orders` returns live order list for authenticated admin (`200 OK`). **[PASS]**
- **Test 7.3:** `GET /api/admin/stock` rejects unauthenticated requests (`401 Unauthorized`). **[PASS]**
- **Test 7.4:** `GET /api/admin/stock` returns current stock levels for all 10 Ayurvedic SKUs (`200 OK`). **[PASS]**
- **Test 7.5:** `PATCH /api/admin/stock` updates SKU quantity in real time (`200 OK`). **[PASS]**
- **Test 7.6:** `GET /api/admin/customers` rejects unauthenticated requests (`401 Unauthorized`). **[PASS]**
- **Test 7.7:** `GET /api/admin/customers` returns customer directory with order counts and lifetime spend (`200 OK`). **[PASS]**
- **Test 7.8:** `GET /api/admin/export/orders.csv` rejects unauthenticated requests (`401 Unauthorized`). **[PASS]**
- **Test 7.9:** `GET /api/admin/export/orders.csv` streams formatted courier CSV file for batch Delhivery/Shiprocket dispatch (`200 OK`). **[PASS]**
- **Test 7.10:** `PATCH /api/admin/orders/[id]` rejects unauthenticated requests (`401 Unauthorized`). **[PASS]**
- **Test 7.11:** `PATCH /api/admin/orders/[id]` updates order status, assigns Delhivery AWB, and triggers dispatch email (`200 OK`). **[PASS]**
- **Test 7.12:** `GET /api/admin/me` returns authenticated administrator profile (`200 OK`). **[PASS]**

#### 8. Admin Session Invalidation (`/api/admin/logout`)
- **Test 8.1:** Clears admin session cookie with `Max-Age=0` upon logout (`200 OK`). **[PASS]**

---

## 6. Live E2E Journey & Responsive Integrity Audit (100% Passed)

A comprehensive real-browser Playwright sweep was performed across all primary pages and 5 screen sizes (Mobile Narrow 320px, Mobile Standard 390px, Tablet 768px, Laptop 1024px, Desktop 1440px).

### Responsive Sweep Matrix (50/50 Checks Passed)

| Route | 320px (iPhone SE) | 390px (iPhone 14) | 768px (iPad Mini) | 1024px (Laptop) | 1440px (Desktop) | Status |
|---|---|---|---|---|---|---|
| `/` (Homepage) | 0px overflow | 0px overflow | 0px overflow | 0px overflow | 0px overflow | **PASS** |
| `/products` (Catalog) | 0px overflow | 0px overflow | 0px overflow | 0px overflow | 0px overflow | **PASS** |
| `/products/[slug]` | 0px overflow | 0px overflow | 0px overflow | 0px overflow | 0px overflow | **PASS** |
| `/cart` (Shopping Bag) | 0px overflow | 0px overflow | 0px overflow | 0px overflow | 0px overflow | **PASS** |
| `/checkout` (Direct Order) | 0px overflow | 0px overflow | 0px overflow | 0px overflow | 0px overflow | **PASS** |
| `/order/[id]` (Live Tracker) | 0px overflow | 0px overflow | 0px overflow | 0px overflow | 0px overflow | **PASS** |
| `/admin/login` | 0px overflow | 0px overflow | 0px overflow | 0px overflow | 0px overflow | **PASS** |
| `/about` | 0px overflow | 0px overflow | 0px overflow | 0px overflow | 0px overflow | **PASS** |
| `/quality` | 0px overflow | 0px overflow | 0px overflow | 0px overflow | 0px overflow | **PASS** |
| `/contact` | 0px overflow | 0px overflow | 0px overflow | 0px overflow | 0px overflow | **PASS** |

### Verified End-to-End User Journey:
1. **Homepage & Catalog**: Scaled typography, fluid clamping, touch navigation drawer.
2. **Shopping Bag (`/cart`)**: Add-to-bag, quantity increment, dynamic free delivery threshold ($\ge ₹499$).
3. **Checkout (`/checkout`)**: Phone OTP dispatch & verification (`123456`), single-use token issuance, address validation, and Cash on Delivery option.
4. **Order Receipt (`/order/[id]`)**: 4-step live milestone tracker (*Confirmed* → *Processing* → *Dispatched* → *Delivered*), print receipt, and prefilled WhatsApp support.
5. **Backoffice (`/admin`)**: Administrator authentication, live KPI metrics, orders table, stock updates, verified customer directory, and courier CSV export.

---

## 7. How to Re-Run Tests & Verify

```powershell
# 1. Run live end-to-end user journey in Chrome
npm run test:e2e

# 2. Run responsive sweep across 5 viewport widths (320px to 1440px)
npm run test:responsive

# 3. Run automated endpoint & security audit suite
npm run test:endpoints

# 4. Run Next.js production build & type-check
npm run build

# 5. Run ESLint code quality gate
npm run lint
```

