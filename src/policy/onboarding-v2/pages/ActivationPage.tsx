import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useOnboardingV2Store } from '../store/onboardingV2Store';
import type { RoleId, TriggerPayload, TriggerType } from '../types';
import { ROLES } from '../catalog/roles';
import { selectTemplate } from '../catalog/templates';
import { reconcile } from '../engine/reconciler';

function ReconcilePctBar({ suppressed, total }: { suppressed: number; total: number }) {
  const pct = Math.round((suppressed / Math.max(1, total)) * 100);
  // SVG bar avoids inline-style and aria-valuenow lint rules.
  return (
    <svg width="100%" height="6" className="mt-1" aria-label={`Reconciliation: ${suppressed} of ${total} suppressed`}>
      <rect x={0} y={0} width="100%" height={6} rx={3} fill="#F2F4F7" />
      <rect x={0} y={0} width={`${pct}%`} height={6} rx={3} fill="#1F8A4C" />
    </svg>
  );
}

const TRIGGERS: { id: TriggerType; label: string; hint: string }[] = [
  { id: 'NEW_HIRE',             label: 'New Hire',             hint: 'Initial onboarding for a new workforce member' },
  { id: 'ROLE_CHANGE',          label: 'Role Change',          hint: 'Promotion, lateral move, or expanded scope' },
  { id: 'ANNUAL_REVALIDATION',  label: 'Annual Revalidation',  hint: 'Repeat all annually-cadenced requirements' },
  { id: 'POLICY_VERSION_CHANGE',label: 'Policy Version Change',hint: 'Re-acknowledge a published policy version' },
  { id: 'VENDOR_ONBOARD',       label: 'Vendor Onboard',       hint: 'Onboard a Business Associate or 1099 vendor' },
];

export function ActivationPage() {
  const navigate = useNavigate();
  const snap = useOnboardingV2Store(s => s.snap);
  const ingest = useOnboardingV2Store(s => s.ingest);

  const [subjectId, setSubjectId] = useState<string>(snap.workforce[0]?.id ?? '');
  const [trigger, setTrigger] = useState<TriggerType>('NEW_HIRE');
  const [roleIds, setRoleIds] = useState<RoleId[]>(['RN']);

  const subject = snap.workforce.find(w => w.id === subjectId) ?? snap.vendors.find(v => v.id === subjectId);
  const subjectIsVendor = !!snap.vendors.find(v => v.id === subjectId);

  // Compute reconciliation preview
  const preview = useMemo(() => {
    if (subjectIsVendor || roleIds.length === 0) return null;
    const buckets = roleIds.map(role => {
      const tmpl = selectTemplate(role, trigger);
      if (!tmpl) return { role, total: 0, suppressed: 0, emit: 0 };
      const reqs = tmpl.requirementIds
        .map(id => snap.requirements.find(r => r.id === id))
        .filter((r): r is NonNullable<typeof r> => !!r);
      const reconciled = reqs.map(r => reconcile(snap, subjectId, r, new Date().toISOString()));
      const suppressed = reconciled.filter(x => x.suppress).length;
      return { role, total: reqs.length, suppressed, emit: reqs.length - suppressed };
    });
    return buckets;
  }, [subjectId, roleIds, trigger, snap, subjectIsVendor]);

  function handleActivate() {
    let payload: TriggerPayload;
    const now = new Date().toISOString();
    if (subjectIsVendor) {
      payload = { type: 'VENDOR_ONBOARD', subjectId, vendorType: 'BA', effectiveDate: now };
    } else if (trigger === 'ROLE_CHANGE') {
      const prior = subject ? ((subject as { roleIds?: RoleId[] }).roleIds ?? []) : [];
      payload = { type: 'ROLE_CHANGE', subjectId, priorRoleIds: prior, newRoleIds: roleIds, effectiveDate: now };
    } else if (trigger === 'POLICY_VERSION_CHANGE') {
      payload = { type: 'POLICY_VERSION_CHANGE', policyId: 'IT-HIPAA-PRIVACY', newVersion: '2026.01', affectedRoles: roleIds };
    } else if (trigger === 'ANNUAL_REVALIDATION') {
      const requirementIds = roleIds.flatMap(r => selectTemplate(r, 'ANNUAL_REVALIDATION')?.requirementIds ?? []);
      payload = { type: 'ANNUAL_REVALIDATION', subjectId, requirementIds, period: new Date().getFullYear().toString() };
    } else {
      const branchId = (subject as { branchId?: string } | undefined)?.branchId ?? 'BR-MAIN';
      payload = { type: 'NEW_HIRE', subjectId, roleIds, branchId, effectiveDate: now };
    }
    ingest(payload);
    navigate('/onboarding-v2/dashboard');
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <header>
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">Onboarding v2</div>
        <h1 className="text-[22px] font-semibold text-[#0B2545]">Activate Subject</h1>
        <p className="text-[12px] text-[#4B5563] mt-1 max-w-2xl">
          Activation ingests a deterministic trigger (NEW_HIRE, ROLE_CHANGE, ANNUAL_REVALIDATION, POLICY_VERSION_UPDATE, VENDOR_ONBOARD) and emits a single execution batch with reconciled requirements.
        </p>
      </header>

      <section className="grid grid-cols-12 gap-5">
        {/* Subject + trigger */}
        <div className="col-span-7 space-y-5">
          <div className="border border-[#E5E7EB] rounded-[10px] bg-white p-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">Subject</h2>
            <select
              title="Select subject"
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="w-full text-[12px] border border-[#E5E7EB] rounded-md px-3 py-2 bg-white"
            >
              <optgroup label="Workforce">
                {snap.workforce.map(w => (
                  <option key={w.id} value={w.id}>{w.legalName} · {w.primaryRoleId} ({w.id})</option>
                ))}
              </optgroup>
              <optgroup label="Vendors">
                {snap.vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.legalName} · {v.vendorType} ({v.id})</option>
                ))}
              </optgroup>
            </select>
            {subject && !subjectIsVendor && (
              <div className="mt-3 text-[11px] text-[#4B5563]">
                Hire date: {new Date((subject as { hireDate: string }).hireDate).toLocaleDateString()} ·
                Status: <strong>{(subject as { status: string }).status}</strong>
              </div>
            )}
          </div>

          <div className="border border-[#E5E7EB] rounded-[10px] bg-white p-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">Trigger type</h2>
            <div className="grid grid-cols-2 gap-2">
              {TRIGGERS.map(t => (
                <label key={t.id} className={`border rounded-md p-3 cursor-pointer transition ${
                  trigger === t.id ? 'border-[#0B2545] bg-[#F2F5FA]' : 'border-[#E5E7EB] hover:bg-[#F7F8FA]'
                }`}>
                  <div className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="trigger"
                      checked={trigger === t.id}
                      onChange={() => setTrigger(t.id)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-[12px] font-semibold text-[#0B2545]">{t.label}</div>
                      <div className="text-[11px] text-[#4B5563]">{t.hint}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {!subjectIsVendor && (
            <div className="border border-[#E5E7EB] rounded-[10px] bg-white p-4">
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">Roles</h2>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => {
                  const active = roleIds.includes(r.id);
                  return (
                    <label key={r.id} className={`border rounded-md p-2 cursor-pointer text-[11px] flex items-center gap-2 transition ${
                      active ? 'border-[#0B2545] bg-[#F2F5FA] text-[#0B2545]' : 'border-[#E5E7EB] text-[#4B5563] hover:bg-[#F7F8FA]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => {
                          if (e.target.checked) setRoleIds(prev => [...prev, r.id]);
                          else setRoleIds(prev => prev.filter(x => x !== r.id));
                        }}
                      />
                      <span className="font-medium">{r.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Preview + activate */}
        <aside className="col-span-5 space-y-5">
          <div className="border border-[#E5E7EB] rounded-[10px] bg-white p-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] mb-3">Reconciliation preview</h2>
            {subjectIsVendor && (
              <div className="text-[12px] text-[#0B1220]">
                Vendor onboarding emits the BA agreement template ({trigger}). No role-based reconciliation applies.
              </div>
            )}
            {!subjectIsVendor && preview && preview.map(b => (
              <div key={b.role} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between text-[12px] font-semibold text-[#0B2545]">
                  <span>{b.role}</span>
                  <span className="tabular-nums">{b.emit}/{b.total} new units</span>
                </div>
                <ReconcilePctBar suppressed={b.suppressed} total={b.total} />
                <div className="mt-1 text-[10px] text-[#4B5563] flex items-center gap-3">
                  <span><CheckCircle2 size={10} className="inline mr-0.5 text-[#1F8A4C]" /> {b.suppressed} suppressed (already valid)</span>
                  <span><Sparkles size={10} className="inline mr-0.5 text-[#E07B2C]" /> {b.emit} to emit</span>
                </div>
              </div>
            ))}
            {!subjectIsVendor && preview?.every(b => b.total === 0) && (
              <div className="text-[12px] text-[#B45309] flex items-center gap-2">
                <AlertCircle size={14} /> No template found for this role × trigger.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleActivate}
            disabled={!subjectId}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-[#E07B2C] text-white font-semibold text-[13px] hover:bg-[#C56B22] disabled:bg-[#9CA3AF]"
          >
            <Sparkles size={16} /> Activate &amp; create batch
          </button>

          <div className="text-[10px] text-[#6B7280] leading-snug">
            Activation is hash-chained, idempotent, and recorded as <code>TRIGGER_RECEIVED</code> +
            <code> BATCH_CREATED</code> + <code>REQUIREMENT_EMITTED</code> in the immutable audit log.
          </div>
        </aside>
      </section>
    </div>
  );
}
