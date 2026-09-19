import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { contact, site, media } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms governing the use of the Genomed Pharmaceuticals website, including the status of product information and medical disclaimers.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "September 2026";

const SECTIONS: [string, string[]][] = [
  [
    "Acceptance",
    [`By using ${site.url} you accept these terms. If you do not accept them, please do not use the site.`],
  ],
  [
    "This site is not medical advice",
    [
      "Genomed products are herbal proprietary medicines. Everything on this site — product pages, indications, descriptions and general articles — is published for distributors, healthcare professionals and general reference. It is not a prescription, not a diagnosis, and not a substitute for consulting a qualified practitioner.",
      "Do not start, stop or change any treatment on the basis of this website. Always read the pack insert, and take medicines only as directed by a registered practitioner or physician.",
    ],
  ],
  [
    "Product information",
    [
      "We try to keep product details accurate and current, but pack sizes, compositions, presentations and prices change. The approved product literature and the pack label are the authoritative source — not this website. Maximum retail prices shown are indicative and inclusive of taxes unless stated otherwise; the price printed on the pack governs.",
      "Listing a product here is not an offer to sell. Availability depends on territory, licensing and stock.",
    ],
  ],
  [
    "Enquiries",
    [
      "Sending an enquiry does not create a distribution agreement, an appointment or any obligation on either side. Any commercial arrangement is subject to a separate written agreement.",
    ],
  ],
  [
    "Intellectual property",
    [
      `The Genomed name, logo, brand names, page content, text and design on this site belong to ${site.legalName} unless stated otherwise. You may read, print and share pages for legitimate business or personal reference. You may not copy the site, reuse its content commercially, or present our brands as your own without written permission.`,
    ],
  ],
  [
    "External links",
    [
      "Where this site links to another website, we do not control that site and are not responsible for its content or practices.",
    ],
  ],
  [
    "Availability and liability",
    [
      `We make no guarantee that the site will be uninterrupted or error-free. To the extent permitted by law, ${site.legalName} is not liable for any loss arising from the use of, or inability to use, this website or from reliance on its content. Nothing in these terms limits liability that cannot be limited by law.`,
    ],
  ],
  [
    "Governing law",
    [
      "These terms are governed by the laws of India. The courts at Bulandshahr, Uttar Pradesh have jurisdiction over any dispute arising from them.",
    ],
  ],
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Use"
        lede={`The terms on which this website is made available. Last updated ${UPDATED}.`}
        video={media.qc}
        crumb={[{ label: "Terms of Use" }]}
      />

      <section className="shell-narrow py-16 md:py-24">
        <div className="space-y-10">
          {SECTIONS.map(([heading, paras]) => (
            <div key={heading}>
              <h2 className="text-2xl">{heading}</h2>
              {paras.map((p) => (
                <p key={p.slice(0, 40)} className="mt-4 text-sand-600">
                  {p}
                </p>
              ))}
            </div>
          ))}

          <div>
            <h2 className="text-2xl">Contact</h2>
            <address className="mt-4 not-italic leading-loose text-sand-600">
              {site.legalName}
              <br />
              {contact.addressLines.join(", ")}
              <br />
              <a href={`mailto:${contact.email}`} className="text-forest-700 underline underline-offset-2">
                {contact.email}
              </a>{" "}
              ·{" "}
              <a href={`tel:${contact.phoneHref}`} className="text-forest-700 underline underline-offset-2">
                {contact.phoneDisplay}
              </a>
            </address>
          </div>
        </div>
      </section>
    </>
  );
}
