import type { RegulatoryEvent } from './regulatoryEvents';

/* ═══════════════════════════════════════════════════════════════════════════
   Tuesday / Thursday scheduling rule
   ----------------------------------------------------------------------------
   Mandatory recurring compliance events are scheduled on Tuesdays and
   Thursdays:
     • Tuesday  → preparation / review / work-up / monthly operational events.
     • Thursday → committee / review / approval / lock / quarterly+annual rollups.

   Exceptions (preserved + documented in `scheduleNote`):
     • Holidays / context markers / 24-7 obligations (isWeekendAllowed).
     • Trigger-based / Ad-hoc / Holiday cadences (no fixed recurring anchor).
     • Externally-fixed timing (survey activation windows, holiday markers).

   Snapping is scope-safe: an event is moved to the NEAREST Tue/Thu within the
   SAME calendar month so its reporting scope (previous month / quarter / year)
   is never altered. Event IDs are NOT changed (downstream dependsOn references
   are ID-based and remain valid); only the `date` is aligned.

   Runs in the REGULATORY_EVENTS pipeline AFTER enforceBusinessDay (so it always
   receives a weekday) and BEFORE alignment/workflow steps.
   ═══════════════════════════════════════════════════════════════════════════ */

const DAY_MS = 86_400_000;
const TUESDAY = 2;
const THURSDAY = 4;
/** Closest-first search offsets (negative first → prefer staying earlier in the period). */
const OFFSETS = [-1, 1, -2, 2, -3, 3, -4, 4];

const toISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = (s: string): Date => new Date(s + 'T00:00:00');

const FIXED_EXCEPTION_CADENCES = new Set(['Holiday', 'Trigger-based', 'Ad-hoc']);
/** eventSubTypes whose timing is externally fixed (statutory / survey window / marker). */
const FIXED_SUBTYPES = new Set(['agency_holiday', 'survey_activation']);

/** Tuesday = prep/review/work-up; Thursday = committee/approval/lock/rollup. */
function classifyWeekday(ev: RegulatoryEvent): typeof TUESDAY | typeof THURSDAY {
  const hay = `${ev.eventSubType ?? ''} ${ev.title}`.toLowerCase();
  const prep = /\bprep\b|work-?\s?up|dashboard|refresh|pre-?meeting|preparation|compile|draft|intake/.test(hay);
  const committee = /committee|governing|board|approval|minutes|\block\b|certif|strategic|packet|attestation|evaluation|sign-?off/.test(hay);
  if (prep) return TUESDAY;
  if (committee) return THURSDAY;
  if (['Quarterly', 'Annual', 'Semiannual', 'Biennial', 'Triennial'].includes(ev.cadence)) return THURSDAY;
  return TUESDAY;
}

export function enforceTuesdayThursday(event: RegulatoryEvent): RegulatoryEvent {
  // ── Exceptions: preserve mandated/fixed/non-recurring timing ──
  if (event.isWeekendAllowed) {
    return { ...event, scheduleNote: '24/7 obligation — fixed timing preserved; Tue/Thu rule not applied.' };
  }
  if (event.isContext || event.domain === 'Holiday' || event.cadence === 'Holiday') {
    return event; // holiday / context marker — leave untouched
  }
  if (FIXED_EXCEPTION_CADENCES.has(event.cadence) || (event.eventSubType && FIXED_SUBTYPES.has(event.eventSubType))) {
    return { ...event, scheduleNote: `Fixed/triggered timing preserved (cadence ${event.cadence}); Tue/Thu rule not applied.` };
  }

  const d = parse(event.date);
  const target = classifyWeekday(event);
  const label = target === THURSDAY ? 'Thursday (committee/approval/rollup)' : 'Tuesday (prep/review)';

  if (d.getDay() === target) {
    return { ...event, scheduleNote: label };
  }

  // Nearest target weekday within the SAME calendar month (scope-safe).
  let snapped: Date | null = null;
  for (const off of OFFSETS) {
    const cand = new Date(d.getTime() + off * DAY_MS);
    if (cand.getDay() === target && cand.getMonth() === d.getMonth()) { snapped = cand; break; }
  }
  // Fallback: allow a month-edge crossing if no in-month slot exists within ±4 days.
  if (!snapped) {
    for (const off of OFFSETS) {
      const cand = new Date(d.getTime() + off * DAY_MS);
      if (cand.getDay() === target) { snapped = cand; break; }
    }
  }
  if (!snapped) {
    return { ...event, scheduleNote: `Tue/Thu rule could not be applied near ${event.date}; left as authored.` };
  }

  return { ...event, date: toISO(snapped), scheduleNote: `Snapped to ${label} from ${event.date}` };
}
