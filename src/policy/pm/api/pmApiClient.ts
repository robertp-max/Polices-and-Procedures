/**
 * Thin client for the HHC PM API Lambda.
 * Base URL overridable via VITE_HHC_API_BASE; defaults to the deployed demo endpoint.
 *
 * All endpoints expect actor-identity headers (x-hhc-actor-id / x-hhc-actor-role).
 * Read failures are returned as `null` (caller falls back to local cache).
 * Write failures throw — the calling store can decide whether to keep the optimistic
 * local mutation or revert.
 */

const API_BASE: string =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_HHC_API_BASE ||
  'https://rtllnugat0.execute-api.us-west-1.amazonaws.com';

function actorHeaders(): Record<string, string> {
  const id   = (typeof localStorage !== 'undefined' && localStorage.getItem('hhc_actor_id'))   || 'me';
  const role = (typeof localStorage !== 'undefined' && localStorage.getItem('hhc_actor_role')) || 'user';
  return {
    'Content-Type': 'application/json',
    'x-hhc-actor-id':   id,
    'x-hhc-actor-role': role,
  };
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: actorHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed: unknown = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  if (!res.ok) {
    const msg = (parsed && typeof parsed === 'object' && 'error' in parsed) ? String((parsed as { error: unknown }).error) : `${res.status}`;
    throw Object.assign(new Error(`pm-api ${method} ${path} → ${res.status}: ${msg}`), { status: res.status, body: parsed });
  }
  return parsed as T;
}

// ── Overlay ────────────────────────────────────────────────────
export interface ApiOverlay {
  task_id: string;
  assigned_user_id?: string | null;
  sprint_id?: string | null;
  story_points?: number | null;
  labels?: string[];
  due_date?: string | null;
  start_date?: string | null;
  weekend_override?: boolean | null;
  weekend_override_reason?: string | null;
  updated_at?: string;
  updated_by?: string;
}

export const pmApi = {
  base: API_BASE,
  health:        () => call<{ ok: boolean; ts: string }>('GET', '/pm/healthz'),

  listOverlays:  () => call<{ overlays: ApiOverlay[] }>('GET', '/pm/overlays'),
  getOverlay:    (taskId: string) => call<{ overlay: ApiOverlay | null }>('GET', `/pm/overlays/${encodeURIComponent(taskId)}`),
  putOverlay:    (taskId: string, patch: Partial<ApiOverlay> & { reason?: string }) =>
                  call<{ overlay: ApiOverlay }>('PUT', `/pm/overlays/${encodeURIComponent(taskId)}`, patch),
  deleteOverlay: (taskId: string) => call<{ deleted: boolean }>('DELETE', `/pm/overlays/${encodeURIComponent(taskId)}`),

  listPersonal:  (ownerId?: string) =>
                  call<{ tasks: Array<Record<string, unknown>> }>('GET', `/pm/personal${ownerId ? `?owner=${encodeURIComponent(ownerId)}` : ''}`),
  createPersonal:(input: Record<string, unknown>) =>
                  call<{ task: Record<string, unknown> }>('POST', '/pm/personal', input),
  updatePersonal:(taskId: string, patch: Record<string, unknown>) =>
                  call<{ task: Record<string, unknown> }>('PATCH', `/pm/personal/${encodeURIComponent(taskId)}`, patch),
  deletePersonal:(taskId: string) =>
                  call<{ deleted: boolean }>('DELETE', `/pm/personal/${encodeURIComponent(taskId)}`),

  listEdges:     (taskId?: string) =>
                  call<{ edges?: Array<{from:string;to:string}>; incoming?: Array<{from:string;to:string;type:string}>; task_id?: string }>(
                    'GET', `/pm/dependencies${taskId ? `?task_id=${encodeURIComponent(taskId)}` : ''}`),
  addDependency: (from: string, to: string, type?: string) =>
                  call<{ created: boolean; edge?: {from:string;to:string;type:string}; reason?: string }>(
                    'POST', '/pm/dependencies', { from_task_id: from, to_task_id: to, type }),
  removeDependency: (from: string, to: string) =>
                  call<{ deleted: boolean }>('DELETE', '/pm/dependencies', { from_task_id: from, to_task_id: to }),

  listAudit:     (taskId: string) =>
                  call<{ task_id: string; audit: Array<Record<string, unknown>> }>(
                    'GET', `/pm/audit?task_id=${encodeURIComponent(taskId)}`),

  listWatchers:  (opts?: { user_id?: string; task_id?: string }) => {
                  const qs = new URLSearchParams();
                  if (opts?.user_id)  qs.set('user_id', opts.user_id);
                  if (opts?.task_id)  qs.set('task_id', opts.task_id);
                  const q = qs.toString();
                  return call<{ watchers: Array<{ task_id: string; user_id: string; created_at: string }> }>(
                    'GET', `/pm/watchers${q ? `?${q}` : ''}`);
                  },
  addWatcher:    (taskId: string, userId: string) =>
                  call<{ watcher: { task_id: string; user_id: string }; created: boolean }>(
                    'POST', '/pm/watchers', { task_id: taskId, user_id: userId }),
  removeWatcher: (taskId: string, userId: string) =>
                  call<{ deleted: boolean }>(
                    'DELETE', `/pm/watchers/${encodeURIComponent(taskId)}?user_id=${encodeURIComponent(userId)}`),

  listNotifications: (userId: string) =>
                  call<{ user_id: string; notifications: Array<Record<string, unknown>> }>(
                    'GET', `/pm/notifications?user_id=${encodeURIComponent(userId)}`),
  createNotification: (input: {
    user_id: string;
    task_id: string;
    kind: string;
    window_token: string;
    payload?: Record<string, unknown>;
    id?: string;
  }) =>
                  call<{ deduped: boolean; notification: Record<string, unknown> }>(
                    'POST', '/pm/notifications', input),
  ackNotification: (userId: string, sk: string, notificationId: string) =>
                  call<{ ok: boolean }>('POST', '/pm/notifications/ack', { user_id: userId, sk, notification_id: notificationId }),
};

/**
 * Fire-and-forget mirror: invoke an API call but never throw.
 * Used by stores that keep the optimistic local mutation as authoritative.
 */
export function mirror<T>(promise: Promise<T>): void {
  promise.catch(err => {
    // eslint-disable-next-line no-console
    console.warn('[pm-api mirror failed]', err?.message || err);
  });
}
