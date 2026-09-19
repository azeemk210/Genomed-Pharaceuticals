"use client";

import Link from "next/link";
import { Heart, ArrowRight, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import { getProduct } from "@/lib/products";

export default function SavedClient() {
  const { ready, saved, add, cart } = useStore();

  if (!ready) return <div className="shell py-24" aria-busy="true" />;

  const items = saved.map(getProduct).filter((p) => p !== undefined);

  if (items.length === 0) {
    return (
      <section className="shell py-16 md:py-24">
        <div className="mx-auto grid max-w-xl justify-items-center gap-5 border border-dashed border-sand-300 px-6 py-20 text-center">
          <span className="grid h-16 w-16 place-items-center bg-sand-100 text-sand-600">
            <Heart className="h-7 w-7" />
          </span>
          <h2 className="text-3xl">Nothing saved yet</h2>
          <p className="text-sand-600">
            Tap the heart on any formulation to keep it here while you work through the
            portfolio. Saved items stay on this device.
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

  return (
    <section className="shell py-14 md:py-20">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-sand-600">
          {items.length} saved {items.length === 1 ? "formulation" : "formulations"}
        </p>
        <button
          type="button"
          // Adds only what is not already listed — quantities already set in the
          // list are left alone rather than each bumped by one.
          onClick={() =>
            items.forEach((p) => {
              if (!cart.some((l) => l.slug === p.slug)) add(p.slug, 1);
            })
          }
          className="inline-flex min-h-11 items-center gap-2 border border-sand-300 bg-white px-5 py-3 text-sm font-bold text-forest-800 transition-colors hover:border-forest-600"
        >
          <ShoppingBag className="h-4 w-4" />
          Add all to enquiry list
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
