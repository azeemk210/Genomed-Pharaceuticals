"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getProduct, type Product } from "@/lib/products";

export type CartLine = { slug: string; qty: number };
export type CartRow = CartLine & { product: Product };

const CART_KEY = "genomed.cart.v1";
const SAVED_KEY = "genomed.saved.v1";
const MAX_QTY = 999;

/* ==========================================================================
   External store
   --------------------------------------------------------------------------
   localStorage is an external system, so it is read through
   useSyncExternalStore rather than copied into state inside an effect. That
   avoids the cascading render on mount, keeps two open tabs in agreement, and
   gives React a stable server snapshot to hydrate against.
   ========================================================================== */

type Snapshot = { ready: boolean; cart: CartLine[]; saved: string[] };

/** Stable object for SSR and the hydration pass — must not be recreated. */
const EMPTY: Snapshot = { ready: false, cart: [], saved: [] };

let snapshot: Snapshot = EMPTY;
const listeners = new Set<() => void>();

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or quota — the list simply does not persist */
  }
};

const emit = () => listeners.forEach((l) => l());

/** Replace the snapshot with a new object so getSnapshot stays referentially stable. */
function commit(next: Partial<Snapshot>, persist = true) {
  snapshot = { ...snapshot, ...next, ready: true };
  if (persist && typeof window !== "undefined") {
    write(CART_KEY, snapshot.cart);
    write(SAVED_KEY, snapshot.saved);
  }
  emit();
}

function hydrate() {
  if (typeof window === "undefined") return;
  const cart = read<CartLine[]>(CART_KEY, []).filter(
    (l) => l && typeof l.slug === "string" && l.qty > 0 && getProduct(l.slug),
  );
  const saved = read<string[]>(SAVED_KEY, []).filter((s) => getProduct(s));
  snapshot = { ready: true, cart, saved };
}

// Run once at module load in the browser so the first client snapshot is already
// correct; React still hydrates against EMPTY via getServerSnapshot.
if (typeof window !== "undefined") {
  hydrate();
  window.addEventListener("storage", (e) => {
    if (e.key === CART_KEY || e.key === SAVED_KEY) {
      hydrate();
      emit();
    }
  });
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

/* ---------- mutations ---------- */

export function addToCart(slug: string, qty = 1) {
  if (!getProduct(slug)) return;
  const cart = [...snapshot.cart];
  const at = cart.findIndex((l) => l.slug === slug);
  if (at === -1) cart.push({ slug, qty: Math.min(qty, MAX_QTY) });
  else cart[at] = { slug, qty: Math.min(cart[at].qty + qty, MAX_QTY) };
  commit({ cart });
}

export function setCartQty(slug: string, qty: number) {
  const cart =
    qty <= 0
      ? snapshot.cart.filter((l) => l.slug !== slug)
      : snapshot.cart.map((l) => (l.slug === slug ? { ...l, qty: Math.min(qty, MAX_QTY) } : l));
  commit({ cart });
}

export const removeFromCart = (slug: string) =>
  commit({ cart: snapshot.cart.filter((l) => l.slug !== slug) });

export const clearCart = () => commit({ cart: [] });

export function toggleSavedItem(slug: string) {
  if (!getProduct(slug)) return;
  const saved = snapshot.saved.includes(slug)
    ? snapshot.saved.filter((s) => s !== slug)
    : [...snapshot.saved, slug];
  commit({ saved });
}

/* ---------- hook ---------- */

export function useStore() {
  const { ready, cart, saved } = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => EMPTY,
  );

  return useMemo(() => {
    const rows: CartRow[] = cart
      .map((l) => {
        const product = getProduct(l.slug);
        return product ? { ...l, product } : null;
      })
      .filter((r): r is CartRow => r !== null);

    return {
      ready,
      cart,
      rows,
      count: rows.reduce((n, r) => n + r.qty, 0),
      subtotal: rows.reduce((n, r) => n + r.product.mrp * r.qty, 0),
      savings: rows.reduce(
        (n, r) => n + Math.max(0, (r.product.listPrice ?? r.product.mrp) - r.product.mrp) * r.qty,
        0,
      ),
      saved,
      isSaved: (slug: string) => saved.includes(slug),
      add: addToCart,
      setQty: setCartQty,
      remove: removeFromCart,
      clear: clearCart,
      toggleSaved: toggleSavedItem,
    };
  }, [ready, cart, saved]);
}

/** Kept so the root layout has a single place to mount store-wide UI later. */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
