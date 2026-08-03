// Labeled supplemental records — synthetic content added only to give the
// case its full 14-workflow coverage where the recovered 2026 QAPI source
// has no corresponding record (e.g. the source has no board-roster change
// event, so GV-WF-01 has nothing to exercise without one).
//
// These are NEVER blended silently with recovered data: every record carries
// sourcePosture: 'supplemental_uat' and the exact required sourceLabel, and
// `toExhibit` always stamps posture/sourceLabel through onto the Exhibit.

import type { Exhibit, ExhibitRelevance, GvWorkflowId, Quarter } from '../engine/caseTypes';

export const SUPPLEMENTAL_SOURCE_LABEL =
  'SUPPLEMENTAL SYNTHETIC UAT RECORD — ADDED FOR WORKFLOW COVERAGE — NOT SOURCE-RECOVERED';

export interface SupplementalRecord {
  id: string;
  sourcePosture: 'supplemental_uat';
  sourceLabel: typeof SUPPLEMENTAL_SOURCE_LABEL;
  sourceReason: string;
  relatedWorkflowIds: GvWorkflowId[];
  asOfDate: string;
  title: string;
  summary: string;
  details: string[];
}

function record(input: Omit<SupplementalRecord, 'sourcePosture' | 'sourceLabel'>): SupplementalRecord {
  return { ...input, sourcePosture: 'supplemental_uat', sourceLabel: SUPPLEMENTAL_SOURCE_LABEL };
}

export const GB_SUP_ROSTER_2026 = record({
  id: 'GB-SUP-ROSTER-2026',
  sourceReason: 'Recovered source has no board-roster change event; authored to exercise GV-WF-01.',
  relatedWorkflowIds: ['GV-WF-01'],
  asOfDate: '2026-02-10',
  title: 'Board Roster Change — Community Member Seat',
  summary: 'A community-member director\'s term expired and a replacement candidate was proposed for Board seating.',
  details: [
    'Outgoing director: term expired 2026-01-31, no disqualifying findings on file.',
    'Proposed director: community-member category, background/eligibility screen on file.',
    'Composition mix (clinical / community / financial) remains compliant if seated as proposed.',
  ],
});

export const GB_SUP_COI_001 = record({
  id: 'GB-SUP-COI-001',
  sourceReason: 'Recovered source has no disclosed conflict-of-interest event; authored to exercise GV-WF-02.',
  relatedWorkflowIds: ['GV-WF-02'],
  asOfDate: '2026-04-02',
  title: 'Conflict of Interest Disclosure — Vendor Contract Matter',
  summary: 'A director disclosed a financial interest in a vendor whose contract renewal is before the Board this quarter.',
  details: [
    'Director holds an equity interest in the vendor entity under consideration for contract renewal.',
    'Disclosure submitted in advance of the meeting per the conflict-of-interest policy.',
    'Recusal from deliberation and vote on the vendor matter is the policy-required response.',
  ],
});

export const GB_SUP_ADM_001 = record({
  id: 'GB-SUP-ADM-001',
  sourceReason: 'Recovered source has no Administrator change event; authored to exercise GV-WF-03.',
  relatedWorkflowIds: ['GV-WF-03'],
  asOfDate: '2026-05-14',
  title: 'Administrator Change Notice',
  summary: 'The incumbent Administrator has resigned effective end of quarter; an interim successor is proposed.',
  details: [
    'Incumbent Administrator resignation effective 2026-06-30.',
    'Proposed interim Administrator meets the qualification requirements on file.',
    'State notification and licensure administrator-of-record update are pending Board approval.',
  ],
});

export const GB_SUP_CM_001 = record({
  id: 'GB-SUP-CM-001',
  sourceReason: 'Recovered source has no Clinical Manager change event; authored to exercise GV-WF-04.',
  relatedWorkflowIds: ['GV-WF-04'],
  asOfDate: '2026-06-01',
  title: 'Clinical Manager Change Notice',
  summary: 'The Clinical Manager role requires backfill following an internal transfer.',
  details: [
    'Incumbent Clinical Manager transferred to a non-clinical role effective 2026-06-15.',
    'Proposed successor holds the required license and clinical-manager qualification on file.',
    'A coverage gap plan is proposed for the transition period.',
  ],
});

export const GB_SUP_BUDGET_001 = record({
  id: 'GB-SUP-BUDGET-001',
  sourceReason: 'Recovered source has no explicit CAP resourcing/budget request; authored to exercise GV-WF-07 budget authorization.',
  relatedWorkflowIds: ['GV-WF-07'],
  asOfDate: '2026-05-20',
  title: 'Budget Authorization Request — CAP Resourcing',
  summary: 'Management requests Board authorization of the staffing and system resources the current CAP identified as required to sustain the fix.',
  details: [
    'Requested resources: 0.5 FTE quality-review staffing and a documentation-audit tool license.',
    'The CAP\'s own effectiveness criteria assume these resources are in place by next quarter close.',
    'Without authorization, the CAP\'s effectiveness cannot be sustained per its own stated design.',
  ],
});

export const GB_SUP_SCOPE_001 = record({
  id: 'GB-SUP-SCOPE-001',
  sourceReason: 'Recovered source has no scope-of-services change event; authored to exercise GV-WF-10.',
  relatedWorkflowIds: ['GV-WF-10'],
  asOfDate: '2026-04-18',
  title: 'Proposed Scope of Services Change',
  summary: 'Management proposes adding a new service line not currently within the agency\'s licensed scope.',
  details: [
    'Proposed addition: a therapy service line not on the current license.',
    'State licensure amendment and accreditation notification are prerequisites, not follow-up steps.',
    'No operational start date may precede Board approval and the licensure amendment.',
  ],
});

export const GB_SUP_LIC_001 = record({
  id: 'GB-SUP-LIC-001',
  sourceReason: 'Recovered source has no licensure/accreditation renewal event; authored to exercise GV-WF-11.',
  relatedWorkflowIds: ['GV-WF-11'],
  asOfDate: '2026-03-05',
  title: 'Licensure Renewal Status',
  summary: 'The agency\'s state license renewal is due within the quarter; accreditation renewal follows next quarter.',
  details: [
    'State license renewal application status: submitted, decision pending.',
    'Accreditation renewal survey window opens next quarter.',
    'No lapse has occurred yet; Board visibility is requested to track the pending decision.',
  ],
});

export const GB_SUP_CHOW_001 = record({
  id: 'GB-SUP-CHOW-001',
  sourceReason: 'Recovered source has no change-of-ownership event; authored to exercise GV-WF-12.',
  relatedWorkflowIds: ['GV-WF-12'],
  asOfDate: '2026-07-01',
  title: 'Proposed Change of Ownership',
  summary: 'A majority-interest transaction is proposed that would constitute a change of ownership.',
  details: [
    'Proposed transaction: majority equity transfer to a new parent entity.',
    'Required notifications: state licensure, Medicare enrollment (CMS-855A), accreditation body.',
    'Board review and approval is a prerequisite to filing, not a formality after filing.',
  ],
});

export const GB_SUP_MEDIA_001 = record({
  id: 'GB-SUP-MEDIA-001',
  sourceReason: 'Recovered source has no media/public incident event; authored to exercise GV-WF-13.',
  relatedWorkflowIds: ['GV-WF-13'],
  asOfDate: '2026-06-22',
  title: 'Media Incident Notice',
  summary: 'A local news inquiry was received regarding a patient-care incident already under internal review.',
  details: [
    'Inquiry received from a local outlet requesting comment within 48 hours.',
    'Internal RCA on the underlying incident is in progress and not yet complete.',
    'No confirmed clinical findings should be disclosed publicly ahead of RCA completion.',
  ],
});

export const GB_SUP_TRAIN_001 = record({
  id: 'GB-SUP-TRAIN-001',
  sourceReason: 'Recovered source has no annual governance-training attestation event; authored to exercise GV-WF-14.',
  relatedWorkflowIds: ['GV-WF-14'],
  asOfDate: '2026-01-15',
  title: 'Annual Governance Training Attestation Status',
  summary: 'Annual Board training/attestation cycle status for the current roster.',
  details: [
    'All seated directors as of 2026-01-15 have an outstanding annual attestation requirement.',
    'One newly seated director additionally requires onboarding training before their first vote.',
  ],
});

export const GB_SUP_PACKET_001 = record({
  id: 'GB-SUP-PACKET-001',
  sourceReason: 'Authored to exercise GV-WF-05 packet-readiness gating explicitly at the exhibit level.',
  relatedWorkflowIds: ['GV-WF-05'],
  asOfDate: '2026-04-25',
  title: 'Packet Readiness Confirmation',
  summary: 'Confirmation record that the quarter\'s QAPI packet passed the readiness gates required to convene the Board.',
  details: [
    'Source integrity checked, meeting control assembled, feeder audits present, required sign-offs complete.',
    'No unresolved critical data-quality defect blocks convening on this packet.',
  ],
});

export const GB_SUP_PHI_001 = record({
  id: 'GB-SUP-PHI-001',
  sourceReason: 'Recovered source has no PHI privacy/security incident event; authored to exercise GV-WF-13 breach response.',
  relatedWorkflowIds: ['GV-WF-13'],
  asOfDate: '2026-06-25',
  title: 'PHI Privacy Incident Notice',
  summary: 'A vendor reported a possible unauthorized access to a subset of patient records.',
  details: [
    'Vendor-reported incident: possible unauthorized access to a limited patient-record subset.',
    'Business Associate Agreement audit-access terms invoked to determine scope.',
    'Breach-risk assessment and, if required, notification timelines are pending Board direction.',
  ],
});

export const SUPPLEMENTAL_RECORDS: Record<string, SupplementalRecord> = {
  [GB_SUP_ROSTER_2026.id]: GB_SUP_ROSTER_2026,
  [GB_SUP_COI_001.id]: GB_SUP_COI_001,
  [GB_SUP_ADM_001.id]: GB_SUP_ADM_001,
  [GB_SUP_CM_001.id]: GB_SUP_CM_001,
  [GB_SUP_BUDGET_001.id]: GB_SUP_BUDGET_001,
  [GB_SUP_SCOPE_001.id]: GB_SUP_SCOPE_001,
  [GB_SUP_LIC_001.id]: GB_SUP_LIC_001,
  [GB_SUP_CHOW_001.id]: GB_SUP_CHOW_001,
  [GB_SUP_MEDIA_001.id]: GB_SUP_MEDIA_001,
  [GB_SUP_TRAIN_001.id]: GB_SUP_TRAIN_001,
  [GB_SUP_PACKET_001.id]: GB_SUP_PACKET_001,
  [GB_SUP_PHI_001.id]: GB_SUP_PHI_001,
};

export interface ToExhibitOptions {
  exhibitId: string;
  quarter: Quarter;
  section: string;
  confidentiality: Exhibit['confidentiality'];
  validationState: Exhibit['validationState'];
  relevance: ExhibitRelevance;
  formIds?: string[];
}

/** Converts a supplemental record into an Exhibit, always stamping posture + sourceLabel through. */
export function toExhibit(rec: SupplementalRecord, opts: ToExhibitOptions): Exhibit {
  return {
    id: opts.exhibitId,
    sourceId: rec.id,
    quarter: opts.quarter,
    asOfDate: rec.asOfDate,
    posture: rec.sourcePosture,
    sourceLabel: rec.sourceLabel,
    confidentiality: opts.confidentiality,
    validationState: opts.validationState,
    workflowIds: rec.relatedWorkflowIds,
    formIds: opts.formIds ?? [],
    relevance: opts.relevance,
    section: opts.section,
    title: rec.title,
    summary: rec.summary,
    details: rec.details,
  };
}
