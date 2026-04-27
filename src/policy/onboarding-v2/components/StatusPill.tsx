import type { ReactNode } from 'react';
import type { BatchStatus, UnitStatus, EvidenceStatus, SignatureStatus, GateOutcome } from '../types';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'muted';

const TONE_CLASS: Record<Tone, string> = {
  success: 'bg-[#E5F4EC] text-[#1F8A4C] border-[#BFE6CE]',
  warning: 'bg-[#FBEDD7] text-[#B45309] border-[#F2D2A4]',
  danger:  'bg-[#FCE5E5] text-[#B42318] border-[#F2BCBC]',
  info:    'bg-[#E5EEF8] text-[#1E63B0] border-[#BFD3EE]',
  muted:   'bg-[#F2F4F7] text-[#4B5563] border-[#E5E7EB]',
};

const UNIT_TONE: Record<UnitStatus, Tone> = {
  NotStarted: 'muted', InProgress: 'info', Blocked: 'danger',
  AtRisk: 'warning', AwaitingSignature: 'info', AwaitingEvidence: 'info',
  Completed: 'success', Failed: 'danger', Suppressed: 'muted',
};
const BATCH_TONE: Record<BatchStatus, Tone> = {
  PendingActivation: 'muted', InProgress: 'info', AtRisk: 'warning',
  Blocked: 'danger', AwaitingSignature: 'info', AwaitingEvidence: 'info',
  Completed: 'success', Withdrawn: 'muted', RevalidationDue: 'warning',
};
const EV_TONE: Record<EvidenceStatus, Tone> = {
  Pending: 'muted', Valid: 'success', Rejected: 'danger', Superseded: 'muted',
};
const SIG_TONE: Record<SignatureStatus, Tone> = {
  Requested: 'muted', Sent: 'info', Viewed: 'info',
  Signed: 'success', Declined: 'danger', Expired: 'warning', Voided: 'muted',
};
const GATE_TONE: Record<GateOutcome, Tone> = {
  Pass: 'success', Fail: 'danger', Conditional: 'warning', Pending: 'muted',
};

const HUMAN: Record<string, string> = {
  NotStarted: 'Not Started', InProgress: 'In Progress', Blocked: 'Blocked',
  AtRisk: 'At Risk', AwaitingSignature: 'Awaiting Signature', AwaitingEvidence: 'Awaiting Evidence',
  Completed: 'Completed', Failed: 'Failed', Suppressed: 'Suppressed (reconciled)',
  PendingActivation: 'Pending Activation', Withdrawn: 'Withdrawn', RevalidationDue: 'Revalidation Due',
  Pending: 'Pending', Valid: 'Valid', Rejected: 'Rejected', Superseded: 'Superseded',
  Requested: 'Requested', Sent: 'Sent', Viewed: 'Viewed', Signed: 'Signed',
  Declined: 'Declined', Expired: 'Expired', Voided: 'Voided',
  Pass: 'Pass', Fail: 'Fail', Conditional: 'Conditional override',
};

interface Props {
  status: UnitStatus | BatchStatus | EvidenceStatus | SignatureStatus | GateOutcome;
  size?: 'sm' | 'md';
  icon?: ReactNode;
}

export function StatusPill({ status, size = 'sm', icon }: Props) {
  const tone =
    (UNIT_TONE as Record<string, Tone>)[status]
    ?? (BATCH_TONE as Record<string, Tone>)[status]
    ?? (EV_TONE as Record<string, Tone>)[status]
    ?? (SIG_TONE as Record<string, Tone>)[status]
    ?? (GATE_TONE as Record<string, Tone>)[status]
    ?? 'muted';
  const cls = TONE_CLASS[tone];
  const padding = size === 'md' ? 'px-2.5 py-1 text-[12px]' : 'px-2 py-0.5 text-[11px]';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${cls} ${padding} font-medium tabular-nums`}>
      {icon}
      {HUMAN[status] ?? status}
    </span>
  );
}
