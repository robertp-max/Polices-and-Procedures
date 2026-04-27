# PM Unified Task Model

Status: implemented · Owner: PM Layer · Updated: 2026-04-27

## 1. Principle

There is exactly one canonical `Task` object per `task_id`, regardless of how
many surfaces render it. Event View, Gantt, Kanban, Sprint Board, My Tasks,
Approvals Queue, and Dashboard are **pure projections** of that one model.

PM views never:

- maintain independent task arrays,
- transform `task_id`s,
- duplicate or shadow tasks across stores.

## 2. Source of truth

| Domain                | Owner                                          |
|-----------------------|------------------------------------------------|
| CES task content      | `regulatoryEvents.ts` + `regulatoryExecutionStore` |
| eCIgn packet state    | `ecignStatusMap` + form/packet stores          |
| Per-task PM fields    | `pmOverlayStore` (assignment, sprint, points, deps) |
| Personal tasks        | `pmPersonalStore`                              |
| API mirror            | `pmApiClient` → `hhc-pm-api` Lambda            |

`useProjectedTasks()` in `src/policy/pm/taskProjection.ts` merges CES + Personal
into the canonical `Task[]`. In dev it asserts `assertNoDuplicateTaskIds()`
across the full merged list. Any duplicate throws and breaks the build.

## 3. Selected-task store

`src/policy/pm/selectedTaskStore.ts` (Zustand) holds:

```ts
{ taskId: string | null; openedFrom: TaskOpenSource; openedAt: ISO }
```

All view click handlers call `openTask(task_id, source)`. There is no other
mechanism for "show the task panel". The store contains only the id; the
task data is always re-resolved via `useProjectedTaskById(id)` so it stays
synchronized with CES + overlay mutations in real time.

## 4. Right panel

`src/policy/components/pm/TaskDetailRightPanel.tsx` is the single panel
component. It is rendered in two modes:

- **Inline rail** (Calendar, Master Calendar, My Tasks): the page reserves a
  3-column rail and mounts `<TaskDetailRightPanel taskId={...} />` itself.
- **Global drawer** (every other route): `GlobalTaskDrawer` mounted in
  `CommandCenterLayout` overlays the same component as a fixed right sidebar
  whenever `selectedTaskStore.taskId` is set.

This guarantees that opening a task from Approvals, Dashboard, or any future
view never silently no-ops.

## 5. Sync mechanism

```
[CES write / overlay write / personal write]
        │
        ▼
useProjectedTasks()  ──memoized──>  same Task[] reference for all consumers
        │
        ├── KanbanView          (column derived from t.status)
        ├── GanttView           (bar from t.due_date / dependencies)
        ├── SprintBoardView     (filtered by t.sprint_id)
        ├── MyTasksPmPage       (filtered by t.assigned_user_id)
        ├── ApprovalsQueuePage  (filtered to t.status === 'in_review')
        ├── PmDashboardPage     (rolled up by sprint)
        └── EventTaskList       (filtered by t.event_id)
```

When eCIgn marks a packet `signed_locked + approved`, `derivePmTaskStatus()`
flips the projected task to `done`; every consumer re-renders on the next
React commit because they share the same memoized array.

## 6. ID integrity rules

1. The only producers of `task_id` are `taskProjectionCore.ts` (deterministic
   from `event_id` + `form_id`/`step_id`) and `personalStore.ts` (`PERS-…`).
2. `assertNoDuplicateTaskIds()` runs on every projection in dev; `import.meta.env.DEV`
   guards production cost.
3. PM views are forbidden from constructing or rewriting `task_id`. Linters
   should flag any string literal of the form `task_id:` outside the two
   producers.

## 7. Action routing

All action buttons in `TaskDetailRightPanel` route through:

- CES form actions → `useRegulatoryExecutionStore` (open form, sign, submit)
- eCIgn packet actions → packet store (sign, approve, return)
- PM-only fields → `usePmOverlayStore` (assign, pin sprint, story points, labels, deps)
- Personal-task fields → `usePmPersonalStore`

No PM view ever bypasses these.
