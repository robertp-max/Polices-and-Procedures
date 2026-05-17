# Living Drift Register — UI/UX Reconstruction

**Purpose:** Track every known deviation from the canonical system identified in the May 2026 UIUX_Audit. This is the single source of truth for what still needs to be closed.

**Maintenance Rule:** No Phase 2 or Phase 3 work on a surface is allowed until its related drift items are either resolved or have an explicit, time-boxed exception recorded here.

**Last Updated:** 2026-05-XX (initial population from original audit reports)

---

## Top 25 Drift Items (Prioritized)

| ID | Drift Item | Original Source | Severity | Current Owner | Target Phase | Status | Notes |
|----|------------|------------------|----------|---------------|--------------|--------|-------|
| D01 | 2313+ raw inline `style={{` and hardcoded hex values | UIUX_DESIGN_SYSTEM_AUDIT, DRIFT_REPORT | Critical | Engineering + Design | Phase 1 | In Progress | Token pipeline v1 + lint rule by end of Phase 1. First 500 raw values to be removed in reference Dashboard surface. |
| D02 | GVGBDetailView uses completely local hardcoded light theme (#1F1C1B, #E5E4E3, #007970, #C74601) | DRIFT_REPORT, SURFACE_INVENTORY | Critical | TBD | Phase 2 | Open | Must be migrated to canonical primitives + tokens |
| D03 | CES full parallel design system (ces/theme.ts, CesCard, navy #1F4A8A + orange) | DRIFT_REPORT, CES_BOARD_VISUAL_LANGUAGE | Critical | TBD | Phase 1 decision | Open | See Spec Section 16 |
| D04 | Multiple policy detail renderers (GVGB, SharedPolicyDetailView, PolicyDetailPage, PolicyLibraryDocumentView, SurveyorPolicyViewerPage) | DRIFT_REPORT, SURFACE_INVENTORY | High | TBD | Phase 2–3 | Open | Consolidation to one canonical renderer |
| D05 | 6+ different Tabs implementations | DRIFT_REPORT | High | TBD | Phase 2 | Open | ui/Tabs must become the only one |
| D06 | 8+ different Card/Surface families | DRIFT_REPORT | High | TBD | Phase 2 | Open | GlassPanel + SurfaceCard must dominate |
| D07 | Journey V1 cinematic dark glass vs Onboarding V2 light professional (incompatible worlds) | EXECUTIVE_SUMMARY, ONBOARDING_V2 docs | High | TBD | Phase 1 decision | Open | See Spec Section 17 |
| D08 | eCign / FormSigning uses separate navy/orange palette | DRIFT_REPORT | High | TBD | Phase 2 | Open | Must converge on canonical brand |
| D09 | Print outputs have inconsistent headers/footers across GVGB, FormPrintView, eCign packets | PRINT_PDF_CONSISTENCY_GUIDELINES, EXECUTIVE_SUMMARY | Critical | TBD | Phase 1–2 | Open | See Spec Section 15 |
| D10 | Desktop-biased layouts, poor mobile experience for field users (wide drawers, complex carousels) | UIUX_MOBILE_RESPONSIVE_AUDIT | High | TBD | Phase 2–3 | Open | Must pass Responsive Behavior Matrix |
| D11 | Legacy StatusBadge (dark-assuming) coexists with CiStatusBadge | DRIFT_REPORT | Medium | TBD | Phase 1 | Open | Deprecate legacy |
| D12 | Mixed fonts and arbitrary typography (`text-[26px]`, `tracking-[0.22em]`) | DESIGN_SYSTEM_AUDIT | High | TBD | Phase 1–2 | Open | Enforce TYPOGRAPHY_SCALE.md |
| D13 | "One-glass, no stacked sub-cards" philosophy violated on most pages | index.css comments + DRIFT_REPORT | High | TBD | Phase 2 | Open | Enforce Section 4 of Spec |
| D14 | CES boards use independent urgency hierarchy and card treatments | CES_BOARD_VISUAL_LANGUAGE | Medium | TBD | Phase 2 | Open | Align with canonical glass + urgency tokens |
| D15 | Form tables, evidence hierarchy, dense CES boards have keyboard/contrast risks | UIUX_ACCESSIBILITY_AUDIT | High | TBD | Phase 1–2 | Open | Map to Accessibility Component Checklist |
| D16 | Multiple loading spinner families (AppLoader, InlineLoader, custom) | EXECUTIVE_SUMMARY | Medium | TBD | Phase 2 | Open | Standardize on LoadingState primitive |
| D17 | Orphaned backup files still in repo (DashboardPage.tsx.backup, etc.) | DRIFT_REPORT | Low | TBD | Phase 1 | Open | Clean up |
| D18 | Domain-specific palettes in FrameworkShowcase, iAdministrator, staffing | DRIFT_REPORT | Medium | TBD | Phase 2–3 | Open | Bring into semantic tokens |
| D19 | Wide 9/3 grids and 760px UnitDrawer in Onboarding V2 on desktop | MOBILE_RESPONSIVE_AUDIT | Medium | TBD | Phase 2 | Open | Must respect constrained container |
| D20 | Journey V1 absolute carousel with fragile vw positioning | EXECUTIVE_SUMMARY | High | TBD | Phase 1 decision | Open | Likely deprecate in favor of V2 patterns |
| D21 | Inconsistent empty state richness and illustration usage | EXECUTIVE_SUMMARY | Medium | TBD | Phase 2 | Open | Standardize on EmptyState primitive |
| D22 | Hover states vary wildly (some lifted glass, many flat) | DESIGN_SYSTEM_AUDIT | Medium | TBD | Phase 2 | Open | Enforce canonical hover/focus/active tokens |
| D23 | Print fidelity issues in signed_locked Options for some WAPI forms | EXECUTIVE_SUMMARY | Critical | TBD | Phase 1–2 | Open | Part of Print Contract |
| D24 | No enforced single source of truth for compliance packet HTML | PRINT_PDF_CONSISTENCY_GUIDELINES | Critical | TBD | Phase 1 | Open | `buildPrintablePacketHtml` must win |
| D25 | Feature gating is mature but visual treatment of rollout badges is inconsistent | EXECUTIVE_SUMMARY | Low | TBD | Phase 2 | Open | Standardize badge treatment |

---

## Process

1. Any new drift discovered during reconstruction must be added here immediately.
2. Before starting work on a surface, the owning team must review all related drift items.
3. Items marked "Phase 1 decision" must be resolved before Phase 1 exit sign-off.
4. The 16-point alignment review must be re-run at the end of each phase with updated status from this register.

**This register is the heartbeat of the anti-drift program.**
