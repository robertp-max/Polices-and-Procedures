# Assessment & Grade Rules

**Scope:** Care Indeed LMS backend — grade and assessment architecture (architecture §8).
**Ground truth code:** `src/learning/domain/assessment.ts`, `src/learning/domain/invariants.ts`, `src/learning/domain/types.ts`.
**Deployment target:** Google Cloud (Firestore records, Cloud Storage / GCS artifacts, Cloud KMS signatures) per ADR-LEARNING-001. Answer keys never leave the server; scores and grades are server-computed and append-only.

> Every rule below maps to a real exported symbol. The browser is never authoritative for scores, pass/fail, attempt number, or grade (§3.1).

---

## 1. Assessment definition fields (§8.1)

An assessment definition is pinned into a `RequirementDefinition` (`types.ts`) via `attemptPolicyRef` and `gradePolicyRef`. The concrete server-side policy objects are:

| Field (architecture §8.1) | Code representation | Symbol / file |
|---|---|---|
| Question count | `AttemptPolicy.questionCount` (10 for P&P) | `assessment.ts` |
| Pass threshold | `AttemptPolicy.passThresholdPct` (80) | `assessment.ts` |
| Max attempts | `AttemptPolicy.ordinaryAttemptLimit` (3) | `assessment.ts` |
| Cooldown rules | `AttemptPolicy.cooldownSecondsAfterAttempt` (`{ 2: 86400 }`) | `assessment.ts` |
| Selection algorithm (question set) | `selectQuestionSet()` | `assessment.ts` |
| Grade-selection rule | `GradePolicy.selectionPolicy` | `assessment.ts` |
| Critical-error rules | `ScoreInput.criticalQuestionIds` → `scoreResponses()` | `assessment.ts` |
| Attempt version binding | `AttemptPolicy.id` + `version`, `GradePolicy.id` + `version` | `assessment.ts` |

`AttemptPolicy` interface (`assessment.ts`):

```ts
interface AttemptPolicy {
  id: string;
  version: number;
  ordinaryAttemptLimit: number;                   // 3 for approved P&P
  passThresholdPct: number;                        // 80
  questionCount: number;                           // 10
  cooldownSecondsAfterAttempt: Record<number, number>; // { 2: 86400 }
}
```

Both policies are versioned and pinned into the assignment snapshot, so a historical attempt is always graded by the exact policy that was in force (§3.2 exact version binding).

---

## 2. Attempt-selection policies (§8.2)

The union `AttemptSelectionPolicy` (`types.ts`) enumerates the six supported policies. Selection is implemented by **`selectGradedAttempt(attempts, policy)`** in `invariants.ts`, which is called by **`decideGrade()`** in `assessment.ts`.

| Policy | Behavior in `selectGradedAttempt` | Notes |
|---|---|---|
| `FIRST_PASS` | Earliest attempt (by `attemptNumber`) with `passed === true` | `passes[0]` |
| `HIGHEST_SCORE` | Attempt with max `percentage` | sorts descending on `percentage` |
| `LATEST_ATTEMPT` | Last attempt by number, pass or fail | `byNumber[len-1]` |
| `LATEST_PASS` | **Default for P&P** — most recent passing attempt | `passes[passes.length-1]` |
| `EVALUATOR_DECISION` | Returns `null` — requires external evaluator input | not auto-selectable |
| `ALL_COMPONENTS_REQUIRED` | Returns `null` — requires component inputs | not auto-selectable |

`GradePolicy.selectionPolicy` is documented in code as "`LATEST_PASS` default for P&P" (`assessment.ts` line comment). Attempts are first sorted by `attemptNumber` before filtering, so ordering is deterministic. All attempts remain visible to authorized reviewers (nothing is deleted — attempts are append-only, §3.3).

`decideGrade()` returns `{ outcome, selectedAttemptId, displayedScore }`:
- No selectable attempt but attempts exist → `outcome: 'FAILED'`.
- No attempts at all → `outcome: 'NOT_GRADED'`.
- Selected → `outcome: selected.passed ? 'PASSED' : 'FAILED'`.

The outcome type is `GradeOutcomeKind` (`types.ts`): `NOT_GRADED | PASSED | FAILED | NEEDS_REMEDIATION | PENDING_EVALUATOR`.

---

## 3. Rounding & precision (§8.3)

Four distinct numeric representations, each produced by a specific function:

| Representation | Precision | Where produced |
|---|---|---|
| Raw score | Stored exactly (`rawEarned` / `rawPossible`, integers) | `scoreResponses()` → `RawScore` |
| Percentage | **4 decimal places** | `scoreResponses()`: `Math.round((earned/possible)*1_000_000)/10_000` |
| Displayed score | **1 decimal place** | `decideGrade()`: `Math.round(selected.percentage*10)/10` |
| Pass/fail comparison | **Unrounded** percentage vs threshold | `isPass()` in `invariants.ts` |

Critically, `isPass()` recomputes the percentage unrounded — `(rawEarned / rawPossible) * 100` — and compares `pct >= thresholdPct`. It does **not** consume the 4dp or 1dp values, so display rounding can never flip a pass/fail decision.

```ts
// invariants.ts
export function isPass(score, thresholdPct): boolean {
  if (score.criticalFailureCodes.length > 0) return false; // critical fails regardless of %
  if (score.rawPossible <= 0) throw new Error('SCORE_DENOMINATOR_MISSING');
  const pct = (score.rawEarned / score.rawPossible) * 100; // unrounded
  return pct >= thresholdPct;
}
```

`attemptPassed(raw, thresholdPct)` in `assessment.ts` is the thin wrapper that forwards a `RawScore` into `isPass()`. A missing denominator (`rawPossible <= 0`) throws `SCORE_DENOMINATOR_MISSING`, matching the §22 build gate "a grade threshold or denominator is missing".

---

## 4. Critical failures (§8.4)

A critical error fails the attempt **regardless of percentage**. Example from §8.4: a 94% score with a "failed to report suspected abuse" critical miss results in `FAILED`.

- **Detection:** `scoreResponses()` collects `criticalFailureCodes` — for each `qid` in `ScoreInput.criticalQuestionIds` that is missing or incorrect, it pushes `` `CRITICAL_MISS:${qid}` ``.
- **Enforcement:** `isPass()` returns `false` immediately when `criticalFailureCodes.length > 0`, before any percentage comparison.
- **Recording:** The codes land in `RawScore.criticalFailureCodes` and are persisted to `ScoreResult.criticalFailureCodes` (`types.ts`). The grade policy records the critical-failure reason via these codes.

---

## 5. Competency grades (§8.5)

Competency is **not** a percentage quiz. It uses the `CompetencyOutcome` union (`evidence.ts`):
`VALIDATED | VALIDATED_WITH_CONDITION | NEEDS_IMPROVEMENT | FAILED | PENDING_EVALUATOR`.

`recordCompetencyObservation()` (`evidence.ts`) enforces the §8.5 preconditions — a qualified, non-self evaluator plus observation evidence — and downgrades to `PENDING_EVALUATOR` with reason codes when any is missing (`SELF_EVALUATION_FORBIDDEN`, `EVALUATOR_NOT_QUALIFIED`, `OBSERVATION_EVIDENCE_MISSING`). See `EVIDENCE_AND_SIGNOFF_MODEL.md` for full detail.

---

## 6. Approved P&P assessment: 10 questions / 80% / 3 attempts (§8.6)

The canonical constant is **`APPROVED_PNP_ATTEMPT_POLICY`** (`assessment.ts`):

```ts
export const APPROVED_PNP_ATTEMPT_POLICY: AttemptPolicy = {
  id: 'ATTEMPT-PNP',
  version: 1,
  ordinaryAttemptLimit: 3,
  passThresholdPct: 80,
  questionCount: 10,
  cooldownSecondsAfterAttempt: { 2: 86_400 }, // 24h after 2nd fail
};
```

- **10 questions** → `questionCount: 10`, enforced when `selectQuestionSet(pool, 10, …)` is called.
- **80% pass** → `passThresholdPct: 80`, enforced by `isPass()` on the unrounded percentage.
- **3 ordinary attempts** → `ordinaryAttemptLimit: 3`, enforced by `canStartAttemptNow()` / `canStartAttempt()`.
- **Default grade selection** → `LATEST_PASS` (§8.2) via `GradePolicy.selectionPolicy`.

The failure ladder and the identity-bound reattempt authorization that follows the third failure are documented in **`REMEDIATION_RULES.md`**.

---

## 7. Question-bank security (§8.7)

| Rule (§8.7) | Implementation |
|---|---|
| Correct answers never ship to learner | `ScoreInput.answerKey` is commented `SERVER ONLY`; scoring runs only in `scoreResponses()` server-side |
| Server-created question-set manifest per attempt | `selectQuestionSet()` returns `{ questionIds, fingerprint }`; `fingerprintQuestionSet()` stamps the set |
| Server-side randomization of question order | `selectQuestionSet()` uses a seedable Fisher–Yates `shuffle()` (xorshift32; `Math.random` is forbidden) |
| Consecutive P&P attempts should not reuse the same set | `selectQuestionSet(..., previousFingerprint)` retries with a perturbed seed (`seed + attempt*2654435761`) up to 5 times to avoid reproducing `previousFingerprint` when `pool > count` |
| Question bank must be large enough | Throws `QUESTION_BANK_TOO_SMALL` when `poolIds.length < count` |
| Regrade never overwrites | Regrade creates a new score/grade decision (append-only, §3.3); `decideGrade()` is pure and re-runnable |

`fingerprintQuestionSet()` produces a stable `qs_<hash>` fingerprint; the adapter layer applies the real SHA-256 stored as `AssessmentAttempt.questionSetSha256` (`types.ts`). When the pool equals the requested count there is no variation to enforce and the first shuffle is returned.

---

## 8. Symbol → rule map (quick reference)

| Symbol | File | Enforces |
|---|---|---|
| `APPROVED_PNP_ATTEMPT_POLICY` | assessment.ts | 10q / 80% / 3 attempts / 24h cooldown |
| `scoreResponses()` | assessment.ts | raw earned/possible, 4dp %, critical codes |
| `attemptPassed()` | assessment.ts | wrapper → `isPass()` |
| `isPass()` | invariants.ts | unrounded compare; critical → fail; denominator guard |
| `decideGrade()` | assessment.ts | grade outcome + 1dp displayed score |
| `selectGradedAttempt()` | invariants.ts | six attempt-selection policies |
| `selectQuestionSet()` | assessment.ts | server randomization + set variation |
| `fingerprintQuestionSet()` | assessment.ts | question-set manifest fingerprint |
| `canStartAttemptNow()` | assessment.ts | attempt-limit + cooldown gate |
| `ladderAfterFailure()` | assessment.ts | post-failure ladder (see REMEDIATION_RULES.md) |
