import Image from "next/image";

/**
 * Genomed's real wordmark, recovered from the previous site.
 *
 * NOTE: the only original on file is 200×100. It is served at 150px wide with a
 * 2× asset behind it, which holds up on a retina screen but leaves no headroom —
 * ask the client for the vector or a larger export before any print use.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/brand/logo.png"
      alt="Genomed Pharmaceuticals"
      width={200}
      height={100}
      priority
      className={`h-14 w-auto max-w-none shrink-0 md:h-16 ${className}`}
    />
  );
}
