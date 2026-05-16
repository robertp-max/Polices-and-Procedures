# UI/UX Migration Track — Explicit Enumeration

**Why this document exists:** The original `02_MVP_PACKAGE_BREAKDOWN_HONEST.md` enumerated only the named P0/P1 packages from MVP plan §5. But the **pure UI/UX migration work** described in Lead 1 (UI Architecture), Lead 2 (Mobile UX), Lead 3 (Desktop UX), and Lead 13 (Design System) is large, real, and was hidden inside vague labels like "CES theme unification ~2 days" (Wave 1) and "Visual regression baselines" (Wave 6). This document makes that work visible, breaks it into trackable items, and integrates it into the existing wave structure.

**Operator decision (this session):** Single orchestrator (Claude Opus 4.7) runs everything. UI/UX work is **NOT** delegated to a parallel team. Subagents within each wave handle UI/UX work on non-Protected surfaces in parallel.

---

## 1. Scope — What Was Missing From Section 02

The original breakdown counted ~81 agent-days for Waves 0–6. That number missed the surface-by-surface migration work described in Leads 1/2/3/13. The actual UI/UX migration scope adds **~24–28 agent-days** (single-agent equivalent), but with proper parallel allocation **adds only ~1–2 calendar weeks** to the overall MVP calendar.

### What was already in §02 (correctly captured)
- 4 net-new primitives (`BottomSheetDrawer`, `SignaturePad`, `PhotoEvidenceCapture`, `LoadingState`) — ~3.5 days
- Wave 1 line item: "CES theme unification (~2 days)" — **vastly under-scoped; see U-01 below**
- Wave 5: `MVP-P1-PRINT-001` shared print utils — correctly scoped
- Wave 6: visual regression baselines — correctly scoped as **baseline capture only**, not migration

### What §02 missed (this document fills the gap)
Everything below — surface-level token migration, primitive adoption, glass-layer cleanup, mobile re-styling per Lead 2's 12 rules, desktop hardening per Lead 3, and the 2,313+ inline-style sweep.

---

## 2. Track U — UI/UX Migration Items (single-agent estimates)

### U-01 — CES theme.ts → --ci-* token mapping + CesCard → SurfaceCard migration
**Wave:** 1 (coupled with P0-CES-001)
**Files:** `src/policy/ces/theme.ts`, `src/policy/ces/components/primitives.tsx` (CesCard), ~20+ CES consumer surfaces (CesBoardPage, SprintExecutionBoard, ExecutionUnitCard, WorkflowExecutionPanel, CesEvidenceHierarchyPanel, CesDashboardPage, etc.)
**Risk:** Medium — CesCard is touched by TASK-001 composite consumers, so this MUST serialize with Wave 2 TASK-001 if both run in parallel. Recommend U-01 finishes BEFORE TASK-001 starts.
**Estimate:** 2–3 agent-days

### U-02 — GVGB local primitives → ui/ migration
**Wave:** 2
**Files:** `src/policy/pages/GVGBDetailView.tsx` (Lead 16 §14 frozen — owner-led only; the file's local `Card`, `TabButton`, `SectionTitle`, `SimpleTable` are the migration targets)
**Risk:** Medium — frozen file; sticky-header + `gvgb-enter` animation must be preserved (Lead 1 mandate)
**Estimate:** 1–2 agent-days

### U-03 — SharedPolicyDetailView custom tabs cleanup
**Wave:** 2
**Files:** `src/policy/components/SharedPolicyDetailView.tsx` (line 1482+: custom tabs with hardcoded `#C74601`)
**Risk:** Low — non-Protected
**Estimate:** 1 agent-day

### U-04 — Library page glass-panel-lib normalization
**Wave:** 2
**Files:** `src/policy/pages/LibraryPage.tsx` (Lead 16 §14 frozen — `.glass-panel-lib` custom class)
**Risk:** Low — visual only; sign-off advisable
**Estimate:** 0.5 agent-day

### U-05 — Onboarding V2 visual harmonization with shell
**Wave:** 4 (after primary P0/P1 stabilizes; aligns with calm visual language enforcement)
**Files:** `OnboardingV2Layout.tsx`, `KpiTile.tsx`, `StatusPill.tsx`, `GateTile.tsx`, `UnitDrawer.tsx` (post-MVP rescue per Lead 16 §16, but visual token alignment is in-scope)
**Risk:** Low–Medium — OnboardingV2 is its own design dialect (light professional); we're aligning tokens, not restructuring
**Estimate:** 1.5 agent-days

### U-06 — Inline-style sweep (2,313+ instances) → token migration
**Wave:** 1–4 (continuous; one subagent per wave focuses on the touched surfaces)
**Files:** Spread across `src/policy/components/`, `src/policy/pages/`, `src/policy/ces/`, `src/policy/onboarding-v2/`. **Excluded:** `src/policy/ecign/*`, `src/policy/print/*`, `src/policy/data/*.generated.*` (per Phase 1 `HEX_SCAN_EXEMPT`)
**Risk:** Low individually; cumulative risk if a single PR sweeps too widely
**Estimate:** 3–5 agent-days (split across waves; ~0.75–1.25 days per wave)
**Approach:** Each wave, a Grok subagent picks 3–5 surfaces touched by that wave's P0/P1 work and does the token migration in the same PR. Reduces visual regression scope per PR.

### U-07 — Mobile surface re-styling — Lead 2's 12 rules applied
**Wave:** 1–2
**Files:** `CesBoardPage`, `SprintExecutionBoard`, `MyTasksPage`, `CesEvidenceHierarchyPanel`, `EvidenceCenterPage`, `MasterCalendarPage` (mobile breakpoints), `MobileIncidentExecutionPage`
**Scope per Lead 2:** Touch targets ≥48px, bottom-sheet drawer adoption on <1024px (post BottomSheetDrawer build), single-column reflow on <768px, safe-area-inset-bottom, 16px iOS font guard on inputs, momentum scroll only
**Risk:** Low–Medium — visual changes only; needs mobile field UAT to confirm
**Estimate:** 3 agent-days

### U-08 — Mobile FormSigningWorkspace re-styling (Protected)
**Wave:** 3 (coupled with ECIGN-001/002 owner sign-off)
**Files:** `FormSigningWorkspace.tsx` (Protected — Lead 16 C6)
**Scope:** 320px+ signature canvas, thumb-zone CTAs, 48px touch targets, finger-smooth strokes, IndexedDB partial-stroke persistence (depends on SignaturePad primitive U-build + EVIDENCE-001 IndexedDB)
**Risk:** HIGH — Protected Subsystem + legal defensibility chain
**Estimate:** 2 agent-days post-sign-off

### U-09 — Desktop DataGrid virtualization
**Wave:** 4
**Files:** CES board (`SprintExecutionBoard`), `AuditModePage` risk table, OnboardingV2 dashboard
**Scope per Lead 3:** Virtualize lists >50 rows; 32px dense row height; sticky utility headers; CiStatusBadge on status columns
**Risk:** Medium — performance-sensitive; needs benchmarking
**Estimate:** 1.5 agent-days

### U-10 — RightDrawer width fix + focus-trap consistency
**Wave:** 2 (coupled with A11Y-002 dialog semantics work in Wave 3 if convenient)
**Files:** `src/policy/components/ui/RightDrawer.tsx`, `UnitDrawer.tsx` (current 760px → 520px cap per Lead 16 C4)
**Risk:** Low–Medium — drawer width affects layout assumptions in consumers
**Estimate:** 0.5 agent-day

### U-11 — Right-click context menus on operational lists
**Wave:** 4 (desktop polish)
**Files:** CES board, calendar event cells, OnboardingV2 gates, AuditMode rows
**Risk:** Low — additive
**Estimate:** 1 agent-day

### U-12 — Persona-conditioned home pages
**Wave:** 4
**Files:** `CommandCenterLayout.tsx` (serialization with N-01/N-02 already-done), `DashboardPage.tsx`, role gates via `PermissionGate`
**Scope per Lead 3 + Lead 10:** DON → sign-off queue default; Compliance → AuditMode; Surveyor → Taxonomy/Framework; Trainer → Journey; Clinician → Tasks
**Risk:** Medium — touches CommandCenterLayout (already heavily edited in Phase 1)
**Estimate:** 2 agent-days

### U-13 — Glass-stack budget cleanup (3 existing exceedances)
**Wave:** 1–2 (low-hanging; opportunistic within other wave PRs)
**Files (per Phase 1 D-03 verifyUiDesignSystem.ts WARN output):**
- `CommandCenterLayout.tsx` — 5 layers (3 above budget)
- `ModalShell.tsx` — 4 layers (1 above budget)
- `TaxonomyPage.old.tsx` — 13 layers (10 above budget — but Lead 16 C10 marks this non-production, so deprecation is the simpler fix)
**Risk:** Low for ModalShell + CommandCenterLayout; Zero for TaxonomyPage.old (delete or gate behind devSurface)
**Estimate:** 1 agent-day

### U-14 — Light/dark mode audit + `lightColorRemap.ts` removal
**Wave:** 5 (after token sweep settles)
**Files:** `src/policy/styles/lightColorRemap.ts` (Lead 13 L633 "acknowledged band-aid"), all surfaces using it
**Risk:** Medium — light mode is primary for onboarding/signing/field clinician flows (Lead 1 mandate)
**Estimate:** 1.5 agent-days

### U-15 — StagingM01 gating behind `feature.devSurface`
**Wave:** 2 (Lead 16 C10 binding arbitration)
**Files:** Routes in `App.tsx`, `CommandCenterLayout.tsx` MOBILE_PRIMARY_TABS + More menu, `feature` flag system
**Risk:** Low — additive gating
**Estimate:** 0.5 agent-day

### U-16 — Typography token sweep (`text-[Npx]`, `tracking-[0.22em]` removal)
**Wave:** 1–4 (continuous, coupled with U-06)
**Files:** Spread across same surfaces as U-06
**Risk:** Low
**Estimate:** 1 agent-day (separate from U-06 because typography tokens are a distinct migration)

### U-17 — Loading variants (13+) → LoadingState adoption
**Wave:** 2 (after LoadingState primitive built)
**Files:** ~13 surfaces with custom spinners/skeletons (Lead 2 L130)
**Risk:** Low
**Estimate:** 1 agent-day

---

## 3. Roll-Up — Adjusted Wave Calendar

### Total UI/UX agent-day cost
| Item | Days |
|---|---|
| U-01 CES theme + CesCard | 2.5 |
| U-02 GVGB primitives | 1.5 |
| U-03 SharedPolicyDetailView | 1 |
| U-04 Library glass-panel-lib | 0.5 |
| U-05 OnboardingV2 harmonization | 1.5 |
| U-06 Inline-style sweep | 4 |
| U-07 Mobile re-styling | 3 |
| U-08 Mobile FormSigningWorkspace | 2 |
| U-09 DataGrid virtualization | 1.5 |
| U-10 RightDrawer width fix | 0.5 |
| U-11 Right-click context menus | 1 |
| U-12 Persona-conditioned homes | 2 |
| U-13 Glass-stack cleanup | 1 |
| U-14 lightColorRemap removal | 1.5 |
| U-15 StagingM01 gating | 0.5 |
| U-16 Typography sweep | 1 |
| U-17 LoadingState adoption | 1 |
| **Total Track U** | **~26 agent-days** |

### New aggregate (Waves 0–6, with Track U integrated)
Original §02 total: ~81 agent-days
+ Track U: ~26 agent-days
= **~107 agent-days for Waves 0–6** (single-agent equivalent)

### Calendar impact under 4-agent allocation (RECOMMENDED)
| Wave | Original calendar | + Track U items | New calendar | Delta |
|---|---|---|---|---|
| Wave 0 | 1 week | — | 1 week | 0 |
| Wave 1 | 1.5 weeks | U-01, partial U-06, partial U-13, partial U-16, partial U-07 (~7 days) | 2 weeks | +0.5 wk |
| Wave 2 | 2–3 weeks | U-02, U-03, U-04, U-10, U-15, partial U-06, U-17, partial U-07 (~7 days) | 2.5–3 weeks | +0.5 wk |
| Wave 3 | 3–4 weeks | U-08 (Protected, post-sign-off) (~2 days) | 3–4 weeks | 0 (absorbed) |
| Wave 4 | 2–3 weeks | U-05, U-09, U-11, U-12 (~6 days) | 2.5–3.5 weeks | +0.5 wk |
| Wave 5 | 1 week | U-14 (~1.5 days) | 1.5 weeks | +0.5 wk |
| Wave 6 | 3–5 days | — (baselines only) | 3–5 days | 0 |
| **Total Waves 0–6** | **~10–13 weeks** | | **~12–15 weeks** | **+1.5–2 weeks** |

**Result:** Adding the full UI/UX migration track adds **only ~1.5–2 calendar weeks** (under 4-agent allocation) — not 2× the calendar — because UI/UX work parallelizes well on disjoint surfaces within each wave.

---

## 4. Per-Wave Agent Allocation (Recommended)

This is how I'd run each wave as sole orchestrator. Subagent types:
- **C** = Claude Sonnet 4.6 or Opus 4.6-or-lower (logic-heavy, code-grounded)
- **G** = Grok 4.3 (UI/UX pattern application, mechanical migration, doc writing)

### Wave 0 — Reality Check
- Orchestrator (Opus 4.7) runs all 9 browser tests sequentially
- 1 **G** subagent: capture screenshots + organize artifacts in execution-logs/
- 1 **G** subagent: resolve `signerTaskFactory.ts` open conflict (git archaeology)
- 1 **G** subagent: PART II duplication cleanup memo

### Wave 1 — CES Identity + Theme + Mobile Primitives
- Orchestrator: P0-CES-001 (Protected — sole editor on `useEventExecutionDataflow.ts`, `WorkflowExecutionPanel.tsx`)
- 1 **C** subagent: SignaturePad primitive (canvas complexity)
- 1 **G** subagent: BottomSheetDrawer primitive
- 1 **G** subagent: AUTH-001 (vercel.json)
- 1 **G** subagent: AUTH-002 (CSV enforcement)
- 2 **G** subagents in parallel on U-01 CES theme migration: one for ces/theme.ts → tokens, one for CesCard → SurfaceCard sweep on disjoint consumer surfaces
- 1 **G** subagent: U-06 inline-style sweep on Wave 1-touched surfaces
- 1 **G** subagent: U-13 glass-stack cleanup (ModalShell + CommandCenterLayout)
- 1 **G** subagent: U-16 typography sweep on Wave 1-touched surfaces
**= ~10 subagents** (within plan limit of 16+16=32; comfortably within Phase 2 sweet spot of 4–8 effective)

### Wave 2 — Evidence + Audit + Composite Tasks
- Orchestrator: TASK-001 composite collapse (sole editor on `taskProjectionCore.ts`)
- 1 **C** subagent: EVIDENCE-001 IndexedDB adapter
- 1 **C** subagent: AUDIT-001 audit emitter dual-write
- 1 **G** subagent: ARTIFACT-001 deterministic reverse lookup
- 1 **G** subagent: nav slot "Workflows" → "Evidence"
- 1 **G** subagent: PhotoEvidenceCapture primitive
- 1 **G** subagent: LoadingState primitive + U-17 adoption
- 2 **G** subagents in parallel on U-07 mobile re-styling (CES + Evidence consumers, disjoint files)
- 1 **G** subagent: U-02 GVGB primitives migration (frozen file — needs sign-off)
- 1 **G** subagent: U-03 SharedPolicyDetailView cleanup
- 1 **G** subagent: U-04 Library glass-panel-lib
- 1 **G** subagent: U-10 RightDrawer width fix
- 1 **G** subagent: U-15 StagingM01 gating
- 1 **G** subagent: U-06 + U-16 sweep continuation on Wave 2 surfaces
**= ~14 subagents** (wave 2 is the busiest; still well within budget)

### Wave 3 — eCign + Accessibility P0 (highest serialization, tightest discipline)
- Orchestrator: SOLE editor on FormSigningWorkspace.tsx + FormViewer.tsx (serializes ECIGN-001, ECIGN-002, A11Y-001, U-08)
- 1 **C** subagent: A11Y-002 WorkflowExecutionPanel drawer dialog
- 1 **G** subagent: A11Y-003 aria-live regions on 4 surfaces (sequenced because 2 of the 4 are also touched by orchestrator)
- 1 **G** subagent: U-06 + U-16 sweep on Wave 3 surfaces
**= ~4 subagents** (intentionally lean — eCign sign-off is the bottleneck, not agent count)

### Wave 4 — Calendar + Permissions + A11Y P1 + eCign P1
- Orchestrator: ECIGN-003 + ECIGN-004 (call-site edits, Protected — sign-off required)
- 1 **C** subagent: CALENDAR-001 selectCanonicalTasksForEvent (touches 5 consumers; serialize via single subagent)
- 1 **G** subagent: A11Y-004 tree/grid ARIA on hierarchy
- 1 **G** subagent: A11Y-005 snapshot ARIA preservation (Protected file — serializes with orchestrator)
- 1 **G** subagent: A11Y-006 roving tabIndex
- 1 **G** subagent: PERMS-001 Trainer boundary
- 1 **G** subagent: U-05 OnboardingV2 harmonization
- 1 **G** subagent: U-09 DataGrid virtualization
- 1 **G** subagent: U-11 right-click context menus
- 1 **G** subagent: U-12 persona-conditioned homes (touches CommandCenterLayout — serialize with my edit window)
**= ~10 subagents**

### Wave 5 — Print Fidelity
- Orchestrator: PRINT-001 shared utils + eCign `buildPrintablePacketHtml` migration (Protected)
- 1 **G** subagent: GV-GB-001 print → shared utils
- 1 **G** subagent: PrintPage → shared utils
- 1 **G** subagent: FormPrintView → shared utils
- 1 **G** subagent: U-14 lightColorRemap removal
**= ~5 subagents**

### Wave 6 — Visual Regression + Full Re-Run
- Orchestrator: re-execute 9 browser tests + update baselines
- 1 **G** subagent: capture screenshots for visual regression
- 1 **G** subagent: document any regressions in `_Heavy/Fix-2026-05-14/wave-6/`
**= ~3 subagents** (small, focused)

---

## 5. Why "Single Orchestrator + Subagents" Beats "Parallel UI/UX Team"

| Concern | Single Orchestrator + Subagents | Parallel UI/UX Team |
|---|---|---|
| **File-level collisions** | Orchestrator owns Protected/frozen files; subagents work on disjoint non-Protected files | Two teams collide on CesCard, CommandCenterLayout, theme.ts |
| **Visual regression baselines** | Captured once per wave after all changes | Invalid baselines while parallel team is still migrating |
| **Compliance Lock regression** | One regression run per wave | 2× regression load + harder failure attribution |
| **Owner sign-off (eCign, CES architecture)** | Single requester | Parallel teams compete for the same human gate |
| **Phase 1/Phase 2 precedent** | This pattern shipped 16+6=22 task IDs cleanly | Untested, higher risk |
| **Operator overhead** | One status thread to read | Two coordination threads to read |
| **Slack/sync overhead** | Subagents are stateless workers reporting to one orchestrator | Two teams need cross-coordination |

---

## 6. Items Explicitly NOT In Track U (Stay Out Of Scope)

These are mentioned in Lead 1/2/3/13 reports but explicitly deferred per Lead 16 §17 Wave 8 or §14 out-of-scope list:

- Full mobile reconstruction per `MOBILE_FIRST_UX_RECONSTRUCTION_STRATEGY.md` (Lead 16 Wave 8 post-MVP)
- AchcSurveyAlignmentPage, SurveyorPolicyViewerPage, PolicyLifecyclePage rebuilds (Lead 16 §14 out-of-MVP-scope)
- Staffing redesign (out-of-scope)
- Journey/onboarding-v2 mobile reconstruction (Wave 8)
- iAdministrator/Hubstaff/Demo/FrameworkShowcase/TaxonomyPage/MasterControlInventory rebuilds (non-production per Lead 16)
- New `.tsx` page creation (this is migration, not new feature work)
- Removing `Builder/`, `Bin-(thrash)/`, `.backup`/`.old` files (Wave 8 post-MVP hygiene)

---

## 7. Cross-References To Updated Documents

This document is the new primary reference for UI/UX scope. The following docs have one-line delta notes pointing here:

- `00_REVIEW_SUMMARY.md` — adds a §8 referencing this doc
- `02_MVP_PACKAGE_BREAKDOWN_HONEST.md` — adds a §F (Track U) at end
- `03_REALISTIC_MVP_TIMELINE.md` — adds a §5 "Track U integration" with revised wave totals
- `04_NEXT_EXECUTION_PROPOSAL.md` — adds Option F (UI/UX migration starter pack: U-13 + U-15 + start of U-06)

---

## 8. Status

Track U is now explicitly enumerated, estimated, and wave-mapped. Single orchestrator (Claude Opus 4.7) is the binding recommendation. No parallel team. Subagent specialization (Claude for logic, Grok for UI/UX patterns) keeps throughput high without exceeding agent budget or violating serialization rules.

**Operator decision needed:** confirm the integrated wave allocation (above) is what you want, then we can apply it to whichever next-session option (A–F per `04_NEXT_EXECUTION_PROPOSAL.md`) is greenlit.
