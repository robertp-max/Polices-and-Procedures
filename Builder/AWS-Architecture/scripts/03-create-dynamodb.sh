#!/usr/bin/env bash
# Phase 1 — Step 3: DynamoDB compliance_objects table (single-table design)
# Region: us-west-1 only.

set -euo pipefail
REGION=us-west-1
TABLE=compliance_objects

if aws dynamodb describe-table --region "$REGION" --table-name "$TABLE" >/dev/null 2>&1; then
  echo "Table ${TABLE} already exists — skipping create."
else
  echo ">>> aws dynamodb create-table ${TABLE}"
  aws dynamodb create-table \
    --region "$REGION" \
    --table-name "$TABLE" \
    --billing-mode PAY_PER_REQUEST \
    --attribute-definitions \
      AttributeName=pk,AttributeType=S \
      AttributeName=sk,AttributeType=S \
      AttributeName=gsi1pk,AttributeType=S \
      AttributeName=gsi1sk,AttributeType=S \
      AttributeName=gsi2pk,AttributeType=S \
      AttributeName=gsi2sk,AttributeType=S \
    --key-schema \
      AttributeName=pk,KeyType=HASH \
      AttributeName=sk,KeyType=RANGE \
    --global-secondary-indexes "[
      {\"IndexName\":\"gsi1\",\"KeySchema\":[{\"AttributeName\":\"gsi1pk\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"gsi1sk\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},
      {\"IndexName\":\"gsi2\",\"KeySchema\":[{\"AttributeName\":\"gsi2pk\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"gsi2sk\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}
    ]" \
    --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES \
    --sse-specification "Enabled=true,SSEType=KMS,KMSMasterKeyId=alias/hhc-data" \
    --tags Key=app,Value=hhc Key=managed-by,Value=hhc-bootstrap

  echo ">>> Wait for ACTIVE"
  aws dynamodb wait table-exists --region "$REGION" --table-name "$TABLE"
fi

echo ">>> Enable PITR"
aws dynamodb update-continuous-backups --region "$REGION" --table-name "$TABLE" \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true >/dev/null

echo ">>> Enable deletion protection"
aws dynamodb update-table --region "$REGION" --table-name "$TABLE" \
  --deletion-protection-enabled >/dev/null || true

echo "DONE: DynamoDB ${TABLE} ready."
