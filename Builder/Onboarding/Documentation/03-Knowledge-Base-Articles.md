# 03 — Knowledge Base Articles (Onboarding)

> **Scope**: Article catalog and full content for the Onboarding category of the Help Center, plus the cross-cutting articles that onboarding depends on (eCIgn, gates, audit). Each article uses the schema defined in `02-Knowledge-Base-Architecture.md` §3.
>
> **Conventions**: linked artifacts (policies, workflows, forms, events) point to canonical specs in `Builder/Policies/`, `Builder/eCIgn/`, `Builder/Compliance-Execution-Sprints/`, and the onboarding architecture docs.

---

## Article Index

| # | Article | Audience |
|---|---------|----------|
| A1 | What onboarding is (and what it is not) | T1–T4 |
| A2 | How onboarding works (the engine, end to end) | T2–T4 |
| A3 | How execution units are generated | T2–T3 |
| A4 | How evidence works | T1–T3 |
| A5 | How competency validation works | T1–T3 |
| A6 | How policy acknowledgment works | T1–T3 |
| A7 | How signatures work (eCIgn) | T1–T3 |
| A8 | How audit readiness works | T3–T4 |
| A9 | How gates work (Field / Billing / System Access / Vendor / Governance) | T2–T4 |
| A10 | How overrides work | T3 |
| A11 | How recurring revalidation works | T2–T3 |

---

## A1 — What onboarding is (and what it is not)

**Audience**: T1–T4 · **Last reviewed**: pending Compliance Officer

**Summary**. Onboarding is the system that converts a person, vendor, or governance role into governed compliance work. It is not a checklist, not a wizard, and not an HR paperwork flow.

**What it does**
- Reads a trigger (new hire, role change, reactivation, revalidation, vendor, governance appointment).
- Resolves the role's full compliance obligations from current policy versions.
- Generates execution units that flow through the Compliance Execution Sprint System (CES).
- Captures structured evidence and eCIgn-bound signatures.
- Enforces hard gates that prevent non-compliant work downstream.
- Seals a per-subject dossier that is auditor-ready on demand.

**How to do it**
1. From **Onboarding → Activations**, open the Role-Based Activation screen.
2. Select the subject, the trigger type, the role(s), the effective date, and scope.
3. Review the template preview and reconciliation preview on the right.
4. Click **Activate**. The engine creates a batch and units; you are routed to the Batch View.

**System behavior**
- Emits `TRIGGER_RECEIVED` → `PROFILE_RESOLVED` → `TEMPLATE_SELECTED` → `BATCH_CREATED` → N × `UNIT_CREATED`.
- Surfaces the batch as a CES bundle on the Sprint Board with `source = Onboarding`.
- Writes Compliance Calendar entries for due dates and credential expiry windows.

**Common errors**
- "No template available for (role, trigger)" → confirm the role's template is published; see Troubleshooting → Activation Errors.
- "Subject already has an active batch" → review existing batch first; do not double-activate.

**Linked**: `../00-README.md`, `../03-Onboarding-Execution-Engine.md`, `../11-Workflow-Architecture.md`.

**Permissions**: Compliance Officer or delegate.

---

## A2 — How onboarding works (the engine, end to end)

**Audience**: T2–T4

**Summary**. Onboarding is an event-driven pipeline. A trigger flows through the Engine, the Workflow Orchestrator, the Evidence Service, eCIgn, the Gate Service, and the CES Adapter, with every step appended to a hash-chained audit log.

**How it works**
1. **Trigger Intake** receives a typed envelope and persists it idempotently.
2. **Onboarding Engine** resolves an `OnboardingProfile` and selects an `OnboardingTemplate@version`.
3. **Requirement Resolution** expands the template, applies scope filters, and reconciles against existing valid evidence (suppressed requirements emit `REQUIREMENT_VERIFIED_BY_RECONCILIATION`).
4. **Execution Batch Generator** transactionally creates the batch and units.
5. **Workflow Orchestrator** drives each `WF-*` per unit.
6. **Evidence Service** + **eCIgn Integration** capture artifacts + signatures, immutable and hashed.
7. **Gate Service** evaluates Field/Billing/System-Access/Vendor/Governance gates and returns signed assertions to downstream callers.
8. **CES Adapter** mirrors state on Sprint Board and Compliance Calendar.
9. **Closure** requires Compliance Officer attestation (eCIgn) and seals the dossier.

**System behavior**
- Every step emits a typed event (full catalog: `../System/00-Onboarding-Execution-Architecture.md` §3).
- Replay reconstructs any historical batch deterministically.

**Permissions**: Read — all; Activate/Override — Compliance Officer + Administrator.

**Linked**: `../System/00-Onboarding-Execution-Architecture.md`.

---

## A3 — How execution units are generated

**Audience**: T2–T3

**Summary**. Each role requirement that survives reconciliation becomes one execution unit, pinned to a workflow version, with an assignee resolved by CES.

**How it works**
- The engine looks up `OnboardingTemplate(role, trigger_type)` at the version effective on the trigger date.
- It expands the template into an ordered list of `RoleRequirement`s.
- It applies scope filters (service line, population) and drops requirements not in scope.
- It queries the Evidence index per requirement; if a valid evidence object satisfies the requirement within its validity window, the requirement is **suppressed** (`Suppressed`) and an audit event records the reason.
- Surviving requirements are emitted as `OnboardingExecutionUnit`s in a single transaction with the batch.
- Assignees are resolved via the CES Assignment Model.

**System behavior**
- Events: `TEMPLATE_SELECTED`, `REQUIREMENT_RESOLVED` (per requirement), `REQUIREMENT_VERIFIED_BY_RECONCILIATION` (per suppression), `BATCH_CREATED`, `UNIT_CREATED` (per unit).
- A reconciled requirement is never silently skipped.

**Common errors**
- "Suppressed unexpectedly" → open the audit event; verify the source evidence object's expiry and binding.
- "Assignee unresolved" → the unit is Blocked; CES Assignment Model could not find an owner. Reassign manually or update the assignment rules.

**Linked**: `../03-Onboarding-Execution-Engine.md`, `../05-Workflow-and-Form-Mapping.md`.

---

## A4 — How evidence works

**Audience**: T1–T3

**Summary**. Evidence is structured proof that a requirement was satisfied. It is immutable, content-hashed, and bound to subject, unit, batch, and (where applicable) policy version.

**How it works**
- Evidence is one of: `TrainingRecord`, `FormSubmission`, `FileUpload`, `ExternalSystemRecord`, `ScreeningResult`, `PSVResult`, `CompetencyArtifact`.
- The Evidence Service validates against the requirement's `evidence_schema` (schema + content checks) and persists to immutable, content-addressed storage.
- A unit may not enter `Completed` until every required evidence object is `Valid`.
- Rejected evidence emits `EVIDENCE_REJECTED` and reopens the unit for re-capture.
- New versions of evidence supersede prior versions via explicit links; nothing is deleted.

**How to do it**
1. Open the unit → **Evidence** tab.
2. For each required evidence row, complete the form, upload the file, or trigger the external pull.
3. Review validation feedback; correct errors inline.
4. Save. The artifact becomes a hashed `EvidenceObject` and the unit advances.

**Common errors**
- "Schema validation failed" → required field missing or mistyped; correct and resubmit.
- "Content check failed (OCR not extractable)" → re-upload a higher-quality scan.
- "Hash mismatch on retrieval" → escalate to engineering; this indicates storage corruption.

**Linked**: `../05-Workflow-and-Form-Mapping.md`, `../08-Data-Model.md` §5.1.

---

## A5 — How competency validation works

**Audience**: T1–T3

**Summary**. Competency is observed, scored against pass criteria, and dual-signed (observer + subject) via eCIgn.

**How it works**
- The competency workflow renders a structured skill grid (per `Competency.skills`).
- The observer (qualified by role; e.g., RN for HHA) records pass/fail/needs-remediation per skill with notes; the setting (patient or simulated) is recorded.
- Pass criteria are evaluated live; the unit cannot complete unless criteria are met.
- Both the observer and the subject sign via eCIgn (sequential or parallel per spec).
- Failure increments `attempts[]` and emits a remediation sub-batch (re-training + re-attempt). Field Clearance remains Blocked.

**How to do it**
1. Open the competency unit.
2. Select setting (Patient / Simulated).
3. Score each skill; add notes where needed.
4. Click **Finalize**; the system requires both signatures via eCIgn.
5. Outcome is recorded as a `CompetencyArtifact` evidence object.

**Common errors**
- "Observer not qualified" → the engine prevents an unqualified observer from being chosen; reassign.
- "Pass criteria not met" → the unit cannot complete; either re-attempt or accept Failure (which emits remediation).

**Linked**: `../05-Workflow-and-Form-Mapping.md` (HHA / RN sections), `../06-Enforcement-Rules.md` §6.

---

## A6 — How policy acknowledgment works

**Audience**: T1–T3

**Summary**. Each policy is acknowledged once per version per subject via an eCIgn signature bound to the immutable policy hash. No bulk acknowledgments.

**How it works**
- The acknowledgment workflow renders the policy at its pinned version (with content hash visible).
- The subject signs via eCIgn; the signed artifact is watermarked, hashed, and stored.
- The `SignatureRecord` binds to the `PolicyVersionRef` (`{policy_id, version, content_hash}`).
- When a policy is republished, prior acknowledgments for that policy become stale; the engine emits re-acknowledgment units with SLAs per the policy's republish cadence.

**How to do it**
1. Open the acknowledgment unit.
2. Read the policy in the document viewer.
3. Confirm the acknowledgment language and click **Sign**.
4. Complete the eCIgn flow; the unit advances on `SIGNATURE_COMPLETED`.

**Common errors**
- "Stale acknowledgment" → policy was republished; sign the new version.
- "Bulk packet not accepted" → bulk packets are forbidden by design; acknowledge per policy.

**Linked**: `Builder/eCIgn/02-Signature-Workflow.md`, `../06-Enforcement-Rules.md` §5.

---

## A7 — How signatures work (eCIgn)

**Audience**: T1–T3

**Summary**. Every onboarding signature flows through eCIgn and is bound to one of `{PolicyVersion, EvidenceObject, Appointment}` with a hashed, watermarked signed artifact.

**How it works**
- The engine creates a signing envelope referencing the binding and the signer specs.
- Single-signer: subject signs alone (most acknowledgments).
- Multi-signer: sequential or parallel, per `Builder/eCIgn/09-Multi-Signature-Flow.md` (BAA, governance appointments, override grants).
- On completion, eCIgn returns the signed artifact (watermark + hash + timestamp + auth method + IP) and emits `SIGNATURE_COMPLETED` to the engine.

**How to do it**
1. Open the signature unit.
2. Review the document.
3. Click **Sign**; complete identity verification.
4. The signed artifact appears in the unit's Signatures tab; the unit advances.

**Common errors**
- "Signature declined" → re-issue per spec, or escalate.
- "Envelope expired" → re-issue; an audit event records the expiry.
- "Identity verification failed" → check signer profile and auth method.

**Linked**: `Builder/eCIgn/01-System-Architecture.md`, `Builder/eCIgn/06-Outputs-Templates-Watermarks.md`, `Builder/eCIgn/09-Multi-Signature-Flow.md`.

---

## A8 — How audit readiness works

**Audience**: T3–T4

**Summary**. Audit readiness is the projection of every onboarding event into a per-subject dossier and an agency-wide readiness score, queryable on demand and exportable as a watermarked, hash-verifiable PDF.

**How it works**
- All events are appended to a hash-chained audit log; nightly chain verification.
- The Audit Mode "Onboarding lens" projects events + referenced artifacts into per-subject dossiers, policy acknowledgment ledgers, vendor compliance ledgers, governance ledgers, and overrides reports.
- Readiness score is contributed by onboarding completeness, gate compliance, vendor compliance, governance currency, and revalidation freshness; critical-tier gate violations cap the score below green.
- Surveyor questions of the form "qualified to perform X on Y" return Pass/Fail with citations.

**How to do it**
1. Open **Audit & Reporting → Onboarding Lens**.
2. Search by subject; open the dossier.
3. Use **Surveyor Quick Answers** with date + skill picker.
4. Click **Export Signed Dossier (PDF)** when needed.

**Common errors**
- "Hash chain mismatch alert" → engineering escalation; do not export until verified.

**Linked**: `Builder/eCIgn/03-Audit-and-Compliance-Model.md`, `06-Audit-Defensibility-and-Legal-Eligibility.md`.

---

## A9 — How gates work

**Audience**: T2–T4

**Summary**. Gates are machine-enforced clearances that downstream systems consult before acting. They return signed assertions; refusal is itself audited.

**How it works**
- Gate Service evaluates `(gate_id, subject_id, as_of?)` from EvidenceObjects, SignatureRecords, unit states, and active overrides.
- Outcomes: `Pass`, `Fail`, `Conditional`. Reasons are machine-readable codes.
- Reactive re-evaluation occurs on `UNIT_STATE_CHANGED`, `EVIDENCE_CAPTURED`, `SIGNATURE_COMPLETED`, `OVERRIDE_*`. Nightly sweep catches drift (e.g., silent expiry).
- Downstream consumers (Scheduling, Billing, IAM, Vendor Mgmt) MUST refuse on `Fail`/`Conditional`; refusal emits `DOWNSTREAM_REFUSAL`.

**Examples**
- Field Clearance refused for an RN with expired BLS → Scheduling refuses to assign visits; refusal logged.
- Billing Clearance refused for a coder missing FWA training → IAM refuses billing system access.

**Common errors**
- "Conditional with reason `service_unavailable`" → caller MUST refuse; this is a degraded mode.

**Linked**: `../06-Enforcement-Rules.md`, `../System/00-Onboarding-Execution-Architecture.md` §6.

---

## A10 — How overrides work

**Audience**: T3

**Summary**. A failing hard gate may be overridden only by dual eCIgn (Compliance Officer + Administrator), bounded by an explicit validity window, and audited end-to-end. Overrides never apply retroactively.

**How it works**
- The requester opens **Enforcement & Gates → Overrides → Request Override** and selects gate, subject, reason, and `valid_until`.
- Compliance Officer signs first via eCIgn, then Administrator (sequential).
- On both signatures, an `OverrideRecord` becomes Active; `OVERRIDE_GRANTED` event triggers gate re-evaluation.
- At `valid_to`, scheduler emits `OVERRIDE_EXPIRED`; gates re-evaluate and may transition to `Fail` again.
- Active and historical overrides appear on the Audit Readiness dashboard.

**How to do it**
1. Open the failing unit/gate; click **Request Override**.
2. Fill reason and validity window (default ≤ 30 days).
3. Compliance Officer + Administrator complete the multi-sig eCIgn flow.
4. The override appears in the Overrides ledger; downstream systems re-evaluate immediately.

**Common errors**
- "Override request rejected: validity window exceeds policy max" → reduce the window or escalate per policy.
- "Override expired silently" → expected; re-evaluate compliance state and either remediate or re-request.

**Linked**: `../06-Enforcement-Rules.md` §12, `Builder/eCIgn/09-Multi-Signature-Flow.md`.

---

## A11 — How recurring revalidation works

**Audience**: T2–T3

**Summary**. Revalidations are recurring triggers (e.g., annual TB, monthly OIG, HHA in-service) that the engine emits via the Compliance Calendar; they execute as lightweight batches scoped to the recurring requirement(s).

**How it works**
- Each `RoleRequirement` with a recurrence carries an iCal-style RRULE and pre-window alerts (e.g., 60d/30d/14d/7d).
- The Calendar engine fires `CREDENTIAL_EXPIRY_WINDOW` or `ANNUAL_REVALIDATION` triggers at each window.
- The engine creates a Revalidation Batch and emits the necessary units; CES routes them via the Recurring Execution model.
- Window-based escalation (per `../06-Enforcement-Rules.md` §10) tightens as the deadline approaches.

**How to do it**
- Operators do not initiate revalidations; they appear automatically on the Sprint Board and Calendar.
- Complete the unit's evidence + signature as for any onboarding unit.

**Common errors**
- "Revalidation overdue" → the gate (e.g., Field Clearance) has likely transitioned to Blocked; remediate immediately or escalate.

**Linked**: `Builder/Compliance-Execution-Sprints/07-Recurring-Execution.md`, `../03-Onboarding-Execution-Engine.md` §7.

---

## Cross-cutting Articles That Onboarding Depends On

These articles live in their canonical categories per `02-Knowledge-Base-Architecture.md`. Onboarding articles link to them, never duplicate them.

- **Signatures (eCIgn)**: single-signer flow; multi-signer flow; bindings; watermarks/hashes; identity; decline/expiry/re-issue; overrides.
- **Compliance Execution (CES)**: sprint board; bundles; calendar; assignment; recurring execution; sprint planning.
- **Workflows & Evidence**: workflow authoring; evidence types; reconciliation; replay.
- **Forms Library**: authoring; versioning; pinning to policy versions.
- **Policy Lifecycle**: authoring; versioning/hashing; republish behavior.
- **Audit & Reporting**: dossier; surveyor quick answers; export; readiness scoring.
- **Enforcement & Gates**: gate APIs; refusal events; investigations.
- **Troubleshooting**: stuck units; reconciliation surprises; assignment failures; policy republish mid-batch.
- **Developer Reference**: event envelopes; idempotency; replay APIs; webhooks; integration contracts.
