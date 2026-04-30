# Page: Dashboard

**Route:** `/dashboard`  
**File:** `src/policy/pages/DashboardPage.tsx`  
**Access:** All authenticated users

---

## Page Purpose

The Dashboard is the main landing page for all authenticated users. It provides an at-a-glance view of the organization's current compliance health status, including overdue events, upcoming deadlines, evidence gaps, and high-priority tasks.

---

## UI Layout

| Region | Description |
|---|---|
| KPI Tiles Row | 4–6 metric tiles: Overdue Events, SLA Warning, Evidence Gaps, Certified This Quarter |
| Urgent Events Panel | Scrollable list of events requiring immediate attention |
| My Tasks Panel | Current user's top priority tasks |
| Recent Activity Feed | Latest compliance actions across the organization |
| Quick Links | Buttons to Calendar, Evidence Center, Policy Library |

---

## Key Actions

- Click a KPI tile to navigate to the filtered view (e.g., clicking "Overdue" filters the Calendar)
- Click an event in the Urgent Events panel to open its Event Workspace
- Click a task to open it in the Global Task Drawer
- Click "View All" on any panel to navigate to the full page

---

## Linked Workflows

The Dashboard surfaces events and tasks from all active workflows. It does not execute workflows directly.

---

## Data Used

| Data | Source |
|---|---|
| KPI metrics | Computed from `regulatoryExecutionStore` + `autogenStore` |
| Urgent events | `autogenStore` filtered by `audit_state` |
| My tasks | `pmApiClient` + `personalStore` |
| Recent activity | `enforcementStore.recentActions()` |

---

## Permissions

- All authenticated users see the dashboard
- KPI tiles and event list are scoped to the user's role (coordinators see their events; admins see all)
- The "Certified This Quarter" count reflects organization-wide certifications

---

## Audit Impact

- Dashboard view is not individually logged
- Clicking into an event or task generates audit events in those sub-systems
