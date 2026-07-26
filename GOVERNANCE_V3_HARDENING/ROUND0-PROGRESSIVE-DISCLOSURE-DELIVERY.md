# Round 0 Progressive-Disclosure Final Review

Date: 2026-07-26
Scope: V3 Governing Body Tabletop, Round 0 only
Branch: `codex/governing-body-round0-progressive-disclosure`
Worktree: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\codex-round0-progressive-disclosure`

No commit, push, merge, deployment, remote-branch update, or work outside this worktree was performed. All delivery changes remain uncommitted.

## Delivery Status

The four-stage Round 0 flow has completed its final local intuitiveness and refinement pass and is available at `http://127.0.0.1:5179/governance`.

It is ready for the requested user visual review. It is not represented as production-ready or human-validated because:

- the required moderated study with three independent first-time users has not been conducted;
- the production evidence service remains disconnected from this local exercise path;
- the repository-wide lint and full-suite baselines contain unrelated failures documented below.

## Final Interaction Model

| Before | Final behavior |
| --- | --- |
| Three work columns visible at once | One main task and one compact context rail |
| Criteria, conflicts, disposition, rationale, blockers, and lock controls shown together | Four progressive stages, each exposing one kind of work |
| Learner attestation for system facts | Plain-language packet checks describe what the system found |
| Individual exhibits treated as separate tasks | Authored evidence problems present the relevant records together |
| Board Book search required to infer the comparator | Paired records and differing values appear in the task |
| Disposition shown before evidence review | Board action appears only after all evidence problems are saved |
| Four broad rationale fields | Matter scope, conditional follow-up, and one Board rationale |
| Manual save mixed with autosave | Exact `Saving…`, `Saved just now`/time, and `Draft not saved — Retry` states |
| Generic blocker list | One exact next action |
| Lock control mixed into the work area | Dedicated Board-record review and confirmation dialog |

### Four Stages

1. **Packet Check** shows three plain-language checks and one primary action.
2. **Resolve Evidence Problems** shows one authored record pair at a time, source status, cutoff status, classification, usable record choice, and a short reason.
3. **Board Reliance Decision** uses exactly these neutral choices:
   - `Proceed on all matters — Full reliance`
   - `Proceed only on unaffected matters — Partial reliance`
   - `Do not use this packet — Hold`
4. **Review and Lock** shows the generated Board record, readiness state, one exact incomplete action when required, and a confirmation dialog.

## Final Refinements

- Corrected the seeded-attempt chronology so the case cutoff and every conflict-group cutoff shift with the same authored timeline offset.
- Added plain-language source posture to each paired record, including recovered, supplemental, conflicting, verified, and after-cutoff states.
- Replaced legalistic primary labels with direct task language while retaining precise record content.
- Structured unresolved evidence in the Board record with problem ID, record IDs, cutoff, decision, affected matters, and saved note.
- Added real-calendar validation for due and return dates with inline alerts and `aria-invalid`.
- Added reliable save-failure detection, retry, page-hide flush, and exact save status language.
- Added `Resume` and protected `Start over`; restarting clears only the selected assignment draft.
- Preserved stage, problem, answers, and rationale across back, exit, reload, and resume.
- Added initial dialog focus, focus trapping, Escape dismissal, and trigger-focus restoration.
- Tightened narrow-mobile spacing so the Stage 1 action remains visible at `390×844`.
- Corrected the command-bar identity label contrast after axe identified one serious color-contrast violation.

## Cognitive Walkthroughs

Three independent GPT-5.6-sol evaluators using medium reasoning reviewed the final-round task as separate personas. These are AI cognitive walkthrough estimates, not observed human-participant metrics and not a substitute for the required moderated gate.

| Evaluator | Persona | First correct action | Wrong clicks | Backtracks | Estimated completion | Confidence |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| A | Nontechnical first-time Board member | 8–15 sec | 0–1 | 1–2 | 10–15 min | 3/5 |
| B | Busy executive at `1024×768` | 6–10 sec | 0–1 | 1–2 | 9–14 min | 3/5 |
| C | Compliance-oriented reviewer | 6–10 sec | 0–1 | 1–2 | 8–12 min | 2.5/5 |

Their convergent findings drove the final changes: exact disposition language, consistent cutoffs, visible source posture, actions above the fold, plain-language commands, record traceability, inline date errors, focus restoration, and explicit recovery status.

## Browser Verification

Verified against the isolated local app:

- fresh Q1 state starts at Stage 1 and clears only through the protected Q1 `Start over` action;
- Stage 1 exposes one primary action and no decision/rationale controls;
- Stage 2 opens the authored CAP pair and preserves each saved answer;
- Stage 3 is unavailable until every evidence problem is complete;
- no disposition is recommended or preselected;
- back navigation preserves Stage 3 scope, follow-up, and rationale;
- refresh returns through Hub `Resume` to the same saved evidence problem and content;
- exit flushes the draft before returning to the Hub;
- invalid calendar dates render inline errors;
- Stage 4 renders the Board record before lock;
- the lock dialog starts on Cancel, traps focus, closes on Escape, and restores focus to the lock trigger;
- all required viewports have zero page-level horizontal overflow.

Required viewport matrix:

| Viewport | Result |
| --- | --- |
| `1440×900` | Pass |
| `1024×768` | Pass |
| `820×1180` | Pass |
| `390×844` | Pass |
| `320×700` | Pass |

## Accessibility

Automated axe scans ran against all four stages with WCAG 2 A/AA and WCAG 2.1 A/AA tags. Final result: zero serious or critical violations.

Keyboard verification covers:

- keyboard activation of the Stage 1 primary action;
- labeled radios, checkboxes, text inputs, and textareas;
- stage-heading focus;
- lock-dialog initial focus;
- focus containment;
- Escape dismissal;
- trigger-focus restoration.

No dedicated human screen-reader session was performed.

## Automated Results

### Round 0 Unit and Component Tests

Command:

```text
npx vitest run src/v6/screens/governance/v33/tabletop2026/tests
```

Result: **PASS — 11 files, 93 tests**.

Coverage includes schema migration, authored conflict contracts, seeded cutoff chronology, first-click disclosure, exact labels, source posture, save/retry states, date validation, one-next-action behavior, Hub recovery, protected restart, record generation, remediation, scoring, and workflow coverage.

### Real-Browser Playwright

Command:

```text
npx playwright test e2e/round0-progressive-disclosure.spec.ts
```

Result: **PASS — 8 tests**.

Coverage includes the five required viewports, zero horizontal overflow, all four axe scans, keyboard lock-dialog behavior, refresh/resume preservation, and deterministic generation of all nine exact-size review screenshots.

The local Playwright Vite server reports an existing shared-`node_modules` font lookup allow-list warning. It does not fail the browser tests, axe scans, or production build.

### ESLint

Changed scope:

```text
npx eslint e2e/round0-progressive-disclosure.spec.ts src/v6/screens/governance/v33/compliance/complianceStore.ts src/v6/screens/governance/v33/tabletop2026
```

Result: **PASS — 0 errors, 0 warnings**.

Repository-wide `npm run lint`: **FAIL — 438 errors, 431 warnings** in unrelated existing workflow, generated, legacy, and application areas.

### TypeScript and Production Build

Command: `npm run build`

Result: **PASS**.

- `tsc -b` passed.
- Vite production build passed.
- 3,320 modules transformed.
- Existing large-chunk and asset-plugin timing warnings remain.
- Zero emitted `.js` files have a `.ts`/`.tsx` sibling under `src/`.

### Full Repository Vitest Baseline

Result: **868 of 870 collected tests passed**; `87` files passed and `16` files were marked failed.

Two unrelated assertion failures remain:

- `src/policy/qapi/qapi.test.ts`: expects legacy `Interim Q2 2026 QAPI` title text.
- `src/v6/screens/pageviews/LoginScreen.visualDelta.test.ts`: expects the legacy `safeReturnTo` symbol.

Fourteen unrelated policy/eCIgn suites are also marked failed by existing collection/runtime errors, primarily root-relative inventory URL fetches under Node. No Round 0 test file failed.

`git diff --check` passed; Git emitted only line-ending conversion notices.

## Review Screenshots

All files are in a nonignored directory and were regenerated from the final source:

1. [Stage 1 desktop — 1440×900](round0-review-artifacts/01-stage1-desktop-1440x900.png)
2. [Stage 2 desktop — 1440×900](round0-review-artifacts/02-stage2-desktop-1440x900.png)
3. [Stage 3 desktop — 1440×900](round0-review-artifacts/03-stage3-desktop-1440x900.png)
4. [Stage 4 desktop — 1440×900](round0-review-artifacts/04-stage4-desktop-1440x900.png)
5. [Stage 2 tablet — 820×1180](round0-review-artifacts/05-stage2-tablet-820x1180.png)
6. [Stage 1 mobile — 390×844](round0-review-artifacts/06-stage1-mobile-390x844.png)
7. [Stage 4 mobile — 320×700](round0-review-artifacts/07-stage4-mobile-320x700.png)
8. [Inline validation error — 1024×768](round0-review-artifacts/08-validation-error-1024x768.png)
9. [Resumed draft — 1024×768](round0-review-artifacts/09-resumed-draft-1024x768.png)

## Exact Changed Files

Production:

- `src/v6/screens/governance/v33/compliance/complianceStore.ts`
- `src/v6/screens/governance/v33/tabletop2026/PacketReadinessGate.tsx`
- `src/v6/screens/governance/v33/tabletop2026/TabletopHub.tsx`
- `src/v6/screens/governance/v33/tabletop2026/TabletopSession.tsx`
- `src/v6/screens/governance/v33/tabletop2026/data/annualCase.ts`
- `src/v6/screens/governance/v33/tabletop2026/data/packetConflictGroups.ts`
- `src/v6/screens/governance/v33/tabletop2026/data/q1Case.ts`
- `src/v6/screens/governance/v33/tabletop2026/data/q2Case.ts`
- `src/v6/screens/governance/v33/tabletop2026/data/q3Case.ts`
- `src/v6/screens/governance/v33/tabletop2026/data/q4Case.ts`
- `src/v6/screens/governance/v33/tabletop2026/engine/attemptVariants.ts`
- `src/v6/screens/governance/v33/tabletop2026/engine/caseTypes.ts`
- `src/v6/screens/governance/v33/tabletop2026/packetReadiness.css`
- `src/v6/screens/governance/v33/tabletop2026/packetReadiness.ts`

Tests:

- `e2e/round0-progressive-disclosure.spec.ts`
- `src/v6/screens/governance/v33/tabletop2026/tests/groupMode.test.ts`
- `src/v6/screens/governance/v33/tabletop2026/tests/packetConflictGroups.test.ts`
- `src/v6/screens/governance/v33/tabletop2026/tests/packetReadiness.test.ts`
- `src/v6/screens/governance/v33/tabletop2026/tests/packetReadiness.usability.test.tsx`
- `src/v6/screens/governance/v33/tabletop2026/tests/records.test.ts`
- `src/v6/screens/governance/v33/tabletop2026/tests/remediation.test.tsx`
- `src/v6/screens/governance/v33/tabletop2026/tests/scoringCriticalFailures.test.ts`
- `src/v6/screens/governance/v33/tabletop2026/tests/tabletopHub.resume.test.tsx`
- `src/v6/screens/governance/v33/tabletop2026/tests/workflowCoverage.test.ts`

Delivery:

- `GOVERNANCE_V3_HARDENING/ROUND0-PROGRESSIVE-DISCLOSURE-DELIVERY.md`
- `GOVERNANCE_V3_HARDENING/round0-review-artifacts/01-stage1-desktop-1440x900.png`
- `GOVERNANCE_V3_HARDENING/round0-review-artifacts/02-stage2-desktop-1440x900.png`
- `GOVERNANCE_V3_HARDENING/round0-review-artifacts/03-stage3-desktop-1440x900.png`
- `GOVERNANCE_V3_HARDENING/round0-review-artifacts/04-stage4-desktop-1440x900.png`
- `GOVERNANCE_V3_HARDENING/round0-review-artifacts/05-stage2-tablet-820x1180.png`
- `GOVERNANCE_V3_HARDENING/round0-review-artifacts/06-stage1-mobile-390x844.png`
- `GOVERNANCE_V3_HARDENING/round0-review-artifacts/07-stage4-mobile-320x700.png`
- `GOVERNANCE_V3_HARDENING/round0-review-artifacts/08-validation-error-1024x768.png`
- `GOVERNANCE_V3_HARDENING/round0-review-artifacts/09-resumed-draft-1024x768.png`

## Remaining Gates

1. Conduct and record the required moderated study with three independent first-time users.
2. Connect and verify the production evidence service before release claims.
3. Resolve repository-wide lint and full-suite baseline failures in separately scoped work.
4. Commit, push, merge, or deploy only under a separate explicit instruction.

READY FOR USER VISUAL REVIEW
