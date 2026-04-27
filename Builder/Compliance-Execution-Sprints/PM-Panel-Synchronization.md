# PM-Panel-Synchronization

**Cross-refs:** [PM-Layer-Architecture.md](PM-Layer-Architecture.md), [PM-Data-Model.md](PM-Data-Model.md), [PM-Task-System.md](PM-Task-System.md), [eCIgn-Centered-Submission/12](../eCIgn-Centered-Submission/12-eCIgn-Integration-with-PM-Tasks.md).

---

## 1. Purpose
Guarantee that the **same canonical task objects** drive every PM view (Event View, Gantt, Kanban, Sprint Board, My Tasks) and that a **single Task Detail Right Panel** opens with the same content regardless of entry point.

## 2. Non-negotiable rule
- All PM views render tasks projected from CES + eCIgn — **never** from a parallel store.
- `task_id` is **stable** and **identical** across all views (`{event.id}-{NN}` for compliance, `personal:{uuid}` for personal).
- No view creates, mutates, or transforms task IDs.

## 3. Single source of truth
```
                        ┌──────────────┐
                        │  Projector   │  ◄── CES + eCIgn + PM overlay
                        └──────┬───────┘
                               │ Task[]  (deterministic, memoized)
       ┌──────────┬────────────┼────────────┬───────────┬────────────┐
       ▼          ▼            ▼            ▼           ▼            ▼
   EventView  MyTasks       Kanban        Gantt    SprintBoard   Reports
       │          │            │            │           │            │
       └──────────┴── click ───┴── click ───┴── click ──┴── click ───┘
                               │
                               ▼
                  ┌────────────────────────────┐
                  │  TaskDetailRightPanel      │   single component
                  │  reads via projector by id │   reused by all views
                  └────────────────────────────┘
```

## 4. Right Panel content (mandatory)

### 4.1 Overview
- Title, status chip (PM status), event name, workflow name, policy reference.

### 4.2 Assignment
- Assigned user, required signers, approvers.

### 4.3 Timeline
- Due date, sprint ID (`yearXX`), dependency chain (upstream/downstream).

### 4.4 eCIgn (if `form_id` present)
- Packet status (UX label), signers progress (signed/total), approval state.
- Action buttons: Open Form, Sign, Approve, Return for correction.

### 4.5 Evidence
- Status (missing | generated | validated), link to artifact, completion timestamp.

### 4.6 Audit Trail
- Recent compliance + PM rows merged chronologically with origin badge.

### 4.7 Actions
- Open Form (routes to eCIgn workspace `/forms/:formId`).
- View event context, view workflow, view policy, view evidence.

## 5. Sync behavior
- All PM views subscribe to the projector selector.
- Any change in CES truth or eCIgn packet state triggers projector recomputation → all views re-render.
- Examples:
  - Packet `signed_locked` + evidence validated → task `done` in My Tasks, Kanban Done lane, Gantt progress 100%, Sprint burndown updated, Event View badge flipped.
  - Due date changed in Right Panel → all views show new due chip; Gantt bar repositions.
  - Dependency added → Gantt link drawn instantly.

## 6. Implementation rules
1. **Projector is the only constructor of Task objects.** No view/store may instantiate a Task.
2. **Right Panel is the only task-detail UI.** Other views may render compact cards but must defer detail to the panel.
3. **All overlay writes go through `pmOverlayStore`.** No direct mutation of projected Tasks.
4. **No CES writes from PM.** Compliance state changes only via CES + eCIgn pipelines.
5. **Memoized selectors.** Projector output is referentially stable per `(ces_snapshot, ecign_snapshot, overlay_snapshot)`.

## 7. ID integrity enforcement
- Dev-mode guard `assertNoDuplicateTaskIds(tasks)` runs after each projector emission and throws on duplicate IDs.
- Lint convention bans construction of `Task` outside `taskProjection.ts`.
- Optional runtime check: any view receiving a Task with an unknown `task_id` (no projector entry) renders an error boundary, never a stale fallback.

## 8. Performance
- Projector memoizes by snapshot identities.
- Right Panel mounts once per app session; updates props (`task_id`).
- Views virtualize lists/grids/Gantt rows.

## 9. Backend contract impact
- None unique to this synchronization initiative.
- Overlay endpoints land in PM phase 1; today the overlay is in-memory + persisted to local storage.

## 10. Acceptance criteria
- All PM views consume `useProjectedTasks()`.
- Same `task_id` returned across views for the same compliance unit.
- Right Panel renders identical content given the same `task_id` regardless of entry view.
- Updates from any source flow to all views simultaneously.
- No PM writes can mutate CES or eCIgn state.

## 11. Verification checklist
- [ ] Click a task in Event View → opens panel with task X.
- [ ] Click same task in My Tasks → opens panel with task X (same `task_id`).
- [ ] Repeat for Kanban / Gantt / Sprint as those views land.
- [ ] Lock + approve a form → all views update.
- [ ] Drag a CES task to Done in Kanban → drop rejected; tooltip surfaces eCIgn action.
- [ ] Weekend pin without override → rejected; reason prompted; PM audit appended.
- [ ] Dev-mode duplicate-ID guard never fires in normal usage.
