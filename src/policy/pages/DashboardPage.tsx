import { usePolicyStore } from '@/policy/stores/policyStore';
import { useAuditorModeStore } from '@/policy/stores/auditorModeStore';
import {
  FileText, AlertTriangle, AlertCircle, Clock, CheckCircle,
  Shield, Eye, Calendar as CalendarIcon,
} from 'lucide-react';

/* Shell-aligned KPI tile — transparent at rest, accent left-border */
function StatusCard({ title, count, desc, icon, accentColor }: {
  title: string; count: number; desc: string; icon: React.ReactNode; accentColor: string;
}) {
  return (
    <div
      className="glass-interactive group border border-white/10 rounded-2xl p-6 relative overflow-hidden"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 2 }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-montserrat font-bold uppercase tracking-widest icon-interactive" style={{ color: accentColor }}>
          {title}
        </h3>
        <span className="icon-interactive" style={{ color: accentColor }}>{icon}</span>
      </div>
      <div className="text-6xl font-light text-white leading-none mb-3">{count}</div>
      <p className="text-xs text-white/50 font-roboto">{desc}</p>
    </div>
  );
}

function MetricItem({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0 group">
      <div className="flex items-center gap-3">
        <span className="icon-interactive text-white/60">{icon}</span>
        <span className="icon-interactive text-sm font-montserrat font-bold text-white/70 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-montserrat font-light text-white">{value}</span>
    </div>
  );
}

export function DashboardPage() {
  const policies = usePolicyStore(state => state.policies);
  const auditorEnabled = useAuditorModeStore(state => state.enabled);
  const auditorToggle = useAuditorModeStore(state => state.toggle);

  const totalPolicies = policies.length;
  const underReview = 244;
  const drafts = 0;
  const revisionReq = 0;
  const approved = 0;
  const criticalCount = 1;
  const escalationCount = 1;
  const warningCount = 0;
  const compliantCount = 0;

  return (
    <div className="h-full w-full flex flex-col relative z-10 font-sans animate-in fade-in duration-500 overflow-y-auto custom-scrollbar p-6 md:p-10">

      <div className="mb-6">
        <div className="text-xs font-montserrat font-bold text-[#00c2b4] uppercase tracking-widest mb-2">POLICY TAXONOMY</div>
        <h1 className="text-2xl font-montserrat font-bold text-white leading-none mb-2">CONTEXT: COMMAND CENTER</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatusCard title="CRITICAL"   count={criticalCount}   desc="Action required (0-7 Days)"         icon={<AlertCircle size={24} />}   accentColor="#DC2626" />
        <StatusCard title="ESCALATION" count={escalationCount} desc="Management review (7-14 Days)"      icon={<AlertTriangle size={24} />} accentColor="#ff8e52" />
        <StatusCard title="WARNING"    count={warningCount}    desc="Approaching deadlines (14-30 Days)" icon={<Clock size={24} />}         accentColor="#FBBF24" />
        <StatusCard title="COMPLIANT"  count={compliantCount}  desc="No action required"                 icon={<CheckCircle size={24} />}   accentColor="#00c2b4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6 group">
            <FileText size={20} className="icon-interactive text-[#00c2b4]" />
            <h2 className="icon-interactive text-lg font-montserrat font-bold text-white">Policy Lifecycle Metrics</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <MetricItem label="TOTAL"         value={totalPolicies} icon={<FileText size={16} />} />
            <MetricItem label="DRAFTS"        value={drafts}        icon={<FileText size={16} />} />
            <MetricItem label="UNDER REVIEW"  value={underReview}   icon={<Eye size={16} />} />
            <MetricItem label="REVISION REQ." value={revisionReq}   icon={<AlertCircle size={16} />} />
            <MetricItem label="APPROVED"      value={approved}      icon={<CheckCircle size={16} />} />
            <MetricItem label="PUBLISHED"     value={0}             icon={<Shield size={16} />} />
          </div>
          <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/10">
            <MetricItem label="ARCHIVED" value={0} icon={<FileText size={16} />} />
          </div>
        </div>

        <div className="border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 group">
              <CalendarIcon size={20} className="icon-interactive text-[#00c2b4]" />
              <h2 className="icon-interactive text-lg font-montserrat font-bold text-white">Upcoming Events</h2>
            </div>
            <a href="/calendar" className="text-xs font-montserrat font-bold text-[#00c2b4]/60 uppercase tracking-widest hover:text-[#00c2b4] transition-colors">Library &gt;</a>
          </div>
          <div className="space-y-4">
            <div className="glass-interactive group border border-white/10 rounded-xl p-4 cursor-pointer hover:border-[#00c2b4]/30">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-montserrat font-semibold text-white/80">QAPI committee meeting</h3>
                <span className="text-xs font-bold text-[#00c2b4] icon-interactive">Oct 27</span>
              </div>
              <p className="text-xs text-white/40 font-roboto">CAL-010 • QAPI</p>
            </div>
            <div className="glass-interactive group border border-white/10 rounded-xl p-4 cursor-pointer hover:border-[#ff8e52]/30">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-montserrat font-semibold text-white/80">Policy and procedure review</h3>
                <span className="text-xs font-bold text-[#ff8e52] icon-interactive">Nov 19</span>
              </div>
              <p className="text-xs text-white/40 font-roboto">CAL-021 • PROGRAM EVAL</p>
            </div>
          </div>
        </div>
      </div>

      {auditorEnabled && (
        <div className="mt-8 border border-[#00c2b4]/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 group">
              <Shield size={24} className="icon-interactive text-[#00c2b4]" />
              <div>
                <h3 className="text-sm font-montserrat font-bold text-[#00c2b4] uppercase tracking-widest mb-1">Auditor Mode</h3>
                <p className="text-sm text-white/60 font-roboto">Enable surveyor view for read-only, restricted access to approved policies.</p>
              </div>
            </div>
            <button onClick={auditorToggle} className="glass-interactive px-6 py-3 border border-[#00c2b4]/30 text-[#00c2b4] rounded-xl font-montserrat font-bold text-sm hover:border-[#00c2b4]/60 transition-all duration-300">
              Enable Auditor View
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 group">
          <AlertTriangle size={20} className="icon-interactive text-[#DC2626]" />
          <h2 className="icon-interactive text-lg font-montserrat font-bold text-[#DC2626] uppercase tracking-widest">Urgent Action Required</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10">
              <tr>
                {['TASK / ID', 'MODULE', 'DEADLINE', 'STATUS', 'ACTION'].map(h => (
                  <th key={h} className="py-3 px-4 text-xs font-montserrat font-bold text-white/40 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="py-8 text-center text-white/30 font-roboto">No urgent actions at this time</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
