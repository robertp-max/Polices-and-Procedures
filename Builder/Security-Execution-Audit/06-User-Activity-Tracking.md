# 06 — User Activity Tracking

**Layer:** AEL (events) + analytics views.

---

## 1. Tracked Activities

### 1.1 Authentication
- `LOGIN_SUCCESS`, `LOGIN_FAILED` (with reason: bad_credentials, mfa_failed, locked, suspended)
- `MFA_CHALLENGED`, `MFA_PASSED`, `MFA_FAILED`
- `LOGOUT`, `SESSION_EXPIRED`, `SESSION_REVOKED`, `REAUTH_REQUIRED`, `REAUTH_SUCCESS`

### 1.2 Authorization
- `ACCESS_DECISION` for **every** server-side authorize call (allow + deny).
- `SOD_VIOLATION`

### 1.3 Resource Views
- `PHI_VIEWED` for any PHI-tagged read.
- `POLICY_VIEWED` (sampled OK if non-PHI; full for sensitive policies).
- `FORM_OPENED`
- `CEU_VIEWED` (sampled for list views, full for detail views).

### 1.4 CEU Interactions
- `CEU_CREATED`, `CEU_ASSIGNED`, `CEU_CLAIMED`, `CEU_STARTED`, `CEU_STATE_CHANGED`, `CEU_COMPLETED`, `CEU_FAILED`, `CEU_OVERRIDDEN`, `CEU_BLOCKED_ATTEMPT`.

### 1.5 Approvals
- `POLICY_APPROVED`, `EVIDENCE_VALIDATED`, `OVERRIDE_APPROVED`.

### 1.6 Signatures
- `SIGNATURE_REQUESTED`, `SIGNATURE_COLLECTED`, `SIGNATURE_DECLINED`, `SIGNATURE_BYPASS_ATTEMPT`.

### 1.7 Overrides
- `OVERRIDE_REQUESTED/APPROVED/DENIED/EXPIRED`, `CEU_OVERRIDDEN`.

### 1.8 Failed/Suspicious Access
- `LOGIN_FAILED`, `ACCESS_DECISION` (deny), `SOD_VIOLATION`, `SIGNATURE_BYPASS_ATTEMPT`, `CEU_BLOCKED_ATTEMPT`, `PHI_REDACTION_TRIGGERED`, `INTEGRITY_CHECK` mismatches.

---

## 2. High-Risk Event Flags

Events carry `context.riskFlags: string[]` when applicable:
- `phi_export`
- `bulk_phi_read` (≥ N PHI views in window)
- `after_hours` (outside business window for actor's branch)
- `unusual_geo` (geo deviation from actor's baseline)
- `repeated_denial` (≥3 denies in 24h same actor)
- `override_chain` (override approving an override-related target)
- `chain_anomaly` (integrity check finding)

Risk flags are computed at write time when cheap (after_hours, threshold counters) and post-hoc by analytics jobs (geo, baseline drift).

---

## 3. Anomaly Detection Hooks (future-ready)

The audit log is the **substrate**. Detection runs in a separate analytics pipeline:

```
audit_events --(stream)--> detector(s) --(emit)--> AuditEvent kind=ANOMALY_DETECTED
                                              \--> CEU (Compliance Investigation)
```

Initial heuristics:
- Spike detection on `PHI_VIEWED` per actor per hour.
- Rare-permission usage by actor (first-time `phi.export`).
- `LOGIN_FAILED` clustering per IP / per user.
- Off-hours `OVERRIDE_REQUESTED`.
- Same-actor cross-scope PHI access bursts.

Detector outputs are themselves audit events and create a `Compliance Investigation CEU` automatically.

---

## 4. Audit Dashboards

Read-only views for `Auditor` / `Compliance` / `Executive`:

| Dashboard | Contents |
|-----------|----------|
| **Activity Timeline** | Per-user chronological events, filterable by category and target. |
| **PHI Access** | All `PHI_*` events; filter by patient, actor, time. Export-ready. |
| **CEU Health** | Counts by state; AtRisk/Blocked/Failed leaderboards; bundle progress. |
| **Override Register** | All overrides with reasons, approvers, signatures, expirations. |
| **Failed Access** | `LOGIN_FAILED`, denies, SoD violations; per-user, per-IP. |
| **Integrity** | Latest chain verification, anomalies, gaps. |
| **Survey Readiness** | Bundles tied to CMS-mappable evidence (links to existing `surveyPacket`). |

Every dashboard load emits `REPORT_VIEWED`.

---

## 5. Sampling vs Full Logging

| Activity | Strategy |
|----------|----------|
| Mutations (writes) | **Always full**, synchronous. |
| PHI reads | **Always full**, synchronous. |
| Authorization decisions | **Always full**, asynchronous-safe (with at-least-once durability). |
| List/detail UI views (non-PHI) | Sampled (e.g., 10%) but always logged on first view per session per target. |
| Heartbeat / health checks | Not logged (out of scope). |

Sampling rate is config; **PHI sampling is never enabled**.

---

## 6. Operator Discipline

- No backdoor "admin tools" that bypass authorize.
- All ad-hoc operator actions use a `manual` source CEU with reason, then standard authorize/state/audit flow.
- Database access by operators is logged out-of-band (DB-level audit) and reconciled to the application audit chain weekly.
