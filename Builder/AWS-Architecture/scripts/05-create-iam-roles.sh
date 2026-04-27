#!/usr/bin/env bash
# Phase 1 — Step 5: IAM roles for Lambdas (one role per function, baseline policy)
# Region: us-west-1 (IAM is global but ARNs encode region).

set -euo pipefail
REGION=us-west-1
ACCOUNT_ID="${ACCOUNT_ID:?Set ACCOUNT_ID env var}"
ENV="${ENV:?Set ENV to sandbox or prod}"

POLICY_DIR="$(dirname "$0")/policies"
TRUST="${POLICY_DIR}/lambda-trust.json"
TMP=$(mktemp)
sed -e "s/__ACCOUNT_ID__/${ACCOUNT_ID}/g" -e "s/__ENV__/${ENV}/g" \
  "${POLICY_DIR}/lambda-baseline-policy.json" > "$TMP"

create_role () {
  local fn="$1"
  local role="hhc-${fn}-role"
  if aws iam get-role --role-name "$role" >/dev/null 2>&1; then
    echo "Role ${role} exists — updating policy"
  else
    echo ">>> aws iam create-role ${role}"
    aws iam create-role --role-name "$role" \
      --assume-role-policy-document "file://${TRUST}" \
      --tags Key=app,Value=hhc Key=fn,Value="${fn}" >/dev/null
  fi
  echo ">>> Inline baseline policy on ${role}"
  aws iam put-role-policy --role-name "$role" \
    --policy-name hhc-baseline --policy-document "file://${TMP}" >/dev/null
}

for fn in upload-init upload-validate upload-promote file-list file-download export-builder esign-callback; do
  create_role "$fn"
done

# Break-glass role (assumable by named admins; alarmed)
BG=hhc-break-glass
if ! aws iam get-role --role-name "$BG" >/dev/null 2>&1; then
  echo ">>> Create break-glass role ${BG} (assume restricted to account; MFA required)"
  cat > /tmp/bg-trust.json <<JSON
{ "Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::${ACCOUNT_ID}:root"},"Action":"sts:AssumeRole","Condition":{"Bool":{"aws:MultiFactorAuthPresent":"true"}}}]}
JSON
  aws iam create-role --role-name "$BG" --assume-role-policy-document file:///tmp/bg-trust.json \
    --tags Key=app,Value=hhc Key=purpose,Value=break-glass >/dev/null
  aws iam attach-role-policy --role-name "$BG" --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
fi

echo "DONE: IAM roles ready."
