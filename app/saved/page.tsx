import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SavedClient from "./SavedClient";
import { media } from "@/lib/site";

export const metadata: Metadata = {
  title: "Saved Products",
  description: "Formulations you have saved while browsing the Genomed portfolio.",
  alternates: { canonical: "/saved" },
  robots: { index: false, follow: true },
};

export default function SavedPage() {
  return (
    <>
      <PageHero
        eyebrow="Saved"
        title="Formulations you set aside"
        lede="Saved items are kept on this device so you can pick the range back up later, or move the whole lot into an enquiry."
        video={media.mortar}
        crumb={[{ label: "Saved" }]}
      />
      <SavedClient />
    </>
  );
}
