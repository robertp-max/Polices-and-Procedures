import type {
  ControlRisk,
  MasterControlAuditTrailEntry,
  MasterControlCadence,
  MasterControlDocumentationRecord,
  MasterControlDocumentRef,
  MasterControlEvidenceRequirement,
  MasterControlSignoffRequirement,
  MasterControlSourceRecord,
  MasterControlSourceStatus,
  MasterControlVerification,
  MasterControlVerificationLogEntry,
} from '@/policy/types/masterControlInventory';

type DossierSeed = {
  documentRefs?: MasterControlDocumentRef[];
  evidenceRequirements?: MasterControlEvidenceRequirement[];
  signoffRequirements?: MasterControlSignoffRequirement[];
  linkedWorkflowIds?: string[];
  requiredFormIds?: string[];
  modalSummary?: string;
  operatorInstructions?: string;
  surveyorPrompt?: string;
  tags?: string[];
};

export type MissingDocumentationReportRow = {
  controlId: string;
  controlName: string;
  requiredDocumentationMissing: string;
  recommendedDocumentId: string;
  recommendedTitle: string;
  sourceCandidate: string;
  draftingPriority: 'created' | 'high' | 'material';
  ownerRole: string;
  needsClaudeDraft: boolean;
};

const slug = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
const cadenceForRisk = (risk: ControlRisk): MasterControlCadence => risk === 'HIGH' ? 'monthly' : risk === 'MATERIAL' ? 'quarterly' : 'annual';

export function normalizeSourceStatus(status: MasterControlSourceRecord['status']): MasterControlSourceStatus {
  if (status === 'COMPLIANT') return 'COMPLIANT';
  if (status === 'AT_RISK' || status === 'UNDER_REVIEW') return 'AT_RISK';
  if (status === 'NON_COMPLIANT') return 'DEFICIENT';
  return 'UNKNOWN';
}

export function buildDefaultDocumentRefs(source: MasterControlSourceRecord): MasterControlDocumentRef[] {
  const forms = source.data_source.forms_logs.length > 0 ? source.data_source.forms_logs : source.source_policy_ids;
  const primary = forms[0] || source.source_policy_ids[0] || source.id;
  return [
    {
      documentId: `MCDOC-${source.id}-${slug(primary)}`,
      title: `${source.control_name} source document`,
      documentType: primary.includes('FM-') ? 'form' : primary.toLowerCase().includes('log') ? 'log' : 'policy',
      sourceLocation: `${source.data_source.system || 'CI-App'} / ${primary}`,
      ownerRole: source.required_owner,
      required: true,
      templateOnly: true,
      evidenceUse: `Defines the approved source document or template used to operate ${source.id}.`,
    },
  ];
}

function documentationTypeForRef(ref: MasterControlDocumentRef): MasterControlDocumentationRecord['documentType'] {
  if (ref.documentType === 'admission_packet') return 'admission_packet_section';
  if (ref.documentType === 'certificate') return 'other';
  return ref.documentType;
}

export function buildDefaultDocumentationRecord(source: MasterControlSourceRecord, ref: MasterControlDocumentRef): MasterControlDocumentationRecord {
  return {
    documentId: ref.documentId,
    controlId: source.id,
    title: ref.title,
    documentType: documentationTypeForRef(ref),
    sourceLocation: ref.sourceLocation,
    templateOnly: ref.templateOnly,
    version: ref.version ?? 'Controlled template source',
    effectiveDate: ref.effectiveDate ?? 'Current controlled version',
    lastReviewedDate: source.last_verified_date ?? undefined,
    nextReviewDate: source.next_verification_date ?? undefined,
    ownerRole: ref.ownerRole,
    approverRole: source.escalation_owner,
    linkedPolicyIds: source.source_policy_ids,
    linkedWorkflowIds: [`WF-${source.id}`],
    linkedControlIds: [source.id],
    requiredSignoffIds: [`MCSO-${source.id}-${slug(source.required_owner || 'OWNER')}`],
    evidenceRequirementIds: [`MCEV-${source.id}-001`],
    tags: [source.category, source.domain, 'control-documentation'],
    body: [
      {
        sectionId: `${ref.documentId}-PURPOSE`,
        heading: 'Purpose',
        body: `${ref.title} is the controlled template or source documentation used to prove ${source.control_name}.`,
      },
      {
        sectionId: `${ref.documentId}-SURVEY-USE`,
        heading: 'Survey Use',
        body: ref.evidenceUse,
        bullets: [
          'Use this record as template/control documentation only.',
          'Attach completed runtime evidence through the evidence workflow when authorized.',
          'Never store PHI-bearing completed patient records in seed documentation.',
        ],
      },
    ],
  };
}

export function buildDefaultEvidenceRequirements(source: MasterControlSourceRecord, risk: ControlRisk): MasterControlEvidenceRequirement[] {
  const cadence = cadenceForRisk(risk);
  return [
    {
      evidenceId: `MCEV-${source.id}-001`,
      label: `${source.control_name} execution evidence`,
      description: source.evidence_required || `Evidence that ${source.control_name} was performed and reviewed.`,
      acceptableEvidence: [
        source.evidence_required || 'Completed approved form, log, report, export, or signed packet section tied to this control.',
        'System export or packet index showing date, owner, and reviewed status.',
        'Corrective action record when the control found a deficiency.',
      ],
      unacceptableEvidence: [
        'Blank template without execution evidence.',
        'Screenshot without date, owner, or source system context.',
        'Patient-specific PHI-bearing file stored in seed data.',
      ],
      cadence,
      requiredForReadiness: true,
      responsibleRole: source.required_owner,
      dueRule: risk === 'HIGH' ? 'Due before the next monthly verification lock.' : 'Due before the next scheduled verification.',
      retentionRule: 'Retain in the survey evidence packet per policy retention requirements and never seed PHI-bearing completed patient files.',
    },
  ];
}

export function buildDefaultSignoffRequirements(source: MasterControlSourceRecord, risk: ControlRisk): MasterControlSignoffRequirement[] {
  return [
    {
      signoffId: `MCSO-${source.id}-${slug(source.required_owner || 'OWNER')}`,
      role: source.required_owner,
      signerLabel: `${source.required_owner} attestation`,
      cadence: cadenceForRisk(risk),
      requiredForReadiness: risk === 'HIGH',
      attestationText: `I attest that ${source.control_name} evidence was reviewed, deficiencies were corrected or escalated, and survey-ready documentation is retained.`,
    },
  ];
}

export function buildVerification(source: MasterControlSourceRecord, risk: ControlRisk): MasterControlVerification {
  const cadence = cadenceForRisk(risk);
  const frequency = cadence === 'monthly' ? 'Monthly' : cadence === 'quarterly' ? 'Quarterly' : 'Annual';
  return {
    frequency,
    triggerCondition: source.trigger_condition,
    lastVerifiedDate: source.last_verified_date ?? undefined,
    nextVerificationDate: source.next_verification_date ?? undefined,
    escalationOwner: source.escalation_owner,
    overdueRule: `${frequency} verification is overdue when next verification date has passed without required evidence review and sign-off.`,
    readinessFormula: 'OK requires required evidence present, not expired, and required signoffs complete. Seed templates alone cannot produce OK.',
  };
}

export function buildDefaultAuditTrail(source: MasterControlSourceRecord): MasterControlAuditTrailEntry[] {
  return [
    {
      id: `MCAUD-${source.id}-CONFIGURED`,
      eventType: 'status_changed',
      summary: 'Control dossier configured from master control inventory seed.',
      actorRole: 'System',
    },
  ];
}

export function buildVerificationLogTemplates(source: MasterControlSourceRecord): MasterControlVerificationLogEntry[] {
  const isCtrl001 = source.id === 'CTRL-001';
  return [
    {
      logId: `MCVLOG-${source.id}-TEMPLATE-001`,
      controlId: source.id,
      verificationPeriodStart: 'Runtime period start',
      verificationPeriodEnd: 'Runtime period end',
      performedByName: isCtrl001 ? 'Clinical Manager' : source.required_owner,
      performedByRole: isCtrl001 ? 'Clinical Manager' : source.required_owner,
      performedAt: 'Runtime verification date',
      verificationMethod: isCtrl001 ? 'sample_audit' : 'combined',
      evidenceReviewed: isCtrl001
        ? [
            { evidenceId: 'MCEV-CTRL-001-002', title: 'Signed admission consent', status: 'missing', notes: 'Runtime evidence only.' },
            { evidenceId: 'MCEV-CTRL-001-002', title: 'Signed patient rights acknowledgment', status: 'missing', notes: 'Runtime evidence only.' },
            { evidenceId: 'MCEV-CTRL-001-001', title: 'NPP acknowledgment', status: 'missing', notes: 'Runtime evidence only.' },
            { evidenceId: 'MCEV-CTRL-001-001', title: 'Advance directive acknowledgment', status: 'missing', notes: 'Runtime evidence only.' },
            { evidenceId: 'MCEV-CTRL-001-002', title: 'Photo authorization or refusal', status: 'missing', notes: 'Runtime evidence only.' },
            { evidenceId: 'MCEV-CTRL-001-002', title: 'Personal funds authorization or refusal', status: 'missing', notes: 'Runtime evidence only.' },
            { evidenceId: 'MCEV-CTRL-001-002', title: 'Vehicle use authorization or refusal', status: 'missing', notes: 'Runtime evidence only.' },
            { evidenceId: 'MCEV-CTRL-001-002', title: 'Financial responsibility acknowledgment', status: 'missing', notes: 'Runtime evidence only.' },
            { evidenceId: 'MCEV-CTRL-001-003', title: 'Grievance/hotline notice acknowledgment', status: 'missing', notes: 'Runtime evidence only.' },
          ]
        : [{ evidenceId: `MCEV-${source.id}-001`, title: source.evidence_required, status: 'missing', notes: 'Runtime evidence only.' }],
      findingsSummary: 'Template only. No runtime verification has been performed.',
      deficienciesFound: [],
      readinessBefore: 'BLOCKED',
      readinessAfter: 'BLOCKED',
      nextDueDate: source.next_verification_date ?? 'Next scheduled verification date',
      attestationText: isCtrl001
        ? 'I attest that I reviewed the required admission rights documentation for the selected verification period, confirmed whether required acknowledgments were present, and documented any deficiencies or corrective actions.'
        : `I attest that I reviewed ${source.control_name} evidence for the selected verification period and documented deficiencies or corrective actions.`,
      signatureStatus: 'pending',
      auditTrailId: `MCAUD-${source.id}-VERIFICATION-TEMPLATE`,
    },
  ];
}

const ctrl001AdmissionConsentRef: MasterControlDocumentRef = {
  documentId: 'MCDOC-CTRL-001-ADMISSION-CONSENT',
  title: 'Admission Consent / Agreement / Acknowledgment',
  documentType: 'admission_packet',
  sourceLocation: 'Admission packet consent, agreement, and acknowledgment section',
  ownerRole: 'Clinical Manager',
  required: true,
  templateOnly: true,
  evidenceUse: 'Proves the admission packet includes consent to receive services and patient or representative acknowledgment of agency terms.',
};

const ctrl001HipaaAcknowledgmentRef: MasterControlDocumentRef = {
  documentId: 'MCDOC-CTRL-001-HIPAA-NPP-ACKNOWLEDGMENT',
  title: 'HIPAA Notice of Privacy Practices Acknowledgment',
  documentType: 'form',
  sourceLocation: 'Admission packet HIPAA NPP acknowledgment section / HIPAA-NPP-Log',
  ownerRole: 'Privacy Officer',
  required: true,
  templateOnly: true,
  evidenceUse: 'Proves the patient or representative is asked to acknowledge receipt of the Notice of Privacy Practices or that refusal/attempt is documented.',
};

const ctrl001AdvanceDirectiveNoticeRef: MasterControlDocumentRef = {
  documentId: 'MCDOC-CTRL-001-ADVANCE-DIRECTIVE-NOTICE',
  title: 'Advance Directive Notice and Acknowledgment',
  documentType: 'admission_packet',
  sourceLocation: 'Admission packet advance directive notice and acknowledgment section',
  ownerRole: 'Clinical Manager',
  required: true,
  templateOnly: true,
  evidenceUse: 'Proves the admission packet informs patients of advance directive rights and records patient or representative acknowledgment.',
};

const ctrl001PhotoAuthorizationRef: MasterControlDocumentRef = {
  documentId: 'MCDOC-CTRL-001-PHOTO-AUTHORIZATION',
  title: 'Permission to Photograph for Care Purposes',
  documentType: 'form',
  sourceLocation: 'Admission packet permission to photograph section',
  ownerRole: 'Clinical Manager',
  required: true,
  templateOnly: true,
  evidenceUse: 'Proves the agency obtains authorization or refusal before taking patient photographs for permitted care purposes.',
};

const ctrl001PersonalFundsAuthorizationRef: MasterControlDocumentRef = {
  documentId: 'MCDOC-CTRL-001-PERSONAL-FUNDS-AUTHORIZATION',
  title: 'Personal Funds Authorization / Refusal',
  documentType: 'form',
  sourceLocation: 'Admission packet personal funds authorization/refusal section',
  ownerRole: 'Clinical Manager',
  required: true,
  templateOnly: true,
  evidenceUse: 'Proves the agency records whether staff may assist with or access patient personal funds when applicable.',
};

const ctrl001VehicleAuthorizationRef: MasterControlDocumentRef = {
  documentId: 'MCDOC-CTRL-001-VEHICLE-AUTHORIZATION',
  title: 'Vehicle Use Authorization / Refusal',
  documentType: 'form',
  sourceLocation: 'Admission packet vehicle use authorization/refusal section',
  ownerRole: 'Clinical Manager',
  required: true,
  templateOnly: true,
  evidenceUse: 'Proves the agency records whether patient vehicle use is authorized, refused, or not applicable before any staff use.',
};

const ctrl001FinancialResponsibilityRef: MasterControlDocumentRef = {
  documentId: 'MCDOC-CTRL-001-FINANCIAL-RESPONSIBILITY',
  title: 'Consumer Liability for Payment / Financial Responsibility Notice',
  documentType: 'notice',
  sourceLocation: 'Admission packet financial responsibility and selected payer route section',
  ownerRole: 'Administrator / Billing',
  required: true,
  templateOnly: true,
  evidenceUse: 'Proves the agency gives payment-route and patient financial responsibility notice before or during admission.',
};

const ctrl001Batch1DocumentRefs: MasterControlDocumentRef[] = [
  ctrl001AdmissionConsentRef,
  ctrl001HipaaAcknowledgmentRef,
  ctrl001AdvanceDirectiveNoticeRef,
  ctrl001PhotoAuthorizationRef,
  ctrl001PersonalFundsAuthorizationRef,
  ctrl001VehicleAuthorizationRef,
  ctrl001FinancialResponsibilityRef,
];

function templateOnlyNoPhiSection(sectionId: string): MasterControlDocumentationRecord['body'][number] {
  return {
    sectionId,
    heading: 'Template-only / no-PHI warning',
    body: 'This is template/control documentation only. Do not store completed patient packets, patient names, signatures, dates of birth, medical record numbers, addresses, phone numbers, payer identifiers, photographs, vehicle identifiers, financial account information, or other PHI in seed data. Completed patient documents attach only as authorized runtime evidence.',
  };
}

function buildCtrl001TemplateRecord({
  ref,
  body,
  approverRole,
  linkedPolicyIds,
  requiredSignoffIds,
  evidenceRequirementIds,
  tags,
}: {
  ref: MasterControlDocumentRef;
  body: MasterControlDocumentationRecord['body'];
  approverRole: string;
  linkedPolicyIds: string[];
  requiredSignoffIds: string[];
  evidenceRequirementIds: string[];
  tags: string[];
}): MasterControlDocumentationRecord {
  return {
    documentId: ref.documentId,
    controlId: 'CTRL-001',
    title: ref.title,
    documentType: documentationTypeForRef(ref),
    sourceLocation: ref.sourceLocation,
    templateOnly: true,
    version: 'Template controlled by admission packet source',
    effectiveDate: 'Current controlled template',
    nextReviewDate: 'Next annual admission packet review',
    ownerRole: ref.ownerRole,
    approverRole,
    linkedPolicyIds,
    linkedWorkflowIds: ['WF-CTRL-001'],
    linkedControlIds: ['CTRL-001'],
    body,
    requiredSignoffIds,
    evidenceRequirementIds,
    tags: [...tags, 'admission-packet', 'template-only', 'no-phi'],
  };
}

const ctrl001: DossierSeed = {
  documentRefs: [
    {
      documentId: 'MCDOC-CTRL-001-PATIENT-BILL-OF-RIGHTS',
      title: 'Patient Bill of Rights / Client Rights & Responsibilities',
      documentType: 'admission_packet',
      sourceLocation: 'Patient Admission Packet ACHC Private Duty Skilled 2022, Client Rights and Responsibilities section',
      ownerRole: 'Clinical Manager / Privacy Officer',
      required: true,
      templateOnly: true,
      evidenceUse: 'Proves the agency maintains a written patient/client rights notice and collects patient/representative acknowledgment.',
    },
    {
      documentId: 'MCDOC-CTRL-001-HIPAA-NPP',
      title: 'HIPAA Notice of Privacy Practices',
      documentType: 'notice',
      sourceLocation: 'Admission packet HIPAA NPP section / HIPAA-NPP-Log',
      ownerRole: 'Privacy Officer',
      required: true,
      templateOnly: true,
      evidenceUse: 'Proves current NPP availability and delivery tracking.',
    },
    {
      documentId: 'MCDOC-CTRL-001-ADVANCE-DIRECTIVE',
      title: 'Advance Directive Information Notice',
      documentType: 'admission_packet',
      sourceLocation: 'Admission packet advance directive section',
      ownerRole: 'Clinical Manager',
      required: true,
      templateOnly: true,
      evidenceUse: 'Proves admission notices include advance directive information.',
    },
    ...ctrl001Batch1DocumentRefs,
  ],
  evidenceRequirements: [
    {
      evidenceId: 'MCEV-CTRL-001-001',
      label: 'Admission packet template current and approved',
      description: 'Approved non-PHI admission packet template includes Patient Rights / Client Rights & Responsibilities, consent, NPP, and advance directive notices.',
      acceptableEvidence: ['Approved admission packet template', 'Version approval record', 'Policy-to-packet crosswalk'],
      unacceptableEvidence: ['Completed patient packet in seed data', 'Draft packet without approval', 'Template missing rights acknowledgment'],
      cadence: 'annual',
      requiredForReadiness: true,
      responsibleRole: 'Clinical Manager / Privacy Officer',
      dueRule: 'Due annually and whenever admission packet language changes.',
      retentionRule: 'Retain approved template and version approval record; do not store patient PHI in seed data.',
    },
    {
      evidenceId: 'MCEV-CTRL-001-002',
      label: 'Patient/representative signed rights acknowledgment per admission',
      description: 'Runtime evidence that each admission has patient or authorized representative acknowledgment.',
      acceptableEvidence: ['Runtime signed acknowledgment record', 'EHR admission packet completion export', 'PHI-authorized completed packet link'],
      unacceptableEvidence: ['Seeded patient PDF', 'Unsigned blank template', 'Checklist without signer/date'],
      cadence: 'per_admission',
      requiredForReadiness: true,
      responsibleRole: 'Admitting Clinician',
      dueRule: 'Due before or at the first billable visit unless delayed per policy exception.',
      retentionRule: 'Retain in patient chart and survey packet index under PHI-safe authorization.',
    },
    {
      evidenceId: 'MCEV-CTRL-001-003',
      label: 'Monthly sample audit of admission packets',
      description: 'Monthly audit verifies sampled admissions contain signed rights acknowledgment and NPP delivery evidence.',
      acceptableEvidence: ['Monthly admission packet audit log', 'Sample list with pass/fail result', 'Reviewer attestation'],
      unacceptableEvidence: ['Anecdotal confirmation', 'Audit without sample population', 'Audit older than current cadence'],
      cadence: 'monthly',
      requiredForReadiness: true,
      responsibleRole: 'Clinical Manager',
      dueRule: 'Due by the monthly compliance close date.',
      retentionRule: 'Retain audit log and deficiency corrections in compliance evidence packet.',
    },
    {
      evidenceId: 'MCEV-CTRL-001-004',
      label: 'Corrective action log for missing/incomplete rights acknowledgment',
      description: 'Deficiencies found during audit are corrected, escalated, and tracked to closure.',
      acceptableEvidence: ['Corrective action log', 'Escalation note', 'Closed remediation task'],
      unacceptableEvidence: ['Unresolved exception without owner', 'Correction note without closure date'],
      cadence: 'triggered',
      requiredForReadiness: true,
      responsibleRole: 'Clinical Manager / Privacy Officer',
      dueRule: 'Due whenever an admission packet deficiency is found.',
      retentionRule: 'Retain with monthly audit and QAPI escalation evidence when systemic.',
    },
  ],
  signoffRequirements: [
    {
      signoffId: 'MCSO-CTRL-001-CLINICAL-MANAGER',
      role: 'Clinical Manager',
      signerLabel: 'Monthly admission packet rights attestation',
      cadence: 'monthly',
      requiredForReadiness: true,
      attestationText: 'I attest that sampled admissions contain the required Patient Rights / Client Rights & Responsibilities acknowledgment, signed by the patient or authorized representative, and that deficiencies were corrected or escalated.',
    },
    {
      signoffId: 'MCSO-CTRL-001-PRIVACY-OFFICER',
      role: 'Privacy Officer',
      signerLabel: 'Annual notice currency attestation',
      cadence: 'annual',
      requiredForReadiness: true,
      attestationText: 'I attest that the Patient Rights / Client Rights & Responsibilities notice, HIPAA NPP, and related admission notices are current, available, and aligned with applicable policy requirements.',
    },
    {
      signoffId: 'MCSO-CTRL-001-ADMIN-BILLING',
      role: 'Administrator / Billing',
      signerLabel: 'Annual financial responsibility notice attestation',
      cadence: 'annual',
      requiredForReadiness: true,
      attestationText: 'I attest that admission packet financial responsibility notices are current, route-specific when required, and retained as template documentation while completed patient acknowledgments remain runtime evidence only.',
    },
  ],
  modalSummary: 'Admission rights dossier linking non-PHI packet templates, runtime signed acknowledgments, monthly sampling, correction tracking, and owner sign-off.',
  surveyorPrompt: 'Show how the agency gives patients their rights notice, NPP, and admission consent, and how you know every admission was acknowledged.',
  operatorInstructions: 'Maintain template approvals here. Attach completed patient acknowledgments only as PHI-authorized runtime evidence, never as seed data.',
  tags: ['admission', 'patient-rights', 'hipaa', 'template-only'],
};

const ctrl001Batch1DocumentationRecords: MasterControlDocumentationRecord[] = [
  buildCtrl001TemplateRecord({
    ref: ctrl001AdmissionConsentRef,
    approverRole: 'Administrator',
    linkedPolicyIds: ['CL-PA-001', 'CL-PA-004', 'CO-HP-001'],
    requiredSignoffIds: ['MCSO-CTRL-001-CLINICAL-MANAGER'],
    evidenceRequirementIds: ['MCEV-CTRL-001-001', 'MCEV-CTRL-001-002', 'MCEV-CTRL-001-003'],
    tags: ['admission-consent', 'acknowledgment'],
    body: [
      {
        sectionId: 'ADMISSION-CONSENT-PURPOSE',
        heading: 'Purpose',
        body: 'Admission consent confirms that the patient or authorized representative received the required admission information, agreed to begin agency services, and understands the core terms of care before services proceed.',
      },
      {
        sectionId: 'ADMISSION-CONSENT-REQUIRED-CONTENT',
        heading: 'Required Content',
        body: 'The controlled template must present the required admission agreement content in language the patient or representative can understand.',
        bullets: [
          'Agency name, contact information, and services being admitted.',
          'Consent to receive home health services and participate in the plan of care.',
          'Acknowledgment that required rights, privacy, advance directive, grievance, emergency, and financial notices were provided when applicable.',
          'Right to ask questions, refuse services, or withdraw consent according to policy.',
          'Expected patient or representative cooperation with scheduling, safe access to the home, and communication of changes in condition.',
        ],
      },
      {
        sectionId: 'ADMISSION-CONSENT-ACKNOWLEDGMENT',
        heading: 'Patient/Representative Acknowledgment Requirement',
        body: 'Completed admission consent must be signed and dated at runtime by the patient or authorized representative before or at initiation of services, unless a documented policy exception applies.',
        bullets: [
          'Capture signer role when the signer is an authorized representative.',
          'Document interpreter or accommodation use when needed.',
          'Route unsigned, incomplete, or delayed consent to the responsible clinical manager for correction.',
        ],
      },
      {
        sectionId: 'ADMISSION-CONSENT-RUNTIME-EVIDENCE',
        heading: 'Runtime Evidence Expectations',
        body: 'Acceptable runtime evidence includes the signed admission consent, EHR admission packet completion export, PHI-authorized completed packet link, and monthly sample audit result. Blank templates are not execution evidence.',
      },
      {
        sectionId: 'ADMISSION-CONSENT-SURVEYOR',
        heading: 'Surveyor Explanation',
        body: 'This record proves that the agency maintains a controlled admission consent template. Survey proof of execution comes from authorized runtime signed acknowledgments and audit results, not from seeded patient documents.',
      },
      templateOnlyNoPhiSection('ADMISSION-CONSENT-TEMPLATE-NO-PHI'),
    ],
  }),
  buildCtrl001TemplateRecord({
    ref: ctrl001HipaaAcknowledgmentRef,
    approverRole: 'Privacy Officer',
    linkedPolicyIds: ['CO-HP-001', 'CO-HP-101'],
    requiredSignoffIds: ['MCSO-CTRL-001-PRIVACY-OFFICER'],
    evidenceRequirementIds: ['MCEV-CTRL-001-001', 'MCEV-CTRL-001-002', 'MCEV-CTRL-001-003'],
    tags: ['hipaa', 'npp-acknowledgment'],
    body: [
      {
        sectionId: 'HIPAA-NPP-ACK-PURPOSE',
        heading: 'Purpose',
        body: 'HIPAA NPP acknowledgment documents that the agency asks the patient or authorized representative to acknowledge receipt of the Notice of Privacy Practices at admission or by an approved delivery process.',
      },
      {
        sectionId: 'HIPAA-NPP-ACK-REQUIRED-CONTENT',
        heading: 'Required Content',
        body: 'The controlled acknowledgment template must support clear documentation of NPP delivery and patient or representative response.',
        bullets: [
          'Current Notice of Privacy Practices version or source reference.',
          'Delivery method, such as paper packet, electronic packet, mailed notice, or documented offer.',
          'Acknowledgment, refusal, unable-to-obtain, or delayed acknowledgment option.',
          'Staff documentation path for refusal or inability to obtain acknowledgment.',
          'Privacy Officer ownership and annual currency review.',
        ],
      },
      {
        sectionId: 'HIPAA-NPP-ACK-ACKNOWLEDGMENT',
        heading: 'Patient/Representative Acknowledgment Requirement',
        body: 'The completed runtime record must show whether the patient or representative acknowledged receipt, refused to sign, or could not provide acknowledgment, with the staff attempt documented.',
      },
      {
        sectionId: 'HIPAA-NPP-ACK-RUNTIME-EVIDENCE',
        heading: 'Runtime Evidence Expectations',
        body: 'Acceptable runtime evidence includes signed NPP acknowledgment, documented refusal or attempt, NPP delivery log, admission packet export, and sample audit results. No completed patient acknowledgment is seeded here.',
      },
      {
        sectionId: 'HIPAA-NPP-ACK-SURVEYOR',
        heading: 'Surveyor Explanation',
        body: 'This record proves the agency maintains a controlled NPP acknowledgment mechanism. Surveyors should review runtime evidence to confirm delivery and acknowledgment attempts for actual admissions.',
      },
      templateOnlyNoPhiSection('HIPAA-NPP-ACK-TEMPLATE-NO-PHI'),
    ],
  }),
  buildCtrl001TemplateRecord({
    ref: ctrl001AdvanceDirectiveNoticeRef,
    approverRole: 'Administrator',
    linkedPolicyIds: ['CL-PA-001', 'CL-PA-004'],
    requiredSignoffIds: ['MCSO-CTRL-001-CLINICAL-MANAGER'],
    evidenceRequirementIds: ['MCEV-CTRL-001-001', 'MCEV-CTRL-001-002', 'MCEV-CTRL-001-003'],
    tags: ['advance-directive', 'acknowledgment'],
    body: [
      {
        sectionId: 'ADVANCE-DIRECTIVE-NOTICE-PURPOSE',
        heading: 'Purpose',
        body: 'Advance directive notice and acknowledgment confirms that the patient or authorized representative was informed of advance directive rights and that the patient choice was documented at admission.',
      },
      {
        sectionId: 'ADVANCE-DIRECTIVE-NOTICE-REQUIRED-CONTENT',
        heading: 'Required Content',
        body: 'The controlled notice must present the required advance directive options without directing or pressuring the patient choice.',
        bullets: [
          'Patient has an existing advance directive.',
          'Patient does not have an advance directive.',
          'Patient requests additional information.',
          'Patient declines discussion or cannot respond at admission.',
          'Clinical escalation path when DNR, POLST, or other directive information is presented.',
        ],
      },
      {
        sectionId: 'ADVANCE-DIRECTIVE-NOTICE-ACKNOWLEDGMENT',
        heading: 'Patient/Representative Acknowledgment Requirement',
        body: 'The completed runtime record must capture that advance directive information was provided and must record the selected option, signer, signer role when applicable, and date.',
      },
      {
        sectionId: 'ADVANCE-DIRECTIVE-NOTICE-RUNTIME-EVIDENCE',
        heading: 'Runtime Evidence Expectations',
        body: 'Acceptable runtime evidence includes signed advance directive acknowledgment, EHR admission packet export, PHI-authorized completed packet link, and audit results showing the acknowledgment was present.',
      },
      {
        sectionId: 'ADVANCE-DIRECTIVE-NOTICE-SURVEYOR',
        heading: 'Surveyor Explanation',
        body: 'This record proves the agency maintains controlled advance directive notice language. Runtime evidence proves whether the notice was provided and acknowledged for actual admissions.',
      },
      templateOnlyNoPhiSection('ADVANCE-DIRECTIVE-NOTICE-TEMPLATE-NO-PHI'),
    ],
  }),
  buildCtrl001TemplateRecord({
    ref: ctrl001PhotoAuthorizationRef,
    approverRole: 'Administrator / Privacy Officer',
    linkedPolicyIds: ['CL-PA-001', 'CO-HP-001'],
    requiredSignoffIds: ['MCSO-CTRL-001-CLINICAL-MANAGER', 'MCSO-CTRL-001-PRIVACY-OFFICER'],
    evidenceRequirementIds: ['MCEV-CTRL-001-001', 'MCEV-CTRL-001-002', 'MCEV-CTRL-001-003'],
    tags: ['photo-authorization', 'privacy'],
    body: [
      {
        sectionId: 'PHOTO-AUTHORIZATION-PURPOSE',
        heading: 'Purpose',
        body: 'Permission to photograph documents whether the patient or authorized representative permits photographs for care-related purposes, such as wound documentation or clinical progress tracking, when clinically appropriate.',
      },
      {
        sectionId: 'PHOTO-AUTHORIZATION-REQUIRED-CONTENT',
        heading: 'Required Content',
        body: 'The controlled template must limit photo use to permitted care purposes and must support either authorization, refusal, or not-applicable documentation.',
        bullets: [
          'Photo purpose limitation for care, treatment, documentation, or quality review as permitted by policy.',
          'Authorization, refusal, revocation, or not-applicable selection.',
          'Statement that photographs are protected health information when tied to patient care.',
          'Storage and access route through approved clinical or evidence systems only.',
          'Instruction that marketing or public use requires a separate authorization when applicable.',
        ],
      },
      {
        sectionId: 'PHOTO-AUTHORIZATION-ACKNOWLEDGMENT',
        heading: 'Patient/Representative Acknowledgment Requirement',
        body: 'The completed runtime record must capture patient or representative selection, signature when authorization is granted or refused, date, and any limitations documented by the patient.',
      },
      {
        sectionId: 'PHOTO-AUTHORIZATION-RUNTIME-EVIDENCE',
        heading: 'Runtime Evidence Expectations',
        body: 'Acceptable runtime evidence includes signed photo authorization/refusal, clinical documentation showing authorized photo handling, audit result, or documented revocation. No patient photographs are stored in seed documentation.',
      },
      {
        sectionId: 'PHOTO-AUTHORIZATION-SURVEYOR',
        heading: 'Surveyor Explanation',
        body: 'This record proves the agency maintains controlled photo authorization language. Surveyors should review runtime records to verify authorization or refusal before patient photographs are used as care evidence.',
      },
      templateOnlyNoPhiSection('PHOTO-AUTHORIZATION-TEMPLATE-NO-PHI'),
    ],
  }),
  buildCtrl001TemplateRecord({
    ref: ctrl001PersonalFundsAuthorizationRef,
    approverRole: 'Administrator',
    linkedPolicyIds: ['CL-PA-001', 'CL-PA-004'],
    requiredSignoffIds: ['MCSO-CTRL-001-CLINICAL-MANAGER'],
    evidenceRequirementIds: ['MCEV-CTRL-001-001', 'MCEV-CTRL-001-002', 'MCEV-CTRL-001-003'],
    tags: ['personal-funds', 'authorization-refusal'],
    body: [
      {
        sectionId: 'PERSONAL-FUNDS-PURPOSE',
        heading: 'Purpose',
        body: 'Personal funds authorization/refusal documents whether agency personnel may assist with patient funds or financial transactions when a care-related need is identified and permitted by policy.',
      },
      {
        sectionId: 'PERSONAL-FUNDS-REQUIRED-CONTENT',
        heading: 'Required Content',
        body: 'The controlled template must clearly separate authorization, refusal, and not-applicable choices and must discourage unauthorized staff access to patient funds.',
        bullets: [
          'Authorization scope, if any, limited to the specific assistance permitted by policy.',
          'Refusal or not-applicable option when staff will not handle funds.',
          'Requirement for representative involvement when applicable.',
          'Escalation path for suspected financial exploitation, coercion, or unsafe fund handling.',
          'Prohibition against staff borrowing, accepting, or using patient funds outside approved policy.',
        ],
      },
      {
        sectionId: 'PERSONAL-FUNDS-ACKNOWLEDGMENT',
        heading: 'Patient/Representative Acknowledgment Requirement',
        body: 'The completed runtime record must capture patient or representative choice, signature when applicable, date, and any limitations or representative instructions.',
      },
      {
        sectionId: 'PERSONAL-FUNDS-RUNTIME-EVIDENCE',
        heading: 'Runtime Evidence Expectations',
        body: 'Acceptable runtime evidence includes signed authorization/refusal, documented not-applicable selection, escalation note, and audit result. No account numbers, balances, or personal financial details are stored in seed data.',
      },
      {
        sectionId: 'PERSONAL-FUNDS-SURVEYOR',
        heading: 'Surveyor Explanation',
        body: 'This record proves the agency maintains controlled personal funds authorization language. Runtime evidence proves whether staff involvement with funds was authorized, refused, or not applicable.',
      },
      templateOnlyNoPhiSection('PERSONAL-FUNDS-TEMPLATE-NO-PHI'),
    ],
  }),
  buildCtrl001TemplateRecord({
    ref: ctrl001VehicleAuthorizationRef,
    approverRole: 'Administrator / Risk Manager',
    linkedPolicyIds: ['CL-PA-001', 'RM-OS-004'],
    requiredSignoffIds: ['MCSO-CTRL-001-CLINICAL-MANAGER'],
    evidenceRequirementIds: ['MCEV-CTRL-001-001', 'MCEV-CTRL-001-002', 'MCEV-CTRL-001-003'],
    tags: ['vehicle-authorization', 'risk'],
    body: [
      {
        sectionId: 'VEHICLE-AUTHORIZATION-PURPOSE',
        heading: 'Purpose',
        body: 'Vehicle use authorization/refusal documents whether patient vehicle use by agency personnel is authorized, refused, or not applicable before any staff use occurs.',
      },
      {
        sectionId: 'VEHICLE-AUTHORIZATION-REQUIRED-CONTENT',
        heading: 'Required Content',
        body: 'The controlled template must define the patient choice and risk controls for any patient vehicle use.',
        bullets: [
          'Authorization, refusal, or not-applicable selection.',
          'Permitted purpose and limits of any vehicle use.',
          'Instruction that authorization does not override agency driver, insurance, safety, or risk policies.',
          'Escalation path for transportation-related safety concerns.',
          'Revocation or change process when the patient or representative changes the decision.',
        ],
      },
      {
        sectionId: 'VEHICLE-AUTHORIZATION-ACKNOWLEDGMENT',
        heading: 'Patient/Representative Acknowledgment Requirement',
        body: 'The completed runtime record must capture patient or representative decision, signature when applicable, date, and any stated limitations. Staff may not treat a blank template as authorization.',
      },
      {
        sectionId: 'VEHICLE-AUTHORIZATION-RUNTIME-EVIDENCE',
        heading: 'Runtime Evidence Expectations',
        body: 'Acceptable runtime evidence includes signed authorization/refusal, documented not-applicable selection, risk escalation note, and audit result. Vehicle identifiers or patient travel details are runtime evidence only.',
      },
      {
        sectionId: 'VEHICLE-AUTHORIZATION-SURVEYOR',
        heading: 'Surveyor Explanation',
        body: 'This record proves the agency maintains a controlled vehicle use authorization template. Runtime evidence proves whether authorization existed before any patient vehicle use.',
      },
      templateOnlyNoPhiSection('VEHICLE-AUTHORIZATION-TEMPLATE-NO-PHI'),
    ],
  }),
  buildCtrl001TemplateRecord({
    ref: ctrl001FinancialResponsibilityRef,
    approverRole: 'Administrator / Billing',
    linkedPolicyIds: ['CL-PA-001', 'FN-BL-004', 'FN-BL-005'],
    requiredSignoffIds: ['MCSO-CTRL-001-ADMIN-BILLING'],
    evidenceRequirementIds: ['MCEV-CTRL-001-001', 'MCEV-CTRL-001-002', 'MCEV-CTRL-001-003'],
    tags: ['financial-responsibility', 'payer-route'],
    body: [
      {
        sectionId: 'FINANCIAL-RESPONSIBILITY-PURPOSE',
        heading: 'Purpose',
        body: 'Consumer liability for payment/financial responsibility notice documents that the patient or representative receives payment-route and potential patient responsibility information before or during admission.',
      },
      {
        sectionId: 'FINANCIAL-RESPONSIBILITY-REQUIRED-CONTENT',
        heading: 'Required Content',
        body: 'The controlled template must support payer-route selection and clear notice of patient financial responsibility without storing patient-specific payer data in the registry.',
        bullets: [
          'Selected payment pathway or pending-verification status.',
          'Notice that coverage, limitations, and patient responsibility depend on payer verification and applicable program rules.',
          'Private-pay, insurance, Medicaid/Medi-Cal, Medicare Advantage, original Medicare, contract payer, or not-applicable route language when applicable.',
          'Instruction that final payment responsibility is confirmed through runtime verification and authorized billing workflows.',
          'Contact route for billing questions and financial counseling when applicable.',
        ],
      },
      {
        sectionId: 'FINANCIAL-RESPONSIBILITY-ACKNOWLEDGMENT',
        heading: 'Patient/Representative Acknowledgment Requirement',
        body: 'The completed runtime record must capture the patient or representative acknowledgment of the applicable financial responsibility notice, signer role when applicable, and date.',
      },
      {
        sectionId: 'FINANCIAL-RESPONSIBILITY-RUNTIME-EVIDENCE',
        heading: 'Runtime Evidence Expectations',
        body: 'Acceptable runtime evidence includes signed financial responsibility notice, selected payer route record, eligibility/coverage verification output, PHI-authorized completed packet link, and sample audit result.',
      },
      {
        sectionId: 'FINANCIAL-RESPONSIBILITY-SURVEYOR',
        heading: 'Surveyor Explanation',
        body: 'This record proves the agency maintains controlled financial responsibility notice language. Runtime evidence proves which payment route and acknowledgment applied to a specific admission.',
      },
      templateOnlyNoPhiSection('FINANCIAL-RESPONSIBILITY-TEMPLATE-NO-PHI'),
    ],
  }),
];

const ctrl001Documentation: MasterControlDocumentationRecord[] = [
  {
    documentId: 'MCDOC-CTRL-001-PATIENT-BILL-OF-RIGHTS',
    controlId: 'CTRL-001',
    title: 'Patient Bill of Rights / Client Rights & Responsibilities',
    documentType: 'admission_packet_section',
    sourceLocation: 'Patient Admission Packet template - Patient Rights and Responsibilities / Client Rights and Responsibilities section',
    templateOnly: true,
    version: 'Template controlled by admission packet source',
    effectiveDate: 'Current controlled template',
    lastReviewedDate: undefined,
    nextReviewDate: 'Next annual admission packet review',
    ownerRole: 'Clinical Manager / Privacy Officer',
    approverRole: 'Administrator',
    linkedPolicyIds: ['CL-PA-001', 'CL-PA-004', 'CO-HP-001', 'CO-HP-101'],
    linkedWorkflowIds: ['WF-CTRL-001'],
    linkedControlIds: ['CTRL-001'],
    requiredSignoffIds: ['MCSO-CTRL-001-CLINICAL-MANAGER', 'MCSO-CTRL-001-PRIVACY-OFFICER'],
    evidenceRequirementIds: ['MCEV-CTRL-001-001', 'MCEV-CTRL-001-002', 'MCEV-CTRL-001-003', 'MCEV-CTRL-001-004'],
    tags: ['admission-packet', 'patient-rights', 'template-only', 'no-phi'],
    body: [
      {
        sectionId: 'PBOR-PURPOSE',
        heading: 'Purpose',
        body: 'This document confirms that Care Indeed maintains and provides written patient/client rights and responsibilities information during admission and obtains patient or authorized representative acknowledgment.',
      },
      {
        sectionId: 'PBOR-RIGHTS',
        heading: 'Patient / Client Rights',
        body: 'Patients and clients are informed of their rights before or during admission and may exercise those rights without retaliation.',
        bullets: [
          'Right to honest and ethical care.',
          'Right to be informed of services furnished and services not furnished.',
          'Right to participate in care planning.',
          'Right to refuse treatment or terminate services.',
          'Right to privacy and confidentiality.',
          'Right to be informed of charges before care begins.',
          'Right to receive nondiscriminatory care.',
          'Right to voice complaints or grievances without retaliation.',
          'Right to be informed of the complaint/grievance process, including hotline information.',
          'Right to receive advance directive information.',
          'Right to receive emergency/disaster preparedness information.',
          'Right to receive Notice of Privacy Practices information.',
          'Right to receive abuse, neglect, and exploitation reporting information.',
        ],
      },
      {
        sectionId: 'PBOR-RESPONSIBILITIES',
        heading: 'Patient / Client Responsibilities',
        body: 'Patients, clients, and authorized representatives are asked to support safe care by sharing information and participating in the plan of care.',
        bullets: [
          'Provide accurate and complete medical/history information.',
          'Report unexpected changes in condition.',
          'Ask questions when instructions or care plans are not understood.',
          'Follow the plan of care or accept responsibility for refusal/nonadherence.',
          'Fulfill financial obligations.',
          'Respect agency staff and their rights.',
          'Notify the agency in advance of missed or cancelled visits.',
          'Participate in care to the extent possible.',
          'Comply with agency rules and updates.',
        ],
      },
      {
        sectionId: 'PBOR-EVIDENCE',
        heading: 'Required Acknowledgment Evidence',
        body: 'Completed acknowledgment evidence is collected at runtime. This seed record contains template/control documentation only.',
        table: [
          { 'Required Field': 'Patient or Representative Name', 'Evidence Expectation': 'Captured at runtime only' },
          { 'Required Field': 'Signature', 'Evidence Expectation': 'Required on completed admission packet' },
          { 'Required Field': 'Representative Relationship', 'Evidence Expectation': 'Required when signed by authorized representative' },
          { 'Required Field': 'Date Signed', 'Evidence Expectation': 'Required' },
          { 'Required Field': 'Admission Packet Version', 'Evidence Expectation': 'Required' },
          { 'Required Field': 'Runtime Evidence ID', 'Evidence Expectation': 'Generated by evidence system' },
          { 'Required Field': 'PHI Handling', 'Evidence Expectation': 'Completed patient packet must never be stored in seed data' },
        ],
      },
      {
        sectionId: 'PBOR-SURVEYOR',
        heading: 'Surveyor Explanation',
        body: 'This document proves that the agency maintains a written patient/client rights notice as part of the admission packet. Completed and signed patient copies must be attached as runtime evidence only. Monthly sample audits validate that acknowledgments are complete and deficiencies are corrected.',
      },
      {
        sectionId: 'PBOR-TEMPLATE-NO-PHI',
        heading: 'Template-only / no-PHI warning',
        body: 'This seed record is template/control documentation only. Do not include completed patient packets, names, signatures, dates of birth, medical record numbers, addresses, phone numbers, or other PHI in this registry. Completed acknowledgments attach only as authorized runtime evidence.',
      },
    ],
  },
  ...ctrl001Batch1DocumentationRecords,
  {
    documentId: 'MCDOC-CTRL-001-HIPAA-NPP',
    controlId: 'CTRL-001',
    title: 'HIPAA Notice of Privacy Practices',
    documentType: 'notice',
    sourceLocation: 'Admission packet HIPAA NPP section / HIPAA-NPP-Log',
    templateOnly: true,
    version: 'Template controlled by admission packet source',
    effectiveDate: 'Current controlled template',
    nextReviewDate: 'Next annual privacy notice review',
    ownerRole: 'Privacy Officer',
    approverRole: 'Privacy Officer',
    linkedPolicyIds: ['CO-HP-001', 'CO-HP-101'],
    linkedWorkflowIds: ['WF-CTRL-001'],
    linkedControlIds: ['CTRL-001'],
    requiredSignoffIds: ['MCSO-CTRL-001-PRIVACY-OFFICER'],
    evidenceRequirementIds: ['MCEV-CTRL-001-001', 'MCEV-CTRL-001-002'],
    tags: ['hipaa', 'npp', 'template-only', 'no-phi'],
    body: [
      { sectionId: 'NPP-PURPOSE', heading: 'Purpose', body: 'This notice documents how the agency maintains and provides Notice of Privacy Practices information during admission.' },
      {
        sectionId: 'NPP-DELIVERY',
        heading: 'Notice Delivery Expectation',
        body: 'The patient or authorized representative receives the current Notice of Privacy Practices at admission or by the permitted delivery method.',
        bullets: ['Delivery is recorded in the admission packet or NPP log.', 'The current template version is controlled by the Privacy Officer.', 'Completed acknowledgments are runtime evidence only.'],
      },
      {
        sectionId: 'NPP-ACK',
        heading: 'Acknowledgment and Refusal',
        body: 'The agency requests acknowledgment of NPP receipt. If acknowledgment is refused or cannot be obtained, staff document the reason and retain the attempt record as runtime evidence.',
      },
      {
        sectionId: 'NPP-EVIDENCE',
        heading: 'Runtime Evidence Expectations',
        body: 'Acceptable runtime evidence includes signed NPP acknowledgment, documented refusal/attempt, NPP delivery log, and monthly admission packet audit results.',
      },
    ],
  },
  {
    documentId: 'MCDOC-CTRL-001-ADVANCE-DIRECTIVE',
    controlId: 'CTRL-001',
    title: 'Advance Directive Information Notice',
    documentType: 'admission_packet_section',
    sourceLocation: 'Admission packet advance directive section',
    templateOnly: true,
    version: 'Template controlled by admission packet source',
    effectiveDate: 'Current controlled template',
    nextReviewDate: 'Next annual admission packet review',
    ownerRole: 'Clinical Manager',
    approverRole: 'Administrator',
    linkedPolicyIds: ['CL-PA-001', 'CL-PA-004'],
    linkedWorkflowIds: ['WF-CTRL-001'],
    linkedControlIds: ['CTRL-001'],
    requiredSignoffIds: ['MCSO-CTRL-001-CLINICAL-MANAGER'],
    evidenceRequirementIds: ['MCEV-CTRL-001-001', 'MCEV-CTRL-001-002'],
    tags: ['advance-directive', 'admission-packet', 'template-only', 'no-phi'],
    body: [
      { sectionId: 'AD-PURPOSE', heading: 'Purpose', body: 'This notice documents the agency requirement to inform patients about advance directive rights and record patient choice at admission.' },
      {
        sectionId: 'AD-CHOICES',
        heading: 'Patient Choice Options',
        body: 'Patients are informed that they may have, decline, update, or request information about an advance directive.',
        bullets: ['Existing advance directive documented at runtime.', 'No advance directive documented with patient choice.', 'Request for additional information routed to the responsible clinician.', 'DNR/POLST information handled according to applicable law and agency policy when presented.'],
      },
      {
        sectionId: 'AD-ACK',
        heading: 'Acknowledgment Requirement',
        body: 'The admission packet captures patient or authorized representative acknowledgment that advance directive information was provided. Completed acknowledgments are runtime evidence only.',
      },
      {
        sectionId: 'AD-EVIDENCE',
        heading: 'Runtime Evidence Expectations',
        body: 'Acceptable runtime evidence includes signed advance directive acknowledgment, EHR admission packet export, or PHI-authorized completed packet link.',
      },
    ],
  },
];

export const MASTER_CONTROL_DOCUMENTATION_RECORDS: readonly MasterControlDocumentationRecord[] = [
  ...ctrl001Documentation,
];

export function getMasterControlDocumentation(documentId: string): MasterControlDocumentationRecord | undefined {
  return MASTER_CONTROL_DOCUMENTATION_RECORDS.find((record) => record.documentId === documentId);
}

export function getDocumentationForControl(controlId: string): readonly MasterControlDocumentationRecord[] {
  return MASTER_CONTROL_DOCUMENTATION_RECORDS.filter((record) => record.linkedControlIds.includes(controlId) || record.controlId === controlId);
}

export function getDocumentationRecordForRef(source: MasterControlSourceRecord, ref: MasterControlDocumentRef): MasterControlDocumentationRecord {
  return getMasterControlDocumentation(ref.documentId) ?? buildDefaultDocumentationRecord(source, ref);
}

export const MASTER_CONTROL_MISSING_DOCUMENTATION_ROWS: readonly MissingDocumentationReportRow[] = [
  { controlId: 'CTRL-001', controlName: 'Patient Rights Notice & Admission Consent Program', requiredDocumentationMissing: 'Created', recommendedDocumentId: 'MCDOC-CTRL-001-PATIENT-BILL-OF-RIGHTS', recommendedTitle: 'Patient Bill of Rights / Client Rights & Responsibilities', sourceCandidate: 'Admission Packet template', draftingPriority: 'created', ownerRole: 'Clinical Manager / Privacy Officer', needsClaudeDraft: false },
  { controlId: 'CTRL-001', controlName: 'Patient Rights Notice & Admission Consent Program', requiredDocumentationMissing: 'Created', recommendedDocumentId: 'MCDOC-CTRL-001-ADMISSION-CONSENT', recommendedTitle: 'Admission Consent / Agreement / Acknowledgment', sourceCandidate: 'Admission Packet template', draftingPriority: 'created', ownerRole: 'Clinical Manager', needsClaudeDraft: false },
  { controlId: 'CTRL-001', controlName: 'Patient Rights Notice & Admission Consent Program', requiredDocumentationMissing: 'Created', recommendedDocumentId: 'MCDOC-CTRL-001-HIPAA-NPP-ACKNOWLEDGMENT', recommendedTitle: 'HIPAA Notice of Privacy Practices Acknowledgment', sourceCandidate: 'Admission Packet template', draftingPriority: 'created', ownerRole: 'Privacy Officer', needsClaudeDraft: false },
  { controlId: 'CTRL-001', controlName: 'Patient Rights Notice & Admission Consent Program', requiredDocumentationMissing: 'Created', recommendedDocumentId: 'MCDOC-CTRL-001-ADVANCE-DIRECTIVE-NOTICE', recommendedTitle: 'Advance Directive Notice and Acknowledgment', sourceCandidate: 'Admission Packet template', draftingPriority: 'created', ownerRole: 'Clinical Manager', needsClaudeDraft: false },
  { controlId: 'CTRL-001', controlName: 'Patient Rights Notice & Admission Consent Program', requiredDocumentationMissing: 'Created', recommendedDocumentId: 'MCDOC-CTRL-001-PHOTO-AUTHORIZATION', recommendedTitle: 'Permission to Photograph for Care Purposes', sourceCandidate: 'Admission Packet template', draftingPriority: 'created', ownerRole: 'Clinical Manager', needsClaudeDraft: false },
  { controlId: 'CTRL-001', controlName: 'Patient Rights Notice & Admission Consent Program', requiredDocumentationMissing: 'Created', recommendedDocumentId: 'MCDOC-CTRL-001-PERSONAL-FUNDS-AUTHORIZATION', recommendedTitle: 'Personal Funds Authorization / Refusal', sourceCandidate: 'Admission Packet template', draftingPriority: 'created', ownerRole: 'Clinical Manager', needsClaudeDraft: false },
  { controlId: 'CTRL-001', controlName: 'Patient Rights Notice & Admission Consent Program', requiredDocumentationMissing: 'Created', recommendedDocumentId: 'MCDOC-CTRL-001-VEHICLE-AUTHORIZATION', recommendedTitle: 'Vehicle Use Authorization / Refusal', sourceCandidate: 'Admission Packet template', draftingPriority: 'created', ownerRole: 'Clinical Manager', needsClaudeDraft: false },
  { controlId: 'CTRL-001', controlName: 'Patient Rights Notice & Admission Consent Program', requiredDocumentationMissing: 'Created', recommendedDocumentId: 'MCDOC-CTRL-001-FINANCIAL-RESPONSIBILITY', recommendedTitle: 'Consumer Liability for Payment / Financial Responsibility Notice', sourceCandidate: 'Admission Packet template', draftingPriority: 'created', ownerRole: 'Administrator / Billing', needsClaudeDraft: false },
  ...[
    ['CTRL-002', 'MCDOC-CTRL-002-LANGUAGE-ACCESS-NOTICE', 'Interpreter / language access services notice'],
    ['CTRL-003', 'MCDOC-CTRL-003-GRIEVANCE-INTAKE-FORM', 'Patient complaint / grievance intake documentation'],
    ['CTRL-004', 'MCDOC-CTRL-004-STATE-HOTLINE-NOTICE', 'State home health hotline notice'],
    ['CTRL-005', 'MCDOC-CTRL-005-DATA-SUBJECT-RIGHTS-REQUEST', 'HIPAA/CMIA/CCPA patient data rights request mechanism'],
    ['CTRL-015', 'MCDOC-CTRL-015-INFECTION-CONTROL-PATIENT-EDUCATION', 'Infection prevention and handwashing patient education'],
    ['CTRL-019', 'MCDOC-CTRL-019-EMERGENCY-PREPAREDNESS-PATIENT-INSTRUCTIONS', 'Emergency preparedness / disruption in service patient notice'],
    ['CTRL-105', 'MCDOC-CTRL-105-FIRE-LIFE-SAFETY-INSPECTION-LOG', 'Fire/life safety inspection documentation'],
    ['CTRL-106', 'MCDOC-CTRL-106-FIRE-HYDRANT-SPRINKLER-AHJ-EVIDENCE', 'Fire hydrant / sprinkler / fire alarm AHJ evidence tracking if applicable'],
    ['CTRL-107', 'MCDOC-CTRL-107-MEDICAL-SUPPLY-INVENTORY-LOG', 'Medical supply inventory log'],
    ['CTRL-108', 'MCDOC-CTRL-108-EQUIPMENT-MAINTENANCE-CALIBRATION-LOG', 'Clinical equipment preventive maintenance and calibration log'],
    ['CTRL-109', 'MCDOC-CTRL-109-RECALL-QUARANTINE-DISPOSITION-LOG', 'Expired supply / recall / quarantine / disposition log'],
    ['CTRL-110', 'MCDOC-CTRL-110-PPE-PAR-LEVEL-READINESS-LOG', 'PPE and emergency supply par-level readiness log'],
    ['CTRL-111', 'MCDOC-CTRL-111-SDS-HAZMAT-SPILL-KIT-LOG', 'SDS / hazardous materials / spill kit control log'],
    ['CTRL-112', 'MCDOC-CTRL-112-OXYGEN-SAFETY-PATIENT-EDUCATION', 'Oxygen safety / no-smoking / home oxygen education evidence'],
    ['CTRL-113', 'MCDOC-CTRL-113-VEHICLE-SAFETY-DRIVER-DOCUMENTATION', 'Vehicle safety / insurance / driver documentation control'],
    ['CTRL-114', 'MCDOC-CTRL-114-OFFICE-FACILITY-EGRESS-INSPECTION', 'Office facility inspection / egress / environmental conditions'],
    ['CTRL-115', 'MCDOC-CTRL-115-DME-VENDOR-SUPPORT-AGREEMENT', 'DME vendor agreement and 24/7 support evidence'],
    ['CTRL-116', 'MCDOC-CTRL-116-MEDICAL-DEVICE-RECALL-SMDA-REPORTING', 'Medical device recall / SMDA reporting control'],
  ].map(([controlId, recommendedDocumentId, recommendedTitle]) => ({
    controlId,
    controlName: 'See master control inventory',
    requiredDocumentationMissing: 'NEEDS_DRAFT',
    recommendedDocumentId,
    recommendedTitle,
    sourceCandidate: 'Master control dossier source documents',
    draftingPriority: 'high' as const,
    ownerRole: 'Control owner',
    needsClaudeDraft: true,
  })),
];

export const MASTER_CONTROL_DOSSIER_OVERRIDES: Record<string, DossierSeed> = {
  'CTRL-001': ctrl001,
};

const extra = (
  id: string,
  control_name: string,
  category: string,
  domain: string,
  source_policy_ids: string[],
  evidence_required: string,
  required_owner: string,
  trigger_condition: string,
  escalation_owner: string,
  forms_logs: string[],
): MasterControlSourceRecord => ({
  id,
  control_name,
  category: category as MasterControlSourceRecord['category'],
  domain,
  source_policy_ids,
  regulatory_basis: 'ACHC/CMS survey readiness; OSHA/Fire/Life Safety and agency policy as applicable',
  description: `${control_name} control dossier for survey-defensible documentation, evidence retention, recurring verification, and accountable sign-off.`,
  required_owner,
  evidence_required,
  failure_risk: 'Survey deficiency, unsafe care environment, patient/staff safety exposure, or inability to prove operational control.',
  risk_level: id === 'CTRL-111' || id === 'CTRL-113' || id === 'CTRL-114' ? 'M' : 'H',
  status: 'UNKNOWN',
  last_verified_date: null,
  next_verification_date: null,
  data_source: { system: 'CI-App / Safety + Operations', forms_logs },
  trigger_condition,
  escalation_owner,
  system_module: 'CI-App / Master Controls',
});

export const EXTRA_MASTER_CONTROL_SOURCE_RECORDS: MasterControlSourceRecord[] = [
  extra('CTRL-105', 'Fire & Life Safety Inspection Program', 'Safety & Risk Management', 'RM / OP', ['RM-EP-001'], 'Monthly extinguisher log; annual licensed service report; emergency light/exit/egress inspection; annual drill evidence', 'Facilities Manager / Safety Officer', 'Monthly inspection missing, annual service expired, egress blocked, or fire drill evidence absent', 'Administrator', ['Fire Extinguisher Log', 'Emergency Light Exit Egress Log', 'Fire Drill Record']),
  extra('CTRL-106', 'Fire Hydrant / Sprinkler / Fire Alarm AHJ Evidence Tracking', 'Safety & Risk Management', 'RM / OP', ['RM-EP-001'], 'Alarm/sprinkler/hydrant inspection or landlord/AHJ certification plus lease responsibility matrix', 'Facilities Manager / Administrator', 'Agency has assigned evidence-retention duty by lease, AHJ, insurer, or landlord and proof is missing', 'Administrator', ['Lease Responsibility Matrix', 'AHJ Certification', 'Fire Alarm Inspection']),
  extra('CTRL-107', 'Medical Supply Inventory Control', 'Clinical Operations / Operations', 'OP / CL / FN', ['OP-SU-001'], 'Current inventory, par-level review, expired-supply check, replenishment records, PPE/emergency stock check', 'Clinical Manager / Operations Director', 'Inventory below par, expired supplies found, or replenishment evidence missing', 'Operations Director', ['Medical Supply Inventory', 'Par-Level Review', 'Supply Order Records']),
  extra('CTRL-108', 'Clinical Equipment Preventive Maintenance & Calibration', 'Clinical Operations / Safety', 'OP / RM / CL', ['CL-EQ-001'], 'Equipment inventory, calibration/maintenance records, out-of-service log, vendor service records, replacement schedule', 'Clinical Manager / Risk Manager', 'Equipment lacks current calibration, maintenance record, or out-of-service disposition', 'Risk Manager', ['Equipment Inventory', 'Calibration Log', 'Vendor Service Records']),
  extra('CTRL-109', 'Expired Supply / Recall / Quarantine Control', 'Safety & Risk Management', 'OP / RM / CL', ['RM-RC-001'], 'Recall notice log, quarantine/disposition record, expired item disposal log, staff notification record', 'Operations Director / Risk Manager', 'Recall or expired supply is identified without quarantine, disposition, or staff notification evidence', 'Risk Manager', ['Recall Notice Log', 'Quarantine Record', 'Expired Item Disposal Log']),
  extra('CTRL-110', 'PPE & Emergency Supply Par-Level Readiness', 'Emergency Preparedness / Infection Control', 'RM / OP / CL', ['RM-EP-001', 'CL-IC-001'], 'PPE inventory, par-level dashboard, supplier backup list, expired PPE disposal, emergency cache inspection', 'Risk Manager', 'PPE/emergency cache below par, expired PPE found, or supplier backup not current', 'Administrator / Risk Manager', ['PPE Inventory', 'Par-Level Dashboard', 'Emergency Cache Inspection']),
  extra('CTRL-111', 'Hazardous Materials / SDS / Spill Kit Control', 'Safety & Risk Management', 'RM / OP', ['RM-HZ-001'], 'SDS register, chemical inventory, spill kit inspection, HazCom training record, disposal manifests if applicable', 'Risk Manager', 'New chemical introduced, SDS missing, spill kit expired, or HazCom training missing', 'Risk Manager', ['SDS Register', 'Chemical Inventory', 'Spill Kit Inspection']),
  extra('CTRL-112', 'Oxygen Safety / No-Smoking / Home Oxygen Education Evidence', 'Patient & Environmental Safety', 'RM / CL', ['CL-OX-001'], 'Oxygen safety checklist, patient/caregiver education attestation, no-smoking teaching confirmation, home safety assessment', 'RN / Clinical Manager', 'Patient uses home oxygen without education, safety assessment, or no-smoking acknowledgment evidence', 'Clinical Manager', ['Oxygen Safety Checklist', 'Home Safety Assessment', 'Education Attestation']),
  extra('CTRL-113', 'Vehicle Safety / Insurance / Driver Documentation Control', 'Staff Safety', 'RM / HR / OP', ['HR-DR-001'], 'Driver license check, insurance verification, accident reporting log, annual driver safety training', 'HR / Risk Manager', 'Driver documentation, insurance, or annual safety training missing or expired', 'Risk Manager', ['Driver License Check', 'Insurance Verification', 'Driver Safety Training']),
  extra('CTRL-114', 'Office Facility Inspection / Egress / Environmental Conditions', 'Facility & Administration', 'OP / RM', ['OP-FAC-001'], 'Office inspection checklist, clear egress check, emergency lighting/exit signage check, environmental condition log if applicable', 'Operations Director', 'Office inspection overdue, egress blocked, emergency lighting/signage issue, or environmental log missing when required', 'Operations Director', ['Office Inspection Checklist', 'Egress Check', 'Environmental Conditions Log']),
  extra('CTRL-115', 'DME Vendor Agreement & 24/7 Support Evidence', 'Clinical Operations / Vendor Management', 'OP / RM / CL', ['OP-VM-001'], 'DME vendor agreement, after-hours support confirmation, delivery/service escalation log, patient equipment issue log', 'Operations Director / Clinical Manager', 'DME vendor agreement, after-hours support, or issue escalation evidence is missing', 'Operations Director', ['DME Vendor Agreement', 'After-Hours Support Confirmation', 'Equipment Issue Log']),
  extra('CTRL-116', 'Medical Device Recall / SMDA Reporting Control', 'Safety & Risk Management', 'RM / CL / QA', ['RM-MD-001'], 'Device recall log, incident report, manufacturer/FDA report evidence when applicable, quarantine/disposition evidence', 'Risk Manager / QAPI', 'Device recall, near miss, harm event, or reportable malfunction lacks quarantine, reporting, or QAPI review evidence', 'Risk Manager / QAPI Chair', ['Device Recall Log', 'Incident Report', 'FDA Manufacturer Report Evidence']),
];

export function getDossierOverride(controlId: string): DossierSeed | undefined {
  return MASTER_CONTROL_DOSSIER_OVERRIDES[controlId];
}
