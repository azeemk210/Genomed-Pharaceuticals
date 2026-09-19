import Image from "next/image";
import Counter from "./Counter";
import Reveal from "./Reveal";
import { stats } from "@/lib/site";

/**
 * Four perfect squares on a hairline grid — the square-box motif at its most
 * literal. Squares only hold on wider screens; below `sm` they relax so the
 * numbers do not float in a tall empty box.
 *
 * Each card carries a backdrop relevant to the figure it states (see `stats`
 * in lib/site.ts). Two rules keep that from costing legibility:
 *
 *  - Saturation is cut to 45%. The therapy card's backdrop is a clinical
 *    render with a red organ and blue gloves in it; at full strength those two
 *    hues shout across a palette built from exactly two. Desaturating every
 *    card equally settles them into the brand's tonal range without singling
 *    one out for different treatment.
 *  - The image is washed to 35% and then covered by a white scrim that runs
 *    from 35% at the top to 92% at the bottom. The picture therefore reads in
 *    the empty upper half and has all but vanished by the time it reaches the
 *    figure and its label, which sit in the lower half — so the measured
 *    contrast of the text is effectively unchanged.
 *  - The scrim is a sibling element rather than a gradient on the card, so the
 *    card keeps its white base colour if the image 404s.
 */
export default function StatGrid() {
  return (
    <div className="grid grid-cols-2 border-t border-l border-sand-200 lg:grid-cols-4">
      {stats.map((s, i) => (
        <Reveal
          key={s.label}
          delay={i * 90}
          className="group relative flex flex-col justify-between overflow-hidden border-r border-b border-sand-200 bg-white p-6 sm:aspect-square md:p-8"
        >
          <Image
            src={s.image}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className="pointer-events-none object-cover opacity-40 saturate-50 transition-transform duration-400 ease-out group-hover:scale-105"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/92 via-white/64 to-white/26"
          />

          <span className="relative text-eyebrow font-bold tracking-[0.18em] text-gold-700 uppercase">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="relative mt-10">
            <p className="font-display text-6xl leading-none font-semibold tracking-[-0.03em] text-forest-800">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-3 max-w-[18ch] text-sm leading-snug text-sand-600">{s.label}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
