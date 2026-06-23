import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  validateBoardLanes,
  validateEventLanes,
  validateTaskLanes,
  validateCalendarEvents,
  validateEvidenceRows,
  validateAuditRows,
  validateReportMetrics,
} from './cesValidators';
import {
  buildBoardLanes,
  buildEventLanes,
  buildTaskLanes,
  buildCalendarEvents,
  buildEvidenceRows,
  buildAuditRows,
  buildReportMetrics,
} from './cesViewProjections';

describe('CES validators — happy paths (validate real projection output)', () => {
  it('validateBoardLanes accepts buildBoardLanes()', () => {
    const r = validateBoardLanes(buildBoardLanes());
    assert.equal(r.ok, true, r.errors.join('; '));
  });
  it('validateEventLanes accepts buildEventLanes()', () => {
    const r = validateEventLanes(buildEventLanes());
    assert.equal(r.ok, true, r.errors.join('; '));
  });
  it('validateTaskLanes accepts buildTaskLanes()', () => {
    const r = validateTaskLanes(buildTaskLanes());
    assert.equal(r.ok, true, r.errors.join('; '));
  });
  it('validateCalendarEvents accepts buildCalendarEvents()', () => {
    const r = validateCalendarEvents(buildCalendarEvents());
    assert.equal(r.ok, true, r.errors.join('; '));
  });
  it('validateEvidenceRows accepts buildEvidenceRows()', () => {
    const r = validateEvidenceRows(buildEvidenceRows());
    assert.equal(r.ok, true, r.errors.join('; '));
  });
  it('validateAuditRows accepts buildAuditRows()', () => {
    const r = validateAuditRows(buildAuditRows());
    assert.equal(r.ok, true, r.errors.join('; '));
  });
  it('validateReportMetrics accepts buildReportMetrics()', () => {
    const r = validateReportMetrics(buildReportMetrics());
    assert.equal(r.ok, true, r.errors.join('; '));
  });
});

describe('CES validators — error paths', () => {
  it('rejects empty / non-array lane input (board/event/task)', () => {
    assert.equal(validateBoardLanes([]).ok, false);
    assert.equal(validateBoardLanes(null).ok, false);
    assert.equal(validateEventLanes(undefined).ok, false);
    assert.equal(validateTaskLanes('nope').ok, false);
  });
  it('reports lane + card invariant violations with messages', () => {
    const bad = [{ title: 'X', tone: 'teal', count: 1, cards: [{ id: '', title: '', progress: 250, tone: '' }] }];
    const r = validateBoardLanes(bad);
    assert.equal(r.ok, false);
    assert.ok(r.errors.length >= 3, `expected several errors, got ${r.errors.length}: ${r.errors.join('; ')}`);
  });
  it('rejects a lane missing its title/tone', () => {
    const r = validateTaskLanes([{ count: 2, cards: [] }]);
    assert.equal(r.ok, false);
  });
  it('rejects malformed calendar events', () => {
    assert.equal(validateCalendarEvents([]).ok, false);
    const r = validateCalendarEvents([{ day: 99, label: '', owner: '', progress: -5, tone: '' }]);
    assert.equal(r.ok, false);
    assert.ok(r.errors.length >= 4, r.errors.join('; '));
  });
  it('rejects rows that are not well-formed 4-tuples', () => {
    assert.equal(validateEvidenceRows([]).ok, false);
    assert.equal(validateEvidenceRows([['only', 'three', 'cols']]).ok, false);
    assert.equal(validateAuditRows([['name', '', 'status', 'teal']]).ok, false); // empty ref
  });
  it('rejects malformed report metrics', () => {
    assert.equal(validateReportMetrics([]).ok, false);
    assert.equal(validateReportMetrics([{ label: '', value: '', tone: '' }]).ok, false);
  });
});
