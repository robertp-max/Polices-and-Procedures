# Workflow and Events System

## 1) Workflow Library System

## Source and compilation

- Source content: `Builder/Policies/Workflows/*-WORKFLOWS.md`
- Compiler: `scripts/compileWorkflows.ts`
- Generated outputs:
  - `src/policy/data/workflows.generated.ts`
  - `src/policy/data/workflowGraph.generated.ts`
  - `src/policy/data/workflowTemplates.generated.ts`
  - `src/policy/data/formTitles.generated.ts`

## Runtime components

- `src/policy/workflows/WorkflowLibraryApp.tsx`
- `src/policy/workflows/components/LandingView.tsx`
- `src/policy/workflows/components/WorkflowDetailView.tsx`
- `src/policy/workflows/components/LinkedWorkflows.tsx`
- `src/policy/workflows/components/WorkflowCard.tsx`
- `src/policy/workflows/components/BrandRail.tsx`

## Workflow model highlights

- 13 authored sections preserved per workflow (`Workflow` type contract).
- Step order preserved.
- Explicit required forms and policy references.
- Graph indices provide reverse lookup by:
  - form
  - policy
  - role
  - regulation
  - domain

---

## 2) Mandated Events System

## Event model

- Core type: `RegulatoryEvent` (`src/policy/data/regulatoryEvents.ts`)
- Event families include governance, QAPI, clinical, compliance, risk, IT/security, etc.
- Includes:
  - `policyRefs`
  - `requiredForms`
  - `processFlow`
  - optional approvals, compliance flags, follow-ups, dependencies
  - `mandateType` (`federal-required`, `conditional-federal`, `policy-driven`, `state-required`)

## Event execution

- Store: `src/policy/stores/regulatoryExecutionStore.ts`
- Tracks:
  - step statuses
  - form completion/review status
  - minutes status
  - evidence documents
  - approvals
  - notes
  - completion/certification records
- Persistence: localStorage (`reg-execution-v2`)

---

## 3) Triggers

Workflow/event triggers are represented by:

- workflow cadence and trigger metadata (`WorkflowTrigger`, `WorkflowCadence`)
- autogen system:
  - `src/policy/autogen/templateRegistry.ts`
  - `src/policy/autogen/annualGenerator.ts`
  - `src/policy/autogen/triggerEngine.ts`
  - `src/policy/autogen/scheduler.ts`
  - `src/policy/autogen/dependencyResolver.ts`
  - `src/policy/autogen/conflictResolver.ts`

Trigger types in model:
- time-based
- event-based
- conditional
- continuous

---

## 4) Outputs

Operational outputs include:

- completed event state and certification snapshots
- generated/attached evidence docs
- approval decisions and audit notes
- survey packet and audit report artifacts via audit modules:
  - `src/policy/audit/surveyPacket.ts`
  - `src/policy/audit/exportReport.ts`
  - `src/policy/audit/auditAggregate.ts`
  - `src/policy/audit/riskScoring.ts`
  - `src/policy/audit/dependencyCheck.ts`
  - `src/policy/audit/workflowInstance.ts`
  - `src/policy/audit/auditState.ts`

---

## 5) Required Forms and Policy Dependencies

## Required forms

- Workflow level: `Workflow.requiredForms` and per-step `WorkflowStep.formIds`.
- Event level: `RegulatoryEvent.requiredForms[].formId`.
- Form metadata:
  - `FORMS_DATASET` for broad linking
  - `formsCatalog` for richer operational references.

## Policy dependencies

- Workflow policy references: `Workflow.policyRefs`.
- Event policy references: `RegulatoryEvent.policyRefs`.
- Master control references: `MasterControlItem.sourcePolicyIds`.

---

## 6) QAPI and Compliance Integration

- QAPI domain represented in event model (`domain: 'QAPI'`) and workflow data.
- Compliance engine modules:
  - `src/policy/compliance/complianceEngine.ts`
  - `src/policy/compliance/evaluateEvent.ts`
  - `src/policy/compliance/useComplianceMap.ts`
- Enforcement modules:
  - `src/policy/enforcement/enforcementEngine.ts`
  - `src/policy/enforcement/useEnforcement.ts`
  - `src/policy/enforcement/escalationEngine.ts`
  - `src/policy/enforcement/roleHierarchy.ts`

Integration pattern:
- event execution + enforcement + compliance status produce audit readiness posture.

---

## 7) Known Constraints and Limitations

1. Execution state is primarily local persisted state (single-client perspective).
2. Some generated artifacts (e.g., `workflowTemplates.generated.ts`) appear underutilized in active UI flow.
3. Build script/data drift can cause mismatch between workflow/form coverage and UI expectations.

---

## 8) Needs Confirmation

1. Whether workflow template projections are intended for near-term runtime integration.
2. Whether regulatory event dependencies are fully enforced across all event operations.
3. Whether execution state must be centralized for multi-operator concurrency.

