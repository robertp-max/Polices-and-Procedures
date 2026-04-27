#!/usr/bin/env bash
# Phase 1 — Step 6: Create Lambda function shells.
# Real code is deployed by CI/CD via `aws lambda update-function-code`.
# Region: us-west-1.

set -euo pipefail
REGION=us-west-1
ACCOUNT_ID="${ACCOUNT_ID:?Set ACCOUNT_ID env var}"
ENV="${ENV:?Set ENV to sandbox or prod}"
RUNTIME="${RUNTIME:-nodejs20.x}"

# A no-op zip so the function can be created.  Replace with real artifact later.
TMP=$(mktemp -d)
cat > "${TMP}/index.mjs" <<'JS'
export const handler = async () => ({ statusCode: 200, body: '{"status":"placeholder"}' });
JS
( cd "$TMP" && zip -q placeholder.zip index.mjs )

create_log_group () {
  local lg="/aws/lambda/$1"
  if ! aws logs describe-log-groups --region "$REGION" --log-group-name-prefix "$lg" --query 'logGroups[0].logGroupName' --output text | grep -qx "$lg"; then
    aws logs create-log-group --region "$REGION" --log-group-name "$lg"
  fi
  aws logs put-retention-policy --region "$REGION" --log-group-name "$lg" --retention-in-days 90 >/dev/null
}

create_fn () {
  local fn="hhc-$1"
  local mem="${2:-512}"
  local timeout="${3:-30}"
  local role_arn="arn:aws:iam::${ACCOUNT_ID}:role/hhc-$1-role"
  create_log_group "$fn"

  if aws lambda get-function --region "$REGION" --function-name "$fn" >/dev/null 2>&1; then
    echo "Function ${fn} exists — skipping create"
    return 0
  fi
  echo ">>> aws lambda create-function ${fn}"
  aws lambda create-function --region "$REGION" \
    --function-name "$fn" \
    --runtime "$RUNTIME" \
    --role "$role_arn" \
    --handler index.handler \
    --memory-size "$mem" \
    --timeout "$timeout" \
    --reserved-concurrent-executions 10 \
    --environment "Variables={ENV=${ENV},BUCKET=hhc-${ENV}-${ACCOUNT_ID}-us-west-1,TABLE=compliance_objects,KMS_ALIAS=alias/hhc-evidence}" \
    --tracing-config Mode=Active \
    --zip-file "fileb://${TMP}/placeholder.zip" \
    --tags app=hhc,fn="$1" >/dev/null
}

create_fn upload-init      512  30
create_fn upload-validate  1024 60
create_fn upload-promote   512  30
create_fn file-list        256  10
create_fn file-download    256  10
create_fn export-builder   1024 300
create_fn esign-callback   512  30

echo "DONE: Lambda function shells created.  Deploy real code via CI."
