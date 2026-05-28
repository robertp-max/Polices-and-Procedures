# All Workflow Swimlane Generation Report

Generated: 2026-05-28T12:15:17.266Z

## Coverage Summary

| Metric | Count |
| --- | ---: |
| Total workflows found | 206 |
| Workflow Library card IDs found | 206 |
| Workflow graph IDs found | 206 |
| Workflows with custom swimlane | 1 |
| Workflows with generated swimlane | 205 |
| Workflows with fallback swimlane | 0 |
| Workflows with missing/weak steps | 0 |
| Blank/unavailable generated models | 0 |
| Total unresolved form IDs | 17 |
| Total unresolved policy refs | 133 |
| Total role inference gaps | 0 |
| Non-orthogonal edge declarations | 0 |

## Files Changed

- `src/policy/workflows/swimlanes/buildSwimlaneFromWorkflow.ts`
- `src/policy/workflows/swimlanes/phaseTemplates.ts`
- `src/policy/workflows/swimlanes/swimlaneRegistry.ts`
- `src/policy/workflows/swimlanes/swimlaneRoutes.ts`
- `src/policy/workflows/swimlanes/types.ts`
- `src/policy/workflows/WorkflowLibraryApp.tsx`
- `Builder/_system/audit-all-workflow-swimlanes.ts`
- `Builder/_system/ALL_WORKFLOW_SWIMLANE_GENERATION_REPORT.md`

## Shared Architecture Reused

- Reuses the V3.2 `SwimlaneExecutionMap` renderer for generated workflow/template swimlanes.
- Retains the high-fidelity custom `QA-WF-03` route at `/workflows/QA-WF-03-swimlane`.
- Reuses shared route helpers, phase templates, role normalization, and event/task query handling.

## Workflow Generator Changes

- Authored workflow steps remain ordered and become swimlane nodes.
- Missing step tables generate a six-node fallback, with stronger form-aware fallback when `requiredForms` exists.
- Approvals add reviewer/signature requirement nodes without creating signer tasks in template mode.
- Evidence/package nodes list requirements honestly and do not create evidence in template mode.
- Domain-specific phase templates are applied for GV, QA, CL, CO, HR, FN, OP, IT, RM, and EN workflows.

## Route Coverage Summary

- Preferred route: `/workflows/:workflowId-swimlane`
- Legacy route preserved: `/workflows/:workflowId/swimlane`
- Custom route preserved: `/workflows/QA-WF-03-swimlane`
- Event execution query supported: `/workflows/:workflowId-swimlane?eventId={eventId}&taskId={taskId}`
- Workflow graph IDs without model route: None
- Workflow Library card IDs without model route: None

## Routes Tested / Sampled

| Domain | Workflow ID | Route | Mode | Nodes | Lanes | Source |
| --- | --- | --- | --- | ---: | ---: | --- |
| QA | QA-WF-03 | /workflows/QA-WF-03-swimlane | template | 15 | 10 | custom route |
| GV | GV-WF-03 | /workflows/GV-WF-03-swimlane | template | 13 | 6 | workflow |
| CL | CL-WF-26 | /workflows/CL-WF-26-swimlane | template | 7 | 3 | workflow |
| CO | CO-WF-01 | /workflows/CO-WF-01-swimlane | template | 8 | 2 | workflow |
| HR | HR-WF-04 | /workflows/HR-WF-04-swimlane | template | 8 | 3 | workflow |
| FN | FN-WF-01 | /workflows/FN-WF-01-swimlane | template | 7 | 5 | workflow |
| OP | OP-WF-01 | /workflows/OP-WF-01-swimlane | template | 6 | 3 | workflow |
| IT | IT-WF-01 | /workflows/IT-WF-01-swimlane | template | 8 | 3 | workflow |
| RM | RM-WF-01 | /workflows/RM-WF-01-swimlane | template | 7 | 2 | workflow |
| EN | EN-WF-01 | /workflows/EN-WF-01-swimlane | template | 11 | 8 | workflow |

Fallback sample: None; every workflow has authored steps in the compiled dataset.

## Missing / Weak Step Workflows

_None._

## Unresolved Form IDs

| Workflow ID | Unresolved IDs |
| --- | --- |
| CL-WF-26 | QA-FM-025 |
| CL-WF-32 | QA-FM-027 |
| CL-WF-34 | QA-FM-021, QA-FM-026 |
| CL-WF-35 | QA-FM-020, QA-FM-021 |
| CO-WF-30 | QA-FM-022 |
| QA-WF-13 | QA-FM-020 |
| QA-WF-14 | QA-FM-020, QA-FM-021 |
| QA-WF-15 | QA-FM-020, QA-FM-021 |
| QA-WF-17 | QA-FM-020, QA-FM-021 |
| QA-WF-03 | QA-FM-021 |
| RM-WF-16 | QA-FM-026 |
| RM-WF-20 | QA-FM-026 |

## Unresolved Policy Refs

| Workflow ID | Unresolved IDs |
| --- | --- |
| CL-WF-26 | CL-PA-005, CL-PA-007 |
| CL-WF-27 | CL-PA-003 |
| CL-WF-28 | CL-PA-008 |
| CL-WF-29 | CL-PA-010 |
| CL-WF-30 | CL-PA-002, CL-PA-005 |
| CL-WF-31 | CL-PA-012 |
| CL-WF-32 | CL-PA-014 |
| CL-WF-33 | CL-PA-007 |
| CL-WF-34 | CL-PA-007 |
| CL-WF-35 | CL-PA-005 |
| CL-WF-36 | CL-PA-009 |
| CL-WF-37 | CL-PA-005 |
| CL-WF-01 | CL-PA-001, OP-IN-001 |
| CL-WF-02 | CL-PA-002 |
| CL-WF-03 | CL-PA-005 |
| CL-WF-04 | CL-PA-001 |
| CL-WF-14 | CL-IC-001 |
| CL-WF-16 | CL-PA-004 |
| CL-WF-17 | CL-PA-004 |
| CL-WF-19 | CL-DC-001 |
| CL-WF-22 | CL-PA-004, HR-FM-033 |
| CL-WF-23 | CL-PA-004 |
| CL-WF-24 | CL-PA-007 |
| CO-WF-23 | CO-CB-001, FN-RC-002 |
| CO-WF-24 | CO-CB-002 |
| CO-WF-25 | CO-CB-003 |
| CO-WF-26 | CO-CB-004 |
| CO-WF-28 | FN-RC-001 |
| CO-WF-29 | FN-RC-005 |
| CO-WF-05 | CO-CP-010 |
| CO-WF-17 | CO-HP-008, IT-SP-001 |
| CO-WF-18 | CO-AI-001, EN-AI-001, IT-SP-001 |
| EN-WF-01 | EN-PM-001 |
| EN-WF-02 | EN-PM-002 |
| EN-WF-03 | EN-AK-001 |
| EN-WF-06 | EN-CM-002 |
| EN-WF-07 | EN-PM-003 |
| EN-WF-08 | EN-RM-001 |
| EN-WF-09 | EN-MT-001 |
| EN-WF-10 | EN-MT-002 |
| EN-WF-11 | EN-AU-001 |
| EN-WF-12 | EN-AU-002, RM-RI-001 |
| EN-WF-13 | EN-AU-003 |
| FN-WF-03 | FN-AU-001 |
| FN-WF-04 | FN-BL-001 |
| FN-WF-05 | FN-BL-002 |
| FN-WF-06 | FN-BL-003 |
| FN-WF-07 | FN-AR-001 |
| FN-WF-08 | FN-AR-002, CO-FW-002 |
| FN-WF-09 | FN-AR-003, FN-AR-004 |
| FN-WF-10 | FN-BL-004, FN-BL-005 |
| FN-WF-11 | FN-AP-001, CO-FW-001 |
| FN-WF-12 | FN-PR-001 |
| FN-WF-13 | FN-AU-002 |
| FN-WF-14 | FN-BL-006, FN-BL-007 |
| FN-WF-15 | FN-BL-008 |
| GV-WF-06 | CL-PA-001 |
| HR-WF-18 | HR-TR-001 |
| HR-WF-03 | CO-TR-001 |
| HR-WF-05 | HR-TR-001 |
| HR-WF-06 | HR-TR-002 |
| HR-WF-07 | HR-TR-003 |
| HR-WF-08 | HR-PM-001 |
| HR-WF-13 | HR-HS-001 |
| HR-WF-14 | IT-SP-004, FN-PR-001 |
| HR-WF-16 | HR-CO-001 |
| IT-WF-21 | IT-AC-001, IT-AC-002 |
| IT-WF-22 | IT-IS-001 |
| IT-WF-23 | IT-AU-001 |
| IT-WF-24 | IT-AU-001 |
| IT-WF-25 | IT-IS-001, IT-VM-001 |
| IT-WF-01 | IT-SP-001 |
| IT-WF-02 | IT-AC-001 |
| IT-WF-03 | IT-AC-002 |
| IT-WF-04 | IT-AC-003 |
| IT-WF-05 | IT-AC-004 |
| IT-WF-06 | IT-SP-002 |
| IT-WF-07 | IT-BC-001 |
| IT-WF-08 | IT-BC-002 |
| IT-WF-09 | IT-IR-001 |
| IT-WF-10 | IT-AM-001 |
| IT-WF-11 | IT-AM-002 |
| IT-WF-12 | IT-AM-003 |
| IT-WF-13 | IT-NE-001 |
| IT-WF-14 | IT-NE-002 |
| IT-WF-15 | IT-SP-003 |
| IT-WF-16 | IT-NE-003 |
| IT-WF-17 | IT-DM-001 |
| IT-WF-18 | IT-NE-004 |
| IT-WF-19 | IT-SP-004 |
| OP-WF-01 | OP-BR-001 |
| OP-WF-03 | OP-SM-001, CO-FM-027, IT-SP-001 |
| OP-WF-04 | OP-SM-001 |
| OP-WF-05 | OP-SM-003 |
| OP-WF-06 | OP-RC-002 |
| OP-WF-07 | OP-IN-001, CL-PA-001 |
| OP-WF-08 | CL-PA-001 |
| OP-WF-10 | CL-PA-004 |
| OP-WF-11 | OP-SM-005 |
| OP-WF-12 | OP-IN-002 |
| OP-WF-13 | CL-PA-004 |
| QA-WF-17 | QA-PIP-001 |
| QA-WF-06 | CL-IC-001 |
| QA-WF-12 | CL-PA-004 |
| RM-WF-16 | RM-RM-001 |
| RM-WF-18 | RM-RM-001 |
| RM-WF-20 | RM-RM-002 |
| RM-WF-01 | RM-RA-001 |
| RM-WF-06 | CL-IC-001 |
| RM-WF-07 | CL-PA-003 |
| RM-WF-12 | RM-PS-001 |
| RM-WF-14 | RM-LI-001 |
| RM-WF-15 | RM-RA-001 |

## Role Inference Gaps

_None._

## Workflow Library Integration Result

Every workflow detail page uses `buildWorkflowSwimlaneRoute(wf.id)`, which now resolves to the preferred `/workflows/:workflowId-swimlane` route. The existing detail page remains available at `/workflows/:workflowId`.

## Build Result

`npm run build` passed on 2026-05-28. Vite emitted only chunk-size/plugin-timing warnings.

## Validator Results

- `npm run compile:workflows` passed; compiler rewrote generated workflow files and reported the unresolved form IDs listed above.
- `npm run verify:alignment` passed with 0 findings across 254 events and 206 workflows.
- `npm run verify:required-forms` passed for event required-form coverage.
- `npm run verify:task-identity` passed.
- `npm run validate:event-dataflow` passed.
- `npm run check:ecign-routes` passed with 18 routes verified.

## Browser Verification

Playwright sampled the following routes on `http://127.0.0.1:4175`; each rendered a swimlane map with cards and no "Swimlane unavailable" state:

- `/workflows/QA-WF-03-swimlane`
- `/workflows/GV-WF-03-swimlane`
- `/workflows/CL-WF-26-swimlane`
- `/workflows/CO-WF-01-swimlane`
- `/workflows/HR-WF-04-swimlane`
- `/workflows/FN-WF-01-swimlane`
- `/workflows/OP-WF-01-swimlane`
- `/workflows/IT-WF-01-swimlane`
- `/workflows/RM-WF-01-swimlane`
- `/workflows/EN-WF-01-swimlane`
- `/workflows/GV-WF-03/swimlane`
- `/workflows/CL-WF-26-swimlane?eventId=EVT-CL-WF-26&taskId=TASK-CL-WF-26-001`

## Remaining Limitations

- Static validation and sampled browser routes confirm model and route coverage for the compiled workflow dataset.
- Template mode intentionally opens Forms Library templates only and lists evidence/signature requirements without creating records.
- Event execution mode requires event/task query context for form instance and evidence behavior.
