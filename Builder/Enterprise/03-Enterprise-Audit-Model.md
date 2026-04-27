# 03 — Enterprise Audit Model

> **Status**: EXTENSION of the existing append-only, hash-chained audit store (`server/ecign/store.ts`, `server/ecign/hashChain.ts`, `Builder/eCIgn/03-Audit-and-Compliance-Model.md`, `Builder/Onboarding/System/00-Onboarding-Execution-Architecture.md` §8). Generalizes the existing chain into the **global AuditEvent system** consumed by every service.
>
> **Mandates (non-negotiable)**:
> - **No service-specific audit models.**
> - **No mutable logs.**
> - **No silent actions.**
> - Everything emits `AuditEvent`.

---

## 1. Goals

1. One canonical event envelope across all domains.
2. Tamper-evident hash chain (already in production for eCIgn / onboarding) extended to all services.
3. Replay-driven reconstruction of any historical state.
4. Auditor-friendly projections (per-subject dossier, per-actor activity, per-resource history, per-session trail).
5. PHI-aware logging that does **not** store PHI in event payloads.

---

## 2. Canonical Envelope

```ts
AuditEvent {
  // Identity
  event_id          : ULID                  // unique
  event_type        : string                // dotted, e.g. "execution_unit.state_changed"
  event_version     : int                   // schema version of this event_type
  occurred_at_utc   : ISO-8601

  // Stream / chain
  stream            : string                // partition key, e.g. "batch:<id>", "user:<id>", "global"
  sequence          : int                   // monotonic per stream
  prev_hash         : sha256                // previous event_hash in stream (or "GENESIS")
  event_hash        : sha256                // sha256(canonical(payload_for_hash))

  // Actor
  actor : {
    type            : "user" | "service" | "system"
    user_id?        : ULID
    service_id?     : string                // for system_service principals
    on_behalf_of?   : ULID                  // delegation chain, audited
    impersonation?  : { authorized_by, reason, signature_ref }
  }

  // Action + Resource (always present)
  action            : Action                // verb from §3
  resource : {
    type            : ResourceType
    id              : string | composite
    parent_ref?     : { type, id }
  }

  // Decision context
  decision?         : "permit" | "deny" | "indeterminate"
  decision_reason?  : string                // closed-set reason code
  authz_policy_ver? : int                   // version of permission bundle used

  // Before / After (state diff — see §4)
  before?           : object | null
  after?            : object | null

  // Correlation / observability
  correlation_id    : ULID                  // propagates through all events from one trigger
  causation_id?     : ULID                  // event_id that caused this one
  session_id?       : ULID                  // server-side session
  request_id?       : ULID                  // single API request
  trace_id?         : string                // OpenTelemetry trace
  span_id?          : string

  // Environment
  environment : {
    ip?             : string                // truncated (/24 IPv4, /48 IPv6) for privacy where policy applies
    user_agent?     : string
    device_id?      : string
    tls_version?    : string
    geo?            : { country, region }   // coarse only
  }

  // Severity & classification
  severity          : "info" | "notice" | "warning" | "high" | "critical"
  phi_flag          : boolean               // true if access touched PHI (payload still PHI-free)
  pii_flag          : boolean
  retention_class   : "standard" | "claims" | "phi-access" | "legal-hold"

  // Bindings (optional)
  signature_ref?    : SignatureRecordRef
  evidence_refs?    : EvidenceObjectRef[]
  policy_refs?      : PolicyVersionRef[]

  // Free-form payload (validated against event_type schema; PHI-free)
  payload           : object
  schema_version    : int
}
```

`event_hash` is computed over `canonical({ event_id, event_type, event_version, occurred_at_utc, stream, sequence, prev_hash, actor, action, resource, decision?, before?, after?, payload, schema_version })`. Existing canonicalization in `server/ecign/hashChain.ts` is the reference implementation.

---

## 3. Action Catalog

Closed set (mirrors `01-Enterprise-Access-Control.md` §2.7):

```
view · list · search · export · create · update · withdraw ·
assign · reassign · approve · sign · countersign · reject ·
override · revoke · suppress · activate · deactivate ·
acknowledge · attest · dispatch · ingest · replay · audit ·
authenticate · session_start · session_end · access_decision · phi_access
```

Anything not in this set requires an architectural change.

---

## 4. Before / After Semantics

- For `*:create`: `before = null`, `after = full_canonical_state` (PHI-free; PHI fields replaced with redacted markers).
- For `*:update` / state changes: `before` and `after` capture **diffed fields** only.
- For `*:view` / `phi_access`: `before` = null, `after` = null; `payload` carries minimum-necessary descriptor.
- For `*:approve`/`*:sign`: `before` = pre-decision state, `after` = post-decision state, `signature_ref` populated.
- For `access_decision`: `before` = null, `after` = null; `payload = { permission_id, decision, reason, attributes_evaluated[] }`.

PHI never appears in `before`, `after`, or `payload`. PHI references use opaque IDs (e.g., `patient_id`).

---

## 5. Streams & Partitioning

Streams are partition keys for hash chaining and are chosen for **causal locality**:

| Stream key | Used for |
|------------|----------|
| `global` | Cross-cutting events (auth policy changes, identity registry changes) |
| `batch:<batch_id>` | All events for a CEU batch (preserves onboarding chain semantics) |
| `ceu:<ceu_id>` | Standalone CEU stream when not under a batch |
| `user:<user_id>` | All actor-bound events for a user (activity tracking) |
| `subject:<subject_id>` | Per-subject dossier projection source |
| `session:<session_id>` | Per-session activity (login → logout) |
| `policy:<policy_id>` | Lifecycle of a policy |
| `vendor:<vendor_id>` | Vendor lifecycle |
| `incident:<incident_id>` | Incident case stream |

A single logical event may be written to multiple streams **only via projections**, never as duplicate appends. The canonical write goes to **one stream**; projections are derived.

---

## 6. Hash Chain Rules (extended)

- Chain per stream: `event[n].prev_hash = event[n-1].event_hash`; first event in a stream has `prev_hash = "GENESIS"`.
- The current `verifyChain()` is generalized to operate per stream and globally.
- **Nightly verifier** runs over all streams; failure raises `audit.chain_break_detected` and **blocks** dossier exports.
- **Cross-stream witness anchor** (optional, recommended): hourly write of a `global` audit event whose payload contains the latest `event_hash` of every active stream, providing an external anchor against rewrite of any single stream.

---

## 7. Replay

Given a stream and an `as_of` timestamp:

1. Read events `[0..k]` where `occurred_at_utc <= as_of`.
2. Apply each event's `after` to a projection (or use a domain reducer).
3. Cross-reference `evidence_refs`/`signature_refs`/`policy_refs` for content-addressed resolution.

Replay capabilities:

- **Subject dossier** at any historical date.
- **Permission state** at any historical date (effective `RoleAssignment`s + active overrides).
- **CEU/Batch state** for surveyor reproducibility.
- **Vendor compliance ledger** at audit window.

Replay is **read-only**. It MAY emit `audit:replay` events for traceability of who replayed what.

---

## 8. PHI-Aware Logging

- Event payloads are validated by schema; payloads with PHI patterns are rejected at the boundary.
- `phi_access` events are written for any access to a PHI resource; payload contains: `purpose`, `legal_basis`, `data_classes`, `minimum_necessary_assertion`, `record_count` — never raw PHI.
- `phi:export` events additionally carry `recipient_hint`, `delivery_mechanism`, `review_signature_ref`.
- Bulk PHI exports require dual-sig (CO + Admin) and are audited at `severity = critical`.

---

## 9. Severity & Alerting

| Severity | Examples | Action |
|----------|----------|--------|
| `info` | view, list, search, normal CEU transitions | None |
| `notice` | login, logout, evidence captured, signature requested | Aggregate metrics |
| `warning` | repeated denies, late SLA, signature declined | Dashboard surface |
| `high` | SoD violation, override granted, PHI access spike, role escalation, gate refusal | Compliance Officer notification |
| `critical` | chain break detected, audit write failure, mass PHI export, account compromise indicators, integrity violation | Immediate page (CO + Security Officer + on-call) |

---

## 10. Retention Classes

| retention_class | Minimum | Notes |
|-----------------|---------|-------|
| `standard` | 7 years | Default for compliance events |
| `claims` | 10 years | FN-BC-001 / Medicare-Medicaid lookback |
| `phi-access` | 6 years | HIPAA §164.530(j) for documentation |
| `legal-hold` | Indefinite | Until counsel releases hold |

Storage layer enforces retention via lifecycle policies + object lock; deletion of expired events requires a documented Compliance Officer attestation event.

---

## 11. Storage Architecture

Phased model (consistent with existing infrastructure):

- **Phase A (current)**: append-only JSONL per stream, hash-chained, written via `appendAudit()` (existing). Generalize the writer to accept stream key.
- **Phase B**: WORM/object-locked storage (S3 Object Lock, Azure Immutable Blob, or equivalent) plus Postgres index for query.
- **Phase C**: cross-region replication and witness anchoring (§6).

No service writes audit data directly to its own database. The single writer is the audit pipeline (`server/audit/`).

---

## 12. Service Responsibilities

| Service | Audit responsibility |
|---------|----------------------|
| Identity / Access | Emits `authenticate`, `session_*`, `access_decision`, `role_assignment.*`, `access_policy.*` |
| Onboarding Engine | Emits `trigger.*`, `template.*`, `requirement.*`, `execution_unit.*`, `execution_batch.*`, `override.*`, `gate_evaluation.*` |
| CES | Emits `sprint.*`, `assignment.*`, `recurring.*`, `bundle.*` |
| Workflow Orchestrator | Emits `workflow.step.*`, `workflow.unit.*` |
| Evidence Service | Emits `evidence.captured`, `evidence.rejected`, `evidence.superseded` |
| eCIgn | Emits `signature.requested`, `signature.completed`, `signature.declined`, `envelope.*` |
| Policy Lifecycle | Emits `policy.author`, `policy.publish`, `policy.republish`, `policy.retire` |
| Vendor Mgmt | Emits `vendor.*`, `baa.*` |
| Governance | Emits `appointment.*`, `delegation.*`, `attestation.*` |
| QAPI / Incident | Emits `incident.*`, `qapi.*` |
| IT / Security | Emits `provisioning.*`, `access_review.*`, `risk_analysis.*` |
| Audit Mode | Emits `audit.replay`, `audit.export`, `audit.chain_verification.*` |

Every service consumes the **same writer**.

---

## 13. Event Schemas Are Versioned

- Each `event_type` has a JSON Schema stored in `server/audit/schemas/<event_type>.v<version>.json`.
- Schemas are versioned; old events validate against their original schema version (`event_version`).
- Adding fields → minor; removing/renaming → new major version.
- Replay tolerates older versions via schema migration adapters.

---

## 14. Idempotency

Audit writes are idempotent by `(stream, sequence)` and an optional `idempotency_key` per event_type (mirrors existing onboarding rules). Duplicate writes produce a single chain entry; conflicting writes raise `audit.write_conflict` (critical).

---

## 15. Read APIs

- `GET /api/audit/events?stream=&actor=&resource=&since=&until=&event_type=` — paginated.
- `GET /api/audit/events/:event_id` — single event.
- `POST /api/audit/verify-chain` — verify entire chain or a stream.
- `POST /api/audit/replay` — replay a stream `as_of` (read-only).
- `POST /api/audit/export` — produce signed dossier export (audited at `severity = high|critical`).

All audit reads are themselves access-controlled and audited (`audit:view`, `audit:export`, `audit:replay`).

---

## 16. UI Projections

The Audit Mode UI (existing) gains:

- **Per-actor activity timeline** (stream `user:<id>`).
- **Per-session trail** (stream `session:<id>`).
- **Per-resource history** (filter by `resource.type` + `resource.id`).
- **Access Decision Explorer** (denies, deny reasons, SoD violations).
- **PHI Access Lens** (phi_flag = true).
- **Chain Health** (verification results, anchor cadence).

---

## 17. Forbidden

- Service-local audit logs.
- Mutating events after write.
- Storing PHI in event payloads.
- Skipping audit on "internal" actions.
- Reading audit data without an `audit:view` decision.
- Exporting audit data without an `audit:export` decision and signed `DossierExport` request.
- Compressing/aggregating events in a way that loses individual event identity.

---

## 18. Migration from Current Audit Chain

- Existing `appendAudit()` continues to function; calls migrate to the generalized writer with `stream` parameter (default `batch:<batch_id>` for onboarding).
- New event types are added; existing event types are not renamed.
- Existing `verifyChain()` generalizes to per-stream verification.
- The audit reader API extends, not replaces, the current `/api/audit/*` routes.
