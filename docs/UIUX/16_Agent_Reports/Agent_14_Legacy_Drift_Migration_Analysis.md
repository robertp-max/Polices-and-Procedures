# Agent 14: Legacy Code Debt, Drift & Migration Progress Analysis

**Subagent:** 14 — Legacy Code Debt, Drift & Migration Progress Specialist  
**Primary Lens:** Pre-canonical ("old") UI surface area still resident in `src/`, success of deprecation/wrapping, real (not aspirational) migration velocity.  
**Date:** 2026-05-17  
**Reference Artifacts:** `UI_PRIMITIVE_OWNERSHIP_MAP.md` (root), `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation/LEGACY_DEPRECATION_MATRIX.md`, `Legacy_Cleanup_and_Migration_Guardrails.md`, `Phases_234_Catchup_Reality_Report.md`, `Phase2_No_Visible_Changes_Root_Cause_Report.md`, `Phase4_Current_Reality_Report.md`, `eslint.config.js`, `src/` tree scans.  
**Unique Legacy Lens Insight:** The existing Implementation program has constructed a high-quality parallel canonical universe (new `ui/` primitives + shell) while leaving the original production UI largely intact and dominant. This is classic "parallel code debt" — visible progress in docs and new files, near-zero contraction of legacy surface area. The "Phase2_No_Visible_Changes" and "catch-up reality" reports are direct symptoms: new layers were mounted but old rendering paths, tokens, and component families continue to control what users actually see and what most developers maintain. Physical removal (the only true measure of migration success) has not occurred.

---

## 1. Current Debt Inventory (Ground-Truth Snapshot)

### 1.1 Active Legacy UI Families Still Shipping in Production Paths

**Card / Surface Families (highest volume debt)**
- `SCard` + `GenericSectionPanel` (defined and ~25+ usages inside `src/policy/components/SharedPolicyDetailView.tsx` — the dominant policy detail renderer still on routes `/library/:policyId`, `/policies/:policyId`, `PolicyDetailPage`).
- `CesCard` family (core definition `src/policy/ces/components/primitives.tsx`; consumed by `ComplianceCalendar.tsx`, `CesExecutiveDashboard.tsx`, `ExecutiveReports.tsx`, `WorkloadDistribution.tsx`, `SprintExecutionBoard.tsx` and CES pages).
- `PmTaskCard` + draggable variants (`src/policy/components/pm/PmTaskCard.tsx`, `PmViews.tsx`, `MyTasksPmPage.tsx` — primary PM task surfaces).
- Local `TaskCard` implementation (`DashboardPage.tsx` lines ~769-783).
- GVGB-local card patterns (`bg-white shadow-sm rounded-xl` + custom divs in `GVGBDetailView.tsx:225`, `GVGBPrintDocument.tsx`, `GVGBAppendixPrint.tsx`).
- Staffing local card ecosystem (`ClinicianCard`, `PatientCard`, `ShiftNeedCard`, `ShiftCard` etc. in `src/policy/staffing/components/` — 14 files total, many with bespoke styling).

**Tabs / Segmented Control Families**
- `TabButton` + internal tab state (`src/policy/components/regulatory/WorkflowExecutionPanel.tsx` — 4+ TabButton definitions, heavy usage on audit workflow surfaces).
- Custom tab implementations (`FrameworkPage.tsx` activeTab state + button groups; duplicate patterns in `SharedPolicyDetailView`, `DemoPage`, `iAdministrator/components/StudioTabs.tsx`).
- Journey V1 and older onboarding tab/carousel logic.

**Badge / Status / Indicator Families**
- Legacy `StatusBadge.tsx` (`src/policy/components/StatusBadge.tsx` — hardcoded hex/rgba lifecycle colors; appears dead in import graph but remains in tree).
- Regulatory domain/urgency primitives (`src/policy/components/regulatory/Primitives.tsx` — `DomainDot`, `DomainBadge`, `UrgencyChip`, `PolicyRef`, `EvidenceStatusDot` with palette maps).
- CES-specific badges and indicators (inside `ces/components/primitives.tsx`).
- Staffing badge zoo (`RiskBadge`, `DisciplineBadge`, `CredentialBadge`, `AcuityBadge`, `ShiftStatusChip`, `StatusBadge` wrapper in `staffing/` — multiple parallel tone mappers).
- Scattered `CiStatusBadge` vs. local re-implementations (only partial migration in attested surfaces + staffing wrapper).

**Other Major Redundant Families**
- Local drawer/sheet implementations (pre-`ShellMobileDrawer` / `RightDrawer` / `BottomSheetDrawer` patterns still present in `FormSigningWorkspace.tsx`, `iAdministrator/`, regulatory drawers, journey modals).
- Multiple loading/empty/spinner variants (pre-`LoadingState`/`EmptyState`).
- KpiTile, EventChip, TimelineMonth, MonthGrid, LockBadge, Toast, BlockerPanel, ApprovalFlow (regulatory/ and ces/ — duplicate semantics to canonical `SurfaceCard` + `CiStatusBadge` + `KpiTile` patterns in onboarding-v2).
- iAdministrator entire bespoke UI system (~25 components + lib/ in `src/policy/pages/iAdministrator/` — full custom command bars, scenario engines, reference cards, emergency banners, form renderers; routed at `/iadministrator` behind role gate).
- Demo / staging surfaces (`DemoPage.tsx`, `DemoPhase2.tsx`, `DemoPhase3.tsx`, `BradProposal/`, `HubstaffStagingPage.tsx`, `FrameworkPage.tsx`, `SystemDocumentationPage.tsx`, `MasterControlInventoryPage.tsx` — all contain legacy tab/card/button chrome).
- Journey V1 cinematic glass cards and large monolithic pages (`OnboardingV1JourneyPage.tsx` 2700+ LOC).
- Specialized print/detail (`GVGB*` files, `FormPrintView`, `PrintPage`, `FormViewer` custom sections).

### 1.2 Orphaned / Dead-but-Present Files in src/ Tree (Immediate Deletion Candidates)
- `src/policy/pages/DashboardPage.tsx.backup`
- `src/policy/pages/MasterCalendarPage.tsx.backup`
- `src/policy/pages/TaxonomyPage.old.tsx` (664 LOC, still triggers glass-stack-budget in verifiers; exempt-listed in `scripts/verifyUiDesignSystem.ts` and `eslint.config.js` but never deleted)
- `vercel.json.bak` (root)
- Additional historical references in `Builder/`, `Bin-(thrash)/`, `_Heavy/` (out of scope but indicate pattern of non-deletion)

**Total .tsx count in src/**: 233 files. Conservative estimate: 110–140 files participate in or depend on pre-canonical UI families (including the large iAdministrator, journey-v1, ces, pm, regulatory, staffing, and shared detail modules). Only the shell layer (`CommandCenterLayout` + 6 Shell* primitives) is universally adopted.

### 1.3 Quantitative Drift Indicators (from scans + reality reports)
- Canonical `ui/` primitive imports: only ~15 unique consumer files (Dashboard, MasterCalendar, EvidenceCenter, Library, Forms, MyTasks, PmViews, TaskDetailRightPanel, a few iAdmin/CES files). <10% surface adoption.
- `SurfaceCard` / `GlassPanel` / `CiStatusBadge` / `Tabs` (ui) usages: concentrated in <15 files total.
- Raw visual violations (hex/rgba/arbitrary Tailwind opacity): 326 across 57 files outside the 7 Phase 3 attested files (per `Phases_234_Catchup_Reality_Report.md`).
- ESLint guard: ERROR only on 7 attested files; WARN on the rest + explicit ignore for `*.old.tsx`.
- No legacy family has zero references after a deprecation sprint; no physical file deletions of the families listed in `LEGACY_DEPRECATION_MATRIX.md`.

### 1.4 Legacy Conditional / Backcompat Paths Still Exercised
- Numerous `legacy*` helpers in stores (`regulatoryExecutionStore.ts`, `taskIdentity.ts`, `compliance-execution/*`) — data-level, not UI, but illustrate the pattern of "keep the old path alive".
- Feature flags primarily protect new behavior; no aggressive "remove legacy UI after date" flags.
- `TaxonomyPage.old.tsx` has zero active route imports but remains in tree and verifier exempt list.

---

## 2. Honest Assessment: Have Existing Plans Actually Reduced Surface Area?

**Short answer: No. They have added a high-quality parallel codebase and documentation of intent, but legacy surface area has contracted only marginally (primarily the shell chrome and token hygiene on 7 files).**

- **LEGACY_DEPRECATION_MATRIX.md**: Excellent mapping. Remains "Open" status for virtually every row. No follow-through deletions.
- **Legacy_Cleanup_and_Migration_Guardrails.md** (incl. Appendix A v2.0): Delivered scoped ESLint + PR template + one migration script for `WorkflowExecutionPanel`. The broader rollout (P4-DEBT-01) and visual regression gates are explicitly deferred. The document itself admits "was a plan, not delivered" in its honesty correction.
- **Phase plans / checklists / ownership map**: Repeatedly optimistic ("complete", "zero raw matches") until reality reports corrected them. Phase 2 shell work succeeded in mounting primitives but failed to deliver visible change because of inline overrides (later fixed), missing tokens (later added), dual theme stores (`useShellStore` vs `useCiModeStore`), and the fact that 90%+ of page content still bypasses the new primitives.
- **Resulting velocity**: New code velocity high; legacy removal velocity ~0%. The program is in "catch-up reality" because each phase declared victory on new artifacts while the production `src/policy/pages/*`, `ces/*`, `pm/*`, `regulatory/*`, `staffing/*`, `journey/*`, `iAdministrator/*` trees continued to grow or remain unchanged in legacy footprint.
- **Why this lens explains the symptoms**: "Phase2_No_Visible_Changes" = new shell + primitives existed in the bundle but were either overridden or not composed by the actual page bodies. "Catch-up" = later agents discovered the attestation gaps and 326 violations because the migration never touched the bulk of the code.

**Core failure mode (unique to legacy lens):** The guardrails, matrices, and catalogs are themselves living documentation debt — they describe the desired state without enforcing the contraction of the undesired state. Until deletion is the success metric (not "wrapped", "flagged", or "attested"), drift will persist and every new surface will add to the problem.

---

## 3. Files & Code Paths That Must Be Deleted for a Complete Migration

**Immediate purge set (zero-risk, non-production or confirmed dead):**
- All `*.backup` and `*.old.tsx` in `src/policy/pages/`
- `src/policy/components/StatusBadge.tsx` (no active imports)
- `src/policy/pages/iAdministrator/` (entire subtree — 1 index + 25 components + lib/)
- `src/policy/pages/BradProposal/`
- `src/policy/pages/DemoPage.tsx`, `DemoPhase2.tsx`, `DemoPhase3.tsx`
- `src/policy/pages/FrameworkPage.tsx`, `HubstaffStagingPage.tsx`, `SystemDocumentationPage.tsx`, `MasterControlInventoryPage.tsx`
- `src/policy/pages/GVGBDetailView.tsx`, `GVGBPrintDocument.tsx`, `GVGBAppendixPrint.tsx` (if canonical detail/print now covers them)
- Specialized non-prod: parts of `FormPrintView.tsx`, `PrintPage.tsx` if superseded

**Family deletion targets (after migration sprints):**
- `src/policy/ces/components/primitives.tsx` (after CesCard → SurfaceCard everywhere)
- `src/policy/components/pm/PmTaskCard.tsx` + supporting pm/ local cards (after migration to ui/)
- `src/policy/components/regulatory/Primitives.tsx` (merge or delete after consumers use canonical)
- Large refactors (partial deletion of legacy sections): `SharedPolicyDetailView.tsx` (remove SCard/GenericSectionPanel), `WorkflowExecutionPanel.tsx` (remove TabButton), `FormSigningWorkspace.tsx`, `DashboardPage.tsx` (remove local TaskCard), many ces/ and staffing/ files.
- Journey V1 monolithic files once V2 + shell is the only path.
- Orphaned journey components, old regulatory subcomponents.

**Estimated impact of full purge:** 40–70 files removed or heavily slimmed; legacy LOC reduction 25–45% of current UI surface (rough, based on file sizes of the above). Shell + ui/ would then be the sole source of truth.

---

## 4. Recommended Next Actions (Pre-Plan Inputs)

1. Run exhaustive import + definition grep for every family in the matrix (update with exact ref counts and LOC).
2. Add `no-legacy-family-import` ESLint rule (or extend existing) that errors on new code touching the families above.
3. Instrument a `npm run legacy:inventory` script that reports current % legacy surface (files containing non-ui/ card/tab/badge patterns).
4. Decide permanent fate of iAdministrator / demo surfaces (permanent devSurface gate + eventual archive, or delete).
5. Align with Design System owner on which regulatory/ces/pm patterns deserve promotion to `ui/` before purge.

This analysis is the single source of truth for the true state of legacy debt. All prior "complete" claims are superseded by the physical reality in `src/`.

---

**End of Agent 14 Analysis** — Legacy lens applied. The codebase has built the future without retiring the past.