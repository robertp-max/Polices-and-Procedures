import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search, LayoutDashboard, Users, Calendar, User, ShieldCheck,
  Network, UserPlus, FileText, FileBox, Clock, BookOpen,
  HelpCircle, PlayCircle, Settings, Activity, ChevronRight,
  Printer, Download, History, Info,
} from 'lucide-react';
import { buildPolicyViewer32Model } from './PolicyViewer32Adapters';
import type { PolicyViewer32Section, PolicyViewer32TabId } from './PolicyViewer32Types';
import {
  PolicyViewer32EmptyState,
  PolicyViewer32Markdown,
  PolicyViewer32SectionList,
} from './PolicyViewer32SectionRenderer';
import { usePolicyStore } from '@/policy/stores/policyStore';
import { openPolicyPrintRoute } from '@/policy/utils/openPolicyPrintRoute';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

const SIDEBAR_NAV = [
  {
    group: 'PRIMARY OPERATIONS',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { id: 'clinicians', label: 'Clinician Profiles', icon: Users, path: '/clinicians' },
      { id: 'patients', label: 'Patient Profiles', icon: User, path: '/patients' },
      { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
      { id: 'brad', label: 'Brad', icon: Activity, path: '/iadministrator' },
    ],
  },
  {
    group: 'COMPLIANCE EXECUTION',
    items: [
      { id: 'ces', label: 'Compliance Execution (CES)', icon: ShieldCheck, path: '/ces' },
      { id: 'taxonomy', label: 'Taxonomy', icon: Network, path: '/taxonomy' },
      { id: 'onboarding', label: 'Onboarding', icon: UserPlus, path: '/journey' },
      { id: 'policy', label: 'Policy Lifecycle', icon: FileText, path: '/policy-lifecycle', active: true },
      { id: 'evidence', label: 'Evidence', icon: FileBox, path: '/evidence' },
    ],
  },
  {
    group: 'ADMINISTRATION / KNOWLEDGE',
    items: [
      { id: 'hubstaff', label: 'Hubstaff', icon: Clock, path: '/hubstaff' },
      { id: 'sysdocs', label: 'System Documentation', icon: BookOpen, path: '/system-documentation' },
      { id: 'help', label: 'Help Center', icon: HelpCircle, path: '/help' },
      { id: 'demo', label: 'Demo', icon: PlayCircle, path: '/demo' },
      { id: 'admin', label: 'Admin', icon: Settings, path: '/admin' },
    ],
  },
];

const POLICY_TABS: Array<{ id: PolicyViewer32TabId; label: string }> = [
  { id: 'overview', label: 'Overview & Definitions' },
  { id: 'statements', label: 'Policy Statements' },
  { id: 'procedures', label: 'Procedures' },
  { id: 'documentation', label: 'Documentation' },
  { id: 'compliance', label: 'Compliance & Audit' },
  { id: 'references', label: 'References & Admin' },
  { id: 'appendices', label: 'Appendices (Forms)' },
];

export interface PolicyViewer32Props {
  policyId?: string;
  embedded?: boolean;
  onBack?: () => void;
}

function SpotlightCard({ children, className = '', spotlightColor = 'rgba(255, 255, 255, 0.08)' }: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      <div className="spotlight-outer-glow" />
      <div className="spotlight-glow-wrapper">
        <div className="spotlight-inner-glow" />
      </div>
      {children}
    </div>
  );
}

function sectionMatches(section: PolicyViewer32Section, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return section.title.toLowerCase().includes(q) || section.body.toLowerCase().includes(q);
}

function filterSections(sections: PolicyViewer32Section[], query: string): PolicyViewer32Section[] {
  return sections.filter(section => sectionMatches(section, query));
}

export function PolicyViewer32({ policyId: propPolicyId, embedded = false, onBack }: PolicyViewer32Props) {
  const params = useParams<{ policyId?: string }>();
  const navigate = useNavigate();
  const policyId = propPolicyId ?? params.policyId ?? '';
  const storePolicy = usePolicyStore(state => state.policies.find(item => item.id === decodeURIComponent(policyId).toUpperCase()));
  const [activeTab, setActiveTab] = useState<PolicyViewer32TabId>('overview');
  const [procedureSectionId, setProcedureSectionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const model = useMemo(
    () => (policyId ? buildPolicyViewer32Model(policyId, storePolicy) : null),
    [policyId, storePolicy],
  );

  useEffect(() => {
    setActiveTab('overview');
    setSearchQuery('');
  }, [policyId]);

  useEffect(() => {
    setProcedureSectionId(model?.procedures[0]?.id ?? '');
  }, [model?.metadata.id, model?.procedures]);

  if (!model) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center bg-[#0B0F15] text-[#E2E8F0]">
        <PolicyViewer32EmptyState title="Policy not found" />
      </div>
    );
  }

  const metadata = model.metadata;
  const filteredPurpose = filterSections(model.purpose, searchQuery);
  const filteredScope = filterSections(model.scope, searchQuery);
  const filteredDefinitions = filterSections(model.definitions, searchQuery);
  const filteredStatements = filterSections(model.statements, searchQuery);
  const filteredProcedures = filterSections(model.procedures, searchQuery);
  const filteredDocumentation = filterSections(model.documentation, searchQuery);
  const filteredCompliance = filterSections(model.compliance, searchQuery);
  const filteredReferences = filterSections(model.references, searchQuery);
  const filteredAppendices = filterSections(model.appendices, searchQuery);
  const selectedProcedure = filteredProcedures.find(section => section.id === procedureSectionId) ?? filteredProcedures[0];

  const printPath = `/print/${encodeURIComponent(metadata.id)}`;
  const handlePrint = () => openPolicyPrintRoute(`${printPath}?autoprint=1`);
  const handleDownload = () => openPolicyPrintRoute(printPath);

  const renderSectionBadge = (label: string) => (
    <div className="w-6 h-6 rounded border border-[#1C2433] bg-[#141A23] flex items-center justify-center text-[10px] font-mono text-[#007970]">
      {label}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-10">
      <SpotlightCard className="p-6" spotlightColor="rgba(0, 121, 112, 0.15)">
        <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
          {metadata.title}
        </h1>
        <div className="text-[10px] font-mono text-[#007970] mb-8 uppercase tracking-widest flex items-center gap-2">
          POLICY ID: {metadata.id}
          <div className="h-1 w-1 rounded-full bg-[#007970]" />
          {metadata.status}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 pt-6 border-t border-[#1C2433]">
          {[
            ['Domain', metadata.domain],
            ['Tier', metadata.tier],
            ['Approved By', metadata.approvedBy],
            ['Supersedes', metadata.supersedes],
            ['Effective Date', metadata.effectiveDate],
            ['Last Reviewed', metadata.lastReviewed],
            ['Next Review', metadata.nextReview],
            ['Version', metadata.version],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-[9px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-1">{label}</div>
              <div className="text-sm font-medium text-[#E2E8F0]">{value || 'Unavailable'}</div>
            </div>
          ))}
        </div>
      </SpotlightCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <section>
          <div className="flex items-center gap-3 mb-4">
            {renderSectionBadge('2')}
            <h3 className="text-sm font-bold text-[#8A94A6] uppercase tracking-widest">Purpose</h3>
          </div>
          <PolicyViewer32SectionList sections={filteredPurpose} />
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            {renderSectionBadge('3')}
            <h3 className="text-sm font-bold text-[#8A94A6] uppercase tracking-widest">Scope</h3>
          </div>
          <PolicyViewer32SectionList sections={filteredScope} />
        </section>
      </div>

      <section className="pt-6 border-t border-[#1C2433]">
        <div className="flex items-center gap-3 mb-6">
          {renderSectionBadge('5')}
          <h3 className="text-sm font-bold text-[#8A94A6] uppercase tracking-widest">Definitions</h3>
        </div>
        {filteredDefinitions.length === 0 ? (
          <PolicyViewer32EmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDefinitions.map(section => (
              <SpotlightCard key={section.id} className="p-5 h-full" spotlightColor="rgba(0, 121, 112, 0.12)">
                <h4 className="text-[13px] font-bold text-white mb-2 tracking-wide">{section.title}</h4>
                <PolicyViewer32Markdown body={section.body} />
              </SpotlightCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'statements':
        return (
          <div className="space-y-6 max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
              {renderSectionBadge('4')}
              <h3 className="text-sm font-bold text-[#8A94A6] uppercase tracking-widest">Policy Statements</h3>
            </div>
            <PolicyViewer32SectionList sections={filteredStatements} />
          </div>
        );
      case 'procedures':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              {renderSectionBadge('6')}
              <h3 className="text-sm font-bold text-[#8A94A6] uppercase tracking-widest">Procedures</h3>
            </div>
            {filteredProcedures.length > 1 && (
              <div className="flex gap-6 border-b border-[#1C2433] overflow-x-auto custom-scrollbar" role="tablist" aria-label="Procedure sections">
                {filteredProcedures.map(section => {
                  const active = selectedProcedure?.id === section.id;
                  if (active) {
                    return (
                      <button
                        key={section.id}
                        type="button"
                        role="tab"
                        aria-selected="true"
                        onClick={() => setProcedureSectionId(section.id)}
                        className="text-xs font-medium pb-3 transition-colors border-b-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970] border-[#C74600] text-[#C74600]"
                      >
                        {section.title}
                      </button>
                    );
                  }
                  return (
                    <button
                      key={section.id}
                      type="button"
                      role="tab"
                      aria-selected="false"
                      onClick={() => setProcedureSectionId(section.id)}
                      className="text-xs font-medium pb-3 transition-colors border-b-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970] border-transparent text-[#5E6A7F] hover:text-[#A0ABC0]"
                    >
                      {section.title}
                    </button>
                  );
                })}
              </div>
            )}
            {selectedProcedure ? <PolicyViewer32SectionList sections={[selectedProcedure]} /> : <PolicyViewer32EmptyState />}
          </div>
        );
      case 'documentation':
        return <PolicyViewer32SectionList sections={filteredDocumentation} />;
      case 'compliance':
        return <PolicyViewer32SectionList sections={filteredCompliance} />;
      case 'references':
        return <PolicyViewer32SectionList sections={filteredReferences} />;
      case 'appendices':
        return (
          <div className="space-y-8">
            <PolicyViewer32SectionList sections={filteredAppendices} />
            {model.forms.length > 0 && (
              <section className="pt-6 border-t border-[#1C2433]">
                <div className="flex items-center gap-3 mb-6">
                  {renderSectionBadge('F')}
                  <h3 className="text-sm font-bold text-[#8A94A6] uppercase tracking-widest">Linked Forms</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {model.forms.map(form => (
                    <SpotlightCard key={form.id} className="p-5" spotlightColor="rgba(0, 121, 112, 0.12)">
                      <div className="text-[10px] font-mono text-[#007970] mb-2">{form.id}</div>
                      <h4 className="text-sm font-semibold text-white">{form.name}</h4>
                      <button
                        type="button"
                        onClick={() => navigate(`/forms/${encodeURIComponent(form.id)}`)}
                        className="mt-4 text-xs font-medium text-[#A0ABC0] hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970]"
                      >
                        Open form
                      </button>
                    </SpotlightCard>
                  ))}
                </div>
              </section>
            )}
            {filteredAppendices.length === 0 && model.forms.length === 0 && <PolicyViewer32EmptyState />}
          </div>
        );
      default:
        return <PolicyViewer32EmptyState />;
    }
  };

  return (
    <div className={`${embedded ? 'h-full min-h-[680px]' : 'h-screen'} flex w-full bg-[#0B0F15] text-slate-200 font-sans overflow-hidden selection:bg-[#007970]/30 selection:text-white`}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1C2433; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2A3441; }
        .card-spotlight {
          position: relative;
          border-radius: 0.75rem;
          border: 1px solid #1C2433;
          background-color: #141A23;
          --mouse-x: 50%;
          --mouse-y: 50%;
          --spotlight-color: rgba(255, 255, 255, 0.08);
          transition: border-color 0.3s ease;
        }
        .card-spotlight:hover { border-color: #2A3441; }
        .card-spotlight > :not(.spotlight-outer-glow):not(.spotlight-glow-wrapper) {
          position: relative;
          z-index: 10;
        }
        .spotlight-outer-glow {
          position: absolute;
          inset: -16px;
          border-radius: 1.5rem;
          background: radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 50%);
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
          z-index: -1;
          filter: blur(20px);
        }
        .spotlight-glow-wrapper {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .spotlight-inner-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .card-spotlight:hover .spotlight-outer-glow,
        .card-spotlight:hover .spotlight-inner-glow { opacity: 1; }
        @keyframes fadeInPolicy32 { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-policy32-enter { animation: fadeInPolicy32 0.25s ease forwards; }
      `}</style>

      <aside className="w-[260px] flex-shrink-0 border-r border-[#1C2433] bg-[#0F131A] flex flex-col h-full z-20">
        <div className="h-[72px] flex items-center px-6 border-b border-[#1C2433]">
          <div className="flex items-center gap-2 text-white font-semibold text-lg tracking-wide">
            <div className="w-8 h-8 bg-gradient-to-br from-[#007970] to-[#004142] rounded-lg flex items-center justify-center">
              <Activity size={16} className="text-white" aria-hidden="true" />
            </div>
            CareIndeed
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 space-y-8">
          {SIDEBAR_NAV.map(section => (
            <div key={section.group}>
              <h3 className="text-[10px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-3 px-2">
                {section.group}
              </h3>
              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970] ${
                        item.active
                          ? 'bg-[#007970]/10 text-[#007970]'
                          : 'text-[#A0ABC0] hover:bg-[#1C2433] hover:text-white'
                      }`}
                    >
                      <Icon size={16} className={item.active ? 'text-[#007970]' : 'text-[#5E6A7F]'} aria-hidden="true" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B0F15] relative z-10">
        <header className="h-[72px] flex-shrink-0 border-b border-[#1C2433] bg-[#0F131A]/80 backdrop-blur-md flex items-center justify-between px-8 z-20 sticky top-0">
          <div className="flex-1 flex items-center max-w-2xl">
            <div className="relative w-full max-w-md group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6A7F] group-focus-within:text-[#007970] transition-colors" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Search this policy..."
                aria-label="Search this policy"
                className="w-full bg-[#141A23] border border-[#1C2433] rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-[#5E6A7F] focus:outline-none focus:border-[#007970] focus:ring-1 focus:ring-[#007970]/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end leading-tight text-xs font-medium text-[#8A94A6]">
              <span className="text-[10px] text-[#5E6A7F] uppercase tracking-wider">Policy</span>
              <span className="text-white">{metadata.id}</span>
            </div>
            <div className="h-6 w-px bg-[#1C2433]" />
            <button
              type="button"
              aria-label="User profile"
              className="w-8 h-8 rounded-full bg-[#141A23] border border-[#1C2433] flex items-center justify-center hover:border-[#4A5568] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970]"
            >
              <span className="text-xs font-bold text-[#007970]">TP</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
          <div className="px-8 pt-8 pb-12 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2 text-xs font-medium">
                {onBack && (
                  <>
                    <button
                      type="button"
                      onClick={onBack}
                      className="text-[#5E6A7F] hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970]"
                    >
                      Library
                    </button>
                    <ChevronRight size={14} className="text-[#5E6A7F]" aria-hidden="true" />
                  </>
                )}
                {!onBack && <span className="text-[#5E6A7F]">Library</span>}
                <span className="text-[#007970] font-mono tracking-wide">{metadata.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled
                  aria-label="Version history unavailable"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#1C2433] bg-[#141A23] text-[#5E6A7F] text-xs font-medium cursor-not-allowed"
                >
                  <History size={14} aria-hidden="true" /> Version History
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  aria-label={`Open print view for ${metadata.id} to save as PDF`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#1C2433] bg-[#141A23] hover:bg-[#1C2433] text-[#A0ABC0] hover:text-white text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970]"
                >
                  <Download size={14} aria-hidden="true" /> Export PDF
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  aria-label={`Open print route for ${metadata.id}`}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-[#007970] hover:bg-[#009085] text-white text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <Printer size={14} aria-hidden="true" /> Print
                </button>
              </div>
            </div>

            {model.missingContent && (
              <div className="mb-6 p-4 rounded-lg bg-[#C74600]/10 border border-[#C74600]/30 flex gap-3">
                <Info size={16} className="text-[#C74600] mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p className="text-xs font-medium text-[#C74600] leading-relaxed">
                  This policy exists in the policy registry, but no rendered policy body is available in the content corpus.
                </p>
              </div>
            )}

            <div className="flex overflow-x-auto custom-scrollbar border-b border-[#1C2433] mb-8 sticky top-0 bg-[#0B0F15] z-10 pt-2" role="tablist" aria-label="Policy viewer sections">
              {POLICY_TABS.map(tab => {
                const active = activeTab === tab.id;
                if (active) {
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      id={`policy32-tab-${tab.id}`}
                      aria-selected="true"
                      aria-controls={`policy32-panel-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className="whitespace-nowrap px-1 py-3 mr-8 text-[13px] font-medium transition-colors relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970] text-[#007970]"
                    >
                      {tab.label}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007970] rounded-t-full" />
                    </button>
                  );
                }
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`policy32-tab-${tab.id}`}
                    aria-selected="false"
                    aria-controls={`policy32-panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className="whitespace-nowrap px-1 py-3 mr-8 text-[13px] font-medium transition-colors relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970] text-[#8A94A6] hover:text-white"
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div
              key={activeTab}
              id={`policy32-panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`policy32-tab-${activeTab}`}
              className="animate-policy32-enter"
              tabIndex={0}
            >
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PolicyViewer32;
