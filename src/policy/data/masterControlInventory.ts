import type {
  ControlRisk,
  ControlStatus,
  MasterControlCategory,
  MasterControlDataSource,
  MasterControlItem,
  MasterControlSourcePayload,
  MasterControlSourceRecord,
} from '@/policy/types/masterControlInventory';

export const MASTER_CONTROL_INVENTORY_SOURCE_PATH =
  '/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json';

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

export function mapMasterControlRecord(source: MasterControlSourceRecord): MasterControlItem {
  const derivedNotes = normalizeDataSource(source.data_source);
  return {
    id: parseNumericId(source.id),
    controlName: source.control_name,
    description: source.description,
    category: source.category,
    domain: source.domain,
    sourcePolicyIds: source.source_policy_ids,
    regulatoryBasis: source.regulatory_basis,
    requiredOwner: source.required_owner,
    evidenceRequired: source.evidence_required,
    failureRisk: source.failure_risk,
    riskLevel: RISK_MAP[source.risk_level],
    highRiskIfMissing: source.risk_level === 'H',
    status: STATUS_MAP[source.status] ?? 'unknown',
    notes: derivedNotes,
  };
}

export async function loadMasterControlInventorySeed(): Promise<MasterControlItem[]> {
  try {
    const res = await fetch(MASTER_CONTROL_INVENTORY_SOURCE_PATH);
    if (!res.ok) return FALLBACK_CONTROLS;
    const payload = (await res.json()) as MasterControlSourcePayload;
    if (!payload.controls?.length) return FALLBACK_CONTROLS;
    return payload.controls.map(mapMasterControlRecord);
  } catch {
    return FALLBACK_CONTROLS;
  }
}

