# Phases 2-3-4 Catch-up Reality Report

**Program:** Care Indeed Home Health UI/UX Reconstruction
**Date:** 2026-05-19
**Author:** Phase 2-3-4 catch-up execution pass (code-level verification)
**Supersedes:** the optimistic "Status: complete" framing in older versions of
`Phase4_Final_Readiness_Package.md`, `Phase3_Exit_Criteria_Checklist.md`, and
the five Phase 4 sibling reports — where their content conflicts with the
ground truth below, this document wins.

> This document is the single point of truth across Phases 2, 3, and 4 as of
> 2026-05-19. It does not duplicate the per-phase exit checklists; it
> reconciles them, corrects two material misstatements in the previous
> aggressive prompt, quantifies remaining debt, and assigns explicit owners
> for every open item. No checkbox below is ticked unless the evidence in
> §6 supports it.

---

## 1. Headline State (One Line Per Phase)

| Phase | Honest state | Confidence |
|---|---|---|
| **Phase 1** — Canonical Design System Lock | Complete | High (token contract v0.2.0-phase1 locked, generators + generated CSS shipped) |
| **Phase 2** — Core Shell & Command Center Rebuild | Code-complete v1.4 (Appendix C closed). Playwright baselines + human sign-off **deferred** | High on code; baselines outstanding |
| **Phase 3** — Operational Surface Reconstruction | Token-clean + ESLint-enforced **on 7 attested files only** (v2.3). Broader codebase still carries **326 design-system violations across 57 files** | High — measured |
| **Phase 4** — Experience Maturity & Finalization | Code-side prerequisites + scoped guardrails in place (v2.0 §7). All 13 human/QA items genuinely open. Broader cleanup (P4-DEBT-01) explicitly out-of-scope and now surfaced via WARN-level ESLint rule | High |

---

## 2. Two Material Corrections to the Aggressive Catch-up Prompt

The follow-up prompt that triggered this session contained two factual
errors that, if executed against, would have introduced regressions or
faked-completion patterns. They are corrected here so no future pass acts
on them.

### 2.1 "ShellContentFrame adoption on Evidence/Audit/Calendar/CES pages" — **not an open item**

`src/policy/components/CommandCenterLayout.tsx` line 377 already wraps
every routed page in `<ShellContentFrame>` at the shell layer. Verified
2026-05-19:

```
grep ShellContentFrame src/policy/components/CommandCenterLayout.tsx
  L23   import { ..., ShellContentFrame, ... } from '@/policy/components/ui';
  L371  // └─ ShellContentFrame (glass canvas, in-flow)
  L377  <ShellContentFrame
  L913  </ShellContentFrame>
```

The only page that adds a **second, inner** `<ShellContentFrame>` is
`DashboardPage.tsx` (lines 413 + 506). That is a redundancy / intentional
double-glass pattern (open architectural question — see §4 "SCF-DUP")
**not** a missing adoption on the other surfaces.

**Action this session:** documented as an open architectural question
assigned to UI Primitives team. No code change.

### 2.2 "Expand the ESLint rule" — must NOT be done as a flat ERROR rule

Promoting the existing 4-selector `no-restricted-syntax` rule from the
7-file attested scope to the full `src/policy/**` glob would convert
**326 existing violations across 57 files** into hard CI failures
overnight. That is the exact pattern that produced the v1.0 / v2.2
over-claim cycle (a sweeping promise the codebase cannot back). Done
honestly, it is a phased multi-PR program tracked as **P4-DEBT-01**.

**Action this session:** the same 4 selectors have been added to a
second, separate flat-config block scoped to `src/policy/**/*.{ts,tsx}`
(excluding the attested 7 + `*.old.tsx`) at **WARN level**, so the 326
violations are now visible in lint output without breaking the build.
The ERROR rule on the attested 7 remains untouched. The phased rollout
plan is §5 of this document.

---

## 3. Phase 2 — Final Hygiene (Package 1)

| Item | State | Evidence | Owner / target |
|---|---|---|---|
| Canonical `--ci-color-glass-*` contract declared in all 3 theme blocks | ✅ Complete | `src/index.css` Appendix C tokens | — |
| `CommandCenterLayout` inline-style override on `<ShellContentFrame>` removed | ✅ Complete | `Phase2_Exit_Criteria_Checklist.md` Appendix C | — |
| All shell primitives paint from CSS vars only | ✅ Complete | `ShellTopbar.tsx`, `ShellNavRail.tsx`, `ShellContentFrame.tsx` | — |
| Account menu / splash / mobile tabbar / CTA register token migration | ✅ Complete (P3-CL-05) | `Phase2_Exit_Criteria_Checklist.md` v1.4 §3 | — |
| `Token_Application_Matrix_Shell.md` v1.4 with new shell/CTA token rows | ✅ Complete | Matrix §2.5–§2.8 | — |
| **C1** — Playwright shell visual baseline regeneration | ⏳ **Deferred** | Procedure in `Phase2_Exit_Criteria_Checklist.md` Appendix A | Engineering / QA — next dev cycle |
| Design Lead + Accessibility Lead human sign-off (P3-SO-01/02) | ⏳ **Deferred** | — | Design Lead, Accessibility Lead |

**Phase 2 conclusion:** Code-complete. The two open items are
human/QA-only and cannot be honestly closed by any non-interactive
coding pass. The current `Phase2_Exit_Criteria_Checklist.md` v1.4
accurately reflects this state — no rewrite required.

---

## 4. Phase 3 — Real Completion State (Package 2)

### 4.1 Attested-clean scope (machine-enforced)

The 7 files listed in `eslint.config.js` `PHASE3_V22_ATTESTED_FILES`:

```
src/policy/pages/EvidenceCenterPage.tsx
src/policy/pages/MasterCalendarPage.tsx
src/policy/pages/AuditModePage.tsx
src/policy/components/regulatory/WorkflowExecutionPanel.tsx
src/policy/components/regulatory/ComplianceCalendar.tsx
src/policy/ces/components/review/RobertCesReviewLayer.tsx
src/policy/ces/components/review/CesRoleReviewSwitcher.tsx
```

Status: **ERROR-level enforced, 0 violations.** This is the v2.3
attestation in `Phase3_Exit_Criteria_Checklist.md`.

### 4.2 Out-of-attestation debt (NEWLY MEASURED — 2026-05-19)

The full grep across `src/policy/**/*.tsx` (excluding `*.old.tsx` and
the 7 attested files) found:

- **326 violation lines**
- **57 distinct files**

Top 10 offenders (full list in Appendix A of this document):

| # | Hits | File |
|---|---:|---|
| 1 | 25 | `src/policy/components/MasterControlInventory.tsx` |
| 2 | 25 | `src/policy/journey/pages/StagingM01Page.tsx` |
| 3 | 18 | `src/policy/components/regulatory/WorkflowDrawer.tsx` |
| 4 | 16 | `src/policy/components/regulatory/EventWorkspace.tsx` |
| 5 | 15 | `src/policy/components/regulatory/BlockerPanel.tsx` |
| 6 | 14 | `src/policy/pages/iAdministrator/components/ReferenceCards.tsx` |
| 7 | 13 | `src/policy/pages/iAdministrator/index.tsx` |
| 8 | 13 | `src/policy/pages/iAdministrator/components/RightPanelPreview.tsx` |
| 9 | 11 | `src/policy/pages/DemoPage.tsx` |
| 10 | 10 | `src/policy/pages/iAdministrator/components/ChatThread.tsx` |

The next 12 files (iAdministrator components, FrameworkPage, FormsPage,
ModalShell, FrameworkShowcase) account for another ~75 violations. The
remaining 35 files carry 1–5 each.

### 4.3 SCF-DUP — open architectural question

`DashboardPage.tsx` wraps its content in a second inner
`<ShellContentFrame>` even though the shell layer already provides one.
Two coherent resolutions exist, both legitimate:

- **A) Detail-frame pattern.** Promote the inner Dashboard frame to a
  documented "detail frame" pattern (with `detail={true}`) and roll it
  to other surfaces that want a stronger glass-on-glass focus.
- **B) Remove the inner frame.** Treat the duplication as a Phase 2
  carry-over and rely on the shell-level frame only.

**Owner:** UI Primitives team. **Decision needed before:** any further
operational-surface restyling.

### 4.4 Phase 3 corrected status

`Phase3_Exit_Criteria_Checklist.md` v2.3 (existing) is honest **for the
attested 7-file scope**. No further rewrite is needed *for that scope*.
The 326-violation debt outside that scope is owned by P4-DEBT-01 and is
explicitly acknowledged here; it must not be retroactively claimed as
"Phase 3 complete" in any future revision.

---

## 5. Phase 4 — Honest State (Package 3 + 4)

### 5.1 Already delivered in the 2026-05-18 closure session (verified, untouched)

Per `Phase4_Final_Readiness_Package.md` v2.0 §7.1 — re-verified
2026-05-19:

- ESLint design-system guardrails (4 selectors) — ERROR on 7 attested files.
- PR template Phase 4 Closure section (5 checkboxes).
- Hover-state utility classes in `src/index.css` (`ci-bg-overlay-*-hover`, `ci-border-overlay-hover`).
- `MasterCalendarPage.tsx` (3), `AuditModePage.tsx` (11), `WorkflowExecutionPanel.tsx` (47), `RobertCesReviewLayer.tsx` (1) token migrations.
- Idempotent migration script `scripts/phase4-migrate-workflow-execution-panel.cjs`.
- `Phase3_Exit_Criteria_Checklist.md` v2.3 correction addendum.
- Honest retraction notes + Appendix Z evidence rows on all five Phase 4 sibling reports.

### 5.2 Delivered NEW in this 2026-05-19 catch-up pass

| # | Deliverable | File | Type |
|---|---|---|---|
| 1 | This catch-up reality report | `Phases_234_Catchup_Reality_Report.md` | NEW |
| 2 | Non-breaking WARN-level broader ESLint rule (visibility for the 326 latent violations) | `eslint.config.js` — 2nd flat-config block | EDIT |
| 3 | PR template — link to this catch-up report + WARN-rule note | `.github/PULL_REQUEST_TEMPLATE.md` — Phase 4 Closure section | EDIT |

### 5.3 Genuinely deferred (P3-SO-01..04 + P4-* tickets)

The list below is identical in substance to
`Phase4_Final_Readiness_Package.md` v2.0 §7.3. No item has been ticked
since 2026-05-18. Repeating them here so this catch-up report stands
alone.

| ID | Item | Owner | Target |
|---|---|---|---|
| P3-SO-01 | Cross-surface visual + interaction parity sign-off vs Dashboard @ 1440 | Design Lead | Next design cycle |
| P3-SO-02 | Accessibility re-scan (axe + NVDA + VoiceOver) on 6 surfaces | Accessibility Lead | Next A11y cycle |
| P3-SO-03 | `BottomSheetDrawer` full WAI focus-trap + focus-restore | UI Primitives team | Primitive backlog |
| P3-SO-04 | Functional walkthrough on stable build | Product Owner | Next release candidate |
| P4-CS-01 | Cross-surface visual diff vs Top Picks mocks per surface | Design Lead | Next design cycle |
| P4-A11Y-01..03 | H2/H3 + M1..M3 a11y edge cases (`Accessibility_Edge_Cases_Fix_Plan.md`) | Accessibility Lead | Next A11y cycle |
| P4-RP-01 | Playwright regression baseline regeneration @ 375/768/1024/1440/1600 across 6 surfaces | Engineering / QA | Next QA cycle |
| P4-MT-01 | Manual sweep across CI-ION dark / Care Indeed light / Care Indeed dark | Design Lead | Next design cycle |
| P4-MT-02 | Per-surface `prefers-reduced-motion` audit (shell-level already validated) | Engineering | Next eng cycle |
| **P4-DEBT-01** | **326 violations / 57 files broader cleanup** (now WARN-visible) | **Frontend team** | **Phased 3–4 sprints, milestones: see §6 below** |
| P4-VR-01 | Visual regression CI gate | Engineering / QA | Infra decision required |
| P4-PC-01 | Pre-commit hook for `npm run verify:ui` | Engineering | Husky/lefthook decision |
| P4-LDM-01 | `LEGACY_DEPRECATION_MATRIX.md` final reconciliation | Design Lead | Next design cycle |
| SCF-DUP | Resolve `DashboardPage` inner `ShellContentFrame` duplication | UI Primitives team | Before next operational-surface restyle |

---

## 6. P4-DEBT-01 — Phased Rollout Plan (Newly Defined)

The 326-violation cleanup is now visible in `npm run lint` output as
WARNs. To convert these to ERRORs without breaking CI, the work must
proceed in batches by directory cluster. Suggested batching by
structural cohesion:

| Batch | Files | Approx. violations | Suggested owner | Suggested sprint |
|---|---|---:|---|---|
| **B1 — Regulatory drawer trio** | `WorkflowDrawer.tsx`, `EventWorkspace.tsx`, `BlockerPanel.tsx`, `ModalShell.tsx`, `ApprovalFlow.tsx`, `EvidencePanel.tsx`, `HelpArticleView.tsx`, `TimelineMonth.tsx`, `KpiTile.tsx`, `Primitives.tsx`, `EventSyncControl.tsx`, `MonthGrid.tsx` | ~94 | Regulatory eng | +1 |
| **B2 — iAdministrator surface** | `iAdministrator/index.tsx` + 16 components under `iAdministrator/components/` | ~110 | iAdmin eng | +2 |
| **B3 — Master Control + journey + framework** | `MasterControlInventory.tsx`, `journey/pages/StagingM01Page.tsx`, `journey/pages/JourneyHomePage.tsx`, `journey/pages/AppendixFPage.tsx`, `journey/components/EvidenceCapture.tsx`, `FrameworkPage.tsx`, `FrameworkShowcase.tsx`, `LibraryPage.tsx` | ~78 | Platform eng | +3 |
| **B4 — PM + onboarding + misc** | `pm/*.tsx` (5), `onboarding-v2/*`, `DemoPage.tsx`, `DemoPhase2.tsx`, `FormsPage.tsx`, `HubstaffStagingPage.tsx`, `GovernancePage.tsx`, `GVGBPrintDocument.tsx`, `FormSigningWorkspace.tsx`, `SharedPolicyDetailView.tsx`, `UniversalNavControls.tsx`, `ces/components/details/SprintTaskPanel.tsx`, `BradTourAvatar.tsx` | ~44 | Frontend pool | +4 |
| **B5 — Promote WARN→ERROR globally** | `eslint.config.js` change only | 0 (gate flip) | Frontend lead | +5 |

A batch is considered closed when (a) its files report 0 design-system
WARNs and (b) those files are added to a new `PHASE4_DEBT_B<n>_ATTESTED`
list in `eslint.config.js` at ERROR level. B5 deletes both attested
arrays and promotes the rule to flat ERROR across `src/policy/**`.

---

## 7. Verification Gates (2026-05-19)

| Gate | Command | Expected | Actual |
|---|---|---|---|
| Type check | `npx tsc --noEmit --project tsconfig.app.json` | exit 0 | ⏳ run at end of session — see §8 |
| Build | `npm run build` | exit 0 | ⏳ run at end of session — see §8 |
| ERROR rule on 7 attested files | `npx eslint <attested 7>` | 0 design-system errors | ⏳ run at end of session — see §8 |
| WARN rule on broader `src/policy/**` | `npx eslint src/policy --rule '{"no-restricted-syntax":"warn"}'` | 326 warnings | ⏳ run at end of session — see §8 |

§8 is filled in by the closing run after the ESLint + PR-template edits
land.

---

## 8. Closing Run Results — 2026-05-19

| Gate | Command | Result |
|---|---|---|
| ERROR rule on 7 attested files | `npx eslint <attested 7>` | ✅ **0 design-system errors** (other unrelated unused-var / whitespace / react-hooks errors are pre-existing and outside Phase 4 scope) |
| Broader WARN rule (P4-DEBT-01 visibility) | `npx eslint "src/policy/**/*.{ts,tsx}"` | ✅ **356 `no-restricted-syntax` WARNINGS, 0 design-system ERRORS** (the WARN count is ~30 higher than the §4.2 grep figure of 326 because the ESLint rule's `TemplateElement` selector catches `rgba(...)` inside template literals that the plain-text grep missed) |
| TypeScript | `npx tsc --noEmit --project tsconfig.app.json` | ✅ **Exit 0** |
| Build | `npm run build` | ⏳ Not re-run this session (no production-code changes were made; `eslint.config.js` is dev-only and last verified green 2026-05-18 in v2.0 §7.2) |

---

## Appendix A — Full Violation Inventory (57 files, 326 hits)

Sorted descending by hit count. Regex used:

```
rgba\(\s*255\s*,\s*255\s*,\s*255\s*,
| rgba\(\s*0\s*,\s*0\s*,\s*0\s*,
| (?:bg|text|border|hover:bg|hover:text|hover:border|placeholder|focus:border)-white/\[
```

| Hits | File |
|---:|---|
| 25 | `src/policy/components/MasterControlInventory.tsx` |
| 25 | `src/policy/journey/pages/StagingM01Page.tsx` |
| 18 | `src/policy/components/regulatory/WorkflowDrawer.tsx` |
| 16 | `src/policy/components/regulatory/EventWorkspace.tsx` |
| 15 | `src/policy/components/regulatory/BlockerPanel.tsx` |
| 14 | `src/policy/pages/iAdministrator/components/ReferenceCards.tsx` |
| 13 | `src/policy/pages/iAdministrator/index.tsx` |
| 13 | `src/policy/pages/iAdministrator/components/RightPanelPreview.tsx` |
| 11 | `src/policy/pages/DemoPage.tsx` |
| 10 | `src/policy/pages/iAdministrator/components/ChatThread.tsx` |
| 8 | `src/policy/pages/FrameworkPage.tsx` |
| 7 | `src/policy/pages/iAdministrator/components/DemoCriticalOrchestrationPanel.tsx` |
| 7 | `src/policy/pages/FormsPage.tsx` |
| 6 | `src/policy/components/regulatory/ModalShell.tsx` |
| 6 | `src/policy/pages/iAdministrator/components/ScenarioResponse.tsx` |
| 6 | `src/policy/pages/iAdministrator/components/StructuredAnswer.tsx` |
| 6 | `src/policy/pages/iAdministrator/components/AvailableActions.tsx` |
| 6 | `src/policy/pages/iAdministrator/components/CitationChips.tsx` |
| 6 | `src/policy/pages/iAdministrator/components/CommandBar.tsx` |
| 6 | `src/policy/components/FrameworkShowcase.tsx` |
| 5 | `src/policy/components/regulatory/ApprovalFlow.tsx` |
| 5 | `src/policy/pages/LibraryPage.tsx` |
| 5 | `src/policy/pages/iAdministrator/components/ActiveCasePanel.tsx` |
| 5 | `src/policy/components/pm/PmDashboardPage.tsx` |
| 5 | `src/policy/components/SharedPolicyDetailView.tsx` |
| 5 | `src/policy/pages/iAdministrator/components/ScenarioActionSections.tsx` |
| 5 | `src/policy/components/regulatory/EvidencePanel.tsx` |
| 5 | `src/policy/components/FormSigningWorkspace.tsx` |
| 4 | `src/policy/pages/iAdministrator/components/RequirementsSnapshot.tsx` |
| 4 | `src/policy/pages/iAdministrator/components/HealthStrip.tsx` |
| 4 | `src/policy/components/pm/SprintScopeToolbar.tsx` |
| 4 | `src/policy/components/regulatory/HelpArticleView.tsx` |
| 4 | `src/policy/components/regulatory/TimelineMonth.tsx` |
| 3 | `src/policy/pages/iAdministrator/components/FormRenderer.tsx` |
| 3 | `src/policy/components/pm/MyTasksPmPage.tsx` |
| 3 | `src/policy/pages/iAdministrator/components/NoAnswer.tsx` |
| 3 | `src/policy/components/regulatory/KpiTile.tsx` |
| 3 | `src/policy/components/regulatory/Primitives.tsx` |
| 3 | `src/policy/pages/HubstaffStagingPage.tsx` |
| 2 | `src/policy/components/pm/PmFilterBar.tsx` |
| 2 | `src/policy/components/regulatory/EventSyncControl.tsx` |
| 2 | `src/policy/journey/pages/JourneyHomePage.tsx` |
| 2 | `src/policy/components/onboarding/BradTourAvatar.tsx` |
| 2 | `src/policy/components/pm/ApprovalsQueuePage.tsx` |
| 2 | `src/policy/components/regulatory/MonthGrid.tsx` |
| 1 | `src/policy/ces/components/details/SprintTaskPanel.tsx` |
| 1 | `src/policy/pages/iAdministrator/components/RegulatoryAlerts.tsx` |
| 1 | `src/policy/pages/iAdministrator/components/RiskBadge.tsx` |
| 1 | `src/policy/pages/iAdministrator/components/OperationalGaps.tsx` |
| 1 | `src/policy/journey/pages/AppendixFPage.tsx` |
| 1 | `src/policy/onboarding-v2/pages/OnboardingV2Layout.tsx` |
| 1 | `src/policy/components/UniversalNavControls.tsx` |
| 1 | `src/policy/journey/components/EvidenceCapture.tsx` |
| 1 | `src/policy/pages/GVGBPrintDocument.tsx` |
| 1 | `src/policy/pages/iAdministrator/components/DemoCriticalEmergencyResponse.tsx` |
| 1 | `src/policy/pages/DemoPhase2.tsx` |
| 1 | `src/policy/pages/GovernancePage.tsx` |
| **326** | **TOTAL (57 files)** |

---

**End of Phases 2-3-4 Catch-up Reality Report.**
