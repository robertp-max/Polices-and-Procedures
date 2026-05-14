#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# deploy.sh  ─  Interactive end-to-end staging deploy
# Pauses for confirmation between steps. Read the README first.
# ─────────────────────────────────────────────────────────────────
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"

: "${AWS_REGION:?Set AWS_REGION (e.g. us-west-1)}"
: "${HHC_ENV:?Set HHC_ENV (must be 'staging')}"
: "${HHC_BUDGET_EMAIL:?Set HHC_BUDGET_EMAIL}"

if [[ "$HHC_ENV" != "staging" ]]; then
  echo "ABORT: this script provisions STAGING only."
  exit 1
fi

confirm() {
  read -r -p "$1 [y/N] " ans
  [[ "$ans" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 1; }
}

echo "================================================================"
echo " HHC AWS Staging Foundation — interactive deploy"
echo "   Account : $(aws sts get-caller-identity --query Account --output text)"
echo "   Region  : $AWS_REGION"
echo "   Env     : $HHC_ENV"
echo "================================================================"
confirm "Proceed?"

echo "[1/6] Budget controls (CFN)"
aws cloudformation deploy \
  --template-file "$ROOT/00-budget.yml" \
  --stack-name "hhc-${HHC_ENV}-budgets" \
  --parameter-overrides NotificationEmail="$HHC_BUDGET_EMAIL" \
  --capabilities CAPABILITY_NAMED_IAM
confirm "Continue to S3?"

echo "[2/6] S3 buckets"
bash "$ROOT/01-buckets.sh"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export HHC_S3_BUCKET="hhc-${HHC_ENV}-${ACCOUNT_ID}-${AWS_REGION}"
confirm "Continue to DynamoDB?"

echo "[3/6] DynamoDB"
bash "$ROOT/02-dynamodb.sh"
export HHC_DDB_TABLE="hhc-${HHC_ENV}-compliance-objects"
confirm "Continue to IAM?"

echo "[4/6] IAM roles (CFN)"
aws cloudformation deploy \
  --template-file "$ROOT/03-iam.yml" \
  --stack-name "hhc-${HHC_ENV}-iam" \
  --parameter-overrides \
    S3BucketName="$HHC_S3_BUCKET" \
    DynamoTableName="$HHC_DDB_TABLE" \
    Environment="$HHC_ENV" \
  --capabilities CAPABILITY_NAMED_IAM
confirm "Continue to Lambdas?"

echo "[5/6] Lambdas"
bash "$ROOT/04-lambdas.sh"
confirm "Continue to API Gateway + CloudWatch?"

echo "[6/6] API Gateway + CloudWatch"
bash "$ROOT/05-apigateway.sh"
bash "$ROOT/06-cloudwatch.sh"

echo ""
echo "================================================================"
echo " Done. Run smoke test:"
echo "   bash $ROOT/smoke-test.sh"
echo "================================================================"
