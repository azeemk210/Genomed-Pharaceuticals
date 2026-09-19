import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Leaf, ClipboardList, Truck } from "lucide-react";
import PageHero from "@/components/PageHero";
import VideoBackdrop from "@/components/VideoBackdrop";
import StatGrid from "@/components/StatGrid";
import CTABand from "@/components/CTABand";
import TherapyIcon from "@/components/TherapyIcon";
import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import { contact, media } from "@/lib/site";
import { therapies } from "@/lib/products";

export const metadata: Metadata = {
  title: "About Genomed",
  description:
    "Genomed Pharmaceuticals is an Ayurvedic formulation manufacturer based in Bulandshahr, Uttar Pradesh, producing medicines across eight therapeutic areas for distributors and healthcare partners across India.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Do it properly or not at all",
    body: "If a batch does not meet its specification it does not ship. There is no commercial argument that outranks that, and we would rather be short of stock than short of standards.",
  },
  {
    icon: Leaf,
    title: "Respect the tradition",
    body: "Ayurvedic formulation is an inherited discipline with its own logic. We modernise how we control and document it, not what it is.",
  },
  {
    icon: ClipboardList,
    title: "Write it down",
    body: "A process that lives in someone's head cannot be repeated, audited or improved. Every formula, parameter and deviation is recorded.",
  },
  {
    icon: Truck,
    title: "Be easy to work with",
    body: "Clear pricing, honest lead times and someone who answers the phone. Distributors stay with suppliers who make their week simpler.",
  },
];

const MISSION = [
  "Manufacture every batch to a written specification, and release none that misses it.",
  "Source herbs and excipients that are identified and tested before they enter production.",
  "Keep documentation that stands up to an audit, a query or a recall.",
  "Price honestly, so the medicine stays reachable for the patient at the end of the chain.",
  "Supply distributors predictably enough that they can plan their own business around us.",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Genomed"
        title="Ayurvedic medicine, manufactured with a pharmaceutical discipline"
        lede="We formulate and produce from our own premises in Bulandshahr, Uttar Pradesh, supplying distributors, stockists and clinics who need a source they can rely on."
        video={media.mortar}
        crumb={[{ label: "About" }]}
      />

      {/* ---------- story ---------- */}
      <section className="shell grid gap-12 py-16 md:py-24 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow>Our story</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-4xl">Built around one frustration</h2>
          </Reveal>
          <Reveal delay={150} className="mt-6 space-y-5 text-sand-600">
            <p>
              Ayurvedic medicine in India has never had a shortage of good formulations. What
              it has often lacked is consistency — the same brand behaving differently from
              one batch to the next, arriving late, or arriving with no paperwork behind it.
            </p>
            <p>
              Genomed was set up to close that gap. We treat an Ayurvedic formulation the way
              a conventional pharmaceutical plant treats a tablet: a written master formula,
              tested raw material, defined process parameters, recorded deviations, and a
              batch number on every pack that leads back to the file behind it.
            </p>
            <p>
              The range is deliberately tight — ten formulations across eight therapeutic
              areas. We would rather make a small portfolio consistently than a large one
              occasionally.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120} className="border border-sand-200 bg-sand-50 p-7 lg:p-8">
          <h3 className="text-2xl">Genomed at a glance</h3>
          <dl className="mt-6 space-y-5">
            {[
              ["Business", "Ayurvedic formulation manufacturer"],
              ["Facility", contact.addressLines.join(", ")],
              ["Portfolio", "10 formulations, 8 therapeutic areas"],
              ["Dosage forms", "Syrup, liquid, powder, capsule"],
              ["Supplies to", "Distributors, stockists, clinics and institutional buyers"],
            ].map(([k, v], i, arr) => (
              <div key={k} className={i < arr.length - 1 ? "border-b border-sand-200 pb-5" : ""}>
                <dt className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-gold-700">
                  {k}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-sand-700">{v}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/contact"
            className="group mt-7 inline-flex items-center gap-2 py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 text-sm font-bold text-forest-700"
          >
            Visit or contact us
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      {/* ---------- vision & mission ---------- */}
      <section
        id="vision"
        className="relative isolate scroll-mt-24 overflow-hidden border-y border-sand-200 bg-forest-50 py-16 md:py-24"
      >
        <VideoBackdrop src={media.heroHerbs.src} poster={media.heroHerbs.poster} />
        <div className="video-scrim-soft absolute inset-0" aria-hidden="true" />

        <div className="shell relative grid gap-8 lg:grid-cols-2">
          <Reveal className="border border-sand-300 bg-white/85 p-8 backdrop-blur-sm md:p-10">
            <Eyebrow tone="onVideo">Our vision</Eyebrow>
            <h2 className="mt-6 text-3xl font-normal italic leading-snug">
              To make Ayurvedic medicine something a physician can prescribe with the same
              confidence as anything else on the shelf.
            </h2>
          </Reveal>

          <Reveal
            delay={120}
            className="border border-sand-300 bg-white/85 p-8 backdrop-blur-sm md:p-10"
          >
            <Eyebrow tone="onVideo">Our mission</Eyebrow>
            <ul className="mt-6 space-y-4">
              {MISSION.map((m) => (
                <li key={m} className="grid grid-cols-[auto_1fr] gap-3 text-sand-700">
                  <span className="mt-2.5 h-1.5 w-1.5 flex-none bg-gold-600" aria-hidden="true" />
                  {m}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---------- numbers ---------- */}
      <section className="shell py-16 md:py-24">
        <StatGrid />
      </section>

      {/* ---------- values ---------- */}
      <section className="bg-sand-50 py-16 md:py-24">
        <div className="shell">
          <div className="mb-12 text-center">
            <Reveal className="flex justify-center">
              <Eyebrow>What we hold to</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 text-4xl">Four things we do not trade away</h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 border-l border-t border-sand-200 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }, i) => (
              <Reveal
                key={title}
                delay={i * 80}
                className="group border-b border-r border-sand-200 bg-white p-7 transition-colors hover:bg-forest-50"
              >
                <span className="grid h-12 w-12 place-items-center bg-forest-700 text-white transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-forest-990">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </span>
                <h3 className="mt-6 text-xl">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-sand-600">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- what we make ---------- */}
      <section className="shell py-16 md:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal>
              <Eyebrow>What we make</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 text-4xl">Eight areas of focus</h2>
            </Reveal>
          </div>
          <Reveal delay={140}>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 border border-sand-300 px-6 py-3.5 text-sm font-bold text-forest-800 transition-colors hover:border-forest-600 hover:bg-sand-50"
            >
              View portfolio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <ul className="border-t border-sand-200">
          {therapies.map((t, i) => (
            <Reveal
              as="li"
              key={t.slug}
              delay={i * 45}
              className="border-b border-sand-200 transition-colors hover:bg-sand-50"
            >
              <Link
                href={`/products?area=${t.slug}`}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-5 md:gap-7"
              >
                <span className="grid h-12 w-12 flex-none place-items-center border border-sand-200 bg-sand-50 text-forest-700 transition-colors duration-300 group-hover:border-forest-700 group-hover:bg-forest-700 group-hover:text-white">
                  <TherapyIcon name={t.icon} className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-display text-xl font-semibold text-forest-950">
                    {t.name}
                  </span>
                  <span className="mt-1 block text-sm text-sand-600">{t.summary}</span>
                </span>
                <span className="hidden h-11 w-11 place-items-center border border-sand-300 text-forest-700 transition-colors duration-300 group-hover:border-forest-700 group-hover:bg-forest-700 group-hover:text-white sm:grid">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      <CTABand
        eyebrow="Work with us"
        title="Distributors, stockists and institutional buyers"
        body="If you supply pharmacies, clinics or hospitals and want a dependable Ayurvedic range behind you, we would like to hear from you."
      />
    </>
  );
}
