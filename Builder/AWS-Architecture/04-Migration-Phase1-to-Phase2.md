# Migration Plan — Phase 1 → Phase 2

The goal is **zero data migration**. S3 and DynamoDB carry forward unchanged. Only the **compute and network layers** evolve. This is a deliberate design choice in Phase 1 and pays off here.

---

## Migration Principles

1. **Data plane is stable.** S3 buckets and the `compliance_objects` DDB table are the same physical resources in both phases.
2. **Strangler pattern** at the edge. Route traffic per endpoint from Lambda → containerized service.
3. **No big-bang cutover.** Each endpoint migrates independently with shadow traffic first.
4. **Reversible.** Until the Lambda is deleted, every migrated endpoint can be reverted in API Gateway in minutes.

---

## Migration Stages

### Stage 0 — Pre-flight (no production change)

- Enable AWS Organizations (if not already), create `prod`, `nonprod`, `security`, `logs` accounts.
- Move the existing Phase 1 account into the appropriate OU.
- Enable CloudTrail org-trail, Config, GuardDuty, Security Hub, Inspector.
- Establish KMS CMKs: `alias/hhc-evidence`, `alias/hhc-data`, `alias/hhc-ebs`, `alias/hhc-secrets`.

### Stage 1 — Network foundation

- Create VPC `10.40.0.0/16` in `us-west-1`.
- Subnets, route tables, IGW, NAT (1 to start; HA NAT in stage 5).
- Create VPC endpoints for S3, DynamoDB, KMS, Secrets, Logs, ECR, SSM.
- No workloads yet. Validate via a throwaway Fargate task that can `aws s3 ls` and `aws dynamodb describe-table` over endpoints.

### Stage 2 — Container baseline

- ECR repos: `hhc/api`, `hhc/validator`, `hhc/workflow`, `hhc/esign-ingest`, `hhc/export`, `hhc/audit-collector`.
- ECS cluster `hhc-fargate`.
- ALB `hhc-alb` (internal), target group templates.
- Task execution role + per-service task roles (mirror the Lambda IAM scopes).
- Deploy a "hello" task to validate ALB → ECS → CloudWatch flow.

### Stage 3 — Service rewrite (parallel to live Lambda)

For each endpoint, in this order — lowest blast radius first:

1. `GET /events/{event_id}/files`
2. `GET /files/{evidence_id}/download`
3. `POST /uploads/init`
4. `POST /uploads/{upload_id}/validate`
5. `POST /uploads/{upload_id}/promote`
6. `POST /exports/survey-packet`
7. `POST /esign/callback` (last; vendor coordination required)

Per endpoint:

- Implement in `api-svc` container behind a feature flag.
- Run **shadow traffic** from API Gateway via a `traffic-mirror` Lambda that calls both old and new and compares responses; do not return new responses.
- After 7 days clean shadow, **switch one weight at a time** via API Gateway integration: 10% → 50% → 100%.
- Leave the old Lambda for 30 days, then delete.

### Stage 4 — Cutover hardening

- Enable WAF on the API Gateway / ALB.
- Enable AWS Backup vaults with vault lock (governance mode).
- Enable S3 Object Lock (Compliance mode) on `evidence/`, `audit/`, `esign/` for prod (only if not already done in Phase 1; **enable as early as feasible**).
- Enable cross-region replication of `evidence/`, `audit/`, `esign/` to a bucket in `us-west-2` for DR.

### Stage 5 — Optional reporting layer

- If/when ad-hoc reporting need is real, stand up Aurora Serverless v2 in `data-*` subnets.
- DDB Streams → `audit-collector` → Aurora as a read model. DDB remains source of truth.

### Stage 6 — Lambda decommission

- Delete unused Lambdas, their CloudWatch log groups, and IAM roles.
- Remove API Gateway integrations pointing to Lambdas.
- Final architecture review and sign-off.

---

## Rollback Plan

| Stage | Rollback action |
|---|---|
| 1 | Delete VPC and endpoints (no impact to Phase 1) |
| 2 | Tear down ECS cluster (no impact to Phase 1) |
| 3 | API Gateway: switch route integration back to Lambda alias (≈1 min) |
| 4 | Disable WAF rule, keep Object Lock (Object Lock is intentionally non-reversible) |
| 5 | Stop Aurora; DDB unaffected |
| 6 | If a Lambda was deleted prematurely, restore from version-controlled IaC and redeploy |

---

## Cutover Checklist (per endpoint)

- [ ] Functional parity tests green (postman/contract suite)
- [ ] 7 days of shadow traffic with `< 0.1%` diff rate
- [ ] Latency p95 within 1.5× of Lambda baseline
- [ ] CloudWatch alarms ported and firing in test
- [ ] Audit rows still being written
- [ ] Runbook updated
- [ ] On-call notified
