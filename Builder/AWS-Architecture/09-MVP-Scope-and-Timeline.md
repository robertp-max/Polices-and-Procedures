# MVP Scope and Recommended Timeline

## MVP Scope (Phase 1)

### In scope

- Single AWS account, `us-west-1` only.
- S3 sandbox + prod buckets with the prefix model and lifecycle rules.
- DynamoDB `compliance_objects` single-table with the documented access patterns and 2 GSIs.
- 7 Lambda functions implementing the API contract.
- API Gateway HTTP API with JWT (Cognito) authorizer placeholder; closed-pilot uses an internal API key.
- CloudWatch logs + the alarm set in §6 of Phase 1.
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

## Recommended Sequence (Phase 2 — only after MVP is stable)

1. Org structure + accounts (`prod`, `nonprod`, `security`, `logs`).
2. CloudTrail org-trail, Config, GuardDuty, Security Hub, Inspector.
3. VPC + endpoints + subnets + routing.
4. ECR + ECS cluster + ALB + WAF.
5. Service-by-service strangler migration per [04-Migration-Phase1-to-Phase2.md](04-Migration-Phase1-to-Phase2.md).
6. AWS Backup, vault lock, cross-region replication for evidence/audit/esign.
7. (Optional) Aurora Serverless v2 reporting layer.
8. Decommission Phase 1 Lambdas.
