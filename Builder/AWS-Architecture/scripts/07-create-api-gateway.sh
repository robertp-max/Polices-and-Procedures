#!/usr/bin/env bash
# Phase 1 — Step 7: API Gateway HTTP API with routes & Lambda integrations.
# Region: us-west-1.

set -euo pipefail
REGION=us-west-1
ACCOUNT_ID="${ACCOUNT_ID:?Set ACCOUNT_ID env var}"
API_NAME=hhc-api
STAGE=v1

api_id=$(aws apigatewayv2 get-apis --region "$REGION" --query "Items[?Name=='${API_NAME}'].ApiId" --output text)
if [[ -z "$api_id" || "$api_id" == "None" ]]; then
  echo ">>> aws apigatewayv2 create-api ${API_NAME}"
  api_id=$(aws apigatewayv2 create-api --region "$REGION" \
    --name "$API_NAME" --protocol-type HTTP \
    --cors-configuration AllowOrigins='https://app.hhc.example.com',AllowMethods='GET,POST,OPTIONS',AllowHeaders='content-type,authorization,idempotency-key' \
    --query 'ApiId' --output text)
fi
echo "    ApiId=${api_id}"

create_integration_and_route () {
  local method="$1" path="$2" fn="$3"
  local fn_arn="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:hhc-${fn}"
  echo ">>> Integration → ${fn}"
  local int_id
  int_id=$(aws apigatewayv2 create-integration --region "$REGION" --api-id "$api_id" \
    --integration-type AWS_PROXY \
    --integration-uri "$fn_arn" \
    --payload-format-version 2.0 \
    --query 'IntegrationId' --output text)
  echo ">>> Route ${method} ${path}"
  aws apigatewayv2 create-route --region "$REGION" --api-id "$api_id" \
    --route-key "${method} ${path}" --target "integrations/${int_id}" >/dev/null

  echo ">>> lambda add-permission for API GW invoke"
  aws lambda add-permission --region "$REGION" \
    --function-name "hhc-${fn}" \
    --statement-id "apigw-${fn}-$(date +%s)" \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${api_id}/*/*" >/dev/null || true
}

create_integration_and_route POST "/uploads/init"                    upload-init
create_integration_and_route POST "/uploads/{upload_id}/validate"    upload-validate
create_integration_and_route POST "/uploads/{upload_id}/promote"    upload-promote
create_integration_and_route GET  "/events/{event_id}/files"         file-list
create_integration_and_route GET  "/files/{evidence_id}/download"    file-download
create_integration_and_route POST "/exports/survey-packet"           export-builder
create_integration_and_route POST "/esign/callback"                  esign-callback

# Stage with auto-deploy + access logs
LG="/aws/apigw/${API_NAME}"
aws logs create-log-group --region "$REGION" --log-group-name "$LG" 2>/dev/null || true
aws logs put-retention-policy --region "$REGION" --log-group-name "$LG" --retention-in-days 90 >/dev/null

LG_ARN="arn:aws:logs:${REGION}:${ACCOUNT_ID}:log-group:${LG}"
echo ">>> Create/Update stage ${STAGE}"
aws apigatewayv2 create-stage --region "$REGION" --api-id "$api_id" \
  --stage-name "$STAGE" --auto-deploy \
  --access-log-settings "DestinationArn=${LG_ARN},Format='{\"requestId\":\"\$context.requestId\",\"ip\":\"\$context.identity.sourceIp\",\"requestTime\":\"\$context.requestTime\",\"httpMethod\":\"\$context.httpMethod\",\"routeKey\":\"\$context.routeKey\",\"status\":\"\$context.status\",\"protocol\":\"\$context.protocol\",\"responseLength\":\"\$context.responseLength\"}'" \
  >/dev/null 2>&1 || \
  aws apigatewayv2 update-stage --region "$REGION" --api-id "$api_id" --stage-name "$STAGE" --auto-deploy >/dev/null

ENDPOINT=$(aws apigatewayv2 get-api --region "$REGION" --api-id "$api_id" --query 'ApiEndpoint' --output text)
echo "DONE.  API endpoint:  ${ENDPOINT}/${STAGE}"
