"use client";

import { useEffect, useRef } from "react";

/**
 * Counts up once, when the figure first scrolls into view.
 *
 * Writes to the DOM node directly rather than holding the tween in React
 * state: a state-driven count re-renders the component on every animation
 * frame for no benefit, and setting state from inside the effect would cascade
 * renders during commit.
 */
export default function Counter({
  to,
  suffix = "",
  duration = 1400,
  className = "",
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const write = (n: number) => {
      el.textContent = `${n}${suffix}`;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      write(to);
      return;
    }

    // Rewind the server-rendered figure so it can count up to it.
    write(0);

    let frame = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        write(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        run();
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, suffix, duration]);

  // Server-renders the real figure, so the number is correct with JavaScript
  // disabled and for crawlers. The effect rewinds it to 0 before animating.
  return (
    <span ref={ref} className={`tnum ${className}`}>
      {to}
      {suffix}
    </span>
  );
}
