#!/usr/bin/env bash
# Phase 1 — Step 8: Placeholders for EventBridge + Cognito.
# These are intentionally minimal.  Wired up in a later phase.

set -euo pipefail
REGION=us-west-1

BUS=hhc-events
if ! aws events describe-event-bus --region "$REGION" --name "$BUS" >/dev/null 2>&1; then
  echo ">>> aws events create-event-bus ${BUS}"
  aws events create-event-bus --region "$REGION" --name "$BUS" >/dev/null
fi

POOL_NAME=hhc-users
pool_id=$(aws cognito-idp list-user-pools --region "$REGION" --max-results 60 \
  --query "UserPools[?Name=='${POOL_NAME}'].Id | [0]" --output text)
if [[ -z "$pool_id" || "$pool_id" == "None" ]]; then
  echo ">>> aws cognito-idp create-user-pool ${POOL_NAME}"
  aws cognito-idp create-user-pool --region "$REGION" \
    --pool-name "$POOL_NAME" \
    --policies 'PasswordPolicy={MinimumLength=12,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true,TemporaryPasswordValidityDays=3}' \
    --mfa-configuration ON \
    --auto-verified-attributes email \
    --account-recovery-setting 'RecoveryMechanisms=[{Priority=1,Name=verified_email}]' \
    --user-pool-add-ons AdvancedSecurityMode=ENFORCED >/dev/null
fi

echo "DONE: EventBridge bus + Cognito user pool created (placeholder, no app client wired)."
