# 11 — Workflow Architecture

## Purpose

Document the **end-to-end onboarding workflow architecture** — not as a checklist but as a layered, event-driven execution graph. This is the blueprint the engine and CES execute against.

---

## 1. Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│  L0 — Trigger Layer                                         │
│  HRIS, Admin UI, Calendar, Policy Library, Vendor Mgmt      │
└─────────────────────────────────────────────────────────────┘
                          │ typed trigger events
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  L1 — Engine Layer (doc 03)                                 │
│  Profile Resolution → Template Selection → Reconciliation   │
│  → Batch Creation → Unit Emission → Lifecycle               │
└─────────────────────────────────────────────────────────────┘
                          │ batches + units
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  L2 — Workflow Layer                                        │
│  Per-requirement workflows (WF-*) with structured steps     │
└─────────────────────────────────────────────────────────────┘
                          │ workflow lifecycle events
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  L3 — Evidence & Signature Layer                            │
│  Forms library + eCIgn (single & multi-signer)              │
└─────────────────────────────────────────────────────────────┘
                          │ artifacts + signatures
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  L4 — CES Layer (Sprint Board, Calendar, Assignment)        │
└─────────────────────────────────────────────────────────────┘
                          │ state transitions
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  L5 — Enforcement Layer (gates, overrides)                  │
└─────────────────────────────────────────────────────────────┘
                          │ gate evaluations
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  L6 — Audit Layer (hash-chained event ledger, dossier)      │
└─────────────────────────────────────────────────────────────┘
```

Each layer publishes typed events. No layer reaches across layers; integration is event-driven.

---

## 2. Trigger Points (L0)

| Source | Trigger | Payload (canonical) |
|--------|---------|---------------------|
| HRIS / Admin UI | NEW_HIRE | subject_id, role(s), branch, hire_date |
| HRIS / Admin UI | ROLE_CHANGE | subject_id, prior_roles, new_roles, effective_date |
| HRIS | REACTIVATION | subject_id, reason, effective_date |
| Compliance Calendar | ANNUAL_REVALIDATION | subject_id, requirement_ids, period |
| Compliance Calendar | CREDENTIAL_EXPIRY_WINDOW | subject_id, requirement_id, expiry_date, window |
| Policy Library | POLICY_VERSION_CHANGE | policy_id, new_version, affected_roles |
| Operations | SCOPE_EXPANSION | subject_id, new_service_lines, new_populations |
| Vendor Mgmt | VENDOR_ONBOARD | vendor_id, vendor_type |
| Governance | GOVERNANCE_APPOINTMENT | subject_id, role (GB/CO/Privacy/Security/MD), effective_date |

Triggers are persisted before processing for replayability.

---

## 3. Role Assessment (L1.A)

For each trigger:

1. Resolve subject (Workforce or Vendor).
2. Compute role set:
   - For NEW_HIRE / ROLE_CHANGE: from payload + organizational defaults.
   - For REACTIVATION: from prior profile, validated against current role.
   - For SCOPE_EXPANSION: union of current + new.
   - For VENDOR_ONBOARD: vendor_type → role.
   - For GOVERNANCE_APPOINTMENT: role from payload.
3. Resolve domain(s), service line(s), patient population(s), supervisor.
4. Snapshot to `OnboardingProfile`.
5. If ROLE_CHANGE, compute diff vs prior profile to scope requirement generation.

---

## 4. Requirement Generation (L1.B)

1. Look up applicable `OnboardingTemplate(s)` for `(role, trigger_type)` at current effective version.
2. Expand templates → ordered set of `RoleRequirement` references.
3. Apply scope filters (service line, population) — drop requirements not in scope.
4. Pre-existing evidence reconciliation:
   - For each requirement, query EvidenceObjects for `(subject, object_type, validity_window)`.
   - Suppress requirements satisfied by valid evidence; emit `REQUIREMENT_VERIFIED_BY_RECONCILIATION` audit event.
5. Determine due dates per requirement using template SLA + trigger effective date.
6. Resolve dependencies (e.g., Field Clearance depends on license PSV + competency + …).

---

## 5. Execution Batch Creation (L1.C)

1. Create `OnboardingExecutionBatch` (immutable spec snapshot).
2. Emit one `OnboardingExecutionUnit` per non-suppressed requirement.
3. Resolve `assignee` for each unit via CES Assignment Model.
4. Write batch + units in a single transaction.
5. Emit audit events: `BATCH_CREATED`, `REQUIREMENT_EMITTED` (per unit).

---

## 6. Workflow Execution (L2)

Each unit invokes its `workflow_id` at `workflow_version`. Workflows have:

- Explicit named steps with owners and SLAs.
- Lifecycle events emitted to L1: `Started`, `EvidenceCaptured`, `SignatureRequested`, `SignatureCompleted`, `SignatureDeclined`, `Failed`, `Completed`.
- Idempotent step execution to support retries.
- Replay support keyed off the unit_id + attempt index.

Workflows are authored in the Workflows library; the engine never inlines workflow logic.

---

## 7. Evidence Collection (L3.A)

Per workflow step requiring evidence:

1. Engine renders the required form (Forms library) or invokes external system pull.
2. On submission/return, validate against `evidence_schema`:
   - schema validation
   - content validation (file integrity, OCR-ability where required)
   - cross-checks (e.g., name match, date in range, source = primary)
3. Persist `EvidenceObject` (immutable, hashed, bound to subject + unit + batch + policy version).
4. Emit `EVIDENCE_CAPTURED` or `EVIDENCE_REJECTED` audit event.

---

## 8. Competency Validation (L2.B / L3.B)

Specialized workflow pattern:

1. Skill list rendered from `Competency.skills`.
2. Observer (qualified by role) records pass/fail per skill with notes.
3. Setting (patient/simulated) recorded.
4. Pass criteria evaluated.
5. Both observer and subject sign via eCIgn (multi-sig sequential).
6. Outcome:
   - **Pass** → unit Completed, evidence persisted.
   - **Fail** → attempt incremented, remediation sub-batch emitted (re-training + re-attempt), unit Failed; downstream Field Clearance remains Blocked.

---

## 9. Policy Acknowledgment Steps (L3.C)

1. Render policy at pinned version (with hash visible).
2. Display acknowledgment language.
3. Capture eCIgn signature bound to `PolicyVersionRef`.
4. Persist `SignatureRecord` + `EvidenceObject` (signed artifact).
5. Mark unit Completed.
6. On future `POLICY_VERSION_CHANGE` for this policy: existing acknowledgment becomes stale; engine emits a re-ack unit.

---

## 10. eCIgn Signature Steps (L3.D)

For every `SignatureSpec`:

1. Engine creates signing envelope (subject, signer roles, binds_to, ecign_template_id).
2. eCIgn handles:
   - identity verification per its policy
   - sequential or parallel signer ordering
   - watermarking and hashing of the signed artifact
3. eCIgn callbacks to engine on each signer event.
4. Engine updates unit state and emits audit events (`SIGNATURE_REQUESTED`, `SIGNATURE_COMPLETED`, etc.).
5. Final signed artifact stored as `EvidenceObject`.

Multi-signer flows (BAA, appointments, overrides) follow eCIgn doc 09.

---

## 11. CES Routing (L4)

- Each unit becomes a Sprint Execution Unit.
- Bundles surface as bundle pills on Sprint Board.
- Calendar entries written for unit due dates and credential windows.
- Assignment Model resolves and maintains owners.
- Sprint planning auto-includes onboarding bundles per due windows.

---

## 12. Gate Evaluation (L5)

Continuously and on demand:

- `field_clearance`, `billing_clearance`, `system_access_clearance`, `vendor_engagement_clearance`, `governance_active` evaluators read from EvidenceObjects, SignatureRecords, and unit states.
- Each evaluation writes a `GateEvaluation` audit event with inputs + outcome + caller.
- Downstream systems consume gate APIs and refuse actions on Fail.

---

## 13. Override Handling (L5.B)

- Override request workflow: requester selects gate/rule, subject, reason, validity window.
- Dual eCIgn (Compliance Officer + Administrator).
- `OverrideRecord` created with `valid_from`/`valid_to`.
- Gate evaluator factors active overrides; expired overrides are ignored.
- All override events appear on the Audit Readiness dashboard.

---

## 14. Audit Readiness Closure (L6)

A batch closes when:

1. All units in terminal Completed (or audited Suppressed) state.
2. All required evidence valid.
3. All required signatures captured.
4. All applicable gates Pass.
5. Compliance Officer (or delegate) attestation captured (eCIgn).
6. `BATCH_COMPLETED` audit event written; readiness score updated; dossier snapshot sealed.

---

## 15. Escalation & Blocked-State Handling

- Escalation tiers (T-30/T-14/T-7/T-0) per doc 06.
- Blocked state hides downstream dependent units until gate clears.
- Blocked batches surface as red on Dashboard, Sprint Board, Calendar.
- Withdrawal path: explicit `BATCH_WITHDRAWN` event with reason; audit trail preserved.

---

## 16. Concurrency & Idempotency

- Trigger intake is idempotent on `(source, source_event_id)`.
- Engine operations are transactional per batch; partial failures roll back unit emission.
- Workflow steps are idempotent on `(unit_id, attempt, step_id)`.
- Audit events are append-only; duplicates rejected by `(stream, sequence)`.

---

## 17. Replay & Reproducibility

- Persisted triggers + immutable templates + immutable evidence/signatures + hash-chained audit events allow full reconstruction of any historical batch.
- Surveyor-grade reproducibility: given a date and subject, the system can show exactly which template version, which policy versions, which evidence, and which signatures governed compliance at that moment.
