import React, { useState } from 'react';
import {
  LayoutDashboard, Library, ClipboardCheck, DownloadCloud,
  Menu, X, ChevronRight
} from 'lucide-react';
import whiteLogo from '../CI Home Health Logo_White-DfgJTkII.png';
import SoftAuroraWrapper from './components/SoftAuroraWrapper';
import { ALL_POLICIES } from './data/policies';
import type { Policy } from './types/policy';
import Dashboard from './views/Dashboard';
import PolicyLibrary from './views/PolicyLibrary';
import PolicyDetail from './views/PolicyDetail';
import AuditorReview from './views/AuditorReview';
import MasterExport from './views/MasterExport';

type ViewId = 'dashboard' | 'library' | 'detail' | 'auditor' | 'export';

const NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'library' as const, label: 'Policy Library', icon: Library },
  { id: 'auditor' as const, label: 'Auditor Review', icon: ClipboardCheck },
  { id: 'export' as const, label: 'Master Export', icon: DownloadCloud },
];

export default function App() {
  const [policies, setPolicies] = useState<Policy[]>(ALL_POLICIES);
  const [currentView, setCurrentView] = useState<ViewId>('dashboard');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function updatePolicy(updated: Policy) {
    setPolicies(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  function navigateTo(view: ViewId, policyId?: string) {
    if (policyId) setSelectedPolicyId(policyId);
    setCurrentView(view);
  }

  function selectPolicy(policyId: string) {
    setSelectedPolicyId(policyId);
    setCurrentView('detail');
  }

  const selectedPolicy = selectedPolicyId ? policies.find(p => p.id === selectedPolicyId) ?? null : null;

  return (
    <div className="min-h-screen w-full bg-[#030409] text-white overflow-hidden">
      <SoftAuroraWrapper />
      <div className="relative z-10 flex min-h-screen">
        <aside
          className={`flex flex-col shrink-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-[220px]' : 'w-[60px]'} border-r border-white/[0.06] backdrop-blur-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.02]`}
        >
          <div className="flex items-center gap-3 px-3 py-4 border-b border-white/[0.06]">
            <img src={whiteLogo} alt="Care Indeed" className="w-8 h-8 shrink-0 object-contain" />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-xs font-semibold leading-tight truncate">Care Indeed</div>
                <div className="text-white/30 text-[9px] uppercase tracking-widest truncate">Policy System</div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className={`text-white/30 hover:text-white/60 transition-colors shrink-0 ${sidebarOpen ? '' : 'mx-auto'}`}
            >
              {sidebarOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
            </button>
          </div>
          <nav className="flex-1 py-3 space-y-0.5 px-2">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = currentView === item.id || (currentView === 'detail' && item.id === 'library');
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all ${active ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                  {sidebarOpen && active && <ChevronRight className="w-3 h-3 ml-auto shrink-0 text-[#00F0FF]/50" />}
                </button>
              );
            })}
          </nav>
          {sidebarOpen && (
            <div className="px-4 py-3 border-t border-white/[0.06] text-white/20 text-[9px] uppercase tracking-wider">
              v1.0.0-MVP · {policies.length} Policies
            </div>
          )}
        </aside>
        <main className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.06] backdrop-blur-xl bg-white/[0.015] shrink-0">
            <div className="text-white/65 text-sm font-semibold">
              {currentView === 'dashboard' && 'Dashboard'}
              {(currentView === 'library' || currentView === 'detail') && (
                <span className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentView('library')} className="hover:text-white transition-colors">Policy Library</button>
                  {currentView === 'detail' && selectedPolicy && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-white/25" />
                      <span className="text-[#00F0FF]/70 font-mono text-xs">{selectedPolicy.policyId}</span>
                    </>
                  )}
                </span>
              )}
              {currentView === 'auditor' && 'Auditor Review'}
              {currentView === 'export' && 'Master Export'}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Local mode · no backend</span>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6">
            {currentView === 'dashboard' && (
              <Dashboard policies={policies} onNavigate={navigateTo} />
            )}
            {currentView === 'library' && (
              <PolicyLibrary policies={policies} onSelectPolicy={selectPolicy} />
            )}
            {currentView === 'detail' && selectedPolicy && (
              <PolicyDetail
                policy={selectedPolicy}
                onBack={() => setCurrentView('library')}
                onUpdatePolicy={updatePolicy}
              />
            )}
            {currentView === 'detail' && !selectedPolicy && (
              <div className="text-white/30 text-sm">
                No policy selected.{' '}
                <button onClick={() => setCurrentView('library')} className="text-[#00F0FF] underline">
                  Go to Library
                </button>
              </div>
            )}
            {currentView === 'auditor' && (
              <AuditorReview policies={policies} onUpdatePolicy={updatePolicy} />
            )}
            {currentView === 'export' && (
              <MasterExport policies={policies} onUpdatePolicy={updatePolicy} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
