# AWS CLI Scripts (REVIEW BEFORE EXECUTION)

These scripts implement the Phase 1 architecture exactly as described in
[../06-Phase1-Execution-Plan.md](../06-Phase1-Execution-Plan.md).

**They have NOT been executed.** They are written for human/CI review.

## Pre-flight

```bash
export AWS_DEFAULT_REGION=us-west-1
export ACCOUNT_ID=123456789012   # your account
export ENV=sandbox               # or prod
export ALERT_EMAIL=ops@example.com
aws sts get-caller-identity      # confirm correct identity
```

## Run order

```bash
bash 01-create-kms.sh
bash 02-create-s3.sh
bash 03-create-dynamodb.sh
bash 04-create-sns-and-budgets.sh
bash 05-create-iam-roles.sh
bash 06-create-lambdas.sh
bash 07-create-api-gateway.sh
bash 08-create-eventbridge-cognito.sh
bash 99-validate.sh
```

## What these scripts will NOT do

- They will not delete any resource.
- They will not create EC2, RDS, NAT, OpenSearch, or EKS.
- They will not enable S3 Object Lock Compliance mode (intentionally manual; irreversible).
- They will not deploy real Lambda code (CI/CD does that via `update-function-code`).
- They will not configure custom domains or ACM certs.

## Windows users

These are `bash` scripts. On Windows, run them from WSL, Git Bash, or convert to PowerShell.
The AWS CLI v2 commands are identical; only the wrapper syntax (`set -euo pipefail`, `[[ ]]`) is bash.

## Idempotency

All scripts check for existing resources by name before creating. Re-running is safe and is the expected path for incremental updates. Property updates (versioning, encryption, lifecycle, IAM inline policies) are applied unconditionally and are idempotent on AWS's side.
