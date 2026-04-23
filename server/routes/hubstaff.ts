import { Router } from 'express';
import { env } from '../env.js';
import { log } from '../logger.js';

/* ═══════════════════════════════════════════════════════════════
   Hubstaff API Proxy — /api/hubstaff/*
   Keeps the PAT server-side. All calls from the UI go through here.
   ═══════════════════════════════════════════════════════════════ */

export const hubstaffRouter: Router = Router();

const BASE = 'https://api.hubstaff.com/v2';

function pat(): string {
  return env.hubstaffPat;
}

async function hs<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
  const token = pat();
  if (!token) throw Object.assign(new Error('HUBSTAFF_PAT not set in .env'), { status: 503 });

  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      'Authorization': `ApiToken ${token}`,
      'Content-Type':  'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    const err = Object.assign(new Error(`Hubstaff ${res.status}: ${txt}`), { status: res.status });
    throw err;
  }
  return res.json() as Promise<T>;
}

function asyncH(fn: (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>) {
  return (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

/* ── GET /api/hubstaff/auth ─────────────────────────────────── */
/* Verify PAT is set and valid. Returns org + user info.        */
hubstaffRouter.get('/auth', asyncH(async (_req, res) => {
  const token = pat();
  if (!token) {
    res.status(503).json({ ok: false, error: 'HUBSTAFF_PAT not configured in .env' });
    return;
  }
  const me = await hs<{ user: { id: number; name: string; email: string } }>('GET', '/users/me');
  const orgs = await hs<{ organizations: { id: number; name: string; status: string }[] }>('GET', '/organizations');
  log.info('hubstaff.auth.ok', { user: me.user.name });
  res.json({ ok: true, user: me.user, organizations: orgs.organizations });
}));

/* ── GET /api/hubstaff/projects/:id/tasks ───────────────────── */
/* Fetch all task IDs from a project (paginated).               */
hubstaffRouter.get('/projects/:id/tasks', asyncH(async (req, res) => {
  const projectId = req.params.id;
  const tasks: { id: number; summary: string }[] = [];
  let pageStartId: number | undefined;

  do {
    const params = new URLSearchParams({ page_limit: '100' });
    if (pageStartId) params.set('page_start_id', String(pageStartId));
    const data = await hs<{ tasks: { id: number; summary: string }[]; pagination?: { next_page_start_id?: number } }>(
      'GET', `/projects/${projectId}/tasks?${params}`,
    );
    tasks.push(...(data.tasks ?? []));
    pageStartId = data.pagination?.next_page_start_id;
  } while (pageStartId);

  // Extract [EVT-ID] tags from existing task summaries
  const existingIds = tasks
    .map(t => { const m = t.summary.match(/^\[([A-Z0-9\-]+)\]/); return m ? m[1] : null; })
    .filter(Boolean) as string[];

  res.json({ count: tasks.length, existingIds });
}));

/* ── POST /api/hubstaff/projects ────────────────────────────── */
/* Create a new Hubstaff project under the given org.           */
hubstaffRouter.post('/projects', asyncH(async (req, res) => {
  const { orgId, name, description } = req.body as { orgId: string; name: string; description: string };
  if (!orgId || !name) { res.status(400).json({ error: 'orgId and name required' }); return; }

  const data = await hs<{ project: { id: number; name: string } }>(
    'POST', `/organizations/${orgId}/projects`,
    { name, description: description ?? '', billable: false, status: 'active' },
  );
  log.info('hubstaff.project.created', { id: data.project.id, name });
  res.json({ project: data.project });
}));

/* ── POST /api/hubstaff/projects/:id/tasks ──────────────────── */
/* Create a single task in a project.                           */
hubstaffRouter.post('/projects/:id/tasks', asyncH(async (req, res) => {
  const projectId = req.params.id;
  const { taskId, title, description, dueDate } = req.body as {
    taskId: string; title: string; description: string; dueDate?: string;
  };
  if (!taskId || !title) { res.status(400).json({ error: 'taskId and title required' }); return; }

  await hs('POST', `/projects/${projectId}/tasks`, {
    summary:     `[${taskId}] ${title}`,
    description: description ?? '',
    due_date:    dueDate,
    status:      'open',
  });
  log.info('hubstaff.task.created', { projectId, taskId });
  res.json({ ok: true, taskId });
}));
