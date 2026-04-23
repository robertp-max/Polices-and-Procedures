# Integration Map

## 1) High-Level System Map

```text
[Builder/Forns/*.txt] --forms build--> [FORMS_DATASET + form content modules]
                                      |-> FormsPage/FormViewer/FormPrintView
                                      |-> verifyPolicyCoverage.ts

[Builder/Policies/Workflows/*.md] --compile--> [workflows.generated + graph + templates]
                                              |-> WorkflowLibraryApp
                                              |-> Brad workflow knowledge modules

[frameworkSeed.generated] --adapter--> [frameworkStore + policyStore]
                                      |-> LibraryPage/PolicyDetailPage/GovernancePage

[regulatoryEvents + mandatedEventsExpanded + autogen/*]
             |-> DashboardPage / MasterCalendarPage / AuditModePage
             |-> regulatoryExecutionStore + enforcement + compliance

[Master Control JSON] --> masterControlInventory loader --> MasterControlInventoryPage

[IA index (.cache/ia-index)] <-> server/ia/* <-> /api/ia <-> iAdministrator UI
```

---

## 2) Policies ↔ Forms

## Link mechanism

- Primary map: `FormRecord.policies: string[]` in `FORMS_DATASET`.
- Coverage check script: `scripts/verifyPolicyCoverage.ts`.

## Runtime consumers

- `FormsPage`, `FormViewer`, `FormPrintView`.
- Workflow and event models reference same form IDs for cross-surface consistency.

---

## 3) Workflows ↔ Forms

## Link mechanism

- `WorkflowStep.formIds[]` and `Workflow.requiredForms[]`.
- Graph reverse index: `WORKFLOW_GRAPH.byForm`.

## Runtime consumers

- `WorkflowDetailView` (step + required form references).
- Brad deterministic workflow modules (`workflowKnowledge.ts`) use `formTitle(...)`.

---

## 4) Workflows ↔ Policies

## Link mechanism

- `Workflow.policyRefs[]`
- Graph reverse index: `WORKFLOW_GRAPH.byPolicy`

## Runtime consumers

- Workflow detail panels and linked workflow navigation.
- Brad workflow question answering path.

---

## 5) Brad ↔ Policies

## IA retrieval path

- Backend retrieval returns chunks with `docId` (policy/form/appendix IDs).
- Responder materializes citations and linked references anchored to retrieved docs.

## UI mapping

- iAdministrator response surfaces:
  - citations
  - linked references
  - available actions (`open_policy`, `open_form`, etc.)

---

## 6) Brad ↔ Workflows

## Active backend path

- Server IA can retrieve workflow-like corpus chunks if indexed from source docs.

## Deterministic frontend path

- `src/policy/brad/workflowKnowledge.ts` maps workflow queries against generated workflow data.
- `Needs confirmation`: this path appears not directly wired into current iAdministrator request flow.

---

## 7) Control Inventory ↔ Policies

## Link mechanism

- `MasterControlItem.sourcePolicyIds[]`
- Loaded from `MASTER_CONTROL_INVENTORY_DATA_MODEL.json`

## Runtime consumers

- `MasterControlInventory` component for traceability and audit context.

---

## 8) Workflow/Event/Compliance Integration Diagram

```text
[workflows.generated] --> [Workflow UI]
        |                        |
        v                        v
[workflow graph]           [event execution UX]
        |                        |
        v                        v
[autogen templates/trigger engine] --> [regulatory events instances]
                                            |
                                            v
                                [regulatoryExecutionStore]
                                            |
                    +-----------------------+----------------------+
                    v                                              v
           [enforcementEngine]                              [complianceEngine]
                    |                                              |
                    +-----------------------+----------------------+
                                            v
                                     [AuditModePage]
```

---

## 9) Backend API Integration Map

```text
iAdministrator UI
  -> /api/ia/query (SSE)
  -> /api/ia/chat (SSE)
  -> /api/ia/references/:id
  -> /api/ia/operational/*
  -> /api/ia/regulatory/*

Calendar pages / sync ops
  -> /api/calendar/*

Hubstaff staging page
  -> /api/hubstaff/*
```

---

## 10) Needs Confirmation

1. Canonical source-of-truth when duplicate documentation/report files exist in `documentation/` and `Builder/Documentations/`.
2. Whether deterministic Brad workflow modules should become first-class in iAdministrator path.

