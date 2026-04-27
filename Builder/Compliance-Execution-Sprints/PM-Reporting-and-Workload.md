# PM-Reporting-and-Workload

**Phase:** Architecture only.
**Cross-refs:** `PM-Data-Model.md`, `PM-Sprint-Board-Design.md`, `PM-Task-System.md`.

---

## 1. Purpose

Provide reporting, filters, and workload planning surfaces that derive from canonical Tasks and respect the CES vs personal distinction.

---

## 2. Reports Catalog

| Report | Slice | Source | Notes |
|---|---|---|---|
| **Compliance KPI** | Period (sprint/month/quarter/year) | CES tasks only | Required complete / required total |
| **Sprint Burndown** | Sprint | CES + personal (split lines) | Story points remaining over days |
| **Workload by Assignee** | Sprint or window | All tasks | Sum of points; over/under capacity |
| **Throughput** | Period | CES `done` only | Count tasks per period |
| **Cycle Time** | Period | CES tasks | Time from `in_progress` → `done` |
| **Blocker Aging** | Open blockers | CES `blocked` | Time in blocked, by event/owner |
| **Approval SLA** | Period | CES approvals | Time from request → decision |
| **Evidence Completeness** | Period | CES evidence | % steps with evidence on first submission |
| **Weekend Override Audit** | Period | Overlay overrides | Count + reasons |
| **Personal Productivity** | User | Personal tasks | Self-only by default |

---

## 3. Filters (shared `<PmFilterBar/>`)

Standard facets across all reports + boards:
- Date range (presets + custom)
- Sprint(s)
- Event(s)
- Assignee(s)
- Watcher
- Status
- Source (CES / Personal)
- Label
- Has dependencies
- Weekend override
- Approval state

Filter state encoded in URL for shareable views.

---

## 4. Workload Planning

### 4.1 Capacity model
- Per assignee per sprint: `capacity_points` (default 8; configurable per role).
- Time off / PTO subtracts capacity.
- Personal tasks consume capacity only if assignee opts in.

### 4.2 Heatmap
- Rows: assignees; columns: sprints (current + next 5).
- Cell: assigned points / capacity, color-coded green/amber/red.
- Click cell → filtered DataGrid of those tasks for that assignee × sprint.

### 4.3 What-if planning
- "Drag" a task between sprints in Plan view recalculates heatmap live (preview only until commit).
- Allocator suggestions surface as "smart" badges on cells.

---

## 5. Data Flow

1. Reports view requests aggregates via `GET /pm/reports/:name?filter=...`.
2. Backend computes from CES truth + PM overlay (read-only joins).
3. Snapshots persisted nightly for trend reports (throughput, cycle time, approval SLA) to avoid recomputation costs.
4. UI renders SVAR DataGrid (tabular) + small Vega/Recharts (or equivalent) for charts. Charts library choice deferred — no SVAR chart component used unless one fits at evaluation time.

---

## 6. Backend Contract Impact

- New report endpoints (additive).
- New nightly snapshot job (`pm_report_snapshot` table).
- No CES schema changes.

---

## 7. UI Behavior

- Reports page: left nav of report names + right pane of selected report (filter bar + chart + DataGrid).
- Export: CSV + PDF (print-friendly view).
- Saved views (per user): stored filter + report combos.
- Compliance KPI is the headline tile on PM Home.

---

## 8. Compliance Boundary

- Compliance KPI **only** counts CES tasks where status = `done` (CES-validated).
- Personal completion shown beside but never inside compliance figures.
- Approval SLA derived from CES approvals — PM does not synthesize approvals.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| Heavy reports slow down PM views | Server-side aggregation + nightly snapshots |
| Filter URL drift breaks shared links | Versioned filter encoding; backward compatible |
| Personal tasks contaminate compliance KPI | Source filter enforced server-side and double-checked client-side |
| Capacity defaults wrong per role | Configurable; reviewed quarterly |
| Chart library choice future tech debt | Wrap chart in adapter for swap |

---

## 10. Acceptance Criteria

- Reports catalog complete with source/slice.
- Shared filter bar facets enumerated.
- Capacity model defined and configurable.
- Compliance KPI definition unambiguous.
- Snapshots vs live distinction documented.

---

## 11. Verification Checklist

- [ ] Each report has a one-line definition + SQL/selector sketch.
- [ ] Filter encoding versioned.
- [ ] Capacity defaults agreed.
- [ ] Snapshot table cadence noted.
- [ ] Charts library decision tracked in `PM-Implementation-Plan.md`.
