#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# teardown.sh  ─  Empty + delete staging resources only
# Refuses to run unless HHC_ENV=staging.
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

: "${AWS_REGION:?Set AWS_REGION}"
: "${HHC_ENV:?Set HHC_ENV}"

if [[ "$HHC_ENV" != "staging" ]]; then
  echo "REFUSING to tear down anything other than STAGING."
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET="hhc-${HHC_ENV}-${ACCOUNT_ID}-${AWS_REGION}"
TABLE="hhc-${HHC_ENV}-compliance-objects"

echo "About to delete:"
echo "  S3 bucket : $BUCKET (all versions)"
echo "  DDB table : $TABLE"
echo "  CFN stacks: hhc-${HHC_ENV}-budgets, hhc-${HHC_ENV}-iam"
echo "  Lambdas   : hhc-${HHC_ENV}-{metadata-api,upload-init,upload-validate-promote,export-zip}"
echo "  HTTP API  : hhc-${HHC_ENV}-api"
read -r -p "Type 'destroy' to confirm: " ans
[[ "$ans" == "destroy" ]] || { echo "Aborted."; exit 1; }

echo "[teardown] HTTP API"
API_ID=$(aws apigatewayv2 get-apis --region "$AWS_REGION" \
  --query "Items[?Name=='hhc-${HHC_ENV}-api'].ApiId" --output text)
[[ -n "$API_ID" && "$API_ID" != "None" ]] && aws apigatewayv2 delete-api --api-id "$API_ID" --region "$AWS_REGION"

echo "[teardown] Lambdas"
for FN in metadata-api upload-init upload-validate-promote export-zip; do
  aws lambda delete-function --function-name "hhc-${HHC_ENV}-${FN}" --region "$AWS_REGION" 2>/dev/null || true
done

echo "[teardown] DynamoDB"
aws dynamodb delete-table --table-name "$TABLE" --region "$AWS_REGION" 2>/dev/null || true

echo "[teardown] S3 bucket (all versions + delete markers)"
aws s3api list-object-versions --bucket "$BUCKET" --output json 2>/dev/null \
  | python3 -c "
import sys, json, subprocess
data = json.load(sys.stdin) or {}
items = (data.get('Versions') or []) + (data.get('DeleteMarkers') or [])
for it in items:
  subprocess.run(['aws','s3api','delete-object','--bucket','$BUCKET','--key',it['Key'],'--version-id',it['VersionId']], check=False)
" || true
aws s3api delete-bucket --bucket "$BUCKET" --region "$AWS_REGION" 2>/dev/null || true

echo "[teardown] CFN stacks"
aws cloudformation delete-stack --stack-name "hhc-${HHC_ENV}-iam" --region "$AWS_REGION"
aws cloudformation delete-stack --stack-name "hhc-${HHC_ENV}-budgets" --region "$AWS_REGION"

echo "[teardown] Done."
