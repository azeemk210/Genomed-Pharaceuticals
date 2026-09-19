"use client";

import { useEffect, useState } from "react";
import { AddToCartButton } from "./AddToCart";
import { price } from "@/lib/format";
import type { Product } from "@/lib/products";

/**
 * Phone-only buy bar for the product page. Slides up once the main buy box has
 * scrolled off the top, so the add control is never more than a thumb away
 * while someone reads the details; slides away again when the footer arrives,
 * so it never sits over the page's last content.
 *
 * It shares the cart-bound Add ⇄ stepper control with the cards, so it always
 * shows the real quantity. While hidden it is inert — out of the tab order and
 * the accessibility tree — rather than merely translated off screen.
 */
export default function StickyBuyBar({ product, watchId }: { product: Product; watchId: string }) {
  const [past, setPast] = useState(false);
  const [atFooter, setAtFooter] = useState(false);

  useEffect(() => {
    const box = document.getElementById(watchId);
    if (!box) return;
    const boxIo = new IntersectionObserver(([e]) =>
      setPast(!e.isIntersecting && e.boundingClientRect.top < 0),
    );
    boxIo.observe(box);
    const foot = document.querySelector("footer");
    const footIo = new IntersectionObserver(([e]) => setAtFooter(e.isIntersecting));
    if (foot) footIo.observe(foot);
    return () => {
      boxIo.disconnect();
      footIo.disconnect();
    };
  }, [watchId]);

  const show = past && !atFooter;

  return (
    <div
      inert={!show}
      aria-hidden={!show}
      // z-30: under the mobile menu (40) and filter sheet (60), over the page.
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-raise-lg backdrop-blur-sm transition-transform duration-300 ease-out lg:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-forest-950">{product.name}</p>
          <p className="tnum font-display text-lg leading-tight font-semibold text-forest-900">
            {price(product.mrp)}
          </p>
        </div>
        <AddToCartButton product={product} announce={false} className="w-36 flex-none" />
      </div>
    </div>
  );
}
