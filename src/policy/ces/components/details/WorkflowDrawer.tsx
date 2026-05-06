/* ═══════════════════════════════════════════════════════════════
   WorkflowDrawer — slide-out detail for an Execution Unit.
   Composes: NonSkippableTimeline · EvidenceStatusPanel ·
             SignatureRoster · ComplianceActionPanel
   ═══════════════════════════════════════════════════════════════ */

import { useEffect, useMemo, useState } from 'react';
import { X, CheckCircle2, Circle, AlertCircle, Upload, PenLine, ShieldAlert, Lock } from 'lucide-react';
import { CES_TOKENS } from '../../theme';
import {
  type ExecutionUnit,
  type WorkflowPhase,
  WORKFLOW_PHASE_ORDER, WORKFLOW_PHASE_LABEL,
} from '../../types';
import { useExecutionEnforcement } from '../../hooks/useExecutionEnforcement';
import { summarizeEvidence } from '../../hooks/useEvidenceTracker';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import {
  ComplianceStateBadge, AuditReadinessTag, UserAvatar, EscalationTimer, KV,
} from '../primitives';

interface Props {
  unit:     ExecutionUnit;
  allUnits: ExecutionUnit[];
  onClose:  () => void;
  onUpdate: (u: ExecutionUnit) => void;
}

export function WorkflowDrawer({ unit, allUnits, onClose, onUpdate }: Props) {
  const generated = useAutogenStore(s => s.generatedEvents);
  const triggered = useAutogenStore(s => s.triggeredEvents);
  const ev = useMemo(() => {
    const pool = [...REGULATORY_EVENTS, ...generated, ...triggered].filter(e => !e.isContext);
    return pool.find(e => e.id === unit.parentEventId);
  }, [generated, triggered, unit.parentEventId]);
  const wf = useMemo(() => {
    if (!unit.workflowId) return undefined;
    const title = WORKFLOWS[unit.workflowId]?.title ?? unit.workflowId;
    return { id: unit.workflowId, title };
  }, [unit.workflowId]);
  const evd = summarizeEvidence(unit.evidenceStatus);
  const enforcement = useExecutionEnforcement();

  /* ── Esc to close ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* ── Phase index ── */
  const currentPhaseIdx = WORKFLOW_PHASE_ORDER.indexOf(unit.workflowPhase);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close drawer"
      />
      {/* Panel */}
      <aside
        className="w-[560px] flex flex-col shadow-2xl"
        style={{ background: CES_TOKENS.white, borderLeft: `1px solid ${CES_TOKENS.border}` }}
      >
        {/* Header */}
        <header
          className="px-6 py-4 flex items-start gap-3"
          style={{ borderBottom: `1px solid ${CES_TOKENS.border}` }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: CES_TOKENS.muted }}>
              {(ev?.category ?? ev?.domain) ?? '—'} · {ev?.title ?? '—'}
            </div>
            <h2 className="text-[16px] font-bold mt-0.5" style={{ color: CES_TOKENS.navy }}>
              {unit.title}
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <ComplianceStateBadge state={unit.complianceState} />
              <AuditReadinessTag readiness={unit.auditReadiness} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={18} style={{ color: CES_TOKENS.muted }} />
          </button>
        </header>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Meta */}
          <section className="space-y-2">
            <KV label="Workflow"   value={wf?.title ?? unit.workflowId} />
            <KV label="Owner"      value={`${unit.owner.name} · ${unit.owner.role}`} />
            <KV label="Due Date"   value={new Date(unit.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
            {typeof unit.escalationTimer === 'number' && (
              <div className="flex justify-end pt-1"><EscalationTimer hours={unit.escalationTimer} /></div>
            )}
          </section>

          {/* Non-skippable Timeline */}
          <NonSkippableTimeline currentIdx={currentPhaseIdx} />

          {/* Evidence */}
          <EvidenceStatusPanel
            formsLabel={evd.formsLabel}
            signaturesLabel={evd.signaturesLabel}
            auditIndexLabel={evd.auditIndexLabel}
            ready={evd.ready}
            missingForms={evd.missingForms}
          />

          {/* Signature Roster */}
          {unit.requiredSigners.length > 0 && (
            <SignatureRoster unit={unit} />
          )}

          {/* Blocked reason */}
          {unit.blockedReason && (
            <section
              className="rounded-lg p-4"
              style={{ background: CES_TOKENS.redSoft, border: `1px solid ${CES_TOKENS.red}55` }}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} style={{ color: CES_TOKENS.red }} />
                <h3 className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: CES_TOKENS.red }}>
                  Blocked
                </h3>
              </div>
              <div className="mt-2 text-[12.5px] font-semibold" style={{ color: CES_TOKENS.ink }}>
                {unit.blockedReason.label}
              </div>
              {unit.blockedReason.resourceId && (
                <div className="mt-1 text-[11.5px] font-mono" style={{ color: CES_TOKENS.muted }}>
                  Resource: {unit.blockedReason.resourceId}
                </div>
              )}
            </section>
          )}

          {/* Action panel */}
          <ComplianceActionPanel unit={unit} enforcement={enforcement} onUpdate={onUpdate} />

          {/* Sibling execution tasks (same SPRINT_TASK container) */}
          <ChildTasksPanel
            parentObligationId={unit.parentObligationId ?? unit.parentEventId}
            currentUnitId={unit.id}
            allUnits={allUnits}
          />
        </div>
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ChildTasksPanel — lists TASK obligations under the same
   SPRINT_TASK container. Read-only navigation aid.
   ───────────────────────────────────────────────────────── */
function ChildTasksPanel({
  parentObligationId,
  currentUnitId,
  allUnits,
}: {
  parentObligationId: string;
  currentUnitId: string;
  allUnits: ExecutionUnit[];
}) {
  const siblings = allUnits.filter(
    u => (u.parentObligationId ?? u.parentEventId) === parentObligationId,
  );
  if (siblings.length <= 1) return null;
  return (
    <section>
      <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: CES_TOKENS.navy }}>
        Execution Tasks
        <span className="ml-2 font-normal normal-case tracking-normal" style={{ color: CES_TOKENS.muted }}>
          ({siblings.filter(s => s.complianceState === 'completed').length}/{siblings.length})
        </span>
      </h3>
      <ul className="space-y-1.5">
        {siblings.map(s => {
          const isDone = s.complianceState === 'completed';
          const isCurr = s.id === currentUnitId;
          return (
            <li
              key={s.id}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12px]"
              style={{
                background: isCurr ? CES_TOKENS.navySoft : CES_TOKENS.canvas,
                border: `1px solid ${isCurr ? CES_TOKENS.navy + '55' : CES_TOKENS.border}`,
              }}
            >
              {isDone
                ? <CheckCircle2 size={13} style={{ color: CES_TOKENS.green }} />
                : <Circle size={11} style={{ color: CES_TOKENS.muted }} />}
              <span className="flex-1 truncate" style={{ color: isCurr ? CES_TOKENS.navy : CES_TOKENS.ink, fontWeight: isCurr ? 700 : 500 }}>
                {s.title}
              </span>
              <ComplianceStateBadge state={s.complianceState} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   NonSkippableTimeline
   ───────────────────────────────────────────────────────── */
function NonSkippableTimeline({ currentIdx }: { currentIdx: number }) {
  return (
    <section>
      <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: CES_TOKENS.navy }}>
        Workflow Phases <span className="font-normal normal-case tracking-normal" style={{ color: CES_TOKENS.muted }}>(non-skippable)</span>
      </h3>
      <ol className="space-y-2">
        {WORKFLOW_PHASE_ORDER.map((p, idx) => {
          const isDone   = idx <  currentIdx;
          const isCurr   = idx === currentIdx;
          const isFuture = idx >  currentIdx;
          return (
            <li key={p} className="flex items-center gap-3">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: isDone ? CES_TOKENS.green : isCurr ? CES_TOKENS.navy : CES_TOKENS.canvas,
                  border: `1px solid ${isDone ? CES_TOKENS.green : isCurr ? CES_TOKENS.navy : CES_TOKENS.border}`,
                  color: isDone || isCurr ? 'white' : CES_TOKENS.muted,
                }}
              >
                {isDone ? <CheckCircle2 size={14} /> : isFuture ? <Lock size={11} /> : <Circle size={10} fill="currentColor" />}
              </span>
              <span
                className="text-[12.5px]"
                style={{
                  color:    isCurr ? CES_TOKENS.ink : isDone ? CES_TOKENS.muted : CES_TOKENS.muted,
                  fontWeight: isCurr ? 700 : 500,
                }}
              >
                {WORKFLOW_PHASE_LABEL[p as WorkflowPhase]}
              </span>
              {isCurr && (
                <span
                  className="ml-auto text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded"
                  style={{ background: CES_TOKENS.navySoft, color: CES_TOKENS.navy }}
                >
                  Current
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   EvidenceStatusPanel
   ───────────────────────────────────────────────────────── */
function EvidenceStatusPanel({
  formsLabel, signaturesLabel, auditIndexLabel, ready, missingForms,
}: {
  formsLabel: string; signaturesLabel: string; auditIndexLabel: string;
  ready: boolean; missingForms: string[];
}) {
  return (
    <section>
      <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: CES_TOKENS.navy }}>
        Evidence Status
      </h3>
      <div
        className="rounded-lg p-4 space-y-2"
        style={{
          background: ready ? CES_TOKENS.greenSoft : CES_TOKENS.canvas,
          border: `1px solid ${ready ? CES_TOKENS.green + '55' : CES_TOKENS.border}`,
        }}
      >
        <KV label="Forms"        value={formsLabel} />
        <KV label="Signatures"   value={signaturesLabel} />
        <KV label="Audit Index"  value={auditIndexLabel} />
      </div>
      {missingForms.length > 0 && (
        <div className="mt-3">
          <div className="text-[11px] uppercase tracking-[0.12em] mb-1.5" style={{ color: CES_TOKENS.muted }}>
            Missing Forms
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingForms.map(f => (
              <span
                key={f}
                className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-1 rounded"
                style={{ background: CES_TOKENS.orangeSoft, color: CES_TOKENS.orange, border: `1px solid ${CES_TOKENS.orange}55` }}
              >
                <AlertCircle size={10} /> {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   SignatureRoster
   ───────────────────────────────────────────────────────── */
function SignatureRoster({ unit }: { unit: ExecutionUnit }) {
  return (
    <section>
      <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: CES_TOKENS.navy }}>
        Required Signatures
      </h3>
      <ul className="space-y-2">
        {unit.requiredSigners.map(s => {
          const tone =
            s.status === 'signed'  ? { bg: CES_TOKENS.greenSoft, fg: CES_TOKENS.green,  label: 'Signed' } :
            s.status === 'overdue' ? { bg: CES_TOKENS.redSoft,   fg: CES_TOKENS.red,    label: 'Overdue' } :
                                     { bg: CES_TOKENS.orangeSoft,fg: CES_TOKENS.orange, label: 'Pending' };
          return (
            <li
              key={s.userId}
              className="flex items-center gap-3 p-2.5 rounded-lg"
              style={{ background: CES_TOKENS.canvas, border: `1px solid ${CES_TOKENS.border}` }}
            >
              <UserAvatar initials={s.initials} size={28} status={s.status} />
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold" style={{ color: CES_TOKENS.ink }}>{s.name}</div>
                <div className="text-[10.5px]" style={{ color: CES_TOKENS.muted }}>{s.role}</div>
              </div>
              <div
                className="text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-1 rounded"
                style={{ background: tone.bg, color: tone.fg }}
              >
                {tone.label}
              </div>
              {s.status !== 'signed' && typeof s.hoursToEscalation === 'number' && (
                <span className="text-[10px] font-mono" style={{ color: CES_TOKENS.muted }}>
                  {s.hoursToEscalation >= 0 ? `${s.hoursToEscalation}h left` : `+${Math.abs(s.hoursToEscalation)}h late`}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   ComplianceActionPanel
   ───────────────────────────────────────────────────────── */
function ComplianceActionPanel({
  unit, enforcement, onUpdate,
}: {
  unit: ExecutionUnit;
  enforcement: ReturnType<typeof useExecutionEnforcement>;
  onUpdate: (u: ExecutionUnit) => void;
}) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const reqSig    = enforcement.canRequestSignature(unit);
  const blockOk   = enforcement.canMarkBlocked(unit);
  const closeOk   = enforcement.canCloseUnit(unit);
  const advanceOk = useMemo(() => {
    const targets = enforcement.legalTargets(unit.complianceState);
    return targets.length > 0;
  }, [enforcement, unit.complianceState]);

  const note = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2400);
  };

  /* ── Mock action handlers (UI demo; real wiring pending) ── */
  const handleUploadEvidence = () => {
    note('Evidence upload would attach to this Execution Unit and update form completion.');
  };
  const handleRequestSignatures = () => {
    if (!reqSig.allowed) return note(reqSig.reason);
    onUpdate({ ...unit, complianceState: 'awaiting_signature' });
    note('Routed for signature via eCIgn — roster notified.');
  };
  const handleMarkBlocked = () => {
    if (!blockOk.allowed) return note(blockOk.reason);
    note('Mark Blocked dialog would capture reason category and detail.');
  };
  const handleClose = () => {
    if (!closeOk.allowed) return note(closeOk.reason);
    onUpdate({ ...unit, complianceState: 'completed' });
    note('Unit closed — audit index entry created.');
  };

  return (
    <section>
      <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: CES_TOKENS.navy }}>
        Compliance Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          icon={<Upload size={14} />}
          label="Upload Evidence"
          tone="navy"
          onClick={handleUploadEvidence}
          disabled={false}
        />
        <ActionButton
          icon={<PenLine size={14} />}
          label="Request Signatures"
          tone="orange"
          onClick={handleRequestSignatures}
          disabled={!reqSig.allowed}
          reason={reqSig.allowed ? undefined : reqSig.shortReason}
        />
        <ActionButton
          icon={<ShieldAlert size={14} />}
          label="Mark Blocked"
          tone="red"
          onClick={handleMarkBlocked}
          disabled={!blockOk.allowed}
          reason={blockOk.allowed ? undefined : blockOk.shortReason}
        />
        <ActionButton
          icon={<CheckCircle2 size={14} />}
          label="Close Unit"
          tone="green"
          onClick={handleClose}
          disabled={!closeOk.allowed}
          reason={closeOk.allowed ? undefined : closeOk.shortReason}
        />
      </div>
      {!advanceOk && unit.complianceState !== 'completed' && (
        <div className="mt-3 text-[11px]" style={{ color: CES_TOKENS.muted }}>
          No legal state transitions available from current phase.
        </div>
      )}
      {feedback && (
        <div
          className="mt-3 text-[11.5px] px-3 py-2 rounded-md"
          style={{ background: CES_TOKENS.navySoft, color: CES_TOKENS.navy, border: `1px solid ${CES_TOKENS.navy}33` }}
        >
          {feedback}
        </div>
      )}
    </section>
  );
}

function ActionButton({
  icon, label, tone, onClick, disabled, reason,
}: {
  icon: React.ReactNode;
  label: string;
  tone: 'navy' | 'orange' | 'red' | 'green';
  onClick: () => void;
  disabled: boolean;
  reason?: string;
}) {
  const palette = {
    navy:   { bg: CES_TOKENS.navy,   fg: 'white' },
    orange: { bg: CES_TOKENS.orange, fg: 'white' },
    red:    { bg: CES_TOKENS.red,    fg: 'white' },
    green:  { bg: CES_TOKENS.green,  fg: 'white' },
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={reason}
      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[12px] font-semibold transition-opacity"
      style={{
        background: disabled ? CES_TOKENS.canvas : palette.bg,
        color:      disabled ? CES_TOKENS.muted  : palette.fg,
        border:    `1px solid ${disabled ? CES_TOKENS.border : palette.bg}`,
        opacity:    disabled ? 0.7 : 1,
        cursor:     disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
