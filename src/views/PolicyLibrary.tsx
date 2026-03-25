import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronRight, X } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { TierBadge, StatusBadge } from '../components/StatusBadge';
import type { Policy, FilterState } from '../types/policy';
import { DOMAIN_LABELS, ALL_STATUSES, ALL_TIERS } from '../data/policies';

interface PolicyLibraryProps {
  policies: Policy[];
  onSelectPolicy: (policyId: string) => void;
}

export default function PolicyLibrary({ policies, onSelectPolicy }: PolicyLibraryProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '', domain: '', subdomain: '', tier: '', status: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const allDomains = useMemo(() => [...new Set(policies.map(p => p.domainCode))].sort(), [policies]);
  const allSubdomains = useMemo(() => {
    const filtered = filters.domain ? policies.filter(p => p.domainCode === filters.domain) : policies;
    return [...new Set(filtered.map(p => p.subdomainCode))].sort();
  }, [policies, filters.domain]);

  const filtered = useMemo(() => {
    return policies.filter(p => {
      const q = filters.search.toLowerCase();
      if (q && !p.policyId.toLowerCase().includes(q) && !p.title.toLowerCase().includes(q) && !p.briefDescription.toLowerCase().includes(q)) return false;
      if (filters.domain && p.domainCode !== filters.domain) return false;
      if (filters.subdomain && p.subdomainCode !== filters.subdomain) return false;
      if (filters.tier && p.tier !== filters.tier) return false;
      if (filters.status && p.status !== filters.status) return false;
      return true;
    });
  }, [policies, filters]);

  const activeFilterCount = [filters.domain, filters.subdomain, filters.tier, filters.status].filter(Boolean).length;

  function clearFilters() {
    setFilters({ search: '', domain: '', subdomain: '', tier: '', status: '' });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Policy Library</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {filtered.length} of {policies.length} policies
          </p>
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
            ${showFilters || activeFilterCount > 0
              ? 'border-[#00F0FF]/50 text-[#00F0FF] bg-[#00F0FF]/10'
              : 'border-white/15 text-white/60 bg-white/5 hover:border-white/30'}`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 bg-[#00F0FF] text-[#030409] rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search by Policy ID, title, or description…"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white/80 text-sm placeholder:text-white/25 focus:outline-none focus:border-[#00F0FF]/40 focus:bg-white/[0.06] transition-all"
        />
        {filters.search && (
          <button onClick={() => setFilters(f => ({ ...f, search: '' }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <GlassCard className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Domain */}
            <div>
              <label className="block text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Domain</label>
              <select
                value={filters.domain}
                onChange={e => setFilters(f => ({ ...f, domain: e.target.value, subdomain: '' }))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg text-white/70 text-sm px-3 py-2 focus:outline-none focus:border-[#00F0FF]/40"
              >
                <option value="">All Domains</option>
                {allDomains.map(d => <option key={d} value={d}>{d} — {DOMAIN_LABELS[d]}</option>)}
              </select>
            </div>
            {/* Subdomain */}
            <div>
              <label className="block text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Subdomain</label>
              <select
                value={filters.subdomain}
                onChange={e => setFilters(f => ({ ...f, subdomain: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg text-white/70 text-sm px-3 py-2 focus:outline-none focus:border-[#00F0FF]/40"
              >
                <option value="">All Subdomains</option>
                {allSubdomains.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* Tier */}
            <div>
              <label className="block text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Tier</label>
              <select
                value={filters.tier}
                onChange={e => setFilters(f => ({ ...f, tier: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg text-white/70 text-sm px-3 py-2 focus:outline-none focus:border-[#00F0FF]/40"
              >
                <option value="">All Tiers</option>
                {ALL_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {/* Status */}
            <div>
              <label className="block text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg text-white/70 text-sm px-3 py-2 focus:outline-none focus:border-[#00F0FF]/40"
              >
                <option value="">All Statuses</option>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <button onClick={clearFilters} className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1.5 transition-colors">
                <X className="w-3 h-3" /> Clear all filters
              </button>
            </div>
          )}
        </GlassCard>
      )}

      {/* Policy Table */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/35 text-[10px] uppercase tracking-widest font-semibold px-4 py-3 w-32">Policy ID</th>
                <th className="text-left text-white/35 text-[10px] uppercase tracking-widest font-semibold px-4 py-3">Title</th>
                <th className="text-left text-white/35 text-[10px] uppercase tracking-widest font-semibold px-4 py-3 w-16 hidden md:table-cell">Domain</th>
                <th className="text-left text-white/35 text-[10px] uppercase tracking-widest font-semibold px-4 py-3 hidden lg:table-cell">Tier</th>
                <th className="text-left text-white/35 text-[10px] uppercase tracking-widest font-semibold px-4 py-3 hidden lg:table-cell">Status</th>
                <th className="w-8 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-white/30 text-sm">
                    No policies match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((policy, i) => (
                  <tr
                    key={policy.id}
                    onClick={() => onSelectPolicy(policy.id)}
                    className={`border-b border-white/[0.05] cursor-pointer transition-all hover:bg-white/[0.04] hover:border-white/10 ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}
                  >
                    <td className="px-4 py-3.5 font-mono text-[#00F0FF]/80 text-xs font-semibold whitespace-nowrap">
                      {policy.policyId}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-white/80 font-medium leading-snug">{policy.title}</div>
                      <div className="text-white/30 text-xs mt-0.5 hidden md:block line-clamp-1">{policy.briefDescription}</div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="font-mono text-white/40 text-xs">{policy.domainCode}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <TierBadge tier={policy.tier} />
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <StatusBadge status={policy.status} />
                    </td>
                    <td className="px-4 py-3.5 text-white/25">
                      <ChevronRight className="w-4 h-4" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
