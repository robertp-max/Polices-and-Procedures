import { Link } from 'react-router-dom';
import type { Shift } from '../types-calendar';
import { DisciplineBadge } from './DisciplineBadge';
import { ShiftStatusChip } from './ShiftStatusChip';
import { AcuityBadge } from './AcuityBadge';
import { usePatientStore } from '../stores/patientStore';
import { useClinicianStore } from '../stores/clinicianStore';
import type { Discipline } from '../types';

// ── pure-JS date helpers ──────────────────────────────────────────────────────
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeekMonday(d: Date): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = out.getDay();
  const diff = dow === 0 ? -6 : 1 - dow; // Sunday → back 6; else → back to Mon
  out.setDate(out.getDate() + diff);
  return out;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  out.setDate(out.getDate() + n);
  return out;
}

const DOW_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ── priority indicator ────────────────────────────────────────────────────────
function PriorityDot({ priority }: { priority: NonNullable<Shift['priority']> }) {
  if (priority === 'standard') return null;
  const color = priority === 'urgent' ? '#b91c1c' : '#b45309';
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ background: color }}
      title={priority}
      aria-label={priority}
    />
  );
}

// ── single shift item inside a day column ─────────────────────────────────────
function WeekShiftItem({ shift }: { shift: Shift }) {
  const patient = usePatientStore.getState().getPatientById(shift.patientId);
  const clinician = shift.clinicianId
    ? useClinicianStore.getState().getClinicianById(shift.clinicianId)
    : null;

  return (
    <div
      className="rounded p-1.5 flex flex-col gap-1 text-xs"
      style={{
        background: 'var(--ci-surface)',
        border: '1px solid var(--ci-border)',
      }}
    >
      {/* time + discipline + status + priority */}
      <div className="flex flex-wrap items-center gap-1">
        {shift.priority && shift.priority !== 'standard' && (
          <PriorityDot priority={shift.priority} />
        )}
        <span className="font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--ci-text-primary)' }}>
          {shift.startTime}–{shift.endTime}
        </span>
        <DisciplineBadge discipline={shift.requiredDiscipline as Discipline} />
        <ShiftStatusChip status={shift.status} />
        {shift.acuityLevel && <AcuityBadge level={shift.acuityLevel} />}
      </div>

      {/* patient */}
      <div style={{ color: 'var(--ci-text-muted-2)' }}>
        {patient ? (
          <Link
            to={`/patients/${shift.patientId}`}
            className="hover:underline font-medium"
            style={{ color: 'var(--ci-link)' }}
          >
            {patient.firstName} {patient.lastName}
          </Link>
        ) : (
          <span>Unknown Patient</span>
        )}
      </div>

      {/* clinician */}
      <div style={{ color: 'var(--ci-text-muted-2)' }}>
        {shift.status === 'filled' && clinician ? (
          <Link
            to={`/clinicians/${shift.clinicianId}`}
            className="hover:underline"
            style={{ color: 'var(--ci-link)' }}
          >
            {clinician.firstName} {clinician.lastName}
          </Link>
        ) : (
          <span className="italic">Open Shift</span>
        )}
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export interface WeekCalendarViewProps {
  shifts: Shift[];
  anchorDate: Date;
}

export function WeekCalendarView({ shifts, anchorDate }: WeekCalendarViewProps) {
  const weekStart = startOfWeekMonday(anchorDate);
  const todayISO = toISODate(new Date());

  // Build the 7 days and group shifts by ISO date
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const byDate = new Map<string, Shift[]>();
  for (const shift of shifts) {
    const list = byDate.get(shift.date) ?? [];
    list.push(shift);
    byDate.set(shift.date, list);
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[700px]" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '1px', background: 'var(--ci-border)' }}>
        {/* column headers */}
        {days.map((day, i) => {
          const iso = toISODate(day);
          const isToday = iso === todayISO;
          return (
            <div
              key={iso}
              className="px-2 py-1.5 text-xs font-semibold text-center"
              style={{
                background: isToday ? 'rgba(79,70,229,0.1)' : 'var(--ci-surface-muted)',
                color: isToday ? '#4338ca' : 'var(--ci-text-muted-2)',
                borderBottom: isToday ? '2px solid #4f46e5' : '2px solid transparent',
                letterSpacing: '0.04em',
              }}
            >
              {DOW_SHORT[i]} {day.getDate()}
            </div>
          );
        })}

        {/* day columns */}
        {days.map((day) => {
          const iso = toISODate(day);
          const dayShifts = byDate.get(iso) ?? [];
          const isToday = iso === todayISO;
          return (
            <div
              key={iso}
              className="flex flex-col gap-1 p-1.5 min-h-[160px]"
              style={{
                background: isToday ? 'rgba(79,70,229,0.04)' : 'var(--ci-bg)',
              }}
            >
              {dayShifts.length === 0 ? (
                <span
                  className="text-xs italic m-auto"
                  style={{ color: 'var(--ci-text-muted-2)', opacity: 0.5 }}
                >
                  No shifts
                </span>
              ) : (
                dayShifts
                  .slice()
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((s) => <WeekShiftItem key={s.id} shift={s} />)
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
