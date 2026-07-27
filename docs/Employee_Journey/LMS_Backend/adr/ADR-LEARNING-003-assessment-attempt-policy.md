# ADR-LEARNING-003 — Assessment and attempt policy

**Status:** Accepted (Wave 0) — resolves the post-third-failure reattempt rule
**Date:** 2026-07-27
**Controlling spec:** architecture §8, §6.6, §6.7; implementation prompt "Non-negotiable rules"

## Context

Approved P&P activities use **10 questions, 80% pass, 3 ordinary attempts** (§8.6).
The architecture requires the **post-third-failure reattempt rule to be resolved
before any `AttemptPolicy` record is published** (impl prompt Wave 0). Scoring,
answer keys, and attempt numbers must be server-authoritative and immutable
(§3.1, §3.3), and question banks must not ship answer keys (§8.7).

## Decision

1. **Ordinary attempt ladder (approved P&P `AttemptPolicy` v1):**
   - **Fail 1:** immediate retake permitted; relevant policy sections re-shown.
   - **Fail 2:** 24-hour cooldown; supervisor notification; remediation assignment opened.
   - **Fail 3:** **training hold** on the assignment; DON/HR review; mandatory 1:1
     remediation. **No 4th attempt exists on the original authorization.**

2. **Reattempt after third failure requires an identity-bound
   `ReattemptAuthorization`.** It is issued only after the `RemediationCase` closes
   (`state: REAUTHORIZED`), is bound to `subjectId` + `assignmentId` + the closing
   remediation case, has an expiry, and is single-use. It opens a **new attempt
   cycle** whose `attemptNumber` continues to increment (4, 5, …) — it does **not**
   delete, alter, or reset attempts 1–3. Grades and attempts remain append-only.

3. **Scoring is server-only.** Each attempt receives a server-generated
   question-set manifest (`questionSetSha256`); option/question order randomized
   server-side; correct answers never leave the server; consecutive P&P attempts
   draw a different 10-question set when the approved pool supports it (§8.7).

4. **Pass/fail** compares the **unrounded** percentage to the threshold; raw stored
   exactly; percentage stored to 4 dp; UI displays 1 dp (§8.3).

5. **Critical-error rule.** Scenario/safety assessments may fail an attempt despite
   a high percentage; the `GradeResult` records the `criticalFailureCodes` reason (§8.4).

6. **Grade selection** is governed by a versioned `GradePolicy`
   (`FIRST_PASS | HIGHEST_SCORE | LATEST_ATTEMPT | LATEST_PASS | EVALUATOR_DECISION
   | ALL_COMPONENTS_REQUIRED`) — default for approved P&P is **`LATEST_PASS`**; no
   global "highest score" assumption (§8.2). All attempts stay visible to reviewers.

7. **Competency** is not a percentage quiz — outcomes are
   `VALIDATED | VALIDATED_WITH_CONDITION | NEEDS_IMPROVEMENT | FAILED | PENDING_EVALUATOR`,
   requiring a qualified evaluator + observation evidence + signoff (§8.5).

## Consequences

- `AttemptPolicy` and `GradePolicy` are publishable now that the third-failure rule
  is fixed; both are versioned and version-pinned into each assignment.
- Regrades create a new `ScoreResult`/`GradeResult`; the original is never overwritten (§8.7).
- Satisfies §22 gates: missing threshold/denominator or unversioned bank → release fails.

## Rejected alternatives

- **Unlimited retakes / auto-reset after 3** — rejected: violates the mandated
  hold + review + identity-bound reauthorization.
- **Highest-score everywhere** — rejected by §8.2.
