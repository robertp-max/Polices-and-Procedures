# Audit Mode — Compliance Reference

**Article:** 03-Compliance  
**Page:** Audit Mode (`/audit`)

---

## Compliance Purpose

Audit Mode exists to satisfy the surveyor's expectation of **immediate, organized access** to compliance documentation. CMS survey protocols require agencies to produce requested records promptly. Audit Mode provides the structured access layer to accomplish this.

---

## What Compliance Requirements This Page Supports

| Regulatory Standard | Requirement | Audit Mode Role |
|---|---|---|
| 42 CFR §488.301 | Records must be available to surveyors on request | All event evidence retrievable |
| CMS Survey & Certification Guidance | Agency must demonstrate ongoing compliance | Compliance state view with audit states |
| CMS CoP §484.115 | Governing body records must be maintained | GB meeting events, evidence, minutes |
| HIPAA §164.312(b) | Audit controls — must be able to demonstrate access log | Enforcement log accessible |
| State licensure | Annual compliance documentation | All domains accessible |

---

## What Must Be Completed for Audit Mode to Show Healthy State

For each compliance event to show `audit_ready` or `certified_locked` in Audit Mode:
1. All steps completed
2. Evidence uploaded and accepted
3. Approval granted by authorized approver
4. Event certified by an Administrator

---

## What Is Logged

| Action | Audit Code | Notes |
|---|---|---|
| Audit Mode enabled | `AUDIT_MODE_ENABLED` | Actor, timestamp |
| Audit Mode disabled | `AUDIT_MODE_DISABLED` | Actor, timestamp |
| Audit export generated | `AUDIT_EXPORT` | Format, scope, actor, timestamp |
| Event record viewed | Not logged individually (read-only view) | — |

---

## Audit State Machine Reference

The 9-state audit state machine (`src/policy/audit/auditState.ts`) classifies each event:

| State | SLA Thresholds | Survey Impact |
|---|---|---|
| `audit_ready` | On track | No concern |
| `sla_warning` | ≤ 7 days remaining | Minor concern |
| `sla_urgent` | ≤ 3 days remaining | Significant concern |
| `grace_period` | 1–3 days past due | Deficiency likely |
| `overdue` | > 3 days past due | Deficiency certain |
| `blocked` | Any duration | Investigation triggered |
| `certified_locked` | N/A — complete | No concern |

**SLA constants (from `auditState.ts`):**
- `SLA_WARNING_DAYS = 7`
- `SLA_URGENT_DAYS = 3`
- `SLA_GRACE_DAYS = 3`

---

## Audit Traceability Matrix

When a surveyor asks about a specific compliance area, use this matrix:

| Surveyor Question | Navigate To | Key IDs |
|---|---|---|
| "Show me your governing body minutes" | `/audit` → filter by GV domain → event → evidence | `governing_body_meeting-{date}-01`, `GV-GB-001` |
| "Show me your QAPI program documentation" | `/audit` → filter by QA domain | `qapi_review-{date}-01`, `QA-QI-001` |
| "Show me staff training records" | `/evidence` → filter by kind=`training_record` | `event_id`, `HR-OT-001` |
| "Show me incident reviews" | `/audit` → filter by RM domain | `incident_review-{date}-01` |
| "Show me policy review evidence" | `/audit` → filter by `policy_review_cycle` events | `policy_review_cycle-{date}-01` |

---

## Hash Chain Verification

The audit system uses SHA-256 hash chaining to ensure records cannot be altered. To verify the integrity of the audit chain:
1. Navigate to `/admin/permissions` (requires `super_admin` role)
2. Use the audit verification tool
3. Or call `POST /api/audit/verify-chain` directly
4. A `valid` result confirms no records have been tampered with
