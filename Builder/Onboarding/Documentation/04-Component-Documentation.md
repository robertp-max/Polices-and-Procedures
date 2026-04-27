# 04 — Component Documentation

> **Scope**: Each onboarding UI component as a runtime contract. Visual spec lives in `../12-UIUX-Design-Specification.md`; this document specifies **purpose, data inputs, user actions, compliance behavior, enforcement, and integration points** for each component.
>
> **Components covered**:
> 1. Onboarding Dashboard
> 2. Role-Based Activation Screen
> 3. Onboarding Execution Batch View
> 4. Evidence & Forms Panel
> 5. Competency Validation View
> 6. Signature / Acknowledgment View
> 7. Audit Readiness View (Per-Subject Dossier)

For each component the contract is: **inputs → user actions → events emitted → enforcement → integrations**.

---

## 1. Onboarding Dashboard

**Purpose**. Operational overview of all onboarding activity, tied to the agency-wide readiness score.

**Data inputs**
- Aggregate counts: Active Batches, Pending Activation, At Risk, Blocked, Awaiting Signature, Awaiting Evidence, Completed (period), Active Overrides.
- Live feed of recent state-change audit events.
- Tabbed lists: New Hires, Role Changes, Reactivations, Revalidations, Vendors, Governance.
- Readiness contribution from onboarding (radial gauge + sub-bars).
- Filters: domain, role, owner, sprint, due window, risk.

**User actions**
- Click KPI tile → filtered Batches list.
- Click row → Execution Batch View.
- Click feed item → unit-anchored Batch View.
- Save filtered view; share via deep link.

**Compliance behavior**
- Surfaces hard-gate violations and active overrides as first-class counters.
- Never surfaces "complete" as a green state when any critical-tier gate is in violation.

**Enforcement rules**
- Read-only surface; no completion or override actions originate here.
- Permissions: any role with onboarding visibility; sensitive counters (overrides) only to Compliance Officer + Administrator.

**Integration points**
- CES Sprint Board (bundle counts).
- Compliance Calendar (upcoming deadlines).
- Audit Mode (live audit feed).
- Help Center (contextual articles).

---

## 2. Role-Based Activation Screen

**Purpose**. Initiate onboarding for a subject by selecting role(s) and trigger type. Single-page; no wizard.

**Data inputs**
- Subject card (workforce or vendor).
- Trigger types: NEW_HIRE, ROLE_CHANGE, REACTIVATION, VENDOR_ONBOARD, GOVERNANCE_APPOINTMENT.
- Role picker (multi).
- Effective date.
- Scope: service line(s), branch, patient population(s).
- Template preview: template ID + version, requirement count, estimated SLA, gate impact.
- Reconciliation preview: requirements that will be suppressed and the source evidence + reason.

**User actions**
- Select trigger, role(s), effective date, scope.
- Inspect template + reconciliation previews live.
- Click **Activate** → confirmation modal with audit-event preview → emits trigger.

**Compliance behavior**
- Confirmation modal makes the audit consequence explicit.
- Reconciliation is visible **before** activation; nothing is silently suppressed.
- Activation cannot proceed without all required inputs.

**Enforcement rules**
- Permission: Compliance Officer or delegate.
- The engine refuses duplicate activations for the same `(subject, trigger_type)` while a prior batch is non-terminal.

**Integration points**
- Engine: emits `TRIGGER_RECEIVED`; subsequent events drive routing to Batch View.
- Catalog: Templates, RoleRequirements.
- Evidence index: for reconciliation preview.

---

## 3. Execution Batch View

**Purpose**. Single source of truth for one batch — its units, gates, evidence, signatures, and audit timeline.

**Data inputs**
- Batch header: subject, roles, template version, trigger, status, owner, due, readiness contribution.
- Gate strip: Field / Billing / System Access / Vendor / Governance — state, missing-count, last evaluation timestamp.
- Phase sections (accordion): Pre-Hire → Orientation → Training → Competency → Acknowledgments → Clearance → Post-Activation.
- Per-unit row: name, workflow, due, status, evidence count, signature count, owner, last action.
- Side panel: full Batch Audit Timeline (filterable).

**User actions**
- Open unit drawer (Overview / Evidence / Signatures / Audit Timeline).
- Reassign owner (permissioned).
- Withdraw batch (permissioned, audited).
- Request Override (Compliance Officer; opens dual eCIgn flow).
- Export Audit Timeline (CSV or signed PDF).

**Compliance behavior**
- Blocked units display the failing gate inline with a "View gate" link.
- Overrides are visually distinct (orange border + lock icon) and time-bounded.
- A unit row never offers a "mark complete" action; completion always passes through evidence + signature.

**Enforcement rules**
- Permissions: Read — assignees + supervisors + CO/Admin; Withdraw + Override — CO/Admin (multi-sig where applicable).
- All sensitive actions require confirmation + audit-event preview.

**Integration points**
- CES: bundle/unit state mirroring.
- eCIgn: signature flows from unit drawer.
- Evidence Service: evidence capture from unit drawer.
- Audit Mode: timeline source.

---

## 4. Evidence & Forms Panel

**Purpose**. Capture, validate, and manage evidence objects for a unit.

**Data inputs**
- Required evidence list (schema-driven from `evidence_schema`).
- Per-row status: Pending / Valid / Rejected / Superseded.
- Capture controls per object_type: Forms-library form, file upload, "Pull from {source}", system attestation.
- Bound policy strip (when applicable).
- History: prior versions and rejection reasons (supersession chain).

**User actions**
- Submit form, upload file, trigger external pull, or attest.
- Inspect validation feedback inline; correct and resubmit.
- View history; re-capture to supersede.

**Compliance behavior**
- A unit may not enter `Completed` until every required evidence object is `Valid`.
- Forms render at their pinned version; ad hoc inline form authoring is forbidden.
- Rejected evidence emits `EVIDENCE_REJECTED` and reopens the unit.
- Every accepted evidence is hashed and bound to subject, unit, batch, policy version.

**Enforcement rules**
- Permissions: assignee + delegated approvers; CO/Admin override only via formal Override flow.
- File integrity checks (size, type, OCR-ability where required) are mandatory.

**Integration points**
- Forms library (form rendering and versioning).
- Evidence Service (validation, persistence, hashing, indexing).
- Policy library (PolicyVersionRef binding).

---

## 5. Competency Validation View

**Purpose**. Execute and record observed competency validation, dual-signed by observer and subject.

**Data inputs**
- Skill grid from `Competency.skills` at pinned version.
- Observer (resolved by qualification rules).
- Setting selector: Patient / Simulated.
- Per-skill: pass / fail / needs-remediation, notes, attempt counter.
- Pass criteria evaluator (live).

**User actions**
- Score each skill; add notes.
- Finalize → triggers dual eCIgn (observer + subject).
- View linked remediation sub-batch on failure.

**Compliance behavior**
- An unqualified observer cannot be selected.
- Partial completion cannot be saved as Completed.
- Failure increments `attempts[]` and emits a remediation sub-batch automatically; Field Clearance remains Blocked.
- Outcome persists as a `CompetencyArtifact` evidence object plus dual signatures.

**Enforcement rules**
- Permissions: only qualified observers may finalize.
- Dual signatures are mandatory; the unit cannot complete with one signature.

**Integration points**
- eCIgn (dual signature flow).
- Evidence Service (`CompetencyArtifact` persistence).
- Engine (remediation sub-batch emission).

---

## 6. Signature / Acknowledgment View

**Purpose**. Capture eCIgn signatures bound to a `PolicyVersion`, `EvidenceObject`, or `Appointment`.

**Data inputs**
- Document viewer: the policy at pinned version (with content hash visible) or the evidence artifact being signed.
- Signer strip: current signer + remaining signers (for multi-sig) with order indicator.
- Acknowledgment language per policy/spec.

**User actions**
- Read the document.
- Sign (single-signer) or wait for next signer (multi-sig sequential).
- Decline (with reason) where permitted.

**Compliance behavior**
- Signed artifacts are watermarked + hashed; metadata pane shows timestamp, IP, auth method.
- Decline emits `SIGNATURE_DECLINED`; engine reopens or escalates per spec.
- Multi-sig progress is visible in real time across the dashboard.

**Enforcement rules**
- Identity verification per eCIgn auth policy.
- Permissions: only the named signers; delegations must be configured at the engine layer, not bypassed in UI.

**Integration points**
- eCIgn Integration Service (envelope creation, signer events, signed artifact storage).
- Audit (every signer event audited).

---

## 7. Audit Readiness View (Per-Subject Dossier)

**Purpose**. Surveyor-grade per-subject record. One-click answer to "qualified to perform X on Y".

**Data inputs**
- Subject header + role timeline (history of role assignments).
- Tabs: Credentials, Acknowledgments, Competencies, Trainings, Gates, Overrides, Evidence.
- Surveyor Quick Answers panel (date + skill picker).

**User actions**
- Browse tabs.
- Run Surveyor Quick Answer queries.
- Export signed dossier (watermarked PDF) or CSV (per tab).

**Compliance behavior**
- All artifact links resolve to eCIgn-signed assets with watermark + hash.
- Dossier export emits an audit event recording exporter, scope, and recipient hint.
- Hash chain integrity is checked at export time; mismatch blocks the export and alerts engineering.

**Enforcement rules**
- Permissions: Compliance Officer, Administrator, Auditor (read); export logged regardless of role.
- No PHI export without explicit data-classification acknowledgment.

**Integration points**
- Audit Event Store (projection).
- Evidence + Signature stores (artifact retrieval).
- eCIgn (signed dossier output via signing pipeline).

---

## Cross-Component Contracts

- **Status pills, gate tiles, signer strips, override badges, audit timeline items** behave identically wherever they appear.
- **Subject chips** click → Audit Readiness View (dossier).
- **Unit rows** click → Unit Drawer / Batch View — same in CES Sprint Board and Onboarding.
- **Help "?"** affordance on every surface opens the topical Help Center article in a side drawer.
- **Notifications** appear in-shell first; email is fallback.
- **Keyboard**: J/K row navigation, `g d` Dashboard, `g b` Batches, `/` global search.

---

## Anti-Patterns Forbidden in All Components

- Wizards / steppers.
- "Mark complete" buttons that bypass evidence/signature.
- Standalone calendar or task list outside Compliance Calendar / Sprint Board.
- Inline form authoring.
- Color used as the sole conveyor of status.
- Playful illustrations, mascots, or progress confetti.
