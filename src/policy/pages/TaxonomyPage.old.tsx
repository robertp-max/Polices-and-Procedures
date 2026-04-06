import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, FileText, ShieldCheck, Lock,
  ChevronRight, CheckCircle, AlertTriangle, Shield,
  Database, Eye, Tag, AlertCircle, Zap,
  ArrowRight, XCircle, CheckSquare,
  ChevronDown, ChevronUp, Network, Target, RefreshCcw,
  CheckCircle2, FileEdit,
} from 'lucide-react';
import { useFrameworkStore } from '@/policy/stores/frameworkStore';
import { usePolicyStore } from '@/policy/stores/policyStore';
import type { Policy } from '@/policy/types';

// --- SMALL BUILDER-STYLE COMPONENTS ---

function Pill({ label }: { label: string }) {
  return (
    <div className="bg-white/80 border border-[#059669]/20 text-[#059669] px-2 py-0.5 rounded-[3px] text-[6.5px] font-montserrat font-bold whitespace-nowrap shadow-sm">
      {label}
    </div>
  );
}

function DomainCard({ code }: { code: string }) {
  return (
    <div className="bg-white border border-[#C74600]/30 rounded-[4px] shadow-sm flex flex-col items-center justify-center p-1 w-[45px]">
      <span className="text-[#C74600] font-montserrat font-bold text-[20px] leading-none">{code}</span>
      <span className="text-gray-400 font-montserrat font-bold text-[5px] uppercase mt-0.5">DOMAIN</span>
    </div>
  );
}

function KpiCard({ title, value, sub, color, valColor, icon, bg = 'bg-white/[0.03]' }: {
  title: string; value: string | number; sub: string; color: string; valColor: string; icon: React.ReactNode; bg?: string;
}) {
  return (
    <div className={`${bg} backdrop-blur-3xl rounded-2xl border border-white/5 border-t-2 ${color} shadow-sm p-6 flex flex-col justify-between transition-transform hover:-translate-y-1 cursor-default`}>
      <div className="flex justify-between items-start mb-4">
        <span className={`text-xs font-montserrat font-bold uppercase tracking-widest ${valColor} opacity-70`}>{title}</span>
        <span className={valColor}>{icon}</span>
      </div>
      <div className={`text-5xl font-montserrat font-bold ${valColor} leading-none mt-2`}>{value}</div>
      <p className="text-xs font-montserrat font-bold text-white/50 uppercase tracking-widest mt-4">{sub}</p>
    </div>
  );
}

function DictionaryCard({ title, subtitle, desc, icon }: { title: string; subtitle: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-[6px] p-2 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[18px] font-montserrat font-bold text-gray-900">{title}</span>
        <span className="text-gray-400">{icon}</span>
      </div>
      <span className="text-[6.5px] font-montserrat font-bold text-[#C74600] uppercase tracking-widest mb-1">{subtitle}</span>
      <span className="text-[16px] text-gray-600 font-roboto leading-tight">{desc}</span>
    </div>
  );
}

// --- DOC LEVELS DATA (CL-OA-006) ---
const DOC_LEVELS = [
  { level: 1, name: 'Direct Observation',    authority: 'HIGHEST',  risk: 'COMPLIANT',     riskBg: 'bg-[#059669]', barBg: 'bg-[#059669]', nodeBg: 'bg-[#059669]', barW: '100%',
    desc: 'Clinician directly witnesses the patient performing a function during the assessment visit. Documented with specific behavioral observation.',
    example: 'Observed patient ambulate 50 ft with rolling walker — step-over-step gait, no loss of balance.', flagType: '' },
  { level: 2, name: 'Physical Examination',  authority: 'HIGH',     risk: 'COMPLIANT',     riskBg: 'bg-[#059669]', barBg: 'bg-[#0e9f6e]', nodeBg: 'bg-[#0e9f6e]', barW: '87%',
    desc: 'Hands-on assessment with instruments yielding objective, measurable findings documented by the clinician.',
    example: 'Goniometer: AROM knee flexion 85°. Dynamometer grip: 18 lbs L hand.', flagType: '' },
  { level: 3, name: 'Standardized Tools',    authority: 'MOD-HIGH', risk: 'LOW RISK',      riskBg: 'bg-[#D97706]', barBg: 'bg-[#007970]', nodeBg: 'bg-[#007970]', barW: '74%',
    desc: 'Validated instruments administered by clinician with scores recorded by date and administering clinician name.',
    example: 'PHQ-2: 4/6. BBS: 32/56. MoCA: 22/30. TUG: 18.2 sec.',
    flag: 'Requires administration during current visit — scores from prior assessments are Level 6.', flagType: 'warning' },
  { level: 4, name: 'Patient Report (Corroborated)', authority: 'MODERATE', risk: 'MOD RISK', riskBg: 'bg-[#D97706]', barBg: 'bg-blue-500', nodeBg: 'bg-blue-500', barW: '61%',
    desc: 'Subjective report corroborated by at least one objective clinical cue — bruising, medication review, vital sign pattern, or physical finding.',
    example: 'Patient reports 3 falls — corroborated by bruising bilateral shins and 4 Beers Criteria medications.',
    flag: 'Subjective report alone (without corroboration) = Level 5. Must document the corroborating finding explicitly.', flagType: 'warning' },
  { level: 5, name: 'Single-Source Report', authority: 'LOW',     risk: 'HIGH RISK',     riskBg: 'bg-[#C74600]', barBg: 'bg-amber-400', nodeBg: 'bg-amber-400', barW: '48%',
    desc: "Patient or caregiver statement with no supporting objective clinical evidence. No instrument. No corroboration.",
    example: "Patient states 'does everything independently' — accepted without TUG, BBS, or functional observation.",
    flag: 'INSUFFICIENT for GG0130 items. Must administer Level 1–3 assessment or document clinical contraindication.', flagType: 'warning' },
  { level: 6, name: 'External / Inference',  authority: 'LOWEST',  risk: 'NON-COMPLIANT', riskBg: 'bg-[#D70101]', barBg: 'bg-[#D70101]', nodeBg: 'bg-[#D70101]', barW: '35%',
    desc: 'Hospital discharge summary, prior agency records, physician notes, verbal report, or clinician inference from diagnosis alone.',
    example: 'GG0130 coded from hospital discharge functional summary. Mobility impairment inferred from stroke diagnosis without reassessment.',
    flag: 'ENFORCEMENT: Level 6 for GG items = direct 42 CFR §484.55 violation. FCA exposure. Requires supervisor co-validation before OASIS transmission.', flagType: 'critical' },
];

// --- MAIN PAGE ---
export function TaxonomyPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'hierarchy' | 'lifecycle' | 'dictionary' | 'enforcement' | 'audit'>('hierarchy');
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [activeEnfPolicy, setActiveEnfPolicy] = useState<'006' | '007'>('006');
  const [activeEnfStep, setActiveEnfStep] = useState<number | null>(null);

  const domains = useFrameworkStore(state => state.domains);
  const subdomains = useFrameworkStore(state => state.subdomains);
  const policies = usePolicyStore(state => state.policies);

  const TABS = [
    { id: 'hierarchy'   as const, label: 'System Hierarchy' },
    { id: 'lifecycle'   as const, label: 'Governance Lifecycle' },
    { id: 'dictionary'  as const, label: 'Classification Dictionary' },
    { id: 'enforcement' as const, label: 'Clinical Enforcement Engine' },
    { id: 'audit'       as const, label: 'Audit Defense System' },
  ];

  const enfSteps = [
    { id: 1, phase: 'INPUT',    label: 'Clinical Documentation Sources', color: 'bg-[#059669]', textColor: 'text-[#059669]',
      items: ['Direct observation narrative', 'Physical exam findings', 'Standardized tool scores (PHQ-2, BBS, TUG)', 'Corroborated patient report'] },
    { id: 2, phase: 'PROCESS',  label: 'Evidence-to-OASIS Linkage', color: 'bg-[#007970]', textColor: 'text-[#007970]',
      items: ['Documentation completed before OASIS entry', 'Item-level evidence linkage (note type, date, clinician)', 'Hierarchy-governed selection per CL-OA-006', 'Supervisor attestation for all GG0130 items'] },
    { id: 3, phase: 'OUTPUT',   label: 'CMS Submission Package', color: 'bg-[#D97706]', textColor: 'text-[#D97706]',
      items: ['OASIS-E1 dataset transmitted to iQIES', 'PDGM HIPPS code derived from OASIS functional scores', 'HHVBP quality measures generated from submission'] },
    { id: 4, phase: 'VALIDATE', label: 'Pre/Post Audit Verification', color: 'bg-[#4F46E5]', textColor: 'text-[#4F46E5]',
      items: ['OASIS Reviewer pre-submission check on all GG items', '10% random internal audit of OASIS vs source docs', 'ADR-ready documentation package assembled per-episode', '7-year look-back retention maintained'] },
  ];

  const auditThreats = [
    { threat: 'CMS Survey / OASIS Validation', hbg: 'bg-[#D97706]',
      action: 'Surveyor cross-references GG0130 OASIS responses against visit documentation and direct observation.',
      rows: [
        { problem: 'GG coded without direct observation documentation', policy: 'CL-OA-006', sev: 'CRITICAL', control: 'Level 1–3 required for all GG items. Level 6 auto-flagged for supervisor review before transmission.' },
        { problem: 'Narrative does not support OASIS response level selected', policy: 'CL-OA-007 §5.3', sev: 'HIGH', control: 'Each GG item references specific note type, date, and clinician — linkage documented before OASIS lock.' },
      ] },
    { threat: 'Additional Documentation Request (ADR)', hbg: 'bg-[#D70101]',
      action: 'MAC requests all clinical documentation supporting the OASIS-driven HIPPS code and PDGM payment amount.',
      rows: [
        { problem: 'Narrative does not align with submitted OASIS', policy: 'CL-OA-007', sev: 'CRITICAL', control: 'Documentation-before-coding mandate. OASIS Reviewer attestation creates defensible, timestamped paper trail.' },
        { problem: 'Documentation timestamp post-dates OASIS transmission', policy: 'CL-OA-007 §5.1', sev: 'FCA', control: 'EHR audit trail enforced. Any note created after OASIS lock triggers automated compliance review.' },
      ] },
    { threat: 'False Claims Act (FCA) Investigation', hbg: 'bg-[#7C3AED]',
      action: 'OIG/DOJ investigates whether OASIS-driven reimbursement was knowingly inflated without clinical basis.',
      rows: [
        { problem: 'High-acuity GG coding driving inflated PDGM payment without documentation', policy: 'CL-OA-006 + CL-OA-007', sev: 'FCA', control: 'Hierarchy prevents Level 6 for GG. Reviewer attestation creates knowledge barrier. 10% audit sample detects patterns.' },
        { problem: 'Systematic documentation-to-OASIS mismatch across episodes', policy: 'CL-OA-007 §7.1', sev: 'FCA', control: 'Mandatory 10% random audit. QAPI accuracy reporting. Immediate re-education when accuracy < 95%.' },
      ] },
  ];

  return (
    <div className="flex-1 w-full h-full flex flex-col relative z-10 font-sans animate-in fade-in duration-500 overflow-y-auto custom-scrollbar p-8 md:p-12 lg:p-16">

      {/* HEADER + TABS */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h2 className="font-montserrat text-3xl font-extrabold text-white tracking-tight leading-none">
            Enterprise Policy Architecture
          </h2>
          <p className="mt-2 font-roboto text-sm font-medium text-white/60">
            HHA Framework v6.0 · IBM Watson Knowledge Catalog Alignment
          </p>
        </div>
        <div className="flex bg-white/[0.05] border border-white/10 rounded-xl shadow-sm p-1 gap-1 flex-wrap justify-end backdrop-blur-sm">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-montserrat font-bold transition-all whitespace-nowrap ${
                activeView === tab.id
                  ? tab.id === 'enforcement' ? 'bg-[#DC2626] text-white shadow-sm'
                  : tab.id === 'audit'       ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'bg-[#00c2b4] text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >{tab.label}</button>
          ))}
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <KpiCard title="TAXONOMY DOMAINS"  value={domains.length}    sub="TOP-LEVEL CATEGORIES" color="border-t-[#C74600]" valColor="text-[#C74600]" icon={<Layers size={20} />} />
        <KpiCard title="SUBDOMAINS"        value={subdomains.length} sub="STRUCTURAL PILLARS"   color="border-t-[#D97706]" valColor="text-[#D97706]" icon={<Network size={20} />} />
        <KpiCard title="TOTAL POLICIES"    value={policies.length}   sub="MANAGED ARTIFACTS"   color="border-t-[#007970]" valColor="text-[#007970]" icon={<FileText size={20} />} />
        <KpiCard title="GOVERNANCE"        value="100%"              sub="IBM WATSON LOGIC"    color="border-t-[#059669]" valColor="text-[#059669]" icon={<ShieldCheck size={20} />} bg="bg-[#059669]/10" />
      </div>

      {/* SYSTEM HIERARCHY */}
      {activeView === 'hierarchy' && (
        <div className="flex gap-3" style={{ minHeight: '480px' }}>
          <div className="w-[58%] bg-white/70 backdrop-blur-xl rounded-xl border border-ci-border shadow-sm flex flex-col items-center justify-center p-4 gap-0">
            <div className="w-full border border-green-200/60 bg-green-50/60 rounded-lg p-2 flex flex-col shadow-sm">
              <div className="flex items-center text-[#059669] mb-1.5">
                <ShieldCheck size={9} className="mr-1.5" />
                <span className="text-[14px] font-montserrat font-bold uppercase tracking-widest">Layer 0: Regulatory Compliance Foundation</span>
              </div>
              <div className="flex gap-1.5 justify-between flex-wrap">
                {['42 CFR Part 484','HIPAA Privacy/Security','OSHA Standards','OIG Compliance','CMS State Operations'].map(r => <Pill key={r} label={r} />)}
              </div>
            </div>
            <div className="w-px h-3 bg-[#C74600]/40" />
            <div className="bg-gradient-to-r from-[#7C2D12] to-[#C2410C] text-white rounded-[4px] py-1.5 px-4 shadow-md flex items-center justify-center w-[65%]">
              <Layers size={9} className="mr-1.5 opacity-80" />
              <span className="text-[16px] font-montserrat font-bold tracking-widest uppercase">Architecture Level 1: {domains.length} Strategic Domains</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {domains.map(d => <DomainCard key={d.code} code={d.code} />)}
            </div>
            <div className="w-px h-3 bg-[#D97706]/40 mt-1" />
            <div className="bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-white rounded-[4px] py-1.5 px-4 shadow-md flex items-center justify-center w-[65%]">
              <Network size={9} className="mr-1.5 opacity-80" />
              <span className="text-[16px] font-montserrat font-bold tracking-widest uppercase">Architecture Level 2: {subdomains.length} Pillar Subdomains</span>
            </div>
            <div className="flex w-[90%] bg-yellow-50/60 border border-yellow-200/60 rounded-lg p-2 mt-2 shadow-sm divide-x divide-yellow-200/60">
              {[
                { Icon: Target,     label: 'STEWARDSHIP', body: 'Named owners (DON, CFO, HR Dir) at subdomain level.' },
                { Icon: Lock,       label: 'ACCESS TIERS', body: 'Tiers 1–4 visibility inherited from subdomain.' },
                { Icon: RefreshCcw, label: 'REVIEW CYCLE', body: 'Annual/Biennial by risk profile.' },
              ].map(item => (
                <div key={item.label} className="flex-1 px-2 flex items-start">
                  <item.Icon size={8} className="text-[#D97706] mt-0.5 mr-1.5 shrink-0" />
                  <div>
                    <span className="text-[6.5px] font-montserrat font-bold text-gray-800 block">{item.label}</span>
                    <span className="text-[6.5px] text-gray-500 leading-tight">{item.body}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-px h-3 bg-[#007970]/40 mt-1" />
            <div className="bg-gradient-to-r from-[#007970] to-[#0F766E] text-white rounded-[4px] py-1.5 px-4 shadow-md flex items-center justify-center w-[65%]">
              <FileText size={9} className="mr-1.5 opacity-80" />
              <span className="text-[16px] font-montserrat font-bold tracking-widest uppercase">Architecture Level 3: {policies.length} Managed Artifacts</span>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="w-[45px] h-[34px] bg-white border border-[#007970]/30 rounded-[3px] shadow-sm flex flex-col p-1 opacity-70">
                  <div className="w-1/2 h-0.5 bg-gray-200 rounded-full mb-1" />
                  <div className="w-full h-0.5 bg-gray-100 rounded-full mb-0.5" />
                  <div className="w-3/4 h-0.5 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="w-[42%] flex flex-col gap-2">
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-ci-border p-3 shadow-sm">
              <h3 className="text-[20px] font-montserrat font-bold text-ci-ink mb-1 border-b border-gray-100 pb-1">Why This Architecture Exists</h3>
              <p className="text-[18px] text-ci-body font-roboto leading-relaxed">This taxonomy replaces fragmented, ad-hoc documentation with a rigid, scalable <strong>enterprise ontology</strong>. Policies in distinct Domains and Subdomains ensure zero regulatory blind spots across the HHA lifecycle — a single source of truth for all operational, clinical, and compliance controls.</p>
            </div>
            <div className="bg-[#059669]/5 rounded-xl border border-[#059669]/20 p-3 shadow-sm flex-1">
              <div className="flex items-center mb-1.5 border-b border-[#059669]/20 pb-1">
                <Database size={11} className="text-[#059669] mr-1.5" />
                <h3 className="text-[20px] font-montserrat font-bold text-[#059669]">100% IBM Knowledge Catalog Alignment</h3>
              </div>
              <p className="text-[16px] text-gray-700 font-roboto mb-2 leading-snug">The framework transforms static text into <strong>managed data artifacts</strong> aligned with IBM Watson governance standards.</p>
              <ul className="space-y-1.5">
                {[
                  { title: 'Metadata Standardization', body: 'Every artifact enforces mandatory metadata: Owner, Status, Taxonomy Mapping.' },
                  { title: 'Governance Lifecycle',     body: 'Strict progression: Draft → Under Review → Active → Deprecated.' },
                  { title: 'Role-Based Access Control', body: 'Tier 1 (Public) through Tier 4 (Privileged) restrictions inherited from subdomain.' },
                ].map(item => (
                  <li key={item.title} className="flex items-start">
                    <CheckCircle2 size={8} className="text-[#059669] mt-0.5 mr-1.5 shrink-0" />
                    <div>
                      <span className="text-[18px] font-bold text-gray-900 block leading-none">{item.title}</span>
                      <span className="text-[7.5px] text-ci-body leading-tight">{item.body}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-ci-border p-3 shadow-sm">
              <h3 className="text-[20px] font-montserrat font-bold text-ci-ink mb-1 border-b border-gray-100 pb-1">Control & Audit Defensibility</h3>
              <p className="text-[18px] text-ci-body font-roboto leading-relaxed">Named Stewardship assigns unambiguous compliance responsibility. Automated Review Cycles based on risk profile guarantee continuous survey readiness and absolute audit traceability at every tier.</p>
            </div>
          </div>
        </div>
      )}

      {/* GOVERNANCE LIFECYCLE */}
      {activeView === 'lifecycle' && (
        <div className="flex gap-3" style={{ minHeight: '480px' }}>
          <div className="w-[58%] bg-white/70 backdrop-blur-xl rounded-xl border border-ci-border shadow-sm flex items-center justify-center p-4">
            <div className="flex flex-col items-center w-full max-w-[280px] relative">
              <div className="absolute right-[-24px] top-[28%] bottom-[12%] w-10 border-r-2 border-b-2 border-t-2 border-dashed border-[#007970]/40 rounded-r-[8px]">
                <div className="absolute top-1/2 right-[-14px] -translate-y-1/2 bg-white/90 px-1 py-0.5 rounded shadow-sm text-[#007970] flex items-center border border-[#007970]/20">
                  <RefreshCcw size={7} className="mr-0.5" />
                  <span className="text-[5.5px] font-bold uppercase tracking-widest">Review Cycle</span>
                </div>
              </div>
              {[
                { color: 'bg-amber-100 border-amber-300 text-amber-700',   icon: <FileEdit size={11} />,      title: '1. DRAFT STATUS',    desc: 'Artifact created and assigned mandatory IBM metadata (Domain, Subdomain, Access Tier, Owner).' },
                { color: 'bg-indigo-100 border-indigo-300 text-indigo-700', icon: <Eye size={11} />,           title: '2. UNDER REVIEW',    desc: 'Stakeholder validation, SME review, and Compliance Officer QA against federal/state regulations.' },
                { color: 'bg-emerald-100 border-emerald-300 text-emerald-700', icon: <CheckCircle2 size={11} />, title: '3. ACTIVE STATUS', desc: 'Approved by Governing Body. Operationally enforced, distributed to staff, and actively audited.' },
                { color: 'bg-slate-100 border-slate-300 text-slate-700',   icon: <Database size={11} />,      title: '4. DEPRECATED',     desc: 'Artifact retired or superseded. Archived permanently per record retention schedules for audit.' },
              ].map((node, idx) => (
                <div key={idx} className="contents">
                  <div className={`w-full ${node.color} border rounded-[6px] p-2 flex items-start shadow-sm z-10`}>
                    <div className="mr-2 mt-0.5 opacity-80">{node.icon}</div>
                    <div>
                      <span className="text-[16px] font-montserrat font-bold uppercase tracking-widest leading-none block">{node.title}</span>
                      <span className="text-[14px] font-roboto mt-0.5 leading-snug opacity-80 block">{node.desc}</span>
                    </div>
                  </div>
                  {idx < 3 && <div className="w-0.5 h-5 bg-gray-300/50" />}
                </div>
              ))}
            </div>
          </div>
          <div className="w-[42%] flex flex-col gap-2">
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-ci-border p-3 shadow-sm">
              <h3 className="text-[20px] font-montserrat font-bold text-ci-ink mb-1 border-b border-gray-100 pb-1">The Artifact Lifecycle</h3>
              <p className="text-[18px] text-ci-body font-roboto leading-relaxed">Care Indeed treats policies as <strong>living governance artifacts</strong>. No standard is implemented without proper vetting. No policy remains active once it becomes obsolete. Every state transition is logged and auditable.</p>
            </div>
            <div className="bg-[#007970]/5 rounded-xl border border-[#007970]/20 p-3 shadow-sm flex-1">
              <div className="flex items-center mb-1.5 border-b border-[#007970]/20 pb-1">
                <RefreshCcw size={11} className="text-[#007970] mr-1.5" />
                <h3 className="text-[20px] font-montserrat font-bold text-[#007970]">Automated Review Cycles</h3>
              </div>
              <p className="text-[16px] text-gray-700 font-roboto mb-2 leading-snug">Active policies automatically trigger return to Under Review based on risk-defined cycles:</p>
              <ul className="space-y-2">
                {[
                  { title: 'Annual Cycle (86.9% of Policies)',    body: 'Mandatory review every 12 months. All high-risk, regulatory, and clinical operations policies.' },
                  { title: 'Biennial Cycle (10.7% of Policies)',  body: 'Mandatory review every 24 months. Lower-risk operational and administrative standards.' },
                  { title: 'Triggered Reviews (2.5% of Policies)', body: 'Immediate out-of-cycle review due to regulatory changes, adverse events, or audit findings.' },
                ].map(item => (
                  <li key={item.title} className="flex flex-col">
                    <span className="text-[18px] font-bold text-gray-900 leading-none mb-0.5">{item.title}</span>
                    <span className="text-[7.5px] text-ci-body leading-tight">{item.body}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-ci-border p-3 shadow-sm">
              <h3 className="text-[20px] font-montserrat font-bold text-ci-ink mb-1 border-b border-gray-100 pb-1">Version Control & Traceability</h3>
              <p className="text-[18px] text-ci-body font-roboto leading-relaxed">Every iteration generates a new version. Deprecated artifacts are archived as <em>"SUPERSEDED — NOT FOR USE"</em> — never deleted — providing an absolute audit trail for CMS survey look-back periods.</p>
            </div>
          </div>
        </div>
      )}

      {/* CLASSIFICATION DICTIONARY */}
      {activeView === 'dictionary' && (
        <div className="flex gap-3" style={{ minHeight: '480px' }}>
          <div className="w-[58%] bg-white/70 backdrop-blur-xl rounded-xl border border-ci-border shadow-sm p-3 flex flex-col gap-3">
            <div>
              <div className="flex items-center mb-1.5">
                <Lock size={18} className="text-[#C74600] mr-1.5" />
                <h3 className="text-[18px] font-montserrat font-bold uppercase tracking-widest border-b border-gray-200 pb-0.5 w-full">Access Tiers (RBAC)</h3>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <DictionaryCard title="Tier 1 — Public"       subtitle="~28% of Policies" desc="Visible to all staff. General operational policies, patient rights, workplace standards." icon={<Eye size={9} />} />
                <DictionaryCard title="Tier 2 — Restricted"   subtitle="~47% of Policies" desc="Role-specific staff only. Clinical, HR, Finance policies with PHI/personnel implications." icon={<Shield size={9} />} />
                <DictionaryCard title="Tier 3 — Confidential" subtitle="~24% of Policies" desc="Leadership & Compliance Officer only. Litigation, sanctions, whistleblower." icon={<Lock size={9} />} />
                <DictionaryCard title="Tier 4 — Privileged"   subtitle="~1% of Policies"  desc="Governing Body & Legal Counsel only. Board governance, conflict of interest, attorney-client." icon={<ShieldCheck size={9} />} />
              </div>
            </div>
            <div>
              <div className="flex items-center mb-1.5">
                <Tag size={18} className="text-[#007970] mr-1.5" />
                <h3 className="text-[18px] font-montserrat font-bold uppercase tracking-widest border-b border-gray-200 pb-0.5 w-full">Classification Tiers</h3>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <DictionaryCard title="REQUIRED"     subtitle="~79% of Policies" desc="Mandated by federal/state law, CMS CoPs, or OIG. Must be Governing Body approved." icon={<AlertCircle size={9} className="text-red-600" />} />
                <DictionaryCard title="ESSENTIAL"    subtitle="~15% of Policies" desc="Critical operational standard. Highly recommended by accreditation bodies." icon={<Target size={9} className="text-amber-600" />} />
                <DictionaryCard title="RECOMMENDED"  subtitle="~5% of Policies"  desc="Industry best practice for high-performing agencies. Not strictly mandated." icon={<CheckCircle2 size={9} className="text-emerald-600" />} />
                <DictionaryCard title="GOOD TO HAVE" subtitle="~1% of Policies"  desc="Internal administrative guidelines supporting agency culture or soft operational preferences." icon={<FileText size={9} className="text-gray-500" />} />
              </div>
            </div>
          </div>
          <div className="w-[42%] flex flex-col gap-2">
            <div className="bg-[#111827] text-white rounded-xl border border-gray-700 p-3 shadow-md">
              <div className="flex items-center mb-1.5 border-b border-gray-700 pb-1">
                <Database size={11} className="text-[#4FD1C5] mr-1.5" />
                <h3 className="text-[20px] font-montserrat font-bold text-[#4FD1C5]">IBM Policy Metadata Standards</h3>
              </div>
              <p className="text-[7.5px] text-gray-300 font-roboto mb-2 leading-snug">Global definitions applied to every policy header in the framework:</p>
              <div className="space-y-1.5">
                {[
                  { label: 'Policy Owner / Steward',    body: 'Named role (e.g., Director of Nursing, CFO) accountable for content and enforcement.' },
                  { label: 'Status & Review Cycle',      body: 'Current lifecycle position (Active) and automated expiration trigger (Annual/Biennial).' },
                  { label: 'Domain / Subdomain',         body: 'Taxonomy classification — single source of truth for regulatory cross-referencing.' },
                  { label: 'Access Tier',                body: 'RBAC visibility restriction inherited from subdomain. Applied automatically on publish.' },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 p-1.5 rounded border border-white/10">
                    <span className="text-[18px] font-bold block leading-none text-white">{item.label}</span>
                    <span className="text-[7.5px] text-gray-400 leading-tight">{item.body}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-ci-border p-3 shadow-sm flex-1">
              <h3 className="text-[20px] font-montserrat font-bold text-ci-ink mb-1 border-b border-gray-100 pb-1">The {domains.length} Top-Level Domains</h3>
              <p className="text-[16px] text-ci-body font-roboto mb-2">All {policies.length} policies across {domains.length} domains and {subdomains.length} subdomains.</p>
              <div className="space-y-1">
                {domains.map(d => {
                  const cnt = policies.filter(p => p.domainCode === d.code).length;
                  return (
                    <div key={d.code} className="flex items-center justify-between bg-gray-50 border border-gray-100 p-1.5 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-montserrat font-bold text-[#C74600] w-6">{d.code}</span>
                        <span className="text-[16px] text-ci-ink font-roboto">{d.name}</span>
                      </div>
                      <span className="text-[16px] font-montserrat font-bold text-ci-body">{cnt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLINICAL ENFORCEMENT ENGINE */}
      {activeView === 'enforcement' && (
        <div className="flex gap-3" style={{ minHeight: '480px' }}>
          <div className="w-[58%] bg-white/70 backdrop-blur-xl rounded-xl border border-ci-border shadow-sm p-3 flex flex-col gap-2 overflow-y-auto">
            {/* Taxonomy binding */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="bg-[#C74600] text-white rounded px-2 py-1 text-center">
                <p className="text-[13px] font-montserrat font-bold uppercase opacity-70">Domain</p>
                <p className="text-[22px] font-montserrat font-extrabold leading-none">CL</p>
              </div>
              <ChevronRight size={18} className="text-ci-body" />
              <div className="bg-[#8B6C00] text-white rounded px-2 py-1 text-center">
                <p className="text-[13px] font-montserrat font-bold uppercase opacity-70">Subdomain</p>
                <p className="text-[22px] font-montserrat font-extrabold leading-none">OA</p>
              </div>
              <ChevronRight size={18} className="text-ci-body" />
              {(['006','007'] as const).map(pid => (
                <button key={pid} type="button" onClick={() => { setActiveEnfPolicy(pid); setExpandedLevel(null); setActiveEnfStep(null); }}
                  className={`rounded border-2 px-2 py-1 text-center transition-all ${activeEnfPolicy === pid ? 'border-[#007970] bg-[#007970] text-white shadow' : 'border-[#007970]/30 bg-[#007970]/5 text-[#007970]'}`}>
                  <p className="text-[13px] font-montserrat font-bold uppercase opacity-80">Policy</p>
                  <p className="text-[20px] font-montserrat font-extrabold leading-none">CL-OA-{pid}</p>
                </button>
              ))}
            </div>

            {/* CL-OA-006 */}
            {activeEnfPolicy === '006' && (
              <>
                <div className="border-l-2 border-[#D70101] bg-[#D70101]/5 rounded-r-lg px-2.5 py-2">
                  <span className="text-[16px] font-montserrat font-bold text-[#D70101] uppercase block mb-0.5">CL-OA-006 · Active · Required · 42 CFR §484.55</span>
                  <p className="text-[16px] font-roboto text-ci-body leading-snug">Establishes a six-tier evidence hierarchy governing <strong>which documentation source holds clinical authority</strong> when selecting OASIS responses. Higher level always overrides lower. Primary foundation of CMS audit defense.</p>
                </div>
                <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                  <AlertTriangle size={9} className="text-amber-700 shrink-0 mt-0.5" />
                  <span className="text-[7.5px] font-roboto text-amber-800"><strong>Conflict Rule:</strong> Lower-numbered level always overrides higher-numbered. Level 1 (Direct Observation) always wins. Level 6 is never permissible as primary source for GG items.</span>
                </div>
                <div className="space-y-1">
                  {DOC_LEVELS.map(lvl => (
                    <div key={lvl.level}>
                      <button type="button" onClick={() => setExpandedLevel(expandedLevel === lvl.level ? null : lvl.level)}
                        className="w-full text-left rounded-lg border border-ci-border bg-white p-2 hover:shadow-sm transition-all flex items-center gap-2">
                        <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-[18px] font-montserrat font-extrabold ${lvl.nodeBg}`}>{lvl.level}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="text-[18px] font-montserrat font-bold text-ci-ink">Level {lvl.level}: {lvl.name}</span>
                            <span className={`text-[14px] font-montserrat font-bold text-white px-1.5 py-0.5 rounded ${lvl.riskBg}`}>{lvl.risk}</span>
                            <span className="text-[7.5px] font-roboto text-ci-body">Auth: {lvl.authority}</span>
                          </div>
                          <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                            <div className={`h-full rounded-full ${lvl.barBg}`} style={{ width: lvl.barW }} />
                          </div>
                        </div>
                        {expandedLevel === lvl.level ? <ChevronUp size={18} className="text-ci-body shrink-0" /> : <ChevronDown size={18} className="text-ci-body shrink-0" />}
                      </button>
                      {expandedLevel === lvl.level && (
                        <div className="rounded-b-lg border border-t-0 border-ci-border bg-white px-3 py-2 space-y-1.5">
                          <p className="text-[16px] font-roboto text-ci-ink leading-relaxed">{lvl.desc}</p>
                          <div className="bg-gray-50 border border-ci-border rounded p-2">
                            <p className="text-[14px] font-montserrat font-bold uppercase text-ci-body mb-0.5">Documentation Example</p>
                            <p className="text-[7.5px] font-roboto italic text-ci-body leading-snug">{lvl.example}</p>
                          </div>
                          {lvl.flag && (
                            <div className={`flex items-start gap-1.5 rounded p-2 ${lvl.flagType === 'critical' ? 'bg-[#D70101]/5 border border-[#D70101]/20' : 'bg-amber-50 border border-amber-200'}`}>
                              <AlertTriangle size={8} className={`shrink-0 mt-0.5 ${lvl.flagType === 'critical' ? 'text-[#D70101]' : 'text-amber-600'}`} />
                              <p className={`text-[7.5px] font-roboto leading-snug ${lvl.flagType === 'critical' ? 'text-[#D70101]' : 'text-amber-700'}`}>{lvl.flag}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* CL-OA-007 */}
            {activeEnfPolicy === '007' && (
              <>
                <div className="border-l-2 border-[#007970] bg-[#007970]/5 rounded-r-lg px-2.5 py-2">
                  <span className="text-[16px] font-montserrat font-bold text-[#007970] uppercase block mb-0.5">CL-OA-007 · Active · Required · 42 CFR §484.55(a)</span>
                  <p className="text-[16px] font-roboto text-ci-body leading-snug">Mandates that every OASIS response is traceable to specific clinical documentation from the current SOC/ROC visit. Establishes documentation-before-coding protocol. Every ADR response must be defensible through this chain.</p>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-start gap-1.5 bg-[#D70101]/5 border border-[#D70101]/20 rounded-lg p-2">
                    <XCircle size={9} className="text-[#D70101] shrink-0 mt-0.5" />
                    <span className="text-[7.5px] font-roboto text-[#D70101] leading-snug"><strong>Unsupported OASIS response = compliance failure.</strong> No exceptions for GG or M-series items.</span>
                  </div>
                  <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg p-2">
                    <CheckSquare size={9} className="text-amber-700 shrink-0 mt-0.5" />
                    <span className="text-[7.5px] font-roboto text-amber-700 leading-snug"><strong>Documentation MUST precede OASIS coding.</strong> Retroactive docs = fraud indicator in EHR timestamps.</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {enfSteps.map((step) => (
                    <div key={step.id}>
                      <button type="button" onClick={() => setActiveEnfStep(activeEnfStep === step.id ? null : step.id)}
                        className="w-full text-left rounded-lg border border-ci-border bg-white p-2 hover:shadow-sm transition-all flex items-center gap-2">
                        <span className={`text-[14px] font-montserrat font-bold text-white px-1.5 py-0.5 rounded shrink-0 ${step.color}`}>{step.phase}</span>
                        <span className={`text-[18px] font-montserrat font-bold flex-1 ${step.textColor}`}>{step.label}</span>
                        {activeEnfStep === step.id ? <ChevronUp size={18} className="text-ci-body shrink-0" /> : <ChevronDown size={18} className="text-ci-body shrink-0" />}
                      </button>
                      {activeEnfStep === step.id && (
                        <div className="rounded-b-lg border border-t-0 border-ci-border bg-white px-3 py-2">
                          <ul className="space-y-1">
                            {step.items.map((item, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <CheckCircle size={8} className={`shrink-0 mt-0.5 ${step.textColor}`} />
                                <span className="text-[16px] font-roboto text-ci-body leading-snug">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="w-[42%] flex flex-col gap-2">
            <div className="bg-[#111827] text-white rounded-xl border border-gray-700 p-3 shadow-md">
              <div className="flex items-center mb-2 border-b border-gray-700 pb-1">
                <Zap size={11} className="text-[#D70101] mr-1.5" />
                <h3 className="text-[20px] font-montserrat font-bold text-white">Clinical Enforcement Engine</h3>
              </div>
              <p className="text-[7.5px] text-gray-300 font-roboto leading-relaxed mb-2">CL-OA-006 and CL-OA-007 are not reference documents. They are the enforcement logic that governs every OASIS coding decision in the agency.</p>
              <div className="space-y-1.5">
                <div className="bg-white/5 rounded border border-white/10 p-2">
                  <span className="text-[18px] font-bold text-[#007970] block mb-0.5">CL-OA-006 → Governs HOW data is SELECTED</span>
                  <span className="text-[7.5px] text-gray-400 leading-snug">Controls which evidence source holds authority. Prevents lower-tier inference from overriding direct clinical observation.</span>
                </div>
                <div className="bg-white/5 rounded border border-white/10 p-2">
                  <span className="text-[18px] font-bold text-[#007970] block mb-0.5">CL-OA-007 → Governs HOW data is JUSTIFIED</span>
                  <span className="text-[7.5px] text-gray-400 leading-snug">Mandates the traceability chain from observation through OASIS coding to CMS submission. No retroactive justification permitted.</span>
                </div>
              </div>
            </div>
            <div className="bg-[#D70101]/5 rounded-xl border border-[#D70101]/20 p-3 shadow-sm">
              <h3 className="text-[20px] font-montserrat font-bold text-[#D70101] mb-1.5 flex items-center gap-1.5"><AlertTriangle size={18} /> Common Violations</h3>
              <div className="space-y-1.5">
                {[
                  { v: 'Coding GG from hospital discharge summary', sev: 'FCA' },
                  { v: 'No traceable evidence for OASIS item', sev: 'ADR' },
                  { v: 'Documentation timestamp post-dates OASIS', sev: 'FCA' },
                  { v: 'Single-source patient report for GG0130', sev: 'ADR' },
                  { v: 'Functional status inferred from diagnosis alone', sev: 'ADR' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 bg-white rounded border border-ci-border p-1.5">
                    <span className="text-[7.5px] font-roboto text-ci-ink leading-snug flex-1">{item.v}</span>
                    <span className={`text-[6.5px] font-montserrat font-bold text-white px-1.5 py-0.5 rounded shrink-0 ${item.sev === 'FCA' ? 'bg-[#7C3AED]' : 'bg-[#D70101]'}`}>{item.sev}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-ci-border p-3 shadow-sm flex-1">
              <h3 className="text-[20px] font-montserrat font-bold text-ci-ink mb-1.5 border-b border-gray-100 pb-1 flex items-center gap-1.5"><Shield size={18} className="text-[#007970]" /> CMS Regulatory Anchors</h3>
              <div className="space-y-1">
                {[
                  { reg: '42 CFR §484.55',         desc: 'Comprehensive Patient Assessment — mandates assessment by qualified clinician using standardized data elements' },
                  { reg: '42 CFR §484.55(a)',       desc: 'Evidence-based requirement — clinical judgment must be founded on direct evaluation, not inference' },
                  { reg: 'OASIS-E1 Manual Ch.3',    desc: 'Documentation must be traceable from clinical record to each OASIS item response selected' },
                  { reg: 'FCA 31 U.S.C. §3729',     desc: 'Knowingly presenting a false claim to Medicare — unsupported OASIS = potential FCA liability' },
                ].map(item => (
                  <div key={item.reg} className="flex items-start gap-1.5">
                    <span className="text-[16px] font-montserrat font-bold text-[#007970] shrink-0 w-28">{item.reg}</span>
                    <span className="text-[7.5px] font-roboto text-ci-body leading-snug">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT DEFENSE SYSTEM */}
      {activeView === 'audit' && (
        <div className="flex gap-3" style={{ minHeight: '480px' }}>
          <div className="w-[58%] bg-white/70 backdrop-blur-xl rounded-xl border border-ci-border shadow-sm p-3 flex flex-col gap-2 overflow-y-auto">
            <div className="border-l-2 border-[#7C3AED] bg-[#7C3AED]/5 rounded-r-lg px-2.5 py-2">
              <p className="text-[16px] font-montserrat font-bold text-[#7C3AED] uppercase mb-0.5">Audit Defense Architecture — Problem → Policy → Control</p>
              <p className="text-[7.5px] font-roboto text-ci-body leading-snug">Every audit threat vector mapped to the policy that prevents it and the control mechanism that proves compliance. Powered by CL-OA-006 + CL-OA-007.</p>
            </div>
            {auditThreats.map(threat => (
              <div key={threat.threat} className="rounded-xl border border-ci-border overflow-hidden shadow-sm">
                <div className={`${threat.hbg} px-3 py-2`}>
                  <h4 className="text-[18px] font-montserrat font-bold text-white">{threat.threat}</h4>
                  <p className="text-[14px] font-roboto text-white/80 mt-0.5">{threat.action}</p>
                </div>
                <div className="bg-white p-2 space-y-1.5">
                  {threat.rows.map((row, i) => (
                    <div key={i} className="rounded-lg border border-ci-border p-2 grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-[6.5px] font-montserrat font-bold uppercase text-ci-body mb-0.5 flex items-center gap-1"><AlertTriangle size={7} className="text-[#C74600]" /> Problem</p>
                        <p className="text-[7.5px] font-roboto text-ci-ink leading-snug">{row.problem}</p>
                      </div>
                      <div className="border-l border-ci-border pl-2">
                        <p className="text-[6.5px] font-montserrat font-bold uppercase text-ci-body mb-0.5 flex items-center gap-1"><ArrowRight size={7} /> Policy</p>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[16px] font-montserrat font-bold text-[#007970]">{row.policy}</span>
                          <span className={`text-[14px] font-montserrat font-bold text-white px-1 py-0.5 rounded w-fit ${row.sev === 'FCA' ? 'bg-[#7C3AED]' : row.sev === 'CRITICAL' ? 'bg-[#D70101]' : 'bg-[#C74600]'}`}>{row.sev}</span>
                        </div>
                      </div>
                      <div className="border-l border-ci-border pl-2">
                        <p className="text-[6.5px] font-montserrat font-bold uppercase text-ci-body mb-0.5 flex items-center gap-1"><CheckCircle size={7} className="text-[#059669]" /> Control</p>
                        <p className="text-[7.5px] font-roboto text-ci-body leading-snug">{row.control}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="w-[42%] flex flex-col gap-2">
            <div className="bg-[#111827] text-white rounded-xl border border-gray-700 p-3 shadow-md">
              <div className="flex items-center mb-2 border-b border-gray-700 pb-1">
                <Shield size={11} className="text-[#7C3AED] mr-1.5" />
                <h3 className="text-[20px] font-montserrat font-bold text-white">Audit Defense Architecture</h3>
              </div>
              <p className="text-[7.5px] text-gray-300 font-roboto leading-relaxed mb-2">Every constraint exists to ensure that when a surveyor, MAC, or OIG investigator requests documentation, the agency demonstrates — with precision — that every clinical decision was evidence-based, contemporaneously documented, and CMS-compliant.</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Survey Defense', sub: 'GG vs Direct Obs', bg: 'bg-[#D97706]' },
                  { label: 'ADR Defense',    sub: 'Narrative vs OASIS', bg: 'bg-[#D70101]' },
                  { label: 'FCA Defense',    sub: 'False Claim Shield', bg: 'bg-[#7C3AED]' },
                ].map(d => (
                  <div key={d.label} className={`${d.bg} rounded p-1.5 text-center`}>
                    <p className="text-[14px] font-montserrat font-bold text-white uppercase leading-tight">{d.label}</p>
                    <p className="text-[13px] font-roboto text-white/70 mt-0.5">{d.sub}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#059669]/5 rounded-xl border border-[#059669]/20 p-3 shadow-sm flex-1">
              <div className="flex items-center mb-2 border-b border-[#059669]/20 pb-1">
                <ShieldCheck size={11} className="text-[#059669] mr-1.5" />
                <h3 className="text-[20px] font-montserrat font-bold text-[#059669]">System Guarantees</h3>
              </div>
              <div className="space-y-2">
                {[
                  { title: 'Enforces Clinical Truth',   body: 'Every coded response maps to directly observed, documented reality. No inference permitted for functional items.' },
                  { title: 'Prevents Manipulation',     body: 'Documentation-before-coding eliminates retroactive justification. EHR timestamps are the audit log.' },
                  { title: 'CMS-Aligned',               body: 'Every control traces to 42 CFR §484.55 or the CMS OASIS-E1 Guidance Manual. No proprietary standards.' },
                  { title: 'Enterprise-Grade',          body: 'IBM governance: metadata enforcement, lifecycle control, RBAC, and full audit trail across all 5 views.' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-1.5">
                    <CheckCircle size={9} className="text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[18px] font-montserrat font-bold text-ci-ink block leading-none mb-0.5">{item.title}</span>
                      <span className="text-[7.5px] font-roboto text-ci-body leading-snug">{item.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

