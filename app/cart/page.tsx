import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CartClient from "./CartClient";
import { media } from "@/lib/site";

export const metadata: Metadata = {
  title: "Enquiry List",
  description:
    "Review the Genomed formulations you have shortlisted and send them to us as a single order enquiry. We reply with trade pricing, minimum order quantities and availability.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <PageHero
        eyebrow="Your enquiry list"
        title="Shortlist, then send it to us in one go"
        lede="Genomed supplies through distributors and institutional buyers rather than selling online, so this list becomes an order enquiry — we reply with trade pricing and availability for your territory."
        video={media.qc}
        crumb={[{ label: "Enquiry list" }]}
      />
      <CartClient />
    </>
  );
}
