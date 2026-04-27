# 08 — Calendar Merge and Toggle

> Status: ACTIVE · Owner: Platform Architecture
> Companion to: [06-Command-Center-CES-Merge-Architecture.md](06-Command-Center-CES-Merge-Architecture.md), [07-Shared-Data-Contracts.md](07-Shared-Data-Contracts.md)

## 1. Single Calendar, Two Views

There is **one** calendar route. The previous standalone `/ces/calendar` page is gone.

| Route | Behavior |
| --- | --- |
| `/calendar` | Default — Command Center timeline view (TimelineMonth + WorkflowExecutionPanel 70/30). |
| `/calendar?view=calendar` | Explicit calendar view. Same as default. |
| `/calendar?view=sprint` | CES `<ComplianceCalendar />` view in the same shell, same chrome. |
| `/ces/calendar` | **Redirects** to `/calendar?view=sprint` via React Router `<Navigate replace />`. |

## 2. URL Param Contract

`MasterCalendarPage.tsx` reads the `view` query parameter on mount and on every change:

```ts
const [searchParams, setSearchParams] = useSearchParams();
const view = (searchParams.get('view') === 'sprint') ? 'sprint' : 'calendar';

const setView = (next: 'calendar' | 'sprint') => {
  const p = new URLSearchParams(searchParams);
  if (next === 'sprint') p.set('view', 'sprint');
  else p.delete('view');
  setSearchParams(p, { replace: true });
};
```

The toggle lives inside `TimelineHeader` and uses `aria-selected` for accessibility.

## 3. Shared Header & Filters

Both views share:
- `TimelineHeader` (title, search, filter chips, view toggle)
- The `CommandCenterLayout` shell (so user navigation, theme, profile are unchanged)
- The shared snapshot: both views read from `useComplianceExecution()` for any cross-system surfacing.

Things scoped to the **calendar** view only:
- `JulyReadinessBanner` (anchored to demo date, calendar context only)
- The right-side `WorkflowExecutionPanel` strip

Things scoped to the **sprint** view only:
- `<ComplianceCalendar />` from `src/policy/ces/components/calendar/` — the CES sprint canvas.

## 4. Why this works

- **No duplicate calendar component.** The Command Center timeline still owns macro-month rendering. CES still owns sprint micro-rendering. The shell, route, header, and filters are shared.
- **No duplicate route.** Old links to `/ces/calendar` keep working via redirect.
- **No drift.** Both views feed off the merged events from `useComplianceExecution()`.

## 5. Linking to a specific view

| From | Use |
| --- | --- |
| Sidebar / nav | `to="/calendar?view=sprint"` for CES, `to="/calendar"` for default. |
| In-app code | `navigate('/calendar?view=sprint')` |
| Cross-system event | `emitCompliance(COMPLIANCE_EVENT.CALENDAR_VIEW, { view: 'sprint' })` (a future listener can sync the URL). |

## 6. Migration of legacy entry points

| Legacy | Replacement |
| --- | --- |
| `<CesCalendarPage />` (deleted import in `src/App.tsx`) | `MasterCalendarPage` with `?view=sprint` |
| `CES_NAV` "Compliance Calendar" entry | `to: '/calendar?view=sprint'` |
| `CommandCenterLayout` CES sub-item | `to: '/calendar?view=sprint'` |
