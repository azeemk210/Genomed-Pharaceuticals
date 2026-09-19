/**
 * One-off: pull Genomed's real brand assets off the old WordPress site —
 * logo, favicon, hero banners and therapeutic-area photography — and convert
 * them to WebP/PNG under public/. Run once; the output is committed.
 *
 *   node scripts/fetch-brand-assets.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const BASE = "https://www.genomedpharmaceuticals.com/wp-content/uploads";

const get = async (path) => Buffer.from(await (await fetch(`${BASE}/${path}`)).arrayBuffer());

await mkdir("public/brand", { recursive: true });
await mkdir("public/hero", { recursive: true });
await mkdir("public/areas", { recursive: true });

/* ---------- logo + favicon ---------- */
{
  const logo = await get("2024/03/genomed-logo-latest.png");
  // Kept lossless: it is a flat wordmark on transparency, where WebP lossy
  // would fringe the type. NOTE: the original is only 200×100 — ask the client
  // for vector or a larger export before print or retina use.
  await sharp(logo).png({ compressionLevel: 9 }).toFile("public/brand/logo.png");
  await sharp(logo).resize(400, 200, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile("public/brand/logo@2x.png");

  // Favicon: square-crop the mark and pad it so it reads at 32px.
  const mark = await get("2024/01/WhatsApp_Image_2024-01-19_at_17.33.05_439c13a9-removebg-preview.png");
  await sharp(mark)
    .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile("public/brand/mark.png");
  // Next.js serves app/icon.png as the favicon automatically.
  await writeFile("app/icon.png", await sharp(mark)
    .resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer());
  console.log("✓ logo + favicon");
}

/* ---------- hero banners ---------- */
const SLIDES = [
  ["2021/10/genomed-ban-1.jpg", "slide-1"],
  ["2021/10/genomed-ban-2.png", "slide-2"],
];
for (const [src, name] of SLIDES) {
  const buf = await get(src);
  await sharp(buf).resize(1600, 595, { fit: "cover" }).webp({ quality: 82 }).toFile(`public/hero/${name}.webp`);
  const { size } = await sharp(`public/hero/${name}.webp`).metadata();
  console.log(`✓ hero/${name}.webp ${Math.round((size ?? 0) / 1024)} KB`);
}

/* ---------- therapeutic-area photography ---------- */
const AREAS = {
  "liver-care": "2024/01/Untitled-design-38.png",
  "metabolic-care": "2024/01/Untitled-design-21.png",
  "renal-care": "2024/01/Untitled-design-25.png",
  "womens-health": "2024/01/Untitled-design-19.png",
  "skin-care": "2024/01/Untitled-design-36.png",
  haemostatics: "2024/01/Untitled-design-24.png",
  "mens-wellness": "2024/01/Untitled-design-11-1.png",
};
for (const [slug, src] of Object.entries(AREAS)) {
  const buf = await get(src);
  await sharp(buf).resize(800, 800, { fit: "cover", position: "attention" })
    .webp({ quality: 78 })
    .toFile(`public/areas/${slug}.webp`);
  console.log(`✓ areas/${slug}.webp`);
}

// General Wellness has no photograph on the old site; the herb still-life we
// already ship is the right subject for "Tonics & Distillates".
await sharp("public/media/mortar-stillife-poster.jpg")
  .resize(800, 800, { fit: "cover", position: "attention" })
  .webp({ quality: 78 })
  .toFile("public/areas/general-wellness.webp");
console.log("✓ areas/general-wellness.webp (from the herb still-life)");
