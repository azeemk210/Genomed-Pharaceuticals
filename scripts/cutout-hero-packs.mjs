/**
 * Cuts the three hero packs out of their backgrounds.
 *
 *   public/media/rimcuff.jpeg, heamclear.jpeg — "fake transparent" JPEGs: the
 *     grey/white checkerboard is painted into the pixels, so it would show on
 *     the page as a checkerboard.
 *   public/media/sugar_ok.jpeg — a studio shot on a grey backdrop.
 *
 * Uses a segmentation model (IS-Net, via @imgly/background-removal-node) rather
 * than colour rules. Colour rules were tried first and failed both ways: the
 * checkerboards are not a perfectly regular lattice, so a fitted grid drifts out
 * of phase and leaves squares behind; and the Sugar OK carton's cream face is
 * close enough to its backdrop that a region-grow leaks straight into it.
 *
 * The model is ~360 MB with its weights, so it is deliberately NOT a project
 * dependency. To regenerate:
 *
 *   npm i --no-save @imgly/background-removal-node@1
 *   node scripts/cutout-hero-packs.mjs
 *
 * Output: public/hero/packs/<name>.webp — alpha, trimmed to the pack, ≤1000px tall.
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

let removeBackground;
try {
  ({ removeBackground } = await import("@imgly/background-removal-node"));
} catch {
  console.error(
    "Needs the segmentation model:\n  npm i --no-save @imgly/background-removal-node@1\nthen run this again.",
  );
  process.exit(1);
}

sharp.cache(false);
const OUT = "public/hero/packs";
mkdirSync(OUT, { recursive: true });

/**
 * Crop to the pack's solid pixels (alpha > 24), not to fully-transparent ones.
 * The model keeps faint haze where a source image fades out — the Rimucuff
 * source has a white fade under the pack that survived as 113px of near-
 * invisible alpha, which lifted that pack's base 14% above the others when
 * they are bottom-aligned. sharp's trim() only stops at alpha 0.
 */
export async function cropToSolid(png, minAlpha = 24, pad = 2) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (data[(y * W + x) * 4 + 3] > minAlpha) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  const left = Math.max(0, x0 - pad), top = Math.max(0, y0 - pad);
  return sharp(png).extract({
    left,
    top,
    width: Math.min(W, x1 + pad + 1) - left,
    height: Math.min(H, y1 + pad + 1) - top,
  });
}

const JOBS = [
  ["public/media/rimcuff.jpeg", "rimcuff-sf"],
  ["public/media/heamclear.jpeg", "heamclear-sf"],
  ["public/media/sugar_ok.jpeg", "sugar-ok"],
];

for (const [src, name] of JOBS) {
  const input = new Blob([readFileSync(src)], { type: "image/jpeg" });
  const cut = await removeBackground(input, {
    model: "medium",
    output: { format: "image/png", quality: 1 },
  });
  const png = Buffer.from(await cut.arrayBuffer());
  const { data, info } = await (await cropToSolid(png))
    .resize({ height: 1000, withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 90 })
    .toBuffer({ resolveWithObject: true });
  writeFileSync(`${OUT}/${name}.webp`, data);
  console.log(`${name}: ${info.width}×${info.height}, ${(data.length / 1024).toFixed(0)} KB`);
}
