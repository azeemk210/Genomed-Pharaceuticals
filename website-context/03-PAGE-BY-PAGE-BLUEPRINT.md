# 03 — Page-by-Page Content & User Journey Blueprint

This document details the exact UX structure, UI components, copy highlights, and conversion funnels for each route on [https://genomed-pharaceuticals.onrender.com/](https://genomed-pharaceuticals.onrender.com/).

---

## 1. Homepage (`/`)

- **Primary Goal:** Establish institutional credibility, communicate manufacturing rigor (Schedule T GMP), showcase the 8 therapeutic areas, and funnel visitors toward B2B distributorship or product exploration.
- **Key Sections:**
  1. **Top Bar:** Quick contact info (`+91 97604 11123`, `genomedpharma@gmail.com`), plant location, order enquiries.
  2. **Site Header:** Navigation links (About, Products, Quality, Partner With Us, Contact), real-time Saved Products counter, real-time Enquiry List counter, and gold "Distributor Enquiry" CTA button.
  3. **Hero Section:**
     - Video backdrop (`/media/hero-compounding.mp4` / poster fallback).
     - Eyebrow: *"Herbal formulation manufacturer · Bulandshahr, Uttar Pradesh"*.
     - Headline: *"Ten formulations across eight therapeutic areas — compounded, release-tested and batch-coded at our own plant in Bulandshahr, Uttar Pradesh, then supplied to distributors and institutions nationwide."*
     - CTAs: *"Explore the portfolio"* (links to `/products`) and *"Become a distributor"* (links to `/partner`).
     - 4 Core Pillars:
       - *Licensed manufacture:* State drug manufacturing licence, Schedule T GMP.
       - *In-house quality control:* Every batch release-tested before leaving.
       - *Batch traceability:* Batch, mfg date, and expiry on every pack.
       - *Supplied across India:* Despatch across India from UP.
  4. **Therapeutic Portfolio Grid:**
     - 8 cards representing the medical disciplines (Hepatology, Diabetology, Nephrology, etc.) with count badges and direct filter links (`/products?area=...`).
  5. **Selected Formulations:**
     - Featured product showcase (Decoliv-DS, Rimcuff-SF, Sugar OK, KCR Powder) displaying MRP, discounted price, dosage form, pack size, and quick-enquiry links.
  6. **Animated Stat Grid (`StatGrid.tsx`):**
     - Four hard-corner square tiles with photographic backdrops and count-up numbers:
       - `10` Formulations in production
       - `8` Therapeutic areas served
       - `100%` Herbal compositions
       - `4` Dosage forms manufactured
  7. **"Who We Are" Heritage & Process Story:**
     - 4 sequential checkpoints: Purity of input, Process discipline, Evidence on every pack, Dependable supply.
  8. **Quality & Manufacturing Teaser:**
     - Highlighting Drug Manufacturing Licence, Schedule T GMP, In-house QC Lab, Batch Traceability.
  9. **"Why Partners Choose Genomed":**
     - Predictable supply, robust audit documentation, focused tight catalogue.
  10. **Final CTA Band (`CTABand.tsx`):**
      - *"Looking for a manufacturing or distribution partner?"* with direct phone and enquiry links.
  11. **Site Footer (`Footer.tsx`):**
      - Company address, telephone, email, operating hours, navigation links, therapeutic areas index, statutory herbal medicine disclaimer, copyright 2026, Privacy Policy, Terms of Use.

---

## 2. About Us Page (`/about`)

- **Primary Goal:** Tell the founder's ethos and institutional origin story.
- **Key Content:**
  - *Our Story:* Emphasizes that herbal medicine has never lacked good formulas, but has lacked batch-to-batch consistency and audit documentation. Genomed closes that gap by treating herbal medicine with conventional pharmaceutical discipline.
  - *Vision:* "A standard that does not move" — consistency across seasons and order volumes.
  - *Mission (5 Points):*
    1. Manufacture every batch to written specs, release none that fails.
    2. Source botanical inputs tested before batch entry.
    3. Keep documentation that withstands statutory audits and queries.
    4. Price honestly so medicine remains accessible to patients.
    5. Supply distributors reliably so they can plan their business.
  - *Core Commitments (4 Pillars):*
    - "Do it properly or not at all"
    - "Respect the tradition"
    - "Write it down"
    - "Be easy to work with"

---

## 3. Products Catalog Page (`/products`)

- **Primary Goal:** Enable distributors, prescribers, and stockists to quickly filter, search, inspect, and enquire about products.
- **Key Features:**
  - **Live Filter Engine (`ProductFilter.tsx`):**
    - Instant filter by Therapeutic Area (all 8 areas + All).
    - Instant filter by Dosage Form (Syrup, Liquid, Powder, Capsule + All).
    - Instant search input querying product name, indications, positioning, and keywords without full reload.
  - **Product Card (`ProductCard.tsx`):**
    - Genuine pack shot photography (`/public/products/*.webp`).
    - Merchandising badges (`HOT`, `NEW`).
    - MRP and strike-through list price calculation (`Save X%`).
    - Dosage form and pack size tags.
    - Quantity stepper / "Add to Enquiry" button (`AddToCart.tsx`).
    - Bookmark / Save icon.
    - Direct link to full SKU detail page.

---

## 4. Product Detail Page (`/products/[slug]`)

- **Primary Goal:** Comprehensive technical and commercial dossier for an individual SKU.
- **Key Elements:**
  - Breadcrumb navigation: `Home > Products > [Therapy Area] > [Product Name]`.
  - Pack photo with disclaimer: *"Pack shown for identification. Artwork can differ between batches."*
  - Therapy area badge with icon.
  - Product descriptor and pricing (MRP inclusive of all taxes, trade pricing prompt).
  - Add to Enquiry list counter / Saved toggle.
  - Indications checklist.
  - Composition Notice: *"The full composition for [Product] is issued as approved product literature rather than published on the website. We send it to distributors, prescribers and institutional buyers on request."*
  - Dosage and Physician Advisory: *"To be taken as directed by a registered practitioner or physician."*
  - Storage & Handling precautions.
  - Sticky Bottom Buy Bar on mobile for fast enquiry initiation.
  - Inline Enquiry Form (`EnquiryForm.tsx`) pre-filled with the active product.
  - Related products from the same therapeutic range.

---

## 5. Quality & Manufacturing Page (`/quality`)

- **Primary Goal:** Reassure institutional buyers and regulatory authorities of facility capability.
- **Key Content:**
  - *Philosophy:* "A release test tells you what happened. It does not make a good batch. Quality is decided upstream."
  - *5 Working Practices:*
    1. One standard, every batch (fixed master formulas).
    2. Material in before product out (quarantine & raw testing).
    3. Deviations recorded, not absorbed.
    4. Lessons travel across products.
    5. Retention and complete lot traceability.
  - *8-Stage Production Flowchart ("From Herb to Pack"):*
    1. Intake → 2. Identification → 3. Preparation → 4. Formulation → 5. In-process checks → 6. Filling → 7. Release testing → 8. Documentation.
  - *Statutory Credentials:* Schedule T GMP, State Manufacturing Licence under Drugs & Cosmetics Act 1940.

---

## 6. Partner With Us Page (`/partner`)

- **Primary Goal:** Convert prospective pharma distributors, franchise seekers, and third-party manufacturing clients.
- **Audience Segments:**
  - Distributors & Stockists (territory appointments, written margins).
  - Institutional Buyers (hospitals, clinics, dispensaries).
  - Third-party Contract Manufacturing (private label Ayurvedic production).
- **Partner Value Proposition:**
  - Locked trade margins, credit terms settled up front.
  - Batch certificates of analysis included with every consignment.
  - Production planned to partner forecasts.
  - Dedicated operational contact with phone access during office hours.
- **Interactive B2B Partner Form:**
  - Fields for Firm Name, Contact Person, Phone, Email, City & State, Business Type, Target Therapeutic Areas, and Territory Brief.

---

## 7. Contact Us Page (`/contact`)

- **Primary Goal:** Direct inquiries, facility visiting arrangements, and general communication.
- **Channels:**
  - Direct Phone: `+91 97604 11123`
  - Direct Email: `genomedpharma@gmail.com`
  - Visiting Protocol: By prior appointment only (Monday–Saturday, 9:30 am – 6:30 pm IST).
  - Physical Location Guide: Dhakauli village, Post Malaghar, Bulandshahr, with directions from the main road.
  - Interactive Contact Form with 2-business-day turnaround guarantee.

---

## 8. Cart / Enquiry List Page (`/cart`)

- **Primary Goal:** Facilitate B2B order enquiry creation with quantities, subtotals, and export.
- **Behavior:**
  - Retains state across browser sessions via `localStorage` (`StoreProvider.tsx`).
  - Item list displaying SKU photo, pack size, unit MRP, quantity steppers, item totals.
  - Calculation of estimated total value.
  - B2B Order Submission Form: visitor submits contact details and enquiry notes. Generates structured email payload or submits to backend endpoint, avoiding unfulfilled payment gateways.

---

## 9. Saved Products Page (`/saved`)

- **Primary Goal:** Provide a persistent shortlist for clinicians and procurement officers comparing formulations.
- **Behavior:**
  - Stored in browser `localStorage`.
  - Enables one-click transfer of all saved items into the active Enquiry List.

---

## 10. Legal Pages (`/privacy` & `/terms`)

- **Privacy Policy (`/privacy`):**
  - Clarifies that the site operates as an information and business enquiry service, with no ad trackers, no payment gateway telemetry, and no behavioral profiling.
  - Discloses minimal external services (self-hosted fonts, Google Maps embed on contact page).
- **Terms of Service (`/terms`):**
  - Emphasizes that published content is for reference and trade information.
  - Reaffirms that products are Ayurvedic proprietary medicines requiring physician direction.
  - Explicit disclaimer that the website does not provide direct medical consultations or prescriptions.
