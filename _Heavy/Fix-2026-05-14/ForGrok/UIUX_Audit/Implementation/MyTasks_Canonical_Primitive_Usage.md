# My Tasks Canonical Primitive Usage Map — Phase 3

**Surface:** My Tasks  
**Phase 3 — Operational Surface Reconstruction**  
**Version:** 1.0  
**Date:** 2026-05-17  

**Traceability:** Previous surface primitive maps as reference.

---

## 1. Core Primitives

- `ShellFrame` + `ShellContentFrame`
- `GlassPanel`, `SurfaceCard`
- `DataGrid`
- `CiStatusBadge`, `EmptyState`, `LoadingState`
- `ActionButton`, `UtilityButton`
- `BoardColumn` (for task boards)

---

## 2. My Tasks Specific Mapping

| Area                  | Required Primitive          | Notes |
|-----------------------|-----------------------------|-------|
| Task cards            | `SurfaceCard`               | Consistent with all prior surfaces |
| Task lists / grids    | `DataGrid`                  | — |
| Board / kanban views  | `BoardColumn` + `SurfaceCard` | Reuse pattern |
| Status & priority     | `CiStatusBadge`             | Mandatory |
| Execution actions     | `ActionButton` / `UtilityButton` | — |

All patterns must match Dashboard/Evidence/Audit/Calendar.

---

**End of My Tasks Canonical Primitive Usage Map**

**Next:** MyTasks_Token_Application_Matrix.md immediately.