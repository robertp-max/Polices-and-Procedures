# Component: SharedPolicyDetailView

**File:** `src/policy/components/SharedPolicyDetailView.tsx`  
**Type:** Feature Component (Policy Rendering)  
**Used On:** PolicyDetailPage (`/library/:policyId`), PolicyDetailModal, PolicyLifecyclePage

---

## Overview

`SharedPolicyDetailView` renders the full content of a single policy document, including its metadata header, section body (Markdown or HTML), appendices panel, version indicator, and lifecycle status badge. It is the canonical display surface for any policy in the system.

---

## UI Breakdown

| Region | Description |
|---|---|
| Policy Header | Policy ID, title, domain/subdomain, version, effective date, lifecycle status badge |
| Access Tier Badge | Tier 1 (Public) through Tier 4 (Privileged) — color-coded |
| Policy Body | Full rendered policy content (Markdown/HTML) with section headings |
| Appendices Panel | Collapsible side panel listing attached appendices with navigation |
| Version Selector | Dropdown to view prior versions (read-only) |
| Draft Banner | Yellow sticky banner shown when policy status is `Draft` |
| Action Bar | "Print", "Download PDF", "View Lifecycle" buttons |

---

## User Actions

- Scroll through the full policy text
- Navigate to a specific section using the appendices panel
- Switch to a prior version using the version selector
- Click "Print" to open the print-formatted view
- Click "View Lifecycle" to navigate to the policy lifecycle workspace

---

## System Behavior

1. Policy data is loaded from `policyStore` by `policy_id`
2. If the policy is in `Draft` state, `DraftBanner` is displayed
3. If viewing a prior version, a read-only indicator is shown and action buttons are disabled
4. Appendices are rendered from the policy's `appendices` array

---

## Data Flow

| Data Element | ID Type | Source |
|---|---|---|
| Policy record | `policy_id` | `policyStore` |
| Policy versions | `policy_id` | `policyStore.versions[]` |
| Domain/subdomain | `domain_code` | `frameworkStore` |

---

## Permissions & Roles

| Action | Required Role |
|---|---|
| View published policies | Any authenticated user |
| View draft policies | `manager`, `admin`, `super_admin` |
| View privileged (Tier 4) policies | `super_admin` only |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `policy_id` not found in store | "Policy not found" empty state shown |
| Content failed to render (malformed Markdown) | Raw text fallback displayed with warning |

---

## Audit & Compliance Impact

| Event | Logged |
|---|---|
| Policy viewed (Tier 3/4) | Yes — `POLICY_VIEW` with `policy_id`, user, timestamp |
| Policy viewed (Tier 1/2) | No — public access not individually logged |

---

## Dependencies

- `policyStore` — policy data
- `frameworkStore` — domain metadata
- `DraftBanner` — draft state indicator
- `PolicyAppendicesPanel` — appendices navigation
- `StatusBadge` — lifecycle status display

---

## Known Issues / Gaps

- **GAP:** Prior version content is stored in `policyStore` in memory only — it is not persisted to the server. Clearing browser storage can cause prior versions to be unavailable.
