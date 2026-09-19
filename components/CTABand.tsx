import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import VideoBackdrop from "./VideoBackdrop";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import { contact, media } from "@/lib/site";

export default function CTABand({
  eyebrow = "Partner with Genomed",
  title = "Looking for a manufacturing or distribution partner?",
  body = "We work with stockists, distributors and clinics across India. Tell us the territory and therapeutic areas you cover, and we will come back with a proposal, product literature and current pricing.",
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden border-y border-sand-200 bg-forest-50">
      <VideoBackdrop src={media.mortar.src} poster={media.mortar.poster} />
      <div className="video-scrim absolute inset-0" aria-hidden="true" />

      <div className="shell relative grid items-center gap-10 py-16 md:py-24 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Reveal>
            <Eyebrow tone="onVideo">{eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 max-w-[20ch] text-3xl md:text-4xl">{title}</h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-5 max-w-[58ch] text-sand-600">{body}</p>
          </Reveal>
        </div>

        <Reveal delay={220} className="flex flex-wrap gap-3 lg:justify-end">
          <Link
            href="/partner"
            className="group inline-flex items-center gap-2 bg-forest-700 px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-forest-800"
          >
            Start an enquiry
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <a
            href={`tel:${contact.phoneHref}`}
            className="inline-flex items-center gap-2 border border-sand-300 bg-white/70 px-6 py-4 text-sm font-bold text-forest-800 backdrop-blur-sm transition-colors hover:border-forest-600 hover:bg-white"
          >
            <Phone className="h-4 w-4 text-gold-700" />
            {contact.phoneDisplay}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
