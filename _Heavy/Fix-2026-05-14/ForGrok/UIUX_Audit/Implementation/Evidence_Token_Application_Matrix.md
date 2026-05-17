# Evidence Center Token Application Matrix — Phase 3

**Surface:** Evidence Center  
**Phase 3 — Operational Surface Reconstruction**  
**Version:** 1.0  
**Date:** 2026-05-17  

**Traceability:** 
- `tokens/tokens.json` (v0.2.0-phase1)
- `Evidence_Reconstruction_Plan.md`
- `Dashboard_Token_Application_Matrix.md` (reference)
- Phase 2 `Token_Application_Matrix_Shell.md`

---

## 1. Purpose

Define the exact token usage for the Evidence Center, maintaining full consistency with the Dashboard reference surface.

---

## 2. Token Usage by Section

### 2.1 Capture & Media Areas

| Element                    | Token Family             | Specific Tokens                                      | Notes |
|----------------------------|--------------------------|------------------------------------------------------|-------|
| Capture container          | color.glass + shadow     | `--ci-color-glass-light-main`, `--ci-shadow-elevation-card-light` | Layer 2 inside drawer |
| Media preview cards        | color + radius           | `--ci-color-glass-light-main`, `--ci-radius-lg`      | — |
| Progress overlays          | overlay                  | `--ci-overlay-surface-soft` / `faint`                | Gradient stops |
| Status during upload       | color.semantic           | `--ci-color-success`, `--ci-color-warning`           | Via `CiStatusBadge` |

### 2.2 Evidence Lists & Boards

| Element                    | Token Family             | Specific Tokens                                      | Notes |
|----------------------------|--------------------------|------------------------------------------------------|-------|
| Evidence item cards        | shadow + color           | `--ci-shadow-elevation-interactive`, glass tokens    | Hover uses interactive |
| Board columns              | dimension + spacing      | `--ci-dimension-surface-board-min-width`, `--ci-spacing-xl` | Consistent with Dashboard |
| Summary KPI cards          | typography + shadow      | `--ci-font-size-kpi-value`, `--ci-shadow-elevation-md` | Reuse Dashboard pattern |
| Column titles              | typography               | `--ci-font-size-column-title` + letter-spacing       | — |

### 2.3 Detail & Review Panels

| Element                    | Token Family             | Specific Tokens                                      | Notes |
|----------------------------|--------------------------|------------------------------------------------------|-------|
| Detail cards               | shadow + border          | `--ci-shadow-elevation-md`, `--ci-color-border-subtle-light` | — |
| Section headers            | typography               | `--ci-font-size-display-section`                     | — |
| Meta information           | typography               | `--ci-font-size-meta` + `--ci-letter-spacing-uppercase-sm` | — |
| Action buttons             | —                        | Handled by primitives (`ActionButton` / `UtilityButton`) | — |

### 2.4 Typography (Evidence Priority)

| Purpose                    | Token                              | Alignment with Dashboard |
|----------------------------|------------------------------------|--------------------------|
| Evidence titles            | `--ci-font-size-card-title`        | Same as Dashboard cards |
| Packet / review titles     | `--ci-font-size-display-section`   | Same |
| Timestamps & meta          | `--ci-font-size-meta`              | Same |
| Status labels              | `--ci-font-size-eyebrow`           | Same |

### 2.5 Elevation & Glass

Use the same elevation scale as Dashboard:
- Main content: `--ci-shadow-elevation-card-light`
- Interactive/hover: `--ci-shadow-elevation-interactive`
- Modals & drawers: `--ci-shadow-elevation-modal`

Glass and overlay tokens identical to Dashboard and shell.

---

## 3. Consistency Rule

Every token decision on Evidence must match the corresponding element on Dashboard unless a specific functional requirement (e.g., media-heavy views) justifies a documented deviation.

---

**End of Evidence Center Token Application Matrix**

**Next:** Evidence_Accessibility_Validation_Report.md will be produced immediately.