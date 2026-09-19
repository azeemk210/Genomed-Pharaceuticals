"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Heart } from "lucide-react";
import PackShot from "@/components/PackShot";
import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import { useStore } from "@/components/StoreProvider";
import { inr } from "@/lib/format";
import { getTherapy, discountPct } from "@/lib/products";

export default function CartClient() {
  const { ready, rows, count, subtotal, savings, setQty, remove, clear, toggleSaved, isSaved } =
    useStore();
  const [showForm, setShowForm] = useState(false);

  // Until localStorage has been read, render a neutral shell rather than an
  // "empty" message that would flash for anyone with a full list.
  if (!ready) {
    return <div className="shell py-24" aria-busy="true" />;
  }

  if (count === 0) {
    return (
      <section className="shell py-16 md:py-24">
        <div className="mx-auto grid max-w-xl justify-items-center gap-5 border border-dashed border-sand-300 px-6 py-20 text-center">
          <span className="grid h-16 w-16 place-items-center bg-sand-100 text-sand-600">
            <ShoppingBag className="h-7 w-7" />
          </span>
          <h2 className="text-3xl">Your enquiry list is empty</h2>
          <p className="text-sand-600">
            Add the formulations you are interested in and send them to us in one go. We reply
            with trade pricing, minimum order quantities and availability for your territory.
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
    );
  }

  // A plain-text summary of the list, prefilled into the enquiry message.
  const summary =
    rows
      .map((r) => `${r.qty} × ${r.product.name} (${r.product.pack}) — ${inr(r.product.mrp * r.qty)}`)
      .join("\n") + `\n\nItems: ${count}\nIndicative total at MRP: ${inr(subtotal)}`;

  return (
    <section className="shell grid gap-10 py-14 md:py-20 lg:grid-cols-[1fr_22rem] lg:gap-14">
      <div>
        <ul className="border-t border-sand-200">
          {rows.map((r) => {
            const therapy = getTherapy(r.product.therapy);
            const off = discountPct(r.product);
            return (
              <li
                key={r.slug}
                className="grid grid-cols-[5.5rem_1fr] items-start gap-4 border-b border-sand-200 py-5 sm:grid-cols-[7rem_1fr_auto] sm:gap-6"
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
                  <p className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-gold-700">
                    {therapy?.name}
                  </p>
                  <h3 className="mt-1 text-xl">
                    <Link href={`/products/${r.slug}`} className="hover:text-forest-700">
                      {r.product.name}
                    </Link>
                  </h3>
                  <p className="mt-0.5 text-sm text-sand-600">
                    {r.product.form} · {r.product.pack}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div
                      className="inline-flex items-stretch border border-sand-300 bg-white"
                      role="group"
                      aria-label={`Quantity of ${r.product.name}`}
                    >
                      <button
                        type="button"
                        onClick={() => setQty(r.slug, r.qty - 1)}
                        aria-label={`Decrease quantity of ${r.product.name}`}
                        className="grid h-11 w-11 place-items-center text-forest-800 hover:bg-sand-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={r.qty}
                        aria-label={`Quantity of ${r.product.name}`}
                        onChange={(e) => setQty(r.slug, Math.max(1, Number(e.target.value) || 1))}
                        className="tnum w-14 border-x border-sand-300 text-center text-base font-bold text-forest-950 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-forest-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(r.slug, r.qty + 1)}
                        aria-label={`Increase quantity of ${r.product.name}`}
                        className="grid h-11 w-11 place-items-center text-forest-800 hover:bg-sand-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSaved(r.slug)}
                      className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-sand-600 hover:text-forest-700"
                    >
                      <Heart className="h-4 w-4" fill={isSaved(r.slug) ? "currentColor" : "none"} />
                      {isSaved(r.slug) ? "Saved" : "Save"}
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(r.slug)}
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
                    <s className="tnum text-sm text-sand-600">
                      {inr(r.product.listPrice * r.qty)}
                    </s>
                  )}
                  <span className="tnum mt-0.5 text-caption text-sand-600">
                    {inr(r.product.mrp)} each
                  </span>
                </p>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/products" className="inline-flex items-center gap-2 py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 text-sm font-bold text-forest-700">
            Continue browsing
          </Link>
          <button
            type="button"
            onClick={clear}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-sand-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Clear the list
          </button>
        </div>
      </div>

      {/* ---- summary ---- */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
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
        <div className="lg:col-span-2" id="send">
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
  );
}
