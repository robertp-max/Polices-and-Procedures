/**
 * CMS Documentation Matters Toolkit — Quiz & Assessment Content
 * Expert-level documentation integrity challenges
 */

export interface QuizOption {
  id: string
  text: string
}

export interface QuizItem {
  id: string
  moduleId: string
  difficulty: 'standard' | 'advanced' | 'expert'
  stem: string
  options: QuizOption[]
  correctOptionId: string
  rationale: {
    whyCorrect: string
    whyIncorrectA?: string
    whyIncorrectB?: string
    whyIncorrectC?: string
    whyIncorrectD?: string
    whatDocumentationShouldShow: string
    auditorConclusion: string
    clinicalRisk: string
    complianceRisk: string
  }
}

export const knowledgeCheckQuiz: QuizItem[] = [
  {
    id: 'KC-01',
    moduleId: 'mod-1',
    difficulty: 'standard',
    stem: 'A home health nurse provides a 30-minute skilled nursing visit for wound care. The visit note reads: "Wound care provided. Dressing changed. Patient tolerated well. Will continue current plan of care." Which of the following BEST describes the primary documentation failure?',
    options: [
      { id: 'A', text: 'The note fails to document the time of the visit and the nurse\'s credentials' },
      { id: 'B', text: 'The note documents tasks performed but lacks clinical assessment findings, wound measurements, clinical reasoning, and patient-specific response data needed to support medical necessity' },
      { id: 'C', text: 'The note should have included a photograph of the wound instead of written documentation' },
      { id: 'D', text: 'The note is adequate because it confirms the service was provided and the patient tolerated the procedure' },
    ],
    correctOptionId: 'B',
    rationale: {
      whyCorrect: 'The note describes tasks (wound care, dressing change) without any clinical findings, wound measurements, wound bed characteristics, drainage description, or clinical reasoning for the intervention. It fails to demonstrate that skilled assessment occurred or that the service required the judgment of a licensed professional.',
      whyIncorrectA: 'While time documentation and credentials are important, the fundamental failure is the complete absence of clinical content. A note with time and credentials but no clinical substance would still be denied.',
      whyIncorrectC: 'Photographs supplement written documentation but do not replace it. CMS requires narrative clinical documentation regardless of whether photographs are taken.',
      whyIncorrectD: '"Patient tolerated well" is a vague statement that does not constitute adequate response documentation. The note lacks everything an auditor needs to verify that skilled care was medically necessary.',
      whatDocumentationShouldShow: 'Wound type, location, stage, measurements (L x W x D), wound bed description, drainage characteristics, periwound condition, pain assessment, treatment rationale, and comparison to prior visit.',
      auditorConclusion: 'The auditor would determine that the documentation does not support medical necessity for skilled wound care and would deny the claim. The note reads as a task that could have been performed by a non-skilled caregiver.',
      clinicalRisk: 'Without objective wound assessment data, the next clinician cannot determine wound trajectory, identify complications, or modify the treatment plan based on clinical progress.',
      complianceRisk: 'Pattern of task-only documentation across wound care visits would trigger expanded review and potential recoupment of all similarly documented visits.',
    },
  },
  {
    id: 'KC-02',
    moduleId: 'mod-2',
    difficulty: 'advanced',
    stem: 'During an internal audit, a QA reviewer discovers that 12 skilled nursing visits across three patients lack documentation supporting the skilled need for the service. The visit notes contain only vital signs and "medication management — medications set up for the week." The QA reviewer presents the findings to the Director of Nursing. Which of the following represents the MOST critical immediate compliance obligation?',
    options: [
      { id: 'A', text: 'Implement additional training for the nurses and document the training in their personnel files to satisfy future audit requirements' },
      { id: 'B', text: 'The 60-day clock under Section 1128J(d) of the Social Security Act has been triggered, requiring the agency to report and return the overpayment within 60 days of identification or face False Claims Act liability' },
      { id: 'C', text: 'Request the nurses who documented the visits to go back and add additional clinical content to the existing notes to bring them into compliance before any reporting obligation arises' },
      { id: 'D', text: 'Wait for the next scheduled external audit to determine whether CMS agrees the documentation is insufficient, since internal reviewers may apply stricter standards than federal auditors' },
    ],
    correctOptionId: 'B',
    rationale: {
      whyCorrect: 'The moment the agency identifies that claims were submitted without adequate documentation supporting the service, the 60-day overpayment reporting obligation is triggered. Under Section 1128J(d) of the Social Security Act, the agency must report and return the overpayment within 60 days or the overpayment is reclassified as an "obligation" under the False Claims Act.',
      whyIncorrectA: 'Training is an appropriate corrective action but does not address the immediate legal obligation to report and return overpayments that have already been identified. Training prevents future errors; it does not eliminate liability for past ones.',
      whyIncorrectC: 'Retroactively adding clinical content to existing notes constitutes falsification of the medical record. This is potentially criminal and would compound the compliance violation.',
      whyIncorrectD: 'Waiting for an external audit to "confirm" an internally identified overpayment is legally untenable. The statute is triggered by identification, not by external validation. Deliberately delaying reporting increases False Claims Act liability.',
      whatDocumentationShouldShow: 'The original visit notes should have documented the specific medications reviewed, the clinical assessment that required skilled nursing judgment, the patient\'s demonstrated understanding, and barriers to self-management.',
      auditorConclusion: '"Medication management — medications set up for the week" describes an aide-level task, not skilled nursing. No documentation of clinical assessment, teaching, or skilled judgment. Claims would be denied as not medically necessary.',
      clinicalRisk: 'Poor medication documentation may mask dangerous medication interactions, duplications, or adherence failures that the nurse identified but failed to document.',
      complianceRisk: 'Failure to report identified overpayments within 60 days converts a documentation deficiency into potential False Claims Act liability with treble damages and per-claim penalties.',
    },
  },
  {
    id: 'KC-03',
    moduleId: 'mod-3',
    difficulty: 'expert',
    stem: 'A home health nurse documents the following visit note for a patient with CHF: "Patient reports feeling \'about the same.\' VS: BP 138/84, HR 78, RR 18, O2 sat 96% RA. Lungs clear to auscultation bilaterally. No edema noted. Weight 172 lbs. Daily weights being monitored. Medications reviewed — patient taking all medications as prescribed. Continue current plan of care. MD aware of status." A reviewer identifies this note as appearing typical of a routine nursing visit documentation. However, reviewing the previous three visit notes reveals nearly identical vital signs, identical assessment language, and identical plan statements. Furthermore, the patient\'s admission weight was 158 lbs (14 lbs ago), and the previous 485 shows a weight parameter of "notify MD if weight gain > 3 lbs in 3 days." Which of the following BEST identifies the layered documentation failures?',
    options: [
      { id: 'A', text: 'The note is clinically adequate because vital signs are documented, lungs were auscultated, weight was recorded, and medications were reviewed' },
      { id: 'B', text: 'The primary failure is the lack of a physician signature on the visit note, which renders the clinical content irrelevant' },
      { id: 'C', text: 'The note appears routine when viewed alone but reveals copy-forward cloning when compared to prior notes, fails to address the clinically significant 14-lb weight gain against the plan of care weight parameter, and uses "MD aware" without documenting specific physician communication details (who, when, what was communicated, what orders were received)' },
      { id: 'D', text: 'The documentation is compliant but the nurse should have ordered an echocardiogram independently to investigate the weight gain' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'This scenario reveals three layered failures that only become apparent through careful analysis: (1) Copy-forward cloning — identical notes across visits suggest the nurse is not performing individualized assessments; (2) Clinical significance missed — a 14-lb weight gain in a CHF patient against a 3-lb weight parameter is a critical clinical finding that is documented but not acted upon or even addressed in the assessment; (3) "MD aware" is an unverifiable statement — it lacks who was contacted, when, by what method, what was communicated, and what response/orders were received.',
      whyIncorrectA: 'Viewed in isolation, the note has the appearance of adequacy. But this is exactly the type of documentation that fails under audit scrutiny — it checks superficial boxes while missing substantive clinical requirements.',
      whyIncorrectB: 'While physician signature requirements exist for orders and plans of care, the primary failures here are clinical content failures, not signature failures.',
      whyIncorrectD: 'Nurses do not independently order diagnostic tests like echocardiograms. This reflects a misunderstanding of scope of practice and is a designed distractor targeting clinicians who focus on the clinical action rather than the documentation failure.',
      whatDocumentationShouldShow: 'The note should: address the weight trend (158 → 172 lbs), correlate weight gain to the 485 parameter, document a focused CHF assessment (JVD, peripheral edema quantification, orthopnea assessment, daily sodium intake review), document specific physician communication (name, time, method, response), and document any orders received.',
      auditorConclusion: 'The auditor would flag this for: (1) possible cloned documentation across visits, (2) failure to follow the plan of care weight monitoring parameters, and (3) inadequate physician communication documentation. The pattern would trigger expanded review.',
      clinicalRisk: 'A 14-lb weight gain in a CHF patient that goes clinically unaddressed in the documentation (and possibly in practice) represents a serious patient safety failure that could lead to acute decompensation and hospitalization.',
      complianceRisk: 'Copy-forward documentation patterns across visits create extrapolation risk — if cloning is found in a sample, auditors may extrapolate the denial rate across the clinician\'s entire caseload.',
    },
  },
  {
    id: 'KC-04',
    moduleId: 'mod-4',
    difficulty: 'expert',
    stem: 'A PT documents the following note for a home health patient following total knee replacement: "Pt performed TKE x 10 reps, SLR x 10 reps, heel slides x 15 reps. AROM R knee flexion 98° (goal 120°). Gait training with FWW x 100\' in hallway. Pt reports pain 4/10 during exercise. Instructed in HEP. Pt to continue exercises as instructed." A careful reviewer notes that this note is missing several critical elements. Which of the following MOST completely identifies the documentation deficiencies that would jeopardize this claim under audit?',
    options: [
      { id: 'A', text: 'The note is adequate because it documents therapeutic exercises with repetitions, ROM measurement with goal comparison, gait training with distance, and pain level — all standard PT documentation elements' },
      { id: 'B', text: 'The note lacks the total visit time, which is required for all therapy visits to determine whether the services were furnished for a reasonable duration' },
      { id: 'C', text: 'The note documents exercises and measurements but lacks: comparison to prior visit ROM to show progression, gait quality assessment (pattern, deviations, safety), patient response to gait training (fatigue, balance deficits), what the HEP specifically included, whether the patient demonstrated correct HEP technique, clinical reasoning for continued skilled PT rather than aide-supervised exercise, and functional progress toward discharge goals' },
      { id: 'D', text: 'The note should have included the physician order for physical therapy rather than the clinical content of the visit' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'The note is a classic example of "exercise logging" rather than skilled therapy documentation. It records what was done without documenting the skilled clinical reasoning, assessment findings, patient response quality, functional progress, or discharge trajectory. An auditor reviewing this note cannot determine: (1) whether the patient is progressing, (2) what skilled clinical judgments the PT made during the visit, (3) whether continued skilled therapy is justified versus an HEP-only approach, or (4) whether the patient can safely perform exercises independently.',
      whyIncorrectA: 'The note contains data points but lacks synthesis. Measurements without comparison, gait training without quality assessment, and "instructed in HEP" without specifics do not demonstrate skilled therapy was required.',
      whyIncorrectB: 'While visit duration may be relevant for certain billing requirements, the fundamental failure is the absence of clinical reasoning and assessment content — not the duration.',
      whyIncorrectD: 'The physician order supports the medical necessity for therapy but is a separate document. The visit note must independently demonstrate that the skilled service was provided and was necessary.',
      whatDocumentationShouldShow: 'ROM comparison to baseline/prior visit, gait assessment (pattern, deviations, weight-bearing status, dynamic balance), patient response during and after exercise, specific HEP content with return demonstration results, clinical reasoning for continued skilled intervention, and functional progress toward specific measurable goals.',
      auditorConclusion: 'The auditor would question whether the exercises documented require the skills of a licensed PT or could be performed under an aide\'s supervision with a written exercise plan. Without documentation of skilled clinical judgment, the claim is vulnerable to denial.',
      clinicalRisk: 'Documentation that tracks exercises without clinical assessment may miss developing complications (effusion, instability, wound dehiscence) in post-surgical patients.',
      complianceRisk: 'Therapy documentation that reads as an "exercise log" across multiple visits creates a pattern suggesting that skilled therapy services are being overbilled. This is a known OIG audit target.',
    },
  },
  {
    id: 'KC-05',
    moduleId: 'mod-5',
    difficulty: 'advanced',
    stem: 'An agency implements a self-audit program. The compliance officer pulls every 15th chart from Q2 and asks each nurse to review their own charts using a standardized audit tool. Three months later, the audit results show 98% compliance across all quality indicators. The Director of Clinical Services reports these results to the governing body. Which critical flaw undermines the validity of this entire self-audit program?',
    options: [
      { id: 'A', text: 'The sample size was too small; every 15th chart should have been every 5th chart to achieve statistical significance' },
      { id: 'B', text: 'The audit results should have been reported to CMS within 60 days rather than to the governing body' },
      { id: 'C', text: 'CMS explicitly warns against professionals auditing their own charts — subjective bias leads practitioners to infer meaning from their own shorthand when the actual written documentation is legally insufficient, rendering the 98% compliance rate unreliable' },
      { id: 'D', text: 'Self-audits must use the CMS-designated audit tool, not a standardized internal tool developed by the agency' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'CMS guidelines explicitly and strongly warn against having professionals audit their own documentation. Practitioners who review their own notes bring inherent bias — they know what they intended to document, they can mentally fill gaps, and they interpret their own shorthand with knowledge an auditor would not have. The result: notes that would fail external review appear adequate to the original author.',
      whyIncorrectA: 'While sampling methodology matters, every 15th chart is a reasonable random sampling approach. The fatal flaw is not the sampling method but the reviewer assignment (self-audit vs. peer/independent audit).',
      whyIncorrectB: 'Self-audit results are reported internally to the governing body and compliance committee. There is no requirement to report self-audit results to CMS unless overpayments are identified.',
      whyIncorrectD: 'There is no CMS-mandated audit tool. Agencies may use a variety of standard audit tools, including those from the North Carolina Medical Society, Magellan, or internally developed tools based on CMS requirements.',
      whatDocumentationShouldShow: 'A valid self-audit program documents: independent/peer reviewer assignment, standardized tool used, sampling methodology, specific findings by audit criterion, and action plan for deficiencies identified.',
      auditorConclusion: 'An auditor presented with a 98% self-audit compliance rate where clinicians reviewed their own charts would likely disregard the results entirely and conduct an independent review with significantly different expectations.',
      clinicalRisk: 'False compliance confidence from biased self-audit prevents the identification and correction of genuine documentation deficiencies that affect patient care quality.',
      complianceRisk: 'A self-audit program that lacks independence fails to demonstrate good-faith compliance efforts and does not provide the compliance protection that a properly conducted audit would offer.',
    },
  },
  {
    id: 'KC-06',
    moduleId: 'mod-6',
    difficulty: 'expert',
    stem: 'A home health agency completes a CAP after an internal audit revealed that 35% of medication management visit notes lacked demonstration of skilled assessment. The CAP included: (1) a 30-minute staff meeting where the DON verbally reminded nurses to "document more thoroughly," (2) distribution of a one-page tip sheet via email, and (3) a notation in the quality committee minutes that the CAP was "completed." No re-audit was scheduled. Six months later, a MAC audit sample reveals that 38% of medication management notes still lack skilled assessment documentation — a higher rate than the original finding. Which of the following BEST explains why this CAP failed?',
    options: [
      { id: 'A', text: 'The CAP should have included disciplinary action against the nurses with the highest deficiency rates rather than general education' },
      { id: 'B', text: 'The CAP lacked root cause analysis, specific measurable corrective actions, individualized re-education targeting the identified deficiencies, and a mandatory re-audit step to verify that documentation behavior actually changed' },
      { id: 'C', text: 'The tip sheet should have been distributed in paper form rather than email to ensure all nurses received it' },
      { id: 'D', text: 'The CAP failed because the MAC audit used a different sampling methodology than the internal audit, making the results non-comparable' },
    ],
    correctOptionId: 'B',
    rationale: {
      whyCorrect: 'This CAP failed on every substantive dimension: (1) No root cause analysis was performed — the agency never asked WHY nurses were omitting skilled assessment documentation (was it the EHR template? time pressure? lack of understanding? habit?). (2) "Document more thoroughly" is not a specific corrective action. (3) A tip sheet distributed by email is not targeted re-education. (4) Without a re-audit, the agency had no mechanism to verify that behavior changed. The result: the original problem persisted and worsened.',
      whyIncorrectA: 'Disciplinary action is not the recommended first-line CAP component. CMS guidelines emphasize re-education, process improvement, and system fixes over punitive measures.',
      whyIncorrectC: 'The distribution method of the tip sheet is a trivial concern compared to the fundamental absence of root cause analysis, specific actions, and verification through re-audit.',
      whyIncorrectD: 'While sampling differences may produce slightly different results, a 38% deficiency rate represents a persistent systemic problem regardless of methodology. The MAC sampling methodology is rigorous and valid.',
      whatDocumentationShouldShow: 'An effective CAP documents: root cause analysis with specific findings, targeted corrective actions with responsible parties and deadlines, structured re-education program with competency verification, re-audit schedule with target metrics, and escalation plan if re-audit shows continued non-compliance.',
      auditorConclusion: 'A MAC auditor finding the same deficiency rate post-CAP would conclude that the agency\'s compliance program is ineffective. This finding would likely increase the scope of the audit and may trigger referral to the ZPIC.',
      clinicalRisk: 'Persistent failure to document skilled medication assessment means either: (1) skilled assessment is occurring but not documented, or (2) skilled assessment is not occurring. Both scenarios represent unacceptable patient safety risks.',
      complianceRisk: 'An agency that conducts a CAP but fails to achieve measurable improvement demonstrates a compliance program that exists on paper but does not function in practice. This undermines the agency\'s credibility in any future enforcement action.',
    },
  },
]

export const caseScenarios: QuizItem[] = [
  {
    id: 'CS-01',
    moduleId: 'mod-8',
    difficulty: 'expert',
    stem: 'A home health RN documents the following wound care visit note: "Visited patient at home. Assessed wound to right lower extremity. Wound stable — no change from last visit. Applied Medihoney and covered with gauze and tape. Educated caregiver on signs of infection. Left patient resting comfortably. Will follow up per POC." The patient\'s record shows this is the 8th wound care visit in the episode. The admission wound assessment documented a "Stage III pressure injury, right lateral malleolus, 3.5 x 2.8 x 1.2 cm, 60% granulation, moderate serosanguineous drainage." The previous 7 visit notes all state "wound stable — no change from last visit" with no measurements, no wound bed descriptions, and no drainage characteristics. An auditor reviewing the complete episode would most likely conclude:',
    options: [
      { id: 'A', text: 'The documentation is acceptable because the initial admission assessment established the baseline wound characteristics and subsequent notes confirm stability, demonstrating consistent monitoring' },
      { id: 'B', text: 'The auditor would deny only the most recent visit because it lacks the specific teaching content provided to the caregiver about signs of infection' },
      { id: 'C', text: 'The auditor would deny all 7 subsequent wound care visits because identical "no change" notes without objective reassessment data constitute copy-forward documentation that fails to demonstrate that individualized skilled wound assessment occurred at each visit, and "no change from last visit" without supporting measurements is clinically implausible over 8 visits' },
      { id: 'D', text: 'The documentation is adequate but the frequency of 8 wound care visits should be reduced to 4 visits because "no change" suggests the wound has stabilized and no longer requires skilled care every visit' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'Seven consecutive wound care notes stating "wound stable — no change from last visit" without any objective wound reassessment data is the hallmark of copy-forward cloned documentation. CMS requires that each wound care visit include a complete wound reassessment with measurements, wound bed description, drainage characteristics, and periwound assessment. Furthermore, "no change" across 8 visits covering weeks of care is clinically implausible — wounds either improve, deteriorate, or show subtle changes in granulation, drainage, or periwound condition. The pattern suggests the nurse either did not perform individualized wound assessment or failed to document it.',
      whyIncorrectA: 'A baseline assessment does not eliminate the requirement for ongoing reassessment at each skilled visit. Each visit must independently document current wound status to demonstrate that skilled assessment was performed and to track wound trajectory.',
      whyIncorrectB: 'Denying only the most recent visit vastly underestimates the scope of the deficiency. The systemic pattern of absent wound reassessment across all visits creates extrapolation risk for the entire episode.',
      whyIncorrectD: 'While frequency is a valid audit concern, the primary failure is documentation quality, not frequency. Even if frequency were appropriate, the documentation still fails to support any of the visits.',
      whatDocumentationShouldShow: 'Each wound care visit should include: current wound measurements (L x W x D) with comparison to prior visit, wound bed description (% granulation, slough, necrotic tissue), drainage type and amount, periwound condition, pain assessment, treatment provided with rationale for any changes, and overall wound trajectory assessment.',
      auditorConclusion: 'The auditor would conclude that the documentation fails to support medical necessity for skilled wound care. The pattern of identical notes suggests either cloned documentation or failure to perform individualized assessment. Denial of all visits with identical documentation is the likely outcome.',
      clinicalRisk: 'A Stage III pressure injury that remains truly unchanged over 8 visits would itself be a clinical concern requiring intervention modification. The lack of documented wound trajectory data prevents identification of non-healing patterns that should trigger treatment plan changes.',
      complianceRisk: 'Copy-forward wound documentation is a known OIG audit target. Extrapolation of denial across all patients seen by the same nurse, or all wound care visits in the agency, is a serious financial risk.',
    },
  },
  {
    id: 'CS-02',
    moduleId: 'mod-8',
    difficulty: 'expert',
    stem: 'A home health agency receives an Additional Documentation Request (ADR) from the MAC for a 60-day home health episode. The patient was admitted for management of newly diagnosed Type 2 diabetes with insulin initiation, CHF management, and wound care. The agency submits: (1) a completed OASIS assessment, (2) a signed physician plan of care (485), (3) all 24 visit notes from the episode, and (4) PT and OT evaluation reports. Upon review, the MAC auditor identifies that the 485 lists "insulin administration and teaching" as a skilled nursing intervention, but the visit notes document insulin teaching on only 3 of the 18 SN visits. The remaining 15 SN visit notes document vital signs, brief physical assessment, and "medications reviewed." The auditor also notes that the 485 frequency of SN 3x/week for 4 weeks, then 2x/week for 4 weeks, is not supported by documentation showing why the higher frequency was needed initially or why reduction was clinically appropriate. Which audit outcome is MOST likely?',
    options: [
      { id: 'A', text: 'The auditor will approve all visits because the 485 establishes the medical necessity for the frequency and the skilled interventions, and the agency submitted all requested documentation' },
      { id: 'B', text: 'The auditor will deny only the 15 visits where insulin teaching was not documented, accepting the 3 visits where it was documented plus all PT/OT visits' },
      { id: 'C', text: 'The auditor will deny the entire episode because the visit notes fail to support the plan of care frequency and the documented skilled interventions — visit notes that show only VS and "medications reviewed" do not demonstrate skilled need, the frequency reduction lacks clinical justification, and the gap between the 485 interventions and actual visit documentation suggests the plan of care does not reflect the care actually provided' },
      { id: 'D', text: 'The auditor will issue an advisory notice recommending improved documentation but approve the claims because the patient clearly had complex clinical needs based on the diagnosis list' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'This scenario illustrates the critical disconnect between the plan of care and the visit documentation. The 485 describes skilled interventions (insulin teaching, CHF management, wound care). But 15 of 18 SN visit notes document only VS and "medications reviewed" — which does not demonstrate any of the skilled interventions listed in the plan of care. The auditor identifies: (1) the care documented does not match the care planned, (2) visit note content does not support skilled need, (3) frequency is not justified by documented clinical conditions visit-to-visit, and (4) the frequency reduction has no clinical rationale documented. The entire episode is at risk because the documentation as a whole fails to tell a coherent clinical story.',
      whyIncorrectA: 'The existence of a 485 does not automatically establish medical necessity. The visit notes must independently support each visit as medically necessary and skilled. A plan that says "insulin teaching" means nothing if only 3 of 18 notes actually document insulin teaching.',
      whyIncorrectB: 'Partial denial is possible but the scope of the documentation failure — 15 of 18 SN notes failing to demonstrate skilled need — combined with unsupported frequency creates a systemic documentation failure that jeopardizes the entire episode.',
      whyIncorrectD: 'Auditors do not issue advisory notices for documentation that fails to support billed services. Complex diagnoses alone do not justify payment — the documentation must demonstrate that skilled, medically necessary care was provided.',
      whatDocumentationShouldShow: 'Each visit note should document the specific skilled intervention performed, why it was necessary at that visit, patient-specific findings that justify the current visit frequency, and clinical reasoning for frequency changes when they occur.',
      auditorConclusion: '"Documentation submitted does not support the medical necessity of the services billed. Visit notes do not demonstrate skilled nursing interventions consistent with the plan of care. Frequency of visits is not supported by clinical documentation." Full episode denial with demand for refund.',
      clinicalRisk: 'If skilled interventions (insulin teaching, CHF management) are listed on the 485 but not documented in visit notes, either the care is not being provided as planned or the documentation does not reflect the care delivered. Both are serious clinical concerns.',
      complianceRisk: 'Episode denial for a documentation failure of this scope creates precedent for expanded review of the agency\'s other claims. MAC may initiate 100% prepayment review for the agency.',
    },
  },
  {
    id: 'CS-03',
    moduleId: 'mod-8',
    difficulty: 'expert',
    stem: 'An experienced home health RN conducts a medication management visit for a patient taking Warfarin, Metoprolol, Lisinopril, Metformin, and Gabapentin. The visit note reads: "Performed medication reconciliation. All medications match pharmacy profile. Patient taking all meds as prescribed. INR 2.3 — within therapeutic range. Patient denies side effects. Continue current medication regimen. No changes needed at this time." The nurse considers this a strong visit note because it includes the INR value, confirms adherence, and verifies pharmacy records. From an audit perspective, which critical documentation elements are MISSING that would cause this note to fail under skilled need review?',
    options: [
      { id: 'A', text: 'The note is complete and demonstrates skilled medication management. INR is documented, adherence is confirmed, and pharmacy reconciliation was performed' },
      { id: 'B', text: 'The note lacks the name of the pharmacy and the date of the most recent prescription fills for each medication' },
      { id: 'C', text: 'The note documents reconciliation outcomes but fails to demonstrate: what specific skilled assessment was performed beyond checking a list, patient understanding of each high-risk medication\'s purpose and side effects, clinical assessment of therapeutic response beyond INR, whether high-risk drug interactions were evaluated, clinical reasoning for why skilled nursing was required for this visit rather than routine pharmacy refill management, and specific patient education content with demonstrated comprehension' },
      { id: 'D', text: 'The note should have included the physician\'s direct verbal confirmation that the medication regimen should continue unchanged' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'This note exemplifies a common pattern in home health medication management documentation — it documents the outcome of reconciliation ("all match") without demonstrating the skilled process. An auditor reviewing this note cannot determine: (1) what specific assessment the nurse performed beyond comparing two lists, (2) whether the patient actually understands their high-risk medications (Warfarin, Metformin), (3) whether the nurse assessed for signs of drug interactions or adverse effects beyond asking a yes/no question, (4) what clinical expertise was applied that a non-skilled person could not replicate, or (5) why skilled nursing was needed if the result was simply "everything is fine, no changes." The note fails the skilled need test.',
      whyIncorrectA: 'While the note contains data points (INR value, adherence statement, reconciliation confirmation), it lacks the clinical reasoning and assessment process documentation that distinguishes skilled nursing from task-level medication checking.',
      whyIncorrectB: 'Pharmacy name and fill dates, while potentially useful, are not the critical missing elements. The fundamental failure is the absence of demonstrated skilled assessment and clinical reasoning.',
      whyIncorrectD: 'Physician confirmation is not required for continuing an existing medication regimen. The documentation failure is in demonstrating what the nurse did and why it required skilled nursing judgment.',
      whatDocumentationShouldShow: 'Demonstrated skilled assessment of: Warfarin management (INR trend, dietary compliance, bleeding signs assessment), Metformin monitoring (GI side effects, renal function awareness), Metoprolol assessment (heart rate, orthostatic vitals), drug interaction evaluation, patient comprehension of each medication\'s purpose and danger signs, and clinical justification for continued skilled nursing involvement vs. patient self-management.',
      auditorConclusion: 'The auditor would conclude that the documentation describes a task (comparing medication lists) rather than a skilled service. The lack of demonstrated clinical judgment, patient assessment, and education content means the service cannot be distinguished from what a pharmacy or family member could do.',
      clinicalRisk: 'A patient on Warfarin, Metformin, and multiple cardiovascular medications has genuine clinical complexity. But if the skilled assessment is not documented, the clinical value of the visit cannot be verified — and potential medication issues may be overlooked.',
      complianceRisk: 'Medication management is a high-volume home health service. If all medication management visits are documented like this one, the agency faces significant financial exposure through bulk denial.',
    },
  },
  {
    id: 'CS-04',
    moduleId: 'mod-8',
    difficulty: 'expert',
    stem: 'A home health agency conducts an internal audit and discovers a troubling pattern in one clinician\'s documentation. The nurse\'s visit notes consistently include detailed, well-written assessments with thorough clinical findings. However, when cross-referencing with the agency\'s GPS-based Electronic Visit Verification (EVV) system, the audit reveals that 60% of the nurse\'s visits show EVV check-in times of 8-12 minutes while the corresponding visit notes document 30-45 minute comprehensive assessments. The nurse explains that she "documents from memory in the car after the visit because it\'s easier to think without distractions." The compliance officer must determine the appropriate response. Which of the following represents the MOST accurate regulatory analysis of this situation?',
    options: [
      { id: 'A', text: 'The documentation is acceptable because the clinical content is thorough and the short EVV times may reflect the nurse\'s efficiency in performing assessments quickly' },
      { id: 'B', text: 'The only issue is the documentation method — the agency should require the nurse to document inside the patient\'s home and this will resolve the compliance concern' },
      { id: 'C', text: 'This pattern raises serious program integrity concerns: EVV data suggesting 8-12 minute visits paired with notes documenting 30-45 minute comprehensive assessments creates a presumption that either the services were not provided as documented, the assessments were not as thorough as described, or documentation was reconstructed from memory rather than contemporaneous clinical observation — any of these scenarios constitutes a documentation integrity failure and potential false claims exposure' },
      { id: 'D', text: 'EVV is only an administrative tracking tool and cannot be used to evaluate clinical documentation. The nurse\'s thorough notes should be accepted at face value regardless of the EVV timestamps' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'The discrepancy between EVV timestamps and documented visit content creates a serious documentation integrity concern. When the objective EVV data (8-12 minutes) contradicts the documented service content (30-45 minute comprehensive assessments), auditors will question the veracity of the documentation. A 30-45 minute comprehensive assessment that includes the detail described cannot plausibly occur in 8-12 minutes. Furthermore, documentation constructed "from memory in the car" is not contemporaneous and may not accurately reflect what was actually assessed and provided — introducing unreliability into the medical record. This pattern could support findings of false documentation or false claims.',
      whyIncorrectA: 'While clinical efficiency varies, a 4-5x discrepancy between EVV time and documented assessment scope is not explainable by efficiency. An 8-minute visit cannot produce a legitimate 45-minute comprehensive assessment.',
      whyIncorrectB: 'Requiring in-home documentation is an appropriate process improvement, but it does not address the historical documentation integrity concerns or the potential false claims liability for visits already billed.',
      whyIncorrectD: 'EVV data is specifically designed as a verification tool. CMS and state Medicaid agencies use EVV data alongside clinical documentation in fraud investigations. Dismissing EVV discrepancies is legally untenable.',
      whatDocumentationShouldShow: 'Visit documentation should be contemporaneous (created during or immediately after the visit while details are fresh). Visit duration should be reasonably consistent with documented scope of services. Any discrepancy between EVV data and documented visit content should trigger immediate investigation.',
      auditorConclusion: 'A pattern of EVV discrepancies would trigger a fraud investigation referral to the ZPIC or state MFCU. The presumption would be either: (1) services were not provided as documented, or (2) documentation was fabricated. Either conclusion carries severe penalties.',
      clinicalRisk: 'Documentation not based on contemporaneous observation may contain inaccuracies that affect subsequent clinical decision-making. Memory-based documentation is inherently less reliable than real-time documentation.',
      complianceRisk: 'This pattern meets the criteria for potential fraud referral. If substantiated, it could result in False Claims Act liability, OIG exclusion, and criminal prosecution — affecting the nurse, the supervising clinician, and the agency.',
    },
  },
  {
    id: 'CS-05',
    moduleId: 'mod-8',
    difficulty: 'expert',
    stem: 'A home health RN performs a start-of-care assessment for a patient discharged from the hospital following a COPD exacerbation. The nurse documents homebound status as: "Patient is homebound due to COPD." The physician plan of care lists: "SN 3W4 then 2W4 for disease management, medication teaching, and assessment." Three weeks into the episode, the patient\'s daughter posts publicly viewable social media photos showing the patient at a family birthday dinner at a restaurant and at a church service. During a subsequent MAC audit, the reviewer has access to these photos. The agency\'s clinical supervisor was aware from visit notes that the patient had mentioned a "family dinner" but did not investigate further or update the homebound documentation. From a documentation integrity and compliance perspective, which of the following BEST captures the full scope of the problem?',
    options: [
      { id: 'A', text: 'Social media photos are not admissible in Medicare audits and the auditor must rely solely on the clinical documentation, which establishes homebound status' },
      { id: 'B', text: 'The patient\'s homebound status was properly established at SOC and occasional outings to a restaurant and church do not automatically disqualify homebound status, so there is no compliance issue' },
      { id: 'C', text: 'Multiple documentation integrity failures converge: (1) the homebound documentation is insufficient — "homebound due to COPD" lacks the specific functional limitations, effort required, and taxing nature documentation required by Medicare; (2) the visit notes that mention the patient\'s outings should have triggered a reassessment and update of the homebound justification to address community mobility; (3) the supervisor\'s failure to investigate when visit notes mentioned community outings represents a supervisory oversight failure; (4) regardless of the social media photos, the underlying homebound documentation would fail audit review on its own insufficiency' },
      { id: 'D', text: 'The only issue is the supervisor failure — the original homebound documentation is adequate and the patient\'s occasional outings are permitted under Medicare homebound criteria' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'This scenario involves layered failures. First, "patient is homebound due to COPD" is grossly insufficient homebound documentation. Medicare requires documentation of: the specific condition(s) restricting the patient, the patient\'s functional limitations, why leaving home requires considerable and taxing effort, the nature of that effort, and whether absences are infrequent/short duration/to receive medical treatment. Second, CMS allows infrequent, short-duration absences — but only when the homebound justification documentation is robust and current. When visit notes mentioned community outings, the clinician and supervisor had an obligation to reassess and re-document the homebound justification explaining how the patient can occasionally leave but is still considered homebound. Third, the supervisor awareness without action is a quality oversight failure. The social media photos compound the problem but the documentation would fail independently.',
      whyIncorrectA: 'Medicare auditors can and do use publicly available information, including social media, to investigate potential fraud and abuse. There is no prohibition against considering publicly available evidence.',
      whyIncorrectB: 'While occasional outings are permitted, the underlying homebound documentation lacks the specificity required. And the outings create a duty to reassess and re-document homebound status — which was not done.',
      whyIncorrectD: 'The original homebound documentation ("homebound due to COPD") would fail audit review regardless of outings. It lacks the functional detail, taxing effort description, and specificity required.',
      whatDocumentationShouldShow: 'Homebound documentation should specify: "Patient homebound due to severe COPD with chronic hypoxia. Requires continuous O2 at 3L/min via NC. Ambulation limited to 30 feet before SOB requires rest. Leaving home requires considerable effort including use of portable O2, wheelchair for distances >50 feet, and assistance from adult child for transfers into vehicle. Patient attends pulmonology appointments monthly (medical treatment exception). Any non-medical outings are infrequent and of short duration with family assistance required throughout."',
      auditorConclusion: 'The auditor would deny the entire episode based on insufficient homebound documentation. The social media evidence would compound the finding, but the documentation failure is independently sufficient for denial.',
      clinicalRisk: 'Inadequate homebound documentation creates vulnerability for the patient — if services are denied retrospectively, the patient may face unexpected financial liability.',
      complianceRisk: 'Homebound status is a condition of coverage for home health. Insufficient homebound documentation jeopardizes every claim in the episode. Pattern findings across other patients seen by the same clinician would trigger expanded review.',
    },
  },
  {
    id: 'CS-06',
    moduleId: 'mod-8',
    difficulty: 'expert',
    stem: 'Review the following three sequential visit notes for a home health patient being treated for a sacral wound:\n\nVisit 1 (Monday): "Sacral wound Stage II, 3.0 x 2.5 x 0.1 cm. Wound bed 100% granulation, no drainage. Periwound intact. DSD applied. Patient reports no pain. Wound improving."\n\nVisit 2 (Wednesday): "Sacral wound assessed. Stage III, 4.2 x 3.8 x 1.5 cm with moderate purulent drainage. Tunneling noted at 6 o\'clock x 2 cm. Wound bed 40% slough, 30% necrotic tissue. Periwound erythema with warmth and induration extending 3 cm. Patient reports pain 7/10. Temperature 101.2°F. Wound deteriorating significantly. Cleansed with NS, packed with Iodosorb, covered with bordered foam. MD notified."\n\nVisit 3 (Friday): "Sacral wound stable — no change from last visit. Dressing changed per protocol. Patient tolerated well. Will continue current plan."\n\nAn auditor reviewing these three notes would identify which critical documentation failure?',
    options: [
      { id: 'A', text: 'The Visit 1 documentation lacks drainage characteristics and should have noted "no drainage observed" explicitly' },
      { id: 'B', text: 'Visit 2 should have included a referral to a wound care specialist given the rapid deterioration' },
      { id: 'C', text: 'Visit 3 is clinically implausible and demonstrates either copy-forward negligence or failure to perform wound assessment — a wound that progressed from Stage II to Stage III with infection indicators (purulent drainage, tunneling, necrotic tissue, fever) between Monday and Wednesday cannot be "stable — no change from last visit" on Friday. The note also lacks wound measurements, wound bed description, response-to-treatment assessment, and complete MD communication documentation' },
      { id: 'D', text: 'The primary issue is that Visit 2 documents a stage advancement from II to III, which is not possible under CMS wound staging rules — pressure injuries cannot be re-staged upward' },
    ],
    correctOptionId: 'C',
    rationale: {
      whyCorrect: 'Visit 3 is a clinical impossibility juxtaposed against Visit 2. A wound that showed dramatic deterioration (doubling in size, developing tunneling, purulent drainage, necrotic tissue, and fever) on Wednesday cannot be described as "stable — no change from last visit" on Friday without any wound assessment data. This note is either: (1) a copy-forward error from an earlier note, (2) documentation written without actually performing wound assessment, or (3) a deliberate misrepresentation. The lack of measurements, wound bed description, response to the Iodosorb treatment initiated on Wednesday, updated temperature, and complete MD communication documentation makes Visit 3 indefensible.',
      whyIncorrectA: 'While Visit 1 could have been more explicit about drainage, "no drainage" is reasonably implied. This is a minor documentation preference, not the critical failure in the sequence.',
      whyIncorrectB: 'A wound care specialist referral may have been clinically appropriate, but the critical documentation failure identified by the auditor would be the Visit 3 implausibility, not the absence of a referral on Visit 2.',
      whyIncorrectD: 'This is a sophisticated distractor. While CMS rules about reverse staging of pressure injuries exist, this scenario involves a wound that worsened — potentially indicating a misclassification at Visit 1 or true deterioration. The primary audit finding would still be the Visit 3 documentation failure.',
      whatDocumentationShouldShow: 'Visit 3 should document: complete wound reassessment with current measurements compared to Visit 2, wound bed status, drainage assessment, temperature assessment, response to Iodosorb treatment, pain reassessment, laboratory results if obtained, complete MD communication (who, when, what was discussed, orders received), and updated treatment plan.',
      auditorConclusion: 'Visit 3 would be denied immediately. The auditor would also flag the entire wound care episode for investigation, as the pattern suggests either clinical negligence (not assessing the wound) or documentation fabrication.',
      clinicalRisk: 'A patient with fever, purulent wound drainage, and rapidly expanding wound dimensions may have developing sepsis. Visit 3\'s failure to document appropriate wound assessment creates a patient safety catastrophe.',
      complianceRisk: 'The auditor would flag this sequence for potential fraud investigation due to the clinical implausibility of the Visit 3 note. The pattern suggests systemic documentation integrity concerns.',
    },
  },
]

export const finalAssessment: QuizItem[] = [
  ...knowledgeCheckQuiz,
  ...caseScenarios,
  {
    id: 'FA-01',
    moduleId: 'mod-final',
    difficulty: 'expert',
    stem: 'A home health agency\'s Director of Clinical Services discovers that a clinician has been using a personal shorthand system in visit notes: "WNL-SC" (within normal limits — same as chart), "NAD-CT" (no acute distress — continue treatment), "VSS-NI" (vital signs stable — no intervention). The clinician argues these abbreviations are efficient and the agency has never had a policy against personal shorthand. When queried by the compliance officer, the clinician states "anyone who has been in home health long enough knows what these mean." Which of the following MOST accurately describes the regulatory and compliance implications of this documentation practice?',
    options: [
      { id: 'A', text: 'The documentation is acceptable if the agency creates a formal abbreviation legend and attaches it to each patient\'s chart' },
      { id: 'B', text: 'Personal shorthand that is not universally recognized violates the fundamental documentation principle that records must be legible and understandable to anyone who reviews them — an auditor, a covering clinician, a physician reviewing the plan of care, or a jury. "WNL-SC" communicates literally nothing about the patient\'s clinical status and "same as chart" references unknown prior documentation without any current assessment. These notes would fail both clinical and audit review as they do not demonstrate that individualized assessment actually occurred' },
      { id: 'C', text: 'The shorthand is acceptable because CMS has not published an official list of prohibited abbreviations for home health documentation' },
      { id: 'D', text: 'The issue is only a policy gap — the agency should create a personal abbreviation policy and the clinician\'s existing notes do not need correction' },
    ],
    correctOptionId: 'B',
    rationale: {
      whyCorrect: 'Medical documentation must be legible, understandable, and sufficient to support the services billed. Personal shorthand that requires the reader to know the specific clinician\'s coding system violates these requirements. More critically, "same as chart" and "continue treatment" are not clinical assessments — they are references to prior notes that may themselves be inadequate. An auditor, covering clinician, or physician cannot determine the patient\'s current clinical status from these notes. The fundamental issue is not the abbreviation style but the complete absence of individualized clinical assessment documentation.',
      whyIncorrectA: 'An abbreviation legend would partially address legibility but would not address the substantive failure — "WNL-SC" still means "I didn\'t document my assessment." Even decoded, these abbreviations communicate outcome conclusions without supporting assessment evidence.',
      whyIncorrectC: 'CMS does not need to publish a prohibited abbreviation list. The requirement is that documentation be clear, specific, and sufficient to support care and billing. Personal shorthand fails this requirement regardless of whether it appears on an explicit prohibition list.',
      whyIncorrectD: 'The issue extends far beyond policy. Existing notes documented in personal shorthand may not support the services billed and may create overpayment liability for the agency.',
      whatDocumentationShouldShow: 'Individualized clinical assessment for each visit using standard medical terminology. Each note must demonstrate what was assessed, what was found, and what clinical decisions were made — not reference prior notes as a substitute for current assessment.',
      auditorConclusion: 'The auditor would deny all visits documented with personal shorthand as "insufficient documentation to support the services billed." The notes fail to demonstrate that individualized skilled assessment occurred at each visit.',
      clinicalRisk: 'Documentation that says "same as chart" provides zero clinical information to any other provider. In a clinical emergency, another clinician cannot determine the patient\'s baseline or recent clinical trajectory from these notes.',
      complianceRisk: 'Claims based on visit notes that contain only personal shorthand abbreviations are indefensible. The agency faces recoupment liability for all visits documented in this manner.',
    },
  },
]
