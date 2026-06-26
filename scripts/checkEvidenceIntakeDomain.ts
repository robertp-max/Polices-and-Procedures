/**
 * Brad Evidence Intake — pure domain verification (Section 24).
 *
 * Covers the invariant-critical pure logic with NO store/network:
 *   1  Jan occurrence / Mar source-created → filed under March / Q1
 *   2  Jan-created complaint → Jan monthly QAPI + Q1 quarterly QAPI memberships
 *   3  Same upload twice → identical idempotency key (one canonical)
 *   4  Changed record → same identity scope, different key → new version
 *   7  Packet membership does not duplicate on rerun
 *   8  Drive copy / membership retains canonicalEvidenceId provenance fields
 *   9  Full review covers every readable row
 *  10  Parse failures → partial review
 *  11  Findings include source pointers
 *  12  Brad output remains draft (draftOnly)
 *  14  Agenda prioritizes reviewed findings, not filenames
 *  15  Low-confidence findings not presented as established fact
 *  16  review_during_meeting option produces correct agenda disposition
 *  17  Two events sharing one workflow keep separate packet/membership state
 *  18  QAPI packet → exactly one signing task
 *  19  Dual-role DON/Admin → one dual-capacity signature
 *  20  Repeated task generation is deterministic (no duplicate ids)
 *
 * Run: tsx --tsconfig tsconfig.app.json scripts/checkEvidenceIntakeDomain.ts
 */
import assert from 'node:assert/strict';
import {
  resolveEvidenceCreatedDate,
  deriveFilingPeriod,
  buildIdempotencyKey,
  buildEvidenceIdentityScope,
  decideDedup,
  classifyEvidence,
  extractRecordFromCell,
  resolvePacketMembershipsForEvidence,
  buildPacketId,
  runBradReview,
  generateMeetingAgenda,
  resolvePacketSignatureRequirement,
  buildPacketTaskPlan,
  type CanonicalEvidence,
  type EvidenceSourceRecord,
} from '../src/policy/evidence/intake';

let passed = 0;
const ok = (label: string, cond: boolean) => { assert.ok(cond, label); passed++; console.log(`  ✓ ${label}`); };

function main(): void {
  /* 1 — Jan occurrence, Mar Salesforce CreatedDate → files under March / Q1 */
  {
    const r = resolveEvidenceCreatedDate({
      fields: { Id: 'a01', OccurrenceDate: '2026-01-08', CreatedDate: '2026-03-14T09:21:00.000Z', Category: 'Abuse' },
      sourceSystem: 'salesforce',
      uploadTimestamp: '2026-06-25T12:00:00Z',
    });
    ok('1: resolves Salesforce CreatedDate (March)', r.resolvedCreatedAt!.startsWith('2026-03'));
    ok('1: filing month is March (2026-03)', r.filingPeriod?.filingPeriodKey === '2026-03');
    ok('1: filing quarter is Q1', r.filingPeriod?.filingQuarterKey === '2026-Q1');
    ok('1: occurrence (January) retained separately', r.occurrenceAt!.startsWith('2026-01'));
    ok('1: occurrence does NOT drive filing', r.filingPeriod?.createdMonth === 3);
    ok('1: high confidence from CreatedDate', r.createdDateConfidence === 'high');
  }

  /* Resolver edge cases */
  {
    // WellSky formatted timestamp with a space
    const ws = resolveEvidenceCreatedDate({ fields: { RecordCreatedDate: '2026-02-28 23:30:00' }, sourceSystem: 'wellsky', uploadTimestamp: '2026-06-25T12:00:00Z' });
    ok('resolver: WellSky space-separated timestamp parses', ws.filingPeriod?.filingPeriodKey === '2026-02');
    // Malformed created date → needs review (no guessing)
    const bad = resolveEvidenceCreatedDate({ fields: { CreatedDate: 'not-a-date' }, sourceSystem: 'salesforce', uploadTimestamp: '2026-06-25T12:00:00Z' });
    ok('resolver: malformed created date → needs_date_review', bad.needsDateReview && bad.createdDateConfidence === 'unresolved');
    // Missing created date, salesforce → needs review (no upload fallback)
    const missing = resolveEvidenceCreatedDate({ fields: { OccurrenceDate: '2026-01-01' }, sourceSystem: 'salesforce', uploadTimestamp: '2026-06-25T12:00:00Z' });
    ok('resolver: missing created date (salesforce) → needs_date_review', missing.needsDateReview);
    // Manual upload, only upload timestamp → low-confidence resolve
    const manual = resolveEvidenceCreatedDate({ fields: { note: 'scanned doc' }, sourceSystem: 'manual', uploadTimestamp: '2026-05-10T12:00:00Z' });
    ok('resolver: manual upload timestamp final fallback (low)', !manual.needsDateReview && manual.createdDateConfidence === 'low' && manual.filingPeriod?.filingPeriodKey === '2026-05');
    // Quarter derivation
    ok('resolver: Q derivation Oct → Q4', deriveFilingPeriod('2026-10-15T00:00:00Z', 'America/Los_Angeles')?.filingQuarterKey === '2026-Q4');
    // Timezone boundary: an instant just after UTC midnight on Mar 1 is still Feb 28 in LA
    const tzEdge = deriveFilingPeriod('2026-03-01T02:00:00Z', 'America/Los_Angeles');
    ok('resolver: timezone boundary respected (LA)', tzEdge?.filingPeriodKey === '2026-02');
  }

  /* 3 — same upload twice → identical idempotency key */
  {
    const idInput = { sourceSystem: 'salesforce', sourceRecordId: 'CMP-1', sourceSystemCreatedAt: '2026-03-01T00:00:00Z', contentHash: 'abc', sourcePointer: '$.complaints[0]' };
    const k1 = buildIdempotencyKey(idInput);
    const k2 = buildIdempotencyKey({ ...idInput });
    ok('3: identical record → identical idempotency key', k1 === k2);
    const decision = decideDedup(idInput, [{ evidenceId: 'EV1', identityScope: buildEvidenceIdentityScope(idInput), idempotencyKey: k1, contentHash: 'abc' }]);
    ok('3: re-upload detected as duplicate (reuse EV1)', decision.kind === 'duplicate' && decision.existingEvidenceId === 'EV1');
  }

  /* 4 — changed record → new version, same identity scope */
  {
    const base = { sourceSystem: 'salesforce', sourceRecordId: 'CMP-1', sourceSystemCreatedAt: '2026-03-01T00:00:00Z', contentHash: 'abc', sourcePointer: '$.complaints[0]' };
    const changed = { ...base, contentHash: 'def' };
    const known = [{ evidenceId: 'EV1', identityScope: buildEvidenceIdentityScope(base), idempotencyKey: buildIdempotencyKey(base), contentHash: 'abc' }];
    const decision = decideDedup(changed, known);
    ok('4: changed record → new_version superseding EV1', decision.kind === 'new_version' && decision.supersedesEvidenceId === 'EV1');
  }

  /* classification deterministic signal */
  {
    const c = classifyEvidence({ fileName: 'salesforce_complaints_q1.csv', columnHeaders: ['Id', 'Complaint Description', 'Resolution'] });
    ok('classify: complaints_grievances from filename/columns', c.classification === 'complaints_grievances' && c.confidence > 0.4);
    const unk = classifyEvidence({ fileName: 'misc.csv', columnHeaders: ['a', 'b'] });
    ok('classify: no signal → unknown_needs_review (0 confidence)', unk.classification === 'unknown_needs_review' && unk.confidence === 0);
  }

  /* 2 + 7 + 8 — packet membership rollups, no dup on rerun, copy provenance */
  {
    const canon: CanonicalEvidence = {
      evidenceId: 'EVc', batchId: 'B', sourceFileName: 'complaints.csv', sourceFileId: 'F', sourcePointer: 'row:2',
      sourceSystem: 'salesforce', sourceRecordId: 'CMP-1', sourceSystemCreatedAt: '2026-01-20T00:00:00Z',
      occurrenceAt: '2026-01-02T00:00:00Z', reportedAt: null,
      filingPeriodKey: '2026-01', filingQuarterKey: '2026-Q1', classification: 'complaints_grievances',
      contentHash: 'h', recordVersion: 1, driveFileId: 'drive-123', driveFolderId: null, driveFolderPath: null,
      driveUploadStatus: 'uploaded', linkedEventIds: ['evt-1'], linkedWorkflowIds: [], linkedSwimlaneIds: [],
      linkedPacketIds: [], createdAt: '2026-01-20T00:00:00Z', createdBy: 'Brad',
    };
    const m1 = resolvePacketMembershipsForEvidence(canon, { eventId: 'evt-1', createdBy: 'Brad' });
    const monthly = m1.find((m) => m.packetId === buildPacketId('qapi-quarterly-committee', '2026-01'));
    const quarterly = m1.find((m) => m.packetId === buildPacketId('qapi-quarterly-committee', '2026-Q1'));
    const complaint = m1.find((m) => m.packetId.startsWith(buildPacketId('complaint-grievance-investigation', '2026-01')));
    ok('2: Jan-created complaint joins monthly QAPI (2026-01)', !!monthly);
    ok('2: Jan-created complaint joins quarterly QAPI (2026-Q1)', !!quarterly);
    ok('2: complaint also joins complaint/grievance packet', !!complaint);
    ok('8: membership retains canonicalEvidenceId provenance', m1.every((m) => m.canonicalEvidenceId === 'EVc'));
    const m2 = resolvePacketMembershipsForEvidence(canon, { eventId: 'evt-1', createdBy: 'Brad' });
    ok('7: rerun yields identical (deterministic) membership ids', m2.map((m) => m.membershipId).join(',') === m1.map((m) => m.membershipId).join(','));
  }

  /* 17 — two events, one workflow → separate packet/membership state */
  {
    const mk = (eventId: string): CanonicalEvidence => ({
      evidenceId: `EV-${eventId}`, batchId: 'B', sourceFileName: 'f.csv', sourceFileId: 'F', sourcePointer: 'row:2',
      sourceSystem: 'wellsky', sourceRecordId: 'X', sourceSystemCreatedAt: '2026-03-01T00:00:00Z', occurrenceAt: null, reportedAt: null,
      filingPeriodKey: '2026-03', filingQuarterKey: '2026-Q1', classification: 'incident_adverse_event', contentHash: 'h',
      recordVersion: 1, driveFileId: null, driveFolderId: null, driveFolderPath: null, driveUploadStatus: 'pending',
      linkedEventIds: [eventId], linkedWorkflowIds: ['QA-WF-03'], linkedSwimlaneIds: [], linkedPacketIds: [], createdAt: '2026-03-01T00:00:00Z', createdBy: 'Brad',
    });
    const a = resolvePacketMembershipsForEvidence(mk('evt-A'), { eventId: 'evt-A', workflowId: 'QA-WF-03', createdBy: 'Brad' });
    const b = resolvePacketMembershipsForEvidence(mk('evt-B'), { eventId: 'evt-B', workflowId: 'QA-WF-03', createdBy: 'Brad' });
    ok('17: same workflow, different events → distinct membership eventIds', a.every((m) => m.eventId === 'evt-A') && b.every((m) => m.eventId === 'evt-B'));
  }

  /* 9-12, 15 — full-population review + findings */
  {
    const recs: EvidenceSourceRecord[] = [];
    const cells = [
      { pointer: 'row:2', fields: { Id: 'CMP-1', 'Complaint Description': 'late visit', Status: '' } },
      { pointer: 'row:3', fields: { Id: 'CMP-2', 'Complaint Description': 'billing', InvestigationStatus: 'closed' } },
    ];
    for (const c of cells) {
      recs.push(extractRecordFromCell(
        { pointer: c.pointer, fields: c.fields, text: Object.values(c.fields).join(' ') },
        { batchId: 'B', sourceFileId: 'F', sourceFileName: 'complaints.csv', sourceSystem: 'manual', uploadedAt: '2026-03-10T00:00:00Z' },
      ));
    }
    const raw: Record<string, Record<string, unknown>> = {};
    recs.forEach((r, i) => { raw[r.sourceRecordKey] = cells[i].fields; });
    const run = runBradReview({ batchId: 'B', reviewRunId: 'RR', mode: 'full_population', startedAt: 'now', completedAt: 'now', records: recs, rawFieldsByRecordKey: raw, failedRecords: 0 });
    ok('9: full review covers every readable record', run.reviewedRecords === recs.length && run.status === 'draft_ready');
    ok('11: findings carry source pointers', run.findings.length > 0 && run.findings.every((f) => !!f.sourcePointer));
    ok('12: findings are draft-only', run.findings.every((f) => f.draftOnly === true));

    /* 10 — parse failures → partial */
    const partial = runBradReview({ batchId: 'B', reviewRunId: 'RR2', mode: 'full_population', startedAt: 'now', completedAt: 'now', records: recs, rawFieldsByRecordKey: raw, failedRecords: 1 });
    ok('10: parse failure → partial status (not "complete")', partial.status === 'partial' && !/complete/i.test(partial.coverageStatement.replace('NOT complete', '')));

    /* 14 + 15 + 16 — agenda */
    const agenda = generateMeetingAgenda(run, { agendaId: 'AG', generatedAt: 'now', reviewDuringMeetingFindingIds: [run.findings[0].findingId] });
    ok('14: agenda built from finding types, not filenames', agenda.sections.length > 0 && agenda.sections.every((s) => s.items.every((it) => it.findingType.length > 0)));
    ok('16: review_during_meeting disposition applied', agenda.reviewDuringMeetingCount === 1);
    ok('15: draft findings labeled draft_pending_review', agenda.sections.some((s) => s.items.some((it) => it.disposition === 'draft_pending_review')));
  }

  /* 18-20 — signing + tasks */
  {
    const single = resolvePacketSignatureRequirement({ packetId: 'P', eventId: 'E', requiredSignerRoles: ['Director of Nursing', 'Administrator'], signer: { userId: 'u', roles: ['DON', 'Administrator'] } });
    ok('19: dual-role DON/Admin → one signature, dual-capacity', single.requiredSignatureCount === 1 && single.dualCapacity && single.allowSingleUserToSatisfyMultipleRoles);
    ok('19: dual-capacity attestation text present', /both Director of Nursing and Administrator/.test(single.attestationText));

    const plan1 = buildPacketTaskPlan({ eventId: 'E', packetId: 'P', requiredSignerRoles: ['Director of Nursing', 'Administrator'], signer: { userId: 'u', roles: ['DON', 'Administrator'] }, hasAgenda: true, hasDraftForms: true, hasUnresolvedDates: true });
    const signingTasks = plan1.filter((t) => t.kind === 'sign_packet_attestation');
    ok('18: QAPI packet → exactly one signing task', signingTasks.length === 1);
    const plan2 = buildPacketTaskPlan({ eventId: 'E', packetId: 'P', requiredSignerRoles: ['Director of Nursing', 'Administrator'], signer: { userId: 'u', roles: ['DON', 'Administrator'] }, hasAgenda: true, hasDraftForms: true, hasUnresolvedDates: true });
    ok('20: repeated generation → identical task ids (no duplicates)', plan1.map((t) => t.taskId).join('|') === plan2.map((t) => t.taskId).join('|'));
  }

  console.log(`\nEvidence Intake DOMAIN checks passed: ${passed}`);
}

main();
