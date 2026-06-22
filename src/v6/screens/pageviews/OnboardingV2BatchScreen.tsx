import { useState } from 'react';
import { Shield, Key, Heart, Award, FileSearch, ShieldCheck, Download, Check, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { DataTable, ProgressMeter, SurfaceCard, type DataTableColumn } from '../../components';
import { ToneBadge, Button } from '../../primitives';
import { cx } from '../../utils/classNames';

interface RosterRow extends Record<string, string> {
  subjectId: string;
  name: string;
  role: string;
  gate1: string;
  gate2: string;
  gate3: string;
  gate4: string;
  gate5: string;
}

const columns: readonly DataTableColumn<RosterRow>[] = [
  { key: 'subjectId', label: 'Subject ID' },
  { key: 'name', label: 'Subject Name' },
  { key: 'role', label: 'Role' },
  { key: 'gate1', label: 'Background', status: true },
  { key: 'gate2', label: 'Credentials', status: true },
  { key: 'gate3', label: 'Health', status: true },
  { key: 'gate4', label: 'Training', status: true },
  { key: 'gate5', label: 'Supervised', status: true },
];

const rows: readonly RosterRow[] = [
  { subjectId: 'SUB-2001', name: 'James Carter', role: 'RN Case Manager', gate1: 'validated', gate2: 'pending', gate3: 'locked', gate4: 'complete', gate5: 'locked' },
  { subjectId: 'SUB-2002', name: 'Sophia Martinez', gate1: 'validated', gate2: 'validated', gate3: 'passed', gate4: 'complete', gate5: 'signed', role: 'Home Health Aide' },
  { subjectId: 'SUB-2003', name: 'Liam O\'Connor', gate1: 'validated', gate2: 'pending', gate3: 'locked', gate4: 'complete', gate5: 'locked', role: 'Physical Therapist' },
];

const timelineEvents = [
  { label: 'Batch initialized', value: '2026-06-01 08:00 UTC', detail: 'System generated trigger event' },
  { label: 'Subject record created', value: '2026-06-01 08:05 UTC', detail: 'Initial hash-chain anchor set' },
  { label: 'Background sweep complete', value: '2026-06-02 14:30 UTC', detail: 'Identity & criminal checks validated' },
  { label: 'Override request logged', value: '2026-06-19 11:22 UTC', detail: 'Licensure verification request' },
] as const;

interface ChecklistItem {
  id: string;
  name: string;
  status: 'PASS' | 'PENDING' | 'MISSING' | 'LOCKED';
  notes: string;
}

const gateChecklists: Record<string, { title: string; items: ChecklistItem[] }> = {
  'Background': {
    title: 'Background & Screening Checklist',
    items: [
      { id: 'BG-01', name: 'SSN Trace & Identity Verification', status: 'PASS', notes: 'SSN verified on 2026-06-01' },
      { id: 'BG-02', name: 'National Criminal Database Sweep', status: 'PASS', notes: 'No records found' },
      { id: 'BG-03', name: 'OIG exclusion list check', status: 'PASS', notes: 'Clearance confirmed' }
    ]
  },
  'Credentials': {
    title: 'Credentials & Licensing Checklist',
    items: [
      { id: 'CR-01', name: 'Primary Source Licensing Verification', status: 'PENDING', notes: 'Awaiting board registry return' },
      { id: 'CR-02', name: 'Professional References Checked', status: 'PASS', notes: 'Two references verified' },
      { id: 'CR-03', name: 'OIG & SAM Registry Exclusions', status: 'PASS', notes: 'Verified active and in good standing' }
    ]
  },
  'Health Safety': {
    title: 'Health & Safety Clearances',
    items: [
      { id: 'HS-01', name: 'TB Test Clearance (PPD/Quantiferon)', status: 'MISSING', notes: 'Pending clinical reading' },
      { id: 'HS-02', name: '10-Panel Drug Screening', status: 'PASS', notes: 'Clearance validated' },
      { id: 'HS-03', name: 'Immunization Records (Hep B, MMR, Varicella)', status: 'PENDING', notes: 'Awaiting booster proof' }
    ]
  },
  'Training': {
    title: 'Core Orientation Syllabus Checklist',
    items: [
      { id: 'TR-01', name: 'Core Orientation Syllabus Modules', status: 'PASS', notes: 'All 12 modules finished' },
      { id: 'TR-02', name: 'eCIgn Attestation Forms', status: 'PASS', notes: 'Signed and anchored' },
      { id: 'TR-03', name: 'Supervisor Competency Signoff', status: 'PASS', notes: 'Preceptor checklist completed' }
    ]
  },
  'Supervised': {
    title: 'Supervised Field Visit Checklist',
    items: [
      { id: 'SV-01', name: 'Field preceptor evaluation form', status: 'LOCKED', notes: 'Awaiting credentialing clearance' },
      { id: 'SV-02', name: 'Direct patient care demonstration checklist', status: 'LOCKED', notes: 'Awaiting syllabus completion' }
    ]
  }
};

interface SubjectEvidence {
  fileName: string;
  uploadTime: string;
  shaHash: string;
  status: string;
  signatures: { role: string; name: string; date: string; token: string }[];
}

const subjectEvidenceData: Record<string, SubjectEvidence> = {
  'SUB-2001': {
    fileName: 'rn_credentials_evidence_pack.pdf',
    uploadTime: '2026-06-19 14:32 UTC',
    shaHash: 'd3f2a1b9e0c84147afbf4c8996fb92427ae41e4649b934ca495991b7852b855a',
    status: 'pending',
    signatures: [
      { role: 'Learner', name: 'James Carter', date: '2026-06-19 11:22 UTC', token: 'eCIgn-Audit-4c8996f' },
      { role: 'Preceptor', name: 'Dr. Elena Navarro, RN', date: '2026-06-19 14:30 UTC', token: 'eCIgn-Audit-22b881a' },
      { role: 'Director', name: 'Awaiting HR Director', date: 'Pending', token: 'Awaiting Signoff' }
    ]
  },
  'SUB-2002': {
    fileName: 'hha_onboarding_verified_completed.pdf',
    uploadTime: '2026-06-18 10:15 UTC',
    shaHash: '9a8b7c6d5e4f3210afbf4c8996fb92427ae41e4649b934ca495991b7852b855b',
    status: 'validated',
    signatures: [
      { role: 'Learner', name: 'Sophia Martinez', date: '2026-06-18 09:12 UTC', token: 'eCIgn-Audit-11a22b3' },
      { role: 'Preceptor', name: 'Dr. Elena Navarro, RN', date: '2026-06-18 10:00 UTC', token: 'eCIgn-Audit-77c88d9' },
      { role: 'Director', name: 'Marcus Vance, HR Dir', date: '2026-06-18 10:15 UTC', token: 'eCIgn-Audit-55f66e2' }
    ]
  },
  'SUB-2003': {
    fileName: 'pt_license_reconciliation_draft.pdf',
    uploadTime: '2026-06-20 16:45 UTC',
    shaHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855c',
    status: 'pending',
    signatures: [
      { role: 'Learner', name: 'Liam O\'Connor', date: '2026-06-20 15:00 UTC', token: 'eCIgn-Audit-99d88b4' },
      { role: 'Preceptor', name: 'Dr. Elena Navarro, RN', date: 'Pending', token: 'Awaiting Signoff' },
      { role: 'Director', name: 'Awaiting HR Director', date: 'Pending', token: 'Awaiting Signoff' }
    ]
  }
};

export function OnboardingV2BatchScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'roster'>('overview');
  const [selectedGate, setSelectedGate] = useState<string | null>('Credentials');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>('SUB-2001');
  const [activeSubTab, setActiveSubTab] = useState<'evidence' | 'signature'>('evidence');
  const [hashVerified, setHashVerified] = useState<Record<string, boolean>>({});

  const checklistData = selectedGate ? gateChecklists[selectedGate] : null;
  const selectedSubject = rows.find(r => r.subjectId === selectedSubjectId);
  const evidenceDetails = selectedSubjectId ? subjectEvidenceData[selectedSubjectId] : null;

  const handleVerifyHash = (subjectId: string) => {
    setHashVerified(prev => ({ ...prev, [subjectId]: true }));
  };

  const handleRowClick = (row: RosterRow) => {
    setSelectedSubjectId(row.subjectId);
    setActiveSubTab('evidence');
  };

  return (
    <section
      className="grid gap-lg"
      data-group="Onboarding v2"
      data-hash-id="onboarding-v2-batch"
      data-route="/onboarding-v2/batches/:batchId"
      data-template="detail"
    >
      {/* Tab Control */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div className="inline-flex max-w-full flex-wrap rounded-lg bg-tone-slate-bg p-xs">
          {[
            { id: 'overview', label: 'Gate Overview' },
            { id: 'roster', label: 'Subjects & Evidence' },
          ].map((tab) => (
            <button
              className={cx(
                'min-h-tap rounded-md px-md text-sm transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                activeTab === tab.id
                  ? 'bg-surface text-brand-teal shadow-rest'
                  : 'text-secondary hover:bg-surface-hover',
              )}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'roster')}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' ? (
        <section className="grid gap-lg desktop:grid-cols-[minmax(0,2.2fr)_minmax(280px,0.8fr)]">
          {/* Left Column: Gates & checklist */}
          <div className="grid content-start gap-md">
            <section className="grid gap-md tablet-p:grid-cols-2 tablet-l:grid-cols-5">
              {[
                { key: 'Background', icon: Shield, label: 'Background', status: 'validated' },
                { key: 'Credentials', icon: Key, label: 'Credentials', status: 'pending' },
                { key: 'Health Safety', icon: Heart, label: 'Health Safety', status: 'review-required' },
                { key: 'Training', icon: Award, label: 'Training', status: 'complete' },
                { key: 'Supervised', icon: FileSearch, label: 'Supervised', status: 'locked' },
              ].map((gate) => {
                const Icon = gate.icon;
                const isSelected = selectedGate === gate.key;
                return (
                  <button
                    onClick={() => setSelectedGate(selectedGate === gate.key ? null : gate.key)}
                    className={cx(
                      'flex flex-col items-center gap-xs rounded-lg border p-sm text-center shadow-rest transition duration-fast hover:border-brand-teal/40 hover:bg-surface-hover',
                      isSelected ? 'border-brand-teal bg-surface-hover ring-1 ring-brand-teal/30' : 'border-card bg-surface'
                    )}
                    key={gate.label}
                    type="button"
                  >
                    <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-slate-bg text-brand-teal mb-sm">
                      <Icon aria-hidden="true" className="h-icon-md w-icon-md" />
                    </span>
                    <span className="text-sm font-medium text-ink">{gate.label}</span>
                    <ToneBadge size="sm" status={gate.status} />
                  </button>
                );
              })}
            </section>

            {/* Gate Checklist Expander Panel */}
            {selectedGate && checklistData && (
              <section className="mt-md rounded-lg border border-tone-teal-border bg-surface p-lg shadow-rest transition duration-normal">
                <div className="mb-md flex items-center justify-between border-b border-hairline pb-sm">
                  <div>
                    <h3 className="text-h3 font-medium text-ink">{checklistData.title}</h3>
                    <p className="text-xs text-secondary mt-xs">Detailed criteria status check and auditor notes.</p>
                  </div>
                  <button
                    onClick={() => setSelectedGate(null)}
                    className="text-xs font-medium text-brand-teal hover:underline"
                    type="button"
                  >
                    Collapse Expander
                  </button>
                </div>
                <div className="grid gap-sm">
                  {checklistData.items.map((item) => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-md rounded-md border border-hairline bg-tone-slate-bg p-sm">
                      <div className="flex items-start gap-md">
                        <span className={cx(
                          'grid h-6 w-6 place-items-center rounded-full mt-xs',
                          item.status === 'PASS' && 'bg-tone-green-bg text-tone-green-text',
                          item.status === 'PENDING' && 'bg-tone-amber-bg text-tone-amber-text',
                          item.status === 'MISSING' && 'bg-tone-orange-bg text-tone-orange-text',
                          item.status === 'LOCKED' && 'bg-tone-slate-bg text-muted'
                        )}>
                          {item.status === 'PASS' && <Check className="h-4 w-4" />}
                          {item.status === 'PENDING' && <AlertTriangle className="h-4 w-4" />}
                          {item.status === 'MISSING' && <AlertTriangle className="h-4 w-4" />}
                          {item.status === 'LOCKED' && <FileSearch className="h-4 w-4" />}
                        </span>
                        <div>
                          <h4 className="text-sm font-medium text-ink">{item.name}</h4>
                          <p className="text-xs text-secondary mt-xs">{item.notes}</p>
                        </div>
                      </div>
                      <div>
                        <ToneBadge size="sm" status={
                          item.status === 'PASS' ? 'validated' :
                          item.status === 'PENDING' ? 'pending' :
                          item.status === 'MISSING' ? 'review-required' :
                          'locked'
                        } />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Progress & timeline */}
          <aside className="grid content-start gap-md">
            <SurfaceCard
              card={{
                body: 'Overall batch progress calculated across active subjects and cleared gates.',
                icon: ShieldCheck,
                progress: 68,
                status: 'active',
                title: 'Batch Progress Meter',
                tone: 'teal',
              }}
            >
              <ProgressMeter label="Batch clearance completion" tone="teal" value={68} />
            </SurfaceCard>

            <section className="rounded-lg border border-card bg-surface p-lg shadow-rest">
              <h3 className="text-h3 font-medium text-ink mb-md">Hash-Chain Timeline</h3>
              <div className="grid gap-sm">
                {timelineEvents.map((event) => (
                  <div className="border-l-2 border-hairline pl-md relative" key={event.label}>
                    <span className="absolute -left-[5px] top-xs h-[8px] w-[8px] rounded-full bg-brand-teal" />
                    <p className="text-xs text-brand-orange font-mono">{event.value}</p>
                    <p className="text-sm font-medium text-ink mt-xs">{event.label}</p>
                    <p className="text-xs text-muted mt-xs">{event.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      ) : (
        <section className="grid gap-lg">
          <div className="grid content-start gap-md">
            <section className="rounded-lg border border-card bg-surface p-lg shadow-rest">
              <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                <div>
                  <h3 className="text-h3 font-medium text-ink">Batch Subjects Roster</h3>
                  <p className="mt-xs text-sm text-muted">Detailed view of subjects in the batch and their gate positions. Click a subject row to inspect evidence logs.</p>
                </div>
              </div>
              <DataTable 
                columns={columns} 
                label="Batch subjects table" 
                rows={rows} 
                onRowClick={handleRowClick}
              />
            </section>

            {/* Evidence / Signature Log */}
            {selectedSubject && evidenceDetails && (
              <section className="mt-md rounded-lg border border-card bg-surface p-lg shadow-rest transition duration-normal">
                <div className="mb-md flex flex-wrap items-start justify-between gap-md border-b border-hairline pb-sm">
                  <div>
                    <div className="flex items-center gap-sm">
                      <h3 className="text-h3 font-medium text-ink">{selectedSubject.name}</h3>
                      <span className="text-xs text-muted font-mono">{selectedSubject.subjectId}</span>
                    </div>
                    <p className="text-xs text-secondary mt-xs">Role: {selectedSubject.role}</p>
                  </div>
                  <div className="inline-flex rounded-lg bg-tone-slate-bg p-xs">
                    {[
                      { id: 'evidence', label: 'Evidence File' },
                      { id: 'signature', label: 'Signature Log' },
                    ].map((tab) => (
                      <button
                        className={cx(
                        'min-h-tap rounded-md px-md text-sm transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                          activeSubTab === tab.id 
                            ? 'bg-surface text-brand-teal shadow-rest' 
                            : 'text-secondary hover:bg-surface-hover',
                        )}
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id as 'evidence' | 'signature')}
                        type="button"
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeSubTab === 'evidence' ? (
                  <div className="grid gap-md text-sm">
                    <div className="grid gap-md desktop:grid-cols-2">
                      <div className="grid gap-xs rounded-md bg-tone-slate-bg p-md border border-hairline">
                        <div className="flex items-center gap-sm text-brand-teal">
                          <FileText className="h-icon-sm w-icon-sm" />
                          <span className="font-medium text-ink">Document Details</span>
                        </div>
                        <div className="grid gap-xs mt-sm text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted">File Name:</span>
                            <span className="text-secondary font-mono">{evidenceDetails.fileName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Uploaded At:</span>
                            <span className="text-secondary">{evidenceDetails.uploadTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Status:</span>
                            <span className="text-secondary">
                              <ToneBadge size="sm" status={evidenceDetails.status} />
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-xs rounded-md bg-tone-slate-bg p-md border border-hairline">
                        <div className="flex items-center gap-sm text-brand-teal">
                          <ShieldCheck className="h-icon-sm w-icon-sm" />
                          <span className="font-medium text-ink">Hash Integrity (SHA-256)</span>
                        </div>
                        <div className="mt-sm grid gap-sm">
                          <div className="text-[11px] font-mono bg-surface p-sm rounded border border-hairline break-all text-secondary">
                            {evidenceDetails.shaHash}
                          </div>
                          {selectedSubjectId && hashVerified[selectedSubjectId] ? (
                            <div className="flex items-center gap-xs text-xs text-tone-green-text font-medium bg-tone-green-bg p-xs rounded border border-tone-green-border">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>SHA-256 Signature verified against preceptor ledger anchor.</span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => selectedSubjectId && handleVerifyHash(selectedSubjectId)}
                              size="sm"
                              variant="secondary"
                              className="w-full"
                            >
                              Verify Integrity Hash
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-sm flex justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        iconLeft={<Download className="h-4 w-4" />}
                      >
                        Download Source PDF
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-md text-sm">
                    <div className="rounded-md bg-tone-slate-bg p-md border border-hairline mb-sm flex justify-between items-center">
                      <span className="text-xs font-medium text-secondary">eCIgn Audit Token:</span>
                      <span className="text-xs font-mono font-medium text-brand-teal-deep bg-surface px-sm py-xs rounded border border-hairline">
                        eCIgn-Audit-4c8996f
                      </span>
                    </div>
                    <div className="grid gap-lg relative pl-md border-l border-hairline">
                      {evidenceDetails.signatures.map((sig) => (
                        <div key={sig.role} className="relative">
                          <span className={cx(
                            'absolute -left-[21px] top-xs h-[10px] w-[10px] rounded-full border-2',
                            sig.date === 'Pending' ? 'bg-surface border-text-disabled' : 'bg-brand-teal border-brand-teal'
                          )} />
                          <div className="grid gap-xs">
                            <div className="flex items-center gap-sm">
                              <span className="text-xs font-medium text-brand-orange uppercase tracking-wider">{sig.role}</span>
                              {sig.date !== 'Pending' ? (
                                <span className="text-xs text-tone-green-text font-medium bg-tone-green-bg px-sm rounded">Signed</span>
                              ) : (
                                <span className="text-xs text-tone-amber-text font-medium bg-tone-amber-bg px-sm rounded">Awaiting</span>
                              )}
                            </div>
                            <h4 className="text-sm font-medium text-ink">{sig.name}</h4>
                            <div className="flex flex-wrap gap-md text-xs text-muted mt-xs">
                              <span>Date: {sig.date}</span>
                              {sig.date !== 'Pending' && (
                                <span>Token: <span className="font-mono">{sig.token}</span></span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        </section>
      )}
    </section>
  );
}

export default OnboardingV2BatchScreen;
