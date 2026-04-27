# Security, Cost, and Risk Comparison — Phase 1 vs Phase 2

## 1. Security Model Comparison

| Control | Phase 1 (Serverless) | Phase 2 (Linux-Controlled) |
|---|---|---|
| Network isolation | AWS-managed; no VPC | Private VPC, no public SSH, SSM only |
| Compute attack surface | Lambda runtime (AWS-managed) | Hardened Ubuntu 24.04 / non-root containers |
| OS patching | Not applicable | SSM Patch Manager, weekly window |
| Encryption at rest | SSE-KMS on S3, KMS on DDB | Same + KMS on EBS, RDS (if used) |
| Encryption in transit | TLS at API GW + S3 | TLS at WAF/ALB + mTLS service-to-service |
| Identity | Cognito (placeholder) + IAM | Cognito + IdP federation, mTLS, IAM Roles Anywhere optional |
| Secrets | Lambda env vars (KMS-encrypted) | Secrets Manager with rotation |
| Audit | CloudWatch + DDB AUDIT rows | + CloudTrail org trail, Config, GuardDuty, Security Hub |
| Immutability | S3 versioning + IAM deny-delete | + S3 Object Lock Compliance mode |
| Egress control | Not applicable | NAT + prefix lists; default-deny egress SG |
| Vulnerability mgmt | AWS-managed runtime | Inspector for EC2/ECR; image scan-on-push |
| HIPAA posture | Eligible services only; BAA required | Same + full Zero Trust + immutable audit |

**Verdict:** Phase 1 is *defensible* for an MVP under BAA. Phase 2 is required before broad PHI workloads or surveyor-grade attestations.

---

## 2. Cost Comparison (us-west-1, order-of-magnitude monthly)

Assumptions: ~5,000 evidence uploads/month averaging 2 MB each; 500 GB total storage in year 1; 2 vCPU baseline for Phase 2 services.

| Line item | Phase 1 | Phase 2 |
|---|---|---|
| API Gateway HTTP API | ~$1 (35k req) | ~$1 (edge retained) or $0 |
| Lambda | ~$2 | $0 (decommissioned) |
| ECS Fargate (4× 0.25 vCPU / 0.5 GB avg) | $0 | ~$60–120 |
| ALB | $0 | ~$22 + LCU |
| NAT Gateway (1 AZ) | $0 | ~$33 + data |
| NAT Gateway (HA, 2 AZ) | $0 | ~$66 + data |
| VPC interface endpoints (×8) | $0 | ~$58 (8 × ~$7.30) |
| DynamoDB on-demand + PITR | ~$5–15 | ~$5–15 |
| S3 storage (500 GB std + lifecycle) | ~$12 | ~$12 |
| S3 requests + KMS | ~$3 | ~$5 |
| CloudWatch Logs (ingestion + storage) | ~$5 | ~$15 |
| CloudTrail org-trail | ~$0 (mgmt events free) | ~$2–5 |
| GuardDuty | $0 (off) | ~$15–40 |
| Security Hub + Config | $0 | ~$10–30 |
| Inspector | $0 | ~$5 per instance / image |
| Secrets Manager | $0 | ~$2–10 |
| AWS Backup | $0 | ~$5–20 |
| WAF | $0 | ~$10–25 |
| Aurora Serverless v2 (if used, 0.5 ACU min) | $0 | ~$43+ |
| **Estimated total** | **~$30–50/mo** | **~$300–600/mo** (no Aurora) → **~$400–700/mo** (with Aurora) |

Cost risk indicators:
- **Phase 1:** S3 egress (download volume) is the single biggest variable. Mitigation: short presign TTLs and download audit alerting.
- **Phase 2:** NAT Gateway data processing and CloudWatch Logs ingestion are the silent budget killers. Mitigation: VPC endpoints (already in design), log sampling, S3 export of long-term logs.

---

## 3. Risk Analysis

### Phase 1 risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Triplet (`policy_id`, `workflow_id`, `event_id`) not enforced consistently | Med | High | Centralize validator; reject at `upload-init`; lint S3 keys in `upload-promote` |
| Presigned URL leakage | Med | Med | TTL ≤ 5 min for GET, ≤ 15 min for PUT; one-shot via DDB nonce on download |
| Accidental delete via console | Low | High | Bucket policy deny `s3:Delete*` on prod; SCP at org level later |
| eCign callback spoofing | Med | High | HMAC + timestamp window + IP allow list + replay nonce |
| Cost runaway (recursive Lambda or hot loop) | Low | Med | Reserved concurrency; Budgets alarm; CloudWatch error alarm |
| HIPAA scope creep before BAA controls in place | Med | High | PHI only after Object Lock + KMS CMK + audit fan-in are live |
| Single-region outage | Low | High | Phase 1 accepts this; Phase 2 adds CRR |
| DDB hot partition on a single big event | Low | Med | UPLOAD/EVIDENCE IDs use ULID; consider sharded `event_id` for >10k items/event |

### Phase 2 risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| NAT data processing cost surprise | High | Med | VPC endpoints for AWS APIs; egress logging |
| Container image supply chain | Med | High | ECR scan, signing, Inspector, base image pinning |
| OS drift across instances | Low (Fargate) / Med (EC2) | Med | Image Builder pipelines; immutable AMIs |
| Aurora cost without value | Med | Med | Only enable when reporting demand exists |
| Misconfigured SG opens lateral movement | Med | High | Mandatory `tfsec`/`checkov` in CI; AWS Config rules |
| Long-term log retention cost | Med | Low | CloudWatch → S3 export → Glacier |

---

## 4. Decision Matrix — When to advance to Phase 2

Move to Phase 2 when **any two** of the following are true:

1. PHI volume crosses 10,000 records or 100 GB.
2. A second customer / health system requires tenant isolation.
3. Surveyor or auditor requires immutable cross-account audit trail (CloudTrail in `security` account).
4. Sustained Lambda concurrency consistently exceeds 100.
5. Need for long-running (> 15 min) workflows or websockets.
6. Contractual requirement for VPC isolation or private connectivity.
