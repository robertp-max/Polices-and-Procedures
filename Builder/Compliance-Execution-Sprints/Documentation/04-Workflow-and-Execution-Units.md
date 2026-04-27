# 04 — Workflow and Execution Units

## 1. The Three-Tier Hierarchy

Every operational unit of work in CES is reachable through a strict
three-tier hierarchy:

```
Compliance Event   ──►   Workflow   ──►   Execution Unit
   (regulatory          (process to       (atomic, owned,
    anchor)             satisfy event)     dated work item)
```

There are **no orphan Execution Units**. Every unit traces back to a
regulatory event of record.

## 2. Compliance Events

```ts
interface ComplianceEvent {
  id:         string;
  title:      string;
  category:   EventCategory;
  domain:     ComplianceDomain;
  anchorDate: string;
}

type EventCategory =
  | 'mandated'
  | 'multi_year_governance'
  | 'triennial_governance'
  | 'recurring'
  | 'trigger_based'
  | 'retrospective';
```

| Category | Examples |
|----------|----------|
| `mandated` | QAPI Monthly Review, Governing Body Quarterly Meeting |
| `multi_year_governance` | Bi-annual EP Drill |
| `triennial_governance` | HIPAA Risk Assessment |
| `recurring` | Caregiver Credential Recertification |
| `trigger_based` | Incident Investigation IR-2026-041 |
| `retrospective` | Carry-over remediation from prior sprint |

Each event lives in exactly one of four `ComplianceDomain` values:
`clinical`, `compliance`, `hr`, `governance`.

## 3. Workflows

```ts
interface Workflow {
  id:              string;
  eventId:         string;
  title:           string;
  requiredFormIds: string[];
}
```

A workflow is the **process specification** for satisfying an event. It
declares the forms required as evidence. Examples from
`mockSprint.ts`:

| Workflow | Required Forms |
|----------|---------------|
| `wf-qapi-dash` — QAPI Dashboard Compilation | `QA-FM-001`, `QA-FM-024` |
| `wf-gb-min` — Governing Body Minutes | `GV-FM-005` |
| `wf-emr-drill` — EP Drill After-Action Report | `EM-FM-012`, `EM-FM-013` |
| `wf-hipaa-risk` — HIPAA Risk Analysis Workbook | `EN-FM-033`, `EN-FM-034`, `EN-FM-035` |

## 4. Execution Units

The operational object. Everything visible on the board is an Execution Unit.

```ts
interface ExecutionUnit {
  id:               string;
  title:            string;
  parentEventId:    string;
  workflowId:       string;
  workflowPhase:    WorkflowPhase;
  complianceState:  ComplianceState;
  auditReadiness:   AuditReadiness;
  owner:            Owner;
  approver:         Owner;
  signatureOwner:   Owner;
  requiredSigners:  RequiredSigner[];
  blockedReason?:   BlockedReason;
  dueDate:          string;
  escalationTimer?: number;
  evidenceStatus:   EvidenceStatus;
  domain:           ComplianceDomain;
}
```

### 4.1 Phase vs. State

These are **two orthogonal axes**:

| Axis | Values | Meaning |
|------|--------|---------|
| `workflowPhase` | preparation → documentation → review → signature → audit | What stage of the workflow process |
| `complianceState` | upcoming → ready → in_progress → awaiting_signature → blocked → completed | What stage of the operational lifecycle |

They are coupled but not identical. A unit in `phase: signature` is
typically in `state: awaiting_signature`, but it can also be `blocked`
(e.g., signature requested but signer is on PTO).

The board's vertical columns are **states**. The drawer's vertical
timeline is **phases**.

### 4.2 The Three Owners

Every unit has three named accountabilities:

| Field | Responsibility |
|-------|---------------|
| `owner` | Operational — performs the documentation work |
| `approver` | Reviews evidence in the `review` phase |
| `signatureOwner` | Routes the unit through eCIgn and chases signatures |

These can be the same person but the role distinction must be preserved
in the audit log.

### 4.3 Required Signers

```ts
interface RequiredSigner {
  userId:             string;
  name:               string;
  initials:           string;
  role:               string;
  status:             'signed' | 'pending' | 'overdue';
  signedAt?:          string;
  hoursToEscalation?: number;
}
```

The signer roster is **declared at workflow definition time**, not at
signature request time. Example: GB minutes always require Board Chair
+ Administrator + Medical Director — that is encoded in the workflow,
not improvised by the signature owner.

## 5. Worked Example — `eu-007` (Governing Body Minutes)

| Field | Value |
|-------|-------|
| Event | `evt-gb-q` — Governing Body Quarterly Meeting |
| Workflow | `wf-gb-min` — Governing Body Minutes |
| Phase | `signature` |
| State | `awaiting_signature` |
| Required Signers | 3 (1 signed, 2 pending) |
| Due | 2026-04-26 |
| Escalation Timer | +24h |

Closure path: the two pending signers must sign → `signaturesComplete`
becomes 3/3 → drag to Completed succeeds → unit closes → audit index entry
generated.

If escalation timer goes negative, the unit is automatically flagged
on the dashboard's Critical Risk banner and contributes to the urgent
escalation count in the top context bar.
