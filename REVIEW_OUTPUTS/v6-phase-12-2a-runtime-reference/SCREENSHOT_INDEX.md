# V6 Phase 12.2.a Missing Subview Screenshots Index

This index acts as the visual lock for the runtime implementation. All porting work under `src/v6/**` must preserve the exact layout, typography, palette, and terminology captured in these screenshots.

## Screenshot Mappings (17 States)

---

### 1. Journey Supervisor Learner Picker
* **Filename**: `01-journey-supervisor-picker.png`
* **Parent Route**: `/journey/supervisor`
* **Phase 12.2.a State**: Learner / Employee Picker
* **Trigger Used**: Opened by default / toggled via "Learner picker" button.
* **Likely Runtime File**: [SupervisorScreen.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/SupervisorScreen.tsx)
* **Visual Notes to Preserve**: 
  - Inline card block containing a search bar, filter pills ("All", "GAO", "Clinical RN", "HHA").
  - List of learners with name, employee ID, role track, and progress status badges (e.g., "In progress", "Cleared", "Pending").

---

### 2. Journey Supervisor Visit Logging Drawer
* **Filename**: `02-journey-supervisor-drawer.png`
* **Parent Route**: `/journey/supervisor`
* **Phase 12.2.a State**: Supervised Visit Logging Drawer
* **Trigger Used**: Click the "Log supervised visit" button in the learner profile details.
* **Likely Runtime File**: [SupervisorScreen.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/SupervisorScreen.tsx)
* **Visual Notes to Preserve**:
  - Right-hand overlay drawer (`VeilDrawer` style).
  - Contains student summary card, fields for "Visit date and time", "Preceptor", "Patient / visit context".
  - "Competency checklist" grid (Patient identity, Visit documentation, Infection prevention, Medication teaching, Supervisor attestation) with status tags.
  - Action buttons "Log and validate visit" (orange) and "Cancel".

---

### 3. Journey Signature Canvas Overlay
* **Filename**: `03-journey-signature-overlay.png`
* **Parent Route**: `/journey/appendix-f` (also module players)
* **Phase 12.2.a State**: Preceptor Signature Drawing Overlay
* **Trigger Used**: Click "Open signature canvas" (open by default on Appendix F).
* **Likely Runtime File**: [AppendixFScreen.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/AppendixFScreen.tsx)
* **Visual Notes to Preserve**:
  - Centered overlay modal (`VeilModal` style) with backdrop blur.
  - Signer details grid (Signer, Role, Time).
  - Canvas container showing pen icon and "Draw signature here".
  - Clear/restore buttons and permanent audit trail attestation checkbox.

---

### 4. Journey Guide / Appendix F Active TOC State
* **Filename**: `04-journey-toc-state.png`
* **Parent Route**: `/journey/appendix-f` (or `/journey/guide`)
* **Phase 12.2.a State**: Appendix F Active Table of Contents State
* **Trigger Used**: Close the signature overlay to reveal the main screen.
* **Likely Runtime File**: [AppendixFScreen.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/AppendixFScreen.tsx)
* **Visual Notes to Preserve**:
  - Left sidebar containing section list ("Screening checklist", "Policy source", "Pending items", "HR Director signature").
  - Clear active highlighting: the active item uses a subtle background shade and status icon (e.g. green check circle or orange alert circle).

---

### 5. Module Player Failure / Retry State
* **Filename**: `05-module-player-failure.png`
* **Parent Route**: `/journey/module/:moduleId`
* **Phase 12.2.a State**: Quiz Failure / Retry / Remediation State
* **Trigger Used**: Load a module player with quiz score below threshold.
* **Likely Runtime File**: [ModulePlayerScreen.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/ModulePlayerScreen.tsx)
* **Visual Notes to Preserve**:
  - Soft orange box detailing "Remediation review required" and "Score: 68% - retry available".
  - Three-column grid displaying missed competency topics ("Infection control", "Documentation SLA", "Escalation timing") and missed items count.
  - Dual actions: "Retry quiz" (teal) and "Request preceptor review" (orange outlined).

---

### 6. Journey Admin Syllabus Builder
* **Filename**: `06-journey-admin-builder.png`
* **Parent Route**: `/journey/admin`
* **Phase 12.2.a State**: Syllabus / Course Path Timeline sequencing builder
* **Trigger Used**: Load journey-admin screen.
* **Likely Runtime File**: [JourneyAdminScreen.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/JourneyAdminScreen.tsx)
* **Visual Notes to Preserve**:
  - Left column: "RN onboarding syllabus" text fields (Course title, Role track, Target timeline, Builder notes).
  - Right column: "Module sequence" list with drag handles, step/code indicators, required/optional switches, and policy code reference chips.

---

### 7. Workflows Library Detail Drawer
* **Filename**: `07-workflows-detail-drawer.png`
* **Parent Route**: `/workflows`
* **Phase 12.2.a State**: Workflow Detail Drawer
* **Trigger Used**: Click a row in the workflows datatable (open by default).
* **Likely Runtime File**: [WorkflowsScreen.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/WorkflowsScreen.tsx)
* **Visual Notes to Preserve**:
  - Slide-out drawer displaying key metadata: Domain, Linked policies, Linked forms, Evidence path, and Execution history log.
  - "Open Swimlane" button routing to the swimlane board page.

---

### 8. Workflow Swimlane Card Detail Modal
* **Filename**: `08-swimlane-card-modal.png`
* **Parent Route**: `/workflows/:workflowId/swimlane`
* **Phase 12.2.a State**: Swimlane Task Detail Modal
* **Trigger Used**: Click a board task card (open by default).
* **Likely Runtime File**: [RepresentativeScreens.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/RepresentativeScreens.tsx) (or dedicated Swimlane view)
* **Visual Notes to Preserve**:
  - Centered modal displaying checkoff list (Checklist complete, Evidence packet attached, eCIgn signing ready, Audit note reviewed) with status indicators ("Ready" vs "Awaiting").
  - "Validate step" action button.

---

### 9. Onboarding V2 Batch Gate Expander
* **Filename**: `09-onboarding-v2-batch-expander.png`
* **Parent Route**: `/onboarding-v2/batches/:batchId`
* **Phase 12.2.a State**: Gate Checklist Expander panel
* **Trigger Used**: Load onboarding batch view.
* **Likely Runtime File**: [OnboardingV2BatchScreen.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/OnboardingV2BatchScreen.tsx)
* **Visual Notes to Preserve**:
  - Inline collapsed/expanded panel showing checklists for "SystemAccessClearance checklist" (OIG check, SAM sweep, active licensure check, etc.) with outcome badges.

---

### 10. Onboarding V2 Batch Evidence & Signature Tabs
* **Filename**: `10-onboarding-v2-batch-tabs.png`
* **Parent Route**: `/onboarding-v2/batches/:batchId`
* **Phase 12.2.a State**: Evidence / Signature Sub-tabs
* **Trigger Used**: Load onboarding batch view right panel.
* **Likely Runtime File**: [OnboardingV2BatchScreen.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/OnboardingV2BatchScreen.tsx)
* **Visual Notes to Preserve**:
  - Dual tabs "Evidence file" / "Signature log".
  - Shows metadata: Document hash, Signature sequence (e.g. Learner signed, director pending), and eCIgn audit token.

---

### 11. Onboarding V2 Governance Override Request Modal
* **Filename**: `11-onboarding-v2-governance-override.png`
* **Parent Route**: `/onboarding-v2/governance`
* **Phase 12.2.a State**: Override Request Modal form
* **Trigger Used**: Click "Request override" button (open by default).
* **Likely Runtime File**: [OnboardingV2GovernanceScreen.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/OnboardingV2GovernanceScreen.tsx)
* **Visual Notes to Preserve**:
  - Modal form fields: Target learner, Target gate, Reason (dropdown), Expiration window, Approver 1, Approver 2.
  - Permanent audit attestation checklist at the bottom.

---

### 12. Calendar Weekly / Daily Agenda View
* **Filename**: `12-calendar-agenda-view.png`
* **Parent Route**: `/calendar` (also staffing calendar)
* **Phase 12.2.a State**: Calendar Agenda Day/Week List view
* **Trigger Used**: Toggle header controls from "Month" to "Week" or "Day".
* **Likely Runtime File**: [RepresentativeScreens.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/RepresentativeScreens.tsx)
* **Visual Notes to Preserve**:
  - Vertical list of daily event records, showing times/days, status tags, titles, and clinical progress bars.

---

### 13. Staffing Calendar Conflict Resolver Drawer
* **Filename**: `13-staffing-conflict-drawer.png`
* **Parent Route**: `/staffing-calendar`
* **Phase 12.2.a State**: Staffing Conflict Resolver Drawer
* **Trigger Used**: Load staffing calendar view (open by default for conflicts).
* **Likely Runtime File**: [RepresentativeScreens.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/RepresentativeScreens.tsx)
* **Visual Notes to Preserve**:
  - Overlay drawer detailing candidate clinicians with matching percentage, distance to patient, and caseload load factor.
  - Action buttons: "Assign and dispatch" and "Escalate to director".

---

### 14. CES Calendar Inline Flowchart Swimlane
* **Filename**: `14-ces-calendar-flowchart.png`
* **Parent Route**: `/ces/calendar`
* **Phase 12.2.a State**: Calendar inline flowchart swimlane
* **Trigger Used**: Click "Q2 QAPI quarterly review" event on the calendar.
* **Likely Runtime File**: [RepresentativeScreens.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/RepresentativeScreens.tsx)
* **Visual Notes to Preserve**:
  - Expands the calendar row inline to show a flowchart swimlane detailing the sub-stages (Agenda packet, Minutes draft, Hash manifest, Export queue) with checkmarks.

---

### 15. Document Preview Toolbar
* **Filename**: `15-document-preview-toolbar.png`
* **Parent Route**: `/audit` or `/evidence` or `/viewer/:referenceId`
* **Phase 12.2.a State**: PDF / Image Preview Toolbar
* **Trigger Used**: Open document or reference artifact preview.
* **Likely Runtime File**: [GenericReferenceScreen.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/GenericReferenceScreen.tsx)
* **Visual Notes to Preserve**:
  - Toolbar above document frame: Zoom out, Zoom in, Rotate, zoom percentage dropdown, SHA-256 verification tag, "Copy hash" button, and "Download" button.

---

### 16. eCIgn Workspace Mobile Signature Overlay
* **Filename**: `16-ecign-mobile-signature.png`
* **Parent Route**: `/forms/:formId/esign`
* **Phase 12.2.a State**: eCIgn Drawing Canvas Overlay
* **Trigger Used**: Click "Open drawing overlay" (open by default).
* **Likely Runtime File**: [EcignWorkspaceScreen.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/EcignWorkspaceScreen.tsx)
* **Visual Notes to Preserve**:
  - Centered overlay modal matching the application theme.
  - Signature drawing box, attestation checkboxes, "Clear canvas", and signature approval actions.

---

### 17. Admin User Permission Matrix Override Grid
* **Filename**: `17-admin-users-matrix.png`
* **Parent Route**: `/admin/users`
* **Phase 12.2.a State**: User Permission Override Matrix
* **Trigger Used**: Load user details permission subview.
* **Likely Runtime File**: [AdminUsersScreen.tsx](file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/src/v6/screens/pageviews/AdminUsersScreen.tsx)
* **Visual Notes to Preserve**:
  - Table grid with 4 columns: Group, Permission (human labels), Inherited (Granted vs Revoked badges), Override actions (Default, Force Grant, Force Revoke).
  - Primary text labels must use human labels (e.g. `Policy writing`, `Evidence upload`, `eCIgn signing`, `Surveyor viewer access`, `User administration`).

## Implementation Checklist & Constraints

- **No Standalone Mockups**: Port these elements inside the parent screen file directly. Do not create fake routes.
- **eCIgn Spelling**: Case-sensitive string matching `eCIgn` exactly. Do not use `esign`, `eSign`, `ECign`, etc.
- **Human-Readable Labels**: Never display raw permission keys (like `policy.write`). Use human labels as primary, and raw keys as tiny muted metadata only.
- **Typography & Colors**: Do not drift from Roboto 300/500 fonts and the existing V6 theme colors. Do not copy custom hex codes or external CDN dependencies.
