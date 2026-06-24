# Google Cloud Run Deployment — Care Indeed Home Health V2

> Status: **DEPLOYED — REGISTRATION PASSED.**
> The full app (Register/Login UI + canonical auth backend) runs as a single
> same-origin Cloud Run service. The browser registration flow was proven
> end-to-end against the live URL, persisting to the canonical **AWS Cognito +
> DynamoDB** store, then the synthetic test user was deleted.
> No secret values, credentials, passwords, or tokens are recorded here.

---

## 1. What is deployed

| Item | Value |
| --- | --- |
| Project ID | `data-hangout-500409-j4` |
| Region | `us-central1` |
| Cloud Run service | `care-indeed-hh-v2-dev` |
| Active revision | `care-indeed-hh-v2-dev-00003-xsm` |
| Cloud Run URL | `https://care-indeed-hh-v2-dev-rti5nksmma-uc.a.run.app` (alias: `https://care-indeed-hh-v2-dev-455039212099.us-central1.run.app`) |
| Artifact Registry repo | `care-indeed-v2` (Docker, `us-central1`) |
| Image | `…/care-indeed-v2/care-indeed-hh-v2-dev:combined-1` (`sha256:9b14bfc8…`) |
| Runtime service account | `care-indeed-hh-v2-runner@data-hangout-500409-j4.iam.gserviceaccount.com` |
| Ingress / invocation | `all` / `--allow-unauthenticated` (browser reach only; app auth still enforced) |

**Architecture — one combined service (built from the `main` branch):**
- Vite SPA (real Register/Login UI) served as static files.
- Express auth API mounted at `/api/auth` (entry: `server/cloudrun.ts`) — **same
  origin**, so the browser flow needs no CORS.
- `/api/auth/*` talks to the **canonical AWS Cognito + DynamoDB** store.

The `evidence` branch is a UI-only "designless baseline" scaffold (no
registration); the deployed app is built from `main`. Reference deploy files:
[`deploy/combined/`](../../deploy/combined/).

---

## 2. Authentication provider & registration architecture (canonical)

- **Identity provider:** AWS Cognito user pool `us-west-1_XMOyEsbe6`
  (`careindeed-demo-auth-user-pool`), app client `4us6663av0u9t4nfce6ku2p1hd`
  (public client, `USER_PASSWORD_AUTH`), region `us-west-1`. Passwords are
  managed entirely by Cognito.
- **User/profile store:** DynamoDB table `demo_auth_registrations` (durable).
- **Registration is allowlist-gated, no email required:**
  1. `POST /api/auth/verify-registration` — `(email, Salesforce Org ID)` checked
     against the approved-users allowlist CSV.
  2. `POST /api/auth/setup-account-direct` — re-verifies, creates the Cognito
     user, sets a permanent password, writes the DynamoDB record `status:active`.
- **Default role = least privilege.** `getCurrentUser` returns no role; admin UI
  (`/admin/*`) is gated by `evaluateAdminAccess` (Super Admin / Admin group or a
  `super_admin` auth role). A freshly registered user has neither → denied.
  `setup-account-direct` accepts no client-supplied role/isAdmin → no escalation.

> Note: the standalone AWS API Gateway `d7w062or48…/auth` is an **older** Lambda
> (no `setup-account-direct`). This deployment does **not** use it; the Express
> backend in this container talks to Cognito/DynamoDB directly.

---

## 3. Required Google Cloud APIs

`run`, `artifactregistry`, `cloudbuild`, `iam`, `secretmanager` (all enabled).

---

## 4. Environment variables & secrets

**Runtime env (non-secret config):**

| Name | Value / note |
| --- | --- |
| `AWS_REGION` | `us-west-1` |
| `COGNITO_USER_POOL_ID` | `us-west-1_XMOyEsbe6` |
| `COGNITO_CLIENT_ID` | `4us6663av0u9t4nfce6ku2p1hd` (public client) |
| `REGISTRATION_TABLE_NAME` | `demo_auth_registrations` |
| `FROM_EMAIL` | `no-reply@careindeed.com` (required by config; direct flow sends no email) |
| `APPROVED_USERS_CSV_PATH` | `/app/config/approved-users.csv` |
| `APP_BASE_URL`, `ALLOWED_ORIGIN` | the Cloud Run URL |
| `NODE_ENV`, `LOG_LEVEL` | `production`, `info` |
| `VITE_AUTH_API_BASE_URL` (build-time) | `/api/auth` (same origin) |
| `VITE_LOCAL_DEMO_AUTH_BYPASS` (build-time) | `false` (dev bypass OFF; also host-gated) |

**Secret Manager secrets (names only — values never printed/committed):**

| Secret | Contents |
| --- | --- |
| `ci-hhv2-aws-access-key-id` | Scoped IAM access key ID |
| `ci-hhv2-aws-secret-access-key` | Scoped IAM secret access key |

Injected as `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` via
`--set-secrets`. The runtime SA has `roles/secretmanager.secretAccessor` on
**only** these two secrets.

### Scoped, non-root AWS credential
IAM user `ci-hhv2-cognito-runner`, inline policy `ci-hhv2-cognito-dynamo-scoped`:
- `cognito-idp:*` (AdminGetUser/AdminCreateUser/AdminSetUserPassword/
  AdminUpdateUserAttributes/AdminEnableUser/GetUser/InitiateAuth/
  RespondToAuthChallenge/GlobalSignOut/ForgotPassword/ConfirmForgotPassword) on
  **resource = pool `us-west-1_XMOyEsbe6` only**.
- `dynamodb:GetItem/PutItem/UpdateItem` on **resource = table
  `demo_auth_registrations` only**.
- No root keys, no broad admin, no other services, no PHI/real users.

---

## 5. Commands

### Build (Cloud Build, from a `main` checkout with the files in `deploy/combined/` applied)
```bash
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/data-hangout-500409-j4/care-indeed-v2/care-indeed-hh-v2-dev:combined-1 \
  --project data-hangout-500409-j4 .
```

### Deploy / Update — run from PowerShell (Git Bash mangles `/...` and `https://`)
```powershell
$URL="https://care-indeed-hh-v2-dev-rti5nksmma-uc.a.run.app"
gcloud run deploy care-indeed-hh-v2-dev `
  --image us-central1-docker.pkg.dev/data-hangout-500409-j4/care-indeed-v2/care-indeed-hh-v2-dev:combined-1 `
  --region us-central1 `
  --service-account care-indeed-hh-v2-runner@data-hangout-500409-j4.iam.gserviceaccount.com `
  --allow-unauthenticated --ingress all `
  --min-instances 0 --max-instances 2 --cpu 1 --memory 512Mi --no-cpu-boost --port 8080 `
  --set-env-vars "AWS_REGION=us-west-1,COGNITO_USER_POOL_ID=us-west-1_XMOyEsbe6,COGNITO_CLIENT_ID=4us6663av0u9t4nfce6ku2p1hd,REGISTRATION_TABLE_NAME=demo_auth_registrations,FROM_EMAIL=no-reply@careindeed.com,APPROVED_USERS_CSV_PATH=/app/config/approved-users.csv,APP_BASE_URL=$URL,ALLOWED_ORIGIN=$URL,NODE_ENV=production,LOG_LEVEL=info" `
  --set-secrets "AWS_ACCESS_KEY_ID=ci-hhv2-aws-access-key-id:latest,AWS_SECRET_ACCESS_KEY=ci-hhv2-aws-secret-access-key:latest" `
  --project data-hangout-500409-j4
```

### Logs
```bash
gcloud run services logs read care-indeed-hh-v2-dev --region us-central1 --limit 200 --project data-hangout-500409-j4
```

### Rollback
```bash
gcloud run revisions list --service care-indeed-hh-v2-dev --region us-central1 --project data-hangout-500409-j4
gcloud run services update-traffic care-indeed-hh-v2-dev --region us-central1 \
  --to-revisions <PREVIOUS_REVISION>=100 --project data-hangout-500409-j4
```

---

## 6. Registration test procedure (proven)

Browser E2E (Playwright, headless Chromium) against the live URL, with a
**synthetic** allowlisted identity (email + SF Org ID from env; password
generated in-memory, never logged):

1. `/register` loads (allowlist available).
2. Non-allowlisted identity → rejected (`403`, generic message).
3. Verify → setup → **account created** → redirect to `/login`.
4. Login → `/dashboard`; `localStorage` session present.
5. Refresh → still authenticated.
6. Protected route reachable; `/admin/roles` → **Access Denied**.
7. Logout → `/login`, session cleared; protected route then → `/login`.
8. Duplicate register (same identity) → rejected (`409` → forgot-password).
9. Verify in canonical store: Cognito `CONFIRMED`/enabled, **no groups**;
   DynamoDB `status:active`. Logs scanned — no passwords/tokens/keys.

### Test-account cleanup
```bash
aws cognito-idp admin-delete-user --user-pool-id us-west-1_XMOyEsbe6 --username <synthetic-email> --region us-west-1
aws dynamodb delete-item --table-name demo_auth_registrations --region us-west-1 \
  --key '{"pk":{"S":"EMAIL#<synthetic-email>"},"sk":{"S":"REGISTRATION"}}'
```
(Performed and verified after the test run.)

---

## 7. Cost controls

| Setting | Value |
| --- | --- |
| Min instances | `0` (scale to zero) |
| Max instances | `2` |
| CPU / Memory | `1` / `512Mi` |
| Startup CPU boost | disabled |
| Billable infra | Artifact Registry (tiny), Cloud Run (scale-to-zero), Secret Manager (negligible). No GKE/VM/SQL/LB. |

**Budget alerts:** Cloud Billing Budget API is disabled; no budget confirmed.
Create one in the Console: *Billing → Budgets & alerts*, billing account
`011A41-EFE1C7-7EA41D`, scope project `data-hangout-500409-j4`, e.g. $20–$50/mo,
thresholds 50/90/100%.

---

## 8. Revisions / rollback history

| Revision | What |
| --- | --- |
| `…-00001-nch` | Web-tier-only scaffold (SPA, no backend) — rollback target |
| `…-00002-sq6` | Combined, but env mangled by Git Bash (superseded) |
| `…-00003-xsm` | **Combined, working — current** |

---

## 9. Known notes

- Deploy `--set-env-vars` from **PowerShell**; Git Bash mangles `/app/...` and
  `https://...`.
- Capture AWS keys without a trailing CR when storing to Secret Manager (Windows
  CRLF will corrupt the secret → `SignatureDoesNotMatch`).
- The synthetic allowlist row is test-only and is **not** committed; production
  uses the real `config/approved-users.csv` (gitignored, employee PII).
- Hardening backlog: replace the long-lived IAM key with AWS IAM Roles Anywhere /
  workload-identity federation; prune runtime `node_modules` to prod + `tsx`.
