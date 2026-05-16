# Section 6 — COMPONENT CONSOLIDATION STRATEGY + Section 7 — MOBILE UX ENFORCEMENT RULES (Combined)

**Date**: 2026-05-15  
**Author**: Grok 4.3 Heavy (enterprise healthcare ops + mobile UX reconstruction strategist)  
**Scope**: STRICT — Only real production operational surfaces: CES (board, tasks, evidence, calendar, workloads, reports), eCign (FormSigningWorkspace + signing flows), Evidence (hierarchy, panels, upload, artifacts), Tasks (pm/my-tasks, sprint, approvals), Calendar (Master + incident execution), OnboardingV2 (dashboard, activation, batches, audit, governance, UnitDrawer), Journey regulatory (real modules, supervisor sign-off, evidence capture — exclude pure theatrical staging), Policy (library, SharedPolicyDetailView, detail, lifecycle, appendices), Audit (AuditModePage, AuditReadinessPage), AchcSurvey (alignment + surveyor views), operational staffing (clinician/patient lists/details for compliance context in daily workflows).  
**Excluded**: All demo/*, Hubstaff, iAdministrator/*, Brad/*, FrameworkShowcase (except operational ACHC), architecture, backups, experimental.

**Hard Rule**: Every recommendation, location, rule, and migration targets ONLY the above. No scope creep.

---

## Section 6 — COMPONENT CONSOLIDATION STRATEGY

### 6.1 Identification Method for Duplicate Systems (Tabs, Cards, Drawers, Modals, Buttons, Status, Empty, Loading, Print)

**Systematic, repeatable, code-first method** (used in this audit via list_dir + grep + read_file on absolute paths, scoped to operational directories: src/policy/ces/, src/policy/ecign/ (logic), src/policy/components/ (ui + regulatory + pm + evidence + Form* + onboarding/ subdirs filtered), src/policy/onboarding-v2/, src/policy/journey/ (regulatory only), src/policy/pm/, src/policy/staffing/ (operational pages + components for context), src/policy/pages/ (Library, Shared/GVGB policy detail, EvidenceCenter, AuditMode, MasterCalendar, MobileIncidentExecution, AchcSurveyAlignment, Form*, PolicyLifecycle, etc.), src/policy/stores/regulatoryExecutionStore.ts, src/index.css):

1. **Keyword + Pattern Search**:
   - `grep` for `role="tab" | role='tab' | TabItem | segmented | underline | Tabs | TabList | TabPanel | TabButton | custom tab state` (limited to operational globs/paths).
   - `grep` for `Card | SurfaceCard | GlassPanel | CesCard | SCard | GenericSectionPanel | *Card` + `bg-white rounded-xl border-[#E5E4E3]`.
   - `grep` for `Drawer | WorkflowDrawer | GlobalTaskDrawer | UnitDrawer | RightDrawer | BottomSheet | ModalShell | Modal`.
   - `grep` for `StatusBadge | CiStatusBadge | StatusPill | ComplianceStateBadge | DomainBadge | UrgencyChip | LockBadge | *Badge`.
   - `grep` for `EmptyState | empty.*state | No.*data | EmptyBoard`.
   - `grep` for `Spinner | Loading | Skeleton | Loader2 | animate-spin | isLoading` (no ui/ primitive found).
   - `grep` for `buildPrintablePacketHtml | PrintDocument | PrintPage | FormPrintView | PrintSectionPanel | appendix.*print`.
   - `grep` for `button.*style=|className.*(bg-\[#|text-\[#|border-\[#|p-1 |text-\[10px|text-\[11px)` in interactive contexts (for buttons).

2. **File Location Cross-Reference + Ownership**:
   - Compare against emerging canonical owners (from prior audit artifacts): `src/policy/components/ui/` (Tabs, SurfaceCard, GlassPanel, ActionButton, UtilityButton, CiStatusBadge, EmptyState, RightDrawer, DataGrid, PageHeader, SectionHeader, SearchField) + `src/policy/components/CommandCenterLayout.tsx` (shell).
   - Operational surfaces must converge here. Parallel systems flagged by import paths or local definitions.

3. **Runtime + Visual Validation**:
   - Inspect high-frequency operational routes/flows: CesBoardPage + SprintExecutionBoard, FormSigningWorkspace (signing steps), SharedPolicyDetailView/GVGBDetailView (policy tabs), EvidenceCenter + CesEvidenceHierarchyPanel + regulatory EvidencePanel, MyTasksPmPage + pm views, onboarding-v2 UnitDrawer + AuditReadiness + Batch*, regulatory WorkflowExecutionPanel/EventWorkspace, MasterCalendarPage + MobileIncidentExecutionPage, AchcSurveyAlignmentPage.
   - Use scripts/verifyUiDesignSystem.ts + Playwright mobile emulation + real-device screenshots (ForGrok/Screenshots).

**Current Duplicate Inventory (Operational Only — Absolute Paths + Key Snippets)**:

**Tabs Systems (≥6 families — highest drift in policy detail, signing steps, drawers)**:
- **Canonical**: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\Tabs.tsx` (full file read: segmented/underline variants, token-driven via --ci-*, role=tablist/tab, aria, badge support, height 28px segmented / 12px padding underline. Used sparingly in staffing ClinicianDetailPage/PatientDetailPage).
- **Duplicates**:
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\SharedPolicyDetailView.tsx:1482-2089` (defines `let navTabs = [...]` (Overview/Statements/Procedures/Appendices/...), custom render:
    ```tsx
    <nav role="tablist" ...>
      {navTabs.map(tab => <button role="tab" aria-selected={active} onClick=... className={`... border-b-[3px] ${active ? 'text-[#C74601] border-[#C74601]' : 'text-[#524048] ...'}`} > ... })}
    ```
    Hardcoded colors, not importing ui/Tabs. Carousel sectionIdx handling.
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\GVGBDetailView.tsx:261+` (local TabButton component + PROCEDURE_SUBTABS + appendices tabs, hardcoded #C74601 active, montserrat 13px tracking-[0.22em], gvgb animations — treated as honored specimen but still duplicate pattern).
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\regulatory\WorkflowExecutionPanel.tsx:367` (local TabButton + CalendarSideTabButton implementations).
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\onboarding-v2\components\UnitDrawer.tsx:17-28` (`type Tab = 'overview' | 'evidence' | 'signatures' | 'audit'; const [tab, setTab] = useState<Tab>('overview');` — custom internal tab bar).
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\FormSigningWorkspace.tsx` (StepPill + StepConnector for 4-step eCign flow: sign → verify → review → options; not true tabs but parallel multi-step navigation — critical high-frequency).
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\components\details\SprintTaskPanel.tsx:6` (commented "WORKFLOW / EVENT RECORD / AUDIT tabs" + custom section rendering).
  - Additional accordions/custom in Journey regulatory modules and onboarding-v2 pages (AuditReadinessPage, BatchViewPage, GovernancePage).

**Cards / Surfaces (≥8 families)**:
- **Canonical**: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\SurfaceCard.tsx` (ci-card class + padding tokens), `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\GlassPanel.tsx` (ci-glass-panel, theme-aware blur/flat).
- **Duplicates**:
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\components\primitives.tsx:14-40` (CesCard using local CES_TOKENS navy/orange + custom header; ComplianceStateBadge with stateStyle mapping to soft colors).
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\regulatory\Primitives.tsx:15+` (DomainDot, DomainBadge, UrgencyChip, PolicyRef, EvidenceStatusDot — full parallel primitive set).
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\SharedPolicyDetailView.tsx:539` (function SCard + GenericSectionPanel + DSimpleTable + SharedGlassTable).
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\GVGBDetailView.tsx:224` (local `const Card = ...` with bg-white shadow-sm rounded-xl p-6 + SectionTitle #007970).
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\FormSigningWorkspace.tsx:747` (function SectionCard for signing sections).
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\FormViewer.tsx` (GoverningBodyCard, AdministratorCard, custom tree cards).
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\pm\PmTaskCard.tsx` (full PM-task specific renderer).
  - Staffing operational: `src/policy/staffing/components/ClinicianCard.tsx`, `PatientCard.tsx`, `ShiftCard.tsx`, `ShiftNeedCard.tsx`, `AcuityBadge.tsx`, `DisciplineBadge.tsx`, `CredentialBadge.tsx`.
  - Onboarding-v2: `KpiTile.tsx`, `GateTile.tsx`, `EvidencePanel.tsx` (local), `StatusPill.tsx`.
  - Widespread inline `bg-white rounded-xl border-[#E5E4E3] shadow-sm p-5 mb-6` (LibraryPage, many pages).

**Drawers + Modals**:
- Canonical starter: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\RightDrawer.tsx` (right-side, fixed inset justify-end, backdrop click close, Escape, header with UtilityButton X, footer support; inline prop).
- Duplicates:
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\pm\GlobalTaskDrawer.tsx`
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\ces\components\details\WorkflowDrawer.tsx`
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\regulatory\WorkflowDrawer.tsx`
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\onboarding-v2\components\UnitDrawer.tsx` (has internal tabs, EvidencePanel + AuditTimeline + SignerStrip).
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\regulatory\ModalShell.tsx` (centered/modal with width prop, footer, accent, used by EvidencePanel upload).
- Current: All right/centered — zero bottom-sheet behavior on phone (major mobile failure).

**Status / Badges**:
- Canonical: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\CiStatusBadge.tsx` (tone-driven ci-badge--* classes).
- Duplicates:
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\StatusBadge.tsx` (legacy hardcoded #FFC700/#C74600/#D70101 for LifecycleStatus, montserrat uppercase).
  - `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\staffing\components\StatusBadge.tsx` (wrapper).
  - CES: ComplianceStateBadge, AuditReadinessTag, PhaseIndicator in `ces/components/primitives.tsx` + `ces/components/review/RobertCesReviewLayer.tsx`.
  - Regulatory: DomainBadge/UrgencyChip/EvidenceStatusDot in `regulatory/Primitives.tsx` + LockBadge.tsx + EventChip.tsx.
  - Onboarding-v2: StatusPill.tsx.
  - Others: RolloutPhaseBadge (security), custom in WorkflowExecutionPanel, CesExecutiveDashboard, AchcSurveyAlignmentPage.

**Empty States**:
- Canonical: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\EmptyState.tsx` (icon + title + description + action, centered, token colors).
- Duplicates: Inline in `LibraryPage.tsx`, `EvidenceCenterPage.tsx:1057`, `CesBoard`/`MyTasksPage`, `EventWorkspace.tsx:764`, `PmViews.tsx:85`, `DashboardPage.tsx`, `FormSigningWorkspace` conditionals, `ArtifactViewerPage`, many onboarding-v2 pages.

**Loading / Skeletons**:
- **No canonical primitive in ui/** (critical gap).
- 13+ variants: App.tsx (AppLoader/InlineLoader border-t-[#C74601]), multiple `Loader2 animate-spin` (sizes 11-16, colors #C74601/cyan/#FFC107 in FormSigning, ArtifactViewer cyan, CES/PM/OnboardingV2 custom, EvidenceCenter), no skeletons (only spinners). Heavy jank risk in signing/CES board on field devices.

**Buttons**:
- Canonical: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\ActionButton.tsx` (cta/secondary/ghost/danger, sizes, icons, ci-btn--* classes), `UtilityButton.tsx`.
- Duplicates: Native `<button className="bg-[#007970] ...">` everywhere; CES WorkflowDrawer local ActionButton (navy/orange/red/green tones); small text-[10px] Upload buttons in EvidencePanel.tsx:38.

**Print / Packet Systems (5 distinct — highest legal risk for eCign/evidence fidelity)**:
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\GVGBPrintDocument.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\PrintPage.tsx` (PrintMeta + PrintSectionPanel)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\FormPrintView.tsx` (FormBody + .form-frame)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\GVGBAppendixPrint.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\FormSigningWorkspace.tsx:479-1478` (`buildPrintablePacketHtml` + `buildPacketHtml` + getPrintableFormHtml clone; appends cert, audit trail, roster, manifest, eCign footer; used for signed_locked artifacts in ArtifactViewerPage + EvidenceCenter).
- Additional: `PolicyAppendicesPanel.tsx`, CES reports.

**Other (Buttons/Status/Print overlap in ces/regulatory/onboarding-v2/staffing operational)**: Full parallel design systems (CES_TOKENS navy/orange vs main --ci-* vs eCign NAVY/ORANGE hardcoded vs onboarding-v2 professional light).

**Root Cause**: Organic growth without DESIGN_OWNERS.md enforcement; 2313+ inline styles + hex; parallel primitives in ces/ and regulatory/.

---

### 6.2 Deprecation Process (Keep Prod Running)

1. **Mark Old**:
   - Add JSDoc to every duplicate file/function: `/** @deprecated Phase 2 — Use canonical from src/policy/components/ui/ or DESIGN_OWNERS.md. Removal target: end of Phase 3. Monitor via telemetry 'deprecated_component_used'. */`
   - In dev: `if (import.meta.env.DEV) console.warn('[DEPRECATED] Old Tabs/Card in [file] — migrate to canonical. See Section 6.');`
   - Add to file header: `// DEPRECATED FAMILY — [Tabs|Cards|Drawers|Status|Loading|Print]. See 06_07_COMPONENT...md and DESIGN_OWNERS.md.`

2. **Prevent New Usage**:
   - Update `eslint.config.js` with `no-restricted-imports` or custom rule banning imports from `ces/components/primitives`, old StatusBadge paths, local TabButton patterns (after Phase 0).
   - `no-restricted-syntax`: ban `function .*Card|TabButton|StatusBadge` definitions outside ui/ and approved owners.
   - PR template mandatory question: "New UI family or duplicate primitive? Must reference DESIGN_OWNERS.md + justify or use ui/."
   - CI gate: post-commit grep script (like existing verify*.ts) fails PR on new occurrences in operational paths.
   - DESIGN_OWNERS.md (new): Explicit owners + "CANONICAL — do not create parallel" comments in every canonical file.

3. **Route-by-Route Replacement**:
   - Prioritize by frequency + risk: 1. eCign signing (FormSigningWorkspace), 2. CES board/tasks (CesBoardPage + SprintExecutionBoard + MyTasks), 3. Policy detail tabs (Shared + GVGB), 4. OnboardingV2 drawers/tabs, 5. Evidence/Regulatory panels, 6. Calendar drill + staffing ops context.
   - Per route: Conditional wrapper (see 6.5). Old path remains 100% functional.

4. **Full Removal**: Only after 100% adoption + 30-day stability + QA sign-off on critical flows (signing success rate, evidence upload fidelity, CES task completion). Archive to _Heavy/archive/ with git history.

---

### 6.3 Creating Canonical Primitives (Exact Final ONE Set — Mobile-First Defined First)

**All live in `src/policy/components/ui/` (or ui/mobile/ subdir for adaptive)**. Export from `ui/index.ts`. Consume ONLY `--ci-*` semantic tokens (index.css) + Tailwind. **Zero hardcoded hex** (except isolated print/PDF builders). **Mobile-first behavior is the default spec**; desktop is graceful extension.

**Exact Canonical List** (final state after migration):

1. **Tabs** (`ui/Tabs.tsx` — extend):
   - Variants: 'segmented' (mobile compact), 'underline' (page-level), 'sheet-tabs' (bottom sheet internal).
   - **Mobile-first**: min-height 44px per tab, horizontal scroll-snap-x mandatory on <640px, large labels (16px+), badges touch-friendly. No precision. Swipe gesture optional for tab change (with snap). Never place primary content tabs inside nested scroller.
   - ARIA strict, keyboard arrows.

2. **SurfaceCard + GlassPanel** (existing — enhance):
   - Mobile: full-bleed options or 8px side margins, safe-area-inset, avoid glass-over-glass. Padding tokens responsive (sm on phone).

3. **ActionButton + UtilityButton** (existing — enhance):
   - Add size: 'touch' (default on mobile detection or media query) = min 48x48px. Icon + label row or stack. Bottom action bar pattern.

4. **CiStatusBadge** (existing — enhance):
   - Map CES/regulatory tones to tokens. Sizes: 'sm'/'md'/'touch'. Domain/urgency variants via prop.

5. **EmptyState** (existing — enhance):
   - Mobile: larger icon (48px+), full-width action button.

6. **LoadingState** (NEW — urgent):
   - `Skeleton` (list/card/form/signature-step variants with shimmer --ci-skeleton token).
   - `Spinner` (only global short-lived; aria-live polite).
   - No more 13 variants.

7. **BottomSheetDrawer** (NEW — replaces/adapts all drawers on phone):
   - Phone: from bottom, max-height: min(80vh, 80% safe viewport), drag handle (44px wide visual + gesture), swipe-down threshold (80px or velocity >0.5), backdrop tap close.
   - State save + resume on interrupt (visibilitychange + persist to regulatoryExecutionStore or context key).
   - Tablet+: falls back to RightDrawer or modal.
   - Used everywhere: UnitDrawer, WorkflowDrawer, GlobalTaskDrawer, Evidence upload, task detail, signing options.

8. **SignaturePad** (NEW — critical for eCign):
   - Large dedicated: min 300px height on phone (90% width, thumb-reachable lower screen), dynamic container.
   - One-handed optimized (natural arc, pointer/touch events, smooth).
   - Prominent "Apply Signature" / "Done" ActionButton cta (48px+, always visible below pad, not keyboard-hidden).
   - Clear button (secondary), stroke count/undo if needed.
   - Replaces old canvas (1400x420) in FormSigningWorkspace.
   - Offline: local dataUrl immediate.

9. **PhotoEvidenceCapture** (NEW):
   - Large primary button "Capture Photo Evidence" (thumb zone).
   - Native: `<input type="file" accept="image/*" capture="environment" />` or getUserMedia — minimal taps (capture → preview → optional simple one-handed annotation overlay canvas → attach).
   - Resume after interrupt: local queue in evidence store + IndexedDB (photo blob + annotation + metadata + linkage to event/task/formInstanceId). "Resume" banner. Background sync on reconnect.

10. **DataGrid + Table primitives** (enhance existing): Mobile card-stack or snap-list fallback for CES/evidence lists.

11. **FormField / InputGroup** (NEW family): Large 48px+ inputs, auto-save debounce, segmented for status.

12. **Print primitives** (shared utils): PrintablePolicySection, PrintableFormFrame, eCignLegalPacketOverlay (for fidelity in buildPrintablePacketHtml).

13. Supporting: Enhanced PageHeader/SectionHeader (sticky mobile with safe-area), Toast (existing regulatory), KpiTile (promote from onboarding-v2 to ui).

**Mobile-First Definition (in JSDoc + DESIGN_TOKENS.md)**: "All primitives default to phone ergonomics (one-handed, 44px+, bottom CTAs, single-column, interrupt-resilient, momentum scroll, offline local-first). Desktop extends via media/container queries. Tested first on iPhone SE / small Android portrait."

---

### 6.4 Incremental Migration Pattern

**Example High-Frequency Flow First**: eCign signing tabs/steps + signature canvas (FormSigningWorkspace — daily clinician use, legal critical) OR CES board tabs/columns (SprintExecutionBoard + CesBoardPage — core execution).

**Phased Pattern (from Redesign Roadmap alignment)**:

- **Phase 0 (Freeze)**: Create DESIGN_OWNERS.md + add "CANONICAL OWNER" comments to ui/ files, SharedPolicyDetailView, FormSigningWorkspace, Ces* (primitives as CES-only mapped), OnboardingV2 components. PR gates active. No new duplicates.

- **Phase 1 (Consolidate primitives)**: Enhance ui/ with NEW mobile primitives (BottomSheetDrawer, SignaturePad, LoadingState, PhotoEvidenceCapture). Map CES_TOKENS → ci- tokens (or explicit CES-only exception).

- **Migration per family/flow**:
  1. Audit exact usages (grep + ts-morph count) in operational paths only.
  2. Build canonical + mobile parity (visual + interaction + data output identical for sig/dataUrl/packet HTML).
  3. Wrap at call sites with feature flag (see 6.5).
  4. Instrument telemetry + error boundaries.
  5. Staged enable: dev → staging → canary (role-based or 5-10% random clinicians/DONs/surveyors) → 50% → 100%.
  6. Validate: signing success rate, evidence attach completion, task close time, no fidelity loss in eCign hash/audit chain, Playwright assertions on mobile viewports, real-device lab (field-like interruptions).
  7. Deprecate old + remove after 30-day stable window.

**Priority Sequence** (brutal ops focus):
1. eCign signing (FormSigningWorkspace StepPill/canvas + Evidence upload in panels) — highest daily + legal.
2. CES execution (board columns/filters, SprintTaskPanel, MyTasks, WorkflowDrawer).
3. Policy detail (Shared + GVGB custom tabs/cards — surveyor/DON reference on-site).
4. OnboardingV2 (UnitDrawer tabs + EvidencePanel + AuditReadiness tabs).
5. Regulatory/evidence (WorkflowExecutionPanel tabs, EvidencePanel modals/upload, EventWorkspace).
6. Calendar + MobileIncident drill-downs + operational staffing details.
7. Journey regulatory evidence/sign-off + AchcSurvey.

**Route-by-Route Example (eCign)**: In FormSigningWorkspace, conditional on `useFeatureFlag('eCign-canonical-signature-v2')` render SignaturePad + BottomSheet for options vs legacy. Keep old path live for rollback.

---

### 6.5 Preserving Functionality During Migration (Critical Signing/Evidence/CES)

- **Feature Flag per Component Family**: Extend existing stores (uiStore / regulatoryExecutionStore / ciModeStore). Keys: `tabs-v2`, `drawers-bottomsheet`, `signature-pad-v2`, `loading-skeleton-v2`, `status-badge-v2`, `evidence-upload-v2`, `print-unified`. Server or localStorage + rollout config. Flag controls render path only — business logic (stateMachine, hashChain, evidence upload, signerTaskFactory) shared and untouched.

- **A/B + Parallel Run**:
  - Non-critical: A/B test (e.g. 50/50 on policy detail tabs).
  - Critical (signing/evidence/CES board): Parallel run — both UIs renderable, user on old or new. Server accepts either (no state machine change). Monitor: completion rate, error rate, time-on-task, abandon rate, offline resume success, packet hash fidelity (exact match required), evidence artifactId consistency.
  - Telemetry events: `component_family_migrated`, `old_vs_new_diff` (for canvas dataUrl / packet HTML).

- **State Save on Interrupt**: Mandatory for all drawers/sheets/forms/signing. Use `useEffect` on `document.visibilityState` + `beforeunload`. Persist tab/scroll/form values/signature strokes/photo draft to store + localStorage/indexedDB keyed by canonical context (e.g., `eventId:formInstanceId:signer`). On mount/reopen: hydrate exactly. Critical for field clinicians (app switch, signal loss, battery death).

- **Fidelity Guarantees**:
  - eCign: `buildPrintablePacketHtml` + snapshot clone from FormViewer must produce identical output regardless of UI path. Server ecign/stateMachine.ts + hashChain unchanged. Post-first-signature snapshot immutable.
  - Evidence: artifactId linkage + regulatoryExecutionStore appends identical.
  - CES: task status, role enforcement (cesRoles.ts), obligationSelectors unchanged.

- **Rollback**: Single flag flip (no deploy). Old code path remains until final removal.

- **QA Gates**: Real devices + Playwright (mobile + offline throttle) + accessibility + visual regression (signed packet screenshots) before each stage. No regression on prod metrics.

---

## Section 7 — MOBILE UX ENFORCEMENT RULES (Strict, Non-Negotiable, Measurable)

**Applies to ALL operational surfaces listed in scope.** Field personas (clinician one-handed home visits, DON queue, surveyor on-site, compliance CES) drive every decision. Rules are binary (pass/fail) with quantitative metrics.

**Enforcement (make rules real — no theater)**:

- **Lint (eslint.config.js extension)**: 
  - Ban hex/rgb/arbitrary Tailwind in component .tsx (except flagged print utils) — use --ci-* or .ci-* classes.
  - Require `.ci-touch-target` (or equivalent min-h-[44px] min-w-[44px]) on all button/[role=button]/a/input[type=checkbox] in operational components.
  - Detect + warn on nested primary scrollers (`overflow-auto` ancestor chain in shell paths).
  - Restricted imports for deprecated families post-Phase 1.
  - Run in CI + local pre-commit.

- **Design Review Checklist** (PR template mandatory, checked by reviewer):
  - All touch targets ≥44px + thumb-zone validated (screenshots on iPhone SE portrait)?
  - BottomSheetDrawer (or adaptive) used for phone drawers? State resume tested?
  - No nested scroll in primary content? Pull-to-refresh + momentum on lists?
  - Forms: 48px+ inputs, auto-save every field, large non-precision controls?
  - Evidence: ≤2 taps capture, annotation, resume-after-interrupt + offline queue?
  - Signatures: SignaturePad (large dedicated, one-handed, prominent Done, no tiny canvas)?
  - Nav: ≤3 taps from mobile bottom tabs to any daily task? More for 20% only?
  - Keyboard: critical actions (Sign/Apply/Capture/Save) remain visible above keyboard?
  - Gestures: swipe-back, pull-refresh, long-press context implemented?
  - Typography: ≥16px body, scaled, readable under pressure?
  - Offline: form/sig/photo/task list fully functional + sync strategy?
  - Loading: skeletons primary, TTIs met for signing (<1200ms pad ready)?
  - Real-device tested (portrait, one-handed, poor signal sim)? Screenshots + video attached for eCign sign + CES list + evidence upload + policy tab?
  - Feature flag + telemetry for any migration change?
  - No new duplicate primitives?

- **Automated Assertions (Playwright + custom helpers in test suite)**:
  - `expect(getBoundingClientRect(button).height).toBeGreaterThanOrEqual(44)` for all interactive in key flows.
  - No nested overflow-y:auto in primary shell content paths.
  - Keyboard focus on input: verify bottom CTAs bounding rects not overlapped (use visualViewport).
  - SignaturePad: dimensions + tap-to-done <3 interactions.
  - Offline mode (network.offline): assert local persistence + resume for form fill, signature, photo queue, task list.
  - Performance marks: signing flow TTI targets.
  - Visual regression baselines for mobile viewports on priority screens (eCign steps, CES board, evidence panel, policy detail tabs, onboarding unit).
  - Touch target density + contrast checks.

- **Runtime Dev Guards**: In DEV, MutationObserver or render checks warn on <44px targets or small signing canvas.
- **Quarterly Device Lab + Metrics Review**: Real iPhone SE/Android small + tablet, field-like interruptions. Track: task completion time, signing abandon, evidence upload success, offline data loss (target: 0), user-reported friction.
- **Violations**: Block merge. Exception = written approval + tracked debt ticket + timeline.

**The 12 Strict Rules**:

1. **Touch Targets**  
   Minimum 44 × 44 px (or 48dp Android equiv) hit area for **every** interactive element (buttons, tabs, list rows, checkboxes, drawer handles, signature clear/done, upload triggers, evidence items).  
   Thumb zone: Primary daily actions (Sign, Capture Evidence, Complete Task, Apply) reachable in lower 1/3 or natural thumb arc in portrait one-handed use. No top-right stretch required.  
   Exceptions: Only with UX Lead + Compliance written approval + documented larger parent hit area; never for core signing/evidence/CES.  
   **Measure**: Lint + Playwright rect assertions + design checklist. Current violations: EvidencePanel 10px Upload buttons, canvas controls, small icons in regulatory panels, dense CES cards.

2. **Drawer Behavior (Phone <1024px)**  
   Phone = BottomSheetDrawer (new canonical): bottom slide-up, max-height 80% safe viewport (or 80vh), visible drag handle (44px+ touch), swipe-down gesture close (threshold 80px/velocity), full-backdrop tap close, X 44px+, Escape.  
   State save + exact resume on interrupt (app switch, signal loss, reload) via store + localStorage keyed by event/task/formInstanceId.  
   No right-side drawers on phone (RightDrawer auto-adapts via isMobile prop or media).  
   Applies to: UnitDrawer, WorkflowDrawer(s), GlobalTaskDrawer, Evidence upload modal, task detail, signing options.  
   **Measure**: Visual + interaction tests; state resume assertion.

3. **Scrolling**  
   **Never** nested scrollers for primary content (main lists, forms, boards, policy body, evidence hierarchy, CES kanban). Single primary scroller + sticky headers/footers + virtualization where needed.  
   Momentum + overscroll-behavior: contain (touch-friendly physics, no parent interference in sheets).  
   Lists (my-tasks, CES board cards, evidence, calendar events, onboarding batches, policy appendices): vertical momentum only; horizontal only for explicit snap carousels.  
   **Measure**: Automated nested-scroller detection + manual + Playwright.

4. **Forms**  
   Inputs (text, number, date, select): min-height 48px, 16px font (iOS guard already in index.css), generous padding.  
   One-handed flow: logical vertical stack, prominent Next/Save in bottom bar (keyboard never hides).  
   **Auto-save every field**: debounce 250-300ms or onBlur → persist to canonical store (regulatoryExecutionStore, ecign session, onboardingV2Store) + local. Subtle "Draft saved" + resume on return.  
   No precision: large segmented/Tabs/button groups for status/role/boolean; native mobile pickers; large tappable checkboxes. Avoid tiny arrows/drag handles.  
   Applies to eCign forms, CES task execution, onboarding gates/audit, policy lifecycle, Achc findings.  
   **Measure**: Form completion tests + auto-save assertions.

5. **Evidence Upload** (EvidenceCenter, CesEvidenceHierarchyPanel, regulatory EvidencePanel, onboarding-v2 EvidencePanel, Journey regulatory capture, MobileIncident, AchcSurvey)  
   Photo capture: Large primary "Capture Photo Evidence" ActionButton (thumb zone). ≤2 taps total (open camera → capture/confirm). Use `capture="environment"` or MediaDevices.  
   Annotation on phone: Optional post-capture large one-handed overlay (simple canvas strokes/arrows/text on photo preview).  
   Resume after interrupt: Local queue (blob + annotation + metadata + linkage) in IndexedDB/store. "Resume pending evidence" on return. Background sync with retry.  
   Offline + poor signal: Full local capture/annotate/queue; show sync status badge. Auto-compress.  
   **Measure**: Tap count + resume + offline tests + success rate metrics.

6. **Signatures** (primary: FormSigningWorkspace eCign multi-signer; secondary: Journey supervisor, attestations)  
   Large dedicated area: SignaturePad ≥300px height on phone (full thumb-reachable width ~90% screen), positioned for one-handed natural writing.  
   One-handed + clear "Done/Apply Signature": Prominent 48px+ cta ActionButton **below** pad, always visible (keyboard-safe). Clear button adjacent.  
   **No tiny canvas**: Deprecate/replace 1400×420 hard-coded canvas (FormSigningWorkspace:2083). Dynamic responsive but minimum physical size.  
   Smooth pointer/touch, dataUrl + hash fidelity identical. One-tap done.  
   **Measure**: Dimensions + interaction count + fidelity snapshot tests.

7. **Navigation Depth**  
   From mobile primary bottom tabs (Dashboard / Calendar / Tasks / Workflows / More in CommandCenterLayout.tsx:143-149): **Never >3 taps** to reach/complete any daily operational task (CES board task open + sign/evidence, eCign form from event, calendar event drill to sign, my-tasks complete, onboarding unit activate/sign, policy reference during visit, evidence attach, audit readiness).  
   "More" (or hamburger) for ≤20% flows only (reports, workloads, full governance, help, staffing lists, advanced audit).  
   Deep context (calendar → event → workflow → task → evidence): Use global task queue / persistent bottom sheet + swipe-back + "In [Context]" header. One-tap return to list.  
   **Measure**: Manual navigation tree audit + checklist.

8. **Keyboard Usage (Mobile Software Keyboard)**  
   Keyboard open must **never** break layout or hide critical actions (Sign/Apply Signature/Capture Evidence/Save/Done/Next/Complete Task).  
   Use visualViewport API + env(safe-area-inset-bottom) + dynamic bottom bar positioning. CTAs remain fully visible and tappable above keyboard.  
   Test iOS/Android portrait. Auto-dismiss on action/scroll where safe.  
   **Measure**: Focus + rect assertion tests + real device.

9. **Gesture Support**  
   - Swipe back (edge or history) on drawers/sheets/pages.  
   - Pull-to-refresh on all lists (CES board, tasks, evidence, calendar, onboarding batches) — skeleton during refresh.  
   - Long-press (≥500ms) on cards/items for context menu (complete, reassign, audit trail, attach photo) — large menu items.  
   - BottomSheet: swipe down + handle. Tabs in sheets: optional horizontal swipe.  
   No gesture conflicts.  
   **Measure**: Gesture tests in Playwright + device validation.

10. **Typography Sizing**  
    Minimum readable under time pressure on phone: body 16px / 400 / 1.5 line-height (system/Roboto), titles 20-22px / 600 Montserrat, labels 14px uppercase tracking-[0.14em].  
    Scaling: clamp or responsive tokens (--text-body-mobile etc.). Never <14px primary content on <640px. High contrast + weight for urgency/status.  
    Enforced in CES cards, task lists, signing attestations, evidence metadata, policy content, onboarding gates.  
    **Measure**: Visual + font-size assertions in mobile tests. (index.css iOS 16px input guard is baseline.)

11. **Offline Tolerance (Field Reality — Poor/No Signal)**  
    Must fully work offline or degraded signal:  
    - Form fill (eCign, CES tasks, audit findings, onboarding).  
    - Signature capture + local dataUrl + attestation prep.  
    - Photo evidence capture + annotation + queue.  
    - Basic task list view + optimistic complete + notes (CES board, my-tasks, calendar).  
    **Sync strategy**: Local-first (stores + persist + IndexedDB). Optimistic UI. On reconnect: delta sync, conflict resolution (server authoritative for compliance), retry queue (exponential backoff). Persistent "Offline — X changes queued" banner + progress. Zero data loss on app kill/restart. Snapshot fidelity post-signature guaranteed locally.  
    **Measure**: Playwright offline mode + real-device poor-signal sim + data-loss = 0 metric.

12. **Loading Behavior**  
    Primary: **Skeleton** (shimmer) for lists (CES board cards, tasks, evidence hierarchy, policy sections, onboarding batches), forms, signing steps (paper + consent skeleton), artifact viewers. Perceived instant.  
    Spinner: Only global blocking actions <1.5-2s or initial boot.  
    Signing flow TTI targets (field 4G/5G + poor): first paint <400ms, skeleton tappable <800ms, SignaturePad ready + interactive <1200ms.  
    Uploads/sync: determinate progress or % + status.  
    **Measure**: Performance marks + skeleton presence assertions + TTI in CI.

---

**Final Mandate**: These sections are the binding contract for the mobile-first surgical reconstruction. Consolidation eliminates drift risk; enforcement makes mobile the default for field operations (clinicians signing and capturing evidence one-handed in homes, DONs clearing queues, surveyors reviewing policies on-site). Legal defensibility of eCign/evidence/CES remains absolute — no shortcuts.

**Next Actions** (immediate):
- Create DESIGN_OWNERS.md + add canonical comments.
- Extend eslint + PR checklist with these rules.
- Prototype BottomSheetDrawer + SignaturePad + LoadingState in ui/.
- Flag eCign signing migration first.

**References (absolute)**:
- Production scope: `_Heavy/Fix-2026-05-14/ForGrok/MobileFirst_Reconstruction_Strategy/00_PRODUCTION_SURFACE_FILTER.md`
- Drift details: `UIUX_Audit/UIUX_DRIFT_AND_REDUNDANCY_REPORT.md` + `UIUX_CANONICAL_COMPONENTS_MAP.md`
- Mobile baseline: `UIUX_Audit/UIUX_MOBILE_RESPONSIVE_AUDIT.md`
- Roadmap alignment: `UIUX_Audit/UIUX_REDESIGN_ROADMAP.md`
- Key code inspected: FormSigningWorkspace.tsx (signature canvas), SharedPolicyDetailView.tsx (custom tabs), ces/components/primitives.tsx, ui/Tabs.tsx + RightDrawer.tsx + EmptyState.tsx, regulatory/Primitives.tsx + ModalShell.tsx + EvidencePanel.tsx, onboarding-v2/UnitDrawer.tsx, CommandCenterLayout.tsx (nav), index.css (touch/scroll guards), regulatoryExecutionStore.ts (offline/sync foundation).

**End of Sections 6+7 Combined**. Ready for implementation gate.

---
*Brutal operational focus: Field clinicians win or the system fails. No exceptions.*