import { useState } from 'react';
import { useFrameworkStore } from '@/policy/stores/frameworkStore';
import { usePolicyStore } from '@/policy/stores/policyStore';
import { computeDashboardMetrics } from '@/policy/utils/selectors';
import { Network, GitBranch, BookOpen, Activity, Shield } from 'lucide-react';

const TABS = [
  { id: 'hierarchy', label: 'System Hierarchy', icon: Network },
  { id: 'lifecycle', label: 'Governance Lifecycle', icon: GitBranch },
  { id: 'classification', label: 'Classification Dictionary', icon: BookOpen },
  { id: 'enforcement', label: 'Clinical Enforcement Engine', icon: Activity },
  { id: 'audit', label: 'Audit Defense System', icon: Shield },
];

export function GovernancePage() {
  const [activeTab, setActiveTab] = useState('hierarchy');
  const subdomains = useFrameworkStore(state => state.subdomains);
  const domains = useFrameworkStore(state => state.domains);
  const policies = usePolicyStore(state => state.policies);
  const metrics = computeDashboardMetrics(policies);

  return (
    <div className="h-full w-full flex flex-col relative z-10 font-sans animate-in fade-in duration-500 overflow-y-auto custom-scrollbar p-6 md:p-10">

      {/* Header */}
      <div className="mb-8">
        <div className="text-[10px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.28em] mb-2">
          Framework
        </div>
        <h1 className="font-outfit font-light text-white leading-tight" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>
          Governance &amp; Enterprise Control
        </h1>
        <p className="mt-2 text-[12px] text-white/55 font-roboto">
          System hierarchy, lifecycle controls, classification, and audit defense — traced end-to-end.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                glass-interactive flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-300
                font-montserrat font-bold text-xs uppercase tracking-widest border
                ${activeTab === tab.id
                  ? 'border-[#FFC107]/50 text-[#FFC107]'
                  : 'border-white/10 text-white/60 hover:border-[#FFC107]/30'
                }
              `}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'hierarchy' && (
          <div className="space-y-10">
            {/* Metrics — flat, directly on the single glass */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(metrics).map(([key, value]) => (
                <div
                  key={key}
                  className="group px-1 py-2"
                  style={{ borderLeft: '2px solid rgba(var(--ci-accent-rgb),0.35)' }}
                >
                  <p className="text-xs font-montserrat font-bold uppercase tracking-[0.18em] text-white/55 mb-3 pl-4">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="font-outfit text-5xl font-light text-[#FFC107] pl-4 leading-none" style={{ letterSpacing: '-0.015em' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Domains Overview — flat section with hairline header */}
            <section>
              <h3
                className="text-[13px] font-montserrat font-bold text-white uppercase tracking-[0.18em] pb-2 mb-5"
                style={{ borderBottom: '1px solid rgba(var(--ci-accent-rgb),0.22)' }}
              >
                Domain Architecture
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {domains.map(domain => {
                  const subdomainCount = subdomains.filter(s => s.domainCode === domain.code).length;
                  return (
                    <div
                      key={domain.code}
                      className="group cursor-pointer px-4 py-3 transition-colors border-l-2 border-l-white/10 hover:border-l-[#FFC107]"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <h4 className="text-sm font-montserrat font-bold text-white group-hover:text-[#FFC107] transition-colors tracking-[0.08em]">
                          {domain.code}
                        </h4>
                        <span className="text-[10px] font-montserrat font-bold text-white/40 uppercase tracking-[0.14em]">
                          {subdomainCount} Subdomains
                        </span>
                      </div>
                      <p className="text-xs text-white/65 font-roboto">{domain.name}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'lifecycle' && (
          <section>
            <h3
              className="text-[13px] font-montserrat font-bold text-white uppercase tracking-[0.18em] pb-2 mb-5"
              style={{ borderBottom: '1px solid rgba(var(--ci-accent-rgb),0.22)' }}
            >
              Policy Lifecycle Stages
            </h3>
            <div className="divide-y divide-white/5">
              {[
                { stage: 'DRAFT', desc: 'Initial policy development and authoring', count: 0, color: 'text-white/40' },
                { stage: 'REVIEW', desc: 'Under stakeholder review and validation', count: 244, color: 'text-[#FBBF24]' },
                { stage: 'APPROVED', desc: 'Approved by governing body', count: 0, color: 'text-[#FFC107]' },
                { stage: 'PUBLISHED', desc: 'Active and in effect', count: 0, color: 'text-[#10B981]' },
                { stage: 'ARCHIVED', desc: 'Superseded or retired', count: 0, color: 'text-white/40' },
              ].map(item => (
                <div key={item.stage} className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h4 className={`text-sm font-montserrat font-bold uppercase tracking-[0.18em] ${item.color} mb-1`}>
                      {item.stage}
                    </h4>
                    <p className="text-xs text-white/55 font-roboto">{item.desc}</p>
                  </div>
                  <span className="text-3xl font-outfit font-light text-white ml-4" style={{ letterSpacing: '-0.015em' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'classification' && (
          <section>
            <h3
              className="text-[13px] font-montserrat font-bold text-white uppercase tracking-[0.18em] pb-2 mb-5"
              style={{ borderBottom: '1px solid rgba(var(--ci-accent-rgb),0.22)' }}
            >
              Subdomain Classification & Rules
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4 text-xs font-montserrat font-bold text-white/55 uppercase tracking-[0.16em]">Subdomain</th>
                    <th className="py-3 px-4 text-xs font-montserrat font-bold text-white/55 uppercase tracking-[0.16em]">Owner / Steward</th>
                    <th className="py-3 px-4 text-xs font-montserrat font-bold text-white/55 uppercase tracking-[0.16em]">Review Cycle</th>
                    <th className="py-3 px-4 text-xs font-montserrat font-bold text-white/55 uppercase tracking-[0.16em]">Access Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {subdomains.map(item => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.025] transition-colors">
                      <td className="py-4 px-4 font-montserrat font-semibold text-white">{item.id} — {item.name}</td>
                      <td className="py-4 px-4 text-white/80 font-roboto">{item.ownerSteward}</td>
                      <td className="py-4 px-4 text-white/80 font-roboto">{item.reviewCycle}</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-montserrat font-bold border border-white/15 text-white/75 uppercase tracking-[0.14em]">
                          {item.accessTier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'enforcement' && (
          <section>
            <h3
              className="text-[13px] font-montserrat font-bold text-white uppercase tracking-[0.18em] pb-2 mb-5"
              style={{ borderBottom: '1px solid rgba(var(--ci-accent-rgb),0.22)' }}
            >
              Clinical Enforcement Rules
            </h3>
            <div className="space-y-1">
              {[
                { label: 'Documentation Completeness', desc: 'All clinical documentation must be completed within 24 hours of service delivery as per CMS requirements.' },
                { label: 'OASIS Accuracy',              desc: 'OASIS assessments must achieve 95% accuracy rate based on internal quality review audits.' },
                { label: 'Physician Orders',            desc: 'All physician orders must be signed and dated within 30 days of the start of care.' },
              ].map(rule => (
                <div key={rule.label} className="px-4 py-4 border-l-2 border-l-[#FFC107]/40 hover:border-l-[#FFC107] transition-colors">
                  <h4 className="text-[13px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.16em] mb-1.5">
                    {rule.label}
                  </h4>
                  <p className="text-[12px] text-white/60 font-roboto leading-relaxed">
                    {rule.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'audit' && (
          <section>
            <h3
              className="text-[13px] font-montserrat font-bold text-white uppercase tracking-[0.18em] pb-2 mb-5"
              style={{ borderBottom: '1px solid rgba(var(--ci-accent-rgb),0.22)' }}
            >
              Audit Readiness & Defense
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="pl-5 py-4" style={{ borderLeft: '2px solid rgba(var(--ci-accent-rgb),0.45)' }}>
                <Shield size={28} className="text-[#FFC107] mb-3" strokeWidth={1.5} />
                <h4 className="text-[13px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.16em] mb-2">
                  Audit Trail Integrity
                </h4>
                <p className="text-[12px] text-white/70 font-roboto mb-3 leading-relaxed">
                  All policy changes, approvals, and acknowledgments are logged with timestamp and user attribution.
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#FFC107]" style={{ boxShadow: '0 0 8px rgba(var(--ci-accent-rgb),0.75)' }} />
                  <span className="text-[10px] font-montserrat font-bold text-[#FFC107] uppercase tracking-[0.18em]">Active</span>
                </div>
              </div>

              <div className="pl-5 py-4" style={{ borderLeft: '2px solid rgba(255,142,82,0.45)' }}>
                <Activity size={28} className="text-[#ff8e52] mb-3" strokeWidth={1.5} />
                <h4 className="text-[13px] font-montserrat font-bold text-[#ff8e52] uppercase tracking-[0.16em] mb-2">
                  Real-Time Monitoring
                </h4>
                <p className="text-[12px] text-white/70 font-roboto mb-3 leading-relaxed">
                  Continuous compliance monitoring with automated alerts for regulatory threshold deviations.
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#ff8e52]" style={{ boxShadow: '0 0 8px rgba(255,142,82,0.75)' }} />
                  <span className="text-[10px] font-montserrat font-bold text-[#ff8e52] uppercase tracking-[0.18em]">Monitoring</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
