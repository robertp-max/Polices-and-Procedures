const fs = require('fs');
const path = 'c:/AI/Git/training/CIHHC-IBM-Frawmework_PPs/ci-policy-app/src/policy/pages/DemoPage.tsx';

let src = fs.readFileSync(path, 'utf8');
// Normalize line endings
src = src.replace(/\r\n/g, '\n');

// 1. Fix imports - add BookOpen, List, CheckSquare, Archive
const oldImports = `import {
  Shield, Search, ChevronRight, X, CheckCircle,
  AlertTriangle, FileText, Building2, Users, Target,
  DollarSign, Monitor, BarChart3, Scale, Heart, Cpu, Briefcase,
  GitBranch, Landmark, ShieldCheck, Gavel, ChevronLeft, Printer, LayoutList, Lock, FileCheck, Layers,
  Settings, RefreshCw, CheckCircle2, Play
} from 'lucide-react';`;

const newImports = `import {
  Shield, Search, ChevronRight, X, CheckCircle,
  AlertTriangle, FileText, Building2, Users, Target,
  DollarSign, Monitor, BarChart3, Scale, Heart, Cpu, Briefcase,
  GitBranch, Landmark, ShieldCheck, Gavel, ChevronLeft, Printer, LayoutList, Lock, FileCheck, Layers,
  Settings, RefreshCw, CheckCircle2, Play, BookOpen, List, CheckSquare, Archive
} from 'lucide-react';`;

let result = src.replace(oldImports, newImports);

// 2. Replace DemoPolicyDetailModal with full-page DemoPolicyDetailView + GlassTable
const modalStart = `// ══════════════════════════════════════════════════════════════
// STEP 3 — POLICY DETAIL VIEW (Modal Overlay)
// ══════════════════════════════════════════════════════════════

function DemoPolicyDetailModal`;
const modalEnd = `// ══════════════════════════════════════════════════════════════
// STEP 2 — POLICY LIBRARY (Card Grid)
// ══════════════════════════════════════════════════════════════`;

const startIdx = result.indexOf(modalStart);
const endIdx = result.indexOf(modalEnd);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find modal section markers');
  process.exit(1);
}

const newDetailView = `// ══════════════════════════════════════════════════════════════
// GLASS TABLE COMPONENT
// ══════════════════════════════════════════════════════════════

function GlassTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar mt-4 mb-6 border border-white/10 rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/[0.03] border-b border-white/10">
            {headers.map((h, i) => (
              <th key={i} className="py-3 px-4 font-montserrat font-bold text-[10px] tracking-wider text-white/50 uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-[#c0d6cf]">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="py-3 px-4 text-[12px] align-top leading-relaxed whitespace-pre-line break-words">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// STEP 3 — FULL POLICY DETAIL VIEW (in-app page, NOT modal)
// ══════════════════════════════════════════════════════════════

function DemoPolicyDetailView({ policy, onBack }: { policy: DemoPolicy; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  const navTabs = [
    { id: 'overview', label: 'Overview & Definitions', icon: Target },
    { id: 'statements', label: 'Policy Statements', icon: List },
    { id: 'procedures', label: 'Procedures', icon: Settings },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'compliance', label: 'Compliance & Audit', icon: CheckSquare },
    { id: 'references', label: 'References & Admin', icon: Archive },
  ];

  const domain = DOMAINS.find(d => d.code === policy.domainCode);
  const domainColor = domain?.color || '#00e59b';

  return (
    <div className="demo-view-enter text-white flex flex-col h-full">
      {/* Fixed header area */}
      <div className="shrink-0 p-6 md:p-8 pb-0">
        {/* Top nav */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-[#00e59b] font-montserrat text-[11px] font-bold tracking-[0.2em] flex items-center gap-2 hover:opacity-80 uppercase transition-opacity">
            <ChevronLeft size={16} /> BACK TO LIBRARY
          </button>
          <button className="border border-white/20 hover:bg-white/5 px-5 py-2.5 rounded-full font-bold text-[10px] tracking-[0.2em] transition-colors flex items-center gap-2 text-white uppercase">
            <Printer size={14} /> EXPORT
          </button>
        </div>

        {/* Policy badges */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <span className="border bg-transparent px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase" style={{ borderColor: \`\${domainColor}60\`, color: domainColor }}>{policy.policyId}</span>
          <span className="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase" style={{ backgroundColor: '#00e59b20', color: '#00e59b' }}>{policy.status.replace('_', ' ')}</span>
          <span className="border border-white/10 bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-bold text-white/80 tracking-widest uppercase">{policy.classificationTier}</span>
        </div>

        {/* Title */}
        <h1 className="font-montserrat text-3xl md:text-[36px] leading-tight font-light text-white mb-8 tracking-wide">{policy.title}</h1>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 border-b border-white/10 pb-6">
          <div><span className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold block mb-1">Domain</span><span className="text-[12px] text-white/90 font-light">{policy.domain}</span></div>
          <div><span className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold block mb-1">Tier</span><span className="text-[12px] text-white/90 font-light">{policy.classificationTier}</span></div>
          <div><span className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold block mb-1">Approved By</span><span className="text-[12px] text-white/90 font-light">{policy.approvedBy}</span></div>
          <div><span className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold block mb-1">Version</span><span className="text-[12px] text-white/90 font-light">v{policy.version}</span></div>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto scrollbar-none border-b border-white/10">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={\`pb-3 px-4 font-montserrat text-[10px] font-bold tracking-[0.15em] uppercase whitespace-nowrap transition-colors flex items-center gap-2 \${activeTab === tab.id ? 'text-[#00e59b] border-b-2 border-[#00e59b]' : 'text-white/40 hover:text-white/80 border-b-2 border-transparent'}\`}>
                <Icon size={13} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-6 md:px-8 pb-8">
        {activeTab === 'overview' && <TabOverview policy={policy} />}
        {activeTab === 'statements' && <TabStatements policy={policy} />}
        {activeTab === 'procedures' && <TabProcedures policy={policy} />}
        {activeTab === 'documentation' && <TabDocumentation />}
        {activeTab === 'compliance' && <TabCompliance />}
        {activeTab === 'references' && <TabReferences policy={policy} />}
      </div>
    </div>
  );
}

function TabOverview({ policy }: { policy: DemoPolicy }) {
  return (
    <div className="demo-view-enter mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="border-l-[3px] border-[#00e59b] pl-6">
          <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center mb-4 tracking-widest uppercase">
            <Target className="text-[#00e59b] mr-3" size={18} /> 2. Purpose
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">{policy.purpose}</p>
        </div>
        <div className="border-l-[3px] border-[#e85200] pl-6">
          <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center mb-4 tracking-widest uppercase">
            <Search className="text-[#e85200] mr-3" size={18} /> 3. Scope
          </h2>
          <ul className="space-y-3">
            {policy.scope.map((item, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle className="text-[#e85200] mr-3 mt-0.5 flex-shrink-0" size={14} />
                <span className="text-white/70 text-sm">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 p-4 bg-[#e85200]/10 border border-[#e85200]/20 text-[#e85200] rounded-xl text-xs font-medium leading-relaxed">
            This policy does not apply to day-to-day clinical or operational staff except to the extent that decisions establish requirements, standards, or directives that govern their work.
          </div>
        </div>
      </div>

      {/* Definitions */}
      <div className="mt-12 border-l-[3px] border-blue-400 pl-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center mb-5 tracking-widest uppercase">
          <BookOpen className="text-blue-400 mr-3" size={18} /> 5. Definitions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {[
            { term: 'Classification Tier', definition: 'The policy priority level within the enterprise taxonomy: REQUIRED, ESSENTIAL, OPERATIONAL, or REFERENCE.' },
            { term: 'Policy Owner', definition: 'The designated individual or role responsible for maintaining, reviewing, and approving this policy artifact.' },
            { term: 'Lifecycle Status', definition: 'The current state of the policy in the governance lifecycle: DRAFT, ACTIVE, UNDER REVIEW, or DEPRECATED.' },
            { term: 'Review Cycle', definition: 'The scheduled frequency (annual or biennial) at which this policy must be formally reviewed for continued relevance and compliance.' },
            { term: 'Access Tier', definition: 'The visibility classification (Tiers 1\\u20134) that determines which roles can view or edit this policy.' },
            { term: 'Regulatory Cross-Reference', definition: 'The specific federal, state, or accreditation standards to which this policy maps for compliance traceability.' },
          ].map((def, i) => (
            <div key={i} className="glass-card p-4 rounded-xl">
              <h4 className="font-montserrat font-bold text-blue-400 text-[12px] mb-2">{def.term}</h4>
              <p className="text-white/60 text-[11px] leading-relaxed">{def.definition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory Tags */}
      {policy.regulatoryTags.length > 0 && (
        <div className="mt-10 pt-8 border-t border-white/10">
          <h3 className="font-montserrat text-[12px] font-bold text-white uppercase tracking-[0.2em] mb-4">Regulatory Cross-References</h3>
          <div className="flex flex-wrap gap-2">
            {policy.regulatoryTags.map(tag => {
              const reg = REGULATORY_ITEMS.find(r => r.id === tag);
              if (!reg) return null;
              const Icon = reg.icon;
              return (
                <span key={tag} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-widest uppercase"
                  style={{ borderColor: \`\${reg.color}40\`, background: \`\${reg.color}10\`, color: reg.color }}>
                  <Icon size={12} /> {reg.shortName}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TabStatements({ policy }: { policy: DemoPolicy }) {
  return (
    <div className="demo-view-enter mt-8">
      <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <List className="text-[#00e59b] mr-3" size={18} /> 4. Policy Statement
        </h2>
      </div>
      <div className="space-y-3 pl-6">
        {[
          \`\${policy.policyId} establishes the authority, composition, functions, and oversight responsibilities governing this domain within Care Indeed Home Health Care, Inc.\`,
          'The organization shall maintain full legal authority and responsibility for overall operation, management, and regulatory compliance as required by applicable federal and state regulations.',
          'All personnel within scope shall comply with this policy. Non-compliance may result in corrective action up to and including termination.',
          'This policy shall be reviewed on the established review cycle and revised as needed to maintain compliance with applicable regulatory changes.',
          'Only the most current approved version of this policy shall be considered valid. Superseded versions must not be used for any operational or compliance purpose.',
        ].map((stmt, i) => (
          <div key={i} className="flex items-start glass-card p-4 rounded-xl">
            <div className="text-[#00e59b] font-bold font-montserrat flex-shrink-0 mr-4 w-8 text-[12px]">4.{i+1}</div>
            <p className="text-white/70 text-sm leading-relaxed">{stmt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabProcedures({ policy }: { policy: DemoPolicy }) {
  return (
    <div className="demo-view-enter mt-8">
      <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <Settings className="text-[#00e59b] mr-3" size={18} /> 6. Procedures
        </h2>
      </div>
      <div className="pl-6">
        <div className="bg-[#e85200]/10 border border-[#e85200]/20 text-[#e85200] p-4 rounded-xl text-sm flex items-start mb-6">
          <AlertTriangle className="mr-3 flex-shrink-0 mt-0.5" size={16} />
          <p>Responsible parties shall fulfill the following procedures directly and shall <strong className="text-orange-300">not delegate ultimate accountability</strong> for any of these functions.</p>
        </div>
        <GlassTable
          headers={['Step', 'Responsible Party', 'Action', 'Timeframe']}
          rows={[
            ['6.1.1', 'Policy Owner', \`Maintain and review \${policy.policyId} per the established review cycle. Ensure all content reflects current regulatory requirements and organizational practice.\`, 'As per review cycle.'],
            ['6.1.2', 'Compliance Officer', 'Verify regulatory cross-references are current and accurate. Update mappings when regulatory changes occur.', 'Within 30 days of regulatory change.'],
            ['6.1.3', 'Administrator', 'Ensure all personnel within scope have acknowledged this policy and completed required training.', 'Within 14 calendar days of effective date.'],
            ['6.1.4', 'QA Designee', 'Monitor compliance indicators associated with this policy and report deviations through the QAPI program.', 'Quarterly.'],
            ['6.1.5', 'All Staff in Scope', 'Comply with all requirements of this policy. Report any observed non-compliance through established channels.', 'Continuous.'],
          ]}
        />
      </div>
    </div>
  );
}

function TabDocumentation() {
  return (
    <div className="demo-view-enter mt-8">
      <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <FileText className="text-[#00e59b] mr-3" size={18} /> 7. Documentation Requirements
        </h2>
      </div>
      <div className="pl-6">
        <GlassTable
          headers={['Requirement', 'Document / Record', 'Responsible Party', 'Timeframe']}
          rows={[
            ['Policy acknowledgment', 'Signed acknowledgment by all personnel within scope.', 'Administrator (collection)', 'Within 14 calendar days of effective date.'],
            ['Version control record', 'Version history reflecting all substantive and non-substantive revisions.', 'Policy Owner', 'Updated with each revision.'],
            ['Regulatory cross-reference map', 'Current mapping of policy to applicable regulations.', 'Compliance Officer', 'Maintained continuously; verified quarterly.'],
            ['Training completion records', 'Documentation of required training for all in-scope personnel.', 'HR / Training Coordinator', 'Within 14 calendar days of policy effective date.'],
            ['Compliance audit results', 'Results of internal audits measuring compliance with this policy.', 'QA Designee', 'Quarterly; retained for minimum 7 years.'],
          ]}
        />
      </div>
    </div>
  );
}

function TabCompliance() {
  return (
    <div className="demo-view-enter mt-8">
      <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <CheckSquare className="text-[#00e59b] mr-3" size={18} /> 8. Compliance & Audit
        </h2>
      </div>
      <div className="pl-6">
        <h3 className="font-montserrat text-[12px] font-bold text-white mb-4 uppercase tracking-widest">8.1 How Compliance Is Measured</h3>
        <GlassTable
          headers={['Compliance Indicator', 'Measurement Method', 'Acceptable Standard']}
          rows={[
            ['Policy is current and approved.', 'Review of version control record and approval documentation.', 'Current version on file at all times.'],
            ['All personnel acknowledged.', 'Review of signed acknowledgment forms.', '100% acknowledgment within 14 calendar days.'],
            ['Regulatory mappings are current.', 'Review of cross-reference documentation.', 'Updated within 30 days of any regulatory change.'],
            ['Compliance monitoring active.', 'Review of QAPI reports and audit logs.', 'Quarterly monitoring with documented results.'],
          ]}
        />

        <h3 className="font-montserrat text-[12px] font-bold text-[#e85200] mt-10 mb-4 uppercase tracking-widest flex items-center">
          <AlertTriangle className="mr-2" size={16} /> 8.2 Common Failure Points
        </h3>
        <div className="space-y-3">
          {[
            { finding: 'Policy has not been reviewed within required cycle.', risk: 'Surveyor may cite outdated policy as non-compliance.', mitigation: 'Set calendar reminders and track review dates in enterprise system.' },
            { finding: 'Staff acknowledgments are incomplete or missing.', risk: 'Surveyor will cite failure to ensure staff awareness.', mitigation: 'Automated tracking with escalation for non-compliance within 7 days of deadline.' },
            { finding: 'Regulatory cross-references are outdated.', risk: 'Policy may not reflect current regulatory requirements.', mitigation: 'Compliance Officer monitors regulatory changes and updates mappings proactively.' },
          ].map((item, i) => (
            <div key={i} className="border border-red-500/20 p-4 rounded-xl bg-red-500/5">
              <p className="font-bold text-red-400 text-[12px] mb-1">{item.finding}</p>
              <p className="text-[11px] text-red-300/80 mb-1"><strong>Risk:</strong> {item.risk}</p>
              <p className="text-[11px] text-white/70"><strong>Mitigation:</strong> {item.mitigation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabReferences({ policy }: { policy: DemoPolicy }) {
  return (
    <div className="demo-view-enter mt-8">
      <div className="border-l-[3px] border-[#00e59b] pl-6 mb-6">
        <h2 className="font-montserrat text-[14px] font-bold text-white flex items-center tracking-widest uppercase">
          <Archive className="text-[#00e59b] mr-3" size={18} /> 9. References & Administration
        </h2>
      </div>
      <div className="pl-6">
        <h3 className="font-montserrat text-[12px] font-bold text-white/50 uppercase tracking-widest mb-3">9.1 Regulatory References</h3>
        <GlassTable
          headers={['Citation', 'Title', 'Relevance']}
          rows={[
            ['42 CFR \\u00A7 484.105', 'Organization and Administration of Services', 'Primary regulatory basis for governance policies.'],
            ['42 CFR \\u00A7 484.65', 'QAPI', 'Quality assessment and performance improvement requirements.'],
            ['42 CFR \\u00A7 484.100', 'Compliance with Laws', 'Federal, state, and local law compliance.'],
            ['42 CFR \\u00A7 484.102', 'Emergency Preparedness', 'Emergency plan approval and oversight.'],
          ]}
        />

        <h3 className="font-montserrat text-[12px] font-bold text-white/50 mt-8 uppercase tracking-widest mb-3">9.2 Cross-Referenced Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: 'GV-PM-001', title: 'Policy Development & Approval Process' },
            { id: 'GV-PM-002', title: 'Policy Review & Revision Cycle' },
            { id: 'EN-TG-001', title: 'Enterprise Policy Taxonomy & Classification' },
            { id: 'EN-LC-001', title: 'Policy Lifecycle Management & Version Control' },
            { id: 'CO-CP-001', title: 'Corporate Compliance Program' },
            { id: 'QA-PG-001', title: 'QAPI Program Establishment & Governance' },
          ].map((ref, i) => (
            <div key={i} className="glass-card p-3 rounded-xl flex items-center gap-3">
              <span className="text-[#00e59b] font-mono font-bold text-[11px]">{ref.id}</span>
              <span className="text-white/70 text-[11px]">{ref.title}</span>
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <h3 className="font-montserrat text-[12px] font-bold text-white uppercase tracking-[0.2em] mb-4">Document Metadata</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              ['Effective Date', policy.effectiveDate],
              ['Next Review', policy.nextReviewDate],
              ['Policy Owner', policy.policyOwner],
              ['Subdomain', policy.subdomain],
              ['Domain Code', policy.domainCode],
              ['Status', policy.status],
            ].map(([label, val]) => (
              <div key={label} className="glass-card rounded-xl p-3">
                <span className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold block mb-1">{label}</span>
                <span className="text-[12px] text-white/80">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// STEP 2 — POLICY LIBRARY (Card Grid)
// ══════════════════════════════════════════════════════════════`;

result = result.substring(0, startIdx) + newDetailView + result.substring(endIdx);

// 3. Replace the main DemoPage orchestrator to use 3 views
const oldOrchestrator = `type DemoView = 'cover' | 'library';

export function DemoPage() {
  const [view, setView] = useState<DemoView>('cover');
  const [detailPolicy, setDetailPolicy] = useState<DemoPolicy | null>(null);

  const goToLibrary = useCallback(() => setView('library'), []);
  const goToCover = useCallback(() => setView('cover'), []);
  const openDetail = useCallback((p: DemoPolicy) => setDetailPolicy(p), []);
  const closeDetail = useCallback(() => setDetailPolicy(null), []);

  return (
    <>
      <style>{\`
        .demo-glass-card {
          background-color: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .demo-glass-card:hover {
          border-color: rgba(255, 255, 255, 0.25);
          background-color: rgba(255, 255, 255, 0.04);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
        }
        @keyframes demoFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .demo-fadeIn { animation: demoFadeIn 0.35s ease-out forwards; }
        .demo-policy-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      \`}</style>

      <div className="h-full overflow-hidden flex flex-col">
        {view === 'cover' && (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <TaxonomyCoverView onViewPolicies={goToLibrary} />
          </div>
        )}
        {view === 'library' && (
          <DemoLibraryView onBack={goToCover} onSelectPolicy={openDetail} />
        )}
      </div>

      {detailPolicy && <DemoPolicyDetailModal policy={detailPolicy} onClose={closeDetail} />}
    </>
  );
}`;

const newOrchestrator = `type DemoView = 'cover' | 'library' | 'detail';

export function DemoPage() {
  const [view, setView] = useState<DemoView>('cover');
  const [detailPolicy, setDetailPolicy] = useState<DemoPolicy | null>(null);

  const goToLibrary = useCallback(() => setView('library'), []);
  const goToCover = useCallback(() => { setView('cover'); setDetailPolicy(null); }, []);
  const openDetail = useCallback((p: DemoPolicy) => { setDetailPolicy(p); setView('detail'); }, []);
  const backToLibrary = useCallback(() => { setView('library'); setDetailPolicy(null); }, []);

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {view === 'cover' && (
        <div className="h-full overflow-y-auto custom-scrollbar">
          <TaxonomyCoverView onViewPolicies={goToLibrary} />
        </div>
      )}
      {view === 'library' && (
        <DemoLibraryView onBack={goToCover} onSelectPolicy={openDetail} />
      )}
      {view === 'detail' && detailPolicy && (
        <DemoPolicyDetailView policy={detailPolicy} onBack={backToLibrary} />
      )}
    </div>
  );
}`;

if (!result.includes(oldOrchestrator)) {
  console.error('Could not find orchestrator section');
  process.exit(1);
}

result = result.replace(oldOrchestrator, newOrchestrator);

fs.writeFileSync(path, result, 'utf8');
console.log('Done. New file size:', result.length, 'chars,', result.split('\n').length, 'lines');
