import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type {
  EventTemplate, GenerationRequest, GenerationResult,
} from './types';
import { occurrences, parseISO, toISO } from './scheduler';
import { detectConflict, resolveConflict } from './conflictResolver';
import { resolveDependencies, topoSortTemplates } from './dependencyResolver';

/* ═══════════════════════════════════════════════════════════════
   Annual Generator
   ----------------------------------------------------------------
   Pipeline:
     1. Topo-sort templates by dependency chain.
     2. For each template, enumerate occurrences in the requested
        window using the recurrence rule.
     3. Materialize a RegulatoryEvent instance per occurrence.
     4. Detect + resolve conflicts against pool (existing + new).
     5. Re-wire dependsOn from template ids → concrete event ids.
     6. Return a structured result with skip/shift diagnostics.
   ═══════════════════════════════════════════════════════════════ */

function endOfDay(hhmm?: string, durationMin = 60): string | undefined {
  if (!hhmm) return undefined;
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + (m || 0) + durationMin;
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function instanceFromTemplate(template: EventTemplate, date: Date): RegulatoryEvent {
  const iso = toISO(date);
  const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const domainSlug = template.domain.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);

  const base: RegulatoryEvent = {
    id: `EVT-${domainSlug}-${iso.replace(/-/g, '')}-${template.id.slice(-6)}`,
    title: template.title,
    domain: template.domain,
    category: template.category,
    date: iso,
    time: template.recurrence.time,
    timeEnd: template.recurrence.timeEnd ?? endOfDay(template.recurrence.time, template.recurrence.durationMin),
    allDay: template.allDay,
    cadence: template.cadence,
    urgency: template.urgency,
    regulatoryDriver: template.regulatoryDriver,
    policyRefs: template.policyRefs,
    owner: template.owner,
    ownerRole: template.ownerRole,
    location: template.location,
    summary: template.summary,
    processFlow: template.processFlow.map(s => ({ ...s, status: 'pending' as const })),
    requiredForms: template.requiredForms.map(f => ({ ...f, status: 'pending' as const })),
    minutes: template.minutes
      ? { status: 'missing' as const, dueOffsetDays: template.minutes.dueOffsetDays, requiredSections: template.minutes.requiredSections, signOffRoles: template.minutes.signOffRoles, assignee: template.minutes.assignee }
      : undefined,
    agenda: template.agenda,
    approvals: template.approvals,
    complianceFlags: template.complianceFlags,
    followUps: template.followUps,
    dependencies: template.dependencies,
    timezone: template.recurrence.timezone ?? 'America/Los_Angeles',
    mandateType: template.mandateType,
    createdAt: new Date().toISOString(),
    sourceOfTruth: 'app',
  };

  // Title decoration
  const decorated: RegulatoryEvent = {
    ...base,
    title: ['weekly', 'bi-weekly', 'monthly'].includes(template.recurrence.frequency)
      ? `${template.title} — ${monthLabel}`
      : base.title,
  };

  // Set reporting scope for QAPI alignment (least invasive)
  const dec = decorated as RegulatoryEvent & {
    scopeType?: string;
    reportingPeriodStart?: string;
    reportingPeriodEnd?: string;
    executionWindowStart?: string;
    executionWindowEnd?: string;
    scheduledDate?: string;
    preferredScheduleRule?: string;
    scopeLabel?: string;
  };

  if (template.id === 'TPL-QA-MONTHLY-QAPI') {
    const d = new Date(iso);
    const prevMonth = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const prevEnd = new Date(d.getFullYear(), d.getMonth(), 0);
    dec.scopeType = 'previous_calendar_month';
    dec.reportingPeriodStart = toISO(prevMonth);
    dec.reportingPeriodEnd = toISO(prevEnd);
    dec.executionWindowStart = iso;
    dec.executionWindowEnd = iso;
    dec.scheduledDate = iso;
    dec.preferredScheduleRule = template.preferredScheduleRule || 'first Friday of the month at 10:00 AM';
    dec.scopeLabel = `Previous calendar month (${toISO(prevMonth)} to ${toISO(prevEnd)})`;
  } else if (template.id === 'TPL-GV-QUARTERLY-GB') {
    const d = new Date(iso);
    const q = Math.floor((d.getMonth()) / 3);
    const prevQStartMonth = (q * 3) - 3;
    const prevStart = new Date(d.getFullYear() - (prevQStartMonth < 0 ? 1 : 0), (prevQStartMonth + 12) % 12, 1);
    const prevEnd = new Date(prevStart.getFullYear(), prevStart.getMonth() + 3, 0);
    dec.scopeType = 'previous_calendar_quarter';
    dec.reportingPeriodStart = toISO(prevStart);
    dec.reportingPeriodEnd = toISO(prevEnd);
    dec.executionWindowStart = iso;
    dec.executionWindowEnd = iso;
    dec.scheduledDate = iso;
    dec.preferredScheduleRule = template.preferredScheduleRule || 'second Friday of Q anchor months at 10:00 AM';
    dec.scopeLabel = `Previous calendar quarter (${toISO(prevStart)} to ${toISO(prevEnd)})`;
  }

  // Stash template id for downstream dependency resolution.
  (decorated as RegulatoryEvent & { _templateId?: string })._templateId = template.id;

  return template.decorate ? template.decorate(decorated, date) : decorated;
}

/* ─── Main entry point ────────────────────────────────── */

export function generateEvents(req: GenerationRequest): GenerationResult {
  const sortedTemplates = topoSortTemplates(req.templates);
  const start = parseISO(req.rangeStart);
  const end   = parseISO(req.rangeEnd);

  const existing = req.existingEvents ?? [];
  const existingKeys = new Set(existing.map(e => `${(e as RegulatoryEvent & { _templateId?: string })._templateId ?? e.id}::${e.date}`));

  const generated: RegulatoryEvent[] = [];
  const skipped: GenerationResult['skipped'] = [];
  const conflicts: GenerationResult['conflicts'] = [];

  for (const tpl of sortedTemplates) {
    const dates = occurrences(tpl.recurrence, start, end);
    for (const d of dates) {
      const inst = instanceFromTemplate(tpl, d);
      const key = `${tpl.id}::${inst.date}`;
      if (existingKeys.has(key)) {
        skipped.push({ templateId: tpl.id, date: inst.date, reason: 'Already present in existing events (de-dupe).' });
        continue;
      }
      const pool = [...existing, ...generated];
      const conflict = detectConflict(inst, pool);
      if (conflict.conflicts.length > 0) {
        const shiftTo = resolveConflict(inst, pool, tpl.recurrence.flexDays ?? 3);
        if (shiftTo) {
          conflicts.push({ eventId: inst.id, collidesWith: conflict.conflicts[0].id, shiftedTo: shiftTo });
          inst.date = shiftTo;
          generated.push(inst);
        } else {
          skipped.push({ templateId: tpl.id, date: inst.date, reason: `Unresolvable conflict: ${conflict.reason ?? 'overlap'}` });
        }
      } else {
        generated.push(inst);
      }
    }
  }

  const rewired = resolveDependencies(generated, req.templates, { minLeadDays: 1 });

  // Clean up the transient _templateId field (keep types clean for callers).
  const cleaned = rewired.map(ev => {
    const { _templateId: _discard, ...rest } = ev as RegulatoryEvent & { _templateId?: string };
    void _discard;
    return rest as RegulatoryEvent;
  });

  const byDomain: Record<string, number> = {};
  const byFrequency: Record<string, number> = {};
  for (const e of cleaned) {
    byDomain[e.domain] = (byDomain[e.domain] ?? 0) + 1;
  }
  for (const t of sortedTemplates) {
    const count = cleaned.filter(e => e.category === t.category && e.domain === t.domain).length;
    byFrequency[t.recurrence.frequency] = (byFrequency[t.recurrence.frequency] ?? 0) + count;
  }

  return {
    generated: cleaned,
    skipped,
    conflicts,
    summary: {
      totalTemplates: sortedTemplates.length,
      totalEmitted: cleaned.length,
      totalSkipped: skipped.length,
      totalConflicts: conflicts.length,
      byDomain,
      byFrequency,
    },
  };
}
