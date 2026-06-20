import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Search, Building2, Users, AlertTriangle,
  DollarSign, Monitor, BarChart3, Heart, Cpu, Briefcase,
  Share2, Flame, Copy,
  FileCheck
} from 'lucide-react';
import { EmptyState, SearchField, V32PageHeader, SurfaceCard, MetricTile, BorderGlow } from '@/policy/components/ui';

// ══════════════════════════════════════════════════════════════
// ENTERPRISE FORMS LIBRARY – 361 ARTIFACTS ACROSS 10 DOMAINS
// ══════════════════════════════════════════════════════════════

const DOMAINS = [
  { code: 'GV', name: 'GOVERNANCE', icon: Building2, accentToken: 'var(--ci-primary-500)' },
  { code: 'CL', name: 'CLINICAL OPS', icon: Heart, accentToken: '#ef4444' /* U-14: legacy hex preserved — no canonical token */ },
  { code: 'QA', name: 'QAPI', icon: BarChart3, accentToken: 'var(--ci-secondary-500)' },
  { code: 'HR', name: 'HUMAN RESOURCES', icon: Users, accentToken: '#8b5cf6' /* U-14: legacy hex preserved — no canonical token */ },
  { code: 'CO', name: 'COMPLIANCE', icon: Shield, accentToken: '#3b82f6' /* U-14: legacy hex preserved — no canonical token */ },
  { code: 'FN', name: 'FINANCE', icon: DollarSign, accentToken: 'var(--ci-success-300)' },
  { code: 'OP', name: 'OPERATIONS', icon: Briefcase, accentToken: '#f97316' /* U-14: legacy hex preserved — no canonical token */ },
  { code: 'IT', name: 'IT & SECURITY', icon: Monitor, accentToken: '#6366f1' /* U-14: legacy hex preserved — no canonical token */ },
  { code: 'RM', name: 'RISK MGMT', icon: AlertTriangle, accentToken: '#9A6700' /* U-14: #eab308→#9A6700; no --ci-warning-500 yet, TODO token follow-on */ },
  { code: 'EN', name: 'ENTERPRISE CTRL', icon: Cpu, accentToken: '#ec4899' /* U-14: legacy hex preserved — no canonical token */ },
];

const CLASSIFICATION_FILTERS = [
  { id: 'master_template', name: 'Master Template', accentToken: '#3b82f6' /* U-14: legacy hex preserved — no canonical token */ , icon: Copy },
  { id: 'audit_critical', name: 'Audit Critical', accentToken: '#ef4444' /* U-14: legacy hex preserved — no canonical token */ , icon: FileCheck },
  { id: 'shared_enterprise', name: 'Shared Enterprise', accentToken: 'var(--ci-success-300)', icon: Share2 },
  { id: 'high_risk', name: 'High Risk', accentToken: '#f97316' /* U-14: legacy hex preserved — no canonical token */ , icon: Flame },
  { id: 'digital_candidate', name: 'Digital Candidate', accentToken: '#a855f7' /* U-14: legacy hex preserved — no canonical token */ , icon: Monitor },
];

import { FORMS_DATASET } from '../data/formsLibraryDataset';

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════

export function FormsPage() {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [activeClassifications, setActiveClassifications] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const visibleForms = useMemo(() => {
    let f = FORMS_DATASET;
    if (selectedDomain !== 'ALL') f = f.filter(x => x.domainCode === selectedDomain);
    if (activeClassifications.size > 0) {
      f = f.filter(x => { for (const cls of activeClassifications) { if (!x.classifications.includes(cls)) return false; } return true; });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      f = f.filter(x => x.id.toLowerCase().includes(q) || x.name.toLowerCase().includes(q) || x.type.toLowerCase().includes(q) || x.policies.some(p => p.toLowerCase().includes(q)));
    }
    return f;
  }, [selectedDomain, activeClassifications, searchQuery]);

  const toggleClassification = useCallback((id: string) => {
    setActiveClassifications(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);

  return (
    <>
      <style>{`
        .forms-custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .forms-custom-scrollbar::-webkit-scrollbar { display: none; }
        .glass-interactive-forms { background-color: transparent !important; transition: border-color 300ms ease, box-shadow 300ms ease; }
        .glass-interactive-forms:hover { box-shadow: 0 0 15px rgba(255,255,255,0.05); }
        html[data-theme="care-indeed-light"] .glass-interactive-forms {
          /* Wave 7 T3: light-theme-scoped CSS now uses canonical --ci-* tokens that already resolve
             to these values in the care-indeed-light scope (see src/index.css). */
          background-color: var(--ci-surface-2) !important;
          border-color: var(--ci-border) !important;
        }
        html[data-theme="care-indeed-light"] .glass-interactive-forms:hover {
          background-color: var(--ci-surface) !important;
          border-color: var(--ci-primary-500) !important;
          box-shadow: none !important;
        }
        @keyframes shimmerForms { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
        @keyframes fadeUpForms { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeUpForms { animation: fadeUpForms 0.4s ease-out forwards; }
        .forms-grid-7{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:1.25rem}
        @media(max-width:2200px){.forms-grid-7{grid-template-columns:repeat(6,minmax(0,1fr))}}
        @media(max-width:1800px){.forms-grid-7{grid-template-columns:repeat(5,minmax(0,1fr))}}
        @media(max-width:1500px){.forms-grid-7{grid-template-columns:repeat(4,minmax(0,1fr))}}
        @media(max-width:1200px){.forms-grid-7{grid-template-columns:repeat(3,minmax(0,1fr))}}
        @media(max-width:850px){.forms-grid-7{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:550px){.forms-grid-7{grid-template-columns:repeat(1,minmax(0,1fr))}}
      `}</style>

      <div className="min-h-full w-full font-roboto text-[var(--v3-text-primary)] bg-transparent flex flex-col overflow-hidden">
        <div className="mx-auto w-full w-full px-6 md:px-8 pt-6">
          <V32PageHeader
            eyebrow="FORMS LIBRARY"
            title="Enterprise Forms Library"
            description="361 canonical artifacts. Filter by domain and classification. Open any card to view and sign."
            actions={
              <div className="flex gap-2 items-center">
                <SearchField placeholder="Search forms..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-[240px]" />
                <button onClick={() => navigate('/library')} className="rounded-lg px-3 py-1 text-xs uppercase tracking-widest">Policies</button>
              </div>
            }
          />
        </div>

        {/* Forms Library Metrics (pick up new UI tokens Surface/Metric/Border per image refs e.g. 21-forms-library.png + 10-forms-ecign.md) */}
        <div className="mx-auto w-full w-full px-6 md:px-8 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <BorderGlow borderRadius={16} glowIntensity={0.6}>
              <MetricTile label="Runtime Records" value={410} note="Full dataset" tone="teal" />
            </BorderGlow>
            <BorderGlow borderRadius={16} glowIntensity={0.55}>
              <MetricTile label="Canonical" value={361} note="Enterprise forms" tone="success" />
            </BorderGlow>
            <BorderGlow borderRadius={16} glowIntensity={0.6}>
              <MetricTile label="Domains" value={10} note="Coverage breadth" tone="warning" />
            </BorderGlow>
            <BorderGlow borderRadius={16} glowIntensity={0.55}>
              <MetricTile label="Digital Candidates" value={74} note="eCIgn ready" tone="muted" />
            </BorderGlow>
          </div>
        </div>

        {/* Domain pills — clean corporate */}
        <div className="mx-auto w-full w-full px-6 md:px-8 pt-1">
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[var(--v3-border-subtle)]">
            <button onClick={() => setSelectedDomain('ALL')} title="Show all form domains" className={`px-3 py-1 text-xs rounded-full uppercase tracking-widest ${selectedDomain==='ALL' ? 'bg-[var(--v3-teal)] text-white' : 'hover:bg-white/5'}`}>ALL</button>
            {DOMAINS.map(d => {
              const Icon = d.icon;
              const active = selectedDomain === d.code;
              return (
                <button key={d.code} onClick={() => setSelectedDomain(d.code)} title={`Filter forms to ${d.name}`} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs uppercase tracking-widest ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                  <Icon size={12} /> {d.name}
                </button>
              );
            })}
            <div className="ml-auto text-xs text-[var(--v3-text-tertiary)] font-mono self-center">{visibleForms.length} ARTIFACTS</div>
          </div>
        </div>

        {/* Classification chips */}
        <div className="mx-auto w-full w-full px-6 md:px-8 py-2 flex flex-wrap gap-1.5 text-xs">
          <button onClick={() => setActiveClassifications(new Set())} title="Show all classifications" className={`px-2.5 py-0.5 rounded border ${activeClassifications.size===0 ? 'bg-white/10' : 'border-[var(--v3-border-subtle)]'}`}>ALL</button>
          {CLASSIFICATION_FILTERS.map(c => (
            <button key={c.id} onClick={() => toggleClassification(c.id)} title={`Toggle ${c.name} filter`} className={`px-2.5 py-0.5 rounded border inline-flex items-center gap-1 ${activeClassifications.has(c.id) ? 'border-current' : 'border-[var(--v3-border-subtle)]'}`}>
              <c.icon size={10} /> {c.name}
            </button>
          ))}
        </div>

        {/* FORMS GRID — premium clean corporate cards */}
        <div className="mx-auto w-full w-full flex-1 overflow-y-auto px-6 md:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {visibleForms.map(form => {
              const domain = DOMAINS.find(d => d.code === form.domainCode);
              const color = domain?.accentToken || '#a1a1aa';
              return (
                <SurfaceCard key={form.id} onClick={() => navigate(`/forms/${form.id}`)} className="p-4 cursor-pointer group flex flex-col hover:border-[var(--v3-border-hover)]">
                  <div className="flex justify-between">
                    <span className="font-mono text-[10px] font-semibold tracking-widest" style={{color}}>{form.id}</span>
                    <span className="text-[10px] opacity-60">{form.type}</span>
                  </div>
                  <div className="mt-1 text-sm font-medium leading-tight pr-2 group-hover:text-[var(--v3-teal-light)]">{form.name}</div>
                  <div className="mt-auto pt-3 text-[10px] flex flex-wrap gap-1 text-[var(--v3-text-secondary)]">
                    {form.classifications.slice(0,2).map(c => <span key={c} className="border px-1 rounded text-[8px]">{c}</span>)}
                    <span className="ml-auto">{form.policies.length} policies</span>
                  </div>
                </SurfaceCard>
              );
            })}
          </div>
          {visibleForms.length === 0 && <EmptyState icon={<Search size={36}/>} title="No forms match" />}
        </div>
      </div>
    </>
  );
}
