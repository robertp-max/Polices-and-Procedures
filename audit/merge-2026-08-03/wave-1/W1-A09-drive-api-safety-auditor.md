# W1-A09 — Drive/API Safety Auditor

## Agent ID
W1-A09

## Role
Drive/API Safety Auditor (Wave 1) — search the committed tree and merge range `7b0b6ae6..HEAD` for secrets (tracked `.env`, private keys, service-account JSON, credentials JSON, tokens in `apps/` `docs/` `src/`), confirm `.env` is gitignored and untracked, confirm `apps/ehr-prototype-static` has no auth/API env secrets, and confirm Drive code fails closed without credentials.

## Verdict

**PASS** — No real secrets committed in the current tree (HEAD) or introduced in merge range `7b0b6ae6..HEAD`.

| Gate | Result |
|------|--------|
| Real private keys / PEM material in HEAD | **PASS** (none) |
| Service-account / credentials JSON with real key material | **PASS** (none; fixtures are placeholders only) |
| `.env` tracked | **PASS** (not tracked; gitignored) |
| Tokens / cloud API keys in `apps/` `docs/` `src/` | **PASS** (none found) |
| Merge range `7b0b6ae6..HEAD` secret introductions | **PASS** (none) |
| `apps/ehr-prototype-static` auth/API env secrets | **PASS** (none) |
| Drive auth fails closed without valid credentials/config | **PASS** |

## Checks performed

1. `git ls-files | findstr /i "env credentials service-account"` — inventory of tracked env/credential-named paths.
2. Confirmed `.env` is gitignored and **not** in `git ls-files` (`git ls-files --error-unmatch .env` fails as expected).
3. Grep/tracked-content search for `BEGIN PRIVATE KEY`, `private_key`, `service_account`, `client_secret`, AWS/GCP/OpenAI/GitHub token shapes (`AKIA…`, `AIza…`, `sk-…`, `ghp_…`, etc.).
4. Inspected merge range `7b0b6ae6..HEAD` name-only and content diffs for env/secret-shaped paths.
5. Scanned `apps/ehr-prototype-static` tracked assets for env/auth secret patterns.
6. Read `server/googleDriveAuth.ts`, `server/googleDrive.ts` (getClient), `server/env.ts` (`DRIVE_EVIDENCE_LOCK` / `assertDriveEvidenceLock`), fixtures + unit tests.

## Commands used

```text
git ls-files | findstr /i "env credentials service-account"
git check-ignore -v .env .env.local .env.production apps/ehr-prototype-static/.env
git ls-files .env .env.*
# .gitignore env/secrets section (read)

# High-risk patterns on tracked tree
git grep -n -I -E "BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY|-----BEGIN" -- .
git grep -n -I -E "AIza[0-9A-Za-z_-]{20,}|sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-" -- .
git grep -l "BEGIN PRIVATE KEY" HEAD
git grep -n "FAKE-TEST-PLACEHOLDER|BEGIN PRIVATE KEY" HEAD -- "*.json"
git ls-files "*.json" | findstr /i "service-account credentials secret key"
git ls-files server/credentials/

# Merge range
git log --oneline 7b0b6ae6..HEAD
git diff --name-only 7b0b6ae6..HEAD
git diff --stat 7b0b6ae6..HEAD -- apps/ docs/ src/ .env* server/credentials
git log --oneline --diff-filter=A 7b0b6ae6..HEAD -- "**/*service*" "**/*credential*" "**/*.pem" "**/*secret*"
git cat-file -e 7b0b6ae6:Builder/orbital-stage-443721-v1-99d78d776418.json
git cat-file -e HEAD:Builder/orbital-stage-443721-v1-99d78d776418.json

# EHR static surface
git ls-files apps/ehr-prototype-static
# Select-String on apps/ehr-prototype-static for private_key, AIza, sk-, VITE_, process.env, etc.

# Historical note (outside merge range, already deleted before base)
git log --oneline --diff-filter=D -- Builder/orbital-stage-443721-v1-99d78d776418.json
git merge-base --is-ancestor 339ccc22 7b0b6ae6
```

## Files examined

| Path | Why |
|------|-----|
| `.gitignore` | Env & service-account ignore rules |
| `.env.example` | Tracked template — resource IDs, empty secrets |
| `.env.production` | Tracked Vite public flags only |
| `src/v6/components/controlled-vertex-ai-compliance-review-harness/.env.example` | Placeholder Gemini key string |
| `server/credentials/.gitkeep`, `server/credentials/README.md` | Credential dir policy (no JSON keys tracked) |
| `server/googleDriveAuth.ts` | Fail-closed Drive auth planning |
| `server/googleDrive.ts` | Client init / auth error surface |
| `server/env.ts` | `DRIVE_EVIDENCE_LOCK`, `assertDriveEvidenceLock`, soft-fail without key file |
| `server/logger.ts` | Secret-field redaction |
| `src/policy/evidence/driveFirst/__fixtures__/fake-drive-key.matching.json` | Explicit fake fixture |
| `src/policy/evidence/driveFirst/__fixtures__/fake-drive-key.mismatch.json` | Explicit fake fixture (wrong identity) |
| `src/policy/evidence/driveFirst/serverDriveAuthPlan.test.ts` | Fail-closed unit coverage |
| `apps/ehr-prototype-static/**` | Vendored static EHR mirror (merge range) |
| `src/auth/apiClient.ts` | New in range — uses session token at runtime, no embedded secret |

## Evidence

### 1. Tracked env / credentials / service-account names

`git ls-files | findstr /i "env credentials service-account"` (relevant hits):

| Tracked path | Assessment |
|--------------|------------|
| `.env.example` | Template only. Documents `GOOGLE_APPLICATION_CREDENTIALS=./server/credentials/service-account.json` path; `API_SHARED_SECRET=` empty. Calendar/Drive IDs are **resource identifiers**, not private keys. |
| `.env.production` | **Two non-secret public Vite flags only** (see below). |
| `src/v6/components/controlled-vertex-ai-compliance-review-harness/.env.example` | Placeholders `MY_GEMINI_API_KEY` / `MY_APP_URL` — not live secrets. |
| `server/credentials/.gitkeep` | Empty marker; allowed exception in gitignore. |
| `server/credentials/README.md` | Docs: never commit JSON keys; out-of-repo path preferred. |
| `server/env.ts` | Code reads credentials from disk/env; does not embed key material. |
| `src/policy/evidence/driveFirst/__fixtures__/fake-drive-key.*.json` | Test fixtures with `FAKE-TEST-PLACEHOLDER-NOT-A-REAL-PRIVATE-KEY` only. |
| Various `*envelope*` paths | Name false positives (packet/signing envelopes), not cloud credentials. |

**Not tracked (confirmed):**

- `.env` — `git ls-files --error-unmatch .env` → pathspec did not match.
- `server/credentials/*.json` — gitignored; only `.gitkeep` + `README.md` listed.
- Any `*service-account*.json` or `*credentials*.json` with real material.

### 2. `.env` gitignored and not in `git ls-files`

From `.gitignore`:

```text
# Environment & secrets
.env
.env.*.local
.env.local

# Service-account credentials (NEVER commit)
docs/keys/
*service-account*.json
*credentials*.json
*.private.json
server/credentials/*.json
!server/credentials/.gitkeep
!server/credentials/README.md
```

- `git check-ignore -v .env` → ignored by `.gitignore` rule `.env`.
- `.env` **not** present in `git ls-files`.
- Note: `.env.production` is **not** covered by the bare `.env` ignore rule and **is** tracked; content is non-secret (see below).

### 3. Private keys / service-account JSON / tokens

| Check | Result |
|-------|--------|
| `BEGIN PRIVATE KEY` PEM blobs in HEAD content | **None** as key material. Only test assertion text in `serverDriveAuthPlan.test.ts` (`expect(…).not.toMatch(/BEGIN PRIVATE KEY/)`) and logger redaction regex in `server/ia/harness/AgentAuditLogger.ts`. |
| Fixture `private_key` fields | `FAKE-TEST-PLACEHOLDER-NOT-A-REAL-PRIVATE-KEY` only (both matching + mismatch fixtures). Explicit `_comment`: TEST FIXTURE ONLY. |
| AWS/GCP/OpenAI/Slack/GitHub token regexes over `apps` `docs` `src` `server` | **No matches**. |
| JWT-like `eyJ…` blobs in env/example/json | **No matches**. |
| `server/credentials/` | `.gitkeep` + `README.md` only. |

**Fixture sample (safe):**

```json
{
  "_comment": "TEST FIXTURE ONLY — this is NOT a real credential. …",
  "type": "service_account",
  "private_key": "FAKE-TEST-PLACEHOLDER-NOT-A-REAL-PRIVATE-KEY",
  "client_email": "careindeed-drive-evidence@orbital-stage-443721-v1.iam.gserviceaccount.com"
}
```

### 4. `.env.production` (tracked, non-secret)

Full content at HEAD:

```text
VITE_AUTH_API_BASE_URL=/api/auth
VITE_LOCAL_DEMO_AUTH_BYPASS=false
```

No API keys, tokens, or private material. Unchanged in merge range (`git diff 7b0b6ae6..HEAD -- .env*` empty).

### 5. Merge range `7b0b6ae6..HEAD`

Commits in range (at audit time included): reception launcher, EHR static vendoring, docs inventory, merge inventory docs, etc.

- **No** `.env` / `.env.example` / `.env.production` content changes in range.
- **No** additions under `server/credentials/` with secrets.
- **No** secret-file adds matching service/credential/pem patterns (`--diff-filter=A` empty for those globs).
- Range path of interest for auth: `src/auth/apiClient.ts` — builds `Authorization: Bearer ${envelope.accessToken}` from **runtime session** only; no embedded credentials.
- Only secrets-adjacent path addition in range: `apps/ehr-prototype-static/**` (static UI mirror) — clean of secrets (below).

### 6. `apps/ehr-prototype-static` — no auth/API env secrets

Tracked files: `README.md`, `index.html`, `favicon.svg`, CSS/JS bundles, Geist fonts.

| Pattern | Hits |
|---------|------|
| `private_key` / `BEGIN PRIVATE` / `client_secret` / `service.account` | none |
| `AIza…` / `sk-…` / `AKIA…` | none |
| `process.env` / `API_SHARED_SECRET` / hard-coded `access_token` / password assignments | none |
| `VITE_` | framework/vite runtime noise in bundles only (mapDeps / Next-style messages) — **no** embedded secret values |

`git ls-files apps/ehr-prototype-static | findstr /i "env credential secret key token auth api"` → **no matches**.

Conclusion: static EHR prototype mirror is UI-only; no auth/API environment secrets committed.

### 7. Drive code fails closed without credentials / bad config

#### `server/googleDriveAuth.ts` — pure fail-closed planner

`planDriveAuth()`:

- Unknown mode → throws `DriveAuthConfigError`.
- `impersonation` without `GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT` → throw (**fail closed**).
- Impersonation target ≠ locked approved Drive SA → throw (**fail closed**).
- Impersonation ignores any on-disk JSON key path (keyless); warns if key present.
- `key_file` mode is labeled `developmentOnly`; keys expected **outside** the repo via `GOOGLE_APPLICATION_CREDENTIALS`.
- Plan serialization deliberately excludes private-key content (`describeDriveAuthPlan` path-only).

Unit tests in `src/policy/evidence/driveFirst/serverDriveAuthPlan.test.ts` assert missing target, wrong target, unknown mode, and “no private_key / BEGIN PRIVATE KEY in plan”.

#### `server/googleDrive.ts` — runtime auth failure

`getClient()` calls `planDriveAuth` + `createDriveAuthClient`; on any error logs `google.drive.auth.failed` and throws `ApiError('auth_error', 'Failed to initialize Google Drive auth.', 500)`. Drive operations cannot proceed with a silent unauthenticated client.

#### `server/env.ts` — lock + soft boot without key

- Credentials file absence: **soft warn at boot** so IA/other subsystems can run without Google keys (`calendarCredentialsPresent === false`).
- When credentials **are** present and evidence is enabled, `assertDriveEvidenceLock()` validates SA email, project, shared drive, provider; mismatches throw when `throwOnMismatch` + enforced.
- Impersonation mode: missing/wrong target and packet-folder drift are problems; enforced when evidence enabled even without a key file (keyless path still fail-closed).
- `hasPrivateKey` is logged as boolean only — private key material is not logged (`server/logger.ts` redacts `private_key`, `client_secret`, `token`, `id_token`, `refresh_token`).

**Fail-closed summary:** production-shaped Drive auth refuses wrong/missing impersonation targets; lock refuses identity/drive drift when enforced; missing/broken credentials cause Drive auth init to error rather than operating open. Local boot without a key file is intentionally soft for non-Drive surfaces, but Drive/Calendar routes do not silently succeed without auth.

### 8. Historical note (outside this merge — not a FAIL for W1-A09)

A real service-account private key once lived at:

`Builder/orbital-stage-443721-v1-99d78d776418.json`

- **Deleted** in `339ccc22` (`feat(auth): add managed page access sync and deploy refresh`).
- `339ccc22` is an **ancestor of base** `7b0b6ae6` → deletion happened **before** this merge range.
- Path **does not exist** in trees of `7b0b6ae6` or `HEAD`.
- **Not re-introduced** in `7b0b6ae6..HEAD`.

This is residual **git history** risk on the long-lived branch (keys remain recoverable from old commits until history rewrite / key rotation ops outside this audit). **It does not fail this merge-wave check**, which requires no secrets in the current committed tree / merge delta. Operators should ensure that historical key is rotated/revoked in GCP if not already.

## Observations (non-blocking)

1. **Tracked `.env.production`** — only public Vite settings; consider documenting why it is force-tracked vs `.env`, or renaming to a non-dotenv path if tooling ever loads all `.env*` automatically.
2. **`.env.example` embeds live Calendar ID and Shared Drive ID** — these are resource IDs (not private keys). Acceptable for internal ops templates; treat as non-public identifiers if the repo is ever made public.
3. **Fake fixtures** are intentionally not named `*service-account*.json` / `*credentials*.json` so gitignore does not block tests; they contain zero real key material.
4. **Historical SA key** (pre-base) — recommend confirming GCP key revocation independently of this merge.

## Files / areas clean for merge

- No secret additions required to block merge on Drive/API safety grounds.
- `apps/ehr-prototype-static` vendoring is safe from a credentials standpoint.
- Drive fail-closed controls remain intact and tested.

## Final result

**PASS**

No secrets committed in HEAD; none introduced in `7b0b6ae6..HEAD`. `.env` is gitignored and untracked. EHR static prototype has no auth/API env secrets. Drive authentication fails closed on invalid/missing production config and surfaces auth errors when credentials cannot initialize a client.
