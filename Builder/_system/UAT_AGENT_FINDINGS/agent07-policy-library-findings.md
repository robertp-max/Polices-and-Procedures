# Agent 07 Policy Library UAT Findings

Base: http://localhost:5174
Generated: 2026-05-27T14:45:27.342Z
Assigned testers: HCP-02, ADM-06, DON-05, HCP-07
Scope: Policy Library, policy rendering, ACHC/surveyor references, policy-to-form/workflow links, print/download, responsive behavior.

## Executive Verdict
FAIL for assigned Policy Library slice. The library list/search and uppercase surveyor/print routes are usable, but direct policy detail routes are not reload-safe and render "Policy not found," which blocks defensible policy references in survey packets, copied links, and audit workflows.

## Severity-Ranked Defects

### agent07-policy-library-001 - P0 - Policy Library / Policy Detail Route
- Route: /library/:policyId direct load / refresh
- Tester: HCP-02; ADM-06; DON-05; HCP-07 (power-user)
- Affected IDs/routes: GV-GB-001; CL-CA-001; CO-HP-101; /library/GV-GB-001; /library/CL-CA-001; /library/CO-HP-101
- Expected: Direct policy detail routes render the selected policy with content, metadata, references, and print/download actions.
- Actual: Direct policy detail routes render a "Policy not found." state. The same GV-GB-001 policy can render after clicking from the library SPA list, so route/reload behavior is inconsistent and not survey-defensible.
- Screenshot: C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-detail-GV-GB-001.png; C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-detail-CL-CA-001.png; C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-detail-CO-HP-101.png
- Recommended fix: Normalize and initialize policy detail routing from the canonical corpus/store on direct load; add reload tests for /library/:policyId before relying on survey or printed references.
- Blocking status: Demo blocker and survey traceability blocker

### agent07-policy-library-002 - P1 - Policy Library / Policy Detail Route
- Route: /library/:policyId lowercase direct routes
- Tester: ADM-06 (power-user)
- Affected IDs/routes: GV-GB-001; CL-CA-001; CO-HP-101
- Expected: Policy route params are canonicalized so external links, copied URLs, and references recover to the correct policy.
- Actual: Lowercase direct routes render missing policy/corpus state.
- Screenshot: C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-detail-gv-gb-001.png; C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-detail-cl-ca-001.png; C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-detail-co-hp-101.png
- Recommended fix: Canonicalize policy route params before store and corpus lookup; redirect to canonical uppercase route when needed.
- Blocking status: Blocks robust external/deep policy references

### agent07-policy-library-003 - P1 - Surveyor Policy Viewer
- Route: /surveyor/policy/gv-gb-001
- Tester: HCP-07 (power-user)
- Affected IDs/routes: GV-GB-001; /surveyor/policy/gv-gb-001
- Expected: Surveyor viewer opens the selected policy and ACHC/survey context regardless of route casing.
- Actual: Surveyor route displays a missing corpus/not-found state for lowercase GV-GB-001, while uppercase surveyor routes work.
- Screenshot: C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-surveyor-gv-gb-001.png
- Recommended fix: Use one canonical policy ID lookup for surveyor routes and normalize incoming route params.
- Blocking status: Serious survey traceability defect

### agent07-policy-library-004 - P2 - Policy Detail Actions
- Route: /library/GV-GB-001 after library click
- Tester: ADM-06 (power-user)
- Affected IDs/routes: GV-GB-001
- Expected: Policy detail exposes both print and download/save-PDF actions consistently across policies.
- Actual: GV-GB-001 detail shows Print but no visible Download action, unlike other tested policy detail routes.
- Screenshot: C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-clicked-gv-gb-001-card.png
- Recommended fix: Align GV-GB-001 special detail renderer with the shared policy detail actions or route it through the shared renderer.
- Blocking status: Print/download parity gap

### agent07-policy-library-005 - P2 - Policy Library / Detail UX
- Route: /library and /library/:policyId
- Tester: HCP-07 (new-user)
- Affected IDs/routes: /library; /library/GV-GB-001
- Expected: Policy and surveyor users can read cards/content without unrelated overlay panels obstructing references or actions.
- Actual: A "Guided UAT" checklist panel overlays policy cards and policy content, including the ACHC survey view and GV-GB-001 detail screenshots.
- Screenshot: C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-achc-survey-view.png; C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-clicked-gv-gb-001-card.png
- Recommended fix: Hide or minimize the guided UAT overlay for production/demo/surveyor policy routes, or persist dismissal before evidence screenshots/exports.
- Blocking status: Usability and demo-readiness defect

## Observations
- /library loaded on http://localhost:5174 with Enterprise Policy Library visible.
- Policy search for "Governing Body" returned GV-GB-001.
- Clicking GV-GB-001 from the library SPA list rendered the policy detail, proving the policy content exists in at least one navigation path.
- Fresh/direct /library/GV-GB-001, /library/CL-CA-001, and /library/CO-HP-101 screenshots show Policy not found, so policy references are not reload-safe.
- ACHC Survey View is present and shows survey filters/mapping cards; no ACHC defect retained after visual check.
- Uppercase surveyor routes for GV-GB-001, CL-CA-001, and CO-HP-101 rendered ACHC/survey context; lowercase /surveyor/policy/gv-gb-001 failed.
- Print routes for GV-GB-001, CL-CA-001, CO-HP-101, gv-gb-001, and cl-ca-001 rendered content; no print-not-found or placeholder-content defect retained.
- Supporting routes /forms/GV-FM-011, /workflows, /framework, and /framework/achc-survey returned 200 and were not logged as broken.
- Mobile /library at 390x844 did not show horizontal overflow in the automated scrollWidth check.

## Screenshots / Artifacts
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-library-default.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-library-search-governing-body.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-clicked-gv-gb-001-card.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-detail-GV-GB-001.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-detail-gv-gb-001.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-detail-CL-CA-001.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-detail-cl-ca-001.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-detail-CO-HP-101.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-detail-co-hp-101.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-achc-survey-view.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-surveyor-GV-GB-001.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-surveyor-CL-CA-001.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-surveyor-CO-HP-101.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-surveyor-gv-gb-001.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-print-GV-GB-001.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-print-CL-CA-001.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-print-CO-HP-101.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-print-gv-gb-001.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-print-cl-ca-001.png
- C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Builder/_system/UAT_AGENT_FINDINGS/agent07-policy-library-mobile-library.png

## Console Events
- None captured in assigned pass.
