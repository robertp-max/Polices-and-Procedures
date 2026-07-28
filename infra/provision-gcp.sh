#!/usr/bin/env bash
# Care Indeed LMS — GCP provisioning (idempotent). Run with an authenticated gcloud.
# Firestore location is PERMANENT once created. Provisions the dev environment.
set -uo pipefail

PROJECT="${LMS_PROJECT:-data-hangout-500409-j4}"
ENVNAME="${LMS_ENV:-dev}"
FIRESTORE_LOC="${LMS_FIRESTORE_LOC:-nam5}"
KMS_LOC="${LMS_KMS_LOC:-us}"
TASKS_LOC="${LMS_TASKS_LOC:-us-central1}"

SA_ID="lms-backend"
SA_EMAIL="${SA_ID}@${PROJECT}.iam.gserviceaccount.com"
STAGING_BUCKET="${PROJECT}-lms-staging-${ENVNAME}"
ARTIFACTS_BUCKET="${PROJECT}-lms-artifacts-${ENVNAME}"
KEYRING="lms-signing"
SIGN_KEY="gate-manifest-signer"
QUEUES=(certificate-render evidence-validate notifications projections)

echo "== Project: $PROJECT  Env: $ENVNAME =="

echo "== [1/6] APIs =="
gcloud services enable firestore.googleapis.com cloudkms.googleapis.com \
  cloudtasks.googleapis.com run.googleapis.com storage.googleapis.com \
  --project="$PROJECT"

echo "== [2/6] Firestore (Native, $FIRESTORE_LOC) — permanent =="
if gcloud firestore databases describe --database="(default)" --project="$PROJECT" >/dev/null 2>&1; then
  echo "   Firestore (default) already exists — skipping."
else
  gcloud firestore databases create --location="$FIRESTORE_LOC" --type=firestore-native --project="$PROJECT"
fi

echo "== [3/6] GCS buckets (versioned) =="
for B in "$STAGING_BUCKET" "$ARTIFACTS_BUCKET"; do
  if gcloud storage buckets describe "gs://$B" --project="$PROJECT" >/dev/null 2>&1; then
    echo "   gs://$B exists — skipping."
  else
    gcloud storage buckets create "gs://$B" --project="$PROJECT" --location=US --uniform-bucket-level-access
  fi
  gcloud storage buckets update "gs://$B" --versioning --project="$PROJECT"
done

echo "== [4/6] Cloud KMS keyring + asymmetric-sign key =="
gcloud kms keyrings create "$KEYRING" --location="$KMS_LOC" --project="$PROJECT" 2>/dev/null || echo "   keyring exists."
if gcloud kms keys describe "$SIGN_KEY" --keyring="$KEYRING" --location="$KMS_LOC" --project="$PROJECT" >/dev/null 2>&1; then
  echo "   key exists — skipping."
else
  gcloud kms keys create "$SIGN_KEY" --keyring="$KEYRING" --location="$KMS_LOC" \
    --purpose=asymmetric-signing --default-algorithm=ec-sign-p256-sha256 --project="$PROJECT"
fi

echo "== [5/6] Cloud Tasks queues ($TASKS_LOC) =="
for Q in "${QUEUES[@]}"; do
  gcloud tasks queues create "$Q" --location="$TASKS_LOC" --project="$PROJECT" 2>/dev/null || echo "   queue $Q exists."
done

echo "== [6/6] Service account + least-privilege IAM =="
gcloud iam service-accounts create "$SA_ID" --display-name="Care Indeed LMS backend" --project="$PROJECT" 2>/dev/null || echo "   SA exists."
# Firestore
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$SA_EMAIL" --role="roles/datastore.user" --condition=None -q >/dev/null
# KMS sign/verify
gcloud kms keys add-iam-policy-binding "$SIGN_KEY" --keyring="$KEYRING" --location="$KMS_LOC" \
  --member="serviceAccount:$SA_EMAIL" --role="roles/cloudkms.signerVerifier" --project="$PROJECT" -q >/dev/null
# Cloud Tasks enqueue
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$SA_EMAIL" --role="roles/cloudtasks.enqueuer" --condition=None -q >/dev/null
# GCS object admin scoped to the two buckets
for B in "$STAGING_BUCKET" "$ARTIFACTS_BUCKET"; do
  gcloud storage buckets add-iam-policy-binding "gs://$B" --member="serviceAccount:$SA_EMAIL" --role="roles/storage.objectAdmin" --project="$PROJECT" -q >/dev/null
done

echo ""
echo "== DONE. Env for the app: =="
echo "GCP_PROJECT_ID=$PROJECT"
echo "GCP_LOCATION=$TASKS_LOC"
echo "LMS_STAGING_BUCKET=$STAGING_BUCKET"
echo "LMS_ARTIFACTS_BUCKET=$ARTIFACTS_BUCKET"
echo "LMS_KMS_KEY_VERSION=projects/$PROJECT/locations/$KMS_LOC/keyRings/$KEYRING/cryptoKeys/$SIGN_KEY/cryptoKeyVersions/1"
echo "LMS_JOBS_OIDC_SA=$SA_EMAIL"
