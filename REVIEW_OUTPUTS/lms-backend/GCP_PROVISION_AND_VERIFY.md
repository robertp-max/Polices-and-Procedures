# GCP provisioning + live adapter verification

**Project:** `data-hangout-500409-j4` · **Env:** `dev` · **Authed as:** `robertp@careindeed.com`
**Date:** 2026-07-28 (UTC)

## Provisioned (via `infra/provision-gcp.sh`, idempotent)

| Resource | Detail | Status |
|---|---|---|
| APIs | firestore, cloudkms, cloudtasks (+ run, storage) | enabled |
| Firestore | `(default)`, **Native**, location **`nam5`** (US multi-region, permanent) | created |
| GCS staging | `gs://data-hangout-500409-j4-lms-staging-dev` (versioned, UBLA) | created |
| GCS artifacts | `gs://data-hangout-500409-j4-lms-artifacts-dev` (versioned, UBLA) | created |
| Cloud KMS | keyring `lms-signing` (loc `us`), key `gate-manifest-signer` `EC_SIGN_P256_SHA256`, version 1 ENABLED | created |
| Cloud Tasks | queues `certificate-render`, `evidence-validate`, `notifications`, `projections` (loc `us-central1`) RUNNING | created |
| Service account | `lms-backend@data-hangout-500409-j4.iam.gserviceaccount.com` | created |
| IAM (least privilege) | `datastore.user`, `cloudkms.signerVerifier` (on the key), `cloudtasks.enqueuer`, `storage.objectAdmin` (scoped to the 2 buckets) | bound |

## Live verification (`infra/gcp-smoke.mjs`)

Exercises the exact SDK patterns of `src/learning/adapters/gcp/*` against the live resources:

```json
{ "firestore": "PASS", "kms": "PASS", "gcs": "PASS",
  "gcsSignedUrl": "SKIP (needs SA identity; OK on Cloud Run)", "tasks": "PASS" }
ALL_PASS
```

- **Firestore** — subject/assignment subcollection write → read → delete.
- **Cloud KMS** — `asymmetricSign` a digest, `getPublicKey`, local verify → matches.
- **GCS** — save to staging → copy to artifacts → metadata generation present → cleanup.
- **Cloud Tasks** — create a deterministic-named task in `certificate-render` → delete (never delivered).
- **Signed URL** — skipped locally: end-user ADC can't sign; on Cloud Run the app runs *as* the
  service account and signs via IAM. Not an adapter defect.

## Bug found + fixed by live testing

`KmsSigner` originally fed the verifier the raw digest while KMS signed the digest, so `verify()`
re-hashed and always failed. Fixed to sign/verify the fingerprint **string** consistently
(`sha256(fingerprintString)` on both sides) — `src/learning/adapters/gcp/kms.ts`. Smoke `kms: PASS`.

## Status of the GCP adapters

The infra is real and the adapter SDK patterns are **live-verified**. The adapter files still carry
`// @ts-nocheck` and are not yet compiled against the SDK types inside the repo build (the worktree
`node_modules` is a shared junction; the SDKs were installed in an isolated scratchpad for the smoke
test). Remaining to fully "green" the adapters in-repo: install the SDKs in this worktree, remove the
`@ts-nocheck` headers, and typecheck.

## Not done — explicit owner gate

**Deploy to Cloud Run is not performed.** It is the one outward action held for an explicit "deploy".
