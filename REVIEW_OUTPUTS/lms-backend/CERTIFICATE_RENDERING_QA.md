# Certificate Rendering QA

**Source of truth:** `CARE_INDEED_LMS_BACKEND_ARCHITECTURE.md` §12.2 (certificate package) and §12.4 (deterministic generation), plus §12.3 (QR) and §27 (source-of-truth rule).
**Domain code:** `src/learning/domain/certificates.ts`.
**Stack note:** The renderer runs as a **Cloud Tasks / worker** job, loads the immutable eligibility snapshot, hashes artifacts, and stores the PDF + manifest in **GCS**; **Cloud KMS** signs the manifest (§12.1 adapted to Google Cloud — no SQS/S3).

Core rule (§27): **the PDF is not the certificate source of truth.** The source of truth is the immutable `CertificateRecord`, its signed eligibility snapshot, its exact evidence/grade/signoff inputs, and its signed artifact manifest.

---

## 1. Deterministic generation inputs (§12.4)

The PDF must be reproducible from exactly these inputs — all present on the `CertificateManifest` (`certificates.ts` L58–76):

| Input | §12.4 name | Manifest field |
|---|---|---|
| Certificate record | certificate record | `publicId`, `certificateDefinitionRef`, `subjectId`, `gateDecisionId`, `issuedAt` |
| Eligibility snapshot | eligibility snapshot | `eligibilitySnapshotSha256` (+ `inputs.*` id sets) |
| Template id/version | template ID/version | `templateId`, `templateVersion` |
| Approved logo hash | approved Care Indeed logo hash | `approvedLogoSha256` |
| Renderer version | rendering-engine version | `rendererVersion` |

Browser print is **not** the authoritative generator (§12.4). No wall-clock, locale, or client state enters generation — only the manifest fields above.

---

## 2. Certificate face + transcript appendix (§12.2)

### Page 1 — certificate face
Care Indeed logo · learner name · certificate title · role/pathway · completion/issue date · plan year or cycle · hours/credits (when approved) · certificate public ID · QR verification code · issuer.

### Appendix — detailed transcript (`includeTranscriptAppendix`)
Completed module IDs and versions · P&P policy IDs and versions (`inputs.policyVersions`) · quiz passing scores · attempt count · attestation dates · competency/signoff dates (`inputs.signoffIds`) · supervised-practice evidence (`inputs.evidenceIds`) · hours/credits ledger · gate decision ID (`gateDecisionId`) · artifact hashes.

---

## 3. QR verification — data-minimized public response (§12.3)

QR encodes only the path, never private data:

```
/verify/certificate/:publicId        (public API: GET /api/public/certificates/:publicId)
```

`publicVerificationView` (`certificates.ts` L138–152) returns the `PublicVerification` shape (L125–132) — **only** these fields:

| Public field | Source |
|---|---|
| `publicId` | `record.publicId` |
| `status` (`ACTIVE` / `SUPERSEDED` / `REVOKED`) | `record.status` |
| `title` | passed title |
| `issueDate` | `record.issuedAt` |
| `issuer` | passed issuer |
| `learnerDisplayName` | display name only |

Never exposed (§12.3, §23): employee ID, question responses, scores, detailed remediation, private evidence, or artifact paths. Revocation is reflected live — a revoked record verifies as `REVOKED`.

---

## 4. Manifest-is-source-of-truth rule (§27)

- The manifest carries every deterministic input; the PDF is a derived artifact.
- `manifestFingerprint(m)` (`certificates.ts` L109–114) produces a stable fingerprint over the canonical manifest JSON (adapter substitutes real SHA-256).
- `manifestsReproduceIdentically(a, b)` (L117–119) is true iff the two manifests share a fingerprint — i.e. would render an identical certificate.
- Input id arrays are sorted in `buildCertificateManifest` (L98–101), so ordering never perturbs the fingerprint.

---

## 5. QA checklist — reproducibility from the manifest

| # | Check | Assertion | Evidence |
|---|---|---|---|
| 1 | Manifest completeness | All §12.4 inputs present (template, logo hash, renderer version, snapshot, inputs). | inspect `CertificateManifest` |
| 2 | Fingerprint stability | Rebuilding the manifest from the same record yields the same `manifestFingerprint`. | `manifestFingerprint(build(x)) === manifestFingerprint(build(x))` |
| 3 | Order independence | Shuffling input id arrays yields an identical manifest. | sorted `inputs.*` → `manifestsReproduceIdentically(a, b) === true` |
| 4 | Reproducible re-render | Same manifest → byte-identical PDF; `manifestsReproduceIdentically` gate before accepting a re-render. | compare artifact hashes |
| 5 | Divergence detection | Any changed input (template version, logo hash, renderer version, snapshot) changes the fingerprint. | `manifestsReproduceIdentically(a, b') === false` |
| 6 | Public data minimization | `publicVerificationView` output contains only the six public fields; no PII/scores/paths. | field-set assertion |
| 7 | Eligibility binding | Certificate references a signed PASS `CERTIFICATE_ELIGIBILITY` decision (`gateDecisionId`, `eligibilitySnapshotSha256`). | `assertCertificateEligible` |
| 8 | Revocation reflected | Revoked/superseded status surfaces in `publicVerificationView`; artifact is not deleted. | verify `status` post-revoke |
| 9 | KMS signature | Manifest is Cloud KMS-signed before the `CertificateRecord` is committed and the artifact is served. | manifest signature check |

This satisfies the §22 release gate "a generated certificate cannot be reproduced from its manifest" and the §24.2 property "certificate never issues from FAIL/CONDITIONAL gate."
