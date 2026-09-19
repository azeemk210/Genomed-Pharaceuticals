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
              This policy applies to {site.url} and to information you send us through it. It
              is written for a site that publishes company and product information and
              accepts business enquiries. We do not sell online, do not take payments through
              this site, and do not operate customer accounts.
            </p>
          </div>

          <div>
            <h2>What we collect</h2>
            <p>
              Only what you type into an enquiry form and choose to send. That is your name,
              your firm or organisation, phone number, email address, city and territory, the
              nature of your enquiry, any therapeutic areas you tick, and your message.
            </p>
            <p>
              We do not run advertising trackers or analytics cookies on this site. Our web
              host keeps standard server logs — IP address, browser type, pages requested and
              timestamps — which are used to keep the site running and secure.
            </p>
          </div>

          <div>
            <h2>Third parties that see your data</h2>
            <ul className="mt-4 space-y-3">
              {[
                ["Google Fonts", "serves the typefaces used on this site. They are self-hosted at build time, so in normal use your browser does not contact Google for them."],
                ["Google Maps", "supplies the map on the Contact page. It loads only on that page, and receives your IP address when it does."],
                ["Our form provider and email host", "process enquiries so they reach our inbox."],
              ].map(([name, rest]) => (
                <li key={name} className="grid grid-cols-[auto_1fr] gap-3 text-sand-600">
                  <span className="mt-2.5 h-1.5 w-1.5 flex-none bg-gold-500" aria-hidden="true" />
                  <span>
                    <strong className="font-semibold text-sand-900">{name}</strong> {rest}
                  </span>
                </li>
              ))}
            </ul>
            <p>We do not sell your information, and we do not pass it to anyone for marketing.</p>
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
