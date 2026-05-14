/**
 * upload-validate-promote  ─  HHC Phase 1 Lambda shell
 *
 * Endpoints:
 *   POST /uploads/{upload_id}/validate
 *   POST /uploads/{upload_id}/promote
 *
 * Validate:
 *   - object exists in sandbox/uploads/raw
 *   - size <= 25 MB (Plan §4)
 *   - content_type matches PENDING_UPLOAD record
 *   - copies raw → uploads/validated, status = VALIDATED
 *
 * Promote:
 *   - copies validated → evidence/, status = EVIDENCE_LOCKED
 *   - writes append-only audit row (pk=AUDIT#{event_id})
 *   - emits hash chain link (prev_audit_hash → current_audit_hash)
 */

import {
  S3Client, HeadObjectCommand, CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { createHash, randomUUID } from 'node:crypto';

const REGION  = process.env.AWS_REGION;
const BUCKET  = process.env.HHC_S3_BUCKET;
const TABLE   = process.env.HHC_DDB_TABLE;
const MAX_MB  = 25;

const s3  = new S3Client({ region: REGION });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

const ok   = (s, b) => ({ statusCode: s, headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
const fail = (s, code, message) => ok(s, { error: { code, message } });

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

const findUpload = async (upload_id) => {
  // Walk by GSI1 since pk is keyed by event_id; fall back to scan-by-upload.
  // Phase 1 simplification: client passes event_id alongside upload_id
  // when calling promote. Validate accepts upload_id only and looks it up
  // via gsi2 status index.
  const r = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'gsi2',
    KeyConditionExpression: 'gsi2pk = :pk',
    FilterExpression: 'upload_id = :u',
    ExpressionAttributeValues: { ':pk': 'STATUS#PENDING_UPLOAD', ':u': upload_id },
    Limit: 5,
  }));
  return r.Items?.[0] ?? null;
};

const validate = async (upload_id, requestId) => {
  const item = await findUpload(upload_id);
  if (!item) return fail(404, 'upload_not_found', `No PENDING_UPLOAD for upload_id=${upload_id}`);

  const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: item.s3_key })).catch(() => null);
  if (!head) return fail(412, 'object_missing', `Raw object not found at ${item.s3_key}`);
  if (head.ContentLength > MAX_MB * 1024 * 1024) {
    return fail(413, 'too_large', `Object exceeds ${MAX_MB} MB.`);
  }
  if (head.ContentType && head.ContentType !== item.content_type) {
    return fail(415, 'content_type_mismatch', `Object Content-Type ${head.ContentType} ≠ ${item.content_type}`);
  }

  const newKey = item.s3_key.replace('uploads/raw/', 'uploads/validated/');
  await s3.send(new CopyObjectCommand({
    Bucket: BUCKET, Key: newKey,
    CopySource: encodeURIComponent(`${BUCKET}/${item.s3_key}`),
    MetadataDirective: 'COPY',
  }));

  await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { pk: item.pk, sk: item.sk },
    UpdateExpression: 'SET #s = :s, validated_key = :k, gsi2pk = :g, gsi2sk = :t, validated_at = :t',
    ExpressionAttributeNames:  { '#s': 'status' },
    ExpressionAttributeValues: {
      ':s': 'VALIDATED', ':k': newKey,
      ':g': 'STATUS#VALIDATED', ':t': new Date().toISOString(),
    },
  }));

  console.log(JSON.stringify({ msg: 'validate.ok', requestId, upload_id, key: newKey }));
  return ok(200, { upload_id, status: 'VALIDATED', validated_key: newKey });
};

const promote = async (upload_id, body, requestId) => {
  const item = await findUpload(upload_id) ?? (await ddb.send(new QueryCommand({
    TableName: TABLE, IndexName: 'gsi2',
    KeyConditionExpression: 'gsi2pk = :pk',
    FilterExpression: 'upload_id = :u',
    ExpressionAttributeValues: { ':pk': 'STATUS#VALIDATED', ':u': upload_id },
    Limit: 1,
  }))).Items?.[0];

  if (!item) return fail(404, 'upload_not_found', `Upload ${upload_id} not found.`);
  if (item.status !== 'VALIDATED') return fail(409, 'not_validated', 'Upload must be VALIDATED before promote.');

  const evidence_id = randomUUID();
  const validated_key = item.validated_key;
  const evidence_key  = validated_key
    .replace('uploads/validated/', 'evidence/')
    .replace(/\/[^/]+\/([^/]+)$/, `/${evidence_id}/$1`);

  await s3.send(new CopyObjectCommand({
    Bucket: BUCKET, Key: evidence_key,
    CopySource: encodeURIComponent(`${BUCKET}/${validated_key}`),
    MetadataDirective: 'COPY',
  }));

  const now = new Date().toISOString();

  // Evidence row.
  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: {
      pk: `EVENT#${item.event_id}`,
      sk: `FILE#${evidence_id}`,
      gsi1pk: `POLICY#${item.policy_id}`,
      gsi1sk: `${now}#${evidence_id}`,
      gsi2pk: 'STATUS#EVIDENCE_LOCKED',
      gsi2sk: now,
      policy_id: item.policy_id, workflow_id: item.workflow_id, event_id: item.event_id,
      evidence_id, filename: item.filename, content_type: item.content_type,
      s3_bucket: BUCKET, s3_key: evidence_key,
      status: 'EVIDENCE_LOCKED',
      created_at: now, created_by: requestId,
      record_version: 1,
    },
  }));

  // Append-only audit row with hash chain link.
  const lastAudit = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: { ':pk': `AUDIT#${item.event_id}` },
    ScanIndexForward: false, Limit: 1,
  }));
  const prev_hash = lastAudit.Items?.[0]?.current_hash ?? '0';

  const audit_id = randomUUID();
  const payload  = JSON.stringify({ evidence_id, action: 'PROMOTE', actor: requestId, at: now });
  const current_hash = sha256(`${prev_hash}::${payload}`);

  await ddb.send(new PutCommand({
    TableName: TABLE,
    ConditionExpression: 'attribute_not_exists(sk)',  // append-only safeguard
    Item: {
      pk: `AUDIT#${item.event_id}`,
      sk: `${now}#${audit_id}`,
      audit_id, action: 'PROMOTE',
      actor: requestId, request_id: requestId,
      payload, prev_hash, current_hash,
      created_at: now,
    },
  }));

  console.log(JSON.stringify({ msg: 'promote.ok', requestId, upload_id, evidence_id, evidence_key }));
  return ok(200, { evidence_id, status: 'EVIDENCE_LOCKED', evidence_key });
};

export const handler = async (event) => {
  const requestId = event.requestContext?.requestId ?? randomUUID();
  const path      = event.requestContext?.http?.path ?? event.rawPath ?? '';
  const upload_id = event.pathParameters?.upload_id;
  if (!upload_id) return fail(400, 'missing_upload_id', 'upload_id path parameter required.');

  let body = {};
  try { body = event.body ? JSON.parse(event.body) : {}; }
  catch { return fail(400, 'invalid_json', 'Body must be valid JSON.'); }
  if (body?.phi === true) return fail(400, 'phi_rejected', 'Staging must not receive PHI.');

  if (path.endsWith('/validate')) return validate(upload_id, requestId);
  if (path.endsWith('/promote'))  return promote(upload_id, body, requestId);
  return fail(404, 'unknown_route', `Unknown route: ${path}`);
};
