import type {
  PacketEnvelope,
  PacketInstance,
  PacketModel,
  PacketValidationFinding,
  PacketValidationResult,
  ValidationSeverity,
  WorkflowTriggerEvaluation,
} from '@/policy/packets/contracts';
import type { CalculatedKpi } from '@/policy/packets/analysis/kpi/calculateKpis';
import type { KpiDashboardModel } from '@/policy/packets/analysis/kpi/dashboardModel';
import type { SegmentedQapiBundleResult, SegmentationResult } from '@/policy/packets/sources/segmentSources';
import type { SourceFormUtilizationReport } from '@/policy/packets/sources/sourceUtilization';
import { validateQapiPacketForLock } from '@/policy/qapi/validateQapiPacketForLock';
import type { PacketForLock } from '@/policy/qapi/validateQapiPacketForLock';
import type { Severity as QapiSeverity, ValidationFinding as QapiValidationFinding } from '@/policy/qapi/qapiTypes';

import { validateConfidentiality } from './rules/confidentiality';
import { validateForms } from './rules/forms';
import { validateIdentityAndPeriod } from './rules/identityPeriod';
import { validateKpis } from './rules/kpi';
import { validateSigners } from './rules/signers';
import { validateWorkflow } from './rules/workflow';

type UnknownRecord = Record<string, unknown>;

export interface ExpectedReportingPeriod {
  start: string;
  end: string;
  label?: string | null;
}

export interface RequiredEvidenceRequirement {
  workflowId: string;
  evidenceLabel: string;
  evidenceId: string | null;
  formId?: string | null;
}

export interface ValidatePacketOptions {
  instance?: PacketInstance | null;
  expectedAgencyId?: string | null;
  expectedReportingPeriod?: ExpectedReportingPeriod | null;
  expectedWorkflowId?: string | null;
  segmentation?: SegmentationResult | SegmentedQapiBundleResult | null;
  sourceUtilization?: SourceFormUtilizationReport | null;
  kpis?: readonly CalculatedKpi[] | null;
  kpiDashboard?: KpiDashboardModel | null;
  workflowEvaluations?: readonly WorkflowTriggerEvaluation[] | null;
  envelopes?: readonly PacketEnvelope[] | null;
  qapiLockPacket?: PacketForLock | null;
  requiredWorkflowIds?: readonly string[] | null;
  requiredFormIds?: readonly string[] | null;
  requiredSignerCapacities?: readonly string[] | null;
  requiredEvidence?: readonly RequiredEvidenceRequirement[] | null;
  personnelGeneralPacketFieldNames?: readonly string[] | null;
  acknowledgedWarningIds?: readonly string[] | null;
  validatedAt?: string;
}

export interface ValidatePacketInput extends ValidatePacketOptions {
  model: PacketModel;
}

export interface RuleContext {
  model: PacketModel;
  instance: PacketInstance | null;
  expectedAgencyId: string | null;
  expectedReportingPeriod: ExpectedReportingPeriod | null;
  expectedWorkflowId: string | null;
  segmentation: SegmentationResult | null;
  sourceUtilization: SourceFormUtilizationReport | null;
  kpis: readonly CalculatedKpi[];
  kpiDashboard: KpiDashboardModel | null;
  workflowEvaluations: readonly WorkflowTriggerEvaluation[];
  envelopes: readonly PacketEnvelope[];
  qapiLockPacket: PacketForLock | null;
  requiredWorkflowIds: readonly string[];
  requiredFormIds: readonly string[];
  requiredSignerCapacities: readonly string[];
  requiredEvidence: readonly RequiredEvidenceRequirement[];
  personnelGeneralPacketFieldNames: readonly string[];
}

export function validatePacket(input: ValidatePacketInput): PacketValidationResult;
export function validatePacket(
  model: PacketModel,
  instance?: PacketInstance | null,
  options?: ValidatePacketOptions,
): PacketValidationResult;
export function validatePacket(
  first: PacketModel | ValidatePacketInput,
  instance: PacketInstance | null = null,
  options: ValidatePacketOptions = {},
): PacketValidationResult {
  const input = isValidatePacketInput(first)
    ? first
    : { ...options, model: first, instance: instance ?? options.instance ?? null };
  const context = buildRuleContext(input);
  const findings = uniqueFindings([
    ...validateIdentityAndPeriod(context),
    ...validateKpis(context),
    ...validateWorkflow(context),
    ...validateForms(context),
    ...validateSigners(context),
    ...validateConfidentiality(context),
    ...validateQapiLock(context),
  ]);
  const acknowledgedWarningIds = new Set(input.acknowledgedWarningIds ?? []);
  const unresolvedBlockerIds = findings
    .filter((finding) => finding.severity === 'blocker')
    .map((finding) => finding.findingId);
  const unacknowledgedWarningIds = findings
    .filter((finding) => (
      finding.severity === 'warning' &&
      finding.requiresAcknowledgment &&
      finding.acknowledgedAt === null &&
      !acknowledgedWarningIds.has(finding.findingId)
    ))
    .map((finding) => finding.findingId);
  const counts = {
    blocker: findings.filter((finding) => finding.severity === 'blocker').length,
    warning: findings.filter((finding) => finding.severity === 'warning').length,
    advisory: findings.filter((finding) => finding.severity === 'advisory').length,
  };

  return {
    packetInstanceId: context.model.identity.packetInstanceId,
    packetVersion: context.model.identity.packetVersion,
    validatedAt: input.validatedAt ?? new Date().toISOString(),
    findings,
    counts,
    approvalEligible: unresolvedBlockerIds.length === 0,
    lockEligible: unresolvedBlockerIds.length === 0 && unacknowledgedWarningIds.length === 0,
    unacknowledgedWarningIds,
    unresolvedBlockerIds,
  };
}

function isValidatePacketInput(value: PacketModel | ValidatePacketInput): value is ValidatePacketInput {
  return 'model' in value;
}

function buildRuleContext(input: ValidatePacketInput): RuleContext {
  const explicitQapiLockPacket = input.qapiLockPacket ?? null;
  return {
    model: input.model,
    instance: input.instance ?? null,
    expectedAgencyId: input.expectedAgencyId ?? null,
    expectedReportingPeriod: input.expectedReportingPeriod ?? null,
    expectedWorkflowId: input.expectedWorkflowId ?? null,
    segmentation: normalizeSegmentation(input.segmentation ?? null),
    sourceUtilization: input.sourceUtilization ?? null,
    kpis: input.kpis ?? [],
    kpiDashboard: input.kpiDashboard ?? null,
    workflowEvaluations: input.workflowEvaluations ?? [],
    envelopes: input.envelopes ?? [],
    qapiLockPacket: explicitQapiLockPacket ?? deriveQapiLockPacketFromModel(input.model),
    requiredWorkflowIds: input.requiredWorkflowIds ?? [],
    requiredFormIds: input.requiredFormIds ?? [],
    requiredSignerCapacities: input.requiredSignerCapacities ?? [],
    requiredEvidence: input.requiredEvidence ?? [],
    personnelGeneralPacketFieldNames: input.personnelGeneralPacketFieldNames ?? [],
  };
}

function normalizeSegmentation(
  segmentation: SegmentationResult | SegmentedQapiBundleResult | null,
): SegmentationResult | null {
  if (segmentation === null) return null;
  if ('segmentation' in segmentation) return segmentation.segmentation;
  return segmentation;
}

function validateQapiLock(context: RuleContext): PacketValidationFinding[] {
  const packet = context.qapiLockPacket;
  if (packet === null) return [];
  const findings = validateQapiPacketForLock(packet).findings.map((finding, index) =>
    mapQapiFinding(finding, index),
  );
  packet.sourceExceptions
    ?.filter((finding) => !finding.pass && finding.severity !== 'blocker')
    .forEach((finding, index) => {
      findings.push(mapQapiSourceException(finding, index));
    });
  return findings;
}

function mapQapiFinding(
  finding: QapiValidationFinding,
  index: number,
): PacketValidationFinding {
  const severity = mapQapiSeverity(finding.severity);
  return {
    findingId: `qapi-lock-${slug(finding.path)}-${index + 1}`,
    severity,
    code: qapiCodeForPath(finding.path, severity),
    path: finding.path,
    message: finding.reason,
    remediation: finding.remediation,
    requiresAcknowledgment: severity === 'warning',
    acknowledgedAt: null,
    acknowledgedBy: null,
    relatedModuleId: null,
    relatedFormId: null,
    relatedWorkflowId: null,
  };
}

function mapQapiSourceException(
  finding: QapiValidationFinding,
  index: number,
): PacketValidationFinding {
  const severity = mapQapiSeverity(finding.severity);
  return {
    findingId: `qapi-source-exception-${slug(finding.path)}-${index + 1}`,
    severity,
    code: qapiCodeForPath(finding.path, severity),
    path: finding.path,
    message: finding.reason,
    remediation: finding.remediation,
    requiresAcknowledgment: severity === 'warning',
    acknowledgedAt: null,
    acknowledgedBy: null,
    relatedModuleId: null,
    relatedFormId: null,
    relatedWorkflowId: null,
  };
}

function mapQapiSeverity(severity: QapiSeverity): ValidationSeverity {
  if (severity === 'blocker' || severity === 'high') return 'blocker';
  if (severity === 'medium') return 'warning';
  return 'advisory';
}

function qapiCodeForPath(path: string, severity: ValidationSeverity): string {
  if (/signature|governance/i.test(path)) return 'missing-signer-or-authority';
  if (/rollups/i.test(path)) return 'malformed-kpi';
  if (/dateWindow/i.test(path)) return 'period-contamination';
  if (/addendum/i.test(path)) return 'confidential-personnel-data-in-general-packet';
  return severity === 'blocker' ? 'qapi-lock-blocker' : 'qapi-lock-finding';
}

function uniqueFindings(findings: readonly PacketValidationFinding[]): PacketValidationFinding[] {
  const seen = new Set<string>();
  const unique: PacketValidationFinding[] = [];
  for (const finding of findings) {
    if (seen.has(finding.findingId)) continue;
    seen.add(finding.findingId);
    unique.push(finding);
  }
  return unique;
}

function deriveQapiLockPacketFromModel(model: PacketModel): PacketForLock | null {
  const payload = model.modules
    .map((module) => module.payload)
    .find((candidate) => isRecord(candidate) && (isRecord(candidate.roll) || isRecord(candidate.lock)));
  if (!isRecord(payload)) return null;
  const roll = isRecord(payload.roll) ? payload.roll : null;
  const window = roll && isRecord(roll.window) ? roll.window : null;
  const census = roll && isRecord(roll.census) ? roll.census : null;
  const ref = isRecord(payload.ref) ? payload.ref : null;
  const addendumRequired = booleanValue(payload.addendumRequired) ?? false;
  return {
    packetId: stringValue(payload.packetId) ?? model.identity.packetId,
    packetType: packetTypeValue(window?.packetType),
    html: '',
    governanceRoles: governanceRolesValue(payload.approvers),
    rollups: {
      activeCensus: nullableNumber(census?.activeCensus),
      recertCounts: nullableNumber(census?.recertDue),
      highRiskRollupPresent: roll !== null,
      priorPeriodComparisonPresent: false,
      claimsTrend: false,
    },
    signatures: [],
    dateWindowViolations: [],
    addendum: {
      required: addendumRequired,
      generatedId: addendumRequired ? stringValue(ref?.addendumId) ?? null : null,
    },
    sourceExceptions: qapiFindingsValue(roll?.exceptions),
  };
}

function governanceRolesValue(value: unknown): PacketForLock['governanceRoles'] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((item) => ({
      role: stringValue(item.role) ?? 'unknown-role',
      name: stringValue(item.name) ?? undefined,
      authorityConfirmed: booleanValue(item.authorityConfirmed) ?? false,
    }));
}

function qapiFindingsValue(value: unknown): QapiValidationFinding[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isQapiFinding);
}

function isQapiFinding(value: unknown): value is QapiValidationFinding {
  if (!isRecord(value)) return false;
  return (
    typeof value.pass === 'boolean' &&
    isQapiSeverity(value.severity) &&
    typeof value.path === 'string' &&
    typeof value.reason === 'string' &&
    typeof value.remediation === 'string'
  );
}

function isQapiSeverity(value: unknown): value is QapiSeverity {
  return value === 'blocker' || value === 'high' || value === 'medium' || value === 'low';
}

function packetTypeValue(value: unknown): PacketForLock['packetType'] {
  if (value === 'interim' || value === 'final') return value;
  return undefined;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function nullableNumber(value: unknown): number | null | undefined {
  if (value === null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return undefined;
}

function booleanValue(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function slug(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalized.length > 0 ? normalized : 'packet';
}
