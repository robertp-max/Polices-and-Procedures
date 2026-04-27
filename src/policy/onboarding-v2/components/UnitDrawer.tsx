import { useState } from 'react';
import { X, Calendar, ShieldCheck } from 'lucide-react';
import type { OnboardingExecutionUnit } from '../types';
import { StatusPill } from './StatusPill';
import { PolicyVersionLink } from './PolicyVersionLink';
import { SignerStrip } from './SignerStrip';
import { EvidencePanel } from './EvidencePanel';
import { AuditTimeline } from './AuditTimeline';
import { useOnboardingV2Store } from '../store/onboardingV2Store';
import { PHASE_LABEL } from '../types';

interface Props {
  unit: OnboardingExecutionUnit;
  onClose: () => void;
}

type Tab = 'overview' | 'evidence' | 'signatures' | 'audit';

export function UnitDrawer({ unit, onClose }: Props) {
  const requirement = useOnboardingV2Store(s => s.snap.requirements.find(r => r.id === unit.requirementId));
  const evidence    = useOnboardingV2Store(s => s.evidenceForUnit(unit.id));
  const signatures  = useOnboardingV2Store(s => s.signaturesForUnit(unit.id));
  const audit       = useOnboardingV2Store(s => s.snap.audit.filter(a => a.unitId === unit.id));
  const signSignature = useOnboardingV2Store(s => s.signSignature);
  const declineSignature = useOnboardingV2Store(s => s.declineSignature);

  const [tab, setTab] = useState<Tab>('overview');

  if (!requirement) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-[760px] h-full bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] tabular-nums">
              {unit.id} · {PHASE_LABEL[unit.phase]}
            </div>
            <div className="text-[18px] font-semibold text-[#0B2545] truncate">{requirement.name}</div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <StatusPill status={unit.status} size="md" />
              {unit.dueAt && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#4B5563]">
                  <Calendar size={12} /> Due {new Date(unit.dueAt).toLocaleDateString()}
                </span>
              )}
              {requirement.policyRefs.map(p => <PolicyVersionLink key={`${p.policyId}-${p.policyVersion}`} policy={p} />)}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[#F2F4F7] text-[#4B5563]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-[#E5E7EB] flex items-center gap-1">
          {(['overview','evidence','signatures','audit'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2.5 text-[12px] font-semibold capitalize border-b-2 -mb-px transition ${
                tab === t ? 'border-[#E07B2C] text-[#0B2545]' : 'border-transparent text-[#4B5563] hover:text-[#0B2545]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'overview' && (
            <div className="space-y-5">
              <Section title="Description">
                <p className="text-[12px] leading-relaxed text-[#0B1220]">{requirement.description}</p>
              </Section>
              <Section title="Gate contributions">
                <div className="flex flex-wrap gap-2">
                  {requirement.gateContributions.map((g, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-[#BFD3EE] bg-[#E5EEF8] text-[#1E63B0] font-medium">
                      <ShieldCheck size={12} /> {g.gateId} · {g.weight}
                    </span>
                  ))}
                </div>
              </Section>
              {requirement.cadence && (
                <Section title="Cadence">
                  <div className="text-[12px] text-[#0B1220]">
                    <div>Initial requirement: <strong>{requirement.cadence.initial ? 'Yes' : 'No'}</strong></div>
                    {requirement.cadence.recurrence && (
                      <div className="mt-1">Recurrence: <strong>{requirement.cadence.recurrence.kind}</strong></div>
                    )}
                    {requirement.cadence.preExpiryWindowDays !== undefined && (
                      <div className="mt-1">Pre-expiry window: <strong>{requirement.cadence.preExpiryWindowDays} days</strong></div>
                    )}
                    <div className="mt-1">SLA: <strong>{requirement.slaDays} days</strong></div>
                  </div>
                </Section>
              )}
              {unit.dependencies.length > 0 && (
                <Section title="Pre-conditions">
                  <ul className="text-[12px] text-[#0B1220] list-disc pl-5 space-y-0.5">
                    {unit.dependencies.map((d, i) => (
                      <li key={i} className="font-mono text-[11px]">{d}</li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          )}
          {tab === 'evidence' && <EvidencePanel unit={unit} evidence={evidence} />}
          {tab === 'signatures' && (
            <SignerStrip
              signatures={signatures}
              onSign={(id) => signSignature(id)}
              onDecline={(id) => declineSignature(id, 'Declined by signer')}
            />
          )}
          {tab === 'audit' && <AuditTimeline events={audit} />}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">{title}</div>
      {children}
    </section>
  );
}
