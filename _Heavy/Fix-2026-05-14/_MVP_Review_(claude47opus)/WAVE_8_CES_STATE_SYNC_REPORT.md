# Wave 8 — CES State Synchronization Report

**Date:** 2026-05-16
**Mode:** READ-ONLY audit. No code changes in this report's scope.
**Sources:** Code-level reads of `taskProjection.ts`, `taskProjectionCore.ts`, `regulatoryExecutionStore.ts` (FROZEN), `useObligations.ts`, the 7 named surfaces, plus `scripts/verifyTaskIdentity.ts` and `scripts/verifyUnifiedTaskProjection.ts`.

---

## 1. Path correction

There is **no** `src/policy/pm/taskIdentity.ts`. CES task-identity helpers live under `src/policy/compliance-execution/taskIdentity.ts` (this is what `verify:task-identity` exercises via `eventTaskAdapter` and merge helpers). All references to "taskIdentity.ts" in this report use the actual location.

---

## 2. Surface audit — task source / completion / assignee / evidence / workflow state

| Surface | Task source | Completion source | Assignee source | Evidence source | Workflow state source | Verdict |
|---------|--------------|--------------------|------------------|------------------|------------------------|---------|
| **1. Calendar** — `MasterCalendarPage.tsx` + `TimelineMonth` (`ces/components/calendar/ComplianceCalendar.tsx` has no projector usage) | `RegulatoryEvent[]` built from `REGULATORY_EVENTS` + autogen (`MasterCalendarPage:72–78`) | Grid/legend: `classifyInstance(e, today, store)` (:843–858); right rail delegates to `TaskDetailRightPanel` or `WorkflowExecutionPanel` / `SprintTaskPanel` | Event-level `event.owner` in sprint panel (`SprintTaskPanel:158–161`); PM assignee not used for month cells | Not from projected `Task`; via store when execution surfaces open | `timelineState.classifyInstance` instance states for rollup; **not** `PmTaskStatus` on the grid | **⚠️** Event/instance lens; not `useProjectedTasks` for the calendar body |
| **2. Sprint board** — `PmViews.tsx` `SprintBoardView`; `SprintReviewPage.tsx`; `PmDashboardPage.tsx` charts | `useProjectedTasks()` / `useProjectedTasks('full')` (`PmViews:35, ~507`; `SprintReviewPage:11–38`; `PmDashboardPage:15, 94`) | `task.status` on `Task` (e.g. `SprintReviewPage:69–76`, `PmDashboardPage:60–64/88`) | `assigned_user_id` / `owner_user_id` via local `ownerOf` (`SprintReviewPage:22–25`) | From projected `Task` | `PmTaskStatus`; columns map status (`PmViews:478–495`) | **✅** Canonical |
| **3. Kanban** — `PmViews.tsx` | `useProjectedTasks()` (:170) | `task.status` → column buckets (:178–187) | From projected `Task` (via `PmTaskCard`) | Same | `PmTaskStatus` + DnD rules (:62–80) | **✅** Canonical |
| **4. Gantt** — `PmViews.tsx` | `useProjectedTasks()` (:288 area) | `task.status` for progress/color (:263–277) | From projected `Task` | Same | `PmTaskStatus` | **✅** Canonical |
| **5. Task drawer** — `TaskDetailRightPanel.tsx`, `GlobalTaskDrawer.tsx` | `useProjectedTaskById(taskId)` (`TaskDetailRightPanel:89, 22`) | `task.status` + `PM_TASK_STATUS_LABEL` (:118–119) | `task` fields + overlay store | `buildArtifactRoute` / form linkage (:37) | Mapped from projected `PmTaskStatus` | **✅** Canonical |
| **6. Evidence Center** — `EvidenceCenterPage.tsx` | `useProjectedTasks('full')` (:254–261) for task widening | Evidence docs: store `doc.status`; tasks: `isCesTask` + projection | `doc` + task fields when normalizing | **Primary:** `useRegulatoryExecutionStore` evidence/audit (:253–334); tasks widen event coverage | Mostly evidence lifecycle, not CES workflow enum | **⚠️** Intentional split — task linkage via projector; file completion is store-native |
| **7. Event workspace / execution rail** — `EventWorkspace.tsx`, `WorkflowExecutionPanel.tsx` | **EventWorkspace:** event + `useRegulatoryExecutionStore`. **Tasks tab:** `dataflow.tasks` (`WorkflowExecutionPanel:679–736`) | **EventWorkspace** `CompletionValidatorCard`: `validateEvent` / `isEventComplete` (:311–318). **Tasks tab:** `toPmTask` status + requirement % (:1122–1142, 683–718) | **toPmTask:** assignee/owner from execution task (:1182–1183) | `evidenceTaskIdMatchesTask`, `dataflow.evidence`, `buildCesTaskRequirements` (:42, 686–696) | **EventWorkspace:** step/form/minutes checklist. **Tasks tab:** CES requirement `status` / `completionPercentage`. **`SprintTaskPanel`:** `MergedExecutionUnit.complianceState` (:111–117) | **❌** Parallel execution-layer derivation vs the single-projector goal |

---

## 3. Duplicate / parallel derivation hits

| Location | What it duplicates | Canonical seam | Risk if not consolidated |
|----------|---------------------|-----------------|---------------------------|
| `MasterCalendarPage:72–78` | Merges full event universe (like projector inputs) but exposes **events**, not `Task[]` | Consumers needing tasks should use `useProjectedTasks` for the same slice | Calendar shows instances; PM counts elsewhere come from tasks → perception drift |
| `MasterCalendarPage:843–858` | Instance **SLA/timeline** state via `classifyInstance` | Different concern; should be one rollup fed by projector | Legend ≠ Kanban columns |
| `SprintTaskPanel:48–49, 88–117, 120–123` | Child tasks + `complianceState` buckets from `useObligations()` / execution snapshot | Same obligation data ultimately feeds projection, but UI reads **obligation shape** | Sprint right rail vs SprintBoardView can disagree on counts/labels |
| `EventWorkspace:311–318` | Event-level `validateEvent` / `isEventComplete` / manual % | Not the same as per-`task_id` `PmTaskStatus`; UX alignment only | "Event 100%" vs open PM tasks |
| `WorkflowExecutionPanel:1122–1184` (`toPmTask`) | Rebuilds `PmTask`-like `status` / `packet_status` from `dataflow` + form instances | `useProjectedTasks` / `projectTasks` already produces `Task` | Drift between Tasks tab and Kanban for same `task_id` |
| `WorkflowExecutionPanel:683–718` | Per-task requirement graph + evidence linkage | Overlaps with projection + `taskProjectionCore` policy/form refs | Wrong "missing" UI vs Gantt |
| `SprintReviewPage:22–25`; `SprintPlanPage:32–35`; `sprintAllocator.ts:71–74` | Same `ownerOf` predicate **copy-pasted** | Single helper (e.g. `pm/types` or new `taskAssignee.ts`) | Inconsistent assignee if one copy changes |
| `PmViews:478–495` | Maps `PmTaskStatus` → sprint column keys | Acceptable view mapping if inputs are canonical | Low |
| `taskProjection.ts:136–144` | Prefix scan `findOwningEventIdForTask` for `useProjectedTaskById` fallback | Overlaps conceptually with identity/index helpers | Edge-case wrong event if IDs collide |

There is **no** shared `isTaskComplete` / `getTaskStatus` symbol in `src/policy`. Completion is generally **`task.status === 'done'`** on projected tasks or **execution-layer flags** (`complianceState`, form instance statuses, `isEventComplete`).

---

## 4. What the verifiers actually enforce

### `verify:task-identity` (`scripts/verifyTaskIdentity.ts`)
Runtime checks on **CES `EventTask` identity**:
- Hash suffix when `taskSourceId` exists (:42–44)
- Override merge keeps canonical id (:52–54)
- No duplicate ids after merge (:56–62)
- Orphan manual override gets canonical hash id (:81–84)
- `normalizeEventTaskIdentity` overwrites bad persisted id (:86–87)
- Dedupe by canonical id (:89–90)
- `processflow:` casing merges (:92–104)
- Long `processFlow` ids → distinct hashes (:106–111)
- `canonicalizeTaskSourceId` normalizes prefix (:113)

**Status:** ✅ all checks PASS (current run).

### `verify:pm-unified` (`scripts/verifyUnifiedTaskProjection.ts`) — 24 checks total
1. **Pure projection** (`projectTasks` on `REGULATORY_EVENTS`, empty states): non-empty (:48), no duplicate `task_id` (:50–56), no orphan non-personal tasks (:58–61), titles not bare form IDs (:63–68), Gantt fields present (:70–75), valid deps (:77–79), workflow/form refs valid (:81–87), generated instance ids resolve (:89–91), optional event-related count sanity (:100–108), start≤due (:190–192).
2. **Static source audits** (read TS files): Gantt must not import `REGULATORY_EVENTS` (:124–126); Kanban/Gantt must call `useProjectedTasks` (:127–130); `EntityLink` usage in Gantt/card/detail (:131–134); `EntityLink` kind unions + policy URL normalization (:136–150); **form_instance** link pattern (:152–158); task link behavior (:160–167); **`WorkflowExecutionPanel` "Related Tasks" + `EventTaskList`** (:169–175); `MasterCalendarPage` must not show related tasks / `PmTaskCard` (:177–180); no raw `event_id` text in PM views (:187–188); kanban vs gantt count parity under script's filter (:194–196).

**Status:** 22 passed / 2 failed (unchanged baseline since Wave 4).

---

## 5. Root cause of the 2 baseline `verify:pm-unified` failures

Both failures are **static substring/regex expectations** that no longer match the code. The behavior is arguably valid; the **verifier patterns are stale**.

### Failure 1 — "form_instance links include source form path and instance/event/workflow query params"

- **Verifier expects** (`scripts/verifyUnifiedTaskProjection.ts:152–158`): `EntityLink` to build `/forms/${sourceFormId}?` with `URLSearchParams` setting `instance`, `event`, `workflow`.
- **Actual code** (`src/policy/components/pm/EntityLink.tsx:38–45`): For `form_instance` kind, `EntityLink` uses **`buildArtifactRoute`** instead of constructing the URL inline with `URLSearchParams`. The pattern check fails.
- **Disposition:** Architecturally newer (canonical route builder vs inline URL construction). Verifier is the stale party.

### Failure 2 — "WorkflowExecutionPanel defines Related Tasks tab and includes EventTaskList in its own tab content"

- **Verifier expects** (:169–175): `type PanelTab = ... 'related_tasks'` and `<EventTaskList ... />` inside the `'related_tasks'` tab content.
- **Actual code** (`src/policy/components/regulatory/WorkflowExecutionPanel.tsx:97`): `type PanelTab = 'overview' | 'tasks' | 'audit' | 'technical'`. The tab is renamed to `'tasks'` and uses a custom `EventTasksTab` driven by `EventExecutionDataflow` (:653–679), not `EventTaskList` in that tab.
- **Disposition:** `WorkflowExecutionPanel` is FROZEN. The newer panel structure was approved when the panel was last revised. The verifier rule should be **updated** to match the current tab model, OR explicitly waived. **Cannot fix the panel** without unfreezing it.

**Both failures are protected/frozen-adjacent and require verifier updates (scope outside Wave 8) — not code changes.**

---

## 6. Persona impact of the parallel task models

| Persona | Affected by | Symptom |
|---------|--------------|---------|
| DON | Sprint right rail (`SprintTaskPanel`) vs Sprint board (`SprintBoardView`) | Same sprint shows different task counts depending on which surface |
| Clinician | `MyTasksPage` (CES obligations) vs PM Kanban / mobile task drawer (PM projection) | Task "completed" elsewhere may still appear in My Tasks until obligation graph re-derives |
| Admin | Audit Mode certification vs Workflow Execution Panel certification | Both call `certifyEventComplete` on the store, but UI affordances differ |
| Systems | Validating event completion (`validateEvent` vs `isEventComplete`) | Calendar shows event "complete" but audit shows blockers (or vice versa) |

---

## 7. Risks (severity rating)

| # | Risk | Severity | Mitigation today |
|---|------|----------|------------------|
| 1 | Dual task models (PM `Task[]` vs CES obligations) coexist without an architectural decision | **P1** | Both verifiers pass individually; cross-surface drift is documented |
| 2 | `isEventComplete` vs `validateEvent` semantic split | **P1** | Both functions documented in this report; UIs unchanged |
| 3 | `useProjectedTaskById` scope bug (always queries `'sprint'`) | **P2** | Edge case; task opened from non-sprint contexts may appear missing |
| 4 | `ownerOf` predicate copy-pasted in 3 files | **P2** | If one copy drifts, sprint assignee labels diverge |
| 5 | Calendar instance-state legend ≠ Kanban PM task status | **P2** | Different concerns (SLA vs workflow); intentional separation |

---

## 8. Files touched in this audit

**None** in `src/`. Read-only.

## 9. Protected files confirmed not modified

`regulatoryExecutionStore.ts`, `WorkflowExecutionPanel.tsx`, `taskIdentity.ts` (under `compliance-execution/`), `cesFormInstanceId.ts`, `stateMachine.ts`, `localDemoAdapter.ts`, `cesEvidenceHierarchy.ts`, `server/ecign/*`, `src/policy/ecign/*` — all read-only inspections.

## 10. Validation results (this wave's baseline)

| Gate | Result |
|------|--------|
| `tsc -b --noEmit` | ✅ PASS |
| `npm run build` | ✅ PASS (3.80s) |
| `verify:ui` | ✅ 0 FAIL · 3185 WARN (unchanged) |
| `verify:task-identity` | ✅ PASS |
| `verify:alignment` | ✅ 100% — 0 findings |
| `verify:pm-unified` | ⚠️ 22 passed / 2 failed (pre-existing since Wave 4; root causes documented in §5) |
| `wave-6-regression` Playwright | ✅ 9/9 |
| `artifact-retrieval-defect` Playwright | ✅ 1/1 |

## 11. Unresolved blockers

- Whether to update `verify:pm-unified` regexes to match the current `EntityLink` / `WorkflowExecutionPanel` shapes (low-risk verifier maintenance, but architectural sign-off required for "Related Tasks tab" semantic change).
- Whether to make an architectural decision on PM `Task[]` vs CES `MergedExecutionUnit` as the singular task SOT.
- Whether to fix `useProjectedTaskById` scope hardcoding (frozen-adjacent — affects PM/CES interaction).
