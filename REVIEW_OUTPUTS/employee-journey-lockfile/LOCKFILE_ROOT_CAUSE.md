# Lockfile Root Cause — Employee Journey / Main App

**Date:** 2026-07-27
**Branch:** `journey_specific_updates` @ `26ca51f1` (merge of `onboarding_specialized` into `feature/governing-body-portal`)
**Authorized action:** repair package-lock consistency / restore reproducible `npm ci` (narrow authorization per unblock prompt).

## Environment

| Field | Value |
|---|---|
| Node | v24.13.0 |
| npm | 11.6.2 |
| `packageManager` field | not present in either `package.json` |
| root `package-lock.json` lockfileVersion | 3 |
| root package name | `ci-policy-app` (no npm `workspaces`) |
| sub-package | `apps/employee-journey` (own `package-lock.json`) |

## Reproduction

Ran the repository's intended install command in both packages, from a state with **no** `node_modules` present (the worktree's prior `node_modules` was a directory junction to another worktree; it was removed with `rmdir` — link only, target untouched — before installing).

| Package | Command | Result |
|---|---|---|
| root (`ci-policy-app`) | `npm ci --no-audit --no-fund` | **exit 0** — added 758 packages in ~11s |
| `apps/employee-journey` | `npm ci --no-audit --no-fund` | **exit 0** — added 519 packages in ~22s |

Full logs: `/tmp/npmci.log`, `/tmp/npmci-ej.log` (deprecation warnings only; no `EUSAGE`/`Missing:`/`Invalid:` lock errors).

## Root cause

**No mismatch reproduces on the current merged branch.** Both `package.json` ⇄ `package-lock.json` pairs are consistent, and `npm ci` completes reproducibly in each package.

The previously reported "`npm ci` lockfile mismatch" blocker was recorded against an **older checkpoint (`8de5d895`)**. The current merge state (`26ca51f1`) already carries consistent lockfiles — the blocker is resolved by the state that exists here, not by a repair.

## Determination

- No `package-lock.json` change is required.
- **No lockfile-repair commit is warranted** — committing an unchanged/regenerated lock would be churn with no defect to fix.
- Dependency intent in the reviewed `package.json` files is preserved (untouched).
- `npm update`, `npm audit fix`, and transitive upgrades were **not** run.

## Net effect on the worktree

The `journey_specific_updates` worktree now has a real, freshly-installed root `node_modules` (from the reproduction `npm ci`) instead of the prior cross-worktree junction. This is strictly better for isolated builds/tests. No tracked files changed as a result.
