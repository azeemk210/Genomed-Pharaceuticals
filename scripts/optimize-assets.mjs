import sharp from "sharp";
import fs from "fs";
import path from "path";

async function optimizeAssets() {
  console.log("=== OPTIMIZING ASSETS ===");

  const targets = [
    {
      path: "public/hero/packs/sugar-ok.webp",
      maxWidth: 420,
      quality: 85,
    },
    {
      path: "public/hero/packs/heamclear-sf.webp",
      maxWidth: 420,
      quality: 85,
    },
    {
      path: "public/hero/packs/rimcuff-sf.webp",
      maxWidth: 400,
      quality: 85,
    },
    {
      path: "public/hero/packs/kcr-powder.webp",
      maxWidth: 400,
      quality: 85,
    },
    {
      path: "public/products/decoliv-ds-syrup.webp",
      maxWidth: 450,
      quality: 85,
    },
    {
      path: "public/products/arq-15.webp",
      maxWidth: 450,
      quality: 85,
    },
    {
      path: "public/media/hero-background.webp",
      maxWidth: 1600,
      quality: 75,
    },
  ];

  for (const t of targets) {
    if (!fs.existsSync(t.path)) continue;
    const inputBuf = fs.readFileSync(t.path);
    const origSize = inputBuf.length;

    const outputBuf = await sharp(inputBuf)
      .resize({ width: t.maxWidth, withoutEnlargement: true })
      .webp({ quality: t.quality, effort: 6 })
      .toBuffer();

    const newSize = outputBuf.length;
    if (newSize < origSize) {
      fs.writeFileSync(t.path, outputBuf);
      console.log(
        `✓ ${t.path.padEnd(42)}: ${(origSize / 1024).toFixed(1)} KB -> ${(newSize / 1024).toFixed(1)} KB (-${Math.round((1 - newSize / origSize) * 100)}%)`
      );
    } else {
      console.log(`- ${t.path.padEnd(42)}: kept original (${(origSize / 1024).toFixed(1)} KB)`);
    }
  }

  // Clean up any stray tmp files
  const tmpFiles = fs.readdirSync("public/hero/packs").filter(f => f.endsWith(".tmp.webp"));
  for (const f of tmpFiles) {
    try { fs.unlinkSync(path.join("public/hero/packs", f)); } catch {}
  }


  console.log("Assets optimization complete!");
}

optimizeAssets().catch(console.error);
