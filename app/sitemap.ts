import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { products } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "monthly"],
    ["/products", 0.9, "monthly"],
    ["/quality", 0.8, "yearly"],
    ["/about", 0.8, "yearly"],
    ["/partner", 0.8, "yearly"],
    ["/contact", 0.7, "yearly"],
    ["/privacy", 0.2, "yearly"],
    ["/terms", 0.2, "yearly"],
  ];

  return [
    ...pages.map(([path, priority, changeFrequency]) => ({
      url: `${site.url}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...products.map((p) => ({
      url: `${site.url}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
