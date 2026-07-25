"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * CareIndeedBrand — THE single approved Care Indeed brand-mark component.
 *
 * Every place in the Employee Journey app that needs to render the Care
 * Indeed logo (sidebar, mobile header, badge mockups, print headers, etc.)
 * should render <CareIndeedBrand /> instead of hand-rolling an <img>,
 * inline <svg>, or CSS-drawn approximation. This keeps the brand mark to
 * exactly one bundled, locally-hosted asset:
 *
 *   /assets/logo-careindeed-orange.png  (768x768 PNG, orange wordmark+mark)
 *
 * There is no remote/CDN fallback and no second logo file anywhere in this
 * app — see REVIEW_OUTPUTS/handbook-implementation/CANONICAL_LOGO_AUDIT.md
 * for the audit that established this as canonical, and
 * scripts/verifyBrandLogo.ts for the scanner that guards against drift.
 *
 * Rendering rules enforced here:
 *  - Local bundled asset only (no remote URL, no data: URI duplication).
 *  - Aspect ratio is always preserved — height is set explicitly per size
 *    and width is left to `auto` (or object-fit: contain), so the mark is
 *    never stretched.
 *  - No baked-in drop-shadow, border, or background chrome. Callers that
 *    want a card/badge treatment should wrap this component themselves.
 *  - Alt text follows the standard accessibility rule: when the mark is
 *    the only thing announcing "Care Indeed" at that spot, alt="Care
 *    Indeed"; when adjacent visible text already names Care Indeed (so the
 *    image is purely decorative/redundant), pass `decorative` to get
 *    alt="".
 */

const CARE_INDEED_LOGO_SRC = "/assets/logo-careindeed-orange.png";

export type CareIndeedBrandVariant = "wordmark" | "mark";
export type CareIndeedBrandTheme = "light" | "dark" | "print";

export interface CareIndeedBrandProps {
  /** "wordmark" = full lockup (the only asset we have today, so both
   *  variants currently render the same bundled file — the variant prop
   *  exists so a future dedicated mark-only asset can be swapped in
   *  without touching every call site). */
  variant?: CareIndeedBrandVariant;
  /** Visual context. "print" maps to the same asset as "light" since the
   *  orange lockup already reads correctly on white/paper backgrounds. */
  theme?: CareIndeedBrandTheme;
  /** Renders at a smaller fixed height for tight layouts (mobile headers,
   *  compact badge mockups, nav bars). */
  compact?: boolean;
  /** When true, the adjacent copy already names "Care Indeed", so this
   *  image is decorative and gets alt="" instead of alt="Care Indeed". */
  decorative?: boolean;
  /** Additional class names merged onto the <img>. */
  className?: string;
  /** Explicit pixel height override. Defaults: compact=36, regular=48. */
  height?: number;
}

const DEFAULT_HEIGHT = 48;
const COMPACT_HEIGHT = 36;

/**
 * Renders the single approved Care Indeed brand mark. See file header for
 * the full rendering-rule rationale.
 */
export function CareIndeedBrand({
  variant = "wordmark",
  theme = "light",
  compact = false,
  decorative = false,
  className,
  height,
}: CareIndeedBrandProps) {
  // variant/theme are accepted for API stability and future asset
  // swaps; today there is exactly one bundled file for every combination.
  void variant;
  void theme;

  const resolvedHeight = height ?? (compact ? COMPACT_HEIGHT : DEFAULT_HEIGHT);
  const alt = decorative ? "" : "Care Indeed";

  return (
    <img
      src={CARE_INDEED_LOGO_SRC}
      alt={alt}
      draggable={false}
      className={className}
      style={{
        height: resolvedHeight,
        width: "auto",
        objectFit: "contain",
        display: "inline-block",
      }}
    />
  );
}

export default CareIndeedBrand;
