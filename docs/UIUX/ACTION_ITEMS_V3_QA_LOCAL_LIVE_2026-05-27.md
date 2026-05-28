# V3 UI/UX Reconstruction — Local Live QA Action Items (32-Agent Campaign)
**Date**: 2026-05-27 (updated post-Agent 05/06/08/09/10/11/12/14/15/16/18/19/20/31 completion)  
**Context**: Full 32-agent parallel deep-dive executed against **local live** (http://localhost:5174/ production routes + source) — NOT ui-staging isolated demos. All findings cross-checked against:
- V3-Veil-Glass-Design-System-Implementation-Specs.md (tokens, 0.33 sacred border, 77.7% constrained single-glass, teal dominance + 2 neon orange exceptions only, 0.7s premium motion)
- CES_Evidence_and_Tasks_Right_Panel_V3_Drawers_To_Implement.md + Removals + Decluttering_Status_Report_2026-05-20.md (May 20 spec: ~15-25% planning, 0-5% execution on actual CES right panels)
- V3_UIUX_RECONSTRUCTION_EXECUTIVE_SUMMARY*.md (Phase 1 reality: 5-15% CES v3 executed; zero glassVariant="v3-veil" activation on real CES Evidence/Tasks right panels)
- DRIFT_REGISTER.md (D01/D03/D06/D07/D08/D09/D13/D19/D20/D23/D24 Critical/Open)
- CANONICAL_UI_SYSTEM_SPEC.md §4 (4-sided constrained breathing room non-negotiable)
- 32_AGENT_DEEP_DIVE_PLAN.md mandates

**Local Live Server**: `npm run dev:web` → http://localhost:5174/ (api :8787 conflicted with Cursor helper; client mocks + production code paths sufficient for UI/UX + fidelity QA). 32 subagents (IDs 019e69ae-* through 019e69b0-*) ran with read/execute on production files only.

**Overall Verdict from Campaign**: V3 primitives (RightDrawer default v3-veil, ShellContentFrame, --v3-* tokens, V3StackedDrawerHost) and shell foundation are mature and live. **CES/PM high-stakes surfaces (board, calendar, my-tasks, evidence, signing) remain 90%+ legacy density + parallel navy + bespoke drawers**. May 20 right-panel migration is aspirational. New V3 drawer animation (0.7s) introduces unmitigated fidelity risk on eCign signing. Onboarding V2/Journey untouched. Token/raw-value debt quantified at 3700+ sites. All 32 agents delivered structured reports + actionable items below (synthesized + deduped; original per-agent items preserved in their subagent outputs).

---

## Tier 0 — Catastrophic / Audit-Blocking (Start Immediately, Block Phase 2 CES)

1. **CES Board completely bypasses canonical task identity + V3 veil drawers**  
   - **Evidence**: SprintExecutionBoard.tsx:186-220 (local `setOpenUnit` + bespoke `WorkflowDrawer` on `ceu-*` ids, no `selectedTaskStore`, no `normalizeEventTaskIdentity`, no `V3StackedDrawerHost`); ces WorkflowDrawer:57-75 (custom z-[70] + CES_TOKENS + local onUpdate only); GlobalTaskDrawer:19 blacklists /ces/* + /pm/my-tasks.  
   - **V3 Design Violated**: May20 CES_Drawers_To_Implement.md:13 (WorkflowDrawer must be V3 version inside shell); Executive_Summary:88 (zero v3-veil on real CES right panels); CANONICAL §4 + V3-Spec §4 (constrained single glass + 4-sided); taskIdentity.ts contract.  
   - **Action**: Refactor CesBoard/SprintExecutionBoard to always use `selectedTaskStore.openTask({taskId: normalize(...) })` + V3StackedDrawerHost (DrawerLayer 'task'/'event'). Delete bespoke WorkflowDrawer path. Add to verify:pm-unified + new Playwright 5174 test for board→drawer→state sync.  
   - **Priority**: Critical (P0) | Owner: CES + PM Unification (Agent 02 lead) | Target: Before any further V3 drawer or board density work.

2. **V3 0.7s drawer animations + veil glass risk corrupting eCign signed artifact HTML snapshots (defensibility failure)**  
   - **Evidence**: RightDrawer:68-76 (680ms exit timer + v3-drawer-exit-right); FormSigningWorkspace:481-668 (buildPrintablePacketHtml + getPrintableFormHtml DOM cloneNode during live form in drawer); ces WorkflowDrawer + TaskDetailRightPanel (partial v3, used for signing entry); no isolation guard for transitions/V3 classes.  
   - **V3 Design Violated**: V3-Spec executive ( "Any regression in print fidelity or eCign snapshot capture during the V3 transition would be catastrophic"); DRIFT D23/D24; context-for-grok print/ecign forensics (P0 ECIGN-PDF-001).  
   - **Action**: In FormViewer.getPrintableFormHtml + workspace finalize: (a) disable all animations/transitions on clone root/ancestors, (b) strip .v3-* / [data-veil-layer] / --v3-* before clone or render to temp clean container, (c) hash pre/post bytes + log during 0.7s windows. Add explicit 5174 Playwright test: open CES task in v3-veil drawer → sign → reload → assert exact bytes in ArtifactViewer/Evidence. Freeze v3-veil activation on any signing surface until proven.  
   - **Priority**: Critical (P0 defensibility) | Owner: eCign + Print + Agent 04/13/18 | Target: Immediate (before next signed packet in prod).

3. **May 20 CES Right Panel removals + V3 Evidence/Task panels at ~0% execution** (planning complete, code unchanged)  
   - **Evidence**: CES_Right_Panel_Decluttering_Status_Report_2026-05-20.md:42 (0% legacy deletion, 0% new integrated V3 EvidencePanel/TaskDetailRightPanel); MasterCalendarPage:320 still renders inline SprintTaskPanel + TaskDetailContent in VeilDrawer inside ci-right-panel splits; no V3 content panels consuming useEventExecutionDataflow inside shell.  
   - **V3 Design Violated**: CES_Evidence_and_Tasks_Right_Panel_V3_Drawers_To_Implement.md:1-53 (exact list of 7 drawers + 7 integration points + "no more legacy right panels"); Executive_Summary Tier 1 #1; Decluttering goal 70% density reduction.  
   - **Action**: (a) Implement V3TaskDetailRightPanel + V3EvidencePanel as shell-integrated components (use v3-veil, SurfaceCard, --v3-* only, dataflow prop). (b) Update MasterCalendar/MyTasksPm/CesBoard/EventWorkspace/MobileIncident to conditional drawer only (delete ci-right-panel + inline rails per index.css:459). (c) Delete EvidencePanel.tsx, TaskDetailRightPanel.tsx (legacy), SprintTaskPanel.tsx, old WorkflowDrawer usages. (d) Add 5174 visual regression gate (side-by-side vs APP_Screenshots.pdf + v3 staging).  
   - **Priority**: Critical | Owner: CES + UI Primitives (Agent 01/02/08 lead) | Target: Phase 1 exit blocker.

---

## Tier 1 — High (Drift Multipliers, Token/Primitive Debt, Identity Fragmentation)

4. **CES parallel navy system (D03) remains un-governed and metastasized inside V3 shell** (45+ raw hex in ces/, 142 CES_TOKENS usages, mixed in WorkflowDrawer)  
   - **V3 Design**: ces/theme.ts Lead 16 C14 sanctioned exception must be single-point + scoped; V3-Spec §2/16 + Executive_Summary:79 (CES navy retained as intentional identity).  
   - **Action**: Complete theme.ts remap enforcement; delete old #1F4A8A values from root/CSS; force all 10+ ces files (MyTasksPage, SprintTaskPanel, reports, etc.) through useCesTokens() or --v3-* bridge; add eslint rule blocking direct CES_TOKENS outside ces/ or new raw navy/orange. Update DRIFT D03 with exact counts + owner + expiration.  
   - **Priority**: Critical | Owner: Agent 07 + CES Theme Guardian.

5. **Regulatory surface family explosion + 171+ raw hex (D06 bleed)** — WorkflowDrawer (reg), WorkflowExecutionPanel, EventWorkspace duplicate status maps (#10B981/#FBBF24/#EF4444 etc.) + 0 v3- adoption in main regulatory WorkflowDrawer.  
   - **Action**: Port all three to VeilDrawer + VeilPrimitives + central --v3-state-* or ci-status tokens (no literals). Kill duplicate maps. Same for EventWorkspace/BlockerPanel/Primitives.  
   - **Priority**: High | Owner: Regulatory + Primitives team.

6. **Onboarding V2 (canonical per D-002) + Journey V1 have 0% V3 Veil + constrained frame adoption (254 raw hex in onboarding-v2, absolute vw cinematic in Journey)**  
   - **V3 Design**: Executive_Summary Tier 1 + §6 (Onboarding V2 "cleanest early V3 reference"); CANONICAL §17 + D07/D19/D20; V3-Spec single-glass + 4-sided.  
   - **Action**: (a) Migrate OnboardingV2Layout + UnitDrawer + pages to ShellContentFrame + SurfaceCard/GlassPanel + --v3-* (remove 260px sub-rail, 760px drawers, white panels). (b) Deprecate Journey V1 cinematic routes (env gate → prod flag OFF; archive absolute vw transforms). (c) Unify V2 role catalog + engine as single source (wire to CES). (d) Extend verify:ui to cover both trees. Make V2 first full reference surface per exec summary.  
   - **Priority**: High | Owner: Agent 03 + Onboarding lead.

7. **eCign isolated navy/orange (#1A3778/#F04B22) + 21+ hex never converged (D08)**  
   - **Action**: Map eCign consts + buildSignerRosterHtml to V3 teal/orange or semantic status tokens; update FormSigningWorkspace.  
   - **Priority**: High | Owner: eCign + Agent 04/07.

8. **Task identity fragmentation on highest-stakes CES board path (non-canonical ceu-* never normalized)**  
   - **Action**: Add bridge in useComplianceExecution + ces board so all ExecutionUnits expose canonical task_id via normalizeEventTaskIdentity + buildTaskIdRemapForEventInstance. Update Ces MyTasks nav + enforcement. New DRIFT D-CES-IDENTITY-01.  
   - **Priority**: High (re-introduces Q2 bugs under V3) | Owner: Agent 02 + taskIdentity owner.

9. **1084+ verify:ui warnings + 3745 raw hex across src/ (D01)** — heavy in ces/regulatory/onboarding.  
   - **Action**: Time-boxed sprint to inert legacy refs in ces/ + regulatory/ + onboarding-v2/ before any Phase 2 board work. Add raw-hex lint as CI gate.  
   - **Priority**: High | Owner: Agent 01/14/15.

10. **MasterCalendar + MyTasks retain blacklisted inline rails + mixed v3/ci inside VeilDrawer (violates 4-sided + single-glass)**  
    - **Action**: Per A01-02 / Agent 02 item 3: full migration to shell-only + conditional V3 drawer; delete .ci-right-panel rules + SprintTaskPanel imports.  
    - **Priority**: High | Owner: PM + Calendar.

---

## Tier 2 — Medium (Sequencing, Governance, Perf, Mobile, A11y, Long-Term)

11-25. (Synthesized from remaining 28 agent reports — full per-agent detail in subagent transcripts; representative examples below. All 32 agents flagged 4-8 items each; deduped here.)

- **A13-01 (Agent 13)**: Any CES V3 drawer rollout >10% users requires Agent 13 + Agent 04 sign-off on evidence/signature/print fidelity under 0.7s veil transitions. Add "Surveyor Density Mode" toggle preserving info density.  
- **A14-01 (Agent 14)**: Profile 32px blur + 0.7s + heavy backdrop on live CesBoard (20+ units) at 5174; add will-change + backface-visibility guards + reduced-motion fallbacks (already in CSS but not uniformly applied).  
- **A15-01 (Agent 15)**: Quantify parallel debt burndown model (CES navy + legacy panels + 8 card families + raw values); add to DRIFT with monthly burn rate.  
- **A20-01 (Agent 20)**: Recommended 5-phase sequence: (0) Token/lint gates + owner assignments for D01/D03/D06; (1) Onboarding V2 as first full V3 reference surface; (2) CES board identity unification + V3 drawer beachhead; (3) Full May20 right-panel removals + V3 Evidence/Task panels; (4) Mobile + a11y matrix on veil; (5) Cross-surface harmonization + governance lock. No-go gates: fidelity proof (Agent 04/13), drift injection prevention (Agent 16/21).  
- **A21-01 (Agent 21)**: Concrete pre-rollout playbook: (a) new lint rule for v3-*/glassVariant/raw-hex in ces/regulatory/onboarding; (b) PR template checkboxes for "V3 Contract Reviewer" + 4-sided + token scan; (c) Playwright visual regression on 5174 for v3-veil drawers + CES board (pixel + HTML diff vs staging mocks); (d) DRIFT owner matrix before any surface Phase 2.  
- **A24-01 (Agent 24)**: Define dashboard: defensibility score (signed artifact hash match rate), V3 primitive adoption % (target 80%+ on CES/Evidence by Phase 2), visual regression failure rate <0.5%, surveyor NPS on constrained view, task open time (drawer 0.7s impact), raw-hex count trend. Instrument via existing stores + new verify:ui --v3-coverage flag.  
- **A26-01 (Agent 26)**: Audit showed Executive_Summary / CES status report / DRIFT claims of "15-25%" overstated vs actual 0-5% code execution on May20 items. Freeze docs until live 5174 diffs are attached; assign owners to all 25 D-items (currently ~8 have owners).  
- **A31-01 (Agent 31)**: Full a11y audit of v3-veil drawers (focus return via openerRef is good; contrast on --v3-teal-light on 32px blur glass; ARIA in RightDrawer role=dialog good but regulatory content inside needs heading structure + live regions for state changes). Reduced-motion path not uniformly respected in ces WorkflowDrawer custom anims.  
- **A32-01 (Agent 32)**: Long-term: (a) "Veil Guardian" rotating role (quarterly mini 8-agent audits on live 5174); (b) V3 linter + token coverage as required CI gate; (c) Quarterly DRIFT closure reviews with owners; (d) All new surfaces must have 5174 + Playwright v3 regression before merge; (e) Update CANONICAL + V3-Spec with explicit CES exception scoping rules.  

**A16-01 (Agent 16 — Pre-Rollout Drift Injection Risks)**: Mapped 6 active drift injection vectors in the current live implementation that will multiply during V3 CES right-panel rollout if not blocked now.

**Critical vectors**:
1. **CES Parallel Primitive Ecosystem** (D26): `ces/components/primitives.tsx` + `CesCard`/`V3Section`/etc. with heavy raw `style={{}}` + CES_TOKENS. Near-zero `ui/` primitive adoption across ces/board, calendar, reports, workloads, MyTasks, CesLayout. New V3-flavored variants being invented inside the parallel system.
2. **Custom Drawer Bypasses** (D27): `ces/.../WorkflowDrawer.tsx` is a full custom `fixed inset-0 z-[70]` + `v3-veil-glass-panel` (560px) that does **not** use `VeilDrawer` or `V3StackedDrawerHost`. Another regulatory/WorkflowDrawer + SprintTaskPanel custom modals. Violates "no inventing route-local drawer systems".

**High vectors**:
3. V3 class/token proliferation outside governance (new `VeilPrimitives` like TaskRowMinimal/VeilSection landing without full spec registration; ui-staging vs prod CSS split).
4. Raw values + arbitrary Tailwind still rampant in live drawer/content paths (lint guardrails narrowly scoped to only 7 attested files).
5. Shell/framing inconsistencies (CesLayout bypasses full `ShellContentFrame`; conditional inline vs drawer creates 4-sided violations).
6. Process gaps (PR template has partial CES anti-CesCard checkbox but missing explicit "must use VeilDrawer/V3Stacked", "4-sided verification", "V3 Contract Reviewer" gate; these exact vectors not yet in DRIFT_REGISTER).

**Prioritized safeguards (pre any further CES drawer expansion)**:
- Add D26–D29 to DRIFT_REGISTER immediately with owners + Phase 1 targets.
- Strengthen `.github/PULL_REQUEST_TEMPLATE.md` with explicit V3 contract checkboxes ("All drawers use VeilDrawer or V3StackedDrawerHost", "CES surfaces use only ui/ primitives or documented ces.* token exception", "4-sided breathing room verified", "No new v3-* without token pipeline registration") + mandatory "V3 Contract Reviewer" approval for any ces/ or ui/Drawer change.
- Expand eslint rules to `ces/**/*` + drawer files: ban raw `text-\[\d+px\]`, force `--v3-*`/`--ci-*` or ui/ imports, add no-restricted-imports for ces/primitives outside approved files.
- Migrate the two highest-risk bypasses (CES WorkflowDrawer → V3Stacked + canonical primitives; deprecate CesCard family in favor of GlassPanel/SurfaceCard + scoped ces tokens).
- Appoint + operationalize V3 Contract Reviewer role (1–2 named people) with linked 32-agent checklist requirement for CES/V3 surfaces.
- Add Playwright visual regression baselines specifically for all VeilDrawer/V3Stacked entry points + 4-sided inset checks (vs May 20 PDF + Top Picks mocks).
- Record explicit CES policy minimum primitive adoption list (per Spec §16) and freeze new ces/ UI files.

**Priority**: Critical (these are the exact pre-rollout vectors the 32-agent plan and Agent 21 playbook were written to stop). Owner: Governance + Primitives + CES leads (Agent 16 + 20 + 21 + 07 + 15). Must be closed before Phase 1 drawer beachhead (A20-01) goes broad.

**A11-01 (Agent 11 — Mobile Responsive V3 Veil)**: Primitives (VeilDrawer/BottomSheetDrawer/RightDrawer) are well-behaved on mobile, but major CES bypasses still exist: WorkflowExecutionPanel (custom 480/680px panels), ces/details/WorkflowDrawer (560px custom), EvidenceCenter DetailDrawer. Breakpoint mismatch (767px vs 1024px). Actions: Force the 3 bypasses to use VeilDrawer + bottom-sheet path; harmonize breakpoints; enforce via lint "no raw fixed-width side panels".

**A10-01 (Agent 10 — Typography Spacing Density Drift)**: Severe violations in CES high-density surfaces (ExecutionUnitCard 9-12.5px text, WorkflowDrawer 10-12.5px + tracking everywhere, primitives 9.5px badges, EvidenceCenter text-xs walls). V3 drawers inherit the drift. Actions: Emergency ban on <12px in ces/** and *Drawer*; align --ci- tokens to V3 §7 (11px+ eyebrows, 13-14px body); full port of WorkflowDrawer/SprintTaskPanel/ExecutionUnitCard to token-driven scale.

**A09-01 (Agent 09 — Primitive Adoption & Redundancy)**: CES maintains near-complete parallel primitive system (CesCard family + custom cards in 16+ files, only 1 ui/ import in ces/). 4+ EvidencePanel variants. V3 drawers wrap legacy content. Actions: Strangler migration on CES surfaces to SurfaceCard/GlassPanel; unify EvidencePanel into ui/; deprecate CesCard; expand verify:ui + lint to ban ces/primitives outside approved files.

**A08-01 (Agent 08 — Glass Layering & 4-sided Constrained Contract)**: Dashboard has double ShellContentFrame nesting. CES (CesLayout + dense 6-col board) bypasses single dominant glass entirely. 77.7% main card absent from production. Actions: Remove Dashboard double-wrap; deprecate CesLayout or make it thin V3-aware header only; add 77.7% constrainedWidth mode to ShellContentFrame; global lint "no nested ShellContentFrame, no CesLayout on new routes".

**A06-01 (Agent 06 — Cross-Store Dataflow Consistency)**: useComplianceExecution is expensive hook with heavy recomputes during 0.7s drawer animations; selectedTaskStore not hardened for V3 exit lifecycle; dual onboarding systems (V2 isolated); getState anti-patterns everywhere; legacy panels still embedded in partial VeilDrawers. Actions: Harden selectedTaskStore + GlobalTaskDrawer for animation exit; convert useComplianceExecution to zustand or add animation-throttled variant; eliminate getState calls; unify onboarding into main dataflow; complete port of CES content into pure V3 veil primitives.

**A31-01 (Agent 31 — Accessibility & Reduced Motion in Veil Glass)**: Systemic critical gaps in the V3 Veil Glass implementation that are **amplified** by the premium aesthetic (heavy 32px blur + constrained 4-sided frames + moving Travelight backdrop + 0.33 hairlines).

**Critical failures**:
- **No focus traps anywhere** (RightDrawer, BottomSheetDrawer, VeilModal, V3StackedDrawerHost, CES WorkflowDrawer, FormMaximizedModal, etc.). Background content remains partially visible and operable through open glass drawers → classic leaky modal problem made worse by the expensive blur aesthetic.
- **Contrast failure on glass**: `--v3-teal: #007970` on `--v3-base-bg: #05060A` = **3.83:1** (fails WCAG AA normal text). Small tertiary text (10-13px) + muted colors inside drawers + variable luminance from moving streaks = high risk.
- **TravelightBG.tsx has zero reduced-motion guard** (canvas RAF + long CSS animations continue under veil glass → vestibular trigger).
- **CES WorkflowDrawer** (the most-used production drawer): No `role="dialog"`, no `aria-modal`, no `aria-label`, no openerRef/focus return, backdrop misuse.
- **VeilModal** has no openerRef/focus return at all.
- Inconsistent reduced-motion rules (some blocks allow 220ms opacity, stricter blocks kill everything). No `forced-colors` or `prefers-contrast` support.
- Focus return timing tied to 680ms exit timers creates disorientation when animations are suppressed.

**High-impact actions**:
1. Implement focus trap (react-focus-lock or equivalent) in **all** dialog/drawer/modal primitives + CES ad-hoc drawers. Map to D15 + Agent 13 "No Focus Traps Anywhere".
2. Remediate v3-teal contrast on glass surfaces (promote `--v3-teal-light` or higher-contrast variants for normal/small text inside `.v3-veil-glass-panel`).
3. Add proper reduced-motion guard to TravelightBG.tsx (static or heavily throttled mode when `prefers-reduced-motion: reduce`).
4. Add full dialog ARIA + openerRef/focus return to CES WorkflowDrawer (and any other non-primitive drawers).
5. Add openerRef/focus return to VeilModal.tsx.
6. Add `@media (forced-colors: active)` and `prefers-contrast` rules to index.css; map glass borders/focus/teals to system colors.
7. Unify reduced-motion handling into one authoritative V3 block. Make focus return instant on RM.
8. Add roving tabindex + arrow navigation + proper roles to CES boards/kanban inside drawers (per D15).
9. Enlarge touch targets (<44px icon-only actions common in drawers).
10. Expand use of `AriaLiveRegion` for dynamic drawer content (evidence uploads, status changes).

**Priority**: Critical (compliance product + regulated CES/surveyor flows; glass aesthetic makes every gap worse). Owner: A11y + Primitives + CES (Agent 31 + 13 + 14). Directly blocks safe rollout of any V3 veil surface used by end users. Re-audit with axe + manual keyboard/SR/reduced-motion/forced-colors testing on live 5174 drawer surfaces after fixes.

**A19-01 (Agent 19 — Cross-Surface Consistency Failure Modes)**: Detailed divergence matrix across Dashboard (strongest V3 adoption), Evidence (good token usage), CES (highest risk – parallel navy dialect via ces/theme.ts + CesCard + custom CesLayout header that breaks single-glass illusion), Calendar (survives on heavy `.v3-calendar-surface` CSS overrides + !important hacks), Onboarding V2 (catastrophic total break – own white sub-shell with 260px rail + bg-white cards, dozens of raw hex, custom UnitDrawer, ignores all ShellContentFrame / VeilDrawer / ui/ primitives).

**Predicted failure modes under real velocity**:
- CES "justified sub-brand" navy exception spreads to new reports/workloads components.
- Onboarding V2 becomes a permanent foreign visual language (white nested layout shatters 77.7% constrained glass + backdrop + watermark).
- Drawer fragmentation (some flows get full VeilDrawer + V3Stacked + 0.7s glass transitions; others keep inline SprintTaskPanel / custom UnitDrawer).
- Token drift via surface-specific overrides + direct `var(--v3-*)` usage bypassing primitives.
- Invisible surface rule + 0.33 border contract erode under time pressure.
- Status color regression (reds/ambers reappear in CES details + onboarding alerts).

**Prevention actions (prioritized)**:
1. Immediate governance: Enforce `UI_PRIMITIVE_OWNERSHIP_MAP.md` + `UI_TOKEN_CONTRACT_SPEC.md` in PR template for all 5 target surfaces. Block merges with raw hex or new local cards/drawers/layouts. Add lint for hex outside allowed status + ban on new `useCesTokens` or OnboardingV2Layout-style sub-shells without waiver.
2. CES remediation (highest priority): Deprecate `ces/theme.ts` + `primitives.tsx` CesCard in favor of `--v3-*` + canonical `SurfaceCard`/`GlassPanel`. Force CesLayout content into `ShellContentFrame`. Migrate `SprintTaskPanel` + WorkflowDrawer fully to `VeilDrawer` + `V3StackedDrawerHost`. Update May 20 drawer remediation doc with "no new CES primitives" rule.
3. Onboarding V2 full reintegration (Phase 2 critical): Replace entire `OnboardingV2Layout` with composition inside global shell + `ShellContentFrame`. Delete custom `UnitDrawer` + `StatusPill` etc.; route everything to `VeilDrawer` + `CiStatusBadge`. Full raw hex audit/replacement.
4. Unified drawer + transition contract: Mandate `VeilDrawer` (or V3StackedDrawerHost) for **all** right panels/details. Add global V3 page transition wrapper (layered glass scale + blur cross-fade) in CommandCenterLayout.
5. Primitives + shell hardening: Expand `ui/` with missing gaps (OperationalKpiTile, semantic StatusPill, etc.). Make `ShellContentFrame` the only allowed root for operational content. Promote `.v3-invisible-glare` etc. to documented primitives.
6. Long-term: Single source `tokens.json` pipeline; visual regression suite targeting the 5 surfaces side-by-side; quarterly cross-surface consistency agent review with sign-off gate.

**Priority**: Critical (Onboarding V2 is the single largest point of total failure; CES fork is the highest-risk spread vector). Owner: Primitives + CES + Onboarding leads (Agent 19 + 07 + 15 + 03). Directly blocks clean execution of A20-01 sequencing.

**A05-01 (Agent 05 — Role-Based Workflow & Permissions V3 Clarity)**: Three parallel role systems (CES_ROLES locked 7-role set for signing/escalation, Onboarding-v2 19-role domain catalog, Security/Identity userGroups + auth.role) with no unified resolution. Permission layers (RoleGate trainer-deny, dynamic Page View Access Matrix with managers always-write, PermissionGate, CES canRoleSign/isDonAssistant) are multi-layered but have critical gaps. V3 calm constrained glass (77.7% frame, 0.33 borders, heavy blur, single-dominant-glass) actively obscures role context and urgency (no persistent "You are acting as [Role] in [Sprint]" banner; hardcoded mock profile in CesLayout top bar; CesRoleReviewSwitcher buried in dropdown for one user only).

**Critical P1 Leakages**:
- Trainer/Onboarding Admin UI leakage: `user.provision` permission in Onboarding group (userGroups.ts) wired too broadly → trainers see user management/config they should not (forensics doc + live code).
- DON Assistant signing gap: `isDonAssistant` + `canRoleSign` defined but enforcement in FormSignatureFlow / signer paths incomplete (audit risk on signatures).

**V3 Opportunity (per Exec Summary §9)**: Use limited orange neon (Command Center eyebrow + My Personal Workspace) to surface explicit "You are acting as [EffectiveRole] ([CES Context])" in shell header/topbar across all surfaces.

**Actions**:
1. Add persistent role context banner in `CommandCenterLayout.tsx` / `ShellTopbar` (or account area) using V3 orange neon treatment; pull from `useAuth` + CES review/assignment state. Make visible on every V3 surface.
2. Fix `CesLayout.tsx:16` hardcoded `PROFILE = { name: 'JD Vance', role: 'Administrator Designee' }` → dynamic from current user + resolved CES role.
3. Promote CES review role visibility beyond Robert (gated simulation mode for training/QA).
4. **Immediate P1**: Audit + narrow `user.provision` scope in `permissionCatalog.ts` + userGroups + feature catalog (remove from Trainer/Onboarding or tightly scope). Browser-validate as trainer role.
5. **Immediate P1**: Enforce DON Assistant signing prohibition as hard block (not fallback) in `FormSignatureFlow.tsx`, `FormViewer.tsx`, signerTaskFactory. Add explicit tests + state refresh on role switch.
6. Create canonical `useEffectiveRole()` hook bridging the three catalogs + pageAccess + CES assignments. Update PageAccessMatrix + admin surfaces.
7. Integrate with Phase 1 drawer work (A20-01): Surface role context inside new V3 Evidence/Task panels.
8. DRIFT ownership for role obscurity + D14 (CES urgency) before further CES V3 rollout.

**Training (Agent 22 overlap)**: Per-role modules on new "acting as" banner, CES role switching, leakage awareness (trainers must know their limited view), DON Assistant vs. DON signing rules. Hands-on in ui-staging + live 5174 with role switcher. Include before/after role context screenshots.

**Priority**: Critical (P1 leakages are active security/audit defects) + High (role clarity is compliance + usability defect amplified by V3 calm glass). Owner: Security/Identity + CES + Shell (Agent 05 + 22 + 13). Cross-refs: V3 spec role clarity section, forensics TRAINER_ONBOARDING_ADMIN_LEAKAGE.md, ces/cesRoles.ts, CommandCenterLayout.tsx nav/role logic.

**A20-01 (Agent 20 — Optimal V3 Rollout Sequencing Strategist)**: Produced a concrete 5-phase critical-path sequence (refining the preliminary sketch in the Executive Summary) that prioritizes **regulatory defensibility** (CES Evidence/Tasks first with hard gates), **drift prevention** (DRIFT_REGISTER ownership + visual baselines + contract enforcement as Pre-Phase 0 and continuous), and **early visible value** (premium v3-veil task/workflow drawers on high-traffic surfaces in Phase 1).

**Recommended 5-Phase Sequence (with first files & no-go gates)**:
- **Pre-Phase 0 (Foundation Gate — immediate, days)**: Assign DRIFT owners to D01/D03/D06/D09/D15 + top 10; update PHASE1_EXIT_CHECKLIST + Exec Summary; add V3 contract checkboxes to PR template; commit visual regression baselines (ui-staging + May20 PDF mocks + tmp-ui-verify-screenshots). **No-Go**: No Phase 1 code until this is done.
- **Phase 1 (Drawer Shell Beachhead + Early Value — 2-3 weeks)**: Activate full v3-veil constrained drawers on highest-traffic paths. **First file**: `src/policy/pages/MasterCalendarPage.tsx` (remove all SprintTaskPanel + legacy inline right-panel paths; ensure TaskDetailContent / WorkflowExecutionPanel render inside VeilDrawer with correct v3 contract). Parallel: MyTasksPmPage, complete WorkflowDrawer v3 polish, GlobalTaskDrawer/V3StackedDrawerHost alignment. Deliverable: CES task + workflow unit detail in premium veil drawers. Strong no-go gates on visual fidelity, 4-sided contract, no new drift.
- **Phase 2 (Content Fidelity — 3-4 weeks)**: Create/integrate New V3 EvidencePanel + V3 TaskDetailRightPanel (using only ui/ primitives + --v3-*). Port rich folder/evidence/signatures content. First consumers: WorkflowExecutionPanel, EventWorkspace, MasterCalendar/MyTasks. **Dependencies**: Phase 1 drawers stable. Hard defensibility/audit gate (Agent 13 sign-off) before pilot.
- **Phase 3 (Surgical Removals + CES Scoping — 2 weeks)**: Execute exact May 20 removals list (delete EvidencePanel.tsx, TaskDetailRightPanel legacy, SprintTaskPanel, old WorkflowDrawers, RightPanelPreview + all call sites). Purge .ci-right-panel from index.css. Scope CesLayout per D03 decision. **Dependencies**: Phase 2 replacements proven.
- **Phase 4 (Reference Surface + Enforcement — 4 weeks)**: Full canonical reconstruction of DashboardPage (or EvidenceCenter) as first reference surface (100% ShellContentFrame, ui/ primitives only, zero raw values). Accelerate D01 burn. Harden lint/token pipeline. Update PHASE1 checklist with evidence.
- **Phase 5 (Controlled Expansion + Governance)**: Roll remaining surfaces via the 16_Agent_Reports 4-phase plans, always with DRIFT pre-check. Institutionalize Agent 21 playbook + Agent 32 recurring audits.

**Text DAG** (simplified): Pre-0 → Phase 1 (MasterCalendarPage.tsx first) → Phase 2 (new V3 panels) → Phase 3 (removals + D03 scoping) | (parallel safe increments) → Phase 4 (reference surface) → Phase 5.

All phases maintain ui-staging baselines + DRIFT updates + defensibility spot-checks. Cross-cutting: ui/index.ts primitives + Shell* + v3 CSS as stable foundation.

**Immediate recommended next step**: Execute Pre-Phase 0 (DRIFT owners + baselines + PR template) today, then kick off Phase 1 on `MasterCalendarPage.tsx` (remove legacy SprintTaskPanel path + confirm full VeilDrawer v3).

**A15-01 (Agent 15 — Technical Debt & Parallel System Proliferation)**: Quantified parallel maintenance tax is material and growing. CES sub-system alone is **7,861 LOC** (31 files) + **1,909 LOC** in core legacy right panels (EvidencePanel, TaskDetailRightPanel, SprintTaskPanel, WorkflowDrawer variants). 212 raw `style={{` in CES (12 files, heaviest: WorkflowDrawer 35, RobertCesReviewLayer 37). 121 CES_TOKENS references but only ~4 files use the mandated `useCesTokens()` hook; 5 files still do static imports (direct violation of theme.ts contract). 16 files still reference live legacy panels. 8+ distinct card/surface families. Desync between `ces/theme.ts` (now teal #00D1C1) and `index.css` (still classic navy #1F4A8A + later v3 bridge). 
  - **V3 Design Violated**: DRIFT D03 (CES full parallel — Phase 1 decision), D01 (raw values), D06 (card families), D14 (independent urgency). Executive Summary: "~5-15% executed" on CES Right Panel V3 despite complete May 20 specs; "Zero activation of glassVariant="v3-veil" on any real CES Evidence/Tasks right panels". CES_Right_Panel_Decluttering_Status_Report: only 15-25% density reduction progress.
  - **Actions (Debt Burndown Model)**:
    1. **Phase 0 (3-5 days)**: Sync `ces/theme.ts` ↔ `index.css` navy values + comments; convert all 5 static CES_TOKENS importers to `useCesTokens()`; adopt `.ci-text-ces-*` convenience classes. Replace first 50% of the 212 CES raw styles (start with WorkflowDrawer + RobertCesReviewLayer + SprintTaskPanel).
    2. **Phase 1 (1-2 sprints)**: Execute full May 20 legacy right panel migration + deletion (EvidencePanel, TaskDetailRightPanel, SprintTaskPanel, old WorkflowDrawers) across the 16 integration files (MasterCalendar, MyTasksPm, WorkflowExecutionPanel, etc.). Replace with full-shell + V3StackedDrawerHost + new integrated V3 Evidence/Task panels.
    3. **Card family consolidation (D06)**: Deprecate or scope CesCard / ExecutionUnitCard / custom primitives in favor of (or extend) GlassPanel + SurfaceCard with CES variant.
    4. **Phase 2+**: Burn remaining raw styles (target <50 in CES); integrate token pipeline + lint rule blocking new `style={{` outside governed exceptions; measure via living DRIFT burndown %.
  - **Priority**: High (D03 is a Phase 1 blocker; 15-30% extra effort tax on all future V3 work on compliance core) | Owner: CES + Primitives + Token Guardian (Agent 15 + 07 + 01) | Quantified scope: ~10k LOC + 2937 raw instances across 152 files. Projected savings: halved styling/maintenance post-migration; single primitive surface; unblocks Phase 1 exit.

**A18-01 (Agent 18 — Data Integrity & Evidence Capture under V3 Drawers)**: Evidence capture correctly routes through `demoEvidenceRuntimeCache` + `resolveEventFolder` + audit events regardless of container, but the **visual/operational surface** for folder hierarchies and rich status is still almost entirely legacy rails or full pages. New V3 veil drawers have the primitives (including 'evidence' layer type in V3StackedDrawerHost) but lack integrated content, PhotoEvidenceCapture wiring, and folder-aware UIs.
  - **Evidence (production paths)**: `ces/components/details/WorkflowDrawer.tsx` (partial V3) only has local summary `EvidenceStatusPanel` + mock upload (no real stash, no PhotoEvidenceCapture, no folder tree); `regulatory/EvidencePanel.tsx` + `WorkflowExecutionPanel` still legacy (flat lists, embedded in rails); `GlobalTaskDrawer` + `V3StackedDrawerHost` only wires 'task' layer (no 'evidence' yet); `PhotoEvidenceCapture.tsx` primitive exists but **zero** production call sites; `CesEvidenceHierarchyPanel` (rich Year→Quarter→... folder tree) only in full EvidenceCenterPage (uploads blocked, "go to CES task drawer"); `eventFolders.ts` + `regulatoryExecutionStore.uploadEvidence` correctly build `folderPath` but it is rarely surfaced inside any veil drawer; constrained widths (420-640px) + 0.55-0.7s subview-animate + initial blur/scale will clip or delay visibility of live status (EVIDENCE_LOCKED, missingEvidenceOnly, escalation timers).
  - **V3 Design Violated**: May 20 `CES_Evidence_and_Tasks_Right_Panel_V3_Drawers_To_Implement.md` (new V3 EvidencePanel + TaskDetailRightPanel inside shell with rich folder/evidence structure + exact PDF match); Executive_Summary + Agent 13 mandate (audit defensibility, evidence chain of custody, surveyor experience); V3-Spec "expensive but premium" motion must not regress critical compliance workflows.
  - **Actions** (highest-risk area for audit evidence completeness under V3 migration; overlap Agent 04/13/14):
    1. Create + integrate `V3EvidencePanel` (inside Veil/RightDrawer + V3Stacked 'evidence' layer) per May 20 spec: folderPath display, hierarchy subtree (or deep-link), upgraded EvidenceStatusPanel, live status. Wire `resolveEvidenceDataUrl` + prefetch.
    2. Wire `PhotoEvidenceCapture` into every drawer upload path (ces WorkflowDrawer, regulatory EvidencePanel modal, TaskDetail actions, WorkflowExecutionPanel). Replace raw `<input type=file>`. Pair with immediate stash + uploadEvidence + folderPath.
    3. Migrate ces `WorkflowDrawer` fully to Veil primitives (remove CES_TOKENS mixing; ensure EvidenceStatusPanel survives 0.7s subview-animate without perceptible delay).
    4. Extend `GlobalTaskDrawer` / `V3StackedDrawerHost` to support stacked 'evidence' layers (renderLayer for DrawerLayer 'evidence'). Preserve folder context + cache resolution in nested task → evidence flows.
    5. Audit + harden expensive anim impact on live evidence flows: reduced-motion + faster variants for evidence-critical drawers; instrument post-upload status visibility timing; validate cross-tab (ArtifactViewer) after drawer capture + close.
    6. Guarantee folder structure visibility in any V3 EvidencePanel in drawer (prominent `folderPath`/`objectPath`, collapsible tree, no clipping in constrained widths). Update EvidenceCenterPage guidance to always prefer drawer context for uploads.
    7. Legacy cleanup coordination: delete `EvidencePanel.tsx` / old WorkflowDrawer usages only after V3 versions + folder/status fidelity proven in veil (per May 20 removals doc). Update all call sites (WorkflowExecutionPanel, EventWorkspace, calendars).
    8. Data integrity tests (joint with Agent 13): large-blob photo capture in drawer → stash → IDB prefetch → resolve across tabs/reloads; validation failures surfaced visibly inside V3 drawer (not hidden by anim); eCign signature → evidence promotion end-to-end in stacked veil.
    9. Use `ui-staging/` V3 evidence mocks as baseline; ensure production drawer versions do not regress "Artifact integrity not verified" warnings.
  - **Priority**: Critical (P0 for audit defensibility) | Owner: Agent 13 (lead) + Agent 18 + CES/Regulatory + Evidence | Blocks full rail removal and safe V3 rollout on high-stakes evidence surfaces. See 9 detailed actions + file list in Agent 18 transcript.

**A12-01 (Agent 12 — Brand/Dark Mode/Sub-brand Coexistence)**: V3 forcing is aggressive and effective at shell level (`CommandCenterLayout.tsx:330-337` unconditionally sets `data-theme="v3-veil"` + `data-ci-mode="v3"` on every protected route), but sub-brand exceptions are inconsistently overridden and eCign is completely isolated.
  - **Evidence**: `ciModeStore.ts` + `uiStore.ts` always write `'v3'` (legacy branches dead); `ces/theme.ts` "navy" logic + dark variants are inert under V3 forcing (always teal-aligned LIGHT tokens via failed `isCareIndeedDark` check); static `import { CES_TOKENS }` in `ces/components/details/WorkflowDrawer.tsx:9` bypasses hook; eCign in `FormSigningWorkspace.tsx` (and FormViewer, `buildSignerRosterHtml.ts`, MasterControlInventory.tsx:112) uses fully hardcoded `NAVY = '#1A3778'`, `ORANGE = '#F04B22'` with zero connection to V3 vars, CES remap, or dataset; `#00e59b` (non-V3 bright cyan-green) pervasive in `SharedPolicyDetailView.tsx` (20+), Framework/Demo pages, Policy surfaces; dozens of unreachable `theme === 'care-indeed-light'` branches remain.
  - **V3 Design Violated**: V3-Spec §6 "Strict color rule" (teal dominant + orange *only* for the two neon cases); Executive Summary single canonical brand language; DRIFT D03 (CES parallel) + D08 (eCign separate navy/orange); CANONICAL_UI_SYSTEM_SPEC token contract.
  - **Actions**:
    1. Full audit + eradication of `#00e59b`, eCign `#1A3778`/`#F04B22`, and remaining raw brand hex in `src/policy/components/`, `pages/`, `ces/`, `ecign/` — map to `var(--v3-*)` or governed aliases.
    2. CES governance decision (D03): Either retire `--ces-*` namespace entirely under V3, or add explicit runtime guard in `ces/theme.ts` + CSS: `if (document.documentElement.dataset.theme === 'v3-veil') return v3TealTokens`. Delete dead `isCareIndeedDark` path + update all docs/comments. Add lint against direct CES navy imports outside ces/.
    3. eCign convergence (D08 — highest legal risk): Migrate `FormSigningWorkspace.tsx`, `FormViewer.tsx`, print generators, and `buildSignerRosterHtml.ts` to V3 teal/orange (or minimal `ecign/` aliases with strict limits). Remove all hardcodes. Prioritize signing + cert flows.
    4. Store + dataset hygiene: Remove legacy values from `ShellTheme`/`CiMode` unions or make them throw under V3. Introduce central `useV3Mode()` hook; replace raw `isLight` checks everywhere.
    5. Live surface pass (SharedPolicyDetailView, Framework/Demo pages, MasterControlInventory, CES drawers): Replace all non-approved hardcodes with V3 tokens.
    6. Add explicit "V3 override contract" section to V3-Spec and `ces/theme.ts`. Link Agent 12/07/15 reports.
    7. Visual regression on 5174 (V3 mode forced) vs CES mocks + eCign print paths to prove no legacy leaks in PDF/staging.
  - **Priority**: High (D08 on signing surfaces is audit/compliance exposure; D03 governance debt blocks clean rollout) | Owner: Brand Guardian + Agent 07/12 + eCign/Policy teams | See full per-file evidence in Agent 12 transcript.

**A14-01 (Agent 14 — NEW Perf/Scalability from local live 5174 analysis)**: V3 expensive glass/anim first-break surfaces under real high-volume CES load (100+ units, frequent drawers, drag, cross-flows). 
- **Evidence (production paths only)**: ShellContentFrame.tsx:59-60 + ShellTopbar:31 (always-on `var(--v3-glass-blur)` 32px on every page — baseline cost); RightDrawer.tsx:67-76 + BottomSheetDrawer.tsx:132 (hardcoded 680ms exit timer >> 260-320ms CSS; keeps full heavy subtree mounted + blurred during exit); ces/components/details/WorkflowDrawer.tsx:69 + 104 + 195 (custom v3-veil-glass-panel + v3-subview-animate + v3-stagger on ChildTasksPanel/SignatureRoster + full `allUnits` prop drill from SprintExecutionBoard:212); index.css:79/1356-1382/2839-2922 (0.7s/0.62s cubic + animated filter:blur(3-4.5px) + will-change on .v3-*-panel + 32px + 8-12px scrims); CommandCenterLayout:882 (700ms + blur-12 on content during nav); no virtualization, dupe glass impls (CES WorkflowDrawer bypasses VeilDrawer primitives), no will-change hygiene or onTransitionEnd.
- **V3 Design Preserved but at Risk**: "Expensive but premium" 0.7s signature cubic + 32px matte single-glass (V3-Spec executive + §4 + index.css comments) + CANONICAL §4 constrained shell. Must not regress under real compliance volume (agent27 overlap).
- **Actions** (surgical, preserve luxe feel):
  1. Replace fixed 680ms timers in RightDrawer.tsx:75 and BottomSheetDrawer.tsx:132 with `onTransitionEnd`/`onAnimationEnd` (unmount sooner while keeping visible premium exit ~320ms).
  2. Shell optimization (highest leverage): Reserve true 32px blur for focused drawers/modals only; baseline ShellContentFrame/Topbar drop to 8-12px (or conditional via data-high-complexity when >50 units visible on CES board). Add `transform:translateZ(0)` + `isolation:isolate` sparingly.
  3. CES-specific: Virtualize long lists in WorkflowDrawer ChildTasks/SignatureRoster + board ExecutionUnitCard grid (react-window or simple windowing for >60 units); React.memo cards + stable keys; limit `allUnits` prop to filtered siblings only; throttle drag `setUnits`.
  4. will-change hygiene: Apply only during active anim (class toggle or useLayoutEffect + transitionend); reset to auto aggressively (already partial in remaps). Avoid on permanent shell frame.
  5. Keyframe cost reduction (keep perception): Shorten/remove inner `filter:blur()` anims (opacity/translate only for most enter/exit); consider 0.45-0.55s as "premium enough" for drawers while reserving 0.7s for hero moments; cap v3-stagger at 5-7 items or make optional.
  6. Backdrops: Lower most scrims to 6-8px blur; 32px only on the veil panel itself. Avoid nesting (shell + overlay + drawer).
  7. Migrate dupe glass (CES WorkflowDrawer, Evidence DetailDrawer, ModalShell) to VeilDrawer/RightDrawer primitives for consistent timer/anim handling.
  8. Runtime guards: Detect high DOM count / low deviceMemory / FPS sample → auto lighter glass fallback (disable some blurs/anim durations) while default remains premium.
  9. Measurement: Add lightweight perf marks around drawer mount/anim + CES board render in dev (target <16ms frames on 100-unit loads at 5174). Add to verify:ui or new perf script.
- **Priority**: High (Critical under load; gate before broad CES V3 rollout on boards) | Owner: Perf + CES + Shell (Agent 14 + 27 + 01) | See full mitigations + volume modeling in Agent 14 transcript.

- Additional from Agents 05/08/09/11/12/16/17/18/19/22/23/25/27/28/29/30: role context in v3 glass (Command Center neon orange + "Acting as X"), 4-sided enforcement on CesLayout (remove internal max-w/padding), primitive adoption metrics in verify:ui, mobile bottom-sheet-first for field clinicians (kill desktop 420px fixed in drawers), cross-surface divergence matrix (Dashboard vs CES vs Evidence), pre-rollout drift vectors (new one-off components in V3Stacked), security/permission leakage in veil drawers, data integrity under concurrent evidence in animated drawers, surveyor read-only density preservation, etc.

**Full raw per-agent action lists** (4-8 each) live in the 32 subagent result transcripts (use `get_command_or_subagent_output` with their IDs for complete un-synthesized versions).

---

## Immediate Next Steps (This Week)

1. Stand up owners for all new DRIFT items + the 10 Tier 0/1 actions above (update DRIFT_REGISTER.md).
2. Land the 3 P0 fixes (CES board identity unification, eCign snapshot isolation guard, May20 drawer migration kickoff on 1 surface e.g. MasterCalendar).
3. Add the lint + PR template + 5174 Playwright v3 regression gates (Agent 21 playbook).
4. Re-run full 32-agent (or 8-agent focused) campaign after the P0s land; attach 5174 screenshots + fidelity hashes to Executive Summary.
5. Update PHASE1_EXIT_CHECKLIST + Executive Summary with real % (currently overstated) + this ACTION_ITEMS doc as appendix.

**This document + the 32 subagent reports + updated DRIFT_REGISTER constitute the complete output of the "deploy 32 agents + QA v3 in local live" mandate.**

*All agents operated exclusively on production code paths powering http://localhost:5174/. ui-staging/* used only as visual reference per explicit instructions. The glass is waiting — but the CES right-panel + fidelity + token debt must be closed first.*

---

**Generated from 32-agent campaign** (subagent_ids: 019e69ae-c9de-7573-a12e-cd1c1c6af221 ... 019e69b0-11eb-7712-809c-9971401fb4e0). Synthesized 2026-05-27 by orchestrator after parallel execution against live dev server.