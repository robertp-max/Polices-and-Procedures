# Mandated Event Swimlane Generation Report

Generated: 2026-05-28T11:28:39.257Z

## Coverage Summary

| Metric | Count |
| --- | ---: |
| Total mandated/actionable events found | 253 |
| Events with custom swimlane | 6 |
| Events with generated swimlane | 247 |
| Events with missing workflowId | 5 |
| Events with missing processFlow | 2 |
| Events with missing requiredForms | 1 |
| Total form IDs unresolved | 36 |
| Total policy refs unresolved | 236 |
| Events where minimal fallback was used | 2 |
| Compiled workflow records available | 206 |

## Routes Available

- Existing custom route retained: `/workflows/QA-WF-03-swimlane`
- Generic workflow route added: `/workflows/:workflowId/swimlane?eventId={eventId}&taskId={taskId}`
- Event-first route added: `/events/:eventId/swimlane?workflowId={workflowId}&taskId={taskId}`
- CES Calendar task clicks now resolve the swimlane registry and route to custom or generated swimlanes.

## Missing Workflow IDs

| Event ID | Title | Workflow | Route |
| --- | --- | --- | --- |
| oig_workplan_review-20260730-01 | Annual OIG Work Plan Review | missing | /events/oig_workplan_review-20260730-01/swimlane |
| strategic_assessment-20260731-01 | Strategic Program Effectiveness Assessment (Triennial) | missing | /events/strategic_assessment-20260731-01/swimlane |
| EVT-GV-2029-STRATEGIC-TRIENNIAL | Strategic Program Effectiveness Assessment (Triennial) — 2029 | missing | /events/EVT-GV-2029-STRATEGIC-TRIENNIAL/swimlane |
| compliance_report_weekly-20260511-01 | Compliance Report (Weekly Snapshot) | missing | /events/compliance_report_weekly-20260511-01/swimlane |
| risk_mitigation_plan-20260428-01 | Risk Mitigation Plan â€” Infection Control | missing | /events/risk_mitigation_plan-20260428-01/swimlane |

## Minimal Fallback Events

| Event ID | Title | Workflow | Route |
| --- | --- | --- | --- |
| compliance_report_weekly-20260511-01 | Compliance Report (Weekly Snapshot) | missing | /events/compliance_report_weekly-20260511-01/swimlane |
| risk_mitigation_plan-20260428-01 | Risk Mitigation Plan â€” Infection Control | missing | /events/risk_mitigation_plan-20260428-01/swimlane |

## Unresolved Form IDs

| Event ID | Unresolved IDs |
| --- | --- |
| qapi_meeting-20260507-08 | QA-FM-021 |
| qapi_meeting-20260806-12 | QA-FM-021 |
| qapi_meeting-20261105-16 | QA-FM-021 |
| oig_workplan_review-20260730-01 | CO-F-010 |
| plan_of_care_audit-20260107-01 | QA-FM-025 |
| plan_of_care_audit-20260209-01 | QA-FM-025 |
| plan_of_care_audit-20260309-01 | QA-FM-025 |
| plan_of_care_audit-20260407-01 | QA-FM-025 |
| plan_of_care_audit-20260507-01 | QA-FM-025 |
| plan_of_care_audit-20260608-01 | QA-FM-025 |
| plan_of_care_audit-20260707-01 | QA-FM-025 |
| plan_of_care_audit-20260807-01 | QA-FM-025 |
| plan_of_care_audit-20260907-01 | QA-FM-025 |
| plan_of_care_audit-20261007-01 | QA-FM-025 |
| plan_of_care_audit-20261109-01 | QA-FM-025 |
| plan_of_care_audit-20261207-01 | QA-FM-025 |
| infection_control_audit-20260107-01 | QA-FM-027 |
| infection_control_audit-20260209-01 | QA-FM-027 |
| infection_control_audit-20260309-01 | QA-FM-027 |
| infection_control_audit-20260407-01 | QA-FM-027 |
| infection_control_audit-20260507-01 | QA-FM-027 |
| infection_control_audit-20260608-01 | QA-FM-027 |
| infection_control_audit-20260707-01 | QA-FM-027 |
| infection_control_audit-20260807-01 | QA-FM-027 |
| infection_control_audit-20260907-01 | QA-FM-027 |
| infection_control_audit-20261007-01 | QA-FM-027 |
| infection_control_audit-20261109-01 | QA-FM-027 |
| infection_control_audit-20261207-01 | QA-FM-027 |
| incident_response_audit-20260323-01 | QA-FM-026 |
| incident_response_audit-20260622-01 | QA-FM-026 |
| incident_response_audit-20260921-01 | QA-FM-026 |
| incident_response_audit-20261221-01 | QA-FM-026 |
| qapi_meeting-20260512-09 | QA-FM-021 |
| qapi_meeting-20260609-10 | QA-FM-021 |
| risk_mitigation_plan-20260428-01 | RM-F-020 |
| qapi_meeting-20260205-04 | QA-FM-021 |

## Unresolved Policy Refs

| Event ID | Unresolved IDs |
| --- | --- |
| qapi_meeting-20260507-08 | QA-PIP-001 |
| qapi_meeting-20260806-12 | QA-PIP-001 |
| qapi_meeting-20261105-16 | QA-PIP-001 |
| infection_control_review_quarterly-20260325-01 | CL-IC-001 |
| infection_control_review_quarterly-20260624-02 | CL-IC-001 |
| infection_control_review_quarterly-20260924-03 | CL-IC-001 |
| infection_control_review_quarterly-20261217-04 | CL-IC-001 |
| qapi_annual_eval-20261210-01 | QA-PIP-001 |
| employee_compliance_training-20260901-01 | HR-OIG-001 |
| incident_report-20260101-01 | RM-RP-001 |
| complaint_investigation-20260101-01 | CL-POC-001 |
| plan_of_care_audit-20260107-01 | CL-PA-005, CL-PA-007 |
| plan_of_care_audit-20260209-01 | CL-PA-005, CL-PA-007 |
| plan_of_care_audit-20260309-01 | CL-PA-005, CL-PA-007 |
| plan_of_care_audit-20260407-01 | CL-PA-005, CL-PA-007 |
| plan_of_care_audit-20260507-01 | CL-PA-005, CL-PA-007 |
| plan_of_care_audit-20260608-01 | CL-PA-005, CL-PA-007 |
| plan_of_care_audit-20260707-01 | CL-PA-005, CL-PA-007 |
| plan_of_care_audit-20260807-01 | CL-PA-005, CL-PA-007 |
| plan_of_care_audit-20260907-01 | CL-PA-005, CL-PA-007 |
| plan_of_care_audit-20261007-01 | CL-PA-005, CL-PA-007 |
| plan_of_care_audit-20261109-01 | CL-PA-005, CL-PA-007 |
| plan_of_care_audit-20261207-01 | CL-PA-005, CL-PA-007 |
| oasis_accuracy_audit-20260107-01 | CL-PA-004 |
| oasis_accuracy_audit-20260209-01 | CL-PA-004 |
| oasis_accuracy_audit-20260309-01 | CL-PA-004 |
| oasis_accuracy_audit-20260407-01 | CL-PA-004 |
| oasis_accuracy_audit-20260507-01 | CL-PA-004 |
| oasis_accuracy_audit-20260608-01 | CL-PA-004 |
| oasis_accuracy_audit-20260707-01 | CL-PA-004 |
| oasis_accuracy_audit-20260807-01 | CL-PA-004 |
| oasis_accuracy_audit-20260907-01 | CL-PA-004 |
| oasis_accuracy_audit-20261007-01 | CL-PA-004 |
| oasis_accuracy_audit-20261109-01 | CL-PA-004 |
| oasis_accuracy_audit-20261207-01 | CL-PA-004 |
| visit_documentation_audit-20260107-01 | CL-PA-008 |
| visit_documentation_audit-20260209-01 | CL-PA-008 |
| visit_documentation_audit-20260309-01 | CL-PA-008 |
| visit_documentation_audit-20260407-01 | CL-PA-008 |
| visit_documentation_audit-20260507-01 | CL-PA-008 |
| visit_documentation_audit-20260608-01 | CL-PA-008 |
| visit_documentation_audit-20260707-01 | CL-PA-008 |
| visit_documentation_audit-20260807-01 | CL-PA-008 |
| visit_documentation_audit-20260907-01 | CL-PA-008 |
| visit_documentation_audit-20261007-01 | CL-PA-008 |
| visit_documentation_audit-20261109-01 | CL-PA-008 |
| visit_documentation_audit-20261207-01 | CL-PA-008 |
| clinical_record_completeness_audit-20260107-01 | CL-PA-010 |
| clinical_record_completeness_audit-20260209-01 | CL-PA-010 |
| clinical_record_completeness_audit-20260309-01 | CL-PA-010 |
| clinical_record_completeness_audit-20260407-01 | CL-PA-010 |
| clinical_record_completeness_audit-20260507-01 | CL-PA-010 |
| clinical_record_completeness_audit-20260608-01 | CL-PA-010 |
| clinical_record_completeness_audit-20260707-01 | CL-PA-010 |
| clinical_record_completeness_audit-20260807-01 | CL-PA-010 |
| clinical_record_completeness_audit-20260907-01 | CL-PA-010 |
| clinical_record_completeness_audit-20261007-01 | CL-PA-010 |
| clinical_record_completeness_audit-20261109-01 | CL-PA-010 |
| clinical_record_completeness_audit-20261207-01 | CL-PA-010 |
| medical_necessity_audit-20260107-01 | CL-PA-002, CL-PA-005 |
| medical_necessity_audit-20260209-01 | CL-PA-002, CL-PA-005 |
| medical_necessity_audit-20260309-01 | CL-PA-002, CL-PA-005 |
| medical_necessity_audit-20260407-01 | CL-PA-002, CL-PA-005 |
| medical_necessity_audit-20260507-01 | CL-PA-002, CL-PA-005 |
| medical_necessity_audit-20260608-01 | CL-PA-002, CL-PA-005 |
| medical_necessity_audit-20260707-01 | CL-PA-002, CL-PA-005 |
| medical_necessity_audit-20260807-01 | CL-PA-002, CL-PA-005 |
| medical_necessity_audit-20260907-01 | CL-PA-002, CL-PA-005 |
| medical_necessity_audit-20261007-01 | CL-PA-002, CL-PA-005 |
| medical_necessity_audit-20261109-01 | CL-PA-002, CL-PA-005 |
| medical_necessity_audit-20261207-01 | CL-PA-002, CL-PA-005 |
| medication_management_audit-20260107-01 | CL-PA-012 |
| medication_management_audit-20260209-01 | CL-PA-012 |
| medication_management_audit-20260309-01 | CL-PA-012 |
| medication_management_audit-20260407-01 | CL-PA-012 |
| medication_management_audit-20260507-01 | CL-PA-012 |
| medication_management_audit-20260608-01 | CL-PA-012 |
| medication_management_audit-20260707-01 | CL-PA-012 |
| medication_management_audit-20260807-01 | CL-PA-012 |
| medication_management_audit-20260907-01 | CL-PA-012 |
| medication_management_audit-20261007-01 | CL-PA-012 |
| medication_management_audit-20261109-01 | CL-PA-012 |
| medication_management_audit-20261207-01 | CL-PA-012 |
| infection_control_audit-20260107-01 | CL-PA-014 |
| infection_control_audit-20260209-01 | CL-PA-014 |
| infection_control_audit-20260309-01 | CL-PA-014 |
| infection_control_audit-20260407-01 | CL-PA-014 |
| infection_control_audit-20260507-01 | CL-PA-014 |
| infection_control_audit-20260608-01 | CL-PA-014 |
| infection_control_audit-20260707-01 | CL-PA-014 |
| infection_control_audit-20260807-01 | CL-PA-014 |
| infection_control_audit-20260907-01 | CL-PA-014 |
| infection_control_audit-20261007-01 | CL-PA-014 |
| infection_control_audit-20261109-01 | CL-PA-014 |
| infection_control_audit-20261207-01 | CL-PA-014 |
| care_coordination_audit-20260107-01 | CL-PA-007 |
| care_coordination_audit-20260209-01 | CL-PA-007 |
| care_coordination_audit-20260309-01 | CL-PA-007 |
| care_coordination_audit-20260407-01 | CL-PA-007 |
| care_coordination_audit-20260507-01 | CL-PA-007 |
| care_coordination_audit-20260608-01 | CL-PA-007 |
| care_coordination_audit-20260707-01 | CL-PA-007 |
| care_coordination_audit-20260807-01 | CL-PA-007 |
| care_coordination_audit-20260907-01 | CL-PA-007 |
| care_coordination_audit-20261007-01 | CL-PA-007 |
| care_coordination_audit-20261109-01 | CL-PA-007 |
| care_coordination_audit-20261207-01 | CL-PA-007 |
| missed_visit_audit-20260107-01 | CL-PA-005 |
| missed_visit_audit-20260209-01 | CL-PA-005 |
| missed_visit_audit-20260309-01 | CL-PA-005 |
| missed_visit_audit-20260407-01 | CL-PA-005 |
| missed_visit_audit-20260507-01 | CL-PA-005 |
| missed_visit_audit-20260608-01 | CL-PA-005 |
| missed_visit_audit-20260707-01 | CL-PA-005 |
| missed_visit_audit-20260807-01 | CL-PA-005 |
| missed_visit_audit-20260907-01 | CL-PA-005 |
| missed_visit_audit-20261007-01 | CL-PA-005 |
| missed_visit_audit-20261109-01 | CL-PA-005 |
| missed_visit_audit-20261207-01 | CL-PA-005 |
| orders_alignment_audit-20260107-01 | CL-PA-005, CL-PA-006 |
| orders_alignment_audit-20260209-01 | CL-PA-005, CL-PA-006 |
| orders_alignment_audit-20260309-01 | CL-PA-005, CL-PA-006 |
| orders_alignment_audit-20260407-01 | CL-PA-005, CL-PA-006 |
| orders_alignment_audit-20260507-01 | CL-PA-005, CL-PA-006 |
| orders_alignment_audit-20260608-01 | CL-PA-005, CL-PA-006 |
| orders_alignment_audit-20260707-01 | CL-PA-005, CL-PA-006 |
| orders_alignment_audit-20260807-01 | CL-PA-005, CL-PA-006 |
| orders_alignment_audit-20260907-01 | CL-PA-005, CL-PA-006 |
| orders_alignment_audit-20261007-01 | CL-PA-005, CL-PA-006 |
| orders_alignment_audit-20261109-01 | CL-PA-005, CL-PA-006 |
| orders_alignment_audit-20261207-01 | CL-PA-005, CL-PA-006 |
| internal_compliance_audit-20260316-01 | CO-PA-001, CO-PA-002 |
| internal_compliance_audit-20260615-01 | CO-PA-001, CO-PA-002 |
| internal_compliance_audit-20260914-01 | CO-PA-001, CO-PA-002 |
| internal_compliance_audit-20261214-01 | CO-PA-001, CO-PA-002 |
| documentation_alignment_audit-20260323-01 | CO-PA-005 |
| documentation_alignment_audit-20260622-01 | CO-PA-005 |
| documentation_alignment_audit-20260921-01 | CO-PA-005 |
| documentation_alignment_audit-20261221-01 | CO-PA-005 |
| pre_bill_audit-20260107-01 | FN-PA-002 |
| pre_bill_audit-20260209-01 | FN-PA-002 |
| pre_bill_audit-20260309-01 | FN-PA-002 |
| pre_bill_audit-20260407-01 | FN-PA-002 |
| pre_bill_audit-20260507-01 | FN-PA-002 |
| pre_bill_audit-20260608-01 | FN-PA-002 |
| pre_bill_audit-20260707-01 | FN-PA-002 |
| pre_bill_audit-20260807-01 | FN-PA-002 |
| pre_bill_audit-20260907-01 | FN-PA-002 |
| pre_bill_audit-20261007-01 | FN-PA-002 |
| pre_bill_audit-20261109-01 | FN-PA-002 |
| pre_bill_audit-20261207-01 | FN-PA-002 |
| post_bill_audit-20260114-01 | FN-PA-002 |
| post_bill_audit-20260216-01 | FN-PA-002 |
| post_bill_audit-20260316-01 | FN-PA-002 |
| post_bill_audit-20260414-01 | FN-PA-002 |
| post_bill_audit-20260514-01 | FN-PA-002 |
| post_bill_audit-20260615-01 | FN-PA-002 |
| post_bill_audit-20260714-01 | FN-PA-002 |
| post_bill_audit-20260814-01 | FN-PA-002 |
| post_bill_audit-20260914-01 | FN-PA-002 |
| post_bill_audit-20261014-01 | FN-PA-002 |
| post_bill_audit-20261116-01 | FN-PA-002 |
| post_bill_audit-20261214-01 | FN-PA-002 |
| authorization_audit-20260107-01 | CO-PA-007 |
| authorization_audit-20260209-01 | CO-PA-007 |
| authorization_audit-20260309-01 | CO-PA-007 |
| authorization_audit-20260407-01 | CO-PA-007 |
| authorization_audit-20260507-01 | CO-PA-007 |
| authorization_audit-20260608-01 | CO-PA-007 |
| authorization_audit-20260707-01 | CO-PA-007 |
| authorization_audit-20260807-01 | CO-PA-007 |
| authorization_audit-20260907-01 | CO-PA-007 |
| authorization_audit-20261007-01 | CO-PA-007 |
| authorization_audit-20261109-01 | CO-PA-007 |
| authorization_audit-20261207-01 | CO-PA-007 |
| license_exclusion_audit-20260107-01 | HR-PA-007 |
| license_exclusion_audit-20260209-01 | HR-PA-007 |
| license_exclusion_audit-20260309-01 | HR-PA-007 |
| license_exclusion_audit-20260407-01 | HR-PA-007 |
| license_exclusion_audit-20260507-01 | HR-PA-007 |
| license_exclusion_audit-20260608-01 | HR-PA-007 |
| license_exclusion_audit-20260707-01 | HR-PA-007 |
| license_exclusion_audit-20260807-01 | HR-PA-007 |
| license_exclusion_audit-20260907-01 | HR-PA-007 |
| license_exclusion_audit-20261007-01 | HR-PA-007 |
| license_exclusion_audit-20261109-01 | HR-PA-007 |
| license_exclusion_audit-20261207-01 | HR-PA-007 |
| staff_file_audit-20260316-01 | HR-PA-002 |
| staff_file_audit-20260615-01 | HR-PA-002 |
| staff_file_audit-20260914-01 | HR-PA-002 |
| staff_file_audit-20261214-01 | HR-PA-002 |
| emergency_preparedness_audit-20260915-01 | RM-PA-019 |
| incident_response_audit-20260323-01 | RM-PA-020 |
| incident_response_audit-20260622-01 | RM-PA-020 |
| incident_response_audit-20260921-01 | RM-PA-020 |
| incident_response_audit-20261221-01 | RM-PA-020 |

## Known Limitations

- QA-WF-03 keeps its existing high-fidelity custom route; the shared renderer is used for generic workflow and event-first swimlanes.
- Generated swimlanes infer phases and lanes from structured workflow/event fields. Low-data events are intentionally labeled with missing-context indicators.
- Template mode links open Forms Library templates only. Event execution links pass event/task/workflow context to the existing FormViewer idempotency path.
- This audit validates static coverage and ID resolution; browser verification and build results must be appended after execution.

## Implementation Result

Files changed for this phase:

- `src/policy/workflows/swimlanes/types.ts`
- `src/policy/workflows/swimlanes/roleNormalizer.ts`
- `src/policy/workflows/swimlanes/phaseTemplates.ts`
- `src/policy/workflows/swimlanes/buildSwimlaneFromWorkflow.ts`
- `src/policy/workflows/swimlanes/buildSwimlaneFromEvent.ts`
- `src/policy/workflows/swimlanes/swimlaneRegistry.ts`
- `src/policy/workflows/swimlanes/swimlaneRoutes.ts`
- `src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx`
- `src/policy/workflows/swimlanes/SwimlaneRoutePage.tsx`
- `src/policy/workflows/WorkflowLibraryApp.tsx`
- `src/policy/ces/components/calendar/CesEventInteraction.tsx`
- `src/App.tsx`
- `Builder/_system/audit-mandated-event-swimlanes.ts`
- `Builder/_system/MANDATED_EVENT_SWIMLANE_GENERATION_REPORT.md`

Shared swimlane architecture created:

- Typed model for phases, lanes, nodes, edges, source type, and mode.
- Registry supporting custom QA-WF-03, generated workflow swimlanes, generated event swimlanes, and unavailable fallback.
- Workflow and event adapters using compiled workflow steps, event processFlow, requiredForms, approvals, minutes, dependencies, policy refs, and regulatory refs.
- Generic route helpers for workflow-first and event-first navigation.
- Shared V3.2 execution map renderer with phase columns, role lanes, orthogonal connectors, node zoom, form/evidence/signature/artifact workspaces, and missing-context indicators.

QA-WF-03 preservation:

- Existing `/workflows/QA-WF-03-swimlane` route is retained and browser-verified.
- Registry marks `QA-WF-03` as custom so CES task clicks continue to route to the high-fidelity canonical route.

CES Calendar integration:

- Task open behavior now resolves `eventId`, `workflowId`, and `taskId`, checks the swimlane registry, and navigates to custom or generated swimlane routes.
- The previous "Swimlane coming soon" path is no longer used for events that can be generated.

Browser verification:

| Scenario | Route | Result |
| --- | --- | --- |
| QA-WF-03 custom swimlane | `/workflows/QA-WF-03-swimlane` | PASS, 13 cards rendered |
| Clinical audit event | `/events/plan_of_care_audit-20260507-01/swimlane` | PASS, 7 cards rendered |
| Compliance review event | `/events/oig_workplan_review-20260730-01/swimlane` | PASS, 5 cards rendered |
| Governance/QAPI event | `/events/qapi_meeting-20260507-08/swimlane` | PASS, 15 cards rendered |
| Training event | `/events/employee_compliance_training-20260901-01/swimlane` | PASS, 7 cards rendered |
| Filing/submission event | `/events/hhcahps_filing-20260331-01/swimlane` | PASS, 9 cards rendered |
| Minimal fallback event | `/events/compliance_report_weekly-20260511-01/swimlane` | PASS, 5 cards rendered |
| Task deep link | `/workflows/CL-WF-26/swimlane?eventId=plan_of_care_audit-20260507-01&taskId=CL-WF-26-STEP-01` | PASS, 7 cards rendered |

Validation results:

- `npx tsx --tsconfig tsconfig.app.json Builder/_system/audit-mandated-event-swimlanes.ts`: PASS.
- `npm run verify:alignment`: PASS, 254 events and 206 workflows scanned, 0 findings.
- `npm run verify:required-forms`: PASS.
- `npm run verify:task-identity`: PASS.
- `npm run verify:calendar-keys`: PASS, 0 duplicate key warnings on `/calendar`.
- `npm run validate:event-dataflow`: PASS.
- `npm run check:ecign-routes`: PASS, 18 routes verified.
- `npm run validate:aws-ces-mapping`: PASS.
- Dedicated route checker and ACHC/HH map validator are not defined in `package.json`; no invented results reported.

Build result:

- `npm run build`: FAIL due to pre-existing unrelated TypeScript errors:
  - `src/policy/pages/MasterCalendarPage.tsx`: unused `JulyReadinessBanner`.
  - `src/policy/zoom-navigation/ZoomNavigationProvider.tsx`: unused `OPEN_EASE`.
  - `src/policy/zoom-navigation/ZoomNavigationProvider.tsx`: CSS custom-property object is not assignable to `CSSProperties`.

Remaining limitations and next recommended phase:

- Resolve or alias the unresolved form IDs listed above, especially `QA-FM-021`, `QA-FM-025`, `QA-FM-026`, `QA-FM-027`, `CO-F-010`, and `RM-F-020`.
- Resolve policy corpus IDs or provide explicit policy-ref aliases for the unresolved policy refs listed above.
- Migrate the QA-WF-03 custom page onto the shared renderer after the current branch's visual work is stabilized; the route is preserved now to avoid degrading the canonical pattern.
- Add a static route checker for swimlane routes if the project adds a general route validation script.
