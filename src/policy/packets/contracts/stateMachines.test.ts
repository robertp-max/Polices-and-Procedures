/**
 * WP-0.1 state machine + vocabulary unit tests.
 */
import { describe, expect, it } from 'vitest';
import {
  ALLOWED_TRANSITIONS,
  assertPacketTransition,
  assertSignatureTransition,
  assertSupplementalTransition,
  assertTransition,
  assertTriggerTransition,
  isAllowedPacketTransition,
  isAllowedSignatureTransition,
  isAllowedSupplementalTransition,
  isAllowedTransition,
  isAllowedTriggerTransition,
  isTerminalPacketStatus,
  isTerminalSignatureStatus,
  isTerminalSupplementalStatus,
  isTerminalTriggerStatus,
  PACKET_LIFECYCLE_TRANSITIONS,
  SIGNATURE_LIFECYCLE_TRANSITIONS,
  SUPPLEMENTAL_LIFECYCLE_TRANSITIONS,
  TRIGGER_LIFECYCLE_TRANSITIONS,
} from './stateMachines';
import type { PacketLifecycleStatus } from './packetInstance';
import { APPENDIX_D_PACKET_STATUS_VOCABULARY } from './packetInstance';
import {
  COMPARABILITY_STATES,
  APPENDIX_D_TREND_STATUS_VOCABULARY,
  APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY,
} from './trends';
import { WORKFLOW_DECISION_STATES } from './triggers';
import type { TriggerLifecycleStatus } from './triggers';
import type { SupplementalLifecycleStatus } from './supplemental';
import type { SignatureLifecycleStatus } from './envelope';
import {
  SUPPLEMENTAL_CLASSIFICATION_OPTIONS,
  SUPPLEMENTAL_DESTINATION_OPTIONS,
} from './supplemental';
import { PACKET_AUDIT_EVENT_TYPES } from './audit';
import { EDIT_IMPACT_DIMENSION_KEYS } from './validation';
import {
  UNIVERSAL_BACKBONE_MODULE_IDS,
  QAPI_PART_I_MODULE_IDS,
  QAPI_PART_II_MODULE_IDS,
} from './archetype';

/* ── Vocabulary exact-match fixtures (PRD text) ───────────────────── */

const PRD_COMPARABILITY = [
  'COMPARABLE',
  'COMPARABLE WITH LIMITATION',
  'NOT COMPARABLE — DEFINITION CHANGED',
  'NOT COMPARABLE — COHORT CHANGED',
  'NOT COMPARABLE — UNIT CHANGED',
  'PRIOR DATA UNAVAILABLE',
  'PRIOR DATA CONFLICTED',
] as const;

const PRD_FR012 = [
  'NOT TRIGGERED',
  'CANDIDATE — NEEDS VALIDATION',
  'PENDING AUTHORIZED REVIEW',
  'CONFIRMED — NOT YET ACTIVATED',
  'ACTIVATED',
  'LINKED TO EXISTING ACTIVE WORKFLOW',
  'CONTINUED FROM PRIOR PERIOD',
  'BLOCKED',
  'ESCALATED',
  'SUSTAINMENT MONITORING',
  'CLOSED',
  'WORKFLOW UNRESOLVED',
] as const;

const PRD_APPENDIX_D_PACKET = [
  'Source collection',
  'Draft generated',
  'Under analysis',
  'Ready for review',
  'Under review',
  'Editing',
  'Validation required',
  'Blocked',
  'Ready for approval',
  'Approved for signature',
  'Signer confirmation',
  'eCIgn preparing',
  'Sent for signature',
  'Partially signed',
  'Fully signed',
  'Signed package building',
  'Certification review',
  'Certified',
  'Drive publishing',
  'Published',
  'Locked',
  'Returned for correction',
  'Cancelled',
  'Superseded',
  'Amendment required',
] as const;

const PRD_APPENDIX_D_TREND = [
  'Comparable',
  'Comparable with limitation',
  'Not comparable — definition changed',
  'Not comparable — cohort changed',
  'Not comparable — unit changed',
  'Prior data unavailable',
  'Prior data conflicted',
] as const;

const PRD_APPENDIX_D_DATA_VALIDATION = [
  'Validated',
  'Validated with limitation',
  'Provisional — human review required',
  'Conflicted — reconciliation required',
  'Unknown — not recovered',
  'Excluded',
] as const;

/** §10 Universal Packet Backbone — exact ordered module IDs (19). */
const PRD_BACKBONE_MODULE_IDS = [
  'branded-cover',
  'packet-identity-and-status',
  'validation-and-lock-readiness',
  'executive-summary-or-analysis',
  'trigger-and-originating-workflow',
  'scope-and-reporting-period',
  'source-and-required-form-completion-matrix',
  'analytical-findings',
  'risks-gaps-and-exceptions',
  'triggered-workflows-and-resulting-actions',
  'decisions-and-approvals',
  'action-items-owners-and-deadlines',
  'evidence-index',
  'missing-evidence-disclosure',
  'signature-and-attestation',
  'audit-chronology',
  'final-certification-and-lock-record',
  'attachment-manifest',
  'supporting-forms-and-evidence',
] as const;

/** §13.1 QAPI Part I — exact ordered module IDs (11). */
const PRD_QAPI_PART_I_MODULE_IDS = [
  'qapi-cover-page',
  'qapi-packet-control-source-validation-readiness',
  'qapi-executive-analysis',
  'qapi-rich-kpi-dashboard',
  'qapi-source-feeder-workflow-form-utilization',
  'qapi-detailed-findings-and-trend-analysis',
  'qapi-pip-cap-rca-personnel-review-determinations',
  'qapi-triggered-workflow-and-dependency-register',
  'qapi-committee-and-governing-body-decisions',
  'qapi-action-item-workflow-accountability-register',
  'qapi-approvals-ecign-lock-readiness',
] as const;

/** §13.1 QAPI Part II — exact ordered module IDs (7). */
const PRD_QAPI_PART_II_MODULE_IDS = [
  'qapi-attachment-manifest',
  'qapi-completed-source-forms',
  'qapi-generated-pip-cap-rca-forms',
  'qapi-triggered-workflow-execution-packages',
  'qapi-confidential-personnel-review-addendum-reference',
  'qapi-source-derivation-reconciliation-provenance',
  'qapi-superseded-or-excluded-source-register',
] as const;

/** FR-019 classification options — exact PRD strings (15). */
const PRD_FR019_CLASSIFICATIONS = [
  'Source evidence',
  'Corrected source data',
  'Supplemental evidence',
  'Meeting discussion',
  'Management explanation',
  'Reviewer note',
  'Packet narrative',
  'KPI input',
  'Finding response',
  'Corrective-action update',
  'Workflow update',
  'Signature/approval information',
  'Attachment',
  'Confidential personnel information',
  'Legal/privileged information',
] as const;

/** FR-019 destination options — exact PRD strings (12). */
const PRD_FR019_DESTINATIONS = [
  'Executive analysis',
  'Specific finding',
  'KPI',
  'Triggered workflow',
  'Action item',
  'Specific form',
  'New attachment',
  'Evidence index',
  'Confidential addendum',
  'Replace/correct value',
  'Reviewer note only',
  'Exclude from final packet',
] as const;

/** FR-022 edit impact dimension keys — exact ordered list from PRD (17). */
const PRD_FR022_IMPACT_DIMENSION_KEYS = [
  'kpiCalculations',
  'trends',
  'findings',
  'riskRatings',
  'pipCapRcaDecisions',
  'workflowTriggersAndInstances',
  'requiredForms',
  'actions',
  'governingBodyRecommendations',
  'approvals',
  'signers',
  'attachments',
  'confidentiality',
  'hashes',
  'pagination',
  'ecignEnvelopeValidity',
  'lockEligibility',
] as const;

/**
 * Exact §17.1 packet lifecycle ALLOWED_TRANSITIONS successor sets.
 * Any future shortcut re-introduction fails this snapshot.
 */
const EXPECTED_PACKET_LIFECYCLE_TRANSITIONS: Record<
  PacketLifecycleStatus,
  readonly PacketLifecycleStatus[]
> = {
  SOURCE_COLLECTION: ['DRAFT_GENERATED', 'BLOCKED', 'CANCELLED'],
  DRAFT_GENERATED: ['UNDER_ANALYSIS', 'BLOCKED', 'CANCELLED'],
  UNDER_ANALYSIS: ['READY_FOR_REVIEW', 'BLOCKED', 'CANCELLED'],
  READY_FOR_REVIEW: ['UNDER_REVIEW', 'BLOCKED', 'CANCELLED'],
  UNDER_REVIEW: ['EDITING', 'BLOCKED', 'CANCELLED'],
  EDITING: ['VALIDATION_REQUIRED', 'BLOCKED', 'CANCELLED'],
  VALIDATION_REQUIRED: ['READY_FOR_APPROVAL', 'EDITING', 'BLOCKED', 'CANCELLED'],
  READY_FOR_APPROVAL: [
    'APPROVED_FOR_SIGNATURE',
    'RETURNED_FOR_CORRECTION',
    'BLOCKED',
    'CANCELLED',
  ],
  APPROVED_FOR_SIGNATURE: [
    'SIGNER_CONFIRMATION',
    'RETURNED_FOR_CORRECTION',
    'BLOCKED',
    'CANCELLED',
  ],
  SIGNER_CONFIRMATION: [
    'ECIGN_PREPARING',
    'RETURNED_FOR_CORRECTION',
    'BLOCKED',
    'CANCELLED',
  ],
  ECIGN_PREPARING: [
    'SENT_FOR_SIGNATURE',
    'RETURNED_FOR_CORRECTION',
    'BLOCKED',
    'CANCELLED',
  ],
  SENT_FOR_SIGNATURE: [
    'PARTIALLY_SIGNED',
    'SIGNATURE_DECLINED',
    'SIGNATURE_EXPIRED',
    'RETURNED_FOR_CORRECTION',
    'BLOCKED',
    'CANCELLED',
  ],
  PARTIALLY_SIGNED: [
    'FULLY_SIGNED',
    'SIGNATURE_DECLINED',
    'SIGNATURE_EXPIRED',
    'RETURNED_FOR_CORRECTION',
    'BLOCKED',
    'CANCELLED',
  ],
  FULLY_SIGNED: ['SIGNED_PACKAGE_BUILDING', 'BLOCKED', 'AMENDMENT_REQUIRED'],
  SIGNED_PACKAGE_BUILDING: ['CERTIFICATION_REVIEW', 'BLOCKED'],
  CERTIFICATION_REVIEW: [
    'CERTIFIED',
    'RETURNED_FOR_CORRECTION',
    'AMENDMENT_REQUIRED',
    'BLOCKED',
  ],
  CERTIFIED: ['DRIVE_PUBLISHING', 'BLOCKED', 'AMENDMENT_REQUIRED'],
  DRIVE_PUBLISHING: ['PUBLISHED', 'BLOCKED'],
  PUBLISHED: ['LOCKED', 'AMENDMENT_REQUIRED', 'SUPERSEDED'],
  LOCKED: [],
  BLOCKED: [
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
    'ECIGN_PREPARING',
    'SENT_FOR_SIGNATURE',
    'PARTIALLY_SIGNED',
    'FULLY_SIGNED',
    'SIGNED_PACKAGE_BUILDING',
    'CERTIFICATION_REVIEW',
    'CERTIFIED',
    'DRIVE_PUBLISHING',
    'PUBLISHED',
    'CANCELLED',
  ],
  RETURNED_FOR_CORRECTION: ['EDITING', 'CANCELLED'],
  SIGNATURE_DECLINED: [
    'RETURNED_FOR_CORRECTION',
    'SIGNER_CONFIRMATION',
    'CANCELLED',
  ],
  SIGNATURE_EXPIRED: [
    'RETURNED_FOR_CORRECTION',
    'SIGNER_CONFIRMATION',
    'ECIGN_PREPARING',
    'CANCELLED',
  ],
  CANCELLED: [],
  SUPERSEDED: [],
  AMENDMENT_REQUIRED: ['EDITING', 'SUPERSEDED', 'CANCELLED'],
};

describe('vocabulary — §14.6 comparability states', () => {
  it('matches PRD text exactly (including em-dashes)', () => {
    expect([...COMPARABILITY_STATES]).toEqual([...PRD_COMPARABILITY]);
    // Ensure em-dash (U+2014), not hyphen-minus
    for (const s of COMPARABILITY_STATES) {
      if (s.includes('COMPARABLE') && s !== 'COMPARABLE' && s !== 'COMPARABLE WITH LIMITATION') {
        expect(s).toMatch(/\u2014/);
      }
    }
  });
});

describe('vocabulary — FR-012 workflow decision states', () => {
  it('matches PRD text exactly (12 states, em-dashes preserved)', () => {
    expect([...WORKFLOW_DECISION_STATES]).toEqual([...PRD_FR012]);
  });
});

describe('vocabulary — Appendix D', () => {
  it('packet status matches PRD text exactly', () => {
    expect([...APPENDIX_D_PACKET_STATUS_VOCABULARY]).toEqual([...PRD_APPENDIX_D_PACKET]);
  });

  it('trend status matches PRD text exactly', () => {
    expect([...APPENDIX_D_TREND_STATUS_VOCABULARY]).toEqual([...PRD_APPENDIX_D_TREND]);
  });

  it('data validation status matches PRD text exactly (including UNKNOWN — NOT RECOVERED casing)', () => {
    expect([...APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY]).toEqual([
      ...PRD_APPENDIX_D_DATA_VALIDATION,
    ]);
  });
});

describe('module id coverage', () => {
  it('exports exact §10 backbone module IDs (19)', () => {
    expect([...UNIVERSAL_BACKBONE_MODULE_IDS]).toEqual([...PRD_BACKBONE_MODULE_IDS]);
  });

  it('exports exact §13.1 QAPI Part I module IDs (11)', () => {
    expect([...QAPI_PART_I_MODULE_IDS]).toEqual([...PRD_QAPI_PART_I_MODULE_IDS]);
  });

  it('exports exact §13.1 QAPI Part II module IDs (7)', () => {
    expect([...QAPI_PART_II_MODULE_IDS]).toEqual([...PRD_QAPI_PART_II_MODULE_IDS]);
  });
});

describe('FR-019 supplemental vocabularies', () => {
  it('matches exact PRD classification options (15)', () => {
    expect([...SUPPLEMENTAL_CLASSIFICATION_OPTIONS]).toEqual([
      ...PRD_FR019_CLASSIFICATIONS,
    ]);
  });

  it('matches exact PRD destination options (12)', () => {
    expect([...SUPPLEMENTAL_DESTINATION_OPTIONS]).toEqual([...PRD_FR019_DESTINATIONS]);
  });
});

describe('FR-033 audit event vocabulary', () => {
  it('covers template selection through supersession', () => {
    expect(PACKET_AUDIT_EVENT_TYPES[0]).toBe('packet.template_selected');
    expect(PACKET_AUDIT_EVENT_TYPES[PACKET_AUDIT_EVENT_TYPES.length - 1]).toBe(
      'packet.superseded',
    );
    expect(PACKET_AUDIT_EVENT_TYPES).toContain('packet.prior_packet_lookup');
    expect(PACKET_AUDIT_EVENT_TYPES).toContain('packet.brad_proposal');
    expect(PACKET_AUDIT_EVENT_TYPES).toContain('packet.locked');
    expect(PACKET_AUDIT_EVENT_TYPES).toContain('packet.amended');
  });
});

describe('FR-022 edit impact dimensions', () => {
  it('enumerates the exact PRD impact dimension key list', () => {
    expect([...EDIT_IMPACT_DIMENSION_KEYS]).toEqual([...PRD_FR022_IMPACT_DIMENSION_KEYS]);
  });
});

/* ── Packet lifecycle machine ─────────────────────────────────────── */

describe('packet lifecycle state machine (§17.1)', () => {
  const terminals: PacketLifecycleStatus[] = ['LOCKED', 'CANCELLED', 'SUPERSEDED'];

  it('marks every terminal state with zero outbound transitions', () => {
    for (const t of terminals) {
      expect(isTerminalPacketStatus(t)).toBe(true);
      expect(PACKET_LIFECYCLE_TRANSITIONS[t]).toEqual([]);
      expect(isAllowedPacketTransition(t, 'EDITING')).toBe(false);
      expect(isAllowedPacketTransition(t, 'SOURCE_COLLECTION')).toBe(false);
      expect(isAllowedPacketTransition(t, 'DRAFT_GENERATED')).toBe(false);
      expect(() => assertPacketTransition(t, 'EDITING')).toThrow(/Illegal packet/);
      expect(() => assertTransition('packet', t, 'UNDER_REVIEW')).toThrow();
    }
  });

  it('allows the main happy-path adjacencies only (no intermediate skips)', () => {
    expect(isAllowedPacketTransition('SOURCE_COLLECTION', 'DRAFT_GENERATED')).toBe(true);
    expect(isAllowedPacketTransition('DRAFT_GENERATED', 'UNDER_ANALYSIS')).toBe(true);
    expect(isAllowedPacketTransition('UNDER_ANALYSIS', 'READY_FOR_REVIEW')).toBe(true);
    expect(isAllowedPacketTransition('READY_FOR_REVIEW', 'UNDER_REVIEW')).toBe(true);
    expect(isAllowedPacketTransition('UNDER_REVIEW', 'EDITING')).toBe(true);
    expect(isAllowedPacketTransition('EDITING', 'VALIDATION_REQUIRED')).toBe(true);
    expect(isAllowedPacketTransition('VALIDATION_REQUIRED', 'READY_FOR_APPROVAL')).toBe(
      true,
    );
    expect(isAllowedPacketTransition('PUBLISHED', 'LOCKED')).toBe(true);
    expect(isAllowedPacketTransition('SENT_FOR_SIGNATURE', 'PARTIALLY_SIGNED')).toBe(
      true,
    );
    expect(isAllowedPacketTransition('PARTIALLY_SIGNED', 'FULLY_SIGNED')).toBe(true);
  });

  it('rejects shortcuts that skip mandated intermediate states', () => {
    const illegal: Array<[PacketLifecycleStatus, PacketLifecycleStatus]> = [
      ['SOURCE_COLLECTION', 'LOCKED'],
      ['DRAFT_GENERATED', 'EDITING'],
      ['DRAFT_GENERATED', 'FULLY_SIGNED'],
      ['UNDER_ANALYSIS', 'EDITING'],
      ['UNDER_ANALYSIS', 'VALIDATION_REQUIRED'],
      ['READY_FOR_REVIEW', 'EDITING'],
      ['UNDER_REVIEW', 'VALIDATION_REQUIRED'],
      ['UNDER_REVIEW', 'READY_FOR_APPROVAL'],
      ['UNDER_REVIEW', 'PUBLISHED'],
      ['EDITING', 'READY_FOR_APPROVAL'],
      ['EDITING', 'UNDER_REVIEW'],
      ['VALIDATION_REQUIRED', 'READY_FOR_REVIEW'],
      ['READY_FOR_APPROVAL', 'EDITING'],
      ['SENT_FOR_SIGNATURE', 'FULLY_SIGNED'],
      ['CERTIFIED', 'PUBLISHED'],
      ['ECIGN_PREPARING', 'LOCKED'],
    ];
    for (const [from, to] of illegal) {
      expect(isAllowedPacketTransition(from, to)).toBe(false);
      expect(() => assertPacketTransition(from, to)).toThrow(/Illegal packet/);
    }
  });

  it('allows justified non-linear edges (cycles, return, signature alts, blocked)', () => {
    // EDITING ↔ VALIDATION_REQUIRED
    expect(isAllowedPacketTransition('EDITING', 'VALIDATION_REQUIRED')).toBe(true);
    expect(isAllowedPacketTransition('VALIDATION_REQUIRED', 'EDITING')).toBe(true);
    // RETURNED_FOR_CORRECTION re-entry
    expect(isAllowedPacketTransition('READY_FOR_APPROVAL', 'RETURNED_FOR_CORRECTION')).toBe(
      true,
    );
    expect(isAllowedPacketTransition('RETURNED_FOR_CORRECTION', 'EDITING')).toBe(true);
    // Signature decline/expiry
    expect(isAllowedPacketTransition('SENT_FOR_SIGNATURE', 'SIGNATURE_DECLINED')).toBe(
      true,
    );
    expect(isAllowedPacketTransition('SIGNATURE_EXPIRED', 'ECIGN_PREPARING')).toBe(true);
    // BLOCKED entry/exit
    expect(isAllowedPacketTransition('UNDER_REVIEW', 'BLOCKED')).toBe(true);
    expect(isAllowedPacketTransition('BLOCKED', 'UNDER_REVIEW')).toBe(true);
  });

  it('matches the exact ALLOWED_TRANSITIONS successor set for every state', () => {
    const states = Object.keys(
      EXPECTED_PACKET_LIFECYCLE_TRANSITIONS,
    ) as PacketLifecycleStatus[];
    expect(Object.keys(PACKET_LIFECYCLE_TRANSITIONS).sort()).toEqual(
      [...states].sort(),
    );
    for (const state of states) {
      expect([...PACKET_LIFECYCLE_TRANSITIONS[state]]).toEqual([
        ...EXPECTED_PACKET_LIFECYCLE_TRANSITIONS[state],
      ]);
    }
  });
});

/* ── Trigger lifecycle machine ────────────────────────────────────── */

describe('trigger lifecycle state machine (§17.2)', () => {
  it('treats CLOSED as terminal and rejects illegal jumps', () => {
    expect(isTerminalTriggerStatus('CLOSED')).toBe(true);
    expect(TRIGGER_LIFECYCLE_TRANSITIONS.CLOSED).toEqual([]);
    const illegal: Array<[TriggerLifecycleStatus, TriggerLifecycleStatus]> = [
      ['CLOSED', 'CANDIDATE'],
      ['CLOSED', 'ACTIVATED'],
      ['CLOSED', 'IN_PROGRESS'],
      ['CANDIDATE', 'ACTIVATED'],
      ['CANDIDATE', 'SUSTAINMENT'],
      ['VALIDATED', 'IN_PROGRESS'],
    ];
    for (const [from, to] of illegal) {
      expect(isAllowedTriggerTransition(from, to)).toBe(false);
      expect(() => assertTriggerTransition(from, to)).toThrow(/Illegal trigger/);
    }
  });

  it('allows the PRD main path including SUSTAINMENT/ESCALATION branches', () => {
    expect(isAllowedTriggerTransition('CANDIDATE', 'VALIDATED')).toBe(true);
    expect(isAllowedTriggerTransition('REMEASUREMENT', 'SUSTAINMENT')).toBe(true);
    expect(isAllowedTriggerTransition('REMEASUREMENT', 'ESCALATION')).toBe(true);
    expect(isAllowedTriggerTransition('SUSTAINMENT', 'CLOSED')).toBe(true);
  });
});

/* ── Supplemental lifecycle machine ───────────────────────────────── */

describe('supplemental lifecycle state machine (§17.3)', () => {
  const terminals: SupplementalLifecycleStatus[] = ['REJECTED', 'APPLIED'];

  it('marks REJECTED and APPLIED as terminal with 3+ illegal jumps each', () => {
    for (const t of terminals) {
      expect(isTerminalSupplementalStatus(t)).toBe(true);
      expect(SUPPLEMENTAL_LIFECYCLE_TRANSITIONS[t]).toEqual([]);
      expect(isAllowedSupplementalTransition(t, 'RECEIVED')).toBe(false);
      expect(isAllowedSupplementalTransition(t, 'CLASSIFIED')).toBe(false);
      expect(isAllowedSupplementalTransition(t, 'VALIDATED')).toBe(false);
      expect(() => assertSupplementalTransition(t, 'MAPPED')).toThrow(
        /Illegal supplemental/,
      );
    }
  });

  it('enforces linear path and ACCEPTED→APPLIED', () => {
    expect(isAllowedSupplementalTransition('RECEIVED', 'CLASSIFIED')).toBe(true);
    expect(isAllowedSupplementalTransition('VALIDATED', 'ACCEPTED')).toBe(true);
    expect(isAllowedSupplementalTransition('VALIDATED', 'REJECTED')).toBe(true);
    expect(isAllowedSupplementalTransition('ACCEPTED', 'APPLIED')).toBe(true);
    expect(isAllowedSupplementalTransition('RECEIVED', 'APPLIED')).toBe(false);
    expect(isAllowedSupplementalTransition('REJECTED', 'APPLIED')).toBe(false);
  });
});

/* ── Signature lifecycle machine ──────────────────────────────────── */

describe('signature lifecycle state machine (§17.4)', () => {
  const terminals: SignatureLifecycleStatus[] = [
    'COMPLETED',
    'DECLINED',
    'EXPIRED',
    'VOIDED',
    'FAILED',
  ];

  it('marks every terminal state and rejects 3+ illegal jumps each', () => {
    for (const t of terminals) {
      expect(isTerminalSignatureStatus(t)).toBe(true);
      expect(SIGNATURE_LIFECYCLE_TRANSITIONS[t]).toEqual([]);
      expect(isAllowedSignatureTransition(t, 'PREPARED')).toBe(false);
      expect(isAllowedSignatureTransition(t, 'SENT')).toBe(false);
      expect(isAllowedSignatureTransition(t, 'VIEWED')).toBe(false);
      expect(() => assertSignatureTransition(t, 'PARTIALLY_SIGNED')).toThrow(
        /Illegal signature/,
      );
    }
  });

  it('allows the main path and alternate exits', () => {
    expect(isAllowedSignatureTransition('PREPARED', 'SENT')).toBe(true);
    expect(isAllowedSignatureTransition('VIEWED', 'PARTIALLY_SIGNED')).toBe(true);
    expect(isAllowedSignatureTransition('PARTIALLY_SIGNED', 'COMPLETED')).toBe(true);
    expect(isAllowedSignatureTransition('SENT', 'DECLINED')).toBe(true);
    expect(isAllowedSignatureTransition('PREPARED', 'VOIDED')).toBe(true);
  });

  it('rejects illegal long jumps', () => {
    const illegal: Array<[SignatureLifecycleStatus, SignatureLifecycleStatus]> = [
      ['PREPARED', 'COMPLETED'],
      ['SENT', 'COMPLETED'],
      ['DELIVERED', 'PREPARED'],
    ];
    for (const [from, to] of illegal) {
      expect(isAllowedSignatureTransition(from, to)).toBe(false);
      expect(() => assertTransition('signature', from, to)).toThrow();
    }
  });
});

describe('ALLOWED_TRANSITIONS aggregate', () => {
  it('exposes all four machines', () => {
    expect(Object.keys(ALLOWED_TRANSITIONS).sort()).toEqual(
      ['packet', 'signature', 'supplemental', 'trigger'].sort(),
    );
    expect(isAllowedTransition('packet', 'LOCKED', 'EDITING')).toBe(false);
    expect(isAllowedTransition('trigger', 'CLOSED', 'CANDIDATE')).toBe(false);
  });

  it('packet machine successor sets match the exact snapshot', () => {
    expect(ALLOWED_TRANSITIONS.packet).toBe(PACKET_LIFECYCLE_TRANSITIONS);
    for (const state of Object.keys(
      EXPECTED_PACKET_LIFECYCLE_TRANSITIONS,
    ) as PacketLifecycleStatus[]) {
      expect([...ALLOWED_TRANSITIONS.packet[state]]).toEqual([
        ...EXPECTED_PACKET_LIFECYCLE_TRANSITIONS[state],
      ]);
    }
  });
});
