"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu, X, Phone, Mail, MapPin, ArrowRight, ShoppingBag, Heart,
  LayoutGrid, ChevronDown, Clock, Handshake,
} from "lucide-react";
import Logo from "./Logo";
import TherapyIcon from "./TherapyIcon";
import SearchDialog from "./SearchDialog";
import SearchBar from "./SearchBar";
import { useStore } from "./StoreProvider";
import { price } from "@/lib/format";
import { nav, contact } from "@/lib/site";
import { therapyCounts } from "@/lib/products";

/**
 * Three-row header, each row with one job:
 *
 *   1  utility  — where we are, how to reach us
 *   2  navigate — green bar: "Shop by category" mega-menu plus the site nav
 *   3  primary  — logo, search, account actions, the one CTA
 *
 * The nav used to share row two with the search field, which left neither
 * enough room; the therapeutic areas ran as a separate strip below. Both now
 * live in row three, the areas behind one control.
 */
export default function Header() {
  const pathname = usePathname();
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [mega, setMega] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [drawerTop, setDrawerTop] = useState(0);
  // The drawer opens directly under the pinned header at whatever height it
  // has at this width. A fixed 76px offset hid the first item behind the
  // phone search row, which makes the header ~140px tall.
  const measureBar = () => setDrawerTop(barRef.current?.getBoundingClientRect().bottom ?? 0);
  const toggleDrawer = () => {
    measureBar();
    setOpen((v) => !v);
  };
  const { count, subtotal, saved, ready } = useStore();
  const areas = therapyCounts();

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    const raf = requestAnimationFrame(onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* Reset transient UI on navigation — adjusted during render, React's
     documented pattern for resetting state when a prop changes. */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setMega(false);
  }

  useEffect(() => {
    if (!open) return;
    // Re-measure if the phone rotates while the drawer is open.
    const onResize = () => setDrawerTop(barRef.current?.getBoundingClientRect().bottom ?? 0);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMega(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setSearch(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!mega) return;
    const onDown = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMega(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [mega]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const badge = (n: number) =>
    ready && n > 0 ? (
      <span className="tnum absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center bg-gold-500 px-1 text-[0.75rem] font-bold text-forest-990 ring-2 ring-white">
        {n > 99 ? "99+" : n}
      </span>
    ) : null;

  /* Square icon tile shared by the row's actions. Outlined at rest, filled
     brand green on hover — the same square-tile language as the therapy icons
     in the category panel. */
  const tile =
    "relative grid h-10 w-10 flex-none place-items-center border border-sand-200 bg-white text-forest-800 transition-colors duration-200 group-hover:border-forest-700 group-hover:bg-forest-700 group-hover:text-white";

  return (
    <>
      {/* ═══════════ row 1 · utility ═══════════ */}
      <div className="hidden border-b border-sand-200 bg-sand-100 text-sand-600 md:block">
        <div className="shell flex min-h-10 items-center justify-between gap-6 py-2 text-caption">
          <p className="inline-flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-gold-700" strokeWidth={1.7} />
            Herbal formulation manufacturer · {contact.addressShort}
          </p>
          <div className="flex items-center gap-6">
            <span className="hidden items-center gap-2 lg:inline-flex">
              <Clock className="h-3.5 w-3.5 text-gold-700" strokeWidth={1.7} />
              {contact.hours}
            </span>
            <a
              href={`tel:${contact.phoneHref}`}
              className="inline-flex items-center gap-2 py-0.5 font-medium transition-colors hover:text-forest-700"
            >
              <Phone className="h-3.5 w-3.5 text-gold-700" strokeWidth={1.7} />
              {contact.phoneDisplay}
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 py-0.5 font-medium transition-colors hover:text-forest-700"
            >
              <Mail className="h-3.5 w-3.5 text-gold-700" strokeWidth={1.7} />
              {contact.email}
            </a>
          </div>
        </div>
      </div>

      {/* Rows 2 and 3 pin together. Row 3 collapses on scroll so the commerce
          essentials stay reachable without 8rem of permanent chrome. */}
      <div
        ref={barRef}
        className={`sticky top-0 z-50 transition-shadow duration-300 ${
          lifted ? "shadow-bar" : ""
        }`}
      >
      {/* ═══════════ row 2 · categories + navigation ═══════════ */}
      <div
        className={`hidden grid-rows-[1fr] transition-[grid-template-rows] duration-300 lg:grid ${
          lifted && !mega ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        }`}
      >
      <div
        ref={megaRef}
        className="relative overflow-visible border-y border-forest-900/40 bg-forest-800 text-white"
      >
        <div className="shell flex items-stretch">
          {/* Shop by category — the eight areas behind one control. */}
          <button
            type="button"
            onClick={() => setMega((v) => !v)}
            aria-expanded={mega}
            aria-controls="category-panel"
            className={`-ml-1 flex items-center gap-2.5 px-4 py-3.5 text-sm font-bold transition-colors ${
              mega ? "bg-forest-900 text-white" : "text-white hover:bg-forest-900"
            }`}
          >
            <LayoutGrid className="h-4 w-4 text-gold-300" />
            Shop by category
            <ChevronDown
              className={`h-4 w-4 text-gold-300 transition-transform duration-300 ${
                mega ? "rotate-180" : ""
              }`}
            />
          </button>

          <span className="my-2.5 w-px flex-none bg-white/20" aria-hidden="true" />

          <nav aria-label="Primary" className="flex-1">
            <ul className="flex items-stretch">
              {nav.map((item) => {
                const on = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={on ? "page" : undefined}
                      className={`group relative flex items-center whitespace-nowrap px-4 py-3.5 text-sm font-semibold transition-colors ${
                        on ? "text-white" : "text-forest-100 hover:text-white"
                      }`}
                    >
                      {item.label}
                      <span
                        className={`absolute inset-x-3 bottom-0 h-[3px] origin-left bg-gold-400 transition-transform duration-300 ${
                          on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <a
            href={`tel:${contact.phoneHref}`}
            className="hidden items-center gap-2 px-3 py-3.5 text-sm font-semibold text-forest-100 transition-colors hover:text-white xl:flex"
          >
            <Phone className="h-4 w-4 text-gold-300" />
            Orders &amp; enquiries · {contact.phoneDisplay}
          </a>
        </div>

        {/* ---- category mega panel ---- */}
        {mega && (
          <div id="category-panel" className="border-b border-sand-200 bg-white shadow-[inset_0_12px_24px_-22px_rgba(4,18,15,0.6)]">
            <div className="shell py-6">
              <ul className="grid grid-cols-2 gap-1 xl:grid-cols-4">
                {areas.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/products?area=${a.slug}`}
                      onClick={() => setMega(false)}
                      className="group flex items-center gap-3 p-3 transition-colors hover:bg-forest-50"
                    >
                      <span className="grid h-11 w-11 flex-none place-items-center border border-sand-200 bg-sand-50 text-forest-700 transition-colors group-hover:border-forest-700 group-hover:bg-forest-700 group-hover:text-white">
                        <TherapyIcon name={a.icon} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-forest-950">
                          {a.name}
                        </span>
                        <span className="block text-caption text-sand-600">
                          {a.subtitle} · {a.count}{" "}
                          {a.count === 1 ? "formulation" : "formulations"}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/products"
                onClick={() => setMega(false)}
                className="mt-3 flex items-center justify-between border-t border-sand-200 px-3 pt-4 text-sm font-bold text-forest-700"
              >
                View the full portfolio — 10 formulations
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* ═══════════ row 3 · logo · search · actions ═══════════ */}
      <div className="relative bg-white">
        <div className="shell flex min-h-[5rem] items-center gap-4 py-3 lg:gap-6 xl:gap-8">
          <Link href="/" aria-label="Genomed Pharmaceuticals — home" className="flex-none">
            <Logo />
          </Link>

          {/* The search field owns the middle of the row and grows into it,
              rather than stopping short and leaving a dead gap before the
              actions. */}
          <SearchBar className="hidden min-w-0 flex-1 lg:flex xl:max-w-2xl" />

          <div className="ml-auto flex flex-none items-center gap-1 sm:gap-2 xl:gap-3">
            {/* Labelled actions: the icon alone told nobody what the heart or
                the bag held. The labels appear once there is room (xl). */}
            <Link
              href="/saved"
              aria-label={`Saved products${ready && saved.length ? ` (${saved.length})` : ""}`}
              className="group hidden items-center gap-2.5 p-0.5 sm:flex"
            >
              <span className={tile}>
                <Heart className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.8} />
                {badge(saved.length)}
              </span>
              <span className="hidden leading-tight xl:block" aria-hidden="true">
                <span className="block text-caption text-sand-600">Saved</span>
                <span className="tnum block text-sm font-bold text-forest-950">
                  {ready && saved.length
                    ? `${saved.length} ${saved.length === 1 ? "product" : "products"}`
                    : "None yet"}
                </span>
              </span>
            </Link>

            <Link
              href="/cart"
              aria-label={`Enquiry list${ready && count ? ` (${count} items)` : " (empty)"}`}
              className="group flex items-center gap-2.5 p-0.5"
            >
              <span className={tile}>
                <ShoppingBag className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.8} />
                {badge(count)}
              </span>
              <span className="hidden leading-tight xl:block" aria-hidden="true">
                <span className="block text-caption text-sand-600">Enquiry list</span>
                <span className="tnum block text-sm font-bold text-forest-950">
                  {ready && count > 0 ? price(subtotal) : "Empty"}
                </span>
              </span>
            </Link>

            {/* The one primary action. A gold icon block leads it, so it reads
                as a distinct, branded control rather than one more green box. */}
            <Link
              href="/partner"
              className="group ml-1 hidden h-12 items-stretch bg-forest-700 text-sm font-bold text-white shadow-raise-sm transition-shadow duration-300 hover:shadow-raise-md lg:inline-flex xl:ml-2"
            >
              <span
                aria-hidden="true"
                className="grid w-12 flex-none place-items-center bg-gold-500 text-forest-990 transition-colors duration-300 group-hover:bg-gold-400"
              >
                <Handshake className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="flex items-center gap-2 px-5 transition-colors duration-300 group-hover:bg-forest-800">
                Distributor Enquiry
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>

            <button
              type="button"
              onClick={toggleDrawer}
              aria-expanded={open}
              aria-controls="mobile-drawer"
              aria-label={open ? "Close menu" : "Open menu"}
              className="ml-1 grid h-11 w-11 place-items-center border border-sand-300 text-forest-900 transition-colors hover:border-forest-600 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Phone: the search field gets its own full-width line. */}
        <div className="shell pb-3 lg:hidden">
          <SearchBar />
        </div>

        <span aria-hidden="true" className="header-accent absolute inset-x-0 bottom-0 h-px" />
      </div>

      </div>

      {/* ═══════════ mobile drawer ═══════════ */}
      <div
        id="mobile-drawer"
        hidden={!open}
        style={{ top: drawerTop }}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-sand-50 lg:hidden"
      >
        <div className="shell flex h-full flex-col overflow-y-auto py-8">
          <ul className="border-t border-sand-200">
            {nav.map((item) => (
              <li key={item.href} className="border-b border-sand-200">
                <Link
                  href={item.href}
                  className={`flex items-center justify-between py-4 font-display text-2xl ${
                    isActive(item.href) ? "text-gold-700" : "text-forest-950"
                  }`}
                >
                  {item.label}
                  <ArrowRight className="h-5 w-5 text-sand-400" />
                </Link>
              </li>
            ))}
            <li className="border-b border-sand-200">
              <Link href="/saved" className="flex items-center justify-between py-4 font-display text-2xl text-forest-950">
                Saved
                <span className="tnum font-sans text-base font-bold text-sand-600">
                  {ready ? saved.length : 0}
                </span>
              </Link>
            </li>
            <li className="border-b border-sand-200">
              <Link href="/cart" className="flex items-center justify-between py-4 font-display text-2xl text-forest-950">
                Enquiry list
                <span className="tnum font-sans text-base font-bold text-sand-600">
                  {ready ? count : 0}
                </span>
              </Link>
            </li>
          </ul>

          <p className="mt-8 text-eyebrow font-bold uppercase tracking-[0.18em] text-gold-700">
            Shop by category
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {areas.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/products?area=${a.slug}`}
                  className="flex items-center gap-2.5 border border-sand-200 bg-white p-3 text-sm font-semibold text-forest-950"
                >
                  <TherapyIcon name={a.icon} className="h-5 w-5 flex-none text-forest-700" />
                  <span className="min-w-0 truncate">{a.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/partner"
            className="mt-8 inline-flex items-center justify-center gap-2 bg-forest-700 px-6 py-4 text-sm font-bold text-white"
          >
            Distributor Enquiry <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="mt-8 space-y-3 border-t border-sand-200 pt-6 text-sm text-sand-700">
            <a href={`tel:${contact.phoneHref}`} className="flex items-center gap-3 py-0.5 hover:text-forest-700">
              <Phone className="h-4 w-4 text-gold-700" /> {contact.phoneDisplay}
            </a>
            <a href={`mailto:${contact.email}`} className="flex items-center gap-3 break-all py-0.5 hover:text-forest-700">
              <Mail className="h-4 w-4 text-gold-700" /> {contact.email}
            </a>
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 flex-none text-gold-700" />
              {contact.addressLines.join(", ")}
            </p>
          </div>
        </div>
      </div>

      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </>
  );
}
