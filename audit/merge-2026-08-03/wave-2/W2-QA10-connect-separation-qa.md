# W2-QA10 — Connect Separation QA

| Field | Value |
| --- | --- |
| Agent | Wave 2 / **W2-QA10** (Connect Separation QA) |
| Date | 2026-08-03 |
| Role | Independent re-verification of Connect repo separation |
| Merge worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| HEAD (short) | `5a24e941` |
| HEAD (full) | `5a24e941` — `chore(audit): complete wave-1 reports gate and remaining browser evidence` |
| Base | `7b0b6ae68456aa4aa353a69009ea3465767e48ec` — `Update onboarding modules and DON visuals` |
| Connect repo (external) | `C:\AI\Git\training\HomeHealth\connect` |
| Prior Wave-1 analyst | W1-A10 (`audit/merge-2026-08-03/wave-1/W1-A10-connect-repo-analyst.md`) — PASS |
| **Verdict** | **PASS** |

---

## 1. Executive summary

Independent Wave-2 QA re-checked the two hard separation requirements:

1. **`git diff --name-only 7b0b6ae6..HEAD` contains no Connect app source files** (e.g. `community-app.tsx`, Connect `app/`, Sites/Wrangler Connect tree).
2. **Connect remains a separate repository** (different git root, remote, package identity; not vendored into this merge worktree).

Both requirements **PASS**.

| Check | Result |
| --- | --- |
| Connect app source in `7b0b6ae6..HEAD` name-only list | **None** |
| `community-app.tsx` in merge worktree | **Absent** |
| `connect/` or `apps/connect/` under policy worktree | **Absent** |
| Connect-specific symbols in policy `.ts`/`.tsx` (`PortalModeSwitcher`, `resolveJourneyHref`, `care-indeed-community`) | **None** |
| External Connect repo still separate | **Yes** — own git root, remote, package `care-indeed-community` |
| Inventory still documents Connect as external | **Yes** — `MERGE_INVENTORY_2026-08-03.md` § Connect / Journey |

**Do not copy Connect into the Policies_and_Procedures merge branch.** Dirty Journey-toggle work stays only under `...\connect\app\community-app.tsx`.

---

## 2. Acceptance criteria (PASS/FAIL matrix)

| # | Criterion | Evidence | Result |
| --- | --- | --- | --- |
| C1 | `git diff --name-only 7b0b6ae6..HEAD` has **no** Connect repo app source (`community-app.tsx`, Connect `app/`, portal implementation) | Strict filter on 68 paths: zero matches for `community-app`, `care-indeed-community`, `PortalMode`, `resolveJourneyHref`, `^connect/`, `/connect/`, `apps/connect` | **PASS** |
| C2 | Connect remains a **separate** repo (not submodule, not nested tree, not same remote) | Connect root `C:/AI/Git/training/HomeHealth/connect` ≠ policy worktree; remotes differ (Sites vs GitHub); packages differ (`care-indeed-community` vs `ci-policy-app`); `CONNECT_is_inside_policy=NO` | **PASS** |
| C3 | No accidental copy of Connect source into worktree (tracked or untracked) | `git ls-files` empty for `community-app` / `care-indeed-community`; no untracked `community-app` / `connect/` porcelain hits; no `community-app.tsx` via filesystem scan | **PASS** |
| C4 | Inventory still marks Connect/Journey external / excluded | `MERGE_INVENTORY_2026-08-03.md` lines: Connect URL “Separate repo”; section “Connect / Journey (external, not in this branch)”; Wave-1 verification “Exclusion: Connect / Journey **OK**” | **PASS** |

**Overall: PASS** (4/4).

---

## 3. Diff range inspection (`7b0b6ae6..HEAD`)

### 3.1 Counts

| Metric | Value |
| --- | --- |
| Base | `7b0b6ae6` |
| HEAD | `5a24e941` |
| Paths in name-only list | **68** |
| Connect app source paths | **0** |
| Paths whose names contain the substring `connect` (case-insensitive) | **1** (audit doc only — see below) |

Note: Wave-1 W1-A10 recorded **32** paths at tip `60f17bb5`. Current tip `5a24e941` adds Wave-1 audit/evidence commits (now **68** paths). Separation still holds after that growth.

### 3.2 Category breakdown (all 68 paths)

| Category | Count | Connect app source? |
| --- | --- | --- |
| `MERGE_INVENTORY_2026-08-03.md` | 1 | No (docs; marks Connect external) |
| `apps/ehr-prototype-static/**` | 21 | No (static EHR mirror on 5191; fonts live under `_vinext_fonts/` — **not** Connect) |
| `docs/ehr-*.md` | 2 | No |
| `src/**` (reception/V6 shell/auth) | 8 | No |
| `audit/merge-2026-08-03/**` (Wave-1 reports + evidence) | 36 | No app source; one report **about** Connect separation |
| **Other** | 0 | — |

### 3.3 Filter results

**Strict Connect app-source filter** (must be empty for PASS):

```text
community-app | care-indeed-community | PortalMode | resolveJourneyHref
^connect/ | /connect/ | apps/connect
```

Result: **(none)** — zero paths.

**Loose / incidental hits (documented, non-failing):**

| Path pattern | Why it is not Connect app source |
| --- | --- |
| `apps/ehr-prototype-static/assets/_vinext_fonts/**` | Fonts shipped with the **EHR static prototype** mirror; shared build toolchain naming only. Not `community-app.tsx`, not Connect portal code, not port 5192. |
| `audit/merge-2026-08-03/wave-1/W1-A10-connect-repo-analyst.md` | Wave-1 **analysis report** that asserts Connect stays out of this branch. Documentation of separation, not vendoring of Connect. |

### 3.4 Full name-only list (68 paths)

```
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
audit/merge-2026-08-03/evidence/* (W1-A13 logs, W1-A14 screenshots/json, ehr-static-hash-inventory.*)
audit/merge-2026-08-03/wave-1/W1-A01 … W1-A16 + WAVE1-GATE.md
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

**Confirmed:** list contains **NO** Connect app source files (no `community-app.tsx`, no Connect `app/`, no Connect Sites/worker/db package tree).

---

## 4. Merge worktree hygiene (Connect-negative)

| Probe | Result |
| --- | --- |
| `Test-Path .\connect` | **False** |
| `Test-Path .\apps\connect` | **False** |
| Recursive `community-app.tsx` (excluding `node_modules`) | **None** |
| `git ls-files` match `community-app` / `care-indeed-community` | **Empty** |
| `git status --porcelain` match `community-app` / `connect/` | **Empty** |
| Grep in `*.{ts,tsx,js,jsx}` for `PortalModeSwitcher` / `resolveJourneyHref` / `care-indeed-community` / `community-app` | **No matches** |
| Policy `package.json` name | `ci-policy-app` (not Connect) |

Mentions of “Connect” that remain in-tree are limited to:

- Inventory / audit **prose** stating Connect is external (`MERGE_INVENTORY_2026-08-03.md`, W1-A10, W1-A11).
- Unrelated npm packages (`@types/connect`, `connect-history-api-fallback`) and non-product “connector” / “connectivity” English in docs/code.

These do **not** constitute Connect repo source.

---

## 5. External Connect repo still separate (identity proof)

| Field | Connect repo | Policy merge worktree |
| --- | --- | --- |
| Path | `C:\AI\Git\training\HomeHealth\connect` | `...\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Git root | `C:/AI/Git/training/HomeHealth/connect` | Worktree of `Policies_and_Procedures_V2` |
| `git-common-dir` | `.git` (standalone) | `C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/.git` |
| Nested inside policy worktree? | **NO** | — |
| Branch | `connect` (tracks `origin/connect`) | `codex/merge-local-app-surfaces-2026-08-03` |
| HEAD | `305ae2ee1e8d4993427c919323004e3595e67844` — `chore: checkpoint Connect app` | `5a24e941` — Wave-1 audit complete |
| Package name | `care-indeed-community` | `ci-policy-app` |
| Remote `origin` | `https://git.chatgpt-team.site/.../appgprj_6a684808ff288191a7f94807d0cbc49e.git` | `https://github.com/robertp-max/Polices-and-Procedures.git` |
| `app/community-app.tsx` present | **Yes** | **No** |
| Working tree | **Dirty** — only `app/community-app.tsx` (`+18 / −3`) Journey local → `:5193` | N/A for Connect source |

### 5.1 Ownership of dirty Journey toggle

Connect dirty file (stays in Connect repo only):

- Path: `C:\AI\Git\training\HomeHealth\connect\app\community-app.tsx`
- Diffstat: `app/community-app.tsx | 21 ++++++++++++++++++---`
- Intent (per W1-A10): local `localhost` / `127.0.0.1` Journey href → port **5193**; production URL unchanged.

**This file must not be copied or committed into the policy merge branch.**

### 5.2 Inventory alignment

From `MERGE_INVENTORY_2026-08-03.md`:

| Claim | Confirmed by W2-QA10 |
| --- | --- |
| Connect URL `http://127.0.0.1:5192/` — “Separate repo” | Yes |
| Section “Connect / Journey (external, not in this branch)” | Yes |
| Connect `connect` @ `305ae2e`; local `app/community-app.tsx` → Journey 5193; keep in Connect only | Yes (still dirty only on Connect) |
| Journey separate; no merge needed | Out of W2-QA10 scope for copy; inventory still correct |
| Exclusion: Connect / Journey **OK** / not in merge diff | Re-confirmed on 68-path list |

---

## 6. Why separation must continue (regression guard)

1. **Different products and remotes** — Sites Connect (`care-indeed-community`, vinext/Wrangler, port **5192**) vs policy Vite app (`ci-policy-app`, `tsc -b && vite build`).
2. **Different git identity** — separate roots and remotes; Connect is not a submodule of Policies_and_Procedures.
3. **Local DX only in Connect** — dirty `resolveJourneyHref()` → `:5193` belongs on Connect’s `connect` branch.
4. **Merge method was file-copy of reception + EHR static + docs** — Connect was never in the inclusion set.
5. **Inventory forbids inclusion** under external / intentionally excluded surfaces.

**Directive (unchanged from W1-A10):** do **not** copy `app/community-app.tsx` or any Connect `app/`, `worker/`, `db/`, Sites config into this policy merge worktree.

---

## 7. Evidence commands (reproducible)

```powershell
# Policy merge worktree
cd C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03
git rev-parse HEAD
git log -1 --oneline 7b0b6ae6
git diff --name-only 7b0b6ae6..HEAD
git diff --name-only 7b0b6ae6..HEAD | Where-Object {
  $_ -match '(?i)community-app|care-indeed-community|PortalMode|resolveJourneyHref|^connect/|/connect/|apps/connect'
}   # expect empty

Test-Path .\connect
Test-Path .\apps\connect
Get-ChildItem -Recurse -Filter community-app.tsx -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch 'node_modules' }

# Connect (separate)
cd C:\AI\Git\training\HomeHealth\connect
git rev-parse --show-toplevel
git branch --show-current
git log -1 --oneline
git status -sb
git diff --stat app/community-app.tsx
(Get-Content package.json -Raw | ConvertFrom-Json).name   # care-indeed-community
git remote -v
```

---

## 8. Cross-check vs Wave 1

| W1-A10 claim | W2-QA10 re-check |
| --- | --- |
| No Connect app source in `7b0b6ae6..HEAD` | **Confirmed** (now 68 paths; still zero app source) |
| No `community-app.tsx` in policy worktree | **Confirmed** |
| Connect separate at `...\connect` | **Confirmed** |
| Dirty Journey toggle only on Connect | **Confirmed** (`M app/community-app.tsx`, +18/−3) |
| Inventory exclusion | **Confirmed** |
| Verdict PASS | **Re-affirmed PASS** |

No regression introduced between Wave-1 analyst tip and current HEAD `5a24e941`.

---

## 9. Findings / residual notes

| Severity | Note | Blocks PASS? |
| --- | --- | --- |
| Info | Path list grew 32 → 68 via audit/evidence commits; none are Connect app source | No |
| Info | `_vinext_fonts` under EHR static can false-positive a naive `vinext` string search; not Connect | No |
| Info | Connect working tree remains dirty (Journey :5193) — **correct location** | No |
| None | No FAIL findings | — |

---

## 10. Final verdict

| Gate | Result |
| --- | --- |
| (1) Diff `7b0b6ae6..HEAD` free of Connect repo files (`community-app.tsx` etc.) | **PASS** |
| (2) Connect remains separate repo | **PASS** |
| **W2-QA10 overall** | **PASS** |

Report path: `audit/merge-2026-08-03/wave-2/W2-QA10-connect-separation-qa.md`
