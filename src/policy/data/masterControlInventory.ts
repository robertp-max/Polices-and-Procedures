import type {
  ControlRisk,
  ControlStatus,
  MasterControlReadinessStatus,
  MasterControlCategory,
  MasterControlDataSource,
  MasterControlDocumentationRecord,
  MasterControlItem,
  MasterControlSourceStatus,
  MasterControlSourcePayload,
  MasterControlSourceRecord,
} from '@/policy/types/masterControlInventory';
import {
  EXTRA_MASTER_CONTROL_SOURCE_RECORDS,
  buildDefaultAuditTrail,
  buildDefaultDocumentRefs,
  buildDefaultEvidenceRequirements,
  buildDefaultSignoffRequirements,
  buildVerificationLogTemplates,
  buildVerification,
  getDossierOverride,
  getDocumentationRecordForRef,
  normalizeSourceStatus,
} from './masterControlDocumentation.generated';

export const MASTER_CONTROL_INVENTORY_SOURCE_PATH =
  '/data/MASTER_CONTROL_INVENTORY_DATA_MODEL.json';

export const MASTER_CONTROL_INVENTORY_SOURCE_PATH_FALLBACKS = [
  '/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json',
  '/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json',
  '/MASTER_CONTROL_INVENTORY_DATA_MODEL.json',
] as const;

export const MASTER_CONTROL_CATEGORIES: MasterControlCategory[] = [
  'Patient Rights & Access',
  'Clinical Operations',
  'Safety & Risk Management',
  'Compliance & Regulatory',
  'Governance',
  'Workforce & HR',
  'IT & Security',
  'Financial / Billing',
  'Enterprise Policy & Records',
  'QAPI Program',
];

const RISK_MAP: Record<MasterControlSourceRecord['risk_level'], ControlRisk> = {
  H: 'HIGH',
  M: 'MATERIAL',
  L: 'LOW',
};

const STATUS_MAP: Record<MasterControlSourceRecord['status'], ControlStatus> = {
  COMPLIANT: 'active',
  AT_RISK: 'deficient',
  NON_COMPLIANT: 'deficient',
  UNDER_REVIEW: 'unknown',
  UNKNOWN: 'unknown',
};

const FALLBACK_CONTROLS: MasterControlItem[] = [];

function parseNumericId(controlId: string): number {
  const parsed = Number.parseInt(controlId.replace(/\D+/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDataSource(ds: MasterControlDataSource): string | undefined {
  const forms = ds.forms_logs.length ? `Forms/Logs: ${ds.forms_logs.join(', ')}` : '';
  const source = ds.system ? `System: ${ds.system}` : '';
  if (!source && !forms) return undefined;
  if (!source) return forms;
  if (!forms) return source;
  return `${source} | ${forms}`;
}

export function hasRequiredDocumentationBody(record: MasterControlDocumentationRecord | undefined): record is MasterControlDocumentationRecord {
  return Boolean(record && record.body.length > 0 && record.body.every((section) => section.heading.trim() || section.body.trim()));
}

export function deriveReadinessStatus({
  documentRefs,
  documentationRecords,
  evidenceRequirements,
  signoffRequirements,
  sourceStatus,
}: Pick<MasterControlItem, 'documentRefs' | 'evidenceRequirements' | 'signoffRequirements'> & {
  documentationRecords: readonly (MasterControlDocumentationRecord | undefined)[];
  sourceStatus: MasterControlSourceStatus;
}): MasterControlReadinessStatus {
  const requiredDocumentRefs = documentRefs.filter((ref) => ref.required);
  if (requiredDocumentRefs.length === 0 || evidenceRequirements.length === 0 || signoffRequirements.length === 0) {
    return 'NOT_CONFIGURED';
  }
  if (
    requiredDocumentRefs.some((ref) => {
      const record = documentationRecords.find((doc) => doc?.documentId === ref.documentId);
      return !hasRequiredDocumentationBody(record);
    })
  ) {
    return 'DOCUMENTATION_MISSING';
  }
  if (sourceStatus === 'DEFICIENT') return 'BLOCKED';
  if (sourceStatus === 'COMPLIANT') return 'NEEDS_ATTENTION';
  return 'BLOCKED';
}

export function mapMasterControlRecord(source: MasterControlSourceRecord): MasterControlItem {
  const derivedNotes = normalizeDataSource(source.data_source);
  const numericId = parseNumericId(source.id);
  const riskTier = RISK_MAP[source.risk_level];
  const sourceStatus = normalizeSourceStatus(source.status);
  const override = getDossierOverride(source.id);
  const documentRefs = override?.documentRefs ?? buildDefaultDocumentRefs(source);
  const documentationRecords = documentRefs.map((ref) => getDocumentationRecordForRef(source, ref));
  const evidenceRequirements = override?.evidenceRequirements ?? buildDefaultEvidenceRequirements(source, riskTier);
  const signoffRequirements = override?.signoffRequirements ?? buildDefaultSignoffRequirements(source, riskTier);
  const linkedWorkflowIds = override?.linkedWorkflowIds ?? [`WF-${source.id}`];
  const requiredFormIds = override?.requiredFormIds ?? source.data_source.forms_logs.filter((entry) => /^[A-Z]{2}-FM-/.test(entry));
  const readinessStatus = deriveReadinessStatus({
    documentRefs,
    documentationRecords,
    evidenceRequirements,
    signoffRequirements,
    sourceStatus,
  });

  return {
    id: source.id,
    numericId,
    controlNumber: numericId,
    name: source.control_name,
    controlName: source.control_name,
    description: source.description,
    category: source.category,
    domain: source.domain,
    riskTier,
    sourceStatus,
    readinessStatus,
    sourcePolicyIds: source.source_policy_ids,
    linkedWorkflowIds,
    requiredFormIds,
    documentRefs,
    documentationRecords,
    evidenceRequirements,
    signoffRequirements,
    verification: buildVerification(source, riskTier),
    regulatoryBasis: source.regulatory_basis,
    requiredOwner: source.required_owner,
    evidenceRequired: source.evidence_required,
    failureRisk: source.failure_risk,
    surveyorPrompt: override?.surveyorPrompt ?? `Show current documentation, execution evidence, and sign-off proving ${source.control_name}.`,
    operatorInstructions: override?.operatorInstructions ?? `Attach current evidence for ${source.id}, complete required owner sign-off, and escalate gaps to ${source.escalation_owner}.`,
    modalSummary: override?.modalSummary ?? `${source.control_name} dossier with required source documents, evidence acceptance criteria, verification cadence, and accountable sign-off.`,
    tags: override?.tags ?? [source.category, ...source.domain.split('/').map((part) => part.trim()).filter(Boolean)],
    auditTrail: buildDefaultAuditTrail(source),
    verificationLogs: buildVerificationLogTemplates(source),
    dataSource: source.data_source,
    systemModule: source.system_module,
    triggerCondition: source.trigger_condition,
    escalationOwner: source.escalation_owner,
    riskLevel: riskTier,
    highRiskIfMissing: source.risk_level === 'H',
    status: STATUS_MAP[source.status] ?? 'unknown',
    notes: derivedNotes,
  };
}

export async function loadMasterControlInventorySeed(): Promise<MasterControlItem[]> {
  const attemptedPaths = [
    MASTER_CONTROL_INVENTORY_SOURCE_PATH,
    ...MASTER_CONTROL_INVENTORY_SOURCE_PATH_FALLBACKS,
  ];

  for (const path of attemptedPaths) {
    try {
      const res = await fetch(path);
      if (!res.ok) {
        console.error('[MasterControlInventory] Dataset fetch failed', {
          path,
          status: res.status,
          statusText: res.statusText,
        });
        continue;
      }

      const payload = (await res.json()) as MasterControlSourcePayload;
      if (!payload.controls?.length) {
        console.error('[MasterControlInventory] Dataset payload was empty', { path });
        continue;
      }

      return [...payload.controls, ...EXTRA_MASTER_CONTROL_SOURCE_RECORDS].map(mapMasterControlRecord);
    } catch (error) {
      console.error('[MasterControlInventory] Dataset fetch threw an error', {
        path,
        error,
      });
    }
  }

  console.error('[MasterControlInventory] Exhausted dataset fetch paths', {
    attemptedPaths,
  });
  return FALLBACK_CONTROLS;
}

