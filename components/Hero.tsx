import Link from "next/link";
import { ArrowRight, ShieldCheck, FlaskConical, ClipboardList, Truck } from "lucide-react";
import VideoBackdrop from "./VideoBackdrop";
import { media } from "@/lib/site";

/**
 * Homepage hero — centred statement over a full-bleed cinematic band.
 *
 * The composition is deliberately vertical rather than split: the claim gets
 * the full measure of the page to itself, then the band arrives edge to edge
 * underneath it, and the four credentials float up over the band's lower edge
 * on white cards. Nothing competes with the headline for the first screen, and
 * the licence still lands above the fold.
 *
 * Three things carry the style:
 *   1. `.hero-aurora` — three wide colour blooms, no texture. The type is the
 *      subject; the ground only has to stop the page reading as flat white.
 *   2. The band breaks the container. It is a sibling of `.shell`, not a child,
 *      so it spans the viewport without the `w-screen` trick, which adds a
 *      scrollbar's width of horizontal overflow.
 *   3. The credential cards overlap the band. That overlap is the only depth in
 *      the design, and it is what ties the two halves into one object rather
 *      than two stacked strips.
 *
 * Server component: the reveal is pure CSS, so nothing hydrates before the
 * largest text on the site can paint.
 */

const TRUST = [
  {
    icon: ShieldCheck,
    title: "Licensed manufacture",
    body: "Made under an Ayurvedic drug licence, to Schedule T GMP.",
  },
  {
    icon: FlaskConical,
    title: "In-house quality control",
    body: "Every batch release-tested before it leaves the plant.",
  },
  {
    icon: ClipboardList,
    title: "Batch traceability",
    body: "Batch, manufacturing date and expiry on every pack.",
  },
  {
    icon: Truck,
    title: "Supplied across India",
    body: "Distributor and institutional despatch from Uttar Pradesh.",
  },
];

/** One typeset line of the headline, masked so it slides up from its baseline. */
function Line({
  children,
  delay,
  className = "",
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <span className="line-mask">
      <span className={className} style={{ "--line-delay": `${delay}ms` } as React.CSSProperties}>
        {children}
      </span>
    </span>
  );
}

export default function Hero() {
  return (
    <section className="hero-aurora relative overflow-hidden border-b border-sand-200 pt-10 md:pt-14">
      {/* ============================= STATEMENT ============================= */}
      <div className="shell flex flex-col items-center text-center">
        <p
          className="inline-flex items-center gap-2.5 border border-sand-200 bg-white px-4 py-2 text-caption font-medium tracking-wide text-forest-900 shadow-sm"
          style={{ animation: "hero-in .4s var(--ease-out-expo) both" }}
        >
          <span aria-hidden="true" className="hero-dot block h-1.5 w-1.5 flex-none bg-forest-500" />
          Ayurvedic formulation manufacturer
          {/* Costs the chip a second line at 390px, where it only just fits on one. */}
          <span className="hidden sm:inline">· Bulandshahr, U.P.</span>
        </p>

        <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.02] font-semibold tracking-[-0.025em] text-balance text-forest-950 md:mt-7">
          <Line delay={60}>Ayurveda, built to</Line>
          <Line delay={170} className="text-gold-700">
            pharmaceutical standards.
          </Line>
        </h1>

        <p
          className="mt-5 max-w-2xl text-lg text-sand-700 md:mt-6"
          style={{ animation: "hero-in .4s var(--ease-out-expo) 300ms both" }}
        >
          Ten formulations across eight therapeutic areas — compounded, release-tested and
          batch-coded at our own plant in Bulandshahr, Uttar Pradesh, then supplied to
          distributors and institutions nationwide.
        </p>

        <div
          className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center md:mt-8"
          style={{ animation: "hero-in .4s var(--ease-out-expo) 380ms both" }}
        >
          <Link
            href="/products"
            className="group inline-flex items-center justify-center gap-2.5 bg-forest-700 px-8 py-4 text-sm font-semibold tracking-wide text-white transition-colors duration-300 hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
          >
            Explore the portfolio
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={2}
            />
          </Link>
          <Link
            href="/partner"
            className="inline-flex items-center justify-center gap-2.5 border border-sand-300 bg-white px-8 py-4 text-sm font-semibold tracking-wide text-forest-900 transition-colors duration-300 hover:border-forest-700 hover:text-forest-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700"
          >
            Become a distributor
          </Link>
        </div>
      </div>

      {/* ================== FULL-BLEED BAND + FLOATING CARDS ================== */}
      {/* Outside `.shell` on purpose — see the note at the top of the file. */}
      <div
        className="relative mt-10 h-[58vw] max-h-[360px] min-h-[230px] overflow-hidden md:mt-12"
        style={{ animation: "hero-in .4s var(--ease-out-expo) 460ms both" }}
      >
        <VideoBackdrop src={media.heroHerbs.src} poster={media.heroHerbs.poster} kenburns />
        {/* Fades the footage into the ground at both edges, so the band reads as
            part of the page rather than a photo dropped into a slot. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sand-50 to-transparent"
        />
        {/* Deepens the foot of the band so the white cards lifted over it read
            as floating rather than pasted on. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-forest-990/45 to-transparent"
        />
      </div>

      {/* The licence is the highest-value thing on a pharmaceutical page, so it
          sits here — lifted over the band, above the fold — rather than in a
          separate strip further down the page. */}
      <div className="shell relative -mt-12 pb-14 md:-mt-16 md:pb-20">
        <ul className="grid grid-cols-1 gap-px border border-sand-200 bg-sand-200 shadow-raise-md sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, body }) => (
            <li key={title} className="group flex flex-col gap-3 bg-white p-5 md:p-6">
              <span className="grid h-10 w-10 flex-none place-items-center bg-forest-700 text-white transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-forest-990">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <span>
                <span className="block font-display text-lg font-semibold text-forest-950">
                  {title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-sand-600">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
