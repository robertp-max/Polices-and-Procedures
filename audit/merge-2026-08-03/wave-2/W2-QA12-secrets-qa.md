# W2-QA12 — Secrets QA

## Agent ID
W2-QA12

## Role
Secrets QA (Wave 2) — independent audit of committed content in merge range `7b0b6ae6..HEAD` and the index (staged) for real secrets: tracked `.env` material, private keys, service-account JSON secrets, tokens, and absolute credential paths carrying real secrets. Confirm `apps/ehr-prototype-static` is clean. **PASS only if no secrets.**

## Scope

| Item | Value |
| --- | --- |
| Merge worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| Base (exclusive) | `7b0b6ae68456aa4aa353a69009ea3465767e48ec` |
| HEAD | `5a24e94121f2e1872c454cac618e49c2884eb583` |
| Commits in range | 14 |
| Staged | **empty** (`git diff --cached` = 0 bytes) |
| Audit date | 2026-08-03 |

## Verdict

# **PASS**

No real secrets introduced in merge range `7b0b6ae6..HEAD`. No secrets staged. `apps/ehr-prototype-static` is clean (static UI mirror only; no private keys, no service-account JSON, no API tokens, no env secrets).

| Gate | Result |
| --- | --- |
| Tracked `.env` with real secret values in range | **PASS** — none added/changed in range |
| `BEGIN PRIVATE KEY` / PEM key material in range | **PASS** — none as key material |
| Service-account JSON with real private keys | **PASS** — only FAKE fixtures (pre-existing; not in range) |
| Tokens / API keys (AWS/GCP/OpenAI/GitHub shapes) in range | **PASS** — none |
| Absolute credential paths with real secrets in range | **PASS** — none |
| Staged index secrets | **PASS** — staged empty |
| `apps/ehr-prototype-static` clean | **PASS** |

---

## Method

1. Enumerate all files changed in `git diff --name-only 7b0b6ae6..HEAD` (68 paths) and staged (`git diff --cached --name-only` → empty).
2. Search range diffs and HEAD content for:
   - `.env*` paths
   - `private_key`, `BEGIN PRIVATE KEY`, `BEGIN RSA/OPENSSH/EC PRIVATE`
   - `service_account`, `client_secret`, `client_email` + key material
   - Token/key shapes: `AKIA…`, `AIza…`, `sk_live_`, `sk_test_`, `sk-…`, `ghp_…`, `xox[baprs]-…`, JWT-like `eyJ…`
   - Absolute credential paths: `C:\Users\…` / `GOOGLE_APPLICATION_CREDENTIALS=…` with secret material
3. Deep-scan `apps/ehr-prototype-static` (JS/HTML/CSS/md/svg) with precise patterns.
4. Inventory tracked env/credential files, `.gitignore` protections, and `server/credentials/`.
5. Spot-check merge-range source (`src/`, `apps/`, `docs/`) and wave-1 evidence logs/playwright JSON.

---

## Findings by category

### 1. `.env` files

| Path | Tracked? | In range `7b0b6ae6..HEAD`? | Content assessment |
| --- | --- | --- | --- |
| `.env` | No (gitignored) | No | Not present as committed content |
| `.env.local` | No (gitignored) | No | — |
| `.env.example` | Yes | **No change** | Template only; `API_SHARED_SECRET=` empty; Cognito IDs empty; `GOOGLE_APPLICATION_CREDENTIALS=./server/credentials/service-account.json` is a **relative path placeholder** (file not committed) |
| `.env.production` | Yes | **No change** | Only public Vite flags: `VITE_AUTH_API_BASE_URL=/api/auth`, `VITE_LOCAL_DEMO_AUTH_BYPASS=false` |
| `src/v6/components/controlled-vertex-ai-compliance-review-harness/.env.example` | Yes | **No change** | Placeholders `MY_GEMINI_API_KEY` / `MY_APP_URL` only |

**`.gitignore` (relevant):**

```
# Environment & secrets
.env
.env.*.local
.env.local
# Service-account credentials (NEVER commit)
*service-account*.json
*credentials*.json
server/credentials/*.json
!server/credentials/.gitkeep
!server/credentials/README.md
```

**Note (pre-existing, not range-introduced, not secret material):** `.env.example` documents non-secret Google resource IDs (`GOOGLE_CALENDAR_ID`, Shared Drive IDs). These are configuration identifiers, not private keys or tokens. No filled `API_SHARED_SECRET`, Cognito secrets, or key files.

### 2. Private keys / PEM

| Check | Result |
| --- | --- |
| `git grep "BEGIN PRIVATE KEY" HEAD` | Mentions only: W1-A09 audit prose + test assertion `not.toMatch(/BEGIN PRIVATE KEY/)` in `serverDriveAuthPlan.test.ts` |
| Real `-----BEGIN … PRIVATE KEY-----` blobs | **None** as key material |
| Range pickaxe `-S "private_key"` | Hits only W1-A09 audit markdown describing the prior audit |

### 3. Service-account JSON

| Path | In range? | Assessment |
| --- | --- | --- |
| `server/credentials/service-account.json` | N/A | **Does not exist** on disk; gitignored; only `.gitkeep` + README tracked |
| `src/policy/evidence/driveFirst/__fixtures__/fake-drive-key.matching.json` | **Not changed in range** | `"private_key": "FAKE-TEST-PLACEHOLDER-NOT-A-REAL-PRIVATE-KEY"` + `_comment`: TEST FIXTURE ONLY |
| `src/policy/evidence/driveFirst/__fixtures__/fake-drive-key.mismatch.json` | **Not changed in range** | Same FAKE placeholder; wrong identity for fail-closed tests |

`git grep private_key HEAD -- "*.json"` shows **only** the two FAKE fixtures above.

### 4. Tokens / API keys in range content

| Surface | Result |
| --- | --- |
| Diff on `src/`, `apps/`, `docs/` | No `client_secret`, `AIza…`, `AKIA…`, `sk_live_`, `ghp_…`, JWT-like triples |
| Only auth-related addition | `src/auth/apiClient.ts`: runtime `Authorization: Bearer ${envelope.accessToken}` from session load — **no hardcoded token** |
| Reception screen / EHR docs | No secret pattern hits |
| Wave-1 evidence logs / `W1-A14-playwright-results.json` | No private_key / PEM / client_secret / high-entropy bearer material |

### 5. Absolute credential paths

| Path mentioned in range | Assessment |
| --- | --- |
| `C:\Users\razer\AppData\Local\Temp\care-indeed-ehr-prototype-local` | **Source mirror path** for static EHR copy (audit/README provenance only). **Not** a credentials path; no key/JSON secret embedded. |
| `GOOGLE_APPLICATION_CREDENTIALS=…` with Windows absolute secret path | **None** in range |
| Patterns matching secret+absolute path combos | **None** |

### 6. Staged index

- `git diff --cached --name-only` → empty  
- `git diff --cached` character count → `0`  
- **No staged secrets.**

Untracked working-tree items at audit time are Wave-2 evidence artifacts (PNG/JSON/log/mjs under `audit/merge-2026-08-03/`) — **no** `.env`, service-account, `.pem`, or credential JSON names.

---

## `apps/ehr-prototype-static` — clean confirmation

### Tree introduced in range (commit `e0c678ed` + follow-ups)

| Kind | Paths |
| --- | --- |
| Docs | `README.md` |
| Entry | `index.html`, `favicon.svg` |
| Bundles | `assets/*.js`, `assets/*.css` |
| Fonts | `assets/_vinext_fonts/**/*.woff2` |

### README isolation claims (verified against content)

- Standalone static mirror for local `http://127.0.0.1:5191/`
- No backend integrations / auth wiring / API env secrets
- Source: local Temp mirror (not policy-app credentials)

### Precise secret scan (JS/HTML/CSS/md/svg)

Patterns with **zero hits**:

`BEGIN PRIVATE KEY`, `BEGIN RSA PRIVATE`, `private_key`, `"type": "service_account"`, `client_secret`, `AIza…`, `AKIA…`, `sk_live_`, `sk_test_`, `ghp_…`, `xox[baprs]-…`, `eyJhbGciOi`, high-entropy `apiKey=…`, `password=…`, `AWS_SECRET`, absolute `GOOGLE_APPLICATION_CREDENTIALS=C:\…`, `-----BEGIN`

### Benign non-secret observations

| Item | Why not a secret failure |
| --- | --- |
| Cloudflare challenge snippet in `index.html` (`__CF$cv$params`) | Scrape artifact from CDN challenge page; not an API key or private key |
| Public design-lab links (`care-indeed-ehr-business-plan.teejay1784.chatgpt.site`) | Public URLs |
| Synthetic patient demo data (names/MRN-style labels) | Labeled synthetic prototype data; not credentials |
| Runtime Bearer helper only in main app (`apiClient.ts`) | Session-derived at runtime; not committed secret |

**Conclusion:** `apps/ehr-prototype-static` is **clean** for secrets QA.

---

## Range file inventory (non-audit application surface)

| Area | Files | Secrets? |
| --- | --- | --- |
| `apps/ehr-prototype-static/**` | 21 tracked paths | **None** |
| `src/auth/apiClient.ts` | bearer header helper | **None hardcoded** |
| `src/v6/**` reception routing/shell/screens | Reception launcher + EHR handoff | **None** |
| `docs/ehr-*.md` | inventory + discovery plan | **None** |
| `MERGE_INVENTORY_2026-08-03.md` | merge docs | **None** |
| `audit/merge-2026-08-03/**` | wave-1 reports + evidence | Discusses secrets in W1-A09 only; **no real material** |

---

## Cross-check with Wave 1 (W1-A09)

Wave-1 Drive/API Safety Auditor (**PASS**) already established:

- No real PEM / private key material in HEAD
- Fixtures use `FAKE-TEST-PLACEHOLDER-NOT-A-REAL-PRIVATE-KEY`
- Logger redacts `private_key`, `client_secret`, `token`, `id_token`, `refresh_token`

This Wave-2 pass **re-validates independently** for the current tip (`5a24e941`) and the full merge range, with explicit focus on staged empty + `apps/ehr-prototype-static`.

---

## Residual notes (informational, do not fail)

1. **Tracked `.env.example` / `.env.production`** remain in the repo from before the merge range; neither was modified in `7b0b6ae6..HEAD`. Contents are placeholders / public Vite config only.
2. **Test fixtures** retain a real-looking SA email/project id string for lock tests, but `private_key` is an explicit non-key placeholder. Not introduced by this merge.
3. **Resource IDs** (calendar / shared drive) in examples are identifiers, not secrets; access still requires the gitignored service-account key.

---

## Commands / evidence summary

```text
git rev-parse HEAD
# 5a24e94121f2e1872c454cac618e49c2884eb583

git rev-list --count 7b0b6ae6..HEAD
# 14

git diff --cached --name-only
# (empty)

git diff --name-only 7b0b6ae6..HEAD
# 68 paths (apps static + reception src + docs + audit)

git ls-files "*env*" / credentials inventory
# .env.example, .env.production (templates); server/credentials/{.gitkeep,README.md} only

git grep -n "BEGIN PRIVATE KEY" HEAD
# audit prose + test negative assertion only

git grep -n "private_key" HEAD -- "*.json"
# FAKE fixtures only

# Precise Select-String over apps/ehr-prototype-static *.{js,html,css,md,svg}
# → zero hits for private_key / PEM / SA JSON / cloud token shapes
```

---

## Final gate

| Requirement | Status |
| --- | --- |
| Search committed content `7b0b6ae6..HEAD` | Done |
| Search staged | Done (empty) |
| `.env` / private_key / BEGIN PRIVATE KEY / SA JSON secrets / tokens / absolute credential paths with real secrets | **None found** |
| `apps/ehr-prototype-static` clean | **Confirmed** |
| **PASS only if no secrets** | **PASS** |

**Agent:** W2-QA12 (Secrets QA)  
**Verdict:** **PASS**  
**HEAD:** `5a24e94121f2e1872c454cac618e49c2884eb583`  
**Report:** `audit/merge-2026-08-03/wave-2/W2-QA12-secrets-qa.md`
