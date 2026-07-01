import { describe, it, expect } from 'vitest';
import { payerToRoute, buildBillingRouteConfirmation, type BradRouteSuggestion } from './Defensible2StudioLanding';

/**
 * Regression tests for the Patient Admission billing-route handoff.
 * The bug: Brad extracted the payer correctly, but the route suggestion /
 * confirmation defaulted to "Pending Verification". These lock the deterministic
 * mapping and the Step-2 confirm/override audit behavior.
 */
describe('payerToRoute — deterministic payer → billing route mapping', () => {
  it('maps the exact Espie payer text to Medi-Cal / Medicaid (not Pending Verification)', () => {
    const payer = 'Medi-Cal Managed Care (Health Plan of San Mateo — CCS transition)';
    expect(payerToRoute(payer)).toBe('MEDI_CAL_OR_MEDICAID');
    expect(payerToRoute(payer)).not.toBe('PENDING_VERIFICATION');
  });

  it('maps Medi-Cal / Medicaid / HPSM / Health Plan of San Mateo / CCS variants', () => {
    for (const p of [
      'Medi-Cal',
      'Medicaid',
      'HPSM-90518833E Medi-Cal',
      'Health Plan of San Mateo',
      'Medi-Cal Managed Care — CCS transition',
    ]) {
      expect(payerToRoute(p)).toBe('MEDI_CAL_OR_MEDICAID');
    }
  });

  it('maps Medicare families', () => {
    expect(payerToRoute('Original Medicare')).toBe('ORIGINAL_MEDICARE_FFS');
    expect(payerToRoute('Medicare Part A')).toBe('ORIGINAL_MEDICARE_FFS');
    expect(payerToRoute('Medicare FFS')).toBe('ORIGINAL_MEDICARE_FFS');
    expect(payerToRoute('Medicare Advantage')).toBe('MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE');
    expect(payerToRoute('Aetna PPO private insurance')).toBe('MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE');
  });

  it('maps LTC, VA/Workers-Comp, and private pay', () => {
    expect(payerToRoute('Long-Term Care insurance')).toBe('LONG_TERM_CARE_INSURANCE');
    expect(payerToRoute('VA / veterans')).toBe('VA_WORKERS_COMP_OR_OTHER_CONTRACT');
    expect(payerToRoute("Workers' Comp")).toBe('VA_WORKERS_COMP_OR_OTHER_CONTRACT');
    expect(payerToRoute('Private pay — family pays directly')).toBe('PRIVATE_PAY');
  });

  it('returns empty for truly unclear payer (Step 2 then requires a manual pick)', () => {
    expect(payerToRoute('')).toBe('');
    expect(payerToRoute('   ')).toBe('');
    expect(payerToRoute('Some Unknown Carrier XYZ')).toBe('');
  });
});

describe('buildBillingRouteConfirmation — Step-2 confirm/override audit', () => {
  const suggestion: BradRouteSuggestion = {
    routeId: 'MEDI_CAL_OR_MEDICAID',
    routeLabel: 'Medi-Cal / Medicaid',
    payerText: 'Medi-Cal Managed Care (Health Plan of San Mateo — CCS transition)',
    confidence: 1,
    sourceEvidence: 'Primary Medi-Cal Managed Care ... HPSM-90518833E',
  };
  const AT = '2026-06-30T21:15:00.000Z';

  it('confirming Brad’s route → overridden: false, preserves original suggestion', () => {
    const c = buildBillingRouteConfirmation(suggestion, 'MEDI_CAL_OR_MEDICAID', AT);
    expect(c.confirmedRouteId).toBe('MEDI_CAL_OR_MEDICAID');
    expect(c.confirmedRouteLabel).toBe('Medi-Cal / Medicaid');
    expect(c.overridden).toBe(false);
    expect(c.originalSuggestedRouteId).toBe('MEDI_CAL_OR_MEDICAID');
    expect(c.originalSuggestedRouteLabel).toBe('Medi-Cal / Medicaid');
    expect(c.confirmedAt).toBe(AT);
  });

  it('overriding to a different route → overridden: true, preserves Brad’s original', () => {
    const c = buildBillingRouteConfirmation(suggestion, 'PENDING_VERIFICATION', AT, 'robertp@careindeed.com');
    expect(c.confirmedRouteId).toBe('PENDING_VERIFICATION');
    expect(c.confirmedRouteLabel).toBe('Pending Verification');
    expect(c.overridden).toBe(true);
    expect(c.originalSuggestedRouteId).toBe('MEDI_CAL_OR_MEDICAID');
    expect(c.originalSuggestedRouteLabel).toBe('Medi-Cal / Medicaid');
    expect(c.confirmedBy).toBe('robertp@careindeed.com');
  });

  it('no Brad suggestion (manual pick) → overridden: false, no original preserved', () => {
    const c = buildBillingRouteConfirmation(null, 'ORIGINAL_MEDICARE_FFS', AT);
    expect(c.confirmedRouteId).toBe('ORIGINAL_MEDICARE_FFS');
    expect(c.overridden).toBe(false);
    expect(c.originalSuggestedRouteId).toBeUndefined();
    expect(c.originalSuggestedRouteLabel).toBeUndefined();
  });
});
