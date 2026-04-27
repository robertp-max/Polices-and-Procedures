# PM-SVAR-Additional-Components

**Phase:** Architecture only — assessment input.
**Cross-refs:** `PM-SVAR-Component-Strategy.md`.

---

## 1. Purpose

`PM-SVAR-Component-Strategy.md` covered the SVAR React components we already plan to evaluate (Gantt, Kanban, DataGrid, Filter, Toolbar, Calendar/Scheduler, TreeGrid, Form, Pivot, Diagram).

This document enumerates **other notable SVAR components and features** that were not in the primary brief, with descriptions sufficient to assess fit. Decisions are deliberately not made here — the team will accept/decline each based on this assessment.

> **Verification reminder:** SVAR's product line (`wx-react-*`, "WX" widgets, JS Gantt, etc.) evolves. Before any phase commits to one of the components below, verify current API, OSS vs PRO tier, and bundle weight against the latest SVAR release at https://svar.dev/react/.

---

## 2. Additional Components / Features

### 2.1 Rich Text Editor (`wx-react-richtext` / Editor)
- WYSIWYG editor with toolbar, formatting, lists, links, images, tables.
- **Possible PM use:** Task description editor in the Drawer; sprint-review notes; personal task notes.
- **Pro/Con:** richer than a plain `<textarea>`; risk of HTML sanitization complexity, CSP issues; mind XSS (see `PM-Risks-and-Controls.md` S5).
- **Recommendation surface:** Evaluate against existing app's editor (if any) before adopting; consistency with CES form editors matters.

### 2.2 Spreadsheet (`wx-react-spreadsheet`)
- Full Excel-like grid with formulas, ranges, formatting.
- **Possible PM use:** ad-hoc planning spreadsheet for sprint capacity; export-to-Excel parity for reports; what-if modeling outside the standard grid.
- **Pro/Con:** powerful but heavyweight; likely overkill if DataGrid + CSV export already cover the need.
- **Recommendation surface:** Defer; revisit only if users repeatedly request Excel-style what-if.

### 2.3 Pivot Table (PRO)
- Cross-tab analysis with drill-down, totals, custom aggregators.
- **Possible PM use:** Reports — assignee × sprint × points; event × status × owner.
- **Pro/Con:** likely PRO; cost vs build-vs-buy.
- **Recommendation surface:** Defer to Reports phase; weigh against grouped DataGrid v1.

### 2.4 Diagram / Flowchart (`wx-react-diagram`, if available)
- Node-link diagram with editing.
- **Possible PM use:** dedicated Dependency Graph view (see `PM-Dependency-Graph.md` §4.2); workflow visualization for Event templates.
- **Pro/Con:** competes with cytoscape/react-flow; assess feature parity, layout algorithms (DAG/force), interaction model.
- **Recommendation surface:** Compare directly with cytoscape.js / @xyflow/react before committing.

### 2.5 Menu / Context Menu / Sidebar (`wx-react-menu`, `wx-react-sidebar`)
- Standardized navigation widgets.
- **Possible PM use:** PM section nav; right-click context menus on Kanban/Gantt cards.
- **Pro/Con:** lightweight; likely covered by existing app shell.
- **Recommendation surface:** Use only if cohesive with adopted SVAR widgets; otherwise stick with native shell.

### 2.6 Tabs (`wx-react-tabs`)
- Tabbed container component.
- **Possible PM use:** Drawer tabs (Overview / Steps / Forms / Activity); My Tasks tabs.
- **Pro/Con:** trivial to build natively; using SVAR adds dependency for low gain.
- **Recommendation surface:** Skip unless we already have SVAR loaded for that route.

### 2.7 Uploader (`wx-react-uploader`)
- Drag/drop file upload, progress, multi-file.
- **Possible PM use:** evidence upload from PM drawer (currently CES-owned); attachments on personal tasks.
- **Pro/Con:** evidence flow must remain CES-owned for compliance integrity; only useful for personal task attachments.
- **Recommendation surface:** Limit to personal tasks; do not introduce alternate evidence path.

### 2.8 Color Picker / Date Picker / Number Input
- Standalone inputs.
- **Possible PM use:** label color picker; sprint date selection; story-point input.
- **Pro/Con:** plenty of OSS alternatives; only worth using if SVAR is already a route dependency.
- **Recommendation surface:** Use SVAR equivalents within already-SVAR-heavy views for visual coherence; otherwise native.

### 2.9 Charts / Sparklines (if SVAR offers)
- Bar/line/donut/sparkline.
- **Possible PM use:** burndown, throughput trend, workload heatmap legends.
- **Pro/Con:** SVAR's chart story is less established than Recharts/ECharts/Vega-Lite.
- **Recommendation surface:** Probably use Recharts/ECharts; revisit if SVAR adds a competitive charting library.

### 2.10 Filter Builder (advanced compound filters)
- Multi-condition rule builder UI.
- **Possible PM use:** advanced report filters; saved-view rule construction.
- **Pro/Con:** can replace ad-hoc filter chips when complexity grows.
- **Recommendation surface:** Phase 6+ if simple `<PmFilterBar/>` proves insufficient.

### 2.11 Comments / Activity Stream Widget (if SVAR offers)
- Threaded comments, mentions, reactions.
- **Possible PM use:** Drawer Activity tab; sprint-review discussions.
- **Pro/Con:** competes with rolling our own; verify SVAR offering exists and integrates with our identity/perm model.
- **Recommendation surface:** Spike before adopting.

### 2.12 Toolbar with Overflow / Action Bar
- Already considered in primary doc; mentioned again as a standard wrapper for consistency.

### 2.13 Drawer / Sidepanel Primitive
- Reusable side-panel wrapper.
- **Possible PM use:** PM Task Drawer.
- **Pro/Con:** existing app likely already has a drawer pattern; using SVAR's variant risks UX inconsistency.
- **Recommendation surface:** Skip; reuse app's existing drawer.

### 2.14 Tree Selector / Cascader
- Tree-based picker (e.g. Event → Step → Form).
- **Possible PM use:** Dependency picker scoped by event hierarchy; report scope picker.
- **Pro/Con:** good fit for our hierarchical taxonomy; verify keyboard accessibility.
- **Recommendation surface:** Evaluate when building Dependency picker.

### 2.15 Skeleton / Loading Placeholders
- Loading-state primitives.
- **Possible PM use:** unified loading shell across PM views.
- **Pro/Con:** trivial to roll our own.
- **Recommendation surface:** Use ours for consistency.

### 2.16 Localization / RTL helpers
- Built-in i18n hooks for SVAR widgets.
- **Possible PM use:** future internationalization.
- **Pro/Con:** valuable if/when we localize; verify alignment with the app's i18n stack.
- **Recommendation surface:** Track but not in scope this phase.

### 2.17 Theming Tokens
- Design tokens / theme provider for SVAR widgets.
- **Possible PM use:** required regardless — a theme bridge is needed to keep visual coherence and support future dark mode (out of scope this phase).
- **Recommendation surface:** Adopt minimal bridge in Phase 1 without enabling dark mode.

### 2.18 Server-Side Data Adapters
- Generic adapter pattern for grid/tree pagination/filtering against backend.
- **Possible PM use:** Reports DataGrid; large Sprint Backlog grid.
- **Pro/Con:** real value at scale.
- **Recommendation surface:** Adopt with DataGrid in Phase 6.

---

## 3. Summary Recommendations Table

| Component / Feature | Decision (proposed) | Phase to revisit |
|---|---|---|
| Rich Text Editor | Evaluate vs current editor | Phase 1 (Drawer) |
| Spreadsheet | Defer | Phase 7+ |
| Pivot Table (PRO) | Defer; DataGrid grouping v1 | Phase 6 |
| Diagram | Compare vs cytoscape/react-flow | Phase 5 |
| Menu / Sidebar | Skip unless coherent | — |
| Tabs | Skip | — |
| Uploader | Personal tasks only | Phase 1 |
| Pickers (color/date/number) | Use within SVAR-heavy views | Phase 1+ |
| Charts | Likely Recharts/ECharts | Phase 6 |
| Filter Builder | Phase 6+ if needed | Phase 6 |
| Comments widget | Spike | Phase 1/4 |
| Drawer primitive | Skip; reuse app's | — |
| Tree Selector / Cascader | Evaluate for Dependency picker | Phase 5 |
| Skeleton / Loading | Use ours | — |
| Localization | Track | — |
| Theming Tokens | Adopt minimal bridge | Phase 1 |
| Server-Side Data Adapters | Adopt | Phase 6 |

---

## 4. Acceptance Criteria

- Each listed component has a description sufficient to make a build/buy decision.
- Each has an explicit "phase to revisit" or "skip."
- No PRO assumption is made silently — they are flagged.
- Recommendations are conservative: do not adopt SVAR widgets where native is cheap and equal.

---

## 5. Verification Checklist

- [ ] List sanity-checked against current SVAR catalog before any phase that adopts a new component.
- [ ] OSS vs PRO confirmed per item.
- [ ] Theming bridge plan agreed before Phase 1.
- [ ] Spike tickets opened for "Spike" / "Evaluate" items at phase start.
- [ ] No silent introduction of an SVAR component outside the strategy folder `src/policy/components/pm/svar/`.
