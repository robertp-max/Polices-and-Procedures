import { describe, it, expect } from 'vitest';
import { resolveSignerName, SIGNERS } from './signerDirectory';

describe('signer directory', () => {
  it('maps the compliance cluster to Dee Bustos', () => {
    for (const role of [
      'Compliance Officer', 'HIPAA Officer', 'Privacy Officer', 'Security Officer',
      'Infection Control Officer', 'Quality / QAPI Lead', 'Risk Manager',
      'Compliance / HIPAA / Security / Infection Control Officer',
    ]) {
      expect(resolveSignerName(role)).toBe('Dee Bustos');
    }
    expect(SIGNERS.compliance).toBe('Dee Bustos');
  });

  it('maps the finance cluster to Adrian Lindain', () => {
    for (const role of ['Billing', 'Accounting', 'Billing / Accounting', 'Finance', 'Payroll']) {
      expect(resolveSignerName(role)).toBe('Adrian Lindain');
    }
    expect(SIGNERS.billing).toBe('Adrian Lindain');
  });

  it('returns the fallback for unrelated roles', () => {
    expect(resolveSignerName('DON / Chair', 'Dakota Director')).toBe('Dakota Director');
    expect(resolveSignerName('Medical Director', 'Morgan MD')).toBe('Morgan MD');
    expect(resolveSignerName('Social Worker')).toBe('');
  });
});
