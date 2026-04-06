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
      <div className="mb-6">
        <div className="text-xs font-montserrat font-bold text-[#00c2b4] uppercase tracking-widest mb-2">
          FRAMEWORK
        </div>
        <h1 className="text-2xl font-montserrat font-bold text-white leading-none mb-2">
          CONTEXT: FRAMEWORK
        </h1>
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
                  ? 'border-[#00c2b4]/50 text-[#00c2b4]'
                  : 'border-white/10 text-white/60 hover:border-[#00c2b4]/30'
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
          <div className="space-y-6">
            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(metrics).map(([key, value]) => (
                <div key={key} className="glass-interactive group border border-white/10 rounded-2xl p-6">
                  <p className="icon-interactive text-xs font-montserrat font-bold uppercase tracking-widest text-white/50 mb-4">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="font-montserrat text-5xl font-light text-[#00c2b4]">{value}</p>
                </div>
              ))}
            </div>

            {/* Domains Overview */}
            <div className="border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-montserrat font-bold text-white mb-6">Domain Architecture</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domains.map(domain => {
                  const subdomainCount = subdomains.filter(s => s.domainCode === domain.code).length;
                  return (
                    <div
                      key={domain.code}
                      className="glass-interactive group border border-white/10 rounded-xl p-4 hover:border-[#00c2b4]/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-montserrat font-bold text-white group-hover:text-[#00c2b4] transition-colors">
                          {domain.code}
                        </h4>
                        <span className="text-xs font-montserrat font-bold text-white/40">
                          {subdomainCount} Subdomains
                        </span>
                      </div>
                      <p className="text-xs text-white/70 font-roboto">{domain.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lifecycle' && (
          <div className="border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-montserrat font-bold text-white mb-6">Policy Lifecycle Stages</h3>
            <div className="space-y-4">
              {[
                { stage: 'DRAFT', desc: 'Initial policy development and authoring', count: 0, color: 'text-white/40' },
                { stage: 'REVIEW', desc: 'Under stakeholder review and validation', count: 244, color: 'text-[#FBBF24]' },
                { stage: 'APPROVED', desc: 'Approved by governing body', count: 0, color: 'text-[#00c2b4]' },
                { stage: 'PUBLISHED', desc: 'Active and in effect', count: 0, color: 'text-[#10B981]' },
                { stage: 'ARCHIVED', desc: 'Superseded or retired', count: 0, color: 'text-white/40' },
              ].map(item => (
                <div key={item.stage} className="flex items-center justify-between py-4 border-b border-white/5 last:border-b-0">
                  <div className="flex-1">
                    <h4 className={`text-sm font-montserrat font-bold uppercase tracking-widest ${item.color} mb-1`}>
                      {item.stage}
                    </h4>
                    <p className="text-xs text-white/60 font-roboto">{item.desc}</p>
                  </div>
                  <span className="text-3xl font-montserrat font-light text-white ml-4">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'classification' && (
          <div className="border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-montserrat font-bold text-white mb-6">Subdomain Classification & Rules</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4 text-xs font-montserrat font-bold text-white/60 uppercase tracking-widest">Subdomain</th>
                    <th className="py-3 px-4 text-xs font-montserrat font-bold text-white/60 uppercase tracking-widest">Owner / Steward</th>
                    <th className="py-3 px-4 text-xs font-montserrat font-bold text-white/60 uppercase tracking-widest">Review Cycle</th>
                    <th className="py-3 px-4 text-xs font-montserrat font-bold text-white/60 uppercase tracking-widest">Access Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {subdomains.map(item => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-montserrat font-semibold text-white">{item.id} — {item.name}</td>
                      <td className="py-4 px-4 text-white/80 font-roboto">{item.ownerSteward}</td>
                      <td className="py-4 px-4 text-white/80 font-roboto">{item.reviewCycle}</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-montserrat font-bold bg-white/10 border border-white/20 text-white/80 uppercase">
                          {item.accessTier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'enforcement' && (
          <div className="border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-montserrat font-bold text-white mb-6">Clinical Enforcement Rules</h3>
            <div className="space-y-4">
              <div className="glass-interactive group border border-white/10 rounded-xl p-4">
                <h4 className="text-sm font-montserrat font-bold text-[#00c2b4] uppercase tracking-widest mb-2 icon-interactive">
                  Documentation Completeness
                </h4>
                <p className="text-xs text-white/50 font-roboto">
                  All clinical documentation must be completed within 24 hours of service delivery as per CMS requirements.
                </p>
              </div>
              <div className="glass-interactive group border border-white/10 rounded-xl p-4">
                <h4 className="text-sm font-montserrat font-bold text-[#00c2b4] uppercase tracking-widest mb-2 icon-interactive">
                  OASIS Accuracy
                </h4>
                <p className="text-xs text-white/50 font-roboto">
                  OASIS assessments must achieve 95% accuracy rate based on internal quality review audits.
                </p>
              </div>
              <div className="glass-interactive group border border-white/10 rounded-xl p-4">
                <h4 className="text-sm font-montserrat font-bold text-[#00c2b4] uppercase tracking-widest mb-2 icon-interactive">
                  Physician Orders
                </h4>
                <p className="text-xs text-white/50 font-roboto">
                  All physician orders must be signed and dated within 30 days of the start of care.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-montserrat font-bold text-white mb-6">Audit Readiness & Defense</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[#00c2b4]/20 rounded-xl p-6">
                <Shield size={32} className="text-[#00c2b4] mb-4" />
                <h4 className="text-sm font-montserrat font-bold text-[#00c2b4] uppercase tracking-widest mb-2">
                  Audit Trail Integrity
                </h4>
                <p className="text-xs text-white/70 font-roboto mb-4">
                  All policy changes, approvals, and acknowledgments are logged with timestamp and user attribution.
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#00c2b4]"></div>
                  <span className="text-xs font-montserrat font-bold text-[#00c2b4]">Active</span>
                </div>
              </div>

              <div className="border border-[#ff8e52]/20 rounded-xl p-6">
                <Activity size={32} className="text-[#ff8e52] mb-4" />
                <h4 className="text-sm font-montserrat font-bold text-[#ff8e52] uppercase tracking-widest mb-2">
                  Real-Time Monitoring
                </h4>
                <p className="text-xs text-white/70 font-roboto mb-4">
                  Continuous compliance monitoring with automated alerts for regulatory threshold deviations.
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#ff8e52]"></div>
                  <span className="text-xs font-montserrat font-bold text-[#ff8e52]">Monitoring</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
