/**
 * Sprint filter: PM calendar (first Sunday of year, 26 × 14-day sprints).
 * Display id uses colon: 2026:01 — Sprint 1
 */
import { useMemo, type ReactElement } from 'react';
import { TODAY_ANCHOR } from '@/policy/data/regulatoryEvents';
import {
  currentSprint,
  neighbourSprint,
  sprintForDate,
  sprintWindowsForYear,
  sprintDropdownLabel,
} from '@/policy/pm/sprintWindows';
import { usePmViewSprintStore } from '@/policy/pm/pmViewSprintStore';
import { useShellStore } from '@/policy/stores/uiStore';

const YEAR_MIN = 2024;
const YEAR_MAX = 2030;

export function SprintScopeToolbar({ className = '' }: { className?: string }): ReactElement {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const window = usePmViewSprintStore(s => s.window);
  const setWindow = usePmViewSprintStore(s => s.setWindow);

  const windows = useMemo(() => sprintWindowsForYear(window.year), [window.year]);

  const selectYear = (y: number) => {
    const first = sprintWindowsForYear(y)[0];
    setWindow(first);
  };

  const chip = isLight
    ? 'border-slate-200 bg-white text-slate-800'
    : 'border-white/15 bg-white/[0.04] text-white/90';

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-[11px] ${chip} ${className}`}
      style={isLight ? { borderColor: '#e2e8f0' } : { borderColor: 'rgba(255,255,255,0.12)' }}
    >
      <span className="font-montserrat font-bold uppercase tracking-[0.14em] text-teal-600/90">
        Sprint scope
      </span>
      <label className="flex items-center gap-1.5 ci-text-muted">
        <span className="uppercase tracking-[0.1em] text-[9px]">Year</span>
        <select
          className="rounded-md border px-2 py-1 text-[11px] font-outfit outline-none focus:ring-1 focus:ring-teal-500/40"
          style={isLight
            ? { borderColor: '#cbd5e1', background: '#f8fafc', color: '#0f172a' }
            : { borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
          value={window.year}
          onChange={e => selectYear(Number(e.target.value))}
        >
          {Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1.5 min-w-0 flex-1 sm:flex-initial">
        <span className="uppercase tracking-[0.1em] text-[9px] ci-text-muted shrink-0">Sprint</span>
        <select
          className="min-w-0 flex-1 max-w-[min(100%,320px)] rounded-md border px-2 py-1 text-[11px] font-outfit outline-none focus:ring-1 focus:ring-teal-500/40 truncate"
          style={isLight
            ? { borderColor: '#cbd5e1', background: '#f8fafc', color: '#0f172a' }
            : { borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
          value={window.id}
          onChange={e => {
            const w = windows.find(x => x.id === e.target.value);
            if (w) setWindow(w);
          }}
        >
          {windows.map(w => (
            <option key={w.id} value={w.id}>{sprintDropdownLabel(w)}</option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] hover:bg-orange-500/15 hover:border-orange-400/50 transition-colors"
          style={isLight
            ? { borderColor: '#fed7aa', color: '#c2410c' }
            : { borderColor: 'rgba(251,146,60,0.35)', color: '#fdba74' }}
          onClick={() => setWindow(neighbourSprint(window.id, -1))}
        >
          Prev
        </button>
        <button
          type="button"
          className="rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] hover:bg-orange-500/15 hover:border-orange-400/50 transition-colors"
          style={isLight
            ? { borderColor: '#fed7aa', color: '#c2410c' }
            : { borderColor: 'rgba(251,146,60,0.35)', color: '#fdba74' }}
          onClick={() => setWindow(neighbourSprint(window.id, 1))}
        >
          Next
        </button>
        <button
          type="button"
          className="rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] hover:bg-teal-600/15 hover:border-teal-500/40 transition-colors"
          style={isLight
            ? { borderColor: '#99f6e4', color: '#0f766e' }
            : { borderColor: 'rgba(45,212,191,0.35)', color: '#5eead4' }}
          onClick={() => setWindow(currentSprint(TODAY_ANCHOR))}
        >
          Current
        </button>
      </div>
    </div>
  );
}

/** Programmatically align sprint scope to a task's due date (deep links). */
export function alignSprintScopeToTaskDueDate(dueIso?: string | null): void {
  if (!dueIso) return;
  const d = dueIso.slice(0, 10);
  if (!d) return;
  usePmViewSprintStore.getState().setWindow(sprintForDate(d));
}
