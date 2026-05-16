# UI/UX Canonical Components Map
**Date**: 2026-05-15

## Emerging Canonical Owners (Recommended Freeze in Phase 0)

**App Shell / Navigation**:
- `src/policy/components/CommandCenterLayout.tsx` — Master shell (TravelightBG + single glass card, NAV_ITEMS, feature gating, mobile primary tabs, GlobalTaskDrawer, GuidedTourGate, Brad integration).
- `src/policy/stores/uiStore.ts`, `navStore.ts`, `ciModeStore.ts` — Theme / nav / ci-mode state.
- `src/policy/components/ui/` — Primitives (GlassPanel, SurfaceCard, Tabs, ActionButton, UtilityButton, DataGrid, PageHeader, SectionHeader, SearchField, EmptyState, CiStatusBadge, ThemeModeToggle, RightDrawer, UtilityButton).

**Policy Detail**:
- `src/policy/pages/PolicyDetailPage.tsx` + `src/policy/components/SharedPolicyDetailView.tsx` — Canonical for most policies (normalized to QA-PG-001: SurfaceCard + teal rules + metadata grid + tabs).
- `src/policy/pages/GVGBDetailView.tsx` — Special preserved specimen (GV-GB-001 only; compact sticky header, custom keyboard nav, gvgb-enter animations). Do not normalize.

**Forms + eCign Packet**:
- `src/policy/components/FormViewer.tsx` (FormBody, getPrintableFormHtml, signature ctx) + `src/policy/components/FormSigningWorkspace.tsx` (eCIgnWorkspace, buildPrintablePacketHtml, signed_locked Options, buildCertHtml + roster + audit trail) — Canonical for form rendering and signed packet generation (form HTML clone + cert + audit + roster + eCign footer).
- `src/policy/pages/FormPrintView.tsx` — Standalone form print.

**Evidence / Artifact**:
- `src/policy/pages/ArtifactViewerPage.tsx` + `src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx` + regulatoryExecutionStore — Canonical viewer for signed packages and evidence.

**CES / Task Execution**:
- `src/policy/ces/` (CesLayout, pages/*, board/*, primitives.tsx, theme.ts, CesRoleReviewSwitcher) — Current parallel system. **Candidate for unification** under main ui/ primitives + tokens (high drift).

**Onboarding / Training**:
- `src/policy/onboarding-v2/` (OnboardingV2Layout + pages + engine/gates/reconciler + KpiTile, StatusPill, GateTile, UnitDrawer, AuditTimeline) — Canonical for audit-grade activation (strongest modern UX).
- Journey V1 (`src/policy/journey/`) — Preserved for cinematic modules (StagingM01 as engagement prototype).

**Print / Export**:
- GVGBPrintDocument.tsx + GVGBAppendixPrint.tsx (policies).
- FormPrintView + FormSigningWorkspace packet builder (forms/eCign).
- Recommendation: Unify packet HTML builder around FormBody + eCign appends.

**Calendar**:
- `src/policy/pages/MasterCalendarPage.tsx` + ces/calendar + pm/ — Unified canonical.

**Dashboard / Reporting**:
- DashboardPage.tsx (widgets).
- CesReportsPage, AuditModePage, PM reports — Current state; unify reporting primitives.

**Help / Brad / Guided**:
- HelpCenterPage + ContextualKnowledgeBulb + GuidedTourGate + BradProposal — Good cross-cutting.

## Duplicates / Drift Candidates (High Priority for Phase 7 Cleanup)

- **Policy Detail Renderers** (3+): PolicyDetailPage/Shared (canonical), GVGBDetailView (special), PolicyLibraryDocumentView, SurveyorPolicyViewerPage, PolicyLifecyclePage, AchcSurveyAlignmentPage.
- **Card/Surface Systems**: GlassPanel/SurfaceCard (ui/), raw bg-white rounded-xl border-[#E5E4E3] (GVGB, many), CesCard (ces/), custom in staffing/iAdmin/pm.
- **Tabs Systems**: ui/Tabs (inline var style), GVGB custom buttons + keyframes, Journey/V2 accordions, CES board tabs, raw in FormViewer.
- **Button/Badge Systems**: ActionButton + .ci-btn* + UtilityButton, legacy StatusBadge (hardcoded dark hex), CiStatusBadge, CES badges, regulatory DomainBadge/UrgencyChip, domain palettes in FrameworkShowcase.
- **Print Systems** (4+): GVGBPrintDocument (full policy), GVGBAppendixPrint, PrintPage, FormPrintView (FormBody), buildPrintablePacketHtml (eCign form + cert + audit + roster) — visual output (logo, header "Enterprise Forms Library · Signed Document Package", title treatment) differs.
- **Theme Systems** (5+): Main ci- tokens + remap, CES_TOKENS (navy/orange), eCIgn navy/orange, Journey cinematic dark, Onboarding V2 light professional, domain palettes.
- **Empty/Loading**: EmptyState primitive vs many inline messages vs GateBanners.
- **Orphaned/Legacy**: TaxonomyPage.old.tsx, DashboardPage.tsx.backup, unused regulatory/ or pm/ legacy viewers, old glass utilities (disabled but referenced), .vibrant-bg noop.
- **Layout Primitives**: Multiple "SectionHeader", "PageHeader" local implementations vs ui/ versions.

**Recommendation**: Document owners in code, prohibit new duplicates, migrate or delete in phases.

See DRIFT_AND_REDUNDANCY_REPORT.md for full file-by-file mapping.