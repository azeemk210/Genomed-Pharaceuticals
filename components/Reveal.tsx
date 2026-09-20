"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Scroll reveal.
 *
 * Deliberately CSS-driven rather than a motion library: the element ships
 * visible-on-`is-in` and `prefers-reduced-motion` neutralises it in CSS, so a
 * JS failure can never leave content invisible — the classic reveal bug.
 */
/* One observer for every Reveal on the page. Each instance used to measure
   itself with getBoundingClientRect and then write a class; forty of those in
   a row is forty forced layouts during hydration. The observer's first
   callback reports the same geometry without forcing anything. */
let shared: IntersectionObserver | null = null;
let watched = 0;

function observe(el: Element) {
  shared ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        /* On screen, just under the fold, or already scrolled past (a refresh
           partway down the page, a deep link to an #anchor) shows straight
           away rather than waiting for a scroll that may never come. */
        const near = entry.boundingClientRect.top < window.innerHeight * 1.05;
        if (!entry.isIntersecting && !near) continue;
        entry.target.classList.add("is-in");
        shared?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: [0, 0.08] },
  );
  shared.observe(el);
  watched++;
  return () => {
    shared?.unobserve(el);
    if (--watched === 0) {
      shared?.disconnect();
      shared = null;
    }
  };
}

export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  variant = "up",
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  variant?: "up" | "line";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.classList.add("is-in");
      return;
    }
    return observe(el);
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${variant === "line" ? "draw-line" : "reveal"} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
