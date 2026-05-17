# Shell Architecture Reconstruction Plan
**Phase 2 — Core Shell and Command Center Rebuild**

**Program:** Care Indeed UI/UX Reconstruction  
**Version:** 1.0  
**Date:** 2026-05-17  
**Author:** Auto-Pilot Execution (Grok 4.3)  
**Status:** Engineering-Ready  

**Traceability:**
- Primary: `docs/UIUX/UIUX_RECONSTRUCTION_MASTER_PLAN.md` — PHASE 2 section
- Execution Control: `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation/MASTER_UIUX_IMPLEMENTATION.md` (Phase 2)
- Visual Contract: `docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md` Section 4 (Constrained Page View)
- Responsive Rules: `RESPONSIVE_ACCEPTANCE_MATRIX.md`
- Primitives: `primitives/CATALOG.md`
- Tokens: `tokens/tokens.json` (v0.2.0-phase1)

---

## 1. Purpose

Rebuild the application shell (`CommandCenterLayout`, topbar, navigation rails, and content framing) as **canonical infrastructure**. The shell must become the single source of truth for:

- The **Constrained Page View Contract** (4-sided breathing room on ≥1024px)
- Consistent command hierarchy and command groups
- Layer model enforcement (max 3 layers)
- Responsive orchestration for the frame itself

This plan does **not** touch operational surfaces (Dashboard, Evidence, Audit, Calendar, My Tasks). Those are Phase 3.

---

## 2. Current State Analysis

### Existing Implementation
- Primary file: `src/policy/components/CommandCenterLayout.tsx` (≈1000+ lines)
- Current philosophy comment: "CI-ION premium one-glass design"
- Uses a near-full-bleed or full-bleed glass canvas + TravelightBG
- Navigation defined as a large inline `NAV_ITEMS` array with mixed concerns
- Heavy inline Lucide icons, custom SVG components, and direct state management
- No dedicated shell primitives (`ShellFrame`, `ShellTopbar`, `ShellNavRail`, etc.)
- 4-sided inset token (`--ci-glass-layer1-inset-desktop`) exists but is not systematically enforced at the root layout level
- Dual-brand remnants (CI-ION logo + Care Indeed logic) still active

### Drift vs. Canonical Target
- Violates Constrained Page View Contract on desktop/laptop (backdrop framing is weak or absent)
- Command groups are not semantically zoned
- Legacy CI-ION shell semantics conflict with the new single-brand Care Indeed direction
- No clear separation between shell infrastructure and page content

---

## 3. Target Architecture

### High-Level Shell Model

```
App Root
└── ShellFrame (new root primitive)
    ├── ShellTopbar (new)
    │   ├── Identity Zone (logo + org switcher)
    │   ├── Global Search Entry
    │   ├── Global Actions (notifications, help, theme, user menu)
    │   └── Command Mode Indicators
    │
    ├── ShellNavRail (new)
    │   ├── Primary Operations Group (Command Center, Clinicians, Patients, Calendar, etc.)
    │   ├── Compliance Execution Group (CES Dashboard, Board, Evidence, Audit, Workflows…)
    │   └── Administration Group (Taxonomy, Brad, Onboarding Admin…)
    │
    └── ShellContentFrame (new)
        └── <Outlet /> / Page Content
            └── (Layer 1 GlassPanel or Layer 2 SurfaceCard compositions)
```

**Layer Rules (enforced by shell):**
- Layer 0: Atmospheric backdrop (`TravelightBG` or light gutter)
- Layer 1: Main `GlassPanel` inside `ShellContentFrame` (respects 4-sided inset)
- Layer 2: `SurfaceCard` and elevated panels inside Layer 1
- Layer 3: Exception only (never used for default shell or page composition)

### New Canonical Primitives to Introduce

| Primitive            | File Location (proposed)              | Purpose                                      | Replaces                          |
|----------------------|---------------------------------------|----------------------------------------------|-----------------------------------|
| `ShellFrame`         | `src/policy/components/ui/ShellFrame.tsx` | Root layout + 4-sided constrained container + backdrop | Current CommandCenterLayout root |
| `ShellTopbar`        | `src/policy/components/ui/ShellTopbar.tsx` | Top identity + global actions bar           | Inline topbar logic               |
| `ShellNavRail`       | `src/policy/components/ui/ShellNavRail.tsx` | Desktop/laptop navigation rail               | Current NAV_ITEMS rendering       |
| `ShellContentFrame`  | `src/policy/components/ui/ShellContentFrame.tsx` | Inner constrained page container            | Current content wrapper           |
| `ShellCommandGroup`  | `src/policy/components/ui/ShellCommandGroup.tsx` (or utility) | Semantic grouping of nav items               | Ad-hoc dividers                   |
| `ShellMobileDrawer`  | `src/policy/components/ui/ShellMobileDrawer.tsx` | Mobile navigation (bottom sheet pattern)     | Current mobile menu               |

All new primitives **must** be exported from `src/policy/components/ui/index.ts`.

---

## 4. Component Breakdown & Responsibilities

### ShellFrame
- Accepts children as the entire app content area
- Applies the 4-sided inset on ≥1024px using `clamp(16px, 1.6vw, 28px)` via `--ci-glass-layer1-inset-desktop`
- Manages global backdrop (`TravelightBG` in dark, subtle gutter in light)
- Provides context for current route mode (operational vs admin)
- Handles reduced-motion preference at the frame level

### ShellTopbar
- Fixed height, uses `GlassPanel` (Layer 1) or direct token styling
- Left: Brand logo (Care Indeed only — remove CI-ION)
- Center: Global search trigger (opens command palette or navigates to search)
- Right: Theme toggle, help bulb, user menu, rollout phase badge (if applicable)
- Must be fully responsive (collapses actions on mobile)

### ShellNavRail (Desktop ≥1024px)
- Vertical rail on the left of `ShellContentFrame`
- Uses `ShellCommandGroup` to zone items:
  - **Primary Operations**
  - **Compliance Execution (CES)**
  - **Knowledge & Administration**
- Icons from Lucide + custom `BradRobotIcon` moved into primitive
- Active state driven by `useLocation` + feature flags
- Collapsible on laptop (1024–1439px) if needed

### ShellContentFrame
- Applies the final constrained inset
- Wraps the page `<Outlet/>`
- Enforces that any direct child glass element cannot be full-bleed
- Provides scroll container with proper padding

### ShellCommandGroup
- Simple presentational wrapper + optional heading
- Used both in nav rail and potentially in topbar action clusters

---

## 5. File & Module Structure Changes

**New files (under `src/policy/components/ui/`):**
- `ShellFrame.tsx`
- `ShellTopbar.tsx`
- `ShellNavRail.tsx`
- `ShellContentFrame.tsx`
- `ShellCommandGroup.tsx`
- `ShellMobileDrawer.tsx` (or reuse `BottomSheetDrawer`)

**Modified files:**
- `src/policy/components/CommandCenterLayout.tsx` → **Refactored to thin orchestrator** that composes the new primitives. Eventually can be deleted or reduced to a compatibility wrapper.
- `src/policy/PolicyCommandCenterApp.tsx` → Minor updates to pass props/context if needed
- `src/policy/components/ui/index.ts` → Add exports for all new shell primitives
- `src/index.css` or token consumption → Ensure shell-specific utilities exist (no new raw values)

**Deprecation Path:**
- Legacy `ci-premium-*`, `ci-executive-*` classes inside shell must be removed.
- CI-ION logo usage must be purged from production shell.

---

## 6. Migration Strategy (Non-Breaking)

1. **Parallel Implementation Phase**
   - Build new primitives in isolation while current shell remains functional.
   - Use feature flag or route-based opt-in during development.

2. **Shell Swap**
   - Replace the root of `CommandCenterLayout` with `<ShellFrame>`.
   - Move existing topbar/nav logic into the new primitives.
   - Validate every major route at desktop, laptop, tablet, and mobile.

3. **Cleanup**
   - Delete or archive legacy inline code.
   - Remove dual-brand logic from shell.

4. **Validation Gates**
   - Must pass visual regression against approved reference captures (Top Picks mocks).
   - Must satisfy the Responsive Acceptance Matrix for the shell frame itself.
   - Accessibility audit (focus management, ARIA landmarks, keyboard nav in rail).

---

## 7. Key Architectural Decisions

- **Decision D-Phase2-001**: The shell will **own** the 4-sided constrained container. Pages must never override it.
- **Decision D-Phase2-002**: Navigation will be re-zoned into three `ShellCommandGroup`s for cognitive clarity (Primary / CES / Admin).
- **Decision D-Phase2-003**: `ShellFrame` will be the only place where `TravelightBG` is mounted for operational routes.
- **Decision D-Phase2-004**: Mobile navigation will use `BottomSheetDrawer` (existing primitive) rather than a custom drawer.

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|----------|
| Large refactors in `CommandCenterLayout` break many routes | High | Incremental migration + heavy Playwright coverage |
| Logo/branding changes affect CES users | Medium | Keep temporary compatibility prop for 2 weeks |
| Performance regression from new component tree | Low | Keep primitives thin; measure with React DevTools Profiler |
| Inconsistent inset on multi-card pages | High | Enforce via `ShellContentFrame` + lint rule in future |

---

## 9. Success Metrics (Shell Only)

- Every route at ≥1024px shows visible 4-sided backdrop framing around the primary glass content.
- Navigation uses only `ShellNavRail` + `ShellCommandGroup`.
- Zero raw visual values in all shell files.
- All new shell primitives appear in `ui/index.ts`.
- Shell passes responsive matrix at all four breakpoints.
- Reduced motion respected globally at the frame level.

---

**End of Shell Architecture Reconstruction Plan**

This plan is now complete and ready for implementation. All subsequent artifacts will be produced immediately.