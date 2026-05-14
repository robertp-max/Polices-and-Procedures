/**
 * Opens a `/print/...` route in a new tab so the user can preview and use
 * Print / Save as PDF. Falls back to same-tab navigation if the popup is blocked.
 * Uses `opener = null` after open instead of the `noopener` feature string, which
 * can make `window.open` return null in some browsers even when a tab opens.
 */
export function openPolicyPrintRoute(pathWithQuery: string): void {
  if (typeof window === 'undefined') return;
  const w = window.open(pathWithQuery, '_blank');
  if (w) {
    try {
      w.opener = null;
    } catch {
      /* ignore */
    }
  } else {
    window.location.assign(pathWithQuery);
  }
}
