User: review and reconcile if everything is implemented

GitHub Copilot: I’m going to audit the current PM implementation against the architecture docs you attached, then reconcile gaps by checking what is actually present in code and what is still only documented. I’ll start by locating the PM projection, panel synchronization, and core PM views/stores, then I’ll report concrete findings with file-level references.I’m pulling a focused inventory of PM-related code paths now so the review is evidence-based rather than doc-only.

Search complete: Inventory PM implementation

Searched for files matching `**/useProjectedTasks/**`, no matches

Searched for files matching `**/taskProjection/**`, no matches

Searched for files matching `**/selectedTaskStore/**`, no matches

Searched for files matching `**/TaskDetailRightPanel/**`, no matches

Searched for files matching `**/GlobalTaskDrawer/**`, no matches

Searched for files matching `**/pmOverlayStore/**`, no matches

Searched for files matching `**/pmPersonalStore/**`, no matches

Searched for files matching `**/dependencyGraph/**`, no matches

Searched for files matching `**/sprintWindow/**`, no matches

Searched for files matching `**/kanbanAdapter/**`, no matches

Searched for files matching `**/ganttAdapter/**`, no matches

Searched for files matching `**/server/pm/**`, no matches

Searched for files matching `**/src/policy/**`, 200 matches

Searched for files matching `**/TaskDetailRightPanel.tsx`, 1 match

Searched for files matching `**/GlobalTaskDrawer.tsx`, 1 match

Searched for files matching `**/TaskDetailRightPanel.js`, no matches

Searched for files matching `**/GlobalTaskDrawer.js`, no matches

Searched for regex `useProjectedTasks|taskProjection|selectedTaskStore|TaskDetailRightPanel|GlobalTaskDrawer|pmOverlayStore|pmPersonalStore|dependencyGraph|notifications|sprintWindows|kanbanAdapter|ganttAdapter`, 200 results

I’ve got an initial inventory, and next I’m validating the highest-risk areas directly in code: missing adapter files, PM API endpoints, and whether the documented constraints (no CES completion via PM) are actually enforced.

Searched for files matching `**/src/policy/components/pm/svar/adapters/**/*`, no matches

Searched for files matching `**/server/pm/**/*`, no matches

Searched for regex `/pm/notifications|/pm/dependencies|/pm/tasks|/pm/sprint` (`**/server/**/*.ts`), no results

Searched for regex `Mark Done|Take action in CES|status_hint|weekend_override|wouldCreateCycle|assertNoDuplicateTaskIds` (`**/src/**/*.ts*`), 36 results

I found strong evidence for core constraints in the frontend, but endpoint discovery didn’t return PM routes yet. I’m now checking the API client and server route wiring to confirm what is truly implemented versus stubbed/deferred.

Searched for files matching `**/server/routes/**/*.ts`, 5 matches

Searched for regex `pmApi|/api/pm|createPersonal|overlay|dependency|notification` (`**/server/**/*.ts`), 58 results

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/components/pm/PmViews.tsx#150-150), lines 150 to 280

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/pm/api/pmApiClient.ts)

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/pm/notificationStore.ts)

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/pm/notifications/decider.ts)

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/pm/pmOverlayStore.ts)

Searched for regex `task_id|derivePmTaskStatus|projectTasks\(|event.id|pad2|personal:` (`**/src/policy/pm/taskProjectionCore.ts`), 56 results

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/components/pm/MyTasksPmPage.tsx)

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/pm/notificationTicker.ts)

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/components/pm)

I’ve confirmed several core pieces are implemented, and I’m now checking the Sprint, Reporting, and Approvals pages to reconcile what’s complete versus partial in the end-to-end PM plan.

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/components/pm/SprintPlanPage.tsx)

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/components/pm/SprintReviewPage.tsx)

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/components/pm/ApprovalsQueuePage.tsx)

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/components/pm/PmDashboardPage.tsx)

Searched for regex `/pm/my-tasks|/pm/sprint-plan|/pm/sprint-review|/pm/approvals|/pm/dashboard|GlobalTaskDrawer|MyTasksPmPage|SprintPlanPage|SprintReviewPage|ApprovalsQueuePage|PmDashboardPage` (`**/src/**/*.tsx`), 53 results

Searched for regex `defer|deferred|placeholder|not yet|TODO|Phase` (`**/src/policy/components/pm/**/*.tsx`), 29 results

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/pm/scheduling/sprintAllocator.ts)

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/pm/weekendRule.ts)

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/pm/types.ts)

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/pm/pmOverlayStore.types.ts)

Searched for regex `quiet_hours|mute|digest_includes_personal|PmNotificationPrefs|notification_prefs|snooze` (`**/src/policy/pm/**/*.ts*`), 9 results

Searched for regex `Dependencies|depends|dependency|Predecessor|Successor` (`**/src/policy/components/pm/TaskDetailRightPanel.tsx`), 6 results

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/components/pm/NotificationCenter.tsx)

Read [](file:///c%3A/AI/Git/training/HomeHealth/Policies_and_Procedures/server/index.ts)

**Findings**
1. High: Local backend in this repo does not expose PM endpoints, so PM client contracts are not implemented here end-to-end.  
   Evidence: index.ts mounts calendar, hubstaff, ecign, audit, ceu, compliance only; no pm router is mounted.  
   Related client expectations: pmApiClient.ts calls paths like /pm/overlays, /pm/personal, /pm/dependencies, /pm/notifications.

2. High: My Tasks view is not fully aligned with the architecture doc tabs/selectors.  
   Evidence: MyTasksPmPage.tsx defines tabs without Calendar in TabKey, and watching is explicitly placeholder/empty at MyTasksPmPage.tsx and MyTasksPmPage.tsx.

3. High: Kanban CES drag behavior is only partially implemented versus spec.  
   Evidence: PmViews.tsx states CES status_hint write is deferred.  
   This means the documented backend-integrated status_hint flow is not complete in this workspace implementation.

4. Medium: Notification architecture is partially implemented; decider supports only a subset of defined kinds in active logic.  
   Evidence: kinds are declared broadly at decider.ts, but implemented decision branches are mainly due_soon, overdue, blocked at decider.ts, decider.ts, decider.ts. Quiet-hours/digest behavior is typed but not fully enforced in decision flow.

5. Medium: Overlay data model in code is simplified versus architecture docs.  
   Evidence: pmOverlayStore.types.ts supports assigned_user_id as single assignee and lacks watcher arrays/start_date fields from the architecture spec.  
   Related placeholder: watcher behavior not modeled in My Tasks at MyTasksPmPage.tsx.

6. Medium: SVAR adapter isolation strategy is not reflected in file structure; implementation is consolidated/monolithic.  
   Evidence: no adapter files under the expected path from strategy docs, and Kanban/Gantt logic lives directly in PmViews.tsx and PmViews.tsx.  
   Also marked partial in-file for sprint board execute-only at PmViews.tsx.

**What is implemented well**
1. Canonical projection and duplicate-ID guard are in place: taskProjection.ts, taskProjectionCore.ts.
2. Stable task id generation format is implemented: taskProjectionCore.ts.
3. Unified selected-task + right panel pattern is implemented: selectedTaskStore.ts, TaskDetailRightPanel.tsx, GlobalTaskDrawer.tsx.
4. Dependency cycle checks are implemented in overlay writes: dependencyGraph.ts, pmOverlayStore.ts.
5. Sprint window core logic exists with year-edge handling: sprintWindows.ts, sprintWindows.ts.

**Reconciliation Verdict**
Not everything is implemented.  
Current state is: core PM projection and major UI surfaces are implemented, but architecture-level completeness is partial for backend PM endpoints in this repo, full My Tasks tab/spec parity, full notification behavior parity, and adapter-boundary/file-structure parity.

**Residual risks/testing gaps**
1. End-to-end PM writes depend on external PM API availability/config and are not verifiable from this repo alone.
2. No evidence yet of complete coverage tests matching all architecture acceptance checklists (especially notification matrix and full drag-rules matrix).

1. I can produce a doc-by-doc reconciliation matrix and update the PM markdown checklists with Implemented / Partial / Missing status.
2. I can implement the highest-impact gaps next (Calendar tab + Watching selector, full notification decider branches, and explicit PM route integration plan for local backend).You've used 60% of your weekly rate limit. Your weekly rate limit will reset on May 3 at 5:00 PM. [Learn More](https://aka.ms/github-copilot-rate-limit-error)