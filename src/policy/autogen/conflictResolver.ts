import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { addDays, toISO } from './scheduler';

/* ═══════════════════════════════════════════════════════════════
   Conflict Resolver
   ----------------------------------------------------------------
   Rules:
   - Two events conflict if they share the same date AND have
     overlapping time windows AND share at least one owner role.
   - Critical domains (GV, CO, QA) cannot be scheduled on the same
     date unless they are already dependency-linked (chained).
   - When a conflict is detected, the generator tries ±flexDays
     to find a clean slot. If none works, the event is skipped.
   ═══════════════════════════════════════════════════════════════ */

const CRITICAL_DOMAINS = new Set(['GV', 'CO', 'QA']);

function minutes(hhmm?: string): number | null {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

function windowsOverlap(
  aStart?: string, aEnd?: string, bStart?: string, bEnd?: string,
): boolean {
  const as = minutes(aStart), ae = minutes(aEnd);
  const bs = minutes(bStart), be = minutes(bEnd);
  // If any side missing, be conservative and treat as all-day overlap.
  if (as == null || bs == null) return true;
  const aEnd2 = ae ?? as + 60;
  const bEnd2 = be ?? bs + 60;
  return as < bEnd2 && bs < aEnd2;
}

export interface ConflictCheckResult {
  conflicts: RegulatoryEvent[];
  reason?: string;
}

export function detectConflict(candidate: RegulatoryEvent, pool: RegulatoryEvent[]): ConflictCheckResult {
  const sameDay = pool.filter(p => p.date === candidate.date && p.id !== candidate.id);
  if (sameDay.length === 0) return { conflicts: [] };

  const hits: RegulatoryEvent[] = [];
  let reason = '';

  for (const other of sameDay) {
    // Critical same-day rule
    if (CRITICAL_DOMAINS.has(candidate.domain) && CRITICAL_DOMAINS.has(other.domain)) {
      const linked =
        candidate.dependencies?.dependsOn?.includes(other.id) ||
        candidate.dependencies?.feeds?.includes(other.id) ||
        other.dependencies?.dependsOn?.includes(candidate.id) ||
        other.dependencies?.feeds?.includes(candidate.id);
      if (!linked) {
        hits.push(other);
        reason = 'Critical domains cannot collide on the same date without an explicit dependency link.';
        continue;
      }
    }

    // Owner role collision with time window overlap
    if (other.ownerRole === candidate.ownerRole &&
        windowsOverlap(candidate.time, candidate.timeEnd, other.time, other.timeEnd)) {
      hits.push(other);
      reason = reason || 'Owner role collision with overlapping time window.';
    }
  }

  return { conflicts: hits, reason };
}

/** Given a candidate and a pool, returns a free date within ±flexDays (or null). */
export function resolveConflict(
  candidate: RegulatoryEvent,
  pool: RegulatoryEvent[],
  flexDays = 3,
): string | null {
  const base = new Date(candidate.date + 'T00:00:00');
  // Try nearest-first: +1, -1, +2, -2 …
  for (let delta = 1; delta <= flexDays; delta++) {
    for (const dir of [1, -1]) {
      const trial = addDays(base, delta * dir);
      const iso = toISO(trial);
      const { conflicts } = detectConflict({ ...candidate, date: iso }, pool);
      if (conflicts.length === 0) return iso;
    }
  }
  return null;
}
