import type { IconKey } from "@/lib/products";

/**
 * Therapeutic-area marks. Symbolic rather than anatomical — organ drawings
 * turn to mush below about 32px, these stay legible at 20px.
 */
const PATHS: Record<IconKey, React.ReactNode> = {
  liver: (
    <>
      <path d="M3.5 9.5c0-2.2 1.8-4 4-4h9c2.2 0 4 1.8 4 4 0 5-3.6 9-8.5 9S3.5 14.5 3.5 9.5Z" />
      <path d="M12 18.5v-6" />
      <path d="M12 12.5c0-1.7 1.3-3 3-3" />
      <path d="M12 15c0-1.4-1.1-2.5-2.5-2.5" />
    </>
  ),
  metabolic: (
    <>
      <path d="M12 3.5c3.2 3.3 5.5 6.1 5.5 8.8a5.5 5.5 0 0 1-11 0c0-2.7 2.3-5.5 5.5-8.8Z" />
      <path d="M7 14h2l1.5-2.5L13 16l1.5-2h2.5" />
    </>
  ),
  renal: (
    <>
      <path d="M9.5 4C6.5 4 4 6.9 4 11s2.5 8 5.5 8c2 0 2.8-1.5 2.8-3.4 0-2 1.3-2.6 2.6-2.6" />
      <path d="M14.5 4c3 0 5.5 2.9 5.5 7s-2.5 8-5.5 8" />
      <path d="M14.9 13a2.4 2.4 0 0 0 0-4.8" />
    </>
  ),
  womens: (
    <>
      <circle cx="12" cy="9" r="5.25" />
      <path d="M12 14.25V21" />
      <path d="M9.25 18.25h5.5" />
    </>
  ),
  derma: (
    <>
      <path d="M3.5 15.5c2-2.4 4.3-3.6 6.8-3.6 3.4 0 4.6 2.4 8 2.4 1 0 1.8-.2 2.2-.4" />
      <path d="M3.5 19c2-2.4 4.3-3.6 6.8-3.6 3.4 0 4.6 2.4 8 2.4 1 0 1.8-.2 2.2-.4" />
      <path d="M14.5 8.5a2.5 2.5 0 1 0-5 0" />
      <path d="M12 3.5v1.2M17.3 5.2l-.8.9M6.7 5.2l.8.9" />
    </>
  ),
  haem: (
    <>
      <path d="M12 3.5c3.4 3.6 5.8 6.5 5.8 9.3A5.8 5.8 0 0 1 12 18.6a5.8 5.8 0 0 1-5.8-5.8c0-2.8 2.4-5.7 5.8-9.3Z" />
      <path d="M12 9.8v5.4M9.3 12.5h5.4" />
    </>
  ),
  vitality: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 13.2 12 9.4l3.5 3.8" />
      <path d="M12 9.4V16" />
    </>
  ),
  tonic: (
    <>
      <path d="M10 3.5h4" />
      <path d="M10.75 3.5v5.1L6.6 16.9A2.4 2.4 0 0 0 8.75 20.5h6.5a2.4 2.4 0 0 0 2.15-3.6L13.25 8.6V3.5" />
      <path d="M8.2 14h7.6" />
    </>
  ),
};

export default function TherapyIcon({
  name,
  className = "h-6 w-6",
}: {
  name: IconKey;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
