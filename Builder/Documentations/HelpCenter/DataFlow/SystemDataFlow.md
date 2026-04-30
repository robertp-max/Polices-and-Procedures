# System Data Flow

**Document:** SystemDataFlow.md  
**Scope:** End-to-end data flow for the Care Indeed Policy Command Center

---

## Overview

This document describes how data flows through the system from user action to storage to audit. It covers the complete path: User → UI → API → Lambda → DynamoDB / S3 → Audit.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                        USER                                 │
│                (Browser / React SPA)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────────┐
│                   CLOUDFRONT CDN                            │
│          https://dovdry3t4njek.cloudfront.net               │
│     - Serves static SPA assets from S3                      │
│     - Routes /api/* to API Gateway                          │
└──────────┬─────────────────────────────┬────────────────────┘
           │ Static assets               │ API requests
┌──────────▼────────┐       ┌────────────▼────────────────────┐
│     S3 Bucket     │       │      API Gateway                │
│  (React SPA dist) │       │  (HTTP API + Auth Authorizer)   │
└───────────────────┘       └────────────┬────────────────────┘
                                         │
                            ┌────────────▼────────────────────┐
                            │       EXPRESS SERVER             │
                            │   (Node.js / server/ folder)    │
                            │  Routes: auth, calendar, ecign,  │
                            │  audit, compliance, pm, hubstaff │
                            └────────────┬────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
          ┌─────────▼──────┐  ┌──────────▼────────┐  ┌───────▼───────┐
          │   DynamoDB     │  │    S3 (Evidence)  │  │  SQLite (dev) │
          │  (Audit log,   │  │  (Uploaded files) │  │  (Local dev   │
          │  ecign chain,  │  │                   │  │   fallback)   │
          │  user sessions)│  │                   │  │               │
          └────────────────┘  └───────────────────┘  └───────────────┘
```

---

## Detailed Data Flow Paths

---

### 1. User Authentication Flow

```
User enters email/password
        ↓
LoginPage.tsx calls AuthApi.login()
        ↓
POST /api/auth/login (server/routes/auth.ts)
        ↓
Cognito User Pool validates credentials
        ↓ (success)
Server sets HTTP-only cookie: accessToken, refreshToken
        ↓
Server writes LOGIN_SUCCESS to DynamoDB audit log
        ↓
Response: { user, session }
        ↓
AuthApi stores user in React context
        ↓
App.tsx ProtectedRoute checks session → renders layout
```

---

### 2. Compliance Event Execution Flow

```
User opens Event Workspace (EventWorkspace.tsx)
        ↓
calendarStore reads event definition from autogenStore
        ↓
regulatoryExecutionStore provides current step/evidence state
        ↓
User completes a step → checkStep(eventId, stepIndex)
        ↓
regulatoryExecutionStore updates step state (localStorage)
        ↓
enforcementStore.log(STEP_COMPLETE, { event_id, stepIndex, actor })
        ↓
Audit entry hash-chained: hash = sha256(prevHash + canonicalJSON(entry))
        ↓ (async)
POST /api/calendar/events/:id (update status)
        ↓
DynamoDB: event record updated
```

---

### 3. Evidence Upload Flow

```
User uploads file in EvidencePanel
        ↓
File selected via drag-drop or file browser
        ↓
Client: FormData assembled { file, event_id, kind, workflow_id }
        ↓
POST /api/ecign/evidence (multipart/form-data)
        ↓
Server validates: file type, size, event_id exists
        ↓
Server uploads file to S3 bucket (evidence folder)
        ↓
Server creates evidence record in DynamoDB: { doc_id, event_id, kind, s3Key, status: 'submitted' }
        ↓
Server writes EVIDENCE_UPLOAD to DynamoDB audit log
        ↓
Response: { doc_id, status: 'submitted' }
        ↓
regulatoryExecutionStore adds evidence to event record
        ↓
UI: evidence appears in "Submitted" queue
        ↓
Manager accepts → PATCH /api/ecign/evidence/:docId/accept
        ↓
DynamoDB: evidence status updated to 'accepted', acceptedBy recorded
        ↓
Server writes EVIDENCE_ACCEPTED to audit log
        ↓
Event completion check: if all steps + evidence accepted → allow certification
```

---

### 4. Electronic Signature Flow (eCIgn)

```
Workflow step or direct nav opens FormSigningWorkspace.tsx
        ↓
FormSignatureContext initializes: POST /api/ecign/instances
        ↓
Server creates instance in DynamoDB: { instance_id, form_id, status, prevHash: GENESIS_HASH }
        ↓
Server writes ECIGN_CREATE to eCIgn hash chain (server/ecign/hashChain.ts)
        ↓
User reads document, draws/types signature, clicks "Sign and Submit"
        ↓
Client computes documentHash = sha256(formContent)
        ↓
POST /api/ecign/instances/:instanceId/sign { signatureData, documentHash, stage }
        ↓
Server validates: signer role, stage order, document hash integrity
        ↓
Server creates audit entry: { action: ECIGN_SIGN, signer, docHash, stage }
        ↓
Server computes: auditHash = sha256(prevHash + canonicalJSON(auditEntry))
        ↓
Server writes audit entry + auditHash to DynamoDB
        ↓
Server updates instance status (pending_second_signature | complete)
        ↓
If complete → POST /api/pm/notifications to notify calling workflow
        ↓
Signed form available as evidence under event_id
```

---

### 5. Audit Chain Verification Flow

```
Admin or auditor requests chain verification
        ↓
POST /api/audit/verify-chain { entityType, entityId }
        ↓
Server retrieves all audit entries for entity from DynamoDB (ordered by sequence)
        ↓
For each entry: recompute expectedHash = sha256(prevHash + canonicalJSON(entry))
        ↓
Compare expectedHash to stored hash
        ↓
If all match: { isValid: true, chainLength: N }
If mismatch found: { isValid: false, brokenAt: { sequence, expectedPrevHash, actualPrevHash } }
        ↓
Verification result itself written to audit log (prevents verification being used to cover tampering)
```

---

### 6. Policy Lifecycle Flow

```
Author in DRAFT state submits policy for review
        ↓
lifecycleStore.transition(policy_id, 'SUBMIT_REVIEW', actor)
        ↓
LifecycleState machine validates: DRAFT → REVIEW allowed
        ↓
lifecycleStore writes LifecycleHistoryEntry: { fromState: DRAFT, toState: REVIEW, actor, timestamp }
        ↓
enforcementStore logs POLICY_SUBMIT_REVIEW
        ↓ (async)
Reviewers notified via notificationStore
        ↓
Reviewer approves → REVIEW → APPROVED
        ↓
Admin publishes → APPROVED → PUBLISHED
        ↓
policyStore.policies[] updated: status = 'Published', effectiveDate = now
        ↓
Policy now visible in library to all staff
```

---

## Data Stores Reference

| Store | Type | Persistence | What It Holds |
|---|---|---|---|
| `policyStore` | Zustand | localStorage | Policy list, versions, assignments, audit trail |
| `regulatoryExecutionStore` | Zustand | localStorage | Step/evidence/approval state per event |
| `enforcementStore` | Zustand | localStorage | Hash-chained audit log, lock state |
| `autogenStore` | Zustand | localStorage | Auto-generated calendar events |
| `calendarStore` | Zustand | localStorage | Calendar tasks + schedule overrides |
| `calendarSyncStore` | Zustand | localStorage | Google Calendar sync state |
| `lifecycleStore` | Zustand | localStorage | Policy lifecycle envelopes + history |
| `journeyStore` | Zustand | localStorage | Employee onboarding progress |
| DynamoDB | AWS | Cloud | User sessions, audit chain, eCIgn instances |
| S3 (evidence) | AWS | Cloud | Uploaded evidence files |
| S3 (SPA) | AWS | Cloud | React app static assets |

---

## Key ID Cross-Reference

| ID | Format | Example | Used In |
|---|---|---|---|
| `event_id` | `{type}-{YYYYMMDD}-{seq}` | `governing_body_meeting-20260514-01` | Calendar, Evidence, Audit, Enforcement |
| `workflow_id` | `{domain}-{abbrev}-{seq}-WF` | `GV-GB-001-WF` | Workflow definitions, event execution |
| `policy_id` | `{domain}-{abbrev}-{seq}` | `GV-GB-001` | Policy library, lifecycle, evidence |
| `form_id` | `{domain}-FM-{seq}` | `EN-FM-002` | Forms catalog, eCIgn |
| `instance_id` | UUID v4 | `a3f2c1b4-...` | eCIgn instances, signature records |
| `doc_id` | UUID | `f91d2a3b-...` | Evidence documents |
| `user_id` | System-assigned | `usr_abc123` | Auth, audit, assignments |

---

## Security Boundaries

| Boundary | Mechanism |
|---|---|
| Public vs. authenticated | `ProtectedRoute` in React + JWT validation in server middleware |
| Role-based access | `AdminRouteGuard` in React + role check in each server route handler |
| PHI access | `phi=true` permissions + CRITICAL audit logging |
| Evidence immutability | Server-side: `accepted` evidence records have no update/delete path |
| Audit immutability | Append-only DynamoDB table + hash chaining (modification breaks chain) |
| Session security | HTTP-only, Secure, SameSite=Strict cookies — XSS cannot steal tokens |
