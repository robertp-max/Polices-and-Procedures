/**
 * PmFilterBar — shared facet filter for PM views.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-SVAR-Component-Strategy.md §3.4
 *       Builder/Compliance-Execution-Sprints/PM-Reporting-and-Workload.md §3
 *
 * Native implementation (no SVAR dependency). Filter state is plain object;
 * caller controls persistence (URL param or local state).
 */

import { useMemo, type ReactElement } from 'react';
import type { PmTaskStatus, Task, TaskSource } from '@/policy/pm/types';
import { useShellStore } from '@/policy/stores/uiStore';

export interface PmFilterState {
  q?: string;                   // free-text title search
  statuses?: PmTaskStatus[];
  sources?: TaskSource[];
  assignees?: string[];
  sprintIds?: string[];
  eventIds?: string[];
  labels?: string[];
  dueWindow?: 'overdue' | 'today' | 'this_week' | 'this_sprint' | 'all';
}

export interface PmFilterBarProps {
  value: PmFilterState;
  onChange: (next: PmFilterState) => void;
  /** Tasks the bar can derive option lists from. */
  tasks: Task[];
}

/* ─── Pure filter applicator (used by callers) ─────────────────────── */
export function applyPmFilter(tasks: Task[], f: PmFilterState): Task[] {
  return tasks.filter(t => {
    if (f.q && !t.title.toLowerCase().includes(f.q.toLowerCase())) return false;
    if (f.statuses && f.statuses.length && !f.statuses.includes(t.status)) return false;
    if (f.sources && f.sources.length && !f.sources.includes(t.source)) return false;
    if (f.assignees && f.assignees.length) {
      const a = (t as { assigned_user_id?: string }).assigned_user_id;
      if (!a || !f.assignees.includes(a)) return false;
    }
    if (f.sprintIds && f.sprintIds.length) {
      const s = t.sprint_id;
      if (!s || !f.sprintIds.includes(s)) return false;
    }
    if (f.eventIds && f.eventIds.length) {
      const e = (t as { event_id?: string }).event_id;
      if (!e || !f.eventIds.includes(e)) return false;
    }
    if (f.dueWindow && f.dueWindow !== 'all') {
      if (!t.due_date) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(t.due_date + (t.due_date.length === 10 ? 'T00:00:00' : ''));
      const days = Math.round((due.getTime() - today.getTime()) / 86400000);
      if (f.dueWindow === 'overdue' && days >= 0) return false;
      if (f.dueWindow === 'today' && days !== 0) return false;
      if (f.dueWindow === 'this_week' && (days < 0 || days > 7)) return false;
      if (f.dueWindow === 'this_sprint' && (days < 0 || days > 14)) return false;
    }
    return true;
  });
}

const ALL_STATUSES: PmTaskStatus[] = ['todo', 'in_progress', 'in_review', 'blocked', 'done'];
const ALL_SOURCES: TaskSource[] = ['ces', 'personal'];

export function PmFilterBar({ value, onChange, tasks }: PmFilterBarProps): ReactElement {
  const theme = useShellStore(s => s.theme);
  const isLight = theme === 'care-indeed-light';
  const sprintOptions = useMemo(
    () => Array.from(new Set(tasks.map(t => t.sprint_id).filter(Boolean) as string[])).sort(),
    [tasks],
  );
  const eventOptions = useMemo(
    () =>
      Array.from(
        new Set(
          tasks
            .map(t => (t as { event_id?: string }).event_id)
            .filter(Boolean) as string[],
        ),
      ).sort(),
    [tasks],
  );

  const toggle = <K extends keyof PmFilterState>(key: K, item: string) => {
    const cur = ((value[key] ?? []) as unknown as string[]) || [];
    const next = cur.includes(item) ? cur.filter(x => x !== item) : [...cur, item];
    onChange({ ...value, [key]: next as PmFilterState[K] });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg px-3 py-2" style={{ border: 'none', background: isLight ? 'var(--ci-surface-muted)' : 'rgba(255,255,255,0.02)' }}>
      <input
        type="search"
        placeholder="Search tasks…"
        value={value.q ?? ''}
        onChange={e => onChange({ ...value, q: e.target.value })}
        className="text-[12px] font-outfit rounded-md px-2 py-1 outline-none min-w-[160px]"
        style={{ background: isLight ? 'var(--ci-surface-2)' : 'rgba(255,255,255,0.05)', color: isLight ? 'var(--ci-text)' : 'white', border: isLight ? '1px solid var(--ci-border)' : 'none' }}
      />

      <FacetGroup label="Status" isLight={isLight}>
        {ALL_STATUSES.map(s => (
          <Chip
            key={s}
            active={value.statuses?.includes(s) ?? false}
            onClick={() => toggle('statuses', s)}
            isLight={isLight}
          >
            {s.replace('_', ' ')}
          </Chip>
        ))}
      </FacetGroup>

      <FacetGroup label="Source" isLight={isLight}>
        {ALL_SOURCES.map(s => (
          <Chip
            key={s}
            active={value.sources?.includes(s) ?? false}
            onClick={() => toggle('sources', s)}
            isLight={isLight}
          >
            {s}
          </Chip>
        ))}
      </FacetGroup>

      {sprintOptions.length > 0 && (
        <FacetGroup label="Sprint" isLight={isLight}>
          {sprintOptions.slice(0, 6).map(s => (
            <Chip
              key={s}
              active={value.sprintIds?.includes(s) ?? false}
              onClick={() => toggle('sprintIds', s)}
              isLight={isLight}
            >
              {s}
            </Chip>
          ))}
        </FacetGroup>
      )}

      {eventOptions.length > 0 && (
        <FacetGroup label="Event" isLight={isLight}>
          {eventOptions.slice(0, 5).map(e => (
            <Chip
              key={e}
              active={value.eventIds?.includes(e) ?? false}
              onClick={() => toggle('eventIds', e)}
              isLight={isLight}
            >
              {e}
            </Chip>
          ))}
        </FacetGroup>
      )}

      <FacetGroup label="Due" isLight={isLight}>
        {(['overdue', 'today', 'this_week', 'this_sprint', 'all'] as const).map(w => (
          <Chip
            key={w}
            active={(value.dueWindow ?? 'all') === w}
            onClick={() => onChange({ ...value, dueWindow: w })}
            isLight={isLight}
          >
            {w.replace('_', ' ')}
          </Chip>
        ))}
      </FacetGroup>

      {(value.q ||
        value.statuses?.length ||
        value.sources?.length ||
        value.sprintIds?.length ||
        value.eventIds?.length ||
        (value.dueWindow && value.dueWindow !== 'all')) && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="ml-auto text-[10px] uppercase tracking-[0.18em]"
          style={{ color: isLight ? 'var(--ci-text-muted)' : 'rgba(255,255,255,0.55)' }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

function FacetGroup({ label, children, isLight }: { label: string; children: React.ReactNode; isLight: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-montserrat font-bold uppercase tracking-[0.22em]" style={{ color: isLight ? 'var(--ci-text-muted)' : 'rgba(255,255,255,0.45)' }}>
        {label}
      </span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  isLight,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isLight: boolean;
}) {
  // Match ces-filter-pill style: rounded-full, no borders in active, teal/orange-ish fills in light, purged dark fallbacks.
  const chipStyle: React.CSSProperties = active
    ? { background: isLight ? 'rgba(0,121,112,0.12)' : 'rgba(0,209,193,0.25)', color: isLight ? '#007970' : '#5EEAD4', border: 'none' }
    : { background: isLight ? 'var(--ci-surface-2)' : 'rgba(255,255,255,0.05)', color: isLight ? 'var(--ci-text-muted)' : 'rgba(255,255,255,0.55)', border: 'none' };
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[10px] font-mono px-1.5 py-0.5 rounded-full transition-colors"
      style={chipStyle}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = isLight ? 'var(--ci-overlay-faint)' : 'rgba(255,255,255,0.1)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = isLight ? 'var(--ci-surface-2)' : 'rgba(255,255,255,0.05)'; }}
    >
      {children}
    </button>
  );
}
