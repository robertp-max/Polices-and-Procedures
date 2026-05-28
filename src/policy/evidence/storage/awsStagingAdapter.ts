/**
 * AWS staging evidence storage adapter.
 *
 * Talks to the API Gateway routes provisioned by `infra/aws-staging/`:
 *   POST /uploads/init                    → presigned PUT URL
 *   POST /uploads/{upload_id}/validate
 *   POST /uploads/{upload_id}/promote     → EVIDENCE_LOCKED + audit
 *   GET  /events/{event_id}/files
 *
 * Hard rules enforced here:
 *   - artifact bytes go directly to S3 via the presigned URL — they
 *     never pass through this process or localStorage.
 *   - presigned URLs are short-lived (server enforces 10 min PUT,
 *     2 min GET); we never cache them.
 *   - PHI is rejected at the boundary (`phi: true` is not sent here).
 */

import type {
  ArtifactRef,
  EvidenceStorageAdapter,
  PromoteInput,
  UploadInitInput,
  UploadInitResult,
} from '../storageMode';

const API_BASE = (import.meta.env?.VITE_AWS_API_BASE_URL ?? '').replace(/\/+$/, '');

class StorageApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'StorageApiError';
    this.status = status;
    this.code = code;
  }
}

const requireApi = (): string => {
  if (!API_BASE) {
    throw new StorageApiError(0, 'no_api_base', 'VITE_AWS_API_BASE_URL is not set; aws-staging mode cannot reach the API.');
  }
  return API_BASE;
};

const callJson = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const base = requireApi();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
  });
  const text = await res.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }
  if (!res.ok) {
    const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object';
    const err = isRecord(body) && isRecord(body.error) ? body.error : null;
    const code = (err && typeof err.code === 'string' ? err.code : null) ?? `http_${res.status}`;
    const msg  = (err && typeof err.message === 'string' ? err.message : null) ?? text ?? res.statusText;
    throw new StorageApiError(res.status, code, msg);
  }
  return body as T;
};

export const awsStagingAdapter: EvidenceStorageAdapter = {
  mode: 'aws-staging',

  async initUpload(input: UploadInitInput): Promise<UploadInitResult> {
    type Resp = { upload_id: string; put_url: string; s3_key: string; bucket: string; expires_in: number };
    const r = await callJson<Resp>('/uploads/init', {
      method: 'POST',
      body: JSON.stringify({
        policy_id:   input.policyId,
        workflow_id: input.workflowId,
        event_id:    input.eventId,
        filename:    input.filename,
        content_type:input.contentType,
      }),
    });
    return {
      uploadId: r.upload_id,
      putUrl:   r.put_url,
      locator:  { kind: 'aws-evidence', evidenceId: r.upload_id },
      expiresIn: r.expires_in,
    };
  },

  async validate(uploadId: string): Promise<void> {
    await callJson<unknown>(`/uploads/${encodeURIComponent(uploadId)}/validate`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  async promote(input: PromoteInput): Promise<ArtifactRef> {
    type Resp = { evidence_id: string; status: string; evidence_key: string };
    const r = await callJson<Resp>(`/uploads/${encodeURIComponent(input.uploadId)}/promote`, {
      method: 'POST',
      body: JSON.stringify({ event_id: input.eventId }),
    });
    return {
      evidenceId: r.evidence_id,
      filename:   '',
      contentType:'application/octet-stream',
      policyId:   '',
      workflowId: '',
      eventId:    input.eventId,
      source:     'aws-staging',
      locator:    { kind: 'aws-evidence', evidenceId: r.evidence_id },
      createdAt:  new Date().toISOString(),
    };
  },

  async resolvePreviewUrl(ref: ArtifactRef): Promise<string | undefined> {
    if (ref.locator.kind !== 'aws-evidence') return undefined;
    type Resp = { get_url: string };
    const r = await callJson<Resp>(`/files/${encodeURIComponent(ref.evidenceId)}/download`)
      .catch(() => null);
    return r?.get_url;
  },

  async listEventArtifacts(eventId: string): Promise<ArtifactRef[]> {
    type Resp = {
      event_id: string;
      count: number;
      files: Array<{
        evidence_id: string; filename: string; content_type: string;
        status: string; created_at: string;
        policy_id: string; workflow_id: string; event_id: string;
      }>;
    };
    const r = await callJson<Resp>(`/events/${encodeURIComponent(eventId)}/files`);
    return r.files.map((f) => ({
      evidenceId: f.evidence_id,
      filename:   f.filename,
      contentType:f.content_type,
      policyId:   f.policy_id,
      workflowId: f.workflow_id,
      eventId:    f.event_id,
      source:     'aws-staging',
      locator:    { kind: 'aws-evidence', evidenceId: f.evidence_id },
      createdAt:  f.created_at,
    }));
  },
};

export { StorageApiError };
