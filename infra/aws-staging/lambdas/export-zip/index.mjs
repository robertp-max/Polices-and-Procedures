/**
 * export-zip  ─  HHC Phase 1 Lambda shell
 *
 * Endpoint: POST /exports/survey-packet
 * Input  : { policy_id, workflow_id, event_id }
 * Output : { export_id, get_url, expires_in, file_count }
 *
 * Streams approved evidence files into a ZIP, writes to prod/exports,
 * returns a 2-minute presigned GET URL.
 */

import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl }                                  from '@aws-sdk/s3-request-presigner';
import { DynamoDBClient }                                from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand }          from '@aws-sdk/lib-dynamodb';
import archiver                                          from 'archiver';
import { PassThrough }                                   from 'node:stream';
import { randomUUID }                                    from 'node:crypto';

const REGION  = process.env.AWS_REGION;
const BUCKET  = process.env.HHC_S3_BUCKET;
const TABLE   = process.env.HHC_DDB_TABLE;
const GET_TTL = 120;

const s3  = new S3Client({ region: REGION });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

const ok   = (s, b) => ({ statusCode: s, headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
const fail = (s, code, message) => ok(s, { error: { code, message } });

export const handler = async (event) => {
  const requestId = event.requestContext?.requestId ?? randomUUID();
  console.log(JSON.stringify({ msg: 'export-zip.start', requestId }));

  let body = {};
  try { body = event.body ? JSON.parse(event.body) : {}; }
  catch { return fail(400, 'invalid_json', 'Body must be valid JSON.'); }

  if (body?.phi === true) return fail(400, 'phi_rejected', 'Staging must not receive PHI.');
  const { policy_id, workflow_id, event_id } = body;
  if (!policy_id || !workflow_id || !event_id) {
    return fail(400, 'missing_ids', 'policy_id, workflow_id and event_id are required.');
  }

  // Find approved evidence rows for this event.
  const r = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    FilterExpression: '#s = :locked',
    ExpressionAttributeNames:  { '#s': 'status' },
    ExpressionAttributeValues: {
      ':pk': `EVENT#${event_id}`, ':sk': 'FILE#', ':locked': 'EVIDENCE_LOCKED',
    },
  }));
  const files = r.Items ?? [];
  if (files.length === 0) return fail(404, 'no_evidence', 'No EVIDENCE_LOCKED files for this event.');

  const export_id = randomUUID();
  const today     = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
  const exportKey = `exports/${today}/${export_id}.zip`;

  // Build ZIP in-memory streamed to S3 via PassThrough → S3 multipart.
  // For Phase 1, files are <= 25 MB each and packets are small, so a
  // simple buffer-then-PutObject is acceptable.
  const archive = archiver('zip', { zlib: { level: 9 } });
  const chunks  = [];
  const sink    = new PassThrough();
  sink.on('data', (c) => chunks.push(c));
  archive.pipe(sink);

  for (const f of files) {
    const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: f.s3_key }));
    archive.append(obj.Body, { name: `${f.policy_id}/${f.workflow_id}/${f.event_id}/${f.filename}` });
  }
  await archive.finalize();
  const zipBuf = Buffer.concat(chunks);

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: exportKey, Body: zipBuf, ContentType: 'application/zip',
    Metadata: { policy_id, workflow_id, event_id, export_id, request_id: requestId },
  }));

  const get_url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: exportKey }),
    { expiresIn: GET_TTL },
  );

  console.log(JSON.stringify({ msg: 'export-zip.ok', requestId, export_id, files: files.length }));
  return ok(200, { export_id, get_url, expires_in: GET_TTL, file_count: files.length });
};
