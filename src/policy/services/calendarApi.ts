import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';

/* ═══════════════════════════════════════════════════════════════
   Calendar API client
   ----------------------------------------------------------------
   Thin, typed wrapper around the backend /api/calendar/* routes.
   The frontend NEVER speaks to Google directly — all traffic is
   mediated server-side so the service-account key stays private.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Transport types (mirror server/mappers.ts PlannerEventPayload) ─── */

export interface PlannerEventPayload {
  appEventId: string;
  title: string;
  summary?: string;
  description?: string;
  date: string;         // YYYY-MM-DD
  endDate?: string;     // YYYY-MM-DD
  time?: string;        // HH:mm (24h)
  timeEnd?: string;     // HH:mm (24h)
  allDay?: boolean;
  timezone?: string;    // IANA, e.g. "America/Los_Angeles"

  domain?: string;
  category?: string;
  cadence?: string;
  /** Mandate classification — federal-required | conditional-federal | policy-driven | state-required */
  mandateType?: string;
  policyRefs?: string[];
  owner?: string;
  ownerRole?: string;
  status?: string;
  evidenceStatus?: string;
  regulatoryDriver?: string;
  auditRisk?: string;
  completionState?: string;
  location?: string;
}

export interface PlannerEventResponse extends PlannerEventPayload {
  googleEventId: string;
  htmlLink?: string;
  createdAt?: string;
  updatedAt?: string;
  source: 'google';
  /** Whether the backend created a new event or updated an existing one. */
  action?: 'created' | 'updated';
}

export interface BulkSyncResultItem {
  appEventId: string;
  ok: boolean;
  googleEventId?: string;
  action?: 'created' | 'updated';
  error?: string;
}

export interface BulkSyncResult {
  results: BulkSyncResultItem[];
  count: number;
  okCount: number;
  createdCount: number;
  updatedCount: number;
  failedCount: number;
}

export interface CalendarApiError {
  code: string;
  message: string;
  status: number;
}

/* ─── Config ───────────────────────────────────────────── */

const BASE = '/api/calendar';

/** Optional shared secret (only used if VITE_API_SHARED_SECRET is set). */
const AUTH_HEADER: Record<string, string> = (() => {
  const token = import.meta.env.VITE_API_SHARED_SECRET as string | undefined;
  return token ? { Authorization: `Bearer ${token}` } : ({} as Record<string, string>);
})();

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...AUTH_HEADER,
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const json = text ? safeJson(text) : null;
  if (!res.ok) {
    const err: CalendarApiError = {
      code: (json && json.error?.code) || 'network_error',
      message: (json && json.error?.message) || res.statusText || 'Request failed',
      status: res.status,
    };
    throw err;
  }
  return (json as T) ?? ({} as T);
}

function safeJson(s: string): { error?: { code?: string; message?: string } } & Record<string, unknown> {
  try { return JSON.parse(s); } catch { return {}; }
}

/* ─── API surface ──────────────────────────────────────── */

export const CalendarApi = {
  async health(): Promise<{ ok: boolean; calendar: { reachable: boolean; summary?: string; error?: string } }> {
    return request('GET', '/healthz');
  },
  async list(params: { start?: string; end?: string; q?: string }): Promise<{ items: PlannerEventResponse[] }> {
    const qs = new URLSearchParams();
    if (params.start) qs.set('start', params.start);
    if (params.end)   qs.set('end', params.end);
    if (params.q)     qs.set('q', params.q);
    return request('GET', `/events?${qs.toString()}`);
  },
  async findByAppId(appEventId: string): Promise<PlannerEventResponse> {
    return request('GET', `/events/by-app/${encodeURIComponent(appEventId)}`);
  },
  async create(payload: PlannerEventPayload): Promise<PlannerEventResponse> {
    return request('POST', '/events', payload);
  },
  async update(googleEventId: string, payload: PlannerEventPayload): Promise<PlannerEventResponse> {
    return request('PUT', `/events/${encodeURIComponent(googleEventId)}`, payload);
  },
  async remove(googleEventId: string, opts: { cancelOnly?: boolean } = {}): Promise<void> {
    const qs = opts.cancelOnly ? '?cancelOnly=1' : '';
    await request<void>('DELETE', `/events/${encodeURIComponent(googleEventId)}${qs}`);
  },
  async sync(events: PlannerEventPayload[]): Promise<BulkSyncResult> {
    return request('POST', '/sync', { events });
  },
};

/* ─── Translation: RegulatoryEvent → PlannerEventPayload ── */

/** Optional enforcement context folded into Google Calendar event metadata. */
export interface EnforcementSyncContext {
  riskLevel?: 'low' | 'medium' | 'high' | 'immediate-jeopardy';
  riskScore?: number;
  isLocked?: boolean;
  canComplete?: boolean;
  blockerCount?: number;
  approvalGapCount?: number;
  summary?: string;
}

export function toPlannerPayload(ev: RegulatoryEvent, enforcement?: EnforcementSyncContext): PlannerEventPayload {
  const titlePrefix =
    enforcement?.riskLevel === 'immediate-jeopardy' ? '[JEOPARDY] '
    : enforcement?.isLocked ? '[LOCKED] '
    : '';

  return {
    appEventId: ev.id,
    title: `${titlePrefix}${ev.title}`,
    summary: ev.summary,
    description: buildLongDescription(ev, enforcement),
    date: ev.date,
    endDate: ev.endDate,
    time: ev.time,
    timeEnd: ev.timeEnd,
    allDay: ev.allDay,
    timezone: ev.timezone ?? 'America/Los_Angeles',
    domain: ev.domain,
    category: ev.category,
    cadence: ev.cadence,
    mandateType: ev.mandateType,
    policyRefs: ev.policyRefs,
    owner: ev.owner,
    ownerRole: ev.ownerRole,
    regulatoryDriver: ev.regulatoryDriver,
    auditRisk: enforcement?.riskLevel === 'immediate-jeopardy' ? 'critical' : (ev.complianceFlags?.auditRisk),
    status: enforcement?.isLocked ? 'complete' : ev.urgency,
    evidenceStatus: ev.requiredForms?.some(f => f.status === 'missing')
      ? 'missing'
      : ev.requiredForms?.every(f => f.status === 'complete')
        ? 'complete'
        : 'pending',
    location: ev.location,
  };
}

function buildLongDescription(ev: RegulatoryEvent, enforcement?: EnforcementSyncContext): string {
  const parts: string[] = [];
  if (enforcement) {
    const lines: string[] = ['— Enforcement snapshot —'];
    if (enforcement.riskLevel)        lines.push(`Risk: ${enforcement.riskLevel.toUpperCase()}${enforcement.riskScore != null ? ` (${enforcement.riskScore}/100)` : ''}`);
    if (enforcement.isLocked)         lines.push('Status: LOCKED (post-approval immutability)');
    else if (enforcement.canComplete) lines.push('Status: Ready to close');
    if (enforcement.blockerCount)     lines.push(`Blockers: ${enforcement.blockerCount}`);
    if (enforcement.approvalGapCount) lines.push(`Approval gaps: ${enforcement.approvalGapCount}`);
    if (enforcement.summary)          lines.push(enforcement.summary);
    parts.push(lines.join('\n'));
  }
  if (ev.summary)          parts.push(ev.summary);
  if (ev.mandateType)      parts.push(`Mandate: ${ev.mandateType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`);
  if (ev.regulatoryDriver) parts.push(`Regulatory driver: ${ev.regulatoryDriver}`);
  if (ev.complianceFlags?.citation) parts.push(`Citation: ${ev.complianceFlags.citation}`);
  if (ev.processFlow?.length) {
    parts.push(
      'Workflow:\n' +
      ev.processFlow.map((s, i) => `  ${i + 1}. ${s.label}${s.description ? ` — ${s.description}` : ''}`).join('\n'),
    );
  }
  if (ev.requiredForms?.length) {
    parts.push(
      'Required evidence:\n' +
      ev.requiredForms.map(f => `  • ${f.label}${f.formId ? ` (${f.formId})` : ''}`).join('\n'),
    );
  }
  return parts.join('\n\n');
}
