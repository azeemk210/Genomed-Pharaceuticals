"use client";

import { useSyncExternalStore } from "react";

/**
 * Reads `prefers-reduced-motion` as an external store rather than copying it
 * into state inside an effect — that would cascade a render on mount, and the
 * media query is exactly the kind of external system this hook is for.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    // Assume motion is fine on the server; the client corrects it immediately.
    () => false,
  );
}
