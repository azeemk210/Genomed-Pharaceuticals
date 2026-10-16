# Genomed Pharmaceuticals — Production Onboarding & Credentials Guide
**Document Type:** Business Owner & Director Action Guide  
**Purpose:** Step-by-step instructions and document checklists for activating Online Payments (Razorpay), Mobile SMS OTP, Express Delivery (Delhivery), and Cloud Hosting.

---

## Executive Summary

To connect the live Genomed website (`genomedpharmaceuticals.com`) to the Indian banking and logistics networks, the business owner/director must complete onboarding across 4 standard Indian business platforms:

| Service | Provider | Purpose | Time Required |
|---|---|---|---|
| **1. Online Payments** | **Razorpay** | UPI (GPay, PhonePe, Paytm), Netbanking & Debit/Credit Cards | 1–2 Business Days |
| **2. Customer OTP SMS** | **Fast2SMS / MSG91** | Verify mobile numbers before cash on delivery / orders | 1 Business Day |
| **3. Courier & Logistics** | **Delhivery One** | Doorstep parcel pickup from Dhakauli & live tracking across India | 1 Business Day |
| **4. Cloud Server & DB** | **Hostinger / DigitalOcean VPS** | High-speed server and MySQL database to store orders safely | 30 Minutes |

Once each account is registered, copy the requested **API Keys / Credentials** from the tables below and send them to your technical developer.

---

## Part 1: Online Payments — Razorpay Merchant Account

Razorpay is the Reserve Bank of India (RBI) authorized payment aggregator used by Indian pharmacies and brands.

### Documents Required for Business KYC
Prepare scanned PDF or clear JPEG copies of the following:
1. **Business Registration:** Company PAN Card (or Proprietorship/Partnership PAN).
2. **GST Certificate:** Form GST REG-06 showing the Bulandshahr / Uttar Pradesh registration address.
3. **Ayurvedic Drug Manufacturing License:** Scanned copy of state AYUSH manufacturing license (`UP-AYU-BUL-2021`).
4. **Bank Account Proof:** Cancelled cheque or bank statement (past 3 months) showing Account Name, Account Number, and IFSC code for daily settlement payouts.
5. **Authorized Signatory KYC:** Director/Owner Aadhaar Card (front & back) and PAN card.
6. **Website URL:** `https://genomedpharmaceuticals.com` (Website must have live Contact, Privacy, Terms, Refund, and Shipping policies — *these are already implemented on the site*).

### Step-by-Step Activation Process
1. **Sign Up:** Go to [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup) and register with your official email (e.g., `genomedpharma@gmail.com` or `director@genomedpharmaceuticals.com`).
2. **Business Profile:**
   - Business Type: Private Limited / Partnership / Proprietorship (as per your legal incorporation).
   - Category: **Healthcare & Pharmaceuticals** → **Ayurvedic / Herbal Medicine**.
   - Website URL: Enter `https://genomedpharmaceuticals.com`.
3. **Submit KYC:** Upload the documents listed above. Razorpay typically approves accounts within 24 to 48 hours.
4. **Generate API Keys (Send to Developer):**
   - Once approved, log in and switch the toggle at the top from **Test Mode** to **Live Mode**.
   - Go to **Account & Settings** (left sidebar) → **API Keys**.
   - Click **Generate Key**.
   - Copy and save the **Key ID** and **Key Secret** (you will only see the Secret once).
5. **Configure Webhook (Connect Payment Confirmation to Website):**
   - Go to **Account & Settings** → **Webhooks** → Click **Add New Webhook**.
   - **Webhook URL:** Enter `https://genomedpharmaceuticals.com/api/payments/razorpay/webhook`
   - **Secret:** Create a password/passphrase (e.g., `GenomedWebhookSecret2026`) and write it down.
   - **Active Events:** Check the box for `order.paid` and `payment.captured`.
   - Click **Save**.

### Information to Hand Over to Developer
- [ ] `RAZORPAY_KEY_ID` (starts with `rzp_live_...`)
- [ ] `RAZORPAY_KEY_SECRET`
- [ ] `RAZORPAY_WEBHOOK_SECRET`

---

## Part 2: SMS Verification Gateway — Fast2SMS (or MSG91)

To protect Genomed against fake Cash on Delivery orders, the website sends a 6-digit one-time password (OTP) to the customer’s phone before checkout is permitted.

Under Telecom Regulatory Authority of India (TRAI) regulations, commercial transactional SMS requires DLT (Distributed Ledger Technology) registration.

### Option A: Fast2SMS (Recommended — Fastest Setup for Indian Brands)
Fast2SMS offers instant signup and quick transactional Quick-SMS routes with zero technical friction.

1. **Sign Up:** Visit [https://www.fast2sms.com](https://www.fast2sms.com) and create an account using your business phone number and email.
2. **Add Wallet Balance:** Recharge with ₹500 or ₹1,000 (SMS cost is approx ₹0.18 to ₹0.22 per OTP message).
3. **Generate API Authorization Key:**
   - In the left sidebar, click on **Dev API**.
   - Click **Copy API Key**.
4. **DLT Route vs Quick Route:**
   - Fast2SMS provides an instant **OTP Route** where standard OTP templates are pre-approved.
   - *Message Template sent:* `Your Genomed Pharmaceuticals verification code is 123456. Valid for 5 minutes.`

### Option B: Enterprise DLT via MSG91 (If sending with branded Sender ID like `GNOMED`)
1. Register on Jio DLT ([https://trueconnect.jio.com](https://trueconnect.jio.com)) or Airtel DLT with Company PAN and GST.
2. Register Sender Header: `GNOMED`.
3. Create Content Template:
   - Template Name: `Genomed_OTP`
   - Template Category: `Service Implicit`
   - Template Content: `Your Genomed verification code is {#var#}. Valid for 5 minutes. Do not share with anyone. - Genomed Pharmaceuticals`
4. Register at [https://msg91.com](https://msg91.com) and link the approved DLT Template ID.

### Information to Hand Over to Developer
- [ ] SMS Provider Selected (`fast2sms` or `msg91`)
- [ ] `SMS_API_KEY`

---

## Part 3: Courier & Parcel Delivery — Delhivery One

Delhivery is India's leading surface express courier network with specialized liquid/bottle handling and automated Cash on Delivery (COD) bank remittance.

### Documents Required
1. Company GSTIN & PAN.
2. Pickup Warehouse Address: **Genomed Pharmaceuticals, Village Dhakauli, Bulandshahr, Uttar Pradesh - 203001**.
3. Contact Person Name & Mobile Number for daily courier pickup executive coordination.
4. Bank details for **COD Remittance** (where Delhivery deposits cash collected from customers at their doorsteps).

### Step-by-Step Setup Process
1. **Sign Up on Delhivery One:**
   - Visit [https://one.delhivery.com](https://one.delhivery.com) and click **Sign Up**.
   - Choose **Business Account**.
2. **Add Warehouse Pickup Location:**
   - Go to **Settings** → **Locations / Warehouses** → **Add New Location**.
   - Set Name: `Dhakauli Plant Warehouse`.
   - Address: `Badda Madrsha, Post Malaghar, Village Dhakauli, Bulandshahr, Uttar Pradesh, 203001`.
   - Enter local warehouse manager contact number.
3. **Configure Bank Account for COD Remittances:**
   - Go to **Settings** → **Bank Accounts & Payouts**.
   - Enter your company bank account details and upload cancelled cheque.
   - Delhivery will remit COD collections directly to this account every Tuesday and Friday.
4. **Obtain API Token (Optional for Automated Waybill Generation):**
   - Go to **Settings** → **API Services** → **API Keys**.
   - Click **Generate Token**.
   *(Note: You can also use Delhivery One by simply uploading the CSV of daily orders exported from your Genomed Admin dashboard with a single click).*

### Information to Hand Over to Developer
- [ ] Registered Pickup Pincode (`203001`)
- [ ] Delhivery API Token (if automated label printing is desired)

---

## Part 4: Cloud Server & MySQL Database Hosting

To ensure the website runs 24/7 with fast load times, automated daily database backups, and SSL encryption, a dedicated Linux VPS is required.

### Recommended Provider: Hostinger VPS or DigitalOcean
- **Recommended Plan:** 
  - **Hostinger KVM 2 VPS** (approx. ₹499–₹699 / month) OR
  - **DigitalOcean Basic Droplet** ($12 / month — 2 GB RAM, 1 vCPU, 50 GB NVMe SSD, Ubuntu 24.04 LTS).
- **Location:** Choose **India (Mumbai)** datacenter for fastest access across Uttar Pradesh and India.

### What the Business Owner Needs to Purchase
1. **Virtual Private Server (VPS):**
   - OS: **Ubuntu 24.04 64-bit**.
   - Datacenter: **India (Mumbai / Bangalore)**.
2. **Domain DNS Access:**
   - Log in to your domain registrar (GoDaddy, BigRock, Namecheap, or Hostinger where `genomedpharmaceuticals.com` was purchased).
   - The developer will need to add an `A` record pointing to the new VPS IP address.

### Information to Hand Over to Developer
- [ ] VPS Server IP Address (e.g. `142.93.xxx.xxx`)
- [ ] VPS Root Username & Password (or SSH Key)
- [ ] Domain Registrar Login or DNS access to add the `A` record

---

## Master Handover Checklist for the Developer

When all accounts are created, fill out this table and securely provide it to your developer:

```ini
# =============================================================================
# GENOMED PHARMACEUTICALS — PRODUCTION CREDENTIALS HANDOVER
# =============================================================================

# 1. PAYMENTS (RAZORPAY LIVE)
RAZORPAY_KEY_ID = rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET = xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET = GenomedWebhookSecret2026

# 2. SMS OTP GATEWAY
SMS_PROVIDER = fast2sms
SMS_API_KEY = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 3. LOGISTICS (DELHIVERY)
DELHIVERY_CLIENT_ID = xxxxxxxx
DELHIVERY_API_KEY = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DELHIVERY_PICKUP_PINCODE = 203001

# 4. SERVER & DOMAIN
SERVER_IP = xxx.xxx.xxx.xxx
SERVER_ROOT_PASSWORD = xxxxxxxxxxxxxxxx
DOMAIN_NAME = genomedpharmaceuticals.com

# 5. BUSINESS EMAIL NOTIFICATIONS (Hostinger / Zoho / Google Workspace)
SMTP_HOST = smtp.hostinger.com (or smtp.zoho.in)
SMTP_PORT = 587
SMTP_USER = orders@genomedpharmaceuticals.com
SMTP_PASS = xxxxxxxxxxxxxxxx
SMTP_FROM = "Genomed Pharmaceuticals <orders@genomedpharmaceuticals.com>"

# 6. MASTER ADMIN PORTAL ACCESS
ADMIN_EMAIL = admin@genomedpharmaceuticals.com
ADMIN_INITIAL_PASSWORD = ChooseASecurePassword2026!
```

---

*This guide was generated for the management and executive team of Genomed Pharmaceuticals. All platforms specified conform to statutory compliance under the Drugs and Cosmetics Act 1940, Ayush Drug Rules, and Indian E-Commerce Consumer Protection Guidelines 2020.*
