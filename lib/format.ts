/**
 * Framework-agnostic formatters. Deliberately NOT inside StoreProvider: that
 * module is "use client", and server components render prices too.
 */
export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(n);

/**
 * Display price. Whole rupees drop the paise — "₹138", not "₹138.00" — because
 * on a card or a product headline the ".00" is noise the eye has to read past.
 * The cart keeps `inr` so its columns of line totals still align.
 */
export const price = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
