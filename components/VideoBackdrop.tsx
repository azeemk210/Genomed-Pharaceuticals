"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Looping background video with a poster fallback.
 *
 * Rules this enforces, which cheap video heroes usually get wrong:
 *  - `prefers-reduced-motion` gets the poster frame, never a moving picture.
 *  - Save-Data / 2G connections get the poster frame — this audience is often
 *    on a rural mobile connection.
 *  - The video only loads once it is near the viewport.
 *  - If autoplay is refused by the browser, the poster stays and nothing breaks.
 */
export default function VideoBackdrop({
  src,
  poster,
  className = "",
  kenburns = false,
}: {
  src: string;
  poster: string;
  className?: string;
  kenburns?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    type NetworkInformation = { saveData?: boolean; effectiveType?: string };
    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const frugal = Boolean(
      conn?.saveData || (conn?.effectiveType && /2g/.test(conn.effectiveType)),
    );

    if (reduced || frugal) return;

    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    // Autoplay can still be refused; the poster underneath covers that case.
    videoRef.current?.play().catch(() => {});
  }, [active]);

  return (
    <div ref={wrapRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Poster is always painted, so the first frame is never empty. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover ${kenburns ? "kenburns" : ""}`}
      />
      {active && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
