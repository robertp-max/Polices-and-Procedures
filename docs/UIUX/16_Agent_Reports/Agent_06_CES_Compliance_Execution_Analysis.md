# Agent 06 — CES Compliance Execution Surfaces Analysis

**Subagent:** 06 — Compliance Execution System (CES) Surfaces Specialist  
**Primary Lens:** CES Board, My Tasks, Task Detail, Workloads, Reports, Calendar + ces/pages/, ces/components/, ces/layouts/, ces/theme.ts, primitives, compliance-execution/* stores  
**Date:** 2026-05-17  
**Reference Mocks:** Desktop/v2/04_CESBoard_Desktop_v2.jpg, 10_CESMyTasks_Desktop_v2.jpg, Mobile/v2/02_CES_Board_Mobile_v2.jpg + design/CES_BOARD_VISUAL_LANGUAGE.md, TASK_URGENCY_HIERARCHY_SPEC.md, GLASS_LAYERING_CHEAT_SHEET.md

---

## Executive Summary

The CES experience remains **largely untouched by the canonical one-glass system** (CommandCenterLayout + `--glass-main`, `.glass-interactive`, `.ci-premium-panel`, SurfaceCard, deep-maroon/TravelightBG single-canvas architecture defined in `src/index.css` and `CommandCenterLayout.tsx`).

- **Glass adoption in CES surfaces:** ~5-8% (limited to incidental `ci-premium-*` and `ci-bg-ces-*` utility classes in `MyTasksPage.tsx`; zero usage of core glass primitives or glass-interactive inside `ces/` tree).
- **CES Board / Kanban / Task Cards:** Deliver functional enforcement-driven drag-and-drop and state visibility but **do not match the intended calm authority + urgency hierarchy** of the v2 mocks. Current implementation uses solid white/canvas backgrounds, top-bar accent colors, and 6-state columns with event swimlanes. Mocks show frosted dark-navy glass cards, layered elevation, 4-column (Backlog/In Progress/Review/Done) or grouped layouts, left urgency borders, teal/orange progress affordances, and subtle glass-on-glass surfaces.
- **CES sub-brand isolation is intentional** (Lead 16 C14 amendment: navy `#1F4A8A` family as distinct CES identity; teal only as accent). This creates justified parallel token surface (`ces/theme.ts` + `--ces-*` mirror in `index.css`) but also parallel visual debt.
- **Core value prop at risk:** CES is the "compliance-defensible" operational surface. Visual calm directly translates to clinician trust and auditor defensibility. Current legacy card language undermines that.

**Overall maturity:** Pre-v2, pre-glass, high visual debt on the highest-traffic compliance surfaces. Partial recent modernization (premium classes in MyTasks, role review diagnostics, obligation unification) shows forward motion but is inconsistent.

---

## Key Locations Analyzed

### CES Surfaces & Code
- **Pages** (`src/policy/ces/pages/`):
  - `CesBoardPage.tsx` → `SprintExecutionBoard.tsx`
  - `MyTasksPage.tsx` (heavy use of obligations + review mode)
  - `CesWorkloadsPage.tsx` → `WorkloadDistribution.tsx`
  - `CesReportsPage.tsx` → `ExecutiveReports.tsx` (SVG charts)
  - `CesCalendarPage.tsx` → `ComplianceCalendar.tsx`
  - `CesDashboardPage.tsx` (delegates to MasterCalendarPage)
- **Layouts:** `CesLayout.tsx` (canvas + white header context bar; rendered inside global CommandCenterLayout)
- **Components:**
  - `board/`: `SprintExecutionBoard.tsx`, `ExecutionUnitCard.tsx`
  - `details/`: `WorkflowDrawer.tsx`, `SprintTaskPanel.tsx` (mixed hardcoded light colors + some glass-like rgba)
  - `workloads/`: `WorkloadDistribution.tsx` (table + CesCard)
  - `reports/`: `ExecutiveReports.tsx` (CesCard + pure SVG)
  - `primitives.tsx`: `CesCard`, `ComplianceStateBadge`, `PhaseIndicator`, `AuditReadinessTag`, `UserAvatar`, `EscalationTimer`, `KV` (all inline CES_TOKENS styles)
  - `review/`: `CesRoleReviewSwitcher.tsx`, `RobertCesReviewLayer.tsx`
  - `dashboard/`: `CesExecutiveDashboard.tsx`
  - `calendar/`: `ComplianceCalendar.tsx`
- **Theming:** `ces/theme.ts` (full navy/orange/green/red semantic set + `useCesTokens()` hook; dark variant teal shift)
- **Stores / Data:** `compliance-execution/` (complianceExecutionStore.ts, useEventExecutionDataflow, eventTaskAdapter, stateMachine, selectors, types), `ces/obligations/` (useObligations + selectors), `cesExecutionMode.ts`, `cesReviewMode.ts`, `cesRoles.ts`

### Supporting System
- `src/index.css`: `--ces-*` palette block (mirrors theme.ts), `.ci-bg-ces-*`, `.ci-text-ces-*` utilities, legacy `.glass-*` reduced to flat helpers, premium classes (`.ci-premium-panel`, `.ci-premium-hero`, `.ci-command-rail`, `.ci-subtle-hover`)
- Global shell: `CommandCenterLayout.tsx` (one-glass maroon), `PolicyCommandCenterApp.tsx`
- PM / shared: `SprintScopeToolbar`, `usePmViewSprintStore`, `selectedTaskStore`

No CES file imports or uses `glass-morphism`, `glass-interactive`, `SurfaceCard` (except incidental), or the main glass canvas treatment.

---

## Glass System vs Older Patterns — Quantitative & Qualitative

### Canonical Glass System (Reference)
- Single deep translucent maroon glass shell (`--glass-main`, large constrained canvas with `shadow-glass`).
- Flat-on-glass content (no stacked sub-cards). Uses `TravelightBG`, `.glass-interactive`, `on-glass-section`.
- Premium evolution: `.ci-premium-panel` / `.ci-premium-hero` (color-mix + subtle transparency on `--ci-surface`).
- Light mode: solid white surfaces; Dark (Navy): rich navy glass + teal accents.
- Components: `CommandCenterLayout`, `SurfaceCard`, modern `ui/` primitives.

### CES Current State
- **Own sub-brand contract**: `ces/theme.ts` + mirrored `--ces-*` CSS vars. Navy is **not** to be replaced by CI teal. Dark mode: navy → readable teal.
- **Card / Surface primitives**: `CesCard` = `rounded-xl shadow-sm` + `background: t.white` + border. Solid, not glass. All primitives use direct `style={{ background: CES_TOKENS.xxx, color: ... }}` or Tailwind + inline.
- **Board (SprintExecutionBoard)**: 6-column grid (`upcoming | ready | in_progress | awaiting_signature | blocked | completed`), event swimlanes, column tints via `columnTint` (canvas/navySoft/orangeSoft/redSoft/greenSoft), solid cards with 3px top accent bar + `shadow-sm`.
- **MyTasks**: Mix of `ci-bg-ces-canvas`, `ci-premium-hero`, `ci-premium-panel`, `ci-command-rail`, `ci-subtle-hover` + direct `style` with `CES_TOKENS`. List rows (not glass cards). Robert diagnostics overlay is hardcoded dark panel.
- **Workloads**: Traditional `<table>` inside `CesCard` + `CapacityBar` (canvas bg + navy fill) + `SummaryStat` white cards.
- **Reports**: 6 `CesCard` + custom SVG bar/line charts (no glass, no premium).
- **Drawers / Panels**: White backgrounds + simple `bg-black/30 backdrop-blur-sm` (not matching full glass layering).
- **SprintTaskPanel**: Some `border-white/10 bg-white/[0.02]` (glass attempt) but overridden by hardcoded `#1F1C1B` light text and fixed navy tones — inconsistent.
- **Calendar**: CesCard + legend using CES tokens.

**Conclusion:** CES runs a complete parallel design system. Glass migration work has not reached it. The "one-glass" philosophy and v2 mock visual language are absent.

---

## Board / Kanban / Task Cards vs v2 Mocks — Gap Analysis

**Current (Code):**
- Functional: Drag with `canTransitionState` enforcement + snap-back + flash warnings.
- 6 compliance states as columns.
- Cards: white bg, top colored bar (navy/orange/red/green), badges stacked, signers avatars, escalation timer, owner + due footer, audit score.
- Swimlanes per event.

**v2 Mocks (04_CESBoard_Desktop_v2.jpg, Mobile 02_CES_Board_Mobile_v2.jpg + spec):**
- Deep navy dark glass canvas.
- 4 primary columns (Backlog / In Progress / Review / Done) — or grouped swimlanes with frosted cards.
- **Card anatomy (calm authority + urgency):**
  - Frosted semi-transparent dark glass surface, subtle border + soft shadow/elevation.
  - Layer system: Layer 1 normal, Layer 2 selected/focused (stronger + teal left accent), Layer 3 critical (orange/red left border + stronger elevation — used sparingly).
  - Top: Title (bold), meta (patient/unit), progress bar (teal fill for in-progress).
  - Status: Small rounded badges + icons (check teal, clock orange, X red).
  - Avatars with status rings.
  - Due date + escalation clearly visible.
  - Subtle + / ... affordances.
- Urgency hierarchy (from TASK_URGENCY_HIERARCHY_SPEC.md): Teal (complete/on-track), restrained orange (due today/action), red (overdue/blocked — rare). Never color-only; always text + icon + border.
- Calm premium: Generous padding, excellent contrast, no chaos even with many items. Dark navy glass aesthetic conveys authority.

**Gap:** Current cards are light-mode solid legacy. No glass frosted effect, no left-border urgency system, wrong column count/state model, top-bar instead of layered left accent + progress. Does not deliver "calm authority."

**My Tasks (10_CESMyTasks_Desktop_v2.jpg):** Mock shows premium dark glass table/list with teal progress indicators, priority chips, clean filters, soft rounded panels. Current is usable list with mixed ci-premium + solid rows — closer but not matching density, elevation, or dark glass treatment.

**Workloads & Reports:** Mocks imply visual cards/bars/donuts in glass containers; current = dense table + SVG charts on white cards.

**Calendar / Drawer / Detail:** Similar legacy panel treatment vs glass.

---

## Unique CES Lens Insight + Summary

**CES is not just another surface — it is the daily operating system for regulatory defensibility.** Every visual decision (card clarity, urgency signaling, calm glass density) directly affects:
- Clinician/DON ability to act correctly under time pressure.
- Audit defensibility (clear state machine + evidence trail visible at a glance).
- Organizational trust ("this system looks like it won't let us miss a signature").

The intentional navy sub-brand (distinct from CI-ION teal/maroon) is a strength for vertical identity, but it has produced a **parallel universe of components** (`CesCard` vs `SurfaceCard`, full primitives set, 6-state model) that now blocks the global glass modernization wave.

**Highest-leverage surfaces for "compliance-defensible value prop":**
1. Board (daily command view)
2. My Tasks (personal accountability)
3. Workloads (capacity risk visibility)
4. Task Detail / Drawer (evidence + signature closure)

Current implementation is **robust in logic** (enforcement, obligations unification, role review, sandbox/future-lock) but **visually pre-premium**. It risks looking like an internal tool instead of the authoritative calm interface the mocks promise.

**Key risk:** If CES stays on legacy cards while the rest of the app goes full Navy Dark glass, users will perceive inconsistency and lose confidence exactly where defensibility matters most.

---

## Surface-by-Surface Status Matrix

| Surface              | Glass Adoption | Matches v2 Mock Visuals? | Primary Debt                          | Urgency Hierarchy? |
|----------------------|----------------|---------------------------|---------------------------------------|--------------------|
| CES Board / Kanban   | 0%            | No (6-col solid cards)   | Column model, card anatomy, no glass | Partial (top bars) |
| ExecutionUnitCard    | 0%            | No                       | Solid white + top accent             | Top-bar only      |
| My Tasks             | ~20% (ci-premium) | Partial               | List rows, mixed tokens              | Badges            |
| Workloads            | 0%            | No (table)               | Table vs visual owner cards          | Risk dots         |
| Reports              | 0%            | No                       | CesCard + raw SVG                    | None              |
| Calendar             | 0%            | Partial                  | CesCard                              | Legend only       |
| WorkflowDrawer       | 0%            | No                       | Solid white panel                    | Badges            |
| SprintTaskPanel      | Low (rgba hacks) | Partial                | Hardcoded colors                     | Sections          |
| CesLayout            | 0%            | N/A (sub-layout)         | White header + canvas                | Escalation bell   |
| Primitives (CesCard) | 0%            | No                       | Legacy solid card                    | N/A               |

---

## Strengths (Preserve)
- Strong domain logic (state machine, enforcement, obligations as single source, role backfill, sandbox modes).
- Event swimlanes + drag semantics.
- Dedicated CES tokens + audit-trail remap contract.
- Recent MyTasks polish (URL filters, staleness, Robert diagnostics, ActionButton integration).

## Debt & Anti-Patterns
- Heavy inline `style` + CES_TOKENS everywhere (migration friction).
- Duplicate card/badge primitives instead of extending canonical.
- Inconsistent column/state model vs mocks.
- No glass layering or frosted elevation.
- Light-mode bias in many components while global direction is Navy Dark glass.

---

## Next Steps Context
This analysis directly informs the companion **Agent_06_CES_Compliance_Execution_4Phase_Plan.md** which prioritizes CES migration early (Phases 1-2) because of its defensibility centrality. Recommendations include creation of `CesGlassCard` / scoped glass primitives, adoption of urgency left-border + layered elevation per spec, board layout realignment, and full visual regression against the locked v2 mocks (light + Navy Dark).

**CES must look and feel like the authoritative calm engine the mocks depict — or the compliance value proposition loses its visual proof.**

---

*End of Analysis — Subagent 06*