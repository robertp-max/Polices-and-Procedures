import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Landmark, Workflow } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, VeilDrawer, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { Button, ToneBadge } from '../../primitives';

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

interface WorkflowRow extends Record<string, string> {
  domainOwner: string;
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
  { key: 'domainOwner', label: 'Domain / owner' },
  { key: 'status', label: 'Status', status: true },
];

const workflowRows: readonly WorkflowRow[] = [
  {
    domainOwner: 'Governance / QAPI Lead',
    status: 'active',
    title: 'QAPI Committee Review',
    workflowId: 'QA-WF-03',
  },
  {
    domainOwner: 'Compliance / Administrator',
    status: 'active',
    title: 'Incident response and escalation',
    workflowId: 'CO-WF-02',
  },
  {
    domainOwner: 'Governance / Governing Body',
    status: 'ready',
    title: 'Quarterly Governing Body Packet',
    workflowId: 'GV-WF-01',
  },
  {
    domainOwner: 'Human Resources / Credentialing',
    status: 'review-required',
    title: 'Competency validation and license review',
    workflowId: 'HR-WF-05',
  },
  {
    domainOwner: 'Risk Management / Compliance',
    status: 'ready',
    title: 'Emergency drill after-action workflow',
    workflowId: 'RM-WF-04',
  },
  {
    domainOwner: 'Clinical Ops / Director of Nursing',
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

export default function WorkflowsScreen() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRow | null>(null);

  return (
    <section className="grid gap-lg" data-hash-id="workflows">

      <MetricGrid metrics={workflowMetrics} />

      <section className="grid gap-lg desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section aria-label="Workflows library matrix" className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <DataTable
            columns={workflowColumns}
            label="Workflows library matrix"
            rows={workflowRows}
            onRowClick={(row) => {
              setSelectedWorkflow(row);
              setDrawerOpen(true);
            }}
          />
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
          eyebrow="Workflows Library"
          title={selectedWorkflow.title}
          tone="orange"
          footer={
            <div className="flex flex-wrap justify-end gap-sm">
              <Button onClick={() => setDrawerOpen(false)} variant="secondary">
                Close drawer
              </Button>
              <Button
                onClick={() => {
                  setDrawerOpen(false);
                  navigate(`/workflows/${selectedWorkflow.workflowId}/swimlane`);
                }}
              >
                Open Swimlane Board
              </Button>
            </div>
          }
        >
          <div className="grid gap-md">
            <p className="text-sm font-light leading-relaxed text-secondary">
              {getWorkflowDetail(selectedWorkflow.workflowId).purpose}
            </p>
            <div className="grid grid-cols-2 gap-sm">
              {[
                ['Owner', selectedWorkflow.domainOwner],
                ['Status', selectedWorkflow.status],
                ['Policies', getWorkflowDetail(selectedWorkflow.workflowId).policies],
                ['Forms', getWorkflowDetail(selectedWorkflow.workflowId).forms],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-card bg-tone-slate-bg p-md">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</div>
                  <div className="mt-xs text-xs font-medium text-brand-teal">{value}</div>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-card bg-surface p-md">
              <h4 className="text-sm font-medium text-ink mb-sm">Linked evidence and history</h4>
              <div className="grid gap-xs">
                {getWorkflowDetail(selectedWorkflow.workflowId).history.map((hist, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md bg-tone-slate-bg px-3 py-2 text-xs">
                    <span className="font-light text-secondary">{hist.item}</span>
                    <ToneBadge status={hist.status === 'Ready' ? 'ready' : 'review-required'} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </VeilDrawer>
      )}
    </section>
  );
}
