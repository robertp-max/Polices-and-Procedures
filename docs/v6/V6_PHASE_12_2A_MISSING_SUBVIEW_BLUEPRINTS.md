# V6 Phase 12.2.a: Missing Subview Design Blueprints Spec

This document defines the manual design specifications, layouts, token usage, interactions, and implementation boundaries for all 17 missing subviews and states identified during the V6 reconciliation audit. 

All design specifications conform to the V6 design system tokens, typography rules (Roboto 300/500 only), and layout patterns.

---

## Part 1: Design System Foundations & Token Mapping

Before detailing the subviews, all components must adhere to the following token mapping constraints:
- **Typography Rules**: Self-hosted Roboto ONLY. 
  - Weight **300** (`--weight-body`) is used for all descriptive copy, table cell data, KPI values, field labels, placeholders, input fields, checklists, and body content.
  - Weight **500** (`--weight-title`) is restricted to page titles (`--text-display`), section headers (`--text-h2`), main navigation sidebar links, and active text inside `ToneBadge` status pills.
  - No weight 400, 700, or semibold/bold styles are allowed.
- **Color Palettes (V6 Tokens)**:
  - Base Primary: `--brand-teal` (`#00797D`), `--brand-teal-deep` (`#004142`), `--surface-hover-teal` (`#F7FEFF`)
  - Accent Color: `--brand-orange` (`#C74601`)
  - Semantic Statuses:
    - **Teal (Ready/Complete)**: bg `--tone-teal-bg` (`#F7FEFF`), border `--tone-teal-border` (`#C4F4F5`), text `--tone-teal-text` (`#00797D`)
    - **Orange (Attention/Blocked)**: bg `--tone-orange-bg` (`#FFFAF7`), border `--tone-orange-border` (`#FFD5BF`), text `--tone-orange-text` (`#C74601`)
    - **Green (Pass/Certified)**: bg `--tone-green-bg` (`#E6F4ED`), border `--tone-green-border` (`#A3D9B8`), text `--tone-green-text` (`#006B3A`)
    - **Amber (Awaiting/Pending)**: bg `--tone-amber-bg` (`#FFF8E6`), border `--tone-amber-border` (`#F0D9A3`), text `--tone-amber-text` (`#8A5C00`)
    - **Slate (Upcoming/Default)**: bg `--tone-slate-bg` (`#FAF8F8`), border `--tone-slate-border` (`#F3F0EF`), text `--tone-slate-text` (`#524D4B`)
  - eCIgn Overlay Custom Tone: `--ecign-navy` (`#1A3778`), `--ecign-orange` (`#F04B22`)
- **Spacing and Hairlines**:
  - Horizontal grid dividers and borders must utilize `--border-hairline` (`rgba(0,65,66,0.10)`) or `--border-card` (`#E5E4E3`).
  - Drawer and modal backdrops must utilize `backdrop-blur-md` with `bg-black/40` or standard `VeilDrawer`/`VeilModal` shading rules.

---

## Part 2: Missing Subview Spec Sheets

### Section A: Journey / Onboarding V1

#### 1. Supervised Visit Logging Drawer
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: YES (`VeilDrawer` variant)
* **Trigger**: Clicking the "Log Visit" CTA or supervisor validation actions inside the exception/cohort dashboard at `/journey/supervisor`.
* **Component Purpose**: Allows clinical supervisors and preceptors to log supervised checkoff visits for active learners, recording competency outcomes, preceptor initials, and visit context.
* **Layout & Structure**:
  - Slide-out right panel (`w-full max-w-[420px]`).
  - Header: uppercase tracker tag `Journey supervisor / visit logs` (300, 10px), Title `Log Supervised Checkoff` (500, 20px), Close icon button (Lucide `X`).
  - Body:
    - Learner Summary Card: displaying learner photo avatar, name, and role track (e.g. RN Residency).
    - Grid Inputs (300, 14px):
      - Visit Date & Time selector.
      - Preceptor selection dropdown.
      - Patient/Visit context text area (simulated case reference or demographics placeholder).
    - Competency checklist: Table grid of 5 primary checklist rows with pass/fail toggle indicators (300, 12px).
    - Outcome segment: Segmented tabs for outcome status (`Pass` / `Requires Remediation` / `Incomplete`).
    - Follow-up Area: Action items textarea for secondary drills or remediation requirements.
    - Signature Attestation Area: Section showing preceptor name, attestation text checkbox, and a CTA linking to the Hand Signature Canvas modal.
  - Footer Action Row:
    - Primary CTA: `Log & Validate Visit` (Orange button, 300, disabled until checklist is filled and attested).
    - Secondary CTA: `Cancel` (Teal border, 300).
* **Responsive Behavior**: Stacked vertical scroll layout. Shakes horizontally if validations fail. On mobile screen size, slides up from bottom as sheet (`w-full max-h-[85vh]`).

---

#### 2. Learner / Employee Picker
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: YES (`EmployeePicker` popover/panel)
* **Trigger**: Clicking the active learner's context card or dropdown switcher in `/journey/supervisor` or `/journey`.
* **Component Purpose**: Enables supervisors, preceptors, or administrators to switch contexts to view progress, checklists, or syllabus pathways for different learners.
* **Layout & Structure**:
  - Right rail panel overlay or trigger popover dropdown box.
  - Search bar input at top: (Lucide `Search` icon, placeholder `Search by name or email...`, 300, 13px).
  - Filter segments: Filter chips by track (`All`, `GAO`, `Clinical RN`, `LPN`) (300, 11px).
  - Scrollable learner list:
    - Each learner row includes: name (500, 13px), role track designation (300, 11px), active status tag, and small circular progress bar indicator showing total syllabus milestones completed (e.g., `8/11 Steps`).
    - Rows with active alerts or exception events (e.g., failed checkoff) display an attention dot in orange.
  - Context footer: Summary of the currently selected learner, showing their supervisor and start date.
* **Responsive Behavior**: Popover aligns to the trigger button on desktop, transitions to a full height sidebar list panel on mobile.

---

#### 3. Journey Signature Canvas
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: YES (`SignatureCanvasOverlay`)
* **Trigger**: Clicking "Sign & Validate" or "Preceptor Checkoff" in supervised visit logger drawer, Appendix F signoff, or module player evaluations.
* **Component Purpose**: Captures manual touch/mouse drawn signature checkoffs to record official preceptor validations and learner attestations.
* **Layout & Structure**:
  - Modal overlay container (`w-full max-w-[480px]`), backdrop blur, locked focus.
  - Top Bar: Label `Verify Identity & Sign` (500, 16px).
  - Metadata block: Reads signer name, role, and current timestamp.
  - Drawing Area: Rounded border rectangular canvas (`h-[180px] bg-slate-bg border-hairline`) with light gray instruction label watermark `Draw signature here using finger, stylus, or mouse`.
  - Signature controls:
    - Button `Clear Canvas` (300, 12px, clears drawing strokes).
    - Button `Reset` (300, 12px).
  - Compliance check: Checkbox with legal attestation ("I declare under penalty of perjury that this signature matches my credential identity and validates the logged competency items...").
  - Action footer:
    - Primary CTA: `Confirm Signature` (Orange button, 300, disabled until canvas contains strokes and checkbox is selected).
    - Secondary CTA: `Close` (Teal border, 300).
* **Responsive Behavior**: Touch events disabled for page scroll when touch-drawing is active. Canvas adapts to container width dynamically.

---

#### 4. Guide / Appendix F TOC Active Navigation State
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: YES (`TableOfContentsList`)
* **Trigger**: Clicking items inside the sidebar table of contents, or scrolling content sections in `/journey/guide` or `/journey/appendix-f`.
* **Component Purpose**: Displays progress states, read status, and links document sections to scroll targets within long-form manuals or compliance guidelines.
* **Layout & Structure**:
  - Vertical list of document sections rendered inside the left rail sidebar panel.
  - List items contain:
    - Status indicator icon (Lucide `CheckCircle` in teal for read/completed, Lucide `Circle` in slate for upcoming, Lucide `AlertCircle` in orange for required).
    - Title text (300, 13px, active item uses 500, 13px with left indicator bar in `--brand-teal`).
  - Scroll Spy mechanics: Highlight state shifts automatically as the user scrolls content sections.
  - Compact mobile variant: TOC sidebar collapses into a top sticky header bar showing `Section X of Y (Select to view list)` which triggers a slide-up menu overlay.
* **Responsive Behavior**: Sticky scroll lock on desktop; collapsible dropdown header on mobile viewports.

---

#### 5. Module Player Failure / Retry State
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: NO
* **Trigger**: Failed attempts at interactive scenario exams, checkpoints, or quizzes inside `/journey/module/:moduleId`.
* **Component Purpose**: Displays a supportive, motivational, yet clear corrective screen showing failed sections, remediation paths, and option to request supervisor override or retry.
* **Layout & Structure**:
  - Inline block card replacing standard quiz questions.
  - Tone header: `Score: 68% - Remediation Review Required` in orange status banner (500, 18px).
  - Main Body:
    - Descriptive paragraph explaining that the threshold (80%) was not reached, written in a supportive tone (300, 14px).
    - List of missed competency categories (e.g. `Infection Control (2 questions missed)`, `Documentation SLA`).
    - Recommended Reading Cards: 2-3 links to specific policy library references (e.g. `ADM-HR-004`) in standard `SurfaceCard` style with click-to-open links.
    - Notification box: A banner alerting that "Supervisor has been notified of the attempt. An override or log of supervised visit may clear this milestone."
  - Action Row:
    - Primary CTA: `Retry Quiz` (Teal background button, 300, active only if minimum timeout elapsed).
    - Secondary CTA: `Request Preceptor Review` (Orange border button, 300).
* **Responsive Behavior**: Cards scale from two-column grid on desktop to single stacked row on mobile viewports.

---

#### 6. Syllabus / Course Path Builder
* **Classification**: `NEEDS_HUMAN_REVIEW`
* **Shared Component Candidate**: NO
* **Trigger**: Selecting Course/Syllabus builder or edit options inside `/journey/admin`.
* **Component Purpose**: Administrative builder interface for creating and structuring onboarding course pathways, ordering module requirements, and linking policies.
* **Layout & Structure**:
  - Main view: two-column layout.
  - Left column (Course details): Course Title inputs, role track selectors, description field, and target timeline indicator (e.g., `SLA: 30 days`).
  - Right column (Module sequence): Drag-and-reorder list of modules (using Lucide `GripVertical` icon).
    - Card items inside list show: module code, title, and a toggle for `Required / Optional`.
    - Dropdowns to search and link specific policy IDs (`src/policy/` references) or eSign form IDs.
    - Quick add/remove controls (`+ Add Module` and `- Remove`).
  - Top bar actions:
    - Primary CTA: `Publish Syllabus` (Orange button, 300).
    - Secondary CTA: `Save Draft` (Teal border, 300).
* **Responsive Behavior**: Sidebar wraps below details on smaller tablets; drag-and-drop handles remain touch-target sized.

---

### Section B: Workflows

#### 7. Workflow Detail Drawer
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: YES (`VeilDrawer` variant)
* **Trigger**: Selecting a workflow row item inside the workflows matrix table at `/workflows`.
* **Component Purpose**: Displays execution parameters, linked regulatory items, hashes, and audit logs for the selected compliance workflow.
* **Layout & Structure**:
  - Slide-out right panel (`w-full max-w-[420px] bg-surface-base shadow-lift`).
  - Header:
    - Category label: `Workflows / QAPI execution` (300, 10px uppercase).
    - Title: Workflow Title (e.g. `QAPI Quarterly Board Review`) (500, 20px).
    - Badge: Status indicator (`Active` / `Under Review` / `Overdue`) using `ToneBadge` styling.
  - Scrollable Body (300, 14px):
    - **Overview**: Purpose description text.
    - **Stewardship details**: Owner group designation (e.g., Governance Committee) with actor profile icon.
    - **Linked Policies (`SurfaceCard` style)**: List of policies (`EN-CM-001`) with green checkmarks indicating alignment.
    - **Evidence Checklist**: Roadmap sequence representing required checklist logs, form links, and signature templates.
    - **Execution History Grid**: Compact data table showing past execution IDs, lock timestamps, and SHA-256 certificate hashes.
  - Footer Action buttons:
    - Primary CTA: `Open Swimlane Board` (Orange background button, 300, redirects to `/workflows/:workflowId/swimlane`).
    - Secondary CTA: `Close Drawer` (Teal border button, 300).
* **Responsive Behavior**: Slides out smoothly using standard `--motion-base` slide animation. Fits mobile screen with vertical scroll.

---

#### 8. Workflow Swimlane Card Drill-down Modal
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: YES (`VeilModal` variant)
* **Trigger**: Clicking any task or compliance card in `/workflows/:workflowId/swimlane`.
* **Component Purpose**: Displays task instructions, required evidence upload fields, checkoff boxes, and signature links for a single swimlane milestone.
* **Layout & Structure**:
  - Centered popup modal overlay (`w-full max-w-[560px]`), focus-trapped, backdrop blur.
  - Header: label `Task Execution Details` (300, 10px uppercase), title of the card (500, 18px), subtitle (300, 12px, showing due date and assignee name).
  - Body Content:
    - Instruction guide text explaining the standard operating procedure for this step.
    - Compliance checklist (`ChecklistTable` style): list of 3-4 checkboxes that must be cleared (300, 13px).
    - Evidence Upload Dropzone: Dotted rectangle border box with upload icon (Lucide `UploadCloud`), showing file name or placeholder if empty.
    - Attestation checkbox: "I certify that the evidence uploaded is complete and accurate..."
  - Action footer:
    - Primary CTA: `Validate & Complete Step` (Orange button, 300, disabled until checklist, file, and attestation are satisfied).
    - Secondary CTA: `Close Modal` (Teal border, 300).
* **Responsive Behavior**: Fits screens down to 320px width. Scrollable modal body if text exceeds screen height.

---

### Section C: Onboarding V2

#### 9. Gate Checklist Expander
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: YES (`GateChecklistExpander`)
* **Trigger**: Clicking a status gate tile (e.g. `OIG Clearance`, `System Access`) in batch details grid at `/onboarding-v2/batches/:batchId`.
* **Component Purpose**: Displays detailed pass/fail criteria checklist and evidence details for a specific batch onboarding gate.
* **Layout & Structure**:
  - Accordion folder container expanding directly below the clicked gate tile in the batch progress grid.
  - Header: Gate Name, Status label, and datetime of last automated check (300, 12px).
  - Checklist rows table (`ChecklistTable` style):
    - Row elements show criteria description, status badge (`PASS` in green, `PENDING` in amber, `FAILED` or `MISSING` in orange), and click-to-link action text.
    - Example rows:
      - OIG Sanctions List Check: `PASS`
      - SAM Exclusion Sweep: `PASS`
      - Active Licensure Verification: `PENDING`
      - Signed Offer Letter: `MISSING` (Links directly to `/forms/:offerLetterId`).
  - Action row: Button to force rerun automated checks (Lucide `RotateCw` icon, 300, 12px).
* **Responsive Behavior**: Collapses smoothly. Expands to full screen width on mobile, pushing lower content card stacks down.

---

#### 10. Evidence / Signature Sub-tabs
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: NO
* **Trigger**: Selecting an onboarding item or requirement row inside the onboarding batch view at `/onboarding-v2/batches/:batchId`.
* **Component Purpose**: Toggles detail views between evidence files (PDFs, images) and signature logs (attestations, sequences, eCIgn hashes) in the details panel.
* **Layout & Structure**:
  - Segmented horizontal tab control: `Evidence File` and `Signature Log` (500 for active tab text, 300 for inactive).
  - Panel contents:
    - **Tab 1: Evidence File**:
      - PDF file detail box with preview icon, file size, upload timestamp, and SHA-256 hash.
      - Inline document preview frame container.
      - Action CTAs: `Verify Document Hash` (Teal border, 300) and `Download File` (Lucide `Download`).
    - **Tab 2: Signature Log**:
      - Signer sequence progress tracker: vertical timeline showing step signers (Learner, Preceptor, Director).
      - Sign status box: timestamp, IP address, and unique eCIgn audit token.
      - Legal attestation text block.
* **Responsive Behavior**: Compact spacing; fits right-side detail panels on desktop and stacked content flow on mobile.

---

#### 11. Override Request Modal
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: YES (`VeilModal` variant)
* **Trigger**: Clicking "Request Override" inside `/onboarding-v2/governance` or batch detail screen.
* **Component Purpose**: Allows administrators to override blocked gates for exceptions (e.g. system downtime or delay), requiring dual approvals and audit reasons.
* **Layout & Structure**:
  - Centered overlay modal (`w-full max-w-[500px]`), backdrop blur, locked focus.
  - Header: Title `Request Compliance Override` (500, 18px) with orange attention marker border.
  - Main Body (300, 14px):
    - Target Header: Reads learner name and the blocked gate ID.
    - Override Reason Dropdown: selects options (`Credential Delay`, `Temporary Grace Period`, `System Outage`, `Governance Exception`).
    - Expiration Date Selector: defines duration (max 30 days).
    - Approver dropdowns: dual selector inputs to specify the two authorizing executives.
    - Security banner: Warning text in amber background alerting that "This override is logged in the permanent agency audit trail and will be visible during state surveys."
    - Attestation box: Checkbox validating standard policy override guidelines.
  - Footer actions:
    - Primary CTA: `Issue Override` (Orange button, 300, disabled until reasons are selected and attested).
    - Secondary CTA: `Cancel` (Teal border, 300).
* **Responsive Behavior**: Vertically centered on large viewports, shifts to bottom drawer overlay on mobile.

---

### Section D: Admin / RBAC

#### 12. Admin User Permission Override Matrix
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: YES (`PermissionMatrix`)
* **Trigger**: Clicking "Edit Scopes" or "Override Permissions" for a user inside `/admin/users`.
* **Component Purpose**: Allows granular overrides of permissions per user, showcasing inheritance from roles and indicating overrides clearly for security reviews.
* **Layout & Structure**:
  - Context header: Displays user name, email, and active role (e.g. Clinical Director).
  - Scope Table Grid:
    - Rows are divided by permission groups: `Policy Management`, `Evidence Logs`, `eCIgn Forms`, `Supervisor Actions`.
    - Row items show: Scope Name, default inheritance indicator (e.g. `Inherited (Granted)`), and three checkboxes: `Default (Role)`, `Force Grant`, `Force Revoke`.
    - Overridden rows display a highlighted light amber background to flag overrides clearly.
  - Toolbar buttons:
    - Primary CTA: `Save Matrix Overrides` (Teal background, 300).
    - Secondary CTA: `Restore Role Defaults` (Teal border, 300).
* **Responsive Behavior**: Table shifts to card view on mobile screens, displaying scopes with status pills and option switchers.

---

### Section E: Calendar / Staffing / CES

#### 13. Calendar Weekly / Daily Agenda View
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: YES (`AgendaListView`)
* **Trigger**: Month / Week / Day segmented controls in `/calendar` or `/staffing-calendar`.
* **Component Purpose**: Provides list-based agenda schedules for operations, staffing shifts, and calendar events.
* **Layout & Structure**:
  - Replaces Month grid view with vertical scrollable timeline list.
  - Layout Grid: left column timeline rail (e.g. `08:00 AM`, `09:30 AM`), right column event cards list.
  - Event Cards (`SurfaceCard` style):
    - Displays: Event ID, title, shift type badge (e.g. RN Visit, GAO sweep), assignee avatar, and progress bar showing checklist item clearance.
    - Attention status indicator (e.g. orange dot for risk of SLA breach).
  - Quick action menu: ellipsis icon button to trigger quick assignment overrides or status logs.
* **Responsive Behavior**: Mobile layout scales font size down and nests the timeline rail inside the card headers to save space.

---

#### 14. Staffing Conflict Resolver Drawer
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: YES (`VeilDrawer` variant)
* **Trigger**: Selecting a staffing conflict event card or gap alert inside `/staffing-calendar`.
* **Component Purpose**: Allows operational dispatchers to quickly assign clinicians to open slots, showing candidates ranked by qualifications and distance.
* **Layout & Structure**:
  - Right slide-out panel drawer (`w-full max-w-[400px] bg-surface-base shadow-lift`).
  - Header: Title `Resolve Staffing Conflict` (500, 20px), subtitle displaying patient visit context, required discipline (e.g. PT), and shift timings.
  - Body Content:
    - Summary of conflict (e.g., clinician called out, shift overlaps).
    - Recommended Clinicians List:
      - Clinician cards showing profile avatar, name, and qualification match score (e.g. `96% Match - RN nearby`).
      - Distance info (e.g. `3.4 miles`) and current daily caseload indicator (e.g. `2/5 Visits logged`).
      - Mini CTA: `Assign & Dispatch` (Orange button, 300) next to clinician details.
    - Escalation Fallback Button: `Escalate to Director` (Teal border button, 300).
  - Footer actions: `Close Drawer` (Teal border, 300).
* **Responsive Behavior**: Uses fast slide transitions, fits all mobile screens as full width drawer panel.

---

#### 15. CES Calendar Inline Flowchart Swimlane
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: NO
* **Trigger**: Clicking an event node in `/ces/calendar` (provides inline swimlane instead of full route redirection).
* **Component Purpose**: Displays step sequences, status, and linked evidence items for the selected compliance event directly below the calendar node.
* **Layout & Structure**:
  - Expands inline directly below the selected calendar week row.
  - Horizontal flowchart steps grid:
    - 4 horizontal step blocks: `Pre-Audit` -> `Submission` -> `Attestation` -> `Archived`.
    - Connected by chevron arrows. Each block shows: title, status indicator (completed check in teal, active outline in orange, pending in slate).
  - Vertical task cards area (positioned below steps grid):
    - Lists required tasks for the active flowchart step.
    - Each task card shows owner, due date, status pill, and action CTA `Open Task Details`.
  - Actions row:
    - Primary CTA: `Open Full Swimlane Board` (Teal text link, redirects to `/workflows/:workflowId/swimlane`).
    - Secondary CTA: `Collapse Details` (dismisses inline swimlane view).
* **Responsive Behavior**: Horizontal grid wraps to vertical stack on tablets and mobile screens.

---

### Section F: Evidence / Audit / Viewer

#### 16. PDF / Image Preview Toolbar
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: YES (`DocumentPreviewToolbar`)
* **Trigger**: Opening an evidence file, artifact PDF, or credential image inside `/audit`, `/evidence`, `/artifacts/:artifactId`, or `/viewer/:referenceId`.
* **Component Purpose**: Displays document control tools and verification status above the document viewer panel.
* **Layout & Structure**:
  - Sticky horizontal bar (`h-[44px] bg-surface-base border-hairline flex items-center justify-between px-4`).
  - Toolbar actions (Left side):
    - Zoom Controls: Lucide `ZoomIn` / `ZoomOut` icon buttons, zoom scale dropdown (300, 12px).
    - Rotation: Lucide `RotateCw` button.
  - SHA Verification indicator (Center):
    - Button `Verify Hash SHA-256`. Clicking verifies checksum against blockchain/database registry, displaying a green badge `SHA-256 Verified` with certificate token on success.
  - Download options (Right side):
    - Button: Lucide `Download` icon showing `Download Source PDF` (300, 12px).
* **Responsive Behavior**: Hides descriptive labels on mobile devices, displaying icon-only actions for zoom, download, and verification badge.

---

### Section G: Forms / eCIgn

#### 17. eCIgn Mobile Signature Drawing Overlay
* **Classification**: `READY_FOR_IMPLEMENTATION`
* **Shared Component Candidate**: YES (`SignatureCanvasOverlay`)
* **Trigger**: Signature wizard step inside the touch-focused eSign page `/forms/:formId/esign`.
* **Component Purpose**: Dedicated mobile drawing canvas for touch screen signature capture in forms.
* **Layout & Structure**:
  - Full screen layout overlay on mobile (modal dialog on desktop), utilizing eCIgn branding values (`bg-white` canvas, border colored in `--ecign-navy`).
  - Context Info: Reads signer name, professional credentials (e.g. RN, BSN), and current date (300, 12px).
  - Touch Canvas: Large rectangular box (`h-[240px] bg-slate-bg border-hairline` with signature guide baseline in `--ecign-navy` color).
  - Actions panel:
    - Button `Clear Canvas` (300, 12px).
    - Button `Restore Default Signature` (300, 12px).
  - Legal compliance: Attestation text block with checkbox.
  - Footer Action Row:
    - Primary CTA: `Confirm & Complete eSign` (Orange button, 300, disabled until canvas contains strokes and checkbox is selected).
    - Secondary CTA: `Close Signature Overlay` (Teal border, 300).
* **Responsive Behavior**: Optimized touch-events handle multi-touch interference and disable window bounce during drawing.

---

## Part 3: Phase 12.2.a Implementation Boundaries

The engineering team must adhere to the following design system boundaries during the implementation of these components:
1. **Design System Consistency**:
   - Zero hardcoded colors in React components. All styling classes must map to tailwind class setups that wrap CSS variables.
   - All text tags must obey the weight locks: 300 for normal copy, 500 for titles, headers, nav tags, and status text. No exceptions.
2. **Reuse Patterns**:
   - Use the base `VeilDrawer` component to build the logging drawer, detail drawer, and conflict resolver.
   - Use the base `VeilModal` component to build the swimlane detail modal, override request modal, and signature canvas.
3. **No Database seeding**:
   - Keep all mock data inside internal component arrays for view demonstrations. Do not write seed scripts or migrate records in database configurations yet.
