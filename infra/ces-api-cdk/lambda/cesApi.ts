import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  TABLE, ddb, cmds, json, jsonError, assertNoFileBytes, parseBody,
} from './common.js';

/* ═══════════════════════════════════════════════════════════════
   CES metadata API handler (DynamoDB-backed).

   Routes (CloudFront forwards /api/* unchanged, so the /api prefix is
   tolerated and stripped):
     GET  /api/ces/health
     GET  /api/ces/snapshot/{workspaceId}
     PUT  /api/ces/snapshot/{workspaceId}
     GET  /api/ces/events/{eventId}/evidence
     POST /api/ces/events/{eventId}/evidence     (upsert pointer)

   NON-PHI metadata + pointers ONLY. File bytes are rejected.
   ═══════════════════════════════════════════════════════════════ */

const SCHEMA_VERSION = 1;

export async function handler(event: APIGatewayProxyEventV2) {
  const method = event.requestContext?.http?.method ?? 'GET';
  // Normalize: drop a leading /api and trailing slash.
  const rawPath = (event.rawPath ?? '/').replace(/^\/api(?=\/)/, '').replace(/\/+$/, '') || '/';
  const segments = rawPath.split('/').filter(Boolean); // e.g. ['ces','snapshot','demo']

  try {
    if (segments[0] !== 'ces') return jsonError(404, 'not_found', `Unknown route: ${method} ${rawPath}`);

    // GET /ces/health
    if (segments[1] === 'health' && method === 'GET') {
      return json(200, {
        ok: true,
        provider: 'dynamodb_metadata',
        metadataProvider: 'dynamodb_metadata',
        cesStorageProvider: 'google_drive_calendar',
        table: TABLE,
      });
    }

    // /ces/snapshot/{workspaceId}
    if (segments[1] === 'snapshot' && segments[2]) {
      const workspaceId = decodeURIComponent(segments[2]);
      // NOTE: must `await` so a thrown guard error is caught below (a bare
      // `return promise` would reject AFTER this try/catch and become a 500).
      if (method === 'GET') return await getSnapshot(workspaceId);
      if (method === 'PUT') return await putSnapshot(workspaceId, event);
      return jsonError(405, 'method_not_allowed', `${method} not allowed on snapshot.`);
    }

    // /ces/events/{eventId}/evidence
    if (segments[1] === 'events' && segments[2] && segments[3] === 'evidence') {
      const eventId = decodeURIComponent(segments[2]);
      if (method === 'GET') return await listEvidence(eventId);
      if (method === 'POST') return await upsertEvidence(eventId, event);
      return jsonError(405, 'method_not_allowed', `${method} not allowed on evidence.`);
    }

    return jsonError(404, 'not_found', `Unknown route: ${method} ${rawPath}`);
  } catch (e) {
    const msg = (e as Error).message || 'Internal error';
    // assertNoFileBytes / validation failures surface as 400.
    if (/may not contain file bytes/.test(msg)) return jsonError(400, 'validation_error', msg);
    console.error(JSON.stringify({ event: 'ces_api.error', method, rawPath, message: msg }));
    return jsonError(500, 'internal_error', 'Internal error');
  }
}

async function getSnapshot(workspaceId: string) {
  const res = await ddb.send(new cmds.GetCommand({
    TableName: TABLE,
    Key: { pk: `WS#${workspaceId}`, sk: 'SNAPSHOT' },
  }));
  const snapshot = (res.Item as { snapshot?: unknown } | undefined)?.snapshot;
  if (!snapshot) return json(200, { status: 'empty', workspaceId });
  return json(200, { status: 'ok', snapshot });
}

async function putSnapshot(workspaceId: string, event: APIGatewayProxyEventV2) {
  const body = parseBody(event.body, event.isBase64Encoded);
  if (!body || typeof body !== 'object') return jsonError(400, 'validation_error', 'Snapshot body must be an object.');
  const snapshot = { ...body, schemaVersion: SCHEMA_VERSION, workspaceId, updatedAt: new Date().toISOString() };
  assertNoFileBytes(snapshot, 'putSnapshot');
  await ddb.send(new cmds.PutCommand({
    TableName: TABLE,
    Item: { pk: `WS#${workspaceId}`, sk: 'SNAPSHOT', updatedAt: snapshot.updatedAt, snapshot },
  }));
  return json(200, { status: 'ok', snapshot });
}

async function listEvidence(eventId: string) {
  const res = await ddb.send(new cmds.QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: { ':pk': `EVT#${eventId}`, ':sk': 'EVREF#' },
  }));
  const items = (res.Items ?? []).map(i => (i as { ref?: unknown }).ref).filter(Boolean);
  return json(200, { eventId, items, count: items.length });
}

async function upsertEvidence(eventId: string, event: APIGatewayProxyEventV2) {
  const ref = parseBody(event.body, event.isBase64Encoded) as Record<string, unknown>;
  assertNoFileBytes(ref, 'upsertEvidence');
  const driveFileId = String(ref.driveFileId ?? '');
  if (!driveFileId) return jsonError(400, 'validation_error', '`driveFileId` is required.');
  const withEvent = { ...ref, eventId };
  await ddb.send(new cmds.PutCommand({
    TableName: TABLE,
    Item: { pk: `EVT#${eventId}`, sk: `EVREF#${driveFileId}`, evidenceId: ref.evidenceId, ref: withEvent },
  }));
  return json(201, { status: 'ok', ref: withEvent });
}
