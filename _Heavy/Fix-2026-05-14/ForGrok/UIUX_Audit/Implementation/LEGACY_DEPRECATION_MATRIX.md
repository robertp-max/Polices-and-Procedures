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
