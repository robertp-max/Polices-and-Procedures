import { useMemo, useState, useCallback } from 'react';
import { Save, Send, PenLine, FileWarning, CheckCircle2 } from 'lucide-react';
import { resolveForm } from '@/policy/utils/bradFormResolver';
import { loadDraft, saveDraft, type BradFormStatus } from '@/policy/services/bradFormDraftStore';
import type { FormField, FormSection } from '@/policy/data/formsLibraryContent';

/* Fillable form renderer for Brad's right-side panel. Renders editable controls
   from the canonical form schema (buildFormContent), NOT raw text. Persists a
   real draft/instance (bradFormDraftStore) so values survive close/reopen.
   Never auto-submits, certifies, locks, or signs. */

type FieldValue = string | boolean;

export function BradFormPanel({
  formId,
  onOpenEsign,
}: {
  formId: string;
  onOpenEsign: (path: string) => void;
}) {
  const resolved = useMemo(() => resolveForm(formId), [formId]);
  const initialDraft = useMemo(() => (resolved ? loadDraft(resolved.formId) : null), [resolved]);

  const [values, setValues] = useState<Record<string, FieldValue>>(initialDraft?.values ?? {});
  const [status, setStatus] = useState<BradFormStatus>(initialDraft?.status ?? 'draft');
  const [instanceId, setInstanceId] = useState<string | undefined>(initialDraft?.instanceId);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const setField = useCallback((key: string, v: FieldValue) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setSavedNote(null);
  }, []);

  const persist = useCallback((next: BradFormStatus) => {
    if (!resolved) return undefined;
    const draft = saveDraft(resolved.formId, values, next);
    setInstanceId(draft.instanceId);
    setStatus(draft.status);
    setSavedNote(next === 'in_review' ? 'Sent for review' : 'Draft saved');
    return draft;
  }, [resolved, values]);

  const handleSign = useCallback(() => {
    if (!resolved) return;
    const draft = persist('draft'); // eCIgn requires an existing form instance
    const id = draft?.instanceId ?? instanceId;
    onOpenEsign(`/forms/${resolved.formId}/esign${id ? `?form_instance_id=${encodeURIComponent(id)}` : ''}`);
  }, [resolved, persist, instanceId, onOpenEsign]);

  // ── Missing / invalid form → "Form unavailable" (never a raw-text fallback). ──
  if (!resolved) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-tone-orange-border bg-tone-orange-bg p-md text-sm text-tone-orange-text">
        <FileWarning className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div>
          <div className="font-medium">Form unavailable</div>
          <div className="text-xs">This form ({formId}) couldn’t be found in the Forms Library.</div>
        </div>
      </div>
    );
  }

  const { content, signable } = resolved;
  const statusLabel = status === 'in_review' ? 'In review' : 'Draft';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-wider text-muted">{content.type} · {content.id}</div>
        <span className="inline-flex items-center gap-1 rounded-full border border-card bg-surface-glass px-2 py-0.5 text-[11px] font-medium text-brand-teal">
          {statusLabel}{instanceId ? ' · saved' : ''}
        </span>
      </div>
      {content.purpose && <p className="text-sm leading-relaxed text-muted">{content.purpose}</p>}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        {content.sections.map((section, si) => (
          <SectionView key={si} section={section} si={si} values={values} setField={setField} />
        ))}
      </form>

      {savedNote && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-brand-teal">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {savedNote}
          {instanceId && <span className="text-muted">· instance {instanceId.slice(0, 18)}…</span>}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-hairline pt-3">
        <button type="button" onClick={() => persist('draft')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-card bg-surface-glass px-3 py-1.5 text-sm font-medium text-ink transition hover:border-brand-teal hover:text-brand-teal">
          <Save className="h-4 w-4" aria-hidden /> Save draft
        </button>
        <button type="button" onClick={() => persist('in_review')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-card bg-surface-glass px-3 py-1.5 text-sm font-medium text-ink transition hover:border-brand-teal hover:text-brand-teal">
          <Send className="h-4 w-4" aria-hidden /> Send for review
        </button>
        {signable && (
          <button type="button" onClick={handleSign}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-teal px-3 py-1.5 text-sm font-medium text-on-brand transition hover:bg-brand-teal-deep">
            <PenLine className="h-4 w-4" aria-hidden /> Sign with eCIgn
          </button>
        )}
      </div>
      <p className="text-[11px] leading-relaxed text-muted">
        This is a working draft. Nothing is submitted, certified, locked, or signed automatically — you stay in control of every field.
      </p>
    </div>
  );
}

function SectionView({ section, si, values, setField }: {
  section: FormSection; si: number; values: Record<string, FieldValue>; setField: (k: string, v: FieldValue) => void;
}) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-sm font-semibold text-ink">{section.title}</legend>
      {section.description && <p className="text-xs text-muted">{section.description}</p>}

      {section.layout === 'grid' && (
        <div className="grid grid-cols-2 gap-3">
          {(section.fields ?? []).map((f, fi) => (
            <FieldControl key={fi} field={f} fieldKey={`s${si}-f${fi}`} value={values[`s${si}-f${fi}`]} setField={setField} />
          ))}
        </div>
      )}

      {section.layout === 'checklist' && (
        <div className="space-y-1.5">
          {(section.items ?? []).map((item, ii) => {
            const key = `s${si}-chk${ii}`;
            return (
              <label key={ii} className="flex items-start gap-2 text-sm text-ink">
                <input type="checkbox" checked={values[key] === true} onChange={(e) => setField(key, e.target.checked)} className="mt-0.5" />
                <span>{item}</span>
              </label>
            );
          })}
        </div>
      )}

      {(section.layout === 'narrative') && (
        <textarea
          rows={4}
          value={(values[`s${si}-narrative`] as string) ?? section.body ?? ''}
          onChange={(e) => setField(`s${si}-narrative`, e.target.value)}
          className="w-full rounded-lg border border-card bg-surface-glass p-2 text-sm text-ink"
        />
      )}

      {section.layout === 'attestation' && (
        <div className="space-y-2">
          {section.body && <p className="text-xs text-muted">{section.body}</p>}
          {(section.acknowledgments ?? []).map((ack, ai) => {
            const key = `s${si}-ack${ai}`;
            return (
              <label key={ai} className="flex items-start gap-2 text-sm text-ink">
                <input type="checkbox" checked={values[key] === true} onChange={(e) => setField(key, e.target.checked)} className="mt-0.5" />
                <span>{ack}</span>
              </label>
            );
          })}
          <p className="text-[11px] text-muted">Signature is captured through eCIgn — use “Sign with eCIgn” below.</p>
        </div>
      )}

      {(section.layout === 'table' || section.layout === 'matrix') && (
        <div className="overflow-x-auto">
          <div className="mb-1 flex gap-2 text-[11px] font-medium uppercase tracking-wide text-muted">
            {(section.columns ?? section.matrixCols ?? ['Entry']).map((c, ci) => <span key={ci} className="min-w-[100px] flex-1">{c}</span>)}
          </div>
          {[0, 1, 2].map((r) => (
            <div key={r} className="mb-1 flex gap-2">
              {(section.columns ?? section.matrixCols ?? ['Entry']).map((_c, ci) => {
                const key = `s${si}-r${r}-c${ci}`;
                return (
                  <input key={ci} type="text" value={(values[key] as string) ?? ''} onChange={(e) => setField(key, e.target.value)}
                    className="min-w-[100px] flex-1 rounded-md border border-card bg-surface-glass px-2 py-1 text-sm text-ink" />
                );
              })}
            </div>
          ))}
        </div>
      )}

      {section.layout === 'signature' && (
        <p className="text-[11px] text-muted">Signature is captured through eCIgn — use “Sign with eCIgn” below.</p>
      )}
    </fieldset>
  );
}

function FieldControl({ field, fieldKey, value, setField }: {
  field: FormField; fieldKey: string; value: FieldValue | undefined; setField: (k: string, v: FieldValue) => void;
}) {
  const span = field.col === 4 ? 'col-span-2' : field.col === 1 ? 'col-span-1' : 'col-span-2';
  const label = (
    <span className="mb-1 block text-xs font-medium text-ink">
      {field.label}{field.required ? <span className="text-brand-orange"> *</span> : null}
    </span>
  );
  const cls = 'w-full rounded-md border border-card bg-surface-glass px-2 py-1.5 text-sm text-ink';

  if (field.type === 'signature') {
    return (
      <label className={`${span} block`}>
        {label}
        <span className="block rounded-md border border-dashed border-card px-2 py-1.5 text-xs text-muted">Signed via eCIgn</span>
      </label>
    );
  }
  if (field.type === 'textarea') {
    return (
      <label className={`${span} block`}>
        {label}
        <textarea rows={3} value={(value as string) ?? ''} placeholder={field.placeholder} onChange={(e) => setField(fieldKey, e.target.value)} className={cls} />
      </label>
    );
  }
  if (field.type === 'select') {
    return (
      <label className={`${span} block`}>
        {label}
        <select value={(value as string) ?? ''} onChange={(e) => setField(fieldKey, e.target.value)} className={cls}>
          <option value="">— select —</option>
          {(field.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === 'checkbox') {
    return (
      <label className={`${span} flex items-center gap-2 text-sm text-ink`}>
        <input type="checkbox" checked={value === true} onChange={(e) => setField(fieldKey, e.target.checked)} />
        {field.label}
      </label>
    );
  }
  if (field.type === 'radio') {
    return (
      <div className={`${span}`}>
        {label}
        <div className="flex flex-wrap gap-3">
          {(field.options ?? []).map((o) => (
            <label key={o} className="flex items-center gap-1 text-sm text-ink">
              <input type="radio" name={fieldKey} checked={value === o} onChange={() => setField(fieldKey, o)} /> {o}
            </label>
          ))}
        </div>
      </div>
    );
  }
  const inputType = field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text';
  return (
    <label className={`${span} block`}>
      {label}
      <input type={inputType} value={(value as string) ?? ''} placeholder={field.placeholder} onChange={(e) => setField(fieldKey, e.target.value)} className={cls} />
    </label>
  );
}
