/**
 * MyTasksPmPage — PM-aware My Tasks surface.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Kanban-and-My-Tasks.md §2
 *
 * Tabs: Today · This Sprint · Upcoming · Personal · Watching · Calendar
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
import { PmTaskCard } from './PmTaskCard';
import { PmFilterBar, applyPmFilter, type PmFilterState } from './PmFilterBar';
import { TaskDetailRightPanel } from './TaskDetailRightPanel';
import { useSelectedTaskStore } from '@/policy/pm/selectedTaskStore';
import { NotificationCenter } from './NotificationCenter';
import { usePmNotificationTicker } from '@/policy/pm/notificationTicker';

type TabKey = 'today' | 'sprint' | 'upcoming' | 'personal' | 'watching';

const TAB_LABEL: Record<TabKey, string> = {
  today: 'Today',
  sprint: 'This Sprint',
  upcoming: 'Upcoming',
  personal: 'Personal',
  watching: 'Watching',
};

export interface MyTasksPmPageProps {
  /** Current user id; defaults to the dev placeholder. */
  userId?: string;
  /** Optional handler for "Open form" deep links. */
  onOpenForm?: (formId: string) => void;
}

export function MyTasksPmPage({
  userId = 'me',
  onOpenForm,
}: MyTasksPmPageProps): ReactElement {
  const tasks = useProjectedTasks();
  const personal = usePmPersonalStore();
  const sprint = currentSprint();

  // Hydrate from backend on first mount; local cache stays valid if API is down.
  useEffect(() => {
    void usePmPersonalStore.getState().hydrateFromApi(userId);
    void usePmOverlayStore.getState().hydrateFromApi();
  }, [userId]);

  // Phase 4: notification ticker
  usePmNotificationTicker(userId);

  const [tab, setTab] = useState<TabKey>('today');
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

  const isMine = (t: Task): boolean => {
    if (isPersonalTask(t)) return t.owner_user_id === userId;
    return (t as { assigned_user_id?: string }).assigned_user_id === userId;
  };

  const tabTasks: Task[] = useMemo(() => {
    const inWindow = (t: Task, fromDays: number, toDays: number): boolean => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date + (t.due_date.length === 10 ? 'T00:00:00' : '')).getTime();
      const days = Math.round((d - todayMs) / 86400000);
      return days >= fromDays && days <= toDays;
    };
    switch (tab) {
      case 'today':
        return tasks.filter(
          t =>
            isMine(t) &&
            t.status !== 'done' &&
            (inWindow(t, -3650, 0) || t.status === 'in_progress'),
        );
      case 'sprint':
        return tasks.filter(t => isMine(t) && t.sprint_id === sprint.id);
      case 'upcoming':
        return tasks.filter(t => isMine(t) && inWindow(t, 1, 14));
      case 'personal':
        return tasks.filter(t => isPersonalTask(t) && t.owner_user_id === userId);
      case 'watching':
        // Watchers are not yet modeled in PmOverlay; surface tasks the user
        // is NOT assigned to but recently audited (placeholder: empty).
        return [];
      default:
        return [];
    }
  }, [tab, tasks, userId, sprint.id, todayMs]);

  const filtered = useMemo(() => applyPmFilter(tabTasks, filter), [tabTasks, filter]);

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

        {/* Tabs */}
        <nav className="flex gap-1 border-b border-white/10">
          {(Object.keys(TAB_LABEL) as TabKey[]).map(k => {
            const active = tab === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`px-3 py-1.5 text-[11px] font-montserrat uppercase tracking-[0.22em] border-b-2 transition-colors ${
                  active
                    ? 'border-cyan-400 text-white'
                    : 'border-transparent text-white/55 hover:text-white/85'
                }`}
              >
                {TAB_LABEL[k]}
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

        {/* Filter bar */}
        <PmFilterBar value={filter} onChange={setFilter} tasks={tabTasks} />

        {/* Task list */}
        <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-2">
          {filtered.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/45 text-[12px] font-outfit">
              {tab === 'watching'
                ? 'Watcher relations not yet recorded.'
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
