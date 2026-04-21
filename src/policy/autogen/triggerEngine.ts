import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { EventTemplate, TriggerDefinition } from './types';
import { addDays, toISO } from './scheduler';

/* ═══════════════════════════════════════════════════════════════
   Trigger Engine
   ----------------------------------------------------------------
   Consumes real-world signals (incident reports, sentinel events,
   missed deadlines, complaints, survey notices) and materializes
   the appropriate trigger-template event on the planner.
   ═══════════════════════════════════════════════════════════════ */

export interface TriggerSignal {
  id: string;
  ts: string; // ISO
  kind: TriggerDefinition['kind'];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  source?: string;         // e.g. incident ID, deadline ID
  description: string;
  /** Optional override for the generated event's title. */
  overrideTitle?: string;
}

const SEVERITY_RANK: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };

function meetsSeverity(signal: TriggerSignal, def: TriggerDefinition): boolean {
  if (!def.minSeverity) return true;
  return (SEVERITY_RANK[signal.severity ?? 'low'] ?? 1) >= SEVERITY_RANK[def.minSeverity];
}

export function materializeTrigger(
  signal: TriggerSignal,
  templates: EventTemplate[],
): RegulatoryEvent | null {
  const tpl = templates.find(t => t.trigger?.kind === signal.kind && meetsSeverity(signal, t.trigger));
  if (!tpl || !tpl.trigger) return null;

  const anchor = new Date(signal.ts);
  const date = addDays(anchor, tpl.trigger.daysFromTrigger);
  const iso = toISO(date);

  const domainSlug = tpl.domain.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  return {
    id: `EVT-${domainSlug}-TRIG-${signal.id}-${Date.now().toString(36)}`,
    title: signal.overrideTitle ?? `${tpl.title} — ${signal.description.slice(0, 40)}${signal.description.length > 40 ? '…' : ''}`,
    domain: tpl.domain,
    category: tpl.category,
    date: iso,
    time: tpl.recurrence.time,
    timeEnd: tpl.recurrence.timeEnd,
    cadence: 'Trigger-based',
    urgency: signal.severity === 'critical' ? 'critical' : (signal.severity === 'high' ? 'critical' : tpl.urgency),
    regulatoryDriver: tpl.regulatoryDriver,
    policyRefs: tpl.policyRefs,
    owner: tpl.owner,
    ownerRole: tpl.ownerRole,
    summary: `${tpl.summary} Triggered by: ${signal.description}`,
    processFlow: tpl.processFlow.map(s => ({ ...s, status: 'pending' as const })),
    requiredForms: tpl.requiredForms.map(f => ({ ...f, status: 'pending' as const })),
    minutes: tpl.minutes
      ? { status: 'missing' as const, dueOffsetDays: tpl.minutes.dueOffsetDays, requiredSections: tpl.minutes.requiredSections, signOffRoles: tpl.minutes.signOffRoles, assignee: tpl.minutes.assignee }
      : undefined,
    approvals: tpl.approvals,
    complianceFlags: tpl.complianceFlags,
    followUps: tpl.followUps,
    dependencies: tpl.dependencies,
    timezone: 'America/Los_Angeles',
    createdAt: new Date().toISOString(),
    sourceOfTruth: 'app',
  };
}
