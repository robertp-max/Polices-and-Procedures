import { CheckCircle2, Lock, Clock, AlertTriangle, XCircle } from 'lucide-react';

export type ChipKind = 'locked' | 'available' | 'in-progress' | 'passed' | 'failed' | 'warn';

export function StatusChip({ kind, label }: { kind: ChipKind; label?: string }) {
  const cfg = {
    locked:       { color: 'var(--ci-text-muted)', bg: 'rgba(163,163,163,0.10)', icon: <Lock size={12} />,         txt: 'Locked' },
    available:    { color: 'var(--ci-gold)', bg: 'rgba(var(--ci-accent-rgb),0.10)',   icon: <Clock size={12} />,        txt: 'Available' },
    'in-progress':{ color: 'var(--ci-info-fg)', bg: 'rgba(96,165,250,0.10)',  icon: <Clock size={12} />,        txt: 'In Progress' },
    passed:       { color: 'var(--ci-success-fg)', bg: 'rgba(52,211,153,0.10)',  icon: <CheckCircle2 size={12} />, txt: 'Passed' },
    failed:       { color: 'var(--ci-danger-fg)', bg: 'rgba(220,38,38,0.10)',   icon: <XCircle size={12} />,      txt: 'Failed' },
    warn:         { color: 'var(--ci-primary-500)', bg: 'rgba(255,142,82,0.10)',  icon: <AlertTriangle size={12} />,txt: 'Warning' },
  }[kind];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest font-montserrat"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
      {cfg.icon}
      {label ?? cfg.txt}
    </span>
  );
}
