# Dashboard Canonical Primitive Usage Map — Phase 3 Reference Surface

**Surface:** Command Center / Dashboard  
**Phase 3 — Operational Surface Reconstruction**  
**Version:** 1.0  
**Date:** 2026-05-17  

**Traceability:** `Phase3_Implementation_Spec.md` + `Dashboard_Reconstruction_Plan.md` + Phase 2 `Canonical_Primitive_Usage_Map.md` + `primitives/CATALOG.md`

---

## 1. Purpose

Define the **exact** set of canonical primitives that must be used when rebuilding the Dashboard. This document becomes the template for Evidence, Audit, Calendar, and My Tasks.

**Rule:** Every JSX element in the final `DashboardPage.tsx` (and any supporting components) must map to a primitive listed below or in the core `ui/index.ts`.

---

## 2. Core Shell Primitives (Inherited from Phase 2)

| Area                    | Required Primitive(s)                  | Usage Rule |
|-------------------------|----------------------------------------|----------|
| Overall page wrapper    | `ShellFrame` + `ShellContentFrame`     | Mandatory outer container |
| Main content glass      | `GlassPanel` (data-layer="1")          | Primary surface for Dashboard content |
| Elevated sections       | `SurfaceCard`                          | All cards, KPI containers, board columns |

---

## 3. Dashboard-Specific Primitive Usage Map

### 3.1 Hero / KPI Section

| Element                        | Must Use Primitive          | Variant / Props                  | Notes |
|--------------------------------|-----------------------------|----------------------------------|-------|
| Individual KPI / Metric card   | `KpiCard` (new — promote)   | `emphasize`, `trend`             | Replaces all current inline KPI divs |
| KPI value                      | Inside `KpiCard`            | `--ci-font-size-kpi-value`       | — |
| KPI label / meta               | Inside `KpiCard`            | `--ci-font-size-meta`            | — |
| Trend indicator                | `CiStatusBadge` or icon + text | —                              | Use semantic status colors only |

### 3.2 Command / Action Board

| Element                        | Must Use Primitive             | Notes |
|--------------------------------|--------------------------------|-------|
| Board column container         | `BoardColumn` (new — promote)  | Or `SurfaceCard` + `SectionHeader` |
| Individual action / task card  | `SurfaceCard`                  | Layer 2 inside board |
| Card title                     | `SectionHeader`                | Or typography tokens inside card |
| Card actions                   | `ActionButton` / `UtilityButton` | Primary vs secondary |
| Status indicators              | `CiStatusBadge`                | — |
| Empty board state              | `EmptyState`                   | — |

### 3.3 Filters, Search, and Toolbar

| Element                        | Must Use Primitive     | Notes |
|--------------------------------|------------------------|-------|
| Global / local search          | `SearchField`          | — |
| Filter controls                | `UtilityButton` + `Tabs` or new `FilterBar` | Promote if complex |
| View mode toggles              | `Tabs` or `SegmentedControl` | — |

### 3.4 Empty States, Loading, Errors

| Element                        | Must Use Primitive     | Notes |
|--------------------------------|------------------------|-------|
| Full section empty             | `EmptyState`           | With illustration + action |
| Loading skeleton               | `LoadingState`         | — |
| Error state                    | `EmptyState` (error variant) | — |

### 3.5 Other Dashboard Elements

| Element                        | Must Use Primitive          | Notes |
|--------------------------------|-----------------------------|-------|
| Staleness / data freshness     | `StalenessBanner`           | If applicable |
| Help / contextual tips         | `ContextualKnowledgeBulb`   | — |
| Any status pills               | `CiStatusBadge`             | — |
| Buttons (primary)              | `ActionButton`              | — |
| Buttons (secondary/icon)       | `UtilityButton`             | — |

---

## 4. Primitives That Must Be Promoted During Dashboard Work

These do not yet exist or are insufficient in the current catalog:

- `KpiCard`
- `BoardColumn`
- `KanbanCard` (or enhanced `SurfaceCard` for board items)
- `FilterBar` (optional but recommended)

All promotions must follow the process in `primitives/CATALOG.md`.

---

## 5. Forbidden Patterns on Dashboard

- No inline `<div className="bg-white shadow-...">` that duplicates `SurfaceCard`
- No custom `ci-operational-card` or similar legacy classes
- No direct use of `border-[#C74601]`, `shadow-[0_14px_28px...]`, `text-[42px]`, etc.
- No local components like `KpiCardLocal`, `DashboardCard`, `ActionBoardItem`, etc.

---

## 6. Template Value

Once Dashboard is complete, this mapping becomes the default pattern for:
- Evidence Center cards and lists
- Audit Mode status views
- Calendar event cards
- My Tasks list items

Any deviation on later surfaces must be explicitly justified and documented.

---

**End of Dashboard Canonical Primitive Usage Map**

Next artifact: `Dashboard_Token_Application_Matrix.md` will be produced immediately.