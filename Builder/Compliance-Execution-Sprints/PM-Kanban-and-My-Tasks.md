# PM-Kanban-and-My-Tasks

**Phase:** Architecture only.
**Cross-refs:** `PM-Task-System.md`, `PM-SVAR-Component-Strategy.md`.

---

## 1. Purpose

Specify two of the most-used PM views: a personal **My Tasks** focus surface for the signed-in user, and a **Kanban board** that visualizes flow across a sprint, event, or filter.

Both views read from the same canonical Task selector (see `PM-Data-Model.md`) so statuses are consistent.

---

## 2. My Tasks

### 2.1 Layout
- Header: user name, current sprint badge (`yearXX`), filter bar, density toggle.
- Tabs:
  1. **Today** — tasks due today + overdue + in-progress assigned to me.
  2. **This Sprint** — all tasks pinned to current sprint, grouped by status.
  3. **Upcoming** — next 14 days.
  4. **Personal** — `source = personal` only.
  5. **Watching** — tasks where I am a watcher, read-only.
  6. **Calendar** — SVAR Calendar view for week/month.

### 2.2 Selectors
```
myTodayTasks(userId)    = tasks where userId in assignees AND (due_date <= today OR status='in_progress')
mySprintTasks(userId, sprintId) = tasks where userId in assignees AND sprint_id = sprintId
myUpcoming(userId)      = tasks where userId in assignees AND due_date in [today+1, today+14]
myPersonal(userId)      = tasks where source='personal' AND owner=userId
myWatching(userId)      = tasks where userId in watchers AND userId not in assignees
```

### 2.3 Behaviors
- Default sort: due ascending, then priority (derived from points + overdue boost).
- Inline actions: open drawer, change status (overlay only — see compliance constraint), pin to sprint, snooze notifications.
- Bulk actions in DataGrid mode (Sprint Backlog flavor).
- Personal task quick-add fixed at top of Personal tab.

### 2.4 Compliance constraint
- Status change UI for `source='ces'` tasks shows **read-only badge** plus a "Take action in CES" link that opens the Task Drawer at the right CES section.
- "Mark Done" never appears for CES tasks.

---

## 3. Kanban Board

### 3.1 Lanes
Default lanes match Task statuses: **Todo · In Progress · Blocked · In Review · Done**.

Optional swimlanes:
- By assignee
- By sprint
- By event
- By label

### 3.2 Card content
- Title (truncated 2 lines)
- Source badge (CES / Personal)
- Assignee avatars (max 3 + overflow count)
- Story points chip
- Due chip (color: green > today+3, amber today+1..3, red ≤ today)
- Dependency count chip (in/out)
- CES status raw (small, secondary) for CES tasks
- Overdue ribbon if overdue

### 3.3 Drag rules
| From → To | CES task | Personal task |
|---|---|---|
| Todo → In Progress | **Allowed** (writes overlay hint; CES will confirm) | Allowed |
| Any → Blocked | **Disallowed** (blockers come from CES) | Allowed |
| In Progress → In Review | **Disallowed** (CES-driven) | Allowed |
| In Review → Done | **Disallowed** | Allowed |
| Any → Done | **Disallowed** | Allowed |
| Personal → CES lane structure | N/A | N/A (separate boards or filtered together with badge) |

Disallowed drops show a tooltip: *"This status is managed by CES. Open the task to take the required action."*

### 3.4 SVAR Kanban usage
- Card renderer slot supplied with `<PmTaskCard/>`.
- `onDragEnd` adapter validates the move against drag-rules table; allowed moves write overlay (e.g. `status_hint = 'in_progress'`); disallowed moves are reverted.
- Swimlane re-grouping is a client-side operation; no backend change.

---

## 4. Data Flow

1. View → PM selector with current filter context.
2. Selector merges CES projection + overlay; returns Task[].
3. SVAR Kanban renders via adapter.
4. Drag → adapter → overlay write OR revert.
5. CES change → projection re-runs → board re-renders cards (status badges flip) without losing user's filter or scroll.

---

## 5. Backend Contract Impact

- Reuses `pm_overlay_task` and `pm_personal_task` writes.
- New optional overlay field: `status_hint` (informational; CES still authoritative for `status`).
- `GET /pm/tasks?view=mine&filter=...` returns merged Tasks server-side for scale.

---

## 6. UI Behavior

- Filter bar persisted per user per view.
- Empty states have a "Create Personal Task" CTA on Personal tab; on others a "Adjust filters" CTA.
- Keyboard: `j/k` move focus; `Enter` opens drawer; `t/i/r/d` request status change (validated against rules).
- Accessibility: drag operations also accessible via keyboard menu.

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| Users expect drag-to-done to "complete" CES task | Disallowed drops + clear tooltip + "Take action" link |
| Personal vs CES confusion | Distinct badge color; Personal tab segregates |
| Large boards perf | SVAR Kanban virtualization; lazy lane render |
| Filter state leakage between users | Persisted per user_id |

---

## 8. Acceptance Criteria

- My Tasks tabs enumerated with selector logic.
- Kanban drag-rules matrix documented.
- Card content checklist agreed.
- No CES write paths invoked from drag handlers.
- Keyboard a11y plan present.

---

## 9. Verification Checklist

- [ ] Selector pseudocode reviewed.
- [ ] Drag rules table covers every (from, to, source) triple.
- [ ] Card renderer fields confirmed against Task schema.
- [ ] Filter persistence keyed by user.
- [ ] SVAR Kanban API capabilities sanity-checked.
