# Calendar Reconstruction Plan — Phase 3

**Surface:** Calendar (Staffing + Operational)  
**Phase 3 — Operational Surface Reconstruction**  
**Version:** 1.0  
**Date:** 2026-05-17  

**Traceability:** 
- `Phase3_Implementation_Spec.md`
- Previous surface plans (Dashboard, Evidence, Audit) as templates
- Phase 2 shell artifacts

---

## 1. Purpose

Rebuild the Calendar surface as the fourth operational surface, strictly following the canonical patterns established on Dashboard (reference) and continued through Evidence and Audit.

The Calendar includes staffing calendars, sprint views, and operational scheduling.

---

## 2. Current State Challenges

- Legacy calendar and event card components with custom styling.
- Dense views that often violate constrained framing.
- Raw values in event styling, time slots, and status indicators.
- Complex drag-and-drop or selection interactions that need alignment to primitives.

---

## 3. Target State

- Inside `ShellFrame` + `ShellContentFrame` with proper 4-sided inset.
- All calendar views, event cards, and scheduling components built from canonical primitives.
- Zero raw values.
- Consistent use of `SurfaceCard`, `CiStatusBadge`, and board-style layouts.
- Excellent mobile calendar experience.

---

## 4. Reconstruction Phases

- Shell integration and view wrappers.
- Event cards and list views standardized to `SurfaceCard` + `DataGrid` patterns.
- Board/sprint calendar views using `BoardColumn` patterns.
- Cleanup of legacy calendar families.

---

## 5. Key Primitives

- `GlassPanel`, `SurfaceCard`, `DataGrid`
- `BoardColumn` (for sprint/board calendar views)
- `CiStatusBadge`, `EmptyState`, `UtilityButton`

---

## 6. Validation

Same as prior surfaces: responsive matrix, accessibility report, visual regression, surface checklist.

---

**End of Calendar Reconstruction Plan**

**Next:** Calendar_Canonical_Primitive_Usage.md immediately.