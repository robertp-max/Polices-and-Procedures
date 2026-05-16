# CES — Task Identity Corruption and Q2 2026 Task Failures

**Component**: Compliance Execution System (CES) — Task Identity, Sprint/Kanban/Gantt Projections  
**Severity**: P1 — Q2 2026 compliance tasks are invisible, unroutable, or unsignable  
**Status**: Unresolved as of 2026-05-14  

---

## 1. Source Evidence

Transcript `3cf17f83-d2d2-4eff-8be0-855974539cb4`, May 10–11, 2026:  
Full Playwright UAT executed for Q2 2026 CES tasks. 34 tests run. All 34 passed (test infrastructure passed) but **6 defects captured** (3 Critical, 3 High). The "passing" tests captured defects via the `afterAll` hook — the failures are in the defect log, not the test exit code.

The UAT scope covered:
- 31 Q2 2026 events (April 1 – June 30, 2026)
- 11 events tested via direct URL
- 8 system surfaces: Dashboard, Board, Calendar, Gantt, Forms, eCIgn, Evidence Center, Audit Mode
- 50 screenshots captured

---

## 2. The 6 Documented Defects

### DEFECT-Q2-001 — Sprint Board Shows No Task Cards (CRITICAL)

- **URL**: `http://localhost:5173/ces/board`
- **Symptom**: No element matching task card selectors found
- **Screenshots**: `02-sprint-board/02-01-board-initial-state.png`, `02-02-task-right-panel-open.png`
- **Root cause (Playwright + screenshot analysis)**: Task cards ARE visible in screenshots but have no `data-testid="execution-unit-card"` attribute. Additionally, sprint header shows "Sprint 9 Apr 26 – May 7, 2026" while scope shows Sprint 10 (May 10–23) — sprint header is inconsistent with displayed sprint.
- **Fix required**: Add `data-testid="execution-unit-card"` and `data-unit-id={unit.id}` to `ExecutionUnitCard.tsx`.

### DEFECT-Q2-002 — Calendar Event Chips Missing data-testid (HIGH)

- **URL**: `http://localhost:5173/calendar?view=sprint`
- **Symptom**: Calendar event chips not found by Playwright selectors
- **Root cause**: Calendar chip components lack `data-testid="calendar-event"` attributes. When navigating to `?view=sprint`, the Sprint Board tab activates but calendar event chips are in the Calendar tab, not the Sprint Board tab — test was on wrong view.
- **Fix required**: Add `data-testid="calendar-event"` and `data-event-id={event.id}` to `EventAnchorMarker` in `ComplianceCalendar.tsx`.

### DEFECT-Q2-003 — Form URL Missing form_instance_id Parameter (HIGH)

- **URL**: Event page → "Complete Form" button → navigates to `/forms` (Forms Library) instead of `/forms/QA-F-010?form_instance_id=...&event_id=...`
- **Symptom**: Clicking "Complete Form" on an event page opens the Enterprise Forms Library instead of the specific form instance
- **Root cause**: The form link in `WorkflowExecutionPanel.tsx` does not include `form_instance_id` and `event_id` as URL parameters when constructing the "open form" navigation. The form defaults to template mode when `form_instance_id` is absent.
- **Fix required**: Add `form_instance_id`, `event_id`, and `task_id` query params to the navigation URL constructed in `WorkflowExecutionPanel.tsx`.

### DEFECT-Q2-004 — Form Data Does Not Persist After Browser Refresh (CRITICAL)

- **URL**: `/forms/QA-F-010?form_instance_id=test-instance-...`
- **Symptom**: Fill a field → Save → Refresh → field is empty ("")
- **Screenshots**: Form renders as "TEMPLATE ▸ FORM QA-F-010" in read-only template mode after refresh, not as the filled instance
- **Root cause**: Form instance field values are stored in-memory only, not written to `regulatoryExecutionStore` keyed by `form_instance_id`. After refresh, the form reverts to template view because no persisted instance exists.
- **Fix required**: `regulatoryExecutionStore.ts` must persist form instance field values keyed by `form_instance_id`. Also dependent on DEFECT-Q2-003 (form must receive correct `form_instance_id` to persist against).

### DEFECT-Q2-005 — Sign Button Not Found on Form Page (HIGH)

- **URL**: `/forms/QA-F-012`
- **Symptom**: No "Sign" or "Route for Signature" button found
- **Screenshots**: `07-01-no-sign-button.png` — form shows "Awaiting Signature" banner but no prominent sign button
- **Root cause**: The eCIgn sign button is rendered as an image (eCIgn logo) inside the signature field, not as a text button. Playwright selector `button:has-text("Sign")` does not match. Additionally, the sign button is only visible when the form is in instance mode (not template mode) — linked to DEFECT-Q2-003.
- **Fix required**: Add `data-testid="ecign-sign-btn"` to the sign trigger in `ECIgnWorkspace`. Add visible "Sign" text label alongside the logo.

### DEFECT-Q2-006 — Audit Trail Is Metadata-Only, No "View Artifact" Links (CRITICAL)

- **URL**: Audit Mode page
- **Symptom**: Audit trail entries do not show "View Artifact" links
- **Root cause (confirmed in transcript)**: `AuditModePage.tsx` has `artifactRouteForAuditEntry()` that renders "View Artifact" links — but only when `entry.targetId` is non-null. `appendTaskAuditEvent` in `WorkflowExecutionPanel.tsx` passes `formInstanceId` inside the `after` object, not as top-level `targetKind: 'form_instance'` / `targetId: formInstanceId`. Therefore all audit trail entries have `targetId = undefined`, and no artifact links ever render.
- **Fix required**: Update `appendTaskAuditEvent` call in `WorkflowExecutionPanel.tsx` (line ~1563) to pass `targetKind: 'form_instance'` and `targetId: formInstanceId` at the top level of the options object, not nested inside `after`.

---

## 3. Additional Recurring Symptoms (Pre-UAT User Reports)

From transcript `cacb1d6f-47aa-4365-9097-1cbfcca36b6c` (May 11, 2026):

- *"when i reset the sandbox it doesnt clear the evidences"* (11:12 AM)
- *"its still here!!!!!"* — after first reset fix attempt (11:18 AM)
- *"u fucking idiot both reset dont fucking work"* (11:21 AM)
- *"confirm all artifacts and evidences are also removed, confirm naming convention for form instances or artifact also resets to 1"* (14:10 PM)

The reset function was claimed fixed but did not clear:
- Evidence rows in `regulatoryExecutionStore`
- Form instance metadata
- Signed artifact metadata
- Naming convention counters

---

## 4. Why Prior Fixes Likely Failed

1. **`taskOverridesByEventId` scope creep**: Override map uses `eventId` as key, overwriting canonical task ID lookups. Views that query by canonical task ID find nothing; views that query by event ID find the (possibly stale) override.

2. **Date-scoped projection boundary**: Q2 tasks (April 1 – June 30) may be excluded by off-by-one date boundary checks in `obligationSelectors`. The boundary check is likely duplicated independently in each of the four views (calendar, sprint, kanban, gantt) with slightly different operator or timezone handling.

3. **Form routing**: `WorkflowExecutionPanel.tsx` constructs the "open form" navigation URL without `form_instance_id` — confirmed by DEFECT-Q2-003 screenshot showing `/forms` loaded instead of `/forms/QA-F-010?...`.

4. **Audit entry structure**: `appendTaskAuditEvent` API puts `formInstanceId` in `after` rather than at top-level. No fix was ever targeted at this specific call site.

---

## 5. Exact Files and Components Involved

| File | Role |
|------|------|
| `regulatoryExecutionStore` (`reg-execution-v2`) | Holds execution state; form field values not persisted here |
| `complianceExecutionStore` | Separate store; may conflict with regulatory store IDs |
| `taskProjection` | Derived task view; source for sprint/kanban/gantt; may not include Q2 tasks |
| `obligationSelectors` | Date range filters; Q2 boundary may have off-by-one error |
| `taskOverridesByEventId` | Can corrupt canonical task IDs when override key matches canonical ID |
| `WorkflowExecutionPanel.tsx` | Form link navigation URL; audit event writing; both broken |
| `ExecutionUnitCard.tsx` | Sprint board task card; missing `data-testid` |
| `ComplianceCalendar.tsx` | Calendar event chips; missing `data-testid` |
| `AuditModePage.tsx` | Has artifact link logic but never triggers because `targetId` is always null |
| `ECIgnWorkspace` | Sign button rendered as image, no text label, no `data-testid` |

---

## 6. Validation That Was Claimed

- Sprint and kanban views were observed to render without JavaScript errors
- General task counts appeared non-zero in prior sessions
- Playwright UAT reported "34 tests passed" — misleading, as defects were in the defect log not the exit code

---

## 7. Validation That Was Missing

- No Playwright test confirming Q2 2026 tasks by date appear in sprint board
- No cross-view consistency check confirming same task visible in all four views simultaneously
- No end-to-end form flow test: event → open form instance → fill → save → refresh → confirm persistence
- No audit trail test confirming "View Artifact" link is rendered and resolves to correct artifact
- No sandbox reset test confirming all rows, instances, and counters are cleared to zero

---

## 8. Acceptance Criteria for Future Fix

- [ ] All Q2 2026 obligations (April 1 – June 30, 2026) appear in sprint view
- [ ] The same obligations appear in kanban and gantt with consistent status
- [ ] Completing a task in one view reflects immediately in all other views without refresh
- [ ] Clicking "Complete Form" on an event page navigates to `/forms/{formId}?form_instance_id=...&event_id=...`
- [ ] Form fields filled and saved persist after browser hard refresh
- [ ] DON role user: Sign button (with `data-testid="ecign-sign-btn"`) is present and functional
- [ ] DON Assistant role user: Sign button is absent or disabled
- [ ] Completing a form writes `targetKind: 'form_instance'` and `targetId: formInstanceId` to the audit entry at the top level
- [ ] Audit trail shows "View Artifact" link for completed form instances; link resolves to correct artifact
- [ ] Sandbox reset clears all Q1 and Q2 evidence rows, form instances, audit entries, and naming counters to zero
- [ ] All tests performed in-browser or via Playwright against deployed or local URL

---

## 9. Priority

**P1** — Q2 2026 compliance tasks are the active operating period. Missing, unsignable, or non-persistent tasks represent a direct compliance execution risk. DEFECT-Q2-006 additionally means the audit trail is incomplete, which is a CMS audit risk.
