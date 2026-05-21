#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# rollback.sh — Roll the frontend back to a previously deployed git SHA.
#
# Usage:
#   bash infra/frontend-cdk/scripts/rollback.sh <git-sha> [staging|prod]
#
# Example:
#   bash infra/frontend-cdk/scripts/rollback.sh abc1234f staging
#
# Prerequisites:
#   - AWS CLI v2 configured with the deploy role permissions
#     (s3:GetObject, s3:PutObject, s3:ListBucket, cloudfront:CreateInvalidation)
#   - The release snapshot must exist at s3://<bucket>/releases/<sha>/
#     (all deploys automatically save a snapshot there)
#
# What it does:
#   1. Verifies the snapshot exists in S3
#   2. Syncs /assets/* from snapshot → bucket root (immutable cache headers)
#   3. Syncs all other root files from snapshot → bucket root (1-hour cache)
#   4. Copies index.html LAST from snapshot → bucket root (no-cache headers)
#      This is the atomic "switch point" — new requests get the rollback build.
#   5. Creates a CloudFront invalidation for /index.html only
#      (hashed assets don't need invalidation — their URLs change with content)
#
# Notes:
#   - Old hashed asset files from the reverted deploy remain in S3 but are
#     orphaned (no index.html references them). They expire with noncurrent
#     version lifecycle rules (60 days at root, 30 days under releases/).
#   - CloudFront invalidation propagates within ~30 sec to 2 min.
#     Users who received a cached index.html before the rollback will see
#     the old version until their local cache expires (max-age=0 → next request).
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SHA="${1:?Usage: rollback.sh <git-sha> [staging|prod]}"
ENV="${2:-staging}"
REGION="${AWS_REGION:-us-west-2}"

echo ""
echo "─────────────────────────────────────────────"
echo "  Frontend Rollback"
echo "  Environment : $ENV"
echo "  Target SHA  : $SHA"
echo "  Region      : $REGION"
echo "─────────────────────────────────────────────"
echo ""

# ── Resolve CloudFormation outputs ──────────────────────────────────────────
STACK="CiPolicyFrontend-${ENV}"

echo "[rollback] Resolving stack outputs from $STACK..."

BUCKET=$(aws cloudformation describe-stacks \
  --stack-name "$STACK" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
  --output text)

DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" \
  --output text)

if [[ -z "$BUCKET" || "$BUCKET" == "None" ]]; then
  echo "ERROR: Could not resolve BucketName from stack $STACK"
  exit 1
fi
if [[ -z "$DIST_ID" || "$DIST_ID" == "None" ]]; then
  echo "ERROR: Could not resolve DistributionId from stack $STACK"
  exit 1
fi

echo "[rollback] Bucket       : $BUCKET"
echo "[rollback] Distribution : $DIST_ID"
echo ""

# ── Verify snapshot exists ───────────────────────────────────────────────────
SNAPSHOT_PREFIX="s3://${BUCKET}/releases/${SHA}"

echo "[rollback] Verifying snapshot at ${SNAPSHOT_PREFIX}/index.html ..."
if ! aws s3 ls "${SNAPSHOT_PREFIX}/index.html" --region "$REGION" >/dev/null 2>&1; then
  echo ""
  echo "ERROR: Snapshot not found: ${SNAPSHOT_PREFIX}/index.html"
  echo ""
  echo "Available snapshots (most recent first):"
  aws s3 ls "s3://${BUCKET}/releases/" --region "$REGION" | sort -r | head -20
  echo ""
  exit 1
fi
echo "[rollback] Snapshot verified."
echo ""

# ── Confirm before proceeding ────────────────────────────────────────────────
read -r -p "Proceed with rollback to $SHA on $ENV? [y/N] " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "[rollback] Aborted."
  exit 0
fi
echo ""

# ── Step 1: Sync hashed assets (immutable cache headers) ────────────────────
echo "[rollback] Step 1/4 — Syncing /assets/* from snapshot..."
aws s3 sync "${SNAPSHOT_PREFIX}/assets/" "s3://${BUCKET}/assets/" \
  --cache-control "public, max-age=31536000, immutable" \
  --region "$REGION" \
  --no-progress \
  --only-show-errors

# ── Step 2: Sync non-index root files (1-hour cache) ────────────────────────
echo "[rollback] Step 2/4 — Syncing static root files from snapshot..."
aws s3 sync "${SNAPSHOT_PREFIX}/" "s3://${BUCKET}/" \
  --exclude "index.html" \
  --exclude "assets/*" \
  --exclude "releases/*" \
  --cache-control "public, max-age=3600" \
  --region "$REGION" \
  --no-progress \
  --only-show-errors

# ── Step 3: Copy index.html last (atomic switch — no-cache) ─────────────────
echo "[rollback] Step 3/4 — Switching index.html (atomic rollback point)..."
aws s3 cp "${SNAPSHOT_PREFIX}/index.html" "s3://${BUCKET}/index.html" \
  --cache-control "no-cache, no-store, must-revalidate, max-age=0" \
  --content-type "text/html; charset=utf-8" \
  --region "$REGION" \
  --no-progress

echo "[rollback] index.html switched to rollback build."

# ── Step 4: Invalidate /index.html in CloudFront ────────────────────────────
echo "[rollback] Step 4/4 — Creating CloudFront invalidation for /index.html ..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/index.html" \
  --query "Invalidation.Id" \
  --output text)

CF_DOMAIN=$(aws cloudfront get-distribution \
  --id "$DIST_ID" \
  --query "Distribution.DomainName" \
  --output text)

echo ""
echo "─────────────────────────────────────────────"
echo "  Rollback Complete"
echo "  Rolled back to : $SHA"
echo "  Environment    : $ENV"
echo "  Invalidation   : $INVALIDATION_ID"
echo "  URL            : https://${CF_DOMAIN}"
echo "─────────────────────────────────────────────"
echo ""
echo "CloudFront invalidation propagates in ~30 sec to 2 min."
echo "To verify: curl -I https://${CF_DOMAIN}/index.html"
echo ""
