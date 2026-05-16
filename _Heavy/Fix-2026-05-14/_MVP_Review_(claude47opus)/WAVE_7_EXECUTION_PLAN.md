# Wave 7 — UI/UX Foundation Consolidation — Execution Plan

**Status:** PLAN ONLY — awaiting explicit tranche-execution authorization
**Authored:** 2026-05-16
**Owner (orchestrator):** Claude (assistant)
**Approval prerequisite:** User directive "EXECUTION MODE: LOCKED — WAVE 7 ONLY"
**Anti-prerequisite (binding):** This is **NOT** a redesign wave. **NOT** a creative rewrite. **NOT** a premium polish wave. Only controlled cohesion + primitive normalization.

---

## 0. TL;DR

Wave 7 is a **disciplined consistency pass** layered on top of the stabilized MVP (post Waves 1–5A + artifact-retrieval fix + Wave 6 validation). It strictly observes Lead 16 §14 frozen-file boundaries, reuses existing primitives, and ships in **5 small disjoint tranches** with a full validation gate between each.

| | |
|---|---|
| Approved scope items (user) | 7 (glass-stack, typography, primitive adoption, tokens, mobile, evidence/audit cohesion, loading/empty/status) |
| Mapped to canonical U-XX items | U-06, U-07, U-10, U-13, U-16, U-17 (from `05_UIUX_MIGRATION_TRACK.md`) |
| Tranches | 5 (each ≤ 1 day equivalent; full validation gate between) |
| New primitives required | **0** — every Wave 7 outcome reuses an existing primitive |
| Protected/Frozen files touched | **0** (locked out at plan level — see §10) |
| Validation gates per tranche | 5 (tsc, build, verify:ui, verify:task-identity, verify:alignment, screenshots) |
| Baseline ("before") screenshots | 36 PNGs already captured (18 surfaces × desktop + mobile) — see §11 |
| Rollback unit | One tranche = one logical revert; tranches are independently revertable |

---

## 1. Approved Scope Mapping (User Spec → U-XX → Tranche)

| User Wave 7 scope item | Maps to U-XX (from `05_UIUX_MIGRATION_TRACK.md`) | Wave 7 Tranche |
|------------------------|--------------------------------------------------|----------------|
| 1. Glass-stack normalization | U-13 (residual cleanup) | **T1** |
| 2. Typography consolidation | U-16 (continued, scoped surfaces) | **T3** |
| 3. Primitive adoption | U-10 (RightDrawer width expand), U-17 (LoadingState), EmptyState rollout | **T2** |
| 4. Token consistency | U-06 (continued, scoped surfaces) | **T3** |
| 5. Mobile UX foundation | U-07 (CES + Evidence mobile) | **T4** |
| 6. Evidence/Audit visual cohesion | subset of U-06 + U-07 + primitive rollout on those surfaces | **T2 + T4** |
| 7. Loading / empty / status states | U-17 (LoadingState adoption) + EmptyState rollout | **T2** |

**Tranche-level summary:**
- **T1 — Glass-stack residual cleanup** (~0.5 d): TaxonomyPage.old gating + CommandCenterLayout 1-layer reduction.
- **T2 — Primitive adoption sweep** (~1 d): LoadingState + EmptyState + RightDrawer width-prop adoption across 8 non-frozen surfaces.
- **T3 — Typography + token consolidation (non-frozen surfaces)** (~1 d): PmViews slate-pin removal + scoped hex/rgb migration on 4 non-frozen surfaces.
- **T4 — Mobile UX foundation (CES + Evidence)** (~1 d): touch targets, safe-area, density on 4 non-frozen mobile surfaces.
- **T5 — Loading/empty/status visual cohesion across already-touched surfaces** (~0.5 d): finalize states on surfaces edited by T2–T4.

**Estimated total: ~4 days single-agent equivalent.** No tranche edits the same file as another tranche (disjoint file sets — see §3 ownership map).

---

## 2. Surface Inventory

### 2.1 Wave 7 IN-SCOPE Surfaces (non-frozen, MVP-relevant, visual cohesion target)

| # | Surface | Path | Current state (verify:ui warn count, primitive use, glass layers) | Wave 7 tranche |
|---|---------|------|------------------------------------------------------------------|----------------|
| 1 | `src/policy/components/pm/PmViews.tsx` | `/pm/dashboard`, `/pm/sprint-plan`, `/my-tasks` (Kanban/Gantt/Sprint subviews) | 40 slate-* (slate-pin offender) + 34 typo literals | T3 |
| 2 | `src/policy/components/SharedPolicyDetailView.tsx` | consumed by `PolicyDetailPage` (frozen) — **edit only the non-frozen consumer parts; the component itself is non-frozen** | 130 typo literals, 1 backdrop layer, custom tabs at line ~1482 | T3 |
| 3 | `src/policy/pages/MasterCalendarPage.tsx` | `/calendar` | 25 typo literals | T3 |
| 4 | `src/policy/pages/EvidenceCenterPage.tsx` | `/evidence` | 15 typo literals, 1 backdrop layer, ad-hoc loading | T2 + T4 |
| 5 | `src/policy/pages/FormsPage.tsx` | `/forms` | 19 typo literals (Wave 5A already partially migrated) | T3 |
| 6 | `src/policy/components/CommandCenterLayout.tsx` | shell (every page) | 15 typo literals, **4 backdrop layers (1 over budget)** | T1 (glass-only) |
| 7 | `src/policy/pages/TaxonomyPage.old.tsx` | `/taxonomy` (legacy; Lead 16 C10 = non-production) | 13 backdrop layers (10 over budget) | T1 (deprecate behind devSurface flag) |
| 8 | `src/policy/components/MasterControlInventory.tsx` | `/inventory` | 37 typo literals (Wave 5A already touched lightColorRemap removal) | T3 |
| 9 | `src/policy/pages/AuditModePage.tsx` | `/audit` | Empty-state ad-hoc | T2 |
| 10 | `src/policy/pages/MasterCalendarPage.tsx` | `/calendar` | Loading ad-hoc | T2 (loading only) |
| 11 | `src/policy/pages/iAdministrator/components/RightPanelPreview.tsx` | iAdministrator (non-production per Lead 16) | Mobile-relevant; visual cohesion only | T4 (mobile-only check) |
| 12 | `src/policy/ces/components/board/SprintExecutionBoard.tsx` | CES board | Mobile touch targets | T4 |
| 13 | `src/policy/ces/pages/MyTasksPage.tsx` | `/my-tasks` (CES board) | Mobile touch targets | T4 |
| 14 | `src/policy/pages/MobileIncidentExecutionPage.tsx` | `/calendar/event/...` | Mobile safe-area + density | T4 |
| 15 | `src/policy/components/regulatory/ModalShell.tsx` | modals across app | 2 backdrop layers (within budget; only adopt RightDrawer width prop where applicable) | T2 (verify only — no edit unless beneficial) |

### 2.2 Wave 7 OUT-OF-SCOPE Surfaces (explicitly excluded)

#### 2.2.1 Frozen files (Lead 16 §14) — touched ZERO times in Wave 7

(see §10 for the explicit list)

#### 2.2.2 Non-MVP / explicitly deferred surfaces

| Surface | Reason |
|---------|--------|
| `AchcSurveyAlignmentPage.tsx` | Out-of-MVP-scope (`05_UIUX_MIGRATION_TRACK.md §6`) — post-MVP rebuild |
| `SurveyorPolicyViewerPage.tsx` | Out-of-MVP-scope |
| `PolicyLifecyclePage.tsx` | Out-of-MVP-scope |
| `HubstaffStagingPage.tsx`, `DemoPage.tsx`, `FrameworkPage.tsx`, `iAdministrator/*` page surfaces | Non-production per Lead 16 C10 |
| `OnboardingV2Layout.tsx` (full harmonization) | U-05 belongs to a later wave (originally Wave 4 placement); Wave 7 explicitly limits onboarding to mobile cohesion only on JourneyHomePage |
| `JourneyHomePage.tsx` | Read-only baseline captured; defer typography sweep to post-MVP (high churn risk during onboarding revision) |
| `*.backup`, `*.old.tsx`, `Builder/`, `Bin-*` | Non-production / development artifacts |

#### 2.2.3 Areas categorically out of Wave 7 (per user DO-NOT list)

- eCign packet generation (`buildPrintablePacketHtml`, `captureSignedFormSnapshot`)
- Artifact persistence architecture (`demoEvidenceRuntimeCache`, `indexedDbEvidenceBlobStore`)
- Backend / DocuSign architecture (entire `server/` tree)
- CES workflow logic
- Navigation architecture rewrites
- Broad page rewrites
- Heavy animation systems
- Business logic
- Deferred backend work
- Wave 5B work
- Any "creative" rewrites

---

## 3. Ownership Map (Serialization)

**Single orchestrator** owns this entire wave. **Subagents only used if** explicitly authorized per tranche; if used, they operate strictly on disjoint file sets per the tranche schedule.

### 3.1 Per-tranche file sets (disjoint by tranche)

| Tranche | Files exclusively owned by this tranche | Subagent allocation |
|---------|------------------------------------------|---------------------|
| **T1** | `src/policy/pages/TaxonomyPage.old.tsx`, `src/policy/components/CommandCenterLayout.tsx`, `src/App.tsx` (route-gating), `src/policy/pm/featureFlags.ts` (new `devSurface` flag) | Orchestrator only (CommandCenterLayout is high-traffic) |
| **T2** | `src/policy/pages/EvidenceCenterPage.tsx`, `src/policy/pages/AuditModePage.tsx`, `src/policy/pages/MasterCalendarPage.tsx`, `src/policy/components/regulatory/ModalShell.tsx` (verify-only) + 2–3 RightDrawer consumers (TBD per inventory in T2 kickoff) | Orchestrator + 1 G-class subagent on disjoint surfaces |
| **T3** | `src/policy/components/pm/PmViews.tsx`, `src/policy/components/SharedPolicyDetailView.tsx`, `src/policy/pages/FormsPage.tsx`, `src/policy/components/MasterControlInventory.tsx` | Orchestrator + 1 G-class subagent on disjoint surfaces (one subagent per file pair) |
| **T4** | `src/policy/ces/components/board/SprintExecutionBoard.tsx`, `src/policy/ces/pages/MyTasksPage.tsx`, `src/policy/pages/MobileIncidentExecutionPage.tsx`, `src/policy/pages/EvidenceCenterPage.tsx` (mobile-only pass; **handoff from T2 with clean diff**) | Orchestrator only (mobile-density edits benefit from single-eyed consistency) |
| **T5** | Cross-tranche state-cohesion finalization on surfaces touched in T2–T4 only (zero new files) | Orchestrator only |

### 3.2 Hard serialization rules

- No two tranches edit the same file. **Enforcement:** the tranche scoped file-list above is the binding source of truth; if a Wave 7 mid-flight discovery wants to add a file to a tranche, the orchestrator stops, updates this plan, and re-asks the user.
- No tranche edits any Protected/Frozen file (§10).
- No parallel subagents on the same file even within a tranche.
- **One full validation gate per tranche**, no batching tranches before validation.
- **Compliance Lock** semantics: any verify failure rolls back the entire tranche before continuing.

---

## 4. Per-Tranche Detail

### 4.1 T1 — Glass-stack Residual Cleanup

**Goal:** drop the only remaining glass-stack-budget warning (TaxonomyPage.old) and shave 1 layer off CommandCenterLayout to leave headroom for future polish.

**Concrete actions:**
1. `TaxonomyPage.old.tsx` — gate the route behind a new `devSurface` feature flag (default OFF). The file itself is `.old` and Lead 16 C10 deems it non-production. No file deletion (rollback safety).
2. `CommandCenterLayout.tsx` — drop 1 redundant backdrop layer (likely line 423 mobile-bottom-bar OR line 432 desktop header — confirm in tranche kickoff). Verify with `verify:ui`.

**Files touched:** 2 + `App.tsx` route gate + `featureFlags.ts` flag entry.

**Validation:**
- `verify:ui` glass-stack-budget WARN count: 1 → 0
- Visual diff: `wave-7-baselines/desktop/dashboard.png` vs new screenshot — header chrome unchanged at pixel-near level (the dropped layer must be a duplicate of an already-present blur surface, not a visible chrome layer).

**Rollback unit:** single git revert (one logical commit).

---

### 4.2 T2 — Primitive Adoption Sweep

**Goal:** replace ad-hoc loaders, empty states, and drawers on 4 high-traffic non-frozen surfaces with the existing primitives.

**Concrete actions:**
1. `EvidenceCenterPage.tsx` — replace ad-hoc spinner with `<LoadingState>`; replace "No evidence" panel with `<EmptyState>`.
2. `AuditModePage.tsx` — replace ad-hoc empty-state with `<EmptyState>`.
3. `MasterCalendarPage.tsx` — replace ad-hoc loading skeleton with `<LoadingState>`.
4. RightDrawer width-prop adoption: identify the 2–3 RightDrawer consumers currently inlining `width={...}` calculations and switch them to the canonical `width: 'sm'|'md'|'lg'|'xl'` enum (primitive already supports this — Wave 5A finalized).

**Files touched:** 3 page files + 2–3 drawer consumers (concrete list confirmed in T2 kickoff).

**Validation:**
- `tsc -b --noEmit`, `npm run build`, `verify:ui` (no new warns), `verify:task-identity`, `verify:alignment` all PASS.
- Visual diff: loaders / empties / drawers render with canonical primitive styling; behavior unchanged.
- A11Y: `aria-busy` / `role="status"` semantics from `LoadingState` are inherited correctly.

**Rollback unit:** one git revert per surface (4–6 small commits).

---

### 4.3 T3 — Typography + Token Consolidation (Non-Frozen Surfaces)

**Goal:** kill the only `pm.slate-pin` warning and reduce raw hex/rgb literals on 4 non-frozen surfaces.

**Concrete actions:**
1. `PmViews.tsx` — migrate the 40 slate-* utilities + 34 typo literals to `var(--ci-*)` tokens. Use the same migration pattern that Wave 5A used on `LibraryPage` (mapColor + mixAlpha helpers from `lightColorRemap` removal era).
2. `SharedPolicyDetailView.tsx` — migrate the 130 typo literals + custom tabs (line ~1482) to canonical `<Tabs>` primitive where structurally compatible; leave any tab-state callbacks unchanged.
3. `FormsPage.tsx` — migrate the 19 remaining typo literals (Wave 5A already partial).
4. `MasterControlInventory.tsx` — migrate the 37 typo literals (Wave 5A already touched).

**Files touched:** 4.

**Validation:**
- `verify:ui` `pm.slate-pin` WARN: 1 → 0.
- `verify:ui` `tokens.hex-literal` + `tokens.rgb-literal` WARN counts strictly decrease (target: ≥ 80 fewer combined warns).
- All other gates PASS.
- Visual diff: light + dark mode parity preserved.

**Rollback unit:** one git revert per file.

---

### 4.4 T4 — Mobile UX Foundation (CES + Evidence)

**Goal:** apply Lead 2's mobile rules (per `05_UIUX_MIGRATION_TRACK.md` U-07) on the 4 surfaces that field clinicians/CES operators hit most on phones. **No major responsive redesigns** (user directive).

**Concrete actions** (per surface, all already in `MOBILE_FIRST_UX_RECONSTRUCTION_STRATEGY.md` rule set):
1. Touch-target audit: any interactive ≥ 48 px height on mobile viewport.
2. Bottom-spacing/safe-area: `padding-bottom: max(env(safe-area-inset-bottom), 24px)` on bottom-anchored CTAs.
3. Mobile-density: reduce horizontal padding from 24 → 16 px on phone viewport only (Tailwind `px-4 lg:px-6`); preserve desktop density.
4. Drawer responsiveness: any drawer/sheet that opens off-canvas should use `<BottomSheetDrawer>` on mobile breakpoint (primitive already exists; no new code).
5. No new pages, no nav restructure, no layout flips, no new feature.

**Files touched:** 4 (SprintExecutionBoard, MyTasksPage, MobileIncidentExecutionPage, EvidenceCenterPage mobile-only diff).

**Validation:**
- Mobile baseline diff: `wave-7-baselines/mobile/*` vs new screenshots — improved density, ≥ 48 px touch targets visible, no horizontal scroll.
- Desktop baseline diff: pixel-near identical (no desktop regression).
- All static gates PASS.

**Rollback unit:** one git revert per surface.

---

### 4.5 T5 — Loading/Empty/Status Visual Cohesion Finalization

**Goal:** ensure every surface touched in T2–T4 has consistent loading, empty, and status visual language.

**Concrete actions:** zero new files. Verify each touched surface uses the same primitives consistently (LoadingState eyebrow, EmptyState title/body/CTA tone, CiStatusBadge for all status pills).

**Files touched:** **subset of T2–T4 surfaces only.**

**Validation:** same gates; the diff at this stage should be cosmetic-only (font, spacing, label-tone parity).

**Rollback unit:** one git revert across the entire T5 cosmetic commit.

---

## 5. Validation Gates (per tranche)

| Gate | Threshold |
|------|-----------|
| `npx tsc -b --noEmit` | exit 0 |
| `npm run build` | exit 0 |
| `npm run verify:ui` | FAIL count unchanged at 0; WARN counts strictly non-increasing in tokens.hex / tokens.rgb / pm.slate-pin / glass.stack-budget |
| `npm run verify:task-identity` | 10/10 PASS |
| `npm run verify:alignment` | 0 findings |
| `npm run verify:pm-unified` | 22/22 - 2 pre-existing (no new failures introduced; the 2 deferred items stay deferred) |
| `npm run verify:calendar-keys` | 0 duplicates |
| `npm run verify:brad-scenario` | 11/11 PASS |
| Playwright `wave-7-baselines` re-run | visual diff acceptable per tranche-specific expectations (above) |
| Playwright `wave-6-regression` | still 9/9 PASS (no surface mount/console-error regressions) |
| Playwright `artifact-retrieval-defect` | still 6/6 stage PASS (no IDB/LS retrieval regression) |

**Hard stop conditions** (any of these halts tranche, reports back to user before continuing):
- Any verify FAIL count > previous baseline.
- Any new P0/P1 regression in wave-6-regression spec.
- Any browser test 7 (artifact retrieval) stage regression.
- Any unintended Protected/Frozen file edit.
- Any tranche running > 1 calendar day in elapsed work.

---

## 6. Rollback Strategy

### 6.1 Tranche-level rollback
Each tranche lands as a **single squashed branch** named `wave-7/T<n>-<short-name>`. Rollback = `git revert <merge-sha>`. Tranches are independently revertable in any order **because file sets are disjoint by tranche.**

### 6.2 Surface-level rollback
Within a tranche, each surface lands as its own commit. A single offending surface can be reverted without unwinding the entire tranche: `git revert <commit-sha>`.

### 6.3 Hot-rollback for user-visible regressions
If a user-visible regression is reported during UAT:
1. Identify offending tranche from screenshot diff (baselines vs current).
2. Revert at tranche level (fast, safe).
3. Re-run all validation gates to confirm restored.
4. Re-author tranche after root-cause fix; new attempt re-enters wave plan as a new tranche T<n>'.

### 6.4 Compliance Lock continuity
At no point does Wave 7 disable any verify gate, weaken any token rule, or relax the print/print-frame canonical structure (Wave 5A). Compliance Lock semantics remain in force.

---

## 7. Deferred Items (Out of Wave 7 — Carried Forward)

These are explicitly NOT in Wave 7 even though they appear in `05_UIUX_MIGRATION_TRACK.md`:

| U-XX | Item | Why deferred from Wave 7 |
|------|------|--------------------------|
| **U-01** | CES theme → tokens + CesCard → SurfaceCard sweep | Touches `ces/theme.ts`; high-blast-radius across 20+ CES surfaces. Belongs to a dedicated CES theme wave with eCign owner courtesy ping. |
| **U-02** | GVGB local primitives → ui/ migration | `GVGBDetailView.tsx` is **frozen** (Lead 16 §14). Requires owner sign-off. |
| **U-03** | SharedPolicyDetailView custom tabs cleanup | Partial inclusion in T3 (typo + tabs only); full custom-tabs replacement deferred if it's structurally invasive. |
| **U-04** | Library glass-panel-lib normalization | `LibraryPage.tsx` is **frozen**. Requires owner sign-off. |
| **U-05** | OnboardingV2 visual harmonization | Higher-blast-radius; defer to dedicated onboarding wave. |
| **U-08** | Mobile FormSigningWorkspace | **Protected** (eCign). Requires owner sign-off and ECIGN-001/002 coordination. Explicitly excluded by user DO-NOT list. |
| **U-09** | Desktop DataGrid virtualization | Performance-sensitive; needs benchmark setup. Defer to dedicated perf wave. |
| **U-11** | Right-click context menus | Additive feature, not consolidation. Out of Wave 7 "no new features" rule. |
| **U-12** | Persona-conditioned home pages | Touches CommandCenterLayout heavily; nav architecture risk. Defer. |
| **U-15** | StagingM01 gating | T1 already does the equivalent for `TaxonomyPage.old` via `devSurface` flag; StagingM01 follow-on can ride the same flag in a later micro-PR. |
| All Wave 5B items | eCign packet refactor, backend canonical PDF | User has previously deferred. |

---

## 8. UI Before/After Screenshot Locations

### 8.1 Baselines (BEFORE — captured during Wave 7 planning, this turn)

- **Spec:** `Builder/_system/uat/wave-7-baselines.spec.mjs`
- **Captured:** 36 PNGs (18 surfaces × 2 viewports)
- **Location:** `Builder/_system/screenshots/wave-7-baselines/desktop/*.png` and `Builder/_system/screenshots/wave-7-baselines/mobile/*.png`
- **Surfaces:** dashboard, calendar, audit, evidence, library, forms-list, my-tasks, pm-my-tasks, pm-sprint-plan, pm-sprint-review, pm-approvals, pm-dashboard, master-control-inventory, admin-user-groups, form-qa-fm-021, form-print-qa-fm-021, gvgb-policy-print, journey-home

### 8.2 Per-tranche AFTER captures

Each tranche will re-run `wave-7-baselines.spec.mjs` after work lands and store output in:
- `Builder/_system/screenshots/wave-7-after/T<n>/{desktop,mobile}/*.png`

### 8.3 Diff record

Each tranche's execution report will include a small markdown table cross-referencing baseline / after pairs and noting:
- Surfaces with intentional visual change (per tranche scope).
- Surfaces expected to be pixel-near identical (regression check).

(`Builder/` is gitignored per repo policy; artifacts persist locally for human spot-check.)

---

## 9. Validation Required (Per User Directive)

The user-listed validation gates are restated and bound to the tranche-completion checklist in §5:

- [x] `tsc -b --noEmit` — gate per tranche
- [x] `npm run build` — gate per tranche
- [x] `npm run verify:ui` — gate per tranche
- [x] `npm run verify:task-identity` — gate per tranche
- [x] `npm run verify:alignment` — gate per tranche
- [x] Browser screenshots on mobile + desktop — `wave-7-baselines.spec.mjs` re-run per tranche

Plus the additional invariants we keep green from prior waves:
- [x] `npm run verify:pm-unified` (22 / 2 pre-existing baseline holds)
- [x] `npm run verify:calendar-keys`
- [x] `npm run verify:brad-scenario`
- [x] Playwright `wave-6-regression` (9/9)
- [x] Playwright `artifact-retrieval-defect` (6/6 stage pass)

---

## 10. Explicit List of Protected / Frozen Files (Avoided By Wave 7)

These files are **categorically out of scope for Wave 7** and the orchestrator will refuse any subagent suggestion to edit them. Source: Lead 16 §14 + prior wave reports.

### 10.1 Lead 16 §14 — architecturally frozen
1. `src/policy/compliance-execution/taskIdentity.ts`
2. `src/policy/compliance-execution/cesFormInstanceId.ts`
3. `src/policy/compliance-execution/stateMachine.ts`
4. `src/policy/stores/regulatoryExecutionStore.ts`
5. `src/policy/components/FormSigningWorkspace.tsx`
6. `src/policy/components/FormViewer.tsx`
7. `src/policy/components/FormSignatureFlow.tsx`
8. `src/policy/evidence/storage/localDemoAdapter.ts`
9. `src/policy/evidence/storage/cesEvidenceHierarchy.ts`
10. `vercel.json`
11. `src/auth/AuthProvider.tsx`
12. `src/policy/pages/LibraryPage.tsx`
13. `src/policy/pages/GVGBDetailView.tsx`
14. `src/policy/pages/PolicyDetailPage.tsx`
15. `src/policy/pages/PrintPage.tsx`
16. `src/policy/components/GVGBPrintDocument.tsx`
17. `server/ecign/**` (hashChain.ts, integrity.ts, stateMachine.ts, compliance.ts, networkMetadata.ts)
18. `src/policy/ecign/**` (entire eCign packet generation tree)

### 10.2 Frozen by prior wave reports
19. `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` (Frozen — Wave 1 + Wave 3 owner-led)
20. `src/policy/pages/ArtifactViewerPage.tsx` (Frozen — only the minimal artifact-retrieval fix was authorized; no further edits)
21. `src/policy/pages/FormPrintView.tsx` (Frozen — Wave 5A migration already authorized + done; locked)

### 10.3 Server / backend (out per user DO-NOT)
22. `server/**` (entire server tree)

### 10.4 Generated / auto-synced
23. `src/policy/data/**/*.generated.*`
24. Anything synced by `scripts/syncMasterControlInventory.mjs`

### 10.5 Non-production / dev-only (out by Lead 16 C10 + user "no rewrites")
25. `src/policy/pages/TaxonomyPage.old.tsx` — **gated behind feature flag in T1; file itself NOT edited (only route gating + flag declared elsewhere)**
26. `*.backup`, `*.old.tsx`, `Builder/`, `Bin-*` artifacts

**Verification:** every tranche's pre-flight checklist includes `git diff --name-only main...wave-7/T<n>` and an explicit assertion that **zero** files in §10.1–§10.4 appear in the diff.

---

## 11. Tranche Execution Sequence + Authorization Gates

```
┌─ Wave 7 Planning (this turn) ─ DONE
│   ├─ Surface inventory ............... §2
│   ├─ Ownership map ................... §3
│   ├─ Validation gates defined ........ §5
│   ├─ Rollback strategy ............... §6
│   ├─ Deferred items list ............. §7
│   ├─ Baselines captured (36 PNGs) .... §8.1
│   ├─ Protected/Frozen list ........... §10
│   └─ Plan published .................. THIS FILE
│
├─ ⏸  USER AUTHORIZATION GATE #1 (THIS TURN)
│       "Approve plan; authorize T1?"
│
├─ T1 — Glass-stack residual cleanup (~0.5 d)
│   └─ Validation gate + AFTER screenshots + tranche report
│
├─ ⏸  USER AUTHORIZATION GATE #2
│       "T1 done; approve T2?"
│
├─ T2 — Primitive adoption sweep (~1 d)
│   └─ Validation gate + AFTER screenshots + tranche report
│
├─ ⏸  USER AUTHORIZATION GATE #3
│
├─ T3 — Typography + token consolidation (~1 d)
│   └─ Validation gate + AFTER screenshots + tranche report
│
├─ ⏸  USER AUTHORIZATION GATE #4
│
├─ T4 — Mobile UX foundation (~1 d)
│   └─ Validation gate + AFTER screenshots + tranche report
│
├─ ⏸  USER AUTHORIZATION GATE #5
│
├─ T5 — Loading/empty/status finalization (~0.5 d)
│   └─ Final validation gate + WAVE_7_EXECUTION_REPORT.md
│
└─ Wave 7 closeout — UAT-ready deliverable
```

The orchestrator will **STOP at every authorization gate** and present:
- Tranche summary (files touched, lines changed, warn counts before/after).
- Validation gate results.
- Before/after screenshot folder paths.
- Confirmation that no Protected/Frozen file was edited.

---

## 12. Risks + Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Subtle visual regression on a high-traffic surface (Dashboard, Calendar) | M | M | Per-tranche `wave-7-baselines` rerun; diff inspection; tranche-level git revert if anything looks off. |
| Token migration changes light/dark parity | L | M | Run baselines in both themes (mode toggle handled by `useCiModeStore`); spot-check both. Wave 5A's mapColor / mixAlpha helpers already proven safe. |
| Mobile density change clips text on iPad-7th-gen viewport | L | L | T4 captures mobile baselines at 390×844; if iPad-class viewport exhibits issues, add 768×1024 baseline pass in T4 retro. |
| Subagent edits frozen file by accident | VL | H | Explicit §10 list passed to subagent prompt; orchestrator runs `git diff --name-only` after each tranche pre-merge. |
| Verify:ui WARN count regresses by accidental hex re-introduction | L | L | Validation gate has strict non-increasing constraint. |
| Tranche exceeds 1-day scope | M | L | Hard-stop condition in §5; tranche split into T<n>a / T<n>b and re-authorized. |
| User expects faster delivery than 4-day plan | M | L | Each tranche is independently shippable; the user can choose to stop after any tranche and still have improvement value. |

---

## 13. What Wave 7 Explicitly Does NOT Do (Restated)

For symmetry with the user's DO-NOT list:

- ❌ Touch eCign packet generation
- ❌ Touch artifact persistence architecture
- ❌ Touch backend / DocuSign architecture
- ❌ Rewrite CES workflows
- ❌ Redesign navigation architecture
- ❌ Perform broad page rewrites
- ❌ Introduce heavy animation systems
- ❌ Change business logic
- ❌ Reopen deferred backend work
- ❌ Reopen Wave 5B
- ❌ Perform "creative" UI rewrites outside scoped surfaces
- ❌ Introduce any new primitive (Wave 7 only adopts existing ones)
- ❌ Add new feature flags except the single `devSurface` gate in T1
- ❌ Touch any file in §10

---

## 14. Authorization Request

Wave 7 planning is complete. To proceed, please indicate one of:

1. **Approve plan + authorize T1 only** (glass-stack residual cleanup, ~0.5 d). Recommended.
2. **Approve plan + authorize T1–T3** (foundation tranches batched). Faster path; still 3 stop-points.
3. **Approve plan + authorize all tranches T1–T5** (fully autonomous wave execution). Highest agent runtime; requires high trust.
4. **Modify the plan first** (e.g., remove a surface, add a stop-point, change ordering).
5. **Defer Wave 7** entirely.

Until one of the above is explicitly returned, the orchestrator will not make any code modifications.

---

## 15. Plan Sign-Off (this turn)

- [x] Surface inventory authored (§2)
- [x] Ownership map authored (§3)
- [x] Per-tranche detail authored (§4)
- [x] Validation gates defined (§5, §9)
- [x] Rollback strategy authored (§6)
- [x] Deferred items list authored (§7)
- [x] Baseline screenshots captured + location documented (§8.1)
- [x] Protected/Frozen files list explicit (§10)
- [x] Risks + mitigations enumerated (§12)
- [x] DO-NOT list restated for symmetry with user directive (§13)
- [x] Authorization options presented to user (§14)
- [ ] User authorization gate #1 (awaiting response)
