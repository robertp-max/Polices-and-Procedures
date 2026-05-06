# Knowledge Base Articles

Format per article:

- Article title
- Intended audience
- Related page/module
- Purpose
- Step-by-step guidance
- Common mistakes
- Related policies/forms/workflows (when applicable)

---

## Dashboard (3 articles)

### Article 1: Using Dashboard Risk Signals

- Intended audience: End users, supervisors.
- Related page/module: `Dashboard`.
- Purpose: understand what risk colors and counters mean.
- Step-by-step guidance:
  1. Open `Dashboard`.
  2. Review overdue and due-soon cards first.
  3. Open each flagged event and resolve missing tasks/forms/evidence.
- Common mistakes:
  - assuming "on dashboard" equals "certified".
- Related items:
  - event workflows and required forms.

### Article 2: Opening an Event from Dashboard

- Intended audience: End users.
- Related page/module: `Dashboard` -> event/workflow views.
- Purpose: quickly move from summary to action.
- Step-by-step guidance:
  1. Click event tile from dashboard.
  2. Enter workflow/event panel.
  3. Complete pending items in sequence.
- Common mistakes:
  - skipping form/evidence tabs before certifying.
- Related items:
  - event instance, task list, evidence records.

### Article 3: Dashboard Daily Review Routine

- Intended audience: Team leads.
- Related page/module: `Dashboard`.
- Purpose: establish daily compliance review habit.
- Step-by-step guidance:
  1. Start day with overdue events.
  2. Check due-this-week events.
  3. Assign or escalate blockers in PM/CES views.
- Common mistakes:
  - not checking dependencies before closure.
- Related items:
  - approvals, event dependencies, audit readiness.

## Policy Library (3 articles)

### Article 4: Finding the Right Policy

- Intended audience: End users.
- Related page/module: `Library`.
- Purpose: search and open policy details accurately.
- Step-by-step guidance:
  1. Search by policy ID or title keywords.
  2. Confirm domain and policy code.
  3. Open detail page and review latest content.
- Common mistakes:
  - using outdated offline policy copies.
- Related items:
  - policy IDs linked to workflows/forms.

### Article 5: Printing Policy for Review

- Intended audience: End users, auditors.
- Related page/module: `Policy Detail` and `Print`.
- Purpose: produce consistent printable policy output.
- Step-by-step guidance:
  1. Open policy detail.
  2. Navigate to print route.
  3. Save/print using official print view.
- Common mistakes:
  - printing from non-print pages causing layout mismatch.
- Related items:
  - survey preparation packets.

### Article 6: Policy-to-Workflow Traceability

- Intended audience: Admin users.
- Related page/module: `Policy Detail`, `Workflows`.
- Purpose: verify policy references are represented in execution workflows.
- Step-by-step guidance:
  1. Note policy ID from detail page.
  2. Find workflows referencing that policy.
  3. Confirm required forms and event obligations.
- Common mistakes:
  - assuming reference exists without checking generated workflow data.
- Related items:
  - `workflows.generated.ts`, forms catalog.

## Forms Library (3 articles)

### Article 7: Opening and Completing a Form

- Intended audience: End users.
- Related page/module: `Forms`, `FormViewer`.
- Purpose: complete a form correctly in-app.
- Step-by-step guidance:
  1. Open form from forms list.
  2. Fill required fields.
  3. Save and submit/sign based on workflow requirements.
- Common mistakes:
  - leaving fields blank and assuming autosave completed.
- Related items:
  - required forms in event workflows.

### Article 8: Linking Form Work to Events

- Intended audience: End users.
- Related page/module: `FormViewer`, event workflow tabs.
- Purpose: ensure form completion contributes to event readiness.
- Step-by-step guidance:
  1. Confirm current event context.
  2. Complete form and verify status updates in workflow panel.
  3. Attach supporting evidence if required.
- Common mistakes:
  - completing form outside correct event context.
- Related items:
  - event tasks, form IDs, evidence links.

### Article 9: Form Print and Signature Expectations

- Intended audience: End users, compliance reviewers.
- Related page/module: `FormPrintView`, eCIGN-related flows.
- Purpose: distinguish fill workflow from print and signature records.
- Step-by-step guidance:
  1. Use form workflow for completion.
  2. Use print view for distribution.
  3. Complete signatures where required.
- Common mistakes:
  - printing as substitute for completed signed record.
- Related items:
  - signature evidence and approval status.

## Workflows and Calendar (3 articles)

### Article 10: Running an Event Workflow

- Intended audience: End users.
- Related page/module: `Workflows`, `Calendar event execution`.
- Purpose: execute workflow steps in correct order.
- Step-by-step guidance:
  1. Open event from calendar.
  2. Work through steps and required forms.
  3. Attach evidence and approvals before certification.
- Common mistakes:
  - marking steps complete without evidence.
- Related items:
  - step/task/form status.

### Article 11: Understanding Event States

- Intended audience: End users, managers.
- Related page/module: `WorkflowExecutionPanel`.
- Purpose: understand scheduled/in-progress/completed/certified states.
- Step-by-step guidance:
  1. Check current state in panel header.
  2. Resolve blockers shown in checklist.
  3. certify only when all required checks pass.
- Common mistakes:
  - confusing complete with certified.
- Related items:
  - certification record and lock state.

### Article 12: Syncing Events to Google Calendar

- Intended audience: Admin and operations coordinators.
- Related page/module: `WorkflowExecutionPanel` event overview.
- Purpose: send app event to Google calendar integration.
- Step-by-step guidance:
  1. Open event details.
  2. Click sync-to-calendar action.
  3. Confirm success/failure message.
- Common mistakes:
  - repeated sync attempts without checking backend availability.
- Related items:
  - `CalendarApi` and `/api/calendar` routes.

## Evidence Center and Audit (3 articles)

### Article 13: Uploading Evidence with Correct Triplet

- Intended audience: End users.
- Related page/module: `Evidence Center`.
- Purpose: attach evidence to correct policy/workflow/event.
- Step-by-step guidance:
  1. Load correct event ID.
  2. Verify policy and workflow IDs.
  3. Upload file and confirm row appears.
- Common mistakes:
  - missing or wrong IDs causing mislinked evidence.
- Related items:
  - policy/workflow/event triplet.

### Article 14: Reading Evidence Audit Entries

- Intended audience: End users, auditors.
- Related page/module: `Evidence Center` audit panel.
- Purpose: understand who did what and when.
- Step-by-step guidance:
  1. Open event in Evidence Center.
  2. Review audit list by timestamp.
  3. confirm status transition rows.
- Common mistakes:
  - treating missing entries as acceptable in certification.
- Related items:
  - evidence status transitions.

### Article 15: Preparing for Survey Packet Export

- Intended audience: Compliance leads.
- Related page/module: `Audit View`/`WorkflowExecutionPanel`.
- Purpose: verify evidence completeness before export.
- Step-by-step guidance:
  1. open audit checklist tab.
  2. Resolve failed forms/evidence/approvals.
  3. Export printable packet and markdown packet.
- Common mistakes:
  - exporting with unresolved deficiencies.
- Related items:
  - survey packet section outputs.

## Brad / iAdministrator (3 articles)

### Article 16: Asking Effective Questions in iAdministrator

- Intended audience: End users.
- Related page/module: `iAdministrator`.
- Purpose: improve answer quality with clear prompts.
- Step-by-step guidance:
  1. ask one focused compliance question.
  2. include policy/event/form IDs when available.
  3. review cited references before action.
- Common mistakes:
  - broad multi-topic prompts with no IDs.
- Related items:
  - policy, form, workflow identifiers.

### Article 17: Verifying Brad References

- Intended audience: Compliance reviewers.
- Related page/module: `iAdministrator` references panel.
- Purpose: validate answer traceability.
- Step-by-step guidance:
  1. read answer summary.
  2. open references listed.
  3. cross-check against active policy/workflow records.
- Common mistakes:
  - taking uncited text as final policy guidance.
- Related items:
  - help articles, policy content sources.

### Article 18: Troubleshooting Incomplete IA Results

- Intended audience: Admin users.
- Related page/module: `iAdministrator`, IA backend.
- Purpose: diagnose weak or empty results.
- Step-by-step guidance:
  1. verify IA backend route health.
  2. confirm index is built and loaded.
  3. confirm source corpora include required docs.
- Common mistakes:
  - expecting runtime dataset updates to auto-refresh IA index.
- Related items:
  - IA ingestion/index pipeline.

## Help Center and Guided Tour (3 articles)

### Article 19: Finding the Right Help Article Fast

- Intended audience: End users.
- Related page/module: `Help Center`.
- Purpose: quickly locate module-specific instructions.
- Step-by-step guidance:
  1. open Help Center.
  2. pick module category first.
  3. use search terms from page labels.
- Common mistakes:
  - browsing generic docs instead of module-specific guidance.
- Related items:
  - contextual help panels.

### Article 20: Restarting the Guided Tour

- Intended audience: End users.
- Related page/module: `Guided tour overlays`.
- Purpose: re-run onboarding flow.
- Step-by-step guidance:
  1. open app shell.
  2. trigger tour restart action.
  3. follow each step until completion.
- Common mistakes:
  - skipping required steps for onboarding tasks.
- Related items:
  - mission prompt and tour cards.

### Article 21: Using Help During Audit Preparation

- Intended audience: Compliance leads.
- Related page/module: `Help Center` + `Audit`.
- Purpose: use help content to resolve checklist blockers.
- Step-by-step guidance:
  1. identify failed checklist item.
  2. open matching help article.
  3. apply steps and re-check checklist.
- Common mistakes:
  - certifying before re-validating checklist.
- Related items:
  - audit readiness checklist sections.
