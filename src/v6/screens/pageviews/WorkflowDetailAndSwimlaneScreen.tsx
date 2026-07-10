import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import {
  workspaceCompactTabClass,
  workspaceTabActiveClass,
  workspaceTabInactiveClass,
} from './workspaceTabChrome';

interface WorkflowMeta {
  id: string;
  title: string;
  domain: string;
  risk: string;
  frequency: string;
  owner: string;
}

function getWorkflowMeta(workflowId: string | undefined): WorkflowMeta | null {
  if (!workflowId) return null;
  const row = workflowRows.find((r) => r.workflowId === workflowId);
  if (row) {
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
  // Fallback: synthesize meta directly from real generated WORKFLOWS (for any ID)
  const wf = WORKFLOWS[workflowId];
  if (!wf) return null;
  const primary = (wf.roles?.primary?.[0] || wf.roles?.supporting?.[0] || wf.domain || '—');
  const freq = wf.cadence?.interval ? (wf.cadence.interval.charAt(0).toUpperCase() + wf.cadence.interval.slice(1)) : '—';
  const riskRaw = (wf.metrics?.declaredRisk || '').toLowerCase();
  const risk = /immediate|high/.test(riskRaw) ? 'High' : /mod/.test(riskRaw) ? 'Medium' : 'Low';
  return {
    id: wf.id,
    title: wf.title,
    domain: wf.domain,
    risk,
    frequency: freq,
    owner: String(primary),
  };
}

export function buildLanesForWorkflow(meta: WorkflowMeta | null, detail: ReturnType<typeof getWorkflowDetail>): readonly BoardLaneData[] {
  const wf = meta?.id ? WORKFLOWS[meta.id] : undefined;
  const steps = (wf && wf.steps && wf.steps.length > 0) ? wf.steps : [];
  const cadenceDue = wf?.cadence?.interval ? wf.cadence.interval : '—';

  if (steps.length === 0) {
    return [{
      title: 'Reference',
      count: 1,
      tone: 'teal',
      cards: [{
        id: 'REF-00',
        title: ((detail as any)?.purpose || 'Reference workflow').slice(0, 60),
        owner: meta?.owner || '—',
        due: cadenceDue,
        meta: ((detail as any)?.policies || '').slice(0, 40),
        tone: 'teal' as const,
        chips: ['Ref'],
        progress: 0, // reference only
      }],
    }];
  }

  // Use authored steps order and simple deterministic grouping (preserve real step data)
  const n = steps.length;
  const phaseLen = Math.max(1, Math.ceil(n / Math.min(6, Math.max(2, Math.floor(n / 3)))));
  const groups: any[][] = [];
  for (let i = 0; i < n; i += phaseLen) groups.push(steps.slice(i, i + phaseLen));
  return groups.map((slice, p) => {
    const cards = slice.map((s: any, i: number) => ({
      id: `STEP-${String(s.order || (p * phaseLen + i + 1)).padStart(2, '0')}`,
      title: s.action || 'Step',
      owner: s.role || meta?.owner || '—',
      due: s.deadline || cadenceDue,
      meta: [ ...(s.formIds || []), ...((detail as any)?.policies ? [(detail as any).policies.split(',')[0]] : []) ].filter(Boolean).join(' ').slice(0, 48),
      tone: 'teal' as const,
      chips: (s.formIds && s.formIds.length) ? ['Form'] : ['Step'],
      progress: 0, // reference only, no progress
    }));
    return {
      title: `Authored Steps ${p + 1}`,
      count: cards.length,
      tone: 'teal' as const,
      cards,
    };
  });
}

function getWorkflowMetrics(meta: WorkflowMeta | null): readonly MetricTileData[] {
  if (!meta) {
    return [
      { label: 'Stages', value: '4', helper: 'Reference lanes', tone: 'teal' },
      { label: 'Risk', value: '—', helper: 'Select workflow', tone: 'slate' },
      { label: 'Frequency', value: '—', helper: 'Cadence', tone: 'teal' },
      { label: 'Steps', value: '—', helper: 'From generated', tone: 'orange' },
    ];
  }
  const wf = WORKFLOWS[meta.id];
  if (wf) {
    return [
      { label: 'Steps', value: String(wf.steps?.length || 0), helper: 'Real steps', tone: 'teal' },
      { label: 'Forms', value: String(wf.requiredForms?.length || 0), helper: 'Required', tone: 'orange' },
      { label: 'Policies', value: String(wf.policyRefs?.length || wf.metrics?.policyCount || 0), helper: 'Refs', tone: 'teal' },
      { label: 'Cadence', value: meta.frequency, helper: wf.cadence?.kind || 'Reference', tone: 'teal' },
    ];
  }
  return [
    { label: 'Stages', value: '4', helper: 'Intake → Lock', tone: 'teal' },
    { label: 'Risk', value: meta.risk, helper: 'Current', tone: meta.risk === 'High' ? 'orange' : 'teal' },
    { label: 'Frequency', value: meta.frequency, helper: 'Cadence', tone: 'teal' },
    { label: 'Owner', value: (meta.owner || '').split(',')[0].trim(), helper: 'Primary', tone: 'orange' },
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
  // Limit displayed "other" to avoid flooding UI with 200+; click library for full list
  const otherWorkflows = knownWorkflows.slice(0, 8);

  if (!meta) {
    return (
      <div className="grid gap-xl">
        <div className="flex items-center gap-sm">
          <Button variant="secondary" iconLeft={<ArrowLeft className="h-icon-sm w-icon-sm" />} onClick={() => navigate('/workflows')}>
            Back to Workflows Library
          </Button>
        </div>
        <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest">
          <h2 className="text-h2 font-medium text-ink">Workflow not found</h2>
          <p className="mt-sm text-sm text-muted">No workflow data for ID “{workflowId}”. Use the library list (real generated records) to open a reference swimlane with steps, policies, forms, roles, cadence.</p>
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

  // Reference swimlane built from generated WORKFLOWS real steps/policyRefs/forms/roles/cadence (educational, no CES execution).
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

      <section className="grid gap-lg rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest">
        <div>
          <div className="flex flex-wrap items-center gap-sm">
            <ToneTag tone="teal">{meta.domain}</ToneTag>
            <ToneTag tone={meta.risk === 'High' ? 'orange' : 'teal'}>{meta.risk} risk</ToneTag>
            <ToneTag tone="slate">{meta.frequency}</ToneTag>
          </div>
          <h1 className="mt-md text-h2 font-medium text-brand-teal-deep">{meta.title}</h1>
          <p className="mt-xs text-sm text-muted">Reference swimlane (educational) — real steps, policy refs, forms, roles, cadence from generated WORKFLOWS. Independent of CES execution.</p>
        </div>

        <MetricGrid metrics={metrics} />

        <div className="flex flex-wrap gap-sm pt-md border-t border-hairline">
          <div className="text-tag uppercase tracking-tag text-muted mr-sm self-center">Other workflows:</div>
          {otherWorkflows.map((w) => (
            <button
              key={w.workflowId}
              type="button"
              onClick={() => navigate(`/workflows/${w.workflowId}/swimlane`)}
              className={cx(
                'rounded-sm border px-md py-xs text-tag uppercase tracking-tag transition',
                w.workflowId === meta.id
                  ? 'border-brand-teal bg-brand-teal text-on-brand'
                  : 'border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal hover:bg-surface-glass hover:backdrop-blur-md'
              )}
            >
              {w.workflowId}
            </button>
          ))}
          <span className="text-[10px] self-center text-muted">+{Math.max(0, knownWorkflows.length - otherWorkflows.length)} more — see library list</span>
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
            </div>
          }
        >
          <div className="grid gap-md md:grid-cols-2">
            <div className="grid gap-xs">
              {[
                ['Policy linkage', meta ? ((getWorkflowDetail(meta.id) as any)?.policies || '—') : '—'],
                ['Forms required', meta ? ((getWorkflowDetail(meta.id) as any)?.forms || '—') : '—'],
                ['Evidence state', meta ? ((getWorkflowDetail(meta.id) as any)?.evidence || '—') : '—'],
                ['Owner', selectedCard.owner],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md text-xs">
                  <span className="font-light text-secondary">{label}</span>
                  <span className="font-medium text-brand-teal">{val}</span>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-md flex flex-col gap-sm">
              <h4 className="text-sm font-medium text-ink">Reference source details</h4>
              <div className="grid gap-xs text-xs font-light text-secondary">
                <div className="rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md">Authored step from generated workflow definition</div>
                <div className="rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md">Linked forms and policies shown for reference</div>
                <div className="rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md">
                  No completion or execution action is performed here
                </div>
              </div>
            </div>
          </div>
        </VeilModal>
      )}
    </div>
  );
}

const WF_DOMAIN_LABEL: Record<string, string> = {
  GV: 'Governance', CL: 'Clinical', QA: 'QAPI', HR: 'Human Resources', CO: 'Compliance',
  FN: 'Finance', OP: 'Operations', EN: 'Enterprise', IT: 'IT', RM: 'Risk',
};
const WF_RISK: Record<string, { label: string; cls: string; dot: string }> = {
  immediate_jeopardy: { label: 'Immediate Jeopardy', cls: 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text', dot: 'bg-brand-orange' },
  high: { label: 'High Risk', cls: 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text', dot: 'bg-brand-orange' },
  moderate: { label: 'Moderate', cls: 'border-tone-amber-border bg-tone-amber-bg text-tone-amber-text', dot: 'bg-tone-amber-text' },
  low: { label: 'Low', cls: 'border-tone-teal-border bg-tone-teal-bg text-brand-teal', dot: 'bg-brand-teal' },
};
type WfTab = 'process' | 'steps' | 'forms' | 'approvals' | 'escalation' | 'audit' | 'compliance';
const WF_TABS: Array<{ id: WfTab; label: string }> = [
  { id: 'process', label: 'Process' }, { id: 'steps', label: 'Steps' }, { id: 'forms', label: 'Forms' },
  { id: 'approvals', label: 'Approvals' }, { id: 'escalation', label: 'Escalation' },
  { id: 'audit', label: 'Audit' }, { id: 'compliance', label: 'Compliance' },
];

function WfSectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-tag font-semibold uppercase tracking-tag text-brand-teal">{children}</div>;
}

export function WorkflowDetailScreen({ workflowId: propId }: { workflowId?: string }) {
  // Resolve the id from the route (/workflows/:workflowId) when no prop is passed
  // by the dispatcher — otherwise the detail renders an empty "not found" id.
  const params = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const workflowId = propId || params.workflowId || '';
  const [tab, setTab] = useState<WfTab>('process');
  const wf = WORKFLOWS[workflowId];

  if (!wf) {
    return (
      <div className="grid gap-sm rounded-xl border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset/80 p-xl text-sm text-muted shadow-rest backdrop-blur-md">
        <h3 className="text-h3 font-medium text-ink">Workflow not found</h3>
        <p>Unresolved workflow ID: <code>{workflowId || '—'}</code>. This ID does not exist in the canonical generated WORKFLOWS. No fabricated data is shown.</p>
        <Link to="/workflows" className="mt-sm inline-block text-brand-teal hover:underline">Return to Workflows Library</Link>
      </div>
    );
  }

  const risk = WF_RISK[wf.metrics?.declaredRisk ?? 'moderate'] ?? WF_RISK.moderate;
  const cadenceLabel = `${wf.cadence?.interval ?? 'on demand'} · ${(wf.cadence?.kind ?? 'time_based').replace(/_/g, '-')}`;
  const title = wf.title.replace(/\b\w/g, (c) => c.toUpperCase());
  const glass = 'rounded-xl border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset/80 shadow-rest backdrop-blur-md';

  return (
    <div className="grid gap-lg">
      <Link to="/workflows" className="text-sm font-medium text-brand-teal hover:underline">← Workflows</Link>

      <div className="grid gap-lg desktop:grid-cols-1">
        {/* Main glass card with tabs */}
        <div className={`${glass} overflow-hidden`}>
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-md border-b border-hairline bg-tone-teal-bg/40 px-lg py-lg">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-tone-teal-border bg-surface-glass backdrop-blur-md shadow-glass-inset px-2.5 py-1 text-tag font-semibold uppercase tracking-tag text-brand-teal-deep">
                  {wf.domain} · {WF_DOMAIN_LABEL[wf.domain] ?? wf.domain}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-tag font-semibold uppercase tracking-tag ${risk.cls}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${risk.dot}`} /> {risk.label}
                </span>
              </div>
              <div className="text-tag uppercase tracking-tag text-muted">{wf.id}</div>
              <h2 className="mt-1 text-h1 font-medium text-brand-teal-deep">{title}</h2>
              <button
                type="button"
                onClick={() => navigate(`/workflows/${wf.id}/swimlane`)}
                className="mt-md inline-flex items-center gap-2 rounded-lg bg-brand-orange px-lg py-2.5 text-sm font-semibold uppercase tracking-wide text-on-brand shadow-rest transition hover:bg-brand-orange-deep focus-visible:outline-none focus-visible:shadow-focus"
              >
                Launch Swimlane
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex max-w-full items-stretch overflow-x-auto border-b border-hairline px-lg pt-3 font-montserrat">
            {WF_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cx(
                  workspaceCompactTabClass,
                  'flex items-center justify-center whitespace-nowrap',
                  tab === t.id ? workspaceTabActiveClass : workspaceTabInactiveClass,
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab body */}
          <div className="grid gap-lg p-lg desktop:grid-cols-1">
            <div className="grid gap-lg">
              {tab === 'process' && (
                <>
                  <div className="grid gap-2"><WfSectionTitle>Process Overview</WfSectionTitle><p className="text-sm leading-relaxed text-ink">{wf.processOverview || '—'}</p></div>
                  <div className="grid gap-2">
                    <WfSectionTitle>Triggers</WfSectionTitle>
                    <ul className="grid gap-1.5 text-sm text-ink">
                      {(wf.triggers ?? []).map((t, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="shrink-0 rounded bg-tone-teal-bg px-1.5 py-0.5 text-tag font-semibold uppercase tracking-tag text-brand-teal">{t.kind.replace(/_/g, '-')}</span>
                          <span>{t.description}</span>
                        </li>
                      ))}
                      {!(wf.triggers ?? []).length && <li className="text-muted">—</li>}
                    </ul>
                  </div>
                  <div className="grid gap-2">
                    <WfSectionTitle>Inputs</WfSectionTitle>
                    <ul className="ml-4 list-disc grid gap-1 text-sm text-ink">{(wf.inputs ?? []).map((x, i) => <li key={i}>{x}</li>)}{!(wf.inputs ?? []).length && <li className="list-none text-muted">—</li>}</ul>
                  </div>
                  <div className="grid gap-2"><WfSectionTitle>Outputs</WfSectionTitle><p className="text-sm leading-relaxed text-ink">{wf.outputs || '—'}</p></div>
                </>
              )}

              {tab === 'steps' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead><tr className="border-b border-hairline text-left text-tag uppercase tracking-tag text-muted">
                      <th className="py-2 pr-3">#</th><th className="py-2 pr-3">Action</th><th className="py-2 pr-3">Role</th><th className="py-2 pr-3">Forms</th><th className="py-2">Deadline</th>
                    </tr></thead>
                    <tbody>
                      {(wf.steps ?? []).map((s) => (
                        <tr key={s.order} className="border-b border-hairline/60 align-top">
                          <td className="py-2.5 pr-3 font-medium text-brand-teal">{s.order}</td>
                          <td className="py-2.5 pr-3 text-ink">{s.action}</td>
                          <td className="py-2.5 pr-3 text-muted">{s.role}</td>
                          <td className="py-2.5 pr-3"><div className="flex flex-wrap gap-1">{(s.formIds ?? []).map((f) => <span key={f} className="rounded border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-1.5 py-0.5 text-tag text-muted">{f}</span>)}{!(s.formIds ?? []).length && '—'}</div></td>
                          <td className="py-2.5 text-muted">{s.deadline || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === 'forms' && (
                <div className="grid gap-3">
                  <WfSectionTitle>Required Forms & Documents</WfSectionTitle>
                  <div className="flex flex-wrap gap-2">{(wf.requiredForms ?? []).map((f) => <span key={f} className="rounded-md border border-tone-teal-border bg-tone-teal-bg px-2.5 py-1 text-sm font-medium text-brand-teal-deep">{f}</span>)}{!(wf.requiredForms ?? []).length && <span className="text-sm text-muted">—</span>}</div>
                  {wf.requiredFormsRaw && <p className="text-xs leading-relaxed text-muted">{wf.requiredFormsRaw}</p>}
                </div>
              )}

              {tab === 'approvals' && (
                <div className="grid gap-3">
                  <WfSectionTitle>Approvals</WfSectionTitle>
                  <ul className="grid gap-2 text-sm text-ink">
                    {(wf.approvals ?? []).map((a, i) => (
                      <li key={i} className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-3">
                        <div>{a.description}</div>
                        {a.requiresGoverningBody && <span className="mt-1 inline-block rounded-full border border-tone-orange-border bg-tone-orange-bg px-2 py-0.5 text-tag font-semibold uppercase tracking-tag text-tone-orange-text">Governing Body required</span>}
                      </li>
                    ))}
                    {!(wf.approvals ?? []).length && <li className="text-muted">{wf.approvalsRaw || '—'}</li>}
                  </ul>
                </div>
              )}

              {tab === 'escalation' && (
                <div className="grid gap-lg">
                  <div className="grid gap-2"><WfSectionTitle>SLA / Deadlines</WfSectionTitle><p className="text-sm leading-relaxed text-ink">{wf.sla || '—'}</p></div>
                  <div className="grid gap-2"><WfSectionTitle>Escalation Logic</WfSectionTitle><p className="text-sm leading-relaxed text-ink">{wf.escalationLogic || '—'}</p></div>
                  <div className="grid gap-2"><WfSectionTitle>Failure Conditions</WfSectionTitle><p className="text-sm leading-relaxed text-ink">{wf.failureConditions || '—'}</p></div>
                </div>
              )}

              {tab === 'audit' && (
                <div className="grid gap-2"><WfSectionTitle>Audit Requirements</WfSectionTitle><p className="text-sm leading-relaxed text-ink">{wf.auditRequirements || '—'}</p></div>
              )}

              {tab === 'compliance' && (
                <div className="grid gap-lg">
                  <div className="grid gap-2">
                    <WfSectionTitle>Policy References</WfSectionTitle>
                    <div className="flex flex-wrap gap-2">{(wf.policyRefs ?? []).map((p) => <span key={p} className="rounded-md border border-tone-teal-border bg-tone-teal-bg px-2.5 py-1 text-sm font-medium text-brand-teal-deep">{p}</span>)}{!(wf.policyRefs ?? []).length && <span className="text-sm text-muted">—</span>}</div>
                    {(wf.policyReferences ?? []).map((p, i) => <p key={i} className="text-xs leading-relaxed text-muted">{p}</p>)}
                  </div>
                  <div className="grid gap-2">
                    <WfSectionTitle>Regulatory Anchors</WfSectionTitle>
                    <div className="flex flex-wrap gap-2">{(wf.regulatoryAnchors ?? []).map((r, i) => <span key={i} className="rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-2.5 py-1 text-sm text-ink">{r}</span>)}{!(wf.regulatoryAnchors ?? []).length && <span className="text-sm text-muted">—</span>}</div>
                  </div>
                </div>
              )}
            </div>

            {/* In-tab right column: Responsible Roles + Anchors (shown on Process) */}
            {tab === 'process' && (
              <div className="grid content-start gap-lg">
                <div className="grid gap-2">
                  <WfSectionTitle>Responsible Roles</WfSectionTitle>
                  <div className="grid gap-2 text-sm">
                    <div><div className="text-tag uppercase tracking-tag text-muted">Primary</div><div className="text-ink">{(wf.roles?.primary ?? []).join(', ') || '—'}</div></div>
                    <div><div className="text-tag uppercase tracking-tag text-muted">Supporting</div><div className="text-ink">{(wf.roles?.supporting ?? []).join(', ') || '—'}</div></div>
                    <div><div className="text-tag uppercase tracking-tag text-muted">Approval</div><div className="text-ink">{(wf.roles?.approval ?? []).join(', ') || '—'}</div></div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <WfSectionTitle>Regulatory Anchors</WfSectionTitle>
                  <div className="flex flex-wrap gap-1.5">{(wf.regulatoryAnchors ?? []).map((r, i) => <span key={i} className="rounded border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset px-2 py-0.5 text-xs text-ink">{r}</span>)}{!(wf.regulatoryAnchors ?? []).length && <span className="text-xs text-muted">—</span>}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metrics sidebar card */}
        <aside className={`${glass} grid h-fit content-start gap-3 p-lg`}>
          {[
            ['Cadence', cadenceLabel],
            ['Steps', String(wf.metrics?.stepCount ?? wf.steps?.length ?? 0)],
            ['Forms', String(wf.metrics?.formCount ?? wf.requiredForms?.length ?? 0)],
            ['Policies', String(wf.metrics?.policyCount ?? wf.policyRefs?.length ?? 0)],
            ['Primary', (wf.roles?.primary ?? [])[0] ?? '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3 border-b border-hairline/60 pb-2 last:border-0 last:pb-0">
              <span className="text-tag uppercase tracking-tag text-muted">{k}</span>
              <span className="text-right text-sm font-medium text-brand-teal-deep">{v}</span>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
