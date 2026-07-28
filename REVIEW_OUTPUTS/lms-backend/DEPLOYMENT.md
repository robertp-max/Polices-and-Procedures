# Care Indeed LMS backend — Cloud Run deployment (dev)

**Live service:** `https://lms-backend-455039212099.us-central1.run.app`
**Project:** `data-hangout-500409-j4` · **Region:** `us-central1` · **Revision:** `lms-backend-00005-526`
**Runs as SA:** `lms-backend@data-hangout-500409-j4.iam.gserviceaccount.com`
**Date:** 2026-07-28

## What runs

`services/lms/server.ts` (Cloud Run, `services/lms/Dockerfile`) wires the live GCP
`LearningEnv` (`makeGcpEnv`) into the framework-agnostic `/api/training/*` router. It talks to
the real provisioned Firestore / GCS / Cloud KMS / Cloud Tasks. Run directly via `tsx` (no build).

## Verified live (curl against the deployed URL)

| Request | Result |
|---|---|
| `GET /` and `GET /health` | `200 {ok:true,...}` |
| `GET /api/training/me/assignments` (no auth) | `401` |
| same + `X-Debug-*` dev auth, `training.self.read` | `200 {"assignments":[]}` (Firestore-backed) |
| same, empty caps | `403 MISSING_CAPABILITY` |
| `POST /api/training/admin/plans/resolve` (+Idempotency-Key) | `200` — provisions via Firestore |
| `POST` without Idempotency-Key | `400 IDEMPOTENCY_KEY_REQUIRED` |
| `GET /api/public/certificates/UNKNOWN` (no auth) | `404 CERTIFICATE_NOT_FOUND` (JSON, minimized) |

Server authority, capability + object-scope authz, idempotency, and the stable error model all
confirmed against live GCP.

## Bugs found and fixed by the live deploy

1. **`FirestoreRecordStore` missing 4 port methods** (`putEvidence`, `putSignoff`,
   `listCertificates`, `getCertificateByPublicId`) — the `@ts-nocheck` hid the gap; public verify
   500'd. Added.
2. **Unhandled async errors crashed the Node 20 process** (one bad request took the instance down,
   causing collateral 404s). `http/express.ts` now wraps the handler and returns the error model.
3. **`listPublishedRequirements`** tolerates the not-yet-created collection-group index
   (FAILED_PRECONDITION → "none published") instead of 500.
4. Health at `/` + `/health` (the exact `/healthz` is swallowed by the Google Frontend edge).

## Dev vs production notes

- `LMS_DEV_AUTH=1` is set so the deployed API can be exercised with `X-Debug-Subject` /
  `X-Debug-Caps` headers. **Turn this OFF for production** and mount the host Cognito/JWT
  middleware ahead of `mountTrainingApi` (it already reads `req.user` when present).
- `--allow-unauthenticated` exposes the URL; the app still fails closed (401) without valid auth.

## Remaining before production

- Create the Firestore composite/collection-group indexes (see `DYNAMODB_ACCESS_PATTERNS.md`) once
  requirement/content definitions are published.
- Replace dev-auth with the real Cognito/JWT middleware; set `LMS_DEV_AUTH=0`.
- Certificate PDF renderer worker + SCORM runtime adapter.
- Seed content/requirement definitions; run the shadow-mode migration.
- Re-deploy is idempotent: `gcloud run deploy lms-backend --source <ctx> ...` (see history above).
