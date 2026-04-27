# 05 — HIPAA Compliance Controls

**Scope:** HIPAA Security Rule technical safeguards and supporting administrative controls as implemented by IAL, EUL, AEL, ENF.

---

## 1. §164.312(a) — Access Control

| Required Implementation | System Mechanism |
|------------------------|------------------|
| Unique user identification (a)(2)(i) | `User.id` + external IdP subject; no shared accounts; system actor distinct from users. |
| Emergency access procedure (a)(2)(ii) | `override.access` dual-approval workflow (Doc 01 §5.3). Time-bounded (24h default) with mandatory reason and full audit. |
| Automatic logoff (a)(2)(iii) | Idle timeout: 15 minutes default for clinical/PHI sessions; 30 minutes for non-PHI. Logged as `SESSION_EXPIRED`. |
| Encryption/decryption (a)(2)(iv) | PHI at rest: envelope encryption (per-record DEK + KMS-managed KEK). PHI in transit: TLS 1.2+. |

Additional:
- Role-based + scope-based authorization (Doc 01 §2).
- Minimum-necessary enforced by default redaction; explicit `phi.read` permission required to unredact.

---

## 2. §164.312(b) — Audit Controls

| Required Implementation | System Mechanism |
|------------------------|------------------|
| Hardware/software/procedural mechanisms to record and examine activity in systems containing ePHI | Append-only `AuditEvent` log with hash chaining, synchronous write for security-critical actions, integrity verification job (Doc 04 §4). |

Coverage:
- Every authorization decision logged (`ACCESS_DECISION`).
- Every PHI read/write/export logged (`PHI_*`).
- Every CEU state change, signature, override logged.
- Login, logout, failed login logged.

---

## 3. §164.312(c) — Integrity

| Required Implementation | System Mechanism |
|------------------------|------------------|
| Mechanism to authenticate ePHI; protection from improper alteration/destruction (c)(1)(2) | Document/evidence content hashes (sha256) recorded in CEU `evidence.submitted[].contentHash` and signature `documentHash`. Audit chain detects tampering of audit records. PHI write events store before/after with envelope encryption. |

Procedures:
- Periodic `INTEGRITY_CHECK` jobs verify the audit chain.
- Discrepancies emit `CHAIN_BROKEN_DETECTED` and trigger an automatic `Compliance` escalation CEU.
- Restore-from-backup procedures require chain verification before write access resumes.

---

## 4. §164.312(d) — Person/Entity Authentication

| Required Implementation | System Mechanism |
|------------------------|------------------|
| Verify that the person or entity seeking access is the one claimed | SSO/IdP with MFA enforced for all users with PHI access. Service-to-service auth uses signed actor context (Doc 00 §4). Re-authentication required for high-sensitivity actions (override approval, PHI export, signature). |

Re-auth triggers:
- Session age > threshold for action sensitivity.
- Step-up MFA for: override approval, signature collection, PHI export, CEU completion involving high-risk classification.

---

## 5. §164.312(e) — Transmission Security

| Required Implementation | System Mechanism |
|------------------------|------------------|
| Integrity controls (e)(2)(i) | Request signing for service-to-service; document hashes for signed artifacts. |
| Encryption (e)(2)(ii) | TLS 1.2+ everywhere. eCIgn callbacks verify signature and TLS pinning where supported. |

Outbound integrations (Hubstaff, Google Calendar, eCIgn):
- TLS verified.
- Only the minimum necessary fields are transmitted.
- Outbound payloads with PHI require explicit `transmission.phi` permission and emit `INTEGRATION_INVOKED` with redacted manifest.

---

## 6. PHI Access Logging (operational detail)

Every read of a PHI-tagged resource:
- Resolves `Scope` (must include patient).
- Emits `PHI_VIEWED` with target reference (no raw payload), correlation id, reason code (e.g., `treatment`, `payment`, `operations`).
- Counts toward anomaly detection (Doc 06).

PHI exports:
- Require `phi.read` + `audit.export` (or equivalent).
- Generate a `PHI_EXPORTED` event with full manifest (record ids, hashes, recipient).
- Are watermarked.

---

## 7. Minimum Necessary

- Default UI redaction for PHI fields.
- API responses filter PHI fields unless `phi.read` is satisfied.
- Search results show identifiers only with explicit consent or scope.
- Role-tailored views: e.g., Billing sees demographic+billing fields, not clinical narrative.

---

## 8. Session Control

- Max session lifetime: 12 hours.
- Idle timeout: 15 min (PHI), 30 min (non-PHI).
- Step-up re-auth windows:
  - Override approval: re-auth within last 5 min.
  - PHI export: re-auth within last 5 min.
  - Signature: re-auth within last 5 min OR signed via eCIgn (acts as re-auth).
- Sessions are revocable (`SESSION_REVOKED`) by Admin or Compliance.

---

## 9. Encryption Expectations

| Data | At Rest | In Transit |
|------|---------|-----------|
| User credentials | Not stored (IdP) | TLS to IdP |
| Sessions | KMS-encrypted secret cookie + server store | TLS |
| CEU records (non-PHI) | DB-level encryption | TLS |
| PHI fields | Envelope encryption (per-record DEK) | TLS |
| Audit log | DB-level encryption + chain hash | TLS |
| Backups | KMS-encrypted | TLS |
| Evidence artifacts | Object storage with SSE-KMS | TLS |
| Exports | KMS-encrypted bundle, watermarked | TLS |

---

## 10. Breach Traceability

A suspected breach can be reconstructed by:
1. Filtering `audit_events` by affected target ids and time range.
2. Following `correlationId` and `causationId` to assemble request flows.
3. Listing every `actor.userId` who triggered `PHI_*` or `ACCESS_DECISION` for the affected records.
4. Producing a sealed export (chain-verified, KMS-signed) for the report.

The system targets full reconstruction within minutes for any single patient/user/CEU.

---

## 11. Administrative Tie-Ins

- Workforce sanction policy (RM-OS family) — sanction events become `USER_SUSPENDED` with policy reference.
- Information access management — provisioning is itself a CEU; logged from request through approval to grant.
- Periodic access review — recurring CEU bundle ("Access Review Q#") generated by Calendar source; produces sign-off artifacts.
