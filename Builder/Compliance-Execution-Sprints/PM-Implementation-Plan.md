# PM-Implementation-Plan

**Phase:** Architecture only — execution begins after sign-off.
**Cross-refs:** all PM-* docs.

---

## 1. Purpose

Sequence the work to deliver the PM Layer in shippable increments without destabilizing CES. Includes phases, files likely touched, user stories, acceptance criteria, tests, and rollback strategy.

---

## 2. Guiding Principles

- **CES is untouched in writes.** Every phase must pass a regression that confirms compliance completion still goes through CES validation only.
- **Each phase ships behind a feature flag** (`pm_layer_v1`, `pm_kanban`, `pm_gantt`, etc.).
- **Adapters first, components second.** Build pure adapters before wiring SVAR, so SVAR can be swapped if licensing/perf turns sour.
- **Lazy-load PM routes** to keep main bundle untouched.

---

## 3. Phases

### Phase 0 — Foundations (no UI)
- PM overlay store + schemas (`pm_overlay_task`, `pm_personal_task`, `pm_dependency`, `pm_notification`, `pm_audit`).
- Task projector + selector (CES → Task).
- Sprint window pure function + tests.
- Notification decider (pure function) + queue.
- Files likely touched (new):
  - `src/policy/stores/pmOverlayStore.ts`
  - `src/policy/stores/pmPersonalStore.ts`
  - `src/policy/pm/projection/taskProjector.ts`
  - `src/policy/pm/projection/sprintWindows.ts`
  - `src/policy/pm/projection/statusMap.ts`
  - `src/policy/pm/notifications/decider.ts`
  - `server/pm/*` for endpoints (additive)
- **Tests:** projector idempotency; sprint windows for 2024–2030; status map exhaustive; notification idempotency.

### Phase 1 — Task Drawer + My Tasks
- Reuse existing CES drawer subcomponents inside a new PM Task Drawer wrapper.
- Build My Tasks tabs (Today, This Sprint, Upcoming, Personal, Watching).
- No SVAR yet beyond optional Filter component.
- Files likely touched (new):
  - `src/policy/components/pm/PmTaskDrawer.tsx`
  - `src/policy/components/pm/MyTasksPage.tsx`
  - `src/policy/components/pm/PmFilterBar.tsx`
- **Tests:** selector outputs per tab; drawer renders CES + overlay panes; no "Mark Done" for CES tasks.

### Phase 2 — Kanban
- Wire SVAR Kanban behind `pm_kanban` flag.
- Drag rules matrix enforced (see `PM-Kanban-and-My-Tasks.md` §3.3).
- Card renderer + adapter.
- Files likely touched (new):
  - `src/policy/components/pm/svar/KanbanView.tsx`
  - `src/policy/components/pm/svar/adapters/kanbanAdapter.ts`
  - `src/policy/components/pm/PmTaskCard.tsx`
- **Tests:** adapter unit tests; disallowed drops revert; allowed drops write overlay.

### Phase 3 — Sprint Board
- Plan / Execute / Review tabs.
- Sprint allocator (capacity + dependency aware).
- Burndown widget.
- Roll-over transaction.
- Files likely touched (new):
  - `src/policy/components/pm/SprintBoard/*`
  - `src/policy/pm/scheduling/allocator.ts`
- **Tests:** allocator deterministic; weekend rule honored; roll-over atomic.

### Phase 4 — Notifications
- In-app notification center.
- Email digest job.
- User preferences UI.
- Files likely touched (new):
  - `src/policy/components/pm/NotificationCenter/*`
  - `server/pm/notifications/*`
- **Tests:** decider unit tests; quiet hours honored; idempotency window enforced.

### Phase 5 — Gantt + Dependencies
- SVAR Gantt behind `pm_gantt` flag.
- Dependency CRUD in drawer + drag-to-link in Gantt.
- Critical-path overlay (if SVAR tier permits).
- Files likely touched (new):
  - `src/policy/components/pm/svar/GanttView.tsx`
  - `src/policy/components/pm/svar/adapters/ganttAdapter.ts`
  - `src/policy/pm/scheduling/criticalPath.ts`
- **Tests:** dependency cycle prevention; Gantt edits write overlay only; large dataset perf budget.

### Phase 6 — Reporting + Workload
- Reports catalog endpoints + nightly snapshots.
- Workload heatmap.
- Saved views.
- Files likely touched (new):
  - `src/policy/components/pm/Reports/*`
  - `server/pm/reports/*`
- **Tests:** KPI excludes personal tasks; snapshot job idempotent.

### Phase 7 — Hardening + Migration
- Performance tuning, a11y audit, permission audit.
- Retire or hide deprecated sprint UI.
- Documentation handoff to ops.
- Optional: TreeGrid replacement of Event Workspace flow view (separate decision gate).

---

## 4. User Stories (representative)

- *As a coordinator,* I want a single My Tasks page so I can see compliance + personal work for today and this sprint.
- *As a coordinator,* I want to drag a task from In Progress to Done in Kanban for personal tasks but be told "complete the form in CES" for compliance tasks.
- *As a manager,* I want a sprint planning view that prevents scheduling compliance tasks on weekends without an override + reason.
- *As a manager,* I want a workload heatmap so I can see who is overcommitted before a sprint starts.
- *As an approver,* I want to be notified the moment a form awaits my approval.
- *As any user,* I want my filter state preserved per view per user.
- *As an auditor,* I want every PM overlay change captured in `pm_audit`.
- *As a developer,* I want SVAR usage isolated so we can swap libraries without rewriting views.

---

## 5. Acceptance Criteria (cross-cutting)

- All compliance "done" outcomes still flow through CES validation.
- Sprint cadence reproducible from a pure function.
- Weekend rule enforced uniformly with audit trail.
- Personal tasks excluded from compliance KPIs by default.
- Each PM view backed by the same canonical Task selector.
- SVAR usage confined to `src/policy/components/pm/svar/` with adapters.

---

## 6. Tests

| Layer | Test type | Examples |
|---|---|---|
| Projection | unit | task projector idempotency, status mapping |
| Sprint | unit | window function for 2024–2030, weekend rule |
| Allocator | property | capacity respected, no cycles violated |
| Notifications | unit | idempotency, quiet hours |
| Drawer | RTL | CES vs PM panel rendering, no "Mark Done" for CES |
| Kanban | RTL | disallowed drops revert; allowed drops write overlay |
| Gantt | RTL + perf | dep cycle prevention; render budget |
| Reports | integration | KPI excludes personal; filters honored |
| E2E | Playwright | end-to-end sprint plan → execute → review with CES interactions |
| Regression | snapshot | CES write paths unchanged; existing CES specs still pass |

CI gates: typecheck, lint, unit, RTL, build, bundle-budget. E2E nightly.

---

## 7. Rollback Strategy

- Every phase behind a flag → flip flag off to disable.
- PM overlay tables additive → drop them is a no-op for CES.
- Notification job pausable independently.
- Adapter pattern allows swapping SVAR for native fallback per view.
- DB migrations one-way forward but additive — rollback = ignore tables.
- Kept feature-branch behind `pm_layer_v1`; production cutover is a flag flip, not a deploy.

---

## 8. Risks (top)

| Risk | Mitigation |
|---|---|
| SVAR PRO requirement surfaces late | Phase 2/5 gated by licensing audit |
| CES regression introduced by projection | Read-only projection; CES write paths untouched + regression suite |
| Bundle bloat | Lazy routes + chunk budget |
| User confusion CES vs PM | Source badges + drag-rule tooltips |
| Notification spam | Coalescing + digest defaults |

---

## 9. Verification Checklist

- [ ] Each phase has owner, exit criteria, feature flag.
- [ ] Test plan reviewed.
- [ ] Rollback plan documented and rehearsed.
- [ ] Bundle budget set in CI.
- [ ] CES regression suite identified.
- [ ] Licensing audit scheduled before Phase 2/5.
