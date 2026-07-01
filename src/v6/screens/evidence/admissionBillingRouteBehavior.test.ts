import { describe, expect, it } from 'vitest';
import {
  getAdmissionBillingRouteBehavior,
  getAdvanceDirectiveSummary,
  mapAdmissionOrderedServices,
} from '../../../../server/admissionBillingRouteBehavior';

const ESPIE_FIELDS = {
  payer: 'Medi-Cal Managed Care (Health Plan of San Mateo - CCS transition)',
  payer_id: 'HPSM-90518833E',
  services_ordered:
    'Skilled Nursing RN daily x 4 weeks, then 5x/week ongoing; Physical Therapy 3x/week; Occupational Therapy 3x/week; Speech-Language Pathology 2x/week; Medical Social Work 1x/week; Home Health Aide BID; Respiratory Therapy 2x/week; Registered Dietitian biweekly',
  representative_name: 'Maria Santos Reyes',
  legal_authority:
    'Limited conservatorship granted 09/2021 by San Mateo County Superior Court; covers medical, financial, residence, and education decisions.',
  advance_directive_status:
    'AHCD executed by conservator Maria Santos Reyes in 06/2025. POLST present: Full Treatment, all sections.',
};

describe('getAdmissionBillingRouteBehavior', () => {
  it('maps Espie Medi-Cal managed care as primary with Section 8 not applicable', () => {
    const behavior = getAdmissionBillingRouteBehavior('MEDI_CAL_OR_MEDICAID', ESPIE_FIELDS.payer, ESPIE_FIELDS);

    expect(behavior.section7.checkedPayers).toEqual(['mediCalManagedCare']);
    expect(behavior.section7.payerPriority).toBe('Primary');
    expect(behavior.section7.payerName).toContain('Health Plan of San Mateo');
    expect(behavior.section7.payerId).toBe('HPSM-90518833E');
    expect(behavior.section7.checkedPayers).not.toContain('privatePay');
    expect(behavior.section8.active).toBe(false);
    expect(behavior.section8.checklistStatus).toBe('not_applicable');
    expect(behavior.section8.renderMode).toBe('na');
  });

  it.each([
    ['PRIVATE_PAY', true],
    ['LONG_TERM_CARE_INSURANCE', false],
    ['MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE', false],
    ['ORIGINAL_MEDICARE_FFS', false],
    ['MEDI_CAL_OR_MEDICAID', false],
    ['VA_WORKERS_COMP_OR_OTHER_CONTRACT', false],
    ['PENDING_VERIFICATION', false],
    ['NOT_APPLICABLE_NO_BILLABLE_SERVICES', false],
  ])('%s controls Section 8 active state', (route, section8Active) => {
    const behavior = getAdmissionBillingRouteBehavior(route, 'Example payer', {});
    expect(behavior.section8.active).toBe(section8Active);
    expect(behavior.section8.checklistStatus).toBe(section8Active ? 'required' : 'not_applicable');
  });

  it('activates Section 8 for an explicit private-pay addendum without replacing the main payer route', () => {
    const behavior = getAdmissionBillingRouteBehavior('MEDI_CAL_OR_MEDICAID', ESPIE_FIELDS.payer, ESPIE_FIELDS, true);

    expect(behavior.section7.checkedPayers).toEqual(['mediCalManagedCare']);
    expect(behavior.section8.active).toBe(true);
    expect(behavior.section8.reason).toMatch(/addendum/i);
  });

  it('distinguishes Medicare Advantage from private insurance on the same route', () => {
    expect(
      getAdmissionBillingRouteBehavior('MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE', 'Aetna Medicare Advantage', {}).section7.checkedPayers,
    ).toEqual(['medicareAdvantage']);
    expect(
      getAdmissionBillingRouteBehavior('MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE', 'Blue Shield PPO commercial', {}).section7.checkedPayers,
    ).toEqual(['privateInsurance']);
  });
});

describe('admission packet transfer helpers', () => {
  it('maps ordered services and frequencies into packet-supported disciplines', () => {
    const services = mapAdmissionOrderedServices(ESPIE_FIELDS.services_ordered);
    const byKey = Object.fromEntries(services.map((service) => [service.key, service]));

    expect(byKey.sn_rn.frequency).toBe('daily x 4 weeks, then 5x/week ongoing');
    expect(byKey.pt.frequency).toBe('3x/week');
    expect(byKey.ot.frequency).toBe('3x/week');
    expect(byKey.slp.frequency).toBe('2x/week');
    expect(byKey.msw.frequency).toBe('1x/week');
    expect(byKey.hha.frequency).toBe('BID');
    expect(byKey.other.label).toBe('Respiratory Therapy');
    expect(byKey.other.frequency).toBe('2x/week');
    expect(byKey.dietitian.frequency).toBe('biweekly');
  });

  it('preserves AHCD, POLST full treatment, conservator authority, and does not infer DNR', () => {
    const summary = getAdvanceDirectiveSummary(
      ESPIE_FIELDS.advance_directive_status,
      ESPIE_FIELDS.legal_authority,
      ESPIE_FIELDS.representative_name,
    );

    expect(summary.ahcdPresent).toBe(true);
    expect(summary.polstPresent).toBe(true);
    expect(summary.fullTreatment).toBe(true);
    expect(summary.decisionMaker).toBe('Maria Santos Reyes');
    expect(summary.dnrPresent).toBe(false);
  });
});
