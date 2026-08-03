# W2-QA01 — Scope Auditor

## Agent ID

**W2-QA01**

## Role

Wave 2 QA — Scope Auditor (independent; did **not** implement the merge).

Verify that `codex/merge-local-app-surfaces-2026-08-03` @ HEAD only contains approved product surfaces (reception, qapi docs, `apps/ehr-prototype-static`, inventory, audit artifacts), that no Fable `EHR_Prototype` worktree path appears in the merge delta, and that the dirty root was not used as merge staging.

## Checks

| # | Check | Result |
|---|--------|--------|
| 1 | List `git diff --name-only 7b0b6ae6..HEAD` product paths (exclude `audit/`) | **PASS** — 32 product paths; 36 under `audit/` (68 total) |
| 2 | Confirm only approved sources: reception surfaces, qapi docs, `apps/ehr-prototype-static`, inventory, audit artifacts | **PASS** — zero unexpected product prefixes; all product paths classified into approved buckets |
| 3 | Confirm **no** path from Fable `EHR_Prototype` worktree (absence via diff/history names only; did **not** enter Fable worktree as source) | **PASS** — no path name matches `Fable`, `EHR_Prototype/`, or worktree-external EHR prototype source trees; vendor path is `apps/ehr-prototype-static/` only |
| 4 | Confirm dirty root was **not** used as merge staging (worktree-only branch) | **PASS** — main root remains `onboarding_specialized` @ `7b0b6ae6`; merge tip is **not** an ancestor of root; 0 merge commits; all commits authored on merge branch in dedicated worktree |

**Overall: PASS**

## Commands

```text
# Identity
git rev-parse HEAD
git rev-parse --abbrev-ref HEAD
git status -sb
git rev-parse --show-toplevel
git worktree list
git rev-parse --git-dir
git rev-parse --git-common-dir

# Base / range
git rev-parse 7b0b6ae6
git merge-base --is-ancestor 7b0b6ae6 HEAD
git rev-parse safety/onboarding_specialized-2026-08-03
git log --oneline 7b0b6ae6..HEAD
git log --name-only --pretty=format:"%H %s" 7b0b6ae6..HEAD
git log --merges --oneline 7b0b6ae6..HEAD
git rev-list --merges --count 7b0b6ae6..HEAD
git log --first-parent --oneline 7b0b6ae6..HEAD

# Diff inventory
git diff --name-only 7b0b6ae6..HEAD
git diff --name-only 7b0b6ae6..HEAD | Where-Object { $_ -notmatch '^audit/' }
git diff --stat 7b0b6ae6..HEAD -- . ":(exclude)audit"

# Classification / bans
# product paths classified: reception | qapi docs | apps/ehr-prototype-static | inventory | UNEXPECTED
# name-only filters for Fable|EHR_Prototype|worktrees/EHR
# product content mentions of Fable/EHR_Prototype via git grep on MERGE_INVENTORY, apps, docs, src

# Dirty root (read-only; not used as staging)
git -C "C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2" rev-parse --abbrev-ref HEAD
git -C "C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2" rev-parse HEAD
git -C "C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2" status -sb
git merge-base --is-ancestor 5a24e941 onboarding_specialized
```

No destructive git. No push. Fable `EHR_Prototype` worktree was **not** entered as a merge source (listed only via `git worktree list` to prove isolation).

## Files examined

- Git range `7b0b6ae6..HEAD` (name-only + per-commit name lists + `--stat` excluding audit)
- `MERGE_INVENTORY_2026-08-03.md`
- `apps/ehr-prototype-static/README.md`
- `audit/merge-2026-08-03/wave-1/W1-A01-repo-safety-auditor.md` (cross-check only)
- `audit/merge-2026-08-03/wave-1/W1-A02-branch-manager.md` (cross-check only)
- Worktree registry (`git worktree list`)
- Main dirty root: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2` (branch/HEAD/status only)

## Evidence

### Identity (this worktree)

| Field | Value |
| --- | --- |
| Worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| HEAD | `5a24e94121f2e1872c454cac618e49c2884eb583` |
| Base | `7b0b6ae68456aa4aa353a69009ea3465767e48ec` (`onboarding_specialized` / safety tip) |
| Safety branch | `safety/onboarding_specialized-2026-08-03` → `7b0b6ae68456aa4aa353a69009ea3465767e48ec` |
| Git dir | `…/Policies_and_Procedures_V2/.git/worktrees/merge-local-app-surfaces-2026-08-03` |
| Merge commits in range | **0** |
| Working tree (merge) | Clean for product; untracked only `audit/merge-2026-08-03/evidence/W2-QA13-npm-run-build.log` (Wave 2 peer evidence, not in HEAD) |

### Check 1 — Product path list (`7b0b6ae6..HEAD`, exclude `audit/`)

**32 product paths:**

```text
MERGE_INVENTORY_2026-08-03.md
apps/ehr-prototype-static/README.md
apps/ehr-prototype-static/assets/_vinext_fonts/geist-8ac0455e797f/geist-001175b1.woff2
apps/ehr-prototype-static/assets/_vinext_fonts/geist-8ac0455e797f/geist-52306abf.woff2
apps/ehr-prototype-static/assets/_vinext_fonts/geist-8ac0455e797f/geist-875ccdd4.woff2
apps/ehr-prototype-static/assets/_vinext_fonts/geist-8ac0455e797f/geist-98bbbccb.woff2
apps/ehr-prototype-static/assets/_vinext_fonts/geist-8ac0455e797f/geist-ff2310f5.woff2
apps/ehr-prototype-static/assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-013b2f2f.woff2
apps/ehr-prototype-static/assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-0638449e.woff2
apps/ehr-prototype-static/assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-44745446.woff2
apps/ehr-prototype-static/assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-44e03052.woff2
apps/ehr-prototype-static/assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-971fb274.woff2
apps/ehr-prototype-static/assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-f6b33328.woff2
apps/ehr-prototype-static/assets/framework-CXnKph_e.js
apps/ehr-prototype-static/assets/index-B6csGzFL.css
apps/ehr-prototype-static/assets/index-CcITSQVe.js
apps/ehr-prototype-static/assets/layout-segment-context-CXNA_Ckw.js
apps/ehr-prototype-static/assets/page-DYDiOo50.js
apps/ehr-prototype-static/assets/query-D8Wk3mvj.js
apps/ehr-prototype-static/assets/rolldown-runtime-S-ySWqyJ.js
apps/ehr-prototype-static/favicon.svg
apps/ehr-prototype-static/index.html
docs/ehr-development-inventory.md
docs/ehr-uiux-discovery-plan.md
src/auth/apiClient.ts
src/v6/routing/routeRegistry.ts
src/v6/routing/router.tsx
src/v6/screens/RepresentativeScreens.tsx
src/v6/screens/pageviews/ReceptionScreen.tsx
src/v6/screens/pageviews/index.ts
src/v6/shell/V6Shell.tsx
src/v6/utils/safeRedirect.ts
```

**Bucket counts (product only):**

| Bucket | Count | Paths |
| --- | ---: | --- |
| inventory | 1 | `MERGE_INVENTORY_2026-08-03.md` |
| apps/ehr-prototype-static | 21 | full static mirror + README |
| qapi docs | 2 | `docs/ehr-development-inventory.md`, `docs/ehr-uiux-discovery-plan.md` |
| reception surfaces | 8 | `src/auth/apiClient.ts` + 7 `src/v6/**` |
| **UNEXPECTED** | **0** | — |

**`--stat` (product):** 32 files changed, 2561 insertions(+), 7 deletions(−).

**Audit range (approved):** 36 paths under `audit/merge-2026-08-03/` (wave-1 reports + evidence). Not product; allowed as audit artifacts.

### Check 2 — Approved sources only

Product path prefixes in the merge delta are **only**:

- `src/` → reception launcher / routing / shell / auth minimal copy (`src/v6/**`, `src/auth/apiClient.ts`)
- `docs/` → **only** the two qapi EHR discovery docs (`docs/ehr-*`)
- `apps/ehr-prototype-static/` → vendored static EHR mirror
- `MERGE_INVENTORY_2026-08-03.md` → merge inventory

**Not present in product delta (good):**

- `server/`, `public/`, `package.json` / lockfile, `vite.config.*`
- Connect / Journey app trees
- Broad dirty-root litter, secrets, `.env`
- Any path under a Fable or `EHR_Prototype` worktree directory

Commit mapping (feature product only):

| Commit | Subject | Product impact |
| --- | --- | --- |
| `79f25bd4` | feat(reception): add post-login reception launcher and EHR handoff | 8 reception files |
| `2aca52cf` | docs(ehr): add development inventory and UI/UX discovery plan | 2 qapi docs |
| `e0c678ed` | chore(apps): vendor static EHR prototype mirror for local 5191 handoff | `apps/ehr-prototype-static/**` |
| `5af4f6fd` / `60f17bb5` / `e03bb59e` | inventory docs | `MERGE_INVENTORY_2026-08-03.md` |
| later `chore(audit):…` | wave-1 evidence | `audit/**` only |

Method stated in inventory: pure file **COPY** into isolated worktree (no full `git merge` of diverged branches for product). Confirmed by **zero merge commits** in `7b0b6ae6..HEAD`.

### Check 3 — No Fable `EHR_Prototype` source path

**Diff/history path names:**

- `git diff --name-only 7b0b6ae6..HEAD` filtered for `Fable|EHR_Prototype` → **empty** (no matching path names).
- No path begins with or contains `Policies_and_Procedures_V2_worktrees/EHR_Prototype` or `EHR_Prototype/apps/…`.
- Vendor destination is exclusively `apps/ehr-prototype-static/` (in-repo mirror).

**Worktree isolation (registry only — did not use Fable tree as source):**

```text
…/Policies_and_Procedures_V2_worktrees/EHR_Prototype                          7b0b6ae6 [EHR_Prototype]
…/Policies_and_Procedures_V2_worktrees/merge-local-app-surfaces-2026-08-03  5a24e941 [codex/merge-local-app-surfaces-2026-08-03]
```

Separate sibling worktree exists; merge branch is **not** checked out there.

**Product content:** Mentions of “Fable” / `EHR_Prototype` in **changed** product files are exclusionary documentation only:

- `MERGE_INVENTORY_2026-08-03.md` — hard ban / “not included” statements
- `apps/ehr-prototype-static/README.md` — “**Not** Fable’s `EHR_Prototype` worktree”; source documented as Temp mirror `%LOCALAPPDATA%\Temp\care-indeed-ehr-prototype-local`

Unrelated pre-existing “Fable” wording exists elsewhere under `docs/` on HEAD (e.g. GAO journey architecture notes) but those paths are **not** in `7b0b6ae6..HEAD` and are outside this merge’s product delta.

### Check 4 — Dirty root not used as merge staging

| Surface | Branch | HEAD | Role |
| --- | --- | --- | --- |
| Main root `…\Policies_and_Procedures_V2` | `onboarding_specialized` | `7b0b6ae6` | Base; still dirty (unrelated local changes); **not** advanced to merge tip |
| Merge worktree | `codex/merge-local-app-surfaces-2026-08-03` | `5a24e941` | All merge product + audit commits live here |

- `git merge-base --is-ancestor 5a24e941 onboarding_specialized` → **false** (merge tip is **not** on main root history tip) → merge work stayed on isolated branch.
- Safety tip still pinned at base: `safety/onboarding_specialized-2026-08-03` = `7b0b6ae6`.
- Linear first-parent history from base; no merge-commit ingestion of dirty-root tree.
- Inventory claim “no dirty-root merge” matches git topology.

## Findings

1. **Scope is tight.** All 32 product files fall into the four approved product buckets; audit-only paths are under `audit/merge-2026-08-03/`.
2. **No unexpected product surface.** No server/package/public/Connect/Journey/secrets paths in the delta.
3. **Fable ban held.** Absence proven by name-only/history listing; Fable `EHR_Prototype` worktree not used as source; static EHR is vendored to `apps/ehr-prototype-static/` from documented Temp mirror.
4. **Worktree-only staging.** Dirty main root remains at base `7b0b6ae6` on `onboarding_specialized`; merge branch tip is isolated and was not applied through the root checkout.
5. **Residual (non-blocking for scope):** Untracked Wave-2 peer log `audit/merge-2026-08-03/evidence/W2-QA13-npm-run-build.log` exists in the worktree but is outside HEAD; does not expand product scope.

## Result

**PASS**
)
