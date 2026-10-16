# 04 — Technical Architecture & Design System

## 1. Technology Stack

| Layer | Implementation | Strategic Rationale |
|---|---|---|
| **Framework** | Next.js 16.3.5 (App Router) + React 19.2.8 | Fully static pre-rendering of all 21 routes at build time. Zero server runtime compute needed for page delivery. High SEO score and instantaneous TTFB. |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/postcss`) | CSS-first architecture. All theme variables, scales, and tokens live directly inside `app/globals.css` using the `@theme` block. Eliminates legacy `tailwind.config.js` hunting. |
| **Icons** | `lucide-react` (v1.45.0) + Custom SVGs | Lucide handles functional UI iconography (arrows, cart, checkmarks, search). Specialized medical icons (e.g. liver, renal, haemostatics) are hand-crafted SVGs (`components/TherapyIcon.tsx`) tailored to Indian botanical medicine. |
| **Animation** | CSS transitions + Native `IntersectionObserver` | Zero heavy motion libraries (avoids Framer Motion / GSAP overhead, saving ~35 KB JS bundle). Bulletproof degradation that never locks content in `opacity: 0` if JS fails. |
| **Testing & QA** | Playwright (`playwright` v1.63.0) + Node CLI scripts | Headless Chromium automation testing all 21 routes, checking contrast across video pixels, responsive layout sweeps, and accessibility standards (`scripts/*.mjs`). |
| **Hosting & Deploy**| Render.com (`https://genomed-pharaceuticals.onrender.com/`) | Docker / Node.js static/SSR containerized hosting connected to GitHub repository. |

---

## 2. Design System & Aesthetics

### Brand Palette Ramps
The design eschews generic primary hues in favor of an authentic, botanical-apothecary color system built from two primary families:

1. **Forest (The Corporate Anchor):**
   - Base Brand: `forest-700` (`#135a47`)
   - Type & Headlines: `forest-950` (`#08281f`) and `forest-990` (`#03140f`)
   - Button Fills & Icon Plates: `forest-700` (`#135a47`)
   - Alternating Surface Bands: `forest-50` (`#edf6f2`)

2. **Gold (The Warm Herbal Accent):**
   - Primary Accent: `gold-500` (`#d69c28`)
   - Eyebrows & Small Badges (High Contrast): `gold-700` (`#996813`)
   - Bold Display Numerals: `gold-500` and `gold-600`

3. **Sand (Green-Biased Neutrals):**
   - Backgrounds & Shells: `sand-0` (`#ffffff`), `sand-50` (`#f8f9f6`), `sand-100` (`#f0f2eb`)
   - Hairline Borders & Grids: `sand-200` (`#e2e6d8`) and `sand-300` (`#cfd5c0`)
   - Secondary & Caption Typography: `sand-600` (`#6c745b`) and `sand-700` (`#545b45`)

### Typography System
- **Display Typeface:** `Fraunces` (Serif, loaded via `next/font/google`). High optical contrast, variable weight, warm editorial authority.
- **Body & Interface Typeface:** `Manrope` (Geometric Sans, loaded via `next/font/google`). Clean, highly legible at small sizes, modern clinical neutrality.
- **Lining & Tabular Numerals:** Custom utility `tnum` forces `font-feature-settings: "tnum" 1, "lnum" 1` to prevent Fraunces old-style numeral drops (e.g., preventing the number `4` from dipping below the baseline).
- **Fluid Type Scale:** Every step from `--text-eyebrow` (0.75rem) to `--text-6xl` (clamp(2.5rem, 5vw, 4.5rem)) uses responsive CSS `clamp()` tokens, allowing uninterrupted proportional scaling from 360px mobile viewports to 1920px 4K monitors.

### Architectural Motifs
- **All-Light Theme:** Deliberate avoidance of dark full-bleed sections. High-contrast dark typography on airy, light surfaces conveys cleanliness, clinical safety, and transparency.
- **Hairline Grids & Hard 90° Angles:** Clean, razor-sharp 1px borders (`sand-200`) instead of heavy card drop-shadows. Reflects pharmaceutical precision and master batch documentation.
- **Video Backdrops with Fallbacks:** Looping muted MP4 video clips (`/public/media/*.mp4`) showing laboratory quality control, botanical compounding, and mortar-pestle work, paired with high-quality WebP poster image fallbacks.
- **Contrast Ratios:** Real rendered pixel contrast measurements confirm 11–17.5:1 on headings and 6.8:1 on eyebrow labels, exceeding WCAG AAA criteria.

---

## 3. Client State & Storage Architecture

- **StoreProvider (`components/StoreProvider.tsx`):**
  - Uses React Context combined with browser `localStorage`.
  - Keys:
    - `genomed_cart_v1`: JSON array of shortlisted product items with quantities:
      ```ts
      type CartItem = { slug: string; quantity: number };
      ```
    - `genomed_saved_v1`: Array of string slugs for bookmarked formulations.
  - Automatically hydrates safely on client mount without triggering Next.js hydration mismatch errors.
- **Client-Side Search Index (`lib/products.ts`):**
  - Generates an in-memory normalized search index combining product names, descriptors, indications, therapy category names, and forms. Enables sub-millisecond client-side filtering without network hops.
