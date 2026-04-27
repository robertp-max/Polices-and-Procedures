# 00 — Security, Execution & Audit Architecture

**Status:** Authoritative
**Owner:** Security Architecture / Compliance Engineering
**Scope:** All work, all users, all systems inside the Care Indeed Home Health platform.

---

## 1. Purpose

Define a single, defensible architecture covering:

1. **Identity & Access** — who is allowed to do what.
2. **Execution Units (CEUs)** — the only object representing work.
3. **Audit/Event Trail** — append-only, hash-chained, replayable.
4. **Enforcement** — gates, blocks, escalations.
5. **Integration** — how every existing subsystem (Onboarding, CES, Policy Lifecycle, eCIgn, Calendar, Audit Mode) plugs in.

This architecture is the contract every other module conforms to. Subsystems do **not** invent their own task objects, log formats, or permission checks.

---

## 2. System Layers

### 2.1 Identity & Access Layer (IAL)
- `User`, `UserGroup`, `RoleAssignment`, `Permission`, `Scope`.
- Resolves "can actor X perform action A on resource R within scope S?"
- Enforces least privilege and separation of duties.
- Source of truth for **who** an actor is at the moment of action.

### 2.2 Execution Unit Layer (EUL)
- `ExecutionUnit` (CEU) is the **only** unit of work.
- Every onboarding step, policy approval, signature task, audit follow-up, calendar-driven event, and remediation item materializes as a CEU.
- CEUs carry: assignment, required roles, evidence, signatures, dependencies, SLA, state.

### 2.3 Audit / Event Layer (AEL)
- Append-only event log (`AuditEvent`).
- Hash-chained for tamper evidence.
- Every state change in IAL/EUL/Enforcement/Integration emits an event.
- Replayable: state at time T can be reconstructed from events ≤ T.

### 2.4 Enforcement Layer (ENF)
- Evaluates clearance gates: `field_clearance`, `billing_clearance`, `system_access_clearance`.
- Blocks dependent CEUs when prerequisites fail.
- Escalates on SLA breach, repeated failure, or override request.
- Drives dual-signature workflows for overrides.

### 2.5 Integration Layer (INT)
- Adapters for: Onboarding Engine, CES (Compliance Execution Sprints), Policy Lifecycle, eCIgn, Google Calendar / scheduled events, Audit Mode (survey readiness).
- All inbound work is normalized into CEUs.
- All outbound state changes flow through AEL.

---

## 3. End-to-End Flow

```
User Action
   │
   ▼
Identity & Access (authN context + authZ check)
   │ (deny → AuditEvent: ACCESS_DENIED, stop)
   ▼
Execution Unit (CEU lookup / create / mutate)
   │
   ▼
State Change (state machine transition)
   │
   ▼
Event Emitted (AuditEvent appended, hash-chained)
   │
   ▼
Enforcement Evaluated (gates, blocks, escalations)
   │
   ▼
Integration Fan-out (CES board, Onboarding, eCIgn, Calendar, Audit Mode)
```

Rules:
- **No state change without a CEU.**
- **No CEU mutation without an AuditEvent.**
- **No AuditEvent without an authenticated actor (or explicit `system` actor with reason).**
- **No silent denials.** Denials are logged events.

---

## 4. Trust Boundaries & PHI Handling Zones

| Zone | Contents | Trust | PHI Allowed |
|------|----------|-------|-------------|
| Z0 — Public UI shell | Marketing, login | Untrusted | No |
| Z1 — Authenticated UI | Dashboards, CEU views | Authenticated user | Minimum necessary |
| Z2 — Service core | IAL, EUL, ENF, AEL services | Server-side | Yes (need-to-know) |
| Z3 — Audit store | Append-only event log | Server-side, write-only API for app | Hashed/structured PHI markers only |
| Z4 — External adapters | eCIgn, Google Calendar, Hubstaff | Partner-trusted | Only what is contractually required |

**PHI handling rules**
- PHI fields in CEUs are tagged `phi: true` and access-logged on read.
- UI defaults to redact unless the role+scope has an explicit `phi.read` permission.
- Audit events store **references** to PHI records (id + hash) rather than raw payloads where possible.
- Cross-zone calls require a signed actor context (session id + user id + scope).

---

## 5. Cross-Cutting Invariants

1. **Single work model:** CEU. No checklists, no ad-hoc tasks, no UI-only state.
2. **Single event model:** AuditEvent. No subsystem-private logs for compliance-relevant actions.
3. **Single authorization model:** IAL. No subsystem-private "can do X" booleans.
4. **Append-only audit.** Edits and deletes are themselves events that reference the prior event by hash.
5. **Deterministic replay.** Given the event log, the system state is reproducible.
6. **Defensibility.** Every gate, denial, override, and signature is traceable to an actor, time, and reason.

---

## 6. Document Map

| # | Document | Concern |
|---|----------|---------|
| 00 | Architecture (this doc) | Layers, flow, invariants |
| 01 | User Groups & Access Control | IAL |
| 02 | Execution Unit System | EUL |
| 03 | Execution State & Enforcement | EUL state machine + ENF |
| 04 | Audit Trail Architecture | AEL |
| 05 | HIPAA Compliance Controls | Regulatory mapping |
| 06 | User Activity Tracking | Telemetry & anomaly hooks |
| 07 | System Integration | INT adapters |
| 08 | UI/UX Security & Tasking | Z1 surface |
| 09 | Implementation Roadmap | Build order |
