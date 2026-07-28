// Review blockers 1 + 2 — regression proofs.
//
// Blocker 1 (scoring-scale defect): the catalog previously assigned a 95-POINT
// (percent) pass standard while the 2026 tabletop engine scores out of 1000,
// so a FAILED 900/1000 quarterly attempt satisfied `900 >= 95`. The standards
// now live in the SAME unit as the engine (950 quarterly / 970 annual), the
// evidence contract carries an explicit engine-decided `outcome`, and
// completion requires `outcome === 'passed'`.
//
// Blocker 2 (identity binding): official completion must match BOTH the
// assignment id AND the assignment's learnerId, and the local-demo identity
// (`gb-chair-local`) can never mint an official record.

import { beforeEach, describe, expect, it } from 'vitest';
import {
  deriveGbCatalog,
  DEFAULT_LEARNER_ID,
  TABLETOP_ANNUAL_PASS_STANDARD,
  TABLETOP_QUARTERLY_PASS_STANDARD,
  TABLETOP_ASSIGNMENT_IDS,
} from './complianceCatalog';
import {
  setComplianceEvidenceService,
  type ComplianceEvidenceService,
} from './complianceEvidenceAdapter';
import { commitEvidence, refreshOfficialEvidence } from './complianceStore';
import { isOfficiallyComplete } from './complianceSelectors';
import { LOCAL_DEMO_LEARNER_ID, isLocalDemoLearnerId, resolveLearnerId } from './complianceIdentity';
import type { ComplianceEvidenceRecord } from './complianceTypes';
import { ANNUAL_PASS_SCORE, QUARTERLY_PASS_SCORE } from '../tabletop2026/engine/caseTypes';

const AUTH_LEARNER = 'user-auth-1234';

function tabletopRecord(
  partial: Partial<ComplianceEvidenceRecord> & { assignmentId: string; score: number },
): ComplianceEvidenceRecord {
  const passStandard = partial.assignmentId === TABLETOP_ASSIGNMENT_IDS[4]
    ? TABLETOP_ANNUAL_PASS_STANDARD
    : TABLETOP_QUARTERLY_PASS_STANDARD;
  const engineOutcome =
    (partial.criticalErrors ?? []).length === 0 && partial.score >= passStandard ? 'passed' : 'failed';
  return {
    evidenceId: `ev-${partial.assignmentId}-${partial.score}`,
    learnerId: AUTH_LEARNER,
    role: 'GB',
    sourceId: 'tabletop2026-q1',
    sourceType: 'tabletop',
    sourceVersion: '2026-03-31',
    effectiveDate: '2026-03-31',
    readCompletedAt: null,
    attestedAt: '2026-01-01T00:00:00.000Z',
    answersSnapshot: {},
    outcome: engineOutcome,
    criticalErrors: [],
    attemptNumber: 1,
    remediationPath: 'none',
    activeTimeSeconds: 3600,
    completedAt: '2026-01-01T00:00:00.000Z', // evidence is committed pass OR fail
    integrityHash: 'hash',
    ...partial,
  } as ComplianceEvidenceRecord;
}

function service(records: ComplianceEvidenceRecord[]): ComplianceEvidenceService {
  return {
    connected: true,
    disconnectedNotice: '',
    async save(input) {
      const rec = { ...input, evidenceId: 'ev-new', integrityHash: 'h' } as ComplianceEvidenceRecord;
      records.push(rec);
      return { ok: true, record: rec };
    },
    async list() {
      return records;
    },
  };
}

const catalog = deriveGbCatalog({ learnerId: AUTH_LEARNER, now: '2026-01-01T00:00:00.000Z' });
const quarterly = catalog.assignments.find((a) => a.assignmentId === TABLETOP_ASSIGNMENT_IDS[0])!;
const annual = catalog.assignments.find((a) => a.assignmentId === TABLETOP_ASSIGNMENT_IDS[4])!;

async function withRecords(records: ComplianceEvidenceRecord[]): Promise<void> {
  setComplianceEvidenceService(service(records));
  await refreshOfficialEvidence(AUTH_LEARNER);
}

beforeEach(async () => {
  await withRecords([]);
});

describe('blocker 1 — one scoring unit: catalog standards equal the engine standards', () => {
  it('quarterly standard is the engine QUARTERLY_PASS_SCORE (950/1000)', () => {
    expect(quarterly.passStandard).toBe(QUARTERLY_PASS_SCORE);
    expect(quarterly.passStandard).toBe(950);
  });
  it('annual standard is the engine ANNUAL_PASS_SCORE (970/1000)', () => {
    expect(annual.passStandard).toBe(ANNUAL_PASS_SCORE);
    expect(annual.passStandard).toBe(970);
  });
  it('every registered tabletop pack uses the 1000-point unit, never percent', () => {
    for (const id of TABLETOP_ASSIGNMENT_IDS) {
      const a = catalog.assignments.find((x) => x.assignmentId === id)!;
      expect(a.passStandard).toBeGreaterThanOrEqual(950); // impossible in percent
    }
  });
});

describe('blocker 1 — the 949/950 and 969/970 boundaries', () => {
  it('quarterly 949 fails', async () => {
    await withRecords([tabletopRecord({ assignmentId: quarterly.assignmentId, score: 949 })]);
    expect(isOfficiallyComplete(quarterly)).toBe(false);
  });
  it('quarterly 950 passes', async () => {
    await withRecords([tabletopRecord({ assignmentId: quarterly.assignmentId, score: 950 })]);
    expect(isOfficiallyComplete(quarterly)).toBe(true);
  });
  it('annual 969 fails', async () => {
    await withRecords([tabletopRecord({ assignmentId: annual.assignmentId, score: 969 })]);
    expect(isOfficiallyComplete(annual)).toBe(false);
  });
  it('annual 970 passes', async () => {
    await withRecords([tabletopRecord({ assignmentId: annual.assignmentId, score: 970 })]);
    expect(isOfficiallyComplete(annual)).toBe(true);
  });
  it('the original defect is closed: a failed 900/1000 quarterly attempt does NOT complete', async () => {
    await withRecords([tabletopRecord({ assignmentId: quarterly.assignmentId, score: 900 })]);
    expect(isOfficiallyComplete(quarterly)).toBe(false); // was true under `900 >= 95`
  });
});

describe('blocker 1 — a failed outcome never completes, regardless of numeric value', () => {
  it('outcome "failed" blocks completion even with a perfect 1000 score', async () => {
    await withRecords([
      tabletopRecord({ assignmentId: quarterly.assignmentId, score: 1000, outcome: 'failed' }),
    ]);
    expect(isOfficiallyComplete(quarterly)).toBe(false);
  });
  it('a record missing a passed outcome fails closed', async () => {
    const rec = tabletopRecord({ assignmentId: quarterly.assignmentId, score: 1000 });
    // Simulate a legacy/foreign record that lacks the outcome field entirely.
    delete (rec as Partial<ComplianceEvidenceRecord>).outcome;
    await withRecords([rec]);
    expect(isOfficiallyComplete(quarterly)).toBe(false);
  });
  it('a critical error overrides any passing score', async () => {
    await withRecords([
      tabletopRecord({
        assignmentId: quarterly.assignmentId,
        score: 1000,
        criticalErrors: ['approved packet on assumed-resolved CAP'],
        outcome: 'failed', // engine marks critical attempts failed…
      }),
    ]);
    expect(isOfficiallyComplete(quarterly)).toBe(false);
  });
  it('…and even a mislabeled passed outcome with critical errors is rejected (defense in depth)', async () => {
    await withRecords([
      tabletopRecord({
        assignmentId: quarterly.assignmentId,
        score: 1000,
        criticalErrors: ['critical'],
        outcome: 'passed',
      }),
    ]);
    expect(isOfficiallyComplete(quarterly)).toBe(false);
  });
});

describe('blocker 2 — evidence is identity-bound', () => {
  it("another learner's passing record never completes this learner's assignment", async () => {
    await withRecords([
      tabletopRecord({ assignmentId: quarterly.assignmentId, score: 1000, learnerId: 'someone-else' }),
    ]);
    expect(isOfficiallyComplete(quarterly)).toBe(false);
  });
  it('the same record under the correct learner id completes', async () => {
    await withRecords([
      tabletopRecord({ assignmentId: quarterly.assignmentId, score: 1000, learnerId: AUTH_LEARNER }),
    ]);
    expect(isOfficiallyComplete(quarterly)).toBe(true);
  });
  it('the local-demo identity can never mint an official record, even on a connected service', async () => {
    await withRecords([]);
    const result = await commitEvidence(quarterly.assignmentId, {
      assignmentId: quarterly.assignmentId,
      learnerId: LOCAL_DEMO_LEARNER_ID,
      role: 'GB',
      sourceId: 'tabletop2026-q1',
      sourceType: 'tabletop',
      sourceVersion: null,
      effectiveDate: null,
      readCompletedAt: null,
      attestedAt: '2026-01-01T00:00:00.000Z',
      answersSnapshot: {},
      score: 1000,
      outcome: 'passed',
      criticalErrors: [],
      attemptNumber: 1,
      remediationPath: 'none',
      activeTimeSeconds: 3600,
      completedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('rejected');
  });
  it('an authenticated identity CAN save on a connected service', async () => {
    await withRecords([]);
    const result = await commitEvidence(quarterly.assignmentId, {
      assignmentId: quarterly.assignmentId,
      learnerId: AUTH_LEARNER,
      role: 'GB',
      sourceId: 'tabletop2026-q1',
      sourceType: 'tabletop',
      sourceVersion: null,
      effectiveDate: null,
      readCompletedAt: null,
      attestedAt: '2026-01-01T00:00:00.000Z',
      answersSnapshot: {},
      score: 960,
      outcome: 'passed',
      criticalErrors: [],
      attemptNumber: 1,
      remediationPath: 'none',
      activeTimeSeconds: 3600,
      completedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(result.ok).toBe(true);
  });
  it('resolveLearnerId prefers the authenticated id and flags the demo id', () => {
    expect(resolveLearnerId('user-9')).toBe('user-9');
    expect(resolveLearnerId(undefined)).toBe(LOCAL_DEMO_LEARNER_ID);
    expect(isLocalDemoLearnerId(LOCAL_DEMO_LEARNER_ID)).toBe(true);
    expect(isLocalDemoLearnerId(AUTH_LEARNER)).toBe(false);
    expect(DEFAULT_LEARNER_ID).toBe(LOCAL_DEMO_LEARNER_ID);
  });
});
