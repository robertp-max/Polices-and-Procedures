# Care Indeed LMS Backend — API Contract (`/api/training/*`)

**Source of truth:** `docs/Employee_Journey/LMS_Backend/CARE_INDEED_LMS_BACKEND_ARCHITECTURE.md` §15–§16
**Domain:** `src/learning/domain/*.ts`
**Platform:** Google Cloud (this platform runs on GCP, **not** AWS)

> Provider mapping applied throughout. Architecture prose names AWS services; the
> production stack maps them as follows and the domain code is provider-neutral
> (`src/learning/domain/ports.ts`):
>
> | Architecture (AWS name) | Care Indeed production (GCP) | Domain port |
> |---|---|---|
> | Cognito | Existing Care Indeed authenticated workforce identity | (JWT verified at edge) |
> | DynamoDB `cihh-learning-records` / `-events` | Firestore | `LearningRecordStore`, `LearningEventStore` |
> | S3 upload-staging / artifacts | Google Cloud Storage (GCS) | `ArtifactStore` |
> | SQS (cert / evidence / notify / projection) | Cloud Tasks / Pub-Sub | `JobQueue` |
> | KMS (signed gate + manifest) | Cloud KMS | `Signer` |
> | CloudWatch | Cloud Logging / Monitoring | — |
> | Optional Drive mirror | Google Drive (non-authoritative) | `artifactRef.provider: 'DRIVE'` |

---

## 1. Cross-cutting request contract

Per architecture §15, **every mutation endpoint** requires all of:

| Requirement | Detail |
|---|---|
| `Authorization: Bearer <JWT>` | Care Indeed workforce identity token (arch. "Cognito JWT"). Verified at the edge → resolves the authenticated `identityProviderSubject` → the `LearningSubject`. The learner may **never** self-select a role (§5.1). |
| `Idempotency-Key: <opaque>` | Required on all `POST`/mutations. Deduplicated via `LearningEventStore.seen(idempotencyKey)` before the command is applied; a replay returns the prior result. Also flows into `LearningActivityEvent.idempotencyKey`. |
| Object-level authorization | Enforced **after** authentication against the target resource — see `AUTHORIZATION_MATRIX.md`. `self`-scope endpoints resolve `:subjectId = token.subject`; supervisor/admin endpoints check branch/acting-role scope. |
| Schema validation | Request body validated against the endpoint schema before any state read. |
| Conditional-write version | Optimistic concurrency via `LearningAssignment.version` (and per-aggregate versions); mismatches return `VERSION_CONFLICT`. |
| Audit / outbox write | Every accepted command writes a domain state change **and** an append-only `LearningActivityEvent` **and** an outbox record in one transactional flow (§17). |

`GET` endpoints require the JWT and object-level authz but not `Idempotency-Key`.

**Common headers**

```
Authorization: Bearer <jwt>          # all endpoints
Idempotency-Key: <ulid|uuid>         # all mutations (POST)
X-Correlation-Id: <opaque>           # optional; echoed into events + error.correlationId
Content-Type: application/json
```

---

## 2. Learner APIs (§15.1) — capability `training.self.*`, scope: **self only**

`:assignmentId`, `:sessionId`, `:attemptId`, `:evidenceId`, `:certificateId` must belong to the
token subject; otherwise `FORBIDDEN_OBJECT_SCOPE`.

| Method | Path | Auth cap | Idem-Key | Object-level rule | Request → Response (summary) | Domain function / port |
|---|---|---|---|---|---|---|
| GET | `/api/training/me` | `training.self.read` | — | subject = token | → `LearningSubject` + active `RoleAssignment[]` (no PHI) | `LearningRecordStore.getRoleAssignments` |
| GET | `/api/training/me/plan` | `training.self.read` | — | subject = token | → current `JourneyPlan` view | `LearningRecordStore.listAssignments` |
| GET | `/api/training/me/assignments` | `training.self.read` | — | subject = token | → `LearningAssignment[]` w/ derived `status` | `listAssignments` |
| GET | `/api/training/me/assignments/:assignmentId` | `training.self.read` | — | assignment.subjectId = token | → `LearningAssignment` + `statusReasonCodes` | `getAssignment` |
| POST | `/api/training/me/assignments/:assignmentId/start` | `training.self.activity.write` | ✔ | assignment.subjectId = token | {} → assignment `READY`→`IN_PROGRESS` | `deriveInitialStatus` (guard: must be `READY`) |
| POST | `/api/training/me/sessions` | `training.self.activity.write` | ✔ | assignment.subjectId = token | `{assignmentId, contentRef}` → `ActivitySession{state:OPEN}` | opens `ActivitySession` (`types.ts`) |
| POST | `/api/training/me/sessions/:sessionId/events` | `training.self.activity.write` | ✔ | session.subjectId = token | `HeartbeatInput` / activity event → `HeartbeatDecision{accepted, acceptedIncrementSec}` | `evaluateHeartbeat` (`activity.ts`); `ACTIVE_TIME` contract |
| POST | `/api/training/me/sessions/:sessionId/close` | `training.self.activity.write` | ✔ | session.subjectId = token | {} → `ActivitySession{state:CLOSED}` | session close; `meetsActiveTimeMinimum` |
| POST | `/api/training/me/assignments/:assignmentId/attempts` | `training.self.attempt.submit` | ✔ | assignment.subjectId = token | {} → `AssessmentAttempt{status:STARTED}` + server question-set (no answer key) | `canStartAttemptNow` → `assignAttemptNumber` → `selectQuestionSet` |
| POST | `/api/training/me/attempts/:attemptId/responses` | `training.self.attempt.submit` | ✔ | attempt→assignment.subjectId = token | `{responses}` (draft) → saved | `AssessmentAttempt.responseSetSha256` |
| POST | `/api/training/me/attempts/:attemptId/submit` | `training.self.attempt.submit` | ✔ | attempt→assignment.subjectId = token | {} → `ScoreResult` + `GradeResult` (+ `LadderDecision` on fail) | `scoreResponses` → `attemptPassed` → `decideGrade` → `ladderAfterFailure` |
| POST | `/api/training/me/policies/:assignmentId/confirm-review` | `training.self.activity.write` | ✔ | assignment.subjectId = token | {} → emits `policy.review.confirmed` | activity event (pinned `PolicyVersionRef`) |
| POST | `/api/training/me/policies/:assignmentId/attest` | `training.self.evidence.submit` | ✔ | assignment.subjectId = token | `{attestationTextVersion}` → `CompletionEvidence{type:POLICY_ATTESTATION, status:PENDING}` | evidence create; `policy.attested` |
| GET | `/api/training/me/competencies` | `training.self.read` | — | subject = token | → competency assignments | `listAssignments` (kind `COMPETENCY`) |
| POST | `/api/training/me/competencies/:assignmentId/request` | `training.self.activity.write` | ✔ | assignment.subjectId = token | {} → emits `competency.requested` | activity event |
| POST | `/api/training/me/external-training/upload-init` | `training.self.evidence.submit` | ✔ | subject = token | `{fileMeta}` → staging locator (signed URL) | `ArtifactStore.putStaging` → `signedDownloadUrl` |
| POST | `/api/training/me/external-training/:evidenceId/submit` | `training.self.evidence.submit` | ✔ | evidence.subjectId = token | {} → `CompletionEvidence{type:EXTERNAL_CERTIFICATE, status:PENDING}` | `ArtifactStore.promote` (validation deferred to reviewer) |
| GET | `/api/training/me/certificates` | `training.self.read` | — | subject = token | → `CertificateRecord[]` (ACTIVE/SUPERSEDED/REVOKED) | `LearningRecordStore` cert reads |
| GET | `/api/training/me/certificates/:certificateId/download` | `training.self.read` | — | cert.subjectId = token | → signed, time-limited GCS URL to PDF | `ArtifactStore.signedDownloadUrl` |
| GET | `/api/training/me/transcript` | `training.self.read` | — | subject = token | → transcript read model | reporting projection (§19.1) |

**Active-time note:** `POST .../sessions/:sessionId/events` is the enforcement point for the
§7.2 contract. `evaluateHeartbeat` rejects duplicates, non-monotonic sequences, background
tabs, unfocused windows, idle > 120s, and clock skew; caps each increment at 45s. See
`ACTIVITY_EVENT_CATALOG.md`.

---

## 3. Evaluator / Supervisor APIs (§15.2) — scope: **supervisor / branch / acting-role**

Object rule: target subject must be within the caller's supervised set (direct
`supervisorSubjectId` chain and/or same `branchId`). No self-approval (§10.3).

| Method | Path | Auth cap | Idem-Key | Object-level rule | Request → Response (summary) | Domain function / port |
|---|---|---|---|---|---|---|
| GET | `/api/training/review-queue` | `training.supervisor.read` | — | branch/supervisor scope | → pending reviews/signoffs/competency requests | reporting projection (§19.2) |
| GET | `/api/training/subjects/:subjectId/assignments` | `training.supervisor.read` | — | subject in caller scope | → `LearningAssignment[]` for subject | `listAssignments` |
| POST | `/api/training/competencies/:assignmentId/observation` | `training.evaluator.observe` | ✔ | evaluator ≠ learner; evaluator qualified; subject in scope | `CompetencyObservationInput` → `{outcome, reasonCodes}` | `recordCompetencyObservation` (rejects `SELF_EVALUATION_FORBIDDEN`) |
| POST | `/api/training/signoffs/:assignmentId` | `training.evaluator.sign` | ✔ | signer ≠ learner; distinct-human per group; real signature ref | `SignoffRecord` candidate → `{accepted, signoffs}` | `addSignoff` → `distinctHumanViolated` |
| POST | `/api/training/evidence/:evidenceId/validate` | `training.evaluator.observe` / `training.compliance.evidence.review` | ✔ | reviewer ≠ subject; artifact present | `{decision}` → `CompletionEvidence{status:VALID\|REJECTED}` | `validateEvidence` / `rejectEvidence` (`EVIDENCE_ARTIFACT_REQUIRED`) |
| POST | `/api/training/remediation/:caseId/action` | `training.supervisor.review` / `training.don.remediation` | ✔ | case subject in scope | `{action}` → `RemediationCase.state` transition | remediation state machine (§5.6) |
| POST | `/api/training/remediation/:caseId/reauthorize` | `training.don.remediation` | ✔ | case subject in scope; after review | {} → `ReattemptAuthorization{status:ACTIVE}` (single-use) | `isReattemptAuthorizationValid` / `consumeReattemptAuthorization` |

---

## 4. Administrator APIs (§15.3) — scope: **tenant / branch by capability**

| Method | Path | Auth cap | Idem-Key | Object-level rule | Request → Response (summary) | Domain function / port |
|---|---|---|---|---|---|---|
| GET | `/api/training/admin/definitions` | `training.definition.manage` | — | tenant scope | → `RequirementDefinition[]` (all versions) | `listPublishedRequirements` (+ drafts) |
| POST | `/api/training/admin/definitions` | `training.definition.manage` | ✔ | tenant scope | `RequirementDefinition` (DRAFT) → persisted, versioned | definition write |
| POST | `/api/training/admin/plans/resolve` | `training.hr.assign` | ✔ | subject in scope | `{subjectId}` → applicable `RequirementDefinition[]` + `LearningAssignment[]` | `resolveApplicableRequirements` → `buildAssignment` |
| POST | `/api/training/admin/assignments` | `training.hr.assign` | ✔ | subject in scope | `BuildAssignmentInput` → `LearningAssignment` | `buildAssignment` (`deriveInitialStatus`) |
| POST | `/api/training/admin/waivers` | `training.hr.waive` | ✔ | subject in scope | `{assignmentId, reason}` → assignment `WAIVED` | assignment status set (audited) |
| POST | `/api/training/admin/gates/evaluate` | `training.don.clearance` | ✔ | subject in scope | `{gateDefinitionId, subjectId}` → signed `GateDecision` | `evaluateGate` → `Signer.sign(stateVectorSha256)` |
| POST | `/api/training/admin/certificates/:definitionId/issue` | `training.certificate.issue` | ✔ | subject in scope; signed PASS gate | `{subjectId, gateDecisionId}` → `CertificateRecord` (idempotent) | `assertCertificateEligible` → `resolveIdempotentIssuance` → `buildCertificateManifest` → `JobQueue.enqueue` (renderer) |
| POST | `/api/training/admin/certificates/:certificateId/revoke` | `training.certificate.revoke` | ✔ | tenant scope | `{reason}` → `CertificateRecord{status:REVOKED}` | `revokeCertificate` (never deletes) |
| GET | `/api/training/admin/reports/compliance` | `training.compliance.audit.read` | — | tenant/branch scope | → aggregate compliance read model | reporting projection (§19.3) |

**Issuance is gated, not asserted:** `POST .../certificates/:definitionId/issue` calls
`assertCertificateEligible(gate, now)` which delegates to `canIssueCertificate` — it refuses
unless the referenced `GateDecision` is `gateType: CERTIFICATE_ELIGIBILITY`, `outcome: PASS`,
signed (`assertionSignature` present), and unexpired. A retry with the same
`issuanceKey(...)` returns the existing certificate (`RETURN_EXISTING`).

---

## 5. Public verification (§15.4) — **no auth**, data-minimized

| Method | Path | Auth | Idem-Key | Object rule | Response |
|---|---|---|---|---|---|
| GET | `/api/public/certificates/:publicId` | none (public) | — | resolve by `publicId` only | `PublicVerification` |

Returns **only** `publicVerificationView(...)` fields: `publicId`, `status`
(`ACTIVE`/`SUPERSEDED`/`REVOKED`), `title`, `issueDate`, `issuer`, `learnerDisplayName`.
Never exposes `employeeId`, scores, question responses, remediation detail, evidence, or
artifact paths (§12.3, §23). Backs the certificate QR code (`/verify/certificate/:publicId`).

---

## 6. Error model (§15.5) — stable machine-readable codes

All errors return HTTP status + this envelope:

```json
{
  "error": {
    "code": "ATTEMPT_LIMIT_REACHED",
    "message": "This assignment requires supervisor remediation before another attempt.",
    "correlationId": "01J..."
  }
}
```

- `code` is a **stable** enum (clients branch on it, never on `message`).
- `message` is human-readable and may change; contains no PHI, tokens, or answer keys.
- `correlationId` ties the response to the audit event stream.

### Canonical error codes (grounded in domain code)

| HTTP | `error.code` | Emitted by | Meaning |
|---|---|---|---|
| 401 | `UNAUTHENTICATED` | edge JWT verify | Missing/expired/invalid token |
| 403 | `FORBIDDEN_OBJECT_SCOPE` | object-level authz | Resource not in caller's self/branch/acting-role scope |
| 403 | `SUSPENDED_USER` | authz (subject.status) | Suspended/`ON_LEAVE`/`INACTIVE` subject denied write |
| 403 | `TERMINATED_READ_ONLY` | authz | `TERMINATED` subject: historical read only |
| 409 | `VERSION_CONFLICT` | conditional write | `LearningAssignment.version` (etc.) mismatch |
| 409 | `IDEMPOTENCY_REPLAY` | `LearningEventStore.seen` | Duplicate `Idempotency-Key`; prior result returned |
| 409 | `ATTEMPT_LIMIT_REACHED` | `canStartAttemptNow` | Ordinary limit hit, no active reauthorization |
| 409 | `COOLDOWN_ACTIVE` | `canStartAttemptNow` | Within post-2nd-failure cooldown window |
| 409 | `TRAINING_HOLD` | `ladderAfterFailure` | 3rd failure → hold; DON/HR review required |
| 400 | `SCORE_DENOMINATOR_MISSING` | `scoreResponses` / `isPass` | Assessment has no gradable denominator |
| 400 | `QUESTION_BANK_TOO_SMALL` | `selectQuestionSet` | Pool smaller than required question count |
| 422 | `NON_MONOTONIC_SEQUENCE` | `evaluateHeartbeat` | Out-of-order session heartbeat |
| 422 | `DUPLICATE_HEARTBEAT` | `evaluateHeartbeat` | Idempotently ignored heartbeat |
| 422 | `EVIDENCE_ARTIFACT_REQUIRED` | `validateEvidence` | Local image is not a promoted, hashed artifact |
| 422 | `EVIDENCE_NOT_PENDING` | `validateEvidence` | Evidence not in a validatable state |
| 422 | `DISTINCT_HUMAN_VIOLATION` | `addSignoff` / `distinctHumanViolated` | One human filling two slots in a distinct-human group |
| 422 | `SIGNATURE_SERVICE_REF_REQUIRED` | `addSignoff` | APPROVE signoff without a real signature-service reference |
| 422 | `SELF_EVALUATION_FORBIDDEN` | `recordCompetencyObservation` | Evaluator == learner |
| 422 | `EVALUATOR_NOT_QUALIFIED` | `recordCompetencyObservation` | Observer lacks qualification |
| 409 | `GATE_NOT_PASS` / `GATE_UNSIGNED` / `GATE_EXPIRED` / `WRONG_GATE_TYPE` | `canIssueCertificate` | Certificate issuance blocked by ineligible gate |
| 409 | `AUTH_NOT_BOUND` / `AUTH_EXPIRED` / `AUTH_ACTIVE`(state) | `isReattemptAuthorizationValid` | Reattempt authorization invalid for this subject/assignment/time |
| 409 | `ALREADY_REVOKED` / `CANNOT_SUPERSEDE_REVOKED` | `revokeCertificate` / `supersedeCertificate` | Illegal certificate lifecycle transition |
| 404 | `NOT_FOUND` | any read | Resource does not exist (or is not visible in scope) |

> Codes surfaced by the API are the domain functions' thrown `Error` names and returned
> `reason`/`reasonCode` values (see `assessment.ts`, `activity.ts`, `evidence.ts`,
> `invariants.ts`, `certificates.ts`). The transport layer maps them 1:1 to `error.code`.
