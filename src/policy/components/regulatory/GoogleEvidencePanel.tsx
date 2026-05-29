import { useCallback, useRef, useState } from 'react';
import {
  UploadCloud, ExternalLink, CheckCircle2, AlertTriangle, Loader2, CloudUpload, Link2Off,
} from 'lucide-react';
import {
  CalendarApi,
  type GoogleEvidenceCategory,
  type UploadEvidenceResponse,
  type CalendarApiError,
} from '@/policy/services/calendarApi';

/* ═══════════════════════════════════════════════════════════════
   GoogleEvidencePanel
   ----------------------------------------------------------------
   Reusable evidence upload + status surface backed by the existing
   Google Calendar integration extended with Drive file storage.

   Drive stores files; Calendar attaches/indexes them. This panel only
   talks to the app's `/api/calendar/*` service layer (CalendarApi) —
   never to Google directly, and never opens a second auth flow.
   ═══════════════════════════════════════════════════════════════ */

export interface EvidenceTarget {
  key: string;
  label: string;
  category?: GoogleEvidenceCategory;
  taskId: string;
  formId?: string;
  formInstanceId?: string;
  evidenceRequirementId?: string;
  supportTaskId?: string;
  required?: boolean;
}

export interface GoogleEvidencePanelProps {
  eventId?: string;
  workflowId?: string;
  domain?: string;
  eventDate?: string;
  targets: EvidenceTarget[];
  variant?: 'dark' | 'light';
  title?: string;
}

type TargetState =
  | { phase: 'idle' }
  | { phase: 'uploading' }
  | { phase: 'done'; result: UploadEvidenceResponse }
  | { phase: 'error'; message: string };

const ATTACH_LABEL: Record<string, { text: string; tone: 'ok' | 'warn' | 'pending' }> = {
  attached: { text: 'Attached to Calendar', tone: 'ok' },
  pending_attach: { text: 'Attach pending', tone: 'pending' },
  attach_failed: { text: 'Attach failed', tone: 'warn' },
  removed: { text: 'Removed', tone: 'warn' },
};

export function GoogleEvidencePanel({
  eventId, workflowId, domain, eventDate, targets, variant = 'dark', title = 'Google Evidence',
}: GoogleEvidencePanelProps) {
  const [states, setStates] = useState<Record<string, TargetState>>({});
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const dark = variant === 'dark';
  const c = dark
    ? {
        wrap: 'rounded-2xl border border-[#1c2433] bg-[#10151d]/80 p-5',
        label: 'text-[#cbd5e1]',
        sub: 'text-[#8a94a6]',
        row: 'border-[#1c2433]',
        link: 'text-[#34d399] hover:text-[#6ee7b7]',
        btn: 'border border-[#2a3441] bg-[#161d27] text-[#cbd5e1] hover:border-[#007970]/70 hover:text-white',
        badge: 'border border-[#0f4c4c] bg-[#0d2a2a] text-[#5eead4]',
      }
    : {
        wrap: 'rounded-2xl border border-slate-200 bg-white p-5',
        label: 'text-slate-700',
        sub: 'text-slate-500',
        row: 'border-slate-100',
        link: 'text-teal-700 hover:text-teal-900',
        btn: 'border border-slate-300 bg-slate-50 text-slate-700 hover:border-teal-500 hover:text-teal-800',
        badge: 'border border-teal-200 bg-teal-50 text-teal-700',
      };

  const onPick = useCallback(async (target: EvidenceTarget, file: File | undefined) => {
    if (!file || !eventId) return;
    setStates(prev => ({ ...prev, [target.key]: { phase: 'uploading' } }));
    try {
      const result = await CalendarApi.uploadEvidence(eventId, file, {
        workflowId,
        taskId: target.taskId,
        formId: target.formId,
        formInstanceId: target.formInstanceId,
        evidenceRequirementId: target.evidenceRequirementId,
        supportTaskId: target.supportTaskId,
        category: target.category,
        domain,
        eventDate,
        title: file.name,
      });
      setStates(prev => ({ ...prev, [target.key]: { phase: 'done', result } }));
    } catch (e) {
      const err = e as CalendarApiError;
      setStates(prev => ({
        ...prev,
        [target.key]: { phase: 'error', message: err?.message ?? 'Upload failed.' },
      }));
    }
  }, [eventId, workflowId, domain, eventDate]);

  return (
    <section className={c.wrap}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CloudUpload size={16} className={c.label} />
          <h3 className={`text-[14px] font-semibold ${c.label}`}>{title}</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${c.badge}`}>
          Google Calendar / Drive
        </span>
      </div>

      {!eventId ? (
        <p className={`text-[12.5px] leading-relaxed ${c.sub}`}>
          Evidence upload requires an executing event context. This is template/preview mode —
          no Calendar event or Drive folder is created here.
        </p>
      ) : targets.length === 0 ? (
        <p className={`text-[12.5px] leading-relaxed ${c.sub}`}>
          No evidence targets are defined for this task. Required evidence is generated from the
          event task model — it is never created from this panel.
        </p>
      ) : (
        <ul className="space-y-3">
          {targets.map(target => {
            const st = states[target.key] ?? { phase: 'idle' };
            return (
              <li key={target.key} className={`flex flex-col gap-2 border-b ${c.row} pb-3 last:border-b-0 last:pb-0`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-[13px] font-medium ${c.label}`}>
                      {target.label}
                      {target.required ? <span className="ml-1 text-[#C74600]">*</span> : null}
                    </p>
                    <p className={`mt-0.5 text-[11px] ${c.sub}`}>
                      task {target.taskId}
                      {target.formInstanceId ? ` · form-instance ${target.formInstanceId}` : ''}
                      {target.evidenceRequirementId ? ` · req ${target.evidenceRequirementId}` : ''}
                      {target.supportTaskId ? ` · support ${target.supportTaskId}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <input
                      ref={el => { inputs.current[target.key] = el; }}
                      type="file"
                      className="hidden"
                      aria-label={`Upload evidence for ${target.label}`}
                      title={`Upload evidence for ${target.label}`}
                      onChange={e => onPick(target, e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      disabled={st.phase === 'uploading'}
                      onClick={() => inputs.current[target.key]?.click()}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-50 ${c.btn}`}
                    >
                      {st.phase === 'uploading'
                        ? <><Loader2 size={13} className="animate-spin" /> Uploading…</>
                        : <><UploadCloud size={13} /> Upload</>}
                    </button>
                  </div>
                </div>
                <StatusLine state={st} dark={dark} linkClass={c.link} subClass={c.sub} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function StatusLine({ state, dark, linkClass, subClass }: { state: TargetState; dark: boolean; linkClass: string; subClass: string }) {
  if (state.phase === 'idle') {
    return <p className={`text-[11px] ${subClass}`}>No evidence uploaded yet.</p>;
  }
  if (state.phase === 'uploading') {
    return <p className={`text-[11px] ${subClass}`}>Uploading to Drive and attaching to the Calendar event…</p>;
  }
  if (state.phase === 'error') {
    return (
      <p className="inline-flex items-center gap-1.5 text-[11px] text-[#f87171]">
        <AlertTriangle size={12} /> {state.message}
      </p>
    );
  }
  const r = state.result;
  const attach = ATTACH_LABEL[r.calendarAttachmentStatus] ?? { text: r.calendarAttachmentStatus, tone: 'pending' as const };
  const attachColor = attach.tone === 'ok' ? 'text-[#34d399]' : attach.tone === 'warn' ? 'text-[#f59e0b]' : (dark ? 'text-[#8a94a6]' : 'text-slate-500');
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
      <span className="inline-flex items-center gap-1.5 text-[#34d399]">
        <CheckCircle2 size={12} /> Stored in Drive
      </span>
      <span className={`inline-flex items-center gap-1.5 ${attachColor}`}>
        {attach.tone === 'ok' ? <CheckCircle2 size={12} /> : attach.tone === 'warn' ? <Link2Off size={12} /> : <Loader2 size={12} />}
        {attach.text}
      </span>
      <a href={r.driveFileUrl} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1 font-semibold ${linkClass}`}>
        Open in Drive <ExternalLink size={11} />
      </a>
      {r.contentStatus !== 'available'
        ? <span className={subClass}>content: {r.contentStatus}</span>
        : null}
    </div>
  );
}
