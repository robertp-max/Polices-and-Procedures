# Remediation Rules — the P&P failure ladder

**Scope:** Care Indeed LMS backend — policy-reading failure workflow and reattempt authorization (architecture §8.6).
**Ground truth code:** `src/learning/domain/assessment.ts`, `src/learning/domain/invariants.ts`, `src/learning/domain/types.ts`.
**Deployment target:** Google Cloud (ADR-LEARNING-001). All attempts are append-only; numbering never resets (§3.3).

> After a FAILED ordinary attempt, `ladderAfterFailure()` decides the next step. A reattempt after the third failure is only possible with a single-use, identity-bound `ReattemptAuthorization`.

---

## 1. The failure ladder (§8.6)

Implemented by **`ladderAfterFailure(failedAttemptNumber, policy)`** in `assessment.ts`, returning a `LadderDecision`. With `APPROVED_PNP_ATTEMPT_POLICY` (`ordinaryAttemptLimit: 3`, `cooldownSecondsAfterAttempt: { 2: 86400 }`):

| Failure | `LadderAction` | Cooldown | Supervisor | Remediation | Review | 1:1 | Further ordinary attempts |
|---|---|---|---|---|---|---|---|
| **Fail 1** | `IMMEDIATE_RETAKE` | none | no | no | no | no | yes |
| **Fail 2** | `COOLDOWN` | 86 400 s (24 h) | yes | yes | no | no | yes |
| **Fail 3** (≥ limit) | `TRAINING_HOLD` | — | yes | yes | yes | yes | **no** |

`LadderDecision` interface (`assessment.ts`):

```ts
interface LadderDecision {
  action: 'IMMEDIATE_RETAKE' | 'COOLDOWN' | 'TRAINING_HOLD';
  cooldownSeconds?: number;
  notifySupervisor: boolean;
  openRemediation: boolean;
  requireReview: boolean;
  require1to1: boolean;
  noFurtherOrdinaryAttempts: boolean;
}
```

Decision logic (exact order in code):
1. **`failedAttemptNumber >= policy.ordinaryAttemptLimit`** → `TRAINING_HOLD` with `notifySupervisor`, `openRemediation`, `requireReview`, `require1to1`, and `noFurtherOrdinaryAttempts` all `true`. This is the **Fail 3** branch: training hold + DON/HR review + mandatory 1:1 remediation + no fourth ordinary attempt.
2. Else if `cooldownSecondsAfterAttempt[failedAttemptNumber]` is set (i.e. `{ 2: 86400 }`) → `COOLDOWN` with `cooldownSeconds: 86400`, supervisor notification, and remediation assignment. This is **Fail 2** (24-hour cooldown).
3. Else → `IMMEDIATE_RETAKE`, all flags `false`. This is **Fail 1** (immediate retake; relevant policy sections shown again — a UI concern, not enforced in domain code).

The ladder maps to the `RemediationCase.state` machine (`types.ts` §6.7): `OPEN → COOLDOWN → SUPERVISOR_REVIEW → TRAINING_HOLD → REAUTHORIZED → CLOSED`.

---

## 2. Start gate — can a new attempt begin now? (§8.6)

**`canStartAttemptNow(input: StartGateInput)`** in `assessment.ts` combines cooldown + attempt-limit + reauthorization into one decision. (The purely limit-based variant is `canStartAttempt()` in `invariants.ts`; `canStartAttemptNow` adds the cooldown clock.)

```ts
interface StartGateInput {
  policy: AttemptPolicy;
  usedOrdinaryAttempts: number;
  cooldownUntil?: string;              // ISO
  activeReattemptAuthorization: boolean;
  now: Date;
}
```

Evaluation order and outcomes:

| Condition | Result |
|---|---|
| `cooldownUntil` in the future vs `now` | `{ allowed: false, reason: 'COOLDOWN_ACTIVE' }` |
| `usedOrdinaryAttempts < ordinaryAttemptLimit` | `{ allowed: true }` |
| Limit reached **and** `activeReattemptAuthorization === true` | `{ allowed: true }` |
| Limit reached **and** no authorization | `{ allowed: false, reason: 'ATTEMPT_LIMIT_REACHED' }` |

`ATTEMPT_LIMIT_REACHED` is the stable machine code surfaced in the §15.5 error model. Cooldown is checked **first**, so a learner within their attempt limit still cannot retake during an active 24-hour cooldown.

**Attempt numbering** is assigned by `assignAttemptNumber(existing)` → `nextAttemptNumber()` (`invariants.ts`), which is strictly `max(attemptNumber) + 1`. A reauthorized attempt continues this sequence; it never resets or rewrites the original three.

---

## 3. Identity-bound single-use ReattemptAuthorization (§8.6)

After the third failure and completed remediation, a new attempt cycle is opened **only** by a `ReattemptAuthorization`. The runtime shape used by the domain functions is `ReattemptAuthState` (`assessment.ts`); the persisted record is `ReattemptAuthorization` (`types.ts`).

```ts
interface ReattemptAuthState {
  id: string;
  subjectId: string;          // bound to the learner
  assignmentId: string;       // bound to the assignment
  remediationCaseId: string;  // bound to the remediation case
  expiresAt: string;          // expiry
  consumedByAttemptId?: string;
  status: 'ACTIVE' | 'CONSUMED' | 'EXPIRED' | 'REVOKED';
}
```

### 3.1 Validity — `isReattemptAuthorizationValid(auth, ctx)` (`assessment.ts`)

Returns `{ valid, reason? }`. It is valid to open a new attempt only when **active, bound, and unexpired**:

| Check | Failure reason |
|---|---|
| `status !== 'ACTIVE'` | `` `AUTH_${status}` `` (e.g. `AUTH_CONSUMED`, `AUTH_EXPIRED`, `AUTH_REVOKED`) |
| `subjectId` or `assignmentId` mismatch vs `ctx` | `AUTH_NOT_BOUND` |
| `expiresAt` earlier than `ctx.now` | `AUTH_EXPIRED` |
| all pass | `{ valid: true }` |

The subject + assignment binding is what makes it **identity-bound**: an authorization issued to one learner/assignment cannot be replayed against another (`AUTH_NOT_BOUND`). The `remediationCaseId` field ties it to the specific remediation case that produced it.

### 3.2 Single use — `consumeReattemptAuthorization(auth, attemptId)` (`assessment.ts`)

```ts
export function consumeReattemptAuthorization(auth, attemptId): ReattemptAuthState {
  if (auth.status !== 'ACTIVE') throw new Error('AUTH_NOT_ACTIVE');
  return { ...auth, status: 'CONSUMED', consumedByAttemptId: attemptId };
}
```

- Consuming flips `status` to `CONSUMED` and records `consumedByAttemptId` — so the same authorization can never open a second attempt (a subsequent `isReattemptAuthorizationValid` call returns `AUTH_CONSUMED`).
- A non-active authorization throws `AUTH_NOT_ACTIVE` (guards double-consume / race).
- **It does not alter prior attempts.** The function returns a new object (`{ ...auth, ... }`) and touches nothing else; the original three attempts and their scores/grades remain intact. This satisfies §8.6: "permits a new attempt cycle without altering or deleting the original three attempts," and the §24.2 property test "attempt number never decreases or duplicates."

### 3.3 Continues numbering, never resets

The authorization opens a **new attempt** whose number comes from `nextAttemptNumber()` (still `max+1`). The persisted attempt links back via `AssessmentAttempt.reattemptAuthorizationId` (`types.ts`). There is no code path that lowers, reuses, or zeroes an attempt number.

---

## 4. Symbol → rule map

| Symbol | File | Enforces |
|---|---|---|
| `ladderAfterFailure()` | assessment.ts | fail1 retake / fail2 24h cooldown+supervisor+remediation / fail3 hold+review+1:1+no 4th |
| `LadderDecision` | assessment.ts | structured ladder outcome flags |
| `canStartAttemptNow()` | assessment.ts | cooldown + attempt-limit + reauthorization start gate |
| `canStartAttempt()` | invariants.ts | limit-only start gate (`ATTEMPT_LIMIT_REACHED`) |
| `assignAttemptNumber()` / `nextAttemptNumber()` | assessment.ts / invariants.ts | numbering `max+1`, never resets |
| `isReattemptAuthorizationValid()` | assessment.ts | active + bound (subject/assignment) + unexpired |
| `consumeReattemptAuthorization()` | assessment.ts | single-use; preserves prior attempts |
| `ReattemptAuthState` / `ReattemptAuthorization` | assessment.ts / types.ts | identity-bound authorization record |
