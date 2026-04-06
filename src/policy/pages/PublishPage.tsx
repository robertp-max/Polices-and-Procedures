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
        <h2 className="text-3xl font-bold text-white">Publish Center</h2>
        <p className="mt-3 text-base text-white/60">Queue approved policies for publication to print, Google Drive, or SCORM</p>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-base text-emerald-300 mb-8">
          ✓ {message}
        </div>
      )}

      <section className="border border-white/10 rounded-2xl mb-8">
        <div className="border-b border-white/5 px-8 py-6">
          <h3 className="font-semibold text-white text-xl">Approved Policies ({approvedPolicies.length})</h3>
        </div>
        <div className="divide-y divide-white/5">
          {approvedPolicies.length === 0 ? (
            <div className="px-8 py-12 text-center text-base text-white/60">No approved policies available for publish.</div>
          ) : (
            approvedPolicies.map(policy => (
              <div key={policy.id} className="px-8 py-6">
                <div className="font-semibold text-white text-lg">{policy.id} - {policy.title}</div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" className="glass-interactive rounded-xl px-5 py-3 text-base font-montserrat font-bold text-[#00c2b4] border border-[#00c2b4]/30 disabled:opacity-30" onClick={() => queue(policy.id, 'Print')} disabled={isAuditorMode}>🖨️ Queue Print</button>
                  <button type="button" className="glass-interactive rounded-xl px-5 py-3 text-base font-montserrat font-bold text-[#ff8e52] border border-[#ff8e52]/30 disabled:opacity-30" onClick={() => queue(policy.id, 'Google Drive')} disabled={isAuditorMode}>☁️ Queue Drive</button>
                  <button type="button" className="glass-interactive rounded-xl px-5 py-3 text-base font-montserrat font-bold text-white/60 border border-white/10 disabled:opacity-30" onClick={() => queue(policy.id, 'SCORM')} disabled={isAuditorMode}>📚 Queue SCORM</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="border border-white/10 rounded-2xl">
        <div className="border-b border-white/5 px-8 py-6">
          <h3 className="font-semibold text-white text-xl">Publish Jobs ({publishJobs.length})</h3>
        </div>
        <div className="divide-y divide-white/5">
          {publishJobs.length === 0 ? (
            <div className="px-8 py-12 text-center text-base text-white/60">No jobs queued yet.</div>
          ) : (
            publishJobs.map(job => (
              <div key={job.id} className="px-8 py-5 text-base">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono font-semibold text-white">{job.id}</p>
                    <p className="mt-2 text-sm text-white/60">{job.policyId} → {job.target}</p>
                  </div>
                  <span className={`inline-block rounded-lg px-4 py-2 text-sm font-montserrat font-bold border ${
                    job.status === 'Queued' ? 'bg-white/5 border-white/20 text-white/60' : 'bg-white/5 border-white/10 text-white/40'
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
