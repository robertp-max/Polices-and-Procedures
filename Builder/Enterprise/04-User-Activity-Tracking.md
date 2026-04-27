# 04 — System-Wide User Activity Tracking

> **Status**: EXTENSION. Defines the activity tracking surface built on top of the global `AuditEvent` system (`03-Enterprise-Audit-Model.md`). No parallel logger. No service-local trackers.

---

## 1. Tracked Event Families

Every event listed below is an `AuditEvent` (canonical envelope §2 of doc 03). Severities and retention classes are pre-assigned.

### 1.1 Authentication & Session

| Event type | Severity | Notes |
|------------|----------|-------|
| `auth.authenticate.success` | notice | IdP subject + IAL + MFA flag |
| `auth.authenticate.failure` | warning | Reason code (bad_password, mfa_failed, account_locked) |
| `auth.mfa.challenge` | info | Method, channel |
| `auth.mfa.failure` | warning | Aggregated for anomaly hooks |
| `auth.step_up.required` | notice | Triggered by sensitive action |
| `auth.step_up.success` | notice | |
| `auth.step_up.failure` | warning | |
| `session.start` | notice | Stream `session:<id>` opens here |
| `session.end` | notice | Reason: logout, expired, force-revoked |
| `session.idle_timeout` | notice | |
| `session.revoked` | high | Admin or anomaly-driven |
| `account.locked` | high | After threshold of failures |
| `account.unlocked` | notice | Always actor-attributable |
| `password.changed` / `mfa.enrolled` / `mfa.removed` | notice/high | mfa.removed is high |

### 1.2 Authorization

| Event type | Severity |
|------------|----------|
| `access.decision.permit` | info (sampled) |
| `access.decision.deny` | warning |
| `access.decision.sod_violation` | high |
| `access.decision.indeterminate` | warning |
| `access.policy.changed` | high |
| `role_assignment.granted` / `.revoked` / `.expired` | high (granted/revoked), notice (expired) |
| `delegation.activated` / `.deactivated` | high |
| `impersonation.started` / `.ended` | high |

`access.decision.permit` is sampled (e.g., 1%) for `view`/`list`/`search` to control volume; **all denies, all SoD violations, all permits on `*:approve|sign|override|publish|export|phi_*` are persisted**.

### 1.3 PHI Access (CRITICAL)

| Event type | Severity | Notes |
|------------|----------|-------|
| `phi.access.view` | high | One per logical access; payload PHI-free |
| `phi.access.search` | high | Query intent + result count |
| `phi.access.export` | critical | Dual-sig required; recipient hint |
| `phi.access.print` | critical | If applicable |
| `phi.access.transmit` | critical | E-mail, fax, API recipient |
| `phi.access.denied` | high | Minimum-necessary or scope mismatch |
| `phi.bulk_query` | critical | Threshold: > N records in window |

Every PHI access carries:

```
payload: {
  purpose             : string,                 // closed-set: tx, payment, ops, patient_request, audit, ...
  legal_basis         : string,                 // closed-set
  minimum_necessary   : { fields_requested[], fields_returned[], assertion: true }
  data_classes        : string[],
  record_count        : int,
  patient_id_refs     : ULID[],                 // opaque IDs only
  retention_class     : "phi-access"
}
```

The audit pipeline rejects PHI access events that do not include the `minimum_necessary` block.

### 1.4 CEU Actions (every domain)

| Event type | Severity |
|------------|----------|
| `execution_unit.created` | info |
| `execution_unit.state_changed` | info / warning (Blocked/Failed) |
| `execution_unit.assigned` / `.reassigned` | info |
| `execution_unit.withdrawn` | warning |
| `execution_batch.created` | info |
| `execution_batch.state_changed` | info / warning |
| `execution_batch.completed` | notice |
| `execution_batch.attested` | high |

### 1.5 Approvals & Signatures

| Event type | Severity |
|------------|----------|
| `approval.requested` | info |
| `approval.granted` | high |
| `approval.rejected` | warning |
| `signature.requested` | info |
| `signature.completed` | high |
| `signature.declined` | warning |
| `signature.expired` | warning |
| `signature.tampered_detected` | critical |

All `approval.granted` / `signature.completed` events carry the `signature_ref` to the eCIgn `SignatureRecord`.

### 1.6 Overrides

| Event type | Severity |
|------------|----------|
| `override.requested` | high |
| `override.countersigned` | high |
| `override.granted` | high |
| `override.expired` | notice |
| `override.revoked` | high |
| `override.attempted_self` | critical | SoD violation: requestor == approver |

Override grants always require dual signatures; the granting event is emitted only after both `signature.completed` events bind to the request `event_hash`.

### 1.7 Failed Access Attempts & Anomalies

| Event type | Severity |
|------------|----------|
| `access.failed_attempt.threshold_exceeded` | high |
| `access.brute_force_suspected` | critical |
| `access.geographic_anomaly` | high |
| `access.impossible_travel` | critical |
| `access.new_device` | notice |
| `access.token_replay_detected` | critical |
| `access.privilege_escalation_attempt` | critical |
| `data.exfiltration_pattern` | critical |

These are emitted by the **anomaly detector** (§4) consuming the global stream.

### 1.8 Administrative & System

| Event type | Severity |
|------------|----------|
| `policy.access_bundle.changed` | high |
| `audit.chain_verification.passed` / `.failed` | notice / critical |
| `audit.export.requested` / `.completed` | high / high |
| `audit.replay.executed` | notice |
| `system.config.changed` | high |
| `system.service_principal.rotated` | high |

---

## 2. High-Risk Event Set

Treated specially: hard alerting, no sampling, retention `≥ 6 years`, escalation playbook attached.

```
phi.access.export, phi.access.transmit, phi.access.print, phi.bulk_query
override.granted, override.attempted_self
role_assignment.granted (elevated tier), impersonation.started
auth.brute_force_suspected, access.impossible_travel
audit.chain_verification.failed, signature.tampered_detected
access.privilege_escalation_attempt, data.exfiltration_pattern
```

UI: dedicated **High-Risk Activity** lens in Audit Mode. Per-day digest to Compliance Officer + Security Officer.

---

## 3. Audit Flags (per actor / per session / per resource)

A flag is a **derived marker** computed by projections; no mutation of underlying events.

| Flag | Trigger condition |
|------|-------------------|
| `actor.elevated_session` | Active elevated role at any moment in session |
| `actor.dual_sig_eligible` | Compliance Officer or Administrator |
| `actor.recent_high_risk` | ≥ 1 high-risk event in last 24h |
| `session.phi_touched` | Any `phi.access.*` event in stream |
| `session.export_performed` | Any `*.export` event in stream |
| `resource.under_legal_hold` | Legal hold active |
| `resource.override_active` | Active `OverrideRecord` |
| `resource.disputed` | Outstanding rejection / appeal |

Flags surface in the UI badges and gate downstream behavior (e.g., `session.export_performed` requires step-up before subsequent PHI access).

---

## 4. Anomaly Hooks

The anomaly detector subscribes to the global audit stream and emits new audit events when patterns match. Detectors are **declarative rules** evaluated on a sliding window.

Built-in rules (initial):

| Rule | Window | Threshold | Emits |
|------|--------|-----------|-------|
| Brute-force | 5 min | ≥ 10 `auth.authenticate.failure` for one user | `access.brute_force_suspected` |
| Geographic anomaly | 24 h | new country never seen for user | `access.geographic_anomaly` |
| Impossible travel | 1 h | distance/time impossible | `access.impossible_travel` |
| PHI bulk query | 10 min | record_count > 100 from one actor | `phi.bulk_query` |
| Privilege escalation attempt | 1 h | ≥ 3 `access.decision.deny` on `*:approve\|override` from one actor | `access.privilege_escalation_attempt` |
| Token replay | per-token | same `event_hash` of session token from multiple device fingerprints | `access.token_replay_detected` |
| Off-hours export | per actor | `*.export` outside business hours | `data.exfiltration_pattern` (warning escalates) |
| SoD attempt loop | 24 h | ≥ 3 `access.decision.sod_violation` from one actor | `access.privilege_escalation_attempt` |
| Chain anomaly | continuous | nightly verifier failure | `audit.chain_verification.failed` |

Rules are versioned, signed by Security Officer, and themselves audited (`policy.anomaly_rule.changed`).

Detector outputs feed:
- High-Risk Activity lens.
- On-call alerting (page).
- Optional auto-revoke session (`session.revoked` with reason `anomaly_auto_revoke`).

---

## 5. Per-Actor Activity Surface

`stream = user:<user_id>` projection answers, in one query:

- Logins / logouts / failures.
- Sessions list with duration, devices, IPs.
- Every CEU touched (created, transitioned, signed, withdrawn).
- Every approval / signature / override touched.
- Every PHI access event (with purpose + minimum_necessary metadata).
- Every access decision (permit + deny).
- Active flags.

Exposed under `/api/audit/users/:user_id/activity` — gated by `audit:view` and (for own activity) by `self_activity:view`.

---

## 6. Per-Session Surface

`stream = session:<session_id>` projection captures the entire session lifecycle:

- `session.start` (with auth context, device, IP, IAL, MFA).
- All events `correlation_id`-linked into the session.
- Step-up challenges and outcomes.
- Final `session.end` with reason and duration.

Auditors can replay a session as a chronological filmstrip.

---

## 7. Per-Resource Surface

`stream` filtered by `resource.type + resource.id` answers:

- Full lifecycle of a CEU, batch, vendor, policy, appointment, evidence object.
- All actors who touched it.
- All decisions involving it.
- All signatures bound to it.

Exposed under `/api/audit/resources/:type/:id`.

---

## 8. PHI Access Lens

A first-class lens (`phi_flag = true` filter) with these queries:

- "Show all PHI access for `patient_id` in `[from..to]`" — the **accounting of disclosures** view (HIPAA §164.528).
- "Show all PHI access by `user_id` in `[from..to]`".
- "Show bulk PHI events in `[from..to]`".
- "Show off-hours PHI export attempts."

This lens is the operational surface for PHI compliance reporting (see `05-HIPAA-System-Mapping.md` §3).

---

## 9. Sampling Policy

- `info` events of type `view`/`list`/`search` (non-PHI) sampled at 1% by default; configurable per resource.
- All `phi.access.*`, `*:approve`, `*:sign`, `override.*`, `*.export`, `access.decision.deny`, SoD events: **never sampled**.
- Sampling rate changes are themselves audited (`policy.access_bundle.changed`).

---

## 10. Telemetry vs Audit (no overlap)

- **Telemetry** (operational metrics, traces, performance) lives in OpenTelemetry / metrics infra — **not** in the audit chain.
- **Audit** is for who/what/when/decision/integrity — never for performance noise.
- The two systems share `correlation_id` / `trace_id` for cross-walking but are stored separately.

---

## 11. Notifications & Dashboards

- Compliance Officer dashboard: high-risk events of last 7 days, denies trend, override ledger, PHI access summary.
- Security Officer dashboard: anomaly detector outputs, chain health, account safety.
- Per-user notifications:
  - "Your session was opened from a new device."
  - "Your account is locked due to repeated failures."
  - "An elevated role was granted to your account by {actor} valid until {ts}."

Notifications are themselves audited.

---

## 12. Privacy of Activity Tracking

- Tracking is **operational logging for compliance**, not behavioral surveillance; productivity profiling is forbidden.
- IP addresses are truncated where policy applies; geo is coarse only.
- User-agent strings are normalized (browser family + OS only) for analytics; raw UA is retained on the audit event.
- Actor activity surfaced to the actor themselves under "My Activity" so users have a view of their own footprint.

---

## 13. Forbidden

- Building a separate "activity log" outside the audit chain.
- Storing PHI in any tracking record.
- Suppressing denies or SoD events from the audit stream.
- Anonymizing actor identity in audit events (de-identified analytics may exist alongside, never instead of).
- Using audit events for marketing, productivity scoring, or non-compliance purposes.
