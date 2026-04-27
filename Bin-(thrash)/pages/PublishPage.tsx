import { useMemo, useState } from 'react';
import { useAuditorModeStore } from '@/policy/stores/auditorModeStore';
import { usePolicyStore } from '@/policy/stores/policyStore';

export function PublishPage() {
  const [message, setMessage] = useState('');
  const isAuditorMode = useAuditorModeStore(state => state.enabled);
  const policies = usePolicyStore(state => state.policies);
  const approvedPolicies = useMemo(
    () => policies.filter(policy => policy.lifecycleStatus === 'Approved'),
    [policies],
  );
  const publishJobs = usePolicyStore(state => state.publishJobs);
  const createPublishJob = usePolicyStore(state => state.createPublishJob);

  function queue(policyId: string, target: 'Print' | 'Google Drive' | 'SCORM') {
    const result = createPublishJob(policyId, target, 'Publisher');
    setMessage(result.message);
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col relative z-10 font-sans animate-in fade-in duration-500 overflow-y-auto custom-scrollbar p-8 md:p-12 lg:p-16">
      <div className="mb-10">
        <div className="text-[10px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.28em] mb-2">
          Distribution
        </div>
        <h2 className="font-outfit font-light text-white leading-tight" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>Publish Center</h2>
        <p className="mt-2 text-[12px] text-white/55 font-roboto">Queue approved policies for publication to print, Google Drive, or SCORM.</p>
      </div>

      {message && (
        <div className="mb-8 pl-4 py-3 text-[12.5px] text-emerald-300 font-roboto" style={{ borderLeft: '2px solid rgba(16,185,129,0.55)' }}>
          ✓ {message}
        </div>
      )}

      <section className="mb-12">
        <div
          className="pb-3 mb-2"
          style={{ borderBottom: '1px solid rgba(var(--ci-accent-rgb),0.22)' }}
        >
          <h3 className="font-montserrat font-bold text-white text-[13px] uppercase tracking-[0.18em]">
            Approved Policies ({approvedPolicies.length})
          </h3>
        </div>
        <div className="divide-y divide-white/5">
          {approvedPolicies.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-white/55 font-roboto">No approved policies available for publish.</div>
          ) : (
            approvedPolicies.map(policy => (
              <div key={policy.id} className="py-5 pl-5 border-l-2 border-l-transparent hover:border-l-[#FFC107]/60 transition-colors">
                <div className="font-montserrat font-bold text-white text-[14px] tracking-[0.03em]">{policy.id} — {policy.title}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="glass-interactive rounded-full px-4 py-2 text-[11px] font-montserrat font-bold uppercase tracking-[0.16em] text-[#FFC107] border border-[#FFC107]/35 disabled:opacity-30" onClick={() => queue(policy.id, 'Print')} disabled={isAuditorMode}>Queue Print</button>
                  <button type="button" className="glass-interactive rounded-full px-4 py-2 text-[11px] font-montserrat font-bold uppercase tracking-[0.16em] text-[#ff8e52] border border-[#ff8e52]/35 disabled:opacity-30" onClick={() => queue(policy.id, 'Google Drive')} disabled={isAuditorMode}>Queue Drive</button>
                  <button type="button" className="glass-interactive rounded-full px-4 py-2 text-[11px] font-montserrat font-bold uppercase tracking-[0.16em] text-white/70 border border-white/15 disabled:opacity-30" onClick={() => queue(policy.id, 'SCORM')} disabled={isAuditorMode}>Queue SCORM</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <div
          className="pb-3 mb-2"
          style={{ borderBottom: '1px solid rgba(var(--ci-accent-rgb),0.22)' }}
        >
          <h3 className="font-montserrat font-bold text-white text-[13px] uppercase tracking-[0.18em]">
            Publish Jobs ({publishJobs.length})
          </h3>
        </div>
        <div className="divide-y divide-white/5">
          {publishJobs.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-white/55 font-roboto">No jobs queued yet.</div>
          ) : (
            publishJobs.map(job => (
              <div key={job.id} className="py-4 pl-5 border-l-2 border-l-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono-jb font-bold text-white text-[12.5px] tracking-wide">{job.id}</p>
                    <p className="mt-1 text-[11px] text-white/55 font-roboto">{job.policyId} → {job.target}</p>
                  </div>
                  <span className={`inline-block rounded-full px-3 py-1 text-[10.5px] font-montserrat font-bold uppercase tracking-[0.16em] border ${
                    job.status === 'Queued' ? 'border-white/20 text-white/70' : 'border-white/10 text-white/40'
                  }`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
