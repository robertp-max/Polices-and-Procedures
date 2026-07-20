/**
 * Packet template registry — FR-001 selection output + §7.2 P0 rollout.
 * Pure data + pure lookup helpers. Zero runtime side effects.
 */

import type { PacketArchetypeId, PacketModuleId } from '../contracts';
import {
  QAPI_PART_I_MODULE_IDS,
  QAPI_PART_II_MODULE_IDS,
  UNIVERSAL_BACKBONE_MODULE_IDS,
} from '../contracts';

/** FR-001 availability statuses (exact PRD strings). */
export type PacketTemplateAvailability =
  | 'Available'
  | 'Planned'
  | 'Needs configuration'
  | 'Restricted';

/**
 * FR-001 Packet Template Selector — selection output fields (exact names).
 *
 * ```text
 * packet_archetype_id
 * packet_template_id
 * compatible_event_family_ids
 * compatible_workflow_ids
 * required_modules
 * required_analyses
 * required_forms
 * required_approvers
 * required_signers
 * completion_gates
 * retention_rule
 * confidentiality_rule
 * Drive_destination_pattern
 * ```
 */
export interface PacketTemplateSelectionOutput {
  packet_archetype_id: PacketArchetypeId;
  packet_template_id: string;
  compatible_event_family_ids: readonly string[];
  compatible_workflow_ids: readonly string[];
  required_modules: readonly PacketModuleId[];
  required_analyses: readonly string[];
  required_forms: readonly string[];
  required_approvers: readonly string[];
  required_signers: readonly string[];
  completion_gates: readonly string[];
  retention_rule: string;
  confidentiality_rule: string;
  Drive_destination_pattern: string;
}

/**
 * Template card metadata for the Packet Template Selector (FR-001).
 * Cards display: title, description, archetype, category, availability, last-used date.
 * Favorites and recently-used are supported via helpers (user-scoped at runtime).
 */
export interface PacketTemplateDefinition extends PacketTemplateSelectionOutput {
  title: string;
  description: string;
  /** FR-001 category for filter/grouping. */
  category: string;
  availability: PacketTemplateAvailability;
  /**
   * FR-001 last-used date (ISO-8601).
   * `null` until the selector wires user-scoped last-used tracking.
   */
  lastUsedAt: string | null;
  /**
   * Whether this template may appear in the Favorites UI.
   * Actual favorite membership is user-scoped (see `listFavoriteTemplates`).
   */
  favoriteEligible: boolean;
  /** §7.2 / §7.3 / §7.4 rollout tier when applicable. */
  rolloutTier: 'current' | 'P0' | 'P1' | 'P2' | null;
}

/** §19.4 suggested Drive hierarchy as a destination pattern. */
const DRIVE_DESTINATION_PATTERN =
  'Care Indeed Home Health/Compliance Packets/{year}/{domain}/{event_family_id}/{reporting_period}/{event_instance_id}/{packet_instance_id}/v{packet_version}/';

/** Retention placeholder — final periods are open decision PRD §28 #7. */
const RETENTION_PENDING =
  'Retain per agency records-retention schedule and applicable federal/state record rules; final archetype retention periods pending compliance approval (PRD §28 #7).';

const QAPI_MODULES: readonly PacketModuleId[] = [
  ...QAPI_PART_I_MODULE_IDS,
  ...QAPI_PART_II_MODULE_IDS,
];

const QAPI_ANALYSES = [
  'kpi-dashboard',
  'source-feeder-workflow-form-utilization',
  'detailed-findings-and-trend-analysis',
  'pip-cap-rca-personnel-review-determinations',
  'triggered-workflow-and-dependency-register',
  'prior-period-trend-comparison',
] as const;

const QAPI_COMPLETION_GATES = [
  'All required source forms complete or explicitly blocked with disclosed exception',
  'KPI values validated (no false zeros; unknown remains unknown)',
  'Prior-period packet lookup attempted; trend comparability state recorded',
  'Workflow trigger register populated for every activated downstream workflow',
  'Committee/approver decisions recorded',
  'Required signatures complete via eCIgn',
  'Canonical signed package published to governed Drive destination',
  'Zero unresolved blockers before certification and lock',
] as const;

const QAPI_POLICY_ROLES = [
  'Administrator',
  'Clinical Manager',
  'QAPI Chair',
] as const;

const DEFAULT_POLICY_ROLES = ['Authorized Approver'] as const;

const QAPI_QUARTERLY_FORMS = [
  'QA-FM-020',
  'QA-FM-021',
  'QA-FM-022',
  'QA-FM-023',
  'QA-FM-024',
  'QA-FM-025',
  'QA-FM-026',
  'QA-FM-027',
  'QA-F-020',
] as const;

const QAPI_MONTHLY_FORMS = [
  'QA-F-010',
  'QA-F-011',
  'QA-F-012',
  'QA-F-013',
  'QA-F-014',
  'QA-FM-001',
  'QA-FM-003',
] as const;

/**
 * Packet templates as data.
 * Available: Quarterly + Monthly QAPI (analytical-report).
 * P0 (§7.2): six planned / needs-configuration templates.
 */
export const PACKET_TEMPLATES: readonly PacketTemplateDefinition[] = [
  {
    packet_template_id: 'qapi-quarterly',
    packet_archetype_id: 'analytical-report',
    title: 'Quarterly QAPI Analytical Report Packet',
    description:
      'Production analytical-report packet for Quarterly QAPI governance reviews: KPI dashboard, findings, PIP/CAP/RCA determinations, workflow triggers, committee decisions, and Drive-published trend sidecars.',
    category: 'QAPI',
    availability: 'Available',
    lastUsedAt: null,
    favoriteEligible: true,
    rolloutTier: 'current',
    compatible_event_family_ids: ['qapi_meeting'],
    compatible_workflow_ids: ['QA-WF-03'],
    required_modules: QAPI_MODULES,
    required_analyses: QAPI_ANALYSES,
    required_forms: QAPI_QUARTERLY_FORMS,
    required_approvers: QAPI_POLICY_ROLES,
    required_signers: QAPI_POLICY_ROLES,
    completion_gates: QAPI_COMPLETION_GATES,
    retention_rule: RETENTION_PENDING,
    confidentiality_rule:
      'General packet is agency-confidential quality data. Personnel-identifiable findings and disciplinary materials must use the restricted personnel addendum (FR-019 / §13.4); aggregate-only in the general body.',
    Drive_destination_pattern: DRIVE_DESTINATION_PATTERN,
  },
  {
    packet_template_id: 'qapi-monthly',
    packet_archetype_id: 'analytical-report',
    title: 'Monthly QAPI Analytical Report Packet',
    description:
      'Monthly QAPI committee analytical-report packet using the same archetype and renderer as Quarterly QAPI (FR acceptance §23.1.1). Focuses on indicator dashboard, action-item roll-forward, and monthly committee record.',
    category: 'QAPI',
    availability: 'Available',
    lastUsedAt: null,
    favoriteEligible: true,
    rolloutTier: 'current',
    compatible_event_family_ids: ['qapi_meeting', 'qapi_dashboard_refresh'],
    compatible_workflow_ids: ['QA-WF-03', 'QA-WF-02'],
    required_modules: QAPI_MODULES,
    required_analyses: [
      'kpi-dashboard',
      'source-feeder-workflow-form-utilization',
      'detailed-findings-and-trend-analysis',
      'triggered-workflow-and-dependency-register',
      'prior-period-trend-comparison',
    ],
    required_forms: QAPI_MONTHLY_FORMS,
    required_approvers: QAPI_POLICY_ROLES,
    required_signers: QAPI_POLICY_ROLES,
    completion_gates: QAPI_COMPLETION_GATES,
    retention_rule: RETENTION_PENDING,
    confidentiality_rule:
      'General packet is agency-confidential quality data. Personnel-identifiable findings and disciplinary materials must use the restricted personnel addendum (FR-019 / §13.4); aggregate-only in the general body.',
    Drive_destination_pattern: DRIVE_DESTINATION_PATTERN,
  },

  /* ── §7.2 P0 packet rollout ─────────────────────────────── */
  {
    packet_template_id: 'governing-body-meeting',
    packet_archetype_id: 'meeting',
    title: 'Governing Body Meeting Packet',
    description:
      'P0 meeting packet for quarterly Governing Body oversight: agenda, QAPI/Compliance/Risk reports, motions, votes, minutes, and action items.',
    category: 'Governance',
    availability: 'Planned',
    lastUsedAt: null,
    favoriteEligible: true,
    rolloutTier: 'P0',
    compatible_event_family_ids: [
      'governing_body_meeting',
      'governing_body_prep',
      'governing_body_minutes',
      'governance_packet_review',
    ],
    compatible_workflow_ids: ['GV-WF-01'],
    required_modules: UNIVERSAL_BACKBONE_MODULE_IDS,
    required_analyses: [],
    required_forms: ['GV-F-001', 'GV-F-002', 'QA-F-020', 'CO-F-004', 'RM-F-010'],
    required_approvers: DEFAULT_POLICY_ROLES,
    required_signers: DEFAULT_POLICY_ROLES,
    completion_gates: [
      'Board packet distributed per charter lead time',
      'Quorum confirmed',
      'Minutes drafted and signed',
      'Action items assigned with owners and due dates',
    ],
    retention_rule: RETENTION_PENDING,
    confidentiality_rule:
      'Board-confidential governance materials. Restricted personnel or investigation content must not appear in the general board packet body.',
    Drive_destination_pattern: DRIVE_DESTINATION_PATTERN,
  },
  {
    packet_template_id: 'annual-qapi',
    packet_archetype_id: 'analytical-report',
    title: 'Annual QAPI Evaluation and Plan Packet',
    description:
      'P0 annual analytical-report packet for QAPI program evaluation, annual plan, and Governing Body submission.',
    category: 'QAPI',
    availability: 'Planned',
    lastUsedAt: null,
    favoriteEligible: true,
    rolloutTier: 'P0',
    compatible_event_family_ids: ['qapi_annual_eval'],
    compatible_workflow_ids: ['QA-WF-10', 'QA-WF-01'],
    required_modules: QAPI_MODULES,
    required_analyses: [
      'annual-program-evaluation',
      'kpi-dashboard',
      'detailed-findings-and-trend-analysis',
      'pip-cap-rca-personnel-review-determinations',
      'prior-period-trend-comparison',
    ],
    required_forms: ['QA-FM-010', 'QA-FM-020', 'QA-FM-021', 'QA-FM-022'],
    required_approvers: QAPI_POLICY_ROLES,
    required_signers: QAPI_POLICY_ROLES,
    completion_gates: [
      'Annual evaluation complete with all required analyses',
      'Annual plan approved',
      'Governing Body submission recorded',
      'Required signatures complete',
    ],
    retention_rule: RETENTION_PENDING,
    confidentiality_rule:
      'General packet is agency-confidential quality data. Restricted personnel content uses confidential addendum only.',
    Drive_destination_pattern: DRIVE_DESTINATION_PATTERN,
  },
  {
    packet_template_id: 'pip-capa',
    packet_archetype_id: 'pip-capa',
    title: 'PIP/CAPA Packet',
    description:
      'P0 PIP/CAPA packet for performance improvement projects, corrective action plans, effectiveness checks, and closure.',
    category: 'QAPI',
    availability: 'Needs configuration',
    lastUsedAt: null,
    favoriteEligible: true,
    rolloutTier: 'P0',
    compatible_event_family_ids: [],
    compatible_workflow_ids: ['QA-WF-04', 'QA-WF-05'],
    required_modules: UNIVERSAL_BACKBONE_MODULE_IDS,
    required_analyses: [
      'pip-baseline-and-target',
      'intervention-fidelity',
      'effectiveness-remeasurement',
    ],
    required_forms: ['QA-FM-021', 'QA-FM-005'],
    required_approvers: DEFAULT_POLICY_ROLES,
    required_signers: DEFAULT_POLICY_ROLES,
    completion_gates: [
      'PIP/CAP charter complete with baseline and target',
      'Effectiveness remeasurement recorded',
      'Closure or continuation decision documented',
    ],
    retention_rule: RETENTION_PENDING,
    confidentiality_rule:
      'Quality improvement materials. Personnel-specific CAP content restricted per FR-019 when identifiable.',
    Drive_destination_pattern: DRIVE_DESTINATION_PATTERN,
  },
  {
    packet_template_id: 'incident-rca',
    packet_archetype_id: 'incident-investigation',
    title: 'Incident/Adverse Event/RCA Packet',
    description:
      'P0 incident investigation packet for adverse events, near misses, hospitalizations, and root-cause analysis.',
    category: 'Risk',
    availability: 'Needs configuration',
    lastUsedAt: null,
    favoriteEligible: true,
    rolloutTier: 'P0',
    compatible_event_family_ids: ['incident_report', 'sentinel_event_rca'],
    compatible_workflow_ids: ['QA-WF-05'],
    required_modules: UNIVERSAL_BACKBONE_MODULE_IDS,
    required_analyses: ['incident-timeline', 'root-cause-analysis', 'corrective-action-effectiveness'],
    required_forms: ['QA-FM-026', 'QA-FM-004', 'QA-FM-005', 'CL-FM-030'],
    required_approvers: DEFAULT_POLICY_ROLES,
    required_signers: DEFAULT_POLICY_ROLES,
    completion_gates: [
      'Incident facts and timeline complete',
      'RCA documented when required',
      'Corrective actions assigned',
      'Required signatures complete',
    ],
    retention_rule: RETENTION_PENDING,
    confidentiality_rule:
      'Patient and personnel identifiers restricted. Investigation materials may require privileged/compliance classification.',
    Drive_destination_pattern: DRIVE_DESTINATION_PATTERN,
  },
  {
    packet_template_id: 'survey-poc',
    packet_archetype_id: 'survey-response',
    title: 'Survey, Deficiency, and Plan-of-Correction Packet',
    description:
      'P0 survey-response packet for ACHC/CMS/CDPH/OSHA surveys, deficiency response, and plan of correction.',
    category: 'Compliance',
    availability: 'Needs configuration',
    lastUsedAt: null,
    favoriteEligible: true,
    rolloutTier: 'P0',
    compatible_event_family_ids: ['survey_activation'],
    compatible_workflow_ids: ['CO-WF-05'],
    required_modules: UNIVERSAL_BACKBONE_MODULE_IDS,
    required_analyses: ['deficiency-mapping', 'poc-effectiveness'],
    required_forms: ['CO-FM-006', 'CO-FM-007', 'CO-FM-008', 'QA-FM-005'],
    required_approvers: DEFAULT_POLICY_ROLES,
    required_signers: DEFAULT_POLICY_ROLES,
    completion_gates: [
      'All cited deficiencies mapped to owners and due dates',
      'Plan of Correction complete',
      'Submission evidence recorded',
      'Required signatures complete',
    ],
    retention_rule: RETENTION_PENDING,
    confidentiality_rule:
      'Survey and compliance investigation materials — restricted distribution; least-privilege access.',
    Drive_destination_pattern: DRIVE_DESTINATION_PATTERN,
  },
  {
    packet_template_id: 'onboarding-competency',
    packet_archetype_id: 'employee-competency',
    title: 'Employee Onboarding and Competency Packet',
    description:
      'P0 employee-competency packet for onboarding, competency validation, clearance, and annual revalidation.',
    category: 'HR',
    availability: 'Needs configuration',
    lastUsedAt: null,
    favoriteEligible: true,
    rolloutTier: 'P0',
    compatible_event_family_ids: [
      'competency_validation',
      'competency_validation_biennial',
      'hha_aide_inservice',
      'hha_skill_observation',
      'hha_aide_observation',
      'employee_compliance_training',
      'bbp_training',
      'hipaa_training',
    ],
    compatible_workflow_ids: ['HR-WF-19', 'HR-WF-05', 'HR-WF-07', 'CL-WF-11', 'CL-WF-25'],
    required_modules: UNIVERSAL_BACKBONE_MODULE_IDS,
    required_analyses: ['competency-completion-matrix', 'skills-validation-summary'],
    required_forms: ['HR-FM-016', 'CL-FM-051', 'EN-FM-022', 'CO-FM-024'],
    required_approvers: DEFAULT_POLICY_ROLES,
    required_signers: DEFAULT_POLICY_ROLES,
    completion_gates: [
      'Required competencies validated for in-scope roles',
      'Training completion matrix complete',
      'Required signatures complete',
    ],
    retention_rule: RETENTION_PENDING,
    confidentiality_rule:
      'Personnel file materials — restricted to authorized HR/clinical leadership roles; never in general quality packet body.',
    Drive_destination_pattern: DRIVE_DESTINATION_PATTERN,
  },
] as const;

const BY_ID: ReadonlyMap<string, PacketTemplateDefinition> = new Map(
  PACKET_TEMPLATES.map((t) => [t.packet_template_id, t]),
);

/** Lookup a packet template by stable template id. */
export function getTemplate(id: string): PacketTemplateDefinition | undefined {
  return BY_ID.get(id);
}

/** Return all templates compatible with the given event family id. */
export function templatesForEventFamily(
  familyId: string,
): readonly PacketTemplateDefinition[] {
  return PACKET_TEMPLATES.filter((t) =>
    t.compatible_event_family_ids.includes(familyId),
  );
}

/** FR-001 selection output projection for a template (exact field set). */
export function toSelectionOutput(
  template: PacketTemplateDefinition,
): PacketTemplateSelectionOutput {
  return {
    packet_archetype_id: template.packet_archetype_id,
    packet_template_id: template.packet_template_id,
    compatible_event_family_ids: template.compatible_event_family_ids,
    compatible_workflow_ids: template.compatible_workflow_ids,
    required_modules: template.required_modules,
    required_analyses: template.required_analyses,
    required_forms: template.required_forms,
    required_approvers: template.required_approvers,
    required_signers: template.required_signers,
    completion_gates: template.completion_gates,
    retention_rule: template.retention_rule,
    confidentiality_rule: template.confidentiality_rule,
    Drive_destination_pattern: template.Drive_destination_pattern,
  };
}

/** All known packet archetype ids referenced by templates (for integrity checks). */
export function templateArchetypeIds(): readonly PacketArchetypeId[] {
  return PACKET_TEMPLATES.map((t) => t.packet_archetype_id);
}

/** FR-001 category filter — templates matching the given category label. */
export function templatesByCategory(
  category: string,
): readonly PacketTemplateDefinition[] {
  return PACKET_TEMPLATES.filter((t) => t.category === category);
}

/**
 * FR-001 favorites support — resolve user-scoped favorite ids to templates.
 * Only `favoriteEligible` templates are returned.
 */
export function listFavoriteTemplates(
  favoriteTemplateIds: ReadonlySet<string> | readonly string[],
): readonly PacketTemplateDefinition[] {
  const ids =
    favoriteTemplateIds instanceof Set
      ? favoriteTemplateIds
      : new Set(favoriteTemplateIds);
  return PACKET_TEMPLATES.filter(
    (t) => t.favoriteEligible && ids.has(t.packet_template_id),
  );
}

/**
 * FR-001 recently-used support — resolve ordered recent ids to templates.
 * Preserves input order; unknown ids are skipped.
 */
export function listRecentlyUsedTemplates(
  recentTemplateIdsInOrder: readonly string[],
): readonly PacketTemplateDefinition[] {
  const out: PacketTemplateDefinition[] = [];
  for (const id of recentTemplateIdsInOrder) {
    const t = BY_ID.get(id);
    if (t) out.push(t);
  }
  return out;
}

/**
 * Pure projection: attach a last-used timestamp for card display without
 * mutating the registry (registry `lastUsedAt` stays null until wired).
 */
export function withLastUsedAt(
  template: PacketTemplateDefinition,
  lastUsedAt: string | null,
): PacketTemplateDefinition {
  return { ...template, lastUsedAt };
}

/** Stable §7.2 P0 template ids (exact set). */
export const P0_TEMPLATE_IDS = [
  'governing-body-meeting',
  'annual-qapi',
  'pip-capa',
  'incident-rca',
  'survey-poc',
  'onboarding-competency',
] as const;
