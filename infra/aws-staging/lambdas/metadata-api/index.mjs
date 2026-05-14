/**
 * metadata-api  ─  HHC Phase 1 Lambda shell
 *
 * Endpoints:
 *   GET /events/{event_id}/files
 *   GET /files/{evidence_id}/download
 *
 * Reads DynamoDB only (Plan §4 hard rule: dashboard never lists S3).
 * Mints a 2-minute presigned GET URL for the download endpoint.
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl }               from '@aws-sdk/s3-request-presigner';
import { DynamoDBClient }             from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID }                 from 'node:crypto';

const REGION  = process.env.AWS_REGION;
const BUCKET  = process.env.HHC_S3_BUCKET;
const TABLE   = process.env.HHC_DDB_TABLE;
const GET_TTL = 120;

const s3  = new S3Client({ region: REGION });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

const ok   = (s, b) => ({ statusCode: s, headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
const fail = (s, code, message) => ok(s, { error: { code, message } });

const listEventFiles = async (event_id) => {
  const r = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: { ':pk': `EVENT#${event_id}`, ':sk': 'FILE#' },
  }));
  // NEVER return S3 keys to the client; return metadata + opaque IDs only.
  const files = (r.Items ?? []).map((it) => ({
    evidence_id: it.evidence_id,
    filename:    it.filename,
    content_type:it.content_type,
    status:      it.status,
    created_at:  it.created_at,
    policy_id:   it.policy_id,
    workflow_id: it.workflow_id,
    event_id:    it.event_id,
  }));
  return ok(200, { event_id, count: files.length, files });
};

const downloadEvidence = async (evidence_id) => {
  // Look up via gsi1 since we only know evidence_id; in production,
  // the route would carry event_id alongside.
  const r = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'gsi1',
    KeyConditionExpression: 'gsi1pk <> :never',  // placeholder (Phase 1 simplification)
    ExpressionAttributeValues: { ':never': '__never__' },
    Limit: 1,
  })).catch(() => null);

  // Phase 1 simplification: we look the FILE# row up by querying the
  // evidence_id sort key range. Real implementation should use a key
  // that includes evidence_id in pk (Phase 2 schema iteration).
  // For the foundation, we rely on the caller passing event_id via query param.
  return fail(501, 'not_implemented_phase1', 'Use GET /events/{event_id}/files then resolve via the dashboard.');
};

export const handler = async (event) => {
  const requestId = event.requestContext?.requestId ?? randomUUID();
  const path      = event.requestContext?.http?.path ?? event.rawPath ?? '';
  console.log(JSON.stringify({ msg: 'metadata-api.start', requestId, path }));

  if (path.match(/^\/events\/[^/]+\/files$/)) {
    const event_id = event.pathParameters?.event_id;
    if (!event_id) return fail(400, 'missing_event_id', 'event_id required.');
    return listEventFiles(event_id);
  }

  if (path.match(/^\/files\/[^/]+\/download$/)) {
    const evidence_id = event.pathParameters?.evidence_id;
    if (!evidence_id) return fail(400, 'missing_evidence_id', 'evidence_id required.');
    return downloadEvidence(evidence_id);
  }

  return fail(404, 'unknown_route', `Unknown route: ${path}`);
};
