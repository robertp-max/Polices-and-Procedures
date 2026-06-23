import { useState } from 'react';
import { useFrameworkStore } from '@/policy/stores/frameworkStore';
import { usePolicyStore } from '@/policy/stores/policyStore';
import { computeDashboardMetrics } from '@/policy/utils/selectors';
import { Network, GitBranch, BookOpen, Activity, Shield } from 'lucide-react';
import { PageHeader } from '@/policy/components/ui/PageHeader';
import { SurfaceCard } from '@/policy/components/ui/SurfaceCard';
import { Tabs } from '@/policy/components/ui/Tabs';
import { SectionHeader } from '@/policy/components/ui/SectionHeader';
import { StatusPill } from '@/policy/components/ui';

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

  // Map for Tabs component (premium segmented/underline)
  const tabItems = TABS.map(tab => ({
    id: tab.id,
    label: (
      <span className="inline-flex items-center gap-1.5">
        <tab.icon size={14} />
        {tab.label}
      </span>
    ),
  }));

  return (
    <div className="h-full w-full flex flex-col relative z-10 font-sans animate-in fade-in duration-500 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-10">
      <PageHeader
        eyebrow="FRAMEWORK"
        title="Governance & Enterprise Control"
        description="System hierarchy, lifecycle controls, classification dictionary, and audit defense — traced end-to-end for compliance and operational excellence."
      />

      {/* Premium tabs using shared Tabs component with intuitive filtering/hierarchy */}
      <div className="mb-6">
        <Tabs
          items={tabItems}
          value={activeTab}
          onChange={(id) => setActiveTab(id)}
          variant="underline"
          ariaLabel="Governance sections"
        />
      </div>

      {/* Tab Content — premium cards, pills, hierarchy, clean spacing per design reference */}
      <div className="flex-1 space-y-6">
        {activeTab === 'hierarchy' && (
          <>
            {/* KPI Metrics — clean corporate cards with subtle hierarchy */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(metrics).map(([key, value]) => (
                <SurfaceCard key={key} padding="md" className="border-l-2 border-l-[var(--brand-primary,#00797D)]/70">
                  <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.22em] text-[var(--v3-text-tertiary)] mb-2">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="font-montserrat text-4xl font-semibold tracking-[-0.02em] text-[var(--brand-primary,#00797D)] leading-none">
                    {value}
                  </div>
                </SurfaceCard>
              ))}
            </div>

            {/* Domain Hierarchy */}
            <SurfaceCard padding="lg">
              <SectionHeader
                eyebrow="ARCHITECTURE"
                title="Domain Architecture"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {domains.map(domain => {
                  const subdomainCount = subdomains.filter(s => s.domainCode === domain.code).length;
                  return (
                    <div
                      key={domain.code}
                      className="group px-4 py-3.5 rounded-lg border border-[var(--v3-border-subtle)] hover:border-[var(--brand-primary,#00797D)]/40 transition-all flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-montserrat text-sm font-semibold tracking-[0.06em] text-[var(--v3-text-primary)] group-hover:text-[var(--brand-primary,#00797D)]">
                          {domain.code}
                        </div>
                        <span className="text-[10px] font-montserrat font-semibold uppercase tracking-[0.14em] text-[var(--v3-text-tertiary)]">
                          {subdomainCount} Subdomains
                        </span>
                      </div>
                      <p className="text-xs text-[var(--v3-text-secondary)] font-roboto mt-auto">{domain.name}</p>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>
          </>
        )}

        {activeTab === 'lifecycle' && (
          <SurfaceCard padding="lg">
            <SectionHeader
              eyebrow="LIFECYCLE"
              title="Policy Lifecycle Stages"
            />
            <div className="divide-y divide-[var(--v3-border-subtle)] mt-3">
              {[
                { stage: 'DRAFT', desc: 'Initial policy development and authoring', count: 0, tone: 'muted' as const },
                { stage: 'REVIEW', desc: 'Under stakeholder review and validation', count: 244, tone: 'warning' as const },
                { stage: 'APPROVED', desc: 'Approved by governing body', count: 0, tone: 'teal' as const },
                { stage: 'PUBLISHED', desc: 'Active and in effect', count: 0, tone: 'success' as const },
                { stage: 'ARCHIVED', desc: 'Superseded or retired', count: 0, tone: 'muted' as const },
              ].map(item => (
                <div key={item.stage} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-montserrat text-sm font-semibold uppercase tracking-[0.18em] text-[var(--v3-text-primary)] mb-0.5">
                      {item.stage}
                    </div>
                    <p className="text-xs text-[var(--v3-text-secondary)] font-roboto pr-4">{item.desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-montserrat text-3xl font-light tracking-[-0.02em] text-[var(--v3-text-primary)]">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        )}

        {activeTab === 'classification' && (
          <SurfaceCard padding="lg">
            <SectionHeader
              eyebrow="CLASSIFICATION"
              title="Subdomain Classification & Rules"
            />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--v3-border-subtle)]">
                    <th className="py-2.5 px-3 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em] text-[var(--v3-text-tertiary)]">Subdomain</th>
                    <th className="py-2.5 px-3 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em] text-[var(--v3-text-tertiary)]">Owner / Steward</th>
                    <th className="py-2.5 px-3 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em] text-[var(--v3-text-tertiary)]">Review Cycle</th>
                    <th className="py-2.5 px-3 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em] text-[var(--v3-text-tertiary)]">Access Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--v3-border-subtle)]">
                  {subdomains.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-3 px-3 font-montserrat font-semibold text-[var(--v3-text-primary)]">{item.id} — {item.name}</td>
                      <td className="py-3 px-3 text-[var(--v3-text-secondary)] font-roboto">{item.ownerSteward}</td>
                      <td className="py-3 px-3 text-[var(--v3-text-secondary)] font-roboto">{item.reviewCycle}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-montserrat font-bold border border-[var(--v3-border-subtle)] text-[var(--v3-text-primary)] uppercase tracking-[0.12em]">
                          {item.accessTier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>
        )}

        {activeTab === 'enforcement' && (
          <SurfaceCard padding="lg">
            <SectionHeader
              eyebrow="ENFORCEMENT"
              title="Clinical Enforcement Rules"
            />
            <div className="mt-3 space-y-3">
              {[
                { label: 'Documentation Completeness', desc: 'All clinical documentation must be completed within 24 hours of service delivery as per CMS requirements.' },
                { label: 'OASIS Accuracy', desc: 'OASIS assessments must achieve 95% accuracy rate based on internal quality review audits.' },
                { label: 'Physician Orders', desc: 'All physician orders must be signed and dated within 30 days of the start of care.' },
              ].map((rule, idx) => (
                <div key={idx} className="pl-4 py-3 border-l-2 border-[var(--brand-primary,#00797D)]/60 hover:border-[var(--brand-primary,#00797D)] transition-colors">
                  <div className="text-[13px] font-montserrat font-semibold uppercase tracking-[0.14em] text-[var(--v3-text-primary)] mb-1">{rule.label}</div>
                  <p className="text-[12px] text-[var(--v3-text-secondary)] font-roboto leading-relaxed">{rule.desc}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        )}

        {activeTab === 'audit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SurfaceCard padding="lg">
              <div className="flex items-center gap-3 mb-3">
                <Shield size={20} className="text-[var(--brand-primary,#00797D)]" />
                <div className="font-montserrat text-sm font-semibold uppercase tracking-[0.16em]">Audit Trail Integrity</div>
              </div>
              <p className="text-[12px] text-[var(--v3-text-secondary)] font-roboto mb-3 leading-relaxed">
                All policy changes, approvals, and acknowledgments are logged with timestamp and user attribution.
              </p>
              <StatusPill tone="teal">Active</StatusPill>
            </SurfaceCard>

            <SurfaceCard padding="lg">
              <div className="flex items-center gap-3 mb-3">
                <Activity size={20} className="text-[var(--brand-orange,#E07B2C)]" />
                <div className="font-montserrat text-sm font-semibold uppercase tracking-[0.16em]">Real-Time Monitoring</div>
              </div>
              <p className="text-[12px] text-[var(--v3-text-secondary)] font-roboto mb-3 leading-relaxed">
                Continuous compliance monitoring with automated alerts for regulatory threshold deviations.
              </p>
              <StatusPill tone="orange">Monitoring</StatusPill>
            </SurfaceCard>
          </div>
        )}
      </div>
    </div>
  );
}
