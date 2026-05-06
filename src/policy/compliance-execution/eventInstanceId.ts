import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';

const EVT_PREFIX = 'EVT';

const DOMAIN_CODE: Record<string, string> = {
  QAPI: 'QA',
  Governance: 'GV',
  Risk: 'RM',
  Clinical: 'CL',
  Finance: 'FN',
  Operations: 'OP',
  Compliance: 'CO',
  'IT/Security': 'IT',
  Holiday: 'CTX',
};

const normalizeDate = (date: string): string => date.replace(/-/g, '');
const normalizeCode = (value: string, fallback: string): string =>
  (value || fallback).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12) || fallback;

const toSeq = (n: number): string => String(Math.max(1, n)).padStart(3, '0');

export interface EventInstanceSeed {
  sourceEventId: string;
  domain: string;
  category: string;
  date: string;
}

export function parseSequenceFromLegacyId(id: string): number | null {
  const match = id.match(/-(\d{2,3})$/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function composeEventInstanceId(seed: EventInstanceSeed, sequence: number): string {
  const domain = normalizeCode(DOMAIN_CODE[seed.domain] ?? seed.domain, 'GEN');
  const category = normalizeCode(seed.category, 'GENERAL');
  const yyyymmdd = normalizeDate(seed.date);
  return `${EVT_PREFIX}-${domain}-${category}-${yyyymmdd}-${toSeq(sequence)}`;
}

export function seedFromRegulatoryEvent(event: RegulatoryEvent): EventInstanceSeed {
  return {
    sourceEventId: event.id,
    domain: event.domain,
    category: event.category ?? event.eventSubType ?? event.title,
    date: event.date,
  };
}

export function buildEventInstanceIndex(events: RegulatoryEvent[]): {
  bySourceEventId: Record<string, string>;
  nextSequenceFor: (domain: string, category: string, date: string) => number;
} {
  const bySourceEventId: Record<string, string> = {};
  const counters: Record<string, number> = {};

  const sorted = [...events].sort((a, b) =>
    `${a.date}-${a.id}`.localeCompare(`${b.date}-${b.id}`),
  );

  for (const event of sorted) {
    const seed = seedFromRegulatoryEvent(event);
    const counterKey = `${seed.domain}|${seed.category}|${seed.date}`;
    const seededSeq = parseSequenceFromLegacyId(event.id);
    const seq = seededSeq ?? (counters[counterKey] ?? 0) + 1;
    counters[counterKey] = Math.max(counters[counterKey] ?? 0, seq);
    bySourceEventId[event.id] = composeEventInstanceId(seed, seq);
  }

  return {
    bySourceEventId,
    nextSequenceFor: (domain, category, date) => {
      const key = `${domain}|${category}|${date}`;
      const next = (counters[key] ?? 0) + 1;
      counters[key] = next;
      return next;
    },
  };
}
