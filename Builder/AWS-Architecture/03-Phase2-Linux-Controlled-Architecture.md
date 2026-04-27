# Phase 2 — Linux-Controlled, HIPAA-Aligned Architecture (Detailed)

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

**Recommendation:** ECS Fargate on Linux for the services; EC2 Ubuntu reserved for any specialty job (e.g. heavyweight document conversion) inside an ASG of size 0–2.

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
| `api-svc` | 2–10 | Node.js HTTP API (replaces API Gateway+Lambda routes) |
| `validator-svc` | 1–6 | Heavy file validation, AV scan, hashing |
| `workflow-engine` | 1–4 | Mandated event scheduler / state machine driver |
| `esign-ingest-svc` | 1–4 | eCign vendor webhook receiver + verifier |
| `export-svc` | 0–4 | On-demand survey packet builder |
| `audit-collector` | 1–2 | Centralized audit fan-in to S3 + Aurora (read model) |

- Each service has its own **ECS task role** (least privilege) and its own **task execution role**.
- Containers must run as **non-root**, read-only root filesystem, drop all Linux capabilities, with `seccomp=runtime/default`.
- Images stored in private **ECR**; image scanning ON; only signed images may run (use `ECR + Notation` or `cosign` + admission gate via CodeBuild policy).

---

## 4. API Layer

Two acceptable patterns:

**Pattern A (recommended):** Keep **API Gateway** as the public edge (rate limiting, WAF, auth) → **VPC Link** → internal ALB → `api-svc`.
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
- No secrets in env vars at rest — pulled at task start via task role.

---

## 8. Audit Architecture

- `audit-collector` consumes **DynamoDB Streams** + container application logs (via FireLens → CloudWatch).
- Writes append-only JSONL to S3 `audit/yyyy/mm/dd/...` with **Object Lock** in Compliance mode.
- Daily Glacier Deep Archive transition for objects > 365 days.
- **CloudTrail** (org-trail, multi-region read enabled, log file validation ON) → dedicated logs account if AWS Organizations is in play.
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
- Disaster recovery RPO ≤ 1 hour, RTO ≤ 4 hours via Backup + cross-region copy of S3 evidence to `us-west-2` (Phase 2 only).

---

## 10. CI/CD (Phase 2)

- CodeCommit/GitHub → CodeBuild (lint, SAST, image build, sign, scan) → CodeDeploy/ECS blue-green.
- Mandatory checks before merge: unit tests, `tfsec`/`checkov` on IaC, `trivy` on image, `cfn-nag`/`tflint`.
- IaC: **Terraform** (preferred) or CDK; pinned providers; remote state in S3 with DDB lock; state encrypted with KMS CMK.
