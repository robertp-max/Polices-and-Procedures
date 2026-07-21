/* Brad assistant API client (frontend).
   ----------------------------------------------------------------------------
   Talks to <apiRoot>/brad/*. Authentication is the real Cognito bearer token
   (attached via the shared auth/session abstraction); the server boundary
   verifies it. The DEV identity picker (x-user-*) below is a DEVELOPMENT-ONLY
   CONVENIENCE for exercising the Super Admin approval flow locally against the
   demo fallback — it is gated to import.meta.env.DEV and is NEVER sent in a
   production build. It is not a security control: the server independently
   verifies Super Admin status server-side and ignores client-supplied claims. */
import { apiRoot, bearerAuthHeader } from '@/auth/apiClient';

export interface DevIdentity {
  userId: string;
  displayName: string;
  hint: string;
}

/** Stable ids mirror server/ia/brad/superadminPolicy.ts. */
export const DEV_IDENTITIES: DevIdentity[] = [
  { userId: 'usr-regular-demo', displayName: 'Regular User', hint: 'no approval rights' },
  { userId: 'demo-user-careindeed', displayName: 'Robert Padilla', hint: 'Super Admin (owner)' },
  { userId: 'usr-marites', displayName: 'Marites', hint: 'Super Admin (operations)' },
  { userId: 'usr-deeb-admin', displayName: 'Dee', hint: 'Super Admin (governance)' },
];

const LS_KEY = 'brad.devIdentity.userId';

export function getIdentity(): DevIdentity {
  const id = typeof localStorage !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
  return DEV_IDENTITIES.find((d) => d.userId === id) ?? DEV_IDENTITIES[0];
}

export function setIdentity(userId: string): void {
  try { localStorage.setItem(LS_KEY, userId); } catch { /* ignore */ }
}

/** Development-only identity headers — omitted entirely from production builds. */
function devIdentityHeaders(): Record<string, string> {
  if (!import.meta.env.DEV) return {};
  const id = getIdentity();
  return { 'x-user-id': id.userId, 'x-user-display-name': id.displayName };
}

async function bradFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiRoot()}/brad${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...bearerAuthHeader(),
      ...devIdentityHeaders(),
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { message?: string }).message || `Request failed (${res.status})`);
  return body as T;
}

/* ─── Response shapes (light mirrors of the server contract) ───────────────── */

export interface RuntimeInfo {
  configuredMode: string;
  effectiveMode: string;
  /** Health of the selected provider — 'ready' | 'configuration-error' | 'unavailable'. */
  runtimeStatus?: 'ready' | 'configuration-error' | 'unavailable';
  badge: string;
  phiPermitted: boolean;
  provider?: string;
  modelId: string;
  canReachInternet: boolean;
  /** True when a selected live engine could not initialize (requests fail closed). */
  failClosed?: boolean;
  diagnosticCode?: string;
  diagnosticReason?: string;
  nolanEnabled: boolean;
}

export interface SuperAdminMe {
  isSuperAdmin: boolean;
  userId?: string;
  displayName?: string;
  permissions: string[];
  reason?: string;
}

export type BradReferenceType = 'policy' | 'workflow' | 'form' | 'help' | 'event';

export interface BradReference {
  type: BradReferenceType;
  id: string;
  title: string;
  section?: string;
  family?: string;
}

export interface BradAnswer {
  text: string;
  synthetic: boolean;
  blocked: boolean;
  reason?: string;
  /** Structured internal references the UI renders as clickable document links. */
  references?: BradReference[];
  /** Broad critical-incident track the message routed to. */
  track?: string;
}

export interface ObjectMetadata {
  object_id: string;
  object_type: string;
  requested_by_user_id: string;
  approved_by_super_admin_id?: string;
  source_event_id?: string;
  source_workflow_id?: string;
  source_policy_ids: string[];
  source_form_ids: string[];
  generated_at: string;
  runtime_mode: string;
  model_provider: string;
  model_id: string;
  write_status: string;
  immutable_audit_hash: string;
}
export interface GeneratedObject { metadata: ObjectMetadata; content: unknown }

export interface EventMetaResult {
  ok: boolean;
  appliedFields: string[];
  rejectedFields: string[];
  requiresChangeSet: boolean;
  reason?: string;
}

export interface ApprovalRequest {
  approvalId: string;
  objectId: string;
  objectType: string;
  requiredPermission: string;
  requestedByUserId: string;
  sourceEventId?: string;
  protectedCoreRefs: string[];
  riskLevel: 'low' | 'medium' | 'high';
  preview: { kind: string; summary: string; before?: unknown; after?: unknown; appendedFields?: Record<string, unknown> };
  status: string;
  createdAt: string;
}

export interface BradProfile {
  authenticated: boolean;
  userId?: string;
  firstName?: string;
  displayName?: string;
}

export interface CloudPlan {
  ops: unknown[];
  allowlistValid: boolean;
  disallowedReasons: string[];
  dryRunSummary: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MassAddSummary {
  total: number; valid: number; duplicates: number; invalid: number; risky: number;
  rows: Array<{ index: number; firstName?: string; lastName?: string; email?: string; role?: string; issues: string[]; risky: boolean; duplicate: boolean; invalid: boolean }>;
}

export interface UploadMeta {
  id: string;
  filename: string;
  mime: string;
  size: number;
  contentHash: string;
  dateCreatedInSystem: string;
  uploadedByUserId: string;
  eventId?: string;
}

export const bradApi = {
  runtime: () => bradFetch<RuntimeInfo>('/runtime'),
  me: () => bradFetch<SuperAdminMe>('/superadmin/me'),
  events: () => bradFetch<{ events: Array<{ eventId: string; eventTitle: string; eventType: string }> }>('/events'),
  ask: (input: string) => bradFetch<BradAnswer>('/ask', { method: 'POST', body: JSON.stringify({ input }) }),
  report: (kind: 'event-readiness' | 'qapi-packet', eventId?: string) =>
    bradFetch<{ object: GeneratedObject }>('/report', { method: 'POST', body: JSON.stringify({ kind, eventId }) }),
  eventPacket: (kind: 'general' | 'qapi', eventId?: string) =>
    bradFetch<{ object: GeneratedObject; eventUpdate: EventMetaResult }>('/event-packet', { method: 'POST', body: JSON.stringify({ kind, eventId }) }),
  qapiMinutes: (eventId?: string) =>
    bradFetch<{ object: GeneratedObject; eventUpdate: EventMetaResult }>('/qapi-minutes', { method: 'POST', body: JSON.stringify({ eventId }) }),
  objects: () => bradFetch<{ objects: GeneratedObject[] }>('/objects'),
  object: (id: string) => bradFetch<{ object: GeneratedObject; integrityVerified: boolean }>(`/objects/${id}`),
  proposeCloudChangeSet: (ops: unknown[], eventId?: string) =>
    bradFetch<{ object: GeneratedObject; plan: { allowlistValid: boolean; disallowedReasons: string[]; dryRunSummary: string[]; riskLevel: string }; approvalId: string | null }>(
      '/cloud-change-set', { method: 'POST', body: JSON.stringify({ ops, eventId }) }),
  approvals: () => bradFetch<{ pending: ApprovalRequest[]; identity: SuperAdminMe }>('/approvals'),
  decide: (approvalId: string, decision: 'approved' | 'denied', reason?: string) =>
    bradFetch<{ decision: { decision: string; reason?: string }; allowedWrite: boolean }>(
      `/approvals/${approvalId}/decide`, { method: 'POST', body: JSON.stringify({ decision, reason }) }),
  profile: () => bradFetch<BradProfile>('/profile'),
  audit: () => bradFetch<{ audit: unknown[] }>('/audit'),
  upload: (files: Array<{ filename: string; mime: string; contentBase64: string }>, eventId?: string) =>
    bradFetch<{ uploaded: UploadMeta[] }>('/upload', { method: 'POST', body: JSON.stringify({ files, eventId }) }),
  uploads: (eventId?: string) =>
    bradFetch<{ uploads: UploadMeta[] }>(`/uploads${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ''}`),

  /* ─── Builder Beta (Super Admin only; server re-verifies on every call) ──── */
  builder: {
    otp: (body: { targetUserId: string; purpose: string; ttlMinutes?: number; deliveryMethod?: string; confirm: boolean }) =>
      bradFetch<{ otpId: string; otp: string; expiresAt: string; targetUserId: string; purpose: string; notice: string }>(
        '/builder/otp', { method: 'POST', body: JSON.stringify(body) }),
    createPermission: (body: Record<string, unknown>) =>
      bradFetch<{ object: GeneratedObject }>('/builder/permission', { method: 'POST', body: JSON.stringify(body) }),
    createRole: (body: Record<string, unknown>) =>
      bradFetch<{ object: GeneratedObject; permissionDiff: { added: string[]; removed: string[] } }>(
        '/builder/role', { method: 'POST', body: JSON.stringify(body) }),
    massAddDryRun: (rows: unknown[]) =>
      bradFetch<{ summary: MassAddSummary }>('/builder/users/dry-run', { method: 'POST', body: JSON.stringify({ rows }) }),
    massAddCommit: (rows: unknown[], confirm: boolean) =>
      bradFetch<{ object: GeneratedObject; summary: MassAddSummary; blocker: string }>(
        '/builder/users', { method: 'POST', body: JSON.stringify({ rows, confirm }) }),
    createReportTemplate: (body: Record<string, unknown>) =>
      bradFetch<{ object: GeneratedObject; version: number }>('/builder/report-template', { method: 'POST', body: JSON.stringify(body) }),
    listReportTemplates: () => bradFetch<{ templates: GeneratedObject[] }>('/builder/report-templates'),
    createComponentSpec: (body: Record<string, unknown>) =>
      bradFetch<{ object: GeneratedObject }>('/builder/component-spec', { method: 'POST', body: JSON.stringify(body) }),
    cloudDryRun: (ops: unknown[]) =>
      bradFetch<{ plan: CloudPlan }>('/cloud-change-set/dry-run', { method: 'POST', body: JSON.stringify({ ops }) }),
    proposeCloud: (ops: unknown[]) =>
      bradFetch<{ object: GeneratedObject; plan: CloudPlan; approvalId: string | null }>(
        '/cloud-change-set', { method: 'POST', body: JSON.stringify({ ops }) }),
    pending: () => bradFetch<{ objects: GeneratedObject[]; approvals: ApprovalRequest[]; audit: unknown[] }>('/builder/pending'),
  },
};
