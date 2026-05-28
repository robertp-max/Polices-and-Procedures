# Legacy Component Deprecation Matrix

**Purpose:** Map every non-canonical component family discovered in the May 2026 UIUX_Audit to its canonical replacement + deprecation timeline.

**Rule:** No new usage of legacy families is allowed on target surfaces after their deprecation date.

---

## Card / Surface Families

| Legacy Family | Location Examples | Canonical Replacement | Deprecation Target | Status | Notes |
|---------------|-------------------|-----------------------|--------------------|--------|-------|
| GVGB Card (local `bg-white shadow-sm rounded-xl`) | GVGBDetailView | `SurfaceCard` + `GlassPanel` | Phase 2 | Open | Highest priority |
| Shared SCard / GenericSectionPanel | SharedPolicyDetailView | `SurfaceCard` | Phase 2 | Open | - |
| CES CesCard + local theme | ces/components | `SurfaceCard` + canonical tokens | Phase 2–3 | Open | Tied to CES policy decision |
| eCign custom panels | FormSigningWorkspace | `SurfaceCard` | Phase 2 | Open | - |
| Journey cinematic glass cards | Journey V1 pages | `GlassPanel` (if kept) or Onboarding V2 patterns | Phase 1 decision | Open | Depends on D-002 |
| Staffing local cards | staffing/components | `SurfaceCard` | Phase 2 | Open | - |

---

## Tabs Families

| Legacy Family | Location Examples | Canonical Replacement | Deprecation Target | Status |
|---------------|-------------------|-----------------------|--------------------|--------|
| GVGB TabButton | GVGBDetailView | `ui/Tabs` | Phase 2 | Open |
| SharedPolicyDetailView tabs + carousel | SharedPolicyDetailView | `ui/Tabs` | Phase 2 | Open |
| DemoPage duplicate tabs | DemoPage | `ui/Tabs` | Phase 1 cleanup | Open |
| CES board tabs | ces/ | `ui/Tabs` | Phase 2–3 | Open |
| WorkflowExecutionPanel tabs | regulatory/ | `ui/Tabs` | Phase 2 | Open |

---

## Other Major Redundancies

| Legacy Pattern | Canonical | Deprecation | Notes |
|----------------|-----------|-------------|-------|
| Legacy StatusBadge (dark hex) | `CiStatusBadge` | Phase 1 | Quick win |
| Multiple Loading spinners | `LoadingState` primitive | Phase 2 | - |
| Custom Empty states | `EmptyState` | Phase 2 | - |
| Domain-specific palettes (FrameworkShowcase, iAdmin) | Semantic tokens in `tokens.json` | Phase 2–3 | - |

---

**This matrix must be kept in sync with the Drift Register and updated after every surface reconstruction.**

---

## Agent 09 — Primitive Adoption Snapshot (2026-05-27 Live QA)

**Measurement Method:** Static grep counts across `src/` (excl. node_modules, dist, _Heavy, ui-staging where noted). `npm run verify:ui` executed (0 FAIL, 1084 WARN dominated by legacy.theme-reference in index.css + v3.depth-motion). Direct file reads of all mandated components + call sites.

### Adoption Metrics (ui/* primitives vs legacy)
- **Canonical ui/* card/surface/drawer primitives** (SurfaceCard, GlassPanel, RightDrawer, VeilDrawer, V3StackedDrawerHost, BottomSheetDrawer, VeilModal, TaskRowMinimal, VeilSection, + related from index.ts): **29 references** across 17 files. Heavy adoption in staffing/* (ClinicianDetailPage, PatientDetailPage, cards) and some dashboard/calendar. `src/policy/components/ui/index.ts` exports 30+ (Veil* new in V3.2).
- **CES CesCard + local primitives family** (ces/components/primitives.tsx: CesCard, ComplianceStateBadge, PhaseIndicator, UserAvatar, DomainRiskDot, EscalationTimer, KV, V3Section etc.): **16 direct <CesCard> + 6 import sites**. Used in: ComplianceCalendar (2), ExecutiveReports (12), WorkloadDistribution (2), ExecutionUnitCard, WorkflowDrawer, MyTasksPage.
- **ci-* class families** (ci-glass-*, ci-premium-*, ci-surface, ci-border, ci-text-*, ci-bg-ces-* etc.): **656 references** across 55 files. Dominant legacy signal. Present in nearly every CES/regulatory/pm surface + some ui/ itself (ActionButton, CiStatusBadge, Shell*).
- **v3-* class tokens** (v3-veil-*, v3-surface, v3-glass-panel, v3-drawer-*, v3-task-row etc.): **177 references** across 28 files. Concentrated in ui/ primitives, CesEvidenceHierarchyPanel, WorkflowDrawer (mimic), SprintTaskPanel, MasterCalendar, EvidenceCenter.
- **Custom inline `style={{...}}` + hand-rolled cards/panels** (esp. ces/pages/* + regulatory/*): 45+ patterns in ces/ (WorkflowDrawer 6, SprintTaskPanel 6, MyTasksPage 6+, ExecutionUnitCard, RobertCesReviewLayer, etc.); 77+ in regulatory/ (WorkflowExecutionPanel 25, EvidencePanel 6, BlockerPanel 10, etc.).
- **EvidencePanel redundancy**: 4+ distinct impls:
  - `src/policy/components/regulatory/EvidencePanel.tsx` (uses ci-border, inline icon styles, custom EvidenceRow; imports only EmptyState)
  - `src/policy/onboarding-v2/components/EvidencePanel.tsx` (separate grid + StatusPill)
  - `src/ui-staging/V3_2StagingApp.tsx` (CesEvidencePanel local)
  - `src/policy/pages/MobileIncidentExecutionPage.tsx` (MobileEvidencePanel)
  - Referenced in WorkflowExecutionPanel, EventWorkspace, UnitDrawer, help articles.
- **Drawer/Panel families** (V3 canonical vs local copies):
  - Canonical V3: RightDrawer/VeilDrawer/V3StackedDrawerHost/BottomSheetDrawer: ~11 call sites (MasterCalendar VeilDrawer x1, GlobalTaskDrawer V3Stacked x1, MyTasksPmPage Veil x1, iAdmin RightPanelPreview, ShellMobile, internal).
  - Local copies: CES `WorkflowDrawer.tsx` (hand-rolled fixed + v3-veil-glass-panel mimic + CES primitives), regulatory `WorkflowDrawer.tsx` + `ModalShell.tsx:DrawerShell`, `TaskDetailRightPanel.tsx` (as inline panel + in drawers), SprintTaskPanel (custom sections).
- **verify:ui result**: 0 FAILS. 1084 WARNs (legacy.theme-reference ~200+ in index.css; v3.depth-motion ~100+; many ci- surface patterns tolerated as warn). No legacy ci-ion drawer variants in prod code.

### Updated Card / Surface Families (with live counts)
| Legacy Family | Location Examples | Canonical Replacement | Deprecation Target | Status | Live Count (2026-05-27) | Notes / Hotspots |
|---------------|-------------------|-----------------------|--------------------|--------|-------------------------|------------------|
| GVGB Card (local `bg-white shadow-sm rounded-xl`) | GVGBDetailView | `SurfaceCard` + `GlassPanel` | Phase 2 | Open | ~8 refs in GVGB* + SharedPolicyDetailView | Low priority now |
| CES CesCard + local theme/primitives | ces/components/*, ces/pages/*, ces/components/board/*, ces/components/details/* | `SurfaceCard` + canonical tokens + CES_TOKENS overrides in theme | Phase 3 (CES policy) | **In Progress** | 16 CesCard + 6 primitive imports + 45+ custom style cards | **CRITICAL** — CesBoard, MyTasks, WorkflowDrawer, Reports, Calendar |
| EvidencePanel family (regulatory + onboarding variants) | regulatory/EvidencePanel, onboarding-v2/EvidencePanel, MobileIncident, EventWorkspace, WorkflowExecutionPanel | New `EvidencePanel` inside V3 primitives (or extend EmptyState + DataGrid) | Phase 3 | Open | 4+ impls, 10+ call sites | **HOTSPOT** — used inside V3 drawers |
| eCign / Form custom panels | FormSigningWorkspace, FormViewer | `SurfaceCard` / `GlassPanel` | Phase 2 | Open | Multiple | |
| Custom drawer/panel impls (WorkflowDrawer x2, TaskDetailRightPanel, SprintTaskPanel, DrawerShell) | ces/details/WorkflowDrawer, regulatory/WorkflowDrawer + ModalShell, pm/TaskDetailRightPanel, ces/details/SprintTaskPanel | `RightDrawer` / `VeilDrawer` / `V3StackedDrawerHost` + `SurfaceCard` content | Phase 3 | Open | 5+ local drawer families; 3 V3 hosts wrapping legacy | **PRIMARY HOTSPOT** |
| Staffing local cards (pre-adoption) | staffing/* | `SurfaceCard` (now adopted) | Phase 2 | **Closed** | 0 remaining local; full ui/ SurfaceCard | Model for other domains |

### Updated Drawer / Panel Redundancies
| Legacy Pattern | Canonical | Deprecation | Live Count | Notes |
|----------------|-----------|-------------|------------|-------|
| CES WorkflowDrawer (hand-rolled + CES primitives) | `VeilDrawer` + `RightDrawer` | Phase 3 | 1 impl + call sites in SprintExecutionBoard | Duplicates RightDrawer logic + styles |
| Regulatory WorkflowDrawer + DrawerShell | `VeilDrawer` + `RightDrawer` | Phase 3 | 1 + ModalShell | Uses local Primitives |
| TaskDetailRightPanel / TaskDetailContent (ci- tokens) | Content refactored into `SurfaceCard`/`GlassPanel` sections inside V3 drawers | Phase 3 | Used in 3+ V3 drawer sites | |
| SprintTaskPanel (custom state sections) | `SurfaceCard` + `VeilSection` | Phase 3 | In MasterCalendar drawers | |
| EvidencePanel custom rows | Canonical list + `EmptyState` + `DataGrid` | Phase 3 | Multiple | |

### verify:ui + CSS Family Notes
- 1084 WARN: Legacy theme refs (ci-ion-dark etc in index.css lines 700–1311) + motion anti-patterns. No enforcement of "no ci-* on target surfaces".
- ci-* families still primary in CES (MyTasksPage header ci-bg-ces-canvas + ci-premium-panel; ExecutionUnitCard inline t.white + shadows).

---

**Agent 09 Recommendation:** Expand matrix rows above into root `LEGACY_DEPRECATION_MATRIX.md` (or docs/UIUX/). Add CI guard `npm run legacy:check` (grep ban on new ci-*/CesCard/ hand-rolled drawers outside exemptions). Prioritize strangler on CES surfaces (CesBoard, MyTasks, Calendar) as they drive 80%+ of remaining legacy card/drawer volume.

**This snapshot supersedes May 2026 audit baseline.**
