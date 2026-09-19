import Link from "next/link";
import PackShot from "./PackShot";
import { AddToCartButton, SaveButton } from "./AddToCart";
import { price } from "@/lib/format";
import { getTherapy, discountPct, type Product } from "@/lib/products";

/**
 * Product card.
 *
 * Built to be about a quarter shorter than the one it replaces, by cutting
 * rows rather than squeezing them:
 *  - The pack stands on a lit stage (`.product-stage`) instead of sitting as a
 *    white photo inside a grey box. The photos are cropped to the pack (see
 *    scripts/trim-product-images.mjs), so every pack is the same visual height.
 *  - Form and pack collapse from a labelled two-column spec block into two
 *    chips — same information, one line.
 *  - Save moves onto the image corner and Add into the price row, so the
 *    full-width "Add | Details" footer bar goes.
 *  - The discount is stated once, next to the struck price it describes.
 *
 * The card is an <article>, not one big <a>: it holds its own buttons, and a
 * button inside a link is invalid and breaks keyboard use. The title link is
 * stretched over the whole card with a pseudo-element instead, and the two
 * buttons sit above that layer — so the entire card is clickable while tab
 * order stays title → save → add.
 */
export default function ProductCard({ product }: { product: Product }) {
  const therapy = getTherapy(product.therapy);
  const off = discountPct(product);

  return (
    <article
      data-area={product.therapy}
      data-form={product.form}
      className="group relative flex h-full flex-col border border-sand-200 bg-white transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-forest-200 hover:shadow-raise-md"
    >
      {/* ------------------------------- stage ------------------------------- */}
      <div className="product-stage relative aspect-[5/4] overflow-hidden">
        <div className="pack-blend absolute inset-[9%] origin-bottom transition-transform duration-400 ease-out group-hover:scale-[1.06]">
          <PackShot
            form={product.form}
            name={product.name}
            pack={product.pack}
            photo={product.photo}
          />
        </div>

        {/* Flags stack top-left: the saving first, then any merchandising badge. */}
        {(off > 0 || product.badge) && (
          <span className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1">
            {off > 0 && (
              <span className="tnum bg-gold-500 px-2 py-1 text-[0.75rem] font-bold tracking-wider text-forest-990">
                {off}% off
              </span>
            )}
            {product.badge && (
              <span
                className={`px-2 py-1 text-[0.75rem] font-bold tracking-wider ${
                  product.badge === "HOT" ? "bg-gold-500 text-forest-990" : "bg-forest-900 text-white"
                }`}
              >
                {product.badge}
              </span>
            )}
          </span>
        )}

        <SaveButton
          product={product}
          size="sm"
          className="absolute top-2 right-2 z-10"
        />
      </div>

      {/* ------------------------------- detail ------------------------------ */}
      <div className="flex flex-1 flex-col p-3 sm:px-5 sm:pt-4 sm:pb-5">
        <span className="text-[0.75rem] font-bold tracking-[0.16em] text-gold-700 uppercase sm:text-eyebrow">
          {therapy?.name}
        </span>

        <h3 className="mt-1 font-display text-base leading-snug font-semibold text-forest-950 sm:mt-1.5 sm:text-xl">
          <Link
            href={`/products/${product.slug}`}
            className="inline-block min-h-6 transition-colors duration-200 after:absolute after:inset-0 after:content-[''] hover:text-forest-700 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-forest-700"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 line-clamp-2 min-h-[2lh] text-xs leading-relaxed text-sand-600 sm:text-sm">
          {product.descriptor}
        </p>

        <p className="mt-2 mb-3 truncate text-caption font-medium text-sand-700 sm:mb-4">
          {product.form} · {product.pack}
        </p>

        {/* Price and control share one row from sm. Both the Add button and the
            stepper are the same fixed box, so swapping one for the other moves
            nothing; the price never shrinks, so it can never be clipped. */}
        <div className="mt-auto flex flex-col gap-2 border-t border-sand-100 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          {/* One column: list price above, selling price below. The top line is
              always laid out, so a card without a discount keeps the same
              height and its button lands in the same place as every other. */}
          <p className="flex shrink-0 flex-col whitespace-nowrap">
            <span className="tnum min-h-4 text-xs leading-4 text-sand-600">
              {off > 0 && product.listPrice ? <s>{price(product.listPrice)}</s> : null}
            </span>
            <span className="sr-only">MRP</span>
            <span className="tnum font-display text-lg leading-tight font-semibold text-forest-900 sm:text-xl">
              {price(product.mrp)}
            </span>
          </p>
          <AddToCartButton product={product} className="relative z-10 w-full sm:w-28 sm:shrink-0 pointer-coarse:sm:w-34" />
        </div>
      </div>
    </article>
  );
}
