# 06 — Compliance Enforcement Rules

## Purpose

Define the **hard, machine-enforced rules** that make onboarding a compliance gate rather than a paperwork task. These rules are non-overridable except by an audited Compliance Officer override.

---

## 1. Rule Classes

| Class | Behavior |
|-------|----------|
| **HARD GATE** | Blocks downstream system action. No completion path bypasses it. |
| **BLOCKER** | Marks unit/batch Blocked; downstream onboarding work suspended. |
| **ESCALATION** | Notifies higher tier; does not auto-block. |
| **AUDIT-WRITE** | Always emits an audit event regardless of outcome. |

Every rule below specifies its class.

---

## 2. Pre-Field Gate (HARD GATE)

A clinician (RN, LVN, HHA, Therapist) **cannot** be assigned to a patient visit unless:

- Active license PSV passes (state board source, within 30 days)
- BLS/CPR current
- TB current
- Drug screen current per HR cadence
- OIG/SAM/state exclusion: not excluded
- Background check: cleared
- Role-specific competency packet: Completed and within revalidation window
- HIPAA workforce + Code of Conduct + AUP signed (current version)
- Field Clearance unit Completed (Compliance Officer or delegate eCIgn)

**Enforcement point**: Scheduling system queries `CES.field_clearance(subject, date)`. False = scheduling refused. The refusal is itself an audit event.

---

## 3. Pre-Billing Gate (HARD GATE)

A workforce member **cannot** be granted billing system access or have their documentation feed billing unless:

- FN-BC-001 training Completed
- FWA training Completed
- Coder credential PSV (if applicable)
- Confidentiality + HIPAA + AUP signed
- Billing Clearance unit Completed (Compliance Officer eCIgn)

**Enforcement point**: Billing system / provisioning system queries `CES.billing_clearance(subject)`.

---

## 4. Pre-System-Access Gate (HARD GATE)

System access provisioning (EHR, billing, network, email) **cannot** be granted unless:

- HIPAA workforce training Completed
- AUP signed (current version)
- Confidentiality signed
- Background check cleared
- OIG/SAM/state: not excluded

**Enforcement point**: IAM / provisioning system queries `CES.system_access_clearance(subject)`.

---

## 5. Policy Acknowledgment Rule (HARD GATE per policy)

A subject is **not compliant with a given policy** until:

- An eCIgn acknowledgment exists
- Bound to the **specific policy version** in force at signing
- Captured via the Policy Acknowledgment workflow
- Persisted as an evidence object with content hash

Bulk acknowledgments are explicitly forbidden. One signature per policy per version.

On policy republish, prior acknowledgments become **stale** for that policy and a re-acknowledgment unit is auto-emitted with SLA per the policy's republish cadence.

---

## 6. Competency Validation Rule (BLOCKER)

A clinical role's competency requirement is satisfied only when:

- Workflow executed (observed in patient or simulated setting per policy)
- Form completed with structured items (not narrative)
- Observer signature (eCIgn) by qualified observer (RN for HHA; CM/DON for RN where required)
- Subject signature (eCIgn)
- Pass criteria met per workflow

Failure → unit moves to `Failed`, increments attempt counter, emits remediation sub-batch (re-training + re-attempt). Field clearance remains Blocked.

---

## 7. Evidence Validation Rule (BLOCKER)

No unit completes without:

- All required evidence objects persisted
- Each evidence object passes schema validation
- Each evidence object has: subject_id, role, unit_id, batch_id, policy_version (where applicable), source, timestamp, content hash
- File-type evidence (PDF, image) passes content checks (non-empty, not corrupted, OCR/text extractable where required)

Rejected evidence reopens the unit with a rejection reason and a retry attempt.

---

## 8. Signature Integrity Rule (HARD GATE)

A signature is valid only if captured through eCIgn and bound to:

- The exact evidence object (or policy version) being signed
- Signer identity (verified per eCIgn doc 08)
- Timestamp + IP + auth method
- Signed artifact watermark + hash (per eCIgn doc 06)

Any other signature method is rejected. Paper signatures may only be ingested as **evidence images** under an explicit Compliance Officer override workflow, with an audit event recording the override reason.

---

## 9. Owner Rule (BLOCKER)

Every onboarding unit must have an `assignee` resolved by the CES Assignment Model. A unit without an owner is automatically Blocked and escalated. No "unassigned" units may exist for more than the assignment SLA defined in CES doc 04.

---

## 10. Deadline & Escalation Rules (ESCALATION → BLOCKER)

| Window | Action | Class |
|--------|--------|-------|
| T-30 days to deadline | Notify assignee | ESCALATION |
| T-14 days | Notify assignee + supervisor | ESCALATION |
| T-7 days | Notify Compliance Officer; mark batch At Risk | ESCALATION |
| T-0 (overdue) | Mark Blocked; downstream gates fail; create compliance escalation | BLOCKER |
| Pre-field/pre-billing gate window passed | Hard refusal at downstream system | HARD GATE |

Escalation policy is template-driven and may be tightened per requirement (e.g., license expiry uses 60/30/14/7/0).

---

## 11. Reconciliation Override Rule (AUDIT-WRITE)

When the engine suppresses a requirement based on existing valid evidence (doc 03 §6), it must:

- Reference the evidence object ID
- Record the reason: `RECONCILED_EXISTING_EVIDENCE`
- Record the validity window
- Emit an audit event `REQUIREMENT_VERIFIED_BY_RECONCILIATION`

Reconciliation is never silent.

---

## 12. Compliance Officer Override Rule (AUDIT-WRITE + DUAL SIGNATURE)

Any override of a HARD GATE requires:

- Compliance Officer eCIgn
- Plus Administrator eCIgn (multi-sig per eCIgn doc 09)
- Override reason (free text, retained)
- Time-bounded validity (default ≤ 30 days; never indefinite)
- Audit event `HARD_GATE_OVERRIDE` with all of the above
- Automatic re-block at validity expiry

Overrides are reportable on the Audit Readiness dashboard.

---

## 13. Vendor Compliance Rules

| Rule | Class |
|------|-------|
| No PHI access without executed BAA bound to current BAA template version | HARD GATE |
| Vendor flagged on OIG/SAM/state exclusion → engagement suspended | HARD GATE |
| Insurance COI expired → engagement suspended | HARD GATE |
| Monthly exclusion check missed → vendor batch Blocked | BLOCKER |

---

## 14. Governance Rules

| Rule | Class |
|------|-------|
| Administrator role unfilled or unattested | HARD GATE on agency operations actions requiring Administrator sign-off |
| Compliance Officer unfilled | BLOCKER on new hires and escalations |
| Governing Body annual COI overdue | BLOCKER on next GB-required attestation |
| Medical Director appointment expired | BLOCKER on services requiring MD oversight |

---

## 15. Audit Trail Rule (AUDIT-WRITE, universal)

For every onboarding-relevant event the system **must** emit an `OnboardingAuditEvent`:

- trigger received
- profile resolved
- template selected (with version)
- requirement reconciled or emitted
- unit lifecycle change (every transition)
- evidence captured / rejected
- signature requested / completed / declined
- gate evaluated (and result)
- override granted / expired
- batch completed / withdrawn

Audit events are append-only, hash-chained, and replayable.

---

## 16. Non-Overridable Constraints

The following can **never** be overridden by any role:

- License PSV must come from a recognized primary source
- BAA must be signed before PHI exchange (no retroactive)
- HHA CoP §484.80 competency in 12 subjects (cannot be skipped)
- HHA 12-hour annual in-service (cannot be waived)
- OIG/SAM exclusion match (cannot be cleared by override; only by removal from list)
- Audit event emission (cannot be suppressed)
