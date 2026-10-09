import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { contact, site, media } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "Cancellation terms, return eligibility, transit damage resolution, and refund processing for Genomed herbal formulations.",
  alternates: { canonical: "/refund-policy" },
};

const UPDATED = "October 2026";

const SECTIONS: [string, string[]][] = [
  [
    "Overview & Pharmaceutical Hygiene",
    [
      `At ${site.legalName}, we take strict precautions in the manufacturing, storage, and dispatch of our AYUSH-licensed herbal medicines and syrups. Due to the therapeutic and perishable nature of pharmaceutical and wellness formulations, products once opened or tampered with cannot be returned or reused.`,
      "We offer full replacements or refunds for orders that arrive damaged, defective, expired, or incorrect, in accordance with the terms below.",
    ],
  ],
  [
    "Order Cancellation Before Dispatch",
    [
      "You may cancel your order at any time before it has been handed over to our logistics partner (Delhivery).",
      `To request a cancellation, contact our support team immediately at ${contact.phoneDisplay} or email ${contact.email} with your Order ID.`,
      "If the order has not been dispatched, a 100% refund will be initiated immediately to your original payment method.",
      "Once an order has been picked up by the courier and an Air Waybill (AWB) number has been generated, it cannot be cancelled in transit. You may refuse delivery at your doorstep, and a refund will be processed once the package returns to our facility.",
    ],
  ],
  [
    "Eligibility for Returns & Replacements",
    [
      "We accept return and replacement requests within 7 calendar days of delivery under the following specific circumstances:",
      "1. Damaged or Leaked in Transit: The bottle, container, or outer seal was broken, cracked, or visibly leaking upon arrival.",
      "2. Incorrect Product Delivered: The received item differs from the formulation or pack size specified in your order confirmation.",
      "3. Manufacturing Defect or Expiry: The product has passed its printed expiry date or displays abnormal physical discoloration/sedimentation not characteristic of the herbal formulation.",
    ],
  ],
  [
    "Non-Returnable Conditions",
    [
      "Returns and refunds cannot be entertained under the following conditions:",
      "• The protective cap seal, tamper-evident neck band, or induction foil has been opened or broken after delivery.",
      "• The product has been partially consumed or used.",
      "• The batch number, manufacturing date, or MRP label on the bottle/carton is defaced or missing.",
      "• Return requests placed more than 7 days following confirmed doorstep delivery.",
      "• Adverse reactions caused by individual patient allergies or misuse contrary to the instructions of a registered physician or pack insert.",
    ],
  ],
  [
    "How to Request a Replacement or Refund",
    [
      `1. Email ${contact.email} or WhatsApp/call ${contact.phoneDisplay} within 48 hours of delivery.`,
      "2. Quote your Order ID (e.g., ORD-...) and provide clear photographs or a short video showing the damaged package, outer courier label, and batch number.",
      "3. Our quality assurance team will review your claim within 1 working day.",
      "4. Upon approval, we will dispatch a free replacement shipment or process a complete refund based on your preference.",
    ],
  ],
  [
    "Refund Method & Timelines",
    [
      "Approved refunds are processed promptly to the original mode of payment:",
      "• Online Payments (UPI, Netbanking, Debit/Credit Cards via Razorpay): The refund will reflect in your bank account or source wallet within 5 to 7 business days, depending on your bank's clearing cycle.",
      "• Cash on Delivery (COD) Orders: Refunds will be remitted directly to your bank account via IMPS/NEFT transfer or UPI upon receipt of your verified account details.",
      "Delivery fees (if applicable) are fully refunded if the return is due to transit damage, defect, or an error on our part.",
    ],
  ],
  [
    "Contact Customer Support",
    [
      `For any questions or assistance regarding returns and refunds, please reach out directly:`,
    ],
  ],
];

export default function RefundPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Compliance & Care"
        title="Refund & Cancellation Policy"
        lede={`Transparent terms for order cancellations, transit replacements, and refunds. Last updated ${UPDATED}.`}
        video={media.qc}
        crumb={[{ label: "Refund Policy" }]}
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
            <h2 className="text-2xl font-display font-semibold text-forest-950">Grievance Officer</h2>
            <address className="mt-4 not-italic leading-relaxed text-sm sm:text-base text-sand-700 space-y-1">
              <p className="font-semibold text-forest-900">{site.legalName}</p>
              <p>{contact.addressLines.join(", ")}</p>
              <p>
                Email:{" "}
                <a href={`mailto:${contact.email}`} className="font-semibold text-forest-700 underline underline-offset-2">
                  {contact.email}
                </a>
              </p>
              <p>
                Phone:{" "}
                <a href={`tel:${contact.phoneHref}`} className="font-semibold text-forest-700 underline underline-offset-2">
                  {contact.phoneDisplay}
                </a>
              </p>
              <p className="text-xs text-sand-500 pt-2">
                Operational Hours: {contact.hours} (Excluding National Holidays)
              </p>
            </address>
          </div>
        </div>
      </section>
    </>
  );
}
