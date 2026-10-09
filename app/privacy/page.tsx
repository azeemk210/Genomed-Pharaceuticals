import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { contact, site, media } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Genomed Pharmaceuticals collects, uses and protects the information you send through this website.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "September 2026";

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        lede={`How we handle the information you send us through this website. Last updated ${UPDATED}.`}
        video={media.qc}
        crumb={[{ label: "Privacy Policy" }]}
      />

      <section className="shell-narrow py-16 md:py-24">
        <div className="space-y-10 [&_h2]:text-2xl [&_p]:mt-4 [&_p]:text-sand-600">
          <div>
            <h2>What this policy covers</h2>
            <p>
              This policy applies to {site.url} and to information you provide when browsing,
              submitting distributor enquiries, or placing orders for our herbal formulations.
              We are committed to maintaining data privacy, integrity, and security across all
              interactions.
            </p>
          </div>

          <div>
            <h2>What we collect</h2>
            <p>
              We collect information that you explicitly provide when contacting us or completing an order:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-sand-600">
              <li><strong>Contact & Identity:</strong> Name, phone number, and optional email address.</li>
              <li><strong>Delivery Information:</strong> Flat/house number, street address, locality, city, state, and 6-digit postal PIN code for order fulfilment.</li>
              <li><strong>Verification Data:</strong> Mobile OTP verification codes used to authenticate genuine cash-on-delivery and prepaid orders.</li>
              <li><strong>Commercial Enquiries:</strong> Firm/distributor name, expected volumes, and territory preferences.</li>
            </ul>
            <p className="mt-4">
              <strong>Payment Security:</strong> Online payments are processed directly by our PCI-DSS Level 1 compliant payment gateway partner (Razorpay). Genomed does not store, process, or have access to your credit/debit card numbers, CVVs, or bank netbanking passwords.
            </p>
          </div>

          <div>
            <h2>Third parties that assist our operations</h2>
            <ul className="mt-4 space-y-3">
              {[
                ["Razorpay", "processes online transactions securely via UPI, cards, and netbanking under RBI-mandated compliance."],
                ["Delhivery Logistics", "receives your delivery address and contact phone number solely for courier consignment transit and delivery updates."],
                ["Transactional SMS Provider", "delivers 6-digit OTP verification codes to your mobile number under TRAI DLT regulations."],
                ["Google Maps", "supplies location context on our Contact page without collecting personal profile data."],
              ].map(([name, rest]) => (
                <li key={name} className="grid grid-cols-[auto_1fr] gap-3 text-sand-600">
                  <span className="mt-2.5 h-1.5 w-1.5 flex-none bg-gold-500" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-sand-900">{name}</strong> {rest}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4">We strictly do not sell, rent, or trade your personal data to any external advertising or data brokerage networks.</p>
          </div>

          <div>
            <h2>Why we use it</h2>
            <p>
              To answer your enquiry, to send product literature, pricing or documentation you
              have asked for, and to keep a record of business correspondence. If you ask
              about distribution we may contact you again about that discussion — you can tell
              us to stop at any time.
            </p>
          </div>

          <div>
            <h2>How long we keep it</h2>
            <p>
              Enquiries are kept for as long as the business relationship or conversation is
              live, and for a reasonable period afterwards for our commercial records. If you
              ask us to delete your enquiry, we will, unless we are required to retain it by
              law.
            </p>
          </div>

          <div>
            <h2>Your rights</h2>
            <p>
              You can ask us what information we hold about you, ask us to correct it, or ask
              us to delete it. Write to{" "}
              <a
                href={`mailto:${contact.email}`}
                className="font-semibold text-forest-700 underline underline-offset-2"
              >
                {contact.email}
              </a>{" "}
              and we will respond within a reasonable period.
            </p>
          </div>

          <div>
            <h2>Security</h2>
            <p>
              This site is served over HTTPS. Enquiry data is held in our business email and
              records. We take reasonable steps to protect it, though no method of
              transmission over the internet is completely secure.
            </p>
          </div>

          <div>
            <h2>Children</h2>
            <p>
              This site is aimed at distributors, healthcare professionals and adult general
              readers. We do not knowingly collect information from children.
            </p>
          </div>

          <div>
            <h2>Changes</h2>
            <p>If this policy changes we will update the date at the top of this page.</p>
          </div>

          <div>
            <h2>Contact</h2>
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
