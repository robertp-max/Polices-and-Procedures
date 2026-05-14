# AWS Staging Foundation

This folder contains the **staging-only** deployment scripts and Lambda
shells aligned with `Builder/Documentations/AWS_Phase1_Foundation_Build_Plan.md`
and `Builder/AWS-Architecture/02-Phase1-Serverless-Architecture.md`.

> **Scope:** demo / staging environment only. No PHI. No production
> Object Lock. No always-on services. Estimated cost: **$6–32/month**
> per the Phase 1 plan.

## Contents

```
infra/aws-staging/
├── README.md                  ← you are here
├── deploy.sh                  ← orchestration script (bash)
├── 00-budget.yml              ← AWS Budgets + CloudWatch billing alarm (CFN)
├── 01-buckets.sh              ← S3 staging bucket(s) + versioning + lifecycle
├── 02-dynamodb.sh             ← compliance_objects table + GSIs + PITR
├── 03-iam.yml                 ← Lambda execution roles (CFN)
├── 04-lambdas.sh              ← packages + creates the 4 Lambda shells
├── 05-apigateway.sh           ← HTTP API + JWT authorizer + routes
├── 06-cloudwatch.sh           ← log groups + retention + Lambda error alarm
├── lambdas/
│   ├── metadata-api/          ← GET /events/{event_id}/files
│   ├── upload-init/           ← POST /uploads/init   → presigned PUT URL
│   ├── upload-validate-promote/ ← POST /uploads/{id}/validate|promote
│   └── export-zip/            ← POST /exports/survey-packet
└── smoke-test.sh              ← end-to-end staging probe
```

## One-time prerequisites

1. AWS CLI v2 configured with a profile that has admin permissions for
   the **staging** account. Set:
   ```bash
   export AWS_PROFILE=hhc-staging
   export AWS_REGION=us-west-1
   export HHC_ENV=staging
   export HHC_BUDGET_EMAIL=you@example.com
   ```
2. Confirm budget alerts are configured before proceeding (`00-budget.yml`).
3. Read `Builder/AWS-Architecture/02-Phase1-Serverless-Architecture.md`
   §11 hard guardrails; the scripts implement them by default.

## Deploy order (read the plan §7 first)

```bash
# 0. Budget controls (always first — protects credits if anything else fails).
aws cloudformation deploy \
  --template-file infra/aws-staging/00-budget.yml \
  --stack-name hhc-staging-budgets \
  --parameter-overrides NotificationEmail="$HHC_BUDGET_EMAIL" \
  --capabilities CAPABILITY_NAMED_IAM

# 1. S3 staging bucket(s).
bash infra/aws-staging/01-buckets.sh

# 2. DynamoDB compliance_objects table.
bash infra/aws-staging/02-dynamodb.sh

# 3. IAM execution roles (per-Lambda least privilege).
aws cloudformation deploy \
  --template-file infra/aws-staging/03-iam.yml \
  --stack-name hhc-staging-iam \
  --capabilities CAPABILITY_NAMED_IAM

# 4. Package + create Lambda shells.
bash infra/aws-staging/04-lambdas.sh

# 5. API Gateway HTTP API + routes.
bash infra/aws-staging/05-apigateway.sh

# 6. CloudWatch log groups + alarms.
bash infra/aws-staging/06-cloudwatch.sh
```

Or run the whole thing (interactive — pauses for confirmation between
steps):

```bash
bash infra/aws-staging/deploy.sh
```

## Smoke test

```bash
bash infra/aws-staging/smoke-test.sh
```

Validates the seven items from the deploy report's smoke checklist.

## Tear-down

```bash
bash infra/aws-staging/teardown.sh
```

Empties the staging bucket(s), deletes the API, Lambdas, table, and
CloudFormation stacks. **Does NOT touch production.** There is no
production stack in this foundation.

## Safety notes

- **Single environment.** Only `staging` is provisioned. No prod.
- **Object Lock is OFF** by default in staging (per directive). Versioning
  + deny-delete bucket policy provide rollback without irreversible Lock.
- **No PHI.** Lambdas reject any payload with a `phi:true` flag. Smoke
  data is synthetic only.
- **Public access blocked.** All four S3 BPA flags ON.
- **No raw bytes in DynamoDB or localStorage.** Bytes live in S3 only;
  metadata + S3 references live in DynamoDB only.
- **Presigned URL TTLs.** PUT = 10 min, GET = 2 min (Plan §4 hard limit).
