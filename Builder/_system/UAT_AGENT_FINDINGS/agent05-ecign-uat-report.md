# Agent 05 eCIgn UAT Findings

Execution: 2026-05-27T14:47:50.589Z  
Scope: eCIgn signature flows only, assigned testers HCP-03, HCP-05, ADM-02, DON-06.  
Runtime: http://127.0.0.1:5175 for this repo. Note: port 5174 was occupied by an unrelated CineForge app, so this repo was started on 5175.  
Form/session tested: GV-FM-024 task-linked route with event_id=EVT-UAT-AGENT05-ECIGN-HCP03, task_id=TASK-UAT-HCP03-SIGN, workflow_id=WF-UAT-ECIGN, requirement_id=REQ-UAT-SIGNATURE, policy_id=GV-GB-001.  
Raw Playwright artifact: C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-playwright-results-2026-05-27T14-46-31-201Z.json

## Executive Verdict
FAIL. eCIgn is not demo-ready or survey-defensible for signed artifact workflows. The UI can reach a "Document Signed & Sealed" finalization screen, but persisted demo-local session state remains at created and audit evidence contains only SIGNATURE_SESSION_CREATED. Required lifecycle events, certificate IDs, signed package IDs, reloadable completion state, and multi-signer continuity are not reliably present.

## Severity-Ranked Defects

### P0 - ECIGN-UAT-004 - UI finalizes but persisted session remains created
Steps: HCP-03 opens GV-FM-024 task-linked form, clicks first Sign button, completes consent, identity confirmation, document review, signature drawing, attestation/final lock.  
Expected: session state reloads as signed_locked with finalized artifact/certificate IDs.  
Actual: final UI displays Document Signed & Sealed, but inspected local demo state for instance FI-mpo6g9al-qjj3dx remains state=created.  
IDs: event_id=EVT-UAT-AGENT05-ECIGN-HCP03; task_id=TASK-UAT-HCP03-SIGN; workflow_id=WF-UAT-ECIGN; form_id=GV-FM-024; instance_id=FI-mpo6g9al-qjj3dx.  
Audit events found: SIGNATURE_SESSION_CREATED only.  
Missing audit events: CONSENT_ACCEPTED, IDENTITY_CONFIRMED, DOCUMENT_REVIEWED, SIGNATURE_APPLIED, ATTESTATION_ACCEPTED, SIGNATURE_FINALIZED, CERTIFICATE_CREATED.  
Screenshot: C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-11-finalized-2026-05-27T14-46-31-201Z.png

### P1 - ECIGN-UAT-003 - Required audit lifecycle events missing
Steps: Same completed signing flow, then inspect ci_ecign_demo_local_v1 auditByInstanceId.  
Expected: all required events are recorded for the reloadable signing session.  
Actual: only SIGNATURE_SESSION_CREATED is present on the inspected instance.  
Blocking impact: compliance/audit trail cannot support legal signature lifecycle.

### P1 - ECIGN-UAT-005 - Certificate and signed package IDs missing from persisted finalized state
Steps: Complete the signing flow and inspect the persisted session record.  
Expected: certificate_artifact_id and signed_package_artifact_id present and openable in Artifact Viewer.  
Actual: persisted state is still created and has no certificate/package IDs, preventing direct Artifact Viewer verification from canonical IDs.

### P1 - ECIGN-UAT-001 - Refresh during consent drops out of signing workspace
Steps: Open task-linked GV-FM-024, click Sign, refresh before accepting consent.  
Expected: workspace reloads in actionable created/consent state.  
Actual: user is returned to the form page with Awaiting Signature; the signing workspace is gone.  
Screenshot: C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-03-refresh-during-consent-2026-05-27T14-46-31-201Z.png

### P1 - ECIGN-UAT-002 - Browser back/forward during review loses expected review action
Steps: Reach Review step, use browser Back then Forward.  
Expected: Review step remains actionable with Acknowledge Review.  
Actual: app returns to the form page; review action is no longer visible until the signer manually reopens eCIgn.  
Screenshot: C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-07-back-forward-review-2026-05-27T14-46-31-201Z.png

### P1 - ECIGN-UAT-009 - Reopen completed signature does not preserve completion UI
Steps: Complete signing, refresh/reopen the form route.  
Expected: completed signing state and signed/certified actions remain visible.  
Actual: form reopens as Awaiting Signature with Sign buttons.  
Screenshot: C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-15-reopen-completed-after-refresh-2026-05-27T14-46-31-201Z.png

### P1 - ECIGN-UAT-010 - Multi-signer flow unavailable after first signer finalization
Steps: Complete first signature, refresh/reopen, attempt to continue second signer flow.  
Expected: Admin/DON/Supervisor countersign flow remains available with proper order and no overwrite of prior signature.  
Actual: completion state is lost after refresh, so Send for Signature is unavailable and multi-signer continuity cannot be validated.  
Screenshot: C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-15-reopen-completed-after-refresh-2026-05-27T14-46-31-201Z.png

## Checks That Passed Or Were Not Observed
- Static route check passed: npm run check:ecign-routes -> OK, 18 routes verified.
- Static demo-local marker check passed: npm run check:ecign-demo-local -> OK, 8 required audit markers/fallback/artifact markers verified.
- Browser run observed no raw HTTP 502, no >=400 network responses, and no page errors.
- Demo-local mode rendered in the eCIgn workspace.

## Artifact List
- Raw Playwright JSON: C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-playwright-results-2026-05-27T14-46-31-201Z.json
- Defect CSV: C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-defect-log.csv
- Screenshots: C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-01-form-loaded-2026-05-27T14-46-31-201Z.png
- C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-02-workspace-created-consent-2026-05-27T14-46-31-201Z.png
- C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-03-refresh-during-consent-2026-05-27T14-46-31-201Z.png
- C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-04-reopened-after-refresh-2026-05-27T14-46-31-201Z.png
- C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-05-identity-2026-05-27T14-46-31-201Z.png
- C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-06-review-2026-05-27T14-46-31-201Z.png
- C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-07-back-forward-review-2026-05-27T14-46-31-201Z.png
- C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-08-review-restored-2026-05-27T14-46-31-201Z.png
- C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-09-signature-drawn-2026-05-27T14-46-31-201Z.png
- C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-10-attestation-2026-05-27T14-46-31-201Z.png
- C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-11-finalized-2026-05-27T14-46-31-201Z.png
- C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-15-reopen-completed-after-refresh-2026-05-27T14-46-31-201Z.png
- C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\_system\UAT_AGENT_FINDINGS\agent05-ecign-17-expired-state-reopen-2026-05-27T14-46-31-201Z.png

## Recommended Next Fix Phase
Fix the session persistence and artifact/audit write path before UI polish: make one canonical eCIgn instance survive refresh/back/forward, write every required audit event to that same instance, persist signed_locked state plus certificate/signed_package IDs, then prove Artifact Viewer opens the same signed package after refresh. Multi-signer should be tested only after that chain is stable.
