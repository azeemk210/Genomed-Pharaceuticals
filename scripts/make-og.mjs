/**
 * Generates public/og.png (1200×630) — the social share card.
 * Run: npm run og
 *
 * Uses sharp (ships with Next). Text is set in system serif/sans rather than
 * Fraunces/Manrope so the script runs anywhere; close enough for a share card.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f3a30"/>
      <stop offset="58%" stop-color="#071d18"/>
      <stop offset="100%" stop-color="#04120f"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.8" cy="0.1" r="0.72">
      <stop offset="0%" stop-color="#268d6b" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#268d6b" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="warm" cx="0.05" cy="0.96" r="0.62">
      <stop offset="0%" stop-color="#d69c28" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#d69c28" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#warm)"/>

  <g transform="translate(88, 74)">
    <rect width="72" height="72" fill="#135a47"/>
    <g transform="translate(36,36) scale(1.8) translate(-20,-20)">
      <path d="M12 28.5c-1.6-5.9 1.6-14.2 16-15.3.9 11.2-5.6 16-12 15.5"
            fill="none" stroke="#ecc96d" stroke-width="2.4"
            stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 25.4c2.2-4.3 5.6-7.2 9.6-8.9"
            fill="none" stroke="#7cc7a9" stroke-width="1.8" stroke-linecap="round"/>
    </g>
  </g>

  <text x="180" y="107" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-weight="700" fill="#ffffff">Genomed</text>
  <text x="181" y="136" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="5.6" fill="#ecc96d">PHARMACEUTICALS</text>

  <rect x="88" y="206" width="1024" height="1" fill="#ffffff" fill-opacity="0.14"/>

  <text x="88" y="312" font-family="Georgia, 'Times New Roman', serif" font-size="68" font-weight="700" fill="#ffffff">Classical medicine,</text>
  <text x="88" y="392" font-family="Georgia, 'Times New Roman', serif" font-size="68" font-weight="700" fill="#ecc96d">made to a modern standard.</text>

  <text x="88" y="458" font-family="'Segoe UI', Arial, sans-serif" font-size="24" fill="#afdfca">Ayurvedic formulation manufacturer &#183; Bulandshahr, Uttar Pradesh</text>

  <g font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="700" fill="#7cc7a9">
    <rect x="88"  y="514" width="224" height="46" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.16"/>
    <text x="110" y="543">Licensed manufacture</text>

    <rect x="328" y="514" width="232" height="46" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.16"/>
    <text x="350" y="543">In-house quality control</text>

    <rect x="576" y="514" width="200" height="46" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.16"/>
    <text x="598" y="543">Batch traceability</text>
  </g>

  <rect x="0" y="616" width="1200" height="14" fill="#d69c28"/>
</svg>`;

await mkdir(join(root, "public"), { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(root, "public", "og.png"));
console.log("✓ public/og.png written (1200×630)");
