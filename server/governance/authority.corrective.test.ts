import { describe, expect, it } from 'vitest';
import {
  authorizeGovernanceAction,
  buildEligibilitySnapshot,
  evaluateOpeningQuorum,
  thresholdSatisfied,
  type GovernanceAuthorityState,
} from './authority.js';
import type {
  AttendanceEvent,
  Committee,
  CommitteeMembership,
  ConflictManagementRestriction,
  GovernanceAgenda,
  GovernanceMeeting,
} from './contracts.js';
import {
  TEST_MEMBERS,
  TEST_NOW,
  TEST_PROFILE,
  TEST_ROLE_TERMS,
  TEST_BYLAW_VERSION,
  TEST_COMMITTEE_CHARTER_VERSION,
  testActor,
  testBase,
} from './testFixtures.js';

function state(overrides: Partial<GovernanceAuthorityState> = {}): GovernanceAuthorityState {
  return {
    profile: TEST_PROFILE,
    bylawCharterVersions: [TEST_BYLAW_VERSION, TEST_COMMITTEE_CHARTER_VERSION],
    members: [...TEST_MEMBERS],
    roleTerms: [...TEST_ROLE_TERMS],
    committees: [],
    committeeMemberships: [],
    delegations: [],
    restrictions: [],
    breakGlassGrants: [],
    ...overrides,
  };
}

describe('Governing Body action authority', () => {
  it('denies a super administrator who has no active Board appointment', () => {
    const decision = authorizeGovernanceAction(
      testActor('technical-admin', ['grp-super-admin']),
      'meeting.create',
      {},
      state(),
      TEST_NOW,
    );
    expect(decision.permitted).toBe(false);
    expect(decision.reason).toMatch(/active, appointed Governing Body membership/i);
  });

  it('denies an expired Board role term even when the identity has an entry group', () => {
    const expired = { ...TEST_ROLE_TERMS[0], endsAt: '2026-07-01T00:00:00.000Z' };
    const decision = authorizeGovernanceAction(
      testActor('person-chair'),
      'meeting.create',
      {},
      state({ roleTerms: [expired] }),
      TEST_NOW,
    );
    expect(decision.permitted).toBe(false);
    expect(decision.reason).toMatch(/No current Board role term/i);
  });

  it('fails closed when the authority profile is not backed by a controlled approved bylaw version', () => {
    const decision = authorizeGovernanceAction(
      testActor('person-chair'),
      'meeting.create',
      {},
      state({ bylawCharterVersions: [] }),
      TEST_NOW,
    );
    expect(decision.permitted).toBe(false);
    expect(decision.reason).toMatch(/controlled bylaw version/i);
  });

  it('applies conflict restrictions before a vote', () => {
    const restriction: ConflictManagementRestriction = {
      ...testBase('restriction-vote'),
      memberId: 'member-chair',
      matterId: 'decision-qapi',
      restriction: 'recuse_vote',
      basis: 'Related-party interest',
      startsAt: '2026-07-01T00:00:00.000Z',
      endsAt: null,
      status: 'active',
    };
    const decision = authorizeGovernanceAction(
      testActor('person-chair'),
      'vote.cast',
      { matterId: 'decision-qapi' },
      state({ restrictions: [restriction] }),
      TEST_NOW,
    );
    expect(decision.permitted).toBe(false);
    expect(decision.reason).toContain('restriction-vote');
  });

  it('requires both an active committee membership and charter authority', () => {
    const committee: Committee = {
      ...testBase('committee-quality'),
      name: 'Quality Committee',
      charterVersionId: 'charter-quality-v2',
      authority: ['meeting.create', 'vote.cast'],
      status: 'active',
    };
    const membership: CommitteeMembership = {
      ...testBase('committee-membership-director'),
      committeeId: committee.id,
      memberId: 'member-director',
      role: 'member',
      voting: true,
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: null,
    };
    const missingMembership = authorizeGovernanceAction(
      testActor('person-chair'),
      'vote.cast',
      { committeeId: committee.id },
      state({ committees: [committee], committeeMemberships: [membership] }),
      TEST_NOW,
    );
    const validMember = authorizeGovernanceAction(
      testActor('person-director'),
      'vote.cast',
      { committeeId: committee.id },
      state({ committees: [committee], committeeMemberships: [membership] }),
      TEST_NOW,
    );
    expect(missingMembership.permitted).toBe(false);
    expect(validMember.permitted).toBe(true);
  });

  it('does not grant attorney-client privilege to technical administration', () => {
    const actor = testActor('technical-admin', ['grp-super-admin']);
    const denied = authorizeGovernanceAction(actor, 'record.view', {
      accessClass: 'attorney_client_privileged', matterId: 'matter-privileged',
    }, state(), TEST_NOW);
    expect(denied.permitted).toBe(false);
    expect(denied.reason).toMatch(/Technical administration does not confer privilege/i);

    const grant = {
      ...testBase('break-glass-1'),
      requesterActorId: 'technical-admin',
      approvedByMemberId: 'member-chair',
      legalNotificationRecipientIds: ['legal-counsel'],
      purpose: 'Restore a specifically identified privileged record after an availability incident.',
      matterId: 'matter-privileged',
      accessClasses: ['attorney_client_privileged'] as const,
      startsAt: '2026-07-22T16:55:00.000Z',
      expiresAt: '2026-07-22T17:10:00.000Z',
      usedAt: null,
      revokedAt: null,
      approvalArtifactId: 'ecign-break-glass-approval',
    };
    const allowed = authorizeGovernanceAction(actor, 'record.view', {
      accessClass: 'attorney_client_privileged', matterId: 'matter-privileged',
    }, state({ breakGlassGrants: [grant] }), TEST_NOW);
    const mutationStillDenied = authorizeGovernanceAction(actor, 'decision.create', {
      accessClass: 'attorney_client_privileged', matterId: 'matter-privileged',
    }, state({ breakGlassGrants: [grant] }), TEST_NOW);
    expect(allowed.permitted).toBe(true);
    expect(mutationStillDenied.permitted).toBe(false);
  });
});

describe('Bylaw-derived quorum and outcome rules', () => {
  const meeting: GovernanceMeeting = {
    ...testBase('meeting-1'), meetingType: 'regular', title: 'QAPI return', committeeId: null,
    authorityProfileVersionId: TEST_PROFILE.id, scheduledStart: TEST_NOW, timezone: 'America/Los_Angeles',
    status: 'in_session', noticeArtifactId: 'notice', noticeSourceMetadataId: 'source', noticeContentSha256: 'a'.repeat(64),
    noticeVersion: 1, agendaId: 'agenda-1', boardBookId: 'book-1', calledToOrderAt: TEST_NOW,
    noticePublishedAt: TEST_NOW, noticeRecipientMemberIds: ['member-chair', 'member-secretary', 'member-director'],
    noticePublicationId: 'notice-publication-1',
    adjournedAt: null, minutesId: null, supersedesMeetingId: null,
  };
  const agenda: GovernanceAgenda = {
    ...testBase('agenda-1'), meetingId: meeting.id, agendaVersion: 1, status: 'published', publishedAt: TEST_NOW,
    amendmentReason: null, items: [{ id: 'agenda-item-qapi', sequence: 1, title: 'QAPI PIP', purpose: 'decision',
      decisionId: 'decision-qapi', sourceMetadataIds: ['source'], accessClass: 'board_general', authorityKey: 'qapi_pip', estimatedMinutes: 20 }],
  };
  const attendance: AttendanceEvent[] = TEST_MEMBERS.slice(0, 2).map((member, index) => ({
    ...testBase(`attendance-${index}`), meetingId: meeting.id, memberId: member.id, event: 'arrived',
    occurredAt: TEST_NOW, mode: 'in_person', communicationVerified: true,
  }));

  it('calculates opening quorum from the approved profile, not a hard-coded count', () => {
    const result = evaluateOpeningQuorum({ meeting, attendance, state: state(), now: TEST_NOW });
    expect(result).toMatchObject({ eligibleCount: 3, quorumMet: true });
    expect(result.presentMemberIds).toEqual(['member-chair', 'member-secretary']);
  });

  it('freezes the item-level eligibility snapshot and excludes absent members', () => {
    const snapshot = buildEligibilitySnapshot({ meeting, agenda, agendaItemId: 'agenda-item-qapi', attendance, state: state(), now: TEST_NOW });
    expect(snapshot.eligibleMemberIds).toEqual(['member-chair', 'member-secretary']);
    expect(snapshot.absentMemberIds).toEqual(['member-director']);
    expect(snapshot.contentSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('evaluates each threshold rule rather than assuming majority of two', () => {
    expect(thresholdSatisfied({ kind: 'majority_authorized' }, 2, 3, 2)).toBe(true);
    expect(thresholdSatisfied({ kind: 'two_thirds_authorized' }, 1, 3, 2)).toBe(false);
    expect(thresholdSatisfied({ kind: 'unanimous_authorized' }, 2, 3, 2)).toBe(false);
  });
});
