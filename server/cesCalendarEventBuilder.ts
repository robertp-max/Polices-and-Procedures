import type { PlannerEventPayload } from './mappers.js';
import {
  absAuditModeUrl,
  absEventSwimlaneUrl,
  absEventWorkspaceUrl,
  absEvidenceCenterUrl,
  absPolicyUrl,
  absWorkflowUrl,
  buildAuditModePath,
  buildEventSwimlanePath,
  buildEventWorkspacePath,
  buildEvidenceCenterPath,
  buildWorkflowSwimlanePath,
} from './cesCalendarRoutes.js';

/* ═══════════════════════════════════════════════════════════════
   CES Calendar event description + extendedProperties builder.
   Produces human-readable Google Calendar descriptions and a
   machine-readable private metadata bag. NON-PHI only.
   ═══════════════════════════════════════════════════════════════ */

export interface PolicyRefEntry {
  id: string;
  title?: string;
}

export interface CesCalendarEnrichment {
  eventId: string;
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  timeEnd?: string;
  allDay?: boolean;
  domain?: string;
  category?: string;
  cadence?: string;
  location?: string;
  workflowId?: string;
  workflowTitle?: string;
  policyRefs?: PolicyRefEntry[];
  requiredForms?: string[];
  requiredSignerRoles?: string[];
  requiredAttendeeRoles?: string[];
  requiredTasks?: string[];
  requiredEvidence?: string[];
  agenda?: string[];
  completionExpectations?: string[];
  driveFolderId?: string;
  driveFolderUrl?: string;
  env?: 'SANDBOX' | 'PROD';
  noPhi?: boolean;
  mockMarker?: string;
  ownerRole?: string;
  status?: string;
  mandateType?: string;
  regulatoryDriver?: string;
  auditRisk?: string;
}

/** Known CES event enrichments — extend as events are onboarded. */
const CES_EVENT_ENRICHMENTS: Record<string, CesCalendarEnrichment> = {
  'qapi_meeting-20260609-10': {
    eventId: 'qapi_meeting-20260609-10',
    title: 'QAPI Committee Meeting',
    date: '2026-06-09',
    time: '10:00',
    timeEnd: '12:00',
    domain: 'QAPI',
    category: 'committee',
    cadence: 'Monthly',
    location: 'Main Office / Conference Room A',
    workflowId: 'TPL-QA-MONTHLY-QAPI',
    workflowTitle: 'Monthly QAPI Committee',
    policyRefs: [{ id: 'QA-PG-001', title: 'QAPI Program Governance' }],
    requiredForms: [
      'QAPI Agenda',
      'QAPI Metrics Report',
      'Active PIP Status',
      'QAPI Meeting Minutes',
    ],
    requiredSignerRoles: [
      'QAPI Committee Chair',
      'Administrator / Governing Body reviewer if required by workflow',
    ],
    requiredAttendeeRoles: [
      'QAPI Coordinator',
      'Director of Nursing',
      'Clinical Manager',
      'Administrator or designee',
    ],
    requiredTasks: [
      'Pull metrics',
      'Assemble packet',
      'Hold committee meeting',
      'Finalize minutes',
      'Package GB summary',
    ],
    requiredEvidence: [
      'QAPI Agenda',
      'QAPI Metrics Report',
      'Active PIP Status',
      'QAPI Meeting Minutes',
      'Governing Body Summary Package',
    ],
    agenda: [
      'Attendance / quorum',
      'Prior minutes review',
      'Metrics review',
      'Active PIP status',
      'Infection control / risk trends',
      'Open corrective actions',
      'Governing Body summary package',
      'Signature / certification',
    ],
    completionExpectations: [
      'All required evidence uploaded to Drive',
      'Minutes signed by QAPI Committee Chair',
      'GB summary package prepared for next governing body meeting',
    ],
    driveFolderId: '1BVjBzFqLDVUHibfPXUz4vA1soJxUJyGR',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1BVjBzFqLDVUHibfPXUz4vA1soJxUJyGR',
    env: 'SANDBOX',
    noPhi: true,
    mockMarker: 'MOCK TEST EVENT — NO PHI — JUNE 2026 MONTHLY QAPI/CES E2E TEST',
    ownerRole: 'QAPI Coordinator',
    status: 'scheduled',
    mandateType: 'federal-required',
    regulatoryDriver: 'CoP §484.65 QAPI',
    auditRisk: 'critical',
  },
};

export function getCesEnrichment(eventId: string): CesCalendarEnrichment | null {
  return CES_EVENT_ENRICHMENTS[eventId] ?? null;
}

export function listCesEnrichmentIds(): string[] {
  return Object.keys(CES_EVENT_ENRICHMENTS);
}

function bulletLines(items: string[] | undefined, prefix = '- '): string[] {
  if (!items?.length) return [];
  return items.map(item => `${prefix}${item}`);
}

function numberedLines(items: string[] | undefined): string[] {
  if (!items?.length) return [];
  return items.map((item, i) => `${i + 1}. ${item}`);
}

/**
 * Build a concise, human-readable Google Calendar description for a CES event.
 */
export function buildCesCalendarDescription(enrichment: CesCalendarEnrichment): string {
  const eventId = enrichment.eventId;
  const workflowId = enrichment.workflowId;
  const policySection = (enrichment.policyRefs ?? [])
    .map(p => `${p.id}${p.title ? ` — ${p.title}` : ''}`)
    .join('\n');

  const lines: string[] = [
    'CARE INDEED HOME HEALTH — CES EVENT',
    '',
    'Event:',
    enrichment.title,
    '',
    'App Event ID:',
    eventId,
  ];

  if (workflowId) {
    lines.push('', 'Workflow:', `${workflowId}${enrichment.workflowTitle ? ` — ${enrichment.workflowTitle}` : ''}`);
  }

  if (policySection) {
    lines.push('', 'Policies / PPs:', policySection);
  }

  if (enrichment.requiredForms?.length) {
    lines.push('', 'Required Forms:', ...bulletLines(enrichment.requiredForms));
  }

  if (enrichment.requiredSignerRoles?.length) {
    lines.push('', 'Required Signer Roles:', ...bulletLines(enrichment.requiredSignerRoles));
  }

  if (enrichment.requiredAttendeeRoles?.length) {
    lines.push('', 'Required Attendee Roles:', ...bulletLines(enrichment.requiredAttendeeRoles));
  }

  if (enrichment.requiredTasks?.length) {
    lines.push('', 'Required Tasks:', ...bulletLines(enrichment.requiredTasks));
  }

  if (enrichment.requiredEvidence?.length) {
    lines.push('', 'Required Evidence:', ...bulletLines(enrichment.requiredEvidence));
  }

  if (enrichment.agenda?.length) {
    lines.push('', 'Agenda:', ...numberedLines(enrichment.agenda));
  }

  if (enrichment.completionExpectations?.length) {
    lines.push('', 'Completion / Certification:', ...bulletLines(enrichment.completionExpectations));
  }

  lines.push(
    '',
    'Links:',
    `- Event Workspace: ${absEventWorkspaceUrl(eventId)}`,
    `- Swimlane: ${workflowId ? absEventSwimlaneUrl(eventId, workflowId) : absEventSwimlaneUrl(eventId)}`,
    workflowId ? `- Workflow: ${absWorkflowUrl(workflowId, eventId)}` : '',
    `- Evidence Center: ${absEvidenceCenterUrl(eventId)}`,
    `- Audit Mode: ${absAuditModeUrl(eventId)}`,
    enrichment.driveFolderUrl ? `- Drive Evidence Folder: ${enrichment.driveFolderUrl}` : '',
    ...(enrichment.policyRefs ?? []).map(p => `- Policy ${p.id}: ${absPolicyUrl(p.id)}`),
    '',
    'Safety:',
    enrichment.mockMarker ?? (enrichment.noPhi ? 'NO PHI — role-based mock/test event' : 'Role-based compliance event — no patient identifiers'),
    '',
    '[CI-CES-EVENT]',
    `event_id=${eventId}`,
    `source=CI_CES`,
    `env=${enrichment.env ?? 'PROD'}`,
    enrichment.noPhi ? 'noPhi=true' : '',
  );

  return lines.filter(line => line !== '').join('\n');
}

/** Machine-readable extendedProperties.private bag for CES Calendar events. */
export function buildCesExtendedProperties(
  enrichment: CesCalendarEnrichment,
  extras: { hash?: string; version?: number } = {},
): Record<string, string> {
  const eventId = enrichment.eventId;
  const workflowId = enrichment.workflowId;
  const out: Record<string, string> = {
    event_id: eventId,
    appEventId: eventId,
    source: 'CI_CES',
    env: enrichment.env ?? 'PROD',
  };

  const set = (k: string, v?: string | number | boolean) => {
    if (v == null || v === '') return;
    out[k] = String(v);
  };

  set('workflowId', workflowId);
  set('policyRefs', (enrichment.policyRefs ?? []).map(p => p.id).join(','));
  set('requiredForms', (enrichment.requiredForms ?? []).join('|'));
  set('requiredSignerRoles', (enrichment.requiredSignerRoles ?? []).join('|'));
  set('requiredAttendeeRoles', (enrichment.requiredAttendeeRoles ?? []).join('|'));
  set('requiredTasks', (enrichment.requiredTasks ?? []).join('|'));
  set('requiredEvidence', (enrichment.requiredEvidence ?? []).join('|'));
  set('agenda', (enrichment.agenda ?? []).join('|'));
  set('completionExpectations', (enrichment.completionExpectations ?? []).join('|'));
  set('eventWorkspacePath', buildEventWorkspacePath(eventId));
  set('swimlanePath', workflowId ? buildEventSwimlanePath(eventId, workflowId) : buildEventSwimlanePath(eventId));
  set('workflowPath', workflowId ? buildWorkflowSwimlanePath(workflowId, eventId) : undefined);
  set('evidenceCenterPath', buildEvidenceCenterPath(eventId));
  set('auditModePath', buildAuditModePath(eventId));
  set('driveFolderId', enrichment.driveFolderId);
  set('driveFolderUrl', enrichment.driveFolderUrl);
  set('domain', enrichment.domain);
  set('category', enrichment.category);
  set('cadence', enrichment.cadence);
  set('ownerRole', enrichment.ownerRole);
  set('status', enrichment.status);
  set('mandateType', enrichment.mandateType);
  set('regulatoryDriver', enrichment.regulatoryDriver);
  set('auditRisk', enrichment.auditRisk);
  if (enrichment.noPhi) set('noPhi', 'true');
  set('hash', extras.hash);
  set('version', extras.version != null ? String(extras.version) : undefined);

  return out;
}

/** Merge CES enrichment into a PlannerEventPayload for sync/create. */
export function buildEnrichedPlannerPayload(
  enrichment: CesCalendarEnrichment,
  overrides: Partial<PlannerEventPayload> = {},
): PlannerEventPayload {
  return {
    event_id: enrichment.eventId,
    appEventId: enrichment.eventId,
    title: enrichment.title,
    date: enrichment.date,
    endDate: enrichment.endDate,
    time: enrichment.time,
    timeEnd: enrichment.timeEnd,
    allDay: enrichment.allDay,
    domain: enrichment.domain,
    category: enrichment.category,
    cadence: enrichment.cadence,
    location: enrichment.location,
    policyRefs: (enrichment.policyRefs ?? []).map(p => p.id),
    ownerRole: enrichment.ownerRole,
    owner: enrichment.ownerRole,
    status: enrichment.status,
    mandateType: enrichment.mandateType,
    regulatoryDriver: enrichment.regulatoryDriver,
    auditRisk: enrichment.auditRisk,
    env: enrichment.env ?? 'SANDBOX',
    description: buildCesCalendarDescription(enrichment),
    ...overrides,
  };
}

/** Resolve enrichment for an event — registry first, then payload hints. */
export function resolveEnrichment(
  eventId: string,
  payload?: Partial<PlannerEventPayload>,
): CesCalendarEnrichment | null {
  const known = getCesEnrichment(eventId);
  if (known) return known;
  if (!payload?.title || !payload?.date) return null;
  return {
    eventId,
    title: payload.title,
    date: payload.date,
    endDate: payload.endDate,
    time: payload.time,
    timeEnd: payload.timeEnd,
    allDay: payload.allDay,
    domain: payload.domain,
    category: payload.category,
    cadence: payload.cadence,
    location: payload.location,
    policyRefs: (payload.policyRefs ?? []).map(id => ({ id })),
    env: payload.env,
    ownerRole: payload.ownerRole,
    status: payload.status,
    mandateType: payload.mandateType,
    regulatoryDriver: payload.regulatoryDriver,
    auditRisk: payload.auditRisk,
  };
}

/** Keys allowed in Calendar extendedProperties for CES enrichment. */
export const CES_EXT_PROP_ALLOWLIST = new Set([
  'event_id', 'appEventId', 'source', 'env', 'noPhi',
  'workflowId', 'policyRefs', 'requiredForms', 'requiredSignerRoles',
  'requiredAttendeeRoles', 'requiredTasks', 'requiredEvidence', 'agenda',
  'completionExpectations',
  'eventWorkspacePath', 'swimlanePath', 'workflowPath',
  'evidenceCenterPath', 'auditModePath',
  'driveFolderId', 'driveFolderUrl',
  'domain', 'category', 'cadence', 'ownerRole', 'status',
  'mandateType', 'regulatoryDriver', 'auditRisk',
  'hash', 'version',
  // evidence sync keys (shared with googleEvidence)
  'evidencePackageId', 'swimlaneRoute', 'evidenceRoute', 'artifactRoute',
  'eventStatus', 'auditReadyPct', 'lastEvidenceSyncAt',
  'evidenceDriveFolderId', 'evidenceAttachmentCount',
  // legacy CI_ENGINE compat
  'owner', 'evidenceStatus', 'completionState',
]);