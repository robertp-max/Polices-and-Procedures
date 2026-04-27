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

## 7) Right-Panel View Toggle — Workflow ↔ Calendar Event

### Overview

The right-side event panel in `MasterCalendarPage` supports two view modes, selectable via a compact pill toggle that lives in the `STEP | SLA | RISK` projection row of the panel header.

```
[ STEP ]   [ SLA ]   [ RISK ]        [ WF | EVT ]
```

### Toggle behavior

| Mode | Label | Default | Description |
|------|-------|---------|-------------|
| `workflow` | `WF` | ✅ Yes | Full workflow execution panel — tabs (Workflow, Event Record, Audit View), step checklist, form completion, certify gate. Unchanged. |
| `event` | `EVT` | No | Google Calendar-style event preview (light mode, read-only summary). |

- The toggle is a **view-mode switch only** — it does NOT navigate, does NOT reload, and does NOT modify execution state.
- State is local (`useState`) scoped to the `ActivePanel` component. Switching events resets to `workflow`.
- Both views draw from the **same `RegulatoryEvent` object** and `regulatoryExecutionStore`. No duplicate state.

### Component location

- Component: `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- Toggle: `ViewToggle` (private function in the same file)
- Event view: `CalendarEventView` (private function in the same file)
- Helper sub-components: `CalEvtMetaRow`, `CalEvtSectionHeading`

### Calendar Event View — content structure

The Event view renders a light-mode, Google Calendar-style summary with the following sections:

| Section | Data Source |
|---------|-------------|
| Google Calendar sync notice | Static label |
| Status chips (urgency, SLA, mandate type) | `store.effectiveUrgency()`, `computeSla()`, `event.mandateType` |
| Domain + policy refs | `DOMAIN_PALETTE[event.domain]`, `event.policyRefs` |
| Event title + owner | `event.title`, `event.owner`, `event.ownerRole`, `event.id` |
| Date / Recurrence / Location | `event.date`, `event.cadence`, `event.location` |
| Regulatory driver | `event.regulatoryDriver` |
| Event Summary | `event.summary` |
| Current Step | First incomplete step from `event.processFlow` via `store.effectiveStepStatus()` |
| Workflow Progress | `store.validateEvent()` — `stepsComplete / stepsTotal`, `formsComplete / formsTotal` |
| What To Do | `currentStep.instructions` (newline-delimited, rendered as numbered list) |
| Required Form | `currentStep.requiredFormIds[]` mapped to `event.requiredForms` labels |
| Expected Output | `currentStep.expectedOutput` |
| On Complete | `currentStep.onCompleteText` |

### View Workflow CTA (footer — Event mode)

When in `event` mode, the panel footer replaces the Certify action bar with:

- Left: `"Calendar preview · syncs to Google Calendar"` (muted label)
- Right: **`View Workflow →`** button (teal, enterprise pill style)
  - Clicking sets `viewMode` back to `'workflow'`
  - Does NOT navigate, does NOT open a new route

### Google Calendar sync mapping (future)

The Calendar Event View is intentionally structured to map to a future Google Calendar event description + deep link:

| Calendar Event Field | Source |
|---------------------|--------|
| Event title | `event.title` |
| Event description (HTML) | Rendered from `event.summary`, current step, what-to-do list, required form, expected output, on-complete, deep link |
| Date / Time | `event.date` + `event.time` / `event.timeEnd` |
| Recurrence | `event.cadence` mapped to RRULE |
| Location | `event.location` |
| Status / urgency | Computed from `regulatoryExecutionStore` |

**No live Google Calendar API sync is implemented in this pass.** The Calendar Event View is a preview only; sync will be added as a future integration milestone. Implementation target: EventBridge → Lambda calendar-sync handler → Google Calendar API (see Section 10, AWS Phase 1).

---

## 8) Known Constraints and Limitations  <!-- was §7 -->

1. Execution state is primarily local persisted state (single-client perspective).
2. Some generated artifacts (e.g., `workflowTemplates.generated.ts`) appear underutilized in active UI flow.
3. Build script/data drift can cause mismatch between workflow/form coverage and UI expectations.

---

## 8) Needs Confirmation

1. Whether workflow template projections are intended for near-term runtime integration.
2. Whether regulatory event dependencies are fully enforced across all event operations.
3. Whether execution state must be centralized for multi-operator concurrency.

---

## 9) Onboarding and Competency Workflow Layer (Existing)

The onboarding workflow layer is implemented in `src/policy/journey/*` and operates as a parallel, role-driven competency system.

### Implemented now

- Main onboarding menu and phase progression in `JourneyHomePage`.
- Appendix F hard-stop enforcement in `AppendixFPage` before onboarding progression.
- Learner module execution in `ModulePlayerPage` (SCORM and non-SCORM methods).
- Supervisor/DON operational controls in `SupervisorPage`:
  - supervised visit logging
  - final independent-practice clearance signature
- Admin/HR oversight in `AdminPage`:
  - escalation queue
  - cross-employee onboarding status
- User operations documentation in `UserGuidePage`.

### Annual training and drills coverage

- `src/policy/journey/data/modules.ts` contains annual (`phase: 'ANN'`) and drill (`phase: 'DRILL'`) modules.
- Includes quarter-tagged requirements via `annualQuarter` fields (Q1..Q4 patterns), including emergency preparedness drills.
- Policy references for annual/drill modules are explicit via `policyRefs`.

### Integration with compliance posture

- Onboarding progression, supervised visits, and sign-off state are currently maintained in the journey store and are not yet integrated into the server-side calendar/event sync pipeline.
- Operationally, onboarding evidence is compliance-relevant, but current persistence remains client-local.

### True current gaps

- No centralized onboarding workflow state service for multi-user operations.
- No immutable backend evidence store binding for onboarding artifacts.
- No unified audit-event stream combining onboarding, workflow execution, and calendar synchronization.

### Backend/AWS Phase 1 impacts

- Requires identity-bound role assignment and signer attribution.
- Requires durable persistence for progression, supervised visits, and clearances.
- Requires evidence storage + presigned access + metadata index linking onboarding artifacts to policy/workflow/event context.

---

## 10) AWS Phase 1 — Workflow and Event System Mapping

| Workflow/Event Component | Current State | AWS Phase 1 Target | Status |
|---|---|---|---|
| Compiled workflow library (`workflows.generated.ts`) | Static TS file; re-generated by `scripts/compileWorkflows.ts` at dev time | Workflow metadata items in DynamoDB; workflow step definitions read by Lambda `workflow-runner` | NOT STARTED |
| Workflow execution state (`regulatoryExecutionStore`) | Zustand localStorage per event ID | Lambda writes execution state items per `{event_id, user_id}`; frontend reads via `metadata-api` Lambda | NOT STARTED |
| Mandated event trigger | Manual dev-time script or static data | EventBridge Scheduler → Lambda `mandated-event-generator` → DynamoDB event items | NOT STARTED |
| Calendar sync / event push | Express route + Google Calendar API + JSONL audit | Lambda handler; audit stream to S3 `prod/audit/` prefix | NOT STARTED |
| QAPI workflow | Client-side form + store; completion stored in execution store | QAPI completion items in DynamoDB + evidence object in S3 | NOT STARTED |
| Governing Body workflow | Client-side form + store | Same DynamoDB + S3 pattern as QAPI | NOT STARTED |
| Onboarding competency progression | Zustand journey store (localStorage) | DynamoDB `ONBOARDING#` progression items; supervised visit log as sub-items | NOT STARTED |
| Escalation workflow | Client-side state in journey store | DynamoDB escalation items; CloudWatch alarm optional | NOT STARTED |
| Audit certification workflow | Client-side audit state classification + browser export | DynamoDB `AUDIT#` items; Lambda `export-zip` → S3 → presigned GET | NOT STARTED |
| Brad IA RAG workflow | Local Ollama + file-based index | S3 index bucket + Lambda or managed LLM endpoint; deferred to Phase 1b | NOT STARTED |
