#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# 01-buckets.sh  ─  HHC Staging S3 bucket
# Creates ONE staging bucket with:
#   - Block Public Access (all 4 flags ON)
#   - Default SSE-S3 encryption (KMS upgrade in Phase 2)
#   - Versioning ENABLED
#   - Lifecycle rules per Plan §2 (sandbox tier)
#   - TLS-only bucket policy
#   - CORS limited to the API origin
#   - NO Object Lock (production-only feature; explicit directive)
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

: "${AWS_REGION:?Set AWS_REGION (e.g. us-west-1)}"
: "${HHC_ENV:?Set HHC_ENV (must be 'staging' for this script)}"

if [[ "$HHC_ENV" != "staging" ]]; then
  echo "ERROR: this script provisions STAGING resources only. HHC_ENV=$HHC_ENV is not allowed."
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET="hhc-${HHC_ENV}-${ACCOUNT_ID}-${AWS_REGION}"
LOGS_BUCKET="hhc-logs-${ACCOUNT_ID}-${AWS_REGION}"

echo "[01-buckets] Account=${ACCOUNT_ID}  Region=${AWS_REGION}  Bucket=${BUCKET}"

# ─── Create staging bucket if missing ───
if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  echo "[01-buckets] Bucket $BUCKET already exists — reusing."
else
  if [[ "$AWS_REGION" == "us-east-1" ]]; then
    aws s3api create-bucket --bucket "$BUCKET" --region us-east-1
  else
    aws s3api create-bucket --bucket "$BUCKET" --region "$AWS_REGION" \
      --create-bucket-configuration LocationConstraint="$AWS_REGION"
  fi
fi

# ─── Block Public Access (all 4 flags ON) ───
aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# ─── Default encryption (SSE-S3 / AES256). KMS upgrade is a Phase 2 task. ───
aws s3api put-bucket-encryption --bucket "$BUCKET" \
  --server-side-encryption-configuration '{
    "Rules": [
      {"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}, "BucketKeyEnabled": true}
    ]
  }'

# ─── Versioning ENABLED ───
aws s3api put-bucket-versioning --bucket "$BUCKET" \
  --versioning-configuration Status=Enabled

# ─── Lifecycle rules (sandbox tier per Plan §2) ───
aws s3api put-bucket-lifecycle-configuration --bucket "$BUCKET" \
  --lifecycle-configuration '{
    "Rules": [
      {"ID": "expire-uploads-raw-30d", "Status": "Enabled",
        "Filter": {"Prefix": "uploads/raw/"},
        "Expiration": {"Days": 30},
        "NoncurrentVersionExpiration": {"NoncurrentDays": 30}},
      {"ID": "expire-uploads-validated-60d", "Status": "Enabled",
        "Filter": {"Prefix": "uploads/validated/"},
        "Expiration": {"Days": 60},
        "NoncurrentVersionExpiration": {"NoncurrentDays": 30}},
      {"ID": "expire-evidence-staging-30d", "Status": "Enabled",
        "Filter": {"Prefix": "evidence/"},
        "Expiration": {"Days": 30},
        "NoncurrentVersionExpiration": {"NoncurrentDays": 30}},
      {"ID": "expire-exports-7d", "Status": "Enabled",
        "Filter": {"Prefix": "exports/"},
        "Expiration": {"Days": 7}},
      {"ID": "abort-incomplete-mpu", "Status": "Enabled",
        "Filter": {},
        "AbortIncompleteMultipartUpload": {"DaysAfterInitiation": 1}}
    ]
  }'

# ─── TLS-only bucket policy ───
TLS_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyInsecureTransport",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::$BUCKET",
        "arn:aws:s3:::$BUCKET/*"
      ],
      "Condition": {"Bool": {"aws:SecureTransport": "false"}}
    }
  ]
}
EOF
)
aws s3api put-bucket-policy --bucket "$BUCKET" --policy "$TLS_POLICY"

# ─── CORS — restrict to web/api origin (override via $HHC_WEB_ORIGIN) ───
WEB_ORIGIN="${HHC_WEB_ORIGIN:-http://localhost:5173}"
aws s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration "{
  \"CORSRules\": [
    {
      \"AllowedOrigins\": [\"$WEB_ORIGIN\"],
      \"AllowedMethods\": [\"PUT\", \"GET\", \"HEAD\"],
      \"AllowedHeaders\": [\"*\"],
      \"ExposeHeaders\": [\"ETag\"],
      \"MaxAgeSeconds\": 300
    }
  ]
}"

# ─── Optional: separate logs bucket ───
if ! aws s3api head-bucket --bucket "$LOGS_BUCKET" 2>/dev/null; then
  echo "[01-buckets] Creating logs bucket $LOGS_BUCKET"
  if [[ "$AWS_REGION" == "us-east-1" ]]; then
    aws s3api create-bucket --bucket "$LOGS_BUCKET" --region us-east-1
  else
    aws s3api create-bucket --bucket "$LOGS_BUCKET" --region "$AWS_REGION" \
      --create-bucket-configuration LocationConstraint="$AWS_REGION"
  fi
  aws s3api put-public-access-block --bucket "$LOGS_BUCKET" \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
fi

echo "[01-buckets] Done. Staging bucket: $BUCKET"
echo "[01-buckets] Export this for downstream scripts:"
echo "  export HHC_S3_BUCKET=$BUCKET"
