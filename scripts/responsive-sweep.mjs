/**
 * Layout sweep: every route at every common width, in real Chrome.
 *
 *   node scripts/responsive-sweep.mjs [baseUrl]
 *
 * Per page and width: horizontal overflow, anything poking out of the viewport,
 * controls whose label is clipped, controls covered by another element (so a
 * tap lands on the wrong thing), controls in one row that are not vertically
 * aligned, broken images, console errors. Once per run: every internal link
 * resolves. Full-page screenshots for a handful of widths land in .sweep-shots/.
 */
import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";

const BASE = process.argv[2] || "http://localhost:3100";
const SHOTS = ".sweep-shots";
const WIDTHS = [320, 360, 375, 390, 414, 480, 600, 768, 820, 1024, 1180, 1280, 1440, 1920];
const SHOOT = new Set([320, 390, 768, 1024, 1440]);
/* Short screens: a scaled laptop display and phones held sideways. This is
   where pinned columns and drawers outgrow the viewport. */
const SHORT = [[1536, 640], [1366, 600], [1024, 600], [844, 390], [667, 375]];
const ROUTES = [
  "/",
  "/about",
  "/products",
  "/products?area=liver-care",
  "/products?q=zzzz",
  "/products/decoliv-ds-syrup",
  "/products/kcr-powder",
  "/quality",
  "/partner",
  "/contact",
  "/cart",
  "/saved",
  "/privacy",
  "/terms",
  "/definitely-not-a-page",
];

const problems = [];
const note = (route, width, kind, detail) => problems.push({ route, width, kind, detail });

/* ---------- page-side checks ---------- */
const CHECK = async () => {
  const out = { overflow: null, poking: [], clipped: [], covered: [], misaligned: [], images: [], pinned: [] };
  const vw = document.documentElement.clientWidth;
  if (document.documentElement.scrollWidth > vw + 1)
    out.overflow = `scrollWidth ${document.documentElement.scrollWidth} > ${vw}`;

  const shown = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
      if (n.inert || n.getAttribute("aria-hidden") === "true") return false;
    }
    // Folded <details> content keeps a box but is not rendered.
    if (el.checkVisibility && !el.checkVisibility({ contentVisibilityAuto: true })) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1; // 1px = sr-only
  };
  /* Absolutely placed children (count badges, enlarged hit areas) widen
     scrollWidth without clipping any label. */
  const overlays = (el) =>
    getComputedStyle(el, "::before").position === "absolute" ||
    getComputedStyle(el, "::after").position === "absolute" ||
    [...el.querySelectorAll("*")].some((c) => getComputedStyle(c).position === "absolute");
  /* Inside a sideways scroller or a clipping box, sticking out is by design. */
  const contained = (el) => {
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true;
    }
    return false;
  };
  const name = (el) =>
    `${el.tagName.toLowerCase()}"${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 36)}"`;

  document.querySelectorAll("body *").forEach((el) => {
    if (!shown(el) || contained(el)) return;
    const s = getComputedStyle(el);
    if (s.position === "fixed") return;
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) out.poking.push(`${name(el)} ${Math.round(r.left)}→${Math.round(r.right)}`);
  });

  /* A pinned box taller than the space under its offset can never be scrolled
     to its end — unless it scrolls within itself. */
  document.querySelectorAll("main *").forEach((el) => {
    const s = getComputedStyle(el);
    if (s.position !== "sticky" || !shown(el)) return;
    const room = innerHeight - (parseFloat(s.top) || 0);
    const selfScrolls = /(auto|scroll)/.test(s.overflowY);
    if (el.offsetHeight > room + 1 && !selfScrolls)
      out.pinned.push(`${name(el)} is ${el.offsetHeight}px tall with ${Math.round(room)}px of room`);
  });

  const controls = [...document.querySelectorAll("a[href],button,select,input,textarea,summary")].filter(shown);

  for (const el of controls) {
    // Label wider than its box (truncate is an explicit, visible choice).
    if (el.matches("a,button") && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).textOverflow !== "ellipsis" && !overlays(el))
      out.clipped.push(`${name(el)} needs ${el.scrollWidth}px, has ${el.clientWidth}px`);

    // Covered: the element at its centre should be it, inside it, or around it.
    if (contained(el) && el.closest("[role=group]")) continue; // off-screen chips
    el.scrollIntoView({ block: "center", inline: "nearest" });
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > vw) continue;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (hit && hit !== el && !el.contains(hit) && !hit.contains(el)) {
      // A stretched-link overlay or a label wrapping its input is fine.
      const viaLabel = hit.closest("label")?.contains(el) || hit.closest("label")?.htmlFor === el.id;
      if (!viaLabel) out.covered.push(`${name(el)} is under ${name(hit)}`);
    }
  }
  scrollTo(0, 0);

  /* Siblings laid out in one flex row should share a centre line or an edge. */
  document.querySelectorAll("body *").forEach((row) => {
    const s = getComputedStyle(row);
    if (s.display !== "flex" || s.flexDirection !== "row" || s.flexWrap !== "nowrap") return;
    // The hero podium staggers its packs on purpose.
    const kids = [...row.children].filter(
      (k) => k.matches("a,button,select,input,[role=group]") && !k.matches(".pack-parallax") && shown(k),
    );
    if (kids.length < 2) return;
    const rs = kids.map((k) => k.getBoundingClientRect());
    const mids = rs.map((r) => r.top + r.height / 2);
    const tops = rs.map((r) => r.top);
    const spread = (a) => Math.max(...a) - Math.min(...a);
    if (spread(mids) > 2 && spread(tops) > 2 && spread(rs.map((r) => r.bottom)) > 2)
      out.misaligned.push(`${kids.map(name).join(" | ")} (centres off by ${Math.round(spread(mids))}px)`);
  });

  // Lazy images only load once scrolled to.
  for (const img of document.querySelectorAll("img")) {
    if (!shown(img)) continue;
    img.scrollIntoView({ block: "center" });
    if (!img.complete) await new Promise((r) => ((img.onload = r), (img.onerror = r), setTimeout(r, 4000)));
    if (img.naturalWidth === 0) out.images.push(img.currentSrc || img.src);
  }
  scrollTo(0, 0);
  return out;
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
await rm(SHOTS, { recursive: true, force: true });
await mkdir(SHOTS, { recursive: true });

/* Seed a full cart and saved list so /cart and /saved show real rows. */
const seedCtx = await browser.newContext();
const seedPage = await seedCtx.newPage();
await seedPage.goto(`${BASE}/products`, { waitUntil: "networkidle" });
const slugs = await seedPage.$$eval("article h3 a", (as) => as.map((a) => a.getAttribute("href").split("/").pop()));
await seedCtx.close();
const seed = {
  "genomed.cart.v1": JSON.stringify(slugs.slice(0, 5).map((slug, i) => ({ slug, qty: [1, 12, 144, 999, 2][i] }))),
  "genomed.saved.v1": JSON.stringify(slugs.slice(2, 7)),
};

console.log(`\nSweeping ${BASE} — ${ROUTES.length} routes × ${WIDTHS.length} widths\n${"─".repeat(70)}`);
const links = new Set();

for (const route of ROUTES) {
  const bad = [];
  for (const [width, height] of [...WIDTHS.map((w) => [w, w < 768 ? 800 : 900]), ...SHORT]) {
    const ctx = await browser.newContext({
      viewport: { width, height },
      hasTouch: width < 1024,
      isMobile: width < 768,
      reducedMotion: "reduce", // reveals and sheets settle at once
    });
    await ctx.addInitScript((s) => {
      for (const [k, v] of Object.entries(s)) if (!localStorage.getItem(k)) localStorage.setItem(k, v);
    }, seed);
    const page = await ctx.newPage();
    const before = problems.length;
    page.on("pageerror", (e) => note(route, width, "exception", e.message));
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const t = m.text();
      if (/favicon|React DevTools|maps\.google|googleapis|gstatic/i.test(t)) return;
      if (route === "/definitely-not-a-page" && /404/.test(t)) return;
      note(route, width, "console", t.slice(0, 200));
    });

    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const r = await page.evaluate(CHECK);
    const at = height < 800 ? `${width}×${height}` : width;
    if (r.overflow) note(route, at, "overflow", r.overflow);
    for (const k of ["poking", "clipped", "covered", "misaligned", "images", "pinned"])
      [...new Set(r[k])].slice(0, 6).forEach((d) => note(route, at, k, d));

    if (width === 1440 && height === 900)
      (await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")))).forEach((h) => links.add(h));

    if (SHOOT.has(width) && height >= 800) {
      const file = (route === "/" ? "home" : route.replace(/[/?=]/g, "_").replace(/^_/, "")) + `--${width}.png`;
      await page.screenshot({ path: `${SHOTS}/${file}`, fullPage: true });
    }
    if (problems.length > before) bad.push(height < 800 ? `${width}×${height}` : width);
    await ctx.close();
  }
  console.log(`${bad.length ? "✗" : "✓"} ${route.padEnd(34)} ${bad.length ? "fails at " + bad.join(", ") : "all widths"}`);
}

/* ---------- overlays on a phone held sideways ---------- */
for (const [width, height] of [[844, 390], [667, 375]]) {
  const c = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  const page = await c.newPage();
  const reach = async (label, scope) => {
    const r = await page.evaluate((sel) => {
      const box = document.querySelector(sel);
      if (!box) return "not found";
      const items = [...box.querySelectorAll("a[href],button:not([tabindex='-1'])")].filter((e) => e.checkVisibility());
      const last = items[items.length - 1];
      last?.scrollIntoView({ block: "nearest" });
      const b = last?.getBoundingClientRect();
      return b && b.top >= 0 && b.bottom <= innerHeight + 1 ? null : `last control ends at ${Math.round(b?.bottom)}px of ${innerHeight}px`;
    }, scope);
    if (r) note(label, `${width}×${height}`, "unreachable", r);
    return r;
  };
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.locator('button[aria-controls="mobile-drawer"]').click();
  await page.waitForTimeout(400);
  const d = await reach("mobile menu", "#mobile-drawer");
  await page.goto(`${BASE}/products`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Filters/ }).click();
  await page.waitForTimeout(400);
  const f = await reach("filter sheet", "[role=dialog]");
  console.log(`${d || f ? "✗" : "✓"} overlays at ${width}×${height}: menu ${d ?? "reachable"}, filter sheet ${f ?? "reachable"}`);
  await c.close();
}

/* ---------- every internal link resolves ---------- */
const ctx = await browser.newContext();
let dead = 0;
for (const href of links) {
  const res = await ctx.request.get(BASE + href, { maxRedirects: 5 }).catch(() => null);
  if (!res || res.status() >= 400) {
    dead++;
    note(href, "-", "dead-link", `status ${res ? res.status() : "no response"}`);
  }
}
console.log(`${dead ? "✗" : "✓"} ${links.size} internal links checked, ${dead} dead`);
await browser.close();

console.log("─".repeat(70));
if (!problems.length) console.log("✓ No problems found.\n");
else {
  // Same defect at many widths reads as one line.
  const grouped = new Map();
  for (const p of problems) {
    const key = `${p.route} · ${p.kind} · ${p.detail}`;
    grouped.set(key, [...(grouped.get(key) ?? []), p.width]);
  }
  console.log(`✗ ${grouped.size} distinct problem(s):\n`);
  for (const [k, ws] of grouped) console.log(`  ${k}\n      at ${ws.join(", ")}`);
  console.log("");
}
process.exit(problems.length ? 1 : 0);
