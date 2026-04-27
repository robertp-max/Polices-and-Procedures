# 12 — Audit Workflow Catalog & Event Template Engine

> **Status:** Authoritative — supersedes any earlier definition that treated audits as standalone scheduled items.
> **Audience:** Engineers, compliance architects.
> **Related:** `03-Sprint-Execution-Model.md`, `04-Workflow-and-Execution-Units.md`, `06-Calendar-Integration.md`, `08-Audit-and-Evidence-Model.md`.

---

## 1. Architectural Correction (Why This Document Exists)

Earlier drafts of the program treated each compliance audit (e.g., "Plan of
Care Audit") as a standalone calendar event. That model is **rejected**
because it violates two CES invariants:

| Invariant | Violation in earlier model |
|---|---|
| **Audit is a phase, not a unit of scheduling.** Every workflow ends with `audit` as its 5th phase. | Treating "Plan of Care Audit" as a scheduled event creates a parallel concept of "audit" outside the phase model. |
| **Calendar primacy.** Only `RegulatoryEvent` objects in `MANDATED_EVENTS_EXPANDED` enter sprints. | Standalone audit items bypass the calendar loader and break dependency resolution. |

The corrected model:

```
Audit Workflow (CL-WF-*, CO-WF-*, HR-WF-*, RM-WF-*)
   ↑ defined once
Event Template (TPL-*)
   ↓ expanded by cadence engine
RegulatoryEvent → MANDATED_EVENTS_EXPANDED
   ↓ sprint loader
Execution Units (Preparation → Documentation → Review → Signature → Audit)
```

A "compliance audit" in CES is a **workflow with an audit purpose**, not a
new entity type.

---

## 2. The 32 Audit Workflows (Canonical Catalog)

### 2.1 Clinical (18 — monthly)

| Workflow ID | Name | Default `dayOfMonth` | Audit Risk |
|---|---|---|---|
| `CL-WF-POC-AUDIT-001` | Plan of Care Audit | 6 | high |
| `CL-WF-OASIS-AUDIT-001` | OASIS Accuracy Audit | 7 | high |
| `CL-WF-VISIT-DOC-AUDIT-001` | Visit Documentation Audit | 5 | high |
| `CL-WF-RECORD-COMPLETE-AUDIT-001` | Clinical Record Completeness Audit | 10 | medium |
| `CL-WF-MEDICAL-NECESSITY-AUDIT-001` | Medical Necessity Audit | 12 | high |
| `CL-WF-MEDICATION-AUDIT-001` | Medication Management Audit | 13 | high |
| `CL-WF-INFECTION-AUDIT-001` | Infection Control Compliance Audit | 14 | high |
| `CL-WF-CARE-COORD-AUDIT-001` | Care Coordination Audit | 15 | medium |
| `CL-WF-REHOSPITALIZATION-AUDIT-001` | Rehospitalization Review | 16 | medium |
| `CL-WF-HOMEBOUND-AUDIT-001` | Homebound Status Audit | 17 | high |
| `CL-WF-ORDERS-AUDIT-001` | Orders & Physician Signature Audit | 18 | high |
| `CL-WF-RECERT-AUDIT-001` | Recertification Audit | 19 | high |
| `CL-WF-DISCHARGE-AUDIT-001` | Discharge Documentation Audit | 20 | medium |
| `CL-WF-SUPERVISORY-AUDIT-001` | Supervisory Visit Audit | 21 | high |
| `CL-WF-MISSED-VISIT-AUDIT-001` | Missed Visit Audit | 22 | medium |
| `CL-WF-TIMELINESS-AUDIT-001` | Documentation Timeliness Audit | 23 | medium |
| `CL-WF-PATIENT-ED-AUDIT-001` | Patient Education Documentation Audit | 24 | medium |
| `CL-WF-PAIN-AUDIT-001` | Pain Assessment & Reassessment Audit | 25 | medium |

### 2.2 Compliance (7)

| Workflow ID | Name | Cadence | Audit Risk |
|---|---|---|---|
| `CO-WF-HIPAA-AUDIT-001` | HIPAA Compliance Audit | quarterly | critical |
| `CO-WF-PATIENT-RIGHTS-AUDIT-001` | Patient Rights Compliance Audit | quarterly | high |
| `CO-WF-INCIDENT-AUDIT-001` | Incident Response Audit | monthly | critical |
| `CO-WF-BREACH-AUDIT-001` | Breach Notification Compliance Audit | quarterly | critical |
| `CO-WF-FWA-AUDIT-001` | Fraud, Waste & Abuse Audit | quarterly | critical |
| `CO-WF-VENDOR-AUDIT-001` | Vendor / Business Associate Compliance Audit | quarterly | high |
| `CO-WF-POLICY-AUDIT-001` | Policy & Procedure Adherence Audit | annual | high |

### 2.3 HR (4)

| Workflow ID | Name | Cadence | Audit Risk |
|---|---|---|---|
| `HR-WF-TRAINING-AUDIT-001` | Training Compliance Audit | monthly | high |
| `HR-WF-COMPETENCY-AUDIT-001` | Competency Validation Audit | quarterly | high |
| `HR-WF-LICENSE-AUDIT-001` | License & Certification Verification Audit | monthly | critical |
| `HR-WF-EMP-HEALTH-AUDIT-001` | Employee Health & TB Compliance Audit | monthly | high |

### 2.4 Risk / Safety (3)

| Workflow ID | Name | Cadence | Audit Risk |
|---|---|---|---|
| `RM-WF-OSHA-AUDIT-001` | OSHA / Workplace Safety Audit | quarterly | high |
| `RM-WF-EXPOSURE-AUDIT-001` | Infection Exposure Incident Review | monthly | critical |
| `RM-WF-EMERGENCY-AUDIT-001` | Emergency Preparedness Audit | annual | high |

> **Distribution check:** 18 + 7 + 4 + 3 = **32** audit workflows. This is
> the locked target. Adding a 33rd requires a governance exception and a
> retrospective entry per `08-Monthly-Retrospective.md`.

---

## 3. Workflow Type Taxonomy (Lock)

Every workflow in `workflows.generated.ts` MUST carry exactly one
`workflow_type`:

| Type | Routes to QAPI? | Schedulable? | Description |
|---|---|---|---|
| `audit` | **Yes** | Yes | Evaluates compliance, produces findings, feeds QAPI. Only this type. |
| `operational` | No | Yes | Produces evidence consumed by audits (e.g., Visit Documentation Workflow). |
| `enforcement` | No | **No — event-triggered only** | Activates on failure (e.g., Disciplinary Action, Vendor Termination). |
| `intake` | No | Yes (deadline-driven) | Receives external input (Incident Intake, Vendor Onboarding). |
| `aggregate` | Consumes audits | Yes | Rolls up findings (QAPI Quarterly, Governing Body Review). |

**Hard rule:** Only `audit` type workflows may flag `auditRisk` and feed
the QAPI aggregator. An `operational` workflow that "checks something" is
not an audit.

---

## 4. Event Template Engine

### 4.1 Source File

```
src/policy/data/auditEventTemplates.ts
```

### 4.2 Template Schema

```ts
export interface AuditEventTemplate {
  eventTemplateId: string;          // "TPL-CL-POC-AUDIT"
  name: string;                     // "Plan of Care Audit"
  domain: 'Clinical' | 'Compliance' | 'HR' | 'Risk';
  cadence:
    | { type: 'monthly';   dayOfMonth: number }
    | { type: 'quarterly'; months: number[]; dayOfMonth: number }
    | { type: 'annual';    month: number; dayOfMonth: number };
  workflowIds: string[];            // ["CL-WF-POC-AUDIT-001"]
  requiredForms?: { formId: string; dueOffsetDays: number }[];
  approvals?: {
    targetKind: 'minutes' | 'form' | 'report';
    approverRole: string;
    escalationDays: number;
  }[];
  dependencies?: { dependsOn: string[] };       // template IDs, resolved at expansion
  followUps?: {
    name: string;
    workflowId: string;             // typically QA-WF-CAPA-001
    dueOffsetDays: number;
  }[];
  complianceFlags?: {
    auditRisk: 'critical' | 'high' | 'medium' | 'low';
    citation?: string;
    surveyorNote?: string;
  };
}
```

### 4.3 Expansion Function (Contract)

```ts
// src/policy/data/expandAuditTemplates.ts
export function generateEventsFromTemplates(
  templates: AuditEventTemplate[],
  year: number,
): RegulatoryEvent[];
```

**Expansion rules:**

1. `monthly` → 12 events per year, `date = YYYY-MM-{dayOfMonth}`.
2. `quarterly` → events on `months` array (default `[3,6,9,12]`).
3. `annual` → 1 event on `{month}-{dayOfMonth}`.
4. Generated `event.id` follows the canonical format established in the
   April 2026 ID migration: `{eventSubType}-{YYYYMMDD}-{NN}`.
   Example: `plan_of_care_audit-20260106-01`.
5. `eventSubType` = `eventTemplateId` lowercased, hyphens stripped, `tpl_`
   prefix removed (`tpl-cl-poc-audit` → `plan_of_care_audit`).
6. `dependencies.dependsOn` template IDs are resolved to the matching
   event IDs in the **same sprint window**. If a dependency cannot be
   resolved in-window, the dependent event opens in `blocked` state per
   `05-Enforcement-and-Compliance-Rules.md`.

### 4.4 Wiring into the Calendar

```ts
// src/policy/data/mandatedEventsExpanded.ts
import { AUDIT_EVENT_TEMPLATES } from './auditEventTemplates';
import { generateEventsFromTemplates } from './expandAuditTemplates';

export const MANDATED_EVENTS_EXPANDED: RegulatoryEvent[] = [
  ...HAND_AUTHORED_EVENTS,
  ...generateEventsFromTemplates(AUDIT_EVENT_TEMPLATES, 2026),
];
```

**Do not** add audit events by hand to `MANDATED_EVENTS_EXPANDED`. The
template engine is the only writer.

---

## 5. Execution Unit Decomposition (Per Audit Workflow)

Every audit workflow MUST decompose into the canonical 5-phase pattern.
The reference shape:

| Phase | Execution Unit Title (template) | Default Owner Role |
|---|---|---|
| Preparation | "Pull audit sample for {workflow.name}" | Workflow domain manager |
| Documentation | "Perform audit scoring — {workflow.name}" | Workflow domain manager |
| Review | "Compliance review of audit findings" | Compliance Officer |
| Signature | "Sign audit report" | Workflow domain manager |
| Audit | "File audit report in repository" | Compliance Officer |

The 5 units are generated automatically by the sprint loader; engineers
do not author them per workflow.

---

## 6. Dependency Map (Audit → Operational Upstream)

The full dependency graph is maintained in
`src/policy/data/auditDependencies.ts`. The core relationships:

| Audit Workflow | Required Upstream Operational Workflows |
|---|---|
| `CL-WF-POC-AUDIT-001` | Care Plan Creation, Physician Orders, Visit Documentation |
| `CL-WF-OASIS-AUDIT-001` | OASIS Assessment, OASIS Submission, Clinical Documentation |
| `CL-WF-VISIT-DOC-AUDIT-001` | Visit Documentation, Scheduling |
| `CL-WF-RECORD-COMPLETE-AUDIT-001` | All clinical documentation workflows |
| `CL-WF-MEDICAL-NECESSITY-AUDIT-001` | Plan of Care, Clinical Notes, Diagnosis Documentation |
| `CL-WF-MEDICATION-AUDIT-001` | Medication Reconciliation, Physician Orders, Visit Notes |
| `CL-WF-INFECTION-AUDIT-001` | Infection Control Practice, Visit Documentation |
| `CL-WF-CARE-COORD-AUDIT-001` | Interdisciplinary Communication, Case Notes |
| `CL-WF-REHOSPITALIZATION-AUDIT-001` | Hospitalization Event, Discharge Summary |
| `CO-WF-HIPAA-AUDIT-001` | Access Logs, Training Completion, Incident Logs |
| `CO-WF-PATIENT-RIGHTS-AUDIT-001` | NPP Distribution, Patient Request |
| `CO-WF-INCIDENT-AUDIT-001` | Incident Intake, Risk Assessment |
| `CO-WF-BREACH-AUDIT-001` | Incident Classification, Notification Workflow |
| `CO-WF-FWA-AUDIT-001` | Billing, Documentation |
| `CO-WF-VENDOR-AUDIT-001` | Vendor Onboarding, BAA Tracking |
| `HR-WF-TRAINING-AUDIT-001` | LMS Completion Records |
| `HR-WF-COMPETENCY-AUDIT-001` | Skills Validation, Clinical Supervision |
| `HR-WF-LICENSE-AUDIT-001` | Credential Tracking |
| `HR-WF-EMP-HEALTH-AUDIT-001` | TB Screening, Health Records |
| `RM-WF-OSHA-AUDIT-001` | Safety Incident Logs, Training Records |
| `RM-WF-EMERGENCY-AUDIT-001` | Emergency Plan, Drill Logs |

Enforcement contract: at sprint open, the loader inspects every audit
event's upstream dependencies. If any upstream operational workflow has no
completed evidence in the previous reporting window, the audit event opens
in `blocked` with `BlockedReason.kind = 'dependency_incomplete'` and a
generated remediation task.

---

## 7. Enforcement Wiring (Failure Path)

When an audit completes with **failed findings**, the corrective action is
modeled inside the event, not as detached logic:

```ts
followUps: [
  {
    name: 'Corrective Action Plan',
    workflowId: 'QA-WF-CAPA-001',
    dueOffsetDays: 7,
  },
]
```

The follow-up automatically materializes a new event in the next sprint
with the parent audit event linked via `dependencies.dependsOn`.

For HR-WF-TRAINING-AUDIT failures, the enforcement ladder is built into
the workflow's own step list (warning → supervisor meeting → suspension)
and does not require a follow-up event.

---

## 8. Recurring System (R1–R8) Per Sprint

The sprint loader auto-generates the following 8 recurring execution units
in **every** sprint, independent of the calendar:

| Code | Recurring Unit | Owner Role | Phase |
|---|---|---|---|
| R1 | Weekly compliance review | Compliance Officer | Review |
| R2 | Audit chain verification | Compliance Officer | Audit |
| R3 | Overdue resolution sweep | Compliance Officer | Documentation |
| R4 | Signature follow-up sweep | Compliance Officer | Signature |
| R5 | Risk review | Administrator | Review |
| R6 | Carry-over audit | Compliance Officer | Audit |
| R7 | Evidence index sync | System | Audit |
| R8 | Sprint metrics rollup | System | Audit |

These are **system-generated** — engineers must not add them to event
templates.

---

## 9. Implementation Checklist

> **Architecture realignment (April 2026).** The earlier draft of this
> checklist referenced a parallel template engine
> (`auditEventTemplates.ts` + `expandAuditTemplates.ts` + sidecar
> classification registry). That parallel system has been removed.
> Audits now live as plain `RegulatoryEvent` records flowing through the
> canonical pipeline:
>
> ```
> RegulatoryEvent (source of truth)
>   → MANDATED_EVENTS_EXPANDED → REGULATORY_EVENTS
>   → regulatoryExecutionStore
>   → useComplianceExecution()
>   → selectors / adapters
>   → UI
> ```

- [x] All audits exist as `RegulatoryEvent` records (no template type, no parallel store).
- [x] `src/policy/data/auditRegulatoryEvents.ts` exports `AUDIT_REGULATORY_EVENTS: RegulatoryEvent[]` — the canonical 2026 audit calendar (185 occurrences across 19 audit specs; the remaining audits in §2 land automatically as their workflow markdown is authored).
- [x] `MANDATED_EVENTS_EXPANDED` consumes `AUDIT_REGULATORY_EVENTS` and runs every event through `enforceBusinessDay()` as a defense-in-depth pass.
- [x] Weekend scheduling guard in `regulatoryEvents.ts` (`isWeekend`, `shiftToBusinessDay`, `enforceBusinessDay`) — Sat/Sun blocked unless `event.isWeekendAllowed === true`; events shift FORWARD only.
- [x] `RegulatoryEvent.isWeekendAllowed?: boolean` carried on the canonical interface.
- [x] Standard 5-phase `processFlow` (preparation → documentation → review → signature → audit close) attached to every audit event; the `audit close` phase encodes the `auditIndexCreated` requirement.
- [x] CAPA follow-up (`QA-WF-CAPA-001`) attached to every audit event via `followUps[]`.
- [x] Build passes (`vite ✓` — no TS errors).

### Files in the canonical audit pipeline

| File | Role |
|---|---|
| `src/policy/data/regulatoryEvents.ts` | Defines `RegulatoryEvent`, adds `isWeekendAllowed` + `enforceBusinessDay()` / `shiftToBusinessDay()` / `isWeekend()`. |
| `src/policy/data/auditRegulatoryEvents.ts` | Single source for the audit calendar — exports `RegulatoryEvent[]` only. |
| `src/policy/data/mandatedEventsExpanded.ts` | Spreads `AUDIT_REGULATORY_EVENTS` into `MANDATED_EVENTS_EXPANDED` and runs the array through `enforceBusinessDay()`. |
| `src/policy/compliance-execution/*` | Sole owner of `ExecutionUnit` derivation; UI reads only via `useComplianceExecution()`. |

### Removed (parallel-system cleanup)

- `src/policy/data/auditEventTemplates.ts` — deleted.
- `src/policy/data/expandAuditTemplates.ts` — deleted.
- `src/policy/data/auditDependencies.ts` — deleted.
- `src/policy/data/auditWorkflowTypeRegistry.ts` — deleted.
- `WorkflowType` union + `Workflow.workflowType` — reverted in `src/policy/types/workflow.ts`.

### Weekend-shift report (generation pass, 2026)

64 audit occurrences fell on Sat/Sun and were shifted forward to the next business day. Examples:

| Workflow | Original | Shifted |
|---|---|---|
| CL-WF-26 (POC Audit) | 2026-02-07 (Sat) | 2026-02-09 (Mon) |
| CO-WF-04 (Internal Compliance) | 2026-03-14 (Sat) | 2026-03-16 (Mon) |
| CO-WF-24 (Post-Bill) | 2026-02-14 (Sat) | 2026-02-16 (Mon) |
| HR-WF-21 (Staff File) | 2026-06-14 (Sun) | 2026-06-15 (Mon) |

Remaining weekend audit events after the shift pass: **0**. Full report available at runtime via `AUDIT_WEEKEND_SHIFTS` from `auditRegulatoryEvents.ts`.

---

## 10. Migration Notes (From Earlier Drafts)

| Old artifact | Action |
|---|---|
| Hand-built Jan/Feb/Mar audit calendar in `Updates` | **Discard.** Replaced by template engine. |
| Standalone "Plan of Care Audit" event entries | **Convert** to `CL-WF-POC-AUDIT-001` workflow + `TPL-CL-POC-AUDIT` template. |
| Audits referenced in QAPI input outside `workflow_type = 'audit'` | **Reject.** QAPI input filter is enforced at the aggregator. |
| `BlockedReason` triggered externally by enforcement scripts | **Move** into `event.followUps[]` or `workflow.dependsOn`. |

---

*End of Audit Workflow Catalog & Event Template Engine.*
