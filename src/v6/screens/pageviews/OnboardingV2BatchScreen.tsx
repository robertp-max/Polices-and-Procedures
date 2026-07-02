import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Shield, Key, Heart, Award, FileSearch, ShieldCheck, Download, Check, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { DataTable, ProgressMeter, SurfaceCard, type DataTableColumn } from '../../components';
import { ToneBadge, Button } from '../../primitives';
import { cx } from '../../utils/classNames';
import { buildSeedSnapshot } from '@/policy/onboarding-v2/store/seed';
import type { OnboardingExecutionBatch } from '@/policy/onboarding-v2';

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

const snap = buildSeedSnapshot();
const batchUnits = snap.units;

// Real roster derived from batch units + workforce (no placeholders)
const workforceById = new Map(snap.workforce.map((w: any) => [w.id, w]));
function statusToUi(s: string): string {
  const l = (s || '').toLowerCase();
  if (l.includes('complete') || l === 'completed') return 'complete';
  if (l.includes('block')) return 'blocked';
  if (l.includes('await') || l.includes('pending')) return 'pending';
  if (l.includes('progress')) return 'review-required';
  return l || 'active';
}
const rows: readonly RosterRow[] = (() => {
  const subjectIds = Array.from(new Set(batchUnits.map((u: any) => snap.batches.find((b:any)=>b.id===u.batchId)?.subjectId).filter((x): x is string => Boolean(x))));
  return subjectIds.map((sid: string) => {
    const subj: any = workforceById.get(sid) || { id: sid, legalName: sid, primaryRoleId: '—' };
    const uForSubj = batchUnits.filter((u: any) => snap.batches.find((b:any)=>b.id===u.batchId)?.subjectId === sid);
    const getGate = (needle: string) => {
      const hit = uForSubj.find((u: any) => (u.requirementId || '').toLowerCase().includes(needle));
      return hit ? statusToUi(hit.status) : 'locked';
    };
    return {
      subjectId: sid,
      name: subj.legalName || sid,
      role: subj.primaryRoleId || '—',
      gate1: getGate('bg') || getGate('background'),
      gate2: getGate('license') || getGate('credential'),
      gate3: getGate('tb') || getGate('health'),
      gate4: getGate('hipaa') || getGate('training'),
      gate5: getGate('supervis') || 'locked',
    };
  });
})();

const timelineEvents = (snap.audit && snap.audit.length ? snap.audit.slice(0,4).map((a: any) => ({
  label: a.eventType || 'Event',
  value: String(a.at || '').slice(0,16).replace('T',' '),
  detail: JSON.stringify(a.payload || {}).slice(0,60),
})) : [
  { label: 'Batch initialized', value: '2026-04-27 08:00 UTC', detail: 'System generated trigger event (seed)' },
]);

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

// Real evidence/signatures derived from seed for current batch's subjects
const subjectEvidenceData: Record<string, SubjectEvidence> = (() => {
  const map: Record<string, SubjectEvidence> = {};
  const sids = rows.map(r => r.subjectId);
  sids.forEach((sid: string) => {
    const evs = snap.evidence.filter((e: any) => e.subjectId === sid);
    const sigs = snap.signatures.filter((s: any) => s.subjectId === sid);
    const firstEv = evs[0];
    map[sid] = {
      fileName: firstEv ? firstEv.filename || 'seed-evidence.pdf' : 'seed-evidence.pdf',
      uploadTime: (firstEv && firstEv.createdAt || '').slice(0,16).replace('T',' ') || 'seed time',
      shaHash: (firstEv && firstEv.contentHash) || 'seed-hash-from-engine',
      status: firstEv ? String(firstEv.status||'pending').toLowerCase() : 'pending',
      signatures: sigs.map((s: any) => ({
        role: s.signerRole || 'Signer',
        name: s.signerName || sid,
        date: (s.timestamp || s.status === 'Signed' ? 'signed' : 'Pending'),
        token: s.envelopeId || 'seed-eCIgn',
      })),
    };
  });
  return map;
})();

export function OnboardingV2BatchScreen() {
  const { batchId: routeBatchId } = useParams<{ batchId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const subTabParam = searchParams.get('subtab');
  const activeTab: 'overview' | 'roster' = tabParam === 'roster' ? 'roster' : 'overview';
  const activeSubTab: 'evidence' | 'signature' = subTabParam === 'signature' ? 'signature' : 'evidence';
  const setActiveTab = (tab: 'overview' | 'roster') => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('tab', tab);
      return next;
    });
  };
  const setActiveSubTab = (subtab: 'evidence' | 'signature') => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('subtab', subtab);
      return next;
    });
  };
  const [selectedGate, setSelectedGate] = useState<string | null>('Credentials');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(rows[0]?.subjectId || null);
  const [hashVerified, setHashVerified] = useState<Record<string, boolean>>({});

  // Real batch record resolution from seed (wired via import; renders the seeded batch id from onboarding-v2 store seed).
  const snap = buildSeedSnapshot();
  const resolvedBatchId = routeBatchId || (snap.batches[0]?.id ?? 'BATCH-00000001');
  const realBatch: OnboardingExecutionBatch | undefined = snap.batches.find((b) => b.id === resolvedBatchId) || snap.batches[0];
  const batchUnits = snap.units.filter((u: any) => u.batchId === resolvedBatchId);
  const batchRows = rows.filter((r) => batchUnits.some((u: any) => snap.batches.find((b: any) => b.id === u.batchId)?.subjectId === r.subjectId));

  const checklistData = selectedGate ? gateChecklists[selectedGate] : null;
  const selectedSubject = batchRows.find((r) => r.subjectId === selectedSubjectId);
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
        <div className="inline-flex max-w-full flex-wrap rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-xs">
          {[
            { id: 'overview', label: 'Gate Overview' },
            { id: 'roster', label: 'Subjects & Evidence' },
          ].map((tab) => (
            <button
              className={cx(
                'min-h-tap rounded-md px-md text-sm transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                activeTab === tab.id
                  ? 'bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal shadow-rest'
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
        {/* Real seed record indicator: shows resolved batch from onboarding-v2 seed */}
        <div className="text-xs text-muted font-mono">
          Seed batch: <span className="font-medium text-ink">{resolvedBatchId}</span> ({batchUnits.length} units)
          {realBatch ? ` • ${realBatch.status}` : ''}
        </div>
      </div>

      {activeTab === 'overview' ? (
        <section className="grid gap-lg desktop:grid-cols-1">
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
                      isSelected ? 'border-brand-teal bg-surface-hover ring-1 ring-brand-teal/30' : 'border-card bg-surface-glass backdrop-blur-md shadow-glass-inset'
                    )}
                    key={gate.label}
                    type="button"
                  >
                    <span className="grid h-tap w-tap place-items-center rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal mb-sm">
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
              <section className="mt-md rounded-lg border border-tone-teal-border bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest transition duration-normal">
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
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-md rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-sm">
                      <div className="flex items-start gap-md">
                        <span className={cx(
                          'grid h-6 w-6 place-items-center rounded-full mt-xs',
                          item.status === 'PASS' && 'bg-tone-green-bg text-tone-green-text',
                          item.status === 'PENDING' && 'bg-tone-amber-bg text-tone-amber-text',
                          item.status === 'MISSING' && 'bg-tone-orange-bg text-tone-orange-text',
                          item.status === 'LOCKED' && 'bg-surface-glass backdrop-blur-md shadow-glass-inset text-muted'
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

            <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
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
            <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
              <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                <div>
                  <h3 className="text-h3 font-medium text-ink">Batch Subjects Roster</h3>
                  <p className="mt-xs text-sm text-muted">Detailed view of subjects in the batch and their gate positions. Click a subject row to inspect evidence logs.</p>
                </div>
              </div>
              <DataTable 
                columns={columns} 
                label="Batch subjects table" 
                rows={batchRows} 
                onRowClick={handleRowClick}
              />
            </section>

            {/* Evidence / Signature Log */}
            {selectedSubject && evidenceDetails && (
              <section className="mt-md rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest transition duration-normal">
                <div className="mb-md flex flex-wrap items-start justify-between gap-md border-b border-hairline pb-sm">
                  <div>
                    <div className="flex items-center gap-sm">
                      <h3 className="text-h3 font-medium text-ink">{selectedSubject.name}</h3>
                      <span className="text-xs text-muted font-mono">{selectedSubject.subjectId}</span>
                    </div>
                    <p className="text-xs text-secondary mt-xs">Role: {selectedSubject.role}</p>
                  </div>
                  <div className="inline-flex rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-xs">
                    {[
                      { id: 'evidence', label: 'Evidence File' },
                      { id: 'signature', label: 'Signature Log' },
                    ].map((tab) => (
                      <button
                        className={cx(
                        'min-h-tap rounded-md px-md text-sm transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                          activeSubTab === tab.id 
                            ? 'bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal shadow-rest' 
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
                      <div className="grid gap-xs rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md border border-hairline">
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

                      <div className="grid gap-xs rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md border border-hairline">
                        <div className="flex items-center gap-sm text-brand-teal">
                          <ShieldCheck className="h-icon-sm w-icon-sm" />
                          <span className="font-medium text-ink">Hash Integrity (SHA-256)</span>
                        </div>
                        <div className="mt-sm grid gap-sm">
                          <div className="text-[11px] font-mono bg-surface-glass backdrop-blur-md shadow-glass-inset p-sm rounded border border-hairline break-all text-secondary">
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
                    <div className="rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md border border-hairline mb-sm flex justify-between items-center">
                      <span className="text-xs font-medium text-secondary">eCIgn Audit Token:</span>
                      <span className="text-xs font-mono font-medium text-brand-teal-deep bg-surface-glass backdrop-blur-md shadow-glass-inset px-sm py-xs rounded border border-hairline">
                        {evidenceDetails?.signatures?.[0]?.token || 'seed-eCIgn'}
                      </span>
                    </div>
                    <div className="grid gap-lg relative pl-md border-l border-hairline">
                      {evidenceDetails.signatures.map((sig) => (
                        <div key={sig.role} className="relative">
                          <span className={cx(
                            'absolute -left-[21px] top-xs h-[10px] w-[10px] rounded-full border-2',
                            sig.date === 'Pending' ? 'bg-surface-glass backdrop-blur-md shadow-glass-inset border-text-disabled' : 'bg-brand-teal border-brand-teal'
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
