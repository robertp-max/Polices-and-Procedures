/**
 * useDataFreshness — lightweight client-side staleness detection
 * (Stabilization R-05).
 *
 * Problem: long-lived list pages (CES task lists, Evidence list) can be left
 * open in a background tab while the underlying domain state changes
 * elsewhere — another user signs a form, a new task is emitted, an event is
 * resolved. When the user returns to the tab, the on-screen view may not
 * match reality.
 *
 * Scope (intentionally tiny):
 *   - Pure client-side detection. No new fetch logic, no server timestamps,
 *     no protected identity rewrite, no SWR / RQ adoption. The hook only
 *     observes how long the surface has been inactive.
 *   - Trigger: `visibilitychange`. When the document becomes hidden, we
 *     capture the time. When it returns to visible after more than
 *     `stalenessThresholdMs`, we flag the surface as potentially stale.
 *   - Output is purely advisory: the UI surfaces a soft notice (see
 *     `<StalenessBanner>`) so the user can decide whether to refresh. The
 *     hook itself never mutates store data or re-fetches anything; it has
 *     no opinion on what "refresh" means.
 *   - Optional `onAcknowledge` callback fires when the consumer dismisses or
 *     acts on the notice — callers can use it to log telemetry or trigger a
 *     store-level refresh if they own one.
 *
 * Out of scope (deliberately, per Stabilization R-05 rules):
 *   - Touching Evidence Center fetch logic (Protected Subsystem proximity).
 *   - Re-architecting the obligations / regulatory-execution stores.
 *   - ETag / Last-Modified header sniffing.
 *   - Cross-tab BroadcastChannel coordination.
 *
 * Usage:
 *   const { isPotentiallyStale, lastVisibleAt, acknowledge } =
 *     useDataFreshness({ stalenessThresholdMs: 5 * 60 * 1000 });
 *
 *   {isPotentiallyStale && (
 *     <StalenessBanner
 *       lastVisibleAt={lastVisibleAt}
 *       onRefresh={() => window.location.reload()}
 *       onDismiss={acknowledge}
 *     />
 *   )}
 */
import { useCallback, useEffect, useState } from 'react';

export interface UseDataFreshnessOptions {
  /**
   * How long the tab must have been hidden before the surface is considered
   * potentially stale on return. Default 5 minutes. Choose based on how
   * frequently the underlying data is expected to change — short for
   * task / event lists (~2–5 min), longer for reference pages.
   */
  stalenessThresholdMs?: number;
  /** Optional telemetry / hook called when `acknowledge()` is invoked. */
  onAcknowledge?: () => void;
}

export interface UseDataFreshnessResult {
  /** True if the user just returned to the tab after a long absence. */
  isPotentiallyStale: boolean;
  /**
   * Timestamp (ms) of the last time the page transitioned to a visible
   * state. `null` if the hook hasn't observed a visibility change yet
   * (i.e. brand new mount, page is currently visible).
   */
  lastVisibleAt: number | null;
  /**
   * Dismiss the stale flag without performing a refresh. Use when the
   * caller decides the staleness notice is no longer relevant (e.g. the
   * user already clicked Refresh, or the store has just been refreshed
   * elsewhere).
   */
  acknowledge: () => void;
}

const DEFAULT_THRESHOLD_MS = 5 * 60 * 1000;

export function useDataFreshness(
  options: UseDataFreshnessOptions = {},
): UseDataFreshnessResult {
  const { stalenessThresholdMs = DEFAULT_THRESHOLD_MS, onAcknowledge } = options;

  const [isPotentiallyStale, setIsPotentiallyStale] = useState(false);
  const [lastVisibleAt, setLastVisibleAt] = useState<number | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    let hiddenAt: number | null =
      document.visibilityState === 'hidden' ? Date.now() : null;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        return;
      }
      // visibilityState === 'visible'
      const now = Date.now();
      setLastVisibleAt(now);
      if (hiddenAt !== null && now - hiddenAt > stalenessThresholdMs) {
        setIsPotentiallyStale(true);
      }
      hiddenAt = null;
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [stalenessThresholdMs]);

  const acknowledge = useCallback(() => {
    setIsPotentiallyStale(false);
    if (onAcknowledge) onAcknowledge();
  }, [onAcknowledge]);

  return { isPotentiallyStale, lastVisibleAt, acknowledge };
}
