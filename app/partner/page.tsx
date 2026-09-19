import type { Metadata } from "next";
import { Truck, ClipboardList, Factory, Phone, Mail, Clock } from "lucide-react";
import PageHero from "@/components/PageHero";
import VideoBackdrop from "@/components/VideoBackdrop";
import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import { contact, media } from "@/lib/site";

export const metadata: Metadata = {
  title: "Partner With Us",
  description:
    "Distributor appointments, institutional supply and third-party Ayurvedic manufacturing with Genomed Pharmaceuticals. Send us your territory and requirements for pricing, margins and product literature.",
  alternates: { canonical: "/partner" },
};

const AUDIENCES = [
  {
    icon: Truck,
    title: "Distributors & stockists",
    body: "Territory appointments for firms already supplying pharmacies and clinics. Margins, credit terms and minimum volumes agreed up front and put in writing.",
  },
  {
    icon: ClipboardList,
    title: "Institutional buyers",
    body: "Hospitals, clinics and Ayurvedic dispensaries buying directly. We supply specifications, certificates of analysis and documentation for your vendor-qualification file.",
  },
  {
    icon: Factory,
    title: "Third-party manufacturing",
    body: "Contract manufacture of Ayurvedic formulations under your own brand, from our existing range or to your formula, subject to feasibility.",
  },
];

const OFFER = [
  "Defined territory, agreed in writing before the first despatch",
  "Trade margins and credit terms fixed up front, not renegotiated per order",
  "Batch documentation and certificates of analysis with every consignment",
  "Production planned against your forecast so fast lines stay in stock",
  "Product literature and point-of-sale material for your field team",
  "A named contact who answers the phone during working hours",
];

const STEPS = [
  ["You send the brief", "Territory, the therapeutic areas you sell into, current lines you carry, and expected monthly volumes."],
  ["We come back in two working days", "With product literature, current pricing, trade margins and minimum order quantities for your territory."],
  ["We agree the terms", "Territory scope, credit period, despatch schedule and support — settled in writing before the first order."],
  ["First despatch", "Opening stock, batch documentation and point-of-sale material despatched together."],
];

export default function PartnerPage() {
  return (
    <>
      <PageHero
        eyebrow="Partner with Genomed"
        title="Distribution, institutional supply and contract manufacturing"
        lede="We are appointing distributors across India and supply institutional buyers directly. Tell us your territory and what you sell into, and we will come back with a concrete proposal."
        video={media.heroHerbs}
        crumb={[{ label: "Partner With Us" }]}
      />

      {/* ---------- who ---------- */}
      <section className="shell py-16 md:py-24">
        <div className="mb-12 text-center">
          <Reveal className="flex justify-center">
            <Eyebrow>Who we work with</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-4xl">Three ways to work with us</h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 border-l border-t border-sand-200 md:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, title, body }, i) => (
            <Reveal
              key={title}
              delay={i * 90}
              className="group border-b border-r border-sand-200 bg-white p-8 transition-colors hover:bg-forest-50"
            >
              <span className="grid h-14 w-14 place-items-center bg-forest-700 text-white transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-forest-990">
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <h3 className="mt-7 text-2xl">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-sand-600">{body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- what you get ---------- */}
      <section className="relative isolate overflow-hidden border-y border-sand-200 bg-forest-50 py-16 md:py-24">
        <VideoBackdrop src={media.mortar.src} poster={media.mortar.poster} />
        <div className="video-scrim absolute inset-0" aria-hidden="true" />

        <div className="shell relative grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow tone="onVideo">What a Genomed partner gets</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 text-4xl">Terms you can build a business on</h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-5 max-w-[50ch] text-sand-600">
                A distributor is not a customer — they are carrying our brand into their
                market on their own capital. The arrangement has to work for them or it does
                not last.
              </p>
            </Reveal>
          </div>

          <ul className="grid border-l border-t border-sand-300 sm:grid-cols-2">
            {OFFER.map((o, i) => (
              <Reveal
                as="li"
                key={o}
                delay={i * 70}
                className="border-b border-r border-sand-300 bg-white/80 p-5 text-sm leading-relaxed text-sand-700 backdrop-blur-sm"
              >
                <span className="mb-3 block h-1.5 w-6 bg-gold-600" aria-hidden="true" />
                {o}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- process ---------- */}
      <section className="shell py-16 md:py-24">
        <div className="mb-12 text-center">
          <Reveal className="flex justify-center">
            <Eyebrow>How it works</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-4xl">From first enquiry to first despatch</h2>
          </Reveal>
        </div>

        <ol className="grid grid-cols-1 border-l border-t border-sand-200 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([title, body], i) => (
            <Reveal
              as="li"
              key={title}
              delay={i * 80}
              className="border-b border-r border-sand-200 bg-white p-7"
            >
              <span className="font-display text-3xl font-semibold leading-none text-gold-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-xl">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-sand-600">{body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------- form ---------- */}
      <section id="enquiry" className="scroll-mt-24 bg-sand-50 py-16 md:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <Reveal>
              <Eyebrow>Business enquiry</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-5 text-4xl">Tell us about your territory</h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-5 text-sand-600">
                The more detail you give us, the more useful our first reply will be.
                Everything here is treated as commercially confidential.
              </p>
            </Reveal>

            <Reveal delay={220} className="mt-10 space-y-6 border-t border-sand-200 pt-8">
              {[
                { icon: Phone, label: "Call us", value: contact.phoneDisplay, href: `tel:${contact.phoneHref}` },
                { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
                { icon: Clock, label: "Office hours", value: contact.hours },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="grid grid-cols-[auto_1fr] gap-4">
                  <Icon className="mt-1 h-5 w-5 flex-none text-forest-700" strokeWidth={1.5} />
                  <div>
                    <p className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-sand-600">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="mt-1 block break-all py-0.5 font-semibold text-forest-800 pointer-coarse:py-2.5 hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-sand-600">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </Reveal>
          </div>

          <Reveal delay={120}>
            <EnquiryForm subject="Distribution / stockist appointment" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
