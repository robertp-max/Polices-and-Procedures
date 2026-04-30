# Page: Policy Library

**Route:** `/library`  
**File:** `src/policy/pages/LibraryPage.tsx`  
**Access:** All authenticated users

---

## Page Purpose

The Policy Library is the central repository for all agency policies and procedures. It allows users to browse, search, and read all active (and historical) policy documents organized by domain and subdomain.

---

## UI Layout

| Region | Description |
|---|---|
| Search Bar | Full-text search across policy titles, IDs, and content |
| Domain Filter | Filter by domain code (GV, CL, QA, HR, CO, FN, OP, EN, IT, RM) |
| Status Filter | Filter by lifecycle status (Published, Draft, Under Review, Archived) |
| Policy Grid/List | Cards or rows showing each policy with title, ID, domain, version, and status |
| Policy Detail Panel | Side panel or modal showing full policy content when a policy is selected |

---

## Key Actions

- Search for policies by name, code, or keyword
- Filter by domain or status
- Click a policy card to read its full content
- Click "View Lifecycle" to see the policy's full lifecycle history
- Print or download a policy

---

## Linked Workflows

The Policy Library is read-only for most users. Policies link to workflows via the `workflow_id` in the policy record. Clicking a workflow link navigates to the Workflow Library.

---

## Data Used

| Data | Source |
|---|---|
| Policy list | `policyStore` |
| Domain/subdomain labels | `frameworkStore` |
| Filter/sort state | `uiStore` |

---

## Permissions

| Action | Required Role |
|---|---|
| View published policies | All authenticated users |
| View draft policies | `manager`, `admin`, `super_admin` |
| View archived policies | `admin`, `super_admin`, `auditor` |
| View Tier 4 privileged policies | `super_admin` only |
| Download/print | All authenticated users (published only) |

---

## Audit Impact

- Viewing Tier 3/4 policies logs a `POLICY_VIEW` event with user, `policy_id`, and timestamp
- Downloading a policy logs a `POLICY_DOWNLOAD` event
