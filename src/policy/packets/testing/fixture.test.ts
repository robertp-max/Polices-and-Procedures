// @vitest-environment node
/**
 * WP-1.5 — §24 Q1-2026 canonical synthetic fixture gates.
 * Segmentation + derivation smoke against the existing (read-only) QAPI intake adapter.
 */
import { describe, it, expect } from 'vitest';
import { parseSourceFile } from '../../evidence/intake/fileParsing';
import {
  deriveQapiBundle,
  extractEscalationItems,
  extractQapiTextAggregates,
  extractRecordSegments,
  resolveQapiSource,
  segmentQapiSourceByQuarter,
  selectQuarterSegment,
} from '../../brad/intake/adapters/qapiIntakeAdapter';
import {
  loadQapiFixture,
  Q1_FIXTURE_EXPECTATIONS as E,
  QAPI_FIXTURE_PATHS,
} from './loadQapiFixture';

const q1Text = loadQapiFixture(QAPI_FIXTURE_PATHS.q1);
const contaminatedText = loadQapiFixture(QAPI_FIXTURE_PATHS.contaminated);

/** Explicit AE-row marker for ED-without-hospitalization (fixture contract; not yet an aggregate field). */
const ED_NO_HOSP_MARKER = 'ed-visit-no-hospitalization';

function parseTxt(text: string, fileName: string) {
  return parseSourceFile({
    fileName,
    mimeType: 'text/plain',
    byteLength: Buffer.byteLength(text, 'utf8'),
    text,
  });
}

/**
 * Adapter contract: segmentQapiSourceByQuarter returns [] when the source has
 * 0–1 `Dataset ID: QAPI-Q{n}-DS-…` markers (single-quarter path). Multi-quarter
 * segmentation only activates when marks.length ≥ 2. For the pure Q1 file we
 * therefore recover the logical segment fields with the SAME marker regexes the
 * adapter uses, so acceptance can still assert dataset id / agency / synthetic /
 * meeting date without inventing a second fake Dataset ID.
 */
function logicalSingleQuarterSegment(text: string) {
  const datasetId = /Dataset ID:\s*(QAPI-Q([1-4])-DS-[A-Za-z0-9-]+)/.exec(text)?.[1] ?? null;
  const qMatch = /Quarter:\s*Q([1-4])\s*(20\d{2})/.exec(text);
  return {
    datasetId,
    quarter: qMatch ? `${qMatch[2]}-Q${qMatch[1]}` : null,
    quarterLabel: qMatch ? `Q${qMatch[1]} ${qMatch[2]}` : null,
    agency: /Agency:\s*([^\n|]+)/.exec(text)?.[1]?.trim() ?? null,
    meetingDate: /QAPI Meeting Date:\s*(20\d{2}-\d{2}-\d{2})/.exec(text)?.[1] ?? null,
    synthetic: /\bsynthetic\b|\bmock\b|not for production|no real phi/i.test(text),
    text,
  };
}

describe('QAPI-Q1-DS-001 — canonical Q1 fixture markers', () => {
  it('is a single-quarter source (adapter returns no multi-quarter split)', () => {
    // Adapter single-quarter contract (qapiIntakeAdapter.segmentQapiSourceByQuarter):
    // if Dataset ID markers.length <= 1, return [] so resolveQapiSource keeps the
    // full text as a single-quarter source rather than inventing a multi-quarter
    // boundary. This is intentional — do NOT add a fake second Dataset ID to the
    // pure Q1 fixture just to force a length-1 segments array.
    expect(segmentQapiSourceByQuarter(q1Text)).toEqual([]);
  });

  it('yields exactly one logical Q1 segment with dataset id, agency, synthetic flag, meeting date', () => {
    const seg = logicalSingleQuarterSegment(q1Text);
    expect(seg.datasetId).toBe(E.datasetId);
    expect(seg.quarter).toBe(E.quarter);
    expect(seg.quarterLabel).toBe(E.quarterLabel);
    expect(seg.agency).toBe(E.agency);
    expect(seg.meetingDate).toBe(E.meetingDate);
    expect(seg.synthetic).toBe(true);
    expect(q1Text).toContain(E.syntheticBanner);
    expect(q1Text).toContain(E.workflowId);
    expect(q1Text).toMatch(/January 1\s*[–-]\s*March 31,?\s*2026/);
    expect(q1Text).toContain(E.periodStart);
    expect(q1Text).toContain(E.periodEnd);
    // No Q2 content in the pure Q1 file.
    expect(q1Text).not.toMatch(/Dataset ID:\s*QAPI-Q2-DS-/);
    expect(q1Text).not.toMatch(/Quarter:\s*Q2\s*2026/);
  });
});

describe('QAPI-Q1Q2-CONTAMINATED — real adapter multi-quarter + cross-agency hard stops', () => {
  // End-to-end against the real adapter API (not reimplemented regex).
  const segs = segmentQapiSourceByQuarter(contaminatedText);
  const parsedContaminated = parseTxt(contaminatedText, 'QAPI-Q1Q2-CONTAMINATED.txt');

  it('segmentQapiSourceByQuarter returns distinct Q1 and Q2 segments (plus cross-agency bait)', () => {
    expect(segs.length).toBe(3);
    const q1 = segs.find((s) => s.datasetId === E.datasetId);
    const q2 = segs.find((s) => s.datasetId === 'QAPI-Q2-DS-001');
    const cross = segs.find((s) => s.datasetId === 'QAPI-Q3-DS-099');
    expect(q1).toBeDefined();
    expect(q2).toBeDefined();
    expect(cross).toBeDefined();
    expect(q1!.quarterLabel).toBe('Q1 2026');
    expect(q1!.quarter).toBe(E.quarter);
    expect(q1!.meetingDate).toBe(E.meetingDate);
    expect(q1!.agency).toContain('Northwind Synthetic');
    expect(q1!.synthetic).toBe(true);
    expect(q2!.quarterLabel).toBe('Q2 2026');
    expect(q2!.meetingDate).toBe('2026-07-10');
    expect(q2!.agency).toContain('Northwind Synthetic');
    // Segments are hard-bounded: Q1 text must not contain the Q2 Dataset ID line.
    expect(q1!.text).toContain('Dataset ID: QAPI-Q1-DS-001');
    expect(q1!.text).not.toContain('Dataset ID: QAPI-Q2-DS-001');
    expect(q2!.text).toContain('Dataset ID: QAPI-Q2-DS-001');
    expect(q2!.text).not.toContain('Dataset ID: QAPI-Q1-DS-001');
  });

  it('resolveQapiSource / selectQuarterSegment targeted at Q1 (or 2026-04-09) selects ONLY Q1', () => {
    const byDate = selectQuarterSegment(segs, { eventDateISO: E.meetingDate });
    expect(byDate.conflict).toBe(false);
    expect(byDate.segment).not.toBeNull();
    expect(byDate.segment!.datasetId).toBe(E.datasetId);
    expect(byDate.segment!.quarter).toBe(E.quarter);
    expect(byDate.segment!.meetingDate).toBe(E.meetingDate);
    expect(byDate.segment!.text).not.toContain('Dataset ID: QAPI-Q2-DS-001');
    expect(byDate.segment!.text).not.toContain('Q2 Only Admin');
    expect(byDate.segment!.text).not.toContain('Lakeside Contaminant');
    expect(byDate.segment!.text).not.toMatch(/7 patients hospitalized during Q2/);

    const byQuarter = selectQuarterSegment(segs, { targetQuarter: E.quarter });
    expect(byQuarter.conflict).toBe(false);
    expect(byQuarter.segment!.datasetId).toBe(E.datasetId);
    expect(byQuarter.segment!.text).not.toContain('Dataset ID: QAPI-Q2-DS-001');

    const resolvedByMeeting = resolveQapiSource(parsedContaminated, E.meetingDate);
    expect(resolvedByMeeting.conflict).toBe(false);
    expect(resolvedByMeeting.segment!.datasetId).toBe(E.datasetId);
    expect(resolvedByMeeting.segment!.quarter).toBe(E.quarter);
    const narrowed = resolvedByMeeting.parsed.records.map((r) => r.text ?? '').join('\n');
    expect(narrowed).toContain(E.datasetId);
    expect(narrowed).not.toContain('Dataset ID: QAPI-Q2-DS-001');
    expect(narrowed).not.toMatch(/7 patients hospitalized during Q2/);
    expect(narrowed).not.toContain('Q2 Only Admin');

    const resolvedByQuarter = resolveQapiSource(parsedContaminated, E.meetingDate, E.quarter);
    expect(resolvedByQuarter.conflict).toBe(false);
    expect(resolvedByQuarter.segment!.datasetId).toBe(E.datasetId);
  });

  it('requesting an absent quarter fails closed via selectQuarterSegment and resolveQapiSource', () => {
    const absent = selectQuarterSegment(segs, { targetQuarter: '2025-Q4' });
    expect(absent.conflict).toBe(true);
    expect(absent.segment).toBeNull();
    expect(absent.reason).toMatch(/not present/i);

    const noMeetingMatch = resolveQapiSource(parsedContaminated, '2026-02-05');
    expect(noMeetingMatch.conflict).toBe(true);
    expect(noMeetingMatch.segment).toBeNull();

    const absentQuarter = resolveQapiSource(parsedContaminated, E.meetingDate, '2025-Q4');
    expect(absentQuarter.conflict).toBe(true);
    expect(absentQuarter.segment).toBeNull();

    const bundle = deriveQapiBundle(parsedContaminated, '2026-02-05');
    expect(bundle.sourceMode).toBe('none');
    expect(bundle.overallNote).toMatch(/SOURCE CONFLICT/i);
  });

  it('never merges the cross-agency segment into the selected Q1 segment', () => {
    const q1 = segs.find((s) => s.datasetId === E.datasetId)!;
    const cross = segs.find((s) => s.datasetId === 'QAPI-Q3-DS-099')!;
    expect(cross.agency).toMatch(/Lakeside Contaminant/);
    expect(cross.agency).not.toBe(q1.agency);
    expect(q1.text).not.toContain('Lakeside Contaminant');
    expect(q1.text).not.toContain('999 patients');
    expect(q1.text).not.toContain('42 patients hospitalized');
    expect(q1.text).not.toContain('Contaminant Admin');

    const resolved = resolveQapiSource(parsedContaminated, E.meetingDate);
    expect(resolved.segment!.datasetId).toBe(E.datasetId);
    const body = resolved.parsed.records.map((r) => r.text ?? '').join('\n');
    expect(body).not.toContain('Lakeside Contaminant');
    expect(body).not.toContain('Contaminant Admin');
    expect(body).not.toContain('Dataset ID: QAPI-Q3-DS-099');
    expect(resolved.segment!.agency).toContain('Northwind Synthetic');
  });
});

describe('§24 derivation smoke — real extractQapiTextAggregates / deriveQapiBundle / extract* APIs', () => {
  const q1SegmentFromContaminated = segmentQapiSourceByQuarter(contaminatedText).find(
    (s) => s.datasetId === E.datasetId,
  )!.text;

  it('extractQapiTextAggregates recovers census, episodes, hospitalizations (§24 exact)', () => {
    const agg = extractQapiTextAggregates(q1Text);
    expect(agg.activeCensus?.value).toBe(E.activePatientsAtPeriodEnd);
    expect(agg.episodesTotal?.value).toBe(E.episodesTotal);
    expect(agg.hospitalizations?.value).toBe(E.hospitalizations);
    expect(agg.activeCensus?.value).not.toBeNull();
    expect(agg.episodesTotal?.value).not.toBe(0);
    expect(agg.hospitalizations?.value).not.toBe(0);
  });

  it('extractQapiTextAggregates recovers attendance 9 of 9 (§24 exact)', () => {
    const agg = extractQapiTextAggregates(q1Text);
    expect(agg.quorum).toMatchObject({
      present: E.committeeAttendancePresent,
      total: E.committeeAttendanceTotal,
      met: true,
    });
    expect(agg.attendeePresentCount?.value).toBe(E.committeeAttendancePresent);
  });

  it('extractEscalationItems recovers 4 GBE items (§24 exact)', () => {
    const gbe = extractEscalationItems(q1Text);
    expect(gbe).toHaveLength(E.governingBodyEscalationItems);
    expect(gbe.map((g) => g.id)).toEqual(['GBE-001', 'GBE-002', 'GBE-003', 'GBE-004']);
  });

  it('extractQapiTextAggregates recovers 8 PIP-trigger scenarios as evaluations (§24 exact)', () => {
    const agg = extractQapiTextAggregates(q1Text);
    expect(agg.pipTriggerCount?.value).toBe(E.pipTriggerScenarios);
    // Named "PIP — …" formal recommendations must NOT be auto-mined from evaluations-only text.
    expect(agg.pipNames.length).toBe(0);
    // All 8 scenarios are threshold breaches with explicit num/den (fixture contract).
    const pipLines = q1Text
      .split('\n')
      .filter((line) => /PIP-T-Q1-\d{3}/.test(line));
    expect(pipLines).toHaveLength(E.pipTriggerScenarios);
    for (const line of pipLines) {
      expect(line).toMatch(/\bnum\s+\d+/i);
      expect(line).toMatch(/\bden\s+\d+/i);
      expect(line).toMatch(/threshold\s*[\u2264\u2265]\s*\d+/i);
      expect(line).toMatch(/\bBREACH\b/);
    }
  });

  it('extractQapiTextAggregates recovers 5 personnel-review triggers via DT family (§24 exact)', () => {
    const agg = extractQapiTextAggregates(q1Text);
    expect(agg.disciplinaryCount?.value).toBe(E.personnelReviewTriggers);
    const dt = extractRecordSegments(q1Text, 'DT');
    expect(dt).toHaveLength(E.personnelReviewTriggers);
    expect(q1Text).not.toMatch(/\b(termination|written warning|suspension|employee investigation)\b/i);
    for (const row of dt) {
      expect(row.text).toMatch(/category:/i);
      expect(row.text).toMatch(/policy-ref:/i);
      expect(row.text).toMatch(/status:/i);
    }
  });

  it('ED-without-hospitalization: AE rows carry explicit marker (count 3); no fake aggregate recovery', () => {
    // NOTE: extractQapiTextAggregates / deriveQapiBundle have no dedicated ED-without-
    // hospitalization aggregate field today. Derivation-level ED aggregation lands in a
    // later work package. This fixture asserts the source-row contract only: three AE
    // records carry the explicit marker, recoverable via extractRecordSegments — do NOT
    // invent recovery through the aggregates API.
    const ae = extractRecordSegments(q1Text, 'AE');
    const edRows = ae.filter((s) => s.text.includes(ED_NO_HOSP_MARKER));
    expect(edRows).toHaveLength(E.edVisitsWithoutHospitalization);
    expect(edRows.map((r) => r.id).sort()).toEqual(['AE-Q1-006', 'AE-Q1-007', 'AE-Q1-008']);
    // Honest negative: aggregates API does not surface ED-without-hospitalization.
    const agg = extractQapiTextAggregates(q1Text);
    expect(agg).not.toHaveProperty('edVisitsWithoutHospitalization');
  });

  it('deriveQapiBundle on pure Q1 recovers every §24 count the real API can derive', () => {
    const parsed = parseTxt(q1Text, 'QAPI-Q1-DS-001.txt');
    const bundle = deriveQapiBundle(parsed, E.meetingDate);
    const agg = extractQapiTextAggregates(q1Text);
    expect(bundle.sourceMode).not.toBe('none');
    expect(bundle.overallNote).not.toMatch(/SOURCE CONFLICT/i);

    // Census / hospitalizations / attendance / personnel via deriveQapiBundle.
    expect(bundle.censusPopulation.activeCensus.value).toBe(E.activePatientsAtPeriodEnd);
    expect(bundle.adverseEvents.hospitalizationsTotal.value).toBe(E.hospitalizations);
    expect(bundle.meetingDetails.quorumStatus.value).toBe(
      `${E.committeeAttendancePresent}/${E.committeeAttendanceTotal} present — quorum met`,
    );
    expect(bundle.meetingDetails.attendeeRoster.value).toBe(
      `${E.committeeAttendancePresent} attendees recorded present`,
    );
    expect(bundle.highRiskRollup.clinicianDisciplinaryActionCount.value).toBe(
      E.personnelReviewTriggers,
    );

    // Episodes + PIP triggers via extractQapiTextAggregates (same Path-3 source).
    expect(agg.episodesTotal?.value).toBe(E.episodesTotal);
    expect(agg.pipTriggerCount?.value).toBe(E.pipTriggerScenarios);

    // GBE via extractEscalationItems.
    expect(extractEscalationItems(q1Text)).toHaveLength(E.governingBodyEscalationItems);

    expect(bundle.censusPopulation.activeCensus.value).not.toBeNull();
    expect(bundle.censusPopulation.activeCensus.confidence).not.toBe('none');
  });

  it('deriveQapiBundle on contaminated dump at Q1 meeting date does not bleed Q2 / cross-agency bait', () => {
    const parsed = parseTxt(contaminatedText, 'QAPI-Q1Q2-CONTAMINATED.txt');
    const bundle = deriveQapiBundle(parsed, E.meetingDate);
    expect(bundle.sourceMode).not.toBe('none');
    expect(bundle.censusPopulation.activeCensus.value).toBe(E.activePatientsAtPeriodEnd);
    expect(bundle.adverseEvents.hospitalizationsTotal.value).toBe(E.hospitalizations);
    // Q2 bait: 100 active-at-start, 7 hospitalizations, 8/8 quorum — must not appear.
    expect(bundle.censusPopulation.activeCensus.value).not.toBe(100);
    expect(bundle.adverseEvents.hospitalizationsTotal.value).not.toBe(7);
    expect(bundle.meetingDetails.quorumStatus.value).toContain('9/9');
    expect(bundle.meetingDetails.quorumStatus.value).not.toContain('8/8');
    // Cross-agency 999 census bait excluded.
    expect(bundle.censusPopulation.activeCensus.value).not.toBe(999);
  });

  it('Q1 segment from contaminated file (real segmentQapiSourceByQuarter) matches pure Q1 §24 aggregates', () => {
    const agg = extractQapiTextAggregates(q1SegmentFromContaminated);
    expect(agg.activeCensus?.value).toBe(E.activePatientsAtPeriodEnd);
    expect(agg.episodesTotal?.value).toBe(E.episodesTotal);
    expect(agg.hospitalizations?.value).toBe(E.hospitalizations);
    expect(agg.pipTriggerCount?.value).toBe(E.pipTriggerScenarios);
    expect(agg.quorum?.present).toBe(E.committeeAttendancePresent);
    expect(agg.disciplinaryCount?.value).toBe(E.personnelReviewTriggers);
    expect(extractEscalationItems(q1SegmentFromContaminated)).toHaveLength(
      E.governingBodyEscalationItems,
    );
  });
});

describe('loadQapiFixture', () => {
  it('loads raw text from the parameterized path', () => {
    const again = loadQapiFixture(QAPI_FIXTURE_PATHS.q1);
    expect(again).toBe(q1Text);
    expect(again.length).toBeGreaterThan(500);
  });

  it('exports every §24 expectation as a const object', () => {
    expect(E.datasetId).toBe('QAPI-Q1-DS-001');
    expect(E.workflowId).toBe('QA-WF-03');
    expect(E.meetingDate).toBe('2026-04-09');
    expect(E.activePatientsAtPeriodEnd).toBe(120);
    expect(E.episodesTotal).toBe(127);
    expect(E.hospitalizations).toBe(5);
    expect(E.edVisitsWithoutHospitalization).toBe(3);
    expect(E.committeeAttendancePresent).toBe(9);
    expect(E.committeeAttendanceTotal).toBe(9);
    expect(E.governingBodyEscalationItems).toBe(4);
    expect(E.pipTriggerScenarios).toBe(8);
    expect(E.personnelReviewTriggers).toBe(5);
  });
});
