# Component: MasterControlInventory

**File:** `src/policy/components/MasterControlInventory.tsx`  
**Type:** Feature Component (Compliance Table)  
**Used On:** Master Control Inventory Page (`/compliance/master-controls`)

---

## Overview

`MasterControlInventory` renders a filterable, sortable table of all compliance controls mapped to their corresponding policies. It provides a single-view audit readiness reference showing which controls are covered, which are gaps, and the policy responsible for each.

---

## UI Breakdown

| Region | Description |
|---|---|
| Filter Bar | Domain filter, status filter (covered/gap/partial), search input |
| Control Table | Rows: Control ID, Control Name, Domain, Linked Policy, Coverage Status |
| Coverage Status Badge | `covered` (green), `partial` (yellow), `gap` (red) |
| Policy Link | Clickable policy ID that opens the policy detail view |
| Export Button | Download table as CSV |

---

## User Actions

- Filter controls by domain (GV, CL, QA, HR, CO, FN, OP, EN, IT, RM)
- Filter by coverage status to find gaps quickly
- Search for a specific control by name or ID
- Click a policy link to view the full policy
- Export the table to CSV for audit preparation

---

## System Behavior

- Control data is loaded from the compiled framework seed (`frameworkSeedAdapter`)
- Coverage status is computed at render time by checking which controls have a linked `policy_id` in `policyStore`
- Export generates a CSV with all visible rows

---

## Data Flow

| Data Element | ID Type | Source |
|---|---|---|
| Control definitions | `control_id` | Framework seed |
| Linked policies | `policy_id` | `policyStore` |
| Domain classification | `domain_code` | `frameworkStore` |

---

## Permissions & Roles

| Action | Required Role |
|---|---|
| View control inventory | `admin`, `super_admin`, `auditor`, `compliance_officer` |
| Export CSV | `admin`, `super_admin` |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Framework seed not loaded | Empty table with "Loading controls..." spinner |
| No policies linked to any control | All rows show "gap" status — this is valid (not an error) |

---

## Audit & Compliance Impact

| Event | Logged |
|---|---|
| CSV export | Yes — `CONTROL_EXPORT` with actor, timestamp, filter state |
| View | No |

---

## Dependencies

- `frameworkStore` — control definitions
- `policyStore` — policy-to-control linkage
- `StatusBadge` — coverage status badges

---

## Known Issues / Gaps

- **GAP:** Control-to-policy linkage is defined in the framework seed at build time. New policies added at runtime are not automatically linked to controls — a rebuild is required.
- **GAP:** "Partial" coverage status is manually tagged — there is no automated partial-coverage detection logic.
