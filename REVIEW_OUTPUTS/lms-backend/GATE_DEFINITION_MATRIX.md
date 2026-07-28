# Gate Definition Matrix

**Source of truth:** `CARE_INDEED_LMS_BACKEND_ARCHITECTURE.md` §10 (gate architecture) and §11 (certificate gate matrix).
**Domain code:** `src/learning/domain/gates.ts`, `src/learning/domain/types.ts`, `src/learning/domain/invariants.ts`.
**Stack note:** Signing is done with the **Google Cloud KMS** Signer port (ADR-005). There is no AWS KMS in this design.

A gate is a **versioned Boolean/rule tree** (`GateDefinition`). Evaluation is pure and unsigned (`evaluateGate`); the caller then signs the `stateVectorSha256` with Cloud KMS to produce a `GateDecision`. Overrides never mutate the underlying failure — they only downgrade `FAIL → CONDITIONAL`.

---

## 1. Gate types

`GateType` (`types.ts` L276–281; `GateDefinition.gateType` in `gates.ts` L23) has exactly five members:

| Gate type | §Ref | Purpose | Signed `GateDecision` consumed by |
|---|---|---|---|
| `ASSIGNMENT_COMPLETION` | §5.8, §9 | One assignment's published rules are all satisfied. | Assignment completion / plan progress. |
| `CERTIFICATE_ELIGIBILITY` | §11, §12 | A certificate scope's full rule set passed. | Certificate issuance (`assertCertificateEligible` requires this exact type). |
| `FIELD_CLEARANCE` | §11.5 | Operational permission to work in the field (e.g. HHA independent patient assignment). | Clearance consumers — **never** a certificate. |
| `SYSTEM_ACCESS_CLEARANCE` | §5.8 | Operational permission for system/role access. | Access-control consumers. |
| `ANNUAL_READINESS` | §14.3 | Current-cycle readiness (a lapse changes readiness, not history). | Scheduling / current-readiness reporting. |

A certificate never creates clearance by itself (§3.5; `certificateGrantsClearance()` returns `false`). Field/system clearance requires its own signed clearance-gate PASS.

---

## 2. GateRule kinds

The `GateRule` discriminated union (`gates.ts` L11–19) — each `allOf`/`anyOf` entry is one of these. `evaluateRule` (L43–83) resolves each kind against a `GateStateVector` (L32–41).

| `kind` | Fields | Passes when | State-vector source | Fail reason code |
|---|---|---|---|---|
| `ASSIGNMENT_STATUS` | `assignmentSelector`, `allowed: AssignmentStatus[]` | selector's status ∈ `allowed` | `assignmentStatuses` | `ASSIGNMENT_STATUS:<sel>=<status\|MISSING>` |
| `GRADE_OUTCOME` | `assignmentSelector`, `allowed: string[]` | selector's grade outcome ∈ `allowed` | `gradeOutcomes` | `GRADE_OUTCOME:<sel>=<outcome\|MISSING>` |
| `EVIDENCE_VALID` | `evidenceSpecRef: VersionRef` | spec id present & VALID | `validEvidenceSpecIds` | `EVIDENCE_MISSING:<id>` |
| `SIGNOFF_PRESENT` | `signerSlot`, `distinctHumanGroup?` | slot has an APPROVE signoff (distinct-human already enforced upstream) | `presentSignoffSlots` | `SIGNOFF_MISSING:<slot>` |
| `ACCUMULATED_VALUE` | `ledgerType`, `minimum`, `unit` | ledger total ≥ `minimum` | `ledgerTotals` | `ACCUMULATED_SHORT:<type>=<total>/<min><unit>` |
| `NO_OPEN_REMEDIATION` | `scope` | scope not in open-remediation set | `openRemediationScopes` | `OPEN_REMEDIATION:<scope>` |
| `CREDENTIAL_CURRENT` | `credentialType` | credential present/current | `currentCredentials` | `CREDENTIAL_NOT_CURRENT:<type>` |
| `NO_ACTIVE_HOLD` | `holdType` | hold not active | `activeHolds` | `ACTIVE_HOLD:<type>` |

Distinct-human independence (§10.3) is enforced before the state vector is built, via `distinctHumanViolated` (`invariants.ts` L142–154): one human cannot fill two slots in the same `distinctHumanGroup`.

---

## 3. Certificate / clearance gate matrix (§11)

Each §11 gate maps to a `GateDefinition` whose `allOf` is the required `GateRule` set below. `MODULE_COMPLETION` first requires the underlying assignment to be `COMPLETED`, itself a derived decision (`deriveCompletion`, `invariants.ts` L39–63), not a client boolean.

| §11 gate | GateType | Required `GateRule`s (`allOf`) |
|---|---|---|
| §11.1 Module completion | `CERTIFICATE_ELIGIBILITY` | `ASSIGNMENT_STATUS`(COMPLETED) · `GRADE_OUTCOME`(PASSED) · `EVIDENCE_VALID`(required specs) · `NO_OPEN_REMEDIATION`; `ACCUMULATED_VALUE` (min active time) when defined |
| §11.2 Policy-reading | `CERTIFICATE_ELIGIBILITY` | `ASSIGNMENT_STATUS`(COMPLETED, exact policy version/hash) · `GRADE_OUTCOME`(PASSED — 10-Q ≥80% when assigned) · `EVIDENCE_VALID`(attestation + personnel-file) · `NO_OPEN_REMEDIATION` · `NO_ACTIVE_HOLD` |
| §11.3 GAO track | `CERTIFICATE_ELIGIBILITY` | `ASSIGNMENT_STATUS`(COMPLETED per required GAO module) · `GRADE_OUTCOME`(PASSED, GAO final) · `ASSIGNMENT_STATUS`(COMPLETED per GAO P&P activity) · `EVIDENCE_VALID` · `NO_OPEN_REMEDIATION` |
| §11.4 Role-onboarding | `CERTIFICATE_ELIGIBILITY` | GAO gate PASS (composed) · `ASSIGNMENT_STATUS`(COMPLETED per role module) · `GRADE_OUTCOME`(PASSED, role assessments) · `ASSIGNMENT_STATUS`(required policy readings) · `GRADE_OUTCOME`/`SIGNOFF_PRESENT`(competencies VALIDATED) · `EVIDENCE_VALID`(supervised practice) · `SIGNOFF_PRESENT`(required slots) · `NO_ACTIVE_HOLD` |
| §11.5 HHA field clearance | **`FIELD_CLEARANCE`** | GAO complete · `ASSIGNMENT_STATUS`(HHA role modules COMPLETED) · `SIGNOFF_PRESENT`(HHA-SUP, qualified-RN distinct-human) · `ASSIGNMENT_STATUS`(P&P activities) · `EVIDENCE_VALID`(competency checkoff + personnel file) · `SIGNOFF_PRESENT`(RN/supervisor clearance) · `CREDENTIAL_CURRENT` · `NO_ACTIVE_HOLD` |
| §11.6 ACHC annual bundle | `CERTIFICATE_ELIGIBILITY` | `ASSIGNMENT_STATUS`(COMPLETED × all 12 ACHC modules) · `GRADE_OUTCOME`(PASSED, required module assessments) · `EVIDENCE_VALID`(annual evidence) · `NO_OPEN_REMEDIATION` (no unresolved equivalency gap) |
| §11.7 HHA 12-hour in-service | `CERTIFICATE_ELIGIBILITY` | `ACCUMULATED_VALUE`(ledgerType HHA in-service, `minimum: 12`, `unit: hours`, rolling 12-month window) — never a single boolean |
| §11.8 Advanced module | `CERTIFICATE_ELIGIBILITY` | `ASSIGNMENT_STATUS`(COMPLETED, this Advanced assignment record) · `GRADE_OUTCOME`(PASSED) · `EVIDENCE_VALID` — annual vs onboarding assignments stay distinct records even on the same content revision |

**§11.5 is a clearance, not a certificate.** The system may issue an HHA onboarding certificate, but independent patient assignment depends on the separate signed `FIELD_CLEARANCE` `GateDecision`.

---

## 4. Evaluation and consumption semantics

### `evaluateGate(def, state, hasActiveOverride)` — `gates.ts` L113–132
- Every `allOf` rule must pass; when `anyOf` is present, at least one must pass (else `ANY_OF_UNSATISFIED`).
- `reasons.length === 0` → `PASS`.
- Otherwise, if `hasActiveOverride` → **`CONDITIONAL`** (failure reasons retained, not erased — §10.4).
- Otherwise → `FAIL`.
- Always returns the `stateVectorFingerprint` (`stateVectorFingerprint`, L86–100; the adapter substitutes real SHA-256).

Override → CONDITIONAL comes from a published, active `GateOverride` (§10.4); every override expires and is auditable. It downgrades but never mutates the underlying failure.

### `acceptGateForConsumption(input)` — `gates.ts` L135–148
Downstream consumers accept **only a signed, non-stale, non-expired PASS** (§10.2):

| Check | Reject reason |
|---|---|
| `outcome !== 'PASS'` (i.e. FAIL / CONDITIONAL) | `NOT_PASS` |
| empty `signature` | `UNSIGNED` |
| `currentStateFingerprint !== decisionStateFingerprint` | `STALE_STATE` |
| `expiresAt` in the past vs `now` | `EXPIRED` |

Certificate issuance additionally routes through `assertCertificateEligible` → `canIssueCertificate` (`invariants.ts` L160–171), which requires `gateType === 'CERTIFICATE_ELIGIBILITY'`, `outcome === 'PASS'`, a non-empty `assertionSignature`, and a non-expired decision.
