# 09 — Implementation Roadmap

Build order is dependency-driven. Each phase delivers a vertical slice that the next phase relies on.

---

## Phase A — Identity & Access Layer (IAL)
1. Types: `User`, `UserGroup`, `RoleAssignment`, `Permission`, `Scope`, `Decision`.
2. Permission catalog seed (Doc 01 §3).
3. `authorize()` service (deterministic decision).
4. Separation-of-Duties rule registry.
5. Override request/approve service (dual-signature, time-bound).
6. Lifecycle event emission to AEL stub.

**Exit criteria:** any backend handler can call `authorize(actor, action, resource, scope)` and receive a deterministic decision; every call emits `ACCESS_DECISION`.

---

## Phase B — CEU Core Model (EUL)
1. Types: `ExecutionUnit`, `CeuStateTransition`, `EvidenceRequirement/Artifact`, `SignatureRequirement/Record`, `PolicyVersionRef`.
2. CEU repository (in-memory + persistence interface).
3. CEU factory per source (onboarding, policy, calendar, ces, ecign, audit, manual).
4. Dependency graph utilities (cycle detection, propagation).
5. Bundle/parent-child semantics.

**Exit criteria:** CEUs can be created from any source through a single normalization API; dependency graph operations are correct and tested.

---

## Phase C — State Machine + Enforcement (EUL + ENF)
1. State graph and transition validator.
2. Gate evaluators: `field_clearance`, `billing_clearance`, `system_access_clearance`.
3. Block propagation engine.
4. SLA + AtRisk evaluation worker.
5. Escalation router (L1/L2/L3, SECURITY).
6. Override application service (consumes IAL override approvals).

**Exit criteria:** transitions are authorized + state-graph-valid + gate-checked; cascades and escalations are deterministic and re-runnable.

---

## Phase D — Audit Event Store (AEL)
1. `AuditEvent` schema + writer.
2. Append-only persistence (table with insert-only grants OR ND-JSON WORM file in dev) + integrity triggers.
3. Hash-chain implementation (canonical JSON, sha256, chainHash).
4. Synchronous-write contract for security-critical actions.
5. Verification job (`INTEGRITY_CHECK`) + `CHAIN_BROKEN_DETECTED` flow.
6. Replay engine into a separate verification store.

**Exit criteria:** every IAL/EUL/ENF action emits a chained event; verification job passes; replay reproduces current state.

---

## Phase E — HIPAA Controls
1. PHI tagging on resources + middleware that emits `PHI_VIEWED/EXPORTED/WRITE`.
2. Session control (idle timeout, max lifetime, revocation).
3. Step-up re-auth for high-sensitivity actions.
4. Envelope encryption helpers for PHI fields.
5. TLS posture check / outbound integration audit.
6. Breach-traceability query (per patient, per actor, per time).

**Exit criteria:** all five §164.312 sections have a named, exercised mechanism; mapping doc points to implementation.

---

## Phase F — CES Integration
1. Adapter wrapping existing [src/policy/compliance-execution](src/policy/compliance-execution) module.
2. Sprint = CEU bundle; sprint state derives from members.
3. Backfill existing sprint items into CEUs (one-time normalization with audit).

**Exit criteria:** CES UI continues to work, but is now a view over CEUs; no parallel task records remain.

---

## Phase G — UI Enforcement
1. `usePermissions()` hook.
2. `<Authorized />` component.
3. `<CeuCard />` primitive used everywhere a task is shown.
4. Audit/blocked/signature/override indicators standardized.
5. Auditor role: read-only chrome.

**Exit criteria:** no UI surface renders write controls without server-validated authorization; CEU presentation is uniform.

---

## Phase H — Audit Dashboards
1. Activity Timeline view.
2. PHI Access view.
3. CEU Health view.
4. Override Register view.
5. Failed Access view.
6. Integrity view.
7. Survey Readiness view (binds existing [src/policy/audit/surveyPacket.ts](src/policy/audit/surveyPacket.ts)).

**Exit criteria:** all dashboards log `REPORT_VIEWED`; exports emit `EXPORT_GENERATED` with chain root.

---

## Phase I — QA & Validation
1. Property tests for state machine (no invalid transitions reachable).
2. Property tests for hash chain (any mutation detected).
3. SoD test matrix (every constraint denies the prohibited combos).
4. PHI access enumeration test (every PHI route emits `PHI_*`).
5. Integration test: end-to-end CEU lifecycle including override.
6. Tabletop: simulated breach reconstruction; measured time-to-trace.

**Exit criteria:** CI gates these suites; defensibility memo references test ids.

---

## Cross-Cutting

- Telemetry: metrics on event throughput, chain verification duration, gate evaluation latency.
- Documentation kept in `Builder/Security-Execution-Audit/` as the source of truth.
- Any change to permission catalog, action codes, or state graph requires an ADR and a versioned migration event in the audit log (`CONFIG_CHANGED`).
