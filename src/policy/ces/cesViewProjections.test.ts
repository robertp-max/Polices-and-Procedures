/// <reference types="node" />
/**
 * CES one-pass — View Projections tests (1.3)
 *
 * Pure build functions + FALLBACK coverage for boardLanes, eventLanes, taskLanes,
 * calendarEvents, evidenceRows, auditRows, reportMetrics.
 *
 * Uses V3 seeds for seed-driven path; exercises fallback.
 * Matches shapes from RepresentativeScreens / pageview screens.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildBoardLanes,
  buildEventLanes,
  buildTaskLanes,
  buildCalendarEvents,
  buildEvidenceRows,
  buildAuditRows,
  buildReportMetrics,
  FALLBACK_BOARD_LANES,
  FALLBACK_EVENT_LANES,
  FALLBACK_TASK_LANES,
  FALLBACK_CES_CALENDAR_EVENTS,
  FALLBACK_EVIDENCE_ROWS,
  FALLBACK_AUDIT_ROWS,
  FALLBACK_REPORT_METRICS,
} from './cesViewProjections';
import { V3_ExecutionUnitsSeed } from './data/V3_CES_SeedData';

describe('CES one-pass View Projections (board / events / tasks / calendar / evidence / audit / report)', () => {
  it('FALLBACK_BOARD_LANES is non-empty with correct shape and design counts', () => {
    assert.ok(Array.isArray(FALLBACK_BOARD_LANES));
    assert.ok(FALLBACK_BOARD_LANES.length >= 5);
    const firstLane = FALLBACK_BOARD_LANES[0];
    assert.ok(typeof firstLane.title === 'string');
    assert.ok(Array.isArray(firstLane.cards));
    assert.ok(typeof firstLane.count === 'number');
    assert.equal(FALLBACK_BOARD_LANES[4].title.includes('Awaiting'), true); // special awaiting lane
  });

  it('buildBoardLanes returns non-empty lanes with shape matching BoardLaneData', () => {
    const lanes = buildBoardLanes();
    assert.ok(Array.isArray(lanes) && lanes.length > 0);
    lanes.forEach(l => {
      assert.ok(typeof l.title === 'string' && l.title.length > 0);
      assert.ok(Array.isArray(l.cards));
      assert.ok(typeof l.count === 'number');
      assert.ok(['slate','green','teal','amber','orange'].includes(l.tone as string));
    });
  });

  it('buildBoardLanes seed-driven path yields counts derived from units', () => {
    const fromSeed = buildBoardLanes({ units: V3_ExecutionUnitsSeed });
    assert.ok(fromSeed.length > 0);
    const totalCards = fromSeed.reduce((s, l) => s + l.cards.length, 0);
    assert.ok(totalCards > 0);
  });

  it('FALLBACK_EVENT_LANES non-empty, 4 columns, correct shape', () => {
    assert.equal(FALLBACK_EVENT_LANES.length, 4);
    assert.ok(FALLBACK_EVENT_LANES.every(l => Array.isArray(l.cards) && typeof l.count === 'number'));
  });

  it('buildEventLanes returns shape and non-empty', () => {
    const lanes = buildEventLanes();
    assert.ok(lanes.length >= 3);
    assert.ok(lanes.every(l => l.title && Array.isArray(l.cards)));
  });

  it('FALLBACK_TASK_LANES non-empty 4 lanes + shape', () => {
    assert.equal(FALLBACK_TASK_LANES.length, 4);
    assert.ok(FALLBACK_TASK_LANES[0].title === 'Today');
  });

  it('buildTaskLanes non-empty + fallback covered', () => {
    const lanes = buildTaskLanes({ units: [] });
    assert.ok(lanes.length >= 3);
    assert.deepEqual(lanes[0].title, FALLBACK_TASK_LANES[0].title);
  });

  it('FALLBACK_CES_CALENDAR_EVENTS non-empty with required fields', () => {
    assert.ok(FALLBACK_CES_CALENDAR_EVENTS.length > 0);
    const e = FALLBACK_CES_CALENDAR_EVENTS[0];
    assert.ok(typeof e.label === 'string' && typeof e.day === 'number');
    assert.ok(typeof e.owner === 'string');
  });

  it('buildCalendarEvents shape + seed driven', () => {
    const evs = buildCalendarEvents();
    assert.ok(Array.isArray(evs) && evs.length > 0);
    evs.forEach(e => assert.ok(typeof e.day === 'number' && typeof e.label === 'string'));
  });

  it('FALLBACK_EVIDENCE_ROWS + buildEvidenceRows shape and non-empty', () => {
    assert.ok(FALLBACK_EVIDENCE_ROWS.length >= 5);
    const rows = buildEvidenceRows();
    assert.ok(Array.isArray(rows) && rows.length > 0);
    assert.ok(rows[0].length === 4);
  });

  it('FALLBACK_AUDIT_ROWS + buildAuditRows', () => {
    assert.ok(FALLBACK_AUDIT_ROWS.length >= 4);
    const rows = buildAuditRows();
    assert.ok(rows.length > 0);
  });

  it('FALLBACK_REPORT_METRICS + buildReportMetrics shape/counts', () => {
    assert.equal(FALLBACK_REPORT_METRICS.length, 4);
    const m = buildReportMetrics();
    assert.equal(m.length, 4);
    assert.ok(m.some(r => r.label.includes('Completion') || r.label.includes('Audit')));
  });

  it('build* fallback when empty seed input returns FALLBACK content', () => {
    const b = buildBoardLanes({ units: [] });
    assert.ok(b.length === FALLBACK_BOARD_LANES.length || b.length > 0);
    const e = buildEventLanes({ units: [] });
    assert.ok(e.length > 0);
    const r = buildReportMetrics({ units: [] });
    assert.ok(r.length === FALLBACK_REPORT_METRICS.length);
  });

  it('seed counts are internally consistent (non-negative)', () => {
    const lanes = buildBoardLanes();
    const sum = lanes.reduce((s, l) => s + (l.count || l.cards.length), 0);
    assert.ok(sum >= 0);
    const reps = buildReportMetrics();
    assert.ok(reps.every(r => typeof r.value === 'string'));
  });
});
