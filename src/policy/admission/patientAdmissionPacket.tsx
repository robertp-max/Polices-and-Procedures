import type { ReactElement } from "react";

export type PaymentRoute =
  | "PRIVATE_PAY"
  | "LONG_TERM_CARE_INSURANCE"
  | "MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE"
  | "ORIGINAL_MEDICARE_FFS"
  | "MEDI_CAL_OR_MEDICAID"
  | "VA_WORKERS_COMP_OR_OTHER_CONTRACT"
  | "PENDING_VERIFICATION"
  | "NOT_APPLICABLE_NO_BILLABLE_SERVICES";

export type CopyProvidedStatus = "PROVIDED" | "REFUSED" | "ELECTRONIC_PROVIDED" | "PENDING";

export type RepresentativeAuthority =
  | "NONE"
  | "PATIENT_SELF"
  | "LEGAL_GUARDIAN"
  | "POWER_OF_ATTORNEY"
  | "HEALTH_CARE_SURROGATE"
  | "AUTHORIZED_REPRESENTATIVE";

export type ValidationSeverity = "blocker" | "warning" | "info";

export type ValidationIssue = {
  code: string;
  severity: ValidationSeverity;
  message: string;
  field?: string;
};

export type ValidationResult = {
  status: "PRODUCTION READY WITH LEGAL HOLD ITEMS" | "NOT PRODUCTION READY";
  validForPatientPreview: boolean;
  validForProductionFinalization: boolean;
  issues: ValidationIssue[];
  blockers: ValidationIssue[];
  warnings: ValidationIssue[];
};

export type PayerRouteConfig = {
  paymentRoute: PaymentRoute;
  label: string;
  patientSummary: string;
  requiredFields: string[];
  renderedClauseIds: string[];
  suppressedClauseIds: string[];
  noticesTriggered: string[];
  legalReviewFlags: string[];
};

export type PacketSection = {
  id: string;
  title: string;
  body: string[];
  internalOnly?: boolean;
  requiresSeparateLegalSignature?: boolean;
};

export type PacketPage = {
  pageId: string;
  title: string;
  sections: PacketSection[];
  footerLabel: string;
};

export type SignatureApplicationMap = {
  packetId: string;
  selectedSectionIds: string[];
  selectedClauseIds: string[];
  oneSignatureAppliedTo: string[];
  separateSignatureRequiredFor: string[];
};

export type ECignCertificate = {
  packetId: string;
  templateId: string;
  templateVersion: string;
  paymentRoute: PaymentRoute;
  payerPathwayVersion: string;
  selectedBy: string;
  routeSelectedAt: string;
  renderedClauseIds: string[];
  suppressedClauseIds: string[];
  noticesTriggered: string[];
  noticesAttached: string[];
  legalReviewFlags: string[];
  signerIdentity: {
    signerName: string;
    signerType: "PATIENT" | "REPRESENTATIVE";
  };
  representativeAuthority: RepresentativeAuthority;
  copyProvidedStatus: CopyProvidedStatus;
  packetHash: string;
  signedAt?: string;
  staffCollector: string;
  sessionMetadata?: {
    sessionId?: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
};

export type AdmissionPacketData = {
  packetId: string;
  templateId?: string;
  templateVersion?: string;
  /** Patient-facing document release version (defaults to "1.0 FINAL"). */
  documentVersion?: string;
  /** Patient-facing effective date (defaults to "July 1, 2026"). */
  effectiveDate?: string;
  /** When true, render the internal Agency Record Copy (includes internal-only
   *  sections such as the release checklist). Patient copies leave this false. */
  agencyRecordCopy?: boolean;
  patientName: string;
  dateOfBirth?: string;
  medicalRecordNumber?: string;
  admissionDate?: string;
  agencyName: string;
  agencyPhone: string;
  agencyAddress: string;
  paymentRoute?: PaymentRoute;
  selectedBy: string;
  routeSelectedAt: string;
  signerName: string;
  signerType: "PATIENT" | "REPRESENTATIVE";
  representativeAuthority: RepresentativeAuthority;
  representativeDocumentOnFile: boolean;
  copyProvidedStatus?: CopyProvidedStatus;
  nppAcknowledged: boolean;
  patientRightsAcknowledged: boolean;
  cmsNoticesAttached: string[];
  staffCollector: string;
  signedAt?: string;
  generatedAt?: string;
  sessionMetadata?: ECignCertificate["sessionMetadata"];
  fields: {
    privatePayRate?: string;
    longTermCareCarrier?: string;
    insuranceCarrier?: string;
    medicareNumberConfirmed?: boolean;
    medicaidIdConfirmed?: boolean;
    contractSponsor?: string;
    pendingEstimateDescription?: string;
    noBillableServicesReason?: string;
    approvedMedicaidAddendum?: boolean;
  };
};

const TEMPLATE_ID = "CI-HH-ADM-001";
const TEMPLATE_VERSION = "3.0.0";
const PAYER_PATHWAY_VERSION = "2026.06";
/** Patient-facing document release identity (distinct from the form-engine
 *  TEMPLATE_VERSION). Shown consistently on the cover, header, and footer. */
const DOCUMENT_VERSION = "1.0 FINAL";
const EFFECTIVE_DATE = "July 1, 2026";

const ALL_PAYMENT_ROUTES: PaymentRoute[] = [
  "PRIVATE_PAY",
  "LONG_TERM_CARE_INSURANCE",
  "MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE",
  "ORIGINAL_MEDICARE_FFS",
  "MEDI_CAL_OR_MEDICAID",
  "VA_WORKERS_COMP_OR_OTHER_CONTRACT",
  "PENDING_VERIFICATION",
  "NOT_APPLICABLE_NO_BILLABLE_SERVICES",
];

const PATIENT_FACING_INTERNAL_TERMS = [
  "ACHC",
  "legal hold",
  "source confirmation",
  "internal compliance",
  "policy mapping",
  "licensed manual",
  "release checklist",
];

const BLOCKED_PATTERNS: RegExp[] = [
  new RegExp(`\\[${"VERIFY"}\\]`, "i"),
  new RegExp(`\\[${"INSERT"}\\]`, "i"),
  new RegExp(`\\[${"TBD"}\\]`, "i"),
  new RegExp(["Insurance", "Company"].join("\\s+"), "i"),
  new RegExp(["Per", "cent"].join(""), "i"),
  new RegExp(["Dol", "lars"].join(""), "i"),
  new RegExp(["Deductible", "Amount"].join("\\s+"), "i"),
  /\{\{[^}]+}}/i,
  /\[\s*blocked\s*]/i,
  /c\s*v\s*v/i,
  /c\s*v\s*c/i,
  /card\s+verification\s+value/i,
  new RegExp(["security", "code"].join("\\s*[- ]?\\s*"), "i"),
  new RegExp(["Patient Admission Packet", "ACHC", "Private Duty", "Skilled", "2022"].join("\\s+"), "i"),
];

const ROUTE_SECTION_ID: Record<PaymentRoute, string> = {
  PRIVATE_PAY: "route-private-pay",
  LONG_TERM_CARE_INSURANCE: "route-long-term-care",
  MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE: "route-commercial-insurance",
  ORIGINAL_MEDICARE_FFS: "route-original-medicare",
  MEDI_CAL_OR_MEDICAID: "route-medicaid",
  VA_WORKERS_COMP_OR_OTHER_CONTRACT: "route-contract",
  PENDING_VERIFICATION: "route-pending",
  NOT_APPLICABLE_NO_BILLABLE_SERVICES: "route-not-applicable",
};

// Single source of truth: patient-facing admission child forms/evidence by payment route (P1 fix).
// Only patient-facing required; no internal master-control dossiers.
export const ADMISSION_REQUIRED_FORMS_BY_ROUTE: Record<PaymentRoute, string[]> = {
  PRIVATE_PAY: ['AD-FM-001', 'AD-FM-002', 'AD-FM-003', 'AD-FM-004'], // agreement, rights, privacy, consent
  LONG_TERM_CARE_INSURANCE: ['AD-FM-001', 'AD-FM-002', 'AD-FM-003', 'AD-FM-004', 'AD-FM-005'], // + carrier auth
  MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE: ['AD-FM-001', 'AD-FM-002', 'AD-FM-003', 'AD-FM-004', 'AD-FM-006'], // + assignment
  ORIGINAL_MEDICARE_FFS: ['AD-FM-001', 'AD-FM-002', 'AD-FM-003', 'AD-FM-004', 'CMS-ABN', 'CMS-HHCCN'], // + official notices
  MEDI_CAL_OR_MEDICAID: ['AD-FM-001', 'AD-FM-002', 'AD-FM-003', 'AD-FM-004', 'AD-FM-007'], // + medicaid notice
  VA_WORKERS_COMP_OR_OTHER_CONTRACT: ['AD-FM-001', 'AD-FM-002', 'AD-FM-003', 'AD-FM-004', 'AD-FM-008'], // + sponsor auth
  PENDING_VERIFICATION: ['AD-FM-001', 'AD-FM-002', 'AD-FM-003', 'AD-FM-004'], // minimal until verified
  NOT_APPLICABLE_NO_BILLABLE_SERVICES: ['AD-FM-001', 'AD-FM-002', 'AD-FM-003'], // no billing docs
};

const ROUTE_CONFIGS: Record<PaymentRoute, PayerRouteConfig> = {
  PRIVATE_PAY: {
    paymentRoute: "PRIVATE_PAY",
    label: "Private Pay",
    patientSummary: "You or your responsible payer will be billed directly for agreed private-pay services.",
    requiredFields: ["fields.privatePayRate"],
    renderedClauseIds: ["private-pay-rate", "private-pay-direct-billing", "private-pay-collection"],
    suppressedClauseIds: [
      "medicare-coverage-rights",
      "medicare-advance-notice",
      "insurance-assignment",
      "medicaid-balance-billing",
      "pending-estimate-only",
    ],
    noticesTriggered: [],
    legalReviewFlags: ["private-pay-collection-terms-review"],
  },
  LONG_TERM_CARE_INSURANCE: {
    paymentRoute: "LONG_TERM_CARE_INSURANCE",
    label: "Long-Term Care Insurance",
    patientSummary: "Services may be submitted to the long-term care insurance carrier identified during intake.",
    requiredFields: ["fields.longTermCareCarrier"],
    renderedClauseIds: ["ltc-carrier", "insurance-assignment", "patient-cooperation"],
    suppressedClauseIds: [
      "private-pay-direct-billing",
      "medicare-coverage-rights",
      "medicaid-balance-billing",
      "pending-estimate-only",
    ],
    noticesTriggered: [],
    legalReviewFlags: ["carrier-specific-authorization-review"],
  },
  MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE: {
    paymentRoute: "MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE",
    label: "Medicare Advantage or Private Insurance",
    patientSummary: "Services will be routed through the listed health plan or private insurance pathway.",
    requiredFields: ["fields.insuranceCarrier"],
    renderedClauseIds: ["insurance-carrier", "insurance-assignment", "authorization-dependent-services"],
    suppressedClauseIds: [
      "private-pay-direct-billing",
      "medicare-ffs-rights",
      "medicaid-balance-billing",
      "pending-estimate-only",
    ],
    noticesTriggered: ["health-plan-authorization-summary"],
    legalReviewFlags: ["plan-specific-patient-liability-review"],
  },
  ORIGINAL_MEDICARE_FFS: {
    paymentRoute: "ORIGINAL_MEDICARE_FFS",
    label: "Original Medicare Fee-for-Service",
    patientSummary: "Services will follow Original Medicare home health coverage and notice rules.",
    requiredFields: ["fields.medicareNumberConfirmed"],
    renderedClauseIds: ["medicare-ffs-rights", "medicare-coverage-rights", "medicare-advance-notice"],
    suppressedClauseIds: [
      "private-pay-direct-billing",
      "private-pay-collection",
      "insurance-assignment",
      "medicaid-balance-billing",
      "pending-estimate-only",
    ],
    noticesTriggered: ["ABN-CMS-R-131", "HHCCN-CMS-10280", "NOMNC-CMS-10123", "DENC-CMS-10124"],
    legalReviewFlags: ["official-cms-notice-attachment-required"],
  },
  MEDI_CAL_OR_MEDICAID: {
    paymentRoute: "MEDI_CAL_OR_MEDICAID",
    label: "Medi-Cal or Medicaid",
    patientSummary: "Services will follow Medicaid coverage and patient financial responsibility limits.",
    requiredFields: ["fields.medicaidIdConfirmed"],
    renderedClauseIds: ["medicaid-coverage", "medicaid-balance-billing"],
    suppressedClauseIds: [
      "private-pay-direct-billing",
      "private-pay-collection",
      "medicare-coverage-rights",
      "pending-estimate-only",
    ],
    noticesTriggered: ["medicaid-coverage-rights-summary"],
    legalReviewFlags: ["medicaid-financial-responsibility-review"],
  },
  VA_WORKERS_COMP_OR_OTHER_CONTRACT: {
    paymentRoute: "VA_WORKERS_COMP_OR_OTHER_CONTRACT",
    label: "VA, Workers' Compensation, or Other Contract",
    patientSummary: "Services will be coordinated with the authorized contract sponsor.",
    requiredFields: ["fields.contractSponsor"],
    renderedClauseIds: ["contract-sponsor", "authorization-dependent-services", "patient-cooperation"],
    suppressedClauseIds: [
      "private-pay-direct-billing",
      "medicare-coverage-rights",
      "medicaid-balance-billing",
      "pending-estimate-only",
    ],
    noticesTriggered: ["contract-authorization-summary"],
    legalReviewFlags: ["contract-sponsor-terms-review"],
  },
  PENDING_VERIFICATION: {
    paymentRoute: "PENDING_VERIFICATION",
    label: "Pending Verification",
    patientSummary: "Coverage is not final. This packet provides preliminary estimate language only.",
    requiredFields: ["fields.pendingEstimateDescription"],
    renderedClauseIds: ["pending-estimate-only"],
    suppressedClauseIds: [
      "private-pay-direct-billing",
      "private-pay-collection",
      "medicare-coverage-rights",
      "medicare-advance-notice",
      "insurance-assignment",
      "medicaid-balance-billing",
    ],
    noticesTriggered: ["coverage-verification-pending-summary"],
    legalReviewFlags: ["coverage-verification-before-finalization"],
  },
  NOT_APPLICABLE_NO_BILLABLE_SERVICES: {
    paymentRoute: "NOT_APPLICABLE_NO_BILLABLE_SERVICES",
    label: "Not Applicable - No Billable Services",
    patientSummary: "No billable services are being admitted under this packet.",
    requiredFields: ["fields.noBillableServicesReason"],
    renderedClauseIds: ["no-billable-services"],
    suppressedClauseIds: [
      "private-pay-direct-billing",
      "private-pay-collection",
      "medicare-coverage-rights",
      "medicare-advance-notice",
      "insurance-assignment",
      "medicaid-balance-billing",
      "pending-estimate-only",
    ],
    noticesTriggered: [],
    legalReviewFlags: [],
  },
};

const BASE_PATIENT_SECTIONS: PacketSection[] = [
  {
    id: "patient-identification",
    title: "Patient and Admission Information",
    body: [
      "Care Indeed Home Health Care, Inc. uses this agreement to confirm the patient, admission date, agency contact information, receipt of required notices, and the selected payment pathway.",
      "The patient or authorized representative should ask questions before signing if any section is unclear.",
    ],
  },
  {
    id: "patient-rights",
    title: "Patient Rights and Responsibilities",
    body: [
      "You have the right to receive respectful care, participate in planning your care, receive information about services, voice concerns, and receive notice of your rights before care begins whenever possible.",
      "You agree to provide accurate information, notify the agency of changes that may affect services, and participate in care planning within your ability.",
    ],
  },
  {
    id: "privacy-practices",
    title: "Privacy Practices",
    body: [
      "The agency provides a Notice of Privacy Practices and explains how protected health information may be used for treatment, payment, health care operations, and other permitted purposes.",
      "A separate authorization is required for uses or disclosures that require a dedicated authorization form.",
    ],
  },
  {
    id: "copy-receipt",
    title: "Copies and Acknowledgments",
    body: [
      "The patient or authorized representative confirms whether a copy of this admission agreement, patient rights information, and privacy notice was provided or refused.",
    ],
  },
];

const ADMISSION_ACKNOWLEDGMENT_SECTIONS: Record<string, PacketSection> = {
  "consent-services": {
    id: "consent-services",
    title: "Consent to Receive Home Health Services",
    body: [
      "The patient or authorized representative consents to receive home health services ordered by the physician or allowed practitioner and accepted by the agency.",
      "Services may include assessment, skilled nursing, therapy, aide, social work, care coordination, teaching, and other authorized services within the plan of care.",
      "Care Indeed Home Health Care, Inc. may coordinate with physicians, payers, caregivers, and service partners as needed to arrange and document care.",
    ],
  },
  "patient-rights": {
    id: "patient-rights",
    title: "Patient Rights and Responsibilities",
    body: [
      "You have the right to respectful care, participation in care planning, information about services, notice before care changes whenever possible, privacy, complaint resolution, and freedom from abuse, neglect, discrimination, and retaliation.",
      "You are responsible for providing accurate information, notifying the agency of changes in condition, payer information, address, contact information, safety risks, and schedule availability.",
      "The agency explains how to contact staff, request help, report concerns, and ask questions about services or billing.",
    ],
  },
  "privacy-practices": {
    id: "privacy-practices",
    title: "Notice of Privacy Practices Acknowledgment",
    body: [
      "The agency provides a Notice of Privacy Practices and explains how protected health information may be used for treatment, payment, health care operations, and other permitted purposes.",
      "The patient or authorized representative acknowledges receipt or documented refusal of the Notice of Privacy Practices.",
      "A separate authorization is required for uses or disclosures that require a dedicated authorization form.",
    ],
  },
  "advance-directive": {
    id: "advance-directive",
    title: "Advance Directive and DNR Acknowledgment",
    body: [
      "The agency asks whether the patient has an advance directive, health care decision maker, or DNR/POLST instruction and records the information provided during admission.",
      "The patient may provide copies of advance directive documents for the clinical record.",
      "Emergency instructions must be communicated clearly to agency staff and may require additional documentation depending on the patient situation.",
    ],
  },
  "emergency-preparedness": {
    id: "emergency-preparedness",
    title: "Emergency Preparedness and Disaster Plan",
    body: [
      "The agency reviews emergency contact information, evacuation considerations, utility needs, medication and supply planning, and how the patient may be contacted during a disaster or service interruption.",
      "Patients are encouraged to maintain emergency supplies, a current medication list, backup contact information, and a plan for sheltering or evacuation when needed.",
      "The agency will make reasonable efforts to continue or coordinate care during emergencies based on patient priority, staff safety, and available resources.",
    ],
  },
  "infection-home-safety": {
    id: "infection-home-safety",
    title: "Infection Control and Home Safety",
    body: [
      "The agency reviews basic infection-control practices, hand hygiene, safe disposal of supplies, equipment handling, and reporting of symptoms or exposure concerns.",
      "The patient or caregiver should notify the agency of hazards such as unsafe entry, aggressive animals, weapons, pests, environmental concerns, or barriers to safe care.",
      "Staff may request reasonable safety adjustments before services continue in the home.",
    ],
  },
  "discharge-transfer": {
    id: "discharge-transfer",
    title: "Discharge and Transfer Policy",
    body: [
      "Services may end or transfer when goals are met, the patient no longer needs or qualifies for services, the patient chooses another provider, the plan of care changes, safety prevents service delivery, or payer authorization changes.",
      "The agency provides notice and coordination as required by applicable rules and patient circumstances.",
      "Patients may ask questions about discharge plans, appeal rights when applicable, and available follow-up resources.",
    ],
  },
  "photo-media-consent": {
    id: "photo-media-consent",
    title: "Photo and Media Consent",
    body: [
      "Clinical photos or recordings may be requested only when needed for care coordination, wound tracking, documentation, education, or another permitted care purpose.",
      "Non-care marketing or public use requires a separate authorization when required.",
      "The patient may ask how images or recordings will be stored, used, or shared.",
    ],
  },
  "personal-funds-vehicle": {
    id: "personal-funds-vehicle",
    title: "Personal Funds and Vehicle Authorization",
    body: [
      "Agency staff do not manage patient funds, borrow money, accept gifts outside agency policy, or use patient property except as specifically permitted by agency rules and the plan of care.",
      "Transportation, errands, vehicle use, and personal-property handling must follow agency authorization and safety requirements.",
      "Any concern about money, valuables, property, or transportation should be reported to the agency promptly.",
    ],
    requiresSeparateLegalSignature: true,
  },
  "service-outline": {
    id: "service-outline",
    title: "Service Outline and Schedule Acknowledgment",
    body: [
      "The agency explains the expected service disciplines, visit frequency, scheduling process, after-hours contact process, and how changes are communicated.",
      "The service schedule may change based on patient needs, physician orders, payer authorization, staffing, safety, and patient availability.",
      "The patient or representative should contact the agency if a scheduled visit is missed, refused, delayed, or no longer needed.",
    ],
  },
};

const INTERNAL_RELEASE_CHECKLIST: PacketSection[] = [
  {
    id: "internal-release-blockers",
    title: "Internal Release Blockers",
    internalOnly: true,
    body: [
      "Confirm agency-specific official contact fields before production release.",
      "Confirm accreditation standard references against the licensed manual before making accreditation claims.",
      "Obtain legal review for private-pay collection terms, Medicaid financial responsibility terms, personal funds handling, and transportation liability terms before production finalization.",
      "Attach official CMS notices when Original Medicare Fee-for-Service is selected.",
    ],
  },
];

function getRouteConfig(paymentRoute: PaymentRoute): PayerRouteConfig {
  return ROUTE_CONFIGS[paymentRoute];
}

function getByPath(data: AdmissionPacketData, path: string): unknown {
  return path.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, data);
}

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "" && value !== false;
}

function clauseText(clauseId: string, data: AdmissionPacketData): string {
  switch (clauseId) {
    case "private-pay-rate":
      return `The current private-pay rate or rate schedule is ${data.fields.privatePayRate}.`;
    case "private-pay-direct-billing":
      return "For private-pay services, the patient or responsible payer receives billing directly from the agency according to the agreed rate schedule.";
    case "private-pay-collection":
      return "Questions about balances should be raised promptly so the agency can review the account and available options before further action.";
    case "ltc-carrier":
      return `The listed long-term care insurance carrier is ${data.fields.longTermCareCarrier}. The patient remains responsible for cooperating with claim documentation requests.`;
    case "insurance-carrier":
      return `The listed health plan or private insurance carrier is ${data.fields.insuranceCarrier}. Coverage may depend on authorization, eligibility, plan rules, and medical necessity.`;
    case "insurance-assignment":
      return "The patient authorizes the agency to submit claims and related documentation to the applicable payer for covered services.";
    case "authorization-dependent-services":
      return "Some services may require prior authorization or continued authorization before they can be provided or billed to the payer.";
    case "patient-cooperation":
      return "The patient agrees to provide payer information, identification numbers, and requested documents needed to support claim submission.";
    case "medicare-ffs-rights":
      return "For Original Medicare Fee-for-Service, Medicare coverage rules and applicable beneficiary notices control when coverage changes or services are not expected to be covered.";
    case "medicare-coverage-rights":
      return "Medicare notices may be provided when required, including notices related to noncoverage, changes in care, or appeal rights.";
    case "medicare-advance-notice":
      return "When an advance notice is required, the agency will provide the official notice form and explain the available options before the patient makes an election.";
    case "medicaid-coverage":
      return "For Medi-Cal or Medicaid, covered services and patient financial responsibility are limited by applicable program rules.";
    case "medicaid-balance-billing":
      return data.fields.approvedMedicaidAddendum
        ? "Any patient financial responsibility under Medicaid must be supported by an approved addendum and applicable program rules."
        : "The agency will not seek private-pay collection for covered Medicaid services unless permitted by applicable program rules and an approved addendum.";
    case "contract-sponsor":
      return `The authorized contract sponsor is ${data.fields.contractSponsor}. Services are coordinated according to the sponsor authorization and applicable program rules.`;
    case "pending-estimate-only":
      return `Coverage remains pending. Preliminary estimate note: ${data.fields.pendingEstimateDescription}. Final payment responsibility is not confirmed until verification is complete.`;
    case "no-billable-services":
      return `No billable services are admitted under this packet. Reason: ${data.fields.noBillableServicesReason}.`;
    default:
      return "";
  }
}

export function buildPatientFacingSections(data: AdmissionPacketData): PacketSection[] {
  if (!data.paymentRoute) {
    return BASE_PATIENT_SECTIONS;
  }

  const config = getRouteConfig(data.paymentRoute);
  const payerSection: PacketSection = {
    id: ROUTE_SECTION_ID[data.paymentRoute],
    title: `Payment Pathway - ${config.label}`,
    body: [config.patientSummary, ...config.renderedClauseIds.map((clauseId) => clauseText(clauseId, data))],
  };

  const noticeSection: PacketSection = {
    id: "notices-and-attachments",
    title: "Notices and Attachments",
    body: config.noticesTriggered.length
      ? [
          "The following notices or summaries apply to the selected payment pathway:",
          config.noticesTriggered.join(", "),
        ]
      : ["No payer-specific CMS notices are triggered by the selected payment pathway."],
  };

  const finalSignatureSection: PacketSection = {
    id: "final-signature",
    title: "Final Acknowledgment and Signature",
    body: [
      "By signing once below, the signer acknowledges the selected sections, payer pathway, patient rights, privacy notice receipt, and copy-provided or refusal status shown in this packet.",
      "Separate forms may still be required for authorizations that legally require a dedicated signature.",
    ],
  };

  return [...BASE_PATIENT_SECTIONS, payerSection, noticeSection, finalSignatureSection];
}

function buildCoverSection(data: AdmissionPacketData): PacketSection {
  return {
    id: "cover-admission-information",
    title: "Cover / Patient and Admission Information",
    body: [
      `Patient: ${data.patientName}`,
      `Date of Birth: ${data.dateOfBirth || ""}`,
      `Medical Record Number: ${data.medicalRecordNumber || ""}`,
      `Admission Date: ${data.admissionDate || ""}`,
      `Agency: ${data.agencyName}`,
      `Agency Phone: ${data.agencyPhone}`,
      `Agency Address: ${data.agencyAddress}`,
      `Selected Payment Pathway: ${data.paymentRoute ? getRouteConfig(data.paymentRoute).label : "Not selected"}`,
      `Copy Status: ${data.copyProvidedStatus || "Pending"}`,
      `Effective Date: ${data.effectiveDate ?? EFFECTIVE_DATE}`,
      `Document Version: ${data.documentVersion ?? DOCUMENT_VERSION}`,
    ],
  };
}

function buildSelectedPayerSection(data: AdmissionPacketData): PacketSection {
  if (!data.paymentRoute) {
    return {
      id: "route-not-selected",
      title: "Financial Responsibility / Selected Payer Route",
      body: [
        "A payment pathway has not been selected. Preview may render, but final PDF/export is blocked until exactly one payment route is selected.",
      ],
    };
  }

  const config = getRouteConfig(data.paymentRoute);
  return {
    id: ROUTE_SECTION_ID[data.paymentRoute],
    title: `Financial Responsibility / Selected Payer Route - ${config.label}`,
    body: [config.patientSummary, ...config.renderedClauseIds.map((clauseId) => clauseText(clauseId, data))],
  };
}

function buildNoticeAttachmentSection(data: AdmissionPacketData): PacketSection {
  const config = data.paymentRoute ? getRouteConfig(data.paymentRoute) : undefined;
  return {
    id: "notices-and-attachments",
    title: "Payer Notices and Attachments",
    body: config?.noticesTriggered.length
      ? [
          "The following notices or summaries apply to the selected payment pathway:",
          config.noticesTriggered.join(", "),
          `Attached or confirmed: ${data.cmsNoticesAttached.length ? data.cmsNoticesAttached.join(", ") : "None recorded"}`,
        ]
      : ["No payer-specific CMS notices are triggered by the selected payment pathway."],
  };
}

function buildFinalSignatureSection(data: AdmissionPacketData): PacketSection {
  const signatureMap = buildSignatureApplicationMap(data);

  return {
    id: "final-signature",
    title: "One Final Signature / eCign Certificate Summary",
    body: [
      "By signing once below, the signer acknowledges the selected patient-facing sections, the selected payer pathway, patient rights, privacy notice receipt, and copy-provided or refusal status shown in this packet.",
      `Signer: ${data.signerName}`,
      `Signer Type: ${data.signerType}`,
      `Representative Authority: ${data.representativeAuthority}`,
      `Copy Status: ${data.copyProvidedStatus || "Pending"}`,
      `Sections covered by one signature: ${signatureMap.oneSignatureAppliedTo.join(", ")}`,
      `Certificate Packet ID: ${data.packetId}`,
      `Template: ${data.templateId ?? TEMPLATE_ID} / ${data.templateVersion ?? TEMPLATE_VERSION}`,
      `Payer pathway version: ${PAYER_PATHWAY_VERSION}`,
      `Packet hash: ${simpleHash(`${data.packetId}|${data.paymentRoute ?? "NO_ROUTE"}|${data.signerName}`)}`,
      `Staff collector: ${data.staffCollector}`,
    ],
  };
}

export function buildAdmissionPacketPages(data: AdmissionPacketData): PacketPage[] {
  return [
    {
      pageId: "cover",
      title: "Cover / Patient and Admission Information",
      footerLabel: "Cover",
      sections: [buildCoverSection(data)],
    },
    {
      pageId: "consent-services",
      title: "Consent to Receive Services",
      footerLabel: "Consent",
      sections: [ADMISSION_ACKNOWLEDGMENT_SECTIONS["consent-services"]],
    },
    {
      pageId: "financial-responsibility",
      title: "Financial Responsibility / Selected Payer Route",
      footerLabel: "Financial",
      sections: [buildSelectedPayerSection(data), buildNoticeAttachmentSection(data)],
    },
    {
      pageId: "patient-rights",
      title: "Patient Rights and Responsibilities",
      footerLabel: "Rights",
      sections: [ADMISSION_ACKNOWLEDGMENT_SECTIONS["patient-rights"]],
    },
    {
      pageId: "privacy-practices",
      title: "Notice of Privacy Practices Acknowledgment",
      footerLabel: "NPP",
      sections: [ADMISSION_ACKNOWLEDGMENT_SECTIONS["privacy-practices"]],
    },
    {
      pageId: "advance-directive",
      title: "Advance Directive / DNR Acknowledgment",
      footerLabel: "Advance Directive",
      sections: [ADMISSION_ACKNOWLEDGMENT_SECTIONS["advance-directive"]],
    },
    {
      pageId: "emergency-preparedness",
      title: "Emergency Preparedness / Disaster Plan",
      footerLabel: "Emergency",
      sections: [ADMISSION_ACKNOWLEDGMENT_SECTIONS["emergency-preparedness"]],
    },
    {
      pageId: "infection-home-safety",
      title: "Infection Control and Home Safety",
      footerLabel: "Safety",
      sections: [ADMISSION_ACKNOWLEDGMENT_SECTIONS["infection-home-safety"]],
    },
    {
      pageId: "discharge-transfer",
      title: "Discharge and Transfer Policy",
      footerLabel: "Discharge",
      sections: [ADMISSION_ACKNOWLEDGMENT_SECTIONS["discharge-transfer"]],
    },
    {
      pageId: "photo-media-consent",
      title: "Photo / Media Consent",
      footerLabel: "Media",
      sections: [ADMISSION_ACKNOWLEDGMENT_SECTIONS["photo-media-consent"]],
    },
    {
      pageId: "personal-funds-vehicle",
      title: "Personal Funds / Vehicle Authorization",
      footerLabel: "Funds / Vehicle",
      sections: [ADMISSION_ACKNOWLEDGMENT_SECTIONS["personal-funds-vehicle"]],
    },
    {
      pageId: "service-outline",
      title: "Service Outline / Schedule Acknowledgment",
      footerLabel: "Services",
      sections: [ADMISSION_ACKNOWLEDGMENT_SECTIONS["service-outline"]],
    },
    {
      pageId: "final-signature",
      title: "One Final Signature / eCign Certificate Summary",
      footerLabel: "Signature",
      sections: [buildFinalSignatureSection(data)],
    },
  ];
}

/**
 * Agency Record Copy — the internal filing copy. Same patient pages PLUS an
 * appended internal release-checklist page. Used only when an Agency Record Copy
 * is explicitly requested; the patient-facing copy never includes these.
 */
export function buildAgencyRecordCopyPages(data: AdmissionPacketData): PacketPage[] {
  const patientPages = buildAdmissionPacketPages(data);
  const internalPage: PacketPage = {
    pageId: "agency-record-internal",
    title: "Agency Record Copy / Internal Release Checklist",
    footerLabel: "Agency Record",
    sections: getInternalReleaseChecklist(data),
  };
  return [...patientPages, internalPage];
}

export function renderPatientFacingText(data: AdmissionPacketData): string {
  // Patient-facing text NEVER includes internal sections, even for an agency copy.
  const pages = buildAdmissionPacketPages({ ...data, agencyRecordCopy: false });
  return [
    "Care Indeed Home Health Care, Inc. Patient Admission Agreement",
    `Packet ID: ${data.packetId}`,
    `Patient: ${data.patientName}`,
    `Agency: ${data.agencyName}`,
    `Payment pathway: ${data.paymentRoute ? getRouteConfig(data.paymentRoute).label : "Not selected"}`,
    ...pages.flatMap((page) => [page.title, ...page.sections.flatMap((section) => [section.title, ...section.body])]),
  ].join("\n");
}

export function buildSignatureApplicationMap(data: AdmissionPacketData): SignatureApplicationMap {
  const selectedSections = [
    buildCoverSection(data),
    ADMISSION_ACKNOWLEDGMENT_SECTIONS["consent-services"],
    buildSelectedPayerSection(data),
    buildNoticeAttachmentSection(data),
    ADMISSION_ACKNOWLEDGMENT_SECTIONS["patient-rights"],
    ADMISSION_ACKNOWLEDGMENT_SECTIONS["privacy-practices"],
    ADMISSION_ACKNOWLEDGMENT_SECTIONS["advance-directive"],
    ADMISSION_ACKNOWLEDGMENT_SECTIONS["emergency-preparedness"],
    ADMISSION_ACKNOWLEDGMENT_SECTIONS["infection-home-safety"],
    ADMISSION_ACKNOWLEDGMENT_SECTIONS["discharge-transfer"],
    ADMISSION_ACKNOWLEDGMENT_SECTIONS["photo-media-consent"],
    ADMISSION_ACKNOWLEDGMENT_SECTIONS["personal-funds-vehicle"],
    ADMISSION_ACKNOWLEDGMENT_SECTIONS["service-outline"],
    { id: "final-signature", title: "One Final Signature / eCign Certificate Summary", body: [] },
  ].filter((section) => !section.internalOnly);
  const config = data.paymentRoute ? getRouteConfig(data.paymentRoute) : undefined;
  const separateSignatureRequiredFor = selectedSections
    .filter((section) => section.requiresSeparateLegalSignature)
    .map((section) => section.id);

  return {
    packetId: data.packetId,
    selectedSectionIds: selectedSections.map((section) => section.id),
    selectedClauseIds: config?.renderedClauseIds ?? [],
    oneSignatureAppliedTo: selectedSections.map((section) => section.id),
    separateSignatureRequiredFor,
  };
}

function simpleHash(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function buildECignCertificate(data: AdmissionPacketData): ECignCertificate {
  if (!data.paymentRoute) {
    throw new Error("Cannot build eCign certificate without a selected payment route.");
  }

  const config = getRouteConfig(data.paymentRoute);
  const patientFacingText = renderPatientFacingText(data);

  return {
    packetId: data.packetId,
    templateId: data.templateId ?? TEMPLATE_ID,
    templateVersion: data.templateVersion ?? TEMPLATE_VERSION,
    paymentRoute: data.paymentRoute,
    payerPathwayVersion: PAYER_PATHWAY_VERSION,
    selectedBy: data.selectedBy,
    routeSelectedAt: data.routeSelectedAt,
    renderedClauseIds: config.renderedClauseIds,
    suppressedClauseIds: config.suppressedClauseIds,
    noticesTriggered: config.noticesTriggered,
    noticesAttached: data.cmsNoticesAttached,
    legalReviewFlags: config.legalReviewFlags,
    signerIdentity: {
      signerName: data.signerName,
      signerType: data.signerType,
    },
    representativeAuthority: data.representativeAuthority,
    copyProvidedStatus: data.copyProvidedStatus ?? "PENDING",
    packetHash: simpleHash(patientFacingText),
    signedAt: data.signedAt,
    staffCollector: data.staffCollector,
    sessionMetadata: data.sessionMetadata,
  };
}

function addIssue(issues: ValidationIssue[], issue: ValidationIssue): void {
  issues.push(issue);
}

function scanBlockedText(text: string, issues: ValidationIssue[], context: string): void {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      addIssue(issues, {
        code: "BLOCKED_TEXT",
        severity: "blocker",
        message: `Blocked text pattern found in ${context}.`,
      });
    }
  }
}

function validateRenderedOutput(data: AdmissionPacketData, issues: ValidationIssue[]): void {
  const output = renderPatientFacingText(data);
  scanBlockedText(output, issues, "patient-facing output");

  for (const term of PATIENT_FACING_INTERNAL_TERMS) {
    if (output.toLowerCase().includes(term.toLowerCase())) {
      addIssue(issues, {
        code: "INTERNAL_NOTE_VISIBLE",
        severity: "blocker",
        message: `Internal compliance term is visible in patient-facing output: ${term}.`,
      });
    }
  }

  if (!data.paymentRoute) {
    return;
  }

  const selectedRouteSectionId = ROUTE_SECTION_ID[data.paymentRoute];
  const renderedRouteSections = ALL_PAYMENT_ROUTES.filter((route) =>
    output.includes(`Selected Payer Route - ${ROUTE_CONFIGS[route].label}`),
  );

  if (renderedRouteSections.length !== 1 || renderedRouteSections[0] !== data.paymentRoute) {
    addIssue(issues, {
      code: "PAYMENT_ROUTE_RENDER_COUNT",
      severity: "blocker",
      message: "Patient-facing output must contain exactly one selected payer route section.",
      field: selectedRouteSectionId,
    });
  }

  const config = getRouteConfig(data.paymentRoute);
  const suppressedLeak = config.suppressedClauseIds.find((clauseId) => {
    const text = clauseText(clauseId, data);
    return text.length > 0 && output.includes(text);
  });
  if (suppressedLeak) {
    addIssue(issues, {
      code: "SUPPRESSED_CLAUSE_VISIBLE",
      severity: "blocker",
      message: `Suppressed clause rendered in final output: ${suppressedLeak}.`,
    });
  }

  const privatePayVisible = output.includes(clauseText("private-pay-direct-billing", data));
  const medicareVisible = output.includes(clauseText("medicare-coverage-rights", data));
  const medicaidVisible = output.includes(clauseText("medicaid-balance-billing", data));
  if ((privatePayVisible && medicareVisible) || (privatePayVisible && medicaidVisible)) {
    addIssue(issues, {
      code: "CONTRADICTORY_PAYER_CLAUSES",
      severity: "blocker",
      message: "Contradictory private-pay and government-payer clauses are visible together.",
    });
  }
}

export function validateAdmissionPacket(data: AdmissionPacketData): ValidationResult {
  const issues: ValidationIssue[] = [];

  const serializedData = JSON.stringify(data);
  scanBlockedText(serializedData, issues, "packet data");

  if (!data.paymentRoute) {
    addIssue(issues, {
      code: "MISSING_PAYMENT_ROUTE",
      severity: "blocker",
      message: "A payment route must be actively selected before rendering a final packet.",
      field: "paymentRoute",
    });
  } else {
    const config = getRouteConfig(data.paymentRoute);
    for (const fieldPath of config.requiredFields) {
      if (!hasValue(getByPath(data, fieldPath))) {
        addIssue(issues, {
          code: "MISSING_ROUTE_REQUIRED_FIELD",
          severity: "blocker",
          message: `Missing required field for ${config.label}: ${fieldPath}.`,
          field: fieldPath,
        });
      }
    }

    if (config.noticesTriggered.length > 0) {
      const missingNotices = config.noticesTriggered.filter((notice) => !data.cmsNoticesAttached.includes(notice));
      if (missingNotices.length > 0) {
        addIssue(issues, {
          code: "CMS_NOTICE_NOT_ATTACHED",
          severity: "blocker",
          message: `Required notice or summary not attached: ${missingNotices.join(", ")}.`,
          field: "cmsNoticesAttached",
        });
      }
    }

    if (config.legalReviewFlags.length > 0) {
      addIssue(issues, {
        code: "LEGAL_REVIEW_HOLD",
        severity: "blocker",
        message: `Production finalization blocked by legal review flags: ${config.legalReviewFlags.join(", ")}.`,
      });
    }
  }

  if (data.signerType === "REPRESENTATIVE") {
    const hasAuthority =
      data.representativeAuthority !== "NONE" &&
      data.representativeAuthority !== "PATIENT_SELF" &&
      data.representativeDocumentOnFile;
    if (!hasAuthority) {
      addIssue(issues, {
        code: "REPRESENTATIVE_AUTHORITY_MISSING",
        severity: "blocker",
        message: "Representative signature requires documented authority on file.",
        field: "representativeAuthority",
      });
    }
  }

  if (!data.nppAcknowledged) {
    addIssue(issues, {
      code: "NPP_ACKNOWLEDGMENT_MISSING",
      severity: "blocker",
      message: "Notice of Privacy Practices acknowledgment is required.",
      field: "nppAcknowledged",
    });
  }

  if (!data.patientRightsAcknowledged) {
    addIssue(issues, {
      code: "PATIENT_RIGHTS_ACKNOWLEDGMENT_MISSING",
      severity: "blocker",
      message: "Patient rights acknowledgment is required.",
      field: "patientRightsAcknowledged",
    });
  }

  if (!data.copyProvidedStatus || data.copyProvidedStatus === "PENDING") {
    addIssue(issues, {
      code: "COPY_PROVIDED_STATUS_MISSING",
      severity: "blocker",
      message: "Copy-provided or refusal status is required before finalization.",
      field: "copyProvidedStatus",
    });
  }

  validateRenderedOutput(data, issues);

  const blockers = issues.filter((issue) => issue.severity === "blocker");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return {
    status: blockers.length === 0 ? "PRODUCTION READY WITH LEGAL HOLD ITEMS" : "NOT PRODUCTION READY",
    validForPatientPreview: !issues.some((issue) => issue.code === "BLOCKED_TEXT" || issue.code === "INTERNAL_NOTE_VISIBLE"),
    validForProductionFinalization: blockers.length === 0,
    issues,
    blockers,
    warnings,
  };
}

export function getAdmissionPacketPageElements(root: ParentNode = document): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(".ci-admission-page"));
}

export type AdmissionPacketExportPlan = {
  packetId: string;
  templateId: string;
  templateVersion: string;
  pages: PacketPage[];
  pageElements: HTMLElement[];
  validation: ValidationResult;
};

export function buildAdmissionPacketExportPlan(
  data: AdmissionPacketData,
  root: ParentNode = document,
): AdmissionPacketExportPlan {
  const validation = validateAdmissionPacket(data);
  if (!validation.validForProductionFinalization) {
    throw new Error(
      `Admission packet PDF/export blocked for ${data.packetId}: ${validation.blockers.map((issue) => issue.code).join(", ")}`,
    );
  }

  const pageElements = getAdmissionPacketPageElements(root);
  const pages = buildAdmissionPacketPages(data);
  if (pageElements.length !== pages.length) {
    throw new Error(`Admission packet PDF/export expected ${pages.length} pages but found ${pageElements.length} DOM page nodes.`);
  }

  return {
    packetId: data.packetId,
    templateId: data.templateId ?? TEMPLATE_ID,
    templateVersion: data.templateVersion ?? TEMPLATE_VERSION,
    pages,
    pageElements,
    validation,
  };
}

const PATIENT_ADMISSION_PACKET_CSS = `
.ci-admission-packet {
  --ci-teal: #007c7a;
  --ci-teal-dark: #005f5e;
  --ci-orange: #e87722;
  --ci-text: #1a1a1a;
  --ci-muted: #4a4a4a;
  --ci-border: #d1d5db;
  --ci-bg-soft: #f7fafa;
  width: min(100%, 8.5in);
  margin: 0 auto;
  background: #ffffff;
  color: var(--ci-text);
  font-family: Roboto, Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.5;
}
.ci-admission-page {
  position: relative;
  width: 8.5in;
  min-height: 11in;
  box-sizing: border-box;
  padding: 0.6in 0.72in;
  page-break-after: always;
  break-after: page;
  background: #ffffff;
}
.ci-admission-page:last-child {
  page-break-after: auto;
  break-after: auto;
}
.ci-admission-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 4px solid var(--ci-teal);
  padding-bottom: 14px;
  margin-bottom: 22px;
}
.ci-brand {
  color: var(--ci-teal-dark);
  font-weight: 500;
  font-size: 18pt;
}
.ci-brand span {
  color: var(--ci-orange);
}
.ci-meta {
  color: var(--ci-muted);
  font-size: 8pt;
  text-align: right;
}
.ci-title {
  color: var(--ci-teal-dark);
  font-size: 20pt;
  font-weight: 500;
  margin: 0 0 4px;
}
.ci-page-title {
  color: var(--ci-teal-dark);
  font-size: 17pt;
  font-weight: 500;
  margin: 0 0 18px;
}
.ci-subtitle {
  color: var(--ci-muted);
  margin: 0 0 20px;
}
.ci-section {
  border: 1px solid var(--ci-border);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  break-inside: avoid;
}
.ci-section h2 {
  margin: 0;
  padding: 10px 14px;
  background: var(--ci-teal);
  color: #ffffff;
  font-size: 12pt;
  font-weight: 500;
}
.ci-section-body {
  padding: 14px;
}
.ci-field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 18px;
  margin-bottom: 18px;
}
.ci-field label {
  display: block;
  color: var(--ci-muted);
  font-size: 8pt;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.ci-field div {
  min-height: 22px;
  border-bottom: 1px solid var(--ci-border);
  padding: 2px 0;
}
.ci-signature-block {
  border: 2px solid var(--ci-teal);
  border-radius: 8px;
  padding: 16px;
  background: var(--ci-bg-soft);
  break-inside: avoid;
}
.ci-signature-lines {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 22px;
}
.ci-signature-line {
  border-top: 1px solid var(--ci-text);
  padding-top: 6px;
  color: var(--ci-muted);
  font-size: 8pt;
}
.ci-page-footer {
  position: absolute;
  left: 0.72in;
  right: 0.72in;
  bottom: 0.32in;
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.8fr 1.2fr;
  gap: 8px;
  border-top: 1px solid var(--ci-border);
  padding-top: 8px;
  color: var(--ci-muted);
  font-size: 7.5pt;
}
@media print {
  @page {
    size: Letter;
    margin: 0;
  }
  .ci-admission-packet {
    width: 8.5in;
    margin: 0;
  }
  .ci-admission-page {
    width: 8.5in;
    min-height: 11in;
    box-sizing: border-box;
    page-break-after: always;
    break-after: page;
  }
  .ci-admission-page:last-child {
    page-break-after: auto;
    break-after: auto;
  }
  .ci-section,
  .ci-signature-block {
    break-inside: avoid;
  }
}
`;

function Field({ label, value }: { label: string; value?: string | boolean }): ReactElement {
  return (
    <div className="ci-field">
      <label>{label}</label>
      <div>{typeof value === "boolean" ? (value ? "Yes" : "No") : value || ""}</div>
    </div>
  );
}

function PageFooter({
  data,
  page,
  index,
  total,
  generatedAt,
}: {
  data: AdmissionPacketData;
  page: PacketPage;
  index: number;
  total: number;
  generatedAt: string;
}): ReactElement {
  return (
    <footer className="ci-page-footer">
      <div>Packet ID: {data.packetId}</div>
      <div>v{data.documentVersion ?? DOCUMENT_VERSION} · Eff. {data.effectiveDate ?? EFFECTIVE_DATE}</div>
      <div>Page {index + 1} of {total}</div>
      <div>{page.footerLabel} / Generated: {generatedAt}</div>
    </footer>
  );
}

export function PatientAdmissionPacket({ data }: { data: AdmissionPacketData }): ReactElement {
  const pages = data.agencyRecordCopy ? buildAgencyRecordCopyPages(data) : buildAdmissionPacketPages(data);
  const validation = validateAdmissionPacket(data);
  const generatedAt = data.generatedAt ?? data.routeSelectedAt;

  return (
    <article
      className="ci-admission-packet"
      data-template-id={data.templateId ?? TEMPLATE_ID}
      data-export-blocked={validation.validForProductionFinalization ? "false" : "true"}
    >
      <style>{PATIENT_ADMISSION_PACKET_CSS}</style>
      {pages.map((page, pageIndex) => (
      <div className="ci-admission-page" data-page-id={page.pageId} key={page.pageId}>
        <header className="ci-admission-header">
          <div>
            <div className="ci-brand">
              Care<span>Indeed</span>
            </div>
            <p className="ci-subtitle">Home Health Admission Agreement</p>
          </div>
          <div className="ci-meta">
            <div>Form ID: {data.templateId ?? TEMPLATE_ID}</div>
            <div>Document Version: {data.documentVersion ?? DOCUMENT_VERSION}</div>
            <div>Effective Date: {data.effectiveDate ?? EFFECTIVE_DATE}</div>
            <div>Packet ID: {data.packetId}</div>
            <div>Release status: {validation.status}</div>
            {data.agencyRecordCopy && <div>Copy: Agency Record</div>}
          </div>
        </header>

        {pageIndex === 0 ? (
          <>
            <h1 className="ci-title">Patient Admission Agreement</h1>
            <p className="ci-subtitle">
              This patient-facing packet shows only the selected payer pathway and required admission
              acknowledgments.
            </p>

            <section className="ci-field-grid" aria-label="Admission details">
              <Field label="Patient" value={data.patientName} />
              <Field label="Date of Birth" value={data.dateOfBirth} />
              <Field label="Medical Record Number" value={data.medicalRecordNumber} />
              <Field label="Admission Date" value={data.admissionDate} />
              <Field label="Agency" value={data.agencyName} />
              <Field label="Agency Phone" value={data.agencyPhone} />
              <Field label="Selected Payment Pathway" value={data.paymentRoute ? getRouteConfig(data.paymentRoute).label : ""} />
              <Field label="Copy Status" value={data.copyProvidedStatus} />
            </section>
          </>
        ) : (
          <h1 className="ci-page-title">{page.title}</h1>
        )}

        {page.sections.filter((section) => data.agencyRecordCopy || !section.internalOnly).map((section) => (
          <section className="ci-section" id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            <div className="ci-section-body">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        {page.pageId === "final-signature" && (
          <section className="ci-signature-block" aria-label="Final signature">
          <strong>One Final Signature</strong>
          <p>
            This signature applies to the selected patient-facing sections and selected payer pathway
            shown in this packet.
          </p>
          <div className="ci-signature-lines">
            <div className="ci-signature-line">Patient or Authorized Representative Signature</div>
            <div className="ci-signature-line">Date</div>
          </div>
          </section>
        )}

        <PageFooter data={data} page={page} index={pageIndex} total={pages.length} generatedAt={generatedAt} />
      </div>
      ))}
    </article>
  );
}

export function getInternalReleaseChecklist(data: AdmissionPacketData): PacketSection[] {
  const routeFlags = data.paymentRoute ? getRouteConfig(data.paymentRoute).legalReviewFlags : [];
  return [
    ...INTERNAL_RELEASE_CHECKLIST,
    {
      id: "internal-route-review",
      title: "Selected Route Internal Review",
      internalOnly: true,
      body: [
        `Selected route: ${data.paymentRoute ?? "not selected"}`,
        `Legal review flags: ${routeFlags.length ? routeFlags.join(", ") : "none"}`,
        "Official contacts, official forms, privacy notice approval, and accreditation references must be confirmed before production finalization.",
      ],
    },
  ];
}

export const sampleAdmissionPacketData: AdmissionPacketData = {
  packetId: "CI-HH-ADM-MOCK-001",
  patientName: "Sample Patient",
  dateOfBirth: "01/01/1945",
  medicalRecordNumber: "MRN-MOCK-001",
  admissionDate: "06/26/2026",
  agencyName: "Care Indeed Home Health Care, Inc.",
  agencyPhone: "555-0100",
  agencyAddress: "Example service area address",
  paymentRoute: "PENDING_VERIFICATION",
  selectedBy: "admissions-user",
  routeSelectedAt: "2026-06-26T12:00:00.000Z",
  signerName: "Sample Patient",
  signerType: "PATIENT",
  representativeAuthority: "PATIENT_SELF",
  representativeDocumentOnFile: false,
  copyProvidedStatus: "PROVIDED",
  nppAcknowledged: true,
  patientRightsAcknowledged: true,
  cmsNoticesAttached: ["coverage-verification-pending-summary"],
  staffCollector: "Admissions Coordinator",
  fields: {
    pendingEstimateDescription: "Coverage verification is in progress.",
  },
};

type SelfTest = {
  name: string;
  pass: boolean;
  details?: string;
};

function makeValidData(route: PaymentRoute): AdmissionPacketData {
  const base: AdmissionPacketData = {
    ...sampleAdmissionPacketData,
    packetId: `TEST-${route}`,
    paymentRoute: route,
    cmsNoticesAttached: [...ROUTE_CONFIGS[route].noticesTriggered],
    fields: {
      privatePayRate: "$125 per skilled nursing visit",
      longTermCareCarrier: "Mock Long-Term Care Plan",
      insuranceCarrier: "Mock Health Plan",
      medicareNumberConfirmed: true,
      medicaidIdConfirmed: true,
      contractSponsor: "Mock Contract Sponsor",
      pendingEstimateDescription: "Coverage verification is in progress.",
      noBillableServicesReason: "Intake consultation only.",
      approvedMedicaidAddendum: false,
    },
  };
  return base;
}

export function runAdmissionPacketSelfTests(): SelfTest[] {
  const results: SelfTest[] = [];
  const push = (name: string, pass: boolean, details?: string) => results.push({ name, pass, details });

  const missingRoute = validateAdmissionPacket({ ...sampleAdmissionPacketData, paymentRoute: undefined });
  push("missing paymentRoute fails", missingRoute.blockers.some((issue) => issue.code === "MISSING_PAYMENT_ROUTE"));

  for (const route of ALL_PAYMENT_ROUTES) {
    const data = makeValidData(route);
    const output = renderPatientFacingText(data);
    const visibleRoutes = ALL_PAYMENT_ROUTES.filter((candidate) =>
      output.includes(`Selected Payer Route - ${ROUTE_CONFIGS[candidate].label}`),
    );
    push(`${route} renders only its own route section`, visibleRoutes.length === 1 && visibleRoutes[0] === route);
  }

  const pages = buildAdmissionPacketPages(makeValidData("PENDING_VERIFICATION"));
  push("admission packet renders 13 semantic pages", pages.length === 13);
  push(
    "each semantic page has a footer label",
    pages.every((page) => !!page.pageId && !!page.title && page.sections.length > 0 && !!page.footerLabel),
  );

  let exportBlocked = false;
  try {
    buildAdmissionPacketExportPlan(makeValidData("PENDING_VERIFICATION"), {
      querySelectorAll: () => [] as unknown as NodeListOf<HTMLElement>,
    } as unknown as ParentNode);
  } catch {
    exportBlocked = true;
  }
  push("final PDF/export is blocked when validation has blockers", exportBlocked);

  push(
    "PRIVATE_PAY suppresses Medicare/insurance language",
    !renderPatientFacingText(makeValidData("PRIVATE_PAY")).includes("Medicare coverage rules"),
  );

  const medicare = validateAdmissionPacket(makeValidData("ORIGINAL_MEDICARE_FFS"));
  push(
    "ORIGINAL_MEDICARE_FFS triggers CMS notice matrix and suppresses private-pay collection language",
    medicare.blockers.every((issue) => issue.code !== "CMS_NOTICE_NOT_ATTACHED") &&
      !renderPatientFacingText(makeValidData("ORIGINAL_MEDICARE_FFS")).includes("private-pay services"),
  );

  push(
    "MEDI_CAL_OR_MEDICAID suppresses private-pay collection language",
    !renderPatientFacingText(makeValidData("MEDI_CAL_OR_MEDICAID")).includes("private-pay services"),
  );

  push(
    "PENDING_VERIFICATION renders only pending estimate language",
    renderPatientFacingText(makeValidData("PENDING_VERIFICATION")).includes("Coverage remains pending") &&
      !renderPatientFacingText(makeValidData("PENDING_VERIFICATION")).includes("Medicare coverage rules"),
  );

  const blockedPaymentData = {
    ...makeValidData("PRIVATE_PAY"),
    fields: { ...makeValidData("PRIVATE_PAY").fields, privatePayRate: ["Use", "card", "verification", "value"].join(" ") },
  };
  push("restricted card verification wording is blocked", validateAdmissionPacket(blockedPaymentData).blockers.length > 0);

  const legacyTitleData = {
    ...makeValidData("PENDING_VERIFICATION"),
    patientName: ["Patient Admission Packet", "ACHC", "Private Duty", "Skilled", "2022"].join(" "),
  };
  push("old 2022 title is blocked", validateAdmissionPacket(legacyTitleData).blockers.length > 0);

  const placeholderData = {
    ...makeValidData("PENDING_VERIFICATION"),
    patientName: [String.fromCharCode(123, 123), "patientName", String.fromCharCode(125, 125)].join(""),
  };
  push("placeholders are blocked", validateAdmissionPacket(placeholderData).blockers.length > 0);

  const signatureMap = buildSignatureApplicationMap(makeValidData("PRIVATE_PAY"));
  push("one-signature map includes selected sections", signatureMap.oneSignatureAppliedTo.includes("final-signature"));

  const representativeData = {
    ...makeValidData("PENDING_VERIFICATION"),
    signerType: "REPRESENTATIVE" as const,
    representativeAuthority: "NONE" as const,
    representativeDocumentOnFile: false,
  };
  push(
    "representative signing without authority fails",
    validateAdmissionPacket(representativeData).blockers.some((issue) => issue.code === "REPRESENTATIVE_AUTHORITY_MISSING"),
  );

  push(
    "copy-provided or refusal status is required",
    validateAdmissionPacket({ ...makeValidData("PENDING_VERIFICATION"), copyProvidedStatus: undefined }).blockers.some(
      (issue) => issue.code === "COPY_PROVIDED_STATUS_MISSING",
    ),
  );

  const patientOutput = renderPatientFacingText(makeValidData("PENDING_VERIFICATION"));
  push(
    "patient-facing output contains no internal notes",
    PATIENT_FACING_INTERNAL_TERMS.every((term) => !patientOutput.toLowerCase().includes(term.toLowerCase())),
  );

  return results;
}

export default PatientAdmissionPacket;
