/* ════════════════════════════════════════════════════════════════
   DefenCIble — the product wordmark.
   The "CI" (Care Indeed) is emphasized in brand orange —
   heavier weight + a warm glow — while the word stays fully legible.
   Capitalization is fixed: "DefenCIble".
   Styling lives in index.css (.defencible-wordmark / .defencible-ci)
   so the glow can honour prefers-reduced-motion globally.
   ════════════════════════════════════════════════════════════════ */

export function DefenCIbleWordmark({
  glow = false,
  className = '',
}: {
  /** Soft pulsing glow on the CI mark (disabled under reduced-motion). */
  glow?: boolean;
  className?: string;
}) {
  return (
    <span className={`defencible-wordmark whitespace-nowrap${glow ? ' defencible-wordmark--glow' : ''} ${className}`}>
      Defen<span className="defencible-ci">CI</span>ble
    </span>
  );
}

/**
 * DefenCIble product lockup:
 *   DefenCIble
 *   Evidence management by Care Indeed
 * Sized to the surrounding type by passing a font-size class via `className`.
 */
export function DefenCIbleLockup({
  className = '',
  showSubtitle = true,
  glow = true,
}: {
  className?: string;
  showSubtitle?: boolean;
  glow?: boolean;
}) {
  return (
    <span className={`grid gap-0.5 ${className}`}>
      <DefenCIbleWordmark glow={glow} className="text-h3 font-medium text-ink tablet-l:text-h2" />
      {showSubtitle && (
        <span className="text-[11px] uppercase tracking-tag text-muted">Evidence management by Care Indeed</span>
      )}
    </span>
  );
}

export default DefenCIbleWordmark;
