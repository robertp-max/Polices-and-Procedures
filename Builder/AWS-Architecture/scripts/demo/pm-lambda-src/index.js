// HHC PM API Lambda — single handler dispatching by API Gateway routeKey.
// Backs PM Overlay, Personal Tasks, Dependencies (cycle-checked), Audit, Notifications.
// Storage: DDB table `compliance_objects` (PAY_PER_REQUEST) using pk/sk partitions:
//   PM_OVERLAY#<task_id>          / OVERLAY
//   PM_PERSONAL#<owner_user_id>   / TASK#<task_id>
//   PM_DEP#<successor_task_id>    / DEP#<predecessor_task_id>
//   PM_AUDIT#<task_id>            / <ts>#<audit_id>
//   PM_NOTIF#<user_id>            / <ts>#<notif_id>
//
// Spec: Builder/Compliance-Execution-Sprints/PM-Data-Model.md
'use strict';

const crypto = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

const REGION = process.env.AWS_REGION || 'us-west-1';
const TABLE  = process.env.TABLE  || 'compliance_objects';
const ddb    = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

const ULID = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20).toUpperCase();
const now  = () => new Date().toISOString();

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : []),
]);
const CORS_HEADERS = 'Content-Type,x-hhc-actor-id,x-hhc-actor-role,Idempotency-Key,Authorization';
const CORS_METHODS = 'OPTIONS,GET,POST,PUT,PATCH,DELETE';

const cors = (origin) => ({
  'content-type': 'application/json',
  'access-control-allow-origin':  origin || 'http://localhost:5173',
  'access-control-allow-headers': CORS_HEADERS,
  'access-control-allow-methods': CORS_METHODS,
  'access-control-max-age':       '86400',
  'vary': 'Origin',
});
const ok   = (b, code = 200, origin = null) => ({ statusCode: code, headers: cors(origin), body: JSON.stringify(b) });
const fail = (msg, code = 400, origin = null) => ({ statusCode: code, headers: cors(origin), body: JSON.stringify({ error: msg }) });

function resolveOrigin(event) {
  const h = event.headers || {};
  const lower = {};
  for (const k of Object.keys(h)) lower[k.toLowerCase()] = h[k];
  const req = lower['origin'] || '';
  return ALLOWED_ORIGINS.has(req) ? req : 'http://localhost:5173';
}

function actorFrom(event) {
  const h = event.headers || {};
  const lower = {};
  for (const k of Object.keys(h)) lower[k.toLowerCase()] = h[k];
  return {
    actor_id:   lower['x-hhc-actor-id']   || 'demo-user',
    actor_role: lower['x-hhc-actor-role'] || 'unknown',
    request_id: event.requestContext?.requestId || null,
  };
}

function parseBody(event) {
  if (!event.body) return {};
  try { return JSON.parse(event.body); } catch { return null; }
}

exports.handler = async (event) => {
  const origin = resolveOrigin(event);
  const okR = (b, code = 200) => ok(b, code, origin);
  const failR = (msg, code = 400) => fail(msg, code, origin);
  try {
    const route = event.routeKey || `${event.requestContext?.http?.method} ${event.rawPath}`;
    const m = event.requestContext?.http?.method;
    if (m === 'OPTIONS') return okR({});

    if (route === 'GET /pm/healthz')                         return okR({ ok: true, ts: now(), service: 'pm-api' });

    if (route === 'GET /pm/overlays')                        return await listOverlays(event, okR, failR);
    if (route === 'GET /pm/overlays/{task_id}')              return await getOverlay(event, okR, failR);
    if (route === 'PUT /pm/overlays/{task_id}')              return await putOverlay(event, okR, failR);
    if (route === 'DELETE /pm/overlays/{task_id}')           return await deleteOverlay(event, okR, failR);

    if (route === 'GET /pm/personal')                        return await listPersonal(event, okR, failR);
    if (route === 'POST /pm/personal')                       return await createPersonal(event, okR, failR);
    if (route === 'PATCH /pm/personal/{task_id}')            return await updatePersonal(event, okR, failR);
    if (route === 'DELETE /pm/personal/{task_id}')           return await deletePersonal(event, okR, failR);

    if (route === 'POST /pm/dependencies')                   return await addDependency(event, okR, failR);
    if (route === 'DELETE /pm/dependencies')                 return await removeDependency(event, okR, failR);
    if (route === 'GET /pm/dependencies')                    return await listDependencies(event, okR, failR);

    if (route === 'GET /pm/audit')                           return await listAudit(event, okR, failR);
    if (route === 'GET /pm/notifications')                   return await listNotifications(event, okR, failR);
    if (route === 'POST /pm/notifications')                  return await createNotification(event, okR, failR);
    if (route === 'POST /pm/notifications/ack')              return await ackNotification(event, okR, failR);

    return failR(`Unknown route: ${route}`, 404);
  } catch (e) {
    console.error('Unhandled:', e);
    return fail(e.message || 'internal_error', 500, origin);
  }
};

// ── Audit helper ──────────────────────────────────────────────
async function writeAudit({ task_id, action, actor, before, after, reason }) {
  const ts = now();
  const id = ULID();
  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: {
      pk: `PM_AUDIT#${task_id}`,
      sk: `${ts}#${id}`,
      type: 'PM_AUDIT',
      audit_id: id,
      task_id,
      action,
      actor_id:   actor?.actor_id   || 'system',
      actor_role: actor?.actor_role || 'unknown',
      request_id: actor?.request_id || null,
      before: before || null,
      after:  after  || null,
      reason: reason || null,
      ts,
    },
  }));
}

// ── Overlay routes ────────────────────────────────────────────
async function listOverlays(event, okR /*, failR */) {
  // Scan for type = PM_OVERLAY (small N expected for demo).
  const out = await ddb.send(new ScanCommand({
    TableName: TABLE,
    FilterExpression: '#t = :t',
    ExpressionAttributeNames:  { '#t': 'type' },
    ExpressionAttributeValues: { ':t': 'PM_OVERLAY' },
  }));
  const overlays = (out.Items || []).map(stripDdb);
  return okR({ overlays });
}

async function getOverlay(event, okR, failR) {
  const taskId = event.pathParameters?.task_id;
  if (!taskId) return failR('missing:task_id', 422);
  const r = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { pk: `PM_OVERLAY#${taskId}`, sk: 'OVERLAY' },
  }));
  if (!r.Item) return okR({ overlay: null });
  return okR({ overlay: stripDdb(r.Item) });
}

async function putOverlay(event, okR, failR) {
  const taskId = event.pathParameters?.task_id;
  if (!taskId) return failR('missing:task_id', 422);
  const body = parseBody(event);
  if (!body) return failR('invalid_json', 400);
  const actor = actorFrom(event);

  const before = (await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { pk: `PM_OVERLAY#${taskId}`, sk: 'OVERLAY' },
  }))).Item || null;

  const next = {
    pk: `PM_OVERLAY#${taskId}`,
    sk: 'OVERLAY',
    type: 'PM_OVERLAY',
    task_id: taskId,
    assigned_user_id: body.assigned_user_id ?? before?.assigned_user_id ?? null,
    sprint_id:        body.sprint_id        ?? before?.sprint_id        ?? null,
    story_points:     body.story_points     ?? before?.story_points     ?? null,
    labels:           body.labels           ?? before?.labels           ?? [],
    due_date:         body.due_date         ?? before?.due_date         ?? null,
    start_date:       body.start_date       ?? before?.start_date       ?? null,
    weekend_override: body.weekend_override ?? before?.weekend_override ?? null,
    weekend_override_reason: body.weekend_override_reason ?? before?.weekend_override_reason ?? null,
    updated_at: now(),
    updated_by: actor.actor_id,
  };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: next }));
  await writeAudit({
    task_id: taskId, action: 'overlay.put', actor,
    before: stripDdb(before), after: stripDdb(next), reason: body.reason,
  });
  return okR({ overlay: stripDdb(next) });
}

async function deleteOverlay(event, okR, failR) {
  const taskId = event.pathParameters?.task_id;
  if (!taskId) return failR('missing:task_id', 422);
  const actor = actorFrom(event);
  const before = (await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { pk: `PM_OVERLAY#${taskId}`, sk: 'OVERLAY' },
  }))).Item || null;
  if (!before) return okR({ deleted: false });
  await ddb.send(new DeleteCommand({
    TableName: TABLE,
    Key: { pk: `PM_OVERLAY#${taskId}`, sk: 'OVERLAY' },
  }));
  await writeAudit({ task_id: taskId, action: 'overlay.delete', actor, before: stripDdb(before), after: null });
  return okR({ deleted: true });
}

// ── Personal tasks ────────────────────────────────────────────
async function listPersonal(event, okR /*, failR */) {
  const owner = (event.queryStringParameters?.owner || '').trim();
  if (owner) {
    const out = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'pk = :p',
      ExpressionAttributeValues: { ':p': `PM_PERSONAL#${owner}` },
    }));
    return okR({ tasks: (out.Items || []).map(stripDdb) });
  }
  const out = await ddb.send(new ScanCommand({
    TableName: TABLE,
    FilterExpression: '#t = :t',
    ExpressionAttributeNames:  { '#t': 'type' },
    ExpressionAttributeValues: { ':t': 'PM_PERSONAL' },
  }));
  return okR({ tasks: (out.Items || []).map(stripDdb) });
}

async function createPersonal(event, okR, failR) {
  const body = parseBody(event);
  if (!body) return failR('invalid_json', 400);
  if (!body.owner_user_id) return failR('missing:owner_user_id', 422);
  if (!body.title) return failR('missing:title', 422);
  const actor = actorFrom(event);
  const taskId = body.task_id || `personal:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const item = {
    pk: `PM_PERSONAL#${body.owner_user_id}`,
    sk: `TASK#${taskId}`,
    type: 'PM_PERSONAL',
    task_id: taskId,
    source: 'personal',
    owner_user_id: body.owner_user_id,
    title: body.title,
    description: body.description || null,
    status: body.status || 'todo',
    due_date: body.due_date || null,
    sprint_id: body.sprint_id || null,
    story_points: body.story_points ?? null,
    is_weekend_ok: body.is_weekend_ok ?? null,
    linked_event_id: body.linked_event_id || null,
    dependencies: [],
    created_at: now(),
    updated_at: now(),
  };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  await writeAudit({ task_id: taskId, action: 'personal.create', actor, before: null, after: stripDdb(item) });
  return okR({ task: stripDdb(item) }, 201);
}

async function findPersonal(taskId) {
  // Personal tasks live under PM_PERSONAL#<owner>; we don't have owner from path,
  // so scan with filter on task_id (small N for demo).
  const out = await ddb.send(new ScanCommand({
    TableName: TABLE,
    FilterExpression: '#t = :t AND task_id = :id',
    ExpressionAttributeNames:  { '#t': 'type' },
    ExpressionAttributeValues: { ':t': 'PM_PERSONAL', ':id': taskId },
  }));
  return (out.Items && out.Items[0]) || null;
}

async function updatePersonal(event, okR, failR) {
  const taskId = event.pathParameters?.task_id;
  if (!taskId) return failR('missing:task_id', 422);
  const body = parseBody(event);
  if (!body) return failR('invalid_json', 400);
  const actor = actorFrom(event);
  const before = await findPersonal(taskId);
  if (!before) return failR('not_found', 404);
  const next = {
    ...before,
    title:           body.title           ?? before.title,
    description:     body.description     ?? before.description,
    status:          body.status          ?? before.status,
    due_date:        body.due_date        ?? before.due_date,
    sprint_id:       body.sprint_id       ?? before.sprint_id,
    story_points:    body.story_points    ?? before.story_points,
    is_weekend_ok:   body.is_weekend_ok   ?? before.is_weekend_ok,
    linked_event_id: body.linked_event_id ?? before.linked_event_id,
    dependencies:    body.dependencies    ?? before.dependencies ?? [],
    updated_at: now(),
  };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: next }));
  await writeAudit({ task_id: taskId, action: 'personal.update', actor, before: stripDdb(before), after: stripDdb(next) });
  return okR({ task: stripDdb(next) });
}

async function deletePersonal(event, okR, failR) {
  const taskId = event.pathParameters?.task_id;
  if (!taskId) return failR('missing:task_id', 422);
  const actor = actorFrom(event);
  const before = await findPersonal(taskId);
  if (!before) return okR({ deleted: false });
  await ddb.send(new DeleteCommand({
    TableName: TABLE,
    Key: { pk: before.pk, sk: before.sk },
  }));
  await writeAudit({ task_id: taskId, action: 'personal.delete', actor, before: stripDdb(before), after: null });
  return okR({ deleted: true });
}

// ── Dependencies ──────────────────────────────────────────────
// Edge model: predecessor (from) → successor (to).
// Stored under PM_DEP#<successor> with sk DEP#<predecessor>.
async function listAllEdges() {
  const out = await ddb.send(new ScanCommand({
    TableName: TABLE,
    FilterExpression: '#t = :t',
    ExpressionAttributeNames:  { '#t': 'type' },
    ExpressionAttributeValues: { ':t': 'PM_DEP' },
  }));
  return (out.Items || []).map(i => ({ from: i.from_task_id, to: i.to_task_id }));
}

function wouldCreateCycle(edges, from, to) {
  // DFS from `to` following edges; if we reach `from`, adding from→to creates a cycle.
  const adj = new Map();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from).push(e.to);
  }
  const stack = [[to, [from, to]]];
  const seen = new Set();
  while (stack.length) {
    const [node, path] = stack.pop();
    if (node === from) return { cycle: true, path };
    if (seen.has(node)) continue;
    seen.add(node);
    for (const n of (adj.get(node) || [])) {
      stack.push([n, [...path, n]]);
    }
  }
  return { cycle: false };
}

async function addDependency(event, okR, failR) {
  const body = parseBody(event);
  if (!body) return failR('invalid_json', 400);
  const from = body.from_task_id;
  const to   = body.to_task_id;
  if (!from || !to) return failR('missing:from_task_id|to_task_id', 422);
  if (from === to)  return failR('self_dependency_not_allowed', 422);
  const actor = actorFrom(event);

  const edges = await listAllEdges();
  // dedupe
  if (edges.some(e => e.from === from && e.to === to)) {
    return okR({ created: false, reason: 'exists' });
  }
  const cyc = wouldCreateCycle(edges, from, to);
  if (cyc.cycle) return failR(`cycle_detected:${cyc.path.join('->')}`, 409);

  const item = {
    pk: `PM_DEP#${to}`,
    sk: `DEP#${from}`,
    type: 'PM_DEP',
    from_task_id: from,
    to_task_id:   to,
    dep_type: body.type || 'finish_to_start',
    created_at: now(),
    created_by: actor.actor_id,
  };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  await writeAudit({ task_id: to, action: 'dependency.add', actor, before: null, after: { from, to } });
  return okR({ created: true, edge: { from, to, type: item.dep_type } }, 201);
}

async function removeDependency(event, okR, failR) {
  const body = parseBody(event);
  if (!body) return failR('invalid_json', 400);
  const from = body.from_task_id;
  const to   = body.to_task_id;
  if (!from || !to) return failR('missing:from_task_id|to_task_id', 422);
  const actor = actorFrom(event);
  await ddb.send(new DeleteCommand({
    TableName: TABLE,
    Key: { pk: `PM_DEP#${to}`, sk: `DEP#${from}` },
  }));
  await writeAudit({ task_id: to, action: 'dependency.remove', actor, before: { from, to }, after: null });
  return okR({ deleted: true });
}

async function listDependencies(event, okR /*, failR */) {
  const taskId = event.queryStringParameters?.task_id;
  if (taskId) {
    const incoming = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'pk = :p',
      ExpressionAttributeValues: { ':p': `PM_DEP#${taskId}` },
    }));
    return okR({
      task_id: taskId,
      incoming: (incoming.Items || []).map(i => ({ from: i.from_task_id, to: i.to_task_id, type: i.dep_type })),
    });
  }
  const edges = await listAllEdges();
  return okR({ edges });
}

// ── Audit ─────────────────────────────────────────────────────
async function listAudit(event, okR, failR) {
  const taskId = event.queryStringParameters?.task_id;
  if (!taskId) return failR('missing:task_id', 422);
  const out = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :p',
    ExpressionAttributeValues: { ':p': `PM_AUDIT#${taskId}` },
    ScanIndexForward: false,
    Limit: 200,
  }));
  return okR({ task_id: taskId, audit: (out.Items || []).map(stripDdb) });
}

// ── Notifications ─────────────────────────────────────────────
async function listNotifications(event, okR, failR) {
  const userId = event.queryStringParameters?.user_id;
  if (!userId) return failR('missing:user_id', 422);
  const out = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :p',
    ExpressionAttributeValues: { ':p': `PM_NOTIF#${userId}` },
    ScanIndexForward: false,
    Limit: 100,
  }));
  return okR({ user_id: userId, notifications: (out.Items || []).map(stripDdb) });
}

async function ackNotification(event, okR, failR) {
  const body = parseBody(event);
  if (!body) return failR('invalid_json', 400);
  if (!body.user_id || !body.notification_id || !body.sk) return failR('missing:user_id|notification_id|sk', 422);
  await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { pk: `PM_NOTIF#${body.user_id}`, sk: body.sk },
    UpdateExpression: 'SET read_at = :r',
    ExpressionAttributeValues: { ':r': now() },
  }));
  return okR({ ok: true });
}

// Server-side dedupe by window_token.
async function createNotification(event, okR, failR) {
  const body = parseBody(event);
  if (!body) return failR('invalid_json', 400);
  const { user_id, task_id, kind, window_token, payload } = body;
  if (!user_id || !task_id || !kind || !window_token) {
    return failR('missing:user_id|task_id|kind|window_token', 422);
  }
  const pk = `PM_NOTIF#${user_id}`;
  // Check existing window_token for this user.
  const existing = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :p',
    FilterExpression: 'window_token = :w',
    ExpressionAttributeValues: { ':p': pk, ':w': window_token },
    Limit: 1,
  }));
  if (existing.Items && existing.Items.length > 0) {
    return okR({ deduped: true, notification: stripDdb(existing.Items[0]) }, 200);
  }
  const ts = now();
  const id = body.id || `notif-${ULID()}`;
  const sk = `${ts}#${id}`;
  const item = {
    pk, sk,
    id, user_id, task_id, kind, window_token,
    payload: payload || {},
    created_at: ts,
  };
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return okR({ deduped: false, notification: stripDdb(item) }, 201);
}

// ── Helpers ───────────────────────────────────────────────────
function stripDdb(item) {
  if (!item) return item;
  const { pk: _pk, sk: _sk, ...rest } = item;
  return rest;
}
