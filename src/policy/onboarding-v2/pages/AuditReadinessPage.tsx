import { useMemo, useState } from 'react';
import { Download, FileSearch2 } from 'lucide-react';
import { useOnboardingV2Store } from '../store/onboardingV2Store';
import { GateTile } from '../components/GateTile';
import { StatusPill } from '../components/StatusPill';
import { PolicyVersionLink } from '../components/PolicyVersionLink';
import { AuditTimeline } from '../components/AuditTimeline';
import { verifyChain } from '../engine/audit';
import type { GateResult } from '../engine/gates';
import type { OnboardingExecutionUnit } from '../types';

type Tab = 'credentials' | 'acknowledgments' | 'competencies' | 'trainings' | 'gates' | 'overrides' | 'evidence' | 'audit';

const TABS: { id: Tab; label: string }[] = [
  { id: 'credentials',     label: 'Credentials' },
  { id: 'acknowledgments', label: 'Acknowledgments' },
  { id: 'competencies',    label: 'Competencies' },
  { id: 'trainings',       label: 'Trainings' },
  { id: 'gates',           label: 'Gates' },
  { id: 'overrides',       label: 'Overrides' },
  { id: 'evidence',        label: 'Evidence' },
  { id: 'audit',           label: 'Audit chain' },
];

export function AuditReadinessPage() {
  const snap = useOnboardingV2Store(s => s.snap);
  const evaluateAll = useOnboardingV2Store(s => s.evaluateAllGates);
  const [subjectId, setSubjectId] = useState<string>(snap.workforce[0]?.id ?? '');
  const [tab, setTab] = useState<Tab>('credentials');

  const subject = snap.workforce.find(w => w.id === subjectId) ?? snap.vendors.find(v => v.id === subjectId);
  const subjectName = (subject as { legalName?: string } | undefined)?.legalName ?? subjectId;

  const subjectUnits = useMemo(() => {
    const batchIds = snap.batches.filter(b => b.subjectId === subjectId).map(b => b.id);
    return snap.units.filter(u => batchIds.includes(u.batchId));
  }, [snap, subjectId]);

  const evidence = useMemo(() => snap.evidence.filter(e => e.subjectId === subjectId), [snap.evidence, subjectId]);
  const overrides = useMemo(() => snap.overrides.filter(o => o.subjectId === subjectId), [snap.overrides, subjectId]);
  const audit = useMemo(() => snap.audit.filter(a => a.subjectId === subjectId).slice().reverse(), [snap.audit, subjectId]);
  const chainVerification = useMemo(() => verifyChain(snap, subjectId), [snap, subjectId]);
  const gates = useMemo(() => evaluateAll(subjectId), [evaluateAll, subjectId]);

  function unitsByObjectType(predicate: (objectType: string) => boolean) {
    return subjectUnits.filter(u => u.evidenceRequired.some(r => predicate(r.objectType)));
  }

  function exportDossier() {
    const dossier = {
      subjectId, subjectName, generatedAt: new Date().toISOString(),
      gates, units: subjectUnits, evidence, overrides, audit, chainVerification,
    };
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dossier-${subjectId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="p-6 space-y-5 overflow-y-auto h-full">
      <header className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Onboarding v2</div>
          <h1 className="text-[22px] font-semibold text-[#0B2545]">Audit Readiness</h1>
          <p className="text-[12px] text-[#4B5563] mt-1 max-w-2xl">Surveyor-grade per-subject dossier. All artifacts hash-bound to policy versions and chained in an immutable audit log.</p>
        </div>
        <button
          onClick={exportDossier}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#0B2545] text-white font-semibold text-[12px] hover:bg-[#13355E]"
        >
          <Download size={14} /> Export dossier (JSON)
        </button>
      </header>

      {/* Subject picker + chain */}
      <section className="grid grid-cols-12 gap-3">
        <div className="col-span-8 border border-[#E5E7EB] rounded-[10px] bg-white p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Subject</div>
          <div className="flex items-center gap-3">
            <select
              title="Select subject"
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="flex-1 text-[12px] border border-[#E5E7EB] rounded-md px-3 py-2 bg-white"
            >
              <optgroup label="Workforce">
                {snap.workforce.map(w => <option key={w.id} value={w.id}>{w.legalName} · {w.primaryRoleId}</option>)}
              </optgroup>
              <optgroup label="Vendors">
                {snap.vendors.map(v => <option key={v.id} value={v.id}>{v.legalName} · {v.vendorType}</option>)}
              </optgroup>
            </select>
            <FileSearch2 size={20} className="text-[#13355E]" />
          </div>
          <div className="mt-3 text-[12px] text-[#0B1220]">
            Selected: <strong>{subjectName}</strong> · ID <span className="font-mono">{subjectId}</span>
          </div>
        </div>
        <div className={`col-span-4 border rounded-[10px] p-4 ${
          chainVerification.ok ? 'border-[#BFE6CE] bg-[#F2FAF6]' : 'border-[#F2BCBC] bg-[#FCF1F1]'
        }`}>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Hash-chain integrity</div>
          <div className={`mt-1 text-[20px] font-semibold ${chainVerification.ok ? 'text-[#1F8A4C]' : 'text-[#B42318]'}`}>
            {chainVerification.ok ? 'Verified' : 'Broken'}
          </div>
          <div className="text-[10px] text-[#4B5563] mt-1 tabular-nums">
            {audit.length} events
            {!chainVerification.ok && chainVerification.brokenAt !== undefined && <> · break at #{chainVerification.brokenAt}</>}
          </div>
        </div>
      </section>

      {/* Gates */}
      <section>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">Gate posture</div>
        <div className="grid grid-cols-5 gap-3">
          {gates.map(g => {
            const last = snap.gateEvaluations.filter(e => e.subjectId === subjectId && e.gateId === g.gateId).slice(-1)[0];
            return <GateTile key={g.gateId} result={g} lastEvalAt={last?.evaluatedAt} />;
          })}
        </div>
      </section>

      {/* Tabs */}
      <section className="border border-[#E5E7EB] rounded-[10px] bg-white">
        <div className="px-4 border-b border-[#E5E7EB] flex items-center gap-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2.5 text-[12px] font-semibold whitespace-nowrap border-b-2 -mb-px transition ${
                tab === t.id ? 'border-[#E07B2C] text-[#0B2545]' : 'border-transparent text-[#4B5563] hover:text-[#0B2545]'
              }`}
            >{t.label}</button>
          ))}
        </div>
        <div className="p-5">
          {tab === 'credentials'     && <UnitTable units={unitsByObjectType(t => t === 'PSVResult' || t === 'ScreeningResult')} />}
          {tab === 'acknowledgments' && <UnitTable units={subjectUnits.filter(u => u.signatureRequired.some(s => s.signerRole === 'Subject'))} />}
          {tab === 'competencies'    && <UnitTable units={unitsByObjectType(t => t === 'CompetencyArtifact')} />}
          {tab === 'trainings'       && <UnitTable units={unitsByObjectType(t => t === 'TrainingRecord')} />}
          {tab === 'gates'           && <GateBreakdown gates={gates} />}
          {tab === 'overrides'       && <OverridesTable overrides={overrides} />}
          {tab === 'evidence'        && <EvidenceTable evidence={evidence} />}
          {tab === 'audit'           && <AuditTimeline events={audit} />}
        </div>
      </section>
    </div>
  );
}

function UnitTable({ units }: { units: OnboardingExecutionUnit[] }) {
  const requirements = useOnboardingV2Store(s => s.snap.requirements);
  if (units.length === 0) return <div className="text-[12px] text-[#6B7280] italic">No units in this category.</div>;
  return (
    <table className="w-full text-[12px]">
      <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
        <tr>
          <th className="text-left py-1.5">Requirement</th>
          <th className="text-left py-1.5">Phase</th>
          <th className="text-left py-1.5">Policy</th>
          <th className="text-left py-1.5">Due</th>
          <th className="text-right py-1.5">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#E5E7EB]">
        {units.map(u => {
          const r = requirements.find(x => x.id === u.requirementId);
          return (
            <tr key={u.id}>
              <td className="py-2 font-medium text-[#0B1220]">{r?.name}</td>
              <td className="py-2 text-[#4B5563]">{u.phase}</td>
              <td className="py-2"><div className="flex flex-wrap gap-1">{u.policyRefs.map(p => <PolicyVersionLink key={`${p.policyId}-${p.policyVersion}`} policy={p} compact />)}</div></td>
              <td className="py-2 text-[#4B5563]">{u.dueAt ? new Date(u.dueAt).toLocaleDateString() : '—'}</td>
              <td className="py-2 text-right"><StatusPill status={u.status} /></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function GateBreakdown({ gates }: { gates: GateResult[] }) {
  const requirements = useOnboardingV2Store(s => s.snap.requirements);
  return (
    <div className="space-y-4">
      {gates.map(g => (
        <div key={g.gateId} className="border border-[#E5E7EB] rounded-[8px] p-3">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-[#0B2545]">{g.gateId}</div>
            <StatusPill status={g.outcome} />
          </div>
          {g.missingRequirementIds.length > 0 && (
            <ul className="mt-2 text-[11px] text-[#4B5563] list-disc pl-5">
              {g.missingRequirementIds.map(rid => (
                <li key={rid}>{requirements.find(r => r.id === rid)?.name ?? rid}</li>
              ))}
            </ul>
          )}
          {g.reasons.length > 0 && (
            <div className="mt-1 text-[11px] text-[#B45309]">{g.reasons.join(' · ')}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function OverridesTable({ overrides }: { overrides: ReturnType<typeof useOnboardingV2Store.getState>['snap']['overrides'] }) {
  if (overrides.length === 0) return <div className="text-[12px] text-[#6B7280] italic">No overrides on file.</div>;
  return (
    <table className="w-full text-[12px]">
      <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
        <tr><th className="text-left py-1.5">Override</th><th className="text-left py-1.5">Gate/Rule</th><th className="text-left py-1.5">Reason</th><th className="text-left py-1.5">Valid</th><th className="text-right py-1.5">Status</th></tr>
      </thead>
      <tbody className="divide-y divide-[#E5E7EB]">
        {overrides.map(o => (
          <tr key={o.id}>
            <td className="py-2 font-mono text-[10px]">{o.id}</td>
            <td className="py-2 text-[#4B5563]">{o.gateOrRuleId}</td>
            <td className="py-2 text-[#0B1220]">{o.reason}</td>
            <td className="py-2 text-[#4B5563]">{new Date(o.validFrom).toLocaleDateString()} → {new Date(o.validTo).toLocaleDateString()}</td>
            <td className="py-2 text-right"><StatusPill status={o.status === 'Active' ? 'InProgress' : 'Suppressed'} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EvidenceTable({ evidence }: { evidence: ReturnType<typeof useOnboardingV2Store.getState>['snap']['evidence'] }) {
  if (evidence.length === 0) return <div className="text-[12px] text-[#6B7280] italic">No evidence captured.</div>;
  return (
    <table className="w-full text-[12px]">
      <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
        <tr><th className="text-left py-1.5">Evidence</th><th className="text-left py-1.5">Type</th><th className="text-left py-1.5">Filename</th><th className="text-left py-1.5">Hash</th><th className="text-right py-1.5">Status</th></tr>
      </thead>
      <tbody className="divide-y divide-[#E5E7EB]">
        {evidence.map(e => (
          <tr key={e.id}>
            <td className="py-2 font-mono text-[10px]">{e.id}</td>
            <td className="py-2 text-[#4B5563]">{e.objectType}</td>
            <td className="py-2 text-[#0B1220]">{e.filename}</td>
            <td className="py-2 font-mono text-[10px] text-[#6B7280]">{e.contentHash.slice(0, 22)}…</td>
            <td className="py-2 text-right"><StatusPill status={e.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
