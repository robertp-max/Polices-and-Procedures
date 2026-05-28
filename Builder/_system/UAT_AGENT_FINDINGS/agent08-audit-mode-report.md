# Agent 08 UAT Findings - Audit Mode / Survey Readiness

Assigned testers: HCP-07, ADM-03, ADM-07, HCP-04. Each was exercised from both new-user and power-user perspectives for Audit Mode, Evidence Center, Dashboard, CES calendar, V3 staging, export, and drill-down behavior.

## Executive Verdict

Survey defensibility: FAIL.

Audit Mode can generate survey rollup, bundle, JSON, and per-instance packet downloads, but the tested surveyor/executive path is not defensible because proof is not discoverable from Audit Mode or Evidence Center for selected Q1/high-risk events. Audit readiness also remains internally inconsistent: the global Audit Mode and Dashboard tiles report zero missing-evidence / zero pending-approval queues while the exported packets for the same instances explicitly state no forms, no evidence, no approvals, and no audit activity.

## Scope And Routes Tested

- `/audit` - Audit Mode queue, readiness tiles, survey rollup, bundle, JSON, per-instance packets, tabs.
- `/evidence` and `/evidence?view=files` - Evidence Center folder tree and file ledger.
- `/dashboard` - executive readiness entry points and audit summary.
- `/ces/calendar` - event-to-Audit/Evidence context route from calendar.
- `/ui-staging/v32` - V3 staging visibility for evidence/audit readiness handoff.
- `/help/audit-trail` - audit-trail documentation link opened from Audit Mode.

Primary IDs exercised:

- `governance_packet_review-20260108-01` - Annual Governance Packet Review.
- `qapi_meeting-20260205-04` - Quarterly QAPI Governance Review & Annual PIP Kickoff.
- `infection_control_review_quarterly-20260325-01` - Q1 Infection Control Review.
- Evidence Center default event: `EVT-DEMO-001`.

## Tester Perspective Results

- HCP-07 new user / external surveyor: FAIL. Could open `/audit`, see queues, and download packets, but could not reach proof artifacts in under 3 clicks. Evidence tabs showed no artifacts.
- HCP-07 power user / auditor: FAIL. Exports worked, but exported packets documented missing proof rather than defensible evidence.
- ADM-03 new user / executive operator: FAIL. Dashboard and Audit Mode implied readiness metrics, but drill-down led to zero-ready and no-evidence states.
- ADM-03 power user / reports/evidence packets: FAIL. Rollup/bundle/JSON downloads worked, but content showed 0 certified, 0 audit ready, and no viewable proof for sampled Q1 items.
- ADM-07 new user / demo credibility: FAIL. Mixed preview/live signals and zero-proof evidence states would undermine a sales/demo survey narrative.
- ADM-07 power user / sellability: FAIL. Locked package visibility was absent and the Evidence Center file ledger defaulted to `EVT-DEMO-001` with no files.
- HCP-04 new user / risk manager: FAIL. Risk/Q1 audit items were visible, but CAPA/evidence proof was not reachable.
- HCP-04 power user / CAPA and audit readiness: FAIL. No selected sampled item exposed signed artifacts or locked package proof.

## Severity-Ranked Defects

### P1 - Audit readiness counters contradict packet evidence

Routes: `/audit`, `/dashboard`.

IDs: `governance_packet_review-20260108-01`, `qapi_meeting-20260205-04`, `infection_control_review_quarterly-20260325-01`.

Observed: Audit Mode health strip shows `MISSING EVIDENCE 0`, `PENDING APPROVAL 0`, `AUDIT READY 0`, `CERTIFIED & LOCKED 0` while the sampled per-instance packets state `Evidence Complete: Fail - No evidence uploaded`, `Approvals Complete: Fail`, `Forms Complete: Fail`, and `No logged activity`. Dashboard also reports `MISSING EVIDENCE 0` and `0 pending approval` while showing `AUDIT READY 0/253`.

Impact: Executives and surveyors receive a false missing-evidence signal. This is a serious compliance trust issue.

Artifacts:

- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-audit.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-dashboard.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-download-audit-packet-governance_packet_review-20260108-01-2026-05-27.md`

### P1 - Surveyor cannot find proof artifacts from Audit Mode in under 3 clicks

Route: `/audit`.

IDs: same three sampled Q1/high-risk events.

Observed: New-user flow `/audit` -> event row -> `Evidence` tab gives required forms and `No evidence files uploaded`; no `View Artifact`, `Open File`, or artifact route is presented. The only links captured from the evidence tab were global nav links (`/ces/calendar`, `/evidence`, etc.).

Impact: External auditor proof discovery fails the assigned surveyor usability target.

Artifacts:

- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-tab-evidence-annual-governance-packet-review.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-tab-evidence-quarterly-qapi-governance-review.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-tab-evidence-q1-infection-control-review.png`

### P1 - Evidence Center cannot surface Q1 locked package or sampled event artifacts

Routes: `/evidence`, `/evidence?view=files`.

Observed: Folder tree shows 2026 months and 0% audit readiness with `LOCKED EVIDENCE 0`. File ledger defaults to `EVT-DEMO-001`, reports `No evidence uploaded for this event yet`, has `0` table rows, `0` View Artifact actions, and `0` Download actions. There was no visible locked Q1 package in Evidence Center.

Impact: Evidence Center cannot currently defend completed/locked Q1 proof for the assigned slice.

Artifacts:

- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-evidence.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-evidence-file-ledger.png`

### P2 - Print behavior is export-only, not verified print flow

Route: `/audit`.

Observed: Per-instance `Print / PDF` creates downloadable HTML packets. Browser `window.print` was not invoked in the probe, and the control did not open a print preview. The artifact may be print-ready, but the actual print behavior requested for UAT was not demonstrated.

Impact: Print/download parity for survey packet output remains unproven.

Artifacts:

- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-download-audit-packet-governance_packet_review-20260108-01-2026-05-27.html`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-instance-print-pdf-annual-governance-packet-review.png`

### P2 - Exported packet text contains mojibake/encoding defects

Routes: `/audit` export controls.

Observed: Downloaded Markdown contains corrupted characters such as `â€”`, `Â§`, and `Â·` in survey-facing text.

Impact: Survey packet output looks unprofessional and may be questioned as generated/broken documentation.

Artifacts:

- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-download-survey-rollup-2026-05-27-14-43-20.md`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-download-audit-packet-governance_packet_review-20260108-01-2026-05-27.md`

### P2 - Locked Q1 package visibility is absent across tested surfaces

Routes: `/audit`, `/evidence`, `/dashboard`, `/ui-staging/v32`.

Observed: No locked Q1 package was visible. Audit Mode reports `CERTIFIED & LOCKED 0`; Evidence Center reports `LOCKED EVIDENCE 0`; Dashboard reports `AUDIT READY 0/253`; V3 staging is explicitly preview/synthetic for dashboard readiness and does not show locked Q1 evidence.

Impact: The assigned locked-package visibility requirement is not satisfied if the feature is expected to exist in this build.

Artifacts:

- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-audit.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-evidence.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-dashboard.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-v3-staging.png`

## Positive Findings

- `/audit`, `/evidence`, `/dashboard`, `/ces/calendar`, and `/ui-staging/v32` loaded without page crashes in this pass.
- No Playwright page errors were captured in the browser probes.
- Audit Mode export controls produced files for survey rollup, audit bundle Markdown, audit bundle JSON, and per-instance packets.
- Per-instance packets include useful sections for cover summary, compliance summary, workflow snapshot, forms/evidence, approvals, minutes, SLA, dependencies, audit trail, deficiency summary, and certification state.

## Generated Artifacts

Raw browser results:

- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-playwright-results.json`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-results.json`

Probe scripts:

- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-uat-probe.cjs`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-probe.cjs`

Downloaded evidence/export samples:

- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-download-survey-rollup-2026-05-27-14-43-20.md`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-download-audit-bundle-2026-05-27-14-43-22.md`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-download-audit-bundle-2026-05-27-14-43-23.json`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-download-audit-packet-governance_packet_review-20260108-01-2026-05-27.html`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-download-audit-packet-governance_packet_review-20260108-01-2026-05-27.md`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-download-audit-packet-qapi_meeting-20260205-04-2026-05-27.html`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-download-audit-packet-qapi_meeting-20260205-04-2026-05-27.md`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-download-audit-packet-infection_control_review_quarterly-20260325-01-2026-05-27.html`
- `Builder/_system/UAT_AGENT_FINDINGS/agent08-audit-mode-focused-download-audit-packet-infection_control_review_quarterly-20260325-01-2026-05-27.md`

## Recommended Next Fix Phase

Fix Audit Mode and Evidence Center defensibility first: reconcile readiness counters with per-instance checklist state, wire Audit Mode evidence tabs to real artifact routes, expose signed/locked package status in Evidence Center/Dashboard/Audit Mode, and verify print/download parity on generated survey packets before broader UI polish.
