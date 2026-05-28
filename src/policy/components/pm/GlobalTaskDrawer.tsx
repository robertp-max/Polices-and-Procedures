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
import { V3TaskDetailPanel } from '@/policy/components/pm/V3TaskDetailPanel';
import { V3StackedDrawerHost, type DrawerLayer } from '@/policy/components/ui/V3StackedDrawerHost';

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

  const layers: DrawerLayer[] = [{ type: 'task', taskId }];

  return (
    <V3StackedDrawerHost
      drawers={layers}
      onPop={closeTask}
      onCloseAll={closeTask}
      getLayerEyebrow={(layer) => layer.type === 'task' ? layer.taskId : layer.type}
      getLayerTitle={() => 'Task detail'}
      renderLayer={(layer) => (
        layer.type === 'task'
          ? <V3TaskDetailPanel taskId={layer.taskId} onClose={closeTask} />
          : null
      )}
    />
  );
}
