/**
 * Pure QAPI fixture loader + §24 Q1 2026 numeric expectations.
 * Used by packet-platform acceptance tests (WP-1.5 and later).
 */
import { readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

/** Read a fixture file path (absolute or cwd-relative) and return raw text. */
export function loadQapiFixture(fixturePath: string): string {
  const abs = isAbsolute(fixturePath) ? fixturePath : resolve(process.cwd(), fixturePath);
  return readFileSync(abs, 'utf8');
}

/**
 * Canonical §24 Q1 2026 acceptance numbers and identity.
 * Independent QA hand-verifies every value against PRD §24.
 */
export const Q1_FIXTURE_EXPECTATIONS = {
  datasetId: 'QAPI-Q1-DS-001',
  workflowId: 'QA-WF-03',
  meetingDate: '2026-04-09',
  quarter: '2026-Q1',
  quarterLabel: 'Q1 2026',
  periodStart: '2026-01-01',
  periodEnd: '2026-03-31',
  agency: 'Northwind Synthetic Home Health Agency (NSHHA)',
  activePatientsAtPeriodEnd: 120,
  episodesTotal: 127,
  hospitalizations: 5,
  edVisitsWithoutHospitalization: 3,
  committeeAttendancePresent: 9,
  committeeAttendanceTotal: 9,
  governingBodyEscalationItems: 4,
  pipTriggerScenarios: 8,
  personnelReviewTriggers: 5,
  syntheticBanner: 'SYNTHETIC UAT DATA — NO REAL PHI — NOT FOR PRODUCTION',
} as const;

/** Canonical paths relative to repo root. */
export const QAPI_FIXTURE_PATHS = {
  q1: 'fixtures/packets/qapi/QAPI-Q1-DS-001.txt',
  contaminated: 'fixtures/packets/qapi/QAPI-Q1Q2-CONTAMINATED.txt',
} as const;
