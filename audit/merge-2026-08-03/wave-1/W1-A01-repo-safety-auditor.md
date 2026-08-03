# W1-A01 — Repo Safety Auditor

## Agent ID
W1-A01

## Role
Repo Safety Auditor (Wave 1) — verify AGENTS.md hard bans, branch/worktree isolation, safety branch at base, main dirty root intact, and Fable/EHR_Prototype worktree not used as merge source.

## Checks performed
1. Read `AGENTS.md` hard bans (destructive git commands blocked).
2. Inspected merge worktree: `git status`, branch, HEAD, remotes, `git worktree list`.
3. Confirmed merge branch is `codex/merge-local-app-surfaces-2026-08-03`.
4. Confirmed safety branch `safety/onboarding_specialized-2026-08-03` exists and tips at base `7b0b6ae6`.
5. Confirmed main dirty root `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2` is still on `onboarding_specialized` and remains dirty (not cleaned/reset).
6. Confirmed `EHR_Prototype` worktree is listed, but merge range `7b0b6ae6..HEAD` name-only paths do not include Fable / worktree-external EHR_Prototype source paths.
7. Confirmed `7b0b6ae6` is an ancestor of merge HEAD (forward-only merge history from base).
8. No push performed. No destructive git performed.

## Commands used
```text
# AGENTS.md hard bans (read)
# (file read) Agents.md

# Merge worktree inspection
git status
git branch -vv
git rev-parse HEAD
git remote -v
git worktree list
git log -1 --oneline
git branch -a | Select-String -Pattern "safety|merge-local|onboarding"

# Safety / base / ancestry
git rev-parse safety/onboarding_specialized-2026-08-03
git log -1 --oneline safety/onboarding_specialized-2026-08-03
git rev-parse codex/merge-local-app-surfaces-2026-08-03
git log -1 --oneline 7b0b6ae6
git merge-base --is-ancestor 7b0b6ae6 HEAD
git rev-parse onboarding_specialized

# Main dirty root (read-only)
git -C "C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2" status -sb
git -C "C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2" rev-parse --abbrev-ref HEAD
git -C "C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2" rev-parse HEAD
git -C "C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2" log -1 --oneline
git -C "C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2" status --porcelain | Measure-Object

# Merge range / Fable exclusion
git log --oneline 7b0b6ae6..HEAD
git log --name-only --pretty=format: 7b0b6ae6..HEAD
# (filtered for Fable|EHR_Prototype|worktrees\EHR patterns)

# Worktree filter
git worktree list | Select-String -Pattern "EHR_Prototype|merge-local|Policies_and_Procedures_V2\s|onboarding_specialized"
```

## Files examined
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\Agents.md` (hard bans §0)
- Git metadata only for main root and worktrees (no entry into Fable EHR_Prototype as source content)

## Evidence (command outputs summarized)

### AGENTS.md hard bans (present and in force)
Blocked commands documented in `Agents.md`:
- `git reset --hard`
- `git clean -f` / `-fd` / `-fdx`
- `git checkout -f` / `git checkout -- .` / `git checkout .` / `git restore .`
- `git push --force` / `-f` / `--force-with-lease`
- `git branch -D`, `git reflog expire`, `git gc --prune=now`, `git switch --discard-changes`
- Rule: never move a branch pointer backward; create `safety/<branch>-<date>` before deploy/reconcile.
- Enforcement: Claude PreToolUse hook + `.githooks` reference-transaction / pre-push.

**This audit used only read-only git inspection. No destructive git. No push.**

### Merge worktree
| Item | Value |
|------|--------|
| Path | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| HEAD | `60f17bb58bc7f14781dbf5557cc205be04624131` |
| Tip message | `docs: add build/QA results to merge inventory` |
| Working tree | Clean at audit start (`nothing to commit, working tree clean`); after report write, only untracked `audit/` expected |
| Remote | `origin` → `https://github.com/robertp-max/Polices-and-Procedures.git` |

### Safety branch at base
| Item | Value |
|------|--------|
| Branch | `safety/onboarding_specialized-2026-08-03` |
| Tip SHA | `7b0b6ae68456aa4aa353a69009ea3465767e48ec` |
| Expected base | `7b0b6ae6` → full `7b0b6ae68456aa4aa353a69009ea3465767e48ec` |
| Match | **YES** — safety tip == base `7b0b6ae6` |
| Base message | `Update onboarding modules and DON visuals` |
| Ancestry | `7b0b6ae6` **is ancestor of** merge HEAD |

### Main dirty root (not cleaned / not reset)
| Item | Value |
|------|--------|
| Path | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2` |
| Branch | `onboarding_specialized` (tracks `origin/onboarding_specialized`) |
| HEAD | `7b0b6ae68456aa4aa353a69009ea3465767e48ec` |
| Dirty | **YES** — porcelain count **235** (1 modified + many untracked) |
| Interpretation | Working tree was **not** `clean -f` / `reset --hard` / force-checkout wiped; local dirty state preserved |

Sample dirty signals (non-exhaustive): `M .claude/launch.json`; many `??` including `LVN_*`, `UAT_Reports/`, `ONBOARDINGARCH.MD`, `MERGE_INVENTORY_2026-08-03.md`, recovery patches, tmp shots, etc.

### Worktrees of interest
```text
C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2
  7b0b6ae6 [onboarding_specialized]

C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2_worktrees/EHR_Prototype
  7b0b6ae6 [EHR_Prototype]

C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2_worktrees/merge-local-app-surfaces-2026-08-03
  60f17bb5 [codex/merge-local-app-surfaces-2026-08-03]
```
- `EHR_Prototype` worktree **is listed** (Fable path present as a worktree).
- Auditor **did not enter** EHR_Prototype as a merge source tree.

### Merge range `7b0b6ae6..HEAD` (commits)
```text
60f17bb5 docs: add build/QA results to merge inventory
5af4f6fd docs: record local app surfaces merge inventory 2026-08-03
e0c678ed chore(apps): vendor static EHR prototype mirror for local 5191 handoff
2aca52cf docs(ehr): add development inventory and UI/UX discovery plan
79f25bd4 feat(reception): add post-login reception launcher and EHR handoff
```

### Fable / EHR_Prototype path exclusion
- Unique paths changed in range: **32**
- Filter for `Fable`, `EHR_Prototype`, `Policies_and_Procedures_V2_worktrees\EHR`: **no matches**
- Changed content is in-repo only, e.g.:
  - `apps/ehr-prototype-static/**` (vendored static mirror under app tree — not the external worktree path)
  - `docs/ehr-development-inventory.md`, `docs/ehr-uiux-discovery-plan.md`
  - `MERGE_INVENTORY_2026-08-03.md`
  - `src/v6/...` reception/routing/shell/handoff files
  - `src/auth/apiClient.ts`

**Conclusion:** Fable worktree path is listed in worktrees but **not** used as a merge-source path in `7b0b6ae6..HEAD` name-only history.

## Findings
| # | Check | Result |
|---|--------|--------|
| 1 | AGENTS.md hard bans documented and understood | PASS |
| 2 | Merge work on `codex/merge-local-app-surfaces-2026-08-03` | PASS |
| 3 | HEAD at `60f17bb5…` on that branch; worktree clean at start | PASS |
| 4 | `safety/onboarding_specialized-2026-08-03` exists at base `7b0b6ae6` | PASS |
| 5 | Base `7b0b6ae6` is ancestor of merge HEAD (no rewind of base) | PASS |
| 6 | Main root still on `onboarding_specialized` @ `7b0b6ae6` | PASS |
| 7 | Main root still dirty (~235 porcelain entries) — not cleaned/reset | PASS |
| 8 | `EHR_Prototype` listed in `git worktree list` | PASS |
| 9 | No Fable / `EHR_Prototype` worktree paths in `git log --name-only 7b0b6ae6..HEAD` | PASS |
| 10 | No destructive git / no push by this agent | PASS |

### Notes (non-failing)
- Merge introduces `apps/ehr-prototype-static/` (vendored static assets). This is **in-tree** under the merge branch, not a path into `Policies_and_Procedures_V2_worktrees\EHR_Prototype`. Per task wording, Fable worktree was not used as merge source.
- After writing this report, merge worktree will show untracked `audit/` — expected artifact of Wave 1 reporting, not evidence of main-root mutation.

## Result: **PASS**

All required safety invariants hold:
1. Hard bans acknowledged; none violated by this audit.
2. Merge work isolated on `codex/merge-local-app-surfaces-2026-08-03` @ `60f17bb5`.
3. Safety branch `safety/onboarding_specialized-2026-08-03` tips exactly at base `7b0b6ae6`.
4. Dirty main root remains on `onboarding_specialized` @ `7b0b6ae6` with substantial uncommitted local state preserved.
5. EHR_Prototype worktree exists but is not a named path source in the merge commit range.

---
*Generated by W1-A01 Repo Safety Auditor — 2026-08-03 — read-only audit; no push; no destructive git.*
