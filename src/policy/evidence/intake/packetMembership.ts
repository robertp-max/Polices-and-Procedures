/**
 * Packet membership & binding resolver (Sections 10 + 11).
 *
 * One canonical evidence record can support multiple packet contexts. Example:
 * a complaint created in January supports
 *   - the January monthly QAPI packet
 *   - the Q1 quarterly QAPI packet
 *   - the complaint/grievance investigation packet
 * via packet-membership records (NOT duplicate canonical originals). Physical
 * Drive copies are created only when a packet-folder workflow needs the file in
 * the packet folder, and always retain canonicalEvidenceId provenance.
 *
 * Packet IDs are deterministic (`EPS-{packetTypeId}-{periodKey}`) so re-running
 * packet generation never creates duplicate memberships (idempotency invariant).
 */

import {
  EVIDENCE_PACKET_TYPES,
  EVIDENCE_PACKET_TYPES_BY_ID,
  type EvidencePacketType,
} from '../packetStudio/evidencePacketTypes';
import type {
  CanonicalEvidence,
  EvidenceClassification,
  EvidencePacketBinding,
  EvidencePacketMembership,
} from './intakeModel';

/** Classification → packet types it feeds (beyond the always-on QAPI rollups). */
const CLASSIFICATION_PACKETS: Partial<Record<EvidenceClassification, string[]>> = {
  complaints_grievances: ['complaint-grievance-investigation'],
  incident_adverse_event: ['incident-adverse-event-review', 'patient-safety-committee'],
  abuse_neglect_exploitation: ['incident-adverse-event-review', 'patient-safety-committee'],
  infection_control: ['infection-control-committee'],
  infection_surveillance: ['infection-surveillance-monthly', 'infection-control-committee'],
  qapi_metrics: ['annual-qapi-program-evaluation'],
  qapi_minutes: [],
  qapi_agenda: [],
  qapi_action_items: [],
  active_pip: ['annual-qapi-program-evaluation'],
  chart_audit: ['clinical-record-review'],
  poc_audit: ['plan-of-care-audit', 'clinical-record-review'],
  oasis_accuracy: ['oasis-accuracy-audit', 'clinical-record-review'],
  medication_reconciliation: ['medication-reconciliation-audit'],
  physician_orders: ['physician-signature-tracking'],
  personnel_file: ['personnel-file-audit'],
  competency_validation: ['competency-validation'],
  training_attestation: ['staff-training-inservice'],
  hipaa_training: ['hipaa-training-completion'],
  tb_screening: ['tb-employee-health'],
  employee_health: ['tb-employee-health'],
  emergency_preparedness: ['emergency-preparedness-drill'],
  governing_body: ['governing-body-board'],
  policy_review: ['policy-annual-review'],
  oig_sam_exclusion: ['oig-sam-exclusion-check'],
  billing_claims: ['claims-billing-compliance'],
  vulnerability_scan: ['vulnerability-scan-it-security'],
  audit_export: ['audit-mode-survey'],
};

/** Classifications that always roll into the QAPI monthly + quarterly packets. */
const QAPI_ROLLUP_CLASSIFICATIONS = new Set<EvidenceClassification>([
  'complaints_grievances', 'incident_adverse_event', 'abuse_neglect_exploitation',
  'infection_control', 'infection_surveillance', 'qapi_metrics', 'qapi_minutes',
  'qapi_agenda', 'qapi_action_items', 'active_pip', 'chart_audit', 'poc_audit',
  'oasis_accuracy', 'medication_reconciliation',
]);

/** Deterministic packet id for a packet type within a filing period. */
export function buildPacketId(packetTypeId: string, periodKey: string): string {
  return `EPS-${packetTypeId}-${periodKey}`;
}

function resolveEvidenceSectionId(packet: EvidencePacketType | undefined, classification: string): string {
  if (!packet) return `intake-${classification}`;
  const evidenceSection = packet.packetSections.find((s) => s.sourceType === 'evidence');
  return evidenceSection?.sectionId ?? `${packet.packetTypeId}-evidence-intake`;
}

export interface MembershipContext {
  /** Optional CES event/workflow/swimlane this batch is bound to. */
  eventId?: string;
  workflowId?: string;
  swimlaneId?: string;
  createdBy: string;
}

/**
 * Resolve all packet memberships an item of canonical evidence should belong to,
 * based on its filing period (monthly + quarterly) and classification. Memberships
 * are suggested (human approves before inclusion). Deterministic — safe to rerun.
 */
export function resolvePacketMembershipsForEvidence(
  evidence: CanonicalEvidence,
  ctx: MembershipContext,
): EvidencePacketMembership[] {
  const memberships: EvidencePacketMembership[] = [];
  const seen = new Set<string>();
  const eventId = ctx.eventId ?? evidence.linkedEventIds[0] ?? `period:${evidence.filingPeriodKey}`;

  const add = (packetTypeId: string, periodKey: string, reason: string) => {
    const packet = EVIDENCE_PACKET_TYPES_BY_ID.get(packetTypeId);
    const packetId = buildPacketId(packetTypeId, periodKey);
    const sectionId = resolveEvidenceSectionId(packet, evidence.classification);
    const key = `${packetId}::${sectionId}`;
    if (seen.has(key)) return;
    seen.add(key);
    memberships.push({
      membershipId: `MEM-${evidence.evidenceId}-${packetId}`,
      canonicalEvidenceId: evidence.evidenceId,
      packetId,
      eventId,
      workflowId: ctx.workflowId,
      swimlaneId: ctx.swimlaneId,
      packetSectionId: sectionId,
      inclusionReason: reason,
      inclusionStatus: 'suggested',
      createdBy: ctx.createdBy,
      createdAt: evidence.createdAt,
    });
  };

  // QAPI monthly + quarterly rollups (filing period drives the period key).
  if (QAPI_ROLLUP_CLASSIFICATIONS.has(evidence.classification)) {
    add('qapi-quarterly-committee', evidence.filingQuarterKey, `Created-date filing ${evidence.filingPeriodKey} → Q-QAPI ${evidence.filingQuarterKey}.`);
    // Monthly QAPI uses the same committee packet type, keyed to the month.
    add('qapi-quarterly-committee', evidence.filingPeriodKey, `Created-date filing month ${evidence.filingPeriodKey} → monthly QAPI rollup.`);
  }

  // Classification-specific packets (monthly cadence keyed to the filing month).
  for (const packetTypeId of CLASSIFICATION_PACKETS[evidence.classification] ?? []) {
    add(packetTypeId, evidence.filingPeriodKey, `Classification ${evidence.classification} → ${packetTypeId} for ${evidence.filingPeriodKey}.`);
  }

  return memberships;
}

/** Build a packet binding for an event/period (Section 11). */
export function buildPacketBinding(
  packetTypeId: string,
  filingPeriodKey: string,
  filingQuarterKey: string,
  ctx: { eventId: string; workflowId?: string | null; swimlaneId?: string | null },
): EvidencePacketBinding {
  const packet = EVIDENCE_PACKET_TYPES_BY_ID.get(packetTypeId);
  return {
    packetId: buildPacketId(packetTypeId, filingPeriodKey),
    packetTypeId,
    eventId: ctx.eventId,
    workflowId: ctx.workflowId ?? packet?.workflowIds[0] ?? null,
    swimlaneId: ctx.swimlaneId ?? null,
    filingPeriodKey,
    filingQuarterKey,
    // ready only when the registry packet maps cleanly; never fabricate.
    mappingStatus: packet?.mappingStatus ?? 'needs_mapping',
  };
}

/** All packet types that could receive a given classification (UI affordance). */
export function packetTypesForClassification(classification: EvidenceClassification): EvidencePacketType[] {
  const ids = new Set<string>(CLASSIFICATION_PACKETS[classification] ?? []);
  if (QAPI_ROLLUP_CLASSIFICATIONS.has(classification)) ids.add('qapi-quarterly-committee');
  return EVIDENCE_PACKET_TYPES.filter((p) => ids.has(p.packetTypeId));
}
