import type { Lesson } from './achcContentTypes';

const IMG = {
  M01: '/assets/media/gao-mission-values.jpg',
  M02: '/assets/media/emergency-prep.jpg',
  M03: '/assets/media/abuse-reporting.jpg',
  M04: '/assets/media/hipaa-privacy.jpg',
};

export const achcLessons_M01_M04: Lesson[] = [

  /* ══════════════════════ M01 Cultural Awareness ══════════════════════ */

  {
    lesson_id: 'achc_m01_l0', topic_id: 'ACHC-ART-M01', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m01_l0_hook', type: 'challenge', title: 'Pre-Assessment: Test Yourself First',
        content: 'You arrive for a scheduled wound care visit. The patient\'s daughter intercepts you: "My mother doesn\'t want a male/female caregiver touching her — it\'s against our beliefs." The patient is non-verbal post-stroke. The wound shows early infection signs.\n\nWhat is your IMMEDIATE next action?',
        narration_script: 'Before we begin, let\'s see where you stand. You arrive for wound care. The patient\'s daughter intercepts you and explains her mother doesn\'t want someone of your gender touching her for religious reasons. The patient is non-verbal post-stroke. The wound shows early infection signs. What is your immediate next action?',
        audio_path: '/training-audio/ACHC-ART-M01/l0/hook.wav', image_url: IMG.M01, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Explain that you are a licensed professional and proceed with wound care', isCorrect: false, rationale: 'Proceeding over a stated religious/cultural objection violates patient rights and escalates conflict.' },
          { id: 'B', label: 'Document refusal of care, leave the home, and notify the office', isCorrect: false, rationale: 'Abandoning without exploring accommodation fails the patient and the wound urgency.' },
          { id: 'C', label: 'Acknowledge the concern, contact supervisor to explore reassignment while assessing wound urgency', isCorrect: true, rationale: 'Correct — balance cultural accommodation, patient safety, and proper escalation simultaneously.' },
          { id: 'D', label: 'Ask the daughter to sign an AMA form and leave', isCorrect: false, rationale: 'AMA forms require patient signature; more importantly, wound urgency demands an active safety response, not exit.' },
        ],
      },
      {
        card_id: 'achc_m01_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Define cultural competence and distinguish it from workforce diversity training.\n2. Identify at least 4 categories of cultural difference that affect patient care.\n3. Apply communication strategies when cultural barriers exist.\n4. Recognize workplace discrimination behaviors and describe reporting obligations.\n5. Demonstrate patient interaction techniques that respect cultural norms.',
        narration_script: 'Here is what you will be able to do after this module. One: define cultural competence and distinguish it from workforce diversity training. Two: identify at least four categories of cultural difference that affect patient care. Three: apply communication strategies when cultural barriers exist. Four: recognize workplace discrimination and describe your reporting obligations. Five: demonstrate patient interaction techniques that respect cultural norms.',
        audio_path: '/training-audio/ACHC-ART-M01/l0/objectives.wav', image_url: IMG.M01, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m01_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Cultural Competence — delivering care that meets the social, cultural, and linguistic needs of patients. Poor competence → miscommunication → adverse events.\n\nCLAS Standards — federal framework mandating culturally responsive care. CMS/Joint Commission require compliance.\n\nImplicit Bias — unconscious attitudes affecting care quality. Patient complaints follow.\n\nLanguage Access — must use qualified interpreters, not family members for clinical decisions. Failure = immediate jeopardy risk.\n\nProtected Class — race, religion, sex, national origin, age, disability. Affects patient care AND hiring.\n\nCultural Humility — ongoing self-reflection about your own biases. Not "mastering" cultures, but continuous learning.\n\nEEOC — U.S. Equal Employment Opportunity Commission. Federal agency enforcing anti-discrimination laws.',
        narration_script: 'Seven key terms. Cultural Competence: delivering care that meets cultural and linguistic needs — poor competence leads to miscommunication and adverse events. CLAS Standards: federal framework for culturally responsive care. Implicit Bias: unconscious attitudes that affect care quality. Language Access: use qualified interpreters, not family members for clinical decisions — failure is an immediate jeopardy risk. Protected Class: race, religion, sex, national origin, age, disability — applies to patient care AND hiring. Cultural Humility: ongoing self-reflection, not mastering cultures. EEOC: federal agency enforcing anti-discrimination laws.',
        audio_path: '/training-audio/ACHC-ART-M01/l0/concepts.wav', image_url: IMG.M01, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m01_l1', topic_id: 'ACHC-ART-M01', title: 'Lesson 1: Foundations of Cultural Diversity', order: 1,
    cards: [
      {
        card_id: 'achc_m01_l1_s', type: 'summary', title: 'Cultural Competence Is a Clinical Skill',
        content: 'Cultural competence is not a "soft skill" — it directly affects whether patients can follow care instructions, whether they trust you, and whether adverse events occur. The CLAS Standards (National Standards for Culturally and Linguistically Appropriate Services) are federally mandated, not optional.',
        narration_script: 'Cultural competence is not a soft skill. It directly affects patient outcomes. When patients cannot communicate their needs or trust their clinician, care quality suffers. The CLAS Standards — National Standards for Culturally and Linguistically Appropriate Services — are federally mandated. This is not optional.',
        audio_path: '/training-audio/ACHC-ART-M01/l1/summary.wav', image_url: IMG.M01, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m01_l1_c1', type: 'content', title: 'CLAS Standards and Workforce Diversity',
        content: 'The CLAS Standards were established in 2000 and updated in 2010 to address health disparities across race, ethnicity, language, and cultural backgrounds.\n\nWorkforce Diversity Training ≠ Cultural Competence Training:\n• Diversity training addresses staff composition and representation\n• Cultural competence training addresses patient-care delivery\n\nMultilingual staff are an organizational clinical asset — not just a courtesy. Patients who cannot communicate effectively cannot follow care instructions safely.',
        narration_script: 'The CLAS Standards were established in 2000 and updated in 2010. They address disparities across race, ethnicity, language, and culture. Important distinction: workforce diversity training addresses staff composition, while cultural competence training addresses how care is delivered to patients. Multilingual staff are a clinical asset. Patients who cannot communicate effectively cannot follow care instructions safely.',
        audio_path: '/training-audio/ACHC-ART-M01/l1/content1.wav', image_url: IMG.M01, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m01_l1_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Cultural competence affects patients DIRECTLY — not just staff morale\n• Quality of communication determines whether patients can safely follow instructions\n• Multilingual capability is a clinical asset\n• Discrimination extends beyond race: religion, age, disability, national origin, sexuality\n• The CLAS Standards are federally required — ACHC surveys for compliance\n• Implicit bias can cause care quality disparities even when no overt discrimination occurs',
        narration_script: 'Key takeaways from this lesson. Cultural competence affects patients directly, not just staff morale. Communication quality determines whether patients can safely follow instructions. Multilingual capability is a clinical asset. Discrimination extends beyond race — it includes religion, age, disability, national origin, and sexual orientation. The CLAS Standards are federally required, and ACHC surveys for compliance. Finally, implicit bias can create care disparities even without overt discrimination.',
        audio_path: '/training-audio/ACHC-ART-M01/l1/takeaways.wav', image_url: IMG.M01, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m01_l1_c2', type: 'content', title: 'Field Scenario: Cultural Preference in Medication Timing',
        content: 'Field scenario: A Muslim patient fasts during Ramadan and requests that you time insulin teaching and administration after sunset. The POC calls for morning and evening doses.\n\nPer CL-PR-001 (Patient Rights & Responsibilities), you:\n• Respect the preference and negotiate timing within clinical safety (e.g., adjust within window if physician approves)\n• Document the accommodation and patient teaching\n• If it risks therapeutic level, escalate to DON and physician for order change\n\nNever override without escalation. This protects adherence and avoids harm.',
        narration_script: 'Field scenario. A patient fasting for Ramadan asks to shift insulin teaching after sunset. Per CL-PR-001 (Patient Rights & Responsibilities), respect the request, negotiate safe windows, document thoroughly, and escalate to physician for any order adjustment. Never override unilaterally.',
        audio_path: '/training-audio/ACHC-ART-M01/l1/content2.wav', image_url: IMG.M01, estimated_duration: '1:25', completion_required: true,
      },
      {
        card_id: 'achc_m01_l1_ch', type: 'challenge', title: 'Challenge: Workforce Diversity Scenario',
        content: 'During a team meeting, a coworker says about a new hire: "I don\'t understand why they hired someone who barely speaks English — how are they going to document properly?" Two staff members laugh. You are the only other person present.\n\nWhat is the MOST appropriate immediate response?',
        narration_script: 'Challenge scenario. During a team meeting, a coworker comments about a new hire: I don\'t understand why they hired someone who barely speaks English — how are they going to document properly? Two staff members laugh. You are the only other person present. What is the most appropriate immediate response?',
        audio_path: '/training-audio/ACHC-ART-M01/l1/challenge.wav', image_url: IMG.M01, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Laugh along — it\'s just a joke and not your problem', isCorrect: false, rationale: 'Bystander silence = implicit endorsement and creates hostile work environment liability.' },
          { id: 'B', label: 'Say nothing now but report it to HR later', isCorrect: false, rationale: 'Delayed reporting without real-time correction allows the behavior to normalize.' },
          { id: 'C', label: 'Calmly address it: "That\'s not appropriate — our agency values diversity and that creates a hostile environment"', isCorrect: true, rationale: 'Correct — immediate calm intervention is both an ethical obligation and organizational expectation.' },
          { id: 'D', label: 'Confront the coworker aggressively to defend the new hire', isCorrect: false, rationale: 'Aggressive confrontation escalates and can create its own HR issue, shifting focus away from the discriminatory behavior.' },
        ],
      },
      {
        card_id: 'achc_m01_l1_deb', type: 'content', title: 'Operational Debrief: Why C Is Correct',
        content: 'Immediate, calm intervention prevents normalization of discriminatory behavior. Documentation should follow, but real-time response is the standard.\n\nWhy the others fail:\n• A: Bystander silence = implicit endorsement → creates hostile work environment liability\n• B: Delay allows harm to continue; weakens the subsequent HR report\n• D: Aggressive response escalates, may create a second HR issue\n\nWorkflow impact: Staff who witness discrimination and fail to act may be named in complaints.\nPatient safety link: Discriminatory culture → poor team communication → care coordination failures.\nACHC surveys organizational culture and staff treatment policies.',
        narration_script: 'Debrief. Immediate, calm intervention prevents the behavior from normalizing. Documentation should follow, but real-time response is the standard. Option A is wrong because bystander silence is implicit endorsement. Option B is wrong because delay allows harm to continue. Option D is wrong because aggressive confrontation escalates the situation. Staff who witness discrimination and fail to act may be named in complaints. A discriminatory culture leads to poor team communication, which leads to care coordination failures. ACHC surveys organizational culture.',
        audio_path: '/training-audio/ACHC-ART-M01/l1/debrief.wav', image_url: IMG.M01, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m01_l2', topic_id: 'ACHC-ART-M01', title: 'Lesson 2: Cultural Competence in Patient Care', order: 2,
    cards: [
      {
        card_id: 'achc_m01_l2_s', type: 'summary', title: 'Never Assume Based on Appearance',
        content: 'You cannot predict a patient\'s cultural values, religious practices, or communication preferences based on their appearance, name, or ethnicity. Cultural competence begins with asking — tactfully — and listening carefully before assuming.',
        narration_script: 'You cannot predict a patient\'s cultural values, religious practices, or communication preferences based on their appearance, name, or ethnicity. Cultural competence starts with asking tactfully and listening before assuming.',
        audio_path: '/training-audio/ACHC-ART-M01/l2/summary.wav', image_url: IMG.M01, estimated_duration: '0:35', completion_required: true,
      },
      {
        card_id: 'achc_m01_l2_c1', type: 'content', title: 'Navigating Cultural Differences in Care',
        content: 'Key operational rules:\n• Ask tactfully about cultural preferences at admission and each visit\n• Negotiate between cultural interpretation and medical treatment — don\'t force; don\'t ignore\n• Use qualified interpreters for clinical conversations — NEVER children, NEVER family members for clinical decisions\n• Document cultural considerations addressed during each encounter\n• Accommodation does not mean abandoning clinical standards — find the intersection\n\nCommon areas of difference: food/dietary practices, gender roles in caregiving, religious restrictions on procedures or products, privacy expectations, authority relationships.',
        narration_script: 'Key operational rules. Ask tactfully about cultural preferences at admission and each visit. Negotiate between cultural interpretation and medical need — don\'t force compliance, and don\'t ignore the clinical issue. Use qualified interpreters for clinical conversations — never children, never untrained family members. Document cultural considerations at every encounter. And remember: accommodation means finding the intersection of cultural values and clinical requirements, not abandoning your standards.',
        audio_path: '/training-audio/ACHC-ART-M01/l2/content1.wav', image_url: IMG.M01, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m01_l2_tkwy', type: 'content', title: 'Interpreter Requirements',
        content: 'Language Access is a CMS Condition of Participation requirement:\n• Qualified interpreters: professionally trained, medically literate, bound by confidentiality\n• NOT acceptable for clinical education: children, family members, neighbors\n• Acceptable uses for family interpreters: general greetings, scheduling only\n• Telephone interpreter services must be available and used when needed\n• Document: who interpreted, method of interpretation, patient teach-back confirmation\n\nFailure to provide qualified interpreter = immediate jeopardy risk at survey.',
        narration_script: 'Language Access is a CMS Condition of Participation. Qualified interpreters are professionally trained, medically literate, and bound by confidentiality. Children and family members are NOT acceptable for clinical education. Family may assist with general greetings or scheduling only. Telephone interpreter services must be available. Always document who interpreted, how interpretation was arranged, and the patient\'s teach-back confirmation. Failure to provide a qualified interpreter is an immediate jeopardy risk.',
        audio_path: '/training-audio/ACHC-ART-M01/l2/takeaways.wav', image_url: IMG.M01, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m01_l2_ch', type: 'challenge', title: 'Challenge: Dietary Cultural Barrier',
        content: 'You are providing diabetic education. The patient\'s family prepared a traditional meal that contradicts the prescribed diet. The patient says through a family interpreter: "This is what we eat. My family made it with love." The physician\'s orders clearly state dietary restrictions.\n\nWhat is the BEST approach?',
        narration_script: 'Challenge scenario. You are providing diabetic education. The patient\'s family prepared a traditional meal that contradicts the prescribed diet. Through a family interpreter, the patient says: this is what we eat, my family made it with love. Physician orders state dietary restrictions. What is the best approach?',
        audio_path: '/training-audio/ACHC-ART-M01/l2/challenge.wav', image_url: IMG.M01, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Firmly explain the diet is doctor\'s orders and the food must be changed immediately', isCorrect: false, rationale: 'Authoritarian approach damages trust and likely causes the patient to hide future behaviors.' },
          { id: 'B', label: 'Document non-compliance and notify the physician that the patient is refusing education', isCorrect: false, rationale: '"Non-compliance" without attempting cultural negotiation is a documentation failure and may constitute discrimination.' },
          { id: 'C', label: 'Acknowledge the cultural significance, explore modifications honoring both tradition and medical needs, and document the education', isCorrect: true, rationale: 'Correct — cultural negotiation preserves the therapeutic relationship while meeting clinical obligations.' },
          { id: 'D', label: 'Ignore it — what the patient eats is their choice', isCorrect: false, rationale: 'Clinicians have a duty to educate. Ignoring physician diet orders is a care gap.' },
        ],
      },
      {
        card_id: 'achc_m01_l2_deb', type: 'content', title: 'Operational Debrief: Cultural Negotiation',
        content: 'Culturally competent care means finding the intersection of medical need and cultural practice.\n\nWhy the others fail:\n• A: Authoritarian approach destroys trust → patient hides future behaviors → adverse events\n• B: "Non-compliance" without cultural negotiation = documentation failure; may constitute discrimination\n• D: Duty to educate remains regardless of patient preferences about diet\n\nDocumentation must include: education provided, patient response, cultural considerations addressed, and plan for follow-up.\n\nReimbursement note: Education visits without documentation of teaching and patient response may not meet billing requirements.',
        narration_script: 'Debrief. Culturally competent care means finding the intersection of medical need and cultural practice. Option A fails because it destroys trust, causing patients to hide future behaviors. Option B is a documentation failure — non-compliance without attempted cultural negotiation may constitute discrimination. Option D is negligence — your duty to educate does not disappear. Documentation must include the education provided, patient response, cultural considerations addressed, and follow-up plan.',
        audio_path: '/training-audio/ACHC-ART-M01/l2/debrief.wav', image_url: IMG.M01, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m01_l3', topic_id: 'ACHC-ART-M01', title: 'Lesson 3: Workplace Discrimination & Prevention', order: 3,
    cards: [
      {
        card_id: 'achc_m01_l3_s', type: 'summary', title: 'Discrimination Can Be Subtle and Still Illegal',
        content: 'Workplace discrimination includes subtle behaviors: implicit bias, stereotyping, unequal assignments. It is not limited to overt hostility. The EEOC enforces federal anti-discrimination laws, and retaliation against employees who report is itself a separate violation.',
        narration_script: 'Workplace discrimination is not limited to overt hostility. It includes subtle behaviors: implicit bias, stereotyping, and unequal assignments. The EEOC enforces federal anti-discrimination laws. Retaliation against employees who report discrimination is itself a separate federal violation.',
        audio_path: '/training-audio/ACHC-ART-M01/l3/summary.wav', image_url: IMG.M01, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m01_l3_c1', type: 'content', title: 'EEOC and Protected Class Protections',
        content: 'Protected classes under federal law include: race, color, national origin, sex, religion, age (40+), disability, and genetic information.\n\nDiscrimination forms:\n• Disparate treatment: treating someone differently based on protected class\n• Disparate impact: neutral policies that disproportionately affect a protected class\n• Harassment: unwelcome conduct based on protected characteristic\n• Retaliation: adverse action against someone who reported discrimination\n\nManagers must be trained on federal employment discrimination guidelines.\nEEOC website: www.eeoc.gov — reference for rights and reporting.',
        narration_script: 'Protected classes under federal law include race, color, national origin, sex, religion, age over 40, disability, and genetic information. Discrimination takes four forms: disparate treatment — treating someone differently; disparate impact — neutral policies with disproportionate effects; harassment — unwelcome conduct based on a protected characteristic; and retaliation — adverse action against someone who reported. Managers must be trained on these guidelines. EEOC reference: www.eeoc.gov.',
        audio_path: '/training-audio/ACHC-ART-M01/l3/content1.wav', image_url: IMG.M01, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m01_l3_tkwy', type: 'content', title: 'Your Reporting Obligations',
        content: '• Every employee has a duty to report AND intervene when witnessing discrimination\n• Report to HR/Compliance Officer → document the pattern → supervisor counseling/retraining\n• EEOC complaints can be filed by any individual who experiences or witnesses discrimination\n• Retaliation for reporting = separate federal violation with its own penalties\n• Positive stereotyping (assigning harder work because "you\'re stronger") is still illegal stereotyping\n• Staff training on non-discrimination policies is required at orientation AND annually',
        narration_script: 'Your obligations. Every employee must report AND intervene when witnessing discrimination. Report to HR or the Compliance Officer, document the pattern, and ensure supervisor retraining. EEOC complaints can be filed by anyone who experiences or witnesses discrimination. Retaliation for reporting is a separate federal violation. Positive stereotyping — assigning harder work because "you\'re stronger" — is still illegal stereotyping. Staff training on non-discrimination is required at orientation and annually.',
        audio_path: '/training-audio/ACHC-ART-M01/l3/takeaways.wav', image_url: IMG.M01, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m01_l3_ch', type: 'challenge', title: 'Challenge: Discriminatory Assignment Pattern',
        content: 'Your supervisor consistently assigns the most difficult patients to staff of a particular ethnic background, while assigning lighter cases to others. When asked about it, the supervisor says: "You\'re stronger — it\'s a compliment."\n\nThis situation MOST accurately represents:',
        narration_script: 'Challenge scenario. Your supervisor consistently assigns the most difficult patients to staff of a particular ethnic background while assigning lighter cases to others. When one affected staff member asks about it, the supervisor says: you\'re stronger — it\'s a compliment. What does this situation most accurately represent?',
        audio_path: '/training-audio/ACHC-ART-M01/l3/challenge.wav', image_url: IMG.M01, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'A reasonable staffing decision based on observed capabilities', isCorrect: false, rationale: 'Capability assessments must be based on documented skill, not ethnicity-based assumptions.' },
          { id: 'B', label: 'A potentially discriminatory assignment pattern based on ethnic stereotyping — even framed as a compliment', isCorrect: true, rationale: 'Correct — "positive" stereotyping in work assignments constitutes discriminatory behavior under EEOC guidelines.' },
          { id: 'C', label: 'Not a problem unless someone formally complains', isCorrect: false, rationale: 'Discrimination exists regardless of whether a complaint is filed. The organization must prevent it proactively.' },
          { id: 'D', label: 'A HIPAA violation', isCorrect: false, rationale: 'This is an EEOC/employment law issue, not a HIPAA issue.' },
        ],
      },
      {
        card_id: 'achc_m01_l3_deb', type: 'content', title: 'Operational Debrief: Benevolent Discrimination',
        content: '"Benevolent" discrimination is still discrimination. Stereotyping (even positive) in work assignments creates disparate treatment under EEOC guidelines.\n\nWhy the others fail:\n• A: Race-based capability assumptions normalize discriminatory staffing\n• C: Discrimination exists regardless of complaints. The agency has a duty to prevent it proactively\n• D: HIPAA governs patient information — not employment practices\n\nEscalation path: Report to HR/Compliance Officer → document the pattern → supervisor counseling and retraining.\nACHC reviews personnel policies and fair treatment practices during surveys.',
        narration_script: 'Debrief. Benevolent discrimination is still discrimination. Stereotyping in work assignments — even when framed as a compliment — creates disparate treatment under EEOC guidelines. Option A normalizes race-based capability assumptions. Option C is wrong because discrimination exists regardless of complaints — the agency must prevent it proactively. Option D is wrong because this is an employment law issue, not HIPAA. Escalation: report to HR, document the pattern, ensure supervisor retraining. ACHC reviews personnel policies during surveys.',
        audio_path: '/training-audio/ACHC-ART-M01/l3/debrief.wav', image_url: IMG.M01, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m01_l4', topic_id: 'ACHC-ART-M01', title: 'Module Wrap-Up & Completion', order: 4,
    cards: [
      {
        card_id: 'achc_m01_l4_syn', type: 'summary', title: 'Summary & Synthesis',
        content: '6 things you must take from this module:\n\n1. Cultural competence is a clinical skill — it directly affects patient outcomes\n2. The CLAS Standards are federally mandated, not optional guidelines\n3. Discrimination includes subtle behaviors (implicit bias, stereotyping) not just overt hostility\n4. Cultural negotiation = finding the intersection of medical needs and cultural values\n5. Every employee has a duty to report discrimination AND to intervene when witnessed\n6. Documentation must reflect cultural considerations addressed during patient encounters\n\nOperational bridge: Your field preceptor will evaluate your culturally appropriate patient interactions, use of interpreters, and documentation of cultural considerations.',
        narration_script: 'Six things to take from this module. One: cultural competence is a clinical skill that directly affects patient outcomes. Two: CLAS Standards are federally mandated. Three: discrimination includes subtle behaviors like implicit bias and stereotyping. Four: cultural negotiation means finding the intersection of medical needs and cultural values. Five: every employee has a duty to report and intervene when witnessing discrimination. Six: documentation must reflect the cultural considerations addressed. Your field preceptor will evaluate your culturally appropriate interactions, interpreter use, and documentation.',
        audio_path: '/training-audio/ACHC-ART-M01/l4/synthesis.wav', image_url: IMG.M01, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m01_l4_fdeb', type: 'content', title: 'Mandatory Final Debrief',
        content: 'A correct answer does NOT guarantee correct reasoning. Reflect on these principles:\n\n1. Cultural competence is never "complete" — it requires ongoing self-reflection (cultural humility)\n2. Accommodation of cultural preferences has limits: patient safety always takes priority\n3. Documentation of cultural considerations protects the clinician, patient, AND organization\n4. Discrimination can be subtle, systemic, and unintentional — awareness is the first defense\n5. Your role is not to judge cultural practices but to find safe clinical pathways within them\n\nConfidence check: How confident are you in navigating a cultural barrier in the field without supervisor support? (Reflect: 1 = Not confident, 5 = Fully confident)',
        narration_script: 'A correct answer does not guarantee correct reasoning. Reflect on these five principles. One: cultural competence requires ongoing self-reflection — it is never complete. Two: patient safety always takes priority over cultural accommodation. Three: documentation protects everyone. Four: discrimination can be subtle and unintentional — awareness is the first defense. Five: your role is to find safe clinical pathways within cultural frameworks, not to judge them. Now reflect on your confidence: how confident are you in navigating a cultural barrier in the field without supervisor support?',
        audio_path: '/training-audio/ACHC-ART-M01/l4/finaldebrief.wav', image_url: IMG.M01, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m01_l4_nxt', type: 'content', title: 'Operational Next Steps',
        content: 'Your field preceptor will evaluate:\n• Appropriate greeting and address of patients (no nicknames unless patient-directed)\n• Use of qualified interpreters (not family) for clinical conversations\n• Documentation of cultural considerations in visit notes\n• Ability to negotiate between cultural preferences and clinical requirements\n• Recognition of and response to discriminatory behavior in the field\n\nResources:\n• CL-PR-001 (Patient Rights & Responsibilities)\n• EEOC: www.eeoc.gov\n• National CLAS Standards reference\n• CL-PR-001 (Patient Rights & Responsibilities) interpreter services contact',
        narration_script: 'Operational next steps. Your field preceptor will evaluate: appropriate greeting and address of patients — no nicknames unless patient-directed. Use of qualified interpreters, not family members, for clinical conversations. Documentation of cultural considerations in visit notes. Ability to negotiate between cultural preferences and clinical requirements. And recognition of and response to discriminatory behavior in the field. Resources: the CL-PR-001 (Patient Rights & Responsibilities), EEOC at www.eeoc.gov, the National CLAS Standards reference, and your CL-PR-001 (Patient Rights & Responsibilities) interpreter services contact.',
        audio_path: '/training-audio/ACHC-ART-M01/l4/nextsteps.wav', image_url: IMG.M01, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m01_l4_surv', type: 'content', title: 'Module Evaluation',
        content: 'Please take a moment to evaluate this module:\n\n1. The content was relevant to my daily work. (1–5)\n2. The scenarios reflected realistic situations I may encounter. (1–5)\n3. The explanations helped me understand the "why" behind correct actions. (1–5)\n4. I feel more prepared to handle cultural barriers in patient care. (1–5)\n5. What topic would you like explored in more depth? (Share with your supervisor)\n\nCompletion of this module validates knowledge reasoning only. It does not constitute clinical field competency or operational clearance. Your completion triggers certificate generation, evidence attachment, and retraining timer initialization (365 days).',
        narration_script: 'Thank you for completing this module. Please evaluate your experience. One: the content was relevant to my daily work. Two: the scenarios reflected realistic situations. Three: the explanations helped me understand the why. Four: I feel more prepared to handle cultural barriers. And five: what topic would you like explored in more depth? Completion of this module validates knowledge reasoning only. It does not constitute clinical field competency. Your completion triggers certificate generation, evidence attachment, and a 365-day retraining timer.',
        audio_path: '/training-audio/ACHC-ART-M01/l4/survey.wav', image_url: IMG.M01, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  /* ══════════════════════ M02 Emergency/Disaster Preparedness ══════════════════════ */

  {
    lesson_id: 'achc_m02_l0', topic_id: 'ACHC-ART-M02', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m02_l0_hook', type: 'challenge', title: 'Pre-Assessment: Test Yourself First',
        content: 'A wildfire approaches your service area. You have 3 patients: Patient A is on a ventilator with no backup power. Patient B is ambulatory but confused (dementia), lives alone. Patient C has a family caregiver and stable chronic conditions. You have 45 minutes before evacuation orders take effect.\n\nWhat is your PRIORITY action sequence?',
        narration_script: 'Pre-assessment. A wildfire is approaching your service area. Patient A is ventilator-dependent with no backup power. Patient B is ambulatory but confused and lives alone. Patient C has a family caregiver and stable conditions. You have 45 minutes. What is your priority action sequence?',
        audio_path: '/training-audio/ACHC-ART-M02/l0/hook.wav', image_url: IMG.M02, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'Visit all three patients in geographic order to save drive time', isCorrect: false, rationale: 'Geographic efficiency ignores clinical urgency. Class I patients must be prioritized.' },
          { id: 'B', label: 'Call 911 for Patient A (life-sustaining equipment), go to Patient B (vulnerable/alone), call Patient C\'s caregiver with instructions', isCorrect: true, rationale: 'Correct — Class I (life-sustaining tech) first, then Class II (vulnerable/alone), then coordinate Class III/IV remotely.' },
          { id: 'C', label: 'Go to the office for instructions before visiting anyone', isCorrect: false, rationale: 'In an active emergency, you follow the communication chain — you do not abandon patients while seeking instructions.' },
          { id: 'D', label: 'Call all three patients and tell them to evacuate on their own', isCorrect: false, rationale: 'Patient A cannot self-evacuate. Patient B may be too confused. You must triage and coordinate actively.' },
        ],
      },
      {
        card_id: 'achc_m02_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Describe the Agency\'s Emergency Preparedness and Response Plan structure and your role within it.\n2. Classify patients using the 4-tier emergency triage system (Class I–IV).\n3. Identify the three categories of emergencies (Man-Made, Natural, Technological).\n4. Execute personal and automobile preparedness requirements for field staff.\n5. Apply correct communication and escalation protocols when normal systems are compromised.\n6. Describe documentation requirements during and after an emergency event.',
        narration_script: 'Learning objectives for this module. One: describe the Agency\'s Emergency Preparedness Plan structure and your role within it. Two: classify patients using the four-tier triage system, Class I through IV. Three: identify the three emergency categories — man-made, natural, and technological. Four: execute personal and automobile preparedness requirements. Five: apply communication and escalation protocols when normal systems are down. Six: describe documentation requirements during and after an emergency.',
        audio_path: '/training-audio/ACHC-ART-M02/l0/objectives.wav', image_url: IMG.M02, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m02_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Class I — Life-threatening; requires life-sustaining medical devices. Must be seen immediately.\n\nClass II — Nursing intervention needed within 24-48 hours. Prioritized after Class I.\n\nClass III — Stable; services can postpone 48-72 hours. Phone management acceptable.\n\nClass IV — Stable, independent; services postponable 72+ hours. Notify of delay only.\n\nDisaster Coordinator — Agency Administrator (or designee). Single point of authority for emergency decisions.\n\nContinuity of Operations Plan — Business continuity addressing essential functions during disaster.\n\nMitigation/Preparedness/Response/Recovery — The four phases of emergency planning. Annual drill required.',
        narration_script: 'Key terms. Class I: life-threatening, life-sustaining equipment, immediate contact required. Class II: nursing intervention within 24 to 48 hours. Class III: stable, can postpone 48 to 72 hours with phone management. Class IV: stable and independent, postpone over 72 hours with notification. Disaster Coordinator: the Administrator or designee — single point of authority. Continuity of Operations Plan: keeps the agency functional during disasters. Mitigation, Preparedness, Response, and Recovery: the four emergency planning phases. Annual drills are required, and ACHC surveys for compliance.',
        audio_path: '/training-audio/ACHC-ART-M02/l0/concepts.wav', image_url: IMG.M02, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m02_l1', topic_id: 'ACHC-ART-M02', title: 'Lesson 1: Emergency Preparedness Plan Framework', order: 1,
    cards: [
      {
        card_id: 'achc_m02_l1_s', type: 'summary', title: 'Every Employee Has a Role in the Emergency Plan',
        content: 'The Agency\'s Emergency Preparedness and Response Plan designates the Administrator as Disaster Coordinator. ALL employees must be oriented to the plan and their specific responsibilities. The plan is reviewed annually AND after every emergency response event.',
        narration_script: 'The Agency\'s Emergency Preparedness Plan designates the Administrator as Disaster Coordinator. All employees must be oriented to the plan and their specific roles. The plan is reviewed annually AND after every emergency response event.',
        audio_path: '/training-audio/ACHC-ART-M02/l1/summary.wav', image_url: IMG.M02, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m02_l1_c1', type: 'content', title: 'The Emergency Plan Framework',
        content: 'The 13-point compliance framework includes: risk assessment, communication procedures, patient categorization, resource inventory, and continuity of operations.\n\nKey facts:\n• Agency is NOT required to physically transport patients — facilitate and coordinate with EMS\n• Patient emergency contacts and triage categories must be readily accessible at all times\n• Plan reviewed yearly AND after every emergency event\n• Professional Advisory Committee reviews emergency plan annually\n• Three emergency categories: Man-Made (fire, violence), Natural (floods, hurricanes), Technological (power failure, cyber attack)',
        narration_script: 'The thirteen-point compliance framework includes risk assessment, communication procedures, patient categorization, resource inventory, and continuity of operations. Key facts: the Agency is not required to physically transport patients — your role is to facilitate and coordinate with EMS. Patient emergency contacts and triage categories must always be accessible. The plan is reviewed yearly and after every emergency. Three categories of emergencies: man-made, natural, and technological.',
        audio_path: '/training-audio/ACHC-ART-M02/l1/content1.wav', image_url: IMG.M02, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m02_l1_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Know the communication chain BEFORE an emergency — primary AND alternate contacts\n• Your job in an emergency: triage → communicate → coordinate, not independently manage\n• Patient triage classifications must be documented and accessible in every chart\n• "Freelancing" during emergencies (acting without following the communication chain) is prohibited\n• Keep the patient triage classification list updated with each visit',
        narration_script: 'Operational takeaways. Know the communication chain before an emergency — primary and alternate contacts. Your role is to triage, communicate, and coordinate — not to manage emergencies independently. Patient triage classifications must be documented and accessible in every chart. Freelancing — acting without following the communication chain — is prohibited. Keep your patient triage classification list updated with each visit.',
        audio_path: '/training-audio/ACHC-ART-M02/l1/takeaways.wav', image_url: IMG.M02, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m02_l1_ch', type: 'challenge', title: 'Challenge: 2 AM Flash Flood Alert',
        content: 'It\'s 2 AM Saturday. You receive a weather alert about flash flooding in your service area. You have 6 patients scheduled for morning visits. The office is closed and you cannot reach the Administrator.\n\nAccording to OP-FM-005 (Emergency Operations & Business Continuity), what should you do FIRST?',
        narration_script: 'Challenge scenario. It is 2 AM on a Saturday. You receive a weather alert about flash flooding in your service area. Six patients are scheduled for morning visits. The office is closed and you cannot reach the Administrator. According to OP-FM-005 (Emergency Operations & Business Continuity), what should you do first?',
        audio_path: '/training-audio/ACHC-ART-M02/l1/challenge.wav', image_url: IMG.M02, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Cancel all visits and go back to sleep — the office will handle it Monday', isCorrect: false, rationale: 'Class I patients cannot wait until Monday. Abandoning the communication protocol is a serious safety failure.' },
          { id: 'B', label: 'Attempt contact with the Alternate Administrator/on-call supervisor using the established communication chain', isCorrect: true, rationale: 'Correct — the communication plan has primary AND alternate contacts. Follow the chain, do not act independently or ignore the situation.' },
          { id: 'C', label: 'Drive to each patient\'s home to check on them personally', isCorrect: false, rationale: 'Acting without authorization in an unsafe environment (flooding) is independent action prohibited by policy.' },
          { id: 'D', label: 'Post on social media asking if anyone knows what to do', isCorrect: false, rationale: 'Social media is not a clinical communication channel and violates patient confidentiality protocols.' },
        ],
      },
      {
        card_id: 'achc_m02_l1_deb', type: 'content', title: 'Operational Debrief: Communication Chain',
        content: 'The emergency communication plan is not optional — it exists precisely for situations when normal channels fail.\n\nWhy the others fail:\n• A: Class I patients on life-sustaining equipment cannot wait until business hours\n• C: Independent action in unsafe conditions creates personal liability and may not address highest-risk patients first\n• D: Social media is never an emergency communication channel — it is a HIPAA risk\n\nDocumentation during emergencies: each contact attempt must be recorded with time, method, and result.\nACHC requires documentation of every emergency response including communication attempts.',
        narration_script: 'Debrief. The emergency communication chain is not optional — it exists precisely for when normal channels fail. Option A fails Class I patients who cannot wait until Monday. Option C creates personal liability and bypasses the triage prioritization system. Option D is never appropriate — social media is a HIPAA risk, not a communication channel. Every contact attempt during an emergency must be documented with the time, method, and result. ACHC requires documentation of all emergency responses.',
        audio_path: '/training-audio/ACHC-ART-M02/l1/debrief.wav', image_url: IMG.M02, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m02_l2', topic_id: 'ACHC-ART-M02', title: 'Lesson 2: Patient Triage and Evacuation', order: 2,
    cards: [
      {
        card_id: 'achc_m02_l2_s', type: 'summary', title: 'Classify First — Then Act',
        content: 'Triage classification determines action priority. Class I patients (life-sustaining technology dependent) require immediate emergency services coordination. The classification must be in every patient chart. Your personal vehicle is NEVER an approved patient transport vehicle.',
        narration_script: 'Triage classification determines action priority. Class I patients — those on life-sustaining technology — require immediate emergency services coordination. Classification must be documented in every patient chart. Your personal vehicle is never an approved patient transport vehicle.',
        audio_path: '/training-audio/ACHC-ART-M02/l2/summary.wav', image_url: IMG.M02, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m02_l2_c1', type: 'content', title: 'Triage Classification Guide',
        content: 'Class I — Life-sustaining equipment (ventilators, oxygen, infusion pumps). Action: 911 + immediate coordination.\n\nClass II — Requires nursing intervention within 24-48 hours (wound care, complex medication). Action: prioritized after Class I; schedule same day if possible.\n\nClass III — Stable; phone management acceptable for 48-72 hours. Action: telephone assessment + coordinate rescheduling.\n\nClass IV — Stable and independent; can postpone 72+ hours without risk. Action: notify of delay only.\n\nDocumentation during emergencies: time-stamp all actions and communication attempts. If normal EHR is unavailable, use paper backup and transfer to EHR within 24 hours of system restoration.',
        narration_script: 'Triage classification guide. Class I: life-sustaining equipment — call 911 and coordinate immediately. Class II: nursing intervention within 24 to 48 hours — prioritize after Class I. Class III: stable, phone management acceptable for 48 to 72 hours. Class IV: stable and independent, notify of delay only. Documentation during emergencies: time-stamp all actions. If the EHR is unavailable, use paper backup and transfer within 24 hours of restoration.',
        audio_path: '/training-audio/ACHC-ART-M02/l2/content1.wav', image_url: IMG.M02, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m02_l2_tkwy', type: 'content', title: 'Evacuation and Continuity Rules',
        content: '• Agency is NOT required to transport patients — facilitate and coordinate with EMS\n• Do NOT use your personal vehicle to transport patients (liability, safety, insurance)\n• Patient who refuses to evacuate: document refusal, explain risks, notify supervisor, contact EMS\n• HIPAA and documentation obligations do NOT disappear during emergencies\n• All 3 contact attempts must be documented with time, method, and result\n• After the emergency: debrief, update triage classifications, revise emergency plan if needed',
        narration_script: 'Evacuation rules. The Agency is not required to transport patients — facilitate and coordinate with EMS. Never use your personal vehicle to transport patients. When a patient refuses to evacuate: document the refusal, explain the risks, notify your supervisor, and contact EMS. HIPAA and documentation obligations continue during emergencies. Each of your three contact attempts must be documented with time, method, and result. After the emergency, debrief and update triage classifications.',
        audio_path: '/training-audio/ACHC-ART-M02/l2/takeaways.wav', image_url: IMG.M02, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m02_l2_ch', type: 'challenge', title: 'Challenge: Patient Refuses Evacuation',
        content: 'A mandatory evacuation order is in effect. Your Class II patient (complex wound, no life-sustaining equipment) refuses to evacuate: "I\'ve lived here 40 years. I\'m not leaving." You have notified your supervisor. Your documentation must include:\n\nWhich of the following must be documented?',
        narration_script: 'Challenge scenario. A mandatory evacuation order is in effect. Your Class II patient refuses to evacuate, saying she has lived there 40 years and is not leaving. You have notified your supervisor. Which of the following must be documented?',
        audio_path: '/training-audio/ACHC-ART-M02/l2/challenge.wav', image_url: IMG.M02, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Nothing — refusal ends your liability', isCorrect: false, rationale: 'Refusal of care must always be documented with the specific risks explained and all notifications made.' },
          { id: 'B', label: 'The patient\'s verbal refusal, your explanation of risks, all notifications made, and the time of each', isCorrect: true, rationale: 'Correct — thorough documentation of refusal, risk counseling, and notifications is the standard.' },
          { id: 'C', label: 'Only the supervisor notification', isCorrect: false, rationale: 'Partial documentation creates clinical and legal gaps. All elements must be recorded.' },
          { id: 'D', label: 'The patient\'s insurance information for risk transfer', isCorrect: false, rationale: 'Insurance documentation does not substitute for clinical care documentation of a patient safety situation.' },
        ],
      },
      {
        card_id: 'achc_m02_l2_deb', type: 'content', title: 'Operational Debrief: Documenting Refusal',
        content: 'Patient refusal during an emergency does not end your documentation obligation — it triggers it.\n\nRequired documentation elements:\n1. The specific refusal and patient\'s stated reason\n2. Risks you explained and patient\'s response\n3. All notifications made (supervisor, EMS) and at what time\n4. Any alternative safety measures offered\n5. Your plan for follow-up\n\nSurvey implication: ACHC reviews whether staff appropriately documented patient contact and safety counseling during emergency events. Inadequate documentation = deficiency regardless of clinical outcome.',
        narration_script: 'Debrief. Patient refusal during an emergency does not end your documentation obligation — it triggers it. Required elements: the specific refusal and patient\'s reason, the risks you explained, all notifications made with timestamps, any alternative safety measures offered, and your follow-up plan. ACHC reviews emergency documentation during surveys. Inadequate documentation is a deficiency regardless of the clinical outcome.',
        audio_path: '/training-audio/ACHC-ART-M02/l2/debrief.wav', image_url: IMG.M02, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m02_l3', topic_id: 'ACHC-ART-M02', title: 'Lesson 3: Personal Preparedness & Documentation', order: 3,
    cards: [
      {
        card_id: 'achc_m02_l3_s', type: 'summary', title: 'Your Personal Preparedness Protects Your Patients',
        content: 'Field staff cannot help patients in emergencies if they themselves are unprepared. Personal and automobile preparedness is a clinical requirement — not a personal choice. Unprepared field staff during emergencies creates patient safety gaps and ACHC survey findings.',
        narration_script: 'Field staff cannot help patients in emergencies if they are unprepared. Personal and automobile preparedness is a clinical requirement, not a personal choice. Unprepared field staff creates patient safety gaps and ACHC survey findings.',
        audio_path: '/training-audio/ACHC-ART-M02/l3/summary.wav', image_url: IMG.M02, estimated_duration: '0:35', completion_required: true,
      },
      {
        card_id: 'achc_m02_l3_c1', type: 'content', title: 'Field Staff Preparedness Requirements',
        content: 'Personal preparedness kit: 72-hour supply of water, food, medications, first aid, flashlight, battery/hand-crank radio.\n\nAutomobile: Keep gas at minimum half tank during emergency season. Emergency reflectors/flares, blanket, extra phone charger.\n\nClinical bag: sufficient supplies for 48 hours of patient care; backup paper documentation forms.\n\nDocumentation during emergencies:\n• Shift to paper if EHR unavailable\n• All entries time-stamped\n• Transfer to EHR within 24 hours of system restoration\n• Documentation obligations do NOT pause during emergencies',
        narration_script: 'Field staff preparedness requirements. Personal kit: 72-hour supply of water, food, medications, first aid, flashlight, and battery radio. Automobile: minimum half tank of fuel during emergency season, emergency flares, blanket, extra phone charger. Clinical bag: 48 hours of patient care supplies and backup paper forms. Documentation during emergencies: shift to paper if the EHR is unavailable, time-stamp all entries, and transfer to the EHR within 24 hours of restoration. Documentation obligations never pause.',
        audio_path: '/training-audio/ACHC-ART-M02/l3/content1.wav', image_url: IMG.M02, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m02_l3_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Know your communication chain BEFORE you need it — primary AND alternate\n• Know the triage classification of EVERY patient on your caseload\n• Personal vehicle transport of patients = liability; ALWAYS use EMS\n• Documentation continues during emergencies — time-stamp, paper backup, EHR transfer\n• Report to your Disaster Coordinator — do not make independent resource commitments\n• Annual drill is required; ACHC surveys for drill documentation and compliance',
        narration_script: 'Key takeaways. Know your communication chain before you need it. Know the triage classification of every patient on your caseload. Never use your personal vehicle to transport patients. Documentation continues during emergencies — use paper backup and transfer to EHR when restored. Report to your Disaster Coordinator — do not make independent resource commitments. Annual drills are required and ACHC surveys for compliance.',
        audio_path: '/training-audio/ACHC-ART-M02/l3/takeaways.wav', image_url: IMG.M02, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m02_l3_ch', type: 'challenge', title: 'Challenge: Post-Emergency Documentation',
        content: 'During a hurricane event, your EHR was offline for 18 hours. You managed 4 patients on paper forms. The system was restored this morning. It is now 6 hours later and you have not transferred the paper records to the EHR.\n\nWhat is the correct action?',
        narration_script: 'Challenge scenario. During a hurricane, your EHR was offline for 18 hours. You managed four patients using paper forms. The system was restored this morning. It is now six hours later and you have not transferred the records. What is the correct action?',
        audio_path: '/training-audio/ACHC-ART-M02/l3/challenge.wav', image_url: IMG.M02, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'The paper forms are sufficient — the documentation was done', isCorrect: false, rationale: 'Paper backup must be transferred to the EHR within 24 hours of system restoration per emergency protocol.' },
          { id: 'B', label: 'Transfer all paper records to the EHR immediately — you have used most of your 24-hour window', isCorrect: true, rationale: 'Correct — the 24-hour transfer requirement applies from the time the system was restored.' },
          { id: 'C', label: 'Wait until the next scheduled visit to each patient before transferring', isCorrect: false, rationale: 'Transfer timing is based on system restoration time, not visit schedule. The 24-hour window applies.' },
          { id: 'D', label: 'Notify the Disaster Coordinator and wait for instructions', isCorrect: false, rationale: 'The protocol is clear: transfer within 24 hours. No additional authorization is needed.' },
        ],
      },
      {
        card_id: 'achc_m02_l3_deb', type: 'content', title: 'Operational Debrief: EHR Backup Transfer',
        content: 'The 24-hour EHR transfer requirement begins at system restoration, not at the end of the emergency period.\n\nWhy the others fail:\n• A: Paper forms are not the final record. They are temporary documentation until EHR transfer.\n• C: Visit schedule is irrelevant to the documentation transfer timeline.\n• D: No additional authorization is needed — this is standard protocol.\n\nAfter an emergency: complete the debrief report, update patient triage classifications based on new information, and contribute to the emergency plan revision as needed.\n\nACHC surveys emergency response documentation as part of the emergency preparedness standards.',
        narration_script: 'Debrief. The 24-hour transfer requirement begins at system restoration, not at the end of the emergency. Paper forms are temporary — they are not the final record. Visit schedule is irrelevant to the transfer timeline. No additional authorization is needed to transfer records. After every emergency, complete the debrief report, update patient triage classifications, and contribute to emergency plan revision. ACHC surveys emergency response documentation as part of preparedness standards.',
        audio_path: '/training-audio/ACHC-ART-M02/l3/debrief.wav', image_url: IMG.M02, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m02_l4', topic_id: 'ACHC-ART-M02', title: 'Module Wrap-Up & Completion', order: 4,
    cards: [
      {
        card_id: 'achc_m02_l4_syn', type: 'summary', title: 'Summary & Synthesis',
        content: '6 things you must take from this module:\n\n1. Know the triage classification of EVERY patient before an emergency — not during one\n2. Class I (life-sustaining tech) → 911 first. Class IV (stable/independent) → notification only\n3. Your role is to facilitate and coordinate — NOT to transport patients in your personal vehicle\n4. Documentation continues during emergencies — paper backup, EHR transfer within 24 hours\n5. "Freelancing" (acting outside the communication chain) is prohibited and creates liability\n6. Annual drill is required — ACHC surveys for drill documentation\n\nOperational bridge: Your field preceptor will evaluate your knowledge of the triage system, communication chain, and documentation practices during emergency scenarios.',
        narration_script: 'Six takeaways. One: know every patient\'s triage classification before an emergency. Two: Class I means 911 first, Class IV means notification only. Three: your role is to facilitate and coordinate, never to transport in your personal vehicle. Four: documentation continues during emergencies with paper backup and 24-hour EHR transfer. Five: freelancing outside the communication chain is prohibited. Six: annual drills are required and ACHC surveys for compliance. Your preceptor will evaluate your knowledge of the triage system, communication chain, and emergency documentation.',
        audio_path: '/training-audio/ACHC-ART-M02/l4/synthesis.wav', image_url: IMG.M02, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m02_l4_fdeb', type: 'content', title: 'Mandatory Final Debrief',
        content: 'A correct answer does NOT guarantee correct reasoning. Reflect on these principles:\n\n1. Triage classification is a clinical assignment — re-evaluate it at every significant change in patient status\n2. The emergency plan\'s value is proportional to how well you know it before the emergency\n3. Documentation during chaos is hard — prepare paper backup forms in advance\n4. Patient refusal of evacuation is not the end of your responsibility — it is a documentation trigger\n5. Your personal preparedness is not optional — an unprepared clinician cannot provide emergency support\n\nConfidence check: How confident are you in triaging your patients and following the emergency communication chain under real-time pressure?',
        narration_script: 'A correct answer does not guarantee correct reasoning. Reflect on these five principles. One: triage classification must be re-evaluated at every significant patient status change. Two: the emergency plan\'s value depends on how well you know it before you need it. Three: documentation during chaos is hard — prepare paper backup forms in advance. Four: patient refusal of evacuation triggers documentation, not the end of your responsibility. Five: your personal preparedness is not optional. How confident are you in triaging and following the communication chain under real pressure?',
        audio_path: '/training-audio/ACHC-ART-M02/l4/finaldebrief.wav', image_url: IMG.M02, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m02_l4_nxt', type: 'content', title: 'Operational Next Steps',
        content: 'Your field preceptor will evaluate:\n• Knowledge of the OP-FM-005 (Emergency Operations & Business Continuity) communication chain (can you name primary and alternate contacts?)\n• Ability to classify your current patients using the Class I-IV system\n• Documentation practices during simulated communication failure\n• Knowledge of personal and automobile preparedness requirements\n• Response to a patient who refuses emergency evacuation\n\nResources:\n• OP-FM-005 (Emergency Operations & Business Continuity)\n• Patient triage classification forms\n• Disaster Coordinator contact information\n• Agency after-hours/on-call contact list',
        narration_script: 'Operational next steps. Your field preceptor will evaluate: your knowledge of the OP-FM-005 (Emergency Operations & Business Continuity) communication chain, your ability to classify patients using the Class I through IV system, your documentation practices during simulated communication failure, your personal and automobile preparedness, and your response to a patient who refuses evacuation. Resources: the OP-FM-005 (Emergency Operations & Business Continuity), patient triage forms, Disaster Coordinator contact, and after-hours contact list.',
        audio_path: '/training-audio/ACHC-ART-M02/l4/nextsteps.wav', image_url: IMG.M02, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m02_l4_surv', type: 'content', title: 'Module Evaluation',
        content: 'Please evaluate this module:\n\n1. The content was relevant to emergency scenarios I may encounter. (1–5)\n2. The triage classification system was clearly explained. (1–5)\n3. The communication chain process was understandable. (1–5)\n4. I feel more prepared to respond to emergencies in the field. (1–5)\n5. What emergency scenario would you like more training on? (Share with your supervisor)\n\nCompletion of this module validates knowledge reasoning only. It does not constitute clinical field competency or operational clearance. Completion triggers certificate generation, evidence attachment, and 365-day retraining timer initialization.',
        narration_script: 'Thank you for completing this module. Please evaluate: the relevance to emergency scenarios, clarity of the triage classification system, understanding of the communication chain process, and your preparedness level. Also share what emergency scenario you\'d like more training on. Completion validates knowledge reasoning only, not field competency. It triggers certificate generation, evidence attachment, and a 365-day retraining timer.',
        audio_path: '/training-audio/ACHC-ART-M02/l4/survey.wav', image_url: IMG.M02, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  /* ══════════════════════ M03 Complaints & Grievances ══════════════════════ */

  {
    lesson_id: 'achc_m03_l0', topic_id: 'ACHC-ART-M03', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m03_l0_hook', type: 'challenge', title: 'Pre-Assessment: Test Yourself First',
        content: 'During your visit, the patient\'s wife becomes upset: "That aide who came yesterday was rough with my husband — she left bruises on his arms. I want her fired and I\'m calling the state." You observe faint bruising on the patient\'s upper arms consistent with grip marks.\n\nWhat is your IMMEDIATE response?',
        narration_script: 'Pre-assessment. During your visit, the patient\'s wife becomes upset and says the aide who came yesterday was rough and left bruises on her husband\'s arms. She wants to call the state. You observe bruising consistent with grip marks. What is your immediate response?',
        audio_path: '/training-audio/ACHC-ART-M03/l0/hook.wav', image_url: IMG.M03, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'Calm the wife and explain it was probably unintentional — don\'t make it a big deal', isCorrect: false, rationale: 'Minimizing potential abuse allegations is dangerous and creates liability.' },
          { id: 'B', label: 'Assess patient for injury, document findings objectively, explain the complaint process, and immediately report to supervisor as potential abuse', isCorrect: true, rationale: 'Correct — physical bruising after care is a potential abuse allegation requiring mandatory reporting, not a routine grievance.' },
          { id: 'C', label: 'Tell the wife she needs to call the office during business hours to file a formal complaint', isCorrect: false, rationale: 'Redirecting for a potential abuse allegation delays mandatory reporting and violates your immediate obligation.' },
          { id: 'D', label: 'Confront the aide by phone to get her side of the story', isCorrect: false, rationale: 'Investigation is not your role. You observe, document, and report immediately. Do not contact the accused party.' },
        ],
      },
      {
        card_id: 'achc_m03_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Define the difference between a complaint, grievance, and abuse allegation.\n2. Describe the Agency\'s complaint/grievance investigation and resolution process.\n3. Demonstrate professional de-escalation techniques when patients express dissatisfaction.\n4. Identify required timeframes for complaint acknowledgment and resolution.\n5. Explain staff rights within the grievance process, including protection from retaliation.\n6. Complete a complaint form accurately with required elements.',
        narration_script: 'Learning objectives. One: define the difference between a complaint, grievance, and abuse allegation. Two: describe the Agency\'s investigation and resolution process. Three: demonstrate de-escalation techniques. Four: identify required timeframes for complaint resolution. Five: explain staff rights in the grievance process, including retaliation protection. Six: complete a complaint form accurately.',
        audio_path: '/training-audio/ACHC-ART-M03/l0/objectives.wav', image_url: IMG.M03, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m03_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Grievance — A concern where the patient believes a wrong occurred. Triggers formal investigation by Administrator. Must be documented in clinical record AND Administrator\'s log.\n\nComplaint — Any expression of dissatisfaction. Still requires documentation and reporting.\n\nReprisal — Retaliation against a person for exercising the right to complain. Strictly prohibited.\n\nWritten Response — Required within 10 days of grievance receipt. Must include decision AND appeal rights.\n\nAppeal — Patient\'s right to escalate to Governing Body; reviewed within 30 days.\n\nPI Report — Annual performance improvement report including summary of all grievances.\n\nRegulatory Hotline — State regulatory and ACHC phone numbers given to patients at admission.',
        narration_script: 'Key terms. Grievance: a concern where the patient believes a wrong occurred — triggers formal investigation and must be in the clinical record and Administrator\'s log. Complaint: any expression of dissatisfaction — still requires documentation. Reprisal: retaliation for complaining — strictly prohibited. Written Response: required within 10 days, must include the decision and appeal rights. Appeal: patient\'s right to escalate to the Governing Body within 30 days. PI Report: annual performance improvement report including grievance summary. Regulatory Hotline: state and ACHC numbers given to patients at admission.',
        audio_path: '/training-audio/ACHC-ART-M03/l0/concepts.wav', image_url: IMG.M03, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m03_l1', topic_id: 'ACHC-ART-M03', title: 'Lesson 1: Understanding the Grievance Framework', order: 1,
    cards: [
      {
        card_id: 'achc_m03_l1_s', type: 'summary', title: 'Any Employee Can Receive a Complaint',
        content: 'CL-PR-004 (Restraint & Seclusion Prohibition) states: "Any employee receiving a complaint/grievance will complete and submit a report to the Administrator." There are no exceptions based on role, severity perception, or department. Receiving a complaint is your responsibility regardless of whether it is "your area."',
        narration_script: 'CL-PR-004 (Restraint & Seclusion Prohibition) is clear: any employee receiving a complaint or grievance must complete and submit a report to the Administrator. There are no exceptions based on role, perceived severity, or department. Receiving and documenting complaints is your responsibility regardless of whether the issue is in your department.',
        audio_path: '/training-audio/ACHC-ART-M03/l1/summary.wav', image_url: IMG.M03, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m03_l1_c1', type: 'content', title: 'The Grievance Framework',
        content: 'Patient rights:\n• Informed at admission of the right to complain — verbally AND in writing\n• Provided state regulatory hotline AND ACHC telephone number at admission\n• Right to complain at ANY time without fear of reprisal or repercussion\n\nDocumentation requirements:\n• Both the existence AND resolution documented in clinical record AND Administrator\'s log\n• After-hours: notify on-call supervisor; submit complaint form next business day\n• Retained 3 years minimum\n• Reported to Governing Body quarterly\n• Included in annual Performance Improvement report',
        narration_script: 'The framework. Patients are informed at admission of their right to complain — verbally and in writing. They receive the state regulatory hotline and ACHC telephone number at admission. They can complain at any time without reprisal. Documentation: both the existence and resolution must be in the clinical record and Administrator\'s log. After-hours: notify the on-call supervisor and submit the form the next business day. Records are retained three years, reported to the Governing Body quarterly, and included in the annual Performance Improvement report.',
        audio_path: '/training-audio/ACHC-ART-M03/l1/content1.wav', image_url: IMG.M03, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m03_l1_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• ALL patients receive the regulatory hotline and ACHC number at admission — verify this happened\n• Every complaint must be documented — even if you believe it is minor or unfounded\n• Staff are trained on grievance policies at orientation AND annually\n• Never promise a resolution you cannot guarantee — acknowledge and submit\n• After-hours complaint: notify supervisor → form next business day',
        narration_script: 'Takeaways. All patients receive the regulatory hotline and ACHC number at admission. Every complaint must be documented — even if it seems minor or unfounded. Staff are trained on grievance policies at orientation and annually. Never promise a resolution you cannot guarantee — acknowledge the concern and submit the form. For after-hours complaints: notify the on-call supervisor and submit the form the next business day.',
        audio_path: '/training-audio/ACHC-ART-M03/l1/takeaways.wav', image_url: IMG.M03, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m03_l1_ch', type: 'challenge', title: 'Challenge: Scheduling Complaint',
        content: 'You are finishing a visit when the patient says: "I don\'t like that the scheduler keeps changing my visit times. Last week I missed my dialysis transport because your nurse came late." The patient is annoyed but not angry.\n\nWhat is the CORRECT response?',
        narration_script: 'Challenge scenario. At the end of your visit, the patient says the scheduler keeps changing visit times and she missed her dialysis transport last week because the nurse came late. She is annoyed but not angry. What is the correct response?',
        audio_path: '/training-audio/ACHC-ART-M03/l1/challenge.wav', image_url: IMG.M03, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Apologize, promise it won\'t happen again, and move on', isCorrect: false, rationale: 'Making promises without authority creates false expectations and bypasses the formal process.' },
          { id: 'B', label: 'Acknowledge the concern, document it on a complaint form, submit to the Administrator, and inform the patient that someone will follow up', isCorrect: true, rationale: 'Correct — any employee receiving a complaint must document and submit it. You do not redirect or dismiss.' },
          { id: 'C', label: 'Tell the patient to call the office if they want to make a formal complaint', isCorrect: false, rationale: 'Redirecting places burden on the patient and fails to capture the complaint when reported to you.' },
          { id: 'D', label: 'Explain that scheduling is not your department', isCorrect: false, rationale: 'All employees must receive complaints regardless of department. "Not my department" violates policy.' },
        ],
      },
      {
        card_id: 'achc_m03_l1_deb', type: 'content', title: 'Operational Debrief: Complaint Reception',
        content: 'Policy leaves no room for interpretation: "Any employee receiving a complaint will complete and submit a report." No exceptions.\n\nWhy the others fail:\n• A: Promises without authority create false expectations and do not trigger the formal process\n• C: Redirecting the patient to call violates the right to have any staff member receive the complaint\n• D: "Not my department" is never acceptable — you are the Agency\'s representative in the field\n\nPatient safety note: A missed dialysis transport is a potential adverse event — the scheduling pattern should trigger root cause analysis, not just an apology.',
        narration_script: 'Debrief. Policy is clear: any employee receiving a complaint must submit a report. No exceptions. Option A creates false expectations without triggering the formal process. Option C violates the patient\'s right to have any staff member receive their complaint. Option D is never acceptable. And a clinical note: a missed dialysis transport is a potential adverse event. The scheduling pattern should trigger root cause analysis, not just an apology.',
        audio_path: '/training-audio/ACHC-ART-M03/l1/debrief.wav', image_url: IMG.M03, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m03_l2', topic_id: 'ACHC-ART-M03', title: 'Lesson 2: Investigation & Resolution Process', order: 2,
    cards: [
      {
        card_id: 'achc_m03_l2_s', type: 'summary', title: '10 Days to Respond — No Exceptions',
        content: 'The Agency must provide a written response to any grievance within 10 days of receipt. The clock starts at RECEIPT, not at resolution. The response must explain the decision AND notify the patient of their right to appeal. Late responses are a survey deficiency.',
        narration_script: 'The Agency must respond in writing to any grievance within 10 days of receipt. The clock starts at receipt, not when the investigation concludes. The response must explain the decision and notify the patient of the right to appeal. Late responses are an automatic survey deficiency.',
        audio_path: '/training-audio/ACHC-ART-M03/l2/summary.wav', image_url: IMG.M03, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m03_l2_c1', type: 'content', title: 'The Investigation and Resolution Process',
        content: 'Administrator\'s role:\n• Interview all persons involved\n• Evaluate all collected information\n• Document activities, investigation findings, analysis, resolution, and outcomes\n• Send written response within 10 days\n• Include: decision + right to appeal\n\nAppeal process:\n• Patient can appeal to a Governing Body member\n• Governing Body must review within 30 days\n• After-hours complaints: on-call supervisor notified; form submitted next business day\n\nYour role as field staff: document accurately, submit promptly, cooperate with investigation if called upon.',
        narration_script: 'The investigation process. The Administrator interviews all involved parties, evaluates all information, and documents activities, findings, analysis, resolution, and outcomes. A written response is sent within 10 days, including the decision and the right to appeal. For appeals: the Governing Body reviews within 30 days. For after-hours complaints: notify the on-call supervisor and submit the form the next business day. Your role: document accurately, submit promptly, and cooperate with investigations.',
        audio_path: '/training-audio/ACHC-ART-M03/l2/content1.wav', image_url: IMG.M03, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m03_l2_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• 10 days = initial response. 30 days = appeal response by Governing Body\n• Resolution documented in BOTH clinical record AND Administrator\'s log\n• Patient ALWAYS notified of right to appeal — this is not optional\n• The written response is the patient\'s protection — do not delay it\n• Verbal grievances get the same written response as written grievances',
        narration_script: 'Takeaways. Ten days for initial response. Thirty days for the Governing Body appeal response. Resolution is documented in both the clinical record and Administrator\'s log. The patient is always notified of the right to appeal — this is not optional. Written responses are the patient\'s protection — do not delay them. Verbal grievances receive the same written response as written grievances.',
        audio_path: '/training-audio/ACHC-ART-M03/l2/takeaways.wav', image_url: IMG.M03, estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'achc_m03_l2_ch', type: 'challenge', title: 'Challenge: Response Timeline',
        content: 'A patient submits a written grievance on March 1 about a caregiver using their personal phone during visits. The Administrator investigates and determines the complaint is valid.\n\nBy what date must the patient receive a written response?',
        narration_script: 'Challenge scenario. A patient submits a written grievance on March 1 about a caregiver using their personal phone during visits. The Administrator investigates and confirms the complaint is valid. By what date must the patient receive a written response?',
        audio_path: '/training-audio/ACHC-ART-M03/l2/challenge.wav', image_url: IMG.M03, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'March 5 (5 days)', isCorrect: false, rationale: 'Five days is not the standard — though responding faster is always acceptable.' },
          { id: 'B', label: 'March 11 (10 days)', isCorrect: true, rationale: 'Correct — policy requires written response within 10 days of receipt. The 30-day window applies only to Governing Body appeals.' },
          { id: 'C', label: 'March 31 (30 days)', isCorrect: false, rationale: 'Thirty days is the appeal review timeline for the Governing Body, not the initial response.' },
          { id: 'D', label: 'Whenever the investigation is complete', isCorrect: false, rationale: 'Open-ended timelines violate the patient\'s right to timely resolution and create survey deficiencies.' },
        ],
      },
      {
        card_id: 'achc_m03_l2_deb', type: 'content', title: 'Operational Debrief: Timeline Precision',
        content: 'Timelines exist to protect patients. Confusion between 10-day and 30-day deadlines is one of the most common survey deficiencies.\n\n• 10 days: initial written response to ALL grievances (verbal and written)\n• 30 days: Governing Body review of appeal\n• These timelines are measured from RECEIPT, not from investigation completion\n\nACHC surveyors will check complaint logs for response dates. A late response — even by one day — is an automatic survey finding.',
        narration_script: 'Debrief. Confusion between the 10-day and 30-day deadlines is one of the most common survey deficiencies. Ten days is the initial written response to all grievances — verbal and written. Thirty days is the Governing Body appeal review. Both timelines begin at receipt, not at the end of the investigation. ACHC surveyors check complaint logs for response dates. A late response, even by one day, is an automatic finding.',
        audio_path: '/training-audio/ACHC-ART-M03/l2/debrief.wav', image_url: IMG.M03, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m03_l3', topic_id: 'ACHC-ART-M03', title: 'Lesson 3: De-Escalation & Staff Rights', order: 3,
    cards: [
      {
        card_id: 'achc_m03_l3_s', type: 'summary', title: 'Patient Anger Does Not Negate the Validity of the Complaint',
        content: 'De-escalation is a clinical skill. Your job is to remain calm, acknowledge the concern without assigning blame, ensure your safety, and document everything. The manner of delivery (angry, upset, confrontational) does not change the substance of the complaint or your documentation obligation.',
        narration_script: 'De-escalation is a clinical skill. Your job is to remain calm, acknowledge the concern without assigning blame, ensure your safety, and document everything. How the complaint is delivered — whether angry, upset, or confrontational — does not change the substance of the complaint or your documentation obligation.',
        audio_path: '/training-audio/ACHC-ART-M03/l3/summary.wav', image_url: IMG.M03, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m03_l3_c1', type: 'content', title: 'De-Escalation and Staff Rights',
        content: 'De-escalation principles:\n• Remain calm and objective — do not match their emotional intensity\n• Acknowledge the concern: "I hear you and I want to make sure this is addressed"\n• Never yell, assign blame, accept blame, or call names\n• Assess your physical safety first — never force entry, never feel trapped\n• Document both the complaint content AND the circumstances of delivery\n\nStaff rights:\n• May request assignment change for personality conflict without repercussion\n• Same formal complaint process available to staff (through Director, then President/CEO)\n• Religious/cultural accommodation available for specific procedures\n• Protection from retaliation for good-faith complaints',
        narration_script: 'De-escalation principles: stay calm and objective, acknowledge the concern, never yell or assign blame, and assess your physical safety first. Document both the complaint content and the circumstances of delivery. Staff rights: you may request an assignment change for personality conflict without repercussion. The same formal complaint process is available to staff through the Director and then the President. Religious and cultural accommodations for specific procedures are available, and you are protected from retaliation for good-faith complaints.',
        audio_path: '/training-audio/ACHC-ART-M03/l3/content1.wav', image_url: IMG.M03, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m03_l3_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Acknowledge → Don\'t blame → Stay professional → Document → Report\n• Your physical safety assessment is part of the de-escalation sequence\n• An angry patient is expressing a concern — address the concern, not the anger\n• Never argue, contradict, or dismiss — these escalate and may constitute an admission\n• When a complaint involves suspected abuse/neglect → mandatory reporting pathway (not grievance process)\n• "Injuries of unknown source" are automatic investigation triggers',
        narration_script: 'Takeaways. The sequence: acknowledge, don\'t blame, stay professional, document, report. Your physical safety assessment is part of de-escalation. An angry patient is expressing a concern — address the concern, not the anger. Never argue, contradict, or dismiss. When a complaint involves suspected abuse or neglect, it goes to the mandatory reporting pathway, not just the grievance process. Injuries of unknown source are automatic investigation triggers.',
        audio_path: '/training-audio/ACHC-ART-M03/l3/takeaways.wav', image_url: IMG.M03, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m03_l3_ch', type: 'challenge', title: 'Challenge: Confrontational Family Member',
        content: 'A patient\'s adult son confronts you at the door shouting: "You people don\'t know what you\'re doing! My mother\'s pain medication wasn\'t refilled and she\'s been suffering for 2 days! I\'m going to sue this agency!" He is blocking the doorway.\n\nWhat is the CORRECT sequence of actions?',
        narration_script: 'Challenge scenario. A patient\'s adult son confronts you at the door, shouting that the agency doesn\'t know what it\'s doing, that his mother\'s pain medication hasn\'t been refilled for two days, and that he is going to sue. He is blocking the doorway. What is the correct sequence of actions?',
        audio_path: '/training-audio/ACHC-ART-M03/l3/challenge.wav', image_url: IMG.M03, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Match his energy to show you take it seriously; push past to check on the patient', isCorrect: false, rationale: 'Matching aggression escalates. Never force entry into a situation where you feel physically blocked.' },
          { id: 'B', label: 'Maintain calm, acknowledge the concern without blame, assess safety, explain you will help resolve the medication issue, and document the interaction', isCorrect: true, rationale: 'Correct — de-escalation plus acknowledgment of the legitimate clinical concern plus documentation.' },
          { id: 'C', label: 'Leave immediately — you don\'t have to tolerate verbal abuse', isCorrect: false, rationale: 'Verbal frustration alone does not require immediate departure. Assess the threat level — the medication issue also requires attention.' },
          { id: 'D', label: 'Tell him you\'ll report his behavior to police if he doesn\'t calm down', isCorrect: false, rationale: 'Threatening police involvement before attempting de-escalation transforms a complaint into a confrontation.' },
        ],
      },
      {
        card_id: 'achc_m03_l3_deb', type: 'content', title: 'Operational Debrief: Safety + Clinical Priority',
        content: 'De-escalation must address BOTH the behavioral situation AND the legitimate clinical concern.\n\nWhy the others fail:\n• A: Matching aggression and forcing entry may result in physical confrontation and personal harm\n• C: While staff safety is paramount, verbal frustration (not threat) requires de-escalation before departure\n• D: Threatening police before de-escalation creates confrontation and delays care for a real clinical gap\n\nKey insight: The unfilled medication is a legitimate care gap. Regardless of the son\'s behavior, the clinical issue demands attention.\nDocument: the complaint substance AND the circumstances of delivery.',
        narration_script: 'Debrief. De-escalation must address both the behavioral situation and the legitimate clinical concern. Option A risks physical confrontation. Option C — while staff safety is paramount — verbal frustration alone doesn\'t require immediate departure before attempting de-escalation. Option D converts a complaint into a confrontation. Key insight: the unfilled medication is a real clinical gap. Address it regardless of the son\'s behavior. Document both the complaint substance and the delivery circumstances.',
        audio_path: '/training-audio/ACHC-ART-M03/l3/debrief.wav', image_url: IMG.M03, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m03_l4', topic_id: 'ACHC-ART-M03', title: 'Module Wrap-Up & Completion', order: 4,
    cards: [
      {
        card_id: 'achc_m03_l4_syn', type: 'summary', title: 'Summary & Synthesis',
        content: '6 things you must take from this module:\n\n1. ANY employee receiving a complaint MUST document and submit to Administrator — no exceptions\n2. Written response required within 10 days; appeal response within 30 days\n3. Both existence AND resolution documented in clinical record AND Administrator\'s log\n4. Patients receive hotline numbers at admission; staff educated at orientation + annually\n5. Retaliation against patients OR staff who complain is itself a separate violation\n6. De-escalation sequence: Acknowledge → Don\'t blame → Stay professional → Document → Report\n\nOperational bridge: Your preceptor will evaluate your ability to receive, document, and de-escalate complaints professionally.',
        narration_script: 'Six takeaways. One: any employee receiving a complaint must document and submit it — no exceptions. Two: 10-day written response, 30-day appeal. Three: document in both the clinical record and Administrator\'s log. Four: patients receive hotline numbers at admission. Five: retaliation against anyone who complains is a separate violation. Six: the de-escalation sequence is acknowledge, don\'t blame, stay professional, document, report. Your preceptor will evaluate your ability to handle complaints professionally.',
        audio_path: '/training-audio/ACHC-ART-M03/l4/synthesis.wav', image_url: IMG.M03, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m03_l4_fdeb', type: 'content', title: 'Mandatory Final Debrief',
        content: 'A correct answer does NOT guarantee correct reasoning. Reflect on these principles:\n\n1. Complaints are quality improvement DATA — not personal attacks on staff\n2. The 10-day response clock starts at RECEIPT, not at resolution of the investigation\n3. A patient\'s anger does not negate the validity of their concern\n4. Documentation protects everyone: the patient, the staff, AND the agency\n5. "No retaliation" means the patient receives IDENTICAL quality of care after complaining\n\nConfidence check: How confident are you in receiving and documenting a patient complaint correctly in the field?',
        narration_script: 'A correct answer does not guarantee correct reasoning. Five principles. One: complaints are quality improvement data, not personal attacks. Two: the 10-day clock starts at receipt. Three: a patient\'s anger does not negate the validity of their concern. Four: documentation protects everyone. Five: no retaliation means the patient receives identical quality of care after complaining. How confident are you in handling and documenting a patient complaint in the field?',
        audio_path: '/training-audio/ACHC-ART-M03/l4/finaldebrief.wav', image_url: IMG.M03, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m03_l4_nxt', type: 'content', title: 'Operational Next Steps',
        content: 'Your field preceptor will evaluate:\n• Can you locate and complete the CL-PR-004 (Restraint & Seclusion Prohibition) complaint form?\n• Do you know the submission pathway (who receives it)?\n• Can you articulate the patient\'s rights when they express a concern?\n• Can you demonstrate de-escalation without blame assignment?\n• Do you understand when a complaint becomes a mandatory report (abuse/neglect)?\n\nResources:\n• CL-PR-004 (Restraint & Seclusion Prohibition) Complaint Form (blank)\n• CL-PR-001 (Patient Rights & Responsibilities) (complaint section)\n• State Regulatory Hotline number\n• ACHC complaint line\n• De-escalation quick reference card',
        narration_script: 'Operational next steps. Your preceptor will evaluate: whether you can locate and complete the complaint form, whether you know who receives it, whether you can articulate patient rights, whether you can de-escalate without assigning blame, and whether you understand when a complaint becomes a mandatory report. Resources: the CL-PR-004 (Restraint & Seclusion Prohibition) complaint form, CL-PR-001 (Patient Rights & Responsibilities), state regulatory hotline, ACHC complaint line, and de-escalation quick reference.',
        audio_path: '/training-audio/ACHC-ART-M03/l4/nextsteps.wav', image_url: IMG.M03, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m03_l4_surv', type: 'content', title: 'Module Evaluation',
        content: 'Please evaluate this module:\n\n1. The content was relevant to situations I encounter in the field. (1–5)\n2. The complaint documentation process was clearly explained. (1–5)\n3. The de-escalation scenarios were realistic. (1–5)\n4. I feel more prepared to handle patient complaints professionally. (1–5)\n5. What complaint scenario would you like more training on? (Share with your supervisor)\n\nCompletion validates knowledge reasoning only. Certificate generation, evidence attachment, and 365-day retraining timer triggered.',
        narration_script: 'Thank you for completing this module. Please evaluate: the relevance to field situations, clarity of the documentation process, realism of the de-escalation scenarios, and your preparedness level. Also share what complaint scenario you\'d like more training on. Completion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer are now triggered.',
        audio_path: '/training-audio/ACHC-ART-M03/l4/survey.wav', image_url: IMG.M03, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  /* ══════════════════════ M04 HIPAA ══════════════════════ */

  {
    lesson_id: 'achc_m04_l0', topic_id: 'ACHC-ART-M04', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m04_l0_hook', type: 'challenge', title: 'Pre-Assessment: Test Yourself First',
        content: 'You are documenting in your car outside a patient\'s building. A neighbor approaches: "I noticed you visiting Mrs. Johnson — is she okay? We haven\'t seen her walking in weeks. I\'m her friend from church and worried." Mrs. Johnson has not signed any authorization for this person.\n\nWhat is your CORRECT response?',
        narration_script: 'Pre-assessment. You are documenting outside a patient\'s building. A neighbor approaches and says she noticed you visiting Mrs. Johnson and is worried because she hasn\'t seen her walking in weeks. She says she\'s a friend from church. Mrs. Johnson has not signed any authorization. What is your correct response?',
        audio_path: '/training-audio/ACHC-ART-M04/l0/hook.wav', image_url: IMG.M04, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'Tell the neighbor Mrs. Johnson is doing fine to ease their worry — no medical details', isCorrect: false, rationale: 'Even confirming the patient\'s general status is a disclosure of PHI without authorization.' },
          { id: 'B', label: 'Confirm you visit Mrs. Johnson but explain you cannot discuss her condition without authorization', isCorrect: false, rationale: 'Still a HIPAA violation — confirming you are providing services to anyone at this address discloses the care relationship.' },
          { id: 'C', label: 'State that you cannot confirm or deny whether you are providing services to anyone at this address', isCorrect: true, rationale: 'Correct — even confirming someone is a patient constitutes disclosure of PHI.' },
          { id: 'D', label: 'Give the neighbor the office phone number so they can call and be connected to Mrs. Johnson', isCorrect: false, rationale: 'Giving information that could facilitate PHI disclosure creates risk; you have confirmed a connection exists.' },
        ],
      },
      {
        card_id: 'achc_m04_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Define Protected Health Information (PHI) and Individually Identifiable Health Information (IIHI).\n2. Identify all "covered entities" under HIPAA and their obligations.\n3. Distinguish between patient consent (treatment/payment) and authorization (other uses).\n4. Apply the "minimum necessary rule" in clinical and documentation contexts.\n5. Enumerate specific patient rights under HIPAA privacy regulations.\n6. Describe situations where PHI may be disclosed without patient consent.',
        narration_script: 'Learning objectives. One: define PHI and Individually Identifiable Health Information. Two: identify covered entities and their obligations. Three: distinguish between patient consent for treatment and authorization for other uses. Four: apply the minimum necessary rule. Five: enumerate patient rights under HIPAA. Six: describe situations where PHI may be disclosed without consent.',
        audio_path: '/training-audio/ACHC-ART-M04/l0/objectives.wav', image_url: IMG.M04, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m04_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'PHI (Protected Health Information) — All information in ALL forms about a patient created by any covered entity. Includes paper, electronic, verbal, photos, video.\n\nIIHI — Information reasonably linkable to a specific patient: name, DOB, SSN, address, MRN, photos.\n\nMinimum Necessary Rule — Only the minimum PHI needed for the intended purpose may be shared — even with authorization.\n\nCovered Entity — Healthcare providers, plans, clearinghouses, and business associates. YOU are personally a covered entity.\n\nInformed Consent — Signed at first encounter; covers treatment, payment, and healthcare operations only.\n\nAuthorization — Required for uses OUTSIDE treatment/payment/operations (research, marketing, legal).\n\nPrivacy Officer — The Administrator. All violations reported here.',
        narration_script: 'Seven key terms. PHI: all patient information in all forms — paper, electronic, verbal, photos, video. IIHI: information linkable to a specific person — name, DOB, SSN, address, MRN, photos. Minimum Necessary Rule: only the minimum PHI needed for the intended purpose, even with authorization. Covered Entity: healthcare providers, plans, clearinghouses, and business associates — YOU are personally a covered entity. Informed Consent: signed at first encounter for treatment, payment, and healthcare operations only. Authorization: required for anything outside those three purposes. Privacy Officer: the Administrator — all violations reported here.',
        audio_path: '/training-audio/ACHC-ART-M04/l0/concepts.wav', image_url: IMG.M04, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m04_l1', topic_id: 'ACHC-ART-M04', title: 'Lesson 1: HIPAA Fundamentals & Covered Entities', order: 1,
    cards: [
      {
        card_id: 'achc_m04_l1_s', type: 'summary', title: 'You Are Personally a Covered Entity',
        content: 'HIPAA compliance is MANDATORY and personal. You are not just working for a covered entity — you ARE a covered entity. Violations attach to individuals, not just organizations. Willful violations can result in criminal liability. Even looking at the chart of a patient NOT under your care is a violation.',
        narration_script: 'HIPAA compliance is mandatory and personal. You are not just working for a covered entity — you are one. Violations attach to individuals, not just organizations. Willful violations can result in criminal liability. Even looking at the chart of a patient not assigned to you is a violation.',
        audio_path: '/training-audio/ACHC-ART-M04/l1/summary.wav', image_url: IMG.M04, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m04_l1_c1', type: 'content', title: 'PHI Exists in All Forms',
        content: 'HIPAA was enacted in 1996. PHI includes information in ALL of these forms:\n• Paper documents, forms, visit notes\n• Electronic health records, emails, texts\n• Verbal — what you say aloud (on the phone, in a waiting area, in your car)\n• Photos, video, screenshots\n• Computer screens visible to unauthorized persons\n\nThe 18 IIHI identifiers include: name, dates (birthdate, admission), geographic data, phone numbers, email, SSN, MRN, health plan number, account numbers, photos.\n\nIf state law is MORE strict than HIPAA → follow state law.',
        narration_script: 'HIPAA was enacted in 1996. PHI exists in all forms: paper documents, electronic records, verbal statements — what you say aloud in the car, on the phone, or in a waiting area — photos, video, and computer screens visible to unauthorized persons. The 18 IIHI identifiers include name, dates like birthdate and admission date, geographic data, phone numbers, email, SSN, medical record numbers, health plan numbers, account numbers, and photos. If state law is stricter than HIPAA, follow state law.',
        audio_path: '/training-audio/ACHC-ART-M04/l1/content1.wav', image_url: IMG.M04, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m04_l1_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• PHI includes what you SAY verbally — not just what\'s written\n• Even confirming someone IS a patient = disclosure of PHI\n• HIPAA violations don\'t require intent — negligence is sufficient\n• The field environment (cars, homes, public spaces) creates MORE risk than office settings\n• Never access records of patients not on your caseload\n• Minimum necessary rule applies EVEN WHEN authorization exists',
        narration_script: 'Takeaways. PHI includes what you say verbally — not just what\'s written. Even confirming someone is a patient is a PHI disclosure. HIPAA violations don\'t require intent — negligence is sufficient. The field environment creates more risk than office settings. Never access records of patients not on your caseload. The minimum necessary rule applies even when authorization exists.',
        audio_path: '/training-audio/ACHC-ART-M04/l1/takeaways.wav', image_url: IMG.M04, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m04_l1_c2', type: 'content', title: 'Field Scenario: Family Member PHI Request During Visit',
        content: 'Field scenario: Adult son is present during wound care. After visit, he asks privately: "Can you tell me what the doctor said about mom\'s wound infection? I\'m her son and pay the bills." Patient is competent, no auth on file.\n\nPer CO-HP-001 (HIPAA Privacy Program):\n• Even confirming patient status or existence of wound = PHI\n• Must have patient authorization or meet limited exception (treatment/payment)\n• Son paying bills does NOT grant access\n• "Cannot confirm or deny" + redirect to patient or Privacy Officer\n• Document the request and your response\n\nPersonal liability for improper disclosure.',
        narration_script: 'Field scenario. Son requests details on mother\'s wound. Per CO-HP-001 (HIPAA Privacy Program), no authorization means no disclosure — even to family. Cannot confirm/deny. Redirect to patient or Privacy Officer. Document the interaction.',
        audio_path: '/training-audio/ACHC-ART-M04/l1/content2.wav', image_url: IMG.M04, estimated_duration: '1:20', completion_required: true,
      },
      {
        card_id: 'achc_m04_l1_ch', type: 'challenge', title: 'Challenge: Unsecured Text Message',
        content: 'You are documenting in your car. A coworker texts: "Hey, how\'s the patient on Oak Street? The one with the Stage 4 pressure ulcer? I had her last week."\n\nWhat is the CORRECT response?',
        narration_script: 'Challenge scenario. You are in your car documenting. A coworker texts you asking how the patient on Oak Street is doing — the one with the Stage 4 pressure ulcer she had last week. What is the correct response?',
        audio_path: '/training-audio/ACHC-ART-M04/l1/challenge.wav', image_url: IMG.M04, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'Reply with a brief clinical update since she had the patient last week', isCorrect: false, rationale: 'Unsecured text + clinical detail + identifying information (address + diagnosis) = clear HIPAA breach.' },
          { id: 'B', label: 'Reply "She\'s doing better" without specifics — that\'s not really PHI', isCorrect: false, rationale: '"She\'s doing better" confirms patient identity by context (address + condition) via unsecured channel — still a violation.' },
          { id: 'C', label: 'Do not respond with any patient information via unsecured text; direct coworker to access records through proper channels', isCorrect: true, rationale: 'Correct — PHI must only be transmitted through secure, agency-approved channels.' },
          { id: 'D', label: 'Call the coworker back and give a verbal update since texts leave a trail', isCorrect: false, rationale: 'Verbal communication in an uncontrolled setting (car, potentially overheard) with unnecessary detail violates minimum necessary.' },
        ],
      },
      {
        card_id: 'achc_m04_l1_deb', type: 'content', title: 'Operational Debrief: Secure Communication Only',
        content: 'PHI must ONLY travel through secure, agency-approved communication channels.\n\nWhy the others fail:\n• A: Unsecured text + clinical detail + location = HIPAA breach regardless of coworker\'s prior care relationship\n• B: Context creates identification. "She\'s doing better" on an unsecured channel about a patient the coworker identified = violation\n• D: The issue is not the medium\'s traceability — it\'s sharing PHI in an uncontrolled environment with unnecessary detail\n\nWorkflow standard: develop the habit of directing ALL clinical questions to secured EHR systems.\nPatient safety link: data breaches erode patient trust → patients withhold information → care quality suffers.',
        narration_script: 'Debrief. PHI must only travel through secure, agency-approved channels. Option A is a breach because unsecured text plus clinical detail plus identifying information. Option B is still a violation because context creates identification. Option D fails because the issue is sharing PHI in an uncontrolled environment, not whether texts leave a trail. Develop the habit of directing all clinical questions to the secured EHR. Patient safety note: breaches erode trust, causing patients to withhold information, which degrades care quality.',
        audio_path: '/training-audio/ACHC-ART-M04/l1/debrief.wav', image_url: IMG.M04, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m04_l2', topic_id: 'ACHC-ART-M04', title: 'Lesson 2: Patient Rights Under HIPAA', order: 2,
    cards: [
      {
        card_id: 'achc_m04_l2_s', type: 'summary', title: 'Emergency Contact ≠ HIPAA Authorization',
        content: 'Emergency contact designation does NOT authorize disclosure of PHI. Only a properly signed HIPAA authorization form — or the patient\'s direct, documented verbal consent — authorizes sharing health information with a third party, including family members.',
        narration_script: 'Emergency contact designation does not equal HIPAA authorization. Only a properly signed authorization form, or the patient\'s direct documented verbal consent, authorizes sharing health information with any third party — including family members.',
        audio_path: '/training-audio/ACHC-ART-M04/l2/summary.wav', image_url: IMG.M04, estimated_duration: '0:35', completion_required: true,
      },
      {
        card_id: 'achc_m04_l2_c1', type: 'content', title: 'Six Patient Rights Under HIPAA',
        content: '1. Right to privacy notice (at first service)\n2. Right to request restrictions on disclosure\n3. Right to access PHI (inspect and copy) — except psychotherapy notes\n4. Right to accounting of disclosures (free, once per 12 months)\n5. Right to amend PHI (agency may deny but must document)\n6. Right to revoke consent at any time in writing\n\nConsent covers: treatment, payment, healthcare operations only.\nAuthorization required for: research, marketing, employer requests, legal proceedings, anything else.\n\nPatients can RESTRICT who receives their information — even family members.',
        narration_script: 'Six patient rights. One: right to a privacy notice at first service. Two: right to request disclosure restrictions. Three: right to access their PHI — except psychotherapy notes. Four: right to a free accounting of disclosures once per 12 months. Five: right to amend their PHI — the agency may deny but must document. Six: right to revoke consent at any time in writing. Remember: consent covers treatment, payment, and operations only. Anything else requires authorization. Patients can restrict PHI access for anyone, including family members.',
        audio_path: '/training-audio/ACHC-ART-M04/l2/content1.wav', image_url: IMG.M04, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m04_l2_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Consent ≠ Authorization: consent covers routine care; authorization required for everything else\n• Emergency contact ≠ authorization. Relationship ≠ authorization. Family ≠ authorization\n• Cognitively intact patients must directly authorize ALL disclosures\n• Partial disclosure is still PHI (medication names without dosages = still protected)\n• When in doubt, DON\'T disclose. Check with Privacy Officer first\n• You are personally liable — not just the agency',
        narration_script: 'Takeaways. Consent is not the same as authorization. Emergency contact, relationship, and family status are not authorizations. Cognitively intact patients must directly authorize all disclosures. Partial disclosure — like medication names without dosages — is still PHI. When in doubt, don\'t disclose. Check with the Privacy Officer. And remember: you are personally liable, not just the agency.',
        audio_path: '/training-audio/ACHC-ART-M04/l2/takeaways.wav', image_url: IMG.M04, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m04_l2_ch', type: 'challenge', title: 'Challenge: Emergency Contact Calling for Medications',
        content: 'A patient\'s adult daughter calls during your drive: "I\'m listed as my mother\'s emergency contact. I need to know what medications she\'s on — I\'m picking up her prescriptions." The patient is cognitively intact with no authorization form on file.\n\nWhat is the CORRECT action?',
        narration_script: 'Challenge scenario. A patient\'s adult daughter calls and says she is the emergency contact and needs to know her mother\'s medications for prescription pickup. The patient is cognitively intact with no authorization on file. What is the correct action?',
        audio_path: '/training-audio/ACHC-ART-M04/l2/challenge.wav', image_url: IMG.M04, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Provide the medication list — she\'s the emergency contact, which implies authorization', isCorrect: false, rationale: 'Emergency contact designation does NOT equal HIPAA authorization. This is one of the most common real-world HIPAA breaches.' },
          { id: 'B', label: 'Decline to share; explain emergency contact status does not equal authorization; direct her to discuss with her mother or the office', isCorrect: true, rationale: 'Correct — no authorization on file plus cognitively intact patient = no disclosure.' },
          { id: 'C', label: 'Give only medication names but not dosages — partial information is not a full disclosure', isCorrect: false, rationale: 'Medication names are protected health information regardless of whether dosages are included.' },
          { id: 'D', label: 'Tell the daughter to come to the next visit so the patient can give verbal consent', isCorrect: false, rationale: 'While better-intentioned, this delays care for a real need and does not address the proper authorization pathway.' },
        ],
      },
      {
        card_id: 'achc_m04_l2_deb', type: 'content', title: 'Operational Debrief: No Authorization = No Disclosure',
        content: 'The rule is absolute: no authorization on file + cognitively intact patient = NO disclosure. Period.\n\nWhy the others fail:\n• A: Emergency contact ≠ authorization. One of the most common real-world HIPAA breaches\n• C: Partial PHI is still PHI. No threshold for "less sensitive" information\n• D: Well-intentioned but delays needed care; the solution is proper authorization paperwork, not an in-person consent workaround\n\nProper escalation: Inform the office; have the care coordinator assist the patient with authorization paperwork if she wishes to authorize her daughter.\n\nLegal impact: Unauthorized disclosure to family = reportable breach. Even one instance can trigger an OCR investigation.',
        narration_script: 'Debrief. No authorization plus cognitively intact patient equals no disclosure. Period. Option A fails because emergency contact does not equal authorization — this is one of the most common real-world HIPAA breaches. Option C fails because partial PHI is still PHI. Option D is better-intentioned but delays care and bypasses the proper process. The solution is to inform the office and have the care coordinator help the patient complete authorization paperwork. One unauthorized disclosure can trigger an Office for Civil Rights investigation.',
        audio_path: '/training-audio/ACHC-ART-M04/l2/debrief.wav', image_url: IMG.M04, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m04_l3', topic_id: 'ACHC-ART-M04', title: 'Lesson 3: Permitted Disclosures & Field Safeguards', order: 3,
    cards: [
      {
        card_id: 'achc_m04_l3_s', type: 'summary', title: 'Mandatory Reporting Overrides Patient Consent',
        content: 'Communicable diseases, child abuse, and certain public health conditions MUST be reported to public health authorities regardless of patient consent. This is not a HIPAA violation — it is a legal requirement specifically permitted by HIPAA\'s public health exception.',
        narration_script: 'Communicable diseases, child abuse, and certain public health conditions must be reported to public health authorities regardless of patient consent. This is not a HIPAA violation — it is a legal requirement specifically permitted by HIPAA\'s public health exception.',
        audio_path: '/training-audio/ACHC-ART-M04/l3/summary.wav', image_url: IMG.M04, estimated_duration: '0:35', completion_required: true,
      },
      {
        card_id: 'achc_m04_l3_c1', type: 'content', title: 'Permitted Disclosures Without Consent',
        content: 'You CAN disclose PHI without consent in these situations:\n• 911 emergency calls — disclose what\'s needed for patient safety\n• Communicable disease reporting to public health (TB, COVID, meningitis, etc.)\n• Mandatory child abuse/neglect reporting\n• Law enforcement (narrowly defined, at crime scene)\n• National security/intelligence activities\n\nYou CANNOT disclose without consent:\n• To family members without authorization\n• To employers\n• To insurance companies for non-treatment purposes\n• To researchers without signed authorization or IRB approval',
        narration_script: 'Permitted disclosures without consent. You can disclose for 911 emergencies, communicable disease reporting to public health, mandatory child abuse reporting, law enforcement at crime scenes, and national security activities. You cannot disclose without consent to family members without authorization, to employers, to insurance companies for non-treatment purposes, or to researchers without signed authorization or IRB approval.',
        audio_path: '/training-audio/ACHC-ART-M04/l3/content1.wav', image_url: IMG.M04, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m04_l3_tkwy', type: 'content', title: 'Practical Field Safeguards',
        content: 'Car and home documentation:\n• Lock your car when patient documents are inside\n• Keep screens angled away from view\n• Shred or secure all paper PHI before end of shift\n• Use privacy screen on laptop/tablet in shared spaces\n\nPhone and devices:\n• Password/biometric lock on all work devices\n• Encrypted messaging only for any PHI\n• Agency-approved apps for EHR access only\n• Never photograph patients without documented consent\n\nVoice:\n• Lower your voice when discussing patients in any non-private setting\n• Never discuss patients in elevators, parking lots, restaurants',
        narration_script: 'Practical field safeguards. Car and home: lock your car when documents are inside, keep screens angled from view, shred or secure paper PHI before end of shift. Devices: password or biometric lock on all work devices, encrypted messaging for PHI only, agency-approved EHR apps only, and never photograph patients without documented consent. Voice: lower your voice in any non-private setting. Never discuss patients in elevators, parking lots, or restaurants.',
        audio_path: '/training-audio/ACHC-ART-M04/l3/takeaways.wav', image_url: IMG.M04, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m04_l3_ch', type: 'challenge', title: 'Challenge: Active TB, Patient Refuses Reporting',
        content: 'During a routine home visit, you discover your patient has active, untreated tuberculosis. She begs you: "Please don\'t tell anyone — my family will be terrified and my neighbors will shun me." She refuses treatment referral.\n\nWhat is your LEGAL obligation?',
        narration_script: 'Challenge scenario. During a routine home visit, you discover the patient has active, untreated tuberculosis. She begs you not to tell anyone. She refuses a treatment referral. What is your legal obligation?',
        audio_path: '/training-audio/ACHC-ART-M04/l3/challenge.wav', image_url: IMG.M04, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Respect her wishes — patient autonomy and HIPAA prohibit disclosure without consent', isCorrect: false, rationale: 'Patient autonomy does not extend to creating airborne public health threats. Active TB must be reported.' },
          { id: 'B', label: 'Report to the local health department; explain communicable diseases are mandatory exceptions to privacy protections', isCorrect: true, rationale: 'Correct — communicable diseases are specifically permitted/required disclosures under HIPAA and state law.' },
          { id: 'C', label: 'Only report if the patient has documented exposure to others', isCorrect: false, rationale: 'Mandatory reporting is triggered by confirmed/suspected diagnosis, not by documented exposure to specific individuals.' },
          { id: 'D', label: 'Wait to see if she changes her mind at the next visit', isCorrect: false, rationale: 'Delay in reporting active TB means continued airborne transmission risk. Time is critical.' },
        ],
      },
      {
        card_id: 'achc_m04_l3_deb', type: 'content', title: 'Operational Debrief: Public Health Reporting',
        content: 'HIPAA explicitly permits — and state law typically MANDATES — reporting of communicable diseases to public health.\n\nWhy the others fail:\n• A: Patient autonomy does not allow creating public health threats. Active TB is airborne and affects everyone in the household\n• C: Mandatory reporting is triggered by diagnosis, not by proof of specific exposures\n• D: Every day of delay = continued transmission risk + personal liability for the clinician\n\nLegal protection: Mandatory reporters who report in good faith are protected from liability, even if the patient objects.\nClinical action: Report, document, notify supervisor, arrange safe care continuation with appropriate precautions.',
        narration_script: 'Debrief. HIPAA explicitly permits — and state law mandates — communicable disease reporting. Option A fails because patient autonomy does not override public health obligations. Active TB is airborne. Option C fails because reporting is triggered by diagnosis, not documented exposure. Option D is negligent — delay means continued transmission risk. Legal protection: mandatory reporters who act in good faith are protected from liability even when the patient objects. After reporting, document, notify your supervisor, and arrange continued care with appropriate respiratory precautions.',
        audio_path: '/training-audio/ACHC-ART-M04/l3/debrief.wav', image_url: IMG.M04, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m04_l4', topic_id: 'ACHC-ART-M04', title: 'Module Wrap-Up & Completion', order: 4,
    cards: [
      {
        card_id: 'achc_m04_l4_syn', type: 'summary', title: 'Summary & Synthesis',
        content: '6 things you must take from this module:\n\n1. PHI = ALL information in ALL forms (paper, electronic, verbal, visual) about a patient\n2. Even confirming someone IS a patient constitutes disclosure\n3. Emergency contact ≠ authorization. Relationship ≠ authorization. Family ≠ authorization\n4. Minimum necessary rule applies EVEN WHEN authorization exists\n5. Mandatory reporting (TB, abuse, communicable diseases) overrides patient consent\n6. You are personally liable — not just the agency\n\nOperational bridge: Your preceptor will evaluate PHI handling in the field, response to family requests, and understanding of when disclosure IS permitted.',
        narration_script: 'Six takeaways. One: PHI is all patient information in all forms. Two: even confirming someone is a patient is disclosure. Three: emergency contact, relationship, and family status are not authorizations. Four: the minimum necessary rule applies even with authorization. Five: mandatory reporting overrides patient consent. Six: you are personally liable. Your preceptor will evaluate your PHI handling in the field, your response to family information requests, and your understanding of permitted disclosures.',
        audio_path: '/training-audio/ACHC-ART-M04/l4/synthesis.wav', image_url: IMG.M04, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m04_l4_fdeb', type: 'content', title: 'Mandatory Final Debrief',
        content: 'A correct answer does NOT guarantee correct reasoning. Reflect on these principles:\n\n1. HIPAA violations don\'t require INTENT — negligence is sufficient for liability\n2. The field environment creates MORE risk than office settings — your car, patients\' homes, and public spaces\n3. Verbal disclosures are violations too — not just written or electronic ones\n4. "But they\'re family" is NEVER a defense for unauthorized disclosure\n5. When in doubt, DON\'T disclose. Check with your Privacy Officer first\n\nConfidence check: How confident are you in protecting PHI in your daily field operations without supervision?',
        narration_script: 'A correct answer does not guarantee correct reasoning. Five principles. One: HIPAA violations don\'t require intent. Two: the field environment — car, patient homes, public spaces — creates more risk than office settings. Three: verbal disclosures are violations. Four: "but they\'re family" is never a defense. Five: when in doubt, don\'t disclose — check with your Privacy Officer first. How confident are you in protecting PHI in your daily field operations?',
        audio_path: '/training-audio/ACHC-ART-M04/l4/finaldebrief.wav', image_url: IMG.M04, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m04_l4_nxt', type: 'content', title: 'Operational Next Steps',
        content: 'Your field preceptor will evaluate:\n• Secure handling of paper records in your vehicle\n• Device lock/encryption practices\n• Response to family member information requests during visits\n• Documentation security during home visits\n• Appropriate disposal of PHI (shredding, not regular trash)\n\nResources:\n• CO-HP-001 (HIPAA Privacy Program)\n• Privacy Officer contact information\n• Breach reporting form\n• PHI safeguarding checklist for field staff\n• U.S. HHS Office for Civil Rights (OCR) guidance',
        narration_script: 'Operational next steps. Your preceptor will evaluate: secure handling of paper records in your vehicle, device lock and encryption practices, your response to family information requests during visits, documentation security in patient homes, and proper PHI disposal practices. Resources: CO-HP-001 (HIPAA Privacy Program), Privacy Officer contact, breach reporting form, PHI safeguarding checklist for field staff, and HHS Office for Civil Rights guidance.',
        audio_path: '/training-audio/ACHC-ART-M04/l4/nextsteps.wav', image_url: IMG.M04, estimated_duration: '1:00', completion_required: true,
      },
      {
        card_id: 'achc_m04_l4_surv', type: 'content', title: 'Module Evaluation',
        content: 'Please evaluate this module:\n\n1. The content was relevant to my daily handling of patient information. (1–5)\n2. The distinction between consent and authorization was clear. (1–5)\n3. The scenarios reflected realistic HIPAA challenges in the field. (1–5)\n4. I feel more confident in protecting patient privacy. (1–5)\n5. What HIPAA situation would you like more guidance on? (Share with your supervisor)\n\nCompletion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer triggered.',
        narration_script: 'Thank you for completing this module. Please evaluate: the relevance to your daily information handling, the clarity of consent versus authorization, the realism of the field scenarios, and your confidence level. Also share what HIPAA situation you\'d like more guidance on. Completion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer are now triggered.',
        audio_path: '/training-audio/ACHC-ART-M04/l4/survey.wav', image_url: IMG.M04, estimated_duration: '1:00', completion_required: true,
      },
    ],
  },
];
