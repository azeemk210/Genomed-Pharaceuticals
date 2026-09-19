import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import { ArrowRight, ShieldCheck, ClipboardList, Truck, Leaf } from "lucide-react";
import VideoBackdrop from "@/components/VideoBackdrop";
import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import StatGrid from "@/components/StatGrid";
import ProductCard from "@/components/ProductCard";
import TherapyIcon from "@/components/TherapyIcon";
import CTABand from "@/components/CTABand";
import { media, pillars, credentials } from "@/lib/site";
import { therapyCounts, featuredProducts } from "@/lib/products";

export default function Home() {
  const areas = therapyCounts();
  const featured = featuredProducts().slice(0, 4);

  return (
    <>
      <Hero />

      {/* ===================== STATS ===================== */}
      <section className="shell py-16 md:py-24">
        <StatGrid />
      </section>

      {/* ===================== WHO WE ARE ===================== */}
      <section className="border-y border-sand-200 bg-sand-50 py-16 md:py-28">
        <div className="shell grid items-stretch gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Square video tile with an overlapping stat badge. The badge anchors
              to this inner wrapper, not to the grid cell — otherwise it floats
              to the bottom of the whole column. Square while stacked; on wide
              screens it stretches to the text column's height so the row does
              not end with a tall empty gap under the video.
              This tile keeps the footage at full strength — it is a picture,
              not a text bed, so it needs no wash. */}
          <Reveal className="lg:h-full">
            <div className="relative lg:h-full">
              <div className="relative aspect-square overflow-hidden border border-sand-200 bg-sand-100 lg:aspect-auto lg:h-full lg:min-h-[34rem]">
                <VideoBackdrop src={media.mortar.src} poster={media.mortar.poster} />
              </div>
              {/* square badge, deliberately breaking the tile's edge */}
              <div className="absolute -bottom-6 -right-2 grid h-32 w-32 place-items-center bg-gold-500 p-4 text-center md:-right-6 md:h-40 md:w-40">
                <div>
                  <p className="font-display text-4xl font-semibold leading-none text-forest-990">
                    8
                  </p>
                  <p className="mt-2 text-caption font-bold uppercase leading-tight tracking-[0.12em] text-forest-900">
                    Therapeutic
                    <br />
                    areas
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="lg:pt-6">
            <Reveal>
              <Eyebrow>Who we are</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 text-4xl">A manufacturer, not a repackager.</h2>
            </Reveal>
            <Reveal delay={150} className="mt-6 space-y-5 text-sand-600">
              <p>
                Genomed was built around a straightforward idea: herbal medicine deserves
                the same manufacturing discipline that conventional pharmaceuticals take for
                granted. Written master formulas. Tested raw material. Recorded deviations.
                A batch number on every pack that leads back to the records behind it.
              </p>
              <p>
                We formulate and produce from our own premises in Bulandshahr, Uttar Pradesh,
                and supply stockists, distributors and clinics who need a dependable source
                rather than an intermittent one.
              </p>
            </Reveal>

            <ul className="mt-10 border-t border-sand-200">
              {pillars.map((p, i) => (
                <Reveal
                  as="li"
                  key={p.title}
                  delay={i * 80}
                  className="grid grid-cols-[auto_1fr] gap-5 border-b border-sand-200 py-5"
                >
                  <span className="font-display text-lg font-semibold text-gold-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xl">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-sand-600">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={200}>
              <Link
                href="/about"
                className="group mt-8 inline-flex items-center gap-2 py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 text-sm font-bold text-forest-700"
              >
                More about Genomed
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== THERAPEUTIC AREAS ===================== */}
      <section className="py-16 md:py-28">
        <div className="shell">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Reveal>
                <Eyebrow>Product portfolio</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-5 text-4xl">Eight therapeutic areas</h2>
              </Reveal>
            </div>
            <Reveal delay={140}>
              <p className="max-w-[44ch] text-sand-600">
                Our portfolio is organised by the condition it treats, so distributors and
                prescribers can find the right formulation without reading every label.
              </p>
            </Reveal>
          </div>

          {/* square tiles on a hairline grid */}
          <div className="grid grid-cols-2 border-l border-t border-sand-200 lg:grid-cols-4">
            {areas.map((a, i) => (
              <Reveal key={a.slug} delay={i * 60}>
                <Link
                  href={`/products?area=${a.slug}`}
                  className="group relative flex h-full flex-col border-b border-r border-sand-200 p-4 transition-colors duration-300 hover:bg-forest-50 md:p-5"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-sand-100">
                    <Image
                      src={a.image}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center bg-white/90 text-forest-700 backdrop-blur-sm">
                      <TherapyIcon name={a.icon} className="h-5 w-5" />
                    </span>
                  </span>

                  <div className="mt-5">
                    <p className="text-[0.75rem] font-bold uppercase tracking-[0.16em] text-gold-700">
                      {a.subtitle}
                    </p>
                    <h3 className="mt-2 text-2xl">{a.name}</h3>
                    <p className="mt-3 text-sm leading-snug text-sand-600">{a.summary}</p>
                    <p className="mt-4 flex items-center gap-2 border-t border-sand-200 pt-3 text-sm font-semibold text-forest-700 transition-colors duration-300 group-hover:border-forest-200">
                      {a.count} {a.count === 1 ? "formulation" : "formulations"}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED PRODUCTS ===================== */}
      <section className="border-y border-sand-200 bg-sand-50 py-16 md:py-28">
        <div className="shell">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Reveal>
                <Eyebrow>Selected formulations</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="mt-5 text-4xl">From the current range</h2>
              </Reveal>
            </div>
            <Reveal delay={140}>
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 border border-sand-300 bg-white px-6 py-3.5 text-sm font-bold text-forest-800 transition-colors hover:border-forest-600"
              >
                All products
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80} className="h-full">
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== QUALITY ===================== */}
      <section className="relative isolate overflow-hidden bg-forest-50 py-16 md:py-28">
        <VideoBackdrop src={media.lab.src} poster={media.lab.poster} />
        <div className="video-scrim absolute inset-0" aria-hidden="true" />

        <div className="shell relative grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow tone="onVideo">Quality &amp; manufacturing</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 max-w-[16ch] text-4xl">
                Quality is built into a batch, not inspected into it.
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 max-w-[52ch] text-sand-600">
                A finished-product test tells you what happened. It does not make a good
                batch. Everything upstream of that test — the material we accept, the
                parameters we hold, the deviations we record and close — is where quality is
                actually decided.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <Link
                href="/quality"
                className="group mt-9 inline-flex items-center gap-2 bg-forest-700 px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-forest-800"
              >
                How we manufacture
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>

          {/* credential boxes on a hairline grid over the video */}
          <div className="grid grid-cols-1 border-l border-t border-sand-300 sm:grid-cols-2">
            {credentials.map((c, i) => (
              <Reveal
                key={c.title}
                delay={i * 90}
                className="border-b border-r border-sand-300 bg-white/80 p-6 backdrop-blur-sm transition-colors hover:bg-white md:p-7"
              >
                <ShieldCheck className="h-6 w-6 text-gold-700" strokeWidth={1.5} />
                <h3 className="mt-5 text-xl">{c.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-sand-600">{c.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHY PARTNER ===================== */}
      <section className="py-16 md:py-28">
        <div className="shell">
          <div className="mb-12 text-center">
            <Reveal className="flex justify-center">
              <Eyebrow>Why partners choose Genomed</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mx-auto mt-5 max-w-[20ch] text-4xl">
                Built for people who have to resupply
              </h2>
            </Reveal>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Truck,
                title: "Supply you can plan against",
                body: "Production is scheduled against distributor forecasts, so fast-moving lines are in stock when your stockists reorder rather than three weeks later.",
              },
              {
                icon: ClipboardList,
                title: "Documentation that holds up",
                body: "Batch records, release documentation and retained samples are kept at the plant and produced on request — for your own records or for an inspector.",
              },
              {
                icon: Leaf,
                title: "Focused, not sprawling",
                body: "Ten formulations across eight therapeutic areas. A tight range we can make consistently beats a catalogue we can only make occasionally.",
              },
            ].map(({ icon: Icon, title, body }, i) => (
              <Reveal
                key={title}
                delay={i * 90}
                className="group border border-sand-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-forest-300 hover:shadow-raise-md"
              >
                <span className="grid h-14 w-14 place-items-center bg-forest-700 text-white transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-forest-990">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <h3 className="mt-7 text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-sand-600">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
