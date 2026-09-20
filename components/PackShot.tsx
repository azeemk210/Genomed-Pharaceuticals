"use client";

import { useId } from "react";
import Image from "next/image";
import type { Product } from "@/lib/products";

/**
 * Generated pack shot.
 *
 * Genomed has no photographed packs yet, and a stretched or missing image looks
 * worse than none. This draws the correct container for each dosage form.
 *
 * Colours are applied through inline `style` rather than `fill="var(--x)"` —
 * browsers do not resolve custom properties inside SVG presentation attributes.
 *
 * To use real photography later: save to /public/products/<slug>.jpg and pass
 * `photo` on the product. See README.md.
 */

const c = (token: string) => ({ fill: `var(--color-${token})` });

export default function PackShot({
  form,
  name,
  pack,
  photo,
  className = "",
  sizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
  priority = false,
}: {
  form: Product["form"];
  name: string;
  pack?: string;
  photo?: string;
  className?: string;
  /** Rendered width, so the browser fetches a pack sized for its slot. */
  sizes?: string;
  /** The page's main image: fetched eagerly, not lazily. */
  priority?: boolean;
}) {
  const gid = useId().replace(/:/g, "");
  const isBottle = form === "Syrup" || form === "Liquid";

  if (photo) {
    // `fill` against the positioned wrapper every caller already provides.
    // The source photos are 400–800px wide; a phone card shows them at ~150px.
    return (
      <Image
        src={photo}
        alt={`${name} — ${pack ?? form} pack`}
        fill
        sizes={sizes}
        // Next 16 deprecates `priority`; its docs recommend these two instead.
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={`object-contain ${className}`}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 160 200"
      role="img"
      aria-label={`${name}, ${form.toLowerCase()} presentation`}
      className={`h-full w-auto max-w-full drop-shadow-[0_18px_26px_rgba(4,18,15,0.24)] ${className}`}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: "var(--color-forest-600)" }} />
          <stop offset="42%" style={{ stopColor: "var(--color-forest-800)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-forest-990)" }} />
        </linearGradient>
      </defs>

      {isBottle && (
        <g>
          <rect x="66" y="16" width="28" height="16" style={c("forest-900")} />
          <rect x="63" y="30" width="34" height="9" style={c("gold-600")} />
          <path
            d="M68 39h24c0 8 14 12 14 26v104a6 6 0 0 1-6 6H60a6 6 0 0 1-6-6V65c0-14 14-18 14-26Z"
            fill={`url(#${gid})`}
          />
          <rect x="58" y="92" width="44" height="54" style={{ fill: "var(--color-sand-50)" }} />
          <rect x="64" y="100" width="32" height="3" style={c("forest-700")} />
          <rect x="64" y="108" width="24" height="2.5" style={c("sand-400")} />
          <rect x="64" y="115" width="28" height="2.5" style={c("sand-400")} />
          <rect x="64" y="130" width="14" height="6" style={c("gold-500")} />
          <path
            d="M62 50c0 10-4 14-4 26v58"
            fill="none"
            strokeWidth={3}
            strokeLinecap="round"
            style={{ stroke: "rgba(255,255,255,0.2)" }}
          />
        </g>
      )}

      {form === "Powder" && (
        <g>
          <rect x="44" y="24" width="72" height="18" style={c("gold-600")} />
          <path
            d="M50 42h60a10 10 0 0 1 10 10v114a6 6 0 0 1-6 6H46a6 6 0 0 1-6-6V52a10 10 0 0 1 10-10Z"
            fill={`url(#${gid})`}
          />
          <rect x="46" y="86" width="68" height="60" style={{ fill: "var(--color-sand-50)" }} />
          <rect x="54" y="96" width="42" height="3.5" style={c("forest-700")} />
          <rect x="54" y="105" width="30" height="2.5" style={c("sand-400")} />
          <rect x="54" y="112" width="36" height="2.5" style={c("sand-400")} />
          <rect x="54" y="128" width="16" height="7" style={c("gold-500")} />
          <path
            d="M48 54v112"
            fill="none"
            strokeWidth={3}
            strokeLinecap="round"
            style={{ stroke: "rgba(255,255,255,0.18)" }}
          />
        </g>
      )}

      {form === "Capsule" && (
        <g>
          <rect x="28" y="34" width="104" height="132" fill={`url(#${gid})`} />
          <rect x="38" y="46" width="84" height="30" style={{ fill: "var(--color-sand-50)" }} />
          <rect x="46" y="54" width="46" height="4" style={c("forest-700")} />
          <rect x="46" y="63" width="30" height="3" style={c("sand-400")} />
          {[92, 116].map((y) =>
            [44, 84].map((x) => (
              <g key={`${x}-${y}`}>
                <rect x={x} y={y} width="34" height="15" rx="7.5" style={c("gold-400")} />
                <path
                  d={`M${x + 17} ${y}h9a7.5 7.5 0 0 1 0 15h-9Z`}
                  style={c("gold-200")}
                />
              </g>
            )),
          )}
          <rect x="44" y="142" width="18" height="7" style={c("gold-500")} />
        </g>
      )}
    </svg>
  );
}
