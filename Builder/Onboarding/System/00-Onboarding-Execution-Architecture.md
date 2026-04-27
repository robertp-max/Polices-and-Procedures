# 00 — Onboarding Execution Architecture

> **Status**: Phase 0 — Mandatory architecture gate. Implementation may not begin until this document is approved.
>
> **Aligns with**: `../11-Workflow-Architecture.md`, `../03-Onboarding-Execution-Engine.md`, `../04-CES-Integration.md`, `../06-Enforcement-Rules.md`, `../08-Data-Model.md`.

This document defines exactly **how the onboarding system runs**: services, events, state machines, data flow, gates, CES integration, audit/replay, failure handling, and scaling. It is the authoritative runtime contract.

---

## 1. Runtime Flow (End-to-End)

The system is a **deterministic, event-driven pipeline** that converts a person/role event into compliance-bound execution work. It is the runtime realization of `11-Workflow-Architecture.md`.

```
[L0] Trigger Source (HRIS / Admin UI / Calendar / Policy Library / Vendor Mgmt / Governance)
        │
        ▼ (TRIGGER_RECEIVED)
[L1] Onboarding Engine
        │   1. Profile Resolution            → PROFILE_RESOLVED
        │   2. Template Selection            → TEMPLATE_SELECTED (template_id, version)
        │   3. Requirement Expansion         → N × REQUIREMENT_RESOLVED
        │   4. Pre-Existing Reconciliation   → REQUIREMENT_VERIFIED_BY_RECONCILIATION (k)
        │   5. Batch Creation                → BATCH_CREATED
        │   6. Unit Emission (transactional) → N × UNIT_CREATED
        │
        ▼
[L2] Workflow Orchestrator
        │   Per unit → invoke WF-* at pinned workflow_version
        │   Steps emit: STEP_STARTED / STEP_COMPLETED / STEP_FAILED
        │
        ▼
[L3] Evidence + Signature
        │   Evidence Service       → EVIDENCE_CAPTURED / EVIDENCE_REJECTED
        │   eCIgn Integration      → SIGNATURE_REQUESTED / SIGNATURE_COMPLETED / SIGNATURE_DECLINED
        │
        ▼
[L4] Gate Evaluation Service
        │   On unit completion + on demand by callers
        │   → GATE_EVALUATED (Pass / Fail / Conditional)
        │
        ▼
[L5] CES Adapter Layer
        │   Inject bundles / units → Sprint Board
        │   Write deadlines        → Compliance Calendar
        │   Resolve owners         → Assignment Model
        │   Sync state             → CES bundle/unit state
        │
        ▼
[L6] Audit / Event Store
        │   All events appended (hash-chained, replayable)
        │
        ▼
[L7] Closure
            Compliance Officer attestation (eCIgn) → BATCH_COMPLETED
            Readiness score updated; dossier sealed
```

Every step emits a typed event into the Audit Event Store. **No state mutation occurs without an event.** Replay reconstructs every batch deterministically.

---

## 2. Service Boundaries

The runtime is decomposed into the services below. Each service owns its data, exposes a typed contract, and communicates only via events + RPC. No service reaches into another's tables.

### 2.1 Trigger Intake Service

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Accept typed triggers from external sources; idempotently persist. |
| **Inputs** | `TriggerEnvelope { source, source_event_id, trigger_type, payload, occurred_at }` |
| **Outputs** | Persisted trigger record; `TRIGGER_RECEIVED` event |
| **Idempotency key** | `(source, source_event_id)` |
| **Consumers** | Onboarding Engine |

### 2.2 Onboarding Engine Service

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Orchestrate Profile → Template → Requirements → Batch → Units. Owns batch + unit lifecycle. |
| **Inputs** | `TRIGGER_RECEIVED`; lifecycle callbacks from downstream services |
| **Outputs** | `PROFILE_RESOLVED`, `TEMPLATE_SELECTED`, `REQUIREMENT_EMITTED`, `BATCH_CREATED`, `UNIT_CREATED`, `UNIT_STATE_CHANGED`, `BATCH_COMPLETED`, `BATCH_WITHDRAWN` |
| **Owns** | `OnboardingProfile`, `OnboardingExecutionBatch`, `OnboardingExecutionUnit` |
| **Calls** | Requirement Resolution, Execution Batch Generator, CES Adapter |

### 2.3 Requirement Resolution Service

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Given (profile, trigger_type) → resolve `OnboardingTemplate` at effective version → expand into ordered `RoleRequirement` set → apply scope filters → reconcile against existing valid evidence. |
| **Inputs** | Profile, trigger payload, evidence index (read-only) |
| **Outputs** | Ordered requirement plan: `[{requirement_id, due_at, dependencies, suppressed?, reason?}]`; events: `TEMPLATE_SELECTED`, `REQUIREMENT_RESOLVED`, `REQUIREMENT_VERIFIED_BY_RECONCILIATION` |
| **Reads** | Templates, RoleRequirements, EvidenceObject index |
| **Determinism** | Pure function of (profile, trigger, template@version, evidence snapshot) |

### 2.4 Execution Batch Generator

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Materialize the requirement plan into a persisted `OnboardingExecutionBatch` + `OnboardingExecutionUnit`s in a single transaction. |
| **Inputs** | Requirement plan + assignment hints |
| **Outputs** | `BATCH_CREATED`, N × `UNIT_CREATED` |
| **Transactional guarantee** | All-or-none. Partial emission is impossible. |
| **Calls** | CES Assignment Model (for `assignee_id` resolution) |

### 2.5 Workflow Orchestrator

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Execute `WF-*` workflows for each unit at pinned `workflow_version`. Drive step lifecycle. |
| **Inputs** | `UNIT_CREATED` (subscribed); workflow step events |
| **Outputs** | `STEP_STARTED`, `STEP_COMPLETED`, `STEP_FAILED`; on terminal state → `UNIT_STATE_CHANGED` (Completed/Failed) back to engine |
| **Idempotency** | `(unit_id, attempt, step_id)` |
| **Replay** | Steps are pure given inputs + evidence + signature refs |

### 2.6 Evidence Service

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Capture, validate, persist `EvidenceObject`s (immutable, hashed, content-addressed). Reject invalid. Index for reconciliation. |
| **Inputs** | Form submissions, file uploads, external system pulls, system attestations |
| **Outputs** | `EVIDENCE_CAPTURED { evidence_id, content_hash, validation }`, `EVIDENCE_REJECTED { reason }` |
| **Storage** | Immutable object store + metadata DB |
| **Validation** | Schema validation; content checks (size/type/OCR); cross-field rules per `evidence_schema` |

### 2.7 eCIgn Integration Service

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Manage signing envelopes (single + multi-signer per `eCIgn/09-Multi-Signature-Flow.md`). Persist `SignatureRecord`s. Bind signed artifacts to PolicyVersion / EvidenceObject / Appointment. |
| **Inputs** | `SignatureRequest { binds_to, signer_specs, ecign_template_id }` |
| **Outputs** | `SIGNATURE_REQUESTED`, `SIGNATURE_COMPLETED { signed_artifact_uri, hash, signer_id, ts, auth_method }`, `SIGNATURE_DECLINED`, `SIGNATURE_EXPIRED` |
| **Guarantees** | Watermark + content hash on signed artifact; identity-bound; immutable |

### 2.8 Gate Evaluation Service

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Evaluate Field/Billing/SystemAccess/VendorEngagement/GovernanceActive gates for any `(subject, [date])`. Read-only over Evidence + Signatures + Unit states + Overrides. |
| **Inputs** | `GateEvaluationRequest { gate_id, subject_id, as_of? }`; subscribes to `UNIT_STATE_CHANGED`, `EVIDENCE_CAPTURED`, `SIGNATURE_COMPLETED`, `OVERRIDE_GRANTED`, `OVERRIDE_EXPIRED` |
| **Outputs** | `GATE_EVALUATED { gate_id, subject_id, outcome, reasons[], inputs }`; signed assertion for downstream callers |
| **Determinism** | Pure function of state at `as_of`; replayable |

### 2.9 CES Adapter Layer

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Bidirectional bridge to CES (Sprint Board, Compliance Calendar, Assignment Model, Recurring Execution, Enforcement). |
| **Inputs (out → CES)** | Bundle creation, unit creation, calendar entries, recurring rules, escalation triggers |
| **Inputs (in ← CES)** | Owner reassignment, sprint state, calendar acknowledgments |
| **Outputs** | `CES_BUNDLE_INJECTED`, `CES_UNIT_INJECTED`, `CES_CALENDAR_ENTRY_CREATED`, `CES_OWNER_CHANGED` |
| **Note** | Onboarding never owns its own task list or calendar. CES is canonical. |

### 2.10 Audit / Event Store

| Aspect | Detail |
|--------|--------|
| **Responsibility** | Append-only, hash-chained event log. Source of truth for replay, dossier reconstruction, audit defense. |
| **Inputs** | All events from all services |
| **Outputs** | Stream API, point-in-time query, dossier projection |
| **Guarantees** | Immutable; tamper-evident (hash chain); per-stream monotonic sequence; replayable |

---

## 3. Event-Driven Architecture

### 3.1 Canonical Event Envelope

```jsonc
{
  "event_id": "01HXYZ...",          // ULID, unique
  "event_type": "UNIT_STATE_CHANGED",
  "stream": "batch:01HABC...",      // hash-chain stream
  "sequence": 47,                   // monotonic per stream
  "prev_hash": "sha256:...",        // hash of previous event in stream
  "event_hash": "sha256:...",       // hash of this canonical payload
  "occurred_at": "2026-04-24T14:32:11.412Z",
  "actor": { "type": "system|user", "id": "...", "role": "..." },
  "subject_id": "wfm_...",
  "batch_id": "bat_...",
  "unit_id": "unt_...",
  "idempotency_key": "trg:hris:42|unit:emit",
  "payload": { /* event-type-specific */ },
  "schema_version": 1
}
```

### 3.2 Event Catalog (payloads)

| Event | Producer | Payload (key fields) |
|-------|----------|----------------------|
| `TRIGGER_RECEIVED` | Trigger Intake | `trigger_type`, `source`, `source_event_id`, `payload` |
| `PROFILE_RESOLVED` | Engine | `profile_id`, `roles[]`, `domains[]`, `scope`, `prior_profile_id?` |
| `TEMPLATE_SELECTED` | Requirement Resolution | `template_id`, `template_version`, `effective_at` |
| `REQUIREMENT_RESOLVED` | Requirement Resolution | `requirement_id`, `due_at`, `dependencies[]`, `gate_contributions[]` |
| `REQUIREMENT_VERIFIED_BY_RECONCILIATION` | Requirement Resolution | `requirement_id`, `evidence_object_id`, `validity_window`, `reason` |
| `REQUIREMENT_EMITTED` | Engine | `requirement_id`, `unit_id` |
| `BATCH_CREATED` | Engine | `template_id@version`, `due_at`, `unit_count`, `gate_contributions[]` |
| `UNIT_CREATED` | Engine | `requirement_id`, `workflow_id@version`, `assignee_id`, `due_at`, `dependencies[]` |
| `UNIT_STATE_CHANGED` | Workflow Orchestrator / Engine | `from`, `to`, `reason`, `attempt?` |
| `EVIDENCE_CAPTURED` | Evidence Service | `evidence_id`, `object_type`, `content_hash`, `policy_version_ref?`, `validation` |
| `EVIDENCE_REJECTED` | Evidence Service | `object_type`, `reason`, `validation_errors[]` |
| `SIGNATURE_REQUESTED` | eCIgn | `envelope_id`, `binds_to_type`, `binds_to_ref`, `signer_specs[]` |
| `SIGNATURE_COMPLETED` | eCIgn | `envelope_id`, `signer_id`, `signed_artifact_uri`, `hash`, `auth_method`, `ip`, `ts` |
| `SIGNATURE_DECLINED` | eCIgn | `envelope_id`, `signer_id`, `reason` |
| `GATE_EVALUATED` | Gate Service | `gate_id`, `outcome`, `reasons[]`, `inputs[]`, `caller` |
| `OVERRIDE_GRANTED` | Engine | `gate_id`, `signers[]`, `valid_from`, `valid_to`, `reason` |
| `OVERRIDE_EXPIRED` | Engine | `override_id` |
| `BATCH_COMPLETED` | Engine | `attestation_signature_id`, `dossier_snapshot_id`, `readiness_delta` |
| `BATCH_WITHDRAWN` | Engine | `reason`, `withdrawn_by` |

### 3.3 Event Flow (subscriptions)

| Service | Subscribes to | Reacts by |
|---------|---------------|-----------|
| Onboarding Engine | `TRIGGER_RECEIVED`, `STEP_COMPLETED/FAILED`, `EVIDENCE_*`, `SIGNATURE_*`, `GATE_EVALUATED`, `OVERRIDE_*` | Drive batch/unit state machine |
| Workflow Orchestrator | `UNIT_CREATED`, `UNIT_STATE_CHANGED (resumed)` | Run/resume workflow steps |
| Gate Service | `UNIT_STATE_CHANGED`, `EVIDENCE_CAPTURED`, `SIGNATURE_COMPLETED`, `OVERRIDE_*` | Re-evaluate affected gates; emit `GATE_EVALUATED` |
| CES Adapter | `BATCH_CREATED`, `UNIT_CREATED`, `UNIT_STATE_CHANGED`, deadline events | Sync to Sprint Board / Calendar |
| Audit Store | **All events** | Append + hash-chain |

### 3.4 Idempotency Rules

- **Trigger intake**: dedupe on `(source, source_event_id)`.
- **Engine emission**: dedupe on `(trigger_id, "batch_emit")` and `(batch_id, requirement_id, "unit_emit")`.
- **Workflow step**: dedupe on `(unit_id, attempt, step_id)`.
- **Evidence**: dedupe on `(unit_id, evidence_logical_key)` where logical_key = e.g., `("oasis_competency_form", form_version)`. Re-uploads supersede via new EvidenceObject + supersession link.
- **Signature**: dedupe on eCIgn envelope_id.
- **Gate evaluation**: cache key `(gate_id, subject_id, state_vector_hash)`; same hash returns cached outcome.
- **Audit append**: rejected on duplicate `(stream, sequence)`.

---

## 4. State Machines

### 4.1 Batch State Machine

```
PendingActivation
   │ engine.activate()
   ▼
InProgress  ◄────────────────────────────┐
   │                                     │
   ├── any unit AwaitingSignature ──► AwaitingSignature
   ├── any unit AwaitingEvidence  ──► AwaitingEvidence
   ├── any unit Blocked           ──► Blocked
   ├── unit nearing SLA           ──► AtRisk
   │                                     │
   │ all units terminal-positive         │
   ▼                                     │
Completed (sealed; readiness updated)    │
                                         │
Withdrawn ◄── explicit withdrawal ───────┘

RevalidationDue (separate batch lifecycle, identical transitions)
```

#### Aggregate-state precedence (highest first)
`Blocked` > `AwaitingSignature` > `AwaitingEvidence` > `AtRisk` > `InProgress` > `PendingActivation`

Terminal states: `Completed`, `Withdrawn`.

#### Transition rules
- `PendingActivation → InProgress`: at least one unit transitions from `NotStarted`.
- `* → Blocked`: any unit Blocked OR any HARD GATE in scope evaluates Fail without an active override.
- `* → AwaitingSignature`: any unit `AwaitingSignature` and no Blocked.
- `* → AwaitingEvidence`: any unit `AwaitingEvidence` and no Blocked, no AwaitingSignature.
- `* → AtRisk`: any unit `due_at - now ≤ template.at_risk_window` and no Blocked.
- `* → Completed`: all units in `{Completed, Suppressed}` AND all required gates Pass AND attestation signed.
- `* → Withdrawn`: explicit, audited.

### 4.2 Unit State Machine

```
NotStarted
   │ workflow start
   ▼
InProgress ──► AwaitingEvidence ──► AwaitingSignature ──► Completed
   │                │                     │                    ▲
   │                │                     │                    │
   │                ▼                     ▼                    │
   │            Blocked  ◄── gate fail / dep fail              │
   │                │                                          │
   │                ▼                                          │
   │            (resolved → InProgress)                        │
   │                                                           │
   ├── workflow.fail (e.g., competency Fail) ──► Failed ───────┘ (after remediation re-attempt completes)
   │
   └── reconciliation match at emit time ──► Suppressed (terminal)
```

#### Transition rules
- A unit may not enter `Completed` unless all `evidence_required` are Valid and all `signature_required` are Signed.
- `Failed → InProgress (new attempt)`: only via remediation sub-batch unit completion; `attempts[]` length increases by 1.
- `Blocked → InProgress`: only when blocker is cleared AND audit event records the unblock cause.
- `Suppressed`: terminal; cannot resurrect (a future trigger creates a new unit).

#### Blockers (`* → Blocked`)
- Dependency unit not Completed.
- Required gate Fail at evaluation time.
- Required policy version not pinned (drift detected).
- Required workflow version unavailable.
- Assignee unresolved past assignment SLA.

#### Escalation Triggers
- Window crossings: T-30 / T-14 / T-7 / T-0 (per template SLA) → `ESCALATION_RAISED` events; tier increments.
- Signature outstanding > spec SLA → re-issue + escalate.
- Evidence rejected ≥ N times → escalate to Compliance Officer.

---

## 5. Data Flow

```
Policy (versioned, hashed)
   │
   ▼ pinned via PolicyVersionRef
RoleRequirement (catalog) ─────┐
   │                           │
   ▼                           ▼
OnboardingTemplate@v ──► OnboardingExecutionBatch
                                 │
                                 ▼
                         OnboardingExecutionUnit
                              │       │
                              ▼       ▼
                     EvidenceObject  SignatureRecord
                       (immutable,    (eCIgn-bound,
                        hashed,        hashed signed
                        bound to       artifact, bound
                        policy_ver)    to evidence or
                                       policy_ver)
                              │       │
                              └───┬───┘
                                  ▼
                       OnboardingAuditEvent (append-only, hash-chained)
                                  │
                                  ▼
                       Per-Subject Dossier (projection)
```

### Bindings (mandatory)

- **PolicyVersionRef** is captured at three points:
  1. Template publish (pins the policy versions it depends on).
  2. Evidence capture (binds evidence to policy version in force at capture time).
  3. Signature (binds the signed artifact to policy version it acknowledges).
- **EvidenceObject** binding fields: `subject_id`, `unit_id`, `batch_id`, `policy_version_ref?`, `content_hash`, `source`.
- **SignatureRecord** binding fields: `binds_to_type ∈ {PolicyVersion, EvidenceObject, Appointment}`, `binds_to_ref`, `signed_artifact_hash`.

### Dossier projection

Per `subject_id`: union of all EvidenceObjects, SignatureRecords, GateEvaluations, Overrides, RoleAssignments — projected from the audit stream. Re-derivable at any time.

---

## 6. Gate Enforcement Flow

### 6.1 When Gates Are Evaluated

- **Reactive**: on `UNIT_STATE_CHANGED`, `EVIDENCE_CAPTURED`, `SIGNATURE_COMPLETED`, `OVERRIDE_*` for any subject in scope.
- **On demand**: by downstream callers (Scheduling, Billing, IAM, Vendor Mgmt) via `GateService.evaluate(gate_id, subject_id, as_of?)`.
- **Scheduled**: nightly sweep to detect drift (e.g., credential expired silently).

### 6.2 Failure Propagation

```
GateEvaluationRequest
        │
        ▼
GateService computes inputs:
   - required RoleRequirements satisfied? (units Completed)
   - required Evidence Valid + within validity window?
   - required Signatures Completed and bound to current policy_version?
   - active Override applicable?
        │
        ▼
Outcome ∈ { Pass, Fail, Conditional }
        │
        ├── Fail/Conditional → batch.recompute() may transition to Blocked
        ├── always emits GATE_EVALUATED event with reasons[]
        └── returns signed assertion to caller
```

### 6.3 How Systems Consume Results

- Callers receive a **signed assertion** `{gate_id, subject_id, outcome, as_of, reasons, signature}`.
- Callers MUST refuse the downstream action on `Fail`/`Conditional`.
- Refusal is itself logged: caller emits `DOWNSTREAM_REFUSAL` audit event.

### 6.4 Override Injection Flow (Dual Signature)

```
OverrideRequest { gate_id, subject_id, reason, valid_until }
        │
        ▼
Compliance Officer eCIgn ── (1st signer)
        │
        ▼
Administrator eCIgn ─────── (2nd signer, multi-sig sequential)
        │
        ▼
OverrideRecord persisted { active, valid_from, valid_to }
        │
        ▼
OVERRIDE_GRANTED event → Gate Service re-evaluates affected gates
        │
        ▼
On valid_to → scheduler emits OVERRIDE_EXPIRED → Gate Service re-evaluates
```

Overrides are bounded (default ≤ 30 days), audited, and visible on the readiness dashboard. They never apply retroactively to historical gate evaluations.

---

## 7. CES Integration Flow

### 7.1 Bundle / Unit Injection

- On `BATCH_CREATED`: CES Adapter creates a CES Bundle (per `Compliance-Execution-Sprints/05-Work-Bundling-Strategy.md`) with `source = "Onboarding"` and a sub-tag (e.g., `New Hire`, `Revalidation`, `Vendor`).
- On `UNIT_CREATED`: CES Adapter creates a CES Sprint Execution Unit linked to the bundle. Status mirroring is bidirectional.

### 7.2 Calendar Entries

- On `UNIT_CREATED` (with `due_at`) and on `RECURRING_RULE_NEXT_DUE`: CES Adapter writes a `CalendarEntry` per `Compliance-Execution-Sprints/09-Calendar-Integration.md`.
- Pre-window alerts (T-60 / T-30 / T-14 / T-7) are computed by the Calendar engine and fed back as `ESCALATION_RAISED`.

### 7.3 Assignment Resolution

- During Batch Generation, the Adapter calls CES Assignment Model (per `04-Assignment-Model.md`) with `(role_required_to_perform, branch, scope)`.
- Owner reassignments in CES propagate back as `CES_OWNER_CHANGED` → engine updates `assignee_id` + emits `UNIT_STATE_CHANGED`.

### 7.4 State Sync

| Onboarding Unit State | CES Unit Column |
|-----------------------|-----------------|
| NotStarted | Backlog |
| InProgress | In Progress |
| AwaitingEvidence | Awaiting Evidence |
| AwaitingSignature | Awaiting Signature |
| Blocked | Blocked |
| Completed / Suppressed | Completed |
| Failed (pending remediation) | Blocked (with sub-batch link) |

Sync is event-driven; the Adapter does not poll.

---

## 8. Audit & Replay

### 8.1 Append-Only Event Model

- Single logical event log; partitioned by `stream` (e.g., `batch:<id>`).
- Writes are append-only; no UPDATE, no DELETE.
- Each event carries `prev_hash` (hash of prior event in stream) and `event_hash` (hash of canonical payload).

### 8.2 Hash Chaining

```
event[n].prev_hash = event[n-1].event_hash
event[n].event_hash = SHA256(canonicalize(event[n].payload + envelope_minus_hashes))
```

A nightly **chain verifier** walks every stream end-to-end and alerts on mismatch. Verification result itself is an audited event.

### 8.3 Replay

Given a `batch_id`, replay reconstructs:
- Profile, template@version, requirement plan
- Every unit and its lifecycle
- Every evidence/signature reference
- Every gate evaluation
- Final state

Replay is used for: auditor reproduction, regression testing, and disaster recovery rebuilds of derived state (Sprint Board, Dossier).

### 8.4 Dossier Reconstruction

Per-subject dossier = projection from audit stream filtered by `subject_id`, then enriched with referenced EvidenceObjects + SignatureRecords. Exportable as a watermarked, hash-verifiable PDF. The export itself emits an audit event.

---

## 9. Failure Handling

### 9.1 Partial Batch Failures

- Batch + unit emission is **single-transaction**. A failure during emission rolls back the entire transaction and returns the trigger to the queue (visible-after = backoff).
- Once committed, individual unit failures **do not** invalidate the batch; they transition the unit to `Failed`/`Blocked` with audit.

### 9.2 Retry Strategy

| Failure | Strategy |
|---------|----------|
| Transient (network, DB lock) | Exponential backoff: 1s, 2s, 4s, 8s, 16s; max 5 attempts |
| Workflow step failure (non-deterministic) | Retry up to step's `max_attempts`; after exhaustion, mark unit Failed and escalate |
| Workflow step failure (deterministic, e.g., competency Fail) | No retry; emit remediation sub-batch; unit Failed |
| Evidence validation failure | No retry; reopen unit; user must re-capture |
| Signature decline | No retry; engine reroutes per spec or escalates |
| Gate evaluation crash | Caller receives `Conditional`+`reason=service_unavailable`; downstream MUST refuse |

### 9.3 Idempotency Keys

Already specified §3.4. Every retryable operation carries an idempotency key persisted before side effects.

### 9.4 Rollback Rules

- **Hard rule**: Audit events never roll back. Once appended, they remain.
- **Compensation, not rollback**: erroneous state is corrected by a forward compensating event (e.g., `UNIT_STATE_CHANGED { reason: "compensating", correlation_id }`).
- Evidence/signature artifacts are never deleted; superseded artifacts are linked via supersession chain.

---

## 10. Performance & Scaling

### 10.1 Performance Budgets (initial targets)

| Operation | p95 Budget |
|-----------|------------|
| Trigger intake → BATCH_CREATED | ≤ 2.0 s for batches up to 50 units |
| Single unit emission (within batch tx) | ≤ 30 ms |
| Gate evaluation (cached state vector) | ≤ 50 ms |
| Gate evaluation (full recompute) | ≤ 300 ms |
| Evidence capture (form/upload, excl. user time) | ≤ 500 ms validation |
| Signature envelope creation | ≤ 800 ms (eCIgn-bound) |
| Dossier export (typical 24-month subject) | ≤ 5 s |
| Sprint Board surfacing of new bundle | ≤ 3 s after `BATCH_CREATED` |

### 10.2 Concurrent Onboarding

- Engine is horizontally scalable; partitioning key = `subject_id` (so all events for a subject serialize on a single worker, preserving causal order).
- Workflow Orchestrator: per-unit workers; concurrency unbounded across units, bounded per `subject_id` for ordering-sensitive flows.
- Gate Service: stateless; scales horizontally; cache layer keyed on `(gate_id, subject_id, state_vector_hash)` with reactive invalidation on relevant events.

### 10.3 Event Queue Handling

- **Backbone**: durable, ordered-per-partition message bus (e.g., Kafka-style). Partition key = `subject_id`.
- **At-least-once delivery**; consumers idempotent via §3.4.
- **DLQ** for poison messages with on-call alert; never silent drop.
- **Backpressure**: producers throttle when consumer lag > threshold; trigger intake degrades to async-ack with persisted queue.

### 10.4 Storage

- Audit store: append-only log + columnar projection for queries.
- Evidence/signed artifacts: object storage with content-addressed paths (`/<sha256-prefix>/<sha256>`), immutable, versioned bucket.
- Hot indices on `(subject_id, status, due_at)`, `(batch_id, sequence)`, `(subject_id, object_type, status)`.

### 10.5 Observability

- Per-event structured logging.
- Metrics: events/sec per type; p50/p95/p99 latencies per service operation; gate Fail rate by gate; batch completion lead time; override count.
- Traces: a `correlation_id` flows from `TRIGGER_RECEIVED` through every downstream event.

---

## 11. Cross-Cutting Non-Negotiables

1. **No state mutation without an audited event.**
2. **No completion without evidence + signature + audit close.**
3. **No paper signatures.** eCIgn only.
4. **No bulk acknowledgments.** One signature per policy per version.
5. **No silent suppression.** Reconciliation always emits an event.
6. **No checkbox-only completion paths.**
7. **No bypass of HARD GATEs** except via dual-signature, time-bounded, audited Override.
8. **No service reaches into another service's tables.** Events + RPC only.
9. **Templates and workflows are versioned and immutable once published.**
10. **Replay must reproduce any historical batch.**

---

## 12. Open Decisions (deferred to implementation kickoff)

- Concrete message bus selection (Kafka vs. Pulsar vs. cloud-native).
- Object store provider for evidence + signed artifacts.
- eCIgn vendor / in-house service confirmation (per `Builder/eCIgn/` contracts).
- Identity provider integration for actor/auth (SSO, MFA policy).
- HRIS connector(s) — initial source, SLA expectations.

These do not block architecture approval; they are recorded so implementation begins with explicit choices.
