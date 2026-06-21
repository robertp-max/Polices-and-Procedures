# V6 Missing Layouts Visual Design Specification

This document defines the layout grids, typography, dimensions, color tokens, and animation parameters for the 9 missing pageviews/states identified in the deep visual audit. It establishes the design systems and blueprint controls for the engineering team before frontend wiring.

---

## Design System Core Constants (V6 Tokens)
* **Colors**:
  - Teal (Primary): `--brand-teal` (#008080 equivalent), `--brand-teal-deep` (#004142), `--brand-teal-bg` (#E6F2F2)
  - Orange (Attention/Alert): `--brand-orange` (#F04B22), `--brand-orange-bg` (#FFF2EF)
  - Amber (Awaiting): `--brand-amber` (#D97706), `--brand-amber-bg` (#FEF3C7)
  - Green (Pass/Ready): `--brand-green` (#10B981), `--brand-green-bg` (#ECFDF5)
  - Slate (Upcoming/Default): `--brand-slate` (#6B7280), `--brand-slate-bg` (#F3F4F6)
* **Typography**:
  - Roboto self-hosted (Weights: 300 `font-light` for body/info, 500 `font-medium` for headings/status pills).
  - Sizes: Title `text-display` (24px/1.5rem), Section `text-h2` (18px/1.125rem), Body `text-body` (14px/0.875rem), Caption `text-sm` (12px/0.75rem), Tags `text-tag` (10px/0.625rem).
* **Animations**:
  - Slide/Fade In (Drawers/Modals): `--motion-fast` (120ms) or `--motion-base` (200ms) utilizing `--ease-standard` (cubic-bezier(0.2, 0, 0, 1.0)).
  - Exit timing: `--motion-fast` (120ms) utilizing `--ease-exit` (cubic-bezier(0.4, 0, 1, 1)).
* **Elevation**:
  - Default: `shadow-rest` (soft drop shadow `0 2px 8px rgba(0,0,0,0.04)`)
  - Active/Hover: `shadow-lift` (translateY(-2px), `0 8px 16px rgba(0,0,0,0.08)`)

---

## 1. Workflow Detail Drawer (`VeilDrawer` Variant)

### Visual Reference Mockup
![Workflow Detail Drawer Mockup](file:///c:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/docs/v6/V6_Final/57-workflow-detail-drawer.png)

* **Trigger**: Clicking a row in the `/workflows` matrix table.
* **Layout**: Right-aligned overlay sheet, width `w-full max-w-[420px]` on desktop, bottom sheet on mobile.
* **Header**:
  - Breadcrumb: `Workflows Library / WF-ID` (Roboto 300, 10px uppercase tracking-widest).
  - Title: Workflow Title (Roboto 500, 18px text-h2).
  - Badge: Status indicator (`Active` / `Review Required`) in top-right.
* **Body Content**:
  - **Overview Section**: Paragraph summary of the execution path.
  - **Ownership details**: Owner group (e.g., Governance / QAPI Lead) with avatar.
  - **Linked Policies Card (`SurfaceCard` style)**: List of click-to-open policy IDs (`EN-CM-001`) with green checkmarks.
  - **Evidence Path Logs**: Sequential roadmap representing required forms and signoff steps (e.g. "Step 1: Minutes, Step 2: eCIgn Certificate").
  - **Execution History Grid**: Small timeline table showing recent locks, dates, and surveyor validation hash stamps.
* **Footer Actions**:
  - Primary CTA: `Open Swimlane` (Orange button, routes to swimlane URL).
  - Secondary CTA: `Close` (Teal border, dismisses drawer).

---

## 2. Swimlane Card Drill-down Modal (`VeilModal` Variant)
* **Trigger**: Clicking any card inside the `/workflows/:workflowId/swimlane` board.
* **Layout**: Centered overlay dialog (`w-full max-w-[560px]`), backdrop blur (`backdrop-blur-md bg-black/40`), focus trap.
* **Header**:
  - Tag: `Task Execution Details` (Teal text, 10px uppercase).
  - Title: Card Title (e.g., "Collect board minutes and roster").
  - Subtitle: Due Date + Owner Name.
* **Body Content**:
  - **Description**: Instructional copy on how to fulfill the task.
  - **Compliance Checklist (`ChecklistTable`)**: 3-5 checkboxes for step items (e.g., "Verify attendee quorum", "Confirm signature hash").
  - **Evidence Attachment Slot**: File upload dropzone with dotted border, showing standard file indicators or current attachments.
  - **Attestation block**: Checkbox with legal text ("I validate that the evidence attached meets the policy criteria...").
* **Footer Actions**:
  - Primary: `Sign & Validate` (Orange button, disabled until checklist/attestation is checked).
  - Secondary: `Cancel` (Dismisses modal).

---

## 3. Onboarding v2 Gate Checklist Expander

### Visual Reference Mockup
![Gate Checklist Expander Mockup](file:///c:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/docs/v6/V6_Final/58-gate-checklist-expander.png)

* **Trigger**: Clicking a gate tile (e.g., `SystemAccessClearance`) in `/onboarding-v2/batches/:batchId`.
* **Layout**: Inline expander accordion (collapsing down below the gate tiles row) or popup card (repositioned inside viewport).
* **Content Structure**:
  - **Gate Status Header**: Displays gate ID, passing score/metrics, and validation timestamp.
  - **Prerequisites Checklist**: Grid of items (OIG check, SAM check, offer letter, email config) showing a badge status per row:
    - OIG check: `PASS` (Green badge)
    - SAM check: `PASS` (Green badge)
    - Licensure check: `PENDING` (Amber badge)
    - Offer letter signed: `MISSING` (Orange badge)
  - **Action Link**: Clicking a row redirects directly to the specific form viewer or evidence attachment view.

---

## 4. Onboarding v2 Unit Evidence/Signature Sub-tabs
* **Trigger**: Selecting an onboarding requirement within the Batch detail view.
* **Layout**: Segmented control tabs (`Evidence File` vs `Signature Log`) within the right-side detail pane.
* **Sub-tab 1: Evidence File**:
  - File details: Uploaded file name, PDF/Image preview thumbnail box, SHA-256 hash.
  - Action buttons: `Download Source`, `Verify Hash`.
* **Sub-tab 2: Signature Log**:
  - Signer sequence tracker: Horizontal timeline showing signers (e.g., Learner, DON, HR Coordinator).
  - Sign status details: Date signed, attestation statements, and eCIgn verification token.

---

## 5. Onboarding v2 Override Request Modal
* **Trigger**: Clicking "Request Override" inside `/onboarding-v2/governance` or batch view.
* **Layout**: Centered modal overlay, strict weight-300 forms.
* **Form Inputs**:
  - **Target Subject / Gate**: Read-only display of who and what is blocked.
  - **Override Reason dropdown**: Select reasons (e.g., credential delay, system downtime, temporary grace period).
  - **Duration text field**: Expiration window (e.g., "Valid 30 days").
  - **Dual-signature fields**: Dropdowns to select the two required authorizing personnel.
* **attestation checkbox**: Legal statement regarding audit compliance guidelines.
* **Footer**:
  - Primary: `Issue Override` (Orange button).
  - Secondary: `Cancel`.

---

## 6. Admin User Permission Override Matrix
* **Trigger**: Clicking "Edit Scopes" or "Override Permissions" in `/admin/users` or roles page.
* **Layout**: Two-column responsive split: left column list of scopes, right column permissions checkbox matrix.
* **Matrix Layout**:
  - Grid table: Rows are permission scopes (e.g. `policy.write`, `evidence.upload`, `esign.sign`).
  - Columns represent groups or override flags (e.g., `Default`, `Granted Override`, `Revoked`).
  - Color markers: overrides highlighted in amber background to alert security audits.
* **Action Footer**:
  - Primary: `Save Permissions Matrix` (Teal button).
  - Secondary: `Restore Defaults`.

---

## 7. Calendar Weekly/Daily Agenda View
* **Trigger**: Selecting "Week" or "Day" segmented controls in calendar templates.
* **Layout**: Responsive flex column replacing Month grid.
* **Agenda Rows**:
  - Time/Hour block on the left (e.g., "09:00 AM").
  - Event Card in the middle:
    - Event label, owner, type badge.
    - Mini progress indicator bar.
    - Linked swimlane ID.
  - Right side: Quick-actions dropdown.
* **Aesthetics**: Glass background panels, clear vertical axis timeline line.

---

## 8. Staffing Calendar Conflict Resolver Drawer
* **Trigger**: Clicking a conflict gap event in `/staffing-calendar` upcoming rail.
* **Layout**: Right-aligned slide-out drawer (`w-[380px]`).
* **Content Structure**:
  - **Conflict details**: Overlapping patient visits or shift time gaps.
  - **Recommended Clinicians**: List of available clinicians matching role requirements. Each clinician card shows:
    - Match score (e.g., "95% match - RN near patient zip code").
    - Current caseload / distance.
  - **Action Button**: `Resolve & Assign` button next to each clinician.

---

## 9. PDF Previewer Toolbar
* **Trigger**: Opening an artifact file or evidence sheet in `/audit` or `/evidence` views.
* **Layout**: Sticky top panel above the document preview frame.
* **Toolbar Actions**:
  - **Scale**: `Zoom In` / `Zoom Out` buttons, percentage dropdown.
  - **Rotation**: `Rotate Clockwise` button.
  - **Hash Validation**: A button `Verify SHA-256` that checks the certificate hash and shows a green `Verified` badge.
  - **Downloads**: `Download Source PDF` button.
