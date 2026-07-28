# V3 Executive Readiness OS Delivery

Generated: 2026-07-27

## Boundary And Git State

- Worktree: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\codex-governing-body-v3-executive-readiness-os`
- Branch: `codex/governing-body-v3-executive-readiness-os`
- Base commit: `57ede94b84bfadac3f110bce7faabe3e48de969f`
- **Delivery commit: `957a81b43cc72feb99f752ff92f7a098424488fb`** (`feat(governance): add executive readiness OS controls`, committed 2026-07-27T18:45:10-07:00) — **committed AND pushed** to `origin/codex/governing-body-v3-executive-readiness-os`. An earlier draft of this report claimed the changes were left uncommitted and that no remote operation occurred; that was inaccurate once the commit landed and is corrected here.
- Post-review remediation commits on this branch (see “Post-Review Blockers” below): `d2e3faf5` (scoring scale + identity binding, evidence outcome, 17 boundary/identity tests), `f602025b` (in-portal reference documents), `ee1c638a` (live executive actions, deterministic brief, provenance-projected oversight, handbook disclosure, evidence schema v2 + service-boundary identity).
- **Remote status at report time:** `origin/codex/governing-body-v3-executive-readiness-os` fast-forwarded `957a81b4..ee1c638a` (pushed 2026-07-27, verified in the push output). The pushed head for independent GitHub review is **`ee1c638a`** plus this report-stamp commit.
- **Verification at head:** `tsc --noEmit -p tsconfig.app.json` = 0 errors; `vitest run src/v6/screens/governance/v33/` = **157/157 passing** (includes the 949/950 and 969/970 scoring-boundary tests, failed-outcome-never-completes, critical-error override, cross-learner isolation, demo-identity and subject-mismatch write rejection, facilitated-namespace acceptance, unscored `completed` semantics, and the executive-actions suite). Live dev-build UAT confirmed the renamed brief, Oversight provenance badges/legend with Q3–Q4 “Not recovered,” the collapsed handbook findings + in-portal reference viewer (zero `governance-references` hrefs), and the scheduler’s fail-closed state.
- **Still disconnected by design (not silent):** official compliance evidence service, server-side Calendar/CES adapter, Google Drive package links, signed evidence export, live QAPI production source, and Brad narrative generation — each surfaced in-UI as a disabled control with its precise reason or an explicit fail-closed message.
- **Not claimed:** a 10/10 “intuitive without a manual” rating. That requires the moderated usability gate (three people who did not build it completing the defined task list without verbal instructions), which has not been run.
- No merge, deploy, or force-push has been performed. **Integration status: NOT merged** into `feature/governing-body-portal`; this branch is based on `57ede94b` and the feature branch has newer work — integration must go through a fresh integration branch (see “Integration Plan”).
- Preview server for this worktree: `http://127.0.0.1:5180/governance`
- Note: `http://127.0.0.1:5179` was already occupied by `codex-round0-progressive-disclosure`, so this isolated V3 preview was started on `5180` without stopping or overwriting the other server.

## Executive Summary

V3 now opens as a single Executive Readiness Operating System instead of a version picker or legacy V1/V2 portal. The first screen answers the operating question: "What is the current agency status, what blocks readiness, and what must the Governing Body decide?"

The portal now centers seven destinations:

1. Home
2. My Compliance
3. Meetings
4. Decisions
5. Workflows
6. Oversight
7. Evidence / CES

The Round 0 progressive-disclosure gains were preserved while replacing placeholder governance content with source-backed readiness decisions, workflow projections, controlled policy dockets, synthetic QAPI posture labeling, and CES-scoped evidence package projections.

## V1/V2 Removal

- Removed the runtime portal version selection from `GovernanceScreen.tsx`.
- Removed the V1/V2/V3 toggle surface and stale localStorage version state.
- `/governance` now always renders the V3 `MyJourneyApp` inside `.v33-scope`.
- Legacy route intent is preserved by redirecting or mapping old governance destinations into V3 destinations:
  - `/governance/records` -> Evidence / CES
  - `/governance/workflows` -> Workflows
  - `/governance/qapi`, `/governance/oversight`, `/governance/risk` -> Oversight
  - `/governance/meetings`, `/governance/board-books`, `/governance/calendar` -> Meetings
  - `/governance/academy`, `/governance/policies` -> My Compliance subsections

## Brad/Nolan And AI Posture

The Brad brief is explicit and fail-closed:

- Current state: Brad remains local.
- Vertex AI transfer is proposed only.
- Any transfer requires Governing Body approval before implementation.
- Decision #1 is the future Brad/Nolan transfer to Vertex AI under BAA and approved security architecture.
- The UI does not claim that Vertex transfer is live.
- The decision dossier requires BAA, trust-zone, model, logging, rollback, validation, access, and monitoring evidence.

## Decision Docket

The authoritative readiness docket contains eight required decisions in this order:

1. Approve the future transfer of Brad and Nolan to Vertex AI under the approved BAA and security architecture.
2. Set the Agency Readiness Date.
3. Require at least one successful month of full A-to-Z compliance before the Agency Readiness Date.
4. Review and approve the required Policies and Procedures.
5. Complete urgent Employee / Field Workforce Handbook review.
6. Complete Governing Body training and quizzes.
7. Complete 2026 QAPI tabletop exercise.
8. Approve Patient Admission Packet template and registry controls.

Source-derived synthetic QAPI decisions remain subordinate preview material, not production decisions.

## Compliance And Gates

- My Compliance now exposes Required Now, Training Modules, Policies and Procedures, Tabletop Exercises, Annual Attestations, and Completed Evidence.
- Tabletop assignments now include all five 2026 packs: Q1, Q2, Q3, Q4, and Annual.
- Readiness summary logic treats tabletop as available only after non-tabletop requirements are complete, and passed only when all tabletop packs are complete.
- The UI states that official completion is unavailable while the compliance evidence service is not connected.
- Nothing in localStorage is counted as official production evidence.

## Meetings And Calendar Boundary

Meetings were rebuilt around lifecycle, agenda, scheduling, and close requirements instead of a decorative calendar. The page makes the server-side Calendar/CES boundary explicit:

- No browser-direct Google Calendar write is represented.
- Agenda actions are generated from the eight readiness decisions.
- Close requirements include minutes, motion/vote, action owner, due date, evidence package, effectiveness measure, and next return date.

## Workflows

The new Workflows page projects active readiness work from the compiled workflow corpus:

- Due Now
- Readiness Blockers
- Scheduled
- Event-Triggered
- Completed
- Workflow Library

Each workflow exposes owner, due date, source posture, current stage, forms, agenda status, failure conditions, audit requirements, and evidence completeness.

## Oversight And QAPI

Oversight now carries persistent synthetic-data labeling:

- `SYNTHETIC MOCK DATA - 2026 UAT PREVIEW`
- `NOT PRODUCTION - NO REAL PHI`

QAPI preview data is treated as a readiness rehearsal only. The tabletop language now says it is a required Governing Body readiness exercise using the 2026 synthetic QAPI record, and that official completion is recorded through My Compliance.

## Evidence / CES

The old Records destination is replaced by Evidence / CES. The page states that evidence is a projection, not a duplicate store. Evidence packages are scoped with canonical IDs and access posture:

- Brad/Nolan future Vertex transfer decision package
- Controlled Policies and Procedures approval package
- 2026 synthetic QAPI tabletop completion evidence
- Automated Patient Admission Packet template and registry package

The evidence chain shown is:

`Requirement -> Workflow -> Decision -> Agenda item -> Meeting event -> Motion and vote -> Action -> Evidence -> Effectiveness -> Closure`

## Accessibility And Viewport Verification

Playwright captured desktop and mobile screenshots for all seven destinations:

- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-home.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-compliance.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-meetings.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-decisions.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-workflows.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-oversight.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-evidence.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-home.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-compliance.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-meetings.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-decisions.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-workflows.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-oversight.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-evidence.png`

Saved Playwright JSON:

- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/playwright-results.json`

Final Playwright + axe result:

- 14 route/viewport checks passed expected text assertions.
- 0 axe violations on all 14 checks.
- 320px reflow check passed all seven routes.
- 320px reflow check found no horizontal overflow.
- 320px reflow check found 0 axe violations.

Accessibility fixes made during verification:

- Added accessible name to the mobile command/search trigger.
- Replaced nested `aside` landmarks with non-conflicting panels/sections.
- Tightened contrast for required pills, tab counters, meeting badges, decision table labels, QAPI CTA, and dark evidence panels.

## Verification Commands

Passed:

- `npx tsc -p tsconfig.app.json --noEmit`
- `npx eslint src/v6/screens/pageviews/GovernanceScreen.tsx src/v6/screens/governance/v33/MyJourneyApp.tsx src/v6/screens/governance/v33/executiveReadinessData.ts src/v6/screens/governance/v33/compliance/complianceCatalog.ts src/v6/screens/governance/v33/compliance/complianceSelectors.ts src/v6/screens/governance/v33/compliance/complianceGates.test.ts src/v6/routing/routeRegistry.ts`
- `npx vitest run src/v6/screens/governance/v33/compliance/complianceGates.test.ts`
- `npx vitest run src/v6/screens/governance/v33/tabletop2026/tests`
- `npm run build`
- Playwright desktop/mobile screenshots and axe sweep against `http://127.0.0.1:5180/governance`
- Playwright 320px reflow sweep against all seven routes

Also run:

- `npm run lint`

Full repository lint did not pass because of existing broad repo lint failures outside this change set, including `.claude/workflows` parse errors, missing `@next/next/no-img-element` rule definitions in `apps/employee-journey`, and many pre-existing `no-explicit-any` errors in unrelated files. Focused lint on the changed TypeScript/TSX files passed.

## Exact Changed Files

Source and report files:

- `GOVERNANCE_V3_HARDENING/ROUND0-PROGRESSIVE-DISCLOSURE-DELIVERY.md`
- `GOVERNANCE_V3_HARDENING/V3-EXECUTIVE-READINESS-OS-DELIVERY.md`
- `src/v6/routing/routeRegistry.ts`
- `src/v6/screens/governance/governance-office.css`
- `src/v6/screens/governance/v33/MyJourneyApp.tsx`
- `src/v6/screens/governance/v33/compliance/compliance.css`
- `src/v6/screens/governance/v33/compliance/complianceCatalog.ts`
- `src/v6/screens/governance/v33/compliance/complianceGates.test.ts`
- `src/v6/screens/governance/v33/compliance/complianceSelectors.ts`
- `src/v6/screens/governance/v33/executiveReadinessData.ts`
- `src/v6/screens/governance/v33/v33-globals.css`
- `src/v6/screens/pageviews/GovernanceScreen.tsx`

Verification artifacts created:

- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-home.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-compliance.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-meetings.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-decisions.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-workflows.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-oversight.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/desktop-evidence.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-home.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-compliance.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-meetings.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-decisions.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-workflows.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-oversight.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/mobile-evidence.png`
- `GOVERNANCE_V3_HARDENING/screenshots/v3-executive-readiness-os/playwright-results.json`

## Post-Review Blockers (found in owner review of `957a81b4`) and remediation

The earlier statement "No remaining code blocker was found" was wrong. The owner review of
commit `957a81b4` identified real code blockers. Their status on this branch:

1. **Failed tabletop could count as complete (critical).** The catalog assigned a 95-point
   (percent-scale) pass standard while the 2026 engine scores out of 1000, so a failed
   900/1000 attempt satisfied `900 >= 95`. **FIXED in `d2e3faf5`:** standards now use the
   engine unit (950 quarterly / 970 annual), the evidence contract carries a required
   engine-decided `outcome: 'passed' | 'failed'`, completion requires `outcome === 'passed'`
   (fails closed when absent), critical errors override any score, and boundary tests prove
   949/950 and 969/970 plus failed-never-completes.
2. **Evidence not bound to the authenticated user (critical).** `gb-chair-local` was the
   learner for variants and official submissions, and completion matched on assignmentId
   alone. **FIXED in `d2e3faf5`:** `useLearnerId()` threads the authenticated subject through
   catalog → assignment → variants → evidence save → completion selector; lookups match
   assignmentId AND learnerId; the local-demo id is preview-only and is rejected on every
   official evidence write.
3. **Dead executive actions** (dossier action row, Add to agenda, ad hoc scheduler, workflow
   actions incl. the DECISIONS[0] bug, Evidence/CES buttons). **FIXED in the UI-actions
   commit:** every enabled action now performs a real action, navigates to a real
   destination, or is visibly disabled with a precise reason; the scheduler fails closed with
   an explicit "no event was created" state and never fabricates a calendar result.
4. **"Brad's brief" was not generated by Brad.** **FIXED:** renamed to "Verified Governing
   Body Readiness Brief," labeled as deterministically assembled from portal records with
   Brad narrative generation not connected.
5. **Oversight KPIs were hand-authored.** **FIXED:** oversight values are projected from the
   normalized QAPI/case sources and every value carries a provenance label (Source recovered /
   Calculated from recovered source / Supplemental synthetic UAT / Management-reported and
   unresolved / Not recovered); Q3/Q4 pending normalization is represented as Not recovered
   rather than invented.
6. **GB reference documents were world-readable under `/public`.** **FIXED in `f602025b`:**
   both controlled documents render only inside the authenticated portal via the sandboxed
   in-portal viewer; decisions carry a reference descriptor, not a public URL.
7. **Handbook drawer density.** **FIXED:** two-paragraph executive summary always visible,
   detailed findings collapsed behind "View detailed legal and compliance findings," with
   source/draft/counsel-status actions.

## Integration Plan (do not merge blindly)

This branch is based on `57ede94b`; `feature/governing-body-portal` has substantial newer
work. Integration must: create a fresh integration branch from the latest
`feature/governing-body-portal`, port the Round 0 and Executive Readiness commits in order,
resolve conflicts deliberately, and confirm the Taylor RN resource cards stay removed, the GB
references stay on the correct decisions, newer Employee Journey/backend work remains intact,
all five tabletop assignments stay registered, V3 remains the only governance portal, and the
focused + full test suites pass.

## Remaining Work

Operational readiness remains intentionally blocked until real-world prerequisites are completed:

- Governing Body approval of the future Brad/Nolan Vertex architecture.
- BAA, security architecture, trust-zone, logging, rollback, validation, and monitoring evidence for that future AI transfer.
- Official compliance evidence service connection.
- Live production QAPI data source connection.
- Handbook legal/compliance review and approval.
- Real CES/Calendar production integration verification.
- Sustained 30-day A-to-Z compliance gate evidence.
