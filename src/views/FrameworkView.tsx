import React, { useState, useMemo } from 'react';
import { Layers, GitBranch, FileText, ShieldCheck, ArrowDown, Clock, CheckCircle, AlertTriangle, Archive } from 'lucide-react';
import type { Policy } from '../types/policy';
import { DOMAIN_META, SUBDOMAIN_META } from '../data/taxonomy';

interface FrameworkViewProps {
  policies: Policy[];
}

export default function FrameworkView({ policies }: FrameworkViewProps) {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'lifecycle'>('hierarchy');

  const domains = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of policies) map.set(p.domainCode, (map.get(p.domainCode) || 0) + 1);
    return map;
  }, [policies]);

  const totalSubdomains = useMemo(() => {
    const set = new Set<string>();
    for (const p of policies) set.add(`${p.domainCode}-${p.subdomainCode}`);
    return set.size;
  }, [policies]);

  const stats = [
    { label: 'TAXONOMY DOMAINS', value: String(domains.size), sub: 'Top-Level Categories', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
    { label: 'SUBDOMAINS', value: String(totalSubdomains), sub: 'Structural Pillars', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { label: 'TOTAL POLICIES', value: String(policies.length), sub: 'Managed Artifacts', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
    { label: 'GOVERNANCE', value: '100%', sub: 'IBM Watson Knowledge Catalog v5.x', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  ];

  const layers = [
    { id: 0, label: 'Regulatory Foundation', desc: 'CMS CoPs · State Licensure · Accreditation Standards', bg: 'bg-gray-800', text: 'text-white', icon: ShieldCheck, count: 'Federal & State' },
    { id: 1, label: 'Taxonomy Domains', desc: 'Top-level organizational categories', bg: 'bg-[#007970]', text: 'text-white', icon: Layers, count: `${domains.size} Domains` },
    { id: 2, label: 'Subdomains', desc: 'Structural pillars within each domain', bg: 'bg-[#007970]/80', text: 'text-white', icon: GitBranch, count: `${totalSubdomains} Subdomains` },
    { id: 3, label: 'Policy Artifacts', desc: 'Individual policies, procedures, and forms', bg: 'bg-[#C74600]', text: 'text-white', icon: FileText, count: `${policies.length} Artifacts` },
  ];

  const lifecycleStates = [
    { label: 'Draft', desc: 'Initial authoring phase. Policy is being written and reviewed internally.', icon: FileText, color: 'border-gray-300', bg: 'bg-gray-50', textColor: 'text-gray-600' },
    { label: 'Under Review', desc: 'Submitted for formal review by compliance and clinical leadership.', icon: Clock, color: 'border-yellow-300', bg: 'bg-yellow-50', textColor: 'text-yellow-700' },
    { label: 'Approved', desc: 'Approved by the Governing Body or designated authority.', icon: CheckCircle, color: 'border-emerald-300', bg: 'bg-emerald-50', textColor: 'text-emerald-700' },
    { label: 'Published', desc: 'Active and in force. Staff training required within 14 days.', icon: ShieldCheck, color: 'border-[#007970]', bg: 'bg-[#007970]/5', textColor: 'text-[#007970]' },
    { label: 'Revision Requested', desc: 'Returned for revision based on audit findings or regulatory changes.', icon: AlertTriangle, color: 'border-orange-300', bg: 'bg-orange-50', textColor: 'text-orange-700' },
    { label: 'Archived', desc: 'Superseded or retired. Retained for 7 years per retention policy.', icon: Archive, color: 'border-gray-200', bg: 'bg-gray-50', textColor: 'text-gray-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise Policy Architecture</h1>
        <p className="text-gray-500 text-sm mt-1">Care Indeed Home Health — Taxonomy Framework v6.0</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.bg} ${stat.border} border border-t-4 border-t-current rounded-xl p-5 shadow-sm`}>
            <div className="flex justify-between items-start">
              <span className={`text-xs font-bold tracking-widest uppercase opacity-80 ${stat.color}`}>{stat.label}</span>
            </div>
            <div className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-1 uppercase">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all border-b-2 -mb-px ${
            activeTab === 'hierarchy' ? 'border-[#007970] text-[#007970]' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Layers size={16} /> System Hierarchy
        </button>
        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all border-b-2 -mb-px ${
            activeTab === 'lifecycle' ? 'border-[#007970] text-[#007970]' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Clock size={16} /> Governance Lifecycle
        </button>
      </div>

      {/* Hierarchy Tab */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-8">
          {/* Layer Diagram */}
          <div className="flex flex-col items-center gap-0">
            {layers.map((layer, i) => {
              const Icon = layer.icon;
              const width = `${60 + i * 12}%`;
              return (
                <React.Fragment key={layer.id}>
                  <div
                    className={`${layer.bg} ${layer.text} rounded-xl px-6 py-5 shadow-md w-full max-w-3xl mx-auto transition-all`}
                    style={{ width }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-lg p-2">
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider opacity-70">Layer {layer.id}</div>
                          <div className="text-lg font-bold">{layer.label}</div>
                          <div className="text-xs opacity-70 mt-0.5">{layer.desc}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{layer.count}</div>
                      </div>
                    </div>
                  </div>
                  {i < layers.length - 1 && (
                    <ArrowDown className="text-gray-300 my-1" size={20} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Domain Detail Grid */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Domain Registry</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(DOMAIN_META).map(d => {
                const count = domains.get(d.code) || 0;
                const subs = Object.values(SUBDOMAIN_META).filter(s => s.domainCode === d.code);
                return (
                  <div key={d.code} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-[#007970] text-white px-2 py-0.5 rounded text-xs font-bold">{d.code}</span>
                      <h3 className="font-bold text-gray-900">{d.name}</h3>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{d.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                      <span><strong className="text-gray-700">{count}</strong> policies</span>
                      <span><strong className="text-gray-700">{subs.length}</strong> subdomains</span>
                      <span className="ml-auto font-bold text-gray-400 uppercase">{d.owner}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Lifecycle Tab */}
      {activeTab === 'lifecycle' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lifecycleStates.map((state, i) => {
              const Icon = state.icon;
              const count = policies.filter(p => p.status === state.label).length;
              return (
                <div key={state.label} className={`${state.bg} border-2 ${state.color} rounded-xl p-5 shadow-sm`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`${state.textColor} p-2 rounded-lg bg-white shadow-sm`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className={`font-bold ${state.textColor}`}>{state.label}</h3>
                      <span className="text-xs text-gray-400 font-bold">{count} policies</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{state.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Lifecycle Flow */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Lifecycle Flow</h3>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {['Draft', 'Under Review', 'Approved', 'Published'].map((s, i) => (
                <React.Fragment key={s}>
                  <span className="bg-[#007970] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">{s}</span>
                  {i < 3 && <ArrowDown className="text-gray-300 rotate-[-90deg]" size={16} />}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <span className="text-gray-400 text-xs font-bold">Branching:</span>
              <span className="bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-lg text-xs font-bold">Revision Requested</span>
              <span className="text-gray-300">→</span>
              <span className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1 rounded-lg text-xs font-bold">Draft</span>
              <span className="text-gray-300 mx-3">|</span>
              <span className="bg-gray-100 text-gray-400 border border-gray-200 px-3 py-1 rounded-lg text-xs font-bold">Archived</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
