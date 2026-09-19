/**
 * Product listing options, shared by the server page (which reads them from the
 * URL) and the client listing (which writes them back). Kept out of the "use
 * client" module on purpose: a server component importing a value from a
 * client module gets a reference proxy, not the array.
 */
export const SORTS = [
  { key: "recommended", label: "Recommended" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "Name: A to Z" },
] as const;

export type SortKey = (typeof SORTS)[number]["key"];

export type ListingState = {
  area: string; // therapy slug or "all"
  form: string; // dosage form or "all"
  q: string;
  sort: SortKey;
};

export const isSortKey = (v: string): v is SortKey => SORTS.some((s) => s.key === v);
