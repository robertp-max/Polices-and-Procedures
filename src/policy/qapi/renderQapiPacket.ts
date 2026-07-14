/* ════════════════════════════════════════════════════════════════
   PHASE 5 — Survey-defensible QAPI packet renderer.

   Public QAPI entry points now build a PacketModel and render through the
   packet-platform renderer. The shim preserves the prior source inputs,
   honest UNKNOWN handling, synthetic provenance, and lock validation banner.
   ════════════════════════════════════════════════════════════════ */
import type {
  PacketClassification,
  PacketModel,
  PacketModelModuleInstance,
  PacketModuleId,
} from '@/policy/packets/contracts';
import { QAPI_FULL_MODULE_ORDER, getModule } from '@/policy/packets/registries/moduleRegistry';
import { SYNTHETIC_UAT_WATERMARK } from '@/policy/packets/render/chrome';
import { renderPacketModel } from '@/policy/packets/render/renderPacketModel';

import type { ClinicalDump, ValidationFinding } from './qapiTypes';
import { extractQapiRollup, type QapiRollup } from './qapiExtraction';
import { buildPersonnelAddendum, buildAddendumReference, type AddendumReference } from './personnelActionAddendum';
import { validateQapiPacketForLock } from './validateQapiPacketForLock';

export interface QapiPacketOptions {
  eventId?: string;
  workflowId?: string;
  reviewQuarter?: string;          // e.g. '2026-Q2'
  preparedBy?: string;
  reviewer?: string;
  chair?: string;
  recorder?: string;
  attendeesExpected?: string[];
  attendeesPresent?: string[];
  policyIds?: string[];
  /** Governance approvers for the lock check (name + authorityConfirmed). */
  approvers?: Array<{ role: string; name?: string; date?: string; authorityConfirmed?: boolean }>;
  /** Derived-source path: quorum line recovered from the source (e.g. "8/8 present — quorum met"). */
  quorumOverride?: string;
  /** Derived-source path: replaces the role-by-role attendee table when names are not individually structured. */
  attendanceNote?: string;
  /** Derived-source path: prominent notice that the packet was built from an unstructured dump and needs review. */
  derivedNotice?: string;
  /** Rollup paths whose value could NOT be recovered — rendered as
      "UNKNOWN — SOURCE NOT RECOVERED" instead of a false zero / "OK". */
  unknownPaths?: string[];
  /** Synthetic/UAT watermark banner (source declared itself synthetic/mock). */
  syntheticWatermark?: string;
  /** Source agency name when it is NOT Care Indeed (must not be presented as CI evidence). */
  sourceAgency?: string;
  /** Source dataset ID for provenance (e.g. "QAPI-Q2-DS-001"). */
  datasetId?: string;
}

export type QapiPacketRenderPayload = Record<string, unknown> & {
  roll: QapiRollup;
  ref: AddendumReference;
  packetId: string;
  eventId: string;
  workflowId: string;
  preparedBy: string;
  reviewer: string;
  chair: string;
  recorder: string;
  policyIds: string[];
  approvers: Array<{ role: string; name?: string; date?: string; authorityConfirmed?: boolean }>;
  quorumOverride: string | null;
  attendanceNote: string | null;
  derivedNotice: string | null;
  unknownPaths: string[];
  syntheticWatermark: string | null;
  sourceAgency: string | null;
  datasetId: string | null;
  addendumRequired: boolean;
  attendeesExpected: string[];
  attendeesPresent: string[];
  lock: {
    pass: boolean;
    statusText: string;
    findings: ValidationFinding[];
  };
};

const DEFAULT_POLICY_IDS = ['QA-PG-001', 'QA-PG-002', 'GV-GB-001'] as const;
const DEFAULT_ATTENDEES = [
  'Director of Nursing (Chair)',
  'Clinical Manager',
  'Compliance Officer',
  'Medical Director',
  'Administrator',
  'QA Coordinator',
] as const;

export function renderQapiPacketHtml(
  dump: ClinicalDump,
  eventDateInput: string,
  opts: QapiPacketOptions = {},
): string {
  const reviewQuarter = opts.reviewQuarter ?? dump.meta?.quarter;
  const roll = extractQapiRollup(dump, eventDateInput, { reviewQuarter });
  const addendum = buildPersonnelAddendum(dump, { quarter: reviewQuarter });
  return renderQapiPacketHtmlFromRollup(roll, buildAddendumReference(addendum), opts);
}

/**
 * Render the FULL survey-defensible packet from a prebuilt rollup. Used by
 * (1) the ClinicalDump path above and (2) the Brad-derived path, where the
 * rollup was recovered deterministically from an unstructured source dump
 * (any format) and carries exceptions + a derived-draft notice instead of
 * silently downgrading to a thin summary.
 */
export function renderQapiPacketHtmlFromRollup(
  roll: QapiRollup,
  ref: AddendumReference,
  opts: QapiPacketOptions = {},
): string {
  return renderPacketModel(buildQapiPacketModel(roll, ref, opts));
}

export function buildQapiPacketModel(
  roll: QapiRollup,
  ref: AddendumReference,
  opts: QapiPacketOptions = {},
): PacketModel {
  const packetId = `QAPI-PKT-${roll.window.quarterLabel.replace(/\s+/g, '-')}`;
  const addendumRequired = ref.personnelActionReviewsOpened > 0;
  const approvers = opts.approvers ?? [];
  const lock = validateQapiPacketForLock({
    packetId,
    packetType: roll.window.packetType,
    html: '',
    governanceRoles: approvers,
    rollups: {
      activeCensus: roll.census.activeCensus,
      recertCounts: roll.census.recertDue,
      highRiskRollupPresent: true,
      priorPeriodComparisonPresent: false,
      claimsTrend: false,
    },
    signatures: [],
    dateWindowViolations: [],
    addendum: { required: addendumRequired, generatedId: addendumRequired ? ref.addendumId : null },
    sourceExceptions: roll.exceptions,
  });
  const statusText = lock.pass
    ? 'VALIDATION PASSED — eligible for lock pending signatures'
    : `NOT LOCKABLE — ${lock.findings.filter((finding) => finding.severity === 'blocker' || finding.severity === 'high').length} blocking item(s)`;
  const classification: PacketClassification = opts.syntheticWatermark ? 'synthetic-uat' : 'internal';
  const expected = opts.attendeesExpected ?? [...DEFAULT_ATTENDEES];
  const present = opts.attendeesPresent ?? expected;
  const payload: QapiPacketRenderPayload = {
    roll,
    ref,
    packetId,
    eventId: opts.eventId ?? '—',
    workflowId: opts.workflowId ?? '—',
    preparedBy: opts.preparedBy ?? '—',
    reviewer: opts.reviewer ?? '—',
    chair: opts.chair ?? '—',
    recorder: opts.recorder ?? '—',
    policyIds: opts.policyIds ?? [...DEFAULT_POLICY_IDS],
    approvers,
    quorumOverride: opts.quorumOverride ?? null,
    attendanceNote: opts.attendanceNote ?? null,
    derivedNotice: opts.derivedNotice ?? null,
    unknownPaths: opts.unknownPaths ?? [],
    syntheticWatermark: opts.syntheticWatermark ?? null,
    sourceAgency: opts.sourceAgency ?? null,
    datasetId: opts.datasetId ?? null,
    addendumRequired,
    attendeesExpected: expected,
    attendeesPresent: present,
    lock: {
      pass: lock.pass,
      statusText,
      findings: lock.findings,
    },
  };

  return {
    identity: {
      packetInstanceId: packetId,
      packetId,
      packetVersion: 1,
      contentHash: null,
      agencyId: opts.sourceAgency ?? 'Care Indeed Home Health',
      eventFamilyId: 'qapi_meeting',
      eventInstanceId: opts.eventId ?? `${packetId}:event`,
      workflowId: opts.workflowId ?? 'QA-WF-03',
      workflowInstanceId: opts.workflowId ?? `${packetId}:workflow`,
      packetTemplateId: 'qapi-quarterly',
      archetypeId: 'analytical-report',
      subtype: roll.window.packetType,
      reportingPeriodStart: roll.window.quarterStart,
      reportingPeriodEnd: roll.window.quarterEnd,
      dataThroughDate: roll.window.dataThroughDate,
      status: 'DRAFT_GENERATED',
    },
    renderingProfileId: 'qapi-analytical',
    classification,
    handlingNotice: opts.syntheticWatermark ? SYNTHETIC_UAT_WATERMARK : null,
    modules: buildQapiModules(packetId, payload),
    pagePlan: null,
  };
}

function buildQapiModules(
  packetId: string,
  payload: QapiPacketRenderPayload,
): PacketModelModuleInstance[] {
  return QAPI_FULL_MODULE_ORDER.map((moduleId, index) => {
    const descriptor = getModule(moduleId);
    return {
      moduleInstanceId: `${packetId}:${moduleId}`,
      moduleId: moduleId as PacketModuleId,
      title: descriptor.title,
      order: index + 1,
      status: 'complete',
      payload,
      contentHash: null,
    };
  });
}
