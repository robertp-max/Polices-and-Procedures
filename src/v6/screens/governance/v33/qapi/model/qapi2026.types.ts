// Normalized 2026 QAPI data contracts (§3.3). One source of truth for the
// Governing Body packet workspace and the QAPI tabletop. Every normalized
// record carries provenance. Source contradictions are PRESERVED as data-
// quality findings, never silently repaired. Synthetic supplements are labeled.
//
// Source fixture: qapi/source/MOCK_2026_QAPI.txt (synthetic — no real PHI).

export type QuarterKey = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export type SourceKind =
  | 'source_recovered'
  | 'derived_from_source'
  | 'synthetic_supplement'
  | 'unresolved';

export interface ProvenanceRef {
  sourceKind: SourceKind;
  sourceFile: string;
  sourceSection: string;
  sourceRecordIds: string[];
  derivation?: string;
  confidence: 'high' | 'medium' | 'low';
  reviewRequired: boolean;
}

/** Marker embedded on any record authored to complete a UAT workflow. */
export interface SyntheticSupplement {
  sourceKind: 'synthetic_supplement';
  supplementReason: string;
  authoredFor: 'UAT workflow completeness';
  approvedForProduction: false;
  reviewRequired: true;
  sourceRecordIds: string[];
}

export interface DateRange { start: string; end: string }

export interface QapiAgencyIdentity {
  agencyId: string;
  agencyName: string;
  agencyType: string;
  npi: string;
  state: string;
  accreditation: string;
  administratorClinId: string;
  clinicalManagerClinId: string;
  qapiChairClinId: string;
  complianceOfficerClinId: string;
}

export interface PopulationSummary {
  activeAtStart: number | null;
  activeAtClose: number | null;
  newSoc: number | null;
  discharged: number | null;
  transferred: number | null;
  episodesTracked: number | null;
  hospitalizations: number | null;
  edVisitsNoHospitalization: number | null;
  clinicianCount: number | null;
  note?: string;
}

export interface MeetingControlRecord {
  workflow: string;
  meetingDate: string;
  agendaDeadline: string;
  feederAuditDeadline: string;
  gbPackageDeadline: string;
  minutesDue: string;
  minutesOwner: string;
  policyBasis: string[];
  requiredSignoffs: string[];
}

export interface QualityMetricPoint { month: string; numerator: number | null; denominator: number | null; rate: number }

export interface QualityMetricSeries {
  metricId: string;
  indicator: string;
  target: string;
  direction: 'higher_is_better' | 'lower_is_better';
  points: QualityMetricPoint[];
  /** Quarter-close status distilled for the Board signal. */
  status: 'within' | 'watch' | 'below' | 'critical';
  pipTrigger: boolean;
  /** True when a favorable aggregate masks a worsening subgroup/linked event. */
  aggregateMasksSubgroup?: boolean;
  provenance: ProvenanceRef;
}

export interface FeederAuditSummary {
  auditId: string;
  workflowId: string;
  category: string;
  reviewerClinId: string;
  status: string;
  signedBy: string;
  signedAt: string;
  keyFinding: string;
  provenance: ProvenanceRef;
}

/** Board-facing adverse event: de-identified by default (case label, not name). */
export interface AdverseEventSummary {
  eventId: string;
  caseLabel: string;
  eventType: string;
  eventDate: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  rcaRequired: boolean;
  rcaId: string | null;
  rcaFindings: string | null;
  systemicRootCause: string | null;
  linkedCapIds: string[];
  personnelMatterSeparated: boolean;
  status: string;
  /** Restricted patient-level id — surfaced only in executive-session/tabletop exhibits. */
  restrictedPatientId?: string;
  provenance: ProvenanceRef;
}

export interface InfectionSummary {
  infxId: string;
  caseLabel: string;
  infectionType: string;
  onsetDate: string;
  resolutionDate: string | null;
  intervention: string;
  status: string;
  linkedEventId?: string;
  provenance: ProvenanceRef;
}

export interface ComplaintSummary {
  complaintId: string;
  category: string;
  complaintDate: string;
  daysToResolve: number | null;
  within5Days: boolean | null;
  status: string;
  escalatedToGb: boolean;
  provenance: ProvenanceRef;
}

export interface PipTrigger {
  triggerId: string;
  triggerType: string;
  sourceRecordIds: string[];
  policyId: string;
  severity: 'High' | 'Critical';
  findingSummary: string;
  recommendedAction: string;
  status: string;
  provenance: ProvenanceRef;
}

export interface PipLifecycleRecord {
  pipId: string;
  title: string;
  triggerId: string;
  baseline: string | null;
  approvedObjective: string | null;
  sustainabilityCriterion: string | null;
  currentQuarterEvidence: string | null;
  closureEligible: boolean;
  gbDecision: string | null;
  returnDate: string | null;
  provenance: ProvenanceRef;
}

export interface CorrectiveActionRecord {
  capId: string;
  sourceTrigger: string;
  description: string;
  ownerClinId: string;
  dueDate: string;
  status: string;
  effectivenessDemonstrated: boolean;
  provenance: ProvenanceRef;
}

/** Personnel/disciplinary — restricted; default Board view shows aggregate only. */
export interface RestrictedPersonnelMatter {
  triggerId: string;
  clinicianRef: string; // de-identified reference (id only) in restricted surface
  triggerType: string;
  severity: 'High' | 'Critical';
  findingSummary: string;
  recommendedAction: string;
  status: string;
  provenance: ProvenanceRef;
}

export interface GbEscalationMatter {
  escalationId: string;
  summary: string;
  linkedRecordIds: string[];
  provenance: ProvenanceRef;
}

export interface SourceSignoff {
  signoffId: string;
  role: string;
  signerClinId: string;
  date: string;
  status: string;
  provenance: ProvenanceRef;
}

export interface QapiDataQualityFinding {
  findingId: string;
  kind:
    | 'identity_collision'
    | 'census_discontinuity'
    | 'pip_aliasing'
    | 'missing_board_decision'
    | 'missing_signature'
    | 'missing_due_date'
    | 'synthetic_supplement'
    | 'unresolved';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  detail: string;
  originalValues: string[];
  impact: string;
  requiredReviewerDecision: string;
  affectedQuarters: QuarterKey[];
}

export interface QapiQuarter {
  key: QuarterKey;
  period: DateRange;
  normalizationStatus: 'normalized' | 'pending';
  meeting: MeetingControlRecord | null;
  population: PopulationSummary | null;
  metrics: QualityMetricSeries[];
  feederAudits: FeederAuditSummary[];
  adverseEvents: AdverseEventSummary[];
  infections: InfectionSummary[];
  complaints: ComplaintSummary[];
  pipTriggers: PipTrigger[];
  pips: PipLifecycleRecord[];
  caps: CorrectiveActionRecord[];
  disciplinaryMatters: RestrictedPersonnelMatter[];
  gbEscalations: GbEscalationMatter[];
  sourceSignoffs: SourceSignoff[];
  provenance: ProvenanceRef[];
}

export interface QapiAnnualSummary {
  normalizationStatus: 'normalized' | 'pending';
  censusArc: string | null;
  openCapsCarryForward: number | null;
  openComplaintsCarryForward: number | null;
  restrictedMattersCarryForward: number | null;
  annualReportApproved: boolean | null;
  note: string;
}

export interface QapiYear2026 {
  year: 2026;
  agency: QapiAgencyIdentity;
  quarters: Record<QuarterKey, QapiQuarter>;
  annual: QapiAnnualSummary;
  validationFindings: QapiDataQualityFinding[];
  syntheticSupplements: SyntheticSupplement[];
}
