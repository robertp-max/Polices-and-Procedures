import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Landmark, Search, Workflow } from 'lucide-react';
import { DataTable, ToneTag, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { cx } from '../../utils/classNames';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import {
  resolveWorkflowPolicyRefs,
} from '@/policy/workflows/utils/resolveWorkflowPolicyRefs';
import { resolveFormTitle } from '@/policy/data/formIdAliases';
import {
  PolicyMetricsGrid,
  PolicyPanel,
  PolicySegmentTabs,
  PolicySignalCard,
  PolicyWorkspaceShell,
} from './PolicyWorkspace';


type WorkflowRecord = {
  auditRequirements?: string;
  cadence?: {
    interval?: string;
    kind?: string;
  };
  dependencies?: readonly {
    upstreamId?: string;
  }[];
  domain?: string;
  id?: string;
  metrics?: {
    declaredRisk?: string;
  };
  outputs?: string;
  policyRefs?: readonly string[];
  processOverview?: string;
  requiredForms?: readonly string[];
  requiredFormsRaw?: string;
  roles?: {
    approval?: readonly string[];
    primary?: readonly string[];
    supporting?: readonly string[];
  };
  sla?: string;
  steps?: readonly unknown[];
  title?: string;
  triggers?: readonly {
    description?: string;
  }[];
};

const workflowMap = WORKFLOWS as Record<string, WorkflowRecord>;

export const getWorkflowDetail = (id: string) => {
  const wf = workflowMap[id];
  if (wf) {
    const res = resolveWorkflowPolicyRefs(wf as Parameters<typeof resolveWorkflowPolicyRefs>[0]);
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
      triggers: (wf.triggers || []).map((trigger) => trigger.description).join(' | ') || wf.cadence?.interval || '—',
      linkedWorkflows: (wf.dependencies || []).map((dependency) => dependency.upstreamId).join(', ') || '—',
      history: [
        { item: `Cadence: ${wf.cadence?.interval ?? '—'} (${wf.cadence?.kind ?? '—'})`, status: 'Defined', tone: 'teal' as const },
        { item: `${stepCount} steps; ${formCount} forms; roles: ${(wf.roles?.primary || []).join('/')}`, status: 'Ready', tone: 'teal' as const },
      ],
    };
  }
  // Honest diagnostic for unresolved ID - no fabricated data
  return null;
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

export const workflowRows: readonly WorkflowRow[] = Object.values(workflowMap).map((wf) => {
  const cad = wf.cadence || {};
  const freqRaw = cad.interval || '—';
  const frequency = typeof freqRaw === 'string' ? (freqRaw.charAt(0).toUpperCase() + freqRaw.slice(1)) : '—';
  const riskRaw = (wf.metrics?.declaredRisk || 'moderate').toLowerCase();
  const risk = /immediate_jeopardy|high/.test(riskRaw) ? 'High' : /moderate/.test(riskRaw) ? 'Medium' : 'Low';
  const primary = wf.roles?.primary?.[0] || wf.roles?.supporting?.[0] || wf.domain || '—';
  const workflowId = wf.id ?? 'UNKNOWN-WF';
  return {
    domain: wf.domain || '—',
    domainOwner: String(primary),
    frequency,
    risk,
    status: 'active',
    title: wf.title || workflowId,
    workflowId,
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
  const wf = workflowMap[row.workflowId] || {};
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

  const filteredRows = useMemo(() => workflowRows.filter((row) => {
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
    }), [activeDomains, activeRisks, searchQuery]);

  function toggleDomain(domain: string) {
    setActiveDomains((curr) =>
      curr.includes(domain) ? curr.filter((d) => d !== domain) : [...curr, domain]
    );
  }

  function openRealDetail(row: WorkflowRow) {
    // Click to real detail page first. Detail links to reference swimlane.
    navigate(`/workflows/${encodeURIComponent(row.workflowId)}`);
  }

  const visibleRows = filteredRows.slice(0, 36);
  const hiddenCount = filteredRows.length - visibleRows.length;

  return (
    <PolicyWorkspaceShell
      dataHashId="workflows"
      dataRoute="/workflows"
      description="Generated workflow records open as scannable cards first, with the full matrix and swimlane signals available below."
      eyebrow="Workflow Library"
      title="Workflows"
    >
      <PolicyMetricsGrid metrics={workflowMetrics} />

      <PolicyPanel
        title="Filters"
        description={`${filteredRows.length} workflow records match the active search, domain, and risk filters.`}
        actions={
          <label className="flex min-h-11 min-w-[260px] items-center gap-2 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-3 text-sm text-[#747470]">
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <input
              aria-label="Search workflows"
              className="w-full bg-transparent py-3 text-[#52404B] outline-none placeholder:text-[#9A9A96]"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, title, domain..."
              type="text"
              value={searchQuery}
            />
          </label>
        }
      >
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2" aria-label="Workflow domain filters">
            {allDomains.map((domain) => {
              const on = activeDomains.includes(domain);
              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => toggleDomain(domain)}
                  className={cx(
                    'rounded-[10px] border px-3 py-2 font-montserrat text-[9px] font-bold uppercase tracking-wider transition',
                    on ? 'border-[#007970] bg-[#007970] text-white' : 'border-[#E5E4E3] bg-white text-[#747470] hover:bg-[#F7FEFF] hover:text-[#007970]',
                  )}
                >
                  {domain}
                </button>
              );
            })}
          </div>
          <PolicySegmentTabs
            active={activeRisks.length === allRisks.length ? 'ALL' : activeRisks[0] ?? 'ALL'}
            onChange={(value) => {
              if (value === 'ALL') setActiveRisks([...allRisks]);
              else setActiveRisks([value]);
            }}
            tabs={[{ id: 'ALL', label: 'All Risk' }, ...allRisks.map((risk) => ({ id: risk, label: risk }))]}
          />
        </div>
      </PolicyPanel>

      <PolicyPanel title="Workflow Cards" description="Cards show the generated record essentials; open any card for detail and swimlane access.">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleRows.map((row) => {
            const wf = workflowMap[row.workflowId] || {};
            const stepC = wf.steps?.length || 0;
            const formC = (wf.requiredForms || []).length;
            return (
              <button
                key={row.workflowId}
                type="button"
                onClick={() => openRealDetail(row)}
                className="group flex min-h-[220px] flex-col justify-between rounded-[24px] border border-[#E5E4E3] bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#007970] hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
              >
                <span>
                  <span className="mb-4 flex items-start justify-between gap-4">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#F06923]">{row.workflowId}</span>
                    <ToneTag tone={row.risk === 'High' ? 'orange' : 'teal'}>{row.risk}</ToneTag>
                  </span>
                  <span className="block font-montserrat text-lg font-semibold leading-snug text-[#007970] group-hover:text-[#F06923]">{row.title}</span>
                  <span className="mt-3 block text-sm leading-relaxed text-[#747470]">{row.domain} - {row.frequency}</span>
                </span>
                <span className="mt-6 border-t border-[#E5E4E3] pt-4 text-xs font-medium leading-relaxed text-[#747470]">
                  {stepC} steps - {formC} forms - {row.domainOwner}
                </span>
              </button>
            );
          })}
        </div>
        {filteredRows.length === 0 ? <p className="mt-6 text-sm text-[#747470]">No workflows match current filters.</p> : null}
        {hiddenCount > 0 ? <p className="mt-8 text-center text-sm text-[#747470]">Showing first 36 matches. Search or filter to narrow the list.</p> : null}
      </PolicyPanel>

      <PolicyPanel title="Workflow Matrix" description="The generated table is still here for bulk review, audit comparison, and QA passes.">
        <DataTable
          columns={workflowColumns}
          label="Workflows library matrix"
          rows={filteredRows}
          onRowClick={(row) => openRealDetail(row)}
        />
        {filteredRows.length === 0 ? <div className="p-md text-sm text-muted">No workflows match current filters.</div> : null}
      </PolicyPanel>

      <section className="grid gap-5 xl:grid-cols-3" aria-label="Workflow swimlane cards">
        {workflowCards.map((card) => (
          <PolicySignalCard card={card} key={card.title} />
        ))}
      </section>
    </PolicyWorkspaceShell>
  );
}
