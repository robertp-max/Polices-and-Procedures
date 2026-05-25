# Agent 15 — Cross-Surface Consistency & Pattern Library (V3) — Phase 1 Design Application Specification

**Agent:** 15 — Cross-Surface Consistency & Pattern Library (V3 Floating Glass Cards)  
**Primary Surfaces Owned:** All shared patterns and compositions across the product: the single-source `FloatingGlassCard` wrapper (mandatory for every other agent); V3 variants of TaskCard, KpiCard, StatusBadge, FilterBar, ActionRail, EmptyState, LoadingSkeleton (and any future shared compositions such as CommandRail, ContextPanel); usage contracts and visual regression requirements for Dashboard, Evidence Center, CES (Board, MyTasks, Workloads, ExecutiveDashboard), Master Calendar, Policy Library + Detail, Audit, Onboarding V2, PM views, and all 70+ operational surfaces.  
**Date:** 2026-05-18  
**Visual North Star Reference:** `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/mockup/v3/V3_MOCKUP_DESIGN_SPEC.md` (authoritative floating-card rules), `mockup/v3/Dashboard_v3_Floating_Cards.jpg` (primary dark reference — individual independent floating glass cards with strong visible 4-sided borders, frosted translucency, luminous edges on deep navy atmospheric Layer 0, teal #007970 + warm orange #E07B2C accents used sparingly), `mockup/v3/Dashboard_v3_Light_Dark.jpg` (exact paired light-mode variant with soft clean glass, subtle hairlines, soft shadows); supporting V2 Top-Picks adapted to V3 language; existing pattern usage in `src/policy/pages/DashboardPage.tsx`, `EvidenceCenterPage.tsx`, `ces/pages/MyTasksPage.tsx`, `MasterCalendarPage.tsx`, `LibraryPage.tsx`, `SharedPolicyDetailView.tsx`, `pm/PmViews.tsx`, `ces/components/...`; `primitives/CATALOG.md`; `Implementation/SURFACE_CHECKLISTS/Dashboard.md` and cross-surface reports.  
**Status:** Claude-Ready (V3) — pending bidirectional countersign from Agents 01, 02, 03, 04, 05 (Dashboard reference), 06 (CES), 07 (Evidence), 08 (Policy), 10 (Calendar), 12, 13.

---

## 1. Executive Translation — How the V3 Dark Mode Floating-Card Language Must Manifest on These Patterns

The V3 language (per V3_MOCKUP_DESIGN_SPEC.md and the two reference images) **completely replaces** the prior "single luminous inset ShellContentFrame + on-glass flat sections" philosophy. Every interactive or content-bearing block — KPI tiles, task rows, filter controls, action groups, empty/loading states — must render as its own **independent floating glass card** with **clearly visible borders on all four sides**, generous breathing room (minimum 12–16px gaps, often more) from siblings and viewport edges, subtle frosted translucency, soft luminous edges/inner glow, and calm separation. Dark mode is the primary target (deep navy/charcoal Layer 0 backdrop with cards "popping" via strong visible borders); light mode must use the identical layout, spacing, and card structure but with softer hairline borders and soft shadows for equal premium feel.

**Non-negotiable V3 rules for every pattern (directly from the jpgs and spec):**
- **No giant single glass container** wrapping groups of elements. The expensive premium effect now comes from many small-to-medium independent floating cards with visible 4-sided framing against the atmospheric background.
- **Maximum 3 layers total**: Layer 0 = deep navy atmospheric body/root; Layer 1 = subtle host surface (evolved ShellContentFrame or page-level glass host that provides the outer frame + backdrop breathing room); Layer 2 = the elevated floating cards themselves (stronger borders, slight lift, luminous treatment). Patterns live at Layer 2.
- Every card must show **strong 4-sided borders** (visible even at a glance in the V3 dark mock) — not hairline only, not edge-kissing, not full-bleed. Borders combine crisp inner hairline + subtle outer luminous glow (new `--ci-v3-card-border-dark`, `--ci-v3-card-glow` tokens).
- Cards have **breathing room** (gaps) between each other and from the outer frame; the dark (or light) background is always visible framing them.
- Rounded corners consistent with the mock (approx 16–20px / rounded-2xl–3xl scale, never sharp or pill-only).
- Frosted glass translucency + soft inner glow on dark; clean soft glass + subtle shadow on light. No heavy decorative inner blurs.
- Teal (#007970) and warm orange (#E07B2C) used **sparingly and strategically** only for primary CTAs, critical status accents, and active filter states — never for decoration or bulk fills.
- Typography from locked ci-text-* scale (Montserrat headings, clean sans body); excellent contrast and readability on both dark and light glass.
- All patterns must feel "expensive, calm, clinical-grade" — never busy, flat, or competing.

**The single source of truth: `FloatingGlassCard` wrapper (owned by Agent 15, must be used by every other agent).**
All other agents (05 Dashboard, 06 CES, 07 Evidence, 08 Policy, 10 Calendar, etc.) **MUST** compose their surfaces exclusively from `<FloatingGlassCard variant="kpi|task|panel|filter|empty|..." layer={2}>` (plus the canonical patterns below) instead of raw divs, old `SurfaceCard`, ad-hoc `.glass-*` classes, `.ci-operational-card`, `.ci-premium-hero`, `CesCard`, or local card inventions. This guarantees pixel-consistent floating treatment across the entire product.

Current state (brutally documented in prior Agent 15 analysis + SURFACE_CHECKLISTS + primitives/CATALOG): At least 4–5 fractured card families (ci-card/SurfaceCard on Dashboard, glass-*-lib on Policy/Evidence, CesCard in CES, custom KpiTile/StatusPill in Onboarding, ad-hoc inline styles in Calendar/PM). TaskCard and KpiCard are locally defined inside DashboardPage.tsx with theme branching and raw classes. Filters are ActionButton toolbars. EmptyState and LoadingState have ad-hoc padding and lack skeleton variants or glass integration. This directly violates the V3 "one family, floating cards only" mandate.

**How the old inset approach evolves:**
- `ShellContentFrame` (Agent 04/02) evolves from "the single painted glass canvas" to a **Layer-1 host frame** that supplies the outer 4-sided luminous breathing room + deep background visibility. Inside it, page content is a composition of many independent Layer-2 `FloatingGlassCard` instances with explicit gaps (no negative margins, no full-bleed boards).
- `GlassPanel` and `SurfaceCard` are retained for migration only; new code **must not** use them for V3 surfaces — they become internal implementation details or aliases inside `FloatingGlassCard`.
- All patterns receive first-class dark-primary + paired light variants that exactly reproduce the two V3 jpgs.

**Key aesthetic + behavioral rules enforced by patterns (currently violated everywhere except partial Dashboard post-reconstruction):**
- Glass depth & backdrop breathing room: every FloatingGlassCard renders with explicit border + glow tokens; parent layouts must enforce ≥12px gap (token `--ci-v3-card-gap`).
- Elevation & layering: Layer 2 only for pattern cards; stronger border/glow on elevated drawers/modals (new `variant="elevated"` or `data-layer="2"`).
- Typography & density: comfortable command surfaces (larger padding for KPI/panel) vs compact lists (tighter TaskCard); always ci-text-*.
- Urgency/status: calm authority via 5-level left-border accent + `StatusBadgeV3` (never heavy fills that fight glass). Single semantic token set (no CES sub-brand or gold literals outside CTAs).
- Motion: subtle lift on hover (y-1 + glow increase), 120–180ms ease; reduced-motion respects prefers-reduced-motion.
- Mobile vs desktop: identical card language; on mobile cards may stack tighter (still ≥8px gaps) or become bottom-sheet contents; FilterBar collapses to segmented control or sheet trigger; ActionRail becomes FAB or bottom actions.

The V3 Dashboard (Agent 05 reference) is the living oracle: 6–8 small independent KPI floating cards in a row with gaps, large central task-overview floating card containing sub-filter and column compositions (each column header + items also floating where density permits), all with visible borders against the dark bg. Every other surface must match this card vocabulary exactly.

---

## 2. Surface-by-Surface Current State vs V3 Contract Gap Analysis

For each major view (and the patterns they consume), the table below documents defects vs the V3 floating-card + strong 4-sided border language.

| View / Sub-View | Current Primary Defects vs V3 Floating Card Language + 4-Sided Borders | Severity (Blocker / High / Medium) | Line References (most critical) | Required Fix Direction for Generated Code |
|-----------------|------------------------------------------------------------------------|------------------------------------|----------------------------------|---------------------------------------------|
| Dashboard (all modes, KPI row, board columns, TaskCard, KpiCard) | Local `KpiCard` + `TaskCard` functions with ad-hoc `ci-operational-card` / `ci-kpi-card`, theme `isLight` branching, raw border colors, no unified FloatingGlassCard; main board uses ShellContentFrame + negative margins / full-bleed columns that touch edges; cards lack consistent strong visible 4-sided separation and luminous glow | Blocker | DashboardPage.tsx:612 (KpiCard), 815 (TaskCard), 432 (mobile grid), 463+ (board sections), 788 (column shells) | Rebuild all KPI/Task/Board elements as `<FloatingGlassCard variant="kpi">` and `<TaskCardV3>` (which internally uses FloatingGlassCard); remove full-bleed; enforce explicit gaps; use V3 dark/light tokens only |
| Evidence Center (grids, hierarchy panels, detail, filters) | Heavy custom `.ci-premium-hero`, `.ci-command-rail`, `.ci-maturity-section`, `ci-status-pill--*`, tables flush to edges inside large containers; no ShellContentFrame in root; detail drawer lacks elevated floating treatment | High | EvidenceCenterPage.tsx (multiple containers, hierarchy, 300+), CesEvidenceHierarchyPanel | Convert every content block, filter rail, file grid item, and drawer content into distinct independent FloatingGlassCard instances with V3 4-sided borders + breathing room; promote EvidenceFileCard as pattern |
| CES Board / MyTasks / Workloads / ExecutiveDashboard | `CesCard` parallel primitive (opaque navy canvas in CesLayout), task rows use custom styling; filter UI is raw ActionButton map (no FilterBarV3); columns and cards often edge-touching or flush; strong sub-brand dialect | High/Blocker for V3 unification | ces/pages/MyTasksPage.tsx:362 (FILTER map), 380 (ci-premium-hero), ces/components/board/SprintExecutionBoard.tsx, CesLayout.tsx, ces/components/primitives.tsx (CesCard), ces/theme.ts | Deprecate CesCard in favor of FloatingGlassCard + TaskCardV3; wrap filters in FilterBarV3; evolve CesLayout host to Layer-1 only; every task item, workload stat, board column header = FloatingGlassCard variant="task|kpi|panel" |
| Policy Library + Detail / SharedPolicyDetailView | Ad-hoc `.glass-interactive-lib`, `.glass-panel-lib` (raw hex borders 0.77px), custom lib cards, large single glass blocks for sections/tabs; no floating separation inside detail | High | LibraryPage.tsx (grid + filters), SharedPolicyDetailView.tsx (sections, tabs content), PolicyDetail tabs | All library cards, search results, detail sections (statements, procedures, appendices) must be stacked independent FloatingGlassCard + StatusBadgeV3; FilterBarV3 for library search/filters |
| Master Calendar + CES calendar components | Partial SurfaceCard adoption for some containers; event chips, day cells, shift cards use custom visuals + inline styles; right panels mixed | Medium-High | MasterCalendarPage.tsx, ces/components/calendar/ComplianceCalendar.tsx, EventTaskList.tsx | CalendarEventCard, DayCell, ShiftCard all become TaskCardV3 or dedicated CalendarEventV3 (wrapping FloatingGlassCard); filter controls = FilterBarV3 |
| PM / Onboarding V2 / Audit / Forms / iAdministrator | KpiTile, StatusPill, GateTile, custom rails, form cards, complex panels use local inventions or Onboarding-specific light tiles; mixed glass vs opaque | Medium-High | PmViews.tsx:115 (PmTaskCard), onboarding-v2/*, FormViewer, AuditModePage, iAdministrator complex panels | All must adopt FloatingGlassCard + shared patterns; Onboarding may keep light-professional variant but still use the wrapper + V3 light tokens |
| All drawers, modals, right panels, bottom sheets (RightDrawer, BottomSheetDrawer, task detail, etc.) | Inherit old ci-glass-panel without stronger "elevated floating" V3 treatment; often flush or insufficient border visibility | High | RightDrawer.tsx, BottomSheetDrawer.tsx, TaskDetailRightPanel.tsx, WorkflowDrawer.tsx | All transient surfaces use `<FloatingGlassCard variant="elevated" layer={2}>` with stronger glow/border tokens; coordinate with Agent 02/04 for drawer chrome |
| Empty / Loading / Error states (across all) | EmptyState uses fixed inline padding + muted text (no glass card wrapper); LoadingState lacks skeleton variant that mimics floating card shapes; scattered ad-hoc loaders | Medium | EmptyState.tsx:13, LoadingState.tsx:72 (variants), usages in Dashboard 892, MyTasks 307, PmViews 85 | EmptyStateV3 and LoadingSkeletonV3 must render inside or as FloatingGlassCard; skeletons must match exact card dimensions/rhythm of their filled state |
| Cross-surface (general) | 4+ card families, multiple urgency palettes, inconsistent padding/gaps, no single source wrapper; primitives/CATALOG lists planned KpiCard/FilterBar but they do not exist as governed patterns | Blocker | primitives/CATALOG.md:73 (missing), old Agent_15 analysis §2.1–2.4, SURFACE_CHECKLISTS/Dashboard.md:35 (partial adoption) | Agent 15 owns the unified library + visual regression matrix (same pattern rendered in 8+ contexts must be pixel/perceptually identical); update CATALOG + add `patterns/` barrel |

All gaps are now classified as V3 Blockers because the floating-card + visible 4-sided border language is the north star; legacy inset or dialect cards will never match the Dashboard_v3_Floating_Cards.jpg.

---

## 3. Canonical Component & Primitive Promotion Ladder for This Domain (Patterns)

All shared patterns are promoted to a new governed `patterns/` subfolder under `src/policy/components/ui/` (or `ui/patterns/`) and exported from `ui/index.ts` + `ui/patterns/index.ts`. Raw ad-hoc divs / inline styles / local TaskCard/KpiCard functions are eliminated.

- **Raw ad-hoc** (DashboardPage local functions, .glass-*-lib, CesCard, ci-premium-hero, custom KpiTile, etc.) → **must be eliminated** (deprecation tracked by Agent 14/15).
- **Existing primitives** (SurfaceCard, GlassPanel, CiStatusBadge, EmptyState, LoadingState) → retained for migration compatibility only; they become thin wrappers or internal to the new V3 patterns. Update CATALOG.md to mark them "Legacy / V3 migration only".
- **New single-source wrapper** (owned by Agent 15): `FloatingGlassCard` — the **mandatory base for every card-like surface in V3**. All other agents import and use only this for visual surfaces.
- **V3 Pattern Compositions** (new named patterns owned/co-owned with Agent 15): 
  - `KpiCardV3`
  - `TaskCardV3` (and domain extensions: `CalendarEventCardV3`, `PmTaskCardV3`, `EvidenceFileCardV3`)
  - `StatusBadgeV3` (evolution of CiStatusBadge with V3 glass-pill + left-accent support)
  - `FilterBarV3`
  - `ActionRailV3`
  - `EmptyStateV3`
  - `LoadingSkeletonV3` (new skeleton primitive that respects floating card shapes)
- **Page-level patterns** (unique but obey global rules): `DashboardKpiRowV3`, `BoardColumnV3`, `PolicySectionCardV3`, `CalendarGridV3` etc. — these are thin compositions of the above + FloatingGlassCard; documented in SURFACE_CHECKLISTS and owned by domain agents but must pass Agent 15 visual review.

For each, exact props interface (single source in Agent 15 files), declared `data-layer="2"` (or "1" for hosts), allowed/forbidden token classes:

**FloatingGlassCard (the single source wrapper — all agents must use):**
```ts
export interface FloatingGlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'kpi' | 'task' | 'panel' | 'filter' | 'empty' | 'skeleton' | 'elevated';
  layer?: 1 | 2;                    // defaults to 2 for patterns
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  interactive?: boolean;            // adds hover lift + focus ring
  dataUrgency?: 1 | 2 | 3 | 4 | 5;  // optional left-border accent strength
  className?: string;
}
```
- Renders with `data-layer`, `data-variant`, `data-v3="true"`.
- Token classes allowed inside: only V3 floating card tokens (`ci-v3-floating-card`, `ci-v3-border-glow-*`, ci-text-*). Forbidden: raw hex, arbitrary Tailwind spacing outside the rhythm, old .glass-morphism, .ci-operational-card (except migration).
- Implementation: uses new CSS custom properties from Agent 03 (see §9) + theme-aware (dark primary + light paired) glass + border + glow. Matches the exact visual in Dashboard_v3_Floating_Cards.jpg (frosted, visible 4-sided, luminous on navy; soft on light).

**KpiCardV3:**
```ts
interface KpiCardData { label: string; value: string | number; trend?: string; tone?: 'default'|'positive'|'warning'|'danger'; alert?: boolean; onClick?: () => void; }
<KpiCardV3 data={kpi} emphasize? />
```
- Internally: `<FloatingGlassCard variant="kpi" interactive={!!onClick} ...>` with tight padding, eyebrow label, large stat value, optional trend.
- Used in Dashboard KPI row (6–8 cards), CES workloads, Evidence stats, etc. Must match V3 mock small floating squares exactly.

**TaskCardV3 (and extensions):**
```ts
interface TaskCardData { id: string; domain: string; title: string; owner: string; dueDate: Date; status: string; urgency?: 1|2|3|4|5; onClick?: () => void; ... }
<TaskCardV3 data={task} />
```
- Internally uses FloatingGlassCard variant="task" + StatusBadgeV3 for due + domain eyebrow + owner avatar + arrow affordance.
- Domain-specific extensions (CalendarEventCardV3, etc.) add fields but never change visual contract without Agent 15 approval.
- Current local TaskCard in DashboardPage.tsx is the direct source to port.

**StatusBadgeV3:**
```ts
interface StatusBadgeV3Props { tone: 'neutral'|'info'|'success'|'warning'|'danger'|'critical'; urgencyLevel?: 1-5; leftAccent?: boolean; children }
```
- Evolution of CiStatusBadge: glass pill + optional left border accent (for urgency hierarchy). Used inside TaskCard, standalone, in FilterBar active states. Single source for all surfaces (CES, Evidence, Policy, Calendar).

**FilterBarV3:**
```ts
interface FilterOption { id: string; label: string; count?: number; }
<FilterBarV3 options={filters} activeId={active} onChange={setActive} variant="segmented|chips|rail" />
```
- Renders as horizontal floating glass bar (or segmented control inside a FloatingGlassCard) with ActionButtonV3 children or chips. URL sync support. Replaces all ad-hoc filter maps (MyTasksPage, Library, Calendar, etc.).

**ActionRailV3:**
```ts
<ActionRailV3 actions={[{id, label, icon, onClick, variant}]} orientation="horizontal|vertical" />
```
- Group of primary/secondary actions as a floating card or rail of buttons. Used for command rails, bulk actions, detail footers.

**EmptyStateV3:**
```ts
interface EmptyStateV3Props extends EmptyStateProps { variant?: 'inline' | 'card' | 'fullscreen'; }
```
- Wraps or renders inside FloatingGlassCard variant="empty". Icon + title + description + action. Used in board columns, lists, search results.

**LoadingSkeletonV3:**
```ts
<LoadingSkeletonV3 variant="kpi-row" | "task-list" | "panel" count={N} />
```
- New primitive (not in current LoadingState). Renders animated skeleton bars/rects that exactly match the dimensions, padding, and rhythm of the filled FloatingGlassCard variant they replace. Shimmer respects glass translucency + reduced motion (static or pulse).

All patterns declare `data-v3-pattern="true"` + specific data attrs for testing / visual regression (Agent 16).

Update `primitives/CATALOG.md` (Agent 15 + 01 co-edit) to list the new V3 entries with exact file paths, props, layer, and "single source — all surfaces must import from here" rule.

---

## 4. Exact Layout, Spacing & Composition Rules

**Outer frame / inset contract (evolved for V3 floating cards):**
- `ShellContentFrame` (or V3 host) supplies the Layer-1 outer 4-sided luminous breathing room (`--ci-glass-layer1-inset-desktop: clamp(16px, 1.6vw, 28px)`) so the atmospheric background is visible around the entire content composition.
- Inside the host: a vertical stack or grid of `FloatingGlassCard` instances with **mandatory gap** `--ci-v3-card-gap: 12px` (desktop), `8px` (compact mobile). No negative margins, no edge flush, no "kiss" between cards.
- Max-width behavior: cards respect container but never expand to eliminate the frame breathing room.

**Vertical rhythm (gap tokens between sections):**
- Between major pattern groups (KPI row → main board card): 20–24px.
- Inside a panel card (sub-sections): 12–16px.
- Card internal padding: `sm=12px`, `md=16px`, `lg=20–24px` (kpi uses sm/md; task/panel use md/lg). Exact values locked in tokens + documented in V3 spec.

**Card-to-card relationships:**
- All at Layer 2 with consistent border strength.
- When density requires (board columns), column headers may be subtle Layer-1 hosts while individual task items are Layer-2 floating cards.
- Never nest FloatingGlassCard inside another FloatingGlassCard (use internal section dividers with hairline only).

**Responsive breakpoints and mobile transformation:**
- Desktop (≥1024): horizontal KPI row (flex wrap ok with gaps), generous card gaps.
- Tablet/Mobile: KPI row → 2-col grid then stack; FilterBar → segmented or "Filters" trigger opening bottom sheet with same options inside a floating sheet card; ActionRail → condensed or FAB; drawers become bottom sheets (still using FloatingGlassCard content inside).
- Coordinate with Agent 12: the visual language (borders, glass, gaps) remains identical; only stacking and trigger patterns change.

**First-500ms scan path (Dashboard as oracle, applied to all):**
1. Top KPI floating cards (6–8 small independent cards) — large value + tiny label + optional accent.
2. Central large floating card containing filter bar + board title.
3. Individual task floating cards (domain eyebrow, title, owner, due badge).
4. Empty/Loading states appear as calm centered content inside their own floating card.
All patterns must preserve this calm scannability with high contrast on glass.

**ASCII-style composition example (V3 Dashboard KPI + board excerpt):**
```
[Shell host Layer-1 with outer breathing room]
  <KpiRow>  [FloatingKpi] [FloatingKpi] [FloatingKpi] [FloatingKpi] ...  (gaps)
  <MainBoardCard variant="panel">
    <FilterBarV3 ... />
    <BoardColumns>
      [subtle header]
      <TaskCardV3> ... </TaskCardV3>
      <TaskCardV3> ... </TaskCardV3>
    </BoardColumns>
  </MainBoardCard>
```

---

## 5. State Machine, Interaction Model & Behavioral Contract

**Major states for patterns (reflected while staying inside calm glass language):**
- Default resting (glass + visible border)
- Hover / focus (subtle lift y-px + glow intensification + teal ring on interactive; keyboard focus ring always visible teal/gold per Agent 13)
- Active / selected (for filters, tabs inside FilterBar)
- Urgency levels 1–5 (left border accent strength + StatusBadgeV3 tone; never overrides entire card bg)
- Disabled (reduced opacity, no lift)
- Loading (replace card content with LoadingSkeletonV3 of matching shape)
- Empty (EmptyStateV3 inside or as the card)
- Error (inline error banner inside the same floating card, never breaking the border)

**Real-time / polling:** Patterns themselves are presentational. Real-time updates (task status change, KPI recalc) trigger optimistic re-render of the data inside the existing FloatingGlassCard; the card chrome (border, glass, glow) remains stable. Coordinate with stores (Zustand etc.) for live feel without visual thrash.

**Keyboard / focus / ARIA (Agent 13 countersign required):**
- Every interactive FloatingGlassCard or pattern (Kpi onClick, TaskCard button, Filter option) is a real `<button>` or has `role="button"` + `tabIndex`, visible focus ring (teal on dark, appropriate on light), `aria-pressed` where applicable.
- StatusBadgeV3 is non-interactive span or button when used as filter chip.
- EmptyStateV3 action is focusable; skeletons are aria-hidden or status live region.
- All patterns expose proper `role`, `aria-label` (e.g., "KPI: Patient Compliance Rate 92%, positive trend").

**Error / empty / loading treatment:** Must use the canonical V3 patterns (no ad-hoc). Empty inside its FloatingGlassCard variant="empty". Skeletons exactly mimic the filled floating card so the layout never jumps on load.

**Micro-interactions:** 120–180ms cubic-bezier lift/glow for hover; press scale 0.985; success (after mutation) subtle check flash or border glow pulse (teal). All respect reduced-motion.

---

## 6. Complete Data, Endpoint & Store Requirements

### 6.1 Data Shapes (TypeScript interfaces — canonical, single source)

```ts
// Core wrapper (internal use)
interface FloatingGlassCardData { /* visual only */ }

// KPI
interface KpiCardData {
  id?: string;
  label: string;
  value: string | number;
  trend?: string;
  tone?: 'default' | 'positive' | 'warning' | 'danger';
  alert?: boolean;
  onClick?: () => void;
}

// Task / Event (used by TaskCardV3 + extensions)
interface TaskCardData {
  id: string;
  domain: string;
  title: string;
  owner: string;
  dueDate: Date | string;
  status: string;
  urgency?: 1 | 2 | 3 | 4 | 5;
  assigneeAvatar?: string;
  onClick?: (id: string) => void;
  // extensions for Calendar / Evidence / PM
  eventType?: string;
  evidenceCount?: number;
  shiftTime?: string;
}

// Filter
interface FilterOption { id: string; label: string; count?: number; icon?: ReactNode; }
interface FilterBarData {
  options: FilterOption[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'segmented' | 'chips' | 'rail';
}

// Status
interface StatusBadgeV3Data {
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'critical';
  urgencyLevel?: 1 | 2 | 3 | 4 | 5;
  leftAccent?: boolean;
  children: ReactNode;
}

// Action
interface ActionItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
}
interface ActionRailData { actions: ActionItem[]; orientation?: 'horizontal' | 'vertical'; }

// Empty / Skeleton
interface EmptyStateV3Data {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'inline' | 'card' | 'fullscreen';
}
interface LoadingSkeletonV3Data {
  variant: 'kpi-row' | 'task-list' | 'panel' | 'filter' | 'grid';
  count?: number;
}
```

These shapes are the **contract** that domain agents (05,06,07,08,10) must supply when using the patterns. Stores (useObligations, dashboardStore, etc.) must expose normalized data in these shapes.

### 6.2 Required Endpoints / Operations

Patterns are UI-only but require consistent data contracts from the surfaces that consume them. The following must be supplied (or mocked) for codegen:

| Operation | Purpose | Recommended REST / tRPC Shape | Real-time Need? | Owner | Notes for Codegen |
|-----------|---------|-------------------------------|-----------------|-------|-------------------|
| GET /api/v3/kpis/summary (or dashboard/summary) | Populate KpiCardV3 row | `{ kpis: KpiCardData[] }` | polling 30s or ws | Backend + Agent 05 | Must support tone/alert derivation |
| GET /api/v3/tasks/my + /filtered?filter=... | TaskCardV3 lists on Dashboard/CES/Calendar | `{ tasks: TaskCardData[], total, stats }` | ws or optimistic on PATCH | CES/PM stores | FilterBarV3 drives query param; optimistic status changes update the card immediately |
| PATCH /api/v3/task/:id/status | Status mutation inside TaskCard | `{ id, status, urgency? }` | immediate | Backend | Triggers re-render of TaskCardV3 + KPI refresh |
| GET /api/v3/filters/options?context=ces|evidence|calendar | Dynamic FilterBarV3 options + counts | `{ options: FilterOption[] }` | static or light poll | Various | Counts shown in chips |
| GET /api/v3/evidence/by-event/:id | EvidenceFileCardV3 grid inside Evidence floating cards | `{ files: EvidenceFileData[] }` | - | Evidence store | |
| WS /realtime/updates (task, kpi, evidence) | Live updates without full reload | delta payloads matching the *CardData shapes | yes | Backend | UI applies optimistic + server reconcile while card chrome stays stable |

**Local store shape (Zustand/Jotai recommended):** normalized maps (tasksById, kpisById) + activeFilter + ui state (loading per pattern id). Persist only user prefs (last filter per surface). Optimistic update rules: mutate local immediately on action, rollback on error with toast inside the affected card; glass success indicator (border glow pulse) on success.

All surfaces using patterns must declare the exact query/mutation keys so codegen can wire hooks uniformly.

---

## 7. Cross-Surface Pattern Usage (Coordination with Agent 15 — Self)

Every surface **must** consume only the V3 patterns from the central library. No local re-implementations allowed after Phase 1.

- **Dashboard (Agent 05):** KPI row = 6–8 `<KpiCardV3>` inside a host; board columns contain `<TaskCardV3>` + `FilterBarV3` + `EmptyStateV3` / `LoadingSkeletonV3`. Must be the pixel-perfect reference for all other surfaces.
- **CES (Agent 06):** MyTasks filters = `FilterBarV3`; task rows = `TaskCardV3`; workload stats = `KpiCardV3`; board columns use `BoardColumnV3` (composition). Deprecate CesCard/Ces-specific urgency.
- **Evidence (Agent 07):** File grids and hierarchy items = `EvidenceFileCardV3` (extends TaskCardV3 or uses FloatingGlassCard + StatusBadgeV3); filters = `FilterBarV3`; detail panels = `ActionRailV3` + elevated cards.
- **Calendar (Agent 10):** Event items = `CalendarEventCardV3` (TaskCardV3 variant); day cells may use minimal floating cards; filters and views = `FilterBarV3` + `ActionRailV3`.
- **Policy (Agent 08):** Library result cards = floating cards with `StatusBadgeV3` (lifecycle/ACHC); detail sections = stacked `<FloatingGlassCard variant="panel">` + `ActionRailV3` for actions.
- **All surfaces:** Empty/loading = V3 variants inside or as the card; status anywhere = `StatusBadgeV3`; actions = `ActionRailV3` or buttons inside cards.

**Allowed visual differences:** None for core treatment. Domain extensions (extra fields in TaskCardData) permitted only if they do not alter chrome, padding, typography, or border language. Any proposed extension requires Agent 15 + visual regression sign-off.

**Visual regression contract (Agent 16):** 8-context matrix (Dashboard dark/light, CES, Evidence, Calendar, Policy, mobile, drawer) for each pattern. Pixel or perceptual equality required.

---

## 8. Adjacent Agent Interface Contracts (Mandatory Coordination Evidence)

| Adjacent Agent | What I Require From Them (input contract) | What I Guarantee To Them (output contract) | Current Conflicts / Open Questions | Sign-off Status (simulated or real) |
|----------------|-------------------------------------------|--------------------------------------------|------------------------------------|-------------------------------------|
| Agent 01 (Glass & Layering V3) | Exact V3 glass translucency, frosted values, inner glow, Layer 2 elevation semantics, and token definitions for dark primary + light paired (must match the jpgs exactly) | All patterns will only use Layer 2 (or documented Layer 1 hosts); will expose `data-layer` and never introduce >3 layers or competing glass | None — V3 reset aligns perfectly | Needs review & countersign |
| Agent 02 (Floating Borders / Elevation V3) | The precise 4-sided visible border + luminous glow + breathing-room tokens and radius values that reproduce Dashboard_v3_Floating_Cards.jpg on dark (and light pair) | Patterns will consume only the approved border/glow classes; will enforce gaps via parent + never allow edge-touching or flush cards | Old inset values in ShellContentFrame must be supplemented, not replaced | Needs review & countersign |
| Agent 03 (Tokens V3) | New V3 token groups: `--ci-v3-floating-card-*` (bg, border-dark, border-light, glow, gap, radius), urgency accent ladder, updated glass for both modes; generator support | Patterns will be 100% token-driven (zero raw values post-migration); will contribute usage examples for token docs | Existing glass tokens are inset-oriented; V3 needs parallel floating set | Needs review & countersign |
| Agent 04 (Shell V3) | Evolved `ShellContentFrame` / host that supplies Layer-1 outer breathing room while allowing many independent Layer-2 floating cards inside (no forced single canvas) | Patterns will respect the host frame; will never override or punch through the outer 4-sided inset | Current ShellContentFrame comment assumes "the" glass canvas | Needs review |
| Agent 05 (Dashboard V3 Reference) | The exact KPI row composition, board card usage, and first-500ms scan path from the V3 jpgs as the living visual contract | Dashboard will be first consumer and gold master for TaskCardV3 / KpiCardV3 / FilterBarV3; any deviation will be flagged | Dashboard local cards must be fully replaced | In progress — this spec is the handoff |
| Agent 06 (CES) | All CES surfaces (board, MyTasks, workloads) will adopt TaskCardV3 + FilterBarV3 + KpiCardV3 without retaining CesCard dialect | Patterns will support any CES-specific data extensions (role backfill, escalation) via props while preserving chrome | CES sub-brand exception must be retired or strictly bounded for V3 | Needs review & countersign |
| Agent 07 (Evidence) | Evidence grids, hierarchy, detail will use EvidenceFileCardV3 + FloatingGlassCard + StatusBadgeV3 | Patterns will support evidence-specific metadata (file type, staleness, audit trail) | Current custom rails and flush tables | Needs review |
| Agent 08 (Policy) | Library cards and detail sections will use floating cards + StatusBadgeV3 | Patterns will support policy lifecycle states and ACHC tagging badges | Legacy glass-lib classes | Needs review |
| Agent 10 (Calendar) | Calendar events, shifts, projections will use CalendarEventCardV3 (TaskCardV3 superset) | Patterns will support temporal + projection fields | Custom calendar cells | Needs review |
| Agent 12 (Mobile) | Mobile transformations (stacking, bottom sheets, condensed FilterBar/ActionRail) while preserving identical glass + border + gap language | Patterns will ship responsive variants; mobile visual regression will be provided | Bottom sheet chrome must also be floating glass | Needs review |
| Agent 13 (A11y) | All patterns meet 44px targets, visible focus (teal/gold rings on glass), ARIA, reduced-motion, contrast on both dark/light glass | Patterns will ship with full a11y props + documented focus/keyboard behavior; no color-alone meaning | Current EmptyState/LoadingState have partial a11y | Needs review & countersign |

No unresolved contradictions on Agent 15 side. All contracts are bidirectional and will be re-verified before any codegen prompt is assembled.

---

## 9. Shared Vocabulary & Glossary Contributions (V3 Pattern Layer)

New/refined terms contributed to the master glossary (to be merged):

- `FloatingGlassCard` — The single-source Layer-2 wrapper primitive (Agent 15). Every content block that would have been a "card" is now an independent instance with strong visible 4-sided borders, frosted glass, luminous edges, and breathing room. Props: `variant`, `layer`, `dataUrgency`. All other agents must import and use this.
- `V3PatternVariant` — One of: kpi, task, panel, filter, empty, skeleton, elevated. Controls internal padding, typography scale, border strength, and skeleton shape.
- `BreathingGap` / `--ci-v3-card-gap` — Mandatory minimum separation (12px desktop / 8px mobile) between floating cards and from outer frame. Enforced by layout hosts and visual regression.
- `Layer-2 Elevated Floating Card` — The primary expression of V3 premium (matches Dashboard_v3_Floating_Cards.jpg exactly). Stronger border/glow than Layer 1 host.
- `Calm Authority Urgency Ladder` (1–5) — Single semantic left-border + StatusBadgeV3 treatment (Agent 11 + 15). Never heavy fills.
- `V3 Dark Primary + Paired Light` — Dark mode is the reference (deep navy Layer 0, strong borders on frosted cards); light mode uses identical structure with soft hairlines/soft shadows (exact match to Dashboard_v3_Light_Dark.jpg).
- `Pattern Visual Regression Matrix` — Agent 15 + 16 contract: same pattern rendered in 8+ surface + mode + responsive contexts must be perceptually identical.

Legacy terms being retired or scoped: `ci-operational-card`, `glass-*-lib`, `CesCard` (CES exception bounded), "on-glass-section" (replaced by gaps between cards).

---

## 10. Phase 1 Implementation Sequence & Codegen Handoff Notes

Recommended order for the downstream model (after tokens + FloatingGlassCard base):

1. Implement `FloatingGlassCard` + all new V3 CSS custom properties (coord Agent 03) + dark/light variants that match the two jpgs pixel-for-pixel on reference renders.
2. Implement `StatusBadgeV3` (evolve CiStatusBadge) + `EmptyStateV3` + `LoadingSkeletonV3` (new).
3. Implement `KpiCardV3`, `TaskCardV3`, `FilterBarV3`, `ActionRailV3` (each thin composition on top of FloatingGlassCard).
4. Update `primitives/CATALOG.md`, `ui/index.ts`, `ui/patterns/index.ts`.
5. Produce visual regression baselines for the 8-context matrix.
6. Domain agents (starting with Agent 05 Dashboard as oracle) adopt the patterns; old local cards and dialects removed.
7. Full cross-surface visual regression + Agent 15 + 16 sign-off.

**New primitives/compositions that must be built before pages:**
- FloatingGlassCard (foundational)
- LoadingSkeletonV3 (because current LoadingState has no skeleton)
- V3 token set for floating cards (Agent 03)

**Backend work in parallel:** The data shapes and endpoints listed in §6.2 (especially normalized task/kpi/filter responses with urgency derivation).

**Large data/taxonomy work:** None for patterns themselves; urgency taxonomy (1–5) and filter option shapes must be stable.

**Special scaffolding for codegen:** Provide the exact V3 jpg references + "generate using only FloatingGlassCard + the 7 patterns; never invent local cards" instruction. Include the TS interfaces and "data-v3-pattern" attributes for testability.

---

## 11. Claude-Ready Certification (Phase 1 Agent Exit Gate)

**I certify that this specification is complete and ready to be included in the master code-generation prompt.**

- [x] Every visual rule from the V3_MOCKUP_DESIGN_SPEC.md and the two Dashboard_v3 jpgs (strong 4-sided visible borders, independent floating glass cards, max 3 layers, dark primary + paired light, breathing room, restrained teal/orange) has been translated into concrete, non-ambiguous instructions for the entire shared pattern library.
- [x] All current defects vs contract (fractured card families, local TaskCard/KpiCard, ad-hoc filters, missing skeletons, legacy glass-lib/CesCard) are documented with line references and required fix directions.
- [x] The full component promotion ladder + exact token usage + the single-source `FloatingGlassCard` wrapper (mandatory for all other agents) is defined with full props interfaces.
- [x] Every data shape, endpoint, and store requirement for the patterns is specified (even future ones).
- [x] All adjacent agent interface contracts are listed with no unresolved contradictions on my side (Agents 01–13 + domain peers).
- [x] Mobile, accessibility, and cross-surface consistency concerns have been explicitly addressed via coordination notes, visual regression matrix, and "use only these patterns" rule.
- [x] An LLM with access to the full 16-agent bundle + this spec + the endpoint inventory + the two V3 images could generate correct, beautiful, contract-obeying V3 floating-card implementations for all patterns and force their adoption across every surface without further clarification.

**Remaining risks or open questions that the orchestrator must resolve before codegen:**
1. Exact numeric values for V3 border/glow/radius/gap tokens (Agent 02/03 must lock from the jpgs and provide generator output before FloatingGlassCard implementation).
2. Final CES sub-brand boundary decision (Agent 06 + orchestrator) — if any CES exception survives V3, it must still use FloatingGlassCard under the hood.
3. Migration timeline / deprecation PR template for old card classes (Agent 14/15/16).

**Agent 15 Signature:** V3 Cross-Surface Pattern Library — 2026-05-18

**Countersigned by adjacent agents (or orchestrator proxy):** 
- Agent 01 (Glass & Layering V3): ___________________________
- Agent 02 (Floating Borders V3): ___________________________
- Agent 03 (Tokens V3): ___________________________
- Agent 05 (Dashboard V3 Reference): ___________________________
- Agent 06 (CES): ___________________________
- Agent 07 (Evidence): ___________________________
- Agent 12 (Mobile): ___________________________
- Agent 13 (A11y): ___________________________

---

**End of Agent 15 V3 Phase 1 Design Application Specification**

This document + the V3 images + primitives/CATALOG.md updates + the new `FloatingGlassCard` implementation form the single source of truth for all cross-surface V3 pattern usage. All other agents are required to import and compose exclusively from the library defined herein.