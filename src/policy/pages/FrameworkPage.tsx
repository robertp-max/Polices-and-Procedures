import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Layers,
  Users,
  Lock,
  RefreshCw,
  GitBranch,
  FileText,
  Building2,
  Heart,
  BarChart3,
  DollarSign,
  Briefcase,
  Monitor,
  AlertTriangle,
  Cpu,
  Scale,
  Landmark,
  FileCheck,
  Gavel,
  Shield,
  ListFilter,
  Settings,
  CheckCircle2,
  FileCode,
  Printer,
  FileSignature,
  LayoutList,
} from 'lucide-react';

const REGULATORY_ITEMS = [
  { id: 'title22', name: 'California State Law', shortName: 'TITLE 22', color: '#facc15', icon: Landmark },
  { id: '42cfr', name: '42 CFR Part 484', shortName: '42 CFR §484', color: '#00e59b', icon: Scale },
  { id: 'cms', name: 'CMS State Operations', shortName: 'CMS STATE OPS', color: '#ec4899', icon: FileCheck },
  { id: 'hipaa', name: 'HIPAA Privacy & Security', shortName: 'HIPAA', color: '#3b82f6', icon: Lock },
  { id: 'osha', name: 'OSHA / Cal-OSHA', shortName: 'OSHA', color: '#f59e0b', icon: Shield },
  { id: 'oig', name: 'OIG Compliance Guidance', shortName: 'OIG', color: '#8b5cf6', icon: ShieldCheck },
  { id: 'fca', name: 'False Claims Act', shortName: 'FCA', color: '#a855f7', icon: Gavel },
];

const DOMAINS = [
  { code: 'GV', name: 'GOVERNANCE', icon: Building2, color: '#00e59b', subdomains: ['GB', 'OG', 'PM', 'EA'] },
  { code: 'CL', name: 'CLINICAL OPS', icon: Heart, color: '#ef4444', subdomains: ['PA', 'CP', 'OA', 'SD', 'IC', 'DC', 'CA', 'CD', 'PR'] },
  { code: 'QA', name: 'QAPI', icon: BarChart3, color: '#06b6d4', subdomains: ['PG', 'SM', 'AE', 'PI'] },
  { code: 'HR', name: 'HUMAN RES.', icon: Users, color: '#8b5cf6', subdomains: ['TA', 'TD', 'WM', 'ER', 'JD'] },
  { code: 'CO', name: 'COMPLIANCE', icon: Shield, color: '#3b82f6', subdomains: ['CP', 'HP', 'FA', 'RA', 'DC'] },
  { code: 'FN', name: 'FINANCE', icon: DollarSign, color: '#10b981', subdomains: ['FP', 'RC', 'BL', 'CM'] },
  { code: 'OP', name: 'OPERATIONS', icon: Briefcase, color: '#f97316', subdomains: ['IM', 'SL', 'PA', 'FM'] },
  { code: 'IT', name: 'IT & SECURITY', icon: Monitor, color: '#6366f1', subdomains: ['SC', 'DR', 'SA', 'UP'] },
  { code: 'RM', name: 'RISK MGMT', icon: AlertTriangle, color: '#eab308', subdomains: ['ER', 'SS', 'PS', 'EP'] },
  { code: 'EN', name: 'ENTERPRISE', icon: Cpu, color: '#ec4899', subdomains: ['TG', 'LC', 'CM'] },
];

const REG_DESCRIPTIONS: Record<string, string> = {
  'title22': "California state licensure regulations establishing core administrative and operational mandates.",
  '42cfr': "CMS Conditions of Participation for Home Health Agencies required for Medicare certification.",
  'cms': "Survey protocols, guidelines, and compliance expectations for state operations.",
  'hipaa': "Federal standards for protecting sensitive patient health information from disclosure.",
  'osha': "Occupational safety standards ensuring safe and healthful working conditions for staff.",
  'oig': "Guidelines preventing fraud, waste, and abuse through robust compliance programs.",
  'fca': "Federal law imposing liability for defrauding governmental programs, including whistleblower protections.",
};

const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  'GV': "Authority, structure, and oversight of the agency's governing body, administrative leadership, and organizational governance functions.",
  'CL': "Direct patient care delivery, clinical practice standards, care planning, discipline-specific services, and clinical documentation.",
  'QA': "QAPI program governance, performance improvement projects, quality measurement, patient safety, and outcome benchmarking.",
  'HR': "Workforce management including recruitment, credentialing, training, competency, performance management, employee relations.",
  'CO': "Regulatory compliance program, fraud and abuse prevention, HIPAA privacy/security, documentation compliance, and audit readiness.",
  'FN': "Billing, coding, claims management, reimbursement, financial planning, and revenue cycle performance.",
  'OP': "Day-to-day operational processes including intake, scheduling, service delivery logistics, facility management, and patient access.",
  'IT': "Information security program, system administration, data protection, cybersecurity, and technology infrastructure management.",
  'RM': "Enterprise risk management, incident management, staff and patient safety, environmental safety, and emergency response.",
  'EN': "Cross-domain policy governance, taxonomy management, lifecycle control, compliance metrics, and inter-domain coordination.",
};

export function FrameworkPage() {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'lifecycle'>('hierarchy');
  const navigate = useNavigate();
  const allSubdomains = DOMAINS.flatMap(d => d.subdomains.map(s => `${d.code}-${s}`));

  const stats = [
    { label: 'TAXONOMY DOMAINS', value: '10', sub: 'Top-Level Categories', color: '#f97316', icon: Layers },
    { label: 'SUBDOMAINS', value: '46', sub: 'Structural Pillars', color: '#eab308', icon: GitBranch },
    { label: 'TOTAL POLICIES', value: '269', sub: 'Managed Artifacts', color: '#3b82f6', icon: FileText },
    { label: 'GOVERNANCE', value: '100%', sub: 'Framework Alignment', color: '#00e59b', icon: ShieldCheck },
  ];

  return (
    <>
      <style>{`
        .fw-glass-btn {
          background-color: transparent;
          border: 1px solid transparent;
          transition: border-color 0.3s ease, background-color 0.3s ease, transform 0.3s ease;
          position: relative;
          z-index: 1;
          animation: fwZDecay 2331ms step-end forwards;
        }
        .fw-glass-btn:hover {
          border-color: rgba(255,255,255,0.15);
          background-color: rgba(255,255,255,0.03);
          transform: translateY(-2px);
          z-index: 200;
          animation: none;
        }
        @keyframes fwZDecay {
          0% { z-index: 100; }
          100% { z-index: 1; }
        }
        .fw-group {
          position: relative;
          z-index: 1;
          animation: fwZDecay 2331ms step-end forwards;
        }
        .fw-group.fw-fast-decay {
          animation: fwZDecay 777ms step-end forwards;
        }
        .fw-group:hover {
          z-index: 200;
          animation: none;
        }
        .fw-tooltip {
          position: absolute;
          left: calc(100% + 14px);
          top: 50%;
          transform: translateY(-50%);
          width: max-content;
          max-width: 220px;
          background-color: #0f172a;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 0.6rem 0.8rem;
          border-radius: 0.5rem;
          font-size: 0.65rem;
          color: #cbd5e1;
          pointer-events: none;
          opacity: 0;
          z-index: 9999;
          transition: opacity 2331ms ease-out;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);
          text-transform: none;
          font-family: 'Roboto', sans-serif;
          font-weight: 400;
          letter-spacing: normal;
          text-align: left;
          line-height: 1.4;
        }
        .fw-group:hover .fw-tooltip {
          opacity: 1;
          transition: opacity 330ms ease-in;
        }
        .fw-tooltip-fast {
          position: absolute;
          left: calc(100% + 14px);
          top: 50%;
          transform: translateY(-50%);
          width: max-content;
          max-width: 180px;
          background-color: #0f172a;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 0.4rem 0.6rem;
          border-radius: 0.4rem;
          font-size: 0.6rem;
          color: #cbd5e1;
          pointer-events: none;
          opacity: 0;
          z-index: 9999;
          transition: opacity 777ms ease-out;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
          text-transform: none;
          font-family: 'Roboto', sans-serif;
          text-align: left;
          line-height: 1.3;
        }
        .fw-group:hover .fw-tooltip-fast {
          opacity: 1;
          transition: opacity 330ms ease-in;
        }
        .fw-tooltip::after, .fw-tooltip-fast::after {
          content: '';
          position: absolute;
          top: 50%;
          right: 100%;
          margin-top: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: transparent #0f172a transparent transparent;
        }
        .fw-tooltip-left {
          left: auto;
          right: calc(100% + 14px);
        }
        .fw-tooltip-left::after {
          right: auto;
          left: 100%;
          border-color: transparent transparent transparent #0f172a;
        }
        .fw-no-scrollbar::-webkit-scrollbar { display: none; }
        .fw-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fwFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .fw-fade-in { animation: fwFadeIn 0.4s ease-out forwards; }
      `}</style>

      <div className="h-full w-full bg-transparent text-white p-6 md:p-8 font-roboto overflow-hidden flex flex-col relative">

        {/* 1. Header */}
        <div className="flex justify-between items-end shrink-0 mb-6 z-10 w-full max-w-[1600px] mx-auto">
          <div>
            <h1 className="font-montserrat text-3xl md:text-[38px] leading-tight font-light text-white tracking-wide">
              Enterprise Policy Architecture
            </h1>
            <p className="text-white/40 mt-1.5 font-roboto tracking-[0.2em] text-[10px] font-bold uppercase">
              v7.0 &nbsp;|&nbsp; HHA FRAMEWORK • REGULATORY ALIGNMENT
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex bg-transparent p-1 rounded-full border border-white/10">
              <button
                onClick={() => setActiveTab('hierarchy')}
                className={`px-6 py-2.5 rounded-full font-montserrat text-[10px] font-bold tracking-[0.15em] uppercase transition-all ${activeTab === 'hierarchy' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
              >
                SYSTEM HIERARCHY
              </button>
              <button
                onClick={() => setActiveTab('lifecycle')}
                className={`px-6 py-2.5 rounded-full font-montserrat text-[10px] font-bold tracking-[0.15em] uppercase transition-all ${activeTab === 'lifecycle' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
              >
                GOVERNANCE LIFECYCLE
              </button>
            </div>
            <button
              onClick={() => navigate('/framework/achc-survey')}
              className="fw-glass-btn hover:border-[#14b8a6]/40 px-6 py-3 rounded-full font-bold text-[10px] tracking-[0.2em] flex items-center gap-2 text-[#14b8a6] uppercase transition-all"
            >
              <FileCheck size={14} /> ACHC SURVEY VIEW
            </button>
            <button
              onClick={() => navigate('/library')}
              className="fw-glass-btn hover:border-[#00e59b]/40 px-6 py-3 rounded-full font-bold text-[10px] tracking-[0.2em] flex items-center gap-2 text-[#00e59b] uppercase transition-all"
            >
              <ListFilter size={14} /> VIEW POLICIES
            </button>
            <button
              onClick={() => navigate('/forms')}
              className="fw-glass-btn hover:border-[#8b5cf6]/40 px-6 py-3 rounded-full font-bold text-[10px] tracking-[0.2em] flex items-center gap-2 text-[#8b5cf6] uppercase transition-all"
            >
              <FileCode size={14} /> VIEW FORMS
            </button>
          </div>
        </div>

        {/* 2. Stats Row */}
        <div className="grid grid-cols-4 gap-4 shrink-0 mb-6 z-10 w-full max-w-[1600px] mx-auto">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="fw-glass-btn rounded-2xl p-5 flex flex-col justify-between h-[120px] fw-group relative overflow-hidden bg-transparent">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold font-montserrat tracking-[0.15em] text-white/40 uppercase block mb-0.5">{stat.label}</span>
                    <span className="text-[10px] text-white/30 font-medium font-roboto uppercase tracking-widest">{stat.sub}</span>
                  </div>
                  <div className="p-1.5 bg-transparent rounded-lg border border-transparent group-hover:border-white/5 transition-colors">
                    <Icon size={14} style={{ color: stat.color }} className="opacity-80" />
                  </div>
                </div>
                <div className="text-[36px] font-light font-montserrat tracking-tight pb-3" style={{ color: stat.color }}>{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* 3. Main Content */}
        <div className="flex-1 min-h-0 z-10 w-full max-w-[1600px] mx-auto flex flex-col">

          {/* TAB 1: SYSTEM HIERARCHY */}
          {activeTab === 'hierarchy' && (
            <div className="flex flex-col gap-5 flex-1 fw-fade-in overflow-y-auto fw-no-scrollbar pb-10 pr-2">

              {/* LAYER 1 */}
              <div className="flex gap-4 shrink-0">
                <div className="w-[20%] rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden shrink-0 fw-glass-btn">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#ef4444]" />
                  <span className="text-[#ef4444] text-[9px] font-bold tracking-[0.2em] font-montserrat uppercase mb-1">Architecture Layer 1</span>
                  <div className="text-[18px] md:text-[20px] leading-tight font-light font-montserrat tracking-wide text-white">REGULATORY BOARD</div>
                </div>
                <div className="flex-1 flex gap-2 items-center pl-1">
                  {REGULATORY_ITEMS.map((reg, i) => {
                    const Icon = reg.icon;
                    const isRightSide = i >= 4;
                    return (
                      <button key={reg.id} className="fw-glass-btn flex flex-col items-center justify-center shrink-0 px-4 py-3 rounded-2xl fw-group cursor-default text-white/60 hover:text-white relative">
                        <Icon size={20} style={{ color: reg.color }} className="mb-1.5 opacity-70" />
                        <span className="font-montserrat font-bold text-[9px] tracking-[0.1em] uppercase text-center leading-snug px-1">{reg.shortName}</span>
                        <div className={`fw-tooltip ${isRightSide ? 'fw-tooltip-left' : ''}`}>
                          <strong className="block text-white mb-1">{reg.name}</strong>
                          {REG_DESCRIPTIONS[reg.id]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LAYER 2 */}
              <div className="flex gap-4 shrink-0">
                <div className="w-[20%] rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden shrink-0 fw-glass-btn">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#3b82f6]" />
                  <span className="text-[#3b82f6] text-[9px] font-bold tracking-[0.2em] font-montserrat uppercase mb-1">Architecture Layer 2</span>
                  <div className="text-[18px] md:text-[20px] leading-tight font-light font-montserrat tracking-wide text-white">10 STRATEGIC DOMAINS</div>
                </div>
                <div className="flex-1 pl-1">
                  <div className="grid grid-cols-5 gap-3 w-max">
                    {DOMAINS.map((domain, i) => {
                      const Icon = domain.icon;
                      const isRightSide = (i % 5) >= 3;
                      return (
                        <button key={domain.code} className="fw-glass-btn flex flex-col items-center justify-center w-[110px] aspect-square rounded-2xl fw-group cursor-default relative">
                          <Icon size={24} style={{ color: domain.color }} className="mb-2 opacity-70" />
                          <span className="font-mono font-bold text-[15px] leading-none mb-1 text-white/80">{domain.code}</span>
                          <span className="text-[8px] text-white/40 font-bold uppercase tracking-[0.12em] text-center px-1 whitespace-nowrap">{domain.name}</span>
                          <div className={`fw-tooltip ${isRightSide ? 'fw-tooltip-left' : ''}`}>
                            <strong className="block text-white mb-1">{domain.name} Domain</strong>
                            {DOMAIN_DESCRIPTIONS[domain.code]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* LAYER 3 */}
              <div className="flex gap-4 shrink-0">
                <div className="w-[20%] rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden shrink-0 fw-glass-btn">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]" />
                  <span className="text-[#f97316] text-[9px] font-bold tracking-[0.2em] font-montserrat uppercase mb-1">Architecture Layer 3</span>
                  <div className="text-[18px] md:text-[20px] leading-tight font-light font-montserrat tracking-wide text-white">46 PILLAR SUBDOMAINS</div>
                </div>
                <div className="flex-1 rounded-2xl p-4 flex items-center fw-glass-btn cursor-default">
                  <div className="flex flex-wrap gap-x-6 gap-y-3 px-2 w-full">
                    {allSubdomains.map((subId, i) => {
                      const domainCode = subId.split('-')[0];
                      const domain = DOMAINS.find(d => d.code === domainCode);
                      return (
                        <div key={i} className="relative fw-group fw-fast-decay inline-block">
                          <span className="text-[11px] font-bold font-montserrat tracking-[0.15em] text-white/40 hover:text-white transition-colors cursor-default whitespace-nowrap">
                            {subId}
                          </span>
                          <div className="fw-tooltip-fast">
                            Structural operational pillar housing specific procedures for the <strong>{domain ? domain.name : 'associated'}</strong> framework.
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* LAYER 4 */}
              <div className="flex gap-4 shrink-0">
                <div className="w-[20%] flex flex-col shrink-0">
                  <div className="flex-1 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden text-left fw-glass-btn cursor-default">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#eab308]" />
                    <span className="text-[#eab308] text-[9px] font-bold tracking-[0.2em] font-montserrat uppercase mb-1">Architecture Layer 4</span>
                    <div className="text-[18px] md:text-[20px] leading-tight font-light font-montserrat tracking-wide text-white">269 MANAGED POLICIES</div>
                  </div>
                </div>
                <div className="flex-1 flex gap-3">
                  {[
                    { icon: <Users size={16} />, iconColor: 'text-purple-400', title: 'Stewardship', desc: 'Named owners (DON, CFO, HR Director) assigned at subdomain level.' },
                    { icon: <Lock size={16} />, iconColor: 'text-cyan-400', title: 'Access Tiers', desc: 'Tier 1 (Public) to Tier 4 (Privileged). Role-specific visibility logic applied.' },
                    { icon: <RefreshCw size={16} />, iconColor: 'text-emerald-400', title: 'Review Cycle', desc: 'Annual or Biennial mandatory review frequency determined by regulatory risk.' },
                  ].map((item, i) => (
                    <div key={i} className="flex-1 fw-glass-btn rounded-2xl p-4 flex flex-col justify-center cursor-default">
                      <div className="flex gap-3 items-center">
                        <div className={`p-2 bg-transparent border border-transparent rounded-xl ${item.iconColor} shrink-0`}>{item.icon}</div>
                        <div className="flex flex-col">
                          <h4 className="text-[10px] font-bold text-white uppercase font-montserrat tracking-[0.2em] mb-1">{item.title}</h4>
                          <p className="text-[10px] text-white/50 leading-snug font-roboto pr-1 line-clamp-2">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LAYER 5 */}
              <div className="flex gap-4 shrink-0">
                <div className="w-[20%] rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden shrink-0 fw-glass-btn">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#a855f7]" />
                  <span className="text-[#a855f7] text-[9px] font-bold tracking-[0.2em] font-montserrat uppercase mb-1">Architecture Layer 5</span>
                  <div className="text-[18px] md:text-[20px] leading-tight font-light font-montserrat tracking-wide text-white">FORMS & SYSTEM</div>
                </div>
                <div className="flex-1 flex gap-3">
                  {[
                    { icon: <LayoutList size={16} />, bg: 'bg-[#a855f7]/10', border: 'border-[#a855f7]/20', color: 'text-[#a855f7]', title: 'Form Builder', desc: '176+ Canonical templates with dynamic routing and smart logic.' },
                    { icon: <Printer size={16} />, bg: 'bg-[#ec4899]/10', border: 'border-[#ec4899]/20', color: 'text-[#ec4899]', title: 'Print & Export', desc: 'PDF generation, batch printing, and regulatory audit exports.' },
                    { icon: <FileSignature size={16} />, bg: 'bg-[#3b82f6]/10', border: 'border-[#3b82f6]/20', color: 'text-[#3b82f6]', title: 'Sign & Cloud', desc: 'E-Signature workflows and automated syncing to Dropbox / Drive.' },
                  ].map((item, i) => (
                    <div key={i} className="flex-1 fw-glass-btn rounded-2xl p-4 flex flex-col justify-center cursor-default fw-group">
                      <div className="flex gap-3 items-center mb-1.5">
                        <div className={`p-2 ${item.bg} border ${item.border} rounded-xl ${item.color} shrink-0`}>{item.icon}</div>
                        <h4 className="text-[10px] font-bold text-white uppercase font-montserrat tracking-[0.2em]">{item.title}</h4>
                      </div>
                      <p className="text-[10px] text-white/50 leading-snug font-roboto pr-1 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOVERNANCE LIFECYCLE */}
          {activeTab === 'lifecycle' && (
            <div className="flex gap-6 flex-1 min-h-0 fw-fade-in">

              {/* LEFT: Lifecycle Timeline */}
              <div className="flex-1 fw-glass-btn rounded-[24px] p-8 md:p-10 flex flex-col relative">
                <div className="flex items-center gap-4 mb-10">
                  <RefreshCw className="text-[#00e59b]" size={28} />
                  <h2 className="text-3xl font-montserrat font-light text-white tracking-wide">Governance Lifecycle</h2>
                </div>
                <div className="flex-1 relative flex flex-col justify-between py-2 ml-4">
                  <div className="absolute left-[9px] top-6 bottom-8 w-[2px] bg-white/[0.08]" />
                  {[
                    { label: 'DRAFT', color: '#f97316', dotClass: 'bg-[#f97316]', desc: 'Policy initial creation and stakeholder development.', hover: 'Initial policy authoring, stakeholder review, and cross-functional alignment phase.' },
                    { label: 'ACTIVE', color: '#00e59b', dotClass: 'bg-[#00e59b]', desc: 'Policy is published, in force, and operationally enforced.', hover: 'Policy is formally approved, integrated into operations, and actively audited for compliance.' },
                    { label: 'UNDER REVIEW', color: '#3b82f6', dotClass: 'bg-[#3b82f6]', desc: 'Active policy currently under scheduled or triggered revision.', hover: 'Subjected to annual/biennial evaluation or triggered directly by a regulatory framework update.' },
                    { label: 'ARCHIVED', color: '#9ca3af', dotClass: 'bg-[#6b7280]', desc: 'Policy has been formally retired with documented justification.', hover: 'Terminal state. Used only when a policy is being legally retired with documented rationale and audit trail.' },
                  ].map((item, i) => (
                    <div key={i} className="relative pl-12 flex flex-col justify-center fw-group cursor-default self-start">
                      <div className="absolute left-0 top-1.5 w-[20px] h-[20px] rounded-full flex items-center justify-center bg-[#0a0a0a] border-4 border-[#141414] shadow-sm z-10">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.dotClass}`} />
                      </div>
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-2 rounded-full font-bold uppercase tracking-widest px-3 py-1 text-[9px]"
                          style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}40`, color: item.color }}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.dotClass}`} />
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[13px] text-white/50 leading-relaxed font-roboto">{item.desc}</p>
                      <div className="fw-tooltip">
                        <strong className="block text-white mb-1 uppercase tracking-widest text-[9px]" style={{ color: item.color }}>{item.label} PHASE</strong>
                        {item.hover}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Metadata Validation */}
              <div className="flex-1 fw-glass-btn rounded-[24px] p-8 md:p-10 flex flex-col relative">
                <div className="absolute inset-0 overflow-hidden rounded-[24px] pointer-events-none">
                  <ShieldCheck className="absolute -right-8 top-16 text-white/[0.02]" size={350} />
                </div>
                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <Settings className="text-[#00e59b]" size={28} />
                  <h2 className="text-3xl font-montserrat font-light text-white tracking-wide">Metadata Validation</h2>
                </div>
                <div className="flex flex-col gap-4 flex-1 relative z-10 justify-center">
                  {[
                    { text: 'Every artifact must have Owner, Status, and Description', hover: 'Ensures strict accountability and tracks the definitive lifecycle state of every operational document.' },
                    { text: 'Namespace coding follows [XX]-[XX]-[NNN] format', hover: 'Maintains a highly structured taxonomy guaranteeing consistent ID formatting and sorting logic.' },
                    { text: 'Regulatory cross-reference mapping (42 CFR Part 484)', hover: 'Maps policies directly to precise federal and state mandates to close compliance gaps.' },
                    { text: 'Role-based Access Visibility (Tiers 1-4)', hover: 'Restricts document visibility securely to authorized personnel based on governance clearance tiers.' },
                    { text: 'Defined Review Cycle Management (Annual/Biennial)', hover: 'Guarantees policies remain continuously current with the shifting regulatory and legal landscape.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-transparent px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-sm relative fw-group cursor-default">
                      <CheckCircle2 className="text-[#00e59b] shrink-0" size={18} />
                      <span className="text-[13px] font-medium text-white/70 leading-relaxed">{item.text}</span>
                      <div className="fw-tooltip fw-tooltip-left">{item.hover}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 relative z-10">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase font-montserrat">ALIGNMENT SCORE</span>
                    <span className="text-4xl font-light font-mono text-[#00e59b] leading-none">100%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-[#00e59b] rounded-full shadow-[0_0_15px_rgba(0,229,155,0.8)]" />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
