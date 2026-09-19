/**
 * Crops every product photo to the pack itself.
 *
 * The recovered photography is 900×900 with the pack floating in white: packs
 * filled anywhere from 33% to 84% of the frame's width and 69% to 96% of its
 * height, so side by side in a grid every pack sat at a different size in a
 * different amount of empty space. Some also carry transparent letterbox bars
 * down both sides. Cropping to the pack and letting the layout scale it with
 * `object-contain` puts every pack at the same visual size.
 *
 * Idempotent: originals are copied once to scripts/.product-originals/ and
 * every run crops from those, never from its own previous output — so running
 * it twice gives byte-identical files instead of drifting a pixel per re-encode.
 *
 *   node scripts/trim-product-images.mjs
 */
import sharp from "sharp";
import { readdirSync, existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "public/products";
const BACKUP = "scripts/.product-originals";
const INK = 246; // a channel below this is pack, not paper
const MIN_INK = 2; // a row or column needs this many ink pixels to count
const MARGIN = 0.04; // breathing room, as a share of the pack's longer side

// libvips caches open files; on Windows that lock blocks writing back to
// the same path, so the cache is off and every read goes through a buffer.
sharp.cache(false);

if (!existsSync(BACKUP)) mkdirSync(BACKUP, { recursive: true });

for (const file of readdirSync(DIR).filter((f) => f.endsWith(".webp"))) {
  const src = join(DIR, file);
  const backup = join(BACKUP, file);
  if (!existsSync(backup)) copyFileSync(src, backup);

  const input = readFileSync(backup);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  // Project ink onto both axes rather than taking the extreme pixel, so a
  // single speck of compression noise cannot widen the box.
  const cols = new Uint32Array(W);
  const rows = new Uint32Array(H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * C;
      if (data[i + 3] > 0 && Math.min(data[i], data[i + 1], data[i + 2]) < INK) {
        cols[x]++;
        rows[y]++;
      }
    }
  }
  const first = (a) => a.findIndex((n) => n >= MIN_INK);
  const last = (a) => a.length - 1 - [...a].reverse().findIndex((n) => n >= MIN_INK);
  const [x0, x1, y0, y1] = [first(cols), last(cols), first(rows), last(rows)];
  if (x0 < 0 || y0 < 0) {
    console.log(`${file.padEnd(26)} no pack found — left as is`);
    continue;
  }

  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * MARGIN);
  const left = Math.max(0, x0 - pad);
  const top = Math.max(0, y0 - pad);
  const width = Math.min(W, x1 + pad + 1) - left;
  const height = Math.min(H, y1 + pad + 1) - top;

  // Flatten onto white: the transparent letterbox bars are gone after the crop,
  // but any partial alpha left at the edge would otherwise show as a seam.
  const out = await sharp(input)
    .extract({ left, top, width, height })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 86 })
    .toBuffer();
  writeFileSync(src, out);

  console.log(`${file.padEnd(26)} ${W}×${H} → ${width}×${height}`);
}
