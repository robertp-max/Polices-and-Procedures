import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Search, Building2, Users, AlertTriangle,
  DollarSign, Monitor, BarChart3, Heart, Cpu, Briefcase,
  GitBranch, Printer, Layers, Database, Download, Eye,
  FileSignature, ClipboardCheck, FileText, Share2, Flame, Copy,
  FileCheck, LayoutList
} from 'lucide-react';
import { useShellStore } from '../stores/uiStore';
import { remapForLight } from '../utils/lightColorRemap';
import { printForm } from '../utils/printForm';
import { EmptyState, SearchField } from '@/policy/components/ui';

// ══════════════════════════════════════════════════════════════
// ENTERPRISE FORMS LIBRARY – 361 ARTIFACTS ACROSS 10 DOMAINS
// ══════════════════════════════════════════════════════════════

const DOMAINS = [
  { code: 'GV', name: 'GOVERNANCE', icon: Building2, color: '#FFC107' },
  { code: 'CL', name: 'CLINICAL OPS', icon: Heart, color: '#ef4444' },
  { code: 'QA', name: 'QAPI', icon: BarChart3, color: '#06b6d4' },
  { code: 'HR', name: 'HUMAN RESOURCES', icon: Users, color: '#8b5cf6' },
  { code: 'CO', name: 'COMPLIANCE', icon: Shield, color: '#3b82f6' },
  { code: 'FN', name: 'FINANCE', icon: DollarSign, color: '#10b981' },
  { code: 'OP', name: 'OPERATIONS', icon: Briefcase, color: '#f97316' },
  { code: 'IT', name: 'IT & SECURITY', icon: Monitor, color: '#6366f1' },
  { code: 'RM', name: 'RISK MGMT', icon: AlertTriangle, color: '#eab308' },
  { code: 'EN', name: 'ENTERPRISE CTRL', icon: Cpu, color: '#ec4899' },
];

const CLASSIFICATION_FILTERS = [
  { id: 'master_template', name: 'Master Template', color: '#3b82f6', icon: Copy },
  { id: 'audit_critical', name: 'Audit Critical', color: '#ef4444', icon: FileCheck },
  { id: 'shared_enterprise', name: 'Shared Enterprise', color: '#10b981', icon: Share2 },
  { id: 'high_risk', name: 'High Risk', color: '#f97316', icon: Flame },
  { id: 'digital_candidate', name: 'Digital Candidate', color: '#a855f7', icon: Monitor },
];

import { FORMS_DATASET } from '../data/formsLibraryDataset';

// UI HELPERS
// ══════════════════════════════════════════════════════════════

const getFormIcon = (type: string, size = 16) => {
  switch (type.toLowerCase()) {
    case 'attestation': return <FileSignature size={size}/>;
    case 'checklist': return <ClipboardCheck size={size}/>;
    case 'log': return <Database size={size}/>;
    case 'assessment': return <BarChart3 size={size}/>;
    case 'worksheet': return <LayoutList size={size}/>;
    case 'template': return <Layers size={size}/>;
    case 'tracking tool': return <BarChart3 size={size}/>;
    default: return <FileText size={size}/>;
  }
};

const getFormTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'attestation': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    case 'checklist': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'log': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'assessment': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'template': return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
    case 'tracking tool': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    case 'matrix': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    default: return 'text-gray-300 bg-gray-400/10 border-gray-400/20';
  }
};

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════

export function FormsPage() {
  const navigate = useNavigate();
  const theme = useShellStore(s => s.theme);
  const isLight = theme === 'care-indeed-light';
  const mapColor = (c: string) => remapForLight(c, isLight);
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
          background-color: #FAFBF8 !important;
          border-color: #E5E4E3 !important;
        }
        html[data-theme="care-indeed-light"] .glass-interactive-forms:hover {
          background-color: #FFFFFF !important;
          border-color: #C74601 !important;
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

      <div className="h-full w-full font-roboto text-ci-text-primary bg-ci-bg flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="px-10 pt-10 pb-4 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h1 className="font-montserrat text-3xl font-light text-ci-text-primary flex items-center gap-4">
              <Layers className="text-[#a855f7]" size={36} strokeWidth={1.5}/> Enterprise Forms Library
            </h1>
            <div className="flex items-center gap-3 mt-4 ml-1">
              <div className="glass-interactive-forms px-3 py-1.5 rounded-full border-[0.77px] border-[#FFC107]/40 flex items-center gap-2 relative overflow-hidden cursor-pointer"
                onClick={() => navigate('/library')}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC107]/20 to-transparent -translate-x-full"
                  style={{animation:'shimmerForms 2.5s infinite'}}/>
                <FileText size={12} className="text-[#FFC107] animate-pulse"/>
                <span className="text-[9px] font-bold font-montserrat tracking-[0.2em] text-ci-text-primary">269 POLICIES</span>
              </div>
              <div className="glass-interactive-forms px-3 py-1.5 rounded-full border-[0.77px] border-[#a855f7]/40 flex items-center gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#a855f7]/20 to-transparent -translate-x-full"
                  style={{animation:'shimmerForms 3s infinite 0.5s'}}/>
                <Layers size={12} className="text-[#a855f7] animate-pulse"/>
                <span className="text-[9px] font-bold font-montserrat tracking-[0.2em] text-ci-text-primary">361 FORMS</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <SearchField
              placeholder="Search forms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-[280px]"
            />

            {/* Policies / Forms toggle */}
            <div className="flex items-center p-1 rounded-full border border-ci-border">
              <button onClick={() => navigate('/library')}
                className="px-6 py-2 rounded-full text-[9px] font-bold tracking-widest uppercase border-[0.77px] border-transparent text-ci-text-subtle hover:text-ci-text-primary transition-colors font-montserrat">
                Policies
              </button>
              <button className="px-6 py-2 rounded-full text-[9px] font-bold tracking-widest uppercase border-[0.77px] border-[#a855f7] text-[#a855f7] font-montserrat">
                Forms
              </button>
            </div>

            {/* Export */}
            <button className="glass-interactive-forms flex items-center gap-2 px-5 py-2.5 rounded-full border border-ci-border text-[9px] font-bold tracking-widest uppercase text-ci-text-subtle hover:text-ci-text-primary transition-colors font-montserrat">
              <Printer size={13}/> Export
            </button>
          </div>
        </div>

        {/* DOMAIN PILLS */}
        <div className="px-10 py-3 shrink-0 border-b border-ci-border">
          <div className="flex gap-2 overflow-x-auto forms-custom-scrollbar pb-1">
            <button onClick={() => setSelectedDomain('ALL')}
              className="flex-shrink-0 glass-interactive-forms px-5 py-2 rounded-full font-montserrat text-[9px] font-bold tracking-widest uppercase transition-colors border-[0.77px]"
              style={selectedDomain === 'ALL'
                ? isLight ? { borderColor: 'rgba(0,0,0,0.25)', color: '#1F1C1B', fontWeight: 700 } : { borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }
                : isLight ? { borderColor: 'transparent', color: '#747470' } : { borderColor: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
              ALL DOMAINS
            </button>
            {DOMAINS.map(d => {
              const isActive = selectedDomain === d.code;
              const Icon = d.icon;
              const dColor = mapColor(d.color);
              return (
                <button key={d.code} onClick={() => setSelectedDomain(d.code)}
                  className="flex-shrink-0 glass-interactive-forms px-5 py-2 rounded-full font-montserrat text-[9px] font-bold tracking-widest uppercase flex items-center gap-2 transition-colors border-[0.77px]"
                  style={isActive
                    ? { borderColor: `${dColor}60`, color: dColor, backgroundColor: `${dColor}10` }
                    : isLight ? { borderColor: 'transparent', color: '#747470' } : { borderColor: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
                  <Icon size={13} style={{ color: isActive ? dColor : undefined }}/> {d.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* CLASSIFICATION FILTERS */}
        <div className="px-10 py-3 shrink-0 flex items-center gap-3 border-b border-ci-border">
          <button onClick={() => setActiveClassifications(new Set())}
            className="flex-shrink-0 glass-interactive-forms px-3 py-1.5 rounded-full font-montserrat font-bold text-[8px] uppercase tracking-widest transition-colors border-[0.77px]"
            style={activeClassifications.size === 0
              ? isLight ? { borderColor: 'rgba(0,0,0,0.25)', color: '#1F1C1B' } : { borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }
              : isLight ? { borderColor: 'transparent', color: '#747470' } : { borderColor: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
            ALL
          </button>
          {CLASSIFICATION_FILTERS.map(c => {
            const isActive = activeClassifications.has(c.id);
            const Icon = c.icon;
            const cColor = mapColor(c.color);
            return (
              <button key={c.id} onClick={() => toggleClassification(c.id)}
                className="flex-shrink-0 glass-interactive-forms flex items-center gap-1.5 px-3 py-1.5 rounded-full font-montserrat font-bold text-[8px] uppercase tracking-widest transition-colors border-[0.77px]"
                style={isActive
                  ? { borderColor: cColor, color: cColor }
                  : isLight ? { borderColor: 'rgba(0,0,0,0.12)', color: '#747470' } : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
                <Icon size={10}/> {c.name}
              </button>
            );
          })}
          <div className="ml-auto text-[9px] font-mono text-ci-text-subtle">
            {visibleForms.length} ARTIFACTS
          </div>
        </div>

        {/* FORMS GRID */}
        <div className="flex-1 overflow-y-auto forms-custom-scrollbar p-8">
          <div className="forms-grid-7 animate-fadeUpForms">
            {visibleForms.map(form => {
              const domain = DOMAINS.find(d => d.code === form.domainCode);
              const color = mapColor(domain?.color || '#ffffff');
              const typeColorClass = getFormTypeColor(form.type);
              return (
                <div key={form.id}
                  onClick={() => navigate(`/forms/${form.id}`)}
                  className={`glass-interactive-forms flex flex-col justify-between p-4 rounded-xl border-[0.77px] transition-all duration-300 group h-full relative cursor-pointer ${isLight ? 'border-[#E5E4E3] hover:border-[#C74601]/50' : 'border-white/10 hover:border-white/25'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className={`text-[11px] font-bold font-mono tracking-wider px-1.5 py-0.5 rounded border ${isLight ? 'border-black/10' : 'border-white/10'}`} style={{color}}>
                        {form.id}
                      </div>
                      <div className={`p-1.5 rounded-md border ${typeColorClass}`} title={form.type}>
                        {getFormIcon(form.type, 14)}
                      </div>
                    </div>
                    <h3 className="text-[13px] text-ci-text-primary font-medium leading-snug mb-3 line-clamp-3 group-hover:text-ci-text-primary transition-colors">
                      {form.name}
                    </h3>
                    {form.classifications?.length > 0 && (
                      <div className="flex flex-col gap-1.5 mb-4">
                        {form.classifications.map(cId => {
                          const cls = CLASSIFICATION_FILTERS.find(c => c.id === cId);
                          if (!cls) return null;
                          const Icon = cls.icon;
                          const clsColor = mapColor(cls.color);
                          return (
                            <div key={cId} className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border w-max"
                              style={{borderColor:`${clsColor}30`,backgroundColor:`${clsColor}10`,color:clsColor}}>
                              <Icon size={10}/> {cls.name}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${typeColorClass}`}>{form.type}</span>
                      {form.usage === 'Required' && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border border-red-500/20 text-red-400">Required</span>}
                      {form.frequency !== 'Ongoing' && form.frequency !== 'Triggered' && (
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${isLight ? 'border-black/10 text-[#52404B]' : 'border-white/10 text-white/60'}`}>{form.frequency}</span>
                      )}
                    </div>
                  </div>
                  <div className={`mt-auto pt-3 border-t relative ${isLight ? 'border-black/8' : 'border-white/10'}`}>
                    <div className={`text-[8px] uppercase tracking-widest mb-2 font-bold flex items-center justify-between ${isLight ? 'text-[#747470]' : 'text-white/40'}`}>
                      <span className="flex items-center gap-1.5"><GitBranch size={10}/> Mapped Policies</span>
                      <div className={`flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 right-0 border p-1 rounded-lg shadow-xl ${isLight ? 'border-[#E5E4E3] bg-white' : 'border-white/10 bg-black/60 backdrop-blur'}`}>
                        <button onClick={e => { e.stopPropagation(); navigate(`/forms/${form.id}`); }} className={`p-1.5 rounded ${isLight ? 'hover:bg-black/5 text-[#52404B] hover:text-[#1F1C1B]' : 'hover:bg-white/10 text-white/70 hover:text-white'}`} title="Preview / Open Form"><Eye size={14}/></button>
                        <button onClick={e => { e.stopPropagation(); printForm(form.id); }} className={`p-1.5 rounded ${isLight ? 'hover:bg-black/5 text-[#52404B] hover:text-[#1F1C1B]' : 'hover:bg-white/10 text-white/70 hover:text-white'}`} title="Print Form"><Download size={14}/></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {form.policies.map(pp => (
                        <span key={pp} className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-ci-border text-ci-text-subtle hover:text-ci-text-primary transition-colors cursor-default">{pp}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {visibleForms.length === 0 && (
            <div className="w-full mt-10">
              <EmptyState
                icon={<Search size={40} />}
                title="No forms match your search criteria"
                description="Try adjusting domain, classification, or search text."
              />
            </div>
          )}
        </div>

      </div>
    </>
  );
}
