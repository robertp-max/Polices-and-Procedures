# UI/UX Design System Audit
**Date**: 2026-05-15  
**Primary Source**: Agent 019e2d5e-fcd5-7ac1-b8d7-2ba638815c24 (60 tool calls, full traversal) + main auditor reads of tailwind.config.js, index.css (1399 lines), ui/* primitives, CommandCenterLayout, CES theme, lightColorRemap, sample pages (GVGB, Dashboard, Library, Form*, CES*, Journey*)

---

## 1. Tailwind Usage & Configuration

**tailwind.config.js**:
- Content: `./src/**/*.{js,ts,jsx,tsx}` — good.
- Theme extend: fontFamily (outfit, montserrat, roboto, mono) — good.
- Colors: `ci` palette (gold #FFC107, gold-dark #D4AF37, maroon #420808 and deep variants, teal #007970, orange #D9A406, red, green, warning, ink, body, border, surface for dark).
- boxShadow: `glass-panel`, `glass-card`, `glow-gold` — defined but usage mixed (many custom `shadow-[...]` arbitrary).

**Usage Pattern**: Heavy Tailwind + massive overrides in index.css for `[data-shell-main] .bg-white`, `.text-slate-*`, `.border-white/*` etc. (hundreds of lines). Arbitrary values (`bg-[#... ]`, `text-[26px]`, `rounded-[14px]`, `shadow-[0_12px_30px_... ]`) extremely common (2313 inline style occurrences).

---

## 2. CSS Variables (Tokens) — Strong Definition, Weak Adoption

**:root (index.css:14-54 + semantic blocks 576-725 + Care Indeed remaps 413-748)**:
- Excellent coverage: `--ci-maroon-deep/base/glow`, `--ci-gold/dark/deep`, `--ci-teal`, `--glass-main` (33% maroon gradient), `--shadow-glass`, `--radius-*` (sm to pill), `--space-*` (4px-48px), `--ci-content-gutter`, `--ci-page-container` responsive clamps, `--ci-success/warning/error/info`, focus rings, etc.
- Multi-theme: Care Indeed light (gold→teal accent, orange CTA, white surface, no blur) + dark variant (teal-charcoal promotion). Orthogonal `data-ci-mode`.
- Print resets and accessibility (focus-visible gold/orange) strong.
- Legacy glass utilities (`.glass-morphism`, `.glass-card*`) explicitly stripped (transparent, no blur, no shadow) — "one-glass" philosophy enforced in comments.

**Adoption Gap**: Primitives (GlassPanel → `.ci-glass-panel`, SurfaceCard → `.ci-card`) use tokens + PAD maps, but most pages (GVGBDetailView, Dashboard, many CES, Journey V1, staffing, iAdministrator, FormViewer internals) use raw Tailwind slate/gray + hex + inline style. `lightColorRemap.ts` is a band-aid for gold→orange/teal in Library.

**Verdict**: Architecturally mature (best-in-class token + theme system for a compliance app). Implementation has significant drift.

---

## 3. Brand Tokens & Color Reality

- **Intended**: CI-ION deep-maroon one-glass (TravelightBG canvas + 33% glass) with gold accents. Care Indeed light solid with teal/orange.
- **Reality**:
  - GVGBDetailView (canonical QA-PG-001): Pure light hardcoded `#1F1C1B` ink, `#E5E4E3` border, `#007970` teal, `#C74600` orange, gray-50/700/800, `shadow-sm`. No GlassPanel/SurfaceCard.
  - CES: Independent `CES_TOKENS_LIGHT` (navy `#1F4A8A`, orange `#C74601`) + dark (teal `#7ADEDF`, gold). `useCesTokens()` hook + CesCard with inline.
  - eCign/FormSigning: Navy `#1A3778` + orange `#F04B22` + paper `#FAFBF8`.
  - Shell (CommandCenterLayout): Conditional glass (dark) vs solid white (light) with massive inline on `[data-shell-card]`.
  - Legacy maroon in comments, conditional paths, and some dark-only surfaces.
- **Accent Confusion**: Gold vs teal as primary accent; orange CTA varies (`#C74601`, `#D9A406`).

**Result**: Brand identity fractured. "One-glass" only fully lives in dark CI-ION shell path.

---

## 4. Typography, Spacing, Radius, Shadows

- **Typography**: Google Fonts (Outfit, Montserrat, Roboto, JetBrains Mono). Body `Outfit` + `Roboto`; h* `Outfit` + `Montserrat`. Utility classes exist. No centralized scale — inline `text-[22px]`, `text-[15px]`, `tracking-[0.22em]` everywhere. Mixed weights.
- **Spacing**: `--space-*` defined but almost unused. Primitives hardcode 12/16/24px. Arbitrary `p-5`, `gap-3`, `mb-6`, `space-y-6`.
- **Radius**: `--radius-*` defined; used in primitives. Pages use `rounded-xl`, `rounded-2xl`, `rounded-[14px]`, `rounded-3xl`.
- **Shadows**: Config `glass-panel/card/glow-gold`. Global late rule `* { box-shadow: none !important }` (flat design enforcement) + many custom `hover:shadow-[...]`. Inconsistent lift behavior.

---

## 5. Component Patterns (Buttons, Tabs, Cards, Tables, Forms, Badges, Icons)

**Buttons**:
- `ActionButton.tsx` + `.ci-btn*` (cta/secondary/ghost/danger, size variants) + `UtilityButton` (`.ci-util-btn`).
- Many raw `<button>` + Tailwind or inline. Danger often falls back.
- Hover uses fallback colors in some paths.

**Tabs**:
- `Tabs.tsx`: Segmented + underline variants, 100% inline style (var(--ci-surface-muted) etc.). No Tailwind.
- GVGB: Custom inline button tabs + gvgb-enter keyframes.
- Other surfaces: Accordions, raw buttons, CES-specific.

**Cards/Surfaces**:
- `GlassPanel` (dark blur) vs `SurfaceCard` (flat solid).
- GVGB / many: raw `bg-white rounded-xl border-[#E5E4E3] shadow-sm`.
- CES: `CesCard`.
- "One-glass" philosophy (no stacked sub-cards) violated in practice on most pages.

**Tables**:
- `DataGrid.tsx`: All inline (borderCollapse, padding via var, colors via var).
- GVGB/FormViewer: Raw `<table>` + `border-[#E5E4E3]`, `hover:bg-[#FAFBF8]`, `divide-y`.

**Forms/Fields**:
- `.ci-field` defined but `SearchField` uses inline. Many raw inputs in FormViewer (uncontrolled issues flagged in prior accessibility audit).

**Badges**:
- Legacy `StatusBadge.tsx` (hardcoded dark hex: `bg-[#FFC700]/15 text-[#FFC700]`, `#C74600`, `#D70101`).
- `CiStatusBadge` + `.ci-badge--*` (good, token-based).
- Regulatory `DomainBadge`/`UrgencyChip`, CES badges, domain palettes in FrameworkShowcase — parallel systems.

**Icons**: Lucide + `.icon-interactive`. Color via currentColor or hardcoded `text-[#007970]`.

**Overall**: Primitives exist and are documented (`ui/index.ts`: "Components MUST NOT hardcode"). Adoption outside new shell is low. Parallel systems (CES, regulatory, eCIgn, legacy StatusBadge) dominate.

---

## 6. Glassmorphism, Legacy, & Flat Design

- Comments in `index.css:8-12`, `CommandCenterLayout:47-51`: "Deep-maroon TravelightBG + SINGLE translucent glass canvas... FLAT on this glass — no stacked sub-cards".
- Legacy `.glass-morphism*` stripped (transparent, no blur, no shadow).
- New `.ci-glass-panel` / `.ci-card` + conditional `backdrop-filter: blur(14px)` only in dark.
- Global flat rule (shadows nuked) is recent enforcement.

**Reality**: Light Care Indeed path is solid paper (no glass). Many pages nest cards anyway. "One-glass" is aspirational outside the main shell.

---

## 7. Theme Application & Stores

- `CommandCenterLayout`: Sets `document.documentElement.dataset.theme` + `data-ci-mode`. Uses `useShellStore`, `useCiModeStore` (localStorage).
- `uiStore.ts`, `ciModeStore.ts`: Mature.
- `lightColorRemap.ts`: Band-aid for brand remapping in specific pages.
- GVGB, CES, Dashboard, Journey assume light or drift — theme flash risks mitigated but fragile.

---

## 8. Strongest / Weakest / Risks

**Strongest**: Token definition + multi-theme remapping + accessibility rings + print overrides + primitive architecture + stores + comments documenting "one-glass" intent.

**Weakest**: Adoption (primitives under-used), consistency (5+ parallel palettes/systems), spacing/typography enforcement (none), GVGB (canonical) lagging shell, global flat rule side-effects, 2313 inline styles.

**Risks for Redesign**:
- High maintenance debt.
- Brittle overrides (index.css blanket rules).
- Contrast/AA issues in mixed light/dark + hardcoded views.
- Migration will fight GVGB, CES, Journey V1, eCign packet, Dashboard, Library, staffing, iAdministrator.
- No central docs or lint enforcement today.

**Recommendation**: Enforce primitives + token-only in new code immediately. Phase 1: migrate canonical surfaces (Policy detail, Library, Dashboard, CES primitives, Form eCign core). Add DESIGN_OWNERS.md and lint rule.

See EXECUTIVE_SUMMARY for top risks/actions and DRIFT report for full duplicate list. All findings cross-referenced with LAYOUT_NORMALIZATION_REPORT, GVGB001_CANONICAL_UX_REFINEMENT, QA_UAT accessibility audits, and eCign gap analysis.