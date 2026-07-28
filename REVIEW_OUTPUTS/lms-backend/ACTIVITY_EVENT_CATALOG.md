# Care Indeed LMS Backend — Activity & Event Catalog

**Source of truth:** `CARE_INDEED_LMS_BACKEND_ARCHITECTURE.md` §7.1 (event categories) + §7.2 (active-time rules)
**Domain:** `src/learning/domain/types.ts` (`LearningActivityEvent`, `ActivitySession`), `src/learning/domain/activity.ts` (`evaluateHeartbeat`, `ACTIVE_TIME`)
**Platform:** Google Cloud — events land in Firestore (`LearningEventStore`, arch. "DynamoDB learning events") and drive the transactional outbox → Cloud Tasks / Pub-Sub projections.

> **No PHI (§3.8).** No event payload may contain patient-identifying information.
> Sensitive documents and detailed remediation narratives live in encrypted artifact
> storage (GCS), **not** in event payloads (§17). Payloads below list only
> non-PHI, non-answer-key fields.

---

## 1. Event envelope (every event)

Every event is a `LearningActivityEvent` (`types.ts`):

```ts
interface LearningActivityEvent {
  id: Uuid;
  tenantId: string;
  subjectId: Uuid;          // the learner the event is about
  actorSubjectId: Uuid;     // who caused it (self, supervisor, SYSTEM)
  assignmentId: Uuid;
  sessionId?: Uuid;
  eventType: string;        // one of the catalog values below
  eventVersion: number;     // schema version for eventType
  sequence?: number;        // monotonic within a session (activity events)
  occurredAt: Iso;          // client/source time
  receivedAt: Iso;          // server acceptance time
  idempotencyKey: string;   // dedupe key (LearningEventStore.seen)
  correlationId: string;
  causationId?: string;     // event that caused this one
  contentRef?: ContentRevisionRef;  // pinned id+version+sha256
  payload: Record<string, unknown>; // NO PHI
  payloadSha256: string;    // integrity hash of payload
}
```

**Universal idempotency/sequence rules**

- Consumers deduplicate on `idempotencyKey` (§17). `LearningEventStore.seen(idempotencyKey)` returns `true` for a replay; the event is recorded once.
- `receivedAt` is server-authoritative; `occurredAt` is validated against allowed clock skew.
- Optional high-assurance chain (§17): `event hash + previous event hash + stream ID + sequence`.
- Every accepted command writes state change + append-only event + outbox record + audit actor/time/correlation in one transactional flow.

---

## 2. Active-time contract (§7.2) — applies to `activity.session.heartbeat`

Enforced by `evaluateHeartbeat(input)` against `ACTIVE_TIME` (`activity.ts`):

```ts
export const ACTIVE_TIME = {
  heartbeatIntervalSec: 30,      // client emits a beat every 30s
  maxAcceptedIncrementSec: 45,   // server caps each beat's credited time at 45s
  idleThresholdSec: 120,         // > 120s since last event => idle, not credited
} as const;
```

A heartbeat is credited **only** when all hold (`HeartbeatDecision.accepted === true`):

| Rule | Reject reason code (when violated) |
|---|---|
| Not a duplicate (`alreadySeenIdempotencyKey === false`) | `DUPLICATE_HEARTBEAT` |
| `sequence > lastAcceptedSequence` (strictly monotonic) | `NON_MONOTONIC_SEQUENCE` |
| Page visible (`pageVisible === true`) | `PAGE_NOT_VISIBLE` |
| Window focused (`windowFocused === true`) | `WINDOW_NOT_FOCUSED` |
| Not idle (`secondsSinceLastEvent <= 120`) | `IDLE_EXCEEDED` |
| Clock skew within bound (`serverClockSkewSec <= maxClockSkewSec`) | `CLOCK_SKEW` |

When accepted, credited time = `min(claimedIncrementSec, 45)` and is added to
`ActivitySession.acceptedActiveSeconds`. **Background-tab time is never accepted.
Opening the last page does not satisfy active-time or content-completion.** Whether a
minimum is required is checked by `meetsActiveTimeMinimum(acceptedActiveSeconds, minSeconds?)`
and only "when the published requirement says it matters."

`ActivitySession` tracks `acceptedActiveSeconds` and `lastAcceptedSequence`; state is
`OPEN | CLOSED | ABANDONED | INVALIDATED`.

---

## 3. Event catalog by category (§7.1)

Legend — **Idempotency key basis** describes what makes the event unique for dedupe.
`SYSTEM` in the actor column means the event is emitted by a server worker, not a user.

### 3.1 Assignment lifecycle

| eventType | When emitted | Actor | Payload (no PHI) | Idempotency / sequence |
|---|---|---|---|---|
| `assignment.created` | Plan resolution builds a `LearningAssignment` (`buildAssignment`) | SYSTEM | `{requirementRef, pinnedContentRef?, initialStatus, statusReasonCodes}` | key = assignmentId + version=1; no session sequence |
| `assignment.ready` | Content resolves + prereqs met → `READY` (`deriveInitialStatus`) | SYSTEM | `{previousStatus, status:'READY'}` | key = assignmentId + status transition |
| `assignment.started` | Learner starts (`POST .../start`); `READY`→`IN_PROGRESS` | self | `{startedAt}` | key = assignmentId + 'started' |
| `assignment.blocked` | Content unavailable/hash mismatch or prereq unmet | SYSTEM | `{status:'BLOCKED_CONTENT'\|'LOCKED_PREREQUISITE', reasonCodes}` | key = assignmentId + reasonCodes hash |
| `assignment.completed` | Derived completion passes (`deriveCompletion` → `completed:true`) | SYSTEM | `{completionDecisionId, gradeOutcome?, evidenceIds}` | key = assignmentId + completionDecisionId |
| `assignment.reopened` | Supersession/regrade reopens a prior completion | SYSTEM | `{reasonCodes, priorCompletionDecisionId}` | key = assignmentId + reopen reason |

### 3.2 Activity / session (active-time governed)

| eventType | When emitted | Actor | Payload (no PHI) | Idempotency / sequence |
|---|---|---|---|---|
| `activity.session.started` | `POST /me/sessions` opens an `ActivitySession` | self | `{sessionId, contentRef, startedAt}` | key = sessionId + 'started'; sequence starts |
| `activity.session.heartbeat` | Client 30s beat (`POST /me/sessions/:id/events`) | self | `{sequence, claimedIncrementSec, pageVisible, windowFocused, secondsSinceLastEvent}` | **must be monotonic** `sequence`; dupes ignored; credited increment capped at 45s |
| `activity.session.closed` | `POST /me/sessions/:id/close`; `state`→`CLOSED` | self | `{acceptedActiveSeconds, lastAcceptedSequence, endedAt}` | key = sessionId + 'closed' |
| `lesson.opened` | Learner opens a lesson unit | self | `{lessonRef, contentRef}` | key = sessionId + lessonRef + seq |
| `lesson.viewed` | Lesson view threshold reached | self | `{lessonRef, viewedSeconds}` | key = sessionId + lessonRef + seq |
| `interaction.completed` | An interactive element completed | self | `{interactionRef, result}` | key = sessionId + interactionRef + seq |
| `bookmark.updated` | Resume position saved (draft only, non-authoritative) | self | `{location}` (SCORM `cmi.core.lesson_location`) | key = sessionId + 'bookmark' (last-writer) |

> These are the only events where §7.2 active-time enforcement applies (via
> `activity.session.heartbeat`). Bookmarks/resume are convenience state and never
> authoritative for completion (§3.1).

### 3.3 Assessment

| eventType | When emitted | Actor | Payload (no PHI, no answer key) | Idempotency / sequence |
|---|---|---|---|---|
| `assessment.started` | `POST .../attempts`; attempt created (`canStartAttemptNow` passes) | self | `{attemptId, attemptNumber, questionSetSha256}` | key = attemptId + 'started' |
| `assessment.response.saved` | `POST .../responses` (draft) | self | `{attemptId, questionCountAnswered}` (**no chosen options in cleartext**) | key = attemptId + responseSetSha256 |
| `assessment.submitted` | `POST .../submit` | self | `{attemptId, submittedAt, responseSetSha256}` | key = attemptId + 'submitted' |
| `assessment.scored` | Server scores (`scoreResponses`) | SYSTEM | `{attemptId, rawEarned, rawPossible, percentage(4dp), criticalFailureCodes, scoringEngineVersion}` | key = attemptId + resultSha256 |
| `assessment.passed` | `attemptPassed` true; grade `PASSED` | SYSTEM | `{attemptId, gradeResultId, selectedAttemptId}` | key = assignmentId + gradeDecisionSha256 |
| `assessment.failed` | Attempt fails (score < threshold or critical error) | SYSTEM | `{attemptId, ladderAction, cooldownSeconds?, noFurtherOrdinaryAttempts}` | key = attemptId + 'failed' |
| `assessment.voided` | Attempt voided (technical error / integrity) | SYSTEM/admin | `{attemptId, reasonCodes}` | key = attemptId + 'voided' |
| `assessment.regraded` | Regrade → new `ScoreResult`/`GradeResult` (never overwrites) | SYSTEM/admin | `{attemptId, newGradeResultId, priorGradeResultId}` | key = attemptId + newDecisionSha256 |

> Answer keys never appear in payloads (`ScoreInput.answerKey` is SERVER ONLY, `assessment.ts`).
> `percentage` is stored to 4dp; pass/fail compares the **unrounded** percentage (`isPass`).
> Critical failure (e.g. failed-to-report-abuse) forces FAIL regardless of % (`isPass` returns
> false when `criticalFailureCodes.length > 0`).

### 3.4 Policy (P&P as a Journey activity, §3.7)

| eventType | When emitted | Actor | Payload (no PHI) | Idempotency / sequence |
|---|---|---|---|---|
| `policy.opened` | Learner opens a policy assignment | self | `{policyVersionRef}` (id+version+sha256) | key = assignmentId + policyVersion + 'opened' |
| `policy.section.viewed` | A policy section view threshold reached | self | `{policyVersionRef, sectionRef}` | key = assignmentId + sectionRef + seq |
| `policy.review.confirmed` | `POST .../confirm-review` | self | `{policyVersionRef, confirmedAt}` | key = assignmentId + policyVersion + 'review' |
| `policy.attested` | `POST .../attest` → `POLICY_ATTESTATION` evidence | self | `{policyVersionRef, attestationTextVersion, evidenceId}` | key = assignmentId + policyVersion + attestationTextVersion |

> P&P quiz uses `APPROVED_PNP_ATTEMPT_POLICY` (`assessment.ts`): 10 questions, 80% pass,
> 3 ordinary attempts, 24h cooldown after the 2nd failure — the assessment events (§3.3)
> carry those attempts; policy events carry reading + attestation.

### 3.5 Competency

| eventType | When emitted | Actor | Payload (no PHI) | Idempotency / sequence |
|---|---|---|---|---|
| `competency.requested` | `POST /me/competencies/:id/request` | self | `{assignmentId, requestedAt}` | key = assignmentId + 'requested' |
| `competency.scheduled` | Evaluator schedules observation | supervisor | `{scheduledFor, evaluatorSubjectId}` | key = assignmentId + scheduledFor |
| `competency.observed` | `POST /competencies/:id/observation` recorded | evaluator | `{outcome, reasonCodes, evaluatorSubjectId}` | key = assignmentId + observationId |
| `competency.approved` | Observation outcome `VALIDATED[_WITH_CONDITION]` | evaluator | `{outcome, evidenceId, signoffId}` | key = assignmentId + observationId + 'approved' |
| `competency.rejected` | Outcome `NEEDS_IMPROVEMENT`/`FAILED`/`PENDING_EVALUATOR` | evaluator | `{outcome, reasonCodes}` | key = assignmentId + observationId + 'rejected' |

> `recordCompetencyObservation` returns `PENDING_EVALUATOR` with reason codes
> `SELF_EVALUATION_FORBIDDEN` / `EVALUATOR_NOT_QUALIFIED` / `OBSERVATION_EVIDENCE_MISSING`
> when preconditions fail — those surface via `competency.rejected`.

### 3.6 Evidence

| eventType | When emitted | Actor | Payload (no PHI) | Idempotency / sequence |
|---|---|---|---|---|
| `evidence.upload.requested` | `POST .../upload-init` (staging URL issued) | self | `{evidenceType, stagingLocator}` | key = idempotencyKey of request |
| `evidence.uploaded` | Artifact promoted to validated storage (`ArtifactStore.promote`) | self | `{evidenceId, artifactRef:{provider:'GCS', locator, versionId, sha256}}` | key = evidenceId + sha256 |
| `evidence.validated` | Reviewer validates (`validateEvidence`) → `VALID` | reviewer | `{evidenceId, validatedBy, validatedAt}` | key = evidenceId + 'valid' |
| `evidence.rejected` | Reviewer rejects (`rejectEvidence`) → `REJECTED` | reviewer | `{evidenceId, validatedBy, reasonCodes}` | key = evidenceId + 'rejected' |
| `evidence.superseded` | Newer evidence supersedes prior VALID (`supersedeEvidence`) | SYSTEM/reviewer | `{priorEvidenceId, replacementEvidenceId}` | key = priorEvidenceId + 'superseded' |

> `validateEvidence` throws `EVIDENCE_ARTIFACT_REQUIRED` unless a promoted, hashed artifact
> exists (a local signature image is not an artifact). Allowed transitions:
> `PENDING→VALID|REJECTED`, `VALID→SUPERSEDED|REVOKED` (`canTransitionEvidence`).
> Canonical store is GCS + Firestore; Drive mirror is non-authoritative and only for
> VALID, non-legal-hold evidence (`personnelFileRouting`).

### 3.7 Signoff

| eventType | When emitted | Actor | Payload (no PHI) | Idempotency / sequence |
|---|---|---|---|---|
| `signoff.requested` | Assignment enters `PENDING_SIGNOFF` | SYSTEM | `{assignmentId, requiredSignerSlots}` | key = assignmentId + 'signoff-req' |
| `signoff.completed` | `POST /signoffs/:id` accepted (`addSignoff`) | evaluator | `{signoffId, signerSlot, actingRoleAssignmentId, distinctHumanGroup?, decision:'APPROVE', signatureServiceRef}` | key = assignmentId + signerSlot + signerSubjectId |
| `signoff.rejected` | Signoff rejected or `DISTINCT_HUMAN_VIOLATION` | evaluator/SYSTEM | `{signerSlot, reasonCodes}` | key = assignmentId + signerSlot + 'rejected' |

> `addSignoff` refuses `SIGNATURE_SERVICE_REF_REQUIRED` (no real signature ref on APPROVE)
> and `DISTINCT_HUMAN_VIOLATION` (one human, two slots in a `distinctHumanGroup` —
> `distinctHumanViolated`). Store `signerSubjectId`, `actingRoleAssignmentId`, `signerSlot`,
> `distinctHumanGroup` (§10.3).

### 3.8 Remediation

| eventType | When emitted | Actor | Payload (no PHI) | Idempotency / sequence |
|---|---|---|---|---|
| `remediation.opened` | Ladder opens a case (`ladderAfterFailure.openRemediation`) | SYSTEM | `{caseId, triggerAttemptId, requiredActions}` (**no narrative**) | key = caseId + 'opened' |
| `remediation.cooldown.started` | 2nd failure → cooldown (`LadderDecision.action:'COOLDOWN'`) | SYSTEM | `{caseId, cooldownSeconds}` | key = caseId + cooldownUntil |
| `remediation.reauthorized` | DON/HR reauthorizes (`POST /remediation/:id/reauthorize`) | DON/HR | `{caseId, reattemptAuthorizationId, expiresAt}` | key = reattemptAuthorizationId |
| `remediation.closed` | Case closed | supervisor/DON | `{caseId, closedBy}` | key = caseId + 'closed' |

> Detailed remediation narratives are stored in encrypted artifact storage, not payloads (§17).

### 3.9 Gate

| eventType | When emitted | Actor | Payload (no PHI) | Idempotency / sequence |
|---|---|---|---|---|
| `gate.evaluated` | `evaluateGate` runs; decision signed by Cloud KMS (`Signer.sign`) | SYSTEM | `{gateDecisionId, gateType, outcome, reasonCodes, stateVectorSha256, evaluatorVersion}` | key = gateDefinitionRef + subjectId + stateVectorSha256 |
| `gate.changed` | Re-evaluation yields a different outcome vs prior decision | SYSTEM | `{gateType, previousOutcome, outcome, stateVectorSha256}` | key = gateType + subjectId + new stateVectorSha256 |

> Distinct state vectors ⇒ distinct decisions; the same `stateVectorSha256` re-evaluation is
> idempotent. Consumers accept only a signed, non-stale `PASS` (`acceptGateForConsumption`).

### 3.10 Certificate

| eventType | When emitted | Actor | Payload (no PHI) | Idempotency / sequence |
|---|---|---|---|---|
| `certificate.requested` | Issue endpoint accepted; eligibility asserted (`assertCertificateEligible`) | admin/SYSTEM | `{certificateDefinitionRef, gateDecisionId, issuanceKey}` | key = `issuanceKey(...)` (subject#def#vN#cycle#snapshotSha) |
| `certificate.generated` | Renderer worker builds PDF + transcript + manifest | SYSTEM | `{publicId, manifestFingerprint, artifactEvidenceId}` | key = issuanceKey + 'generated' |
| `certificate.issued` | `CertificateRecord` committed | SYSTEM | `{certificateId, publicId, status:'ACTIVE'}` | key = issuanceKey (dedupe → `RETURN_EXISTING`) |
| `certificate.revoked` | `revokeCertificate` | admin | `{certificateId, revocationReason}` | key = certificateId + 'revoked' |
| `certificate.superseded` | `supersedeCertificate` | SYSTEM/admin | `{priorCertificateId, replacementCertificateId}` | key = priorCertificateId + 'superseded' |

> Idempotent issuance (§12.5): a retry with the same `issuanceKey` returns the existing
> certificate (`resolveIdempotentIssuance` → `RETURN_EXISTING`) instead of duplicating.
> The manifest — not the PDF — is the source of truth (§27); `manifestFingerprint` must
> reproduce identically. Certificates are never deleted (§12.6).

### 3.11 Recurrence

| eventType | When emitted | Actor | Payload (no PHI) | Idempotency / sequence |
|---|---|---|---|---|
| `recurrence.cycle.opened` | A `RecurrenceCycle` opens for a subject/requirement | SYSTEM | `{cycleId, cycleKey, requirementRef, windowStart, dueAt, windowEnd}` | key = subject + requirementRev + ruleRev + cycleKey |
| `recurrence.cycle.satisfied` | Cycle requirements met | SYSTEM | `{cycleId, satisfiedAt, accumulatedValue?}` | key = cycleId + 'satisfied' |
| `recurrence.cycle.overdue` | `dueAt` passes unsatisfied | SYSTEM | `{cycleId, dueAt}` | key = cycleId + 'overdue' |

> The unique cycle key (`subject + requirement revision + recurrence-rule revision +
> cycleKey`, §14.2) prevents duplicate annual assignments. A current annual lapse changes
> readiness/clearance but never erases historical completion or certificates (§14.3;
> `annualLapseAffectsHistoricalCertificate` returns `false`).

---

## 4. Offline / sync (§7.3)

Field-worker clients queue signed event envelopes locally as `PENDING_SYNC`. On reconnect the
server validates sequence/version/time before acceptance; official status changes **only** after
server acceptance. UI must distinguish: `Saved on this device` / `Syncing` / `Synced` /
`Rejected — action required`. Duplicate replays are absorbed by `idempotencyKey` dedupe.

## 5. SCORM 1.2 projection (§7.4)

SCORM data maps into the canonical events above (it does not directly issue certificates):

| SCORM element | Projected into |
|---|---|
| `cmi.core.lesson_status` | `lesson.viewed` / `assignment.completed` (validated, not trusted) |
| `cmi.core.score.raw` / `.min` / `.max` | `assessment.scored` inputs (re-scored server-side) |
| `cmi.core.session_time` | `activity.session.heartbeat` credited time (subject to §7.2 caps) |
| `cmi.core.lesson_location` | `bookmark.updated` (resume only) |
| `cmi.suspend_data` | session draft state (non-authoritative) |
