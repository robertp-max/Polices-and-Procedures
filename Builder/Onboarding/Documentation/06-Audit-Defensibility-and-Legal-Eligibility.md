# 06 — Audit Defensibility and Legal Eligibility

> **Purpose**: Document how the onboarding system meets compliance, audit, and legal-eligibility expectations for evidence, signatures, retention, and surveyor validation. This document is a Compliance + Legal artifact intended to support, but not substitute for, agency counsel review.
>
> **Disclaimer**: References to laws and regulations (CMS Conditions of Participation, HIPAA, ESIGN/UETA, state Medicaid programs, OIG/SAM, state nursing boards) are summaries for design intent. Final legal interpretation is the responsibility of agency counsel.

---

## 1. Compliance Posture (Summary)

The system is designed to meet, at minimum:

- **42 CFR §484** — Home Health Conditions of Participation (Administrator/Clinical Manager qualifications §484.105; HHA training/competency/in-service §484.80; QAPI §484.65; Patient Rights and others as relevant).
- **HIPAA Privacy and Security Rules** — workforce training, sanction policy, audit controls, integrity controls, person/entity authentication, transmission security.
- **OIG Compliance Program guidance** for Home Health (seven elements).
- **OIG/SAM/state Medicaid program** exclusion screening (initial + monthly).
- **State nursing board / state professional licensure** primary source verification (PSV).
- **ESIGN Act (15 U.S.C. §§7001 et seq.) and the Uniform Electronic Transactions Act (UETA)** — electronic signatures legally equivalent to handwritten when the consumer-disclosure, consent, and integrity requirements are met.
- **HIPAA §164.312(b)** — audit controls; **§164.312(c)(1)** — integrity; **§164.312(d)** — person/entity authentication.
- **Records retention** per applicable state and federal requirements; default ≥ **7 years** (and **10+ years** where Medicare/Medicaid claims-related).

The system **operationally enforces** these requirements via hard gates, immutable evidence and signature storage, hash-chained audit logs, and a per-subject dossier export pathway.

---

## 2. How the System Meets Compliance Expectations

### 2.1 Role qualification (CMS CoP)

- Each role's compliance obligations are codified in `RoleRequirement` rows tied to specific policy versions (`PolicyVersionRef`) and to workflows that produce verifiable evidence.
- Pre-field, pre-billing, pre-system-access gates **refuse** downstream action when qualifications are not satisfied. Refusal is itself audited (`DOWNSTREAM_REFUSAL`).
- Governance roles (Administrator, CO, Privacy Officer, Security Officer, Medical Director, GB members) are onboarded via formal appointment workflows producing signed appointment letters, qualification evidence, and recurring attestations.
- HHA `WF-HHA-COMPETENCY-12` enforces all 12 CoP subject areas with observed competency, RN observer signature, and rolling 12-hour in-service hours.

### 2.2 HIPAA workforce + access

- HIPAA workforce training is a universal `RoleRequirement` with version-bound acknowledgment.
- System Access Clearance gate refuses provisioning until HIPAA + AUP + Confidentiality + background + exclusion screen are satisfied.
- BAA execution gate (`Vendor Engagement`) refuses PHI access without an executed BAA bound to the current BAA template version.
- Privacy/Security Officer appointment workflows produce signed appointments and risk analysis sign-offs.

### 2.3 OIG / SAM / state exclusion screening

- `WF-EXCLUSION-SCREEN` and `WF-VENDOR-EXCLUSION` produce timestamped, source-attributed records initially and monthly.
- A positive exclusion **cannot** be cleared by override; only removal from the source list resolves the gate.
- Monthly cadence is enforced via `RecurringRule` and the Compliance Calendar; missed checks Block the relevant batch and (for vendors) suspend engagement.

### 2.4 License Primary Source Verification

- `WF-LICENSE-PSV` records the state board source, response timestamp, and response hash.
- Field Clearance gate refuses without a current PSV; pre-expiry escalation tightens at 60/30/14/7/0 days.

### 2.5 QAPI (CoP §484.65)

- QAPI participants are onboarded via `WF-QAPI-ONBOARD`; methodology training and confidentiality are evidenced and signed.
- Member roster, attendance, and contributions are audit-traceable.

---

## 3. How Evidence Is Preserved

### 3.1 Immutability and content addressing

- `EvidenceObject`s are **immutable** once persisted. Edits create new versions linked via supersession.
- Files are stored in **content-addressed object storage** (path = `/<sha256-prefix>/<sha256>`), in a **versioned, write-once bucket** with **object lock** semantics where supported.
- Metadata stores carry the SHA-256 `content_hash` and a structured binding (`subject_id`, `unit_id`, `batch_id`, `policy_version_ref?`, `source`).

### 3.2 Validation

- Every evidence object passes schema validation against its `evidence_schema`.
- Content checks: file integrity, allowed type, OCR-extractability where required, cross-field rules (e.g., name match).
- Rejected evidence emits `EVIDENCE_REJECTED` and reopens the unit; the rejected attempt is preserved as part of the audit record (no silent deletion).

### 3.3 Supersession, not deletion

- Replacing evidence creates a new `EvidenceObject` and a supersession link to the prior; both remain queryable.
- This preserves the historical record needed for surveyor reproducibility.

### 3.4 Retention

- Default retention: **7 years** from the later of `created_at`, `last_referenced_at`, or termination of the related service relationship.
- Claims-adjacent evidence (billing, FN-BC-001-bound): **≥ 10 years** to meet typical Medicare/Medicaid lookback.
- Retention is enforced at storage with object-lock and lifecycle policies; deletion before retention end requires a documented legal hold release.
- Legal holds suspend retention expiry; a hold and its release are both audited events.

---

## 4. How Signatures Are Legally Eligible

### 4.1 ESIGN / UETA conformance (design intent)

The eCIgn pipeline is designed so that signatures meet the conditions typically required for legal equivalence to handwritten signatures:

| Requirement | Implementation |
|-------------|----------------|
| Intent to sign | Acknowledgment language presented; explicit "Sign" action; decline path available |
| Consent to electronic business | Captured at first signing event; recorded as an evidence object; re-confirmed on material change |
| Association of signature with record | `SignatureRecord.binds_to_type` ∈ `{PolicyVersion, EvidenceObject, Appointment}` with the bound artifact's content hash |
| Record retention | Signed artifact stored immutably with content hash; retention per §3.4 |
| Signer identity | Authenticated session; auth method recorded (`auth_method`); IP and timestamp captured |
| Tamper evidence | Signed artifact watermarked + hashed (per `Builder/eCIgn/06-Outputs-Templates-Watermarks.md`); audit chain ties signature to the record |
| Reproducibility | Signed artifact and the signed-version of the underlying record are both preserved and downloadable |

### 4.2 Multi-signer integrity

- Multi-signer flows (BAA, governance appointments, override grants) follow `Builder/eCIgn/09-Multi-Signature-Flow.md`.
- Sequential or parallel ordering is engine-controlled; signers cannot bypass ordering in UI.
- Each signer event is independently audited; the final signed artifact is hashed only after all signers complete.

### 4.3 Decline, expiry, re-issue

- Decline emits `SIGNATURE_DECLINED` with reason; engine reopens or escalates per spec.
- Envelope expiry is recorded; re-issue creates a new envelope with a new audit chain entry.

### 4.4 Paper signatures

- Paper signatures are not accepted as primary signatures. A paper artifact may only be ingested as an **evidence image** under an explicit dual-signed Compliance Officer override; the override and the ingestion are audited.

---

## 5. How the Audit Trail Works

### 5.1 Append-only, hash-chained log

- Every state change emits an `OnboardingAuditEvent` to an **append-only** store.
- Each event carries `prev_hash` (hash of the prior event in its stream) and `event_hash` (hash of its canonical payload).
- Streams are partitioned by entity (e.g., `batch:<id>`); writes are monotonic per stream.

### 5.2 Tamper evidence

- A **nightly chain verifier** walks every stream end-to-end and emits a verification audit event; mismatch alerts engineering and **blocks dossier exports** until reconciled.
- Storage backends use object lock / WORM where supported; database deletes/updates of audit rows are revoked at the role and policy layers.

### 5.3 Replay

- Given any `batch_id` (or any subject + period), the system reconstructs all entities and state transitions deterministically.
- Replay is used for: regression testing, disaster recovery of derived state (Sprint Board, Dossier), and surveyor reproducibility.

### 5.4 Per-subject dossier

- Dossier = projection of audit events for a `subject_id` enriched with referenced `EvidenceObject`s and `SignatureRecord`s.
- Export produces a watermarked, hash-verifiable PDF; the export is itself audited (`DOSSIER_EXPORTED` with exporter, scope, recipient hint).

---

## 6. How Policy Versioning Is Enforced

- Policies are versioned and content-hashed at publish time.
- `OnboardingTemplate` pins `PolicyVersionRef`s; templates are immutable once published.
- Acknowledgments bind to the exact `PolicyVersionRef` signed; the dossier shows which version a subject acknowledged.
- A `POLICY_VERSION_CHANGE` event triggers:
  - Recompute of affected templates → new template version.
  - Auto-emission of re-acknowledgment / re-training units to affected subjects with SLAs per the policy's republish cadence.
  - Stale acknowledgments degrade applicable gates per policy until re-signed.

---

## 7. How the System Supports Surveyor Validation

- **Surveyor Quick Answers** in the Audit Readiness View answer typical questions in one click:
  - "Was {subject} qualified to perform {skill} on {date}?"
  - "What policy version did {subject} acknowledge for {policy} on or before {date}?"
  - "What overrides were active in {period}?"
  - "Show vendor compliance status as of {date}."
- **Signed dossier export** produces a watermarked, hash-verifiable PDF for surveyor delivery; the export is audited.
- **Replay** allows a surveyor (read-only) to reproduce the system's state at any historical moment.
- **Per-policy ledgers** (acknowledgments, vendor BAA, governance appointments, exclusion screens, training) are queryable by date range.

---

## 8. Integrity Controls Catalog

| Control | Mechanism |
|---------|-----------|
| Audit log integrity | Append-only + hash chain + nightly verifier + WORM storage |
| Evidence integrity | Content-addressed object storage; SHA-256 hash; supersession links; no deletion |
| Signature integrity | eCIgn watermark + hash on signed artifact; binding to PolicyVersion/EvidenceObject |
| Identity integrity | Authenticated sessions; `auth_method`/`ip`/`ts` per signature; MFA where configured |
| Policy integrity | Versioned + hashed at publish; immutable; pinned by templates |
| Workflow integrity | Versioned + immutable; replayable steps |
| Template integrity | Versioned + immutable; pins policy + workflow versions |
| Gate integrity | Pure functions of state at `as_of`; signed assertions to callers |
| Override integrity | Dual eCIgn (CO + Admin); bounded validity; audited grant + expiry |
| Retention integrity | Object lock + lifecycle policies; legal hold workflow |
| Export integrity | Watermark + hash + audit event on export; chain verification gate before export |

---

## 9. Assumptions for Legal Eligibility (eCIgn)

These assumptions are recorded so agency counsel can confirm or adjust:

1. The agency operates in jurisdictions where **ESIGN/UETA** apply and electronic signatures are legally equivalent to handwritten signatures for the documents in scope.
2. The agency has captured **prior consent to electronic business** from each signer (initially and on material change).
3. eCIgn meets the **identity verification standard** required by the document type (e.g., higher-assurance methods for BAA and governance appointments).
4. The agency retains the **signed record** in a form capable of accurate reproduction for the retention period in §3.4.
5. The agency's **internal sanction policy** and **HR processes** support enforcement of refusal events (e.g., access denials, scheduling refusals).
6. State-specific overlays (e.g., notarization requirements for certain documents) are handled outside eCIgn or via eCIgn's notary modules where applicable.
7. The agency has **legal hold procedures** that integrate with the system's hold workflow before any retention-expiry deletion.

Where any assumption is not met, the affected document type must be excluded from the eCIgn pipeline pending mitigation.

---

## 10. Surveyor-Ready Operating Posture

- **Always-green checklist for the Compliance Officer**:
  - Hash chain verifier: passing for the last 24 hours.
  - Active overrides: zero unbounded; all within validity.
  - Critical-tier gate violations: zero.
  - Vendor monthly exclusion checks: 100% on time.
  - Governance appointments: all current.
  - Stale acknowledgments after policy republish: within SLA.
  - Per-subject dossier export sample: hashes verify.

If any of the above is amber/red, the readiness score reflects it and the dashboard surfaces remediation paths.

---

## 11. Document Control

- This document is reviewed at least annually by the Compliance Officer.
- Material changes (e.g., retention period changes, eCIgn vendor change, new state of operation) trigger an immediate review and a new version.
- Counsel sign-off is recorded as an evidence object on this document's version.
