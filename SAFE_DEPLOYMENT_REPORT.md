# SAFE DEPLOYMENT FOUNDATION REPORT

**Pass:** Safe GitHub + AWS staging deploy foundation
**Date:** 2026-05-14
**Scope guard:** LOCKED — foundation only. No CES, print, form, or
evidence behavior changes were made in this pass.

---

## TL;DR

| Area               | Status | Evidence |
| ------------------ | ------ | -------- |
| Git baseline       | ✅     | tag `pre-deploy-2026-05-14` @ `f3ebf6d` |
| Staging branch     | ✅     | local branch `staging` created from baseline |
| GitHub Actions CI  | ✅     | `.github/workflows/ci.yml` (typecheck + lint + build + permission matrix) |
| AWS staging IaC    | ✅     | `infra/aws-staging/` (CFN + bash scripts) |
| Lambda shells      | ✅     | 4 functions in `infra/aws-staging/lambdas/` |
| Storage boundary   | ✅     | `src/policy/evidence/storageMode.ts` + adapters |
| `.env.example`     | ✅     | staging variables added (no secrets) |
| Rollback guide     | ✅     | `docs/deploy/ROLLBACK_GUIDE.md` |
| Smoke checklist    | ✅     | `infra/aws-staging/smoke-test.sh` + this file §6 |
| Build validation   | ✅     | `npm run build` clean, 12.17 s |
| Typecheck          | ✅     | `npx tsc -b --noEmit` clean |
| Permission matrix  | ✅     | 10/10 acceptance checks pass |

No production resources were touched. No PHI was introduced. No
irreversible Object Lock was enabled. No raw artifact bytes are written
to `localStorage` from the new code path.

---

## 1. GitHub safety

### 1.1 Working tree at start

- Branch: `main`
- HEAD : `f3ebf6d170401ef86a5a9d061bde7eb37b607c2d`
  ("fix: resolve TypeScript build errors blocking Vercel deployment")
- Pre-existing uncommitted work: ~130 modified files + ~50 untracked.
  **None of it was committed, reverted, or modified by this pass.**
- Remote: `origin → https://github.com/robertp-max/Polices-and-Procedures.git`

### 1.2 Baseline tag + staging branch (created locally — not pushed)

```bash
git tag -a pre-deploy-2026-05-14 f3ebf6d \
  -m "Safety baseline: last commit before AWS staging deploy foundation pass"

git branch staging f3ebf6d
```

> The tag and branch are **local only**. Push them when ready:
>
> ```bash
> git push origin pre-deploy-2026-05-14
> git push origin staging
> ```

### 1.3 GitHub Actions workflow

`.github/workflows/ci.yml` runs on push/PR to `main` and `staging`:

| Step                        | Tool                          | Behavior                       |
| --------------------------- | ----------------------------- | ------------------------------ |
| Install                     | `npm ci --no-audit --no-fund` | hard-fails on lock drift       |
| Typecheck                   | `npx tsc -b --noEmit`         | hard-fails                     |
| Lint                        | `npm run lint`                | informational (`continue-on-error: true`) — backlog gate, will tighten later |
| Build                       | `npm run build`               | hard-fails                     |
| Permission matrix           | `scripts/verify-feature-access.mjs` | hard-fails on regressions      |
| Playwright (if specs exist) | `npx playwright test`         | conditional, hard-fails when run |
| Upload `dist/`              | actions/upload-artifact@v4    | retained 7 days                |
| Surface check (PR only)     | grep on diff                  | warns when deploy-sensitive paths change |

`concurrency: ci-${ref}` cancels superseded runs to save minutes.

### 1.4 Branch protection recommendations

Documented in `docs/deploy/ROLLBACK_GUIDE.md` §3. Summary:

- `main`: PR + 1 approval + `CI / validate` passing + linear history;
  no force-push, no deletions.
- `staging`: PR + 1 approval + `CI / validate`; treated as the deploy
  gate before promoting to `main`.
- Tag protection: `pre-deploy-*` admins only.

---

## 2. AWS staging foundation

Aligned with `Builder/Documentations/AWS_Phase1_Foundation_Build_Plan.md`
and `Builder/AWS-Architecture/02-Phase1-Serverless-Architecture.md`.

### 2.1 Layout

```
infra/aws-staging/
├── README.md                 ← deploy order + safety notes
├── deploy.sh                 ← interactive orchestration
├── teardown.sh               ← refuses non-staging
├── smoke-test.sh             ← 7-step end-to-end probe
├── 00-budget.yml             ← AWS Budgets + CloudWatch billing alarm
├── 01-buckets.sh             ← S3 staging bucket
├── 02-dynamodb.sh            ← compliance_objects table + GSIs + PITR
├── 03-iam.yml                ← per-Lambda least-privilege roles
├── 04-lambdas.sh             ← package + deploy
├── 05-apigateway.sh          ← HTTP API + routes
├── 06-cloudwatch.sh          ← log retention + Lambda error alarms
└── lambdas/
    ├── metadata-api/         ← GET /events/{id}/files
    ├── upload-init/          ← POST /uploads/init  (presigned PUT)
    ├── upload-validate-promote/ ← validate + promote → EVIDENCE_LOCKED
    └── export-zip/           ← POST /exports/survey-packet
```

### 2.2 Cost guardrails (Plan §11)

- **Budgets first.** `00-budget.yml` is the first step; soft alert at
  $25, hard at $40, monthly.
- **HTTP API only** (never REST API).
- **PAY_PER_REQUEST** DynamoDB.
- Lambda timeouts: 30 s for APIs, 120 s for export.
- **CloudWatch retention 14 days** (forced by `06-cloudwatch.sh`).
- S3 lifecycle expiries: raw 30 d, validated 60 d, evidence (staging)
  30 d, exports 7 d.
- Upload size cap: 25 MB enforced server-side.

### 2.3 Security guardrails

- Block Public Access ON for the staging bucket (all 4 flags).
- Default SSE-S3 encryption + bucket-key (KMS upgrade in Phase 2).
- Versioning ON.
- TLS-only bucket policy (deny `aws:SecureTransport=false`).
- CORS limited to `$HHC_WEB_ORIGIN`.
- **Object Lock OFF** in staging — explicit directive. Versioning +
  IAM deny-delete on `evidence/*` give rollback without irreversible
  Lock.
- IAM:
  - `lambda-metadata-api`: read-only DDB.
  - `lambda-upload-init`: PutItem on table, presign PUT to
    `uploads/raw/*` only.
  - `lambda-validate-promote`: deny `s3:DeleteObject` on `evidence/*`;
    deny `dynamodb:UpdateItem`/`DeleteItem` on `pk = AUDIT#*`.
  - `lambda-export-zip`: GetObject on `evidence/*`; PutObject on
    `exports/*`; query DDB.
  - `hhc-staging-deploy`: scoped to staging tag; explicit `Deny *` on
    any resource tagged `env=prod`.
- Lambdas reject any payload with `phi: true`.

### 2.4 Append-only audit chain

`upload-validate-promote` writes audit rows to `pk = AUDIT#{event_id}`
with `prev_hash`/`current_hash` linking. Schema matches Plan §3.

---

## 3. Evidence storage boundary

### 3.1 What was added

| File | Purpose |
| ---- | ------- |
| `src/policy/evidence/storageMode.ts` | Mode resolver, adapter contract, persisted-store guard |
| `src/policy/evidence/storage/localDemoAdapter.ts` | Wraps existing `demoEvidenceRuntimeCache` |
| `src/policy/evidence/storage/awsStagingAdapter.ts` | Calls API Gateway routes; never touches localStorage |
| `src/vite-env.d.ts` | Adds `VITE_EVIDENCE_STORAGE_MODE`, `VITE_AWS_API_BASE_URL`, `VITE_AWS_REGION` |

### 3.2 What was deliberately NOT changed

- `regulatoryExecutionStore.ts` is untouched. Its existing
  strip-on-persist guard already keeps `localDataUrl` and other
  payload fields out of `reg-execution-v2` (verified at lines
  474-478 of the current file).
- `demoEvidenceRuntimeCache.ts` is untouched. It continues to act as
  the per-tab + cross-tab byte cache for **local-demo mode only**.
- No call sites were rewired to the new adapter. Wiring is a
  follow-up pass, gated by the user.

### 3.3 Persisted-store guard (additive)

`assertNoArtifactPayload(obj, ctx)` in `storageMode.ts` enforces a
constant list of forbidden fields:

```
localDataUrl, base64, rawBytes, pdfBlob,
signedPacketBlob, certificateHtml, htmlSnapshot
```

In dev it throws; in prod it warns. **Not yet wired** into the persist
middleware — adding that single call site is the recommended first
follow-up because the behavior change is self-contained and tested by
the existing strip code.

### 3.4 Boundary contract (summary)

| Mode          | Init / promote                | Bytes location                | Preview                  |
| ------------- | ----------------------------- | ----------------------------- | ------------------------ |
| `local-demo`  | synthetic `demo://` URL       | `demoEvidenceRuntimeCache`    | data URL from cache      |
| `aws-staging` | API Gateway → Lambda          | S3 (`uploads/raw → evidence`) | 2-min presigned GET URL  |

---

## 4. Files changed / added

### Added
- `.github/workflows/ci.yml`
- `infra/aws-staging/README.md`
- `infra/aws-staging/deploy.sh`
- `infra/aws-staging/teardown.sh`
- `infra/aws-staging/smoke-test.sh`
- `infra/aws-staging/00-budget.yml`
- `infra/aws-staging/01-buckets.sh`
- `infra/aws-staging/02-dynamodb.sh`
- `infra/aws-staging/03-iam.yml`
- `infra/aws-staging/04-lambdas.sh`
- `infra/aws-staging/05-apigateway.sh`
- `infra/aws-staging/06-cloudwatch.sh`
- `infra/aws-staging/lambdas/metadata-api/{index.mjs,package.json}`
- `infra/aws-staging/lambdas/upload-init/{index.mjs,package.json}`
- `infra/aws-staging/lambdas/upload-validate-promote/{index.mjs,package.json}`
- `infra/aws-staging/lambdas/export-zip/{index.mjs,package.json}`
- `src/policy/evidence/storageMode.ts`
- `src/policy/evidence/storage/localDemoAdapter.ts`
- `src/policy/evidence/storage/awsStagingAdapter.ts`
- `docs/deploy/ROLLBACK_GUIDE.md`
- `SAFE_DEPLOYMENT_REPORT.md` (this file)

### Modified
- `.env.example` — added storage-mode + AWS staging deploy variables.
- `src/vite-env.d.ts` — added three optional `VITE_*` typings.

### Intentionally NOT touched
- `src/policy/stores/regulatoryExecutionStore.ts`
- `src/policy/evidence/demoEvidenceRuntimeCache.ts`
- All CES, print, form, eCIgn, evidence, journey, calendar code.
- All canonical CSV/XLSX data.
- All routes in `src/App.tsx`.
- Permissions UI enforcement (delivered in earlier passes; verifier
  re-run as part of CI).

---

## 5. Validation results

```text
$ npx tsc -b --noEmit          → exit 0
$ npm run build                → exit 0  (built in 12.17 s)
$ npx tsx scripts/verify-feature-access.mjs
=== ACCEPTANCE CHECKS ===
  PASS: Super Admin sees every enabled feature
  PASS: Admin (non-super) still sees Admin section after user.provision decoupling
  PASS: Auditor: read-only access enforced (evidence/audit/library yes; publish/replay no)
  PASS: RN: clinical access yes, admin/internal access no
  PASS: Onboarding (trainer): journey yes; admin/internal NO; scoped user.provision still granted
  PASS: Onboarding (trainer): no CES admin / eCIgn admin / audit-export / publish
  PASS: Director: clinical/staffing yes, admin no
  PASS: Suspended user: write/PHI/replay denied
  PASS: internalOnly features hidden from all non-admin roles
  PASS: policy.publish honors Phase A isApprovedVersion guard via resource meta
=== ALL CHECKS COMPLETE ===
```

---

## 6. Smoke-test checklist

Run after the AWS deploy completes:

```bash
export AWS_REGION=us-west-1
export HHC_ENV=staging
export HHC_BUDGET_EMAIL=you@example.com
bash infra/aws-staging/deploy.sh
export VITE_AWS_API_BASE_URL=<output of 05-apigateway.sh>
bash infra/aws-staging/smoke-test.sh
```

| # | Check                                                                | How verified                              |
| - | -------------------------------------------------------------------- | ----------------------------------------- |
| 1 | App loads in `local-demo` mode after build                           | `npm run preview` after `npm run build`   |
| 2 | `upload-init` returns presigned PUT URL                              | `smoke-test.sh` step 1                    |
| 3 | Demo synthetic artifact uploads to sandbox raw                       | `smoke-test.sh` step 2 (HTTP 200 to PUT)  |
| 4 | `validate` + `promote` create metadata; status = `EVIDENCE_LOCKED`   | `smoke-test.sh` steps 3–4                 |
| 5 | DynamoDB shows the `EVENT#…/FILE#…` row                              | `smoke-test.sh` step 5 (Count ≥ 1)        |
| 6 | Artifact metadata retrievable through API                            | `smoke-test.sh` step 6                    |
| 7 | CloudWatch shows no critical errors for any Lambda (last 15 min)     | `smoke-test.sh` step 7                    |
| 8 | Budget alarm exists                                                  | `aws budgets describe-budgets` (final line) |

---

## 7. What this pass intentionally did **not** do

- ❌ Did not deploy to AWS. The scripts are ready; the user runs them
  with their own AWS credentials.
- ❌ Did not push the baseline tag or `staging` branch to GitHub.
- ❌ Did not enable production Object Lock anywhere.
- ❌ Did not migrate `ces_ev_data_*` localStorage keys to IndexedDB
  (recommended, but a behavior change — see §8).
- ❌ Did not wire the new adapter into `regulatoryExecutionStore`
  (additive; recommended next pass).
- ❌ Did not touch CES, print views, forms, or evidence rendering.
- ❌ Did not commit any of the user's pre-existing uncommitted work.

---

## 8. Recommended next steps (in order)

1. **Push baseline + branches** when comfortable:
   ```bash
   git push origin pre-deploy-2026-05-14
   git push origin staging
   ```
2. **Configure branch protection** per `docs/deploy/ROLLBACK_GUIDE.md` §3.
3. **Run the deploy** with low-cost AWS staging account:
   ```bash
   export AWS_REGION=us-west-1 HHC_ENV=staging HHC_BUDGET_EMAIL=...
   bash infra/aws-staging/deploy.sh
   bash infra/aws-staging/smoke-test.sh
   ```
4. **Wire `assertNoArtifactPayload()`** into the persist `partialize`
   in `regulatoryExecutionStore.ts` (one-line change; in dev it will
   surface any forgotten payload field as a thrown error).
5. **Adapter wiring pass (separate scope):** swap the demo upload code
   path inside `regulatoryExecutionStore.uploadEvidence` to call
   `getEvidenceStorageAdapter()`. In `local-demo` mode behavior is
   unchanged; in `aws-staging` mode bytes route to S3.
6. **Then**, and only then, proceed with CES / print / form / evidence
   fixes that triggered the original deploy concern.

---

## 9. Rollback shortcut

```bash
# Source-code (safe, on protected branches):
git revert <bad-sha>

# AWS staging (data):
aws dynamodb restore-table-to-point-in-time --source-table-name hhc-staging-compliance-objects ...
aws s3api copy-object --bucket hhc-staging-... --copy-source ".../?versionId=<ver>" ...

# AWS staging (full reset):
HHC_ENV=staging AWS_REGION=us-west-1 bash infra/aws-staging/teardown.sh
```

Full procedures in `docs/deploy/ROLLBACK_GUIDE.md`.
