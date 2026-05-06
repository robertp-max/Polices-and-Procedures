# Performance and sprint scoping (CES / PM views)

This document describes **default data scoping** and **performance** behavior for task-heavy views after the sprint/month filter work.

## Goals

- Avoid computing `buildEventExecutionDataflow` for **every** regulatory event on every render when only a **month** or **sprint** slice is needed.
- Default **Kanban**, **Sprint Board**, **Gantt**, **My Tasks**, and the **CES execution board** to the **current PM sprint** (see sprint rules below).
- Default **Master Calendar** grid to the **current month** only (existing `year` / `month` state anchored to `TODAY_ANCHOR`).
- Keep **task IDs, event IDs, links, and execution unit wiring** intact; scoping only **reduces which parents** are projected, not the task model.

## PM sprint calendar (canonical)

Implemented in `src/policy/pm/sprintWindows.ts`:

- **26 sprints per calendar year**, each **14 calendar days**.
- **Sprint 01** begins on the **first Sunday** of the year (UTC date math).
- Internal id format: `YYYY-NN` (e.g. `2026-01`) with zero-padded sprint number.
- **Display format** (UI labels): `YYYY:SS` with colon, e.g. `2026:01 — Sprint 1` via `toDisplaySprintId` + `sprintDropdownLabel`.

**Current sprint** for the demo clock: `currentSprint(TODAY_ANCHOR)` where `TODAY_ANCHOR` is defined in `regulatoryEvents.ts`.

## Global sprint selection store

`src/policy/pm/pmViewSprintStore.ts` holds the **selected** `SprintWindow` for:

- `useProjectedTasks('sprint' | 'full')` — **default `'sprint'`**: CES + overlay tasks only for events overlapping the window; personal tasks require a `due_date` in-window. Pass **`'full'`** for dashboards, sprint plan/review, approvals queue, event task lists, mobile incident flow, and the PM notification ticker.
- `useComplianceExecution({ mode: 'sprint', window })` where callers opt into sprint-scoped CES snapshots (e.g. CES board, CES compliance mini-calendar).
- UI: `SprintScopeToolbar` (year dropdown + sprint dropdown + prev/next/current).

Changing the toolbar updates all consumers that read this store.

## `useComplianceExecution` scopes

`src/policy/compliance-execution/complianceExecutionStore.ts` accepts an optional **scope** argument:

| Scope | Effect |
|-------|--------|
| `{ mode: 'all' }` (default) | All regulatory events (unchanged for Dashboard, obligations, etc.). |
| `{ mode: 'month', year, monthIndex }` | Only events whose `date` falls in that calendar month. |
| `{ mode: 'sprint', window }` | Only events whose schedule **overlaps** the sprint window (`regulatoryEventOverlapsSprint`). |

Scoped runs **only call** `buildEventExecutionDataflow` for the filtered event list, which is the main CPU win.

## Master Calendar (`MasterCalendarPage`)

- **Calendar** view: continues to render **`monthInstances`** only (no full multi-year grid).
- **Sprint / Kanban / Gantt** views: show **`SprintScopeToolbar`** above the view; sprint side panel uses `sprintInstances` filtered with `regulatoryEventOverlapsSprint` (not the legacy CES Mon–Fri epoch window).
- Removed unused global `useComplianceExecution` subscription from this page (PM views use `useProjectedTasks`, which is sprint-scoped).

## Gantt

Timeline bounds default to the **selected PM sprint** (plus small padding) so the chart does not expand to a multi-year span on first paint. Tasks outside the sprint window are omitted from the Gantt model for that view.

## Workflow drawer

`WorkflowDrawer` resolves the parent **RegulatoryEvent** from `REGULATORY_EVENTS` + autogen/triggered pools so details still load when CES `snap.events` is sprint-filtered. Sibling units use the `allUnits` prop from the board instead of a global execution snapshot.

## Task `sprint_id` alignment

`inferSprintIdFromDate` in `src/policy/pm/sprintId.ts` now returns the **same** id as `sprintWindows.sprintForDate(...).id` (`YYYY-NN`), so Sprint Board column filters stay consistent with the PM sprint store.

## Related files

| Area | File |
|------|------|
| Sprint math + overlap helpers | `src/policy/pm/sprintWindows.ts` |
| Task date → sprint id | `src/policy/pm/sprintId.ts` |
| Selected sprint store | `src/policy/pm/pmViewSprintStore.ts` |
| Projected tasks input filter | `src/policy/pm/taskProjection.ts` |
| CES snapshot scope | `src/policy/compliance-execution/complianceExecutionStore.ts` |
| Toolbar UI | `src/policy/components/pm/SprintScopeToolbar.tsx` |
| PM views (Gantt / Sprint board) | `src/policy/components/pm/PmViews.tsx` |
| Master calendar | `src/policy/pages/MasterCalendarPage.tsx` |
| CES board | `src/policy/ces/components/board/SprintExecutionBoard.tsx` |
| My Tasks | `src/policy/components/pm/MyTasksPmPage.tsx` |
| CES compliance calendar strip | `src/policy/ces/components/calendar/ComplianceCalendar.tsx` |
