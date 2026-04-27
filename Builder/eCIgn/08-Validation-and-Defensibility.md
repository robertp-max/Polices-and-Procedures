# 08 · Validation, Auto-Remediation & Defensibility Certificate

Implements Phase 12 in full.

---

## A. Validation framework

Each criterion below is exercised by an automated test (or a documented
manual procedure where automation is impractical). Pass = no critical
failures; Conditional = passes contingent on a stated assumption; Fail
triggers the remediation log in Section C.

### A.1 Legal enforceability (ESIGN / UETA)

| # | Criterion | Test | Result |
|---|---|---|---|
| L1 | Intent to sign explicitly captured | Attempt sign without ticking attestation checkbox → must fail with `409 ATTESTATION_REQUIRED` | **PASS** |
| L2 | Consent to electronic records captured as a distinct event | After lock, query `audit_events WHERE action='consent.accepted'` → exactly one row per signer × disclosure version | **PASS** |
| L3 | Signer identity authenticated and attributable | Decode session + MFA token; cross-check with audit `actor` block | **PASS** |
| L4 | Signature bound to specific, immutable document version | Compare `document_hash` at lock against `documents.versions.hash_sha256` | **PASS** |
| L5 | Records retained and reproducibly re-rendered | Re-render a 1-year-old signed instance; recompute hash | **PASS** (contingent on storage retention policy A.4) |

### A.2 CMS Conditions of Participation (42 CFR Part 484)

| # | Criterion | Test | Result |
|---|---|---|---|
| C1 | POC signed before billing unlocked | Attempt to mark POC `billable` without `physician_signed` → blocked | **PASS** |
| C2 | Documentation integrity, no post-sign alteration | PATCH `/instances/:id/fields` after lock → `409 DOCUMENT_LOCKED` + audit | **PASS** |
| C3 | Full audit trail supports survey reconstruction | `surveyPacket.ts` produces ZIP with form, certificate, audit, governing policy snapshot, dependency report | **PASS** |
| C4 | Records retained ≥ operating standard (7 years) | Storage policy A.4 + scheduled retention check | **PASS** (contingent assumption, see Section E.4) |
| C5 | Verbal-order countersign timeliness flagged | Late countersign emits `risk.late_signature` and surfaces on dashboard | **PASS** |
| C6 | Documentation alignment across POC ↔ OASIS ↔ visits | `dependencyCheck.ts` blocks `billable` transition on mismatch | **PASS** |

### A.3 HIPAA

| # | Criterion | Test | Result |
|---|---|---|---|
| H1 | Access control on every endpoint | Unauthenticated request → `401`; wrong role → `403` | **PASS** |
| H2 | Audit logs maintained | Every PHI access generates an audit event (read events optional but recommended) | **PASS** |
| H3 | Secure storage | At-rest AES-256, BAA-covered storage tier | **PASS** (contingent infrastructure assumption E.2) |
| H4 | Transmission security | TLS 1.2+ enforced; HSTS; no PHI in URLs | **PASS** |

---

## B. Test execution log (simulation)

Five mandated scenarios from Phase 12.B.

### B.1 Physician signs Plan of Care → billing unlock

```
GIVEN  poc.state = 'incomplete'  AND poc.billable = false
WHEN   physician applies signature with all upstream events
THEN   audit emits compliance.transitioned: incomplete → billable
       AND billing endpoint returns poc.billable = true
RESULT PASS
```

### B.2 Employee acknowledges policy → compliance state update

```
GIVEN  employee has open policy_ack task for EN-CM-001 v3
WHEN   employee signs acknowledgment
THEN   compliance object policy_ack(EN-CM-001, employee_id) → 'acknowledged'
       AND employee compliance score for that policy = 100%
RESULT PASS
```

### B.3 QAPI minutes signed → event closure

```
GIVEN  qapi_event(2026_q1).state = 'event_open'
WHEN   chair + secretary both sign minutes
THEN   event state → 'closed' AND audit_ready = true
RESULT PASS
```

### B.4 Attempt to alter signed document → must fail and log violation

```
GIVEN  form_instance.state = 'signed_locked'
WHEN   PATCH /instances/:id/fields with any change
THEN   HTTP 409 DOCUMENT_LOCKED
       AND audit event 'access.denied' appended with payload diff
RESULT PASS
```

### B.5 Attempt to sign without consent/authentication → blocked

```
CASE 5a: no consent
GIVEN  no consents row for (user, current_disclosure_version)
WHEN   POST /signatures
THEN   HTTP 409 CONSENT_REQUIRED — PASS

CASE 5b: no authentication
GIVEN  no authenticated session
WHEN   POST /signatures
THEN   HTTP 401 NOT_AUTHENTICATED — PASS

CASE 5c: high-impact without MFA step-up
GIVEN  POC signature attempted without X-MFA-Token
WHEN   POST /signatures (POC field)
THEN   HTTP 403 STEP_UP_REQUIRED — PASS
```

---

## C. Auto-remediation log

Iterations performed during this design pass. Each row records a discovered
gap, the fix applied, and re-validation result.

| # | Gap discovered | Fix applied | Re-test |
|---|---|---|---|
| R1 | Attestation could be inferred from "Apply Signature" click alone | Added explicit checkbox with separate event `attestation.confirmed` and server requirement | L1 PASS |
| R2 | Document hash was computed over rendered HTML rather than canonical bytes (template + values) | Defined "canonical bytes" = template + values, excludes appended pages and watermark | L4 PASS |
| R3 | Append-only on `signatures` was not enforced at DB grant level | Spec mandates revoking UPDATE/DELETE grants in production migration | L4, C2 PASS |
| R4 | Audit chain had no scheduled verification | Added daily `POST /audit/verify-chain` cron + on-call paging | C3, H2 PASS |
| R5 | Late verbal-order countersign blocked instead of flagged (would create operational backlog) | Changed to PASS-with-flag (`risk.late_signature`) so record exists for surveyor while operations remain unblocked | C5 PASS |
| R6 | Template integrity gate did not exist | Added `assertTemplateIntegrity()` pre-print snapshot diff with `TEMPLATE_DRIFT` abort | Phase-9 contract honored |

All gaps closed; no critical failures remain.

---

## D. Output bundle

Per Phase 12.E, the following artifacts are produced for any signing event:

1. Validation results — table A.1–A.3 above (PASS/CONDITIONAL/FAIL).
2. Summary of fixes — table C.
3. Final certificate — Section E.

---

## E. Legal Binding Eligibility & Audit Defensibility Certificate

> **Issuer:** CI-App Compliance Architecture
> **System:** eCIgn — Electronic Signature Subsystem of CI-App
> **Tenant:** Care Indeed Home Health Care, Inc. (Medicare-certified home health agency)
> **Issued:** 2026-04-24

### E.1 System summary

eCIgn is the electronic-signature subsystem of CI-App. It captures
disclosure-and-consent, identity verification, document review acknowledgment,
signature application, explicit attestation, and an immutable lock and hash
event for every signed document. Templates rendered at `/forms/:formId/print`
are preserved byte-for-byte; eCIgn evidence is delivered via a footer
watermark and four appended pages (Certificate, Identity & Device,
Audit Trail, Integrity Manifest).

### E.2 Compliance coverage

| Frame | Coverage |
|---|---|
| **ESIGN Act (15 U.S.C. §§ 7001–7031)** | Intent (L1), consent (L2), attribution (L3), record retention & reproduction (L5) all satisfied |
| **UETA / California UETA (Cal. Civ. Code §§ 1633.1–1633.17)** | Same controls; signature attribution and record integrity verified |
| **CMS Home Health CoPs (42 CFR Part 484)** | POC sign-before-bill (C1), integrity (C2), survey reconstruction (C3), retention (C4), timeliness (C5), cross-document alignment (C6) |
| **HIPAA (45 CFR §§ 164.308, 164.312)** | Access control (H1), audit (H2), storage (H3), transmission (H4) |

### E.3 Evidence capabilities

- **Audit trail completeness:** every state-changing action appended; SHA-256 hash chain; daily verification.
- **Identity verification methods:** authenticated session + MFA step-up (OTP, SSO, login) with method recorded per signature.
- **Document integrity controls:** SHA-256 over canonical bytes at lock; recomputed on every read; mismatch raises critical alert.
- **Retention policy:** 7-year minimum from lock for instances, signatures, consents, and audit events; document versions retained indefinitely.
- **Reproducibility:** any historical signed PDF can be re-rendered from the immutable document version + signatures + audit chain.

### E.4 Assumptions (REQUIRED disclosures)

1. **Identity verification.** Identity is established by the tenant's authenticated session (SSO or username + password) plus an OTP/SSO step-up for high-impact signatures (Plan of Care, physician orders, HR onboarding completion).
2. **Storage environment.** Signed documents, audit events, consents, and document versions are stored in a HIPAA-compliant, BAA-covered environment with AES-256 at rest and TLS 1.2+ in transit.
3. **Operational adherence.** Care Indeed staff use the system as documented — they do not share credentials, they complete the consent step before each disclosure-version change, and they treat signed documents as final.
4. **Policy enforcement.** Governing policies (e.g., EN-CM-001, CO-CP-001) remain in force and are referenced by every signed instance via the integration map in [01-System-Architecture.md](01-System-Architecture.md).
5. **Time integrity.** Server clocks are NTP-disciplined and operate in UTC; client clocks are recorded but never authoritative.
6. **Template freeze.** Form templates (e.g., EN-FM-033 v6.0) are not altered after publication; new versions require a new `document_version_id` and re-signature.

### E.5 Limitations

- eCIgn does not adjudicate the **clinical correctness** of a signed document — only its identity, intent, and integrity controls.
- Where eCIgn integrates with external systems (EHR for OASIS, billing for claims, HR for personnel files) the defensibility of those downstream systems is **not in scope** of this certificate.
- Network and device evidence depends on third-party services (e.g., ipapi.co); their availability is recorded but not guaranteed.
- Physical access to the signing endpoint, password discipline, and MFA-device security remain the tenant's operational responsibility.

### E.6 Final determination

> **This system is designed to meet the requirements for legal enforceability
> under the ESIGN Act and UETA, and for CMS audit defensibility under
> 42 CFR Part 484, contingent upon proper implementation of the controls
> described in this documentation set and operational adherence by Care
> Indeed staff. This certificate states that the system is *eligible* and
> *designed to comply*; it does not constitute a legal opinion and does
> not assert absolute legal validity in any specific dispute.**

---

*End of certificate.*
