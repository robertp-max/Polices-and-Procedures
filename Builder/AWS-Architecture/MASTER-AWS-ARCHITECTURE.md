# CI-ION Home Health — Master AWS Architecture Documentation

> **Auto-compiled:** 2026-04-26 18:29

---

## TABLE OF CONTENTS

### Part 1 — Core AWS Architecture
- 00-README-INDEX.md
- 01-Architecture-Diagram.md
- 02-Phase1-Serverless-Architecture.md
- 03-Phase2-Linux-Controlled-Architecture.md
- 04-Migration-Phase1-to-Phase2.md
- 05-Security-Cost-Risk-Comparison.md
- 06-Phase1-Execution-Plan.md
- 07-Phase2-Execution-Plan.md
- 08-eCign-Integration.md
- 09-MVP-Scope-and-Timeline.md

### Part 2 — Supporting AWS Documentation
- AWS_Phase1_Foundation_Build_Plan.md
- aws-phase1-component-mapping.md
- 02-Environment-Architecture.md
- 11-SaaS-Architecture-Alternatives.md

---

# PART 1 — CORE AWS ARCHITECTURE

## SOURCE: Builder\AWS-Architecture\00-README-INDEX.md

# AWS Architecture â€” Home Health Compliance & Evidence System

**Region (locked):** `us-west-1` (N. California)
**Workload class:** PHI-adjacent / HIPAA-aligned
**Owner:** Compliance Engineering
**Status:** Architecture proposal â€” **NOT YET EXECUTED**

---

## Document Map

| # | File | Purpose |
|---|------|---------|
| 00 | [00-README-INDEX.md](00-README-INDEX.md) | This index |
| 01 | [01-Architecture-Diagram.md](01-Architecture-Diagram.md) | Text diagrams (Phase 1 + Phase 2) |
| 02 | [02-Phase1-Serverless-Architecture.md](02-Phase1-Serverless-Architecture.md) | Detailed Phase 1 (MVP) design |
| 03 | [03-Phase2-Linux-Controlled-Architecture.md](03-Phase2-Linux-Controlled-Architecture.md) | Detailed Phase 2 (Ubuntu 24.04 / HIPAA) design |
| 04 | [04-Migration-Phase1-to-Phase2.md](04-Migration-Phase1-to-Phase2.md) | Step-by-step migration plan |
| 05 | [05-Security-Cost-Risk-Comparison.md](05-Security-Cost-Risk-Comparison.md) | Security model, cost, and risk comparison |
| 06 | [06-Phase1-Execution-Plan.md](06-Phase1-Execution-Plan.md) | Service-by-service execution plan + CLI commands |
| 07 | [07-Phase2-Execution-Plan.md](07-Phase2-Execution-Plan.md) | Phase 2 service inventory (design only) |
| 08 | [08-eCign-Integration.md](08-eCign-Integration.md) | eCign integration model (both phases) |
| 09 | [09-MVP-Scope-and-Timeline.md](09-MVP-Scope-and-Timeline.md) | MVP scope definition + timeline |
| 10 | [scripts/](scripts) | AWS CLI scripts (review-only, do not run until approved) |

---

## Non-Negotiable Core Requirement

Every evidence artifact MUST trace to:

- `policy_id`
- `workflow_id`
- `event_id`

Optional but stored when present:

- `form_id`
- `user_id`
- `source_system`
- `signature_status`

This invariant is enforced at three layers:

1. **API contract** â€” `/uploads/init` rejects requests missing the triplet.
2. **S3 key shape** â€” every prefix encodes the triplet (`{policy_id}/{workflow_id}/{event_id}/...`).
3. **DynamoDB write** â€” `compliance_objects` records reject items lacking the triplet via a Lambda-side validator and a condition expression on the GSI projection.

---

## Region & Account Discipline

- All resources MUST be created in `us-west-1`.
- No cross-region replication in Phase 1 (defer to Phase 2 backup strategy).
- Bucket names use the form `hhc-{env}-{account_id}-us-west-1` to make region accidents obvious.

---

## Execution Posture

- **I have NOT executed any AWS commands.**
- All CLI commands are written to [scripts/](scripts) for human review.
- Before running any `create-*` command, the architecture must be approved.
- High-cost or always-on services (NAT, EC2, ALB, Aurora, OpenSearch) require explicit approval before creation; none of those are in Phase 1.

---

## Definition of "Done" for the MVP (Phase 1)

1. A compliance officer can request an upload slot for a given `(policy_id, workflow_id, event_id)`.
2. They receive a presigned PUT URL and upload a file.
3. The system validates, hashes, and promotes the file to immutable evidence storage.
4. The file is queryable by event, by policy, by workflow, and by form.
5. A survey export packet (`.zip`) can be produced for a date range.
6. eCign callbacks land signed packets back into the same evidence pipeline.
7. Every step writes an append-only audit row.

---

## SOURCE: Builder\AWS-Architecture\01-Architecture-Diagram.md

# Architecture Diagrams (Text)

## Phase 1 â€” Serverless MVP (us-west-1)

```
                       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                       â”‚         End Users           â”‚
                       â”‚  (Compliance Officers, RNs) â”‚
                       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                      â”‚ HTTPS
                                      â–¼
                       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                       â”‚  Cognito User Pool          â”‚  (placeholder, JWT)
                       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                      â”‚ JWT
                                      â–¼
                       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                       â”‚  API Gateway (HTTP API)     â”‚
                       â”‚  hhc-api                    â”‚
                       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                      â”‚ proxy
       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
       â–¼                              â–¼                                  â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”               â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ upload-init  â”‚            â”‚ upload-validate  â”‚               â”‚ upload-promote   â”‚
â”‚  Lambda      â”‚            â”‚  Lambda          â”‚               â”‚  Lambda          â”‚
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜            â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜               â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚ presign PUT                 â”‚ HEAD raw, hash          â”‚ Copy rawâ†’evidence
       â”‚ Dynamo: UPLOAD              â”‚ Dynamo: VALIDATED       â”‚ Dynamo: PROMOTED
       â–¼                             â–¼                         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         S3: hhc-{env}-{acct}-us-west-1                          â”‚
â”‚  uploads/raw/{policy}/{workflow}/{event}/{upload}/file                          â”‚
â”‚  uploads/validated/...                                                          â”‚
â”‚  evidence/{policy}/{workflow}/{event}/{evidence}/file   (versioned, no-delete)  â”‚
â”‚  forms/...   esign/...   audit/yyyy/mm/dd/...   exports/yyyy/mm/dd/...          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                      â–²
                                      â”‚
       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
       â”‚                              â”‚                                  â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”               â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ file-downloadâ”‚            â”‚ export-builder   â”‚               â”‚ esign-callback   â”‚
â”‚  Lambda      â”‚            â”‚  Lambda          â”‚               â”‚  Lambda          â”‚
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜            â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜               â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚                             â”‚                                  â”‚
       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                    â–¼                               â–¼
           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
           â”‚ DynamoDB         â”‚         â”‚ CloudWatch Logs       â”‚
           â”‚ compliance_objectsâ”‚         â”‚ /aws/lambda/hhc-*     â”‚
           â”‚  pk / sk + GSIs  â”‚         â”‚ + metric filters      â”‚
           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
           â”‚ EventBridge bus  â”‚ (design)â”‚ AWS Budgets alarm    â”‚
           â”‚ hhc-events       â”‚         â”‚ $50/mo soft cap      â”‚
           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Trust boundaries (Phase 1):**

- All compute is AWS-managed (Lambda); no VPC required for MVP.
- S3 access is **only** via presigned URLs minted by Lambdas with scoped IAM.
- Direct S3 console access is denied by bucket policy except for a break-glass admin role.

---

## Phase 2 â€” Linux-Controlled / HIPAA-Aligned (us-west-1)

```
                                    Internet
                                       â”‚
                                       â–¼
                         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                         â”‚ CloudFront (optional CDN)  â”‚
                         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                        â”‚
                                        â–¼
                         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                         â”‚ AWS WAF                    â”‚
                         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                        â”‚
                                        â–¼
                         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                         â”‚ API Gateway (edge proxy)   â”‚  â† optional retain
                         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                        â”‚ VPC Link
                                        â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ VPC: 10.40.0.0/16  (us-west-1) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                                                                                  â”‚
â”‚   Public subnets (10.40.0.0/24, 10.40.1.0/24)                                                    â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                                             â”‚
â”‚   â”‚  Internal ALB  hhc-alb         â”‚  TLS terminate, OIDC via Cognito/IdP                        â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                                             â”‚
â”‚                  â”‚                                                                               â”‚
â”‚   Private app subnets (10.40.10.0/24, 10.40.11.0/24)                                             â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                              â”‚
â”‚   â”‚  ECS Fargate (Linux) OR EC2 Ubuntu 24.04 LTS                  â”‚                              â”‚
â”‚   â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚                              â”‚
â”‚   â”‚  â”‚ api-svc    â”‚ â”‚ validator-svc  â”‚ â”‚ workflow-engine     â”‚    â”‚                              â”‚
â”‚   â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚                              â”‚
â”‚   â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                â”‚                              â”‚
â”‚   â”‚  â”‚ esign-ingest-svc   â”‚ â”‚ export-svc         â”‚                â”‚                              â”‚
â”‚   â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                â”‚                              â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                              â”‚
â”‚                  â”‚                                                                               â”‚
â”‚   Private data subnets (10.40.20.0/24, 10.40.21.0/24)                                            â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                   â”‚
â”‚   â”‚ Aurora Serverless v2      â”‚    â”‚ ElastiCache (optional) â”‚                                   â”‚
â”‚   â”‚ (only if relational need) â”‚    â”‚                        â”‚                                   â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                   â”‚
â”‚                                                                                                  â”‚
â”‚   VPC Endpoints (Gateway): S3, DynamoDB                                                          â”‚
â”‚   VPC Endpoints (Interface): KMS, Secrets Manager, SSM, Logs, ECR, STS                           â”‚
â”‚                                                                                                  â”‚
â”‚   Access:  SSM Session Manager only.  No bastion. No public SSH. No NAT in private app subnets   â”‚
â”‚            unless egress required â†’ use NAT in public subnet, gated by SG + route policy.        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

   Cross-cutting:
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚ CloudTrailâ”‚ â”‚  KMS   â”‚ â”‚ Secrets Manager â”‚ â”‚ AWS Backup â”‚ â”‚ CloudWatch    â”‚ â”‚ Config    â”‚
   â”‚ org-wide  â”‚ â”‚ CMKs   â”‚ â”‚ rotation        â”‚ â”‚ vaults     â”‚ â”‚ Logs/Metrics  â”‚ â”‚ rules     â”‚
   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## SOURCE: Builder\AWS-Architecture\02-Phase1-Serverless-Architecture.md

# Phase 1 â€” Serverless Architecture (Detailed)

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
| `status` | S | `INIT` â†’ `UPLOADED` â†’ `VALIDATED` â†’ `PROMOTED` â†’ `SIGNED` (esign) |
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
| Workflow â†’ events | `WORKFLOW#{workflow_id}` | `EVENT#{event_id}` |
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

### `POST /uploads/init` â€” request

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

### `POST /uploads/init` â€” response

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
| `upload-init` | API GW | â€” | DDB upload row, mints S3 presign | Validates triplet, generates `upload_id` (ULID) |
| `upload-validate` | API GW | S3 HEAD raw | DDB status=VALIDATED, sha256 | Streams object to compute hash; rejects > size cap |
| `upload-promote` | API GW | S3 raw | S3 evidence (server-side copy), DDB EVIDENCE rows + GSI projections, audit | Idempotent on `upload_id` |
| `file-list` | API GW | DDB query by EVENT | â€” | Pagination via `LastEvaluatedKey` |
| `file-download` | API GW | DDB get | mints S3 presign GET | Short TTL (â‰¤ 5 min); records audit |
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
- **Presigned URLs only**, signed by the Lambda role; TTL â‰¤ 15 minutes for PUT, â‰¤ 5 minutes for GET.
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
  - `ERROR` â†’ custom metric `hhc/errors`
  - `AUDIT_DENY` â†’ custom metric `hhc/audit_deny`
- Alarms:
  - 5xx rate on API GW > 1% over 5 min
  - Lambda error rate > 2%
  - Any `AUDIT_DENY` â‰¥ 1 â†’ SNS to security
  - DDB throttles â‰¥ 1 â†’ SNS

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

---

## SOURCE: Builder\AWS-Architecture\03-Phase2-Linux-Controlled-Architecture.md

# Phase 2 â€” Linux-Controlled, HIPAA-Aligned Architecture (Detailed)

**Region:** `us-west-1`
**OS standard:** Ubuntu 24.04 LTS (Noble), CIS Level 1 baseline minimum.
**Posture:** HIPAA-aligned (BAA in place with AWS), Zero-Trust principles, private-by-default.

---

## 1. Compute Decision: EC2 vs ECS Fargate vs EKS

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **EC2 Ubuntu 24.04 (ASG)** | Maximum OS control; CIS hardening explicit; SSH ergonomics via SSM | OS patching, AMI bakery, capacity mgmt | Use only if OS-level customization is genuinely required |
| **ECS Fargate (Linux)** | No host management; per-task IAM; integrates with ALB; HIPAA-eligible | Less OS control; cold-start for new tasks | **Recommended default** |
| **EKS** | Portability, K8s ecosystem | Operational tax; control plane cost; overkill for this workload size | Defer unless multi-tenant / K8s skills already in-house |

**Recommendation:** ECS Fargate on Linux for the services; EC2 Ubuntu reserved for any specialty job (e.g. heavyweight document conversion) inside an ASG of size 0â€“2.

---

## 2. VPC Design

CIDR: `10.40.0.0/16` (us-west-1)

| Subnet | CIDR | AZ | Purpose | Route |
|---|---|---|---|---|
| `public-a` | 10.40.0.0/24 | us-west-1a | ALB, NAT GW | IGW |
| `public-c` | 10.40.1.0/24 | us-west-1c | ALB, NAT GW (HA) | IGW |
| `app-a` | 10.40.10.0/24 | us-west-1a | ECS tasks / EC2 | NAT-a + VPC endpoints |
| `app-c` | 10.40.11.0/24 | us-west-1c | ECS tasks / EC2 | NAT-c + VPC endpoints |
| `data-a` | 10.40.20.0/24 | us-west-1a | Aurora Serverless v2 (if used) | no IGW, no NAT |
| `data-c` | 10.40.21.0/24 | us-west-1c | Aurora Serverless v2 (if used) | no IGW, no NAT |

### VPC endpoints (no internet egress for AWS APIs)

- **Gateway:** `S3`, `DynamoDB`
- **Interface (PrivateLink):** `KMS`, `Secrets Manager`, `SSM`, `SSM Messages`, `EC2 Messages`, `Logs`, `Monitoring`, `ECR API`, `ECR DKR`, `STS`

### Access model

- **Zero public SSH.** Use **SSM Session Manager** for any shell access.
- No bastion host.
- ALB is the only ingress; tasks/instances accept traffic only from the ALB SG.
- Egress for app subnets: deny all by default; permit `443` to NAT only for explicit external endpoints (e.g. eCign vendor) via prefix list.

---

## 3. Service Layout (ECS Fargate, Linux)

| Service | Replicas | Purpose |
|---|---|---|
| `api-svc` | 2â€“10 | Node.js HTTP API (replaces API Gateway+Lambda routes) |
| `validator-svc` | 1â€“6 | Heavy file validation, AV scan, hashing |
| `workflow-engine` | 1â€“4 | Mandated event scheduler / state machine driver |
| `esign-ingest-svc` | 1â€“4 | eCign vendor webhook receiver + verifier |
| `export-svc` | 0â€“4 | On-demand survey packet builder |
| `audit-collector` | 1â€“2 | Centralized audit fan-in to S3 + Aurora (read model) |

- Each service has its own **ECS task role** (least privilege) and its own **task execution role**.
- Containers must run as **non-root**, read-only root filesystem, drop all Linux capabilities, with `seccomp=runtime/default`.
- Images stored in private **ECR**; image scanning ON; only signed images may run (use `ECR + Notation` or `cosign` + admission gate via CodeBuild policy).

---

## 4. API Layer

Two acceptable patterns:

**Pattern A (recommended):** Keep **API Gateway** as the public edge (rate limiting, WAF, auth) â†’ **VPC Link** â†’ internal ALB â†’ `api-svc`.
**Pattern B:** Public ALB + WAF directly. Simpler, but you lose API Gateway features (usage plans, throttling). Choose A unless you need WebSockets/streaming where ALB is preferable.

---

## 5. Data Layer Decision: DynamoDB vs Aurora Serverless v2

Keep **DynamoDB `compliance_objects`** as the system of record for evidence metadata. It is the right shape for the access patterns and is HIPAA-eligible.

Add **Aurora Serverless v2 (PostgreSQL)** *only if* one or more of these become real:

- Multi-table joins for surveyor-facing reports (e.g. policy-coverage matrix across hundreds of events).
- Ad-hoc SQL by analysts.
- Workflow definitions with deeply relational dependencies.

If introduced, Aurora is a **read-side / reporting** database, populated from DDB Streams via the `audit-collector`. DDB remains the source of truth.

| Tradeoff | DynamoDB | Aurora Serverless v2 |
|---|---|---|
| Cost at low volume | Very low | ACU minimum (~$43/mo at 0.5 ACU) |
| Schema flexibility | High | Low |
| Ad-hoc analytics | Poor | Strong |
| Operational burden | Near zero | Patching, parameter groups, failover |

---

## 6. Storage

- **S3 buckets unchanged** from Phase 1. The Phase 2 services access S3 via the **Gateway VPC endpoint**, never the public internet.
- Object Lock **Compliance** mode mandatory on `evidence/`, `esign/`, `audit/` in production.
- Add **S3 Inventory** + **S3 Access Analyzer** to continuously audit prefixes.

---

## 7. Security Controls

### OS hardening (Ubuntu 24.04 / CIS L1)

- Image baked via **EC2 Image Builder** pipeline; AMIs versioned and immutable.
- Auto-patching via **SSM Patch Manager** maintenance window (weekly).
- Mandatory packages: `auditd`, `aide`, `unattended-upgrades`, `chrony`, `fail2ban`.
- Disable: `telnet`, `rsh`, `xinetd`, unused kernel modules.
- `sshd` **disabled**; access via SSM only.
- All disks **encrypted with KMS CMK** (`alias/hhc-ebs`).

### Container hardening

- Distroless or `ubuntu:24.04-minimal` base.
- `USER 10001`, `readOnlyRootFilesystem: true`, `linuxParameters.capabilities.drop: ["ALL"]`.
- ECR scan-on-push + a daily re-scan job.

### Network controls

- Security Groups: explicit allow lists; no `0.0.0.0/0` ingress except on ALB SG (443 only).
- NACLs: stateless backstop denying SMB/NetBIOS/legacy ports egress.
- WAF managed rule sets: AWSManagedRulesCommonRuleSet, KnownBadInputs, SQLi, IP reputation, plus custom rules for `/esign/callback` (rate limit + body size cap).

### Identity

- **Cognito** user pool for end-users (MFA required, advanced security ON, compromised-credentials check).
- Workforce SSO via external IdP (Okta/Entra) federated through Cognito or directly via OIDC at the ALB.
- **Service-to-service auth:** SigV4 within VPC; for cross-service HTTP, mTLS via ACM Private CA, *or* short-lived OAuth2 client-credentials issued by `api-svc` and verified by sidecar.

### Secrets

- **AWS Secrets Manager** for DB creds, eCign API keys, HMAC secrets.
- Rotation: 30-day for HMAC, 90-day for vendor keys.
- No secrets in env vars at rest â€” pulled at task start via task role.

---

## 8. Audit Architecture

- `audit-collector` consumes **DynamoDB Streams** + container application logs (via FireLens â†’ CloudWatch).
- Writes append-only JSONL to S3 `audit/yyyy/mm/dd/...` with **Object Lock** in Compliance mode.
- Daily Glacier Deep Archive transition for objects > 365 days.
- **CloudTrail** (org-trail, multi-region read enabled, log file validation ON) â†’ dedicated logs account if AWS Organizations is in play.
- **AWS Config** rules:
  - `s3-bucket-public-read-prohibited`
  - `s3-bucket-server-side-encryption-enabled`
  - `dynamodb-pitr-enabled`
  - `cloudtrail-enabled`
  - `iam-user-mfa-enabled`
  - `restricted-ssh`
- **GuardDuty + Security Hub + Inspector** all enabled in `us-west-1`.
- **AWS Backup** vaults for DDB, EBS, RDS (if used) with vault lock (governance mode at minimum).

---

## 9. Reliability

- ECS service auto-scaling on CPU + custom RPS metric.
- Multi-AZ across `us-west-1a` and `us-west-1c`.
- ALB health checks on `/healthz`.
- DynamoDB on-demand + PITR (already from Phase 1).
- Disaster recovery RPO â‰¤ 1 hour, RTO â‰¤ 4 hours via Backup + cross-region copy of S3 evidence to `us-west-2` (Phase 2 only).

---

## 10. CI/CD (Phase 2)

- CodeCommit/GitHub â†’ CodeBuild (lint, SAST, image build, sign, scan) â†’ CodeDeploy/ECS blue-green.
- Mandatory checks before merge: unit tests, `tfsec`/`checkov` on IaC, `trivy` on image, `cfn-nag`/`tflint`.
- IaC: **Terraform** (preferred) or CDK; pinned providers; remote state in S3 with DDB lock; state encrypted with KMS CMK.

---

## SOURCE: Builder\AWS-Architecture\04-Migration-Phase1-to-Phase2.md

# Migration Plan â€” Phase 1 â†’ Phase 2

The goal is **zero data migration**. S3 and DynamoDB carry forward unchanged. Only the **compute and network layers** evolve. This is a deliberate design choice in Phase 1 and pays off here.

---

## Migration Principles

1. **Data plane is stable.** S3 buckets and the `compliance_objects` DDB table are the same physical resources in both phases.
2. **Strangler pattern** at the edge. Route traffic per endpoint from Lambda â†’ containerized service.
3. **No big-bang cutover.** Each endpoint migrates independently with shadow traffic first.
4. **Reversible.** Until the Lambda is deleted, every migrated endpoint can be reverted in API Gateway in minutes.

---

## Migration Stages

### Stage 0 â€” Pre-flight (no production change)

- Enable AWS Organizations (if not already), create `prod`, `nonprod`, `security`, `logs` accounts.
- Move the existing Phase 1 account into the appropriate OU.
- Enable CloudTrail org-trail, Config, GuardDuty, Security Hub, Inspector.
- Establish KMS CMKs: `alias/hhc-evidence`, `alias/hhc-data`, `alias/hhc-ebs`, `alias/hhc-secrets`.

### Stage 1 â€” Network foundation

- Create VPC `10.40.0.0/16` in `us-west-1`.
- Subnets, route tables, IGW, NAT (1 to start; HA NAT in stage 5).
- Create VPC endpoints for S3, DynamoDB, KMS, Secrets, Logs, ECR, SSM.
- No workloads yet. Validate via a throwaway Fargate task that can `aws s3 ls` and `aws dynamodb describe-table` over endpoints.

### Stage 2 â€” Container baseline

- ECR repos: `hhc/api`, `hhc/validator`, `hhc/workflow`, `hhc/esign-ingest`, `hhc/export`, `hhc/audit-collector`.
- ECS cluster `hhc-fargate`.
- ALB `hhc-alb` (internal), target group templates.
- Task execution role + per-service task roles (mirror the Lambda IAM scopes).
- Deploy a "hello" task to validate ALB â†’ ECS â†’ CloudWatch flow.

### Stage 3 â€” Service rewrite (parallel to live Lambda)

For each endpoint, in this order â€” lowest blast radius first:

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
- After 7 days clean shadow, **switch one weight at a time** via API Gateway integration: 10% â†’ 50% â†’ 100%.
- Leave the old Lambda for 30 days, then delete.

### Stage 4 â€” Cutover hardening

- Enable WAF on the API Gateway / ALB.
- Enable AWS Backup vaults with vault lock (governance mode).
- Enable S3 Object Lock (Compliance mode) on `evidence/`, `audit/`, `esign/` for prod (only if not already done in Phase 1; **enable as early as feasible**).
- Enable cross-region replication of `evidence/`, `audit/`, `esign/` to a bucket in `us-west-2` for DR.

### Stage 5 â€” Optional reporting layer

- If/when ad-hoc reporting need is real, stand up Aurora Serverless v2 in `data-*` subnets.
- DDB Streams â†’ `audit-collector` â†’ Aurora as a read model. DDB remains source of truth.

### Stage 6 â€” Lambda decommission

- Delete unused Lambdas, their CloudWatch log groups, and IAM roles.
- Remove API Gateway integrations pointing to Lambdas.
- Final architecture review and sign-off.

---

## Rollback Plan

| Stage | Rollback action |
|---|---|
| 1 | Delete VPC and endpoints (no impact to Phase 1) |
| 2 | Tear down ECS cluster (no impact to Phase 1) |
| 3 | API Gateway: switch route integration back to Lambda alias (â‰ˆ1 min) |
| 4 | Disable WAF rule, keep Object Lock (Object Lock is intentionally non-reversible) |
| 5 | Stop Aurora; DDB unaffected |
| 6 | If a Lambda was deleted prematurely, restore from version-controlled IaC and redeploy |

---

## Cutover Checklist (per endpoint)

- [ ] Functional parity tests green (postman/contract suite)
- [ ] 7 days of shadow traffic with `< 0.1%` diff rate
- [ ] Latency p95 within 1.5Ã— of Lambda baseline
- [ ] CloudWatch alarms ported and firing in test
- [ ] Audit rows still being written
- [ ] Runbook updated
- [ ] On-call notified

---

## SOURCE: Builder\AWS-Architecture\05-Security-Cost-Risk-Comparison.md

# Security, Cost, and Risk Comparison â€” Phase 1 vs Phase 2

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
| ECS Fargate (4Ã— 0.25 vCPU / 0.5 GB avg) | $0 | ~$60â€“120 |
| ALB | $0 | ~$22 + LCU |
| NAT Gateway (1 AZ) | $0 | ~$33 + data |
| NAT Gateway (HA, 2 AZ) | $0 | ~$66 + data |
| VPC interface endpoints (Ã—8) | $0 | ~$58 (8 Ã— ~$7.30) |
| DynamoDB on-demand + PITR | ~$5â€“15 | ~$5â€“15 |
| S3 storage (500 GB std + lifecycle) | ~$12 | ~$12 |
| S3 requests + KMS | ~$3 | ~$5 |
| CloudWatch Logs (ingestion + storage) | ~$5 | ~$15 |
| CloudTrail org-trail | ~$0 (mgmt events free) | ~$2â€“5 |
| GuardDuty | $0 (off) | ~$15â€“40 |
| Security Hub + Config | $0 | ~$10â€“30 |
| Inspector | $0 | ~$5 per instance / image |
| Secrets Manager | $0 | ~$2â€“10 |
| AWS Backup | $0 | ~$5â€“20 |
| WAF | $0 | ~$10â€“25 |
| Aurora Serverless v2 (if used, 0.5 ACU min) | $0 | ~$43+ |
| **Estimated total** | **~$30â€“50/mo** | **~$300â€“600/mo** (no Aurora) â†’ **~$400â€“700/mo** (with Aurora) |

Cost risk indicators:
- **Phase 1:** S3 egress (download volume) is the single biggest variable. Mitigation: short presign TTLs and download audit alerting.
- **Phase 2:** NAT Gateway data processing and CloudWatch Logs ingestion are the silent budget killers. Mitigation: VPC endpoints (already in design), log sampling, S3 export of long-term logs.

---

## 3. Risk Analysis

### Phase 1 risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Triplet (`policy_id`, `workflow_id`, `event_id`) not enforced consistently | Med | High | Centralize validator; reject at `upload-init`; lint S3 keys in `upload-promote` |
| Presigned URL leakage | Med | Med | TTL â‰¤ 5 min for GET, â‰¤ 15 min for PUT; one-shot via DDB nonce on download |
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
| Long-term log retention cost | Med | Low | CloudWatch â†’ S3 export â†’ Glacier |

---

## 4. Decision Matrix â€” When to advance to Phase 2

Move to Phase 2 when **any two** of the following are true:

1. PHI volume crosses 10,000 records or 100 GB.
2. A second customer / health system requires tenant isolation.
3. Surveyor or auditor requires immutable cross-account audit trail (CloudTrail in `security` account).
4. Sustained Lambda concurrency consistently exceeds 100.
5. Need for long-running (> 15 min) workflows or websockets.
6. Contractual requirement for VPC isolation or private connectivity.

---

## SOURCE: Builder\AWS-Architecture\06-Phase1-Execution-Plan.md

# Phase 1 â€” Execution Plan (AWS Services + CLI)

> **Execution status:** I have **not** executed any AWS commands. All commands below are written to [scripts/](scripts) for human review. Approve, then run as a human or via CI.
>
> Region is locked to `us-west-1`. Every command sets `--region us-west-1` explicitly.
>
> Replace `{ACCOUNT_ID}` with your AWS account ID and `{ENV}` with `sandbox` or `prod`.

---

## Service Inventory (Phase 1)

| # | Service | Purpose | Phase | Now or Future | Cost Risk | Scriptable | Manual Steps | Validation |
|---|---|---|---|---|---|---|---|---|
| 1 | **S3 buckets** (`hhc-{env}-{acct}-us-west-1`, `hhc-logs-{acct}-us-west-1`) | Evidence + access logs | 1 | Now | Low | Yes | None | `aws s3api head-bucket` |
| 2 | **KMS CMK** `alias/hhc-evidence`, `alias/hhc-data` | At-rest encryption for S3 + DDB | 1 | Now | Low | Yes | Approve key policy | `aws kms describe-key` |
| 3 | **DynamoDB table** `compliance_objects` | Single-table metadata | 1 | Now | Low | Yes | None | `aws dynamodb describe-table` |
| 4 | **IAM roles** per Lambda + a `hhc-break-glass` role | Least privilege | 1 | Now | Low | Yes | None | `aws iam get-role` |
| 5 | **Lambda functions** (`upload-init`, `upload-validate`, `upload-promote`, `file-list`, `file-download`, `export-builder`, `esign-callback`) | API handlers | 1 | Now | Low | Yes | Provide deployment package | `aws lambda invoke` |
| 6 | **API Gateway HTTP API** `hhc-api` | Public ingress | 1 | Now | Low | Yes | Custom domain optional | `curl` smoke test |
| 7 | **CloudWatch Log Groups** `/aws/lambda/hhc-*` | Logs + metric filters | 1 | Now | Low | Yes | None | `aws logs describe-log-groups` |
| 8 | **AWS Budgets** `hhc-monthly-budget` | $50 soft / $150 hard | 1 | Now | Low | Yes | Confirm SNS email | View in console |
| 9 | **EventBridge bus** `hhc-events` | Future fan-out | 1 | **Placeholder** | Low | Yes | None | `aws events describe-event-bus` |
| 10 | **Cognito user pool** `hhc-users` | Future user auth | 1 | **Placeholder** | Low | Yes | App client config later | `aws cognito-idp describe-user-pool` |
| 11 | **SNS topic** `hhc-alerts` | Alarm + budget notifications | 1 | Now | Low | Yes | Confirm subscriptions | `aws sns list-subscriptions-by-topic` |

### Required IAM permissions for the operator running the script

The principal executing the setup needs (at minimum) the following actions in `us-west-1`:

```
s3:CreateBucket, s3:Put*, s3:GetBucket*, s3:PutBucketPolicy
kms:CreateKey, kms:CreateAlias, kms:PutKeyPolicy, kms:DescribeKey
dynamodb:CreateTable, dynamodb:UpdateContinuousBackups, dynamodb:DescribeTable
iam:CreateRole, iam:PutRolePolicy, iam:AttachRolePolicy, iam:PassRole
lambda:CreateFunction, lambda:UpdateFunctionCode, lambda:UpdateFunctionConfiguration, lambda:AddPermission
apigatewayv2:Create*, apigatewayv2:Update*, apigatewayv2:Get*
logs:CreateLogGroup, logs:PutRetentionPolicy, logs:PutMetricFilter
events:CreateEventBus, events:DescribeEventBus
cognito-idp:CreateUserPool, cognito-idp:CreateUserPoolClient
sns:CreateTopic, sns:Subscribe
budgets:CreateBudget, budgets:CreateNotification
```

Recommend running this from a dedicated `hhc-bootstrap` IAM role, not a root user.

---

## Execution Order (dependency-correct)

1. KMS keys
2. S3 buckets (logs first, then sandbox/prod)
3. DynamoDB table
4. SNS topic + subscription
5. CloudWatch log groups
6. IAM roles (one per Lambda)
7. Lambda functions (deploy code packages from a build artifact)
8. API Gateway HTTP API + integrations + routes + stage
9. EventBridge bus (placeholder)
10. Cognito user pool (placeholder)
11. Budgets

---

## CLI Scripts

The following scripts are generated for review only:

- [scripts/01-create-kms.sh](scripts/01-create-kms.sh)
- [scripts/02-create-s3.sh](scripts/02-create-s3.sh)
- [scripts/03-create-dynamodb.sh](scripts/03-create-dynamodb.sh)
- [scripts/04-create-sns-and-budgets.sh](scripts/04-create-sns-and-budgets.sh)
- [scripts/05-create-iam-roles.sh](scripts/05-create-iam-roles.sh)
- [scripts/06-create-lambdas.sh](scripts/06-create-lambdas.sh)
- [scripts/07-create-api-gateway.sh](scripts/07-create-api-gateway.sh)
- [scripts/08-create-eventbridge-cognito.sh](scripts/08-create-eventbridge-cognito.sh)
- [scripts/99-validate.sh](scripts/99-validate.sh)
- [scripts/policies/](scripts/policies) â€” IAM and bucket policy JSON

> **Run order:** scripts are numbered. They are **idempotent-safe via name checks** but are intentionally not destructive. None of them deletes resources. None of them creates EC2, RDS, NAT, OpenSearch, or EKS.

---

## Manual Steps After Script Run

1. **Confirm SNS subscription** clicked in email.
2. **Upload Lambda deployment packages** to the functions (the script creates the function shells; CI/CD or a separate `aws lambda update-function-code` deploys real code).
3. **Configure custom domain** for API Gateway (optional, requires ACM cert in `us-west-1`).
4. **Cognito app client** configuration after frontend is ready.
5. **Enable Object Lock** on `prod` bucket for `evidence/`, `audit/`, `esign/` prefixes (one-time, irreversible â€” done deliberately by a human).

---

## Validation Plan

After execution, run `scripts/99-validate.sh` which performs:

- `aws s3api head-bucket` for both buckets
- `aws s3api get-bucket-versioning` (expects `Enabled`)
- `aws s3api get-bucket-encryption` (expects KMS)
- `aws s3api get-public-access-block` (expects all true)
- `aws dynamodb describe-table` (expects `ACTIVE`, PITR `ENABLED`)
- `aws lambda list-functions` filter for `hhc-`
- `aws apigatewayv2 get-apis` filter for `hhc-api`
- A round-trip smoke test:
  1. `POST /uploads/init` with sample triplet â†’ expect `presigned_put_url`
  2. `curl -X PUT` of a 1-byte file
  3. `POST /uploads/{upload_id}/validate` â†’ expect `VALIDATED`
  4. `POST /uploads/{upload_id}/promote` â†’ expect `PROMOTED`
  5. `GET /events/{event_id}/files` â†’ expect 1 evidence record
  6. `GET /files/{evidence_id}/download` â†’ expect presigned GET that returns 1 byte

---

## Direct Execution Capability

**Can I execute via AWS CLI directly?** Only if you connect AWS credentials to this session and explicitly approve. By default, **I will not run AWS commands.** You will run the reviewed scripts yourself, or wire them into your CI/CD.

When/if executing on your behalf, the rules are:

- `--region us-west-1` only.
- Print every command before running.
- Print resource ARN/name and a one-line validation result after each command.
- Never delete resources.
- Stop and ask before any service flagged Medium/High cost risk (none in Phase 1).

---

## SOURCE: Builder\AWS-Architecture\07-Phase2-Execution-Plan.md

# Phase 2 â€” Execution Plan (AWS Services Inventory)

> **Design only.** No CLI scripts are emitted for Phase 2 in this iteration. Phase 2 should be authored as Terraform (or CDK) in a separate repo with state in S3 + DDB lock. CLI bootstrapping a VPC and ECS by hand is an anti-pattern.

---

## Service Inventory (Phase 2)

| # | Service | Purpose | Now or Future | Cost Risk | Scriptable | Manual Steps | Validation |
|---|---|---|---|---|---|---|---|
| 1 | **VPC** `hhc-vpc` (10.40.0.0/16) | Network boundary | Now (Phase 2) | Low | Yes (IaC) | None | `aws ec2 describe-vpcs` |
| 2 | **Subnets** (2 public, 2 app, 2 data) | AZ isolation | Now | Low | Yes | None | `describe-subnets` |
| 3 | **Internet Gateway** | Public ingress for ALB/NAT | Now | Low | Yes | None | `describe-internet-gateways` |
| 4 | **NAT Gateway** (start with 1, HA later) | Egress for private subnets | Now | **Medium** | Yes | Approve cost | `describe-nat-gateways` |
| 5 | **Route tables** | Subnet routing | Now | Low | Yes | None | `describe-route-tables` |
| 6 | **VPC Endpoints** (Gateway: S3, DynamoDB; Interface: KMS, SM, Logs, SSM, ECR, STS) | Private AWS access | Now | **Medium** (interface endpoints ~$7.30 ea) | Yes | None | `describe-vpc-endpoints` |
| 7 | **Security Groups** (`alb-sg`, `app-sg`, `data-sg`) | L4 controls | Now | Low | Yes | None | `describe-security-groups` |
| 8 | **ACM Certificate** (us-west-1) | TLS for ALB | Now | Low | Yes | DNS validation manual | `describe-certificate` |
| 9 | **ALB** `hhc-alb` (internal) | L7 ingress to ECS | Now | **Medium** (~$22+LCU) | Yes | None | `describe-load-balancers` |
| 10 | **WAF Web ACL** (managed rules + custom) | App-layer protection | Now | Lowâ€“Medium | Yes | None | `get-web-acl` |
| 11 | **ECR repositories** | Container images | Now | Low | Yes | None | `describe-repositories` |
| 12 | **ECS Cluster** `hhc-fargate` | Compute | Now | **Medium** | Yes | None | `describe-clusters` |
| 13 | **ECS Task Definitions + Services** (api, validator, workflow, esign-ingest, export, audit-collector) | Workloads | Now | **Medium** | Yes | None | `describe-services` |
| 14 | **(Alt) EC2 Ubuntu 24.04 ASG** | Specialty workloads only | **Future / Optional** | **High** if always-on | Yes | AMI baking via Image Builder | `describe-auto-scaling-groups` |
| 15 | **Systems Manager** (Session Manager, Patch Manager, Parameter Store) | Access + patching + config | Now | Low | Yes | None | `start-session` test |
| 16 | **KMS CMKs** (`hhc-evidence`, `hhc-data`, `hhc-ebs`, `hhc-secrets`) | Encryption | Now | Low | Yes | Approve key policies | `describe-key` |
| 17 | **Secrets Manager** secrets (`hhc/ecign/api`, `hhc/api/hmac`, etc.) | Secret storage + rotation | Now | Low | Yes | Provide initial values | `describe-secret` |
| 18 | **CloudTrail** (org-trail to logs account, multi-region read, log file validation) | Control-plane audit | Now | Low | Yes | Org structure first | `get-trail-status` |
| 19 | **AWS Config** + conformance pack `hhc-hipaa` | Compliance baseline | Now | Lowâ€“Medium | Yes | None | `describe-config-rules` |
| 20 | **GuardDuty** | Threat detection | Now | Medium (volume-based) | Yes | None | `get-detector` |
| 21 | **Security Hub** (CIS AWS Foundations + AWS Foundational Best Practices) | Findings aggregator | Now | Low | Yes | None | `describe-hub` |
| 22 | **Inspector** (EC2 + ECR scans) | Vulnerability scanning | Now | Lowâ€“Medium | Yes | None | `describe-coverage` |
| 23 | **CloudWatch Logs + Alarms + Dashboards** | Observability | Now | Medium (ingestion) | Yes | Tune retention | `describe-alarms` |
| 24 | **AWS Backup** vaults (`hhc-vault`) with vault lock (governance) | Backup + retention | Now | Lowâ€“Medium | Yes | Vault lock confirm | `describe-backup-vault` |
| 25 | **Aurora Serverless v2 (PostgreSQL)** in `data-*` subnets | Reporting read model | **Future / Optional** | **Mediumâ€“High** | Yes | Justify before enabling | `describe-db-clusters` |
| 26 | **API Gateway (retain as edge)** + VPC Link | Public ingress proxy | Now (recommended) | Low | Yes | None | `get-apis` |
| 27 | **Cognito user pool** (advanced security ON) + IdP federation | End-user identity | Now | Low | Yes | IdP metadata | `describe-user-pool` |

---

## Phase 2 Cost-Sensitive Items (require explicit approval before creation)

- NAT Gateway (especially HA across 2 AZs)
- 8Ã— Interface VPC Endpoints (offset by NAT savings â€” quantify before final number)
- ALB
- ECS Fargate baseline (always-on)
- Aurora Serverless v2 (only when justified)
- GuardDuty / Security Hub / Inspector (compliance-driven; usually justified)
- CloudWatch Logs ingestion volume (apply retention + sampling)

---

## Phase 2 IAM (operator)

Phase 2 should be deployed by a CI role assuming a per-account `hhc-deploy` role with `AdministratorAccess` scoped via SCPs to:

- `us-west-1` only.
- Deny `ec2:RunInstances` for instance types outside an approved list.
- Deny creating internet-facing ALBs/NLBs (only internal).
- Deny disabling CloudTrail, Config, GuardDuty.

---

## Phase 2 Validation Checklist (post-deploy)

- All Config rules return COMPLIANT for the `hhc-hipaa` pack.
- GuardDuty has zero High findings for 7 days.
- Inspector shows zero Critical CVEs in `hhc/*` ECR images.
- ALB shows healthy targets across 2 AZs.
- SSM Session Manager session opens to a Fargate task via `ECS Exec`.
- A `s3:PutObject` from inside a task succeeds via the **gateway endpoint** (verify VPC Flow Logs show no NAT egress for S3).
- Backup vault shows successful daily DDB and EBS recovery points.
- WAF blocks a synthetic SQLi probe.

---

## SOURCE: Builder\AWS-Architecture\08-eCign-Integration.md

# eCign Integration (Both Phases)

## Non-Negotiable Rules

1. **eCign artifacts NEVER bypass the evidence pipeline.** Signed PDFs and signature manifests land in S3 under the same triplet-keyed prefix as any other evidence.
2. **Mandatory mapping** on every signed artifact:
   - `policy_id`
   - `workflow_id`
   - `event_id`
   - `form_id`
3. **Signature metadata recorded** in `compliance_objects`.
4. **Audit trail row written** for every state change (`PENDING` â†’ `SIGNED` / `DECLINED` / `EXPIRED`).

---

## Object Identity & S3 Layout

```
esign/{policy_id}/{workflow_id}/{event_id}/{form_id}/{signature_packet_id}/
  â”œâ”€â”€ envelope.json            # vendor manifest (canonicalized)
  â”œâ”€â”€ signed.pdf               # signed document (final)
  â”œâ”€â”€ certificate-of-completion.pdf
  â””â”€â”€ signers/{signer_id}.json # per-signer evidence
```

All objects are **SSE-KMS** encrypted with `alias/hhc-evidence` and (in prod) protected by **S3 Object Lock Compliance mode**.

---

## DynamoDB Records

| Purpose | pk | sk | Key fields |
|---|---|---|---|
| Signature packet header | `ESIGN#{signature_packet_id}` | `EVENT#{event_id}#FORM#{form_id}` | `status`, `vendor`, `envelope_id`, `policy_id`, `workflow_id`, `event_id`, `form_id`, `signers[]`, `created_at`, `updated_at` |
| Evidence row for signed PDF | `EVENT#{event_id}` | `EVIDENCE#{evidence_id}` | normal evidence row + `signature_status=SIGNED`, `signature_packet_id` |
| Cross-cut: form view | `FORM#{form_id}` | `EVENT#{event_id}#EVIDENCE#{evidence_id}` | GSI projection |
| Audit | `AUDIT#{event_id}` | `{ISO_TS}#{audit_id}` | `actor=ecign`, `action=SIGN_COMPLETED`, etc. |

---

## Phase 1 â€” Lambda `esign-callback` Flow

```
Vendor (eCign) â”€â”€â–º API Gateway POST /esign/callback
                     â”‚
                     â”‚ HMAC-SHA256(body, X-Timestamp) verified
                     â”‚ Replay nonce checked in DDB (pk=ESIGN_NONCE#{n})
                     â”‚ IP allow-list enforced
                     â–¼
                 Lambda esign-callback
                     â”‚ 1. Resolve packet â†’ look up DDB ESIGN# row by envelope_id
                     â”‚ 2. Validate triplet present in stored packet
                     â”‚ 3. Pull signed PDF from vendor (server-side, no client involvement)
                     â”‚ 4. Compute SHA-256
                     â”‚ 5. PutObject to s3://hhc-prod/.../esign/{...}/signed.pdf  (SSE-KMS)
                     â”‚ 6. Create EVIDENCE row + projections
                     â”‚ 7. Append AUDIT row
                     â”‚ 8. (placeholder) Put event onto EventBridge bus hhc-events
                     â–¼
                 Return 200 { "status": "RECEIVED" }
```

If any step fails, **return 5xx so the vendor retries** and write a `FAILED_INGEST` audit row. Do not write a partial evidence record.

---

## Phase 2 â€” `esign-ingest-svc` Flow

Same logic, but as an always-on container:

- Vendor â†’ WAF â†’ API Gateway (or ALB) â†’ `esign-ingest-svc` (private subnet).
- Outbound vendor pulls go through NAT, restricted by **prefix list** containing only the eCign vendor IP ranges.
- HMAC secret pulled from Secrets Manager at task start; rotated every 30 days.
- Same DDB + S3 writes, plus emit a `SignatureCompleted` event on EventBridge for downstream subscribers (workflow engine, notifications).

---

## Pre-Sign Initiation (Outbound to eCign)

Triggered when a workflow step says "request signature":

1. `workflow-engine` (Phase 2) or a `esign-init` Lambda (if added to Phase 1) creates a `signature_packet_id` (ULID) and writes `ESIGN#...` row with `status=PENDING`.
2. Calls eCign API to create envelope, passing `signature_packet_id` as the **vendor envelope's external reference** so the callback can resolve it.
3. Persists the source form PDF under `forms/{policy_id}/{workflow_id}/{event_id}/{form_id}/source.pdf` first â€” this guarantees we always have the *unsigned* original even if signing never completes.
4. Audit row: `action=SIGN_REQUESTED`.

---

## Failure & Edge Cases

| Case | Handling |
|---|---|
| Vendor sends callback for unknown envelope | 404, audit `UNKNOWN_ENVELOPE` |
| Triplet missing from packet record | 422, audit `BAD_TRIPLET` (should never happen â€” gate at init) |
| Duplicate callback (replay) | 200 + idempotent no-op (nonce match); audit `DUPLICATE_CALLBACK` |
| Vendor PDF download fails | Retry up to 3 with backoff; on final failure write `FAILED_INGEST` and alert |
| Signer declines | Write `signature_status=DECLINED`, keep packet, do **not** create EVIDENCE row |
| Envelope expires | Sweep job (EventBridge schedule) marks `EXPIRED`; audit row written |

---

## Surveyor Export Behavior

When `export-builder` produces a survey packet for an event, it includes:

- The signed PDF.
- The vendor `envelope.json`.
- The certificate of completion.
- The DDB `ESIGN#` record (serialized).
- Relevant `AUDIT#{event_id}` rows in chronological order.

This guarantees an auditor can reconstruct the full chain of custody from a single ZIP.

---

## SOURCE: Builder\AWS-Architecture\09-MVP-Scope-and-Timeline.md

# MVP Scope and Recommended Timeline

## MVP Scope (Phase 1)

### In scope

- Single AWS account, `us-west-1` only.
- S3 sandbox + prod buckets with the prefix model and lifecycle rules.
- DynamoDB `compliance_objects` single-table with the documented access patterns and 2 GSIs.
- 7 Lambda functions implementing the API contract.
- API Gateway HTTP API with JWT (Cognito) authorizer placeholder; closed-pilot uses an internal API key.
- CloudWatch logs + the alarm set in Â§6 of Phase 1.
- AWS Budgets + SNS alerts.
- EventBridge bus + Cognito user pool created as **placeholders** (no rules / no app clients).
- eCign callback endpoint with HMAC + replay nonce + audit.
- Survey-packet export to S3 (`exports/yyyy/mm/dd/...zip`).

### Explicitly out of scope (deferred)

- VPC, NAT, EC2, ECS, EKS, RDS, OpenSearch.
- Cross-region replication.
- Object Lock Compliance mode (intentionally enabled later, by a human, after PHI gating).
- External IdP federation.
- Real-time search across evidence text.
- In-product analytics dashboards (consume exports for now).

### Definition of Done

The 7-step round-trip in [06-Phase1-Execution-Plan.md](06-Phase1-Execution-Plan.md#validation-plan) succeeds in the sandbox bucket and again in the prod bucket, plus:

- Triplet enforcement rejects malformed requests with 422.
- Audit rows exist for every state transition.
- Budgets alarm fires when manually triggered.
- Break-glass role assumption fires a CloudWatch alarm.

---

## Recommended Sequence (Phase 1)

> Times intentionally omitted; treat as a dependency-ordered backlog.

1. **Foundations**
   - KMS keys, SNS, Budgets, log groups.
2. **Storage**
   - S3 buckets (logs, sandbox, prod), versioning, encryption, public access block, lifecycle, deny-delete policy.
3. **Data**
   - DynamoDB table + GSIs + PITR + Streams.
4. **Identity & roles**
   - Per-Lambda IAM roles, break-glass role, deploy role.
5. **Compute**
   - Lambda function shells + first deploy from build artifact.
6. **Edge**
   - API Gateway HTTP API, integrations, routes, stage `v1`.
7. **Placeholders**
   - EventBridge bus, Cognito user pool.
8. **Validation**
   - Run `scripts/99-validate.sh`; complete the round-trip; sign off.
9. **Pilot enablement**
   - Object Lock on prod (manual, irreversible).
   - Cognito app client + frontend wire-up.
   - Vendor-facing eCign callback enabled.

---

## Recommended Sequence (Phase 2 â€” only after MVP is stable)

1. Org structure + accounts (`prod`, `nonprod`, `security`, `logs`).
2. CloudTrail org-trail, Config, GuardDuty, Security Hub, Inspector.
3. VPC + endpoints + subnets + routing.
4. ECR + ECS cluster + ALB + WAF.
5. Service-by-service strangler migration per [04-Migration-Phase1-to-Phase2.md](04-Migration-Phase1-to-Phase2.md).
6. AWS Backup, vault lock, cross-region replication for evidence/audit/esign.
7. (Optional) Aurora Serverless v2 reporting layer.
8. Decommission Phase 1 Lambdas.

---

# PART 2 — SUPPORTING AWS DOCUMENTATION

## SOURCE: Builder\Documentations\AWS_Phase1_Foundation_Build_Plan.md

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

---

## SOURCE: Builder\Documentations\App_Component_Documentation\aws-phase1-component-mapping.md

# AWS Phase 1 Component Mapping

**Date:** 2026-04-23
**Scope:** Maps every major app component to its current implementation state and the AWS Phase 1 target architecture. No backend AWS code is implemented in the repo yet â€” all AWS-side items are PLANNED documentation unless explicitly noted.

---

## Legend

| Status | Meaning |
|---|---|
| `NOT STARTED` | Exists as local/static/localStorage prototype; no AWS work begun |
| `IN PROGRESS` | AWS work is under active design or partial scaffolding |
| `IMPLEMENTED` | Component is running against real AWS backend |

All AWS-side items are **NOT STARTED** unless noted otherwise.

---

## Full Component â†’ AWS Phase 1 Mapping Table

| Component / Module | Current State | AWS Phase 1 Target | AWS Services | Status |
|---|---|---|---|---|
| `regulatoryExecutionStore` | Zustand + localStorage (`reg-execution-v2`). Single-browser scope. | API-backed persistence per authenticated user/session. State writes call Lambda; reads hydrate from DynamoDB. | DynamoDB (`compliance_objects` table), Lambda `workflow-runner`, API Gateway | NOT STARTED |
| Regulatory event catalog (`regulatoryEvents.ts`, `mandatedEventsExpanded.ts`) | Static TS datasets bundled at build time. No runtime update path. | EventBridge Scheduler triggers `mandated-event-generator` Lambda to write canonical event items; frontend reads from Lambda `metadata-api`. | DynamoDB (`WORKFLOW#` / `EVENT#` item patterns), EventBridge Scheduler, Lambda `mandated-event-generator` | NOT STARTED |
| Calendar sync (`server/sync/eventSync.ts`) | Express-based Google Calendar push/pull. Filesystem audit log. JSONL under `.cache/audit/`. | Serverless calendar integration or direct DynamoDB event writes; audit stream to S3 `prod/audit/` prefix. | Lambda, S3 audit prefix, DynamoDB audit items | NOT STARTED |
| Workflow library (compiled, `workflows.generated.ts`) | Static generated TS. Updated by `scripts/compileWorkflows.ts` at dev time. | Workflow metadata served from DynamoDB; workflow execution state tracked per event/user. | DynamoDB workflow items, Lambda `workflow-runner` | NOT STARTED |
| `policyStore` (draft/review/publish lifecycle) | Zustand in-memory. Lifecycle mutations are client-only. No server state. | Policy metadata and lifecycle in DynamoDB. Publish pipeline writes approved policy body to S3 evidence/forms prefix. | DynamoDB (`POLICY#META`), S3 `prod/evidence/{policy_id}/` | NOT STARTED |
| `FORMS_DATASET` + `FormViewer` + print system | Static TS datasets. Print is browser-native (iframe + `window.print()`). No durable PDF generation. | Forms metadata in DynamoDB. Filled form instances saved via Lambda upload flow; generated PDFs stored in S3 `forms/` prefix. | DynamoDB form metadata items, S3 `hh-prd-forms`, Lambda `upload-init` + `upload-validate-promote` | NOT STARTED |
| Master Control Inventory | Static JSON fetched from `/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json`. | MCI records as DynamoDB items keyed `MCI#{control_id}`; served by `metadata-api` Lambda. | DynamoDB, Lambda `metadata-api` | NOT STARTED |
| Onboarding / Journey system (`journeyStore`) | Zustand + localStorage (`ci-journey-v1`). Evidence and signatures are client metadata. | API-backed progression, immutable sign-off records, evidence object store. Identity-bound via Cognito. | DynamoDB (`USER#`, `ONBOARDING#`, `SIGNOFF#`, `VISIT#`, `EVIDENCE#`), S3, Cognito | NOT STARTED |
| `DashboardPage` aggregation | Reads from multiple local Zustand stores and static event catalog. No real-time server data. | Reads from `metadata-api` Lambda which queries DynamoDB GSI1 (event-centric) for live status. | Lambda `metadata-api`, DynamoDB GSI1 | NOT STARTED |
| `AuditModePage` + audit modules | Client-side audit state classification. Export via browser download (JSON/Markdown). Enforcement audit log in localStorage. | Audit log items in DynamoDB append-only (`AUDIT#` items). Export via Lambda `export-zip` â†’ S3 `exports/` â†’ presigned GET URL. | DynamoDB audit items, Lambda `export-zip`, S3 `hh-prd-exports` | NOT STARTED |
| Brad iAdministrator (`server/ia/*`) | Local Express server + Ollama LLM. File-based IA index (`.cache/ia-index`). Session data in-process. | Lambda-backed RAG service or managed inference API. Index in S3. Session metadata in DynamoDB. | S3 index bucket, DynamoDB session items, Lambda or managed LLM endpoint | NOT STARTED |
| `/api/calendar` routes | Express router, `routes/calendar.ts`. Google Calendar integration. | API Gateway HTTP API + Lambda handler. Auth via Cognito JWT. | API Gateway, Lambda, Cognito | NOT STARTED |
| `/api/hubstaff` routes | Express proxy to Hubstaff REST API. PAT-auth. | Lambda proxy or direct webhook integration. | Lambda, API Gateway | NOT STARTED |
| `/api/ia` routes | Local Express + SSE streaming. No external auth. | API Gateway + Lambda with SSE via HTTP API streaming or WebSocket. Cognito-gated. | API Gateway (HTTP API / WebSocket), Lambda, Cognito | NOT STARTED |
| Navigation / session state (`navStore`, `useShellStore`) | Client-only Zustand stores. Not persisted to any server. | No immediate AWS requirement. Phase 1 does not require server-side session nav state. | N/A (client-only, no server target in Phase 1) | N/A |
| Evidence upload path | No blob upload exists today. `EvidenceDoc` is metadata-only in Zustand stores. | Lambda `upload-init` returns presigned PUT URL â†’ S3 sandbox upload â†’ Lambda `upload-validate-promote` copies to production bucket. | S3 `hh-sbx-uploads`, `hh-prd-evidence`, Lambda `upload-init` + `upload-validate-promote`, DynamoDB file items | NOT STARTED |
| Presigned evidence download | Not implemented. | Lambda `export-zip` / metadata-api returns short-lived presigned GET URL for each evidence file. | S3, Lambda, IAM presigned URL | NOT STARTED |
| Identity / auth | Optional shared-secret `Bearer` token on Express API. No user identity in app. | Cognito User Pool. JWT passed to API Gateway. Groups map to app roles. | Cognito User Pool + App Client, API Gateway JWT authorizer | NOT STARTED |
| Audit logging (server) | Filesystem JSONL under `.cache/audit/`. | Append-only DynamoDB `AUDIT#{event_id}` items with time-sorted SK. Optional hash chain. Lifecycle: never expire for compliance evidence. | DynamoDB, CloudWatch Logs | NOT STARTED |

---

## Identified Gaps

1. **R2 vs AWS S3 plan conflict** â€” `R2_STORAGE_ARCHITECTURE.md` describes 6 Cloudflare R2 buckets + SQL index; `AWS_Phase1_Foundation_Build_Plan.md` describes 2 AWS S3 buckets + DynamoDB. These are parallel but incompatible designs. Phase 1 must pick one. *Needs confirmation.*
2. **User profile and onboarding item patterns missing from DynamoDB model** â€” Phase 1 DynamoDB design (in `AWS_Phase1_Foundation_Build_Plan.md`) specifies `POLICY#`, `WORKFLOW#`, `EVENT#`, `FILE#`, and `AUDIT#` patterns but does not include `USER#`, `ONBOARDING#`, `SIGNOFF#`, or `VISIT#`. These need to be added before onboarding migration begins.
3. **Supervisor sign-off as DynamoDB item type** â€” No canonical item type defined for supervisor signature attestation. Currently captured in `journeyStore` as `SignatureRecord`. Must be designated as `SIGNOFF#` sub-type or folded into `EVIDENCE#`. *Needs confirmation.*
4. **`upload_sessions` secondary table** â€” Architecture diagram references `DynamoDB: upload_sessions` but the key schema for this table is not defined. Could be a second table or same-table `UPLOAD#` item pattern. *Needs confirmation.*
5. **Brad/IA migration complexity** â€” The iAdministrator system is the most complex migration because it combines local LLM (Ollama), file-based vector index, and SSE streaming. Phase 1 should defer this to a separate sub-track. Consider managed embedding API + DynamoDB/S3 index store before committing to full Lambda LLM hosting.
6. **No CI/CD pipeline for Lambda deploys defined** â€” Phase 1 docs describe architecture but no deployment pipeline is specified. *Needs confirmation.*

---

## Component Dependencies (implementation ordering)

Phase 1 must proceed in this order to avoid blocking dependencies:

```
1. Identity (Cognito)
   â””â”€â–º All other components depend on authenticated user identity

2. DynamoDB table + GSI design
   â””â”€â–º Required before any Lambda can write items

3. API Gateway + Lambda baseline (metadata-api)
   â””â”€â–º Foundation for all frontend API calls

4. Evidence upload path (upload-init + upload-validate-promote)
   â””â”€â–º Needed before regulatory event execution can store real evidence

5. Regulatory event catalog migration
   â””â”€â–º Seeds DynamoDB; enables live event-centric queries

6. regulatoryExecutionStore â†’ API-backed
   â””â”€â–º Replaces localStorage execution state; depends on event catalog items

7. AuditModePage â†’ server-side audit log
   â””â”€â–º Depends on DynamoDB audit items being written by Lambda

8. Onboarding / Journey â†’ API-backed
   â””â”€â–º Depends on identity (Cognito) + evidence upload path + DynamoDB user items

9. policyStore â†’ API-backed
   â””â”€â–º Can proceed in parallel with items 5â€“8 once DynamoDB is ready

10. Brad iAdministrator â†’ deferred to Phase 1b or Phase 2
    â””â”€â–º Highest complexity; local Ollama model replacement requires separate planning
```

---

## Required Implementation Order (Priority List)

| Priority | Component | Blocking Dependency | Estimated Complexity |
|---|---|---|---|
| 1 | Cognito identity + JWT auth | None | Medium |
| 2 | DynamoDB table + GSI design | Cognito | Low |
| 3 | Lambda `metadata-api` | DynamoDB | Medium |
| 4 | Lambda `upload-init` + `upload-validate-promote` | DynamoDB + S3 | High |
| 5 | Regulatory event catalog in DynamoDB | `metadata-api` | Medium |
| 6 | `regulatoryExecutionStore` â†’ API | Event catalog | High |
| 7 | Audit log (DynamoDB `AUDIT#`) | Lambda + DynamoDB | Medium |
| 8 | Onboarding / Journey state â†’ API | Identity + upload path | High |
| 9 | `policyStore` â†’ API | DynamoDB + `metadata-api` | Medium |
| 10 | Forms filled-instance storage | Upload path | Medium |
| 11 | Export-zip Lambda | Audit + evidence | Medium |
| 12 | Brad IA migration | All above stable | Very High |

---

## Alignment Notes

- The current frontend app is a **rich client prototype** with Zustand stores, static TS data, and a narrow local Express backend. All AWS Phase 1 targets are additive; the prototype continues to function as the client.
- No existing source files are deleted in Phase 1. API calls are layered in as store action replacements.
- `navStore` and shell state stores are **client-only** and have no AWS Phase 1 impact.
- Docs above reflect confirmed architectural intent from `AWS_Phase1_Foundation_Build_Plan.md` and `R2_STORAGE_ARCHITECTURE.md`. Differences between the two docs are flagged in the Gaps section above.

---

## SOURCE: Builder\Brad2-Business-Risk-Architecture\02-Environment-Architecture.md

# 02 â€” Environment Architecture

**Document:** Target Production Architecture, Security Zones, Trust Boundaries, PHI Flows
**Scope:** Brad.pi self-hosted Linux + GPU + Docker + Local Qwen LLM
**Audience:** Security architects, auditors, platform engineers

---

## 2.1 Architectural Overview

Brad.pi is composed of **seven security zones** with strictly mediated crossings. No zone trusts another by default; all crossings authenticate (mTLS), authorize (OPA / RBAC), and log (append-only audit).

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚                  CARE INDEED PERIMETER                  â”‚
                    â”‚                                                         â”‚
   Remote User â”€â”€â”€â–º â”‚  Z0  Edge / VPN  (WireGuard, FIDO2, device cert)        â”‚
                    â”‚            â”‚                                            â”‚
                    â”‚            â–¼                                            â”‚
                    â”‚  Z1  Reverse Proxy / Auth (Caddy + OIDC + mTLS term.)   â”‚
                    â”‚            â”‚                                            â”‚
                    â”‚            â–¼                                            â”‚
                    â”‚  Z2  Application Tier (Brad API, RBAC, approval engine) â”‚
                    â”‚            â”‚            â–²                               â”‚
                    â”‚            â–¼            â”‚                               â”‚
                    â”‚  Z3  Inference Tier  Z4 Retrieval Tier                  â”‚
                    â”‚  (Qwen vLLM, GPU)    (vector DB, rerank, policy corpus) â”‚
                    â”‚            â”‚            â”‚                               â”‚
                    â”‚            â–¼            â–¼                               â”‚
                    â”‚  Z5  PHI Data Plane  (Postgres, MinIO PHI bucket)       â”‚
                    â”‚                                                         â”‚
                    â”‚  Z6  Audit / Logging Plane  (WORM MinIO, Wazuh SIEM)    â”‚
                    â”‚                                                         â”‚
                    â”‚  Z7  Admin / Management  (jump host, secrets, backup)   â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚  ISOLATED â€” NON-PHI MARKETING / COMFYUI ZONE (Z-NPHI)   â”‚
                    â”‚  Separate VLAN, separate GPU host, separate storage,    â”‚
                    â”‚  no route to Z2-Z6, no shared secrets, no shared FS     â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 2.2 Security Zones

| Zone | Name | Purpose | Trust Level | Network |
|---|---|---|---|---|
| **Z0** | Edge / VPN | WireGuard tunnel termination, device cert validation | Untrusted | 10.10.0.0/24 |
| **Z1** | Reverse Proxy / Auth | TLS termination, OIDC, mTLS to Z2 | Low | 10.20.0.0/24 |
| **Z2** | Application | Brad API, RBAC, approval engine, job orchestrator | Medium | 10.30.0.0/24 |
| **Z3** | Inference | Qwen LLM on GPU (vLLM), prompt logger | High | 10.40.0.0/24 |
| **Z4** | Retrieval | Vector DB (Qdrant), reranker, policy corpus (read-only) | High | 10.41.0.0/24 |
| **Z5** | PHI Data Plane | Postgres (PHI), MinIO PHI bucket, encrypted volumes | Highest | 10.50.0.0/24 |
| **Z6** | Audit/Logging | WORM MinIO, Wazuh SIEM, hash-chain verifier | Highest (integrity) | 10.60.0.0/24 |
| **Z7** | Admin / Mgmt | Jump host, Vault, backup orchestrator | Highest (privilege) | 10.70.0.0/24 |
| **Z-NPHI** | Marketing / ComfyUI | Non-PHI media generation | Isolated | 10.90.0.0/24 (separate VLAN, no L3 route to PHI zones) |

---

## 2.3 Components

### 2.3.1 Edge / VPN (Z0)
- **WireGuard** server, FIDO2 device attestation required for tunnel auth.
- Per-user, per-device peer config issued via signed enrollment workflow.
- Split-tunnel **disabled**; full tunnel for the duration of session.
- VPN logs to Z6 over one-way syslog.

### 2.3.2 Reverse Proxy / Auth (Z1)
- **Caddy 2** with internal CA-issued TLS, automatic certificate rotation.
- **OIDC** front-door (Authentik or Keycloak) bound to FIDO2 + TOTP fallback (TOTP only with HSM-backed seed).
- Issues short-lived (15 min) signed JWT to Z2.
- Strict route allowlist; no proxy_pass to inference (Z3) directly.

### 2.3.3 Application Tier (Z2)
- **Brad API** (Node/Python) â€” REST + WebSocket.
- **RBAC engine** with roles: `Admin`, `DON`, `QA`, `Compliance`, `IT`, `Auditor`, `ReadOnlyClinical`.
- **Approval Engine**: two-person rule for any PIP / corrective action / chart write.
- **Job Orchestrator**: queues chart review jobs to Z3 with rate limits.
- **Policy Decision Point (OPA)** evaluates every action against signed policy bundle.

### 2.3.4 Inference Tier (Z3)
- **vLLM** serving Qwen, **dedicated GPU node**, no co-tenancy with non-PHI.
- One **worker process per session**, killed at session end â†’ forces VRAM reclaim.
- `cudaMemset` of allocator pools on worker recycle.
- KV-cache disabled across users; no cross-session prompt caching.
- Prompt + output captured to Z6 audit (PHI-tagged, encrypted at rest).
- No outbound internet; egress firewall = DROP all.

### 2.3.5 Retrieval Tier (Z4)
- **Qdrant** vector DB, policy corpus mounted **read-only**.
- Reranker (cross-encoder) on CPU.
- No write path from Z3/Z2 except via signed corpus update job from Z7 with checksum manifest.

### 2.3.6 PHI Data Plane (Z5)
- **PostgreSQL 16** with TDE (LUKS at rest + pgcrypto for column-level on identifiers).
- **MinIO** PHI bucket with server-side encryption (SSE-KMS via Vault transit).
- All connections **mTLS only**; client cert pinned per service.
- Row-level security for tenant/site separation.

### 2.3.7 Audit / Logging (Z6)
- **MinIO with object-lock (WORM)**, retention = 7 years (HIPAA), governance mode locked.
- **Hash-chain ledger**: each log batch contains SHA-256 of previous batch; root anchored hourly to a separate offline notary (USB HSM at admin workstation).
- **Wazuh SIEM** ingests syslog, auditd, Falco, Docker events, OPA decisions, app audit.
- Alerts mirrored to PagerDuty-equivalent on-prem (e.g., ntfy) AND offsite SMS gateway.

### 2.3.8 Admin / Management (Z7)
- **Hashicorp Vault** with auto-unseal via Shamir + 3-of-5 operator quorum.
- **Backup orchestrator**: Restic to encrypted offline LTO + secondary encrypted MinIO at a different physical site.
- **Jump host** (bastion): SSH FIDO2 only, session recorded (asciinema + auditd).
- No direct admin connections to Z3/Z5 except via jump host.

### 2.3.9 Non-PHI Marketing / ComfyUI (Z-NPHI)
- Separate physical host or strictly separate VM with **PCIe passthrough** to its own GPU.
- Separate VLAN, separate switch port, **no route** in router ACL to 10.30â€“10.70 ranges.
- Separate identity store; admin must explicitly switch context.
- Storage is local to Z-NPHI; no shared NFS/SMB with PHI zones.

---

## 2.4 Trust Boundaries

| Boundary | Crossing Control |
|---|---|
| Internet â†’ Z0 | WireGuard handshake + device cert; UDP only on configured port; rate-limited |
| Z0 â†’ Z1 | mTLS + OIDC session |
| Z1 â†’ Z2 | mTLS + signed JWT (15-min TTL) + OPA decision |
| Z2 â†’ Z3 | mTLS, signed inference request envelope, per-session token |
| Z2 â†’ Z4 | mTLS, read-only API |
| Z2 â†’ Z5 | mTLS, RLS-bound DB user, parameterized queries only |
| Z3 â†’ Z6 | One-way syslog over mTLS (UDPâ†’TCP relay), no return path |
| Z7 â†’ all | Jump host only, FIDO2, session recorded |
| Z-NPHI â†” PHI zones | **No route. Physical/L2 separation.** |

---

## 2.5 PHI Data Flows

### Flow A â€” Chart Review Request (read-only reasoning)
```
User (Z0) â†’ VPN â†’ Caddy (Z1) â†’ Brad API (Z2)
   â†’ OPA check â†’ Job Queue â†’ Inference Worker (Z3)
   â†’ Retrieval read-only fetch from Qdrant + Postgres (Z4/Z5, mTLS)
   â†’ LLM reasoning (Z3, dedicated worker, VRAM scoped)
   â†’ Findings JSON â†’ Brad API (Z2) â†’ User UI
   â†’ Audit entry â†’ Z6 (WORM)
```
**Properties:** No write to Z5. Worker recycled after session. Findings include evidence pointers (chart line, policy section) for explainability.

### Flow B â€” Corrective Action / PIP Execution (write, governed)
```
DON proposes PIP in UI â†’ Brad API (Z2)
   â†’ OPA policy check (deterministic)
   â†’ Approval Engine: requires 2-person sign-off (DON + Compliance)
   â†’ Signed envelope â†’ Write Broker (Z2) â†’ Z5 with append-only PIP table
   â†’ Audit entry â†’ Z6 (WORM)
```
**Properties:** LLM never executes. Two-person rule enforced server-side. Every approval is logged with FIDO2 attestation.

### Flow C â€” Audit Read (Auditor Role)
```
Auditor (Z0) â†’ VPN â†’ Caddy (Z1) â†’ Brad API (Z2, Auditor role)
   â†’ Read-only audit query â†’ Z6 with hash-chain verification
   â†’ Result rendered with chain proof
```
**Properties:** Auditor role cannot write anywhere. All auditor reads are themselves logged.

---

## 2.6 Critical Assets

| Asset | Location | Sensitivity |
|---|---|---|
| PHI charts / patient identifiers | Z5 (Postgres, MinIO PHI) | **Highest** |
| Audit ledger | Z6 (WORM MinIO) | **Highest (integrity)** |
| Vault unseal keys | Offline, 3-of-5 quorum | **Highest** |
| Qwen model weights | Z3 read-only volume | High (IP) |
| Policy corpus | Z4 read-only | High |
| Backups | LTO offline + offsite MinIO | **Highest** |
| Service mTLS certs | Vault PKI, short-lived | High |
| Admin FIDO2 keys | Physical custody of named admins | **Highest** |

---

## 2.7 Privileged Operations (Require Two-Person + Audit)

- PIP creation / approval / execution
- Corrective action execution
- Chart write-back
- Policy corpus update
- Model weight update
- Vault unseal / rekey
- Backup restore
- User role assignment changes (Admin and above)
- Firewall / network ACL change
- Container image deploy (signed manifest required)

---

## 2.8 Read-Only vs Write Paths

| Path | Mode | Enforcement |
|---|---|---|
| LLM â†’ PHI corpus | Read-only | DB user has only `SELECT`; mount is `ro` |
| LLM â†’ policy corpus | Read-only | Filesystem `ro,nosuid,nodev` |
| Brad API â†’ PHI write | Write via broker only | Broker requires 2-person token |
| Audit log writes | Append-only | WORM object-lock + hash chain |
| Backup writes | Append-only | Restic repository in append-only mode |
| Admin â†’ host config | Write via signed Ansible only | All hosts immutable except via pipeline |

---

## 2.9 AI Authority Boundaries

| Operation | Allowed for AI? |
|---|---|
| Read PHI for reasoning | YES (within session, scoped) |
| Reason / summarize / detect deficiencies | YES |
| Recommend corrective actions | YES |
| Draft PIP text | YES |
| **Execute** PIP / corrective action | **NO â€” human approval required** |
| **Write** to chart record | **NO â€” write broker + 2-person** |
| **Approve** anything | **NO** |
| Export PHI | **NO â€” Admin + audit + DLP scan** |
| Send PHI outside Z5 | **NO â€” egress firewall blocks** |

---

## 2.10 Remote Access Design

- **WireGuard** only; no SSL VPN, no RDP gateway, no exposed RDP/SSH.
- **Device trust:** enrollment ties WireGuard peer key to a device certificate stored in TPM 2.0; device must present cert at TLS time.
- **Posture check:** on connect, a lightweight agent attests OS patch level, FDE on, antivirus current; non-compliant device is shunted to a remediation VLAN with no access.
- **Session control:** idle timeout 15 min, hard cap 8 hours, re-auth required.
- **Browser exposure:** Brad UI served only inside VPN; CSP `default-src 'self'`, no third-party scripts, SRI on all assets.
- **Admin access separation:** Admins use a dedicated admin laptop (no email, no general browsing) with separate VPN profile and FIDO2 key.
- **Remote logging:** all VPN connect/disconnect events go to Z6 with source IP, peer key fingerprint, and device cert serial.
- **Kill/revoke:** WireGuard peer revoke + Vault token revoke + OIDC session revoke can be executed from jump host in <60 seconds; documented runbook.

---

## SOURCE: Builder\Brad2-Business-Risk-Architecture\11-SaaS-Architecture-Alternatives.md

# 11 â€” SaaS Architecture Alternatives (Three Distinct Designs)

**Companion to:** [01â€“10 self-hosted Brad.pi deliverables](./README.md)
**Purpose:** Evaluate SaaS-based alternatives to the validated self-hosted Brad.pi architecture.
**Audience:** Executive sponsors, HIPAA Security Officer, Enterprise Architecture, Compliance.

---

## âš ï¸ CORE PRINCIPLE â€” READ FIRST

> **HIPAA eligibility â‰  HIPAA compliance.**
>
> A signed BAA and a "HIPAA-eligible" service tier cover **only the vendor's infrastructure and platform-level controls**. They do **not** cover:
> - how the system is designed
> - how data flows
> - how access is configured
> - how PHI is used, exposed, logged, exported, or shown to AI models
> - how custom code, custom prompts, custom integrations, or custom storage behave
>
> If the system is misconfigured, built outside the vendor's documented supported architecture, or implemented incorrectly, **the organization assumes FULL liability** â€” even if every checkbox in the vendor's "HIPAA-eligible" feature matrix is ticked.
>
> **You are only eligible for vendor coverage and protection if you stay within the platform's supported architecture. The moment you deviate, you are on your own when things fail.**

This principle is repeated in every architecture below because it determines whether the BAA actually protects you.

---

## 11.1 Architecture A â€” Salesforce Health Cloud + Agentforce + Einstein Trust Layer

### A.1 System Overview

A managed CRM-anchored platform where PHI lives in Salesforce Health Cloud, AI agents are built on Agentforce, and LLM calls are mediated by the Einstein Trust Layer (zero data retention, dynamic grounding, prompt defense).

### A.2 Core Components

| Component | Vendor | Purpose |
|---|---|---|
| Salesforce Health Cloud | Salesforce | PHI system of record (patient records, care plans) |
| Agentforce | Salesforce | Agent runtime + actions |
| Einstein Trust Layer | Salesforce | Prompt grounding, masking, ZDR LLM brokering |
| Einstein Generative AI (Atlas reasoning + partner LLMs) | Salesforce + partners | LLM inference (HIPAA-eligible only on supported tiers) |
| Salesforce Shield | Salesforce | Platform encryption, event monitoring, field audit trail |
| Salesforce MuleSoft (optional) | Salesforce | Integration to EHR / billing |
| Identity / SSO | Customer IdP via SAML/OIDC | Authentication |
| Customer-managed: data classification, sharing rules, prompt templates, custom Apex/LWC | **Customer** | **All design and config decisions** |

### A.3 Data Flow (PHI)

```
Clinician (browser, MFA via SSO)
   â†’ Salesforce Health Cloud (PHI at rest, Shield-encrypted)
   â†’ Agent invocation
   â†’ Einstein Trust Layer
       - dynamic grounding pulls only fields user has permission to see
       - PII/PHI masking before prompt leaves Trust Layer
       - prompt sent to approved LLM with ZDR
       - response defense + demasking
   â†’ response surfaced in Health Cloud UI
   â†’ audit captured in Field Audit Trail + Event Monitoring
```

### A.4 Where AI Runs
Inside Salesforce-managed LLM endpoints (Atlas reasoning engine + partner models contracted under Salesforce's BAA umbrella). The customer never controls the model host.

### A.5 Where PHI is Stored
Salesforce-managed multi-tenant cloud (US data residency, with Hyperforce region selection). Customer cannot see the underlying infrastructure.

### A.6 How Compliance is Achieved (claimed)
- Salesforce signs a BAA covering Health Cloud, Shield, Einstein Trust Layer on supported tiers.
- ZDR contractual term means model providers do not retain prompts/completions.
- Shield Platform Encryption + Field Audit Trail + Event Monitoring cover technical safeguards at the platform layer.

### A.7 Shared Responsibility â€” Architecture A

| Domain | Salesforce | Customer |
|---|---|---|
| Physical security of data centers | âœ… | â€” |
| Hypervisor / multi-tenant isolation | âœ… | â€” |
| Platform patching | âœ… | â€” |
| Encryption-at-rest infrastructure | âœ… | â€” |
| TLS termination | âœ… | â€” |
| Einstein Trust Layer masking engine | âœ… | â€” |
| LLM provider BAA chain | âœ… | â€” |
| **Org-wide sharing model** | â€” | âœ… |
| **Profile / permission set design** | â€” | âœ… |
| **Field-level security on PHI fields** | â€” | âœ… |
| **Sharing rules / role hierarchy** | â€” | âœ… |
| **Apex / LWC custom code (callouts, queries)** | â€” | âœ… |
| **Prompt templates & grounding scope** | â€” | âœ… |
| **Choice of LLM (some non-eligible)** | â€” | âœ… |
| **Connected Apps / OAuth scopes** | â€” | âœ… |
| **External integrations (MuleSoft, custom APIs)** | â€” | âœ… |
| **Data classification (which fields are PHI)** | â€” | âœ… |
| **Salesforce Reports / Dashboards exposing PHI** | â€” | âœ… |
| **Sandboxes containing real PHI** | â€” | âœ… |
| **MFA enforcement, IP allowlists** | â€” | âœ… |
| **AppExchange package risk** | â€” | âœ… |

### A.8 Where Liability Transfers vs Stays Internal

**Transferred to Salesforce (covered by BAA):**
- Datacenter, hypervisor, platform code defects in covered services on supported tiers.

**Stays internal â€” and this is most of the risk:**
- Sharing model misconfiguration
- Profile/permission/field-level security errors
- Custom Apex with insecure SOQL/queries
- Reports that expose PHI to wrong audience
- Sandboxes seeded with real PHI (extremely common audit finding)
- Prompt templates that ground on more PHI than the user role permits
- Use of an LLM not on the eligible list
- AppExchange packages with unvetted access

> âš ï¸ **HIPAA-eligibility boundary breaks if:**
> - You enable a non-eligible Einstein feature or non-eligible LLM connector
> - You install AppExchange components that process PHI without their own BAA
> - You sync PHI to a non-eligible Salesforce service (e.g., legacy Marketing Cloud edition without BAA)
> - You use Sandboxes with real PHI without sandbox masking
> - You build custom callouts that send PHI to non-BAA endpoints
>
> **In all of these, the BAA does not protect you. You assume full liability.**

---

## 11.2 Architecture B â€” Microsoft Azure HIPAA Stack (Azure OpenAI + Azure Health Data Services + Azure AD)

### B.1 System Overview

A cloud-native, customer-built application using Azure HIPAA-eligible services. Customer designs the application; Azure provides the building blocks under a BAA.

### B.2 Core Components

| Component | Vendor | Purpose |
|---|---|---|
| Azure OpenAI Service | Microsoft | LLM inference (GPT-4o / Phi / o-series) â€” **eligible** |
| Azure Health Data Services (FHIR + DICOM + MedTech) | Microsoft | PHI storage in FHIR-compliant store |
| Azure AD / Entra ID | Microsoft | Identity + Conditional Access + MFA |
| Azure Key Vault (HSM tier) | Microsoft | Key custody |
| Azure SQL / Cosmos DB | Microsoft | Application data |
| Azure Storage (blob with CMK) | Microsoft | PHI documents |
| Azure Front Door + WAF + Private Link | Microsoft | Ingress + private connectivity |
| Microsoft Sentinel | Microsoft | SIEM |
| Microsoft Defender for Cloud | Microsoft | Posture management |
| Customer application (App Service / AKS / Functions) | **Customer** | **Brad-equivalent app code** |

### B.3 Data Flow (PHI)

```
Clinician â†’ Entra ID (FIDO2) â†’ Front Door + WAF
   â†’ Private endpoint â†’ Customer app (App Service / AKS)
   â†’ FHIR Service (PHI read, RBAC + tenant scope)
   â†’ Azure OpenAI deployment (regional, no-training opt, content-filter configured)
   â†’ response â†’ app â†’ user
   â†’ audit â†’ Log Analytics â†’ Sentinel â†’ immutable storage account
```

### B.4 Where AI Runs
Azure OpenAI in a customer-selected region; **dedicated deployment** preferred to avoid shared capacity. Models do not train on prompts (per Azure OpenAI commitment).

### B.5 Where PHI is Stored
Customer's Azure tenant, FHIR Service + Storage with customer-managed keys (CMK) in Key Vault HSM.

### B.6 How Compliance is Achieved (claimed)
- Microsoft BAA covers HIPAA-eligible services list.
- Azure OpenAI is eligible; abuse-monitoring **opt-out** must be requested for additional PHI protection.
- HITRUST/SOC 2/ISO inheritance from Azure.

### B.7 Shared Responsibility â€” Architecture B

| Domain | Microsoft | Customer |
|---|---|---|
| Physical / hypervisor / OS for PaaS | âœ… | â€” |
| Platform patching for managed services | âœ… | â€” |
| Eligible service infrastructure | âœ… | â€” |
| Azure OpenAI service infrastructure | âœ… | â€” |
| Identity provider infrastructure | âœ… | â€” |
| Key custody infrastructure (HSM) | âœ… | â€” |
| **Subscription/RBAC design** | â€” | âœ… |
| **Conditional Access policies** | â€” | âœ… |
| **Network design (VNet, NSG, Private Endpoints)** | â€” | âœ… |
| **CMK rotation, Key Vault access policies** | â€” | âœ… |
| **Application code (auth checks, query scoping)** | â€” | âœ… |
| **Azure OpenAI deployment config (region, model, abuse-monitoring opt-out)** | â€” | âœ… |
| **Content filter + jailbreak protections** | â€” | âœ… |
| **Prompt design (PHI minimization)** | â€” | âœ… |
| **Logging configuration & retention** | â€” | âœ… |
| **Sentinel rules** | â€” | âœ… |
| **Backup + DR design** | â€” | âœ… |
| **Service eligibility â€” using only eligible SKUs** | â€” | âœ… |

### B.8 Where Liability Transfers vs Stays Internal

**Transferred to Microsoft:**
- Azure platform infrastructure for eligible services on supported SKUs.

**Stays internal:**
- Everything above the platform plane: identity policies, network design, app code, storage configuration, Azure OpenAI deployment options, content filter behavior, logging, prompts, retention.

> âš ï¸ **HIPAA-eligibility boundary breaks if:**
> - You use a non-eligible Azure service (e.g., a preview feature, a non-HIPAA region, a Power Platform SKU not in scope) for PHI
> - You deploy Azure OpenAI in a region/SKU not covered by your BAA
> - You leave default abuse-monitoring on without understanding that human reviewers may see flagged content (acceptable with opt-out request)
> - You expose Azure OpenAI behind a public endpoint without WAF + auth
> - You connect to a non-BAA third-party (Power BI external sharing, Logic Apps connector to non-eligible SaaS)
> - You use Copilot integrations that ingest PHI when those Copilots are not on the eligible list
> - You enable diagnostic logs to a destination outside your BAA scope
> - You create cross-tenant guest access without honoring the same controls
>
> **In all of these, the Microsoft BAA does not protect you. You assume full liability.**

---

## 11.3 Architecture C â€” Fully Managed Healthcare AI SaaS (e.g., Abridge / Notable / Innovaccer / Hippocratic class)

### C.1 System Overview

A turnkey vertical SaaS purpose-built for healthcare AI workflows (chart review, ambient documentation, QAPI, care management). Customer integrates EHR/source data and consumes the platform; vendor owns the entire stack including AI.

### C.2 Core Components

| Component | Vendor | Purpose |
|---|---|---|
| Vertical Healthcare AI SaaS | Vendor | All â€” UI, AI, storage, workflows |
| Vendor's AI models | Vendor (often via partner LLMs under sub-BAA) | Inference |
| Vendor's data warehouse | Vendor | PHI store |
| EHR integrations (Epic / Cerner / etc.) | Vendor + customer | Source data |
| SSO | Customer IdP | Identity |
| Customer responsibilities | **Customer** | **Configuration, role assignment, EHR scope, output review** |

### C.3 Data Flow (PHI)
```
EHR â†’ Vendor integration (HL7 / FHIR) â†’ Vendor cloud (PHI at rest)
   â†’ Vendor AI processing
   â†’ Vendor UI â†’ Clinician (SSO from customer IdP)
   â†’ Audit captured by vendor; customer-accessible audit export
```

### C.4 Where AI Runs
Vendor-managed cloud or vendor's contracted hyperscaler. Customer typically has no model selection.

### C.5 Where PHI is Stored
Vendor's tenancy. Some vendors offer single-tenant deployment for premium tiers.

### C.6 How Compliance is Achieved (claimed)
- Vendor BAA covers entire platform.
- Vendor maintains HITRUST CSF / SOC 2 Type II / sometimes HITRUST r2.
- Sub-processor BAAs cover LLM providers.

### C.7 Shared Responsibility â€” Architecture C

| Domain | Vendor | Customer |
|---|---|---|
| Entire technical stack (infra, app, AI, storage, network) | âœ… | â€” |
| Platform compliance attestations | âœ… | â€” |
| Sub-processor BAA chain | âœ… | â€” |
| Vulnerability management of platform | âœ… | â€” |
| Backup/DR of vendor cloud | âœ… | â€” |
| **Identity / SSO config** | â€” | âœ… |
| **User provisioning / deprovisioning** | â€” | âœ… |
| **Role / scope assignment** | â€” | âœ… |
| **EHR data scope (which patients, which fields flow)** | â€” | âœ… |
| **Output review / clinical sign-off** | â€” | âœ… |
| **Acceptable use policy / training** | â€” | âœ… |
| **Vendor risk management (ongoing)** | â€” | âœ… |
| **Configuration of any vendor-exposed knobs** | â€” | âœ… |
| **Termination / data deletion / portability** | â€” | âœ… |

### C.8 Where Liability Transfers vs Stays Internal

**Transferred to vendor (most extensive of the three):**
- Infrastructure, platform, application code, AI model operation, sub-processor management, platform-level audit, platform-level breach response.

**Stays internal:**
- Identity configuration (over-provisioning is the #1 SaaS breach vector)
- EHR scope (sending more PHI than necessary)
- Role assignment
- Clinical responsibility for outputs (AI proposes; clinician/admin remains the responsible party)
- Vendor risk management (you must verify their attestations annually)
- Termination handling (data extraction + deletion verification)
- Use of any custom integrations or data feeds

> âš ï¸ **HIPAA-eligibility boundary breaks if:**
> - Vendor uses a sub-processor without a BAA (your responsibility to verify)
> - You feed PHI into a vendor "lab" / "preview" feature outside the BAA scope
> - You export PHI to a destination not covered by the BAA (CSV download to local laptop, BI tool, email)
> - You over-provision EHR scope (sending entire chart when only specific fields are needed)
> - You let the vendor use your PHI for "model improvement" without explicit BAA carve-out (default ToS in some products allows this)
> - You skip Business Continuity planning under the assumption "the vendor handles it"
> - The vendor changes ownership / sub-processor list and you don't re-evaluate
>
> **In all of these, the vendor BAA does not protect you. You assume full liability.**

---

## 11.4 Cross-Architecture Reinforcement of the Core Principle

| Architecture | What you can offload | What you cannot offload |
|---|---|---|
| **A â€” Salesforce/Agentforce** | Platform, LLM brokering, Trust Layer, datacenter | Sharing model, profiles, prompts, custom code, AppExchange, sandbox PHI, report scope |
| **B â€” Azure HIPAA stack** | Eligible service infra, Azure OpenAI infra, key infra | RBAC, network, app code, deployment options, content filter, prompts, logging, eligibility selection |
| **C â€” Vertical Healthcare AI SaaS** | Almost everything technical | Identity config, EHR scope, role assignment, output responsibility, vendor risk, exports |
| **Self-hosted Brad.pi** | Nothing (no vendor risk transfer) | Everything (full ownership = full control = full responsibility) |

In **every** SaaS model, the **customer remains the Covered Entity** under HIPAA. The vendor is at most a Business Associate. **The Covered Entity carries unconditional accountability** under Â§164.308 and Â§164.402 regardless of who operates the infrastructure.

> **Restated for executive clarity:**
> - Self-hosted: you own everything, including the breach.
> - SaaS: you own the design and configuration, including the breach.
> - There is no architecture in which the organization stops owning the breach.
> - SaaS shifts **operational labor** and a sliver of **infrastructure liability**. It does **not** shift **HIPAA accountability**.

---


