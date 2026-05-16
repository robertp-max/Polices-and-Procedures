/**
 * MVP-P1-PRINT-001 (Wave 5A) — Canonical print CSS as a pure string.
 *
 * This module is the SINGLE SOURCE OF TRUTH for the @media print rules
 * that all Care Indeed print paths share: page size, margins, color-adjust,
 * .no-print suppression, table avoid-break, thead behavior, body chrome reset.
 *
 * IT IS PURE: no React imports, no `document`, no `window`, no Vite asset
 * URLs. The returned string is safe to embed in:
 *   - a React-managed <style> element (PrintFrame.tsx)
 *   - a raw HTML string returned by `buildPrintablePacketHtml` (Wave 5b
 *     under eCign sign-off — DO NOT touch in Wave 5A)
 *   - `packetToSurveyHtml` (`src/policy/audit/surveyPacket.ts`, Wave 5b+)
 *
 * BYTE-STABILITY (Wave 3 ECIGN-002 invariant):
 *   When this string is embedded in a hashed artifact (eCign signed
 *   packet), the OUTPUT bytes must be deterministic for the same OPTIONS.
 *   No `Date.now()`, no `Math.random()`, no `crypto.randomUUID()`. Whitespace
 *   and selector ordering are part of the public contract.
 */

export type PrintPageSize = 'letter' | 'a4';

export type PrintVisibilityIsolation =
  | 'none'        // print whole document
  | 'has-root';   // use `body:has(<contentScopeSelector>)` to print only the subtree

export interface BuildCanonicalPrintCssOptions {
  /** Page size. Default 'letter'. */
  pageSize?: PrintPageSize;
  /** Orientation. Default 'portrait'. */
  orientation?: 'portrait' | 'landscape';
  /** Page margin in inches (uniform). Default 0.5. */
  marginInches?: number;
  /** Hex brand color (for ::marker, brand-stripe). Default '#007970' (CI teal). */
  brandColor?: string;
  /**
   * Selectors that should be HIDDEN at print time (display:none !important).
   * Default ['.no-print', '.print\\:hidden'].
   */
  hideSelectors?: string[];
  /**
   * Scope table avoid-break + thead rules to a content root selector.
   * If provided, table rules apply only inside elements matching this selector.
   * If omitted, table rules apply globally inside @media print.
   * Use '.form-frame' to match FormPrintView; '.print-document' for PrintPage;
   * use null for global.
   */
  contentScopeSelector?: string | null;
  /**
   * Visibility isolation pattern. Default 'none'.
   * 'has-root' is for routes that share the document with non-print content
   * (e.g. PrintPage's `body:has(.policy-print-page)` hack).
   */
  visibilityIsolation?: PrintVisibilityIsolation;
  /**
   * When `visibilityIsolation === 'has-root'`, this selector identifies the
   * subtree that SHOULD print. Required when `visibilityIsolation = 'has-root'`.
   */
  visibilityRootSelector?: string;
}

/**
 * Build the canonical print CSS body (no <style> tags).
 */
export function buildCanonicalPrintCss(options: BuildCanonicalPrintCssOptions = {}): string {
  const {
    pageSize = 'letter',
    orientation = 'portrait',
    marginInches = 0.5,
    brandColor = '#007970',
    hideSelectors = ['.no-print', '.print\\:hidden'],
    contentScopeSelector = null,
    visibilityIsolation = 'none',
    visibilityRootSelector,
  } = options;

  const pageRule = `@page { size: ${pageSize} ${orientation}; margin: ${marginInches}in; }`;

  const mediaOpen = '@media print {';

  let visibilityRule = '';
  if (visibilityIsolation === 'has-root' && visibilityRootSelector) {
    visibilityRule = `  body:has(${visibilityRootSelector}) > *:not(${visibilityRootSelector}) { display: none !important; }\n`;
  }

  const bodyReset = `  body { background: white !important; color: black !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }`;

  const hideRules = hideSelectors
    .map((sel) => `  ${sel} { display: none !important; }`)
    .join('\n');

  const scopePrefix = contentScopeSelector ? `${contentScopeSelector} ` : '';

  const tableRules = [
    `${scopePrefix}table { page-break-inside: avoid; break-inside: avoid; border-collapse: collapse; }`,
    `${scopePrefix}thead { display: table-header-group; }`,
    `${scopePrefix}tr, ${scopePrefix}td, ${scopePrefix}th { page-break-inside: avoid; break-inside: avoid; }`,
  ].map((r) => `  ${r}`).join('\n');

  const brandStripe = `  .ci-print-brand-stripe { background-color: ${brandColor} !important; }`;

  const mediaClose = '}';

  return [
    pageRule,
    mediaOpen,
    visibilityRule,
    bodyReset,
    hideRules,
    tableRules,
    brandStripe,
    mediaClose,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Standard `.no-print` + Tailwind `print:hidden` suppression classes.
 * Re-exported so consumers can attach them without re-importing strings.
 */
export const PRINT_HIDE_CLASSES: readonly string[] = ['no-print', 'print:hidden'];

/**
 * Canonical brand color for print chrome (CI teal deep). Hex literal so it
 * can be embedded in pure strings (byte-stable). Mirrors the value used in
 * `index.css` `--ci-secondary-500` for the Care Indeed light theme.
 */
export const PRINT_BRAND_TEAL = '#007970';
