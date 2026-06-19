/**
 * MVP-P1-PRINT-001 (Wave 5A) — React hook returning canonical print theme tokens.
 *
 * Resolves the Care Indeed brand assets + colors + font stacks for use in
 * <PrintFrame> and any future ad-hoc print consumer (within React). The hook
 * is intentionally stable: returns the same object reference on every render
 * unless options change, so callers can pass it to useMemo dependency arrays.
 *
 * IMPORTANT: this hook is React-only. Pure-string serializers (Wave 5b eCign
 * packet path) must use `printStyles.PRINT_BRAND_TEAL` and inline the logo
 * data URL via the existing eCign asset import pattern, not this hook.
 *
 * NOTE: This hook deliberately does NOT depend on `lightColorRemap.ts`
 * (which is being removed in Wave 5A Track U-14). All theme values resolve
 * from canonical CSS variables (`--ci-*` in `src/index.css`) or static asset
 * imports.
 */

import { useMemo } from 'react';
import ciLogoGray from '@/assets/ci-logo-gray.png';
import { PRINT_BRAND_TEAL } from './printStyles';

export interface PrintTheme {
  /** Pre-encoded Care Indeed logo (single source of truth for the app). */
  logoDataUrl: string;
  /** Brand color hex for print chrome (CI teal deep). */
  brandColor: string;
  /** Print-safe body font family. */
  bodyFontFamily: string;
  /** Print-safe heading font family. */
  headingFontFamily: string;
  /** Default page margin in inches. */
  pageMarginInches: number;
}

export function usePrintTheme(): PrintTheme {
  return useMemo(
    () => ({
      logoDataUrl: ciLogoGray,
      brandColor: PRINT_BRAND_TEAL,
      bodyFontFamily: 'Roboto, system-ui, -apple-system, sans-serif',
      headingFontFamily: 'Montserrat, Roboto, system-ui, sans-serif',
      pageMarginInches: 0.5,
    }),
    []
  );
}
