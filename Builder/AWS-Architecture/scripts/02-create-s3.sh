#!/usr/bin/env bash
# Phase 1 — Step 2: S3 buckets (logs, sandbox, prod) with hardening
# Region: us-west-1 only.
# REVIEW BEFORE RUNNING.  No deletions.

set -euo pipefail
REGION=us-west-1
ACCOUNT_ID="${ACCOUNT_ID:?Set ACCOUNT_ID env var}"
POLICY_DIR="$(dirname "$0")/policies"

LOGS_BUCKET="hhc-logs-${ACCOUNT_ID}-us-west-1"
SANDBOX_BUCKET="hhc-sandbox-${ACCOUNT_ID}-us-west-1"
PROD_BUCKET="hhc-prod-${ACCOUNT_ID}-us-west-1"

create_bucket () {
  local b="$1"
  echo ">>> head-bucket ${b}"
  if aws s3api head-bucket --bucket "$b" --region "$REGION" 2>/dev/null; then
    echo "    bucket exists — skipping create"
  else
    echo ">>> aws s3api create-bucket --bucket ${b} --create-bucket-configuration LocationConstraint=${REGION}"
    aws s3api create-bucket --bucket "$b" --region "$REGION" \
      --create-bucket-configuration LocationConstraint="${REGION}"
  fi

  echo ">>> Block public access"
  aws s3api put-public-access-block --bucket "$b" --region "$REGION" \
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

  echo ">>> Versioning Enabled"
  aws s3api put-bucket-versioning --bucket "$b" --region "$REGION" \
    --versioning-configuration Status=Enabled

  echo ">>> Default SSE-KMS (alias/hhc-evidence)"
  aws s3api put-bucket-encryption --bucket "$b" --region "$REGION" \
    --server-side-encryption-configuration '{
      "Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms","KMSMasterKeyID":"alias/hhc-evidence"},"BucketKeyEnabled":true}]
    }'

  echo ">>> Ownership controls = BucketOwnerEnforced"
  aws s3api put-bucket-ownership-controls --bucket "$b" --region "$REGION" \
    --ownership-controls 'Rules=[{ObjectOwnership=BucketOwnerEnforced}]'
}

apply_evidence_bucket_policy () {
  local b="$1"
  local tmp; tmp=$(mktemp)
  sed -e "s/__BUCKET__/${b}/g" -e "s/__ACCOUNT_ID__/${ACCOUNT_ID}/g" \
    "${POLICY_DIR}/bucket-policy-prod.json" > "$tmp"
  echo ">>> Apply bucket policy (deny insecure, deny unencrypted, deny deletes on immutable prefixes)"
  aws s3api put-bucket-policy --bucket "$b" --region "$REGION" --policy "file://${tmp}"
}

apply_lifecycle_sandbox () {
  local b="$1"
  echo ">>> Sandbox lifecycle"
  aws s3api put-bucket-lifecycle-configuration --bucket "$b" --region "$REGION" \
    --lifecycle-configuration '{
      "Rules":[
        {"ID":"raw-7d","Status":"Enabled","Filter":{"Prefix":"uploads/raw/"},"Expiration":{"Days":7}},
        {"ID":"validated-7d","Status":"Enabled","Filter":{"Prefix":"uploads/validated/"},"Expiration":{"Days":7}},
        {"ID":"evidence-30d","Status":"Enabled","Filter":{"Prefix":"evidence/"},"Expiration":{"Days":30}},
        {"ID":"forms-30d","Status":"Enabled","Filter":{"Prefix":"forms/"},"Expiration":{"Days":30}},
        {"ID":"esign-30d","Status":"Enabled","Filter":{"Prefix":"esign/"},"Expiration":{"Days":30}},
        {"ID":"audit-90d","Status":"Enabled","Filter":{"Prefix":"audit/"},"Expiration":{"Days":90}},
        {"ID":"exports-7d","Status":"Enabled","Filter":{"Prefix":"exports/"},"Expiration":{"Days":7}}
      ]
    }'
}

apply_lifecycle_prod () {
  local b="$1"
  echo ">>> Prod lifecycle (NO deletion of evidence/audit/esign)"
  aws s3api put-bucket-lifecycle-configuration --bucket "$b" --region "$REGION" \
    --lifecycle-configuration '{
      "Rules":[
        {"ID":"raw-IA-30-expire-90","Status":"Enabled","Filter":{"Prefix":"uploads/raw/"},"Transitions":[{"Days":30,"StorageClass":"STANDARD_IA"}],"Expiration":{"Days":90}},
        {"ID":"validated-30","Status":"Enabled","Filter":{"Prefix":"uploads/validated/"},"Expiration":{"Days":30}},
        {"ID":"evidence-glacierIR-365","Status":"Enabled","Filter":{"Prefix":"evidence/"},"Transitions":[{"Days":365,"StorageClass":"GLACIER_IR"}]},
        {"ID":"forms-glacierIR-730","Status":"Enabled","Filter":{"Prefix":"forms/"},"Transitions":[{"Days":730,"StorageClass":"GLACIER_IR"}]},
        {"ID":"esign-glacierIR-730","Status":"Enabled","Filter":{"Prefix":"esign/"},"Transitions":[{"Days":730,"StorageClass":"GLACIER_IR"}]},
        {"ID":"audit-deeparchive-365","Status":"Enabled","Filter":{"Prefix":"audit/"},"Transitions":[{"Days":365,"StorageClass":"DEEP_ARCHIVE"}]},
        {"ID":"exports-30","Status":"Enabled","Filter":{"Prefix":"exports/"},"Expiration":{"Days":30}}
      ]
    }'
}

# 1. Logs bucket first (target for access logs)
create_bucket "$LOGS_BUCKET"

# 2. Sandbox + Prod
for b in "$SANDBOX_BUCKET" "$PROD_BUCKET"; do
  create_bucket "$b"
  apply_evidence_bucket_policy "$b"

  echo ">>> Enable server access logging to ${LOGS_BUCKET}"
  aws s3api put-bucket-logging --bucket "$b" --region "$REGION" \
    --bucket-logging-status "{\"LoggingEnabled\":{\"TargetBucket\":\"${LOGS_BUCKET}\",\"TargetPrefix\":\"s3-access/${b}/\"}}"
done

apply_lifecycle_sandbox "$SANDBOX_BUCKET"
apply_lifecycle_prod    "$PROD_BUCKET"

echo "NOTE: Object Lock (Compliance mode) for prod must be enabled MANUALLY by a human."
echo "      It is irreversible.  Do it after PHI gate approval."
echo "DONE: S3 buckets ready."
