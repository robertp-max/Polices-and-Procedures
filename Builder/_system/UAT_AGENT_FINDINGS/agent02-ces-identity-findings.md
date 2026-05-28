# Agent 02 CES Identity UAT Findings

Generated: 2026-05-27

Scope: Assigned testers DON-01, DON-03, DON-07, ADM-04, CM-05. New-user and power-user perspectives were applied where the local demo role switcher and routes allowed. UAT only; no source edits made.

Executive verdict: FAIL for CES identity consistency. The canonical task verifier passes statically, and the Calendar-only duplicate-key verifier passes, but live cross-surface UAT still shows duplicate-key spam in role-based My Tasks, mismatched event/task identity across Sprint Board, Kanban, Gantt, direct Event Workspace routes, Evidence Center, and Audit Mode, and task state not preserved when opening the same task from multiple views.

## Commands And Artifacts

- `npm run verify:task-identity`: PASS.
- `npm run verify:calendar-keys`: PASS for `/calendar` duplicate-key check.
- Live UAT JSON: `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-live-uat-results.json`.
- Role/tab probe JSON: `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-role-tab-probes.json`.
- Defect log: `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-defect-log.csv`.
- Screenshots are prefixed `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-*.png`.

## Severity-Ranked Findings

### P1 - Duplicate React keys in CES My Tasks role review

Surfaces/routes: `/my-tasks`.

Personas: DON-01, DON-03, DON-07, CM-05 as power users switching role queues; ADM-04 as admin validating duplicate prevention.

Steps:
1. Open `/my-tasks`.
2. Use Robert review role chip `DON: 1405`.
3. Observe console.

Expected: no duplicate task IDs, no duplicate task rows, no React duplicate-key spam.

Actual: 24 React duplicate-key errors were captured. Repeated IDs include:
- `TASK-EVT-CL-AUDITMONTHLY-20260107-001-FORM-CO-FM-021-HY7IXP`
- `TASK-EVT-CL-AUDITMONTHLY-20260209-001-FORM-CO-FM-021-HY7IXP`
- `TASK-EVT-CL-AUDITMONTHLY-20260309-001-FORM-CO-FM-021-HY7IXP`
- continuing monthly through `TASK-EVT-CL-AUDITMONTHLY-20261207-001-FORM-CO-FM-021-HY7IXP`

Evidence:
- `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-role-tab-probes.json`
- `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-my-tasks-don-role.png`

### P1 - Same task loses state when opened from My Tasks into Calendar Sprint view

Surfaces/routes: `/my-tasks` -> `/calendar?view=sprint`.

Personas: DON-03 and DON-07 power-user cross-navigation; CM-05 refresh/route resilience.

Steps:
1. Open `/my-tasks`.
2. Switch to `DON`.
3. Open `Verify pre-input completeness across all 40 audit workflows; log any gap`.
4. App routes to `/calendar?view=sprint`.

Expected: same task opens with preserved `task_id`, status, role, due date, dependencies, and task detail drawer.

Actual: Calendar Sprint view showed `No CES tasks available for this view`; no `data-task-id` was present and no task detail was preserved.

Evidence:
- `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-my-tasks-opened-task-routed-calendar-sprint.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-role-tab-probes.json`

### P1 - Canonical task identity diverges across Sprint Board, Kanban, and Gantt

Surfaces/routes: `/ces/board`, `/calendar?view=kanban`, `/calendar?view=gantt`.

Personas: DON-03 and ADM-04 power-user cross-view sync; CM-05 duplicate prevention.

Steps:
1. Open `/ces/board`.
2. Note canonical board IDs such as `TASK-EVT-CO-AUDITMONTHLY-20260514-001-PROCESSFLOW-POST-BILL-AUDIT-20260514-01-01-VZ1OPF`.
3. Open `/calendar?view=kanban`.
4. Note corresponding Kanban IDs such as `post_bill_audit-20260514-01-01`.
5. Open `/calendar?view=gantt`.

Expected: same task has the same stable `task_id` across Sprint Board, Kanban, and Gantt.

Actual: Sprint Board uses canonical `TASK-EVT-...` IDs, Kanban exposes legacy short process IDs, and Gantt rendered task buttons without `data-task-id`. Gantt also presents separate "Evidence for ..." rows, which risks duplicate task interpretation.

Evidence:
- `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-sprint-board.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-calendar-tab-kanban.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-calendar-tab-gantt.png`

### P1 - Event Workspace direct route rejects canonical event_id from Sprint Board

Surfaces/routes: `/calendar/event/EVT-GV-QUARTERLYGOV-20260514-001/task/TASK-EVT-GV-QUARTERLYGOV-20260514-001-MINUTES-EVT-GV-QUARTERLYGOV-20260514-001-7SEA64`.

Personas: DON-01 detail verification; ADM-04 route resilience; CM-05 refresh/direct URL resilience.

Steps:
1. Open `/ces/board`.
2. Capture task `TASK-EVT-GV-QUARTERLYGOV-20260514-001-MINUTES-EVT-GV-QUARTERLYGOV-20260514-001-7SEA64`, shown as `Finalize meeting minutes`, state `Ready`.
3. Direct-open the Event Workspace task route with event_id `EVT-GV-QUARTERLYGOV-20260514-001`.

Expected: Event Workspace opens the same task/event with preserved status and identifiers.

Actual: page displays `Event not found` and says a valid `event_id` is required.

Evidence:
- `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-direct-calendar-event-evt-gv-quarterlygov-20260514-001-task-task-evt-gv-quarterlygov-20260514-001.png`

### P1 - Audit Mode ignores canonical event/task query and shows legacy event identity/status

Surfaces/routes: `/audit?event_id=EVT-GV-QUARTERLYGOV-20260514-001&task_id=TASK-EVT-GV-QUARTERLYGOV-20260514-001-MINUTES-EVT-GV-QUARTERLYGOV-20260514-001-7SEA64`.

Personas: DON-01 and ADM-04 audit defensibility; DON-03 cross-view link testing.

Steps:
1. Open the direct Audit Mode URL above.
2. Compare with Sprint Board task `Finalize meeting minutes`, `Ready`.

Expected: Audit Mode scopes to the same `event_id`/`task_id`, preserving status and traceability.

Actual: Audit Mode shows the full 253-instance list and legacy event row `governing_body_meeting-20260514-01 · D. Alvarez · Blocked`, not the canonical `EVT-GV-...` task context.

Evidence:
- `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-direct-audit-event-id-evt-gv-quarterlygov-20260514-001-task-id-task-evt-gv-quarterlygov-20260514-.png`

### P2 - Evidence Center accepts canonical context but does not visibly focus the task artifact

Surfaces/routes: `/evidence?event_id=EVT-GV-QUARTERLYGOV-20260514-001&task_id=TASK-EVT-GV-QUARTERLYGOV-20260514-001-MINUTES-EVT-GV-QUARTERLYGOV-20260514-001-7SEA64`.

Personas: DON-01 evidence detail; ADM-04 survey readiness; CM-05 route resilience.

Steps:
1. Open the Evidence Center route above.
2. Observe task context and folder/file ledger.

Expected: Evidence Center scopes to the exact event/task and exposes required forms/evidence/artifacts for that task.

Actual: the page shows the canonical context banner, but the visible folder tree remains broad Year/Month/Event navigation with no focused task row or artifact surfaced in the captured viewport.

Evidence:
- `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-direct-evidence-event-id-evt-gv-quarterlygov-20260514-001-task-id-task-evt-gv-quarterlygov-202605.png`

### P2 - New-user role queue starts empty despite large assigned role queues

Surfaces/routes: `/my-tasks`.

Personas: DON-01 new user, CM-05 new user, ADM-04 new user.

Steps:
1. Open `/my-tasks` as the demo user.
2. Observe default queue and diagnostics.

Expected: role/persona UAT should expose assigned DON/Admin/CM work without relying on a hidden diagnostic switch.

Actual: default page says `You · 0 total`, while role diagnostics report `Governing Body: 1904`, `Administrator: 1904`, `DON: 1405`, `DON Assistant: 1073`, `Accounting: 198`, and `Systems: 101`.

Evidence:
- `Builder/_system/UAT_AGENT_FINDINGS/agent02-ces-identity-my-tasks-initial.png`

## Positive Checks

- `/ces/board` rendered 151 execution cards and the first pass found no duplicate `data-unit-id` values on that surface.
- Calendar-only duplicate-key verifier reported 0 duplicate key warnings.
- Static `verify:task-identity` passed canonicalization and dedupe unit checks.

## Recommended Next Fix Phase

Prioritize a CES identity unification phase before visual polish: make Calendar Sprint/Kanban/Gantt, My Tasks, Event Workspace, Evidence Center, Audit Mode, Executive Dashboard, and Reports consume the same canonical event/task projection and selected task store, then add a Playwright regression that opens the same task from each surface and asserts one stable `event_id`, `task_id`, status, role, due date, evidence, dependencies, and no duplicate-key console messages.
