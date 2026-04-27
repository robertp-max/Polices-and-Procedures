# Phase 1 — Execution Plan (AWS Services + CLI)

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
- [scripts/policies/](scripts/policies) — IAM and bucket policy JSON

> **Run order:** scripts are numbered. They are **idempotent-safe via name checks** but are intentionally not destructive. None of them deletes resources. None of them creates EC2, RDS, NAT, OpenSearch, or EKS.

---

## Manual Steps After Script Run

1. **Confirm SNS subscription** clicked in email.
2. **Upload Lambda deployment packages** to the functions (the script creates the function shells; CI/CD or a separate `aws lambda update-function-code` deploys real code).
3. **Configure custom domain** for API Gateway (optional, requires ACM cert in `us-west-1`).
4. **Cognito app client** configuration after frontend is ready.
5. **Enable Object Lock** on `prod` bucket for `evidence/`, `audit/`, `esign/` prefixes (one-time, irreversible — done deliberately by a human).

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
  1. `POST /uploads/init` with sample triplet → expect `presigned_put_url`
  2. `curl -X PUT` of a 1-byte file
  3. `POST /uploads/{upload_id}/validate` → expect `VALIDATED`
  4. `POST /uploads/{upload_id}/promote` → expect `PROMOTED`
  5. `GET /events/{event_id}/files` → expect 1 evidence record
  6. `GET /files/{evidence_id}/download` → expect presigned GET that returns 1 byte

---

## Direct Execution Capability

**Can I execute via AWS CLI directly?** Only if you connect AWS credentials to this session and explicitly approve. By default, **I will not run AWS commands.** You will run the reviewed scripts yourself, or wire them into your CI/CD.

When/if executing on your behalf, the rules are:

- `--region us-west-1` only.
- Print every command before running.
- Print resource ARN/name and a one-line validation result after each command.
- Never delete resources.
- Stop and ask before any service flagged Medium/High cost risk (none in Phase 1).
