"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { getProduct } from "@/lib/products";

/**
 * Packs on white podiums, flanking the hero statement — two each side.
 *
 * On wide screens (xl) the displays sit at the viewport edges either side of
 * the centred copy: an outer pack low and in front, an inner one taller and
 * set back. Below xl there is no room beside the headline, so the same four
 * line up in one row under the buttons (the fourth drops out on phones).
 *
 * Motion is layered on separate wrappers so no two animations share a
 * `transform`:
 *   link   .pack-parallax  — follows the pointer (desktop only)
 *   └ div  .pack-enter     — the display rises in from its side, once
 *     ├ div  .pack-float   — the pack bobs above its podium
 *     │ └ .pack-shadow     — contact shadow on the podium, locked to the bob
 *     └ .podium
 *
 * Reduced motion: keyframes collapse to their end state (global rule) and the
 * pointer listener is never attached.
 *
 * Cut-outs: scripts/cutout-hero-packs.mjs for the three supplied photos (two
 * had a checkerboard painted in); kcr-powder was cut from its product photo.
 */
type Pack = {
  slug: string;
  src: string;
  w: number;
  h: number;
  outer: boolean;
  depth: number;
  enter: number;
  float: string;
  /** Hidden on phones, where four displays do not fit one row. */
  smUp?: boolean;
};

const LEFT: Pack[] = [
  { slug: "sugar-ok-liquid", src: "/hero/packs/sugar-ok.webp", w: 717, h: 1000, outer: true, depth: 0.5, enter: 520, float: "-1s" },
  { slug: "rimcuff-sf-syrup", src: "/hero/packs/rimcuff-sf.webp", w: 509, h: 690, outer: false, depth: 0.8, enter: 620, float: "-3s" },
];
const RIGHT: Pack[] = [
  { slug: "heamclear-sf-syrup", src: "/hero/packs/heamclear-sf.webp", w: 760, h: 1000, outer: false, depth: 0.8, enter: 660, float: "-4.5s" },
  { slug: "kcr-powder", src: "/hero/packs/kcr-powder.webp", w: 484, h: 726, outer: true, depth: 0.5, enter: 560, float: "-2s", smUp: true },
];

function Display({ p, fromX }: { p: Pack; fromX: string }) {
  const name = getProduct(p.slug)?.name ?? "Product";
  // --ph: pack height, --pw: podium width. Outer displays are shorter and
  // wider; inner ones taller, and raised on xl so they read as set back.
  // On xl both are sized from --side (the free space beside the headline, set
  // on the stage), not from the viewport: a 1280–1440px laptop has far less
  // room beside the copy than a wide monitor, and vw sizes ran into the text.
  const size = p.outer
    ? "z-10 [--ph:104px] [--pw:92px] sm:[--ph:128px] sm:[--pw:112px] md:[--ph:150px] md:[--pw:128px] xl:[--pw:min(calc(var(--side)*0.47),200px)] xl:[--ph:calc(var(--pw)*1.27)]"
    : "z-0 [--ph:124px] [--pw:88px] sm:[--ph:150px] sm:[--pw:106px] md:[--ph:176px] md:[--pw:122px] xl:mb-[2.6vw] xl:[--pw:min(calc(var(--side)*0.5),210px)] xl:[--ph:calc(var(--pw)*1.43)]";

  return (
    <Link
      href={`/products/${p.slug}`}
      aria-label={`${name} — view product`}
      className={`pack-parallax group pointer-events-auto relative block focus-visible:outline-offset-4 ${size} ${
        p.smUp ? "hidden sm:block" : ""
      }`}
      style={{ "--depth": p.depth } as React.CSSProperties}
    >
      <div
        className="pack-enter flex flex-col items-center"
        style={{ "--enter-delay": `${p.enter}ms`, "--from-x": fromX } as React.CSSProperties}
      >
        {/* The pack's base lands on the podium's top face, not its front edge. */}
        <div
          className="pack-float relative z-10 mb-[calc(var(--pw)*-0.1)] h-(--ph)"
          style={{ "--float-delay": p.float } as React.CSSProperties}
        >
          <Image
            src={p.src}
            alt=""
            width={p.w}
            height={p.h}
            priority
            sizes="(max-width: 1279px) 30vw, 12vw"
            className="h-full w-auto origin-bottom drop-shadow-[0_14px_16px_rgb(7_29_24/0.16)] transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03]"
          />
          <span
            aria-hidden="true"
            className="pack-shadow absolute inset-x-[10%] -bottom-1 -z-10 h-3"
            style={{ "--float-delay": p.float } as React.CSSProperties}
          />
        </div>
        <div aria-hidden="true" className="podium" />
      </div>
    </Link>
  );
}

export default function HeroPacks({ className = "" }: { className?: string }) {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    // Parallax only where it helps: a real pointer, and motion allowed.
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const mx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        const my = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        el.style.setProperty("--mx", Math.max(-1, Math.min(1, mx)).toFixed(3));
        el.style.setProperty("--my", Math.max(-1, Math.min(1, my)).toFixed(3));
      });
    };
    const onLeave = () => {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    // On xl this layer spans the viewport over the copy, so it ignores the
    // pointer itself and only the displays take clicks.
    <div
      ref={stage}
      className={`flex items-end justify-center gap-3 sm:gap-6 xl:pointer-events-none xl:absolute xl:-bottom-8 xl:left-[calc(50%-50vw)] xl:w-screen xl:justify-between xl:px-[2vw] xl:[--side:calc((100vw_-_820px)/2_-_2vw)] ${className}`}
    >
      <div className="flex items-end gap-3 sm:gap-6 xl:gap-0">
        {LEFT.map((p) => (
          <Display key={p.slug} p={p} fromX="-40px" />
        ))}
      </div>
      <div className="flex items-end gap-3 sm:gap-6 xl:gap-0">
        {RIGHT.map((p) => (
          <Display key={p.slug} p={p} fromX="40px" />
        ))}
      </div>
    </div>
  );
}
