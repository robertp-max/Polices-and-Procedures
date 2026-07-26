# Mandated Workflow Library — Readiness (workflow-hardening §10)

Branch `feature/governing-body-portal`. **No deploy.** Fast-forward history preserved
(no `--no-ff`, no reset/force-push).

## Status: **CONDITIONAL PASS**

All code/data gates are met and covered by runnable checks; the only remaining item is the
full automated multi-viewport/persona browser matrix (§9 browser QA), which is NOT RUN as an
automated suite (a scripted in-app browser sweep at desktop width was done).

## §10 gate checklist

| Gate | Status | Evidence |
|---|---|---|
| CL-WF-26 identity resolved | ✅ PASS | Canonical registry (`workflows.generated.ts`) contains CL-WF-26 "Plan of Care Audit"; the prior 166-string was a subset omitting it. `TRAIN-CL-WF-26` is the training-namespaced simulation that teaches canonical CL-WF-26. |
| All workflow data from a controlled source | ✅ PASS | `journey:workflows:generate` reads the canonical registry → `workflowCatalog.generated.ts` (206) + `workflowSourceManifest.generated.json` (path + SHA-256 + counts). No hand-copied string remains in `fixtures.ts`. |
| Role mapping implemented | ✅ PASS | `ROLE_WORKFLOW_DOMAINS` + `assignedWorkflowsForPersona`; invariants assert RN→Clinical, ADM→gov/ops/compliance/finance, office→none-auto. |
| Assigned queue ≠ full enterprise library | ✅ PASS | Training "Workflows" tab = featured sim + role-applicable only; the 206-item library is a separate browse surface. |
| Every action opens something real | ✅ PASS | Assigned → `/journey/workflows/:id`; featured → `/journey/training/cl-wf-26`; guardrail scan confirms no toast-only/`window.open`/`_blank`. |
| Simulation has gated interactions | ✅ PASS | CL-WF-26 rebuilt on the `WorkflowTrainingDefinition` contract with real inputs + `validateStage`; progress = VALID count (not index). Invariants: opening stages = 0%, final stage not VALID w/o input, 100% only when all six VALID. |
| Standalone Workflows nav item | ✅ PASS | Added to the portal sidebar (verified live). |
| Detail shows canonical content (§5) | ✅ PASS | Detail renders overview, triggers, cadence/SLA, step-by-step table, required forms, approvals, outputs, escalation, upstream deps, policy/reg basis — verbatim from the registry. |
| Library UX (search/filter/pagination) (§6) | ✅ PASS | Search + 10-domain filter + "My assigned only" toggle + 25/page pagination (verified: "206 of 206 · page 1/9"). |
| Drift gate (§4) | ✅ PASS | `journey:workflows:verify` fails on count/title/domain drift, dupes, missing domain, or stale output (manifest hash ≠ live registry). 7/7 pass. |
| Source + browser tests pass | ⚠️ PARTIAL | Source/behavioral: `journey:verify:corrections` (incl. workflow + simulation assertions) + `journey:workflows:verify` + `journey:verify:guardrails` all PASS; tsc clean. Browser: scripted in-app sweep at desktop only — the full 320–1440 / 200% / keyboard / screen-reader automated matrix across personas is **NOT RUN**. |

## Open decision (flagged, owner's call)

The canonical registry has **206** workflows; the prior hardcoded set was **166**. This
implementation treats the registry (206) as the source of truth per §4. If the intended
"mandated" register is specifically 166, add an approved `mandated` allowlist so the catalog
still generates from the registry but the mandated count is 166 — a small follow-up.
