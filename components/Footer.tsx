import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Logo from "./Logo";
import { contact, site, social } from "@/lib/site";
import { therapies } from "@/lib/products";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sand-200 bg-sand-100 text-sand-700">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 border-b border-sand-300 pb-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-[38ch] text-sm leading-relaxed text-sand-600">
              An Ayurvedic formulation manufacturer in Bulandshahr, Uttar Pradesh,
              supplying liver, metabolic, renal, gynaecological and dermatological
              medicines to distributors and healthcare partners across India.
            </p>
            {social.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-5 text-sm font-semibold">
                {social.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} rel="noopener" className="hover:text-forest-700">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-labelledby="f-company">
            <h2
              id="f-company"
              className="mb-5 font-sans text-eyebrow font-bold uppercase tracking-[0.18em] text-gold-700"
            >
              Company
            </h2>
            <ul className="space-y-2 text-sm">
              {[
                ["About Genomed", "/about"],
                ["Vision & Mission", "/about#vision"],
                ["Quality & Manufacturing", "/quality"],
                ["Partner With Us", "/partner"],
                ["Contact", "/contact"],
                ["Enquiry list", "/cart"],
                ["Saved products", "/saved"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-block py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 transition-all hover:translate-x-0.5 hover:text-forest-700"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="f-areas">
            <h2
              id="f-areas"
              className="mb-5 font-sans text-eyebrow font-bold uppercase tracking-[0.18em] text-gold-700"
            >
              Therapeutic Areas
            </h2>
            <ul className="space-y-2 text-sm">
              {therapies.slice(0, 6).map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/products?area=${t.slug}`}
                    className="inline-block py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 transition-all hover:translate-x-0.5 hover:text-forest-700"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/products"
                  className="inline-block py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 font-semibold text-forest-700 hover:text-forest-800"
                >
                  View full portfolio
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="mb-5 font-sans text-eyebrow font-bold uppercase tracking-[0.18em] text-gold-700">
              Reach Us
            </h2>
            <address className="space-y-4 text-sm not-italic">
              <p className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-none text-gold-700" strokeWidth={1.7} />
                <span>{contact.addressLines.join(", ")}</span>
              </p>
              <p className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 flex-none text-gold-700" strokeWidth={1.7} />
                <a href={`tel:${contact.phoneHref}`} className="inline-block py-0.5 pointer-coarse:min-h-11 pointer-coarse:py-3 hover:text-forest-700">
                  {contact.phoneDisplay}
                </a>
              </p>
              <p className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-none text-gold-700" strokeWidth={1.7} />
                <a href={`mailto:${contact.email}`} className="inline-block break-all py-0.5 pointer-coarse:min-h-11 pointer-coarse:py-3 hover:text-forest-700">
                  {contact.email}
                </a>
              </p>
              <p className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 flex-none text-gold-700" strokeWidth={1.7} />
                <span>{contact.hours}</span>
              </p>
            </address>
          </div>
        </div>

        <p className="max-w-[96ch] py-8 text-caption leading-relaxed text-sand-600">
          Genomed products are Ayurvedic proprietary medicines manufactured under licence in
          India. Information on this website is intended for distributors, healthcare
          professionals and general reference. It is not medical advice and does not replace
          consultation with a qualified practitioner. Always read the pack insert before use.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-sand-300 pt-6 text-caption text-sand-600">
          <p>
            © {year} {site.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6">
            <li>
              <Link href="/privacy" className="inline-block py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 hover:text-forest-700">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="inline-block py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 hover:text-forest-700">
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
