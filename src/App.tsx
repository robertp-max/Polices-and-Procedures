import React, { useState } from 'react';
import {
  LayoutDashboard, Library, ClipboardCheck, DownloadCloud,
  Menu, X, ChevronRight, ChevronDown, Layers, FileText, Search, Bell
} from 'lucide-react';
import whiteLogo from '../CI Home Health Logo_White-DfgJTkII.png';
import { ALL_POLICIES } from './data/policies';
import type { Policy } from './types/policy';
import Dashboard from './views/DashboardNew';
import FrameworkView from './views/FrameworkView';
import PolicyLibrary from './views/PolicyLibrary';
import PolicyDetail from './views/PolicyDetail';
import AuditorReview from './views/AuditorReview';
import MasterExport from './views/MasterExport';
import PolicyPopup from './components/PolicyPopup';

export type ViewId = 'dashboard' | 'library' | 'detail' | 'auditor' | 'export' | 'framework' | 'sample';

const NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'library' as const, label: 'Policy', icon: Library,
    children: [
      { id: 'framework' as const, label: 'Framework', icon: Layers },
      { id: 'sample' as const, label: 'Sample Policy', icon: FileText },
    ],
  },
  { id: 'auditor' as const, label: 'Auditor Review', icon: ClipboardCheck },
  { id: 'export' as const, label: 'Master Export', icon: DownloadCloud },
];

export default function App() {
  const [policies, setPolicies] = useState<Policy[]>(ALL_POLICIES);
  const [currentView, setCurrentView] = useState<ViewId>('dashboard');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [policyExpanded, setPolicyExpanded] = useState(false);
  const [popupPolicyId, setPopupPolicyId] = useState<string | null>(null);

  function updatePolicy(updated: Policy) {
    setPolicies(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  function selectPolicy(policyId: string) {
    setSelectedPolicyId(policyId);
    setCurrentView('detail');
  }

  function openPopup(policyId: string) {
    setPopupPolicyId(policyId);
  }

  function closePopup() {
    setPopupPolicyId(null);
  }

  const selectedPolicy = selectedPolicyId ? policies.find(p => p.id === selectedPolicyId) ?? null : null;
  const popupPolicy = popupPolicyId ? policies.find(p => p.id === popupPolicyId) ?? null : null;

  const samplePolicy = policies.find(p => p.policyId === 'GV-GB-001') ?? null;

  const viewLabel: Record<string, string> = {
    dashboard: 'Dashboard',
    library: 'Policy Library',
    detail: 'Policy Detail',
    auditor: 'Auditor Review',
    export: 'Master Export',
    framework: 'Enterprise Policy Framework',
    sample: 'Sample Policy — GV-GB-001',
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFBF8] text-gray-900 font-sans overflow-hidden">
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`flex flex-col shrink-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-[240px]' : 'w-[60px]'} bg-[#1F1C1B]`}
        >
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
            <img src={whiteLogo} alt="Care Indeed" className="w-8 h-8 shrink-0 object-contain" />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-bold leading-tight truncate">Care Indeed</div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest truncate">Home Health</div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className={`text-white/40 hover:text-white/70 transition-colors shrink-0 ${sidebarOpen ? '' : 'mx-auto'}`}
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
          <nav className="flex-1 py-4 space-y-1 px-2">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isParentActive = currentView === item.id ||
                (item.id === 'library' && ['library', 'detail', 'framework', 'sample'].includes(currentView));
              const hasChildren = 'children' in item && item.children;

              return (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        setPolicyExpanded(v => !v);
                        if (!policyExpanded) setCurrentView('library');
                      } else {
                        setCurrentView(item.id);
                      }
                    }}
                    title={!sidebarOpen ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isParentActive
                        ? 'bg-[#007970] text-white'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {sidebarOpen && <span className="truncate flex-1 text-left">{item.label}</span>}
                    {sidebarOpen && hasChildren && (
                      policyExpanded
                        ? <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" />
                        : <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />
                    )}
                  </button>
                  {hasChildren && policyExpanded && sidebarOpen && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                      <button
                        onClick={() => setCurrentView('library')}
                        className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                          currentView === 'library' || currentView === 'detail'
                            ? 'text-[#007970] bg-white/10'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                        }`}
                      >
                        <Library className="w-3.5 h-3.5" /> Policy Library
                      </button>
                      {item.children!.map(child => {
                        const ChildIcon = child.icon;
                        return (
                          <button
                            key={child.id}
                            onClick={() => setCurrentView(child.id)}
                            className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                              currentView === child.id
                                ? 'text-[#007970] bg-white/10'
                                : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                            }`}
                          >
                            <ChildIcon className="w-3.5 h-3.5" /> {child.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          {sidebarOpen && (
            <div className="px-4 py-3 border-t border-white/10 text-white/25 text-[9px] uppercase tracking-wider">
              v1.0.0-MVP · {policies.length} Policies
            </div>
          )}
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shrink-0">
            <div className="text-gray-800 text-sm font-bold">
              {currentView === 'detail' && selectedPolicy ? (
                <span className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentView('library')} className="text-gray-400 hover:text-gray-700 transition-colors">Policy Library</button>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  <span className="text-[#007970] font-mono text-xs">{selectedPolicy.policyId}</span>
                </span>
              ) : (
                viewLabel[currentView] || 'Dashboard'
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search policies..."
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#007970] w-64"
                  readOnly
                />
              </div>
              <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C74600] rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-full bg-[#007970] text-white flex items-center justify-center text-xs font-bold">CI</div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#FAFBF8]">
            {currentView === 'dashboard' && (
              <Dashboard policies={policies} onOpenPolicy={openPopup} />
            )}
            {currentView === 'framework' && (
              <FrameworkView policies={policies} />
            )}
            {currentView === 'sample' && samplePolicy && (
              <div className="max-w-6xl mx-auto">
                <PolicyPopup policy={samplePolicy} onClose={() => setCurrentView('library')} embedded />
              </div>
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
              <div className="text-gray-400 text-sm">
                No policy selected.{' '}
                <button onClick={() => setCurrentView('library')} className="text-[#007970] underline">
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

      {/* Policy Popup Modal */}
      {popupPolicy && (
        <PolicyPopup policy={popupPolicy} onClose={closePopup} />
      )}
    </div>
  );
}
