# UI/UX Mobile / Responsive Audit
**Date**: 2026-05-15

**Overall Mobile Readiness Score**: ~5/10 (desktop-biased app; field users — clinicians, surveyors, DONs on phones/tablets — penalized on key flows).

**Key Risks**: Horizontal scroll/overflow, cramped touch targets (<44px in places), complex absolute positioning (StagingM01 carousel), wide drawers/tables (Onboarding V2 UnitDrawer/BatchView 9/3 grid), dense CES boards/kanban, form tables, evidence hierarchy, calendar cells. iOS font-size guard and max-width:100vw in index.css help but insufficient.

---

## Surface-by-Surface Mobile Audit

**CommandCenterLayout + Nav**:
- Mobile primary tabs (MOBILE_PRIMARY_TABS at 143-149) + "more" menu good.
- Hamburger + drawer functional but some sub-nav deep.
- **Issues**: Feature flags sometimes hide mobile-relevant items; text truncation in nav labels on small screens.
- **Score**: 7/10.

**Policy Library + Detail (LibraryPage, PolicyDetailPage, Shared, GVGBDetailView)**:
- Grid collapses; cards readable.
- Long policy content + tables need horizontal scroll or poor reflow.
- GVGB sticky header helps on scroll but sub-tabs cramped.
- **Issues**: Wide metadata grids, appendix tables, procedure sections.
- **Score**: 6/10.

**Forms + eCign (FormsPage, FormViewer, FormSigningWorkspace)**:
- Form paper readable but inputs cramped on phone.
- Signing flow (signature pad, multi-signer, Options cards) cramped; Download/Print cards stack but touch targets marginal in modal.
- Packet preview (iframe or openPacketWindow) zoom/scroll issues on mobile.
- **Critical**: Clinicians signing on site on phones get suboptimal experience.
- **Score**: 5/10 (high risk).

**CES / Task Execution (CesBoard, CesDashboard, MyTasks, PM overlays, WorkflowExecutionPanel)**:
- Board/kanban: Horizontal scroll or cramped cards; drag poor on touch.
- Task detail drawers wide; workloads/reports tables dense.
- PM overlays (SprintPlan, Approvals) heavy on small screens.
- **Score**: 4/10 (major field execution surface).

**Onboarding V2 (OnboardingV2Layout + Dashboard, Activation, BatchList, BatchView, UnitDrawer, AuditReadiness)**:
- 260px rail + white main → on <1024px rail collapses but main content (9/3 grid in BatchView, 760px UnitDrawer) requires horizontal scroll or poor stacking.
- Tables (batches) and reconciliation bars cramped.
- GateTile / KpiTile stack ok but detail poor.
- **Score**: 4/10 (critical for new hires/annual/role-change on mobile devices).

**Journey V1 + StagingM01 (JourneyHome, OnboardingV1JourneyPage, ModulePlayer, StagingM01Page)**:
- JourneyHome grid + PhaseRail ok on tablet, tight on phone.
- ModulePlayer + Scorm/EvidenceCapture: Player chrome cramped; evidence rating + dual SignaturePad difficult on small screen.
- **StagingM01**: Complex absolute `vw` offsets (`-72vw`, `84vw`), fixed heights (`76vh`/`93vh`), 5-slot carousel with transforms + video + 47 images + fixed HUD/nav dock — **breaks or requires heavy zoom/scroll on phones**. Touch swipe not implemented (keyboard hints md+ only).
- **Score**: 3/10 (cinematic prototype not mobile-friendly; clinicians doing cultural awareness training on phone penalized).

**Evidence / Artifact (EvidenceCenterPage, CesEvidenceHierarchyPanel, ArtifactViewerPage)**:
- Hierarchy tree: Deep nesting cramped on phone; tap targets small.
- Artifact iframe preview: Zoom/scroll issues; fidelity depends on packet.
- **Score**: 4/10.

**Calendar + MobileIncident (MasterCalendarPage, MobileIncidentExecutionPage)**:
- Calendar cells dense; event popovers cramped on phone.
- Drill-down (event → workflow → task → evidence → approval) stack ok but forms inside cramped.
- **Score**: 6/10 (best of the execution surfaces).

**Staffing (Clinician/Patient lists + details, StaffingCalendar)**:
- Lists use DataGrid (better); details use SurfaceCard — readable on phone.
- **Score**: 7/10 (better adoption of primitives helps).

**Admin / Identity / iAdministrator / Help / Framework / Audit / Governance**:
- Tables + forms cramped on phone; admin identity lighter polish.
- iAdministrator RightPanelPreview + custom tabs (StudioTabs) not mobile-optimized.
- Framework/AchcSurvey alignment tables wide.
- **Score**: 5-6/10.

**Print / Packet Views**:
- Standalone prints (GVGBPrintDocument, FormPrintView) better (dedicated CSS) but still need pinch-zoom on phone for complex policy tables.
- eCign packet preview in ArtifactViewer or openPacketWindow: iframe + fixed headers cause overflow/zoom problems on mobile.
- **Score**: 5/10.

**Auth flows**: Clean, mobile-friendly (8/10).

---

## Cross-Cutting Mobile Issues

- **Touch targets**: Many <44px (icon-only, small buttons in tables, signature pad controls, carousel nav).
- **Horizontal/vertical scroll**: Rogue fixed-width (legacy w-[1120px] grids in some policy content), wide tables, drawers, carousels.
- **Fixed/sticky**: Sticky headers (GVGB) helpful; fixed HUD in StagingM01 problematic on phone; nav drawer ok.
- **Viewport overflow**: index.css max-width:100vw + overflow-x:hidden guard helps but not 100% effective against absolute positioned carousels or wide iframes.
- **Orientation**: Landscape better for tables/calendar; portrait cramped for signing + batch views.
- **Performance**: Heavy carousels (StagingM01 47 images + video + transforms) + complex React in V2 BatchView + CES board cause jank on lower-end phones.
- **No dedicated mobile patterns**: Bottom sheets, progressive disclosure, card stacks, touch-optimized signature/evidence capture, responsive accordion for hierarchies not systematically used.

---

## Recommendations (see full Redesign Roadmap Phase 4)

- Bottom sheet for UnitDrawer / task detail / RightDrawer on <1024px.
- Single-column + progressive disclosure for BatchView 9/3, wide tables, evidence hierarchy.
- Touch-swipe + simplified layout for StagingM01 carousel (or dedicated mobile player).
- CES board: Card stack or improved horizontal snap + tap-to-open detail (no drag on touch or hybrid).
- Form tables + signing: 44px targets, larger signature pad, bottom action bar.
- Global: Enforce .ci-touch-target, test on real iPhone SE + Android small + tablet, safe-area insets, no absolute vw without media query fallbacks.
- Training mobile: Responsive module player + evidence capture optimized for field clinicians on phones.

**Priority**: Critical for field users. Mobile score must reach 8+/10 on priority flows (signing, CES execution, V2 activation, journey modules, evidence, calendar drill-down) before next major release.

**Testing**: Real devices + BrowserStack + Playwright mobile emulation on the routes in UIUX_BROWSER_VALIDATION_CHECKLIST.md.