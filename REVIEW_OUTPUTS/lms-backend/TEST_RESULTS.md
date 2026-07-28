# Care Indeed LMS Backend — Test Results (Domain Layer)

## Run summary

Command (read-only, run for this report):

```
npx vitest run src/learning/domain/
```

Result: **9 test files · 94 tests · all passing** (vitest v3.2.6, ~1.3 s).
Type check: `tsc -p tsconfig.app.json --noEmit` → **clean (0 errors)**; the domain sources
compile under `strict` with no diagnostics.

```
✓ src/learning/domain/evidence.test.ts     (10)
✓ src/learning/domain/invariants.test.ts   (19)
✓ src/learning/domain/gates.test.ts         (5)
✓ src/learning/domain/recurrence.test.ts    (9)
✓ src/learning/domain/planning.test.ts     (10)
✓ src/learning/domain/certificates.test.ts  (7)
✓ src/learning/domain/assessment.test.ts   (18)
✓ src/learning/domain/activity.test.ts      (8)
✓ src/learning/domain/migration.test.ts     (8)
Test Files  9 passed (9)
      Tests  94 passed (94)
```

## Per-file coverage → architecture §24.1 / §24.2 mapping

| Test file | Tests | §24.1 unit categories | §24.2 property/invariant categories |
|-----------|:----:|-----------------------|-------------------------------------|
| `invariants.test.ts` | 19 | grade calc, critical-error failure, attempt selection, distinct-human signatures, cert-issuance/clearance separation | **completion never passes without required evidence**; **attempt number never decreases/duplicates** (strictly max+1, reattempt continues numbering); **certificate never issues from a non-signed/non-PASS/expired gate**; unrounded-threshold pass/fail; missing-denominator throws (release gate) |
| `assessment.test.ts` | 18 | grade calc (server key, 4dp %), critical-error failure, attempt selection (`decideGrade`), cooldown/lockout ladder (10q/80%/3), server question-set selection (deterministic seed), identity-bound single-use reauthorization | **attempt number never resets/duplicates**; cooldown/hold ladder is monotonic |
| `evidence.test.ts` | 10 | distinct-human signatures, competency evaluator/self-eval rule, signature-service-ref requirement, personnel-file routing (canonical GCS / Drive mirror) | **evidence lifecycle append-only** — supersede/reject never overwrite; VALID requires a real hashed artifact (local image is not one) |
| `planning.test.ts` | 10 | role/duty resolution (no self-selected roles), version/effectivity filtering, attempt selection prerequisites | assignment status is **derived, never a client claim**; `buildAssignment` **never yields COMPLETED** and pins the content ref |
| `recurrence.test.ts` | 9 | recurrence cycle keys, credit aggregation, HHA rolling 12-hour accumulation | **annual lapse never edits history** — lapse affects readiness but preserves history; dedupe via unique cycle key; 12h requires accrued accepted hours (not a boolean) |
| `activity.test.ts` | 8 | cooldown/lockout adjacent — active-time heartbeat validation, cap, idempotency | active-time is monotonic/idempotent; background-tab/idle/clock-skew rejected; **last page alone never meets the minimum** |
| `certificates.test.ts` | 7 | certificate idempotency (`issuanceKey`), eligibility from signed PASS gate | **certificate never issues from a FAIL/CONDITIONAL/unsigned gate**; **revocation never deletes history**; **annual lapse never rewrites a historical onboarding certificate**; manifest deterministic + order-independent source of truth |
| `gates.test.ts` | 5 | gate rules (allOf/anyOf, reason codes) | override converts FAIL→CONDITIONAL **without hiding reasons**; consumption accepts only a signed, non-stale, non-expired PASS |
| `migration.test.ts` | 8 | role resolution / legacy classification (§21) | **no boolean-to-pass**: `clearedForIndependentWork`/`appendixFCleared` never create a signed gate; SCORM in-progress imports as progress only; unknown/alias IDs quarantined/rejected; idempotent reruns |

### The five named §24.2 property/invariants — all covered now

1. **completion-never-passes-without-evidence** — `invariants.test.ts` ("never completes with
   missing required evidence") over `deriveCompletion`.
2. **cert-never-from-FAIL-gate** — `invariants.test.ts` + `certificates.test.ts` over
   `canIssueCertificate` / `assertCertificateEligible` (rejects non-PASS, unsigned, expired).
3. **attempt-number-never-decreases** — `invariants.test.ts` + `assessment.test.ts` over
   `nextAttemptNumber` / `assignAttemptNumber` (strictly max+1; reattempt continues, never resets).
4. **revocation-never-deletes-history** — `certificates.test.ts` over `revokeCertificate` /
   `supersedeCertificate` (status transitions, no deletion).
5. **annual-lapse-never-edits-history** — `certificates.test.ts` +
   `recurrence.test.ts` over `annualLapseAffectsHistoricalCertificate()` / `lapseImpact`.

## Covered now vs. still required

### Covered now (pure domain — §24.1 unit + §24.2 property)

All non-negotiable business rules are proven in-memory with injected fakes: server-side
grading, derived completion, append-only attempts/evidence, distinct-human signoff, gate
signature/staleness/expiry checks, certificate idempotency + immutable revocation, recurrence
keys + HHA hours, active-time validation, and legacy-migration classification. No cloud
dependency is exercised; the domain depends only on the `ports.ts` interfaces.

### Not covered yet — requires the live service

These suites cannot run against the pure domain and are **outstanding** for production
acceptance (§26):

- **§24.3 Integration** — authenticated actor → assignment → session → attempt → grade;
  policy-version → quiz → attestation → evidence; competency → evaluator signoff;
  gate evaluation → certificate job → **GCS** artifact; revocation → public verification.
  (Requires real auth, Firestore, Cloud Tasks, KMS, GCS.)
- **§24.4 Concurrency / idempotency** — duplicate submit, double-click certificate issue,
  out-of-order heartbeat at the transport layer, retry-after-timeout, two supervisors signing
  simultaneously, role change mid-assignment, policy superseded during an attempt.
- **§24.5 Security (live)** — forged subject/role headers, learner-reads-another-learner,
  expired JWT, suspended-user denial, object-level authorization over the real API, presigned
  URL expiry. (Domain covers answer-key non-exposure and data-minimized verification only.)
- **§24.6 Browser** — cross-device resume, offline/sync, attempt lockout UX, remediation flow,
  competency request, certificate download, QR verification, screen-reader/keyboard, mobile
  field-worker layout.

## Bottom line

The domain layer is **green and type-clean** (9 files / 94 tests / `tsc` clean) and every
architecture §24.2 property invariant has a passing test. What remains before the §26 minimum
production acceptance is the **live layer**: the integration, concurrency, live-security, and
browser suites, which depend on the Google Cloud adapters that the domain ports only stub.
