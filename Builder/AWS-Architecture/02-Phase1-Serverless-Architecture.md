# Phase 1 — Serverless Architecture (Detailed)

**Region:** `us-west-1`
**Account model:** Single AWS account is acceptable for MVP. Use one OU later for `prod` separation.
**Compute model:** 100% serverless. No VPC required.

---

## 1. S3 Design

### Buckets

| Logical | Name pattern | Purpose |
|---|---|---|
| Sandbox | `hhc-sandbox-{account_id}-us-west-1` | Dev / staging |
| Prod    | `hhc-prod-{account_id}-us-west-1`    | Production evidence |

### Common bucket settings

- Block Public Access: **all four flags ON**.
- Default encryption: **SSE-KMS** with customer-managed key `alias/hhc-evidence`.
- Versioning: **Enabled**.
- Object Lock: **Enabled in Compliance mode** on `prod` for `evidence/`, `audit/`, `esign/` prefixes (1825 days minimum).
- TLS-only bucket policy: deny `aws:SecureTransport=false`.
- Bucket-level access logging: write to a separate logs bucket `hhc-logs-{account_id}-us-west-1`.
- CORS: limited to the API origin (no wildcard).

### Prefix model (immutable contract)

```
uploads/raw/{policy_id}/{workflow_id}/{event_id}/{upload_id}/{filename}
uploads/validated/{policy_id}/{workflow_id}/{event_id}/{upload_id}/{filename}
evidence/{policy_id}/{workflow_id}/{event_id}/{evidence_id}/{filename}
forms/{policy_id}/{workflow_id}/{event_id}/{form_id}/{filename}
esign/{policy_id}/{workflow_id}/{event_id}/{form_id}/{signature_packet_id}/{filename}
audit/{yyyy}/{mm}/{dd}/{event_id}/{audit_id}.jsonl
exports/{yyyy}/{mm}/{dd}/{export_id}.zip
```

### Lifecycle rules

| Prefix | Sandbox | Prod |
|---|---|---|
| `uploads/raw/`       | Expire 7 days  | Transition to IA at 30d, expire at 90d (after promotion) |
| `uploads/validated/` | Expire 7 days  | Expire at 30d (post-promote) |
| `evidence/`          | Expire 30 days | **Never expire**; transition to Glacier IR at 365d |
| `forms/`             | Expire 30 days | Glacier IR at 730d |
| `esign/`             | Expire 30 days | **Never expire**; Glacier IR at 730d |
| `audit/`             | 90 days        | **Never expire**; Glacier Deep Archive at 365d |
| `exports/`           | 7 days         | 30 days |

### Access pattern

- No human dashboard access. **All reads/writes via presigned URLs** minted by Lambda.
- Bucket policy explicitly **denies `s3:DeleteObject` and `s3:DeleteObjectVersion`** on `evidence/*`, `audit/*`, `esign/*` for every principal except a break-glass `hhc-break-glass` role (MFA-required, alarmed on use).

---

## 2. DynamoDB Design

### Table: `compliance_objects`

- Billing: **PAY_PER_REQUEST**
- PITR: **Enabled**
- DynamoDB Streams: **NEW_AND_OLD_IMAGES** (for future EventBridge fan-out)
- KMS: customer-managed `alias/hhc-data`

| Attribute | Type | Notes |
|---|---|---|
| `pk` | S | Partition key |
| `sk` | S | Sort key |
| `gsi1pk` | S | For policy/workflow/form lookups |
| `gsi1sk` | S | timestamp + id |
| `gsi2pk` | S | For status scans (e.g. `STATUS#PENDING_VALIDATION`) |
| `gsi2sk` | S | timestamp |
| `policy_id` | S | required for evidence rows |
| `workflow_id` | S | required for evidence rows |
| `event_id` | S | required for evidence rows |
| `form_id` | S | optional |
| `user_id` | S | optional |
| `source_system` | S | `hhc`, `ecign`, `manual`, etc. |
| `status` | S | `INIT` → `UPLOADED` → `VALIDATED` → `PROMOTED` → `SIGNED` (esign) |
| `signature_status` | S | `NONE` / `PENDING` / `SIGNED` / `DECLINED` |
| `s3_bucket` | S | |
| `s3_key` | S | |
| `s3_version_id` | S | |
| `sha256` | S | hex digest |
| `size_bytes` | N | |
| `mime_type` | S | |
| `created_at` | S | ISO8601 |
| `updated_at` | S | ISO8601 |
| `created_by` | S | user/service principal |
| `audit_id` | S | for audit rows |

### Access patterns (`pk` / `sk`)

| Pattern | pk | sk |
|---|---|---|
| Upload slot | `EVENT#{event_id}` | `UPLOAD#{upload_id}` |
| Evidence by event | `EVENT#{event_id}` | `EVIDENCE#{evidence_id}` |
| Evidence by form | `FORM#{form_id}` | `EVENT#{event_id}#EVIDENCE#{evidence_id}` |
| Evidence by policy | `POLICY#{policy_id}` | `EVENT#{event_id}#EVIDENCE#{evidence_id}` |
| Workflow → events | `WORKFLOW#{workflow_id}` | `EVENT#{event_id}` |
| Audit row (append-only) | `AUDIT#{event_id}` | `{ISO_TS}#{audit_id}` |
| Signature packet | `ESIGN#{signature_packet_id}` | `EVENT#{event_id}#FORM#{form_id}` |

### GSIs

- **GSI1 (cross-cut by policy/workflow/form):**
  - `gsi1pk = POLICY#{policy_id}` or `WORKFLOW#{workflow_id}` or `FORM#{form_id}`
  - `gsi1sk = {ISO_TS}#EVIDENCE#{evidence_id}`
- **GSI2 (status sweeps for backfills/jobs):**
  - `gsi2pk = STATUS#{status}`
  - `gsi2sk = {ISO_TS}`

### Append-only audit

- Audit rows use `pk = AUDIT#{event_id}` and a sort key prefixed with ISO timestamp.
- Lambda audit writer uses `ConditionExpression: attribute_not_exists(pk)` to forbid overwrites.
- IAM policy on writer role denies `dynamodb:DeleteItem` on the table outright.

---

## 3. API (API Gateway HTTP API)

Base: `https://api.hhc.example.com/v1` (custom domain optional in MVP)

| Method | Path | Lambda | Auth |
|---|---|---|---|
| POST | `/uploads/init` | `upload-init` | Cognito JWT |
| POST | `/uploads/{upload_id}/validate` | `upload-validate` | Cognito JWT |
| POST | `/uploads/{upload_id}/promote` | `upload-promote` | Cognito JWT |
| GET  | `/events/{event_id}/files` | `file-list` | Cognito JWT |
| GET  | `/files/{evidence_id}/download` | `file-download` | Cognito JWT |
| POST | `/exports/survey-packet` | `export-builder` | Cognito JWT |
| POST | `/esign/callback` | `esign-callback` | HMAC + IP allow-list |

### `POST /uploads/init` — request

```json
{
  "policy_id": "POL-123",
  "workflow_id": "WF-456",
  "event_id": "EVT-789",
  "form_id": "FRM-001",
  "filename": "QAPI_minutes_2026Q1.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 482311,
  "source_system": "hhc"
}
```

Validation: all of `policy_id`, `workflow_id`, `event_id` MUST be present and match a registered ID format (`^[A-Z]{2,4}-[A-Z0-9-]{3,}$`).

### `POST /uploads/init` — response

```json
{
  "upload_id": "UPL-01HX...",
  "presigned_put_url": "https://hhc-prod-...s3.us-west-1.amazonaws.com/...",
  "expires_at": "2026-04-26T18:30:00Z",
  "required_headers": {
    "x-amz-server-side-encryption": "aws:kms",
    "x-amz-server-side-encryption-aws-kms-key-id": "alias/hhc-evidence",
    "Content-Type": "application/pdf"
  }
}
```

---

## 4. Lambda Responsibilities

| Function | Trigger | Reads | Writes | Notes |
|---|---|---|---|---|
| `upload-init` | API GW | — | DDB upload row, mints S3 presign | Validates triplet, generates `upload_id` (ULID) |
| `upload-validate` | API GW | S3 HEAD raw | DDB status=VALIDATED, sha256 | Streams object to compute hash; rejects > size cap |
| `upload-promote` | API GW | S3 raw | S3 evidence (server-side copy), DDB EVIDENCE rows + GSI projections, audit | Idempotent on `upload_id` |
| `file-list` | API GW | DDB query by EVENT | — | Pagination via `LastEvaluatedKey` |
| `file-download` | API GW | DDB get | mints S3 presign GET | Short TTL (≤ 5 min); records audit |
| `export-builder` | API GW | DDB query, S3 get | S3 `exports/...zip`, DDB export row | For survey packet; streams ZIP to S3 |
| `esign-callback` | API GW (HMAC) | Verifies signature | S3 `esign/...`, DDB ESIGN row, audit | Never bypasses evidence pipeline |

Runtime: Node.js 20.x (or Python 3.12).
Memory: 512 MB default; `upload-validate` and `export-builder` 1024 MB.
Timeout: 30s default; `export-builder` 300s.
Concurrency: reserved concurrency 10 per function for cost guardrails in MVP.

---

## 5. Security (Phase 1)

- **IAM least privilege:** one execution role per Lambda; resource ARNs scoped to specific bucket prefixes and the single DDB table.
- **No `s3:*` wildcard.** Each role lists explicit verbs (`s3:PutObject`, `s3:GetObject`, `s3:GetObjectVersion`).
- **No `dynamodb:DeleteItem`** for any application role.
- **Presigned URLs only**, signed by the Lambda role; TTL ≤ 15 minutes for PUT, ≤ 5 minutes for GET.
- **Audit logging:**
  - Every Lambda writes a structured JSON line to CloudWatch Logs.
  - Every state transition writes an `AUDIT#{event_id}` row with `actor`, `action`, `before_status`, `after_status`, `s3_version_id`, `sha256`.
- **Cognito (placeholder):** Define user pool with MFA required, password policy 12+ chars; integrate later. Until integrated, API uses an internal API key (rotated weekly) for closed pilot.
- **EventBridge (placeholder):** Bus `hhc-events` created but no rules wired in MVP. DDB Streams already on so we can fan out later without a re-deploy.
- **Budgets alarm:** $50/mo soft, $150/mo hard, email + SNS.

---

## 6. Observability

- CloudWatch Log Groups per Lambda, retention **90 days** (sandbox 14).
- Metric filters:
  - `ERROR` → custom metric `hhc/errors`
  - `AUDIT_DENY` → custom metric `hhc/audit_deny`
- Alarms:
  - 5xx rate on API GW > 1% over 5 min
  - Lambda error rate > 2%
  - Any `AUDIT_DENY` ≥ 1 → SNS to security
  - DDB throttles ≥ 1 → SNS

---

## 7. Failure & Idempotency Model

- All write APIs accept and require `Idempotency-Key` header (ULID). `upload-init` upserts on `(event_id, idempotency_key)` to make retries safe.
- Promotion uses S3 server-side copy + `If-None-Match: *` to avoid double-promotion; DDB write is conditional on `status = 'VALIDATED'`.
- esign callback verified by HMAC over body + `X-Timestamp` (5-minute window) + replay protection via DDB `pk=ESIGN_NONCE#{nonce}`.

---

## 8. Out of Scope for Phase 1

- VPC, NAT, ALB, EC2, RDS, OpenSearch, ECS, EKS.
- Cross-region replication.
- Aurora / relational reporting (deferred to Phase 2 if justified).
- Real-time search across evidence (rely on DDB GSIs and exports).
- Full SSO via external IdP (Cognito placeholder only).
