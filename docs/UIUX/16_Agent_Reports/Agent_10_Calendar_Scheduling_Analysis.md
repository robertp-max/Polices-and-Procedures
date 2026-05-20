# Agent 10: Calendar, Scheduling & Master Tasks Analysis

**Subagent:** 10 — Calendar, Scheduling & Master Tasks Specialist  
**Primary Lens:** MasterCalendarPage, staffing calendar, task scheduling, weekend rules, workload / due-date visualizations  
**Date:** 2026-05-17  
**Scope:** `src/policy/pages/MasterCalendarPage.tsx` (+ backup), `src/policy/staffing/` (pages, components, types-calendar.ts), `src/policy/stores/calendarStore.ts` + `calendarSyncStore.ts`, `src/policy/pm/scheduling/`, `src/policy/components/regulatory/TimelineMonth.tsx`, PM views (Kanban/Gantt/Sprint), regulatory events integration, weekendRule.ts, and audit artifacts (CALENDAR_VISUAL_PATTERNS.md, Calendar_*_*.md reconstruction plans, 4-sided contract review, UIUX audit reports).

---

## Executive Summary (Calendar Lens)

Calendars are the most visually brittle surface in a glassmorphic system. The repetitive grid structure (day cells, chips, shift bars) naturally collapses depth perception and easily forces full-bleed or flat treatment that directly violates the 3-layer model and 4-sided frame contract.

**Verdict:** The current implementation **largely breaks** the premium glass language on both the unified Master Calendar (regulatory + PM) and the dedicated Staffing Calendar. While functional (state classification, weekend guards, sync, sprint/kanban/gantt cross-links, autogen rollout), the visual treatment is legacy-dense and flat. Day cells and event chips are implemented as raw div/button grids with `gap-px` + background tricks and inline var() colors — bypassing `SurfaceCard`, `GlassPanel`, and constrained Layer 1/2 elevation.

MasterCalendarPage root (`h-full w-full ... overflow-hidden`) and staffing page (`p-4 md:p-6 lg:p-8` direct) push content to frame boundaries, eliminating the required 4-sided atmospheric Layer 0 breathing room. This is explicitly called out in the Post-Completion 4-Sided Contract Violations review (MasterCalendarPage:246 cited).

No dedicated calendar visual language from `design/CALENDAR_VISUAL_PATTERNS.md` (Layer 1 glass for normal items, Layer 2 teal-left-border for My Tasks, restrained orange/red for urgency, mobile agenda priority) has been applied.

**Unique Calendar Lens Insight:**  
A calendar grid is not "just another list of cards." Each of the 28–42 day cells functions as a micro-container that must simultaneously:
1. Read as a single coherent Layer-1 frosted surface when empty or low-density.
2. Accept Layer-2 elevated micro-cards (TimelineChip / ShiftCard) inside without nesting glass (which flattens or creates moiré).
3. Preserve the "magnified glass" effect of the outer ShellContentFrame — meaning the entire grid block must sit inside a padded, rounded, bordered Layer-1 panel with visible Layer-0 atmospheric margin on all four sides on desktop.

Traditional calendar implementations (gap-px parent background for "lines", direct cell bg) create a checkerboard that destroys the frosted depth. The only way to honor glassmorphism is to treat the weekday header + grid wrapper as a single `SurfaceCard` / `ci-glass-panel` container, with individual cells using extremely subtle inset tints + hairline internal borders rather than heavy separators. "Today" and selected states must promote the cell to Layer 2 without breaking the outer frame. This is why calendars are "notoriously hard" — one wrong cell treatment collapses the entire 3-layer illusion for the whole page.

---

## 1. Key Files & Architecture Map

### Primary Calendar Surfaces
- **MasterCalendarPage.tsx** (`src/policy/pages/` + .backup)
  - Unified command surface: Regulatory timeline + PM views (calendar | sprint | kanban | gantt).
  - Uses `TimelineMonth` (desktop grid) + `MobileAgendaList` (list).
  - Integrates `WorkflowExecutionPanel`, `TaskDetailRightPanel`, `SprintScopeToolbar`.
  - View switcher via URL `?view=`.
  - July Readiness autogen banner + preview matrix.
  - Bulk Google Calendar sync via `calendarSyncStore`.
  - Root: `ci-page-container h-full w-full ... overflow-hidden` (4-sided violation).
  - Header: `ci-toolbar-wrap ci-premium-hero ci-command-rail ci-maturity-section rounded-xl` (good local glass attempt).

- **TimelineMonth.tsx** (`src/policy/components/regulatory/`)
  - 7-col grid, 35–42 cells.
  - `gap-px`, `rounded-xl overflow-hidden border`, parent bg for lines.
  - `DayCell`: direct style `background: var(--ci-cell-*)`.
  - `TimelineChip`: small button with `border: 1px solid ${color}55`, `background: STATE_SOFT`, no `SurfaceCard`.
  - State only (overdue/block/due/on-track/complete) via `classifyInstance` + certified violet lock.
  - No Layer 2 elevation for selected / "My Tasks".

- **Staffing Calendar** (`src/policy/staffing/pages/StaffingCalendarPage.tsx` + components)
  - Dedicated `/staffing-calendar` route (read-only for most).
  - Views: list / week / month (default).
  - `MonthCalendarView.tsx`: 7-col grid, `gap: '1px'`, `background: 'var(--ci-border)'`, cells use `--ci-bg` / `--ci-surface-muted`, direct outline for today/selected. Shift chips: raw `background: 'var(--ci-surface)' + border`.
  - `WeekCalendarView.tsx`: similar 7-col day columns + `WeekShiftItem` raw surface styles.
  - No `PageHeader` + `ShellContentFrame` wrapper; plain padding + `DemoBanner`.
  - Uses legacy mock data (`mockShifts.ts` etc.), `shiftStore`.

### Supporting Systems
- **Stores:** `calendarStore.ts` (tasks + overrides + audit trail), `calendarSyncStore.ts` (Google sync + enforcement context), `usePmViewSprintStore`, `selectedTaskStore`, `autogenStore` (generated/triggered events).
- **PM Scheduling:** `src/policy/pm/scheduling/` (`sprintAllocator.ts`, `dependencyGraph.ts`), `weekendRule.ts` (hard `WeekendNotAllowedError` for compliance tasks; personal opt-in only), `sprintWindows.ts`, `taskProjection*`.
- **Regulatory Data:** `regulatoryEvents.ts`, `eventDisplayModel.ts`, `timelineState.ts` (TEAL_PRIMARY, STATE_COLOR, classifyInstance).
- **PM Views Integration:** `PmViews.tsx` (KanbanView, GanttView, SprintBoardView) — shared `TaskDetailRightPanel` across all calendar surfaces.
- **Components:** `SurfaceCard`, `RightDrawer`/`BottomSheetDrawer` (mobile details), many custom badges/chips.

### Audit / Design References
- `design/CALENDAR_VISUAL_PATTERNS.md` (Layer 1/2 glass cards, mobile agenda first, restrained urgency, CES/PM/Policy/Staffing unification).
- `Calendar_Reconstruction_Plan.md`, `Calendar_Canonical_Primitive_Usage.md`, `Calendar_Token_Application_Matrix.md`, `Calendar_Accessibility_Validation_Report.md` (all Phase 3 — note they are aspirational, not yet executed).
- `Review_02_Analysis_PostCompletion_4Sided_Contract_Violations.md` (explicit MasterCalendarPage citation + table showing "Partial" frame compliance, "No" interior breathing room).
- `GLASS_LAYERING_CHEAT_SHEET.md` (3-layer hard limit, desktop constrained max-width + visible Layer 0 on all 4 sides).
- Top-Picks mocks & screenshot indexes (calendar-specific mocks sparse; emphasis on unified operational surfaces).

---

## 2. Design Language Compliance Assessment

### 3-Layer Model
- **Layer 0 (Atmospheric):** Visible only around outer shell in some cases; calendar internals obliterate it via `h-full w-full` + `overflow-hidden`.
- **Layer 1 (Main Surface):** Attempted via `ci-premium-hero` / `ci-operational-card` on toolbar and `SurfaceCard` for empty states only. Grid wrapper and cells bypass.
- **Layer 2 (Elevated):** Almost absent inside grids. Chips use thin colored borders + soft bg tints (`STATE_SOFT[state]`). Selected uses `${color}18` but remains micro-flat. Staffing shift chips duplicate `--ci-surface` inline.
- **Layer 3:** Never (correct).

**Violation:** TimelineChip / MonthCalendarView day cells + WeekShiftItem are "flat solid" treatments on top of the grid, not elevated Layer-2 cards per spec. CALENDAR_VISUAL_PATTERNS.md explicitly calls for "Layer 1 glass for normal items", "Layer 2 with teal left border for My Tasks".

### 4-Sided Frame / Constrained View
- **Desktop Rule:** Main working surface must have `max-width` + side margins so Layer 0 frames all four edges of the primary glass panel.
- **Reality on Calendar:**
  - Master: `ci-page-container` provides some margin but `h-full w-full overflow-hidden` + inner `ci-content-grid` + grid `flex-1` causes content to kiss boundaries. Header rounded-xl helps locally but grid below does not.
  - Staffing: Direct `p-4 md:p-6 lg:p-8` inside whatever shell; no enforced `ShellContentFrame` + constrained breathing room.
- Result: "Magnification" (expensive frosted depth from visible backdrop) is lost. Grid reads as full-bleed dense table rather than a floating premium calendar surface.

### Calendar-Specific Anti-Patterns
1. **Gap-px / 1px border trick grids** — both TimelineMonth and staffing Month/Week views. Creates mechanical lines that fight glass softness.
2. **Raw cell backgrounds** (`--ci-cell-day`, `--ci-bg`, `--ci-surface-muted`) without SurfaceCard wrapper or consistent padding hierarchy.
3. **Micro-chips inside cells** — too small for glass treatment; text at 9–10px; no frosted sub-surface.
4. **Inconsistent mobile:** Master uses agenda list (good per patterns doc) but staffing list is sectioned with borders. No unified bottom-sheet + swipe patterns.
5. **PM sub-views (Kanban/Gantt/Sprint) inside calendar page** inherit the same root violation; boards use custom columns not yet standardized to BoardColumn primitive.
6. **Weekend / workload viz:** Functional in `weekendRule` + autogen but no dedicated visual treatment (e.g., subtle striping or badges for "weekend-blocked" or due-date heat).

### Positive Elements (Preserve)
- State-driven color only (teal/amber/red) — aligns with "color ONLY encodes state".
- MobileAgendaList + bottom sheet / right drawer.
- Cross-view task selection via `selectedTaskStore`.
- Autogen scheduler + July readiness preview matrix (nice data viz).
- Sync + enforcement integration.
- Weekend rule enforcement (hard guard).

---

## 3. Staffing vs. Master Calendar Divergence

- Master = "when" layer for regulatory + CES + PM tasks (dense, execution-focused).
- Staffing = operational shift coverage (open/filled/pending, acuity, discipline). Currently feels like a separate legacy app.
- Neither shares the same cell / chip primitives or visual language.
- Result: users experience two calendars with different aesthetics and interaction models.

---

## 4. Risks & Technical Debt

- **Visual Debt:** Highest on calendar surfaces per WAVE reports.
- **Accessibility:** Color-only status in grids (mitigated somewhat by badges but chips still thin); keyboard navigation of 42-cell grids untested at scale.
- **Mobile Density:** Month grids on phones become unusable without agenda default (Master does this; staffing does not enforce).
- **Sync Drift:** calendarSyncStore + autogen can produce conflicts not surfaced beautifully.
- **Reconstruction Plans Exist but Unexecuted:** Phase 3 docs assume prior surfaces (Dashboard) succeeded; Calendar was deferred.

---

## 5. Recommendations Snapshot (for 4-Phase Plan)

- Adopt `CALENDAR_VISUAL_PATTERNS.md` as binding spec.
- Introduce `CalendarDayCell` and `CalendarEventChip` primitives built on `SurfaceCard` + Layer tokens (subtle insets, left-border accents, restrained urgency).
- Enforce `ShellContentFrame` + constrained container on both calendar pages.
- Unify staffing calendar into the Master surface or make it a filtered sub-view.
- Visualize weekend rules and workload (due-date heat, sprint overlap) inside the grid cells.
- Path to approved mocks: first stabilize the glass frame, then iterate visual density against Top-Picks / generated calendar mocks.

**End of Analysis.** The calendar lens reveals the deepest tension between "dense operational data" and "premium layered glass" in the entire system. Fixing it will raise the perceived quality of every scheduling surface.

---

*Unique Calendar Lens Insight (repeated for emphasis):* The grid is not background — it is the surface. Treat every day cell as a deliberate Layer-1 or Layer-2 participant in the 3-layer contract, never as a flat table cell. Only then does the entire Master + Staffing calendar feel like expensive glass instead of a spreadsheet.