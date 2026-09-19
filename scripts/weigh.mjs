import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
for (const route of ["/", "/products", "/quality"]) {
  const p = await ctx.newPage();
  const by = {};
  p.on("response", async (r) => {
    try {
      const h = await r.allHeaders();
      const len = Number(h["content-length"] || 0);
      const type = (h["content-type"] || "other").split(";")[0].split("/")[0];
      by[type] = (by[type] || 0) + len;
    } catch {}
  });
  await p.goto("http://localhost:3200" + route, { waitUntil: "networkidle" });
  const total = Object.values(by).reduce((a, c) => a + c, 0);
  console.log(`${route.padEnd(12)} total ${(total / 1024).toFixed(0).padStart(5)} KB  ` +
    Object.entries(by).sort((a,c)=>c[1]-a[1]).map(([k,v])=>`${k}:${(v/1024).toFixed(0)}KB`).join("  "));
  await p.close();
}
await b.close();
