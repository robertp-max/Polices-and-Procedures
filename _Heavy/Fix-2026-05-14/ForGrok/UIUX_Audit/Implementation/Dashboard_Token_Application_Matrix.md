# Dashboard Token Application Matrix — Phase 3 Reference Surface

**Surface:** Command Center / Dashboard  
**Phase 3 — Operational Surface Reconstruction**  
**Version:** 1.0  
**Date:** 2026-05-17  

**Traceability:** `tokens/tokens.json` (v0.2.0-phase1) + `Dashboard_Reconstruction_Plan.md` + Phase 2 `Token_Application_Matrix_Shell.md`

---

## 1. Purpose

Provide the definitive mapping of which tokens from the locked contract must be used for every visual decision on the rebuilt Dashboard. This becomes the reference for all subsequent Phase 3 surfaces.

**Rule:** No visual styling decision on Dashboard may use anything other than values from `tokens/tokens.json`.

---

## 2. Dashboard Token Usage by Section

### 2.1 KPI / Hero Section

| Element                    | Token Family                  | Specific Token(s)                                      | Notes |
|----------------------------|-------------------------------|--------------------------------------------------------|-------|
| KPI Card background        | color.glass                   | `--ci-color-glass-light-main` or dark equivalent      | Via `SurfaceCard` / `KpiCard` |
| KPI value                  | typography.fontSize           | `--ci-font-size-kpi-value` (36px)                     | — |
| KPI label                  | typography.fontSize           | `--ci-font-size-meta` or `--ci-font-size-body-sm`     | — |
| Trend / delta text         | typography.fontSize + color   | `--ci-font-size-trend` + semantic success/error       | — |
| Card elevation (light)     | shadow.elevation              | `--ci-shadow-elevation-card-light` or `md`            | Critical for glassmorphism |
| Card border (subtle)       | color.border                  | `--ci-color-border-subtle-light`                      | — |

### 2.2 Command / Action Board

| Element                    | Token Family                  | Specific Token(s)                                      | Notes |
|----------------------------|-------------------------------|--------------------------------------------------------|-------|
| Board column background    | color.glass / surface         | `--ci-color-glass-light-main`                         | — |
| Card inside board          | shadow + color                | `--ci-shadow-elevation-interactive` + glass           | Hover state uses interactive |
| Column title               | typography                    | `--ci-font-size-column-title` + `--ci-letter-spacing-uppercase-md` | — |
| Card title                 | typography                    | `--ci-font-size-card-title`                           | — |
| Meta text (timestamps, etc)| typography                    | `--ci-font-size-meta` + `--ci-letter-spacing-uppercase-sm` | — |
| Action buttons             | —                             | Handled by `ActionButton` / `UtilityButton` primitives | — |

### 2.3 Filters, Toolbar, Search

| Element                    | Token Family                  | Specific Token(s) | Notes |
|----------------------------|-------------------------------|-------------------|-------|
| Toolbar height / padding   | spacing                       | `--ci-spacing-md` / `--ci-spacing-lg` | — |
| Search field               | —                             | `SearchField` primitive consumes tokens internally | — |
| Filter button states       | color + motion                | Accent colors + `--ci-motion-duration-fast` | — |

### 2.4 Typography Scale (Dashboard Priority)

| Purpose                    | Token                              | Recommended Size |
|----------------------------|------------------------------------|------------------|
| Page / Hero titles         | `--ci-font-size-display-hero`      | 42px (responsive) |
| Section / Board titles     | `--ci-font-size-display-section`   | 26px |
| KPI values                 | `--ci-font-size-kpi-value`         | 36px |
| Stat values                | `--ci-font-size-stat-value`        | 18px |
| Column titles              | `--ci-font-size-column-title`      | 18px |
| Card titles                | `--ci-font-size-card-title`        | 15px |
| Body / labels              | `--ci-font-size-body-md` / `body-sm`| 14px / 12px |
| Eyebrow / meta             | `--ci-font-size-eyebrow` / `meta`  | 10px / 11px |

### 2.5 Elevation & Glass (Dashboard Critical)

| Context                    | Shadow Token                          | Glass / Overlay Token              |
|----------------------------|---------------------------------------|------------------------------------|
| Main Dashboard glass       | `--ci-shadow-elevation-card-light`    | `--ci-color-glass-light-main`      |
| Hoverable cards            | `--ci-shadow-elevation-interactive`   | —                                  |
| Empty state cards          | `--ci-shadow-elevation-interactive`   | —                                  |
| Gradient overlays          | —                                     | `--ci-overlay-surface-faint` / `soft` |

### 2.6 Spacing & Dimensions

| Element                    | Token                                      | Value |
|----------------------------|--------------------------------------------|-------|
| KPI card min-height        | `--ci-dimension-surface-kpi-card-min-height` | 116px |
| Board column min-width     | `--ci-dimension-surface-board-min-width`   | min(88vw, 680px) on mobile |
| Touch targets              | `--ci-dimension-surface-touch-target-min`  | 44px |
| Gaps between cards         | `--ci-spacing-lg` / `--ci-spacing-xl`      | 16–24px |

---

## 3. Color Strategy (Dashboard)

- Primary text: `--ci-color-text-primary-light/dark`
- Secondary / meta: `--ci-color-text-secondary-light` / `--ci-color-text-muted`
- Accents: Use `--ci-color-accent-orange` and `--ci-color-accent-teal` **strategically** only for CTAs, pending states, and emphasis (per COLOR_TOKENS.md guidance)
- Status: Semantic colors (`--ci-color-success`, `--ci-color-warning`, etc.) via `CiStatusBadge`

---

## 4. Motion

- All card hovers, transitions, and state changes: `--ci-motion-duration-fast` + `--ci-motion-ease-standard`
- Reduced motion respected globally via `ShellFrame`

---

## 5. Enforcement Notes

- The Phase 1 raw value inventory (especially the 6 hex colors and 35+ arbitrary values) must be fully replaced using the tokens above.
- Any new visual pattern discovered during Dashboard implementation must be added to this matrix and, if necessary, proposed as a token addition.

---

**End of Dashboard Token Application Matrix**

Next artifact: `Dashboard_Accessibility_Validation_Report.md` will be produced immediately.