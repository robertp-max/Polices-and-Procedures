import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Landmark, Workflow } from 'lucide-react';
import { BoardLane, DataTable, MetricGrid, SurfaceCard, VeilDrawer, type BoardLaneData, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { Button, ToneBadge } from '../../primitives';
import { cx } from '../../utils/classNames';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import {
  resolveWorkflowPolicyRefs,
} from '@/policy/workflows/utils/resolveWorkflowPolicyRefs';
import { resolveFormTitle } from '@/policy/data/formIdAliases';
import { buildLanesForWorkflow } from './WorkflowDetailAndSwimlaneScreen';



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

// The RIGHT workflow library from V6_DESIGN.html (the 6 records for the prototype view).
// Matches design exactly. Design swimlane columns/cards are used in inline view.
const designWorkflowRecords = [
  ['QA-WF-03', 'QAPI Committee Review', 'Governance / QAPI', 'Active'],
  ['CO-WF-02', 'Incident response and escalation', 'Compliance', 'Active'],
  ['GV-WF-01', 'Quarterly Governing Body Packet', 'Governance', 'Ready'],
  ['HR-WF-05', 'Competency validation and license review', 'Human Resources', 'Review'],
  ['RM-WF-04', 'Emergency drill after-action workflow', 'Risk Management', 'Ready'],
  ['CL-WF-08', 'Clinical chart audit and care plan review', 'Clinical Ops', 'Active'],
] as const;

function toDesignWorkflowRow(rec: readonly [string, string, string, string]): WorkflowRow {
  const [workflowId, title, domain, status] = rec;
  return {
    domain,
    domainOwner: domain,
    frequency: 'Quarterly',
    risk: domain.includes('QAPI') || domain.includes('Compliance') ? 'High' : 'Medium',
    status: status.toLowerCase().replace(' ', '-'),
    title,
    workflowId,
  };
}

export const workflowRows: readonly WorkflowRow[] = designWorkflowRecords.map(toDesignWorkflowRow);

const workflowMetrics: readonly MetricTileData[] = [
  { label: 'Workflows', value: String(designWorkflowRecords.length), helper: 'Design prototype records', tone: 'teal' },
  { label: 'Event-backed', value: '4', helper: 'Calendar linked (CES)', tone: 'green' },
  { label: 'Needs review', value: '1', helper: 'Per design', tone: 'orange' },
  { label: 'Ready', value: '2', helper: 'Per design', tone: 'teal' },
];

const workflowColumns: readonly DataTableColumn<WorkflowRow>[] = [
  { key: 'workflowId', label: 'Workflow ID' },
  { key: 'title', label: 'Workflow title' },
  { key: 'domain', label: 'Domain' },
  { key: 'risk', label: 'Risk' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'status', label: 'Status', status: true },
];

// workflowRows already defined above from designWorkflowRecords to match V6_DESIGN.html exactly.

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
  const [selectedSwimlane, setSelectedSwimlane] = useState<WorkflowRow | null>(null);

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

  function openSwimlaneInline(row: WorkflowRow) {
    setSelectedSwimlane(row);
  }

  function closeSwimlaneInline() {
    setSelectedSwimlane(null);
  }

  return (
    <section className="grid gap-xl" data-hash-id="workflows" data-route="/workflows" data-template="matrix">
      <MetricGrid metrics={workflowMetrics} />

      {/* Design prototype workflow library as cards (from V6_DESIGN.html workflowRecords, converted to cards per request).
         This ensures the "right" 6 are always visible and not "deleted". */}
      <div className="grid gap-md grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {designWorkflowRecords.map(([id, title, domain, status]) => (
          <div key={id} className="rounded-lg border border-hairline bg-surface-glass p-lg hover:shadow-rest transition cursor-pointer" onClick={() => {
            const row = workflowRows.find(r => r.workflowId === id);
            if (row) openSwimlaneInline(row);
          }}>
            <div className="flex items-center justify-between">
              <div className="text-tag uppercase tracking-tag text-brand-teal">{id}</div>
              <span className="text-[10px] px-sm py-0.5 rounded bg-white/40">{status}</span>
            </div>
            <div className="mt-sm text-base font-medium text-ink">{title}</div>
            <div className="mt-xs text-sm text-secondary">{domain}</div>
            <div className="mt-md text-[10px] text-muted">Click for swimlane cards (intake → evidence → approval → lock)</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-md">
        <div>
          <div className="text-tag uppercase tracking-tag text-muted">Workflow Library</div>
          <div className="text-h2 font-medium text-brand-teal-deep">Active workflows (design records)</div>
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
              openSwimlaneInline(row);
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

      {/* Inline swimlane with real cards from design (per V6_DESIGN.html), preserves library context and nav bar like CES calendar */}
      {selectedSwimlane && (
        <section className="grid gap-xl rounded-lg border border-hairline bg-surface p-xl shadow-rest" data-swimlane-inline>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-h3 font-medium">{selectedSwimlane.workflowId} — {selectedSwimlane.title}</h3>
              <p className="text-sm text-muted">Inline swimlane view (design cards)</p>
            </div>
            <Button variant="secondary" onClick={closeSwimlaneInline}>Back to library list</Button>
          </div>
          <MetricGrid metrics={[
            { label: 'Domain', value: selectedSwimlane.domain, helper: '', tone: 'teal' as const },
            { label: 'Risk', value: selectedSwimlane.risk, helper: '', tone: 'orange' as const },
            { label: 'Frequency', value: selectedSwimlane.frequency, helper: '', tone: 'teal' as const },
          ]} />
          <div className="grid gap-lg desktop:grid-cols-4">
            {(() => {
              const meta = { id: selectedSwimlane.workflowId, title: selectedSwimlane.title, domain: selectedSwimlane.domain, risk: selectedSwimlane.risk, frequency: selectedSwimlane.frequency, owner: selectedSwimlane.domainOwner };
              const detail = getWorkflowDetail(selectedSwimlane.workflowId);
              const lanes = buildLanesForWorkflow(meta as any, detail);
              return lanes.map((lane: BoardLaneData) => <BoardLane key={lane.title} lane={lane} onCardClick={() => {}} />);
            })()}
          </div>
        </section>
      )}

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
