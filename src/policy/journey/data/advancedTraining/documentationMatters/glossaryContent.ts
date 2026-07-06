/**
 * Glossary content for the CMS Documentation Matters Toolkit.
 * 30+ terms covering CMS compliance, documentation integrity, and home health.
 */

export interface GlossaryTerm {
  term: string
  category: GlossaryCategory
  definition: string
}

export type GlossaryCategory =
  | 'Coverage & Billing'
  | 'Documentation Standards'
  | 'Compliance & Oversight'
  | 'Clinical Documentation'
  | 'Quality & Improvement'

export const glossaryCategories: GlossaryCategory[] = [
  'Coverage & Billing',
  'Documentation Standards',
  'Compliance & Oversight',
  'Clinical Documentation',
  'Quality & Improvement',
]

export const glossaryTerms: GlossaryTerm[] = [
  // ═══ Coverage & Billing ═══
  {
    term: 'Medicaid',
    category: 'Coverage & Billing',
    definition:
      'A joint federal-state program that provides health coverage for eligible individuals. Medicaid claims require documentation that fully discloses the precise extent of services, care, and supplies furnished.',
  },
  {
    term: 'Medicare',
    category: 'Coverage & Billing',
    definition:
      'The federal health insurance program for individuals 65 and older and certain younger people with disabilities. Medicare Part A covers home health services when the patient meets homebound, skilled need, and plan of care requirements.',
  },
  {
    term: 'Billed Code',
    category: 'Coverage & Billing',
    definition:
      'The procedure or service code submitted on a claim for reimbursement. Documentation must support that the coded service was actually performed and was medically necessary for the patient.',
  },
  {
    term: 'Medical Necessity',
    category: 'Coverage & Billing',
    definition:
      'The CMS standard requiring that services be reasonable and necessary for the diagnosis or treatment of an illness or injury, or to improve, maintain, or slow the decline of a patient\'s functional abilities. Documentation must clearly articulate why the specific service was needed for this patient at this time.',
  },
  {
    term: 'Skilled Need',
    category: 'Coverage & Billing',
    definition:
      'A care requirement that demands the education, training, and clinical judgment of a licensed professional (RN, PT, OT, SLP, MSW). Visit notes must explain why the intervention could not be safely performed by non-skilled personnel such as a home health aide.',
  },
  {
    term: 'Homebound Status',
    category: 'Coverage & Billing',
    definition:
      'A Medicare eligibility criterion requiring that leaving the home demands considerable and taxing effort due to illness, injury, or functional limitation. Must be documented with specific functional language at every encounter — not just "patient is homebound."',
  },
  {
    term: 'Face-to-Face Encounter (F2F)',
    category: 'Coverage & Billing',
    definition:
      'A required in-person encounter between the patient and the certifying or ordering physician (or qualifying NP/PA/CNS) that must occur within specific timeframes related to the start or recertification of the home health episode. The encounter must be related to the primary reason for home health services.',
  },
  {
    term: 'Plan of Care (485)',
    category: 'Coverage & Billing',
    definition:
      'The physician-signed document (CMS-485) that establishes the patient\'s diagnoses, functional limitations, medications, DME, visit frequency, treatment orders, goals, and discharge plans. Visit notes must align with the 485 — any discrepancy is a denial risk.',
  },
  {
    term: 'Covered Service',
    category: 'Coverage & Billing',
    definition:
      'A home health service that meets all Medicare coverage criteria: ordered by a physician, provided by a qualified professional, medically necessary, and properly documented. Skilled nursing, PT, OT, SLP, MSW, and HHA (when a skilled service is active) are potentially covered services.',
  },
  {
    term: 'Non-Covered Service',
    category: 'Coverage & Billing',
    definition:
      'A service that does not meet Medicare coverage criteria. Examples include visits documenting only vital signs with no skilled intervention, venipuncture as the sole service, duplicate visits without clinical justification, and services not ordered on the plan of care.',
  },
  {
    term: 'Denial',
    category: 'Coverage & Billing',
    definition:
      'A CMS contractor determination that a billed service does not meet coverage, coding, or documentation requirements. Denials result in non-payment and may trigger additional audits. The most common home health denial reasons are insufficient documentation of medical necessity, homebound status, and face-to-face encounters.',
  },
  {
    term: 'Recoupment',
    category: 'Coverage & Billing',
    definition:
      'The recovery of Medicare payments previously made for claims determined to be improperly billed. After a denied claim is finalized through the appeals process, CMS recoups the payment — often by offsetting against future claims.',
  },
  {
    term: 'Visit Note',
    category: 'Coverage & Billing',
    definition:
      'The clinical documentation generated for each home health encounter. Must document the skilled service provided, the patient\'s response, progress toward goals, homebound status, and the plan for the next visit. This is the primary document auditors review to verify billed services.',
  },
  {
    term: 'Episode of Care',
    category: 'Coverage & Billing',
    definition:
      'A 60-day period during which a home health patient receives services under a single plan of care. Payment is based on the episode, and recertification is required for each subsequent episode. Documentation must support continued eligibility throughout.',
  },
  {
    term: 'Recertification',
    category: 'Coverage & Billing',
    definition:
      'The process of renewing a patient\'s home health episode for an additional 60 days. Requires a new physician certification, updated plan of care, and a face-to-face encounter narrative. Documentation must demonstrate ongoing medical necessity and homebound status.',
  },
  {
    term: 'Prior Authorization',
    category: 'Coverage & Billing',
    definition:
      'A CMS requirement for certain home health services in specific regions where approval must be obtained before services begin. The Review Choice Demonstration (RCD) program requires pre-claim review to verify documentation supports coverage criteria.',
  },
  {
    term: 'ADR (Additional Documentation Request)',
    category: 'Coverage & Billing',
    definition:
      'A request from a Medicare contractor (MAC, UPIC, or RAC) for clinical documentation to support a previously submitted claim. Failure to respond within the deadline (typically 45 days) results in automatic denial of the claim.',
  },
  {
    term: 'PDGM (Patient-Driven Groupings Model)',
    category: 'Coverage & Billing',
    definition:
      'The Medicare payment model for home health effective January 2020. Payment is determined by clinical grouping, functional level, comorbidity, and admission source — all derived from OASIS and claims data. Accurate documentation directly drives reimbursement accuracy.',
  },
  {
    term: 'LUPA (Low-Utilization Payment Adjustment)',
    category: 'Coverage & Billing',
    definition:
      'A reduced per-visit payment applied when a 30-day period has fewer visits than the LUPA threshold (typically 2-6 visits depending on the clinical group). Agencies must document why the patient required fewer visits than planned.',
  },
  {
    term: 'RAP (Request for Anticipated Payment)',
    category: 'Coverage & Billing',
    definition:
      'A notice of admission (NOA) submitted to Medicare to establish the start of a home health episode. Must be submitted within 5 calendar days of the first billable visit. Late submission can result in reduced reimbursement.',
  },

  // ═══ Documentation Standards ═══
  {
    term: 'Clinical Reasoning',
    category: 'Documentation Standards',
    definition:
      'The clinician\'s explicit thought process linking assessment findings to care decisions, interventions, and follow-up plans. Defensible documentation shows why specific actions were chosen for this patient at this time.',
  },
  {
    term: 'Skilled Intervention',
    category: 'Documentation Standards',
    definition:
      'A patient-care action that requires licensed clinical judgment, not just task completion. Documentation should identify the intervention, why skilled expertise was required, and how the patient responded.',
  },
  {
    term: 'Contemporaneous Documentation',
    category: 'Documentation Standards',
    definition:
      'Documentation created at or near the time of the clinical encounter. Notes written days or weeks after the visit from memory are considered unreliable. EMR systems record metadata timestamps that auditors use to verify documentation timeliness.',
  },
  {
    term: 'Copy-Forward',
    category: 'Documentation Standards',
    definition:
      'The practice of carrying text from a prior note into a new note without modification. Copy-forward is the single most audited documentation pattern in home health because it suggests either lack of individualized assessment or no change in patient status (questioning medical necessity).',
  },
  {
    term: 'Authentication',
    category: 'Documentation Standards',
    definition:
      'The process of confirming that a clinical document was created and signed by the identified author. Authentication requires timely signature, correct attribution, and for electronic records, compliant electronic signature methodology. Unsigned or improperly authenticated records may be excluded from the evidentiary record.',
  },
  {
    term: 'Record Retention',
    category: 'Documentation Standards',
    definition:
      'Medicare Conditions of Participation require home health agencies to retain clinical records for at least 5 years after discharge (longer in some states). Records must be stored securely and be retrievable for audit or legal proceedings during the retention period.',
  },
  {
    term: 'Documentation Integrity',
    category: 'Documentation Standards',
    definition:
      'The principle that clinical records must be accurate, complete, timely, individualized, and internally consistent. Documentation integrity means the chart can be relied upon by auditors, other clinicians, and legal reviewers as a truthful record of the care provided.',
  },
  {
    term: 'Individualized Documentation',
    category: 'Documentation Standards',
    definition:
      'Documentation that reflects the specific clinical findings, interventions, and responses of a particular patient on a particular date of service. A note that could be swapped into another patient\'s chart without anyone noticing fails individualization and raises audit flags.',
  },
  {
    term: 'Clinical Specificity',
    category: 'Documentation Standards',
    definition:
      'The use of measurable, observable, and objective clinical data rather than vague or subjective language. "Patient tolerating diet well" is vague. "Patient consumed 75% of pureed diet without coughing, aspiration precautions maintained, no signs of distress" is clinically specific.',
  },
  {
    term: 'Narrative Defensibility',
    category: 'Documentation Standards',
    definition:
      'The quality of a clinical narrative being sufficiently detailed and specific that it can withstand external review — by an auditor, legal examiner, or peer reviewer — and still support the services billed, the clinical decisions made, and the medical necessity of care.',
  },
  {
    term: 'Supportive Documentation',
    category: 'Documentation Standards',
    definition:
      'Documentation elements that reinforce the primary clinical record: communication logs, lab reports, wound measurement records, therapy flow sheets, and physician orders. Supportive documentation strengthens the chart but does not replace the visit note.',
  },
  {
    term: 'Insufficient Documentation',
    category: 'Documentation Standards',
    definition:
      'Documentation that fails to support the service billed. A note may be insufficient due to vague language, missing patient response, absent homebound justification, or lack of skilled service description. Insufficient documentation is the most common basis for claim denial.',
  },
  {
    term: 'Late Entry',
    category: 'Documentation Standards',
    definition:
      'A clinical note added to the record after the expected documentation timeframe. Late entries must be clearly labeled as such, dated with the actual writing date, and reference the date of the encounter being documented. Auditors scrutinize late entries for accuracy.',
  },
  {
    term: 'Addendum',
    category: 'Documentation Standards',
    definition:
      'A supplemental note added to an existing clinical document to provide additional information, clarify details, or correct errors discovered after the original note was authenticated. Must reference the original entry and be signed and dated.',
  },
  {
    term: 'Point-of-Care Documentation',
    category: 'Documentation Standards',
    definition:
      'Clinical documentation completed at the patient\'s bedside or during the home visit using mobile devices or laptops. Point-of-care documentation improves accuracy and timeliness, reducing reliance on memory and minimizing copy-forward patterns.',
  },
  {
    term: 'Progress Toward Goals',
    category: 'Documentation Standards',
    definition:
      'The documented evidence that a patient is moving toward, maintaining, or declining from the goals established in the plan of care. Every visit note must address progress to justify continued skilled services and medical necessity.',
  },

  // ═══ Compliance & Oversight ═══
  {
    term: 'Social Security Act (SSA)',
    category: 'Compliance & Oversight',
    definition:
      'The federal statute that establishes key Medicare and Medicaid program requirements, including documentation and payment integrity obligations for participating providers.',
  },
  {
    term: 'SSA § 1902(a)(27)',
    category: 'Compliance & Oversight',
    definition:
      'A Social Security Act section requiring Medicaid providers to maintain records that fully disclose the precise extent of services, care, and supplies furnished to beneficiaries.',
  },
  {
    term: 'Conditions of Participation (CoPs)',
    category: 'Compliance & Oversight',
    definition:
      'The federal regulatory requirements (42 CFR Part 484) that home health agencies must meet to participate in the Medicare program. CoPs cover patient rights, care planning, quality assessment, personnel qualifications, clinical records, and organizational structure.',
  },
  {
    term: '42 CFR Part 484',
    category: 'Compliance & Oversight',
    definition:
      'The Code of Federal Regulations section containing all Medicare Conditions of Participation for home health agencies. Covers organizational structure, patient rights, comprehensive assessment, care planning, quality assessment, skilled services, and clinical record requirements.',
  },
  {
    term: 'MAC (Medicare Administrative Contractor)',
    category: 'Compliance & Oversight',
    definition:
      'Regional contractors that process and pay Medicare claims and conduct pre- and post-payment reviews. MACs issue Additional Documentation Requests (ADRs) and make coverage determinations. Each region has a designated MAC.',
  },
  {
    term: 'UPIC (Unified Program Integrity Contractor)',
    category: 'Compliance & Oversight',
    definition:
      'CMS contractors responsible for identifying and investigating fraud, waste, and abuse in the Medicare program. UPICs have administrative authority to impose payment suspensions, referrals for law enforcement, and medical review. A UPIC audit is significantly more consequential than a routine MAC review.',
  },
  {
    term: 'RAC (Recovery Audit Contractor)',
    category: 'Compliance & Oversight',
    definition:
      'CMS contractors that identify and recover improper Medicare payments through post-payment review. RACs are paid on a contingency basis — they earn a percentage of recovered overpayments — which incentivizes aggressive auditing of vulnerable claim types including home health.',
  },
  {
    term: 'OIG (Office of Inspector General)',
    category: 'Compliance & Oversight',
    definition:
      'The HHS oversight body responsible for investigating fraud, waste, and abuse in Medicare and Medicaid. OIG publishes an annual Work Plan identifying audit priorities. Home health documentation is a perennial focus area. OIG can impose Civil Monetary Penalties and exclusion from federal programs.',
  },
  {
    term: 'False Claims Act (FCA)',
    category: 'Compliance & Oversight',
    definition:
      'Federal law (31 U.S.C. §§ 3729-3733) imposing liability on persons who submit false claims to the government. In home health, submitting claims for services not rendered, not documented, or not medically necessary can trigger FCA liability with treble damages and per-claim penalties.',
  },
  {
    term: 'Anti-Kickback Statute (AKS)',
    category: 'Compliance & Oversight',
    definition:
      'Federal law prohibiting offering, paying, soliciting, or receiving anything of value to induce or reward referrals for services covered by federal healthcare programs. Violations can result in criminal prosecution, civil penalties, and program exclusion.',
  },
  {
    term: 'Stark Law',
    category: 'Compliance & Oversight',
    definition:
      'The physician self-referral law prohibiting physicians from referring Medicare patients for designated health services to entities with which the physician has a financial relationship, unless a specific exception applies. Violations result in denial of payment and potential False Claims Act liability.',
  },
  {
    term: 'Payment Integrity',
    category: 'Compliance & Oversight',
    definition:
      'CMS\'s overarching initiative to ensure that Medicare pays the right amount to the right provider for the right service. Payment integrity activities include pre- and post-payment review, data analytics, audits, and fraud investigations. Documentation is the primary evidence in all payment integrity determinations.',
  },
  {
    term: 'Audit Trail',
    category: 'Compliance & Oversight',
    definition:
      'A chronological record of documentation creation, modification, and access events. EMR audit trails capture who created a note, when it was created, when it was signed, and any subsequent amendments. Auditors review audit trails to identify late documentation, backdating, and unauthorized modifications.',
  },
  {
    term: 'Corporate Compliance Program',
    category: 'Compliance & Oversight',
    definition:
      'A structured program required by OIG guidance that includes written policies, a compliance officer, training, a reporting hotline, internal monitoring, disciplinary standards, and corrective action procedures. Demonstrates organizational commitment to preventing fraud and abuse.',
  },
  {
    term: 'Exclusion (OIG/SAM)',
    category: 'Compliance & Oversight',
    definition:
      'Prohibition from participation in federal healthcare programs. Excluded individuals or entities cannot provide services billed to Medicare or Medicaid. Agencies must screen all employees monthly against the OIG LEIE and SAM databases. Employing an excluded individual triggers severe penalties.',
  },
  {
    term: 'Civil Monetary Penalties (CMP)',
    category: 'Compliance & Oversight',
    definition:
      'Financial penalties imposed by OIG for various violations including submitting false claims, employing excluded individuals, or violating the Anti-Kickback Statute. CMPs can reach $100,000 per violation plus treble damages.',
  },
  {
    term: 'Qui Tam (Whistleblower)',
    category: 'Compliance & Oversight',
    definition:
      'A provision of the False Claims Act allowing private individuals to file lawsuits on behalf of the government against entities submitting false claims. Whistleblowers (relators) may receive 15-30% of recovered funds. Many major home health fraud cases originate from qui tam actions.',
  },

  // ═══ Clinical Documentation ═══
  {
    term: 'Patient Response',
    category: 'Clinical Documentation',
    definition:
      'The patient\'s reaction to the skilled intervention provided during the visit. Documenting what was done without recording how the patient responded is a major documentation deficiency. "Applied wound dressing" is incomplete. "Applied silver alginate; patient reported 3/10 pain, no signs of infection noted" includes the response.',
  },
  {
    term: 'Physician Communication',
    category: 'Clinical Documentation',
    definition:
      'Documentation of interaction with the ordering or certifying physician regarding changes in patient condition, medication adjustments, or plan of care modifications. "MD notified" is insufficient — the note must include who was contacted, what was communicated, and the physician\'s response or orders.',
  },
  {
    term: 'OASIS (Outcome and Assessment Information Set)',
    category: 'Clinical Documentation',
    definition:
      'A standardized CMS data collection tool used at specific time points (SOC, recertification, transfer, discharge, death) to measure patient outcomes, plan care, and determine Medicare payment. OASIS responses must be consistent with visit note documentation throughout the episode.',
  },
  {
    term: 'Start of Care (SOC)',
    category: 'Clinical Documentation',
    definition:
      'The initial visit to a home health patient that establishes the baseline assessment, OASIS data collection, and plan of care development. SOC documentation sets the foundation for the entire episode — all subsequent notes are compared against this baseline.',
  },
  {
    term: 'Discharge Summary',
    category: 'Clinical Documentation',
    definition:
      'A comprehensive document completed when a patient is discharged from home health services. Must include the reason for discharge, goals achieved, current functional status, medications, follow-up plans, and any referrals. Discharge OASIS data measures outcomes against SOC baseline.',
  },
  {
    term: 'Comprehensive Assessment',
    category: 'Clinical Documentation',
    definition:
      'A thorough evaluation of a patient\'s medical, nursing, rehabilitative, and social needs required at start of care and recertification. Must incorporate OASIS data items and result in an individualized plan of care. 42 CFR § 484.55 mandates this assessment.',
  },
  {
    term: 'Functional Limitation',
    category: 'Clinical Documentation',
    definition:
      'A documented restriction in a patient\'s ability to perform activities of daily living (ADLs) or instrumental activities of daily living (IADLs). Functional limitations must be described with specific, measurable terms — not generic statements like "limited mobility."',
  },
  {
    term: 'Vital Signs',
    category: 'Clinical Documentation',
    definition:
      'Measurements of body temperature, pulse, respiration, blood pressure, and oxygen saturation recorded during a clinical visit. Vital signs alone do not constitute skilled care — documentation must connect abnormal findings to clinical reasoning and skilled intervention.',
  },
  {
    term: 'Medication Reconciliation',
    category: 'Clinical Documentation',
    definition:
      'The process of comparing the patient\'s current medication regimen against the plan of care, physician orders, and what the patient is actually taking. Must be documented at every visit to identify discrepancies, non-adherence, adverse effects, and drug interactions.',
  },
  {
    term: 'Wound Assessment',
    category: 'Clinical Documentation',
    definition:
      'Standardized documentation of wound characteristics: location, size (length × width × depth), stage/type, bed tissue, drainage (type, amount, odor), periwound skin, and pain level. Must be measured and documented at every wound care visit to track healing trajectory.',
  },
  {
    term: 'Fall Risk Assessment',
    category: 'Clinical Documentation',
    definition:
      'A standardized evaluation (e.g., Tinetti, Berg, Timed Up and Go) of a patient\'s risk for falls. Must include specific scores, identified risk factors, interventions implemented, and patient/caregiver education. Fall prevention is a CMS quality measure.',
  },
  {
    term: 'Care Coordination',
    category: 'Clinical Documentation',
    definition:
      'Documentation of communication between disciplines (nursing, therapy, social work, aide) and external providers (physicians, specialists, facilities). Must capture what was communicated, to whom, when, and the outcome. Poor care coordination documentation is a common survey deficiency.',
  },
  {
    term: 'Patient Education',
    category: 'Clinical Documentation',
    definition:
      'Documentation of teaching provided to the patient and/or caregiver. Must include the topic taught, method used, patient\'s response and level of understanding, and any barriers to learning. "Patient educated on medications" is insufficient — specifics are required.',
  },
  {
    term: 'Skilled Nursing Visit',
    category: 'Clinical Documentation',
    definition:
      'A home health encounter performed by an RN or LVN that includes assessment, skilled intervention, patient education, care coordination, and documentation. Every skilled nursing visit must demonstrate why the services required the skills of a licensed nurse.',
  },

  // ═══ Quality & Improvement ═══
  {
    term: 'Corrective Action Plan (CAP)',
    category: 'Quality & Improvement',
    definition:
      'A structured plan that identifies a documentation or compliance deficiency, determines the root cause, defines corrective actions with responsible parties and deadlines, and establishes monitoring to verify sustained improvement. Effective CAPs address systemic issues, not just individual errors.',
  },
  {
    term: 'Root Cause Analysis',
    category: 'Quality & Improvement',
    definition:
      'A systematic method for identifying the underlying cause of a documentation deficiency or compliance failure. Asks "why" iteratively until the fundamental process breakdown is identified. Root causes are typically systemic (training gaps, workflow design, technology limitations) rather than individual.',
  },
  {
    term: 'QA Chart Review',
    category: 'Quality & Improvement',
    definition:
      'An internal quality assurance process where supervisors or QA staff review clinical records against documentation standards before or after claim submission. Proactive chart review identifies deficiencies that can be corrected before they become denials.',
  },
  {
    term: 'QAPI (Quality Assessment and Performance Improvement)',
    category: 'Quality & Improvement',
    definition:
      'A CMS-required program (42 CFR § 484.65) mandating that home health agencies continuously identify, analyze, and address quality issues. QAPI must use data-driven approaches, track measurable outcomes, and involve governing body oversight.',
  },
  {
    term: 'HHQRP (Home Health Quality Reporting Program)',
    category: 'Quality & Improvement',
    definition:
      'A CMS program requiring home health agencies to submit quality data (primarily through OASIS) to receive the full annual payment update. Failure to meet reporting requirements results in a 2% payment reduction.',
  },
  {
    term: 'Star Ratings',
    category: 'Quality & Improvement',
    definition:
      'CMS\'s public quality rating system for home health agencies displayed on Care Compare. Ratings (1-5 stars) are based on OASIS outcome measures, patient satisfaction (HHCAHPS), and claims-based measures. Documentation accuracy directly impacts star ratings.',
  },
  {
    term: 'HHCAHPS (Home Health CAHPS)',
    category: 'Quality & Improvement',
    definition:
      'The standardized patient satisfaction survey for home health agencies. Measures patient experience across domains including communication, care coordination, and willingness to recommend. Results are publicly reported and factor into star ratings.',
  },
  {
    term: 'Outcome Measures',
    category: 'Quality & Improvement',
    definition:
      'Standardized metrics derived from OASIS data that measure changes in patient status between time points (e.g., improvement in ambulation, improvement in pain management). Accurate OASIS documentation at SOC and discharge is essential for valid outcome measurement.',
  },
  {
    term: 'Process Measures',
    category: 'Quality & Improvement',
    definition:
      'Quality indicators that measure whether specific evidence-based care processes were performed (e.g., timely initiation of care, drug education on all medications, fall risk assessment). Documented in OASIS and visit notes.',
  },
  {
    term: 'Benchmarking',
    category: 'Quality & Improvement',
    definition:
      'Comparing an agency\'s documentation quality metrics, denial rates, and clinical outcomes against national, state, or regional benchmarks. Identifies areas where documentation practices may need improvement relative to peers.',
  },
  {
    term: 'Sentinel Event',
    category: 'Quality & Improvement',
    definition:
      'An unexpected occurrence involving death or serious physical or psychological injury. In home health, sentinel events include patient falls with serious injury, medication errors, and missed visits resulting in patient harm. Documentation of the event, investigation, and corrective actions is mandatory.',
  },
  {
    term: 'Performance Improvement Project (PIP)',
    category: 'Quality & Improvement',
    definition:
      'A structured QAPI initiative targeting a specific documentation or clinical practice deficiency. Follows a Plan-Do-Study-Act (PDSA) cycle with measurable objectives, defined interventions, data collection, and outcome evaluation.',
  },
]
