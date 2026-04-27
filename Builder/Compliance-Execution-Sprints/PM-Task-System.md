# PM-Task-System

**Phase:** Architecture only.
**Cross-refs:** `PM-Data-Model.md`, `PM-Layer-Architecture.md`, `PM-Kanban-and-My-Tasks.md`.

---

## 1. Purpose

Define the canonical Task system that powers every PM view and integrates with CES without duplicating compliance state.

---

## 2. Task Lifecycle

### 2.1 Compliance task (`source: 'ces'`)
```
[ projected from CES ]
        │
        ▼
   ┌─────────┐  CES form started     ┌──────────────┐
   │  todo   │ ─────────────────────► │ in_progress  │
   └─────────┘                        └──────┬───────┘
        ▲                                    │ all required forms submitted
        │ overlay reset (rare)               ▼
        │                              ┌──────────────┐
   ┌─────────┐  blocker resolved       │  in_review   │
   │ blocked │ ◄──────── │             └──────┬───────┘
   └─────────┘           │                    │ all approvals granted + CES validation
        ▲                │                    ▼
        └────────────────┘             ┌──────────────┐
         CES blocker raised            │     done     │ (CES-validated)
                                       └──────────────┘
```

- All transitions for CES tasks are **derived** from CES state.
- PM cannot force `done` for a CES task.

### 2.2 Personal task (`source: 'personal'`)
- Free transition between any of the five statuses by the owner.
- Becomes a CES-bound task only if explicitly linked (`linked_event_id` set) — at which point it gains a projected sibling Task that is the authoritative compliance counterpart.

---

## 3. Task ID & Numbering

- `task_id = "{event.id}-{NN}"` for compliance tasks; NN ∈ 01..99.
- Numbering comes from CES execution-unit ordering, not PM.
- If CES exposes >99 units for an event, NN expands to NNN — captured as a future-proofing note in `PM-Data-Model.md`.
- Personal: `task_id = "personal:{uuid-v4}"`.

---

## 4. Assignment Model

### 4.1 Roles
- **Assignee:** primary doer; appears in My Tasks; counted in workload.
- **Watcher:** receives notifications; not counted in workload.
- **Approver:** read-through from CES approvals — never set in PM overlay.
- **Reporter:** for personal tasks, owner = reporter.

### 4.2 Multi-assignee
- Multiple assignees allowed; workload split is configurable (default: full points to each unless `split_points = true`, then equal split).
- Default behavior documented in `PM-Reporting-and-Workload.md`.

### 4.3 Auto-assignment hints
- CES role hints (e.g. "QAPI Coordinator") map to a default assignee per role registry; user may override.
- Reassignment writes a new `pm_audit` entry.

---

## 5. Task Detail Drawer

The drawer is the convergence point of CES + PM:

- **Header:** `task_id`, title, status badge, source badge (CES / Personal), sprint, due date, weekend-override flag.
- **PM Overlay panel:** assignees, watchers, story points, labels, dependencies (in/out), audit trail tail.
- **CES panel (CES tasks only):** existing step/form list (reusing the current CES drawer subcomponents), eSign status, evidence list, approval list. **Actions are CES-owned** (Open Form, Sign, Submit).
- **Activity tab:** merged stream of PM audit events + CES status transitions.
- **Personal panel (personal tasks only):** description editor, link-to-event button.

Rule: the drawer must NEVER expose a button labelled "Mark Done" for a CES task. Closing/Done is always implicit from CES outcomes.

---

## 6. Data Flow

1. View requests Tasks via PM selector.
2. Selector merges CES projection + overlay + personal.
3. User edits an overlay field → PM overlay write → audit append → selector re-emits.
4. User edits a CES action → CES write path → CES emits change → projection re-runs → selector re-emits.

---

## 7. Backend Contract Impact

- `pm_overlay_task` upsert endpoints (assign, set points, pin to sprint, label, weekend override).
- `pm_personal_task` CRUD.
- Read endpoint `GET /pm/tasks?filter=...` returns merged Tasks (server-side join recommended for scale).
- No changes to CES endpoints.

---

## 8. UI Behavior

- Status changes for CES tasks animate from CES events; cannot be dragged to `done` in Kanban (drag is permitted into other lanes only when overlay can support the change — see `PM-Kanban-and-My-Tasks.md`).
- Personal tasks are draggable across all lanes.
- Bulk operations (assign, label, sprint pin) supported in DataGrid.
- Inline edits debounced; conflict resolution: last-write-wins on overlay fields, but optimistic UI rolls back if overlay write fails.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| Users try to "complete" CES task in PM | Drag-to-done disabled for CES; explicit error toast linking to required CES action |
| Overlay edits race with CES projection | Selector recompute is debounced; overlay writes keyed by stable task_id |
| Personal task confused with compliance | Source badge always visible; KPI selectors filter source |
| Reassignment loses history | Audit trail append-only; old assignees preserved in audit `before` |

---

## 10. Acceptance Criteria

- Task lifecycle diagram present and matches CES state machine.
- Task ID rule applied uniformly across docs.
- Drawer separates CES and PM concerns visually and behaviorally.
- Bulk operations limited to overlay fields.
- Personal task path documented end-to-end including link-to-event.

---

## 11. Verification Checklist

- [ ] Lifecycle diagram cross-checked against `regulatoryExecutionStore` `effectiveStepStatus`.
- [ ] No PM action documented as completing a CES task.
- [ ] Drawer mockup (or wireframe note) lists each section and its source.
- [ ] Audit entries enumerated for each overlay action.
- [ ] Personal task linking flow documented.
