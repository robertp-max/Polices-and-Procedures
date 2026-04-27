# 08 — Audit and Evidence Model

## 1. The Audit Question CES Was Built to Answer

> *"Show me, for any required regulatory activity in the last 24 months,
> the evidence that it was executed on time, by whom, with what artifacts,
> and signed by whom — without leaving this screen."*

CES guarantees this by making evidence completeness a **closure
precondition**, not a downstream chore.

## 2. Evidence Status — The Atomic Record

```ts
interface EvidenceStatus {
  requiredFormsTotal:    number;
  requiredFormsComplete: number;
  missingFormIds:        string[];
  signaturesRequired:    number;
  signaturesComplete:    number;
  auditIndexCreated:     boolean;
}
```

Three **independent** completeness vectors:

| Vector | Updated by | Closure requirement |
|--------|-----------|---------------------|
| Forms | Forms Library save events | `complete >= total` |
| Signatures | eCIgn webhooks | `complete >= signaturesRequired` |
| Audit Index | System (synchronous) | `auditIndexCreated === true` |

The `useEvidenceTracker` hook produces a single
`EvidenceSummary` for the UI:

```ts
interface EvidenceSummary {
  formsLabel:      string;   // "2 / 3 forms filed"
  signaturesLabel: string;   // "1 / 2 signatures captured"
  auditIndexLabel: string;   // "Audit index created" / "Audit index pending"
  ready:           boolean;
  missingForms:    string[];
}
```

This summary appears in the Workflow Drawer's Evidence Status panel.

## 3. Audit Readiness vs. Evidence Status

Two related but distinct concepts:

| Concept | Definition |
|---------|-----------|
| **Evidence Status** | Quantitative state of completion (numbers) |
| **Audit Readiness** | Qualitative attestation: would this survive surveyor review *now*? |

```ts
type AuditReadiness = 'not_ready' | 'partial' | 'ready';
```

Audit readiness is computed downstream of evidence status. A unit can
be `requiredFormsComplete === requiredFormsTotal` but still
`partial` — for example, if a form is filed but not yet attested by
the approver.

## 4. The Audit Index

The Audit Index is a system-managed registry of every closed Execution
Unit, with one entry per unit. Each entry contains:

| Field | Source |
|-------|--------|
| Unit id | ExecutionUnit.id |
| Workflow + Event reference | parentEventId, workflowId |
| Owner / Approver / Signature Owner | Owner records |
| Required signers + signature certificates | eCIgn attestation bundle |
| Filed forms (with hashes) | Forms Library |
| Phase transition history | Audit log |
| State transition history | Audit log |
| Closure timestamp | System |
| Sprint id | Active sprint at closure |

This index is:

- **Append-only** — entries cannot be edited or deleted.
- **Linkable** — surveyors can be given a deep link to a single index entry.
- **Bulk-exportable** — entries for a date range produce a single
  surveyor-ready evidence package.

## 5. Why "Audit Index Created" is a Closure Gate

The system flips `auditIndexCreated = true` when:

1. All required forms have been filed (verified by Forms Library).
2. All required signatures have been captured (verified by eCIgn).
3. The system has assembled and persisted the index entry.

The flip is **synchronous** — there is no async window where the unit
appears closed but the index entry is missing. If indexing fails, the
unit cannot close.

This is what prevents the surveyor scenario:

> *"Your dashboard says this was completed on April 24, but no document
> in your file system has that signature."*

In CES, that scenario is **structurally impossible**.

## 6. Completed Column — Filtered by Readiness

The board's **Completed** column displays only Execution Units whose
`auditReadiness === 'ready'`. A unit closed on the technicality of state
transition but with `partial` readiness is held out of the column with
an explicit indicator. (In production, this should be impossible
because the closure gate enforces all three vectors; this filter is a
defense-in-depth measure for any imported legacy data.)

## 7. Surveyor Walk-Through

The Workflow Drawer's `Evidence Status` panel and `Required Signatures`
panel together constitute a **single-screen surveyor narrative** for any
unit:

> *"This unit closed on April 24, 2026. Three forms were filed
> (`GV-FM-005`, `GV-FM-008`, `QA-FM-005`). Three signatures were
> captured (Board Chair at 14:21, Administrator at 15:02, QAPI Lead at
> 15:47). Audit index entry CES-2026-Q2-0072 was created at 15:47:08."*

No artifact assembly. No screenshot binder. No scrambling.

## 8. Retention and Immutability

The Audit Index is retained for the agency's record-retention period
(typically 7 years for HIPAA/CMS). Index entries are immutable; if
closed-unit evidence is later found defective, the remediation is a
**new corrective Execution Unit**, not an edit to the historical
entry.
