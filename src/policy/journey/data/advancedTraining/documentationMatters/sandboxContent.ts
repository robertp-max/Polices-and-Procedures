/**
 * Sandbox / Documentation Practice Lab — 10 expert-difficulty scenarios.
 *
 * Each scenario presents a realistic clinical note excerpt with plausible
 * distractors. Every wrong answer is intentionally strong — designed to
 * challenge experienced field clinicians, QA nurses, and supervisors.
 */

export interface SandboxScenario {
  id: string
  title: string
  difficulty: 'Advanced' | 'Expert'
  context: string
  noteExcerpt: string
  question: string
  options: { id: string; text: string }[]
  correctOptionId: string
  rationale: {
    whyCorrect: string
    whyOthersWrong: string
    whatDocumentationShouldShow: string
    auditorConclusion: string
  }
}

export const sandboxScenarios: SandboxScenario[] = [
  {
    id: 'SB-01',
    title: 'Vague Skilled Need',
    difficulty: 'Expert',
    context:
      'A skilled nurse visits a 78-year-old patient with CHF and COPD. The patient is on a complex medication regimen and was recently discharged from the hospital. The visit note documents the following:',
    noteExcerpt:
      '"Visited patient at home. VS obtained: BP 138/82, HR 78, O2 sat 95% on 2L NC. Patient reports feeling "okay." Lung sounds diminished bilateral bases. Edema 1+ bilateral LE. Reviewed medications with patient. Patient taking meds as prescribed. Reinforced importance of daily weights and low-sodium diet. Will continue to monitor. Next visit per POC."',
    question: 'What is the PRIMARY documentation deficiency in this visit note?',
    options: [
      { id: 'a', text: 'The vital signs are incomplete — respiratory rate and temperature are missing.' },
      { id: 'b', text: 'The note fails to document what specific skilled nursing intervention was provided beyond monitoring.' },
      { id: 'c', text: 'The lung assessment lacks specificity — "diminished bilateral bases" needs to specify crackles, wheezes, or rhonchi.' },
      { id: 'd', text: 'The homebound status is not documented anywhere in the note.' },
    ],
    correctOptionId: 'b',
    rationale: {
      whyCorrect:
        'The note describes vital signs, a brief assessment, and general education ("reinforced importance of daily weights and low-sodium diet") — but does not document a specific skilled nursing intervention. "Reviewed medications" and "will continue to monitor" do not establish skilled need. An auditor would ask: what did the nurse DO that requires a licensed professional? Medication reconciliation, disease management teaching with patient comprehension assessment, or skilled assessment with clinical judgment documented — none of these are present.',
      whyOthersWrong:
        'Option A is a real deficiency but not the PRIMARY one — billing is not denied for missing respiratory rate. Option C is valid clinical feedback but secondary to the fundamental absence of a skilled service. Option D is also a deficiency, but without a documented skilled service, the homebound issue becomes moot — there is no billable visit to justify.',
      whatDocumentationShouldShow:
        'The note should document: (1) the specific skilled assessment performed with clinical judgment applied ("Assessed for signs of CHF exacerbation: weight 172 lbs, up 3 lbs from last visit; 1+ pitting edema bilateral LE; diminished breath sounds bilateral bases without adventitious sounds; no JVD"), (2) the specific teaching provided ("Educated patient on recognizing early signs of fluid overload — weight gain >2 lbs/day, increased SOB, new or worsening edema — and when to call MD"), (3) patient comprehension ("Patient verbalized understanding, able to state 3 warning signs"), (4) clinical decision-making ("Will continue current frequency to monitor fluid status; discussed with MD potential need for diuretic adjustment").',
      auditorConclusion:
        'An auditor would likely deny this visit for insufficient documentation of skilled need. The note reads as monitoring and general reinforcement — services that could be performed by a home health aide with a care plan.',
    },
  },
  {
    id: 'SB-02',
    title: 'Weak Medical Necessity',
    difficulty: 'Expert',
    context:
      'A physical therapist visits a 72-year-old patient 6 weeks post total knee replacement. The patient has been receiving home health PT since discharge. The latest visit note reads:',
    noteExcerpt:
      '"Patient greeted at door, ambulating with single-point cane independently. Reports pain 2/10 at surgical site. ROM R knee: flexion 118°, extension -2°. Performed therapeutic exercises including quad sets (3x10), SLR (3x10), heel slides (3x10). Gait training on level surfaces — patient demonstrates normal gait pattern with cane. Patient performing HEP independently and correctly. Discussed continued importance of exercise. Goals: increase ROM, improve strength. Next visit per POC."',
    question: 'What is the PRIMARY documentation deficiency that would trigger a denial?',
    options: [
      { id: 'a', text: 'The note fails to establish why continued skilled PT is medically necessary given the patient\'s current functional status.' },
      { id: 'b', text: 'The ROM measurements should include comparison to prior visits to demonstrate progress.' },
      { id: 'c', text: 'Pain assessment should include a validated pain scale, not just a numeric rating.' },
      { id: 'd', text: 'Therapeutic exercises documented are too basic — should describe progressive resistance or advanced techniques.' },
    ],
    correctOptionId: 'a',
    rationale: {
      whyCorrect:
        'The note documents a patient who is ambulating independently, performing HEP independently and correctly, has 118° flexion (functional range), minimal pain, and normal gait pattern. Nothing in this note establishes why a licensed physical therapist needs to continue visiting. The patient appears to have met or nearly met functional goals. Without documented justification for why continued skilled PT is needed — such as plateau prevention, new functional deficits, safety concerns with stair negotiation, or remaining deficits that require skilled intervention to address — this visit fails medical necessity.',
      whyOthersWrong:
        'Option B is good clinical practice but not the primary denial trigger — comparative data strengthens but does not create medical necessity. Option C is a documentation quality issue — numeric rating is widely accepted. Option D confuses exercise complexity with medical necessity — the exercises could be advanced and the visit would still fail if the patient does not need skilled care.',
      whatDocumentationShouldShow:
        'If continued PT is warranted, the note must document: what functional limitations remain that require skilled intervention ("Patient unable to navigate 4 front porch steps safely — demonstrates compensatory pattern with R LE, placing L foot first on each step"), what skilled techniques the therapist is using that cannot be self-directed ("Initiated eccentric step-down exercises with manual cueing for proper knee tracking"), and why discharge is not appropriate yet ("Patient requires 2-3 additional visits to achieve safe, independent stair negotiation before PT discharge").',
      auditorConclusion:
        'An auditor would conclude that this patient has achieved functional independence and no longer requires skilled PT. The note effectively documents that the patient is doing well — which argues against continued services.',
    },
  },
  {
    id: 'SB-03',
    title: 'Poor Wound Documentation',
    difficulty: 'Advanced',
    context:
      'A wound care nurse visits a patient with a Stage 3 pressure injury on the sacrum. The patient has been receiving wound care 3x/week for 4 weeks. The visit note reads:',
    noteExcerpt:
      '"Wound care visit. Sacral wound assessed. Wound appears to be healing. Some granulation tissue present. Wound bed is red. No signs of infection noted. Old dressing removed, wound cleansed with NS, new foam dressing applied per POC. Patient tolerated procedure well. Will continue current wound care regimen. Next visit Monday."',
    question: 'What is the most critical documentation deficiency in this wound care note?',
    options: [
      { id: 'a', text: 'No wound measurements are documented — size, depth, undermining, or tunneling.' },
      { id: 'b', text: 'The phrase "patient tolerated procedure well" is vague and should detail the patient\'s pain response.' },
      { id: 'c', text: '"No signs of infection" should specify what was assessed (erythema, warmth, odor, drainage character).' },
      { id: 'd', text: 'The note does not document the specific wound cleansing technique or the type of foam dressing used.' },
    ],
    correctOptionId: 'a',
    rationale: {
      whyCorrect:
        'A wound care visit note without wound measurements is fundamentally deficient. CMS requires measurable data to determine whether the wound is improving, stable, or declining — which directly impacts medical necessity for continued wound care visits. Without measurements (length x width x depth, percentage of wound bed with granulation vs. slough vs. necrotic tissue, presence/absence of undermining/tunneling, periwound condition), there is no objective basis for continued treatment planning, and no way for an auditor to verify progress over time.',
      whyOthersWrong:
        'Options B, C, and D are all legitimate documentation quality issues. But without measurements, the entire wound care episode is unsupported. "Wound appears to be healing" and "some granulation tissue" are subjective assessments that could describe any wound — they provide no data points for comparison.',
      whatDocumentationShouldShow:
        '"Sacral pressure injury assessed: 4.2 cm x 3.1 cm x 0.8 cm depth. Wound bed 60% granulation tissue (red, beefy), 30% yellow fibrinous slough, 10% epithelialization at wound margins. No undermining or tunneling. Periwound skin intact, no erythema, warmth, or induration. Scant serous drainage, no odor. Previous visit measurements: 4.5 x 3.3 x 1.0 cm — wound reducing in all dimensions. Pain: 4/10 during dressing change, managed with repositioning."',
      auditorConclusion:
        'Without wound measurements on a wound care visit note, an auditor cannot verify medical necessity for the service or determine whether the treatment plan is effective. This note would not survive ADR review.',
    },
  },
  {
    id: 'SB-04',
    title: 'Weak Medication Teaching Note',
    difficulty: 'Expert',
    context:
      'A skilled nurse visits a newly diagnosed Type 2 diabetic patient for medication teaching. The patient was started on metformin and insulin glargine 3 days ago. The visit note reads:',
    noteExcerpt:
      '"Visited patient for medication teaching. Reviewed all medications with patient. Educated on metformin — take with food, may cause GI upset. Educated on insulin glargine — inject subcutaneously once daily, rotate injection sites. Patient demonstrated insulin injection technique. Reviewed signs of hypo/hyperglycemia. Blood glucose today: 186 mg/dL fasting. Patient states understanding of all teaching. Will continue medication education next visit."',
    question: 'What is the PRIMARY documentation deficiency?',
    options: [
      { id: 'a', text: 'The blood glucose reading should include the time of last meal and the target range for this patient.' },
      { id: 'b', text: 'The note does not document the patient\'s specific comprehension level or ability to perform self-care tasks independently.' },
      { id: 'c', text: 'The teaching content is too general — it does not reflect this specific patient\'s medication regimen, doses, or timing.' },
      { id: 'd', text: 'The injection technique demonstration should describe what was evaluated (site selection, angle, aspiration, disposal).' },
    ],
    correctOptionId: 'b',
    rationale: {
      whyCorrect:
        '"Patient states understanding of all teaching" is one of the most audited phrases in home health documentation. It is a subjective, unverifiable clinician assertion. CMS expects skilled teaching documentation to include: what was taught (specific content), how comprehension was assessed (teach-back, return demonstration, verbalization of key concepts), and the patient\'s ACTUAL response — not just a blanket claim of understanding. Did the patient correctly draw up insulin? Could they state 3 signs of hypoglycemia? Did they demonstrate proper site rotation? The note contains none of this.',
      whyOthersWrong:
        'Option A is a clinical quality issue but not the primary deficiency. Option C is partially valid — the teaching content is generic — but the fundamental failure is the absence of assessed comprehension. You could document perfectly specific teaching content and still fail if you don\'t demonstrate the patient\'s learning. Option D describes a component of comprehension assessment but is narrower than the core issue.',
      whatDocumentationShouldShow:
        '"Instructed patient on insulin glargine (Lantus) 10 units SQ daily at bedtime: purpose of basal insulin, injection technique, site rotation (abdomen, thigh). Patient performed return demonstration of insulin injection: correctly identified dose on pen, selected appropriate site (L lateral thigh), cleaned area, injected at 90° angle, held for 10 seconds. Patient able to verbalize 3 signs of hypoglycemia (shakiness, sweating, confusion) and correct response (15g fast-acting carb, recheck in 15 min). Unable to verbalize when to call MD — will reinforce next visit. Teaching effectiveness: 75% — requires continued skilled teaching for safe self-management."',
      auditorConclusion:
        'An auditor would question whether skilled teaching actually occurred or whether the nurse simply reviewed printed materials. "Patient states understanding" without documented evidence of comprehension assessment does not support the skilled service billed.',
    },
  },
  {
    id: 'SB-05',
    title: 'Contradictory Functional Documentation',
    difficulty: 'Expert',
    context:
      'An occupational therapist and a skilled nurse both visit a patient on the same day. The OT note and nursing note contain the following documentation about the patient\'s functional status:',
    noteExcerpt:
      'OT Note: "Patient required moderate assistance (50% effort) for upper body dressing and maximum assistance for lower body dressing. Unable to don/doff shoes independently due to limited hip flexion and dynamic standing balance deficits. Toileting requires CGA due to transfer difficulty."\n\nNursing Note (same date): "Patient independent with ADLs. Ambulating in home without assistive device. Patient self-managing medication regimen. Homebound due to generalized weakness."',
    question: 'What is the most serious documentation problem created by these two notes?',
    options: [
      { id: 'a', text: 'The nursing note\'s homebound justification is vague — "generalized weakness" is insufficient.' },
      { id: 'b', text: 'The contradictory functional status documentation across disciplines on the same date creates a chart integrity failure that undermines the reliability of the entire record.' },
      { id: 'c', text: 'The OT note does not document the specific therapeutic interventions performed during the visit.' },
      { id: 'd', text: 'The nursing note does not document skilled nursing interventions — only functional observations.' },
    ],
    correctOptionId: 'b',
    rationale: {
      whyCorrect:
        'When two clinicians document contradictory functional status on the same date — OT documents moderate-to-maximum assist for dressing while nursing documents "independent with ADLs" — an auditor concludes that at least one record is inaccurate. This is a chart integrity failure. It undermines the reliability of the entire record, because the auditor cannot determine which documentation is correct. Both disciplines\' notes become suspect. This type of contradiction is among the strongest audit red flags and can trigger expanded review of the entire agency.',
      whyOthersWrong:
        'Options A, C, and D are all real deficiencies. But they are individual note problems. The cross-discipline contradiction is a systemic chart integrity issue that affects the evidentiary value of the entire clinical record — not just one note.',
      whatDocumentationShouldShow:
        'Both disciplines must document consistently. If the patient\'s functional status varies by task or time of day, the notes should explain the variance: "Patient requires moderate assist for lower body dressing in AM due to morning stiffness and limited hip flexion; nursing observed patient ambulating independently to bathroom at 11 AM after morning mobility routine." The chart must tell a coherent story.',
      auditorConclusion:
        'An auditor reviewing these two notes side by side would flag the entire chart for reliability concerns. The contradiction suggests either inaccurate documentation, copy-forward, or insufficient assessment by one or both clinicians. This could trigger expanded audit of additional charts.',
    },
  },
  {
    id: 'SB-06',
    title: 'Missing Patient Response',
    difficulty: 'Advanced',
    context:
      'A skilled nurse provides wound care and medication management for a patient with a venous stasis ulcer and newly prescribed Coumadin. The visit note reads:',
    noteExcerpt:
      '"Provided wound care to left lower leg venous stasis ulcer. Removed old dressing, irrigated wound with NS, applied Medihoney gel and covered with bordered foam dressing. Assessed wound bed — pink granulation tissue with serous drainage. Obtained INR draw per MD order — specimen collected from R antecubital, sent to lab. Reviewed Coumadin precautions with patient — bleeding precautions, dietary considerations, importance of consistent vitamin K intake. Will follow up on INR results."',
    question: 'What is the PRIMARY documentation deficiency?',
    options: [
      { id: 'a', text: 'The wound assessment lacks measurements (length, width, depth) to track healing progress.' },
      { id: 'b', text: 'The note documents interventions but does not include the patient\'s response to any of them.' },
      { id: 'c', text: 'The Coumadin teaching does not specify the patient\'s target INR range or current dose.' },
      { id: 'd', text: 'INR collection documentation should include the tube type, time of draw, and fasting status.' },
    ],
    correctOptionId: 'b',
    rationale: {
      whyCorrect:
        'The note thoroughly documents what the nurse DID but completely omits how the patient RESPONDED. There is no pain level documented during the dressing change. There is no documentation of the patient\'s comprehension of Coumadin teaching. There is no mention of how the patient tolerated the venipuncture. Every skilled intervention requires documentation of the patient\'s response because: (1) it demonstrates individualized care, (2) it provides data for treatment planning, and (3) auditors use patient response to verify that assessment and clinical judgment were applied.',
      whyOthersWrong:
        'Option A is a real deficiency (wound measurements are critical — see SB-03) but the question asks about the PRIMARY deficiency, and the complete absence of patient response across ALL interventions is more fundamental. Option C is a valid clinical concern but secondary. Option D is overly technical — standard lab documentation does not require tube type in a visit note.',
      whatDocumentationShouldShow:
        '"Wound care: Patient reported pain 5/10 during dressing removal, decreased to 2/10 after NS irrigation. Wound bed assessed — 60% pink granulation, serous drainage scant, no odor. Patient observed wound during care and verbalized understanding of healing progression. INR draw: Specimen collected without difficulty, hemostasis achieved in 2 minutes. Coumadin teaching: Patient able to name 3 foods high in vitamin K, stated understanding of need for consistency. Unable to recall target INR range — reinforced goal of 2.0-3.0, patient repeated back correctly."',
      auditorConclusion:
        'Without patient response documentation, the note reads as a procedure checklist, not a skilled nursing encounter. An auditor expects to see evidence that the clinician assessed, evaluated, and applied clinical judgment — patient response is the documentation that demonstrates this.',
    },
  },
  {
    id: 'SB-07',
    title: 'Weak Physician Communication',
    difficulty: 'Advanced',
    context:
      'A skilled nurse discovers an elevated blood pressure and a new complaint of dizziness during a routine home health visit. The patient is on lisinopril 20mg daily. The visit note documents the following communication:',
    noteExcerpt:
      '"BP today 178/96 — elevated from usual baseline of 130s/80s. Patient reports new onset dizziness when standing, started 2 days ago. Heart rate regular at 88. No chest pain or SOB. Notified MD of elevated BP and dizziness. Will continue to monitor per POC. RTC Wednesday."',
    question: 'What is the PRIMARY documentation deficiency regarding physician communication?',
    options: [
      { id: 'a', text: 'The note should specify orthostatic blood pressure measurements (lying, sitting, standing) to properly evaluate the dizziness complaint.' },
      { id: 'b', text: '"Notified MD" is insufficient — the note must document who was contacted, what information was communicated, and the physician\'s response or orders.' },
      { id: 'c', text: 'The note does not document whether the patient is compliant with the current lisinopril regimen.' },
      { id: 'd', text: 'A new symptom of dizziness should trigger a falls risk reassessment, which is not documented.' },
    ],
    correctOptionId: 'b',
    rationale: {
      whyCorrect:
        '"Notified MD" is one of the most commonly cited insufficient documentation phrases in home health. CMS requires complete physician communication documentation: (1) WHO was contacted (name of physician or on-call provider), (2) WHAT was communicated (specific clinical findings — not just "elevated BP"), (3) WHAT the physician\'s response was (new orders, medication changes, instruction to continue monitoring, or request for follow-up). Without this, there is no verifiable communication trail, and the nurse\'s clinical judgment and physician collaboration cannot be assessed.',
      whyOthersWrong:
        'Option A is excellent clinical practice (orthostatics should absolutely be assessed with new dizziness) but is a clinical assessment issue, not the physician communication deficiency. Option C is a valid omission but secondary. Option D is relevant but not the PRIMARY deficiency asked about.',
      whatDocumentationShouldShow:
        '"Called Dr. Martinez\'s office at 10:45 AM. Spoke with Dr. Martinez directly. Reported: BP 178/96 (patient\'s baseline 130s/80s), new onset positional dizziness x 2 days, HR 88 regular, no chest pain or SOB, patient compliant with lisinopril 20mg daily. Dr. Martinez ordered: hold lisinopril today, obtain orthostatic BPs, recheck BP tomorrow AM, call if SBP >180 or symptoms worsen. New order: amlodipine 5mg daily, will e-prescribe to pharmacy. Verbal order read back confirmed."',
      auditorConclusion:
        'An auditor seeing "notified MD" cannot verify that communication occurred, what clinical information was shared, or what the physician directed. This documentation gap raises concerns about care coordination and could contribute to a claim denial if the physician communication was the basis for the skilled visit.',
    },
  },
  {
    id: 'SB-08',
    title: 'Signature & Authentication Issue',
    difficulty: 'Advanced',
    context:
      'During an internal QA review, a supervisor discovers the following documentation pattern across 12 visit notes for different patients, all authored by a single clinician over the past month:',
    noteExcerpt:
      'Pattern observed:\n- All 12 notes were created in the EMR within a 2-hour window on a Sunday evening\n- Visit dates span Monday through Saturday of the prior week\n- All notes are signed electronically with timestamps matching the Sunday batch entry\n- Note content varies by patient but follows a very similar structure\n- Documentation is clinically reasonable in content — assessments, interventions, and responses are documented',
    question: 'What is the PRIMARY compliance concern with this documentation pattern?',
    options: [
      { id: 'a', text: 'The similar structure across notes suggests template overuse and lack of individualization.' },
      { id: 'b', text: 'The notes were not documented contemporaneously — batch creation days after visits undermines documentation reliability and accuracy.' },
      { id: 'c', text: 'Sunday documentation suggests the clinician is working unauthorized overtime hours.' },
      { id: 'd', text: 'Electronic signatures should include the date of the encounter, not the date of signature.' },
    ],
    correctOptionId: 'b',
    rationale: {
      whyCorrect:
        'Contemporaneous documentation is a foundational CMS requirement. Notes created 2-7 days after the visit — in a batch session — raise serious reliability concerns. A clinician documenting 12 patient encounters from memory, days later, in a 2-hour window, cannot produce the same level of accurate, detailed, individualized documentation as one documenting at or near the time of the encounter. Auditors use EMR metadata (creation timestamps, edit history) to identify this pattern. It is one of the most common triggers for expanded audit and fraud investigation.',
      whyOthersWrong:
        'Option A (template structure) is a secondary concern — similar structure may simply reflect the clinician\'s documentation style, not necessarily template overuse. Option C is a labor compliance issue, not a documentation integrity issue. Option D is incorrect — electronic signatures timestamp when the note was authenticated, but the note must also contain the date of service; the audit concern is the gap between service date and documentation date.',
      whatDocumentationShouldShow:
        'Each visit note should be created at or near the time of the encounter. Best practice is point-of-care documentation or same-day entry. Agency policy should define maximum acceptable documentation lag (typically 24-48 hours). EMR creation timestamps should fall within this window.',
      auditorConclusion:
        'An auditor reviewing EMR metadata would flag this pattern immediately. Batch documentation days after encounters is a known indicator of either (1) documentation accuracy concerns or (2) potential fabrication. This pattern typically triggers expanded review of the clinician\'s entire caseload and may result in referral to the UPIC.',
    },
  },
  {
    id: 'SB-09',
    title: 'Template / Copy-Forward Trap',
    difficulty: 'Expert',
    context:
      'A supervisor reviewing a patient\'s chart notices that the last 4 weekly skilled nursing visit notes contain nearly identical language. The patient has Stage IIIA NSCLC with home health ordered for symptom management and medication teaching. Week 4 note:',
    noteExcerpt:
      '"Patient resting in recliner upon arrival. VS: BP 128/76, HR 82, RR 18, T 98.4, O2 sat 94% on RA. Patient reports mild fatigue, no new complaints. Lung sounds clear bilateral. Pain 3/10 managed with current medication regimen. Reviewed all medications — patient compliant. Reinforced s/s to report to MD. Skin intact. Nutritional intake adequate. Patient verbalizes understanding of disease process. No acute distress. Continue plan of care. Next visit per schedule."',
    question: 'What makes this note particularly dangerous from an audit perspective?',
    options: [
      { id: 'a', text: 'The note is vague — it uses general language that could describe any patient with any diagnosis.' },
      { id: 'b', text: 'Four identical notes suggest copy-forward, which questions whether assessment actually occurred AND undermines medical necessity by documenting a stable, unchanging patient.' },
      { id: 'c', text: 'The pain assessment is insufficient — 3/10 should include location, quality, and effect on function.' },
      { id: 'd', text: '"Reinforced s/s to report to MD" is a non-specific teaching phrase that does not document skilled education.' },
    ],
    correctOptionId: 'b',
    rationale: {
      whyCorrect:
        'This note is a dual failure. First: four identical weekly notes are prima facie evidence of copy-forward — the auditor concludes either the clinician is not actually assessing the patient individually, or the patient\'s condition is truly unchanged. Second: if the patient\'s condition IS unchanged over 4 weeks — stable vitals, same pain level, same functional status, same complaints — the auditor questions why continued skilled nursing is medically necessary. The copy-forward pattern simultaneously undermines documentation reliability AND medical necessity. This is the most dangerous audit scenario because it creates two independent bases for denial.',
      whyOthersWrong:
        'Option A is true but is a component of the larger copy-forward problem, not the complete picture. Option C is a valid clinical documentation concern but secondary. Option D is also valid but is one element within the larger systemic failure of the note.',
      whatDocumentationShouldShow:
        'Each visit must document: what changed since the last visit (even if subtle), what was specifically assessed related to the cancer diagnosis, what the patient\'s current functional trajectory is, what specific teaching was provided and the patient\'s response, and why continued skilled care is needed for the NEXT visit. "Patient reports increased fatigue this week — sleeping 14 hours/day vs. 10 hours last week. Weight down 2 lbs from last visit (158 → 156). Appetite decreased — consumed ~50% of meals x 3 days. Discussed nutritional supplementation strategies; patient will try Ensure BID between meals. Coordination with oncology regarding next CT scan results expected Friday."',
      auditorConclusion:
        'An auditor seeing 4 identical notes would conclude: (1) documentation is unreliable due to copy-forward, (2) the patient is stable and may not require continued skilled nursing, and (3) the agency may have a systemic documentation integrity problem warranting expanded review.',
    },
  },
  {
    id: 'SB-10',
    title: 'Sounds Strong but Fails Audit',
    difficulty: 'Expert',
    context:
      'A skilled nurse documents the following note for a patient with a recent CVA, left-sided hemiparesis, dysphagia, and insulin-dependent diabetes. On the surface, the note appears thorough and detailed:',
    noteExcerpt:
      '"Comprehensive skilled nursing assessment performed. Neurological status assessed — patient alert, oriented x3, left-sided weakness persists. NIHSS performed. Dysphagia precautions maintained per SLP recommendations. Modified diet with thickened liquids, patient compliant. Blood glucose 142 mg/dL pre-lunch. Insulin administered per sliding scale. Detailed medication reconciliation completed — all medications match pharmacy records. Extensive caregiver education provided on stroke recovery, fall prevention, and diabetes management. Caregiver demonstrates competency with insulin administration and blood glucose monitoring. Thorough home safety evaluation completed — no new hazards identified. Patient progressing well. Interdisciplinary care coordination ongoing. Plan of care followed. Comprehensive documentation completed."',
    question: 'Despite its length and apparent thoroughness, why would an auditor flag this note?',
    options: [
      { id: 'a', text: 'The note lacks specific clinical data — it describes CATEGORIES of assessment without providing the actual FINDINGS.' },
      { id: 'b', text: 'NIHSS scoring results should be documented numerically, not just that the assessment was "performed."' },
      { id: 'c', text: 'Insulin administration should specify the insulin type, dose administered, and injection site.' },
      { id: 'd', text: 'Caregiver education content should be specific to what was taught, not described in broad categories.' },
    ],
    correctOptionId: 'a',
    rationale: {
      whyCorrect:
        'This is the most deceptive type of weak documentation. The note SOUNDS comprehensive because it uses clinical vocabulary and describes what TYPES of assessments were performed. But it contains almost no actual clinical data. "Neurological status assessed — left-sided weakness persists" — what is the grip strength? Is it changed from the last visit? "NIHSS performed" — what was the score? "Detailed medication reconciliation completed" — were there any discrepancies? "Extensive caregiver education provided" — on what specific topics, and what was the caregiver\'s demonstrated competency? "Thorough home safety evaluation" — what was evaluated? The note is a list of CATEGORIES, not FINDINGS. An auditor reads it and knows nothing specific about what was found, what clinical judgment was applied, or what the patient\'s actual status is.',
      whyOthersWrong:
        'Options B, C, and D are all valid — and they are all EXAMPLES of the broader problem described in Option A. The NIHSS score, insulin details, and caregiver education specifics are all instances of the note describing categories without providing data. Option A captures the systemic failure; the others identify individual symptoms of it.',
      whatDocumentationShouldShow:
        'Replace every category with its finding: "Neuro: A&Ox3, NIHSS 6 (down from 8 last visit), L grip strength 3/5, L LE strength 3+/5, facial droop resolved. Dysphagia: tolerating mechanical soft diet with nectar-thick liquids without coughing, SLP modified diet level confirmed. BG: 142 mg/dL pre-lunch. Administered novolog 4 units SQ L abdomen per sliding scale. Med reconciliation: identified patient taking OTC aspirin 325mg in addition to prescribed Plavix — contacted Dr. Pham, order received to discontinue OTC aspirin. Caregiver education: taught wife to perform blood glucose check — demonstrated site selection, lancet use, and meter operation. Wife performed return demonstration independently with correct technique."',
      auditorConclusion:
        'Despite its professional appearance, an auditor would recognize this note as "documentation about documentation" — the nurse documented that assessments were performed without documenting what was found. This pattern is increasingly flagged by automated audit algorithms that scan for specific clinical data points.',
    },
  },
  // ─── Document Review Scenarios (SB-11 through SB-15) ───
  {
    id: 'SB-11',
    title: 'Face-to-Face Encounter Timing',
    difficulty: 'Expert',
    context:
      'You are reviewing a Start of Care packet before submission. The referral date is 01/15/2025, the SOC date is 01/20/2025, and the physician face-to-face encounter is dated 02/25/2025. The 485 was signed by the physician on 03/01/2025.',
    noteExcerpt:
      '"Face-to-Face Encounter: Date: 02/25/2025. Provider: Dr. Wilson, MD. Encounter type: Office visit. Clinical findings: Patient presents with worsening CHF (NYHA Class III), bilateral lower extremity edema 2+, SOB with minimal exertion. Patient requires skilled nursing for medication management, cardiac assessment, and patient education. Homebound status: Patient is unable to leave home without considerable and taxing effort due to dyspnea and fatigue. Home health services are medically necessary. Signed: Dr. Wilson, 03/01/2025."',
    question: 'What is the critical compliance issue with this face-to-face encounter documentation?',
    options: [
      { id: 'a', text: 'The face-to-face encounter occurred more than 30 days AFTER the SOC date, violating the 30-day post-SOC window requirement.' },
      { id: 'b', text: 'The physician signed the encounter documentation 4 days after the encounter — signatures should be same-day.' },
      { id: 'c', text: 'The encounter does not specify whether the patient was seen in person or via telehealth.' },
      { id: 'd', text: 'The homebound status documentation is too brief and lacks functional specificity.' },
    ],
    correctOptionId: 'a',
    rationale: {
      whyCorrect:
        'CMS requires the face-to-face encounter to occur no more than 90 days prior to or within 30 days after the start of care date. SOC was 01/20/2025. The 30-day post-SOC window ends 02/19/2025. The encounter on 02/25/2025 is 36 days after SOC — 6 days outside the allowed window. This is an absolute disqualifier for the entire episode.',
      whyOthersWrong:
        'Option B is wrong because CMS does not mandate same-day signature — the encounter documentation must be signed and dated, and a brief delay is acceptable. Option C is noted but not critical — either modality can satisfy the requirement. Option D identifies a quality issue but not a compliance violation that would invalidate the encounter.',
      whatDocumentationShouldShow:
        'The face-to-face encounter must be dated within the compliant window (90 days before SOC or 30 days after SOC). If the encounter falls outside this window, a new qualifying encounter must be obtained before the claim can be submitted.',
      auditorConclusion:
        'An auditor would deny the entire episode. The face-to-face encounter timing requirement is a binary pass/fail — there is no gray area. This single date issue invalidates every visit billed under this episode, regardless of how strong the clinical documentation may be.',
    },
  },
  {
    id: 'SB-12',
    title: 'Contradictory Assessment Findings',
    difficulty: 'Expert',
    context:
      'You are conducting a QA review of an OASIS assessment for a patient admitted after a total knee replacement. The assessing nurse completed the OASIS on the same day as the SOC visit. You notice discrepancies between the clinical note and the OASIS responses.',
    noteExcerpt:
      '"Clinical Visit Note (SOC): Patient ambulates with rolling walker, able to walk approximately 50 feet before needing to rest. Transfers from bed to chair with standby assist. Independent with upper body dressing. Requires assist with lower body dressing due to knee precautions."\n\nOASIS Responses:\nM1860 (Ambulation): 04 — Bedfast\nM1850 (Transferring): 02 — Able to transfer with maximal assist\nM1810 (Upper Body Dressing): 03 — Able to dress with someone\'s help',
    question: 'What is the most serious problem with this documentation?',
    options: [
      { id: 'a', text: 'The clinical note lacks objective measurements like gait speed and distance metrics.' },
      { id: 'b', text: 'The OASIS responses directly contradict the clinical note — the OASIS scores significantly understate the patient\'s functional abilities.' },
      { id: 'c', text: 'The OASIS should have been completed on a separate visit, not the same day as SOC.' },
      { id: 'd', text: 'The clinical note should include more detail about the specific knee precautions impacting lower body dressing.' },
    ],
    correctOptionId: 'b',
    rationale: {
      whyCorrect:
        'The clinical note documents that the patient ambulates with a rolling walker for 50 feet, yet the OASIS codes the patient as "bedfast." The note says standby assist for transfers, but OASIS codes maximal assist. The note says independent with upper body dressing, but OASIS codes dressing as needing "someone\'s help." These are not borderline disagreements — they are direct contradictions that suggest the OASIS was either completed carelessly or intentionally scored to maximize reimbursement severity. Either way, this pattern would trigger an audit.',
      whyOthersWrong:
        'Option A identifies a quality improvement opportunity but misses the critical compliance issue. Option C is factually wrong — OASIS is routinely completed during the SOC visit. Option D would improve documentation quality but is not the most serious problem when the OASIS directly contradicts the clinical findings.',
      whatDocumentationShouldShow:
        'OASIS responses must be supported by and consistent with the clinical note. M1860 should reflect that the patient ambulates with a device (score 02 or 03). M1850 should reflect standby assist (score 01). M1810 should reflect independence (score 00). The clinical note narrative must align with the coded responses.',
      auditorConclusion:
        'This pattern of OASIS responses consistently worse than clinical findings is one of the strongest red flags for upcoding. An auditor would immediately flag this for expanded review and the agency could face allegations of False Claims Act violations. All episodes from this clinician would likely be pulled for review.',
    },
  },
  {
    id: 'SB-13',
    title: 'Medical Necessity Without Skilled Need',
    difficulty: 'Advanced',
    context:
      'A patient was admitted to home health with diagnoses of hypertension and type 2 diabetes (controlled, A1C 6.8%). The 485 orders skilled nursing visits 2x/week for 60 days. You are reviewing a visit note from week 3.',
    noteExcerpt:
      '"Skilled nursing visit performed. Vital signs: BP 128/78, HR 72, T 98.4, SpO2 97%. Blood glucose 118 mg/dL, fasting. Patient reports taking all medications as prescribed. Reviewed medication list — no changes. Diet: following diabetic diet as instructed. No complaints. Wound: none. Edema: none. Lungs clear bilaterally. Patient ambulating independently in home. Patient education provided on importance of medication compliance and healthy eating. Patient verbalizes understanding. No changes to plan of care. Will continue skilled nursing visits per orders."',
    question: 'Why would this visit note fail to support medical necessity?',
    options: [
      { id: 'a', text: 'The visit note does not document communication with the physician.' },
      { id: 'b', text: 'All findings are normal, the patient is stable and compliant — there is no documented skilled need justifying a skilled nursing visit.' },
      { id: 'c', text: 'The vital signs should include respiratory rate for a complete assessment.' },
      { id: 'd', text: 'The education provided is too general — it should specify exactly what was taught.' },
    ],
    correctOptionId: 'b',
    rationale: {
      whyCorrect:
        'Every element in this note indicates stability: normal vitals, controlled blood glucose, medication compliance, no active wounds, no edema, clear lungs, independent ambulation, no complaints. There is no documented skilled need. General education on "medication compliance and healthy eating" is a maintenance-level activity, not a skilled service. If a patient is this stable, the skilled need has been met and the patient should be discharged or the frequency reduced. Continued visits at this level constitute overutilization.',
      whyOthersWrong:
        'Option A — physician communication is not required at every visit. Option C — while respiratory rate is a standard vital, its omission is a documentation quality issue, not the most serious compliance concern. Option D — more specific education content would improve the note, but the fundamental problem remains that there is no underlying skilled need to justify the visit.',
      whatDocumentationShouldShow:
        'If visits are to continue, the note must identify an active, specific skilled need: new symptoms requiring assessment, medication changes requiring teaching and monitoring, unstable vitals requiring clinical judgment, or a complex care management situation. If none of these exist, the documentation should support reduction in frequency or discharge.',
      auditorConclusion:
        'An auditor would determine this visit does not meet Medicare\'s coverage criteria for skilled nursing. The visit is essentially a "well check" that any caregiver could perform. Continued visits of this nature would be denied, and the agency could face recoupment for the entire episode if the pattern persists across multiple visits.',
    },
  },
  {
    id: 'SB-14',
    title: 'POC Discrepancy — Orders vs. Practice',
    difficulty: 'Expert',
    context:
      'You are the clinical supervisor reviewing a 30-day recertification packet. The physician-signed 485 (plan of care) orders wound care 3x/week with normal saline wet-to-dry dressing changes. You compare this to the visit notes from the past two weeks.',
    noteExcerpt:
      '"Visit Note (01/25): L sacral wound — applied Medihoney dressing per wound care specialist recommendation. Wound measurements: 3.2cm x 2.1cm x 0.3cm, 85% granulation, minimal serous drainage."\n"Visit Note (01/28): L sacral wound — applied silver alginate dressing, wound bed 90% granulation, purulent drainage noted, contacted Dr. Adams, order received for wound culture."\n"Visit Note (01/30): L sacral wound — continued silver alginate per wound care specialist. Wound culture results pending."',
    question: 'What is the critical compliance issue in this documentation?',
    options: [
      { id: 'a', text: 'Wound measurements should be documented at every visit, not just the first one.' },
      { id: 'b', text: 'The nurse is performing wound care that differs from the physician-ordered plan of care — the 485 orders wet-to-dry with normal saline, but Medihoney and silver alginate are being applied without a 485 order change.' },
      { id: 'c', text: 'The wound care specialist should be identified by name and credentials in each note.' },
      { id: 'd', text: 'Purulent drainage is an urgent finding that should have triggered an ER referral, not just a wound culture order.' },
    ],
    correctOptionId: 'b',
    rationale: {
      whyCorrect:
        'The physician-signed 485 orders normal saline wet-to-dry dressing changes. The visit notes show the nurse applying Medihoney (01/25) and silver alginate (01/28 and 01/30). These are different wound care products and techniques not ordered on the current 485. Even if the wound care specialist recommended the change, the 485 must be updated with a physician order before the new treatment can be implemented. Practicing outside the plan of care is a compliance violation regardless of clinical appropriateness.',
      whyOthersWrong:
        'Option A is a documentation quality issue but not the critical compliance problem. Option C is a best practice, not a compliance requirement. Option D — purulent drainage warrants a wound culture (which was ordered) and physician notification (which occurred), not necessarily an ER referral; clinical judgment was appropriate here. The fundamental issue is performing treatment not ordered on the POC.',
      whatDocumentationShouldShow:
        'Before changing wound care products or techniques, obtain a physician order and update the 485. The visit note should read: "Contacted Dr. Adams regarding wound care specialist recommendation to change from N/S wet-to-dry to Medihoney/silver alginate. Verbal order received to change wound care protocol. Updated 485 sent for signature."',
      auditorConclusion:
        'An auditor would flag every visit where treatment deviated from the 485 orders. These visits could be denied because the care provided was not ordered care. Additionally, this raises concerns about the agency\'s processes for order management and compliance oversight.',
    },
  },
  {
    id: 'SB-15',
    title: 'Homebound Status — Missing Clinical Support',
    difficulty: 'Expert',
    context:
      'During an ADR (Additional Documentation Request), you must submit documentation supporting a patient\'s homebound status. The patient has COPD (Stage III) and osteoarthritis. The clinical notes contain the following homebound statements across three consecutive visits.',
    noteExcerpt:
      '"Visit 1: Patient is homebound. Leaving home requires considerable and taxing effort."\n"Visit 2: Patient remains homebound. Unable to leave home without assistance."\n"Visit 3: Patient continues to be homebound per plan of care."',
    question: 'Why would an auditor reject this homebound status documentation?',
    options: [
      { id: 'a', text: 'Homebound status should be documented using a standardized assessment tool, not narrative statements.' },
      { id: 'b', text: 'The documentation uses boilerplate language that parrots CMS criteria without providing patient-specific clinical evidence of WHY leaving home is taxing.' },
      { id: 'c', text: 'Homebound status must be re-certified by the physician at each visit.' },
      { id: 'd', text: 'The documentation should include the patient\'s home address and living situation to establish context.' },
    ],
    correctOptionId: 'b',
    rationale: {
      whyCorrect:
        'All three visit notes use templated language that mirrors CMS regulatory language ("considerable and taxing effort") without describing the patient-specific clinical findings that make leaving home difficult. An auditor needs to see WHY this specific patient is homebound. What are the SpO2 levels with exertion? How far can the patient walk before desaturating? What is the impact of osteoarthritis on mobility? Does the patient require supplemental oxygen? The current documentation is indistinguishable from a template that could be pasted into any patient\'s chart.',
      whyOthersWrong:
        'Option A — there is no CMS-required standardized tool for homebound assessment; clinical narrative documentation is appropriate. Option C — the physician certifies homebound status at certification/recertification, not at each visit; however, each clinical note should support the status. Option D — while contextually helpful, address and living situation are not the missing elements; clinical evidence of functional limitation is.',
      whatDocumentationShouldShow:
        '"Patient is homebound: SpO2 drops from 96% to 88% on room air with ambulation of 15 feet, requiring supplemental O2 at 2L/min. Patient uses rolling walker due to bilateral knee OA (R knee ROM 45°, L knee ROM 60°) and reports 7/10 pain with standing >2 minutes. Patient requires 5 minutes rest after walking from bedroom to kitchen (approx. 30 feet). Leaving home requires portable O2, walker, and physical assistance of one person. Patient leaves home only for physician appointments, transported via wheelchair-accessible van."',
      auditorConclusion:
        'Boilerplate homebound documentation is one of the most common denial reasons in home health audits. The documentation must paint a clinical picture specific to THIS patient that makes it obvious to a non-clinician reviewer why leaving home is a taxing experience. Generic statements are treated as unsupported claims.',
    },
  },
]

