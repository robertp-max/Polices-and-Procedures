# Audit Mode Reconstruction Plan — Phase 3

**Surface:** Audit Mode  
**Phase 3 — Operational Surface Reconstruction**  
**Version:** 1.0  
**Date:** 2026-05-17  

**Traceability:** 
- `Phase3_Implementation_Spec.md`
- `Evidence_Reconstruction_Plan.md` + `Dashboard_Reconstruction_Plan.md` (reference templates)
- `LEGACY_DEPRECATION_MATRIX.md`
- Phase 2 shell artifacts

---

## 1. Purpose

Rebuild Audit Mode as the third operational surface, following the exact patterns, primitives, and quality standards established on Dashboard (reference) and Evidence Center.

Audit Mode involves readiness checks, compliance scoring, master control reviews, and audit execution workflows.

---

## 2. Current State Challenges

- Legacy audit card and checklist families with heavy custom styling.
- Status-heavy views that often use color as the only indicator.
- Inconsistent framing and density across readiness dashboards and execution views.
- Significant raw values in scoring, checklist items, and status displays.
- Complex data grids and hierarchical audit structures.

---

## 3. Target State

- Fully inside Phase 2 shell with strict 4-sided constrained page view.
- All readiness, scoring, checklist, and execution components built from canonical primitives only.
- Zero raw visual values.
- Consistent use of `DataGrid`, `SurfaceCard`, `CiStatusBadge`, and Dashboard-proven patterns for summaries and boards.
- Excellent mobile experience for field audit execution.

---

## 4. Reconstruction Phases

### 4.1 Shell Integration & Readiness Views
- Wrap all Audit views in `ShellContentFrame`.
- Refactor readiness dashboards and scoring cards using `KpiCard` and `SurfaceCard` patterns from Dashboard.

### 4.2 Checklist & Execution Flows
- Standardize checklist items and audit tasks using `SurfaceCard` + `UtilityButton` + `CiStatusBadge`.
- Use `DataGrid` for master control and audit item lists.

### 4.3 Reporting & Detail Views
- Apply consistent panel and card structures for audit reports and findings.
- Ensure review actions follow the canonical button and status patterns.

### 4.4 Deprecation
- Remove legacy audit card and checklist families per `LEGACY_DEPRECATION_MATRIX.md`.
- Clean all remaining raw values.

---

## 5. Key Primitives

- `GlassPanel`, `SurfaceCard`, `DataGrid`
- `KpiCard`, `BoardColumn` (reused from Dashboard/Evidence)
- `CiStatusBadge`, `EmptyState`, `LoadingState`
- `ActionButton`, `UtilityButton`

Promote `AuditItemCard` or `ChecklistItem` as needed.

---

## 6. Responsive & Accessibility Focus

- Strong emphasis on status clarity (never color alone).
- Keyboard navigation through long checklists and grids.
- Mobile-optimized execution views with large touch targets.
- Clear heading structure for audit sections.

---

## 7. Validation Requirements

- Before/after regression at all breakpoints.
- Accessibility report following Dashboard/Evidence template.
- Surface checklist completion.

---

**End of Audit Mode Reconstruction Plan**

**Next:** Audit_Canonical_Primitive_Usage.md immediately.