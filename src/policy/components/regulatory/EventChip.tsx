import { AlertTriangle, Clock, FileWarning, Ban } from 'lucide-react';
import {
  DOMAIN_PALETTE,
  URGENCY_PALETTE,
  type RegulatoryEvent,
  type MandateType,
} from '@/policy/data/regulatoryEvents';

/* Mandate type dot colors — compact dot indicator on the chip */
const MANDATE_DOT: Record<MandateType, string> = {
  'federal-required':    '#EF4444',
  'conditional-federal': '#FBBF24',
  'policy-driven':       '#A78BFA',
  'state-required':      '#F97316',
};

/* ═══════════════════════════════════════════════════════════════
   EventChip — calendar-cell visual for a single regulatory event.
   Communicates domain (color), urgency (chip), missing docs (alert),
   and the core event label / time in a dense but legible way.
   ═══════════════════════════════════════════════════════════════ */

export interface EventChipProps {
  event: RegulatoryEvent;
  onClick?: (e: RegulatoryEvent) => void;
  active?: boolean;
  dense?: boolean;
}

export function EventChip({ event, onClick, active, dense = false }: EventChipProps) {
  const dom = DOMAIN_PALETTE[event.domain];
  const urg = URGENCY_PALETTE[event.urgency];

  const missingDocs = event.requiredForms.filter(f => f.status === 'missing').length;
  const missingMinutes = event.minutes?.status === 'missing';
  const flagged = missingDocs > 0 || missingMinutes;
  const isBlocked = event.urgency === 'blocked';

  const showAlert = event.urgency === 'overdue' || event.urgency === 'critical' || flagged || isBlocked;
  const mandateDotColor = event.mandateType ? MANDATE_DOT[event.mandateType] : null;

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className={`group relative w-full text-left rounded-md overflow-hidden transition-colors duration-200 ${
        dense ? 'px-1.5 py-1' : 'px-2 py-1.5'
      }`}
      style={{
        background: active ? `${dom.color}1A` : dom.soft,
        border: `1px solid ${active ? dom.color : dom.border}`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = dom.color;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = active ? dom.color : dom.border;
      }}
    >
      {/* Domain accent bar */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[2px]"
        style={{ background: dom.color }}
      />

      <div className="flex items-start gap-1.5 pl-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-px">
            <p
              className="font-montserrat font-bold text-white leading-tight truncate flex-1"
              style={{ fontSize: dense ? 10 : 11 }}
              title={event.title}
            >
              {event.title}
            </p>
            {/* Mandate type dot — color-coded per federal/conditional/policy/state */}
            {mandateDotColor && (
              <span
                aria-label={event.mandateType}
                className="shrink-0 rounded-full"
                style={{ width: 5, height: 5, background: mandateDotColor, marginTop: 1 }}
              />
            )}
          </div>
          <p
            className="font-roboto text-white/55 truncate leading-snug"
            style={{ fontSize: dense ? 9 : 10 }}
          >
            {event.allDay || !event.time ? 'All Day' : event.timeEnd ? `${event.time}–${event.timeEnd}` : event.time}
          </p>
        </div>
        {showAlert && (
          <span
            className="shrink-0 flex items-center justify-center rounded-sm"
            style={{
              width: 14, height: 14,
              background: `${urg.color}22`,
              color: urg.color,
            }}
            title={flagged ? 'Missing evidence' : urg.label}
          >
            {flagged ? <FileWarning size={9} strokeWidth={2.5} /> :
              isBlocked ? <Ban size={9} strokeWidth={2.5} /> :
              event.urgency === 'overdue' ? <AlertTriangle size={9} strokeWidth={2.5} /> :
              <Clock size={9} strokeWidth={2.5} />
            }
          </span>
        )}
      </div>
    </button>
  );
}
