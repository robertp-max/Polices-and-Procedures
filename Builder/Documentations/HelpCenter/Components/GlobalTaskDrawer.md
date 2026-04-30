# Component: GlobalTaskDrawer

**File:** `src/policy/components/pm/GlobalTaskDrawer.tsx`  
**Type:** App-wide Overlay Component  
**Used On:** All authenticated pages (mounted in `CommandCenterLayout`)

---

## Overview

`GlobalTaskDrawer` is a slide-over panel mounted at the layout level, accessible from any page in the application. It provides quick access to the current user's task list and allows viewing task details without navigating away from the current page.

---

## UI Breakdown

| Region | Description |
|---|---|
| Drawer Header | Title "My Tasks", close button |
| Filter Bar | Status filter (All / Active / Overdue / Completed), search input |
| Task List | Scrollable list of `PmTaskCard` components |
| Task Detail Panel | Right sub-panel showing full task details when a task is selected |
| Quick Actions | "Mark Complete", "View Event", "Open Form" buttons on selected task |

---

## User Actions

- Open drawer via the task icon in the top navigation bar
- Filter tasks by status or search by name
- Click a task card to view its full detail
- Mark a task complete from within the drawer
- Click "View Event" to navigate to the full Event Workspace

---

## System Behavior

- Drawer open/close state is managed by `selectedTaskStore`
- Task list is populated from `pmApiClient` (Lambda PM API) for persisted tasks, and from `personalStore` for personal tasks
- Marking a task complete writes to `regulatoryExecutionStore` and logs to `enforcementStore`
- Drawer does not reload task data on open; it uses the current store state

---

## Data Flow

| Data Element | ID Type | Source |
|---|---|---|
| Task list | `task_id` | `pmApiClient` / `personalStore` |
| Selected task | `task_id` | `selectedTaskStore` |
| Task completion | `task_id`, `event_id` | `regulatoryExecutionStore` |

---

## Permissions & Roles

| Action | Required Role |
|---|---|
| View own tasks | Any authenticated user |
| Mark tasks complete | Task assignee, `manager`, `admin` |
| View all tasks (admin) | `admin`, `super_admin` |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Task API unavailable | Drawer shows last known task list from store cache |
| Marking complete fails server-side | Optimistic update reverted; error toast shown |

---

## Audit & Compliance Impact

| Event | Logged |
|---|---|
| Task marked complete | Yes — `TASK_COMPLETE` in `enforcementStore` |
| Drawer opened | No |

---

## Dependencies

- `selectedTaskStore` — drawer open state and selected task
- `pmApiClient` — task data from Lambda PM API
- `personalStore` — personal task list
- `regulatoryExecutionStore` — task completion state
- `PmTaskCard` — task card sub-component
- `TaskDetailRightPanel` — task detail sub-component

---

## Known Issues / Gaps

- **GAP:** Drawer task list is not real-time — it reflects the last fetch, not live state. Tasks assigned to you after you opened a page will not appear until you navigate.
