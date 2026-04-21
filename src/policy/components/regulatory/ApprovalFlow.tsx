import { useState } from 'react';
import {
  BadgeCheck, CheckCircle2, XCircle, Clock, Stamp, Send,
} from 'lucide-react';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import {
  useRegulatoryExecutionStore, useEventApprovals,
  type ApprovalRequest, type ApprovalTargetKind,
} from '@/policy/stores/regulatoryExecutionStore';
import { useToastStore } from './Toast';
import { ModalShell } from './ModalShell';

/* ═══════════════════════════════════════════════════════════════
   Approval Flow — request, track, and decide approvals attached
   to event completion, forms, reports, or minutes.
   ═══════════════════════════════════════════════════════════════ */

export function ApprovalFlow({ event, compact = false }: { event: RegulatoryEvent; compact?: boolean }) {
  const approvals = useEventApprovals(event.id);
  const [requestOpen, setRequestOpen] = useState(false);
  const store = useRegulatoryExecutionStore();
  const locked = store.isEventComplete(event.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10.5px] font-montserrat font-bold text-white/55 uppercase tracking-[0.14em]">
          {approvals.length} total · {approvals.filter(a => a.status === 'pending').length} pending
        </span>
        {!locked && (
          <button
            onClick={() => setRequestOpen(true)}
            className="flex items-center gap-1 rounded-md border border-[#FFC107]/40 bg-[#FFC107]/10 px-2 py-1 text-[10px] font-montserrat font-bold text-[#FFC107] hover:bg-[#FFC107]/15 uppercase tracking-[0.12em]"
          >
            <Send size={11} /> Request Approval
          </button>
        )}
      </div>

      {approvals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] p-5 text-center">
          <BadgeCheck size={20} className="text-white/25 mx-auto mb-2" />
          <p className="font-montserrat font-bold text-white/70 text-[11.5px] mb-1">No approvals requested yet</p>
          <p className="text-[10.5px] font-roboto text-white/50 leading-snug max-w-[320px] mx-auto">
            Request sign-off on meeting minutes, report deliverables, or the event completion itself. Pending approvals block the event from being closed.
          </p>
        </div>
      ) : (
        <ul className={compact ? 'space-y-1' : 'space-y-1.5'}>
          {approvals.map(a => <ApprovalRow key={a.id} request={a} />)}
        </ul>
      )}

      <RequestApprovalModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        event={event}
      />
    </div>
  );
}

function ApprovalRow({ request }: { request: ApprovalRequest }) {
  const store = useRegulatoryExecutionStore();
  const push = useToastStore(s => s.push);

  const palette =
    request.status === 'approved' ? { color: '#10B981', label: 'Approved', icon: <CheckCircle2 size={13} /> } :
    request.status === 'rejected' ? { color: '#EF4444', label: 'Rejected', icon: <XCircle size={13} /> } :
                                    { color: '#FBBF24', label: 'Pending',  icon: <Clock size={13} /> };

  const decide = (d: 'approved' | 'rejected') => {
    store.decideApproval(request.id, d);
    push(d === 'approved' ? 'success' : 'warn', d === 'approved' ? 'Approval granted' : 'Approval rejected', request.targetLabel);
  };

  return (
    <li className="flex items-center gap-2.5 p-2 rounded-md border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <span
        className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
        style={{ background: `${palette.color}1a`, border: `1px solid ${palette.color}44`, color: palette.color }}
      >
        {palette.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[9px] font-montserrat font-bold uppercase tracking-[0.14em] text-white/50">
            {request.targetKind}
          </span>
          <span
            className="rounded-full px-1.5 py-0.5 font-montserrat font-bold uppercase tracking-[0.14em]"
            style={{ fontSize: 8.5, color: palette.color, background: `${palette.color}15`, border: `1px solid ${palette.color}44` }}
          >
            {palette.label}
          </span>
        </div>
        <p className="font-montserrat font-bold text-white text-[11.5px] truncate">{request.targetLabel}</p>
        <p className="text-[10px] font-roboto text-white/50 truncate">
          Requested by {request.requestedBy} · {new Date(request.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {request.decidedAt && ` · decided ${new Date(request.decidedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
        </p>
      </div>
      {request.status === 'pending' && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => decide('approved')}
            className="rounded-md border border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981] px-2 py-1 text-[10px] font-montserrat font-bold uppercase tracking-[0.12em] hover:bg-[#10B981]/15"
          >
            Approve
          </button>
          <button
            onClick={() => decide('rejected')}
            className="rounded-md border border-white/10 text-white/65 px-2 py-1 text-[10px] font-montserrat font-bold uppercase tracking-[0.12em] hover:text-[#EF4444] hover:border-[#EF4444]/40"
          >
            Reject
          </button>
        </div>
      )}
    </li>
  );
}

function RequestApprovalModal({
  open, onClose, event,
}: {
  open: boolean;
  onClose: () => void;
  event: RegulatoryEvent;
}) {
  const store = useRegulatoryExecutionStore();
  const push = useToastStore(s => s.push);
  const [kind, setKind] = useState<ApprovalTargetKind>('event');
  const [formId, setFormId] = useState<string>('');
  const [note, setNote] = useState('');

  const reset = () => { setKind('event'); setFormId(''); setNote(''); };

  const submit = () => {
    const targetLabel =
      kind === 'event'   ? `Event completion — ${event.title}` :
      kind === 'minutes' ? `Meeting minutes — ${event.title}` :
      kind === 'form'    ? event.requiredForms.find(f => f.id === formId)?.label || 'Form sign-off' :
      kind === 'report'  ? `Report sign-off — ${event.title}` :
                           'Approval';
    const targetId = kind === 'form' ? formId : undefined;
    store.requestApproval(event.id, kind, targetLabel, targetId, note);
    push('success', 'Approval requested', targetLabel);
    reset();
    onClose();
  };

  const kinds: { id: ApprovalTargetKind; label: string }[] = [
    { id: 'event',   label: 'Event Completion' },
    { id: 'minutes', label: 'Meeting Minutes' },
    { id: 'form',    label: 'Form Sign-off' },
    { id: 'report',  label: 'Report Sign-off' },
  ];

  return (
    <ModalShell
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Request Approval"
      subtitle={event.title}
      icon={<Stamp size={16} />}
      width={520}
      footer={
        <>
          <button
            onClick={() => { reset(); onClose(); }}
            className="rounded-md border border-white/10 px-3 py-1.5 text-[10.5px] font-montserrat font-bold text-white/70 hover:text-white hover:bg-white/[0.05] uppercase tracking-[0.14em]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={kind === 'form' && !formId}
            className="rounded-md border border-[#FFC107]/50 bg-[#FFC107]/15 px-3 py-1.5 text-[10.5px] font-montserrat font-bold text-[#FFC107] hover:bg-[#FFC107]/25 uppercase tracking-[0.14em] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Send size={11} /> Send Request
          </button>
        </>
      }
    >
      <div className="p-5 space-y-3">
        <div>
          <label className="block text-[10px] font-montserrat font-bold text-white/55 uppercase tracking-[0.14em] mb-1.5">Target</label>
          <div className="grid grid-cols-2 gap-1.5">
            {kinds.map(k => (
              <button
                key={k.id}
                onClick={() => setKind(k.id)}
                className="rounded-md border p-2 text-left transition-colors"
                style={{
                  borderColor: kind === k.id ? 'rgba(var(--ci-accent-rgb),0.55)' : 'rgba(255,255,255,0.12)',
                  background:  kind === k.id ? 'rgba(var(--ci-accent-rgb),0.10)' : 'transparent',
                  color:       kind === k.id ? '#FFC107' : 'rgba(255,255,255,0.75)',
                }}
              >
                <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]">{k.label}</div>
              </button>
            ))}
          </div>
        </div>

        {kind === 'form' && event.requiredForms.length > 0 && (
          <div>
            <label className="block text-[10px] font-montserrat font-bold text-white/55 uppercase tracking-[0.14em] mb-1">Form</label>
            <select
              value={formId}
              onChange={e => setFormId(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-md px-2.5 py-1.5 text-[12px] font-roboto text-white outline-none focus:border-[#FFC107]/60"
            >
              <option value="">— select form —</option>
              {event.requiredForms.map(f => (
                <option key={f.id} value={f.id}>{f.label} ({f.formId})</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-montserrat font-bold text-white/55 uppercase tracking-[0.14em] mb-1">Note (optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="Context for the approver…"
            className="w-full bg-black/30 border border-white/10 rounded-md px-2.5 py-1.5 text-[12px] font-roboto text-white placeholder-white/30 outline-none focus:border-[#FFC107]/60 resize-none"
          />
        </div>

        <p className="text-[10.5px] font-roboto text-white/50 leading-snug">
          A pending approval blocks event completion until an approver decides.
        </p>
      </div>
    </ModalShell>
  );
}
