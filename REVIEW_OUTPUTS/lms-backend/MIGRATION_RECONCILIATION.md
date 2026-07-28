# Migration & Reconciliation — Care Indeed LMS Backend

Covers architecture **§21 (migration from `ci-journey-v1`)**, mapped to the pure
classification logic in `src/learning/domain/migration.ts`. Founding principle (§21):
**treat existing browser records as untrusted claims.** Nothing in the legacy localStorage
store is authoritative — a migrated record must never become a pass, a signoff, or a
clearance by itself.

---

## 1. Import states (§21.1)

`ImportState = 'MAPPED' | 'AMBIGUOUS' | 'QUARANTINED' | 'REJECTED'`

| State         | Meaning                                                                 | Downstream effect                                        |
| ------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `MAPPED`      | Enough version/score/evidence to reconcile, **or** SCORM progress only  | Reconciled as data (or progress); never auto-completion  |
| `AMBIGUOUS`   | Recognized module but insufficient/soft signals; needs human review     | Held for reviewer; may produce a historical claim        |
| `QUARANTINED` | Unknown module id                                                       | Parked; no import until the id is resolved               |
| `REJECTED`    | Alias namespace (`CORE-*` / `ROLE-*`) not accepted as canonical         | Discarded from canonical import                          |

Every `ImportDecision` also carries `createsGateDecision: false` **as a compile-time literal**
— migration can never, by construction, emit a signed `GateDecision`.

---

## 2. Classification rules (§21.2)

`classifyLegacyRecord(record: LegacyRecord, knownModuleIds: Set<string>): ImportDecision`
evaluates rules in a fixed order. Order matters — the earlier guards (alias, unknown id)
return immediately so a malformed id can never fall through to reconciliation.

| # | Guard (in evaluation order)                                              | Result state  | Reason code(s)                          | Flags set                          |
| - | ------------------------------------------------------------------------ | ------------- | --------------------------------------- | ---------------------------------- |
| 1 | `moduleId` starts with `CORE-` / `ROLE-` (case-insensitive)              | `REJECTED`    | `ALIAS_NOT_CANONICAL`                   | —                                  |
| 2 | `moduleId` not in `knownModuleIds`                                       | `QUARANTINED` | `UNKNOWN_MODULE_ID`                     | —                                  |
| 3 | `localSignatureImage === true`                                           | *(annotates)* | `LOCAL_SIGNATURE_NOT_VALID`             | (adds reason, continues)           |
| 4 | `scormInProgress === true`                                               | `MAPPED`      | `SCORM_PROGRESS_ONLY`                   | `importAsProgressOnly: true`       |
| 5 | `clearedForIndependentWork` and/or `appendixFCleared`                    | `AMBIGUOUS`   | `CLEARANCE_CLAIM_REQUIRES_EVIDENCE` / `APPENDIX_F_HISTORICAL_CLAIM` | `producesHistoricalClaim: true` |
| 6 | `moduleVersion` **and** `scorePct !== undefined` **and** `hasValidatedEvidence` | `MAPPED` | `RECONCILABLE_WITH_EVIDENCE`            | (score carried as data, not pass)  |
| 7 | otherwise                                                                | `AMBIGUOUS`   | `INSUFFICIENT_FOR_RECONCILIATION`       | —                                  |

### 2.1 Rule rationale

- **Exact id + version + score + evidence → reconcile, score as data (rule 6, §21.2).** The
  strongest legacy record still only reconciles as *data*. The comment in `migration.ts` is
  explicit: "the score is carried as data, never auto-converted into a PASS boolean." A
  server-side grade decision (architecture §6.6 / §8) is what later turns evidence into a
  pass — not the importer.
- **SCORM in-progress → progress only (rule 4).** Matches §21.2 "in-progress SCORM data
  imports as progress only" — `importAsProgressOnly: true`, never completion. Note the
  ordering: an in-progress SCORM record is `MAPPED` as progress even if it also carries a
  local signature (rule 3 has already annotated the reason).
- **Local signature invalid (rule 3, §21.2).** A browser-drawn signature image is never a
  valid signoff; it only adds `LOCAL_SIGNATURE_NOT_VALID` and never sets `createsSignoff`
  (which stays `false` in the base decision).
- **`appendixFCleared` / `clearedForIndependentWork` → historical claim, never a gate (rule
  5, §21.2).** Both become an `AMBIGUOUS` **historical claim pending evidence review**
  (`producesHistoricalClaim: true`). `clearedForIndependentWork=true` explicitly never
  creates a signed `GateDecision` (§21.2, §3.5) — enforced by the `createsGateDecision: false`
  literal on every decision.
- **Unknown module id → quarantine (rule 2, §21.2).** Held for review rather than guessed.
- **`CORE-*` / `ROLE-*` aliases rejected (rule 1, §21.2).** Alias namespaces are not accepted
  as new canonical IDs. Canonical ids such as `RN-001` remain the stable external identifiers
  (architecture §6).

### 2.2 Idempotency (§21.2)

`classifyBatch(records, knownModuleIds)` maps `classifyLegacyRecord` over the batch.
Classification is a **pure function** of `(record, knownModuleIds)` with no clock, randomness,
or mutation — so reruns are idempotent: identical input yields byte-identical output, meeting
§21.2 "reruns are idempotent" and the §24.4 idempotency test. Every import decision is meant
to emit an audit event (§21.2, §17); that emission is the caller's responsibility, and the
decision's `reasonCodes` are the audit payload.

---

## 3. Shadow mode & parity (§21.3)

Migration classification is deliberately side-effect-free so it can run in **shadow mode**
before any cutover:

| §21.3 requirement                              | How this model supports it                                                        |
| ---------------------------------------------- | --------------------------------------------------------------------------------- |
| Legacy store remains read-only                 | Classifier only reads `LegacyRecord`s; writes nothing back to `ci-journey-v1`      |
| New backend evaluates in parallel              | `classifyBatch` runs over exported legacy records alongside live evaluation       |
| Gate differences are reported                  | `ImportDecision.reasonCodes` + `state` feed a parity report (no state mutation)    |
| **No automatic certificate issuance** from imports | `createsGateDecision: false` (literal) blocks any imported record from reaching certificate issuance |

Because no imported record can produce a `GateDecision`, and certificates require a signed
`PASS` gate (§11, §12), migration **cannot over-credit completion** — the §26 minimum
production-acceptance criterion "migration does not over-credit completion."

---

## 4. Decision object reference

```ts
interface ImportDecision {
  moduleId: string;
  state: ImportState;                 // MAPPED | AMBIGUOUS | QUARANTINED | REJECTED
  reasonCodes: string[];              // audit payload
  importAsProgressOnly: boolean;      // true only for in-progress SCORM
  createsGateDecision: false;         // compile-time literal — never a signed gate
  createsSignoff: boolean;            // always false in current rules (no legacy signoff is valid)
  producesHistoricalClaim: boolean;   // true for appendixF / clearedForIndependentWork
}
```

## 5. Function → architecture map

| `migration.ts` symbol   | Architecture ref | Role                                                        |
| ----------------------- | ---------------- | ---------------------------------------------------------- |
| `LegacyRecord`          | §21              | Untrusted legacy claim shape (localStorage export)          |
| `ImportState`           | §21.1            | MAPPED / AMBIGUOUS / QUARANTINED / REJECTED                 |
| `ImportDecision`        | §21.2            | Per-record decision + reason codes + non-issuance literal   |
| `classifyLegacyRecord`  | §21.2            | Ordered rule evaluation for one record                      |
| `classifyBatch`         | §21.2, §24.4     | Idempotent batch classification                             |
