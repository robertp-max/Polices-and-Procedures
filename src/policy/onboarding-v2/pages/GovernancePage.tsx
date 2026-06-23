import { useState } from 'react';
import { ShieldOff, ShieldCheck, Building2 } from 'lucide-react';
import { useOnboardingV2Store } from '../store/onboardingV2Store';
import { StatusPill } from '../components/StatusPill';
import { POL } from '../catalog/policies';
import { PolicyVersionLink } from '../components/PolicyVersionLink';
import { PageHeader } from '@/policy/components/ui/PageHeader';
import { SurfaceCard } from '@/policy/components/ui/SurfaceCard';

const GATES = ['FieldClearance','BillingClearance','SystemAccessClearance','VendorEngagement','GovernanceActive'] as const;

export function GovernancePage() {
  const snap = useOnboardingV2Store(s => s.snap);
  const requestOverride = useOnboardingV2Store(s => s.requestOverride);

  const [subjectId, setSubjectId] = useState<string>(snap.workforce[0]?.id ?? '');
  const [gateId, setGateId] = useState<string>(GATES[0]);
  const [reason, setReason] = useState('');
  const [validDays, setValidDays] = useState(30);

  function submit() {
    if (!subjectId || !reason.trim()) return;
    requestOverride(subjectId, gateId, reason.trim(), validDays);
    setReason('');
  }

  return (
    <div className="p-5 md:p-6 space-y-5 overflow-y-auto h-full">
      <PageHeader
        eyebrow="ONBOARDING V2"
        title="Governance"
        description="Vendor agreements, policy bindings, and compliance overrides. Overrides require dual signature (Compliance Officer + Administrator) and convert a Failing gate into Conditional; the breach itself is preserved in the chain."
      />

      <SurfaceCard padding="lg" className="grid grid-cols-12 gap-5">
        {/* Override request */}
        <div className="col-span-12 lg:col-span-7 border border-[var(--v3-border-subtle)] rounded-[10px] p-5 bg-[var(--v3-surface-elevated)]">
          <div className="flex items-center gap-2 mb-4">
            <ShieldOff size={16} className="text-[#B45309]" />
            <h2 className="text-[13px] font-semibold text-[#0B2545]">Request override</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] text-[#4B5563]">Subject</span>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="mt-1 w-full text-[12px] border border-[#E5E7EB] rounded-md px-2 py-1.5 bg-white">
                <optgroup label="Workforce">
                  {snap.workforce.map(w => <option key={w.id} value={w.id}>{w.legalName}</option>)}
                </optgroup>
                <optgroup label="Vendors">
                  {snap.vendors.map(v => <option key={v.id} value={v.id}>{v.legalName}</option>)}
                </optgroup>
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] text-[#4B5563]">Gate</span>
              <select value={gateId} onChange={e => setGateId(e.target.value)} className="mt-1 w-full text-[12px] border border-[#E5E7EB] rounded-md px-2 py-1.5 bg-white">
                {GATES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="block col-span-2">
              <span className="text-[11px] text-[#4B5563]">Reason (becomes part of the audit record)</span>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder="e.g., License PSV pending state board verification; mitigated by direct supervisor co-signature for 14 days."
                className="mt-1 w-full text-[12px] border border-[#E5E7EB] rounded-md px-2 py-1.5 bg-white"
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-[#4B5563]">Valid for (days)</span>
              <input
                type="number"
                min={1}
                max={180}
                value={validDays}
                onChange={e => setValidDays(parseInt(e.target.value || '0', 10) || 1)}
                className="mt-1 w-full text-[12px] border border-[#E5E7EB] rounded-md px-2 py-1.5 bg-white tabular-nums"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-[10px] text-[#6B7280]">Submitting acts as dual signature in this preview build.</div>
            <button
              onClick={submit}
              disabled={!reason.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#B45309] text-white font-semibold text-[12px] hover:bg-[#92400E] disabled:bg-[#9CA3AF]"
            >
              <ShieldCheck size={14} /> Grant override
            </button>
          </div>
        </div>

        {/* Active overrides */}
        <div className="col-span-5 border border-[#E5E7EB] rounded-[10px] bg-white p-4">
          <h2 className="text-[13px] font-semibold text-[#0B2545] mb-3">Active overrides</h2>
          {snap.overrides.length === 0 ? (
            <div className="text-[12px] text-[#6B7280] italic">No overrides on file.</div>
          ) : (
            <ul className="divide-y divide-[#E5E7EB]">
              {snap.overrides.map(o => (
                <li key={o.id} className="py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[12px] font-semibold text-[#0B2545]">{o.subjectId} · {o.gateOrRuleId}</div>
                    <StatusPill status={o.status === 'Active' ? 'InProgress' : 'Suppressed'} />
                  </div>
                  <div className="text-[11px] text-[#0B1220] mt-1">{o.reason}</div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5 tabular-nums">
                    {new Date(o.validFrom).toLocaleDateString()} → {new Date(o.validTo).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SurfaceCard>

      {/* Vendors + policy bindings */}
      <section className="grid grid-cols-12 gap-5">
        <div className="col-span-7 border border-[#E5E7EB] rounded-[10px] bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-[#13355E]" />
            <h2 className="text-[13px] font-semibold text-[#0B2545]">Vendors</h2>
          </div>
          <table className="w-full text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[#6B7280]">
              <tr><th className="text-left py-1.5">Vendor</th><th className="text-left py-1.5">Type</th><th className="text-left py-1.5">Contact</th><th className="text-right py-1.5">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {snap.vendors.map(v => (
                <tr key={v.id}>
                  <td className="py-2 font-medium text-[#0B1220]">{v.legalName}</td>
                  <td className="py-2 text-[#4B5563]">{v.vendorType}</td>
                  <td className="py-2 text-[#4B5563]">{v.primaryContactName}<br/><span className="text-[10px] text-[#6B7280]">{v.primaryContactEmail}</span></td>
                  <td className="py-2 text-right"><StatusPill status={v.status === 'Active' ? 'Completed' : 'AwaitingSignature'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-5 border border-[#E5E7EB] rounded-[10px] bg-white p-4">
          <h2 className="text-[13px] font-semibold text-[#0B2545] mb-3">Policy bindings</h2>
          <div className="text-[11px] text-[#4B5563] mb-2">Every requirement is bound to one or more published policy versions with content-hash integrity.</div>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(POL).map(p => <PolicyVersionLink key={`${p.policyId}-${p.policyVersion}`} policy={p} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
