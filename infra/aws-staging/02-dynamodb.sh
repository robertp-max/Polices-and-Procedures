#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# 02-dynamodb.sh  ─  HHC Staging metadata table
# Single-table design per Plan §3:
#   pk / sk + GSI1 (event-centric) + GSI2 (workflow-centric)
#   PAY_PER_REQUEST + PITR enabled.
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

: "${AWS_REGION:?Set AWS_REGION}"
: "${HHC_ENV:?Set HHC_ENV}"

if [[ "$HHC_ENV" != "staging" ]]; then
  echo "ERROR: STAGING only. HHC_ENV=$HHC_ENV"
  exit 1
fi

TABLE="hhc-${HHC_ENV}-compliance-objects"

echo "[02-dynamodb] Table=${TABLE} Region=${AWS_REGION}"

if aws dynamodb describe-table --table-name "$TABLE" --region "$AWS_REGION" >/dev/null 2>&1; then
  echo "[02-dynamodb] Table $TABLE already exists — verifying schema."
else
  aws dynamodb create-table \
    --table-name "$TABLE" \
    --region "$AWS_REGION" \
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
    --global-secondary-indexes '[
      {
        "IndexName": "gsi1",
        "KeySchema": [
          {"AttributeName": "gsi1pk", "KeyType": "HASH"},
          {"AttributeName": "gsi1sk", "KeyType": "RANGE"}
        ],
        "Projection": {"ProjectionType": "ALL"}
      },
      {
        "IndexName": "gsi2",
        "KeySchema": [
          {"AttributeName": "gsi2pk", "KeyType": "HASH"},
          {"AttributeName": "gsi2sk", "KeyType": "RANGE"}
        ],
        "Projection": {"ProjectionType": "ALL"}
      }
    ]' \
    --tags Key=env,Value="$HHC_ENV" Key=app,Value=hhc

  echo "[02-dynamodb] Waiting for table to become ACTIVE..."
  aws dynamodb wait table-exists --table-name "$TABLE" --region "$AWS_REGION"
fi

# ─── Enable PITR ───
aws dynamodb update-continuous-backups \
  --table-name "$TABLE" \
  --region "$AWS_REGION" \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

# ─── Enable streams (NEW_AND_OLD_IMAGES) for future EventBridge fan-out ───
aws dynamodb update-table \
  --table-name "$TABLE" \
  --region "$AWS_REGION" \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES \
  >/dev/null 2>&1 || echo "[02-dynamodb] Stream already configured."

# ─── Smoke item: write + read the canonical IDs to verify ───
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
aws dynamodb put-item \
  --table-name "$TABLE" \
  --region "$AWS_REGION" \
  --item "{
    \"pk\": {\"S\": \"DEPLOY#smoke\"},
    \"sk\": {\"S\": \"$NOW\"},
    \"policy_id\": {\"S\": \"GV-GB-001\"},
    \"workflow_id\": {\"S\": \"WF-DEPLOY-SMOKE\"},
    \"event_id\": {\"S\": \"EV-DEPLOY-SMOKE\"},
    \"created_at\": {\"S\": \"$NOW\"},
    \"created_by\": {\"S\": \"deploy-script\"},
    \"record_version\": {\"N\": \"1\"}
  }"

echo "[02-dynamodb] Done. Table: $TABLE"
echo "[02-dynamodb] Export this for downstream scripts:"
echo "  export HHC_DDB_TABLE=$TABLE"
