"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Trash2, ShoppingBag, ArrowRight, Heart, ChevronRight, X, ShieldCheck, Truck } from "lucide-react";
import PackShot from "@/components/PackShot";
import ProductCard from "@/components/ProductCard";
import { QtyStepper } from "@/components/AddToCart";
import { useStore, type CartLine } from "@/components/StoreProvider";
import { inr } from "@/lib/format";
import { getTherapy, discountPct, products, type Product } from "@/lib/products";

const FREE_SHIPPING_THRESHOLD = 499;
const STANDARD_SHIPPING_FEE = 50;

function suggestions(inList: string[], areas: string[]): Product[] {
  const rank = (p: Product) => (areas.includes(p.therapy) ? 0 : p.featured ? 1 : 2);
  return products
    .filter((p) => !inList.includes(p.slug))
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, 4);
}

function TitleBar({ count }: { count: number }) {
  return (
    <section className="border-b border-sand-200 bg-sand-50">
      <div className="shell py-6 md:py-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-caption text-sand-700">
            <li>
              <Link
                href="/"
                className="inline-block py-1 hover:text-forest-700 pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:py-3"
              >
                Home
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="h-3 w-3 text-sand-400" aria-hidden="true" />
              <span aria-current="page" className="font-semibold text-forest-900">
                Shopping Cart
              </span>
            </li>
          </ol>
        </nav>
        <h1 className="mt-2 text-4xl">
          Shopping Cart
          {count > 0 && (
            <span className="tnum ml-3 align-middle font-sans text-lg font-semibold text-sand-600">
              {count} {count === 1 ? "item" : "items"}
            </span>
          )}
        </h1>
      </div>
    </section>
  );
}

function Suggestions({ items, title }: { items: Product[]; title: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="suggest" className="border-t border-sand-200 bg-sand-50 py-14 md:py-20">
      <div className="shell">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 id="suggest" className="text-3xl">
            {title}
          </h2>
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 py-1 text-sm font-bold text-forest-700 pointer-coarse:min-h-11 pointer-coarse:py-3"
          >
            All products
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function UndoToast({
  undo,
  onUndo,
  onDismiss,
}: {
  undo: { label: string } | null;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  const [held, setHeld] = useState(false);
  const dismiss = useRef(onDismiss);
  useEffect(() => {
    dismiss.current = onDismiss;
  });
  useEffect(() => {
    if (held) return;
    const t = window.setTimeout(() => dismiss.current(), 8000);
    return () => window.clearTimeout(t);
  }, [held]);

  if (!undo) return null;

  return (
    <div
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 pointer-events-auto flex w-full max-w-md items-center gap-2 bg-forest-950 py-2.5 pr-2 pl-5 text-sm text-white shadow-raise-lg"
    >
      <span className="min-w-0 flex-1 truncate">{undo.label}</span>
      <button
        type="button"
        onClick={onUndo}
        className="min-h-11 flex-none px-4 font-bold text-gold-300 underline underline-offset-2 hover:text-gold-200 focus-visible:outline-gold-300"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="grid h-11 w-11 flex-none place-items-center text-white/80 hover:text-white focus-visible:outline-gold-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function CartClient() {
  const { ready, cart, rows, count, subtotal, savings, remove, clear, restore, toggleSaved, isSaved } =
    useStore();
  const emptyRef = useRef<HTMLHeadingElement>(null);
  const [undo, setUndo] = useState<{ label: string; lines: CartLine[] } | null>(null);
  const focusNext = useRef<string | null>(null);

  const drop = (slug: string | null, act: () => void) => {
    const at = rows.findIndex((r) => r.slug === slug);
    const neighbour = slug === null ? undefined : (rows[at + 1] ?? rows[at - 1]);
    focusNext.current = neighbour?.slug ?? "";
    setUndo({
      label: slug === null ? "List cleared" : `Removed ${rows[at]?.product.name ?? "item"}`,
      lines: cart,
    });
    act();
  };

  useEffect(() => {
    const to = focusNext.current;
    if (to === null) return;
    focusNext.current = null;
    if (to === "") emptyRef.current?.focus();
    else document.querySelector<HTMLElement>(`[data-row="${to}"] h3 a`)?.focus();
  }, [rows.length]);

  const toast = (
    <UndoToast
      undo={undo}
      onUndo={() => {
        if (!undo) return;
        focusNext.current =
          undo.lines.find((l) => !cart.some((c) => c.slug === l.slug))?.slug ?? null;
        restore(undo.lines);
        setUndo(null);
      }}
      onDismiss={() => setUndo(null)}
    />
  );

  if (!ready) {
    return (
      <>
        <TitleBar count={0} />
        <div className="shell py-16 text-center text-sand-500">Loading your cart…</div>
      </>
    );
  }

  if (count === 0) {
    const featured = products.filter((p) => p.featured).slice(0, 4);
    return (
      <>
        <TitleBar count={0} />
        <section className="shell py-16 md:py-24 text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sand-100 text-forest-700">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 ref={emptyRef} tabIndex={-1} className="mt-6 text-3xl font-display outline-none">
              Your bag is empty
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-sand-600">
              Explore our range of classical and proprietary Ayurvedic formulations with batch traceability.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex min-h-12 items-center justify-center bg-forest-700 px-7 text-sm font-bold text-white transition-colors hover:bg-forest-800"
              >
                Browse all products
              </Link>
            </div>
          </div>
        </section>
        <Suggestions items={featured} title="Popular formulations" />
        {toast}
      </>
    );
  }

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = subtotal + shippingFee;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const areas = Array.from(new Set(rows.map((r) => r.product.therapy)));
  const also = suggestions(
    rows.map((r) => r.slug),
    areas
  );

  return (
    <>
      <TitleBar count={count} />

      <section className="shell grid gap-10 py-10 lg:grid-cols-3 lg:gap-12">
        {/* ---- list ---- */}
        <div className="lg:col-span-2">
          {/* Free Shipping Progress Indicator */}
          <div className="mb-6 border border-sand-200 bg-sand-50 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-forest-900">
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-forest-700" />
                {remainingForFreeShipping > 0
                  ? `Add ${inr(remainingForFreeShipping)} more for FREE Delivery across India`
                  : "You qualify for FREE Delivery!"}
              </span>
              <span className="tnum text-sand-600">{freeShippingProgress}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sand-200">
              <div
                className="h-full bg-forest-700 transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          <ul className="divide-y divide-sand-200 border-y border-sand-200">
            {rows.map((r) => {
              const th = getTherapy(r.product.therapy);
              const off = discountPct(r.product);
              const saved = isSaved(r.slug);

              return (
                <li
                  key={r.slug}
                  data-row={r.slug}
                  className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr_auto] gap-4 sm:gap-6 py-6 items-start"
                >
                  <Link
                    href={`/products/${r.slug}`}
                    aria-label={`View ${r.product.name} details`}
                    className="product-stage relative block h-20 w-20 sm:h-[100px] sm:w-[100px] shrink-0 border border-sand-200 overflow-hidden group transition-transform duration-200 hover:scale-[1.02]"
                  >
                    <span className="pack-blend absolute inset-2 block">
                      <PackShot
                        form={r.product.form}
                        name={r.product.name}
                        pack={r.product.pack}
                        photo={r.product.photo}
                        sizes="(min-width: 640px) 100px, 80px"
                      />
                    </span>
                  </Link>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-forest-700 font-semibold">
                      {th?.name || r.product.form}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-forest-950 font-display">
                      <Link href={`/products/${r.slug}`} className="hover:text-forest-700">
                        {r.product.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-sand-600 mt-0.5">{r.product.pack}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <QtyStepper product={r.product} qty={r.qty} size="sm" />

                      <button
                        type="button"
                        onClick={() => toggleSaved(r.slug)}
                        aria-pressed={saved}
                        className="inline-flex min-h-11 items-center gap-1.5 px-2 text-xs font-semibold text-sand-600 hover:text-forest-700"
                      >
                        <Heart className={`h-4 w-4 ${saved ? "fill-gold-500 text-gold-500" : ""}`} />
                        {saved ? "Saved" : "Save for later"}
                      </button>

                      <button
                        type="button"
                        onClick={() => drop(r.slug, () => remove(r.slug))}
                        aria-label={`Remove ${r.product.name} from bag`}
                        className="inline-flex min-h-11 items-center gap-1.5 px-2 text-xs font-semibold text-sand-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>

                  <p className="col-start-2 flex flex-col items-start sm:col-start-3 sm:items-end">
                    <span className="tnum font-display text-xl font-bold text-forest-900">
                      {inr(r.product.mrp * r.qty)}
                    </span>
                    {off > 0 && r.product.listPrice && (
                      <s className="tnum text-xs text-sand-500">{inr(r.product.listPrice * r.qty)}</s>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 py-1 text-sm font-bold text-forest-700 pointer-coarse:min-h-11 pointer-coarse:py-3"
            >
              Continue browsing
            </Link>
            <button
              type="button"
              onClick={() => drop(null, clear)}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-sand-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Clear the bag
            </button>
          </div>
        </div>

        {/* ---- summary & checkout CTA ---- */}
        <aside className="lg:sticky lg:top-40 lg:max-h-[calc(100dvh-11rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
          <div className="border border-sand-200 bg-sand-50 p-6 md:p-7">
            <h2 className="text-2xl font-display text-forest-950">Order Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-sand-600">Subtotal ({count} {count === 1 ? "item" : "items"})</dt>
                <dd className="tnum font-semibold text-forest-950">{inr(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-sand-600">Delivery Fee</dt>
                <dd className="tnum font-semibold text-forest-950">
                  {shippingFee === 0 ? (
                    <span className="text-green-700 font-bold uppercase text-xs tracking-wider">FREE</span>
                  ) : (
                    inr(shippingFee)
                  )}
                </dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-sand-600">Off list price</dt>
                  <dd className="tnum font-semibold text-forest-700">−{inr(savings)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 border-t border-sand-200 pt-3 text-base">
                <dt className="font-bold text-forest-950">Grand Total</dt>
                <dd className="tnum font-bold text-forest-950 text-lg">{inr(grandTotal)}</dd>
              </div>
            </dl>

            <Link
              href="/checkout"
              className="group mt-6 flex w-full items-center justify-center gap-2 bg-forest-700 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-forest-800"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <div className="mt-6 space-y-2 border-t border-sand-200 pt-4 text-xs text-sand-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-forest-700 shrink-0" />
                <span>GMP-compliant formulations direct from Dhakauli plant</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-forest-700 shrink-0" />
                <span>Fast dispatch with Delhivery live consignment tracking</span>
              </div>
            </div>

            <p className="mt-4 text-caption text-sand-500">
              Hospital or wholesale distributor inquiry? Visit our{" "}
              <Link href="/partner" className="font-semibold text-forest-700 underline underline-offset-2">
                commercial distributor onboarding
              </Link>
              .
            </p>
          </div>
        </aside>
      </section>

      <Suggestions items={also} title="Frequently paired formulations" />
      {toast}
    </>
  );
}
