"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check, Minus, Plus, Heart } from "lucide-react";
import { useStore } from "./StoreProvider";
import type { Product } from "@/lib/products";

/** Compact button used on product cards. */
export function AddToCartButton({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const { add } = useStore();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1800);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <button
      type="button"
      onClick={(e) => {
        // The card is a link; adding must not navigate away from the grid.
        e.preventDefault();
        e.stopPropagation();
        add(product.slug, 1);
        setDone(true);
      }}
      aria-label={done ? `${product.name} added to enquiry` : `Add ${product.name} to enquiry`}
      className={`inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2 text-sm font-bold transition-colors duration-200 ${
        done
          ? "bg-forest-50 text-forest-800"
          : "bg-forest-700 text-white hover:bg-forest-800"
      } ${className}`}
    >
      {done ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {done ? "Added" : "Add"}
    </button>
  );
}

/**
 * Heart toggle for the saved list. `sm` is for the corner of a product image,
 * where a 44px square would take a quarter of a phone-width card; 36px still
 * clears the WCAG 2.5.8 target minimum with room to spare.
 */
export function SaveButton({
  product,
  className = "",
  size = "md",
}: {
  product: Product;
  className?: string;
  size?: "sm" | "md";
}) {
  const { isSaved, toggleSaved, ready } = useStore();
  const on = ready && isSaved(product.slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(product.slug);
      }}
      aria-pressed={on}
      aria-label={on ? `Remove ${product.name} from saved` : `Save ${product.name}`}
      className={`grid place-items-center border transition-colors duration-200 ${
        // sm keeps a 36px square but a 44px hit area: the pseudo-element
        // extends the tappable box without growing the icon over a phone-width
        // card photo. 5px, not 4: an absolute child is offset from the padding
        // box, i.e. inside the 1px border, so 34 + 2×5 = 44.
        size === "sm"
          ? "h-9 w-9 before:absolute before:-inset-[5px] before:content-['']"
          : "h-11 w-11"
      } ${
        on
          ? "border-gold-600 bg-gold-50 text-gold-700"
          : size === "sm"
            ? // Floats on a photo: no outline, a frosted fill so it reads on any pack.
              "border-transparent bg-white/90 text-sand-700 shadow-sm backdrop-blur-sm hover:text-forest-700"
            : "border-sand-300 bg-white text-sand-600 hover:border-forest-600 hover:text-forest-700"
      } ${className}`}
    >
      <Heart className="h-4 w-4" fill={on ? "currentColor" : "none"} />
    </button>
  );
}

/** Full quantity stepper + add, used on the product detail page. */
export function AddToCartPanel({ product }: { product: Product }) {
  const { add } = useStore();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 2600);
    return () => clearTimeout(t);
  }, [done]);

  const step = (d: number) => setQty((q) => Math.min(999, Math.max(1, q + d)));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-stretch gap-3">
        <div
          className="inline-flex items-stretch border border-sand-300 bg-white"
          role="group"
          aria-label="Quantity"
        >
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="grid w-11 place-items-center text-forest-800 transition-colors hover:bg-sand-50 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            min={1}
            max={999}
            value={qty}
            aria-label={`Quantity of ${product.name}`}
            onChange={(e) => setQty(Math.min(999, Math.max(1, Number(e.target.value) || 1)))}
            className="tnum w-14 border-x border-sand-300 bg-white text-center text-base font-bold text-forest-950 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-forest-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Increase quantity"
            className="grid w-11 place-items-center text-forest-800 transition-colors hover:bg-sand-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            add(product.slug, qty);
            setDone(true);
          }}
          className="group inline-flex min-h-11 flex-1 items-center justify-center gap-2 bg-forest-700 px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-forest-800 sm:flex-none"
        >
          <ShoppingBag className="h-4 w-4" />
          Add to enquiry
        </button>

        <SaveButton product={product} className="h-auto min-h-11" />
      </div>

      <p role="status" aria-live="polite" className="min-h-6 text-sm">
        {done ? (
          <span className="inline-flex items-center gap-2 font-semibold text-forest-800">
            <Check className="h-4 w-4" />
            Added —{" "}
            <Link href="/cart" className="underline underline-offset-2">
              review your enquiry list
            </Link>
          </span>
        ) : (
          <span className="text-sand-600">
            Add items to build an order enquiry. We reply with pricing and availability.
          </span>
        )}
      </p>
    </div>
  );
}
