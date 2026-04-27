# PM-Sprint-Board-Design

**Phase:** Architecture only.
**Cross-refs:** `PM-Data-Model.md` §6 (Sprint Window Function), `PM-Task-System.md`, `PM-Reporting-and-Workload.md`.

---

## 1. Purpose

Replace the current sprint surface with a unified Sprint Board that drives sprint planning, in-flight execution, and end-of-sprint review — using the canonical Task system and respecting compliance rules.

---

## 2. Sprint Cadence (canonical)

- **Week:** Sunday → Saturday.
- **Sprint length:** 14 calendar days.
- **Sprint 01:** starts on the **first Sunday** of the calendar year.
- **Sprint IDs:** `"{YYYY}-{NN}"` where NN ∈ `01..26`.
- **Year-boundary edges:** see `PM-Data-Model.md` §6.4 (pre-first-Sunday days extend the previous year's last sprint; post-Sprint 26 days extend Sprint 26).

### 2.1 Weekend rule
- **Compliance/event tasks must NOT be scheduled on Sat/Sun** unless `weekend_override = true` is set explicitly with a reason.
- **Personal tasks** may be scheduled on weekends only when the owner sets `is_weekend_ok = true`.
- Auto-scheduler (sprint allocator) skips weekends for compliance tasks; manual placement triggers a confirmation dialog.

---

## 3. Layout

The Sprint Board has three primary tabs:

### 3.1 Plan
- DataGrid backlog of unscheduled tasks (filtered to selectable scope: my team, an event, all).
- Right panel: target sprint preview with capacity bar (sum of story points vs. team capacity).
- Drag rows from backlog to sprint; weekend-rule guard fires on day assignment within sprint.
- Bulk pin to sprint via toolbar action.

### 3.2 Execute
- Kanban view filtered to selected sprint (reuses `PM-Kanban-and-My-Tasks.md` board).
- Burndown widget (story points remaining vs. sprint days).
- Daily standup helper: list per-assignee of "did yesterday / doing today / blockers" derived from status transitions.

### 3.3 Review
- Read-only summary at sprint end:
  - Completed (CES-validated only) vs. carried over.
  - Compliance KPI: required compliance tasks completed / required.
  - Personal completion (informational, not in compliance KPI).
  - Notable blockers and resolution time.
- Action: bulk roll-over remaining tasks to next sprint with one confirm.

---

## 4. Sprint Allocator (auto-scheduling)

```
allocateTasksToSprint(tasks, sprintId, capacity):
  window = sprintWindowsForYear(year(sprintId))[idx(sprintId)]
  workdays = daysIn(window).filter(d => !isWeekend(d) || allowWeekend(d))
  for task in tasks sorted by (due_date asc, points desc, dependency_priority):
    if hasUnmetDeps(task, planned): defer
    place(task, earliest(workday with capacity for assignees(task)))
  return placement
```

- Capacity per assignee is configurable (default: 8 points / sprint).
- Dependencies enforced: a task cannot be placed before its predecessors complete.
- Output is **a proposal** — user confirms before commit.

---

## 5. Data Flow

1. Plan tab loads backlog + selected sprint via PM selector.
2. User drags / runs allocator → overlay writes (`sprint_id`, `start_date`, `due_date`).
3. Execute tab subscribes to sprint-filtered selector → renders Kanban + burndown.
4. CES status changes → projection re-runs → burndown recalculates.
5. Review tab is a derived report; no writes except "Roll over remaining."

---

## 6. Backend Contract Impact

- Overlay writes already covered (`sprint_id`, `start_date`, `due_date`, `weekend_override`).
- New endpoint (or selector): `GET /pm/sprint/:id/summary` returns aggregates for Review tab.
- Optional: `POST /pm/sprint/:id/rollover` performs bulk overlay update of remaining tasks to `:nextId` (transactional).

---

## 7. UI Behavior

- Sprint switcher at top: previous / current / next + jump-to picker (year + sprint number).
- Capacity bar turns amber at 90%, red over 100%.
- Weekend cells are visually distinct (gray); placing a compliance task there opens an override confirmation requiring a reason (stored in `pm_audit`).
- Burndown updates live as statuses change.

---

## 8. Compliance Boundary

- "Done" count in burndown counts CES tasks only when CES status = `done` (validated). No PM hint can satisfy completion.
- Personal tasks shown in a separate burndown line (dashed) and excluded from compliance KPI.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| Allocator overcommits a user | Capacity per assignee enforced; over-capacity placements require explicit override |
| Weekend placement abuse | Override requires reason + audit entry; reports highlight weekend overrides |
| Year-boundary sprint confusion | Sprint window function is sole source; tested across years |
| Roll-over loses context (e.g. labels) | Roll-over preserves all overlay fields except `sprint_id` |
| Burndown noise from CES projection changes | Debounced recompute; daily snapshots persisted for trend |

---

## 10. Acceptance Criteria

- Sprint cadence rules implementable from a single pure function.
- Plan / Execute / Review tabs each have explicit data source + write boundaries.
- Allocator algorithm specified, deterministic, capacity-aware, dependency-aware.
- Weekend rule enforced uniformly with audit trail.
- Compliance KPI counts only CES-validated done.

---

## 11. Verification Checklist

- [ ] Sprint window function unit-tested for 2024–2030.
- [ ] Weekend override flow includes audit entry.
- [ ] Roll-over transaction is atomic (all-or-nothing).
- [ ] Burndown widget data source documented.
- [ ] Capacity defaults agreed with operations.
- [ ] No path documented that completes CES task from Sprint Board.
