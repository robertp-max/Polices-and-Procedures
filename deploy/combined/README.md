# Combined Cloud Run service — reference deploy artifacts

These are the files used to deploy the **full Care Indeed HH V2 app + canonical
auth backend** as a single same-origin Cloud Run service, and to prove the
end-to-end browser registration flow against the live URL.

> The app itself is built from the **`main`** branch (the full app with the real
> Register/Login UI). The `evidence` branch is a UI-only "designless baseline"
> scaffold with no registration. These files document how the deployed service
> was assembled; apply them to a `main` checkout as noted below.

| File here | Goes to (on a `main` checkout) | Purpose |
| --- | --- | --- |
| `cloudrun.ts` | `server/cloudrun.ts` | Minimal entry: serves the built SPA + mounts only `/api/auth` (AWS Cognito + DynamoDB). Same-origin, no CORS. |
| `Dockerfile` | `Dockerfile` (repo root) | Multi-stage: build the SPA, then run the TS server via `tsx`. Non-root runtime. |
| `dockerignore.txt` | `.dockerignore` | Keeps `.env.production` (public `VITE_*`) in the build context; excludes node_modules/.git/dist/secrets. |
| `approved-users.csv.example` | `config/approved-users.csv` | Allowlist format. For testing, a **synthetic** row is used (never committed). |

Build-time frontend config (in `.env.production` on the build): set
`VITE_AUTH_API_BASE_URL=/api/auth` (same origin) and `VITE_LOCAL_DEMO_AUTH_BYPASS=false`.

Runtime config + secrets are injected by Cloud Run (see
`docs/google-cloud/GCP_CLOUD_RUN_DEPLOYMENT.md`). AWS credentials come from a
**scoped, non-root** IAM user stored in Secret Manager — never baked into the image.

> Tip: deploy with `--set-env-vars` from **PowerShell**, not Git Bash. Git Bash
> (MSYS) mangles values like `/app/config/...` → `C:\Program Files\Git\app\...`
> and `https://...` → `https;\...`.
