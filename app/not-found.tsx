import Link from "next/link";
import { ArrowRight } from "lucide-react";
import VideoBackdrop from "@/components/VideoBackdrop";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";
import { media, nav } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="relative isolate -mt-[4.5rem] flex min-h-[80svh] items-center overflow-hidden border-b border-sand-200 bg-sand-50 pb-24 pt-[10rem]">
      <VideoBackdrop src={media.qc.src} poster={media.qc.poster} />
      <div className="video-scrim absolute inset-0" aria-hidden="true" />

      <div className="shell relative">
        <Reveal>
          <Eyebrow tone="onVideo">Error 404</Eyebrow>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="mt-5 text-5xl">This page is not here</h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-5 max-w-[52ch] text-xl text-sand-600">
            The link may be out of date, or the page may have moved. Everything on the site
            is one click away below.
          </p>
        </Reveal>

        <Reveal delay={230} className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 bg-forest-700 px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-forest-800"
          >
            Back to home
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 border border-sand-300 bg-white/70 px-7 py-4 text-sm font-bold text-forest-800 backdrop-blur-sm transition-colors hover:border-forest-600 hover:bg-white"
          >
            Browse products
          </Link>
        </Reveal>

        <Reveal delay={300}>
          <ul className="mt-12 flex flex-wrap gap-2 border-t border-sand-300 pt-8">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="inline-flex items-center gap-2 border border-sand-300 bg-white/70 px-4 py-2.5 text-sm font-semibold text-sand-700 backdrop-blur-sm transition-colors hover:border-forest-600 hover:text-forest-800"
                >
                  {n.label}
                  <ArrowRight className="h-3.5 w-3.5 text-sand-400" />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
