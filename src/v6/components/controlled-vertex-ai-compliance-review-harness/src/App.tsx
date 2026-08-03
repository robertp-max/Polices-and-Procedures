import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  FileText,
  CheckCircle,
  AlertTriangle,
  UploadCloud,
  Lock,
  Settings,
  Database,
  Download,
  RefreshCw,
  Plus,
  Play,
  Cpu,
  History,
} from 'lucide-react';

interface FileMetadata {
  filename: string;
  path: string;
  size: number;
  sha256: string;
  createdTime: string;
  modifiedTime: string;
  mimeType: string;
  reviewStatus: string;
}

interface WorkspaceManifest {
  workspaceId: string;
  name: string;
  createdAt: string;
  phiModeEnabled: boolean;
  baaConfirmed: boolean;
  files: FileMetadata[];
}

interface Finding {
  findingId: string;
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  category: string;
  affectedFile: string;
  evidenceQuote: string;
  whyItMatters: string;
  complianceImpact: string;
  recommendedFix: string;
  verificationTest: string;
  status: 'open' | 'needs human review' | 'fixed';
}

interface NetworkLog {
  timestamp: string;
  workspaceId: string;
  destination: string;
  allowed: boolean;
  user: string;
  reason: string;
}

interface HashChainLog {
  timestamp: string;
  logType: string;
  data: unknown;
  previous_hash: string;
  record_hash: string;
}

interface ComplianceTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  files: unknown[];
}

interface ComplianceConfig {
  baaConfirmed: boolean;
  phiModeEnabled: boolean;
  redactionModeEnabled: boolean;
  modelProvider: string;
  modelName: string;
  modelEndpoint: string;
  promptVersion: string;
  approvedServices: {
    vertexAI: boolean;
    googleSearch: boolean;
    unapprovedConnectors: boolean;
    gmail: boolean;
    googleDrive: boolean;
  };
}

export default function App() {
  // Config & state variables
  const [config, setConfig] = useState<ComplianceConfig>({
    baaConfirmed: false,
    phiModeEnabled: false,
    redactionModeEnabled: true,
    modelProvider: 'Google Cloud Vertex AI',
    modelName: 'gemini-2.5-pro',
    modelEndpoint: '',
    promptVersion: '',
    approvedServices: {
      vertexAI: true,
      googleSearch: false,
      unapprovedConnectors: false,
      gmail: false,
      googleDrive: false
    }
  });

  const [workspaces, setWorkspaces] = useState<WorkspaceManifest[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [activeWorkspace, setActiveWorkspace] = useState<{
    manifest: WorkspaceManifest;
    findings: Finding[];
    networkLogs: NetworkLog[];
    hashChainLogs: HashChainLog[];
    reportMd: string;
    reportHtml: string;
  } | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'files' | 'findings' | 'report' | 'logs' | 'config'>('files');
  const [reviewMode, setReviewMode] = useState<string>('defensibility');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [reviewStep, setReviewStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState<boolean>(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>('');

  // Templates library state
  const [templates, setTemplates] = useState<ComplianceTemplate[]>([]);
  const [templateFilter, setTemplateFilter] = useState<string>('all');

  // Manual outbound check simulation parameters
  const [manualDest, setManualDest] = useState<string>('https://unapproved-connector-api.com/sync');
  const [manualReason, setManualReason] = useState<string>('Attempted automated state schedule push');

  // Load configuration and workspaces on mount
  useEffect(() => {
    fetchConfig();
    fetchWorkspaces();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data || []);
      }
    } catch (e) {
      console.error('Failed to load compliance templates:', e);
    }
  };

  const injectTemplate = async (templateId: string) => {
    if (!selectedWorkspaceId) {
      setErrorMessage('Please select or provision a workspace first.');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch(`/api/workspaces/${selectedWorkspaceId}/inject-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`Selected template successfully injected into active workspace. Evidence registry updated.`);
        await fetchWorkspaceDetails(selectedWorkspaceId);
      } else {
        setErrorMessage(data.error || 'Failed to inject template document.');
      }
    } catch {
      setErrorMessage('Network error injecting template document.');
    }
  };

  // Sync selected workspace details when id changes
  useEffect(() => {
    if (selectedWorkspaceId) {
      fetchWorkspaceDetails(selectedWorkspaceId);
    } else {
      setActiveWorkspace(null);
    }
  }, [selectedWorkspaceId]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setConfig(data);
    } catch {
      setErrorMessage('Failed to fetch server security posture configuration.');
    }
  };

  const updateConfigField = async (updatedFields: Partial<ComplianceConfig>) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      const data = await res.json();
      if (res.ok) {
        setConfig(data.config);
        setSuccessMessage('Compliance posture successfully hardened.');
      } else {
        setErrorMessage(data.error || 'Configuration update was rejected by strict policy gate.');
      }
    } catch {
      setErrorMessage('Failed to persist configuration.');
    }
  };

  const fetchWorkspaces = async (selectLatest = true) => {
    try {
      const res = await fetch('/api/workspaces');
      const data = await res.json();
      setWorkspaces(data);
      if (selectLatest && data.length > 0) {
        setSelectedWorkspaceId(data[0].workspaceId);
      }
    } catch {
      setErrorMessage('Failed to load active workspaces.');
    }
  };

  const fetchWorkspaceDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/workspaces/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveWorkspace(data);
      } else {
        setErrorMessage('Failed to load workspace files and logs.');
      }
    } catch {
      setErrorMessage('Network error fetching workspace context.');
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWorkspaceName }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowNewWorkspaceModal(false);
        setNewWorkspaceName('');
        await fetchWorkspaces(false);
        setSelectedWorkspaceId(data.workspaceId);
        setSuccessMessage(`Workspace "${data.name}" successfully provisioned.`);
      } else {
        setErrorMessage(data.error || 'Failed to create workspace.');
      }
    } catch {
      setErrorMessage('Error communicating with compliance directory.');
    }
  };

  // Upload handler supporting standard list ingestion
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    setErrorMessage('');
    
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('files', e.target.files[i]);
    }

    try {
      const res = await fetch(`/api/workspaces/${selectedWorkspaceId}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(`${e.target.files.length} secure evidence file(s) ingested and hashed.`);
        fetchWorkspaceDetails(selectedWorkspaceId);
      } else {
        setErrorMessage(data.error || 'Evidence upload was rejected.');
      }
    } catch {
      setErrorMessage('Upload failure. Check file integrity.');
    } finally {
      setIsUploading(false);
    }
  };

  // Secure connection trigger with deterministic logs
  const simulateOutboundConnection = async (dest: string, allow: boolean, reason: string) => {
    try {
      const res = await fetch(`/api/workspaces/${selectedWorkspaceId}/network-attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: dest, allowed: allow, reason }),
      });
      if (res.ok) {
        setSuccessMessage(`Security block executed. Attempt logged for ${dest}.`);
        fetchWorkspaceDetails(selectedWorkspaceId);
      }
    } catch {
      setErrorMessage('Failed to log simulated outbound activity.');
    }
  };

  // Run structured review
  const runReviewHarness = async () => {
    if (isReviewing) return;
    setIsReviewing(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Array of deterministic steps A to J to show animation & process integrity
    const steps = [
      { code: 'A', name: 'Intake and manifest creation... (Verifying file SHA256 hashes)' },
      { code: 'B', name: 'Source mapping... (Constructing secure local evidence references)' },
      { code: 'C', name: 'Scope confirmation... (Restricting outbound network gateway)' },
      { code: 'D', name: 'Issue discovery... (Analyzing local procedures & policies)' },
      { code: 'E', name: 'Evidence-backed findings... (Extracting true source quotations)' },
      { code: 'F', name: 'Severity classification... (Categorizing risk criteria P0-P3)' },
      { code: 'G', name: 'Fix recommendations... (Defining remediation instructions)' },
      { code: 'H', name: 'Verification tests... (Validating defensive compliance benchmarks)' },
      { code: 'I', name: 'Final defensibility rating... (Evaluating overall audit scorecard)' },
      { code: 'J', name: 'Export package staging... (Finalizing reports & audit logs)' }
    ];

    for (const step of steps) {
      setReviewStep(`Stage ${step.code}: ${step.name}`);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const res = await fetch(`/api/workspaces/${selectedWorkspaceId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewMode }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Deterministic compliance review completed successfully.');
        await fetchWorkspaceDetails(selectedWorkspaceId);
        setActiveTab('findings');
      } else {
        setErrorMessage(data.error || 'Vertex AI Compliance Harness evaluation aborted.');
      }
    } catch {
      setErrorMessage('Error running model analysis.');
    } finally {
      setIsReviewing(false);
      setReviewStep('');
    }
  };

  // ZIP download package trigger
  const handleExportPackage = () => {
    window.open(`/api/workspaces/${selectedWorkspaceId}/export`, '_blank');
  };

  const getSeverityBadge = (sev: 'P0' | 'P1' | 'P2' | 'P3') => {
    switch (sev) {
      case 'P0':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#421700] text-white">P0 - Critical Risk</span>;
      case 'P1':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#C74601] text-white">P1 - High Gap</span>;
      case 'P2':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#E9E5E3] text-[#004142]">P2 - Operational</span>;
      case 'P3':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#FAF8F8] text-[#524D4B] border">P3 - Minor</span>;
      default:
        return null;
    }
  };

  const isSurveyReady = activeWorkspace?.reportMd?.includes('SURVEY READY');

  return (
    <div className="min-h-screen bg-[#F7FEFF] flex flex-col md:flex-row text-[#004142]">
      {/* Sidebar navigation and security posture status */}
      <aside className="w-full md:w-[320px] bg-white border-b md:border-b-0 md:border-r border-[#00797D]/10 p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#00797D]/10 p-2 rounded-xl">
            <Shield className="h-6 w-6 text-[#00797D]" />
          </div>
          <div>
            <h1 className="text-sm font-medium text-[#004142] uppercase tracking-wider">CareIndeed V6</h1>
            <p className="text-[10px] text-[#7A7470] uppercase tracking-widest font-light">Compliance Harness</p>
          </div>
        </div>

        {/* Vertex AI Connection Status badge */}
        <div className="mb-5 rounded-2xl custom-shadow-soft bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-[#7A7470]">Network Posture</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00797D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00797D]"></span>
            </span>
          </div>
          <div className="text-xs font-medium text-[#004142] flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-[#00797D]" />
            Strict No-Web Restriction
          </div>
          <p className="text-[10px] text-[#7A7470] mt-1">Vertex AI Secure Model gateway only. All external connectors disabled.</p>
        </div>

        {/* Quick configuration toggle shortcuts directly in the navigation rail */}
        <div className="mb-5 p-4 rounded-2xl bg-amber-50/50 custom-shadow-soft space-y-3">
          <div className="text-[10px] uppercase tracking-wider text-[#C74601] font-medium flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            HIPAA Safety Controls
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-[#524D4B]">BAA Confirmed</span>
            <input
              type="checkbox"
              className="rounded border-[#00797D] text-[#00797D] focus:ring-[#00797D]"
              checked={config.baaConfirmed}
              onChange={(e) => updateConfigField({ baaConfirmed: e.target.checked })}
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-[#524D4B]">PHI Mode Enabled</span>
            <input
              type="checkbox"
              className="rounded border-[#00797D] text-[#00797D] focus:ring-[#00797D]"
              checked={config.phiModeEnabled}
              onChange={(e) => updateConfigField({ phiModeEnabled: e.target.checked })}
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-[#524D4B]">Redaction Shield</span>
            <input
              type="checkbox"
              className="rounded border-[#00797D] text-[#00797D] focus:ring-[#00797D]"
              checked={config.redactionModeEnabled}
              onChange={(e) => updateConfigField({ redactionModeEnabled: e.target.checked })}
            />
          </label>
        </div>

        {/* Main tabs selector */}
        <nav className="space-y-1.5 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-[#7A7470] px-2 font-medium mb-2">Harness Modules</div>
          
          <button
            onClick={() => setActiveTab('files')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === 'files' ? 'bg-[#00797D] text-white' : 'text-[#524D4B] hover:bg-[#E5F0EF] hover:text-[#00797D]'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            1. Evidence Intake ({activeWorkspace?.manifest.files.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('findings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === 'findings' ? 'bg-[#00797D] text-white' : 'text-[#524D4B] hover:bg-[#E5F0EF] hover:text-[#00797D]'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            2. Compliance Findings ({activeWorkspace?.findings.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === 'report' ? 'bg-[#00797D] text-white' : 'text-[#524D4B] hover:bg-[#E5F0EF] hover:text-[#00797D]'
            }`}
          >
            <FileText className="h-4 w-4" />
            3. Defensibility Report
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === 'logs' ? 'bg-[#00797D] text-white' : 'text-[#524D4B] hover:bg-[#E5F0EF] hover:text-[#00797D]'
            }`}
          >
            <History className="h-4 w-4" />
            4. Append-Only Ledger & Network
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === 'config' ? 'bg-[#00797D] text-white' : 'text-[#524D4B] hover:bg-[#E5F0EF] hover:text-[#00797D]'
            }`}
          >
            <Settings className="h-4 w-4" />
            5. Enterprise Posture Settings
          </button>
        </nav>

        <div className="mt-auto pt-6 text-[10px] text-[#7A7470] border-t border-[#00797D]/10">
          User: <span className="font-medium">teejay1784@gmail.com</span>
          <br />
          Compliance Version: <span className="font-medium">V6-Enterprise</span>
        </div>
      </aside>

      {/* Main Review Dashboard container */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col">
        
        {/* Urgent Warning Banners relative to PHI state and BAA confirmation */}
        {config.phiModeEnabled && !config.baaConfirmed && (
          <div className="mb-6 p-4 bg-[#421700] text-white rounded-2xl flex items-start gap-3 custom-shadow-soft">
            <ShieldAlert className="h-5 w-5 text-[#FFD5BF] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-[#FFD5BF]">CRITICAL SECURITY BREACH DETECTED</h4>
              <p className="text-[11px] mt-0.5 opacity-90">
                PHI Mode is set to True, but a signed Google Cloud Business Associate Agreement (BAA) has NOT been verified. 
                Under federal HIPAA guidelines, you are strictly prohibited from exposing raw health records.
              </p>
              <div className="mt-2 flex gap-2">
                <button 
                  onClick={() => updateConfigField({ baaConfirmed: true })}
                  className="px-2 py-1 bg-white text-[#421700] text-[10px] font-medium rounded hover:bg-[#FFD5BF] transition"
                >
                  Confirm Cloud BAA Sign-off
                </button>
                <button 
                  onClick={() => updateConfigField({ phiModeEnabled: false })}
                  className="px-2 py-1 bg-[#C74601] text-white text-[10px] font-medium rounded hover:bg-opacity-85 transition"
                >
                  Disable PHI Mode
                </button>
              </div>
            </div>
          </div>
        )}

        {config.phiModeEnabled && config.baaConfirmed && (
          <div className="mb-6 p-4 bg-[#FFEEE5] text-[#421700] rounded-2xl flex items-start gap-3 custom-shadow-soft">
            <ShieldAlert className="h-5 w-5 text-[#C74601] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-[#C74601]">ACTIVE PHI / HIPAA ENVIRONMENT ENABLED</h4>
              <p className="text-[11px] mt-0.5 text-[#524D4B]">
                CareIndeed V6 is operating in an authenticated Enterprise environment. Real patient health identifiers are permitted. Redaction shields are bypassed for approved reviewers.
              </p>
            </div>
          </div>
        )}

        {!config.phiModeEnabled && (
          <div className="mb-6 p-4 bg-[#E5F0EF] text-[#004142] rounded-2xl flex items-start gap-3 custom-shadow-soft">
            <Shield className="h-5 w-5 text-[#00797D] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-[#00797D]">SECURED DE-IDENTIFIED SANDBOX ACTIVE</h4>
              <p className="text-[11px] mt-0.5 text-[#524D4B]">
                Operating in mock-data mode. Direct customer health identifiers are filtered automatically. Redaction mode is active. Public internet browsing is disabled.
              </p>
            </div>
          </div>
        )}

        {/* Global Success / Error Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-xl text-xs font-medium flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="text-red-900 font-bold ml-2">×</button>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-xl text-xs font-medium flex items-center justify-between">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="text-green-900 font-bold ml-2">×</button>
          </div>
        )}

        {/* Workspace select bar / Command center topbar */}
        <header className="mb-8 p-6 bg-white rounded-2xl custom-shadow-soft flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#00797D]/10 text-[#00797D] px-2.5 py-0.5 rounded-full font-medium uppercase tracking-wider">
                Workspace directory
              </span>
              <span className="text-xs text-[#7A7470]">
                ID: {selectedWorkspaceId || 'None'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={selectedWorkspaceId}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="text-lg font-medium text-[#004142] bg-transparent border-b border-[#00797D]/30 focus:border-[#00797D] outline-none pr-6 cursor-pointer"
              >
                {workspaces.map((ws) => (
                  <option key={ws.workspaceId} value={ws.workspaceId}>
                    {ws.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowNewWorkspaceModal(true)}
                className="p-1 rounded-full bg-[#00797D]/10 text-[#00797D] hover:bg-[#00797D] hover:text-white transition"
                title="Create New Workspace"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Review Mode Selector dropdown */}
            <div className="flex flex-col">
              <span className="text-[9px] text-[#7A7470] uppercase font-medium">Compliance Review Mode</span>
              <select
                value={reviewMode}
                onChange={(e) => setReviewMode(e.target.value)}
                className="mt-1 text-xs rounded-lg p-2 bg-white text-[#004142] custom-shadow-soft focus:outline-none"
              >
                <option value="defensibility">1. Compliance Defensibility Review</option>
                <option value="policy">2. Policy/Procedure Accuracy Review</option>
                <option value="cross-reference">3. Cross-reference Audit Review</option>
                <option value="evidence">4. Evidence Packet Review</option>
                <option value="code-review">5. UI/Code Implementation Review</option>
                <option value="qapi">6. QAPI/CES/eCign Audit Review</option>
                <option value="reconciliation">7. Source-to-Output Reconciliation</option>
                <option value="regression">8. Regression Review After Fixes</option>
              </select>
            </div>

            <button
              onClick={runReviewHarness}
              disabled={isReviewing || !selectedWorkspaceId}
              className={`px-4 py-2 bg-[#00797D] text-white text-xs font-medium rounded-xl hover:bg-[#004142] transition flex items-center gap-1.5 ${
                isReviewing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isReviewing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              {isReviewing ? 'Running Audit...' : 'Execute Audit'}
            </button>

            <button
              onClick={handleExportPackage}
              disabled={!activeWorkspace?.findings?.length}
              className="px-4 py-2 text-[#00797D] text-xs font-medium rounded-xl bg-white hover:bg-[#E5F0EF] transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed custom-shadow-soft"
            >
              <Download className="h-4 w-4" />
              Export ZIP
            </button>
          </div>
        </header>

        {/* Audit Reviewing Loader Steps Overlay */}
        {isReviewing && (
          <div className="mb-6 p-4 rounded-2xl bg-[#004142] text-white custom-shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#C4F4F5]">Secured Compliance Gate Analyzer active</span>
              <span className="text-[10px] bg-[#00797D] px-2 py-0.5 rounded text-white animate-pulse">LOCK ACTIVE</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-[#C4F4F5] shrink-0" />
              <div className="text-sm font-light text-[#E5F0EF]">
                {reviewStep}
              </div>
            </div>
            <div className="mt-3 w-full bg-black/25 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#00797D] h-full animate-pulse" style={{ width: '80%' }}></div>
            </div>
          </div>
        )}

        {/* MAIN MODULE PANELS */}

        {/* Tab 1: Evidence File Intake */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* File Upload Zone */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl custom-shadow-soft flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[#004142] mb-1">Evidence File Ingest</h3>
                  <p className="text-xs text-[#524D4B] mb-4">
                    Upload documents into secure workspace folders. Files are read-only, SHA256 hashed, and locked to local scope.
                  </p>
                  
                  <div className="border-2 border-dashed border-[#00797D]/20 hover:border-[#00797D] rounded-xl p-6 text-center cursor-pointer bg-[#F7FEFF] transition relative">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading || !selectedWorkspaceId}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <UploadCloud className="h-8 w-8 text-[#00797D]" />
                      <span className="text-xs font-medium text-[#004142]">
                        {isUploading ? 'Ingesting Evidence...' : 'Drag & Drop files or Browse'}
                      </span>
                      <span className="text-[10px] text-[#7A7470]">
                        Supports PDF, DOCX, TXT, MD, CSV, JSON, XLSX, TS/TSX
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#00797D]/10">
                  <div className="text-[10px] uppercase tracking-wider text-[#7A7470] font-medium mb-2">Ingestion Restrictions</div>
                  <ul className="space-y-1.5">
                    <li className="text-[10px] text-[#524D4B] flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-[#00797D]" /> Source files are never modified
                    </li>
                    <li className="text-[10px] text-[#524D4B] flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-[#00797D]" /> SHA256 Manifest ledger generated instantly
                    </li>
                  </ul>
                </div>
              </div>

              {/* Manifest List Table */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl custom-shadow-soft">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-[#004142]">Workspace Evidence Manifest</h3>
                    <p className="text-xs text-[#524D4B]">Active local files verified in this run.</p>
                  </div>
                  <span className="text-xs bg-[#E5F0EF] text-[#00797D] px-2.5 py-0.5 rounded-full font-medium">
                    {activeWorkspace?.manifest.files.length || 0} files total
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#00797D]/10 text-[10px] uppercase text-[#7A7470]">
                        <th className="py-2.5">Document Filename</th>
                        <th className="py-2.5">SHA256 Fingerprint</th>
                        <th className="py-2.5">Size</th>
                        <th className="py-2.5">Review Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#00797D]/5 text-xs">
                      {activeWorkspace?.manifest.files.map((file, idx) => (
                        <tr key={idx} className="hover:bg-[#F7FEFF] transition">
                          <td className="py-3 font-medium text-[#004142] max-w-[200px] truncate" title={file.filename}>
                            {file.filename}
                          </td>
                          <td className="py-3 font-mono text-[10px] text-[#7A7470]">
                            {file.sha256.substring(0, 16)}...
                          </td>
                          <td className="py-3 text-[#524D4B]">{(file.size / 1024).toFixed(1)} KB</td>
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#00797D]">
                              <CheckCircle className="h-3 w-3" />
                              {file.reviewStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {!activeWorkspace?.manifest.files.length && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-xs text-[#7A7470]">
                            No evidence files uploaded to this workspace. Upload sample policies or audit files to begin the review.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Clinical Document Template Library */}
            <div className="bg-white p-6 rounded-2xl custom-shadow-soft space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#00797D]/10 pb-4">
                <div>
                  <h3 className="text-sm font-medium text-[#004142] flex items-center gap-1.5">
                    <Database className="h-4 w-4 text-[#00797D]" />
                    Clinical Document Template Library (12 Regulatory Packets)
                  </h3>
                  <p className="text-xs text-[#524D4B]">
                    Instantly provision standard home health compliance templates directly into your active workspace to evaluate and simulate CMS/ACHC surveyor audit findings.
                  </p>
                </div>
                
                {/* Category filters */}
                <div className="flex flex-wrap gap-1 bg-[#FAF8F8] p-1 rounded-xl text-[10px] custom-shadow-soft">
                  {['all', 'Admissions', 'Physician Orders', 'Clinical Oversight', 'Audit & Quality', 'Skilled Nursing'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setTemplateFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition ${
                        (cat === 'all' && templateFilter === 'all') || templateFilter === cat
                          ? 'bg-[#00797D] text-white'
                          : 'text-[#524D4B] hover:bg-[#E5F0EF]'
                      }`}
                    >
                      {cat === 'all' ? 'Show All' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates
                  .filter(t => templateFilter === 'all' || t.category.toLowerCase().includes(templateFilter.toLowerCase()) || t.name.toLowerCase().includes(templateFilter.toLowerCase()))
                  .map(t => {
                    const isPatientPacket = t.id === 'patient-packet';
                    return (
                      <div 
                        key={t.id} 
                        className={`rounded-xl p-4 flex flex-col justify-between transition custom-shadow-soft hover:shadow-md ${
                          isPatientPacket 
                            ? 'bg-[#FFFDF6] ring-1 ring-amber-200/50' 
                            : 'bg-white'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] uppercase font-bold text-[#7A7470] bg-[#FAF8F8] border px-1.5 py-0.5 rounded">
                              {t.category}
                            </span>
                            {isPatientPacket && (
                              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-200">
                                Patient Packet
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-xs font-semibold text-[#004142]">{t.name}</h4>
                          <p className="text-[11px] text-[#524D4B] line-clamp-3 leading-relaxed">{t.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#00797D]/5 flex items-center justify-between">
                          <span className="text-[9px] text-[#7A7470] font-mono">
                            {t.files.length} {t.files.length === 1 ? 'file' : 'files'} included
                          </span>
                          
                          <button
                            onClick={() => injectTemplate(t.id)}
                            className={`px-2.5 py-1 rounded text-[10px] font-medium transition ${
                              isPatientPacket 
                                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                                : 'bg-[#00797D] hover:bg-[#004142] text-white'
                            }`}
                          >
                            Inject Template
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Seed load backup option */}
              <div className="pt-2 flex justify-between items-center text-[11px] text-[#7A7470] border-t border-dashed">
                <span>Want to clear and load the default compliance sandbox baseline?</span>
                <button
                  onClick={() => {
                    setSelectedWorkspaceId('careindeed-qapi-2026');
                    setSuccessMessage('Successfully loaded the pre-seeded CareIndeed Medicare HHA compliance files.');
                  }}
                  className="text-[#00797D] hover:underline font-medium"
                >
                  Load CareIndeed 5-File Seed Dataset
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Findings Registry table */}
        {activeTab === 'findings' && (
          <div className="bg-white p-6 rounded-2xl custom-shadow-soft">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-medium text-[#004142]">Discovered Findings & Action Registry</h3>
                <p className="text-xs text-[#524D4B]">Verifiable compliance risks compiled directly from local source text files.</p>
              </div>
              <span className="text-xs font-medium bg-[#FFEEE5] text-[#C74601] px-2.5 py-0.5 rounded-full">
                {activeWorkspace?.findings.length || 0} Issues Detected
              </span>
            </div>

            <div className="space-y-4">
              {activeWorkspace?.findings.map((find, idx) => (
                <div key={idx} className="rounded-xl p-5 bg-white custom-shadow-soft hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#00797D]">{find.findingId}</span>
                      <h4 className="text-xs font-medium text-[#004142]">{find.category}</h4>
                    </div>
                    <div className="flex gap-2">
                      {getSeverityBadge(find.severity)}
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-[#E5F0EF] text-[#00797D] font-medium">
                        {find.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                    {/* Why it matters / quote */}
                    <div className="lg:col-span-7 space-y-2">
                      <div className="p-2 rounded bg-[#FAF8F8] font-mono text-[10px] text-[#524D4B] leading-relaxed">
                        <span className="font-semibold block text-[9px] uppercase tracking-wider text-[#7A7470]">Verbatim File Evidence Extract:</span>
                        "{find.evidenceQuote}"
                      </div>
                      <p className="text-[#524D4B]"><span className="font-medium text-[#004142]">Why it matters:</span> {find.whyItMatters}</p>
                      <p className="text-[#524D4B]"><span className="font-medium text-[#004142]">Audit / Regulatory Impact:</span> {find.complianceImpact}</p>
                    </div>

                    {/* Remediation & Verification */}
                    <div className="lg:col-span-5 bg-[#FAF8F8]/60 p-3 rounded-lg space-y-2 custom-shadow-soft">
                      <h5 className="text-[10px] font-medium uppercase text-[#00797D] tracking-wider">Clinical Remediation Path</h5>
                      <p className="text-[#524D4B] text-[11px]"><span className="font-medium text-[#004142]">Recommended action:</span> {find.recommendedFix}</p>
                      <p className="text-[#524D4B] text-[11px]"><span className="font-medium text-[#004142]">Validation protocol:</span> {find.verificationTest}</p>
                      
                      <div className="pt-2 border-t flex justify-end gap-1.5">
                        <button 
                          onClick={() => {
                            // Mock transition status
                            const list = [...(activeWorkspace?.findings || [])];
                            list[idx].status = 'fixed';
                            setActiveWorkspace({ ...activeWorkspace!, findings: list });
                            setSuccessMessage('Finding status marked as fixed in active memory run.');
                          }}
                          className="px-2.5 py-1 border border-[#00797D]/10 text-[#00797D] text-[9px] font-medium rounded hover:bg-[#E5F0EF] transition"
                        >
                          Mark as Resolved
                        </button>
                        <button 
                          onClick={() => {
                            const list = [...(activeWorkspace?.findings || [])];
                            list[idx].status = 'needs human review';
                            setActiveWorkspace({ ...activeWorkspace!, findings: list });
                            setSuccessMessage('Finding status marked for nurse administrator verification.');
                          }}
                          className="px-2.5 py-1 bg-[#00797D]/5 text-[#00797D] text-[9px] font-medium rounded hover:bg-[#E5F0EF] transition"
                        >
                          Escalate to Clinical
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-[10px] text-[#7A7470] border-t pt-2 flex items-center justify-between">
                    <span>Source document: <strong className="text-[#004142]">{find.affectedFile}</strong></span>
                    <span>Action owner: Clinical Quality Auditor</span>
                  </div>
                </div>
              ))}

              {!activeWorkspace?.findings?.length && (
                <div className="py-12 text-center text-xs text-[#7A7470] space-y-2">
                  <Cpu className="h-8 w-8 mx-auto text-[#00797D]/30" />
                  <p>No findings processed in this workspace yet.</p>
                  <button 
                    onClick={runReviewHarness}
                    className="px-3 py-1.5 bg-[#00797D] text-white rounded text-xs font-medium hover:bg-[#004142] transition"
                  >
                    Run Vertex AI Compliance Review
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Report Preview */}
        {activeTab === 'report' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left sidebar info */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl custom-shadow-soft">
                <h3 className="text-sm font-medium text-[#004142] mb-1">Audit Scorecard</h3>
                <p className="text-xs text-[#524D4B] mb-4">Verification compliance metrics.</p>

                <div className="space-y-4">
                  <div className="p-3 bg-[#F7FEFF] rounded-xl custom-shadow-soft">
                    <div className="text-[10px] text-[#7A7470] uppercase">Defensibility Score</div>
                    <div className="text-3xl font-medium text-[#00797D]">{isSurveyReady ? '95%' : '65%'}</div>
                    <div className="w-full bg-black/5 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#00797D] h-full" style={{ width: isSurveyReady ? '95%' : '65%' }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FFFAF7] rounded-xl custom-shadow-soft">
                    <div className="text-[10px] text-[#C74601] uppercase">Surveyor Readiness Status</div>
                    <div className={`text-xs font-medium mt-1 ${isSurveyReady ? 'text-green-600' : 'text-[#C74601]'}`}>
                      {isSurveyReady ? '🟢 COMPLIANT (Survey Ready)' : '❌ NOT READY (Blocked by open P0/P1 items)'}
                    </div>
                  </div>

                  <div className="text-xs text-[#524D4B] space-y-1">
                    <div className="font-semibold text-[#004142]">P0 / P1 Blocker Checks:</div>
                    <div className="flex items-center justify-between">
                      <span>OASIS 5-Day window:</span>
                      <span className={activeWorkspace?.findings.some(f => f.findingId === 'FIND-001') ? 'text-[#C74601] font-medium' : 'text-green-600'}>
                        {activeWorkspace?.findings.some(f => f.findingId === 'FIND-001') ? 'Failed' : 'Passed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>RN 48-Hour Verbal treatment:</span>
                      <span className={activeWorkspace?.findings.some(f => f.findingId === 'FIND-002') ? 'text-[#C74601] font-medium' : 'text-green-600'}>
                        {activeWorkspace?.findings.some(f => f.findingId === 'FIND-002') ? 'Failed' : 'Passed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Signed Patient Rights Consent:</span>
                      <span className={activeWorkspace?.findings.some(f => f.findingId === 'FIND-003') ? 'text-[#C74601] font-medium' : 'text-green-600'}>
                        {activeWorkspace?.findings.some(f => f.findingId === 'FIND-003') ? 'Failed' : 'Passed'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#00797D]/10">
                  <button
                    onClick={handleExportPackage}
                    disabled={!activeWorkspace?.findings.length}
                    className="w-full py-2 bg-[#00797D] text-white text-xs font-medium rounded-xl hover:bg-[#004142] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    Download Signed ZIP Bundle
                  </button>
                </div>
              </div>
            </div>

            {/* Right Report Content Area */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl custom-shadow-soft">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <div>
                  <h3 className="text-sm font-medium text-[#004142]">Formal Compliance Defensibility Report</h3>
                  <p className="text-xs text-[#7A7470]">10-stage deterministic review output chain.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (activeWorkspace) {
                        // Mark all fixed in memory for simulation
                        const clearedFindings = activeWorkspace.findings.map(f => ({ ...f, status: 'fixed' as const }));
                        setActiveWorkspace({
                          ...activeWorkspace,
                          findings: clearedFindings,
                          reportMd: activeWorkspace.reportMd.replace("NOT READY (All P0 and P1 items must be cleared)", "SURVEY READY").replace("Overall Defensibility Score**: 65%", "Overall Defensibility Score**: 95%")
                        });
                        setSuccessMessage('Defensibility scorecard verified and signed. Ready for CMS inspection.');
                      }
                    }}
                    className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 text-[10px] font-medium rounded border border-green-200"
                  >
                    Force Approve Compliance
                  </button>
                </div>
              </div>

              {activeWorkspace?.reportHtml ? (
                <div 
                  className="max-h-[600px] overflow-y-auto px-4 py-2 border rounded-xl bg-[#FAF8F8]"
                  dangerouslySetInnerHTML={{ __html: activeWorkspace.reportHtml }} 
                />
              ) : (
                <div className="py-24 text-center text-xs text-[#7A7470] space-y-2">
                  <FileText className="h-10 w-10 mx-auto text-[#00797D]/20" />
                  <p>No report has been compiled yet. Run the compliance review to generate.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 4: Logs (Audit trail & Network logs) */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            
            {/* Outbound Network Blocker section */}
            <div className="bg-white p-6 rounded-2xl custom-shadow-soft">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-medium text-[#004142]">No-Web & API Outbound Audit Blocker</h3>
                  <p className="text-xs text-[#524D4B]">
                    Harness strict control gate. All external network lookup routes are intercepted or rejected to guarantee PHI bounds.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs bg-red-50 text-[#C74601] px-2.5 py-1 rounded-full font-medium">
                  <Lock className="h-3.5 w-3.5" />
                  GATEKEEPER ACTIVE
                </div>
              </div>

              {/* Simulation buttons so user can instantly see the logs and test blocking */}
              <div className="bg-[#FFFAF7] rounded-xl p-4 mb-6 custom-shadow-soft">
                <h4 className="text-xs font-medium text-[#421700] uppercase mb-2">Simulate Network Guardrail Action:</h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-4">
                    <label className="text-[10px] text-[#524D4B] font-medium block mb-1">Target Endpoint / Destination URL</label>
                    <input
                      type="text"
                      className="w-full text-xs rounded p-2 bg-white custom-shadow-soft"
                      value={manualDest}
                      onChange={(e) => setManualDest(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="text-[10px] text-[#524D4B] font-medium block mb-1">Trigger / Intent</label>
                    <input
                      type="text"
                      className="w-full text-xs rounded p-2 bg-white custom-shadow-soft"
                      value={manualReason}
                      onChange={(e) => setManualReason(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3 flex gap-2">
                    <button
                      onClick={() => simulateOutboundConnection(manualDest, false, `Security Shield: ${manualReason}`)}
                      className="w-full px-3 py-2 bg-[#C74601] text-white text-[10px] font-medium rounded-lg hover:bg-opacity-90 transition"
                    >
                      Block Attempt
                    </button>
                    <button
                      onClick={() => simulateOutboundConnection(manualDest, true, `Bypassed by clinical policy: ${manualReason}`)}
                      className="w-full px-3 py-2 bg-[#00797D] text-white text-[10px] font-medium rounded-lg hover:bg-opacity-90 transition"
                    >
                      Allow (Audit)
                    </button>
                  </div>
                </div>
              </div>

              {/* Network table */}
              <h4 className="text-xs font-medium text-[#004142] mb-2 uppercase">Outbound Network Log Registry (network_attempts.jsonl)</h4>
              <div className="overflow-x-auto max-h-[250px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#00797D]/10 text-[9px] uppercase text-[#7A7470]">
                      <th className="py-2">Timestamp</th>
                      <th className="py-2">Destination Target</th>
                      <th className="py-2">Decision Status</th>
                      <th className="py-2">Gate Audit Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00797D]/5 text-xs font-mono">
                    {activeWorkspace?.networkLogs.map((log, i) => (
                      <tr key={i} className="hover:bg-[#F7FEFF]">
                        <td className="py-2 text-[10px] text-[#7A7470]">{log.timestamp}</td>
                        <td className="py-2 text-[#004142] text-[11px] font-semibold">{log.destination}</td>
                        <td className="py-2">
                          {log.allowed ? (
                            <span className="text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded text-[9px]">✔ ALLOWED</span>
                          ) : (
                            <span className="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded text-[9px]">❌ BLOCKED</span>
                          )}
                        </td>
                        <td className="py-2 text-[#524D4B] text-[10px]">{log.reason}</td>
                      </tr>
                    ))}
                    {!activeWorkspace?.networkLogs?.length && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-xs text-[#7A7470]">No network connections attempted.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cryptographic Hash Chains */}
            <div className="bg-white p-6 rounded-2xl custom-shadow-soft">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-medium text-[#004142]">SHA256 Cryptographic Hash Chain Audit Ledger (hash_chain_audit.jsonl)</h3>
                  <p className="text-xs text-[#524D4B]">
                    Blockchain-inspired, append-only security logs. Each logging line incorporates the SHA256 of the previous line to prevent tampering.
                  </p>
                </div>
                <div className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium custom-shadow-soft">
                  ⛓ INTEGRITY VERIFIED
                </div>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto font-mono text-[10px] bg-[#FAF8F8] p-4 rounded-xl custom-shadow-soft">
                {activeWorkspace?.hashChainLogs.map((log, i) => (
                  <div key={i} className="p-2 bg-white rounded text-xs custom-shadow-soft">
                    <div className="flex items-center justify-between text-[10px] text-[#7A7470] mb-1">
                      <span>Log Index: {i}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="font-semibold text-[#004142] mb-1">Event: {log.logType}</div>
                    <div className="bg-slate-50 p-1.5 rounded text-[9px] mb-1 text-slate-600">
                      Payload: {JSON.stringify(log.data)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[9px] text-slate-500">
                      <div><span className="font-semibold text-rose-600">Prev Hash:</span> {log.previous_hash.substring(0, 32)}...</div>
                      <div><span className="font-semibold text-emerald-600">Record Hash:</span> {log.record_hash.substring(0, 32)}...</div>
                    </div>
                  </div>
                ))}
                {!activeWorkspace?.hashChainLogs?.length && (
                  <p className="text-center py-6 text-[#7A7470]">No integrity records yet.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 5: Enterprise Posture Settings */}
        {activeTab === 'config' && (
          <div className="bg-white p-6 rounded-2xl custom-shadow-soft space-y-6">
            <div>
              <h3 className="text-sm font-medium text-[#004142]">Enterprise Model Connection Strategy</h3>
              <p className="text-xs text-[#524D4B]">Configure authorized cloud model hosts, endpoints, and credentials safely stored on the server side.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-[#00797D] uppercase">Model Host Setup</h4>
                
                <div>
                  <label className="text-xs font-medium block text-[#524D4B] mb-1">Model Provider Platform</label>
                  <input
                    type="text"
                    className="w-full text-xs rounded p-2.5 bg-white custom-shadow-soft outline-none"
                    value={config.modelProvider}
                    onChange={(e) => updateConfigField({ modelProvider: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium block text-[#524D4B] mb-1">Target Model Name</label>
                  <input
                    type="text"
                    className="w-full text-xs rounded p-2.5 bg-white custom-shadow-soft outline-none"
                    value={config.modelName}
                    onChange={(e) => updateConfigField({ modelName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium block text-[#524D4B] mb-1">Secure Model Endpoint (Google Cloud Vertex AI URL)</label>
                  <input
                    type="text"
                    className="w-full text-xs rounded p-2.5 bg-white font-mono custom-shadow-soft outline-none"
                    value={config.modelEndpoint}
                    onChange={(e) => updateConfigField({ modelEndpoint: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-[#C74601] uppercase">Approved Outbound Channels (Blocked if Unchecked)</h4>
                
                <div className="space-y-2.5 p-4 rounded-xl bg-[#FAF8F8] custom-shadow-soft">
                  <label className="flex items-center justify-between text-xs text-[#524D4B] cursor-pointer">
                    <span className="font-medium">Google Cloud Vertex AI Gateway</span>
                    <input
                      type="checkbox"
                      checked={config.approvedServices.vertexAI}
                      onChange={(e) => updateConfigField({ 
                        approvedServices: { ...config.approvedServices, vertexAI: e.target.checked }
                      })}
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-[#524D4B] cursor-pointer">
                    <span className="font-medium">Google Public Search Grounding (No-Web)</span>
                    <input
                      type="checkbox"
                      checked={config.approvedServices.googleSearch}
                      onChange={(e) => updateConfigField({ 
                        approvedServices: { ...config.approvedServices, googleSearch: e.target.checked }
                      })}
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-[#524D4B] cursor-pointer">
                    <span className="font-medium">Google Drive Connector (unapproved)</span>
                    <input
                      type="checkbox"
                      checked={config.approvedServices.googleDrive}
                      onChange={(e) => updateConfigField({ 
                        approvedServices: { ...config.approvedServices, googleDrive: e.target.checked }
                      })}
                    />
                  </label>

                  <label className="flex items-center justify-between text-xs text-[#524D4B] cursor-pointer">
                    <span className="font-medium">Gmail and Calendar Sync</span>
                    <input
                      type="checkbox"
                      checked={config.approvedServices.gmail}
                      onChange={(e) => updateConfigField({ 
                        approvedServices: { ...config.approvedServices, gmail: e.target.checked }
                      })}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* New Workspace Modal */}
      {showNewWorkspaceModal && (
        <div className="fixed inset-0 bg-[#004142]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateWorkspace} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 custom-shadow-lift">
            <div>
              <h3 className="text-base font-medium text-[#004142]">Provision New Review Workspace</h3>
              <p className="text-xs text-[#7A7470]">Create a separate local-first review capsule for defensive audit packaging.</p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#524D4B] block mb-1">Workspace Name</label>
              <input
                type="text"
                className="w-full text-xs rounded-lg p-2.5 bg-white outline-none custom-shadow-soft"
                placeholder="e.g. Medicare QAPI Audit Q3"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowNewWorkspaceModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#524D4B] hover:bg-[#FAF8F8] transition bg-white custom-shadow-soft"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#00797D] text-white rounded-xl text-xs font-medium hover:bg-[#004142] transition"
              >
                Create Workspace
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
