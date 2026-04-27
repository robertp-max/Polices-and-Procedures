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

  return (
    <div className="fixed top-0 right-0 h-full w-[420px] z-50 shadow-2xl border-l border-white/10 bg-[#0f1420] overflow-y-auto">
      <TaskDetailRightPanel taskId={taskId} onClose={closeTask} />
    </div>
  );
}
