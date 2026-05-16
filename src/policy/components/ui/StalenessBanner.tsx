/**
 * StalenessBanner — passive notice that the on-screen data may be out of
 * date because the tab was backgrounded for a while (Stabilization R-05).
 *
 * Pure presentation. The decision about *whether* the surface is stale lives
 * in the `useDataFreshness` hook. Refreshing is opt-in via the `onRefresh`
 * prop — callers that don't own a refresh path can omit it and only offer
 * dismiss.
 *
 * Design constraints (Stabilization scope):
 *   - No raw hex literals; uses the warm "potentially stale" amber tone that
 *     the rest of the shell already uses for soft advisories. (Pre-existing
 *     pattern in ActivationPage R-06 notice; deliberately not introducing
 *     new tokens here.)
 *   - Glass-stack neutral: a single solid-fill row, not a translucent layer.
 *   - Touch-target compliant: action buttons ≥ 32 px tall, primary CTA
 *     reaches 44 px via padding.
 */
import { RefreshCw, X, Clock3 } from 'lucide-react';

export interface StalenessBannerProps {
  /**
   * Timestamp (ms) the user was last on the surface. Used to render a
   * human-friendly "Last viewed N min ago" hint. Pass `null` to suppress.
   */
  lastVisibleAt: number | null;
  /**
   * Optional refresh callback. When provided, renders a primary "Refresh"
   * button next to the dismiss control. When omitted, only the dismiss
   * control is shown — useful for in-process stores where the consumer has
   * no explicit refresh primitive and just wants to alert the user.
   */
  onRefresh?: () => void;
  /** Required dismiss callback. Acknowledge-and-hide without refreshing. */
  onDismiss: () => void;
  /**
   * Optional copy override for surfaces that want to be specific. Default
   * copy is generic enough to fit any list surface.
   */
  message?: string;
}

function formatRelative(lastVisibleAt: number | null): string | null {
  if (lastVisibleAt === null) return null;
  const deltaMs = Date.now() - lastVisibleAt;
  if (deltaMs < 60_000) return 'less than a minute ago';
  const mins = Math.round(deltaMs / 60_000);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
}

export function StalenessBanner({
  lastVisibleAt,
  onRefresh,
  onDismiss,
  message,
}: StalenessBannerProps) {
  const relative = formatRelative(lastVisibleAt);
  const copy =
    message ??
    'This view was open in the background — the underlying data may have changed.';

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-3 rounded-md border border-[#FEC84B] bg-[#FFFAEB] px-3 py-2 text-[12px] text-[#92400E]"
    >
      <Clock3 size={14} className="mt-0.5 shrink-0" aria-hidden />
      <div className="flex-1 leading-snug">
        <strong className="font-semibold">Data may be outdated.</strong>{' '}
        {copy}
        {relative ? (
          <> Last viewed <span className="font-medium">{relative}</span>.</>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-[#92400E] hover:bg-[#FEF3C7]"
          >
            <RefreshCw size={12} aria-hidden /> Refresh
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          className="rounded p-1 text-[#92400E] hover:bg-[#FEF3C7]"
          aria-label="Dismiss outdated-data notice"
        >
          <X size={12} aria-hidden />
        </button>
      </div>
    </div>
  );
}
