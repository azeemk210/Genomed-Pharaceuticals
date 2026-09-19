/** Full-page screenshots for visual review: node scripts/shoot.mjs /route [...] */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE || "http://localhost:3100";
const routes = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await mkdir(".test-shots", { recursive: true });

for (const route of routes) {
  const page = await ctx.newPage();
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 90_000 });
  // Scroll through so every reveal fires before we capture.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    let y = 0;
    // Re-read scrollHeight each pass: it grows as videos and fonts settle.
    while (y < document.documentElement.scrollHeight) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
      y += step;
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 600));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 700));
  });
  /* Playwright's full-page capture expands the viewport, which strands a
     position:sticky header in the middle of the image. Pin it for the shot. */
  await page.addStyleTag({ content: "header{position:static !important}" });
  const name = route === "/" ? "full-home" : "full" + route.replace(/\//g, "_");
  await page.screenshot({ path: `.test-shots/${name}.png`, fullPage: true });
  console.log(`${name}.png`);
  await page.close();
}
await browser.close();
