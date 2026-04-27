# Architecture Diagrams (Text)

## Phase 1 — Serverless MVP (us-west-1)

```
                       ┌────────────────────────────┐
                       │         End Users           │
                       │  (Compliance Officers, RNs) │
                       └──────────────┬──────────────┘
                                      │ HTTPS
                                      ▼
                       ┌────────────────────────────┐
                       │  Cognito User Pool          │  (placeholder, JWT)
                       └──────────────┬──────────────┘
                                      │ JWT
                                      ▼
                       ┌────────────────────────────┐
                       │  API Gateway (HTTP API)     │
                       │  hhc-api                    │
                       └──────────────┬──────────────┘
                                      │ proxy
       ┌──────────────────────────────┼──────────────────────────────────┐
       ▼                              ▼                                  ▼
┌──────────────┐            ┌──────────────────┐               ┌──────────────────┐
│ upload-init  │            │ upload-validate  │               │ upload-promote   │
│  Lambda      │            │  Lambda          │               │  Lambda          │
└──────┬───────┘            └────────┬─────────┘               └────────┬─────────┘
       │ presign PUT                 │ HEAD raw, hash          │ Copy raw→evidence
       │ Dynamo: UPLOAD              │ Dynamo: VALIDATED       │ Dynamo: PROMOTED
       ▼                             ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         S3: hhc-{env}-{acct}-us-west-1                          │
│  uploads/raw/{policy}/{workflow}/{event}/{upload}/file                          │
│  uploads/validated/...                                                          │
│  evidence/{policy}/{workflow}/{event}/{evidence}/file   (versioned, no-delete)  │
│  forms/...   esign/...   audit/yyyy/mm/dd/...   exports/yyyy/mm/dd/...          │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │
       ┌──────────────────────────────┼──────────────────────────────────┐
       │                              │                                  │
┌──────┴───────┐            ┌─────────┴────────┐               ┌─────────┴────────┐
│ file-download│            │ export-builder   │               │ esign-callback   │
│  Lambda      │            │  Lambda          │               │  Lambda          │
└──────┬───────┘            └────────┬─────────┘               └────────┬─────────┘
       │                             │                                  │
       └────────────┬────────────────┴──────────────┬───────────────────┘
                    ▼                               ▼
           ┌──────────────────┐         ┌──────────────────────┐
           │ DynamoDB         │         │ CloudWatch Logs       │
           │ compliance_objects│         │ /aws/lambda/hhc-*     │
           │  pk / sk + GSIs  │         │ + metric filters      │
           └──────────────────┘         └──────────────────────┘

           ┌──────────────────┐         ┌──────────────────────┐
           │ EventBridge bus  │ (design)│ AWS Budgets alarm    │
           │ hhc-events       │         │ $50/mo soft cap      │
           └──────────────────┘         └──────────────────────┘
```

**Trust boundaries (Phase 1):**

- All compute is AWS-managed (Lambda); no VPC required for MVP.
- S3 access is **only** via presigned URLs minted by Lambdas with scoped IAM.
- Direct S3 console access is denied by bucket policy except for a break-glass admin role.

---

## Phase 2 — Linux-Controlled / HIPAA-Aligned (us-west-1)

```
                                    Internet
                                       │
                                       ▼
                         ┌────────────────────────────┐
                         │ CloudFront (optional CDN)  │
                         └──────────────┬─────────────┘
                                        │
                                        ▼
                         ┌────────────────────────────┐
                         │ AWS WAF                    │
                         └──────────────┬─────────────┘
                                        │
                                        ▼
                         ┌────────────────────────────┐
                         │ API Gateway (edge proxy)   │  ← optional retain
                         └──────────────┬─────────────┘
                                        │ VPC Link
                                        ▼
┌──────────────────────────────── VPC: 10.40.0.0/16  (us-west-1) ─────────────────────────────────┐
│                                                                                                  │
│   Public subnets (10.40.0.0/24, 10.40.1.0/24)                                                    │
│   ┌────────────────────────────────┐                                                             │
│   │  Internal ALB  hhc-alb         │  TLS terminate, OIDC via Cognito/IdP                        │
│   └──────────────┬─────────────────┘                                                             │
│                  │                                                                               │
│   Private app subnets (10.40.10.0/24, 10.40.11.0/24)                                             │
│   ┌──────────────┴───────────────────────────────────────────────┐                              │
│   │  ECS Fargate (Linux) OR EC2 Ubuntu 24.04 LTS                  │                              │
│   │  ┌────────────┐ ┌────────────────┐ ┌────────────────────┐    │                              │
│   │  │ api-svc    │ │ validator-svc  │ │ workflow-engine     │    │                              │
│   │  └────────────┘ └────────────────┘ └────────────────────┘    │                              │
│   │  ┌────────────────────┐ ┌────────────────────┐                │                              │
│   │  │ esign-ingest-svc   │ │ export-svc         │                │                              │
│   │  └────────────────────┘ └────────────────────┘                │                              │
│   └──────────────┬───────────────────────────────────────────────┘                              │
│                  │                                                                               │
│   Private data subnets (10.40.20.0/24, 10.40.21.0/24)                                            │
│   ┌──────────────┴────────────┐    ┌────────────────────────┐                                   │
│   │ Aurora Serverless v2      │    │ ElastiCache (optional) │                                   │
│   │ (only if relational need) │    │                        │                                   │
│   └───────────────────────────┘    └────────────────────────┘                                   │
│                                                                                                  │
│   VPC Endpoints (Gateway): S3, DynamoDB                                                          │
│   VPC Endpoints (Interface): KMS, Secrets Manager, SSM, Logs, ECR, STS                           │
│                                                                                                  │
│   Access:  SSM Session Manager only.  No bastion. No public SSH. No NAT in private app subnets   │
│            unless egress required → use NAT in public subnet, gated by SG + route policy.        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

   Cross-cutting:
   ┌──────────┐ ┌────────┐ ┌─────────────────┐ ┌────────────┐ ┌──────────────┐ ┌───────────┐
   │ CloudTrail│ │  KMS   │ │ Secrets Manager │ │ AWS Backup │ │ CloudWatch    │ │ Config    │
   │ org-wide  │ │ CMKs   │ │ rotation        │ │ vaults     │ │ Logs/Metrics  │ │ rules     │
   └──────────┘ └────────┘ └─────────────────┘ └────────────┘ └──────────────┘ └───────────┘
```
