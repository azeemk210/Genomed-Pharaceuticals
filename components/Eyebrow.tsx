/**
 * Uppercase tracked label with a square-ended gold rule. Used above every H2.
 *
 * Both tones are dark enough for AA on a light ground; `onVideo` goes a step
 * deeper because the wash over the footage is fractionally warmer than paper.
 */
export default function Eyebrow({
  children,
  tone = "plain",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "plain" | "onVideo";
  className?: string;
}) {
  return (
    <p
      className={`eyebrow ${tone === "onVideo" ? "text-gold-800" : "text-gold-700"} ${className}`}
    >
      <span className="eyebrow-rule" aria-hidden="true" />
      {children}
    </p>
  );
}
