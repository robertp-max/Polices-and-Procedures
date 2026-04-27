# PM-SVAR-Component-Strategy

**Phase:** Architecture only.
**Cross-refs:** `PM-Kanban-and-My-Tasks.md`, `PM-Sprint-Board-Design.md`, `PM-SVAR-Additional-Components.md`.

---

## 1. Purpose

Decide where SVAR React (https://svar.dev/react/) earns its place in the PM layer and where native components are preferable. SVAR is **adopted selectively, not wholesale.**

---

## 2. SVAR Components Considered (PM-relevant)

| Component | Tier (typical) | Use in PM | Decision |
|---|---|---|---|
| **Gantt** | OSS core; PRO for advanced editing/baselines | Timeline view of tasks/dependencies/sprints | **Adopt** for Timeline view |
| **Kanban** (svar wx-react-kanban) | OSS | Status board, swimlanes by assignee/sprint | **Adopt** |
| **DataGrid** (wx-react-grid) | OSS core; PRO for advanced features | Bulk task management, sortable columns, server-side ops | **Adopt** for Reports + Sprint Backlog grid |
| **Filter** | OSS | Compound filter UI for tasks (assignee, sprint, label, status, due) | **Adopt** as shared toolbar |
| **Toolbar / Menu** | OSS | Action bars on grids/boards | **Adopt** for consistency |
| **Calendar / Scheduler** (event-calendar) | OSS | Sprint calendar overlay; My Tasks calendar view | **Adopt** for Calendar view |
| **TreeGrid** | OSS | Hierarchical Event → Step → Form drilldown | **Adopt** for Event Workspace nav |
| **Form / Editor** | OSS | Inline drawer editing of overlay fields | **Evaluate** — may keep native to match existing CES form aesthetic |
| **Pivot** | PRO (typically) | Cross-tab reports (assignee × sprint × points) | **Evaluate** — defer until Reports phase |
| **Diagram** | PRO (if available) | Dependency graph visualization | **Evaluate** vs. native d3/cytoscape |

---

## 3. Per-Component Rationale

### 3.1 Gantt
- **Why SVAR:** mature React Gantt with task bars, drag/resize, dependency lines, baselines, working-time, zoom levels. Building a competitive Gantt natively is a multi-quarter effort.
- **Risk:** PRO licensing for some features (baselines, critical path). We must validate which features are OSS vs PRO before committing flow.
- **Boundary:** Gantt edits write only to PM overlay (`start_date`, `due_date`, `dependencies`); never to CES.
- **Hooks needed:** `onTaskUpdate`, `onLinkUpdate`, `onTaskDrag`, render slot for status/assignee chips.

### 3.2 Kanban
- **Why SVAR:** drag/drop, swimlanes, custom card renderers built-in.
- **Boundary:** drop into "done" lane is **disabled** for `source: 'ces'` tasks (see `PM-Kanban-and-My-Tasks.md`).
- **Customization:** card renderer slot to display source badge, story points, due chip, dependency count.

### 3.3 DataGrid
- **Why SVAR:** virtualized rows, column reordering, multi-sort, inline edit, server-side data adapters.
- **Use cases:** Sprint Backlog, Reports, Bulk Editor.
- **Boundary:** inline edits limited to overlay fields; status column is read-only badge for CES tasks.

### 3.4 Filter + Toolbar
- **Why SVAR:** consistent compound-filter UX across all PM views — single shared `<PmFilterBar/>` wrapper around SVAR Filter.
- **Standard facets:** assignee, sprint, status, label, source (CES/Personal), event, due window, weekend-override.

### 3.5 Calendar / Scheduler
- **Why SVAR:** event-calendar component supports week/month, drag/resize.
- **Use cases:** "My Calendar" tab; sprint overlay; weekend-override visualization.
- **Boundary:** Calendar drag updates overlay `due_date`/`start_date` only.

### 3.6 TreeGrid
- **Why SVAR:** Event Workspace currently shows Event → Step → Form. TreeGrid gives a stable virtualized tree with column metadata (status, assignee, due) without re-rolling our own.
- **Decision:** evaluate replacement of part of `EventWorkspace.tsx`'s flow view in a later phase; not in scope to refactor existing CES UI now.

### 3.7 Form / Editor
- **Why maybe NOT:** existing CES forms are domain-bespoke (eSign, validation, evidence). Replacing them is high risk. Keep native for CES forms; consider SVAR Form only for PM overlay quick-edits.

### 3.8 Pivot
- **Why defer:** PRO-tier in most distributions; can be approximated with DataGrid grouping for v1.

### 3.9 Diagram (Dependency Graph)
- See `PM-Dependency-Graph.md`. SVAR is not the obvious winner here vs. cytoscape/d3-dag; evaluate before committing.

---

## 4. Licensing Strategy

- Inventory each SVAR component as **OSS-sufficient** vs **requires-PRO** during implementation phase 1.
- For each PRO requirement, document the workaround (downgrade feature, use alternative, or budget for license).
- Bundle size budget: Gantt + Kanban + DataGrid combined must stay under **+250 KB gzipped** in the PM route chunk; lazy-load each view.

---

## 5. Integration Boundary Rules

1. SVAR components **never** import from CES stores directly — they receive data via PM selectors.
2. SVAR write callbacks **never** call CES write paths — only PM overlay endpoints.
3. SVAR styling wrapped by a single `<SvarThemeProvider>` to keep look consistent and to defer dark-mode (out of scope this phase).
4. All SVAR usage isolated under `src/policy/components/pm/svar/` so removal/replacement is mechanical.

---

## 6. Data Flow

```
PM selector ──► adapter (Task → SVAR shape) ──► SVAR component
SVAR event ──► adapter (SVAR change → PM overlay write) ──► overlay store ──► selector recompute
```

Adapters must be **pure** and unit-tested; no direct DOM coupling.

---

## 7. Backend Contract Impact

None unique to SVAR. SVAR is purely client-side. Backend contracts driven by PM overlay/notification needs (see other docs).

---

## 8. UI Behavior

- All SVAR views share the `<PmFilterBar/>` and `<PmToolbar/>`.
- Empty states standardized (single component reused across SVAR views).
- Loading skeletons standardized.
- Accessibility: SVAR keyboard-nav verified per component; supplement with our own ARIA where SVAR falls short.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| PRO features assumed but unavailable in OSS | Pre-implementation feature audit; fallbacks documented |
| Visual mismatch with rest of app | Theme wrapper + design-token bridge |
| Bundle bloat | Lazy load each PM route; chunk-budget enforced in CI |
| SVAR API churn between versions | Pin major version; adapters absorb breaking changes |
| Vendor lock-in | Adapter pattern + isolation folder enable swap |

---

## 10. Acceptance Criteria

- Per-component decision (Adopt / Evaluate / Reject) with rationale.
- Licensing audit plan documented.
- Adapter pattern specified.
- Boundary rules explicit (no SVAR → CES coupling).
- Bundle budget defined.

---

## 11. Verification Checklist

- [ ] SVAR component list reviewed against current SVAR releases.
- [ ] OSS vs PRO matrix confirmed before phase 1 implementation.
- [ ] Adapter contract drafted.
- [ ] Theme provider plan agreed.
- [ ] Lazy loading plan in build config noted.
- [ ] `PM-SVAR-Additional-Components.md` cross-referenced for components not chosen.
