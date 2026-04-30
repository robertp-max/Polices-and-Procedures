/**
 * /api/pm/* — minimal local-first PM persistence.
 *
 * Storage: JSON files under <repo-root>/data/pm/
 * (gitignored; survives server restarts).
 *
 * Endpoints:
 *   GET  /api/pm/healthz
 *   GET  /api/pm/overlays               → { overlays }
 *   PUT  /api/pm/overlays/:taskId        → { overlay }
 *   DELETE /api/pm/overlays/:taskId      → { deleted }
 *   GET  /api/pm/personal               → { tasks }
 *   POST /api/pm/personal               → { task }
 *   PATCH /api/pm/personal/:taskId      → { task }
 *   DELETE /api/pm/personal/:taskId     → { deleted }
 *   GET  /api/pm/watchers               → { watchers }  (all rows)
 *   POST /api/pm/watchers               → { watcher }
 *   DELETE /api/pm/watchers/:taskId     → { deleted }
 *   GET  /api/pm/notifications          → { notifications }
 *   POST /api/pm/notifications          → { notification, deduped }
 *   POST /api/pm/notifications/ack      → { ok }
 */

import { Router, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const pmRouter: Router = Router();

// ── Storage helpers ─────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data/pm');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string, defaultValue: T): T {
  const full = path.join(DATA_DIR, file);
  if (!fs.existsSync(full)) return defaultValue;
  try { return JSON.parse(fs.readFileSync(full, 'utf8')) as T; } catch { return defaultValue; }
}

function writeJson(file: string, data: unknown): void {
  ensureDataDir();
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}

const nowISO = () => new Date().toISOString();

function asyncH(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response) => fn(req, res).catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: { code: 'pm_error', message: msg } });
  });
}

// ── Types ────────────────────────────────────────────────────────────────────
interface StoredOverlay {
  task_id: string;
  assigned_user_id?: string | null;
  created_by_user_id?: string | null;
  sprint_id?: string | null;
  story_points?: number | null;
  labels?: string[];
  due_date?: string | null;
  start_date?: string | null;
  status_hint?: string | null;
  weekend_override?: boolean | null;
  weekend_override_reason?: string | null;
  watcher_user_ids?: string[];
  notes?: string | null;
  updated_at?: string;
  updated_by?: string;
}

interface StoredPersonalTask {
  id: string;
  title: string;
  description?: string;
  created_by_user_id: string;
  assigned_user_id?: string;
  status: string;
  start_date?: string;
  due_date?: string;
  dependency_task_ids?: string[];
  watcher_user_ids?: string[];
  related_policy_ids?: string[];
  related_workflow_ids?: string[];
  related_form_ids?: string[];
  created_at: string;
  updated_at: string;
}

interface StoredWatcher {
  task_id: string;
  user_id: string;
  created_at: string;
}

interface StoredNotification {
  id: string;
  user_id: string;
  task_id: string;
  kind: string;
  window_token: string;
  payload?: Record<string, unknown>;
  created_at: string;
  read_at?: string;
}

// ── Health ───────────────────────────────────────────────────────────────────
pmRouter.get('/healthz', (_req, res) => {
  res.json({ ok: true, ts: nowISO() });
});

// ── Overlays ─────────────────────────────────────────────────────────────────
pmRouter.get('/overlays', asyncH(async (_req, res) => {
  const data = readJson<{ overlays: StoredOverlay[] }>('overlays.json', { overlays: [] });
  res.json(data);
}));

pmRouter.put('/overlays/:taskId', asyncH(async (req, res) => {
  const taskId = decodeURIComponent(req.params.taskId);
  const data = readJson<{ overlays: StoredOverlay[] }>('overlays.json', { overlays: [] });
  const actor = req.header('x-hhc-actor-id') ?? 'system';
  const body = req.body as Partial<StoredOverlay>;

  const idx = data.overlays.findIndex(o => o.task_id === taskId);
  const existing = idx >= 0 ? data.overlays[idx] : { task_id: taskId, labels: [], watcher_user_ids: [] };
  const updated: StoredOverlay = {
    ...existing,
    ...body,
    task_id: taskId,
    labels: body.labels ?? existing.labels ?? [],
    watcher_user_ids: body.watcher_user_ids ?? existing.watcher_user_ids ?? [],
    updated_at: nowISO(),
    updated_by: actor,
  };

  if (idx >= 0) {
    data.overlays[idx] = updated;
  } else {
    data.overlays.push(updated);
  }
  writeJson('overlays.json', data);
  res.json({ overlay: updated });
}));

pmRouter.delete('/overlays/:taskId', asyncH(async (req, res) => {
  const taskId = decodeURIComponent(req.params.taskId);
  const data = readJson<{ overlays: StoredOverlay[] }>('overlays.json', { overlays: [] });
  const before = data.overlays.length;
  data.overlays = data.overlays.filter(o => o.task_id !== taskId);
  writeJson('overlays.json', data);
  res.json({ deleted: data.overlays.length < before });
}));

// ── Personal tasks ────────────────────────────────────────────────────────────
pmRouter.get('/personal', asyncH(async (req, res) => {
  const owner = req.query.owner as string | undefined;
  const data = readJson<{ tasks: StoredPersonalTask[] }>('personal.json', { tasks: [] });
  const tasks = owner ? data.tasks.filter(t => t.created_by_user_id === owner) : data.tasks;
  res.json({ tasks });
}));

pmRouter.post('/personal', asyncH(async (req, res) => {
  const body = req.body as Partial<StoredPersonalTask> & { owner_user_id?: string };
  const actor = req.header('x-hhc-actor-id') ?? body.created_by_user_id ?? body.owner_user_id ?? 'system';
  const data = readJson<{ tasks: StoredPersonalTask[] }>('personal.json', { tasks: [] });

  const task: StoredPersonalTask = {
    id: `personal:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: body.title ?? '(untitled)',
    description: body.description,
    created_by_user_id: actor,
    assigned_user_id: body.assigned_user_id ?? actor,
    status: body.status ?? 'todo',
    start_date: body.start_date,
    due_date: body.due_date,
    dependency_task_ids: body.dependency_task_ids ?? [],
    watcher_user_ids: body.watcher_user_ids ?? [],
    related_policy_ids: body.related_policy_ids ?? [],
    related_workflow_ids: body.related_workflow_ids ?? [],
    related_form_ids: body.related_form_ids ?? [],
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  data.tasks.push(task);
  writeJson('personal.json', data);
  res.json({ task });
}));

pmRouter.patch('/personal/:taskId', asyncH(async (req, res) => {
  const taskId = decodeURIComponent(req.params.taskId);
  const body = req.body as Partial<StoredPersonalTask>;
  const data = readJson<{ tasks: StoredPersonalTask[] }>('personal.json', { tasks: [] });
  const idx = data.tasks.findIndex(t => t.id === taskId);
  if (idx < 0) { res.status(404).json({ error: { code: 'not_found', message: 'Task not found' } }); return; }
  data.tasks[idx] = { ...data.tasks[idx], ...body, id: taskId, updated_at: nowISO() };
  writeJson('personal.json', data);
  res.json({ task: data.tasks[idx] });
}));

pmRouter.delete('/personal/:taskId', asyncH(async (req, res) => {
  const taskId = decodeURIComponent(req.params.taskId);
  const data = readJson<{ tasks: StoredPersonalTask[] }>('personal.json', { tasks: [] });
  const before = data.tasks.length;
  data.tasks = data.tasks.filter(t => t.id !== taskId);
  writeJson('personal.json', data);
  res.json({ deleted: data.tasks.length < before });
}));

// ── Watchers ──────────────────────────────────────────────────────────────────
pmRouter.get('/watchers', asyncH(async (req, res) => {
  const userId = req.query.user_id as string | undefined;
  const taskId = req.query.task_id as string | undefined;
  const data = readJson<{ watchers: StoredWatcher[] }>('watchers.json', { watchers: [] });
  let rows = data.watchers;
  if (userId) rows = rows.filter(w => w.user_id === userId);
  if (taskId) rows = rows.filter(w => w.task_id === taskId);
  res.json({ watchers: rows });
}));

pmRouter.post('/watchers', asyncH(async (req, res) => {
  const { task_id, user_id } = req.body as { task_id?: string; user_id?: string };
  if (!task_id || !user_id) {
    res.status(400).json({ error: { code: 'bad_request', message: 'task_id and user_id required' } });
    return;
  }
  const data = readJson<{ watchers: StoredWatcher[] }>('watchers.json', { watchers: [] });
  const existing = data.watchers.find(w => w.task_id === task_id && w.user_id === user_id);
  if (existing) { res.json({ watcher: existing, created: false }); return; }
  const watcher: StoredWatcher = { task_id, user_id, created_at: nowISO() };
  data.watchers.push(watcher);
  writeJson('watchers.json', data);

  // Also update overlay watcher_user_ids for the task
  const overlays = readJson<{ overlays: StoredOverlay[] }>('overlays.json', { overlays: [] });
  const oidx = overlays.overlays.findIndex(o => o.task_id === task_id);
  if (oidx >= 0) {
    const ids = new Set(overlays.overlays[oidx].watcher_user_ids ?? []);
    ids.add(user_id);
    overlays.overlays[oidx].watcher_user_ids = [...ids];
  } else {
    overlays.overlays.push({ task_id, labels: [], watcher_user_ids: [user_id], updated_at: nowISO() });
  }
  writeJson('overlays.json', overlays);

  res.json({ watcher, created: true });
}));

pmRouter.delete('/watchers/:taskId', asyncH(async (req, res) => {
  const taskId = decodeURIComponent(req.params.taskId);
  const userId = req.query.user_id as string | undefined;
  const data = readJson<{ watchers: StoredWatcher[] }>('watchers.json', { watchers: [] });
  const before = data.watchers.length;
  data.watchers = data.watchers.filter(w => !(w.task_id === taskId && (!userId || w.user_id === userId)));
  writeJson('watchers.json', data);

  if (userId) {
    const overlays = readJson<{ overlays: StoredOverlay[] }>('overlays.json', { overlays: [] });
    const oidx = overlays.overlays.findIndex(o => o.task_id === taskId);
    if (oidx >= 0) {
      overlays.overlays[oidx].watcher_user_ids = (overlays.overlays[oidx].watcher_user_ids ?? [])
        .filter(id => id !== userId);
      writeJson('overlays.json', overlays);
    }
  }
  res.json({ deleted: data.watchers.length < before });
}));

// ── Notifications ─────────────────────────────────────────────────────────────
pmRouter.get('/notifications', asyncH(async (req, res) => {
  const userId = req.query.user_id as string | undefined;
  const data = readJson<{ notifications: StoredNotification[] }>('notifications.json', { notifications: [] });
  const rows = userId ? data.notifications.filter(n => n.user_id === userId) : data.notifications;
  res.json({ user_id: userId, notifications: rows });
}));

pmRouter.post('/notifications', asyncH(async (req, res) => {
  const body = req.body as Partial<StoredNotification>;
  if (!body.user_id || !body.task_id || !body.kind || !body.window_token) {
    res.status(400).json({ error: { code: 'bad_request', message: 'user_id, task_id, kind, window_token required' } });
    return;
  }
  const data = readJson<{ notifications: StoredNotification[] }>('notifications.json', { notifications: [] });
  const existing = data.notifications.find(n => n.window_token === body.window_token);
  if (existing) { res.json({ deduped: true, notification: existing }); return; }
  const notification: StoredNotification = {
    id: body.id ?? `notif-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    user_id: body.user_id,
    task_id: body.task_id,
    kind: body.kind,
    window_token: body.window_token,
    payload: body.payload,
    created_at: nowISO(),
  };
  data.notifications.push(notification);
  // Keep last 2000
  if (data.notifications.length > 2000) data.notifications = data.notifications.slice(-2000);
  writeJson('notifications.json', data);
  res.json({ deduped: false, notification });
}));

pmRouter.post('/notifications/ack', asyncH(async (req, res) => {
  const { notification_id } = req.body as { user_id?: string; sk?: string; notification_id?: string };
  if (!notification_id) { res.status(400).json({ error: { code: 'bad_request', message: 'notification_id required' } }); return; }
  const data = readJson<{ notifications: StoredNotification[] }>('notifications.json', { notifications: [] });
  const idx = data.notifications.findIndex(n => n.id === notification_id);
  if (idx >= 0) { data.notifications[idx].read_at = nowISO(); writeJson('notifications.json', data); }
  res.json({ ok: true });
}));
