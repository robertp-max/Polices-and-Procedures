# Component: WorkflowDetailView

**File:** `src/policy/workflows/components/WorkflowDetailView.tsx`  
**Type:** Feature Component (Workflow Documentation Viewer)  
**Used On:** Workflow Library (`/workflows/:workflowId`)

---

## Overview

`WorkflowDetailView` renders the full compiled definition of a single compliance workflow. It displays all 13 standard sections of a workflow specification, including the trigger, steps, forms, regulatory anchors, evidence requirements, and approval bodies.

---

## UI Breakdown

| Region | Description |
|---|---|
| Workflow Header | Workflow ID, name, domain code, risk band, cadence kind |
| Section Tabs | 13 numbered sections navigable via tab strip |
| Section Body | Full rendered content of the selected section |
| Linked Policies | List of `policy_id` values linked to this workflow |
| Linked Forms | List of `form_id` values required to complete this workflow |
| Regulatory Anchors | List of regulatory standards (CoPs, HIPAA, state regulations) this workflow satisfies |
| Evidence Requirements | What evidence must be generated upon completion |
| Approval Bodies | Who must approve completion |

---

## The 13 Workflow Sections

1. **Purpose & Scope** — Why this workflow exists and who it applies to
2. **Trigger Conditions** — What initiates this workflow (time-based, event-based, conditional)
3. **Prerequisites** — What must be true before the workflow can begin
4. **Role Assignments** — Who is responsible for each step
5. **Step-by-Step Procedure** — Ordered list of required steps
6. **Forms Required** — Forms that must be completed as part of this workflow
7. **Evidence Requirements** — What documents must be generated and uploaded
8. **Regulatory Anchors** — CoP citations and regulatory references
9. **Approval Authority** — Who must approve completion
10. **Timeline & SLA** — Expected duration and deadline rules
11. **Exception Handling** — What to do when standard steps cannot be followed
12. **Quality Indicators** — Metrics used to measure workflow effectiveness
13. **Revision History** — Change log for this workflow definition

---

## User Actions

- Navigate between the 13 sections using tabs
- View linked policies (click to open in Policy Library)
- View required forms (click to open in Forms catalog)
- Print the full workflow specification

---

## System Behavior

- Workflow definitions are compiled at build time from source files in `src/policy/workflows/`
- The `CompiledWorkflow` type provides all 13 sections
- No runtime mutations — workflow definitions are read-only

---

## Data Flow

| Data Element | ID Type | Source |
|---|---|---|
| Workflow definition | `workflow_id` | Compiled workflow registry |
| Linked policies | `policy_id[]` | Workflow definition |
| Linked forms | `form_id[]` | Workflow definition |

---

## Permissions & Roles

| Action | Required Role |
|---|---|
| View workflow definitions | Any authenticated user |
| View regulatory anchors | Any authenticated user |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `workflow_id` not found | "Workflow not found" empty state shown |
| Section content missing | "Section not yet documented" placeholder shown — flagged as GAP |

---

## Audit & Compliance Impact

Workflow detail views are informational — viewing does not generate audit events. Audit events are generated when a workflow is **executed** (via `EventWorkspace`).

---

## Dependencies

- Compiled workflow registry (`src/policy/workflows/`)
- `WorkflowCard` — compact card used in the library grid
- `PolicyLinkSelector` — for linking policies to workflows (admin only)

---

## Known Issues / Gaps

- **GAP:** Workflow definitions are compiled at build time. Runtime updates to workflows (e.g., adding a new step) require a redeployment.
- **GAP:** Section 11 (Exception Handling) is not fully authored for all workflows — some workflows show a placeholder.
