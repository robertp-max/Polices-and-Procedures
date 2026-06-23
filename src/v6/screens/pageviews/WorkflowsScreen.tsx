import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Landmark, Workflow } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, VeilDrawer, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { Button, ToneBadge } from '../../primitives';
import { cx } from '../../utils/classNames';

const getWorkflowDetail = (id: string) => {
  const details: Record<string, { purpose: string; policies: string; forms: string; evidence: string; history: { item: string; status: string; tone: 'orange' | 'teal' }[] }> = {
    'QA-WF-03': {
      purpose: 'Coordinates agenda, attendance, minutes, action tracker, evidence packet, eCIgn routing, and final survey lock for QAPI quarterly board reviews.',
      policies: 'QA-PG-001, GV-GB-001',
      forms: 'GV-FM-005, EN-FM-008',
      evidence: 'Minutes draft, dashboard export, eCIgn certificate',
      history: [
        { item: 'Agenda packet locked', status: 'Ready', tone: 'teal' },
        { item: 'Minutes draft awaiting eCIgn signing', status: 'Awaiting', tone: 'orange' },
        { item: 'Hash manifest verified', status: 'Ready', tone: 'teal' },
        { item: 'Survey packet export queued', status: 'Ready', tone: 'teal' },
      ],
    },
    'CO-WF-02': {
      purpose: 'Standardizes corporate response to safety, operational, or legal incidents, routing intake to executive review.',
      policies: 'CO-IP-002, RM-FL-005',
      forms: 'CO-FM-012, CO-FM-014',
      evidence: 'Intake statement, audit trail, executive sign-off',
      history: [
        { item: 'Intake form submitted', status: 'Ready', tone: 'teal' },
        { item: 'Supervisor review complete', status: 'Ready', tone: 'teal' },
        { item: 'Regulatory notice drafted', status: 'Awaiting', tone: 'orange' },
      ],
    },
    'GV-WF-01': {
      purpose: 'Compiles and signs off the quarterly governing body packets including annual disclosures and conflict reports.',
      policies: 'GV-GB-001, GV-CD-002',
      forms: 'GV-FM-002, GV-FM-009',
      evidence: 'Signed attestation packet, disclosures index, meeting minutes',
      history: [
        { item: 'Disclosure checklist complete', status: 'Ready', tone: 'teal' },
        { item: 'Conflict audit run', status: 'Ready', tone: 'teal' },
        { item: 'Governing board sign-off complete', status: 'Ready', tone: 'teal' },
      ],
    },
    'HR-WF-05': {
      purpose: 'Controls new hire license validation, OIG/SAM exclusion verification, and pre-day-1 checklist clearance.',
      policies: 'HR-TA-001, HR-TA-005',
      forms: 'HR-FM-001, HR-FM-003',
      evidence: 'Background check clearance, primary source verification, offer letter',
      history: [
        { item: 'OIG verification run', status: 'Ready', tone: 'teal' },
        { item: 'SAM verification run', status: 'Ready', tone: 'teal' },
        { item: 'License active check pending', status: 'Awaiting', tone: 'orange' },
      ],
    },
    'RM-WF-04': {
      purpose: 'Manages emergency drills and simulated response after-action review logs to comply with annual survey mandates.',
      policies: 'RM-ED-004, CO-EP-009',
      forms: 'RM-FM-022, RM-FM-025',
      evidence: 'After-action notes, participant roster, signature audit',
      history: [
        { item: 'Drill simulation completed', status: 'Ready', tone: 'teal' },
        { item: 'Participants log locked', status: 'Ready', tone: 'teal' },
        { item: 'Director attestation complete', status: 'Ready', tone: 'teal' },
      ],
    },
    'CL-WF-08': {
      purpose: 'Orchestrates clinical chart review, medication reconciliation audit, and plan of care verification by supervising clinicians.',
      policies: 'CL-SD-012, CL-SD-013',
      forms: 'CL-FM-055, CL-FM-058',
      evidence: 'Reconciliation log, competency rubric, supervisor sign-off',
      history: [
        { item: 'Medication checks run', status: 'Ready', tone: 'teal' },
        { item: 'Preceptor checklist validated', status: 'Ready', tone: 'teal' },
        { item: 'Director sign-off complete', status: 'Ready', tone: 'teal' },
      ],
    },
  };

  return details[id] || {
    purpose: 'Coordinates active CES processes, linking policies, forms, and evidence history.',
    policies: 'QA-PG-001',
    forms: 'GV-FM-005',
    evidence: 'Audit notes, signature hashes',
    history: [
      { item: 'Pre-check completed', status: 'Ready', tone: 'teal' },
      { item: 'eCIgn pending', status: 'Awaiting', tone: 'orange' },
    ],
  };
};

export interface WorkflowRow extends Record<string, string> {
  domain: string;
  domainOwner: string;
  frequency: string;
  risk: string;
  status: string;
  title: string;
  workflowId: string;
}

const workflowMetrics: readonly MetricTileData[] = [
  { label: 'Workflows', value: '42', helper: 'Active library entries', tone: 'teal' },
  { label: 'Event-backed', value: '18', helper: 'Mandatory calendar links', tone: 'green' },
  { label: 'Needs review', value: '6', helper: 'Owner or evidence gaps', tone: 'orange' },
  { label: 'Automated', value: '71%', helper: 'Evidence and signatures', tone: 'teal' },
];

const workflowColumns: readonly DataTableColumn<WorkflowRow>[] = [
  { key: 'workflowId', label: 'Workflow ID' },
  { key: 'title', label: 'Workflow title' },
  { key: 'domain', label: 'Domain' },
  { key: 'risk', label: 'Risk' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'status', label: 'Status', status: true },
];

const workflowRows: readonly WorkflowRow[] = [
  {
    domain: 'Governance',
    domainOwner: 'Governance / QAPI Lead',
    frequency: 'Quarterly',
    risk: 'Medium',
    status: 'active',
    title: 'QAPI Committee Review',
    workflowId: 'QA-WF-03',
  },
  {
    domain: 'Compliance',
    domainOwner: 'Compliance / Administrator',
    frequency: 'As Needed',
    risk: 'High',
    status: 'active',
    title: 'Incident response and escalation',
    workflowId: 'CO-WF-02',
  },
  {
    domain: 'Governance',
    domainOwner: 'Governance / Governing Body',
    frequency: 'Quarterly',
    risk: 'Medium',
    status: 'ready',
    title: 'Quarterly Governing Body Packet',
    workflowId: 'GV-WF-01',
  },
  {
    domain: 'Human Resources',
    domainOwner: 'Human Resources / Credentialing',
    frequency: 'Annual',
    risk: 'Low',
    status: 'review-required',
    title: 'Competency validation and license review',
    workflowId: 'HR-WF-05',
  },
  {
    domain: 'Risk Management',
    domainOwner: 'Risk Management / Compliance',
    frequency: 'Annual',
    risk: 'Medium',
    status: 'ready',
    title: 'Emergency drill after-action workflow',
    workflowId: 'RM-WF-04',
  },
  {
    domain: 'Clinical Ops',
    domainOwner: 'Clinical Ops / Director of Nursing',
    frequency: 'Ongoing',
    risk: 'High',
    status: 'active',
    title: 'Clinical chart audit and care plan review',
    workflowId: 'CL-WF-08',
  },
];

const workflowCards: readonly SurfaceCardData[] = [
  {
    body: 'Agenda, attendance, minutes, action tracker, and dashboard move together through packet lock.',
    icon: Workflow,
    progress: 78,
    status: 'active',
    title: 'QAPI committee packet',
    tone: 'teal',
  },
  {
    body: 'Mobile incident intake routes evidence, supervisor review, and administrator notification in one swimlane.',
    icon: GitBranch,
    progress: 62,
    status: 'review-required',
    title: 'Incident escalation',
    tone: 'orange',
  },
  {
    body: 'Quarterly governing body packet links calendar, policy, forms, minutes, and eCIgn certificate.',
    icon: Landmark,
    progress: 84,
    status: 'ready',
    title: 'Governance cadence',
    tone: 'teal',
  },
];

const allDomains = ['Governance', 'Compliance', 'Human Resources', 'Risk Management', 'Clinical Ops'] as const;
const allRisks = ['High', 'Medium', 'Low'] as const;

// Design cross-ref (Agent 04/14): Workflows library and swimlane align to V6_DESIGN.html ~1346 (workflowRecords, metrics, cards) and ~1361 (workflowSwimlaneColumns).
// Current data matches design records; swimlane is dynamic but covers intake/evidence/approval/lock per design. See also V6_DESIGN_RECONCILIATION for workflows MATCHED_REFERENCE.

export { workflowRows, getWorkflowDetail };

export default function WorkflowsScreen() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDomains, setActiveDomains] = useState<readonly string[]>([...allDomains]);
  const [activeRisks, setActiveRisks] = useState<readonly string[]>([...allRisks]);

  const filteredRows = workflowRows.filter((row) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      row.workflowId.toLowerCase().includes(q) ||
      row.title.toLowerCase().includes(q) ||
      row.domain.toLowerCase().includes(q) ||
      row.domainOwner.toLowerCase().includes(q);
    const matchesDomain = activeDomains.includes(row.domain);
    const matchesRisk = activeRisks.includes(row.risk);
    return matchesSearch && matchesDomain && matchesRisk;
  });

  function toggleDomain(domain: string) {
    setActiveDomains((curr) =>
      curr.includes(domain) ? curr.filter((d) => d !== domain) : [...curr, domain]
    );
  }

  function toggleRisk(risk: string) {
    setActiveRisks((curr) =>
      curr.includes(risk) ? curr.filter((r) => r !== risk) : [...curr, risk]
    );
  }

  return (
    <section className="grid gap-xl" data-hash-id="workflows" data-route="/workflows" data-template="matrix">
      <MetricGrid metrics={workflowMetrics} />

      <div className="flex flex-wrap items-end justify-between gap-md">
        <div>
          <div className="text-tag uppercase tracking-tag text-muted">Workflow Library</div>
          <div className="text-h2 font-medium text-brand-teal-deep">Active workflows</div>
        </div>
        <div className="flex flex-wrap gap-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID, title, domain..."
            className="min-w-[220px] rounded-md border border-card bg-surface px-md py-sm text-sm placeholder:text-muted focus-visible:outline-none focus-visible:shadow-focus"
            aria-label="Search workflows"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-sm" aria-label="Domain and risk filters">
        <span className="text-tag uppercase tracking-tag text-muted self-center mr-xs">Domain:</span>
        {allDomains.map((domain) => {
          const on = activeDomains.includes(domain);
          return (
            <button
              key={domain}
              type="button"
              onClick={() => toggleDomain(domain)}
              className={cx(
                'rounded-sm border px-md py-xs text-tag uppercase tracking-tag transition',
                on
                  ? 'border-brand-teal bg-brand-teal text-on-brand'
                  : 'border-hairline bg-white text-brand-teal hover:bg-white/[.8]'
              )}
            >
              {domain}
            </button>
          );
        })}
        <span className="text-tag uppercase tracking-tag text-muted self-center ml-md mr-xs">Risk:</span>
        {allRisks.map((risk) => {
          const on = activeRisks.includes(risk);
          const toneClass = risk === 'High' ? 'border-tone-orange-border text-tone-orange-text' : risk === 'Medium' ? 'border-brand-teal text-brand-teal' : 'border-tone-green-border text-tone-green-text';
          return (
            <button
              key={risk}
              type="button"
              onClick={() => toggleRisk(risk)}
              className={cx(
                'rounded-sm border px-md py-xs text-tag uppercase tracking-tag transition',
                on ? 'bg-white border-brand-teal text-brand-teal' : `bg-white/[.6] ${toneClass} opacity-70 hover:opacity-100`
              )}
            >
              {risk}
            </button>
          );
        })}
      </div>

      <section className="grid gap-lg desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section aria-label="Workflows library matrix" className="rounded-lg border border-card bg-surface p-xl shadow-rest overflow-hidden">
          <DataTable
            columns={workflowColumns}
            label="Workflows library matrix"
            rows={filteredRows}
            onRowClick={(row) => {
              setSelectedWorkflow(row);
              setDrawerOpen(true);
            }}
          />
          {filteredRows.length === 0 && (
            <div className="p-md text-sm text-muted">No workflows match current filters.</div>
          )}
        </section>

        <aside className="grid content-start gap-lg" aria-label="Workflow swimlane cards">
          {workflowCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>

      {selectedWorkflow && (
        <VeilDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          eyebrow="Workflow Detail"
          title={`${selectedWorkflow.workflowId} — ${selectedWorkflow.title}`}
          tone="orange"
          footer={
            <div className="flex flex-wrap justify-end gap-sm">
              <Button onClick={() => setDrawerOpen(false)} variant="secondary">
                Close
              </Button>
              <Button
                onClick={() => {
                  setDrawerOpen(false);
                  navigate(`/workflows/${selectedWorkflow.workflowId}/swimlane`);
                }}
              >
                Open Swimlane
              </Button>
            </div>
          }
        >
          <div className="grid gap-md">
            <p className="text-sm font-light leading-relaxed text-secondary">
              {getWorkflowDetail(selectedWorkflow.workflowId).purpose}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-sm">
              {[
                ['Domain', selectedWorkflow.domain],
                ['Owner / Role', selectedWorkflow.domainOwner],
                ['Risk', selectedWorkflow.risk],
                ['Frequency', selectedWorkflow.frequency],
                ['Status', selectedWorkflow.status],
                ['Policies', getWorkflowDetail(selectedWorkflow.workflowId).policies],
                ['Forms', getWorkflowDetail(selectedWorkflow.workflowId).forms],
                ['Evidence', getWorkflowDetail(selectedWorkflow.workflowId).evidence],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-card bg-tone-slate-bg p-md">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</div>
                  <div className="mt-xs text-xs font-medium text-brand-teal">{value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-card bg-surface p-md">
              <h4 className="text-sm font-medium text-ink mb-sm">Execution history &amp; evidence state</h4>
              <div className="grid gap-xs">
                {getWorkflowDetail(selectedWorkflow.workflowId).history.map((hist, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md bg-tone-slate-bg px-3 py-2 text-xs">
                    <span className="font-light text-secondary">{hist.item}</span>
                    <ToneBadge status={hist.status === 'Ready' ? 'ready' : 'review-required'} />
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted pt-xs">Click "Open Swimlane" for stage-by-stage execution view, role ownership, and evidence markers.</div>
          </div>
        </VeilDrawer>
      )}
    </section>
  );
}
