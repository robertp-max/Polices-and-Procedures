# Canonical Primitives Catalog

**Location in code:** `src/policy/components/ui/`

**Rule:** All reconstructed operational surfaces must be built primarily from these primitives. Local one-off components inside pages are strongly discouraged.

---

## Current Canonical Primitives (as of Phase 1 start)

| Component            | File                          | Purpose                              | Status      | Notes |
|----------------------|-------------------------------|--------------------------------------|-------------|-------|
| `GlassPanel`         | GlassPanel.tsx                | Primary glass surface container      | Core        | Must respect Section 4 constrained frame |
| `SurfaceCard`        | SurfaceCard.tsx               | Elevated Layer 2 card                | Core        | - |
| `ActionButton`       | ActionButton.tsx              | Primary CTA                          | Core        | - |
| `UtilityButton`      | UtilityButton.tsx             | Secondary / icon actions             | Core        | - |
| `PageHeader`         | PageHeader.tsx                | Top-level page title + actions       | Core        | - |
| `SectionHeader`      | SectionHeader.tsx             | Section titles inside surfaces       | Core        | - |
| `Tabs`               | Tabs.tsx                      | Tab navigation                       | Core        | - |
| `SearchField`        | SearchField.tsx               | Global + local search input          | Core        | - |
| `EmptyState`         | EmptyState.tsx                | Empty / zero-data states             | Core        | - |
| `LoadingState`       | LoadingState.tsx              | Loading skeletons & spinners         | Core        | - |
| `CiStatusBadge`      | CiStatusBadge.tsx             | Status / compliance badges           | Core        | - |
| `BottomSheetDrawer`  | BottomSheetDrawer.tsx         | Mobile-first drawer                  | Core        | - |
| `RightDrawer`        | RightDrawer.tsx               | Desktop detail drawer                | Core        | - |
| `DataGrid`           | DataGrid.tsx                  | Tables & lists                       | Core        | - |
| `StalenessBanner`    | StalenessBanner.tsx           | Data freshness indicator             | Core        | - |
| `SignaturePad`       | SignaturePad.tsx              | Form signing                         | Core        | - |
| `PhotoEvidenceCapture` | PhotoEvidenceCapture.tsx    | Evidence photo capture               | Core        | - |
| `ThemeModeToggle`    | ThemeModeToggle.tsx           | Light / Dark switcher                | Core        | - |

---

## Shell Primitives (Phase 2 — Promoted to Canonical)

All shell primitives live in `src/policy/components/ui/` and are exported from `ui/index.ts`. They are the **only** approved building blocks for the application chrome. `CommandCenterLayout.tsx` is now a thin orchestrator that composes these primitives — no shell-level layout or styling may be authored outside this set.

| Component             | File                       | Purpose                                                              | Status        | Notes |
|-----------------------|----------------------------|----------------------------------------------------------------------|---------------|-------|
| `ShellFrame`          | ShellFrame.tsx             | Outer 4-sided constrained page frame (Layer 0 backdrop + Layer 1 glass) | Core — Shell | Owns `--ci-glass-layer1-inset-desktop` + `--ci-glass-layer1-border-radius-desktop` |
| `ShellTopbar`         | ShellTopbar.tsx            | Brand bar, hamburger, account/contextual slot                         | Core — Shell | Hamburger gated to mobile via `showMobileMenu` prop |
| `ShellNavRail`        | ShellNavRail.tsx           | Desktop left navigation rail                                         | Core — Shell | Width via `--ci-shell-navrail-width` (16rem). Three canonical groups: Primary Operations / Compliance Execution / Administration / Knowledge |
| `ShellContentFrame`   | ShellContentFrame.tsx      | Inner content surface inside the glass layer                         | Core — Shell | Enforces page-level padding contract |
| `ShellCommandGroup`   | ShellCommandGroup.tsx      | Nav-section grouping inside `ShellNavRail`                           | Core — Shell | Provides eyebrow + spacing tokens |
| `ShellMobileDrawer`   | ShellMobileDrawer.tsx      | Canonical mobile navigation drawer (wraps `BottomSheetDrawer`)        | Core — Shell | Replaces the legacy inline full-screen modal in `CommandCenterLayout`. Renders `role="dialog" aria-modal="true"` + `nav[aria-label="Mobile navigation"]`. Supports `NavItem.subItems` via grouped sub-rows |

**Exported type:** `NavItem` (from `ShellNavRail.tsx`) — single canonical shape consumed by both `ShellNavRail` and `ShellMobileDrawer`. Shape:

```ts
type NavItem = {
  id: string;
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  featureId?: string;
  subItems?: Array<{ to: string; label: string }>;
};
```

**Token coverage (shell):** all visual properties resolve to `--ci-*` custom properties — no raw brand hex in any shell primitive or in `CommandCenterLayout`. Final two account-menu fallbacks live as `--ci-shell-account-avatar-bg-ci-light-dark`, `--ci-shell-account-menu-bg-light`, `--ci-shell-account-menu-bg-dark`.

**Visual regression:** `Builder/_system/uat/phase2-shell-visual.spec.mjs` (9 tests, **all passing 9/9 with baselines committed**) gates the shell across desktop-1200/1440/1600, tablet-768, mobile-390, reduced-motion, splash, axe-core (scoped to `[role="banner"]` + `nav` + `[role="dialog"]`, `wcag2a/aa + wcag21a/aa`), and the mobile drawer ARIA + Escape contract. Baselines: `Builder/_system/screenshots/phase2-shell-visual/` (30 PNGs).

**Accessibility fixes applied in Phase 2 closeout:**
- `ShellTopbar` root carries `role="banner" aria-label="Application topbar"` so axe can scope to the shell.
- Account-avatar button carries `data-on-brand=""` to opt out of the global `.text-white → #1F1C1B` cascade (Care Indeed light mode), restoring WCAG AA contrast on the teal avatar.
- Mobile bottom-nav active label uses `var(--ci-secondary-600)` (#004142) on the tinted accent background in light mode — ~8:1 contrast — instead of the lighter `var(--ci-accent)` (which had failed at 4.34:1).

---

## Planned / Missing Primitives (High Priority for Phase 1–2)

- `KpiCard` / `MetricCard`
- `BoardColumn` / `KanbanCard`
- `CommandRail`
- `ContextualHelpBubble`
- `FormField` + `FormSection` (standardized)
- `Toast` / `Banner` system (currently scattered)
- `Modal` (Layer 3)
- `ProgressStepper` / `Timeline`
- `FilterBar` / `SegmentedControl`

---

## Ownership & Extension Rules

1. New primitive → must be proposed in this catalog + added to `ui/index.ts` exports.
2. Modification of an existing primitive requires update to this catalog + visual regression.
3. Do **not** create local copies of primitives inside page folders.
4. All primitives must consume the official token system (no hard-coded values).

---

## Usage Example (to be expanded)

```tsx
import { GlassPanel, SurfaceCard, ActionButton } from '@/policy/components/ui';

<GlassPanel data-layer="1">
  <SurfaceCard>
    <ActionButton>Complete Task</ActionButton>
  </SurfaceCard>
</GlassPanel>
```

---

**This file is the living inventory.** Update it whenever a new primitive is promoted or an existing one is modified.
