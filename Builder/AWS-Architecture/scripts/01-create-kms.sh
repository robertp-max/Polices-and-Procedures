#!/usr/bin/env bash
# Phase 1 — Step 1: KMS CMKs for evidence (S3) and data (DynamoDB)
# Region: us-west-1 only.
# REVIEW BEFORE RUNNING.  This script does NOT delete anything.

set -euo pipefail
REGION=us-west-1
ACCOUNT_ID="${ACCOUNT_ID:?Set ACCOUNT_ID env var}"

POLICY_DIR="$(dirname "$0")/policies"
TMP=$(mktemp -d)
sed "s/__ACCOUNT_ID__/${ACCOUNT_ID}/g" "${POLICY_DIR}/kms-key-policy.json" > "${TMP}/kms.json"

create_key () {
  local alias="$1"
  echo ">>> Looking up alias ${alias}"
  if aws kms list-aliases --region "$REGION" --query "Aliases[?AliasName=='${alias}'].AliasName" --output text | grep -q "${alias}"; then
    echo "    alias exists — skipping"
    return 0
  fi
  echo ">>> aws kms create-key --description 'HHC ${alias}' ..."
  KEY_ID=$(aws kms create-key \
    --region "$REGION" \
    --description "HHC ${alias}" \
    --key-usage ENCRYPT_DECRYPT \
    --key-spec SYMMETRIC_DEFAULT \
    --policy "file://${TMP}/kms.json" \
    --tags TagKey=app,TagValue=hhc TagKey=managed-by,TagValue=hhc-bootstrap \
    --query 'KeyMetadata.KeyId' --output text)
  echo "    KeyId=${KEY_ID}"
  echo ">>> aws kms create-alias ${alias} -> ${KEY_ID}"
  aws kms create-alias --region "$REGION" --alias-name "${alias}" --target-key-id "${KEY_ID}"
  echo ">>> aws kms enable-key-rotation"
  aws kms enable-key-rotation --region "$REGION" --key-id "${KEY_ID}"
}

create_key alias/hhc-evidence
create_key alias/hhc-data

echo "DONE: KMS keys ready in ${REGION}"
