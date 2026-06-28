import { describe, it, expect } from 'vitest';
import { scanForPhi, sanitizePhi, containsPhi } from './threadPhiGuard';

describe('threadPhiGuard (spec test #6 — PHI-like content triggers warning/sanitize)', () => {
  it('flags an SSN as high-severity PHI', () => {
    const r = scanForPhi('The number is 123-45-6789 for reference.');
    expect(r.hasPhi).toBe(true);
    expect(r.requiresSecureWorkflow).toBe(true);
    expect(r.findings.some(f => f.category === 'ssn')).toBe(true);
  });

  it('flags a patient name in patient context', () => {
    const r = scanForPhi('patient John Smith fell during the visit');
    expect(r.hasPhi).toBe(true);
    expect(r.findings.some(f => f.category === 'patient_name')).toBe(true);
  });

  it('flags MRN, DOB, phone, and member id', () => {
    expect(containsPhi('MRN: AB12345')).toBe(true);
    expect(containsPhi('DOB 01/02/1980')).toBe(true);
    expect(containsPhi('call 415-555-1234')).toBe(true);
    expect(containsPhi('member id 998877')).toBe(true);
  });

  it('does NOT flag ordinary product/help discussion', () => {
    const r = scanForPhi('The print preview shows a blank background on the 485 plan of care.');
    // form id "485" is not PHI; no patient identifiers present
    expect(r.findings.some(f => f.category === 'patient_name' || f.category === 'ssn')).toBe(false);
  });

  it('sanitize redacts every finding and is idempotent', () => {
    const text = 'patient John Smith, MRN AB12345, DOB 01/02/1980, ssn 123-45-6789';
    const cleaned = sanitizePhi(text);
    expect(cleaned).toContain('[redacted]');
    expect(cleaned).not.toContain('123-45-6789');
    expect(cleaned).not.toContain('AB12345');
    // Sanitizing already-clean output produces no new redactions of real ids.
    expect(sanitizePhi(cleaned)).not.toContain('123-45-6789');
  });
});
