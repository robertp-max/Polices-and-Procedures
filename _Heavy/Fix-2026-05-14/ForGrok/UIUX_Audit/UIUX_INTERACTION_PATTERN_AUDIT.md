# UI/UX Interaction Pattern Audit
**Date**: 2026-05-15

---

## Tabs / Accordions / Navigation Patterns

- **ui/Tabs.tsx**: Segmented + underline (canonical, aria roles, token-driven). Under-adopted in policy core.
- **GVGBDetailView**: Local TabButton + sub-tabs (PROCEDURE_SUBTABS + appendices); custom gvgb-enter keyframes.
- **SharedPolicyDetailView**: Multiple Tab* (Overview/Statements/Procedures/...) + carousel sectionIdx + custom nav.
- **DemoPage**: Near-duplicate Tab* (copy-paste).
- **Other**: Journey/V2 accordions, CES board tabs, WorkflowExecutionPanel TabButton, iAdmin StudioTabs, UserGuidePage local Tab.
- **Drift**: Different interaction models, keyboard support, animation, visual treatment. No single canonical with arrow-key roving tabIndex everywhere.
- **Recommendation**: Adopt ui/Tabs as single owner (or document variants). Enforce arrow keys + roving focus. Replace locals in GVGB/Shared/Demo.

**Accordions**: Used in V2 BatchView (phase accordions — good progressive disclosure), some Journey, CES. Inconsistent animation/keyboard (some lack proper ARIA expanded/controlled).

---

## Carousels / Guided Tours / Swipe

- **StagingM01Page**: Complex 5-slot absolute positioned carousel (vw offsets, transforms, tints, video, narration HUD, fixed dock). Keyboard hints md+ only; no touch swipe. High visual polish but fragile.
- **GuidedTourGate + Overlays (MissionPromptOverlay, BradTourAvatar)**: Shell-level login-triggered welcome + restartable tour. Good but limited depth in module player or V2 flows.
- **Other**: Some policy appendices or framework carousels (Shared).
- **Recommendation**: Touch swipe + pause for StagingM01. Extend tours to deeper training/activation flows. Consistent reduced-motion.

---

## Left/Right Navigation, Drawers, Modals

- **RightDrawer.tsx**: Used in PM, iAdmin, etc. Focus trap inconsistent.
- **FormSigningWorkspace**: Modal-like dialog (role=dialog + aria-modal in some states). Focus management + return focus gaps flagged in prior accessibility audit.
- **UnitDrawer (Onboarding V2)**: Wide (760px) — mobile needs bottom sheet.
- **PM overlays, iAdmin RightPanelPreview**: Custom.
- **Recommendation**: Single focus trap primitive. Mobile bottom sheet for all drawers <1024px. Consistent escape/return focus.

---

## Hover States, Loading, Empty, Error States

- **Hover**: Inconsistent (some lifted cards with custom shadow-[ ], many flat after global * { box-shadow: none } rule). Glass-interactive in Library/Demo.
- **Loading**: 13+ variants (AppLoader/InlineLoader border-t-[#C74601], cyan, Loader2 size/color variants, custom in CES/PM/FormSigning). No single primitive with role=status + aria-live.
- **EmptyState**: ui/EmptyState canonical (used in Library, Forms, staffing, calendar, PmViews). Many locals/inline (EventWorkspace, Dashboard EmptyBoardState, EvidenceCenter, iAdmin, PolicyDetailPage inline rose-50, FormSigning conditionals).
- **Error**: Mostly inline rose/amber without role=alert.
- **Recommendation**: Standardize Loader + EmptyState + error (role=alert). Consistent hover (token or flat). Richer illustrated empties.

---

## Voice / Brad / Future Hooks

- **Brad (iAdministrator, BradRobotIcon, BradProposal, GuidedTour with Brad avatar)**: Good foundation for voice/guided future (tour + contextual bulb + help articles).
- **Voice hooks**: None implemented yet (future Brad voice layer possible via help + tour system).
- **Recommendation**: Design voice prompts / Brad guidance for signing, CES task execution, V2 activation, journey modules as future layer. Keep current visual + tour system as base.

---

## Animation Consistency

- **Good**: --ease-standard / --ease-drift in index.css; some transitions.
- **Drift**: Custom keyframes (gvgb-enter), StagingM01 complex transforms + auto-play, many animate-spin without reduced-motion respect in all cases, hover lifts vary.
- **Recommendation**: Enforce --ease-* + prefers-reduced-motion for all (carousel, spinners, transitions, lifts).

**Overall Interaction Maturity**: 6.5/10. Strong primitives and some excellent flows (V2 reconciliation/gates, eCign packet, unified calendar), but fragmentation (tabs, cards, loading, hover, drawers) and mobile/keyboard gaps in regulated surfaces reduce polish and increase cognitive load. 

**Recommendation**: Adopt ui/ primitives for tabs/cards/buttons/empty/loading as single source. Consistent focus trap, reduced-motion, aria patterns. Mobile bottom sheets. Voice/Brad layer designed on top of current help + tour system. See Redesign Roadmap Phases 2, 5, 6, 8.