/**
 * Audit projections — derived read models over the global event log.
 * ─────────────────────────────────────────────────────────────────────────────
 * These are computed on demand for now; a proper materialized projection store
 * is deferred (see `Builder/Enterprise/06-System-Alignment.md` §13).
 */
import { queryEvents, type AuditEvent } from './writer.js';

export interface UserActivitySummary {
  user_id: string;
  total_events: number;
  by_action: Record<string, number>;
  by_severity: Record<string, number>;
  phi_access_count: number;
  permit_count: number;
  deny_count: number;
  first_event_utc?: string;
  last_event_utc?: string;
  events: AuditEvent[];
}

export async function userActivity(user_id: string, opts: {
  since?: string; until?: string; limit?: number;
} = {}): Promise<UserActivitySummary> {
  const events = await queryEvents({
    actor_user_id: user_id,
    since: opts.since,
    until: opts.until,
    limit: opts.limit ?? 500,
  });
  const summary: UserActivitySummary = {
    user_id,
    total_events: events.length,
    by_action: {},
    by_severity: {},
    phi_access_count: 0,
    permit_count: 0,
    deny_count: 0,
    events,
  };
  for (const e of events) {
    summary.by_action[e.action] = (summary.by_action[e.action] ?? 0) + 1;
    summary.by_severity[e.severity] = (summary.by_severity[e.severity] ?? 0) + 1;
    if (e.phi_flag) summary.phi_access_count += 1;
    if (e.decision === 'permit') summary.permit_count += 1;
    if (e.decision === 'deny') summary.deny_count += 1;
    if (!summary.first_event_utc || e.occurred_at_utc < summary.first_event_utc) {
      summary.first_event_utc = e.occurred_at_utc;
    }
    if (!summary.last_event_utc || e.occurred_at_utc > summary.last_event_utc) {
      summary.last_event_utc = e.occurred_at_utc;
    }
  }
  return summary;
}

export async function sessionActivity(session_id: string): Promise<AuditEvent[]> {
  const all = await queryEvents({ limit: 5000 });
  return all.filter(e => e.session_id === session_id);
}

export async function resourceActivity(resource_type: string, resource_id: string,
    opts: { limit?: number } = {}): Promise<AuditEvent[]> {
  return queryEvents({ resource_type, resource_id, limit: opts.limit ?? 500 });
}

/**
 * PHI Access Lens — answers HIPAA §164.528 accounting of disclosures.
 * Returns events where `phi_flag === true`, optionally filtered by patient_id
 * (carried in `resource.id` when `resource.type === 'PHIRecord'` or in
 * `payload.patient_id`).
 */
export async function phiAccess(opts: {
  patient_id?: string;
  user_id?: string;
  from?: string;
  to?: string;
  limit?: number;
}): Promise<AuditEvent[]> {
  const all = await queryEvents({
    actor_user_id: opts.user_id,
    since: opts.from,
    until: opts.to,
    phi_flag: true,
    limit: opts.limit ?? 500,
  });
  if (!opts.patient_id) return all;
  return all.filter(e =>
    (e.resource.type === 'PHIRecord' && e.resource.id === opts.patient_id) ||
    e.payload.patient_id === opts.patient_id ||
    (e.resource.parent_ref?.type === 'Patient' && e.resource.parent_ref.id === opts.patient_id),
  );
}
