// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parseSourceFile } from '@/policy/evidence/intake/fileParsing';
import { deriveQapiBundle } from '@/policy/brad/intake/adapters/qapiIntakeAdapter';
import type { QapiDerivedMetric } from '@/policy/brad/intake/adapters/qapiIntakeAdapter';
import {
  loadQapiFixture,
  Q1_FIXTURE_EXPECTATIONS as E,
  QAPI_FIXTURE_PATHS,
} from '@/policy/packets/testing/loadQapiFixture';
import {
  createSourceFormUtilizationReport,
  countReviewedRecords,
} from './sourceUtilization';
import {
  segmentParsedSource,
  SOURCE_SEGMENT_EXCLUSION_REASONS,
} from './segmentSources';
import {
  renderRecoveredSourceValue,
  SOURCE_VALIDATION_STATUS,
  UNKNOWN_NOT_RECOVERED_TEXT,
  validationStatusForQapiMetric,
} from './sourceValidation';

const q1Text = loadQapiFixture(QAPI_FIXTURE_PATHS.q1);
const contaminatedText = loadQapiFixture(QAPI_FIXTURE_PATHS.contaminated);

function parseTxt(text: string, fileName: string) {
  return parseSourceFile({
    fileName,
    mimeType: 'text/plain',
    byteLength: Buffer.byteLength(text, 'utf8'),
    text,
  });
}

describe('universal source segmentation', () => {
  it('resolves the canonical Q1 source alone and permits the governance date after Q1 close', () => {
    const result = segmentParsedSource({
      parsed: parseTxt(q1Text, 'QAPI-Q1-DS-001.txt'),
      eventDateISO: E.meetingDate,
      targetAgency: E.agency,
      targetPeriod: E.quarter,
      sourceId: 'q1-fixture',
    });

    expect(result.status).toBe('selected');
    expect(result.validationStatus).toBe(SOURCE_VALIDATION_STATUS.validated);
    expect(result.selectedSegment?.datasetId).toBe(E.datasetId);
    expect(result.selectedSegment?.period).toBe(E.quarter);
    expect(result.selectedSegment?.periodEnd).toBe(E.periodEnd);
    expect(result.selectedSegment?.eventDate).toBe(E.meetingDate);
    expect(result.selectedSegment?.dateRole).toBe('governance');
    const selectedSegment = result.selectedSegment;
    if (!selectedSegment?.eventDate || !selectedSegment.periodEnd) {
      throw new Error('Expected selected Q1 segment to include eventDate and periodEnd.');
    }
    expect(Date.parse(selectedSegment.eventDate)).toBeGreaterThan(Date.parse(selectedSegment.periodEnd));
    expect(result.excludedSegments).toHaveLength(0);
  });

  it('rejects a post-period governance date unless it matches the selected event', () => {
    const wrongEventText = q1Text.replace(
      `QAPI Meeting Date: ${E.meetingDate}`,
      'QAPI Meeting Date: 2026-04-16',
    );
    const result = segmentParsedSource({
      parsed: parseTxt(wrongEventText, 'QAPI-Q1-WRONG-GOVERNANCE-DATE.txt'),
      eventDateISO: E.meetingDate,
      targetAgency: E.agency,
      targetPeriod: E.quarter,
      sourceId: 'wrong-governance-date',
    });

    expect(result.status).toBe('failed-closed');
    expect(result.selectedSegment).toBeNull();
    expect(result.reason).toMatch(/Event-date hard stop/);
    expect(result.excludedSegments[0]?.reason).toBe(
      SOURCE_SEGMENT_EXCLUSION_REASONS.eventDateMismatch,
    );
  });

  it('selects Q1 from the contaminated file and excludes Q2 plus cross-agency bait with hard-stop reasons', () => {
    const result = segmentParsedSource({
      parsed: parseTxt(contaminatedText, 'QAPI-Q1Q2-CONTAMINATED.txt'),
      eventDateISO: E.meetingDate,
      targetAgency: E.agency,
      targetPeriod: E.quarter,
      sourceId: 'contaminated-fixture',
    });

    expect(result.status).toBe('selected');
    expect(result.validationStatus).toBe(SOURCE_VALIDATION_STATUS.validatedWithLimitation);
    expect(result.selectedSegment?.datasetId).toBe(E.datasetId);
    expect(result.selectedSegment?.text).not.toContain('Dataset ID: QAPI-Q2-DS-001');
    expect(result.selectedSegment?.text).not.toContain('Lakeside Contaminant');
    expect(result.parsed.records.map((record) => record.text ?? '').join('\n')).not.toContain(
      'Dataset ID: QAPI-Q2-DS-001',
    );

    const q2 = result.excludedSegments.find((segment) => segment.datasetId === 'QAPI-Q2-DS-001');
    const crossAgency = result.excludedSegments.find((segment) => segment.datasetId === 'QAPI-Q3-DS-099');

    expect(q2?.reason).toBe(SOURCE_SEGMENT_EXCLUSION_REASONS.periodMismatch);
    expect(q2?.detail).toMatch(/Period hard stop/);
    expect(crossAgency?.reason).toBe(SOURCE_SEGMENT_EXCLUSION_REASONS.agencyMismatch);
    expect(crossAgency?.detail).toMatch(/Agency hard stop/);
    expect(result.excludedSegments.map((segment) => segment.segmentId).sort()).toEqual([
      'QAPI-Q2-DS-001',
      'QAPI-Q3-DS-099',
    ]);
  });

  it('narrows the parsed model to the selected dataset when dataset id drives selection', () => {
    const result = segmentParsedSource({
      parsed: parseTxt(contaminatedText, 'QAPI-Q1Q2-CONTAMINATED.txt'),
      targetDatasetId: E.datasetId,
      targetAgency: E.agency,
      targetPeriod: E.quarter,
      sourceId: 'dataset-selected-contaminated-fixture',
    });
    const parsedText = result.parsed.records.map((record) => record.text ?? '').join('\n');

    expect(result.status).toBe('selected');
    expect(result.selectedSegment?.datasetId).toBe(E.datasetId);
    expect(parsedText).toContain(`Dataset ID: ${E.datasetId}`);
    expect(parsedText).not.toContain('Dataset ID: QAPI-Q2-DS-001');
    expect(parsedText).not.toContain('Lakeside Contaminant');
  });

  it('fails closed instead of silently choosing between duplicate matching segments', () => {
    const duplicateQ1Text = [
      [
        'Dataset ID: QAPI-Q1-DS-001',
        `Agency: ${E.agency}`,
        'Quarter: Q1 2026 (January 1 - March 31, 2026)',
        `QAPI Meeting Date: ${E.meetingDate}`,
        'Active at Mar 31 (Q1 close) 120 patients',
      ].join('\n'),
      [
        'Dataset ID: QAPI-Q1-DS-777',
        `Agency: ${E.agency}`,
        'Quarter: Q1 2026 (January 1 - March 31, 2026)',
        `QAPI Meeting Date: ${E.meetingDate}`,
        'Active at Mar 31 (Q1 close) 121 patients',
      ].join('\n'),
    ].join('\n\n');
    const result = segmentParsedSource({
      parsed: parseTxt(duplicateQ1Text, 'QAPI-Q1-DUPLICATE-MATCH.txt'),
      eventDateISO: E.meetingDate,
      targetAgency: E.agency,
      targetPeriod: E.quarter,
      sourceId: 'duplicate-q1',
    });

    expect(result.status).toBe('failed-closed');
    expect(result.selectedSegment).toBeNull();
    expect(result.reason).toMatch(/Ambiguous source — fail closed/);
    expect(result.reason).toContain('QAPI-Q1-DS-001');
    expect(result.reason).toContain('QAPI-Q1-DS-777');
  });

  it('rejects next-period operational records even when a source header claims Q1', () => {
    const nextPeriodOperationalText = [
      'Dataset ID: QAPI-Q1-DS-OP-001',
      `Agency: ${E.agency}`,
      'Quarter: Q1 2026 (January 1 - March 31, 2026)',
      'Visit Date: 2026-04-03',
      'Operational census reconciliation row for a Q2 visit.',
    ].join('\n');
    const result = segmentParsedSource({
      parsed: parseTxt(nextPeriodOperationalText, 'QAPI-Q1-NEXT-PERIOD-OPERATIONAL.txt'),
      eventDateISO: E.meetingDate,
      targetAgency: E.agency,
      targetPeriod: E.quarter,
      sourceId: 'next-period-operational',
    });

    expect(result.status).toBe('failed-closed');
    expect(result.allSegments[0]?.dateRole).toBe('operational');
    expect(result.allSegments[0]?.eventDate).toBe('2026-04-03');
    expect(result.excludedSegments[0]?.reason).toBe(
      SOURCE_SEGMENT_EXCLUSION_REASONS.nextPeriodOperationalRecord,
    );
  });

  it('fails closed when the requested quarter is absent', () => {
    const result = segmentParsedSource({
      parsed: parseTxt(contaminatedText, 'QAPI-Q1Q2-CONTAMINATED.txt'),
      eventDateISO: E.meetingDate,
      targetAgency: E.agency,
      targetPeriod: '2025-Q4',
      sourceId: 'missing-quarter-fixture',
    });

    expect(result.status).toBe('failed-closed');
    expect(result.selectedSegment).toBeNull();
    expect(result.validationStatus).toBe(SOURCE_VALIDATION_STATUS.unknownNotRecovered);
    expect(result.reason).toMatch(/requested quarter 2025-Q4 not present/i);
    expect(result.excludedSegments.length).toBeGreaterThan(0);
  });

  it('does not turn unrecovered source values or reviewed-record counts into zero', () => {
    const missingMetric: QapiDerivedMetric = {
      value: null,
      confidence: 'none',
      sourceQuotes: [],
      needsReview: true,
      note: 'No source evidence — verify manually.',
    };
    const report = createSourceFormUtilizationReport({
      sourcesAndFormsUsed: [{
        formId: 'QAPI-Part-I',
        formName: 'QAPI Part I',
        sourceId: E.datasetId,
        sourceName: 'Q1 fixture',
        purpose: 'Canonical Q1 source boundary validation',
        recordsReviewed: null,
        findings: [],
        validationStatus: validationStatusForQapiMetric(missingMetric),
        attachment: null,
      }],
      expectedButMissing: [{
        requirementId: 'missing-quarter-boundary',
        formId: 'QAPI-Part-I',
        sourceId: 'QAPI-2025-Q4-DS-001',
        purpose: 'Prior quarter boundary check',
        expectedAgency: E.agency,
        expectedPeriod: '2025-Q4',
        recordsExpected: null,
      }],
    });

    const bundle = deriveQapiBundle(parseTxt(q1Text, 'QAPI-Q1-DS-001.txt'), E.meetingDate);

    expect(bundle.censusPopulation.activeCensus.value).toBe(E.activePatientsAtPeriodEnd);
    expect(missingMetric.value).toBeNull();
    expect(missingMetric.value).not.toBe(0);
    expect(renderRecoveredSourceValue(missingMetric.value)).toBe(UNKNOWN_NOT_RECOVERED_TEXT);
    expect(report.sourcesAndFormsUsed[0].recordsReviewed).toBeNull();
    expect(report.expectedButMissing[0].recordsExpected).toBeNull();
    expect(countReviewedRecords(report)).toBeNull();
    expect(report.sourcesAndFormsUsed[0].validationStatus).toBe(
      SOURCE_VALIDATION_STATUS.unknownNotRecovered,
    );
    expect(report.sourcesAndFormsUsed[0].validationStatus).toBe('UNKNOWN — NOT RECOVERED');
  });
});
