import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CTABand from "@/components/CTABand";
import ProductFilter from "@/components/ProductFilter";
import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import { products, therapyCounts, dosageForms, getTherapy } from "@/lib/products";
import { isSortKey, type ListingState } from "@/lib/listing";

type Search = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Validates the URL so a bad or stale link falls back to "all" rather than an empty grid. */
function readListing(sp: Awaited<Search>): ListingState {
  const area = first(sp.area);
  const form = first(sp.form);
  const sort = first(sp.sort);
  return {
    area: therapyCounts().some((a) => a.slug === area) ? area : "all",
    form: (dosageForms() as string[]).includes(form) ? form : "all",
    q: first(sp.q).slice(0, 80),
    sort: isSortKey(sort) ? sort : "recommended",
  };
}

/* A therapeutic-area view is a real category page, so it gets its own title,
   description and canonical URL rather than all collapsing into /products. */
export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const { area } = readListing(await searchParams);
  const t = area === "all" ? null : getTherapy(area);
  if (t) {
    return {
      title: `${t.name} products`,
      description: `${t.summary} Genomed Pharmaceuticals ${t.name.toLowerCase()} range.`,
      alternates: { canonical: `/products?area=${t.slug}` },
    };
  }
  return {
    title: "Products",
    description:
      "Genomed's herbal product portfolio across eight therapeutic areas — liver care, metabolic care, renal care, women's health, dermatology, haemostatics, men's wellness and general wellness.",
    alternates: { canonical: "/products" },
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Search }) {
  const initial = readListing(await searchParams);

  return (
    <>
      {/* Keyed on the URL state: arriving from the header search or a category
          link re-seeds the listing, while in-page filtering (which only
          rewrites the URL) does not remount it. A link back to the URL it
          mounted with keeps the same key; ProductFilter re-seeds itself from
          `initial` for that case. */}
      <ProductFilter
        key={`${initial.area}|${initial.form}|${initial.q}|${initial.sort}`}
        products={products}
        areas={therapyCounts()}
        forms={dosageForms()}
        initial={initial}
      />

      {/* ---- literature note ---- */}
      <section className="border-t border-sand-200 bg-sand-50 py-14 md:py-20">
        <div className="shell flex flex-wrap items-center justify-between gap-8">
          <Reveal className="max-w-[58ch]">
            <Eyebrow>Product literature</Eyebrow>
            <h2 className="mt-5 text-3xl">Full composition and dosing on request</h2>
            <p className="mt-4 text-sand-600">
              Detailed composition, dosage schedules and pack artwork are supplied as
              approved product literature to distributors, prescribers and institutional
              buyers. Tell us which products you need and we will send the current documents.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <Link
              href="/partner"
              className="group inline-flex items-center gap-2 bg-forest-700 px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-forest-800"
            >
              Request literature
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
