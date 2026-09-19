import type { Metadata } from "next";
import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import CTABand from "@/components/CTABand";
import ProductFilter from "@/components/ProductFilter";
import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import { media } from "@/lib/site";
import { products, therapyCounts, dosageForms } from "@/lib/products";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Product Portfolio",
  description:
    "Genomed's herbal product portfolio across eight therapeutic areas — liver care, metabolic care, renal care, women's health, dermatology, haemostatics, men's wellness and general wellness.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Product portfolio"
        title="Ten formulations, eight therapeutic areas"
        lede="Every Genomed product is grouped by the condition it treats. Filter by therapeutic area or dosage form, or browse the full portfolio."
        video={media.qc}
        crumb={[{ label: "Products" }]}
      />

      {/* ProductFilter reads ?area= via useSearchParams, which needs a Suspense
          boundary for this page to stay statically prerendered. */}
      <Suspense fallback={<div className="shell py-24" aria-busy="true" />}>
        <ProductFilter products={products} areas={therapyCounts()} forms={dosageForms()} />
      </Suspense>

      {/* ---- literature note ---- */}
      <section className="bg-sand-50 py-14 md:py-20">
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
