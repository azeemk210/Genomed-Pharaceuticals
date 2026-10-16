# 05 — Regulatory, Legal & Commercial Context (India)

## 1. Statutory Classification

Genomed Pharmaceuticals manufactures and distributes **Ayurvedic Proprietary Medicines**. In India, these are legally categorized as **drugs** under the *Drugs and Cosmetics Act, 1940* and the *Drugs and Cosmetics Rules, 1945* (administered by the Ministry of AYUSH and State AYUSH Directorates), rather than dietary supplements or food (FSSAI).

### Key Legal Implications:
1. **Manufacturing Licence:** Requires a valid State AYUSH manufacturing licence issued under the Act. Production must be housed in a licensed facility inspected by drug inspectors.
2. **Schedule T GMP:** Compliance with Schedule T is mandatory. This prescribes precise plant hygiene, ventilation, working space, separate storage for raw botanicals, documentation of master formulas, and maintenance of retained batch samples.
3. **Schedule E(1) Exclusions:** Formulations containing Schedule E(1) poisonous botanical/mineral substances (e.g. Aconite, Datura, Bhang, Nux Vomica, heavy metal bhasmas) cannot be dispensed over the counter without a qualified Ayurvedic practitioner's prescription. Genomed’s current 10 proprietary formulations are positioned for over-the-counter/ethical OTC and general distribution.

---

## 2. Advertising Laws & Online Medical Claims

A critical compliance factor governing the website copy is the **Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954**:

- The Act strictly prohibits public advertisements claiming that any drug cures or treats conditions listed in its schedule, including:
  * *Diabetes / High Blood Sugar*
  * *High or Low Blood Pressure / Heart Disease*
  * *Disorders of Menstrual Flow / Diseases of the Uterus*
  * *Sexual Impotence / Sterility*
  * *Kidney Stones / Gall Bladder Complaints*

### Copy Compliance on the Website:
- Claims on [https://genomed-pharaceuticals.onrender.com/](https://genomed-pharaceuticals.onrender.com/) are phrased cautiously and accurately to maintain strict compliance:
  - **Sugar OK Liquid:** Positioned as *"metabolic support"* and *"supportive care in blood-sugar management alongside physician-directed care"* — never as a "cure for diabetes".
  - **Cistover Liquid:** Positioned as *"supportive management of cystic complaints"* — avoiding unqualified therapeutic promises.
  - **Stroperm Powder:** Worded as *"male stamina and reproductive vitality support"* — avoiding prohibited claims.
- Every product page explicitly carries a standard statutory disclaimer:
  > *"Important. [Product Name] is a herbal proprietary medicine. This page is for distributors, healthcare professionals and general reference — it is not a prescription or medical advice, and does not replace consultation with a qualified practitioner. Always read the pack insert before use."*

---

## 3. Commercial Transition: From B2B Enquiry to Direct Checkout

The current site deliberately converts shopping cart items into a **B2B Order Enquiry** rather than an automated retail gateway checkout. 

### Why B2B Enquiry First:
1. **Institutional Order Quantities:** Genomed primarily supplies cartons and shipper cases to regional stockists, clinics, and distributors rather than individual retail bottles.
2. **Trade Pricing Differentials:** Territory distributors receive volume-based trade discounts and credit terms that cannot be represented by a single retail MSRP.
3. **Regulatory Clearance for Gateways:** Operating a direct D2C payment gateway (Razorpay, Cashfree, PhonePe) for Ayurvedic drugs requires submission of active AYUSH manufacturing licenses, GSTIN, verified business PAN, and statutory refund/shipping policies.

### Prerequisites for Launching Full D2C E-Commerce (Roadmap):
- **Statutory Disclosures:** Consumer Protection (E-Commerce) Rules 2020 require listing a designated Grievance Officer, return/refund windows, and manufacturer legal address on every PDP.
- **Payment Gateway Integration:** Razorpay / Cashfree webhook integration verifying order amounts.
- **Shipping Logistics:** Pan-India courier APIs (Shiprocket / Delhivery) with transit insurance and pin-code serviceability checks.
- **Inventory & Order Backend:** Server-side database recording invoice generation and GST breakdown.
