# Dashboard Raw-Value Inventory and Token Mapping Plan

**Surface:** Command Center / Dashboard  
**File Under Audit:** `src/policy/pages/DashboardPage.tsx`  
**Audit Date:** 2026-05-16 (baseline)  
**Token Contract Lock:** 2026-05-16
**Audit Phase:** Phase 1 - Week 1 Baseline Complete  
**Status:** Token contract locked (v0.2.0); ready for first implementation PR (50+ replacements)

---

## 1) Inventory Method

- Static scan of `DashboardPage.tsx` (903 lines).
- Buckets: raw hex/rgb colors, arbitrary Tailwind values (`[...]`), arbitrary opacity ratios.
- Each entry records: line number, current value, category, and proposed canonical replacement.

---

## 2) Raw Hex / RGB Values (Total: 6)

| # | Line | Snippet | Category | Final Canonical Token (locked) |
|---|------|---------|----------|--------------------------------|
| 1 | 586 | `border-[#C74601]/35` | brand accent border | `--ci-color-accent-orange-border` (tokens.color.semantic.accent-orange-border) |
| 2 | 587 | `border-[#FFC107]/35` | brand accent border | `--ci-color-accent-gold-border` (tokens.color.semantic.accent-gold-border) |
| 3 | 614 | `hover:shadow-[0_14px_28px_rgba(15,23,42,0.12)]` | elevation shadow | `--ci-shadow-elevation-md` (tokens.shadow.elevation.md) |
| 4 | 807 | `shadow-[0_10px_24px_rgba(15,23,42,0.04)]` | elevation shadow (light) | `--ci-shadow-elevation-sm-light` (tokens.shadow.elevation.sm-light) |
| 5 | 833 | `hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]` | elevation shadow (interactive) | `--ci-shadow-elevation-interactive` (tokens.shadow.elevation.interactive) |
| 6 | 875 | `hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)]` | elevation shadow (empty state) | `--ci-shadow-elevation-interactive` (reuse) |

---

## 3) Arbitrary Typography Values (Sample From 35)

Grouped by intent to enable a typography-scale token map:

### Heading scale candidates
| Line | Current | Final Token (locked v0.2) |
|------|---------|---------------------------|
| 525 | `text-[26px] sm:text-[36px] md:text-[42px]` | `--ci-font-size-display-hero` (tokens.typography.fontSize.display-hero) |
| 442 | `text-[26px]` | `--ci-font-size-display-section` |
| 566, 691 | `text-[18px]` | `--ci-font-size-stat-value` |
| 598 | `text-[36px]` | `--ci-font-size-kpi-value` |
| 768 | `text-[18px]` | `--ci-font-size-column-title` |
| 840 | `text-[15px]` | `--ci-font-size-card-title` |
| 878 | `text-[14px]` | `--ci-font-size-empty-title` |

### Body/label scale candidates
| Line | Current | Final Token (locked v0.2) |
|------|---------|---------------------------|
| 445, 528, 544, 550, 663, 879 | `text-[12px]` / `text-[13px]` / `text-[14px]` (body) | `--ci-font-size-body-sm` / `--ci-font-size-body-md` |
| 517, 541, 565, 592, 690, 837, 856 | `text-[10px]` / `text-[9px]` (eyebrow) | `--ci-font-size-eyebrow` |
| 521, 660, 673, 704, 770, 849, 852 | `text-[11px]` / `text-[12px]` (meta) | `--ci-font-size-meta` |
| 601 | `text-[11px]` (trend) | `--ci-font-size-trend` |

### Letter-spacing/tracking
| Line | Current | Final Token (locked v0.2) |
|------|---------|---------------------------|
| 525, 598 | `tracking-[-0.03em]` / `tracking-[-0.035em]` | `--ci-letter-spacing-tight` (tokens.typography.letterSpacing.tight) |
| 442 | `tracking-[-0.02em]` | `--ci-letter-spacing-snug` |
| 517 | `tracking-[0.26em]` | `--ci-letter-spacing-eyebrow-strong` |
| 541 | `tracking-[0.2em]` | `--ci-letter-spacing-eyebrow` |
| 565, 660, 837 | `tracking-[0.14em]` | `--ci-letter-spacing-uppercase-md` |
| 592, 690 | `tracking-[0.16em]` | `--ci-letter-spacing-uppercase-lg` |
| 856 | `tracking-[0.08em]` | `--ci-letter-spacing-uppercase-sm` |

---

## 4) Arbitrary Dimensional Values

| Line | Current | Category | Final Token (locked v0.2) |
|------|---------|----------|---------------------------|
| 456 | `min-w-[88vw] sm:min-w-[680px]` | board min-width | `--ci-dimension-surface-board-min-width` (tokens.dimension.surface.board-min-width) |
| 533 | `sm:min-w-[220px]` | hero stat grid | `--ci-dimension-surface-hero-stats-min-width` |
| 607, 614 | `min-h-[116px]` | KPI card min-height | `--ci-dimension-surface-kpi-card-min-height` |
| 659 | `min-w-[240px]` | banner body | `--ci-dimension-surface-banner-body-min-width` |
| 704 | `min-h-[44px]` | toolbar button touch target | `--ci-dimension-surface-touch-target-min` |
| 770 | `min-w-[28px]` | count badge min-width | `--ci-dimension-surface-badge-min-width` |
| 875 | `min-h-[220px]` | empty state min-height | `--ci-dimension-surface-empty-state-min-height` |

---

## 5) Arbitrary Opacity Ratios

| Line | Current | Final Token (locked v0.2) |
|------|---------|---------------------------|
| 406 | `to-white/[0.02]` | `--ci-overlay-surface-faint` (tokens.overlay.surface.faint) |
| 587 | `from-white/[0.08]`, `to-white/[0.03]` | `--ci-overlay-surface-soft` + `--ci-overlay-surface-faint` (tokens.overlay.surface) |

---

## 6) Identified Token Contract Gaps — RESOLVED

All 5 categories have been added to `tokens/tokens.json` v0.2.0-phase1 (locked 2026-05-16) and emitted in `generated/tokens.css`:

1. ✅ `typography.fontSize` + `typography.letterSpacing` scales
2. ✅ `shadow.elevation` (5 variants aligned to light-mode elevation system)
3. ✅ `overlay.surface` (faint/soft/medium for gradient stops)
4. ✅ `dimension.surface` (min-height/width constraints + touch target)
5. ✅ Expanded `color.*` + `radius` to support full replacements

See `tokens/tokens.json` and `tokens/README.md` for authoritative structure. All Dashboard migration candidates now have direct 1:1 mappings.

---

## 7) Primitive Substitution Candidates

Existing canonical primitives directly applicable in Dashboard:

| Local Pattern | Canonical Replacement |
|---------------|------------------------|
| Inline `<div>` KPI card with shadow + border + emphasize variant | New `KpiCard` primitive (planned per `primitives/CATALOG.md`) wrapping `SurfaceCard` |
| Inline `<button>` toolbar control | `UtilityButton` |
| Inline column `<section>` shell | `SurfaceCard` (Layer 2) |
| Inline command-rail container | `GlassPanel` + token-driven utility class |
| Inline empty-state button | `EmptyState` primitive |
| `AlertTriangle`, `Clock`, `Activity`, `FileText`, `ShieldCheck`, `ShieldX` placement | Wrap in `CiStatusBadge` where status semantics apply |

---

## 8) Initial 50 Migration Candidates (First PR Scope)

Token contract now locked — all candidates have final `--ci-*` targets.

- All 6 raw hex/rgb values (Section 2) → direct --ci-color-accent-* + --ci-shadow-elevation-*
- 11 letter-spacing values (Section 3) → --ci-letter-spacing-*
- 8 dimensional values (Section 4) → --ci-dimension-surface-*
- 25 typography size values (subset of Section 3) → --ci-font-size-* + letter-spacing

**Total first-PR migration count target: 50.** (Ready for implementation PR using locked v0.2 contract)

---

## 9) Out-of-Scope For First PR

- KPI card primitive promotion (requires new primitive PR, sequenced after this).
- Empty state primitive substitution (sequenced after first PR success).
- Shell-level constrained page view enforcement (Phase 2 scope).

---

## 10) Acceptance Hooks

This document satisfies:

- Week 1 task: "Run initial raw-value audit on Dashboard files" (`DASHBOARD_RECONSTRUCTION_KICKOFF.md`)
- Phase 1 baseline action: "Dashboard file-level raw-value inventory (line-item list)" (`PHASE_1_BASELINE_AUDIT.md`)
- Phase 1 baseline action: "Token mapping proposal for first 50 replacements" — **COMPLETE** (locked tokens)
- Phase 1 baseline action: "Primitive substitution map"

**Token Lock Note:** All proposed replacements above now resolve to committed entries in `tokens/tokens.json` + `generated/tokens.css`. No further taxonomy changes expected before first migration PR.

**Design Reference Alignment Note (2026-05-16):** 
The token names and specific px values (e.g. `fontSize.display-hero: 42px`, `dimension.surface.kpi-card-min-height: 116px`) were derived directly from the raw values present in `DashboardPage.tsx` to enable zero-raw migration. They are intentionally more granular and Dashboard-pragmatic than the broader responsive scale defined in `design-references/TYPOGRAPHY_SCALE.md` (which uses `text-display` / `text-title` etc.). The elevation shadows were cross-checked against `LIGHT_MODE_ELEVATION_SYSTEM.md`. The legacy accent `#C74601` was promoted into primitives for migration fidelity (Design Lead should confirm vs brand `#E07B2C` in later pass). This is the locked Phase 1 baseline; harmonization to the full design scale is Phase 2+ work.

---

**End of Dashboard Raw-Value Inventory and Token Mapping Plan**
