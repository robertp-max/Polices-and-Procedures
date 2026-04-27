// HHC Demo Lambda — single handler dispatching by API Gateway routeKey.
// Functions: upload-init, upload-validate, upload-promote, file-list, file-download.
// Triplet enforcement: policy_id, workflow_id, event_id required on init.
'use strict';

const crypto = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand, CopyObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const REGION      = process.env.AWS_REGION || 'us-west-1';
const TABLE       = process.env.TABLE  || 'compliance_objects';
const BUCKET      = process.env.BUCKET;                    // sandbox bucket
const PROD_BUCKET = process.env.PROD_BUCKET || BUCKET;     // production evidence bucket
const MAX_BYTES   = Number(process.env.MAX_UPLOAD_BYTES || 50 * 1024 * 1024); // 50 MB
const MIME_ALLOWLIST = (process.env.MIME_ALLOWLIST ||
  'application/pdf,application/json,text/plain,text/csv,image/png,image/jpeg,image/webp,' +
  'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
  'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' +
  'application/octet-stream'
).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));
const s3  = new S3Client({ region: REGION });

const ID_RE = /^[A-Z]{2,4}-[A-Z0-9-]{2,}$/;
const ULID = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20).toUpperCase();
const now  = () => new Date().toISOString();

const ok   = (b, code = 200) => ({ statusCode: code, headers: cors(), body: JSON.stringify(b) });
const fail = (msg, code = 400) => ({ statusCode: code, headers: cors(), body: JSON.stringify({ error: msg }) });
const cors = () => ({
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type,authorization,idempotency-key',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
});

exports.handler = async (event) => {
  try {
    const route = event.routeKey || `${event.requestContext?.http?.method} ${event.rawPath}`;
    if (event.requestContext?.http?.method === 'OPTIONS') return ok({});
    if (route === 'POST /uploads/init')                      return await uploadInit(event);
    if (route === 'POST /uploads/{upload_id}/validate')      return await uploadValidate(event);
    if (route === 'POST /uploads/{upload_id}/promote')       return await uploadPromote(event);
    if (route === 'POST /esign/complete')                    return await esignComplete(event);
    if (route === 'POST /forms/submit')                      return await formSubmit(event);
    if (route === 'GET /events/{event_id}/files')            return await listFiles(event);
    if (route === 'GET /files/{evidence_id}/download')       return await downloadFile(event);
    if (route === 'GET /healthz')                            return ok({ ok: true, ts: now() });
    return fail(`Unknown route: ${route}`, 404);
  } catch (e) {
    console.error('Unhandled:', e);
    return fail(e.message || 'internal_error', 500);
  }
};

// ── Actor extraction (Phase-1 stub: x-hhc-actor-* headers) ───────
function actorFrom(event) {
  const h = event.headers || {};
  const lower = {};
  for (const k of Object.keys(h)) lower[k.toLowerCase()] = h[k];
  return {
    actor_id:   lower['x-hhc-actor-id']   || 'demo-user',
    actor_role: lower['x-hhc-actor-role'] || 'unknown',
    source_ip:  event.requestContext?.http?.sourceIp || null,
    user_agent: lower['user-agent'] || null,
    request_id: event.requestContext?.requestId || null,
  };
}

async function writeAudit({ event_id, action, actor, before_status, after_status, evidence_id, upload_id, policy_id, workflow_id, after_hash, source_system }) {
  const ts = now();
  const audit_id = ULID();
  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: {
      pk: `AUDIT#${event_id}`, sk: `${ts}#${audit_id}`,
      type: 'AUDIT', audit_id, action,
      actor_id:   actor?.actor_id   || 'system',
      actor_role: actor?.actor_role || 'unknown',
      actor:      actor?.actor_id   || 'system',  // legacy alias for list response
      source_ip:  actor?.source_ip  || null,
      user_agent: actor?.user_agent || null,
      request_id: actor?.request_id || null,
      source_system: source_system || 'hhc',
      evidence_id: evidence_id || null,
      upload_id:   upload_id   || null,
      policy_id:   policy_id   || null,
      workflow_id: workflow_id || null,
      event_id,
      before_status: before_status || null,
      after_status:  after_status  || null,
      after_hash:    after_hash    || null,
      created_at:    ts,
    },
  }));
  return audit_id;
}

async function uploadInit(event) {
  const body = parseBody(event);
  const actor = actorFrom(event);
  const { policy_id, workflow_id, event_id, form_id, filename, mime_type, size_bytes, source_system } = body || {};

  for (const [k, v] of [['policy_id', policy_id], ['workflow_id', workflow_id], ['event_id', event_id], ['filename', filename]]) {
    if (!v || typeof v !== 'string') return fail(`missing_or_invalid:${k}`, 422);
  }
  for (const [k, v] of [['policy_id', policy_id], ['workflow_id', workflow_id], ['event_id', event_id]]) {
    if (!ID_RE.test(v)) return fail(`bad_format:${k}`, 422);
  }
  if (mime_type && !MIME_ALLOWLIST.includes(String(mime_type).toLowerCase())) {
    return fail(`mime_not_allowed:${mime_type}`, 415);
  }
  if (typeof size_bytes === 'number' && size_bytes > MAX_BYTES) {
    return fail(`too_large:${size_bytes}>${MAX_BYTES}`, 413);
  }

  const upload_id   = `UPL-${ULID()}`;
  const evidence_id = `EVD-${ULID()}`;
  const safeName    = filename.replace(/[^\w.\- ]/g, '_').slice(0, 200);
  const rawKey      = `uploads/raw/${policy_id}/${workflow_id}/${event_id}/${upload_id}/${safeName}`;
  const validatedKey= `uploads/validated/${policy_id}/${workflow_id}/${event_id}/${upload_id}/${safeName}`;
  const evidenceKey = `evidence/${policy_id}/${workflow_id}/${event_id}/${evidence_id}/${safeName}`;
  const ts          = now();

  // Demo-mode: SSE-S3 only. No KMS in this build.
  const presign = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: rawKey,
      ContentType: mime_type || 'application/octet-stream',
      ServerSideEncryption: 'AES256',
    }),
    { expiresIn: 900 }
  );

  // Persist UPLOAD record.
  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: {
      pk: `EVENT#${event_id}`, sk: `UPLOAD#${upload_id}`,
      type: 'UPLOAD', status: 'PENDING_UPLOAD',
      policy_id, workflow_id, event_id, form_id: form_id || null,
      upload_id, evidence_id, filename: safeName,
      mime_type: mime_type || null, size_bytes: size_bytes || null,
      source_system: source_system || 'hhc',
      s3_bucket: BUCKET,
      s3_key_raw: rawKey,
      s3_key_validated: validatedKey,
      s3_key_evidence: evidenceKey,
      created_by: actor.actor_id,
      created_at: ts, updated_at: ts,
    },
  }));

  // For demo: also write the EVIDENCE row immediately so the UI has something to show
  // before promote runs. Status = PENDING_UPLOAD until the client PUTs the file.
  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: {
      pk: `EVENT#${event_id}`, sk: `EVIDENCE#${evidence_id}`,
      type: 'EVIDENCE', status: 'PENDING_UPLOAD',
      policy_id, workflow_id, event_id, form_id: form_id || null,
      evidence_id, upload_id, filename: safeName,
      mime_type: mime_type || null, size_bytes: size_bytes || null,
      source_system: source_system || 'hhc',
      signature_status: 'NONE',
      s3_bucket: BUCKET, s3_key: rawKey,
      created_by: actor.actor_id,
      created_at: ts, updated_at: ts,
    },
  }));

  await writeAudit({
    event_id, action: 'UPLOAD_INITIATED', actor,
    after_status: 'PENDING_UPLOAD',
    evidence_id, upload_id, policy_id, workflow_id, source_system,
  });

  return ok({
    upload_id, evidence_id,
    presigned_put_url: presign,
    expires_in_seconds: 900,
    required_headers: {
      'Content-Type': mime_type || 'application/octet-stream',
      'x-amz-server-side-encryption': 'AES256',
    },
    s3_key_raw: rawKey,
  });
}

async function listFiles(event) {
  const event_id = event.pathParameters?.event_id;
  if (!event_id) return fail('missing:event_id', 422);

  const evidence = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :p)',
    ExpressionAttributeValues: { ':pk': `EVENT#${event_id}`, ':p': 'EVIDENCE#' },
  }));
  const audits = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: { ':pk': `AUDIT#${event_id}` },
    ScanIndexForward: false,
    Limit: 100,
  }));

  return ok({
    event_id,
    files: (evidence.Items || []).map((it) => ({
      evidence_id:      it.evidence_id,
      filename:         it.filename,
      policy_id:        it.policy_id,
      workflow_id:      it.workflow_id,
      event_id:         it.event_id,
      form_id:          it.form_id,
      status:           it.status,
      signature_status: it.signature_status,
      source_system:    it.source_system,
      mime_type:        it.mime_type,
      size_bytes:       it.size_bytes,
      created_at:       it.created_at,
      updated_at:       it.updated_at,
    })),
    audit: (audits.Items || []).map((it) => ({
      ts:            it.sk?.split('#')[0],
      action:        it.action,
      actor:         it.actor || it.actor_id,
      actor_role:    it.actor_role || null,
      source_system: it.source_system,
      evidence_id:   it.evidence_id,
      upload_id:     it.upload_id,
      before_status: it.before_status,
      after_status:  it.after_status,
      after_hash:    it.after_hash || null,
    })),
  });
}

async function downloadFile(event) {
  const evidence_id = event.pathParameters?.evidence_id;
  const event_id    = event.queryStringParameters?.event_id;
  if (!evidence_id) return fail('missing:evidence_id', 422);
  if (!event_id)    return fail('missing:event_id (pass as ?event_id=)', 422);
  const actor = actorFrom(event);

  const got = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { pk: `EVENT#${event_id}`, sk: `EVIDENCE#${evidence_id}` },
  }));
  const item = got.Item;
  if (!item) return fail('not_found', 404);

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: item.s3_bucket, Key: item.s3_key }),
    { expiresIn: 300 }
  );

  await writeAudit({
    event_id, action: 'FILE_DOWNLOAD_PRESIGNED', actor,
    evidence_id,
    policy_id: item.policy_id, workflow_id: item.workflow_id,
    source_system: item.source_system,
  });

  return ok({
    evidence_id,
    filename: item.filename,
    mime_type: item.mime_type,
    size_bytes: item.size_bytes,
    presigned_get_url: url,
    expires_in_seconds: 300,
  });
}

// ── POST /uploads/{upload_id}/validate ───────────────────────────
// HEADs the raw object, enforces size+MIME, streams it to compute SHA-256,
// then server-side copies it to the validated/ prefix.
async function uploadValidate(event) {
  const upload_id = event.pathParameters?.upload_id;
  if (!upload_id) return fail('missing:upload_id', 422);
  const actor = actorFrom(event);
  const body = parseBody(event);
  const event_id = body?.event_id || event.queryStringParameters?.event_id;
  if (!event_id) return fail('missing:event_id (pass in body or ?event_id=)', 422);

  const got = await ddb.send(new GetCommand({
    TableName: TABLE, Key: { pk: `EVENT#${event_id}`, sk: `UPLOAD#${upload_id}` },
  }));
  const up = got.Item;
  if (!up) return fail('upload_not_found', 404);
  if (up.status === 'VALIDATED' || up.status === 'PROMOTED') {
    return ok({ upload_id, evidence_id: up.evidence_id, status: up.status, sha256: up.sha256 || null, idempotent: true });
  }

  let head;
  try {
    head = await s3.send(new HeadObjectCommand({ Bucket: up.s3_bucket, Key: up.s3_key_raw }));
  } catch (e) {
    return fail(`raw_object_missing: ${e.message}`, 409);
  }
  const size = Number(head.ContentLength || 0);
  if (size > MAX_BYTES) return fail(`too_large:${size}>${MAX_BYTES}`, 413);
  const ct = String(head.ContentType || up.mime_type || 'application/octet-stream').toLowerCase();
  if (!MIME_ALLOWLIST.includes(ct)) return fail(`mime_not_allowed:${ct}`, 415);

  const obj = await s3.send(new GetObjectCommand({ Bucket: up.s3_bucket, Key: up.s3_key_raw }));
  const hash = crypto.createHash('sha256');
  await new Promise((resolve, reject) => {
    obj.Body.on('data', c => hash.update(c));
    obj.Body.on('end', resolve);
    obj.Body.on('error', reject);
  });
  const sha256 = hash.digest('hex');

  await s3.send(new CopyObjectCommand({
    Bucket: up.s3_bucket,
    Key: up.s3_key_validated,
    CopySource: encodeURIComponent(`${up.s3_bucket}/${up.s3_key_raw}`),
    ServerSideEncryption: 'AES256',
    MetadataDirective: 'COPY',
  }));

  const ts = now();
  await ddb.send(new UpdateCommand({
    TableName: TABLE, Key: { pk: `EVENT#${event_id}`, sk: `UPLOAD#${upload_id}` },
    UpdateExpression: 'SET #s = :s, sha256 = :h, size_bytes = :sz, mime_type = :mt, updated_at = :u',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':s': 'VALIDATED', ':h': sha256, ':sz': size, ':mt': ct, ':u': ts },
  }));
  await ddb.send(new UpdateCommand({
    TableName: TABLE, Key: { pk: `EVENT#${event_id}`, sk: `EVIDENCE#${up.evidence_id}` },
    UpdateExpression: 'SET #s = :s, sha256 = :h, size_bytes = :sz, mime_type = :mt, s3_key = :k, updated_at = :u',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':s': 'VALIDATED', ':h': sha256, ':sz': size, ':mt': ct, ':k': up.s3_key_validated, ':u': ts },
  }));

  await writeAudit({
    event_id, action: 'UPLOAD_VALIDATED', actor,
    before_status: up.status, after_status: 'VALIDATED', after_hash: sha256,
    evidence_id: up.evidence_id, upload_id,
    policy_id: up.policy_id, workflow_id: up.workflow_id, source_system: up.source_system,
  });

  return ok({
    upload_id, evidence_id: up.evidence_id, status: 'VALIDATED',
    sha256, size_bytes: size, mime_type: ct,
    s3_key_validated: up.s3_key_validated,
  });
}

// ── POST /uploads/{upload_id}/promote ────────────────────────────
// Server-side copies validated → prod bucket, marks evidence APPROVED_EVIDENCE,
// emits EVIDENCE_PROMOTED audit. Idempotent on upload_id.
async function uploadPromote(event) {
  const upload_id = event.pathParameters?.upload_id;
  if (!upload_id) return fail('missing:upload_id', 422);
  const actor = actorFrom(event);
  const body = parseBody(event);
  const event_id = body?.event_id || event.queryStringParameters?.event_id;
  if (!event_id) return fail('missing:event_id', 422);

  const got = await ddb.send(new GetCommand({
    TableName: TABLE, Key: { pk: `EVENT#${event_id}`, sk: `UPLOAD#${upload_id}` },
  }));
  const up = got.Item;
  if (!up) return fail('upload_not_found', 404);
  if (up.status === 'PROMOTED') {
    return ok({
      upload_id, evidence_id: up.evidence_id, status: 'APPROVED_EVIDENCE', idempotent: true,
      s3_bucket: PROD_BUCKET, s3_key: up.s3_key_evidence,
    });
  }
  if (up.status !== 'VALIDATED') {
    return fail(`bad_state:${up.status} (must be VALIDATED)`, 409);
  }

  await s3.send(new CopyObjectCommand({
    Bucket: PROD_BUCKET,
    Key: up.s3_key_evidence,
    CopySource: encodeURIComponent(`${up.s3_bucket}/${up.s3_key_validated}`),
    ServerSideEncryption: 'AES256',
    MetadataDirective: 'REPLACE',
    ContentType: up.mime_type || 'application/octet-stream',
    Metadata: {
      policy_id:   up.policy_id   || '',
      workflow_id: up.workflow_id || '',
      event_id:    up.event_id    || '',
      evidence_id: up.evidence_id || '',
      sha256:      up.sha256      || '',
      promoted_by: actor.actor_id,
    },
  }));

  const ts = now();
  await ddb.send(new UpdateCommand({
    TableName: TABLE, Key: { pk: `EVENT#${event_id}`, sk: `UPLOAD#${upload_id}` },
    UpdateExpression: 'SET #s = :s, updated_at = :u',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':s': 'PROMOTED', ':u': ts },
  }));
  await ddb.send(new UpdateCommand({
    TableName: TABLE, Key: { pk: `EVENT#${event_id}`, sk: `EVIDENCE#${up.evidence_id}` },
    UpdateExpression: 'SET #s = :s, s3_bucket = :b, s3_key = :k, promoted_at = :u, promoted_by = :p, updated_at = :u',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: {
      ':s': 'APPROVED_EVIDENCE', ':b': PROD_BUCKET, ':k': up.s3_key_evidence,
      ':u': ts, ':p': actor.actor_id,
    },
  }));

  await writeAudit({
    event_id, action: 'EVIDENCE_PROMOTED', actor,
    before_status: 'VALIDATED', after_status: 'APPROVED_EVIDENCE', after_hash: up.sha256,
    evidence_id: up.evidence_id, upload_id,
    policy_id: up.policy_id, workflow_id: up.workflow_id, source_system: up.source_system,
  });

  return ok({
    upload_id, evidence_id: up.evidence_id, status: 'APPROVED_EVIDENCE',
    s3_bucket: PROD_BUCKET, s3_key: up.s3_key_evidence,
    sha256: up.sha256 || null,
  });
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    if (event.isBase64Encoded) return JSON.parse(Buffer.from(event.body, 'base64').toString('utf8'));
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

// ── ID normalisation ─────────────────────────────────────────
// Triplet IDs must match `^[A-Z]{2,4}-[A-Z0-9-]{2,}$`. Front-end may produce
// IDs with lowercase / underscores / dots (e.g. instance ids). Coerce to a
// safe form so the eSign / form-submit endpoints don't reject legitimate calls.
function coerceId(prefix, raw) {
  const s = String(raw || '').toUpperCase().replace(/[^A-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (ID_RE.test(s)) return s;
  const fixed = `${prefix}-${s || ULID()}`.replace(/-+/g, '-').slice(0, 60);
  return ID_RE.test(fixed) ? fixed : `${prefix}-${ULID()}`;
}

// ── POST /esign/complete ──────────────────────────────────
// Records a completed e-signature as compliance evidence:
//   1. JSON evidence artifact written to PROD bucket
//   2. EVIDENCE row in DDB (signature_status=SIGNED, status=APPROVED_EVIDENCE)
//   3. Append-only DOCUMENT_SIGNED audit row
async function esignComplete(event) {
  const body = parseBody(event);
  const actor = actorFrom(event);

  const policy_id   = coerceId('POL', body.policy_id   || 'UNLINKED');
  const workflow_id = coerceId('WF',  body.workflow_id || `FORM-${body.form_id || 'NA'}`);
  const event_id    = coerceId('EVT', body.event_id    || body.instance_id || `ESIGN-${ULID()}`);
  const form_id     = String(body.form_id || 'UNKNOWN').toUpperCase().replace(/[^A-Z0-9-]/g, '-').slice(0, 40) || 'UNKNOWN';

  if (!body.signer_id   || typeof body.signer_id   !== 'string') return fail('missing_or_invalid:signer_id', 422);
  if (!body.signer_name || typeof body.signer_name !== 'string') return fail('missing_or_invalid:signer_name', 422);
  if (!body.signature_hash || typeof body.signature_hash !== 'string') return fail('missing_or_invalid:signature_hash', 422);

  const evidence_id = `EVD-${ULID()}`;
  const ts = now();
  const filename = `esign-${form_id}.json`;
  const s3_key = `evidence/${policy_id}/${workflow_id}/${event_id}/${evidence_id}/${filename}`;

  const artifact = {
    evidence_type:    'esignature',
    evidence_id,
    schema_version:   '1.0',
    policy_id, workflow_id, event_id, form_id,
    instance_id:      body.instance_id     || null,
    document_id:      body.document_id     || form_id,
    document_hash:    body.document_hash   || null,
    signature_hash:   body.signature_hash,
    attestation_text: body.attestation_text || null,
    signer: {
      id:    body.signer_id,
      name:  body.signer_name,
      role:  body.signer_role  || actor.actor_role || null,
      email: body.signer_email || null,
    },
    signed_at: body.signed_at || ts,
    capture: {
      source_ip:  actor.source_ip,
      user_agent: actor.user_agent,
      request_id: actor.request_id,
    },
    recorded_at: ts,
    recorded_by: actor.actor_id,
  };
  const bodyBytes = Buffer.from(JSON.stringify(artifact, null, 2), 'utf8');
  const sha256 = crypto.createHash('sha256').update(bodyBytes).digest('hex');

  // 1. PUT JSON artifact directly to prod bucket
  await s3.send(new PutObjectCommand({
    Bucket: PROD_BUCKET,
    Key: s3_key,
    Body: bodyBytes,
    ContentType: 'application/json',
    ServerSideEncryption: 'AES256',
    Metadata: {
      policy_id, workflow_id, event_id, evidence_id,
      form_id, signer_id: body.signer_id, sha256,
    },
  }));

  // 2. EVIDENCE row
  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: {
      pk: `EVENT#${event_id}`, sk: `EVIDENCE#${evidence_id}`,
      type: 'EVIDENCE', status: 'APPROVED_EVIDENCE',
      evidence_kind: 'esignature',
      policy_id, workflow_id, event_id, form_id,
      evidence_id, filename,
      mime_type: 'application/json', size_bytes: bodyBytes.length,
      source_system: 'ecign',
      signature_status: 'SIGNED',
      sha256, signature_hash: body.signature_hash,
      document_hash: body.document_hash || null,
      signer_id: body.signer_id, signer_name: body.signer_name,
      signer_role: body.signer_role || actor.actor_role || null,
      signer_email: body.signer_email || null,
      signed_at: body.signed_at || ts,
      instance_id: body.instance_id || null,
      s3_bucket: PROD_BUCKET, s3_key,
      created_by: actor.actor_id,
      created_at: ts, updated_at: ts,
    },
  }));

  // 3. Audit
  await writeAudit({
    event_id, action: 'DOCUMENT_SIGNED', actor,
    after_status: 'SIGNED', after_hash: body.signature_hash,
    evidence_id, policy_id, workflow_id,
    source_system: 'ecign',
  });

  return ok({
    evidence_id, status: 'APPROVED_EVIDENCE', signature_status: 'SIGNED',
    s3_bucket: PROD_BUCKET, s3_key, sha256,
    policy_id, workflow_id, event_id, form_id,
  });
}

// ── POST /forms/submit ─────────────────────────────────────
// Persists a completed form submission as compliance evidence:
//   1. JSON snapshot of the form fields written to PROD bucket
//   2. EVIDENCE row (signature_status reflects whether approval is still needed)
//   3. FORM_SUBMITTED audit row
// If `requires_signature` or `requires_approval` is true, the row is left at
// status=PENDING_APPROVAL and signature_status=PENDING.
async function formSubmit(event) {
  const body = parseBody(event);
  const actor = actorFrom(event);

  const policy_id   = coerceId('POL', body.policy_id   || 'UNLINKED');
  const workflow_id = coerceId('WF',  body.workflow_id || `FORM-${body.form_id || 'NA'}`);
  const event_id    = coerceId('EVT', body.event_id    || body.form_instance_id || `FORM-${ULID()}`);
  const form_id     = String(body.form_id || 'UNKNOWN').toUpperCase().replace(/[^A-Z0-9-]/g, '-').slice(0, 40) || 'UNKNOWN';

  if (!body.fields || typeof body.fields !== 'object') return fail('missing_or_invalid:fields', 422);

  const evidence_id = `EVD-${ULID()}`;
  const ts = now();
  const filename = `form-${form_id}.json`;
  const s3_key = `evidence/${policy_id}/${workflow_id}/${event_id}/${evidence_id}/${filename}`;
  const requiresSig = body.requires_signature === true || body.requires_approval === true;

  const artifact = {
    evidence_type: 'form_submission',
    evidence_id, schema_version: '1.0',
    policy_id, workflow_id, event_id, form_id,
    form_instance_id: body.form_instance_id || null,
    submitted_by: { id: actor.actor_id, role: actor.actor_role },
    submitted_at: body.submitted_at || ts,
    requires_signature: requiresSig,
    fields: body.fields,
    capture: { source_ip: actor.source_ip, user_agent: actor.user_agent, request_id: actor.request_id },
    recorded_at: ts,
  };
  const bodyBytes = Buffer.from(JSON.stringify(artifact, null, 2), 'utf8');
  const sha256 = crypto.createHash('sha256').update(bodyBytes).digest('hex');

  await s3.send(new PutObjectCommand({
    Bucket: PROD_BUCKET,
    Key: s3_key,
    Body: bodyBytes,
    ContentType: 'application/json',
    ServerSideEncryption: 'AES256',
    Metadata: { policy_id, workflow_id, event_id, evidence_id, form_id, sha256 },
  }));

  const status = requiresSig ? 'PENDING_APPROVAL' : 'APPROVED_EVIDENCE';
  const sigStatus = requiresSig ? 'PENDING' : 'NONE';

  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: {
      pk: `EVENT#${event_id}`, sk: `EVIDENCE#${evidence_id}`,
      type: 'EVIDENCE', status,
      evidence_kind: 'form_submission',
      policy_id, workflow_id, event_id, form_id,
      evidence_id, filename,
      mime_type: 'application/json', size_bytes: bodyBytes.length,
      source_system: body.source_system || 'hhc',
      signature_status: sigStatus,
      sha256,
      form_instance_id: body.form_instance_id || null,
      s3_bucket: PROD_BUCKET, s3_key,
      created_by: actor.actor_id,
      created_at: ts, updated_at: ts,
    },
  }));

  await writeAudit({
    event_id, action: 'FORM_SUBMITTED', actor,
    after_status: status, after_hash: sha256,
    evidence_id, policy_id, workflow_id,
    source_system: body.source_system || 'hhc',
  });

  return ok({
    evidence_id, status, signature_status: sigStatus,
    s3_bucket: PROD_BUCKET, s3_key, sha256,
    policy_id, workflow_id, event_id, form_id,
    requires_signature: requiresSig,
  });
}
