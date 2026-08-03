# W2-QA15 — Git Diff QA (Wave 2)

| Field | Value |
| --- | --- |
| Agent | **W2-QA15** (Git Diff QA) — independent |
| Date | 2026-08-03 |
| Merge worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Merge branch | `codex/merge-local-app-surfaces-2026-08-03` |
| Range | `7b0b6ae6..HEAD` |
| Base SHA | `7b0b6ae68456aa4aa353a69009ea3465767e48ec` (`Update onboarding modules and DON visuals`) |
| HEAD SHA | `5a24e94121f2e1872c454cac618e49c2884eb583` (`chore(audit): complete wave-1 reports gate and remaining browser evidence`) |
| Root checkout | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2` |
| **Overall verdict** | **PASS** |

---

## 1. Full `name-status` — `7b0b6ae6..HEAD`

**Command:** `git diff --name-status 7b0b6ae6..HEAD`

**Summary:** **68** paths — **62 Added**, **6 Modified**, **0 Deleted**, **0 Renamed**.

**Stat:** `68 files changed, 49021 insertions(+), 7 deletions(-)` (large delta driven by audit Playwright JSON + evidence binaries + static EHR vendor).

### 1.1 Complete name-status listing

```
A	MERGE_INVENTORY_2026-08-03.md
A	apps/ehr-prototype-static/README.md
A	apps/ehr-prototype-static/assets/_vinext_fonts/geist-8ac0455e797f/geist-001175b1.woff2
A	apps/ehr-prototype-static/assets/_vinext_fonts/geist-8ac0455e797f/geist-52306abf.woff2
A	apps/ehr-prototype-static/assets/_vinext_fonts/geist-8ac0455e797f/geist-875ccdd4.woff2
A	apps/ehr-prototype-static/assets/_vinext_fonts/geist-8ac0455e797f/geist-98bbbccb.woff2
A	apps/ehr-prototype-static/assets/_vinext_fonts/geist-8ac0455e797f/geist-ff2310f5.woff2
A	apps/ehr-prototype-static/assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-013b2f2f.woff2
A	apps/ehr-prototype-static/assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-0638449e.woff2
A	apps/ehr-prototype-static/assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-44745446.woff2
A	apps/ehr-prototype-static/assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-44e03052.woff2
A	apps/ehr-prototype-static/assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-971fb274.woff2
A	apps/ehr-prototype-static/assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-f6b33328.woff2
A	apps/ehr-prototype-static/assets/framework-CXnKph_e.js
A	apps/ehr-prototype-static/assets/index-B6csGzFL.css
A	apps/ehr-prototype-static/assets/index-CcITSQVe.js
A	apps/ehr-prototype-static/assets/layout-segment-context-CXNA_Ckw.js
A	apps/ehr-prototype-static/assets/page-DYDiOo50.js
A	apps/ehr-prototype-static/assets/query-D8Wk3mvj.js
A	apps/ehr-prototype-static/assets/rolldown-runtime-S-ySWqyJ.js
A	apps/ehr-prototype-static/favicon.svg
A	apps/ehr-prototype-static/index.html
A	audit/merge-2026-08-03/evidence/W1-A13-npm-run-build.exit
A	audit/merge-2026-08-03/evidence/W1-A13-npm-run-build.log
A	audit/merge-2026-08-03/evidence/W1-A13-npm-run-lint.exit
A	audit/merge-2026-08-03/evidence/W1-A13-npm-run-lint.log
A	audit/merge-2026-08-03/evidence/W1-A13-npm-test.exit
A	audit/merge-2026-08-03/evidence/W1-A13-npm-test.log
A	audit/merge-2026-08-03/evidence/W1-A13-shadow-js-check.log
A	audit/merge-2026-08-03/evidence/W1-A14-compliance.png
A	audit/merge-2026-08-03/evidence/W1-A14-ehr-static.png
A	audit/merge-2026-08-03/evidence/W1-A14-evidence-defensible-2.png
A	audit/merge-2026-08-03/evidence/W1-A14-evidence.png
A	audit/merge-2026-08-03/evidence/W1-A14-login-returnTo.png
A	audit/merge-2026-08-03/evidence/W1-A14-playwright-results.json
A	audit/merge-2026-08-03/evidence/W1-A14-reception-desktop.png
A	audit/merge-2026-08-03/evidence/W1-A14-reception-mobile.png
A	audit/merge-2026-08-03/evidence/W1-A14-root-redirect.png
A	audit/merge-2026-08-03/evidence/ehr-static-hash-inventory.json
A	audit/merge-2026-08-03/evidence/ehr-static-hash-inventory.md
A	audit/merge-2026-08-03/evidence/w1-a14-playwright-verify.mjs
A	audit/merge-2026-08-03/wave-1/W1-A01-repo-safety-auditor.md
A	audit/merge-2026-08-03/wave-1/W1-A02-branch-manager.md
A	audit/merge-2026-08-03/wave-1/W1-A03-reception-diff-analyst.md
A	audit/merge-2026-08-03/wave-1/W1-A04-reception-merger.md
A	audit/merge-2026-08-03/wave-1/W1-A05-reception-qa.md
A	audit/merge-2026-08-03/wave-1/W1-A06-qapi-diff-analyst.md
A	audit/merge-2026-08-03/wave-1/W1-A07-qapi-merger.md
A	audit/merge-2026-08-03/wave-1/W1-A08-drive-investigator.md
A	audit/merge-2026-08-03/wave-1/W1-A09-drive-api-safety-auditor.md
A	audit/merge-2026-08-03/wave-1/W1-A10-connect-repo-analyst.md
A	audit/merge-2026-08-03/wave-1/W1-A11-journey-link-verifier.md
A	audit/merge-2026-08-03/wave-1/W1-A12-conflict-resolver.md
A	audit/merge-2026-08-03/wave-1/W1-A13-build-runner.md
A	audit/merge-2026-08-03/wave-1/W1-A14-browser-verifier.md
A	audit/merge-2026-08-03/wave-1/W1-A15-inventory-writer.md
A	audit/merge-2026-08-03/wave-1/W1-A16-final-integrator.md
A	audit/merge-2026-08-03/wave-1/WAVE1-GATE.md
A	docs/ehr-development-inventory.md
A	docs/ehr-uiux-discovery-plan.md
A	src/auth/apiClient.ts
M	src/v6/routing/routeRegistry.ts
M	src/v6/routing/router.tsx
M	src/v6/screens/RepresentativeScreens.tsx
A	src/v6/screens/pageviews/ReceptionScreen.tsx
M	src/v6/screens/pageviews/index.ts
M	src/v6/shell/V6Shell.tsx
M	src/v6/utils/safeRedirect.ts
```

### 1.2 Commits in range (`git log --oneline 7b0b6ae6..HEAD`)

| SHA | Message |
| --- | --- |
| `5a24e941` | chore(audit): complete wave-1 reports gate and remaining browser evidence |
| `f99106df` | chore(audit): record final tip SHA in W1-A16 report |
| `ace7c0ed` | chore(audit): add remaining wave-1 agent evidence |
| `63ed9d8d` | chore(audit): stamp final branch tip in W1-A16 report |
| `b5d06c28` | chore(audit): complete W1-A16 wave-1 package |
| `43845c80` | chore(audit): stamp W1-A16 final HEAD |
| `22f8f932` | chore(audit): finalize W1-A16 integrator report |
| `d9db39a0` | chore(audit): add wave-1 evidence artifacts |
| `e03bb59e` | docs: refresh merge inventory after wave-1 verification |
| `60f17bb5` | docs: add build/QA results to merge inventory |
| `5af4f6fd` | docs: record local app surfaces merge inventory 2026-08-03 |
| `e0c678ed` | chore(apps): vendor static EHR prototype mirror for local 5191 handoff |
| `2aca52cf` | docs(ehr): add development inventory and UI/UX discovery plan |
| `79f25bd4` | feat(reception): add post-login reception launcher and EHR handoff |

### 1.3 Bucket breakdown (by path prefix)

| Bucket | Count | Role |
| --- | --- | --- |
| `src/**` (reception / routing / shell / auth) | 8 | Product merge surface |
| `docs/ehr-*` | 2 | qapi EHR discovery docs (copy) |
| `apps/ehr-prototype-static/**` | 21 | Intentional static EHR vendor for :5191 |
| `audit/merge-2026-08-03/**` | 36 | Wave-1 reports + build/browser evidence |
| Root inventory | 1 | `MERGE_INVENTORY_2026-08-03.md` |

### 1.4 Extension breakdown

| Ext | Count | Notes |
| --- | --- | --- |
| `.md` | 22 | Inventory, wave-1 reports, docs |
| `.woff2` | 11 | Vendored fonts |
| `.png` | 8 | Browser evidence screenshots |
| `.js` | 6 | **Only** under `apps/ehr-prototype-static/assets/` (not `src/`) |
| `.log` | 4 | W1-A13 build/lint/test/shadow evidence |
| `.ts` / `.tsx` | 4 / 4 | Reception product code |
| `.exit` | 3 | W1-A13 exit codes |
| `.json` | 2 | Playwright results + hash inventory |
| `.html` / `.css` / `.mjs` / `.svg` | 1 each | Static shell + CSS + verify script + favicon |

---

## 2. Accidental files / generated litter / secrets / Fable / Connect-Journey

### 2.1 Accidental files — **PASS (none found)**

Checked name-status against accidental / junk patterns:

| Pattern | In `7b0b6ae6..HEAD`? | Assessment |
| --- | --- | --- |
| `.env` / `.env.production` | No | OK |
| `node_modules/`, `dist/`, `coverage/`, `test-results/` | No | OK |
| `*.pem`, `*credentials*`, `id_rsa`, `*.key` | No | OK |
| Root scratch (`tmp-*`, `fix*.py`, `dev-*.log`, `build-*.log`) | No | OK |
| Dirty-root bulk (`UAT_Reports/`, `LVN_*`, `$null`, etc.) | No | OK — not staged into merge |
| `src/**/*.js` sibling shadows | **None** tracked | OK (AGENTS.md #1 rule) |

### 2.2 Generated litter — **PASS with intentional bulk noted**

| Item | Verdict | Rationale |
| --- | --- | --- |
| `apps/ehr-prototype-static/assets/*.{js,css,woff2}` | **Intentional** | Commit `e0c678ed` vendors static EHR mirror for local handoff; README declares isolation. **Not** under `src/` → does not violate “no compiled `.js` into `src/`”. |
| `audit/**/W1-A13-*.log` / `.exit` | **Intentional** | Wave-1 build evidence package. |
| `W1-A14-playwright-results.json` (~1.48 MB) | **Intentional but heavy** | Audit artifact; not app runtime. Acceptable for merge-audit branch; consider git-lfs or prune before long-lived main if desired (non-blocking). |
| Wave-1 PNG screenshots | **Intentional** | Browser verifier evidence. |
| Playwright verify `.mjs` under `audit/.../evidence/` | **Intentional** | Repro scripts for evidence. |

**No accidental build dumps** of the shapes banned in AGENTS.md (`build-*.log`, `npm-run-dev-*.{log,err,pid}` as root litter) appear in the committed range.

### 2.3 Secrets — **PASS (no real secrets in merge range product paths)**

Scans performed:

1. **Name-status:** no `.env`, `.pem`, credential filenames, service-account key paths.
2. **Content (selected blobs at HEAD):** `src/auth/apiClient.ts`, `ReceptionScreen.tsx`, `apps/ehr-prototype-static/index.html` + main asset JS, `W1-A14-playwright-results.json`, `MERGE_INVENTORY_2026-08-03.md` — **clean** for high-risk shapes (`BEGIN … PRIVATE KEY`, `AKIA…`, `sk-…`, `ghp_…`, `AIza…`, `xox…`).
3. **Diff text** matches for secret-like strings were limited to **documentation of secret-scanning** inside wave-1 safety reports (e.g. grep command examples, “no private_key found”), not live material.
4. Tree-wide `git grep` still finds **pre-existing base** test fixtures under `src/policy/evidence/driveFirst/__fixtures__/fake-drive-key.*.json` with `FAKE-TEST-PLACEHOLDER-NOT-A-REAL-PRIVATE-KEY` — **not introduced by this merge range** (not in name-status).

`src/auth/apiClient.ts` only reads session bearer at runtime (`loadSession()`); no hard-coded tokens.

### 2.4 Fable paths / EHR_Prototype source — **PASS (excluded)**

| Check | Result |
| --- | --- |
| Any path under `worktrees/EHR_Prototype` or Fable source tree in name-status | **None** |
| `apps/ehr-prototype-static` provenance | Temp mirror `%LOCALAPPDATA%\Temp\care-indeed-ehr-prototype-local` (documented in README + inventory) |
| Mentions of “Fable” / `EHR_Prototype` in diff | **Ban / exclusion language only** (README, inventory, wave-1 safety reports) |
| Inventory claim “Fable not used as source” | **Corroborated** by path list |

Hard ban statement present in `apps/ehr-prototype-static/README.md`:

> Not Fable’s `EHR_Prototype` worktree (`Policies_and_Procedures_V2_worktrees\EHR_Prototype` must never be used as a source).

### 2.5 Connect / Journey sources — **PASS (not included as product sources)**

| Check | Result |
| --- | --- |
| Paths from Connect repo (`…\connect\…`, `app/community-app.tsx`, etc.) in name-status | **None** |
| Employee Journey app sources / separate Journey repo paths in name-status | **None** |
| Files whose **names** match connect/journey | Audit-only: `W1-A10-connect-repo-analyst.md`, `W1-A11-journey-link-verifier.md` |
| Inventory | Documents Connect/Journey as **external**, ports 5192/5193, not merged |

### 2.6 Absolute machine paths

Absolute `C:\AI\…` and `C:\Users\razer\…` strings appear in **inventory and wave-1 audit markdown** (expected for this audit). They do **not** appear as import roots or runtime asset paths in the product `src/` reception code. Not treated as a FAIL.

### 2.7 Product surface sanity (scope check)

Reception-related tracked changes only:

- **Added:** `src/auth/apiClient.ts`, `src/v6/screens/pageviews/ReceptionScreen.tsx`
- **Modified:** `routeRegistry.ts`, `router.tsx`, `RepresentativeScreens.tsx`, `pageviews/index.ts`, `V6Shell.tsx`, `safeRedirect.ts`

No unrelated large `src/` product trees (policy journey modules, LMS packs, etc.) entered this range.

---

## 3. Dirty root checkout — still dirty, still `onboarding_specialized` (not cleaned)

**Path:** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2`

| Check | Result | Status |
| --- | --- | --- |
| Current branch | `onboarding_specialized` (tracks `origin/onboarding_specialized`) | **PASS** |
| HEAD | `7b0b6ae68456aa4aa353a69009ea3465767e48ec` (matches merge base) | **PASS** |
| Dirty? | **Yes — DIRTY** | **PASS** (must remain dirty / not cleaned) |
| Porcelain summary | **235** status lines: **1** modified tracked (`.claude/launch.json`), **234** untracked entries | **PASS** |
| Cleaned / reset? | No evidence of `reset --hard` / clean; bulk untracked litter still present (`UAT_Reports/`, `tmp-*`, `LVN_*`, `fix*.py`, logs, etc.) | **PASS** |

**Conclusion:** Main dirty root was **not** reconciled, cleaned, or rewound by the merge. Isolation holds.

---

## 4. Merge worktree clean vs intentional untracked audit leftovers

**Branch:** `codex/merge-local-app-surfaces-2026-08-03`  
**Tracked tree:** clean relative to HEAD (no staged/unstaged modifications to tracked files).

**Untracked only** (intentional Wave-2 concurrent QA evidence accumulating during this run):

### 4.1 Untracked inventory (snapshot at report time)

```
?? audit/merge-2026-08-03/evidence/W2-QA03-reception-playwright-results.json
?? audit/merge-2026-08-03/evidence/W2-QA03-reception.png
?? audit/merge-2026-08-03/evidence/W2-QA04-code-check-results.json
?? audit/merge-2026-08-03/evidence/W2-QA05-ehr-card-href.png
?? audit/merge-2026-08-03/evidence/W2-QA05-find-home-care-card.png
?? audit/merge-2026-08-03/evidence/W2-QA05-playwright-results.json
?? audit/merge-2026-08-03/evidence/W2-QA05-reception-ehr-launcher.png
?? audit/merge-2026-08-03/evidence/W2-QA06-evidence-defensible-2.png
?? audit/merge-2026-08-03/evidence/W2-QA06-evidence.png
?? audit/merge-2026-08-03/evidence/W2-QA13-npm-run-build.exit
?? audit/merge-2026-08-03/evidence/W2-QA13-npm-run-build.log
?? audit/merge-2026-08-03/evidence/W2-QA13-npm-run-lint.log
?? audit/merge-2026-08-03/evidence/W2-QA13-npm-test.exit
?? audit/merge-2026-08-03/evidence/W2-QA13-npm-test.log
?? audit/merge-2026-08-03/evidence/W2-QA13-shadow-js-check.log
?? audit/merge-2026-08-03/evidence/w2-qa03-reception-playwright.mjs
?? audit/merge-2026-08-03/evidence/w2-qa04-code-check.mjs
?? audit/merge-2026-08-03/evidence/w2-qa04-playwright-verify.mjs
?? audit/merge-2026-08-03/evidence/w2-qa05-ehr-launcher-verify.mjs
?? audit/merge-2026-08-03/wave-2/W2-QA06-playwright-results.json
?? audit/merge-2026-08-03/wave-2/w2-qa06-playwright-defensible.mjs
```

| Check | Result |
| --- | --- |
| Unrelated root litter / temp / secrets untracked | **None observed** |
| Untracked confined to `audit/merge-2026-08-03/{evidence,wave-2}/` | **Yes** |
| Classification | **Intentional Wave-2 audit leftovers** (not accidental product dirt) |

**Worktree status verdict:** **PASS** — clean tracked tree; only intentional untracked audit evidence.

*(Note: concurrent Wave-2 agents may add further untracked files under `audit/...` after this snapshot; that remains acceptable if confined to the audit tree.)*

---

## 5. Checklist scorecard

| # | Requirement | Result |
| --- | --- | --- |
| 1 | Full name-status `7b0b6ae6..HEAD` captured | **PASS** (68 paths) |
| 2a | No accidental / junk files in range | **PASS** |
| 2b | Generated litter only if intentional (static vendor + audit) | **PASS** |
| 2c | No secrets committed in merge product paths | **PASS** |
| 2d | No Fable / `EHR_Prototype` source content | **PASS** |
| 2e | No Connect / Journey **source** merge | **PASS** |
| 2f | No `src/**/*.js` shadow emit | **PASS** |
| 3 | Root still dirty + on `onboarding_specialized` (not cleaned) | **PASS** |
| 4 | Worktree clean or only intentional audit untracked | **PASS** |

---

## 6. Overall verdict

# **PASS**

The merge range is a coherent, intentional package:

1. **Reception product delta** (8 `src/` files),  
2. **qapi EHR docs** (2 files),  
3. **Isolated static EHR vendor** under `apps/ehr-prototype-static/` (Temp source, explicitly not Fable),  
4. **Wave-1 audit package** (inventory + reports + evidence),  

with **no** secrets, **no** dirty-root bulk, **no** Fable EHR_Prototype content, and **no** Connect/Journey application sources. Main checkout remains **dirty** on **`onboarding_specialized`** @ base `7b0b6ae6`. Merge worktree tracked state is clean; untracked files are **only** Wave-2 audit evidence under `audit/merge-2026-08-03/`.

### Non-blocking notes (do not fail this QA)

- Large committed Playwright JSON (~1.5 MB) is audit weight; fine on an audit branch, optional prune before eternal main history.
- Absolute machine paths in audit markdown are documentation-only.
- Wave-1 gate still records **W1-A13** test/lint debt as base-scope blocking for full release GO — orthogonal to this **git-diff hygiene** check.

---

## 7. Commands used (repro)

```text
git -C <merge-worktree> rev-parse HEAD
git -C <merge-worktree> diff --name-status 7b0b6ae6..HEAD
git -C <merge-worktree> diff --stat 7b0b6ae6..HEAD
git -C <merge-worktree> log --oneline 7b0b6ae6..HEAD
git -C <merge-worktree> status --porcelain=v1 -uall
git -C <merge-worktree> ls-files "src/**/*.js"
git -C <root> branch --show-current
git -C <root> rev-parse HEAD
git -C <root> status -sb
git -C <root> status --porcelain=v1
# + content scans for secret shapes / Fable / Connect-Journey path patterns
```

---

*End of W2-QA15 report.*
