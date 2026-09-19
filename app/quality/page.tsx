import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import PageHero from "@/components/PageHero";
import VideoBackdrop from "@/components/VideoBackdrop";
import CTABand from "@/components/CTABand";
import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import { credentials, media } from "@/lib/site";

export const metadata: Metadata = {
  title: "Quality & Manufacturing",
  description:
    "How Genomed Pharmaceuticals manufactures: raw-material identification, written master formulas, in-process controls, release testing, batch traceability and retained samples at its Bulandshahr facility.",
  alternates: { canonical: "/quality" },
};

const PRACTICES = [
  {
    title: "One standard, every batch",
    body: "A formulation is made the same way whether it is the first batch of the year or the fiftieth. The master formula, equipment train and process parameters are fixed in writing, and changing any of them requires a documented change, not a decision on the floor.",
  },
  {
    title: "Material in before product out",
    body: "Herbs, excipients and packaging are quarantined on arrival and released only after identity and purity checks. Material that fails is segregated and returned. Nothing enters a batch on the strength of a supplier's word alone.",
  },
  {
    title: "Deviations are recorded, not absorbed",
    body: "When a batch departs from its parameters, the deviation is written down, investigated for cause, and closed with a corrective action before release. A deviation nobody records is a deviation that repeats.",
  },
  {
    title: "Lessons travel across products",
    body: "A finding on one formulation is reviewed against every other product that shares the same material, equipment or step. Fixing a problem once and only where it surfaced leaves the same fault sitting in three other lines.",
  },
  {
    title: "Retention and traceability",
    body: "Retained samples and complete batch records are held for every lot. Given a batch number from a pack in the market, we can reconstruct which material went into it, who made it, on what equipment, and what it tested at.",
  },
];

const JOURNEY = [
  ["Intake", "Herbs, excipients and packaging received against specification, sampled and moved to quarantine."],
  ["Identification", "Identity, purity and organoleptic checks carried out before any material is released to production."],
  ["Preparation", "Extraction, decoction and preparation of the base carried out to the parameters set in the master formula."],
  ["Formulation", "Blending and compounding against the written formula, with quantities verified and witnessed at each addition."],
  ["In-process checks", "Sampling at defined points during the run — appearance, consistency and physical parameters recorded as the batch is made."],
  ["Filling", "Filling, sealing and labelling with fill-volume checks and batch coding applied at the line."],
  ["Release testing", "Finished-product testing against the release specification. No batch leaves quarantine until the result is on file."],
  ["Documentation", "Batch record completed and reviewed, retained samples stored, and the lot released for despatch."],
];

export default function QualityPage() {
  return (
    <>
      <PageHero
        eyebrow="Quality & manufacturing"
        title="Quality is built into a batch, not inspected into it"
        lede="A release test tells you what happened. It does not make a good batch. Everything upstream of it — the material we accept, the parameters we hold, the deviations we close — is where quality is actually decided."
        video={media.lab}
        crumb={[{ label: "Quality" }]}
      />

      {/* ---------- vision ---------- */}
      <section className="shell grid gap-10 py-16 md:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow>Our quality vision</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-4xl">A standard that does not move</h2>
          </Reveal>
        </div>
        <Reveal delay={140} className="space-y-5 text-sand-600">
          <p>
            Our aim is simple to state and hard to hold: every Genomed pack should behave the
            same way as the last one a patient took. That means the standard cannot flex with
            the order book, the season, or how badly a distributor needs stock this week.
          </p>
          <p>
            Holding it is a matter of people as much as procedure. Operators are trained
            against the written process rather than shown it once, and they are expected to
            stop a run and report a departure rather than work around it. A team that feels
            able to raise a problem is the most reliable quality control a plant has.
          </p>
        </Reveal>
      </section>

      {/* ---------- QMS ---------- */}
      <section className="bg-sand-50 py-16 md:py-24">
        <div className="shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow>Quality management system</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 text-4xl">One system, front to back</h2>
            </Reveal>
          </div>
          <Reveal delay={140} className="space-y-5 text-sand-600">
            <p>
              Formulation development, production, quality control and despatch run on the
              same set of documents rather than three separate ones that drift apart. A
              specification written during development is the specification production works
              to and the one quality control tests against.
            </p>
            <p>
              The system covers written master formulas and batch records, raw-material and
              finished-product specifications, equipment cleaning and changeover, deviation
              and corrective-action handling, retained samples, and controlled storage of
              every record.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- practices ---------- */}
      <section className="shell py-16 md:py-24">
        <div className="mb-12 text-center">
          <Reveal className="flex justify-center">
            <Eyebrow>Our quality practices</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-4xl">Five things we actually do</h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mx-auto mt-4 max-w-[54ch] text-sand-600">
              Quality policies are easy to write. These are the working practices behind ours.
            </p>
          </Reveal>
        </div>

        <ol className="border-t border-sand-200">
          {PRACTICES.map((p, i) => (
            <Reveal
              as="li"
              key={p.title}
              delay={i * 70}
              className="grid grid-cols-[auto_1fr] gap-6 border-b border-sand-200 py-8 md:gap-10"
            >
              <span className="font-display text-3xl font-semibold leading-none text-gold-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-2xl">{p.title}</h3>
                <p className="mt-3 max-w-[70ch] text-sand-600">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------- journey ---------- */}
      <section className="relative isolate overflow-hidden border-y border-sand-200 bg-forest-50 py-16 md:py-24">
        <VideoBackdrop src={media.qc.src} poster={media.qc.poster} />
        <div className="video-scrim-soft absolute inset-0" aria-hidden="true" />

        <div className="shell relative">
          <div className="mb-12 text-center">
            <Reveal className="flex justify-center">
              <Eyebrow tone="onVideo">From herb to pack</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 text-4xl">The eight controlled stages</h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mx-auto mt-4 max-w-[58ch] text-sand-600">
                Each stage has a written procedure, a record, and a point at which the batch
                can be stopped. Nothing moves to the next stage on assumption.
              </p>
            </Reveal>
          </div>

          <ol className="grid grid-cols-1 border-l border-t border-sand-300 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY.map(([step, body], i) => (
              <Reveal
                as="li"
                key={step}
                delay={i * 60}
                className="border-b border-r border-sand-300 bg-white/80 p-6 backdrop-blur-sm transition-colors hover:bg-white md:p-7"
              >
                <span className="grid h-9 w-9 place-items-center border border-gold-600 text-sm font-bold text-gold-700">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg">{step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sand-600">{body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- credentials ---------- */}
      <section className="shell py-16 md:py-24">
        <div className="mb-12 text-center">
          <Reveal className="flex justify-center">
            <Eyebrow>Compliance</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-4xl">The framework we manufacture within</h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 border-l border-t border-sand-200 sm:grid-cols-2 lg:grid-cols-4">
          {credentials.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 80}
              className="border-b border-r border-sand-200 bg-white p-7"
            >
              <span className="grid h-12 w-12 place-items-center bg-forest-700 text-white">
                <ShieldCheck className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <h3 className="mt-6 text-xl">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-sand-600">{c.body}</p>
              {c.verified && c.reference && (
                <span className="mt-4 inline-block border border-sand-200 bg-sand-50 px-2.5 py-1 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-forest-700">
                  {c.reference}
                </span>
              )}
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 flex flex-wrap items-center justify-between gap-6 border border-sand-200 bg-sand-50 p-6">
          <p className="max-w-[62ch] text-sm text-sand-600">
            Licence and certificate copies are provided to distributors, institutional buyers
            and auditors on request as part of the vendor-qualification pack.
          </p>
          <Link
            href="/partner"
            className="group inline-flex items-center gap-2 py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 text-sm font-bold text-forest-700"
          >
            Request documentation
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>

      <CTABand
        eyebrow="Vendor qualification"
        title="Need our documentation for your own approvals?"
        body="We supply licence copies, product specifications, certificates of analysis and batch documentation as part of standard vendor qualification. Tell us what your process requires."
      />
    </>
  );
}
