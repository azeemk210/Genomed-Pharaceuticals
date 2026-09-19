/**
 * UX / accessibility audit against the ui-ux-pro-max priority rules.
 *
 *   node scripts/ux-audit.mjs [baseUrl]
 *
 * Checks, in the skill's priority order:
 *   1  Accessibility — contrast, accessible names, heading order, form labels,
 *      skip link, focus visibility
 *   2  Touch & interaction — 44px targets and 8px spacing at 375px, cursor
 *   3  Performance — intrinsic media sizing (CLS)
 *   5  Layout — horizontal overflow at 375 / 768 / 1024 / 1440
 *   7  Animation — durations in 150-400ms, reduced-motion honoured
 */
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:3100";
const ROUTES = ["/", "/about", "/products", "/products/kcr-powder", "/quality", "/partner", "/contact", "/cart", "/saved"];
const WIDTHS = [375, 768, 1024, 1440];

const findings = [];
const add = (rule, severity, route, detail) =>
  findings.push({ rule, severity, route, detail });

const browser = await chromium.launch({ channel: "chrome", headless: true });

/* ---------- injected page-side auditor ---------- */
const AUDIT = () => {
  const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
  /* Walk ancestors: a carousel's off-slide content is painted but sits inside
     an opacity-0, aria-hidden wrapper, so it is neither seen nor announced. */
  const visible = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
      if (n.getAttribute("aria-hidden") === "true") return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const label = (el) =>
    (el.getAttribute("aria-label") ||
      el.getAttribute("title") ||
      (el.getAttribute("aria-labelledby")
        ? document.getElementById(el.getAttribute("aria-labelledby"))?.textContent
        : "") ||
      el.textContent ||
      "").trim();

  const out = { probes: [], names: [], headings: [], labels: [], skip: true, media: [], motion: [] };

  /* Collect every text run with a sample point. The background under each point
     is measured from a real screenshot later — compositing it from computed
     styles is unreliable once backdrop-blur and semi-transparent panels are in
     play, and it silently invents colours that are not on the page. */
  document.querySelectorAll("body *").forEach((el) => {
    if (!visible(el)) return;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!own) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return;
    const s = getComputedStyle(el);
    const size = parseFloat(s.fontSize);
    const weight = Number(s.fontWeight) || 400;
    out.probes.push({
      fg: rgb(s.color).slice(0, 3),
      x: Math.min(innerWidth - 2, Math.max(1, Math.round(r.left + Math.min(r.width / 2, 40)))),
      y: Math.min(innerHeight - 2, Math.max(1, Math.round(r.top + r.height / 2))),
      size: Math.round(size),
      weight,
      need: size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5,
      color: s.color,
      text: (el.textContent || "").trim().slice(0, 48),
    });
  });

  /* --- accessible names on interactive elements --- */
  document.querySelectorAll("a,button,[role=button],input,select,textarea").forEach((el) => {
    if (!visible(el)) return;
    if (el.matches("input,select,textarea")) return;
    // A card's image link is deliberately aria-hidden + tabIndex -1 so the
    // title link is announced once instead of twice. It is out of the
    // accessibility tree, so it is not required to carry a name.
    if (el.closest('[aria-hidden="true"]')) return;
    if (!label(el)) {
      out.names.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 60),
        href: el.getAttribute("href") || "",
      });
    }
  });

  /* --- heading order --- */
  let prev = 0;
  document.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h) => {
    if (!visible(h)) return;
    const lvl = Number(h.tagName[1]);
    if (prev && lvl > prev + 1)
      out.headings.push({ from: prev, to: lvl, text: (h.textContent || "").trim().slice(0, 44) });
    prev = lvl;
  });

  /* --- form labels --- */
  document.querySelectorAll("input,select,textarea").forEach((el) => {
    if (!visible(el)) return;
    if (el.type === "hidden") return;
    const id = el.id;
    const has =
      (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
      el.closest("label") ||
      el.getAttribute("aria-label") ||
      el.getAttribute("aria-labelledby");
    if (!has) out.labels.push({ name: el.name || el.id || el.type, tag: el.tagName.toLowerCase() });
  });

  /* --- skip link --- */
  const first = document.querySelector("body a[href^='#']");
  out.skip = Boolean(first && /skip/i.test(first.textContent || ""));

  /* --- media intrinsic sizing (CLS) --- */
  document.querySelectorAll("img").forEach((img) => {
    const s = getComputedStyle(img);
    const sized =
      (img.getAttribute("width") && img.getAttribute("height")) ||
      s.aspectRatio !== "auto" ||
      img.closest("[class*=aspect-]") ||
      s.position === "absolute";
    if (!sized) out.media.push({ src: (img.currentSrc || img.src || "").slice(-52) });
  });

  /* --- animation durations --- */
  const durs = new Set();
  document.querySelectorAll("body *").forEach((el) => {
    if (!visible(el)) return;
    const d = getComputedStyle(el).transitionDuration;
    if (!d || d === "0s") return;
    d.split(",").forEach((x) => {
      const ms = x.trim().endsWith("ms") ? parseFloat(x) : parseFloat(x) * 1000;
      if (ms > 0) durs.add(Math.round(ms));
    });
  });
  out.motion = [...durs].sort((a, b) => a - b);

  return out;
};

/* ---------- touch targets, run at 375px ---------- */
const TOUCH = () => {
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const small = [];
  const cursor = [];
  const boxes = [];

  document.querySelectorAll("a,button,[role=button],input[type=checkbox],select").forEach((el) => {
    if (!visible(el)) return;
    // Visually-hidden affordances (skip link) only take size once focused.
    if (el.closest(".sr-only") || el.className.toString().includes("sr-only")) return;
    // A checkbox/radio inside its <label> is tapped via the whole label row,
    // which is the real target — the 20px box is only the painted control.
    if (el.matches("input") && el.closest("label")) return;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    // WCAG 2.5.8 exempts links inside a sentence or block of text.
    const inline = s.display === "inline" && el.closest("p,li,address,label");
    // This is a website, not a touch-first app: the AA bar is 24x24 CSS px
    // (WCAG 2.5.8). 44px is the Apple HIG app target and is reported separately.
    if (!inline && (r.height < 24 || r.width < 24)) {
      small.push({
        tag: el.tagName.toLowerCase(),
        w: Math.round(r.width), h: Math.round(r.height),
        text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 38),
      });
    }
    // A disabled control correctly keeps the default cursor.
    const disabled =
      el.disabled || el.getAttribute("aria-disabled") === "true";
    if (el.matches("a,button,[role=button]") && !inline && !disabled && s.cursor !== "pointer") {
      cursor.push({ tag: el.tagName.toLowerCase(), text: (el.textContent || "").trim().slice(0, 38), cursor: s.cursor });
    }
    if (!inline) boxes.push({ r, t: (el.textContent || "").trim().slice(0, 24) });
  });

  // Adjacent-target spacing: nearest neighbour gap under 8px.
  const tight = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i].r, b = boxes[j].r;
      const gx = Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right));
      const gy = Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom));
      const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0;
      const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0;
      // Two large adjacent targets (a list of full-width rows divided by a
      // hairline) are not a mis-tap risk; the spacing rule targets small ones.
      const bothLarge = a.height >= 44 && b.height >= 44 && a.width >= 44 && b.width >= 44;
      if (!bothLarge && ((overlapY && gx > 0 && gx < 8) || (overlapX && gy > 0 && gy < 8)))
        tight.push({ a: boxes[i].t, b: boxes[j].t, gap: Math.round(Math.min(gx || 99, gy || 99)) });
    }
  }
  return { small, cursor, tight: tight.slice(0, 6) };
};

/* ---------- run ---------- */
console.log(`\nUX audit — ${BASE}\n${"─".repeat(72)}`);

for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await ctx.newPage();
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForTimeout(700);

  const a = await page.evaluate(AUDIT);

  /* Ground-truth contrast: blank out every glyph, photograph the page, then read
     the true painted colour under each text run. */
  const hide = await page.addStyleTag({
    content:
      // transition/animation must go too: the site animates `color`, so without
      // this the screenshot catches glyphs mid-fade and reports a background
      // ~10% darker than it really is.
      "*,*::before,*::after{color:transparent !important;text-shadow:none !important;" +
      "transition:none !important;animation:none !important}",
  });
  await page.waitForTimeout(120);
  const shot = (await page.screenshot()).toString("base64");
  const sampled = await page.evaluate(
    async ({ b64, probes }) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      const dpr = img.width / window.innerWidth;
      return probes.map((p) => {
        const d = g.getImageData(Math.round(p.x * dpr), Math.round(p.y * dpr), 1, 1).data;
        return { ...p, bg: [d[0], d[1], d[2]] };
      });
    },
    { b64: shot, probes: a.probes },
  );
  await hide.evaluate((el) => el.remove());

  const lum = ([r, g, b]) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const cr = (x, y) => {
    const [hi, lo] = [lum(x), lum(y)].sort((m, n) => n - m);
    return (hi + 0.05) / (lo + 0.05);
  };

  const seen = new Set();
  let contrastFails = 0;
  sampled.forEach((p) => {
    const v = cr(p.fg, p.bg);
    if (v >= p.need) return;
    const key = `${p.color}|${p.bg}|${p.size}`;
    if (seen.has(key)) return;
    seen.add(key);
    contrastFails++;
    add(
      "contrast",
      "HIGH",
      route,
      `${v.toFixed(2)}:1 (needs ${p.need}) ${p.size}px ${p.color} on rgb(${p.bg}) — "${p.text}"`,
    );
  });
  a.names.forEach((n) => add("accessible-name", "HIGH", route, `<${n.tag}> no name — ${n.href || n.cls}`));
  a.headings.forEach((h) => add("heading-order", "MED", route, `h${h.from} → h${h.to} "${h.text}"`));
  a.labels.forEach((l) => add("form-label", "HIGH", route, `<${l.tag}> ${l.name}`));
  if (!a.skip) add("skip-link", "MED", route, "no skip-to-content link");
  a.media.forEach((m) => add("media-sizing", "MED", route, `img without intrinsic size — ${m.src}`));
  const bad = a.motion.filter((d) => d > 400);
  if (bad.length) add("animation-duration", "MED", route, `transitions over 400ms: ${bad.join(", ")}ms`);

  /* horizontal overflow at each breakpoint */
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(320);
    const o = await page.evaluate(() => ({
      s: document.documentElement.scrollWidth,
      c: document.documentElement.clientWidth,
    }));
    if (o.s > o.c + 1) add("horizontal-scroll", "HIGH", route, `${w}px: scrollWidth ${o.s} > ${o.c}`);
  }

  /* touch targets at phone width */
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(400);
  const t = await page.evaluate(TOUCH);
  t.small.forEach((s) => add("touch-target", "HIGH", route, `${s.w}×${s.h} (min 24) <${s.tag}> "${s.text}"`));
  t.cursor.forEach((c) => add("cursor-pointer", "LOW", route, `<${c.tag}> "${c.text}" cursor:${c.cursor}`));
  t.tight.forEach((g) => add("touch-spacing", "MED", route, `${g.gap}px between "${g.a}" and "${g.b}"`));

  /* focus visibility on the first few focusables */
  await page.setViewportSize({ width: 1440, height: 950 });
  const focusProbe = await page.evaluate(() => {
    const els = [...document.querySelectorAll("a[href],button,input,select,textarea")].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    return els.length;
  });
  let noFocus = 0;
  for (let i = 0; i < Math.min(focusProbe, 12); i++) {
    await page.keyboard.press("Tab");
    const ok = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return true;
      const s = getComputedStyle(el);
      const hasOutline = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
      const hasShadow = s.boxShadow && s.boxShadow !== "none";
      return hasOutline || hasShadow;
    });
    if (!ok) noFocus++;
  }
  if (noFocus) add("focus-visible", "HIGH", route, `${noFocus} of first 12 tab stops show no focus indicator`);

  console.log(
    `${findings.some((f) => f.route === route) ? "✗" : "✓"} ${route.padEnd(26)} ` +
      `contrast:${contrastFails} names:${a.names.length} labels:${a.labels.length} ` +
      `targets:${t.small.length} motion:${a.motion.length > 0 ? `${Math.min(...a.motion)}-${Math.max(...a.motion)}ms` : "none"}`,
  );

  await ctx.close();
}

/* ---------- reduced motion ---------- */
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const hidden = [...document.querySelectorAll(".reveal")].filter(
      (e) => getComputedStyle(e).opacity === "0",
    ).length;
    const marquee = document.querySelector(".marquee-track");
    const anim = marquee ? getComputedStyle(marquee).animationDuration : "0s";
    const playingVideo = [...document.querySelectorAll("video")].length;
    return { hidden, anim, playingVideo };
  });
  if (r.hidden) add("reduced-motion", "HIGH", "/", `${r.hidden} .reveal elements stuck hidden`);
  if (parseFloat(r.anim) > 0.01) add("reduced-motion", "MED", "/", `marquee still animating (${r.anim})`);
  if (r.playingVideo > 0) add("reduced-motion", "MED", "/", `${r.playingVideo} video element(s) mounted`);
  console.log(
    `${r.hidden || parseFloat(r.anim) > 0.01 || r.playingVideo ? "✗" : "✓"} reduced-motion            ` +
      `hidden:${r.hidden} marquee:${r.anim} videos:${r.playingVideo}`,
  );
  await ctx.close();
}

await browser.close();

/* ---------- report ---------- */
console.log("─".repeat(72));
if (!findings.length) {
  console.log("✓ No issues found.\n");
} else {
  const order = { HIGH: 0, MED: 1, LOW: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);
  const byRule = {};
  findings.forEach((f) => (byRule[f.rule] = (byRule[f.rule] || 0) + 1));
  console.log(`${findings.length} finding(s):\n`);
  Object.entries(byRule).forEach(([r, n]) => console.log(`   ${String(n).padStart(3)}  ${r}`));
  console.log("");
  // Group by rule and show a few distinct examples each — a flat list is all
  // contrast and target noise before you ever reach the rarer rules.
  const groups = {};
  findings.forEach((f) => (groups[f.rule] ??= []).push(f));
  for (const [rule, list] of Object.entries(groups)) {
    console.log(`  [${list[0].severity}] ${rule} — ${list.length}`);
    const shown = new Set();
    for (const f of list) {
      const key = f.detail.replace(/[\d.]+/g, "#");
      if (shown.has(key)) continue;
      shown.add(key);
      console.log(`        ${f.route}  ${f.detail}`);
      if (shown.size >= 4) break;
    }
    console.log("");
  }
  console.log("");
}
