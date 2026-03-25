import React, { useState, useMemo } from 'react';
import {
  Layers, GitBranch, FileText, ShieldCheck, Users, Clock, RefreshCw,
  ChevronRight, Home
} from 'lucide-react';
import type { Policy } from '../types/policy';
import { DOMAIN_LABELS } from '../data/policies';
import { DOMAIN_META, SUBDOMAIN_META } from '../data/taxonomy';

interface DashboardProps {
  policies: Policy[];
  onOpenPolicy: (policyId: string) => void;
}

export default function Dashboard({ policies, onOpenPolicy }: DashboardProps) {
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [activeSubdomain, setActiveSubdomain] = useState<string | null>(null);

  const domains = useMemo(() => {
    const map = new Map<string, { code: string; name: string; count: number }>();
    for (const p of policies) {
      if (!map.has(p.domainCode)) {
        map.set(p.domainCode, { code: p.domainCode, name: p.domain, count: 0 });
      }
      map.get(p.domainCode)!.count++;
    }
    return Array.from(map.values());
  }, [policies]);

  const subdomains = useMemo(() => {
    if (!activeDomain) return [];
    const map = new Map<string, { code: string; name: string; count: number; key: string }>();
    for (const p of policies) {
      if (p.domainCode !== activeDomain) continue;
      if (!map.has(p.subdomainCode)) {
        map.set(p.subdomainCode, { code: p.subdomainCode, name: p.subdomain, count: 0, key: `${p.domainCode}-${p.subdomainCode}` });
      }
      map.get(p.subdomainCode)!.count++;
    }
    return Array.from(map.values());
  }, [policies, activeDomain]);

  const filteredPolicies = useMemo(() => {
    let list = policies;
    if (activeDomain) list = list.filter(p => p.domainCode === activeDomain);
    if (activeSubdomain) list = list.filter(p => p.subdomainCode === activeSubdomain);
    return list;
  }, [policies, activeDomain, activeSubdomain]);

  const totalSubdomains = useMemo(() => {
    const set = new Set<string>();
    for (const p of policies) set.add(`${p.domainCode}-${p.subdomainCode}`);
    return set.size;
  }, [policies]);

  const stats = [
    { label: 'TAXONOMY DOMAINS', value: String(domains.length), sub: 'Top-Level Categories', icon: Layers, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', borderTop: 'border-t-orange-500' },
    { label: 'SUBDOMAINS', value: String(totalSubdomains), sub: 'Structural Pillars', icon: GitBranch, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', borderTop: 'border-t-yellow-500' },
    { label: 'TOTAL POLICIES', value: String(policies.length), sub: 'Managed Artifacts', icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', borderTop: 'border-t-teal-600' },
    { label: 'GOVERNANCE', value: '100%', sub: 'IBM Watson Knowledge Catalog v5.x', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', borderTop: 'border-t-emerald-500' },
  ];

  const domainMeta = activeDomain ? DOMAIN_META[activeDomain] : null;
  const subKey = activeSubdomain ? `${activeDomain}-${activeSubdomain}` : null;
  const subdMeta = subKey ? SUBDOMAIN_META[subKey] : null;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`${stat.bg} ${stat.border} ${stat.borderTop} border border-t-4 rounded-xl p-5 shadow-sm`}>
              <div className="flex justify-between items-start">
                <span className={`text-xs font-bold tracking-widest uppercase opacity-80 ${stat.color}`}>{stat.label}</span>
                <Icon size={16} className={`${stat.color} opacity-30`} />
              </div>
              <div className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium mt-1 uppercase">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Domain Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => { setActiveDomain(null); setActiveSubdomain(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
            !activeDomain ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Home size={14} /> All Domains
        </button>
        {domains.map(d => (
          <button
            key={d.code}
            onClick={() => { setActiveDomain(d.code); setActiveSubdomain(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
              activeDomain === d.code ? 'bg-[#007970] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span className={activeDomain === d.code ? 'text-white/70' : 'text-[#007970]'}>●</span>
            {d.code} - {d.name}
          </button>
        ))}
      </div>

      {/* Domain Detail Section */}
      {activeDomain && domainMeta && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{domainMeta.name}</h2>
            <p className="text-gray-500 mt-1 text-sm">{domainMeta.description}</p>
            <p className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <Users size={14} className="text-gray-400" />
              <span className="font-bold uppercase text-xs tracking-wider text-gray-500">Domain Owner:</span>
              <span className="font-bold text-gray-800 uppercase">{domainMeta.owner}</span>
            </p>
          </div>

          {/* Subdomain Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveSubdomain(null)}
              className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                !activeSubdomain ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Subdomains
            </button>
            {subdomains.map(s => (
              <button
                key={s.code}
                onClick={() => setActiveSubdomain(s.code)}
                className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  activeSubdomain === s.code ? 'bg-[#007970] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {s.code} - {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subdomain Detail Card + Policy Artifacts */}
      {activeSubdomain && subdMeta && (
        <div className="space-y-6">
          {/* Subdomain Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{activeDomain}-{activeSubdomain}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{subdMeta.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{subdMeta.description}</p>
              </div>
              <span className="bg-[#007970]/10 text-[#007970] px-3 py-1 rounded-full text-xs font-bold border border-[#007970]/20">
                TIER {subdMeta.tier}
              </span>
            </div>
            <div className="flex items-center gap-8 mt-4 pt-4 border-t border-gray-100 text-sm">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-gray-400" />
                <span className="text-gray-500 font-bold text-xs uppercase">Subdomain Owner</span>
                <span className="text-gray-800 font-bold">{subdMeta.owner}</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw size={14} className="text-gray-400" />
                <span className="text-gray-500 font-bold text-xs uppercase">Review Cycle</span>
                <span className="text-gray-800 font-bold">{subdMeta.reviewCycle}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-gray-400" />
                <span className="text-gray-500 font-bold text-xs uppercase">Total Count</span>
                <span className="text-gray-800 font-bold">{filteredPolicies.length} Policies</span>
              </div>
            </div>
          </div>

          {/* Policy Artifacts */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4">Policy Artifacts ({filteredPolicies.length})</h4>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {filteredPolicies.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => onOpenPolicy(p.id)}
                  className="min-w-[200px] max-w-[200px] bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer hover:border-[#007970] hover:shadow-md transition-all group shrink-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border border-gray-200 px-2 py-0.5 rounded">{p.policyId}</span>
                    <span className="w-2 h-2 rounded-full bg-[#007970]" />
                  </div>
                  <h5 className="font-bold text-gray-900 text-sm leading-tight mb-2 group-hover:text-[#007970] transition-colors line-clamp-2">
                    {p.title.length > 40 ? p.title.slice(0, 40) + '...' : p.title}
                  </h5>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                    {p.briefDescription.slice(0, 80)}...
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                      <Users size={10} /> {activeDomain}
                    </span>
                    <span className="text-[#C74600] text-[10px] font-bold flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C74600]" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Subdomains / No subdomain selected: show overview */}
      {activeDomain && !activeSubdomain && (
        <div className="space-y-4">
          {subdomains.map(s => {
            const meta = SUBDOMAIN_META[`${activeDomain}-${s.code}`];
            const subPolicies = policies.filter(p => p.domainCode === activeDomain && p.subdomainCode === s.code);
            return (
              <div
                key={s.code}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-[#007970] hover:shadow-md transition-all cursor-pointer"
                onClick={() => setActiveSubdomain(s.code)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{activeDomain}-{s.code}</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{s.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{meta?.description || s.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {meta && (
                      <span className="bg-[#007970]/10 text-[#007970] px-3 py-1 rounded-full text-xs font-bold border border-[#007970]/20">
                        TIER {meta.tier}
                      </span>
                    )}
                    <ChevronRight size={18} className="text-gray-300" />
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 font-bold uppercase">
                  <span>{meta?.owner || 'TBD'}</span>
                  <span>{meta?.reviewCycle || 'Annual'}</span>
                  <span>{subPolicies.length} Policies</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No domain selected: show all domains overview */}
      {!activeDomain && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domains.map(d => {
            const meta = DOMAIN_META[d.code];
            return (
              <div
                key={d.code}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-[#007970] hover:shadow-md transition-all cursor-pointer group"
                onClick={() => { setActiveDomain(d.code); setActiveSubdomain(null); }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#007970] text-white px-2 py-0.5 rounded text-xs font-bold">{d.code}</span>
                      <span className="text-xs text-gray-400 font-bold">{d.count} policies</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#007970] transition-colors">{d.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{meta?.description || ''}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-[#007970] transition-colors shrink-0 mt-2" />
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Users size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500 font-bold uppercase">{meta?.owner || ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
