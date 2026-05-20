# Agent 05 — Dashboard & Overview Surfaces Analysis

**Subagent:** 05 — Dashboard & Overview Surfaces Specialist  
**Primary Lens:** Main `DashboardPage` (Command Center) — KPI cards, boards, action panels, multi-card glass composition  
**Reference Mockups:** `Desktop/v2/01_Dashboard_Desktop_v2.jpg` (primary), Top-Picks equivalents, and cross-referenced mobile v2 variants  
**Date:** 2026-05-17  
**Scope:** `src/policy/pages/DashboardPage.tsx` + `.backup`, `dashboardStore.ts`, `pm/` components, `ui/` glass/shell primitives, CSS custom `ci-*` layers, shell inset usage, urgency hierarchy, "first 500ms scan" task-first design

---

## Executive Summary

The current `DashboardPage` is the designated **reference surface** per `DASHBOARD_RECONSTRUCTION_KICKOFF.md` and `Dashboard_Reconstruction_Plan.md`, yet it remains the clearest example of partial reconstruction. Recent Phase 3 Pass 2 work (2026-05-16) successfully eliminated raw hex colors, arbitrary Tailwind typography, and 28 inline `style` blocks — replacing them with 19 token-backed `ci-text-*` / `ci-min-*` / `ci-shadow-elev-*` utilities in `src/index.css`. However, **structural, layering, and layout fidelity to the approved v2 mockups has not been achieved**.

**Critical divergences:**
- **4-sided inset contract violation** (most severe): Nested `ShellContentFrame` + `-mx-3` full-bleed hack on the Action Board panel (`DashboardPage.tsx:413,463`) destroys the backdrop breathing room required to "magnify the glassmorphism effect" (CANONICAL_UI_SYSTEM_SPEC.md §4, Review_02_Analysis_PostCompletion_4Sided_Contract_Violations.md).
- **Multi-card glass composition mismatch**: Current implementation uses ad-hoc `ci-premium-hero`, `ci-premium-panel`, `ci-operational-card`, `ci-kpi-card` families with custom gradients/shadows instead of canonical `GlassPanel` + `SurfaceCard` (or promoted `KpiCard`/`BoardColumn`).
- **Layout & hierarchy mismatch vs mockup**: 7-column KPI grid + 4-tone vertical kanban board + custom hero vs. v2 mockup's compact top KPI row (≈3 cards) + Task Overview with left filter rail + list/progress panels.
- **Urgency & scan semantics**: Column-level coloring + due badges exist, but do not match the canonical 5-level left-border + badge hierarchy in `TASK_URGENCY_HIERARCHY_SPEC.md`. First-500ms scan is partially supported (critical column first, hero stats) but diluted by visual noise and edge-touching elements.
- **Primitive adoption incomplete**: Local `KpiCard`, `BoardColumn`, `TaskCard`, `DashboardHero`, `AgencyReadinessBanner`, `HeroStat` components duplicate primitive responsibilities. `ShellCommandGroup` is used once; `SurfaceCard`/`GlassPanel` are ignored for inner surfaces.

**Net result:** The live Dashboard does **not** visually or structurally match the approved v2 contract. The glass depth, elevation stacking, and "calm authority / task-first" presence described in mocks and specs are not realized. Because Dashboard is the reference surface, every other operational page (Evidence, CES, Calendar, PM, Onboarding) inherits the same defects.

**Unique Insight from Dashboard Lens:**  
Dashboard is the only surface that simultaneously demands **dense multi-card operational triage** (7+ KPIs + 4 urgency columns + hero + banner) *and* must prove the **single-glass + 4-sided inset** philosophy that makes glassmorphism legible. The current code reveals the fundamental architectural tension: the "one-glass canvas" (CommandCenterLayout.tsx:47) was written to forbid stacked sub-cards, yet the v2 mockups and CANONICAL spec explicitly require "multi-card compositions (e.g. Dashboard KPI + boards + action panels)" inside a properly inset Layer-1 frame. The `-mx-3` and nested-frame hacks are symptoms of trying to force dense content onto a philosophy that was never reconciled with the actual mockup contract. Fixing Dashboard first is not incremental polish — it is the enforcement point that makes the entire 3-layer glass model (backdrop / main glass / elevated cards) and the token contract real for the product.

---

## Files & Artifacts Examined

**Core Implementation:**
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\DashboardPage.tsx` (893 lines active)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\pages\DashboardPage.tsx.backup` (legacy 244-policy taxonomy version, irrelevant to current state)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\stores\dashboardStore.ts` (minimal — only `selectedMetric` / `splitViewTaskId`)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\pm\` (14 files; `PmDashboardPage.tsx`, `PmTaskCard.tsx`, `PmViews.tsx` etc. are parallel PM surface, not consumed by main Dashboard)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\ui\`:
  - `ShellContentFrame.tsx` (applies `--ci-color-glass-main` tokens + 4-sided radius/breathing contract)
  - `SurfaceCard.tsx` (`.ci-card` — flat solid on `--ci-surface`)
  - `GlassPanel.tsx` (`.ci-glass-panel` — translucent)
  - `ShellCommandGroup.tsx`, `ActionButton.tsx`, `UtilityButton.tsx`, `CiStatusBadge.tsx`, `EmptyState.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\index.css` (heavy `ci-premium-*`, `ci-operational-card`, `ci-kpi-card`, token definitions for glass, 19 new Phase-3 utilities)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\CommandCenterLayout.tsx` (outer shell + "one-glass" philosophy comment)

**Reference & Governance Docs:**
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\_Heavy\Fix-2026-05-14\ForGrok\UIUX_Audit\Implementation\DASHBOARD_RECONSTRUCTION_KICKOFF.md`
- `Dashboard_Reconstruction_Plan.md`, `Dashboard_Canonical_Primitive_Usage.md`, `Dashboard_Token_Application_Matrix.md`, `SURFACE_CHECKLISTS/Dashboard.md`
- `docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md`, `Review_02_Analysis_PostCompletion_4Sided_Contract_Violations.md`
- `TASK_URGENCY_HIERARCHY_SPEC.md`, `GLASS_LAYERING_CHEAT_SHEET.md`
- Mockups: `.../mockup/Desktop/v2/01_Dashboard_Desktop_v2.jpg` + Top-Picks and Mobile/v2 variants (read via multimodal)

---

## Exact Visual & Structural Divergences from Mockup Contract

### 1. Shell Inset & 4-Sided Breathing Room (Highest Priority Violation)

**Mockup Contract (v2 Desktop + CANONICAL §4 + GLASS_LAYERING):**
- Primary content glass (KPI + boards composition) must sit inside a visible Layer-0 backdrop gutter on **all four sides**.
- `ShellContentFrame` (or equivalent) provides `clamp(16px, 1.6vw, 28px)` inset + `rounded-[2rem]` + painted `--ci-color-glass-*` tokens.
- Multi-card compositions must demonstrate **magnified** glassmorphism via the breathing room (backdrop frames the entire card cluster).

**Current Implementation (`DashboardPage.tsx`):**
```tsx:413:413:src/policy/pages/DashboardPage.tsx
<ShellContentFrame scrollable className="animate-in fade-in duration-500" data-surface="dashboard">
  <div className="flex flex-col gap-4 sm:gap-5">
```
```tsx:463:463:src/policy/pages/DashboardPage.tsx
<div className={`flex-1 min-h-0 pb-2 ${isMobile ? '' : '-mx-3 sm:mx-0 px-3 sm:px-0'} ... ci-premium-panel p-3 sm:p-4`}>
```
- **Nested `ShellContentFrame`**: The page itself wraps in `ShellContentFrame`. The outer layout (`CommandCenterLayout`) already supplies one. Result: content glass has zero backdrop margin inside the chrome.
- **`-mx-3` full-bleed hack**: Explicitly cancels the frame padding so the Action Board "touches edges" of its container.
- **Variable padding**: Hero uses `px-4 sm:px-6`, banner `px-4`, header `px-3`, board `p-3 sm:p-4` — no uniform inset rhythm.
- **Consequence** (per Review_02): "The expensive blur/edge-glow/depth only reads when glass has visible backdrop breathing room." Current output shows chrome-framed full-bleed content areas, not the luminous inset glass of the mockup.

**Evidence in docs:** `Review_02_Analysis...md:101-135`, `SURFACE_CHECKLISTS/Dashboard.md:25-32` (many items still unchecked), `Phase3_Implementation_Spec.md`.

### 2. Card / Glass Primitive Usage vs Multi-Card Composition

**Mockup Expectation:**
- Top KPI cards and lower panels are elevated `SurfaceCard` / `GlassPanel` (Layer 2) instances inside the main framed glass.
- Consistent elevation stacking, border-radius, shadow tokens, translucent layering per `GLASS_LAYERING_CHEAT_SHEET.md` and `LIGHT_MODE_ELEVATION_SYSTEM.md`.

**Current Code:**
```tsx:594:594:src/policy/pages/DashboardPage.tsx
const baseClass = 'ci-kpi-card ci-operational-card rounded-2xl border px-4 py-3';
```
```tsx:726:747:src/policy/pages/DashboardPage.tsx
shell: 'ci-operational-card p-3 bg-gradient-to-b from-rose-50/55 to-transparent dark:from-rose-500/8',
// (similar for warning, progress, pending)
```
- **No `SurfaceCard` or `GlassPanel`** for KPI or Task cards.
- **Custom families**: `.ci-premium-hero` (linear-gradient + heavy box-shadow), `.ci-premium-panel`, `.ci-operational-card` (color-mix + var shadows), `.ci-kpi-card`.
- Board columns use inline gradient shells + `rounded-2xl border`.
- Task cards: `rounded-2xl border p-4` with light/dark conditional `bg-white/5` etc.
- `DashboardHero`, `KpiCard`, `BoardColumn`, `TaskCard`, `AgencyReadinessBanner`, `HeroStat` are all local functions — none promoted to `ui/`.

**CSS reality (`src/index.css:1322`):**
```css
.ci-operational-card {
  background: color-mix(in srgb, var(--ci-surface-2) 82%, transparent);
  ...
  box-shadow: var(--ci-shadow-sm);
}
.ci-premium-hero { ... linear-gradient ... box-shadow: 0 22px 48px ... }
```
These are **parallel** to the canonical primitives, not layered on top of them.

**Divergence:** Current is "multi-card" but using legacy premium classes that pre-date the Phase 2 shell/glass contract. The mockup glass depth and edge definition are absent.

### 3. KPI Section — Count, Spacing, Elevation, Hierarchy

**Mockup (from multimodal read of `01_Dashboard_Desktop_v2.jpg`):**
- Compact horizontal row of 3 prominent glass KPI cards (Compliance Rate, Active Cases x2) with small trend pills, teal/orange accents, rounded glassmorphic borders.
- Positioned directly under brand header, with clear breathing room.

**Current:**
- 4 small `HeroStat` cards inside hero (Critical / At Risk / Audit Ready / In Scope).
- Then 7-column responsive grid (`grid-cols-1 sm:grid-cols-2 ... xl:grid-cols-7 gap-3 sm:gap-4`) of `KpiCard` (Active Sprint, Sprint %, Audit Ready, Action In Progress, Missing Evidence, Critical Actions, Audit Open).
- Mobile collapses to 5 primary + 1.
- Heavy use of `ci-text-kpi`, `ci-text-meta`, `ci-min-h-kpi`, custom `valueClass` / `trendClass` tone mapping.
- Emphasize prop on first mobile cards.

**Divergences:**
- 7 vs ≈3 KPIs.
- Grid density and gap values (`gap-3/4`) not calibrated to mockup rhythm.
- Elevation via custom `ci-shadow-elev-md` on buttons vs token elevation system.
- No exact match to mockup card proportions or accent placement.

### 4. Action Board / Task Overview — Structure & Urgency

**Mockup:**
- "Task Overview" section with left vertical filter rail (Pending Actions, Scheduled Visits, Compliance Checklist, etc.).
- Central lists + right-side metric panels (progress bars, ratios).
- Clear visual grouping, not a pure 4-column vertical board.

**Current (`DashboardPage.tsx:448-501`):**
```tsx
<section className="... ci-shell-command-group ...">
  <h2>Action Board</h2>
  ...
</section>
<div className="... ci-premium-panel ...">
  <div className="grid ... lg:grid-cols-4 ...">
    <BoardColumn title="Critical & Overdue" tone="critical" ... />
    <BoardColumn title="At Risk" tone="warning" ... />
    <BoardColumn title="In Progress" tone="progress" ... />
    <BoardColumn title="Awaiting Action / Evidence" tone="pending" ... />
  </div>
</div>
```
- 4 vertical scrollable columns with colored gradient shells.
- `TaskCard` per item with domain eyebrow, title, owner avatar, due badge (`TODAY`, `3D PAST`, etc.), `ArrowRight`.
- `EmptyBoardState` via `EmptyState` primitive (one of few correct uses).

**Urgency Hierarchy Gaps (vs `TASK_URGENCY_HIERARCHY_SPEC.md`):**
- Current: tone-driven column backgrounds + per-card badge colors (red-50, orange-50, etc.).
- Spec: 5 discrete levels (0-4) with **left border accents** (orange for overdue, red for blocked), text badges, never color-alone.
- Column grouping is useful triage but does not deliver per-item left-border visual language required for "first 500ms scan".
- Due labels (`getDueLabel`) are present but styling is ad-hoc (`badgeClass` map).

**Spacing inside columns:** `gap-3` between cards, `p-3` header, `p-4` cards — arbitrary vs token rhythm.

### 5. Additional Structural / Polish Divergences

- **AgencyReadinessBanner**: Custom rounded-2xl + conditional emerald/red shells + chips. Not using `StalenessBanner` or promoted status primitive.
- **Typography**: Now mostly token-backed (`ci-text-display-hero`, `ci-text-kpi`, etc.) — good recent progress, but still custom classes.
- **Responsive**: Mobile uses `isMobile` branches (viewportWidth state + resize listener) and different KPI ordering. Not yet proven against full `RESPONSIVE_ACCEPTANCE_MATRIX.md`.
- **Accessibility gaps** (per `Dashboard_Accessibility_Validation_Report.md`): Color-only in some KPIs, focus rings present on interactive cards but 44px targets need verification on mobile cards.
- **No `KpiCard` / `BoardColumn` promotion**: Explicitly called out as required new primitives in `Dashboard_Canonical_Primitive_Usage.md`.

---

## Comparison Matrix: Current vs Approved v2 Mockup Contract

| Dimension                  | v2 Mockup (Desktop)                          | Current DashboardPage                          | Gap Severity |
|----------------------------|----------------------------------------------|------------------------------------------------|--------------|
| Outer framing              | 4-sided backdrop gutter around entire composition | Nested SCF + -mx-3 edge touch                  | Critical    |
| KPI count & layout         | ~3 horizontal glass cards                    | 4 hero stats + 7-col grid                      | High        |
| KPI primitive              | Elevated glass card (mock)                   | Local `KpiCard` + `ci-kpi-card`                | High        |
| Main content area          | Task Overview + left rail + list + progress panels | Action Board 4-col kanban                      | High        |
| Urgency treatment          | Per-item left borders + badges (spec)        | Column gradients + badge map                   | Medium-High |
| Inner card elevation       | Layered SurfaceCard / GlassPanel tokens      | Custom `ci-premium-*` + gradients + shadows    | High        |
| Spacing / rhythm           | Consistent clamp + token gaps                | Mixed px-3/4/6, gap-3/4/5, -mx hacks           | Medium      |
| "First 500ms scan"         | Critical numbers + prioritized lists visible immediately | Hero + critical column first (partially)       | Medium      |
| Primitive usage            | Canonical only                               | Mix of local + partial ui/ exports             | High        |
| Glass depth / translucency | Luminous edges via breathing room            | Diminished (edge-kissing layers)               | Critical    |

---

## Recommendations Embedded in Analysis

1. **Immediate**: Remove the inner `ShellContentFrame` and `-mx-3` from `DashboardPage.tsx`. Let the outer layout frame provide the single source of truth for inset.
2. **Phase-critical**: Promote `KpiCard`, `BoardColumn`, and a canonical `TaskCard`/`KanbanCard` during the faithful rebuild so the reference surface actually uses the primitives it is supposed to validate.
3. **Urgency**: Align TaskCard left-border + badge logic to the 5-level spec (orange/red borders on Level 3/4).
4. **Visual proof**: Every future change must include side-by-side captures against `Desktop/v2/01_Dashboard_Desktop_v2.jpg` (and mobile) stored in agent baselines.

**End of Agent 05 Dashboard Surface Analysis**

*This document serves as the authoritative baseline for Subagent 05 work and feeds directly into the 4-Phase Plan.*
