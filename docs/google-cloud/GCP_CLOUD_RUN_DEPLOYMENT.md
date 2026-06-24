# Google Cloud Run Deployment — Care Indeed Home Health V2 (web tier)

> Status: **DEPLOYED (web tier) — REGISTRATION BLOCKED.**
> This document describes the Cloud Run deployment of the **frontend web tier**
> (the V6 "designless baseline" SPA). Registration is **not** functional in this
> deployment; see **Known blockers** for the precise, evidence-backed reasons.
> No secret values, credentials, passwords, or tokens are recorded here.

---

## 1. What is deployed

| Item | Value |
| --- | --- |
| Project ID | `data-hangout-500409-j4` |
| Region | `us-central1` |
| Cloud Run service | `care-indeed-hh-v2-dev` |
| Cloud Run URL | `https://care-indeed-hh-v2-dev-rti5nksmma-uc.a.run.app` (alias: `https://care-indeed-hh-v2-dev-455039212099.us-central1.run.app`) |
| Active revision | `care-indeed-hh-v2-dev-00001-nch` |
| Artifact Registry repo | `care-indeed-v2` (Docker, `us-central1`) |
| Image | `us-central1-docker.pkg.dev/data-hangout-500409-j4/care-indeed-v2/care-indeed-hh-v2-dev:web-8cb7299` |
| Image digest | `sha256:d7fdfc02fe1caceb52c5a6c83036bd02a3cd462f71dbaeb6ec3283c8bcca2f2d` |
| Runtime service account | `care-indeed-hh-v2-runner@data-hangout-500409-j4.iam.gserviceaccount.com` (no IAM roles granted) |
| Ingress | `all` (public) — required so browsers can load Login/UI pages |
| Authn on invocation | `--allow-unauthenticated` (browser reach only; the app still has NO auth backend) |

The deployed artifact is the **Vite SPA build** (`dist/`) served by a
zero-dependency Node static server (`deploy/static-server.mjs`) on a distroless,
non-root runtime. It serves static assets, falls back to `index.html` for SPA
routes (deep links / refresh work), exposes a health endpoint at `GET /_health`
(the literal `/healthz` is shadowed by Google Front End and never reaches the
container, so `/_health` is the working alias), and returns a clean JSON `404`
for any `/api/*` path because **no API backend is deployed here**.

---

## 2. Required Google Cloud APIs

Enabled for this deployment:

- `run.googleapis.com`
- `artifactregistry.googleapis.com`
- `cloudbuild.googleapis.com`
- `iam.googleapis.com`

(`cloudbuild` is used because no local Docker daemon was available; the image is
built by Cloud Build.) Secret Manager was **not** enabled — the web tier holds no
secrets. It will be required if/when an auth backend is added (see blockers).

---

## 3. Environment variables

The SPA only consumes build-time `VITE_*` values (embedded into the client
bundle — these are **public by definition**, never secrets):

| Name | Classification | Notes |
| --- | --- | --- |
| `VITE_AUTH_API_BASE_URL` | public config | Base URL of the auth API. In this image it is **unset**, so the client falls back to same-origin `/api/auth` (which returns 404 here). `.env.production` in the repo points it at an AWS API Gateway that is currently **down (404)**. |
| `VITE_LOCAL_DEMO_AUTH_BYPASS` | public config | Must be `false`/unset in any real deployment. The dev bypass is additionally host-gated (only `localhost`/`*.vercel.app`), so it is **off** on `*.run.app`. |
| `PORT` | runtime (Cloud Run-provided) | Static server binds `0.0.0.0:$PORT` (default 8080). |

Server-side variables (NOT used by this web tier; listed for the future auth
backend): `AWS_REGION`, `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`, `FROM_EMAIL`,
`REGISTRATION_TABLE_NAME`, `APPROVED_USERS_CSV_PATH`, `AUTO_APPROVED_DOMAIN`,
`ADMIN_MANUAL_PASSWORD_EMAILS`, `PROTECTED_AUTH_EMAILS`. These would be **secrets /
secret-referenced config** and must be stored in Secret Manager, not on the
command line.

### Secret names

**None.** No Secret Manager secrets are created or attached for the web tier.

---

## 4. Authentication provider & registration architecture (canonical)

- **Canonical identity provider:** AWS Cognito (user pool). Passwords are managed
  by Cognito; the app never stores or hashes passwords itself.
- **Canonical user/profile store:** AWS DynamoDB (`REGISTRATION_TABLE_NAME`),
  durable. Registration writes a record with `status: active`.
- **Email:** AWS SES (legacy email-invite flow is disabled in code).
- **Registration is allowlist-gated:** `verify-registration` + `setup-account-direct`
  check the caller's `(email, Salesforce Org ID)` against an approved-users CSV
  (`config/approved-users.csv`, `APPROVED_USERS_CSV_PATH`). Open self-registration
  is intentionally not allowed.
- Server code: `server/auth/service.ts` (`DemoAuthService`), `server/routes/auth.ts`,
  `server/auth/approvedUsers.ts`. Frontend client: `src/auth/api.ts`.

This is a **managed, persistent** identity stack — it satisfies the "no
in-memory / no localStorage" requirement in principle. It is **not hosted on GCP**
and is **not reachable** from this deployment (see blockers).

---

## 5. Commands

All commands assume `gcloud config set project data-hangout-500409-j4`.

### Build (Cloud Build — no local Docker needed)
```bash
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/data-hangout-500409-j4/care-indeed-v2/care-indeed-hh-v2-dev:web-<TAG> \
  --project data-hangout-500409-j4 .
```

### Deploy / Update (same command; a new revision is created each time)
```bash
gcloud run deploy care-indeed-hh-v2-dev \
  --image us-central1-docker.pkg.dev/data-hangout-500409-j4/care-indeed-v2/care-indeed-hh-v2-dev:web-<TAG> \
  --region us-central1 \
  --service-account care-indeed-hh-v2-runner@data-hangout-500409-j4.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --ingress all \
  --min-instances 0 --max-instances 2 \
  --cpu 1 --memory 256Mi \
  --port 8080 \
  --no-cpu-boost \
  --project data-hangout-500409-j4
```

### Logs
```bash
gcloud run services logs read care-indeed-hh-v2-dev --region us-central1 --limit 100 \
  --project data-hangout-500409-j4
```

### Rollback (to a previous healthy revision)
```bash
# List revisions:
gcloud run revisions list --service care-indeed-hh-v2-dev --region us-central1 \
  --project data-hangout-500409-j4
# Send 100% traffic to a known-good revision:
gcloud run services update-traffic care-indeed-hh-v2-dev --region us-central1 \
  --to-revisions <PREVIOUS_REVISION>=100 --project data-hangout-500409-j4
```

---

## 6. Cost controls

| Setting | Value |
| --- | --- |
| Min instances | `0` (scales to zero — ~$0 at idle) |
| Max instances | `2` |
| CPU | `1` |
| Memory | `256Mi` |
| Startup CPU boost | disabled |
| Billable infra created | Artifact Registry repo (tiny storage) + Cloud Run (scale-to-zero). No GKE/VMs/SQL/LB/scheduler. |

**Budget alerts:** the Cloud Billing Budget API was disabled and no budget could
be confirmed. **Recommended manual step** (Console): *Billing → Budgets & alerts →
Create budget* for billing account `011A41-EFE1C7-7EA41D`, scope to project
`data-hangout-500409-j4`, set a monthly amount (e.g. $20–$50) with alert
thresholds at 50% / 90% / 100%.

---

## 7. Registration test procedure (when an auth backend exists)

Against the deployed URL:
1. Load `/login` and (once it exists) the Register route; confirm refresh works.
2. Submit a synthetic approved `(email, SF Org ID)` — value supplied via
   `REGISTRATION_TEST_EMAIL` env, never committed.
3. Confirm exactly one Cognito user + one DynamoDB record (`status: active`),
   least-privileged default role, no client-supplied admin role honored.
4. Log in, refresh (session persists), hit a protected route, confirm an
   admin-only route is denied, log out, confirm protected route is then denied.
5. Re-submit the same email → rejected (duplicate). Submit invalid input → rejected.
6. Inspect Cloud Run logs for absence of passwords/tokens/cookies.

### Test-account cleanup
Delete the synthetic Cognito user and its DynamoDB registration record after
testing; record whether cleanup succeeded. (Not applicable yet — no backend.)

---

## 8. Known blockers (why REGISTRATION is BLOCKED)

1. **The deployable app has no registration feature.** The active build is the V6
   "designless baseline" scaffold (`tsconfig.app.json` includes only
   `src/main.tsx`, `src/App.tsx`, `src/_scaffold`, `src/v6`). It has a `/login`
   placeholder, **no `/register` route**, and **no imports of the auth client**.
   The real Cognito-backed auth UI lives under `src/policy/**` + `src/auth/`, which
   are intentionally excluded from the build.
2. **The canonical auth backend is unreachable.** The AWS API Gateway in
   `.env.production` returns **HTTP 404**. The canonical store is AWS Cognito +
   DynamoDB — **not on GCP**; deploying the SPA to Cloud Run does not relocate it.
3. **No AWS credentials / config** are available in this environment
   (`aws sts get-caller-identity` = session expired; no `COGNITO_USER_POOL_ID` /
   `COGNITO_CLIENT_ID`), so the Express auth backend cannot run against Cognito,
   and persistence cannot be verified.
4. **No approved-users allowlist.** `config/approved-users.csv` is absent;
   registration fails closed (403) without it, and it would contain real employee
   PII that must not be fabricated or deployed.

### Path forward (requires a decision — see report)
- **Option A (keep canonical AWS Cognito):** supply `COGNITO_USER_POOL_ID`,
  `COGNITO_CLIENT_ID`, `AWS_REGION`, and scoped AWS credentials as **Secret
  Manager** secrets; deploy the Express server (or a same-origin proxy) on Cloud
  Run; provide a synthetic allowlist entry for testing.
- **Option B (GCP-native):** migrate auth to Firebase Authentication / Google
  Cloud Identity Platform. This is a **new billable identity product** and a code
  change — do not enable without explicit approval and cost review.

---

## 9. Manual console steps

- **Budget alert** (see §6) — Console only, recommended before sustained use.
- **Auth-backend secrets** (Option A) — create secrets in Secret Manager and grant
  `roles/secretmanager.secretAccessor` to the runtime SA **on those specific
  secrets only**.
