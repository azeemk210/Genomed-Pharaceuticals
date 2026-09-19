"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { therapies } from "@/lib/products";

/**
 * Inline header search — the field-plus-category-scope control the old
 * storefront had. Submits to the products page, where the same query drives
 * the on-page filters, so there is one result surface rather than two.
 *
 * Styled as a recessed well rather than a bordered box: a tinted fill at rest
 * that lifts to white with a soft brand ring on focus, so the field reads as
 * the row's main control without needing a heavier outline. The magnifier
 * leads; the submit button carries an arrow, so there are not two magnifiers
 * in one control.
 */
export default function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [area, setArea] = useState("all");
  // The header mounts two of these (desktop row and phone line). Fixed ids
  // would repeat in the DOM, and the phone field's <label> would point at the
  // hidden desktop input, leaving the visible one unlabelled.
  const uid = useId();
  const fieldId = `${uid}-q`;
  const areaId = `${uid}-area`;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (area !== "all") params.set("area", area);
    router.push(`/products${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={`group/search flex h-12 min-w-0 items-stretch border border-sand-200 bg-sand-50 transition-[background-color,border-color,box-shadow] duration-200 hover:border-sand-300 focus-within:border-forest-600 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(38,141,107,0.12)] ${className}`}
    >
      <span
        aria-hidden="true"
        className="grid w-11 flex-none place-items-center text-sand-500 transition-colors duration-200 group-focus-within/search:text-forest-700"
      >
        <Search className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.8} />
      </span>

      {/* 16px on phones: iOS Safari zooms the whole page into any field set
          smaller than that, and does not zoom back out. */}
      <label htmlFor={fieldId} className="sr-only">
        Search for products
      </label>
      <input
        id={fieldId}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by product or therapy…"
        className="min-w-[7rem] flex-1 bg-transparent pr-3 text-base text-forest-950 sm:text-sm placeholder:text-sand-500 focus:shadow-[inset_0_-2px_0_0_var(--color-forest-600)] focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
      {/* The ring on the form shows the control is active; the underline on the
          input shows *which part* — the text field rather than the area
          dropdown, which carries its own outline when tabbed to. */}

      {/* Scope. A native select keeps keyboard and screen-reader behaviour for
          free; the chevron is drawn over it so it reads as a dropdown, which a
          bare "All areas" label did not. */}
      <div className="relative hidden flex-none items-center xl:flex">
        <span aria-hidden="true" className="h-6 w-px bg-sand-200" />
        <label htmlFor={areaId} className="sr-only">
          Limit to a therapeutic area
        </label>
        <select
          id={areaId}
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="h-full w-[9.5rem] cursor-pointer appearance-none truncate bg-transparent pr-8 pl-4 text-sm font-semibold text-forest-900 focus-visible:outline-offset-[-2px]"
        >
          <option value="all">All areas</option>
          {therapies.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 h-4 w-4 text-gold-700"
        />
      </div>

      <button
        type="submit"
        aria-label="Search"
        className="group/go m-px grid w-11 flex-none place-items-center bg-forest-700 text-white transition-colors duration-200 hover:bg-forest-800"
      >
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 group-hover/go:translate-x-0.5"
          strokeWidth={2}
        />
      </button>
    </form>
  );
}
