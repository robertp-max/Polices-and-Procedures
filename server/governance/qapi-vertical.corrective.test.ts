import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import type {
  AuditOutboxRecord,
  GovernanceRecordAccessEvent,
} from './contracts.js';
import {
  createGovernanceTestFixture,
  TEST_LIVE_SOURCE,
  TEST_NOW,
  TEST_PROFILE,
  testActor,
  testContext,
} from './testFixtures.js';

function at(minutes: number): string {
  return new Date(Date.parse(TEST_NOW) + minutes * 60_000).toISOString();
}

afterEach(() => {
  delete process.env.GOVERNANCE_SEARCH_HMAC_KEY;
});

describe('Live QAPI Governing Body vertical slice', () => {
  it('executes source registration through verified packet, meeting, vote, minutes, action effectiveness, and correction close', async () => {
    const fixture = await createGovernanceTestFixture();
    fixture.ecign.signatureUsers.set('cert-qapi-owner', new Set(['person-qapi-owner']));

    let meeting = await fixture.meetings.createMeeting(testContext('person-chair', 'meeting-create', at(0)), {
      meetingType: 'regular',
      title: 'Q2 QAPI evidence return and PIP authorization',
      authorityProfileVersionId: TEST_PROFILE.id,
      scheduledStart: '2026-07-23T17:00:00.000Z',
      timezone: 'America/Los_Angeles',
    });
    let decision = await fixture.meetings.createDecision(testContext('person-chair', 'decision-create', at(1)), {
      title: 'Authorize QAPI improvement project',
      question: 'Should the Governing Body authorize the certified Q2 QAPI improvement project and evidence-return schedule?',
      origin: 'meeting',
      authorityProfileVersionId: TEST_PROFILE.id,
      authorityKey: 'qapi_pip',
      sourceMetadataIds: [TEST_LIVE_SOURCE.id],
      meetingId: meeting.id,
    });
    decision = await fixture.meetings.transitionDecision(testContext('person-chair', 'decision-triage', at(1.1)), {
      decisionId: decision.id,
      expectedVersion: decision.version,
      command: 'triage',
    });
    meeting = await fixture.meetings.publishNotice(testContext('person-secretary', 'notice-publish', at(2)), {
      meetingId: meeting.id,
      expectedVersion: meeting.version,
      noticeArtifactId: 'packet-notice-qapi',
      sourceMetadataId: TEST_LIVE_SOURCE.id,
      noticeVersion: 1,
    });
    await expect(fixture.meetings.publishNotice(testContext('person-secretary', 'notice-version-replay', at(2.1)), {
      meetingId: meeting.id,
      expectedVersion: meeting.version,
      noticeArtifactId: 'packet-notice-qapi-v1-replay',
      sourceMetadataId: TEST_LIVE_SOURCE.id,
      noticeVersion: 1,
    })).rejects.toThrow(/Notice version must increase/i);
    const agendaItems = [{
      id: 'agenda-item-qapi-pip', sequence: 1, title: 'Q2 QAPI PIP authorization', purpose: 'decision' as const,
      decisionId: decision.id, sourceMetadataIds: [TEST_LIVE_SOURCE.id], accessClass: 'board_general' as const,
      authorityKey: 'qapi_pip', estimatedMinutes: 35,
    }, {
      id: 'agenda-item-executive-risk', sequence: 2, title: 'Restricted patient-safety deliberation', purpose: 'executive_session' as const,
      decisionId: null, sourceMetadataIds: [TEST_LIVE_SOURCE.id], accessClass: 'executive_session' as const,
      authorityKey: 'patient_safety_review', estimatedMinutes: 20,
    }];
    let agendaResult = await fixture.meetings.publishAgenda(testContext('person-secretary', 'agenda-publish', at(3)), {
      meetingId: meeting.id,
      meetingExpectedVersion: meeting.version,
      agendaExpectedVersion: null,
      agendaVersion: 1,
      items: agendaItems,
    });
    meeting = agendaResult.meeting;
    agendaResult = await fixture.meetings.publishAgenda(testContext('person-secretary', 'agenda-amend', at(3.5)), {
      meetingId: meeting.id,
      meetingExpectedVersion: meeting.version,
      agendaExpectedVersion: agendaResult.agenda.version,
      agendaVersion: 2,
      amendmentReason: 'Clarify the restricted-session classification before packet assembly.',
      items: agendaItems,
    });
    meeting = agendaResult.meeting;
    expect(agendaResult.agenda).toMatchObject({ agendaVersion: 2, status: 'amended' });
    decision = await fixture.meetings.transitionDecision(testContext('person-secretary', 'decision-place', at(3.6)), {
      decisionId: decision.id,
      expectedVersion: decision.version,
      command: 'place_in_packet',
      meetingId: meeting.id,
      agendaItemId: 'agenda-item-qapi-pip',
    });
    expect(decision).toMatchObject({ status: 'placed_in_packet', meetingId: meeting.id, agendaItemId: 'agenda-item-qapi-pip' });

    const bookResult = await fixture.meetings.createBoardBook(testContext('person-secretary', 'book-create', at(4)), meeting.id, 'board_general');
    meeting = bookResult.meeting;
    let book = bookResult.boardBook;
    const sectionResult = await fixture.meetings.certifyBoardBookSection(testContext('person-secretary', 'book-section', at(5)), {
      boardBookId: book.id,
      boardBookExpectedVersion: book.version,
      sequence: 1,
      title: 'Certified Q2 QAPI source and PIP decision dossier',
      required: true,
      artifactId: 'packet-qapi-certified-v7',
      sourceMetadataId: TEST_LIVE_SOURCE.id,
      sourceOwnerCertificationArtifactId: 'cert-qapi-owner',
    });
    book = sectionResult.boardBook;
    const firstLock = await fixture.meetings.lockBoardBook(testContext('person-chair', 'book-lock', at(6)), book.id, book.version);
    book = firstLock.boardBook;
    expect(firstLock.manifest.sections[0]).toMatchObject({
      artifactId: 'packet-qapi-certified-v7',
      artifactVersion: '7',
      contentSha256: sectionResult.section.contentSha256,
      sourceOwnerCertificationId: 'cert-qapi-owner',
    });
    expect(firstLock.manifest.manifestSha256).toMatch(/^[a-f0-9]{64}$/);

    const superseded = await fixture.meetings.supersedeBoardBook(testContext('person-chair', 'book-supersede', at(6.1)), {
      boardBookId: book.id,
      expectedVersion: book.version,
      reason: 'Add a source-certified late QAPI denominator reconciliation before distribution.',
    });
    expect(superseded.supersededBoardBook.status).toBe('superseded');
    expect(superseded.supersededBoardBook.manifestId).toBe(firstLock.manifest.id);
    meeting = superseded.meeting;
    book = superseded.replacementBoardBook;
    let replacementSection = await fixture.meetings.certifyBoardBookSection(testContext('person-secretary', 'replacement-section-1', at(6.2)), {
      boardBookId: book.id, boardBookExpectedVersion: book.version, sequence: 1,
      title: 'Certified Q2 QAPI source and PIP decision dossier', required: true,
      artifactId: 'packet-qapi-certified-v7', sourceMetadataId: TEST_LIVE_SOURCE.id,
      sourceOwnerCertificationArtifactId: 'cert-qapi-owner',
    });
    book = replacementSection.boardBook;
    replacementSection = await fixture.meetings.certifyBoardBookSection(testContext('person-secretary', 'replacement-section-2', at(6.3)), {
      boardBookId: book.id, boardBookExpectedVersion: book.version, sequence: 2,
      title: 'Late denominator reconciliation addendum', required: true,
      artifactId: 'packet-qapi-denominator-addendum-v1', sourceMetadataId: TEST_LIVE_SOURCE.id,
      sourceOwnerCertificationArtifactId: 'cert-qapi-owner',
    });
    book = replacementSection.boardBook;
    const locked = await fixture.meetings.lockBoardBook(testContext('person-chair', 'replacement-lock', at(6.4)), book.id, book.version);
    book = locked.boardBook;
    expect(locked.manifest.sections).toHaveLength(2);
    expect(book.supersedesBoardBookId).toBe(firstLock.boardBook.id);

    const distributed = await fixture.meetings.distributeBoardBook(testContext('person-chair', 'book-distribute', at(7)), {
      boardBookId: book.id,
      expectedVersion: book.version,
      recipientMemberIds: ['member-chair', 'member-secretary', 'member-director'],
    });
    book = distributed.boardBook;
    let distribution = await fixture.meetings.recordBoardBookReceipt(testContext('person-chair', 'book-receipt', at(8)), {
      distributionId: distributed.distribution.id,
      expectedVersion: distributed.distribution.version,
      manifestSha256: distributed.distribution.manifestSha256,
    });
    distribution = await fixture.meetings.submitBoardBookQuestion(testContext('person-secretary', 'book-question', at(9)), {
      distributionId: distribution.id,
      expectedVersion: distribution.version,
      question: 'Which evidence window will be used for the first effectiveness return?',
    });
    distribution = await fixture.meetings.respondToBoardBookQuestion(testContext('person-chair', 'book-response', at(10)), {
      distributionId: distribution.id,
      expectedVersion: distribution.version,
      questionId: distribution.managementQuestions[0].id,
      responseArtifactId: 'packet-management-response-qapi',
      sourceMetadataId: TEST_LIVE_SOURCE.id,
    });
    expect(distribution.readReceipts).toHaveLength(1);
    expect(distribution.managementQuestions[0].responseArtifactId).toBe('packet-management-response-qapi');
    expect(distribution.managementQuestions[0].responseContentSha256).toMatch(/^[a-f0-9]{64}$/);

    for (const [index, memberId] of ['member-chair', 'member-secretary', 'member-director'].entries()) {
      await fixture.meetings.recordAttendance(testContext('person-secretary', `attendance-${index}`, at(11 + index)), {
        meetingId: meeting.id,
        memberId,
        event: 'arrived',
        occurredAt: at(11 + index),
        mode: 'in_person',
        communicationVerified: true,
      });
    }
    meeting = await fixture.meetings.markMeetingReady(testContext('person-secretary', 'meeting-ready', at(15)), meeting.id, meeting.version);
    const called = await fixture.meetings.callToOrder(testContext('person-chair', 'call-to-order', at(16)), meeting.id, meeting.version);
    meeting = called.meeting;
    expect(called.openingQuorum).toMatchObject({ eligibleCount: 3, quorumMet: true });

    const restriction = await fixture.meetings.createConflictRestriction(testContext('person-secretary', 'conflict-restriction', at(16.1)), {
      meetingId: meeting.id,
      agendaItemId: 'agenda-item-executive-risk',
      memberId: 'member-director',
      restriction: 'exclude_session',
      basis: 'The Director disclosed a relationship requiring exclusion from this restricted deliberation.',
      startsAt: at(16.1),
      endsAt: at(30),
    });
    await fixture.meetings.recordConflict(testContext('person-director', 'conflict-disclosure', at(16.2)), {
      meetingId: meeting.id,
      agendaItemId: 'agenda-item-executive-risk',
      memberId: 'member-director',
      disclosure: 'A relationship exists that requires exclusion from the executive-session discussion and record.',
      restrictionIds: [restriction.id],
      disclosedAt: at(16.2),
    });
    const enteredExecutive = await fixture.meetings.recordSessionTransition(testContext('person-chair', 'executive-enter', at(16.3)), {
      meetingId: meeting.id,
      agendaItemId: 'agenda-item-executive-risk',
      event: 'entered_executive_session',
      basis: 'The published agenda classifies this patient-safety deliberation as executive-session restricted.',
      occurredAt: at(16.3),
    });
    expect(enteredExecutive.accessClass).toBe('executive_session');
    await expect(fixture.service.deliverRecord(testContext('person-director', 'executive-record-denied', at(16.35)), {
      recordType: 'session_event', recordId: enteredExecutive.id, delivery: 'view',
    })).rejects.toMatchObject({ status: 404 });
    await fixture.meetings.recordSessionTransition(testContext('person-chair', 'executive-return', at(16.4)), {
      meetingId: meeting.id,
      agendaItemId: 'agenda-item-executive-risk',
      event: 'returned_to_open_session',
      basis: 'Restricted deliberation concluded and the Chair restored the open-session record.',
      occurredAt: at(16.4),
    });

    const moved = await fixture.meetings.createMotion(testContext('person-chair', 'motion-move', at(17)), {
      meetingId: meeting.id,
      agendaItemId: 'agenda-item-qapi-pip',
      decisionId: decision.id,
      text: 'Authorize the QAPI improvement project with a documented management return and separate Board effectiveness disposition.',
      conditions: ['Management must return verified evidence by August 31, 2026.'],
    });
    decision = moved.decision;
    const amendment = await fixture.meetings.createMotion(testContext('person-secretary', 'motion-amend', at(17.1)), {
      meetingId: meeting.id,
      agendaItemId: 'agenda-item-qapi-pip',
      decisionId: decision.id,
      parentMotionId: moved.motion.id,
      text: 'Authorize the QAPI improvement project with a documented management return and separate Board effectiveness disposition.',
      conditions: ['Management must return verified evidence by September 15, 2026.'],
    });
    let amendmentMotion = await fixture.meetings.secondMotion(testContext('person-chair', 'amendment-second', at(17.2)), amendment.motion.id, amendment.motion.version);
    let amendmentVote = await fixture.meetings.castVote(testContext('person-chair', 'amendment-vote-chair', at(17.3)), {
      motionId: amendmentMotion.id, expectedMotionVersion: amendmentMotion.version, value: 'approve',
    });
    amendmentMotion = amendmentVote.motion;
    amendmentVote = await fixture.meetings.castVote(testContext('person-secretary', 'amendment-vote-secretary', at(17.4)), {
      motionId: amendmentMotion.id, expectedMotionVersion: amendmentMotion.version, value: 'approve',
    });
    expect(amendmentVote.result).toMatchObject({ final: true, disposition: 'approved' });
    expect(amendmentVote.decision.status).toBe('deliberation');
    const amendedParent = await fixture.repository.get<typeof moved.motion>(TEST_LIVE_SOURCE.organizationId, 'motion', moved.motion.id);
    if (!amendedParent) throw new Error('Amended parent motion missing.');
    let motion = await fixture.meetings.secondMotion(testContext('person-secretary', 'motion-second', at(18)), amendedParent.id, amendedParent.version);
    const firstVote = await fixture.meetings.castVote(testContext('person-chair', 'vote-chair', at(19)), {
      motionId: motion.id, expectedMotionVersion: motion.version, value: 'approve',
    });
    motion = firstVote.motion;
    expect(firstVote.result).toMatchObject({ final: false, approvals: 1, eligible: 3 });
    const secondVote = await fixture.meetings.castVote(testContext('person-secretary', 'vote-secretary', at(20)), {
      motionId: motion.id, expectedMotionVersion: motion.version, value: 'approve',
    });
    decision = secondVote.decision;
    expect(secondVote.result).toMatchObject({ final: true, disposition: 'approved', approvals: 2 });
    expect(decision.dispositionBasis).toBe('vote');
    expect(decision.conditions).toEqual(['Management must return verified evidence by September 15, 2026.']);

    let action = await fixture.meetings.createActionItem(testContext('person-chair', 'action-create', at(21)), {
      decisionId: decision.id,
      title: 'Execute the authorized QAPI improvement project and return evidence',
      ownerId: 'person-manager',
      dueAt: '2026-08-31T23:59:59.000Z',
    });
    action = await fixture.meetings.updateActionItem(testContext('person-manager', 'action-accept', at(22), ['grp-governance-risk-manager']), {
      actionItemId: action.id, expectedVersion: action.version, command: 'accept',
    });
    action = await fixture.meetings.updateActionItem(testContext('person-manager', 'action-start', at(23), ['grp-governance-risk-manager']), {
      actionItemId: action.id, expectedVersion: action.version, command: 'start',
    });
    action = await fixture.meetings.updateActionItem(testContext('person-manager', 'action-evidence', at(24), ['grp-governance-risk-manager']), {
      actionItemId: action.id, expectedVersion: action.version, command: 'submit_evidence',
      artifacts: [{ artifactId: 'evidence-qapi-window-1', sourceMetadataId: TEST_LIVE_SOURCE.id }],
    });
    action = await fixture.meetings.updateActionItem(testContext('person-manager', 'action-certify', at(25), ['grp-governance-risk-manager']), {
      actionItemId: action.id, expectedVersion: action.version, command: 'management_certify',
      artifacts: [{ artifactId: 'certification-management-qapi', sourceMetadataId: TEST_LIVE_SOURCE.id }],
    });
    action = await fixture.meetings.updateActionItem(testContext('person-manager', 'action-return', at(26), ['grp-governance-risk-manager']), {
      actionItemId: action.id, expectedVersion: action.version, command: 'return_to_board',
    });
    action = await fixture.meetings.updateActionItem(testContext('person-chair', 'action-effectiveness', at(27)), {
      actionItemId: action.id, expectedVersion: action.version, command: 'effectiveness_effective',
      artifacts: [{ artifactId: 'board-effectiveness-basis-qapi', sourceMetadataId: TEST_LIVE_SOURCE.id }],
    });
    expect(action).toMatchObject({ status: 'effectiveness_accepted', effectivenessDisposition: 'effective' });
    expect(action.managementCertificationArtifactId).toBe('certification-management-qapi');

    const adjourned = await fixture.meetings.adjourn(testContext('person-chair', 'meeting-adjourn', at(30)), meeting.id, meeting.version);
    meeting = adjourned.meeting;
    let minutes = adjourned.minutes;
    let transition = await fixture.meetings.transitionMinutes(testContext('person-secretary', 'minutes-reconcile', at(31)), {
      minutesId: minutes.id, expectedVersion: minutes.version, command: 'reconcile', sourceLinkedRedlineArtifactId: 'minutes-redline-qapi',
    });
    minutes = transition.minutes;
    transition = await fixture.meetings.transitionMinutes(testContext('person-chair', 'minutes-chair-review', at(32)), {
      minutesId: minutes.id, expectedVersion: minutes.version, command: 'chair_review',
    });
    minutes = transition.minutes;
    const approvedHash = createHash('sha256').update('approved-qapi-minutes-v1').digest('hex');
    transition = await fixture.meetings.transitionMinutes(testContext('person-chair', 'minutes-board-approve', at(33)), {
      minutesId: minutes.id, expectedVersion: minutes.version, command: 'board_approve', approvedContentSha256: approvedHash,
    });
    minutes = transition.minutes;
    transition = await fixture.meetings.transitionMinutes(testContext('person-secretary', 'minutes-route-signature', at(34)), {
      minutesId: minutes.id, expectedVersion: minutes.version, command: 'route_signature', ecignInstanceId: 'ecign-minutes-qapi-v1',
    });
    minutes = transition.minutes;
    transition = await fixture.meetings.transitionMinutes(testContext('person-chair', 'minutes-close', at(35)), {
      minutesId: minutes.id, expectedVersion: minutes.version, command: 'close',
    });
    minutes = transition.minutes;
    meeting = transition.meeting;
    expect(minutes).toMatchObject({ status: 'signed_locked', finalContentSha256: approvedHash, finalSignedArtifactId: 'ecign-minutes-qapi-v1' });
    expect(meeting.status).toBe('closed');

    const correction = await fixture.meetings.correctSignedMinutes(testContext('person-chair', 'minutes-correct', at(36)), {
      minutesId: minutes.id,
      expectedVersion: minutes.version,
      correctionArtifactId: 'minutes-correction-redline-v2',
      correctionReason: 'Correct the recorded effectiveness-return date while preserving the signed original and its exact content hash.',
    });
    expect(correction.supersededMinutes).toMatchObject({ status: 'superseded', finalContentSha256: approvedHash });
    expect(correction.correctionMinutes).toMatchObject({ status: 'chair_reviewed', supersedesMinutesId: minutes.id });
    const correctedHash = createHash('sha256').update('approved-qapi-minutes-v2').digest('hex');
    transition = await fixture.meetings.transitionMinutes(testContext('person-chair', 'correction-approve', at(37)), {
      minutesId: correction.correctionMinutes.id,
      expectedVersion: correction.correctionMinutes.version,
      command: 'board_approve',
      approvedContentSha256: correctedHash,
    });
    transition = await fixture.meetings.transitionMinutes(testContext('person-secretary', 'correction-sign', at(38)), {
      minutesId: transition.minutes.id,
      expectedVersion: transition.minutes.version,
      command: 'route_signature',
      ecignInstanceId: 'ecign-minutes-qapi-v2',
    });
    transition = await fixture.meetings.transitionMinutes(testContext('person-chair', 'correction-close', at(39)), {
      minutesId: transition.minutes.id,
      expectedVersion: transition.minutes.version,
      command: 'close',
    });
    expect(transition.minutes).toMatchObject({ status: 'signed_locked', finalContentSha256: correctedHash, supersedesMinutesId: minutes.id });
    expect(transition.meeting.status).toBe('closed');

    const outbox = await fixture.repository.list<AuditOutboxRecord>(TEST_LIVE_SOURCE.organizationId, 'audit_outbox');
    const eventTypes = new Set(outbox.map((event) => event.eventType));
    for (const required of [
      'governance.meeting.created', 'governance.board_book.locked', 'governance.board_book.distributed',
      'governance.vote.disposition_recorded', 'governance.minutes.close', 'governance.action.effectiveness_effective',
      'governance.minutes.correction_opened',
    ]) expect(eventTypes.has(required)).toBe(true);
  });

  it('derives written-consent approval from the approved profile and verified eCIgn signer identities', async () => {
    const fixture = await createGovernanceTestFixture();
    let decision = await fixture.meetings.createDecision(testContext('person-chair', 'consent-decision', at(1)), {
      title: 'Emergency QAPI containment authority',
      question: 'Approve bounded containment pending a full meeting return?',
      origin: 'written_consent', authorityProfileVersionId: TEST_PROFILE.id, authorityKey: 'qapi_pip',
      sourceMetadataIds: [TEST_LIVE_SOURCE.id],
    });
    decision = await fixture.meetings.transitionDecision(testContext('person-chair', 'consent-triage', at(1.5)), {
      decisionId: decision.id,
      expectedVersion: decision.version,
      command: 'triage',
    });
    const created = await fixture.meetings.createWrittenConsent(testContext('person-chair', 'consent-create', at(2)), {
      decisionId: decision.id,
      text: 'Approve bounded containment and require ratification at the next duly called meeting.',
      expiresAt: at(120),
    });
    decision = created.decision;
    fixture.ecign.signatureUsers.set('ecign-consent-chair', new Set(['person-chair']));
    fixture.ecign.signatureUsers.set('ecign-consent-secretary', new Set(['person-secretary']));
    const first = await fixture.meetings.signWrittenConsent(testContext('person-chair', 'consent-chair', at(3)), {
      writtenConsentId: created.consent.id,
      expectedVersion: created.consent.version,
      signatureArtifactId: 'ecign-consent-chair',
    });
    expect(first.consent.status).toBe('collecting');
    const second = await fixture.meetings.signWrittenConsent(testContext('person-secretary', 'consent-secretary', at(4)), {
      writtenConsentId: first.consent.id,
      expectedVersion: first.consent.version,
      signatureArtifactId: 'ecign-consent-secretary',
    });
    decision = second.decision;
    expect(second.consent.status).toBe('approved');
    expect(decision).toMatchObject({ status: 'approved', dispositionBasis: 'written_consent' });
  });

  it('records successful record delivery, excludes denied delivery from the audit log, and hashes search terms with HMAC', async () => {
    const fixture = await createGovernanceTestFixture();
    const meeting = await fixture.meetings.createMeeting(testContext('person-chair', 'audit-meeting', at(0)), {
      meetingType: 'regular', title: 'Audit delivery test', authorityProfileVersionId: TEST_PROFILE.id,
      scheduledStart: at(120), timezone: 'America/Los_Angeles',
    });
    const delivered = await fixture.service.deliverRecord(testContext('person-chair', 'record-deliver-view', at(1)), {
      recordType: 'meeting', recordId: meeting.id, delivery: 'view',
    });
    expect(delivered.deliveredContentSha256).toMatch(/^[a-f0-9]{64}$/);
    await fixture.service.deliverRecord(testContext('person-chair', 'record-deliver-download', at(1.1)), {
      recordType: 'meeting', recordId: meeting.id, delivery: 'download',
    });
    await fixture.service.deliverRecord(testContext('person-chair', 'record-deliver-print', at(1.2)), {
      recordType: 'meeting', recordId: meeting.id, delivery: 'print',
    });
    await fixture.service.deliverRecord(testContext('person-chair', 'record-deliver-share', at(1.3)), {
      recordType: 'meeting', recordId: meeting.id, delivery: 'share', recipientIds: ['member-secretary'],
    });
    const beforeDenied = await fixture.repository.list<GovernanceRecordAccessEvent>(TEST_LIVE_SOURCE.organizationId, 'record_access_event');
    await expect(fixture.service.deliverRecord({
      organizationId: TEST_LIVE_SOURCE.organizationId,
      actor: testActor('technical-admin', ['grp-super-admin']),
      correlationId: 'correlation:denied', idempotencyKey: 'idempotency:denied', now: at(2),
    }, { recordType: 'meeting', recordId: meeting.id, delivery: 'view' })).rejects.toMatchObject({ status: 404 });
    const afterDenied = await fixture.repository.list<GovernanceRecordAccessEvent>(TEST_LIVE_SOURCE.organizationId, 'record_access_event');
    expect(beforeDenied.map((event) => event.delivery).sort()).toEqual(['download', 'print', 'share', 'view']);
    expect(afterDenied).toHaveLength(4);

    process.env.GOVERNANCE_SEARCH_HMAC_KEY = 'governance-test-search-key-is-at-least-32-bytes';
    const search = await fixture.service.search({
      organizationId: TEST_LIVE_SOURCE.organizationId,
      actor: testActor('person-chair'), correlationId: 'correlation:search', now: at(3),
    }, { q: 'Audit delivery', limit: 20 });
    expect(search.algorithm).toBe('HMAC-SHA-256');
    expect(search.queryHash).toMatch(/^[a-f0-9]{64}$/);
    expect(search.queryHash).not.toContain('Audit delivery');
    expect(search.results.some((result) => result.id === meeting.id)).toBe(true);
    const deniedSearch = await fixture.service.search({
      organizationId: TEST_LIVE_SOURCE.organizationId,
      actor: testActor('technical-admin', ['grp-super-admin']), correlationId: 'correlation:search-denied', now: at(4),
    }, { q: 'Audit delivery', limit: 20 });
    expect(deniedSearch.results).toEqual([]);
  });
});
