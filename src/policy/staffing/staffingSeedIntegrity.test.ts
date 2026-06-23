/// <reference types="node" />
/**
 * Seed integrity — staffing (overview-roster foundation).
 *
 * Pure, read-only assertions over the clinician / patient / shift seeds so later
 * waves can wire the roster/calendar screens against data that is known-consistent:
 *   - deterministic, readable, unique IDs (clin-NNN / pat-NNN / shift-*)
 *   - ISO dates
 *   - cross-references resolve (patient.accmOwnerId, shift.patientId, shift.clinicianId)
 *
 * No screen/store wiring. Run via `npm run test:seed`.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MOCK_CLINICIANS } from '@/policy/staffing/data/mockClinicians';
import { MOCK_PATIENTS } from '@/policy/staffing/data/mockPatients';
import { mockShifts } from '@/policy/staffing/data/mockShifts';

const clinicianIds = new Set(MOCK_CLINICIANS.map((c) => c.id));
const patientIds = new Set(MOCK_PATIENTS.map((p) => p.id));

describe('staffing seed integrity', () => {
  it('seeds are non-empty', () => {
    assert.ok(MOCK_CLINICIANS.length > 0, 'clinicians');
    assert.ok(MOCK_PATIENTS.length > 0, 'patients');
    assert.ok(mockShifts.length > 0, 'shifts');
  });

  it('IDs are deterministic, readable, and unique', () => {
    assert.equal(clinicianIds.size, MOCK_CLINICIANS.length, 'clinician ids unique');
    assert.equal(patientIds.size, MOCK_PATIENTS.length, 'patient ids unique');
    const shiftIds = new Set(mockShifts.map((s) => s.id));
    assert.equal(shiftIds.size, mockShifts.length, 'shift ids unique');
    for (const c of MOCK_CLINICIANS) assert.match(c.id, /^clin-\d{3}$/, `clinician id ${c.id}`);
    for (const p of MOCK_PATIENTS) assert.match(p.id, /^pat-\d{3}$/, `patient id ${p.id}`);
    for (const s of mockShifts) assert.match(s.id, /^shift-[\w-]+$/, `shift id ${s.id}`);
  });

  it('person/shift cross-references resolve against existing seeds', () => {
    const unresolved: string[] = [];
    for (const p of MOCK_PATIENTS) {
      if (p.accmOwnerId && !clinicianIds.has(p.accmOwnerId)) {
        unresolved.push(`patient ${p.id}.accmOwnerId -> ${p.accmOwnerId}`);
      }
    }
    for (const s of mockShifts) {
      if (!patientIds.has(s.patientId)) unresolved.push(`shift ${s.id}.patientId -> ${s.patientId}`);
      if (s.clinicianId && !clinicianIds.has(s.clinicianId)) {
        unresolved.push(`shift ${s.id}.clinicianId -> ${s.clinicianId}`);
      }
    }
    assert.deepEqual(unresolved, [], `unresolved staffing references: ${unresolved.join('; ')}`);
  });

  it('shift dates are ISO calendar dates', () => {
    for (const s of mockShifts) assert.match(s.date, /^\d{4}-\d{2}-\d{2}$/, `shift ${s.id} date`);
  });
});
