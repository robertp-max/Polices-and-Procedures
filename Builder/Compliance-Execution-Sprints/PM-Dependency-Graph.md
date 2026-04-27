# PM-Dependency-Graph

**Phase:** Architecture only.
**Cross-refs:** `PM-Data-Model.md` §3.4, `PM-Sprint-Board-Design.md` §4 (allocator).

---

## 1. Purpose

Define a PM-overlay dependency graph that supplements (does not replace) any CES-internal step ordering. It enables Gantt links, allocator ordering, blocker propagation, and dependency-aware reporting.

---

## 2. Model

### 2.1 Edge
```ts
interface PmDependency {
  id: string;
  from_task_id: string;     // predecessor
  to_task_id: string;       // successor
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag_days?: number;        // optional buffer (can be negative)
  created_by: string;
  created_at: string;
}
```

### 2.2 Constraints
- Edges allowed between any two Tasks regardless of source (CES↔CES, CES↔Personal, Personal↔Personal).
- Cross-event edges allowed.
- Self-loops forbidden.
- Cycles forbidden — validated on insert via DFS.
- Removing/renaming a Task removes its incident edges (or marks orphan if Task is transient).

---

## 3. Algorithms

### 3.1 Cycle detection (insert-time)
Run DFS from `to_task_id` looking for `from_task_id`. If reachable → reject with explanatory error.

### 3.2 Topological order (allocator + Gantt)
Standard Kahn's algorithm on the merged graph (CES-implicit step order + PM overlay). Used by the sprint allocator and the Gantt critical-path helper.

### 3.3 Critical path
Longest path by duration through the DAG (where duration is `due_date - start_date` or fallback to `points → days` heuristic). Surfaces in Gantt and Reports.

### 3.4 Blocker propagation (informational)
If predecessor status = `blocked`, mark successors with a derived `derived_blocked: true` indicator (not the same as CES `blocked`; surfaces as a chip in UI).

---

## 4. Visualization Choices

Two visualization modes; both read from the same edges.

### 4.1 Gantt link layer (primary)
- Lines between task bars by edge type.
- Editable: drag from end of bar A to start of bar B to create FS edge.
- SVAR Gantt supports dependency lines natively (validate per version/tier).

### 4.2 Dedicated Dependency View (secondary)
- For complex inter-event chains, a node-link diagram is more legible than Gantt.
- Candidates: SVAR Diagram (PRO if available), or **cytoscape.js** / **react-flow** for OSS robustness.
- Decision deferred to phase 2 — initial release ships Gantt link layer only; node-link view is a "nice to have."

---

## 5. Data Flow

1. User adds dependency in Drawer or by drag in Gantt.
2. Cycle check runs → success: `pm_dependency` insert + audit; failure: error toast.
3. Selectors expose:
   - `incoming(taskId)` and `outgoing(taskId)` adjacency lists.
   - `topoOrder(scope)` for allocator + reports.
   - `criticalPath(scope)` for Gantt overlay + reports.
4. Sprint allocator and Gantt subscribe to the same selectors.

---

## 6. Backend Contract Impact

- New table `pm_dependency` with unique index `(from_task_id, to_task_id)`.
- Endpoints: `POST /pm/dependencies`, `DELETE /pm/dependencies/:id`, `GET /pm/dependencies?scope=...`.
- No CES changes.

---

## 7. UI Behavior

- Drawer "Dependencies" section: two lists (Predecessors, Successors), with add/remove.
- Picker is type-ahead over Tasks scoped by event/sprint/label to keep results manageable.
- Dependency-violation indicator on tasks whose successors started before predecessor done (warn, don't block).
- Auto-suggest from CES step order: when adding a CES task to PM, propose internal step-order edges as defaults (user accepts/declines).

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| Cycles introduced via concurrent edits | Server-side cycle re-check on commit; reject + reload |
| Performance of large graphs | Cap drawer picker scope; render Gantt links on-demand by viewport |
| Confusion between PM dependency and CES step order | Distinct visual style; legend present |
| Orphan edges after task deletion | Cascading delete on Task removal; orphan reaper job |

---

## 9. Acceptance Criteria

- Edge schema and constraints documented.
- Cycle detection specified and required at insert time.
- Critical path algorithm specified.
- Drawer UI defined with predecessors/successors lists.
- Gantt link drag flow specified.

---

## 10. Verification Checklist

- [ ] DFS cycle check covers all four edge types.
- [ ] Topological order tested on synthetic graphs.
- [ ] Cross-event edges allowed and rendered correctly.
- [ ] Personal ↔ CES edges supported.
- [ ] Critical-path display deferred or implemented as documented.
- [ ] Endpoints additive — no CES schema changes.
