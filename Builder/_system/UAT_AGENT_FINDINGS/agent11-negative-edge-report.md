# Agent 11 Negative/Edge UAT Findings

Generated: 2026-05-27T14:44:28.991Z
Base URL: http://localhost:5173
Assigned testers: DON-07, ADM-04, CM-05, HCP-05, HCP-02

## Executive Verdict
FAIL for negative/edge-case readiness. P0/P1 defects affect blank-screen resilience, audit trust, evidence integrity, eCIgn recovery, and CES/form identity traceability.

## Severity Counts
P0: 1
P1: 3
P2: 3
P3: 0

## Defects
### AGENT11-001 [P2] Routes
Route: /definitely-not-a-real-route-agent11
Tester: HCP-02 (new-user)
IDs: 
Steps: Load invalid route /definitely-not-a-real-route-agent11.
Expected: Invalid route should show a clear not-found/recovery state and not silently hide the route problem.
Actual: The app silently redirects to /dashboard with no not-found context.
Console: None captured for this defect.
Screenshot: C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/10-route-invalid.png
Recommended fix: Replace wildcard dashboard redirect with a branded 404/recovery route.

### AGENT11-002 [P2] CES completion gates
Route: /calendar/event/qapi_meeting-20260205-04/task/TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline
Tester: DON-07 (new-user)
IDs: qapi_meeting-20260205-04; TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline
Steps: Open direct task route and look for the task completion action.
Expected: Task route should expose a clear next action or why completion is unavailable.
Actual: No Complete Task/Verify Signature action was visible. Initial text sample: TP
PRIMARY OPERATIONS
Dashboard
Clinician Profiles
Patient Profiles
Calendar
Brad
COMPLIANCE EXECUTION
Compliance Execution (CES)
Taxonomy
Onboarding
Policy Lifecycle
Evidence
ADMINISTRATION / KNOWLEDGE
Hubstaff
System Documentation
Help Ce
Console: None captured for this defect.
Screenshot: C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/12-no-complete-action-visible.png
Recommended fix: Expose consistent task actions on direct task routes.

### AGENT11-003 [P2] Evidence upload
Route: /calendar/event/qapi_meeting-20260205-04
Tester: HCP-05 (new-user)
IDs: qapi_meeting-20260205-04
Steps: Open event workspace and look for upload control.
Expected: Evidence upload should be discoverable and expose supported/unsupported file behavior.
Actual: No upload control was visible from the direct event workspace during the test.
Console: None captured for this defect.
Screenshot: C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/14-upload-not-discoverable.png
Recommended fix: Make evidence upload affordance visible in task/evidence context.

### AGENT11-004 [P1] eCIgn
Route: /forms/QA-FM-021?source=task&event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&workflow_id=WF-QA-PI-001&form_instance_id=qapi_meeting-20260205-04-QA-FM-021-001
Tester: CM-05 (power-user)
IDs: QA-FM-021; qapi_meeting-20260205-04-QA-FM-021-001; TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline
Steps: Open task-linked form, click eCIgn Sign, then hard refresh before completing consent/signature.
Expected: Refresh should restore the reloadable signing session or show an explicit recover/resume message.
Actual: After refresh the signing workspace disappears and the user is returned to the form without a resume/recovery state.
Console: [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503
Screenshot: C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/16-ecign-before-hard-refresh.png; C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/17-ecign-after-hard-refresh.png
Recommended fix: Persist and restore in-progress eCIgn session state from the task-linked form context.

### AGENT11-005 [P1] Artifact Viewer
Route: /artifacts/agent11-missing-artifact-after-refresh?event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&form_id=QA-FM-021&form_instance_id=qapi_meeting-20260205-04-QA-FM-021-001&evidence_id=agent11-missing-artifact-after-refresh&type=form_instance
Tester: HCP-02 (power-user)
IDs: agent11-missing-artifact-after-refresh; qapi_meeting-20260205-04; TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline; qapi_meeting-20260205-04-QA-FM-021-001
Steps: Direct-load an artifact URL with event/task/form/form_instance IDs, hard refresh, and inspect preview availability.
Expected: Artifact Viewer should either render the artifact content or provide a survey-safe recovery path tied to the exact IDs.
Actual: The viewer exposes a missing/metadata-only state after refresh for a URL that looks like a canonical artifact deep link.
Console: [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503 | [pm-api mirror failed] pm-api POST /pm/notifications → 503: 503
Screenshot: C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/19-missing-artifact-after-refresh.png
Recommended fix: Resolve direct artifact URLs from durable evidence/form-instance stores and show a non-ambiguous missing-content recovery state.

### AGENT11-006 [P0] Offline/backend unavailable
Route: /forms/QA-FM-021?source=task&event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&workflow_id=WF-QA-PI-001&form_instance_id=qapi_meeting-20260205-04-QA-FM-021-001
Tester: HCP-05 (new-user)
IDs: QA-FM-021; qapi_meeting-20260205-04-QA-FM-021-001
Steps: Block backend requests and start eCIgn.
Expected: User should receive explicit offline/backend-unavailable handling.
Actual: Backend-unavailable path rendered a blank dark page with no recovery copy or visible shell.
Console: None captured for this defect.
Screenshot: C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/21-backend-unavailable-ecign.png
Recommended fix: Add explicit offline/backend unavailable affordance for eCIgn and evidence operations; never allow a blank screen in demo/live mode.

### AGENT11-007 [P1] CES / Forms identity
Route: /calendar/event/qapi_meeting-20260205-04/workflow
Tester: ADM-04 (power-user)
IDs: qapi_meeting-20260205-04; QA-WF-03; f-QA-FM-021; QA-FM-021
Steps: Open /calendar/event/qapi_meeting-20260205-04, click Continue Workflow, compare workflow form IDs to the canonical task-linked form route /forms/QA-FM-021.
Expected: CES workflow, task, direct task route, and form route should preserve one canonical form_id/form_instance identity.
Actual: Workflow rows display prefixed form IDs such as f-QA-FM-021 while the canonical form route and form instance use QA-FM-021; the direct task route using the expected task/form context falls into "Task not found."
Console: None captured for this defect.
Screenshot: C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/32-supp-after-continue-workflow.png
Recommended fix: Normalize CES workflow form/task IDs before route construction and ensure direct URLs resolve to the same task/form instance opened from the workflow list.

## Route Smoke Results
- /ces/calendar -> status=200; current=/ces/calendar; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/01-route-ces-calendar.png
- /ces/board -> status=200; current=/ces/board; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/02-route-ces-board.png
- /pm/my-tasks -> status=200; current=/pm/my-tasks; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/03-route-pm-my-tasks.png
- /audit -> status=200; current=/audit; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/04-route-audit.png
- /evidence -> status=200; current=/evidence; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/05-route-evidence.png
- /calendar/event/qapi_meeting-20260205-04/task/TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline -> status=200; current=/calendar/event/qapi_meeting-20260205-04/task/TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/06-route-direct-task.png
- /forms/QA-FM-021?source=task&event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&workflow_id=WF-QA-PI-001&form_instance_id=qapi_meeting-20260205-04-QA-FM-021-001 -> status=200; current=/forms/QA-FM-021?source=task&event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&workflow_id=WF-QA-PI-001&form_instance_id=qapi_meeting-20260205-04-QA-FM-021-001; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/07-route-direct-form-instance.png
- /artifacts/agent11-missing-artifact-after-refresh?event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&form_id=QA-FM-021&form_instance_id=qapi_meeting-20260205-04-QA-FM-021-001&evidence_id=agent11-missing-artifact-after-refresh&type=form_instance -> status=200; current=/artifacts/agent11-missing-artifact-after-refresh?event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&form_id=QA-FM-021&form_instance_id=qapi_meeting-20260205-04-QA-FM-021-001&evidence_id=agent11-missing-artifact-after-refresh&type=form_instance; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/08-route-direct-missing-artifact.png
- /events/qapi_meeting-20260205-04 -> status=200; current=/events/qapi_meeting-20260205-04; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/09-route-direct-audit-event-alias.png
- /definitely-not-a-real-route-agent11 -> status=200; current=/dashboard; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/10-route-invalid.png
- /calendar/event/qapi_meeting-20260205-04/task/TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline -> status=200; current=/calendar/event/qapi_meeting-20260205-04/task/TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/11-task-before-complete.png
- /calendar/event/qapi_meeting-20260205-04 -> status=200; current=/calendar/event/qapi_meeting-20260205-04; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/13-event-before-upload.png
- /forms/QA-FM-021?source=task&event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&workflow_id=WF-QA-PI-001&form_instance_id=qapi_meeting-20260205-04-QA-FM-021-001 -> status=200; current=/forms/QA-FM-021?source=task&event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&workflow_id=WF-QA-PI-001&form_instance_id=qapi_meeting-20260205-04-QA-FM-021-001; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/15-form-before-ecign.png
- /artifacts/agent11-missing-artifact-after-refresh?event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&form_id=QA-FM-021&form_instance_id=qapi_meeting-20260205-04-QA-FM-021-001&evidence_id=agent11-missing-artifact-after-refresh&type=form_instance -> status=200; current=/artifacts/agent11-missing-artifact-after-refresh?event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&form_id=QA-FM-021&form_instance_id=qapi_meeting-20260205-04-QA-FM-021-001&evidence_id=agent11-missing-artifact-after-refresh&type=form_instance; blank=false; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/18-missing-artifact-initial.png
- /forms/QA-FM-021?source=task&event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&workflow_id=WF-QA-PI-001&form_instance_id=qapi_meeting-20260205-04-QA-FM-021-001 -> status=200; current=/forms/QA-FM-021?source=task&event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&workflow_id=WF-QA-PI-001&form_instance_id=qapi_meeting-20260205-04-QA-FM-021-001; blank=true; rawError=false; screenshot=C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent11-negative-edge-screenshots/20-backend-unavailable-form.png

## Console Events
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/overlays (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/personal?owner=demo-user-careindeed (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications?user_id=demo-user-careindeed (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/dependencies (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)
- http: 503 https://rtllnugat0.execute-api.us-west-1.amazonaws.com/pm/notifications (http://localhost:5173/pm/my-tasks)
- error: Failed to load resource: the server responded with a status of 503 () (http://localhost:5173/pm/my-tasks)