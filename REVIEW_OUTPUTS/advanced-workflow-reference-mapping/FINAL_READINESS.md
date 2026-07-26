# Advanced Training + Workflow References — Final Readiness (§21)

Branch `feature/governing-body-portal` (runtime owner of the journey app on 5190), clean,
pushed. **No deploy. No backend. No new workflow-training player.**

## Status: **CONDITIONAL PASS**

All code/data acceptance criteria are met and covered by runnable checks; the only remaining
item is the full automated multi-viewport/persona browser matrix (§19), which is NOT RUN as an
automated suite (a scripted desktop browser sweep was done).

## §21 acceptance checklist

| Criterion | Status |
|---|---|
| Advanced Training appears only for PT/RN/DON/ADM | ✅ (invariant: hidden for all other roles; no GB) |
| Contains exactly four modules | ✅ cms-485, qapi, oasis-e2-soc, documentation-matters (order asserted) |
| Plan of Care, QAPI, OASIS, Documentation all render | ✅ |
| Four modules appear in onboarding AND annual/recurring | ✅ same ids, same players, two contexts |
| Every Advanced card launches the canonical player | ✅ (invariant: playerAvailable + launchRef for all 4) |
| Other roles retain applicable content outside the Advanced label | ✅ canonical assignments untouched; only the Advanced UI projection is exclusive |
| Full workflow catalog comes from the canonical source | ✅ generated from workflows.generated.ts (206) + manifest + drift gate |
| Workflows are role/persona filtered | ✅ personaWorkflowMap (§15) |
| Workflows are references, not required training | ✅ removed from Training list; reference types only |
| No persona receives all 206 as required | ✅ (invariant: bounded typed refs; RN 36 / office 28 / not 206) |
| No GB persona in Employee Journey | ✅ (invariant: no "GB" key) |
| Governance-only workflows stay in Governance | ✅ GV-WF-01/02/13/14 never referenced (invariant) |
| Duty overlays work | ✅ 11 duty flags → workflow ids, merged at call time |
| Every workflow action opens a real detail | ✅ /journey/workflows/:id with canonical content; guardrail = no toast-only |
| No new workflow-training component was built | ✅ CL-WF-26 kept as a labeled prototype only |
| Browser + accessibility tests pass | ⚠️ NOT RUN as the full automated matrix (scripted desktop sweep only) |
| Correct branch pushed & synchronized | ✅ feature/governing-body-portal |
| No deployment occurred | ✅ |

## Runnable evidence

- `journey:verify:corrections` — advanced strict 4×4 (visible-for-4 / hidden-for-others /
  real player) + workflow reference model (no Training workflow cards; bounded typed refs;
  every ref id in the catalog; no GB; GV-only excluded; ADM leadership) — PASS.
- `journey:workflows:verify` — 7/7 (count 206, no drift, all 10 domains, not stale).
- `journey:verify:guardrails` — PASS (no target=_blank / window.open / unguarded localhost).
- `tsc --noEmit` — 0 errors across the changed files.

## Not run (honest)

The §19 automated browser matrix (320/375/768/1024/1440 + 200% zoom + keyboard + reduced
motion + screen-reader) across the persona set has not been run as an automated suite; live
verification was a scripted desktop sweep. This is the only CONDITIONAL item.

## Separate program flagged (not started)

The "IMPLEMENT THE CARE INDEED LMS BACKEND" master prompt is a distinct backend program; it
arrived truncated and its controlling `CARE_INDEED_LMS_BACKEND_ARCHITECTURE.md` is not present
in the repo or Documents. It also conflicts with this task's "do not do backend work" rule, so
it was intentionally NOT started. It needs the full prompt + the architecture file + an explicit
go-ahead (it touches server/Cloud Run/Cognito — outside this front-end task's guardrails).
