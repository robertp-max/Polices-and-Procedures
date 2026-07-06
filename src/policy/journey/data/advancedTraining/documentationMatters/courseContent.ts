/**
 * CMS Documentation Matters Toolkit — Course Content Architecture
 * Home Health Documentation Integrity Training
 *
 * This file defines all module content, lesson cards, learning objectives,
 * and course metadata for the LMS.
 */

export interface TopicScenarioOption {
  id: string
  text: string
}

export interface TopicScenarioRationale {
  whyCorrect: string
  whatDocumentationShouldShow: string
  auditorConclusion: string
  clinicalRisk: string
  complianceRisk: string
}

export interface TopicScenario {
  id: string
  stem: string
  options: TopicScenarioOption[]
  correctOptionId: string
  rationale: TopicScenarioRationale
}

export interface LessonCard {
  id: string
  title: string
  context: string
  keyRule: string
  whyItMatters: string
  example: string
  keyTakeaway: string
  roleCallout?: { role: 'clinician' | 'supervisor' | 'admin'; text: string }
  auditRisk?: string
  clinicalRisk?: string
  documentationTip?: string
  supervisorTip?: string
  scenario?: TopicScenario
}

export interface ModuleDefinition {
  id: string
  number: number
  title: string
  description: string
  estimatedMinutes: number
  learningObjectives: string[]
  lessons: LessonCard[]
}

export const courseMeta = {
  title: 'CMS Documentation Matters Toolkit',
  subtitle: 'Home Health Documentation Integrity Training',
  description:
    'A comprehensive training program designed to strengthen clinical documentation practices, ensure regulatory compliance, and prepare home health professionals for audit readiness. Built from the CMS Documentation Matters Toolkit and aligned with Medicare/Medicaid documentation requirements.',
  estimatedTime: '4–6 hours',
  targetAudience: [
    'Registered Nurses (RNs)',
    'Licensed Vocational/Practical Nurses (LVNs/LPNs)',
    'Clinical Supervisors',
    'QA / Documentation Reviewers',
    'Office / Administrative Staff',
  ],
  learningObjectives: [
    'Explain the statutory and regulatory foundations of Medicare/Medicaid documentation requirements',
    'Identify the elements of clinical documentation that support medical necessity and skilled need',
    'Recognize common documentation failures that trigger audit findings, denials, and recoupment',
    'Apply documentation integrity principles to home health visit notes, wound care, medication teaching, and functional assessments',
    'Construct and execute self-audit processes and corrective action plans',
    'Analyze case-based documentation scenarios using expert-level regulatory reasoning',
    'Distinguish between documentation that appears compliant versus documentation that withstands audit scrutiny',
  ],
}

export const modules: ModuleDefinition[] = [
  // ─── MODULE 1: Why Documentation Matters ───
  {
    id: 'mod-1',
    number: 1,
    title: 'Why Documentation Matters',
    description: 'Understanding the clinical, legal, financial, and operational impact of documentation in home health.',
    estimatedMinutes: 20,
    learningObjectives: [
      'Articulate why documentation is the foundation of care delivery, reimbursement, and legal protection',
      'Describe the financial impact of improper payments and documentation failures on home health agencies',
      'Explain the concept that "if it wasn\'t documented, it wasn\'t done"',
    ],
    lessons: [
      {
        id: 'L1-01',
        title: 'The Documentation Imperative',
        context: 'Healthcare providers bear ultimate responsibility for documenting every patient encounter completely, accurately, and contemporaneously.',
        keyRule: 'Documentation is the sole legal proof that care was provided. Under SSA § 1902(a)(27), Medicaid providers must maintain records that fully disclose the precise extent of services, care, and supplies furnished to beneficiaries.',
        whyItMatters: 'In home health, clinicians work independently in patients\' homes without direct oversight. Documentation is the only evidence that services were provided as billed, that care was clinically appropriate, and that the patient\'s condition warranted skilled intervention.',
        example: 'A home health nurse provides 45 minutes of skilled wound care but documents only "wound care provided, dressing changed." An auditor cannot determine the complexity of the wound, the clinical reasoning behind the intervention, or whether the service justified the billed code.',
        keyTakeaway: 'Documentation must tell the complete clinical story — not just what was done, but why it was done, what was found, and how the patient responded.',
        auditRisk: 'Vague or incomplete documentation is the #1 cause of claim denials. Auditors assume that undocumented care did not occur.',
      },
      {
        id: 'L1-02',
        title: 'The Financial Reality',
        context: 'Improper payments cost the federal healthcare system billions annually. In a single fiscal year, improper Medicaid payments totaled approximately $17.5 billion.',
        keyRule: 'An improper payment is any disbursement made for services not covered by program rules, services lacking documented medical necessity, or services billed but never actually provided.',
        whyItMatters: 'Home health agencies that consistently submit poorly documented claims face not only individual claim denials but systemic audit triggers, targeted medical review, payment suspensions, and potential exclusion from federal programs.',
        example: 'An agency\'s OASIS documentation consistently fails to support the skilled need for nursing visits. Over 18 months, denials increase from 3% to 18%. The MAC initiates targeted probe review, placing 100% of claims under pre-payment review.',
        keyTakeaway: 'Every documentation failure has a financial cost — to the agency, to the clinician, and to the Medicare/Medicaid system. Prevention through training is far less expensive than remediation after audit.',
        clinicalRisk: 'Poor documentation doesn\'t just affect billing — it compromises care continuity when the next clinician cannot determine what was assessed, taught, or planned.',
      },
      {
        id: 'L1-03',
        title: 'Documentation as a Communication Tool',
        context: 'Healthcare providers rely on medical records to communicate critical patient information across fragmented care transitions.',
        keyRule: 'Incomplete or inaccurate documentation directly precipitates unintended, erratic, and potentially dangerous patient outcomes.',
        whyItMatters: 'In home health, multiple clinicians (RN, PT, OT, SLP, MSW, HHA) visit the same patient on different days. If one clinician fails to document a change in condition, medication reaction, or new safety concern, subsequent clinicians operate without critical information.',
        example: 'An RN documents "patient tolerated medication well" without noting the patient\'s report of dizziness upon standing. Two days later, the physical therapist initiates gait training without knowledge of postural hypotension symptoms. The patient falls.',
        keyTakeaway: 'Documentation is not just a billing requirement — it is a patient safety imperative that ensures continuity of care across the interdisciplinary team.',
        supervisorTip: 'During chart review, look for documentation that only records tasks performed but omits clinical findings, patient responses, and coordination with the care team.',
      },
    ],
  },

  // ─── MODULE 2: Regulatory and Compliance Foundations ───
  {
    id: 'mod-2',
    number: 2,
    title: 'Regulatory and Compliance Foundations',
    description: 'The statutory and regulatory architecture that governs clinical documentation requirements.',
    estimatedMinutes: 30,
    learningObjectives: [
      'Identify key statutory requirements from the Social Security Act governing documentation',
      'Explain CFR record retention requirements and audit extension rules',
      'Describe the PERM program and how it measures improper payments',
      'Understand the macro-level surveillance environment that monitors documentation integrity',
    ],
    lessons: [
      {
        id: 'L2-01',
        title: 'The Social Security Act: Your Documentation Mandate',
        context: 'Section 1902(a)(27) of the Social Security Act is the primary legal authority requiring complete documentation.',
        keyRule: 'Providers must maintain records that fully disclose the precise extent of services, care, and supplies furnished. An absence of documentation equals an absence of service in the eyes of federal auditors.',
        whyItMatters: 'This isn\'t a guideline or best practice — it is a federal statute. Non-compliance carries legal consequences including recoupment, civil monetary penalties, and potential prosecution under the False Claims Act.',
        example: 'A home health agency bills for skilled nursing visits but the visit notes contain only pre-populated template text with no individualized patient-specific content. A ZPIC auditor determines the records fail to "fully disclose the extent of services" and initiates recoupment for the entire episode.',
        keyTakeaway: 'The Social Security Act establishes that your documentation IS your claim. The clinical narrative must prove that every billed service actually occurred, was medically necessary, and was properly provided.',
        documentationTip: 'Every visit note should answer: What did you find? What did you do? Why was it necessary? How did the patient respond?',
      },
      {
        id: 'L2-02',
        title: 'Record Retention and the Audit Extension Rule',
        context: '42 C.F.R. § 433.32(b) establishes minimum record retention periods, with critical extensions for active audits.',
        keyRule: 'Records must be retained for a minimum of three years following the submission of a final expenditure report. If audit findings have not been resolved, records must be retained indefinitely until resolution.',
        whyItMatters: 'Home health agencies sometimes purge records prematurely, only to discover that an audit has been initiated for a prior period. Destroyed records result in automatic denial of all claims in the audit sample.',
        example: 'An agency destroys clinical records from 2022 at the standard three-year mark in 2025. In 2026, CMS initiates a retrospective audit of 2022 claims. The agency cannot produce records, resulting in 100% recoupment of all sampled claims and extrapolation penalties.',
        keyTakeaway: 'Never destroy records until you have confirmed that all potential audit periods have closed and no active investigations exist for that time period.',
        roleCallout: { role: 'admin', text: 'Administrative staff must implement a formal record retention schedule that accounts for both standard retention periods AND the audit extension rule. Consult with compliance counsel before any record destruction.' },
      },
      {
        id: 'L2-03',
        title: 'The Payment Error Rate Measurement (PERM) Program',
        context: 'CMS developed PERM to measure improper payments across Medicaid and CHIP, producing state-level error rates.',
        keyRule: 'PERM calculates improper payment rates by reviewing Fee-For-Service claims, managed care encounters, and beneficiary eligibility determinations. These are not fraud rates — they are measurements of systemic payments that failed to meet documentation requirements.',
        whyItMatters: 'High PERM error rates in a state trigger intensified scrutiny of all providers in that state. Your agency\'s documentation practices contribute directly to your state\'s error rate.',
        example: 'PERM reviewers request documentation for a random sample of home health claims. The agency\'s records show plan of care updates without physician signatures, visit notes without dates, and medication teaching without evidence of patient comprehension assessment. Each deficiency generates an "improper payment" finding.',
        keyTakeaway: 'Understanding the PERM program helps you recognize that documentation audits are systematic, comprehensive, and mathematically precise. Every technical deficiency counts.',
        auditRisk: 'PERM reviewers look for both substantive failures (lack of medical necessity support) AND technical failures (missing signatures, dates, credentials).',
      },
      {
        id: 'L2-04',
        title: 'The Sixty-Day Rule for Overpayments',
        context: 'Under Section 1128J(d) of the Social Security Act, providers who receive overpayments must report and return funds.',
        keyRule: 'An overpayment must be reported and returned within sixty days of identification. If retained beyond the deadline, the overpayment is legally reclassified as an "obligation" under the False Claims Act.',
        whyItMatters: 'When an internal audit reveals documentation that does not support a billed claim, the agency has a legal obligation to self-report and refund. Ignoring the finding creates criminal liability.',
        example: 'A QA review discovers that 15 skilled nursing visits were billed without supporting documentation of skilled need. The agency has 60 days from the date this pattern was identified to report the overpayment to CMS and return the funds.',
        keyTakeaway: 'Self-auditing creates a legal obligation to act on findings. This is why corrective action plans must be immediate and documented.',
        roleCallout: { role: 'supervisor', text: 'Supervisors must understand that identifying documentation deficiencies during chart review triggers the 60-day clock. Findings must be escalated to compliance immediately.' },
      },
    ],
  },

  // ─── MODULE 3: What Good Clinical Documentation Looks Like ───
  {
    id: 'mod-3',
    number: 3,
    title: 'What Good Clinical Documentation Looks Like',
    description: 'Elements of complete, accurate, and defensible clinical documentation in home health.',
    estimatedMinutes: 30,
    learningObjectives: [
      'Describe the essential elements of a complete home health visit note',
      'Differentiate between task-based and clinically-reasoned documentation',
      'Explain the elements required to demonstrate medical necessity and skilled need',
      'Apply documentation specificity requirements to common home health scenarios',
    ],
    lessons: [
      {
        id: 'L3-01',
        title: 'Medical Necessity: The Overarching Criterion for Payment',
        context: 'Under Section 1862(a)(1)(A) of the Social Security Act, Medicare cannot pay for items or services that are not "reasonable and necessary."',
        keyRule: 'For a service to be medically necessary, it must be: (1) safe and effective, (2) not experimental, (3) provided in the appropriate setting, and (4) proper and needed for the diagnosis or treatment of the patient\'s condition.',
        whyItMatters: 'Medical necessity is the most common reason for claim denials, often because documentation fails to articulate the clinical rationale for a service. In home health, simply having an order for nursing visits does not establish medical necessity — the documentation must prove WHY the patient requires skilled intervention.',
        example: '"Patient requires skilled nursing for medication management" is insufficient. A defensible note reads: "Patient demonstrated inability to identify purpose of Metoprolol vs. Amlodipine during medication reconciliation. Heart rate 92 at rest with documented non-adherence to AM dosing schedule. Skilled nursing intervention required for medication education, administration monitoring, and assessment of therapeutic response."',
        keyTakeaway: 'Medical necessity documentation must connect the patient\'s specific condition to the specific skilled intervention and explain why a non-skilled person could not safely provide the service.',
        auditRisk: 'CERT data shows "insufficient documentation" is the leading cause of improper payments, accounting for 62.8% of errors. The clinical narrative must contain ALL necessary elements to support payment.',
      },
      {
        id: 'L3-02',
        title: 'Skilled Need Documentation',
        context: 'Home health services under Medicare require the involvement of a skilled clinician. Documentation must prove why the service requires the skills of a licensed professional.',
        keyRule: 'A service is "skilled" when it requires the knowledge, judgment, and skills of a licensed nurse or therapist. The documentation must demonstrate that the complexity of the patient\'s condition and the nature of the intervention exceed what a non-skilled caregiver could safely perform.',
        whyItMatters: 'Auditors scrutinize whether the documented care actually required a skilled professional. If the visit note reads like a task list that any trained aide could perform, the claim may be denied.',
        example: 'Insufficient: "Changed wound dressing. Applied Aquacel Ag. Wound appears unchanged." Sufficient: "Assessed Stage III sacral pressure injury measuring 4.2 x 3.1 x 0.8 cm with moderate serous drainage, 40% granulation tissue at wound base, and 2 cm of undermining at 3 o\'clock. Periwound skin intact but erythematous. Applied Aquacel Ag with bordered foam secondary dressing. Patient repositioning schedule reviewed with caregiver. Skilled assessment required to evaluate wound trajectory, modify treatment plan, and assess for infection indicators."',
        keyTakeaway: 'Skilled need documentation must answer: What clinical judgment did you exercise? What assessment findings drove your decisions? What would deteriorate without skilled intervention?',
        documentationTip: 'Use objective measurements (numbers, scales, percentages) rather than subjective descriptors ("looks better," "improving," "unchanged").',
      },
      {
        id: 'L3-03',
        title: 'The Complete Visit Note',
        context: 'A home health visit note must contain all elements necessary to prove the service occurred, was medically necessary, and achieved a clinical purpose.',
        keyRule: 'Every visit note must include: (1) date and time of service, (2) patient identification, (3) clinical findings/assessment, (4) interventions performed with clinical rationale, (5) patient response to interventions, (6) plan for next visit, (7) coordination/communication actions, (8) legible signature with credentials.',
        whyItMatters: 'Missing any single element can result in a claim denial. Auditors evaluate notes holistically — a note that contains an assessment but no intervention rationale, or an intervention but no patient response, is incomplete.',
        example: 'A nurse documents vital signs, provides medication teaching, and signs the note. Missing: no documentation of what specific medications were taught, what teaching method was used, whether the patient demonstrated understanding, what barriers to learning were identified, or what follow-up teaching was planned. Result: auditor cannot determine skilled teaching actually occurred.',
        keyTakeaway: 'Approach each visit note as if it will be reviewed by an auditor who has never met the patient. The note must stand alone as proof of skilled, medically necessary care.',
        supervisorTip: 'During concurrent review, check that every visit note contains assessment findings + clinical reasoning + intervention + patient response. This AIIR chain is the hallmark of defensible documentation.',
      },
      {
        id: 'L3-04',
        title: 'Signature and Authentication Requirements',
        context: 'Signatures are the legal bedrock of the medical record, signifying the practitioner\'s knowledge, approval, and acceptance of documented care.',
        keyRule: 'CMS accepts handwritten and electronic signatures when they are legible and include the practitioner\'s credentials. Rubber-stamped signatures are illegal unless the provider has a documented physical disability. Missing signatures on orders cannot be remediated with attestation statements.',
        whyItMatters: 'Without a valid signature, an auditor cannot verify that services were performed by a qualified individual. Unsigned orders for diagnostic tests or services cannot be corrected after the fact — the claim will be denied.',
        example: 'A physician fails to sign the home health plan of care within the required timeframe. The agency submits an attestation statement three months later. For orders, this attestation is not acceptable — the only potential remedy is submitting contemporaneous documentation (such as a progress note) that demonstrates the physician\'s intent at the time of the encounter.',
        keyTakeaway: 'Prevent signature failures through proactive workflow systems. Do not rely on after-the-fact attestation as a remediation strategy — for orders, it does not work.',
        roleCallout: { role: 'admin', text: 'Implement automated alerts for unsigned orders and unsigned visit notes. Track signature compliance weekly and escalate delays immediately.' },
      },
    ],
  },

  // ─── MODULE 4: Common Documentation Failures in Home Health ───
  {
    id: 'mod-4',
    number: 4,
    title: 'Common Documentation Failures in Home Health',
    description: 'Identifying and understanding the most frequent documentation errors that lead to denials, recoupment, and audit findings.',
    estimatedMinutes: 35,
    learningObjectives: [
      'Identify the most common documentation errors in home health settings',
      'Explain the risks of copy-forward documentation, template charting, and vague language',
      'Recognize documentation that appears complete but fails under audit scrutiny',
      'Describe how narrative inconsistencies across visits create audit vulnerability',
    ],
    lessons: [
      {
        id: 'L4-01',
        title: 'Copy-Forward and Cloning Risks',
        context: 'EHR systems enable auto-fill, copy-forward, and template-based documentation that can create false clinical narratives.',
        keyRule: 'Documentation must reflect the unique clinical nuances of the current encounter. The HHS-OIG has designated EHR cloning as a primary compliance target. Auto-filled notes that duplicate prior assessments fail to demonstrate individualized patient assessment.',
        whyItMatters: 'In home health, patient conditions change between visits. A wound may improve or deteriorate, functional status may fluctuate, pain levels shift, and medication responses evolve. Copy-forward documentation creates a false narrative of clinical stability that can mask deterioration.',
        example: 'Eight consecutive visit notes for a CHF patient contain identical vital signs, identical assessment language, identical breath sound findings, and identical teaching content. An auditor immediately identifies this as cloned documentation, triggering denial of all eight visits and a systematic review of the clinician\'s entire caseload.',
        keyTakeaway: 'If your documentation from Visit 5 reads identically to Visit 1, something is wrong. Patients change. Your documentation must reflect those changes — or explicitly note clinical stability with current-visit supporting evidence.',
        auditRisk: 'Algorithmic audit tools now scan for identical text strings across sequential notes. Identical documentation across visits is a red flag that triggers expanded review.',
        clinicalRisk: 'Identical assessments across visits may mask clinical deterioration. If the wound was 4.2 cm on Visit 1 and is still documented as 4.2 cm on Visit 8 without any supporting measurement, the reviewer questions whether the clinician is actually assessing the wound.',
      },
      {
        id: 'L4-02',
        title: 'Vague and Non-Specific Language',
        context: 'Documentation that uses subjective, unmeasurable descriptors fails to support medical necessity or demonstrate clinical progression.',
        keyRule: 'Replace vague descriptors with objective, measurable, specific clinical language. Words like "stable," "improving," "tolerated well," "adequate," and "unchanged" are meaningless without supporting data.',
        whyItMatters: 'An auditor reading "wound improving" cannot determine whether the wound actually improved. Did it decrease in size? Did granulation tissue increase? Did drainage decrease? Without specifics, the documentation fails the medical necessity test.',
        example: 'Vague: "Patient tolerated medication teaching well. Will continue to monitor." Specific: "Instructed patient on purpose, dosage, timing, and side effects of Warfarin. Patient correctly repeated back dosing schedule and identified three signs of bleeding requiring emergency contact. Patient demonstrated confusion regarding dietary interactions — will reinforce Vitamin K food list on next visit. INR lab results pending; will coordinate with MD."',
        keyTakeaway: 'Every clinical statement should be verifiable. If an auditor asks "how do you know?" and the answer isn\'t in the documentation, the note fails.',
        documentationTip: 'Apply the "show, don\'t tell" rule: Instead of stating a conclusion ("wound improving"), document the evidence that supports it ("wound bed 80% granulation, periwound maceration resolved, drainage decreased from moderate to scant serous").',
      },
      {
        id: 'L4-03',
        title: 'Missing Patient Response Documentation',
        context: 'Teaching and training visits require documentation of patient/caregiver response to demonstrate that learning actually occurred.',
        keyRule: 'For any teaching or training intervention, document: (1) what was taught, (2) how it was taught, (3) the patient/caregiver response and demonstrated understanding, (4) barriers to learning identified, and (5) plan for reinforcement.',
        whyItMatters: 'Auditors specifically scrutinize medication teaching and disease process education notes. Documentation that states "teaching provided" without evidence of patient comprehension does not prove that skilled teaching actually occurred.',
        example: 'Insufficient: "Taught patient about diabetes management. Patient verbalized understanding." This tells the auditor nothing. Better: "Educated patient on blood glucose monitoring technique using teach-back method. Patient correctly demonstrated lancet use, strip insertion, and glucose reading. Patient unable to correctly identify target glucose range (stated \'200 is fine\') — corrected misconception and provided written reference card. Return demonstration planned next visit to verify retention."',
        keyTakeaway: 'Document what the patient said, did, or demonstrated — not just what you told them. The patient\'s response IS the evidence that skilled teaching occurred.',
        supervisorTip: 'When reviewing teaching visit notes, look for the teach-back cycle: teach → assess → correct → verify. Notes that say "verbalized understanding" without specific examples are red flags.',
      },
      {
        id: 'L4-04',
        title: 'Incomplete Linkage Between Assessment, Intervention, and Response',
        context: 'Clinical documentation must create a logical chain: Assessment findings → Clinical decision → Intervention → Patient response → Updated plan.',
        keyRule: 'Every intervention must be preceded by an assessment that justifies it, and followed by documentation of the patient\'s response. Breaks in this chain create audit vulnerability.',
        whyItMatters: 'Documentation that records interventions without supporting assessment findings appears arbitrary. Documentation that records assessments without resulting interventions raises questions about clinical competence or the necessity of the visit.',
        example: 'Broken chain: "Vital signs WNL. Auscultated lungs — clear bilaterally. Provided medication teaching on Lasix." Missing: Why was Lasix teaching provided if the assessment showed no concerning findings? The note needs to connect: "Patient reports increasing ankle edema over past 3 days despite current diuretic regimen. Weight gain of 3 lbs since last visit. Lungs clear but JVD noted at 45 degrees. Reassessed Lasix administration timing — patient was taking PM dose at bedtime rather than 4 PM. Educated on optimal timing to reduce nocturia while maintaining therapeutic effect. Patient verbalized understanding and agreed to adjust schedule."',
        keyTakeaway: 'Your documentation must show that you assessed, analyzed, decided, acted, and evaluated — in that order. Disconnected fragments do not tell a clinical story.',
        clinicalRisk: 'When the assessment-intervention-response chain is broken, it\'s impossible for the next clinician to understand your clinical reasoning or how to continue the plan of care.',
      },
      {
        id: 'L4-05',
        title: 'Narrative Inconsistencies Across Visits',
        context: 'Documentation across sequential visits must tell a coherent, chronological patient story. Conflicting information across notes creates credibility issues.',
        keyRule: 'When documentation in one visit contradicts documentation in another visit without explanation, auditors question the reliability of the entire record.',
        whyItMatters: 'In home health, auditors review the entire episode of care — not just single visits. They look for a consistent narrative that makes clinical sense. Contradictions destroy the credibility of the documentation.',
        example: 'Visit 3: "Patient ambulating independently with rolling walker, steady gait, good balance." Visit 5 (four days later): "Patient requires maximum assist of two for transfers, unable to bear weight on right lower extremity." No documentation of a fall, change in condition, or physician notification between these visits. An auditor concludes that one of the notes is inaccurate.',
        keyTakeaway: 'When patient status changes between visits, document the change, the likely cause, the clinical response, and the physician notification. Sudden undocumented changes in status are audit red flags.',
        auditRisk: 'Narrative inconsistencies across visits are the third most common reason for expanded audit review. They suggest either inaccurate documentation or inadequate clinical assessment.',
      },
    ],
  },

  // ─── MODULE 5: Documentation and Audit Readiness ───
  {
    id: 'mod-5',
    number: 5,
    title: 'Documentation and Audit Readiness',
    description: 'Understanding audit processes, program integrity mechanisms, and how to prepare documentation that withstands scrutiny.',
    estimatedMinutes: 30,
    learningObjectives: [
      'Describe the audit surveillance ecosystem (PERM, CERT, ZPIC, MAC, RAC, OIG)',
      'Explain what auditors look for in home health documentation',
      'Identify the most common audit findings and denial reasons',
      'Prepare documentation proactively for potential audit review',
    ],
    lessons: [
      {
        id: 'L5-01',
        title: 'The Audit Surveillance Ecosystem',
        context: 'Healthcare documentation is monitored at the macro level by multiple overlapping federal and state entities.',
        keyRule: 'The audit ecosystem includes PERM (Payment Error Rate Measurement), CERT (Comprehensive Error Rate Testing), ZPICs (Zone Program Integrity Contractors), MACs (Medicare Administrative Contractors), RACs (Recovery Audit Contractors), and the OIG (Office of Inspector General). Each has distinct authority and methodology.',
        whyItMatters: 'A missing signature or improperly documented encounter does not merely result in a localized claim denial — it feeds into systemic surveillance mechanisms that track patterns across providers, states, and programs.',
        example: 'CERT identifies an insufficient documentation error rate of 62.8% in home health claims. This data drives policy changes, targeted provider reviews, and increased scrutiny of all home health documentation nationwide.',
        keyTakeaway: 'Audit readiness is not optional. It must be built into every documentation process, every clinical workflow, and every supervisory review.',
        roleCallout: { role: 'admin', text: 'Administrative staff should understand that claims submitted to federal programs carry a legal duty of accuracy. Each claim is an implied certification that the underlying documentation is complete, truthful, and supports the service billed.' },
      },
      {
        id: 'L5-02',
        title: 'What Auditors Actually Look For',
        context: 'Federal auditors evaluate home health documentation through a systematic lens that differs from clinical chart review.',
        keyRule: 'Auditors verify: (1) Was there an eligible beneficiary? (2) Was there a valid physician order/plan of care? (3) Is the service documented? (4) Does documentation support medical necessity? (5) Does documentation support skilled need? (6) Is the note signed and authenticated? (7) Are there contradictions in the record?',
        whyItMatters: 'Understanding the auditor\'s checklist allows you to document proactively. If you know the seven questions an auditor will ask, you can ensure your documentation answers all seven before the claim is ever submitted.',
        example: 'An Additional Documentation Request (ADR) for a home health episode asks for: physician orders, plan of care, nursing assessments, visit notes for the billed period, and any relevant communication logs. The agency produces complete visit notes but cannot locate the signed physician order. Result: all claims in the episode denied despite complete clinical documentation.',
        keyTakeaway: 'Think like an auditor when you document. Every note should preemptively answer the questions that a reviewer will ask.',
        documentationTip: 'Before closing any visit note, ask yourself: If I were denied payment for this visit and had to appeal, does this note contain everything I would need to prove the visit was medically necessary and properly performed?',
      },
      {
        id: 'L5-03',
        title: 'The Exclusion Screening Imperative',
        context: 'Federal programs prohibit payment for services furnished by excluded individuals. This prohibition extends to services supplied indirectly.',
        keyRule: 'Healthcare organizations must routinely screen all employees, contractors, and vendors against the OIG List of Excluded Individuals/Entities (LEIE) and the System for Award Management (SAM). The definition of "furnished" is legally expansive.',
        whyItMatters: 'If an excluded individual provides a home health visit — even under supervision — the claim is automatically void. The agency can be held liable for repayment plus penalties.',
        example: 'A home health aide who was excluded from Medicare five years ago for a state-level fraud conviction is hired without an exclusion screening check. She provides 200 aide visits over 10 months before the exclusion is discovered. All 200 visits are subject to recoupment.',
        keyTakeaway: 'Exclusion screening is not a one-time check. CMS recommends monthly screening of all active employees against LEIE and SAM databases.',
        roleCallout: { role: 'admin', text: 'Implement monthly OIG/LEIE screening for all staff with a documented attestation process. This is one of the most commonly cited compliance failures in federal audits of home health agencies.' },
      },
    ],
  },

  // ─── MODULE 6: Self-Auditing and Corrective Action Plans ───
  {
    id: 'mod-6',
    number: 6,
    title: 'Self-Auditing and Corrective Action Plans',
    description: 'Building proactive compliance through systematic self-evaluation and structured remediation.',
    estimatedMinutes: 30,
    learningObjectives: [
      'Implement the five-step self-auditing strategy from CMS guidelines',
      'Design objective random sampling methodologies for internal audits',
      'Construct and execute a Corrective Action Plan (CAP) with root cause analysis',
      'Establish re-audit protocols to verify corrective actions are effective',
    ],
    lessons: [
      {
        id: 'L6-01',
        title: 'The Five-Step Self-Auditing Strategy',
        context: 'CMS emphasizes that medical professionals have an explicit, non-delegable duty to verify the veracity of their submitted claims. Proactive self-auditing identifies failures before external auditors do.',
        keyRule: 'Step 1: Policy Implementation. Step 2: Audit Tool Utilization. Step 3: Objective Random Sampling. Step 4: Remittance Tracking. Step 5: Corrective Action Formulation.',
        whyItMatters: 'Organizations that self-audit and correct before external audit demonstrate good faith compliance posture. This doesn\'t eliminate liability, but it can mitigate penalties and demonstrate organizational commitment to integrity.',
        example: 'An agency pulls every 10th chart from Q1 for review. The audit reveals that 40% of wound care notes lack objective wound measurements. Rather than waiting for a MAC audit, the agency implements immediate corrective training, revises the wound documentation template, and re-audits in Q2 to verify improvement.',
        keyTakeaway: 'Self-auditing is not optional — it is an organizational obligation. The question is not whether you audit, but how rigorously and how frequently.',
        supervisorTip: 'CMS strongly warns against professionals auditing their own charts. Subjective bias leads practitioners to infer meaning from their own shorthand when the documentation is legally insufficient.',
      },
      {
        id: 'L6-02',
        title: 'Objective Random Sampling',
        context: 'The validity of a self-audit depends on the objectivity and randomness of the sample. Cherry-picking records undermines the entire process.',
        keyRule: 'Assign a designated staff member with deep technical understanding of documentation requirements to pull a random, unbiased sample (e.g., every nth chart from a specific fiscal quarter). The auditor must NOT audit their own charts.',
        whyItMatters: 'A biased sample — selecting only easy cases, only certain clinicians, or only certain visit types — produces false compliance confidence. Random sampling reveals systemic issues that targeted reviews miss.',
        example: 'An agency audits only the charts of new nurses, concluding that documentation quality is the issue. A random cross-agency audit later reveals that the most experienced nurses have the highest rate of copy-forward violations because they\'ve developed template shortcuts over years.',
        keyTakeaway: 'True random sampling reveals what you didn\'t know you didn\'t know. It must be systematic, unbiased, and representative of the full scope of agency operations.',
        documentationTip: 'Document your sampling methodology, selection criteria, and sample size calculation. If ever audited, you may need to demonstrate that your self-audit was conducted with rigor.',
      },
      {
        id: 'L6-03',
        title: 'Building a Corrective Action Plan (CAP)',
        context: 'Identifying an error is insufficient without a structured remediation protocol. The CAP is the organizational commitment to fix the root cause.',
        keyRule: 'A CAP must include: (1) Root cause analysis — why did the error occur? (2) Specific measurable corrective actions (3) Implementation plan with re-education (4) Re-audit after implementation period to verify effectiveness.',
        whyItMatters: 'Conducting an audit is fundamentally useless if findings are not used to train staff on corrected workflows. A CAP without re-audit is a plan without accountability.',
        example: 'Root cause: Wound care notes missing measurements because the EHR template does not have a mandatory field for wound dimensions. Corrective action: (1) Update EHR wound template to require L x W x D before note can be finalized (2) Conduct 1-hour wound documentation in-service for all RNs within 30 days (3) Re-audit wound notes 60 days post-implementation targeting 95% compliance rate.',
        keyTakeaway: 'The best CAPs are specific, measurable, time-bound, and include a re-audit verification step. Vague action plans like "improve documentation" are not corrective action plans.',
        roleCallout: { role: 'supervisor', text: 'Supervisors own the CAP execution. Without supervisory follow-through, corrective actions remain on paper. Schedule re-audit dates at the time the CAP is created, not after.' },
      },
    ],
  },

  // ─── MODULE 7: Documentation in Home Health Clinical Workflows ───
  {
    id: 'mod-7',
    number: 7,
    title: 'Documentation in Home Health Clinical Workflows',
    description: 'Applying documentation integrity principles to specific clinical workflows in home health practice.',
    estimatedMinutes: 35,
    learningObjectives: [
      'Apply documentation integrity principles to wound care, medication management, and functional assessment documentation',
      'Document homebound status, change-in-condition, and physician communication appropriately',
      'Demonstrate documentation that supports the plan of care and visit frequency',
      'Create documentation that demonstrates care coordination across the interdisciplinary team',
    ],
    lessons: [
      {
        id: 'L7-01',
        title: 'Wound Documentation That Withstands Scrutiny',
        context: 'Wound care is one of the highest-frequency home health services and one of the most frequently audited.',
        keyRule: 'Wound documentation must include: wound type, location, stage/classification, measurements (L x W x D), wound bed description (% granulation, slough, necrotic tissue), drainage characteristics, periwound condition, pain assessment, treatment provided with rationale, and comparison to previous assessment.',
        whyItMatters: 'Wound documentation that lacks measurements, staging, or wound bed description cannot support the medical necessity of skilled wound care. An auditor cannot determine wound trajectory without objective data across visits.',
        example: 'Insufficient: "Wound care provided to left heel. Wound appears to be healing. Clean dry dressing applied." Defensible: "Left heel Stage II pressure injury measured 2.1 x 1.4 x 0.2 cm (decreased from 2.5 x 1.8 x 0.3 cm on 02/28). Wound bed 90% pink granulation, 10% adherent yellow slough at superior margin. Scant serous drainage on removed dressing. Periwound skin intact, non-erythematous. Patient reports pain 3/10 during dressing change, decreased from 5/10 last visit. Cleansed with NS, applied Medihoney sheet, covered with non-adherent pad and secured with 3M Tegaderm. Heel offloading device in place. Caregiver repositioning schedule reviewed — repositioning every 2 hours per plan."',
        keyTakeaway: 'Wound documentation requires numbers, not adjectives. Measure everything. Compare to prior visits. Document the treatment rationale and the patient\'s response.',
        documentationTip: 'Photograph wounds per agency policy as a supplement (not substitute) for written documentation. Photos without measurements in the clinical note are insufficient.',
      },
      {
        id: 'L7-02',
        title: 'Medication Management Documentation',
        context: 'Medication management is a core skilled nursing function but is frequently underdocumented in home health.',
        keyRule: 'Medication documentation must specify: which medications were reviewed/taught, the teaching method used, patient/caregiver demonstrated understanding (or lack thereof), barriers identified, medication reconciliation actions taken, and any physician communication regarding medication concerns.',
        whyItMatters: 'A significant portion of home health denials relate to medication management visits where documentation fails to prove that skilled assessment or teaching actually occurred — rather than simple medication setup that an aide could perform.',
        example: '"Assessed patient\'s current medication regimen against discharge orders. Identified discrepancy: patient taking Metformin 500mg BID (per discharge) but pharmacy filled Metformin 1000mg daily (per PCP order dated 02/15). Contacted PCP office — MD confirmed 1000mg daily is the intended current regimen and will send updated orders. Patient pill organizer set up for correct dosing. Educated patient on difference between previous and current dosing using teach-back: patient correctly stated \'one big pill in the morning instead of two small ones.\' Documented medication reconciliation results in patient record and notified case manager of resolved discrepancy."',
        keyTakeaway: 'Medication management documentation must prove SKILLED assessment, reconciliation, clinical judgment, or teaching — not just pill counting or refill coordination.',
        clinicalRisk: 'Medication errors are a leading cause of preventable hospitalizations in home health patients. Precise medication documentation protects both the patient and the clinician.',
      },
      {
        id: 'L7-03',
        title: 'Functional Assessment and ADL Documentation',
        context: 'Functional status documentation in home health directly impacts payment classification and must reflect the patient\'s actual, observed performance.',
        keyRule: 'Functional documentation must be based on direct observation of performance, not solely on patient self-report or historical records. Document what the patient actually DID, not what they or their caregiver said they can do.',
        whyItMatters: 'Functional status that is overstated reduces reimbursement. Functional status that is understated may trigger fraud scrutiny. Both must be avoided through accurate, observation-based documentation.',
        example: 'Insufficient: "Patient requires assist with ADLs." Defensible: "Observed patient transfer from wheelchair to bed: required standby assist for safety (patient able to initiate transfer independently using bed rail but exhibited unsteady balance during pivot, requiring CGA to prevent loss of balance). Patient completed upper body dressing independently but required minimum assist with lower body dressing due to limited hip flexion (unable to reach past mid-shin without compensatory trunk lean). Ambulation with rolling walker: supervised x 50 feet in hallway, gait steady, no loss of balance, mild shortness of breath at 40 feet (O2 sat 94% on room air, RR 22). Rest break taken, resumed x 30 feet to bedroom."',
        keyTakeaway: 'Document what you saw, not what you were told. Use functional performance descriptors that match standardized scales. Include distances, times, assistance levels, and safety concerns.',
        supervisorTip: 'Compare functional assessments across visits to ensure they tell a coherent trajectory story. Sudden, unexplained changes in functional levels should trigger clinician coaching.',
      },
      {
        id: 'L7-04',
        title: 'Change-in-Condition and Physician Communication',
        context: 'Documenting changes in patient condition and physician communication is critical for demonstrating timely clinical response.',
        keyRule: 'When a patient\'s condition changes, document: (1) the specific change observed, (2) comparison to baseline/last visit, (3) clinical assessment of the change, (4) immediate interventions taken, (5) physician notification (name, date, time, mode of communication, and physician response/orders received), (6) updated plan of care.',
        whyItMatters: 'Failure to document change-in-condition and timely physician communication creates both audit risk and professional liability. If a patient is hospitalized and there\'s no documentation of the home health agency recognizing and communicating clinical changes, the agency faces scrutiny.',
        example: '"During assessment, noted new onset bilateral lower extremity edema (2+ pitting to mid-calf), weight gain of 4 lbs in 3 days (from 168 to 172 lbs), and patient reports sleeping in recliner due to orthopnea x 2 nights. O2 sat 91% on room air (baseline 96%). Findings consistent with potential CHF exacerbation. Called Dr. Martinez at 1415 via office line — spoke directly with physician. Verbal order received to increase Lasix from 40mg daily to 40mg BID, obtain BMP in AM, and recheck weight and edema in 48 hours. Order read back and confirmed. See revised plan of care. Case manager notified of status change per agency protocol."',
        keyTakeaway: 'Change-in-condition documentation must demonstrate timely recognition, clinical reasoning, appropriate action, and complete physician communication — including the physician\'s response.',
        documentationTip: 'Document physician communication using the SBAR format: Situation (what happened), Background (relevant history), Assessment (your clinical interpretation), Recommendation (what you asked for/what was ordered).',
      },
    ],
  },
  // ────────────────────────────────────────────
  // Module 8: Case-Based Documentation Scenarios
  // ────────────────────────────────────────────
  {
    id: 'mod-8',
    number: 8,
    title: 'Case-Based Documentation Scenarios',
    description:
      'Apply your documentation knowledge to realistic, expert-level clinical scenarios. Each case requires you to identify layered documentation failures, distinguish superficially adequate notes from substantively deficient ones, and reason through the audit, clinical, and compliance implications.',
    estimatedMinutes: 45,
    learningObjectives: [
      'Analyze multi-layered clinical scenarios for hidden documentation deficiencies',
      'Distinguish between superficially adequate and substantively defensible documentation',
      'Apply documentation integrity principles to wound care, medication management, homebound status, and visit verification scenarios',
      'Evaluate documentation through the lens of an auditor, covering clinician, and compliance officer simultaneously',
    ],
    lessons: [
      {
        id: 'L8-01',
        title: 'The "Stable — No Change" Pattern',
        context: 'One of the most dangerous documentation patterns in home health is the copy-forward "stable — no change from last visit" note. When viewed in isolation, these notes may appear acceptable. When viewed across the episode, they reveal a pattern that signals either cloned documentation or failure to perform individualized assessment.',
        keyRule: 'Every visit note must contain an individualized assessment based on the current visit — not a reference to prior notes. "No change from last visit" is never acceptable as a substitute for documenting current clinical findings.',
        whyItMatters: 'Copy-forward documentation creates catastrophic audit risk through extrapolation. If an auditor identifies cloned documentation in a sample, they will extrapolate the denial rate across the entire population of claims — potentially resulting in millions of dollars in recoupment.',
        example: 'A series of wound care notes all stating "wound stable — no change from last visit" without measurements, wound bed descriptions, or drainage characteristics. Even if the wound is truly unchanged, each note must independently document the current wound status with objective data.',
        keyTakeaway: 'If your notes could be photocopied and inserted into any patient\'s chart without modification, they fail the individualization standard. Each note must stand alone as a complete clinical record of that specific visit.',
        auditRisk: 'Copy-forward patterns trigger expanded review scope. Auditors may extrapolate findings from a small sample across all claims from the same clinician or agency.',
      },
      {
        id: 'L8-02',
        title: 'The "Well-Documented" Note That Fails',
        context: 'Some visit notes contain detailed clinical content but fail audit review because they lack clinical reasoning and skilled need justification. Data points without synthesis and judgment documentation are insufficient.',
        keyRule: 'Clinical measurements, vital signs, and examination findings are necessary but not sufficient. The note must also document the clinical reasoning connecting findings to skilled interventions and ongoing plan of care.',
        whyItMatters: 'An auditor reviewing a PT note with exercises, repetitions, and ROM measurements will still deny the visit if there is no documentation of clinical reasoning, progression analysis, or justification for continued skilled therapy versus home exercise program.',
        example: 'A therapy visit that documents "TKE x 10, SLR x 10, heel slides x 15, AROM 98° (goal 120°), gait training x 100\' with FWW." This contains data but lacks: comparison to prior visit, gait quality assessment, clinical reasoning for continued skilled care, and functional progress toward discharge goals.',
        keyTakeaway: 'A note full of measurements but empty of clinical reasoning reads like an exercise log, not skilled therapy. Demonstrate the thinking, not just the doing.',
        clinicalRisk: 'Documentation that tracks exercises without clinical assessment may miss developing post-surgical complications in rehabilitation patients.',
      },
      {
        id: 'L8-03',
        title: 'The EVV Discrepancy Investigation',
        context: 'Electronic Visit Verification data creates an objective timeline that auditors compare against clinical documentation. Discrepancies between EVV timestamps and documented service scope raise serious program integrity concerns.',
        keyRule: 'Visit documentation scope must be reasonably consistent with EVV-recorded visit duration. A comprehensive 45-minute assessment documented against an 8-minute EVV check-in creates a presumption of documentation fabrication.',
        whyItMatters: 'EVV discrepancies are used in fraud investigations by ZPICs and state Medicaid Fraud Control Units. Patterns of discrepancy can trigger criminal prosecution, not just civil administrative actions.',
        example: 'A nurse\'s EVV shows 8-12 minute visits while notes document 30-45 minute comprehensive assessments. The nurse explains "I document from memory in the car." Memory-based documentation is not contemporaneous and introduces unreliability that undermines the medical record\'s integrity.',
        keyTakeaway: 'Document during or immediately after providing care. Your documentation timeline should match your visit verification timeline. Discrepancies are red flags that auditors actively look for.',
        auditRisk: 'EVV discrepancies meeting fraud criteria are referred to the Office of Inspector General. This is a criminal investigation pathway, not merely an administrative one.',
      },
      {
        id: 'L8-04',
        title: 'The Homebound Status Documentation Gap',
        context: 'Homebound status is a condition of coverage for the entire home health episode. Insufficient homebound documentation — even with otherwise excellent clinical notes — can result in denial of every visit in the episode.',
        keyRule: 'Homebound documentation must specify: the condition restricting the patient, specific functional limitations, why leaving home requires considerable and taxing effort, and how any community outings are infrequent/short duration or for medical treatment.',
        whyItMatters: '"Patient is homebound due to [diagnosis]" fails every audit. A diagnosis is not a functional limitation. The documentation must describe what the patient cannot do and what effort leaving home requires — not merely name the disease that causes the limitation.',
        example: 'Insufficient: "Patient homebound due to COPD." Defensible: "Patient homebound — severe COPD with chronic hypoxia, requires continuous O2 at 3L/min via nasal cannula. Ambulation limited to 30 feet before SOB requires seated rest. Leaving home requires considerable effort: portable O2 setup, wheelchair for distances >50 feet, and standby assist from family for vehicle transfers. Non-medical outings are infrequent and of short duration with family assistance required throughout."',
        keyTakeaway: 'Homebound status documentation must paint a functional picture that makes the reader understand why this specific patient cannot routinely leave home. Diagnosis alone never suffices.',
        supervisorTip: 'Review homebound documentation at every supervisory visit. If the patient\'s functional status changes or community mobility improves, ensure homebound documentation is updated — not just maintained at the original level.',
      },
    ],
  },
  // ────────────────────────────────────────────
  // Module 9: Knowledge Check
  // ────────────────────────────────────────────
  {
    id: 'mod-9',
    number: 9,
    title: 'Knowledge Check',
    description:
      'Test your understanding of documentation integrity principles through targeted questions. These items assess your ability to identify documentation failures, understand regulatory requirements, and apply compliance principles in clinical scenarios.',
    estimatedMinutes: 20,
    learningObjectives: [
      'Demonstrate understanding of skilled need documentation requirements',
      'Identify specific documentation elements missing from deficient visit notes',
      'Apply the 60-day overpayment reporting rule to realistic compliance scenarios',
      'Evaluate self-audit program validity based on CMS guidelines',
    ],
    lessons: [],
  },
  // ────────────────────────────────────────────
  // Module 10: Final Assessment
  // ────────────────────────────────────────────
  {
    id: 'mod-10',
    number: 10,
    title: 'Final Assessment',
    description:
      'Comprehensive assessment combining all knowledge check questions with expert-level case-based scenarios. You must demonstrate mastery across regulatory foundations, documentation standards, audit readiness, and clinical scenario analysis to achieve a passing score.',
    estimatedMinutes: 45,
    learningObjectives: [
      'Synthesize documentation integrity knowledge across all course modules',
      'Analyze complex, multi-layered clinical scenarios for interconnected documentation failures',
      'Demonstrate expert-level reasoning about audit, compliance, and clinical implications',
      'Apply documentation principles to novel scenarios not previously encountered in the course',
    ],
    lessons: [],
  },
  // ────────────────────────────────────────────
  // Module 11: Course Evaluation
  // ────────────────────────────────────────────
  {
    id: 'mod-11',
    number: 11,
    title: 'Course Evaluation & Completion',
    description:
      'Complete your course evaluation and receive your certificate of completion. Your feedback helps us improve the training experience for future learners.',
    estimatedMinutes: 5,
    learningObjectives: [
      'Reflect on key documentation integrity concepts learned throughout the course',
      'Identify areas for continued professional development in clinical documentation',
    ],
    lessons: [
      {
        id: 'L11-01',
        title: 'Key Documentation Principles Review',
        context: 'Before completing the course, review the core documentation integrity principles covered throughout training.',
        keyRule: 'Every piece of clinical documentation serves three simultaneous purposes: supporting patient care continuity, demonstrating compliance with regulatory requirements, and providing a defensible record under audit. Documentation that fails any of these purposes is incomplete.',
        whyItMatters: 'Documentation integrity is not a one-time training topic — it is an ongoing professional competency that affects patient safety, organizational compliance, and individual licensure.',
        example: 'After completing this course, apply the "auditor test" to every note you write: if a federal auditor read this note without any other context, would they be able to determine (1) what skilled service was provided, (2) why it was medically necessary, (3) what clinical findings support the intervention, and (4) what the plan is going forward?',
        keyTakeaway: 'Documentation is clinical care. What is not documented was not done. What is documented poorly may as well not have been done at all. Make every note count.',
      },
    ],
  },
]

// Attach topic scenarios to lessons from the separate content file
import { topicScenarios } from './topicScenarios'
for (const mod of modules) {
  for (const lesson of mod.lessons) {
    const scenario = topicScenarios[lesson.id]
    if (scenario) lesson.scenario = scenario
  }
}
