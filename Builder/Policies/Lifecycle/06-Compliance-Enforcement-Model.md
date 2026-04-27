# 06 — Compliance Enforcement Model

> Hard, automated rules the lifecycle system MUST enforce. Each rule is testable, auditable, and surfaced in the UI as a guard or readiness check. Nothing in this list is advisory — every item below is a system-blocking constraint.

---

## 1. Enforcement Categories

| Category | What it protects |
|---|---|
| Approval gates | Right person, right tier, no self-approval |
| Comment gates | No publish over unresolved Required comments |
| Active-version invariant | Continuous enforceable coverage |
| Acknowledgment gates | Audience reach proven within 14 days |
| Signature gates | Real, hash-chained, attestation-bound signatures |
| Version-write gates | No overwrite of locked versions |
| Distribution gates | Channels confirmed before activation |
| Retention gates | Floor honored before any archive |
| Hash-chain gates | Tamper detection on every transition |
| Conflict-of-interest gates | COI on file before any approval signature |

---

## 2. Hard Rules (Each is a System-Block)

### R1 — No publish without required approval
**Trigger:** transition T8 (`approved_locked → active`).
**Guard:** every `ApprovalRequirement` row for the version satisfies `met = true` and carries a non-null `signatureId` and (where required) `meetingMinutesRef`.
**Failure mode:** Activate button disabled; readiness card lists the missing requirements; `audit_event{type:'transition_rejected', reason:'approval_incomplete'}` written.

### R2 — No publish without final compliance review
**Trigger:** T5 (`in_review → pending_approval`).
**Guard:** `EN-FM-006 Legal & Compliance Review Sign-Off` artifact attached AND signed by Compliance Officer (and Legal where the change is material — flagged automatically by the change-summary diff length and regulatory-citation delta).
**Failure mode:** Submit-for-Approval disabled; reviewer sees inline reason.

### R3 — No active-version gap
**Trigger:** T8 atomic swap.
**Guard:** the swap is one DB transaction; if any sub-operation fails (assignment generation, distribution dispatch, hash append), the entire transaction rolls back; `6.0` remains active and `6.1` returns to `approved_locked` with an incident logged.
**Invariant test:** `count(versions where state='active' and policyId=P)` queried before and after every transaction; mismatch is a P0 alert that pages on-call Compliance Officer.

### R4 — No unresolved Required comments
**Trigger:** T3 (advance to compliance review) AND T5 (submit for approval).
**Guard:** `count(ReviewComment where versionId=V and commentType='Required' and resolutionStatus='Open') === 0`.
**Failure mode:** primary action disabled; required-comment dock shows count and a Jump-to-next CTA.

### R5 — No missing acknowledgments after publish
**Trigger:** continuously after T8 (Active state).
**Guard:** every `PolicyAssignment` row generated on activation has `acknowledgedAt` set within 14 calendar days.
**Failure mode:** at T+10 days, escalation event to Compliance Officer; at T+14, escalation to HR + record marked `acknowledgment_overdue` for surveyor visibility. The Activate button itself is not blocked; instead the policy's compliance-health score in Audit Mode degrades and the Active version's row in queues shows red.

### R6 — No unsigned approval where required
**Trigger:** T6 (`pending_approval → approved_locked`).
**Guard:** every required signature row carries a valid eCIgn signature: typed name, drawn signature image, `signature_hash`, `attestation_text_hash`, and an `audit_event` chained to the prior event.
**Failure mode:** transition rejected; partial signatures persist as captured but the version stays in `pending_approval` until all required rows are filled.

### R7 — No version overwrite
**Trigger:** any save against a version whose state is in `{in_review, pending_approval, approved_locked, active, superseded, archived}`.
**Guard:** the API rejects writes to `PolicyVersion.sections` or `PolicyVersion.metadata` when state is not `draft_open`. Edits to `effectiveDate` are allowed only while state is `pending_approval` (not after T6) and are also audit-logged.
**Failure mode:** API returns `409 conflict_locked_version`; UI surfaces the lock reason; user is offered "Open revision" (T9) instead.

### R8 — No self-approval
**Trigger:** every signature attempt during T6.
**Guard:** signer's `userId !== version.createdBy` AND signer is not in the version's contributing-author list.
**Failure mode:** signature button disabled with inline message; attempt logged.

### R9 — No approval without COI clearance
**Trigger:** every signature attempt during T6.
**Guard:** signer has a current Conflict-of-Interest disclosure on file (per GV-GB-001 Appendix C) with `effectiveDate ≤ today` and `expiresAt > today`. Disclosure must be re-signed annually.
**Failure mode:** signature blocked; signer offered inline "Update COI" path.

### R10 — Effective date sanity
**Trigger:** T6 and T8.
**Guard:** `effectiveDate ≥ approvedDate` AND `effectiveDate ≥ today` at T8.
**Failure mode:** transition rejected; UI prompts for a corrected date.

### R11 — Tier-correct approval body
**Trigger:** T6.
**Guard:** the materialized `ApprovalRequirement` rows match the tier matrix in [03 §5](03-Policy-Lifecycle-Architecture.md#5-approval-requirements-by-tier). For REQUIRED, GB Chair is mandatory; the Administrator cannot substitute. The system rejects substitution requests except via the documented Special-Session pathway, which itself requires GB Chair signature.

### R12 — Active version atomicity
**Trigger:** T8 (and T9 for the new draft creation).
**Guard:** when T8 fires for `vNext`, the same transaction sets `vCurrent.state := superseded`, `vCurrent.supersededAt := now()`, `vCurrent.supersededBy := vNext.id`, and `vNext.state := active`. INV-1 is asserted at the end of the transaction.

### R13 — Hash-chain continuity
**Trigger:** every audit event write.
**Guard:** `audit_event.prev_hash === lastEvent(policyId).hash`. If broken, the write is rejected; all transitions for that policy ID are blocked; alert raised.
**Recovery:** manual reconciliation by Compliance Officer with Administrator co-sign; reconciliation itself is an audit event.

### R14 — Distribution channel readiness
**Trigger:** T8.
**Guard:** every channel listed in the policy's distribution profile responds healthy on a pre-flight check (Portal: always; Drive: API token valid; SCORM: endpoint reachable). At least the Portal channel must succeed; Drive and SCORM may degrade with explicit "deferred-distribution" annotation logged.

### R15 — Retention floor honored
**Trigger:** T10 / T11 (archive transitions).
**Guard:** `today >= max(retentionFloors[policyDomain])`. Retention floors:
- CL (clinical): 10 years
- GV / QA (governance, quality): life of agency
- Billing-related: 10 years (FCA)
- Default: 7 years (CA H&S)
**Failure mode:** archive button disabled; tooltip shows the active retention floor and the earliest legal archive date.

### R16 — Audit-trail completeness
**Trigger:** every state change of any entity.
**Guard:** `audit_event` is written **inside** the same transaction as the state mutation. There is no path that mutates without an event.

### R17 — Acknowledgment integrity
**Trigger:** every `PolicyAssignment.acknowledge` action.
**Guard:** signer must be the assignee; signature is captured via eCIgn; assignment timestamp matches event timestamp.

### R18 — Cross-policy reference integrity
**Trigger:** T8 and T10.
**Guard:** when activating, every cross-reference resolves to a current `active` policy. When archiving, no other `active` policy references this one. Failure offers "Re-link" or "Replace reference" actions.

### R19 — Author-cannot-publish
**Trigger:** T8.
**Guard:** the user invoking Activate is not the version `createdBy`. Activation is a Compliance-Officer-or-Administrator action.

### R20 — One-version-per-cycle iteration cap
**Trigger:** T2 (Request Revision back to draft).
**Guard:** revision rounds are tracked. After 3 rounds without advancement, the system requires a written rationale from the policy owner and notifies the Administrator. (Soft escalation, not a hard block — but auditable.)

---

## 3. Enforcement Layer Mapping

| Rule | Enforced in |
|---|---|
| R1, R2, R6, R8, R9, R11, R19 | State-machine guards (server-authoritative) |
| R3, R12, R16 | Database transaction + invariant assertions |
| R4 | State-machine guard + UI dock |
| R5, R17, R20 | Background job + escalation emitter + Audit Mode metric |
| R7, R10, R13, R14, R15, R18 | API-layer validators |

UI mirrors every rule with a readable explanation; the rule itself never lives only in UI.

---

## 4. Audit-Mode Surfacing

For surveyor readiness, Audit Mode (`/audit`) shows a per-policy compliance scorecard:

- Approval chain completeness (R1, R6, R11)
- Hash-chain integrity (R13)
- Acknowledgment reach within 14 days (R5, R17)
- Active-version invariant status (R3, R12)
- Retention compliance (R15)
- Last successful distribution per channel (R14)
- COI currency for all approvers (R9)

Each row links back to the lifecycle workspace pre-filtered to the policy.

---

## 5. Test Surface

Every rule has at least one automated test:

- **State-machine unit tests** — golden cases per transition + every guard's failure path.
- **Invariant property tests** — generative tests that assert INV-1…INV-10 over random valid sequences of transitions.
- **End-to-end acceptance tests** — full lifecycle of a REQUIRED policy from Drafting through Activation and a subsequent Under-Revision swap, verifying R1, R2, R3, R6, R12 all hold.
- **Audit-replay tests** — given an `ecign.audit_events` log, the test reconstructs the policy state and asserts equality with the persisted version state.

Tests are required to pass in CI; failures block deploy.

---

## 6. Operating Posture

- Guards are **fail-closed**: any unknown condition rejects the transition.
- Errors are **explicit**: rejected transitions produce a structured `TransitionRejection` with rule code (`R-1`, `R-13`, …) so UI and audit log align.
- Reasons are **preserved**: every rejection writes the rule code into the audit event's `payload.reason`.
- Overrides are **rare and logged**: the only documented override is the Special-Session pathway under R11; it requires GB-Chair signature and is itself an audit event of type `override_special_session`.

The integration points that consume these enforcement events live in [07-System-Integration.md](07-System-Integration.md).
