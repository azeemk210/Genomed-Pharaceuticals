/**
 * One-off: pull the real product photography off the old WordPress site and
 * convert it to WebP under public/products/. Run once; the files are committed.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const MAP = {
  "arq-15-arq-450-ml": "arq-15",
  "cistover-liquied-syrup": "cistover-liquid",
  "decoliv-ds-syrup-200ml": "decoliv-ds-syrup",
  "heamclear-sf-syrup": "heamclear-sf-syrup",
  "kcr-powder-100gm": "kcr-powder",
  "quickly-stop-bleedingqsb-500mg-capsules": "qsb-capsules",
  "rimcuff-sf-syrup-100ml": "rimcuff-sf-syrup",
  "stoclean-sf-syrup": "stoclean-sf-syrup",
  "stroperm-powdwer-100gm": "stroperm-powder",
  "sugar-ok-liquid-500-ml-genomed-pharmaceuticals": "sugar-ok-liquid",
};

await mkdir("public/products", { recursive: true });

for (const [oldSlug, slug] of Object.entries(MAP)) {
  try {
    const html = await (
      await fetch(`https://www.genomedpharmaceuticals.com/product/${oldSlug}/`)
    ).text();
    const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    if (!og) {
      console.log(`✗ ${slug}: no og:image`);
      continue;
    }
    const buf = Buffer.from(await (await fetch(og)).arrayBuffer());
    // No flatten — alpha is kept so the pack can float over any ground.
    const img = sharp(buf);
    const meta = await img.metadata();
    await img
      .resize(900, 900, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 82, alphaQuality: 100 })
      .toFile(`public/products/${slug}.webp`);
    console.log(`✓ ${slug.padEnd(20)} ${meta.width}×${meta.height} ← ${og.split("/").pop()}`);
  } catch (e) {
    console.log(`✗ ${slug}: ${e.message}`);
  }
}
