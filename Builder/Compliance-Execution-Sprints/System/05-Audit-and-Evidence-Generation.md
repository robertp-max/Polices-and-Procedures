# 05 — Audit and Evidence Generation

This document describes how CES, in its actual running form, produces
the evidence and audit-index artifacts that appear in the Completed
column.

## 1. The Single Audit Question

> *"Show me, right now, the evidence that this compliance event was
> executed correctly within its sprint."*

Every code path described below exists to make that question
answerable in seconds, by anyone, without rummaging through email,
SharePoint, or signed PDFs scattered across drives.

## 2. EvidenceStatus — The Atomic Record

Defined in
[`types.ts`](../../../src/policy/ces/types.ts):

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

This struct is the **only** place CES tracks evidence completion. The
shape is deliberately small — five numbers and a boolean — because
this is the entire audit-readiness check expressed as data.

## 3. The Evidence Summary Function

In
[`useEvidenceTracker.ts`](../../../src/policy/ces/hooks/useEvidenceTracker.ts):

```ts
export const summarizeEvidence = (e: EvidenceStatus): EvidenceSummary => ({
  formsComplete:       e.requiredFormsComplete >= e.requiredFormsTotal,
  signaturesComplete:  e.signaturesComplete    >= e.signaturesRequired,
  auditReady:          e.auditIndexCreated,
  formsLabel:          `${e.requiredFormsComplete} / ${e.requiredFormsTotal} forms filed`,
  signaturesLabel:     `${e.signaturesComplete} / ${e.signaturesRequired} signatures captured`,
  auditIndexLabel:     e.auditIndexCreated ? 'Audit index ready' : 'Audit index pending',
});
```

This pure function is called directly by the
[`WorkflowDrawer`](../../../src/policy/ces/components/details/WorkflowDrawer.tsx)
to populate the Evidence panel — no hook needed for the synchronous
non-null path.

The hook form `useEvidenceTracker(unit | null): EvidenceSummary | null`
exists for callers that may not have a unit yet.

## 4. How `auditIndexCreated` Flips

`auditIndexCreated` is the **last** evidence field to flip true and
the **only** one that gates closure. Its lifecycle:

```
1. Forms complete                    (requiredFormsComplete = total)
2. Signatures all captured           (signaturesComplete = required)
3. eCIgn webhook arrives with last cert
4. Audit-index assembly runs:
     - hash of every form payload
     - cert-id list from eCIgn
     - signer roster snapshot
     - sprint, event, workflow IDs
     - completion timestamp
5. Index entry persisted; auditIndexCreated = true   ◄── flip moment
6. canTransitionState(unit, 'completed') ALLOWS
7. Unit moves to Completed column
```

In the mock build, `auditIndexCreated` is pre-set on units shaped to
allow closure. Production wiring inserts steps 3–5 between webhook
and transition.

## 5. The Closure Gate (Restated)

From [`useExecutionEnforcement.ts`](../../../src/policy/ces/hooks/useExecutionEnforcement.ts):

```ts
if (target === 'completed') {
  if (formsIncomplete)        return deny('Required forms incomplete', ...);
  if (signaturesIncomplete)   return deny('Signatures incomplete',     ...);
  if (!auditIndexCreated)     return deny('Audit index not created',   ...);
}
```

This check is what ensures **the Completed column is the audit shelf**.
Nothing reaches it without all three evidence vectors green. There is
no admin override, no force-close, no "skip audit index for this one"
toggle.

## 6. Completed Column = Filtered Audit Shelf

In [`SprintExecutionBoard.tsx`](../../../src/policy/ces/components/board/SprintExecutionBoard.tsx),
the Completed column is the **structural** evidence-ready set: a unit
is in it iff `complianceState === 'completed'`. Combined with the
closure gate, this means:

> Every unit in the Completed column has all forms, all signatures,
> and an audit index — by structural guarantee, not by reviewer trust.

The Card's "Evidence complete" footer chip is rendered **only** when
the unit is in the Completed column, reinforcing the visual contract.

## 7. The Surveyor Walkthrough Path

A surveyor or internal auditor reads CES like this:

1. Open `/ces/board`.
2. Read the Completed column.
3. Click any unit's card → drawer opens.
4. Read the Evidence Status panel: forms, signatures, audit index —
   all green.
5. Read the Signature Roster: each signer name, signed timestamp.
6. (Production) Click "View Audit Packet" to launch the eCIgn
   printable packet for the unit.

Total time to verify one event's compliance: under 30 seconds. This
is the **operational property** the entire system is engineered to
deliver.

## 8. Sprint-Level Audit Readiness

The dashboard's `Audit Readiness %` metric
(in [`CesExecutiveDashboard.tsx`](../../../src/policy/ces/components/dashboard/CesExecutiveDashboard.tsx))
is derived as:

```
auditReady%  =  (units with auditReadiness = 'ready')
                   / (units in scope)
                   * 100
```

This is the leading indicator. The Critical Risk Banner appears when
this drops below the threshold defined in `SPRINT_METRICS` (typically
80%) — surfacing the gap **before** sprint close, not after.

## 9. Retention and Immutability (Production)

The mock build keeps everything in React state. The production audit
layer must:

| Property | Implementation |
|----------|---------------|
| Immutable index | Append-only log keyed by (sprintId, unitId) |
| Form payload retention | Per state retention policy (typically 7 years) |
| Cert retention | eCIgn vault, referenced by cert-id from index |
| Tamper evidence | Hash-chained log; daily Merkle root |
| Access log | Every Completed-column drawer open recorded |

These are infrastructure concerns layered **on top of** the in-app
audit index — the in-app structure described in this document is the
input to the durability layer, not a substitute for it.

## 10. Why Evidence Lives in the Unit, Not in a Side Channel

CES intentionally embeds `evidenceStatus` directly inside
`ExecutionUnit` rather than tracking it in a parallel store. The
consequences:

- The closure gate has zero data-fetch latency.
- The drawer shows current evidence with zero additional joins.
- A unit cannot become "completed but evidence-elsewhere" — they are
  the same record.
- The audit log captures evidence shape per transition, not just
  state.

This is the structural reason CES can guarantee that the Completed
column is the audit shelf: the column membership and the evidence
state are **not separable**.
