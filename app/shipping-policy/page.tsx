import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { contact, site, media } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy",
  description:
    "Delivery timelines, shipping fees, courier partners, live consignment tracking, and packaging standards for Genomed herbal formulations.",
  alternates: { canonical: "/shipping-policy" },
};

const UPDATED = "October 2026";

const SECTIONS: [string, string[]][] = [
  [
    "Dispatch Timeline & Processing",
    [
      `All orders placed on ${site.url} are fulfilled directly from our licensed manufacturing facility at Village Dhakauli, Bulandshahr, Uttar Pradesh.`,
      "Orders verified before 1:00 PM IST on working days (Monday to Saturday) are prepared, quality-checked, and handed over to our logistics partner within 24 to 48 hours.",
      "Orders placed on Sundays or gazetted public holidays are processed on the subsequent working business day.",
    ],
  ],
  [
    "Delivery Charges & Free Shipping Threshold",
    [
      "• Orders with a Cart Value of ₹499 or higher: FREE Standard Delivery across all serviceable PIN codes in India.",
      "• Orders below ₹499: A nominal flat shipping charge of ₹50 is added at checkout to cover regional surface courier handling.",
      "Any shipping charges applicable to your order are transparently shown in the Order Summary prior to payment confirmation.",
    ],
  ],
  [
    "Estimated Transit Times",
    [
      "We partner with Delhivery Express Surface and specialized pharmaceutical cargo logistics to ensure safe, temperature-controlled delivery:",
      "• Delhi NCR & Western Uttar Pradesh: 1 to 2 business days from dispatch.",
      "• Tier 1 Metro Cities (Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Pune, Ahmedabad): 3 to 4 business days.",
      "• Rest of India & Tier 2 / 3 Towns: 4 to 6 business days.",
      "• Remote regions, North East & Jammu & Kashmir: 6 to 8 business days.",
      "Please note that weather disruptions, regional transport strikes, or festive delivery congestion may occasionally cause minor transit delays.",
    ],
  ],
  [
    "Live Consignment Tracking",
    [
      "As soon as your shipment is dispatched, you will receive an automated notification containing your Delhivery Air Waybill (AWB) consignment tracking number.",
      "You can track your order in real-time by entering your AWB number on Delhivery's live portal (https://www.delhivery.com/track/package) or through your Genomed order receipt page.",
    ],
  ],
  [
    "Pharmaceutical-Grade Packaging",
    [
      "Ayurvedic oral liquids, syrups, and glass containers require robust protection in transit.",
      "Every bottle is cushioned in heavy-duty bubble wrap, sealed in rigid multi-ply corrugated shippers, and sealed with tamper-evident security tape.",
      "Before accepting your delivery, please inspect the external package. If the carton is visibly crushed, wet, torn, or has broken security tape, please take a photo and reject delivery, or note 'Damaged Package' on the delivery receipt.",
    ],
  ],
  [
    "Cash on Delivery (COD) Guidelines",
    [
      "Cash on Delivery is available for serviceable pincodes across India.",
      "Please ensure that exact cash is ready upon arrival of the delivery executive. Delhivery delivery agents also accept digital UPI payments at doorstep for your convenience.",
      "Repeated refusal of verified COD shipments may result in restriction of COD payment eligibility for future orders.",
    ],
  ],
  [
    "Non-Delivery & Address Corrections",
    [
      "If you notice an error in your shipping address after placing an order, please contact our helpline immediately at +91 97604 11123.",
      "If an order cannot be delivered after 3 delivery attempts due to an incorrect address, non-responsive recipient, or unreachable contact number, the package will return to our warehouse (RTO - Return to Origin). Re-dispatch in such cases may incur an additional delivery fee.",
    ],
  ],
];

export default function ShippingPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Logistics & Delivery"
        title="Shipping & Delivery Policy"
        lede={`Reliable dispatch direct from our Uttar Pradesh plant across all serviceable pincodes in India. Last updated ${UPDATED}.`}
        video={media.qc}
        crumb={[{ label: "Shipping Policy" }]}
      />

      <section className="shell-narrow py-16 md:py-24">
        <div className="space-y-10">
          {SECTIONS.map(([heading, paras]) => (
            <div key={heading}>
              <h2 className="text-2xl font-display font-semibold text-forest-950">{heading}</h2>
              <div className="mt-4 space-y-3">
                {paras.map((p) => (
                  <p key={p.slice(0, 40)} className="text-sm sm:text-base leading-relaxed text-sand-700">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-sand-200 pt-8">
            <h2 className="text-2xl font-display font-semibold text-forest-950">Shipping Helpdesk</h2>
            <address className="mt-4 not-italic leading-relaxed text-sm sm:text-base text-sand-700 space-y-1">
              <p className="font-semibold text-forest-900">{site.legalName} — Logistics Cell</p>
              <p>{contact.addressLines.join(", ")}</p>
              <p>
                Email:{" "}
                <a href={`mailto:${contact.email}`} className="font-semibold text-forest-700 underline underline-offset-2">
                  {contact.email}
                </a>
              </p>
              <p>
                Helpline:{" "}
                <a href={`tel:${contact.phoneHref}`} className="font-semibold text-forest-700 underline underline-offset-2">
                  {contact.phoneDisplay}
                </a>
              </p>
              <p className="text-xs text-sand-500 pt-2">
                Operational Hours: {contact.hours} (Monday – Saturday)
              </p>
            </address>
          </div>
        </div>
      </section>
    </>
  );
}
