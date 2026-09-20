"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import ProductCard from "./ProductCard";
import TherapyIcon from "./TherapyIcon";
import { SORTS, isSortKey, type ListingState, type SortKey } from "@/lib/listing";
import type { Product, Therapy } from "@/lib/products";

type AreaWithCount = Therapy & { count: number };

/**
 * Product listing — the standard category-page layout: a compact title bar,
 * then products. Filters sit in a sticky sidebar on desktop and in a bottom
 * sheet on phones, with quick area chips above the grid for one-tap browsing.
 *
 * Initial state arrives from the server (read from the URL there), so every
 * filtered URL is fully rendered in the HTML. The previous version read the
 * URL with useSearchParams inside <Suspense>, which made the prerendered page
 * ship an empty placeholder with no products in it at all.
 *
 * State is written back to the URL with replaceState, so a filtered view can be
 * bookmarked or shared and survives a reload.
 */
export default function ProductFilter({
  products,
  areas,
  forms,
  initial,
}: {
  products: Product[];
  areas: AreaWithCount[];
  forms: Product["form"][];
  initial: ListingState;
}) {
  const [area, setArea] = useState(initial.area);
  const [form, setForm] = useState(initial.form);
  const [q, setQ] = useState(initial.q);
  const [sort, setSort] = useState<SortKey>(initial.sort);
  const [sheet, setSheet] = useState(false);
  const sheetBtnRef = useRef<HTMLButtonElement>(null);
  const sheetCloseRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  /* Re-seed from every fresh server render. The page's key cannot catch a link
     back to the URL this listing first mounted with (land on ?area=liver-care,
     filter to renal, follow a "Liver Care" link: same key, no remount). State
     is always mirrored to the URL, so a refresh re-seeds with what is shown. */
  const [seed, setSeed] = useState(initial);
  if (seed !== initial) {
    setSeed(initial);
    setArea(initial.area);
    setForm(initial.form);
    setQ(initial.q);
    setSort(initial.sort);
  }

  /* Area chips: which edges still hide chips, and keep the chosen one in view
     — arriving on ?area=… may select a chip that starts off screen. */
  const chipsRef = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ left: false, right: false });
  const measureChips = () => {
    const el = chipsRef.current;
    if (!el) return;
    const left = el.scrollLeft > 4;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setMore((m) => (m.left === left && m.right === right ? m : { left, right }));
  };
  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;
    const on = el.querySelector<HTMLElement>("[aria-pressed='true']");
    // Scroll the strip only — scrollIntoView would also move the page.
    if (on) el.scrollTo({ left: on.offsetLeft - (el.clientWidth - on.offsetWidth) / 2 });
    measureChips();
    const ro = new ResizeObserver(measureChips);
    ro.observe(el);
    return () => ro.disconnect();
  }, [area]);

  /* Shareable URL. Keeps Next's own history state rather than wiping it. */
  useEffect(() => {
    const url = new URL(window.location.href);
    const put = (k: string, v: string, fallback: string) =>
      !v || v === fallback ? url.searchParams.delete(k) : url.searchParams.set(k, v);
    put("area", area, "all");
    put("form", form, "all");
    put("q", q.trim(), "");
    put("sort", sort, "recommended");
    window.history.replaceState(window.history.state, "", url);
  }, [area, form, q, sort]);

  /* Mobile sheet: focus in and kept in, Esc out, focus back to the trigger, no
     page scroll behind it, and it closes itself if the window grows to desktop
     width. */
  useEffect(() => {
    if (!sheet) return;
    const trigger = sheetBtnRef.current;
    sheetCloseRef.current?.focus();
    const close = () => setSheet(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !sheetRef.current) return;
      // aria-modal only hides the page from screen readers; Tab still walks
      // into it unless the ends of the sheet wrap round.
      const items = sheetRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]):not([tabindex='-1']), input, select",
      );
      const head = items[0];
      const tail = items[items.length - 1];
      const at = document.activeElement;
      if (!sheetRef.current.contains(at) || at === (e.shiftKey ? head : tail)) {
        e.preventDefault();
        (e.shiftKey ? tail : head)?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && close();
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [sheet]);

  /* ---- filtering, facet counts, sorting ---- */
  const needle = q.trim().toLowerCase();
  const matched = useMemo(
    () =>
      needle
        ? products.filter((p) => {
            const t = areas.find((a) => a.slug === p.therapy);
            return [p.name, p.descriptor, p.positioning, p.form, p.pack, t?.name, t?.subtitle]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(needle);
          })
        : products,
    [products, areas, needle],
  );

  // Each facet counts against the other active filters, so a count always
  // says how many products clicking it would show.
  const areaCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of matched) if (form === "all" || p.form === form) m.set(p.therapy, (m.get(p.therapy) ?? 0) + 1);
    return m;
  }, [matched, form]);
  const formCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of matched) if (area === "all" || p.therapy === area) m.set(p.form, (m.get(p.form) ?? 0) + 1);
    return m;
  }, [matched, area]);

  const shown = useMemo(() => {
    const list = matched.filter(
      (p) => (area === "all" || p.therapy === area) && (form === "all" || p.form === form),
    );
    const by = {
      recommended: (a: Product, b: Product) => Number(!!b.featured) - Number(!!a.featured),
      "price-asc": (a: Product, b: Product) => a.mrp - b.mrp,
      "price-desc": (a: Product, b: Product) => b.mrp - a.mrp,
      name: (a: Product, b: Product) => a.name.localeCompare(b.name),
    }[sort];
    return [...list].sort(by);
  }, [matched, area, form, sort]);

  const areaObj = areas.find((a) => a.slug === area);
  const active = [
    area !== "all" && { key: "area", label: areaObj?.name ?? area, clear: () => setArea("all") },
    form !== "all" && { key: "form", label: form, clear: () => setForm("all") },
    needle && { key: "q", label: `“${q.trim()}”`, clear: () => setQ("") },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];
  const clearAll = () => {
    setArea("all");
    setForm("all");
    setQ("");
  };

  const panelProps = {
    areas,
    forms,
    area,
    setArea,
    form,
    setForm,
    q,
    setQ,
    areaCounts,
    formCounts,
    allAreas: matched.filter((p) => form === "all" || p.form === form).length,
    allForms: matched.filter((p) => area === "all" || p.therapy === area).length,
  };

  return (
    <>
      {/* ---------------------------- title bar ---------------------------- */}
      <section className="border-b border-sand-200 bg-sand-50">
        <div className="shell py-6 md:py-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-caption text-sand-700">
              <li>
                <Link
                  href="/"
                  className="inline-block py-1 hover:text-forest-700 pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:py-3"
                >
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3 w-3 text-sand-400" aria-hidden="true" />
                {areaObj ? (
                  <button
                    type="button"
                    onClick={() => setArea("all")}
                    className="inline-block py-1 hover:text-forest-700 pointer-coarse:min-h-11 pointer-coarse:py-3"
                  >
                    Products
                  </button>
                ) : (
                  <span aria-current="page" className="font-semibold text-forest-900">
                    Products
                  </span>
                )}
              </li>
              {areaObj && (
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3 text-sand-400" aria-hidden="true" />
                  <span aria-current="page" className="font-semibold text-forest-900">
                    {areaObj.name}
                  </span>
                </li>
              )}
            </ol>
          </nav>
          <h1 className="mt-2 text-4xl">{areaObj ? areaObj.name : "All products"}</h1>
          <p className="mt-2 text-sand-600">
            {areaObj
              ? areaObj.summary
              : "Filter by therapeutic area or dosage form, or search by name or condition."}
          </p>
        </div>
      </section>

      {/* --------------------------- listing --------------------------- */}
      <section className="shell grid gap-8 py-6 md:py-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 lg:py-10">
        {/* Desktop filters. First in the DOM, so on wide screens a keyboard or
            screen-reader user meets the filters before the results. */}
        <aside aria-label="Filters" className="hidden lg:block">
          {/* Capped to the space under the header and scrollable within it: on a
              short laptop screen the panel is taller than the viewport, and a
              pinned panel that overflows can never be scrolled to its end. */}
          <div className="sticky top-40 -mr-3 max-h-[calc(100dvh-11rem)] overflow-y-auto overscroll-contain pr-3 [scrollbar-width:thin]">
            <FilterPanel id="side" {...panelProps} />
            {active.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="mt-6 text-sm font-semibold text-forest-700 underline underline-offset-2 hover:text-forest-800"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          {/* Heading between the page's h1 and the cards' h3s, for screen-reader
              navigation by heading; the visible toolbar already says it. */}
          <h2 className="sr-only">Results</h2>
          {/* Phone/tablet: one-tap area chips. The strip scrolls sideways, so a
              fade on whichever edge still has chips behind it says so. */}
          <div className="relative mb-4 lg:hidden">
            <div
              ref={chipsRef}
              onScroll={measureChips}
              role="group"
              aria-label="Therapeutic area"
              className="flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {[{ slug: "all", name: "All" }, ...areas].map((a) => (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => setArea(a.slug)}
                  aria-pressed={area === a.slug}
                  className={`min-h-10 flex-none snap-start border px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200 pointer-coarse:min-h-11 ${
                    area === a.slug
                      ? "border-forest-700 bg-forest-700 text-white"
                      : "border-sand-300 bg-white text-sand-700 hover:border-forest-500"
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
            {(["left", "right"] as const).map((side) => (
              <span
                key={side}
                aria-hidden="true"
                className={`pointer-events-none absolute top-0 bottom-1 w-10 from-sand-0 to-transparent transition-opacity duration-200 ${
                  side === "left" ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l"
                } ${more[side] ? "opacity-100" : "opacity-0"}`}
              />
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand-200 pb-4">
            <p role="status" aria-live="polite" className="text-sm text-sand-700">
              <span className="tnum font-bold text-forest-950">{shown.length}</span>{" "}
              {shown.length === 1 ? "product" : "products"}
              {shown.length !== products.length && (
                <span className="text-sand-600"> of {products.length}</span>
              )}
            </p>
            {/* Full width below sm, where Filters plus a fixed-width select
                would not fit a 320px screen beside the filter count. */}
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <button
                ref={sheetBtnRef}
                type="button"
                onClick={() => setSheet(true)}
                aria-haspopup="dialog"
                aria-expanded={sheet}
                className="inline-flex h-11 flex-none items-center gap-2 border border-sand-300 bg-white px-4 text-sm font-semibold text-forest-900 transition-colors hover:border-forest-600 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filters
                {active.length > 0 && (
                  <span className="tnum grid h-5 min-w-5 place-items-center bg-gold-500 px-1 text-[0.75rem] font-bold text-forest-990">
                    {active.length}
                  </span>
                )}
              </button>
              <label htmlFor="sort" className="hidden text-sm text-sand-600 sm:inline">
                Sort by
              </label>
              <div className="relative min-w-0 flex-1 sm:flex-none">
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => isSortKey(e.target.value) && setSort(e.target.value)}
                  // Matches the visible label, which is hidden below sm.
                  aria-label="Sort by"
                  className="h-11 w-full cursor-pointer appearance-none truncate border border-sand-300 bg-white pr-9 pl-3 text-base font-semibold text-forest-900 transition-colors hover:border-forest-600 sm:text-sm"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gold-700"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* Active filters */}
          {active.length > 0 && (
            <ul aria-label="Active filters" className="mt-4 flex flex-wrap items-center gap-2">
              {active.map((f) => (
                <li key={f.key}>
                  <button
                    type="button"
                    onClick={f.clear}
                    aria-label={`Remove filter: ${f.label}`}
                    className="inline-flex min-h-9 items-center gap-1.5 border border-forest-200 bg-forest-50 py-1 pr-2 pl-3 text-sm font-semibold text-forest-900 transition-colors hover:border-forest-600 pointer-coarse:min-h-11"
                  >
                    {f.label}
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={clearAll}
                  className="min-h-9 px-2 text-sm font-semibold text-forest-700 underline underline-offset-2 pointer-coarse:min-h-11"
                >
                  Clear all
                </button>
              </li>
            </ul>
          )}

          {/* Grid */}
          {shown.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4">
              {shown.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <div className="mt-6 grid justify-items-center gap-3 border border-dashed border-sand-300 px-6 py-16 text-center">
              <Search className="h-6 w-6 text-sand-400" aria-hidden="true" />
              <p className="font-display text-xl text-forest-950">No products match</p>
              <p className="max-w-sm text-sm text-sand-600">
                {needle
                  ? `Nothing in the portfolio mentions “${q.trim()}” with these filters. Try a product name or a condition such as “liver” or “sugar”.`
                  : "No product combines this area and dosage form."}
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="group mt-2 inline-flex min-h-11 items-center gap-2 bg-forest-700 px-5 text-sm font-bold text-white hover:bg-forest-800"
              >
                Clear filters and show all
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------ mobile filter sheet ------------------------ */}
      {sheet && (
        <div ref={sheetRef} className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="filters-title">
          <button
            type="button"
            aria-label="Close filters"
            tabIndex={-1}
            onClick={() => setSheet(false)}
            className="scrim-in absolute inset-0 bg-forest-990/50"
          />
          <div className="sheet-up absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col bg-white shadow-raise-lg">
            <div className="flex items-center justify-between border-b border-sand-200 px-5 py-3">
              <h2 id="filters-title" className="text-2xl">
                Filters
              </h2>
              <button
                ref={sheetCloseRef}
                type="button"
                onClick={() => setSheet(false)}
                aria-label="Close filters"
                className="grid h-11 w-11 place-items-center text-forest-900 hover:text-forest-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 py-5">
              <FilterPanel id="sheet" {...panelProps} />
            </div>
            <div className="flex gap-3 border-t border-sand-200 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={clearAll}
                disabled={active.length === 0}
                className="h-12 flex-1 border border-sand-300 text-sm font-semibold text-forest-900 disabled:opacity-40"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setSheet(false)}
                className="h-12 flex-[2] bg-forest-700 text-sm font-bold text-white hover:bg-forest-800"
              >
                Show {shown.length} {shown.length === 1 ? "product" : "products"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------------------------
   Filter panel — shared by the desktop sidebar and the phone sheet.
   --------------------------------------------------------------------------- */
function FilterPanel({
  id,
  areas,
  forms,
  area,
  setArea,
  form,
  setForm,
  q,
  setQ,
  areaCounts,
  formCounts,
  allAreas,
  allForms,
}: {
  id: string;
  areas: AreaWithCount[];
  forms: Product["form"][];
  area: string;
  setArea: (v: string) => void;
  form: string;
  setForm: (v: string) => void;
  q: string;
  setQ: (v: string) => void;
  areaCounts: Map<string, number>;
  formCounts: Map<string, number>;
  allAreas: number;
  allForms: number;
}) {
  const legend = "text-eyebrow font-bold tracking-[0.16em] text-sand-600 uppercase";
  // Selected state is a gold bar and weight as well as a tint — not colour alone.
  const row = (on: boolean, empty: boolean) =>
    `flex min-h-10 w-full items-center gap-3 border-l-[3px] px-3 text-left text-sm transition-colors duration-200 pointer-coarse:min-h-11 disabled:cursor-not-allowed disabled:opacity-45 ${
      on
        ? "border-gold-500 bg-forest-50 font-semibold text-forest-950"
        : `border-transparent text-sand-700 ${empty ? "" : "hover:bg-sand-50 hover:text-forest-800"}`
    }`;
  const count = "tnum ml-auto text-caption text-sand-600";

  return (
    <div className="space-y-7">
      <div>
        <label htmlFor={`${id}-q`} className={legend}>
          Search
        </label>
        <div className="relative mt-3">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-sand-500"
            aria-hidden="true"
          />
          <input
            id={`${id}-q`}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name or condition"
            className="h-11 w-full border border-sand-300 bg-white pr-10 pl-9 text-base text-forest-950 placeholder:text-sand-500 focus:border-forest-600 focus:outline-none focus-visible:outline-none focus:shadow-[0_0_0_3px_rgba(38,141,107,0.15)] lg:text-sm [&::-webkit-search-cancel-button]:appearance-none"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-0 grid h-11 w-10 -translate-y-1/2 place-items-center text-sand-600 hover:text-forest-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <fieldset>
        <legend className={legend}>Therapeutic area</legend>
        <ul className="mt-3 space-y-0.5">
          <li>
            <button type="button" onClick={() => setArea("all")} aria-pressed={area === "all"} className={row(area === "all", false)}>
              All areas
              <span className={count}>{allAreas}</span>
            </button>
          </li>
          {areas.map((a) => {
            const n = areaCounts.get(a.slug) ?? 0;
            const on = area === a.slug;
            return (
              <li key={a.slug}>
                <button
                  type="button"
                  onClick={() => setArea(a.slug)}
                  aria-pressed={on}
                  disabled={n === 0 && !on}
                  className={row(on, n === 0)}
                >
                  <TherapyIcon name={a.icon} className="h-4 w-4 flex-none text-forest-700" />
                  {a.name}
                  <span className={count}>{n}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className={legend}>Dosage form</legend>
        <ul className="mt-3 space-y-0.5">
          <li>
            <button type="button" onClick={() => setForm("all")} aria-pressed={form === "all"} className={row(form === "all", false)}>
              All forms
              <span className={count}>{allForms}</span>
            </button>
          </li>
          {forms.map((f) => {
            const n = formCounts.get(f) ?? 0;
            const on = form === f;
            return (
              <li key={f}>
                <button
                  type="button"
                  onClick={() => setForm(f)}
                  aria-pressed={on}
                  disabled={n === 0 && !on}
                  className={row(on, n === 0)}
                >
                  {f}
                  <span className={count}>{n}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}
