# V6 Design Reconciliation Report - Deep Audit

This document provides a deep visual audit of all 54 routes in the V6 platform at the **page-state / tab / subview** level, expanding beyond route-level PNG presence to identify gaps within filters, tabs, action drawers, modals, and embedded workflows.

---

## 1. Final Report Summary

* **Additional missing designs found:**
  1. **Workflows Detail Panel/Drawer** (clicking a workflow row opens `VeilDrawer` with forms, policies, evidence path, logs).
  2. **Workflow Swimlane Card Drill-down Modal** (viewing checkboxes, evidence upload slots, eSign logs for a task card).
  3. **Workflow Swimlane Drag-and-Drop Indicator States** (visual drop zones and drag states).
  4. **Calendar Event Creation Modal** (form layouts for scheduling new compliance events).
  5. **Staffing Calendar Conflict Resolution Drawer** (resolving overlapping clinician schedules).
  6. **Onboarding v2 Gate Checklist Expander** (expanding gate tiles to view OIG, SAM, licensure checklists).
  7. **Onboarding v2 Unit Evidence/Signature Sub-tabs** (file viewer vs eSign signature log toggle).
  8. **Onboarding v2 Override Request Modal** (gated dual-signature request form).
  9. **Audit PDF/Image Preview Toolbar** (zoom, rotate, download, copy hash controls).
  10. **eCIgn Mobile Drawing/Signing Overlay** (interactive canvas for hand signatures).
  11. **Admin User/Role Permission Edit Matrix** (fine-grained matrix of checkboxes for scopes).
* **Workflow tab/state findings:**
  - **Two Distinct Swimlane Configurations Exist:**
    1. **Workflow Swimlane (`/workflows/:workflowId/swimlane`)**: Already implemented as a horizontal 4-column kanban board layout.
    2. **Calendar Event Swimlane (embedded in `/ces/calendar` or `/calendar`)**: An inline drill-down view for selected calendar events featuring a **horizontal, auto-fitting flowchart grid** showing steps (connected by arrow icons) and a **vertical stacked lane layout** below it.
  - **Unimplemented Flowchart / Inline Swimlane:** In the current V6 React app, clicking calendar events redirects directly to the `/workflows/:workflowId/swimlane` board route. The inline Calendar Event Swimlane (with its flowchart grid and vertical cards layout) is **not implemented** in the calendar views and represents a visual/functional gap.
  - The workflows library overview (`/workflows`) lacks functional tabs to group by domain (Clinical, Admin, Governance) and search/filter inputs. The detail drawer showing linked items and execution history has no design.
  - The board-based swimlane lacks interactive card drag/drop states, card drill-down check-off modals, and empty-lane placeholders.
* **Pages safe for seeding:**
  - **51 routes** are fully safe for seeding. Their schemas map exactly to static PNGs and defined prototype datasets (e.g. `clinicianRecords`, `patientRecords`, `onboardingV2Batches`).
* **Pages that should wait:**
  - `/ces/events` (`events-board`) - Wait for critical event-card wireframe approval.
  - `/policy-lifecycle/:policyId` (`policy-lifecycle-detail`) - Wait for audit timeline diff-view wireframe approval.
* **Pages that need Canvas design:**
  - `/ces/events` (`events-board`)
  - `/workflows` (Detail drawer and domain filters)
  - `/workflows/:workflowId/swimlane` (Task card drill-down/evidence modal)
  - `/onboarding-v2/batches/:batchId` (Gate checklists and evidence sub-tabs)
  - `/onboarding-v2/governance` (Override request modal)
  - `/policy-lifecycle/:policyId` (`policy-lifecycle-detail`)
  - `/admin/users` (Access control editing grid)
* **Whether prior "only 2 missing designs" was accurate:**
  - **Highly Inaccurate**. The prior audit only matched the top-level route paths to filenames. It completely missed that major interactive subviews, tabs, and action drawers (like the Gate Checklists, Override forms, and Swimlane Task details) have no design blueprints in the V6 Final assets directory.
* **Recommended next step:**
  - Submit the missing layouts wireframes (`55-events-board.png` and `56-policy-lifecycle-detail.png` created in Phase 12.2) to the human reviewer for approval.
  - Request Canvas designs for the remaining 5 sub-view components (Workflow Detail Drawer, Swimlane Card Modal, Gate Checklist Expander, Override Modal, and Permission Matrix) to establish strict specs before the coding team starts logical reconnection.

---

## 2. Deep Route-by-Route Reconciliation

| # | Route | Hash ID | Visible Tabs/Subviews/States Found | Current Implementation Status | Matching Design Ref | Missing Design State | Blocks Seeding | Needs Canvas Design |
|---|---|---|---|---|---|---|---|---|
| 01 | `/dashboard` | `dashboard` | 4 MetricTiles, work queue table, right Signals rail | **implemented** | `16-dashboard.png` | Search suggestions, empty/clear signals state | No | No |
| 02 | `/clinicians` | `clinicians` | Roster table, right summary card with ProgressMeters | **implemented** | `15-clinicians.png` | Caseload assignment drawer, document uploader | No | No |
| 03 | `/clinicians/:clinicianId` | `clinician-detail` | Left profile cards, right caseload DataTable | **implemented** | `14-clinician-detail.png` | Document validation failure state details | No | No |
| 04 | `/patients` | `patients` | Roster table, right summary panel with ProgressMeters | **implemented** | `43-patients.png` | New admission modal, schedule override panel | No | No |
| 05 | `/patients/:patientId` | `patient-detail` | Left care-plan metrics/checklist, right SurfaceCards | **implemented** | `42-patient-detail.png` | Medication reconciliation drawer | No | No |
| 06 | `/calendar` | `master-calendar` | Month grid, upcoming events rail, event hover card | **implemented** | `30-master-calendar.png` | Weekly/Daily agenda layouts, edit event modal, **inline flowchart swimlane** | No | **Yes** (Agenda list / Flowchart) |
| 07 | `/staffing-calendar` | `staffing-calendar` | Staffing grid, shift-gaps rail | **implemented** | `48-staffing-calendar.png` | Clinician schedule assignment drawer, conflict popover | No | **Yes** (Conflict resolver) |
| 08 | `/iadministrator` | `brad` | ChatThread, suggested chips, citation context rail | **implemented** | `10-brad.png` | Citation diff view, draft report exporter modal | No | No |
| 09 | `/ces/calendar` | `ces-calendar` | Month grid, upcoming events rail, event hover card | **implemented** | `12-ces-calendar.png` | Release audit packet dialog, **inline flowchart swimlane** | No | **Yes** (Flowchart) |
| 10 | `/ces/board` | `ces-board` | 6 BoardLanes with task cards | **implemented** | `11-ces-board.png` | Card reorder hover guides, task assignment popover | No | No |
| 11 | `/ces/events` | `events-board` | 4 lanes representing event categories | **implemented** | `55-events-board.png` (pending human approval) | Custom critical event card layout, action items modal | **Yes** (until approved) | **Yes** (approving wireframe 55) |
| 12 | `/workflows` | `workflows` | Workflows matrix table, right SurfaceCards | **implemented** | `54-workflows.png` | Domain filters/tabs, **Workflow Detail Drawer/Panel** | No | **Yes** (Detail drawer) |
| 13 | `/workflows/:workflowId/swimlane` | `workflow-swimlane` | 4 lanes (Intake → Lock) with detailed cards | **implemented** | `53-workflow-swimlane.png` | Card drag states, **Card Drill-down/Action details modal** | No | **Yes** (Card drill-down) |
| 14 | `/compliance/master-controls` | `master-controls` | Controls matrix table, right info cards | **implemented** | `31-master-controls.png` | Risk level override modal, control editor | No | No |
| 15 | `/audit` | `audit-mode` | Surveyor verification table, right packet card | **implemented** | `09-audit-mode.png` | **Document preview toolbar** (zoom/rotate/verify hash) | No | **Yes** (Preview toolbar) |
| 16 | `/evidence` | `evidence-center` | Virtualized evidence DataTable, right stats cards | **implemented** | `19-evidence-center.png` | Document detail drawer, hash mismatch alert state | No | No |
| 17 | `/ces/reports` | `ces-reports` | SVG bar chart dataviz, right metrics cards | **implemented** | `13-ces-reports.png` | Report range filter selectors, csv export modal | No | No |
| 18 | `/calendar/event/:eventId/task/:taskId` | `mobile-incident` | Mobile PageHeader, incident card, attachment slots | **implemented** | `32-mobile-incident.png` | Camera attachment capture UI flow, GPS logs | No | No |
| 19 | `/my-tasks` | `my-tasks` | 3 lanes (Todo, In Progress, Done) with cards | **implemented** | `35-my-tasks.png` | Task creation form, supervisor reassignment menu | No | No |
| 20 | `/framework` | `framework` | Expand/collapse tree of domains | **implemented** | `22-framework.png` | Subdomain detail popover | No | No |
| 21 | `/framework/achc-survey` | `achc-survey` | Checklist table, right prompts and actions table | **implemented** | `02-achc-survey.png` | Surveyor score override dialog, zip binder exporter | No | No |
| 22 | `/framework/achc-survey/crosswalk` | `achc-crosswalk` | Crosswalk table, right policy council cards | **implemented** | `01-achc-crosswalk.png` | Crosswalk export template selector | No | No |
| 23 | `/library` | `policy-library` | Virtualized policy table, right stewardship cards | **implemented** | `45-policy-library.png` | Bulk policy version review modal, tag editor | No | No |
| 24 | `/library/:policyId` | `policy-detail` | Left policy text content, right linked items rail | **implemented** | `44-policy-detail.png` | Print layout configure dialog, version history logs | No | No |
| 25 | `/forms` | `forms-library` | Forms table, right filters sidebar cards | **implemented** | `21-forms-library.png` | Form creation wizard, template archive | No | No |
| 26 | `/forms/:formId` | `form-viewer` | 7 section layouts filled read-only, right rail | **implemented** | `20-form-viewer.png` | Field validation error list drawer | No | No |
| 27 | `/forms/:formId/esign` | `ecign-workspace` | 6 ordered signing steps, Attestation check, cert | **implemented** | `18-ecign-workspace.png` | **Mobile hand drawing signature canvas**, SMS OTP | No | **Yes** (Signing canvas) |
| 28 | `/artifacts/:artifactId` | `artifact-viewer` | Metadata card, document viewer slot | **implemented** | `08-artifact-viewer.png` | Verification logs history, PDF/image download options | No | No |
| 29 | `/viewer/:referenceId` | `generic-reference` | Left citation details, right related source list | **implemented** | `23-generic-reference.png` | External website preview sandbox frame | No | No |
| 30 | `/journey` | `journey-overview` | Learner nodes checklist, onboarding ProgressMeter | **implemented** | `28-journey-overview.png` | Timeline override panel, graduation certificate popup | No | No |
| 31 | `/journey/v1-journey` | `journey-v1` | Lesson-path checklist, right module info cards | **implemented** | `29-journey-v1.png` | Archive warning alerts | No | No |
| 32 | `/journey/module/:moduleId` | `module-player` | quiz inputs, checkoff rating ChecklistTable | **implemented** | `34-module-player.png` | Exam fail fallback screens, preceptor signature | No | No |
| 33 | `/journey/appendix-f` | `appendix-f` | Doc TOC index, ChecklistTable background check | **implemented** | `07-appendix-f.png` | OIG/SAM background check API failure warning logs | No | No |
| 34 | `/journey/supervisor` | `supervisor` | Cohort learners table, right supervisor clearances | **implemented** | `49-supervisor.png` | Preceptor comments log, supervisor checkoff overrides | No | No |
| 35 | `/journey/admin` | `journey-admin` | Syllabus table, right regulatory mappings card | **implemented** | `27-journey-admin.png` | Course path syllabus editor modal | No | No |
| 36 | `/journey/guide` | `user-guide` | Training guide index, support links | **implemented** | `52-user-guide.png` | Persona-based layout selectors | No | No |
| 37 | `/onboarding-v2/dashboard` | `onboarding-v2-dashboard` | 5 MetricTiles, activation queue table, gate outcome | **implemented** | `40-onboarding-v2-dashboard.png` | Overrides drawer checklist, alert notifications banner | No | No |
| 38 | `/onboarding-v2/activate` | `onboarding-v2-activate` | Dynamic subject form, reconciliation preview | **implemented** | `36-onboarding-v2-activate.png` | Existing candidate overlap warning alert overlay | No | **Yes** (Warning overlays) |
| 39 | `/onboarding-v2/batches` | `onboarding-v2-batches` | Batches table, right statistics cards | **implemented** | `39-onboarding-v2-batches.png` | Batch deletion/archive popup, trigger filters | No | No |
| 40 | `/onboarding-v2/batches/:batchId` | `onboarding-v2-batch` | Roster table, 5 gate icons, checkoff index | **implemented** | `38-onboarding-v2-batch.png` | **Gate checklists expander**, **Evidence / Signature subtabs** | No | **Yes** (Gate checklist / tabs) |
| 41 | `/onboarding-v2/audit` | `onboarding-v2-audit` | subject-verification table, override panel, timeline | **implemented** | `37-onboarding-v2-audit.png` | Auditor bulk checklist signature drawer | No | No |
| 42 | `/onboarding-v2/governance` | `onboarding-v2-governance` | Active overrides table, audits log | **implemented** | `41-onboarding-v2-governance.png` | **Request Override form/modal** (reason/sig/duration) | No | **Yes** (Override request) |
| 43 | `/policy-lifecycle` | `policy-lifecycle` | 5 Lifecycle lanes with policy card stacks | **implemented** | `46-policy-lifecycle.png` | transition validation form, stage change logs | No | No |
| 44 | `/hubstaff` | `hubstaff` | Integration logs table, mileage/time charts | **implemented** | `26-hubstaff.png` | Sync logs drawer, connection mismatch overlay | No | No |
| 45 | `/system-documentation/:sectionId` | `system-docs` | Left index, right documentation text area | **implemented** | `51-system-docs.png` | Article feedback rating widget | No | No |
| 46 | `/help/*` | `help-center` | Left help categories, right content search + guide | **implemented** | `25-help-center.png` | Support ticket draft drawer | No | No |
| 47 | `/governance` | `governance` | SVG reports charts, right reviews queue | **implemented** | `24-governance.png` | CSV export layout selector | No | No |
| 48 | `/admin/user-groups` | `admin-groups` | Groups table, right scope details card | **implemented** | `03-admin-groups.png` | Add group modal, roles selector | No | No |
| 49 | `/admin/roles` | `admin-roles` | Platform roles table, right permissions summary | **implemented** | `05-admin-roles.png` | Create role dialog, permissions checkbox matrix | No | No |
| 50 | `/admin/permissions` | `admin-permissions` | Permissions catalog list, right details card | **implemented** | `04-admin-permissions.png` | Custom privilege tag editor | No | No |
| 51 | `/admin/users` | `admin-users` | Users table (roles/status), right edit summary | **implemented** | `06-admin-users.png` | **Granular permission overrides edit matrix** | No | **Yes** (Permission matrix) |
| 52 | `/surveyor/policy/:policyId` | `surveyor-viewer` | Policy text panel, right deficiency checklist | **implemented** | `50-surveyor-viewer.png` | deficiency note submit dialog | No | No |
| 53 | `/policy-lifecycle/:policyId` | `policy-lifecycle-detail` | Left policy text / timeline audit, right checklist | **implemented** | `56-policy-lifecycle-detail.png` (pending human approval) | Document comparison diff-view tab, comments thread | **Yes** (until approved) | **Yes** (approving wireframe 56) |
| 54 | `/login` | `login-page` | Email/Password inputs, sign-in button | **implemented** | *none* (inferred) | MFA screen layout, change password form | No | No |
