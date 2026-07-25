# Source of Truth — Handbook Implementation

## Runtime owner

| Item | Value |
|---|---|
| Worktree | `Policies_and_Procedures_V2_worktrees/GOVERNING_BODY_PORTAL` |
| Branch | `feature/governing-body-portal` |
| App served | Employee Journey app |
| Port | 5190 (Vite) |
| Tree state before this work | Clean |

This worktree was chosen as the location to do the handbook-implementation work because it is the
runtime owner for the Employee Journey app — the app that hosts the `/journey/handbook` reader
routes — and its tree was clean at the start (no uncommitted work to collide with).

## Inputs located

| Input | Location / identity |
|---|---|
| Counsel review package | `Care_Indeed_2026_Employee_Handbook_Counsel_Review_Package.zip` (9 files) |
| Doc id | CI-HR-HB-2026 |
| Draft version | 1.0 |
| Status | `COUNSEL_REVIEW_DRAFT_NOT_EFFECTIVE` |
| Repo content root | `apps/employee-journey/content/handbook/2026-review/{source,generated,manifest}/` |
| Legacy archive | `apps/employee-journey/content/handbook/legacy-2022/` (archived PDF + `RETIREMENT_METADATA.json`) |
| Canonical logo asset | `/assets/logo-careindeed-orange.png` (768x768 PNG) |

## Git-safety posture

- No git commands were run as part of producing these deliverables.
- No history-destroying or destructive git operations (`reset --hard`, force-push, `clean -f`,
  branch deletion) were used or proposed.
- Any future staging of implementation changes should use exact-path `git add <file>` — never
  `git add -A` / `git add .` — to avoid sweeping in unrelated in-progress work from this
  worktree's untracked-file set.
- No deployment, build publish, or release action was taken. This is a documentation-only
  deliverable set; no code was edited to produce it.

## Scope of this deliverable set

These 8 documents describe the current, verified state of the handbook package, its ingestion
pipeline, and its release-readiness gates as they exist today. They do not represent an approval,
a release, or a distribution event — the handbook remains a non-effective draft (see
`HANDBOOK_RELEASE_GATE_REPORT.md`).
