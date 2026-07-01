export type AdmissionBillingRouteId =
  | 'PRIVATE_PAY'
  | 'LONG_TERM_CARE_INSURANCE'
  | 'MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE'
  | 'ORIGINAL_MEDICARE_FFS'
  | 'MEDI_CAL_OR_MEDICAID'
  | 'VA_WORKERS_COMP_OR_OTHER_CONTRACT'
  | 'PENDING_VERIFICATION'
  | 'NOT_APPLICABLE_NO_BILLABLE_SERVICES'
  | 'NO_BILLABLE_SERVICES';

export type AdmissionPayerKey =
  | 'privatePay'
  | 'longTermCareInsurance'
  | 'medicareAdvantage'
  | 'privateInsurance'
  | 'medicareTraditional'
  | 'mediCalFfs'
  | 'mediCalManagedCare'
  | 'vaWorkersCompContract'
  | 'pendingVerification'
  | 'noBillableServices';

export type AdmissionBillingRouteBehavior = {
  section7: {
    checkedPayers: AdmissionPayerKey[];
    payerPriority: 'Primary' | 'Secondary' | 'Tertiary' | 'N/A';
    payerName: string;
    payerId: string;
    payerNoticeVariant: string;
  };
  section8: {
    active: boolean;
    reason: string;
    checklistStatus: 'required' | 'not_applicable';
    renderMode: 'full' | 'na' | 'omit';
  };
};

export function normalizeAdmissionRouteId(routeId?: string | null): AdmissionBillingRouteId {
  if (routeId === 'NO_BILLABLE_SERVICES') return 'NOT_APPLICABLE_NO_BILLABLE_SERVICES';
  if (
    routeId === 'PRIVATE_PAY' ||
    routeId === 'LONG_TERM_CARE_INSURANCE' ||
    routeId === 'MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE' ||
    routeId === 'ORIGINAL_MEDICARE_FFS' ||
    routeId === 'MEDI_CAL_OR_MEDICAID' ||
    routeId === 'VA_WORKERS_COMP_OR_OTHER_CONTRACT' ||
    routeId === 'PENDING_VERIFICATION' ||
    routeId === 'NOT_APPLICABLE_NO_BILLABLE_SERVICES'
  ) {
    return routeId;
  }
  return 'PENDING_VERIFICATION';
}

function includesAny(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function clean(value?: string | null) {
  return String(value || '').trim();
}

export function getAdmissionBillingRouteBehavior(
  confirmedRouteId?: string | null,
  payerText?: string | null,
  sourceFields: Record<string, string | undefined | null> = {},
  explicitPrivatePayAddendum = false,
): AdmissionBillingRouteBehavior {
  const route = normalizeAdmissionRouteId(confirmedRouteId);
  const payer = clean(payerText || sourceFields.payer);
  const payerLower = payer.toLowerCase();
  const payerId = clean(sourceFields.payer_id || sourceFields.member_id || sourceFields.policy_id);

  let checkedPayers: AdmissionPayerKey[] = [];
  let payerName = payer;
  let payerNoticeVariant: string = route;

  switch (route) {
    case 'PRIVATE_PAY':
      checkedPayers = ['privatePay'];
      payerName = payer || 'Private Pay';
      payerNoticeVariant = 'private-pay';
      break;
    case 'LONG_TERM_CARE_INSURANCE':
      checkedPayers = ['longTermCareInsurance'];
      payerName = payer || clean(sourceFields.longTermCareCarrier) || 'Long-Term Care Insurance';
      payerNoticeVariant = 'long-term-care';
      break;
    case 'MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE':
      if (includesAny(payerLower, [/medicare advantage/, /\bma plan\b/, /\bpart c\b/, /\bmanaged medicare\b/, /\bhmo medicare\b/])) {
        checkedPayers = ['medicareAdvantage'];
        payerNoticeVariant = 'medicare-advantage';
      } else {
        checkedPayers = ['privateInsurance'];
        payerNoticeVariant = 'private-insurance';
      }
      payerName = payer || clean(sourceFields.insuranceCarrier) || 'Health Plan / Private Insurance';
      break;
    case 'ORIGINAL_MEDICARE_FFS':
      checkedPayers = ['medicareTraditional'];
      payerName = payer || 'Original Medicare FFS';
      payerNoticeVariant = 'original-medicare-ffs';
      break;
    case 'MEDI_CAL_OR_MEDICAID':
      if (includesAny(payerLower, [/fee[-\s]?for[-\s]?service/, /\bffs\b/])) {
        checkedPayers = ['mediCalFfs'];
        payerNoticeVariant = 'medi-cal-ffs';
      } else {
        checkedPayers = ['mediCalManagedCare'];
        payerNoticeVariant = 'medi-cal-managed-care';
      }
      payerName = payer || 'Medi-Cal / Medicaid';
      break;
    case 'VA_WORKERS_COMP_OR_OTHER_CONTRACT':
      checkedPayers = ['vaWorkersCompContract'];
      payerName = payer || clean(sourceFields.contractSponsor) || 'VA / Workers Comp / Contract';
      payerNoticeVariant = 'contract';
      break;
    case 'PENDING_VERIFICATION':
      checkedPayers = ['pendingVerification'];
      payerName = payer || 'Pending Verification';
      payerNoticeVariant = 'pending-verification';
      break;
    case 'NOT_APPLICABLE_NO_BILLABLE_SERVICES':
    case 'NO_BILLABLE_SERVICES':
      checkedPayers = ['noBillableServices'];
      payerName = payer || 'No Billable Services';
      payerNoticeVariant = 'no-billable-services';
      break;
  }

  const section8Active = route === 'PRIVATE_PAY' || explicitPrivatePayAddendum;
  return {
    section7: {
      checkedPayers,
      payerPriority: route === 'NOT_APPLICABLE_NO_BILLABLE_SERVICES' ? 'N/A' : 'Primary',
      payerName,
      payerId,
      payerNoticeVariant,
    },
    section8: {
      active: section8Active,
      reason: section8Active
        ? route === 'PRIVATE_PAY'
          ? 'Confirmed route is Private Pay.'
          : 'Explicit private-pay addendum confirmed for uncovered services.'
        : `Confirmed route ${route} does not activate private-pay terms.`,
      checklistStatus: section8Active ? 'required' : 'not_applicable',
      renderMode: section8Active ? 'full' : 'na',
    },
  };
}

export type OrderedServiceFill = {
  key: 'sn_rn' | 'pt' | 'ot' | 'slp' | 'msw' | 'hha' | 'dietitian' | 'other';
  label: string;
  frequency: string;
};

export function mapAdmissionOrderedServices(servicesOrdered?: string | null): OrderedServiceFill[] {
  const source = clean(servicesOrdered);
  if (!source) return [];
  const rows: OrderedServiceFill[] = [];
  const add = (key: OrderedServiceFill['key'], label: string, frequency: string) => rows.push({ key, label, frequency });

  const readFrequency = (pattern: RegExp, fallback = '') => {
    const match = source.match(pattern);
    return clean(match?.[1]) || fallback;
  };

  if (/skilled nursing|sn\b|rn\b/i.test(source)) add('sn_rn', 'Skilled Nursing RN', readFrequency(/(?:Skilled Nursing RN|Skilled Nursing|RN)\s+([^;\n,]+(?:,\s*then\s*[^;\n]+)?)/i));
  if (/physical therapy|\bpt\b/i.test(source)) add('pt', 'Physical Therapy', readFrequency(/(?:Physical Therapy|PT)\s+([^;\n,]+)/i));
  if (/occupational therapy|\bot\b/i.test(source)) add('ot', 'Occupational Therapy', readFrequency(/(?:Occupational Therapy|OT)\s+([^;\n,]+)/i));
  if (/speech-language pathology|speech language pathology|\bslp\b/i.test(source)) add('slp', 'Speech-Language Pathology', readFrequency(/(?:Speech-Language Pathology|Speech Language Pathology|SLP)\s+([^;\n,]+)/i));
  if (/medical social work|\bmsw\b/i.test(source)) add('msw', 'Medical Social Work', readFrequency(/(?:Medical Social Work|MSW)\s+([^;\n,]+)/i));
  if (/home health aide|\bhha\b/i.test(source)) add('hha', 'Home Health Aide', readFrequency(/(?:Home Health Aide|HHA)\s+([^;\n,]+)/i));
  if (/registered dietitian|dietitian|nutritional counseling/i.test(source)) add('dietitian', 'Registered Dietitian / Nutritional Counseling', readFrequency(/(?:Registered Dietitian|Dietitian|Nutritional Counseling)\s+([^;\n,]+)/i));
  if (/respiratory therapy/i.test(source)) add('other', 'Respiratory Therapy', readFrequency(/Respiratory Therapy\s+([^;\n,]+)/i));

  return rows;
}

export function getAdvanceDirectiveSummary(status?: string | null, legalAuthority?: string | null, representativeName?: string | null) {
  const source = clean(status);
  const lower = source.toLowerCase();
  const rep = clean(representativeName);
  return {
    ahcdPresent: /\bahcd\b|advance health care directive|advance directive/.test(lower),
    polstPresent: /\bpolst\b/.test(lower),
    dnrPresent: /\bdnr\b|do not resuscitate/.test(lower),
    fullTreatment: /full treatment|full code|all sections/.test(lower),
    decisionMaker: rep || clean(legalAuthority),
    note: [source, clean(legalAuthority)].filter(Boolean).join(' | '),
  };
}
