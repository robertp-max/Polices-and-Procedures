/**
 * Anomaly engine — minimal initial rules.
 * ─────────────────────────────────────────────────────────────────────────────
 * Implements a small subset of `Builder/Enterprise/04-User-Activity-Tracking.md`
 * §5: brute-force, PHI bulk access, privilege escalation. Each rule operates
 * over a sliding window of recent events and emits a derived `anomaly.detected.*`
 * audit event when a threshold is crossed. Rules are intentionally simple and
 * configurable — production thresholds are deferred (see §13 of doc 06).
 */
import { appendEvent, queryEvents, type AuditEvent } from './writer.js';

interface RuleContext { now_ms: number; recent: AuditEvent[] }

interface Rule {
  id: string;
  description: string;
  evaluate: (ctx: RuleContext) => Promise<void>;
}

const WINDOW_MS = 60 * 60 * 1000; // 1h sliding window for evaluation

async function emit(severity: 'warning' | 'high' | 'critical', rule_id: string,
    payload: Record<string, unknown>): Promise<void> {
  await appendEvent({
    event_type: 'anomaly.detected',
    stream: 'global',
    actor: { type: 'system', service_id: 'anomaly-engine', display_name: 'anomaly-engine' },
    action: 'audit',
    resource: { type: 'AnomalyDetector', id: rule_id },
    severity,
    payload: { rule_id, ...payload },
  }).catch(() => undefined);
}

const RULES: Rule[] = [
  {
    id: 'brute_force_auth_failures',
    description: '≥10 auth failures within 5 minutes for any actor.',
    evaluate: async (ctx) => {
      const since = ctx.now_ms - 5 * 60 * 1000;
      const failures = ctx.recent.filter(e =>
        e.event_type === 'auth.signin.failure' &&
        new Date(e.occurred_at_utc).getTime() >= since);
      const byActor = new Map<string, number>();
      for (const e of failures) {
        const key = e.actor.user_id ?? e.environment.ip ?? 'unknown';
        byActor.set(key, (byActor.get(key) ?? 0) + 1);
      }
      for (const [key, n] of byActor) {
        if (n >= 10) {
          await emit('high', 'brute_force_auth_failures', { actor_or_ip: key, count: n });
        }
      }
    },
  },
  {
    id: 'phi_bulk_access',
    description: '>100 PHI access events by one actor within 10 minutes.',
    evaluate: async (ctx) => {
      const since = ctx.now_ms - 10 * 60 * 1000;
      const phi = ctx.recent.filter(e =>
        e.phi_flag &&
        new Date(e.occurred_at_utc).getTime() >= since);
      const byActor = new Map<string, number>();
      for (const e of phi) {
        const key = e.actor.user_id ?? 'unknown';
        byActor.set(key, (byActor.get(key) ?? 0) + 1);
      }
      for (const [key, n] of byActor) {
        if (n > 100) {
          await emit('high', 'phi_bulk_access', { actor: key, count: n });
        }
      }
    },
  },
  {
    id: 'privilege_escalation_attempts',
    description: '≥3 deny decisions on approve/override actions in 1 hour.',
    evaluate: async (ctx) => {
      const denials = ctx.recent.filter(e =>
        e.event_type === 'access.decision.deny' &&
        (e.payload.permission === 'OverrideRecord:approve' ||
         (typeof e.payload.permission === 'string' && e.payload.permission.endsWith(':approve'))));
      const byActor = new Map<string, number>();
      for (const e of denials) {
        const key = e.actor.user_id ?? 'unknown';
        byActor.set(key, (byActor.get(key) ?? 0) + 1);
      }
      for (const [key, n] of byActor) {
        if (n >= 3) {
          await emit('critical', 'privilege_escalation_attempts', { actor: key, count: n });
        }
      }
    },
  },
];

/** Run all rules once over the last `WINDOW_MS` of events. */
export async function runAnomalyScan(): Promise<{ rules_run: number; window_ms: number }> {
  const now_ms = Date.now();
  const since = new Date(now_ms - WINDOW_MS).toISOString();
  const recent = await queryEvents({ since, limit: 5000 });
  for (const rule of RULES) {
    await rule.evaluate({ now_ms, recent });
  }
  return { rules_run: RULES.length, window_ms: WINDOW_MS };
}

let timer: NodeJS.Timeout | null = null;
export function startAnomalyScheduler(intervalMs = 60_000): void {
  if (timer) return;
  timer = setInterval(() => { void runAnomalyScan(); }, intervalMs);
  timer.unref?.();
}
export function stopAnomalyScheduler(): void {
  if (timer) { clearInterval(timer); timer = null; }
}
