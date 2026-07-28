# Care Indeed LMS — GCP adapters (unverified until credentialed)

These adapters bind the provider-neutral ports (`src/learning/domain/ports.ts`) to live
Google Cloud services. They are **written but not runnable/typechecked in the build
environment** because they depend on the `@google-cloud/*` SDKs and Application Default
Credentials. Each file carries `// @ts-nocheck` so the verified domain/app/http build stays
green; remove those lines after installing the SDKs and typecheck against real types.

| Port | Adapter | GCP service |
|------|---------|-------------|
| `LearningRecordStore` | `firestore.ts` → `FirestoreRecordStore` | Firestore |
| `LearningEventStore` | `firestore.ts` → `FirestoreEventStore` | Firestore (sharded, append-only) |
| `ArtifactStore` | `gcs.ts` → `GcsArtifactStore` | Cloud Storage (staging + artifacts) |
| `Signer` | `kms.ts` → `KmsSigner` | Cloud KMS (asymmetric sign/verify) |
| `JobQueue` | `tasks.ts` → `CloudTasksJobQueue` | Cloud Tasks (deterministic-name dedupe) |
| wiring | `index.ts` → `makeGcpEnv` | assembles the `LearningEnv` |
| transport | `../../http/express.ts` → `mountTrainingApi` | Express / Cloud Run shim |

## 1. Install SDKs (run in this worktree)

```bash
npm i @google-cloud/firestore @google-cloud/storage @google-cloud/kms @google-cloud/tasks express
```

Then delete the `// @ts-nocheck` header from each file in `src/learning/adapters/gcp/` and
`src/learning/http/express.ts`, and run `npx tsc --noEmit` to typecheck against the real types.

## 2. Provision (your GCP project — not done here)

- Firestore (Native mode); composite indexes per `REVIEW_OUTPUTS/lms-backend/DYNAMODB_ACCESS_PATTERNS.md`.
- Buckets: `cihh-learning-upload-staging-<env>`, `cihh-learning-artifacts-<env>` (versioning + Object Lock).
- Cloud KMS asymmetric-sign key (`EC_SIGN_P256_SHA256`) for GateDecisions + certificate manifests.
- Cloud Tasks queues: `certificate-render`, `evidence-validate`, `notifications`, `projections`.
- Service account with least-privilege IAM (datastore.user, storage.objectAdmin on those buckets,
  cloudkms.signerVerifier on that key, cloudtasks.enqueuer, run.invoker for the worker).

## 3. Wire + run

```ts
import express from 'express';
import { makeGcpEnv, gcpConfigFromEnv } from './src/learning/adapters/gcp';
import { TrainingService } from './src/learning/app/trainingService';
import { mountTrainingApi, authContextFromClaims } from './src/learning/http/express';

const svc = new TrainingService(makeGcpEnv(gcpConfigFromEnv()));
const app = express();
// The host's existing Cognito/JWT middleware must populate req.user BEFORE this mount.
app.use(mountTrainingApi(svc, (req) => (req as any).user ? authContextFromClaims((req as any).user) : null));
```

Required env vars (see `gcpConfigFromEnv`): `GCP_PROJECT_ID`, `GCP_LOCATION`,
`LMS_STAGING_BUCKET`, `LMS_ARTIFACTS_BUCKET`, `LMS_KMS_KEY_VERSION`, `LMS_JOBS_HANDLER_URL`,
`LMS_JOBS_OIDC_SA`, `GOOGLE_APPLICATION_CREDENTIALS`.

## 4. Deploy — **owner action, not performed here**

Deployment is intentionally not automated. Build the container and deploy to Cloud Run under
your own authorization; run the integration/security/concurrency suites against a staging
project before any cutover. The migration must run in shadow mode first
(`REVIEW_OUTPUTS/lms-backend/MIGRATION_RECONCILIATION.md`) — no boolean-to-pass conversion,
no auto-issuance from imported records.
