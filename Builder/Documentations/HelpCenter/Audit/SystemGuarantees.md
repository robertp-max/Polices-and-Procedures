# System Guarantees

**Classification:** Internal Compliance Documentation  
**Version:** 1.0  
**Effective Date:** 2025-01-01  
**Owner:** Compliance Director / Engineering Lead

---

## Purpose

This document defines what the Care Indeed system currently guarantees with respect to compliance, audit integrity, data accuracy, and operational behavior — and clearly distinguishes those guarantees from aspirational capabilities that are planned but not yet implemented.

It is intended as an honest, internal reference for compliance officers, auditors, and engineering teams.

---

## Guarantee Levels

| Level | Definition |
|---|---|
| **Enforced** | The system technically prevents violation; a user or admin cannot bypass this behavior |
| **Implemented** | The behavior is in place and working, but may be bypassable by a sufficiently privileged actor |
| **Policy** | The behavior depends on operational discipline; not technically enforced |
| **Planned** | Capability is designed and on the roadmap; not yet built |
| **Gap** | Known limitation with no current mitigation |

---

## Current Guarantees

### 1. Policies as Source of Truth

| Guarantee | Level |
|---|---|
| All compliance activities must reference a Published policy | Implemented |
| Only Published policies are considered active controls | Implemented |
| Policy lifecycle transitions (Draft → Review → Published → Archived) are enforced | Implemented |
| Policy version history is tracked | Implemented |
| Policy status transitions are logged with actor, role, and timestamp | Implemented |

**Limitation:** Policies are stored in the application's state layer. Until DynamoDB persistence is active (AWS Phase 1), policy state is not durable across server restarts.

---

### 2. Calendar Events and Workflow Execution

| Guarantee | Level |
|---|---|
| Events reference one or more policies via `policyRefs[]` | Implemented |
| Event lifecycle states (scheduled → in_progress → complete/missed) are enforced | Implemented |
| Missed events are flagged and generate compliance gap indicators | Implemented |
| Event completion requires at least one associated form or evidence item | Policy |
| Recurring events auto-generate on schedule | Implemented (in-memory) |

**Limitation:** Calendar event persistence is not yet written to DynamoDB. Auto-generated events are regenerated on page load from the policy registry. Events completed in one session may not reflect in another session without a server restart.

---

### 3. Form Submission and Signing (eCIgn)

| Guarantee | Level |
|---|---|
| Forms require authenticated user to sign | Implemented |
| Signature includes: user_id, role, timestamp, form_type | Implemented |
| Signed forms are immutable (cannot be edited after signing) | Implemented |
| Form submission triggers evidence record creation | Policy (planned to be automatic) |
| Form PDFs are archived with the evidence record | Planned (AWS Phase 1 — S3) |

---

### 4. Evidence Integrity

| Guarantee | Level |
|---|---|
| Evidence lifecycle states are enforced (PENDING → VALIDATED → PROMOTED → LOCKED) | Implemented |
| Evidence rejection requires a documented reason | Implemented |
| LOCKED evidence records cannot be modified through the application UI | Implemented |
| LOCKED evidence records cannot be modified at the database level | Policy (not technically enforced) |
| Document checksums verified on retrieval | Gap |
| Evidence records are persisted across server restarts | Planned (AWS Phase 1 — DynamoDB) |

**Critical gap:** Evidence immutability is enforced at the application layer only. Until DynamoDB condition expressions (`ConditionExpression: "attribute_exists(locked_at)"`) are implemented, a privileged user with database access could modify locked records without detection.

---

### 5. Audit Logging

| Guarantee | Level |
|---|---|
| Compliance-significant actions are logged with actor, role, timestamp, and context | Implemented |
| Audit log entries are append-only (no modification or deletion through UI) | Implemented |
| Audit log is persisted to durable storage | Planned (AWS Phase 1 — DynamoDB) |
| Audit log entries cannot be modified at the database level | Planned (DynamoDB — immutable record design) |
| Audit log is exportable for surveyor review | Planned (Phase 2) |
| Audit log completeness verified (no gaps) | Gap |

**Current behavior:** The `enforcementStore` maintains an in-memory audit chain. This chain is accurate within a session but does not survive server restarts. All logged events during a session are available for review in Audit Mode.

---

### 6. Role-Based Access Control

| Guarantee | Level |
|---|---|
| Users can only access routes and features permitted by their role | Implemented |
| Role assignments are validated on every authenticated request | Implemented |
| Privilege escalation (e.g., a user elevating their own role) is prevented | Implemented |
| Audit records log the actor's role at the time of the action | Implemented |
| Role changes are logged | Implemented |

---

### 7. Authentication and Session Security

| Guarantee | Level |
|---|---|
| All authenticated routes require a valid session token | Implemented |
| Sessions expire after a defined inactivity period | Implemented |
| Session tokens are not stored in localStorage (only memory) | Implemented |
| Multi-factor authentication for compliance-critical roles | Planned (AWS Phase 1) |
| IP-based access restrictions for admin roles | Planned |

---

## AWS Phase 1 Target Guarantees

The following guarantees will be added when AWS Phase 1 infrastructure is deployed:

1. **DynamoDB persistence** — All policy, event, form, evidence, and audit records persist across server restarts and scale horizontally.
2. **S3 document storage** — All form PDFs and evidence documents are stored in versioned S3 with server-side encryption (SSE-S3).
3. **Immutability enforcement** — DynamoDB condition expressions prevent modification of `LOCKED` evidence records and `FINALIZED` audit records at the database level.
4. **CloudTrail integration** — All AWS API calls (including DynamoDB writes) are logged in CloudTrail, providing an additional audit layer independent of the application.
5. **Backup and point-in-time recovery** — DynamoDB PITR enabled for all compliance tables.
6. **Encryption at rest and in transit** — All data encrypted using AWS KMS; all API calls over TLS 1.2+.

---

## Known Limitations Summary

| Limitation | Severity | Resolution |
|---|---|---|
| Policy/event/evidence state not persisted across restarts | High | AWS Phase 1 — DynamoDB |
| Evidence immutability not technically enforced at DB level | High | AWS Phase 1 — DynamoDB condition expressions |
| Audit log not durable | High | AWS Phase 1 — DynamoDB write |
| No document checksums | Medium | Phase 2 |
| No audit log export | Medium | Phase 2 |
| No MFA for admin roles | Medium | AWS Phase 1 |
| Task-level traceability incomplete | Low | Phase 2 |

---

## Related Documentation

- [SystemTraceability.md](SystemTraceability.md) — Full traceability chain
- [EvidenceModel.md](../DataFlow/EvidenceModel.md) — Evidence lifecycle detail
- [AWS Architecture](../../AWS-Architecture/) — Phase 1 infrastructure design
