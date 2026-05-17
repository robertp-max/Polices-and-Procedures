# Evidence Center Reconstruction Plan — Phase 3

**Surface:** Evidence Center  
**Phase 3 — Operational Surface Reconstruction**  
**Version:** 1.0  
**Date:** 2026-05-17  

**Traceability:** 
- `Phase3_Implementation_Spec.md`
- `Dashboard_Reconstruction_Plan.md` (reference template)
- `LEGACY_DEPRECATION_MATRIX.md`
- `SURFACE_CHECKLISTS/Evidence.md` (to be aligned)
- Phase 2 Shell artifacts (`ShellFrame`, `ShellContentFrame`, etc.)
- `CANONICAL_UI_SYSTEM_SPEC.md`

---

## 1. Purpose

Rebuild the Evidence Center as the second operational surface, using Dashboard as the strict reference template for structure, primitives, tokens, responsive behavior, and accessibility standards.

The Evidence Center involves critical workflows: photo/video capture, document upload, signature collection, packet assembly, and review/audit flows. It must demonstrate the same high level of canonical consistency as Dashboard.

---

## 2. Current State Challenges

- Multiple legacy card/panel families for evidence items, capture modals, and review panels.
- Heavy custom styling in capture flows (`PhotoEvidenceCapture`, signature areas).
- Inconsistent framing — many views are near full-bleed, violating the 4-sided constrained contract.
- Significant raw visual values (colors, shadows, spacing, typography) remaining from pre-Phase 1 baseline.
- Complex mobile capture UX that must be preserved while aligning to primitives.
- Status and compliance indicators often rely on color alone.

---

## 3. Target State

- Fully composed inside the Phase 2 `ShellFrame` + `ShellContentFrame` with proper 4-sided breathing room on ≥1024px.
- All capture, list, detail, and review components built exclusively from canonical primitives.
- Zero raw visual values.
- Mobile capture experience remains excellent using `BottomSheetDrawer`, `PhotoEvidenceCapture`, and `SignaturePad`.
- Glassmorphism is maximized through consistent Layer 1 (`GlassPanel`) and Layer 2 (`SurfaceCard`) usage.
- Dashboard patterns (KPI-style summaries, board views, empty states) reused or extended.

---

## 4. Reconstruction Phases

### 4.1 Shell Integration & Capture Modernization
- Integrate all views with `ShellContentFrame`.
- Refactor capture flows to use `GlassPanel` (Layer 1) + `SurfaceCard` (Layer 2) for review areas.
- Ensure `PhotoEvidenceCapture` and `SignaturePad` are properly wrapped and respect token system.

### 4.2 Evidence List & Gallery Views
- Replace legacy list and grid cards with `SurfaceCard` + `DataGrid` patterns.
- Introduce consistent summary cards using patterns from Dashboard `KpiCard`.
- Apply `BoardColumn` / board-style layouts where multi-item review occurs.

### 4.3 Detail & Review Workflows
- Standardize evidence detail panels using `SurfaceCard`, `SectionHeader`, and `PageHeader`.
- Action bars and review controls must use `ActionButton` / `UtilityButton`.

### 4.4 Deprecation & Token Cleanup
- Remove all legacy evidence card families listed in `LEGACY_DEPRECATION_MATRIX.md`.
- Eliminate every remaining raw value identified in prior audits.
- Align all typography, elevation, and spacing to the locked token contract.

---

## 5. Key Primitives to Use / Promote

**Core (existing):**
- `GlassPanel`, `SurfaceCard`, `BottomSheetDrawer`, `RightDrawer`
- `PhotoEvidenceCapture`, `SignaturePad`
- `DataGrid`, `EmptyState`, `LoadingState`, `CiStatusBadge`
- `ActionButton`, `UtilityButton`

**To Promote (Evidence-driven, aligned with Dashboard):**
- Enhanced `KpiCard` / summary cards for evidence metrics
- `BoardColumn` and `KanbanCard` variants for packet/review boards
- Possible `EvidenceItemCard` as a specialized `SurfaceCard`

All promotions must be added to `primitives/CATALOG.md`.

---

## 6. Responsive Requirements

- Desktop/Laptop: Strict 4-sided inset, multi-card compositions allowed inside `ShellContentFrame`.
- Tablet: 2-column max where appropriate.
- Mobile: Single-column lists, bottom-sheet capture and review, 44px+ targets everywhere.
- Capture flows must remain thumb-reachable and one-handed.

---

## 7. Accessibility Priorities

- Status must never be color-only (use `CiStatusBadge`).
- Proper labeling and live regions during capture/upload progress.
- Keyboard navigation through evidence lists and review actions.
- Focus management in drawers and modals.
- High contrast support in light/dark modes.

---

## 8. Validation & Evidence Requirements

- Before/after visual regression at all breakpoints.
- Comparison against Top Picks mocks (especially Evidence-related captures).
- Full accessibility validation report using the Dashboard template.
- Completion of surface-specific checklist.

---

## 9. Success Criteria

- Passes all items in the Evidence surface checklist.
- Zero raw values.
- 100% canonical primitive usage.
- 4-sided constrained framing verified and visually excellent.
- Mobile capture UX is at least as good as before, now on the canonical system.
- Evidence Center is ready to serve as secondary reference for remaining surfaces.

---

**End of Evidence Center Reconstruction Plan**

**Next:** Evidence_Canonical_Primitive_Usage.md will be produced immediately.