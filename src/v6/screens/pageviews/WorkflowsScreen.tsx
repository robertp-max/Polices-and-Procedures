import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Landmark, Workflow } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { cx } from '../../utils/classNames';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import {
  resolveWorkflowPolicyRefs,
} from '@/policy/workflows/utils/resolveWorkflowPolicyRefs';
import { resolveFormTitle } from '@/policy/data/formIdAliases';



export const getWorkflowDetail = (id: string) => {
  const wf = WORKFLOWS[id];
  if (wf) {
    const res = resolveWorkflowPolicyRefs(wf);
    const policyStr = res.effectivePolicyRefs.length > 0
      ? res.effectivePolicyRefs.map(r => r.title).join(', ')
      : (wf.policyRefs || []).join(', ');
    const formStr = (wf.requiredForms || []).map(fid => `${fid} ${resolveFormTitle(fid)}`).join(', ') || (wf.requiredFormsRaw || '—');
    const evidenceStr = wf.outputs || wf.auditRequirements || wf.sla || '—';
    const stepCount = wf.steps?.length ?? 0;
    const formCount = wf.requiredForms?.length ?? 0;
    return {
      purpose: wf.processOverview || 'Reference workflow definition from generated library.',
      policies: policyStr || '—',
      forms: formStr,
      evidence: evidenceStr,
      roles: (wf.roles?.primary || []).concat(wf.roles?.supporting || [], wf.roles?.approval || []).filter(Boolean).join(' / '),
      triggers: (wf.triggers || []).map((t: any) => t.description).join(' | ') || wf.cadence?.interval || '—',
      linkedWorkflows: (wf.dependencies || []).map((d: any) => d.upstreamId).join(', ') || '—',
      history: [
        { item: `Cadence: ${wf.cadence?.interval ?? '—'} (${wf.cadence?.kind ?? '—'})`, status: 'Defined', tone: 'teal' as const },
        { item: `${stepCount} steps; ${formCount} forms; roles: ${(wf.roles?.primary || []).join('/')}`, status: 'Ready', tone: 'teal' as const },
      ],
    };
  }
  return {
    purpose: 'Reference workflow definition from generated library.',
    policies: '—',
    forms: '—',
    evidence: '—',
    roles: '—',
    triggers: '—',
    linkedWorkflows: '—',
    history: [
      { item: 'Reference data', status: 'Ready', tone: 'teal' as const },
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

export const workflowRows: readonly WorkflowRow[] = Object.values(WORKFLOWS).map((wf: any) => {
  const cad = wf.cadence || {};
  const freqRaw = cad.interval || '—';
  const frequency = typeof freqRaw === 'string' ? (freqRaw.charAt(0).toUpperCase() + freqRaw.slice(1)) : '—';
  const riskRaw = (wf.metrics?.declaredRisk || 'moderate').toLowerCase();
  const risk = /immediate_jeopardy|high/.test(riskRaw) ? 'High' : /moderate/.test(riskRaw) ? 'Medium' : 'Low';
  const primary = wf.roles?.primary?.[0] || wf.roles?.supporting?.[0] || wf.domain || '—';
  return {
    domain: wf.domain || '—',
    domainOwner: String(primary),
    frequency,
    risk,
    status: 'active',
    title: wf.title || wf.id,
    workflowId: wf.id,
  };
});

const workflowMetrics: readonly MetricTileData[] = [
  { label: 'Workflows', value: String(workflowRows.length), helper: 'All generated records', tone: 'teal' },
  { label: 'High risk', value: String(workflowRows.filter((r: WorkflowRow) => r.risk === 'High').length), helper: 'From metrics', tone: 'orange' },
  { label: 'Domains', value: String(Array.from(new Set(workflowRows.map((r: WorkflowRow) => r.domain))).length), helper: 'Coverage', tone: 'teal' },
];

const workflowColumns: readonly DataTableColumn<WorkflowRow>[] = [
  { key: 'workflowId', label: 'Workflow ID' },
  { key: 'title', label: 'Workflow title' },
  { key: 'domain', label: 'Domain' },
  { key: 'risk', label: 'Risk' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'status', label: 'Status', status: true },
];

// workflowRows derived from real generated WORKFLOWS (full resolution of ids, titles, cadence, roles, risk, forms).

const workflowCards: readonly SurfaceCardData[] = workflowRows.slice(0, 3).map((row, idx) => {
  const wf: any = WORKFLOWS[row.workflowId] || {};
  const stepC = wf.steps?.length || 0;
  const formC = (wf.requiredForms || []).length;
  return {
    body: `${row.frequency} • ${row.risk} risk • ${stepC} steps, ${formC} forms. Roles: ${row.domainOwner}. Educational reference only.`,
    icon: idx === 0 ? Workflow : idx === 1 ? GitBranch : Landmark,
    progress: 65 + ((idx * 11) % 25),
    status: 'active',
    title: row.title.length > 28 ? row.title.slice(0, 25) + '…' : row.title,
    tone: row.risk === 'High' ? 'orange' : 'teal',
  } as SurfaceCardData;
});

const allDomains = Array.from(new Set(workflowRows.map((r) => r.domain)));
const allRisks = Array.from(new Set(workflowRows.map((r) => r.risk)));

export default function WorkflowsScreen() {
  const navigate = useNavigate();
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

  function openRealDetail(row: WorkflowRow) {
    // Click behavior: open real detail swimlane using generated WORKFLOWS (list + detail + reference swimlane with steps, policy refs, forms, roles, cadence). Educational, independent from CES execution. Preserves main nav bar via route back-link.
    navigate(`/workflows/${encodeURIComponent(row.workflowId)}/swimlane`);
  }

  return (
    <section className="grid gap-xl" data-hash-id="workflows" data-route="/workflows" data-template="matrix">
      <MetricGrid metrics={workflowMetrics} />

      {/* Real generated workflow library preview (from WORKFLOWS). Click opens reference detail. */}
      <div className="grid gap-md grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {workflowRows.slice(0, 6).map((row) => {
          const wf: any = WORKFLOWS[row.workflowId] || {};
          const stepC = wf.steps?.length || 0;
          const formC = (wf.requiredForms || []).length;
          return (
            <div key={row.workflowId} className="rounded-lg border border-hairline bg-surface-glass p-lg hover:shadow-rest transition cursor-pointer" onClick={() => {
              openRealDetail(row);
            }}>
              <div className="flex items-center justify-between">
                <div className="text-tag uppercase tracking-tag text-brand-teal">{row.workflowId}</div>
                <span className="text-[10px] px-sm py-0.5 rounded bg-white/40">{row.status}</span>
              </div>
              <div className="mt-sm text-base font-medium text-ink">{row.title}</div>
              <div className="mt-xs text-sm text-secondary">{row.domain} • {row.frequency} • {row.risk} risk</div>
              <div className="mt-md text-[10px] text-muted">{stepC} steps • {formC} forms • {row.domainOwner}</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-md">
        <div>
          <div className="text-tag uppercase tracking-tag text-muted">Workflow Library</div>
          <div className="text-h2 font-medium text-brand-teal-deep">Active workflows (generated records)</div>
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
              openRealDetail(row);
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
    </section>
  );
}
