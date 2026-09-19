import Link from "next/link";
import { ChevronRight } from "lucide-react";
import VideoBackdrop from "./VideoBackdrop";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";

/** Interior-page hero: video behind a light wash, breadcrumb, title, lede. */
export default function PageHero({
  eyebrow,
  title,
  lede,
  video,
  crumb = [],
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  video: { src: string; poster: string };
  crumb?: { label: string; href?: string }[];
}) {
  return (
    // Pulled up under the sticky header so the translucent header sits on the
    // hero rather than on a seam between two different backgrounds.
    <section className="relative isolate -mt-[4.5rem] overflow-hidden border-b border-sand-200 bg-sand-50 pt-[8.5rem] pb-16 md:pt-[10.5rem] md:pb-24">
      <VideoBackdrop src={video.src} poster={video.poster} kenburns />
      <div className="video-scrim absolute inset-0" aria-hidden="true" />

      <div className="shell relative">
        {crumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-caption text-sand-700">
              <li>
                <Link href="/" className="inline-block py-1 pointer-coarse:min-w-11 pointer-coarse:min-h-11 pointer-coarse:py-3 transition-colors hover:text-forest-700">
                  Home
                </Link>
              </li>
              {crumb.map((c) => (
                <li key={c.label} className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3 text-sand-400" />
                  {c.href ? (
                    <Link href={c.href} className="inline-block py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 transition-colors hover:text-forest-700">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-gold-700">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <Reveal>
          <Eyebrow tone="onVideo">{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="mt-5 max-w-[19ch] text-4xl md:text-5xl">{title}</h1>
        </Reveal>
        {lede && (
          <Reveal delay={170}>
            <p className="mt-6 max-w-[56ch] text-xl text-sand-600">{lede}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
