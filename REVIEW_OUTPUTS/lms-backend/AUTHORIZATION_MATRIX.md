# Care Indeed LMS Backend — Authorization Matrix

**Source of truth:** `CARE_INDEED_LMS_BACKEND_ARCHITECTURE.md` §16 (authorization model), §5.1 (identity), §10.3 (distinct-human)
**Domain:** `src/learning/domain/types.ts` (`LearningSubject`, `RoleAssignment`, `SignoffRecord`), `src/learning/domain/invariants.ts` (`distinctHumanViolated`), `src/learning/domain/evidence.ts` (`addSignoff`, `recordCompetencyObservation`)
**Platform:** Google Cloud. Identity is the **existing Care Indeed authenticated workforce identity** (the architecture's "Cognito subject" ⇒ Care Indeed auth). The learner may never self-select a role (§5.1).

---

## 1. Principals, roles, and scopes

**Authenticated subject** — a `LearningSubject` resolved from the verified JWT
(`identityProviderSubject`). Its `status` gates all writes:

```ts
status: 'PENDING' | 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'TERMINATED'
```

**Roles** are `RoleAssignment.roleCode` (authoritative, from identity — not learner-chosen):
`GENERAL | ADM | DON | RN | LVN | HHA | PT | PTA | OT | COTA | SLP | MSW`, each with
`isPrimary`, `department`, `dutyFlags[]`, `supervisorSubjectId`, and effective dates.
Capabilities are granted to **functional actor roles** layered on top of the clinical role:
Learner, Supervisor, Evaluator, HR, DON, Compliance, Certificate authority, Definition admin.

**Scope kinds enforced (§16):**

| Scope | Meaning |
|---|---|
| `self` | Subject may act only on their own records (`resource.subjectId === token.subject`). |
| `supervisor` | Actor's supervised set: subjects whose `RoleAssignment.supervisorSubjectId` chains to the actor. |
| `branch` | Same `LearningSubject.branchId` as the actor's assigned branch/location. |
| `acting-role` | The specific `RoleAssignment` the actor signs under (`SignoffRecord.actingRoleAssignmentId`); one human holding two roles still counts as one human. |
| `tenant` | Whole-tenant scope (definition/compliance/certificate authorities), still branch-narrowed where configured. |

---

## 2. Capability × role × scope matrix (§16)

Capabilities are the exact strings from architecture §16. `✔` = granted; blank = not granted.

| Capability | Learner | Supervisor | Evaluator | HR | DON | Compliance | Cert authority | Definition admin | Scope | Primary enforcement |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|---|
| `training.self.read` | ✔ | | | | | | | | `self` | `resource.subjectId === token.subject` |
| `training.self.activity.write` | ✔ | | | | | | | | `self` | self + subject `ACTIVE` |
| `training.self.attempt.submit` | ✔ | | | | | | | | `self` | self + attempt→assignment.subjectId |
| `training.self.evidence.submit` | ✔ | | | | | | | | `self` | self + evidence.subjectId |
| `training.supervisor.read` | | ✔ | | | ✔ | | ✔ | | `supervisor`+`branch` | subject in supervised/branch set |
| `training.supervisor.review` | | ✔ | | | ✔ | | | | `supervisor`+`branch` | remediation case subject in scope |
| `training.evaluator.observe` | | | ✔ | | | | | | `acting-role`+`branch` | evaluator ≠ learner; qualified |
| `training.evaluator.sign` | | | ✔ | | ✔ | | | | `acting-role` | distinct-human; signer ≠ learner |
| `training.hr.assign` | | | | ✔ | | | | | `tenant`/`branch` | subject in scope |
| `training.hr.waive` | | | | ✔ | | | | | `tenant`/`branch` | subject in scope; audited |
| `training.hr.screening-status` | | | | ✔ | | | | | `tenant`/`branch` | pointer only; no PHI |
| `training.don.clearance` | | | | | ✔ | | | | `branch` | gate eval / field-clearance |
| `training.don.remediation` | | ✔¹ | | | ✔ | | | | `branch` | case in scope; reauthorization |
| `training.compliance.audit.read` | | | | | | ✔ | | | `tenant` | aggregate; individual only by authorized case |
| `training.compliance.evidence.review` | | | | | | ✔ | | | `tenant` | reviewer ≠ subject |
| `training.certificate.issue` | | | | | | | ✔ | | `tenant`/`branch` | requires signed PASS gate |
| `training.certificate.revoke` | | | | | | | ✔ | | `tenant` | audited; never deletes |
| `training.definition.manage` | | | | | | | | ✔ | `tenant` | versioned definition CRUD |

¹ `training.don.remediation` may be delegated to supervisors for `action`; **reauthorization**
(issuing a `ReattemptAuthorization` after a 3rd P&P failure) is DON/HR only.

> **Governing Body reporting** is aggregate unless an authorized case requires individual
> detail (§19.4) — it consumes `training.compliance.audit.read` at `tenant` scope.

---

## 3. Enforcement rules (§16 "Enforce")

### 3.1 Self-only learner access

Every `training.self.*` capability is object-scoped to the token subject: the API resolves
`:subjectId`/`:assignmentId`/`:attemptId`/`:evidenceId`/`:certificateId` and denies with
`FORBIDDEN_OBJECT_SCOPE` unless the owning `subjectId === token.subject`. A learner can never
read or mutate another learner's records (security test §24.5 "learner reads another learner").

### 3.2 Supervisor / branch scope

`training.supervisor.*` and evaluator reads resolve the target subject and require it to be in
the actor's supervised set (`RoleAssignment.supervisorSubjectId` chain) and/or the actor's
`branchId`. Out-of-scope targets → `FORBIDDEN_OBJECT_SCOPE`. Review-queue projections are
pre-filtered to the actor's scope (§19.2).

### 3.3 Acting-role scope

A signoff is bound to the exact `RoleAssignment` the actor signs under:
`SignoffRecord.actingRoleAssignmentId` + `signerSlot`. Holding multiple roles does not let one
human satisfy multiple independent slots (see distinct-human, §3.4). The acting role must be
effective (within `effectiveFrom`/`effectiveTo`) at sign time.

### 3.4 Distinct-human signatures / no self-approval

Enforced by `addSignoff` → `distinctHumanViolated` (`invariants.ts`): within a
`distinctHumanGroup`, a second APPROVE from the **same** `signerSubjectId` is rejected with
`DISTINCT_HUMAN_VIOLATION`. Independent slots (`employee`, `supervisor`, `DON`, `HR`) must be
distinct humans (§10.3). Additional guards:

- **No self-approval:** competency observation rejects `SELF_EVALUATION_FORBIDDEN` when
  `evaluatorSubjectId === learnerSubjectId` (`recordCompetencyObservation`); a signer may not
  sign their own learner slot.
- **Real signature required:** an APPROVE signoff without a `signatureServiceRef` is rejected
  (`SIGNATURE_SERVICE_REF_REQUIRED`) — a browser signature image is not a valid signoff.
- **Qualified evaluator:** competency requires `evaluatorQualified` + observation evidence, else
  outcome stays `PENDING_EVALUATOR`.

### 3.5 Suspended-user denial

When `LearningSubject.status` is `ON_LEAVE`, `INACTIVE`, or otherwise suspended, all **write**
capabilities are denied with `SUSPENDED_USER`, regardless of granted capability. `PENDING`
subjects may read but cannot start attempts/activity until `ACTIVE`. This applies to the actor
subject and blocks acting on a suspended target.

### 3.6 Terminated read-only historical access

When `LearningSubject.status === 'TERMINATED'`, the subject (and queries about them) are limited
to **historical read** of prior records (transcript, issued certificates); every write is denied
`TERMINATED_READ_ONLY`. Historical certificates and evidence remain immutable and are never
deleted — a later status change or annual lapse cannot rewrite them
(`annualLapseAffectsHistoricalCertificate` → `false`; §14.3).

### 3.7 Object-level authorization is post-authentication

Capability possession is necessary but not sufficient: every request additionally passes the
object-level rule in the matrix above before the command executes. The order is:
**JWT verify → capability check → subject-status gate → object-level scope → schema/version →
apply + audit/outbox** (§15, §17).

---

## 4. Capability-to-endpoint quick reference

| Capability | Representative endpoints (see `API_CONTRACT.md`) |
|---|---|
| `training.self.read` | `GET /api/training/me`, `/me/plan`, `/me/assignments`, `/me/transcript`, `/me/certificates` |
| `training.self.activity.write` | `POST /me/assignments/:id/start`, `/me/sessions`, `/me/sessions/:id/events`, `/me/policies/:id/confirm-review` |
| `training.self.attempt.submit` | `POST /me/assignments/:id/attempts`, `/me/attempts/:id/responses`, `/me/attempts/:id/submit` |
| `training.self.evidence.submit` | `POST /me/policies/:id/attest`, `/me/external-training/upload-init`, `/me/external-training/:id/submit` |
| `training.supervisor.read` | `GET /review-queue`, `/subjects/:subjectId/assignments` |
| `training.supervisor.review` | `POST /remediation/:caseId/action` |
| `training.evaluator.observe` | `POST /competencies/:id/observation`, `/evidence/:id/validate` |
| `training.evaluator.sign` | `POST /signoffs/:assignmentId` |
| `training.hr.assign` | `POST /admin/plans/resolve`, `/admin/assignments` |
| `training.hr.waive` | `POST /admin/waivers` |
| `training.don.clearance` | `POST /admin/gates/evaluate` |
| `training.don.remediation` | `POST /remediation/:caseId/reauthorize` |
| `training.compliance.audit.read` | `GET /admin/reports/compliance` |
| `training.certificate.issue` | `POST /admin/certificates/:definitionId/issue` |
| `training.certificate.revoke` | `POST /admin/certificates/:certificateId/revoke` |
| `training.definition.manage` | `GET`/`POST /admin/definitions` |

---

## 5. Denial reason codes (stable, machine-readable)

| `error.code` | Trigger |
|---|---|
| `UNAUTHENTICATED` | Missing/expired/invalid JWT |
| `FORBIDDEN_CAPABILITY` | Authenticated but lacks the capability |
| `FORBIDDEN_OBJECT_SCOPE` | Capability held, but resource outside self/supervisor/branch/acting-role scope |
| `SUSPENDED_USER` | Actor or target subject suspended (`ON_LEAVE`/`INACTIVE`) — writes denied |
| `TERMINATED_READ_ONLY` | `TERMINATED` subject — historical read only |
| `DISTINCT_HUMAN_VIOLATION` | One human filling two slots in a distinct-human group |
| `SELF_EVALUATION_FORBIDDEN` | Evaluator/signer is the learner |
| `SIGNATURE_SERVICE_REF_REQUIRED` | APPROVE signoff without a real signature-service reference |
| `EVALUATOR_NOT_QUALIFIED` | Observer not qualified for competency signoff |

These map 1:1 to the thrown `Error`/returned `reason` values in `invariants.ts` and
`evidence.ts` and align with the error model in `API_CONTRACT.md` §6.
