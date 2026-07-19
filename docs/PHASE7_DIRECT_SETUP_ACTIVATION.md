# Phase 7 — Direct account-setup activation (dev UAT)

Configuration plan for activating the approved **non-PHI** Phase 7 test identity
through the allowlist-gated direct-setup workflow
(`/setup-account-direct` → `verify-registration` → `setup-account-direct`).

**This document contains no real values.** Do not commit a real activation code,
the real test email in a live-invoking artifact, or `config/approved-users.csv`.

## Workflow authority
Direct setup is the **approved, allowlist-gated registration path** for the
CIHHC Cloud Run deployment (`docs/google-cloud/GCP_CLOUD_RUN_DEPLOYMENT.md §2`).
It is **not** a demo bypass and does **not** require Firestore. Server endpoints
independently re-verify `email + activation code` (client verification is not
authorization).

## Initial authority (least privilege)
- The canonical lowest-privilege initial group is **`grp-pending-user`**
  (`permissions: []`), assigned to every new authenticated user on login. It is
  the deterministic safe default — not a clinical role.
- The CSV `role` string is display-only and is read by `isAdminRole` /
  `evaluateAdminAccess` / `featureAccess`; it does **not** map to a group or
  page-access grant. Use **`Pending User`** (aligned with `grp-pending-user`) —
  never a value containing `admin`, `owner`, `security`, `super_admin`,
  `system_admin`, or `sys_admin`.
- Result: `manageUsers=false`; `/api/auth/admin/*` return 403; no privileged
  page-access record.

## CSV contract (canonical)
Header (exact), from `server/auth/approvedUsers.ts`:

```
email,fullName,sfOrgId,role,department,status,notes
```

- **email** (required) — normalized trim+lowercase; plus-tags preserved.
- **sfOrgId** (required) — normalized trim+UPPERCASE, whitespace removed. This
  field **functions as the activation code / shared secret**.
- role, department, status (`active`/`inactive`, blank ⇒ active), notes — optional.
- Rows missing email/valid-email/sfOrgId are skipped as malformed; blank status ⇒ active.

Template (placeholders only): `config/approved-users.csv.phase7-template.example`.

## Activation code (the `sfOrgId` value)
- **Never** use a predictable value (e.g. `PHASE7-UAT-001`).
- Generate a cryptographically strong random value with ≥128 bits of entropy,
  e.g. `openssl rand -hex 16` (128-bit) or `openssl rand -base64 24`, then remove
  spaces (the loader upper-cases and strips whitespace).
- Do **not** place the real value in Git, source, tests, chat, logs, URLs, or
  screenshots. It is entered by the operator in the browser (masked field).

## Deployment binding (Secret Manager file mount) — no code change
The runtime already sets `APPROVED_USERS_CSV_PATH=/app/config/approved-users.csv`;
the file is read lazily on first allowlist access (present at container start when
mounted). The Dockerfile does **not** bake `config/`, so mount the CSV as a secret.

1. Create a **dev-only** secret containing the one-row CSV (real values):
   - name: `ci-hhv2-approved-users-dev`
2. Grant read access to **only** the runtime service account:
   - `roles/secretmanager.secretAccessor` on `ci-hhv2-approved-users-dev` for
     `care-indeed-hh-v2-runner@data-hangout-500409-j4.iam.gserviceaccount.com`.
3. Mount it **read-only** at the exact env path (new revision; preserves the
   existing `AWS_*` env-secret bindings):
   ```
   gcloud run services update care-indeed-hh-v2-dev \
     --project data-hangout-500409-j4 --region us-central1 \
     --update-secrets "/app/config/approved-users.csv=ci-hhv2-approved-users-dev:latest"
   ```
- **Missing file** ⇒ allowlist unavailable ⇒ verify/setup fail closed (403);
  existing logins unaffected. **Email absent from CSV** ⇒ deterministic 403.

## Expiration (residual risk)
The direct flow has **no per-user pre-activation TTL** (no repository mechanism
for record expiry exists — none was invented). Mitigations:
- After successful activation, replay is prevented (status `active` ⇒ 409).
- Treat this path as **temporary dev-only UAT**: set a documented removal deadline
  and remove/inactivate the CSV row (or publish a new secret version without it)
  immediately after Phase 7. The UI makes **no** expiration claim.

## Rollback
- Revision: `gcloud run services update-traffic care-indeed-hh-v2-dev --region us-central1 --project data-hangout-500409-j4 --to-revisions <pre-mount-revision>=100`.
- Binding: redeploy with `--remove-secrets "/app/config/approved-users.csv"`.
- Registry: set the row `status,inactive` or publish a secret version without it.
- Confirm Drive/Calendar unchanged, JSONL default, Firestore inactive.

## Post-UAT cleanup
- Suspend/remove the test Cognito account per the approved lifecycle.
- Publish a new secret version without the identity; disable old versions.
- Deploy the cleanup revision if required.
- Preserve the JSONL audit evidence; document completion.

## Guardrails
- `.gitignore` already excludes `config/approved-users.csv` (real allowlist).
- Do not create the real Secret Manager secret, mount, or live user during code review.
