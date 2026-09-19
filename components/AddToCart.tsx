"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { ShoppingBag, Check, Minus, Plus, Heart, Trash2, ArrowRight } from "lucide-react";
import { useStore } from "./StoreProvider";
import type { Product } from "@/lib/products";

const MAX_QTY = 999;

/** Quantity of one product already in the enquiry list (0 = not in it). */
function useLineQty(slug: string) {
  const { cart, ready } = useStore();
  // Before hydration the store is empty, so the server and first client render
  // agree on "Add"; the stepper appears once the saved list has loaded.
  return ready ? (cart.find((l) => l.slug === slug)?.qty ?? 0) : 0;
}

/**
 * Moves focus across the Add ⇄ stepper swap. The control a keyboard user just
 * pressed unmounts, which would otherwise drop focus to <body>. It only acts on
 * a swap the user caused, so it never steals focus on page load.
 */
function useSwapFocus(qty: number) {
  const addRef = useRef<HTMLButtonElement>(null);
  const incRef = useRef<HTMLButtonElement>(null);
  const focusNextRef = useRef<"inc" | "add" | null>(null);
  useEffect(() => {
    if (focusNextRef.current === "inc" && qty > 0) incRef.current?.focus();
    if (focusNextRef.current === "add" && qty === 0) addRef.current?.focus();
    focusNextRef.current = null;
  }, [qty]);
  return { addRef, incRef, focusNextRef };
}

/**
 * The quantity stepper — the standard in-cart control. Bound to the store, so
 * it shows what is actually in the list on every page and survives a reload.
 * At 1 the minus becomes a delete; typing 0 removes too. The number is
 * editable, because distributors order in dozens and hundreds, not one tap at
 * a time.
 */
export function QtyStepper({
  product,
  qty,
  size,
  incRef,
  onEmptied,
  className = "",
}: {
  product: Product;
  qty: number;
  size: "sm" | "lg";
  incRef?: RefObject<HTMLButtonElement | null>;
  onEmptied?: () => void;
  className?: string;
}) {
  const { setQty } = useStore();
  // Draft while typing, so clearing the field to retype does not delete the line.
  const [draft, setDraft] = useState<string | null>(null);
  const set = (n: number) => {
    if (n <= 0) {
      onEmptied?.();
      setQty(product.slug, 0);
    } else setQty(product.slug, Math.min(n, MAX_QTY));
  };
  const btn = `grid flex-none place-items-center transition-colors duration-200 hover:bg-forest-800 focus-visible:outline-offset-[-3px] disabled:cursor-not-allowed disabled:opacity-40 ${
    size === "lg" ? "w-14" : "w-9 pointer-coarse:w-11"
  }`;

  return (
    <div
      role="group"
      aria-label={`Quantity of ${product.name} in enquiry list`}
      className={`flex items-stretch divide-x divide-forest-600 overflow-hidden bg-forest-700 text-white ${
        size === "lg" ? "h-14" : "h-10 pointer-coarse:h-11"
      } ${className}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          set(qty - 1);
        }}
        aria-label={
          qty <= 1 ? `Remove ${product.name} from enquiry list` : `Decrease quantity of ${product.name}`
        }
        className={btn}
      >
        {qty <= 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="done"
        value={draft ?? String(qty)}
        aria-label={`Quantity of ${product.name}`}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "").slice(0, 3);
          setDraft(v);
          if (Number(v) > 0) setQty(product.slug, Number(v));
        }}
        onBlur={() => {
          // Blank reverts to the current quantity; an explicit 0 removes.
          if (draft === "0") set(0);
          setDraft(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        // w-0: a text input's intrinsic width (~20ch) counts toward its row's
        // min-content even with min-w-0, and pushed phone layouts off screen.
        size={3}
        className={`tnum w-0 min-w-0 flex-1 bg-transparent text-center font-bold text-white focus-visible:bg-forest-800 focus-visible:outline-offset-[-3px] ${
          size === "lg" ? "text-lg" : "text-base"
        }`}
      />

      <button
        ref={incRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          set(qty + 1);
        }}
        disabled={qty >= MAX_QTY}
        aria-label={`Increase quantity of ${product.name}`}
        className={btn}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Card control: "Add", then — once the product is in the list — the stepper,
 * in the same footprint, for as long as it stays there. Replaces a button that
 * flashed "Added" for 1.8s and then forgot, so a shopper could not tell from
 * the grid what they had already added.
 */
export function AddToCartButton({
  product,
  className = "",
  announce = true,
}: {
  product: Product;
  className?: string;
  /** Off where another live region already reports the same change. */
  announce?: boolean;
}) {
  const { add } = useStore();
  const qty = useLineQty(product.slug);
  const { addRef, incRef, focusNextRef } = useSwapFocus(qty);

  return (
    <>
      {qty > 0 ? (
        <QtyStepper
          product={product}
          qty={qty}
          size="sm"
          incRef={incRef}
          onEmptied={() => (focusNextRef.current = "add")}
          className={className}
        />
      ) : (
        <button
          ref={addRef}
          type="button"
          onClick={(e) => {
            // The card is a link; adding must not navigate away from the grid.
            e.preventDefault();
            e.stopPropagation();
            focusNextRef.current = "inc";
            add(product.slug, 1);
          }}
          aria-label={`Add ${product.name} to enquiry`}
          className={`inline-flex h-10 items-center justify-center gap-2 bg-forest-700 px-3 text-sm font-bold whitespace-nowrap text-white pointer-coarse:h-11 transition-colors duration-200 hover:bg-forest-800 ${className}`}
        >
          <ShoppingBag className="h-4 w-4" />
          Add
        </button>
      )}
      {announce && (
        <span className="sr-only" aria-live="polite">
          {qty > 0 ? `${qty} ${product.name} in enquiry list` : ""}
        </span>
      )}
    </>
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

/**
 * Product-page control: a large "Add to enquiry", which becomes the stepper once
 * the product is in the list — the same model as the cards, so the page and the
 * grid never disagree about the quantity.
 */
export function AddToCartPanel({ product }: { product: Product }) {
  const { add } = useStore();
  const qty = useLineQty(product.slug);
  const { addRef, incRef, focusNextRef } = useSwapFocus(qty);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-stretch gap-3">
        {qty > 0 ? (
          <QtyStepper
            product={product}
            qty={qty}
            size="lg"
            incRef={incRef}
            onEmptied={() => (focusNextRef.current = "add")}
            className="flex-1 sm:w-60 sm:flex-none"
          />
        ) : (
          <button
            ref={addRef}
            type="button"
            onClick={() => {
              focusNextRef.current = "inc";
              add(product.slug, 1);
            }}
            className="inline-flex h-14 flex-1 items-center justify-center gap-2 bg-forest-700 px-7 text-sm font-bold whitespace-nowrap text-white transition-colors duration-200 hover:bg-forest-800 sm:w-60 sm:flex-none"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to enquiry
          </button>
        )}

        <SaveButton product={product} className="h-14 w-14" />
      </div>

      <p role="status" aria-live="polite" className="min-h-6 text-sm">
        {qty > 0 ? (
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-forest-800">
            <Check className="h-4 w-4" aria-hidden="true" />
            {qty} in your enquiry list
            <Link
              href="/cart"
              className="group inline-flex items-center gap-1 py-1 underline underline-offset-2 pointer-coarse:min-h-11 pointer-coarse:py-3"
            >
              Review list
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
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
