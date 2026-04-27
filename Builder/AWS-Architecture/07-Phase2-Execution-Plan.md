# Phase 2 — Execution Plan (AWS Services Inventory)

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
| 10 | **WAF Web ACL** (managed rules + custom) | App-layer protection | Now | Low–Medium | Yes | None | `get-web-acl` |
| 11 | **ECR repositories** | Container images | Now | Low | Yes | None | `describe-repositories` |
| 12 | **ECS Cluster** `hhc-fargate` | Compute | Now | **Medium** | Yes | None | `describe-clusters` |
| 13 | **ECS Task Definitions + Services** (api, validator, workflow, esign-ingest, export, audit-collector) | Workloads | Now | **Medium** | Yes | None | `describe-services` |
| 14 | **(Alt) EC2 Ubuntu 24.04 ASG** | Specialty workloads only | **Future / Optional** | **High** if always-on | Yes | AMI baking via Image Builder | `describe-auto-scaling-groups` |
| 15 | **Systems Manager** (Session Manager, Patch Manager, Parameter Store) | Access + patching + config | Now | Low | Yes | None | `start-session` test |
| 16 | **KMS CMKs** (`hhc-evidence`, `hhc-data`, `hhc-ebs`, `hhc-secrets`) | Encryption | Now | Low | Yes | Approve key policies | `describe-key` |
| 17 | **Secrets Manager** secrets (`hhc/ecign/api`, `hhc/api/hmac`, etc.) | Secret storage + rotation | Now | Low | Yes | Provide initial values | `describe-secret` |
| 18 | **CloudTrail** (org-trail to logs account, multi-region read, log file validation) | Control-plane audit | Now | Low | Yes | Org structure first | `get-trail-status` |
| 19 | **AWS Config** + conformance pack `hhc-hipaa` | Compliance baseline | Now | Low–Medium | Yes | None | `describe-config-rules` |
| 20 | **GuardDuty** | Threat detection | Now | Medium (volume-based) | Yes | None | `get-detector` |
| 21 | **Security Hub** (CIS AWS Foundations + AWS Foundational Best Practices) | Findings aggregator | Now | Low | Yes | None | `describe-hub` |
| 22 | **Inspector** (EC2 + ECR scans) | Vulnerability scanning | Now | Low–Medium | Yes | None | `describe-coverage` |
| 23 | **CloudWatch Logs + Alarms + Dashboards** | Observability | Now | Medium (ingestion) | Yes | Tune retention | `describe-alarms` |
| 24 | **AWS Backup** vaults (`hhc-vault`) with vault lock (governance) | Backup + retention | Now | Low–Medium | Yes | Vault lock confirm | `describe-backup-vault` |
| 25 | **Aurora Serverless v2 (PostgreSQL)** in `data-*` subnets | Reporting read model | **Future / Optional** | **Medium–High** | Yes | Justify before enabling | `describe-db-clusters` |
| 26 | **API Gateway (retain as edge)** + VPC Link | Public ingress proxy | Now (recommended) | Low | Yes | None | `get-apis` |
| 27 | **Cognito user pool** (advanced security ON) + IdP federation | End-user identity | Now | Low | Yes | IdP metadata | `describe-user-pool` |

---

## Phase 2 Cost-Sensitive Items (require explicit approval before creation)

- NAT Gateway (especially HA across 2 AZs)
- 8× Interface VPC Endpoints (offset by NAT savings — quantify before final number)
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
