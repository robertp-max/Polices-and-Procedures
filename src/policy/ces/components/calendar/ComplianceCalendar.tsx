/* ═══════════════════════════════════════════════════════════════
   ComplianceCalendar — 14-day compliance view with anchored events,
   signature windows, recurring markers, retrospective.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo } from 'react';
import { Repeat, RotateCcw, PenLine, Anchor } from 'lucide-react';
import { CES_TOKENS } from '../../theme';
import { useComplianceExecution } from '@/policy/compliance-execution';
import { usePmViewSprintStore } from '@/policy/pm/pmViewSprintStore';
import {
  type ComplianceDomain, type ComplianceEvent, type ExecutionUnit,
  COMPLIANCE_DOMAIN_LABEL,
} from '../../types';
import { CesCard, UserAvatar } from '../primitives';

const DAY_MS = 24 * 60 * 60 * 1000;

const DOMAIN_TONE: Record<ComplianceDomain, { bg: string; fg: string }> = {
  clinical:   { bg: '#E8F1FF', fg: CES_TOKENS.navy },
  compliance: { bg: CES_TOKENS.orangeSoft, fg: CES_TOKENS.orange },
  hr:         { bg: CES_TOKENS.greenSoft,  fg: CES_TOKENS.green },
  governance: { bg: CES_TOKENS.amberSoft,  fg: CES_TOKENS.amber },
};

function startOfDay(d: Date) { d.setHours(0,0,0,0); return d; }

function buildDays(startISO: string): Date[] {
  const start = startOfDay(new Date(startISO));
  return Array.from({ length: 14 }, (_, i) => new Date(start.getTime() + i * DAY_MS));
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function ComplianceCalendar() {
  const sprintWindow = usePmViewSprintStore(s => s.window);
  const snap = useComplianceExecution({ mode: 'sprint', window: sprintWindow });
  const EVENTS          = snap.events;
  const EXECUTION_UNITS = snap.executionUnits;

  const days = useMemo(() => buildDays(sprintWindow.startDate), [sprintWindow.startDate]);
  const sprintEnd = useMemo(() => startOfDay(new Date(sprintWindow.endDate)), [sprintWindow.endDate]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, ComplianceEvent[]>();
    EVENTS.forEach(ev => {
      const k = ev.anchorDate.slice(0, 10);
      const arr = map.get(k) ?? [];
      arr.push(ev);
      map.set(k, arr);
    });
    return map;
  }, [EVENTS]);

  const sigWindowsByDay = useMemo(() => {
    const map = new Map<string, ExecutionUnit[]>();
    EXECUTION_UNITS
      .filter(u => u.complianceState === 'awaiting_signature')
      .forEach(u => {
        const k = u.dueDate.slice(0, 10);
        const arr = map.get(k) ?? [];
        arr.push(u);
        map.set(k, arr);
      });
    return map;
  }, [EXECUTION_UNITS]);

  const recurringByDay = useMemo(() => {
    const map = new Map<string, ComplianceEvent[]>();
    EVENTS.filter(e => e.category === 'recurring' || e.category === 'mandated').forEach(ev => {
      const k = ev.anchorDate.slice(0, 10);
      const arr = map.get(k) ?? [];
      arr.push(ev);
      map.set(k, arr);
    });
    return map;
  }, [EVENTS]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold" style={{ color: CES_TOKENS.navy }}>
          Compliance Calendar
        </h1>
        <p className="text-[13px] mt-1" style={{ color: CES_TOKENS.muted }}>
          14-day sprint window. Events anchor to mandated dates; signature windows surface SLA pressure; the retrospective day closes the cycle.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[11px]" style={{ color: CES_TOKENS.muted }}>
        <Legend swatch={CES_TOKENS.navy}    label="Event Anchor" icon={<Anchor size={10} />} />
        <Legend swatch={CES_TOKENS.orange}  label="Signature Window" icon={<PenLine size={10} />} />
        <Legend swatch={CES_TOKENS.amber}   label="Recurring" icon={<Repeat size={10} />} />
        <Legend swatch={CES_TOKENS.red}     label="Retrospective" icon={<RotateCcw size={10} />} />
      </div>

      <CesCard padding={false}>
        {/* Weekday header */}
        <div
          className="grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-[0.14em] py-2"
          style={{ background: CES_TOKENS.canvas, borderBottom: `1px solid ${CES_TOKENS.border}`, color: CES_TOKENS.muted }}
        >
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
        </div>

        {/* 14-day grid (2 rows x 7 cols, Mon-aligned) */}
        <div className="grid grid-cols-7" style={{ gridAutoRows: 'minmax(140px, auto)' }}>
          {days.map((day, idx) => {
            const k         = day.toISOString().slice(0, 10);
            const evs       = eventsByDay.get(k) ?? [];
            const sigs      = sigWindowsByDay.get(k) ?? [];
            const recurring = recurringByDay.get(k) ?? [];
            const isRetro   = sameDay(day, sprintEnd);
            const isWkEnd   = day.getDay() === 0 || day.getDay() === 6;
            return (
              <CalendarDay
                key={k}
                day={day}
                index={idx}
                events={evs}
                sigUnits={sigs}
                hasRecurring={recurring.length > 0}
                isRetro={isRetro}
                isWeekend={isWkEnd}
              />
            );
          })}
        </div>
      </CesCard>
    </div>
  );
}

/* ── Legend chip ─────────────────────────────────────────── */
function Legend({ swatch, label, icon }: { swatch: string; label: string; icon: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md"
      style={{ background: CES_TOKENS.white, border: `1px solid ${CES_TOKENS.border}` }}
    >
      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: swatch }} />
      <span style={{ color: swatch }}>{icon}</span>
      <span style={{ color: CES_TOKENS.ink }}>{label}</span>
    </span>
  );
}

/* ── CalendarDay ─────────────────────────────────────────── */
function CalendarDay({
  day, index, events, sigUnits, hasRecurring, isRetro, isWeekend,
}: {
  day: Date; index: number;
  events: ComplianceEvent[]; sigUnits: ExecutionUnit[];
  hasRecurring: boolean; isRetro: boolean; isWeekend: boolean;
}) {
  const hasSig = sigUnits.length > 0;
  const dayBg =
    isRetro ? '#FBF1F0' :
    hasSig  ? '#FFF8F4' :
    isWeekend ? CES_TOKENS.canvas :
    CES_TOKENS.white;

  return (
    <div
      className="relative p-2 flex flex-col gap-1"
      style={{
        background: dayBg,
        borderRight:  index % 7 !== 6 ? `1px solid ${CES_TOKENS.border}` : 'none',
        borderBottom: index < 7        ? `1px solid ${CES_TOKENS.border}` : 'none',
      }}
    >
      {/* Day number */}
      <div className="flex items-center justify-between">
        <span
          className="text-[12px] font-bold"
          style={{ color: isRetro ? CES_TOKENS.red : CES_TOKENS.navy }}
        >
          {day.getDate()}
        </span>
        <div className="flex items-center gap-1">
          {hasRecurring && <Repeat size={11} style={{ color: CES_TOKENS.amber }} />}
          {isRetro      && <RotateCcw size={11} style={{ color: CES_TOKENS.red }} />}
        </div>
      </div>

      {/* Event anchor markers */}
      {events.map(ev => (
        <EventAnchorMarker key={ev.id} event={ev} />
      ))}

      {/* Signature window block */}
      {hasSig && <SignatureWindowBlock units={sigUnits} />}

      {/* Retrospective banner */}
      {isRetro && (
        <div
          className="mt-auto text-[10px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
          style={{ background: CES_TOKENS.redSoft, color: CES_TOKENS.red }}
        >
          Sprint Retrospective
        </div>
      )}
    </div>
  );
}

/* ── EventAnchorMarker ───────────────────────────────────── */
function EventAnchorMarker({ event }: { event: ComplianceEvent }) {
  const tone = DOMAIN_TONE[event.domain];
  return (
    <div
      className="text-[10.5px] font-semibold rounded px-1.5 py-1 leading-tight"
      style={{ background: tone.bg, color: tone.fg, borderLeft: `3px solid ${tone.fg}` }}
      title={`${COMPLIANCE_DOMAIN_LABEL[event.domain]} · ${event.title}`}
    >
      {event.title}
    </div>
  );
}

/* ── SignatureWindowBlock ────────────────────────────────── */
function SignatureWindowBlock({ units }: { units: ExecutionUnit[] }) {
  return (
    <div
      className="rounded-md px-1.5 py-1 text-[10px]"
      style={{ background: CES_TOKENS.orangeSoft, border: `1px dashed ${CES_TOKENS.orange}88`, color: CES_TOKENS.orange }}
    >
      <div className="flex items-center gap-1 font-bold uppercase tracking-[0.12em]">
        <PenLine size={9} /> Signature Due
      </div>
      <div className="flex items-center gap-1 mt-1">
        {units.slice(0, 3).map(u => (
          <span key={u.id} title={u.title}><UserAvatar initials={u.signatureOwner.initials} size={16} /></span>
        ))}
        {units.length > 3 && (
          <span style={{ color: CES_TOKENS.muted }}>+{units.length - 3}</span>
        )}
      </div>
    </div>
  );
}
