/* ═══════════════════════════════════════════════════════════════
   ExecutionUnit (board card)
   Visible: phase, state, audit readiness, owner, due, signers,
   blocked reason, escalation timer.
   ═══════════════════════════════════════════════════════════════ */

import { Calendar, FileText, AlertCircle } from 'lucide-react';
import type { ExecutionUnit as ExecutionUnitT } from '../../types';
import {
  ComplianceStateBadge, PhaseIndicator, AuditReadinessTag,
  UserAvatar, EscalationTimer,
} from '../primitives';
import { useShellStore } from '@/policy/stores/uiStore';

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  unit:          ExecutionUnitT;
  draggable?:    boolean;
  onClick?:      () => void;
  onDragStart?:  (e: React.DragEvent, unit: ExecutionUnitT) => void;
  onDragEnd?:    () => void;
}

export function ExecutionUnitCard({
  unit, draggable = true, onClick, onDragStart, onDragEnd,
}: Props) {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const isBlocked  = unit.complianceState === 'blocked';
  const isAwaiting = unit.complianceState === 'awaiting_signature';
  const isCompleted = unit.complianceState === 'completed';
  const auditScore = (unit as { auditReadinessScore?: number }).auditReadinessScore;

  // Clean corporate accent colors (match V3, isLight, no raw dark bleed)
  const accent =
    isBlocked   ? (isLight ? '#D70101' : '#fca5a5') :
    isAwaiting  ? 'var(--v3-orange-light)' :
    isCompleted ? (isLight ? '#008540' : '#4ade80') :
                  'var(--v3-teal-light)';

  const baseBorder = isBlocked ? (isLight ? '#F49E9E' : 'rgba(239,68,68,0.3)') : 'var(--v3-border-subtle)';

  return (
    <article
      draggable={draggable && !isCompleted}
      onDragStart={e => onDragStart?.(e, unit)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      data-testid="execution-unit-card"
      data-unit-id={unit.id}
      data-compliance-state={unit.complianceState}
      data-workflow-phase={unit.workflowPhase}
      className="cursor-pointer rounded-xl border select-none transition-all hover:shadow-sm hover:border-[var(--v3-border)] w-full"
      style={{
        background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.01)',
        border: `1px solid ${baseBorder}`,
      }}
    >
      <div className="p-2.5 space-y-1.5">
        {/* Phase + audit — compact clean */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: accent }}
          >
            {unit.workflowPhase.replace(/_/g, ' ')}
          </span>
          {typeof auditScore === 'number' && (
            <span className="text-[9px] font-semibold" style={{ color: 'var(--v3-text-tertiary)' }}>
              Audit {auditScore}%
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-[11.5px] font-semibold leading-tight" style={{ color: 'var(--v3-text-primary)' }}>
          {unit.title}
        </h4>

        {/* Status row — keep primitives for semantics, they now sit on clean card */}
        <div className="flex flex-wrap gap-1 items-center">
          <PhaseIndicator phase={unit.workflowPhase} />
          <ComplianceStateBadge state={unit.complianceState} compact />
          <AuditReadinessTag readiness={unit.auditReadiness} />
        </div>

        {/* Blocked reason — explicit, clean. isLight v3 no dark bleed */}
        {isBlocked && unit.blockedReason && (
          <div
            className="flex items-start gap-1.5 px-2 py-1 rounded text-[10px] font-semibold"
            style={{
              background: isLight ? '#FEF2F2' : 'rgba(239,68,68,0.06)',
              color: isLight ? '#B91C1C' : '#fecaca',
              border: `1px solid ${isLight ? '#FECACA' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            <AlertCircle size={11} className="shrink-0 mt-px" />
            <span>{unit.blockedReason.label}</span>
          </div>
        )}

        {/* Awaiting signature — signers + escalation */}
        {isAwaiting && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              {unit.requiredSigners.map(s => (
                <span key={s.userId} aria-label={`${s.name} — ${s.status}`}>
                  <UserAvatar initials={s.initials} size={18} status={s.status} />
                </span>
              ))}
              <span className="text-[9.5px]" style={{ color: 'var(--v3-text-tertiary)' }}>
                {unit.evidenceStatus.signaturesComplete}/{unit.evidenceStatus.signaturesRequired} signed
              </span>
            </div>
            {typeof unit.escalationTimer === 'number' && <EscalationTimer hours={unit.escalationTimer} />}
          </div>
        )}

        {/* Completed */}
        {isCompleted && (
          <div className="flex items-center gap-1.5 text-[9.5px] font-semibold" style={{ color: isLight ? '#008540' : '#4ade80' }}>
            <FileText size={10} />
            Evidence complete · Audit indexed
          </div>
        )}

        {/* Footer: owner + due — clean subtle */}
        <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid var(--v3-border-subtle)' }}>
          <div className="flex items-center gap-1">
            <UserAvatar initials={unit.owner.initials} size={16} />
            <span className="text-[10px]" style={{ color: 'var(--v3-text-primary)' }}>{unit.owner.name}</span>
          </div>
          <div className="flex items-center gap-1 text-[9.5px] font-mono" style={{ color: 'var(--v3-teal-light)' }}>
            <Calendar size={10} />
            {fmtDateShort(unit.dueDate)}
          </div>
        </div>
      </div>
    </article>
  );
}
