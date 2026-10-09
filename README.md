# Genomed Pharmaceuticals — website

A premium corporate pharmaceutical site: a light, airy palette with dark type, video-backed
sections, a filterable product portfolio, a quality & manufacturing story, and a distributor
enquiry funnel.

It carries the storefront functionality the old WooCommerce site had — search, an enquiry
list with quantities and totals, saved products — but ends in an **order enquiry** rather
than a retail checkout, because Genomed supplies distributors and institutional buyers.
See *Feature parity with the old WooCommerce site* below.

---

## Running it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # production build
npm start              # serve the build
npm run lint           # eslint
npm run og             # regenerate the social share image

npm run test:browser   # drive real Chrome over every route and report defects
npm run test:ux        # accessibility / UX gate (run against `next start`)
npm run shoot -- /     # full-page screenshots into .test-shots/
```

Node 20+. If port 3000 is busy: `npx next dev -p 3100`.

---

## Stack

| Choice | Why |
| --- | --- |
| **Next.js 16 (App Router) + React 19** | The reference template is Next.js; this matches it and modernises it. Every page prerenders to static HTML — 21 routes, zero server work at request time. |
| **Tailwind CSS v4** | CSS-first `@theme` config. The whole design system is tokens at the top of `app/globals.css` — no `tailwind.config.js` to hunt through. |
| **lucide-react** | Icons for UI chrome. Therapeutic-area marks are hand-drawn SVG (`components/TherapyIcon.tsx`) because generic icon sets have nothing for hepatology. |
| **No animation library** | Reveals are CSS transitions driven by one small `IntersectionObserver` wrapper. A motion library would add ~35 KB to do the same thing, and its failure mode is content stuck at `opacity: 0`. |
| **Playwright** | `npm run test:browser` drives real Chrome over every route. Dev-only. |

Measured transfer: **home 1.27 MB** (979 KB of that is the hero video), products 592 KB,
quality 480 KB. The old WordPress homepage alone pulled 5.4 MB of images and made 132
CSS/JS requests.

---

## What was taken from the reference template — and what was improved

Studied: `themixlyweb/nextjs-dental-website-template` (Bootstrap 5 + SCSS).

**Kept, as ideas:** serif display + sans body pairing; the small label with a coloured rule
above each heading; animated count-up statistics; the overlapping badge sitting on the edge
of an image tile; generous type sizes.

**Improved on:**

| Template | Here |
| --- | --- |
| Bootstrap 5 + jQuery-era plugins | Tailwind v4 tokens, no framework CSS |
| Merriweather / Lato | Fraunces / Manrope — more contrast, better numerals |
| Fixed `fs-48` / `fs-38` classes | Fluid `clamp()` scale, one token per step |
| Rounded `figure.rounded` tiles everywhere | Hard-edged square boxes on hairline grids |
| Dark navy section bands | Light throughout — no dark sections, dark type on light grounds |
| Static stock photography | Four looping background videos with poster fallbacks |
| `animate__animated` entry animations on everything | Restrained, staggered reveals that respect `prefers-reduced-motion` |
| Lorem ipsum body copy | Genomed's real portfolio, therapeutic areas and process |

---

## Design system

**The site is light throughout — light grounds, dark type.** There are no dark sections;
the deep end of each ramp is used for text, icon plates and solid buttons only.

Two hues, each with a full ramp. Neutrals are green-biased, not grey, so every surface
belongs to one family. All defined in `app/globals.css` under `@theme`.

| | Core | Role |
| --- | --- | --- |
| **Forest** | `#135a47` (`forest-700`) | The brand. `forest-950`/`990` carry body and heading type; `forest-700` fills buttons and icon plates; `forest-50` tints alternating bands. |
| **Gold** | `#d69c28` (`gold-500`) | The accent. `gold-700` for small labels and eyebrows (AA on white), `gold-500/600` for large numerals and the badge. |
| **Sand** | `sand-0` → `sand-900` | Green-tinted neutrals: `sand-0/50/100` for grounds, `sand-200/300` for hairlines, `sand-600/700` for secondary text. |

Section rhythm alternates white → `sand-50` → white → `forest-50`, separated by 1px
`sand-200` hairlines rather than shadows.

**Measured contrast** (`node scripts/contrast.mjs`, sampling real rendered pixels over the
video): headings **11–17.5:1**, eyebrow labels **6.8:1**. All AA, including where the
darkest part of a video clip shows through.

**Type** — Fraunces (display) and Manrope (text), both self-hosted by `next/font`, so no
render-blocking request to Google and no layout shift.

The scale is fluid: `--text-6xl` through `--text-eyebrow`, every step a `clamp()` so the
same token works at 360px and 1920px. `tnum` sets `lining-nums tabular-nums` — Fraunces
defaults to oldstyle figures, which drops the `4` below the baseline next to `10`.

**The square motif** — hard 90° corners throughout: the stat grid is four literal squares,
therapeutic-area tiles are `aspect-square`, product pack shots sit in square frames,
credential and contact boxes are squares on hairline grids, and the gold "8 therapeutic
areas" badge is a square breaking the edge of the video tile. Nothing on the site has a
border radius except the capsule pills in the pack shots.

**Motion** — staggered scroll reveals, count-up statistics, a marquee of therapeutic areas,
Ken Burns drift on hero video, hover lifts, a gold underline that wipes in under the active
nav item. All behind `prefers-reduced-motion`, and `.reveal` elements already on screen at
mount reveal immediately rather than waiting for a scroll that may never come.

---

## Brand assets recovered from the original site

`node scripts/fetch-brand-assets.mjs` and `node scripts/fetch-product-images.mjs` pulled
Genomed's own artwork off the old WordPress install and converted it. Run once; the output
is committed.

| Asset | Source | Here |
| --- | --- | --- |
| Wordmark | `2024/03/genomed-logo-latest.png` | `public/brand/logo.png` (+ `@2x`) |
| Favicon | the 2024 mark | `app/icon.png` |
| Hero banners | `genomed-ban-1.jpg`, `genomed-ban-2.png` | `public/hero/slide-{1,2}.webp` |
| Banner crop (powder bowls) | `genomed-ban-2.png` | `public/stats/powders.webp` |
| Hero pack cut-outs | `public/media/{rimcuff,heamclear,sugar_ok}.jpeg` (supplied) | `public/hero/packs/*.webp` — via `scripts/cutout-hero-packs.mjs` |
| Therapeutic-area photography | seven category images | `public/areas/*.webp` |
| Pack shots | ten product featured images | `public/products/*.webp` |

**The wordmark original is only 200×100.** It is served at 112px wide with a 2× asset
behind it, which holds up on screen but leaves no headroom — ask the client for the vector
before any print use. General Wellness had no category photograph on the old site, so it
uses the herb still-life we already ship.

### Header — three rows, one job each

1. **Utility** — location, hours, phone, email.
2. **Navigate** (green) — "Shop by category" opens an in-flow mega panel with all eight
   therapeutic areas; site nav alongside; orders line on the right.
3. **Primary** (white) — logo, search, saved, enquiry list with running total, and the CTA.

Rows 2 and 3 pin together on scroll, and row 2 collapses once you scroll so the commerce
essentials stay reachable without permanent chrome. The category panel renders **in flow**
rather than absolutely — with the nav row above the logo row, a dropdown would land on top
of the logo and search.

### Hero — the record sheet

Static, single, and about the **manufacturer** — not a shop window for one SKU. It replaced
a three-slide product carousel, which had two problems no amount of styling fixed:

- A visitor landed on a 100 ml bottle and learned nothing about the company behind it. The
  breadth (eight therapeutic areas, ten formulations) and the licence — the two things that
  actually decide whether a distributor calls — were both below the fold.
- Each slide's headline wrapped to a different number of lines, so the hero was **884px on
  slide 1 and 793px on slide 2**. Every seven seconds the entire page below it jumped 91px.

Four devices carry the replacement:

| Device | What it does |
| --- | --- |
| `.hero-sheet` ground | An 88px rule in brand green at 5%, warmed by two off-axis blooms. Reads as laboratory record paper rather than marketing gloss, and gives the surface colour instead of going flat white. |
| `.hero-rail` | A ticked rule down the left margin — the edge of a lab notebook. Decorative, `xl` and up, `aria-hidden`. |
| `.line-mask` | The headline is typeset in four masked lines that slide up from their own baseline, staggered 60/150/240/310ms. Padded and margin-pulled, or `overflow: hidden` clips every Fraunces descender. |
| Bento + offset frame | 3:4 footage beside two exactly square data tiles, on a 5-column grid; a gold frame sits 20px proud behind it. The only depth in an otherwise flat, square system. |

The trust band (licence, QC, traceability, despatch) is **inside** the hero section, not a
separate strip below it. On a pharmaceutical site the licence is the highest-value thing on
the page and it belongs above the fold.

`Hero.tsx` is a **server component** — the reveal is pure CSS, so nothing hydrates before
the largest text on the site paints. `prefers-reduced-motion` neutralises it globally.

Measured: no horizontal overflow and no headline word-break at 1440 / 834 / 390; the
headline never hyphenates because each masked line is a whole phrase.

---

## Video

Four clips from **Pexels** (free to use, no attribution required), downloaded and
re-encoded locally rather than hotlinked:

| File | Used on | Size |
| --- | --- | --- |
| `hero-herbs.mp4` | Home hero, About vision, Partner | 979 KB |
| `mortar-stillife.mp4` | Home "who we are", CTA band | 481 KB |
| `lab-quality.mp4` | Quality hero, Home quality, Contact | 337 KB |
| `qc-detail.mp4` | Products hero, product pages, 404 | 413 KB |

Re-encoded at 1280×720, CRF 31, audio stripped, `+faststart`. **2.2 MB for all four**,
down from 12 MB of source.

Because the design is light, each clip sits under a near-opaque light wash
(`video-scrim` / `video-scrim-soft` in `globals.css`) so the footage reads as a faint
texture behind dark type rather than as a dark photograph. The wash is heaviest where copy
sits and eases off where it does not, so the video stays visible without costing contrast.
The one exception is the square tile in "Who we are", which is a picture rather than a text
bed and runs at full strength.

`components/VideoBackdrop.tsx` enforces what cheap video heroes get wrong:

- `prefers-reduced-motion` gets the poster frame, never a moving picture.
- **Save-Data or a 2G connection gets the poster frame** — this audience is often on a rural
  mobile connection.
- Video only loads within 240px of the viewport (`preload="none"`).
- The poster is always painted underneath, so a refused autoplay degrades to a still image
  rather than a black box.

To swap a clip: drop the `.mp4` and a poster `.jpg` into `public/media/` and update `media`
in `lib/site.ts`.

---

## Feature parity with the old WooCommerce site

Audited against a full-page capture of the old storefront. What it had, and where it landed:

| Old site | Here |
| --- | --- |
| Product search with category scope | **Search dialog** — `Ctrl/⌘+K` or `/`, ranked over products, therapeutic areas and pages, full keyboard navigation. Plus a keyword field on `/products` that combines with the area and form filters. |
| Cart with item count and running total | **Enquiry list** — header badge with count and total, `/cart` with quantity steppers, per-line and list totals, persisted to `localStorage` and synced across tabs. |
| Add to cart on every card | Add button on each card, and a quantity stepper on the product page. |
| Wishlist with counter | **Saved** — heart toggle on every card, `/saved` page, "add all to enquiry list". |
| Compare with counter | **Dropped.** Comparison earns its place across dozens of SKUs; across ten it is a button nobody presses. |
| Category bar across the header | **Products mega-menu** — all eight therapeutic areas with icons and live counts. |
| Sale badges and struck-through MRP | Both, from the real figures on the old storefront (`listPrice` in `products.ts`). |
| Product photography | **Recovered.** `scripts/fetch-product-images.mjs` pulled the real pack shots off the old site; they are WebP under `public/products/`. The drawn `PackShot` is now only a fallback. |
| My Account / Track Order | **Not built** — both need a backend and an order system. The old site's "Track Order" link was a dead `#` anyway. |

### On "add to cart" without a checkout

There is no payment gateway, and a static site cannot take a card payment on its own. The
cart therefore ends in an **order enquiry**: the itemised list, quantities and indicative
MRP total are prefilled into the enquiry form and sent through the same pipeline as every
other lead.

That is also the right shape for this business — Genomed supplies distributors,
stockists and institutional buyers, who expect trade pricing and minimum order quantities
rather than a retail checkout. If direct selling is wanted later, the cart state, line
totals and product data are already in place; what is missing is a payment provider
(Razorpay for India), an order store and a GST invoice flow.

---

## Structure

```
/                      Home
/about                 Company, vision & mission, values, therapeutic areas
/quality               Quality vision, QMS, five practices, eight manufacturing stages
/products              Portfolio, filterable by therapeutic area and dosage form
/products/<slug>       10 individual product pages (statically generated)
/partner               Distributor / institutional / contract manufacturing + enquiry form
/contact               Contact squares, map, short enquiry form
/cart                  Enquiry list — quantities, totals, order enquiry
/saved                 Saved formulations
/privacy  /terms       Legal pages (the old site linked these but never had them)
```

Navigation is five items. Product filtering is client-side with no page reload, and the
state is written to the URL — `/products?area=liver-care` — so links from the home page and
footer land pre-filtered.

Content lives in two files: **`lib/site.ts`** (company details, nav, stats, credentials,
media) and **`lib/products.ts`** (therapeutic areas and products). Adding a product to the
array generates its page, card, filters and sitemap entry automatically.

---

## ⚠️ Before this goes live

Search for `NEEDS-CONFIRMATION` in `lib/site.ts`.

### 1. Product compositions are deliberately blank

`composition` and `dosage` are empty for all ten products, so product pages say the full
composition is issued as approved literature on request.

**This was intentional — do not fill these in from guesswork.** Publishing an invented
composition or dosage for a medicine is a real safety and regulatory problem. Populate them
only from the approved product label.

### 2. Licence and certificate numbers

Every entry in `credentials` has `verified: false` and an empty `reference`, so nothing
asserts a certificate the company cannot evidence. Supply the Ayurvedic manufacturing
licence number and any GMP certificate reference, then set `verified: true`.

### 3. Product categories

The old site filed a diabetes liquid, a liver syrup and a haemostatic under "Hepatitis B and
C", and a distillate under "Accessories". **Corrected here.** Two still need a decision:

- **Stoclean-SF Syrup** — old site said diabetic; the name suggests gastro. Currently
  Metabolic Care.
- **ARQ-15** — currently General Wellness. Confirm the intended indication.

### 4. Enquiry form destination

`formEndpoint` in `lib/site.ts` is empty, so the form opens the visitor's mail client
pre-filled. That works with no backend, but only delivers if the sender presses send.

For a real inbox, create a free endpoint at [web3forms.com](https://web3forms.com) or
[formspree.io](https://formspree.io) and paste the URL in. Nothing else changes.

Also consider moving off `@gmail.com` to `@genomedpharmaceuticals.com`.

### 5. Social links

`social` is an empty array. The old site pointed Instagram at Pinterest and Facebook at a
**personal** profile. Add verified company pages, or leave it empty — the footer omits the
row rather than showing a wrong link.

### 6. Map location

Pinned to `Dhakauli, Bulandshahr` — the village, not the gate. Replace `mapQuery` with
coordinates (`"28.4069,77.8498"`) once surveyed.

### 7. Product photography

Pack shots are **generated** — `components/PackShot.tsx` draws the correct container per
dosage form in brand colours. They look deliberate, but real photographs are better. Save to
`public/products/<slug>.jpg`, add a `photo` field to the product, and pass it through. Shoot
on white, square crop, WebP or JPEG around 1000px — **not** 400 KB PNGs like the old site.

### 8. Hero footage is stock

The hero clip is Pexels footage of a generic laboratory. Its caption is worded as a claim
about the company ("Every batch, release-tested") and **not** as a label on the picture —
it deliberately does not say "our plant", because it isn't. Replace it with real Bulandshahr
facility footage before launch and the caption can then name the place.

### 9. Rimcuff-SF is filed under the wrong therapy

`lib/products.ts` files **Rimcuff-SF Syrup** as `liver-care`, descriptor "Liver protective &
regenerative syrup", positioning "a sugar-free **hepatoprotective** syrup". The pack artwork
reads **"Mucus & Phlegm · Chest Congestion · Cough Control"**, and the brand name is a cough
name. One of the two is wrong.

This has **not** been changed here — reclassifying a medicine without its approved label is
exactly the kind of invention this build avoids. Confirm against the label and correct the
record; note there is currently no respiratory therapy area, so one may need adding.

Separately, the artwork reads **"Rimucuff-SF"** while the product data says
**"Rimcuff-SF"**. Confirm the registered spelling.

### 10. Set the domain

`site.url` in `lib/site.ts` drives canonical URLs, Open Graph tags, sitemap and robots.

---

## Migration from the old WordPress site

### Redirect (301)

| Old | New |
| --- | --- |
| `/product/decoliv-ds-syrup-200ml/` | `/products/decoliv-ds-syrup` |
| `/product/rimcuff-sf-syrup-100ml/` | `/products/rimcuff-sf-syrup` |
| `/product/sugar-ok-liquid-500-ml-genomed-pharmaceuticals/` | `/products/sugar-ok-liquid` |
| `/product/stoclean-sf-syrup/` | `/products/stoclean-sf-syrup` |
| `/product/kcr-powder-100gm/` | `/products/kcr-powder` |
| `/product/cistover-liquied-syrup/` | `/products/cistover-liquid` |
| `/product/quickly-stop-bleedingqsb-500mg-capsules/` | `/products/qsb-capsules` |
| `/product/heamclear-sf-syrup/` | `/products/heamclear-sf-syrup` |
| `/product/stroperm-powdwer-100gm/` | `/products/stroperm-powder` |
| `/product/arq-15-arq-450-ml/` | `/products/arq-15` |
| `/product-category/liver-problems/` | `/products?area=liver-care` |
| `/product-category/heppatitis-b-and-c/` | `/products` |
| `/about-us-3/` | `/about` |
| `/contact-us/` | `/contact` |
| `/shop/` | `/products` |

### Delete, do not redirect

The old site had four injected casino spam posts, a WordPress sample page, eleven
lorem-ipsum portfolio pages and five furniture demo categories. **Return 410 Gone** — a 301
passes the spam association to the new site. Also submit removal requests in Google Search
Console for the four `/2026/02/16/*-casino-*` URLs.

### Spelling corrected

"Heppatitis" → Hepatology (it was in the old URL, so that page could never rank).
Also "Genomaed" → Genomed, "All Rights Rserved", "TOP SALLERS", "Liquied" → Liquid,
"Powdwer" → Powder, "Manufactures" → Manufacturers.

---

## Testing

`npm run test:browser` launches real Chrome and, for every route, checks: HTTP status,
console errors, uncaught exceptions, failed requests, exactly one `<h1>`, a non-empty title
and meta description, and no horizontal overflow at 1440px **and** 390px. It then exercises
the product filter, the `?area=` deep link, form validation, and the mobile drawer.
Screenshots land in `.test-shots/`.

Current state: **12 routes, 0 problems**, against both the dev server and the production build.

### UX / accessibility gate

`node scripts/ux-audit.mjs [baseUrl]` audits against the ui-ux-pro-max priority rules:
contrast, accessible names, heading order, form labels, skip link, focus visibility, 24px
tap targets and 8px spacing at 375px, `cursor: pointer`, intrinsic media sizing, horizontal
overflow at 375/768/1024/1440, transition durations, and `prefers-reduced-motion`.

Contrast is measured from **real pixels**, not computed styles: it blanks every glyph,
screenshots the page, and reads the painted colour under each text run. Compositing
backgrounds from CSS gives wrong answers once `backdrop-blur` and translucent panels are
involved — the first version of this script invented backgrounds that were not on the page.
Two details matter: transitions must be disabled alongside the glyphs (the site animates
`color`, so the shot otherwise catches text mid-fade and reports a background ~10% too
dark), and the audit should run against `next start`, not `next dev`, whose on-demand
compilation can be caught mid-flight.

Run it against the production build:

```bash
npm run build && npx next start -p 3210
node scripts/ux-audit.mjs http://localhost:3210
```

Current state: **7 routes, 0 issues.**

`node scripts/contrast.mjs` is the narrower companion that reports exact ratios for hero
headings over video.

---

## E-Commerce & Order Pipeline

The site provides an authoritative, self-hosted checkout and fulfillment system built directly into the Next.js App Router with zero native C++ / Rust binary dependencies (portable across Linux VPS and standard cPanel environments).

### Customer Flow

1. **Shopping Bag (`/cart`)**: Real-time free delivery calculation (₹499 threshold), quantity stepper, save-for-later, and direct link to checkout.
2. **Secure Checkout (`/checkout`)**:
   - **Phone OTP Verification**: Ensures genuine phone contact before an order is placed.
   - **Shipping Destination**: Delivery street, city, state, and 6-digit PIN code.
   - **Payment Selection**: Online payment via Razorpay (UPI, Cards, Netbanking) or Cash on Delivery (COD).
3. **Live Order Status (`/order/[id]`)**:
   - Real-time milestone tracker: *Confirmed* → *Processing (Dhakauli Plant)* → *Dispatched (Delhivery)* → *Delivered*.
   - Live Delhivery AWB consignment tracking button.
   - Print-ready order receipt and pre-filled WhatsApp customer support.

---

## Admin Backoffice (`/admin`)

Full backoffice operations dashboard protected by HttpOnly JWT session cookies:

1. **Orders & Consignments Tab**:
   - Live metrics summary: Total Orders, Pending Packing, In Transit, and Total Volume.
   - Status filters (*All*, *Pending*, *Confirmed*, *Processing*, *Dispatched*, *Delivered*, *Cancelled*).
   - Real-time search across order numbers, customer names, phones, and AWB numbers.
   - Delhivery AWB assignment (automatically sets consignment tracking URL, updates status to *Dispatched*, and sends branded email notification).
2. **Inventory & Live Stock Tab**:
   - Real-time SKU stock level manager for all 10 Ayurvedic formulations.
   - Low stock warnings (< 20 units) and one-click updates.
3. **Customer Directory Tab**:
   - Verified customer phone directory with total order counts and lifetime spend.
4. **Courier Batch CSV Export**:
   - One-click download of Delhivery & Shiprocket compatible CSV files for batch label generation.

---

## Credentials & Environment Configuration

All credentials and sensitive keys are managed via `.env.local` (never committed to git):

| Service | Environment Variable | Default / Dev Setting | Description |
|---|---|---|---|
| **Admin Login Email** | `ADMIN_EMAIL` | `admin@genomedpharmaceuticals.com` | Backoffice administrator email |
| **Admin Password** | `ADMIN_INITIAL_PASSWORD` | `Genomed@Admin2026` | Default administrator password |
| **JWT Encryption** | `JWT_SECRET` | *(32-char min string)* | Signs session cookies and OTP phone tokens |
| **Phone OTP (Dev)** | `SMS_PROVIDER` | `mock` | In dev mode, test code `123456` or console OTP is accepted |
| **Razorpay Key ID** | `RAZORPAY_KEY_ID` | `rzp_test_your_key_id` | Gateway key for prepaid UPI / card orders |
| **Razorpay Secret** | `RAZORPAY_KEY_SECRET` | `your_key_secret` | HMAC SHA-256 signature verification |
| **Free Delivery** | `FREE_SHIPPING_THRESHOLD`| `499` | Free shipping threshold in ₹ (below is ₹50) |
| **Database** | `DB_HOST`, `DB_NAME` | `localhost`, `genomed_db` | MySQL connection credentials |

---

## Security Hardening (100% Secure Defenses)

1. **Server-Side Pricing Authority**: Client-side prices from `localStorage` or browser requests are strictly ignored. Line totals, delivery fees, and order amounts are recomputed server-side directly from the catalog.
2. **XSS & HTML Injection Prevention**: All user-supplied inputs (customer name, delivery lines, city, notes) are sanitized and HTML-escaped using `escapeHtml()` prior to interpolation into email receipts and order templates.
3. **Timing-Safe Cryptographic Signatures**: Razorpay HMAC SHA-256 payment signatures are validated using `crypto.timingSafeEqual` to eliminate timing side-channel attacks.
4. **Brute-Force & Rate-Limiting Protection**:
   - **Phone OTP**: Minimum 30-second cooldown between requests; max 5 requests per hour. After 5 failed verification attempts, the code is locked for 15 minutes.
   - **Admin Login**: Progressive lockout after 5 consecutive failed attempts locks the account for 15 minutes.
5. **Replay-Proof Single-Use Tokens**: Verified phone tokens (`jti`) are consumed upon order placement, preventing replay attacks.
6. **Strict HTTPS URL Validation**: Delhivery consignment tracking URLs are validated to strictly require `https://`, preventing open redirects or `javascript:` URI exploits.
7. **HttpOnly Cookie Architecture**: Admin session tokens reside exclusively in `HttpOnly`, `SameSite=Lax`, `Secure` cookies inaccessible to client JavaScript.
8. **Input Bounds & Quantity Clamping**: Order item quantities are strictly validated as positive integers clamped between 1 and 500 units to prevent integer overflow or NaN logic flaws.

---

## Endpoint Integration & Security Test Suite

The entire e-commerce and administrative pipeline is continuously covered by an automated integration test suite (`scripts/test-all-endpoints.mjs`).

```bash
# Run the complete test suite
npx tsx scripts/test-all-endpoints.mjs
```

### Audit Results: 27/27 Tests Passed (100% Operational)

| Module | Route / Component | Checks & Test Assertions | Result |
|---|---|---|---|
| **1. OTP Dispatch** | `POST /api/auth/otp/send` | Rejects malformed numbers (400), dispatches OTP (200), enforces 30s cooldown defense | **3/3 PASS** |
| **2. OTP Verification** | `POST /api/auth/otp/verify` | Rejects invalid OTP (400), issues signed single-use JWT `phoneToken` (200) | **2/2 PASS** |
| **3. Checkout** | `POST /api/checkout` | Blocks unauthenticated orders (401), creates order with server pricing (200), blocks replay of consumed tokens (401) | **3/3 PASS** |
| **4. Order Tracking** | `GET /api/orders/[id]` | Returns 404 for non-existent orders, retrieves live order details and items (200) | **2/2 PASS** |
| **5. Razorpay Payments**| `POST /api/payments/razorpay/verify`| Rejects missing payload (400), verifies HMAC SHA-256 signature and updates order to `paid` (200) | **2/2 PASS** |
| **6. Admin Login** | `POST /api/admin/login` | Rejects invalid credentials (401), authenticates and sets HttpOnly session cookie (200) | **2/2 PASS** |
| **7. Orders Management**| `GET /api/admin/orders` | Rejects unauthenticated callers (401), returns orders list for admin (200) | **2/2 PASS** |
| **8. Stock Inventory** | `GET /api/admin/stock` | Rejects unauthenticated callers (401), returns SKU levels (200) | **2/2 PASS** |
| **9. Stock Update** | `PATCH /api/admin/stock` | Updates stock quantity for SKU with real-time persistence (200) | **1/1 PASS** |
| **10. Customer Directory**| `GET /api/admin/customers` | Rejects unauthenticated callers (401), returns customer directory with spend metrics (200) | **2/2 PASS** |
| **11. Courier CSV Export**| `GET /api/admin/export/orders.csv`| Rejects unauthenticated callers (401), generates formatted courier CSV (200) | **2/2 PASS** |
| **12. Order Fulfillment**| `PATCH /api/admin/orders/[id]` | Rejects unauthenticated callers (401), updates status, sets Delhivery AWB, sends email (200) | **2/2 PASS** |
| **13. Admin Profile** | `GET /api/admin/me` | Returns administrator identity for active session (200) | **1/1 PASS** |
| **14. Admin Logout** | `POST /api/admin/logout` | Invalidates session cookie with `Max-Age=0` (200) | **1/1 PASS** |

### Automated Layout & Responsive Verification

- `npm run test:responsive`: Sweeps 10 routes across 5 viewports (320px, 390px, 768px, 1024px, 1440px) in headless Chrome with zero horizontal overflow (**50/50 checks passed**).
- `npm run test:e2e`: Executes live end-to-end user purchase journey (Cart → Checkout → OTP Verification → COD Order Placement → Order Receipt → Admin Backoffice) with high-res screenshots recorded in `.test-shots/live-e2e/`.

> For comprehensive threat models, secrets architecture, and regulatory considerations, see the detailed report in [`website-context/06-SECURITY-AND-ENDPOINT-AUDIT-REPORT.md`](file:///d:/Acer%20Jan%202025/Azeem/Genomed/genomed-react/website-context/06-SECURITY-AND-ENDPOINT-AUDIT-REPORT.md).



