/**
 * Topic-Integrated Scenarios — Expert-Level Clinical Challenges
 *
 * Each lesson topic includes one scenario that tests the learner's ability to
 * apply the lesson's principles to a realistic clinical situation. These are
 * single-attempt, no-retry challenges with 4-part rationale feedback.
 */
import type { TopicScenario } from './courseContent'

export const topicScenarios: Record<string, TopicScenario> = {

  // ═══════════════════════════════════════════════
  // MODULE 1: Why Documentation Matters
  // ═══════════════════════════════════════════════

  'L1-01': {
    id: 'TS-L1-01',
    stem: 'An RN conducts a 45-minute skilled nursing visit for a patient with a Stage III sacral pressure injury. The visit includes wound measurement, debridement assessment, periwound skin evaluation, dressing application with clinical rationale, and caregiver education on repositioning technique. The visit note reads: "Arrived at patient home. Wound care provided per plan of care. Dressing changed. Patient tolerable. Will continue to monitor." The nurse recalls performing every element of care but documented none of the specifics. Which statement BEST describes the primary documentation failure?',
    options: [
      { id: 'A', text: 'The note does not include the time of arrival and departure, making it impossible to verify the 45-minute visit duration against EVV records.' },
      { id: 'B', text: 'The note fails to include wound measurements, wound bed characteristics, drainage assessment, treatment rationale, and caregiver response — reducing a complex skilled assessment to generic language that could describe any wound care visit for any patient and failing to "fully disclose the precise extent of services" as required by SSA § 1902(a)(27).' },
      { id: 'C', text: 'The note is missing the attending physician\'s countersignature, which is required for all wound care visits billed under Medicare Part A.' },
      { id: 'D', text: 'The note should have included a wound photograph, which would replace the need for written clinical findings and establish the wound baseline.' },
    ],
    correctOptionId: 'B',
    rationale: {
      whyCorrect: 'The documentation imperative means that documentation IS the legal proof that care was provided. The nurse\'s memory of what occurred is legally irrelevant — only what appears in the written record exists. This note reduces a complex 45-minute skilled assessment to generic language that fails to disclose the extent of services as required by the Social Security Act.',
      whatDocumentationShouldShow: 'Wound type, location, stage, measurements (L × W × D), wound bed characteristics (% granulation, slough, necrotic tissue), drainage type and amount, periwound condition, pain assessment, specific interventions with clinical rationale, caregiver response to education, and comparison to previous assessment.',
      auditorConclusion: 'The auditor cannot determine what skilled services were actually rendered. The note could describe a 5-minute aide-level dressing change. Without objective clinical findings, the claim fails the medical necessity test and would be denied.',
      clinicalRisk: 'The next clinician visiting this patient has no baseline wound data for comparison. If the wound deteriorates, there is no documented trajectory. Change-in-condition assessments lack a comparison point, compromising care continuity.',
      complianceRisk: 'Billing for skilled nursing wound care while documenting only aide-level activity creates a false claim. Systematic documentation at this level triggers targeted probe review and potential False Claims Act liability.',
    },
  },

  'L1-02': {
    id: 'TS-L1-02',
    stem: 'A home health agency\'s quarterly internal audit reveals that 22% of skilled nursing claims lack documentation supporting the skilled need for the visit. The compliance officer presents this finding to the administrator, who responds: "Our denial rate is only 4%, so our documentation is fine. Those denied claims are just paperwork issues. Focus your auditing resources on the therapy department instead — they\'re the real problem." Which statement BEST identifies the fundamental flaw in the administrator\'s reasoning?',
    options: [
      { id: 'A', text: 'The administrator should wait for annual PERM review results before making resource allocation decisions about compliance auditing.' },
      { id: 'B', text: 'The therapy department typically has higher denial rates than nursing in home health, so the administrator\'s suggestion to redirect resources is well-founded and cost-effective.' },
      { id: 'C', text: 'The 4% denial rate reflects only claims that have been externally reviewed — the 22% internal deficiency rate reveals systemic documentation vulnerability that will materialize when a MAC, ZPIC, or RAC audit targets the agency with a statistically valid sample. A 22% failure rate in a targeted audit would trigger extrapolated recoupment across the entire claims population.' },
      { id: 'D', text: 'The compliance officer should not have conducted the internal audit without the administrator\'s prior written approval, as unauthorized audits create discoverable legal liability.' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'The low external denial rate creates false confidence. External payers review a tiny fraction of claims. The internal audit\'s 22% deficiency rate is the agency\'s true documentation quality indicator. When an external audit targets the agency with a statistically valid sample, that 22% failure rate will drive extrapolated recoupment across the entire claim population — far exceeding the cost of proactive correction.',
      whatDocumentationShouldShow: 'Each skilled nursing visit note must contain clinical evidence justifying WHY a skilled professional was required — assessment findings, clinical judgment exercised, complexity exceeding aide-level capability, and the specific skilled interventions provided.',
      auditorConclusion: 'A 22% deficiency rate in a probe audit would classify the agency as high-risk for targeted medical review. The MAC would likely initiate 100% pre-payment review, requiring the agency to prove medical necessity before receiving payment on every claim.',
      clinicalRisk: 'Notes lacking skilled need documentation suggest either that visits did not actually require skilled intervention (potential overutilization) or that skilled care WAS provided but not documented (placing patient safety communication at risk).',
      complianceRisk: 'Ignoring a known 22% documentation deficiency rate after internal audit discovery triggers the 60-day overpayment reporting obligation. The administrator\'s refusal to act converts an administrative lapse into potential False Claims Act exposure.',
    },
  },

  'L1-03': {
    id: 'TS-L1-03',
    stem: 'A physical therapist documents a home health visit: "Patient progressing well with gait training. Ambulated in hallway with rolling walker. Exercises given. Continue plan." Two days later, the home health aide provides personal care and notices the patient grimacing during transfers. The PT\'s note recorded no specific functional limitations, distance parameters, safety precautions, or transfer technique modifications. The aide proceeds with the standard single-person transfer technique. During a shower transfer, the patient loses balance and sustains a hip fracture. Which statement BEST explains how the documentation failure contributed to this adverse event?',
    options: [
      { id: 'A', text: 'The PT\'s vague documentation deprived subsequent caregivers of critical information about the patient\'s functional limitations, safety risks, and required precautions — the aide had no documented basis for modifying the transfer approach, and the lack of specific instructions removed the safety information that interdisciplinary communication is designed to provide.' },
      { id: 'B', text: 'The aide should have contacted the PT before attempting any transfer regardless of what was documented, because all transfers require therapist clearance.' },
      { id: 'C', text: 'The PT should have documented a standardized fall risk assessment score, which would have automatically triggered mandatory two-person transfer protocols per CMS guidelines.' },
      { id: 'D', text: 'The agency should have a policy requiring all aides to use two-person transfers for every patient receiving concurrent physical therapy services.' },
    ],
    correctOptionId: 'A',
    rationale: {
      whyCorrect: 'Documentation serves as the primary communication tool between interdisciplinary team members in home health. The PT\'s vague note eliminated the safety information chain — the aide had no way to know about specific functional limitations, pain patterns, or required transfer modifications because none were documented. The documentation failure directly removed the clinical information that would have prompted modified care.',
      whatDocumentationShouldShow: 'Specific functional limitations observed during assessment, exact distances ambulated with gait quality description, transfer technique and assist level required, safety precautions including fall risk factors, and explicit instructions for other team members regarding activity restrictions and transfer protocols.',
      auditorConclusion: 'The medical record provides no evidence that the PT conducted an individualized assessment identifying safety risks. The subsequent adverse event demonstrates the clinical consequences of documentation that fails its communication function.',
      clinicalRisk: 'A patient with unrecognized transfer instability sustained a preventable hip fracture because inter-visit communication — which depends entirely on documentation in home health — failed. This represents a direct patient safety harm attributable to documentation quality.',
      complianceRisk: 'The agency faces professional liability exposure, potential state survey deficiency citation, and mandatory adverse event reporting. The PT\'s documentation does not provide a defensible record of adequate clinical assessment.',
    },
  },

  // ═══════════════════════════════════════════════
  // MODULE 2: Regulatory and Compliance Foundations
  // ═══════════════════════════════════════════════

  'L2-01': {
    id: 'TS-L2-01',
    stem: 'During a ZPIC audit, an investigator reviews eight skilled nursing visit notes for a patient with a venous leg ulcer. Each note contains detailed vitals, wound measurements, dressing type used, and drainage descriptions. However, none of the eight notes documents WHY the wound complexity requires a registered nurse rather than a trained home health aide to perform the dressing changes. The agency argues that the physician\'s standing order for "SN wound care" establishes the skilled need. Which statement BEST explains why the agency\'s defense will fail?',
    options: [
      { id: 'A', text: 'The ZPIC audit is procedurally invalid because ZPICs are authorized to investigate fraud, not documentation sufficiency — this should be a MAC review.' },
      { id: 'B', text: 'The physician should have written a more detailed order specifying the clinical rationale for why skilled nursing is required rather than aide-level wound care.' },
      { id: 'C', text: 'The wound measurements alone are sufficient to establish skilled need because home health aides are not trained or authorized to measure wounds under federal regulations.' },
      { id: 'D', text: 'A physician\'s order authorizes a service but does not establish that the documentation "fully discloses the precise extent of services" as required by SSA § 1902(a)(27). Each visit note must independently document the clinical reasoning demonstrating why the wound assessment and treatment require RN-level judgment — complexity of wound bed, clinical decision-making, infection surveillance, and treatment modification that exceeds aide scope.' },
    ],
    correctOptionId: 'D',
    rationale: {
      whyCorrect: 'The Social Security Act requires that records "fully disclose the precise extent of services." A physician order authorizes the service type but does not document the clinical basis for each visit. Each note must independently demonstrate that the clinician exercised professional judgment and performed assessments beyond aide-level capability. Measurements without clinical reasoning are data without justification.',
      whatDocumentationShouldShow: 'Each wound care note should document: wound assessment findings requiring clinical interpretation, treatment decisions based on professional judgment, wound bed analysis that drives treatment modifications, infection surveillance rationale, and explicitly state what clinical skills the RN applied that a non-skilled caregiver could not safely perform.',
      auditorConclusion: 'The ZPIC investigator will conclude that while wound measurements were performed, there is no evidence that the wound complexity required skilled nursing assessment at each visit. Claims will be denied for lack of skilled need documentation, and the pattern across eight visits suggests systemic overutilization.',
      clinicalRisk: 'If the wound truly does not require skilled assessment at each visit, the patient may be receiving unnecessary services while being denied other needed care. If skilled assessment IS warranted but undocumented, the clinical reasoning is lost, compromising care coordination.',
      complianceRisk: 'Eight consecutive wound care visits without skilled need documentation creates a pattern that may be referred for expanded review of the clinician\'s entire caseload. ZPIC referral to OIG for potential fraud investigation is possible if the pattern suggests systematic billing for non-skilled services.',
    },
  },

  'L2-02': {
    id: 'TS-L2-02',
    stem: 'A home health agency completes its standard 5-year records retention period and prepares to destroy all clinical records from 2020. The office manager confirms through the MAC that no open audits exist for 2020 claims as of the destruction date. Three weeks after all 2020 records are shredded, the agency receives notice that the OIG has opened an investigation into the agency\'s 2020-2021 billing patterns based on a qui tam whistleblower complaint filed under seal in 2023. Which statement BEST describes the agency\'s legal exposure?',
    options: [
      { id: 'A', text: 'The agency is fully protected because it exceeded the minimum 3-year retention requirement under 42 C.F.R. § 433.32(b) by two years and confirmed no open audits before destruction.' },
      { id: 'B', text: 'The agency cannot produce records for the investigation, creating a presumption that destroyed records would have been unfavorable. All claims within the investigation scope are subject to automatic denial, and the record destruction itself — occurring while a sealed whistleblower complaint was pending — may be viewed as spoliation of evidence, potentially triggering obstruction charges.' },
      { id: 'C', text: 'The OIG investigation is procedurally invalid because the agency was not given notice of the sealed complaint before the retention period expired.' },
      { id: 'D', text: 'The whistleblower complaint is time-barred because it involves services from more than 3 years prior to the investigation notice.' },
    ],
    correctOptionId: 'B',
    rationale: {
      whyCorrect: 'The audit extension rule means records must be retained until ALL potential audit and investigation periods have closed. Qui tam complaints filed under seal can remain sealed for years before the provider is notified. The MAC\'s confirmation of no open audits does not account for sealed investigations. The agency\'s inability to produce records creates an adverse presumption and the timing creates spoliation risk.',
      whatDocumentationShouldShow: 'A formal records retention policy that accounts for both standard retention periods AND the audit extension rule, with legal counsel review before any record destruction. The policy should document the verification steps taken, including written confirmation from all potential audit entities.',
      auditorConclusion: 'Without records, the OIG cannot review the documentation but will presume the worst-case scenario. The statistical extrapolation will be based on any available data, and the agency cannot rebut findings it cannot disprove with destroyed records.',
      clinicalRisk: 'Destroyed clinical records eliminate any ability to reconstruct the care provided, determine whether patients received appropriate treatment, or defend against allegations of inadequate care.',
      complianceRisk: 'Record destruction during a pending (sealed) investigation escalates the matter from a civil False Claims Act case to potential criminal obstruction charges. The financial exposure multiplies from treble damages to criminal penalties and potential debarment.',
    },
  },

  'L2-03': {
    id: 'TS-L2-03',
    stem: 'A state\'s PERM error rate for home health services jumps from 8.2% to 14.7% in a single measurement cycle. A home health agency in that state has maintained a clean claims history for five years with zero individual denials. The administrator tells staff: "PERM doesn\'t affect us — we\'ve never had a denial. That\'s a state Medicaid problem, not an agency problem." Which statement BEST explains why this reasoning is dangerously incorrect?',
    options: [
      { id: 'A', text: 'Elevated PERM error rates drive statewide policy responses — high error rates trigger intensified auditor scrutiny, mandatory pre-payment review programs, expanded probe audits, and provider education mandates that apply to ALL providers in the state, regardless of individual claims history. The agency\'s clean record does not exempt it from system-wide audit intensification.' },
      { id: 'B', text: 'PERM only measures Medicaid managed care encounters, so fee-for-service home health claims are not affected by the increased error rate.' },
      { id: 'C', text: 'The administrator is correct that agencies with clean track records are given safe harbor status under PERM-driven review protocols.' },
      { id: 'D', text: 'PERM error rates only affect state Medicaid agency operations and federal matching fund calculations, with no direct impact on individual provider reimbursement rates.' },
    ],
    correctOptionId: 'A',
    rationale: {
      whyCorrect: 'PERM error rates are systemic measures that drive system-wide responses. When a state\'s error rate increases significantly, CMS and the state Medicaid agency implement broad corrective actions — targeted provider education, expanded audit programs, pre-payment review requirements — that affect ALL providers regardless of individual performance history. The agency\'s clean record provides no exemption from these systemic responses.',
      whatDocumentationShouldShow: 'Proactive documentation practices that exceed minimum standards, an active self-audit program, and documented staff training that demonstrates the agency\'s commitment to compliance regardless of external audit history.',
      auditorConclusion: 'In a state with an elevated PERM error rate, auditors are directed to increase the volume and intensity of provider reviews. An agency with no prior audits may be prioritized precisely because it has never been reviewed — it represents an untested documentation environment.',
      clinicalRisk: 'Agencies that assume compliance based on the absence of denials may have systemic documentation weaknesses that have simply never been tested. The first external audit may reveal problems that have existed for years.',
      complianceRisk: 'A PERM-driven pre-payment review program would require the agency to submit documentation for approval BEFORE receiving payment, creating cash flow disruption and administrative burden that could be avoided through proactive documentation excellence.',
    },
  },

  'L2-04': {
    id: 'TS-L2-04',
    stem: 'During a routine chart review on March 1st, a clinical supervisor discovers that a nurse billed 12 skilled nursing visits for medication management over the past 4 months. However, documentation for 8 of those visits shows only pill organizer setup and medication counting — with no evidence of skilled assessment, teaching, reconciliation, or clinical judgment. The supervisor immediately reports the finding to the compliance officer, who responds: "Let\'s wait until the quarterly compliance committee meeting on May 15th to discuss the best course of action and get input from the whole team." Which statement BEST identifies the compliance danger in this approach?',
    options: [
      { id: 'A', text: 'The supervisor should not have reported the finding to the compliance officer until the clinician was given an opportunity to add addenda to the deficient notes.' },
      { id: 'B', text: 'The compliance committee has no obligation to act until the exact overpayment amount has been calculated by the billing department and verified by legal counsel.' },
      { id: 'C', text: 'The 60-day clock started on March 1st when the supervisor identified the documentation pattern. Waiting until May 15th to begin discussion leaves only 15 days to investigate, quantify the overpayment, report to CMS, and return funds before the obligation converts to a False Claims Act violation. The delay itself — after a known overpayment has been identified — demonstrates reckless disregard for compliance obligations.' },
      { id: 'D', text: 'The 60-day overpayment rule applies only to overpayments identified by external auditors — internally discovered overpayments may be addressed through the agency\'s standard annual reconciliation process.' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'Section 1128J(d) of the Social Security Act requires that overpayments be reported and returned within 60 days of identification. The supervisor identified the pattern on March 1st — that is the date the clock started. Waiting 75 days until May 15th to even BEGIN discussion leaves insufficient time to complete the required investigation, reporting, and refund before the statutory deadline. Retained overpayments beyond 60 days are legally reclassified as obligations under the False Claims Act.',
      whatDocumentationShouldShow: 'A documented timeline showing: date of identification, immediate investigation steps, overpayment quantification methodology, CMS notification, and refund documentation — all completed within the 60-day window.',
      auditorConclusion: 'If the OIG later reviews this scenario, they will see a documented March 1st identification date and a May 15th committee meeting — a 75-day gap that violates the statutory requirement. The compliance officer\'s email suggesting delay becomes evidence of knowing retention of an overpayment.',
      clinicalRisk: 'Eight visits documented as medication management without skilled content suggest the patients may not have been receiving the skilled assessment their conditions warranted, or that unnecessary visits were being provided.',
      complianceRisk: 'Retaining known overpayments beyond the 60-day window converts an administrative billing error into potential False Claims Act liability with treble damages. The documented delay demonstrates "deliberate ignorance or reckless disregard" — a knowledge standard under the FCA.',
    },
  },

  // ═══════════════════════════════════════════════
  // MODULE 3: What Good Clinical Documentation Looks Like
  // ═══════════════════════════════════════════════

  'L3-01': {
    id: 'TS-L3-01',
    stem: 'A home health RN documents a skilled nursing visit: "SN visit for medication management per MD orders. Patient takes Metoprolol 25mg daily, Lisinopril 10mg daily, Metformin 500mg BID, and Eliquis 5mg BID. All medications reviewed with patient. Patient reports taking medications as prescribed. No side effects reported. Pill organizer set up for the week. Patient verbalizes understanding of all medications. Continue medication management per plan of care." The payer denies the claim with the explanation: "Insufficient documentation of medical necessity for skilled nursing visit." Which statement BEST explains why this detailed-appearing note fails?',
    options: [
      { id: 'A', text: 'The note fails because it does not include recent lab values (INR for Eliquis, HbA1c for Metformin) that would correlate medication effectiveness with clinical outcomes.' },
      { id: 'B', text: 'The note documents a medication review and pill organizer setup but provides no clinical evidence for WHY skilled nursing was required — there is no documentation of medication non-adherence, adverse effects, knowledge deficits, recent medication changes, clinical complexity, or drug interaction concerns that would distinguish this from routine medication assistance a home health aide or family member could perform.' },
      { id: 'C', text: 'The denial occurred because medication management visits require documentation of a face-to-face physician encounter within the prior 30 days under Medicare guidelines.' },
      { id: 'D', text: 'The note lists four medications but fails to include the prescribing physician\'s name and NPI for each medication, which is required for medication management billing.' },
    ],
    correctOptionId: 'B',
    rationale: {
      whyCorrect: 'Medical necessity requires documentation proving that the specific skilled intervention was "reasonable and necessary" for the patient\'s condition. This note describes a medication review and pill setup — activities within aide or family capability. There is no documentation of clinical complexity, knowledge deficits, adverse effect monitoring, drug interactions, or medication reconciliation findings that would justify skilled nursing assessment. The four-medication list appears routine, and "verbalizes understanding" provides no evidence of knowledge deficit requiring skilled teaching.',
      whatDocumentationShouldShow: 'Specific clinical indications for skilled medication assessment: recent hospitalization with medication changes, documented non-adherence patterns, adverse effect symptoms requiring clinical evaluation, drug interaction concerns requiring pharmacological knowledge, patient knowledge deficits demonstrated through teach-back failure, or clinical parameters (BP, HR, glucose) suggesting inadequate therapeutic response.',
      auditorConclusion: 'The auditor reads a routine medication check that any trained caregiver could perform. The note provides zero clinical justification for why a registered nurse, rather than a family member or aide, needed to review these medications on this date.',
      clinicalRisk: 'If the patient\'s high-risk medication regimen (Eliquis + multiple antihypertensives + Metformin) truly warrants skilled monitoring, the lack of documented clinical assessment means that drug interactions, therapeutic failures, and adverse effects may go unrecognized.',
      complianceRisk: 'Systematic billing for skilled medication management visits documented at non-skilled level creates a pattern of upcoding. A targeted review would examine the clinician\'s entire medication management caseload for the same deficiency.',
    },
  },

  'L3-02': {
    id: 'TS-L3-02',
    stem: 'A home health PT documents a visit for a 72-year-old patient 6 weeks post-total knee replacement: "ROM exercises performed — knee flexion 95° (goniometric measurement), extension -5°. Gait training with FWW × 100 ft in hallway. Therapeutic exercises: TKE × 15 reps, SLR × 15 reps, heel slides × 20 reps. Standing balance good. Patient tolerated treatment well with no complaints. Will continue therapy per plan of care." The MAC denies the visit, citing insufficient skilled need documentation. The PT insists the note contains objective measurements. Which statement BEST explains the denial?',
    options: [
      { id: 'A', text: 'The note fails because ROM measurements made with a goniometer must include documentation of the measurement technique and starting position to be valid.' },
      { id: 'B', text: 'The denial occurred because the PT did not document pain levels during each exercise, which is a mandatory element for post-surgical therapy billing.' },
      { id: 'C', text: 'Gait training with a front-wheeled walker at 6 weeks post-TKR does not qualify as a skilled therapy service under Medicare guidelines because most patients are independent with a walker by that point.' },
      { id: 'D', text: 'The note contains measurements and exercises but documents no clinical reasoning — there is no comparison to prior visit ROM values, no analysis of why 95°/–5° indicates continued need for skilled PT, no gait quality assessment, no explanation of why these specific exercises require therapist-level supervision versus a home exercise program, and no progress evaluation toward functional discharge goals.' },
    ],
    correctOptionId: 'D',
    rationale: {
      whyCorrect: 'Skilled need documentation requires more than data collection. The PT recorded measurements and exercises but provided zero clinical reasoning. There is no prior-visit comparison to demonstrate trajectory, no analysis of why the current ROM deficit requires skilled intervention, no gait quality assessment (speed, deviation, safety), no justification for why a therapist — rather than the patient independently — must supervise these standard exercises, and no discharge planning that connects current status to functional goals.',
      whatDocumentationShouldShow: 'Comparison of today\'s ROM to prior visit and functional goals, clinical analysis of barriers to progress, gait quality parameters (speed, deviations, compensatory patterns, safety assessment), rationale for each exercise selected and why therapist supervision is required, and projected timeline and criteria for discharge from skilled therapy.',
      auditorConclusion: 'The note reads as an exercise log that any fitness professional could generate. Without clinical reasoning, the auditor cannot determine that the complexity of this patient\'s rehabilitation requires the skills and judgment of a licensed physical therapist.',
      clinicalRisk: 'Data without analysis may mask developing post-surgical complications. A -5° extension deficit at 6 weeks could indicate developing arthrofibrosis requiring clinical intervention — but without documentation of clinical interpretation, this finding receives no clinical action.',
      complianceRisk: 'Therapy visits documented without skilled need justification constitute the fastest-growing category of home health claim denials. Pattern denials across a therapist\'s caseload trigger expanded review and potential recoupment.',
    },
  },

  'L3-03': {
    id: 'TS-L3-03',
    stem: 'An RN provides a skilled nursing visit and documents: vital signs (BP 142/88, HR 78, T 98.4°F, RR 18, SpO2 96%), a thorough cardiovascular assessment ("regular rate and rhythm, peripheral pulses palpable bilaterally, no edema, capillary refill < 2 seconds"), and records that "patient education on low-sodium diet provided." The note is signed with credentials, dated, and timed. The note appears complete — assessment findings, an intervention, and full authentication. An auditor reviewing this note identifies it as incomplete. Which element\'s ABSENCE is most likely to trigger the denial?',
    options: [
      { id: 'A', text: 'The note documents education on a low-sodium diet but provides no evidence of how the education was delivered, whether the patient demonstrated understanding, what specific dietary content was taught, what barriers to learning were identified, or what follow-up teaching was planned — the patient response to the skilled intervention is completely absent.' },
      { id: 'B', text: 'The note is missing ICD-10 diagnostic codes justifying the cardiovascular assessment and dietary education intervention.' },
      { id: 'C', text: 'The BP reading of 142/88 represents Stage 2 hypertension and the nurse failed to document an immediate physician notification as required by CMS clinical protocols.' },
      { id: 'D', text: 'The note should include the patient\'s insurance information, prior authorization number, and episode certification dates as required elements of a complete visit note.' },
    ],
    correctOptionId: 'A',
    rationale: {
      whyCorrect: 'A complete visit note requires documentation of patient response to every intervention. "Education on low-sodium diet provided" documents that something was delivered but provides zero evidence that the patient received, understood, or can apply the information. Without patient response documentation, the auditor cannot verify that skilled teaching actually occurred versus the nurse simply handing over a pamphlet.',
      whatDocumentationShouldShow: 'What specific dietary content was taught (sodium limits, high-sodium foods to avoid, label reading), what teaching method was used (verbal instruction, written materials, meal planning exercise), whether teach-back was performed, what the patient\'s response demonstrated (accurate return of information or specific gaps), barriers identified, and the plan for reinforcement.',
      auditorConclusion: 'The note contains assessment data and names an intervention but breaks the Assessment → Intervention → Response chain. The auditor cannot verify that skilled teaching occurred because there is no evidence of patient engagement with the educational content.',
      clinicalRisk: 'Without documented patient response, the next clinician cannot determine the patient\'s current understanding of sodium restriction. Teaching that appeared successful may have been ineffective, leading to continued dietary non-compliance and preventable CHF exacerbations.',
      complianceRisk: 'Teaching visits without documented patient response are among the most commonly denied visit types in home health. The note structure suggests a pattern of documenting tasks performed without documenting outcomes achieved.',
    },
  },

  'L3-04': {
    id: 'TS-L3-04',
    stem: 'A home health agency discovers that a referring physician has not signed plans of care for 23 active patients, with some certification periods dating back 4 months. The clinical director instructs the administrative team to send the physician attestation statements confirming that "the services were ordered at the time of the initial face-to-face encounter and that the physician intended for the plan of care to be implemented as written." The physician signs and returns 20 of 23 attestation statements within two weeks. Which statement BEST describes why this remediation strategy will not protect the claims?',
    options: [
      { id: 'A', text: 'The attestation statements would be valid if they were notarized by a licensed notary public and submitted within 90 days of the original order date.' },
      { id: 'B', text: 'The clinical director should instruct the physician to back-date the plan of care signatures to the original certification date to establish contemporaneous authentication.' },
      { id: 'C', text: 'For physician orders and plans of care, CMS does not accept after-the-fact attestation statements as a substitute for a timely signature. The only potential remedy is producing contemporaneous documentation (progress notes, EHR audit trails, communication logs) demonstrating the physician\'s knowledge and intent at the time of the original order. Claims with unsigned orders will likely be denied regardless of attestation.' },
      { id: 'D', text: 'The attestation statements are the CMS-approved standard method for correcting unsigned physician orders, and the two-week turnaround demonstrates timely remediation.' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'CMS has explicitly stated that attestation statements are not an acceptable remedy for unsigned physician orders. An attestation is a retrospective assertion of past intent — it does not prove that the physician actually reviewed and approved the plan of care at the clinically relevant time. The only acceptable evidence is contemporaneous documentation showing the physician\'s involvement at the time services were furnished.',
      whatDocumentationShouldShow: 'Proactive workflow systems that prevent signature delays: automated alerts for unsigned orders, escalation protocols when signatures are not obtained within defined timeframes, and documented processes for tracking plan of care signature status across all active patients.',
      auditorConclusion: 'Attestation statements for 23 patients with unsigned plans of care suggest a systemic failure in the agency\'s plan of care management process. The auditor will deny all claims for episodes with unsigned orders and may expand the review to examine the agency\'s entire pending order tracking system.',
      clinicalRisk: 'An unsigned plan of care means the physician has not formally reviewed and approved the care being provided. Services could be delivered without physician oversight, potentially resulting in inappropriate treatment or missed clinical concerns.',
      complianceRisk: 'Twenty-three patients with unsigned plans of care constitutes a systemic compliance failure, not an isolated incident. This volume suggests process breakdown rather than physician oversight, and triggers evaluation of the agency\'s certification compliance across all patients.',
    },
  },

  // ═══════════════════════════════════════════════
  // MODULE 4: Common Documentation Failures
  // ═══════════════════════════════════════════════

  'L4-01': {
    id: 'TS-L4-01',
    stem: 'An auditor reviews 12 consecutive skilled nursing visit notes for a COPD patient spanning a 60-day certification period. All 12 notes contain identical language in the respiratory assessment section: "Lungs: diminished bilateral bases. Dyspnea on exertion noted. O2 sat 94% on 2L NC. Patient educated on energy conservation techniques and pursed-lip breathing. Patient verbalizes understanding." The clinician responds to the audit finding by stating that the patient\'s respiratory status was genuinely stable throughout the episode. Which statement BEST identifies why this documentation pattern is indefensible regardless of clinical reality?',
    options: [
      { id: 'A', text: 'The documentation is acceptable because the clinician has confirmed under attestation that the patient\'s condition was stable, and each note was individually signed and dated.' },
      { id: 'B', text: 'The notes are compliant because they contain objective data (O2 sat 94%) and a documented intervention (patient education on energy conservation and pursed-lip breathing).' },
      { id: 'C', text: 'The problem is that 12 nursing visits over 60 days exceeds Medicare utilization thresholds for stable COPD patients, not that the documentation language is repeated.' },
      { id: 'D', text: 'Identical documentation across 12 visits creates an irrebuttable presumption of cloning — even a genuinely stable patient would have daily variations in O2 saturation, respiratory rate, activity tolerance, and teaching content. The identical text proves the notes were copied rather than generated from individualized assessments, and algorithmic audit tools now flag identical text strings across sequential notes as a primary fraud indicator.' },
    ],
    correctOptionId: 'D',
    rationale: {
      whyCorrect: 'Copy-forward documentation fails regardless of the clinical reality because it proves the notes were NOT generated from individualized assessments. A truly stable COPD patient would still have daily variations — different O2 sat readings, different respiratory rates, varying activity tolerance, and different teaching content based on evolving patient understanding. Identical values across 12 visits are statistically impossible without copying, and algorithmic audit tools are specifically designed to detect this pattern.',
      whatDocumentationShouldShow: 'Each visit should document that day\'s specific assessment findings: actual O2 saturation (which varies), respiratory rate, effort of breathing, activity tolerance, auscultation findings, specific teaching content delivered at that visit (which should evolve as the patient\'s knowledge increases), and the patient\'s specific response to education.',
      auditorConclusion: 'The auditor will deny all 12 visits as cloned documentation. More critically, the cloning pattern triggers expanded review of the clinician\'s entire caseload across all patients, potentially resulting in agency-wide extrapolated recoupment.',
      clinicalRisk: 'If the clinician is copy-forwarding respiratory assessments, actual changes in the patient\'s condition may be missed. A COPD exacerbation developing between visits would not be captured in documentation that defaults to "stable" language, delaying intervention.',
      complianceRisk: 'Copy-forward patterns meeting certain criteria are referred from MAC audit to ZPIC investigation as potential fraud. The clinician\'s attestation that the patient was stable does not overcome the objective evidence of identical documentation, which constitutes submission of false records.',
    },
  },

  'L4-02': {
    id: 'TS-L4-02',
    stem: 'A home health nurse documents a wound care visit for a diabetic foot ulcer: "Wound is improving. Less drainage noted today. Patient tolerating treatment well. Wound care with dressing change performed per protocol. Will continue current treatment plan." During the visit, the nurse actually observed: the wound decreased from 3.2 × 2.1 cm to 2.7 × 1.8 cm, drainage changed from purulent to serous, granulation tissue increased from 60% to 80%, and periwound erythema resolved. Which statement BEST describes the impact of this documentation approach?',
    options: [
      { id: 'A', text: 'The nurse\'s clinical observations demonstrate meaningful healing trajectory, but NONE of that data appears in the documentation. An auditor reading this note sees "improving" — a meaningless descriptor that could mean anything or nothing. The note is as useless for proving skilled wound care as if no assessment had been performed, because the specific findings that justify continued skilled intervention are absent.' },
      { id: 'B', text: 'The documentation is acceptable because "improving" and "less drainage" convey the clinical trajectory using language that any clinically trained reader would understand.' },
      { id: 'C', text: 'The nurse should supplement the written note with a wound photograph, which would replace the need for written wound measurements under current CMS documentation standards.' },
      { id: 'D', text: 'The note is only problematic if the wound deteriorated; documentation of wound improvement does not require the same level of specificity as documentation of wound deterioration.' },
    ],
    correctOptionId: 'A',
    rationale: {
      whyCorrect: 'The nurse performed an excellent clinical assessment but documented none of the findings that demonstrate it. "Improving" and "less drainage" are subjective conclusions that convey zero verifiable data. Without measurements showing the 0.5 cm reduction, the drainage character change from purulent to serous, the granulation increase from 60% to 80%, and the resolved erythema, no auditor or covering clinician can determine what actually happened at this visit.',
      whatDocumentationShouldShow: 'Wound measurements (L × W × D) with comparison to previous visit, wound bed description with percentage of granulation/slough/necrotic tissue, drainage type (serous vs. purulent vs. serosanguineous) and amount, periwound skin condition, pain assessment, specific treatment performed, and explicit comparison: "wound reduced from 3.2 × 2.1 cm to 2.7 × 1.8 cm, granulation increased from 60% to 80%, drainage character changed from purulent to serous, indicating positive treatment response."',
      auditorConclusion: 'The auditor sees a vague note that provides no objective basis for determining whether wound care was medically necessary or whether the treatment plan is effective. The claim will be denied for insufficient documentation even though the actual clinical picture supports continued skilled care.',
      clinicalRisk: 'The next clinician has no baseline data from this visit. If the wound later deteriorates, there is no documented comparison point. The valuable clinical improvement observed — which should inform treatment decisions — is lost to vague language.',
      complianceRisk: 'Systematic use of vague wound documentation language creates a pattern of claims that cannot withstand audit scrutiny. Even effective wound care will be denied if the documentation does not support it with objective data.',
    },
  },

  'L4-03': {
    id: 'TS-L4-03',
    stem: 'An RN documents a medication teaching visit for a newly diagnosed heart failure patient: "Provided comprehensive education on heart failure disease process, daily weight monitoring, sodium restriction, fluid management, and signs/symptoms of worsening heart failure requiring emergency contact. Patient verbalized understanding of all topics. Will reinforce teaching on next visit." The note lists five specific teaching topics and includes a plan for reinforcement. A payer auditor denies the visit. Which statement BEST explains the denial?',
    options: [
      { id: 'A', text: 'The note needs to include the patient\'s health literacy level and primary language to document that the teaching approach was culturally and linguistically appropriate.' },
      { id: 'B', text: '"Verbalized understanding" without specifics is clinically meaningless — the note provides no evidence of WHAT the patient actually said or demonstrated, whether teach-back was used, which of the five topics the patient comprehended versus struggled with, or what specific knowledge gaps were identified that necessitate the planned "reinforcement." Listing topics taught without documenting learning outcomes does not prove skilled teaching occurred.' },
      { id: 'C', text: 'The note is sufficient because it lists five specific teaching topics and includes a plan for follow-up — the auditor\'s denial is unreasonable and should be appealed.' },
      { id: 'D', text: 'Heart failure education requires documented use of agency-approved standardized teaching materials with the specific material name and version number recorded in the visit note.' },
    ],
    correctOptionId: 'B',
    rationale: {
      whyCorrect: '"Verbalized understanding" is the most common but least informative documentation of patient response. It tells the auditor nothing about what the patient actually understood. Did the patient correctly state the daily weight monitoring protocol? Can the patient identify three signs of worsening heart failure? Does the patient know the sodium gram limit? "Verbalized understanding of all five topics" in a newly diagnosed patient is also clinically implausible — mastery of five complex topics in a single session is unlikely and suggests the documentation is generic rather than individualized.',
      whatDocumentationShouldShow: 'For each teaching topic: what specific content was taught, the teaching method used (verbal, demonstration, written materials), the patient\'s specific response via teach-back ("Patient correctly identified 3 of 5 warning signs but could not distinguish between expected and emergency weight gain thresholds"), barriers identified, and specific topics requiring reinforcement with rationale.',
      auditorConclusion: 'The note documents that the nurse talked but provides no evidence that the patient learned. Skilled teaching requires demonstration of clinical teaching technique, assessment of comprehension, and identification of learning gaps — none of which are present.',
      clinicalRisk: 'A newly diagnosed heart failure patient who appears to "verbalize understanding" but actually misunderstands warning signs may delay seeking emergency care during an exacerbation. Undocumented knowledge gaps cannot be addressed by covering clinicians.',
      complianceRisk: 'Teaching visits are among the most commonly denied visit types in home health precisely because of the "verbalized understanding" documentation pattern. This pattern across a clinician\'s caseload suggests systemic template-based documentation rather than individualized skilled assessment.',
    },
  },

  'L4-04': {
    id: 'TS-L4-04',
    stem: 'An RN visits a home health patient with type 2 diabetes and documents: "Blood glucose 287 mg/dL this morning per patient report. Patient states she has not been feeling well for two days — reports nausea and increased thirst. Vital signs: BP 138/82, HR 94, T 98.8°F, RR 20. Lungs clear bilaterally. Abdomen soft, non-tender. Skin warm and dry. Educated patient on importance of medication compliance. Continue current plan." Which statement BEST identifies the critical documentation failure in this clinical encounter?',
    options: [
      { id: 'A', text: 'The note fails because the nurse should have documented the patient\'s most recent hemoglobin A1c level to establish a clinical baseline for the hyperglycemia assessment.' },
      { id: 'B', text: 'The nurse should have called 911 for a blood glucose of 287 mg/dL because this exceeds the threshold for diabetic emergency requiring emergency medical services.' },
      { id: 'C', text: 'The note contains an alarming finding (BG 287) and a concerning 2-day history (nausea, increased thirst — classic hyperglycemia symptoms) but the Assessment-Intervention-Response chain is completely broken: there is no clinical analysis of WHY the glucose is elevated, no investigation linking the "not feeling well" report to the hyperglycemia, no physician notification despite a significantly abnormal finding, and no clinical rationale for why "medication compliance education" was the appropriate intervention for a patient with symptomatic hyperglycemia.' },
      { id: 'D', text: 'The assessment findings are clinically sufficient, but the note lacks documentation of the specific insulin injection technique that was observed during the visit.' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'The note documents a critically abnormal finding (BG 287 with symptoms of nausea and polydipsia for two days) but then fails to connect this assessment to a clinical analysis or appropriate response. Why is the glucose elevated? Is the patient taking medications correctly? Has the dosage become inadequate? Is there an acute illness causing the elevation? Where is the physician notification for a symptomatic glucose of 287? "Medication compliance education" as the sole intervention for symptomatic hyperglycemia with no investigation is clinically unjustifiable and breaks the Assessment → Clinical Reasoning → Intervention → Response chain.',
      whatDocumentationShouldShow: 'Clinical analysis of probable causes for the 287 mg/dL reading, medication reconciliation (is the patient actually taking Metformin as prescribed? When was the last dose?), assessment of hydration status given polydipsia symptoms, urine ketone check if available, physician notification with SBAR communication (name, time, mode, physician response and orders), and patient response to any intervention — not just "educated on compliance."',
      auditorConclusion: 'The note documents that the nurse identified a significantly abnormal finding but took no clinical action beyond generic education. This raises questions about clinical competence and whether the visit provided any skilled value to the patient.',
      clinicalRisk: 'Symptomatic hyperglycemia at 287 mg/dL with nausea and polydipsia for two days without physician notification creates direct patient safety risk. If this progresses to diabetic ketoacidosis or hyperglycemic hyperosmolar state, the lack of documented clinical response becomes a liability issue.',
      complianceRisk: 'The disconnect between alarming clinical findings and a passive documentation response suggests either inadequate clinical assessment or inadequate documentation of the clinical response. Either way, the note fails to support skilled nursing intervention at a level that justifies billing.',
    },
  },

  'L4-05': {
    id: 'TS-L4-05',
    stem: 'A home health patient\'s clinical record contains the following entries: Visit 4 (Monday): "Patient ambulating independently with rolling walker × 150 ft, steady gait, no loss of balance, minimal SOB. Good activity tolerance." Visit 5 (Thursday, same week): "Patient wheelchair-bound, unable to ambulate, requires max assist × 2 for all transfers. Patient reports severe right hip pain 8/10." The record contains no documentation between these visits — no fall report, no change-in-condition notification, no physician contact, no interim event, and no emergency department visit records. Which statement BEST describes the audit and clinical implications of this narrative gap?',
    options: [
      { id: 'A', text: 'The inconsistency is clinically acceptable because patients with chronic conditions commonly experience day-to-day functional fluctuations of this magnitude.' },
      { id: 'B', text: 'Visit 5 should simply reference Visit 4 by stating "significant functional decline from previous visit on Monday" to establish narrative continuity between the two notes.' },
      { id: 'C', text: 'The issue is solely with Visit 5 documentation because it should have included a formal fall risk assessment tool score such as the Morse Fall Scale.' },
      { id: 'D', text: 'The dramatic functional decline — from independent ambulation with good tolerance to wheelchair-bound requiring maximum assist — without ANY documented precipitating event, change-in-condition assessment, or physician notification destroys the credibility of BOTH notes. An auditor must conclude that at least one note is inaccurate, and the absence of documented clinical response to a major functional change raises both documentation integrity and patient safety concerns.' },
    ],
    correctOptionId: 'D',
    rationale: {
      whyCorrect: 'A patient does not transition from independent ambulation × 150 ft with steady gait to wheelchair-bound with max assist × 2 in three days without a precipitating event. The absence of any documented fall, new injury, change-in-condition notification, or physician contact makes both notes unreliable — either Visit 4 overstated functional status, Visit 5 understated it, or a significant clinical event occurred between visits that was never documented or reported.',
      whatDocumentationShouldShow: 'When patient status changes materially between visits: documentation of the specific change observed, comparison to the last documented status, clinical assessment of probable cause, immediate interventions taken, physician notification (name, date, time, mode, and response), updated plan of care, and any referrals or orders obtained.',
      auditorConclusion: 'Narrative inconsistencies of this magnitude trigger expanded review. The auditor will question every note by this clinician and may conclude that documented assessments are unreliable. If extrapolated, this finding can result in denial of all claims from the involved clinicians during the review period.',
      clinicalRisk: 'If a fall or acute event occurred between visits and was not documented or reported, the patient may not have received appropriate medical evaluation. The hip pain at 8/10 without documented workup suggests a potentially undiagnosed fracture that required immediate physician evaluation.',
      complianceRisk: 'Narrative inconsistencies across visits are the third most common reason for expanded audit review. They suggest either inaccurate documentation, inadequate clinical assessment, or both — any of which undermines the integrity of the entire medical record.',
    },
  },

  // ═══════════════════════════════════════════════
  // MODULE 5: Documentation and Audit Readiness
  // ═══════════════════════════════════════════════

  'L5-01': {
    id: 'TS-L5-01',
    stem: 'A home health agency receives an Additional Documentation Request (ADR) from its MAC for a random sample of 30 claims spanning a six-month period. The administrator, who has never been through an ADR process, assumes this is a routine paperwork request and assigns the office manager to photocopy visit notes and mail them within the 45-day deadline. No clinical or compliance review of the records is conducted before submission. Which statement BEST describes the critical error in this response approach?',
    options: [
      { id: 'A', text: 'The administrator\'s response is procedurally correct — ADRs require only timely submission of the requested documents within the MAC\'s specified timeframe.' },
      { id: 'B', text: 'An ADR is not routine paperwork — it is the entry point of a formal audit where every documentation deficiency in the 30-claim sample can be statistically extrapolated to the agency\'s entire claims population, potentially resulting in six- or seven-figure recoupment. The response requires clinical and compliance review before submission to identify gaps that can be legitimately addressed, ensure all supporting documents are included, and prepare for potential appeal of adverse findings.' },
      { id: 'C', text: 'The 45-day response deadline is incorrect — ADRs must be answered within 30 calendar days, and the administrator\'s timeline error will result in automatic denial of all 30 claims.' },
      { id: 'D', text: 'ADRs from the MAC are advisory reviews with no enforcement authority — only ZPIC investigations and OIG audits carry recoupment risk, so the administrator\'s casual approach is acceptable.' },
    ],
    correctOptionId: 'B',
    rationale: {
      whyCorrect: 'An ADR initiates a formal audit process with potentially devastating financial consequences. Each deficiency in the 30-claim sample is used to calculate an error rate that is statistically extrapolated across the agency\'s entire claim population for the review period. Simply mailing copies without clinical review means the agency may submit incomplete records, fail to include supporting documents (orders, POC, F2F), or miss opportunities to address remediable gaps before submission.',
      whatDocumentationShouldShow: 'A comprehensive ADR response includes: every requested document (visit notes, physician orders, plan of care, face-to-face documentation, communication logs), organized chronologically per claim, with a cover sheet identifying each claim and the documentation provided. The response should be reviewed by clinical and compliance staff before submission.',
      auditorConclusion: 'The MAC auditor will evaluate each of the 30 claims against seven documentation criteria. Any missing element — even a signature, date, or plan of care — results in a claim denial. If the error rate exceeds the threshold, extrapolated recoupment is applied to all claims in the review universe.',
      clinicalRisk: 'Submitting records without clinical review may expose care quality issues that could have been addressed through quality improvement. If documentation reveals clinical concerns (missed assessments, delayed physician notification), these may trigger additional scrutiny beyond billing.',
      complianceRisk: 'An unprepared ADR response with a high error rate triggers escalation: from random sample to targeted review, from targeted review to 100% pre-payment review, and potentially from pre-payment review to ZPIC referral for program integrity investigation.',
    },
  },

  'L5-02': {
    id: 'TS-L5-02',
    stem: 'A home health agency responds to an ADR by submitting thorough visit notes with detailed clinical content — skilled assessments, objective findings, patient responses, clinical reasoning, and proper signatures with credentials on every note. However, the agency cannot locate the signed physician plan of care or the face-to-face encounter documentation for the patient\'s episode. The clinical director argues that the exceptional quality of the visit notes should be sufficient to demonstrate that care was medically appropriate and properly ordered. Which statement BEST explains the audit outcome?',
    options: [
      { id: 'A', text: 'All claims in the episode will be denied regardless of visit note quality. Auditors evaluate documentation hierarchically: without a valid signed physician order/plan of care and face-to-face encounter documentation, the foundational conditions of coverage for the entire home health episode are unmet. No amount of excellent clinical documentation can overcome missing eligibility and authorization requirements — every visit becomes non-covered.' },
      { id: 'B', text: 'The auditor will accept the visit notes as sufficient evidence of appropriate care if they clearly demonstrate medical necessity and skilled need, even without the formal plan of care.' },
      { id: 'C', text: 'The agency can submit a physician attestation letter after the fact, confirming that orders and the face-to-face encounter occurred, which would satisfy the audit requirement.' },
      { id: 'D', text: 'The denial will apply only to the first visit of the episode because subsequent visits establish ongoing medical necessity independent of the initial certification.' },
    ],
    correctOptionId: 'A',
    rationale: {
      whyCorrect: 'Auditors follow a hierarchical evaluation. Before reviewing clinical content, they first verify conditions of coverage: eligible beneficiary, valid physician order/plan of care, and face-to-face encounter. If ANY foundational requirement is missing, the entire episode is non-covered — the auditor stops evaluation without ever looking at the clinical notes. This is one of the most frustrating audit outcomes: excellent care, excellent documentation, but missing one foundational document means total denial.',
      whatDocumentationShouldShow: 'For every home health episode: a signed physician plan of care within the required timeframe, face-to-face encounter documentation meeting CMS requirements, and a systematic tracking process that ensures these foundational documents are obtained, signed, and filed before the ADR response deadline.',
      auditorConclusion: 'The auditor will deny all claims in the episode with the reason code "missing/insufficient documentation of physician plan of care/face-to-face encounter." The clinical quality of the visit notes is irrelevant to this determination.',
      clinicalRisk: 'An episode operating without a signed plan of care raises questions about whether the physician is actively involved in directing the patient\'s care and whether appropriate medical oversight is being maintained.',
      complianceRisk: 'Missing foundational documents across multiple episodes suggests a systemic process failure in order management. This pattern triggers administrative scrutiny of the agency\'s certification compliance and may result in conditions of participation reviews.',
    },
  },

  'L5-03': {
    id: 'TS-L5-03',
    stem: 'A home health agency hires a per diem LPN who presents a clean state nursing license and passes a comprehensive criminal background check including federal, state, and county criminal records. She begins providing visits immediately. Six months and 180 patient visits later, a routine compliance audit reveals the LPN was excluded from federal healthcare program participation 3 years ago following a state Medicaid fraud conviction that resulted in a deferred adjudication (no criminal conviction). The agency argues that it exercised due diligence by conducting a thorough criminal background check before hiring. Which statement BEST describes the agency\'s liability?',
    options: [
      { id: 'A', text: 'The agency is protected because a deferred adjudication results in no criminal conviction, meaning the background check correctly showed a clean record, and exclusion from a state program does not affect federal program participation.' },
      { id: 'B', text: 'Only the visits billed to Medicaid are subject to recoupment; Medicare visits provided by excluded individuals are handled through a separate CMS appeals process.' },
      { id: 'C', text: 'Criminal background checks do not screen for federal program exclusions — the agency was required to check the OIG LEIE and SAM databases before hiring and monthly thereafter. All 180 visits are subject to full recoupment because federal law prohibits payment for services "furnished" by excluded individuals, regardless of the agency\'s awareness. The agency\'s failure to conduct exclusion screening (separate from criminal background checks) constitutes a systemic compliance failure.' },
      { id: 'D', text: 'The agency\'s liability is limited to visits occurring after the date it should have discovered the exclusion through its next scheduled annual compliance review.' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'Federal program exclusion screening is entirely separate from criminal background checks. An individual can have a clean criminal record (through deferred adjudication, expungement, or administrative exclusion) and still be excluded from federal healthcare programs. The OIG LEIE and SAM databases are the only authoritative sources for exclusion status. CMS requires screening at hiring and recommends monthly re-screening. The agency\'s reliance on background checks alone, while well-intentioned, does not satisfy the exclusion screening obligation.',
      whatDocumentationShouldShow: 'A documented exclusion screening policy that includes: pre-employment LEIE and SAM database checks for all staff (clinical and administrative), monthly re-screening of all active employees, documented results with date stamps, and an attestation process confirming compliance with exclusion screening requirements.',
      auditorConclusion: 'The OIG will direct full recoupment of reimbursement for all 180 visits. The agency\'s due diligence argument fails because the standard of care requires LEIE/SAM screening, not just criminal background checks. The agency may also face civil monetary penalties of up to $100,000 per violation.',
      clinicalRisk: 'While the excluded LPN may be clinically competent, her exclusion status means she is prohibited from furnishing federally reimbursed services. Patients were served by a provider whose participation in federal programs has been terminated, raising questions about oversight adequacy.',
      complianceRisk: 'Failure to implement OIG/LEIE/SAM screening is one of the most commonly cited compliance failures in federal audits of home health agencies. The per-visit penalty structure means that 180 visits creates catastrophic financial exposure. The agency\'s compliance program will be scrutinized for systemic deficiencies.',
    },
  },

  // ═══════════════════════════════════════════════
  // MODULE 6: Self-Auditing and Corrective Action Plans
  // ═══════════════════════════════════════════════

  'L6-01': {
    id: 'TS-L6-01',
    stem: 'A home health agency\'s compliance officer — who is also a practicing nurse in the agency — audits 10 charts she personally selected from the previous quarter. She chose charts for patients she believed had the most thorough documentation. Her audit findings show zero deficiencies, and she reports 100% compliance to the governing body. The administrator congratulates the team and discontinues the self-audit program for the next two quarters because "we\'ve proven we\'re compliant." Which statement BEST identifies the fundamental flaws that render this audit invalid?',
    options: [
      { id: 'A', text: 'The sample size of 10 charts is too small to produce statistically valid results — at least 30 charts should be reviewed per quarter to achieve a 95% confidence interval.' },
      { id: 'B', text: 'The audit results are valid but should be independently verified by a third-party compliance consultant before being reported to the governing body.' },
      { id: 'C', text: 'The audit is invalid only because a nurse should not serve as compliance officer — an attorney or credentialed compliance professional is required under CMS guidelines.' },
      { id: 'D', text: 'The audit violates TWO fundamental self-auditing principles: (1) the auditor must NEVER audit their own charts because subjective bias leads them to infer meaning from their own shorthand that is legally insufficient, and (2) the sample was not random or objective — cherry-picking charts believed to be compliant produces false confidence. Together, these flaws guarantee a meaningless result, and discontinuing the program based on invalid findings compounds the error.' },
    ],
    correctOptionId: 'D',
    rationale: {
      whyCorrect: 'CMS explicitly warns against professionals auditing their own charts — they unconsciously fill in gaps from memory, interpret their own abbreviations favorably, and apply context that an external reviewer would not have. Combined with a biased sample (selecting charts believed to be compliant), the audit was designed to succeed. The 100% compliance finding is meaningless, and using it to justify discontinuing audits creates escalating compliance risk over the six months without self-monitoring.',
      whatDocumentationShouldShow: 'A valid self-audit program requires: a designated auditor who did NOT author the charts being reviewed, a random sampling methodology (e.g., every nth chart from a specific period), documented sampling criteria, structured audit tools with objective criteria, and a regular audit schedule that is not discontinued based on favorable results.',
      auditorConclusion: 'If an external auditor later discovers documentation deficiencies, the agency\'s claim of compliance is undermined by the methodologically invalid audit. The governing body was given false assurance, and the six-month gap without self-monitoring suggests the compliance program exists on paper only.',
      clinicalRisk: 'Documentation deficiencies undetected due to biased auditing persist and potentially worsen. Clinicians receive no feedback on documentation quality, perpetuating patterns that may compromise care coordination and patient safety.',
      complianceRisk: 'Under the Federal Sentencing Guidelines, an "effective compliance program" requires genuine self-auditing. A methodologically invalid audit followed by program discontinuation suggests a compliance program that lacks substance — this undermines the agency\'s ability to claim good faith compliance posture in any future enforcement action.',
    },
  },

  'L6-02': {
    id: 'TS-L6-02',
    stem: 'A home health agency\'s self-audit program is designed to pull every 20th chart from each quarter for review. The designated auditor — a QA nurse who does not provide direct patient care — begins the Q1 audit but excludes all charts from the agency\'s two most experienced nurses (combined 30 years of experience) because "they\'ve been documenting for decades and always get comments for their thorough notes." The remaining sample shows a 5% error rate among newer clinicians. Which statement BEST explains why this sampling methodology critically undermines the audit?',
    options: [
      { id: 'A', text: 'Excluding experienced clinicians from the random sample introduces systematic bias that invalidates the entire audit — experienced nurses frequently have the HIGHEST rates of copy-forward violations, template shortcuts, outdated documentation habits, and abbreviation patterns that predate current regulatory requirements. The true agency error rate is unknown because the sample is not representative of the full clinician population.' },
      { id: 'B', text: 'The 5% error rate is below the CMS compliance threshold of 10%, so the sampling methodology does not materially affect the audit conclusion.' },
      { id: 'C', text: 'The flaw is that every 20th chart is too infrequent — every 10th chart should be sampled for adequate coverage of the agency\'s claim volume.' },
      { id: 'D', text: 'Experienced nurses should be excluded from random audits only if they have documented zero findings in the prior three audit cycles.' },
    ],
    correctOptionId: 'A',
    rationale: {
      whyCorrect: 'The audit\'s validity depends entirely on sample randomness and representativeness. Excluding two clinicians — regardless of experience — introduces a systematic bias that makes the results unrepresentative of agency-wide documentation quality. Ironically, experienced clinicians often have the most entrenched documentation shortcuts: they developed template habits years ago, use abbreviations that were once acceptable but no longer meet current standards, and rely on copy-forward efficiency that constitutes cloning under modern audit criteria.',
      whatDocumentationShouldShow: 'A documented sampling methodology showing: the total number of charts in the audit universe, the sampling interval (every 20th), confirmation that ALL clinicians are included in the sample frame, any charts excluded with documented reasons (and no clinician-based exclusions), and the auditor\'s attestation that the sample was selected without bias.',
      auditorConclusion: 'The 5% error rate applies only to newer clinicians and cannot be generalized to the agency. If experienced clinicians have undiscovered documentation deficiencies (which is likely given common patterns), the true agency error rate could be significantly higher than reported.',
      clinicalRisk: 'Experienced clinicians excluded from audit review receive no documentation feedback. Long-standing documentation patterns that compromise care coordination go unaddressed, and the clinicians may believe their documentation is exemplary when it actually contains systematic gaps.',
      complianceRisk: 'If an external audit later reveals documentation deficiencies in the experienced clinicians\' charts, the agency cannot claim it had an effective self-audit program — the biased sampling methodology demonstrates that the program was designed to avoid discovering problems with its most prolific documenters.',
    },
  },

  'L6-03': {
    id: 'TS-L6-03',
    stem: 'A home health agency\'s self-audit reveals that 35% of wound care notes lack objective wound measurements (L × W × D). The administrator creates a corrective action plan: "All nursing staff will be reminded via email to include wound measurements in their documentation. The wound care policy in the policy manual will be updated to reflect this requirement. Target: 100% compliance." No root cause analysis is performed, no re-audit date is established, and no follow-up training is scheduled. Which statement BEST identifies the corrective action plan\'s critical deficiency?',
    options: [
      { id: 'A', text: 'The 100% compliance target is unrealistic — CMS accepts a 90% compliance threshold for wound documentation quality metrics.' },
      { id: 'B', text: 'The CAP lacks every essential element of effective corrective action: there is no root cause analysis (WHY are 35% of notes missing measurements — is it an EHR template issue, a training gap, a workflow problem, or clinician resistance?), no specific measurable corrective action beyond a reminder email, no implementation timeline with accountability, and no re-audit date to verify whether the intervention actually changed behavior. An email reminder and a policy update are awareness activities, not corrective actions.' },
      { id: 'C', text: 'The CAP should be submitted to the state survey agency for review and approval before implementation to satisfy CMS oversight requirements.' },
      { id: 'D', text: 'The only significant missing element is a re-audit date; the corrective actions of email notification and policy update are appropriate first steps for a documentation improvement initiative.' },
    ],
    correctOptionId: 'B',
    rationale: {
      whyCorrect: 'A corrective action plan must address root causes, not symptoms. A 35% deficiency rate in wound measurements is a systemic problem — an email reminder treats 35% of nurses as having forgotten a requirement they knew, when the actual root cause may be: the EHR template has no mandatory wound measurement field, clinicians were never trained on wound measurement technique, the workflow does not allow time for measurements, or there is no supervisory review catching the omission. Without root cause analysis, the corrective action cannot target the actual problem.',
      whatDocumentationShouldShow: 'A complete CAP must include: (1) Root cause analysis — why does 35% of documentation lack measurements? (2) Specific corrective actions — e.g., update EHR wound template to require L × W × D before note finalization, conduct hands-on wound measurement training for all RNs within 30 days. (3) Implementation timeline and responsible parties. (4) Re-audit date (typically 60-90 days post-implementation) with a measurable target.',
      auditorConclusion: 'If an external audit later examines the agency\'s compliance program and finds a 35% wound documentation deficiency addressed only by an email reminder with no root cause analysis or re-audit, the auditor will conclude the agency\'s corrective action process is ineffective — calling into question the entire compliance program\'s substance.',
      clinicalRisk: 'Wound care notes lacking measurements cannot track wound trajectory. A wound that is gradually enlarging will not be detected through documentation that lacks baseline measurements, potentially delaying intervention until visible clinical deterioration occurs.',
      complianceRisk: 'A 35% documentation deficiency rate for a core skilled nursing service creates massive audit exposure. If the corrective action fails (which is likely without root cause analysis), the deficiency persists and grows, and the agency\'s documented awareness of the problem without effective remediation strengthens any future False Claims Act theory of "reckless disregard."',
    },
  },

  // ═══════════════════════════════════════════════
  // MODULE 7: Documentation in Clinical Workflows
  // ═══════════════════════════════════════════════

  'L7-01': {
    id: 'TS-L7-01',
    stem: 'An RN documents a wound care visit for a Stage II pressure injury on the left heel: "Wound care provided to left heel pressure injury. Wound appears to be healing well — looks better than last visit. Clean technique used. Applied Aquacel and wrapped with Kerlix. Patient denied pain. Family doing well with repositioning. Will continue current treatment per plan of care." The nurse\'s previous visit note 5 days ago documented the wound as 2.5 × 1.8 × 0.3 cm with moderate serosanguineous drainage and 70% granulation tissue. Which statement BEST identifies the PRIMARY documentation failure?',
    options: [
      { id: 'A', text: 'The note fails because the RN did not include a wound photograph as required by CMS for all pressure injuries classified as Stage II or above.' },
      { id: 'B', text: 'The primary failure is that the RN used "clean technique" instead of documenting "sterile technique" for wound care, which is required for Stage II pressure injuries under infection control guidelines.' },
      { id: 'C', text: 'The current note contains no wound measurements, no wound bed description, no drainage assessment, no staging confirmation, and no comparison to the documented baseline from 5 days ago — the claim that the wound "appears to be healing" and "looks better" is an unsupported subjective conclusion. Without objective data, an auditor cannot verify wound trajectory, and the note fails to justify continued skilled wound care.' },
      { id: 'D', text: 'The note is deficient primarily because the RN did not document reassessing the wound staging and pressure injury risk assessment score (Braden Scale) at this visit.' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'Wound documentation requires objective, measurable data — not subjective impressions. The nurse has a documented baseline (2.5 × 1.8 × 0.3 cm, moderate serosanguineous drainage, 70% granulation) from five days ago but provides zero comparable data. "Looks better" and "appears to be healing" are clinically meaningless without supporting measurements. Did the wound decrease? By how much? Is granulation tissue increasing? Has drainage character or amount changed? Without this data, the note cannot support the subjective assessment, and an auditor has no basis for determining treatment effectiveness.',
      whatDocumentationShouldShow: 'Current wound measurements (L × W × D) with explicit comparison to prior visit: "Left heel Stage II pressure injury measured 2.1 × 1.5 × 0.2 cm (decreased from 2.5 × 1.8 × 0.3 cm on [date]). Wound bed 85% granulation tissue (increased from 70%), scant serous drainage (decreased from moderate serosanguineous). Periwound skin intact, non-erythematous." Plus treatment rationale and patient/family response.',
      auditorConclusion: 'The auditor sees a vague wound note that follows a specific baseline note — the contrast makes the inadequacy even more apparent. If the nurse can measure on one visit but not the next, the auditor questions whether an assessment was actually performed at the current visit.',
      clinicalRisk: 'Without current measurements, the next clinician must rely on subjective "looks better" to assess trajectory. If the wound subsequently deteriorates, there is no objective comparison point, and the deterioration timeline cannot be established.',
      complianceRisk: 'Wound care visits are among the most frequently audited home health services. A wound note with subjective-only assessment following a quantitative baseline note creates a pattern suggesting inconsistent documentation practices that will be explored across the clinician\'s other wound care patients.',
    },
  },

  'L7-02': {
    id: 'TS-L7-02',
    stem: 'An RN visits a home health patient for a skilled nursing medication management visit and documents: "Reviewed all current medications with patient. Organized medications into pill organizer for the week — AM, noon, PM, and bedtime slots. All medication bottles accounted for, no expired medications found. Patient has adequate supply for the month and knows pharmacy phone number for refills. No adverse effects reported. Patient managing medications well. Will return next week for medication management." Which statement BEST explains why this note fails to support skilled nursing reimbursement?',
    options: [
      { id: 'A', text: 'The note fails because the RN did not list every medication by name, dosage, route, and frequency in the body of the visit note.' },
      { id: 'B', text: 'Medication management visits require documentation of a current medication reconciliation against a pharmacy printout, which the note does not mention.' },
      { id: 'C', text: 'The note is deficient because the RN did not document checking the patient\'s vital signs, which are required for every skilled nursing visit regardless of visit type.' },
      { id: 'D', text: 'The documented activities — pill organizer setup, medication counting, supply verification, and refill coordination — are non-skilled tasks that a home health aide, family member, or the patient could perform. There is no documentation of skilled assessment (drug interaction evaluation, therapeutic effectiveness monitoring, lab correlation), skilled teaching (medication education with comprehension assessment), or clinical judgment (dosage appropriateness analysis, medication reconciliation against orders) that distinguishes this from non-skilled medication assistance.' },
    ],
    correctOptionId: 'D',
    rationale: {
      whyCorrect: 'Medicare pays for skilled nursing medication management when the visit requires the knowledge, judgment, and skills of a registered nurse. Pill organizer setup, counting pills, and verifying supply are tasks that require no clinical training. The note documents nothing requiring RN-level skill: no clinical assessment of drug interactions, no monitoring of therapeutic response (BP for antihypertensives, glucose for diabetes medications), no medication reconciliation identifying discrepancies, no skilled teaching with comprehension assessment, and no clinical judgment about dosing appropriateness.',
      whatDocumentationShouldShow: 'Evidence of skilled assessment: medication reconciliation against current orders identifying discrepancies, therapeutic effectiveness evaluation (correlating clinical findings to medication effects), drug interaction assessment, adverse effect monitoring with clinical interpretation, skilled teaching on new or high-risk medications with documented teach-back, and clinical judgment about the ongoing medication regimen.',
      auditorConclusion: 'The auditor reads a visit note that describes aide-level activities billed at skilled nursing rates. This is a textbook example of upcoding: billing for a skilled service while documenting only non-skilled tasks. The auditor will deny the claim and flag the clinician\'s other medication management visits for pattern review.',
      clinicalRisk: 'If the patient\'s medication regimen truly warrants skilled nursing monitoring, the lack of documented clinical assessment means that drug interactions, therapeutic failures, and emerging adverse effects are not being evaluated — the patient receives pill setup without clinical oversight.',
      complianceRisk: 'Systematic billing for skilled medication management visits documented at non-skilled level is one of the most common upcoding patterns identified in home health audits. This pattern across multiple patients constitutes potential False Claims Act liability.',
    },
  },

  'L7-03': {
    id: 'TS-L7-03',
    stem: 'A physical therapist documents functional assessment across 8 consecutive therapy visits using the same language: "Patient requires mod assist with transfers and ambulation with RW. ADLs require some assist. Patient continues to progress toward goals. Recommend continued skilled PT." When the MAC audits the episode, the reviewer notes that identical functional descriptors appear on all 8 notes without variability, objective performance measurements, or specific evidence of progression. Which statement BEST identifies the core functional documentation failure?',
    options: [
      { id: 'A', text: 'The notes substitute generic assist-level terminology for actual observed performance — there are no ambulation distances, no timed measurements, no specific descriptions of what the patient can versus cannot do independently, no comparison of function across visits, and no objective basis for the claim that the patient "continues to progress." The identical language across 8 visits suggests either copy-forward documentation or failure to perform individualized functional assessments.' },
      { id: 'B', text: 'The PT should have used the Barthel Index or Functional Independence Measure (FIM) instrument instead of generic assist-level descriptors, as CMS requires standardized functional assessment tools for home health therapy billing.' },
      { id: 'C', text: 'The documentation fails because the PT did not specify the brand, model, and configuration of the rolling walker, which is required for durable medical equipment billing coordination.' },
      { id: 'D', text: 'Functional assessment documentation at this level of detail is only required at start-of-care and recertification visits — interim therapy notes may use summary functional descriptors.' },
    ],
    correctOptionId: 'A',
    rationale: {
      whyCorrect: 'Functional documentation must be based on direct observation with specific, measurable parameters. "Mod assist with transfers" tells auditors nothing: what TYPE of transfer? From where to where? What specific assistance was needed? Was it physical or verbal cueing? "Continues to progress" claims improvement without evidence. A patient who was "mod assist with transfers" on Visit 1 and "mod assist with transfers" on Visit 8 has NOT progressed by any documented measure — directly contradicting the progress claim and undermining the justification for continued skilled therapy.',
      whatDocumentationShouldShow: 'Specific functional performance at each visit: "Sit-to-stand from 18" surface: required one verbal cue for hand placement, independent with effort once initiated. Ambulation with RW × 120 feet (increased from 80 feet on [prior date]), self-selected gait speed improved from 0.4 m/s to 0.6 m/s, mild trunk lean to R noted but improved from moderate lean on prior visit. Bed mobility: rolling to L independent, rolling to R requires min assist for final 30° due to R shoulder pain."',
      auditorConclusion: 'Identical functional descriptors across 8 visits provide zero evidence of skilled assessment or therapeutic progress. The auditor will conclude that either the assessments were not performed (documentation was copied) or the patient is not progressing (making continued skilled therapy potentially unnecessary). Both conclusions result in denial.',
      clinicalRisk: 'Copy-forward functional assessments may mask functional decline. If the patient\'s transfer ability actually deteriorated between visits, the unchanged "mod assist" language prevents detection of a clinically significant change requiring medical evaluation.',
      complianceRisk: 'Identical functional documentation across sequential therapy visits is a red flag that triggers expanded review of the therapist\'s entire caseload. The pattern suggests systemic documentation practices that apply to all patients, not just this episode.',
    },
  },

  'L7-04': {
    id: 'TS-L7-04',
    stem: 'During a Monday home health visit, an RN assesses a patient with a history of CHF and documents: "New onset bilateral lower extremity edema — 2+ pitting to mid-calf bilaterally. Weight today 172 lbs (168 lbs last Wednesday visit — 4 lb gain in 5 days). Patient reports sleeping in recliner for 2 nights due to shortness of breath when lying flat. Orthopnea × 2 nights. O2 sat 91% on RA (baseline 96%). JVD noted at 45 degrees." The note then reads: "Will continue to monitor. Plan: return visit Thursday per schedule." No physician notification is documented. The patient is hospitalized Tuesday night with acute CHF exacerbation. Which statement BEST identifies the documentation and clinical failure?',
    options: [
      { id: 'A', text: 'The clinical assessment findings are appropriate, but the nurse should have obtained a chest X-ray and BNP level before contacting the physician to provide more complete clinical information.' },
      { id: 'B', text: 'The documented findings — new bilateral edema, rapid weight gain, orthopnea, decreased O2 saturation, and JVD — are textbook indicators of CHF decompensation requiring IMMEDIATE physician notification. The note documents thorough recognition of the problem but zero clinical response: no physician contact, no new orders requested, no urgent reassessment planned, and no updated plan of care. The "will continue to monitor" response to an actively decompensating CHF patient represents both a documentation failure and a clinical failure that directly preceded a preventable hospitalization.' },
      { id: 'C', text: 'The failure is that the RN did not document administering a PRN dose of Lasix before leaving, which would have addressed the fluid overload symptoms pending physician contact.' },
      { id: 'D', text: 'The documentation meets clinical documentation standards because all relevant findings are recorded — the physician notification timing is governed by agency protocol, and the "Thursday return visit" is clinically appropriate for monitoring CHF patients.' },
    ],
    correctOptionId: 'B',
    rationale: {
      whyCorrect: 'This scenario illustrates the most dangerous documentation pattern: excellent assessment documentation with absent clinical response. The nurse recognized and documented every CHF decompensation indicator (4 lb weight gain in 5 days, new bilateral edema, orthopnea, O2 sat drop from 96% to 91%, JVD) — but then documented "will continue to monitor" and scheduled a Thursday return visit. Physician notification for these findings was not optional — it was mandated by clinical standards and the CMS requirement to document timely response to changes in condition.',
      whatDocumentationShouldShow: 'After documenting the clinical findings: physician notification using SBAR format (name, date, time, mode of communication, clinical findings communicated, physician response and orders received), any new medication orders (e.g., Lasix adjustment), updated plan of care reflecting the clinical change, expedited follow-up visit plan, and patient/caregiver education on when to seek emergency care.',
      auditorConclusion: 'The medical record shows the agency recognized a clinical emergency and failed to act. This is worse than not recognizing the problem — it demonstrates awareness without action. If the hospitalization results in a quality of care investigation, the visit note becomes evidence of delayed clinical response.',
      clinicalRisk: 'The patient was hospitalized the following day with the exact condition the nurse identified but did not emergently address. This represents a direct clinical harm attributable to failure to act on documented findings — a preventable hospitalization that affects the patient, the agency\'s quality metrics, and potentially the patient\'s long-term cardiac outcomes.',
      complianceRisk: 'Failure to document timely physician notification for significant clinical changes violates conditions of participation and creates professional liability exposure. If the patient suffered adverse outcomes from the delayed response, the documentation showing assessment without action becomes the centerpiece of malpractice and regulatory proceedings.',
    },
  },

  // ═══════════════════════════════════════════════
  // MODULE 8: Case-Based Documentation Scenarios
  // ═══════════════════════════════════════════════

  'L8-01': {
    id: 'TS-L8-01',
    stem: 'A home health RN provides wound care for a patient with a diabetic foot ulcer over a 30-day period. The documentation pattern across 6 visits: Visit 1: "Wound stable, no change from prior assessment." Visit 2: "Wound stable, no change." Visit 3: "Wound stable, continued current treatment." Visit 4: "Wound stable, no significant change." Visit 5: "Wound slightly improved, continue plan." At Visit 6, the RN documents that the wound has progressed from a superficial ulcer to a Stage III pressure injury with 0.5 cm depth and exposed subcutaneous tissue. None of the prior notes contain wound measurements, wound bed descriptions, or drainage assessments. Which statement BEST describes the cascading documentation failure?',
    options: [
      { id: 'A', text: 'The documentation is acceptable for Visits 1-4 because the wound was stable. Visit 5 is the only contradictory note because it claims "slightly improved" while prior notes all stated "stable" — the inconsistency between "stable" and "improved" is the primary audit finding.' },
      { id: 'B', text: 'The primary clinical issue is that the nurse should have obtained a wound culture at Visit 3 when two weeks of treatment showed no wound improvement, not that the documentation pattern was deficient.' },
      { id: 'C', text: 'Five "stable/no change" notes without ANY objective wound data followed by sudden Stage III progression creates two catastrophic problems: (1) the deterioration appears sudden and unmonitored, suggesting either the worsening was missed during prior visits due to failure to perform actual wound assessments, OR the prior "stable" documentation was fabricated without clinical evaluation; and (2) no visit in the series can independently justify skilled wound care because none contains the objective data required to demonstrate medical necessity for each visit.' },
      { id: 'D', text: 'The documentation would be compliant if each "stable" note referenced the original wound measurements from the start-of-care assessment, maintaining a documented baseline for comparison.' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'This pattern represents a cascading failure: five visits with zero objective wound data followed by dramatic deterioration. The question the auditor asks is devastating: if the wound was truly "stable" for five visits, how did it suddenly progress to Stage III? Either (1) the wound was gradually deteriorating but the nurse wasn\'t measuring, meaning the "stable" documentation was false, or (2) the nurse was measuring but not documenting, meaning the wound trajectory data is lost. Either conclusion is indefensible, and the lack of objective data at any visit means none of the six claims can be independently supported.',
      whatDocumentationShouldShow: 'Each wound care visit note must contain: current measurements (L × W × D), wound bed description (% granulation, slough, necrotic, eschar), drainage type and amount, periwound skin assessment, pain level, treatment provided with rationale, and COMPARISON to prior visit. Even a stable wound requires current measurements to support the stability assessment.',
      auditorConclusion: 'All six visits will be denied. Visits 1-5 lack the objective data to support skilled wound care claims. Visit 6 reveals a Stage III wound that developed under the nurse\'s care without any documented early detection or intervention. The auditor will also examine whether the deterioration triggers the agency\'s quality of care reporting obligations.',
      clinicalRisk: 'A wound that progresses from superficial to Stage III with exposed subcutaneous tissue over 30 days with no documented early detection represents a quality of care failure. Objective wound measurements at each visit would have detected the trajectory early enough for treatment modification.',
      complianceRisk: 'Beyond claim denials, the scenario raises quality of care questions that may trigger state survey investigation. If wound deterioration occurred because assessments were not performed (as the documentation suggests), the agency faces professional liability, regulatory action, and potential CMS sanctions.',
    },
  },

  'L8-02': {
    id: 'TS-L8-02',
    stem: 'A physical therapy visit note for a post-TKR patient contains impressive objective data: "TKE × 15 reps, SLR × 15 reps, heel slides × 20 reps. AROM knee flexion 102° (goniometric measurement). Gait training FWW × 150 ft. Standing balance: maintained 30 seconds without UE support. Step-ups: 4" step × 10 bilaterally. Stair training: 6 steps with bilateral rail. Calf circumference: R 38 cm, L 36.5 cm." The note contains no other narrative. A MAC reviewer denies the visit despite this level of detail. The PT is shocked: "There are more numbers in this note than in any other therapist\'s documentation." Which statement BEST explains how such a data-rich note can fail?',
    options: [
      { id: 'A', text: 'The note fails because the PT did not document the patient\'s subjective pain level during each exercise using a standardized 0-10 pain scale as required by therapy billing guidelines.' },
      { id: 'B', text: 'The denial occurred because goniometric measurements must include documentation of the measurement position, type of goniometer used, and whether the measurement was active or passive.' },
      { id: 'C', text: 'The MAC denial is incorrect — this note contains more objective data than 90% of therapy notes and easily exceeds the skilled documentation threshold. The denial should be appealed.' },
      { id: 'D', text: 'The note contains measurements but zero clinical reasoning — there is no comparison to prior visit data showing trajectory, no analysis of why 102° flexion indicates continued need for skilled PT versus discharge to HEP, no interpretation of the 1.5 cm calf circumference discrepancy (potential DVT indicator), no gait quality assessment (speed, deviations, safety), no clinical explanation of why these exercises require therapist supervision, and no progress evaluation connecting current status to discharge goals. It reads as an exercise log, not a skilled therapy evaluation.' },
    ],
    correctOptionId: 'D',
    rationale: {
      whyCorrect: 'Objective data without clinical reasoning is data without purpose. The PT recorded extensive measurements but applied no clinical judgment to any of them. The 1.5 cm calf circumference discrepancy between right and left legs is potentially clinically significant (post-surgical DVT indicator) but receives no clinical interpretation. The 102° knee flexion with a goal of 120° receives no trajectory analysis or timeline projection. The exercises are listed as a workout log with no explanation of why therapist-level supervision is needed versus patient self-directed exercise. Numbers demonstrate measurement, not skilled assessment.',
      whatDocumentationShouldShow: 'Clinical reasoning linking data to decisions: "AROM knee flexion 102° (increased from 95° on [date], 3°/week trajectory toward 120° goal — on track for discharge criteria within estimated 3 weeks). Barrier to progress: patient demonstrates guarding with terminal flexion due to anterior knee pain 4/10, limiting ROM gains beyond 100° without skilled manual stretching." And for the calf measurements: "Noted 1.5 cm discrepancy in calf circumference R > L. Assessed for DVT risk: no warmth, no Homans sign, no erythema. Will continue to monitor; if discrepancy increases, will notify MD."',
      auditorConclusion: 'The auditor sees a technically impressive note that demonstrates the PT can measure but not analyze. Without clinical reasoning, the note fails to justify WHY this patient requires ongoing skilled therapy rather than a home exercise program — which is the fundamental question the documentation must answer.',
      clinicalRisk: 'The uninterpreted calf circumference discrepancy is the most concerning clinical risk. A post-surgical calf measurement difference of 1.5 cm without documented DVT screening suggests the PT either didn\'t recognize its significance or recognized it but failed to act — either outcome is clinically dangerous.',
      complianceRisk: 'Therapy visits documented without clinical reasoning constitute the fastest-growing category of home health claim denials. This documentation pattern across a caseload suggests the therapist consistently measures without analyzing, creating systematic audit vulnerability.',
    },
  },

  'L8-03': {
    id: 'TS-L8-03',
    stem: 'A ZPIC reviews 50 home health visits by a single nurse over a 3-month period. EVV data consistently shows visit durations of 8-12 minutes per visit. The corresponding clinical documentation for these visits describes comprehensive skilled nursing assessments, detailed wound care with measurements, thorough medication reconciliation, patient and caregiver education with teach-back methodology, and care coordination with physicians. These documented services would reasonably require 35-45 minutes to perform. When interviewed, the nurse explains: "I\'m very efficient. I also document from memory in my car right after the visit. Sometimes I might have been more thorough in my documentation than the visit warranted." Which statement BEST describes the program integrity implications?',
    options: [
      { id: 'A', text: 'The EVV-documentation discrepancy establishes a pattern consistent with either significant upcoding (documenting more comprehensive services than were actually provided) or documentation fabrication (creating clinical narratives that do not reflect what occurred). The nurse\'s own admission that she "might have been more thorough in documentation than the visit warranted" is a statement against interest that suggests conscious embellishment of clinical records — elevating this from a documentation quality issue to a potential fraud investigation referral to the OIG.' },
      { id: 'B', text: 'The discrepancy is adequately explained by the fact that EVV captures only physical presence time in the home and does not account for legitimate pre-visit preparation and post-visit documentation time, which can account for 50-60% of total visit time.' },
      { id: 'C', text: 'The nurse\'s car documentation practice is acceptable under current CMS guidelines as long as notes are completed and signed within 24 hours of the visit, which satisfies the contemporaneous documentation standard.' },
      { id: 'D', text: 'ZPIC investigators cannot use EVV data as primary evidence because EVV systems have documented accuracy limitations and the data is intended for attendance verification, not clinical service duration measurement.' },
    ],
    correctOptionId: 'A',
    rationale: {
      whyCorrect: 'The EVV data creates an objective timeline that cannot be reconciled with the documented services. An 8-12 minute visit cannot include comprehensive assessment, wound care with measurements, medication reconciliation, teach-back education, and physician coordination — the activities physically require more time than the EVV shows. The nurse\'s statement that she "might have been more thorough in documentation than the visit warranted" is a critical admission suggesting she documents services she did not actually perform in the described manner. This transforms a documentation discrepancy into evidence of knowing submission of false claims.',
      whatDocumentationShouldShow: 'Visit documentation should accurately reflect the services actually provided within the documented visit time. If a visit was 10 minutes, the documentation should describe 10 minutes of service — not a comprehensive assessment that requires 45 minutes. Documentation must be truthful and contemporaneous, created during or immediately after providing care.',
      auditorConclusion: 'The ZPIC will calculate the financial impact across all 50 visits and refer the finding for expanded investigation. The nurse\'s own admission, combined with the consistent EVV-documentation discrepancy pattern, meets the threshold for OIG referral for potential criminal fraud investigation. This is no longer an administrative documentation quality issue.',
      clinicalRisk: 'If the nurse is documenting assessments she did not perform at the documented level of thoroughness, patients may not be receiving the comprehensive skilled nursing care their conditions require. Documented but unperformed wound assessments, medication reconciliations, and clinical evaluations represent direct patient safety risks.',
      complianceRisk: 'EVV discrepancy patterns meeting fraud criteria bypass civil administrative channels and are referred directly to the OIG for criminal investigation. The nurse faces potential criminal prosecution, and the agency faces liability for failure to supervise and failure to identify the pattern through internal monitoring. Civil monetary penalties of up to $100,000 per false claim may apply.',
    },
  },

  'L8-04': {
    id: 'TS-L8-04',
    stem: 'A home health agency\'s OASIS documentation includes homebound status as: "Patient is homebound due to CHF." The chart is audited, and the reviewer cross-references clinical documentation across all disciplines. The PT\'s Visit 3 note documents: "Patient drove herself to hair appointment this morning — arrived home appearing fatigued." The OT\'s Visit 5 note states: "Patient reports going to church on Sundays with her daughter." The nursing OASIS assessment documents the patient as independent with ambulation using no assistive device. The agency argues that the patient\'s CHF diagnosis qualifies her for home health services. Which statement BEST explains the audit finding?',
    options: [
      { id: 'A', text: 'The homebound status is acceptable because CHF is an approved qualifying diagnosis for home health services under the Medicare Conditions of Participation, and the occasional community outings are "infrequent and of short duration" as permitted by CMS.' },
      { id: 'B', text: 'The diagnosis-only homebound statement is insufficient — it names a disease but documents NO functional limitations. Worse, the interdisciplinary clinical record CONTRADICTS the homebound certification: independent ambulation without an assistive device, driving to non-medical appointments, and weekly church attendance without documented taxing effort. This creates retroactive denial exposure for the ENTIRE episode because homebound status is a condition of coverage — not a single-visit requirement — and the agency\'s own clinicians documented the contradicting evidence.' },
      { id: 'C', text: 'The documentation would be saved if the nurse amended the homebound status statement to add "patient also experiences fatigue upon exertion," which would satisfy the functional limitation requirement.' },
      { id: 'D', text: 'The therapy notes documenting community outings should not have been written because they undermine the homebound certification — the therapists should have consulted with the case manager before documenting activities that conflict with the homebound determination.' },
    ],
    correctOptionId: 'B',
    rationale: {
      whyCorrect: 'Homebound status requires documentation of functional limitations that make leaving home a "considerable and taxing effort." A diagnosis alone never establishes homebound status. This record is especially problematic because the agency\'s own clinicians documented evidence directly contradicting the homebound certification: the patient drives herself to appointments, ambulates independently without an assistive device, and attends church weekly. These are not "infrequent" outings of "short duration" — they suggest a patient who is regularly mobile in the community without considerable effort.',
      whatDocumentationShouldShow: 'If the patient is truly homebound despite these outings: specific functional limitations that make leaving home a considerable effort (e.g., "requires 45 minutes to prepare for any outing due to fatigue management, must rest 20 minutes after walking to car, requires portable O2 for any trip exceeding 15 minutes"), documentation that outings are truly infrequent with specific frequency noted, and evidence that community outings require considerable assistance or preparation effort.',
      auditorConclusion: 'All claims for the entire episode will be denied because homebound status — a condition of coverage — is not supported. The agency\'s own documentation provides the contradicting evidence. This is worse than absent documentation because the agency created the evidence trail that defeats its own certification.',
      clinicalRisk: 'If the patient is not truly homebound, she may be better served by outpatient therapy where she would receive more intensive, equipment-rich treatment. Maintaining inappropriate home health certification may actually limit the patient\'s access to optimal care.',
      complianceRisk: 'Certifying homebound status with a diagnosis-only statement while the clinical record documents contradicting functional independence raises fraud concerns. If this pattern exists across multiple patients, it suggests systematic false certification of homebound status — one of the most commonly prosecuted home health fraud schemes.',
    },
  },
}
