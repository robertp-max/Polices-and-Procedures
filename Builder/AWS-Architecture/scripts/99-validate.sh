#!/usr/bin/env bash
# Phase 1 — Validation script.  Read-only.  Safe to re-run.

set -euo pipefail
REGION=us-west-1
ACCOUNT_ID="${ACCOUNT_ID:?Set ACCOUNT_ID env var}"
ENV="${ENV:?Set ENV to sandbox or prod}"

BUCKET="hhc-${ENV}-${ACCOUNT_ID}-us-west-1"
TABLE=compliance_objects

pass=0; fail=0
check () { if eval "$2" >/dev/null 2>&1; then echo "  PASS  $1"; pass=$((pass+1)); else echo "  FAIL  $1"; fail=$((fail+1)); fi; }

echo "== KMS =="
check "alias/hhc-evidence exists"  "aws kms describe-key --region $REGION --key-id alias/hhc-evidence"
check "alias/hhc-data exists"      "aws kms describe-key --region $REGION --key-id alias/hhc-data"

echo "== S3 ${BUCKET} =="
check "bucket exists"              "aws s3api head-bucket --bucket $BUCKET --region $REGION"
check "versioning Enabled"         "aws s3api get-bucket-versioning --bucket $BUCKET --region $REGION --query Status --output text | grep -qx Enabled"
check "encryption KMS"             "aws s3api get-bucket-encryption --bucket $BUCKET --region $REGION --query 'ServerSideEncryptionConfiguration.Rules[0].ApplyServerSideEncryptionByDefault.SSEAlgorithm' --output text | grep -qx aws:kms"
check "public access blocked"      "aws s3api get-public-access-block --bucket $BUCKET --region $REGION --query 'PublicAccessBlockConfiguration.BlockPublicAcls' --output text | grep -qx True"
check "bucket policy present"      "aws s3api get-bucket-policy --bucket $BUCKET --region $REGION"

echo "== DynamoDB =="
check "table ACTIVE"               "aws dynamodb describe-table --region $REGION --table-name $TABLE --query 'Table.TableStatus' --output text | grep -qx ACTIVE"
check "PITR Enabled"               "aws dynamodb describe-continuous-backups --region $REGION --table-name $TABLE --query 'ContinuousBackupsDescription.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus' --output text | grep -qx ENABLED"
check "Streams enabled"            "aws dynamodb describe-table --region $REGION --table-name $TABLE --query 'Table.StreamSpecification.StreamEnabled' --output text | grep -qx True"

echo "== Lambdas =="
for fn in upload-init upload-validate upload-promote file-list file-download export-builder esign-callback; do
  check "lambda hhc-$fn exists"    "aws lambda get-function --region $REGION --function-name hhc-$fn"
done

echo "== API Gateway =="
api_id=$(aws apigatewayv2 get-apis --region $REGION --query "Items[?Name=='hhc-api'].ApiId" --output text)
check "API hhc-api exists"         "[[ -n '$api_id' && '$api_id' != 'None' ]]"

echo "== Placeholders =="
check "EventBridge bus hhc-events" "aws events describe-event-bus --region $REGION --name hhc-events"
check "Cognito user pool hhc-users""aws cognito-idp list-user-pools --region $REGION --max-results 60 --query \"UserPools[?Name=='hhc-users'].Id|[0]\" --output text | grep -v ^None$"

echo
echo "RESULTS: PASS=${pass}  FAIL=${fail}"
[[ $fail -eq 0 ]]
