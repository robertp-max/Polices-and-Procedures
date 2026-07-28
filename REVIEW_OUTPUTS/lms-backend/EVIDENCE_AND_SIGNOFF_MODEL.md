# Evidence & Signoff Model

**Scope:** Care Indeed LMS backend — evidence lifecycle, competency observation, distinct-human signoff, and personnel-file routing (architecture §5.7, §6.8, §8.5, §10.3).
**Ground truth code:** `src/learning/domain/evidence.ts`, `src/learning/domain/invariants.ts`, `src/learning/domain/types.ts`.
**Deployment target:** Google Cloud (ADR-LEARNING-001) — canonical evidence is the **GCS** artifact plus Firestore metadata; Cloud KMS signs downstream gate assertions. Evidence is append-only and only counts when server-validated (§3.1).

---

## 1. Evidence lifecycle (§5.7, §6.8)

`EvidenceStatus` (`types.ts`): `PENDING | VALID | REJECTED | SUPERSEDED | REVOKED`.

The allowed transitions are a hard-coded, append-only table in `evidence.ts` (`EVIDENCE_TRANSITIONS`), enforced by **`canTransitionEvidence(from, to)`**:

| From | Allowed → | Terminal? |
|---|---|---|
| `PENDING` | `VALID`, `REJECTED` | no |
| `VALID` | `SUPERSEDED`, `REVOKED` | no |
| `REJECTED` | — | yes |
| `SUPERSEDED` | — | yes |
| `REVOKED` | — | yes |

```
PENDING ──→ VALID ──→ SUPERSEDED
   │          └────→ REVOKED
   └────→ REJECTED
```

Nothing is ever overwritten — corrections move forward via SUPERSEDED/REVOKED and new evidence versions (§3.3).

### 1.1 Validation requires a real artifact — `validateEvidence()` (§6.8)

```ts
export function validateEvidence(input: ValidateEvidenceInput): CompletionEvidence {
  if (input.evidence.status !== 'PENDING') throw new Error('EVIDENCE_NOT_PENDING');
  if (!input.hasArtifact && input.evidence.evidenceType !== 'SYSTEM_ASSERTION') {
    throw new Error('EVIDENCE_ARTIFACT_REQUIRED'); // a local signature image is not an artifact
  }
  return { ...input.evidence, status: 'VALID', validatedAt: now, validatedBy };
}
```

| Rule | Enforcement |
|---|---|
| Only `PENDING` evidence can be validated | throws `EVIDENCE_NOT_PENDING` otherwise |
| A promoted, hashed artifact must exist | throws `EVIDENCE_ARTIFACT_REQUIRED` when `!hasArtifact` (exception: `SYSTEM_ASSERTION`) |
| A browser-local image is **not** valid evidence | same guard — a local image is never a real hashed artifact |
| Validation is attributed | stamps `validatedAt` + `validatedBy` (reviewer subject id) |

Other lifecycle functions in `evidence.ts`:
- **`rejectEvidence(evidence, reviewer, now)`** → `REJECTED` (guarded by `canTransitionEvidence`, throws `EVIDENCE_NOT_REJECTABLE`).
- **`supersedeEvidence(prior, now)`** → `SUPERSEDED`; new evidence supersedes prior VALID evidence rather than overwriting it (throws `EVIDENCE_NOT_SUPERSEDABLE`).

### 1.2 Only VALID evidence is countable

`isEvidenceCountable(e)` in `invariants.ts` returns `e.status === 'VALID'` — the single source of truth used by completion/gate logic. `deriveCompletion()` (`invariants.ts`) accepts only the set of VALID evidence ids; a `PENDING`/`REJECTED` artifact can never satisfy a requirement.

---

## 2. Competency observation (§8.5)

`CompetencyOutcome` (`evidence.ts`): `VALIDATED | VALIDATED_WITH_CONDITION | NEEDS_IMPROVEMENT | FAILED | PENDING_EVALUATOR`. Competency is not a percentage quiz.

**`recordCompetencyObservation(input)`** requires a **qualified, non-self evaluator plus observation evidence**. Any missing precondition forces the outcome to `PENDING_EVALUATOR` and returns reason codes:

| Precondition | Failure reason code |
|---|---|
| Evaluator is not the learner | `SELF_EVALUATION_FORBIDDEN` (when `evaluatorSubjectId === learnerSubjectId`) |
| Evaluator is qualified | `EVALUATOR_NOT_QUALIFIED` (when `!evaluatorQualified`) |
| Observation evidence exists | `OBSERVATION_EVIDENCE_MISSING` (when `!hasObservationEvidence`) |

Only when `reasons.length === 0` does the caller-supplied `outcome` (a non-`PENDING_EVALUATOR` value) pass through. This enforces §8.5's "qualified evaluator, observation evidence, and signoff are required" and the §16 rule "no self-approval where independence is required."

---

## 3. Distinct-human signoff groups + signature-service ref (§10.3, §6.8)

Signoffs are `SignoffRecord` (`types.ts`) carrying `signerSubjectId`, `actingRoleAssignmentId`, `signerSlot`, `distinctHumanGroup`, `decision`, and `signatureServiceRef`.

**`addSignoff(input)`** in `evidence.ts` rejects a signoff in two cases:

| Reject reason | Condition |
|---|---|
| `SIGNATURE_SERVICE_REF_REQUIRED` | `decision === 'APPROVE'` but no `signatureServiceRef` — a local image is not acceptable |
| `DISTINCT_HUMAN_VIOLATION` | `distinctHumanViolated(combined)` is true |

**`distinctHumanViolated(signoffs)`** (`invariants.ts`) walks APPROVE signoffs that carry a `distinctHumanGroup`, tracking `group → set<signerSubjectId>`. If the same `signerSubjectId` appears twice within one group it returns `true`. This is §10.3: one person cannot satisfy two slots (e.g. employee/supervisor/DON/HR) merely because they hold multiple roles. The stored `actingRoleAssignmentId` records which role a person acted as, but identity — not role — is what the distinct-human check keys on.

**`requiredSignoffsPresent(required, signoffs)`** (`evidence.ts`) confirms every required `signerSlot` has an APPROVE signoff — the gate-consumption check feeding `deriveCompletion()` / certificate eligibility.

The `signatureServiceRef` is the pointer to the external eCIgn/signature service (§5.7 integration). A missing ref means the "signature" is only a browser image, which the architecture explicitly disallows as proof (§2 "browser-local signature image exists" is not completion).

---

## 4. Personnel-file routing — GCS canonical, Drive mirror (§4.1)

**`personnelFileRouting(evidence)`** in `evidence.ts`:

```ts
export function personnelFileRouting(evidence): { canonical: 'GCS'; mirror: 'DRIVE' | null } {
  const mirror = evidence.status === 'VALID' && !evidence.legalHold ? 'DRIVE' : null;
  return { canonical: 'GCS', mirror };
}
```

| Aspect | Value |
|---|---|
| Canonical store | **Always `GCS`** (Cloud Storage artifact + Firestore metadata) |
| Drive mirror | `DRIVE` only when evidence is `VALID` **and** not under `legalHold`; otherwise `null` |
| Authority | The Drive copy is a non-authoritative approved mirror; it never replaces the canonical GCS/metadata record |

This realizes §4.1 ("Google Drive may receive an approved personnel-file copy or pointer, but it should not replace the canonical certificate/evidence metadata record"). Non-VALID or legal-hold evidence is never mirrored to Drive. `CompletionEvidence.artifactRef.provider` (`types.ts`) is typed `'GCS' | 'DRIVE'`, matching this routing.

---

## 5. Symbol → rule map

| Symbol | File | Enforces |
|---|---|---|
| `canTransitionEvidence()` / `EVIDENCE_TRANSITIONS` | evidence.ts | append-only lifecycle PENDING→VALID/REJECTED→SUPERSEDED/REVOKED |
| `validateEvidence()` | evidence.ts | PENDING-only + artifact-required (local image invalid) |
| `rejectEvidence()` / `supersedeEvidence()` | evidence.ts | forward-only corrections, no overwrite |
| `isEvidenceCountable()` | invariants.ts | only VALID evidence counts |
| `recordCompetencyObservation()` | evidence.ts | qualified non-self evaluator + observation evidence |
| `addSignoff()` | evidence.ts | signature-service ref required; distinct-human check |
| `distinctHumanViolated()` | invariants.ts | one human cannot fill two slots in a group |
| `requiredSignoffsPresent()` | evidence.ts | all required slots APPROVE for gate consumption |
| `personnelFileRouting()` | evidence.ts | GCS canonical, Drive mirror non-authoritative |
