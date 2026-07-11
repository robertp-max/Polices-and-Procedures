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

describe('vocabulary — §14.6 comparability states', () => {
  it('matches PRD text exactly (including em-dashes)', () => {
    expect([...COMPARABILITY_STATES]).toEqual([...PRD_COMPARABILITY]);
    expect(COMPARABILITY_STATES).toContain('NOT COMPARABLE — DEFINITION CHANGED');
    expect(COMPARABILITY_STATES).toContain('COMPARABLE WITH LIMITATION');
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
    expect(WORKFLOW_DECISION_STATES).toHaveLength(12);
    expect(WORKFLOW_DECISION_STATES).toContain('CANDIDATE — NEEDS VALIDATION');
    expect(WORKFLOW_DECISION_STATES).toContain('CONFIRMED — NOT YET ACTIVATED');
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
    expect(APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY).toContain(
      'Unknown — not recovered',
    );
  });
});

describe('module id coverage', () => {
  it('exports 19 backbone + 11 QAPI Part I + 7 QAPI Part II modules', () => {
    expect(UNIVERSAL_BACKBONE_MODULE_IDS).toHaveLength(19);
    expect(QAPI_PART_I_MODULE_IDS).toHaveLength(11);
    expect(QAPI_PART_II_MODULE_IDS).toHaveLength(7);
  });
});

describe('FR-019 supplemental vocabularies', () => {
  it('has 15 classification options and 12 destination options', () => {
    expect(SUPPLEMENTAL_CLASSIFICATION_OPTIONS).toHaveLength(15);
    expect(SUPPLEMENTAL_DESTINATION_OPTIONS).toHaveLength(12);
    expect(SUPPLEMENTAL_CLASSIFICATION_OPTIONS).toContain(
      'Confidential personnel information',
    );
    expect(SUPPLEMENTAL_DESTINATION_OPTIONS).toContain('Exclude from final packet');
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
  it('enumerates every impact dimension key', () => {
    expect(EDIT_IMPACT_DIMENSION_KEYS).toContain('kpiCalculations');
    expect(EDIT_IMPACT_DIMENSION_KEYS).toContain('ecignEnvelopeValidity');
    expect(EDIT_IMPACT_DIMENSION_KEYS).toContain('lockEligibility');
    expect(EDIT_IMPACT_DIMENSION_KEYS.length).toBeGreaterThanOrEqual(16);
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

  it('allows the main happy-path adjacencies', () => {
    expect(isAllowedPacketTransition('SOURCE_COLLECTION', 'DRAFT_GENERATED')).toBe(true);
    expect(isAllowedPacketTransition('PUBLISHED', 'LOCKED')).toBe(true);
    expect(isAllowedPacketTransition('SENT_FOR_SIGNATURE', 'PARTIALLY_SIGNED')).toBe(
      true,
    );
  });

  it('rejects 3+ illegal jumps from non-terminals', () => {
    const illegal: Array<[PacketLifecycleStatus, PacketLifecycleStatus]> = [
      ['SOURCE_COLLECTION', 'LOCKED'],
      ['DRAFT_GENERATED', 'FULLY_SIGNED'],
      ['UNDER_REVIEW', 'PUBLISHED'],
      ['ECIGN_PREPARING', 'LOCKED'],
    ];
    for (const [from, to] of illegal) {
      expect(isAllowedPacketTransition(from, to)).toBe(false);
      expect(() => assertPacketTransition(from, to)).toThrow(/Illegal packet/);
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
});
