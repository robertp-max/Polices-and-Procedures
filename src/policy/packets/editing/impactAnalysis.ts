import type { EditImpactDimensions, EditImpactSummary } from '@/policy/packets/contracts';

export const editImpactDimensionKeys = [
  'kpiCalculations',
  'trends',
  'findings',
  'riskRatings',
  'pipCapRcaDecisions',
  'workflowTriggersAndInstances',
  'requiredForms',
  'actions',
  'gbRecommendations',
  'approvals',
  'signers',
  'attachments',
  'confidentiality',
  'hashes',
  'pagination',
  'eCignEnvelopeValidity',
  'lockEligibility',
] as const;

export type EditImpactDimensionKey = (typeof editImpactDimensionKeys)[number];

export type EditMateriality = 'material' | 'non-material';

export type EditChangeType =
  | 'section'
  | 'page'
  | 'data'
  | 'attachment'
  | 'workflow'
  | 'signature-requirement'
  | 'narrative';

export interface PacketEditCandidate {
  readonly editId?: string;
  readonly packetInstanceId: string;
  readonly baseVersionId: string;
  readonly packetVersion?: number;
  readonly changeType: EditChangeType;
  readonly targetPath: string;
  readonly before: unknown;
  readonly after: unknown;
  readonly reason: string;
  readonly sourceIds?: readonly string[];
  readonly affectedDimensions?: readonly EditImpactDimensionKey[];
  readonly affectedKpiIds?: readonly string[];
  readonly affectedFindingIds?: readonly string[];
  readonly affectedWorkflowIds?: readonly string[];
  readonly affectedFormIds?: readonly string[];
  readonly narrativeOnly?: boolean;
  readonly analyzedAt?: string | Date;
  readonly analyzedBy?: string | null;
}

export interface EditImpactDimension {
  readonly affected: boolean;
  readonly label: string;
  readonly summary: string;
  readonly before: unknown;
  readonly after: unknown;
  readonly sourceIds: readonly string[];
}

export interface ESignEnvelopeEditSignal {
  readonly packetInstanceId: string;
  readonly baseVersionId: string;
  readonly materiality: EditMateriality;
  readonly stalePriorApproval: boolean;
  readonly cancelOrVoidRequired: boolean;
  readonly reason: string;
  readonly targetPath: string;
  readonly affectedDimensions: readonly EditImpactDimensionKey[];
}

export interface PacketEditImpactAnalysis {
  readonly materiality: EditMateriality;
  readonly material: boolean;
  readonly summary: EditImpactSummary;
  readonly dimensions: Record<EditImpactDimensionKey, EditImpactDimension>;
  readonly humanReadableSummary: string;
  readonly stalePriorApproval: boolean;
  readonly envelopeSignal: ESignEnvelopeEditSignal;
  readonly recomputeSignals: readonly string[];
}

const dimensionLabels: Record<EditImpactDimensionKey, string> = {
  kpiCalculations: 'KPI calcs',
  trends: 'trends',
  findings: 'findings',
  riskRatings: 'risk ratings',
  pipCapRcaDecisions: 'PIP/CAP/RCA decisions',
  workflowTriggersAndInstances: 'workflow triggers/instances',
  requiredForms: 'required forms',
  actions: 'actions',
  gbRecommendations: 'GB recommendations',
  approvals: 'approvals',
  signers: 'signers',
  attachments: 'attachments',
  confidentiality: 'confidentiality',
  hashes: 'hashes',
  pagination: 'pagination',
  eCignEnvelopeValidity: 'eCIgn envelope validity',
  lockEligibility: 'lock eligibility',
};

const changeTypeMaterialDimensions: Record<EditChangeType, readonly EditImpactDimensionKey[]> = {
  section: ['pagination', 'hashes', 'approvals', 'eCignEnvelopeValidity', 'lockEligibility'],
  page: ['pagination', 'hashes', 'approvals', 'eCignEnvelopeValidity', 'lockEligibility'],
  data: [
    'kpiCalculations',
    'trends',
    'findings',
    'riskRatings',
    'pipCapRcaDecisions',
    'workflowTriggersAndInstances',
    'requiredForms',
    'actions',
    'gbRecommendations',
    'approvals',
    'hashes',
    'eCignEnvelopeValidity',
    'lockEligibility',
  ],
  attachment: ['attachments', 'confidentiality', 'hashes', 'approvals', 'eCignEnvelopeValidity', 'lockEligibility'],
  workflow: [
    'workflowTriggersAndInstances',
    'requiredForms',
    'actions',
    'approvals',
    'signers',
    'eCignEnvelopeValidity',
    'lockEligibility',
  ],
  'signature-requirement': ['approvals', 'signers', 'hashes', 'eCignEnvelopeValidity', 'lockEligibility'],
  narrative: ['hashes', 'pagination'],
};

const recomputeByDimension: Partial<Record<EditImpactDimensionKey, string>> = {
  kpiCalculations: 'kpi-calculations',
  trends: 'trend-series',
  findings: 'finding-model',
  riskRatings: 'risk-rating',
  pipCapRcaDecisions: 'pip-cap-rca-decision',
  workflowTriggersAndInstances: 'workflow-trigger-instance',
  requiredForms: 'required-form-register',
  actions: 'action-register',
  gbRecommendations: 'gb-recommendation-register',
};

function hasMeaningfulChange(before: unknown, after: unknown): boolean {
  return stableStringify(before) !== stableStringify(after);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    const serialized = JSON.stringify(value);
    return serialized === undefined ? 'undefined' : serialized;
  }
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(',')}]`;

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

function uniqueDimensions(dimensions: readonly EditImpactDimensionKey[]): readonly EditImpactDimensionKey[] {
  return editImpactDimensionKeys.filter((key) => dimensions.includes(key));
}

function classifyMateriality(candidate: PacketEditCandidate): EditMateriality {
  if (!hasMeaningfulChange(candidate.before, candidate.after)) return 'non-material';
  if (candidate.narrativeOnly === true) return 'non-material';
  if (candidate.affectedDimensions !== undefined && candidate.affectedDimensions.length > 0) return 'material';
  return candidate.changeType === 'narrative' ? 'non-material' : 'material';
}

function materialDimensions(candidate: PacketEditCandidate, materiality: EditMateriality): readonly EditImpactDimensionKey[] {
  if (materiality === 'non-material') {
    return uniqueDimensions(candidate.affectedDimensions ?? changeTypeMaterialDimensions[candidate.changeType]);
  }

  return uniqueDimensions([
    ...changeTypeMaterialDimensions[candidate.changeType],
    ...(candidate.affectedDimensions ?? []),
    'approvals',
    'hashes',
    'eCignEnvelopeValidity',
    'lockEligibility',
  ]);
}

function buildDimension(
  key: EditImpactDimensionKey,
  candidate: PacketEditCandidate,
  affected: boolean,
  materiality: EditMateriality,
): EditImpactDimension {
  const label = dimensionLabels[key];
  return {
    affected,
    label,
    summary: affected
      ? `${label} may change from edit at ${candidate.targetPath}; review before applying.`
      : `${label} unchanged by this ${materiality} edit.`,
    before: affected ? candidate.before : null,
    after: affected ? candidate.after : null,
    sourceIds: candidate.sourceIds ?? [],
  };
}

function buildDimensions(
  candidate: PacketEditCandidate,
  materiality: EditMateriality,
): Record<EditImpactDimensionKey, EditImpactDimension> {
  const affected = materialDimensions(candidate, materiality);
  return Object.fromEntries(
    editImpactDimensionKeys.map((key) => [
      key,
      buildDimension(key, candidate, affected.includes(key), materiality),
    ]),
  ) as Record<EditImpactDimensionKey, EditImpactDimension>;
}

function buildHumanReadableSummary(
  candidate: PacketEditCandidate,
  materiality: EditMateriality,
  dimensions: Record<EditImpactDimensionKey, EditImpactDimension>,
): string {
  const affectedLabels = editImpactDimensionKeys
    .filter((key) => dimensions[key].affected)
    .map((key) => dimensions[key].label);

  if (affectedLabels.length === 0) {
    return `This ${materiality} edit at ${candidate.targetPath} has no identified packet impact.`;
  }

  return `This ${materiality} edit at ${candidate.targetPath} affects ${affectedLabels.join(', ')}. Reason: ${candidate.reason}`;
}

function buildRecomputeSignals(dimensions: Record<EditImpactDimensionKey, EditImpactDimension>): readonly string[] {
  return editImpactDimensionKeys.flatMap((key) => {
    const hook = recomputeByDimension[key];
    return hook !== undefined && dimensions[key].affected ? [hook] : [];
  });
}

function buildContractDimensions(dimensions: Record<EditImpactDimensionKey, EditImpactDimension>): EditImpactDimensions {
  return {
    kpiCalculations: dimensions.kpiCalculations.affected,
    trends: dimensions.trends.affected,
    findings: dimensions.findings.affected,
    riskRatings: dimensions.riskRatings.affected,
    pipCapRcaDecisions: dimensions.pipCapRcaDecisions.affected,
    workflowTriggersAndInstances: dimensions.workflowTriggersAndInstances.affected,
    requiredForms: dimensions.requiredForms.affected,
    actions: dimensions.actions.affected,
    governingBodyRecommendations: dimensions.gbRecommendations.affected,
    approvals: dimensions.approvals.affected,
    signers: dimensions.signers.affected,
    attachments: dimensions.attachments.affected,
    confidentiality: dimensions.confidentiality.affected,
    hashes: dimensions.hashes.affected,
    pagination: dimensions.pagination.affected,
    ecignEnvelopeValidity: dimensions.eCignEnvelopeValidity.affected,
    lockEligibility: dimensions.lockEligibility.affected,
  };
}

function isoTimestamp(value: string | Date | undefined): string {
  if (value instanceof Date) return value.toISOString();
  return value ?? new Date().toISOString();
}

function versionNumber(candidate: PacketEditCandidate): number {
  if (candidate.packetVersion !== undefined) return candidate.packetVersion;
  const match = candidate.baseVersionId.match(/(\d+)$/);
  return match === null ? 0 : Number(match[1]);
}

function defaultEditId(candidate: PacketEditCandidate): string {
  return [
    candidate.packetInstanceId,
    candidate.baseVersionId,
    candidate.changeType,
    candidate.targetPath,
  ].join(':');
}

function buildSummary(
  candidate: PacketEditCandidate,
  materiality: EditMateriality,
  dimensions: Record<EditImpactDimensionKey, EditImpactDimension>,
  humanReadableSummary: string,
): EditImpactSummary {
  return {
    editId: candidate.editId ?? defaultEditId(candidate),
    packetInstanceId: candidate.packetInstanceId,
    packetVersion: versionNumber(candidate),
    classification: materiality,
    humanReadableSummary,
    dimensions: buildContractDimensions(dimensions),
    affectedKpiIds: [...(candidate.affectedKpiIds ?? [])],
    affectedFindingIds: [...(candidate.affectedFindingIds ?? [])],
    affectedWorkflowIds: [...(candidate.affectedWorkflowIds ?? [])],
    affectedFormIds: [...(candidate.affectedFormIds ?? [])],
    requiresReapproval: materiality === 'material',
    requiresResignature: materiality === 'material' && dimensions.eCignEnvelopeValidity.affected,
    invalidatesEnvelope: materiality === 'material' && dimensions.eCignEnvelopeValidity.affected,
    invalidatesLockEligibility: dimensions.lockEligibility.affected,
    analyzedAt: isoTimestamp(candidate.analyzedAt),
    analyzedBy: candidate.analyzedBy ?? null,
  };
}

function buildEnvelopeSignal(
  candidate: PacketEditCandidate,
  materiality: EditMateriality,
  dimensions: Record<EditImpactDimensionKey, EditImpactDimension>,
): ESignEnvelopeEditSignal {
  const affectedDimensions = editImpactDimensionKeys.filter((key) => dimensions[key].affected);
  return {
    packetInstanceId: candidate.packetInstanceId,
    baseVersionId: candidate.baseVersionId,
    materiality,
    stalePriorApproval: materiality === 'material',
    cancelOrVoidRequired: materiality === 'material',
    reason: materiality === 'material'
      ? 'Material edit stales prior approval and requires eCIgn envelope cancel/void before applying.'
      : 'Non-material edit does not stale prior approval or require eCIgn envelope cancel/void.',
    targetPath: candidate.targetPath,
    affectedDimensions,
  };
}

export function analyzeEditImpact(candidate: PacketEditCandidate): PacketEditImpactAnalysis {
  const materiality = classifyMateriality(candidate);
  const dimensions = buildDimensions(candidate, materiality);
  const humanReadableSummary = buildHumanReadableSummary(candidate, materiality, dimensions);
  const summary = buildSummary(candidate, materiality, dimensions, humanReadableSummary);

  return {
    materiality,
    material: materiality === 'material',
    summary,
    dimensions,
    humanReadableSummary,
    stalePriorApproval: materiality === 'material',
    envelopeSignal: buildEnvelopeSignal(candidate, materiality, dimensions),
    recomputeSignals: buildRecomputeSignals(dimensions),
  };
}
