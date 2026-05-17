# Calendar Canonical Primitive Usage Map — Phase 3

**Surface:** Calendar  
**Phase 3 — Operational Surface Reconstruction**  
**Version:** 1.0  
**Date:** 2026-05-17  

**Traceability:** Previous surface primitive maps (Dashboard/Evidence/Audit) as reference.

---

## 1. Core Primitives

- `ShellFrame` + `ShellContentFrame`
- `GlassPanel`, `SurfaceCard`
- `BoardColumn` (for calendar board/sprint views)
- `DataGrid` (for list/calendar item tables)
- `CiStatusBadge`, `EmptyState`, `LoadingState`
- `ActionButton`, `UtilityButton`

---

## 2. Calendar-Specific Mapping

| Area                  | Required Primitive             | Notes |
|-----------------------|--------------------------------|-------|
| Event cards           | `SurfaceCard`                  | Consistent elevation and styling |
| Board / sprint views  | `BoardColumn` + `SurfaceCard`  | Reuse from prior surfaces |
| Calendar grids/lists  | `DataGrid`                     | — |
| Status on events      | `CiStatusBadge`                | Mandatory |
| Scheduling actions    | `UtilityButton` / `ActionButton` | — |

---

**End of Calendar Canonical Primitive Usage Map**

**Next:** Calendar_Token_Application_Matrix.md immediately.