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
