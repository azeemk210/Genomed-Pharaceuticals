import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const VIEWPORTS = [
  { name: "Mobile Narrow (iPhone SE)", width: 320, height: 667 },
  { name: "Mobile Standard (iPhone 14/15)", width: 390, height: 844 },
  { name: "Tablet Portrait (iPad Mini)", width: 768, height: 1024 },
  { name: "Laptop Standard", width: 1024, height: 768 },
  { name: "Desktop Widescreen", width: 1440, height: 900 },
];

const ROUTES = [
  "/",
  "/products",
  "/products/decoliv-ds-syrup",
  "/cart",
  "/checkout",
  "/admin/login",
  "/about",
  "/quality",
  "/partner",
  "/contact",
];

async function runResponsiveAudit() {
  console.log("==========================================================");
  console.log(`  STARTING RESPONSIVE & LAYOUT INTEGRITY AUDIT`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Testing ${ROUTES.length} routes across ${VIEWPORTS.length} screen sizes`);
  console.log("==========================================================\n");

  const browser = await chromium.launch({ headless: true });
  let totalTests = 0;
  let passedTests = 0;
  const issues = [];

  for (const vp of VIEWPORTS) {
    console.log(`\nScreen Viewport: ${vp.name} (${vp.width}x${vp.height}px)`);
    console.log("----------------------------------------------------------");

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Populate local storage with cart item for realistic checkout rendering
    await page.addInitScript(() => {
      localStorage.setItem(
        "genomed.cart.v1",
        JSON.stringify([
          { slug: "decoliv-ds-syrup", qty: 2 },
          { slug: "rimcuff-ayurvedic-cough-syrup", qty: 1 },
        ])
      );
    });

    for (const route of ROUTES) {
      totalTests++;
      const url = `${BASE_URL}${route}`;
      try {
        const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
        const status = response?.status();

        if (status !== 200) {
          issues.push({ vp: vp.name, route, issue: `Non-200 HTTP status: ${status}` });
          console.log(`  ✗ ${route} returned HTTP ${status}`);
          continue;
        }

        // Wait brief tick for hydration
        await page.waitForTimeout(300);

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientWidth = doc.clientWidth;
          return {
            hasOverflow: scrollWidth > clientWidth + 1,
            diff: scrollWidth - clientWidth,
            scrollWidth,
            clientWidth,
          };
        });

        if (overflow.hasOverflow) {
          issues.push({
            vp: vp.name,
            route,
            issue: `Horizontal overflow detected: scrollWidth (${overflow.scrollWidth}px) > clientWidth (${overflow.clientWidth}px)`,
          });
          console.log(`  ✗ ${route} has horizontal overflow (+${overflow.diff}px)`);
        } else {
          passedTests++;
          console.log(`  ✓ ${route.padEnd(30)} — 100% responsive (0px overflow)`);
        }
      } catch (err) {
        issues.push({ vp: vp.name, route, issue: err.message });
        console.log(`  ✗ ${route} error: ${err.message}`);
      }
    }
    await context.close();
  }

  await browser.close();

  console.log("\n==========================================================");
  console.log(`  AUDIT SUMMARY: ${passedTests}/${totalTests} CHECKS PASSED`);
  if (issues.length === 0) {
    console.log("  ALL ROUTES ARE 100% RESPONSIVE WITH ZERO OVERFLOW!");
  } else {
    console.log(`  Found ${issues.length} responsive issues:`);
    issues.forEach((iss) => console.log(`  - [${iss.vp}] ${iss.route}: ${iss.issue}`));
  }
  console.log("==========================================================\n");

  if (issues.length > 0) process.exit(1);
}

runResponsiveAudit().catch((e) => {
  console.error("Audit failed:", e);
  process.exit(1);
});
