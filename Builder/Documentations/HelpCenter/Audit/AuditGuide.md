# Audit Guide

**Audience:** Auditors, Compliance Officers, Legal, IT Security  
**Scope:** Retrieving audit records, verifying chain integrity, tracing events, understanding audit immutability

---

## Table of Contents

1. [Audit Architecture Overview](#1-audit-architecture-overview)
2. [Audit Log Entry Structure](#2-audit-log-entry-structure)
3. [Hash Chain Verification](#3-hash-chain-verification)
4. [Retrieving Audit Events](#4-retrieving-audit-events)
5. [Tracing by Event, Policy, and Workflow ID](#5-tracing-by-event-policy-and-workflow-id)
6. [CRITICAL Action Tracking](#6-critical-action-tracking)
7. [Evidence Chain Retrieval](#7-evidence-chain-retrieval)
8. [eCIgn Signature Audit Trail](#8-ecign-signature-audit-trail)
9. [Audit FSM States Reference](#9-audit-fsm-states-reference)
10. [Risk Scoring Model](#10-risk-scoring-model)
11. [Compliance with HIPAA Audit Requirements](#11-compliance-with-hipaa-audit-requirements)

---

## 1. Audit Architecture Overview

The system uses two parallel audit layers:

### Layer 1: Client-Side Append-Only Audit Log (enforcementStore)

- Lives in `src/policy/stores/enforcementStore.ts`
- Maintained in the browser via Zustand + localStorage
- Append-only: entries cannot be updated or deleted
- Hash-chained: each entry contains `prevHash` pointing to the previous entry's hash
- Records all UI-level events: step completions, form opens, evidence uploads, policy transitions

### Layer 2: Server-Side DynamoDB Audit Log

- Lives in `server/audit/writer.ts`
- Writes to DynamoDB (production) or SQLite (local dev)
- Append-only table (no update or delete operations in server code)
- Receives CRITICAL events synchronously from server route handlers
- Receives eCIgn hash chain entries from `server/ecign/hashChain.ts`

**Both layers are queryable independently.** The DynamoDB layer is authoritative for legal/regulatory purposes. The client layer supplements with fine-grained UI-level events.

---

## 2. Audit Log Entry Structure

```typescript
interface AuditLogEntry {
  id: string;            // UUID of this audit entry
  sequence: number;      // Monotonic sequence number (never reused)
  action: string;        // Action code (e.g., "ECIGN_SIGN", "POLICY_PUBLISHED")
  actor: string;         // User ID of the person who triggered the action
  actorName: string;     // User's display name at time of action
  actorRole: string;     // User's role at time of action
  entityType: string;    // "compliance_event" | "policy" | "form_instance" | "evidence"
  entityId: string;      // The ID of the entity affected
  event_id?: string;     // Compliance event ID (if applicable)
  workflow_id?: string;  // Workflow ID (if applicable)
  policy_id?: string;    // Policy ID (if applicable)
  timestamp: string;     // ISO 8601 UTC datetime
  hash: string;          // SHA-256 of this entry + prevHash
  prevHash: string;      // SHA-256 of previous entry (GENESIS_HASH for first)
  category: "CRITICAL" | "STANDARD" | "INFO";
  payload: object;       // Action-specific metadata
}
```

**GENESIS_HASH** (the root of the chain):
```
"0000000000000000000000000000000000000000000000000000000000000000"
```

---

## 3. Hash Chain Verification

### How Hashing Works

Each audit entry's hash is computed as:

```
hash = SHA-256(prevHash + canonicalJSON(entry))
```

Where `canonicalJSON` produces a deterministic, sorted JSON string — identical inputs always produce identical JSON.

### Verifying the Chain

To verify integrity:

1. Retrieve all audit entries for an entity, ordered by `sequence` ascending
2. For the first entry: confirm `prevHash === GENESIS_HASH`
3. For each subsequent entry: recompute `expectedHash = SHA-256(entry[n-1].hash + canonicalJSON(entry[n]))` and compare to `entry[n].hash`
4. If all entries match: chain is valid
5. If any entry does not match: chain was tampered at that sequence number

### Verifying via the API

```http
POST /api/audit/verify-chain
Authorization: Bearer {token}
Content-Type: application/json

{
  "entityType": "compliance_event",
  "entityId": "governing_body_meeting-20260514-01"
}
```

**Valid response:**
```json
{
  "entityId": "governing_body_meeting-20260514-01",
  "chainLength": 23,
  "isValid": true,
  "firstEvent": "2026-05-01T00:00:00Z",
  "lastEvent": "2026-05-14T15:30:00Z"
}
```

**Tampered response:**
```json
{
  "isValid": false,
  "brokenAt": {
    "sequence": 17,
    "expectedPrevHash": "4fa3b...",
    "actualPrevHash": "0000..."
  }
}
```

> **A broken chain is a compliance incident.** Document the finding immediately, escalate to legal and IT Security, and preserve all evidence of the break without further modification.

---

## 4. Retrieving Audit Events

### Via API

```http
GET /api/audit/events?event_id=governing_body_meeting-20260514-01&limit=100
Authorization: Bearer {token}
```

Full query parameter reference: see [Audit-API.md](../APIs/Audit-API.md)

### Via Audit Mode UI

1. Navigate to **Audit Mode** in the sidebar
2. Click **Audit Event Log**
3. Use the filter panel to narrow by:
   - Date range
   - Actor (user ID or name)
   - Action code
   - Category (CRITICAL / STANDARD / INFO)
   - Entity type and ID
4. Export as CSV if required for external review

---

## 5. Tracing by Event, Policy, and Workflow ID

### Tracing a Compliance Event

To trace everything that happened to a specific compliance event:

```
GET /api/audit/events?event_id=governing_body_meeting-20260514-01
```

This returns all audit entries that reference this event — including step completions, evidence uploads, approvals, certifications, and any overrides.

### Tracing a Policy

```
GET /api/audit/events?policy_id=GV-GB-001
```

Returns the complete policy audit trail: creation, draft transitions, review approvals, publication, and any archival.

### Tracing a Workflow

```
GET /api/audit/events?workflow_id=GV-GB-001-WF
```

Returns all audit entries tied to executions of the governing body meeting workflow.

### Tracing by Actor

```
GET /api/audit/events?actor=user-id&from=2026-01-01T00:00:00Z&to=2026-12-31T23:59:59Z
```

Returns all actions taken by a specific user in the given date range.

---

## 6. CRITICAL Action Tracking

The following action codes are classified as `CRITICAL` and are stored synchronously with guaranteed persistence:

| Action Code | Description |
|---|---|
| `LOGIN` | User session started |
| `LOGOUT` | User session ended |
| `LOGIN_FAILED` | Failed login attempt |
| `PHI_ACCESS` | Patient Health Information accessed |
| `ECIGN_SIGN` | Electronic signature applied |
| `ECIGN_VOID` | Form instance voided |
| `POLICY_PUBLISHED` | Policy published to active status |
| `POLICY_ARCHIVED` | Policy archived |
| `EVENT_CERTIFIED` | Compliance event certified and locked |
| `OVERRIDE_BLOCK` | System block manually overridden |
| `ROLE_CHANGED` | User role changed by administrator |
| `ACCOUNT_DEACTIVATED` | User account deactivated |

**CRITICAL entries are:**
- Written synchronously (before the HTTP response returns)
- Cannot be batched or deferred
- Stored in both client and server audit layers

---

## 7. Evidence Chain Retrieval

To retrieve the complete audit trail for a specific evidence document:

```
GET /api/audit/events?entityType=evidence&entityId={doc_id}
```

This shows:
- `EVIDENCE_UPLOAD` — who uploaded it, when, from what IP
- `EVIDENCE_ACCEPTED` or `EVIDENCE_REJECTED` — who reviewed it, when
- Any subsequent re-upload if rejected

**Evidence lifecycle states (audit perspective):**

| State | Final? | Notes |
|---|---|---|
| `staged` | No | Prepared but not yet submitted |
| `submitted` | No | Pending review |
| `accepted` | **Yes** | Immutable — no further state changes possible |
| `rejected` | No | Can be replaced by re-upload |

---

## 8. eCIgn Signature Audit Trail

The eCIgn system maintains its own hash chain (`server/ecign/hashChain.ts`) that is separate from and in addition to the general audit log.

### Retrieving Signature Records

```http
GET /api/ecign/instances/{instanceId}
Authorization: Bearer {token}
```

The response includes `signatures[]`, each containing:
- `signerUserId` — who signed
- `signerName` — display name at time of signing
- `signerRole` — role at time of signing
- `signedAt` — UTC timestamp
- `documentHash` — SHA-256 of the document content at signing time
- `stage` — signature stage (1 = first signer, 2 = second signer)

### Verifying Signature Integrity

1. Retrieve the instance: `GET /api/ecign/instances/{instanceId}`
2. Note the `documentHash` for each signature stage
3. Recompute `sha256(documentContent)` independently
4. Compare — if they match, the document has not been altered since signing
5. Check the audit log for `ECIGN_SIGN` entries to confirm the chain of custody

---

## 9. Audit FSM States Reference

Each compliance event progresses through an audit state machine defined in `src/policy/audit/auditState.ts`.

| State | Description | SLA |
|---|---|---|
| `scheduled` | Event scheduled, work not yet started | N/A |
| `in_progress` | Steps are being completed | N/A |
| `sla_warning` | Event due within 7 days | SLA_WARNING_DAYS = 7 |
| `sla_urgent` | Event due within 3 days | SLA_URGENT_DAYS = 3 |
| `overdue` | Event past due date, not certified | Past due |
| `blocked` | Cannot proceed due to unmet dependency | N/A |
| `certified_locked` | Certified complete — no further changes | N/A |
| `grace_period` | Post-overdue certification window (3 days) | SLA_GRACE_DAYS = 3 |
| `audit_ready` | Ready for auditor review | N/A |

**SLA Constants:**
```
SLA_WARNING_DAYS = 7
SLA_URGENT_DAYS  = 3
SLA_GRACE_DAYS   = 3
```

---

## 10. Risk Scoring Model

Risk scores (0–100) are computed by `src/policy/audit/riskScoring.ts` using the `computeRiskScore()` function.

### Risk Drivers and Weights

| Risk Driver | Weight | Description |
|---|---|---|
| Overdue events | 30% | Events past their due date |
| Evidence gaps | 25% | Required evidence not yet submitted or accepted |
| SLA warnings | 20% | Events approaching their deadline |
| Blocked events | 15% | Events blocked by unmet dependencies |
| Uncertified events | 10% | Events complete but not yet certified |

### Score Formula

```
riskScore = sum(driverScore × weight) × 100
```

Where each `driverScore` is a normalized ratio of affected events to total events.

### Score Interpretation

| Range | Level | Action Required |
|---|---|---|
| 0–20 | Low | Routine monitoring |
| 21–40 | Moderate | Review and address SLA warnings |
| 41–60 | Elevated | Escalate overdue events; review evidence gaps |
| 61–100 | Critical | Immediate escalation; compliance officer review |

---

## 11. Compliance with HIPAA Audit Requirements

The system is designed to support HIPAA § 164.312(b) (Audit Controls) requirements:

| HIPAA Requirement | How This System Satisfies It |
|---|---|
| Record access and activity | All PHI access logged with `PHI_ACCESS` CRITICAL action |
| Tamper-evident logs | SHA-256 hash chaining — any modification breaks the chain |
| Retention | Audit records are append-only with no TTL configured |
| User accountability | Every entry includes actor ID, name, role, and timestamp |
| Failed access attempts | `LOGIN_FAILED` events logged |
| Session management | `LOGIN` and `LOGOUT` events logged for every session |

> **Auditor Advisory:** When conducting an external audit, request an export of the DynamoDB audit table directly (not via UI) to ensure you receive the raw source of truth. The chain verification API (`POST /api/audit/verify-chain`) should be run against the audit entity IDs under review before beginning analysis.
