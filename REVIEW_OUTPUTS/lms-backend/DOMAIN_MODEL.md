# LMS Backend — Domain Model (Wave 1)

**Branch:** `feature/employee-journey-lms-backend`
**Location:** `src/learning/domain/`
**Nature:** provider-neutral TypeScript. No cloud SDK imports. GCP adapters are a later wave behind ports.

## Files

| File | Contents |
|---|---|
| `types.ts` | Canonical domain types per architecture §6 — `LearningSubject`, `RoleAssignment`, `ContentRevision`, `RequirementDefinition`, `LearningAssignment`, `AssessmentAttempt`, `ScoreResult`, `GradeResult`, `ReattemptAuthorization`, `CompletionEvidence`, `SignoffRecord`, `GateDecision` (incl. `gateType`), `CertificateRecord`, + `VersionRef`/`PolicyVersionRef`/`ContentRevisionRef`. |
| `invariants.ts` | Pure enforcement of the non-negotiable rules (server authority). |
| `invariants.test.ts` | 19 property/invariant tests (§24.2) — **all passing**. |

## Invariants enforced (and tested)

| Rule | Function | Architecture ref |
|---|---|---|
| Completion is derived, never a standalone boolean | `deriveCompletion` | §3.4, §9 |
| Never complete with missing evidence / non-pass grade / open remediation / unmet active-time / missing signoff | `deriveCompletion` | §3.1, §9, §7.2 |
| Attempts append-only; numbering never resets; reattempt continues numbering | `nextAttemptNumber` | §3.3, §8.6, ADR-003 |
| 4th ordinary attempt blocked without identity-bound reauthorization | `canStartAttempt` | §8.6, ADR-003 |
| Pass compares **unrounded** %; critical error fails regardless; missing denominator throws | `isPass` | §8.3, §8.4, §22 |
| Grade selection by versioned policy (LATEST_PASS default; no global highest) | `selectGradedAttempt` | §8.2 |
| Distinct-human: one human cannot fill two slots in a group | `distinctHumanViolated` | §10.3 |
| Certificate issues only from a **signed, PASS, non-expired** eligibility gate | `canIssueCertificate` | §11, §12, §24.2 |
| A certificate never grants clearance by itself | `certificateGrantsClearance` | §3.5, ADR-004 |
| Only server-VALIDATED evidence counts (a local image is not) | `isEvidenceCountable` | §3.1, §21.2 |

## Test result

```
npx vitest run src/learning/domain/invariants.test.ts
→ 1 file, 19 tests, all passed (≈1.5s)
```

## Not yet implemented (later waves, ports already implied)

Firestore/GCS/Cloud KMS/Cloud Tasks adapters, the `/api/training/*` HTTP surface,
question-bank service, activity/heartbeat service, gate engine evaluation over
`GateDefinition` rule trees, certificate renderer, recurrence, and `ci-journey-v1`
migration. Each consumes the domain via ports; none requires changing the types or
invariants above. No live GCP wiring or deployment is performed here.
