"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import ProductCard from "./ProductCard";
import TherapyIcon from "./TherapyIcon";
import Reveal from "./Reveal";
import type { Product, Therapy } from "@/lib/products";

type AreaWithCount = Therapy & { count: number };

export default function ProductFilter({
  products,
  areas,
  forms,
}: {
  products: Product[];
  areas: AreaWithCount[];
  forms: Product["form"][];
}) {
  /* Honour ?area=… arriving from the home page or footer. Seeded during the
     first render rather than in an effect, so there is no flash of the full
     list and no cascading render on mount. */
  const params = useSearchParams();
  const [area, setArea] = useState(() => {
    const initial = params.get("area");
    return initial && areas.some((a) => a.slug === initial) ? initial : "all";
  });
  const [form, setForm] = useState("all");
  const [q, setQ] = useState(() => params.get("q") ?? "");
  const gridRef = useRef<HTMLDivElement>(null);

  /* Keep the URL shareable as the filter changes. */
  useEffect(() => {
    const url = new URL(window.location.href);
    if (area === "all") url.searchParams.delete("area");
    else url.searchParams.set("area", area);
    if (!q.trim()) url.searchParams.delete("q");
    else url.searchParams.set("q", q.trim());
    window.history.replaceState({}, "", url);
  }, [area, q]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter((p) => {
      if (area !== "all" && p.therapy !== area) return false;
      if (form !== "all" && p.form !== form) return false;
      if (!needle) return true;
      const t = areas.find((a) => a.slug === p.therapy);
      return [p.name, p.descriptor, p.positioning, p.form, p.pack, t?.name, t?.subtitle]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [products, area, form, q, areas]);

  const selectArea = (slug: string, scroll = false) => {
    setArea(slug);
    if (scroll) gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const areaLabel = area === "all" ? "" : ` in ${areas.find((a) => a.slug === area)?.name}`;
  const formLabel = form === "all" ? "" : ` (${form.toLowerCase()})`;

  const pill = (on: boolean) =>
    `px-4 py-2.5 text-sm font-semibold transition-colors border ${
      on
        ? "border-forest-700 bg-forest-700 text-white"
        : "border-sand-300 bg-white text-sand-700 hover:border-forest-500 hover:text-forest-700"
    }`;

  return (
    <>
      {/* ---- square area tiles ---- */}
      <section className="shell py-14 md:py-20">
        {/* Gives the page an h2 between the h1 and the product-card h3s, and
            labels what the tiles actually do. */}
        <h2 className="mb-8 text-3xl">Browse by therapeutic area</h2>
        <div className="grid grid-cols-2 border-l border-t border-sand-200 lg:grid-cols-4">
          {areas.map((a, i) => (
            <Reveal key={a.slug} delay={i * 55}>
              <button
                type="button"
                onClick={() => selectArea(a.slug, true)}
                aria-pressed={area === a.slug}
                className={`group relative flex h-full w-full flex-col justify-between border-b border-r border-sand-200 p-5 text-left transition-colors duration-300 md:aspect-square md:p-7 ${
                  area === a.slug ? "bg-forest-50" : "hover:bg-forest-50"
                }`}
              >
                {/* Selected state is marked by a gold bar as well as a tint, so
                    it does not rely on colour alone. */}
                <span
                  className={`absolute inset-x-0 top-0 h-1 bg-gold-500 transition-opacity duration-300 ${
                    area === a.slug ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                />
                <span
                  className={`grid h-11 w-11 place-items-center border transition-colors duration-300 ${
                    area === a.slug
                      ? "border-forest-700 bg-forest-700 text-white"
                      : "border-sand-200 bg-sand-50 text-forest-700 group-hover:border-forest-700 group-hover:bg-forest-700 group-hover:text-white"
                  }`}
                >
                  <TherapyIcon name={a.icon} className="h-5 w-5" />
                </span>

                <span className="mt-6 block">
                  <span className="block text-[0.75rem] font-bold uppercase tracking-[0.16em] text-gold-700">
                    {a.subtitle}
                  </span>
                  <span className="mt-1.5 block font-display text-xl font-semibold text-forest-950">
                    {a.name}
                  </span>
                  <span className="mt-2.5 block text-sm leading-snug text-sand-600">
                    {a.summary}
                  </span>
                  <span
                    className={`mt-4 block border-t pt-3 text-sm font-semibold text-forest-700 transition-colors duration-300 ${
                      area === a.slug ? "border-forest-200" : "border-sand-200 group-hover:border-forest-200"
                    }`}
                  >
                    {a.count} {a.count === 1 ? "formulation" : "formulations"}
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- filters + grid ---- */}
      <section ref={gridRef} className="shell scroll-mt-28 pb-16 md:pb-24">
        <h2 className="mb-8 text-3xl">All formulations</h2>
        <div className="mb-8 grid gap-6 border border-sand-200 bg-sand-50 p-5 md:p-7">
          <div>
            <label
              htmlFor="product-search"
              className="mb-3 block text-[0.75rem] font-bold uppercase tracking-[0.16em] text-sand-600"
            >
              Search the portfolio
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-600" />
              <input
                id="product-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Product name, condition or dosage form…"
                className="w-full border border-sand-300 bg-white py-3 pl-11 pr-11 text-base text-forest-950 placeholder:text-sand-400 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-100 [&::-webkit-search-cancel-button]:appearance-none"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  aria-label="Clear search"
                  className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center text-sand-600 hover:text-forest-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <p
              id="lbl-area"
              className="mb-3 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-sand-600"
            >
              Therapeutic area
            </p>
            <div role="group" aria-labelledby="lbl-area" className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selectArea("all")}
                aria-pressed={area === "all"}
                className={pill(area === "all")}
              >
                All areas
              </button>
              {areas.map((a) => (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => selectArea(a.slug)}
                  aria-pressed={area === a.slug}
                  className={pill(area === a.slug)}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p
              id="lbl-form"
              className="mb-3 text-[0.75rem] font-bold uppercase tracking-[0.16em] text-sand-600"
            >
              Dosage form
            </p>
            <div role="group" aria-labelledby="lbl-form" className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setForm("all")}
                aria-pressed={form === "all"}
                className={pill(form === "all")}
              >
                All forms
              </button>
              {forms.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setForm(f)}
                  aria-pressed={form === f}
                  className={pill(form === f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p role="status" aria-live="polite" className="mb-6 text-sm text-sand-600">
          {shown.length === 0
            ? `No formulations match${q.trim() ? ` “${q.trim()}”` : " that combination"}`
            : `Showing ${shown.length} ${
                shown.length === 1 ? "formulation" : "formulations"
              }${areaLabel}${formLabel}${q.trim() ? ` for “${q.trim()}”` : ""}`}
        </p>

        {shown.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="grid justify-items-center gap-4 border border-dashed border-sand-300 py-20 text-center">
            <p className="text-sand-600">No formulations match that combination.</p>
            <button
              type="button"
              onClick={() => {
                setArea("all");
                setForm("all");
                setQ("");
              }}
              className="group inline-flex items-center gap-2 py-1 pointer-coarse:min-h-11 pointer-coarse:py-3 text-sm font-bold text-forest-700"
            >
              Clear filters
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </section>
    </>
  );
}
