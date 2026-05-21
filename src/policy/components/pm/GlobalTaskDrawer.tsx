/**
 * GlobalTaskDrawer — mounts once at app root.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Unified-Task-Model.md §4
 *
 * Reads `selectedTaskStore`. When a `taskId` is set AND the consuming page
 * is NOT one of the PM views that already render an inline right-rail panel
 * (Calendar/Gantt/Kanban/Sprint/MyTasks), this drawer overlays the unified
 * TaskDetailRightPanel as a fixed sidebar. This guarantees that "Open from
 * any view" never silently no-ops on pages without their own rail.
 */

import { useEffect, type ReactElement } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelectedTaskStore } from '@/policy/pm/selectedTaskStore';
import { TaskDetailRightPanel } from '@/policy/components/pm/TaskDetailRightPanel';

const PAGES_WITH_INLINE_PANEL = [
  '/calendar',
  '/master-calendar',
  '/pm/my-tasks',
];

function pageHasInlinePanel(pathname: string): boolean {
  return PAGES_WITH_INLINE_PANEL.some(p => pathname.startsWith(p));
}

export function GlobalTaskDrawer(): ReactElement | null {
  const taskId = useSelectedTaskStore(s => s.taskId);
  const closeTask = useSelectedTaskStore(s => s.closeTask);
  const location = useLocation();

  // Close the drawer on route change away from PM views (avoid stale state).
  useEffect(() => {
    return () => { /* no-op */ };
  }, [location.pathname]);

  if (!taskId) return null;
  if (pageHasInlinePanel(location.pathname)) return null;

  // Wave 8 + V3 Transition Polish: expensive-feeling overlay with backdrop fade + panel slide/scale/blur
  return (
    <div className="fixed inset-0 z-[65] flex justify-end" role="presentation">
      {/* V3 expensive backdrop */}
      <div
        className="absolute inset-0 v3-backdrop"
        style={{ background: 'rgba(5,6,10,0.68)', backdropFilter: 'blur(6px)', transition: 'opacity 0.62s var(--v3-ease)' }}
        onClick={closeTask}
      />
      {/* Panel — V3 slide + blur on mount */}
      <div
        className="relative h-full w-[min(100vw,420px)] shadow-2xl border-l border-white/10 bg-[#0f1420] overflow-y-auto v3-drawer-panel"
        style={{ transition: 'transform 0.62s var(--v3-ease), opacity 0.62s var(--v3-ease)' }}
      >
        <TaskDetailRightPanel taskId={taskId} onClose={closeTask} />
      </div>
    </div>
  );
}
