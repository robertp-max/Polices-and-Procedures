import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cx } from '../../utils/classNames';
import { AlertTriangle, CalendarCheck2, ChevronsUpDown, ClipboardCheck, FileCheck2, ListChecks, MessageSquareText, PenLine, Search, ShieldCheck, Stethoscope, UserCheck, Users } from 'lucide-react';
import { DataTable, MetricGrid, ProgressMeter, SurfaceCard, ToneTag, VeilDrawer, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { Button, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';

interface SupervisorLearnerRow extends Record<string, string> {
  clearanceStatus: string;
  exceptions: string;
  gaoProgress: string;
  learnerId: string;
  name: string;
  nextReview: string;
  role: string;
  roleProgress: string;
  supervisedVisits: string;
}

interface ClearanceGateRow extends Record<string, string> {
  evidence: string;
  gateId: string;
  requirement: string;
  status: string;
}

interface ReadinessQueue {
  count: string;
  detail: string;
  label: string;
  status: string;
  tone: Tone;
}

interface ProfileBar {
  label: string;
  tone: Tone;
  value: number;
}

interface SupervisorCard extends SurfaceCardData {
  meta: readonly [string, string][];
}

const supervisorMetrics = [
  { label: 'Roster', value: '14', helper: 'Learners under supervision', tone: 'teal' },
  { label: 'Escalations', value: '1', helper: 'Exception needing DON review', tone: 'orange' },
  { label: 'Cleared', value: '4', helper: 'Independent-work signoffs', tone: 'green' },
  { label: 'GAO-EXAM', value: '3', helper: 'Pending supervisor signature', tone: 'amber' },
] satisfies readonly MetricTileData[];

const learnerRows: readonly SupervisorLearnerRow[] = [
  {
    clearanceStatus: 'active',
    exceptions: '0',
    gaoProgress: '60%',
    learnerId: 'EMP-1001',
    name: 'Maria Santos, RN',
    nextReview: 'Jun 21, 2026',
    role: 'RN',
    roleProgress: '25%',
    supervisedVisits: '0/2',
  },
  {
    clearanceStatus: 'ready',
    exceptions: '0',
    gaoProgress: '100%',
    learnerId: 'EMP-1002',
    name: 'Dani Lopez, HHA',
    nextReview: 'Jun 21, 2026',
    role: 'HHA',
    roleProgress: '80%',
    supervisedVisits: '2/2',
  },
  {
    clearanceStatus: 'attention',
    exceptions: '1',
    gaoProgress: '83%',
    learnerId: 'EMP-1003',
    name: 'Kevin Huang, LVN',
    nextReview: 'Jun 22, 2026',
    role: 'LVN',
    roleProgress: '50%',
    supervisedVisits: '1/2',
  },
  {
    clearanceStatus: 'signed',
    exceptions: '0',
    gaoProgress: '100%',
    learnerId: 'EMP-1004',
    name: 'Aisha Patel, OT',
    nextReview: 'Jun 19, 2026',
    role: 'OT',
    roleProgress: '100%',
    supervisedVisits: '2/2',
  },
  {
    clearanceStatus: 'review-required',
    exceptions: '0',
    gaoProgress: '100%',
    learnerId: 'EMP-1005',
    name: 'Rowan Chen, DON',
    nextReview: 'Jun 23, 2026',
    role: 'DON',
    roleProgress: '75%',
    supervisedVisits: 'N/A',
  },
];

const learnerColumns: readonly DataTableColumn<SupervisorLearnerRow>[] = [
  { key: 'learnerId', label: 'Learner ID' },
  { key: 'name', label: 'Learner' },
  { key: 'role', label: 'Role' },
  { key: 'gaoProgress', label: 'GAO' },
  { key: 'roleProgress', label: 'Role modules' },
  { key: 'supervisedVisits', label: 'Visits' },
  { key: 'exceptions', label: 'Exceptions' },
  { key: 'clearanceStatus', label: 'Clearance', status: true },
  { key: 'nextReview', label: 'Next review' },
];


const clearanceGateColumns: readonly DataTableColumn<ClearanceGateRow>[] = [
  { key: 'gateId', label: 'Gate' },
  { key: 'requirement', label: 'Requirement' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'status', label: 'Status', status: true },
];

const readinessQueues: readonly ReadinessQueue[] = [
  {
    count: '3',
    detail: 'GAO-EXAM records need supervisor review before Appendix D can close.',
    label: 'Signature queue',
    status: 'pending',
    tone: 'amber',
  },
  {
    count: '7',
    detail: 'Supervised-visit logs are still needed before independent-work clearance.',
    label: 'Visit readiness',
    status: 'review-required',
    tone: 'orange',
  },
  {
    count: '4',
    detail: 'Learners have final approval and signed Appendix B clearance.',
    label: 'Cleared cohort',
    status: 'signed',
    tone: 'green',
  },
  {
    count: '1',
    detail: 'One LVN exception is escalated for DON coaching and remediation.',
    label: 'Exception watch',
    status: 'attention',
    tone: 'orange',
  },
];

const coachingCards = [
  {
    body: 'Maria needs GAO-014 completion, OASIS coding practice, and two supervised RN visits before the clearance packet can move.',
    icon: Stethoscope,
    meta: [
      ['Coach', 'Dr. Elena Navarro, RN DON'],
      ['Next touchpoint', 'Jun 21, 2026'],
      ['Evidence path', 'HRTA005_D and HRTA005_E'],
    ],
    progress: 42,
    status: 'review-required',
    title: 'Maria Santos coaching plan',
    tone: 'orange',
  },
  {
    body: 'Review cards preserve the learner and supervisor labels expected by the evidence capture flow before signature.',
    icon: ClipboardCheck,
    meta: [
      ['Review packet', 'GAO quiz, return demo, visit log'],
      ['Dual labels', 'Supervisor and Learner'],
      ['Policy anchor', 'HR-TA-005 Appendix D/E'],
    ],
    progress: 68,
    status: 'pending',
    title: 'Supervisor review packet',
    tone: 'amber',
  },
  {
    body: 'Appendix B remains locked until prerequisites, visits, evidence, and DON sign-off are all complete.',
    icon: ShieldCheck,
    meta: [
      ['Clearance gate', 'HR-TA-005 Appendix B'],
      ['Current block', 'Supervised visit evidence'],
      ['Independent work', 'No until signed'],
    ],
    progress: 57,
    status: 'locked',
    title: 'Clearance control',
    tone: 'slate',
  },
] satisfies readonly SupervisorCard[];

const supervisorActions = [
  { icon: CalendarCheck2, label: 'Log visit' },
  { icon: FileCheck2, label: 'Review evidence' },
  { icon: PenLine, label: 'Request signature' },
] as const;

const phaseBLearners = [
  { id: 'EMP-1001', name: 'Maria Santos, RN', track: 'RN pathway', steps: '0 of 2 visits', status: 'In progress', tone: 'orange' as Tone, startDate: 'Apr 20, 2026', clearanceStatus: 'active', exceptions: '0', visits: '0/2', gao: 60, role: 25, visitsProgress: 0, annual: 10 },
  { id: 'EMP-1002', name: 'Dani Lopez, HHA', track: 'HHA pathway', steps: '2 of 2 visits', status: 'Cleared', tone: 'green' as Tone, startDate: 'May 12, 2026', clearanceStatus: 'signed', exceptions: '0', visits: '2/2', gao: 100, role: 80, visitsProgress: 100, annual: 90 },
  { id: 'EMP-1003', name: 'Kevin Huang, LVN', track: 'LVN pathway', steps: '1 of 2 visits', status: 'Remediation', tone: 'orange' as Tone, startDate: 'May 18, 2026', clearanceStatus: 'attention', exceptions: '1', visits: '1/2', gao: 83, role: 50, visitsProgress: 50, annual: 40 },
  { id: 'EMP-1004', name: 'Aisha Patel, OT', track: 'OT pathway', steps: '2 of 2 visits', status: 'Cleared', tone: 'green' as Tone, startDate: 'Jun 1, 2026', clearanceStatus: 'signed', exceptions: '0', visits: '2/2', gao: 100, role: 100, visitsProgress: 100, annual: 100 },
  { id: 'EMP-1005', name: 'Rowan Chen, DON', track: 'DON pathway', steps: 'N/A', status: 'Review Required', tone: 'slate' as Tone, startDate: 'Jun 10, 2026', clearanceStatus: 'review-required', exceptions: '0', visits: 'N/A', gao: 100, role: 75, visitsProgress: 100, annual: 100 },
];

export function SupervisorScreen() {
  const navigate = useNavigate();
  // V1 parity fix: mirrors SupervisorPage (roster rows + progress + clearance gates + visit logging + escalations).
  const [selectedLearner, setSelectedLearner] = useState(phaseBLearners[0]);
  const [learnerPickerOpen, setLearnerPickerOpen] = useState(false);
  const [visitDrawerOpen, setVisitDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const handleBackToJourney = () => navigate('/journey');

  const selectedProfileBars: readonly ProfileBar[] = [
    { label: 'GAO complete', tone: 'teal' as Tone, value: selectedLearner.gao },
    { label: 'Role modules', tone: 'orange' as Tone, value: selectedLearner.role },
    { label: 'Supervised visits', tone: 'orange' as Tone, value: selectedLearner.visitsProgress },
    { label: 'Annual readiness', tone: 'slate' as Tone, value: selectedLearner.annual },
  ];

  const dynamicClearanceGates = [
    {
      evidence: 'Signed before orientation release',
      gateId: 'APP-F',
      requirement: 'Appendix F hard-stop cleared',
      status: selectedLearner.clearanceStatus === 'attention' ? 'review-required' : 'signed',
    },
    {
      evidence: `GAO complete: ${selectedLearner.gao}%`,
      gateId: 'GAO-PRQ',
      requirement: 'GAO prerequisites for HR-TA-005 Appendix D',
      status: selectedLearner.gao === 100 ? 'passed' : 'active',
    },
    {
      evidence: 'General Orientation quiz review',
      gateId: 'GAO-EXAM',
      requirement: 'Supervisor signature required',
      status: selectedLearner.gao === 100 ? 'passed' : 'pending',
    },
    {
      evidence: `${selectedLearner.visits} supervised patient visits logged`,
      gateId: 'HRTA005-E',
      requirement: 'Supervised visit evidence capture',
      status: selectedLearner.visitsProgress === 100 ? 'passed' : 'locked',
    },
  ];

  // Map rows for the main roster table, linking them to selection handler
  const displayRows = learnerRows.map(row => {
    const matched = phaseBLearners.find(l => l.name === row.name);
    return matched ? {
      ...row,
      gaoProgress: `${matched.gao}%`,
      roleProgress: `${matched.role}%`,
      supervisedVisits: matched.visits,
      clearanceStatus: matched.clearanceStatus
    } : row;
  });

  return (
    <section
      className="grid gap-xl"
      data-group="Onboarding"
      data-hash-id="supervisor"
      data-route="/journey/supervisor"
      data-template="journey"
    >
      <MetricGrid metrics={supervisorMetrics} />

      <div className="flex justify-end -mt-sm">
        <Button size="sm" variant="tertiary" onClick={handleBackToJourney}>Back to Journey Overview</Button>
      </div>

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]">
        <section className="grid content-start gap-lg" aria-labelledby="supervisor-roster-title">
          <DataTable 
            columns={learnerColumns} 
            label="Supervisor onboarding learner roster" 
            rows={displayRows} 
            onRowClick={(row) => {
              const matched = phaseBLearners.find(l => l.name === row.name);
              if (matched) {
                setSelectedLearner(matched);
              }
            }}
          />

          <section className="grid gap-md tablet-l:grid-cols-2" aria-label="Supervisor readiness queues">
            {readinessQueues.map((queue) => (
              <article className="rounded-lg border border-card bg-surface p-lg shadow-rest" key={queue.label}>
                <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                  <div className="grid gap-xs">
                    <p className="text-tag uppercase tracking-tag text-muted">{queue.label}</p>
                    <ToneTag tone={queue.tone}>{queue.count} learners</ToneTag>
                  </div>
                  <ToneBadge size="sm" status={queue.status} />
                </div>
                <p className="text-sm font-light text-secondary">{queue.detail}</p>
              </article>
            ))}
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="exception-review-title">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div className="flex items-start gap-md">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-orange-bg text-tone-orange-text">
                  <AlertTriangle aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div className="grid gap-xs">
                  <h2 className="text-h2 font-medium text-ink" id="exception-review-title">
                    Exceptions and remediation
                  </h2>
                  <p className="text-sm font-light text-muted">
                    Supervisor review keeps remediation attached to the learner record before clearance is considered.
                  </p>
                </div>
              </div>
              <ToneBadge size="sm" status="attention" />
            </div>

            <div className="grid gap-md tablet-l:grid-cols-3">
              {[
                ['Kevin Huang, LVN', 'Medication skills remediation after first supervised visit.', 'review-required'],
                ['Maria Santos, RN', 'GAO-014 quiz score must recover before GAO-EXAM unlock.', 'pending'],
                ['Dani Lopez, HHA', 'HHA skills checkoff ready for final preceptor signature.', 'ready'],
              ].map(([learner, detail, status]) => (
                <article className="rounded-lg border border-hairline bg-tone-slate-bg p-lg" key={learner}>
                  <div className="mb-md flex flex-wrap items-center justify-between gap-sm">
                    <h3 className="text-body font-light text-ink">{learner}</h3>
                    <ToneBadge size="sm" status={status} />
                  </div>
                  <p className="text-sm font-light text-secondary">{detail}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="grid content-start gap-lg" aria-label="Selected learner supervision panel">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="selected-learner-title">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div className="flex items-start gap-md">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                  <UserCheck aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div className="grid gap-xs">
                  <p className="text-tag uppercase tracking-tag text-muted">Selected learner</p>
                  <h2 className="text-h2 font-medium text-ink" id="selected-learner-title">
                    {selectedLearner.name}
                  </h2>
                  <p className="text-sm font-light text-secondary">{selectedLearner.id} - Start date {selectedLearner.startDate}</p>
                </div>
              </div>
              <button 
                onClick={() => setLearnerPickerOpen(!learnerPickerOpen)}
                className="rounded-lg border border-hairline bg-surface p-sm text-brand-teal hover:bg-surface-hover"
                aria-label="Open learner picker"
                type="button"
              >
                <ChevronsUpDown className="h-icon-sm w-icon-sm" />
              </button>
            </div>

            {/* Learner / Employee Picker Subview */}
            {learnerPickerOpen && (
              <div className="mb-lg rounded-lg border border-card bg-surface p-md shadow-soft">
                <div className="flex items-center gap-sm rounded-md border border-hairline bg-tone-slate-bg px-md py-sm">
                  <Search className="h-icon-sm w-icon-sm text-muted" />
                  <input
                    type="text"
                    placeholder="Search learners by name or ID..."
                    className="w-full bg-transparent text-xs text-ink outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="mt-md flex flex-wrap gap-xs">
                  {['All', 'GAO', 'Clinical RN', 'HHA'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={cx(
                        'rounded-full px-sm py-xs text-[10px] uppercase font-medium border transition',
                        selectedFilter === filter
                          ? 'bg-brand-teal text-on-brand border-brand-teal'
                          : 'bg-tone-slate-bg text-secondary border-hairline hover:bg-surface-hover'
                      )}
                      type="button"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div className="mt-md space-y-xs max-h-56 overflow-y-auto">
                  {phaseBLearners
                    .filter((l) => {
                      if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase()) && !l.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                      if (selectedFilter === 'GAO' && l.gao < 100) return true;
                      if (selectedFilter === 'Clinical RN' && !l.track.toLowerCase().includes('rn')) return false;
                      if (selectedFilter === 'HHA' && !l.track.toLowerCase().includes('hha')) return false;
                      return true;
                    })
                    .map((l) => (
                      <div
                        key={l.id}
                        onClick={() => setSelectedLearner(l)}
                        className={cx(
                          'flex items-center justify-between gap-sm rounded-md border p-sm cursor-pointer transition',
                          selectedLearner.id === l.id
                            ? 'border-brand-teal bg-tone-teal-bg'
                            : 'border-hairline bg-tone-slate-bg hover:bg-surface-hover'
                        )}
                      >
                        <div>
                          <div className="text-xs font-medium text-ink">{l.name}</div>
                          <div className="text-[10px] text-muted">{l.id} · {l.track}</div>
                        </div>
                        <div className="text-right">
                          <ToneBadge size="sm" status={l.clearanceStatus} />
                          <div className="text-[9px] text-muted mt-xs">{l.steps}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="grid gap-md">
              {selectedProfileBars.map((bar) => (
                <ProgressMeter key={bar.label} label={bar.label} tone={bar.tone} value={bar.value} />
              ))}
            </div>

            <div className="mt-lg grid gap-sm border-t border-hairline pt-lg">
              <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md">
                <span className="text-sm font-light text-secondary">Supervisor</span>
                <span className="text-sm font-light text-ink">Dr. Elena Navarro, RN DON</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md">
                <span className="text-sm font-light text-secondary">Appendix F</span>
                <ToneBadge size="sm" status={selectedLearner.clearanceStatus === 'attention' ? 'review-required' : 'signed'} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md">
                <span className="text-sm font-light text-secondary">Independent work</span>
                <ToneBadge size="sm" status={selectedLearner.visitsProgress === 100 ? 'active' : 'locked'} />
              </div>
            </div>

            <div className="mt-lg flex flex-wrap gap-sm">
              {supervisorActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Button 
                    iconLeft={<Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />} 
                    key={action.label} 
                    size="sm" 
                    variant="secondary"
                    onClick={action.label === 'Log visit' ? () => setVisitDrawerOpen(true) : undefined}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="clearance-gates-title" className="grid gap-lg">
            <div className="flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-slate-bg text-tone-slate-text">
                <ListChecks aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink" id="clearance-gates-title">
                  Clearance gates
                </h2>
                <p className="text-sm font-light text-muted">
                  HR-TA-005 Appendix B stays locked until prerequisite, evidence, and signature gates are complete.
                </p>
              </div>
            </div>

            <DataTable columns={clearanceGateColumns} label="Supervisor clearance gate checklist" rows={dynamicClearanceGates} />
          </section>

          <section className="grid gap-lg" aria-label="Coaching and supervisor review cards">
            {coachingCards.map((card) => (
              <SurfaceCard card={card} key={card.title}>
                <dl className="grid gap-sm border-t border-hairline pt-md">
                  {card.meta.map(([label, value]) => (
                    <div className="grid gap-xs" key={label}>
                      <dt className="text-tag font-light uppercase tracking-tag text-brand-teal">{label}</dt>
                      <dd className="text-sm font-light text-secondary">{value}</dd>
                    </div>
                  ))}
                </dl>
              </SurfaceCard>
            ))}
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="supervisor-review-title">
            <div className="mb-lg flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                <Users aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink" id="supervisor-review-title">
                  Review cadence
                </h2>
                <p className="text-sm font-light text-muted">
                  Daily queues keep learner coaching, readiness exceptions, and clearance packets visible to the DON.
                </p>
              </div>
            </div>

            <div className="grid gap-sm">
              {[
                ['Morning roster review', '14 learners checked for gates, signatures, and visit logs', 'complete'],
                ['Preceptor huddle', 'RN and HHA observation notes routed for final review', 'pending'],
                ['Coaching notes', 'Five remediation comments attached to learner profiles', 'review-required'],
              ].map(([label, detail, status]) => (
                <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md" key={label}>
                  <div className="flex min-w-0 items-start gap-sm">
                    <MessageSquareText aria-hidden="true" className="mt-xs h-icon-sm w-icon-sm shrink-0 text-brand-teal" />
                    <div className="min-w-0">
                      <p className="text-sm font-light text-ink">{label}</p>
                      <p className="mt-xs text-xs font-light text-secondary">{detail}</p>
                    </div>
                  </div>
                  <ToneBadge size="sm" status={status} />
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      {/* Supervised Visit Logging Drawer */}
      <VeilDrawer
        open={visitDrawerOpen}
        onClose={() => setVisitDrawerOpen(false)}
        eyebrow="Journey supervisor"
        title="Log supervised checkoff"
        tone="orange"
        footer={
          <div className="flex justify-end gap-md">
            <Button variant="secondary" onClick={() => setVisitDrawerOpen(false)}>Cancel</Button>
            <Button 
              className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange"
              onClick={() => {
                // Simulate saving the visit checkoff
                setSelectedLearner(prev => ({
                  ...prev,
                  visits: prev.visits === '0/2' ? '1/2' : '2/2',
                  visitsProgress: prev.visits === '0/2' ? 50 : 100,
                  clearanceStatus: prev.visits === '0/2' ? 'active' : 'signed'
                }));
                setVisitDrawerOpen(false);
              }}
            >
              Log and validate visit
            </Button>
          </div>
        }
      >
        <div className="space-y-lg">
          <div className="rounded-lg border border-hairline bg-tone-teal-bg p-lg">
            <div className="text-sm font-medium text-brand-teal">{selectedLearner.name}</div>
            <p className="mt-xs text-xs text-muted">
              {selectedLearner.id} · {selectedLearner.track} · {selectedLearner.visits} supervised visits completed.
            </p>
          </div>

          <div className="grid gap-md">
            <label className="block space-y-xs">
              <span className="text-tag uppercase tracking-tag text-muted">Visit date and time</span>
              <input 
                type="text" 
                defaultValue="Jun 20, 2026 - 9:00 AM" 
                className="w-full rounded-md border border-hairline bg-tone-slate-bg px-md py-sm text-sm text-ink outline-none focus:border-brand-teal"
                readOnly
              />
            </label>

            <label className="block space-y-xs">
              <span className="text-tag uppercase tracking-tag text-muted">Preceptor</span>
              <input 
                type="text" 
                defaultValue="Elena Navarro, DON" 
                className="w-full rounded-md border border-hairline bg-tone-slate-bg px-md py-sm text-sm text-ink outline-none focus:border-brand-teal"
                readOnly
              />
            </label>

            <label className="block space-y-xs">
              <span className="text-tag uppercase tracking-tag text-muted">Patient / visit context</span>
              <textarea 
                defaultValue="SOC observation for medication reconciliation and documentation cadence."
                rows={3} 
                className="w-full rounded-md border border-hairline bg-tone-slate-bg px-md py-sm text-sm text-ink outline-none focus:border-brand-teal resize-none"
                readOnly
              />
            </label>
          </div>

          <div className="rounded-lg border border-card bg-surface p-lg">
            <h4 className="text-sm font-medium text-brand-teal mb-md">Competency checklist</h4>
            <div className="space-y-sm">
              {[
                ['Patient identity verified', 'passed'],
                ['Visit documentation completed', 'passed'],
                ['Infection prevention observed', 'passed'],
                ['Medication teaching reviewed', 'review-required'],
                ['Supervisor attestation captured', 'passed'],
              ].map(([item, status]) => (
                <div key={item} className="flex items-center justify-between rounded-md bg-tone-slate-bg px-md py-sm text-xs">
                  <span className="font-medium text-ink">{item}</span>
                  <ToneBadge size="sm" status={status} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-sm">
            {['Pass', 'Remediation', 'Incomplete'].map((item, index) => (
              <button 
                key={item} 
                className={cx(
                  'rounded-md border py-sm text-xs font-medium transition',
                  index === 0 
                    ? 'border-brand-teal bg-tone-teal-bg text-brand-teal' 
                    : 'border-hairline bg-surface text-muted hover:bg-surface-hover'
                )}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <label className="flex items-start gap-md rounded-lg border border-tone-orange-border bg-tone-orange-bg p-lg">
            <input type="checkbox" defaultChecked className="mt-xs accent-brand-orange" />
            <span className="text-xs leading-relaxed text-secondary">
              Preceptor attests the visit was observed and the checklist reflects actual performance.
            </span>
          </label>
        </div>
      </VeilDrawer>
    </section>
  );
}

export default SupervisorScreen;
