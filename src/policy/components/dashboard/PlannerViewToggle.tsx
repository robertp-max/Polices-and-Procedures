/**
 * PlannerViewToggle — segmented pill control for switching between
 * Agency View (shared Action Board) and My Planner (user-scoped personal view).
 *
 * Placement: Command Center top chrome, next to Readiness actions.
 * Matches existing glass / rail aesthetic, orange-500 active accent,
 * fully responsive (icon-only on mobile).
 */

import { useShellStore } from '@/policy/stores/uiStore';
import { LayoutDashboard, UserCheck } from 'lucide-react';

export type ViewMode = 'agency' | 'planner';

interface PlannerViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function PlannerViewToggle({ value, onChange, className = '' }: PlannerViewToggleProps) {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');

  const baseShell = isLight
    ? 'bg-slate-100 border-slate-200'
    : 'bg-white/5 border-white/10';

  const inactive = isLight
    ? 'text-slate-600 hover:bg-slate-200'
    : 'text-white/70 hover:bg-white/10';

  const active = isLight
    ? 'bg-orange-500 text-white shadow-sm'
    : 'bg-orange-500 text-white shadow-sm';

  const iconActive = 'text-white';
  const iconInactive = isLight ? 'text-slate-500' : 'text-white/50';

  return (
    <div
      role="tablist"
      aria-label="Command Center view mode"
      className={`inline-flex items-center rounded-full border p-1 ${baseShell} ${className}`}
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'agency'}
        onClick={() => onChange('agency')}
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 ${
          value === 'agency' ? active : inactive
        }`}
      >
        <LayoutDashboard size={16} className={value === 'agency' ? iconActive : iconInactive} aria-hidden />
        <span className="hidden sm:inline">Agency View</span>
        <span className="sm:hidden">Agency</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={value === 'planner'}
        onClick={() => onChange('planner')}
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 ${
          value === 'planner' ? active : inactive
        }`}
      >
        <UserCheck size={16} className={value === 'planner' ? iconActive : iconInactive} aria-hidden />
        <span className="hidden sm:inline">My Planner</span>
        <span className="sm:hidden">Planner</span>
      </button>
    </div>
  );
}
