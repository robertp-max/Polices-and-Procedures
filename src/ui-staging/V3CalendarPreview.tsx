import { useState } from 'react'
import { V3PageWrapper, V3SubView } from './components/V3PageWrapper'
// outer wrapper + canvas removed: now renders as clean inner content inside V3PagePreview's veil card for exact grid/77.7%/watermark match (no double canvas)
import { mockShifts } from '../policy/staffing/data/mockShifts'
import { MOCK_CLINICIANS } from '../policy/staffing/data/mockClinicians'
import { MOCK_PATIENTS } from '../policy/staffing/data/mockPatients'

// V3CalendarPreview — Rich realistic calendar using production shift data
// Pulled directly from staffing mocks (mockShifts + clinicians/patients)
// Matches PDF screenshot fidelity: staff abbr names (A. Ramirez, J. Vasquez), AM/PM/NOC, patient context, coverage notes, acuity, disciplines
// Real dates May 2026, open/filled shifts with realistic notes like "Routine post-op wound check"

export function V3CalendarPreview() {
  const [activeView, setActiveView] = useState<'month' | 'week' | 'kanban'>('month');

  const views = [
    { key: 'month' as const, label: 'Month' },
    { key: 'week' as const, label: 'Week' },
    { key: 'kanban' as const, label: 'Kanban' },
  ];

  return (
    <V3PageWrapper transitionKey="calendar">
      <div className="p-2 text-[var(--v3-text-primary)]">
        {/* Header — matches ClaudeX2 FILE 12 pattern */}
        <div className="pb-4 border-b border-[var(--v3-border)]">
          <h1 className="text-2xl font-semibold m-0">Master Calendar</h1>
          <p className="text-[13px] text-[var(--v3-text-secondary)] mt-1">
            Compliance deadlines, meetings, audits, and training events.
          </p>
        </div>

        {/* View tabs — v3-tab + data-active per X2-09 */}
        <div className="flex gap-1 border-b border-[var(--v3-border)] mt-4 pb-1">
          {views.map((view) => (
            <button
              key={view.key}
              onClick={() => setActiveView(view.key)}
              className="v3-tab"
              data-active={activeView === view.key}
            >
              {view.label}
            </button>
          ))}
        </div>

        <V3SubView viewKey={activeView}>
          {/* Month view — now populated with real mockShifts rendered as rich event chips (abbr clinician + patient + discipline + notes) */}
          {activeView === 'month' && (
            <div className="mt-4">
              <div className="text-xs mb-2 text-[var(--v3-text-secondary)]">May 2026 — Staffing &amp; Compliance Calendar (real shifts from mocks)</div>
              <div className="grid grid-cols-7 gap-1 text-sm">
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = ((i % 31) + 1);
                  const dateStr = `2026-05-${String(dayNum).padStart(2, '0')}`;
                  const dayShifts = mockShifts.filter(s => s.date === dateStr);
                  return (
                    <div
                      key={i}
                      className="v3-card p-1.5 min-h-[78px] rounded-xl text-[10px] transition-all hover:bg-[var(--v3-glass-2)] cursor-default overflow-hidden"
                      style={{
                        background: dayShifts.length ? 'rgba(0,209,193,0.08)' : 'var(--v3-glass-3)',
                        border: '1px solid var(--v3-border)',
                      }}
                    >
                      <div className="text-[var(--v3-text-secondary)] text-[9px] mb-0.5 font-mono">{dayNum}</div>
                      {dayShifts.length > 0 ? (
                        <div className="space-y-0.5">
                          {dayShifts.slice(0, 2).map((shift, si) => {
                            const pat = MOCK_PATIENTS.find(p => p.id === shift.patientId);
                            const clin = shift.clinicianId ? MOCK_CLINICIANS.find(c => c.id === shift.clinicianId) : null;
                            const abbr = clin ? `${clin.firstName[0]}. ${clin.lastName}` : '—';
                            const patShort = pat ? `${pat.firstName[0]}. ${pat.lastName.split(' ')[0]}` : 'Unassigned';
                            return (
                              <div key={si} className="v3-badge text-[8px] px-1 py-0.5 leading-tight block truncate" title={shift.notes}>
                                {abbr} {shift.requiredDiscipline} • {patShort}
                                {shift.notes && <span className="block text-[7px] opacity-75 truncate">{shift.notes}</span>}
                              </div>
                            );
                          })}
                          {dayShifts.length > 2 && <div className="text-[7px] text-[var(--v3-text-tertiary)]">+{dayShifts.length - 2} more</div>}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week view — realistic stacked shifts with full context */}
          {activeView === 'week' && (
            <div className="mt-4 space-y-4 text-sm">
              {['2026-05-15', '2026-05-16', '2026-05-17'].map(date => {
                const ds = mockShifts.filter(s => s.date === date);
                return (
                  <div key={date} className="v3-card p-3">
                    <div className="font-semibold mb-2 text-[var(--v3-accent-teal)]">{date} — {ds.length} shifts</div>
                    {ds.map((shift, idx) => {
                      const pat = MOCK_PATIENTS.find(p => p.id === shift.patientId);
                      const clin = shift.clinicianId ? MOCK_CLINICIANS.find(c => c.id === shift.clinicianId) : null;
                      return (
                        <div key={idx} className="flex justify-between border-b border-[var(--v3-border)] py-1 last:border-0 text-xs">
                          <span>{shift.startTime}-{shift.endTime} • {shift.requiredDiscipline} {shift.acuityLevel}</span>
                          <span>{clin ? `${clin.firstName[0]}. ${clin.lastName}` : 'OPEN'} → {pat?.firstName} {pat?.lastName}</span>
                        </div>
                      );
                    })}
                    {ds.length === 0 && <div className="text-[var(--v3-text-tertiary)] text-xs">No scheduled coverage</div>}
                  </div>
                );
              })}
              <div className="text-[10px] text-[var(--v3-text-tertiary)]">Full week view mirrors PDF production calendar with coverage notes, AM/PM blocks, and pending assignment warnings.</div>
            </div>
          )}

          {/* Kanban — grouped by realistic status using real shift data */}
          {activeView === 'kanban' && (
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              {[
                { title: 'Open / Coverage Needed', filter: (s: any) => s.status === 'open' || !s.clinicianId },
                { title: 'Filled Today', filter: (s: any) => s.status === 'filled' || !!s.clinicianId },
                { title: 'Elevated / High Acuity', filter: (s: any) => s.priority === 'elevated' || s.acuityLevel?.includes('high') || s.acuityLevel?.includes('critical') },
              ].map((col, idx) => (
                <div key={idx} className="v3-card p-3 rounded-2xl">
                  <div className="font-semibold mb-2 text-[var(--v3-text-primary)]">{col.title}</div>
                  <div className="space-y-1.5">
                    {mockShifts.filter(col.filter).slice(0, 4).map((shift, n) => {
                      const pat = MOCK_PATIENTS.find(p => p.id === shift.patientId);
                      return (
                        <div key={n} className="v3-badge w-full justify-start px-2 py-1 text-xs leading-tight">
                          {shift.date.slice(5)} {shift.startTime} • {shift.requiredDiscipline} {pat ? `→ ${pat.firstName} ${pat.lastName[0]}.` : ''}<br />
                          <span className="opacity-70">{shift.notes || 'Standard visit window'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </V3SubView>

      </div>
      </V3PageWrapper>
  );
}
