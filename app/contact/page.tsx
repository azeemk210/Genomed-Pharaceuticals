import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import PageHero from "@/components/PageHero";
import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import { contact, media } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Genomed Pharmaceuticals — herbal formulation manufacturer in Bulandshahr, Uttar Pradesh. Phone, email, address and business enquiry form.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    contact.mapQuery,
  )}&z=13&output=embed`;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to us"
        lede="Business enquiries, product literature, documentation requests or a visit to the facility — here is how to reach us."
        video={media.lab}
        crumb={[{ label: "Contact" }]}
      />

      {/* ---------- contact squares ---------- */}
      <section className="shell py-14 md:py-20">
        <div className="grid grid-cols-1 border-l border-t border-sand-200 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Phone,
              label: "Phone",
              value: contact.phoneDisplay,
              note: contact.hours,
              href: `tel:${contact.phoneHref}`,
            },
            {
              icon: Mail,
              label: "Email",
              value: contact.email,
              note: "We reply within two working days",
              href: `mailto:${contact.email}`,
            },
            {
              icon: MapPin,
              label: "Facility & office",
              value: contact.addressLines.join(", "),
              note: "",
            },
            {
              icon: Clock,
              label: "Visiting",
              value: "By appointment",
              note: "Please call or email a few days ahead so we can arrange a time when production staff are available.",
            },
          ].map(({ icon: Icon, label, value, note, href }, i) => {
            const inner = (
              <>
                <span className="grid h-12 w-12 place-items-center bg-forest-700 text-white transition-colors duration-300 group-hover:bg-gold-400 group-hover:text-forest-990">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div className="mt-7">
                  <p className="text-[0.75rem] font-bold uppercase tracking-[0.16em] text-gold-700">
                    {label}
                  </p>
                  <p className="mt-2 font-display text-lg font-semibold leading-snug break-words text-forest-950">
                    {value}
                  </p>
                  {note && <p className="mt-3 text-sm leading-relaxed text-sand-600">{note}</p>}
                </div>
              </>
            );

            const cls =
              "group flex h-full flex-col justify-between border-b border-r border-sand-200 bg-white p-7 transition-colors hover:bg-sand-50";

            return (
              <Reveal key={label} delay={i * 80}>
                {href ? (
                  <a href={href} className={cls}>
                    {inner}
                  </a>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------- form + map ---------- */}
      <section className="shell grid gap-12 pb-16 md:pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <Reveal>
            <Eyebrow>Send a message</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-4xl">Tell us what you need</h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-5 text-sand-600">
              Use the form for anything — distribution, literature, documentation or a general
              question. For distributor appointments there is a fuller form on the{" "}
              <Link href="/partner" className="font-semibold text-forest-700 underline underline-offset-2">
                Partner With Us
              </Link>{" "}
              page.
            </p>
          </Reveal>
          <Reveal delay={200} className="mt-8">
            <EnquiryForm compact />
          </Reveal>
        </div>

        <aside className="space-y-6">
          <Reveal className="aspect-square border border-sand-200 bg-sand-100">
            <iframe
              src={mapSrc}
              title="Map showing the location of Genomed Pharmaceuticals in Bulandshahr, Uttar Pradesh"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </Reveal>

          <Reveal delay={110} className="border border-sand-200 bg-sand-50 p-7">
            <h3 className="text-2xl">Finding us</h3>
            <p className="mt-3 text-sm leading-relaxed text-sand-600">
              We are in Village Dhakauli, Post Malaghar, in Bulandshahr district. The map
              shows the general area — call us when you set out and we will guide you in from
              the main road.
            </p>
            <a
              href={`tel:${contact.phoneHref}`}
              className="mt-6 flex w-full items-center justify-center gap-2 border border-sand-300 bg-white px-6 py-3.5 text-sm font-bold text-forest-800 transition-colors hover:border-forest-600"
            >
              <Phone className="h-4 w-4" /> {contact.phoneDisplay}
            </a>
          </Reveal>
        </aside>
      </section>
    </>
  );
}
