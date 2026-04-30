/** PM overlay shape — separated to break import cycles. */
export interface PmOverlay {
  task_id: string;
  /** User currently assigned to this task. */
  assigned_user_id?: string;
  /** User who created or pinned this overlay. */
  created_by_user_id?: string;
  /** Sprint this task is pinned to. */
  sprint_id?: string;
  story_points?: number;
  labels: string[];
  dependencies: string[];
  /** ISO-8601 date string (YYYY-MM-DD). */
  due_date?: string;
  /** ISO-8601 date string (YYYY-MM-DD); when work is expected to start. */
  start_date?: string;
  /** PM-layer status hint; does NOT affect CES/eCIgn state. */
  status_hint?: 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done';
  /** User IDs subscribed to watch updates on this task. */
  watcher_user_ids: string[];
  /** Free-form PM notes; never synced to CES. */
  notes?: string;
  weekend_override?: boolean;
  weekend_override_reason?: string;
  updated_at?: string;
}
