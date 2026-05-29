import type {
  CesMetadataSnapshot,
  CesMetadataLoad,
  GoogleDriveEvidenceRef,
} from '@/policy/evidence/storageProviders/types';
import { CES_BACKEND_UNAVAILABLE_MESSAGE } from '@/policy/evidence/storageProviders/types';

/* ═══════════════════════════════════════════════════════════════
   CES metadata API client
   ----------------------------------------------------------------
   The browser's ONLY persistence path for CES execution/evidence
   metadata. There is NO localStorage. If this backend is
   unreachable, callers receive an explicit `unavailable` result and
   the UI must show an honest "unavailable" state — never a silent
   localStorage fallback.

   File bytes never travel through this client — they go to Google
   Drive via the Calendar evidence upload. Here we move pointers,
   status, and the non-PHI operational snapshot only.
   ═══════════════════════════════════════════════════════════════ */

const CES_BASE = '/api/ces';
const CAL_BASE = '/api/calendar';

const AUTH_HEADER: Record<string, string> = (() => {
  const token = import.meta.env.VITE_API_SHARED_SECRET as string | undefined;
  return token ? { Authorization: `Bearer ${token}` } : ({} as Record<string, string>);
})();

export interface CesApiError {
  code: string;
  message: string;
  status: number;
}

async function request<T>(base: string, method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...AUTH_HEADER },
    body: body == null ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const json = text ? safeJson(text) : null;
  if (!res.ok) {
    const err: CesApiError = {
      code: json?.error?.code ?? 'network_error',
      message: json?.error?.message ?? res.statusText ?? 'Request failed',
      status: res.status,
    };
    throw err;
  }
  return (json as T) ?? ({} as T);
}

function safeJson(s: string): ({ error?: { code?: string; message?: string } } & Record<string, unknown>) | null {
  try { return JSON.parse(s); } catch { return null; }
}

export interface CesHealthResponse {
  ok: boolean;
  provider: string;
  metadataProvider: 'file_local' | 'dynamodb_metadata';
  cesStorageProvider: string;
  error?: string;
}

export interface EvidenceListResponse {
  eventId: string;
  items: GoogleDriveEvidenceRef[];
  count: number;
}

export interface DriveFolderResponse {
  eventId: string;
  driveFolderId: string;
  driveFolderUrl: string;
}

export const EvidenceApi = {
  /** Backend reachability + which metadata provider is active. */
  async health(): Promise<CesHealthResponse> {
    return request(CES_BASE, 'GET', '/health');
  },

  /**
   * Load the CES metadata snapshot. Returns an explicit `unavailable` result
   * (never throws to a silent fallback) so the UI can show an honest state.
   */
  async loadSnapshot(workspaceId: string): Promise<CesMetadataLoad> {
    try {
      const res = await request<{ status: 'ok' | 'empty'; snapshot?: CesMetadataSnapshot }>(
        CES_BASE, 'GET', `/snapshot/${encodeURIComponent(workspaceId)}`,
      );
      if (res.status === 'ok' && res.snapshot) return { status: 'ok', snapshot: res.snapshot };
      return { status: 'empty' };
    } catch (e) {
      const err = e as CesApiError;
      return { status: 'unavailable', message: err?.message || CES_BACKEND_UNAVAILABLE_MESSAGE };
    }
  },

  /** Persist the CES metadata snapshot. Throws if the backend rejects/fails. */
  async saveSnapshot(workspaceId: string, snapshot: CesMetadataSnapshot): Promise<CesMetadataSnapshot> {
    const res = await request<{ status: 'ok'; snapshot: CesMetadataSnapshot }>(
      CES_BASE, 'PUT', `/snapshot/${encodeURIComponent(workspaceId)}`, snapshot,
    );
    return res.snapshot;
  },

  /** List the NON-PHI evidence pointers recorded for an event. */
  async listEvidence(eventId: string): Promise<EvidenceListResponse> {
    return request(CES_BASE, 'GET', `/events/${encodeURIComponent(eventId)}/evidence`);
  },

  /** Resolve (auto-creating) the event's base Drive folder link. */
  async getDriveFolder(eventId: string, opts: { domain?: string; eventDate?: string } = {}): Promise<DriveFolderResponse> {
    const qs = new URLSearchParams();
    if (opts.domain) qs.set('domain', opts.domain);
    if (opts.eventDate) qs.set('eventDate', opts.eventDate);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request(CAL_BASE, 'GET', `/events/${encodeURIComponent(eventId)}/drive-folder${suffix}`);
  },

  /**
   * Publish a FULLY COMPLETED signed artifact (signed PDF / eCIgn certificate /
   * final package) to Drive. Drafts/in-progress instances must NOT be published
   * — they stay in CES metadata only.
   */
  async publishSignedArtifact(eventId: string, file: File, meta: {
    taskId: string;
    workflowId?: string;
    formId?: string;
    formInstanceId?: string;
    artifactType: 'signed_artifact' | 'ecign_certificate' | 'final_package';
    title?: string;
    domain?: string;
    eventDate?: string;
    uploadedBy?: string;
  }): Promise<{ evidenceId: string; driveFileId: string; driveFileUrl: string; calendarAttachmentStatus: string }> {
    const contentBase64 = await fileToBase64(file);
    return request(CAL_BASE, 'POST', `/events/${encodeURIComponent(eventId)}/signed-artifact/publish`, {
      ...meta,
      completed: true,
      fileName: file.name,
      mimeType: file.type || 'application/pdf',
      contentBase64,
    });
  },
};

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
