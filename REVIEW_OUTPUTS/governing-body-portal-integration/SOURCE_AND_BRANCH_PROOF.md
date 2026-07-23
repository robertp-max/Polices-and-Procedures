# Source and Branch Proof — Governing Body Portal Integration

## Base source of truth
- Remote: `origin` = `https://github.com/robertp-max/Polices-and-Procedures.git`
- Fetched `origin/main` with `git fetch origin --prune` before any edit.
- **Base SHA (exact):** `9a6defca43dce832ea32707b53c68520d332e4ba`
- Base subject: `merge: reconcile admin control-plane (ADR-0002) into control-register hardening`

This is the current production line (admin control plane + control-register hardening +
Brad/Nolan/Packet/Drive/eCIgn production fixes), promoted to `main` earlier.

## Isolated feature branch + worktree
- **Branch:** `feature/governing-body-portal`
- **Base:** exact `9a6defca` (created with `git worktree add -b feature/governing-body-portal <path> 9a6defca`)
- **Worktree folder:** `C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2_worktrees/GOVERNING_BODY_PORTAL`
  (follows the existing `_worktrees` convention on the Windows host)
- Branch HEAD at creation: `9a6defca` (verified via `git -C <wt> rev-parse HEAD`)

## Guarantees
- No deploy performed. No merge into `main` performed.
- No destructive git operation used (no `reset --hard`, `clean`, `gc`, `prune`, `repack`,
  `maintenance`, `worktree prune`, `stash`, `add -A`, `add .`, and no force-push).
- The dirty primary checkout (`onboarding_specialized`) and all unrelated worktrees were not touched.
- All git staging will use **explicit paths only**.

## Production fixes preserved (base already contains them; integration is additive/surgical)
Cognito auth · login page · Brad · Nolan · Packet Studio · Google Drive protections · eCIgn ·
Admin/User Access · Master Controls · Compliance/Vendor/Contractor · Training modules ·
Cloud Run startup and route hardening.

_Last updated during integration; final SHAs recorded in FINAL report._
