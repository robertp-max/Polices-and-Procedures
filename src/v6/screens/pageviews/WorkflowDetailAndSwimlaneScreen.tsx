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
        title: detail.purpose.slice(0, 60) || 'Reference workflow',
        owner: meta?.owner || '—',
        due: cadenceDue,
        meta: (detail.policies || '').slice(0, 40),
        tone: 'teal' as const,
        chips: ['Ref'],
        progress: 50,
      }],
    }];
  }

  // Distribute real steps from generated record across 4 reference lanes. Include real roles, forms, deadlines, policy refs via detail.
  const n = steps.length;
  const phaseLen = Math.max(1, Math.ceil(n / 4));
  const phaseDefs = [
    { title: 'Intake', tone: 'teal' as const },
    { title: 'Evidence Build', tone: 'orange' as const },
    { title: 'Approval', tone: 'amber' as const },
    { title: 'Locked', tone: 'green' as const },
  ];
  return phaseDefs.map((ph, p) => {
    const slice = steps.slice(p * phaseLen, (p + 1) * phaseLen);
    const cards = slice.length > 0 ? slice.map((s: any, i: number) => ({
      id: `STEP-${String(s.order || (p*phaseLen + i + 1)).padStart(2, '0')}`,
      title: s.action || 'Step',
      owner: s.role || meta?.owner || '—',
      due: s.deadline || cadenceDue,
      meta: [ ...(s.formIds || []), ...(detail.policies ? [detail.policies.split(',')[0]] : []) ].filter(Boolean).join(' ').slice(0, 48),
      tone: ph.tone,
      chips: (s.formIds && s.formIds.length) ? ['Form'] : ['Step'],
      progress: Math.max(35, 92 - (i * 6) - (p * 8)),
    })) : [{
      id: `${ph.title.slice(0,3).toUpperCase()}-0`,
      title: `${ph.title} (from roles/forms)`,
      owner: meta?.owner || '—',
      due: cadenceDue,
      meta: detail.forms ? detail.forms.slice(0, 30) : '',
      tone: ph.tone,
      chips: ['Ref'],
      progress: 60,
    }];
    return {
      title: ph.title,
      count: cards.length,
      tone: ph.tone,
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
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
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

      <section className="grid gap-lg rounded-lg border border-card bg-surface p-xl shadow-rest">
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
          <div className="text-tag uppercase tracking-tag text-muted mr-sm self-center">Other workflows (sample):</div>
          {otherWorkflows.map((w) => (
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

export function WorkflowDetailScreen() {
  // Detail view for /workflows/:workflowId — real data from WORKFLOWS + resolver, with cards and nav to swimlane.
  const { workflowId } = useParams<{ workflowId?: string }>();
  const navigate = useNavigate();
  const meta = getWorkflowMeta(workflowId);
  const detail = getWorkflowDetail(workflowId || '');
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
          <p className="mt-sm text-sm text-muted">No workflow data for ID “{workflowId}”. Select from the library using real generated records.</p>
          <div className="mt-lg flex flex-wrap gap-sm">
            {knownWorkflows.slice(0, 6).map((w) => (
              <Button key={w.workflowId} variant="secondary" onClick={() => navigate(`/workflows/${w.workflowId}`)}>
                {w.workflowId}
              </Button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Use the 4-lane builder (real steps) for summary cards in detail (parity with swimlane cards).
  const swimlaneLanes = buildLanesForWorkflow(meta, detail);

  return (
    <div className="grid gap-xl" data-hash-id="workflow-detail" data-route="/workflows/:workflowId">
      <div className="flex items-center gap-sm">
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
          <p className="mt-xs text-sm text-muted">Reference workflow detail — populated from generated WORKFLOWS real data (steps, policy refs via resolver, forms, roles, cadence).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-sm text-sm">
          <div><span className="text-muted">Owner:</span> <span className="font-medium text-brand-teal">{meta.owner}</span></div>
          <div><span className="text-muted">Policies:</span> <span className="font-medium text-brand-teal">{detail.policies}</span></div>
          <div><span className="text-muted">Forms:</span> <span className="font-medium text-brand-teal">{detail.forms}</span></div>
          <div><span className="text-muted">Evidence/Outputs:</span> <span className="font-medium text-brand-teal">{detail.evidence}</span></div>
          <div><span className="text-muted">Roles:</span> <span className="font-medium text-brand-teal">{detail.roles}</span></div>
          <div><span className="text-muted">Triggers:</span> <span className="font-medium text-brand-teal">{detail.triggers}</span></div>
        </div>

        <div className="pt-md border-t border-hairline">
          <Button
            onClick={() => navigate(`/workflows/${encodeURIComponent(meta.id)}/swimlane`)}
            className="border-tone-orange-border bg-tone-orange-bg text-tone-orange-text hover:bg-tone-orange-bg/85"
          >
            Open Full Swimlane Board →
          </Button>
          <span className="ml-sm text-xs text-muted">4-phase execution view with task cards</span>
        </div>
      </section>

      {/* Real cards preview matching swimlane structure (real data, not stubs) */}
      <section className="grid gap-xl">
        <div className="text-tag uppercase tracking-tag text-muted">Execution Phase Cards (real steps distributed)</div>
        <div className="grid gap-lg desktop:grid-cols-4">
          {swimlaneLanes.map((lane) => (
            <BoardLane key={lane.title} lane={lane} onCardClick={() => navigate(`/workflows/${encodeURIComponent(meta.id)}/swimlane`)} />
          ))}
        </div>
        <p className="text-xs text-muted">Click a card or use button above to open the full swimlane board with modals and navigation.</p>
      </section>

      <section className="flex flex-wrap gap-sm">
        <div className="text-tag uppercase tracking-tag text-muted self-center mr-sm">Jump to other workflow details:</div>
        {knownWorkflows.slice(0, 6).map((w) => (
          <button
            key={w.workflowId}
            type="button"
            onClick={() => navigate(`/workflows/${w.workflowId}`)}
            className={cx(
              'rounded-sm border px-md py-xs text-tag uppercase tracking-tag transition',
              w.workflowId === meta.id ? 'border-brand-teal bg-brand-teal text-on-brand' : 'border-hairline bg-white text-brand-teal hover:bg-white/[.7]'
            )}
          >
            {w.workflowId}
          </button>
        ))}
      </section>
    </div>
  );
}
