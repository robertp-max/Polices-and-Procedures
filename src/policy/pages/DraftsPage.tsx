import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, FileText, ChevronRight } from 'lucide-react';
import { usePolicyStore } from '@/policy/stores/policyStore';
import { StatusBadge } from '@/policy/components/StatusBadge';

export function DraftsPage() {
  const policies = usePolicyStore(state => state.policies);
  const drafts = useMemo(
    () => policies.filter(p => p.lifecycleStatus === 'Draft' || p.lifecycleStatus === 'Revision Requested'),
    [policies],
  );

  return (
    <div className="flex-1 w-full h-full flex flex-col relative z-10 font-sans animate-in fade-in duration-500 overflow-y-auto custom-scrollbar p-8 md:p-12 lg:p-16">
      {/* HEADER */}
      <div className="mb-10">
        <h2 className="font-montserrat text-3xl font-extrabold text-white">Draft Workspace</h2>
        <p className="mt-3 font-roboto text-base text-white/60">
          Access and edit policies in Draft or Revision Requested status.
        </p>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Drafts', value: drafts.length, cls: 'text-[#00c2b4]' },
          { label: 'Revision Requested', value: drafts.filter(p => p.lifecycleStatus === 'Revision Requested').length, cls: 'text-[#C74600]' },
          { label: 'Pure Draft', value: drafts.filter(p => p.lifecycleStatus === 'Draft').length, cls: 'text-white' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="glass-interactive group border border-white/10 rounded-2xl p-8 cursor-default">
            <p className="mb-3 text-xs font-montserrat font-bold uppercase tracking-widest text-white/50 icon-interactive">{label}</p>
            <p className={`font-montserrat text-5xl font-extrabold icon-interactive ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* DRAFTS LIST */}
      <section className="border border-white/10 overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3 border-b border-white/5 px-8 py-5">
          <Edit3 size={18} className="text-white/50" />
          <p className="text-sm font-montserrat font-bold uppercase tracking-widest text-white/70">
            {drafts.length} polic{drafts.length !== 1 ? 'ies' : 'y'} ready to edit
          </p>
        </div>
        <div className="divide-y divide-white/5">
          {drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
              <FileText size={48} className="mb-4 text-white/20" />
              <p className="font-montserrat text-base font-bold text-white">No drafts available</p>
              <p className="mt-2 font-roboto text-sm text-white/60">All policies are in an approved or published state.</p>
            </div>
          ) : (
            drafts.map(policy => (
              <Link
                key={policy.id}
                to={`/drafts/${policy.id}`}
                className="group glass-interactive flex items-start gap-5 border-l-4 border-l-transparent px-8 py-6 transition-all hover:border-l-[#00c2b4]"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#00c2b4] group-hover:underline">{policy.id}</span>
                    <StatusBadge status={policy.lifecycleStatus} />
                    <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-montserrat font-bold uppercase tracking-wide text-white/70">
                      {policy.tier}
                    </span>
                  </div>
                  <p className="truncate font-roboto text-base font-semibold text-white">{policy.title}</p>
                  <p className="mt-1.5 truncate font-roboto text-sm text-white/60">
                    {policy.ownerSteward} · {policy.domainCode}-{policy.subdomainCode}
                  </p>
                </div>
                <ChevronRight size={20} className="mt-1 shrink-0 icon-interactive text-white/20" />
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

