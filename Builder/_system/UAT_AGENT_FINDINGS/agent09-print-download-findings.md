# Agent 09 Print/Download UAT Findings

Generated: 2026-05-27

Scope: ADM-06, DON-05, HCP-06, HCP-07; new-user and power-user passes. Focused on policy print/download, form print, signed artifact print, evidence download/open, and audit packet export.

## Executive Verdict

FAIL for survey-defensible print/download parity. Policy and form print routes render with content and logo, but signed/certified artifact and evidence paths are not demonstrably viewable in the default tested proof path, and audit packet export has serious branding/export fidelity issues.

## Coverage Run

- Browser base: `http://localhost:5176`
- Route/persona checks: 80
- Playwright result log: `Builder/_system/UAT_AGENT_FINDINGS/agent09-print-download-playwright-results.json`
- Screenshot folder: `Builder/_system/UAT_AGENT_FINDINGS/agent09-print-download-screenshots`
- Runner: `Builder/_system/UAT_AGENT_FINDINGS/agent09-print-download-uat.cjs`

## Severity-Ranked Defects

### P1 - Signed/certified artifact proof path is metadata-only

- Routes/artifacts:
  - `/artifacts/agent09-signed-artifact-smoke?type=signature&evidence_id=agent09-signed-artifact-smoke&event_id=EVT-DEMO-001&task_id=TASK-DEMO-001&form_id=CL-FM-011`
  - `/artifacts/EVT-DEMO-001::TASK-DEMO-001?event_id=EVT-DEMO-001&task_id=TASK-DEMO-001&type=evidence_package`
- Actual: Artifact Viewer renders metadata only. The signed artifact route says `Artifact was not found in the current CES store snapshot`; the evidence package route reports `Form instances: 0`, `Evidence files: 0`, `Signatures/certificates: 0`, and `Status incomplete - 0 linked documents`.
- Expected: A signed/certified artifact should open with immutable content, signatures, certificate/attestation page, traceability metadata, and printable/downloadable content.
- Screenshots:
  - `Builder/_system/UAT_AGENT_FINDINGS/agent09-print-download-screenshots/agent09-print-download-ADM-06-new-user-artifact-unknown-signed.png`
  - `Builder/_system/UAT_AGENT_FINDINGS/agent09-print-download-screenshots/agent09-print-download-ADM-06-new-user-artifact-evidence-package.png`

### P1 - Audit packet export is not production-branded/certified enough

- Route/artifact: `/audit`, exported `audit-packet-governance-packet-review-20260108-01-2026-05-27.html`
- Actual: Export downloads, but the HTML packet has no Care Indeed logo image, no signature/certificate/attestation page, and contains mojibake such as `Â§` in regulatory citations. The button label says `Print / PDF`, but the generated file is HTML.
- Expected: Audit packet export should be branded, printable as an audit packet, include certification/signature context where applicable, preserve special characters, and clearly match its export label.
- Artifact: `Builder/_system/UAT_AGENT_FINDINGS/agent09-print-download-audit-export-print-pdf-audit-packet-governance-packet-review-20260108-01-2026-05-27-html`
- Screenshot: `Builder/_system/UAT_AGENT_FINDINGS/agent09-print-download-screenshots/agent09-print-download-audit-export-after-clicks.png`

### P2 - Audit Markdown export can be blocked by guided mission overlay

- Route: `/audit`
- Actual: After audit exports, the `Markdown` export button could not be clicked because the `Welcome back - set your mission` guided UAT dialog intercepted pointer events. The final export attempt produced no download event.
- Expected: Power users should be able to export the selected audit packet without overlays blocking export controls.
- Artifact: Playwright console output in `agent09-print-download-playwright-results.json`, `auditExports` entry for `Markdown`.

### P2 - Policy autoprint route did not invoke browser print

- Route: `/print/GV-GB-001?autoprint=1`
- Actual: The page rendered, but a Playwright init-script stub of `window.print` recorded zero calls after waiting 1.5 seconds.
- Expected: `?autoprint=1` should reliably invoke the browser print dialog once content is ready.
- Screenshot: `Builder/_system/UAT_AGENT_FINDINGS/agent09-print-download-screenshots/agent09-print-download-ADM-06-new-user-policy-autoprint-gv.png`

### P2 - Evidence download/open could not be validated from default event

- Route/event: `/evidence?event_id=EVT-DEMO-001&view=files`
- Actual: Evidence Center loaded with `No evidence uploaded for this event yet`, `Upload blocked until a CES task context is selected`, and zero audit entries. No evidence row was available to open/download for ADM-06, DON-05, HCP-06, or HCP-07.
- Expected: Demo/survey UAT should include at least one seeded evidence artifact with view and download paths so download/open parity can be verified.
- Screenshot: `Builder/_system/UAT_AGENT_FINDINGS/agent09-print-download-screenshots/agent09-print-download-ADM-06-new-user-evidence-files.png`

## Verified Passing Notes

- `/print/GV-GB-001` rendered policy content and Care Indeed logo.
- `/forms/CL-FM-011/print` and `/forms/GV-FM-005/print` rendered form content and Care Indeed logo.
- `/audit` successfully downloaded rollup Markdown, bundle Markdown, bundle JSON, and one HTML audit packet before the overlay blocked the later Markdown export.
- No route-level console errors, page errors, raw 4xx/5xx responses, or blank pages were captured in the 80 automated checks.

## Recommended Next Fix Phase

Fix signed/certified artifact availability and audit packet export fidelity first: seed or generate a real signed packet with certificate, make Artifact Viewer print/download from that immutable packet, then align audit export branding/encoding/format labels and suppress guided overlays during export workflows.
