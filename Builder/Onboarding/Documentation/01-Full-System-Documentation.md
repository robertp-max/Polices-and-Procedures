# 01 — Full System Documentation

> **Audience**: Engineers, Compliance Officers, Administrators, Implementers, Auditors.
> **Scope**: The entire onboarding compliance activation system as a runtime, including its integration with CES, eCIgn, the Policies & Procedures library, the Forms library, the Compliance Calendar, and the Audit Mode.
>
> **References**:
> - Strategic architecture: `../00-README.md` and docs `01–12` in `Builder/Onboarding/`
> - Execution architecture: `../System/00-Onboarding-Execution-Architecture.md`
> - CES: `Builder/Compliance-Execution-Sprints/`
> - eCIgn: `Builder/eCIgn/`
> - Policies: `Builder/Policies/`

---

## 1. System Purpose

The Onboarding system is the **Compliance Activation Engine** for Care Indeed Home Health. When a person, vendor, or governance role enters, changes, returns, or revalidates, the system **deterministically generates the compliance work** required by the agency's policies and routes it through the Compliance Execution Sprint System (CES) until every required evidence object and signature exists, every required gate passes, and the result is sealed in an audit-defensible per-subject dossier.

Onboarding is **not** a checklist, **not** a wizard, and **not** an HR paperwork flow. It is the entry point through which compliance becomes operational reality.

### Outcomes the system guarantees

- Every workforce member, vendor, and governance role is onboarded against a versioned, role-specific requirement template tied to current policy versions.
- Every requirement produces structured evidence and (where applicable) an eCIgn-bound signature.
- Every required gate (Field Clearance, Billing Clearance, System Access Clearance, Vendor Engagement, Governance Active) is enforced before downstream systems may act.
- Every action is appended to a hash-chained audit log replayable to any historical state.
- A surveyor question of the form *"how was this person qualified to perform X on date Y"* is answerable in one click.

---

## 2. Architectural Layers

```
L0  Trigger Sources         HRIS · Admin UI · Calendar · Policy Library · Vendor Mgmt · Governance
L1  Onboarding Engine       Profile / Template / Requirement / Batch / Unit lifecycle
L2  Workflow Orchestrator   Per-requirement WF-* execution
L3  Evidence + Signature    Evidence Service · eCIgn Integration
L4  Gate Evaluation         Field / Billing / System Access / Vendor / Governance
L5  CES Adapter             Sprint Board · Compliance Calendar · Assignment · Recurring Execution
L6  Audit / Event Store     Append-only, hash-chained
L7  Closure                 Compliance Officer attestation · readiness scoring · dossier seal
```

Each layer is an independently scalable service that emits typed events. No layer reaches across layers; communication is event-driven (durable bus) plus typed RPC for synchronous queries (e.g., gate evaluation).

Detailed layer specs: `../System/00-Onboarding-Execution-Architecture.md` §2 and §3.

---

## 3. Execution Flow

The end-to-end flow is the runtime realization of `../11-Workflow-Architecture.md`.

```
Trigger ──► Engine ──► Batch ──► Units ──► Workflows ──► Evidence/Signature ──► Gates ──► CES ──► Audit ──► Closure
```

Concretely, on a `NEW_HIRE` for an RN:

1. HRIS emits `TRIGGER_RECEIVED { type: NEW_HIRE, subject, role: RN, branch, hire_date }`.
2. Engine resolves an `OnboardingProfile` (subject, roles, scope, supervisor).
3. Requirement Resolution selects `OnboardingTemplate TPL-RN-NEW-HIRE@vN`, expands the requirement set from `02-Policy-Aligned-Onboarding-Model.md` §3.3, applies scope filters, and reconciles against existing valid evidence.
4. Execution Batch Generator transactionally creates `OnboardingExecutionBatch` plus one `OnboardingExecutionUnit` per requirement (workflow ID + version pinned, assignee resolved by CES).
5. Workflow Orchestrator runs each `WF-*`. Steps capture evidence (Evidence Service) and signatures (eCIgn Integration), each bound to the policy version in force.
6. Gate Service continuously re-evaluates Field Clearance / Billing Clearance / System Access Clearance for the subject; downstream systems (Scheduling, Billing, IAM) consult these gates and refuse non-compliant actions.
7. CES Adapter mirrors bundle/unit state on the Sprint Board and writes Compliance Calendar entries for due dates and credential expiry windows.
8. On full satisfaction, Compliance Officer attests (eCIgn) → `BATCH_COMPLETED` → readiness score updated, dossier sealed.

Recurring revalidations (TB, BLS, license, monthly OIG, HHA in-service hours, annual COI) follow the identical pipeline via the Recurring Execution model in CES.

---

## 4. Data Model Overview

Authoritative spec: `../08-Data-Model.md`. Summary:

- **Subjects**: `WorkforceMember`, `Vendor`, `Role`.
- **Catalog**: `RoleRequirement`, `PolicyVersionRef`, `SignatureSpec`, `Cadence`, `Gate`, `Competency`, `Skill`, `PolicyAcknowledgmentRequirement`, `EvidenceRequirement`.
- **Runtime**: `OnboardingProfile`, `OnboardingTemplate` (versioned, immutable), `OnboardingExecutionBatch`, `OnboardingExecutionUnit`.
- **Evidence + Signature**: `EvidenceObject` (immutable, hashed, content-addressed), `SignatureRecord` (eCIgn-bound).
- **Audit + Governance**: `OnboardingAuditEvent` (append-only, hash-chained), `GateEvaluation`, `OverrideRecord`.
- **Recurring + Calendar**: `RecurringRule`, `CalendarEntry`.

Critical constraints:
- Versioned objects are immutable once published.
- Evidence and signatures are immutable; new versions supersede via explicit links.
- Audit events are append-only; corrections occur via forward compensating events.
- All FK references must resolve at write time.

---

## 5. Service Architecture

| Service | Owns | Emits |
|---------|------|-------|
| Trigger Intake | `TriggerEnvelope` records | `TRIGGER_RECEIVED` |
| Onboarding Engine | Profile, Batch, Unit lifecycle | `PROFILE_RESOLVED`, `BATCH_CREATED`, `UNIT_CREATED`, `UNIT_STATE_CHANGED`, `BATCH_COMPLETED`, `OVERRIDE_*` |
| Requirement Resolution | None (read-only over catalog + evidence index) | `TEMPLATE_SELECTED`, `REQUIREMENT_RESOLVED`, `REQUIREMENT_VERIFIED_BY_RECONCILIATION` |
| Execution Batch Generator | Materialization transactions | `REQUIREMENT_EMITTED` |
| Workflow Orchestrator | Workflow runtime per unit | `STEP_*`, `UNIT_STATE_CHANGED` (terminal) |
| Evidence Service | `EvidenceObject`s + storage | `EVIDENCE_CAPTURED`, `EVIDENCE_REJECTED` |
| eCIgn Integration | `SignatureRecord`s + envelopes | `SIGNATURE_REQUESTED`, `SIGNATURE_COMPLETED`, `SIGNATURE_DECLINED` |
| Gate Evaluation | None (pure read) | `GATE_EVALUATED` |
| CES Adapter | Bridge state | `CES_BUNDLE_INJECTED`, `CES_UNIT_INJECTED`, `CES_CALENDAR_ENTRY_CREATED`, `CES_OWNER_CHANGED` |
| Audit / Event Store | Append-only event log | n/a (terminal sink) |

Boundaries are non-negotiable: no service reads or writes another service's tables.

---

## 6. Event System

A durable, ordered-per-partition message bus carries every state change. Events use the canonical envelope (event_id, stream, sequence, prev_hash, event_hash, occurred_at, actor, subject_id, batch_id, unit_id, idempotency_key, payload, schema_version).

- **Partitioning key**: `subject_id` (preserves causal order per subject).
- **Delivery**: at-least-once; consumers idempotent via `(stream, sequence)` and operation-specific idempotency keys.
- **DLQ**: poison messages route to a dead-letter queue with on-call alerting.
- **Tracing**: `correlation_id` set at trigger intake propagates through every downstream event.

Full event catalog: `../System/00-Onboarding-Execution-Architecture.md` §3.

---

## 7. State Machines

### Batch
`PendingActivation → InProgress → {AtRisk | AwaitingEvidence | AwaitingSignature | Blocked} ↔ InProgress → Completed | Withdrawn`

### Unit
`NotStarted → InProgress → {AwaitingEvidence | AwaitingSignature | Blocked} → Completed | Failed | Suppressed`

Detail (transitions, blockers, escalations): `../System/00-Onboarding-Execution-Architecture.md` §4.

A unit may not enter `Completed` unless all required evidence is Valid and all required signatures are Signed. A batch may not enter `Completed` unless all required gates Pass and a Compliance Officer attestation (eCIgn) is captured.

---

## 8. CES Integration

CES is the canonical execution surface. Onboarding never owns its own task list, calendar, or assignment model.

| Onboarding | CES |
|------------|-----|
| `OnboardingExecutionBatch` | CES Bundle (source = Onboarding) |
| `OnboardingExecutionUnit` | CES Sprint Execution Unit |
| Unit `due_at` / recurring rule | Compliance Calendar entry |
| Assignee | Resolved by CES Assignment Model |
| Escalation | Routed through CES Enforcement |

State sync is event-driven and bidirectional. Sprint planning auto-includes onboarding bundles per due windows.

Full integration: `../04-CES-Integration.md`.

---

## 9. eCIgn Integration

Every onboarding signature flows through eCIgn.

- **Single-signer**: policy acknowledgments, individual attestations.
- **Multi-signer**: BAA execution, governance appointments, override grants (Compliance Officer + Administrator).
- **Bindings**: each `SignatureRecord` binds to one of `{PolicyVersion, EvidenceObject, Appointment}` with the bound artifact's content hash.
- **Outputs**: signed artifact (watermarked, hashed), `SignatureRecord`, audit event.
- **Stale acknowledgments**: when a policy is republished, prior acknowledgments become stale and the engine emits re-ack units.

Multi-signer flow contract: `Builder/eCIgn/09-Multi-Signature-Flow.md`. Watermark/hash contract: `Builder/eCIgn/06-Outputs-Templates-Watermarks.md`.

---

## 10. Audit System

The audit system is the **sole source of truth** for "what happened, when, by whom, on what version".

- Append-only, hash-chained per stream (`stream = batch:<id>` typical).
- Nightly chain verifier; verification result is itself audited.
- Replayable: any historical batch can be reconstructed deterministically.
- Per-subject dossier is a projection from the audit stream + referenced evidence/signatures.
- Dossier export is watermarked, hash-verifiable, and the export itself emits an audit event.

This is the mechanism by which the system meets surveyor reproducibility and audit-defensibility requirements (see `06-Audit-Defensibility-and-Legal-Eligibility.md`).

---

## 11. Enforcement Gates

Hard, machine-enforced gates make onboarding compliance real.

| Gate | What it enforces | Downstream consumer |
|------|------------------|---------------------|
| Field Clearance | License PSV, BLS, TB, drug screen, OIG/SAM, background, role competency, HIPAA + COC + AUP | Scheduling system |
| Billing Clearance | FN-BC-001 training, FWA, coder credential, confidentiality, HIPAA, AUP | Billing system / IAM |
| System Access Clearance | HIPAA workforce, AUP, confidentiality, background, OIG/SAM | IAM / provisioning |
| Vendor Engagement | BAA executed (current version), exclusion clean, insurance current | Vendor Mgmt |
| Governance Active | Administrator/CO/Privacy/Security/MD appointment current, attested | Operations actions requiring governance sign-off |

A failing gate **blocks** the action. Overrides require dual eCIgn (Compliance Officer + Administrator), are time-bounded, and are visible on the readiness dashboard.

Full rules: `../06-Enforcement-Rules.md`. Runtime contract: `../System/00-Onboarding-Execution-Architecture.md` §6.

---

## 12. Policy Integration (Critical)

Policies are the **source of obligation**. Onboarding never invents a requirement. The chain is:

```
Policy (versioned, hashed)
   → PolicyVersionRef pinned in OnboardingTemplate
   → Requirement materialized into OnboardingExecutionUnit
   → Evidence + Signature bound to the same PolicyVersionRef
   → Audit event records the binding
```

Implications:

- **Republishing a policy** triggers a `POLICY_VERSION_CHANGE` event → the engine recomputes affected templates and emits re-acknowledgment / re-training units with SLAs per the policy's republish cadence.
- **Bulk acknowledgments are forbidden**. One signature per policy per version per subject.
- **Dossier traceability**: for any signed acknowledgment, the dossier shows the exact policy version (with content hash) the subject signed.
- **Drift detection**: gate evaluations factor in policy version currency. If a subject's acknowledgment is for a stale version, the gate may degrade until re-acknowledged.

Source policies are catalogued under `Builder/Policies/` (EN, CL, OP, FN, RM, CO, IT, QA, HR domains).

---

## 13. Compliance Rationale (CMS / Audit Defensibility)

The architecture is built to satisfy, at minimum, the following expectations:

| Source / Expectation | How the system satisfies it |
|----------------------|------------------------------|
| 42 CFR §484.105 — Administrator and Clinical Manager qualifications | Governance appointments produce signed appointment letters, qualification evidence, and recurring attestations; Governance Active gate enforces currency. |
| 42 CFR §484.80 — Home Health Aide training, competency, in-service | HHA workflows enforce the 12 subject areas, observed competency, RN observer signature, and 12-hour rolling in-service tracking. |
| 42 CFR §484.65 — QAPI | QAPI participant onboarding produces roster entries, confidentiality signatures, and methodology training records; participation is auditable. |
| HIPAA Privacy & Security workforce training | HIPAA workforce training is a universal requirement with version-bound acknowledgment; System Access Clearance gates provisioning. |
| OIG/SAM/state Medicaid exclusion screening | Initial + monthly exclusion checks with timestamped, source-attributed evidence; vendor and workforce coverage. |
| Primary Source Verification of professional licensure | License PSV workflow records the state board source, timestamp, and hash; Field Clearance refuses without current PSV. |
| Policy acknowledgment defensibility | Per-policy, per-version eCIgn signatures bound to immutable policy hashes; auditable per subject. |
| Surveyor reproducibility | Replayable audit stream + per-subject dossier export with hash-verifiable artifacts. |
| Records retention | Immutable storage of evidence and signed artifacts; retention policy ≥ 7 years per `06-Audit-Defensibility-and-Legal-Eligibility.md`. |

The system is designed to make non-compliance **operationally impossible** within its scope: hard gates refuse non-compliant downstream actions and the refusal is itself audited.

---

## 14. How the System Enforces Compliance, End to End

1. **Obligation** is sourced from a policy version (immutable, hashed).
2. **Template** pins the obligation to a role and trigger.
3. **Engine** materializes the obligation into a unit on every applicable trigger.
4. **Workflow** captures structured evidence and signatures bound to the same policy version.
5. **Gate** refuses any downstream action until the obligation is satisfied (and re-evaluates on every change).
6. **Audit** records every step in a tamper-evident log.
7. **Dossier** projects the audit + artifacts into a surveyor-ready record.

There is no path from "person hired" to "person performing regulated work" that bypasses any of these steps without an explicit dual-signed, time-bounded, audited override.

---

## 15. How Evidence Is Generated

- **Forms library** renders pinned form versions; submissions become `EvidenceObject`s with structured fields and a content hash.
- **File uploads** (e.g., license card, BLS card, TB result) are validated (size, type, OCR-ability where required), hashed, and persisted to immutable, content-addressed object storage.
- **External system pulls** (e.g., state board PSV, exclusion check API) are recorded with source, timestamp, and response hash.
- **System attestations** (e.g., "user completed training module v3.2 in 12m04s with quiz score 9/10") are persisted as structured records with content hash.

Every evidence object binds to subject, unit, batch, and (where applicable) policy version. Rejected evidence emits a rejection audit event and reopens the unit for re-capture.

---

## 16. How Signatures Are Captured

- The engine creates an eCIgn signing envelope referencing the binding (PolicyVersion / EvidenceObject / Appointment).
- eCIgn handles identity verification, single- or multi-signer ordering, and produces a signed artifact (watermarked, hashed).
- On signer events, eCIgn emits callbacks; the engine updates unit state and audit.
- Multi-signer flows (BAA, appointments, overrides) follow `Builder/eCIgn/09-Multi-Signature-Flow.md` exactly.
- Paper signatures and generic e-sign are not accepted as primary signatures; paper artifacts may only be ingested as evidence images under an explicit, dual-signed Compliance Officer override.

---

## 17. How Audit Readiness Is Achieved

- Every batch contributes to the agency-wide readiness score.
- Critical-tier gates (e.g., Field Clearance violations) cap the score at non-green if violated.
- The Audit Mode "Onboarding lens" exposes per-subject dossiers, policy acknowledgment ledgers, vendor compliance ledgers, governance ledgers, and overrides reports.
- Surveyor questions in `../09-Help-Center-and-User-Manual-Plan.md` §3.13 are answerable in ≤ 1 click.
- Dossier export produces a watermarked, hash-verifiable PDF; the export is itself audited.

---

## 18. How the System Prevents Non-Compliant Work

- Scheduling cannot assign a clinician without `field_clearance(subject, date) = Pass`.
- Billing/IAM cannot grant access without `billing_clearance(subject) = Pass` / `system_access_clearance(subject) = Pass`.
- Vendor Mgmt cannot engage a vendor without `vendor_engagement_clearance(vendor) = Pass`.
- Operations actions requiring Administrator/CO/MD sign-off cannot proceed without `governance_active(role) = Pass`.
- Each gate evaluation returns a signed assertion; downstream refusal is itself an audit event (`DOWNSTREAM_REFUSAL`), so attempts to act non-compliantly are visible.

---

## 19. Where to Read More

- Strategic architecture: `../00-README.md` and docs `01–12`.
- Execution architecture: `../System/00-Onboarding-Execution-Architecture.md`.
- Knowledge base structure: `02-Knowledge-Base-Architecture.md`.
- Article catalog: `03-Knowledge-Base-Articles.md`.
- UI components: `04-Component-Documentation.md`.
- Role-based user manual: `05-End-User-Manual.md`.
- Audit defensibility / legal eligibility: `06-Audit-Defensibility-and-Legal-Eligibility.md`.
