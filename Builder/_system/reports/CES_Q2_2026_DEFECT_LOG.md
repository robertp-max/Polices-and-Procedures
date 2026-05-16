# CES Q2 2026 — Defect Log
Generated: 2026-05-11T06:55:15.433Z
Total defects: 6

## DEFECT-Q2-001 — No task cards found on Sprint Board — board may be empty

**DEFECT ID:** DEFECT-Q2-001
**TITLE:** No task cards found on Sprint Board — board may be empty
**SEVERITY:** Critical
**ROLE:** N/A
**EVENT ID:** N/A
**TASK ID:** N/A
**FORM ID:** N/A
**FORM INSTANCE ID:** N/A
**EVIDENCE ID:** N/A
**ARTIFACT ID:** N/A
**URL:** `http://localhost:5173/ces/board`

**STEPS TO REPRODUCE:**
1. Navigate to /ces/board. 2. Look for task cards.

**EXPECTED RESULT:** Task cards visible on sprint board

**ACTUAL RESULT:** No element matching task card selectors found

**SCREENSHOT PATH:** `Builder/_system/screenshots/ces-q2-2026-complete-uat/02-sprint-board/02-02-task-right-panel-open.png`

**CONSOLE ERROR:**
```
N/A
```

**NETWORK ERROR:** N/A
**LIKELY ROOT CAUSE:** Board is empty — no tasks loaded for current sprint window
**FILES/COMPONENTS TO INSPECT:** src/policy/ces/components/board/SprintExecutionBoard.tsx
**RECOMMENDED FIX:** Verify data pipeline delivers execution units to sprint board component
**REGRESSION RISK:** Critical

---

## DEFECT-Q2-002 — No calendar event chips found — cannot test event click flow

**DEFECT ID:** DEFECT-Q2-002
**TITLE:** No calendar event chips found — cannot test event click flow
**SEVERITY:** High
**ROLE:** N/A
**EVENT ID:** N/A
**TASK ID:** N/A
**FORM ID:** N/A
**FORM INSTANCE ID:** N/A
**EVIDENCE ID:** N/A
**ARTIFACT ID:** N/A
**URL:** `http://localhost:5173/calendar?view=sprint`

**STEPS TO REPRODUCE:**
1. Navigate to /calendar?view=sprint. 2. Look for event chips/cards.

**EXPECTED RESULT:** Clickable event chips visible on calendar grid

**ACTUAL RESULT:** No elements matching calendar event chip selectors found

**SCREENSHOT PATH:** `Builder/_system/screenshots/ces-q2-2026-complete-uat/03-calendar/03-02-no-event-chips.png`

**CONSOLE ERROR:**
```
N/A
```

**NETWORK ERROR:** N/A
**LIKELY ROOT CAUSE:** Calendar events not rendering or selector mismatch (missing data-testid)
**FILES/COMPONENTS TO INSPECT:** src/policy/ces/components/calendar/ComplianceCalendar.tsx
**RECOMMENDED FIX:** Add data-testid="calendar-event" to event chip elements
**REGRESSION RISK:** High — calendar navigation path to events is untestable without selectors

---

## DEFECT-Q2-003 — Form URL missing form_instance_id parameter

**DEFECT ID:** DEFECT-Q2-003
**TITLE:** Form URL missing form_instance_id parameter
**SEVERITY:** High
**ROLE:** N/A
**EVENT ID:** qapi_meeting-20260512-09
**TASK ID:** N/A
**FORM ID:** N/A
**FORM INSTANCE ID:** MISSING
**EVIDENCE ID:** N/A
**ARTIFACT ID:** N/A
**URL:** `http://localhost:5173/forms`

**STEPS TO REPRODUCE:**
1. Open event qapi_meeting-20260512-09. 2. Click "Complete Form" button. 3. Check URL.

**EXPECTED RESULT:** Form URL includes form_instance_id parameter, e.g. ?instance=EVT-QA-...&form_instance_id=...

**ACTUAL RESULT:** URL does not contain instance/form_instance_id: http://localhost:5173/forms

**SCREENSHOT PATH:** `Builder/_system/screenshots/ces-q2-2026-complete-uat/06-forms/06-01-form-open.png`

**CONSOLE ERROR:**
```
N/A
```

**NETWORK ERROR:** N/A
**LIKELY ROOT CAUSE:** Form navigation not passing form_instance_id — opens generic template instead of event instance
**FILES/COMPONENTS TO INSPECT:** src/policy/compliance-execution/cesFormInstanceId.ts, src/policy/compliance-execution/useEventExecutionDataflow.ts, src/policy/components/regulatory/WorkflowExecutionPanel.tsx
**RECOMMENDED FIX:** Ensure getOrCreateFormInstance() is called and the result form_instance_id is appended to the /forms/:formId route
**REGRESSION RISK:** Critical — without form_instance_id, forms are not linked to events and audit trail is broken

---

## DEFECT-Q2-004 — Form data does not persist after browser refresh

**DEFECT ID:** DEFECT-Q2-004
**TITLE:** Form data does not persist after browser refresh
**SEVERITY:** Critical
**ROLE:** N/A
**EVENT ID:** N/A
**TASK ID:** N/A
**FORM ID:** QA-F-010
**FORM INSTANCE ID:** test-instance-1778482449222
**EVIDENCE ID:** N/A
**ARTIFACT ID:** N/A
**URL:** `http://localhost:5173/forms/QA-F-010?form_instance_id=test-instance-1778482449222`

**STEPS TO REPRODUCE:**
1. Open /forms/QA-F-010?form_instance_id=test-instance-1778482449222. 2. Fill text field with "UAT-TEST-1778482453884". 3. Save. 4. Refresh page. 5. Check field value.

**EXPECTED RESULT:** Field retains value "UAT-TEST-1778482453884" after refresh

**ACTUAL RESULT:** Field value is "" after refresh — save did not persist

**SCREENSHOT PATH:** `Builder/_system/screenshots/ces-q2-2026-complete-uat/06-forms/06-03-form-after-refresh.png`

**CONSOLE ERROR:**
```
N/A
```

**NETWORK ERROR:** N/A
**LIKELY ROOT CAUSE:** Form data saved to in-memory state only, not persisted to localStorage or backend
**FILES/COMPONENTS TO INSPECT:** src/policy/components/FormViewer.tsx, src/policy/stores/regulatoryExecutionStore.ts
**RECOMMENDED FIX:** Persist form instance data to localStorage keyed by form_instance_id. Reload on mount.
**REGRESSION RISK:** Critical — audit requires forms to persist saved state

---

## DEFECT-Q2-005 — Sign/Route for Signature button not found on form page

**DEFECT ID:** DEFECT-Q2-005
**TITLE:** Sign/Route for Signature button not found on form page
**SEVERITY:** High
**ROLE:** N/A
**EVENT ID:** N/A
**TASK ID:** N/A
**FORM ID:** QA-F-012
**FORM INSTANCE ID:** N/A
**EVIDENCE ID:** N/A
**ARTIFACT ID:** N/A
**URL:** `http://localhost:5173/forms/QA-F-012?form_instance_id=test-ecign-1778482458187`

**STEPS TO REPRODUCE:**
1. Open /forms/QA-F-012. 2. Look for Sign or Route for Signature button.

**EXPECTED RESULT:** Sign button visible for forms requiring eCIgn

**ACTUAL RESULT:** No sign button found

**SCREENSHOT PATH:** `Builder/_system/screenshots/ces-q2-2026-complete-uat/07-ecign/07-01-no-sign-button.png`

**CONSOLE ERROR:**
```
N/A
```

**NETWORK ERROR:** N/A
**LIKELY ROOT CAUSE:** Signature routing not wired in FormViewer or form not in signature-required state
**FILES/COMPONENTS TO INSPECT:** src/policy/components/FormViewer.tsx, src/policy/components/FormSigningWorkspace.tsx
**RECOMMENDED FIX:** Add Sign/Route for Signature CTA to FormViewer for forms with signaturesRequired > 0
**REGRESSION RISK:** High

---

## DEFECT-Q2-006 — Audit trail has no artifact links — entries are metadata-only

**DEFECT ID:** DEFECT-Q2-006
**TITLE:** Audit trail has no artifact links — entries are metadata-only
**SEVERITY:** Critical
**ROLE:** N/A
**EVENT ID:** N/A
**TASK ID:** N/A
**FORM ID:** N/A
**FORM INSTANCE ID:** N/A
**EVIDENCE ID:** N/A
**ARTIFACT ID:** N/A
**URL:** `http://localhost:5173/audit`

**STEPS TO REPRODUCE:**
1. Navigate to /audit. 2. Look for "View Artifact" links in audit trail entries.

**EXPECTED RESULT:** Each audit entry for form/evidence/signature actions has a "View Artifact" link

**ACTUAL RESULT:** No artifact links found in audit trail — entries are metadata labels only

**SCREENSHOT PATH:** `Builder/_system/screenshots/ces-q2-2026-complete-uat/09-audit/09-02-audit-trail-entries.png`

**CONSOLE ERROR:**
```
N/A
```

**NETWORK ERROR:** N/A
**LIKELY ROOT CAUSE:** Audit trail entries lack artifact ID binding or artifact links not rendered
**FILES/COMPONENTS TO INSPECT:** src/policy/pages/AuditModePage.tsx, src/policy/audit/auditState.ts, src/policy/artifacts/artifactRoute.ts
**RECOMMENDED FIX:** Bind artifact IDs to audit entries. Add "View Artifact" link for each FORM_COMPLETED, FILE_UPLOADED, SIGNATURE_APPLIED entry.
**REGRESSION RISK:** Critical — CMS/ACHC audit defensibility requires clickable evidence

---
