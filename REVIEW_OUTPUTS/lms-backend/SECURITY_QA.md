# Care Indeed LMS Backend — Security QA

Scope: architecture §16 (authorization model), §17 (audit/event integrity), §23 (runtime
health), §24.5 (security tests). Platform is **Google Cloud** — Firestore, Cloud Storage
(GCS), Cloud KMS, Cloud Tasks/Pub-Sub — per the domain ports header and ADR-LEARNING-001/002/005.

This review covers the **pure domain layer** (`src/learning/domain/`), which is where the
non-negotiable security invariants are enforced deterministically and unit-proven. Items
that can only be fully enforced at the request/adapter boundary (auth token verification,
IAM-scoped Firestore/GCS access, real KMS calls, presigned-URL minting) are listed as
**Live layer** work — the domain defines the contract they must satisfy, but the running
service must implement and integration-test them.

Legend: ✅ enforced in domain · ◧ contract defined in domain, enforcement completed live · ▢ live-only

| # | Control (§) | Status | Where enforced (symbol · file) | Remaining for live layer |
|---|-------------|--------|--------------------------------|--------------------------|
| 1 | **Server authority — no client score** (§16, §26) | ✅ | `scoreResponses`, `attemptPassed`, `decideGrade` · `assessment.ts`; `isPass` · `invariants.ts` | Ensure the HTTP handler discards any client-supplied score and calls these against the server key only. |
| 2 | **Server authority — completion is derived, never a client boolean** (§9, §26) | ✅ | `deriveCompletion` · `invariants.ts`; `deriveInitialStatus` / `buildAssignment` (never yields `COMPLETED`) · `planning.ts` | Wire the derivation into the assignment read-model projector; never persist a client `completed` flag. |
| 3 | **Answer keys server-only** (§24.5) | ✅ | `scoreResponses` takes the key server-side; `selectQuestionSet`/`fingerprintQuestionSet` expose only question IDs, never answers · `assessment.ts` | Serve attempt payloads without keys; keep the bank + keys in a server-only Firestore collection with no client read rule. |
| 4 | **Object-level authorization (self-only learner, supervisor/branch/acting-role scope)** (§16, §24.5) | ◧ | Distinct-human/self-eval scoping primitives: `recordCompetencyObservation` (`SELF_EVALUATION_FORBIDDEN`) · `evidence.ts`; `resolveApplicableRequirements` (role/duty-bound, no self-selected roles) · `planning.ts` | Per-request subject/branch/role check on every read/write; enforce `LearningRecordStore` calls are scoped to the authenticated subject. |
| 5 | **Distinct-human signatures / no self-approval** (§10.3, §16) | ✅ | `distinctHumanViolated` · `invariants.ts`; `addSignoff` (`DISTINCT_HUMAN_VIOLATION`, `SIGNATURE_SERVICE_REF_REQUIRED`) · `evidence.ts` | Bind `signerSubjectId` to the authenticated identity; verify the signature-service ref against the real eSign/KMS adapter. |
| 6 | **No PHI/PII in events, logs, certs** (§17, §23) | ◧ | Event/manifest payloads carry IDs + hashes only: `CertificateManifest`/`buildCertificateManifest` (no learner PII) · `certificates.ts`; sensitive narratives excluded by design (§17) | Redaction middleware on the outbox/event writer + structured logger; assert no free-text remediation/PHI in `LearningActivityEvent` payloads. |
| 7 | **Data-minimized public verification** (§12.3, §23, §24.5) | ✅ | `publicVerificationView` / `PublicVerification` — returns only `publicId`, `status`, `title`, `issueDate`, `issuer`, `learnerDisplayName`; never employeeId, scores, responses, remediation, or artifact paths · `certificates.ts` | Expose only this shape at the public verify endpoint; no auth-scoped fields leak into the anonymous QR path. |
| 8 | **KMS-signed gate decision** (§10, §11, ADR-005) | ◧ | `evaluateGate` produces an **unsigned** decision + `stateVectorFingerprint`; `acceptGateForConsumption` rejects `UNSIGNED`/`STALE_STATE`/`EXPIRED`; `canIssueCertificate` rejects `GATE_UNSIGNED`/`GATE_NOT_PASS`/`GATE_EXPIRED` · `gates.ts`, `invariants.ts` | Adapter signs the fingerprint via `Signer` (`ports.ts`) backed by Cloud KMS; verify on consumption. |
| 9 | **KMS-signed certificate manifest, reproducible** (§12.4, §27) | ✅ | `buildCertificateManifest`, `manifestFingerprint`, `manifestsReproduceIdentically` — manifest (not the PDF) is source of truth, order-independent, deterministic · `certificates.ts` | Sign `manifestFingerprint` with KMS; store signature on `CertificateRecord`; render from manifest only. |
| 10 | **Presigned-URL expiry** (§24.5) | ◧ | `ArtifactStore.signedDownloadUrl(locator, ttlSeconds)` — TTL is a required parameter of the port · `ports.ts` | Live GCS V4 signed-URL impl with a short, enforced TTL; never return unbounded/public object URLs. |
| 11 | **Idempotent, non-duplicating issuance** (§12.5) | ✅ | `issuanceKey`, `resolveIdempotentIssuance` (`RETURN_EXISTING` vs `CREATE`) · `certificates.ts` | Back the key map with a Firestore transaction / unique doc ID so concurrent double-click issues once. |
| 12 | **Suspended / terminated user handling** (§16) | ◧ | Attempt/eligibility gates fail-closed (`canStartAttempt`, `canIssueCertificate`, `acceptGateForConsumption`); status is never client-derived | Deny active mutations for suspended users; terminated users get read-only historical access — enforced in the auth guard, not the domain. |
| 13 | **Audit / outbox integrity — every mutation writes an event** (§17, §26) | ◧ | Append-only event contract `LearningEventStore.append` + `seen(idempotencyKey)` dedup · `ports.ts`; append-only evidence/attempt lifecycles: `canTransitionEvidence`/`supersedeEvidence` · `evidence.ts`, `nextAttemptNumber` · `invariants.ts` | Transactional-outbox writer that persists state change + event + audit actor/time/correlation in one Firestore transaction; consumers dedup on `idempotencyKey`. |
| 14 | **Immutable history — revoke/supersede never delete** (§12.6, §21) | ✅ | `revokeCertificate`, `supersedeCertificate`, `annualLapseAffectsHistoricalCertificate()===false` · `certificates.ts`; migration `classifyLegacyRecord` never creates a signed gate · `migration.ts` | Firestore security rules must forbid deletes/overwrites on record + event collections. |
| 15 | **Attempts append-only / immutable** (§8.6, §26) | ✅ | `nextAttemptNumber` (strictly max+1), `assignAttemptNumber`, `consumeReattemptAuthorization` (single-use `CONSUMED`) · `invariants.ts`, `assessment.ts` | Persist attempts as append-only docs; no update path on the attempt collection. |
| 16 | **Active-time is server-validated (anti-spoof)** (§7.2) | ✅ | `evaluateHeartbeat` — caps increment, rejects duplicate/non-monotonic/background-tab/idle/clock-skew; `meetsActiveTimeMinimum` · `activity.ts` | Session store must persist `lastAcceptedSequence` server-side; reject client-claimed totals. |

## §24.5 security-test coverage status

- Provable **now** at the domain level and unit-tested: answer-key non-exposure (#3),
  object-level self-eval rules (#4 partial), distinct-human (#5), public-verification data
  minimization (#7), gate signature/staleness/expiry (#8), presigned-URL TTL contract (#10).
  See `invariants.test.ts`, `certificates.test.ts`, `gates.test.ts`, `evidence.test.ts`,
  `assessment.test.ts`.
- Require the **live service** (not yet exercised, per §24.3/§24.5): forged subject/role
  headers, learner-reads-another-learner over the real API, expired JWT, suspended-user
  denial end-to-end, real presigned-URL expiry, and IAM/Firestore-rule object-level authz.

## Net assessment

The domain layer correctly makes the security-critical decisions **unforgeable from the
client**: scores/grades/completion are server-derived, answer keys never leave the server,
gates and manifests must be KMS-signed and are staleness/expiry-checked, public verification
is data-minimized, and all history is append-only. The remaining risk surface is entirely in
the **live request/adapter boundary** — token verification, per-object authorization,
transactional outbox durability, KMS/GCS wiring, and suspended/terminated enforcement — which
must be built and covered by the §24.3–24.5 integration/security suites before production
acceptance (§26).
