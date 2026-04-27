# PM-Layer-Architecture

**Phase:** Architecture only — no implementation in this phase.
**Scope:** Define a Project Management (PM) execution layer that sits ON TOP of the existing CES regulatory engine without replacing or forking its source of truth.

---

## 1. Purpose

CES today owns regulatory compliance execution: Regulatory Events → Workflow/Event-derived Execution Units → Forms/eSign/Evidence → Completion Validation. Operators need a PM-style execution surface (My Tasks, Kanban, Timeline, Sprint Board, Dependencies, Workload, Notifications, Reporting) on top of CES. The PM Layer is a **read/projection + thin assignment overlay** over CES — it never re-implements compliance logic.

Goals:
- Single canonical task record reused by all PM views (Event, My Tasks, Kanban, Gantt, Sprint Board, Reports, Notifications).
- CES remains the system of record for compliance status, evidence, and approvals.
- PM-only metadata (assignee, story points, sprint placement, personal tasks) is additive — it cannot mutate compliance state directly.
- Evaluate SVAR React components for Gantt, Kanban, DataGrid, Filter, Calendar/Scheduler — pick where they pull weight, build native where they don't.

Non-goals (this phase):
- No app-wide UI redesign.
- No dark mode work.
- No Gantt-only focus.
- No code changes.

---

## 2. Layered Architecture

```
+------------------------------------------------------+
|        PM Views (read + thin write overlay)          |
|  My Tasks | Kanban | Gantt | Sprint Board | Reports  |
+------------------------------------------------------+
|        PM Projection Layer (selectors + adapters)    |
|   - Task projector (event → tasks)                   |
|   - Sprint allocator (Sun–Sat, yearXX)               |
|   - Dependency resolver                              |
|   - Notification/reminder scheduler                  |
+------------------------------------------------------+
|        PM Overlay Store (additive, non-canonical)    |
|   - assignments, story points, sprint pin, labels,   |
|     personal tasks, watchers                         |
+------------------------------------------------------+
|        CES Source of Truth (DO NOT FORK)             |
|   regulatoryExecutionStore + regulatoryEvents +      |
|   forms/eSign/evidence/approvals                     |
+------------------------------------------------------+
```

**Direction of truth:**
- CES → PM: status, completion, evidence, blockers (read-only into PM).
- PM → CES: only assignment hints, scheduling hints, watcher notifications. PM never marks a step complete; only CES validation can.

---

## 3. Canonical Task Record

A "Task" in PM is a projection of one CES execution unit, plus optional PM overlay fields, plus optional personal tasks (which have no CES backing).

```
Task {
  id: string                   // execution_unit_id = `${event.id}-${NN}` for compliance tasks
                               //                  or `personal:${uuid}` for personal
  source: 'ces' | 'personal'
  event_id?: string            // present when source = 'ces'
  step_id?: string
  form_ids?: string[]
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'blocked' | 'in_review' | 'done'   // derived from CES for ces tasks
  ces_status_raw?: string      // canonical CES status, never mutated by PM
  due_date?: ISODate
  sprint_id?: string           // yearXX (e.g. 2026-08)
  assignees: UserId[]          // overlay
  watchers: UserId[]           // overlay
  story_points?: number        // overlay
  labels?: string[]            // overlay
  dependencies: TaskId[]       // overlay (PM dep graph; CES dep graph remains separate)
  evidence_refs?: EvidenceRef[]// read-through from CES
  approval_refs?: ApprovalRef[]// read-through from CES
  audit_trail: AuditEntry[]    // append-only
  is_personal_weekend_ok?: boolean // personal-only opt-in
}
```

Rule: **PM tasks are never created for CES execution units — they are projected.** The projector is deterministic and idempotent.

---

## 4. Data Flow

### 4.1 Read flow (CES → PM)
1. `regulatoryExecutionStore` exposes events, steps, forms, approvals, evidence.
2. PM `taskProjector` walks each active event, emits one Task per execution unit using `{event.id}-{NN}` ID rule.
3. `effectiveStatus` mapper translates CES step/form state → PM status enum (`todo | in_progress | blocked | in_review | done`).
4. PM Overlay Store is joined by Task ID to add assignees, sprint, points, labels, dependencies.
5. Views subscribe to the merged selector — no view talks to CES directly except for action handoff (e.g. "Open Form" deep link into existing CES drawer).

### 4.2 Write flow (PM → overlay only)
1. Assigning a user, setting story points, moving to a sprint, adding a label, adding a dependency → writes to PM Overlay Store only.
2. Marking compliance "done" is **forbidden in PM**. The Task Drawer surfaces the existing CES action (Open Form, Sign, Submit) which routes through the existing CES write paths.
3. Personal task create/update writes to PM Overlay Store under `source: 'personal'`.

### 4.3 Status reconciliation
- Periodic reconciler (or store subscription) re-projects whenever CES emits change events.
- Overlay metadata is preserved across reconciliations because it is keyed by Task ID, which is stable (`{event.id}-{NN}`).

---

## 5. Backend Contract Impact

**No breaking changes to CES backend.** Additive only.

- New PM tables/collections (or local store equivalents in current architecture):
  - `pm_overlay_task` (task_id PK, assignees, watchers, points, sprint_id, labels)
  - `pm_dependency` (from_task_id, to_task_id, type)
  - `pm_personal_task` (uuid, owner, payload)
  - `pm_notification` (id, user_id, task_id, kind, scheduled_at, sent_at, read_at)
  - `pm_audit` (id, actor, task_id, action, before, after, ts)
- CES tables remain authoritative for status, evidence, approvals.
- A read-only join view (`pm_task_view`) computes the canonical Task record on demand.

---

## 6. UI Behavior

- All PM views render from the same merged selector. Switching views never produces inconsistent statuses.
- Task Drawer shows: PM overlay (assignee, sprint, points, deps) + CES panel (steps, forms, eSign, evidence) — clearly demarcated.
- Compliance actions (Open Form, eSign, Approve) reuse existing CES components. PM does not reimplement them.
- Weekend rule enforced visually: compliance tasks scheduled on Sat/Sun show a banner + require explicit override.
- Personal tasks have a distinct visual badge and are excluded from compliance KPIs by default.

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| PM overlay drifts from CES truth | Deterministic projector + reconciler; overlay keyed by stable `{event.id}-{NN}` |
| Users mark "done" in Kanban without compliance complete | PM "done" column is read-only for CES tasks; compliance done requires CES validation |
| SVAR PRO licensing surprise | Document PRO vs OSS upfront in `PM-SVAR-Component-Strategy.md` |
| Sprint cadence drift across years | Pure function from year → sprint windows; unit-tested |
| Performance with many tasks in Gantt | Virtualization, lazy expand, server-side filter pre-pass |
| Permission leakage in shared views | Permission filter applied at selector level, not at view level |

---

## 8. Acceptance Criteria

- One Task ID format documented and consistently used across all view specs.
- Diagram shows clear directional flow CES → PM (read) and PM → overlay (write).
- No spec proposes mutating CES state from a PM view.
- Sprint window calculation specified and reproducible from year + sprint number.
- Personal task rule documented (My Tasks always; PM views optional; not counted in compliance unless linked).
- SVAR component decisions justified per component, not "use SVAR everywhere."

---

## 9. Verification Checklist

- [ ] Architecture diagram present and reviewed.
- [ ] Canonical Task record schema agreed.
- [ ] Read/write directionality unambiguous.
- [ ] Backend additive-only — no CES schema breakage.
- [ ] Sprint cadence rules cross-referenced in `PM-Sprint-Board-Design.md`.
- [ ] Task ID rule cross-referenced in `PM-Data-Model.md` and `PM-Task-System.md`.
- [ ] Risks have explicit mitigations.
- [ ] All 12 PM-* docs exist and reference each other consistently.
