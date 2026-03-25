import React, { useState } from 'react';
import { DownloadCloud, HardDrive, BookOpen, FileJson, CheckSquare, Square } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { TierBadge, StatusBadge } from '../components/StatusBadge';
import type { Policy } from '../types/policy';

interface MasterExportProps {
  policies: Policy[];
  onUpdatePolicy: (updated: Policy) => void;
}

export default function MasterExport({ policies, onUpdatePolicy }: MasterExportProps) {
  const [activeTab, setActiveTab] = useState<'master' | 'scorm' | 'drive'>('master');
  const [exportDone, setExportDone] = useState(false);

  const eligible = policies.filter(p => p.status === 'Approved' || p.status === 'Published');
  const masterFlagged = eligible.filter(p => p.publishToMasterFile);
  const scormFlagged = eligible.filter(p => p.publishToScorm);

  function toggleMasterFile(p: Policy) {
    onUpdatePolicy({ ...p, publishToMasterFile: !p.publishToMasterFile });
  }

  function toggleScorm(p: Policy) {
    onUpdatePolicy({ ...p, publishToScorm: !p.publishToScorm });
  }

  function toggleAll(flag: 'master' | 'scorm', doSet: boolean) {
    eligible.forEach(p => {
      if (flag === 'master') onUpdatePolicy({ ...p, publishToMasterFile: doSet });
      else onUpdatePolicy({ ...p, publishToScorm: doSet });
    });
  }

  function handleExportJSON() {
    const exportData = masterFlagged.map(p => ({
      policyId: p.policyId,
      title: p.title,
      domain: p.domain,
      subdomain: p.subdomain,
      tier: p.tier,
      status: p.status,
      version: p.version,
      briefDescription: p.briefDescription,
      approvedBy: p.approvedBy,
      lastUpdated: p.lastUpdated,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CI-HomeHealth-MasterPolicyFile-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  }

  const tabs = [
    { id: 'master' as const, label: 'Master File', count: masterFlagged.length },
    { id: 'scorm' as const, label: 'SCORM Queue', count: scormFlagged.length },
    { id: 'drive' as const, label: 'Google Drive', count: null },
  ];

  const renderPolicyRows = (list: Policy[], flag: 'master' | 'scorm') => (
    <div className="divide-y divide-gray-100">
      {eligible.map(p => {
        const active = flag === 'master' ? p.publishToMasterFile : p.publishToScorm;
        const inList = list.some(l => l.id === p.id);
        return (
          <div
            key={p.id}
            className={`flex items-center gap-4 px-5 py-3 transition-all ${inList ? 'bg-[#007970]/5' : ''}`}
          >
            <button
              onClick={() => flag === 'master' ? toggleMasterFile(p) : toggleScorm(p)}
              className="shrink-0"
            >
              {active
                ? <CheckSquare className="w-4 h-4 text-[#007970]" />
                : <Square className="w-4 h-4 text-gray-300" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#007970] text-[10px] font-bold">{p.policyId}</span>
                <TierBadge tier={p.tier} />
                <StatusBadge status={p.status} />
              </div>
              <div className="text-gray-600 text-xs font-medium truncate mt-0.5">{p.title}</div>
            </div>
            <div className="text-gray-400 text-[10px] shrink-0">{p.domainCode}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-5 font-roboto text-[#1F1C1B]">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Eligible Policies', value: eligible.length, color: 'text-[#1F1C1B]' },
          { label: 'Master File Queue', value: masterFlagged.length, color: 'text-[#007970]' },
          { label: 'SCORM Queue', value: scormFlagged.length, color: 'text-[#C74600]' },
          { label: 'Drive Sync', value: '—', color: 'text-[#B0B0B0]' },
        ].map(s => (
          <GlassCard key={s.label} className="p-4 bg-[#FAFBF8] border-[#E5E4E3]">
            <div className={`text-2xl font-montserrat font-bold mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-[#524048] text-xs font-roboto">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E5E4E3] pb-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-montserrat font-semibold transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[#007970] text-[#007970]'
                : 'border-transparent text-[#524048] hover:text-[#007970]'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-montserrat ${
                activeTab === tab.id ? 'bg-[#007970]/10' : 'bg-[#FAFBF8]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Master File Tab */}
      {activeTab === 'master' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-gray-500 text-xs">
              Select policies to include in the master policy file export.
              Only <span className="text-[#007970] font-medium">Approved</span> and <span className="text-[#007970] font-medium">Published</span> policies are eligible.
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleAll('master', true)}
                className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all"
              >
                Select All
              </button>
              <button
                onClick={() => toggleAll('master', false)}
                className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all"
              >
                Clear All
              </button>
              <button
                onClick={handleExportJSON}
                disabled={masterFlagged.length === 0}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  exportDone
                    ? 'border-emerald-500/40 text-emerald-700 bg-emerald-50'
                    : 'border-[#007970]/40 text-[#007970] hover:bg-[#007970]/10 disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                {exportDone ? 'Downloaded!' : `Export JSON (${masterFlagged.length})`}
              </button>
            </div>
          </div>
          <GlassCard className="overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-[#FAFBF8] border-b border-[#E5E4E3]">
              <div className="text-[#747470] text-[10px] uppercase tracking-wider w-4 font-montserrat" />
              <div className="text-[#747470] text-[10px] uppercase tracking-wider flex-1 font-montserrat">Policy</div>
              <div className="text-[#747470] text-[10px] uppercase tracking-wider w-16 font-montserrat">Domain</div>
            </div>
            {eligible.length === 0 ? (
              <div className="text-center py-12 text-[#B0B0B0] text-sm font-roboto">
                No approved or published policies yet.
              </div>
            ) : (
              renderPolicyRows(masterFlagged, 'master')
            )}
          </GlassCard>
        </div>
      )}

      {/* SCORM Tab */}
      {activeTab === 'scorm' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-gray-500 text-xs">
              Queue policies for SCORM package generation. Each policy will be compiled into a SCORM 1.2 / 2004 module.
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleAll('scorm', true)}
                className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all"
              >
                Queue All
              </button>
              <button
                onClick={() => toggleAll('scorm', false)}
                className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all"
              >
                Clear Queue
              </button>
              <button
                disabled
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold border border-[#C74600]/30 text-[#C74600]/50 cursor-not-allowed"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Generate SCORM ({scormFlagged.length})
              </button>
            </div>
          </div>
          <GlassCard className="p-4 border border-[#C74600]/20 bg-orange-50">
            <div className="text-[#C74600] text-xs font-semibold mb-1">SCORM Integration Hook</div>
            <div className="text-gray-500 text-xs leading-relaxed">
              SCORM generation requires a build service integration (e.g., Rustici, Articulate API, or custom pipeline).
              This button will call <code className="text-[#C74600]/70 bg-[#C74600]/10 px-1 rounded">POST /api/scorm/generate</code> with
              the selected policy IDs. Set <code className="text-gray-600 bg-gray-100 px-1 rounded">VITE_SCORM_API_URL</code> in your .env to activate.
            </div>
          </GlassCard>
          <GlassCard className="overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 border-b border-gray-200">
              <div className="text-gray-400 text-[10px] uppercase tracking-wider w-4" />
              <div className="text-gray-400 text-[10px] uppercase tracking-wider flex-1">Policy</div>
              <div className="text-gray-400 text-[10px] uppercase tracking-wider w-16">Domain</div>
            </div>
            {eligible.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No eligible policies yet.</div>
            ) : (
              renderPolicyRows(scormFlagged, 'scorm')
            )}
          </GlassCard>
        </div>
      )}

      {/* Google Drive Tab */}
      {activeTab === 'drive' && (
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <HardDrive className="w-6 h-6 text-gray-400" />
            <h3 className="text-gray-700 font-semibold">Google Drive Sync</h3>
          </div>
          <div className="space-y-4 max-w-xl">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-sm leading-relaxed">
              <div className="font-semibold text-gray-600 mb-2">Integration Hook</div>
              <p>This panel manages Google Drive folder sync for exported policy files. Each policy record has a <code className="text-[#007970] bg-[#007970]/5 px-1 rounded">driveFileId</code> field that stores the associated Google Drive file ID.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm font-mono text-gray-500 leading-relaxed">
              <div className="text-gray-600 mb-2"># Required environment variables</div>
              <div>VITE_GOOGLE_DRIVE_FOLDER_ID=your_folder_id</div>
              <div>VITE_GOOGLE_SERVICE_ACCOUNT=path/to/service-account.json</div>
            </div>
            <button
              disabled
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed text-sm"
            >
              <DownloadCloud className="w-4 h-4" />
              Connect Google Drive (configure .env first)
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
