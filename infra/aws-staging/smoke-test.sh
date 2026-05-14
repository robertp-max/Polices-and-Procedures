#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# smoke-test.sh  ─  HHC Staging end-to-end probe
# Validates the seven items from SAFE_DEPLOYMENT_REPORT.md §Smoke.
# Uses synthetic, non-PHI data only.
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

: "${AWS_REGION:?Set AWS_REGION}"
: "${HHC_ENV:?Set HHC_ENV}"
: "${VITE_AWS_API_BASE_URL:?Set VITE_AWS_API_BASE_URL (output of 05-apigateway.sh)}"

API="$VITE_AWS_API_BASE_URL"
TABLE="hhc-${HHC_ENV}-compliance-objects"
TS=$(date -u +%Y%m%dT%H%M%S)

POLICY="GV-GB-001"
WORKFLOW="WF-SMOKE-$TS"
EVENT="EV-SMOKE-$TS"
FILENAME="smoke-$TS.txt"

echo "[smoke 1/7] upload-init → presigned PUT URL"
INIT=$(curl -s -X POST "$API/uploads/init" \
  -H 'content-type: application/json' \
  -d "{\"policy_id\":\"$POLICY\",\"workflow_id\":\"$WORKFLOW\",\"event_id\":\"$EVENT\",\"filename\":\"$FILENAME\",\"content_type\":\"text/plain\"}")
echo "$INIT" | head -c 300; echo
UPLOAD_ID=$(echo "$INIT" | python3 -c "import sys, json; print(json.load(sys.stdin)['upload_id'])")
PUT_URL=$(echo "$INIT"  | python3 -c "import sys, json; print(json.load(sys.stdin)['put_url'])")
[[ -n "$UPLOAD_ID" && -n "$PUT_URL" ]] || { echo "FAIL: bad init response"; exit 1; }

echo "[smoke 2/7] PUT synthetic file to S3"
echo "smoke-test artifact $TS" > /tmp/$FILENAME
curl -s -X PUT -H "content-type: text/plain" --upload-file "/tmp/$FILENAME" "$PUT_URL"

echo "[smoke 3/7] validate"
curl -s -X POST "$API/uploads/$UPLOAD_ID/validate" \
  -H 'content-type: application/json' -d '{}' | head -c 300; echo

echo "[smoke 4/7] promote"
PROMOTE=$(curl -s -X POST "$API/uploads/$UPLOAD_ID/promote" \
  -H 'content-type: application/json' -d "{\"event_id\":\"$EVENT\"}")
echo "$PROMOTE" | head -c 300; echo

echo "[smoke 5/7] DynamoDB has the FILE# row"
COUNT=$(aws dynamodb query \
  --table-name "$TABLE" --region "$AWS_REGION" \
  --key-condition-expression 'pk = :pk AND begins_with(sk, :sk)' \
  --expression-attribute-values "{\":pk\":{\"S\":\"EVENT#$EVENT\"},\":sk\":{\"S\":\"FILE#\"}}" \
  --select COUNT --query Count --output text)
echo "  found $COUNT FILE# row(s)"; [[ "$COUNT" -ge 1 ]] || { echo "FAIL"; exit 1; }

echo "[smoke 6/7] retrieve metadata via API"
curl -s "$API/events/$EVENT/files" | head -c 300; echo

echo "[smoke 7/7] CloudWatch — recent error count for the four Lambdas"
for FN in metadata-api upload-init upload-validate-promote export-zip; do
  ERR=$(aws cloudwatch get-metric-statistics \
    --namespace AWS/Lambda --metric-name Errors \
    --dimensions Name=FunctionName,Value="hhc-${HHC_ENV}-${FN}" \
    --start-time "$(date -u -d '-15 minutes' +%FT%TZ)" \
    --end-time "$(date -u +%FT%TZ)" --period 300 --statistics Sum \
    --region "$AWS_REGION" --query 'Datapoints[].Sum' --output text)
  echo "  $FN errors (15 min): ${ERR:-0}"
done

echo ""
echo "================================================================"
echo " Smoke test complete. Verify Budget alert exists:"
echo "   aws budgets describe-budgets --account-id \$(aws sts get-caller-identity --query Account --output text)"
echo "================================================================"
