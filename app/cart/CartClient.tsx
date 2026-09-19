"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Trash2, ShoppingBag, ArrowRight, Heart, ChevronRight, X } from "lucide-react";
import PackShot from "@/components/PackShot";
import ProductCard from "@/components/ProductCard";
import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import { QtyStepper } from "@/components/AddToCart";
import { useStore, type CartLine } from "@/components/StoreProvider";
import { inr, price } from "@/lib/format";
import { getTherapy, discountPct, products, type Product } from "@/lib/products";

/**
 * Products not yet in the list, the ones from the same therapeutic areas as
 * what is listed first, then featured, then the rest — at most four.
 */
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
                Enquiry list
              </span>
            </li>
          </ol>
        </nav>
        <h1 className="mt-2 text-4xl">
          Enquiry list
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

/**
 * Undo for removals. The live region stays mounted and only its content
 * changes, so the message is announced; it never takes focus. Dismisses itself
 * after 8s, but not while it is hovered or holds focus.
 */
function UndoToast({
  undo,
  onUndo,
  onDismiss,
}: {
  undo: { label: string } | null;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      {undo && <ToastBody key={undo.label} label={undo.label} onUndo={onUndo} onDismiss={onDismiss} />}
    </div>
  );
}

function ToastBody({
  label,
  onUndo,
  onDismiss,
}: {
  label: string;
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

  return (
    <div
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className="sheet-up pointer-events-auto flex w-full max-w-md items-center gap-2 bg-forest-950 py-1.5 pr-1.5 pl-5 text-sm text-white shadow-raise-lg"
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
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
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const emptyRef = useRef<HTMLHeadingElement>(null);
  const [undo, setUndo] = useState<{ label: string; lines: CartLine[] } | null>(null);
  // Where focus goes once the list re-renders: a row's slug, or "" for the
  // empty state. The control that was pressed unmounts with its row.
  const focusNext = useRef<string | null>(null);

  /** Every removal goes through here, so every removal can be undone. */
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

  // The form opens below the whole list, usually off screen, and the button
  // that opened it unmounts. Bring it into view and hand it the focus.
  useEffect(() => {
    if (!showForm || !formRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    formRef.current.focus({ preventScroll: true });
    formRef.current.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [showForm]);

  // Last child of both the empty and the full view, so it stays mounted across
  // "Clear the list" and its live region still announces.
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

  // Until localStorage has been read, render a neutral shell rather than an
  // "empty" message that would flash for anyone with a full list.
  if (!ready) {
    return (
      <>
        <TitleBar count={0} />
        <div className="shell py-24" aria-busy="true" />
      </>
    );
  }

  if (count === 0) {
    return (
      <>
        <TitleBar count={0} />
        <section className="shell py-14 md:py-20">
          <div className="mx-auto grid max-w-xl justify-items-center gap-5 border border-dashed border-sand-300 px-6 py-16 text-center">
            <span className="grid h-16 w-16 place-items-center bg-sand-100 text-sand-600">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <h2 ref={emptyRef} tabIndex={-1} className="text-3xl outline-none">
              Your enquiry list is empty
            </h2>
            <p className="text-sand-600">
              Add the formulations you are interested in and send them to us in one go. We
              reply with trade pricing, minimum order quantities and availability for your
              territory.
            </p>
            <Link
              href="/products"
              className="group mt-2 inline-flex items-center gap-2 bg-forest-700 px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-forest-800"
            >
              Browse the portfolio
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
        <Suggestions items={suggestions([], [])} title="Popular formulations" />
        {toast}
      </>
    );
  }

  // A plain-text summary of the list, prefilled into the enquiry message.
  const summary =
    rows
      .map((r) => `${r.qty} × ${r.product.name} (${r.product.pack}) — ${inr(r.product.mrp * r.qty)}`)
      .join("\n") + `\n\nItems: ${count}\nIndicative total at MRP: ${inr(subtotal)}`;

  const also = suggestions(
    rows.map((r) => r.slug),
    rows.map((r) => r.product.therapy),
  );

  return (
    <>
      <TitleBar count={count} />

      <section className="shell grid gap-10 py-8 md:py-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <div>
          {/* Between the h1 and the rows' h3s, for navigation by heading. */}
          <h2 className="sr-only">Items in your list</h2>
          <ul className="border-t border-sand-200">
            {rows.map((r) => {
              const therapy = getTherapy(r.product.therapy);
              const off = discountPct(r.product);
              return (
                <li
                  key={r.slug}
                  data-row={r.slug}
                  className="grid grid-cols-[5.5rem_1fr] items-start gap-4 border-b border-sand-200 py-5 sm:grid-cols-[6.5rem_1fr_auto] sm:gap-6"
                >
                  {/* Absolute inset, not a centred grid cell: an auto-height cell
                      gives the image's h-full nothing definite to resolve against,
                      so a portrait pack sizes from its width and overflows. */}
                  <Link
                    href={`/products/${r.slug}`}
                    className="product-stage relative block aspect-square overflow-hidden border border-sand-200"
                  >
                    <span className="pack-blend absolute inset-[10%]">
                      <PackShot
                        form={r.product.form}
                        name={r.product.name}
                        pack={r.product.pack}
                        photo={r.product.photo}
                      />
                    </span>
                  </Link>

                  <div className="min-w-0">
                    <p className="text-[0.75rem] font-bold tracking-[0.14em] text-gold-700 uppercase">
                      {therapy?.name}
                    </p>
                    <h3 className="mt-1 text-xl">
                      <Link href={`/products/${r.slug}`} className="hover:text-forest-700">
                        {r.product.name}
                      </Link>
                    </h3>
                    <p className="mt-0.5 text-sm text-sand-600">
                      {r.product.form} · {r.product.pack} · {price(r.product.mrp)} each
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-1 sm:gap-x-3">
                      {/* Same control as the cards and product page, so the
                          three never disagree. */}
                      <QtyStepper
                        product={r.product}
                        qty={r.qty}
                        size="sm"
                        onEmptied={() => drop(r.slug, () => {})}
                        className="mr-[calc(100%-8rem)] w-32 shrink-0 sm:mr-0"
                      />

                      <button
                        type="button"
                        onClick={() => toggleSaved(r.slug)}
                        aria-pressed={isSaved(r.slug)}
                        className="-ml-2 inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-sand-600 hover:text-forest-700 sm:ml-0"
                      >
                        <Heart className="h-4 w-4" fill={isSaved(r.slug) ? "currentColor" : "none"} />
                        {/* Short label below sm, so Save and Remove share one
                            line beside an 88px thumbnail on a 320px screen. */}
                        {isSaved(r.slug) ? (
                          "Saved"
                        ) : (
                          <>
                            Save<span className="hidden sm:inline"> for later</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => drop(r.slug, () => remove(r.slug))}
                        aria-label={`Remove ${r.product.name} from the enquiry list`}
                        className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-sand-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>

                  <p className="col-start-2 flex flex-col items-start sm:col-start-3 sm:items-end">
                    <span className="tnum font-display text-2xl font-semibold text-forest-800">
                      {inr(r.product.mrp * r.qty)}
                    </span>
                    {off > 0 && r.product.listPrice && (
                      <s className="tnum text-sm text-sand-600">{inr(r.product.listPrice * r.qty)}</s>
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
              Clear the list
            </button>
          </div>
        </div>

        {/* ---- summary ---- */}
        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="border border-sand-200 bg-sand-50 p-6 md:p-7">
            <h2 className="text-2xl">Enquiry summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-sand-600">Items</dt>
                <dd className="tnum font-semibold text-forest-950">{count}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-sand-600">Total at MRP</dt>
                <dd className="tnum font-semibold text-forest-950">{inr(subtotal)}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-sand-600">Off list price</dt>
                  <dd className="tnum font-semibold text-forest-700">−{inr(savings)}</dd>
                </div>
              )}
            </dl>

            <p className="mt-5 border-t border-sand-200 pt-4 text-sm leading-relaxed text-sand-600">
              Figures are indicative MRP, not a quotation. Trade pricing, margins and minimum
              order quantities are confirmed in our reply.
            </p>

            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="group mt-6 flex w-full items-center justify-center gap-2 bg-forest-700 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-forest-800"
              >
                Send this enquiry
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </aside>

        {/* ---- order enquiry form ---- */}
        {showForm && (
          <div
            ref={formRef}
            id="send"
            tabIndex={-1}
            role="region"
            aria-label="Send your enquiry"
            className="scroll-mt-44 outline-none lg:col-span-2"
          >
            <div className="mb-8 max-w-2xl">
              <Reveal>
                <Eyebrow>Send your enquiry</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-5 text-3xl">Where should we send the quotation?</h2>
              </Reveal>
              <Reveal delay={140}>
                <p className="mt-4 text-sand-600">
                  Your list is attached to the message below. Add your territory and expected
                  monthly volumes and we will come back within two working days.
                </p>
              </Reveal>
            </div>
            <EnquiryForm
              subject="Bulk or institutional order"
              prefillMessage={`Order enquiry — ${count} item${count === 1 ? "" : "s"}:\n\n${summary}`}
            />
          </div>
        )}
      </section>

      <Suggestions items={also} title="You may also need" />
      {toast}
    </>
  );
}
