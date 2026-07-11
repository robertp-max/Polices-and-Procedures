/**
 * Packet module registry — §10 universal backbone + §13.1 QAPI modules.
 * Pure data + pure functions only. Zero runtime side effects.
 */

import type { PacketArchetypeId, PacketModuleId } from '@/policy/packets/contracts';
import {
  QAPI_PART_I_MODULE_IDS,
  QAPI_PART_II_MODULE_IDS,
  UNIVERSAL_BACKBONE_MODULE_IDS,
} from '@/policy/packets/contracts';

/** Section kind used for ordering and analysis-before-forms enforcement. */
export type ModuleSectionKind =
  | 'analysis'
  | 'governance'
  | 'forms'
  | 'attachments'
  | 'control';

/** Descriptor for a single packet module. */
export interface PacketModuleDescriptor {
  id: PacketModuleId;
  title: string;
  /** Backbone / QAPI order number within its source table (§10 or §13.1). */
  backboneOrder: number;
  sectionKind: ModuleSectionKind;
  applicableArchetypes: readonly PacketArchetypeId[];
}

const ALL_ARCHETYPE_IDS = [
  'meeting',
  'analytical-report',
  'pip-capa',
  'incident-investigation',
  'survey-response',
  'employee-competency',
  'policy-lifecycle',
  'privacy-breach',
  'emergency-drill',
  'program-surveillance',
  'audit',
  'contract-vendor',
] as const satisfies readonly PacketArchetypeId[];

const BACKBONE_ARCHETYPES = ALL_ARCHETYPE_IDS;

const QAPI_ARCHETYPES = ['analytical-report'] as const satisfies readonly PacketArchetypeId[];

function backboneDescriptor(
  id: PacketModuleId,
  title: string,
  backboneOrder: number,
  sectionKind: ModuleSectionKind,
): PacketModuleDescriptor {
  return {
    id,
    title,
    backboneOrder,
    sectionKind,
    applicableArchetypes: BACKBONE_ARCHETYPES,
  };
}

function qapiDescriptor(
  id: PacketModuleId,
  title: string,
  backboneOrder: number,
  sectionKind: ModuleSectionKind,
): PacketModuleDescriptor {
  return {
    id,
    title,
    backboneOrder,
    sectionKind,
    applicableArchetypes: QAPI_ARCHETYPES,
  };
}

/** §10 Universal Packet Backbone — order 1–19. */
const BACKBONE_MODULES: readonly PacketModuleDescriptor[] = [
  backboneDescriptor('branded-cover', 'Branded cover', 1, 'control'),
  backboneDescriptor('packet-identity-and-status', 'Packet identity and status', 2, 'control'),
  backboneDescriptor(
    'validation-and-lock-readiness',
    'Validation and lock readiness',
    3,
    'control',
  ),
  backboneDescriptor(
    'executive-summary-or-analysis',
    'Executive summary or executive analysis',
    4,
    'analysis',
  ),
  backboneDescriptor(
    'trigger-and-originating-workflow',
    'Trigger and originating workflow',
    5,
    'governance',
  ),
  backboneDescriptor('scope-and-reporting-period', 'Scope and reporting period', 6, 'governance'),
  backboneDescriptor(
    'source-and-required-form-completion-matrix',
    'Source and required-form completion matrix',
    7,
    'analysis',
  ),
  backboneDescriptor('analytical-findings', 'Analytical findings', 8, 'analysis'),
  backboneDescriptor('risks-gaps-and-exceptions', 'Risks, gaps, and exceptions', 9, 'analysis'),
  backboneDescriptor(
    'triggered-workflows-and-resulting-actions',
    'Triggered workflows and resulting actions',
    10,
    'governance',
  ),
  backboneDescriptor('decisions-and-approvals', 'Decisions and approvals', 11, 'governance'),
  backboneDescriptor(
    'action-items-owners-and-deadlines',
    'Action items, owners, and deadlines',
    12,
    'governance',
  ),
  backboneDescriptor('evidence-index', 'Evidence index with Google Drive links', 13, 'attachments'),
  backboneDescriptor(
    'missing-evidence-disclosure',
    'Missing-evidence disclosure',
    14,
    'attachments',
  ),
  backboneDescriptor(
    'signature-and-attestation',
    'Signature and attestation page',
    15,
    'governance',
  ),
  backboneDescriptor('audit-chronology', 'Audit chronology', 16, 'control'),
  backboneDescriptor(
    'final-certification-and-lock-record',
    'Final certification and lock record',
    17,
    'control',
  ),
  backboneDescriptor('attachment-manifest', 'Attachment manifest', 18, 'attachments'),
  backboneDescriptor(
    'supporting-forms-and-evidence',
    'Supporting forms and evidence',
    19,
    'forms',
  ),
] as const;

/** §13.1 Part I — Governance and analytical report — order 1–11. */
const QAPI_PART_I_MODULES: readonly PacketModuleDescriptor[] = [
  qapiDescriptor('qapi-cover-page', 'Cover page', 1, 'control'),
  qapiDescriptor(
    'qapi-packet-control-source-validation-readiness',
    'Packet control, source validation, and readiness',
    2,
    'control',
  ),
  qapiDescriptor('qapi-executive-analysis', 'Executive analysis', 3, 'analysis'),
  qapiDescriptor('qapi-rich-kpi-dashboard', 'Rich KPI dashboard', 4, 'analysis'),
  qapiDescriptor(
    'qapi-source-feeder-workflow-form-utilization',
    'Source, feeder-workflow, and form utilization analysis',
    5,
    'analysis',
  ),
  qapiDescriptor(
    'qapi-detailed-findings-and-trend-analysis',
    'Detailed findings and trend analysis',
    6,
    'analysis',
  ),
  qapiDescriptor(
    'qapi-pip-cap-rca-personnel-review-determinations',
    'PIP, CAP, RCA, personnel-review, and other action determinations',
    7,
    'analysis',
  ),
  qapiDescriptor(
    'qapi-triggered-workflow-and-dependency-register',
    'Triggered Workflow and Dependency Register',
    8,
    'governance',
  ),
  qapiDescriptor(
    'qapi-committee-and-governing-body-decisions',
    'QAPI Committee and Governing Body decisions requested',
    9,
    'governance',
  ),
  qapiDescriptor(
    'qapi-action-item-workflow-accountability-register',
    'Action-item, workflow, and accountability register',
    10,
    'governance',
  ),
  qapiDescriptor(
    'qapi-approvals-ecign-lock-readiness',
    'Approvals, eCIgn status, and lock-readiness certification',
    11,
    'control',
  ),
] as const;

/** §13.1 Part II — Supporting attachments — order 12–18. */
const QAPI_PART_II_MODULES: readonly PacketModuleDescriptor[] = [
  qapiDescriptor('qapi-attachment-manifest', 'Attachment manifest', 12, 'attachments'),
  qapiDescriptor('qapi-completed-source-forms', 'Completed source forms', 13, 'forms'),
  qapiDescriptor(
    'qapi-generated-pip-cap-rca-forms',
    'Generated PIP/CAP/RCA/corrective-action forms',
    14,
    'forms',
  ),
  qapiDescriptor(
    'qapi-triggered-workflow-execution-packages',
    'Triggered workflow execution packages',
    15,
    'forms',
  ),
  qapiDescriptor(
    'qapi-confidential-personnel-review-addendum-reference',
    'Confidential personnel-review addendum reference',
    16,
    'attachments',
  ),
  qapiDescriptor(
    'qapi-source-derivation-reconciliation-provenance',
    'Source derivation, reconciliation, and evidence provenance',
    17,
    'attachments',
  ),
  qapiDescriptor(
    'qapi-superseded-or-excluded-source-register',
    'Superseded or excluded-source register',
    18,
    'attachments',
  ),
] as const;

/** Every registered module descriptor in declaration order. */
export const ALL_MODULES: readonly PacketModuleDescriptor[] = [
  ...BACKBONE_MODULES,
  ...QAPI_PART_I_MODULES,
  ...QAPI_PART_II_MODULES,
] as const;

const MODULE_BY_ID: ReadonlyMap<PacketModuleId, PacketModuleDescriptor> = new Map(
  ALL_MODULES.map((m) => [m.id, m]),
);

/** Lookup a module descriptor by id. Throws when unknown (never invents data). */
export function getModule(id: PacketModuleId): PacketModuleDescriptor {
  const found = MODULE_BY_ID.get(id);
  if (!found) {
    throw new Error(`Unknown packet module id: ${id}`);
  }
  return found;
}

/** True when the module id is registered. */
export function hasModule(id: string): id is PacketModuleId {
  return MODULE_BY_ID.has(id as PacketModuleId);
}

/** Return descriptors for the given ids, preserving input order. */
export function getModulesInOrder(
  moduleIds: readonly PacketModuleId[],
): PacketModuleDescriptor[] {
  return moduleIds.map((id) => getModule(id));
}

/**
 * Sort module ids by backboneOrder (stable for equal order).
 * Modules from different source tables share numeric order only within their table;
 * QAPI modules sort after universal backbone when orders tie by comparing id.
 */
export function sortModulesByBackboneOrder(
  moduleIds: readonly PacketModuleId[],
): PacketModuleId[] {
  return [...moduleIds].sort((a, b) => {
    const da = getModule(a);
    const db = getModule(b);
    if (da.backboneOrder !== db.backboneOrder) {
      return da.backboneOrder - db.backboneOrder;
    }
    return a.localeCompare(b);
  });
}

/** Modules of a given section kind, in registry declaration order. */
export function getModulesBySectionKind(
  sectionKind: ModuleSectionKind,
): readonly PacketModuleDescriptor[] {
  return ALL_MODULES.filter((m) => m.sectionKind === sectionKind);
}

/**
 * Assert that every `analysis` module appears before every `forms` module
 * in the provided ordered module list (PRD §10 analytical-packet rule).
 * Used by analytical archetypes (analytical-report, meeting).
 */
export function assertAnalysisBeforeForms(moduleIds: readonly PacketModuleId[]): void {
  let firstFormsIndex = -1;
  let lastAnalysisIndex = -1;

  for (let i = 0; i < moduleIds.length; i++) {
    const id = moduleIds[i]!;
    const kind = getModule(id).sectionKind;
    if (kind === 'forms' && firstFormsIndex < 0) {
      firstFormsIndex = i;
    }
    if (kind === 'analysis') {
      lastAnalysisIndex = i;
    }
  }

  if (firstFormsIndex >= 0 && lastAnalysisIndex >= 0 && lastAnalysisIndex > firstFormsIndex) {
    const analysisId = moduleIds[lastAnalysisIndex]!;
    const formsId = moduleIds[firstFormsIndex]!;
    throw new Error(
      `Analysis module "${analysisId}" (index ${lastAnalysisIndex}) appears after forms module "${formsId}" (index ${firstFormsIndex}). Analytical packets must place analysis before forms.`,
    );
  }
}

/** Ordered §10 backbone module ids (re-export convenience). */
export const BACKBONE_MODULE_ORDER: readonly PacketModuleId[] = UNIVERSAL_BACKBONE_MODULE_IDS;

/** Ordered §13.1 Part I module ids. */
export const QAPI_PART_I_MODULE_ORDER: readonly PacketModuleId[] = QAPI_PART_I_MODULE_IDS;

/** Ordered §13.1 Part II module ids. */
export const QAPI_PART_II_MODULE_ORDER: readonly PacketModuleId[] = QAPI_PART_II_MODULE_IDS;

/** Full §13.1 QAPI module order (Part I then Part II). */
export const QAPI_FULL_MODULE_ORDER: readonly PacketModuleId[] = [
  ...QAPI_PART_I_MODULE_IDS,
  ...QAPI_PART_II_MODULE_IDS,
];
