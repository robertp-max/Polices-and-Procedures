/** PM overlay shape — separated to break import cycles. */
export interface PmOverlay {
  task_id: string;
  assigned_user_id?: string;
  sprint_id?: string;
  story_points?: number;
  labels: string[];
  dependencies: string[];
  due_date?: string;
  weekend_override?: boolean;
  weekend_override_reason?: string;
  updated_at?: string;
}
