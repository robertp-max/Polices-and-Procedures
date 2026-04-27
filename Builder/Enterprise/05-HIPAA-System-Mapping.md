# 05 — HIPAA System Mapping

> **Status**: Compliance mapping. Cites HIPAA Security Rule (45 CFR §164.308 / §164.310 / §164.312 / §164.530) controls and shows where each is implemented in the unified system. This is a design artifact; final legal interpretation is the responsibility of agency counsel.

---

## 1. Scope

This document covers the HIPAA Security Rule technical safeguards (§164.312) plus directly relevant administrative (§164.308) and physical (§164.310) safeguards that the system implements or supports. It maps to:

- `01-Enterprise-Access-Control.md`
- `02-Global-Execution-Unit-Model.md`
- `03-Enterprise-Audit-Model.md`
- `04-User-Activity-Tracking.md`
- `Builder/Onboarding/Documentation/06-Audit-Defensibility-and-Legal-Eligibility.md`

---

## 2. §164.312(a) — Access Control

| Requirement | Implementation |
|-------------|----------------|
| **Unique user identification** (a)(2)(i) | Every actor has a stable `user_id` (ULID). No shared accounts. Service principals have distinct `service_id`s. |
| **Emergency access procedure** (a)(2)(ii) | Emergency `OverrideRecord` mechanism, dual-sig (CO + Admin), bounded `valid_to`, fully audited; "break-glass" never bypasses audit. |
| **Automatic logoff** (a)(2)(iii) | Server-side session timeout enforced; `session.idle_timeout` event emitted. Default ≤ 15 min idle for PHI roles; ≤ 30 min for others. |
| **Encryption and decryption** (a)(2)(iv) | TLS 1.2+ in transit (per (e)). At-rest encryption on object storage and DB; key management documented in §6. |

PHI visibility control:
- The PDP enforces `phi:view` per-record and per-data-class with the `minimum_necessary` predicate (§3 below).
- Resource attributes (`contains_phi`, `classification`, `subject_id`, `patient_id`) drive ABAC predicates.
- Auditors are PHI-restricted by default (`auditor_external` cannot access PHI without explicit grant).

---

## 3. §164.312(b) — Audit Controls

| Requirement | Implementation |
|-------------|----------------|
| Hardware/software/procedural mechanisms that record and examine activity in systems that contain or use ePHI | Global `AuditEvent` system (`03-Enterprise-Audit-Model.md`): append-only, hash-chained, replayable. Coverage of all event families (`04-User-Activity-Tracking.md`). PHI Access Lens implements the operational read surface (§8 of doc 04). |

Specific controls:
- All PHI access emits `phi.access.*` with `minimum_necessary` block (rejected at the boundary if absent).
- All access decisions (permit + deny) are auditable; denies and SoD violations are persisted unconditionally.
- Nightly chain verification + cross-stream witness anchor.
- Auditor read APIs (`/api/audit/*`) governed by `audit:view`/`audit:export`/`audit:replay` permissions.

---

## 4. §164.312(c) — Integrity

| Requirement | Implementation |
|-------------|----------------|
| **(c)(1)** Policies and procedures to protect ePHI from improper alteration or destruction | Evidence is content-addressed (SHA-256), immutable, supersession-only. Signatures are watermarked + hashed (eCIgn). Audit chain prevents undetected alteration. WORM/object-locked storage. |
| **(c)(2)** Mechanism to authenticate ePHI | Hash binding: every record's content hash is recorded in metadata and (for signed records) in the `SignatureRecord`. Retrieval verifies hash; mismatch raises `signature.tampered_detected` (critical). |

Integrity at every layer:
- **Storage**: object lock / WORM; lifecycle policies for retention.
- **DB**: `INSERT`-only audit/evidence/signature tables; revoked `UPDATE`/`DELETE` at the role/policy level.
- **Audit**: hash chain + nightly verifier + witness anchor + chain-break alert blocking dossier exports.
- **Backup**: encrypted backups; restoration emits `system.config.changed` and triggers full chain re-verification.

---

## 5. §164.312(d) — Person or Entity Authentication

| Requirement | Implementation |
|-------------|----------------|
| Verify the person or entity seeking access to ePHI is the one claimed | SSO/IdP integration; identity assurance (NIST 800-63 IAL) recorded per session; **MFA required** for any user with `phi:view` permission and for all elevated roles. Step-up authentication required for sensitive actions (override, BAA, dossier export, role grant). |

Specific behaviors:
- `auth.authenticate.success/failure`, `auth.mfa.*`, `auth.step_up.*` audited.
- Account lockout after threshold (`access.failed_attempt.threshold_exceeded`).
- Service principals authenticated via rotated credentials (`system.service_principal.rotated` audited).

---

## 6. §164.312(e) — Transmission Security

| Requirement | Implementation |
|-------------|----------------|
| **(e)(1)** Guard against unauthorized access to ePHI being transmitted over an electronic network | TLS 1.2+ enforced; HSTS; modern cipher suites. CORS narrowly scoped (`env.allowedOrigin`). Optional shared-secret bearer for environments where IdP is not in front (`env.apiSharedSecret`). |
| **(e)(2)(i)** Integrity controls | Application-layer message integrity for sensitive payloads (e.g., signature events carry hash chain). |
| **(e)(2)(ii)** Encryption | TLS in transit; signed artifacts hashed; outbound integrations use mutual TLS or signed JWT where supported. |

Transmission events:
- `phi.access.transmit` (critical) for any outbound PHI delivery.
- Webhook deliveries are audited and signed (HMAC) to recipients.

---

## 7. §164.308 — Administrative Safeguards (Selected)

| Requirement | Implementation |
|-------------|----------------|
| **(a)(1)(ii)(A)** Risk Analysis | `it.risk_analysis` CEU recurring annually; outcomes captured as evidence; signed by Security Officer. |
| **(a)(1)(ii)(B)** Risk Management | Findings flow into `incident.investigation` / `incident.remediation` CEUs. |
| **(a)(3)** Workforce Security | Onboarding role activation gates downstream access (Field/Billing/System Access Clearance). Role assignments are bounded and audited. |
| **(a)(4)** Information Access Management | RBAC + ABAC PDP; permissions versioned; access bundle changes dual-signed. |
| **(a)(5)** Security Awareness & Training | HIPAA workforce training is a recurring CEU; gate refuses provisioning without current training. |
| **(a)(6)** Security Incident Procedures | `incident.report` / `incident.investigation` / `incident.remediation` CEUs; severity classification; mandatory reporting destinations recorded. |
| **(a)(7)** Contingency Plan | Backup, disaster recovery procedures; replay enables state reconstruction. |
| **(a)(8)** Evaluation | Periodic compliance evaluation surfaced via Audit Mode dashboards and readiness score. |
| **(b)** BAA | `vendor.baa` CEU; multi-sig (CO + Admin + Vendor representative); `Vendor Engagement` gate refuses access without executed BAA. |

---

## 8. §164.310 — Physical Safeguards (Touchpoints)

While physical safeguards are largely operational, the system supports:

- **Workstation security** logging (device fingerprint on session start; new-device notice).
- **Device & media controls** via inventory CEUs (`it.access_request` linked to device assignments) and decommissioning workflows.

---

## 9. §164.530 — Administrative Requirements (Privacy)

- **Designated Privacy Officer**: governance appointment CEU; signed; recurring attestation.
- **Training** (530(b)): workforce HIPAA training is a recurring CEU.
- **Sanctions** (530(e)): sanction CEUs link to incident outcomes; audited.
- **Mitigation** (530(f)): tracked in `incident.remediation`.
- **Complaints** (530(d)): complaint intake CEU; sequence + closure required.
- **Documentation** (530(j)): retention class `phi-access` ≥ 6 years.

---

## 10. PHI Visibility Control (cross-cutting)

Implemented as a chain of controls:

1. **Authentication** (§164.312(d)) — IdP + MFA.
2. **Authorization** — PDP returns `permit` only when `phi:view` + ABAC predicates + SoD pass.
3. **Minimum necessary** — request must declare `purpose`, `legal_basis`, requested fields; PDP enforces user's `access_classes` ⊇ requested data classes; resource layer returns only the requested fields.
4. **Step-up** — recent re-auth required if `session.auth_age > 30m` for PHI actions.
5. **Audit** — `phi.access.*` event written; rejection if `minimum_necessary` block missing.
6. **Anomaly detection** — bulk PHI / off-hours / impossible travel patterns trigger alerts.
7. **Accounting of disclosures** — PHI Access Lens provides §164.528 reporting.

---

## 11. Minimum Necessary Enforcement

The PDP exposes:

```
minimum_necessary(user, patient, purpose, fields_requested) → boolean
```

Decision based on:

- The user's role and `access_classes` (e.g., RN clinician, Biller, Compliance Officer auditing).
- The declared `purpose` (treatment, payment, healthcare operations, patient request, audit, legal).
- The minimum field set defined per (role, purpose) combination, stored as data and dual-sig governed.

If the user requests broader fields than the (role, purpose) pair authorizes, the PDP denies and emits `phi.access.denied`.

---

## 12. Session Management

| Control | Setting |
|---------|---------|
| Idle timeout | ≤ 15 min (PHI roles), ≤ 30 min (others) |
| Absolute session lifetime | 12 h |
| Step-up max age | 30 min for PHI; 5 min for `*:approve\|sign\|override\|export` |
| Concurrent session limit | configurable per role (default 3); excess revokes oldest |
| Session revocation | Immediate on Suspension / Deactivation / anomaly detector |
| Device fingerprinting | Recorded on `session.start`; new-device notice + step-up |

All transitions audited (§4.1.1).

---

## 13. Encryption Boundaries

- **In transit**: TLS 1.2+ (1.3 preferred); HSTS; cipher suite policy reviewed quarterly.
- **At rest**:
  - Object storage (evidence + signed artifacts) encrypted with KMS-managed keys; per-object data encryption keys.
  - Database encrypted at rest; full disk encryption.
  - Backups encrypted; keys held under separation of duties (KMS access bound to Security Officer + Administrator).
- **Application-layer** signing/hashing for integrity (eCIgn, audit chain).
- **Key rotation**: ≤ 12 months; rotation events audited (`system.service_principal.rotated`).
- **Key access**: separation of duties — no single principal holds full key authority.

---

## 14. BAA & Vendor Surface

- `vendor.intake` CEU performs OIG/SAM/state Medicaid screening, COI verification, BAA risk tier.
- `vendor.baa` CEU executes the BAA via eCIgn multi-sig (CO + Admin + Vendor signer).
- `Vendor Engagement` gate refuses access until BAA is current and exclusion checks pass.
- Monthly recheck via `vendor.revalidation` recurring CEU.

---

## 15. Breach Notification Support

Although policy-driven, the system supports:

- `incident.report` with PHI breach flag → triggers required-reporting CEUs (HHS OCR, state, affected individuals).
- Affected-individual list export emits `phi.access.export` (critical).
- Timeline and response artifacts collected as evidence; final report signed by Privacy Officer + Compliance Officer.

---

## 16. Cross-Reference Matrix

| HIPAA section | Architecture artifact |
|---------------|------------------------|
| §164.308(a)(1) | `it.risk_analysis` CEU; readiness score |
| §164.308(a)(3) | Onboarding gates; `RoleAssignment` |
| §164.308(a)(4) | PDP; access bundles |
| §164.308(a)(5) | HIPAA training CEUs (recurring) |
| §164.308(a)(6) | Incident CEUs |
| §164.308(a)(8) | Audit Mode evaluations |
| §164.308(b) | Vendor + BAA CEUs |
| §164.310 | Device/session controls |
| §164.312(a) | PDP + session timeouts + emergency override |
| §164.312(b) | Global audit chain |
| §164.312(c) | Content-addressed evidence + chain integrity |
| §164.312(d) | IdP + MFA + step-up |
| §164.312(e) | TLS + signed transmissions |
| §164.530 | Privacy Officer appointments + training + complaints + sanctions |
| §164.528 | PHI Access Lens (accounting of disclosures) |

---

## 17. Forbidden

- PHI in audit/event payloads.
- PHI access without `minimum_necessary` declaration.
- Long-lived sessions for PHI roles.
- Service principals with `phi:view` unless explicitly scoped and reviewed.
- Disabling MFA for elevated or PHI roles.
- Disabling audit logging for any service.
- Plaintext at-rest storage of any PHI.
