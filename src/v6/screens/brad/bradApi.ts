/* Brad assistant API client (frontend).
   ----------------------------------------------------------------------------
   Talks to /api/brad/*. Identity is sent via the dev header convention
   (x-user-id). The DEV identity picker below is a CONVENIENCE for exercising
   the Super Admin approval flow locally — it is NOT a security control: the
   server independently verifies Super Admin status against its own allowlist
   keyed by stable user id, and ignores client-supplied role claims. */

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

async function bradFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const id = getIdentity();
  const res = await fetch(`/api/brad${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': id.userId,
      'x-user-display-name': id.displayName,
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
  badge: string;
  phiPermitted: boolean;
  modelId: string;
  canReachInternet: boolean;
  nolanEnabled: boolean;
}

export interface SuperAdminMe {
  isSuperAdmin: boolean;
  userId?: string;
  displayName?: string;
  permissions: string[];
  reason?: string;
}

export interface BradAnswer {
  text: string;
  synthetic: boolean;
  blocked: boolean;
  reason?: string;
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
};
