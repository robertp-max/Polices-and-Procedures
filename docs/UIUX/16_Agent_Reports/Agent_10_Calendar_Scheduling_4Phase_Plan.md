# Agent 10: Calendar, Scheduling & Master Tasks — 4-Phase Plan

**Subagent:** 10 — Calendar, Scheduling & Master Tasks Specialist  
**Primary Lens:** MasterCalendarPage, staffing calendar, task scheduling, weekend rules, workload / due-date visualizations + dedicated calendar visual language  
**Date:** 2026-05-17  
**Reference Design:** `design/CALENDAR_VISUAL_PATTERNS.md` (Layer 1/2 glass, mobile agenda, restrained urgency, unified CES/PM/Policy/Staffing)  
**Governing Contracts:** 3-Layer Model (GLASS_LAYERING_CHEAT_SHEET.md), 4-Sided Constrained Frame (Review_02_4Sided_Contract_Violations.md), Phase 3 Reconstruction Plans (Calendar_Reconstruction_Plan.md, Calendar_Canonical_Primitive_Usage.md)  
**Goal:** Deliver beautiful, scannable glassmorphic calendars that respect the outer ShellFrame magnification while matching any approved calendar mockups. Functional parity on weekend rules, autogen, sync, sprint/kanban/gantt, and workload viz must be preserved and elevated visually.

---

## Phase Overview (4-Phase)

**Phase 0 (Foundation — Immediate):** Shell + Frame Compliance (non-negotiable prerequisite).  
**Phase 1 (Visual Language):** Dedicated Calendar Visual Language Implementation.  
**Phase 2 (Unification & Density):** Staffing + Master Merge + Workload Visualizations.  
**Phase 3 (Mock Fidelity & Polish):** Approved Mock Matching + Production Hardening.

Each phase produces a surface checklist sign-off, accessibility delta report, and visual regression capture against calendar-specific mocks.

---

## Phase 0: Shell + 4-Sided Frame Compliance (1–2 days)

**Objective:** Eliminate `h-full w-full overflow-hidden` full-bleed roots so every calendar surface sits inside a properly padded, rounded `ShellContentFrame` / `ci-glass-panel` with visible Layer 0 on all four desktop edges.

**Tasks**
- Audit & patch `MasterCalendarPage.tsx:246` root div:
  - Remove `h-full w-full overflow-hidden`.
  - Wrap primary content (header + grid or sub-views) inside the single `ShellContentFrame` supplied by `CommandCenterLayout` (do not nest additional frames).
  - Ensure `ci-page-container` only provides the constrained max-width + gutters; let the outer shell deliver the frosted border + shadow.
- Patch `StaffingCalendarPage.tsx`:
  - Migrate to `PageHeader` + `ShellContentFrame` pattern used by reference surfaces (Dashboard/Evidence).
  - Remove direct `p-4 md:p-6 lg:p-8` full-width treatment; respect safe-area on mobile.
- Update `TimelineMonth`, `MonthCalendarView`, `WeekCalendarView` wrappers:
  - Wrap the entire weekday-header + grid block in a single `SurfaceCard` (or new `CalendarSurface` variant) with `padding="none"` + internal consistent cell treatment.
  - This creates the "one glass panel" illusion around the grid.
- Verify in `App.tsx` / `CommandCenterLayout.tsx` that `/calendar` and `/staffing-calendar` routes inherit the outer frame without page-level overrides.
- Update any `ci-content-grid` usage inside calendar to respect the new constrained parent.

**Deliverables**
- Updated 4-Sided Contract Compliance table entry for Calendar (was "Partial / No").
- Screenshot set: desktop + mobile, light + dark, showing visible Layer 0 gutters around the calendar glass block.
- Zero regression on existing event selection, PM view switching, or mobile bottom-sheet flows.

**Exit Criteria:** `Review_02` style audit passes for Calendar; `ci-page-container` + inner content no longer kisses frame edges.

---

## Phase 1: Dedicated Calendar Visual Language (Core — 3–4 days)

**Objective:** Implement `CALENDAR_VISUAL_PATTERNS.md` as executable code. Introduce calendar-specific primitives that feel like glass while supporting dense 42-cell grids.

**1.1 New / Refactored Primitives (under `src/policy/components/calendar/` or `regulatory/` + staffing shared)**
- `CalendarSurface.tsx`: Thin wrapper = `SurfaceCard` + calendar-specific tokens (subtle internal grid lines via hairline borders or very low-opacity pseudo-elements, never gap-px heavy).
- `CalendarDayCell.tsx`: 
  - Respects Layer 1 by default (frosted tint via `--ci-glass-layer1` or equivalent).
  - Out-of-month: stronger fade + Layer 0 tint.
  - Today: Layer 2 promotion (subtle raised border + teal ring or soft glow).
  - Selected / active: teal left border accent (per patterns doc) + elevated bg.
  - Uses `SurfaceCard` internally for chips when density allows, or micro-inset treatment.
- `CalendarEventChip.tsx` / `CalendarShiftChip.tsx` (unified):
  - Layer 1 glass for normal regulatory / shift items.
  - Layer 2 with teal left rail for "My Tasks" or user-owned.
  - Overdue: restrained orange left border + small "Overdue" badge (never full red flood).
  - Certified/locked: violet rail + Lock glyph (existing pattern preserved).
  - Information hierarchy exactly as spec: Title (bold), Time, Patient/Policy, Status badge, Assignee.
- `CalendarGridHeader.tsx`: Weekday labels as part of the outer glass surface (no separate row bg).
- Mobile: `CalendarAgendaList.tsx` (enhance existing `MobileAgendaList`) + swipe actions per patterns.

**1.2 Token & Style Integration**
- Extend `index.css` with calendar-specific CSS vars only if unavoidable; prefer component-level use of existing `--ci-state-*`, `--ci-glass-*`, `STATE_SOFT` + new `CALENDAR_LAYER_1_INSET`, `CALENDAR_CELL_SUBTLE_BORDER`.
- Eliminate all raw `gap: '1px'` / `background: 'var(--ci-border)'` tricks inside calendar grids. Replace with single outer border + internal `border-r border-b` on cells at 5–8% opacity (glass-friendly).
- Enforce font sizes per patterns (mobile 13px title minimum).
- Light mode: rely on layered shadows + hairlines (per glass cheat sheet).

**1.3 Apply to Both Surfaces**
- Master: Replace `TimelineChip` + `DayCell` with new primitives. Preserve `classifyInstance` + certified logic.
- Staffing: Refactor `MonthCalendarView`, `WeekCalendarView`, `ShiftCard` → use unified `Calendar*` chips + cells. Status dots become `CiStatusBadge` or calendar-equivalent.
- PM sub-views (inside Master): Ensure Kanban/Gantt/SprintBoard also use the same chip language for consistency when embedded.

**1.4 Weekend Rule & Scheduling Visuals (Early)**
- Add subtle visual affordance for weekend-blocked cells (very faint diagonal or "— weekend rule" micro-label on hover/empty cells).
- Integrate `isWeekend()` + `WeekendNotAllowedError` into cell rendering (read-only striping or lock icon on compliance events landing on Sat/Sun).
- Workload / due-date viz: small heat indicators or count badges per cell (overdue count in amber, sprint overlap in teal).

**Deliverables**
- New `src/policy/components/calendar/` directory with primitives (or colocated).
- Updated `Calendar_Canonical_Primitive_Usage.md` with actual code paths.
- Token application matrix for calendar cells/chips.
- Visual regression baseline of the new language (desktop grid, mobile agenda, week view, embedded sprint board).

**Exit Criteria:** Every calendar item uses documented Layer 1 or Layer 2 treatment. No more raw inline `background: 'var(--ci-surface)'` inside grids. CALENDAR_VISUAL_PATTERNS.md "Do’s and Don’ts" checklist passes internal review.

---

## Phase 2: Unification, Workload & Cross-View Fidelity (2–3 days)

**Objective:** Make staffing calendar a first-class filtered view or tab within the Master surface. Deliver workload / due-date visualizations. Ensure weekend rules and PM scheduling projections are first-class visual citizens.

**2.1 Surface Unification**
- Evaluate: Merge `/staffing-calendar` into `/calendar?tab=staffing` (or keep separate but identical primitives).
- Share the same `useCalendarSyncStore`, event model where possible (shifts as special "staffing" regulatory-like events?).
- Filters (`CalendarFilters`) become consistent with Master regulatory + PM filters.

**2.2 Integrated Visualizations**
- Cell-level workload: mini Gantt bars or stacked status dots showing sprint overlap, policy deadline density, open shift count.
- Due-date heat: background tint intensity or corner accent proportional to "days until SLA" (restrained, never alarming).
- Weekend rule enforcement viz: when autogen or manual scheduling attempts weekend for compliance source, surface the exact error in the preview matrix + cell tooltip.
- Master task projection + autogen events rendered alongside shifts in staffing view (toggleable layers).

**2.3 Interaction Parity**
- Drag-to-reschedule (where permissions allow) — respect weekend rule guard + show live preview of new state classification.
- Unified right panel / bottom sheet: same `TaskDetailRightPanel` + execution panel for both staffing shifts and regulatory events.
- Deep links: `/calendar?date=...&type=shift|event|task`.

**2.4 Stores & Logic Hardening**
- Ensure `calendarStore`, `calendarSyncStore`, `autogenStore`, `shiftStore` play nicely (possible adapter layer).
- `pm/scheduling/` weekend + dependency rules feed visual warnings inside calendar cells.
- Performance: virtualize or paginate dense months if 100+ events/shifts.

**Deliverables**
- Updated `MasterCalendarPage` + `StaffingCalendarPage` sharing primitives.
- New workload visualization components (documented in `CALENDAR_VISUAL_PATTERNS.md` extension).
- Sprint / Kanban / Gantt views inside calendar now visually coherent with the new day-cell language.
- `pm/scheduling/` + `weekendRule.ts` usage matrix for calendar.

**Exit Criteria:** Staffing and Master feel like one product. A user can move from regulatory deadline → staffing coverage need → sprint task without visual context switch. All scheduling rules have visible representation.

---

## Phase 3: Approved Mock Matching + Production Hardening (2–3 days)

**Objective:** Iterate the implemented visual language until it matches any locked calendar mockups (Top-Picks, generated, or future `V2_MOCKUP_GENERATION_BRIEF.md` calendar variants) while never sacrificing the glass 4-sided frame.

**3.1 Mock Fidelity Loop**
- Inventory all calendar-related mocks and screenshots (audit indexes, `_Heavy/.../screenshots/`, `tmp-ui-verify-screenshots/`, Builder mocks).
- Side-by-side review: current Phase 1/2 output vs. mocks.
- Adjustments limited to:
  - Density & typography tweaks within token system.
  - Exact left-border accent weights, badge placements, empty-day microcopy ("No tasks scheduled. Enjoy the breathing room.").
  - Mobile agenda vs. week/month toggle behavior.
- Preserve glass framing at every iteration — no "just this once" full-bleed exceptions.

**3.2 Edge & Production Polish**
- Empty states, loading skeletons (match agenda card layout), error states for sync failures.
- Keyboard: full roving tab + arrow navigation inside grids + ARIA grid roles (per Calendar_Accessibility_Validation_Report).
- Responsive matrix: phone (agenda default), tablet (split), desktop (grid + right panel).
- Theme parity: light mode shadows + hairlines fully exercised on calendar.
- Performance & a11y sign-off reports.
- Sync status polish (lastBulkSync UI already good; make it a calm persistent indicator inside the glass header).

**3.3 Documentation & Handoff**
- Final update to `Calendar_Reconstruction_Plan.md`, `Calendar_Token_Application_Matrix.md`, `CALENDAR_VISUAL_PATTERNS.md` (add "Implementation Notes" section with real component paths).
- Add calendar examples to `COMPONENT_USAGE_EXAMPLES.md` and `CONTENT_MICROCOPY_GUIDELINES.md`.
- Visual regression + accessibility delta vs. Phase 0 baseline.

**Exit Criteria:** 
- Calendar surfaces pass the same surface checklist as Dashboard/Evidence (see `SURFACE_CHECKLISTS/`).
- Zero raw values, 100% primitive usage.
- Matches approved mocks within 2px / token tolerance while the 4-sided Layer 0 backdrop remains clearly visible on desktop.
- All weekend, autogen, sync, PM cross-links, workload viz function and look premium.

---

## Cross-Cutting Governance & Validation (Every Phase)

- **Surface Checklist:** Extend `SURFACE_CHECKLISTS/Dashboard.md` template for Calendar (or create `Calendar.md`).
- **Accessibility:** Run full protocol from `Calendar_Accessibility_Validation_Report.md` each phase end (color contrast on chips, 44px targets on mobile cells, grid ARIA, focus indicators that don't break glass).
- **Visual Regression:** Capture before/after for every grid view + mobile + light/dark.
- **Token Hygiene:** All new calendar styles go through `Token_Application_Matrix_Shell.md` process.
- **Dependencies:** Phase 0 blocks everything. Phase 1 must be complete before Phase 2 unification (so primitives exist to share).
- **Rollback:** Each phase tagged; calendar can be feature-flagged via `pm/featureFlags.ts` if needed.

---

## Success Metrics (Calendar Lens Specific)

- Desktop: ≥24px visible Layer 0 margin on all four sides of the primary calendar glass block.
- Cell treatment: every day cell reads as intentional glass micro-surface (subjective + measured via contrast / elevation tokens).
- Mobile agenda usage: >60% of mobile sessions default to list (measured via analytics or heuristic).
- No more than 2 visual families for events/shifts across Master + Staffing.
- All scheduling rules (weekend, SLA, sprint windows) have at least one visible affordance in the grid.
- Time-to-first-insight on a busy month: user can identify overdue vs. on-track in <3 seconds (testable).

---

## Risk Register & Mitigations

- **Risk:** Dense months (50+ events) make glass cells too small.  
  **Mitigation:** Smart truncation + "+N more" always opens the unified detail panel; default mobile to agenda.
- **Risk:** Unification breaks existing staffing users.  
  **Mitigation:** Keep `/staffing-calendar` alias during transition; progressive enhancement.
- **Risk:** New primitives increase bundle.  
  **Mitigation:** Tree-shake; colocate with existing regulatory components where possible.
- **Risk:** Mock drift during Phase 3.  
  **Mitigation:** Lock mock set at start of Phase 3; any new mock requires re-baseline of entire plan.

---

## Final Deliverables Across All Phases

- Two fully glass-compliant calendar surfaces (`/calendar` and staffing) sharing a single visual language.
- `src/policy/components/calendar/` (or integrated) primitives + usage docs.
- Complete token + primitive matrices for calendar.
- Updated reconstruction + accessibility reports marked "executed".
- Visual + interaction parity with approved mocks while preserving the expensive 4-sided glass frame.
- Weekend rules, workload viz, PM integrations elevated to first-class beautiful citizens.

**Calendar is the "when" layer.** When Phase 3 completes, users will feel the system is reliable, calm under pressure, and expensive — exactly as `CALENDAR_VISUAL_PATTERNS.md` demands.

---

*This plan is the direct, lens-specific path from current flat-grid reality to premium layered-glass calendar future. Execute sequentially. No shortcuts on the frame.*