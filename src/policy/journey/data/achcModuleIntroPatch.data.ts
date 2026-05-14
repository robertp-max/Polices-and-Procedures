import type { Lesson } from './achcContentTypes';

const IMG: Record<string, string> = {
  M01: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop',
  M02: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=600&auto=format&fit=crop',
  M03: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop',
  M04: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop',
  M05: 'https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?q=80&w=600&auto=format&fit=crop',
  M06: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=600&auto=format&fit=crop',
  M07: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop',
  M08: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?q=80&w=600&auto=format&fit=crop',
  M09: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop',
  M10: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?q=80&w=600&auto=format&fit=crop',
  M11: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop',
  M12: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=600&auto=format&fit=crop',
};

const PREHOOK_INTRO_NARRATION =
  'Before we begin the lesson content, take a moment to assess what you already know. ' +
  'This pre-assessment is not graded and will not affect your completion record. ' +
  'Answer each question honestly based on your current understanding. ' +
  'After you respond, you will see the correct answer and a brief explanation. ' +
  'This helps you recognize the key concepts ahead so the learning that follows is more meaningful and easier to retain.';

const PREHOOK_INTRO_CONTENT =
  'Before the lesson begins, you will answer three short questions.\n\n' +
  'This pre-assessment is NOT graded. Your goal is to surface what you already know ' +
  '— and flag the areas where the module content will matter most.\n\n' +
  'After each question you will see the correct answer with a brief explanation. ' +
  'This primes your thinking for the three lessons that follow.\n\n' +
  'Take your best guess. There is no penalty for being wrong here.';

export const achcModuleIntroPatch: Lesson[] = [

  /* ══════════════════════════════ M01 Cultural Awareness ══════════════════════════════ */
  {
    lesson_id: 'achc_m01_l0_v2', topic_id: 'ACHC-ART-M01', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m01_splash', type: 'splash', title: 'Cultural Awareness & CLAS Standards',
        content: 'M01 of 12 | 3 Lessons | Pre-Assessment | Final Competency Exam\nEstimated time: 45 minutes\n\nDelivering equitable care across cultures is a federal requirement and a clinical imperative. This module covers the CLAS Standards, cross-cultural communication, unconscious bias, and your professional obligations when cultural differences affect care.',
        narration_script: '', audio_path: '', image_url: IMG.M01, estimated_duration: '0:00', completion_required: false,
      },
      {
        card_id: 'achc_m01_prehook_intro', type: 'content', title: 'Pre-Assessment — What to Expect',
        content: PREHOOK_INTRO_CONTENT,
        narration_script: PREHOOK_INTRO_NARRATION,
        audio_path: '/training-audio/ACHC-ART-M01/l0/prehook_intro.wav', image_url: IMG.M01, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m01_prehook_q1', type: 'challenge', title: 'Pre-Assessment — Question 1',
        content: 'A patient refuses a blood transfusion citing religious beliefs. They are alert, oriented, and competent. The CORRECT action is:',
        narration_script: 'Pre-assessment question 1. A patient refuses a blood transfusion citing religious beliefs. They are alert, oriented, and competent. What is the correct action?',
        audio_path: '/training-audio/ACHC-ART-M01/l0/prehook_q1.wav', image_url: IMG.M01, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'Explain the medical risks and administer anyway to save their life', isCorrect: false, rationale: 'Competent patients have an absolute right to refuse treatment — even life-saving treatment. Overriding a competent refusal is legally assault and battery.' },
          { id: 'B', label: 'Document the refusal, notify the physician, ensure a signed refusal form is completed', isCorrect: true, rationale: 'Correct. Patient autonomy is paramount. Document the refusal clearly, notify the care team, and obtain a signed informed refusal to protect the patient and the Agency.' },
          { id: 'C', label: 'Contact their religious leader to persuade them to accept care', isCorrect: false, rationale: 'Involving third parties to override a patient\'s competent religious decision violates autonomy and is not an appropriate clinical response.' },
          { id: 'D', label: 'Discharge the patient for non-compliance', isCorrect: false, rationale: 'Refusing treatment is a patient right, not a compliance failure. Discharging a patient for exercising rights is a patient rights violation.' },
        ],
      },
      {
        card_id: 'achc_m01_prehook_q2', type: 'challenge', title: 'Pre-Assessment — Question 2',
        content: 'A patient with limited English proficiency nods and says "yes" to all your medication teaching questions, then holds the insulin pen incorrectly when asked to demonstrate. This tells you:',
        narration_script: 'Pre-assessment question 2. A patient with limited English proficiency nods and says yes throughout your medication teaching, then holds the insulin pen incorrectly when you ask them to demonstrate. What does this tell you?',
        audio_path: '/training-audio/ACHC-ART-M01/l0/prehook_q2.wav', image_url: IMG.M01, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'The patient understands but is nervous about the demonstration', isCorrect: false, rationale: 'Nodding and verbal agreement without accurate demonstration is a classic indicator of non-comprehension, not nervousness.' },
          { id: 'B', label: 'Verbal agreement does not confirm understanding — teach-back with demonstration is required, and a qualified interpreter should be arranged', isCorrect: true, rationale: 'Correct. "Yes" and nodding are social responses, not comprehension signals. Always verify through teach-back demonstration, and use a qualified interpreter for clinical content.' },
          { id: 'C', label: 'The patient needs written instructions instead of verbal teaching', isCorrect: false, rationale: 'Written instructions in the wrong language also fail. The solution is a qualified interpreter plus demonstrate-back technique.' },
          { id: 'D', label: 'The patient is non-compliant and should be referred to a different clinician', isCorrect: false, rationale: 'This is a language barrier, not non-compliance. The clinical obligation is to arrange appropriate language access services.' },
        ],
      },
      {
        card_id: 'achc_m01_prehook_q3', type: 'challenge', title: 'Pre-Assessment — Question 3',
        content: 'Cultural humility is BEST described as:',
        narration_script: 'Pre-assessment question 3. Cultural humility is best described as which of the following?',
        audio_path: '/training-audio/ACHC-ART-M01/l0/prehook_q3.wav', image_url: IMG.M01, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'A one-time certification that proves cultural competence', isCorrect: false, rationale: 'Cultural humility is the opposite of a static achievement. It is a lifelong process, not a certificate.' },
          { id: 'B', label: 'A lifelong process of self-reflection and openness to learning from each individual patient', isCorrect: true, rationale: 'Correct. Cultural humility requires ongoing self-examination of bias and a genuine willingness to learn from patients rather than assuming you already know their culture.' },
          { id: 'C', label: 'Knowing the customs of all major cultural groups served by the Agency', isCorrect: false, rationale: 'Memorizing cultural facts is cultural knowledge, not humility. Humility is about your approach and attitude, not a knowledge database.' },
          { id: 'D', label: 'Only relevant for international patients', isCorrect: false, rationale: 'Cultural humility applies to every patient interaction — domestic patients also have diverse cultural, religious, and personal identities.' },
        ],
      },
      {
        card_id: 'achc_m01_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Define cultural competence and cultural humility and explain how they differ.\n2. Identify the 15 CLAS Standards and describe their application in home health.\n3. Recognize common cross-cultural communication barriers and apply evidence-based strategies.\n4. Distinguish between cultural bias and workplace discrimination.\n5. Describe your EEOC obligations as both a recipient and a reporter of discriminatory conduct.\n6. Apply teach-back and plain language techniques to diverse patient populations.',
        narration_script: 'Learning objectives for Module 1: Cultural Awareness. After completing this module, you will be able to: define cultural competence and cultural humility and explain how they differ; identify the 15 CLAS Standards and describe their application in home health; recognize cross-cultural communication barriers and apply evidence-based strategies; distinguish between cultural bias and workplace discrimination; describe your EEOC obligations; and apply teach-back and plain language techniques with diverse patients.',
        audio_path: '/training-audio/ACHC-ART-M01/l0/objectives.wav', image_url: IMG.M01, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m01_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Cultural Competence — Ability to deliver effective care to patients from diverse backgrounds. Requires ongoing learning.\n\nCultural Humility — Lifelong self-reflection about personal bias. Recognizing your cultural lens affects your clinical lens.\n\nCLAS Standards — 15 federal benchmarks for Culturally and Linguistically Appropriate Services. Non-compliance = survey risk.\n\nLEP — Limited English Proficiency. Patients with LEP have a federal right (Title VI) to qualified interpreter services at no cost.\n\nTeach-Back — Asking patients to explain or demonstrate what you taught. Only validated method for confirming comprehension.\n\nMicroaggression — Subtle, often unintentional, communication that belittles or dismisses a patient\'s cultural identity.\n\nEEOC — Equal Employment Opportunity Commission. Prohibits employment discrimination based on race, color, religion, sex, national origin, age, disability.',
        narration_script: 'Seven key terms. Cultural Competence: the ability to deliver effective care to diverse patients — requires ongoing learning. Cultural Humility: lifelong self-reflection about your personal biases. CLAS Standards: 15 federal benchmarks for culturally and linguistically appropriate services — non-compliance creates survey risk. LEP: Limited English Proficiency — patients with LEP have a federal Title VI right to qualified interpreters at no cost. Teach-Back: asking patients to explain or demonstrate what you taught — the only validated method to confirm comprehension. Microaggression: subtle communication that belittles a patient\'s cultural identity. EEOC: prohibits employment discrimination based on protected characteristics.',
        audio_path: '/training-audio/ACHC-ART-M01/l0/concepts.wav', image_url: IMG.M01, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  /* ══════════════════════════════ M02 Emergency & Disaster ══════════════════════════════ */
  {
    lesson_id: 'achc_m02_l0_v2', topic_id: 'ACHC-ART-M02', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m02_splash', type: 'splash', title: 'Emergency & Disaster Preparedness',
        content: 'M02 of 12 | 3 Lessons | Pre-Assessment | Final Competency Exam\nEstimated time: 45 minutes\n\nIn a declared emergency, every decision you make about your patients is time-sensitive and legally documented. This module covers the Agency Emergency Preparedness Plan, patient triage prioritization, field worker obligations, and paper-backup documentation during system outages.',
        narration_script: '', audio_path: '', image_url: IMG.M02, estimated_duration: '0:00', completion_required: false,
      },
      {
        card_id: 'achc_m02_prehook_intro', type: 'content', title: 'Pre-Assessment — What to Expect',
        content: PREHOOK_INTRO_CONTENT,
        narration_script: PREHOOK_INTRO_NARRATION,
        audio_path: '/training-audio/ACHC-ART-M02/l0/prehook_intro.wav', image_url: IMG.M02, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m02_prehook_q1', type: 'challenge', title: 'Pre-Assessment — Question 1',
        content: 'A patient on oxygen has flooding encroaching on their neighborhood. Your FIRST action is:',
        narration_script: 'Pre-assessment question 1. A patient on oxygen has flooding encroaching on their neighborhood. What is your first action?',
        audio_path: '/training-audio/ACHC-ART-M02/l0/prehook_q1.wav', image_url: IMG.M02, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'Call the DME company to retrieve the concentrator', isCorrect: false, rationale: 'Equipment retrieval is secondary to ensuring the patient\'s safety and oxygen continuity. The patient comes first.' },
          { id: 'B', label: 'Ensure the patient has portable O2 and is transported to safety; notify supervisor', isCorrect: true, rationale: 'Correct. Patient safety and oxygen continuity are the immediate priorities. Equipment and administrative steps follow.' },
          { id: 'C', label: 'Document in the patient chart and wait for Agency guidance', isCorrect: false, rationale: 'Documentation is important but cannot precede action when a patient\'s safety is at immediate risk.' },
          { id: 'D', label: 'Call 911 only if the water enters the home', isCorrect: false, rationale: 'Waiting for imminent physical risk before acting is not acceptable for a technology-dependent patient in an evolving emergency.' },
        ],
      },
      {
        card_id: 'achc_m02_prehook_q2', type: 'challenge', title: 'Pre-Assessment — Question 2',
        content: 'Under the Agency triage system, which patient should be contacted FIRST during an emergency activation?',
        narration_script: 'Pre-assessment question 2. Under the Agency triage system, which patient should be contacted first during an emergency activation?',
        audio_path: '/training-audio/ACHC-ART-M02/l0/prehook_q2.wav', image_url: IMG.M02, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'The patient closest to your current location', isCorrect: false, rationale: 'Proximity is not the triage criterion. Clinical acuity and technology dependency determine priority.' },
          { id: 'B', label: 'The patient on home mechanical ventilation (Class I)', isCorrect: true, rationale: 'Correct. Class I patients are life-sustaining technology dependent. Without power or clinical support, their survival is immediately at risk — they are contacted within 30 minutes of activation.' },
          { id: 'C', label: 'The patient with the most upcoming visits scheduled', isCorrect: false, rationale: 'Scheduling frequency has no bearing on emergency triage priority.' },
          { id: 'D', label: 'The patient who has been on service the longest', isCorrect: false, rationale: 'Length of service has no bearing on emergency triage. Clinical need drives priority.' },
        ],
      },
      {
        card_id: 'achc_m02_prehook_q3', type: 'challenge', title: 'Pre-Assessment — Question 3',
        content: 'During an emergency when the EHR system is down, your documentation obligation is:',
        narration_script: 'Pre-assessment question 3. During an emergency when the EHR system is down, what is your documentation obligation?',
        audio_path: '/training-audio/ACHC-ART-M02/l0/prehook_q3.wav', image_url: IMG.M02, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'Documentation is suspended until the system is restored', isCorrect: false, rationale: 'Legal and clinical documentation obligations do not suspend during emergencies. They shift to paper backup.' },
          { id: 'B', label: 'Document on paper backup forms; transfer to EHR within 24 hours of system restoration', isCorrect: true, rationale: 'Correct. The obligation shifts to paper — not disappears. All paper records must be transferred to the EHR within 24 hours of system restoration.' },
          { id: 'C', label: 'Verbal reporting to your supervisor replaces written documentation', isCorrect: false, rationale: 'Verbal reporting is not a substitute for written documentation. Both are required in an emergency.' },
          { id: 'D', label: 'Only document if a patient was harmed', isCorrect: false, rationale: 'Every contact attempt, patient status, care provided, and instructions given must be documented regardless of outcome.' },
        ],
      },
      {
        card_id: 'achc_m02_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Describe your specific role in the Agency Emergency Preparedness and Response Plan.\n2. Apply the 4-class patient triage system to prioritize field actions during an emergency.\n3. Execute the Agency communication chain when normal contact attempts fail.\n4. Document patient contacts, care deferrals, and status using paper backup protocols.\n5. Identify your personal preparedness obligations that enable you to respond professionally.\n6. Describe the post-emergency patient assessment protocol.',
        narration_script: 'Learning objectives for Module 2: Emergency and Disaster Preparedness. After completing this module, you will be able to describe your specific role in the Agency Emergency Preparedness Plan; apply the four-class patient triage system; execute the Agency communication chain when normal contact fails; document using paper backup protocols; identify your personal preparedness obligations; and describe the post-emergency patient assessment protocol.',
        audio_path: '/training-audio/ACHC-ART-M02/l0/objectives.wav', image_url: IMG.M02, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m02_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'EPRP — Emergency Preparedness and Response Plan. Agency-specific, reviewed annually. Every employee must know their role.\n\nClass I Patient — Technology-dependent (vent, O2 >4L, IV infusion). Contact within 30 minutes of activation.\n\nClass II Patient — Significant medical needs (wounds, unstable). Contact within 1 hour.\n\nClass III Patient — Moderate needs, stable. Contact within 4 hours.\n\nClass IV Patient — Independent, no medical equipment. Monitor per plan.\n\nShelter-in-Place — Directive to remain in current location due to external hazard. Different from evacuation.\n\nPaper Backup — Agency-approved paper forms used when EHR is unavailable. Must be transferred to EHR within 24 hours of restoration.\n\nPost-Emergency Assessment — Required clinical check of all patients after emergency declaration is lifted.',
        narration_script: 'Eight key terms. EPRP: Emergency Preparedness and Response Plan — agency-specific, reviewed annually, every employee must know their role. Class I Patient: technology-dependent, contact within 30 minutes. Class II: significant needs, contact within one hour. Class III: moderate needs, four hours. Class IV: independent, monitor per plan. Shelter-in-Place: remain in current location — different from evacuation. Paper Backup: agency paper forms used when the EHR is down — transferred to EHR within 24 hours of restoration. Post-Emergency Assessment: required clinical check of all patients after the emergency is lifted.',
        audio_path: '/training-audio/ACHC-ART-M02/l0/concepts.wav', image_url: IMG.M02, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  /* ══════════════════════════════ M03 Complaints & Grievances ══════════════════════════════ */
  {
    lesson_id: 'achc_m03_l0_v2', topic_id: 'ACHC-ART-M03', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m03_splash', type: 'splash', title: 'Complaints, Grievances & Patient Rights',
        content: 'M03 of 12 | 3 Lessons | Pre-Assessment | Final Competency Exam\nEstimated time: 45 minutes\n\nEvery patient has the federally protected right to complain about their care without fear of retaliation. Your role as a field worker is to receive, document, and escalate — never to investigate, argue, or dismiss. This module covers the three-tier event classification, the 10-day grievance response, de-escalation, and mandatory reporting.',
        narration_script: '', audio_path: '', image_url: IMG.M03, estimated_duration: '0:00', completion_required: false,
      },
      {
        card_id: 'achc_m03_prehook_intro', type: 'content', title: 'Pre-Assessment — What to Expect',
        content: PREHOOK_INTRO_CONTENT,
        narration_script: PREHOOK_INTRO_NARRATION,
        audio_path: '/training-audio/ACHC-ART-M03/l0/prehook_intro.wav', image_url: IMG.M03, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m03_prehook_q1', type: 'challenge', title: 'Pre-Assessment — Question 1',
        content: 'A patient says "I\'m a little frustrated my nurse is always running 45 minutes late." This is BEST classified as:',
        narration_script: 'Pre-assessment question 1. A patient says she is a little frustrated that her nurse is always running 45 minutes late. How is this best classified?',
        audio_path: '/training-audio/ACHC-ART-M03/l0/prehook_q1.wav', image_url: IMG.M03, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'A grievance requiring a formal written response within 30 days', isCorrect: false, rationale: 'A grievance is a formal allegation of patient rights violations. Schedule frustration expressed informally is a complaint, resolvable at the point of care.' },
          { id: 'B', label: 'A complaint that should be resolved immediately at the point of care if possible', isCorrect: true, rationale: 'Correct. A complaint is an informal concern about service quality — such as scheduling lateness. Address what you can, document it, and submit to your supervisor.' },
          { id: 'C', label: 'Routine feedback requiring no action', isCorrect: false, rationale: 'All patient concerns — even informal ones — must be documented and submitted. Nothing is "no action required."' },
          { id: 'D', label: 'Patient non-compliance with scheduling expectations', isCorrect: false, rationale: 'A scheduling concern expressed by the patient is a legitimate service quality complaint. Labeling it non-compliance is inappropriate.' },
        ],
      },
      {
        card_id: 'achc_m03_prehook_q2', type: 'challenge', title: 'Pre-Assessment — Question 2',
        content: 'A patient submits a written letter alleging that their rights were violated during a recent visit. The Agency must respond IN WRITING within:',
        narration_script: 'Pre-assessment question 2. A patient submits a written letter alleging that their rights were violated. How quickly must the Agency respond in writing?',
        audio_path: '/training-audio/ACHC-ART-M03/l0/prehook_q2.wav', image_url: IMG.M03, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: '24 hours', isCorrect: false, rationale: '24 hours applies to immediate safety concerns, not the grievance written response requirement.' },
          { id: 'B', label: '10 working days', isCorrect: true, rationale: 'Correct. ACHC and CMS require a written response to formal grievances within 10 working days. This is a regulatory requirement, not a guideline.' },
          { id: 'C', label: '30 calendar days', isCorrect: false, rationale: '30 days is the HIPAA breach notification timeline. The grievance written response is 10 working days.' },
          { id: 'D', label: '60 days', isCorrect: false, rationale: '60 days is the HIPAA breach notification to HHS. The grievance response is 10 working days.' },
        ],
      },
      {
        card_id: 'achc_m03_prehook_q3', type: 'challenge', title: 'Pre-Assessment — Question 3',
        content: 'A patient\'s son reports visible bruising on his father after a recent bath visit and says "I want this reported officially." This MOST closely qualifies as:',
        narration_script: 'Pre-assessment question 3. A patient\'s son reports visible bruising on his father after a recent bath visit and says he wants it reported officially. What does this most closely qualify as?',
        audio_path: '/training-audio/ACHC-ART-M03/l0/prehook_q3.wav', image_url: IMG.M03, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'A complaint resolvable at the point of care', isCorrect: false, rationale: 'Physical harm alleged during a care visit is not an informal scheduling complaint. It requires a more serious response.' },
          { id: 'B', label: 'A grievance requiring a 10-day written response', isCorrect: false, rationale: 'While a grievance process may also apply, the allegation of physical harm during care triggers mandatory reporting obligations that take precedence.' },
          { id: 'C', label: 'A potential abuse allegation requiring mandatory reporting regardless of proof', isCorrect: true, rationale: 'Correct. Alleged physical harm during a care interaction is a potential abuse allegation. Mandatory reporting is triggered by reasonable suspicion — not confirmed proof.' },
          { id: 'D', label: 'A documentation error that can be reviewed in the next QA cycle', isCorrect: false, rationale: 'Alleged physical abuse cannot wait for a QA cycle. Mandatory reporting is immediate.' },
        ],
      },
      {
        card_id: 'achc_m03_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Distinguish between a complaint, a grievance, and an allegation and describe the correct response pathway for each.\n2. Execute the 6-step grievance process including documentation, escalation, and timeline obligations.\n3. Apply de-escalation language with upset patients and family members without admitting liability.\n4. Describe the mandatory reporting obligations for suspected abuse, neglect, or exploitation.\n5. Identify what you must NEVER say when receiving a complaint or grievance.\n6. Document patient concerns accurately and submit them through the correct channel.',
        narration_script: 'Learning objectives for Module 3: Complaints, Grievances, and Patient Rights. After completing this module, you will be able to distinguish between a complaint, a grievance, and an allegation; execute the six-step grievance process; apply de-escalation language without admitting liability; describe mandatory reporting obligations; identify what you must never say when receiving a complaint; and document and submit patient concerns correctly.',
        audio_path: '/training-audio/ACHC-ART-M03/l0/objectives.wav', image_url: IMG.M03, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m03_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Complaint — Informal service quality concern (e.g., lateness, communication style). Resolved at point of care when possible. Document and submit.\n\nGrievance — Formal allegation that patient rights were violated. Requires intake documentation, admin review, and written response within 10 working days.\n\nAllegation — Suspected abuse, neglect, or exploitation. Requires immediate mandatory reporting. Suspicion = sufficient threshold. No proof required.\n\nMandatory Reporter — Any healthcare worker required by law to report suspected abuse. Includes home health field workers in all 50 states.\n\nDe-escalation — Communication technique to reduce emotional intensity without conceding liability. Goal: validate, not defend.\n\nGrievance Register — Official log of all formal grievances received, investigated, and resolved. Required for ACHC survey.\n\nNon-Retaliation — Federal protection. No patient may receive diminished service for filing a complaint or grievance.',
        narration_script: 'Seven key terms. Complaint: informal service quality concern — resolved at point of care when possible, always documented. Grievance: formal allegation that patient rights were violated — written response required within 10 working days. Allegation: suspected abuse, neglect, or exploitation — mandatory reporting triggered by suspicion, not confirmed proof. Mandatory Reporter: home health field workers are mandatory reporters in all 50 states. De-escalation: reducing emotional intensity without conceding liability. Grievance Register: official log required for ACHC survey. Non-Retaliation: federal protection — no patient may receive diminished service for filing a complaint.',
        audio_path: '/training-audio/ACHC-ART-M03/l0/concepts.wav', image_url: IMG.M03, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  /* ══════════════════════════════ M04 HIPAA ══════════════════════════════ */
  {
    lesson_id: 'achc_m04_l0_v2', topic_id: 'ACHC-ART-M04', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m04_splash', type: 'splash', title: 'HIPAA Privacy & Security',
        content: 'M04 of 12 | 3 Lessons | Pre-Assessment | Final Competency Exam\nEstimated time: 45 minutes\n\nEvery piece of patient information you encounter is Protected Health Information. A HIPAA violation does not require intent — it requires an unauthorized disclosure. This module covers PHI identification, the minimum necessary standard, field security obligations, breach notification, and patient rights over their own information.',
        narration_script: '', audio_path: '', image_url: IMG.M04, estimated_duration: '0:00', completion_required: false,
      },
      {
        card_id: 'achc_m04_prehook_intro', type: 'content', title: 'Pre-Assessment — What to Expect',
        content: PREHOOK_INTRO_CONTENT,
        narration_script: PREHOOK_INTRO_NARRATION,
        audio_path: '/training-audio/ACHC-ART-M04/l0/prehook_intro.wav', image_url: IMG.M04, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m04_prehook_q1', type: 'challenge', title: 'Pre-Assessment — Question 1',
        content: 'A patient\'s daughter texts you asking for an update on her father\'s health. The patient has not signed an authorization for his daughter. You should:',
        narration_script: 'Pre-assessment question 1. A patient\'s daughter texts you asking for an update on her father\'s health. The patient has not signed an authorization for his daughter. What should you do?',
        audio_path: '/training-audio/ACHC-ART-M04/l0/prehook_q1.wav', image_url: IMG.M04, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'Provide the update — she\'s family and presumably involved in his care', isCorrect: false, rationale: 'Family relationship does not establish authorization. Even close family members require a signed authorization or documented involvement in the care plan.' },
          { id: 'B', label: 'Neither confirm nor deny that you provide services to the patient', isCorrect: true, rationale: 'Correct. Without authorization, even confirming that someone is a patient is a PHI disclosure. The appropriate response is to neither confirm nor deny.' },
          { id: 'C', label: 'Ask her to call the office — the office can share the information', isCorrect: false, rationale: 'The office also cannot share PHI without authorization. Redirecting the inquiry does not resolve the privacy obligation.' },
          { id: 'D', label: 'Share general information about his condition since you are not sharing records', isCorrect: false, rationale: 'Verbal disclosure of health status to an unauthorized person is a HIPAA violation regardless of whether a document is shared.' },
        ],
      },
      {
        card_id: 'achc_m04_prehook_q2', type: 'challenge', title: 'Pre-Assessment — Question 2',
        content: 'The "minimum necessary" standard in HIPAA means:',
        narration_script: 'Pre-assessment question 2. What does the minimum necessary standard in HIPAA mean?',
        audio_path: '/training-audio/ACHC-ART-M04/l0/prehook_q2.wav', image_url: IMG.M04, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'The minimum number of staff members should have access to the EHR', isCorrect: false, rationale: 'While limiting access is a good practice, the minimum necessary standard specifically refers to limiting the amount of PHI used or disclosed, not just who can access the system.' },
          { id: 'B', label: 'Only the PHI necessary for the specific purpose should be accessed, used, or disclosed', isCorrect: true, rationale: 'Correct. You should access, use, or share only the PHI that is directly needed for the specific task — nothing more.' },
          { id: 'C', label: 'You must always use the minimum data fields when documenting in the EHR', isCorrect: false, rationale: 'The minimum necessary standard governs sharing and access decisions, not clinical documentation completeness requirements.' },
          { id: 'D', label: 'Patients should receive only minimal information about their own diagnosis', isCorrect: false, rationale: 'The minimum necessary standard does not restrict what patients receive about their own health. Patients have a right to full access to their own information.' },
        ],
      },
      {
        card_id: 'achc_m04_prehook_q3', type: 'challenge', title: 'Pre-Assessment — Question 3',
        content: 'You accidentally text a patient\'s medication list to the wrong phone number. This is:',
        narration_script: 'Pre-assessment question 3. You accidentally text a patient\'s medication list to the wrong phone number. What does this represent?',
        audio_path: '/training-audio/ACHC-ART-M04/l0/prehook_q3.wav', image_url: IMG.M04, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'Not a breach because it was an accident', isCorrect: false, rationale: 'HIPAA breaches do not require intent. An accidental disclosure of PHI to an unauthorized recipient is still a potential breach requiring a risk assessment.' },
          { id: 'B', label: 'A potential HIPAA breach requiring immediate supervisor notification and a breach risk assessment', isCorrect: true, rationale: 'Correct. The 60-day breach notification clock starts at the moment of discovery. Report to your Privacy Officer immediately.' },
          { id: 'C', label: 'A breach only if the recipient uses the information', isCorrect: false, rationale: 'The breach occurs at unauthorized disclosure — not at subsequent misuse. The use of the information by the recipient is irrelevant to whether a breach occurred.' },
          { id: 'D', label: 'A minor documentation error with no privacy implications', isCorrect: false, rationale: 'Sending PHI via unsecured personal SMS to an unauthorized number is a Security Rule violation and a potential Privacy Rule breach.' },
        ],
      },
      {
        card_id: 'achc_m04_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Identify the 18 PHI identifiers and explain how HIPAA protects them.\n2. Apply the minimum necessary standard to daily documentation and disclosure decisions.\n3. Describe the three permitted disclosures that do NOT require patient authorization.\n4. Implement the Security Rule field obligations for devices, documents, and communication.\n5. Execute the breach notification process when a potential breach is identified.\n6. Explain the four patient rights under HIPAA and describe how to honor them.',
        narration_script: 'Learning objectives for Module 4: HIPAA Privacy and Security. After this module you will be able to identify the 18 PHI identifiers; apply the minimum necessary standard; describe the three permitted disclosures without authorization; implement Security Rule field obligations; execute the breach notification process; and explain the four patient rights under HIPAA.',
        audio_path: '/training-audio/ACHC-ART-M04/l0/objectives.wav', image_url: IMG.M04, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m04_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'PHI (Protected Health Information) — Any information that can identify a patient and relates to their health, care, or payment. 18 identifiers.\n\nMinimum Necessary — Use or disclose only the PHI needed for the specific task. Nothing more.\n\nPermitted Disclosures — Treatment, Payment, and Healthcare Operations are the three permitted without authorization.\n\nHIPAA Security Rule — Governs electronic PHI (ePHI). Requires administrative, physical, and technical safeguards.\n\nBreach — Unauthorized access, use, or disclosure of unsecured PHI. Report immediately upon discovery.\n\n60-Day Rule — Agency has 60 calendar days from discovery to notify affected individuals and HHS.\n\nPatient Rights — Access records, request corrections, accounting of disclosures, and request restrictions.',
        narration_script: 'Seven key terms. PHI: any information that can identify a patient related to their health, care, or payment — 18 identifiers. Minimum Necessary: use or share only what is needed for the specific task. Permitted Disclosures: treatment, payment, and healthcare operations are the three uses that do not require authorization. Security Rule: governs electronic PHI — requires administrative, physical, and technical safeguards. Breach: unauthorized access, use, or disclosure of unsecured PHI — report immediately. 60-Day Rule: agency has 60 calendar days from discovery to notify patients and HHS. Patient Rights: access, correction, accounting of disclosures, and restriction requests.',
        audio_path: '/training-audio/ACHC-ART-M04/l0/concepts.wav', image_url: IMG.M04, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  /* ══════════════════════════════ M05 Infection Control ══════════════════════════════ */
  {
    lesson_id: 'achc_m05_l0_v2', topic_id: 'ACHC-ART-M05', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m05_splash', type: 'splash', title: 'Infection Control & Standard Precautions',
        content: 'M05 of 12 | 3 Lessons | Pre-Assessment | Final Competency Exam\nEstimated time: 45 minutes\n\nInfection control in home health starts and ends with you. You carry your clinical bag between homes, you manage sharps without engineered safety infrastructure, and your patients are immunocompromised. This module covers Standard Precautions, PPE selection, the 5 Moments of Hand Hygiene, bag technique, transmission-based precautions, and post-exposure protocols.',
        narration_script: '', audio_path: '', image_url: IMG.M05, estimated_duration: '0:00', completion_required: false,
      },
      {
        card_id: 'achc_m05_prehook_intro', type: 'content', title: 'Pre-Assessment — What to Expect',
        content: PREHOOK_INTRO_CONTENT,
        narration_script: PREHOOK_INTRO_NARRATION,
        audio_path: '/training-audio/ACHC-ART-M05/l0/prehook_intro.wav', image_url: IMG.M05, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m05_prehook_q1', type: 'challenge', title: 'Pre-Assessment — Question 1',
        content: 'Standard Precautions apply to:',
        narration_script: 'Pre-assessment question 1. Standard Precautions apply to which patients?',
        audio_path: '/training-audio/ACHC-ART-M05/l0/prehook_q1.wav', image_url: IMG.M05, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'Only patients with known bloodborne infections', isCorrect: false, rationale: 'This is the dangerous misconception Standard Precautions were designed to eliminate. Many infected patients have no known diagnosis at the time of care.' },
          { id: 'B', label: 'All patients at all times regardless of diagnosis or known infection status', isCorrect: true, rationale: 'Correct. Standard Precautions assume every patient is potentially infectious. Known status — or lack thereof — is irrelevant.' },
          { id: 'C', label: 'Only when visible blood or body fluids are present', isCorrect: false, rationale: 'Many bloodborne pathogens are transmitted without visible blood. Waiting for visible blood before applying precautions creates exposure risk.' },
          { id: 'D', label: 'Only during invasive procedures', isCorrect: false, rationale: 'Standard Precautions apply to all patient contact, not just invasive procedures. Patient surroundings can also harbor pathogens.' },
        ],
      },
      {
        card_id: 'achc_m05_prehook_q2', type: 'challenge', title: 'Pre-Assessment — Question 2',
        content: 'Alcohol-based hand rub (ABHR) is NOT effective against which organisms and requires soap and water instead?',
        narration_script: 'Pre-assessment question 2. Alcohol-based hand rub is not effective against which organisms, requiring soap and water instead?',
        audio_path: '/training-audio/ACHC-ART-M05/l0/prehook_q2.wav', image_url: IMG.M05, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'MRSA and VRE', isCorrect: false, rationale: 'ABHR is effective against MRSA and VRE. These are bacteria without protective spores.' },
          { id: 'B', label: 'C. difficile spores and norovirus', isCorrect: true, rationale: 'Correct. C. diff produces spores that alcohol cannot penetrate, and norovirus has specific structural properties that resist ABHR. Soap and water is required for both.' },
          { id: 'C', label: 'HIV and HCV', isCorrect: false, rationale: 'ABHR is effective against bloodborne viruses including HIV and HCV. The exception is spore-forming organisms and certain non-enveloped viruses.' },
          { id: 'D', label: 'Influenza and COVID-19', isCorrect: false, rationale: 'ABHR is effective against respiratory viruses including influenza and SARS-CoV-2. Soap and water is also effective for these.' },
        ],
      },
      {
        card_id: 'achc_m05_prehook_q3', type: 'challenge', title: 'Pre-Assessment — Question 3',
        content: 'Contact precautions (beyond Standard Precautions) require which ADDITIONAL PPE?',
        narration_script: 'Pre-assessment question 3. Contact precautions, in addition to standard precautions, require which additional PPE?',
        audio_path: '/training-audio/ACHC-ART-M05/l0/prehook_q3.wav', image_url: IMG.M05, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'N95 respirator and eye protection', isCorrect: false, rationale: 'N95 and eye protection are for airborne and droplet precautions respectively. Contact precautions address surface and direct contact transmission.' },
          { id: 'B', label: 'Gown and gloves for all contact with the patient and their environment', isCorrect: true, rationale: 'Correct. Contact precautions require a gown and gloves for all contact with the patient and their immediate surroundings — including bed rails, bedside table, and wound supplies.' },
          { id: 'C', label: 'Surgical mask only', isCorrect: false, rationale: 'A surgical mask addresses droplet transmission. Contact precautions require gown and gloves for environmental and direct contact exposure.' },
          { id: 'D', label: 'No additional PPE — Standard Precautions are sufficient', isCorrect: false, rationale: 'Contact precautions are transmission-based precautions added ON TOP OF Standard Precautions when a patient has a confirmed contact-transmitted pathogen (e.g., MRSA, C. diff, VRE).' },
        ],
      },
      {
        card_id: 'achc_m05_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Apply Standard Precautions to all patient interactions regardless of known diagnosis.\n2. Execute the 5 Moments of Hand Hygiene correctly and explain when ABHR is insufficient.\n3. Select appropriate PPE based on procedure type and transmission risk.\n4. Demonstrate proper bag technique to prevent cross-contamination between patients.\n5. Apply transmission-based precautions (contact, droplet, airborne) for common home health pathogens.\n6. Execute the post-exposure protocol for needlestick and splash injuries within the correct time window.',
        narration_script: 'Learning objectives for Module 5: Infection Control and Standard Precautions. After this module you will be able to apply Standard Precautions to all patient interactions; execute the 5 Moments of Hand Hygiene and know when ABHR is insufficient; select appropriate PPE by procedure; demonstrate proper bag technique; apply transmission-based precautions; and execute the post-exposure protocol within the correct time window.',
        audio_path: '/training-audio/ACHC-ART-M05/l0/objectives.wav', image_url: IMG.M05, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m05_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Standard Precautions — Treat ALL patients as potentially infectious at ALL times. Not selective.\n\n5 Moments of Hand Hygiene — Before patient touch, before aseptic procedure, after body fluid risk, after patient touch, after touching patient surroundings.\n\nTransmission-Based Precautions — Added ON TOP of Standard Precautions: Contact (gown/gloves), Droplet (surgical mask), Airborne (N95).\n\nBag Technique — Clinical bag on disposable barrier, closed when not in use, hands cleaned before/after access.\n\nPost-Exposure Protocol — Wash → Report → Medical Evaluation (within 2 hrs) → Document.\n\nABHR — Alcohol-Based Hand Rub. Effective for most organisms. NOT effective for C. diff spores or norovirus.\n\nPPE Doffing Order — Gloves → Gown → Mask/Eye Protection → Hand Hygiene.',
        narration_script: 'Seven key terms. Standard Precautions: treat all patients as potentially infectious at all times. Five Moments of Hand Hygiene: before patient touch, before aseptic procedure, after body fluid risk, after patient touch, and after touching patient surroundings. Transmission-Based Precautions: contact, droplet, and airborne — added on top of Standard Precautions. Bag Technique: bag on disposable barrier, closed when not in use, hands cleaned before and after. Post-Exposure Protocol: wash, report, medical evaluation within two hours, document. ABHR: not effective against C. diff spores or norovirus. PPE Doffing Order: gloves, gown, mask and eye protection, then hand hygiene.',
        audio_path: '/training-audio/ACHC-ART-M05/l0/concepts.wav', image_url: IMG.M05, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  /* ══════════════════════════════ M06 Communication Barriers ══════════════════════════════ */
  {
    lesson_id: 'achc_m06_l0_v2', topic_id: 'ACHC-ART-M06', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m06_splash', type: 'splash', title: 'Communication Barriers & Health Literacy',
        content: 'M06 of 12 | 3 Lessons | Pre-Assessment | Final Competency Exam\nEstimated time: 45 minutes\n\n36% of American adults have basic or below-basic health literacy. In home health, that rate is significantly higher. This module covers the seven communication barrier categories, teach-back technique, plain language principles, and your legal obligations under Title VI for language access services.',
        narration_script: '', audio_path: '', image_url: IMG.M06, estimated_duration: '0:00', completion_required: false,
      },
      {
        card_id: 'achc_m06_prehook_intro', type: 'content', title: 'Pre-Assessment — What to Expect',
        content: PREHOOK_INTRO_CONTENT,
        narration_script: PREHOOK_INTRO_NARRATION,
        audio_path: '/training-audio/ACHC-ART-M06/l0/prehook_intro.wav', image_url: IMG.M06, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m06_prehook_q1', type: 'challenge', title: 'Pre-Assessment — Question 1',
        content: 'A patient\'s adult son offers to interpret for medication teaching since his mother speaks no English. You should:',
        narration_script: 'Pre-assessment question 1. A patient\'s adult son offers to interpret for medication teaching since his mother speaks no English. What should you do?',
        audio_path: '/training-audio/ACHC-ART-M06/l0/prehook_q1.wav', image_url: IMG.M06, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'Accept — he knows his mother and it will save time', isCorrect: false, rationale: 'Family members routinely omit, soften, or alter clinical information — often protectively. This creates medication safety risks and violates language access standards.' },
          { id: 'B', label: 'Request a qualified medical interpreter — family members cannot interpret clinical content', isCorrect: true, rationale: 'Correct. Under Title VI, patients with LEP have a federal right to qualified interpreter services at no cost. Family members cannot interpret for clinical content including medication instructions.' },
          { id: 'C', label: 'Use a translation app on your phone for the key points', isCorrect: false, rationale: 'Consumer translation apps are not validated for medical accuracy and do not satisfy the Title VI requirement for qualified interpretation.' },
          { id: 'D', label: 'Proceed without an interpreter and use simple gestures', isCorrect: false, rationale: 'Medication teaching without language access services creates serious patient safety risk and violates federal law.' },
        ],
      },
      {
        card_id: 'achc_m06_prehook_q2', type: 'challenge', title: 'Pre-Assessment — Question 2',
        content: 'Teach-back is BEST described as:',
        narration_script: 'Pre-assessment question 2. Teach-back is best described as which of the following?',
        audio_path: '/training-audio/ACHC-ART-M06/l0/prehook_q2.wav', image_url: IMG.M06, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'Asking the patient "Do you have any questions?" after instruction', isCorrect: false, rationale: '"Any questions?" is not teach-back. Patients with low health literacy rarely ask questions when they don\'t understand — they tend to stay quiet to avoid embarrassment.' },
          { id: 'B', label: 'Asking the patient to explain or demonstrate in their own words what you just taught them', isCorrect: true, rationale: 'Correct. Teach-back requires the patient to actively recall and demonstrate — not just confirm. This is the only evidence-based method to verify comprehension, not just delivery.' },
          { id: 'C', label: 'Repeating the same information in a louder voice for clarity', isCorrect: false, rationale: 'Speaking louder does not improve comprehension. Teach-back is about confirming understanding through patient demonstration, not repetition.' },
          { id: 'D', label: 'Providing written instructions after a verbal explanation', isCorrect: false, rationale: 'Written materials support teaching but are not teach-back. Teach-back specifically involves the patient demonstrating what they understood.' },
        ],
      },
      {
        card_id: 'achc_m06_prehook_q3', type: 'challenge', title: 'Pre-Assessment — Question 3',
        content: 'Approximately what percentage of American adults have basic or below-basic health literacy?',
        narration_script: 'Pre-assessment question 3. Approximately what percentage of American adults have basic or below-basic health literacy?',
        audio_path: '/training-audio/ACHC-ART-M06/l0/prehook_q3.wav', image_url: IMG.M06, estimated_duration: '0:25', completion_required: true,
        options: [
          { id: 'A', label: 'About 5–10%', isCorrect: false, rationale: 'Low health literacy is far more prevalent than most clinicians assume.' },
          { id: 'B', label: 'About 15–20%', isCorrect: false, rationale: 'Still significantly underestimates the true prevalence of low health literacy in the US.' },
          { id: 'C', label: 'About 36% — more than one in three adults', isCorrect: true, rationale: 'Correct. National Assessment of Adult Literacy data shows approximately 36% of US adults have basic or below-basic health literacy. In home health populations, rates are typically higher.' },
          { id: 'D', label: 'About 60%', isCorrect: false, rationale: 'While the number is high, 36% is the documented figure — still more than enough to require plain language and teach-back as a universal standard.' },
        ],
      },
      {
        card_id: 'achc_m06_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Identify the seven categories of communication barriers in home health.\n2. Apply teach-back technique correctly using the five-step framework.\n3. Use plain language principles in verbal and written patient communication.\n4. Explain the federal Title VI right to language access services for LEP patients.\n5. Adapt communication strategies for patients with cognitive, sensory, or emotional barriers.\n6. Document education attempts and outcomes accurately including barriers encountered.',
        narration_script: 'Learning objectives for Module 6: Communication Barriers and Health Literacy. After this module you will be able to identify the seven categories of communication barriers; apply teach-back using the five-step framework; use plain language in patient communication; explain the Title VI right to language access; adapt communication for patients with cognitive, sensory, or emotional barriers; and document education attempts and outcomes accurately.',
        audio_path: '/training-audio/ACHC-ART-M06/l0/objectives.wav', image_url: IMG.M06, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m06_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Health Literacy — Ability to obtain, process, and act on health information to make decisions. Not the same as education level.\n\nTeach-Back — Asking patients to explain or demonstrate what was taught. Only validated method for confirming comprehension.\n\nPlain Language — Writing/speaking at a 5th–6th grade reading level; one concept at a time; active voice.\n\nTitle VI — Federal law requiring language access services for patients with LEP at no cost.\n\nLEP — Limited English Proficiency. Cannot use family members to interpret clinical content.\n\nSeven Barrier Categories — Language, physical, gender, cultural, emotional, perceptual, interpersonal.\n\nCognitive Impairment — Reduced capacity to process information. Requires simplified teaching, caregiver involvement, and capacity assessment.',
        narration_script: 'Seven key terms. Health Literacy: ability to obtain, process, and act on health information — not the same as education level. Teach-Back: asking patients to explain or demonstrate what was taught — the only validated comprehension method. Plain Language: fifth to sixth grade reading level, one concept at a time, active voice. Title VI: federal law requiring language access services for LEP patients at no cost. LEP: Limited English Proficiency — family cannot interpret clinical content. Seven Barrier Categories: language, physical, gender, cultural, emotional, perceptual, and interpersonal. Cognitive Impairment: requires simplified teaching, caregiver involvement, and capacity assessment.',
        audio_path: '/training-audio/ACHC-ART-M06/l0/concepts.wav', image_url: IMG.M06, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  /* ══════════════════════════════ M07 Workplace & Patient Safety / OSHA ══════════════════════════════ */
  {
    lesson_id: 'achc_m07_l0_v2', topic_id: 'ACHC-ART-M07', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m07_splash', type: 'splash', title: 'Workplace & Patient Safety (OSHA)',
        content: 'M07 of 12 | 3 Lessons | Pre-Assessment | Final Competency Exam\nEstimated time: 45 minutes\n\nA patient\'s home is your workplace when you are in it, and OSHA protections follow you inside. This module covers your four OSHA rights, GHS/SDS chemical safety, incident and near-miss reporting, medical device event reporting (MDR), workplace violence prevention, and patient home safety assessment.',
        narration_script: '', audio_path: '', image_url: IMG.M07, estimated_duration: '0:00', completion_required: false,
      },
      {
        card_id: 'achc_m07_prehook_intro', type: 'content', title: 'Pre-Assessment — What to Expect',
        content: PREHOOK_INTRO_CONTENT,
        narration_script: PREHOOK_INTRO_NARRATION,
        audio_path: '/training-audio/ACHC-ART-M07/l0/prehook_intro.wav', image_url: IMG.M07, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m07_prehook_q1', type: 'challenge', title: 'Pre-Assessment — Question 1',
        content: 'You arrive at a patient\'s home and observe an obvious hazard — loose electrical cords across the walkway. The CORRECT approach is:',
        narration_script: 'Pre-assessment question 1. You arrive at a patient\'s home and observe loose electrical cords across the walkway — an obvious hazard. What is the correct approach?',
        audio_path: '/training-audio/ACHC-ART-M07/l0/prehook_q1.wav', image_url: IMG.M07, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'Walk carefully around the hazard and document it in your visit note', isCorrect: false, rationale: 'Documenting without addressing the hazard or escalating leaves both you and the patient at risk. Documentation alone is insufficient.' },
          { id: 'B', label: 'Complete patient assessment, address immediate safety risks within scope, educate the patient/caregiver, and escalate to supervisor if not remediated', isCorrect: true, rationale: 'Correct. Address what you can within scope, educate the household, document the hazard, and escalate if the environment remains unsafe after education.' },
          { id: 'C', label: 'Refuse to enter until the hazard is removed', isCorrect: false, rationale: 'Refusing entry without patient contact or escalation is not appropriate. Address the hazard systematically while still meeting patient care obligations.' },
          { id: 'D', label: 'Call APS immediately before attempting to address it with the patient', isCorrect: false, rationale: 'An accidental hazard in the home is not an automatic APS referral. Assess, educate, and escalate through the Agency — APS is for abuse and neglect concerns.' },
        ],
      },
      {
        card_id: 'achc_m07_prehook_q2', type: 'challenge', title: 'Pre-Assessment — Question 2',
        content: 'Under OSHA, home health field workers have the right to:',
        narration_script: 'Pre-assessment question 2. Under OSHA, home health field workers have which of the following rights?',
        audio_path: '/training-audio/ACHC-ART-M07/l0/prehook_q2.wav', image_url: IMG.M07, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'Refuse any patient visit they personally find difficult or uncomfortable', isCorrect: false, rationale: 'OSHA\'s right to refuse work applies specifically to situations of imminent serious danger — not personal discomfort or clinical difficulty.' },
          { id: 'B', label: 'Refuse work that poses imminent serious danger without fear of retaliation', isCorrect: true, rationale: 'Correct. OSHA grants workers the right to refuse work when they face an imminent, serious danger — and to report concerns directly to OSHA without employer retaliation.' },
          { id: 'C', label: 'Report OSHA violations only through the Agency, not directly to OSHA', isCorrect: false, rationale: 'Workers can file complaints directly and confidentially with OSHA. They do not have to go through their employer.' },
          { id: 'D', label: 'Request hazard pay for high-acuity patient home environments', isCorrect: false, rationale: 'OSHA rights include a safe workplace, information access, and the right to refuse imminent danger — not hazard pay provisions.' },
        ],
      },
      {
        card_id: 'achc_m07_prehook_q3', type: 'challenge', title: 'Pre-Assessment — Question 3',
        content: 'SDS Section 8 provides:',
        narration_script: 'Pre-assessment question 3. What information does SDS Section 8 provide?',
        audio_path: '/training-audio/ACHC-ART-M07/l0/prehook_q3.wav', image_url: IMG.M07, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'Emergency contact numbers for the chemical manufacturer', isCorrect: false, rationale: 'Emergency contacts are in Section 1 of the SDS. Section 8 focuses on worker exposure controls.' },
          { id: 'B', label: 'Physical and chemical properties of the substance', isCorrect: false, rationale: 'Physical and chemical properties are in Section 9. Section 8 is the practical worker protection reference.' },
          { id: 'C', label: 'Required PPE and occupational exposure limits', isCorrect: true, rationale: 'Correct. SDS Section 8 — Exposure Controls/Personal Protection — specifies the PPE type, glove material, respiratory protection level, and permissible exposure limits.' },
          { id: 'D', label: 'Transport and shipping classifications', isCorrect: false, rationale: 'Transport classifications are in Section 14. Section 8 is where you find field worker PPE requirements.' },
        ],
      },
      {
        card_id: 'achc_m07_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Describe your four OSHA rights and explain when each applies in the field.\n2. Read a GHS label and Safety Data Sheet, and apply Section 8 PPE requirements.\n3. Complete an incident report for workplace injuries and near-miss events before end of shift.\n4. Apply the patient home safety assessment framework to identify and address environmental hazards.\n5. Describe the MDR reporting obligation and your role in the 5-step reporting chain.\n6. Apply workplace violence prevention strategies including pre-visit risk assessment and de-escalation.',
        narration_script: 'Learning objectives for Module 7: Workplace and Patient Safety. After this module you will be able to describe your four OSHA rights; read a GHS label and SDS Section 8; complete incident reports for injuries and near-misses; apply the home safety assessment framework; describe the MDR reporting obligation; and apply workplace violence prevention strategies.',
        audio_path: '/training-audio/ACHC-ART-M07/l0/objectives.wav', image_url: IMG.M07, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m07_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'OSHA General Duty Clause — Employer must provide a workplace free from recognized hazards. Applies to patient homes.\n\nGHS — Globally Harmonized System for chemical hazard communication. 9 pictograms, standardized labels.\n\nSDS — Safety Data Sheet. 16 sections. Section 8 = PPE requirements and exposure limits.\n\nNear-Miss — Event that almost caused harm but didn\'t. Report using the incident report system. Equally important to actual injuries.\n\nMDR — Medical Device Report. Required when a device may have caused or contributed to patient death or serious injury. 10-working-day deadline.\n\nEngineering Controls — Primary hazard prevention (e.g., needleless systems). OSHA hierarchy: Engineering > Work Practice > PPE.\n\nWorkplace Violence — Physical, verbal, or threatening behavior directed at a worker. Require pre-visit risk assessment and documentation.',
        narration_script: 'Seven key terms. OSHA General Duty Clause: employer must provide a hazard-free workplace — this applies in patient homes. GHS: Globally Harmonized System with 9 chemical hazard pictograms. SDS Section 8: PPE requirements and exposure limits. Near-Miss: almost caused harm but didn\'t — report it just like an actual injury. MDR: Medical Device Report required within 10 working days when a device may have caused death or serious injury. Engineering Controls: OSHA\'s primary prevention level — above work practice controls and PPE. Workplace Violence: physical, verbal, or threatening behavior — requires pre-visit risk assessment.',
        audio_path: '/training-audio/ACHC-ART-M07/l0/concepts.wav', image_url: IMG.M07, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  /* ══════════════════════════════ M08 Patient Rights & Responsibilities ══════════════════════════════ */
  {
    lesson_id: 'achc_m08_l0_v2', topic_id: 'ACHC-ART-M08', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m08_splash', type: 'splash', title: 'Patient Rights & Responsibilities',
        content: 'M08 of 12 | 3 Lessons | Pre-Assessment | Final Competency Exam\nEstimated time: 45 minutes\n\nPatient rights are not aspirational — they are legally enforceable under 42 CFR 484.50. Every field visit is an opportunity to uphold or violate them. This module covers the 7 core patient rights, advance directives, mandatory reporting for abuse, neglect and exploitation, and informed consent in the home health setting.',
        narration_script: '', audio_path: '', image_url: IMG.M08, estimated_duration: '0:00', completion_required: false,
      },
      {
        card_id: 'achc_m08_prehook_intro', type: 'content', title: 'Pre-Assessment — What to Expect',
        content: PREHOOK_INTRO_CONTENT,
        narration_script: PREHOOK_INTRO_NARRATION,
        audio_path: '/training-audio/ACHC-ART-M08/l0/prehook_intro.wav', image_url: IMG.M08, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m08_prehook_q1', type: 'challenge', title: 'Pre-Assessment — Question 1',
        content: 'A competent adult patient refuses wound irrigation for today\'s visit. The CORRECT action is:',
        narration_script: 'Pre-assessment question 1. A competent adult patient refuses wound irrigation for today\'s visit. What is the correct action?',
        audio_path: '/training-audio/ACHC-ART-M08/l0/prehook_q1.wav', image_url: IMG.M08, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'Perform it anyway because it is medically necessary', isCorrect: false, rationale: 'Performing care on a competent patient without consent is legally battery regardless of medical necessity. Competent patients have an absolute right to refuse.' },
          { id: 'B', label: 'Respect the refusal, document it, ensure the patient understands the risks, and notify the physician', isCorrect: true, rationale: 'Correct. Document the refusal clearly, counsel about risks, obtain a signed informed refusal if possible, and notify the supervising clinician. This is the correct response to a competent refusal.' },
          { id: 'C', label: 'Discharge the patient from service for non-compliance', isCorrect: false, rationale: 'Exercising patient rights is not non-compliance. Discharge for refusing a specific procedure violates patient rights.' },
          { id: 'D', label: 'Ask the family to convince the patient before your next visit', isCorrect: false, rationale: 'Involving family to override a competent patient\'s refusal is a patient autonomy violation. Counseling should come from the care team, not through social pressure.' },
        ],
      },
      {
        card_id: 'achc_m08_prehook_q2', type: 'challenge', title: 'Pre-Assessment — Question 2',
        content: 'A valid DNR order (Do Not Resuscitate) must be:',
        narration_script: 'Pre-assessment question 2. A valid DNR order must meet which of the following criteria?',
        audio_path: '/training-audio/ACHC-ART-M08/l0/prehook_q2.wav', image_url: IMG.M08, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'Verbally stated by the patient at any prior visit', isCorrect: false, rationale: 'A verbal statement is not a valid DNR. A signed, physician-ordered document is required for it to be legally enforceable.' },
          { id: 'B', label: 'Written, physician-signed, and accessible at the point of care', isCorrect: true, rationale: 'Correct. A DNR must be a written, physician-signed order that is physically present and accessible. Verbal statements and electronic-only records are insufficient at the point of care.' },
          { id: 'C', label: 'Re-confirmed by the patient at each visit', isCorrect: false, rationale: 'A valid advance directive does not expire or require re-confirmation at every visit. It remains in effect until the patient revokes it in writing.' },
          { id: 'D', label: 'Approved by the patient\'s family before it can be honored', isCorrect: false, rationale: 'Family approval is not required. A valid DNR reflects the patient\'s own competent decision. Family cannot override it.' },
        ],
      },
      {
        card_id: 'achc_m08_prehook_q3', type: 'challenge', title: 'Pre-Assessment — Question 3',
        content: 'As a home health worker, your threshold for mandatory reporting of suspected elder abuse is:',
        narration_script: 'Pre-assessment question 3. As a home health worker, what is the threshold for mandatory reporting of suspected elder abuse?',
        audio_path: '/training-audio/ACHC-ART-M08/l0/prehook_q3.wav', image_url: IMG.M08, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'Confirmed evidence of abuse', isCorrect: false, rationale: 'Waiting for confirmation before reporting is not the legal standard. Mandatory reporters are required to report on reasonable suspicion — not confirmed proof.' },
          { id: 'B', label: 'Reasonable suspicion — not confirmed proof', isCorrect: true, rationale: 'Correct. In all 50 states, mandatory reporters including home health workers must report when they have reasonable suspicion of abuse. Investigation is the responsibility of adult protective services, not the reporter.' },
          { id: 'C', label: 'Patient disclosure to you directly', isCorrect: false, rationale: 'Patient disclosure strengthens the case but is not required. Physical indicators, behavioral signs, and pattern observations also meet the reasonable suspicion threshold.' },
          { id: 'D', label: 'Three or more independent observations consistent with abuse', isCorrect: false, rationale: 'There is no minimum observation count in the law. One observation creating reasonable suspicion is sufficient and legally obligates reporting.' },
        ],
      },
      {
        card_id: 'achc_m08_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Identify the 7 core patient rights in home health and describe how each applies to a field visit.\n2. Explain informed consent and describe the difference between consent and informed consent.\n3. Identify the four types of advance directives and describe your obligation to honor each.\n4. Respond correctly when a family member attempts to override a valid advance directive.\n5. Recognize physical, emotional, sexual, and financial abuse and neglect indicators.\n6. Apply the mandatory reporting protocol including the suspicion threshold and reporting timeline.',
        narration_script: 'Learning objectives for Module 8: Patient Rights and Responsibilities. After this module you will be able to identify the seven core patient rights; explain informed consent; identify the four types of advance directives; respond correctly when a family member attempts to override a directive; recognize abuse indicators; and apply the mandatory reporting protocol.',
        audio_path: '/training-audio/ACHC-ART-M08/l0/objectives.wav', image_url: IMG.M08, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m08_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Patient Bill of Rights — Legally enforceable under 42 CFR 484.50. Provided at admission and on request.\n\nInformed Consent — Complete disclosure of risks, benefits, and alternatives BEFORE agreeing to treatment. Signature alone ≠ informed consent.\n\nAdvance Directive — Legal document for end-of-life care wishes: DNR, POLST, Living Will, Healthcare POA.\n\nDNR — Do Not Resuscitate. Must be physician-signed, written, and physically present at point of care.\n\nHealthcare Proxy/POA — Person designated to make medical decisions when the patient cannot speak. Must follow patient\'s KNOWN wishes.\n\nMandatory Reporter — Home health workers are mandatory reporters in all 50 states. Report suspected abuse to APS.\n\nAPS — Adult Protective Services. Investigates elder abuse and dependent adult exploitation allegations.',
        narration_script: 'Seven key terms. Patient Bill of Rights: legally enforceable under 42 CFR 484.50, provided at admission. Informed Consent: complete disclosure before treatment — a signature alone is not sufficient. Advance Directive: legal document for end-of-life wishes — DNR, POLST, Living Will, and Healthcare POA. DNR: physician-signed, written, and physically present at the point of care. Healthcare Proxy: designated to make decisions when the patient cannot speak — must follow the patient\'s known wishes. Mandatory Reporter: home health workers are mandatory reporters in all 50 states. APS: Adult Protective Services investigates elder abuse allegations.',
        audio_path: '/training-audio/ACHC-ART-M08/l0/concepts.wav', image_url: IMG.M08, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  /* ══════════════════════════════ M09 Corporate Compliance ══════════════════════════════ */
  {
    lesson_id: 'achc_m09_l0_v2', topic_id: 'ACHC-ART-M09', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m09_splash', type: 'splash', title: 'Corporate Compliance Program',
        content: 'M09 of 12 | 3 Lessons | Pre-Assessment | Final Competency Exam\nEstimated time: 45 minutes\n\nYour documentation directly supports every Medicare and Medicaid billing claim the Agency submits. A single inaccurate time entry or unsigned note can become a federal fraud exposure. This module covers the False Claims Act, the 7 elements of an effective compliance program, whistleblower protection, and Anti-Kickback Statute obligations.',
        narration_script: '', audio_path: '', image_url: IMG.M09, estimated_duration: '0:00', completion_required: false,
      },
      {
        card_id: 'achc_m09_prehook_intro', type: 'content', title: 'Pre-Assessment — What to Expect',
        content: PREHOOK_INTRO_CONTENT,
        narration_script: PREHOOK_INTRO_NARRATION,
        audio_path: '/training-audio/ACHC-ART-M09/l0/prehook_intro.wav', image_url: IMG.M09, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m09_prehook_q1', type: 'challenge', title: 'Pre-Assessment — Question 1',
        content: 'A coworker says: "I always round up my visit time by 10 minutes. Everyone does it — the company bills more and nobody checks." This MOST accurately represents:',
        narration_script: 'Pre-assessment question 1. A coworker says she always rounds up visit time by ten minutes — everyone does it, nobody checks. What does this most accurately represent?',
        audio_path: '/training-audio/ACHC-ART-M09/l0/prehook_q1.wav', image_url: IMG.M09, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'A harmless shortcut that is common in the industry', isCorrect: false, rationale: '"Everyone does it" has never been a successful defense in a federal fraud prosecution. Common practice does not make something legal.' },
          { id: 'B', label: 'Potential federal healthcare fraud — falsifying documentation supporting Medicare billing', isCorrect: true, rationale: 'Correct. Documentation of visit time directly supports billing claims to Medicare. Falsifying that documentation — regardless of intent — is potential False Claims Act fraud.' },
          { id: 'C', label: 'A minor policy violation that only HR would care about', isCorrect: false, rationale: 'Federal fraud charges are not HR matters. The False Claims Act creates individual criminal liability with potential imprisonment.' },
          { id: 'D', label: 'Acceptable because the patient still received care', isCorrect: false, rationale: 'The medical necessity of the care does not authorize falsifying the time. Billing accuracy is independent of care delivery.' },
        ],
      },
      {
        card_id: 'achc_m09_prehook_q2', type: 'challenge', title: 'Pre-Assessment — Question 2',
        content: 'The Whistleblower Protection Act means:',
        narration_script: 'Pre-assessment question 2. What does the Whistleblower Protection Act mean for you as a healthcare worker?',
        audio_path: '/training-audio/ACHC-ART-M09/l0/prehook_q2.wav', image_url: IMG.M09, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'You receive a financial reward every time you report a compliance concern', isCorrect: false, rationale: 'Financial rewards (qui tam) are available in specific False Claims Act cases that lead to successful government recovery — not for every compliance report.' },
          { id: 'B', label: 'You cannot be fired, demoted, or retaliated against for reporting fraud, waste, or abuse in good faith', isCorrect: true, rationale: 'Correct. The Whistleblower Protection Act provides federal anti-retaliation protection. Retaliation for good-faith reporting is itself a federal violation.' },
          { id: 'C', label: 'Reports are only protected if submitted anonymously', isCorrect: false, rationale: 'Whistleblower protection applies to both identified and anonymous reporters. Named reporters are protected from retaliation.' },
          { id: 'D', label: 'Protection applies only to reports made directly to the OIG, not internal reports', isCorrect: false, rationale: 'Internal reports through the Compliance Officer or hotline are also protected. The protection is not limited to OIG external reporting.' },
        ],
      },
      {
        card_id: 'achc_m09_prehook_q3', type: 'challenge', title: 'Pre-Assessment — Question 3',
        content: 'A DME vendor offers your Agency a $50 gift card for each patient you refer for hospital beds. This represents:',
        narration_script: 'Pre-assessment question 3. A DME vendor offers your Agency a $50 gift card for each patient you refer for hospital beds. What does this represent?',
        audio_path: '/training-audio/ACHC-ART-M09/l0/prehook_q3.wav', image_url: IMG.M09, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'An acceptable business relationship — gift cards under $100 are a common courtesy', isCorrect: false, rationale: 'There is no safe harbor dollar amount in the Anti-Kickback Statute. Anything of value exchanged for referrals is potentially illegal regardless of the amount.' },
          { id: 'B', label: 'A potential Anti-Kickback Statute violation — exchanging anything of value for patient referrals to a Medicare-participating provider is illegal', isCorrect: true, rationale: 'Correct. The Anti-Kickback Statute prohibits offering, paying, soliciting, or receiving anything of value to induce or reward referrals. No minimum dollar threshold.' },
          { id: 'C', label: 'Acceptable as long as the patients actually need the equipment', isCorrect: false, rationale: 'Medical necessity of the referral is completely irrelevant to whether the kickback arrangement is illegal.' },
          { id: 'D', label: 'Only problematic if it involves cash rather than gift cards', isCorrect: false, rationale: 'The form of payment does not matter — gift cards, meals, free equipment, and any other "thing of value" all qualify under the statute.' },
        ],
      },
      {
        card_id: 'achc_m09_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Define corporate compliance and explain why all healthcare organizations require a compliance program.\n2. Identify the 7 minimum elements of an effective compliance program.\n3. Explain the False Claims Act penalties and how your daily documentation creates federal billing attestations.\n4. Describe the Whistleblower Protection Act and how to access reporting channels safely.\n5. Recognize common compliance risks in field activities including documentation, billing, and referrals.\n6. Apply the Anti-Kickback Statute to everyday vendor and referral source interactions.',
        narration_script: 'Learning objectives for Module 9: Corporate Compliance. After this module you will be able to define corporate compliance and explain why it is required; identify the seven minimum elements of an effective program; explain False Claims Act penalties and how documentation creates billing attestations; describe whistleblower protection and reporting channels; recognize compliance risks in field activities; and apply the Anti-Kickback Statute to vendor interactions.',
        audio_path: '/training-audio/ACHC-ART-M09/l0/objectives.wav', image_url: IMG.M09, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m09_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'False Claims Act (FCA) — Federal liability for submitting false claims to government programs. Individual criminal penalties: $11,000–$26,000 per claim + treble damages + imprisonment.\n\nAnti-Kickback Statute — Prohibits anything of value exchanged for patient referrals. No minimum dollar threshold.\n\nWhistleblower Protection Act — Federal protection against retaliation for reporting fraud, waste, or abuse.\n\n7 OIG Elements — Written policies, Compliance Officer, training, open communication, auditing, disciplinary guidelines, prompt corrective action.\n\nOrganizational Sentencing Guidelines — Federal guidelines that reduce penalties for organizations with effective compliance programs.\n\nCorporate Probation — Government-imposed compliance program for organizations without their own. Far more restrictive and expensive.\n\nOIG Fraud Hotline — 1-800-HHS-TIPS. External reporting channel with federal whistleblower protection.',
        narration_script: 'Seven key terms. False Claims Act: federal liability for false claims to government programs — $11,000 to $26,000 per claim plus treble damages and potential imprisonment. Anti-Kickback Statute: prohibits anything of value for patient referrals — no minimum dollar threshold. Whistleblower Protection Act: federal protection against retaliation for reporting fraud, waste, or abuse. 7 OIG Elements: written policies, compliance officer, training, open communication, auditing, disciplinary guidelines, and prompt corrective action. Organizational Sentencing Guidelines: reduce penalties for organizations with effective programs. Corporate Probation: government-imposed compliance program for organizations without their own. OIG Fraud Hotline: 1-800-HHS-TIPS.',
        audio_path: '/training-audio/ACHC-ART-M09/l0/concepts.wav', image_url: IMG.M09, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  /* ══════════════════════════════ M10 Ethics ══════════════════════════════ */
  {
    lesson_id: 'achc_m10_l0_v2', topic_id: 'ACHC-ART-M10', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m10_splash', type: 'splash', title: 'Ethics in Healthcare',
        content: 'M10 of 12 | 3 Lessons | Pre-Assessment | Final Competency Exam\nEstimated time: 45 minutes\n\nEthical decision-making governs areas where law and policy are silent, ambiguous, or in conflict with each other. This module covers the four bioethical principles, advance directive conflicts, conscientious objection, professional boundaries, and how to access the Ethics Committee when you face a genuine dilemma.',
        narration_script: '', audio_path: '', image_url: IMG.M10, estimated_duration: '0:00', completion_required: false,
      },
      {
        card_id: 'achc_m10_prehook_intro', type: 'content', title: 'Pre-Assessment — What to Expect',
        content: PREHOOK_INTRO_CONTENT,
        narration_script: PREHOOK_INTRO_NARRATION,
        audio_path: '/training-audio/ACHC-ART-M10/l0/prehook_intro.wav', image_url: IMG.M10, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m10_prehook_q1', type: 'challenge', title: 'Pre-Assessment — Question 1',
        content: 'A patient with a valid DNR goes into cardiac arrest during your visit. Their adult son arrives and insists you perform CPR, saying "ignore that paper." The CORRECT response is:',
        narration_script: 'Pre-assessment question 1. A patient with a valid DNR goes into cardiac arrest. Their adult son insists you perform CPR, saying to ignore the paper. What is the correct response?',
        audio_path: '/training-audio/ACHC-ART-M10/l0/prehook_q1.wav', image_url: IMG.M10, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Perform CPR — a family member\'s distress overrides the advance directive in the moment', isCorrect: false, rationale: 'A valid DNR is a legally binding document. Family member distress — even extreme — cannot override the patient\'s documented, competent decision.' },
          { id: 'B', label: 'Honor the DNR; calmly support the family; contact supervisor and physician; document the family\'s objection', isCorrect: true, rationale: 'Correct. The DNR is legally binding. Honor it, manage the family\'s distress compassionately, notify the physician and supervisor, and document the son\'s verbal objection verbatim.' },
          { id: 'C', label: 'Ask the son to sign something overriding the DNR', isCorrect: false, rationale: 'A family member cannot override a valid advance directive through verbal demand or improvised paperwork. The process requires court intervention, not field authorization.' },
          { id: 'D', label: 'Leave the home immediately — this is above your scope', isCorrect: false, rationale: 'Abandoning a patient during a cardiac event — even with a DNR in place — is not appropriate. Stay, provide comfort measures, support the family, and contact your supervisor.' },
        ],
      },
      {
        card_id: 'achc_m10_prehook_q2', type: 'challenge', title: 'Pre-Assessment — Question 2',
        content: 'Conscientious objection in healthcare allows a staff member to:',
        narration_script: 'Pre-assessment question 2. What does conscientious objection in healthcare allow a staff member to do?',
        audio_path: '/training-audio/ACHC-ART-M10/l0/prehook_q2.wav', image_url: IMG.M10, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'Refuse to care for any patient whose lifestyle conflicts with the worker\'s beliefs', isCorrect: false, rationale: 'Refusing to care for an entire category of patients based on who they are is discrimination — not conscientious objection.' },
          { id: 'B', label: 'Decline to perform specific procedures that genuinely conflict with their religious or moral beliefs — not to refuse patients', isCorrect: true, rationale: 'Correct. Conscientious objection applies to specific procedures — not to patients as people. A nurse may decline to administer a blood product, but may not refuse to care for an LGBTQ patient.' },
          { id: 'C', label: 'Select only patients who share the same cultural or religious background', isCorrect: false, rationale: 'Patient selection based on cultural or religious similarity is discriminatory and violates patient rights.' },
          { id: 'D', label: 'Decline any assignment on any day based on personal values', isCorrect: false, rationale: 'Conscientious objection has specific criteria — a genuine religious or moral conflict with a specific procedure, handled through the Agency\'s formal process.' },
        ],
      },
      {
        card_id: 'achc_m10_prehook_q3', type: 'challenge', title: 'Pre-Assessment — Question 3',
        content: 'A healthcare proxy\'s role is MOST accurately described as:',
        narration_script: 'Pre-assessment question 3. A healthcare proxy\'s role is most accurately described as which of the following?',
        audio_path: '/training-audio/ACHC-ART-M10/l0/prehook_q3.wav', image_url: IMG.M10, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'Making medical decisions based on what the proxy believes is best', isCorrect: false, rationale: 'The proxy\'s role is not to substitute their own judgment. They must make decisions consistent with the patient\'s known wishes — not their own preferences.' },
          { id: 'B', label: 'Making decisions consistent with the patient\'s own known wishes when the patient cannot speak', isCorrect: true, rationale: 'Correct. The proxy speaks FOR the patient — not over the patient. If the patient\'s known wishes are documented in an advance directive, those take precedence over the proxy\'s personal preferences.' },
          { id: 'C', label: 'Overriding any advance directive the patient previously completed', isCorrect: false, rationale: 'A proxy cannot override a valid advance directive. The directive represents the patient\'s own competent decision and governs regardless of proxy preference.' },
          { id: 'D', label: 'The same as a court-appointed legal guardian', isCorrect: false, rationale: 'A healthcare proxy is designated by the patient through an advance directive. A legal guardian is court-appointed — a very different process with different authority.' },
        ],
      },
      {
        card_id: 'achc_m10_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Define the four bioethical principles and describe how they conflict in common home health scenarios.\n2. Apply the four-step framework for resolving advance directive conflicts in the field.\n3. Distinguish between conscientious objection to a procedure and refusing to care for a patient.\n4. Identify professional boundary violations and describe the appropriate reporting process.\n5. Access the Ethics Committee and explain what types of situations trigger a consultation request.\n6. Document ethical decisions and their reasoning to establish defensibility.',
        narration_script: 'Learning objectives for Module 10: Ethics in Healthcare. After this module you will be able to define the four bioethical principles; apply the four-step advance directive conflict framework; distinguish conscientious objection from patient refusal; identify professional boundary violations; access the Ethics Committee; and document ethical decisions and their reasoning.',
        audio_path: '/training-audio/ACHC-ART-M10/l0/objectives.wav', image_url: IMG.M10, estimated_duration: '0:50', completion_required: true,
      },
      {
        card_id: 'achc_m10_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Autonomy — Patient\'s right to make their own decisions. Overridden ONLY by court order.\n\nBeneficence — Your duty to act in the patient\'s best interest.\n\nNon-Maleficence — Your duty to avoid harm, including harm from inaction.\n\nJustice — Fair, equitable care regardless of race, religion, ability to pay, or social status.\n\nAdvance Directive — Legally binding document for end-of-life care decisions. Overriding it = assault and battery.\n\nConscientious Objection — Right to decline specific procedures conflicting with beliefs. Does NOT apply to refusing patient categories.\n\nEthics Committee — Available to any employee, patient, or family with a genuine ethical dilemma. Access through supervisor or Compliance Officer. Consultation is confidential.',
        narration_script: 'Seven key terms. Autonomy: patient\'s right to make their own decisions — overridden only by court order. Beneficence: your duty to act in the patient\'s best interest. Non-Maleficence: your duty to avoid harm, including harm from inaction. Justice: fair and equitable care regardless of any characteristic. Advance Directive: legally binding — overriding it is assault and battery. Conscientious Objection: right to decline specific procedures — does not apply to refusing entire patient categories. Ethics Committee: available to any employee, patient, or family member — access through supervisor or Compliance Officer, consultation is confidential.',
        audio_path: '/training-audio/ACHC-ART-M10/l0/concepts.wav', image_url: IMG.M10, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  /* ══════════════════════════════ M11 TB & Bloodborne Pathogens ══════════════════════════════ */
  {
    lesson_id: 'achc_m11_l0_v2', topic_id: 'ACHC-ART-M11', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m11_splash', type: 'splash', title: 'TB & Bloodborne Pathogens',
        content: 'M11 of 12 | 3 Lessons | Pre-Assessment | Final Competency Exam\nEstimated time: 45 minutes\n\nA single needlestick carries a 30% risk of HBV transmission in an unvaccinated worker. TB is airborne and a surgical mask provides zero airborne protection. This module covers bloodborne pathogen transmission, the post-exposure protocol with time-critical steps, N95 respirator requirements, TB recognition, and the Agency\'s infection control program.',
        narration_script: '', audio_path: '', image_url: IMG.M11, estimated_duration: '0:00', completion_required: false,
      },
      {
        card_id: 'achc_m11_prehook_intro', type: 'content', title: 'Pre-Assessment — What to Expect',
        content: PREHOOK_INTRO_CONTENT,
        narration_script: PREHOOK_INTRO_NARRATION,
        audio_path: '/training-audio/ACHC-ART-M11/l0/prehook_intro.wav', image_url: IMG.M11, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m11_prehook_q1', type: 'challenge', title: 'Pre-Assessment — Question 1',
        content: 'Your patient has had a productive cough for 4 weeks, reports night sweats, and coughs blood-tinged sputum in your direction. No TB isolation orders exist. Your IMMEDIATE action is:',
        narration_script: 'Pre-assessment question 1. Your patient has had a productive cough for four weeks, reports night sweats, and coughs blood-tinged sputum in your direction. No TB orders exist. What is your immediate action?',
        audio_path: '/training-audio/ACHC-ART-M11/l0/prehook_q1.wav', image_url: IMG.M11, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Continue the visit with your surgical mask — symptoms may have another cause', isCorrect: false, rationale: 'A surgical mask does NOT protect against airborne TB. This symptom cluster is classic active pulmonary TB — act as if confirmed, not as if doubtful.' },
          { id: 'B', label: 'Don your N95 immediately, complete only essential assessment, notify supervisor and physician, document potential exposure', isCorrect: true, rationale: 'Correct. This is a classic TB symptom cluster. Act as if TB is confirmed until proven otherwise. N95 is the minimum respiratory protection — not a surgical mask.' },
          { id: 'C', label: 'Apply a surgical mask and continue the visit since TB isn\'t confirmed', isCorrect: false, rationale: 'A surgical mask does not filter airborne TB droplet nuclei. It provides no protection against suspected active pulmonary TB.' },
          { id: 'D', label: 'Leave immediately without completing any assessment or notifying anyone', isCorrect: false, rationale: 'Abrupt departure without notification or documentation is not appropriate. Complete essential assessment with proper protection, then notify.' },
        ],
      },
      {
        card_id: 'achc_m11_prehook_q2', type: 'challenge', title: 'Pre-Assessment — Question 2',
        content: 'After a needlestick injury, what is the VERY FIRST action you must take?',
        narration_script: 'Pre-assessment question 2. After a needlestick injury, what is the very first action you must take?',
        audio_path: '/training-audio/ACHC-ART-M11/l0/prehook_q2.wav', image_url: IMG.M11, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'Call your supervisor', isCorrect: false, rationale: 'Supervisor notification is the second step. Decontaminating the wound must happen first — within seconds, not after a phone call.' },
          { id: 'B', label: 'Remove glove and wash the site with soap and water for at least 30 seconds', isCorrect: true, rationale: 'Correct. Immediate decontamination is the first step — wash with soap and water for a minimum of 30 seconds. Do not squeeze or suck the wound. Everything else follows.' },
          { id: 'C', label: 'Complete the exposure incident report', isCorrect: false, rationale: 'Documentation is the fifth step in the post-exposure protocol — after decontamination, notification, and medical evaluation.' },
          { id: 'D', label: 'Apply antiseptic and cover the wound with a bandage', isCorrect: false, rationale: 'Washing with soap and water is the evidence-based first step. Antiseptic bandaging comes after washing but is not the primary intervention.' },
        ],
      },
      {
        card_id: 'achc_m11_prehook_q3', type: 'challenge', title: 'Pre-Assessment — Question 3',
        content: 'A surgical mask provides adequate protection when caring for a patient with suspected active pulmonary tuberculosis:',
        narration_script: 'Pre-assessment question 3. True or false — a surgical mask provides adequate protection when caring for a patient with suspected active pulmonary tuberculosis.',
        audio_path: '/training-audio/ACHC-ART-M11/l0/prehook_q3.wav', image_url: IMG.M11, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'True — surgical masks are designed to protect the wearer from airborne pathogens', isCorrect: false, rationale: 'This is a dangerous misconception. Surgical masks are designed to protect the PATIENT from the wearer\'s secretions — not to protect the wearer from airborne pathogens.' },
          { id: 'B', label: 'False — TB is airborne and only an N95 respirator (fit-tested) provides airborne protection', isCorrect: true, rationale: 'Correct. TB is transmitted by droplet nuclei that are small enough to pass through a surgical mask. An N95 respirator, properly fit-tested, is the minimum protection for suspected or confirmed active TB.' },
          { id: 'C', label: 'True — for exposures shorter than 15 minutes', isCorrect: false, rationale: 'Duration of exposure does not make a surgical mask adequate for airborne protection. TB droplet nuclei remain suspended in air for hours after an infectious person coughs.' },
          { id: 'D', label: 'True — if the patient is not coughing during the visit', isCorrect: false, rationale: 'TB droplet nuclei can remain airborne for hours. The absence of coughing during the current visit does not eliminate airborne exposure risk in an enclosed space.' },
        ],
      },
      {
        card_id: 'achc_m11_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Identify the three primary bloodborne pathogens, their transmission routes, and per-needlestick infection risks.\n2. Execute the 5-step post-exposure protocol within the correct time windows for each step.\n3. Describe the OSHA engineering controls hierarchy and explain why PPE is the last line of defense.\n4. Recognize the classic symptom cluster for active pulmonary TB and describe the immediate field response.\n5. Demonstrate proper N95 respirator user seal-check technique and explain the fit-testing requirement.\n6. Describe the Agency\'s TB risk classification and annual PPD/IGRA testing requirements.',
        narration_script: 'Learning objectives for Module 11: TB and Bloodborne Pathogens. After this module you will be able to identify the three primary bloodborne pathogens, their transmission routes, and per-needlestick risks; execute the five-step post-exposure protocol; describe the OSHA engineering controls hierarchy; recognize active TB symptoms and describe the immediate field response; demonstrate N95 seal-check technique; and describe Agency TB testing requirements.',
        audio_path: '/training-audio/ACHC-ART-M11/l0/objectives.wav', image_url: IMG.M11, estimated_duration: '0:55', completion_required: true,
      },
      {
        card_id: 'achc_m11_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Bloodborne Pathogens — HBV (30% needlestick risk, vaccine available), HCV (1.8%, no vaccine), HIV (0.3%, PEP effective within 72 hrs).\n\nExposure Control Plan — OSHA-required written program. Must be available, known, and followed by ALL staff.\n\nPost-Exposure Protocol — Wash → Report → Medical Eval (2 hrs) → Source Patient Info → Incident Report.\n\nPEP — Post-Exposure Prophylaxis. Time-critical. Must begin within 72 hours for HIV. Effectiveness decreases each hour.\n\nN95 Respirator — Minimum TB protection. Fit-tested before first use and annually. Seal-checked before every use.\n\nDroplet Nuclei — Tiny TB particles that remain airborne for hours. Surgical masks do NOT filter them.\n\nMantoux PPD — Tuberculin skin test. Required at hire. Annual symptom questionnaire thereafter. Positive PPD → chest X-ray.',
        narration_script: 'Seven key terms. Bloodborne Pathogens: HBV carries 30% needlestick risk with a vaccine available; HCV carries 1.8% risk with no vaccine but effective treatment; HIV carries 0.3% risk with PEP effective within 72 hours. Exposure Control Plan: OSHA-required, must be available and followed by all staff. Post-Exposure Protocol: wash, report, medical evaluation within two hours, source patient information, incident report. PEP: post-exposure prophylaxis — time-critical, must begin within 72 hours for HIV. N95: fit-tested before first use and annually, seal-checked before every use. Droplet Nuclei: tiny TB particles that remain airborne for hours — surgical masks do not filter them. Mantoux PPD: required at hire, annual questionnaire after; positive result requires chest X-ray.',
        audio_path: '/training-audio/ACHC-ART-M11/l0/concepts.wav', image_url: IMG.M11, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  /* ══════════════════════════════ M12 Medical Device Act ══════════════════════════════ */
  {
    lesson_id: 'achc_m12_l0_v2', topic_id: 'ACHC-ART-M12', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m12_splash', type: 'splash', title: 'Safe Medical Devices Act & MDR',
        content: 'M12 of 12 | 3 Lessons | Pre-Assessment | Final Competency Exam\nEstimated time: 45 minutes\n\nHome health agencies are device user facilities with mandatory FDA reporting obligations. A single device failure in your patient\'s home may be the same defect deployed in thousands of others nationwide. This module covers the MDR reporting framework, the 10-working-day deadline, device preservation obligations, voluntary MedWatch reporting, and Safety Data Sheet requirements.',
        narration_script: '', audio_path: '', image_url: IMG.M12, estimated_duration: '0:00', completion_required: false,
      },
      {
        card_id: 'achc_m12_prehook_intro', type: 'content', title: 'Pre-Assessment — What to Expect',
        content: PREHOOK_INTRO_CONTENT,
        narration_script: PREHOOK_INTRO_NARRATION,
        audio_path: '/training-audio/ACHC-ART-M12/l0/prehook_intro.wav', image_url: IMG.M12, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m12_prehook_q1', type: 'challenge', title: 'Pre-Assessment — Question 1',
        content: 'An oxygen concentrator has been alarming for 2 days, silenced each time by the caregiver. You arrive and find SpO2 of 82%, the patient is confused, and the device is delivering 1L/min on a 2L setting. This situation requires:',
        narration_script: 'Pre-assessment question 1. An oxygen concentrator has been alarming for two days, silenced each time. The patient\'s SpO2 is 82%, they are confused, and the device is delivering only 1L/min on a 2L setting. What does this require?',
        audio_path: '/training-audio/ACHC-ART-M12/l0/prehook_q1.wav', image_url: IMG.M12, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'Document the device alarm and call the DME company to service the concentrator', isCorrect: false, rationale: 'The patient is in clinical crisis. A service call alone does not address the immediate patient emergency or the regulatory reporting obligation.' },
          { id: 'B', label: 'Immediate patient intervention, supervisor and physician notification, incident report, AND evaluate for FDA MDR reporting', isCorrect: true, rationale: 'Correct. Patient safety first. Then the full reporting cascade: incident report, supervisor and physician notification, and MDR evaluation because a device malfunction caused a serious injury.' },
          { id: 'C', label: 'Tell the caregiver not to silence alarms and schedule a follow-up visit', isCorrect: false, rationale: 'The patient is in clinical crisis NOW. Alarm education is appropriate later — not as the primary response to an active patient emergency.' },
          { id: 'D', label: 'Replace the concentrator yourself and adjust the flow rate', isCorrect: false, rationale: 'Replacing the device that caused injury without preserving it destroys the evidentiary value needed for the MDR investigation.' },
        ],
      },
      {
        card_id: 'achc_m12_prehook_q2', type: 'challenge', title: 'Pre-Assessment — Question 2',
        content: 'An MDR (Medical Device Report) is required when a device:',
        narration_script: 'Pre-assessment question 2. An MDR is required when a medical device meets which of the following criteria?',
        audio_path: '/training-audio/ACHC-ART-M12/l0/prehook_q2.wav', image_url: IMG.M12, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'Is more than 5 years old and has not been serviced recently', isCorrect: false, rationale: 'Device age and maintenance history are not MDR triggers. The trigger is a connection to patient harm or potential harm — not equipment age.' },
          { id: 'B', label: 'May have caused or contributed to patient death, serious injury, or malfunctioned in a way that could cause either if it recurs', isCorrect: true, rationale: 'Correct. The threshold is "may have caused or contributed to" — a low bar. The regulation also assumes malfunctions will recur, so potential harm from a single malfunction is sufficient.' },
          { id: 'C', label: 'Is recalled by the manufacturer', isCorrect: false, rationale: 'A recall is a separate process initiated by the manufacturer or FDA. MDR reporting is triggered by an event at your specific patient, not by a recall notice.' },
          { id: 'D', label: 'Causes any patient discomfort', isCorrect: false, rationale: 'Minor discomfort is not an MDR trigger. The standard requires death, serious injury (life-threatening, permanent impairment, or requiring intervention to prevent permanent damage), or malfunction likely to cause either.' },
        ],
      },
      {
        card_id: 'achc_m12_prehook_q3', type: 'challenge', title: 'Pre-Assessment — Question 3',
        content: 'The 10-working-day FDA reporting deadline for an MDR starts:',
        narration_script: 'Pre-assessment question 3. When does the 10-working-day FDA reporting deadline for an MDR start?',
        audio_path: '/training-audio/ACHC-ART-M12/l0/prehook_q3.wav', image_url: IMG.M12, estimated_duration: '0:30', completion_required: true,
        options: [
          { id: 'A', label: 'When the investigation concludes and causation is confirmed', isCorrect: false, rationale: 'Waiting for investigation completion before starting the clock would make the deadline meaningless. The clock starts at awareness — not confirmation.' },
          { id: 'B', label: 'When any employee of the Agency first becomes aware of the event', isCorrect: true, rationale: 'Correct. Day Zero is the date any employee first becomes aware — including field staff at the scene. Awareness starts the clock, not confirmation or investigation completion.' },
          { id: 'C', label: 'When the Administrator reviews the incident report', isCorrect: false, rationale: 'Administrator review is part of the reporting chain but is not the start of the clock. The clock begins at first employee awareness.' },
          { id: 'D', label: 'When the patient is discharged or hospitalized', isCorrect: false, rationale: 'Patient disposition has no bearing on when the reporting clock starts. Awareness of the device event — at the scene — is Day Zero.' },
        ],
      },
      {
        card_id: 'achc_m12_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Define an MDR reportable event and identify the three categories (death, serious injury, malfunction).\n2. Apply the "may have caused or contributed to" reporting standard without waiting for confirmed causation.\n3. Execute your role in the 5-step MDR reporting chain including immediate device preservation.\n4. Distinguish between mandatory reporting (FDA Form 3500A) and voluntary reporting (MedWatch Form 3500).\n5. Document device events with all required elements immediately at the scene.\n6. Explain the SDS system and apply Section 8 PPE requirements for chemical hazards encountered in the field.',
        narration_script: 'Learning objectives for Module 12: Safe Medical Devices Act and MDR. After this module you will be able to define an MDR reportable event and identify the three categories; apply the "may have caused or contributed to" standard; execute your role in the five-step MDR reporting chain including device preservation; distinguish mandatory from voluntary reporting; document device events with all required elements; and apply SDS Section 8 PPE requirements.',
        audio_path: '/training-audio/ACHC-ART-M12/l0/objectives.wav', image_url: IMG.M12, estimated_duration: '0:55', completion_required: true,
      },
      {
        card_id: 'achc_m12_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'MDR Reportable Event — Device may have caused/contributed to death or serious injury. Low threshold: "may have" is sufficient.\n\nDevice User Facility — Home health agencies are user facilities with mandatory reporting obligations.\n\nSerious Injury — Life-threatening, permanent impairment, OR requiring intervention to prevent permanent damage.\n\nMalfunction — Device fails to perform as intended. Reportable if likely to cause death/serious injury if it recurs.\n\n10-Working-Day Deadline — Begins when ANY employee becomes aware. Deaths: FDA + manufacturer. Serious injuries: manufacturer only.\n\nFDA Form 3500A — Mandatory report filed by the Administrator. Field staff role: identify, document, report immediately.\n\nDevice Preservation — Do NOT return, repair, or discard until risk management releases. Device is evidentiary.',
        narration_script: 'Seven key terms. MDR Reportable Event: device may have caused or contributed to death or serious injury — "may have" is the low threshold. Device User Facility: home health agencies have mandatory FDA reporting obligations. Serious Injury: life-threatening, permanently impairing, or requiring intervention to prevent permanent damage. Malfunction: failure to perform as intended — reportable if likely to cause harm if it recurs. Ten-Working-Day Deadline: starts when any employee becomes aware — deaths go to FDA and manufacturer, serious injuries to manufacturer only. FDA Form 3500A: filed by the Administrator — field staff identify, document, and report immediately. Device Preservation: do not return, repair, or discard until risk management releases it.',
        audio_path: '/training-audio/ACHC-ART-M12/l0/concepts.wav', image_url: IMG.M12, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },
];
