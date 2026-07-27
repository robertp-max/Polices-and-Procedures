# ADR-LEARNING-005 — Artifact, signature, and record routing

**Status:** Accepted (Wave 0)
**Date:** 2026-07-27
**Controlling spec:** architecture §4, §6.8, §10.2/10.3, §12, §17, §27

## Context

Evidence, certificates, and manifests must be immutable, hashed, and (for
GateDecisions and certificate manifests) **cryptographically signed** (§10.2, §12.5).
Signoffs must enforce **distinct-human** signer slots (§10.3). Records may need to
be mirrored to the personnel file (Google Drive) without that mirror becoming the
canonical record (§4.1). The PDF is never the source of truth (§27).

## Decision

1. **Artifact routing (`ArtifactStore` port → GCS):**
   - Uploads land in `cihh-learning-upload-staging-{env}` via short-lived signed URLs.
   - On validation, artifacts are promoted to `cihh-learning-artifacts-{env}`
     (bucket versioning + retention policy/holds for immutability).
   - Every artifact reference stores `{ provider: "GCS", locator, versionId, sha256 }`.
     Presigned download URLs are short-lived; public certificate verification never
     exposes artifact paths (§23).

2. **Signing (`Signer` port → Cloud KMS asymmetric key):**
   - `GateDecision.assertionSignature` and the certificate **manifest** are signed
     over a canonical `stateVectorSha256` / manifest hash.
   - Verification uses the KMS public key; downstream consumers reject
     `FAIL/CONDITIONAL/expired/invalid-signature/stale-state-vector` (§10.2).

3. **Certificate generation is deterministic and server-side** (§12.4): PDF +
   transcript appendix + signed JSON manifest are reproducible from
   `{ certificate record, eligibility snapshot, templateId+version, approved logo
   hash, renderer version }`. Browser print is never authoritative (§27). Issuance is
   idempotent on `{ subject, certDef+version, cycle/plan, eligibilitySnapshotSha256 }`
   (§12.5); a retry returns the existing certificate.

4. **Signature/eCIgn adapter + distinct-human enforcement (§10.3):** a `SignoffRecord`
   stores `{ signerSubjectId, actingRoleAssignmentId, signerSlot, distinctHumanGroup }`.
   The gate rule `SIGNOFF_PRESENT` with a `distinctHumanGroup` **rejects the same
   human filling two slots in that group**, even when they hold multiple roles.
   Signatures integrate the existing eCIgn/signature service by reference
   (`signatureServiceRef`); a browser-local signature image is **not** a valid signoff
   (also enforced at migration, §21.2).

5. **Personnel-file routing:** on `certificate.issued` / validated evidence, an
   outbox consumer may publish an **approved copy or pointer** to Google Drive. The
   Drive copy is a mirror only; the canonical record remains the Firestore
   `CertificateRecord` / `CompletionEvidence` + its GCS artifact + manifest (§4.1).

6. **No PHI** in artifacts intended for events/logs/certificates; detailed
   remediation narratives live in encrypted artifact storage, not event payloads (§17, §3.8).

## Consequences

- Certificates are verifiable from the signed manifest independent of the PDF,
  satisfying §22 "a generated certificate cannot be reproduced from its manifest → fail".
- Distinct-human is a data-model + gate-rule guarantee, not a UI convention.
- Drive remains optional and non-authoritative; losing it cannot lose the record.

## Rejected alternatives

- **Browser-generated PDF as the artifact** — rejected by §12.4/§27.
- **Drive as canonical personnel record** — rejected by §4.1.
