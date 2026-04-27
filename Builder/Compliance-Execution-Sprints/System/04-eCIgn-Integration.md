# 04 — eCIgn Integration

This document explains how the running CES build hands off to and
consumes from the existing eCIgn signature substrate.

## 1. The Boundary

CES owns the **request, tracking, and SLA** for signatures.
eCIgn owns the **capture, attestation, and certificate generation**.

```
     CES                                          eCIgn
  ┌────────────────────┐                ┌────────────────────────┐
  │ Drawer "Request    │ ─── invoke ──► │ FormSigningWorkspace   │
  │ Signatures" button │                │ (existing implementation)│
  └────────────────────┘                └────────────────────────┘
                                                    │
  ┌────────────────────┐                            │
  │ requiredSigners[]  │ ◄─── webhook ──────────────┘
  │ status updates     │
  └────────────────────┘
```

## 2. The Trigger Path

In [`WorkflowDrawer`](../../../src/policy/ces/components/details/WorkflowDrawer.tsx)
the **Request Signatures** action button fires:

```ts
const handleRequestSignatures = () => {
  if (!reqSig.allowed) return note(reqSig.reason);
  onUpdate({ ...unit, complianceState: 'awaiting_signature' });
  // Production: invoke eCIgn API with package + roster + SLA policy
};
```

In production, the callback also issues the eCIgn request with:

- The **signed evidence package** — collected from the unit's filed
  forms (verified by the closure forms-check that gates this very
  button).
- The **required signer roster** — `unit.requiredSigners[]` declared
  at workflow definition time (see Documentation/07).
- The **per-signer escalation policy** — derived from each signer's
  role and the unit's domain.

## 3. The Signature Capture Surface

Signature capture itself runs inside the existing
`FormSigningWorkspace` component (in `src/policy/components/`). CES
**does not** re-implement:

- The signature ceremony UX
- The print packet generation
- The certificate page rendering
- The eCIgn sign-button stripping logic for printable HTML

This separation was preserved during the recent print-fix work
(`buildPrintablePacketHtml`, `getPrintableFormHtml`). Those rules
must continue to belong to the eCIgn surface.

## 4. Status Updates (Webhook → Roster Sync)

When eCIgn captures a signature, it emits a webhook that updates the
unit's roster:

```
eCIgn webhook
   { unitId, signerUserId, signedAt, certificateId }
        │
        ▼
   roster-update handler:
     unit.requiredSigners.find(s => s.userId === signerUserId).status = 'signed'
     unit.requiredSigners.find(s => s.userId === signerUserId).signedAt = signedAt
     unit.evidenceStatus.signaturesComplete += 1
        │
        ▼
   if (signaturesComplete === signaturesRequired
       && requiredFormsComplete === requiredFormsTotal) {
     attempt audit-index creation (synchronous)
     if success: complianceState = 'completed'; auditIndexCreated = true
   }
```

The drawer's **Signature Roster** panel re-renders on each update with
the new per-signer badge color (Pending/Signed/Overdue).

## 5. Escalation Hand-Off

The escalation timer is owned by CES, not eCIgn:

| When | Action | Performed by |
|------|--------|--------------|
| `hoursToEscalation ≤ 24` | Reminder to signer | eCIgn (notification subsystem) |
| `hoursToEscalation == 0` | Escalation to manager | CES (writes record + invokes notification) |
| `hoursToEscalation < 0` | Continuous escalation; sprint metric increment | CES |

This split is intentional: eCIgn handles "I want this signed" reminders
because it knows the signer's notification preferences. CES handles
"this is now an escalation" because it knows the regulatory SLA.

## 6. The Closure Trigger Sequence

When the **last** required signature lands:

```
1. eCIgn webhook arrives        (signaturesComplete becomes N/N)
2. Roster handler runs          (status='signed' for last signer)
3. Audit-index assembly runs    (auditIndexCreated = true)
4. canTransitionState fires     (target='completed') and ALLOWS
5. Unit transitions             (complianceState='completed')
6. UI updates                   (card moves to Completed column;
                                 drawer auto-refreshes)
7. Audit log entry written      (closure event)
```

Steps 3–5 are atomic — there is no observable intermediate state where
the unit appears closed but unindexed.

## 7. Print Packet Behavior (Preserved)

The print packet pipeline remains owned by eCIgn:

- `getPrintableFormHtml()` strips eCIgn sign-buttons from the cloned
  DOM before printing.
- `buildPrintablePacketHtml()` assembles the packet with a single
  footer + cert page-break.
- `handlePrint()` injects the app's stylesheet links into the print
  window so styling is preserved.

CES does not touch any of this. When CES needs a printable packet for
a closed unit, it deep-links into the existing eCIgn print surface
with the unit's id; the eCIgn surface composes the packet using its
established rules.

## 8. Why CES Does Not Implement Its Own Signature Layer

Three reasons, restated as code-level concerns:

1. **eCIgn already encodes regulatory attestation semantics**
   (PKI certificate, signer identity verification, timestamp,
   IP/device record, document hash). Re-implementing this is both
   risky and unnecessary.
2. **Print packet asset preservation** — significant in-production
   effort has gone into the print packet's correctness. CES would
   regress that work.
3. **Single source of truth** — surveyors are already trained to
   recognize eCIgn-attested artifacts. CES integrates with what is
   already accepted.

## 9. Mock-Mode Behavior (Current Build)

In the current mock-data build, signature actions update local React
state instead of invoking eCIgn:

- `Request Signatures` flips `complianceState` to `awaiting_signature`
  in the drawer's `onUpdate` callback.
- `Close Unit` flips to `completed` directly (the mock dataset has
  units pre-shaped with `auditIndexCreated: true` to allow closure
  without webhook simulation).

These mock paths must be removed when wiring the production eCIgn
service — they exist only to make the demo build interactive.
