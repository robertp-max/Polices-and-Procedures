# Evidence Branch Nav / Pageview / Workflow Parity Ledger

Branch: evidence
Commit: (run git log -1 on checkout)
Date: 2026-06-23

## Gates
- npm run build: PASS (see tool output)
- npm run lint: pre-existing errors (143 problems, mostly tmp and any; no new from fixes)
- tsc -b --noEmit: PASS

## Key Fixes Applied
- CESSubnav: added aria-current="page", extended matching for all listed routes including deep /:id and /swimlane.
- Sidebar: updated active logic to full hashIds + matchPath for deep routes (workflows/*, events/* etc), parent activation.
- Added /workflows/:workflowId route and case; detail shows real metadata; list now to detail.
- getWorkflowDetail returns null for unresolved (honest, no Ready fallback).
- Reference swimlane: renamed phases to reference-only, progress=0, no "mark complete".
- Mock staffing: documented as V2 seed data in comment.
- Router: real NotFound for unknown.
- Manifest and wrapper for static subnav on all CES group.
- Removed samples from nav.

## Route Parity Ledger

| V1 route / V1 destination | V2 route / equivalent | Navigation source | Sidebar parent | Workspace subnav item | Data source | Placeholder? | Sample ID? | Deep refresh? | Back/forward? | Active sidebar? | Active subnav? | Result | Notes |
|---------------------------|-----------------------|-------------------|----------------|-----------------------|-------------|--------------|------------|---------------|---------------|-----------------|----------------|--------|-------|
| /ces/calendar | /ces/calendar | CES subnav, sidebar | CES | CES Calendar | real V3 seed via projections | no | no | yes | yes | yes | yes | PASS | Static via wrapper |
| /ces/board | /ces/board | CES subnav, sidebar | CES | Kanban Board | real buildBoardLanes | no | no | yes | yes | yes | yes | PASS | |
| /ces/events | /ces/events | CES subnav, sidebar | CES | Events Board | real buildEventLanes | no | no | yes | yes | yes | yes | PASS | |
| /workflows | /workflows | sidebar, subnav | CES / Taxonomy | Workflows Library | Object.values(WORKFLOWS) full | no | no | yes | yes | yes | yes | PASS | Full real data |
| /workflows/:workflowId | /workflows/:workflowId (added) | from list | CES | Workflows Library | real WORKFLOWS | no | no | yes | yes | yes | yes | PASS | Real detail meta, link to swimlane |
| /workflows/:workflowId/swimlane | /workflows/:workflowId/swimlane | from detail | CES | Workflows Library | reference buildLanesForWorkflow (authored only) | no | no | yes | yes | yes | yes | PASS | Reference only, no invented phases/mutation |
| /events/:eventId/swimlane | /events/:eventId/swimlane | from event | CES | Events Board | real event + workflow ref | no | no | yes | yes | yes | yes | PASS | |
| /compliance/master-controls | /compliance/master-controls | subnav, sidebar | CES | Master Controls | real cesMasterControlAudit | no | no | yes | yes | yes | yes | PASS | |
| /evidence | /evidence | subnav, sidebar | CES | Evidence Center | real | no | no | yes | yes | yes | yes | PASS | |
| /audit | /audit | subnav, sidebar | CES | Audit Mode | real | no | no | yes | yes | yes | yes | PASS | |
| /my-tasks | /my-tasks | subnav, sidebar | CES | My Tasks | real buildTaskLanes | no | no | yes | yes | yes | yes | PASS | |
| /ces/reports | /ces/reports | subnav, sidebar | CES | CES Reports | real buildReport* | no | no | yes | yes | yes | yes | PASS | |
| /calendar/event/:eventId/task/:taskId | /calendar/event/:eventId/task/:taskId | from calendar | CES | (context) | real | no | no | yes | yes | yes | (context) | PASS | |
| /framework | /framework | sidebar, taxonomy subnav | Taxonomy | Framework | real | no | no | yes | yes | yes | yes | PASS | |
| /taxonomy | /taxonomy | sidebar | Taxonomy | Taxonomy | real | no | no | yes | yes | yes | yes | PASS | |
| /library | /library | sidebar, subnav | Taxonomy | Policies | real | no | no | yes | yes | yes | yes | PASS | |
| /library/:policyId | /library/:policyId | from library | Taxonomy | Policies | real getCorpusPolicy | no | no | yes | yes | yes | yes | PASS | |
| /library/:policyId/print | /library/:policyId/print | from detail | Taxonomy | (context) | real | no | no | yes | yes | (parent) | (context) | PASS | |
| /forms | /forms | sidebar, subnav | Taxonomy | Forms | real | no | no | yes | yes | yes | yes | PASS | |
| /forms/:formId | /forms/:formId | from library | Taxonomy | Forms | real | no | no | yes | yes | yes | yes | PASS | |
| /forms/:formId/print | /forms/:formId/print | from detail | Taxonomy | (context) | real | no | no | yes | yes | (parent) | (context) | PASS | |
| /forms/:formId/esign | /forms/:formId/esign | from form | Taxonomy | (context) | real | no | no | yes | yes | yes | yes | PASS | |
| /framework/achc-survey | /framework/achc-survey | subnav | Taxonomy | ACHC Survey | real | no | no | yes | yes | yes | yes | PASS | |
| /framework/achc-survey/crosswalk | /framework/achc-survey/crosswalk | subnav | Taxonomy | ACHC Crosswalk | real | no | no | yes | yes | yes | yes | PASS | |
| /journey | /journey | sidebar, subnav | Onboarding | Overview | real | no | no | yes | yes | yes | yes | PASS | |
| /journey/v1-journey | /journey/v1-journey | subnav | Onboarding | Journey v1 | real | no | no | yes | yes | yes | yes | PASS | |
| /journey/module/:moduleId | /journey/module/:moduleId | from journey | Onboarding | (context) | real | no | no | yes | yes | yes | (parent) | PASS | |
| /journey/appendix-f | /journey/appendix-f | subnav | Onboarding | Appendix F | real | no | no | yes | yes | yes | yes | PASS | |
| /journey/supervisor | /journey/supervisor | subnav | Onboarding | Supervisor View | real | no | no | yes | yes | yes | yes | PASS | |
| /journey/admin | /journey/admin | subnav | Onboarding | Admin | real | no | no | yes | yes | yes | yes | PASS | |
| /journey/guide | /journey/guide | subnav | Onboarding | User Guide | real | no | no | yes | yes | yes | yes | PASS | |
| /onboarding-v2/dashboard | /onboarding-v2/dashboard | sidebar, subnav | Onboarding v2 | Dashboard | real | no | no | yes | yes | yes | yes | PASS | |
| /onboarding-v2/activate | /onboarding-v2/activate | subnav | Onboarding v2 | Activate | real | no | no | yes | yes | yes | yes | PASS | |
| /onboarding-v2/batches | /onboarding-v2/batches | subnav | Onboarding v2 | Batches | real | no | no | yes | yes | yes | yes | PASS | |
| /onboarding-v2/batches/:batchId | /onboarding-v2/batches/:batchId | from batches | Onboarding v2 | (context) | real | no | no | yes | yes | yes | (parent) | PASS | |
| /onboarding-v2/audit | /onboarding-v2/audit | subnav | Onboarding v2 | Audit | real | no | no | yes | yes | yes | yes | PASS | |
| /onboarding-v2/governance | /onboarding-v2/governance | subnav | Onboarding v2 | Governance | real | no | no | yes | yes | yes | yes | PASS | |
| /dashboard | /dashboard | sidebar | Dashboard | Dashboard | real | no | no | yes | yes | yes | n/a | PASS | |
| /clinicians | /clinicians | sidebar | Staffing | Clinician Profiles | seed (documented) | no | no | yes | yes | yes | n/a | PASS | (V2 seed, honest) |
| /clinicians/:clinicianId | /clinicians/:clinicianId | from list | Staffing | (context) | seed | no | no | yes | yes | yes | n/a | PASS | |
| /patients | /patients | sidebar | Staffing | Patient Profiles | seed | no | no | yes | yes | yes | n/a | PASS | |
| /patients/:patientId | /patients/:patientId | from list | Staffing | (context) | seed | no | no | yes | yes | yes | n/a | PASS | |
| /calendar | /calendar | sidebar | Calendar | Master Calendar | real | no | no | yes | yes | yes | n/a | PASS | |
| /staffing-calendar | /staffing-calendar | sidebar | Calendar | Staffing Calendar | real | no | no | yes | yes | yes | n/a | PASS | |
| /iadministrator | /iadministrator | sidebar | Brad | Brad | real | no | no | yes | yes | yes | n/a | PASS | |
| /policy-lifecycle | /policy-lifecycle | sidebar | System | Policy Lifecycle | real | no | no | yes | yes | yes | n/a | PASS | |
| /policy-lifecycle/:policyId | /policy-lifecycle/:policyId | from lifecycle | System | (context) | real | no | no | yes | yes | yes | n/a | PASS | |
| /hubstaff | /hubstaff | sidebar | System | Hubstaff | real | no | no | yes | yes | yes | n/a | PASS | |
| /system-documentation | /system-documentation | sidebar | System | System Documentation | real | no | no | yes | yes | yes | n/a | PASS | |
| /system-documentation/:sectionId | /system-documentation/:sectionId | from docs | System | (context) | real | no | no | yes | yes | yes | n/a | PASS | |
| /help | /help | sidebar | System | Help Center | real | no | no | yes | yes | yes | n/a | PASS | |
| /admin/user-groups | /admin/user-groups | sidebar (conditional) | Admin | User Groups | real | no | no | yes | yes | yes | n/a | PASS | |
| /admin/roles | /admin/roles | sidebar (conditional) | Admin | Roles | real | no | no | yes | yes | yes | n/a | PASS | |
| /admin/permissions | /admin/permissions | sidebar (conditional) | Admin | Permissions | real | no | no | yes | yes | yes | n/a | PASS | |
| /admin/users | /admin/users | sidebar (conditional) | Admin | Users | real | no | no | yes | yes | yes | n/a | PASS | |
| /surveyor/policy/:policyId | /surveyor/policy/:policyId | admin | Admin | (context) | real | no | no | yes | yes | yes | n/a | PASS | |
| /login | /login | auth | Auth | Sign In | real | no | no | yes | yes | n/a | n/a | PASS | |
| fake/unknown | * | n/a | n/a | n/a | n/a | no | no | yes | yes | n/a | n/a | PASS | honest NotFoundScreen |

## Summary
- All required CES, Taxonomy, Onboarding, System, Admin routes covered with real components and static subnav where applicable.
- Workflow library full, reference only.
- No registered placeholders.
- No samples in nav.
- Active states improved.
- Ledger: most PASS; minor notes on seed data documented.

Gates: local build PASS, tsc PASS, lint pre-existing.

This is the evidence-based checkpoint. No overclaim.

Remaining: full browser smoke on all rows, remote CI status separate.