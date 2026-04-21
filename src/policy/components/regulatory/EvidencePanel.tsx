import { useState } from 'react';
import {
  UploadCloud, FileText, File, ClipboardCheck, Paperclip, Trash2, Download,
  FilePlus2, Receipt,
} from 'lucide-react';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import {
  useRegulatoryExecutionStore, useEventEvidence,
  type EvidenceKind, type EvidenceDoc,
} from '@/policy/stores/regulatoryExecutionStore';
import { useToastStore } from './Toast';
import { ModalShell } from './ModalShell';

/* ═══════════════════════════════════════════════════════════════
   Evidence Panel — documents / uploads / generated reports
   tied to the currently-selected event. Serves as the evidentiary
   record for audit.
   ═══════════════════════════════════════════════════════════════ */

export function EvidencePanel({ event, compact = false }: { event: RegulatoryEvent; compact?: boolean }) {
  const docs = useEventEvidence(event.id);
  const store = useRegulatoryExecutionStore();
  const push = useToastStore(s => s.push);
  const locked = store.isEventComplete(event.id);
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10.5px] font-montserrat font-bold text-white/55 uppercase tracking-[0.14em]">
          {docs.length} {docs.length === 1 ? 'item' : 'items'} on file
        </span>
        {!locked && (
          <div className="flex gap-1.5">
            <button
              onClick={() => setUploadOpen(true)}
              className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[10px] font-montserrat font-bold text-white/75 hover:text-white hover:bg-white/[0.05] uppercase tracking-[0.12em]"
            >
              <UploadCloud size={11} /> Upload
            </button>
            <button
              onClick={() => {
                const title = `${event.title} – Report ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.pdf`;
                store.generateReport(event.id, title);
                push('success', 'Report generated', title);
              }}
              className="flex items-center gap-1 rounded-md border border-[#FFC107]/40 bg-[#FFC107]/10 px-2 py-1 text-[10px] font-montserrat font-bold text-[#FFC107] hover:bg-[#FFC107]/15 uppercase tracking-[0.12em]"
            >
              <FilePlus2 size={11} /> Generate Report
            </button>
          </div>
        )}
      </div>

      {docs.length === 0 ? (
        <EvidenceEmpty />
      ) : (
        <ul className={compact ? 'space-y-1' : 'space-y-1.5'}>
          {docs.map(d => (
            <EvidenceRow key={d.id} doc={d} eventLocked={locked} />
          ))}
        </ul>
      )}

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        event={event}
      />
    </div>
  );
}

function EvidenceRow({ doc, eventLocked }: { doc: EvidenceDoc; eventLocked: boolean }) {
  const store = useRegulatoryExecutionStore();
  const push = useToastStore(s => s.push);
  const icon = kindIcon(doc.kind);
  return (
    <li className="flex items-center gap-2.5 p-2 rounded-md border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <span
        className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
        style={{ background: `${icon.color}1a`, border: `1px solid ${icon.color}44`, color: icon.color }}
      >
        {icon.node}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-montserrat font-bold text-white text-[11.5px] truncate">{doc.name}</p>
        <p className="text-[10px] font-roboto text-white/50 truncate">
          <span className="uppercase tracking-[0.12em] font-montserrat font-bold" style={{ color: icon.color, fontSize: 9 }}>{doc.kind}</span>
          {' · '}{new Date(doc.uploadedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
          {' · '}{doc.uploadedBy}
          {doc.sizeLabel && doc.sizeLabel !== '—' && ` · ${doc.sizeLabel}`}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => push('info', 'Download started', doc.name)}
          aria-label="Download"
          className="w-6 h-6 rounded-md border border-white/10 flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.05]"
        >
          <Download size={10} />
        </button>
        {!eventLocked && (
          <button
            onClick={() => { store.removeEvidence(doc.eventId, doc.id); push('warn', 'Document removed', doc.name); }}
            aria-label="Remove"
            className="w-6 h-6 rounded-md border border-white/10 flex items-center justify-center text-white/45 hover:text-[#EF4444] hover:border-[#EF4444]/40"
          >
            <Trash2 size={10} />
          </button>
        )}
      </div>
    </li>
  );
}

function EvidenceEmpty() {
  return (
    <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] p-5 text-center">
      <Paperclip size={20} className="text-white/25 mx-auto mb-2" />
      <p className="font-montserrat font-bold text-white/70 text-[11.5px] mb-1">No evidence attached yet</p>
      <p className="text-[10.5px] font-roboto text-white/50 leading-snug max-w-[320px] mx-auto">
        Upload finalized minutes, signed forms, reports, or supporting attachments. Every item here becomes part of the event's audit record.
      </p>
    </div>
  );
}

function kindIcon(k: EvidenceKind) {
  switch (k) {
    case 'minutes':    return { node: <ClipboardCheck size={13} />, color: '#FBBF24' };
    case 'report':     return { node: <FileText size={13} />,       color: '#A78BFA' };
    case 'form':       return { node: <Receipt size={13} />,        color: '#10B981' };
    case 'attachment': return { node: <Paperclip size={13} />,      color: 'var(--ci-gold)' };
    default:           return { node: <File size={13} />,           color: 'rgba(255,255,255,0.55)' };
  }
}

/* ─── Upload modal ───────────────────────────────────── */
function UploadModal({
  open, onClose, event,
}: {
  open: boolean;
  onClose: () => void;
  event: RegulatoryEvent;
}) {
  const store = useRegulatoryExecutionStore();
  const push = useToastStore(s => s.push);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<EvidenceKind>('attachment');
  const [linkedFormId, setLinkedFormId] = useState<string>('');
  const [note, setNote] = useState('');

  const reset = () => { setName(''); setKind('attachment'); setLinkedFormId(''); setNote(''); };

  const submit = () => {
    if (!name.trim()) return;
    store.uploadEvidence(event.id, {
      name: name.trim(),
      kind,
      sizeLabel: '1.2 MB',
      linkedFormId: linkedFormId || undefined,
      note: note || undefined,
    });
    push('success', 'Document uploaded', name.trim());
    reset();
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Upload Document"
      subtitle={event.title}
      icon={<UploadCloud size={16} />}
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
            disabled={!name.trim()}
            className="rounded-md border border-[#FFC107]/50 bg-[#FFC107]/15 px-3 py-1.5 text-[10.5px] font-montserrat font-bold text-[#FFC107] hover:bg-[#FFC107]/25 uppercase tracking-[0.14em] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <UploadCloud size={11} /> Upload
          </button>
        </>
      }
    >
      <div className="p-5 space-y-3">
        <div
          className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] py-6 text-center cursor-pointer hover:border-[#FFC107]/40 hover:bg-[#FFC107]/5 transition-colors"
          onClick={() => {
            if (!name) setName(`${event.id}_evidence_${Date.now().toString().slice(-6)}.pdf`);
          }}
        >
          <UploadCloud size={20} className="text-white/50 mx-auto mb-1" />
          <p className="text-[11.5px] font-roboto text-white/65">Click to simulate file selection</p>
          <p className="text-[10px] font-roboto text-white/40 mt-0.5">A mock filename will be generated. In production this connects to the document service.</p>
        </div>

        <Field label="Document Name">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. QAPI_May_Agenda.pdf"
            className="w-full bg-black/30 border border-white/10 rounded-md px-2.5 py-1.5 text-[12px] font-roboto text-white placeholder-white/30 outline-none focus:border-[#FFC107]/60"
          />
        </Field>

        <Field label="Kind">
          <div className="flex gap-1 flex-wrap">
            {(['attachment', 'minutes', 'report', 'form', 'other'] as EvidenceKind[]).map(k => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className="rounded-full px-2.5 py-1 text-[10px] font-montserrat font-bold uppercase tracking-[0.12em] border"
                style={{
                  color: kind === k ? '#FFC107' : 'rgba(255,255,255,0.65)',
                  borderColor: kind === k ? 'rgba(var(--ci-accent-rgb),0.5)' : 'rgba(255,255,255,0.12)',
                  background: kind === k ? 'rgba(var(--ci-accent-rgb),0.10)' : 'transparent',
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </Field>

        {event.requiredForms.length > 0 && (
          <Field label="Link to Form (optional)">
            <select
              value={linkedFormId}
              onChange={e => setLinkedFormId(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-md px-2.5 py-1.5 text-[12px] font-roboto text-white outline-none focus:border-[#FFC107]/60"
            >
              <option value="">— none —</option>
              {event.requiredForms.map(f => (
                <option key={f.id} value={f.id}>{f.label} ({f.formId})</option>
              ))}
            </select>
            <p className="text-[10px] font-roboto text-white/45 mt-1">Linking auto-marks the form as complete.</p>
          </Field>
        )}

        <Field label="Note (optional)">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            className="w-full bg-black/30 border border-white/10 rounded-md px-2.5 py-1.5 text-[12px] font-roboto text-white placeholder-white/30 outline-none focus:border-[#FFC107]/60 resize-none"
          />
        </Field>
      </div>
    </ModalShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-montserrat font-bold text-white/55 uppercase tracking-[0.14em] mb-1">{label}</label>
      {children}
    </div>
  );
}
