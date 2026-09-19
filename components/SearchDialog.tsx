"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, CornerDownLeft } from "lucide-react";
import { products, therapies, getTherapy, discountPct } from "@/lib/products";
import { inr } from "@/lib/format";

type Hit =
  | { kind: "product"; slug: string; title: string; sub: string; href: string; score: number }
  | { kind: "area" | "page"; title: string; sub: string; href: string; score: number };

const PAGES: { title: string; sub: string; href: string; keywords: string }[] = [
  { title: "About Genomed", sub: "Company, vision and mission", href: "/about", keywords: "about company story vision mission values manufacturer" },
  { title: "Quality & Manufacturing", sub: "QMS, practices, eight stages", href: "/quality", keywords: "quality gmp manufacturing licence schedule t batch traceability testing compliance" },
  { title: "Partner With Us", sub: "Distribution and contract manufacturing", href: "/partner", keywords: "partner distributor stockist franchise third party contract manufacturing institutional pcd" },
  { title: "Contact", sub: "Phone, email and address", href: "/contact", keywords: "contact phone email address visit location bulandshahr enquiry" },
  { title: "Product Portfolio", sub: "All formulations", href: "/products", keywords: "products portfolio range catalogue formulations list" },
];

/** Cheap ranking: exact prefix on the name beats a word match beats a substring. */
function rank(haystack: string, title: string, q: string) {
  const t = title.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(t)) return 60;
  if (t.includes(q)) return 45;
  if (haystack.includes(q)) return 25;
  return 0;
}

export default function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const index = useMemo(
    () =>
      products.map((p) => {
        const t = getTherapy(p.therapy);
        return {
          product: p,
          therapyName: t?.name ?? "",
          haystack: [p.name, p.descriptor, p.positioning, p.form, p.pack, t?.name, t?.subtitle, ...p.indications]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        };
      }),
    [],
  );

  const hits = useMemo<Hit[]>(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return [];
    const out: Hit[] = [];

    index.forEach(({ product, therapyName, haystack }) => {
      const score = rank(haystack, product.name, query);
      if (score)
        out.push({
          kind: "product",
          slug: product.slug,
          title: product.name,
          sub: `${therapyName} · ${product.form} · ${product.pack}`,
          href: `/products/${product.slug}`,
          score: score + (product.featured ? 3 : 0),
        });
    });

    therapies.forEach((t) => {
      const score = rank(`${t.name} ${t.subtitle} ${t.summary}`.toLowerCase(), t.name, query);
      if (score)
        out.push({
          kind: "area",
          title: t.name,
          sub: `Therapeutic area · ${t.subtitle}`,
          href: `/products?area=${t.slug}`,
          score: score - 2,
        });
    });

    PAGES.forEach((p) => {
      const score = rank(`${p.title} ${p.sub} ${p.keywords}`.toLowerCase(), p.title, query);
      if (score) out.push({ kind: "page", title: p.title, sub: p.sub, href: p.href, score: score - 5 });
    });

    return out.sort((a, b) => b.score - a.score).slice(0, 8);
  }, [q, index]);

  /* Reset the highlighted row when the query changes — adjusted during render
     (React's documented pattern) rather than in an effect, which would cascade
     an extra render on every keystroke. */
  const [lastQ, setLastQ] = useState(q);
  if (lastQ !== q) {
    setLastQ(q);
    setActive(0);
  }

  // Focus the field when the dialog opens, and lock the page behind it.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  /* Clearing the field belongs to the close action, not to an effect watching
     `open` — the dialog stays mounted, so state has to be reset explicitly. */
  const close = useCallback(() => {
    setQ("");
    onClose();
  }, [onClose]);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (hits.length ? (i + 1) % hits.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (hits.length ? (i - 1 + hits.length) % hits.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hits[active]) go(hits[active].href);
      else if (q.trim()) go(`/products?q=${encodeURIComponent(q.trim())}`);
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelectorAll("li")
      [active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-forest-990/45 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Genomed"
        className="w-full max-w-2xl border border-sand-300 bg-white shadow-raise-lg"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-sand-200 px-5">
          <Search className="h-5 w-5 flex-none text-sand-600" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, therapeutic areas, pages…"
            aria-label="Search products, therapeutic areas and pages"
            className="w-full bg-transparent py-5 text-lg text-forest-950 placeholder:text-sand-400 focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Close search"
            className="grid h-11 w-11 flex-none place-items-center text-sand-600 hover:text-forest-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {q.trim().length >= 2 && (
          <ul ref={listRef} className="max-h-[52vh] overflow-y-auto">
            {hits.length === 0 && (
              <li className="px-5 py-10 text-center text-sand-600">
                Nothing matched “{q.trim()}”. Try a product name, a condition, or “distributor”.
              </li>
            )}
            {hits.map((h, i) => {
              const p = h.kind === "product" ? products.find((x) => x.slug === h.slug) : null;
              const off = p ? discountPct(p) : 0;
              return (
                <li key={h.href}>
                  <Link
                    href={h.href}
                    onClick={close}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-4 border-b border-sand-100 px-5 py-3.5 transition-colors ${
                      i === active ? "bg-forest-50" : "hover:bg-sand-50"
                    }`}
                  >
                    {p?.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.photo}
                        alt=""
                        className="h-12 w-12 flex-none object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="grid h-12 w-12 flex-none place-items-center bg-sand-100 text-sand-600">
                        <Search className="h-4 w-4" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-forest-950">{h.title}</span>
                      <span className="block truncate text-sm text-sand-600">{h.sub}</span>
                    </span>
                    {p && (
                      <span className="flex-none text-right">
                        <span className="tnum block text-sm font-bold text-forest-800">
                          {inr(p.mrp)}
                        </span>
                        {off > 0 && (
                          <span className="block text-[0.75rem] font-bold text-gold-700">
                            −{off}%
                          </span>
                        )}
                      </span>
                    )}
                    {i === active && (
                      <CornerDownLeft className="h-4 w-4 flex-none text-sand-400" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 bg-sand-50 px-5 py-3 text-caption text-sand-600">
          <span>
            <kbd className="border border-sand-300 bg-white px-1.5 py-0.5 font-sans">↑</kbd>{" "}
            <kbd className="border border-sand-300 bg-white px-1.5 py-0.5 font-sans">↓</kbd> to
            navigate ·{" "}
            <kbd className="border border-sand-300 bg-white px-1.5 py-0.5 font-sans">Enter</kbd> to
            open ·{" "}
            <kbd className="border border-sand-300 bg-white px-1.5 py-0.5 font-sans">Esc</kbd> to
            close
          </span>
          <Link href="/products" onClick={close} className="font-semibold text-forest-700">
            Browse all products
          </Link>
        </div>
      </div>
    </div>
  );
}
