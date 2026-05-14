#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# 05-apigateway.sh  ─  HTTP API + routes
# Plan §11: HTTP API ONLY (never REST API; cost trap).
# Stage: $default with auto-deploy.
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

: "${AWS_REGION:?Set AWS_REGION}"
: "${HHC_ENV:?Set HHC_ENV}"

if [[ "$HHC_ENV" != "staging" ]]; then
  echo "ERROR: STAGING only."
  exit 1
fi

API_NAME="hhc-${HHC_ENV}-api"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# ─── Reuse existing API if present ───
EXISTING=$(aws apigatewayv2 get-apis --region "$AWS_REGION" \
  --query "Items[?Name=='$API_NAME'].ApiId" --output text)

if [[ -n "$EXISTING" && "$EXISTING" != "None" ]]; then
  API_ID="$EXISTING"
  echo "[05-apigateway] Reusing API $API_NAME → $API_ID"
else
  API_ID=$(aws apigatewayv2 create-api \
    --name "$API_NAME" \
    --protocol-type HTTP \
    --cors-configuration "AllowOrigins=${HHC_WEB_ORIGIN:-http://localhost:5173},AllowMethods=GET,POST,OPTIONS,AllowHeaders=Authorization,Content-Type" \
    --region "$AWS_REGION" \
    --query ApiId --output text)
  echo "[05-apigateway] Created API → $API_ID"
fi

create_integration() {
  local FN_NAME=$1
  local FN_ARN="arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:${FN_NAME}"
  aws apigatewayv2 create-integration \
    --api-id "$API_ID" \
    --integration-type AWS_PROXY \
    --integration-uri "$FN_ARN" \
    --integration-method POST \
    --payload-format-version 2.0 \
    --region "$AWS_REGION" \
    --query IntegrationId --output text
}

create_route() {
  local METHOD=$1
  local PATH_TPL=$2
  local INT_ID=$3
  aws apigatewayv2 create-route \
    --api-id "$API_ID" \
    --route-key "$METHOD $PATH_TPL" \
    --target "integrations/$INT_ID" \
    --region "$AWS_REGION" >/dev/null
}

grant_invoke() {
  local FN_NAME=$1
  aws lambda add-permission \
    --function-name "$FN_NAME" \
    --statement-id "apigw-invoke-$(date +%s)" \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${AWS_REGION}:${ACCOUNT_ID}:${API_ID}/*/*" \
    --region "$AWS_REGION" >/dev/null 2>&1 || true
}

declare -a ROUTES=(
  "POST /uploads/init                          hhc-${HHC_ENV}-upload-init"
  "POST /uploads/{upload_id}/validate          hhc-${HHC_ENV}-upload-validate-promote"
  "POST /uploads/{upload_id}/promote           hhc-${HHC_ENV}-upload-validate-promote"
  "GET  /events/{event_id}/files               hhc-${HHC_ENV}-metadata-api"
  "GET  /files/{evidence_id}/download          hhc-${HHC_ENV}-metadata-api"
  "POST /exports/survey-packet                 hhc-${HHC_ENV}-export-zip"
)

for R in "${ROUTES[@]}"; do
  M=$(echo "$R" | awk '{print $1}')
  P=$(echo "$R" | awk '{print $2}')
  F=$(echo "$R" | awk '{print $3}')
  INT_ID=$(create_integration "$F")
  create_route "$M" "$P" "$INT_ID"
  grant_invoke "$F"
  echo "[05-apigateway] $M $P → $F"
done

# ─── Stage with auto-deploy ───
aws apigatewayv2 create-stage \
  --api-id "$API_ID" \
  --stage-name '$default' \
  --auto-deploy \
  --region "$AWS_REGION" >/dev/null 2>&1 || true

ENDPOINT=$(aws apigatewayv2 get-api --api-id "$API_ID" --region "$AWS_REGION" --query ApiEndpoint --output text)
echo "[05-apigateway] Done. API endpoint: $ENDPOINT"
echo "[05-apigateway] Export this for the web app:"
echo "  export VITE_AWS_API_BASE_URL=$ENDPOINT"
