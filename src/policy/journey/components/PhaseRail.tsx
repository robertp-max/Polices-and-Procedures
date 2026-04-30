import { ShieldAlert, ClipboardCheck, UserCheck, Users, Award, RotateCw, Siren } from 'lucide-react';
import type { JourneyProgress } from '@/policy/journey/types/journey';

interface Props {
  progress: JourneyProgress;
  active: 'PRE_DAY_1' | 'GAO' | 'ROLE' | 'SUPERVISED' | 'CLEARED' | 'ANN' | 'DRILL';
  onSelect: (phase: Props['active']) => void;
}

const PHASES: { id: Props['active']; label: string; icon: React.ReactNode }[] = [
  { id: 'PRE_DAY_1',  label: 'Pre-Day-1',       icon: <ShieldAlert size={16} /> },
  { id: 'GAO',        label: 'Core Journey',    icon: <ClipboardCheck size={16} /> },
  { id: 'ROLE',       label: 'Clinical Role',   icon: <UserCheck size={16} /> },
  { id: 'SUPERVISED', label: 'Supervised',      icon: <Users size={16} /> },
  { id: 'CLEARED',    label: 'Cleared',         icon: <Award size={16} /> },
  { id: 'ANN',        label: 'Annual and Recurrent', icon: <RotateCw size={16} /> },
  { id: 'DRILL',      label: 'Drills',          icon: <Siren size={16} /> },
];

export function PhaseRail({ progress, active, onSelect }: Props) {
  const pct = (id: Props['active']): number => {
    switch (id) {
      case 'PRE_DAY_1':  return progress.appendixFCleared ? 1 : 0;
      case 'GAO':        return progress.gaoCompletePct;
      case 'ROLE':       return progress.roleCompletePct;
      case 'SUPERVISED': return progress.supervisedVisitsRequired ? progress.supervisedVisitsCompleted / progress.supervisedVisitsRequired : 0;
      case 'CLEARED':    return progress.clearedForIndependentWork ? 1 : 0;
      case 'ANN':        return progress.annualCompletePct;
      case 'DRILL':      return progress.annualCompletePct; // surfaced inside ANN set
      default:           return 0;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {PHASES.map(p => {
        const p1 = pct(p.id);
        const isActive = active === p.id;
        const done = p1 >= 1;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`glass-interactive group relative flex items-center gap-3 text-left rounded-xl px-4 py-3 border transition-all ${
              isActive ? 'border-[#FFC107]/60 bg-[#FFC107]/5' : 'border-white/10 hover:border-white/25'
            }`}
          >
            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${done ? 'text-[#34D399]' : 'text-[#FFC107]'}`}
                  style={{ background: done ? 'rgba(52,211,153,0.10)' : 'rgba(var(--ci-accent-rgb),0.10)' }}>
              {p.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-montserrat font-bold uppercase tracking-widest text-[10px] text-white/70">{p.label}</div>
              <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all"
                     style={{ width: `${Math.min(100, Math.round(p1 * 100))}%`, background: done ? '#34D399' : 'var(--ci-gold)' }} />
              </div>
              <div className="text-[9px] text-white/40 mt-1">{Math.round(p1 * 100)}%</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
