# Genomed Pharmaceuticals — All-in-One Comprehensive Website Context

> **Primary Live Site:** [https://genomed-pharaceuticals.onrender.com/](https://genomed-pharaceuticals.onrender.com/)  
> **Official Corporate URL:** [https://www.genomedpharmaceuticals.com](https://www.genomedpharmaceuticals.com)  
> **Codebase:** `genomed-react` (Next.js 16.3 App Router, React 19, Tailwind CSS v4)  
> **Compiled:** October 2026  
> **Repository Status:** Ignored via `.gitignore` (`/website-context/`)

---

## 1. Executive Summary & Brand Identity

**Genomed Pharmaceuticals** is an Indian manufacturer of licensed Ayurvedic proprietary medicines located in Bulandshahr, Uttar Pradesh. The company manufactures 10 core herbal formulations across 8 distinct therapeutic segments.

- **Tagline:** *"Your health, our priority"*
- **Core Ethos:** Bringing conventional pharmaceutical discipline (written master formulas, raw botanical quarantine, deviation investigations, Schedule T GMP compliance, and indelible batch tracking) to authentic Ayurvedic and herbal formulations.
- **Physical Plant Address:** Badda Madrsha, Post Malaghar, Village Dhakauli, Bulandshahr, Uttar Pradesh 203001, India.
- **Direct Phone:** `+91 97604 11123` | **Email:** `genomedpharma@gmail.com`
- **Hours:** Monday – Saturday, 9:30 am – 6:30 pm IST.
- **Commercial Model:** B2B Territory Distributors, PCD Pharma Franchises, Institutional Buyers (Hospitals & Dispensaries), and Third-party Contract Manufacturing.

---

## 2. Product Catalog & Therapeutic Segments

### 8 Therapeutic Areas:
1. **Liver Care (Hepatology):** Hepatoprotective and regenerative syrups formulated to support liver function and recovery.
2. **Metabolic Care (Diabetology):** Herbal liquids and syrups supporting blood-sugar management and metabolic balance.
3. **Renal Care (Nephrology):** Powder formulations supporting kidney function and urinary comfort.
4. **Women's Health (Gynaecology):** Formulations addressing cystic and related gynaecological complaints.
5. **Skin & Blood Purification (Dermatology):** Sugar-free syrups working on skin complaints through blood purification.
6. **Haemostatics (Haematology):** Capsule formulation indicated for the control of bleeding.
7. **Men's Wellness (Vitality):** Powder formulation supporting male reproductive health and stamina.
8. **General Wellness (Tonics & Distillates):** Classical herbal distillates (*Arqs*) and general tonics in large packs.

### 10 Products Master Table:
| SKU Name | Therapy Area | Dosage Form | Pack Size | Offer MRP | List MRP | Discount | Badges & Notes |
|---|---|---|---|---|---|---|---|
| **Decoliv-DS Syrup** | Liver Care | Syrup | 200 ml | ₹138 | ₹172 | 20% off | Featured, Double Strength |
| **Rimcuff-SF Syrup** | Liver Care | Syrup (SF) | 100 ml | ₹65 | ₹81 | 20% off | Featured, Sugar-Free |
| **Sugar OK Liquid** | Metabolic Care | Liquid | 500 ml | ₹238 | ₹238 | — | Featured, `NEW` badge |
| **Stoclean-SF Syrup** | Metabolic Care | Syrup (SF) | 200 ml | ₹160 | ₹160 | — | Sugar-Free metabolic syrup |
| **KCR Powder** | Renal Care | Powder | 100 g | ₹190 | ₹190 | — | Featured, Oral Reconstitution |
| **Cistover Liquid** | Women's Health | Liquid | 500 ml | ₹260 | ₹288 | 10% off | Featured, Cystic Care |
| **QSB Capsules** | Haemostatics | Capsule | 500 mg | ₹65 | ₹76 | 14% off | Quickly Stop Bleeding |
| **Heamclear-SF Syrup**| Skin Care | Syrup (SF) | 200 ml | ₹166 | ₹166 | — | Sugar-Free Blood Purifier |
| **Stroperm Powder** | Men's Wellness | Powder | 100 g | ₹450 | ₹473 | 5% off | Reproductive Vitality |
| **ARQ-15** | General Wellness| Distillate | 450 ml | ₹171 | ₹171 | — | Classical Distillate, `HOT` |

---

## 3. Site Navigation & Page Architecture

- **`/` (Homepage):** High-converting corporate landing page. Features hero video backdrop, core credentials (Schedule T GMP, State AYUSH License), category tiles, featured product showcase, 4-tile animated stat grid (10 formulations, 8 therapies, 100% herbal, 4 forms), process narrative ("Purity of Input", "Process Discipline", "Evidence on Every Pack", "Dependable Supply"), and distributor lead capture.
- **`/about` (About Us):** Founding philosophy, corporate vision ("A standard that does not move"), 5-point mission statement, and 4 operational pillars ("Do it properly or not at all", "Respect the tradition", "Write it down", "Be easy to work with").
- **`/products` (Product Portfolio):** Client-side instant filter system by Therapeutic Area and Dosage Form, instant search bar, product cards with real packaging photography, discount calculation tags, and quick-enquiry steppers.
- **`/products/[slug]` (Product Detail Pages):** Dynamic routing for all 10 products with pack photos, regulatory cautionary text, indications checklists, storage instructions, request-literature prompts, and sticky enquiry buttons.
- **`/quality` (Quality & Manufacturing):** 8-stage manufacturing workflow ("Intake", "Identification", "Preparation", "Formulation", "In-process checks", "Filling", "Release testing", "Documentation") and 5 operational QC commitments.
- **`/partner` (Partner With Us):** B2B distributor appointment overview, terms (written margins, forecast scheduling, batch CoAs), 4-stage onboarding flow, and detailed territory inquiry lead form.
- **`/contact` (Contact Us):** Plant address, visiting policy (by appointment), telephone, email, Google Maps embed, and inquiry messaging form.
- **`/cart` (Enquiry List):** Browser localStorage-backed shopping bag allowing distributors to specify product quantities, review total estimated value, and submit as a consolidated order enquiry.
- **`/saved` (Saved Products):** Browser-saved product bookmarks for clinicians and procurement officers.
- **`/privacy` & `/terms` (Legal & Regulatory):** Explicit disclosures clarifying that the site operates as an information and B2B enquiry portal with no online payment gateways, ad trackers, or algorithmic tracking.

---

## 4. Technical Stack & Design System

- **Framework:** Next.js 16.3.5 App Router, React 19.2.8, static pre-rendering of all 21 routes.
- **Styling:** Tailwind CSS v4 (`@theme` tokens in `app/globals.css`).
- **Color System:**
  - *Forest Palette:* `forest-700` (`#135a47`), `forest-950` (`#08281f`), `forest-50` (`#edf6f2`).
  - *Gold Palette:* `gold-500` (`#d69c28`), `gold-700` (`#996813`).
  - *Sand Neutrals:* `sand-0` to `sand-900` with green tint.
- **Typography:** Display serif `Fraunces` and body sans `Manrope` (self-hosted via `next/font`), fluid type scale using CSS `clamp()`, tabular numbers via `tnum`.
- **Aesthetic Principles:** Clean, airy, all-light surfaces; zero dark section blocks; razor-sharp 1px hairline borders; genuine botanical photography and looping laboratory videos; measured contrast ratios exceeding 11:1.
- **Performance:** Sub-1.3 MB initial page load weight; zero bloated animation libraries (pure CSS + IntersectionObserver).

---

## 5. Regulatory & Indian Pharma Context

- **Classification:** Ayurvedic Proprietary Medicines under the *Drugs and Cosmetics Act, 1940* and *Drugs and Cosmetics Rules, 1945*.
- **Licensing & Standards:** Schedule T Good Manufacturing Practice (GMP) issued by UP State AYUSH Licensing Authority.
- **Compliance Guardrails:** Wording strictly adheres to the *Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954* (e.g. positioning Sugar OK as supportive metabolic care rather than claiming a diabetes cure).
- **Commercial Stance:** Enquiries are routed via structured B2B lead generation rather than unfulfilled retail checkouts, matching the company's institutional and distribution scale.
