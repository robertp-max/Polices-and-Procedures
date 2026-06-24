/* ═══════════════════════════════════════════════════════════════════════════
   Super Admin / guarded-action audit log.
   Append-only, in-memory ring buffer (cap 1000). Records every approval,
   denial, and guarded-action decision. No secret values are ever recorded.
   ═══════════════════════════════════════════════════════════════════════════ */

export type AuditEventType =
  | 'approval.requested'
  | 'approval.granted'
  | 'approval.denied'
  | 'action.allowed'
  | 'action.blocked'
  | 'object.created'
  | 'event.metadata.appended'
  | 'event.metadata.rejected'
  | 'cloud.dryrun'
  | 'cloud.apply'
  | 'cloud.blocked';

export interface AuditEntry {
  id: string;
  type: AuditEventType;
  actorId?: string;
  actorDisplayName?: string;
  objectId?: string;
  objectType?: string;
  eventId?: string;
  permission?: string;
  outcome: 'allowed' | 'blocked' | 'granted' | 'denied' | 'recorded';
  reason?: string;
  at: string;
}

/** Redact obvious secret-ish substrings from any free-text reason. */
function scrub(s: string | undefined): string | undefined {
  if (!s) return s;
  return s
    .replace(/\b[A-Za-z0-9_-]{24,}\b/g, '[REDACTED]')           // long tokens/keys
    .replace(/\b\d{6}\b/g, '[REDACTED-OTP]')                    // 6-digit OTPs
    .replace(/(password|secret|token|api[_-]?key)\s*[:=]\s*\S+/gi, '$1=[REDACTED]');
}

class SuperAdminAuditLog {
  private readonly entries: AuditEntry[] = [];
  private readonly cap = 1000;
  private seq = 0;

  record(e: Omit<AuditEntry, 'id' | 'at'>): AuditEntry {
    const entry: AuditEntry = {
      ...e,
      reason: scrub(e.reason),
      id: `audit-${++this.seq}`,
      at: new Date().toISOString(),
    };
    this.entries.push(entry);
    if (this.entries.length > this.cap) this.entries.shift();
    return entry;
  }

  list(filter?: { objectId?: string; type?: AuditEventType }): AuditEntry[] {
    return this.entries.filter(
      (e) =>
        (!filter?.objectId || e.objectId === filter.objectId) &&
        (!filter?.type || e.type === filter.type),
    );
  }

  /** True if any allow/block decision was recorded for this object. */
  hasDecisionFor(objectId: string): boolean {
    return this.entries.some((e) => e.objectId === objectId);
  }
}

export const superAdminAudit = new SuperAdminAuditLog();
