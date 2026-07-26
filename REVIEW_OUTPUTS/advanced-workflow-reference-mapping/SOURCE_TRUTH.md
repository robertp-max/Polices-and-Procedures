# Source Truth — Advanced Training + Workflow References

## Branch / worktree
- Worktree: `Policies_and_Procedures_V2_worktrees\GOVERNING_BODY_PORTAL`
- Branch: `feature/governing-body-portal`
- HEAD at time of audit: `aca70bf26937c601dfdb338f3736dde6f1e902ba` (2026-07-26T02:04:23-07:00)
- Working tree: clean, synced with its upstream at time of audit
- This worktree is the confirmed runtime owner of the employee-journey app on port 5190 (PID confirmed in the live session that produced the VERIFIED FACTS this package is built from).

## Branch discipline (per task §1)
- Stayed on `feature/governing-body-portal` for this entire deliverable. Did **not** switch to `onboarding_specialized` (the branch checked out in the primary repo working directory) or any other branch.
- No git commands were run to produce this package — no `git add`, `commit`, `checkout`, `branch`, `merge`, `reset`, `push`, or `stash`. Only read-only file reads were performed against the worktree.
- No application source, generated file, or script was edited to produce this package. Only new markdown files were written, and only under `REVIEW_OUTPUTS/advanced-workflow-reference-mapping/`.

## Git-safety posture
- This repo has a documented history of destructive-git incidents (see `AGENTS.md` / `CLAUDE.md` at the repo root: "this repo has been wiped 3x"). Per that standing rule and per this task's explicit instruction, no git command of any kind was invoked while producing this package.
- No `.js` files were emitted into any `src/` tree; no compiled output was created.

## Files grounding this package (read-only)
- `apps/employee-journey/app/journey/_data/advancedTraining.ts`
- `apps/employee-journey/app/journey/_generated/personaWorkflowMap.generated.ts`
- `apps/employee-journey/app/journey/_generated/workflowPersonaManifest.generated.json`
- `apps/employee-journey/app/journey/_generated/workflowCatalog.generated.ts`
- `apps/employee-journey/app/journey/_generated/workflowSourceManifest.generated.json`
- `apps/employee-journey/app/journey/_components/WorkflowsWorkspace.tsx`
- `apps/employee-journey/app/journey/_components/AdvancedWorkspace.tsx`
- `apps/employee-journey/scripts/verifyJourneyCorrections.ts`

## Scope note
`FINAL_READINESS.md` is intentionally **not** included in this package — it is written separately by the main developer, per the task instruction.
