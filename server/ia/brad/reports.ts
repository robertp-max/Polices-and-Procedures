import type { BradSourceSnapshot } from './sourceSnapshot.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad report content generators (pure functions: snapshot → report content).
   These produce the CONTENT payloads stored inside append-only BradGenerated*
   objects. They read the source snapshot; they never mutate source data.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface EventReadinessReportContent {
  reportKind: 'event-readiness';
  eventId: string;
  eventTitle: string;
  eventStatus: string;
  missingTasks: string[];
  missingEvidence: string[];
  missingForms: string[];
  missingSignatures: string[];
  policyReferences: string[];
  workflowReference?: string;
  auditReadinessScore: number;   // 0..100
  recommendedNextActions: string[];
  generatedAt: string;
}

export interface QapiPacketReportContent {
  reportKind: 'qapi-packet';
  eventId: string;
  agenda: string[];
  requiredMetrics: string[];
  openPips: string[];
  incidentSummary: string[];
  priorMinutesCarryover: string[];
  requiredAttendees: string[];
  requiredSignatures: string[];
  evidenceChecklist: string[];
  generatedAt: string;
}

export interface BradActionReportContent {
  reportKind: 'brad-action';
  inspected: string[];
  generated: string[];
  updated: string[];
  refusedToUpdate: string[];
  blockedWriteReasons: string[];
  runtimeMode: string;
  actorId: string;
  approverId?: string;
  timestamp: string;
  objectIdsCreated: string[];
  eventIdsAffected: string[];
}

function pct(n: number, d: number): number {
  if (d <= 0) return 100;
  return Math.round((n / d) * 100);
}

export function generateEventReadinessReport(s: BradSourceSnapshot): EventReadinessReportContent {
  const missingTasks = s.tasks.filter((t) => t.status !== 'complete').map((t) => t.title);
  const missingSignatures = s.signatures.filter((sig) => !sig.signed).map((sig) => sig.role);
  // Missing forms/evidence: heuristic — required vs present is encoded by the
  // caller's snapshot; here we surface required ids and unmet completion items.
  const totalGates = s.tasks.length + s.signatures.length + s.requiredFormIds.length;
  const metGates =
    s.tasks.filter((t) => t.status === 'complete').length +
    s.signatures.filter((sig) => sig.signed).length +
    s.requiredFormIds.length; // forms presence assumed when listed as required+available
  const auditReadinessScore = Math.max(0, Math.min(100, pct(metGates, totalGates)));

  const recommendedNextActions: string[] = [];
  if (missingTasks.length) recommendedNextActions.push(`Complete ${missingTasks.length} open task(s).`);
  if (missingSignatures.length) recommendedNextActions.push(`Collect ${missingSignatures.length} required signature(s).`);
  if (!recommendedNextActions.length) recommendedNextActions.push('Event appears ready; verify and finalize with a signer.');

  return {
    reportKind: 'event-readiness',
    eventId: s.eventId,
    eventTitle: s.eventTitle,
    eventStatus: missingTasks.length || missingSignatures.length ? 'in-progress' : 'ready-for-review',
    missingTasks,
    missingEvidence: s.evidenceItemIds.length === 0 ? ['No evidence items captured yet.'] : [],
    missingForms: s.requiredFormIds.length === 0 ? ['No required forms attached.'] : [],
    missingSignatures,
    policyReferences: s.policyIds,
    workflowReference: s.workflowId,
    auditReadinessScore,
    recommendedNextActions,
    generatedAt: new Date().toISOString(),
  };
}

export function generateQapiPacketReport(s: BradSourceSnapshot): QapiPacketReportContent {
  return {
    reportKind: 'qapi-packet',
    eventId: s.eventId,
    agenda: s.agenda,
    requiredMetrics: (s.metrics ?? []).map((m) => m.name),
    openPips: (s.pips ?? []).filter((p) => p.status !== 'closed').map((p) => `${p.id}: ${p.title}`),
    incidentSummary: (s.incidents ?? []).map((i) => `[${i.severity}] ${i.type}: ${i.summary}`),
    priorMinutesCarryover: s.priorMinutesCarryover ?? [],
    requiredAttendees: s.requiredRoles,
    requiredSignatures: s.signatures.map((sig) => sig.role),
    evidenceChecklist: s.evidenceItemIds,
    generatedAt: new Date().toISOString(),
  };
}

export function buildBradActionReport(params: Omit<BradActionReportContent, 'reportKind' | 'timestamp'>): BradActionReportContent {
  return { reportKind: 'brad-action', timestamp: new Date().toISOString(), ...params };
}
