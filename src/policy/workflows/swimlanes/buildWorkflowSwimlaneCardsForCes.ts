/**
 * Pure adapter (no execution store / ecign side imports) for converting
 * a canonical WORKFLOWS entry + event context into CES calendar card lanes.
 * Used by calendar event click, /events swimlane, and verification.
 */

import type { Workflow, WorkflowStep } from '@/policy/types/workflow';
import { inferPhaseTemplate } from './phaseTemplates';
import { normalizeRole } from './roleNormalizer';

export function buildWorkflowSwimlaneCardsForEvent(
  event: {
    id?: string;
    label?: string;
    title?: string;
    owner?: string;
    workflowId?: string;
    day?: number;
    month?: number;
    date?: string;
    tone?: any;
  },
  workflow: Workflow | undefined | null
): { lanes: Array<{ title: string; tone: string; note?: string; cards: any[] }>; metrics: any[]; summary: string } {
  const evLabel = event?.label || event?.title || event?.id || 'event';
  const wfId = workflow?.id || event?.workflowId || 'unknown';

  if (!workflow || !Array.isArray(workflow.steps) || workflow.steps.length === 0) {
    return {
      lanes: [{
        title: 'Workflow source missing',
        tone: 'orange',
        note: 'Workflow source missing — cannot render authored swimlane',
        cards: [{
          id: `${evLabel}-source-missing`,
          title: 'Workflow source missing — cannot render authored swimlane',
          owner: event?.owner || '—',
          due: '—',
          progress: 0,
          status: 'Source missing',
          chips: ['diagnostic'],
          tone: 'orange',
        }],
      }],
      metrics: [
        { label: 'Workflow', value: wfId, helper: 'Not in WORKFLOWS or no steps', tone: 'orange' },
        { label: 'Event', value: evLabel, helper: 'CES click', tone: 'slate' },
      ],
      summary: `Workflow source missing — cannot render authored swimlane for ${evLabel}`,
    };
  }

  const phases = inferPhaseTemplate({ workflow });
  const stepCount = workflow.steps.length;
  const phaseCount = Math.max(1, phases.length || 1);

  const groups: Record<string, WorkflowStep[]> = {};
  workflow.steps.forEach((step, idx) => {
    const a = (step.action || '').toLowerCase();
    let pIdx = 1;
    if (/sign|approve|attest|signature/.test(a)) pIdx = phaseCount;
    else if (/lock|package|final evidence|submit|archive|manifest/.test(a)) pIdx = phaseCount;
    else if (/governing body|board/.test(a)) pIdx = Math.min(phaseCount, Math.max(3, phaseCount - 1));
    else if (/minutes|sign|signature/.test(a)) pIdx = Math.min(phaseCount, phaseCount - 1);
    else if (/decide|priority|vote|cap|pip|committee/.test(a)) pIdx = Math.min(phaseCount, Math.max(3, Math.ceil(phaseCount * 0.65)));
    else if (/review|validate|audit|score|verify|findings/.test(a)) pIdx = Math.min(phaseCount, Math.max(2, Math.ceil(phaseCount * 0.5)));
    else if (/data|pull|export|compile|gather|indicator|trend|surveillance|aggregate/.test(a)) pIdx = Math.min(phaseCount, 2);
    else if (/intake|prepare|distribute|agenda|pre-read|packet|bind|confirm|quorum/.test(a)) pIdx = 1;
    else {
      pIdx = Math.max(1, Math.min(phaseCount, Math.floor((idx / Math.max(1, stepCount - 1)) * (phaseCount - 1)) + 1));
    }
    const ph = phases[Math.min(pIdx - 1, phaseCount - 1)] || phases[0];
    const k = ph.id;
    if (!groups[k]) groups[k] = [];
    groups[k].push(step);
  });

  const toneForPhase = (title: string) => (/sign|approval|lock/i.test(title) ? 'orange' : /data|pull/i.test(title) ? 'teal' : 'teal');

  const lanes = Object.keys(groups).map((k) => {
    const ph = phases.find(p => p.id === k) || { title: 'Steps', id: k };
    const stepsIn = groups[k].sort((x: any, y: any) => (x.order || 0) - (y.order || 0));
    const cards = stepsIn.map((s: any, si: number) => {
      const isSig = /sign|attest|approve/i.test(s.action || '');
      return {
        id: `${event.id || wfId}-S${String(s.order || (si + 1)).padStart(2, '0')}`,
        title: `${s.order || (si + 1)}. ${s.action}`,
        owner: normalizeRole(s.role || workflow.roles?.primary?.[0] || event.owner || '—'),
        due: s.deadline || (typeof event.day === 'number' ? `Jun ${event.day}` : '—'),
        progress: Math.min(95, Math.max(10, Math.round(20 + ((si + 1) / Math.max(1, stepsIn.length)) * 60))),
        status: isSig ? 'Awaiting signature' : (s.formIds && s.formIds.length ? 'Needs evidence' : 'Pending'),
        chips: [...(s.formIds || []), ...((workflow.policyRefs || []).slice(0, 1))].filter(Boolean).slice(0, 3),
        tone: toneForPhase(ph.title),
      };
    });
    return {
      title: ph.title,
      tone: toneForPhase(ph.title),
      note: `${stepsIn.length} step(s) from ${wfId}`,
      cards,
    };
  }).filter(l => l.cards.length > 0);

  const total = workflow.steps.length;
  const formCount = (workflow.requiredForms || []).length;
  const polCount = (workflow.policyRefs || []).length;

  return {
    lanes: lanes.length ? lanes : [{ title: 'Steps', tone: 'teal', note: 'All authored steps', cards: workflow.steps.map((s: any, i: number) => ({ id: `S${i}`, title: s.action, owner: s.role || '—', due: s.deadline || '—', progress: 40, status: 'Pending', chips: s.formIds || [], tone: 'teal' })) }],
    metrics: [
      { label: 'Steps', value: String(total), helper: 'Authored workflow steps', tone: 'teal' },
      { label: 'Workflow', value: wfId, helper: (workflow.title || '').slice(0, 24), tone: 'teal' },
      { label: 'Forms', value: String(formCount), helper: 'Required', tone: 'orange' },
      { label: 'Policies', value: String(polCount), helper: 'Refs', tone: 'teal' },
    ],
    summary: `${workflow.title} for ${evLabel} (${event.id || wfId})`,
  };
}