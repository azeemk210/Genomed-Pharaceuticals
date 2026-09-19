import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  ClipboardList,
  Factory,
  Package,
  Pill,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import PackShot from "@/components/PackShot";
import ProductCard from "@/components/ProductCard";
import EnquiryForm from "@/components/EnquiryForm";
import { AddToCartPanel } from "@/components/AddToCart";
import { price } from "@/lib/format";
import TherapyIcon from "@/components/TherapyIcon";
import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import { products, getTherapy, productsByTherapy, discountPct } from "@/lib/products";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};
  const therapy = getTherapy(product.therapy);

  return {
    title: `${product.name} — ${therapy?.name}`,
    description: `${product.name}: ${product.descriptor}. ${product.pack}, manufactured by Genomed Pharmaceuticals. ${therapy?.name} range.`,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

/**
 * One collapsible detail row. Native <details>: keyboard and screen-reader
 * behaviour come from the browser, it works with JavaScript off, and the
 * content stays in the HTML for search engines even while folded.
 */
function Detail({
  title,
  open = false,
  children,
}: {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={open} className="group border-b border-sand-200">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-semibold text-forest-950 transition-colors duration-200 hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700 [&::-webkit-details-marker]:hidden">
        {title}
        <Plus
          aria-hidden="true"
          strokeWidth={1.8}
          className="h-4 w-4 flex-none text-gold-700 transition-transform duration-300 group-open:rotate-45"
        />
      </summary>
      <div className="pb-6 leading-relaxed text-sand-600">{children}</div>
    </details>
  );
}

/**
 * Product page.
 *
 * Laid out as a two-column buy box rather than a banner followed by long-form
 * sections: the pack stays pinned on the left while the right column carries
 * everything a buyer needs in the order they need it — what it is, what it
 * costs, add it, the pack facts, then the detail folded into accordions.
 *
 * What the previous layout repeated, this states once. MRP appeared in the spec
 * table, the price block and an "At a glance" sidebar; the therapy name in the
 * eyebrow, the spec table and the sidebar; form and pack in three places.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const therapy = getTherapy(product.therapy)!;
  const off = discountPct(product);
  const related = productsByTherapy(product.therapy)
    .filter((p) => p.slug !== product.slug)
    .concat(products.filter((p) => p.therapy !== product.therapy))
    .slice(0, 4);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.positioning,
    category: therapy.name,
    ...(product.photo ? { image: `${site.url}${product.photo}` } : {}),
    brand: { "@type": "Brand", name: site.name },
    manufacturer: { "@type": "Organization", name: site.legalName },
    offers: {
      "@type": "Offer",
      price: product.mrp,
      priceCurrency: "INR",
      url: `${site.url}/products/${product.slug}`,
    },
  };

  const facts = [
    { icon: Pill, label: "Dosage form", value: product.form },
    { icon: Package, label: "Pack size", value: product.pack },
    { icon: null, label: "Therapeutic area", value: `${therapy.name} · ${therapy.subtitle}` },
    { icon: Factory, label: "Manufactured in", value: "Bulandshahr, Uttar Pradesh" },
  ];

  const assurance = [
    { icon: ShieldCheck, text: "Licensed manufacture" },
    { icon: ClipboardList, text: "Batch-traceable" },
    { icon: Truck, text: "Pan-India despatch" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* =============================== BUY BOX =============================== */}
      <section className="hero-aurora border-b border-sand-200 pt-6 pb-16 md:pt-8 md:pb-24">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="mb-6 md:mb-10">
            <ol className="flex flex-wrap items-center gap-2 text-caption text-sand-700">
              <li>
                <Link href="/" className="inline-block py-1 pointer-coarse:min-w-11 pointer-coarse:min-h-11 pointer-coarse:py-3 hover:text-forest-700">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-sand-400" aria-hidden="true" />
                <Link href="/products" className="inline-block py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 hover:text-forest-700">
                  Products
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-sand-400" aria-hidden="true" />
                <Link
                  href={`/products?area=${therapy.slug}`}
                  className="inline-block py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 hover:text-forest-700"
                >
                  {therapy.name}
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-sand-400" aria-hidden="true" />
                <span aria-current="page" className="font-semibold text-forest-900">
                  {product.name}
                </span>
              </li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-20">
            {/* ------------------------------ gallery ------------------------------ */}
            {/* Pinned while the buy box scrolls. The offset clears both sticky
                header rows (140px) plus a 20px gap. */}
            <div className="lg:sticky lg:top-40 lg:self-start">
              <div className="product-stage relative aspect-[5/4] overflow-hidden border border-sand-200 lg:aspect-square">
                <div className="pack-blend absolute inset-[10%]">
                  <PackShot
                    form={product.form}
                    name={product.name}
                    pack={product.pack}
                    photo={product.photo}
                  />
                </div>
                {product.badge && (
                  <span
                    className={`absolute top-4 left-4 px-2.5 py-1 text-caption font-bold tracking-wider ${
                      product.badge === "HOT"
                        ? "bg-gold-500 text-forest-990"
                        : "bg-forest-900 text-white"
                    }`}
                  >
                    {product.badge}
                  </span>
                )}
              </div>
              <p className="mt-3 text-caption text-sand-600">
                Pack shown for identification. Artwork can differ between batches.
              </p>
            </div>

            {/* ------------------------------ buy box ------------------------------ */}
            <div>
              <Link
                href={`/products?area=${therapy.slug}`}
                className="inline-flex items-center gap-2 py-1 pointer-coarse:min-h-11 text-eyebrow font-bold tracking-[0.16em] text-gold-700 uppercase transition-colors hover:text-gold-800"
              >
                <TherapyIcon name={therapy.icon} className="h-4 w-4" />
                {therapy.name} · {therapy.subtitle}
              </Link>

              <h1 className="mt-3 text-5xl">{product.name}</h1>
              <p className="mt-3 max-w-[44ch] text-xl text-sand-600">{product.descriptor}</p>

              {/* Price — stated once, with the saving beside the price it is off. */}
              <div className="mt-7 border-t border-sand-200 pt-7">
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                  <span className="sr-only">MRP</span>
                  <span className="tnum font-display text-4xl font-semibold text-forest-900">
                    {price(product.mrp)}
                  </span>
                  {off > 0 && product.listPrice && (
                    <>
                      <s className="tnum text-lg text-sand-600">{price(product.listPrice)}</s>
                      <span className="tnum self-center bg-gold-100 px-2.5 py-1 text-sm font-bold text-gold-800">
                        Save {off}%
                      </span>
                    </>
                  )}
                </p>
                <p className="mt-1.5 text-caption text-sand-600">MRP, inclusive of all taxes</p>
              </div>

              <div className="mt-6">
                <AddToCartPanel product={product} />
              </div>
              <a
                href="#enquire"
                className="group inline-flex items-center gap-2 py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 text-sm font-semibold text-forest-700"
              >
                Buying for a distributor or institution? Ask for trade pricing
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>

              {/* Pack facts */}
              <dl className="mt-8 grid grid-cols-1 gap-px border border-sand-200 bg-sand-200 sm:grid-cols-2">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 bg-white p-4">
                    <span className="grid h-9 w-9 flex-none place-items-center bg-forest-50 text-forest-700">
                      {Icon ? (
                        <Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden="true" />
                      ) : (
                        <TherapyIcon name={therapy.icon} className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <dt className="text-[0.75rem] font-bold tracking-[0.14em] text-sand-600 uppercase">
                        {label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-forest-950">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2.5">
                {assurance.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm text-sand-700">
                    <Icon className="h-4 w-4 text-forest-600" strokeWidth={1.7} aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>

              {/* Detail */}
              <div className="mt-10 border-t border-sand-200">
                <Detail title="Overview" open>
                  <p className="text-lg">{product.positioning}</p>
                </Detail>

                <Detail title="Indicated for">
                  <ul className="space-y-2.5">
                    {product.indications.map((i) => (
                      <li key={i} className="grid grid-cols-[auto_1fr] gap-3">
                        <span className="mt-2 h-1.5 w-1.5 flex-none bg-gold-500" aria-hidden="true" />
                        {i}
                      </li>
                    ))}
                  </ul>
                </Detail>

                <Detail title="Composition">
                  {product.composition.length > 0 ? (
                    <ul className="space-y-2.5">
                      {product.composition.map((c) => (
                        <li key={c} className="grid grid-cols-[auto_1fr] gap-3">
                          <span
                            className="mt-2 h-1.5 w-1.5 flex-none bg-gold-500"
                            aria-hidden="true"
                          />
                          {c}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <>
                      <p>
                        The full composition for {product.name} is issued as approved product
                        literature rather than published on the website. We send it to
                        distributors, prescribers and institutional buyers on request.
                      </p>
                      <a
                        href="#enquire"
                        className="group mt-3 inline-flex items-center gap-2 py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 text-sm font-bold text-forest-700"
                      >
                        Request the product literature
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </a>
                    </>
                  )}
                </Detail>

                <Detail title="Dosage">
                  <p>
                    {product.dosage ||
                      "To be taken as directed by a registered Ayurvedic practitioner or physician. Dosage schedules for each indication are set out in the product literature."}
                  </p>
                </Detail>

                <Detail title="Storage and handling">
                  <p>{product.storage}</p>
                </Detail>

                <Detail title={`About ${therapy.name}`}>
                  <p>{therapy.body}</p>
                  <Link
                    href={`/products?area=${therapy.slug}`}
                    className="group mt-3 inline-flex items-center gap-2 py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 text-sm font-bold text-forest-700"
                  >
                    See the whole {therapy.name} range
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </Detail>
              </div>

              <aside className="mt-8 border-l-2 border-gold-500 bg-gold-50 px-5 py-4">
                <p className="text-sm leading-relaxed text-sand-700">
                  <strong className="font-semibold text-forest-950">Important. </strong>
                  {product.name} is an Ayurvedic proprietary medicine. This page is for
                  distributors, healthcare professionals and general reference — it is not a
                  prescription or medical advice, and does not replace consultation with a
                  qualified practitioner. Always read the pack insert before use.
                </p>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* =============================== RELATED =============================== */}
      <section className="py-16 md:py-24">
        <div className="shell">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
            <Reveal>
              <Eyebrow>More from the range</Eyebrow>
              <h2 className="mt-4 text-3xl">You may also be looking for</h2>
            </Reveal>
            <Reveal delay={90}>
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 text-sm font-bold text-forest-700"
              >
                Full portfolio
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 70} className="h-full">
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =============================== ENQUIRY =============================== */}
      <section id="enquire" className="scroll-mt-28 border-t border-sand-200 bg-sand-50 py-16 md:py-24">
        <div className="shell-narrow mb-10 text-center">
          <Reveal className="flex justify-center">
            <Eyebrow>Enquire</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-3xl">Ask about {product.name}</h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mx-auto mt-4 max-w-[52ch] text-sand-600">
              Literature, pricing, minimum order quantities and territory availability — send
              us the details and we will come back within two working days.
            </p>
          </Reveal>
        </div>
        <div className="shell-narrow">
          <Reveal delay={200}>
            <EnquiryForm subject="Product literature and composition" compact />
          </Reveal>
        </div>
      </section>
    </>
  );
}
