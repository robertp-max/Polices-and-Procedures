import { useMemo, useState, useCallback } from 'react';
import { usePolicyStore } from '@/policy/stores/policyStore';
import type { Policy } from '@/policy/types';
import {
  Shield, Search, X, CheckCircle, AlertTriangle, FileText,
  Building2, Users, DollarSign, Monitor, BarChart3, Heart, Cpu, Briefcase,
  GitBranch, Landmark, ShieldCheck, Gavel, ChevronLeft, Printer,
  LayoutList, Lock, FileCheck, Scale, Target,
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════

const DOMAINS = [
  { code: 'GV', name: 'GOVERNANCE',         icon: Building2,    color: '#00e59b', subdomains: [{ code: 'GB', name: 'Governing Body' }, { code: 'OG', name: 'Organization' }, { code: 'PM', name: 'Policy Management' }, { code: 'EA', name: 'External Affairs' }] },
  { code: 'CL', name: 'CLINICAL OPERATIONS', icon: Heart,        color: '#ef4444', subdomains: [{ code: 'PA', name: 'Patient Assessment' }, { code: 'CP', name: 'Care Planning' }, { code: 'OA', name: 'OASIS' }, { code: 'SD', name: 'Service Delivery' }, { code: 'IC', name: 'Infection Control' }, { code: 'DC', name: 'Discharge' }, { code: 'CA', name: 'Clinical Assessment' }, { code: 'CD', name: 'Clinical Documentation' }, { code: 'PR', name: 'Patient Rights' }] },
  { code: 'QA', name: 'QAPI',               icon: BarChart3,    color: '#06b6d4', subdomains: [{ code: 'PG', name: 'QAPI Program' }, { code: 'SM', name: 'Star Monitoring' }, { code: 'AE', name: 'Adverse Events' }, { code: 'PI', name: 'PIPs' }] },
  { code: 'HR', name: 'HUMAN RESOURCES',    icon: Users,        color: '#8b5cf6', subdomains: [{ code: 'TA', name: 'Talent Acquisition' }, { code: 'TD', name: 'Training & Dev' }, { code: 'WM', name: 'Workforce Mgmt' }, { code: 'ER', name: 'Employee Relations' }, { code: 'JD', name: 'Job Descriptions' }] },
  { code: 'CO', name: 'COMPLIANCE',         icon: Shield,       color: '#3b82f6', subdomains: [{ code: 'CP', name: 'Compliance Program' }, { code: 'HP', name: 'HIPAA & Privacy' }, { code: 'FA', name: 'Fraud & Abuse' }, { code: 'RA', name: 'Regulatory Affairs' }, { code: 'DC', name: 'Doc Compliance' }] },
  { code: 'FN', name: 'FINANCE',            icon: DollarSign,   color: '#10b981', subdomains: [{ code: 'FP', name: 'Financial Planning' }, { code: 'RC', name: 'Revenue Cycle' }, { code: 'BL', name: 'Billing' }, { code: 'CM', name: 'Coding & Classification' }] },
  { code: 'OP', name: 'OPERATIONS',         icon: Briefcase,    color: '#f97316', subdomains: [{ code: 'IM', name: 'Intake Mgmt' }, { code: 'SL', name: 'Service Logistics' }, { code: 'PA', name: 'Patient Access' }, { code: 'FM', name: 'Facility Admin' }] },
  { code: 'IT', name: 'IT & SECURITY',      icon: Monitor,      color: '#6366f1', subdomains: [{ code: 'SC', name: 'Security Controls' }, { code: 'DR', name: 'Data & Recovery' }, { code: 'SA', name: 'Systems Admin' }, { code: 'UP', name: 'Use Policies' }] },
  { code: 'RM', name: 'RISK MANAGEMENT',    icon: AlertTriangle, color: '#eab308', subdomains: [{ code: 'ER', name: 'Enterprise Risk' }, { code: 'SS', name: 'Staff Safety' }, { code: 'PS', name: 'Patient Safety' }, { code: 'EP', name: 'Emergency Plan' }] },
  { code: 'EN', name: 'ENTERPRISE CONTROL', icon: Cpu,          color: '#ec4899', subdomains: [{ code: 'TG', name: 'Taxonomy Gov' }, { code: 'LC', name: 'Lifecycle Control' }, { code: 'CM', name: 'Compliance Metrics' }] },
] as const;

type DomainCode = typeof DOMAINS[number]['code'];

const REGULATORY_ITEMS = [
  { id: 'title22', shortName: 'Title 22',     color: '#facc15', icon: Landmark },
  { id: '42cfr',   shortName: '42 CFR §484',  color: '#00e59b', icon: Scale },
  { id: 'cms',     shortName: 'CMS State Ops', color: '#ec4899', icon: FileCheck },
  { id: 'hipaa',   shortName: 'HIPAA',        color: '#3b82f6', icon: Lock },
  { id: 'osha',    shortName: 'OSHA',         color: '#f59e0b', icon: Shield },
  { id: 'oig',     shortName: 'OIG',          color: '#8b5cf6', icon: ShieldCheck },
  { id: 'fca',     shortName: 'FCA',          color: '#a855f7', icon: Gavel },
] as const;

// ── REGULATORY TAG LOGIC ──
function matchesPat(id: string, pats: string[]) {
  return pats.some(p => p.endsWith('*') ? id.startsWith(p.slice(0, -1)) : id === p);
}
function getTagsForPolicy(id: string): string[] {
  const tags: string[] = [];
  const u = id.toUpperCase();
  if (u === 'GV-GB-001') {
    tags.push('42cfr', 'title22', 'hipaa', 'oig', 'fca', 'cms');
  }
  if (matchesPat(u, ['GV-EA-004','GV-OG-002','GV-OG-003','HR-TA-001','HR-TA-004','HR-EH-101','RM-OS-101','RM-EP-001','RM-EP-002','FN-BC-001','FN-FP-005'])) tags.push('title22');
  if (matchesPat(u, ['CO-HP-*','CO-BA-101','CO-IR-101','CO-DG-101','CO-DC-001']) && !matchesPat(u, ['CO-FW-101','CO-AI-101','HR-TR-101','HR-EH-101'])) tags.push('hipaa');
  if (matchesPat(u, ['FN-BC-001','FN-CM-003','CL-CD-001','QA-PI-002','CO-CP-005','CO-FW-101'])) tags.push('fca');
  if (matchesPat(u, ['CL-SD-001','CL-SD-002','CL-SD-012','CL-SD-016','CL-SD-017','CL-CD-001','QA-*','HR-TR-101'])) tags.push('cms');
  if (matchesPat(u, ['CO-*','FN-BC-001','FN-CM-003','CL-CD-001','CL-SD-001','CL-SD-002','QA-*','HR-TA-002','HR-TA-003'])) tags.push('oig');
  if (matchesPat(u, ['RM-SS-*','RM-OS-101','HR-EH-101'])) tags.push('osha');
  if (matchesPat(u, ['GV-*','CL-*','QA-*','OP-*'])) tags.push('42cfr');
  return [...new Set(tags)];
}
function toDisplayStatus(s: string): 'ACTIVE' | 'DRAFT' | 'UNDER_REVIEW' | 'ARCHIVED' {
  if (s === 'Draft' || s === 'Revision Requested') return 'DRAFT';
  if (s === 'Under Review') return 'UNDER_REVIEW';
  if (s === 'Archived') return 'ARCHIVED';
  return 'ACTIVE';
}

// ══════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════

type PolicyWithExtras = Policy & { _displayStatus: string; _regulatoryTags: string[] };

// ── POLICY DETAIL VIEW ──
function PolicyDetailView({ policy, onBack }: { policy: PolicyWithExtras; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Overview & Definitions', 'Policy Statements', 'Procedures', 'Documentation', 'Compliance & Audit', 'References & Admin'];
  const statusColor = policy._displayStatus === 'ACTIVE' ? '#00e59b' : policy._displayStatus === 'DRAFT' ? '#f97316' : '#3b82f6';

  return (
    <div className="demo-view-enter w-full flex flex-col h-full text-white">
      {/* Nav row */}
      <div className="shrink-0 flex justify-between items-center mb-5">
        <button onClick={onBack}
          className="text-[#00e59b] font-montserrat text-[11px] font-bold tracking-[0.2em] flex items-center gap-2 hover:opacity-70 uppercase transition-opacity">
          <ChevronLeft size={15} /> TAXONOMY OVERVIEW
        </button>
        <button className="border border-white/20 hover:bg-white/5 px-4 py-2 rounded-full font-montserrat font-bold text-[10px] tracking-widest transition-colors flex items-center gap-2 text-white/80 uppercase">
          <Printer size={13} /> EXPORT
        </button>
      </div>

      {/* Badges */}
      <div className="shrink-0 flex flex-wrap gap-2 mb-4">
        <span className="border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-bold text-white tracking-widest uppercase font-mono">{policy.id}</span>
        <span className="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase font-montserrat"
          style={{ background: `${statusColor}20`, border: `1px solid ${statusColor}50`, color: statusColor }}>
          {policy._displayStatus === 'UNDER_REVIEW' ? 'UNDER REVIEW' : policy._displayStatus}
        </span>
        <span className="border border-white/10 bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-bold text-white/60 tracking-widest uppercase font-montserrat">{policy.tier}</span>
      </div>

      {/* Title */}
      <h1 className="shrink-0 font-montserrat text-2xl md:text-3xl font-light text-white mb-6 tracking-wide leading-tight">{policy.title}</h1>

      {/* Meta grid */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-5 mb-6 border-b border-white/10 pb-6">
        {[
          { label: 'Domain', val: policy.domainCode },
          { label: 'Tier', val: policy.tier },
          { label: 'Owner', val: policy.ownerSteward },
          { label: 'Version', val: `v${policy.currentVersion}` },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold font-montserrat mb-1">{label}</p>
            <p className="text-[13px] text-white/80 font-light">{val}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex overflow-x-auto scrollbar-none border-b border-white/10 mb-5">
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`pb-3 px-4 font-montserrat text-[10px] font-bold tracking-[0.15em] uppercase whitespace-nowrap transition-colors border-b-2 ${
              i === activeTab ? 'text-[#00e59b] border-[#00e59b]' : 'text-white/35 hover:text-white/70 border-transparent'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {activeTab === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="border-l-[3px] border-[#00e59b] pl-5">
              <h2 className="font-montserrat text-[12px] font-bold text-white flex items-center gap-2 mb-4 tracking-widest uppercase">
                <Target className="text-[#00e59b]" size={16} /> Purpose
              </h2>
              <p className="text-white/65 text-sm leading-relaxed">
                This policy establishes enterprise-wide standards for <em>{policy.title}</em>, ensuring compliance with applicable federal and state regulatory requirements governing home health agency operations, documentation, and patient care delivery.
              </p>
            </div>
            <div className="border-l-[3px] border-[#e85200] pl-5">
              <h2 className="font-montserrat text-[12px] font-bold text-white flex items-center gap-2 mb-4 tracking-widest uppercase">
                <Search className="text-[#e85200]" size={16} /> Scope
              </h2>
              <ul className="space-y-3">
                {['All clinical and administrative personnel', 'Agency management and department leads', 'Contracted and per-diem staff as applicable'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="text-[#e85200] mt-0.5 shrink-0" size={13} />
                    <span className="text-white/65 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-white/20">
            <FileText size={32} className="mx-auto mb-4 text-white/10" />
            <p className="font-montserrat text-sm font-light tracking-wider">Content pending authoring.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════

export function FrameworkShowcase() {
  const storePolicies = usePolicyStore(state => state.policies);

  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedSubdomain, setSelectedSubdomain] = useState('ALL');
  const [activeRegFilters, setActiveRegFilters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [detailPolicy, setDetailPolicy] = useState<PolicyWithExtras | null>(null);

  // Enrich store policies with display status + regulatory tags
  const policies = useMemo<PolicyWithExtras[]>(() =>
    storePolicies.map(p => ({
      ...p,
      _displayStatus: toDisplayStatus(p.lifecycleStatus),
      _regulatoryTags: getTagsForPolicy(p.id),
    })),
  [storePolicies]);

  const allSubsList = useMemo(() =>
    DOMAINS.flatMap(d => d.subdomains.map(s => ({ ...s, domainCode: d.code as DomainCode, color: d.color }))),
  []);

  const subOptions = useMemo(() =>
    selectedDomain === 'ALL'
      ? allSubsList
      : (DOMAINS.find(d => d.code === selectedDomain)?.subdomains ?? []).map(s => ({
          ...s,
          domainCode: selectedDomain as DomainCode,
          color: DOMAINS.find(d => d.code === selectedDomain)!.color,
        })),
  [selectedDomain, allSubsList]);

  const scopedPolicies = useMemo(() => {
    let p = policies;
    if (selectedDomain !== 'ALL') p = p.filter(x => x.domainCode === selectedDomain);
    if (selectedSubdomain !== 'ALL') p = p.filter(x => x.subdomainCode === selectedSubdomain);
    return p;
  }, [policies, selectedDomain, selectedSubdomain]);

  const visiblePolicies = useMemo(() => {
    let p = scopedPolicies;
    if (activeRegFilters.size > 0) p = p.filter(x => [...activeRegFilters].every(f => x._regulatoryTags.includes(f)));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      p = p.filter(x => x.id.toLowerCase().includes(q) || x.title.toLowerCase().includes(q));
    }
    return p;
  }, [scopedPolicies, activeRegFilters, searchQuery]);

  const activeCount = useMemo(() => visiblePolicies.filter(p => p._displayStatus === 'ACTIVE').length, [visiblePolicies]);

  const toggleReg = useCallback((id: string) => {
    setActiveRegFilters(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);
  const pickDomain = useCallback((code: string) => { setSelectedDomain(code); setSelectedSubdomain('ALL'); }, []);
  const pickSubdomain = useCallback((subCode: string, domCode?: string) => {
    if (domCode) setSelectedDomain(domCode);
    setSelectedSubdomain(prev => prev === subCode ? 'ALL' : subCode);
  }, []);

  // ── DETAIL VIEW ──
  if (detailPolicy) {
    return (
      <div className="h-full w-full flex flex-col relative z-10 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar p-6 md:p-10">
        <PolicyDetailView policy={detailPolicy} onBack={() => setDetailPolicy(null)} />
      </div>
    );
  }

  // ── GRID VIEW ──
  return (
    <div className="h-full w-full flex flex-col relative z-10 overflow-hidden">

      {/* ═══ FIXED HEADER ═══ */}
      <div className="shrink-0 px-6 md:px-10 pt-5 pb-0">

        {/* Title row */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[10px] font-montserrat font-bold text-[#FFC107] uppercase tracking-widest mb-1">TAXONOMY OVERVIEW</p>
            <h1 className="font-montserrat text-2xl font-light text-white tracking-wide">
              Enterprise Framework&nbsp;<span className="text-white/25 text-lg font-mono align-middle">v6.0</span>
            </h1>
          </div>
          <button className="border border-white/15 hover:bg-white/5 px-4 py-2 rounded-full font-montserrat font-bold text-[10px] tracking-widest transition-colors flex items-center gap-2 text-white/60 uppercase">
            <Printer size={13} /> EXPORT LIST
          </button>
        </div>

        {/* ─ LAYER 1 — REGULATORY BOARD ─ */}
        <div className="mb-3">
          <p className="font-montserrat text-[10px] font-bold tracking-widest uppercase border-l-[3px] border-red-500 pl-2.5 mb-2 flex items-center gap-2">
            <ShieldCheck className="text-red-500" size={12} /><span className="text-white/70">Layer 1 — Regulatory Board</span>
          </p>
          <div className="flex flex-wrap gap-1.5 pl-3">
            {REGULATORY_ITEMS.map(reg => {
              const active = activeRegFilters.has(reg.id);
              const Icon = reg.icon;
              return (
                <button key={reg.id} onClick={() => toggleReg(reg.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-montserrat text-[10px] font-bold tracking-widest uppercase"
                  style={{
                    border: `1px solid ${active ? reg.color : 'rgba(255,255,255,0.1)'}`,
                    background: active ? `${reg.color}14` : 'rgba(255,255,255,0.02)',
                    color: active ? reg.color : 'rgba(255,255,255,0.5)',
                  }}>
                  <Icon size={11} />{reg.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─ LAYER 2 — DOMAINS ─ */}
        <div className="mb-3">
          <p className="font-montserrat text-[10px] font-bold tracking-widest uppercase border-l-[3px] border-blue-400 pl-2.5 mb-2 flex items-center gap-2">
            <LayoutList className="text-blue-400" size={12} /><span className="text-white/70">Layer 2 — Domains</span>
          </p>
          <div className="flex flex-col gap-2 pl-3">
            <button onClick={() => pickDomain('ALL')}
              className={`w-fit px-3.5 py-1.5 rounded-full font-montserrat text-[10px] font-bold tracking-widest uppercase transition-all ${
                selectedDomain === 'ALL' ? 'bg-white/10 border border-white/20 text-white' : 'text-white/40 hover:text-white/75'
              }`}>
              ALL DOMAINS
            </button>
            <div className="grid grid-cols-5 gap-1.5">
              {DOMAINS.map(d => {
                const active = selectedDomain === d.code;
                const Icon = d.icon;
                return (
                  <button key={d.code} onClick={() => pickDomain(d.code)}
                    className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-full font-montserrat text-[9px] font-bold tracking-widest uppercase transition-all ${
                      active ? 'bg-white/10 border border-white/20 text-white' : 'text-white/40 hover:text-white/75 border border-transparent'
                    }`}
                    style={active ? { borderColor: `${d.color}40`, backgroundColor: `${d.color}10`, color: d.color } : undefined}>
                    <Icon size={10} style={{ color: active ? d.color : undefined }} />{d.code}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─ LAYER 3 — SUBDOMAINS ─ */}
        <div className="mb-3">
          <p className="font-montserrat text-[10px] font-bold tracking-widest uppercase border-l-[3px] border-orange-500 pl-2.5 mb-2 flex items-center gap-2">
            <GitBranch className="text-orange-500" size={12} /><span className="text-white/70">Layer 3 — Subdomains</span>
          </p>
          {selectedDomain === 'ALL' ? (
            <div className="flex flex-wrap gap-x-0.5 gap-y-1 pl-3">
              {allSubsList.map(s => (
                <button key={`${s.domainCode}-${s.code}`} title={s.name}
                  onClick={() => pickSubdomain(s.code, s.domainCode)}
                  className="px-2 py-1 font-montserrat font-bold text-[8px] uppercase tracking-wider text-white/30 hover:text-white transition-colors border border-transparent hover:border-white/10 rounded">
                  {s.domainCode}-{s.code}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 pl-3">
              <button onClick={() => setSelectedSubdomain('ALL')}
                className={`px-3 py-1 rounded-full font-montserrat font-bold text-[9px] uppercase tracking-wider transition-all ${
                  selectedSubdomain === 'ALL' ? 'text-white bg-white/10 border border-white/20' : 'text-white/30 hover:text-white/70'
                }`}>
                ALL SUBDOMAINS
              </button>
              {subOptions.map(s => {
                const active = selectedSubdomain === s.code;
                return (
                  <button key={s.code} onClick={() => pickSubdomain(s.code)}
                    className="px-3 py-1 rounded-full font-montserrat font-bold text-[9px] uppercase tracking-wider transition-all"
                    style={{
                      color:       active ? s.color : 'rgba(255,255,255,0.35)',
                      border:      `1px solid ${active ? `${s.color}50` : 'transparent'}`,
                      background:  active ? `${s.color}12` : undefined,
                    }}>
                    {selectedDomain}-{s.code} · {s.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ─ LAYER 4 — POLICIES header ─ */}
        <div>
          <p className="font-montserrat text-[10px] font-bold tracking-widest uppercase border-l-[3px] border-yellow-400 pl-2.5 mb-2 flex items-center gap-2">
            <FileText className="text-yellow-400" size={12} /><span className="text-white/70">Layer 4 — Policies</span>
          </p>
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5 pl-3">
            <div className="flex items-center gap-2 border-b border-white/15 pb-1">
              <Search size={13} className="text-white/35 shrink-0" />
              <input type="text" placeholder="Search Title, ID, or Keywords..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent w-56 outline-none text-[13px] text-white placeholder:text-white/25 font-roboto" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-white/30 hover:text-white"><X size={11} /></button>
              )}
            </div>
            <div className="flex items-center gap-4 pb-1">
              <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold font-montserrat">SCOPE:</span>
              <span className="text-[13px] font-mono text-white font-bold">
                {visiblePolicies.length}&nbsp;<span className="text-white/35 text-[11px] font-normal">Policies</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00e59b]" />
                <span className="text-[13px] font-mono text-white font-bold">{activeCount}</span>
              </span>
            </div>
          </div>
        </div>

      </div>{/* end header */}

      {/* ═══ POLICY CARD GRID ═══ */}
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar px-6 md:px-10 pb-6">
        {visiblePolicies.length === 0 ? (
          <div className="text-center py-20 text-white/20">
            <Search size={36} className="mx-auto mb-4 text-white/10" />
            <p className="text-lg font-light font-montserrat">No policies match criteria.</p>
          </div>
        ) : (
          <div className="demo-view-enter pl-3 mt-3"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
            {visiblePolicies.map(policy => {
              const domain = DOMAINS.find(d => d.code === policy.domainCode);
              const color = domain?.color ?? '#ffffff';
              const dotColor = policy._displayStatus === 'ACTIVE' ? '#00e59b' : policy._displayStatus === 'DRAFT' ? '#f97316' : '#3b82f6';
              return (
                <button key={policy.id} onClick={() => setDetailPolicy(policy)}
                  className="flex flex-col text-left p-4 rounded-xl border border-white/[0.06] bg-transparent hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 group"
                  style={{ height: 148 }}>
                  <div className="text-[10px] font-bold font-mono tracking-wider mb-1.5" style={{ color }}>{policy.id}</div>
                  <h3 className="text-[12px] text-white/82 font-medium leading-snug line-clamp-3 mb-auto group-hover:text-white transition-colors">{policy.title}</h3>
                  <div className="flex items-center justify-between w-full mt-3">
                    <span className="text-[8px] uppercase tracking-widest text-white/35 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded font-montserrat">
                      {policy.tier?.substring(0, 3) ?? 'REQ'}
                    </span>
                    <span className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

