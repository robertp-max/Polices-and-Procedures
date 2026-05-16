# UI/UX Redesign Roadmap
**Date**: 2026-05-15  
**Based on**: Full 12-report audit + 8+ Heavy subagent findings (especially Drift agent 019e2d5f-6dae-7c43-bf0c-d9b55faee516 ruthless mapping) + prior LAYOUT_NORMALIZATION, GVGB001_CANONICAL_UX_REFINEMENT, POLICY_VIEWER_CONSOLIDATION_DELETE, QA_UAT accessibility audits, eCign gap analysis.

---

## Guiding Principles

- **Freeze first, consolidate second, redesign third**.
- Protect legal/compliance surfaces (eCign signed packets, evidence, CES execution, V2 onboarding gates/audit trail) — they are the strongest and highest-risk.
- "One source of truth" per surface: PolicyDetailPage + Shared (general) + GVGBDetailView (GV-GB-001 specimen only); CommandCenterLayout + ui/* primitives (shell); FormViewer + FormSigningWorkspace (eCign packets); OnboardingV2 (activation engine); MasterCalendar (time).
- No new components, no new design families. Migrate or delete.
- Mobile-first for field users (clinicians, surveyors, DONs on phones/tablets).
- Enforce tokens + primitives via lint + PR gates after Phase 0.
- Measure with browser validation checklist + visual regression for print/packets.

---

## Phase 0: Freeze & Protect Canonical Owners (Immediate — 1-2 weeks)

**Actions**:
1. Create `DESIGN_OWNERS.md` (or section in README) listing:
   - Shell/Navigation: CommandCenterLayout.tsx + ui/* (GlassPanel, SurfaceCard, Tabs, ActionButton, CiStatusBadge, DataGrid, EmptyState, PageHeader, etc.) + uiStore/navStore/ciModeStore.
   - Policy Detail: PolicyDetailPage.tsx (thin delegator) + SharedPolicyDetailView.tsx (general/ACHC/surveyor/lifecycle) + GVGBDetailView.tsx (GV-GB-001 specimen only — preserve its compact sticky header, keyboard nav, gvgb-enter animations).
   - Forms + eCign Packet: FormViewer.tsx (FormBody + getPrintableFormHtml) + FormSigningWorkspace.tsx (buildPrintablePacketHtml + signed_locked Options + buildCertHtml + roster + audit trail) + FormPrintView.tsx.
   - Evidence/Artifact: ArtifactViewerPage.tsx + CesEvidenceHierarchyPanel.tsx + regulatoryExecutionStore.
   - Onboarding/Activation: OnboardingV2Layout + engine (ingestTrigger, gates, reconciler, hash-chain) + KpiTile/StatusPill/GateTile/UnitDrawer/AuditTimeline.
   - Calendar: MasterCalendarPage.tsx (unified events/tasks/sprints/evidence) + MobileIncidentExecutionPage.
   - Help/Guided/Brad: HelpCenterPage + ContextualKnowledgeBulb + GuidedTourGate + BradProposal.
2. Add code comments in all canonical files: "CANONICAL OWNER — see DESIGN_OWNERS.md. Do not create parallel Tabs/Card/Button/Print systems."
3. PR template: "New UI primitive or layout? Must be reviewed against DESIGN_OWNERS.md and use ui/ tokens."
4. Freeze GVGBDetailView local UI (Card/SectionTitle/SimpleTable/TabButton) — treat as honored specimen, not pattern to copy.
5. Archive (do not delete yet): DashboardPage.tsx.backup, MasterCalendarPage.tsx.backup, TaxonomyPage.old.tsx (and any other .backup/.old).
6. Document "two renderers" semantics for FormViewer (embedded .form-frame vs standalone .form-page) and packet snapshot clone risks.

**Deliverable**: DESIGN_OWNERS.md + frozen code comments + PR gate.

**Risk if skipped**: Scope explosion in later phases; continued drift.

---

## Phase 1: Design Tokens & Primitives Consolidation (4-6 weeks)

**Actions**:
1. Enforce `--ci-*` tokens + ui/ primitives everywhere in new/modified code (ESLint rule: no hex/rgb/arbitrary values in className or style except print overrides; no new local Tab/Card/SectionTitle).
2. Migrate (in priority order):
   - Policy core: GVGBDetailView (replace local Card/SectionTitle/SimpleTable/TabButton with SurfaceCard + ui/Tabs + CiStatusBadge + EmptyState + DataGrid; keep content/animations/sticky behavior).
   - SharedPolicyDetailView (replace SCard/GenericSectionPanel/Tab* with primitives where possible; keep carousel for specialized ACHC only).
   - LibraryPage (replace glass-panel-lib / glass-interactive-lib with GlassPanel + SurfaceCard).
   - DemoPage (replace duplicate Tab* + demo-glass-card or deprecate as demo-only).
   - DashboardPage, iAdministrator, staffing details, PM views (adopt primitives).
   - CES (map CES_TOKENS navy/orange to ci- tokens or document as "CES-only" with explicit mapping; replace CesCard/primitives with ui/ versions; unify badges).
   - FormViewer/FormSigning internals (where not eCign-specific).
3. Typography/Spacing: Define token scale in index.css (e.g., --text-policy-title: 22px/600/0.22em montserrat; --text-body: 14px/400/0.01em roboto; --space-*) and replace all ad-hoc text-[22px] + tracking-[0.22em] + p-5/gap-3/mb-6 + inline padding.
4. Status/Empty/Loading: Deprecate legacy StatusBadge (hardcoded dark hex); migrate all to CiStatusBadge + DataGrid. Standardize single Loader primitive (AppLoader pattern + role/status + aria-live). Replace all 13+ animate-spin variants.
5. Buttons: Enforce ActionButton/UtilityButton; update CES WorkflowDrawer and iAdmin AvailableActions to use canonical (or alias).

**Deliverable**: All core surfaces (policy detail, library, dashboard, CES, forms, staffing, iAdmin) using ui/ primitives + ci- tokens. Linting passing. No new drift.

**Risk if skipped**: Token system remains "on paper only"; redesign fights 5+ parallel systems.

---

## Phase 2: Shell / Navigation / Visual Consistency (3-4 weeks)

**Actions**:
1. Bring remaining surfaces under CommandCenterLayout + ui/ primitives (CES pages, Journey V1, Onboarding V2 where appropriate, WorkflowLibrary, ArtifactViewer, iAdministrator, admin identity, Framework/AchcSurvey).
2. Remove custom glass (glass-panel-lib, demo-glass-card, custom .glass-* in Library/Demo/iAdmin/CES drawers); converge on GlassPanel (dark) / SurfaceCard (light).
3. Unify accent semantics: Decide primary accent (gold #FFC107 for CI-ION dark vs teal #007970 for Care Indeed light) and document; reduce #C74601 orange CTA variance.
4. Remove legacy maroon conditional paths and comments that are no longer exercised.
5. Visual consistency pass: Enforce consistent typography scale, spacing (use --space-* or ui/ PAD), radius, hover states (respect flat shadow rule or re-enable selectively with token), focus rings.
6. Update CommandCenterLayout + ui/ primitives with any gaps discovered in Phase 1 (e.g., better mobile nav drawer, consistent PageHeader for all surfaces).

**Deliverable**: Single visual language for 80%+ of surfaces. "One-glass" philosophy respected (flat on glass, no unnecessary nesting in shell paths).

---

## Phase 3: Policy / Form / eCign / Evidence Unification (4-6 weeks, high compliance value)

**Actions**:
1. Policy detail unification complete (from Phase 1).
2. Print/Packet consolidation (highest legal risk):
   - Create shared print utils (PrintableSection, PrintableTable, PrintableHeader variants for policy meta vs form vs eCign legal).
   - Fix embedded vs standalone header divergence in FormViewer clone path (getPrintableFormHtml).
   - Make GVGBPrintDocument / PrintPage / FormPrintView / GVGBAppendixPrint share core chrome.
   - eCign packet (buildPrintablePacketHtml): Remove conflicting ci-brand-header (or make optional); let FormBody's own header (teal rule, clean title, logo) provide the form identity; keep eCign footer + cert/audit/roster as legal overlays. Ensure snapshot fidelity for dynamic sections (OrgChart, autoFills).
   - Add visual regression tests (Playwright or manual baseline in ForGrok/Screenshots) for: GV-GB-001 print vs QA-PG-001 print vs form print vs signed WAPI packet (multi-signer).
3. Evidence/ArtifactViewer: Unify chrome with shell primitives; improve mobile hierarchy navigation.
4. FormSigningWorkspace signed_locked Options: Ensure Download/Print cards use unified packet renderer; fix any white-screen or incorrect visual (header/logo/title) for WAPI forms.

**Deliverable**: Consistent visual + fidelity for all policy prints, form prints, and signed eCign packets. "Two renderers" problem documented and mitigated. Legal defensibility of signed evidence strengthened.

---

## Phase 4: Mobile-First Pass (Critical for Field Users — 4-6 weeks)

**Actions**:
1. Responsive overhaul (priority surfaces for clinicians/surveyors/DONs):
   - Onboarding V2: UnitDrawer → bottom sheet on <1024px; BatchView 9/3 grid → single column + progressive disclosure; tables → card stacks or horizontal scroll with snap.
   - Journey V1 + StagingM01: Complex absolute vw carousel → touch-swipe + simplified layout; fixed HUD/dock → responsive; video/img full-bleed tested on phone.
   - CES boards/kanban + workloads + my-tasks + PM overlays: Horizontal scroll or card stack; touch-friendly drag (or tap-to-open detail); dense tables → responsive.
   - Form tables, evidence hierarchy, calendar dense views, signing flow: 44px touch targets; keyboard + touch parity; no horizontal overflow (index.css guard already helps).
   - FormViewer / FormSigningWorkspace: Mobile signing experience (inputs, signature pad, multi-signer flow).
2. Enforce globally: `.ci-touch-target` (min 44px), iOS font-size guard (already in index.css), no fixed-width containers without media queries, safe-area insets for notched devices.
3. Real-device testing: iPhone SE / Android small phone + tablet on key flows (/forms/:id signing, /ces/board, /onboarding-v2/batch/:id, /journey/module, /evidence, /library/:id, calendar event drill-down).
4. Mobile nav: Improve hamburger + primary tabs ("more" menu) for Journey/Onboarding V2/CES surfaces.

**Deliverable**: All priority field flows usable on phone/tablet without horizontal scroll or cramped targets. Mobile score from ~5/10 to 8+/10 on audited surfaces.

**Risk if skipped**: Core users (clinicians doing modules/evidence, surveyors reviewing policies, DONs signing on site) abandon or complain.

---

## Phase 5: Accessibility Pass (WCAG 2.2 AA Target — 3-5 weeks, compliance critical)

**Actions** (build on prior QA_UAT Accessibility_Compliance_Deep_Audit + Full_App_Accessibility_Compliance_Audit):
1. Focus areas from prior audits + this report:
   - FormViewer + FormSigningWorkspace (uncontrolled inputs, labeling in dynamic/conditional sections, multi-signer flow, dialog roles, keyboard support for signing).
   - CES boards/tables/kanban (tab order, ARIA for status/urgency, keyboard navigation).
   - Evidence hierarchy + ArtifactViewer (tree navigation, status).
   - All icon-only buttons (aria-label or visible label).
   - Form labels, error messaging (role=alert, aria-live), validation.
   - Dense PM overlays, iAdministrator, admin identity, Framework/AchcSurvey tables.
2. Global: Enforce focus-visible (gold/orange rings already good), reduced-motion (already in index.css), color contrast audit in light + dark + mixed themes (hardcoded GVGB vs shell), tab order in modals/drawers (RightDrawer, FormSigningWorkspace as dialog), focus trap.
3. Screen reader: Add live regions for status changes (signing, task updates, gate evaluation), proper headings in long policy/form content.
4. Testing: axe DevTools + WAVE + manual keyboard + VoiceOver (macOS) / TalkBack (Android) on priority flows; document known issues + remediation.
5. Motion sensitivity: Respect prefers-reduced-motion for all animations (StagingM01 carousel, transitions).

**Deliverable**: WCAG 2.2 AA pass on all audited surfaces (documented). Prior FormViewer/FormSigningWorkspace gaps closed.

**Risk if skipped**: Accessibility complaints, survey failures, legal exposure in regulated healthcare app.

---

## Phase 6: Training / Brad Guided UX Layer (3-4 weeks)

**Actions**:
1. Unify or clearly separate Journey V1 (cinematic engagement for existing modules) and Onboarding V2 (audit-grade activation for new/annual/role-change) in UI and documentation. Make V2 the default path; surface migration for existing users.
2. Apply shell glass + primitives to Journey V1 where appropriate (or document as "cinematic exception").
3. Enhance in-module guidance: Embed ContextualKnowledgeBulb or lightweight tooltips in ModulePlayer, UnitDrawer, reconciliation preview, quiz flows.
4. Brad / GuidedTourGate: Extend to deeper training surfaces (module player, V2 activation/batch flows) with mission-specific tours.
5. Mobile training experience: Responsive player + bottom-sheet evidence/signing for field clinicians.
6. Empty states + help: Richer illustrated empties for "no modules" / "no batches"; stronger integration of onboarding-v2 help articles.

**Deliverable**: Clear user mental model for "which onboarding?", improved engagement + compliance in training flows, better mobile for clinicians.

---

## Phase 7: Cleanup / Deletion of Drift (Ongoing + 2-3 weeks final sweep)

**Actions**:
1. After validation of Phases 0-6: Delete archived orphans (backups, .old, DemoPage duplicate Tab* if deprecated).
2. Merge or delete remaining duplicate systems (last local Tab/Card/SectionTitle in policy core, legacy StatusBadge, custom glass, CES primitives if converged).
3. Remove legacy glass utilities references, old maroon conditional paths, unused glass-over-glass.
4. Final lint + visual regression pass.
5. Update all prior _Heavy/Fix-2026-05-14 reports with "Resolved in 2026 redesign" notes.
6. Archive this UIUX_Audit folder as baseline for future audits.

**Deliverable**: Clean codebase with single (or clearly documented) design family per surface. Technical debt reduced. Future velocity improved.

---

## Verification Gates (After Each Phase)

- `npx tsc -b --noEmit`, `npm run build`, `npx tsx scripts/verify-feature-access.mjs`, `npx tsx scripts/verifyUiDesignSystem.ts` (expand to fail on drift).
- Browser parity checklist (UIUX_BROWSER_VALIDATION_CHECKLIST.md): 20+ routes, desktop + mobile (iPhone SE + tablet), keyboard, print/export, accessibility (axe + SR), signed packet visual fidelity.
- Screenshot baseline update in _Heavy/Fix-2026-05-14/ForGrok/Screenshots/ (new dated set) for key flows: library/GV-GB-001 vs QA-PG-001, forms/:id (signing + Options + Print), ces/board, onboarding-v2/batch, journey/module + staging/m01, evidence, calendar event drill-down, signed packet PDF preview.
- User testing: Clinicians (training/evidence/signing on phone), surveyors (policy review + ACHC alignment), compliance officers (CES + V2 onboarding), DONs (multi-signer eCign).

---

## Success Metrics

- Design system adoption: >90% of new/modified surfaces use ui/ primitives + ci- tokens (measured by lint + manual audit).
- Visual consistency score: 9+/10 (from current ~7).
- Mobile readiness: 8+/10 on priority field flows (from ~5).
- Accessibility: WCAG 2.2 AA pass on audited surfaces (documented).
- Print/Packet fidelity: Single visual language + regression tests passing for policy vs form vs signed eCign.
- Drift: No new parallel Tabs/Card/Button/Print/Theme systems; existing duplicates reduced by 70%+.
- User feedback: Reduced complaints about "different looking" policy detail, signing packets, onboarding choice, mobile experience.
- Velocity: New features (staffing, PM, journey modules) ship with consistent polish without debate on "which card system?"

---

## Immediate Next Step (Today)

1. Create DESIGN_OWNERS.md + add freeze comments (Phase 0).
2. Run full UIUX_BROWSER_VALIDATION_CHECKLIST.md (capture new screenshots).
3. Tag all canonical files with "CANONICAL OWNER" comments.
4. Schedule Phase 1 kickoff with design + engineering owners for policy detail + primitives enforcement.

This roadmap turns the excellent architectural intent (tokens, one-glass, eCign legal packets, V2 activation engine) into a consistent, maintainable, mobile-first, accessible product that supports the compliance mission without visual friction.

**End of Roadmap**. All phases build on the freeze of canonical owners identified in CANONICAL_COMPONENTS_MAP.md and the ruthless drift mapping in DRIFT_AND_REDUNDANCY_REPORT.md. Prior 2026-05-14 consolidation efforts provide the foundation; this audit completes the picture for the next redesign cycle.