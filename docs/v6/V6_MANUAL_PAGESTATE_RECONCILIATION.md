# V6 Manual Page-State & Subview Reconciliation Report

This report provides a manual, screen-by-screen audit of the CareIndeed Home Health V6 platform. Instead of matching top-level routes to image filenames, this audit manually inspects each React page component, the local running routes, and the V6 prototype specs to evaluate specific tabs, subtabs, drawers, modals, actions, and interactive workflows.

---

## 1. Final Report Summary

* **scripts used:** NO
* **modules manually checked:**
  1. Journey / Onboarding V1
  2. Onboarding V2
  3. Workflows
  4. Workflow Swimlane
  5. CES Board / Events / Calendar
  6. Calendar / Staffing Calendar
  7. Evidence / Artifact Viewer
  8. Forms / Form Viewer / eCign
  9. Policy Library / Policy Detail
  10. Policy Lifecycle
  11. Admin / RBAC
  12. Help / System Docs / Governance
  13. Brad / iAdministrator
  14. Login
* **Journey states found:**
  - Overview state with GAO & clinical role tracks.
  - Interactive Phase rail representing 7 gated statuses.
  - Module card grid (11 steps including `GAO-EXAM`, `RN-SUP`, `ANN-001`).
  - Module player page (`/journey/module/:moduleId`) with Paused Scenario Player and preceptor rating checklists.
  - Appendix F hard-stop guidelines and 15-item checkoff table.
  - Supervisor dashboard showing cohort table and exception queue.
  - Syllabus manager list under admin.
  - User guide document sidebar navigations.
* **Journey missing designs:**
  - **Supervised visit logging drawer**: No form design exists to log dates, preceptor initials, and visit checklist outcomes.
  - **Learner/Employee picker**: No visual component or dropdown to switch between active learners in the supervisor dashboard or overview.
  - **Signature draw canvas**: Lack of hand-signing overlays for both preceptor checks and Appendix F signoffs.
  - **Guide & Appendix F Table of Contents Navigation**: Links do not scroll or switch article sections.
  - **Module player exam failure and retry states**: Lack of fail/retry visual feedback cards.
  - **Syllabus / Course path builder**: Creator inputs for new syllabi inside Admin.
* **additional missing pageviews/states found:**
  - **Workflows library detail panel**: Detail drawer displaying linked items and history on row select.
  - **Workflow swimlane card detail modal**: Popup displaying action pre-conditions and files for card clicks.
  - **Onboarding v2 gate checklists expander**: Dynamic checklist popup showing individual passing criteria.
  - **Onboarding v2 unit evidence subtabs**: Evidence document preview vs eSign status log toggles.
  - **Onboarding v2 override request form**: Reason, signature verification, and expiry fields.
  - **Audit viewer toolbar controls**: PDF viewer actions (zoom, rotate, download, copy hash).
  - **Admin user permission matrix overrides**: Fine-grained matrix table showing user scope checkboxes.
  - **Calendar weekly/daily agenda view**: List layouts for operations and staffing calendars.
  - **Staffing calendar conflict resolver drawer**: Action drawer to resolve visit gaps.
* **routes/modules safe for later seeding:**
  - **37 routes** are safe for database seeding because their data structures map to fully-designed, stable lists or metrics grids (e.g. clinicians/patients roster, admin user-groups, framework tree, forms catalog).
* **routes/modules that must wait:**
  - **17 routes** must wait because they are missing critical subviews, tabs, or detailed checklists. Seeding data without completing these interfaces will create contracts that violate the final visual specifications:
    - `/calendar` (needs weekly/daily agenda list design)
    - `/staffing-calendar` (needs conflict resolver drawer design)
    - `/ces/calendar` (needs inline flowchart swimlane design)
    - `/ces/events` (needs event card wireframe approval)
    - `/workflows` (needs detail panel/drawer design)
    - `/workflows/:workflowId/swimlane` (needs card details checkoff modal design)
    - `/forms/:formId/esign` (needs mobile signature drawing pad canvas design)
    - `/onboarding-v2/batches/:batchId` (needs gate checklist expanders and unit sub-tabs design)
    - `/onboarding-v2/governance` (needs override request modal design)
    - `/policy-lifecycle/:policyId` (needs timeline difference audit design)
    - `/admin/users` (needs permissions matrix checkbox overrides design)
* **Gemini Canvas designs needed:**
  - Workflow Detail Drawer (`VeilDrawer` variant)
  - Swimlane Card Drill-down Modal (`VeilModal` variant)
  - Onboarding v2 Gate Checklist Expander
  - Onboarding v2 Evidence/Signature Sub-tabs
  - Onboarding v2 Override Request Modal
  - Admin User Permission Override Matrix
  - Calendar Agenda list view
  - Staffing conflict resolver drawer
  - PDF previewer toolbar
* **whether previous “51 safe routes” claim is still valid:** NO. Manual subview inspection revealed that 14 routes that were marked "safe" because of a top-level PNG are actually visual placeholders lacking critical child pages, tabs, checklists, and forms.
* **recommended next phase:**
  - Stop seeding plans.
  - Conduct an interactive design session to create and finalize the missing subviews (specifically the Workflow Drawer, Swimlane Card Modal, Gate Checklist Expander, Override Modal, and Permission Matrix) to ensure complete alignment before backend wiring.

---

## 3. Module-by-Module Manual Reconciliation

### MODULE: Journey / Onboarding V1
* **ROUTES:** `/journey`, `/journey/v1-journey`, `/journey/module/:moduleId`, `/journey/appendix-f`, `/journey/supervisor`, `/journey/admin`, `/journey/guide`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - Learner info summary card, GAO metrics grid.
  - Phase path rail showing 7 gates (Pre-Day-1 → Drills) with progress bars.
  - Module cards list showing step details, method, policy refs, and supervisor signature alerts.
  - Supervisor readiness panel showing preceptor checklists (GAO exam, supervised visits).
  - Legacy topic mapping rows showing legacy-to-V6 conversions.
  - Module player page with paused scenario block, preceptor rating ChecklistTable, and attestation options.
  - Appendix F document sections sidebar, 15-item screening table, and HR Director signature card.
  - User guide Table of Contents sidebar and article segments.
* **DESIGNED REFERENCE EXISTS:** Yes (`28-journey-overview.png`, `29-journey-v1.png`, `34-module-player.png`, `07-appendix-f.png`, `49-supervisor.png`, `27-journey-admin.png`, `52-user-guide.png`)
* **CURRENT IMPLEMENTATION EXISTS:** Yes (screens are implemented in `src/v6/screens/pageviews/` and `src/v6/screens/RepresentativeScreens.tsx`)
* **MISSING DESIGN:**
  - **Supervised visit logging drawer**: Visual form to input visit dates, preceptor initials, and checkoff metrics.
  - **Employee selector**: Visual mechanism to switch between active learners in the supervisor panel.
  - **Signature draw canvas**: Mobile overlay signature draw pad.
  - **Guide & Appendix F active navigation states**: Sub-tabs or TOC active button states for scrolling/switching article segments.
  - **Module player failure and retry states**: Layout for unsuccessful exam attempts.
  - **Syllabus / Course path creator**: Form templates to append courses in Onboarding catalog admin.
* **MISSING IMPLEMENTATION:**
  - Roster selector click handler (clicking a different learner in the roster should load their specific progress data).
  - "Log visit" button click handler and submission form overlay.
  - Scroll-to-anchor or category toggles inside the User Guide and Appendix F TOC lists (contents sidebar currently has inert buttons).
  - Exam failure retry dialog.
* **SAFE TO SEED NOW:** Yes (learner roster and checklist records).
* **WAIT BEFORE SEEDING:** `/journey/supervisor` (wait for visitor logging and learner picker design).
* **NEEDS GEMINI CANVAS DESIGN:** No (we recommend adding TOC active segment designs and visit logger layouts if these become functional priorities).
* **NOTES:** Static layouts are highly complete, but interactions are simulated.

---

### MODULE: Onboarding V2
* **ROUTES:** `/onboarding-v2/dashboard`, `/onboarding-v2/activate`, `/onboarding-v2/batches`, `/onboarding-v2/batches/:batchId`, `/onboarding-v2/audit`, `/onboarding-v2/governance`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - KPI tiles cluster, activation list queue, gate outcome badges.
  - Activate subject pre-reconciliation form.
  - Batches matrix grid, roster detail, audit timeline, overrides matrix.
* **DESIGNED REFERENCE EXISTS:** Yes (`40-onboarding-v2-dashboard.png`, `36-onboarding-v2-activate.png`, `39-onboarding-v2-batches.png`, `38-onboarding-v2-batch.png`, `37-onboarding-v2-audit.png`, `41-onboarding-v2-governance.png`)
* **CURRENT IMPLEMENTATION EXISTS:** Yes
* **MISSING DESIGN:**
  - **Gate checklists details expander**: Clicking gate tiles (e.g. SystemAccess) to reveal OIG/SAM/Offer-letter checkboxes.
  - **Evidence vs Signature subtabs**: In the batch detail view, toggling between "Evidence file upload/preview" and "eSign signature log".
* **MISSING IMPLEMENTATION:**
  - Gate checklist details rendering, Evidence/Signature sub-tab toggles.
* **SAFE TO SEED NOW:** Yes (batches, overrides).
* **WAIT BEFORE SEEDING:** `/onboarding-v2/batches/:batchId` (must wait until gate expanders and tabs are designed).
* **NEEDS GEMINI CANVAS DESIGN:** Yes (Gate checklist expander, Evidence/Signature subtabs).
* **NOTES:** Implemented detail pages currently show generic summary boxes instead of the specific subtabs and expanders.

---

### MODULE: Workflows
* **ROUTES:** `/workflows`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - Top Metrics grid, Workflows DataTable, right rail SurfaceCards (QAPI, Incident, Governance).
* **DESIGNED REFERENCE EXISTS:** Yes (`54-workflows.png`)
* **CURRENT IMPLEMENTATION EXISTS:** Yes (implemented in `WorkflowsScreen.tsx`)
* **MISSING DESIGN:**
  - **Workflow domain filtering tabs**: Grouping workflows by Clinical, HR, Governance.
  - **Workflow search & filter inputs**.
  - **Workflow Detail Drawer/Panel**: Clicking a row opens `VeilDrawer` with forms, policies, evidence hash, history.
* **MISSING IMPLEMENTATION:**
  - Filter tabs logic, search filters, Detail drawer opening.
* **SAFE TO SEED NOW:** Yes.
* **WAIT BEFORE SEEDING:** `/workflows` (wait for detail drawer design).
* **NEEDS GEMINI CANVAS DESIGN:** Yes (Workflow detail drawer, domain tabs).
* **NOTES:** The table rows are static; clicking a row does nothing.

---

### MODULE: Workflow Swimlane
* **ROUTES:** `/workflows/:workflowId/swimlane`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - Month back button, metrics grid, phase progress board, 4 vertical columns with task cards.
* **DESIGNED REFERENCE EXISTS:** Yes (`53-workflow-swimlane.png`)
* **CURRENT IMPLEMENTATION EXISTS:** Yes (implemented in `RepresentativeScreens.tsx`)
* **MISSING DESIGN:**
  - Drag-and-drop indicator states, drag outlines, and empty lane placeholders.
  - **Card Drill-down/Action details modal**: Clicking a card to view checklist tasks, evidence file uploaders, and signature boxes.
* **MISSING IMPLEMENTATION:**
  - Card drag-and-drop mechanics, Card click modal handler.
* **SAFE TO SEED NOW:** Yes (task card lists).
* **WAIT BEFORE SEEDING:** `/workflows/:workflowId/swimlane` (wait for card drill-down design).
* **NEEDS GEMINI CANVAS DESIGN:** Yes (Card drill-down modal/drawer).
* **NOTES:** Renders the 4 columns perfectly, but cards cannot be clicked or dragged.

---

### MODULE: CES Board / Events / Calendar
* **ROUTES:** `/ces/board`, `/ces/events`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - Kanban board (6 lanes: Upcoming → Completed), task cards, metrics.
* **DESIGNED REFERENCE EXISTS:** Yes (`ces-board`: `11-ces-board.png`; `events-board` has pending wireframe `55-events-board.png`)
* **CURRENT IMPLEMENTATION EXISTS:** Yes
* **MISSING DESIGN:**
  - Drag-and-drop indicator states.
  - Critical event edit overlay.
* **MISSING IMPLEMENTATION:**
  - Card drag-and-drop mechanics.
* **SAFE TO SEED NOW:** Yes (for `/ces/board`).
* **WAIT BEFORE SEEDING:** `/ces/events` (wait for wireframe 55 approval).
* **NEEDS GEMINI CANVAS DESIGN:** Yes (approving wireframe 55).
* **NOTES:** The `/ces/events` route uses the generic Board template.

---

### MODULE: Calendar / Staffing Calendar
* **ROUTES:** `/calendar`, `/staffing-calendar`, `/ces/calendar`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - Month grid calendar grid, legend, upcoming events rail, event hover detail cards.
* **DESIGNED REFERENCE EXISTS:** Yes (`30-master-calendar.png`, `48-staffing-calendar.png`, `12-ces-calendar.png`)
* **CURRENT IMPLEMENTATION EXISTS:** Yes
* **MISSING DESIGN:**
  - **Weekly and Daily agenda list views**: Design templates only show the Month grid.
  - **Inline flowchart swimlane**: Calendar event clicks in the prototype open an inline flowchart step grid + vertical stacked cards below it. This is a calendar-specific swimlane separate from the board swimlane.
  - Shift conflict resolver drawer (staffing calendar).
* **MISSING IMPLEMENTATION:**
  - Day/Week segment controls.
  - Inline flowchart swimlane view (clicks currently redirect to the board swimlane `/workflows/:id/swimlane`).
* **SAFE TO SEED NOW:** No (seeding blocked by user directive for all calendar views).
* **WAIT BEFORE SEEDING:** All calendars.
* **NEEDS GEMINI CANVAS DESIGN:** Yes (Weekly/Daily agenda, inline flowchart swimlane, conflict resolver).
* **NOTES:** In the React app, calendar event clicks currently bypass the inline flowchart drill-down and redirect straight to the workflow board route.

---

### MODULE: Evidence / Artifact Viewer
* **ROUTES:** `/audit`, `/evidence`, `/artifacts/:artifactId`, `/viewer/:referenceId`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - Audit roster checklist, virtualized evidence table, download buttons, metadata cards, document details.
* **DESIGNED REFERENCE EXISTS:** Yes (`09-audit-mode.png`, `19-evidence-center.png`, `08-artifact-viewer.png`, `23-generic-reference.png`)
* **CURRENT IMPLEMENTATION EXISTS:** Yes
* **MISSING DESIGN:**
  - **Document previewer toolbar**: PDF/Image controls for zoom, rotation, hash copy, download, and verification logs.
* **MISSING IMPLEMENTATION:**
  - Viewer toolbar, virtualized scroll list.
* **SAFE TO SEED NOW:** Yes.
* **WAIT BEFORE SEEDING:** None.
* **NEEDS GEMINI CANVAS DESIGN:** Yes (Previewer toolbar).
* **NOTES:** Evidence Center is wired to render the static mock lists.

---

### MODULE: Forms / Form Viewer / eCign
* **ROUTES:** `/forms`, `/forms/:formId`, `/forms/:formId/esign`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - Forms list DataTable, 7 section layouts filled read-only, 6-step eSign wizard, signature check boxes, certificate results.
* **DESIGNED REFERENCE EXISTS:** Yes (`21-forms-library.png`, `20-form-viewer.png`, `18-ecign-workspace.png`)
* **CURRENT IMPLEMENTATION EXISTS:** Yes
* **MISSING DESIGN:**
  - **Mobile drawing signing canvas**: Overlay panel for hand-drawn signatures on mobile/touch screens.
  - SMS verification passcode wizard.
* **MISSING IMPLEMENTATION:**
  - Drawing canvas interaction, SMS passcode fields.
* **SAFE TO SEED NOW:** Yes.
* **WAIT BEFORE SEEDING:** None.
* **NEEDS GEMINI CANVAS DESIGN:** Yes (Signing canvas overlay).
* **NOTES:** eSign steps are linear and lock advance until prior inputs are filled.

---

### MODULE: Policy Library / Policy Detail
* **ROUTES:** `/library`, `/library/:policyId`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - Policy list DataTable (virtualized), right stewardship cards, policy detail print text pane, linked forms/standards.
* **DESIGNED REFERENCE EXISTS:** Yes (`45-policy-library.png`, `44-policy-detail.png`)
* **CURRENT IMPLEMENTATION EXISTS:** Yes
* **MISSING DESIGN:**
  - Tag editor modal, policy revision diff log.
* **MISSING IMPLEMENTATION:**
  - Category tags filters, print layout configuration.
* **SAFE TO SEED NOW:** Yes.
* **WAIT BEFORE SEEDING:** None.
* **NEEDS GEMINI CANVAS DESIGN:** No.
* **NOTES:** Standard detail and matrix layouts are complete.

---

### MODULE: Policy Lifecycle
* **ROUTES:** `/policy-lifecycle`, `/policy-lifecycle/:policyId`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - Stage horizontal board, stage detail checks.
* **DESIGNED REFERENCE EXISTS:** Yes (`policy-lifecycle`: `46-policy-lifecycle.png`; `policy-lifecycle-detail` has pending wireframe `56-policy-lifecycle-detail.png`)
* **CURRENT IMPLEMENTATION EXISTS:** Yes
* **MISSING DESIGN:**
  - Stage revision diff comparison viewer.
  - Rejection comments dialog.
* **MISSING IMPLEMENTATION:**
  - Stage transition actions, diff visual highlights.
* **SAFE TO SEED NOW:** Yes (for `/policy-lifecycle`).
* **WAIT BEFORE SEEDING:** `/policy-lifecycle/:policyId` (wait for wireframe 56 approval).
* **NEEDS GEMINI CANVAS DESIGN:** Yes (approving wireframe 56).
* **NOTES:** Uses the placeholder screens until wireframe 56 is approved.

---

### MODULE: Admin / RBAC
* **ROUTES:** `/admin/user-groups`, `/admin/roles`, `/admin/permissions`, `/admin/users`, `/surveyor/policy/:policyId`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - User groups matrix, roles table, permissions catalog list, user profiles table, surveyor deficiency checklist.
* **DESIGNED REFERENCE EXISTS:** Yes (`03-admin-groups.png`, `05-admin-roles.png`, `04-admin-permissions.png`, `06-admin-users.png`, `50-surveyor-viewer.png`)
* **CURRENT IMPLEMENTATION EXISTS:** Yes
* **MISSING DESIGN:**
  - **Granular permission overrides editing matrix**: Visual matrix of checkboxes showing permission scopes.
  - Role creation modal.
* **MISSING IMPLEMENTATION:**
  - Checkboxes click logic, edit role submit form.
* **SAFE TO SEED NOW:** Yes.
* **WAIT BEFORE SEEDING:** None.
* **NEEDS GEMINI CANVAS DESIGN:** Yes (Permission matrix overrides grid).
* **NOTES:** Renders clean grid tables; rows are read-only.

---

### MODULE: Help / System Docs / Governance
* **ROUTES:** `/system-documentation/:sectionId`, `/help/*`, `/governance`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - Guide TOC index, article text content, SVG governance metrics charts.
* **DESIGNED REFERENCE EXISTS:** Yes (`51-system-docs.png`, `25-help-center.png`, `24-governance.png`)
* **CURRENT IMPLEMENTATION EXISTS:** Yes
* **MISSING DESIGN:**
  - Article search results layout.
* **MISSING IMPLEMENTATION:**
  - Live article lookup search box.
* **SAFE TO SEED NOW:** Yes.
* **WAIT BEFORE SEEDING:** None.
* **NEEDS GEMINI CANVAS DESIGN:** No.
* **NOTES:** Render layouts are complete.

---

### MODULE: Brad / iAdministrator
* **ROUTES:** `/iadministrator`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - Alternating chat thread bubbles, suggested assistant chips, citation cards, mission pills.
* **DESIGNED REFERENCE EXISTS:** Yes (`10-brad.png`)
* **CURRENT IMPLEMENTATION EXISTS:** Yes
* **MISSING DESIGN:**
  - Exporter layout draft panel.
* **MISSING IMPLEMENTATION:**
  - Dynamic streaming chat responses.
* **SAFE TO SEED NOW:** Yes.
* **WAIT BEFORE SEEDING:** None.
* **NEEDS GEMINI CANVAS DESIGN:** No.
* **NOTES:** Chat threads are static.

---

### MODULE: Login
* **ROUTES:** `/login`
* **VISIBLE TABS/SUBVIEWS/STATES FOUND:**
  - Auth credentials inputs, submit buttons.
* **DESIGNED REFERENCE EXISTS:** none (system inferred)
* **CURRENT IMPLEMENTATION EXISTS:** Yes
* **MISSING DESIGN:**
  - MFA passcode challenge popup, change expired password form.
* **MISSING IMPLEMENTATION:**
  - Redirect hooks, login errors alert banners.
* **SAFE TO SEED NOW:** Yes.
* **WAIT BEFORE SEEDING:** None.
* **NEEDS GEMINI CANVAS DESIGN:** No.
* **NOTES:** Rendered layout outside the app shell is complete.
