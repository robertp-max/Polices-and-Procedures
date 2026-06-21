import { ClipboardCheck, GitBranch, Landmark, Workflow } from 'lucide-react';
import {
  DataTable,
  MetricGrid,
  SurfaceCard,
  ToneTag,
  type DataTableColumn,
  type MetricTileData,
  type SurfaceCardData,
} from '../../components';
import { Badge } from '../../primitives';

interface WorkflowRow extends Record<string, string> {
  domainOwner: string;
  status: string;
  title: string;
  workflowId: string;
}

interface WorkflowCard extends SurfaceCardData {
  meta: readonly [string, string][];
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

const workflowCards: readonly WorkflowCard[] = [
  {
    body: 'Agenda, attendance, minutes, action tracker, and dashboard move together through packet lock.',
    icon: Workflow,
    meta: [
      ['Linked policies', 'QAPI plan, data aggregation, committee minutes'],
      ['Calendar anchor', 'Quarterly review and governing body packet'],
      ['Evidence path', 'Minutes, dashboard export, eCIgn certificate'],
    ],
    progress: 78,
    status: 'active',
    title: 'QAPI committee packet',
    tone: 'teal',
  },
  {
    body: 'Mobile incident intake routes evidence, supervisor review, and administrator notification in one swimlane.',
    icon: GitBranch,
    meta: [
      ['Linked policies', 'Incident reporting, escalation, corrective action'],
      ['Calendar anchor', 'Incident procedure approval'],
      ['Evidence path', 'Intake note, supervisor review, notification log'],
    ],
    progress: 62,
    status: 'review-required',
    title: 'Incident escalation',
    tone: 'orange',
  },
  {
    body: 'Quarterly governing body packet links calendar, policy, forms, minutes, and eCIgn certificate.',
    icon: Landmark,
    meta: [
      ['Linked policies', 'Governing body authority and conflict disclosure'],
      ['Calendar anchor', 'Governing body pre-read packet'],
      ['Evidence path', 'Policy packet, minutes, signed approvals'],
    ],
    progress: 84,
    status: 'ready',
    title: 'Governance cadence',
    tone: 'teal',
  },
];

const matrixNotes = [
  {
    icon: ClipboardCheck,
    label: 'Policy links',
    value: 'Every workflow row carries the policy owner and packet handoff expected by CES.',
  },
  {
    icon: Workflow,
    label: 'Swimlane ready',
    value: 'High-priority entries can drill into intake, evidence build, approval, and lock phases.',
  },
] as const;

export default function WorkflowsScreen() {
  return (
    <section className="grid gap-xl" data-hash-id="workflows">
      <header className="grid gap-md">
        <div className="flex flex-wrap items-center gap-sm">
          <ToneTag>/workflows</ToneTag>
          <Badge>hash: workflows</Badge>
          <Badge>template: matrix</Badge>
          <Badge>group: CES</Badge>
        </div>
        <div className="grid gap-sm">
          <h1 className="text-display font-medium text-brand-teal-deep">Workflows Library</h1>
          <p className="max-w-content text-body font-light text-secondary">
            Matrix linking active CES workflows to policy owners, required calendar events, evidence capture, and swimlane
            packet readiness.
          </p>
        </div>
      </header>

      <MetricGrid metrics={workflowMetrics} />

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="workflow-matrix-title">
          <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
            <div className="grid gap-xs">
              <h2 className="text-h2 font-medium text-ink" id="workflow-matrix-title">
                Workflow matrix
              </h2>
              <p className="max-w-content text-sm font-light text-muted">
                Static V6 library rows showing the workflow ID, operating owner, and typed status for survey-readiness
                checks.
              </p>
            </div>
            <ToneTag tone="orange">6 need review</ToneTag>
          </div>

          <DataTable columns={workflowColumns} label="Workflows library matrix" rows={workflowRows} />

          <div className="mt-lg grid gap-md tablet-l:grid-cols-2">
            {matrixNotes.map((note) => {
              const Icon = note.icon;

              return (
                <div className="flex items-start gap-md rounded-lg bg-tone-slate-bg p-lg" key={note.label}>
                  <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                    <Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />
                  </span>
                  <div className="grid gap-xs">
                    <h3 className="text-h3 font-light text-ink">{note.label}</h3>
                    <p className="text-sm font-light text-secondary">{note.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="grid gap-lg" aria-label="Workflow swimlane cards">
          {workflowCards.map((card) => (
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
        </aside>
      </section>
    </section>
  );
}
