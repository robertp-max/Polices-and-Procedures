import {
  ALLOWED_TRANSITIONS,
  type PacketLifecycleStatus,
} from '@/policy/packets/contracts';

export type UnknownReadinessField = 'unknown';

export type ReadinessActionId =
  | 'generate_new_packet'
  | 'open_existing_draft'
  | 'continue_review'
  | 'track_signatures'
  | 'view_signed_packet'
  | 'open_in_google_drive'
  | 'create_amendment'
  | 'create_superseding_version'
  | 'cancel';

export type ExistingPacketDisposition =
  | 'none'
  | 'draft_or_review'
  | 'signature_tracking'
  | 'view_or_amend'
  | 'view_only';

export interface ExistingPacketReadiness {
  exists?: boolean | null;
  packetInstanceId?: string | null;
  packetId?: string | null;
  packetVersion?: number | null;
  revision?: number | null;
  status?: PacketLifecycleStatus | UnknownReadinessField | null;
  driveFolderUrl?: string | null;
  finalArtifactUrl?: string | null;
  lockedAt?: string | null;
}

export interface ReadinessDrawerInput {
  identity?: Partial<PacketReadinessIdentityFields> | null;
  eventWorkflowIdentity?: Partial<EventWorkflowIdentityFields> | null;
  reportingPeriod?: Partial<ReportingPeriodFields> | null;
  selectedPacketTemplate?: Partial<SelectedPacketTemplateFields> | null;
  requiredFormsEvidence?: Partial<RequiredFormsEvidenceFields> | null;
  requiredApprovalsSigners?: Partial<RequiredApprovalsSignersFields> | null;
  openDependenciesBlockers?: Partial<OpenDependenciesBlockersFields> | null;
  agency?: string | null;
  agencyId?: string | null;
  agencyLabel?: string | null;
  eventTitle?: string | null;
  eventDate?: string | null;
  eventFamilyId?: string | null;
  eventInstanceId?: string | null;
  workflowId?: string | null;
  workflowInstanceId?: string | null;
  owner?: string | null;
  eventStatus?: string | null;
  cadence?: string | null;
  regulatoryDriver?: string | null;
  reportingPeriodStart?: string | null;
  reportingPeriodEnd?: string | null;
  packetTemplateId?: string | null;
  selectedPacketTemplateId?: string | null;
  templateCompatible?: boolean | null;
  packetTemplateCompatible?: boolean | null;
  requiredForms?: readonly string[] | null;
  requiredEvidence?: readonly string[] | null;
  requiredApprovals?: readonly string[] | UnknownReadinessField | null;
  requiredSigners?: readonly string[] | UnknownReadinessField | null;
  openDependencies?: readonly string[] | null;
  blockerIds?: readonly string[] | null;
  existingPacket?: ExistingPacketReadiness | null;
  existingPacketStatus?: PacketLifecycleStatus | UnknownReadinessField | null;
  packetStatus?: PacketLifecycleStatus | UnknownReadinessField | null;
  priorPeriodPacketStatus?: string | null;
  trendComparisonReadiness?: string | null;
  driveDestination?: string | null;
  driveFolderUrl?: string | null;
  requiredFormCompletion?: number | null;
  evidenceCompleteness?: number | null;
  approvalStatus?: string | null;
  signatureStatus?: string | null;
  blockerCount?: number | null;
}

interface PacketReadinessIdentityFields {
  agencyId: string | null;
  eventInstanceId: string | null;
  eventFamilyId: string | null;
  workflowId: string | null;
  workflowInstanceId: string | null;
  packetTemplateId: string | null;
  reportingPeriodStart: string | null;
  reportingPeriodEnd: string | null;
}

interface EventWorkflowIdentityFields {
  eventFamilyId: string | null;
  eventInstanceId: string | null;
  workflowId: string | null;
  workflowInstanceId: string | null;
}

interface ReportingPeriodFields {
  start: string | null;
  end: string | null;
}

interface SelectedPacketTemplateFields {
  packetTemplateId: string | null;
  compatible: boolean | string | null;
}

interface RequiredFormsEvidenceFields {
  requiredForms: readonly string[] | UnknownReadinessField | null;
  requiredEvidence: readonly string[] | UnknownReadinessField | null;
  requiredFormCompletion: number | UnknownReadinessField | null;
  evidenceCompleteness: number | UnknownReadinessField | null;
}

interface RequiredApprovalsSignersFields {
  requiredApprovals: readonly string[] | UnknownReadinessField | null;
  requiredSigners: readonly string[] | UnknownReadinessField | null;
  approvalStatus: string | null;
  signatureStatus: string | null;
}

interface OpenDependenciesBlockersFields {
  blockerCount: number | UnknownReadinessField | null;
  blockerIds: readonly string[] | UnknownReadinessField | null;
  openDependencies: readonly string[] | UnknownReadinessField | null;
}

export interface ReadinessDrawerField {
  label: string;
  value: string;
}

export interface ReadinessDrawerAction {
  id: ReadinessActionId;
  label: string;
  enabled: boolean;
  reason: string | null;
}

export interface ReadinessDrawerModel {
  title: string;
  fields: readonly ReadinessDrawerField[];
  actions: readonly ReadinessDrawerAction[];
  disposition: ExistingPacketDisposition;
  duplicateGenerationAllowed: boolean;
}

export const UNKNOWN_READINESS_FIELD: UnknownReadinessField = 'unknown';

const DRAFT_OR_REVIEW_STATUSES = new Set<PacketLifecycleStatus>([
  'SOURCE_COLLECTION',
  'DRAFT_GENERATED',
  'UNDER_ANALYSIS',
  'READY_FOR_REVIEW',
  'UNDER_REVIEW',
  'EDITING',
  'VALIDATION_REQUIRED',
  'READY_FOR_APPROVAL',
  'APPROVED_FOR_SIGNATURE',
  'SIGNER_CONFIRMATION',
  'BLOCKED',
  'RETURNED_FOR_CORRECTION',
  'SIGNATURE_DECLINED',
  'SIGNATURE_EXPIRED',
]);

const SIGNATURE_TRACKING_STATUSES = new Set<PacketLifecycleStatus>([
  'ECIGN_PREPARING',
  'SENT_FOR_SIGNATURE',
  'PARTIALLY_SIGNED',
]);

const VIEW_OR_AMEND_STATUSES = new Set<PacketLifecycleStatus>([
  'FULLY_SIGNED',
  'SIGNED_PACKAGE_BUILDING',
  'CERTIFICATION_REVIEW',
  'CERTIFIED',
  'DRIVE_PUBLISHING',
  'PUBLISHED',
  'LOCKED',
  'AMENDMENT_REQUIRED',
]);

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isPacketLifecycleStatus(value: string): value is PacketLifecycleStatus {
  return Object.prototype.hasOwnProperty.call(ALLOWED_TRANSITIONS.packet, value);
}

function firstKnownString(
  ...values: readonly (string | null | undefined)[]
): string | UnknownReadinessField {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return UNKNOWN_READINESS_FIELD;
}

export function formatUnknownable(
  value: string | number | boolean | UnknownReadinessField | null | undefined,
): string {
  if (value === null || value === undefined || value === UNKNOWN_READINESS_FIELD) {
    return UNKNOWN_READINESS_FIELD;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : UNKNOWN_READINESS_FIELD;
  }
  if (typeof value === 'boolean') return value ? 'yes' : 'no';
  if (Number.isFinite(value)) return String(value);
  return UNKNOWN_READINESS_FIELD;
}

export function formatPercent(
  value: number | UnknownReadinessField | null | undefined,
): string {
  if (
    value === null ||
    value === undefined ||
    value === UNKNOWN_READINESS_FIELD ||
    !Number.isFinite(value)
  ) {
    return UNKNOWN_READINESS_FIELD;
  }
  return `${value}%`;
}

export function formatList(
  value: readonly string[] | UnknownReadinessField | null | undefined,
): string {
  if (value === null || value === undefined || value === UNKNOWN_READINESS_FIELD) {
    return UNKNOWN_READINESS_FIELD;
  }
  const cleaned = value.map((item) => item.trim()).filter((item) => item.length > 0);
  return cleaned.length > 0 ? cleaned.join(', ') : 'none';
}

export function formatReportingPeriod(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  const cleanStart = typeof start === 'string' && start.trim().length > 0 ? start.trim() : null;
  const cleanEnd = typeof end === 'string' && end.trim().length > 0 ? end.trim() : null;
  if (cleanStart && cleanEnd) return `${cleanStart} -> ${cleanEnd}`;
  if (cleanStart) return `${cleanStart} -> unknown`;
  if (cleanEnd) return `unknown -> ${cleanEnd}`;
  return UNKNOWN_READINESS_FIELD;
}

function normalizePacketStatus(
  value: PacketLifecycleStatus | string | null | undefined,
): PacketLifecycleStatus | UnknownReadinessField {
  if (typeof value !== 'string') return UNKNOWN_READINESS_FIELD;
  return isPacketLifecycleStatus(value) ? value : UNKNOWN_READINESS_FIELD;
}

export function classifyExistingPacket(
  status: PacketLifecycleStatus | string | null | undefined,
): ExistingPacketDisposition {
  const normalized = normalizePacketStatus(status);
  if (normalized === UNKNOWN_READINESS_FIELD) return 'none';
  if (DRAFT_OR_REVIEW_STATUSES.has(normalized)) return 'draft_or_review';
  if (SIGNATURE_TRACKING_STATUSES.has(normalized)) return 'signature_tracking';
  if (VIEW_OR_AMEND_STATUSES.has(normalized)) return 'view_or_amend';
  return 'view_only';
}

function existingPacketStatus(
  input: ReadinessDrawerInput,
): PacketLifecycleStatus | 'none' | UnknownReadinessField {
  if (hasOwn(input, 'existingPacket')) {
    if (input.existingPacket === null) return 'none';
    if (input.existingPacket?.exists === false) return 'none';
    return normalizePacketStatus(input.existingPacket?.status);
  }
  return normalizePacketStatus(input.existingPacketStatus ?? input.packetStatus);
}

function packetStatus(input: ReadinessDrawerInput): PacketLifecycleStatus | UnknownReadinessField {
  const fromExisting = input.existingPacket?.status;
  return normalizePacketStatus(fromExisting ?? input.packetStatus ?? input.existingPacketStatus);
}

function blockerCount(input: ReadinessDrawerInput): number | UnknownReadinessField {
  if (typeof input.blockerCount === 'number' && Number.isFinite(input.blockerCount)) {
    return input.blockerCount;
  }
  const nestedCount = input.openDependenciesBlockers?.blockerCount;
  if (typeof nestedCount === 'number' && Number.isFinite(nestedCount)) return nestedCount;
  if (input.blockerIds) return input.blockerIds.length;
  if (input.openDependencies) return input.openDependencies.length;
  return UNKNOWN_READINESS_FIELD;
}

function driveDestination(input: ReadinessDrawerInput): string | UnknownReadinessField {
  return firstKnownString(
    input.driveDestination,
    input.driveFolderUrl,
    input.existingPacket?.driveFolderUrl,
  );
}

function field(label: string, value: string): ReadinessDrawerField {
  return { label, value };
}

export function readinessActions(input: ReadinessDrawerInput): readonly ReadinessDrawerAction[] {
  const status = existingPacketStatus(input);
  const disposition = status === 'none' ? 'none' : classifyExistingPacket(status);
  const noExistingPacketKnown = status === 'none';
  const hasPacket = status !== 'none' && status !== UNKNOWN_READINESS_FIELD;
  const canOpenDraft = disposition === 'draft_or_review';
  const canTrack = disposition === 'signature_tracking';
  const canViewOrAmend = disposition === 'view_or_amend';
  const driveKnown = driveDestination(input) !== UNKNOWN_READINESS_FIELD;
  const generateDisabledReason = hasPacket
    ? 'Existing packet found for this event, workflow, and template; generation must not create a duplicate.'
    : status === UNKNOWN_READINESS_FIELD
      ? 'Existing-packet readiness is unknown; generation is disabled until duplicate detection completes.'
      : null;

  return [
    {
      id: 'generate_new_packet',
      label: 'Generate new packet',
      enabled: noExistingPacketKnown,
      reason: generateDisabledReason,
    },
    {
      id: 'open_existing_draft',
      label: 'Open existing draft',
      enabled: canOpenDraft,
      reason: canOpenDraft ? null : 'No draft/review packet exists for this selection.',
    },
    {
      id: 'continue_review',
      label: 'Continue review',
      enabled: canOpenDraft,
      reason: canOpenDraft ? null : 'No reviewable packet exists for this selection.',
    },
    {
      id: 'track_signatures',
      label: 'Track signatures',
      enabled: canTrack,
      reason: canTrack ? null : 'Packet is not currently sent for signature.',
    },
    {
      id: 'view_signed_packet',
      label: 'View signed packet',
      enabled: canViewOrAmend,
      reason: canViewOrAmend ? null : 'No signed, published, or locked packet exists.',
    },
    {
      id: 'open_in_google_drive',
      label: 'Open in Google Drive',
      enabled: driveKnown,
      reason: driveKnown ? null : 'Drive destination is unknown.',
    },
    {
      id: 'create_amendment',
      label: 'Create amendment',
      enabled: canViewOrAmend,
      reason: canViewOrAmend ? null : 'Amendments are available after signature, publication, or lock.',
    },
    {
      id: 'create_superseding_version',
      label: 'Create superseding version',
      enabled: canViewOrAmend,
      reason: canViewOrAmend ? null : 'Superseding versions are available after signature, publication, or lock.',
    },
    {
      id: 'cancel',
      label: 'Cancel',
      enabled: true,
      reason: null,
    },
  ];
}

export function buildReadinessDrawerModel(
  input: ReadinessDrawerInput,
): ReadinessDrawerModel {
  const status = existingPacketStatus(input);
  const disposition = status === 'none' ? 'none' : classifyExistingPacket(status);
  const eventInstanceId = firstKnownString(
    input.eventInstanceId,
    input.eventWorkflowIdentity?.eventInstanceId,
    input.identity?.eventInstanceId,
  );
  const workflowInstanceId = firstKnownString(
    input.workflowInstanceId,
    input.eventWorkflowIdentity?.workflowInstanceId,
    input.identity?.workflowInstanceId,
  );
  const reportingPeriodStart =
    input.reportingPeriodStart ??
    input.reportingPeriod?.start ??
    input.identity?.reportingPeriodStart ??
    null;
  const reportingPeriodEnd =
    input.reportingPeriodEnd ??
    input.reportingPeriod?.end ??
    input.identity?.reportingPeriodEnd ??
    null;
  const requiredForms =
    input.requiredForms ??
    input.requiredFormsEvidence?.requiredForms ??
    null;
  const requiredEvidence =
    input.requiredEvidence ??
    input.requiredFormsEvidence?.requiredEvidence ??
    null;
  const requiredApprovals =
    input.requiredApprovals ??
    input.requiredApprovalsSigners?.requiredApprovals ??
    null;
  const requiredSigners =
    input.requiredSigners ??
    input.requiredApprovalsSigners?.requiredSigners ??
    null;
  const openDependencies =
    input.openDependencies ??
    input.openDependenciesBlockers?.openDependencies ??
    input.openDependenciesBlockers?.blockerIds ??
    input.blockerIds ??
    null;
  const title = firstKnownString(input.eventTitle, eventInstanceId, 'Packet readiness');
  const actions = readinessActions(input);
  const fields = [
    field('Agency', firstKnownString(input.agencyLabel, input.agency, input.agencyId, input.identity?.agencyId)),
    field('Event title', firstKnownString(input.eventTitle)),
    field('Event date', firstKnownString(input.eventDate)),
    field('Event-family ID', firstKnownString(
      input.eventFamilyId,
      input.eventWorkflowIdentity?.eventFamilyId,
      input.identity?.eventFamilyId,
    )),
    field('Event-instance ID', eventInstanceId),
    field('Workflow ID', firstKnownString(
      input.workflowId,
      input.eventWorkflowIdentity?.workflowId,
      input.identity?.workflowId,
    )),
    field('Workflow-instance ID', workflowInstanceId),
    field('Owner', firstKnownString(input.owner)),
    field('Event status', firstKnownString(input.eventStatus)),
    field('Cadence', firstKnownString(input.cadence)),
    field('Regulatory driver', firstKnownString(input.regulatoryDriver)),
    field('Reporting period', formatReportingPeriod(reportingPeriodStart, reportingPeriodEnd)),
    field('Packet template', firstKnownString(
      input.selectedPacketTemplateId,
      input.packetTemplateId,
      input.selectedPacketTemplate?.packetTemplateId,
      input.identity?.packetTemplateId,
    )),
    field(
      'Template compatible',
      input.templateCompatible !== undefined && input.templateCompatible !== null
        ? formatUnknownable(input.templateCompatible)
        : input.packetTemplateCompatible !== undefined && input.packetTemplateCompatible !== null
          ? formatUnknownable(input.packetTemplateCompatible)
          : formatUnknownable(input.selectedPacketTemplate?.compatible),
    ),
    field('Required forms', formatList(requiredForms)),
    field('Required evidence', formatList(requiredEvidence)),
    field('Required approvals', formatList(requiredApprovals)),
    field('Required signers', formatList(requiredSigners)),
    field('Open dependencies', formatList(openDependencies)),
    field('Blocker count', formatUnknownable(blockerCount(input))),
    field('Existing packet status', formatUnknownable(status)),
    field('Packet status', formatUnknownable(packetStatus(input))),
    field('Prior-period packet status', formatUnknownable(input.priorPeriodPacketStatus)),
    field('Trend-comparison readiness', formatUnknownable(input.trendComparisonReadiness)),
    field('Drive destination', formatUnknownable(driveDestination(input))),
    field('Required-form completion', formatPercent(
      input.requiredFormCompletion ?? input.requiredFormsEvidence?.requiredFormCompletion,
    )),
    field('Evidence completeness', formatPercent(
      input.evidenceCompleteness ?? input.requiredFormsEvidence?.evidenceCompleteness,
    )),
    field('Approval status', formatUnknownable(
      input.approvalStatus ?? input.requiredApprovalsSigners?.approvalStatus,
    )),
    field('Signature status', formatUnknownable(
      input.signatureStatus ?? input.requiredApprovalsSigners?.signatureStatus,
    )),
  ];

  return {
    title,
    fields,
    actions,
    disposition,
    duplicateGenerationAllowed: actions.find((action) => action.id === 'generate_new_packet')?.enabled ?? false,
  };
}
