# Agent 01 Command Recon Findings

Generated: 2026-05-27  
Scope: pre-test repo/documentation/command reconnaissance and full route smoke setup  
Repo verified: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures`

## Files Reviewed

- UAT instructions: `docs/UIUX/Audit/UAT/V3`
- Commands/config: `package.json`, `playwright.config.ts`
- Route registration: `src/App.tsx`
- Master docs/indexes: `README.md`, `Builder/_system/CURRENT_SYSTEM_STATE_AND_ARCH_REVIEW_INDEX.md`
- Integration/data model: `Builder/Documentations/App_Component_Documentation/Integration_Map.md`, `Builder/Documentations/App_Component_Documentation/Data_Model_and_Files.md`
- CES/events/tasks/forms/evidence: `Builder/Documentations/CES-Event-Instance-Dataflow/README.md`, `Builder/Documentations/CES-Event-Instance-Dataflow/CES-EVENT-INSTANCE-SYSTEM-DOCUMENTATION.md`, `Builder/Documentations/System_Documentation/08_CES_EVENTS_TASKS_FORMS_EVIDENCE_MAP.md`
- eCIgn/stabilization: `Builder/eCIgn/README.md`, `Builder/_system/ARTIFACT_VIEWER_AND_ECIGN_STABILIZATION_REPORT.md`, `Builder/_system/CES_OPERATIONAL_STABILIZATION_REPORT.md`, `Builder/_system/TASK_IDENTITY_DUPLICATE_KEY_FIX_REPORT.md`
- Policy/ACHC/print/evidence references: `Builder/Documentations/FINAL_ACHC_SURVEYOR_ALIGNMENT_MASTER.md`, `docs/context-for-grok/cursor-forensics/components/print/PRINT_AND_SIGNED_PDF_ROUTE_DRIFT.md`, `docs/context-for-grok/cursor-forensics/components/calendar/CALENDAR_SPRINT_KANBAN_GANTT_SYNC.md`, `docs/context-for-grok/cursor-forensics/components/evidence/EVIDENCE_CENTER_METADATA_ONLY.md`
- Source spot checks: `src/policy/pages/EvidenceCenterPage.tsx`, `src/policy/pages/ArtifactViewerPage.tsx`, `src/policy/components/FormViewer.tsx`, `src/policy/pages/FormsPage.tsx`, `src/policy/pages/AuditModePage.tsx`, `src/policy/pm/api/pmApiClient.ts`, `src/policy/ecign/api.ts`, `src/policy/ecign/hhcEvidence.ts`

## Commands Found

- App start: `npm run dev` starts web + API concurrently; `npm run dev:web` starts Vite; `npm run dev:api` starts `server/index.ts`; `npm run server` starts API only.
- Build: `npm run build` runs `tsc -b && vite build`, with `prebuild` running `node scripts/syncMasterControlInventory.mjs`.
- Test: no generic `test` script exists in `package.json`.
- Lint: `npm run lint`.
- Playwright: `playwright.config.ts` uses `testDir: ./Builder/_system/uat`, default `baseURL: http://localhost:5173`, project `chromium`, and visual project `v3-visual-5174`.
- Verification helpers: `npm run verify:task-identity`, `npm run verify:calendar-keys`, `npm run validate:event-dataflow`, `npm run check:ecign-routes`, `npm run check:ecign-demo-local`.

## Commands Run

- `node -v; npm -v; npx playwright --version`: PASS. Node `v22.22.0`, npm `11.6.2`, Playwright `1.59.1`.
- Local app probe `fetch('http://localhost:5173')`: PASS, returned HTTP `200`.
- `npm run check:ecign-routes`: PASS, `[ecign-route-health] OK (18 routes verified).`
- `npm run verify:task-identity`: PASS, all deterministic task identity checks passed.
- `npm run validate:event-dataflow`: FAIL before validation. Exact blocker: `Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@/policy' imported from ...\src\policy\compliance-execution\eventTaskAdapter.ts`.
- `npm run lint`: FAIL with existing broad repo lint debt: `980 problems (361 errors, 619 warnings)`. Failures are spread across archived/heavy files, Builder UAT specs, and current `src/ui-staging` files.
- `node Builder/_system/UAT_AGENT_FINDINGS/agent01-command-recon-route-smoke.mjs`: PASS as a harness run. It loaded 27 routes, captured `0` duplicate-key warnings, and wrote smoke evidence under this findings folder.

Not run: `npm run build`, because it writes build output and triggers `prebuild` sync behavior; this slice was UAT-only and limited writes to assigned findings artifacts.

## Route Inventory

- Dashboard: `/dashboard`
- Calendar: `/calendar`, with Sprint/Kanban/Gantt via `/calendar?view=sprint`, `/calendar?view=kanban`, `/calendar?view=gantt`
- CES: `/ces/calendar`, `/ces/board`, `/ces/workloads`, `/ces/reports`
- My Tasks / PM: `/my-tasks`, `/pm/my-tasks`, `/pm/sprint-plan`, `/pm/sprint-review`, `/pm/approvals`, `/pm/dashboard`
- Event Workspace / task drilldown: `/calendar/event/:eventId`, `/calendar/event/:eventId/workflow`, `/calendar/event/:eventId/task/:taskId`, `/calendar/event/:eventId/evidence/:taskId`, `/calendar/event/:eventId/approval`
- Evidence Center: `/evidence`
- Audit Mode: `/audit`
- Policy Library / ACHC: `/library`, `/library/:policyId`, `/policies/:policyId`, `/framework/achc-survey`, `/surveyor/policy/:policyId`
- Forms / eCIgn entry: `/forms`, `/forms/:formId`, `/forms/:formId/print`
- Artifact Viewer: `/artifacts/:artifactId`
- Reports: `/ces/reports`, plus PM dashboard reporting at `/pm/dashboard`
- Print/download routes: `/print/:policyId`, `/print/GV-GB-001`, `/print/GV-GB-001/appendix/:appendixId`, `/forms/:formId/print`

Route gaps/notes:

- No standalone `/kanban`, `/gantt`, or `/sprint-board` routes are registered; these are Calendar query modes or CES board surfaces.
- No standalone `/ecign` route is registered; eCIgn is entered through task-linked forms and the form signing workspace.
- Invalid protected app routes fall back to `/dashboard`, not a visible 404 page. This avoids a raw missing-route screen but can hide bad deep links.

## Smoke Results

Route smoke loaded 27 representative routes on `http://localhost:5173`.

- HTTP route shell: no route produced a blank screen, login redirect, raw 502, or duplicate React key warning.
- False positive detector notes: `/framework/achc-survey` contains `45 CFR § 164.502(b)` and `/forms` contains “Form 5020”; these are normal content, not raw HTTP 502 errors.
- PM backend risk observed: `/pm/my-tasks` rendered, but console/network captured repeated HTTP `503` calls to deployed PM endpoints such as `/pm/personal`, `/pm/overlays`, `/pm/dependencies`, and `/pm/notifications`. The UI falls back enough to render, but live/demo users may still see console noise and stale PM state when the deployed endpoint is unhealthy.
- Artifact direct route blocker: `/artifacts/qapi_meeting-20260512-09-QA-FM-021-001?...` rendered the Artifact Viewer but displayed `Artifact was not found in the current CES store snapshot.` This is a smoke blocker for direct artifact review unless a prior flow has created the artifact in the current local CES store.

## Major Blockers / Risks

- P1: Artifact Viewer can render metadata-only/not-found for direct form-instance artifact URLs. This aligns with prior evidence/artifact persistence concerns and blocks reliable surveyor artifact retrieval from a cold route.
- P1: PM API client defaults to the deployed demo API (`https://rtllnugat0.execute-api.us-west-1.amazonaws.com`); smoke captured repeated 503s on PM endpoints even though the page renders.
- P2: `validate:event-dataflow` is currently not executable because tsx cannot resolve the `@/policy` import alias from the script path.
- P2: Full-repo `npm run lint` is red with 361 errors and 619 warnings, so lint cannot serve as a clean UAT gate without scoping/exclusions.
- P2: Sprint board/workload/report smoke text still shows `ACTIVE SPRINT Sprint 9 Apr 26 – May 7, 2026` while PM scope shows `2026:10 · 2026-05-10–2026-05-23`, matching the known sprint header/scope drift risk.
- P2: Route registration uses dashboard redirect for unknown routes; this avoids raw 404s but can mask route registration gaps during UAT.

## Duplicate-Key Recon

- `npm run verify:task-identity`: PASS.
- Browser smoke across Calendar, Sprint, Kanban, Gantt, CES board, My Tasks, Evidence, Audit, Forms, Policy, Print, and Artifact routes captured `duplicateKeyCount: 0`.
- Static key usage still depends on task IDs in CES/PM render lists; the current smoke did not prove mutation/cross-refresh stability, only initial route-load stability.

## Artifacts Created

- Findings report: `Builder/_system/UAT_AGENT_FINDINGS/agent01-command-recon-findings.md`
- Route smoke harness: `Builder/_system/UAT_AGENT_FINDINGS/agent01-command-recon-route-smoke.mjs`
- Route smoke results: `Builder/_system/UAT_AGENT_FINDINGS/agent01-command-recon-route-smoke-results.json`
- Screenshots folder: `Builder/_system/UAT_AGENT_FINDINGS/agent01-command-recon-screenshots/`
  - `dashboard.png`
  - `calendar.png`
  - `evidence-center.png`
  - `achc-survey-view.png`
  - `forms.png`
  - `artifact-viewer.png`
  - `invalid-route-recovery.png`

## Recommended Next Fix Phase

Start with artifact retrieval/evidence persistence and PM backend/demo-mode isolation before deeper UAT. Those two areas are the clearest smoke blockers for survey-defensible workflows, while the command gate issues (`validate:event-dataflow`, lint scope) should be cleaned up so later UAT agents can rely on automated checks.
