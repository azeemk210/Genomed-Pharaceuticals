/**
 * Product portfolio.
 *
 * Brand names, pack sizes and MRPs are carried over from the previous
 * genomedpharmaceuticals.com. Therapeutic areas have been CORRECTED — the old
 * site filed a diabetes liquid, a liver syrup and a haemostatic capsule under
 * "Hepatitis B and C", and a distillate under "Accessories".
 *
 * `composition` and `dosage` are intentionally empty where the company has not
 * published them. Product pages then invite an enquiry for the full literature
 * rather than printing an invented formula. Fill these in only from the
 * approved product label. See README.md.
 */

export type Therapy = {
  slug: string;
  name: string;
  subtitle: string;
  /** One sentence used on cards and as the area's meta description. */
  summary: string;
  /** Longer copy shown at the head of the filtered list. */
  body: string;
  icon: IconKey;
  /** Real category photograph recovered from the previous site. */
  image: string;
};

export type IconKey =
  | 'liver'
  | 'metabolic'
  | 'renal'
  | 'womens'
  | 'derma'
  | 'haem'
  | 'vitality'
  | 'tonic';

export type Product = {
  slug: string;
  name: string;
  /** Displayed under the name — the company's own product descriptor. */
  descriptor: string;
  therapy: string;
  form: 'Syrup' | 'Liquid' | 'Powder' | 'Capsule';
  pack: string;
  mrp: number;
  /** Company-stated use. Kept close to the wording on their own material. */
  positioning: string;
  indications: string[];
  composition: string[];
  dosage: string;
  /** Shown on the product page as cautionary standard text. */
  storage: string;
  featured?: boolean;
  /** Real pack photograph under /public/products. */
  photo?: string;
  /** Pre-discount MRP, when the product is on offer. Struck through in the UI. */
  listPrice?: number;
  /** Merchandising flag shown as a corner badge. */
  badge?: "HOT" | "NEW";
};

export const therapies: Therapy[] = [
  {
    slug: 'liver-care',
    image: '/areas/liver-care.webp',
    name: 'Liver Care',
    subtitle: 'Hepatology',
    summary:
      'Hepatoprotective and regenerative syrups formulated to support liver function and recovery.',
    body: 'Genomed’s largest therapeutic segment. Both liver formulations are positioned as protective and regenerative syrups, supplied in pack sizes suited to a full course of treatment.',
    icon: 'liver',
  },
  {
    slug: 'metabolic-care',
    image: '/areas/metabolic-care.webp',
    name: 'Metabolic Care',
    subtitle: 'Diabetology',
    summary:
      'Herbal liquids and syrups supporting blood-sugar management and metabolic balance.',
    body: 'Formulations intended to sit alongside dietary and lifestyle management in patients under a physician’s care for raised blood sugar.',
    icon: 'metabolic',
  },
  {
    slug: 'renal-care',
    image: '/areas/renal-care.webp',
    name: 'Renal Care',
    subtitle: 'Nephrology',
    summary: 'Powder formulations supporting kidney function and urinary comfort.',
    body: 'A powdered presentation intended for reconstitution, supporting renal function and urinary tract comfort.',
    icon: 'renal',
  },
  {
    slug: 'womens-health',
    image: '/areas/womens-health.webp',
    name: "Women's Health",
    subtitle: 'Gynaecology',
    summary: 'Formulations addressing cystic and related gynaecological complaints.',
    body: 'Genomed’s gynaecological line addresses cystic complaints, supplied as an oral liquid for extended courses.',
    icon: 'womens',
  },
  {
    slug: 'skin-care',
    image: '/areas/skin-care.webp',
    name: 'Skin & Blood Purification',
    subtitle: 'Dermatology',
    summary:
      'Sugar-free syrups working on skin complaints through blood purification.',
    body: 'The dermatology line follows the classical herbal approach of treating skin presentations through blood purification rather than topically alone.',
    icon: 'derma',
  },
  {
    slug: 'haemostatics',
    image: '/areas/haemostatics.webp',
    name: 'Haemostatics',
    subtitle: 'Haematology',
    summary: 'Capsule formulation indicated for the control of bleeding.',
    body: 'A capsule presentation for the control of bleeding, supplied in a strength suited to acute use.',
    icon: 'haem',
  },
  {
    slug: 'mens-wellness',
    image: '/areas/mens-wellness.webp',
    name: "Men's Wellness",
    subtitle: 'Vitality',
    summary: 'Powder formulation supporting male reproductive health and stamina.',
    body: 'Genomed’s men’s wellness presentation is a powder intended for daily use over a sustained course.',
    icon: 'vitality',
  },
  {
    slug: 'general-wellness',
    image: '/areas/general-wellness.webp',
    name: 'General Wellness',
    subtitle: 'Tonics & Distillates',
    summary: 'Classical herbal distillates and general tonics in large packs.',
    body: 'Classical preparations supplied in larger pack sizes for general and supportive use.',
    icon: 'tonic',
  },
];

export const products: Product[] = [
  {
    slug: 'decoliv-ds-syrup',
    photo: '/products/decoliv-ds-syrup.webp',
    listPrice: 172,
    name: 'Decoliv-DS Syrup',
    descriptor: 'Liver protective & regenerative syrup',
    therapy: 'liver-care',
    form: 'Syrup',
    pack: '200 ml bottle',
    mrp: 138,
    positioning:
      'A double-strength hepatoprotective syrup formulated to support liver function and assist the organ’s natural regenerative capacity.',
    indications: [
      'Supportive care in compromised liver function',
      'Recovery following hepatic stress',
      'Adjunct to physician-directed liver management',
    ],
    composition: [],
    dosage: '',
    storage:
      'Store below 30 °C in a dry place, protected from direct sunlight. Keep out of reach of children. Shake well before use.',
    featured: true,
  },
  {
    slug: 'rimcuff-sf-syrup',
    photo: '/products/rimcuff-sf-syrup.webp',
    listPrice: 81,
    name: 'Rimcuff-SF Syrup',
    descriptor: 'Liver protective & regenerative syrup, sugar free',
    therapy: 'liver-care',
    form: 'Syrup',
    pack: '100 ml bottle',
    mrp: 65,
    positioning:
      'A sugar-free hepatoprotective syrup in a 100 ml pack, suitable where sugar intake is being controlled alongside liver support.',
    indications: [
      'Supportive liver care where sugar intake is restricted',
      'Shorter treatment courses and trial prescriptions',
    ],
    composition: [],
    dosage: '',
    storage:
      'Store below 30 °C in a dry place, protected from direct sunlight. Keep out of reach of children. Shake well before use.',
    featured: true,
  },
  {
    slug: 'sugar-ok-liquid',
    photo: '/products/sugar-ok-liquid.webp',
    badge: 'NEW',
    name: 'Sugar OK Liquid',
    descriptor: 'Metabolic support liquid',
    therapy: 'metabolic-care',
    form: 'Liquid',
    pack: '500 ml bottle',
    mrp: 238,
    positioning:
      'A herbal oral liquid supplied in a 500 ml pack, intended to support blood-sugar management as part of physician-directed care.',
    indications: [
      'Supportive care in raised blood sugar',
      'Long-course metabolic support',
    ],
    composition: [],
    dosage: '',
    storage:
      'Store below 30 °C in a dry place, protected from direct sunlight. Keep out of reach of children. Shake well before use.',
    featured: true,
  },
  {
    slug: 'stoclean-sf-syrup',
    photo: '/products/stoclean-sf-syrup.webp',
    name: 'Stoclean-SF Syrup',
    descriptor: 'Sugar-free metabolic syrup',
    therapy: 'metabolic-care',
    form: 'Syrup',
    pack: '200 ml bottle',
    mrp: 160,
    positioning:
      'A sugar-free syrup in the metabolic range, formulated for patients managing blood sugar under medical supervision.',
    indications: ['Supportive metabolic care', 'Sugar-restricted regimens'],
    composition: [],
    dosage: '',
    storage:
      'Store below 30 °C in a dry place, protected from direct sunlight. Keep out of reach of children. Shake well before use.',
  },
  {
    slug: 'kcr-powder',
    photo: '/products/kcr-powder.webp',
    name: 'KCR Powder',
    descriptor: 'Renal support powder',
    therapy: 'renal-care',
    form: 'Powder',
    pack: '100 g container',
    mrp: 190,
    positioning:
      'A powdered herbal preparation for reconstitution, formulated to support kidney function and urinary tract comfort.',
    indications: [
      'Supportive renal care',
      'Urinary tract comfort',
      'Adjunct to physician-directed kidney management',
    ],
    composition: [],
    dosage: '',
    storage:
      'Store below 30 °C in a dry place, protected from direct sunlight. Close the container tightly after use. Keep out of reach of children.',
    featured: true,
  },
  {
    slug: 'cistover-liquid',
    photo: '/products/cistover-liquid.webp',
    listPrice: 288,
    name: 'Cistover Liquid',
    descriptor: 'Gynaecological oral liquid',
    therapy: 'womens-health',
    form: 'Liquid',
    pack: '500 ml bottle',
    mrp: 260,
    positioning:
      'Genomed’s gynaecological formulation, positioned by the company for the management of cystic complaints, supplied in a 500 ml course pack.',
    indications: [
      'Supportive management of cystic complaints',
      'Extended-course gynaecological care',
    ],
    composition: [],
    dosage: '',
    storage:
      'Store below 30 °C in a dry place, protected from direct sunlight. Keep out of reach of children. Shake well before use.',
    featured: true,
  },
  {
    slug: 'qsb-capsules',
    photo: '/products/qsb-capsules.webp',
    listPrice: 76,
    name: 'Quickly Stop Bleeding (QSB)',
    descriptor: 'Haemostatic capsules, 500 mg',
    therapy: 'haemostatics',
    form: 'Capsule',
    pack: '500 mg capsules',
    mrp: 65,
    positioning:
      'A 500 mg capsule presentation indicated by the company for the control of bleeding.',
    indications: ['Supportive control of bleeding'],
    composition: [],
    dosage: '',
    storage:
      'Store below 30 °C in a dry place, protected from direct sunlight. Keep out of reach of children.',
  },
  {
    slug: 'heamclear-sf-syrup',
    photo: '/products/heamclear-sf-syrup.webp',
    name: 'Heamclear-SF Syrup',
    descriptor: 'Sugar-free blood purification syrup',
    therapy: 'skin-care',
    form: 'Syrup',
    pack: '200 ml bottle',
    mrp: 166,
    positioning:
      'A sugar-free syrup working on dermatological presentations through blood purification, following the classical herbal approach to skin complaints.',
    indications: [
      'Supportive care in skin complaints',
      'Blood purification regimens',
      'Sugar-restricted patients',
    ],
    composition: [],
    dosage: '',
    storage:
      'Store below 30 °C in a dry place, protected from direct sunlight. Keep out of reach of children. Shake well before use.',
  },
  {
    slug: 'stroperm-powder',
    photo: '/products/stroperm-powder.webp',
    listPrice: 473,
    name: 'Stroperm Powder',
    descriptor: "Men's wellness powder",
    therapy: 'mens-wellness',
    form: 'Powder',
    pack: '100 g container',
    mrp: 450,
    positioning:
      'Genomed’s men’s wellness preparation, positioned by the company to support sperm count and stamina over a sustained course.',
    indications: ['Supportive male reproductive health', 'Stamina and vitality support'],
    composition: [],
    dosage: '',
    storage:
      'Store below 30 °C in a dry place, protected from direct sunlight. Close the container tightly after use. Keep out of reach of children.',
  },
  {
    slug: 'arq-15',
    photo: '/products/arq-15.webp',
    badge: 'HOT',
    name: 'ARQ-15',
    descriptor: 'Classical herbal distillate',
    therapy: 'general-wellness',
    form: 'Liquid',
    pack: '450 ml bottle',
    mrp: 171,
    positioning:
      'A classical arq — a herbal distillate — supplied in a 450 ml pack for general and supportive use.',
    indications: ['General and supportive wellness use'],
    composition: [],
    dosage: '',
    storage:
      'Store below 30 °C in a dry place, protected from direct sunlight. Keep out of reach of children. Shake well before use.',
  },
];

/* ---------- helpers ---------- */

export const getTherapy = (slug: string) => therapies.find((t) => t.slug === slug);

export const productsByTherapy = (slug: string) =>
  products.filter((p) => p.therapy === slug);

export const featuredProducts = () => products.filter((p) => p.featured);

export const therapyCounts = () =>
  therapies.map((t) => ({ ...t, count: productsByTherapy(t.slug).length }));

export const dosageForms = () =>
  [...new Set(products.map((p) => p.form))].sort();

/** Percentage off, rounded, when a product carries a pre-discount MRP. */
export const discountPct = (p: Product) =>
  p.listPrice && p.listPrice > p.mrp ? Math.round((1 - p.mrp / p.listPrice) * 100) : 0;

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

/** Flat text index for the site search. */
export const searchIndex = () =>
  products.map((p) => {
    const t = getTherapy(p.therapy);
    return {
      slug: p.slug,
      name: p.name,
      descriptor: p.descriptor,
      therapy: t?.name ?? "",
      haystack: [p.name, p.descriptor, p.positioning, p.form, p.pack, t?.name, t?.subtitle, ...p.indications]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    };
  });
