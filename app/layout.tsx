import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import Header from "@/components/Header";
import { StoreProvider } from "@/components/StoreProvider";
import Footer from "@/components/Footer";
import { site, contact } from "@/lib/site";
import "./globals.css";

/* Display face: Fraunces. High-contrast, optically sized, with just enough
   warmth for a botanical brand without tipping into "artisanal". */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

/* Text face: Manrope. Geometric-humanist, excellent numerals for spec tables. */
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Genomed Pharmaceuticals — Ayurvedic Medicine Manufacturer in India",
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    url: site.url,
    title: "Genomed Pharmaceuticals — Ayurvedic Medicine Manufacturer in India",
    description: site.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#f8faf9",
  width: "device-width",
  initialScale: 1,
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  description: site.description,
  address: {
    "@type": "PostalAddress",
    streetAddress: contact.addressLines[0],
    addressLocality: "Bulandshahr",
    addressRegion: "Uttar Pradesh",
    postalCode: "203001",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: contact.phoneHref,
    email: contact.email,
    contactType: "sales",
    areaServed: "IN",
    availableLanguage: ["en", "hi"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:bg-forest-950 focus:px-5 focus:py-3 focus:text-white"
        >
          Skip to content
        </a>
        <StoreProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
