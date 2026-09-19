/** Samples real rendered pixels behind key text and reports contrast ratios. */
import { chromium } from "playwright";
const BASE = process.argv[2] || "http://localhost:3100";
const b = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 950 } });

const L = ([r, g, bl]) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
};
const ratio = (a, c) => { const [x, y] = [L(a), L(c)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const parse = (s) => s.match(/\d+/g).slice(0, 3).map(Number);

const checks = [
  ["/", "h1", "hero headline"],
  ["/", ".eyebrow", "hero eyebrow"],
  ["/quality", "h2", "section heading on video"],
  ["/products", "h1", "page hero title"],
  ["/partner", "h1", "page hero title"],
];

for (const [route, sel, label] of checks) {
  const p = await ctx.newPage();
  await p.goto(BASE + route, { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  const r = await p.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const box = el.getBoundingClientRect();
    return { color: getComputedStyle(el).color, x: Math.round(box.right + 10), y: Math.round(box.top + box.height / 2) };
  }, sel);
  if (!r) { await p.close(); continue; }
  // Sample the painted pixel just left of the glyphs (background, not text).
  const shot = await p.screenshot({ clip: { x: r.x, y: r.y, width: 2, height: 2 } });
  // Decode the 2x2 PNG in the page itself rather than pulling in an image library.
  const bg = await p.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const g = c.getContext("2d"); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  }, shot.toString("base64"));
  const fg = parse(r.color);
  const cr = ratio(fg, bg);
  const pass = cr >= 4.5 ? "AA" : cr >= 3 ? "AA-large" : "FAIL";
  console.log(`${pass.padEnd(9)} ${cr.toFixed(2).padStart(5)}:1  ${route} ${label}  text ${r.color} on rgb(${bg})`);
  await p.close();
}
await b.close();
