"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Scroll reveal.
 *
 * Deliberately CSS-driven rather than a motion library: the element ships
 * visible-on-`is-in` and `prefers-reduced-motion` neutralises it in CSS, so a
 * JS failure can never leave content invisible — the classic reveal bug.
 */
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

    /* Anything already on screen (or scrolled past, e.g. on a refresh partway
       down the page, or a deep link to an #anchor) is shown straight away
       rather than waiting for a scroll that may never come. */
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.05) {
      el.classList.add("is-in");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    io.observe(el);
    return () => io.disconnect();
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
