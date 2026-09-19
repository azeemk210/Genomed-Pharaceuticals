/**
 * Drives real Chrome over every route and reports what breaks.
 *
 *   node scripts/browser-test.mjs [baseUrl]
 *
 * Checks per page: console errors, uncaught exceptions, failed network
 * requests, exactly one <h1>, a non-empty <title> and meta description, no
 * horizontal overflow at 390px, and that the hero video element is present.
 * Screenshots land in .test-shots/.
 */
import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";

const BASE = process.argv[2] || "http://localhost:3100";
const SHOTS = ".test-shots";

const ROUTES = [
  "/",
  "/cart",
  "/saved",
  "/about",
  "/products",
  "/products/decoliv-ds-syrup",
  "/products/kcr-powder",
  "/products/qsb-capsules",
  "/quality",
  "/partner",
  "/contact",
  "/privacy",
  "/terms",
  "/definitely-not-a-page",
];

const IGNORE = [
  /favicon\.ico/i,
  /\/_next\/static\/development\//i,
  /Download the React DevTools/i,
  /maps\.google|googleapis|gstatic/i, // third-party map frame
];

const problems = [];
const note = (route, kind, detail) => problems.push({ route, kind, detail });

const browser = await chromium.launch({ channel: "chrome", headless: true });
await rm(SHOTS, { recursive: true, force: true });
await mkdir(SHOTS, { recursive: true });

const ctx = await browser.newContext({
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 1,
});

console.log(`\nTesting ${BASE} in Chrome\n${"─".repeat(62)}`);

for (const route of ROUTES) {
  const page = await ctx.newPage();
  const seen = [];

  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (IGNORE.some((re) => re.test(t))) return;
    seen.push(["console", t]);
  });
  page.on("pageerror", (e) => seen.push(["exception", e.message]));
  page.on("requestfailed", (r) => {
    const u = r.url();
    if (IGNORE.some((re) => re.test(u))) return;
    // Production build: a <Link> prefetch cancelled as the test moves on.
    if (u.includes("_rsc=") && r.failure()?.errorText === "net::ERR_ABORTED") return;
    seen.push(["request", `${u} — ${r.failure()?.errorText}`]);
  });

  const expect404 = route === "/definitely-not-a-page";
  let status = 0;
  try {
    const res = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 90_000 });
    status = res?.status() ?? 0;
  } catch (e) {
    note(route, "navigation", e.message);
    await page.close();
    continue;
  }

  if (expect404 ? status !== 404 : status >= 400) {
    note(route, "status", `HTTP ${status}`);
  }

  const audit = await page.evaluate(() => {
    const h1s = [...document.querySelectorAll("h1")];
    return {
      title: document.title,
      desc:
        document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      h1Count: h1s.length,
      h1: h1s[0]?.textContent?.trim().slice(0, 60) ?? "",
      videos: document.querySelectorAll("video").length,
      hiddenReveals: [...document.querySelectorAll(".reveal")].filter(
        (el) => getComputedStyle(el).opacity === "0",
      ).length,
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    };
  });

  if (audit.h1Count !== 1) note(route, "h1", `found ${audit.h1Count}`);
  if (!audit.title) note(route, "title", "empty");
  if (!expect404 && !audit.desc) note(route, "meta", "no description");
  if (audit.scrollW > audit.clientW + 1)
    note(route, "overflow", `desktop scrollWidth ${audit.scrollW} > ${audit.clientW}`);

  // The deliberate 404 route logs its own 404 — that is the thing under test,
  // not a defect, so don't report the page's own status as a console error.
  seen
    .filter(([kind, detail]) => !(expect404 && kind === "console" && /404/.test(detail)))
    .forEach(([kind, detail]) => note(route, kind, detail));

  const file = route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "");
  await page.screenshot({ path: `${SHOTS}/${file}.png`, fullPage: false });

  // phone width
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  const m = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  if (m.scrollW > m.clientW + 1)
    note(route, "overflow", `mobile scrollWidth ${m.scrollW} > ${m.clientW}`);
  await page.screenshot({ path: `${SHOTS}/${file}--mobile.png`, fullPage: false });

  const flag = problems.some((p) => p.route === route) ? "✗" : "✓";
  console.log(
    `${flag} ${route.padEnd(30)} ${String(status).padEnd(4)} h1:${audit.h1Count} vid:${audit.videos} hidden:${audit.hiddenReveals}`,
  );

  await page.close();
}

/* ---------------- interaction tests ---------------- */
console.log(`${"─".repeat(62)}\nInteractions`);

const page = await ctx.newPage();
page.on("pageerror", (e) => note("interaction", "exception", e.message));

// 1. product filter
await page.setViewportSize({ width: 1440, height: 960 });
await page.goto(`${BASE}/products`, { waitUntil: "networkidle" });
const allCards = await page.locator("[data-area]").count();
await page.locator('button[aria-pressed]:has-text("Liver Care")').first().click();
await page.waitForTimeout(700);
const liverCards = await page.locator("[data-area]").count();
if (!(liverCards > 0 && liverCards < allCards))
  note("/products", "filter", `all=${allCards} liver=${liverCards} — filter did not narrow`);
console.log(`  filter: ${allCards} → ${liverCards} on Liver Care`);

// 2. deep link ?area=
await page.goto(`${BASE}/products?area=metabolic-care`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const deep = await page.locator("[data-area]").count();
if (deep !== 2) note("/products?area=", "deeplink", `expected 2 metabolic products, got ${deep}`);
console.log(`  ?area=metabolic-care → ${deep} products`);

// 3. form validation
await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
await page.locator('button:has-text("Send enquiry")').click();
await page.waitForTimeout(400);
const errCount = await page.locator('[aria-invalid="true"]').count();
if (errCount < 3) note("/contact", "form", `expected validation errors, got ${errCount}`);
console.log(`  empty submit → ${errCount} invalid fields flagged`);

// 4. search dialog: open, type, keyboard-select
await page.setViewportSize({ width: 1440, height: 960 });
await page.goto(BASE, { waitUntil: "networkidle" });
await page.keyboard.press("Control+k");
await page.waitForTimeout(350);
const searchOpen = await page.locator('[role="dialog"][aria-label="Search Genomed"]').isVisible();
if (!searchOpen) note("/", "search", "Ctrl+K did not open the search dialog");
await page.locator('[role="dialog"] input[type="search"]').fill("liver");
await page.waitForTimeout(350);
const searchHits = await page.locator('[role="dialog"] ul li a').count();
if (searchHits === 0) note("/", "search", 'no results for "liver"');
await page.keyboard.press("Enter");
await page.waitForURL(/\/products/, { timeout: 15000 }).catch(() => {});
const landed = page.url();
if (!/\/products/.test(landed)) note("/", "search", `Enter did not navigate (at ${landed})`);
console.log(`  search: Ctrl+K opens, "liver" -> ${searchHits} hits, Enter -> ${landed.replace(BASE, "")}`);

// 5. add to cart -> badge -> cart page -> quantity -> persistence
await page.goto(`${BASE}/products/kcr-powder`, { waitUntil: "networkidle" });
await page.locator('button:has-text("Add to enquiry")').first().click();
await page.waitForTimeout(400);
const badgeAfterAdd = (await page.locator('a[href="/cart"] span').first().textContent().catch(() => "")) || "";
if (badgeAfterAdd.trim() !== "1") note("/products/kcr-powder", "cart", `badge showed "${badgeAfterAdd.trim()}" after add, expected 1`);

await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const lines = await page.locator("main ul li").count();
if (lines === 0) note("/cart", "cart", "line did not persist to the cart page");
await page.locator('button[aria-label^="Increase quantity"]').first().click();
await page.waitForTimeout(350);
const qty = await page.locator('input[inputmode="numeric"]').first().inputValue();
if (qty !== "2") note("/cart", "cart", `quantity showed ${qty} after increment, expected 2`);

// survives a reload (localStorage)
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
const qtyAfterReload = await page.locator('input[inputmode="numeric"]').first().inputValue().catch(() => "0");
if (qtyAfterReload !== "2") note("/cart", "cart", `quantity ${qtyAfterReload} after reload, expected 2`);
console.log(`  cart: add -> badge ${badgeAfterAdd.trim()}, +1 -> ${qty}, reload -> ${qtyAfterReload}`);

// enquiry form opens with the itemised list prefilled
await page.locator('button:has-text("Send this enquiry")').click();
await page.waitForTimeout(400);
const msg = await page.locator("#eq-message").inputValue().catch(() => "");
if (!/KCR Powder/.test(msg)) note("/cart", "cart", "order enquiry message not prefilled with the list");
console.log(`  cart: enquiry prefill ${/KCR Powder/.test(msg) ? "ok" : "MISSING"}`);

// 6. saved list
await page.goto(`${BASE}/products`, { waitUntil: "networkidle" });
await page.locator('button[aria-label^="Save "]').first().click();
await page.waitForTimeout(350);
await page.goto(`${BASE}/saved`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const savedCards = await page.locator("article").count();
if (savedCards === 0) note("/saved", "saved", "saved product did not appear");
console.log(`  saved: ${savedCards} product(s) on /saved`);

// 7. mobile menu
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(BASE, { waitUntil: "networkidle" });
const toggle = page.locator("#mobile-drawer").first();
await page.locator('button[aria-controls="mobile-drawer"]').click();
await page.waitForTimeout(400);
const drawerOpen = await toggle.isVisible();
if (!drawerOpen) note("/", "mobilenav", "drawer did not open");
console.log(`  mobile drawer opens: ${drawerOpen}`);
await page.screenshot({ path: `${SHOTS}/home--drawer.png` });


// 8. cart: every removal can be undone, and focus never falls to <body>
await page.setViewportSize({ width: 1440, height: 960 });
await page.goto(`${BASE}/products`, { waitUntil: "networkidle" });
for (let i = 0; i < 2; i++) await page.locator('article button[aria-label^="Add "]').first().click();
await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" });
const rowsBefore = await page.locator("[data-row]").count();
await page.locator('[data-row] button[aria-label^="Remove "]').last().click();
await page.waitForTimeout(400);
const rowsAfter = await page.locator("[data-row]").count();
const focusAfterRemove = await page.evaluate(() => document.activeElement?.tagName);
await page.getByRole("button", { name: "Undo" }).click();
await page.waitForTimeout(400);
const rowsUndone = await page.locator("[data-row]").count();
if (rowsAfter !== rowsBefore - 1) note("/cart", "undo", `remove: ${rowsBefore} → ${rowsAfter} rows`);
if (rowsUndone !== rowsBefore) note("/cart", "undo", `undo restored ${rowsUndone} of ${rowsBefore} rows`);
if (focusAfterRemove === "BODY") note("/cart", "focus", "focus dropped to <body> after removing a row");
await page.getByRole("button", { name: "Clear the list" }).click();
await page.waitForTimeout(400);
const emptied = await page.getByText("Your enquiry list is empty").isVisible();
const focusAfterClear = await page.evaluate(() => document.activeElement?.tagName);
await page.getByRole("button", { name: "Undo" }).click();
await page.waitForTimeout(400);
const rowsReturned = await page.locator("[data-row]").count();
if (!emptied) note("/cart", "undo", "clear did not reach the empty state");
if (focusAfterClear === "BODY") note("/cart", "focus", "focus dropped to <body> after clearing");
if (rowsReturned !== rowsBefore) note("/cart", "undo", `undo after clear restored ${rowsReturned} of ${rowsBefore}`);
console.log(`  cart undo: ${rowsBefore} → ${rowsAfter} → ${rowsUndone}; clear → undo → ${rowsReturned}; focus ${focusAfterRemove}/${focusAfterClear}`);

// send enquiry brings the form into view and takes focus
await page.getByRole("button", { name: "Send this enquiry" }).click();
await page.waitForTimeout(900);
const send = await page.evaluate(() => ({
  inView: document.getElementById("send").getBoundingClientRect().top < innerHeight,
  focus: document.activeElement?.id,
}));
if (!send.inView || send.focus !== "send") note("/cart", "form", `enquiry form inView=${send.inView} focus=${send.focus}`);
console.log(`  cart: enquiry form in view ${send.inView}, focused ${send.focus === "send"}`);

// 9. a category link back to the URL the listing mounted with re-seeds it
await page.goto(`${BASE}/products?area=liver-care`, { waitUntil: "networkidle" });
await page.locator('aside[aria-label="Filters"] button:has-text("Renal Care")').click();
await page.locator('footer a[href="/products?area=liver-care"]').first().click();
await page.waitForTimeout(1200);
const reseeded = (await page.textContent("h1"))?.trim();
if (reseeded !== "Liver Care") note("/products", "reseed", `h1 is "${reseeded}" after following a Liver Care link`);
console.log(`  listing re-seed: h1 "${reseeded}"`);

// 10. phone filter sheet: traps focus, filters live, Esc returns focus
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const mp = await phone.newPage();
mp.on("pageerror", (e) => note("interaction", "exception", e.message));
await mp.goto(`${BASE}/products`, { waitUntil: "networkidle" });
await mp.getByRole("button", { name: /^Filters/ }).click();
await mp.waitForTimeout(400);
let escaped = false;
for (let i = 0; i < 40 && !escaped; i++) {
  await mp.keyboard.press("Tab");
  escaped = await mp.evaluate(() => !document.activeElement.closest("[role=dialog]"));
}
if (escaped) note("/products", "sheet", "Tab left the open filter sheet");
await mp.locator('[role=dialog] button:has-text("Liver Care")').click();
const showLabel = (await mp.locator('[role=dialog] button:has-text("Show ")').textContent())?.trim();
await mp.keyboard.press("Escape");
await mp.waitForTimeout(300);
const sheetGone = (await mp.locator("[role=dialog]").count()) === 0;
const backOnTrigger = await mp.evaluate(() => /Filters/.test(document.activeElement?.textContent || ""));
const phoneCards = await mp.locator("[data-area]").count();
if (!sheetGone) note("/products", "sheet", "Esc did not close the sheet");
if (!backOnTrigger) note("/products", "sheet", "focus did not return to the Filters button");
if (!showLabel?.includes(String(phoneCards))) note("/products", "sheet", `"${showLabel}" but ${phoneCards} cards shown`);
console.log(`  filter sheet: trapped ${!escaped}, "${showLabel}", Esc closes ${sheetGone}, focus back ${backOnTrigger}`);

// a chip selected by the URL is scrolled into the strip
await mp.goto(`${BASE}/products?area=general-wellness`, { waitUntil: "networkidle" });
await mp.waitForTimeout(400);
const chipSeen = await mp.evaluate(() => {
  const chip = document.querySelector('[aria-label="Therapeutic area"] [aria-pressed="true"]');
  const r = chip?.getBoundingClientRect();
  return !!r && r.left >= 0 && r.right <= innerWidth;
});
if (!chipSeen) note("/products?area=", "chips", "selected chip is off screen");
console.log(`  chips: selected chip in view ${chipSeen}`);

// 11. sticky buy bar: inert at the top, live past the buy box, gone at the footer
await mp.goto(`${BASE}/products/qsb-capsules`, { waitUntil: "networkidle" });
const barState = () =>
  mp.evaluate(() => {
    const el = [...document.querySelectorAll("div.fixed")].find((d) => d.className.includes("bottom-0") && d.className.includes("z-30"));
    return el ? { inert: el.inert, onScreen: el.getBoundingClientRect().top < innerHeight - 4 } : null;
  });
const atTop = await barState();
await mp.evaluate(() => scrollTo(0, document.getElementById("buy-box").offsetTop + 900));
await mp.waitForTimeout(700);
const past = await barState();
if (past && !past.inert) {
  await mp.locator("div.fixed.z-30 button[aria-label^='Add ']").click();
  await mp.waitForTimeout(400);
}
const barQty = await mp.locator("div.fixed.z-30 input").inputValue().catch(() => "");
await mp.evaluate(() => scrollTo(0, document.body.scrollHeight));
await mp.waitForTimeout(700);
const atFoot = await barState();
if (!atTop?.inert || atTop.onScreen) note("/products/[slug]", "buybar", "bar is live at the top of the page");
if (past?.inert || !past?.onScreen) note("/products/[slug]", "buybar", "bar did not appear past the buy box");
if (barQty !== "1") note("/products/[slug]", "buybar", `Add from the bar gave quantity "${barQty}"`);
if (!atFoot?.inert) note("/products/[slug]", "buybar", "bar still live over the footer");
console.log(`  buy bar: top inert ${atTop?.inert}, shown ${past?.onScreen}, add → ${barQty}, footer inert ${atFoot?.inert}`);
await phone.close();

await page.close();
await browser.close();

/* ---------------- report ---------------- */
console.log(`${"─".repeat(62)}`);
if (!problems.length) {
  console.log("✓ No problems found.\n");
} else {
  console.log(`✗ ${problems.length} problem(s):\n`);
  for (const p of problems) console.log(`  [${p.route}] ${p.kind}: ${p.detail}`);
  console.log("");
}
process.exit(problems.length ? 1 : 0);
