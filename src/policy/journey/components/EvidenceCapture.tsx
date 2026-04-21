/* ═══════════════════════════════════════════════════════════════
   EVIDENCE CAPTURE — used for non-SCORM competency methods:
     Return demo, Skills check-off, Case study, Scenario, Record review,
     Tabletop drill, Observation, Supervised visit.
   Produces a JourneyEvidence record + dual signature (supervisor
   + employee) and a ModuleAttempt marked passed/failed.
   ═══════════════════════════════════════════════════════════════ */

import { useState } from 'react';
import { ClipboardSignature, CheckCircle2, XCircle } from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import type { JourneyModule, SignatureRecord } from '@/policy/journey/types/journey';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';

interface Props {
  module: JourneyModule;
  employeeId: string;
  onDone: (passed: boolean) => void;
}

export function EvidenceCapture({ module, employeeId, onDone }: Props) {
  const [rating, setRating] = useState<'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'UNSATISFACTORY' | null>(null);
  const [notes, setNotes] = useState('');
  const [supervisor, setSupervisor] = useState<SignatureRecord | null>(null);
  const [learner, setLearner] = useState<SignatureRecord | null>(null);
  const record = useJourneyStore(s => s.recordManualAssessment);

  const canSubmit = rating && supervisor && learner;

  const submit = () => {
    if (!canSubmit) return;
    const passed = rating === 'SATISFACTORY';
    record(
      employeeId,
      module.id,
      { passed, score: passed ? 100 : 0, notes },
      supervisor!,
      learner!,
    );
    onDone(passed);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <ClipboardSignature size={20} className="text-[#FFC107]" />
        <div className="text-xs font-montserrat font-bold uppercase tracking-widest text-[#FFC107]">
          {module.id} · Competency Validation · {module.method}
        </div>
      </div>
      <h2 className="text-xl font-montserrat font-bold text-white">{module.title}</h2>

      <div className="border border-white/10 rounded-xl p-4 bg-black/15 text-xs text-white/70 space-y-1">
        <div><span className="text-white/40">Policy refs:</span> {module.policyRefs.join(', ') || '—'}</div>
        {module.cmsRefs.length > 0 && <div><span className="text-white/40">CMS refs:</span> {module.cmsRefs.join(', ')}</div>}
        {module.evidenceAppendix && <div><span className="text-white/40">Evidence:</span> {module.evidenceAppendix}</div>}
        {module.passThreshold === 1 && <div className="text-[#DC2626] font-bold">100% accuracy required (HHA vital signs rule).</div>}
      </div>

      <div>
        <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.25em] text-white/50 mb-2">Performance Rating</div>
        <div className="grid grid-cols-3 gap-2">
          {(['SATISFACTORY', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY'] as const).map(r => {
            const active = rating === r;
            const color = r === 'SATISFACTORY' ? '#34D399' : r === 'NEEDS_IMPROVEMENT' ? '#ff8e52' : '#DC2626';
            return (
              <button key={r} onClick={() => setRating(r)}
                className={`glass-interactive rounded-lg border px-3 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                  active ? 'text-white' : 'text-white/55'
                }`}
                style={{
                  borderColor: active ? color : 'rgba(255,255,255,0.1)',
                  background: active ? `${color}22` : undefined,
                }}>
                {r.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.25em] text-white/50 mb-2">Observation Notes</div>
        <textarea
          className="w-full bg-transparent border border-white/15 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FFC107]/60 resize-none"
          rows={4}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Describe performance, steps demonstrated, any corrections given, patient-specific notes…"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SignaturePad
          label="Supervisor / Preceptor / DON signature"
          onSign={(png, name) => setSupervisor({
            role: 'Supervisor', name, pngDataUrl: png, signedAt: new Date().toISOString(),
          })}
        />
        <SignaturePad
          label="Employee signature"
          onSign={(png, name) => setLearner({
            role: 'Employee', name, pngDataUrl: png, signedAt: new Date().toISOString(),
          })}
        />
      </div>

      {supervisor && learner && rating && (
        <div className="border border-[#FFC107]/20 rounded-xl p-4 flex items-center justify-between">
          <div className="text-sm text-white/70 flex items-center gap-2">
            {rating === 'SATISFACTORY' ? <CheckCircle2 className="text-[#34D399]" size={18} /> : <XCircle className="text-[#DC2626]" size={18} />}
            Preview: {rating === 'SATISFACTORY' ? 'PASS → attempt recorded as completed.' : 'FAIL → remediation plan will open within 7 days (HR-TD-003 §6.3).'}
          </div>
          <button onClick={submit} disabled={!canSubmit}
            className="gradient-gold rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-40">
            Record Competency
          </button>
        </div>
      )}
    </div>
  );
}
