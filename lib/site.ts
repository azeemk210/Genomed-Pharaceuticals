/**
 * Central site configuration.
 *
 * Values marked NEEDS-CONFIRMATION come from the previous
 * genomedpharmaceuticals.com or are industry-standard placeholders. Confirm
 * each with the company before launch — see README.md.
 */

export const site = {
  name: "Genomed Pharmaceuticals",
  shortName: "Genomed",
  legalName: "Genomed Pharmaceuticals",
  tagline: "Your health, our priority",
  description:
    "Genomed Pharmaceuticals is an Ayurvedic formulation manufacturer in Bulandshahr, Uttar Pradesh, producing liver, metabolic, renal, gynaecological and dermatological medicines for distributors and healthcare partners across India.",
  url: "https://www.genomedpharmaceuticals.com",
} as const;

export const contact = {
  addressLines: [
    "Badda Madrsha, Post Malaghar",
    "Village Dhakauli, Bulandshahr",
    "Uttar Pradesh 203001, India",
  ],
  addressShort: "Bulandshahr, Uttar Pradesh",
  phoneDisplay: "+91 97604 11123",
  phoneHref: "+919760411123",
  email: "genomedpharma@gmail.com",
  hours: "Monday – Saturday, 9:30 am – 6:30 pm IST",
  // NEEDS-CONFIRMATION: replace with surveyed coordinates ("28.4069,77.8498").
  mapQuery: "Dhakauli, Bulandshahr, Uttar Pradesh 203001",
} as const;

/**
 * NEEDS-CONFIRMATION — the old site linked a personal Facebook profile and
 * pointed its Instagram button at Pinterest. Add verified company pages here,
 * or leave empty and the footer omits the row entirely.
 */
export const social: { label: string; href: string }[] = [];

export const nav = [
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Quality", href: "/quality" },
  { label: "Partner With Us", href: "/partner" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * Where the enquiry form posts. Empty = the form opens a pre-filled email
 * instead, which needs no backend. For a real inbox create a free endpoint at
 * web3forms.com or formspree.io and paste the URL here.
 */
export const formEndpoint = "";

/**
 * Each figure carries a backdrop of the thing it actually counts: compounding
 * behind the formulation count, the QC bench behind the therapeutic areas, raw
 * Ayurvedic powders behind the composition figure, and preparation glassware
 * behind the dosage forms. `StatGrid` washes them back hard so the numbers keep
 * their contrast.
 *
 * Two things were tried here and dropped. The stock therapy renders in
 * `public/areas` are clinical stock with red organs, pink diagrams and blue
 * gloves, and a palette built from exactly two hues cannot absorb a third and a
 * fourth. A pack shot was worse: packaging is covered in its own typography, so
 * any crop of it puts readable brand text behind a figure and the card ends up
 * arguing with itself. `/stats/powders.webp` is a crop of the old site's banner
 * artwork — warm, botanical, and carrying no type.
 */
export const stats = [
  {
    value: 10,
    suffix: "",
    label: "Formulations in production",
    image: "/media/mortar-stillife-poster.jpg",
  },
  {
    value: 8,
    suffix: "",
    label: "Therapeutic areas served",
    // Not hero-herbs: the hero band runs that same clip a few hundred pixels
    // up the page, and the repeat reads as a mistake.
    image: "/media/lab-quality-poster.jpg",
  },
  { value: 100, suffix: "%", label: "Ayurvedic compositions", image: "/stats/powders.webp" },
  {
    value: 4,
    suffix: "",
    label: "Dosage forms manufactured",
    image: "/media/qc-detail-poster.jpg",
  },
] as const;

/**
 * NEEDS-CONFIRMATION — supply licence and certificate numbers, then set
 * `verified: true`. Unverified entries render without a number rather than
 * asserting a credential the company cannot evidence.
 */
export const credentials = [
  {
    title: "Ayurvedic Drug Manufacturing Licence",
    body: "Manufactured under licence issued by the Ayurvedic & Unani Services, Government of Uttar Pradesh, under the Drugs and Cosmetics Act, 1940.",
    reference: "",
    verified: false,
  },
  {
    title: "Schedule T — Good Manufacturing Practice",
    body: "Facility, equipment and process controls maintained to the Good Manufacturing Practice requirements of Schedule T of the Drugs and Cosmetics Rules, 1945.",
    reference: "",
    verified: false,
  },
  {
    title: "In-house Quality Control Laboratory",
    body: "Raw-material identification, in-process checks and finished-product release testing carried out before any batch leaves the premises.",
    reference: "",
    verified: false,
  },
  {
    title: "Batch Traceability",
    body: "Every pack carries a batch number, manufacturing date and expiry traceable to its raw-material records and release documentation.",
    reference: "",
    verified: false,
  },
] as const;

export const pillars = [
  {
    title: "Purity of input",
    body: "Herbs and excipients are identified, sampled and tested on arrival. Material that fails identity or purity checks is quarantined and returned — it never reaches a batch.",
  },
  {
    title: "Process discipline",
    body: "Each formulation follows a written master formula with defined parameters. Deviations are recorded, investigated and closed before the batch is released.",
  },
  {
    title: "Evidence on every pack",
    body: "Batch number, manufacturing date and expiry are printed on every unit and tied to retained samples and release records held at the plant.",
  },
  {
    title: "Dependable supply",
    body: "Production planned against distributor forecasts so stockists are not left short of a fast-moving line at the point they need it.",
  },
] as const;

/** Video assets. All Pexels, free to use, downloaded and re-encoded locally. */
export const media = {
  heroHerbs: { src: "/media/hero-herbs.mp4", poster: "/media/hero-herbs-poster.jpg" },
  mortar: { src: "/media/mortar-stillife.mp4", poster: "/media/mortar-stillife-poster.jpg" },
  lab: { src: "/media/lab-quality.mp4", poster: "/media/lab-quality-poster.jpg" },
  qc: { src: "/media/qc-detail.mp4", poster: "/media/qc-detail-poster.jpg" },
} as const;
