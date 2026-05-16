/* ═══════════════════════════════════════════════════════════════
  CES — Brand tokens (mode-aware)
  ───────────────────────────────────────────────────────────────
  DESIGN AUTHORITY — Lead 16 C14 amendment (2026-05-16):
  ----------------------------------------------------------------
  CES retains NAVY as its approved sub-brand identity color.
  Care Indeed teal (#007970) remains available as a highlight /
  accent where appropriate but does NOT replace navy on CES
  surfaces. The CES vertical's visual identity is intentionally
  distinct from the broader Care Indeed brand.

  SINGLE-POINT-OF-CHANGE CONTRACT (remap navy → teal):
  ----------------------------------------------------------------
  All navy-family token values are derived from the CES_NAVY_*
  constants declared at the top of this file. To remap navy →
  teal later (e.g. if leadership reverses direction), edit ONLY:

    1. CES_NAVY_LIGHT       (this file)
    2. CES_NAVY_DEEP_LIGHT  (this file)
    3. CES_NAVY_SOFT_LIGHT  (this file)
    4. The mirrored --ces-navy / --ces-navy-deep / --ces-navy-soft
       declarations in src/index.css (`CES SUB-BRAND PALETTE`
       block — kept in sync with these constants by deliberate
       two-file ownership for audit trail + atomic review).

  All React consumers must go through useCesTokens(); no consumer
  reads the CES_NAVY_* constants directly. Direct-CSS consumers
  use the --ces-* tokens defined in src/index.css.

  WHY A SEPARATE --ces-* NAMESPACE EXISTS:
  ----------------------------------------------------------------
  Lead 16 C14 (2026-05-16) explicitly approved navy as the CES
  sub-brand identity color, distinct from the broader Care
  Indeed --ci-* palette (teal/orange). The --ces-* namespace is
  a justified, scoped exception to the "single token surface"
  rule — NOT accidental dialect drift. Use --ces-* ONLY on CES
  surfaces; everything else continues to consume --ci-*.

  DARK MODE:
  ----------------------------------------------------------------
  CES dark variant is JS-detected by useCesTokens() (theme ===
  'care-indeed-light' && mode === 'dark'). Per Lead 16 C14, navy
  shifts to a readable teal accent in dark mode (existing pre-
  amendment behavior, preserved). The CSS mirror in src/index.css
  scopes --ces-* dark overrides to the matching attribute pair
  html[data-theme="care-indeed-light"][data-ci-mode="dark"].
  ═══════════════════════════════════════════════════════════════ */

import { useCiModeStore } from '@/policy/stores/ciModeStore';
import { useShellStore } from '@/policy/stores/uiStore';

/* ──────────────────────────────────────────────────────────────
 * CES brand palette — named constants (SINGLE POINT OF CHANGE).
 *
 * Values are mirrored to --ces-* custom properties in
 * src/index.css. Any change here MUST be reflected there
 * (see "REMAP CONTRACT" in the file header above).
 * ────────────────────────────────────────────────────────────── */

// Navy family — Lead 16 C14 amendment: navy is the approved CES identity.
const CES_NAVY_LIGHT       = '#1F4A8A';
const CES_NAVY_DEEP_LIGHT  = '#143366';
const CES_NAVY_SOFT_LIGHT  = '#EAF1FF';

// Orange family — accent / awaiting-signature signal.
const CES_ORANGE_LIGHT      = '#C74601';
const CES_ORANGE_SOFT_LIGHT = '#FFF1EA';

// Neutrals — text, surface, border.
const CES_INK_LIGHT         = '#1E293B';
const CES_MUTED_LIGHT       = '#64748B';
const CES_BORDER_LIGHT      = '#E2E8F0';
const CES_BORDER_SOFT_LIGHT = '#EEF2F7';
const CES_PAPER_LIGHT       = '#FFFFFF';
const CES_CANVAS_LIGHT      = '#F8FAFC';
const CES_WHITE_LIGHT       = '#FFFFFF';

// Sentiment — green / amber / red status colors.
const CES_GREEN_LIGHT       = '#0F766E';
const CES_GREEN_SOFT_LIGHT  = '#E6F7F4';
const CES_AMBER_LIGHT       = '#B45309';
const CES_AMBER_SOFT_LIGHT  = '#FFF5E8';
const CES_RED_LIGHT         = '#B91C1C';
const CES_RED_SOFT_LIGHT    = '#FEECEC';

// Dark variants — used when JS detects care-indeed-light + ciMode dark.
// Per Lead 16 C14: navy reads as teal in dark for AAA contrast against
// the dark surface; teal stays available as accent.
const CES_NAVY_DARK         = '#7ADEDF';
const CES_NAVY_DEEP_DARK    = '#C4F4F5';
const CES_NAVY_SOFT_DARK    = 'rgba(122,222,223,0.14)';
const CES_ORANGE_DARK       = '#FFC107';
const CES_ORANGE_SOFT_DARK  = 'rgba(255,193,7,0.16)';
const CES_INK_DARK          = '#F1F5F4';
const CES_MUTED_DARK        = '#B7C7C5';
const CES_BORDER_DARK       = 'rgba(122,222,223,0.24)';
const CES_BORDER_SOFT_DARK  = 'rgba(122,222,223,0.14)';
const CES_PAPER_DARK        = '#15282A';
const CES_CANVAS_DARK       = '#11242A';
const CES_WHITE_DARK        = '#15282A';
const CES_GREEN_DARK        = '#7AE2A8';
const CES_GREEN_SOFT_DARK   = 'rgba(122,226,168,0.16)';
const CES_AMBER_DARK        = '#FFD64D';
const CES_AMBER_SOFT_DARK   = 'rgba(255,214,77,0.16)';
const CES_RED_DARK          = '#FF7A7A';
const CES_RED_SOFT_DARK     = 'rgba(255,122,122,0.16)';

const CES_TOKENS_LIGHT = {
  navy:        CES_NAVY_LIGHT,
  navyDeep:    CES_NAVY_DEEP_LIGHT,
  navySoft:    CES_NAVY_SOFT_LIGHT,
  orange:      CES_ORANGE_LIGHT,
  orangeSoft:  CES_ORANGE_SOFT_LIGHT,
  ink:         CES_INK_LIGHT,
  muted:       CES_MUTED_LIGHT,
  border:      CES_BORDER_LIGHT,
  borderSoft:  CES_BORDER_SOFT_LIGHT,
  paper:       CES_PAPER_LIGHT,
  canvas:      CES_CANVAS_LIGHT,
  white:       CES_WHITE_LIGHT,
  // Semantic / status (muted, professional)
  green:       CES_GREEN_LIGHT,
  greenSoft:   CES_GREEN_SOFT_LIGHT,
  amber:       CES_AMBER_LIGHT,
  amberSoft:   CES_AMBER_SOFT_LIGHT,
  red:         CES_RED_LIGHT,
  redSoft:     CES_RED_SOFT_LIGHT,
} as const;

const CES_TOKENS_DARK: CesTokens = {
  navy:        CES_NAVY_DARK,
  navyDeep:    CES_NAVY_DEEP_DARK,
  navySoft:    CES_NAVY_SOFT_DARK,
  orange:      CES_ORANGE_DARK,
  orangeSoft:  CES_ORANGE_SOFT_DARK,
  ink:         CES_INK_DARK,
  muted:       CES_MUTED_DARK,
  border:      CES_BORDER_DARK,
  borderSoft:  CES_BORDER_SOFT_DARK,
  paper:       CES_PAPER_DARK,
  canvas:      CES_CANVAS_DARK,
  white:       CES_WHITE_DARK,
  green:       CES_GREEN_DARK,
  greenSoft:   CES_GREEN_SOFT_DARK,
  amber:       CES_AMBER_DARK,
  amberSoft:   CES_AMBER_SOFT_DARK,
  red:         CES_RED_DARK,
  redSoft:     CES_RED_SOFT_DARK,
};

export const CES_TOKENS = CES_TOKENS_LIGHT;

export type CesToken = keyof typeof CES_TOKENS_LIGHT;
export type CesTokens = {
  readonly navy: string;
  readonly navyDeep: string;
  readonly navySoft: string;
  readonly orange: string;
  readonly orangeSoft: string;
  readonly ink: string;
  readonly muted: string;
  readonly border: string;
  readonly borderSoft: string;
  readonly paper: string;
  readonly canvas: string;
  readonly white: string;
  readonly green: string;
  readonly greenSoft: string;
  readonly amber: string;
  readonly amberSoft: string;
  readonly red: string;
  readonly redSoft: string;
};

export function useCesTokens(): CesTokens {
  const theme = useShellStore(s => s.theme);
  const mode = useCiModeStore(s => s.mode);
  const isCareIndeedDark = theme === 'care-indeed-light' && mode === 'dark';
  return isCareIndeedDark ? CES_TOKENS_DARK : CES_TOKENS_LIGHT;
}
