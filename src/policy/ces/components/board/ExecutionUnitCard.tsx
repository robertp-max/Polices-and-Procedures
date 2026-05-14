/* ═══════════════════════════════════════════════════════════════
   ExecutionUnit (board card)
   Visible: phase, state, audit readiness, owner, due, signers,
   blocked reason, escalation timer.
   ═══════════════════════════════════════════════════════════════ */

import { Calendar, FileText, AlertCircle } from 'lucide-react';
import type { ExecutionUnit as ExecutionUnitT } from '../../types';
import { useCesTokens } from '../../theme';
import {
  ComplianceStateBadge, PhaseIndicator, AuditReadinessTag,
  UserAvatar, EscalationTimer,
} from '../primitives';

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
  const t = useCesTokens();
  const isBlocked  = unit.complianceState === 'blocked';
  const isAwaiting = unit.complianceState === 'awaiting_signature';
  const isCompleted = unit.complianceState === 'completed';
  const auditScore = (unit as { auditReadinessScore?: number }).auditReadinessScore;

  const topBar =
    isBlocked   ? t.red :
    isAwaiting  ? t.orange :
    isCompleted ? t.green :
                  t.navy;

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
      className="cursor-pointer rounded-lg shadow-sm transition-shadow hover:shadow-md select-none"
      style={{
        background: t.white,
        border: `1px solid ${isBlocked ? t.red + '55' : t.border}`,
        borderTop: `3px solid ${topBar}`,
      }}
    >
      <div className="p-3 space-y-2">
        {/* Title */}
        <h4 className="text-[12.5px] font-semibold leading-snug" style={{ color: t.ink }}>
          {unit.title}
        </h4>

        {/* Status row */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <PhaseIndicator phase={unit.workflowPhase} />
          <ComplianceStateBadge state={unit.complianceState} compact />
          <AuditReadinessTag readiness={unit.auditReadiness} />
        </div>

        {/* Blocked reason — explicit text, never color-only */}
        {isBlocked && unit.blockedReason && (
          <div
            className="flex items-start gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-semibold"
            style={{ background: t.redSoft, color: t.red, border: `1px solid ${t.red}55` }}
          >
            <AlertCircle size={12} className="shrink-0 mt-px" />
            <span>{unit.blockedReason.label}</span>
          </div>
        )}

        {/* Awaiting signature — signers + escalation */}
        {isAwaiting && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              {unit.requiredSigners.map(s => (
                <span key={s.userId} title={`${s.name} — ${s.status}`}>
                  <UserAvatar initials={s.initials} size={22} status={s.status} />
                </span>
              ))}
              <span className="text-[10.5px]" style={{ color: t.muted }}>
                {unit.evidenceStatus.signaturesComplete}/{unit.evidenceStatus.signaturesRequired} signed
              </span>
            </div>
            {typeof unit.escalationTimer === 'number' && <EscalationTimer hours={unit.escalationTimer} />}
          </div>
        )}

        {/* Completed evidence indicator */}
        {isCompleted && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10.5px] font-semibold"
            style={{ background: t.greenSoft, color: t.green }}
          >
            <FileText size={11} />
            Evidence complete · Audit indexed
          </div>
        )}
        {typeof auditScore === 'number' && (
          <div className="text-[10px] font-semibold" style={{ color: t.muted }}>
            Audit readiness score: {auditScore}%
          </div>
        )}

        {/* Footer: owner + due */}
        <div className="flex items-center justify-between pt-1" style={{ borderTop: `1px dashed ${t.border}` }}>
          <div className="flex items-center gap-1.5">
            <UserAvatar initials={unit.owner.initials} size={20} />
            <span className="text-[11px]" style={{ color: t.ink }}>{unit.owner.name}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono" style={{ color: t.navy }}>
            <Calendar size={11} />
            {fmtDateShort(unit.dueDate)}
          </div>
        </div>
      </div>
    </article>
  );
}
