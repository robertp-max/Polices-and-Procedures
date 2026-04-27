# 06 — System Alignment with Existing Architecture

> **Status**: EXTENSION map. This document specifies **exactly how** the new enterprise layers (`01–05`) attach to the existing systems **without redesigning** them.
>
> **Mandate**: Do NOT redesign existing flows. Only extend.

---

## 1. Existing Systems (Untouched in Semantics)

| System | Authoritative spec | What stays exactly as-is |
|--------|--------------------|--------------------------|
| Onboarding Engine | `Builder/Onboarding/03-Onboarding-Execution-Engine.md`, `Builder/Onboarding/System/00-Onboarding-Execution-Architecture.md` | Trigger intake, profile resolution, requirement resolution, batch generation, workflow orchestration, gate evaluation, closure. |
| CES (Sprint Board) | `Builder/Compliance-Execution-Sprints/*` | Sprint structure, assignment model, work bundling, calendar integration, recurring execution, enforcement, metrics. |
| Policy Lifecycle | Existing policy library + `Builder/Policies/*` + republish flow | Versioning, hashing, republish trigger model. |
| eCIgn | `Builder/eCIgn/*` | Envelope creation, single/multi-signer flows, watermark + hash, decline/expiry, multi-sig sequencing. |
| Compliance Calendar | Calendar integration in CES | Entry creation, expiry windows, escalations. |
| Audit Mode | Existing audit chain + UI | Per-subject dossier, surveyor quick answers, signed export. |
| Server (`server/*`) | `server/index.ts`, `server/routes/*`, `server/ecign/*` | Existing endpoints unchanged in semantics. |

The new layers **wrap** these systems via the PDP/PEP, the global audit writer, the CEU generalization, and activity tracking.

---

## 2. Attachment Points

### 2.1 Onboarding Engine ← Enterprise Layers

| Attachment | What it adds |
|------------|--------------|
| Authorization | Every engine handler calls PDP; service principal `system_service.onboarding_engine` augmented with originating user context. |
| CEU rename | `OnboardingExecutionUnit` is the same row, surfaced as `ExecutionUnit (CEU)` with `domain = onboarding`. APIs gain CEU views; existing onboarding APIs preserved. |
| Audit | Every engine event uses the **generalized writer** with `stream = batch:<batch_id>` (existing scheme) plus parallel projection to `subject:<subject_id>` and `user:<actor_id>` streams (read-only projections, single canonical write). |
| Activity | `execution_unit.*`, `execution_batch.*`, `override.*`, `gate_evaluation.*`, `signature.*`, `evidence.*` events become first-class items in the activity surface. |

No engine logic is changed.

### 2.2 CES ← Enterprise Layers

| Attachment | What it adds |
|------------|--------------|
| Authorization | Sprint board, assignment, calendar mutations all PDP-checked. |
| CEU domain expansion | Sprint board renders CEUs of any domain (filterable). Bundles are domain-tagged. |
| Activity | Assignment/reassignment, sprint planning, retrospective sign-offs audited. |
| Anomaly hooks | "Repeated reassignments to same actor" or "recurring CEUs disabled" patterns flagged. |

CES rules and visuals unchanged.

### 2.3 Policy Lifecycle ← Enterprise Layers

| Attachment | What it adds |
|------------|--------------|
| Authorization | `policy:author` / `policy:publish` PDP-checked; SoD enforces author ≠ publisher. |
| CEU | Policy lifecycle steps become `policy.author` / `policy.publish` CEUs. Republish remains the trigger that cascades `policy.reack` CEUs. |
| Audit | `policy.author/publish/republish/retire` events with version + content hash. |
| Help Center binding | Article validator (existing) cross-checks new permission bundles. |

Republish behavior unchanged in mechanics.

### 2.4 eCIgn ← Enterprise Layers

| Attachment | What it adds |
|------------|--------------|
| Authorization | `signature:request` / `signature:sign` / `signature:countersign` PDP-checked; SoD ensures requestor ≠ signer for SoD-bound flows. |
| CEU | Signature flows are already CEU steps; no model change. |
| Audit | eCIgn already writes to the chain; the writer call becomes the **generalized** writer with `stream = ceu:<ceu_id>` for envelope events, anchored to the parent batch stream via `causation_id`. |
| Multi-sig | Override grants and elevated `RoleAssignment`s reuse the existing multi-sig flow; no changes to envelope format. |

### 2.5 Compliance Calendar ← Enterprise Layers

| Attachment | What it adds |
|------------|--------------|
| Authorization | Read = `calendar:view`; create/move = `calendar:create/update`; CEU-derived entries are system-managed. |
| Domain expansion | Recurring CEUs from all domains drive entries (training, vendor revalidation, IT access review, QAPI review, governance attestations). |
| Activity | Entry creations / completions audited. |

Calendar engine unchanged.

### 2.6 Audit Mode ← Enterprise Layers

| Attachment | What it adds |
|------------|--------------|
| Authorization | All audit reads PDP-checked. |
| New lenses | Per-actor, per-session, per-resource, PHI Access, High-Risk Activity, Access Decision Explorer, Chain Health. |
| Replay | Generalized to per-stream replay; existing per-batch replay preserved. |
| Export | Dossier export now includes Activity sections; export emits `audit.export.completed` (high). |

Existing dossier and surveyor quick answers preserved.

### 2.7 `server/` ← Enterprise Layers

Concrete code attachments (executed in Phase 7):

```
server/access/             ← new
  pdp.ts                   ← Policy Decision Point (pure)
  pep.ts                   ← Express middleware (PEP)
  bundles.ts               ← Permission bundle data + loader
  sod.ts                   ← Separation-of-duties rules
  attributes.ts            ← ABAC predicates
  index.ts                 ← public API

server/audit/              ← new
  writer.ts                ← Generalized appendAudit(stream, event)
  schemas/                 ← per-event_type JSON Schemas
  anomaly.ts               ← rule engine over the stream
  projections.ts           ← per-actor/per-session/per-resource/PHI lens
  routes.ts                ← new audit read routes (extends existing)

server/ceu/                ← new
  types.ts                 ← Global CEU type
  registry.ts              ← Domain extensions
  routes.ts                ← Cross-domain CEU read API

server/identity/           ← new
  session.ts               ← Session model + lifecycle
  middleware.ts            ← attaches actor + session to req

server/index.ts            ← extend mounting (mount session middleware first, then PEP, then existing routers)
```

Existing `server/ecign/store.ts` `appendAudit()` is wrapped (not removed). Existing `verifyChain()` stays; the new chain verifier iterates streams.

---

## 3. Data Migration

| From | To | Strategy |
|------|----|----------|
| `OnboardingExecutionUnit` rows | `ExecutionUnit` view | View on existing rows; `domain='onboarding'` injected; IDs preserved. |
| `OnboardingExecutionBatch` rows | `ExecutionBatch` view | Same. |
| Existing audit JSONL files | New `stream`-aware writer | Existing records read with `stream='batch:<batch_id>'` inferred; chain verification continues. |
| Hardcoded role checks (if any) | PDP calls | Identified in Phase 7 audit pass; replaced with `requirePermission()` decorators / middleware. |
| Implicit session usage | Explicit `session_id` propagation | Session middleware created; existing handlers receive `req.session`; `correlation_id` derived from request. |

No destructive migrations. No drop tables. No format changes to existing artifacts.

---

## 4. Event Bus Extension

The existing event semantics (canonical envelope, idempotency, hash chain) are reused. Generalized writer accepts:

```ts
appendAudit({
  stream: string,                  // explicit; default rule per service
  event_type, event_version,
  actor, action, resource,
  decision?, decision_reason?, authz_policy_ver?,
  before?, after?,
  correlation_id, causation_id?, session_id?, request_id?,
  environment,
  severity, phi_flag, pii_flag, retention_class,
  signature_ref?, evidence_refs?, policy_refs?,
  payload, schema_version,
})
```

The existing `appendAudit()` becomes a thin shim that calls the new writer with `stream = 'batch:' + payload.batch_id` when the caller passes a batch-bound payload.

---

## 5. UI Alignment

- Sprint Board: filter chip for **Domain** (All / Onboarding / QAPI / Vendor / Policy / Incident / Training / IT / Governance / Clinical).
- Onboarding Dashboard: unchanged layout; KPIs gain "PHI High-Risk events (period)" and "Access Denies (period)" tiles, surfaced only to CO/SO.
- Audit Mode: new lenses (per §2.6).
- Help Center: `02-Knowledge-Base-Architecture.md` (onboarding/Documentation) gains links to enterprise docs under **Developer Reference**; no new top-level categories.
- All surfaces: PEP-driven action visibility; disabled actions render with reason on hover (Compliance Officer only sees raw reason; others see remediation hint).

No surface is restructured beyond filter/lens additions.

---

## 6. API Surface Additions (read-side)

Backward-compatible additions only; **no existing routes are removed**:

```
GET    /api/audit/events?stream=&actor=&resource=&since=&until=&event_type=&severity=&phi_flag=
GET    /api/audit/events/:event_id
POST   /api/audit/verify-chain                      // optional ?stream=
POST   /api/audit/replay                            // body: { stream, as_of }
POST   /api/audit/export                            // body: { scope, format, recipient_hint }; requires step-up
GET    /api/audit/users/:user_id/activity
GET    /api/audit/sessions/:session_id
GET    /api/audit/resources/:type/:id
GET    /api/audit/phi-access?patient_id=&from=&to=

GET    /api/ceu?domain=&status=&assignee=&since=&until=
GET    /api/ceu/:ceu_id
GET    /api/ceu/batches?domain=&status=
GET    /api/ceu/batches/:batch_id

GET    /api/access/policy
GET    /api/access/role-assignments?user_id=
GET    /api/access/decision/preview                  // dry-run; debugging only; CO/Admin
```

All new routes are PEP-protected.

---

## 7. Compliance Calendar Behavior

Existing calendar continues to write entries from CES recurring rules. New domains (training, vendor revalidation, IT access review, QAPI review, governance attestation, risk analysis) emit recurring CEUs that flow into the same calendar engine. No new calendar primitive.

---

## 8. eCIgn Behavior

eCIgn unchanged. New consumers:

- `RoleAssignment` (elevated grants).
- `ExecutionBatch.attestation_required = true` cases across new domains.
- `OverrideRecord` countersigning (already supported).
- `policy.publish` dual-sig where required.
- Bulk PHI export approval.

All of these reuse single/multi-signer envelope formats from `Builder/eCIgn/02-Signature-Workflow.md` and `Builder/eCIgn/09-Multi-Signature-Flow.md`.

---

## 9. CES Behavior

CES is unchanged. New domains' CEUs route through the same:

- Sprint Board (filterable by domain).
- Assignment Model.
- Recurring Execution.
- Sprint planning & retrospectives.

Onboarding bundles continue to surface exactly as before.

---

## 10. Audit Mode Behavior

Audit Mode dossier projection extends to consume the per-subject stream (`subject:<id>`) plus the new activity / PHI / chain-health lenses. Surveyor Quick Answers behavior is preserved; the dossier export now includes an "Activity & Access" section if the requester has `audit:export` and the request is signed.

---

## 11. Cross-Cutting Non-Negotiables (recap)

- **Single PDP.** No service does its own role checks.
- **Single audit writer.** No service writes its own log.
- **Single CEU primitive.** No parallel task systems.
- **No mutable artifacts.** Append-only, hashed, content-addressed.
- **No PHI in events.** `minimum_necessary` enforced at the boundary.
- **All overrides dual-signed and bounded.**
- **All elevated role grants signed and bounded.**
- **All sensitive actions require step-up.**

---

## 12. Implementation Order (handoff to Phase 7)

1. `server/audit/writer.ts` (generalized) + extend `server/ecign/store.ts` shim.
2. `server/identity/session.ts` + `server/identity/middleware.ts` (request-scoped `actor` + `session_id` + `correlation_id` + `request_id`).
3. `server/access/` (PDP + PEP + bundles + SoD + attributes).
4. Mount PEP on existing routes with declared permissions.
5. `server/ceu/` (types + registry + routes).
6. `server/audit/anomaly.ts` (rule engine; minimal initial rules).
7. `server/audit/projections.ts` + new audit read routes.
8. UI: Sprint Board domain filter; Audit Mode new lenses (read-only at first).
9. Onboarding Engine handlers updated to use generalized writer (no semantic change).
10. Verify: existing onboarding chain integrity and existing flows pass regression.

---

## 13. Blockers / Open Questions (deferred)

- Choice of WORM/object-locked storage backend (S3 Object Lock vs Azure Immutable Blob vs on-prem).
- Anomaly rule tuning thresholds (calibrated post-deployment).
- Bulk PHI export delivery mechanism (encrypted SFTP vs portal pickup).
- Identity provider details (which IdP, IAL levels mapping).
- Database choice for projections (existing JSONL is fine for Phase A; Phase B may add Postgres).

These do not block Phase 7 implementation of the layers above.
