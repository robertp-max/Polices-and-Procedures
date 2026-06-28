export type TermDefinition = {
  id: number;
  term: string;
  def: string;
};

export type SectionTerminology = {
  section: string;
  terms: TermDefinition[];
};

export const SECTION_TERMINOLOGY: SectionTerminology[] = [
  {
    section: 'Foundation',
    terms: [
      { id: 0, term: 'CMS-485', def: 'The Home Health Certification and Plan of Care. A structured representation used to communicate the specific home health services a physician has ordered.' },
      { id: 1, term: 'Plan of Care (POC)', def: 'The blueprint for a patient\'s care journey. It directly connects to both payment and survey outcomes.' },
      { id: 2, term: 'ADR', def: 'Additional Documentation Request. A request from a Medicare contractor for medical records to ensure claims meet billing requirements.' },
      { id: 3, term: 'Certification Period', def: 'The 60-day episode of care for which the physician certifies that home health services are medically necessary.' },
      { id: 4, term: 'Defensibility', def: 'The ability of the clinical narrative and structured data within the CMS-485 to withstand auditor scrutiny and justify reimbursement.' },
    ],
  },
  {
    section: 'Regulatory Authority',
    terms: [
      { id: 0, term: 'Conditions of Participation (CoPs)', def: 'Federal regulatory requirements that home health agencies must meet to participate in Medicare and Medicaid programs.' },
      { id: 1, term: 'Patient-Specific Language', def: 'Documentation that reflects the individual patient\'s condition, needs, and clinical findings rather than generic template text.' },
      { id: 2, term: 'Required POC Elements', def: 'Mandated components including diagnoses, measurable goals, interventions, disciplines, frequency, duration, and discharge planning.' },
    ],
  },
  {
    section: 'Certification Lifecycle',
    terms: [
      { id: 0, term: 'Recertification', def: 'The process of renewing the Plan of Care for a new 60-day episode when continued skilled services are determined to be medically necessary.' },
      { id: 1, term: 'Recertification Drift', def: 'The risk created when goals, interventions, and rationale remain unchanged across consecutive episodes without reflecting clinical reassessment.' },
    ],
  },
  {
    section: 'Orders & Signatures',
    terms: [
      { id: 0, term: 'Order Specificity', def: 'The requirement that physician orders include discipline, intervention, frequency, duration, and clinical intent.' },
      { id: 1, term: 'Billing Hard-Stop', def: 'A system control that prevents claim release when signature prerequisites or order requirements are incomplete.' },
      { id: 2, term: 'Authentication Controls', def: 'Identity verification mechanisms for electronic signatures that maintain audit traceability.' },
    ],
  },
  {
    section: 'Eligibility',
    terms: [
      { id: 0, term: 'Homebound Status', def: 'The Medicare eligibility criterion requiring that leaving home constitutes a taxing effort due to the patient\'s condition.' },
      { id: 1, term: 'Functional Limitations', def: 'Specific, objective descriptions of physical or cognitive deficits that restrict a patient\'s ability to leave home safely.' },
    ],
  },
  {
    section: 'Clinical Necessity',
    terms: [
      { id: 0, term: 'Skilled Services', def: 'Services requiring clinical judgment, teaching, intervention management, or assessment synthesis that cannot be safely performed by non-clinical personnel.' },
      { id: 1, term: 'Skilled Narrative', def: 'The documented reasoning that includes assessment, intervention performed, and patient response for each visit.' },
    ],
  },
  {
    section: 'Medical Necessity',
    terms: [
      { id: 0, term: 'Medical Necessity', def: 'The standard requiring that services be reasonable and necessary, tied to documented condition and risk, with intensity reflecting patient status.' },
      { id: 1, term: 'Pre-Bill Controls', def: 'Verification checks performed before claim submission to ensure signature completion, plan completeness, and timeline traceability.' },
    ],
  },
  {
    section: 'Clinical Alignment',
    terms: [
      { id: 0, term: 'OASIS', def: 'Outcome and Assessment Information Set. A standardized assessment tool used to measure patient health outcomes for home health quality reporting.' },
      { id: 1, term: 'OASIS-POC Alignment', def: 'Ensuring that POC interventions map directly to assessed deficits, risks, and priorities identified in the OASIS assessment.' },
    ],
  },
  {
    section: 'Coding Context',
    terms: [
      { id: 0, term: 'PDGM', def: 'Patient-Driven Groupings Model. The Medicare payment methodology for home health that uses diagnosis, functional status, and comorbidity data for reimbursement.' },
      { id: 1, term: 'Principal Diagnosis', def: 'The diagnosis that reflects the dominant skilled driver for the current episode of care delivery.' },
    ],
  },
  {
    section: 'Service Planning',
    terms: [
      { id: 0, term: 'Visit Frequency', def: 'The specific number and pattern of visits ordered, which must match risk acuity, intervention complexity, and monitoring needs.' },
      { id: 1, term: 'Discipline Coordination', def: 'The requirement that each discipline\'s role be explicit, non-duplicative, and linked to distinct outcomes with documented communication.' },
    ],
  },
  {
    section: 'Order Management',
    terms: [
      { id: 0, term: 'Verbal/Telephone Order', def: 'An order communicated by phone or in person that must be documented with exact wording, date/time, receiving clinician, and context.' },
      { id: 1, term: 'Interim Order', def: 'An order issued between certification periods due to a condition change that must be integrated into the active plan promptly.' },
    ],
  },
  {
    section: 'Survey Readiness',
    terms: [
      { id: 0, term: 'Survey Deficiency', def: 'A finding by a state or accreditation surveyor indicating non-compliance with regulatory requirements in patient documentation.' },
      { id: 1, term: 'Supervisor Attestation', def: 'A verification step where a clinical supervisor confirms that documentation meets completeness and quality standards before release.' },
    ],
  },
  {
    section: 'Audit Readiness',
    terms: [
      { id: 0, term: 'Timeline Reconciliation', def: 'The process of verifying that SOC dates, certification windows, order dates, and visit dates are internally consistent before claim submission.' },
      { id: 1, term: 'Storyline Consistency', def: 'Maintaining one coherent clinical narrative from initial certification through final bill, with no unexplained contradictions.' },
    ],
  },
  {
    section: 'Case Cards',
    terms: [
      { id: 0, term: 'Defensible Narrative', def: 'Visit documentation that shows assessment, action, and clinical consequence — demonstrating skilled judgment that supports the visit.' },
      { id: 1, term: 'Measurable Goal', def: 'A care goal with a specific target, timeframe, and intervention linkage that allows objective progress verification.' },
    ],
  },
  {
    section: 'Takeaways',
    terms: [
      { id: 0, term: 'High-Reliability Documentation', def: 'Consistent documentation behaviors applied at every visit: skilled rationale, intervention detail, response, and timely completion.' },
      { id: 1, term: 'Leadership Controls', def: 'Organizational-level metrics tracking and retraining loops that sustain compliance performance across the agency.' },
    ],
  },
];

export function getTermsForSection(section: string): TermDefinition[] {
  const found = SECTION_TERMINOLOGY.find(s => s.section === section);
  return found ? found.terms : [];
}
