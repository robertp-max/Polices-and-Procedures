/**
 * MyTasksPmPage — PM-aware My Tasks surface.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Kanban-and-My-Tasks.md §2
 *
 * Tabs (8):
 *   Assigned to Me · Created by Me · Watching · Calendar
 *   Personal Tasks · Blocked · Overdue · Completed
 *
 * Reuses PmTaskCard + PmFilterBar + TaskDetailRightPanel.
 * Compliance constraint: no "Mark Done" button anywhere for CES tasks.
 */

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { useProjectedTasks } from '@/policy/pm/taskProjection';
import { usePmPersonalStore } from '@/policy/pm/personalStore';
import { usePmOverlayStore } from '@/policy/pm/pmOverlayStore';
import { currentSprint } from '@/policy/pm/sprintWindows';
import { isPersonalTask, type Task } from '@/policy/pm/types';
import { getCurrentUserId } from '@/policy/pm/currentUser';
import { PmTaskCard } from './PmTaskCard';
import { PmFilterBar, applyPmFilter, type PmFilterState } from './PmFilterBar';
import { TaskDetailRightPanel } from './TaskDetailRightPanel';
import { useSelectedTaskStore } from '@/policy/pm/selectedTaskStore';
import { NotificationCenter } from './NotificationCenter';
import { usePmNotificationTicker } from '@/policy/pm/notificationTicker';

// ── Tab definitions ──────────────────────────────────────────────────────────
type TabKey =
  | 'assigned'
  | 'created'
  | 'watching'
  | 'calendar'
  | 'personal'
  | 'blocked'
  | 'overdue'
  | 'completed';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'assigned',  label: 'Assigned to Me' },
  { key: 'created',   label: 'Created by Me'  },
  { key: 'watching',  label: 'Watching'       },
  { key: 'calendar',  label: 'Calendar'       },
  { key: 'personal',  label: 'Personal Tasks' },
  { key: 'blocked',   label: 'Blocked'        },
  { key: 'overdue',   label: 'Overdue'        },
  { key: 'completed', label: 'Completed'      },
];

// ── Calendar grouping helpers ────────────────────────────────────────────────
interface CalendarGroup {
  label: string;
  tasks: Task[];
}

function groupByDate(tasks: Task[], todayMs: number): CalendarGroup[] {
  const scheduled: Map<string, Task[]> = new Map();
  const unscheduled: Task[] = [];

  for (const t of tasks) {
    const dateStr = t.due_date ?? (t as { start_date?: string }).start_date;
    if (!dateStr) { unscheduled.push(t); continue; }
    const bucket = dateStr.slice(0, 10);
    if (!scheduled.has(bucket)) scheduled.set(bucket, []);
    scheduled.get(bucket)!.push(t);
  }

  const sortedKeys = [...scheduled.keys()].sort();
  const todayStr = new Date(todayMs).toISOString().slice(0, 10);

  const groups: CalendarGroup[] = sortedKeys.map(dateStr => {
    const d = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.round((new Date(dateStr + 'T00:00:00').getTime() - todayMs) / 86_400_000);
    let label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    if (dateStr === todayStr)   label = `Today — ${label}`;
    else if (diffDays === 1)    label = `Tomorrow — ${label}`;
    else if (diffDays === -1)   label = `Yesterday — ${label}`;
    else if (diffDays < 0)      label = `${Math.abs(diffDays)}d ago — ${label}`;
    return { label, tasks: scheduled.get(dateStr)! };
  });

  if (unscheduled.length > 0) {
    groups.push({ label: 'Unscheduled', tasks: unscheduled });
  }

  return groups;
}

// ── Component ────────────────────────────────────────────────────────────────
export interface MyTasksPmPageProps {
  /** Current user id; falls back to getCurrentUserId() / localStorage. */
  userId?: string;
  /** Optional handler for "Open form" deep links. */
  onOpenForm?: (formId: string) => void;
}

export function MyTasksPmPage({
  userId: userIdProp,
  onOpenForm,
}: MyTasksPmPageProps): ReactElement {
  const userId = userIdProp ?? getCurrentUserId();

  const tasks = useProjectedTasks();
  const personal = usePmPersonalStore();
  const overlays = usePmOverlayStore(s => s.overlays);
  const sprint = currentSprint();

  // Hydrate from backend on first mount; local cache stays valid if API is down.
  useEffect(() => {
    void usePmPersonalStore.getState().hydrateFromApi(userId);
    void usePmOverlayStore.getState().hydrateFromApi();
  }, [userId]);

  // Phase 4: notification ticker
  usePmNotificationTicker(userId);

  const [tab, setTab] = useState<TabKey>('assigned');
  const [filter, setFilter] = useState<PmFilterState>({});
  const activeTaskId = useSelectedTaskStore(s => s.taskId);
  const openTaskGlobal = useSelectedTaskStore(s => s.openTask);
  const closeTaskGlobal = useSelectedTaskStore(s => s.closeTask);
  const setActiveTaskId = (id: string | null) => (id ? openTaskGlobal(id, 'my-tasks') : closeTaskGlobal());
  const [newTitle, setNewTitle] = useState('');

  const todayMs = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  }, []);

  // ── Per-tab task lists ───────────────────────────────────────────────────
  const tabTasks: Task[] = useMemo(() => {
    const isAssignedToMe = (t: Task): boolean => {
      if (isPersonalTask(t)) return t.owner_user_id === userId;
      return (t as { assigned_user_id?: string }).assigned_user_id === userId;
    };

    const isCreatedByMe = (t: Task): boolean => {
      // Personal tasks always "created by me" if owner matches
      if (isPersonalTask(t)) return t.owner_user_id === userId;
      // For overlay tasks check created_by_user_id
      const overlay = overlays[t.task_id];
      return overlay?.created_by_user_id === userId;
    };

    const isWatching = (t: Task): boolean => {
      const overlay = overlays[t.task_id];
      return (overlay?.watcher_user_ids ?? []).includes(userId);
    };

    const isBlocked = (t: Task): boolean => {
      if (t.status === 'blocked') return true;
      // Use the task's already-merged dependency list (applyOverlay merges
      // overlay.dependencies into task.depends_on at projection time).
      const deps = t.depends_on ?? t.dependencies ?? [];
      if (deps.length === 0) return false;
      return deps.some(depId => {
        const dep = tasks.find(d => d.task_id === depId);
        return dep ? dep.status !== 'done' : false;
      });
    };

    switch (tab) {
      case 'assigned':
        return tasks.filter(t => isAssignedToMe(t) && t.status !== 'done');

      case 'created':
        return tasks.filter(t => isCreatedByMe(t) && t.status !== 'done');

      case 'watching':
        return tasks.filter(t => isWatching(t) && t.status !== 'done');

      case 'calendar':
        // All active tasks with dates visible to this user
        return tasks.filter(t => t.status !== 'done' && (isAssignedToMe(t) || isWatching(t)));

      case 'personal':
        return tasks.filter(t => isPersonalTask(t) && t.owner_user_id === userId);

      case 'blocked':
        return tasks.filter(t => t.status !== 'done' && isBlocked(t));

      case 'overdue': {
        const todayIso = new Date(todayMs).toISOString().slice(0, 10);
        return tasks.filter(t => {
          if (t.status === 'done') return false;
          const dd = t.due_date;
          return dd ? dd < todayIso : false;
        });
      }

      case 'completed':
        return tasks.filter(t => t.status === 'done');

      default:
        return [];
    }
  }, [tab, tasks, userId, overlays, todayMs]);

  const filtered = useMemo(() => applyPmFilter(tabTasks, filter), [tabTasks, filter]);

  // ── Calendar groups (only used in calendar tab) ─────────────────────────
  const calendarGroups = useMemo(
    () => (tab === 'calendar' ? groupByDate(filtered, todayMs) : []),
    [tab, filtered, todayMs],
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-0 gap-3">
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.22em] text-white/55">
              My Tasks
            </div>
            <div className="text-[18px] font-outfit text-white">
              Sprint <span className="font-mono">{sprint.id}</span>
              <span className="text-white/55 text-[12px] ml-2">
                {sprint.startDate} → {sprint.endDate}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#/pm/sprint-plan"
              onClick={e => { e.preventDefault(); window.location.hash = '/pm/sprint-plan'; window.location.assign('/pm/sprint-plan'); }}
              className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 hover:text-cyan-100"
            >
              Sprint Plan
            </a>
            <a
              href="#/pm/sprint-review"
              onClick={e => { e.preventDefault(); window.location.assign('/pm/sprint-review'); }}
              className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 hover:text-cyan-100"
            >
              Review
            </a>
            <a
              href="#/pm/approvals"
              onClick={e => { e.preventDefault(); window.location.assign('/pm/approvals'); }}
              className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 hover:text-cyan-100"
            >
              Approvals
            </a>
            <a
              href="#/pm/dashboard"
              onClick={e => { e.preventDefault(); window.location.assign('/pm/dashboard'); }}
              className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 hover:text-cyan-100"
            >
              Dashboard
            </a>
            <NotificationCenter userId={userId} onOpenTask={(id) => setActiveTaskId(id)} />
            <div className="text-[10px] font-mono text-white/55">user: {userId}</div>
          </div>
        </header>

        {/* Tabs — scrollable on narrow viewports */}
        <nav className="flex gap-0 border-b border-white/10 overflow-x-auto">
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`shrink-0 px-3 py-1.5 text-[10px] font-montserrat uppercase tracking-[0.2em] border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? 'border-cyan-400 text-white'
                    : 'border-transparent text-white/55 hover:text-white/85'
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Personal quick-add */}
        {tab === 'personal' && (
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!newTitle.trim()) return;
              personal.create({ owner_user_id: userId, title: newTitle.trim() }, userId);
              setNewTitle('');
            }}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
          >
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Add a personal task and press Enter…"
              className="flex-1 bg-transparent text-white text-[12px] font-outfit outline-none placeholder:text-white/35"
            />
            <button
              type="submit"
              className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 hover:text-cyan-100"
            >
              Add
            </button>
          </form>
        )}

        {/* Filter bar (hidden for calendar view where grouping is the primary structure) */}
        {tab !== 'calendar' && (
          <PmFilterBar value={filter} onChange={setFilter} tasks={tabTasks} />
        )}

        {/* ── Task list / Calendar view ──────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-2">
          {tab === 'calendar' ? (
            calendarGroups.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/45 text-[12px] font-outfit">
                No active tasks with dates.
              </div>
            ) : (
              <div className="space-y-4">
                {calendarGroups.map(group => (
                  <div key={group.label}>
                    <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.22em] text-white/45 mb-1.5 px-1">
                      {group.label}
                    </div>
                    <div className="space-y-1.5">
                      {group.tasks.map(t => (
                        <PmTaskCard
                          key={t.task_id}
                          task={t}
                          onSelect={setActiveTaskId}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filtered.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/45 text-[12px] font-outfit">
              {tab === 'watching'
                ? 'You are not watching any tasks yet. Open a task and click Watch to subscribe.'
                : tab === 'blocked'
                ? 'No blocked tasks.'
                : tab === 'overdue'
                ? 'No overdue tasks — great work!'
                : tab === 'completed'
                ? 'No completed tasks yet.'
                : 'No tasks match the current filter.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(t => (
                <PmTaskCard
                  key={t.task_id}
                  task={t}
                  onSelect={setActiveTaskId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right detail panel */}
      <div className="w-[420px] shrink-0 min-h-0 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02]">
        {activeTaskId ? (
          <TaskDetailRightPanel
            taskId={activeTaskId}
            onOpenForm={onOpenForm}
            onClose={() => setActiveTaskId(null)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-white/45 text-[12px] font-outfit p-6 text-center">
            Select a task to view details.
          </div>
        )}
      </div>
    </div>
  );
}
