/// <reference types="node" />
/**
 * Seed integrity — journey / onboarding (onboarding-journey foundation).
 *
 * Pure, read-only assertions over the seed employee directory so later waves can wire
 * the journey/supervisor screens against consistent data:
 *   - deterministic, unique EMP-NNNN ids
 *   - supervisorId references a real employee
 *   - ISO dates with hireDate <= startDate
 *
 * (ACHC training calculations already have dedicated coverage in
 * journey/utils/achcTrainingCalculations.test.ts.)
 *
 * No screen wiring. Run via `npm run test:seed`.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SEED_EMPLOYEES } from '@/policy/journey/data/employees';

const employeeIds = new Set(SEED_EMPLOYEES.map((e) => e.id));
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

describe('journey employee seed integrity', () => {
  it('is non-empty with unique, readable EMP ids', () => {
    assert.ok(SEED_EMPLOYEES.length > 0);
    assert.equal(employeeIds.size, SEED_EMPLOYEES.length, 'employee ids unique');
    for (const e of SEED_EMPLOYEES) assert.match(e.id, /^EMP-\d{4}$/, `employee id ${e.id}`);
  });

  it('supervisor references resolve to existing employees', () => {
    const unresolved: string[] = [];
    for (const e of SEED_EMPLOYEES) {
      if (e.supervisorId && !employeeIds.has(e.supervisorId)) {
        unresolved.push(`${e.id}.supervisorId -> ${e.supervisorId}`);
      }
    }
    assert.deepEqual(unresolved, [], `unresolved supervisor references: ${unresolved.join('; ')}`);
  });

  it('dates are ISO and hireDate is on/before startDate', () => {
    const badOrder: string[] = [];
    for (const e of SEED_EMPLOYEES) {
      if (e.hireDate) assert.match(e.hireDate, ISO_DATE_RE, `${e.id} hireDate`);
      if (e.startDate) assert.match(e.startDate, ISO_DATE_RE, `${e.id} startDate`);
      if (e.hireDate && e.startDate && e.hireDate > e.startDate) {
        badOrder.push(`${e.id} hire ${e.hireDate} > start ${e.startDate}`);
      }
    }
    assert.deepEqual(badOrder, [], `hireDate after startDate: ${badOrder.join('; ')}`);
  });
});
