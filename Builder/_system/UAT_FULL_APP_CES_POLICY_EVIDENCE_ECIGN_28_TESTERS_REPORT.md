# Full App UAT Report - CES, Policy, Evidence, eCIgn

Date: 2026-05-27  
Scope owner: agent12-report-synthesis coordinator  
Mode: UAT only. No source code changes performed.

## Executive Verdict

FAIL.

The application is not demo-ready or survey-defensible for a full CES / policy / evidence / eCIgn walkthrough. No other `Builder/_system/UAT_AGENT_FINDINGS` reports were available at synthesis time, so this report combines independent route sampling, command checks, source/document review, and existing unresolved forensic findings. Any flow not actually opened and verified is marked unverified rather than PASS.

## Demo Readiness

No-go for executive or surveyor demo involving CES completion, eCIgn, Evidence Center, Artifact Viewer, PM task sync, or signed output.

Observed positives: protected-route bypass/dev route loading worked on local ports 5173, 5174, and 5175; policy detail `GV-GB-001` rendered; policy print `/print/GV-GB-001` rendered printable content; `npm run check:ecign-routes` passed route registration; `npm run verify:task-identity` passed the task identity verifier.

Blocking issues: eCIgn could not be completed in sampled form flow, required CES form references can resolve to "Form Not Found", PM route calls live AWS endpoints and produces CORS/fetch failures, lint fails repo-wide, and existing evidence/eCIgn/print forensic findings remain unresolved unless separately proven fixed.

## Survey Defensibility

FAIL.

The survey defensibility chain is incomplete: required form instance identity, eCIgn finalization, signed PDF artifact creation, Evidence Center artifact retrieval, Artifact Viewer opening, audit trail linkage, print/download parity, and Q1 package lock were not successfully verified end to end. Static evidence and prior forensics indicate unresolved P0/P1 risks around signed artifact persistence, metadata-only evidence, audit target IDs, and signed PDF route drift.

## Top 10 Risks

1. eCIgn signed artifact retrieval is not proven and prior forensics show the wrong artifact/template can open after signing.
2. Evidence Center can retain metadata while losing artifact content after refresh, breaking auditability.
3. Signed PDF print/download parity is not verified and depends on unresolved artifact persistence.
4. Q1 2026 CES completion drill cannot be marked complete; zero Q1 events were completed through required form, signature, admin/supervisor review, locked PDF, and evidence lock.
5. Required CES forms are inconsistent with the Enterprise Forms Library: sampled `FRM-QAPI-019` and `OP-FM-030` opened "Form Not Found".
6. PM task surface `/pm/my-tasks` produces external AWS CORS/fetch failures in local UAT.
7. Prior terminal evidence shows a CES calendar runtime crash in `EventAnchorMarker` from `tone.bg` being undefined.
8. Repository lint fails with 980 problems, including UAT specs and production/staging files.
9. V3/CES UX remains mixed with legacy drawers, dense rails, accessibility gaps, and noncanonical components per current UI/UX action items.
10. No 28-tester peer evidence was available; most role/personality paths remain unverified.

## P0/P1 Summary

P0:
- UAT-P0-001: eCIgn signed/certified artifact chain not survey-defensible.
- UAT-P0-002: Q1 2026 CES full completion drill failed / blocked.
- UAT-P0-003: Evidence artifact content persistence remains unproven and prior forensics show metadata-only evidence.

P1:
- UAT-P1-001: Required form references can open "Form Not Found".
- UAT-P1-002: PM/My Tasks route emits live AWS CORS/fetch failures.
- UAT-P1-003: Print/download signed-output parity remains blocked by eCIgn/evidence defects.
- UAT-P1-004: CES calendar runtime crash seen in existing local terminal evidence.
- UAT-P1-005: Artifact Viewer missing-artifact behavior is not a clearly actionable artifact preview.

## Tester Matrix Results

Result key: FAIL means opened or otherwise evidenced and failed. UNVERIFIED means not opened by that tester persona in this synthesis pass.

| Tester ID | Professional Identity | Personality | New User / Power User Result |
|---|---|---|---|
| DON-01 | Director of Nursing | Detail-Oriented Perfectionist | UNVERIFIED - no complete DON task/signature pass performed |
| DON-02 | Director of Nursing | Pragmatic Business Owner | UNVERIFIED - dashboard/demo credibility sampled only as route smoke |
| DON-03 | Director of Nursing | Tech-Savvy Early Adopter | FAIL - cross-view/eCIgn artifact flow not proven |
| DON-04 | Director of Nursing | Frontline Workflow Realist | UNVERIFIED - no realistic clinical completion pass completed |
| DON-05 | Director of Nursing | Detail-Oriented Perfectionist | FAIL - sampled required forms include not-found cases |
| DON-06 | Director of Nursing | Pragmatic Business Owner | FAIL - no demo-ready end-to-end completion evidence |
| DON-07 | Director of Nursing | Tech-Savvy Early Adopter | UNVERIFIED - refresh/route recovery not fully exercised |
| ADM-01 | Administrator | Frontline Workflow Realist | FAIL - admin review/signoff tasks not created in Q1 drill |
| ADM-02 | Administrator | Detail-Oriented Perfectionist | FAIL - governance evidence chain not complete |
| ADM-03 | Administrator | Pragmatic Business Owner | FAIL - cannot run agency demo from unverified CES/evidence state |
| ADM-04 | Administrator | Tech-Savvy Early Adopter | FAIL - `/pm/my-tasks` CORS/fetch failures |
| ADM-05 | Administrator | Frontline Workflow Realist | UNVERIFIED - blocker/escalation workflow not completed |
| ADM-06 | Administrator | Detail-Oriented Perfectionist | FAIL - print/download legal parity not verified |
| ADM-07 | Administrator | Pragmatic Business Owner | FAIL - not sellable/demo-ready for compliance walkthrough |
| CM-01 | Clinical Manager | Tech-Savvy Early Adopter | UNVERIFIED - artifact preview from clinical task not completed |
| CM-02 | Clinical Manager | Frontline Workflow Realist | UNVERIFIED - no clinical event executed start to finish |
| CM-03 | Clinical Manager | Detail-Oriented Perfectionist | FAIL - required form completeness not defensible |
| CM-04 | Clinical Manager | Pragmatic Business Owner | UNVERIFIED - throughput not measured |
| CM-05 | Clinical Manager | Tech-Savvy Early Adopter | UNVERIFIED - refresh/duplicate prevention not fully exercised |
| CM-06 | Clinical Manager | Frontline Workflow Realist | UNVERIFIED - field-realistic handoff not completed |
| CM-07 | Clinical Manager | Detail-Oriented Perfectionist | FAIL - survey packet/evidence defensibility not proven |
| HCP-01 | QAPI Coordinator | Pragmatic Business Owner | FAIL - sampled QAPI form route `FRM-QAPI-019` not found |
| HCP-02 | Compliance Officer | Tech-Savvy Early Adopter | FAIL - policy view renders, but audit/evidence/eCIgn chain fails |
| HCP-03 | HR Director | Frontline Workflow Realist | UNVERIFIED - HR signing/personnel evidence not completed |
| HCP-04 | Risk Manager | Detail-Oriented Perfectionist | UNVERIFIED - CAPA/escalation not completed |
| HCP-05 | IT/Security Officer | Pragmatic Business Owner | FAIL - artifact integrity and eCIgn resilience not proven |
| HCP-06 | Finance/Revenue Cycle Leader | Tech-Savvy Early Adopter | UNVERIFIED - finance workflow not sampled end to end |
| HCP-07 | Surveyor/External Auditor Persona | Frontline Workflow Realist | FAIL - proof cannot be found under 3 clicks for signed artifacts because artifact chain is blocked |

## CES Findings

- `/ces/calendar`, `/ces/board`, `/my-tasks`, `/calendar`, and `/pm/my-tasks` were opened in route smoke sampling on local ports 5173/5174/5175.
- `/pm/my-tasks` generated live AWS CORS/fetch errors against `https://rtllnugat0.execute-api.us-west-1.amazonaws.com/...` on ports 5174 and 5175, and 503 resource errors on 5173.
- Existing terminal evidence shows `ComplianceCalendar.tsx` crashed at `EventAnchorMarker` reading `tone.bg` from an undefined tone.
- `npm run verify:task-identity` passed, which is positive, but this does not prove cross-view runtime identity consistency.
- Full CES task completion, blocked completion gates, approvals, supervisor assignment, and lock/certification behavior were not completed.

## Policy Library Findings

- `/library/GV-GB-001` opened and rendered policy content including policy metadata and sections.
- `/print/GV-GB-001` opened printable policy content with branding and metadata.
- Search/filter/domain navigation, ACHC anchor traceability, policy-to-form links, policy-to-workflow links, mobile behavior, and download parity were not fully verified.

## Evidence Center Findings

- `/evidence` route opened in smoke sampling.
- Existing unresolved forensics document the key risk: metadata survives while artifact content can be unavailable after hard refresh.
- Evidence upload, hierarchy traversal, PDF/image preview, bundle download, artifact persistence after refresh, and audit-mode deep links were not verified.

## eCIgn Findings

- `npm run check:ecign-routes` passed: 18 routes verified.
- `/forms/QA-FM-020` opened and displayed Print, Save as Evidence, Download, and Sign actions.
- Clicking Sign opened an eCIgn consent modal/workspace, but `Accept & Continue` was disabled in the automated sample; no finalization, certificate, signed package, or artifact ID was created.
- Existing unresolved forensics still classify signed artifact retrieval as P0 until browser evidence proves the same signed PDF is stored and reopened from every entry point.

## Artifact Viewer Findings

- `/artifacts/test-missing` opened with shell/sidebar text but did not prove a useful artifact preview.
- Signed artifact opening from task, Evidence Center, Audit Mode, audit trail, and Artifact Viewer was not verified because eCIgn finalization was blocked.

## Audit Mode Findings

- `/audit` route opened in smoke sampling.
- Readiness scoring, missing evidence drill-down, survey packet generation, signed artifact visibility, and export/print behavior were not verified.
- Surveyor "proof in under 3 clicks" cannot be claimed because the evidence/artifact chain is incomplete.

## Print/Download Findings

- Policy print route `/print/GV-GB-001` rendered.
- Form header actions for Print, Save as Evidence, and Download were visible on `/forms/QA-FM-020`.
- Signed form print/download parity was not verified because eCIgn finalization did not complete.
- Existing print/signed PDF route forensics remain a P1 until a signed artifact can be downloaded/printed after refresh.

## UX/Design Findings

- High-level routes load in the V3 shell, but current UI/UX action items and alignment review indicate CES/evidence/signing surfaces still contain legacy density, custom drawers, mixed visual systems, and incomplete V3 migration.
- No PASS is assigned for polish because the highest-risk workflows were blocked before completion.

## Accessibility/Responsive Findings

- No complete keyboard, screen reader, reduced-motion, forced-colors, or mobile matrix was executed in this synthesis pass.
- Existing UI/UX action items identify critical risks: missing focus traps, contrast issues on glass, Travelight/reduced-motion gaps, and custom CES drawers lacking complete dialog semantics.

## Console / Build / Test Command Findings

- Working directory check was executed from `C:\AI\Git\training\HomeHealth\Policies_and_Procedures`.
- Local dev servers were already running; ports 5173, 5174, and 5175 returned HTTP 200.
- `npm run lint` failed with 980 problems: 361 errors and 619 warnings.
- `npm run check:ecign-routes` passed: 18 routes verified.
- `npm run verify:task-identity` passed.
- `npm run build` was not run in this pass to avoid creating or changing build artifacts outside the allowed deliverables.
- A static Q1 summary command using `tsx` hung and was stopped; Q1 counts below were derived by direct source review of the Q1 event block instead.

## Screenshots List

No new screenshots were created by this coordinator slice because the instruction limited write outputs to the report, defect CSV, and optional notes. Existing artifact screenshots in the repository were not treated as new UAT proof for this slice.

## Q1 2026 Full CES Calendar Completion Drill

Verdict: FAIL.

Source-reviewed Q1 2026 event set contains 9 events:
- `governance_packet_review-20260108-01`
- `ep_plan_review-20260115-01`
- `ep_staff_training-20260122-01`
- `qapi_meeting-20260205-04`
- `hha_aide_inservice-20260209-01`
- `hha_skill_observation-20260225-01`
- `hha_aide_observation-20260311-01`
- `ep_exercise-20260318-01`
- `hhcahps_filing-20260331-01`

Drill metrics:
- Total Q1 events found: 9
- Total Q1 tasks found: approximately 98 when counting process steps, required forms, approval tasks, and explicit minutes deliverables
- Total forms required: 37
- Total eCIgn flows attempted: 1 sampled direct form signing flow
- Total supervisor/admin review tasks expected: at least 15 approval tasks plus role-specific signoffs embedded in minutes/forms
- Total supervisor/admin review tasks actually created: 0 verified
- Total supporting document uploads tested: 0
- Total locked PDFs expected: at least 37 form artifacts, plus minutes/certificate artifacts where signatures apply
- Total locked PDFs created: 0 verified
- Total evidence artifacts visible in Evidence Center: 0 verified for Q1 completion drill
- Total broken/missing artifacts: at least sampled `OP-FM-030` and `FRM-QAPI-019` route misses; signed artifacts unverified/blocked
- Total events successfully completed: 0
- Total events blocked: 9
- Final Q1 audit/evidence package reviewed and locked: No
- Final verdict: Q1 CES Completion Drill FAIL

Blockers by event/form sample:
- `ep_plan_review-20260115-01` / `OP-FM-030`: direct form route opened "Form Not Found".
- `qapi_meeting-20260205-04` / `FRM-QAPI-019`: V3 CES seed required form ID opened "Form Not Found".
- All Q1 events: no eCIgn finalization, admin/supervisor review generation, locked PDF creation, Evidence Center visibility, or Audit Mode package lock was verified.

## Recommended Fix Order

1. Fix eCIgn signed artifact persistence and retrieval first; prove the same signed PDF is stored, reopened, downloaded, printed, and visible after hard refresh.
2. Fix Evidence Center artifact storage/open behavior and metadata-only failures.
3. Fix required form identity mapping so every CES required form opens the correct canonical form instance, not a missing route or unrelated blank template.
4. Fix CES Q1 completion gates, admin/supervisor review task creation, and locked PDF generation.
5. Fix PM API/local fallback CORS behavior and CES calendar runtime crash.
6. Re-run focused Q1 drill and only then re-run the full 28-tester matrix.
7. Clean lint/build gates after the P0/P1 runtime chain is stable.

## Go / No-Go Recommendation

NO-GO.

The next phase should be a P0/P1 compliance-defensibility fix phase focused on eCIgn -> Evidence Center -> Artifact Viewer -> print/download -> Q1 CES completion gates. Do not run a sales/survey demo that claims signed evidence, Q1 completion, or audit readiness until browser evidence proves the full chain.

