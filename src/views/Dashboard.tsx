import React, { useMemo } from 'react';
import { BarChart2, CheckCircle2, Clock, FileText, AlertTriangle, Archive, XCircle, RefreshCw } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import type { Policy } from '../types/policy';
import type { ViewId } from '../App';
import { DOMAIN_LABELS } from '../data/policies';

interface DashboardProps {
  policies: Policy[];
  onNavigate: (view: ViewId, policyId?: string) => void;
}

export default function Dashboard({ policies, onNavigate }: DashboardProps) {
  const stats = useMemo(() => {
    const s = {
      total: policies.length,
      draft: 0, underReview: 0, approved: 0,
      published: 0, revisionRequested: 0, rejected: 0, archived: 0,
    };
    for (const p of policies) {
      if (p.status === 'Draft') s.draft++;
      else if (p.status === 'Under Review') s.underReview++;
      else if (p.status === 'Approved') s.approved++;
      else if (p.status === 'Published') s.published++;
      else if (p.status === 'Revision Requested') s.revisionRequested++;
      else if (p.status === 'Rejected') s.rejected++;
      else if (p.status === 'Archived') s.archived++;
    }
    return s;
  }, [policies]);

  const byDomain = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of policies) {
      m[p.domainCode] = (m[p.domainCode] || 0) + 1;
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [policies]);

  const byTier = useMemo(() => {
    const m: Record<string, number> = { REQUIRED: 0, ESSENTIAL: 0, RECOMMENDED: 0, 'GOOD TO HAVE': 0 };
    for (const p of policies) m[p.tier] = (m[p.tier] || 0) + 1;
    return m;
  }, [policies]);

  const statCards = [
    { label: 'Total Policies', value: stats.total, icon: FileText, color: 'text-white/80', glowColor: 'rgba(255,255,255,0.05)', filter: '' },
    { label: 'Draft', value: stats.draft, icon: FileText, color: 'text-white/50', glowColor: 'rgba(255,255,255,0.03)', filter: 'Draft' },
    { label: 'Under Review', value: stats.underReview, icon: Clock, color: 'text-yellow-300', glowColor: 'rgba(234,179,8,0.1)', filter: 'Under Review' },
    { label: 'Revision Requested', value: stats.revisionRequested, icon: RefreshCw, color: 'text-orange-300', glowColor: 'rgba(249,115,22,0.1)', filter: 'Revision Requested' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-300', glowColor: 'rgba(52,211,153,0.1)', filter: 'Approved' },
    { label: 'Published', value: stats.published, icon: BarChart2, color: 'text-[#00F0FF]', glowColor: 'rgba(0,240,255,0.1)', filter: 'Published' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-400', glowColor: 'rgba(239,68,68,0.1)', filter: 'Rejected' },
    { label: 'Archived', value: stats.archived, icon: Archive, color: 'text-white/30', glowColor: 'rgba(255,255,255,0.02)', filter: 'Archived' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Policy Command Center</h1>
        <p className="text-white/40 text-sm mt-1">Care Indeed Home Health Agency — Policy & Procedure Management System</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <GlassCard
              key={card.label}
              hover={!!card.filter}
              onClick={card.filter ? () => onNavigate('library') : undefined}
              className="p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
                  <div className="text-white/40 text-xs mt-1 font-medium">{card.label}</div>
                </div>
                <Icon className={`w-5 h-5 ${card.color} opacity-60`} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Domain distribution + Tier breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Domain */}
        <GlassCard className="p-6">
          <h2 className="text-white/80 font-semibold text-sm mb-4 uppercase tracking-widest">Policies by Domain</h2>
          <div className="space-y-3">
            {byDomain.map(([code, count]) => {
              const pct = Math.round((count / stats.total) * 100);
              return (
                <div key={code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60 font-mono">{code}</span>
                    <span className="text-white/40">{count} policies</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00F0FF]/60 to-[#00F0FF]/20"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-white/25">{DOMAIN_LABELS[code]}</div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* By Tier */}
        <GlassCard className="p-6">
          <h2 className="text-white/80 font-semibold text-sm mb-4 uppercase tracking-widest">Policies by Tier</h2>
          <div className="space-y-4">
            {Object.entries(byTier).map(([tier, count]) => {
              const pct = Math.round((count / stats.total) * 100);
              const colors: Record<string, string> = {
                REQUIRED: 'from-[#FF5A1F]/70 to-[#FF5A1F]/20',
                ESSENTIAL: 'from-[#00F0FF]/70 to-[#00F0FF]/20',
                RECOMMENDED: 'from-purple-400/70 to-purple-400/20',
                'GOOD TO HAVE': 'from-white/30 to-white/10',
              };
              return (
                <div key={tier} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60 font-semibold">{tier}</span>
                    <span className="text-white/40">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${colors[tier] || 'from-white/30 to-white/10'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Readiness notice */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-xs text-white/40 leading-relaxed">
                All {stats.total} policies are pre-seeded from the approved Enterprise Taxonomy Framework. Policy body content is pending final authoring. The workflow and approval infrastructure is fully operational.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick actions */}
      <GlassCard className="p-6">
        <h2 className="text-white/80 font-semibold text-sm mb-4 uppercase tracking-widest">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Browse Policy Library', desc: 'Search & filter all 232 policies', view: 'library', color: 'border-[#00F0FF]/30 hover:border-[#00F0FF]/60' },
            { label: 'Auditor Mode', desc: 'Review, comment & approve', view: 'auditor', color: 'border-[#FF5A1F]/30 hover:border-[#FF5A1F]/60' },
            { label: 'Approval Queue', desc: 'Policies ready for action', view: 'auditor', color: 'border-emerald-500/30 hover:border-emerald-500/60' },
            { label: 'Master Export', desc: 'Approved file preparation', view: 'export', color: 'border-purple-500/30 hover:border-purple-500/60' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.view as ViewId)}
              className={`text-left p-4 rounded-lg border bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 ${action.color}`}
            >
              <div className="text-white/80 font-semibold text-sm">{action.label}</div>
              <div className="text-white/35 text-xs mt-1">{action.desc}</div>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* System notes */}
      <GlassCard className="p-5 border-[#00F0FF]/10">
        <div className="flex items-start gap-3">
          <div className="w-1 h-full min-h-[40px] bg-[#00F0FF]/40 rounded-full shrink-0" />
          <div>
            <p className="text-white/60 text-sm font-semibold mb-1">System Architecture Notes</p>
            <ul className="text-white/35 text-xs space-y-1 leading-relaxed">
              <li>• <strong className="text-white/50">Google Drive Export hook:</strong> Connect <code className="font-mono text-[#00F0FF]/60">publishToMasterFile</code> flag to Drive API in <code className="font-mono">MasterExport.tsx</code></li>
              <li>• <strong className="text-white/50">SCORM generation hook:</strong> Connect <code className="font-mono text-[#00F0FF]/60">publishToScorm</code> flag to SCORM packaging service in <code className="font-mono">scorm/builder.ts</code> (scaffold ready)</li>
              <li>• <strong className="text-white/50">Persistence:</strong> Replace <code className="font-mono text-[#00F0FF]/60">useState</code> in App.tsx with backend API calls or Supabase client — all data structures are backend-ready</li>
              <li>• <strong className="text-white/50">Auth layer:</strong> Auditor Mode requires role-based access — insert auth guard at <code className="font-mono text-[#00F0FF]/60">AuditorReview.tsx</code> entry point</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
