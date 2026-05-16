/**
 * AriaLiveRegion — canonical aria-live announcement primitive replacing scattered
 * `aria-live` patterns across the codebase.
 *
 * Purpose: provide a stable, reusable live region for dynamic status messages
 * that don't have their own visible UI (e.g. "Saved", "Upload complete",
 * "5 results filtered").
 *
 * Distinction:
 * - Unlike LoadingState (which bundles role="status" + aria-live="polite" for
 *   loading-specific states with spinner/label), this primitive is purely for
 *   text announcements and supports polite/assertive/off.
 * - Unlike StalenessBanner (a visible banner with built-in live region for
 *   staleness notices), this is an invisible (by default) announcement-only region.
 *
 * Adoption guidance: use for transient, non-UI status updates that should be
 * announced to assistive technology without adding visual clutter.
 * A11Y-003 will adopt this in a later slice.
 *
 * A11y notes: the region MUST remain mounted in the DOM at all times.
 * Re-mounting defeats the purpose because screen readers only announce
 * changes to an existing live region. Keep the wrapper stable; only mutate
 * its text/children content.
 *
 * Reduced-motion: not applicable (purely text-based, no animations).
 */

import type { ReactNode } from 'react';

export interface AriaLiveRegionProps {
  /**
   * Politeness level mapping to aria-live.
   * - polite (default): announce when user is idle; queued
   * - assertive: interrupt; reserve for critical alerts (errors, escalations)
   * - off: disable announcements (effectively a normal div)
   */
  politeness?: 'polite' | 'assertive' | 'off';
  /**
   * Message text to announce. Falsy hides the region's content but keeps the
   * live region mounted so subsequent updates fire correctly.
   */
  message?: string;
  /**
   * If true, screen readers re-announce the FULL region on each change (atomic).
   * Default true.
   */
  atomic?: boolean;
  /**
   * Visually hidden but available to AT. Default true.
   * Pass false to make the announcement visible inline.
   */
  visuallyHidden?: boolean;
  /**
   * Optional explicit ARIA role. Defaults to 'status' for polite, 'alert' for assertive.
   */
  role?: 'status' | 'alert' | 'log';
  className?: string;
  /**
   * Optional children to render instead of message (advanced — caller is
   * responsible for ensuring children stay simple text for AT clarity).
   */
  children?: ReactNode;
}

export function AriaLiveRegion({
  politeness = 'polite',
  message,
  atomic = true,
  visuallyHidden = true,
  role: explicitRole,
  className,
  children,
}: AriaLiveRegionProps) {
  const ariaLive = politeness;
  let resolvedRole: 'status' | 'alert' | 'log' | undefined;

  if (explicitRole) {
    resolvedRole = explicitRole;
  } else if (politeness === 'polite') {
    resolvedRole = 'status';
  } else if (politeness === 'assertive') {
    resolvedRole = 'alert';
  }
  // for 'off' or no match, leave undefined (no role attr)

  const classes = [className, visuallyHidden ? 'sr-only' : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      aria-live={ariaLive}
      aria-atomic={atomic}
      role={resolvedRole}
      className={classes || undefined}
    >
      {children ?? message ?? null}
    </div>
  );
}
