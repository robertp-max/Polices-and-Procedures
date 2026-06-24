import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  BoardLane,
  MetricGrid,
  VeilModal,
  type BoardCardData,
  type BoardLaneData,
  type MetricTileData,
} from '../../components';
import { Button } from '../../primitives';
import { ToneTag } from '../../components';
import { cx } from '../../utils/classNames';
import { workflowRows, getWorkflowDetail } from './WorkflowsScreen';
import { WORKFLOWS } from '@/policy/data/workflows.generated';

interface WorkflowMeta {
  id: string;
  title: string;
  domain: string;
  risk: string;
  frequency: string;
  owner: string;
}

function getWorkflowMeta(workflowId: string | undefined): WorkflowMeta | null {
  const row = workflowRows.find((r) => r.workflowId === workflowId);
  if (!row) return null;
  // Derive a primary owner from domainOwner string
  const owner = row.domainOwner.split('/')[1]?.trim() || row.domainOwner;
  return {
    id: row.workflowId,
    title: row.title,
    domain: row.domain,
    risk: row.risk,
    frequency: row.frequency,
    owner,
  };
}

export function buildLanesForWorkflow(meta: WorkflowMeta | null, detail: ReturnType<typeof getWorkflowDetail>): readonly BoardLaneData[] {
  const baseDue = 'Jun 22';
  const intakeTitle = meta?.domain === 'Governance' ? 'Prepare packet & agenda' : meta?.domain === 'Compliance' ? 'Incident intake & scope' : 'Trigger workflow & bind policies';
  const lockTitle = 'Route eCIgn & final lock';

  const wf = meta?.id ? WORKFLOWS[meta.id] : undefined;
  // Load correct steps for ID via generated record (fixed rendering for every workflow)
  const stepCards = wf && wf.steps && wf.steps.length > 0
    ? wf.steps.slice(0, 2).map((s, i) => ({
        id: `STEP-${String(s.order).padStart(2, '0')}`,
        title: s.action,
        owner: s.role || meta?.owner || 'Owner',
        due: s.deadline || baseDue,
        meta: (s.formIds && s.formIds[0]) || '',
        tone: 'teal' as const,
        chips: s.formIds && s.formIds.length ? ['Form'] : ['Step'],
        progress: Math.max(50, 90 - i * 10),
      }))
    : [];

  // Design-sourced swimlane cards for ALL workflows in the library (from V6_DESIGN.html workflowRecords + workflowSwimlaneColumns).
  // Converted to card format for BoardLane. No placeholders for the canonical 6.
  const designWorkflowLanes: Record<string, readonly BoardLaneData[]> = {
    'QA-WF-03': [
      { title: 'Intake', count: 2, tone: 'teal', cards: [
        { id: 'INT-01', title: 'Trigger Q2 governance event', owner: 'Compliance', due: 'Jun 19', meta: 'Mandatory events calendar', tone: 'teal', chips: ['Event'], progress: 92 },
        { id: 'INT-02', title: 'Attach policy source set', owner: 'Policy Admin', due: 'Jun 19', meta: 'GV-GB-001, CO-CP-001', tone: 'teal', chips: ['Policy'], progress: 88 },
      ]},
      { title: 'Evidence Build', count: 2, tone: 'orange', cards: [
        { id: 'EVD-01', title: 'Collect board minutes and roster', owner: 'Administrator', due: 'Jun 20', meta: 'GV-FM-005 and GV-FM-011', tone: 'orange', chips: ['Forms'], progress: 56 },
        { id: 'EVD-02', title: 'Prepare QAPI trend packet', owner: 'QAPI Lead', due: 'Jun 21', meta: 'Quarterly indicators', tone: 'teal', chips: ['QAPI'], progress: 74 },
      ]},
      { title: 'Approval', count: 2, tone: 'amber', cards: [
        { id: 'REV-01', title: 'Route chair signature', owner: 'Governing Body Chair', due: 'Jun 22', meta: 'eCIgn sequence 2 of 3', tone: 'orange', chips: ['eCIgn'], progress: 42 },
        { id: 'REV-02', title: 'Administrator certification', owner: 'Robert Chen', due: 'Jun 23', meta: 'Audit packet lock', tone: 'amber', chips: ['Approval'], progress: 64 },
      ]},
      { title: 'Locked', count: 1, tone: 'green', cards: [
        { id: 'LCK-01', title: 'Publish survey packet index', owner: 'Compliance', due: 'Jun 24', meta: 'HTML, markdown, evidence hash', tone: 'green', chips: ['Audit'], progress: 94 },
      ]},
    ],
    'GV-WF-01': [
      { title: 'Intake', count: 2, tone: 'teal', cards: [
        { id: 'GV-01', title: 'Trigger quarterly GB packet', owner: 'Compliance', due: 'Jun 19', meta: 'Calendar event', tone: 'teal', chips: ['Event'], progress: 90 },
        { id: 'GV-02', title: 'Bind GB policies', owner: 'Policy Admin', due: 'Jun 19', meta: 'GV-GB-001', tone: 'teal', chips: ['Policy'], progress: 85 },
      ]},
      { title: 'Evidence Build', count: 2, tone: 'orange', cards: [
        { id: 'GV-03', title: 'Collect board minutes and roster', owner: 'Administrator', due: 'Jun 20', meta: 'GV-FM-005', tone: 'orange', chips: ['Forms'], progress: 55 },
        { id: 'GV-04', title: 'Prepare packet attachments', owner: 'QAPI Lead', due: 'Jun 21', meta: 'Reports', tone: 'teal', chips: ['Evidence'], progress: 70 },
      ]},
      { title: 'Approval', count: 2, tone: 'amber', cards: [
        { id: 'GV-05', title: 'Route chair signature', owner: 'Governing Body Chair', due: 'Jun 22', meta: 'eCIgn', tone: 'orange', chips: ['eCIgn'], progress: 40 },
        { id: 'GV-06', title: 'Administrator certification', owner: 'Robert Chen', due: 'Jun 23', meta: 'Lock', tone: 'amber', chips: ['Approval'], progress: 60 },
      ]},
      { title: 'Locked', count: 1, tone: 'green', cards: [
        { id: 'GV-07', title: 'Publish GB packet index', owner: 'Compliance', due: 'Jun 24', meta: 'Audit', tone: 'green', chips: ['Locked'], progress: 95 },
      ]},
    ],
    'CO-WF-02': [
      { title: 'Intake', count: 2, tone: 'teal', cards: [
        { id: 'CO-01', title: 'Incident intake & scope', owner: 'Compliance', due: 'Jun 19', meta: 'Trigger', tone: 'teal', chips: ['Event'], progress: 88 },
        { id: 'CO-02', title: 'Bind incident policies', owner: 'Policy Admin', due: 'Jun 19', meta: 'CO-CP', tone: 'teal', chips: ['Policy'], progress: 80 },
      ]},
      { title: 'Evidence Build', count: 2, tone: 'orange', cards: [
        { id: 'CO-03', title: 'Collect incident evidence', owner: 'Compliance', due: 'Jun 20', meta: 'Forms', tone: 'orange', chips: ['Evidence'], progress: 50 },
        { id: 'CO-04', title: 'Root cause summary', owner: 'Risk Lead', due: 'Jun 21', meta: 'Analysis', tone: 'teal', chips: ['CAPA'], progress: 65 },
      ]},
      { title: 'Approval', count: 2, tone: 'amber', cards: [
        { id: 'CO-05', title: 'Escalate review', owner: 'Administrator', due: 'Jun 22', meta: 'eCIgn', tone: 'orange', chips: ['Review'], progress: 45 },
        { id: 'CO-06', title: 'Final sign off', owner: 'DON', due: 'Jun 23', meta: 'Cert', tone: 'amber', chips: ['Approval'], progress: 55 },
      ]},
      { title: 'Locked', count: 1, tone: 'green', cards: [
        { id: 'CO-07', title: 'Close incident packet', owner: 'Compliance', due: 'Jun 24', meta: 'Locked', tone: 'green', chips: ['Audit'], progress: 92 },
      ]},
    ],
    'HR-WF-05': [
      { title: 'Intake', count: 2, tone: 'teal', cards: [
        { id: 'HR-01', title: 'Trigger competency review', owner: 'HR', due: 'Jun 19', meta: 'License cycle', tone: 'teal', chips: ['Event'], progress: 85 },
        { id: 'HR-02', title: 'Bind credential policies', owner: 'HR Admin', due: 'Jun 19', meta: 'HR-TA', tone: 'teal', chips: ['Policy'], progress: 78 },
      ]},
      { title: 'Evidence Build', count: 2, tone: 'orange', cards: [
        { id: 'HR-03', title: 'Collect license and certs', owner: 'HR', due: 'Jun 20', meta: 'Files', tone: 'orange', chips: ['Docs'], progress: 60 },
        { id: 'HR-04', title: 'Validation checklist', owner: 'Clinical Manager', due: 'Jun 21', meta: 'Review', tone: 'teal', chips: ['Evidence'], progress: 55 },
      ]},
      { title: 'Approval', count: 2, tone: 'amber', cards: [
        { id: 'HR-05', title: 'Manager sign off', owner: 'DON', due: 'Jun 22', meta: 'eCIgn', tone: 'orange', chips: ['Sign'], progress: 50 },
        { id: 'HR-06', title: 'HR certification', owner: 'HR Lead', due: 'Jun 23', meta: 'Approve', tone: 'amber', chips: ['Approval'], progress: 40 },
      ]},
      { title: 'Locked', count: 1, tone: 'green', cards: [
        { id: 'HR-07', title: 'Lock credential packet', owner: 'HR', due: 'Jun 24', meta: 'Locked', tone: 'green', chips: ['Audit'], progress: 90 },
      ]},
    ],
    'RM-WF-04': [
      { title: 'Intake', count: 2, tone: 'teal', cards: [
        { id: 'RM-01', title: 'Trigger drill after-action', owner: 'Risk', due: 'Jun 19', meta: 'Drill event', tone: 'teal', chips: ['Event'], progress: 95 },
        { id: 'RM-02', title: 'Bind emergency policies', owner: 'Admin', due: 'Jun 19', meta: 'RM-OS', tone: 'teal', chips: ['Policy'], progress: 88 },
      ]},
      { title: 'Evidence Build', count: 2, tone: 'orange', cards: [
        { id: 'RM-03', title: 'Collect drill logs', owner: 'Administrator', due: 'Jun 20', meta: 'Logs', tone: 'orange', chips: ['Forms'], progress: 70 },
        { id: 'RM-04', title: 'After action report', owner: 'Risk Lead', due: 'Jun 21', meta: 'Analysis', tone: 'teal', chips: ['Report'], progress: 60 },
      ]},
      { title: 'Approval', count: 2, tone: 'amber', cards: [
        { id: 'RM-05', title: 'Safety committee review', owner: 'Safety Chair', due: 'Jun 22', meta: 'eCIgn', tone: 'orange', chips: ['Review'], progress: 48 },
        { id: 'RM-06', title: 'Final certification', owner: 'Administrator', due: 'Jun 23', meta: 'Cert', tone: 'amber', chips: ['Approval'], progress: 55 },
      ]},
      { title: 'Locked', count: 1, tone: 'green', cards: [
        { id: 'RM-07', title: 'Publish after-action index', owner: 'Risk', due: 'Jun 24', meta: 'Locked', tone: 'green', chips: ['Audit'], progress: 93 },
      ]},
    ],
    'CL-WF-08': [
      { title: 'Intake', count: 2, tone: 'teal', cards: [
        { id: 'CL-01', title: 'Trigger chart audit', owner: 'Clinical', due: 'Jun 19', meta: 'Calendar', tone: 'teal', chips: ['Event'], progress: 82 },
        { id: 'CL-02', title: 'Bind clinical policies', owner: 'Policy Admin', due: 'Jun 19', meta: 'CL-CP', tone: 'teal', chips: ['Policy'], progress: 75 },
      ]},
      { title: 'Evidence Build', count: 2, tone: 'orange', cards: [
        { id: 'CL-03', title: 'Pull care plan samples', owner: 'Clinical Manager', due: 'Jun 20', meta: 'Charts', tone: 'orange', chips: ['Evidence'], progress: 65 },
        { id: 'CL-04', title: 'Score compliance', owner: 'QA Reviewer', due: 'Jun 21', meta: 'Audit', tone: 'teal', chips: ['Score'], progress: 58 },
      ]},
      { title: 'Approval', count: 2, tone: 'amber', cards: [
        { id: 'CL-05', title: 'Manager review findings', owner: 'DON', due: 'Jun 22', meta: 'eCIgn', tone: 'orange', chips: ['Review'], progress: 52 },
        { id: 'CL-06', title: 'Clinical sign off', owner: 'Clinical Manager', due: 'Jun 23', meta: 'Approve', tone: 'amber', chips: ['Approval'], progress: 48 },
      ]},
      { title: 'Locked', count: 1, tone: 'green', cards: [
        { id: 'CL-07', title: 'Lock audit packet', owner: 'Clinical', due: 'Jun 24', meta: 'Locked', tone: 'green', chips: ['Audit'], progress: 88 },
      ]},
    ],
  };
  if (meta?.id && designWorkflowLanes[meta.id]) {
    return designWorkflowLanes[meta.id];
  }

  return [
    {
      title: 'Intake',
      count: stepCards.length || 2,
      tone: 'teal',
      cards: stepCards.length > 0 ? stepCards : [
        {
          id: 'INT-01',
          title: intakeTitle,
          owner: meta?.owner || 'Workflow Owner',
          due: baseDue,
          chips: ['Policy', 'Scope'],
          progress: 92,
          tone: 'teal',
        },
        {
          id: 'INT-02',
          title: `Bind ${detail.policies.split(',')[0] || 'source policies'}`,
          owner: 'Policy Admin',
          due: baseDue,
          chips: ['Policy', 'Forms'],
          progress: 81,
          tone: 'teal',
        },
      ],
    },
    {
      title: 'Evidence',
      count: 2,
      tone: 'orange',
      cards: [
        {
          id: 'EVD-01',
          title: 'Collect required evidence artifacts',
          owner: meta?.owner || 'Compliance',
          due: 'Jun 23',
          chips: ['Evidence', (detail.forms.split(',')[0] || 'Forms').trim()],
          progress: 74,
          tone: 'orange',
        },
        {
          id: 'EVD-02',
          title: (detail.evidence.split(',')[0] || 'Validate evidence status').trim(),
          owner: meta?.domain || 'Owner',
          due: 'Jun 23',
          chips: ['Audit trail'],
          progress: 66,
          tone: 'orange',
        },
      ],
    },
    {
      title: 'Review',
      count: 2,
      tone: 'amber',
      cards: [
        {
          id: 'REV-01',
          title: `Resolve ${meta?.risk || 'current'} risk signal`,
          owner: 'QAPI Lead',
          due: 'Jun 24',
          chips: ['Readiness', 'Risk'],
          progress: 68,
          tone: 'amber',
        },
        {
          id: 'REV-02',
          title: 'Confirm attendees and role sequence',
          owner: 'Administrator',
          due: 'Jun 24',
          chips: ['Roles'],
          progress: 71,
          tone: 'amber',
        },
      ],
    },
    {
      title: 'Lock',
      count: 1,
      tone: 'green',
      cards: [
        {
          id: 'LCK-01',
          title: lockTitle,
          owner: 'Governing Body',
          due: 'Jun 25',
          chips: ['eCIgn', 'Lock'],
          progress: 58,
          tone: 'green',
        },
      ],
    },
  ];
}

function getWorkflowMetrics(meta: WorkflowMeta | null): readonly MetricTileData[] {
  if (!meta) {
    return [
      { label: 'Stages', value: '4', helper: 'Intake to lock', tone: 'teal' },
      { label: 'Risk', value: '—', helper: 'Select known workflow', tone: 'slate' },
      { label: 'Frequency', value: '—', helper: '—', tone: 'teal' },
      { label: 'Progress', value: '—', helper: 'Workflow state', tone: 'orange' },
    ];
  }
  if (meta.id === 'QA-WF-03') {
    // Align to design for QAPI example (Agent 14)
    return [
      { label: 'Phases', value: '4', helper: 'Intake through lock', tone: 'teal' },
      { label: 'Forms', value: '5', helper: 'Required artifacts', tone: 'orange' },
      { label: 'Approvers', value: '3', helper: 'Role sequenced', tone: 'teal' },
      { label: 'Lock state', value: '64%', helper: 'Pending chair signature', tone: 'orange' },
    ];
  }
  return [
    { label: 'Stages', value: '4', helper: 'Intake → Lock', tone: 'teal' },
    { label: 'Risk', value: meta.risk, helper: 'Current posture', tone: meta.risk === 'High' ? 'orange' : 'teal' },
    { label: 'Frequency', value: meta.frequency, helper: 'Cadence', tone: 'teal' },
    { label: 'Owner', value: meta.owner.split(',')[0].trim(), helper: 'Primary', tone: 'orange' },
  ];
}

export function WorkflowSwimlaneScreen() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();

  const meta = getWorkflowMeta(workflowId);
  const detail = getWorkflowDetail(workflowId || '');
  const lanes = buildLanesForWorkflow(meta, detail);
  const metrics = getWorkflowMetrics(meta);

  const [selectedCard, setSelectedCard] = useState<BoardCardData | null>(null);

  const knownWorkflows = workflowRows;

  if (!meta) {
    return (
      <div className="grid gap-xl">
        <div className="flex items-center gap-sm">
          <Button variant="secondary" iconLeft={<ArrowLeft className="h-icon-sm w-icon-sm" />} onClick={() => navigate('/workflows')}>
            Back to Workflows Library
          </Button>
        </div>
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <h2 className="text-h2 font-medium text-ink">Workflow not found</h2>
          <p className="mt-sm text-sm text-muted">No workflow data for ID “{workflowId}”. Use the library to open a known workflow swimlane.</p>
          <div className="mt-lg flex flex-wrap gap-sm">
            {knownWorkflows.slice(0, 6).map((w) => (
              <Button key={w.workflowId} variant="secondary" onClick={() => navigate(`/workflows/${w.workflowId}/swimlane`)}>
                {w.workflowId}
              </Button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Design cross-ref (Agent 06): workflow-swimlane aligns to V6_DESIGN.html ~1361 (workflowSwimlaneColumns, metrics). Dynamic lanes cover intake/evidence/approval/lock per design prototype.
  return (
    <div className="grid gap-xl" data-hash-id="workflow-swimlane" data-route="/workflows/:workflowId/swimlane">
      <div className="flex flex-wrap items-center gap-sm">
        <Button
          variant="secondary"
          iconLeft={<ArrowLeft className="h-icon-sm w-icon-sm" />}
          onClick={() => navigate('/workflows')}
        >
          Workflows Library
        </Button>
        <span className="text-muted">/</span>
        <span className="font-medium text-ink">{meta.id}</span>
      </div>

      <section className="grid gap-lg rounded-lg border border-card bg-surface p-xl shadow-rest">
        <div>
          <div className="flex flex-wrap items-center gap-sm">
            <ToneTag tone="teal">{meta.domain}</ToneTag>
            <ToneTag tone={meta.risk === 'High' ? 'orange' : 'teal'}>{meta.risk} risk</ToneTag>
            <ToneTag tone="slate">{meta.frequency}</ToneTag>
          </div>
          <h1 className="mt-md text-h2 font-medium text-brand-teal-deep">{meta.title}</h1>
          <p className="mt-xs text-sm text-muted">Workflow swimlane — intake through evidence, review, signature, and lock.</p>
        </div>

        <MetricGrid metrics={metrics} />

        <div className="flex flex-wrap gap-sm pt-md border-t border-hairline">
          <div className="text-tag uppercase tracking-tag text-muted mr-sm self-center">Other workflows:</div>
          {knownWorkflows.map((w) => (
            <button
              key={w.workflowId}
              type="button"
              onClick={() => navigate(`/workflows/${w.workflowId}/swimlane`)}
              className={cx(
                'rounded-sm border px-md py-xs text-tag uppercase tracking-tag transition',
                w.workflowId === meta.id
                  ? 'border-brand-teal bg-brand-teal text-on-brand'
                  : 'border-hairline bg-white text-brand-teal hover:bg-white/[.7]'
              )}
            >
              {w.workflowId}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-xl">
        <div className="grid gap-lg desktop:grid-cols-4">
          {lanes.map((lane) => (
            <BoardLane key={lane.title} lane={lane} onCardClick={setSelectedCard} />
          ))}
        </div>
      </section>

      {selectedCard && (
        <VeilModal
          open={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          eyebrow="Workflow task detail"
          title={selectedCard.title}
          tone={selectedCard.tone}
          footer={
            <div className="flex flex-wrap justify-end gap-sm">
              <Button onClick={() => setSelectedCard(null)} variant="secondary">
                Close
              </Button>
              <Button
                onClick={() => {
                  setSelectedCard(null);
                }}
                className="border-tone-orange-border bg-tone-orange-bg text-tone-orange-text hover:bg-tone-orange-bg/85"
              >
                Mark step complete
              </Button>
            </div>
          }
        >
          <div className="grid gap-md md:grid-cols-2">
            <div className="grid gap-xs">
              {[
                ['Policy linkage', meta ? getWorkflowDetail(meta.id).policies : '—'],
                ['Forms required', meta ? getWorkflowDetail(meta.id).forms : '—'],
                ['Evidence state', meta ? getWorkflowDetail(meta.id).evidence : '—'],
                ['Owner', selectedCard.owner],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between rounded-md bg-tone-slate-bg p-md text-xs">
                  <span className="font-light text-secondary">{label}</span>
                  <span className="font-medium text-brand-teal">{val}</span>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-card bg-surface p-md flex flex-col gap-sm">
              <h4 className="text-sm font-medium text-ink">Step requirements</h4>
              <div className="grid gap-xs text-xs font-light text-secondary">
                <div className="rounded-md bg-tone-slate-bg p-md">Checklist items tracked in lane cards</div>
                <div className="rounded-md bg-tone-slate-bg p-md">Evidence packet attachment required before review gate</div>
                <div className="rounded-md bg-tone-orange-bg border border-tone-orange-border text-tone-orange-text p-md">
                  {meta?.risk === 'High' ? 'High-risk sign-off sequence enforced' : 'Standard eCIgn sequence for domain'}
                </div>
              </div>
            </div>
          </div>
        </VeilModal>
      )}
    </div>
  );
}

export function WorkflowDetailScreen({ workflowId }: { workflowId?: string }) {
  // Lightweight detail view (used if needed for future or drawer parity). Falls back to swimlane identity.
  const meta = getWorkflowMeta(workflowId);
  const detail = getWorkflowDetail(workflowId || '');
  if (!meta) {
    return <div className="text-sm text-muted p-lg">Workflow detail not available.</div>;
  }
  return (
    <div className="grid gap-md">
      <div className="text-tag uppercase tracking-tag text-muted">Workflow Detail</div>
      <h3 className="text-h2 font-medium text-brand-teal-deep">{meta.title}</h3>
      <div className="grid grid-cols-2 gap-sm text-sm">
        <div>ID: <span className="font-medium text-brand-teal">{meta.id}</span></div>
        <div>Domain: {meta.domain}</div>
        <div>Risk: {meta.risk}</div>
        <div>Frequency: {meta.frequency}</div>
        <div>Owner: {meta.owner}</div>
        <div>Policies: {detail.policies}</div>
      </div>
      <p className="text-sm text-secondary">{detail.purpose}</p>
    </div>
  );
}
