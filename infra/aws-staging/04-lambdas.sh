#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# 04-lambdas.sh  ─  Package + create the four Lambda shells
# Source: infra/aws-staging/lambdas/*
# Runtime: nodejs22.x
# Memory : 256 MB (export-zip = 512 MB)
# Timeout: 30 s for APIs, 120 s for export-zip
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

: "${AWS_REGION:?Set AWS_REGION}"
: "${HHC_ENV:?Set HHC_ENV}"
: "${HHC_S3_BUCKET:?Set HHC_S3_BUCKET (output of 01-buckets.sh)}"
: "${HHC_DDB_TABLE:?Set HHC_DDB_TABLE (output of 02-dynamodb.sh)}"

if [[ "$HHC_ENV" != "staging" ]]; then
  echo "ERROR: STAGING only. HHC_ENV=$HHC_ENV"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")" && pwd)"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

declare -a LAMBDAS=(
  "metadata-api:hhc-${HHC_ENV}-lambda-metadata-api:30:256"
  "upload-init:hhc-${HHC_ENV}-lambda-upload-init:30:256"
  "upload-validate-promote:hhc-${HHC_ENV}-lambda-validate-promote:30:256"
  "export-zip:hhc-${HHC_ENV}-lambda-export-zip:120:512"
)

build_zip() {
  local NAME=$1
  local DIR="$ROOT/lambdas/$NAME"
  local ZIP="$ROOT/.build/$NAME.zip"
  mkdir -p "$ROOT/.build"
  ( cd "$DIR" && \
    if [[ -f package.json ]]; then npm install --omit=dev --silent; fi && \
    zip -qr "$ZIP" . -x "*.test.*" -x "node_modules/.cache/*" )
  echo "$ZIP"
}

for ENTRY in "${LAMBDAS[@]}"; do
  IFS=":" read -r NAME ROLE_NAME TIMEOUT MEM <<< "$ENTRY"
  ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
  FN_NAME="hhc-${HHC_ENV}-${NAME}"

  echo "[04-lambdas] Building $NAME → $FN_NAME"
  ZIP=$(build_zip "$NAME")

  if aws lambda get-function --function-name "$FN_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
    aws lambda update-function-code \
      --function-name "$FN_NAME" \
      --zip-file "fileb://$ZIP" \
      --region "$AWS_REGION" >/dev/null
    aws lambda update-function-configuration \
      --function-name "$FN_NAME" \
      --timeout "$TIMEOUT" \
      --memory-size "$MEM" \
      --environment "Variables={HHC_ENV=$HHC_ENV,HHC_S3_BUCKET=$HHC_S3_BUCKET,HHC_DDB_TABLE=$HHC_DDB_TABLE,LOG_LEVEL=info}" \
      --region "$AWS_REGION" >/dev/null
  else
    aws lambda create-function \
      --function-name "$FN_NAME" \
      --runtime nodejs22.x \
      --role "$ROLE_ARN" \
      --handler index.handler \
      --zip-file "fileb://$ZIP" \
      --timeout "$TIMEOUT" \
      --memory-size "$MEM" \
      --environment "Variables={HHC_ENV=$HHC_ENV,HHC_S3_BUCKET=$HHC_S3_BUCKET,HHC_DDB_TABLE=$HHC_DDB_TABLE,LOG_LEVEL=info}" \
      --tags "env=$HHC_ENV,app=hhc" \
      --region "$AWS_REGION" >/dev/null
  fi

  echo "[04-lambdas] Deployed $FN_NAME (timeout=${TIMEOUT}s mem=${MEM}MB)"
done

echo "[04-lambdas] Done."
