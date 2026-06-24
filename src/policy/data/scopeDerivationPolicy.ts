import type { RegulatoryEvent, EventScopeType } from './regulatoryEvents';

/* ═══════════════════════════════════════════════════════════════════════════
   Scope derivation
   ----------------------------------------------------------------------------
   Every mandatory event must explicitly state the period it covers. Scope is a
   deterministic function of cadence + the event's (Tue/Thu-aligned) date — it is
   derived, not invented:
     • Monthly      → previous calendar month
     • Quarterly    → previous calendar quarter
     • Semiannual   → previous six months
     • Annual       → previous calendar year (retrospective) OR next year
                       (planning/budget events, detected by title keywords)
     • Biennial     → prior 2-year cycle
     • Triennial    → prior 3-year cycle
     • Weekly/Biweekly → previous week

   Only sets scopeLabel/scopeType when the event does not already declare one, so
   hand-authored scopes are preserved.
   ═══════════════════════════════════════════════════════════════════════════ */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function isPlanning(ev: RegulatoryEvent): boolean {
  return /budget|plan\b|planning|forecast|next year|upcoming year/i.test(`${ev.eventSubType ?? ''} ${ev.title}`);
}

export function deriveScope(event: RegulatoryEvent): RegulatoryEvent {
  if (event.scopeLabel) return event; // preserve hand-authored scope
  if (event.domain === 'Holiday' || event.cadence === 'Holiday' || event.isContext) return event;

  const d = new Date(event.date + 'T00:00:00');
  const y = d.getFullYear();
  const m = d.getMonth(); // 0-11

  let scopeLabel: string | undefined;
  let scopeType: EventScopeType | undefined;

  switch (event.cadence) {
    case 'Monthly': {
      const pm = (m + 11) % 12;
      const py = m === 0 ? y - 1 : y;
      scopeLabel = `Previous calendar month (${MONTHS[pm]} ${py})`;
      scopeType = 'previous_calendar_month';
      break;
    }
    case 'Weekly':
    case 'Biweekly': {
      scopeLabel = `Previous ${event.cadence === 'Biweekly' ? 'two weeks' : 'week'} ending ${event.date}`;
      scopeType = 'rolling_since_last_event';
      break;
    }
    case 'Quarterly': {
      const q = Math.floor(m / 3) + 1;       // quarter the event sits in
      const reviewQ = q === 1 ? 4 : q - 1;   // reviews the prior quarter
      const reviewY = q === 1 ? y - 1 : y;
      scopeLabel = `Previous calendar quarter (Q${reviewQ} ${reviewY})`;
      scopeType = 'previous_calendar_quarter';
      break;
    }
    case 'Semiannual': {
      scopeLabel = `Previous six months (ending ${MONTHS[m]} ${y})`;
      scopeType = 'custom';
      break;
    }
    case 'Annual': {
      if (isPlanning(event)) {
        scopeLabel = `Planning scope: ${y + 1} (prepared ${MONTHS[m]} ${y})`;
      } else {
        scopeLabel = `Annual retrospective: calendar year ${y - 1}`;
      }
      scopeType = 'custom';
      break;
    }
    case 'Biennial': {
      scopeLabel = `Prior 2-year cycle (through ${y})`;
      scopeType = 'custom';
      break;
    }
    case 'Triennial': {
      scopeLabel = `Prior 3-year cycle (through ${y})`;
      scopeType = 'custom';
      break;
    }
    default:
      return event; // Trigger-based / Ad-hoc → no fixed retrospective scope
  }

  return { ...event, scopeLabel, scopeType: event.scopeType ?? scopeType };
}
