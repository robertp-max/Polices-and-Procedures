# Audit Mode Canonical Primitive Usage Map — Phase 3

**Surface:** Audit Mode  
**Phase 3 — Operational Surface Reconstruction**  
**Version:** 1.0  
**Date:** 2026-05-17  

**Traceability:** `Dashboard_Canonical_Primitive_Usage.md` + `Evidence_Canonical_Primitive_Usage.md` (references) + `primitives/CATALOG.md`

---

## 1. Purpose

Define the canonical primitives for Audit Mode, maintaining consistency with Dashboard and Evidence Center.

---

## 2. Core Shell + General Primitives

- `ShellFrame` + `ShellContentFrame`
- `GlassPanel` (Layer 1), `SurfaceCard` (Layer 2)
- `DataGrid`, `CiStatusBadge`, `EmptyState`, `LoadingState`
- `ActionButton`, `UtilityButton`

---

## 3. Audit-Specific Usage

| Area                        | Required Primitive                  | Notes |
|-----------------------------|-------------------------------------|-------|
| Readiness / Scoring cards   | `KpiCard` + `SurfaceCard`           | Reuse Dashboard pattern |
| Audit item / checklist rows | `SurfaceCard` + `CiStatusBadge`     | Or `DataGrid` rows |
| Master control lists        | `DataGrid`                          | — |
| Board / execution views     | `BoardColumn` + `SurfaceCard`       | Reuse from prior surfaces |
| Findings and detail panels  | `SurfaceCard` + `SectionHeader`     | — |
| Status throughout           | `CiStatusBadge`                     | Mandatory for all compliance states |

Promote `AuditChecklistItem` or `FindingCard` if needed as specialized cards.

---

## 4. Consistency Rule

Follow the exact primitive choices from Dashboard and Evidence unless a specific audit workflow requires a justified extension (documented).

---

**End of Audit Mode Canonical Primitive Usage Map**

**Next:** Audit_Token_Application_Matrix.md immediately.