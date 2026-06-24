import type { BradSourceSnapshot } from './sourceSnapshot.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad event-packet + QAPI-minutes content generators.
   Pure functions producing CONTENT payloads for append-only BradGenerated*
   objects. Minutes are always DRAFT and never marked signed/finalized.
   ═══════════════════════════════════════════════════════════════════════════ */

export const DRAFT_BANNER = 'DRAFT — BRAD GENERATED — REQUIRES HUMAN REVIEW AND SIGNATURE';

export interface GeneralEventPacketContent {
  packetKind: 'general-event';
  coverSheet: string;
  eventTitle: string;
  eventId: string;
  workflowId?: string;
  meetingDateTime?: string;
  attendees: string[];
  requiredRoles: string[];
  agenda: string[];
  requiredForms: string[];
  policyReferences: string[];
  openTasks: string[];
  evidenceChecklist: string[];
  signatureRequirements: string[];
  followUpActions: string[];
  packetVersion: string;
  generatedAt: string;
}

export interface QapiEventPacketContent extends Omit<GeneralEventPacketContent, 'packetKind'> {
  packetKind: 'qapi-event';
  requiredMetrics: string[];
  openPips: string[];
  incidentSummary: string[];
}

export interface QapiMinutesContent {
  minutesKind: 'qapi-minutes';
  draftBanner: string;
  finalized: false;            // type-level guarantee — Brad never finalizes
  meetingTitle: string;
  meetingDateTime?: string;
  attendees: string[];
  quorumStatus?: string;
  agendaItems: string[];
  metricsReviewed: string[];
  incidentsReviewed: string[];
  infectionSafetyTrends: string[];
  pipsReviewed: string[];
  correctiveActions: string[];
  decisionsMade: string[];
  assignedFollowUps: string[];
  dueDates: string[];
  nextMeetingDate?: string;
  requiredApprovals: string[];
  generatedAt: string;
}

const PACKET_VERSION = 'v1';

export function generateGeneralEventPacket(s: BradSourceSnapshot): GeneralEventPacketContent {
  return {
    packetKind: 'general-event',
    coverSheet: `Event Packet — ${s.eventTitle} (${s.eventId})`,
    eventTitle: s.eventTitle,
    eventId: s.eventId,
    workflowId: s.workflowId,
    meetingDateTime: s.meetingDateTime,
    attendees: s.attendees,
    requiredRoles: s.requiredRoles,
    agenda: s.agenda,
    requiredForms: s.requiredFormIds,
    policyReferences: s.policyIds,
    openTasks: s.tasks.filter((t) => t.status !== 'complete').map((t) => t.title),
    evidenceChecklist: s.evidenceItemIds,
    signatureRequirements: s.signatures.map((sig) => `${sig.role}${sig.signed ? ' (signed)' : ' (pending)'}`),
    followUpActions: s.followUps,
    packetVersion: PACKET_VERSION,
    generatedAt: new Date().toISOString(),
  };
}

export function generateQapiEventPacket(s: BradSourceSnapshot): QapiEventPacketContent {
  const base = generateGeneralEventPacket(s);
  return {
    ...base,
    packetKind: 'qapi-event',
    requiredMetrics: (s.metrics ?? []).map((m) => m.name),
    openPips: (s.pips ?? []).filter((p) => p.status !== 'closed').map((p) => `${p.id}: ${p.title}`),
    incidentSummary: (s.incidents ?? []).map((i) => `[${i.severity}] ${i.type}: ${i.summary}`),
  };
}

export function generateQapiMinutesDraft(s: BradSourceSnapshot): QapiMinutesContent {
  return {
    minutesKind: 'qapi-minutes',
    draftBanner: DRAFT_BANNER,
    finalized: false,
    meetingTitle: s.eventTitle,
    meetingDateTime: s.meetingDateTime,
    attendees: s.attendees,
    quorumStatus: s.requiredRoles.length
      ? `${s.attendees.length}/${s.requiredRoles.length} required roles present`
      : undefined,
    agendaItems: s.agenda,
    metricsReviewed: (s.metrics ?? []).map((m) => `${m.name}${m.value !== undefined ? `: ${m.value}` : ''}`),
    incidentsReviewed: (s.incidents ?? []).map((i) => `[${i.severity}] ${i.type}: ${i.summary}`),
    infectionSafetyTrends: s.infectionSafetyTrends ?? [],
    pipsReviewed: (s.pips ?? []).map((p) => `${p.id}: ${p.title} (${p.status})`),
    correctiveActions: [],
    decisionsMade: [],
    assignedFollowUps: s.followUps,
    dueDates: [],
    nextMeetingDate: s.nextMeetingDate,
    requiredApprovals: s.signatures.map((sig) => sig.role),
    generatedAt: new Date().toISOString(),
  };
}
