#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# 06-cloudwatch.sh  ─  Log groups + retention + Lambda error alarm
# Plan §11: log retention fixed at 14 days for cost control.
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

: "${AWS_REGION:?Set AWS_REGION}"
: "${HHC_ENV:?Set HHC_ENV}"

if [[ "$HHC_ENV" != "staging" ]]; then
  echo "ERROR: STAGING only."
  exit 1
fi

declare -a FUNCTIONS=(
  "hhc-${HHC_ENV}-metadata-api"
  "hhc-${HHC_ENV}-upload-init"
  "hhc-${HHC_ENV}-upload-validate-promote"
  "hhc-${HHC_ENV}-export-zip"
)

ALARM_TOPIC=$(aws cloudformation describe-stacks \
  --stack-name hhc-${HHC_ENV}-budgets \
  --region "$AWS_REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='BillingTopicArn'].OutputValue" \
  --output text 2>/dev/null || echo "")

for FN in "${FUNCTIONS[@]}"; do
  LG="/aws/lambda/$FN"

  # Create log group if missing.
  aws logs create-log-group --log-group-name "$LG" --region "$AWS_REGION" 2>/dev/null || true

  # Force 14-day retention.
  aws logs put-retention-policy \
    --log-group-name "$LG" \
    --retention-in-days 14 \
    --region "$AWS_REGION"

  # Lambda errors > 5 in 5 min → alarm.
  aws cloudwatch put-metric-alarm \
    --alarm-name "${FN}-errors" \
    --alarm-description "Lambda errors threshold for $FN" \
    --metric-name Errors \
    --namespace AWS/Lambda \
    --statistic Sum \
    --period 300 \
    --evaluation-periods 1 \
    --threshold 5 \
    --comparison-operator GreaterThanOrEqualToThreshold \
    --treat-missing-data notBreaching \
    --dimensions "Name=FunctionName,Value=$FN" \
    ${ALARM_TOPIC:+--alarm-actions "$ALARM_TOPIC"} \
    --region "$AWS_REGION"

  echo "[06-cloudwatch] $FN log retention=14d, error alarm armed."
done

echo "[06-cloudwatch] Done."
