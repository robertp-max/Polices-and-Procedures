# AWS Phase 1 Foundation Build Plan (Home Health Compliance)

## Context and Constraints

- Account type: personal AWS learning account with approximately $200 credits.
- Primary objective: learn quickly while building a real, usable system.
- Design rules: no always-on services unless required, no GPU/ML, no hidden-cost features.
- Compliance rules: every file must trace to `policy_id`, `workflow_id`, and `event_id`.
- Security rules: sandbox and production are isolated, evidence is immutable/versioned, audit is append-only, dashboard reads metadata from DynamoDB (not S3).

---

## 1) Phase 1 Architecture Diagram (Text)

```text
[User Browser / Dashboard]
        |
        v
[Amazon Cognito User Pool]
        |
   JWT token
        |
        v
[API Gateway HTTP API]
        |
        +--> [Lambda: metadata-api]
        |         |
        |         +--> [DynamoDB: compliance_objects]
        |         +--> [CloudWatch Logs]
        |
        +--> [Lambda: upload-init]
        |         |
        |         +--> [DynamoDB: upload_sessions]
        |         +--> [S3 Presigned PUT URL]
        |
        +--> [Lambda: upload-validate-promote]
        |         |
        |         +--> [S3 sandbox/raw]
        |         +--> [S3 production/evidence] (copy + object lock retention)
        |         +--> [DynamoDB: compliance_objects + audit_log]
        |
        +--> [Lambda: workflow-runner]
        |         |
        |         +--> [DynamoDB status/event updates]
        |         +--> [EventBridge putEvents (optional)]
        |
        +--> [Lambda: export-zip]
                  |
                  +--> [DynamoDB query by policy/workflow/event]
                  +--> [S3 production/evidence read]
                  +--> [S3 production/exports write]
                  +--> [Presigned GET URL return]

[EventBridge Scheduler] --> [Lambda: mandated-event-generator] --> [DynamoDB + audit_log]

[CloudWatch]
  - Logs for all Lambdas
  - Metric alarms (errors/throttles)
  - Billing alarm via CloudWatch + AWS Budgets notifications
```

---

## 2) S3 Bucket Architecture (R2 Replacement)

Use **two buckets only** to control cost and operational complexity:

1. `hhc-sandbox-{account_id}-{region}`
2. `hhc-prod-{account_id}-{region}`

### Prefix layout (both buckets)

```text
uploads/raw/{policy_id}/{workflow_id}/{event_id}/{upload_id}/{filename}
uploads/validated/{policy_id}/{workflow_id}/{event_id}/{upload_id}/{filename}
evidence/{policy_id}/{workflow_id}/{event_id}/{evidence_id}/{filename}
forms/{policy_id}/{workflow_id}/{event_id}/{form_id}/{filename}
audit/{yyyy}/{mm}/{dd}/{event_id}/{audit_id}.jsonl
exports/{yyyy}/{mm}/{dd}/{export_id}.zip
workflows/{workflow_id}/{event_id}/{artifact_name}
```

### Separation strategy

- `sandbox` bucket is for active uploads, testing, and pre-validation artifacts.
- `prod` bucket stores only approved/immutable evidence, production audit logs, and final exports.
- Never promote by rename in place; copy from `sandbox` to `prod`, then mark state in DynamoDB.

### Immutability and lifecycle

- Enable **S3 Versioning** on both buckets.
- For production evidence prefix, apply:
  - object-level retention metadata (`retain_until`) managed by Lambda.
  - bucket policy deny deletes for principals except break-glass admin role.
- Lifecycle:
  - `sandbox/uploads/raw`: expire after 30 days.
  - `sandbox/uploads/validated`: expire after 60 days.
  - `prod/exports`: expire after 30 days.
  - `prod/evidence`: no automatic expiration in Phase 1.

---

## 3) DynamoDB Metadata and Audit Model

Single-table design to keep Phase 1 simple and cheap:

Table: `compliance_objects`

- Partition key: `pk` (string)
- Sort key: `sk` (string)
- GSI1: `gsi1pk`, `gsi1sk` (event-centric access)
- GSI2: `gsi2pk`, `gsi2sk` (workflow-centric access)

### Core item patterns

- Policy item:
  - `pk=POLICY#{policy_id}`
  - `sk=META`
- Workflow event item:
  - `pk=WORKFLOW#{workflow_id}`
  - `sk=EVENT#{event_id}`
- File/evidence item:
  - `pk=EVENT#{event_id}`
  - `sk=FILE#{evidence_id}`
  - includes `policy_id`, `workflow_id`, `event_id`, `s3_key`, `bucket`, `sha256`, `status`
- Audit item (append-only):
  - `pk=AUDIT#{event_id}`
  - `sk={timestamp_iso}#{audit_id}`
  - includes actor, action, before/after hashes, request_id

### Required attributes on all file-related items

- `policy_id` (required)
- `workflow_id` (required)
- `event_id` (required)
- `created_at`, `created_by`, `source_ip`
- `integrity_sha256`
- `record_version`

### Append-only audit concept

- No update operations on `AUDIT#` items; write-only via `PutItem`.
- IAM policy: deny `UpdateItem` and `DeleteItem` on `pk` starting with `AUDIT#`.
- Optional tamper-evidence: each audit record stores `prev_audit_hash` + `current_audit_hash`.

---

## 4) API and Presigned URL Access Model

Dashboard never lists or reads S3 directly. All object access flows through API + DynamoDB metadata.

### Core endpoints

- `POST /uploads/init`
  - input: `policy_id`, `workflow_id`, `event_id`, `filename`, `content_type`
  - output: `upload_id`, presigned PUT URL (sandbox/raw)
- `POST /uploads/{upload_id}/validate`
  - validates size/type/hash, writes metadata, moves to `uploads/validated`
- `POST /uploads/{upload_id}/promote`
  - copies validated artifact to `prod/evidence/...`, records immutable evidence item
- `GET /events/{event_id}/files`
  - reads DynamoDB only, returns metadata list
- `POST /exports/survey-packet`
  - input: `policy_id`, `workflow_id`, `event_id`
  - Lambda builds ZIP from approved evidence and form files, writes to `prod/exports`, returns presigned GET URL
- `GET /files/{evidence_id}/download`
  - server verifies authorization, looks up metadata, issues short-lived presigned GET URL

### URL constraints

- PUT URL expiry: 10 minutes.
- GET URL expiry: 2 minutes.
- File size cap (Phase 1): 25 MB.
- Accepted MIME allowlist only.

---

## 5) Upload -> Validation -> Evidence Promotion Flow

1. Authenticated user calls `POST /uploads/init` with required IDs.
2. Lambda verifies `policy_id`, `workflow_id`, `event_id` present; writes `PENDING_UPLOAD` metadata.
3. API returns presigned PUT URL to `sandbox/uploads/raw/...`.
4. Client uploads file directly to S3 with server-provided key.
5. Client calls `POST /uploads/{upload_id}/validate`.
6. Validation Lambda checks:
   - object exists,
   - size <= configured limit,
   - content type allowlisted,
   - computed hash matches expected hash if provided.
7. On pass, Lambda copies object to `sandbox/uploads/validated/...`, sets status `VALIDATED`.
8. User or workflow calls `POST /uploads/{upload_id}/promote`.
9. Promotion Lambda copies object to `prod/evidence/...`, sets `status=EVIDENCE_LOCKED`, writes append-only audit entry.
10. Export Lambda queries by `event_id`, assembles approved files into ZIP, stores under `prod/exports/...`, returns short-lived GET URL.

---

## 6) Minimal IAM Role Design (Least Privilege, Phase 1)

### Execution roles

- `role/lambda-metadata-api`
  - DynamoDB read/write on `compliance_objects`
  - CloudWatch Logs write
- `role/lambda-upload-init`
  - DynamoDB write on upload items
  - S3 `PutObject` limited to `sandbox/uploads/raw/*` via presign context
- `role/lambda-validate-promote`
  - S3 read `sandbox/uploads/raw/*`
  - S3 write `sandbox/uploads/validated/*` and `prod/evidence/*`
  - DynamoDB write metadata + audit items
- `role/lambda-export-zip`
  - S3 read `prod/evidence/*`
  - S3 write `prod/exports/*`
  - DynamoDB query by event/workflow/policy
- `role/lambda-mandated-event-generator`
  - DynamoDB write event/audit rows
  - EventBridge invoke permission target only

### Human access roles

- `role/dev-sandbox-operator`
  - no direct S3 access to `prod/evidence/*`
  - may invoke API and read CloudWatch logs
- `role/break-glass-admin` (MFA required)
  - limited emergency access, manual use only

### Explicit deny policies

- Deny direct `s3:GetObject` to dashboard identity pool roles.
- Deny `s3:DeleteObject` on `prod/evidence/*` for all non-break-glass principals.
- Deny DynamoDB `DeleteItem`/`UpdateItem` for audit partition keys.

---

## 7) Step-by-Step Build Order (Most Important)

Build in this exact order to reduce rework and avoid cost surprises:

1. **Set budget controls first**
   - AWS Budgets: $25 monthly alert (80%), $40 hard warning (100%).
   - CloudWatch billing alarms + email notifications.
2. **Create S3 buckets and baseline policies**
   - enable versioning, default encryption, lifecycle rules.
   - create prefixes and deny-delete policy for production evidence.
3. **Create DynamoDB table**
   - `PAY_PER_REQUEST` mode.
   - PK/SK and two GSIs only.
4. **Create Cognito**
   - user pool + app client; simple email/password auth.
5. **Create API Gateway HTTP API**
   - JWT authorizer from Cognito.
   - single API stage (dev).
6. **Deploy Lambdas**
   - `metadata-api`, `upload-init`, `upload-validate-promote`, `export-zip`, `mandated-event-generator`.
7. **Wire endpoints**
   - test with one policy/workflow/event end-to-end.
8. **Add EventBridge schedule**
   - daily or weekly mandated event creation.
9. **Enable logging and alarms**
   - 14-day log retention.
   - alarm on Lambda errors > threshold.
10. **Run production-like acceptance test**
   - upload -> validate -> promote -> export ZIP -> verify audit chain.

---

## 8) Data Flow (Upload -> Workflow -> Evidence -> Export)

```text
User -> API /uploads/init -> DynamoDB upload record -> presigned PUT URL
User -> S3 sandbox/raw upload
User -> API /uploads/{id}/validate -> Lambda validates -> sandbox/validated + DynamoDB status + audit append
Workflow action -> API /uploads/{id}/promote -> Lambda copies to prod/evidence + status EVIDENCE_LOCKED + audit append
User -> API /exports/survey-packet -> Lambda queries approved files -> zip -> prod/exports -> presigned GET URL
User downloads ZIP with short TTL URL
```

---

## 9) Conservative Monthly Cost Estimate (Phase 1)

Assumptions:

- low/moderate usage: 1000 API calls/day, 200 file uploads/month, 50 exports/month, 5-10 GB total S3 storage.
- all services configured with no provisioned capacity and no always-on compute.

Estimated monthly spend (very conservative):

- S3 storage + requests: $1 to $5
- DynamoDB on-demand: $1 to $6
- Lambda (light workloads): $0 to $5
- API Gateway HTTP API: $1 to $4
- Cognito MAU (small team/testing): $0 to $3
- EventBridge schedules/events: <$1
- CloudWatch logs/metrics/alarms: $2 to $8

**Expected Phase 1 range:** approximately **$6 to $32/month** (normally much lower in free tier period).

---

## 10) What Will Accidentally Cost Money

- Large CloudWatch log volume (debug logging left on).
- S3 request spikes from repeated uploads/retries or large export loops.
- API Gateway REST API accidentally used instead of HTTP API.
- DynamoDB scans instead of key-based queries.
- Long-running Lambda ZIP creation due to oversized files.
- Presigned URLs with too-long expiry and uncontrolled sharing.
- Keeping many historical exports in S3.

---

## 11) Hard Guardrails to Prevent Credit Burn

- Budget alerts at low thresholds ($25 and $40).
- Use only `PAY_PER_REQUEST` for DynamoDB in Phase 1.
- API Gateway **HTTP API only** (not REST API).
- Lambda max timeout 30s for normal APIs, 120s for export function only.
- S3 lifecycle auto-delete for raw uploads and exports.
- CloudWatch log retention fixed at 14 days.
- Limit upload size to 25 MB until usage pattern is known.
- Block direct S3 reads from frontend identity roles.
- Maintain one environment in AWS (`dev`) plus logical sandbox/prod prefixes; do not create duplicate stacks.

---

## 12) Phase 2 Lock Criteria (Readiness Checklist)

Phase 2 is allowed only if all are true for at least 2 consecutive weeks:

- End-to-end workflow success rate >= 95%.
- No unresolved IAM over-permission findings.
- Monthly projected cost remains below $35.
- Audit records are consistently append-only and hash chain verification passes.
- Team can explain and operate Phase 1 without architecture confusion.
- At least 20 real events processed (not synthetic-only testing).

If any criterion fails, remain in Phase 1 and stabilize.

---

## 13) Phase 2 Preview (Not Full Design)

Potential upgrades after lock criteria pass:

- Step Functions for complex multi-step approvals/retries.
- Optional RDS/Aurora only if query patterns exceed DynamoDB suitability.
- Stronger immutability controls (S3 Object Lock governance/compliance mode where feasible).
- Finer-grained IAM with scoped condition keys and stricter role boundaries.
- Secrets Manager and parameter hygiene for production hardening.
- Throughput/scaling controls and improved observability.

This remains locked until readiness checklist is met.

---

## 14) What To Build Today (First 2-3 Steps Only)

1. Configure **AWS Budgets + CloudWatch billing alarms** before creating any resources.
2. Create `hhc-sandbox-*` and `hhc-prod-*` S3 buckets with versioning, lifecycle, and deny-delete policy on `prod/evidence/*`.
3. Create DynamoDB `compliance_objects` table (on-demand) and test writing one item containing `policy_id`, `workflow_id`, `event_id`.

After these are done and verified, proceed to Cognito + API + first Lambda path.
