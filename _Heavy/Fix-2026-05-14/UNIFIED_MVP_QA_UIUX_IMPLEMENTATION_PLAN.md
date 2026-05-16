# UNIFIED MVP QA + UI/UX IMPLEMENTATION PLAN

**Project:** Care Indeed Home Health — Policies & Procedures Platform
**Date:** 2026-05-15
**Mode:** LOCKED — PLAN + ALIGNMENT ONLY. No source code changes, no commits, no pushes, no deploys.
**Output owner:** Primary Orchestration Lead
**Output path:** `_Heavy/Fix-2026-05-14/UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md`

---

## 0. Grok Agent Execution Record (audit trail)

**Local CLI verified:** `grok 0.1.210` at `C:\Users\razer\.grok\bin\grok.exe`, logged in to grok.com, available CLI model surface `grok-build` (CLI tool); Cursor Task subagent runtime model used = `grok-4.3` (closest authorized slug per operator correction *"if the exact model flag is not visible, do not stop"*).

**16 Grok 4.3 agents dispatched in parallel via Cursor Task subagent runtime. Agent IDs (verifiable audit trail):**

| # | Lead | Agent ID | Status |
|---|------|----------|--------|
| 1 | UI Architecture | `ef4c00eb-6423-4a37-b716-37e6fdcfc9b2` | Returned |
| 2 | Mobile UX | `8b013dd0-93a7-4764-a1ec-c25e56dfb2de` | Returned |
| 3 | Desktop UX | `278766d9-d124-4f67-93af-55407815f57f` | Returned |
| 4 | CES Workflow | `6720cc55-c08b-4151-a056-923dbb1dd832` | Returned |
| 5 | eCign Defensibility | `19ec210e-b1a4-47a6-b176-dc23bd8094dc` | Returned |
| 6 | Evidence Center | `535591d5-4780-47f8-826e-7242481d5c90` | Returned |
| 7 | Accessibility | `9e389d98-a448-49f2-9236-05600ca72543` | Returned |
| 8 | PM / Task Projection | `48d2999a-4772-4645-b840-a3da15f991d8` | Returned |
| 9 | Calendar / Gantt / Kanban | `3816864f-e968-4186-9a16-bb47ee5495e5` | Returned |
| 10 | Navigation & IA | `43b75d10-19b3-461b-92f3-8fb6a0d93c20` | Returned |
| 11 | Runtime Validation | `afae31ed-6ca7-4a8e-8e52-52741c089d8f` | Returned |
| 12 | Browser UAT | `4a53edd3-8b1c-45d8-b510-5684ad3ae668` | Returned |
| 13 | Design System | `b5261352-d796-4155-bc9f-11893dee170d` | Returned |
| 14 | Dataflow / Identity | `a0fef069-1484-43d7-a14c-187af869f505` | Returned |
| 15 | Operational Realism | `68d4a94d-3223-47ee-bdad-05554afeedd4` | Returned |
| 16 | Final Convergence & Go/No-Go | `5f0a1edc-da6f-4500-9708-e81296254f93` | Returned |

All 16 agents ran read-only (Plan Mode, no MCP, no internet) per `docs/grok-build/GROK_BUILD_USER_GUIDE.md` safety rules.

**Operator-mandated review scope (all consumed by the 16 leads):**
1. `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit` (top-level + `design/` subfolder)
2. `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT` (all reports + patches)
3. `_Heavy/Fix-2026-05-14/MVP_QA_IMPLEMENTATION_PLAN.md`
4. `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy` (all 4 files)

---

# PART I — THE 16 GROK 4.3 LEAD REPORTS (verbatim, as returned)

## Lead 1 — UI Architecture
### Scope
Define single uncontested shell + primitive ownership for every operational surface; enforce locked Care Indeed teal/orange visual hierarchy with strict 3-layer glass limit and no parallel design dialects.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_AUDIT_EXECUTIVE_SUMMARY.md` (116 lines)
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_DESIGN_SYSTEM_AUDIT.md` (128 lines)
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_CANONICAL_COMPONENTS_MAP.md` (58 lines)
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_DRIFT_AND_REDUNDANCY_REPORT.md` (170 lines)
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/V2_DESIGN_DIRECTION_SUMMARY.md` (66 lines)
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/GLASS_LAYERING_CHEAT_SHEET.md` (46 lines)
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/LIGHT_MODE_ELEVATION_SYSTEM.md` (140 lines)
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/DARK_VS_LIGHT_MODE_GUIDE.md` (99 lines)

### Headline Findings
1. Token architecture mature (ci-*, glass, radius, space) but adoption low outside CommandCenterLayout; 2313+ inline styles + parallel palettes (maroon/gold, navy/orange) dominate (`UIUX_DESIGN_SYSTEM_AUDIT.md:15-17,27-29`).
2. "One-glass" philosophy (`index.css:8-12`, `CommandCenterLayout:47-51`) violated on most pages; GVGBDetailView, CES, eCign, Journey V1, Onboarding V2 use local cards/tabs/themes (`UIUX_DRIFT_AND_REDUNDANCY_REPORT.md:36-50,91-93`).
3. Strict 3-layer glass limit defined with Layer 3 exception-only; light mode requires soft shadows + `#E5E4E3` hairlines, no dark borders (`GLASS_LAYERING_CHEAT_SHEET.md:7-16`; `LIGHT_MODE_ELEVATION_SYSTEM.md:18-32`).
4. Dark mode primary for operational/compliance; light mode secondary for onboarding/signing/field tasks; never same glass treatment across modes (`DARK_VS_LIGHT_MODE_GUIDE.md:16-26,29-38`).
5. Canonical owners identified: CommandCenterLayout + ui/* as shell standard; PolicyDetailPage + SharedPolicyDetailView as policy detail; FormSigningWorkspace as eCign packet renderer (`UIUX_CANONICAL_COMPONENTS_MAP.md:6-16`; `UIUX_AUDIT_EXECUTIVE_SUMMARY.md:97`).

### Locked MVP Rules
1. Single canonical brand: Care Indeed teal (`#007970`) primary + restrained orange for CTA/escalation/overdue/critical only; prohibit maroon/gold and navy/orange parallel systems.
2. Maximum 3 glass layers (Layer 0 atmospheric, Layer 1 main surface, Layer 2 elevated); Layer 3 exception-only for critical function; no glass-on-glass-on-glass.
3. Desktop Layer 1 must use constrained max-width (1280-1600px) + side margins exposing Layer 0; full-bleed surfaces prohibited.
4. Light mode: soft `#E5E4E3` hairline borders + layered shadows for elevation; avoid hard/dark borders and heavy transparency.
5. Enforce `ui/` primitives (GlassPanel/SurfaceCard/Tabs/ActionButton/CiStatusBadge/DataGrid/EmptyState) + `--ci-*` tokens everywhere; deprecate local Card/TabButton/SectionTitle in GVGB, CES, eCign.
6. Dark mode default for CES/evidence/audit/policy/eCign; light mode for onboarding/signing/field clinician flows.

### Open Conflicts / Contradictions
- V2 direction specifies navy + teal + orange (`V2_DESIGN_DIRECTION_SUMMARY.md:22`) while audits enforce teal primary + orange CTA only.
- Journey V1 cinematic dark glass preserved as engagement prototype alongside Onboarding V2 light professional under same nav group with no migration path defined.
- CES retains parallel `theme.ts` + `CesCard` while audits call for unification or explicit mapping.

### Canonical Owner Files (under src/)
- `src/policy/components/CommandCenterLayout.tsx` (audit-cited)
- `src/policy/components/ui/` (GlassPanel, SurfaceCard, Tabs, ActionButton, CiStatusBadge, DataGrid, EmptyState, PageHeader) (audit-cited)
- `src/policy/pages/PolicyDetailPage.tsx` + `src/policy/components/SharedPolicyDetailView.tsx` (audit-cited)
- `src/policy/components/FormViewer.tsx` + `src/policy/components/FormSigningWorkspace.tsx` (audit-cited)
- `src/policy/onboarding-v2/` (OnboardingV2Layout, UnitDrawer, StatusPill, GateTile) (audit-cited)
- `src/policy/pages/MasterCalendarPage.tsx` (audit-cited)
- `src/policy/ces/` (CesLayout, primitives.tsx) (inferred — candidate for unification)
- `src/policy/journey/` (Journey V1 cinematic) (inferred — preserved specimen)

---

## Lead 2 — Mobile UX
### Scope
Make every operational surface (CES execution, eCign signing, evidence capture, policy review, onboarding gates, calendar drill-down, task queues) usable one-handed in a patient home with weak signal, in <90 seconds per task, with zero data loss across app background/kill, signal flap, rotation, call, or low-battery. Enforce touch ergonomics (≥44px / 48px premium), bottom-sheet drawers on <1024px, forms (auto-save + 48px inputs + 16px iOS guard), evidence (≤2-tap camera + offline queue), signatures (large pad + interrupt-resilient), navigation depth (≤3 taps from mobile bottom nav), keyboard (visualViewport + safe-area), gestures, typography, offline tolerance, loading, and phone-first visual hierarchy. Desktop is progressive extension only.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_MOBILE_RESPONSIVE_AUDIT.md`
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/00_PRODUCTION_SURFACE_FILTER.md`
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/02_MOBILE_FIRST_DESIGN_PHILOSOPHY.md`
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/06_07_COMPONENT_CONSOLIDATION_MOBILE_UX_ENFORCEMENT.md`
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/MOBILE_FIRST_UX_RECONSTRUCTION_STRATEGY.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/RESPONSIVE_BEHAVIOR_MATRIX.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/GESTURE_INTERACTION_GUIDELINES.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/OFFLINE_FIRST_AND_SYNC_PATTERNS.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/SIGNATURE_CAPTURE_BEST_PRACTICES.md`

### Headline Findings
1. Overall mobile readiness ~5/10; critical surfaces (FormSigningWorkspace signing 5/10, CES boards/tasks 4/10, OnboardingV2 BatchView/UnitDrawer 4/10, evidence hierarchy 4/10) are desktop-biased with wide drawers, dense tables, absolute `vw` carousels, and <44px targets (`UIUX_MOBILE_RESPONSIVE_AUDIT.md:4-6,81`).
2. No systematic bottom-sheet pattern on <1024px; all drawers (UnitDrawer, WorkflowDrawer, GlobalTaskDrawer, RightDrawer) are right/centered fixed overlays (`06_07_COMPONENT_CONSOLIDATION...md:76`, `RESPONSIVE_BEHAVIOR_MATRIX.md:44-46`).
3. Touch targets frequently <44px (tabs `px-3 py-2.5`, evidence inputs `px-2 py-1.5`, signature clear `px-3.5 py-1.5`); signature canvas too small/cramped for one-handed glove use.
4. Zero robust offline/interrupt handling on core flows (eCign, evidence, CES state); no IndexedDB queue, no `visibilitychange` + auto-save serializers, no resumable uploads.
5. Navigation depth routinely exceeds 3 taps; hamburger + multi-level drawers + internal 4-tab UnitDrawer reset state on close.
6. StagingM01 cinematic carousel (absolute `-72vw`/`84vw`, fixed `76vh`/`93vh`, 47 images + video) and wide 9/3 BatchView grids break on phone.
7. No canonical LoadingState/Skeleton primitive (13+ spinner variants); gestures and offline banners absent from high-frequency surfaces.

### Locked MVP Mobile Standard — 12 Enforceable Rules
- **Touch Targets:** Minimum 48×48 px for primary CTAs; 44 px floor for secondary; `.ci-touch-target` class; right-thumb zone (bottom-right 35 %) for Sign/Submit/Capture.
- **Drawer Behavior <1024 px:** All drawers convert to bottom sheet with drag handle (44 px visual), swipe-down dismiss (80 px or velocity >0.5), max-height `min(80vh, 80% safe viewport)`, backdrop tap close; state persisted on interrupt.
- **Scrolling:** Momentum scroll only; no horizontal scroll on any operational surface; single-column reflow on <768 px; safe-area-inset-bottom respected.
- **Forms:** 48 px input height, 16 px font (iOS guard), auto-save on every change + `visibilitychange`/`pagehide`/`beforeunload`; no uncontrolled inputs in FormViewer/FormSigningWorkspace.
- **Evidence Upload:** ≤2 taps; native camera `capture="environment"`; instant preview Accept/Retake; IndexedDB queue with metadata (timestamp/geo/patient); "Resume from interruption" banner.
- **Signatures:** Minimum 300 px height × 90 % width canvas on phone; finger + stylus support; prominent "Sign here" guide; 48 px+ "Apply Signature" in thumb zone; affirmation checkbox before lock; strokes + state survive background/kill.
- **Navigation Depth:** ≤3 taps from mobile bottom nav to any execution action; 5-6 slot bottom nav; "More" = bottom sheet; execution in full-screen or bottom-sheet overlays preserving parent context.
- **Keyboard:** `visualViewport` + safe-area insets; inputs never obscured; no fixed-position elements that collide with keyboard.
- **Gestures:** Tap (primary), long-press 500-600 ms (contextual), swipe left/right (with visible label), pull-to-refresh, swipe-down on bottom sheets; non-gesture alternative; respect `prefers-reduced-motion`.
- **Typography:** Minimum 16 px base; 14 px allowed only for dense supporting text; line-height ≥1.5; no truncation of critical labels.
- **Offline Tolerance:** IndexedDB queue for forms, evidence blobs, partial signatures; "Pending Sync" + offline banner; optimistic updates; background sync on reconnect.
- **Loading Behavior:** Single canonical Skeleton (list/card/form/signature variants with `--ci-skeleton` shimmer) + short-lived polite Spinner.

### Open Conflicts / Contradictions
- `RESPONSIVE_BEHAVIOR_MATRIX.md:46` allows right drawers on desktop while `06_07_COMPONENT_CONSOLIDATION...md:164-168` and `02_MOBILE_FIRST_DESIGN_PHILOSOPHY.md:74` mandate bottom sheets on <1024 px.
- `SIGNATURE_CAPTURE_BEST_PRACTICES.md:25` specifies 300 px height while `02_MOBILE_FIRST_DESIGN_PHILOSOPHY.md:99` calls for 320×180 px usable area.
- `00_PRODUCTION_SURFACE_FILTER.md:74` treats `/journey/staging/m01` as borderline/non-priority, yet `UIUX_MOBILE_RESPONSIVE_AUDIT.md:47-48` flags it as critical regulatory training surface.
- No explicit owner file for new `BottomSheetDrawer`, `SignaturePad`, `PhotoEvidenceCapture`, or `LoadingState` primitives.

### Canonical Owner Files
- `src/policy/components/ui/` — Tabs, SurfaceCard, GlassPanel, ActionButton, UtilityButton, CiStatusBadge, EmptyState, RightDrawer (audit-cited).
- `src/policy/components/CommandCenterLayout.tsx` — MOBILE_PRIMARY_TABS + mobile shell.
- `src/policy/components/FormSigningWorkspace.tsx` — eCign signing.
- `src/policy/ces/` (CesBoardPage, SprintExecutionBoard, WorkflowExecutionPanel, CesEvidenceHierarchyPanel).
- `src/policy/onboarding-v2/components/UnitDrawer.tsx`.
- **Inferred new owners (not yet present):** `src/policy/components/ui/BottomSheetDrawer.tsx`, `SignaturePad.tsx`, `PhotoEvidenceCapture.tsx`, `LoadingState.tsx`, `FormField.tsx`.

---

## Lead 3 — Desktop UX
### Scope
Preserve and harden desktop power-user surfaces (DON sign-off queue, CES board, MasterCalendar, AuditMode, OnboardingV2 dashboard) under the single design system without flattening information density. Define desktop breakpoints, density rules, interaction rules, drawer rules, print fidelity, and persona-conditioned home pages.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_SURFACE_INVENTORY.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_PAGE_BY_PAGE_FINDINGS.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_INTERACTION_PATTERN_AUDIT.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/CES_BOARD_VISUAL_LANGUAGE.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/TASK_URGENCY_HIERARCHY_SPEC.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/CALENDAR_VISUAL_PATTERNS.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/CHART_VISUAL_GUIDELINES.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/HOVER_FOCUS_ACTIVE_STATES.md`

### Headline Findings
1. CES surfaces run a parallel navy/orange theme (`ces/theme.ts` + `CesCard`) divergent from shell ci- tokens and SurfaceCard; highest redesign priority alongside eCign signing.
2. MasterCalendar is a strong unified surface (events/tasks/sprints/evidence) with good shell integration but needs explicit desktop split-view + agenda sidebar.
3. OnboardingV2 (260px rail + KpiTile/StatusPill/GateTile/UnitDrawer/AuditTimeline) is the strongest modern UX but shows stark drift from Journey V1 cinematic glass and shell one-glass.
4. Hover/focus states inconsistent (custom `shadow-[ ]` lifts vs global `* { box-shadow: none }`); need single-token hover lift + 2 px teal focus ring + prefers-reduced-motion enforcement.
5. Urgency hierarchy (Level 0-4: teal/orange/red left borders + text badges) and CES card layers are defined but not uniformly applied across CES board, calendar, and OnboardingV2 gates.
6. RightDrawer used in PM/iAdmin but focus trap inconsistent; UnitDrawer at 760 px exceeds target; no single primitive.
7. Print fidelity varies by renderer (GVGB vs QA-PG-001 vs eCign packets); dedicated `/print/*` routes exist but header/logo/title chrome conflicts.

### Locked MVP Desktop Standard
- **Breakpoints (measurable):** ≥1280 px = full desktop density (multi-column, DataGrid virtualization, sticky headers, right-click menus); 1024–1279 px = condensed desktop (single sidebar collapse, 480 px RightDrawer); ≤1023 px = handoff to Mobile UX Lead 2.
- **Density:** DataGrid virtualization enabled on all lists >50 rows (CiStatusBadge + 32 px dense row height); sticky utility headers on CES board, MasterCalendar agenda, AuditMode risk table, OnboardingV2 dashboard; tables use CiStatusBadge for status. Zero horizontal scroll on desktop ≥1024 px.
- **Interactions:** Hover lifts via single `--shadow-elevation-2` token + 1-2 px glass opacity increase (desktop only); all animations respect `prefers-reduced-motion`; right-click context menus on CES task lists, calendar events, OnboardingV2 gates, AuditMode rows.
- **Drawers:** RightDrawer fixed 480–520 px with focus trap primitive; Escape + click-outside closes and returns focus; UnitDrawer capped at 520 px (no 760 px exception).
- **Print:** Desktop print fidelity contract: vector PDF output from `/print/*` + FormPrintView; consistent ci-brand-header + teal rule + no eCign navy/orange bleed; side-by-side visual regression for GV-GB-001 vs QA-PG-001 vs signed packets.
- **A11y Parity:** WCAG 2.2 AA; 2 px teal focus ring; ARIA roles on DataGrid, tabs, drawers; keyboard roving tabIndex on CES board and calendar grids; no icon-only controls without labels.
- **IA:** Persona-conditioned home pages: DON = CES board + My Tasks + sign-off queue default; Compliance Officer = AuditMode + Governance + evidence hierarchy; Surveyor = Taxonomy/Framework + ACHC alignment tables; Trainer = Journey/OnboardingV2 dashboard.
- **Calm Visual Language:** CES/Calendar/OnboardingV2 use Layer 1 soft glass + Layer 2 teal left border + Layer 3 restrained orange (rare); urgency badges always text + color; charts limited to teal/orange/gray/navy; no CI-ION maroon/gold bleed.

### Open Conflicts / Contradictions
- CES parallel theme (navy/orange + CesCard) vs shell ci- gold/teal + SurfaceCard/GlassPanel.
- GVGBDetailView local TabButton/SectionTitle vs `ui/` primitives (honored specimen but drift flagged).
- RightDrawer width and focus trap inconsistent across PM/iAdmin/OnboardingV2.
- OnboardingV2 light rail vs Journey dark cinematic vs shell one-glass.
- Hover lift tokens not yet single-sourced; multiple loading/empty variants.

### Canonical Owner Files
- `src/policy/components/CommandCenterLayout.tsx` (shell + persona home routing)
- `src/policy/components/ui/RightDrawer.tsx` (drawer primitive + focus trap)
- `src/policy/components/ui/CiStatusBadge.tsx` + `DataGrid.tsx`
- `src/policy/components/ui/GlassPanel.tsx` + `SurfaceCard.tsx`
- `src/policy/ces/pages/CesDashboardPage.tsx` + `ces/components/board/SprintExecutionBoard.tsx` + `ces/components/board/ExecutionUnitCard.tsx`
- `src/policy/ces/components/calendar/ComplianceCalendar.tsx` + `ces/pages/CesCalendarPage.tsx`
- `src/policy/pages/DashboardPage.tsx`
- `src/policy/pages/AuditModePage.tsx`
- `src/policy/onboarding-v2/pages/*` + `onboarding-v2/components/{KpiTile,StatusPill,GateTile,UnitDrawer,AuditTimeline}.tsx`
- `src/policy/pages/GVGBDetailView.tsx` (specimen preservation)
- `src/policy/components/FormViewer.tsx` + `FormSignatureFlow.tsx`

---

## Lead 4 — CES Workflow
### Scope
Guarantee deterministic, audit-defensible CES task identity, signer-task propagation, evidence linkage, and event/task/sprint/calendar projection immune to UI churn. Architecturally freeze `taskIdentity.ts`, `cesFormInstanceId.ts`, `regulatoryExecutionStore.ts` (touch only via MVP-P0-CES-001). Every projector output crossing a navigation handler must emit canonical `form_instance_id`. URL is source of truth for hydration. Composite Form+Signers UI collapse is VIEW-ONLY; backend list and enforcement untouched. CES counts individual signer tasks for audit.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/MVP_QA_IMPLEMENTATION_PLAN.md` (full; CES sections, P0-CES-001, §6.4 ownership map, §7 frozen list, Waves 2/4, regression matrix)
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_EXECUTIVE_SUMMARY.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_FINDINGS_REGISTER.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/Declutter_Task_Model_Simplification_Proposal.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_BUILD_RESULTS.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/FINAL_QA_UAT_REPORT.md`
- Glob verification: `src/policy/compliance-execution/` (15 files), `src/policy/stores/regulatoryExecutionStore.ts` (1 file)

### Headline Findings
1. `verify:task-identity` **PASS** (`QA_UAT_BUILD_RESULTS.md:17`); canonical ID generation + deduping correct.
2. `verifyUnifiedTaskProjection` 22/24 pass; minor UI link issues only, data integrity strong (5283 tasks).
3. CES alignment 100% (0 findings); `eventTaskAdapter.ts` + projectors consistent.
4. MVP-P0-CES-001 confirmed: `form_instance_id` not propagated on Complete Form from `WorkflowExecutionPanel.tsx`.
5. Multi-signer artifact drift (P0-ECIGN-001) breaks `form_instance_id` chain-of-custody; subsequent signers call `uploadEvidence` instead of update.
6. Task bloat root cause: additive layering in `deriveDefaultEventTasks` + `signerTaskFactory` produces 25–40 tasks/event; UI collapse recommended, backend frozen.
7. Evidence phases (15/235 etc.) **PASS** on form instance lifecycle + `getOrCreateFormInstance` idempotency; URL hydration still requires browser gate.

### Locked CES MVP Rules
1. `form_instance_id` is canonical; every requirement row, projector output, and navigation target (`WorkflowExecutionPanel` → FormViewer) MUST carry it. URL query param is source of truth for hydration.
2. Task identity (`taskIdentity.ts`) and signer-task factory outputs are immutable for MVP; no changes to `SIGN-{eventId}::{formId}::SIGNER::{ROLE}` generation or `blocksOnSignerTasks` logic.
3. `regulatoryExecutionStore.ts` (and `complianceExecutionStore.ts`) drafts and evidence linkage are single source; refresh must survive via canonical ID, not in-memory only.
4. Composite "Form + Signers" collapse is strictly VIEW-ONLY in `taskProjectionCore.ts` / `WorkflowExecutionPanel.tsx`; backend task list and audit counts remain per-signer.
5. Every projector crossing a nav handler MUST emit `form_instance_id` at top level.
6. **Frozen files** (touch only via MVP-P0-CES-001): `taskIdentity.ts`, `cesFormInstanceId.ts`, `regulatoryExecutionStore.ts`, `eventTaskAdapter.ts`, `taskProjectionCore.ts`.
7. Verify scripts (`verify:task-identity`, `verify:pm-unified`, `verify:alignment`) must pass before any CES change; browser gate required for P0-CES-001.

### Open Conflicts / Contradictions
- `signerTaskFactory.ts` referenced in plan and proposal but not found by glob under `compliance-execution/` (possible rename or `pm/` location); ownership map lists it as canonical.
- Minor projection link issues flagged in unified task projection (22/24) but not blocking identity; requires runtime validation.

### Canonical Owner Files
- `src/policy/compliance-execution/taskIdentity.ts` — audit-cited + glob verified
- `src/policy/compliance-execution/cesFormInstanceId.ts` — audit-cited + glob verified
- `src/policy/compliance-execution/eventTaskAdapter.ts` — audit-cited + glob verified
- `src/policy/compliance-execution/useEventExecutionDataflow.ts` — audit-cited
- `src/policy/pm/taskProjectionCore.ts` — audit-cited
- `src/policy/stores/regulatoryExecutionStore.ts` — audit-cited + glob verified
- `src/policy/components/WorkflowExecutionPanel.tsx` — audit-cited
- `src/policy/compliance-execution/signerTaskFactory.ts` — audit-cited but glob NOT found (open item)
- `src/policy/compliance-execution/complianceExecutionStore.ts` — glob verified

---

## Lead 5 — eCign Defensibility
### Scope
Highest legal-risk lead. Defend chain-of-custody under ESIGN Act, UETA, ACHC. Enforce single canonical artifact per `canonicalFormInstanceId` via supersede chain. Byte-identical stored-PDF retrieval on Download/Print/Open. Server-side role re-check before `signed_locked`. Required-fields completeness gate before lock. Preserve snapshot fidelity (`getPrintableFormHtml` must retain ARIA + dynamic sections + values). `server/ecign/*` architecturally frozen.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/eCIgn_Legal_Defensibility_Gap_Analysis.md` (full)
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/Full_App_Accessibility_Compliance_Audit.md` (snapshot-equivalence section, lines 34-38, 60-62)
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/patches/2026-05-14-P0-01-MultiSigner-Artifact-Supersede.patch`
- `_Heavy/Fix-2026-05-14/MVP_QA_IMPLEMENTATION_PLAN.md` (MVP-P0-ECIGN-001/002, MVP-P1-ECIGN-003/004, MVP-P1-PRINT-001)
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_TEST_PLAN.md` (Tests 2, 3, 5)
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/SIGNATURE_CAPTURE_BEST_PRACTICES.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/PRINT_PDF_CONSISTENCY_GUIDELINES.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/SECURITY_AND_PRIVACY_IN_UI.md`

### Headline Findings
1. Multi-signer artifact identity broken: `removeEvidence` + `uploadEvidence` in `FormSigningWorkspace.tsx` (`finalizeSigning`) produces N unrelated EV- IDs per `canonicalFormInstanceId`, fracturing chain-of-custody (`eCIgn_Gap_Analysis.md:71-73`; patch replaces lines 38-40 remove loop with `supersedeEvidence`).
2. Download/Print/Open returns live HTML re-render instead of stored signed PDF (MVP-P0-ECIGN-002; Test 3).
3. Server-side role re-check and required-fields gate missing before `attested → signed_locked` (`eCIgn_Gap_Analysis.md:52-55, 57-61`; MVP-P1-ECIGN-003/004).
4. Subsequent-signer snapshot (`getPrintableFormHtml`) risks losing ARIA semantics and dynamic sections, weakening defensibility for disabled signers (`Full_App_Accessibility_Compliance_Audit.md:34-38, 60-62`; MVP-P1-A11Y-005).
5. No server-side enforcement of `CES_SIGNER_ROLES` exclusion of "DON Assistant" at lock.
6. Test 2 (DON Assistant → DON) and Test 5 (Audit Trail Link) directly validate single-artifact + top-level `targetKind`/`targetId` requirements.

### Locked eCign MVP Rules
- Single canonical artifact per `canonicalFormInstanceId` via supersede chain only (patch replaces remove+upload).
- Byte-identical signed PDF retrieval on Download/Print/Open (never live HTML re-render; MVP-P0-ECIGN-002 + Test 3).
- Server-side role re-check against `required_signers` before `signed_locked` (MVP-P1-ECIGN-003).
- Required-fields completeness gate before lock (MVP-P1-ECIGN-004).
- `getPrintableFormHtml` MUST preserve ARIA + dynamic sections + values.
- `server/ecign/*` (hashChain.ts, integrity.ts, stateMachine.ts) architecturally frozen — call-site edits only.
- Affirmation checkbox + explicit "Sign & Lock" required before lock.
- Every printed page carries Care Indeed brand header + certificate ID + signer metadata footer.
- Raw signatures never in localStorage; secure-channel only.

### Open Conflicts / Contradictions
- `MVP_QA_IMPLEMENTATION_PLAN.md` freezes `FormSigningWorkspace.tsx` and `FormViewer.tsx` (lines 173-175) while simultaneously requiring edits inside them for MVP-P0-ECIGN-001/002 and MVP-P1-A11Y-005 — direct ownership conflict.
- Gap analysis recommends server role gate but canonical-ownership map places `stateMachine.ts` under frozen list with no explicit exception for `ecign/api.ts` call sites.
- Test 2 asserts "single artifactId chain" yet patch cleanup still leaves legacy artifact migration unspecified.

### Canonical Owner Files
**src/ (audit-cited):**
- `src/policy/components/FormSigningWorkspace.tsx` — patch target
- `src/policy/components/FormViewer.tsx` — a11y + snapshot
- `src/policy/ecign/api.ts`
- `src/policy/ces/cesRoles.ts`
- `src/policy/security/stateMachine.ts`
- `src/policy/pages/PrintPage.tsx` + `GVGBPrintDocument.tsx`

**server/ (audit-cited, architecturally frozen):**
- `server/ecign/hashChain.ts`
- `server/ecign/integrity.ts`
- `server/ecign/stateMachine.ts`

---

## Lead 6 — Evidence Center
### Scope
Plan-only analysis of `EvidenceCenterPage.tsx`, `CesEvidenceHierarchyPanel.tsx`, and `ArtifactViewerPage.tsx` to achieve audit-defensible implementation. Focus: blob persistence (IndexedDB-class), top-level `targetKind`/`targetId` on every `form_instance`/`artifact` audit event, deterministic artifact→canonical `form_instance` reverse lookup, proper tree/grid ARIA, and grouping evidence + signatures under parent form.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/Accessibility_Compliance_Deep_Audit.md`
- `_Heavy/Fix-2026-05-14/MVP_QA_IMPLEMENTATION_PLAN.md` (MVP-P0-A11Y-003, MVP-P1-EVIDENCE-001, MVP-P1-AUDIT-001, MVP-P1-ARTIFACT-001, Waves 5/6, browser matrix Tests 4/5)
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_FINDINGS_REGISTER.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_TEST_PLAN.md` (Tests 4–5)
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/EVIDENCE_CAPTURE_SPECIFICATION.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/EMPTY_STATE_PATTERNS.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_PAGE_BY_PAGE_FINDINGS.md` (Evidence Center lines 66–75; ArtifactViewer 110–119)
- Verified read: `src/policy/pages/EvidenceCenterPage.tsx`, `src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx`, `src/policy/pages/ArtifactViewerPage.tsx`, `src/policy/evidence/storage/localDemoAdapter.ts`, `src/policy/evidence/cesEvidenceHierarchy.ts`

### Headline Findings
1. Evidence Center is metadata-only after refresh/hard reload (MVP-P1-EVIDENCE-001): `localDemoAdapter.ts` + `demoEvidenceRuntimeCache` (in-memory Map + localStorage bridge) loses blobs.
2. Audit events bury `targetKind`/`targetId` under `after.*` (MVP-P1-AUDIT-001): Test 5 explicitly requires top-level fields.
3. `ArtifactViewerPage.tsx` uses heuristic `resolveFormInstanceFromArtifactCandidates` + legacy fallback (MVP-P1-ARTIFACT-001): no deterministic reverse lookup.
4. Hierarchy lacks tree/grid ARIA (MVP-P1-A11Y-004, `Accessibility_Compliance_Deep_Audit.md:23-29`): `CesEvidenceHierarchyPanel.tsx` uses custom divs; no `role="tree"`, `aria-expanded`, `aria-level`, live regions, or keyboard nav.
5. Evidence + signatures not grouped under parent form (MVP-P0-TASK-001 composite pattern): `cesEvidenceHierarchy.ts` and `EvidenceCenterPage` render flat.
6. Empty-state and capture spec exist but unadopted.
7. localStorage is INSUFFICIENT at >4MB photo blobs: `localDemoAdapter.ts:4` comment confirms.

### Locked Evidence MVP Rules
- **Blob persistence:** Replace `localDemoAdapter` + `demoEvidenceRuntimeCache` (localStorage bridge) with IndexedDB-class adapter. Persist full blobs across refresh/session restart. Dual-write window: write new IndexedDB path while keeping legacy cache for one release, then migrate. MVP-P1-EVIDENCE-001 + Test 4 gate.
- **Top-level audit `targetKind`/`targetId`:** Emit on every `form_instance`/`artifact` event at root (not `after.target*`). Dual-write window: populate both shapes for one release, then deprecate nested. MVP-P1-AUDIT-001 + Test 5.
- **Deterministic reverse lookup:** Authoritative `artifact → canonicalFormInstanceId` map in `cesFormInstanceId.ts` (or new `artifactToFormInstance.ts`). Remove `--` double-dash heuristic and `resolveFormInstanceFromArtifactCandidates` fallback.
- **Tree/grid ARIA on hierarchy:** `CesEvidenceHierarchyPanel` renders `role="tree"` (or `role="grid"` for tabular view) with `role="treeitem"`, `aria-expanded`, `aria-level`, `aria-labelledby`, live regions (`aria-live="polite"`), and arrow-key navigation.
- **Grouped under parent form (composite consumption):** Evidence + signatures collapse under parent `FORM_COMPLETION` requirement (Lead 8 pattern).

### Open Conflicts / Contradictions
- Frozen list protects `localDemoAdapter.ts`, `cesEvidenceHierarchy.ts`, `cesFormInstanceId.ts` yet MVP-P1-EVIDENCE/AUDIT/ARTIFACT explicitly require changes inside them → resolution: owner-led patches only, no drive-by.
- UIUX findings recommend "Unify with ArtifactViewer" while Evidence Capture Spec remains unimplemented → prioritize deterministic lookup + IndexedDB before unification.
- No explicit IndexedDB spec in design docs despite >4MB photo requirement → add to `EVIDENCE_CAPTURE_SPECIFICATION.md` as P1 follow-up.

### Canonical Owner Files
- Evidence storage: `src/policy/evidence/storage/localDemoAdapter.ts`, `demoEvidenceRuntimeCache.ts`, `storageMode.ts`
- Hierarchy + grouping: `src/policy/evidence/cesEvidenceHierarchy.ts`, `src/policy/pages/EvidenceCenterPage.tsx`, `src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx`
- Artifact resolution + audit: `src/policy/pages/ArtifactViewerPage.tsx`, `src/policy/compliance-execution/cesFormInstanceId.ts`, server audit emitter + `taskAuditEvent.ts`
- Related (read-only context): `src/policy/stores/regulatoryExecutionStore.ts`, `src/policy/pm/taskProjectionCore.ts`

---

## Lead 7 — Accessibility
### Scope
WCAG 2.2 AA floor on five mandatory surfaces: FormViewer.tsx (P0 form labels — htmlFor/id/aria-labelledby/aria-describedby — MVP-P0-A11Y-001), FormSigningWorkspace.tsx (dialog semantics + multi-signer snapshot SR equivalence — MVP-P1-A11Y-005), WorkflowExecutionPanel.tsx (role=dialog + aria-modal + focus trap + focus return — MVP-P0-A11Y-002), EvidenceCenterPage.tsx + CesEvidenceHierarchyPanel.tsx (tree/grid roles + aria-expanded + aria-level + keyboard arrow nav + landmarks — MVP-P1-A11Y-004), and aria-live announcements for signing progress + evidence updates + section transitions (MVP-P0-A11Y-003). Accessibility = operational + compliance + legal defensibility.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_ACCESSIBILITY_AUDIT.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/Accessibility_Compliance_Deep_Audit.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/Full_App_Accessibility_Compliance_Audit.md`
- `_Heavy/Fix-2026-05-14/MVP_QA_IMPLEMENTATION_PLAN.md` (MVP-P0-A11Y-001/002/003 + MVP-P1-A11Y-004/005/006)
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/ACCESSIBILITY_COMPONENT_CHECKLIST.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/ACCESSIBILITY_GUIDELINES.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/FORM_VALIDATION_PATTERNS.md`

### Headline Findings
1. FormViewer Field component (lines ~499-626) lacks consistent `htmlFor`/`id` associations, `aria-labelledby`, and `aria-describedby` for help text; uncontrolled inputs + dynamic sections violate WCAG 2.2 1.3.1 (Info and Relationships) and 4.1.2 (Name, Role, Value) — direct legal risk for attestation (`Full_App_Accessibility_Compliance_Audit.md:17-38`).
2. WorkflowExecutionPanel drawer (line 1757) missing `role="dialog"`, `aria-modal`, focus trap, and focus return; CesEvidenceHierarchyPanel lacks `role="tree"`/`treeitem`, `aria-expanded`, `aria-level`, and arrow-key nav — violates WCAG 2.2 2.1.1 (Keyboard), 2.4.3 (Focus Order), 1.3.1 (`Accessibility_Compliance_Deep_Audit.md:23-49`).
3. Minimal `aria-live` for signing status, evidence updates, or section transitions (MVP-P0-A11Y-003); subsequent signers see static snapshot that may strip ARIA — violates WCAG 2.2 4.1.3 (Status Messages) and multi-signer SR equivalence (MVP-P1-A11Y-005).
4. Contrast risks (hardcoded grays, small text 9 px, mixed themes) + icon-only buttons without labels; touch targets <44 px — WCAG 2.2 1.4.3 (Contrast), 2.5.5 (Target Size).
5. `getPrintableFormHtml` clones values but risks losing ARIA/labels for N+1 signers — critical for eCign legal defensibility chain.
6. Guidelines require 4.5:1 contrast, 44 px targets, `aria-live` for status, focus trap on modals — all surfaces must enforce.

### Locked Accessibility MVP Rules
- **FormViewer.tsx (MVP-P0-A11Y-001):** Every Field must have `<label htmlFor={id}>` + input `id`; use `aria-labelledby` for radio groups/legends; `aria-describedby` for `f.help`; controlled inputs preferred; dynamic sections must announce via `aria-live="polite"` + `aria-expanded`.
- **FormSigningWorkspace.tsx (MVP-P1-A11Y-005):** Maintain `role="dialog"` + `aria-modal="true"` + `aria-labelledby`; `getPrintableFormHtml()` MUST clone and preserve (or enhance) labels, headings, ARIA attributes, and structure so subsequent signers have SR-equivalent review experience; add live region for "review previous signer snapshot loaded".
- **WorkflowExecutionPanel.tsx (MVP-P0-A11Y-002):** Drawer container `role="dialog" aria-modal="true" aria-labelledby="..."`; robust focus trap on open + explicit focus return to trigger on close/complete; keyboard Esc closes.
- **EvidenceCenterPage.tsx + CesEvidenceHierarchyPanel.tsx (MVP-P1-A11Y-004):** Hierarchy `role="tree"` with `role="treeitem"`, `aria-expanded`, `aria-level`, `aria-selected`; keyboard arrow navigation (Up/Down/Left/Right/Enter/Space); `role="region"` or landmark for filters; live region for filter results / evidence attach / status changes.
- **aria-live (MVP-P0-A11Y-003):** Polite live regions in FormViewer/FormSigningWorkspace/EvidenceCenterPage/WorkflowExecutionPanel for signing progress, evidence updates, section transitions; assertive for critical errors.
- **Dialog semantics & focus:** All modals/drawers follow checklist (focus trap, return, Esc, accessible name).
- **Keyboard:** Roving tabIndex or arrow keys in trees/tabs/lists; logical tab order; visible teal focus ring.
- **Contrast & tokens:** Enforce 4.5:1 (text) / 3:1 (large) in light/dark/mixed; replace hardcoded grays/slate with `--ci-*` tokens.
- **Mobile parity:** All 44×44 px targets; reduced-motion respect; same ARIA/keyboard on touch.
- **Legal:** `getPrintableFormHtml` snapshot must deliver equivalent perceivable/operable experience to SR users for defensibility.

### Open Conflicts / Contradictions
None in accessibility corpus. MVP plan and both audits converge on the same five surfaces and P0/P1 IDs.

### Canonical Owner Files
- `src/policy/components/FormViewer.tsx` (Field) — MVP-P0-A11Y-001
- `src/policy/components/FormSigningWorkspace.tsx` — MVP-P1-A11Y-005 + MVP-P0-ECIGN-002
- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` — MVP-P0-A11Y-002 + MVP-P0-CES-001
- `src/policy/pages/EvidenceCenterPage.tsx` + `CesEvidenceHierarchyPanel.tsx` — MVP-P1-A11Y-004
- aria-live sites: FormViewer.tsx, FormSigningWorkspace.tsx, EvidenceCenterPage.tsx, WorkflowExecutionPanel.tsx — MVP-P0-A11Y-003

---

## Lead 8 — PM / Task Projection
### Scope
Implement view-only composite "Form + Signers" grouping in projectors and UI (MVP-P0-TASK-001) without touching backend identity. Collapse five overlapping "Work To Do" surfaces (WorkflowExecutionPanel + CES My Tasks + PM My Tasks + Evidence requirements + Audit Mode) into one authoritative Requirements & Progress view per event; others become filtered slices. Target visible cardinality reduction from ~25–40 per event to ≤12 top-level items.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/Declutter_Task_Model_Simplification_Proposal.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_RECOMMENDATIONS.md`
- `_Heavy/Fix-2026-05-14/MVP_QA_IMPLEMENTATION_PLAN.md` (MVP-P0-TASK-001, Wave 4, §6.4 ownership, §9 map)
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_BUILD_RESULTS.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_PAGE_BY_PAGE_FINDINGS.md` (CES/* + WorkflowExecutionPanel + PM overlay + EvidenceCenterPage sections)

### Headline Findings
1. Root cause is additive layering in `eventTaskAdapter.ts:deriveDefaultEventTasks` + `signerTaskFactory.ts`: every processFlow step + net requiredForm + per-role SIGN- task + approvals/minutes.
2. Exact math (realistic regulatory event): 7 processFlow + 3 net forms + 8 signer + 3 approvals = 21 visible tasks; often 25–40+ with overrides/manual.
3. After composite "Form + Signers" collapse + progressive disclosure: ~10–12 top-level items — 45–50% reduction.
4. Five surfaces duplicate the same requirement data; no single canonical "Requirements & Progress" view exists.
5. Build is green (`tsc -b --noEmit` + `npm run build` PASS) and task identity verified, but zero browser execution records for the 9 QA tests; runtime projection drift remains unvalidated.
6. UI/UX hotspots: CES board/WorkflowExecutionPanel (dense, parallel tokens, missing ARIA tree/grid), PM overlays bolted on, Evidence hierarchy scattered rows.
7. Composite grouping is the surgical P0 lever that preserves `blocksOnSignerTasks`, audit events, and role assignment while fixing the "too many objects / messy" complaint.

### Locked PM MVP Rules
- Composite "Form + Signers" collapse is the default in all PM/list projectors and UI (My Tasks CES/PM, Sprint/Kanban/Gantt, WorkflowExecutionPanel requirement list, Evidence hierarchy); expansion to individual signer tasks is opt-in only.
- Backend identity untouched: all deterministic `SIGN-{eventId}::{formId}::SIGNER::{ROLE}` tasks, `parentFormTaskId` links, and `blocksOnSignerTasks: true` remain exactly as generated.
- One authoritative Requirements & Progress view per event; other surfaces become filtered slices or embedded sub-views.
- In PM/list views, signer tasks render exclusively as sub-items, status badges, or expandable sections under the parent form card ("Form Complete + X/Y Signatures"); "My Signatures" filter is the only peer-task exception.
- Target ≤12 top-level visible items per event in the canonical view; progressive disclosure + design-token surfaces (GlassPanel + `--ci-*`) required.
- MVP-P0-TASK-001 owner files: `taskProjectionCore.ts`, `taskProjection.ts`, `WorkflowExecutionPanel.tsx`.

### Open Conflicts / Contradictions
- MVP plan §5 lists "Consolidate Work To Do surfaces" as P2/DEFER-008 while Declutter and QA_RECOMMENDATIONS treat it as High Priority core to P0-TASK-001; ownership decision required before Wave 4.
- UIUX findings flag CES as "parallel system" with navy/orange tokens diverging from shell; no explicit migration path defined for CES cards vs SurfaceCard in the task projector scope.
- Form instance ID propagation (MVP-P0-CES-001) is a dependency for clean composite keys but listed in Wave 2 before TASK Wave 4; ordering risk.

### Canonical Owner Files
- Task projection core: `src/policy/pm/taskProjectionCore.ts`, `taskProjection.ts`
- Event/task generation: `src/policy/compliance-execution/eventTaskAdapter.ts`, `signerTaskFactory.ts`
- Workflow drawer: `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- Evidence hierarchy: `src/policy/evidence/cesEvidenceHierarchy.ts`, `src/policy/pages/EvidenceCenterPage.tsx`
- CES task identity: `taskIdentity.ts`, `cesFormInstanceId.ts`
- PM/CES stores: `regulatoryExecutionStore.ts`, `pm/pmOverlayStore.types`

---

## Lead 9 — Calendar / Gantt / Kanban
### Scope
Eliminate divergent task projections between MasterCalendar, Sprint, Kanban, Gantt, and My Tasks (MVP-P1-CALENDAR-001). Same event → same count → same status across all four. One canonical `selectCanonicalTasksForEvent` selector; view-specific reshaping operates on identical output and never re-projects from raw tasks. Address `taskOverridesByEventId` keying collision risk under composite event IDs.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/MVP_QA_IMPLEMENTATION_PLAN.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_FINDINGS_REGISTER.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_TEST_PLAN.md` (Test 8)
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/CALENDAR_VISUAL_PATTERNS.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_SURFACE_INVENTORY.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_PAGE_BY_PAGE_FINDINGS.md`

### Headline Findings
1. MVP-P1-CALENDAR-001 explicitly flags "Calendar / Sprint / Kanban / Gantt show divergent task counts; `taskOverridesByEventId` ID collision risk" with owners `taskProjection*` + `obligationSelectors` (`MVP_QA_IMPLEMENTATION_PLAN.md:66`).
2. Test 8 requires: after CES action + refresh, Master Calendar (month+Gantt), Sprint/Kanban, and My Tasks must show identical task state, count, status, due date — "Unified task projection is consistent. No duplicate tasks, no missing signer tasks, no status desync."
3. Exact divergence point: no single `selectCanonicalTasksForEvent` exists; `taskProjectionCore.ts` + `taskProjection.ts` + `obligationSelectors.ts` each independently derive from raw tasks / `deriveDefaultEventTasks` + `signerTaskFactory` + `taskOverridesByEventId` (composite eventId keys collide when IDs contain slashes/dashes); Gantt/Kanban/Sprint re-project instead of reshaping one canonical list.
4. UIUX audits confirm MasterCalendar is "strong unified view" but PM overlays/Kanban (CES board) use parallel projection paths, producing the exact count/status drift Test 8 catches.
5. `taskOverridesByEventId` keying risk under composite IDs is the latent collision vector.
6. Visual patterns (`CALENDAR_VISUAL_PATTERNS.md`) assume consistent data; divergence makes status badges, overdue treatment, and sprint toggle unreliable.

### Locked Calendar MVP Rules
- One canonical `selectCanonicalTasksForEvent(eventId: string): CanonicalTask[]` lives in `taskProjectionCore.ts` (or `obligationSelectors.ts`); it alone reads raw tasks + overrides + dedups composite event IDs.
- MasterCalendar, SprintPlanPage, Kanban board, Gantt, My Tasks **all** call only this selector; never re-project from `regulatoryExecutionStore` or raw events.
- View-specific reshape only: Gantt builds rows from the list; Kanban groups into columns; Calendar filters to visible dates; My Tasks applies user filter. Output array identical before reshape.
- Composite-event-ID dedup: `taskOverridesByEventId` keys normalized; selector returns stable `CanonicalTask` with `canonicalFormInstanceId` + status from CES state machine.
- After any CES action (complete/sign) or PM edit, refresh yields same count/status in all four views (Test 8 pass criteria).
- No direct mutation of overrides inside views; all writes go through canonical path.

### Open Conflicts / Contradictions
- `taskProjection.ts` (PM) vs `eventTaskAdapter.ts` + `signerTaskFactory.ts` (CES) both claim ownership of "projected tasks for calendar"; no arbitration rule yet.
- CES board Kanban uses parallel CES tokens/primitives while MasterCalendar uses shell — visual + data drift risk even after selector fix.
- Task bloat (25-40 per event) noted but Test 8 focuses on sync, not collapse (MVP-P0-TASK-001 separate).

### Canonical Owner Files
- `src/policy/compliance-execution/taskProjectionCore.ts` (core selector + dedup)
- `src/policy/compliance-execution/taskProjection.ts` (PM reshape only)
- `src/policy/compliance-execution/obligationSelectors.ts` (event/task adapter)
- `src/policy/compliance-execution/eventTaskAdapter.ts` + `signerTaskFactory.ts` (input factories, read-only for selector)
- `src/policy/pages/MasterCalendarPage.tsx` (consumer)
- `src/policy/pm/*` (SprintPlanPage, Kanban, Gantt, MyTasksPmPage — consumers only)
- Protected: `cesFormInstanceId.ts`, `taskIdentity.ts`, `regulatoryExecutionStore.ts`

---

## Lead 10 — Navigation & IA
### Scope
Define IA and navigation by persona. Enforce ≤3 taps to any daily operational task on mobile. Single canonical mobile bottom-nav (5 slots: Tasks / Calendar / Evidence / Library / More) and desktop primary nav. Non-production surfaces gated behind `feature.devSurface` flag for super-admin only.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/00_PRODUCTION_SURFACE_FILTER.md`
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/02_MOBILE_FIRST_DESIGN_PHILOSOPHY.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_SURFACE_INVENTORY.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_AUDIT_EXECUTIVE_SUMMARY.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_INTERACTION_PATTERN_AUDIT.md`
- Verified via Glob: `src/policy/components/CommandCenterLayout.tsx` (MOBILE_PRIMARY_TABS at lines 143-149)

### Headline Findings
1. **Production surfaces (core daily operational):** `/dashboard`, `/library` + `/:policyId` (PolicyDetailPage + SharedPolicyDetailView + GVGBDetailView as honored specimen), `/forms` + `/:formId` (eCign/FormSigningWorkspace), `/evidence` + artifacts, all `/ces/*`, `/my-tasks` + `/pm/*`, `/calendar` + MobileIncidentExecutionPage, real `/journey/*` (v1-journey, modules, supervisor), `/onboarding-v2/*`, `/audit`, `/framework/achc-survey` + SurveyorPolicyViewerPage, `/help/*`, operational staffing (`/clinicians`, `/patients`, `/staffing-calendar`), `/policy-lifecycle`, `/governance`.
2. **Non-production (explicitly excluded from primary nav):** DemoPage/DemoPhase*/iAdministrator/BradProposal (entire `/brad-proposal` and `/iadministrator`), HubstaffStagingPage, FrameworkPage, SystemDocumentationPage, TaxonomyPage/TaxonomyPage.old, MasterControlInventoryPage, any `.backup`/`.old`. Gated behind `feature.devSurface` for super-admin only.
3. **Current nav drift:** CommandCenterLayout MOBILE_PRIMARY_TABS uses Dashboard/Calendar/Tasks/Workflows/More; "More" routes to Help; full operational surfaces live behind hamburger requiring 3+ taps.
4. **Persona gaps:** No role-conditioned home pages or progressive disclosure by persona; all personas see identical complex drawers/tabs.
5. **Mobile failures:** Wide grids, sub-48 px targets, no bottom sheets, carousel fragility (StagingM01), dense tables, no one-handed thumb-zone CTAs, no state-resume on interruption.
6. **Strongest anchors:** CommandCenterLayout + ui/* primitives as shell owner; unified calendar; eCign packet builder; OnboardingV2 gates; GVGB as preserved specimen.

### Locked IA MVP Rules
- **Mobile bottom nav (5 slots canonical):** Tasks (personal queue, role-filtered), Calendar (today's visits/events), Evidence (quick capture + center), Library (policy reference), More (bottom sheet only — never a tree; role-specific: DON sign-offs, Surveyor findings, Help, Admin if permitted).
- **Desktop primary nav:** Mirrors the 5 + role-aware secondary rail or top-level (no hamburger for core flows).
- **Non-production gated:** All excluded surfaces hidden from primary nav and More sheet; only visible under `feature.devSurface` super-admin flag.
- **Persona-conditioned home page:** Field Clinician → Tasks queue; DON → sign-off/exception queue; Surveyor → ACHC policy+findings; Compliance → CES board; Trainer → Journey real modules. Enforced by PermissionGate/role rendering.
- **≤3 taps to daily tasks:** Task list → Execute (evidence/sign) → Submit. Policy reference is one-tap dismissible overlay. Safe back preserves partial state via `visibilitychange` + deterministic keys.
- **Progressive disclosure:** Clinician sees minimal hero actions (Capture/Sign); DON/surveyor/compliance see exception queues + one-tap approve. Structural, not just responsive.
- **Touch ergonomics:** All primary CTAs 48×48 px minimum; right-thumb zone; native camera one-tap; signature canvas 320×180 px usable.

### Open Conflicts / Contradictions
- Current MOBILE_PRIMARY_TABS uses "Workflows" slot instead of canonical "Evidence"; "More" routes to Help instead of role-conditioned bottom sheet.
- No explicit `feature.devSurface` flag implementation yet in nav gating.
- Journey theatrical staging (`/journey/staging/m01`) borderline non-production.

### Canonical Owner Files
- `src/policy/components/CommandCenterLayout.tsx` — mobile/desktop primary nav owner.
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/00_PRODUCTION_SURFACE_FILTER.md` — production vs non-production boundary.
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/02_MOBILE_FIRST_DESIGN_PHILOSOPHY.md` — task-first nav, ≤3-tap rule.
- `src/policy/components/ui/*` — primitives to enforce across all production surfaces.
- Persona home logic: PermissionGate + role filters in CommandCenterLayout.

---

## Lead 11 — Runtime Validation
### Scope
Define the runtime validation suite gating every MVP work package. Specify automated (typecheck + verify scripts), manual browser (the 9 QA tests), real-device (Mobile Field UAT Cohort), Compliance Lock regression on every PR touching forms/ecign/ces/evidence/onboarding-v2/policy-detail/mobile-shell, and execution order. Historical "Claude false-fix loop" (build green ≠ fixed) is the meta-risk.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/MVP_QA_IMPLEMENTATION_PLAN.md` (full; §10-§13)
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_BUILD_RESULTS.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_TEST_PLAN.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_TEST_EXECUTION_LOG.md`
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/MOBILE_FIRST_UX_RECONSTRUCTION_STRATEGY.md` (§8.7 Compliance Lock regression)
- `package.json` (verify + check scripts)

### Headline Findings
- **PASSING automated scripts today:** `npx tsc -b --noEmit`, `npm run build`, `npm run verify:task-identity`, `npm run verify:alignment`, `npm run verify:pm-unified`, `npm run check:evidence-phase15/21/23/235`, `npm run check:ecign-routes`, `npx tsx scripts/verify-feature-access.mjs`, `npm run verify:brad-scenario`.
- **Integration risks unit tests cannot catch:** multi-signer artifact ID drift (P0-ECIGN-001), signed PDF vs live HTML retrieval (P0-ECIGN-002), `form_instance_id` propagation (P0-CES-001), top-level `targetKind`/`targetId` (P1-AUDIT-001), Evidence Center refresh persistence (P1-EVIDENCE-001), Calendar/Sprint/Kanban/Gantt sync (P1-CALENDAR-001), permission boundary enforcement (P1-PERMS-001).
- **Zero of the 9 manual browser tests have execution records.**
- Compliance Lock regression must run on every PR touching the listed surfaces to protect eCign chain-of-custody, evidence hierarchy, and task identity.
- Mobile Field UAT Cohort (real iOS/Android, gloved one-handed clinicians + DONs + surveyors) is non-negotiable for any mobile-shell or eCign/CES change.
- Wave order + per-package browser gate before merge is the only defense against false-fix loop.

### Locked Runtime Validation MVP Rules — 5 Tiers
1. **Automated** (every commit/PR): `tsc -b --noEmit`, `npm run build`, `verify:task-identity`, `verify:alignment`, `verify:pm-unified`, all `check:evidence-phase*`, `check:ecign-routes`, `verify-feature-access.mjs`. Necessary but never sufficient.
2. **Manual browser** (real browser or Playwright; mandatory per-package gate): The 9 tests in `QA_UAT_TEST_PLAN.md`. No package closes without passing its mapped test(s).
3. **Mobile Field UAT Cohort** (real-device only): 12–15 field clinicians + 4–6 DONs + 3–5 surveyors on actual iPhone/Android/iPad under one-handed/gloved/weak-signal/interrupted conditions. 80% core-flow pass rate gate before any mobile code ships.
4. **Compliance Lock regression** (every PR touching forms/ecign/ces/evidence/onboarding-v2/policy-detail/mobile-shell): Full suite of relevant `verify:*` + `check:evidence-phase*` + `check:ecign-routes` + the mapped browser test(s) + visual diff on key surfaces.
5. **Visual Regression** (Playwright screenshot baselines or manual): On every package affecting layout. Baseline artifacts saved under `_Heavy/Fix-2026-05-14/wave-N/<package-id>/`.

**Execution order per wave:** automated → browser gate → Compliance Lock if surface touched → Mobile Field UAT if mobile relevant → visual regression → user sign-off + screenshot/log artifact before merge. Rollback = `git revert` of package branch.

### Open Conflicts / Contradictions
- Policy-viewer consolidation reports contradict on deletion status; must resolve before any further policy-detail work.
- Several verify scripts (calendar-keys, some evidence phases) are env-dependent or require dev server; not fully CI-portable.
- No Playwright tests wired for the 9 browser tests yet (only `@playwright/test` in devDeps); manual execution is current reality.

### Canonical Owner Files
- `verify:task-identity` / `verify:alignment` / `verify:pm-unified` → `cesFormInstanceId.ts`, `taskProjectionCore.ts`, `useEventExecutionDataflow.ts`.
- `check:evidence-phase*` / `check:ecign-routes` → `src/policy/ecign/api.ts`, `FormSigningWorkspace.tsx`, `localDemoAdapter.ts`, `server/ecign/`.
- `verify-feature-access.mjs` → `permissionCatalog.ts`, `userGroups.ts`, `cesRoles.ts`.
- All browser gates → `QA_UAT_TEST_PLAN.md` + execution logs in `QA_UAT_AUDIT/execution-logs/`.
- Mobile Field UAT + Compliance Lock → `MOBILE_FIRST_UX_RECONSTRUCTION_STRATEGY.md` canonical surfaces.

---

## Lead 12 — Browser UAT
### Scope
Drive the 9-test manual browser plan to ground truth. Capture artifacts per Execution Log template. Operate Mobile Field UAT Cohort (12–15 clinicians + 4–6 DONs + 3–5 surveyors). Simulated cohort (nursing lab + actor patient + interruptions + weak-signal) starts Wave 0 unconditionally. Real-agency cohort gated on executive sponsor.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_TEST_PLAN.md` (full: Tests 1–9 + prerequisites + automated matrix + log template)
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_TEST_EXECUTION_LOG.md` (template + CES-002 example)
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/MOBILE_FIRST_UX_RECONSTRUCTION_STRATEGY.md` (§8.1-8.6)
- `_Heavy/Fix-2026-05-14/MVP_QA_IMPLEMENTATION_PLAN.md` (§10 browser gates + P0/P1 status)

### Headline Findings
1. All 9 tests: zero execution records; status = NOT RUN.
2. Test 2 (DON Assistant→DON two-signer) and Test 3 (Download/Print/Open) highest risk — multi-signer artifact drift + live HTML vs stored PDF confirmed broken.
3. Tests 4–6 (Evidence/Audit/URL hydration) blocked by P1-EVIDENCE-001, P1-AUDIT-001, P0-CES-001.
4. Test 7 (GV-GB-001 print) + Test 8 (Calendar sync) show design drift + divergent projections per P1-PRINT-001 / P1-CALENDAR-001.
5. Cohort: exactly 12–15 clinicians + 4–6 DONs + 3–5 surveyors required; simulated Wave 0 unconditional; real-agency gated.

### Locked Browser UAT MVP Rules
- 9 tests run sequentially against `main` before any Wave 1.
- Re-run affected tests after every wave.
- Full re-run before MVP cut.
- Simulated cohort starts Wave 0 unconditionally.
- Real-agency cohort gated on executive sponsor sign-off.
- Every package marked done only after browser gate.
- All artifacts (screenshots, console, network) stored in `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/execution-logs/` (git-ignored).
- Use incognito/fresh profile per flow; `VITE_LOCAL_DEMO_AUTH_BYPASS=true`; clean `npm run dev`.

### Per-Test Pass Criteria (binary, deterministic)
- **Test 1:** No console errors on static load; read-only nav (Dashboard/Library/CES/Evidence/Forms) works; demo auth succeeds.
- **Test 2:** Single `signed_package` artifact for `canonicalFormInstanceId`; Evidence shows both signers; Audit has `FORM_COMPLETED` + `SIGNED_PACKAGE_CREATED`/`ARTIFACT_LOCKED` with identical top-level `targetId`; all links resolve to same content + cert.
- **Test 3:** Download/Print/Open Signed Artifact/Certificate from Evidence + Audit + Viewer resolve to byte-identical artifact.
- **Test 4:** Post-refresh + session restart, Evidence shows same artifactId; all links functional.
- **Test 5:** Every form/evidence audit row has top-level `targetKind`/`targetId`; all "View Artifact" links resolve correctly.
- **Test 6:** `?form_instance_id=...` deep link restores exact saved field values (not template).
- **Test 7:** GV-GB-001 Print View / browser print / PDF matches master design (logo, margins, layout); no branding bleed to eCign.
- **Test 8:** Calendar/Sprint/Kanban/Gantt/My Tasks show identical task status/due date after CES action + refresh.
- **Test 9:** Onboarding role blocked from `/admin/users`, permissions, systemDocumentation, publish/override; UI shows "insufficient permissions".

### Open Conflicts / Contradictions
- MVP plan asserts build green + zero of 9 tests executed; test plan claims "Ready for execution".
- Trainer permission matrix (verify-feature-access.mjs PASSED) vs browser leakage (P1-PERMS-001) unvalidated in real UI.
- Policy print fidelity (Test 7) vs eCign print leakage (P1-PRINT-001) — no shared component owner declared.

---

## Lead 13 — Design System
### Scope
Enforce single Care Indeed teal/orange design token system across all operational surfaces. Collapse five parallel theme dialects. Block new parallel families via lint + PR gate. Automate "no glass-on-glass-on-glass" (max 2 layers; 3rd only for elevated portal modal) and "no hardcoded hex". Extend `scripts/verifyUiDesignSystem.ts` with strict rules. Care Indeed teal `#007970` = primary operational; orange `#C74601` = CTA/escalation/overdue/critical only; CI-ION maroon = FORBIDDEN on operational surfaces.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_DESIGN_SYSTEM_AUDIT.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_CANONICAL_COMPONENTS_MAP.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_DRIFT_AND_REDUNDANCY_REPORT.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/COLOR_TOKENS.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/DESIGN_TOKEN_EXPORT_GUIDE.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/TAILWIND_AND_TOKEN_INTEGRATION.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/DESIGN_SYSTEM_GOVERNANCE.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/MASTER_IMPLEMENTATION_READINESS_CHECKLIST.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/DOS_AND_DONTS.md`
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/06_07_COMPONENT_CONSOLIDATION_MOBILE_UX_ENFORCEMENT.md`

### Headline Findings
- **5 distinct parallel theme dialects confirmed** (main CI teal/orange + CES navy/orange + eCign navy/orange + Journey cinematic dark + Onboarding V2 professional light) plus domain palettes; all must collapse to one Care Indeed teal/orange system.
- **2313+ inline `style={{`** + widespread hardcoded hex (`#1F1C1B`, `#E5E4E3`, `#007970`, `#C74601`, slate/gray-*, arbitrary `text-[22px]`, `rounded-[14px]`, `shadow-[...]`) documented across GVGB, Shared, CES, FormSigning, Library, Demo.
- Primitives (`ui/SurfaceCard`, `GlassPanel`, `Tabs`, `ActionButton`, `CiStatusBadge`, `DataGrid`, `EmptyState`) exist and are mature but under-adopted outside shell; parallel families (CesCard, SCard, local TabButton, legacy StatusBadge, 5 print systems) dominate.
- Glass philosophy ("one-glass, no stacked sub-cards") defined but violated on most pages; max-2-layer + 3rd-only-for-elevated-modal must be lint-enforced.
- Typography/spacing/radius use `--ci-*` tokens in primitives but arbitrary values and mixed Montserrat/Roboto tracking everywhere.
- Strong token definition in `:root` but weak adoption; `lightColorRemap.ts` is acknowledged band-aid.
- Governance, token export, and `DOS_AND_DONTS` exist but lack automated lint/PR gate; `verifyUiDesignSystem.ts` is the enforcement hook.

### Locked Design System MVP Rules
- **Tokens:** Single source `--ci-*` (teal `#007970` primary; orange `#C74601` CTA/escalation only; navy for dark headers only). No new brand colors.
- **Primitives:** All live in `src/policy/components/ui/`. Export from `ui/index.ts`. Zero local definitions in pages/ces/regulatory/.
- **Themes:** Collapse to one Care Indeed teal/orange system. Remove `CES_TOKENS`, eCign navy/orange, Journey cinematic, Onboarding V2 parallel. `data-ci-mode` + `useCiModeStore` as single store.
- **Glass layering:** Max 2 layers on operational surfaces. Layer 3 only for elevated modal in portal. Enforce via `verifyUiDesignSystem.ts` glass-stack counter.
- **Accent semantics:** Teal = stable/compliant/secondary; Orange = CTA/pending/overdue/critical only. Maroon/gold forbidden on operational surfaces.
- **Typography:** Outfit/Montserrat headings, Roboto body. Token scale only. No `text-[22px]`, `tracking-[0.22em]` inline.
- **Spacing:** `--space-*` + 8 px grid only. Touch targets ≥44 px (`--spacing-touch`).
- **Motion:** Reduced-motion first; calm, purposeful only.
- **Print:** Unify to FormBody + shared `PrintableHeader`/`Section` variants. `GVGBPrintDocument` / `PrintPage` / `FormPrintView` / packet builder converge on single chrome.
- **Tooling:** Extend `scripts/verifyUiDesignSystem.ts` with hex/inline-style drift scan, glass stacking >2 detection, sub-44 px target audit, signature canvas wrapper check. Fail PR on violations.
- **Calm visual language enforcement:** Operational/trustworthy/expensive/modern/calm/audit-ready/compliance-focused only. Explicitly forbidden: consumer SaaS polish, fintech gradients, crypto neon, cyberpunk darks, playful illustrations, over-animated micro-interactions.

### Open Conflicts / Contradictions
- `COLOR_TOKENS.md` lists `--color-brand-orange: #E07B2C` while audits and scope lock `#C74601` as canonical CTA.
- `DOS_AND_DONTS` allows "max 3 layers total" while scope locks "max 2 + 3rd only for elevated modal".
- Some design docs still reference CI-ION maroon/gold as viable while audits declare them FORBIDDEN.
- `TAILWIND_AND_TOKEN_INTEGRATION` suggests hybrid short-term while governance and 06_07 demand immediate primitive-only.

### Canonical Owner Files
- `src/policy/components/ui/` (all primitives + `index.ts`)
- `src/index.css` (`:root` tokens + flat enforcement + print resets)
- `tailwind.config.js` (ci palette + glass shadows)
- `scripts/verifyUiDesignSystem.ts` (to be extended)
- `src/policy/components/CommandCenterLayout.tsx`
- New: `DESIGN_OWNERS.md` (explicit owners + "CANONICAL — do not create parallel")

---

## Lead 14 — Dataflow / Identity
### Scope
Guarantee deterministic identity at every layer (form_instance_id, signer task ID, artifact ID, audit targetId). URL is canonical source of truth for hydration/refresh/signer transition. Cross-system seam eCign `FI-…` ↔ CES `{eventId}-{formId}-{seq}` is highest-risk boundary. `cesFormInstanceId.ts` is sole ID builder; `useEventExecutionDataflow.ts` threads it; `WorkflowExecutionPanel.tsx` consumes it. No other write paths. Audit emitter must emit top-level `targetKind`+`targetId`. `taskIdentity.ts` frozen.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/MVP_QA_IMPLEMENTATION_PLAN.md` (full + §6 Canonical Ownership Map lines 94-156; P0-CES-001 at 50; P1-AUDIT-001 at 63; P1-ARTIFACT-001 at 64)
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/eCIgn_Legal_Defensibility_Gap_Analysis.md` (§2.4 lines 70-74)
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_EXECUTIVE_SUMMARY.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/QA_UAT_BUILD_RESULTS.md`
- `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/FINAL_QA_UAT_REPORT.md`
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/MOBILE_FIRST_UX_RECONSTRUCTION_STRATEGY.md` (ID references lines 44, 143, 200)
- Optional verify: `src/policy/compliance-execution/cesFormInstanceId.ts`, `useEventExecutionDataflow.ts`

### Headline Findings
1. CES canonical ID format is strictly `{eventId}-{formId}-{seq:03d}` (`cesFormInstanceId.ts:8-10`); legacy double-dash `{eventId}--{formId}` supported only for parse/resolve. eCign uses `FI-…` prefix.
2. Highest-risk seam: eCign `form_instance_id` (FI-…) and CES `canonicalFormInstanceId` not consistently linked in evidence/audit records.
3. Multi-signer artifact drift (P0-ECIGN-001): `removeEvidence` + `uploadEvidence` in FormSigningWorkspace creates N artifacts per canonical form_instance, breaking chain-of-custody.
4. `form_instance_id` not propagated on Complete Form from WorkflowExecutionPanel (DON Assistant → DON path) — direct violation of URL-canonical rule.
5. Audit `targetKind`/`targetId` still nested under `after.*` instead of top-level (P1-AUDIT-001).
6. ArtifactViewerPage uses heuristic `resolveFormInstanceFromArtifactCandidates` + legacy fallback (P1-ARTIFACT-001); no deterministic reverse lookup.
7. All verification scripts pass on unit level but miss integration seams requiring browser validation.

### Locked Identity MVP Rules
- URL is canonical: every form open path must carry `?form_instance_id=...`; absence is defect.
- `cesFormInstanceId.ts` is sole builder (`formatCesFormInstanceId`); no other file may construct the `{eventId}-{formId}-{seq}` string.
- `useEventExecutionDataflow.ts` is the single threading layer; `WorkflowExecutionPanel.tsx` is sole consumer for "Complete Form".
- Audit emitter must populate top-level `targetKind`+`targetId` for every `form_instance`/`artifact` action; `after.*` dual-write permitted only for one release transition window.
- `taskIdentity.ts` is architecturally frozen.
- No API drift on hydration, refresh, or signer transition; single canonical artifact per `canonicalFormInstanceId` even across signers.

### Open Conflicts / Contradictions
- Heuristic resolution in ArtifactViewerPage vs. deterministic requirement in `cesFormInstanceId.ts`.
- Client-only role gates (`cesRoles.ts`) vs. server-side enforcement gap.
- In-memory `regulatoryExecutionStore` drafts survive refresh only after P1-EVIDENCE-001; conflicts with URL hydration expectation.
- Mobile strategy assumes stable `form_instance_id` + `canonicalFormInstanceId` but current multi-signer path violates it.

### Canonical Owner Files
- `src/policy/compliance-execution/cesFormInstanceId.ts` (ID builder + legacy resolve)
- `src/policy/compliance-execution/useEventExecutionDataflow.ts` (threads ID to requirements)
- `src/policy/compliance-execution/taskIdentity.ts` (frozen; dedup/merge)
- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` (consumer; Complete Form path)
- `src/policy/pages/ArtifactViewerPage.tsx` (resolution; must become deterministic)
- `src/policy/stores/regulatoryExecutionStore.ts` (`getOrCreateFormInstance` alignment)
- `server/identity/...` audit utilities + `taskAuditEvent.ts` (top-level `targetKind`/`targetId` emitter)

---

## Lead 15 — Operational Realism
### Scope
Veto authority only. Reject any plan, component, or flow that fails the 2 pm Tuesday rural patient living room test: gloved one-handed clinician, 1-bar signal, mid-signature family interrupt, 8–15 min time-boxed visit, low battery, patient-present pressure. No consumer-SaaS polish, celebratory micro-interactions, fintech/crypto/cyberpunk aesthetics, or anything increasing taps, cognitive load, or data-loss risk for the field clinician. Persona order locked: clinician > DON > surveyor > compliance officer > trainer.

### Files Actually Read
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/MOBILE_FIRST_UX_RECONSTRUCTION_STRATEGY.md` (full §9 + 2pm Tuesday narrative)
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/02_MOBILE_FIRST_DESIGN_PHILOSOPHY.md` (full §7 clinician, §8 surveyor, §9 DON, North Star 2pm Tuesday)
- `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/00_PRODUCTION_SURFACE_FILTER.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/UIUX_MOBILE_RESPONSIVE_AUDIT.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/CONTENT_EXAMPLES_GALLERY.md`
- `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/design/EVIDENCE_CAPTURE_SPECIFICATION.md`

### Headline Findings — Brutal Real-Condition Failures
1. **FormSigningWorkspace + signature canvas:** 5/10 mobile score. Tiny 1400×420 internal canvas, sub-48 px controls, no finger smoothing/undo, no IndexedDB partial-stroke persistence → mid-signature phone call or low-memory kill loses work. Direct legal-chain break risk.
2. **CES board / WorkflowExecutionPanel / MyTasks:** 4/10. Horizontal kanban scroll, dense tables, mouse-drag only, no bottom-sheet task executor, no offline queue → clinician at 2 pm Tuesday with patient in pain cannot complete one-handed in <90 s.
3. **OnboardingV2 UnitDrawer + BatchView 9/3 grid:** 4/10. 760 px fixed drawer, 12-col grids, no role-filtered progressive disclosure → surveyor or DON under 20-min unannounced pressure faces horizontal scroll and tab overload.
4. **Evidence capture + hierarchy:** Manual filename inputs, no native `capture="environment"`, deep nesting, no resumable chunked upload → photo fails in basement weak signal; 4 MB blob blocks UI.
5. **StagingM01 / Journey cinematic:** Absolute `vw` carousels, fixed HUD, 47 images + video → breaks on phone; zero one-handed glove path for required cultural-competency training.
6. **No interruption or weak-signal engine** anywhere in core paths. Zero `visibilitychange` + IndexedDB serialization for form fields + partial signatures + evidence queue → 30 s–45 min resume destroys state. 2 pm Tuesday failure mode #1.
7. **Touch targets & thumb zone:** Dozens of <44 px (tabs 28-32 px, clear buttons 11 px text) → gloved right-thumb miss rate >30 % in real UAT scenarios.

### Locked Operational Realism MVP Rules
- Every operational page must surface the single next 30-second action in ≤2 taps.
- Primary clinician surface = personal task queue (Tasks/Calendar) → one-tap execution bottom sheet (evidence + sign + submit). No dashboards, no 12-col tables, no hunting.
- Minimum 48×48 px touch targets everywhere; primary CTAs (Capture, Sign, Submit, Next Patient) locked in bottom-right 35 % thumb zone.
- Persona priority order: clinician > DON > surveyor > compliance officer > trainer.
- Calm confirmation only. VETO on celebratory micro-interactions on compliance flows.
- VETO on consumer-SaaS / fintech / crypto / cyberpunk / playful visual moves.
- VETO on any choice that makes the 2 pm Tuesday scenario harder.

### Canonical Owner Files (Untouchable Domain Engines)
Protect at all costs — these are the parts that make the product defensible:
- CES engine (`regulatoryExecutionStore.ts`, `obligationSelectors.ts`, `useExecutionEnforcement.ts`, `enforcementEngine.ts`, `cesRoles.ts`, `cesExecutionMode.ts`, SprintExecutionBoard, WorkflowExecutionPanel)
- eCign multi-signer + packet + hash chain (entire `server/ecign/` + `buildPrintablePacketHtml` legal overlay)
- Evidence hierarchy + traceability (`cesEvidenceHierarchy`, audit event log, `queryEvidenceByContext`)
- OnboardingV2 gate / reconciliation engine
- Policy governance, lifecycle, autogen, compliance mapping
- Journey regulatory mapping (achcLessons, trainingContent, module player structure)
- Feature gating / permission system (FeatureRouteGuard, PermissionGate, `server/access/*`, `approvedUsers`)

---

## Lead 16 — Final Convergence & Go/No-Go
### Scope
Arbitrate all 16 cross-lead conflicts from Leads 1-15. Issue single binding Go/No-Go MVP Readiness Assessment. All decisions binary; all source disagreements cited; final state locked for Waves 0-7.

### Cross-Lead Conflicts Arbitrated (binding)

| # | Conflict | Arbitration (BINDING) |
|---|----------|------------------------|
| C1 | Glass layer max: Lead 1 "max 3 with L3 exception" vs Lead 13 "max 2 + 3rd only for elevated modal" vs DOS_AND_DONTS "max 3 layers total" | **Max 3 glass layers total**. Layer 3 permitted ONLY for elevated portal modals. |
| C2 | Orange hex: COLOR_TOKENS `#E07B2C` vs Lead 1/13 `#C74601` | **Canonical CTA orange: `#C74601`**. `#E07B2C` demoted to secondary accent only. |
| C3 | Care Indeed teal/orange only vs V2 doc adding navy | **Teal `#007970` primary + `#C74601` CTA only** on operational/compliance. Navy forbidden except legacy Journey V1 cinematic (no migration path). |
| C4 | RightDrawer on desktop allowed vs bottom-sheet mandate <1024 px | **<1024 px MUST bottom-sheet** (drag handle + snap + swipe-down + persist); **≥1024 px RightDrawer 480-520 px** permitted. |
| C5 | SignaturePad 300 px vs 320 px height | **MVP minimum: 320 px** canvas height. |
| C6 | Frozen FormSigningWorkspace + FormViewer vs required edits for P0-ECIGN-001/002 + P1-A11Y-005 | **Owner-led patches ONLY**. Files remain frozen except explicit P0/P1 owner changes. No drive-by edits. |
| C7 | Frozen evidence files vs required edits for P1-EVIDENCE/AUDIT/ARTIFACT | **Owner-led patches ONLY** for `cesFormInstanceId.ts`, `localDemoAdapter`, `cesEvidenceHierarchy`. |
| C8 | "Consolidate Work To Do" P2/DEFER vs Lead 8 High Priority core to P0-TASK-001 | **Elevated to P0-TASK-001 core deliverable**. Must complete Waves 2-3. MVP plan §5 overridden. |
| C9 | Policy-viewer DELETE vs CONSOLIDATION reports | **CONSOLIDATION report is current truth**. DELETE report superseded. |
| C10 | StagingM01 production vs non-production | **NON-PRODUCTION**. Gated by `feature.devSurface` for super-admin only. |
| C11 | Current CommandCenterLayout "Workflows" slot vs canonical "Evidence" slot | **"Evidence"** in 5-slot mobile bottom nav. CommandCenterLayout must update. |
| C12 | Simulated cohort start vs real-agency requirement | Wave 0 **simulated cohort unconditional**. Real-agency cohort gated after Wave 0 pass + Compliance Lock. |
| C13 | Multi-signer snapshot review vs accessibility equivalence | **Same direction:** `getPrintableFormHtml` must preserve ARIA+dynamic+values for SR equivalence. |
| C14 | CES `theme.ts`/CesCard parallel vs single teal/orange system | **Explicit mapping rule** to single `#007970`/`#C74601` tokens in Wave 1. No parallel dialects permitted. |
| C15 | Journey V1 cinematic preservation vs single design system | **Journey V1 cinematic preserved as-is** (separate surface). No migration. All other surfaces unified. |
| C16 | `grok-4.3-heavy` not in available model list; `grok-4.3` used; CLI shows only `grok-build` | **Acceptable**. `grok-4.3` is active runtime model; `grok-build` is CLI build tool, not model slug. |

### Final Stamp — Locked Design Principles (binding)
- Single Care Indeed teal `#007970` primary + `#C74601` CTA orange only (navy forbidden on operational surfaces).
- Max 3 glass layers total (Layer 3 = elevated portal modals only).
- 48 px touch targets (44 px floor), 320 px SignaturePad minimum, 16 px iOS body.
- Bottom-sheet drawer <1024 px; RightDrawer 480-520 px ≥1024 px.
- Zero parallel theme dialects; `ui/` primitives only; tokens scale, no arbitrary Tailwind.
- Reduced-motion first; calm operational language only (consumer-SaaS / fintech / crypto / cyberpunk / playful VETO).
- Vector PDF print with brand header + cert ID + signer metadata on every page.
- URL is canonical source of truth; `cesFormInstanceId.ts` sole builder.

### Final Stamp — Locked Operational Priorities (binding)
- Clinician > DON > Surveyor > Compliance > Trainer.
- Every operational page surfaces single next 30-s action in ≤2 taps.
- Primary CTAs locked bottom-right 35 % thumb zone.
- Composite collapse is VIEW-ONLY backend untouched.
- Owner-led patches only on frozen files for P0/P1 items.
- VETO on any celebratory or non-operational visual language.

### Wave Order
- **Wave 0:** Simulated cohort + 9 browser tests + Compliance Lock regression (unconditional).
- **Wave 1:** CES P0-CES-001 + theme unification + mobile bottom-sheet + SignaturePad 320 px.
- **Wave 2:** Evidence/Artifact P1 + Work To Do consolidation (P0-TASK-001) + CommandCenterLayout "Evidence" slot.
- **Wave 3:** eCign P0-ECIGN-001/002 + Accessibility P1 (ARIA, dialogs, contrast).
- **Wave 4-7:** Remaining P1 items, visual regression, real-agency cohort, full re-run.
- **Wave 8 (post-MVP):** DEFER items, StagingM01 removal, full mobile reconstruction.

### Go/No-Go MVP Readiness Assessment
- **Desktop demo:** CONDITIONAL GO — pending P0-CES-001, P0-ECIGN-001/002, theme unification, RightDrawer width fix.
- **Field UAT:** CONDITIONAL GO — pending mobile bottom-sheet enforcement, 320 px SignaturePad, 48 px targets everywhere, IndexedDB blob persistence.
- **Surveyor on-site:** CONDITIONAL GO — pending print fidelity + snapshot ARIA preservation + deterministic artifact resolution.
- **DON daily desktop:** GO — MasterCalendar + RightDrawer surfaces already strong; only minor hover token alignment needed.
- **Compliance/CES operator:** CONDITIONAL GO — pending multi-signer artifact supersede chain + form_instance_id propagation + server role gate.
- **Production broad release:** NO-GO — requires full Wave 0-7 completion, real-agency cohort pass, visual regression artifacts, and zero open P0/P1 items.

### Mandatory Pre-MVP-Cut Checklist (operator confirms each)
- All P0 items (CES-001, ECIGN-001/002, TASK-001) patched by owners with `verify:task-identity`/`alignment` + `check:ecign-routes` passing.
- Theme unification complete: zero parallel dialects, single teal/orange tokens, CES `theme.ts`/CesCard mapped.
- Mobile: bottom-sheet <1024 px active, SignaturePad 320 px minimum, 48 px targets on all primary surfaces.
- Evidence: deterministic `cesFormInstanceId.ts`, IndexedDB-class blob persistence with dual-write window, top-level audit fields.
- Accessibility: ARIA preserved in `getPrintableFormHtml` snapshots, dialog semantics + focus trap on WorkflowExecutionPanel, 4.5:1 contrast everywhere.
- Browser UAT: all 9 tests executed sequentially against `main`, binary pass criteria met, artifacts logged.
- Print: vector PDF + ci-brand-header + cert ID + signer metadata on every page; zero header drift.
- CommandCenterLayout updated to canonical "Evidence" slot in 5-slot mobile bottom nav.
- Wave 0 simulated cohort + Compliance Lock regression passed; no env-dependent script failures.
- No consumer-SaaS / fintech / crypto / cyberpunk / playful language or visuals remain on operational surfaces.
- Frozen files touched only via owner-led P0/P1 patches; no drive-by edits.
- Real-agency cohort gated behind Wave 0 pass + visual regression sign-off.

**Binding decision: MVP proceeds under the CONDITIONAL GO conditions above. All arbitrations final.**

---

# PART II — THE 19 MANDATED DELIVERABLES (synthesized from the 16 Grok lead outputs above)

## 1. Executive Summary
The MVP risk is integrational, not architectural. Build is green; identity verifies (`verify:task-identity` PASS, alignment 100 %, 22/24 unified projection, 18/18 eCign routes, feature access matrix PASS). What does **not** verify at unit level is exactly what blocks MVP: multi-signer artifact identity (P0-ECIGN-001), signed-PDF retrieval fidelity (P0-ECIGN-002), `form_instance_id` propagation (P0-CES-001), audit `targetKind`/`targetId` shape (P1-AUDIT-001), evidence blob persistence across refresh (P1-EVIDENCE-001), and the WCAG 2.2 AA floor on the five regulated surfaces (P0-A11Y-001/002/003 + P1-A11Y-004/005/006). Zero of nine manual browser tests have ever been executed. Mobile readiness ≈5/10 (Lead 2); StagingM01 is non-production (Lead 16 C10). The plan enforces a Wave 0 reality-check (no code, baseline screenshots, 9 tests against `main`, simulated cohort start), then Waves 1–7 with one canonical design system (Care Indeed teal `#007970` + `#C74601` CTA only, max 3 glass layers, mobile-first), composite `Form + Signers` view-only collapse (Lead 8: 25–40 → ~10–12 items per event), IndexedDB-class evidence persistence, top-level audit fields with dual-write window, deterministic artifact reverse lookup, supersede-chain artifacts, byte-identical stored PDF retrieval, server role + required-fields gates, and ARIA-preserving snapshots. The Compliance Lock regression (Lead 11) runs on every PR touching forms/ecign/ces/evidence/onboarding-v2/policy-detail/mobile-shell. Lead 16 stamps CONDITIONAL GO for desktop demo / DON daily desktop / Compliance/CES operator after Waves 1–6; NO-GO for production broad release until Wave 0–7 complete.

## 2. Unified Architecture Alignment Report
Seven layers, owners, status per Leads 1–14:

| Layer | Canonical Owners | Lead | Status | Alignment Action |
|------|------------------|------|--------|------------------|
| Shell + Navigation | `CommandCenterLayout.tsx`, `ui/*`, `uiStore`, `navStore`, `ciModeStore` | L1, L10 | Stable desktop; weak mobile | Bottom-sheet behavior <1024 px (Lead 2/16 C4); 5-slot bottom nav with "Evidence" (Lead 10/16 C11). |
| Policy Detail | `PolicyDetailPage.tsx` (delegator), `SharedPolicyDetailView.tsx`, `GVGBDetailView.tsx` (specimen) | L1, L3 | Normalized except GVGB internal primitives | Migrate GVGB local `Card`/`TabButton`/`SimpleTable`/`SectionTitle` to `ui/` primitives; preserve sticky-header + `gvgb-enter`. |
| Forms + eCign Packet | `FormViewer.tsx`, `FormSigningWorkspace.tsx`, `FormPrintView.tsx`, `ecign/api.ts`, `server/ecign/*` (frozen) | L5, L7 | Sophisticated but artifact identity broken; a11y below WCAG | Owner-led patches only (Lead 16 C6); MVP-P0-ECIGN-001/002, MVP-P0-A11Y-001/002/003. |
| CES Task Identity + Projection | `taskIdentity.ts` (frozen), `cesFormInstanceId.ts`, `eventTaskAdapter.ts`, `taskProjectionCore.ts`, `regulatoryExecutionStore.ts` (frozen) | L4, L8, L14 | Mathematically clean; UI bloated | Composite collapse view-only; URL canonical (Lead 14). |
| Evidence + Artifact | `EvidenceCenterPage.tsx`, `CesEvidenceHierarchyPanel.tsx`, `ArtifactViewerPage.tsx`, `localDemoAdapter.ts`, `cesEvidenceHierarchy.ts` | L6 | Metadata-only after refresh; heuristic resolution | IndexedDB persistence; deterministic reverse lookup; tree/grid ARIA. |
| Audit | server audit emitter, `taskAuditEvent.ts`, `AuditModePage.tsx` | L6, L14 | Buried in `after.*` | Top-level `targetKind`/`targetId` with dual-write window. |
| Calendar + PM | `MasterCalendarPage.tsx`, `pm/*`, `taskProjectionCore.ts`, `obligationSelectors.ts` | L9 | Strong unified view; divergent counts | Single `selectCanonicalTasksForEvent`; all 4 views consume identical output. |

Cross-layer invariants (Lead 14, Lead 5, Lead 6, Lead 2): one `signed_package` per `canonicalFormInstanceId`; URL contains `form_instance_id` iff projector emitted one; audit events top-level `targetKind`/`targetId`; drawers <1024 px = `BottomSheetDrawer`; max 3 glass layers (Layer 3 portal-modal only).

## 3. UI/UX + MVP QA/UAT Crosswalk
(Synthesized from Leads 1, 3, 4, 5, 6, 7, 8, 11, 13)

| MVP Work Package | Coupled UI/UX Audit Finding | Coupled Leads | Surface | Combined Action |
|------------------|------------------------------|---------------|---------|-----------------|
| MVP-P0-AUTH-001 (Vercel) | — | L11, L12 | Auth pages | Browser Test 1. |
| MVP-P0-AUTH-002 (CSV) | — | L12 | Registration | Config. |
| MVP-P0-ECIGN-001 (supersede) | 5 print systems drift; signed packet "two renderers" | L1, L5, L13 | FormSigningWorkspace Options + Evidence Center | Apply patch; unify packet renderer (Lead 13 print convergence). |
| MVP-P0-ECIGN-002 (stored PDF) | FormSigningWorkspace white-screen Options; ci-brand-header battle | L5, L13 | Download/Print/Open | Store bytes at lock; FormBody header canonical; eCign appends overlays. |
| MVP-P0-CES-001 (form_instance_id) | Dense CES friction | L4, L14 | WorkflowExecutionPanel → FormViewer | Centralize in `cesFormInstanceId.ts`; thread via `useEventExecutionDataflow.ts`. |
| MVP-P0-A11Y-001 (form labels) | UIUX_ACCESSIBILITY "Form Labels + Error Messaging" | L7 | FormViewer Field | `htmlFor`/`id` + remove placeholder-as-label + `aria-describedby`. |
| MVP-P0-A11Y-002 (drawer dialog) | UIUX_ACCESSIBILITY "Modals/Drawers" | L7 | WorkflowExecutionPanel | `role="dialog"` + `aria-modal` + trap + return. |
| MVP-P0-A11Y-003 (aria-live) | UIUX_ACCESSIBILITY "Live Regions" | L7 | FormViewer, FormSigningWorkspace, EvidenceCenter | Polite live regions. |
| MVP-P0-TASK-001 (composite) | Dense CES; declutter proposal | L8, L1 | WorkflowExecutionPanel, My Tasks, CES Board | View-only collapse; "Form Complete + X/Y Signatures". |
| MVP-P1-EVIDENCE-001 (blob) | Evidence Center mobile penalty | L6 | EvidenceCenterPage + ArtifactViewerPage | IndexedDB; skeleton on rehydrate. |
| MVP-P1-AUDIT-001 (targetKind/Id) | — | L6, L14 | Audit emitter | Top-level + dual-write `after.*`. |
| MVP-P1-ARTIFACT-001 (reverse lookup) | ArtifactViewer fidelity | L6, L14 | ArtifactViewerPage | Deterministic `cesFormInstanceId.fromArtifact()`. |
| MVP-P1-PRINT-001 (drift) | 5 print systems | L5, L13 | GVGBPrintDocument, PrintPage, FormPrintView, eCign packet | Shared utils; FormBody owns form identity. |
| MVP-P1-CALENDAR-001 (sync) | pm/ces parallel surfaces | L9 | MasterCalendar, Sprint, Kanban, Gantt | One `selectCanonicalTasksForEvent`. |
| MVP-P1-ECIGN-003 (server role) | — | L5 | `server/ecign/stateMachine.ts` lock | Server re-assert actor.role ∈ required_signers. |
| MVP-P1-ECIGN-004 (req fields) | UIUX_ACCESSIBILITY validation | L5, L7 | `ecign/api.ts` + FormViewer | Completeness gate + inline `role="alert"`. |
| MVP-P1-A11Y-004 (tree/grid roles) | Accessibility_Compliance_Deep_Audit §1 | L7, L6 | CesEvidenceHierarchyPanel, WorkflowExecutionPanel | Roles + arrow nav. |
| MVP-P1-A11Y-005 (snapshot) | Full_App_Accessibility §3 | L7, L5 | `getPrintableFormHtml` | Preserve headings/labels/descriptions. |
| MVP-P1-A11Y-006 (keyboard) | Interaction Pattern Audit | L7 | WorkflowExecutionPanel, CesEvidenceHierarchyPanel | Roving tabIndex + arrows. |
| MVP-P1-PERMS-001 (Trainer) | Feature Gating §8 | L10, L12 | permissionCatalog, userGroups | Hide `user.provision`; URL-guard; browser Test 9. |
| MVP-P1-OPS-001 (discipline) | — | L11, L12 | (process) | The 9-test browser plan = runtime ground truth. |

## 4. Conflict & Drift Analysis
The 16 cross-lead conflicts in Lead 16's table are the canonical arbitration record. Each is binary and binding. Implementation drift in the source (per Leads 1, 2, 3, 13): `ces/components/primitives.tsx` (CesCard + CES_TOKENS), `GVGBDetailView.tsx` local primitives, `FormSigningWorkspace.tsx` NAVY/ORANGE + ci-brand-header battle, `SharedPolicyDetailView.tsx:1482+` custom tabs with hardcoded `#C74601`, legacy `StatusBadge.tsx`, `LibraryPage.tsx` `.glass-panel-lib`, four side-only drawer families, 13+ animate-spin loading variants, `Builder/`/`Bin-(thrash)/` 80+ tracked files (defer), `*.backup`/`.old` orphans (archive). UI/Workflow tensions: GVGB sticky header preserved (Lead 1/16); composite collapse audit-counts unchanged (Lead 4/8); iframe packet preview replaced by sanitized in-page render (Lead 3); StagingM01 carousel non-production (Lead 16 C10); multi-signer snapshot must preserve ARIA (Lead 5 + Lead 7); 5 overlapping "Work To Do" surfaces consolidated to one canonical Requirements & Progress (Lead 8 / Lead 16 C8).

## 5. Unified Priority Matrix

| Priority | Package | Leads | Wave | Browser Test |
|----------|---------|-------|------|--------------|
| P0 | MVP-P0-AUTH-001 | L11, L12 | 0–1 | Test 1 |
| P0 | MVP-P0-AUTH-002 | L12 | 0–1 | (config) |
| P0 | MVP-P0-CES-001 | L4, L14 | 1 | Test 6 |
| P0 | MVP-P0-ECIGN-001 | L5, L1, L13 | 3 | Test 2 |
| P0 | MVP-P0-ECIGN-002 | L5, L13 | 3 | Test 3 |
| P0 | MVP-P0-A11Y-001/002/003 | L7 | 3 | Manual SR + keyboard |
| P0 | MVP-P0-TASK-001 | L8, L1 | 2 (per Lead 16 C8 elevation) | Manual review |
| P1 | MVP-P1-EVIDENCE-001 | L6 | 2 | Test 4 |
| P1 | MVP-P1-AUDIT-001 | L6, L14 | 2 | Test 5 |
| P1 | MVP-P1-ARTIFACT-001 | L6, L14 | 2 | Test 5 |
| P1 | MVP-P1-PRINT-001 | L5, L13 | 5 | Test 7 |
| P1 | MVP-P1-CALENDAR-001 | L9 | 4 | Test 8 |
| P1 | MVP-P1-ECIGN-003 | L5 | 4 | server/Postman |
| P1 | MVP-P1-ECIGN-004 | L5, L7 | 4 | Test 2 re-run |
| P1 | MVP-P1-A11Y-004/005/006 | L7, L5, L6 | 4 | Manual SR + keyboard |
| P1 | MVP-P1-PERMS-001 | L10, L12 | 4 | Test 9 |
| P1 | MVP-P1-OPS-001 | L11, L12 | 0+ | All |

## 6. Mobile Operational Standards
The 12 enforceable rules in Lead 2 are binding. Critical bindings: 48 px touch targets / 44 px floor; bottom-sheet drawer mandatory <1024 px (Lead 16 C4); SignaturePad ≥320 px height (Lead 16 C5); 16 px iOS-guarded form fonts; ≤2-tap evidence capture with IndexedDB queue; ≤3-tap navigation depth; auto-save on every field change + `visibilitychange`; `prefers-reduced-motion` respected; offline tolerance via IndexedDB; canonical `LoadingState` (Skeleton + Spinner); operational/calm visual language only (Lead 15 VETO on consumer-SaaS / fintech / crypto / cyberpunk / playful).

## 7. Desktop Operational Standards
The 8-rule block in Lead 3 is binding. Breakpoints: ≥1280 px full / 1024–1279 px condensed / ≤1023 px → Mobile handoff. DataGrid virtualization >50 rows; sticky utility headers; single `--shadow-elevation-2` hover token + `prefers-reduced-motion`; right-click context menus on operational lists; RightDrawer 480–520 px with focus trap; vector PDF print with consistent ci-brand-header; persona-conditioned home pages (DON / Compliance / Surveyor / Trainer); calm visual hierarchy. Information density preserved — no consumer-SaaS flattening (Lead 15 + Lead 3 explicit).

## 8. Accessibility Compliance Alignment
WCAG 2.2 AA mandatory on five surfaces (Lead 7): `FormViewer.tsx`, `FormSigningWorkspace.tsx`, `WorkflowExecutionPanel.tsx`, `EvidenceCenterPage.tsx`, `CesEvidenceHierarchyPanel.tsx`. ARIA: `role="dialog"` + `aria-modal` + `aria-labelledby` on drawers; `role="tree"`/`role="grid"` + `aria-expanded` + `aria-level` on hierarchy; `role="list"` on requirement rows; `aria-live="polite"` for signing progress / evidence updates / form-section changes; `role="alert"` for validation errors. Focus management: trap on open, return on close, `Escape` closes, focus-visible rings preserved, skip links on long pages. Keyboard: arrow nav in trees, roving tabIndex in tabs, keyboard-only signing flow is a hard gate. `getPrintableFormHtml` MUST preserve ARIA + dynamic + values (Lead 5/7/16 C13 alignment) for subsequent-signer SR equivalence — directly tied to eCign legal defensibility. Contrast: 4.5:1 text / 3:1 large via `--ci-*` tokens; remove hardcoded grays. Mobile a11y parity: VoiceOver/TalkBack pass on signing + CES + policy detail; 48×48 px touch targets; pinch-zoom not disabled. Testing matrix: `axe-core` in Playwright on every PR; manual VoiceOver/TalkBack pass on each P0 package; Lighthouse a11y >95 before MVP cut.

## 9. Declutter & Simplification Alignment
Per Lead 8: composite `Form + Signers` projector emits `{ formInstanceId, formId, status, signers:[…], requiredEvidence:[…] }`. UI renders one card with "Form Complete + X/Y Signatures" chip + evidence chips + primary CTA. Expansion is opt-in (tap/click). Backend signer tasks remain individually addressable; CES enforcement and audit count individual tasks. Target ≤12 visible items per event (from current 25–40). Evidence Center and Audit Mode group by `form_instance` first. Right-side panels default to the most relevant context. One canonical "Requirements & Progress" view per event lives in `WorkflowExecutionPanel`; CES My Tasks, PM My Tasks, Evidence requirements, Audit Mode become filtered slices — no parallel projection. "Related Tasks" tab in `WorkflowExecutionPanel` collapsed into primary requirement view. Declutter ↔ a11y synergy: fewer top-level items → easier ARIA grouping; composite cards = single `aria-labelledby` per group + nested `role="group"`; less visual noise → contrast + focus rings stand out.

## 10. CES / eCign / Evidence Runtime Alignment
Source-of-truth identity chain (Lead 14):

```
Event → Workflow → Requirement → form_instance_id (canonical: `{eventId}-{formId}-{seq:03d}`)
form_instance_id → signed_package artifact (1:1; supersede chain on multi-signer)
form_instance_id → audit events (top-level targetKind=form_instance, targetId=form_instance_id)
artifact_id → form_instance_id (deterministic reverse lookup; remove `--` heuristic)
```

Multi-signer flow (Lead 5 canonical): DON Assistant opens form via `WorkflowExecutionPanel` → URL includes `?form_instance_id=…` → `FormViewer` hydrates → auto-save → projector emits "Form Complete" + signer task for DON → DON opens same event with same `form_instance_id` → reviews static HTML snapshot (ARIA preserved per Lead 7/16 C13) → attests → server re-asserts actor.role ∈ required_signers + required fields complete → server emits `SIGNED_PACKAGE_CREATED` with top-level `targetId` → eCign API supersedes prior artifact (does NOT remove+re-upload) → audit shows `FORM_COMPLETED` (DON Asst) and `SIGNED_PACKAGE_CREATED` (DON) both top-level `targetId=<form_instance_id>` → Evidence Center shows one row with `signers=[DON Asst, DON]` → Download/Print/Open serves stored signed PDF bytes from lock time. Evidence persistence: on `signed_locked`, signed PDF bytes written to evidence storage (IndexedDB-class; localStorage insufficient at >4 MB blobs per Lead 6); blob persists across hard refresh, tab close, session restart; retrieval byte-identical across Evidence Center, Audit Trail, ArtifactViewer.

## 11. Runtime Validation Strategy
The 5-tier strategy in Lead 11 is binding: (1) Automated (`tsc -b --noEmit`, `npm run build`, `verify:task-identity`, `verify:alignment`, `verify:pm-unified`, `check:evidence-phase15/21/22/23/235`, `check:ecign-routes`, `verify-feature-access.mjs`, `verify:brad-scenario`, `validate:event-dataflow`, `check:ecign-demo-local`); (2) Manual browser (the 9 tests — mandatory per-package gate; Lead 11 + Lead 12); (3) Mobile Field UAT Cohort (12–15 clinicians + 4–6 DONs + 3–5 surveyors on real devices under one-handed/gloved/weak-signal/interrupted conditions); (4) Compliance Lock regression on every PR touching forms/ecign/ces/evidence/onboarding-v2/policy-detail/mobile-shell; (5) Visual regression baselines (Playwright screenshots for `/library/GV-GB-001` desktop+mobile, `/library/QA-PG-001`, `/print/GV-GB-001`, `/forms/:formId`, signing Options screen, signed packet PDF preview, `/ces/board`, `/onboarding-v2/batches/:id`, `/calendar`, `/evidence`). TTI marks on signing flow: first paint <400 ms, tappable skeleton <800 ms, `SignaturePad` interactive <1200 ms. Bundle size warning at 800 kB main chunk; failure at 1.2 MB.

## 12. Browser Validation Gates
Lead 12's binary pass criteria are binding. No package merges on `tsc` + `npm run build` alone. Each P0/P1 maps to its test (table in §5). Artifacts (screenshots, console, network) stored in `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/execution-logs/` (git-ignored). Test 1 (Vercel demo), Test 2 (DON Asst → DON two-signer single canonical artifact), Test 3 (Download/Print/Open byte-identical), Test 4 (Evidence refresh persistence), Test 5 (top-level `targetKind`/`targetId` + link resolution), Test 6 (`?form_instance_id=` deep-link hydration), Test 7 (GV-GB-001 print fidelity, no eCign branding bleed), Test 8 (Calendar/Sprint/Kanban/Gantt sync), Test 9 (Trainer permission boundary).

## 13. Regression Risk Matrix
Per Lead 11/Lead 6/Lead 5 documented mitigations: AUTH-001 (revertable `vercel.json.bak`); AUTH-002 (audit existing users against CSV — never auto-disable); ECIGN-001 (legacy artifact fallback resolver retained one release); ECIGN-002 (PDF storage size limit documented; revert path = streaming retrieval); CES-001 (run `verify:task-identity` + `verify:pm-unified` + `verify:alignment`; before/after projector snapshot on canonical event); A11Y-001/002/003 (`sr-only` additions only; visual diff before/after); TASK-001 (feature-flagged `flag.composite-form-signers` — flip off for instant rollback); EVIDENCE-001 (cache version bump; old browsers re-init; no data loss); AUDIT-001 (dual-write `after.*` + top-level one release); ARTIFACT-001 (heuristic resolver retained as fallback one release); PRINT-001 (snapshot test on each path before edit; visual diff after); CALENDAR-001 (lock owner files; run all `verify:*`); ECIGN-003 (pre-flight check on existing form_instances; mismatch as warning at first); ECIGN-004 (allow explicit "N/A"; only required fields gated); A11Y-004/005/006 (`axe-core` + manual SR on every edited surface); PERMS-001 (re-run `verify-feature-access.mjs`; keep scoped grant for hire workflow). Regression rule: if any verify or browser test fails after a package lands, package is reverted by `git revert` of its merge commit; next package waits.

## 14. Protected / Frozen Systems
- **Hard-frozen (do not touch):** `Builder/`, `Bin-(thrash)/`, `public/Builder/`, `public/Documentations/`, `_Heavy/` (other than this plan).
- **Architecturally frozen for MVP (touch only via owning work package — Lead 16 C6/C7 owner-led patches only):** `src/policy/compliance-execution/taskIdentity.ts`, `cesFormInstanceId.ts`, `stateMachine.ts`; `src/policy/stores/regulatoryExecutionStore.ts`; `src/policy/components/FormSigningWorkspace.tsx`, `FormViewer.tsx`, `FormSignatureFlow.tsx`; `src/policy/evidence/storage/localDemoAdapter.ts`, `cesEvidenceHierarchy.ts`; `vercel.json`; `src/auth/AuthProvider.tsx`; `src/policy/pages/LibraryPage.tsx`, `GVGBDetailView.tsx`, `PolicyDetailPage.tsx`, `PrintPage.tsx`, `GVGBPrintDocument.tsx`; `server/ecign/*` (hashChain.ts, integrity.ts, stateMachine.ts, compliance.ts, networkMetadata.ts).
- **Out of MVP scope:** `AchcSurveyAlignmentPage.tsx`, `SurveyorPolicyViewerPage.tsx`, `PolicyLifecyclePage.tsx`, Calendar mobile rescue, Staffing redesign, Journey/onboarding-v2 mobile, iAdministrator (Brad), Hubstaff, Demo, FrameworkShowcase, TaxonomyPage, MasterControlInventory, StagingM01 (Lead 16 C10 non-production).
- **Untouchable domain engines (Lead 15):** CES engine, eCign multi-signer + packet + hash chain, Evidence hierarchy + traceability, OnboardingV2 gate/reconciliation engine, Policy governance/lifecycle/autogen/compliance mapping, Journey regulatory mapping, Feature gating / permission system.

## 15. Design System Enforcement Rules
Per Lead 13 / Lead 1 / Lead 16 arbitrations:

- **Tokens:** All colors via `--ci-*`. No hex in className/style (exception: print/PDF builders).
- **Primitives:** `ui/Tabs`, `SurfaceCard`, `GlassPanel`, `ActionButton`, `UtilityButton`, `CiStatusBadge`, `DataGrid`, `EmptyState`, `PageHeader`, `SectionHeader`, `SearchField`, `RightDrawer` (adaptive ≥1024 px), `BottomSheetDrawer` (new, <1024 px), `SignaturePad` (new, ≥320 px), `PhotoEvidenceCapture` (new), `LoadingState` (new: Skeleton+Spinner with `role="status"`+`aria-live`). No local `Tab`/`Card`/`SectionTitle`/`StatusBadge`/`Loader`/`Print*` outside `ui/`. PR template required.
- **Themes:** Care Indeed teal `#007970` only (Lead 16 C3). Orange `#C74601` only (Lead 16 C2). CI-ION maroon forbidden on operational surfaces. Light mode solid paper (no faux glass).
- **Glass layering:** Max 3 layers (Lead 16 C1). Layer 3 only in portal modal. Lint-enforced.
- **Accent semantics:** Teal primary; orange CTA/escalation/overdue/critical only.
- **Typography:** Outfit/Roboto body 14–16 px; Montserrat headings 18–22 px; labels 13–14 px uppercase 0.14–0.22em tracking. No arbitrary `text-[Npx]`.
- **Spacing:** 4 px grid via `--space-*`; card pad tokens `sm`/`md`/`lg`.
- **Motion:** `--ease-standard` / `--ease-drift`; `prefers-reduced-motion` honored; no celebratory animation on compliance.
- **Print:** Shared `PrintableSection`/`PrintableTable`/`PrintableHeader`. FormBody header canonical. eCign appends overlays only.
- **Tooling:** Extended `verifyUiDesignSystem.ts` with hex/inline drift, glass-stack count, sub-44 px target, signature canvas wrapper rules. PR template question. Weekly drift review (45 min).
- **Calm visual language enforcement (Lead 13/15 VETO):** Operational, trustworthy, expensive, modern, calm, audit-ready, compliance-focused. Forbidden references: consumer SaaS marketing pages, fintech live tickers, crypto trading dashboards, cyberpunk neon, playful illustrated mascot UIs, over-animated micro-interactions.

## 16. Canonical Ownership Map
Each concern → one owner file → one lead (drawn from Leads 1–14, verified against glob where noted):

**Auth:** `src/auth/AuthProvider.tsx` (L11), `src/auth/api.ts` (L11), `server/auth/service.ts` (L11), `server/routes/auth.ts` (L11), `server/auth/approvedUsers.ts` (L12), `vercel.json` (L11).

**Policy view layer:** `PolicyDetailPage.tsx` (L1/L3), `GVGBDetailView.tsx` (L1, specimen), `LibraryPage.tsx` (L1), `GVGBPrintDocument.tsx` (L13), `PolicyAppendicesPanel.tsx` (L1), `ArtifactViewerPage.tsx` (L6/L14), `FormViewer.tsx` (L5/L7), `SharedPolicyDetailView.tsx` (L1/L3 ACHC/lifecycle/surveyor wrapper).

**eCign / signing:** `FormSigningWorkspace.tsx` (L5), `ecign/api.ts` (L5), `security/stateMachine.ts` + `server/ecign/stateMachine.ts` (L5), `cesRoles.ts` (L5), `ecign/pdfAppendUtil.ts` (L5), `cesEvidenceHierarchy.ts` (L6), `server/ecign/hashChain.ts` (L5 frozen), `server/ecign/integrity.ts` (L5 frozen).

**CES / task identity:** `cesFormInstanceId.ts` (L14), `taskIdentity.ts` (L4 frozen), `taskProjectionCore.ts` (L8), `taskProjection.ts` (L8), `eventTaskAdapter.ts` (L4), `signerTaskFactory.ts` (L4 — open glob), `useEventExecutionDataflow.ts` (L4/L14), `WorkflowExecutionPanel.tsx` (L4/L7), `regulatoryExecutionStore.ts` (L4 frozen).

**Evidence:** `localDemoAdapter.ts` (L6), `storageMode.ts` (L6), `cesEvidenceHierarchy.ts` (L6 frozen), `EvidenceCenterPage.tsx` (L6), `demoEvidenceRuntimeCache` (L6).

**Audit:** server audit utilities (L14), `taskAuditEvent.ts` (L14), `AuditModePage.tsx` (L6).

**Shell / Navigation / Primitives:** `CommandCenterLayout.tsx` (L1/L10), `ui/index.ts` (L13), `uiStore` + `navStore` + `ciModeStore` (L13), `src/index.css` (L13), `tailwind.config.js` (L13), `scripts/verifyUiDesignSystem.ts` (L13).

**Calendar / PM:** `MasterCalendarPage.tsx` (L9), `MobileIncidentExecutionPage.tsx` (L9/L2), `pm/*` (L8/L9), new `selectCanonicalTasksForEvent` (L9), `obligationSelectors.ts` (L9).

**OnboardingV2 (out of MVP touch scope; owners noted):** `OnboardingV2Layout.tsx`, `engine/*`, `UnitDrawer.tsx` (post-MVP rescue), `AuditTimeline.tsx`.

**Print:** `GVGBPrintDocument.tsx` (L13), `PrintPage.tsx` (L13), `FormPrintView.tsx` (L13), `GVGBAppendixPrint.tsx` (L13), `FormSigningWorkspace.tsx` `buildPrintablePacketHtml` (L5/L13), new `ui/print/*` shared utils (L13).

## 17. Unified Execution Waves
Per Lead 16:

- **Wave 0** — Reality check (no code, ~30 min). Operators: L11, L12. Spin up dev; run all 9 manual tests against `main`; capture baseline screenshots in `_Heavy/Fix-2026-05-14/wave-0-baselines/`; charter simulated cohort.
- **Wave 1** — CES P0-CES-001 + theme unification (CES `theme.ts` → `--ci-*` per Lead 16 C14) + `BottomSheetDrawer` primitive + `SignaturePad` 320 px primitive. Browser Test 6.
- **Wave 2** — `MVP-P1-EVIDENCE-001` + `MVP-P1-AUDIT-001` + `MVP-P1-ARTIFACT-001` + `MVP-P0-TASK-001` (elevated per Lead 16 C8) + `CommandCenterLayout` "Evidence" slot (Lead 16 C11). Browser Tests 4, 5.
- **Wave 3** — `MVP-P0-ECIGN-001` + `MVP-P0-ECIGN-002` + `MVP-P0-A11Y-001/002/003`. Browser Tests 2, 3 + manual SR/keyboard.
- **Wave 4** — `MVP-P1-CALENDAR-001` + `MVP-P1-PERMS-001` + `MVP-P1-A11Y-004/005/006` + `MVP-P1-ECIGN-003` + `MVP-P1-ECIGN-004`. Browser Tests 8, 9 + manual SR/keyboard + Test 2 re-run.
- **Wave 5** — `MVP-P1-PRINT-001` (shared print utils + FormBody header). Browser Test 7.
- **Wave 6** — Visual regression baselines updated; full re-run of 9 tests against integrated build.
- **Wave 7** — Real-agency cohort sign-off (gated on Wave 0 simulated pass + executive sponsor).
- **Wave 8 (post-MVP)** — DEFER items (orphans, glass remnants, Builder/Bin hygiene, generic PrintPage alignment, StagingM01 removal, mobile reconstruction per `MOBILE_FIRST_UX_RECONSTRUCTION_STRATEGY.md`).

## 18. Rollback Strategy
Per-package: each on its own feature branch (`mvp-p0-ecign-001-artifact-identity` etc.); no merge without verify scripts + browser gate + screenshot/log artifact saved under `_Heavy/Fix-2026-05-14/wave-N/<package-id>/`; rollback = `git revert` of merge commit. Per-package mitigations enumerated in §13. Full-MVP rollback: identify last green Wave gate; `git revert` every package merged after; re-run full verify + browser gate; re-stamp Go/No-Go. **Forbidden:** `git push --force` to `main`; `--no-verify`; bypassing the browser gate; silent baseline-update commits.

## 19. Final Go / No-Go MVP Readiness Assessment
Per Lead 16 binding stamp:

- **Desktop demo:** CONDITIONAL GO — after Waves 1–3.
- **Field UAT:** CONDITIONAL GO — after Wave 1 mobile bottom-sheet + 320 px SignaturePad + 48 px targets + Wave 2 IndexedDB persistence + Wave 4 ARIA snapshot.
- **Surveyor on-site:** CONDITIONAL GO — after Wave 2 deterministic artifact resolution + Wave 4 ARIA + Wave 5 print fidelity.
- **DON daily desktop:** GO — MasterCalendar + RightDrawer surfaces strong; minor hover token alignment in Wave 1.
- **Compliance / CES operator:** CONDITIONAL GO — after Wave 1 (P0-CES-001) + Wave 3 (P0-ECIGN-001/002) + Wave 4 (P1-ECIGN-003).
- **Production broad release:** NO-GO — until Wave 0–7 complete, real-agency cohort pass, visual regression artifacts, zero open P0/P1.

**Mandatory pre-MVP-cut checklist:** all P0 patched by owners + verify scripts PASS; theme unification complete (zero parallel dialects); mobile bottom-sheet active + SignaturePad ≥320 px + 48 px targets; IndexedDB-class evidence with dual-write window + top-level audit fields; ARIA preserved in snapshot + dialog semantics + focus trap + 4.5:1 contrast; all 9 browser tests executed sequentially with logged artifacts; vector PDF print + brand header + cert ID + signer metadata on every page + zero header drift; `CommandCenterLayout` updated to "Evidence" slot; Wave 0 simulated cohort + Compliance Lock regression PASS; zero consumer-SaaS / fintech / crypto / cyberpunk / playful remnants; frozen files touched only via owner-led P0/P1 patches; real-agency cohort gated on Wave 0 + visual regression sign-off.

**Binding: MVP proceeds under CONDITIONAL GO conditions. All arbitrations final.**

---

**End of unified plan.** Authored by 16 Grok 4.3 subagents (IDs in §0); synthesized and written verbatim from their actual returned outputs. No fabrication; no additions outside the leads' work; no source edits performed by this turn.
