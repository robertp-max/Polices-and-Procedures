import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Landmark, Workflow } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, VeilDrawer, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { Button, ToneBadge } from '../../primitives';
import { cx } from '../../utils/classNames';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import {
  resolveWorkflowPolicyRefs,
} from '@/policy/workflows/utils/resolveWorkflowPolicyRefs';
import { resolveFormTitle } from '@/policy/data/formIdAliases';
import type { CadenceInterval, DomainCode, RiskBand, Workflow as WorkflowDef } from '@/policy/types/workflow';

const DOMAIN_LABELS: Record<DomainCode, string> = {
  GV: 'Governance',
  CL: 'Clinical Ops',
  QA: 'QAPI',
  HR: 'Human Resources',
  CO: 'Compliance',
  FN: 'Finance',
  OP: 'Operations',
  EN: 'Enterprise',
  IT: 'Information Technology',
  RM: 'Risk Management',
};

const FREQUENCY_LABELS: Record<CadenceInterval, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semiannual: 'Semiannual',
  annual: 'Annual',
  biennial: 'Biennial',
  episodic: 'Episodic',
  per_event: 'Per Event',
  on_demand: 'On Demand',
};

const RISK_LABELS: Record<RiskBand, string> = {
  low: 'Low',
  moderate: 'Medium',
  high: 'High',
  immediate_jeopardy: 'Immediate Jeopardy',
};

function toWorkflowRow(wf: WorkflowDef): WorkflowRow {
  const domainLabel = DOMAIN_LABELS[wf.domain] ?? wf.domain;
  const primaryRole = wf.roles.primary[0] ?? '';
  return {
    domain: domainLabel,
    domainOwner: primaryRole ? `${domainLabel} / ${primaryRole}` : domainLabel,
    frequency: FREQUENCY_LABELS[wf.cadence.interval] ?? wf.cadence.interval,
    risk: RISK_LABELS[wf.metrics.declaredRisk] ?? wf.metrics.declaredRisk,
    status: 'active',
    title: wf.title,
    workflowId: wf.id,
  };
}

export const getWorkflowDetail = (id: string) => {
  const wf = WORKFLOWS[id];
  if (wf) {
    const res = resolveWorkflowPolicyRefs(wf);
    const policyStr = res.effectivePolicyRefs.length > 0
      ? res.effectivePolicyRefs.map(r => r.title).join(', ')
      : (wf.policyRefs || []).join(', ');
    const formStr = (wf.requiredForms || []).map(fid => `${fid} ${resolveFormTitle(fid)}`).join(', ') || (wf.requiredFormsRaw || '—');
    const evidenceStr = wf.outputs || wf.auditRequirements || 'Evidence and signed artifacts per workflow.';
    return {
      purpose: wf.processOverview || 'Coordinates active CES processes, linking policies, forms, and evidence history.',
      policies: policyStr || '—',
      forms: formStr,
      evidence: evidenceStr,
      history: [
        { item: 'Workflow steps loaded', status: 'Ready', tone: 'teal' as const },
        { item: `${wf.steps.length} steps; ${wf.requiredForms.length} forms`, status: 'Ready', tone: 'teal' as const },
      ],
    };
  }
  return {
    purpose: 'Coordinates active CES processes, linking policies, forms, and evidence history.',
    policies: '—',
    forms: '—',
    evidence: 'Audit notes, signature hashes',
    history: [
      { item: 'Pre-check completed', status: 'Ready', tone: 'teal' as const },
      { item: 'eCIgn pending', status: 'Awaiting', tone: 'orange' as const },
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

const allWorkflows = Object.values(WORKFLOWS);
const eventBackedCount = allWorkflows.filter(
  (wf) => wf.cadence.kind === 'event_based' || wf.cadence.kind === 'time_based'
).length;

const workflowMetrics: readonly MetricTileData[] = [
  { label: 'Workflows', value: String(allWorkflows.length), helper: 'Active library entries', tone: 'teal' },
  { label: 'Event-backed', value: String(eventBackedCount), helper: 'Mandatory calendar links', tone: 'green' },
  { label: 'Needs review', value: '—', helper: 'Owner or evidence gaps', tone: 'orange' },
  { label: 'Automated', value: '—', helper: 'Evidence and signatures', tone: 'teal' },
];

const workflowColumns: readonly DataTableColumn<WorkflowRow>[] = [
  { key: 'workflowId', label: 'Workflow ID' },
  { key: 'title', label: 'Workflow title' },
  { key: 'domain', label: 'Domain' },
  { key: 'risk', label: 'Risk' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'status', label: 'Status', status: true },
];

export const workflowRows: readonly WorkflowRow[] = Object.values(WORKFLOWS).map(toWorkflowRow);

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

const allDomains = Array.from(new Set(workflowRows.map((r) => r.domain)));
const allRisks = Array.from(new Set(workflowRows.map((r) => r.risk)));

// Design cross-ref (Agent 04/14): Workflows library and swimlane align to V6_DESIGN.html ~1346 (workflowRecords, metrics, cards) and ~1361 (workflowSwimlaneColumns).
// Current data matches design records; swimlane is dynamic but covers intake/evidence/approval/lock per design. See also V6_DESIGN_RECONCILIATION for workflows MATCHED_REFERENCE.

export default function WorkflowsScreen() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedWorkflow, _setSelectedWorkflow] = useState<WorkflowRow | null>(null);
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
              navigate(`/workflows/${row.workflowId}/swimlane`);
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
