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
      <div className="mb-12">
        <div className="text-[10px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.28em] mb-2">
          Authoring
        </div>
        <h2 className="font-outfit font-light text-white leading-tight" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>
          Draft Workspace
        </h2>
        <p className="mt-2 font-roboto text-[12px] text-white/55">
          Access and edit policies in Draft or Revision Requested status.
        </p>
      </div>

      {/* STATS ROW — flat on glass */}
      <div className="grid grid-cols-3 gap-10 mb-12">
        {[
          { label: 'Total Drafts', value: drafts.length, cls: 'text-[#FFC107]', accent: 'rgba(var(--ci-accent-rgb),0.45)' },
          { label: 'Revision Requested', value: drafts.filter(p => p.lifecycleStatus === 'Revision Requested').length, cls: 'text-[#C74600]', accent: 'rgba(199,70,0,0.45)' },
          { label: 'Pure Draft', value: drafts.filter(p => p.lifecycleStatus === 'Draft').length, cls: 'text-white', accent: 'rgba(255,255,255,0.28)' },
        ].map(({ label, value, cls, accent }) => (
          <div key={label} className="group pl-5" style={{ borderLeft: `2px solid ${accent}` }}>
            <p className="mb-3 text-[10.5px] font-montserrat font-bold uppercase tracking-[0.22em] text-white/55">{label}</p>
            <p className={`font-outfit text-5xl font-light leading-none ${cls}`} style={{ letterSpacing: '-0.015em' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* DRAFTS LIST — flat section, hairline header only */}
      <section>
        <div
          className="flex items-center gap-3 pb-3 mb-2"
          style={{ borderBottom: '1px solid rgba(var(--ci-accent-rgb),0.22)' }}
        >
          <Edit3 size={16} className="text-[#FFC107]/80" strokeWidth={1.75} />
          <p className="text-[12px] font-montserrat font-bold uppercase tracking-[0.18em] text-white/75">
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
                className="group flex items-start gap-5 border-l-2 border-l-transparent pl-5 pr-3 py-5 transition-all hover:border-l-[#FFC107] hover:bg-white/[0.02]"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#FFC107] group-hover:underline">{policy.id}</span>
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

