# Genomed — Online Ordering Roadmap (India)

Local planning document. Not committed (`docs/` is git-ignored).
Written 19 Sep 2026. Prices and free-tier limits change — every figure below
should be re-checked on the provider's pricing page before signing up.

---

## 0. Where we are today

The site already has the front half of a shop:

| Have | Where |
|---|---|
| Product catalogue, 10 SKUs, prices, discounts | `lib/products.ts` |
| Cart ("enquiry list") in the browser, survives reload | `components/StoreProvider.tsx` (localStorage) |
| Add / quantity stepper on cards, product page, cart | `components/AddToCart.tsx` |
| Cart page with totals | `app/cart/` |
| Enquiry form (currently opens the visitor's email app) | `components/EnquiryForm.tsx`, `formEndpoint` in `lib/site.ts` |

What is missing for a real order: a **checkout** (address, delivery, payment),
a **server** that records the order, a **payment gateway**, **shipping**, and
**notifications**. Plus the legal groundwork, which is the real first step.

---

## 1. Before writing any code — legal and business prerequisites

Genomed sells **Ayurvedic proprietary medicines**. They are *drugs* under the
Drugs and Cosmetics Act 1940, not food or cosmetics. That is what makes this
different from an ordinary online shop.

### 1.1 Licences and registrations (all required)

| Item | Why | Status |
|---|---|---|
| **Ayurvedic drug manufacturing licence** (State AYUSH licensing authority, UP) | Already needed to manufacture; gateways and couriers will ask for a copy | Have — number needed (`credentials` in `lib/site.ts` is still `verified: false`) |
| **GST registration** | Selling goods to other states online makes GST registration compulsory regardless of turnover. Also required by every payment gateway. | Confirm GSTIN |
| **Business PAN + current account** in the business name | Gateway payouts go here; KYC | Confirm |
| **Udyam (MSME) registration** | Free, 10 minutes online, unlocks cheaper gateway/courier plans and is accepted as business proof | Recommended |
| **Trade mark check** on product names | Optional, but "Sugar OK", "Rimcuff" etc. should be searched on ipindia.gov.in before spending on marketing | Optional |

### 1.2 Can these products legally be sold online?

- Ayurvedic/Siddha/Unani (ASU) medicines **not** containing **Schedule E(1)**
  ingredients (poisonous substances such as aconite, datura, bhang, nux
  vomica, certain metals) can be sold over the counter, including online.
- **Action:** check every formulation's composition against Schedule E(1) of
  the Drugs and Cosmetics Rules. Anything on that list needs a prescription and
  should not go into the online checkout at all. This is the single most
  important check and only the company (with the compositions) can do it.

### 1.3 Advertising law — this affects the product pages directly

The **Drugs and Magic Remedies (Objectionable Advertisements) Act 1954** bans
advertising any drug as a treatment for a scheduled list of conditions. That
list includes, among others:

> diabetes · high or low blood pressure · obesity · heart disease · diseases of
> the uterus · disorders of menstrual flow · sexual impotence · sterility ·
> stones · gall bladder disease · rheumatism · ulcers

Several current product claims touch this list:

| Product | Claim on pack / site | Scheduled condition |
|---|---|---|
| Sugar OK | "For healthy blood sugar level" | Diabetes |
| ARQ-15 | High blood pressure, high cholesterol, anti-obesity | Blood pressure, obesity |
| Cistover | Uterine/ovarian cyst | Diseases of the uterus |
| Stroperm | Men's wellness / vitality | Sexual impotence (depending on wording) |

A product *label* approved under the manufacturing licence is one thing; a
*website* selling to the public is an advertisement. Before launch, have a
pharma-regulatory consultant or lawyer review the product pages. Usual
outcome: indications are worded as on the licensed label, no "cures", and a
"consult a physician" line stays on every page (already present).

### 1.4 What an Indian e-commerce site must display

**Consumer Protection (E-Commerce) Rules 2020** and **Legal Metrology
(Packaged Commodities) Rules 2011**, both mandatory:

- Legal name, full address, phone and email of the seller (have)
- **Grievance officer**: name, contact, and a 48-hour acknowledgement promise
- Country of origin on every product (India)
- On every product page: **MRP, net quantity, manufacturer name and address,
  consumer-care details** (partly have — need manufacturer address on PDP)
- Batch number / expiry are on the pack (already stated)
- Policy pages: **Shipping**, **Returns/Refunds/Cancellation** (medicines are
  usually non-returnable except for damage or wrong item), **Terms**, **Privacy**
  (have Terms and Privacy; need Shipping and Refunds)
- Clear total price including all charges before payment

Payment gateways will not approve the account without the policy pages live.

### 1.5 What the gateway KYC will ask for

Have these scanned and ready — same set for Razorpay, Cashfree, PhonePe, PayU:

1. Business PAN
2. GST certificate
3. Cancelled cheque or bank statement (business account)
4. Business registration: Udyam certificate / partnership deed / incorporation
   certificate / shop & establishment licence — any one
5. Authorised signatory's PAN + Aadhaar
6. **Drug manufacturing licence** — because "pharma / healthcare products" is a
   *restricted category* at every Indian gateway and gets manual review
7. Live website with the policy pages above and a working contact page

Expect **3–10 working days** for approval of a pharma merchant.

---

## 2. Payment options for India — compared

Government policy sets **zero MDR on UPI and RuPay debit cards**, so most
gateways pass those through free or near-free and earn on cards, net-banking
and wallets. For a small business selling ₹65–₹450 items, UPI will be most of
your volume, so the UPI rate is the number that matters.

### 2.1 Options from cheapest to most complete

| Option | Cost (typical, verify) | Setup | Good for | Downsides |
|---|---|---|---|---|
| **A. Static UPI QR / UPI ID + manual confirmation** | ₹0 | Nothing — print the QR from any UPI app | Day one, zero cost | You confirm each payment by hand; no automatic order status; no cards; doesn't scale past a few orders/day |
| **B. Payment links / payment pages** (Razorpay Payment Links, Cashfree Payment Links, Instamojo) | ~2% + GST per card payment; UPI 0–2% depending on provider | No code — you send a link per order | Low volume, phone-led B2B orders | Manual step per order; not a checkout on the site |
| **C. Full gateway checkout** (Razorpay, Cashfree, PhonePe PG, PayU) | UPI: 0% at PhonePe/Cashfree-type plans, ~2% at some; Cards/net-banking: ~1.75–2% + 18% GST on the fee; **no setup or annual fee** on standard plans | 1–2 days of code + KYC approval | The real shop — automatic confirmation, all methods, refunds, webhooks | Restricted-category review; T+1 to T+3 settlement |
| **D. Cash on Delivery** via courier aggregator | Courier COD fee ~₹25–₹50 or ~1.5–2% per order, remitted weekly | Ships with the courier setup | Trust for first-time buyers in Tier-2/3 India — still 30–50% of Indian e-commerce orders | Returns-to-origin risk; money arrives a week later |

**Recommendation:** start with **C (one gateway) + D (COD)**. A is fine for the
first fortnight while KYC is pending. B is a good fallback for distributor
orders taken on the phone.

### 2.2 Which gateway

All four below have no setup fee and a standard ~2% card rate. Differences that
matter for Genomed:

| Gateway | UPI rate (verify) | Pharma category | Developer fit with Next.js | Notes |
|---|---|---|---|---|
| **Razorpay** | Historically charged on UPI; check current "standard pricing" | Accepts with licence | Best docs, official Node SDK, easy webhooks, Magic Checkout (address + OTP prefill) | Largest ecosystem; most tutorials |
| **Cashfree** | UPI often 0% on standard plan | Accepts with licence | Good SDK, "Payment Gateway" + "Payouts" for refunds | Slightly cheaper cards on negotiation |
| **PhonePe Payment Gateway** | UPI 0% | Accepts with licence | REST API, fewer examples | Strong for UPI-heavy traffic; PhonePe app users get one-tap |
| **PayU** | Similar | Accepts | Older API style | Fine, no strong reason over the above |
| Stripe | 2% + more for international | — | Excellent | **Not** open to new Indian merchants at time of writing (invite-only) — skip |
| Instamojo | 2% + ₹3 flat per transaction, free plan | Accepts | Payment links / mini-store | Flat ₹3 hurts on ₹65 items; good only for links |

**Pick:** **Razorpay** for the checkout (fastest to build, best-documented,
Magic Checkout saves address typing on phones). If UPI fees on Razorpay's
current plan are non-zero and UPI ends up >70% of orders, **Cashfree** or
**PhonePe PG** as a second gateway is a two-day job later — the order flow is
designed so the gateway is swappable (see §5).

Apply for **both** Razorpay and Cashfree on day one; approval times vary and
having one approved is what unblocks launch.

### 2.3 Fees on a real order (illustrative)

Order: 2 × Sugar OK = ₹476, paid by UPI.

| Provider path | Fee | Genomed receives |
|---|---|---|
| UPI at 0% | ₹0 | ₹476 |
| UPI at 2% + GST | ₹9.52 + ₹1.71 GST = ₹11.23 | ₹464.77 |
| Card at 2% + GST | ₹11.23 | ₹464.77 |
| COD, courier fee ₹40 | ₹40 (courier, not gateway) | ₹436 (a week later) |

Decide whether COD carries a surcharge (many Indian shops add ₹30–₹50 for COD
orders under ₹500) or a minimum order value.

---

## 3. Shipping medicines within India

| Option | Cost (500 g, within India, approx.) | Setup | Notes |
|---|---|---|---|
| **India Post — Speed Post / Registered Parcel** | ₹40–₹90 | Walk in; or Business Parcel account | Cheapest, reaches every pincode; slower (3–7 days); manual booking; COD available via "Cash on Delivery Speed Post" |
| **Shiprocket / iThink Logistics / NimbusPost** (aggregators) | ₹25–₹45 + surcharges; COD +₹25–₹40 or ~2% | Free account, API, prints labels, auto pickup | One integration, many couriers (Delhivery, Xpressbees, Bluedart, Ekart); rate calculator by pincode; tracking pages; **recommended** |
| **Delhivery direct** | Similar; needs minimum volume for good rates | API | Better rates only at scale |

**Medicine-specific points**

- **Liquids** (7 of 10 SKUs are syrups/liquids): most courier partners accept
  sealed, non-flammable liquids ≤ 1 L in leak-proof packaging with absorbent
  fill; some exclude "liquids" outright on air routes. On the aggregator, mark
  the SKU as *liquid* and use surface shipping; keep glass bottles in a box
  with bubble wrap — breakage is the main return reason.
- Print the **batch number and expiry** on the invoice.
- Sell only what has at least ~6 months' shelf life left.
- A **packing checklist** per order (invoice inside, tamper seal, batch noted)
  prevents most disputes.

**Recommendation:** Shiprocket (or iThink — cheaper at low volume; compare the
two rate cards for Bulandshahr pickup) with COD enabled. Free plan is enough
until ~100 orders/month.

---

## 4. Forms, enquiries, notifications, records — cheapest reliable stack

### 4.1 Enquiry / contact forms (today's gap: `formEndpoint` is empty)

| Service | Free tier | Fit |
|---|---|---|
| **Web3Forms** | 250 submissions/month, unlimited forms, no account for the site visitor; email + optional webhook | Simplest; paste one access key into `formEndpoint` and the existing form works. **Do this now.** |
| Formspree | 50/month free | Same idea, lower limit |
| Getform / Basin | ~50/month free | Same |
| Tally / Google Forms embed | Free | Ugly in a designed site; loses the prefilled cart summary |
| **Own API route + email API** (Next.js Route Handler + Resend or Brevo) | Resend: 3,000 emails/month free; Brevo: 300/day free | Needed anyway for order emails — so the enquiry form can move onto it in Phase 2 and Web3Forms is then dropped |

### 4.2 Transactional email (order confirmation, shipped, refund)

| Service | Free tier | Notes |
|---|---|---|
| **Resend** | 3,000/month, 1 domain | Best developer experience, official Next.js examples |
| Brevo (ex-Sendinblue) | 300/day | Also does SMS (India) and WhatsApp |
| Amazon SES | ~₹8 per 1,000 | Cheapest at volume, more setup |

Needs a domain email (e.g. `orders@genomedpharmaceuticals.com`) with SPF/DKIM
records set — 30 minutes with the domain registrar. The current
`genomedpharma@gmail.com` cannot be used as a *sending* address.

### 4.3 SMS / WhatsApp order updates (optional, high impact in India)

| Service | Cost | Notes |
|---|---|---|
| **MSG91** | ~₹0.15–₹0.25 per SMS; OTP route | DLT registration required (free but a week of paperwork: entity + templates on a telecom DLT portal). Needed for any promotional/transactional SMS in India |
| WhatsApp Business API via **Interakt / AiSensy / Gupshup** | ~₹0.10–₹0.80 per conversation; some free tiers | Customers prefer it; needs Meta business verification |
| **WhatsApp Business app** (free) | ₹0 | Manual messages from the phone — fine for the first months |

Start with the free WhatsApp Business app; automate later.

### 4.4 Database and order records

The cart lives in the browser today. Orders must live on a server.

| Service | Free tier | Notes |
|---|---|---|
| **Supabase** (Postgres + auth + storage) | 500 MB DB, 50k monthly active users, 1 GB storage | One service covers orders, customers, addresses, login, invoice PDFs. **Recommended.** |
| Neon (Postgres only) | 0.5 GB | Pair with a separate auth solution |
| Turso / SQLite | Generous free | Fine, fewer built-ins |
| Google Sheets via API | Free | Tempting; do not — no transactions, race conditions on stock |

### 4.5 Customer login

Guest checkout is standard and enough to launch. If accounts are wanted:
Supabase Auth with **email magic link** (free) or **phone OTP** (Supabase +
MSG91/Twilio, paid per SMS; Firebase Auth gives 10k phone verifications/month
free but is a second platform). Recommendation: guest checkout + order lookup
by phone/OTP later.

### 4.6 Invoicing and accounts

GST tax invoices are required for every order. Options: generate a PDF from the
order (a 60-line React-PDF template) and email it; or **Zoho Books** (free plan
for businesses under ₹25 lakh turnover) via its API. Start with the PDF.

### 4.7 Hosting

Current site is Next.js — **Vercel Hobby is free** but is for non-commercial
use; a shop must be on **Vercel Pro (~US$20/month per seat)**, or on a ₹400–₹800
/month VPS (Hetzner, DigitalOcean) with Coolify/Docker, or on Cloudflare
Workers (free tier is commercial-friendly, but Next.js support has gaps).
Recommendation: Vercel Pro for the first year — the least operations work.

### 4.8 Monthly cost estimate at launch

| Item | Cost |
|---|---|
| Domain | already owned |
| Vercel Pro | ~₹1,700 |
| Supabase | ₹0 |
| Resend | ₹0 |
| Web3Forms (until replaced) | ₹0 |
| Shiprocket plan | ₹0 (pay per shipment) |
| Payment gateway | ₹0 fixed; ~0–2% per order |
| WhatsApp Business app | ₹0 |
| **Total fixed** | **~₹1,700/month** + per-order fees |

---

## 5. Technical design — how it plugs into the current code

```
Browser                         Server (Next.js route handlers)        Third parties
───────                         ───────────────────────────────        ─────────────
cart (localStorage)  ──POST──▶  /api/checkout
                                  • re-price every line from lib/products
                                    (never trust client prices)
                                  • validate address, pincode serviceability ──▶ Shiprocket rate API
                                  • create order row (status: pending)    ──▶ Supabase
                                  • create gateway order                  ──▶ Razorpay
                     ◀── order_id + gateway order id
gateway checkout UI  ──pay──▶                                            ──▶ Razorpay
                                /api/payments/webhook  ◀── payment.captured (signed)
                                  • verify signature
                                  • mark order paid, decrement stock      ──▶ Supabase
                                  • create shipment                       ──▶ Shiprocket
                                  • email confirmation + invoice PDF      ──▶ Resend
/order/[id]          ◀── status page (paid / packed / shipped + tracking link)
```

Design rules that save pain later:

- **Prices are recomputed on the server** from `lib/products.ts`. The browser
  only sends slugs and quantities.
- **Payment truth comes from the webhook**, not from the browser's "success"
  redirect. Orders are `pending` until the webhook confirms.
- **Idempotency**: the webhook can fire twice; the order id is the key.
- **Gateway behind one interface** (`createOrder`, `verifyWebhook`, `refund`)
  so Razorpay can be swapped for Cashfree without touching checkout.
- **Stock**: a simple `stock` integer per SKU in Supabase; decrement on paid;
  hide "Add" and show "Out of stock" at 0. Stock is not in `lib/products.ts`
  today — it moves to the database.
- **COD orders** skip the gateway and go straight to `confirmed`, with an
  optional phone OTP to deter fake COD orders.

### Data model (Supabase)

```
customers  (id, phone, email, name, created_at)
addresses  (id, customer_id, line1, line2, city, state, pincode, phone, is_default)
orders     (id, customer_id, address_id, status, payment_method, subtotal,
            shipping_fee, cod_fee, total, gateway_order_id, gateway_payment_id,
            shipment_id, tracking_url, created_at, paid_at, shipped_at)
order_items(id, order_id, slug, name, pack, unit_price, qty, batch_no, expiry)
stock      (slug, qty_available, updated_at)
```

Snapshot `name`, `pack` and `unit_price` into `order_items` — a later price
change must not rewrite old invoices.

---

## 6. Roadmap

### Phase 0 — Groundwork (business side, 2–4 weeks, runs in parallel with Phase 1)

- [ ] Schedule E(1) check of every composition (§1.2)
- [ ] Regulatory review of product-page wording (§1.3)
- [ ] GSTIN, business bank account, Udyam certificate
- [ ] Decide: COD yes/no, COD surcharge, minimum order value, free-shipping threshold
- [ ] Decide: sell to consumers, distributors, or both (distributor pricing needs login + a second price list)
- [ ] Draft Shipping policy and Returns/Refund/Cancellation policy
- [ ] Name a grievance officer
- [ ] Apply for Razorpay **and** Cashfree with the KYC set in §1.5
- [ ] Open Shiprocket (or iThink) account; enter pickup address
- [ ] Set up `orders@` mailbox; add SPF/DKIM
- [ ] Paste a Web3Forms key into `formEndpoint` so enquiries stop depending on the visitor's email app — 10 minutes, do it today

### Phase 1 — Checkout without a gateway (1 week of development)

Ships as soon as Phase 0's policies exist; payment can be COD and/or UPI QR.

- [ ] Supabase project; tables from §5
- [ ] `/checkout` page: contact → address (pincode lookup for city/state) → delivery method → payment method (COD / Pay on UPI QR / Card & UPI online *coming soon*) → review
- [ ] `/api/checkout` creating the order server-side
- [ ] `/order/[id]` status page + email confirmation (Resend)
- [ ] Shipping/Refund policy pages; manufacturer address + grievance officer on PDP and footer
- [ ] Admin: for now, Supabase's table editor is the admin. Order → mark packed → paste tracking → status page updates.

### Phase 2 — Online payment (3–5 days once a gateway is approved)

- [ ] Gateway module (Razorpay first), checkout button, webhook with signature check
- [ ] Refund endpoint (full and partial)
- [ ] Failed/abandoned payment handling: order stays `pending` 30 min, then `expired`
- [ ] Invoice PDF attached to the confirmation email

### Phase 3 — Shipping automation (3 days)

- [ ] Shiprocket API: serviceability + rate at checkout, create shipment on paid, tracking link on status page and in a "shipped" email
- [ ] Liquid/fragile flags per SKU

### Phase 4 — Accounts and reorders (1 week, optional)

- [ ] Phone/email login, saved addresses, order history, one-tap reorder
- [ ] Distributor tier: login-gated trade price list, minimum quantities, credit terms off-line

### Phase 5 — Operations (ongoing)

- [ ] Small admin screen (orders list, status change, stock) instead of the table editor
- [ ] WhatsApp/SMS updates
- [ ] Low-stock alerts, monthly GST report export
- [ ] Analytics (Vercel Analytics or Plausible), conversion funnel

---

## 7. What I need from Genomed to start Phase 1

1. Answers to the five "Decide" items in Phase 0
2. Full manufacturer address and grievance officer name/contact for the policy pages
3. Draft of the refund/return rules (or say "use the standard: no returns on medicines except damaged/wrong item within 48 hours, with photos")
4. Which products are allowed for online sale after the Schedule E(1) check
5. Pickup address and working days for the courier account
6. A Supabase account (free — sign up with the company email) and, when ready, gateway API keys — added as Vercel environment variables, never in the repo

---

## 8. Alternatives if building a custom checkout is too much

| Route | Cost | Trade-off |
|---|---|---|
| **Razorpay / Cashfree Payment Pages** — a hosted order form per product | ~2% | No code; but loses the cart, address validation and the site's design |
| **Shopify** (India plans from ~₹1,999/month + 2% third-party gateway fee unless using Shopify Payments) | ₹2,000+/month | Everything built in; but the existing Next.js site would become a marketing front for a separate store, and pharma is restricted there too |
| **Dukaan / Instamojo store** | Free–₹1,000/month | Very simple; limited design control; the same restricted-category checks |
| **WooCommerce** (what the old site was) | Hosting ~₹500/month | Known quantity; but it is what the old site's problems came from |

The custom route above costs about the same per month as Shopify's cheapest
plan and keeps the site you already have.
