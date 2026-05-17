# Evidence Center Canonical Primitive Usage Map — Phase 3

**Surface:** Evidence Center  
**Phase 3 — Operational Surface Reconstruction**  
**Version:** 1.0  
**Date:** 2026-05-17  

**Traceability:** 
- `Phase3_Implementation_Spec.md`
- `Evidence_Reconstruction_Plan.md`
- `Dashboard_Canonical_Primitive_Usage.md` (reference template)
- `primitives/CATALOG.md`
- Phase 2 `Canonical_Primitive_Usage_Map.md`

---

## 1. Purpose

Define the exact canonical primitives required for the rebuilt Evidence Center, using Dashboard as the reference pattern for consistency across Phase 3 surfaces.

---

## 2. Inherited Shell Primitives (from Phase 2)

- `ShellFrame` + `ShellContentFrame` — Outer constrained container (mandatory)
- `GlassPanel` (data-layer="1") — Primary Layer 1 surface
- `SurfaceCard` — Default Layer 2 elevated content

---

## 3. Evidence-Specific Primitive Usage

### 3.1 Capture & Upload Flows

| Element                        | Required Primitive              | Notes |
|--------------------------------|---------------------------------|-------|
| Photo / Video capture          | `PhotoEvidenceCapture`          | Existing primitive, must be wrapped in `SurfaceCard` / `GlassPanel` |
| Signature collection           | `SignaturePad`                  | Existing, Layer 2 usage |
| File upload areas              | `SurfaceCard` + `UtilityButton` | — |
| Progress indicators            | `LoadingState` + `CiStatusBadge`| — |

### 3.2 Evidence List & Gallery

| Element                        | Required Primitive              | Notes |
|--------------------------------|---------------------------------|-------|
| Evidence item cards            | `SurfaceCard`                   | Consistent with Dashboard cards |
| Gallery grids                  | `DataGrid` or `SurfaceCard` grid| Prefer `DataGrid` for tabular views |
| Summary / KPI cards            | `KpiCard` (promoted from Dashboard) | Evidence counts, compliance stats |
| Board / packet views           | `BoardColumn` + `SurfaceCard`   | For multi-evidence packets |

### 3.3 Detail & Review Views

| Element                        | Required Primitive              | Notes |
|--------------------------------|---------------------------------|-------|
| Evidence detail panel          | `SurfaceCard` + `SectionHeader` | — |
| Review action bars             | `ActionButton` + `UtilityButton`| — |
| Status / compliance badges     | `CiStatusBadge`                 | Never color alone |
| Attachments / media previews   | `SurfaceCard`                   | — |

### 3.4 Drawers & Modals

| Element                        | Required Primitive              | Notes |
|--------------------------------|---------------------------------|-------|
| Capture / review drawers       | `BottomSheetDrawer` / `RightDrawer` | Mandatory for mobile + desktop detail |
| Packet assembly flows          | `BottomSheetDrawer`             | — |

### 3.5 States

| Element                        | Required Primitive     | Notes |
|--------------------------------|------------------------|-------|
| Empty evidence states          | `EmptyState`           | — |
| Loading during upload/review   | `LoadingState`         | — |
| Error states                   | `EmptyState` (error variant) | — |

---

## 4. Primitives to Promote During Evidence Work

- `KpiCard` (already promoted via Dashboard — reuse)
- `BoardColumn` (reuse/extend from Dashboard)
- `EvidenceItemCard` (if needed as specialized `SurfaceCard` variant)
- Any capture-specific enhancements to existing primitives

All must be registered in `primitives/CATALOG.md`.

---

## 5. Forbidden Patterns

- No custom evidence card components outside `ui/` primitives.
- No inline styles duplicating `GlassPanel` or `SurfaceCard`.
- No raw values in capture or review JSX.

---

## 6. Consistency with Dashboard

All patterns established on Dashboard (card elevation, typography scale, button usage, empty states) must be followed here unless a clear functional reason requires deviation (documented in the reconstruction plan).

---

**End of Evidence Center Canonical Primitive Usage Map**

**Next:** Evidence_Token_Application_Matrix.md will be produced immediately.