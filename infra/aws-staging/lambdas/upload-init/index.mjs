/**
 * upload-init  ─  HHC Phase 1 Lambda shell
 *
 * Endpoint: POST /uploads/init
 * Input  : { policy_id, workflow_id, event_id, filename, content_type }
 * Output : { upload_id, put_url, s3_key, bucket, expires_in }
 *
 * Contract notes:
 *   - All three IDs (policy_id, workflow_id, event_id) are MANDATORY.
 *   - Presigned PUT URL TTL = 600s (10 min) per Plan §4.
 *   - Filenames are sanitized; only an MIME allowlist is accepted.
 *   - Writes a PENDING_UPLOAD row to compliance_objects.
 *   - REJECTS any payload with phi:true (no PHI in staging).
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl }              from '@aws-sdk/s3-request-presigner';
import { DynamoDBClient }            from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID }                from 'node:crypto';

const REGION  = process.env.AWS_REGION;
const BUCKET  = process.env.HHC_S3_BUCKET;
const TABLE   = process.env.HHC_DDB_TABLE;
const PUT_TTL = 600;   // 10 minutes

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png', 'image/jpeg', 'image/webp',
  'text/plain', 'text/csv',
  'application/json',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const s3  = new S3Client({ region: REGION });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

const ok  = (status, body) => ({
  statusCode: status,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});
const fail = (status, code, message) => ok(status, { error: { code, message } });

const sanitizeFilename = (s) =>
  String(s).replace(/[^A-Za-z0-9._-]+/g, '_').replace(/_+/g, '_').slice(0, 200);

export const handler = async (event) => {
  const requestId = event.requestContext?.requestId ?? randomUUID();
  console.log(JSON.stringify({ msg: 'upload-init.start', requestId }));

  let body;
  try { body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body ?? {}); }
  catch { return fail(400, 'invalid_json', 'Body must be valid JSON.'); }

  if (body?.phi === true) {
    return fail(400, 'phi_rejected', 'Staging environment must not receive PHI payloads.');
  }

  const { policy_id, workflow_id, event_id, filename, content_type } = body;
  if (!policy_id || !workflow_id || !event_id) {
    return fail(400, 'missing_ids', 'policy_id, workflow_id and event_id are required.');
  }
  if (!filename || !content_type) {
    return fail(400, 'missing_file_meta', 'filename and content_type are required.');
  }
  if (!ALLOWED_MIME.has(content_type)) {
    return fail(415, 'mime_not_allowed', `Content type "${content_type}" is not in the staging allowlist.`);
  }

  const upload_id = randomUUID();
  const safeName  = sanitizeFilename(filename);
  const s3_key    = `uploads/raw/${policy_id}/${workflow_id}/${event_id}/${upload_id}/${safeName}`;
  const now       = new Date().toISOString();

  // 1. Write PENDING_UPLOAD metadata BEFORE returning the URL so the
  //    request is auditable even if the client never PUTs the file.
  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: {
      pk: `EVENT#${event_id}`,
      sk: `UPLOAD#${upload_id}`,
      gsi1pk: `WORKFLOW#${workflow_id}`,
      gsi1sk: `${now}#${upload_id}`,
      gsi2pk: `STATUS#PENDING_UPLOAD`,
      gsi2sk: now,
      policy_id, workflow_id, event_id,
      upload_id, filename: safeName, content_type,
      s3_bucket: BUCKET, s3_key,
      status: 'PENDING_UPLOAD',
      created_at: now,
      created_by: requestId,
      record_version: 1,
    },
  }));

  // 2. Mint short-lived presigned PUT URL.
  const put_url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: s3_key, ContentType: content_type }),
    { expiresIn: PUT_TTL },
  );

  console.log(JSON.stringify({ msg: 'upload-init.ok', requestId, upload_id, s3_key }));
  return ok(200, { upload_id, put_url, s3_key, bucket: BUCKET, expires_in: PUT_TTL });
};
