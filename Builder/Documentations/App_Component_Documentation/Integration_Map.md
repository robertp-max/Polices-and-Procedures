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

---

## 11) Onboarding Integration Map (Implemented)

```text
[journey/data/modules + employees + appendices]
                |
                v
       [journeyStore (local persisted)]
                |
   +------------+-------------+------------------+------------------+
   v                          v                  v                  v
[JourneyHomePage]      [ModulePlayerPage] [SupervisorPage]    [AdminPage]
   |                          |                  |                  |
   |                          v                  v                  v
   |                   [ScormPlayer +      [SupervisedVisit   [Escalation
   |                    EvidenceCapture]    logging + DON       queue + KPI]
   |                          |             sign-off]
   +-------------> [AppendixFPage hard-stop] <-----------------------+
```

Key implemented links:
- Role-based module assignment and prerequisite gates (`modules.ts`, `gating.ts`)
- Policy references shown in onboarding modules (`policyRefs` surfaced in module flows)
- Evidence/signature capture in journey store (`JourneyEvidence`, `SignatureRecord`)
- Escalation lifecycle for unmet gates (`JourneyEscalation`)

---

## 12) AWS Phase 1 Target Integration Map (Gap-to-Target)

```text
[Cognito identity / role claims]
             |
             v
      [/api/onboarding/*]   (not implemented yet)
             |
   +---------+-------------------+-------------------+
   v                             v                   v
[DynamoDB onboarding state] [Object store evidence] [Append-only audit stream]
   |                             |                   |
   +-------------+---------------+-------------------+
                 v
      [Journey UI + Supervisor/Admin pages]
```

Current state vs target:
- **Current:** onboarding data, evidence metadata, and sign-offs are browser-local.
- **Target (Phase 1):** identity-bound API, durable metadata, immutable evidence storage, and centralized audit records.

Needs confirmation:
1. Canonical storage stack for Phase 1 between AWS S3/DynamoDB plan and R2/SQL architecture plan.
2. Final object/index schema for onboarding-specific entities (user profile, progression, sign-offs, visits).

---

## 13) AWS Phase 1 — Full Target Integration Map

```
[React SPA]
  |
  ├── API Gateway (HTTP API) ─── Cognito JWT Authorizer ─── [Lambda: metadata-api]
  |       |                                                        |
  |       |                                                   DynamoDB (single-table)
  |       |                                                   PK: entity type prefix
  |       |                                                   SK: sort key / GSI1
  |       |
  |       ├── [Lambda: workflow-runner]  ← writes execution state items
  |       |
  |       ├── [Lambda: upload-init]      ← returns presigned PUT URL
  |       |      └─► S3 hh-sbx-uploads  ← frontend PUTs evidence blob
  |       |              └─► [Lambda: upload-validate-promote]
  |       |                        └─► S3 hh-prd-evidence (prod bucket)
  |       |
  |       └── [Lambda: export-zip]       ← generates export archive
  |              └─► S3 hh-prd-exports  ← returns presigned GET URL
  |
  ├── Cognito User Pool ─── groups map to app roles (admin, supervisor, clinician, HR)
  |
  ├── EventBridge Scheduler ─── [Lambda: mandated-event-generator]
  |       └─► DynamoDB (EVENT# items seeded automatically)
  |
  └── [Server: Brad IA - deferred]
        └─► S3 ia-index bucket  (future Phase 1b)
```

### Current vs Phase 1 integration summary

| Integration Link | Current | Phase 1 Target | Status |
|---|---|---|---|
| Frontend → backend data | Static TS bundles + localStorage Zustand | API Gateway + Lambda + DynamoDB | NOT STARTED |
| Evidence blob storage | Not implemented | S3 via presigned upload/download path | NOT STARTED |
| User identity | No identity (anonymous) | Cognito User Pool + JWT | NOT STARTED |
| Role enforcement | Client-side only (`gating.ts`) | Cognito group + Lambda-enforced | NOT STARTED |
| Audit trail | Filesystem JSONL / localStorage | DynamoDB append-only `AUDIT#` items | NOT STARTED |
| Event scheduling | Static data at build time | EventBridge Scheduler + Lambda | NOT STARTED |
| Navigation state | Client-only Zustand | Remains client-only; no Phase 1 change | N/A |
