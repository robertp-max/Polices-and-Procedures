/**
 * Mandated-event packet map — §16.2 + §29 #3.
 * One MandatedEventPacketDefinition per distinct event family
 * (family key = eventSubType) across the three event sources.
 *
 * Pure data + pure functions. Uncertain mappings are never guessed:
 * status is `needs-review` or `gap` with gapReason.
 */

import type {
  MandatedEventPacketDefinition,
  PacketArchetypeId,
  PacketCompletionGate,
  PacketConfidentialityRule,
} from '../contracts';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { MANDATED_EVENTS_EXPANDED } from '@/policy/data/mandatedEventsExpanded';
import { MULTI_YEAR_EVENTS } from '@/policy/data/multiYearEvents';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { FORMS_CATALOG } from '@/policy/data/formsCatalog';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';

/** Known form IDs from FORMS_CATALOG + FORMS_DATASET (PRD form resolution). */
const KNOWN_FORM_IDS: ReadonlySet<string> = new Set([
  ...Object.keys(FORMS_CATALOG),
  ...FORMS_DATASET.map((f) => f.id),
]);

const WORKFLOW_IDS: ReadonlySet<string> = new Set(Object.keys(WORKFLOWS));

/**
 * Explicit high-confidence archetype mappings from PRD §9 primary uses.
 * Families absent here receive a conservative provisional archetype and
 * `needs-review` (never silently asserted as resolved).
 */
const ARCHETYPE_BY_FAMILY: Readonly<Record<string, PacketArchetypeId>> = {
  /* QAPI / analytical */
  qapi_meeting: 'analytical-report',
  qapi_dashboard_refresh: 'analytical-report',
  qapi_annual_eval: 'analytical-report',

  /* Meeting */
  governing_body_meeting: 'meeting',
  governing_body_prep: 'meeting',
  governing_body_minutes: 'meeting',
  governance_packet_review: 'meeting',
  risk_management_committee: 'meeting',

  /* Incident / RCA */
  incident_report: 'incident-investigation',
  sentinel_event_rca: 'incident-investigation',
  incident_response_audit: 'incident-investigation',

  /* Survey / POC */
  survey_activation: 'survey-response',

  /* Employee competency */
  competency_validation: 'employee-competency',
  competency_validation_biennial: 'employee-competency',
  hha_aide_inservice: 'employee-competency',
  hha_skill_observation: 'employee-competency',
  hha_aide_observation: 'employee-competency',
  employee_compliance_training: 'employee-competency',
  bbp_training: 'employee-competency',
  hipaa_training: 'employee-competency',
  ep_staff_training: 'employee-competency',

  /* Policy lifecycle */
  policy_review_annual: 'policy-lifecycle',
  policy_framework_review: 'policy-lifecycle',

  /* Privacy / breach (security incidents provisional) */
  security_incidents_review: 'privacy-breach',

  /* Emergency preparedness */
  ep_exercise: 'emergency-drill',
  ep_plan_review: 'emergency-drill',
  emergency_preparedness_audit: 'emergency-drill',

  /* Surveillance */
  infection_control_review: 'program-surveillance',
  infection_control_review_quarterly: 'program-surveillance',
  infection_control_audit: 'program-surveillance',

  /* Audit */
  clinical_record_audit: 'audit',
  clinical_record_completeness_audit: 'audit',
  plan_of_care_audit: 'audit',
  oasis_accuracy_audit: 'audit',
  visit_documentation_audit: 'audit',
  medical_necessity_audit: 'audit',
  medication_management_audit: 'audit',
  care_coordination_audit: 'audit',
  missed_visit_audit: 'audit',
  orders_alignment_audit: 'audit',
  internal_compliance_audit: 'audit',
  documentation_alignment_audit: 'audit',
  pre_bill_audit: 'audit',
  post_bill_audit: 'audit',
  authorization_audit: 'audit',
  license_exclusion_audit: 'audit',
  staff_file_audit: 'audit',
  oig_sam_exclusion_check: 'audit',
  system_activity_review: 'audit',
  vulnerability_scan: 'audit',
  security_risk_analysis: 'audit',
  compliance_effectiveness_review: 'audit',
  compliance_effectiveness_biennial: 'audit',
  compliance_comprehensive_review: 'audit',
  external_compliance_review: 'audit',
  enterprise_risk_assessment: 'audit',
  oig_workplan_review: 'audit',

  /* Contract / vendor — none firmly identified in current event families */

  /* Billing / finance operational cycles → audit (billing/claims audit family) */
  claims_submission: 'audit',
  billing_hold_review: 'audit',
  denial_management_review: 'audit',
  physician_signatures: 'audit',
  episode_review: 'audit',

  /* Compliance reporting / program evaluation */
  compliance_report_monthly: 'analytical-report',
  compliance_report_weekly: 'analytical-report',
  complaint_investigation: 'incident-investigation',
  hhcahps_filing: 'analytical-report',
  strategic_assessment: 'analytical-report',
  coi_disclosure: 'policy-lifecycle',
  risk_mitigation_plan: 'audit',
};

/** Provisional archetype when family is not in the explicit map — always needs-review. */
function provisionalArchetype(domain: string): PacketArchetypeId {
  switch (domain) {
    case 'QAPI':
      return 'analytical-report';
    case 'Governance':
      return 'meeting';
    case 'Risk':
      return 'incident-investigation';
    case 'Clinical':
      return 'audit';
    case 'Compliance':
      return 'audit';
    case 'Finance':
      return 'audit';
    case 'IT/Security':
      return 'privacy-breach';
    case 'Operations':
      return 'emergency-drill';
    default:
      return 'audit';
  }
}

interface FamilyAggregate {
  eventFamilyId: string;
  eventTitle: string;
  domain: string;
  cadences: Set<string>;
  workflowIds: Set<string>;
  policyRefs: Set<string>;
  formIds: Set<string>;
  approvalRoles: Set<string>;
  signerRoles: Set<string>;
  isContext: boolean;
  categories: Set<string>;
}

function formIdFromEvidence(item: { id: string; formId?: string }): string | null {
  if (item.formId && item.formId.trim()) return item.formId.trim();
  // requiredForms[].id is often an evidence row id, not a form id — only accept
  // ids that look like catalog/dataset form identifiers.
  const id = item.id?.trim() ?? '';
  if (/^(?:[A-Z]{2,}-F(?:M)?-\d+|[A-Z]{2,}-FM-[A-Z0-9-]+)$/i.test(id)) return id;
  return null;
}

function collectFamilies(events: readonly RegulatoryEvent[]): Map<string, FamilyAggregate> {
  const map = new Map<string, FamilyAggregate>();
  for (const e of events) {
    const familyId = e.eventSubType;
    if (!familyId) continue;

    let agg = map.get(familyId);
    if (!agg) {
      agg = {
        eventFamilyId: familyId,
        eventTitle: e.title,
        domain: e.domain,
        cadences: new Set(),
        workflowIds: new Set(),
        policyRefs: new Set(),
        formIds: new Set(),
        approvalRoles: new Set(),
        signerRoles: new Set(),
        isContext: Boolean(e.isContext),
        categories: new Set(),
      };
      map.set(familyId, agg);
    }

    // Prefer a stable human title: keep the first non-empty; upgrade when a
    // clearer quarterly QAPI title is seen for qapi_meeting.
    if (familyId === 'qapi_meeting' && /quarterly|Q[1-4]\s+QAPI/i.test(e.title)) {
      agg.eventTitle = e.title;
    }

    agg.cadences.add(e.cadence);
    if (e.workflowId) agg.workflowIds.add(e.workflowId);
    if (e.category) agg.categories.add(e.category);
    if (e.isContext) agg.isContext = true;
    for (const p of e.policyRefs ?? []) agg.policyRefs.add(p);
    for (const f of e.requiredForms ?? []) {
      const fid = formIdFromEvidence(f);
      if (fid) agg.formIds.add(fid);
    }
    for (const step of e.processFlow ?? []) {
      for (const fid of step.requiredFormIds ?? []) {
        if (fid) agg.formIds.add(fid);
      }
    }
    for (const a of e.approvals ?? []) {
      if (a.approverRole) agg.approvalRoles.add(a.approverRole);
    }
    for (const s of e.minutes?.signOffRoles ?? []) {
      agg.signerRoles.add(s);
    }
  }
  return map;
}

function defaultConfidentiality(archetypeId: PacketArchetypeId): PacketConfidentialityRule[] {
  if (
    archetypeId === 'employee-competency' ||
    archetypeId === 'privacy-breach' ||
    archetypeId === 'incident-investigation'
  ) {
    return [
      {
        ruleId: 'restricted-personnel-or-phi',
        classification: 'restricted',
        restrictedToRoles: [
          'Administrator',
          'Director of Nursing',
          'Compliance Officer',
          'HR Lead',
          'Clinical Manager',
        ],
        watermarkText: 'CONFIDENTIAL — RESTRICTED ACCESS',
        separateAddendum: true,
        redactFromGeneralPacket: true,
        aggregateOnlyInGeneralPacket: true,
      },
    ];
  }
  return [
    {
      ruleId: 'agency-confidential',
      classification: 'agency-confidential',
      restrictedToRoles: [],
      watermarkText: null,
      separateAddendum: false,
      redactFromGeneralPacket: false,
      aggregateOnlyInGeneralPacket: false,
    },
  ];
}

function defaultCompletionGates(
  familyId: string,
  formIds: readonly string[],
): PacketCompletionGate[] {
  return [
    {
      gateId: `${familyId}-forms-complete`,
      description: 'Required forms complete or blocked with disclosed exception',
      appliesAtStatus: 'READY_FOR_APPROVAL',
      requiredModuleIds: [],
      requiredFormIds: [...formIds],
      requiredEvidenceTypes: [],
      requiresZeroBlockers: true,
      requiresApprovals: true,
      requiresSignatures: true,
      requiresDrivePublication: false,
    },
    {
      gateId: `${familyId}-sign-and-publish`,
      description: 'Required signatures complete; Drive publication when mandatory for archetype',
      appliesAtStatus: 'PUBLISHED',
      requiredModuleIds: [],
      requiredFormIds: [],
      requiredEvidenceTypes: [],
      requiresZeroBlockers: true,
      requiresApprovals: true,
      requiresSignatures: true,
      requiresDrivePublication: true,
    },
  ];
}

function resolveCanonicalWorkflow(workflowIds: Set<string>): {
  canonicalWorkflowId: string;
  workflowOk: boolean;
  unresolvedWorkflows: string[];
} {
  const list = [...workflowIds];
  const valid = list.filter((id) => WORKFLOW_IDS.has(id));
  const invalid = list.filter((id) => !WORKFLOW_IDS.has(id));
  if (valid.length === 1) {
    return { canonicalWorkflowId: valid[0]!, workflowOk: true, unresolvedWorkflows: invalid };
  }
  if (valid.length > 1) {
    // Prefer the first stable sorted id — multi-workflow families need review.
    const sorted = [...valid].sort();
    return {
      canonicalWorkflowId: sorted[0]!,
      workflowOk: true,
      unresolvedWorkflows: invalid,
    };
  }
  if (list.length === 0) {
    return { canonicalWorkflowId: '', workflowOk: false, unresolvedWorkflows: [] };
  }
  return {
    canonicalWorkflowId: list[0]!,
    workflowOk: false,
    unresolvedWorkflows: list,
  };
}

function buildDefinition(agg: FamilyAggregate): MandatedEventPacketDefinition {
  const explicitArchetype = ARCHETYPE_BY_FAMILY[agg.eventFamilyId];
  const archetypeId = explicitArchetype ?? provisionalArchetype(agg.domain);
  const archetypeExplicit = explicitArchetype !== undefined;

  const allForms = [...agg.formIds].sort();
  const knownForms = allForms.filter((id) => KNOWN_FORM_IDS.has(id));
  const unknownForms = allForms.filter((id) => !KNOWN_FORM_IDS.has(id));

  const { canonicalWorkflowId, workflowOk, unresolvedWorkflows } = resolveCanonicalWorkflow(
    agg.workflowIds,
  );

  const multiCadence = agg.cadences.size > 1;
  const multiWorkflow = agg.workflowIds.size > 1;

  const reasons: string[] = [];
  let status: MandatedEventPacketDefinition['status'] = 'resolved';

  if (agg.isContext || agg.eventFamilyId === 'agency_holiday' || agg.domain === 'Holiday') {
    status = 'gap';
    reasons.push(
      'Context/holiday event — not a mandated compliance packet family; no packet archetype workflow applies.',
    );
  } else if (!canonicalWorkflowId) {
    status = 'gap';
    reasons.push(
      'No workflowId present on any instance of this event family; cannot bind canonicalWorkflowId.',
    );
  } else if (!workflowOk) {
    status = 'gap';
    reasons.push(
      `canonicalWorkflowId "${canonicalWorkflowId}" is not a key in WORKFLOWS; unresolved workflow ids: ${unresolvedWorkflows.join(', ') || canonicalWorkflowId}.`,
    );
  }

  if (status !== 'gap') {
    if (!archetypeExplicit) {
      status = 'needs-review';
      reasons.push(
        `No explicit PRD §9 archetype mapping for family "${agg.eventFamilyId}"; provisional archetype "${archetypeId}" assigned from domain "${agg.domain}" and requires human review.`,
      );
    }
    if (unknownForms.length > 0) {
      status = 'needs-review';
      reasons.push(
        `Unresolvable form ids (not in FORMS_CATALOG or FORMS_DATASET): ${unknownForms.join(', ')}. Known forms retained in requiredFormIds.`,
      );
    }
    if (multiCadence && agg.eventFamilyId === 'qapi_meeting') {
      status = 'needs-review';
      reasons.push(
        'Family qapi_meeting spans Monthly and Quarterly cadences under one eventSubType; Quarterly maps to template qapi-quarterly and Monthly to qapi-monthly — cadence split may need a future family key refinement.',
      );
    } else if (multiCadence) {
      status = 'needs-review';
      reasons.push(
        `Multiple cadences observed for one eventSubType (${[...agg.cadences].join(', ')}); confirm single packet binding is correct.`,
      );
    }
    if (multiWorkflow) {
      status = 'needs-review';
      reasons.push(
        `Multiple workflowIds observed (${[...agg.workflowIds].join(', ')}); canonicalWorkflowId set to "${canonicalWorkflowId}" pending review.`,
      );
    }
  }

  // Analyses only asserted when QAPI analytical families are well-known.
  const requiredAnalysisIds =
    archetypeId === 'analytical-report' &&
    (agg.eventFamilyId === 'qapi_meeting' ||
      agg.eventFamilyId === 'qapi_dashboard_refresh' ||
      agg.eventFamilyId === 'qapi_annual_eval')
      ? [
          'kpi-dashboard',
          'source-feeder-workflow-form-utilization',
          'detailed-findings-and-trend-analysis',
          'pip-cap-rca-personnel-review-determinations',
          'triggered-workflow-and-dependency-register',
          'prior-period-trend-comparison',
        ]
      : [];

  const subtype =
    agg.eventFamilyId === 'qapi_meeting' && agg.cadences.has('Quarterly')
      ? 'quarterly'
      : agg.cadences.size === 1
        ? [...agg.cadences][0]!.toLowerCase()
        : null;

  const def: MandatedEventPacketDefinition = {
    eventFamilyId: agg.eventFamilyId,
    eventTitle: agg.eventTitle,
    archetypeId,
    subtype,
    canonicalWorkflowId,
    policyRefs: [...agg.policyRefs].sort(),
    requiredAnalysisIds,
    requiredFormIds: knownForms,
    conditionalFormRules: [],
    requiredEvidenceTypes: knownForms.length > 0 ? ['required-form-evidence'] : [],
    requiredApprovalRoles: [...agg.approvalRoles].sort(),
    requiredSignerRoles: [...agg.signerRoles].sort(),
    allowedDualCapacitySignatures: [],
    completionGates: defaultCompletionGates(agg.eventFamilyId, knownForms),
    confidentialityRules: defaultConfidentiality(archetypeId),
    retentionRule:
      'Retain per agency records-retention schedule and applicable federal/state record rules; final archetype retention periods pending compliance approval (PRD §28 #7).',
    driveDestinationTemplate:
      'Care Indeed Home Health/Compliance Packets/{year}/{domain}/{event_family_id}/{reporting_period}/{event_instance_id}/{packet_instance_id}/v{packet_version}/',
    status,
  };

  if (reasons.length > 0) {
    def.gapReason = reasons.join(' ');
  }

  return def;
}

/** Union of the three mandated-event sources (deduped by eventSubType). */
export function collectDistinctEventFamilies(): Map<string, FamilyAggregate> {
  const merged = new Map<string, FamilyAggregate>();
  const sources: readonly (readonly RegulatoryEvent[])[] = [
    REGULATORY_EVENTS,
    MANDATED_EVENTS_EXPANDED,
    MULTI_YEAR_EVENTS,
  ];
  for (const src of sources) {
    const part = collectFamilies(src);
    for (const [id, agg] of part) {
      const existing = merged.get(id);
      if (!existing) {
        merged.set(id, agg);
        continue;
      }
      // Merge aggregates.
      if (id === 'qapi_meeting' && /quarterly|Q[1-4]\s+QAPI/i.test(agg.eventTitle)) {
        existing.eventTitle = agg.eventTitle;
      }
      for (const c of agg.cadences) existing.cadences.add(c);
      for (const w of agg.workflowIds) existing.workflowIds.add(w);
      for (const p of agg.policyRefs) existing.policyRefs.add(p);
      for (const f of agg.formIds) existing.formIds.add(f);
      for (const a of agg.approvalRoles) existing.approvalRoles.add(a);
      for (const s of agg.signerRoles) existing.signerRoles.add(s);
      for (const cat of agg.categories) existing.categories.add(cat);
      if (agg.isContext) existing.isContext = true;
    }
  }
  return merged;
}

function buildMap(): readonly MandatedEventPacketDefinition[] {
  const families = collectDistinctEventFamilies();
  const defs = [...families.values()]
    .map(buildDefinition)
    .sort((a, b) => a.eventFamilyId.localeCompare(b.eventFamilyId));
  return defs;
}

/** Full mandated-event packet map (§16.2) — one entry per distinct family. */
export const EVENT_PACKET_MAP: readonly MandatedEventPacketDefinition[] = buildMap();

const BY_FAMILY: ReadonlyMap<string, MandatedEventPacketDefinition> = new Map(
  EVENT_PACKET_MAP.map((d) => [d.eventFamilyId, d]),
);

/** Lookup packet definition by event family id (eventSubType). */
export function getEventPacketDefinition(
  eventFamilyId: string,
): MandatedEventPacketDefinition | undefined {
  return BY_FAMILY.get(eventFamilyId);
}

/** All mapped family ids. */
export function listMappedEventFamilyIds(): readonly string[] {
  return EVENT_PACKET_MAP.map((d) => d.eventFamilyId);
}

/** Entries with status needs-review or gap (for coverage / gap report §29 #11/#12). */
export function listUnresolvedOrGapEntries(): readonly MandatedEventPacketDefinition[] {
  return EVENT_PACKET_MAP.filter((d) => d.status === 'needs-review' || d.status === 'gap');
}

/** True when a form id resolves against FORMS_CATALOG or FORMS_DATASET. */
export function isKnownFormId(formId: string): boolean {
  return KNOWN_FORM_IDS.has(formId);
}

/** True when a workflow id exists in WORKFLOWS. */
export function isKnownWorkflowId(workflowId: string): boolean {
  return WORKFLOW_IDS.has(workflowId);
}
