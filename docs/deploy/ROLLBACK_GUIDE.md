# Rollback Guide — HHC App + AWS Staging

**Last reviewed:** 2026-05-14
**Pre-deploy baseline tag:** `pre-deploy-2026-05-14` → commit `f3ebf6d`
**Safety branches:** `staging` (created from baseline)

This guide covers two independent rollback paths:

1. **Source-code rollback** (revert the app to a known-good baseline).
2. **AWS staging rollback** (restore data, redeploy a known-good
   Lambda zip, or tear down completely).

There is intentionally **no production rollback path** — production has
not been provisioned by this foundation pass.

---

## 1. Source-code rollback

### 1.1 Verify the baseline tag exists

```bash
git tag --list pre-deploy-*
# → pre-deploy-2026-05-14

git show pre-deploy-2026-05-14 --stat | head -n 20
```

### 1.2 Inspect what changed since the baseline

```bash
git log pre-deploy-2026-05-14..HEAD --oneline
git diff --stat pre-deploy-2026-05-14..HEAD
```

### 1.3 Soft rollback (keep current work in working tree)

Use this when you only want to **point** main back to the baseline but
still review the in-progress changes locally.

```bash
# Make a recovery branch first so nothing is lost.
git checkout -b recovery/$(date +%Y%m%d-%H%M%S)
git push -u origin HEAD          # pushes recovery to remote (read-only)

# Then point main back without losing files.
git checkout main
git reset --soft pre-deploy-2026-05-14
git status                       # all post-baseline changes are now staged
```

### 1.4 Hard rollback (discard everything since the baseline)

> **Destructive.** Only do this after capturing a recovery branch.

```bash
git checkout -b recovery/pre-rollback-$(date +%Y%m%d-%H%M%S) HEAD
git push -u origin HEAD

git checkout main
git reset --hard pre-deploy-2026-05-14
git push origin main             # NEVER --force without team sign-off
```

If the remote refuses (it should, with branch protection), open a PR
that cherry-picks the baseline contents instead of force-pushing.

### 1.5 Cherry-pick rollback (recommended for shared branches)

```bash
git checkout main
git revert <commit-sha-to-undo>           # one or more times
git push origin main
```

This is the **safest** path on a protected branch and produces an
auditable revert commit.

---

## 2. AWS staging rollback

### 2.1 Quick rollback — redeploy the previous Lambda zip

The CI workflow (`.github/workflows/ci.yml`) uploads `dist-${sha}` as
an artifact for each green build. The deploy scripts publish each
Lambda from `infra/aws-staging/.build/<name>.zip`. To roll back:

```bash
# 1. Find the previous green build (CI Actions tab → Artifacts).
# 2. Download the matching .build/ folder OR rebuild from a baseline tag.
git checkout pre-deploy-2026-05-14
bash infra/aws-staging/04-lambdas.sh
git checkout main
```

### 2.2 Restore DynamoDB from PITR

PITR is enabled by `02-dynamodb.sh`.

```bash
TABLE=hhc-staging-compliance-objects
RESTORE_TIME=$(date -u -d '-1 hour' +%FT%TZ)

aws dynamodb restore-table-to-point-in-time \
  --source-table-name "$TABLE" \
  --target-table-name "${TABLE}-restored-$(date +%s)" \
  --restore-date-time "$RESTORE_TIME" \
  --region "$AWS_REGION"
```

After the restored table is `ACTIVE`, point Lambdas at it via
`HHC_DDB_TABLE` and rerun `04-lambdas.sh`.

### 2.3 Restore S3 objects from versioning

Versioning is enabled on the staging bucket. To restore a deleted or
overwritten object:

```bash
BUCKET=hhc-staging-${ACCOUNT_ID}-${AWS_REGION}
KEY="evidence/<policy>/<workflow>/<event>/<id>/<file>"

# List versions for the key.
aws s3api list-object-versions --bucket "$BUCKET" --prefix "$KEY"

# Promote a specific version back to current.
aws s3api copy-object \
  --bucket "$BUCKET" \
  --copy-source "$BUCKET/$KEY?versionId=<version_id>" \
  --key "$KEY"
```

### 2.4 Full staging tear-down

If the environment is unrecoverable, blow it away (staging only):

```bash
HHC_ENV=staging AWS_REGION=us-west-1 bash infra/aws-staging/teardown.sh
```

`teardown.sh` refuses to run unless `HHC_ENV=staging`. There is no
production resource set provisioned by this foundation, so there is
nothing irreversible to undo at the AWS level.

---

## 3. Branch protection recommendations

Apply these in **GitHub → Settings → Branches → Branch protection rules**.

### 3.1 `main`

| Setting                                         | Value                |
| ----------------------------------------------- | -------------------- |
| Require a pull request before merging           | ✅                    |
| Require approvals                               | ≥ 1                  |
| Dismiss stale reviews on new commits            | ✅                    |
| Require status checks to pass                   | ✅ — `CI / validate` |
| Require branches to be up to date before merging| ✅                    |
| Require signed commits                          | recommended          |
| Require linear history                          | recommended          |
| Restrict who can push                           | maintainers only     |
| Allow force pushes                              | ❌                    |
| Allow deletions                                 | ❌                    |
| Require deployments to succeed                  | (add after wiring)   |

### 3.2 `staging`

| Setting                                         | Value                |
| ----------------------------------------------- | -------------------- |
| Require a pull request before merging           | ✅                    |
| Require approvals                               | ≥ 1                  |
| Require status checks to pass                   | ✅ — `CI / validate` |
| Require branches to be up to date before merging| ✅                    |
| Allow force pushes                              | ❌                    |
| Allow deletions                                 | ❌                    |

> Treat `staging` as a deploy gate. PRs land on `staging` first, the
> AWS staging deploy runs, the smoke test passes, **then** a
> `staging → main` PR is opened.

### 3.3 Tag protection

GitHub → Settings → Tags → Tag protection rules:

- Pattern `pre-deploy-*` — admins only.
- Pattern `release-*` (future) — admins only.

---

## 4. Recovery decision tree

```
Did a deploy break the app?
├─ Yes — was it a code change?
│    ├─ Yes → §1.5 cherry-pick revert; CI redeploys to staging.
│    └─ No  → §2.1 redeploy previous Lambda zip.
└─ Was data lost or corrupted?
     ├─ DynamoDB → §2.2 PITR restore.
     ├─ S3       → §2.3 version restore.
     └─ Both     → consider §2.4 teardown + clean redeploy
                   from the baseline tag.
```
