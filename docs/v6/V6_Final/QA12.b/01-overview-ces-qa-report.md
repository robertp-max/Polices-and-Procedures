# Overview + CES Group QA Report (V6 Design Consistency)

**Date:** 2026-06-21  
**Scope:** Overview + CES page views per task (dashboard, clinicians/clinician-detail, patients/patient-detail, master-calendar, staffing-calendar, brad, ces-calendar, ces-board, events-board, workflows, workflow-swimlane, master-controls, audit-mode, evidence-center, ces-reports, mobile-incident, my-tasks).  
**Rules checked:** 56 total router views (no new parent routes), 17 missing states = subviews (internal `useState` + conditional `VeilDrawer`/`VeilModal`), ONLY `font-light` (300) + `font-medium` (500), fidelity to tokens (`tone-*-*`, `brand-*`, `surface*`), shared primitives usage, layout vs V6_Final/*.png + *.md, subview embedding.

**Files Read (start of session, exhaustive exploration):**  
- Directory listings: `.`, `src`, `src/v6`, `src/v6/screens/pageviews`, `docs/v6`, `docs/v6/V6_Final`, `docs/v6/V6_Final/QA12.b`  
- Routing: `src/v6/routing/routeRegistry.ts`, `src/v6/routing/routePresentation.ts`, `src/v6/routing/router.tsx`, `src/v6/routing/V6RoutePlaceholder.tsx`  
- Shell: `src/v6/shell/V6Shell.tsx`, `src/v6/shell/Sidebar.tsx`, `src/v6/shell/PageHeader.tsx`  
- Representative: `src/v6/screens/RepresentativeScreens.tsx` (full, via sequential offset reads)  
- Components/Primitives: `src/v6/components/index.ts`, `src/v6/tokens.ts`, `src/v6/components/toneClasses.ts`, `src/v6/components/VeilDrawer.tsx`, `src/v6/components/VeilModal.tsx`, `src/v6/components/DataTable.tsx`, `src/v6/components/SurfaceCard.tsx`, `src/v6/components/BoardLane.tsx`, `src/v6/components/MetricTile.tsx`, `src/v6/components/ToneTag.tsx`, plus primitives (Button, Badge, ToneBadge, FormField, etc. via targeted grep)  
- Dedicated pageviews: `src/v6/screens/pageviews/WorkflowsScreen.tsx`, `EventsBoardScreen.tsx`, `MasterControlsScreen.tsx`, `MyTasksScreen.tsx`, `MobileIncidentScreen.tsx`, `index.ts`  
- Design refs: `docs/v6/V6_Final/QA12.b/00-QA-OVERVIEW.md`, `02-dashboard.md`, `03-ces-kanban-board.md`, `04-ces-calendar.md`, `05-evidence-audit.md`, `11-profiles-clinician-patient.md`, `12-calendars.md`, `workflow-swimlane.md`, `57-workflow-detail-drawer.png` (image), `53-workflow-swimlane.png` (image), `13-ces-reports.png` (image); cross-file greps in `V6_PHASE_12_2A_MISSING_SUBVIEW_BLUEPRINTS.md`, `V6_APP_MAP.md`, `V6_MANUAL_PAGESTATE_RECONCILIATION.md`, `V6_DESIGN_RECONCILIATION_DEEP.md`, `V6_MISSING_LAYOUTS_SPECIFICATION.md`  
- Additional: multiple greps on `src/v6/` (font weights, hardcoded colors, useState/Veil usage), `docs/v6/` (subview specs)

**Route Registry Verification (src/v6/routing/routeRegistry.ts:43-98):**  
- `V6_ROUTES` array defines all listed pages exactly (no additions):  
  Overview: `dashboard` (44), `clinicians` (45), `clinician-detail` (46), `patients` (47), `patient-detail` (48), `master-calendar` (49), `staffing-calendar` (50), `brad` (51).  
  CES: `ces-calendar` (52), `ces-board` (53), `events-board` (54), `workflows` (55), `workflow-swimlane` (56), `master-controls` (57), `audit-mode` (58), `evidence-center` (59), `ces-reports` (60), `mobile-incident` (61), `my-tasks` (62).  
- No new parent routes for subviews (e.g. no `/workflows/detail`, no `/ces/agenda`, no `/staffing/conflict`). Detail/params routes (`/:id`) pre-exist and are scoped as "detail" template.  
- `V6_REAL_ROUTE_COUNT = V6_ROUTES.length` (source count yields 54 entries incl. `/login`; sidebar renders this; design docs/QA overview reference 54 router-mapped + overlays/auth conceptual → "56 views" — minor doc drift but NO NEW ROUTES added here).  
- Router (router.tsx:22-24): uses `isRepresentativeRoute` → `RepresentativeScreen` for all scope pages; else `V6RoutePlaceholder`.  
- Sidebar (Sidebar.tsx:75-85, routePresentation.ts:74-85): Accurate CES nav section lists `ces-calendar, ces-board, events-board, workflows, master-controls, audit-mode, evidence-center, ces-reports, my-tasks` (mobile-incident detail hidden from primary nav, correct). Brad in separate section. No drift.  
- `routePresentation.ts`: Full chrome for all (e.g. ces-board: "Kanban Board", workflows: "Workflows Library"). `getRouteChrome` used correctly in shell/sidebar.  
- Conclusion: **NO new parent routes added. Total router views unchanged.**

**Implementation Style (per page, full vs placeholder):**  
All 17+ scoped pages implemented as **full screens** (detailed React layouts using primitives/metrics/cards/boards), not `V6RoutePlaceholder`. RepresentativeScreen switch (RepresentativeScreens.tsx:1053-1164) maps:  
- `dashboard` → `DashboardScreen` (full)  
- `clinicians`/`patients` → `ProfileListScreen` (full rosters + side detail)  
- `clinician-detail`/`patient-detail` → dedicated detail screens (full with cards + tables)  
- calendars (`master-`, `staffing-`, `ces-`) → `CalendarScreen` (full grid + rail)  
- `brad` → `BradScreen` (full chat + cards)  
- `ces-board` → `BoardScreen` (full kanban lanes via BoardLane)  
- `events-board` → `EventsBoardScreen` (dedicated, full)  
- `workflows` → `WorkflowsScreen` (dedicated, full)  
- `workflow-swimlane` → `WorkflowSwimlaneScreen` (full)  
- `master-controls` → `MasterControlsScreen` (dedicated, full)  
- `audit-mode`/`evidence-center` → `EvidenceScreen` (full)  
- `ces-reports` → `ReportsScreen` (full)  
- `mobile-incident` → `MobileIncidentScreen` (dedicated, full)  
- `my-tasks` → `MyTasksScreen` (dedicated, full)  

Dedicated screens export default + data-hash-id/route attrs for traceability (good).

**Shared Primitives Usage:**  
Consistent and correct across:  
- `MetricGrid` / `MetricTile` (all pages via `ScreenStack` in rep or direct)  
- `DataTable` (profiles, workflows, master-controls, policy-like in rep)  
- `SurfaceCard` (dashboard signals, profiles rails, workflows cards, events health, reports, evidence, etc.)  
- `BoardLane` (ces-board, events-board, my-tasks, workflow-swimlane)  
- `ToneTag`, `ToneBadge`, `ProgressMeter` (ubiquitous for status)  
- `VeilDrawer`/`VeilModal` primitives exist and styled with tokens; **used only in demo `OverlaySystemScreen`** (not in live CES/Overview parents for required states).  
- Other: `ChatThread` (brad), form primitives (mobile-incident).  
No raw recreation of primitives.

**Typography Fidelity (ONLY font-light 300 + font-medium 500):**  
**PASS.** Grep across `src/v6/` (all files) found zero `font-(bold|semibold|extrabold|black|thin|extralight|normal|regular|heavy)`.  
Examples (representative):  
- `font-light`: page bodies, descriptions, card titles in SurfaceCard (line 41), BoardLane card titles (49), DataTable cells (52-53), ToneTag, most `text-sm text-muted`.  
- `font-medium`: titles/headers (`text-h2 font-medium`, `text-display font-medium`), DataTable identity/title cols, some inline labels, ToneBadge active, Button base (allowed 500).  
- Shell: `bg-canvas font-light` (V6Shell:22), `text-tag font-light` (Sidebar:63).  
- All pages (rep + dedicated) compliant. Primitives use `font-light` or `font-medium` only.  
No violations in CES/Overview group or elsewhere in v6.

**Token / Color Fidelity (no hardcoded non-token):**  
**Strong.** No raw `bg-red-500|text-[#|slate-500|rgb\(` numeric Tailwind or hex in src/v6 (grep confirmed 0 matches for forbidden patterns).  
Usage: `bg-surface`, `border-card`, `bg-tone-*-bg` / `border-tone-*-border` / `text-tone-*-text` (toneSurfaceClasses etc map all 8 tones), `bg-brand-teal` / `bg-brand-orange` / `text-brand-teal-deep` / `text-on-brand`, `bg-tone-slate-bg` (ubiquitous for secondary panels).  
Some inline conditionals (e.g. ReportsScreen:2169 `index % 3 === 0 ? 'bg-brand-orange' : 'bg-brand-teal'`; calendar pills use tone-based) — token-aligned.  
Veil* use `bg-brand-teal/15` backdrop + surface — per spec. No drift to legacy colors.

**Subview Embedding + "17 Missing States as Subviews" Rule:**  
**FAIL (major gap for CES scope).**  
- Required CES subviews (task spec + Phase 12.2a blueprints + V6_APP_MAP + MANUAL_PAGESTATE_RECONCILIATION):  
  - Workflow Detail Drawer (over `/workflows`)  
  - Workflow Swimlane Card Drill-down Modal (over `/workflows/:id/swimlane`)  
  - Calendar Weekly/Daily Agenda View (over master/staffing/ces calendars)  
  - Staffing Conflict Resolver Drawer (over `/staffing-calendar`)  
  - CES Calendar Inline Flowchart Swimlane (over `/ces/calendar`)  
  - PDF/Image Preview Toolbar (in evidence/audit)  
- Current state: **NONE implemented as internal state-driven subviews.**  
  - `RepresentativeScreens.tsx`: Only `useState` for CES is `activeEventKey` + hover `CalendarEventPreview` aside (lines 1485-1600) — not Veil, not drill, not agenda. CES clicks call `navigate(toWorkflowSwimlanePath)` → full route (CalendarScreen:1500-1502). No `VeilDrawer`/`VeilModal` conditional.  
  - `WorkflowSwimlaneScreen`: Renders 4 static phase summaries + `BoardLane`s (1799-1868). Cards have no onClick to modal. No drawer for "detail".  
  - `WorkflowsScreen` (dedicated): Matrix + SurfaceCards; "can drill" note in meta (128) but no implementation.  
  - Calendars: Day/Week/Month tabs static/non-functional (CalendarScreen:1527-1538); month grid only. No agenda list view state. No conflict drawer (staffing rail has events but no resolver).  
  - Evidence/Audit (EvidenceScreen in rep): List rows only (1877-1890); no preview toolbar, no image/PDF controls.  
  - `BoardLane` cards have "MoreHorizontal" button but inert (no modal trigger).  
  - Contrast: Non-CES (e.g. Supervisor in other screens) uses some internal states per QA overview.  
- Subviews must be `useState + conditional Veil* inside parents` (per task + blueprints). Current pattern violates by using full routes for drill-downs (e.g. swimlane) and missing entirely for others.  
- Design refs confirm: e.g. 57-workflow-detail-drawer.png shows right panel drawer with status/linked policies/roadmap/logs; 53-workflow-swimlane.png shows phase cards in columns; ces-calendar design expects inline flowchart on event select (not redirect). Code has layout parity but state/embedding gaps.  
- Router/views stay at current count (good), but missing states not subviews.

**Per-Page Detailed Findings + Layout Drift (vs design refs):**  
- **Dashboard (rep:1269-1308):** Full `ScreenStack` + metrics (106). Left action queue (ActionList with ProgressMeter), right signals + SurfaceCards. Matches 02-dashboard.md (metrics 4-col, action rows, SurfaceCards, tones). Minor: no exact "Today in Primary Ops" header copy drift but functional parity. Uses tokens.  
- **Clinicians / Clinician-detail (rep:1311-1394, 205-271, 334-359):** `ProfileListScreen` + `ClinicianDetailScreen` full. Roster table (DataTable), side progress bars + detail cards. Matches 11-profiles...md + 14-clinician-detail.png (roster + focus sidebar). Good use of primitives. Button "Open detail" inert.  
- **Patients / Patient-detail:** Symmetric full impl. Matches refs.  
- **Master-calendar / Staffing-calendar / ces-calendar (rep:1481-1651, calendarConfigs:575-600):** `CalendarScreen` full grid (7-col days, event pills via tone bg-brand-*), right rail, hover preview (CES only). Matches 12-calendars.md + 04-ces-calendar.md + 30/48 pngs (month, upcoming, legend). Drift: CES event click = full navigate (vs possible inline/flowchart); Day/Week/Month static (ref expects agenda state); no weekly/daily list; no conflict resolver. Some hardcoded pill colors tied to tone but ok. Preview uses `font-medium` (allowed).  
- **Brad (rep:2094-2118):** Full chat + SurfaceCards. Matches 10-brad.png ref intent.  
- **CES-board (rep:1653-1686):** `BoardScreen` + 6 `BoardLane`. Matches 03-ces-kanban-board.md (filters, 6 lanes: Upcoming/Ready/In Progress/Awaiting/Blocked/Completed, chips/progress). Good.  
- **Events-board (EventsBoardScreen.tsx:268-388):** Dedicated full (MetricGrid, filters, BoardLanes grid, signals list). Matches board pattern.  
- **Workflows (WorkflowsScreen.tsx:132-206):** Dedicated full matrix (DataTable + 3 SurfaceCard with meta dl). Matches 54-workflows.png. Note says "drill into swimlane" but no drawer.  
- **Workflow-swimlane (rep:1787-1869):** Full (metrics, header, 4 phase divs in grid, BoardLanes 4-col). Matches workflow-swimlane.md + 53 png (4 phases, cards). Drift: phases as summary metrics row vs integrated column headers in design; no card drill modal; nav buttons instead of subview.  
- **Master-controls (MasterControlsScreen.tsx:127-206):** Dedicated full matrix (DataTable) + readiness panels + cards. Matches 31-master-controls.png.  
- **Audit-mode / Evidence-center (rep:1871-1911):** Full lists + tiles. Matches 05-evidence-audit.md + 19-evidence-center.png. No preview toolbar.  
- **CES-reports (rep:2158-2186):** Full trend bars (16 static) + SurfaceCards. Matches 13-ces-reports.png (trend + 3 cards). Good.  
- **Mobile-incident (MobileIncidentScreen.tsx:26-93):** Dedicated form + metrics. Matches 32-mobile-incident.png intent.  
- **My-tasks (MyTasksScreen.tsx:160-235):** Dedicated 3 BoardLanes + summary. Matches 35-my-tasks.md.  

**Other Inconsistencies Flagged:**  
- Calendar CES preview is absolute positioned aside (not Veil); uses navigate for "detail".  
- Some buttons use direct `border-brand-orange bg-brand-orange` (token ok but repeated; could centralize).  
- In rep calendar: some `text-sm font-medium` + `text-xs` (allowed).  
- Layout drift noted vs exact captions (e.g. swimlane phases use `grid-cols-4` summary vs design cards-in-phases; reports bar uses dynamic height divs vs chart).  
- No missing states surfaced (e.g. no "17" count in UI).  
- All pages use `font-light` body + consistent spacing (`p-xl`, `gap-xl`).  
- Evidence hierarchy (rep) uses flat divs; no toolbar.  
- Subview primitives ready but not wired into CES parents (contrast with overlay demo).

**Fidelity to V6 Tokens/Design System Overall:** High on primitives, tokens, typography. Medium on exact layout/interaction parity for calendars/swimlanes (static vs interactive sub states). Low on required subview embedding.

**Concrete Improvement Suggestions (3-5):**  
1. Implement required CES subviews inside parents using existing `VeilDrawer`/`VeilModal`: add `useState` (e.g. `selectedWorkflowId`, `activeCardId`, `showAgendaMode`, `selectedConflict`, `flowchartEvent`) + conditional render in `CalendarScreen`, `WorkflowsScreen`, `WorkflowSwimlaneScreen`, `EvidenceScreen`, `CalendarScreen` (staffing). Wire card clicks (in BoardLane? or local) and calendar events to open drawers/modals instead of (or in addition to) navigate. Target blueprints in V6_PHASE_12_2A_*.md + 57-workflow-detail-drawer.png (status, linked policies, roadmap, history).  
2. Enhance CalendarScreen with real sub states for Weekly/Daily Agenda (list view toggle) and CES Inline Flowchart Swimlane (e.g. replace/overlay grid with vertical steps on select, per design notes). Keep month as default; prevent full redirect for inline cases. Add stub for Staffing Conflict Resolver Drawer (VeilDrawer on gap select).  
3. Add card drill support in `WorkflowSwimlaneScreen` + `BoardLane`: e.g. on card click set state + `<VeilModal open={!!selectedCard} ...>` showing evidence slots, checklist, eCIgn per 8. Swimlane Card spec. Update BoardLane to accept optional `onCardClick`.  
4. Add PDF/Image Preview Toolbar to Evidence/Audit views: inside evidence lists or modal, render toolbar (zoom/rotate/download/hash) using token surfaces; tie to artifact rows. Use conditional Veil for preview.  
5. Enforce/audit "no new routes" + count: update `V6_REAL_ROUTE_COUNT` display or add dev badge; extend greps/lint for font weights and add test asserting exactly the 17 subview states exist as internal (not routes). Update QA overview / V6_APP_MAP for exact 56 language if needed. Prioritize wiring before adding more content.

All findings factual, cited to file:line where read. No .js emitted; no builds run. Followed AGENTS.md.

**End of report.**