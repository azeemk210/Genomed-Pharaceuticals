import Link from "next/link";
import { ArrowRight, ShieldCheck, FlaskConical, ClipboardList, Truck } from "lucide-react";
import HeroPacks from "./HeroPacks";

/**
 * Homepage hero — centred statement flanked by packs on white podiums.
 *
 * The claim sits in the middle of the page; on wide screens two podium
 * displays stand either side of it (see HeroPacks), and below that width they
 * line up in a row under the buttons. The four credentials close the hero as a
 * row of white cards, so the licence is still part of the first section.
 *
 * `.hero-aurora` paints the ground: three wide colour blooms, no texture.
 * Server component: the headline reveal is pure CSS, so nothing hydrates
 * before the largest text on the site can paint.
 */

const TRUST = [
  {
    icon: ShieldCheck,
    title: "Licensed manufacture",
    body: "Made under a state drug manufacturing licence, to Schedule T GMP.",
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
      <div className="shell relative flex flex-col items-center text-center">

        <h1 className="max-w-4xl font-display text-5xl leading-[1.02] font-semibold tracking-[-0.025em] text-balance text-forest-950">
          <Line delay={60}>Herbal, built to</Line>
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

        {/* Podium displays: beside the copy on xl, a row under it below that. */}
        <HeroPacks className="mt-12 md:mt-14 xl:mt-0" />
      </div>

      {/* The licence is the highest-value thing on a pharmaceutical page, so it
          stays inside the hero rather than in a separate strip further down. */}
      <div className="shell relative mt-14 pb-14 md:mt-20 md:pb-20 xl:mt-24">
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
