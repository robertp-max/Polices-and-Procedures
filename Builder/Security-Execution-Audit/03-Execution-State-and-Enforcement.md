# 03 — CEU State Machine & Enforcement

**Layers:** EUL (state) + ENF (enforcement)

---

## 1. States

| State | Meaning |
|-------|---------|
| `NotStarted` | Created and ready (no unmet hard blockers). |
| `InProgress` | An eligible assignee has started work. |
| `AwaitingEvidence` | Required evidence not yet submitted/validated. |
| `AwaitingSignature` | Required signatures pending in eCIgn. |
| `Blocked` | One or more `blockedBy` CEUs are not Completed, OR an enforcement gate failed. |
| `AtRisk` | SLA threshold breached but not yet failed. |
| `Completed` | All requirements satisfied; signed evidence committed. |
| `Failed` | Past due beyond grace, voided by override, or evidence rejected without remediation. |

Terminal states: `Completed`, `Failed`. (Re-opening creates a child remediation CEU; the original is not mutated.)

---

## 2. Allowed Transitions

```
NotStarted ──start──▶ InProgress
NotStarted ──block──▶ Blocked
InProgress ──submitEvidence──▶ AwaitingEvidence
InProgress ──requestSignature──▶ AwaitingSignature
AwaitingEvidence ──evidenceValidated──▶ InProgress | AwaitingSignature
AwaitingSignature ──allSignaturesCollected──▶ InProgress | Completed
InProgress ──complete──▶ Completed     (only if all gates pass)
* ──slaBreach──▶ AtRisk
AtRisk ──remediate──▶ InProgress
AtRisk ──escalate/expire──▶ Failed
* ──blockerAppears──▶ Blocked
Blocked ──blockerCleared──▶ (prior state or NotStarted)
* ──override(approved dual-sig)──▶ Completed | Failed
```

Transitions are validated server-side. Client-side state is presentation only.

---

## 3. Transition Rules

For every `transition(ceu, fromState, toState, actor, reason?)`:
1. Authorization check (Doc 01) for the action.
2. State graph check (transition allowed).
3. Pre-conditions check:
   - `complete` requires: 0 unmet `blockedBy`, all required evidence validated, all required signatures collected, all gates pass.
   - `start` requires: assignee resolved, no hard blockers.
4. Optimistic concurrency check on `version`.
5. Append `CeuStateTransition` to `stateHistory`.
6. Emit `CEU_STATE_CHANGED` audit event with before/after state.
7. Re-evaluate dependents and gates (cascading).

---

## 4. Gates (Enforcement Layer)

Gates are evaluated **before** allowing certain transitions and **continuously** for active CEUs.

### 4.1 `field_clearance`
Clinical staff cannot perform field/patient-facing CEUs unless:
- Active license on file and unexpired.
- Required onboarding CEUs `Completed`.
- No active suspension.
- Required policy acknowledgements current for their role.

### 4.2 `billing_clearance`
Billing-relevant CEUs require:
- Required billing onboarding CEUs `Completed`.
- No outstanding billing remediation CEU `Failed` or open `>30d`.

### 4.3 `system_access_clearance`
Access to PHI-tagged CEUs requires:
- Active assignment with `phi.read` (or `phi.write`).
- Patient-scope match.
- Re-authentication if session age > policy threshold (Doc 05).

Gate failures emit `GATE_FAILED` and transition the CEU (or its parent) to `Blocked` with `reasonCode`.

---

## 5. Blocking Rules & Auto-Propagation

- A CEU enters `Blocked` when:
  - any `blockedBy` is not `Completed`, OR
  - any active gate fails, OR
  - the assignee loses required role/scope.
- When blocked, downstream `childIds` and dependents are also re-evaluated; if their unmet criteria depend on this CEU they enter `Blocked`.
- Blocked CEUs surface a `blockReason[]` array, each with `code`, `message`, `since`, `clearableBy`.

---

## 6. Escalation Rules

| Trigger | Escalate to | Action |
|---------|------------|--------|
| `AtRisk` for ≥ 25% of SLA window | Assignee's manager | Notify; CEU flagged `escalation: L1` |
| `AtRisk` past due | Compliance Lead | `escalation: L2`, daily reminders |
| `Blocked` ≥ 7 days | Compliance Lead | `escalation: L2` |
| `Failed` (any) | Compliance Lead + Director | `escalation: L3`, requires Remediation CEU |
| Repeated SoD denials (≥3 in 24h, same actor) | Compliance Lead | `escalation: SECURITY` |
| Override requested | Director-on-call + Compliance Lead | Dual-approval workflow |

All escalation steps emit `CEU_ESCALATED` events.

---

## 7. Override Workflow (Dual Signature)

1. **Request** — Requestor opens override CEU referencing the target. Reason mandatory. Emits `OVERRIDE_REQUESTED`.
2. **Approver A** — Eligible role-1 user signs via eCIgn. Emits `OVERRIDE_APPROVED` (partial).
3. **Approver B** — Distinct eligible role-2 user signs via eCIgn. Emits `OVERRIDE_APPROVED` (final).
4. **Apply** — System mutates the target CEU (e.g., force `Completed` or `Failed`) and emits `CEU_OVERRIDDEN` with both signature ids and reason.
5. **Expiry** — If A approves but B does not within 24h, override auto-expires; emits `OVERRIDE_EXPIRED`. Target CEU is unaffected.

A and B cannot be the same user. Self-approval is rejected and audited.

---

## 8. Parent CEU Derivation

For a CEU with `childIds`:
- `Completed` only when all required children are `Completed`.
- `Failed` if any required child is `Failed` (unless override).
- `Blocked` if any required child is `Blocked`.
- Else propagates the most-advanced child state without bypassing requirements.

---

## 9. Auditability of State

Every transition records:
```
CeuStateTransition {
  from: CeuState
  to: CeuState
  at: ISODateTime
  actorUserId | 'system'
  reasonCode: string
  correlationId
  evidenceRefs?: string[]
  signatureRefs?: string[]
  auditEventId                   // backlink to AEL entry
}
```

The CEU's current `state` is **derived** from `stateHistory` at read time when reconstructing from events; the cached `state` field exists only for query performance and must equal the derivation.
