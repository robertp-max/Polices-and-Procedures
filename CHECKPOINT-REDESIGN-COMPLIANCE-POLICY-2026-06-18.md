# Redesign Checkpoint - Compliance, Policy, Forms, Taxonomy

Created: 2026-06-18 19:13:14 -07:00 local machine time

## Current State

Primary working file:

- `src/policy/pages/Redesign/index.html`

The standalone redesign prototype is available at:

- `http://localhost:5173/src/policy/pages/Redesign/`

Git note:

- `src/policy/pages/Redesign/` is currently untracked in Git.
- No commit was created for this checkpoint.

## Work Completed

Seeded the `Compliance Execution` group:

- `ces-calendar`
- `ces-board`
- `survey-packet`
- `workflows`
- `workflow-swimlane`
- `master-controls`
- `audit-mode`
- `evidence-center`
- `ces-reports`
- `mobile-incident`

Seeded the `Policy, Forms, Taxonomy` group:

- `framework`
- `achc-survey`
- `achc-crosswalk`
- `policy-library`
- `policy-detail`
- `policy-lifecycle`
- `forms-library`
- `form-viewer`
- `ecign-workspace`
- `artifact-viewer`
- `generic-reference`
- `governance`

Generalized prototype templates so route-level seed data can drive each view:

- `KanbanPrototype`
- `EvidencePrototype`
- `FrameworkPrototype`
- `LifecyclePrototype`
- `PolicyViewerPrototype`
- `FormViewerPrototype`
- `EcignPrototype`
- `AchcSurveyPrototype`
- `AchcCrosswalkPrototype`
- `ReferenceViewerPrototype`
- `SurveyPacketPrototype`
- `ReportsPrototype`

## Source Vocabulary Incorporated

Compliance/CES:

- Six CES board lanes: `Upcoming`, `Ready`, `In Progress`, `Awaiting Signature`, `Blocked`, `Completed`
- Audit states and evidence states from app vocabulary
- Master controls baseline: `104 controls`, `81 High`, `22 Material`, `1 Low`
- CES report current posture: `18% completion`, `35% audit readiness`, `4 active blockers`, `1 signature SLA miss`

Policy/forms/taxonomy:

- Framework scope: `10 domains`, `54 subdomains`, `269 framework policies`
- Lifecycle scope kept separate: `279 draft lifecycle records`
- Policy examples include `GV-GB-001`, `CL-OA-101`, `QA-PG-001`, `CO-CP-001`, `RM-EP-001`, `EN-WF-101`
- Forms scope labels distinguish runtime `410` records from Forms page copy `361`
- GV-FM-006 form viewer and eCIgn certificate flow were seeded with realistic fields/statuses

ACHC:

- ACHC survey rows use survey-facing labels, not raw internal tags
- Crosswalk includes ACHC standard, CMS/Title 22, policy, form, evidence code, and mapping confidence
- Known data caveat preserved: ACHC mappings still need manual completion before claiming survey-ready accuracy

## Verification Passed

Desktop route smoke:

- Checked all 22 seeded Compliance/Policy routes
- Result: all visible, no browser page errors, no console errors

Mobile overflow:

- Checked all 22 seeded Compliance/Policy routes at 390px mobile width
- Result: no horizontal overflow

Full prototype smoke:

- Checked all 62 active prototype views
- Result: all visible, no browser page errors, no console errors

Screenshots captured:

- `tmp-ui-verify-screenshots/redesign-compliance-policy-seeded/ces-board.png`
- `tmp-ui-verify-screenshots/redesign-compliance-policy-seeded/audit-mode.png`
- `tmp-ui-verify-screenshots/redesign-compliance-policy-seeded/framework.png`
- `tmp-ui-verify-screenshots/redesign-compliance-policy-seeded/policy-library.png`
- `tmp-ui-verify-screenshots/redesign-compliance-policy-seeded/policy-detail.png`
- `tmp-ui-verify-screenshots/redesign-compliance-policy-seeded/forms-library.png`
- `tmp-ui-verify-screenshots/redesign-compliance-policy-seeded/achc-survey.png`
- `tmp-ui-verify-screenshots/redesign-compliance-policy-seeded/achc-crosswalk.png`
- `tmp-ui-verify-screenshots/redesign-compliance-policy-seeded/policy-lifecycle.png`
- `tmp-ui-verify-screenshots/redesign-compliance-policy-seeded/governance.png`

## Resume Notes

Good next pass:

- Review screenshots in `tmp-ui-verify-screenshots/redesign-compliance-policy-seeded/`
- Polish any route copy that feels too dense
- Consider adding regulatory chips to `framework`
- Consider adding ACHC cover-summary rows to `survey-packet`
- Consider adding unresolved-reference state to `generic-reference`
- Optionally create a commit only after deciding whether the whole untracked `src/policy/pages/Redesign/` folder should be added

Suggested resume prompt:

> Continue from `CHECKPOINT-REDESIGN-COMPLIANCE-POLICY-2026-06-18.md`. Review the screenshots and polish the seeded Compliance Execution plus Policy, Forms, Taxonomy prototype views in `src/policy/pages/Redesign/index.html`.
