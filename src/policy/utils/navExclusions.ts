/**
 * Navigation exclusion rules for the universal shell nav controls.
 *
 * Routes that match any pattern here are considered "immersive detail views"
 * where keyboard arrow-key and swipe navigation must NOT trigger shell-level
 * back/forward movement.
 *
 * Rationale for each exclusion:
 *
 *  /library/:policyId   — policy detail/viewer; has its own close/back button;
 *                         shell chrome is hidden (detailMode); left-arrow is
 *                         commonly used by PDF viewers / text selection.
 *
 *  /gv-policy/:policyId — governance policy detail view; same reasons as above.
 *
 *  /forms/:formId       — form viewer; user may be filling out form fields;
 *                         arrow keys navigate within inputs, dropdowns, etc.
 *
 *  /forms/:formId/print — form print layout; outside the shell entirely but
 *                         listed here as a defence-in-depth guard.
 *
 *  /print/*             — standalone print pages rendered outside the shell;
 *                         again outside layout, but guarded defensively.
 *
 *  /drafts/:policyId    — draft policy editor; active text editing environment.
 *
 *  /brad-proposal       — hidden executive view; rendered outside the shell.
 *
 * The shell header (and therefore the Back/Forward buttons) is already hidden
 * by `hideChrome` for the first three patterns, but keyboard and swipe
 * listeners are added globally and must be independently guarded.
 */

const EXCLUDED_PATTERNS: RegExp[] = [
  /^\/library\/.+/,
  /^\/gv-policy\/.+/,
  /^\/forms\/[^/]+(\/|$)/, // /forms/:formId  and  /forms/:formId/print
  /^\/print(\/|$)/,
  /^\/drafts\/.+/,
  /^\/brad-proposal/,
];

/**
 * Returns `true` when the shell's keyboard-arrow and swipe navigation
 * listeners should be disabled for the given pathname.
 */
export function isNavExcludedRoute(pathname: string): boolean {
  return EXCLUDED_PATTERNS.some(pattern => pattern.test(pathname));
}

/**
 * Returns `true` when a native interactive element (input, textarea, select,
 * contentEditable) currently holds focus.  Used to prevent arrow-key
 * navigation from firing while the user is typing.
 */
export function hasActiveInputFocus(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (el.isContentEditable) return true;
  if (el.getAttribute('contenteditable') === 'true') return true;
  // Also catch search inputs surfaced as role="searchbox" / role="combobox"
  const role = el.getAttribute('role') ?? '';
  return role === 'searchbox' || role === 'combobox' || role === 'textbox';
}
