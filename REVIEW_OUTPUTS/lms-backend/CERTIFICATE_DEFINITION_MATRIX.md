# Certificate Definition Matrix

**Source of truth:** `CARE_INDEED_LMS_BACKEND_ARCHITECTURE.md` §11 (certificate gate matrix) and §12 (generation architecture).
**Domain code:** `src/learning/domain/certificates.ts`, `src/learning/domain/types.ts`, `src/learning/domain/invariants.ts`.
**Stack note:** Artifacts and manifests are stored in **Google Cloud Storage (GCS)** and signed with **Cloud KMS** (ADR-004/005). `CompletionEvidence.artifactRef.provider` is `'GCS' | 'DRIVE'` (`types.ts` L249) — there is no S3.

Each certificate kind is backed by a `CertificateDefinition` (arch §6.10) that pins its eligibility `gateDefinitionRef`, `templateId`/`templateVersion`, `includeTranscriptAppendix`, and `publicVerificationEnabled`. Issuance is gated on a signed PASS `CERTIFICATE_ELIGIBILITY` decision, is idempotent, and is never deleted.

---

## 1. CertificateKind matrix

`CertificateKind` (`types.ts` L351–360). Eligibility gate is the §11 gate from `GATE_DEFINITION_MATRIX.md`; all use gate type `CERTIFICATE_ELIGIBILITY` (the field-clearance decision at §11.5 is a separate `FIELD_CLEARANCE` gate that is not itself a certificate).

| `CertificateKind` | Eligibility gate (§11) | Template / scope | Transcript appendix | Public verification |
|---|---|---|---|---|
| `MODULE_COMPLETION` | §11.1 module completion | Per-module; advanced/annual scope | Optional (summary) | Enabled |
| `POLICY_READING` | §11.2 policy-reading | Per policy id + exact version/hash | Yes (policy id/version, quiz score, attestation date) | Enabled |
| `GAO_TRACK` | §11.3 GAO track | GAO track scope | Yes | Enabled |
| `ROLE_ONBOARDING` | §11.4 role-onboarding | Per role pathway; role-onboarding scope | Yes | Enabled |
| `ACHC_ANNUAL_BUNDLE` | §11.6 ACHC annual bundle | ACHC bundle; annual cycle scope | Yes (all 12 modules + assessments) | Enabled |
| `ANNUAL_CYCLE` | Annual readiness / cycle bundle | Annual cycle scope (per `cycleId`) | Yes | Enabled |
| `ADVANCED_MODULE` | §11.8 advanced module | Per canonical Advanced module + assignment context | Yes | Enabled |
| `HHA_INSERVICE_12H` | §11.7 HHA 12-hour in-service | Rolling 12-month HHA in-service scope | Yes (hours/credit ledger) | Enabled |
| `COMPETENCY_VALIDATION` | Competency signoff gate | Per competency; requires evaluator signoff | Yes (competency/signoff dates) | Enabled |

Scopes stay independent (§3.6): initial onboarding, role onboarding, annual/recurring, ACHC bundle, advanced, competency, HHA in-service, and policy reading are separate scopes. An Advanced annual assignment and an onboarding assignment can point to the same content revision but remain distinct `CertificateRecord`s.

---

## 2. Eligibility enforcement — `assertCertificateEligible`

`certificates.ts` L46–52 delegates to `canIssueCertificate` (`invariants.ts` L160–171):

| Requirement | Reject reason |
|---|---|
| `gate.gateType === 'CERTIFICATE_ELIGIBILITY'` | `WRONG_GATE_TYPE` |
| `gate.outcome === 'PASS'` (never FAIL/CONDITIONAL) | `GATE_NOT_PASS` |
| non-empty `gate.assertionSignature` (Cloud KMS) | `GATE_UNSIGNED` |
| `gate.expiresAt` not in the past vs `now` | `GATE_EXPIRED` |

A certificate never grants clearance on its own (`certificateGrantsClearance()` → `false`, `invariants.ts` L177).

---

## 3. Manifest & template — `buildCertificateManifest`

`buildCertificateManifest` (`certificates.ts` L86–106) assembles the `CertificateManifest` (L58–76) — the **source of truth**, not the PDF (§12.4 / §27). It carries:

- `certificateDefinitionRef {id, version}`, `templateId`, `templateVersion`, `approvedLogoSha256`, `rendererVersion`;
- `subjectId`, `publicId`, `gateDecisionId`, `eligibilitySnapshotSha256`, `issuedAt`;
- `inputs`: `assignmentIds`, `gradeIds`, `evidenceIds`, `signoffIds` (each sorted for determinism) and `policyVersions`.

Template/scope on the `CertificateRecord` (`types.ts` L362–384) is pinned via `templateId` + `templateVersion`; the record also stores `certificateDefinitionRef`, `gateDecisionId`, `eligibilitySnapshotSha256`, and the input id sets.

---

## 4. Idempotency key composition — `issuanceKey`

`issuanceKey` (`certificates.ts` L23–31) composes the §12.5 unique key from `IssuanceKeyInput` (L15–21):

```
subjectId # certificateDefinitionId # v<certificateDefinitionVersion> # <cycleOrPlanId | 'no-cycle'> # eligibilitySnapshotSha256
```

`resolveIdempotentIssuance` (L34–40) looks the key up in an existing-by-key map: a retry with the same key returns `{ action: 'RETURN_EXISTING' }` rather than duplicating (double-click certificate issue, §24.4). Non-recurring scopes pass an empty `cycleOrPlanId`, which normalizes to `'no-cycle'`.

---

## 5. Revocation & supersession — never delete (§12.6)

`CertificateRecord.status` is `'ACTIVE' | 'SUPERSEDED' | 'REVOKED'` (`types.ts` L381).

| Function (`certificates.ts`) | Effect | Guard |
|---|---|---|
| `revokeCertificate(record, reason)` L158–161 | `status → REVOKED`, sets `revocationReason` | throws `ALREADY_REVOKED` if already revoked |
| `supersedeCertificate(prior, replacementId)` L163–166 | `status → SUPERSEDED`, sets `supersedesCertificateId` | throws `CANNOT_SUPERSEDE_REVOKED` if prior is revoked |

Revocation/supersession reasons (§12.6): identity correction, content/grade invalidation, fraudulent evidence, administrative error, replacement certificate. History is append-only — records are re-statused, never deleted.

A later annual lapse must not rewrite a historical onboarding certificate (§14.3): `annualLapseAffectsHistoricalCertificate()` returns `false` (`certificates.ts` L172–174).
