import type { Metadata } from "next";
import CartClient from "./CartClient";

export const metadata: Metadata = {
  title: "Enquiry List",
  description:
    "Review the Genomed formulations you have shortlisted and send them to us as a single order enquiry. We reply with trade pricing, minimum order quantities and availability.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: true },
};

/* No banner: the list is the page. A shopper who taps the bag icon wants to see
   what is in it, not a video and a paragraph first. */
export default function CartPage() {
  return <CartClient />;
}
