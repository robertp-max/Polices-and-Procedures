# Component: CommandCenterLayout

**File:** `src/policy/components/CommandCenterLayout.tsx`  
**Type:** Layout Shell (Persistent)  
**Affects:** All authenticated routes

---

## Overview

`CommandCenterLayout` is the root authenticated layout that wraps every protected page in the application. It renders the left-side navigation rail, the top header bar, the page content area, and the `GlobalTaskDrawer`. It also manages the application theme (CI-ION dark mode vs Care Indeed light mode) and keyboard navigation.

---

## UI Breakdown

| Region | Description |
|---|---|
| Left Sidebar | Navigation links grouped by functional area (Compliance, Library, Admin, etc.) |
| Brand Rail | Logo area with theme toggle between "CI-ION" (dark) and "Care Indeed" (light) |
| Top Bar | Page title, notification bell, user avatar, Auditor Mode toggle |
| Content Area | `<Outlet />` — renders the active route's page component |
| Global Task Drawer | Slide-over task panel accessible from any page |

---

## User Actions

- Click any sidebar link to navigate to that page
- Toggle between CI-ION (dark) and Care Indeed (light) themes using the brand icon in the sidebar
- Open the Global Task Drawer by clicking the task icon in the top bar
- Toggle Auditor Mode (shield icon) to enter/exit read-only audit view
- Click the notification bell to view unread compliance alerts

---

## System Behavior

- All navigation links are lazy-loaded; the active route is highlighted in the sidebar
- Theme state is persisted to localStorage via `ciModeStore`
- Auditor Mode state is persisted to localStorage via `auditorModeStore`; when active, all mutation controls across the entire app are disabled
- The `GlobalTaskDrawer` is mounted once at layout level and controlled globally via `selectedTaskStore`
- Keyboard shortcut `?` opens the keyboard shortcut reference panel

---

## Data Flow

| Data Element | Source | Purpose |
|---|---|---|
| Theme preference | `ciModeStore` (localStorage) | Controls which CSS class set is applied |
| Auditor Mode flag | `auditorModeStore` (localStorage) | Disables all mutation buttons when `true` |
| Selected task | `selectedTaskStore` | Drives the Global Task Drawer content |
| Notification count | `notificationStore` | Displays badge count on bell icon |
| Current user | Auth session cookie / `AuthApi.me()` | Displays user avatar and role |

No direct `policy_id`, `workflow_id`, or `event_id` dependency — this component is structural and delegates content to child routes.

---

## Permissions & Roles

| Feature | Minimum Role |
|---|---|
| View sidebar navigation | Any authenticated user |
| View Admin section links | `admin`, `super_admin` |
| Toggle Auditor Mode | `admin`, `super_admin`, `auditor` |
| View iAdministrator link | `admin`, `super_admin` |

---

## Error Handling

- If the auth session expires mid-session, the layout's `ProtectedRoute` guard redirects to `/login` with `?next=<current-path>`
- If the user's role does not permit a specific admin link, that link is not rendered (no error state shown)
- If `ciModeStore` cannot read from localStorage (private browsing mode), the default theme is applied without persisting

---

## Audit & Compliance Impact

| Event | Logged |
|---|---|
| Auditor Mode toggle ON | Yes — logged to `enforcementStore` with actor, timestamp |
| Auditor Mode toggle OFF | Yes — logged to `enforcementStore` with actor, timestamp |
| Theme toggle | No — cosmetic preference, not compliance-relevant |
| Navigation clicks | No — only page-level audit events are logged |

---

## Dependencies

- `ciModeStore` — theme persistence
- `auditorModeStore` — read-only lock
- `notificationStore` — notification badge
- `selectedTaskStore` — task drawer state
- `navStore` — back/forward navigation stack
- `GlobalTaskDrawer` — task management overlay
- `TravelightBG` — animated background used in CI-ION dark mode

---

## Known Issues / Gaps

- **GAP:** No session timeout warning banner — users are silently redirected to login when the token expires.
- **GAP:** Notification bell does not auto-refresh; notifications only update on page load or manual navigation.
