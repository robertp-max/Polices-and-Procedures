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
  SOURCE_VALIDATION_STATUS,
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
    expect(report.sourcesAndFormsUsed[0].recordsReviewed).toBeNull();
    expect(report.expectedButMissing[0].recordsExpected).toBeNull();
    expect(countReviewedRecords(report)).toBeNull();
    expect(report.sourcesAndFormsUsed[0].validationStatus).toBe(
      SOURCE_VALIDATION_STATUS.unknownNotRecovered,
    );
  });
});
