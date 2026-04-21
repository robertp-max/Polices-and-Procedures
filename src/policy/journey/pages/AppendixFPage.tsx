/* ═══════════════════════════════════════════════════════════════
   APPENDIX F — Pre-Employment Screening Checklist (HARD STOP)
   Enforces HR-TA-001 §6.4 line-by-line.
   Cannot be signed until every line is PASS or N/A; signing is
   restricted to the HR Director role.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourneyStore, getAppendixFFor } from '@/policy/journey/stores/journeyStore';
import { SignaturePad } from '@/policy/journey/components/SignaturePad';
import { EmployeePicker } from '@/policy/journey/components/EmployeePicker';
import { CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react';

const STATUS_OPTIONS: { v: 'PASS' | 'FAIL' | 'NA'; label: string; color: string }[] = [
  { v: 'PASS', label: 'PASS', color: '#34D399' },
  { v: 'NA',   label: 'N/A',  color: '#A3A3A3' },
  { v: 'FAIL', label: 'FAIL', color: '#DC2626' },
];

export function AppendixFPage() {
  const nav = useNavigate();
  const currentEmployeeId = useJourneyStore(s => s.currentEmployeeId);
  const employee = useJourneyStore(s => s.employees.find(e => e.id === currentEmployeeId)!);
  const update = useJourneyStore(s => s.updateAppendixFItem);
  const sign = useJourneyStore(s => s.signAppendixF);
  const items = useJourneyStore(s => s.appendixF[currentEmployeeId]) ?? getAppendixFFor(currentEmployeeId);
  const signatures = useJourneyStore(s => s.appendixFSignatures[currentEmployeeId]) ?? [];

  const [notes, setNotes] = useState<Record<number, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);

  const completed = useMemo(
    () => items.filter(i => i.status === 'PASS' || i.status === 'NA').length,
    [items],
  );
  const ready = items.every(i => i.status === 'PASS' || i.status === 'NA');

  const onSign = (png: string, name: string) => {
    if (!name) return;
    const res = sign(currentEmployeeId, {
      role: 'HRDirector',
      name,
      pngDataUrl: png,
      signedAt: new Date().toISOString(),
    });
    if (!res.ok) setErr(res.message);
    else setSigned(true);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => nav('/journey')}
          className="glass-interactive flex items-center gap-2 border border-white/10 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white">
          <ArrowLeft size={14} /> Back to Journey
        </button>
        <EmployeePicker />
      </div>

      <div className="mb-6">
        <div className="text-xs font-montserrat font-bold text-[#FFC107] uppercase tracking-widest mb-1">Pre-Employment Screening</div>
        <h1 className="text-2xl font-montserrat font-bold text-white">Appendix F · HR-TA-001</h1>
        <div className="text-sm text-white/55 font-light mt-1">
          Hard stop per HR-TA-001 §4.3: no individual — including during orientation — performs any work until every
          line below is PASS or N/A and the HR Director has signed.
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-white/70">
          {completed}/{items.length} items complete
        </div>
        <div className="w-48 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full transition-all"
               style={{ width: `${(completed / items.length) * 100}%`, background: ready ? '#34D399' : 'var(--ci-gold)' }} />
        </div>
      </div>

      <div className="space-y-2 mb-8">
        {items.map(item => (
          <div key={item.id} className="border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3 bg-black/15">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/85 font-medium">
                <span className="text-[#FFC107] font-bold mr-2">{item.id}.</span>{item.label}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/35 mt-0.5">{item.policyRef}</div>
            </div>
            <div className="flex items-center gap-2">
              {STATUS_OPTIONS.map(opt => {
                const active = item.status === opt.v;
                return (
                  <button key={opt.v}
                    onClick={() => update(currentEmployeeId, item.id, opt.v, notes[item.id])}
                    disabled={signed || employee.appendixFCleared}
                    className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all disabled:cursor-not-allowed ${
                      active ? 'text-white' : 'text-white/50'
                    }`}
                    style={{
                      borderColor: active ? opt.color : 'rgba(255,255,255,0.10)',
                      background: active ? `${opt.color}22` : 'transparent',
                    }}
                  >{opt.label}</button>
                );
              })}
            </div>
            <input
              placeholder="Notes (optional)"
              defaultValue={item.notes}
              disabled={signed || employee.appendixFCleared}
              onBlur={e => {
                const v = e.target.value;
                setNotes(n => ({ ...n, [item.id]: v }));
                if (item.status !== 'PENDING') update(currentEmployeeId, item.id, item.status, v);
              }}
              className="md:w-64 bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#FFC107]/60"
            />
          </div>
        ))}
      </div>

      {!signatures.length && !employee.appendixFCleared && (
        <div className="max-w-xl">
          {!ready && (
            <div className="border border-[#ff8e52]/30 rounded-xl p-4 mb-4 flex items-start gap-3 text-xs text-white/70">
              <AlertTriangle size={16} className="text-[#ff8e52] shrink-0 mt-0.5" />
              Every line must be <b>PASS</b> or <b>N/A</b> before the HR Director can sign.
            </div>
          )}
          {err && (
            <div className="border border-[#DC2626]/40 rounded-xl p-3 mb-4 text-xs text-[#DC2626]">{err}</div>
          )}
          <SignaturePad label="HR Director signature (HR-TA-001 §6.4.4)" onSign={onSign} />
        </div>
      )}

      {(signatures.length > 0 || employee.appendixFCleared) && (
        <div className="border border-[#34D399]/40 rounded-2xl p-5 bg-[#34D399]/5 max-w-xl">
          <div className="flex items-center gap-2 text-[#34D399] text-sm font-bold">
            <ShieldCheck size={18} /> Appendix F signed — employee cleared to begin orientation.
          </div>
          {signatures.map((s, i) => (
            <div key={i} className="mt-3 flex items-center gap-3">
              <img src={s.pngDataUrl} className="h-10 bg-black/30 rounded px-2" alt="sig" />
              <div className="text-xs text-white/60">
                <div className="font-bold text-white/85">{s.name} · HR Director</div>
                <div>{new Date(s.signedAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
          <button onClick={() => nav('/journey')}
            className="mt-5 gradient-gold rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={14} /> Proceed to Orientation
          </button>
        </div>
      )}
    </div>
  );
}
