import type { TopicTest } from './achcContentTypes';

export const achcAnnualTests: TopicTest[] = [

  /* ── M01 Cultural Awareness ── */
  {
    test_id: 'test_achc_m01', topic_id: 'ACHC-ART-M01', passing_score: 80,
    questions: [
      {
        question_id: 'q_m01_01', prompt: 'A patient refuses a blood transfusion citing religious beliefs. They are alert, oriented, and competent. The correct action is:',
        choices: ['Explain the medical risks and administer anyway to save their life', 'Document the refusal, notify the physician, ensure Informed Consent for refusal is signed', 'Contact their religious leader to persuade them', 'Discharge the patient for non-compliance'],
        correct_answer: 1, rationale: 'Competent patients have the right to refuse any treatment, including life-saving treatment. Document, notify, and secure a signed refusal.',
      },
      {
        question_id: 'q_m01_02', prompt: 'Cultural humility differs from cultural competence in that:',
        choices: ['It requires memorizing customs of all cultures', 'It is a static achievement you reach with enough training', 'It is a lifelong process of self-reflection and openness to learning from each patient', 'It only applies to international patients'],
        correct_answer: 2, rationale: 'Cultural humility is an ongoing process of self-examination per M01 lesson and CL-PR-001 (Patient Rights & Responsibilities). Cultural competence implies a level of mastery that can never truly be reached.',
      },
      {
        question_id: 'q_m01_03', prompt: 'A patient\'s family member offers to interpret for a medical appointment. The BEST practice is:',
        choices: ['Accept — it saves cost and the patient prefers it', 'Use the family member only if no professional interpreter is available', 'Request a professional interpreter — family members may omit, alter, or filter clinical information', 'Use a bilingual colleague from another department'],
        correct_answer: 2, rationale: 'Family members may unconsciously or deliberately omit sensitive information, change meaning, or have poor medical vocabulary per CL-PR-001 (Patient Rights & Responsibilities) and M01 lesson. Professional interpreters are the standard.',
      },
      {
        question_id: 'q_m01_04', prompt: 'Which of the following is the MOST accurate statement about cultural practices and clinical care?',
        choices: ['Harmful cultural practices must always be immediately prohibited', 'Cultural practices should be accommodated only when scientifically proven safe', 'Clinical accommodation of cultural practices improves adherence, outcomes, and dignity — safety is evaluated case by case', 'Staff personal comfort with cultural practices determines accommodation'],
        correct_answer: 2, rationale: 'Accommodation of cultural practices must be assessed individually for patient safety per CL-PR-001 (Patient Rights & Responsibilities). Blanket prohibition damages trust and adherence.',
      },
      {
        question_id: 'q_m01_05', prompt: 'A nurse refers to a Muslim patient\'s dietary restrictions as "inconvenient." This represents:',
        choices: ['A legitimate clinical concern', 'Microaggression — minimizing a patient\'s religious practice', 'Standard clinical communication', 'A policy violation requiring termination'],
        correct_answer: 1, rationale: 'Labeling religious practices as "inconvenient" is a microaggression that communicates disrespect and can damage therapeutic trust.',
      },
      {
        question_id: 'q_m01_06', prompt: 'A patient with limited English proficiency nods and smiles throughout your teaching. This most likely means:',
        choices: ['The patient fully understands the instructions', 'The patient is being polite but may not understand — teach-back is required', 'The patient speaks English well enough for care', 'No interpreter is needed'],
        correct_answer: 1, rationale: 'Nodding is often a polite social behavior, not an indication of understanding. Teach-back is the standard for confirming comprehension.',
      },
      {
        question_id: 'q_m01_07', prompt: 'Cultural awareness training is required by ACHC for field workers:',
        choices: ['Once, at hire', 'Every 5 years', 'Annually', 'Only when a complaint is filed'],
        correct_answer: 2, rationale: 'ACHC requires annual training for all field worker employees, including cultural awareness.',
      },
      {
        question_id: 'q_m01_08', prompt: 'A patient declines a female nurse due to religious beliefs. The ethically and professionally correct approach is:',
        choices: ['Refuse the assignment request — it\'s discriminatory', 'Accommodate the request if possible without compromising patient care or staff rights', 'Assign only male nurses to all patients to avoid conflict', 'Document the refusal as non-compliant behavior'],
        correct_answer: 1, rationale: 'Accommodation of religious preferences in care assignment (when possible) respects patient autonomy. Blanket policies based on one patient\'s preference are inappropriate.',
      },
      {
        question_id: 'q_m01_09', prompt: 'The PRIMARY goal of the Agency\'s Cultural Awareness Program is:',
        choices: ['To eliminate all cultural differences in care delivery', 'To provide standardized care protocols for each cultural group', 'To deliver individualized, culturally sensitive care that improves outcomes and patient dignity', 'To satisfy accreditation requirements only'],
        correct_answer: 2, rationale: 'Individualized, culturally sensitive care per CL-PR-001 (Patient Rights & Responsibilities) — not generalization or standardization — is the program\'s goal.',
      },
      {
        question_id: 'q_m01_10', prompt: 'A Vietnamese patient avoids eye contact during clinical teaching. This is MOST likely:',
        choices: ['A sign of deception or disinterest', 'A cultural norm of respect that should not be misinterpreted as disengagement', 'Indication of cognitive impairment', 'A universal signal of low health literacy'],
        correct_answer: 1, rationale: 'Eye contact norms vary significantly across cultures per CL-PR-001 (Patient Rights & Responsibilities) and lesson content. Avoiding eye contact is a sign of respect in many Southeast Asian cultures.',
      },
      {
        question_id: 'q_m01_11', prompt: 'A coworker makes a discriminatory remark about a new hire\'s accent during a team meeting. The MOST appropriate immediate action is:',
        choices: ['Laugh along to keep the peace', 'Say nothing but report to HR later', 'Calmly state that the comment is inappropriate and creates a hostile environment', 'Confront aggressively in front of the group'],
        correct_answer: 2, rationale: 'Per lesson in ACHC-ART-M01: immediate calm intervention prevents normalization of discriminatory behavior. Bystander silence endorses it. This aligns with CL-PR-001 (Patient Rights & Responsibilities) expectations for workplace culture.',
      },
      {
        question_id: 'q_m01_12', prompt: 'Which statement accurately distinguishes workforce diversity training from cultural competence training?',
        choices: ['They are the same thing', 'Diversity training addresses staff composition; cultural competence addresses delivery of care to patients with diverse needs', 'Cultural competence only applies to international patients', 'Diversity training is federally mandated but cultural competence is not'],
        correct_answer: 1, rationale: 'Direct from lesson content: CLAS Standards and cultural competence training focus on patient-care delivery. Workforce diversity addresses representation. Both support CL-PR-001 (Patient Rights & Responsibilities) and federally required culturally responsive care.',
      },
    ],
  },

  /* ── M02 Emergency & Disaster Preparedness ── */
  {
    test_id: 'test_achc_m02', topic_id: 'ACHC-ART-M02', passing_score: 80,
    questions: [
      {
        question_id: 'q_m02_01', prompt: 'A patient on oxygen has flooding encroaching on their neighborhood. The FIRST action is:',
        choices: ['Call the DME company to retrieve the concentrator', 'Ensure the patient is transported to safety and has portable O2; notify supervisor', 'Document in the patient chart and wait for Agency guidance', 'Call 911 only if the water enters the home'],
        correct_answer: 1, rationale: 'Patient safety is the first priority. Portable O2 continuity and transport to safety must be addressed first.',
      },
      {
        question_id: 'q_m02_02', prompt: 'The Agency Emergency Preparedness Plan includes which of the following?',
        choices: ['Response procedures for natural disasters only', 'A comprehensive plan covering natural disasters, man-made emergencies, and service continuity', 'A plan developed by the local government, not the Agency', 'Procedures that only apply to office staff, not field workers'],
        correct_answer: 1, rationale: 'OP-FM-005 (Emergency Operations & Business Continuity) is a comprehensive, agency-specific plan covering all emergency types and all staff.',
      },
      {
        question_id: 'q_m02_03', prompt: 'Patient prioritization during a disaster is based on:',
        choices: ['Alphabetical order by last name', 'Acuity, dependency on electronic/oxygen equipment, and ability to self-evacuate', 'Patient preference only', 'Order of admission to the Agency'],
        correct_answer: 1, rationale: 'Prioritization accounts for acuity, equipment dependency, and self-care ability — not administrative factors.',
      },
      {
        question_id: 'q_m02_04', prompt: 'You cannot reach a patient during a hurricane warning. The correct action is:',
        choices: ['Document "unable to reach" and continue to next patient', 'Notify your supervisor immediately so the Agency can activate emergency protocols', 'Try once more the following day', 'Only escalate if the patient is on the priority list'],
        correct_answer: 1, rationale: 'Unreachable high-risk patients require immediate supervisor notification to activate OP-FM-005 (Emergency Operations & Business Continuity) protocols.',
      },
      {
        question_id: 'q_m02_05', prompt: 'A patient\'s emergency contact list should be:',
        choices: ['Created once at admission and never updated', 'Current, verified regularly, and include preferred language for communication', 'Maintained only in the office, not in the patient\'s home', 'Limited to one person to avoid confusion'],
        correct_answer: 1, rationale: 'Emergency contacts must be current, verified, and include language preference to be actionable during an emergency.',
      },
      {
        question_id: 'q_m02_06', prompt: 'A field worker\'s personal emergency preparedness obligation includes:',
        choices: ['Preparing their own household so they can report to work during emergencies', 'Relying entirely on the Agency to manage their personal safety', 'Only maintaining a charged work phone', 'There are no personal preparedness obligations — only professional ones'],
        correct_answer: 0, rationale: 'Field workers who are unprepared personally may be unable to report to work. Personal preparedness enables professional duty during emergencies.',
      },
      {
        question_id: 'q_m02_07', prompt: 'After a disaster, patient documentation and clinical records serve which function?',
        choices: ['They have no utility in disaster aftermath', 'Enable continuity of care when transferred to another provider or facility', 'Are required only for billing purposes', 'Only the original charts matter; copies are not acceptable'],
        correct_answer: 1, rationale: 'Clinical records support care continuity across settings — critical after disasters when patients may transfer to hospitals or shelters.',
      },
      {
        question_id: 'q_m02_08', prompt: 'During a prolonged power outage, a patient using an electric hospital bed cannot reposition safely. This is:',
        choices: ['A care management issue only, not a safety emergency', 'A potential safety emergency requiring repositioning protocol activation and supervisor notification', 'The patient\'s responsibility to manage', 'Only a problem if the patient has pressure injuries'],
        correct_answer: 1, rationale: 'Loss of powered repositioning capability creates immediate fall and skin integrity risk. Emergency repositioning protocols and supervisor notification are required.',
      },
      {
        question_id: 'q_m02_09', prompt: 'A patient refuses to evacuate during a mandatory evacuation order. The correct action is:',
        choices: ['Respect their autonomy and leave without further action', 'Document their refusal, ensure they have contacts and resources, notify supervisor and emergency services if the situation is life-threatening', 'Force them to evacuate for their safety', 'Responsibility ends when the mandatory order is issued'],
        correct_answer: 1, rationale: 'Document, provide resources, notify supervisor, and escalate to emergency services if life-threatening. Competent adults can refuse evacuation, but documentation and escalation are still required.',
      },
      {
        question_id: 'q_m02_10', prompt: 'After any declared emergency, Agency staff must:',
        choices: ['Wait for patients to re-contact the Agency', 'Conduct post-emergency patient assessment per protocol and document', 'Resume normal schedules only after management approval', 'Check on colleagues first, then patients'],
        correct_answer: 1, rationale: 'Post-emergency patient assessment is a clinical protocol requirement — ensuring patient welfare is the first priority after safety is re-established.',
      },
    ],
  },

  /* ── M03 Complaints & Grievances ── */
  {
    test_id: 'test_achc_m03', topic_id: 'ACHC-ART-M03', passing_score: 80,
    questions: [
      {
        question_id: 'q_m03_01', prompt: 'A patient says "I\'m a little frustrated my nurse is always running 45 minutes late." This is best classified as:',
        choices: ['A grievance requiring a formal written response within 30 days', 'A complaint that should be resolved immediately at the point of care if possible', 'Routine feedback requiring no action', 'Patient non-compliance with scheduling expectations'],
        correct_answer: 1, rationale: '"Complaint" refers to issues resolvable promptly at the point of care. "Grievance" involves formal written complaints, rights violations, or complaints unresolved through the normal process.',
      },
      {
        question_id: 'q_m03_02', prompt: 'A patient submits a written grievance about the care they are receiving. The Agency must provide its written response within:',
        choices: ['24 hours', '7 days', '10 days (decision + appeal rights)', '30 days'],
        correct_answer: 2, rationale: 'Per updated lesson and CL-PR-001 (Patient Rights & Responsibilities): written response required within 10 days of receipt; 30 days is the Governing Body appeal review timeline. Confusion of these is a common survey deficiency.',
      },
      {
        question_id: 'q_m03_03', prompt: 'A field nurse receives a complaint from a family member about a coworker. The correct action is:',
        choices: ['Defend the coworker if you know them well', 'Acknowledge the concern and route it to your supervisor — do not investigate independently', 'Tell the family to call the state hotline if they have concerns', 'Document in the patient chart with your assessment of who is right'],
        correct_answer: 1, rationale: 'Field staff are not complaint investigators. Acknowledge, remain professional, and route to the supervisor for proper handling.',
      },
      {
        question_id: 'q_m03_04', prompt: 'Which of the following must be provided to patients about the complaint process?',
        choices: ['Nothing — they can find the information online', 'Written information about their right to complain and the process, at admission and upon request', 'Only verbal instructions during the admission assessment', 'A list of Agency policies they must agree to before complaining'],
        correct_answer: 1, rationale: 'Patients must receive written information about their right to file complaints and the process at admission.',
      },
      {
        question_id: 'q_m03_05', prompt: 'A patient complains about a clinical decision made by their physician. The appropriate first step is:',
        choices: ['Agree with the patient that the physician is wrong', 'Validate the patient\'s concern without disparaging the physician and report to your supervisor', 'Tell the patient this is not within the Agency\'s jurisdiction', 'Document nothing since it involves a physician'],
        correct_answer: 1, rationale: 'Validate concerns professionally without disparaging other providers and report through proper channels.',
      },
      {
        question_id: 'q_m03_06', prompt: 'The Agency\'s complaint and grievance process serves which regulatory function?',
        choices: ['It is a customer service option, not a regulatory requirement', 'It is a mandatory ACHC requirement and a patient rights protection mechanism', 'It only applies to Medicare patients', 'It is only required if the state mandates it'],
        correct_answer: 1, rationale: 'The complaint and grievance process is a mandatory ACHC requirement per CL-PR-001 (Patient Rights & Responsibilities) that protects patient rights.',
      },
      {
        question_id: 'q_m03_07', prompt: 'Retaliating against a patient who filed a grievance by reducing their care quality is:',
        choices: ['Acceptable if the grievance was unfounded', 'A severe violation of patient rights and a compliance violation', 'Allowed if the patient signed a service agreement', 'A clinical discretion matter'],
        correct_answer: 1, rationale: 'Retaliation against a patient who filed a grievance is a serious patient rights violation and compliance violation.',
      },
      {
        question_id: 'q_m03_08', prompt: 'When a patient\'s grievance reveals a system-wide problem, the Agency must:',
        choices: ['Resolve the individual complaint only', 'Conduct QAPI review and implement corrective action to prevent recurrence', 'Dismiss the systemic issue if it was an isolated incident', 'Refer the patient to the state for resolution'],
        correct_answer: 1, rationale: 'Individual grievances that reveal systemic problems trigger QAPI review and corrective action.',
      },
      {
        question_id: 'q_m03_09', prompt: 'You receive a complaint from a patient saying a coworker discussed their case in a restaurant. This represents:',
        choices: ['A minor complaint about staff behavior', 'A HIPAA violation per CO-HP-001 (HIPAA Privacy Program) AND a patient grievance requiring immediate escalation to the supervisor and Compliance Officer', 'Hearsay that doesn\'t require action without proof', 'A complaint to be resolved at the next team meeting'],
        correct_answer: 1, rationale: 'Discussing PHI in a public setting is a HIPAA violation per CO-HP-001 (HIPAA Privacy Program) requiring immediate escalation beyond normal complaint processing.',
      },
      {
        question_id: 'q_m03_10', prompt: 'Patient feedback surveys collected after each visit serve primarily to:',
        choices: ['Fulfill billing documentation requirements', 'Identify quality improvement opportunities and serve as an early warning system for potential grievances', 'Satisfy staff performance review requirements', 'Prove the Agency is compliant during audits'],
        correct_answer: 1, rationale: 'Patient satisfaction surveys are a quality improvement and early-warning tool that help identify issues before they become formal grievances.',
      },
    ],
  },

  /* ── M04 HIPAA ── */
  {
    test_id: 'test_achc_m04', topic_id: 'ACHC-ART-M04', passing_score: 80,
    questions: [
      {
        question_id: 'q_m04_01', prompt: 'You receive a text from a patient\'s daughter asking for an update on her father\'s health status. The patient has not provided written authorization for his daughter. The correct response is:',
        choices: ['Provide the update — she\'s family', 'Cannot confirm or deny patient information without written authorization', 'Ask the daughter to call the office', 'Provide general status only'],
        correct_answer: 1, rationale: 'Without authorization, even family members cannot receive PHI. "Cannot confirm or deny" protects the patient\'s privacy.',
      },
      {
        question_id: 'q_m04_02', prompt: 'The minimum necessary standard means:',
        choices: ['Only the minimum amount of PHI needed for the specific purpose should be accessed, used, or disclosed', 'The minimum number of staff should have access to charts', 'You must always use the minimum data fields in EHR documentation', 'Patients should be given minimum information about their diagnoses'],
        correct_answer: 0, rationale: 'Minimum necessary means limiting PHI access, use, and disclosure to what is specifically required for the task at hand.',
      },
      {
        question_id: 'q_m04_03', prompt: 'A coworker who is also a patient\'s neighbor asks to see the patient\'s chart "just for context." This is:',
        choices: ['Acceptable since they work for the Agency', 'A HIPAA violation — accessing PHI without a treatment, payment, or operations purpose', 'Acceptable if the neighbor consents verbally', 'A judgment call based on how close the relationship is'],
        correct_answer: 1, rationale: 'PHI may only be accessed for treatment, payment, or healthcare operations purposes. Curiosity and personal relationships are not authorized purposes.',
      },
      {
        question_id: 'q_m04_04', prompt: 'A covered entity must notify affected individuals of a breach within:',
        choices: ['24 hours', '10 business days', '60 calendar days of discovering the breach', '30 days'],
        correct_answer: 2, rationale: 'HIPAA requires breach notification to affected individuals within 60 calendar days of discovery.',
      },
      {
        question_id: 'q_m04_05', prompt: 'Which of the following is a permissible disclosure WITHOUT patient authorization?',
        choices: ['Sending records to the patient\'s attorney', 'Disclosing to a public health authority for reportable disease surveillance', 'Sharing lab results with an employer', 'Providing health history to the patient\'s insurance company without a signed release'],
        correct_answer: 1, rationale: 'Public health reporting for communicable diseases is a HIPAA-permitted disclosure without authorization.',
      },
      {
        question_id: 'q_m04_06', prompt: 'You accidentally text a patient\'s medication list to the wrong phone number. This is:',
        choices: ['Not a breach because it was accidental', 'A potential HIPAA breach requiring immediate supervisor notification and breach risk assessment', 'Only a breach if it reaches another covered entity', 'A breach only if the patient complains'],
        correct_answer: 1, rationale: 'Accidental disclosure of PHI to an unauthorized recipient is a potential breach requiring a risk assessment regardless of intent.',
      },
      {
        question_id: 'q_m04_07', prompt: 'Using a patient\'s photo (with their face visible) in a social media post to celebrate their progress without written authorization is:',
        choices: ['Acceptable if the patient verbally agreed', 'A HIPAA violation — posting identifiable patient information requires explicit written authorization', 'Acceptable if the post is set to "Friends Only"', 'Not a HIPAA violation because social media is not clinical communication'],
        correct_answer: 1, rationale: 'Photos are PHI if they can identify the individual. Posting patient images without written authorization violates HIPAA regardless of platform privacy settings.',
      },
      {
        question_id: 'q_m04_08', prompt: 'When disposing of paper documents containing PHI in a patient\'s home, the correct method is:',
        choices: ['Leave in the patient\'s recycling bin', 'Shred or place in the Agency\'s secure disposal process — do not leave in household trash or recycling', 'Fold and place in your bag to discard later', 'Ask the patient to shred it themselves'],
        correct_answer: 1, rationale: 'PHI must be disposed of in a secure method. Household recycling is not secure disposal.',
      },
      {
        question_id: 'q_m04_09', prompt: 'A patient has the right to:',
        choices: ['Request deletion of any medical record at any time', 'Access their own PHI, request corrections, and obtain an accounting of disclosures', 'Review records of all other patients treated by the same physician', 'Access staff personnel files related to their care'],
        correct_answer: 1, rationale: 'HIPAA grants patients the right to access, amend, and receive an accounting of disclosures of their own PHI.',
      },
      {
        question_id: 'q_m04_10', prompt: 'The HIPAA Security Rule specifically governs:',
        choices: ['All forms of PHI in any medium', 'Electronic PHI (ePHI) — administrative, physical, and technical safeguards', 'Verbal communications about patients', 'PHI in paper records only'],
        correct_answer: 1, rationale: 'The HIPAA Security Rule specifically addresses ePHI and requires administrative, physical, and technical safeguards per CO-HP-002 (HIPAA Security Program).',
      },
      {
        question_id: 'q_m04_11', prompt: 'Accidentally texting a patient\'s medication list to the wrong phone number requires what immediate action?',
        choices: ['Ignore if the recipient did not respond', 'Notify supervisor immediately and conduct breach risk assessment', 'Wait to see if patient complains', 'Only document if the wrong recipient reads it'],
        correct_answer: 1, rationale: 'Per lesson and CO-HP-001 (HIPAA Privacy Program): accidental disclosure of PHI to unauthorized party is a potential breach requiring immediate notification and risk assessment regardless of outcome.',
      },
      {
        question_id: 'q_m04_12', prompt: 'Using a patient photo with visible face on social media without written authorization is:',
        choices: ['Acceptable with verbal consent', 'A HIPAA violation requiring written authorization for identifiable images', 'OK if privacy settings are restricted', 'Not PHI because it is not clinical data'],
        correct_answer: 1, rationale: 'Photos with face are PHI. Posting without explicit written authorization violates CO-HP-001 (HIPAA Privacy Program) per ACHC M04 content.',
      },
    ],
  },

  /* ── M05 Infection Control ── */
  {
    test_id: 'test_achc_m05', topic_id: 'ACHC-ART-M05', passing_score: 80,
    questions: [
      {
        question_id: 'q_m05_01', prompt: 'Standard Precautions apply:',
        choices: ['Only to patients with known infections', 'To ALL patients at ALL times regardless of diagnosis', 'Only when blood is visible', 'Only during invasive procedures'],
        correct_answer: 1, rationale: 'Standard Precautions per CL-SD-016 (Infection Prevention & Control) treat ALL patients as potentially infectious at all times. Known status is irrelevant.',
      },
      {
        question_id: 'q_m05_02', prompt: 'The single most effective infection control intervention is:',
        choices: ['Wearing gloves for all patient contact', 'Proper hand hygiene at all 5 moments', 'Annual flu vaccination', 'Wearing N95 respirators for all home visits'],
        correct_answer: 1, rationale: 'Hand hygiene at all 5 WHO moments per CL-SD-016 (Infection Prevention & Control) is the most evidence-based, effective infection control intervention.',
      },
      {
        question_id: 'q_m05_03', prompt: 'Alcohol-based hand rub is NOT appropriate when:',
        choices: ['Hands appear clean', 'Hands are visibly soiled or after contact with C. difficile spores', 'Entering a patient\'s home', 'Before glove application'],
        correct_answer: 1, rationale: 'Alcohol does not kill C. diff spores and cannot remove visible soil. Soap and water is required in these situations.',
      },
      {
        question_id: 'q_m05_04', prompt: 'Contact precautions require which additional PPE beyond standard precautions?',
        choices: ['N95 respirator and eye protection', 'Gown and gloves for all contact with patient or environment', 'Surgical mask only', 'No additional PPE is required'],
        correct_answer: 1, rationale: 'Contact precautions require gown and gloves for all contact with the patient and their immediate environment.',
      },
      {
        question_id: 'q_m05_05', prompt: 'A patient with active chickenpox would require which transmission-based precautions?',
        choices: ['Droplet only', 'Contact only', 'Airborne AND contact (chickenpox is spread by both airborne and direct contact routes)', 'Standard precautions only'],
        correct_answer: 2, rationale: 'Varicella (chickenpox) is spread via airborne route AND contact. Both types of transmission-based precautions apply.',
      },
      {
        question_id: 'q_m05_06', prompt: 'When removing PPE after caring for a patient on contact precautions, the correct sequence is:',
        choices: ['Remove mask, then gloves, then gown', 'Remove gloves first, then gown, then perform hand hygiene', 'Remove all at the same time to save time', 'Remove gown, then gloves, then mask/eye protection, then hand hygiene'],
        correct_answer: 3, rationale: 'The correct doffing sequence minimizes self-contamination: gloves (most contaminated), gown, mask/eye protection, then hand hygiene.',
      },
      {
        question_id: 'q_m05_07', prompt: 'An employee with active influenza should:',
        choices: ['Wear a mask and continue working to maintain patient care continuity', 'Stay home until afebrile for 24 hours without antipyretics', 'Work if symptoms are mild', 'Return to work after starting antiviral medications'],
        correct_answer: 1, rationale: 'Infected staff represent a transmission risk to immunocompromised home health patients. Staff must be afebrile for 24 hours without antipyretics before returning.',
      },
      {
        question_id: 'q_m05_08', prompt: 'Reusable equipment used in the home setting must be:',
        choices: ['Cleaned between uses at the end of the week', 'Cleaned and disinfected between each patient use using Agency-approved disinfectants', 'Cleaned only if visibly soiled', 'Replaced after each patient'],
        correct_answer: 1, rationale: 'Reusable equipment must be properly cleaned and disinfected between each patient to prevent cross-contamination.',
      },
      {
        question_id: 'q_m05_09', prompt: 'You notice a patient has a new wound with purulent drainage and increasing redness. Your infection control action includes:',
        choices: ['Document and continue planned wound care', 'Apply Standard Precautions for wound care, notify physician, assess for systemic signs of infection, document findings', 'Apply extra dressing and reassess at next visit', 'Refer to wound care specialist only'],
        correct_answer: 1, rationale: 'New wound infection signs require Standard Precautions, physician notification, systemic assessment, and documentation.',
      },
      {
        question_id: 'q_m05_10', prompt: 'The Agency must report certain infections to public health authorities because:',
        choices: ['It is optional under state law', 'Certain communicable diseases are mandated reportable conditions under state and federal law', 'Only hospitals are required to report infections', 'Only if the infection causes patient death'],
        correct_answer: 1, rationale: 'Mandatory communicable disease reporting is a state and federal legal requirement, not an optional activity.',
      },
    ],
  },

  /* ── M06 Communication Barriers ── */
  {
    test_id: 'test_achc_m06', topic_id: 'ACHC-ART-M06', passing_score: 80,
    questions: [
      {
        question_id: 'q_m06_01', prompt: 'A patient with limited English proficiency needs medication teaching. The BEST approach is:',
        choices: ['Use the patient\'s English-speaking neighbor as an interpreter', 'Request a qualified medical interpreter via Agency language access services', 'Speak slowly and loudly in English', 'Use Google Translate for all teaching'],
        correct_answer: 1, rationale: 'Qualified medical interpreters with clinical terminology competency are the professional standard for language-barrier patients.',
      },
      {
        question_id: 'q_m06_02', prompt: 'Health literacy refers to:',
        choices: ['Whether a patient has completed high school education', 'A patient\'s ability to obtain, process, and understand health information to make decisions', 'A patient\'s ability to read medical textbooks', 'Only the ability to understand discharge instructions'],
        correct_answer: 1, rationale: 'Health literacy encompasses the ability to obtain, process, and act on health information — not educational level.',
      },
      {
        question_id: 'q_m06_03', prompt: 'The teach-back method involves:',
        choices: ['Having the patient teach another family member what you explained', 'Asking the patient to explain in their own words what they understood', 'Reviewing the same content multiple times', 'Providing written instructions after a verbal explanation'],
        correct_answer: 1, rationale: 'Teach-back asks patients to explain what they learned in their own words, confirming comprehension rather than assuming it.',
      },
      {
        question_id: 'q_m06_04', prompt: 'A patient who is deaf uses ASL. The correct approach is:',
        choices: ['Write everything down — writing always suffices for deaf patients', 'Speak clearly so they can lip-read', 'Arrange a qualified ASL interpreter — do not rely on notes or lip-reading alone for clinical communication', 'Use gestures and body language'],
        correct_answer: 2, rationale: 'A qualified ASL interpreter is the professional standard. Writing notes and lip-reading are inadequate for clinical communication.',
      },
      {
        question_id: 'q_m06_05', prompt: 'Using medical jargon with a patient who has low health literacy primarily creates risk for:',
        choices: ['Time efficiency', 'Misunderstanding leading to medication errors, missed appointments, and poor adherence', 'Legal liability only', 'Staff satisfaction'],
        correct_answer: 1, rationale: 'Medical jargon with low-literacy patients directly creates care safety risks through misunderstanding.',
      },
      {
        question_id: 'q_m06_06', prompt: 'A patient\'s cognitive decline affects their understanding of care instructions. The MOST appropriate action is:',
        choices: ['Teach the patient only — involving family without consent violates autonomy', 'Assess capacity, involve the patient as much as possible, and coordinate with designated caregiver/proxy for the remainder', 'Document "patient unable to learn" and discontinue education', 'Delegate all education to the physician'],
        correct_answer: 1, rationale: 'Cognitive decline requires patient-centered assessment of capacity and involvement of authorized caregivers while maintaining the patient\'s dignity.',
      },
      {
        question_id: 'q_m06_07', prompt: 'Using plain language means:',
        choices: ['Avoiding all medical terminology in documentation', 'Using everyday words, short sentences, and active voice in patient communication', 'Speaking only in the patient\'s native language', 'Avoiding written materials'],
        correct_answer: 1, rationale: 'Plain language uses everyday words, short sentences, and active voice to improve comprehension — not eliminating clinical documentation accuracy.',
      },
      {
        question_id: 'q_m06_08', prompt: 'A patient from a culture where direct refusal is considered disrespectful may:',
        choices: ['Always be assumed to be agreeing with the care plan', 'Agree verbally but not follow through — requiring additional confirmation strategies beyond yes/no questions', 'Only communicate through family members', 'Require written agreement forms instead of verbal consent'],
        correct_answer: 1, rationale: 'Cultural norms around disagreement mean verbal agreement may not indicate genuine understanding or intent to comply.',
      },
      {
        question_id: 'q_m06_09', prompt: 'Low health literacy affects approximately what percentage of American adults?',
        choices: ['5-10%', '15-20%', '36% — more than one-third', 'Over 50%'],
        correct_answer: 2, rationale: 'Approximately 36% of American adults have low health literacy. This is not a rare condition — it is the norm in many patient populations.',
      },
      {
        question_id: 'q_m06_10', prompt: 'After providing medication instruction, a patient says "I understand." The recommended follow-up is:',
        choices: ['Document "patient verbalized understanding" and proceed', 'Use teach-back: ask the patient to demonstrate or explain when and how they would take the medication', 'Have the patient sign an education acknowledgment form', 'Provide a written pamphlet as backup'],
        correct_answer: 1, rationale: '"I understand" is insufficient confirmation. Teach-back through demonstration or verbalization is the evidence-based standard.',
      },
    ],
  },

  /* ── M07 Workplace & Patient Safety / OSHA ── */
  {
    test_id: 'test_achc_m07', topic_id: 'ACHC-ART-M07', passing_score: 80,
    questions: [
      {
        question_id: 'q_m07_01', prompt: 'When you arrive at a patient\'s home and observe an unsafe condition (loose electrical cords, medication accessible to children), the correct response is:',
        choices: ['Provide care and document the hazard in the visit note', 'Complete patient assessment, address immediate safety risks within scope, educate the patient/caregiver, and report to supervisor if risk requires Agency-level intervention', 'Call APS immediately without speaking to the patient', 'Refuse to provide care until hazards are removed'],
        correct_answer: 1, rationale: 'Address what you can within scope, educate, and escalate appropriately — do not unilaterally refuse care or bypass the patient without cause.',
      },
      {
        question_id: 'q_m07_02', prompt: 'The OSHA General Duty Clause requires employers to:',
        choices: ['Provide hazard pay for dangerous assignments', 'Provide a workplace free from recognized hazards likely to cause death or serious harm', 'Inspect workplaces weekly', 'Train employees about OSHA every 6 months'],
        correct_answer: 1, rationale: 'The OSHA General Duty Clause requires workplaces free from known hazards causing or likely to cause death or serious harm.',
      },
      {
        question_id: 'q_m07_03', prompt: 'A patient fall occurs during your visit. What should happen AFTER patient assessment and physician notification?',
        choices: ['Reassure the patient and family and continue the visit without additional reporting', 'Document the fall fully, complete an incident report before end of shift, and notify your supervisor', 'Wait to report until you know the outcome', 'Only report if an injury was sustained'],
        correct_answer: 1, rationale: 'Incident reports must be completed before end of shift regardless of apparent injury. Falls are always reportable events.',
      },
      {
        question_id: 'q_m07_04', prompt: 'An unsafe lift technique during patient transfers is primarily prevented by:',
        choices: ['Stronger staff', 'Body mechanics training, patient lift equipment, and two-person transfer protocols when appropriate', 'Encouraging staff to "push through" discomfort', 'Limiting patient transfer visits to experienced nurses only'],
        correct_answer: 1, rationale: 'Safe patient handling requires equipment, technique training, and protocol — not physical strength.',
      },
      {
        question_id: 'q_m07_05', prompt: 'Home safety assessment for medication storage should ensure:',
        choices: ['All medications are stored in one location for convenience', 'Medications are in original labeled containers, stored per manufacturer requirements, and secured from children/confused adults', 'Medications are stored in the refrigerator by default', 'Patients manage medication storage independently without assessment'],
        correct_answer: 1, rationale: 'Proper medication storage prevents errors and accidental ingestion by vulnerable household members.',
      },
      {
        question_id: 'q_m07_06', prompt: 'A patient\'s family member verbally threatens you during a visit. The correct action is:',
        choices: ['De-escalate and try to complete the visit', 'Ensure your safety first — leave if necessary; report to supervisor immediately; do not return alone until safety is confirmed', 'Document in the chart and continue', 'Call 911 before attempting to leave'],
        correct_answer: 1, rationale: 'Personal safety always comes first. Leave if threatened, report immediately, and do not return alone. 911 is appropriate only if actively in danger.',
      },
      {
        question_id: 'q_m07_07', prompt: 'Workplace violence prevention in home health begins with:',
        choices: ['A zero-tolerance policy that is posted in the office', 'Pre-visit risk assessment, documenting known threats in records, and field worker training on de-escalation and personal safety', 'Requiring staff to complete self-defense training', 'Installing cameras in patient homes'],
        correct_answer: 1, rationale: 'Prevention starts before the visit with risk assessment, communication in records, and staff training.',
      },
      {
        question_id: 'q_m07_08', prompt: 'OSHA\'s role regarding home health field workers is:',
        choices: ['OSHA does not cover home health workers', 'OSHA covers work-related hazards including bloodborne pathogens, ergonomic risks, and workplace violence even in patient homes', 'OSHA only covers office staff', 'OSHA coverage requires more than 10 employees'],
        correct_answer: 1, rationale: 'OSHA coverage extends to home health field workers for occupational hazards including BBP exposure, ergonomic risk, and workplace violence.',
      },
      {
        question_id: 'q_m07_09', prompt: 'You notice a patient\'s home has inadequate lighting in the path you walk during every visit, creating a consistent trip hazard. The correct action is:',
        choices: ['Adapt by walking carefully every visit', 'Address the concern with the patient or caregiver, document in the safety assessment, and escalate to supervisor if not remediated', 'File an incident report each time you visit without falling', 'Refuse to enter that area of the home'],
        correct_answer: 1, rationale: 'Persistent environmental hazards require documentation, patient/caregiver education, and escalation if not remediated.',
      },
      {
        question_id: 'q_m07_10', prompt: 'A near-miss event (almost happened but did not cause harm) should be:',
        choices: ['Ignored since no harm occurred', 'Reported using the incident reporting process — near-misses contain essential safety data for preventing future harm', 'Reported only if three near-misses occur', 'Reported verbally to a supervisor without documentation'],
        correct_answer: 1, rationale: 'Near-miss reporting is a quality safety essential — it provides data to prevent future harm before an actual adverse event occurs.',
      },
    ],
  },

  /* ── M08 Patient Rights & Responsibilities ── */
  {
    test_id: 'test_achc_m08', topic_id: 'ACHC-ART-M08', passing_score: 80,
    questions: [
      {
        question_id: 'q_m08_01', prompt: 'A competent adult patient refuses a recommended wound irrigation. The correct action is:',
        choices: ['Perform it anyway because it\'s medically necessary', 'Respect the refusal, document it, ensure the patient understands risks, and notify the physician', 'Discharge the patient for non-compliance', 'Ask the family to convince the patient'],
        correct_answer: 1, rationale: 'Competent patients have an absolute right to refuse any treatment. Document, ensure informed refusal, notify physician.',
      },
      {
        question_id: 'q_m08_02', prompt: 'Informed consent requires which elements?',
        choices: ['Patient signature only', 'Complete disclosure of risks, benefits, alternatives, and the right to refuse before agreeing to treatment', 'Physician recommendation and patient agreement', 'Written authorization for each individual procedure'],
        correct_answer: 1, rationale: 'Informed consent requires disclosure of risks, benefits, alternatives, and the right to refuse — not just a signature.',
      },
      {
        question_id: 'q_m08_03', prompt: 'A patient\'s family wants to see the patient\'s medical records. Without patient authorization:',
        choices: ['Family members always have access to records', 'Access requires the patient\'s written authorization — or legal documentation of proxy/guardian status', 'Records can be shared verbally but not in writing', 'Family access is at staff discretion'],
        correct_answer: 1, rationale: 'Patient records are protected PHI. Without authorization or legal guardianship documentation, family access is prohibited.',
      },
      {
        question_id: 'q_m08_04', prompt: 'Patient responsibilities in the home health setting include:',
        choices: ['Only paying bills on time', 'Providing accurate health history, following the agreed care plan, treating staff respectfully, and notifying the Agency of changes in condition', 'Accepting all recommended treatments without question', 'There are no patient responsibilities — care is unconditional'],
        correct_answer: 1, rationale: 'Patients have responsibilities in the therapeutic partnership including providing accurate information, following the care plan, and treating staff with respect.',
      },
      {
        question_id: 'q_m08_05', prompt: 'The Agency may not discriminate against patients based on:',
        choices: ['Their ability to pay for services', 'Race, color, national origin, disability, sex, age, or religion — and must provide equal access to services', 'Their diagnosis', 'Their behavior during previous admissions'],
        correct_answer: 1, rationale: 'Non-discrimination on the basis of protected characteristics is a patient right and a legal requirement.',
      },
      {
        question_id: 'q_m08_06', prompt: 'A patient has the right to dignity and respect, which means:',
        choices: ['Staff may use first names unless instructed otherwise', 'Addressing patients by their preferred name/title, maintaining privacy, and providing care without judgment or disrespect', 'Patients must be addressed formally at all times', 'Dignity applies only during personal care activities'],
        correct_answer: 1, rationale: 'Dignity and respect pervade all interactions — not just personal care — including name preferences, privacy, and non-judgmental communication.',
      },
      {
        question_id: 'q_m08_07', prompt: 'When a patient experiences a change in condition, their rights include:',
        choices: ['Being informed only after a physician reviews the change', 'Being notified promptly and having their care plan adjusted with their participation', 'Waiting for the next scheduled visit to receive information', 'Rights are not specifically addressed during condition changes'],
        correct_answer: 1, rationale: 'Patients have the right to be promptly informed of changes and to participate in care plan updates.',
      },
      {
        question_id: 'q_m08_08', prompt: 'A patient asks to see their plan of care. The correct response is:',
        choices: ['Explain that the plan is a clinical document not shared with patients', 'Provide a copy — patients have the right to access their own care plan', 'Share only selected portions approved by the supervisor', 'Provide access only upon written request'],
        correct_answer: 1, rationale: 'Patients have the right to access their own care plan — it is their plan, not just a clinical document.',
      },
      {
        question_id: 'q_m08_09', prompt: 'Restraint use in home health is:',
        choices: ['Permitted for any patient safety concern', 'Strictly regulated — any restraint requires physician order, patient/family consent, assessment, monitoring, and documentation', 'Not applicable since home health patients are independent', 'Only permitted for psychiatric patients'],
        correct_answer: 1, rationale: 'Restraints require physician orders, consent, and ongoing monitoring even in the home setting. They are strictly regulated.',
      },
      {
        question_id: 'q_m08_10', prompt: 'Regarding advance directives, home health agencies are required to:',
        choices: ['Require all patients to have one as a condition of admission', 'Provide written information about advance directives at admission and document whether one exists', 'Create advance directives on behalf of patients who lack one', 'Only inquire about advance directives for patients over 65'],
        correct_answer: 1, rationale: 'Agencies must provide written advance directive information at admission and document the patient\'s status — they cannot require or create them.',
      },
    ],
  },

  /* ── M09 Corporate Compliance ── */
  {
    test_id: 'test_achc_m09', topic_id: 'ACHC-ART-M09', passing_score: 80,
    questions: [
      {
        question_id: 'q_m09_01', prompt: 'The False Claims Act imposes liability on:',
        choices: ['Only healthcare administrators who approve billing', 'Anyone who knowingly submits or causes to be submitted a false claim to a government program', 'Only physicians who order services', 'Only billing department staff'],
        correct_answer: 1, rationale: 'The False Claims Act imposes individual liability on anyone involved in submitting false claims — including field staff whose documentation supports billing.',
      },
      {
        question_id: 'q_m09_02', prompt: 'An organization with NO compliance program receives criminal conviction. It will most likely receive:',
        choices: ['A warning letter only', 'Corporate probation — government-imposed compliance program with enhanced monitoring', 'A fine equal to 10% of annual revenue', 'Suspension of operations for 30 days'],
        correct_answer: 1, rationale: 'Absence of a compliance program = mandatory corporate probation under the Organizational Sentencing Guidelines.',
      },
      {
        question_id: 'q_m09_03', prompt: 'The Whistleblower Protection Act prohibits:',
        choices: ['Employees from reporting compliance concerns to state agencies', 'Employers from retaliating against employees who report fraud, waste, or abuse', 'Anonymous reporting to the OIG', 'Reporting compliance concerns before investigating them internally'],
        correct_answer: 1, rationale: 'The Whistleblower Protection Act prohibits employer retaliation against employees who report to the OIG.',
      },
      {
        question_id: 'q_m09_04', prompt: 'A field worker discovers their supervisor is asking multiple staff to round up visit times. The correct action is:',
        choices: ['Comply since it is a supervisor instruction', 'Report to the Compliance Officer directly — supervisor involvement escalates the concern', 'Wait to see if it\'s also raised by a coworker', 'Only report if the amount rounds up more than 30 minutes'],
        correct_answer: 1, rationale: 'When the compliance concern involves your supervisor, report directly to the Compliance Officer — not through the management chain.',
      },
      {
        question_id: 'q_m09_05', prompt: 'Which of the following is a potential Anti-Kickback Statute violation?',
        choices: ['A DME company providing free training to agency nurses about their products', 'A DME company giving the agency staff members restaurant gift cards for each patient referral', 'A DME company sponsoring a community health fair', 'A DME company providing discounted equipment to the agency'],
        correct_answer: 1, rationale: 'Providing anything of value (gift cards) in exchange for patient referrals violates the Anti-Kickback Statute regardless of value.',
      },
      {
        question_id: 'q_m09_06', prompt: 'Internal audits in a healthcare organization primarily serve to:',
        choices: ['Identify staff who are violating compliance policies for termination', 'Proactively identify compliance gaps and correct them before external audits or violations occur', 'Replace the need for compliance training', 'Only apply to billing staff'],
        correct_answer: 1, rationale: 'Internal audits are a proactive compliance tool for identifying and correcting issues before external enforcement.',
      },
      {
        question_id: 'q_m09_07', prompt: 'A field worker who documents a visit as "completed" when they arrived but the patient was not home has committed:',
        choices: ['A scheduling error requiring correction', 'Potential healthcare fraud — false documentation supporting a claim for a service not rendered', 'A minor administrative error', 'A HIPAA violation'],
        correct_answer: 1, rationale: 'Documenting a visit as completed when it was not renders the claim false — constituting potential healthcare fraud.',
      },
      {
        question_id: 'q_m09_08', prompt: 'The OIG Fraud Hotline number is:',
        choices: ['1-800-MEDICARE', '1-800-HHS-TIPS', '1-888-OIG-FRAUD', '311'],
        correct_answer: 1, rationale: 'The HHS OIG Fraud Hotline is 1-800-HHS-TIPS (1-800-447-8477).',
      },
      {
        question_id: 'q_m09_09', prompt: 'A compliance program must include which minimum elements?',
        choices: ['Written policies only', 'Written policies, compliance officer, training, open communication, auditing, disciplinary guidelines, and prompt corrective action', 'Training and a compliance hotline only', 'A legal department and compliance officer'],
        correct_answer: 1, rationale: 'All seven OIG minimum elements are required for an effective compliance program.',
      },
      {
        question_id: 'q_m09_10', prompt: 'Disciplinary guidelines for compliance violations in a healthcare organization must be:',
        choices: ['Kept confidential to avoid intimidating employees', 'Published and known to all employees so they understand the consequences of violations', 'Applied only to clinical staff', 'Developed and kept by the compliance officer alone'],
        correct_answer: 1, rationale: 'Publicized disciplinary guidelines are one of the seven required elements of an effective compliance program.',
      },
    ],
  },

  /* ── M10 Ethics ── */
  {
    test_id: 'test_achc_m10', topic_id: 'ACHC-ART-M10', passing_score: 80,
    questions: [
      {
        question_id: 'q_m10_01', prompt: 'A patient with terminal cancer refuses further chemotherapy. They are alert and competent. The correct clinical response is:',
        choices: ['Contact their family to override the decision', 'Honor the refusal — competent patients have the right to refuse any treatment including life-sustaining care', 'Consult psychiatry to assess capacity', 'Initiate an ethics committee consult to overrule the patient'],
        correct_answer: 1, rationale: 'Competent patient autonomy is the paramount ethical principle. Competent patients have the right to refuse any care including life-sustaining treatment.',
      },
      {
        question_id: 'q_m10_02', prompt: 'The Agency Code of Ethics covers how many domains?',
        choices: ['3', '5', '7', '10'],
        correct_answer: 1, rationale: 'The Agency Code of Ethics covers 5 domains: Patient Rights, Other Providers, Fiscal, Marketing, and Personnel.',
      },
      {
        question_id: 'q_m10_03', prompt: 'A healthcare proxy is MOST accurately described as:',
        choices: ['A family member who automatically makes medical decisions when a patient is hospitalized', 'A legally designated person who makes healthcare decisions consistent with the patient\'s known wishes when the patient cannot speak', 'Anyone the physician designates as decision-maker', 'A court-appointed guardian always assigned to elderly patients'],
        correct_answer: 1, rationale: 'A healthcare proxy is designated by the patient to make decisions consistent with the patient\'s known wishes — not their own preferences.',
      },
      {
        question_id: 'q_m10_04', prompt: 'Professional boundary violations in healthcare include:',
        choices: ['Providing additional resources a patient requests', 'Entering a sexual relationship with a patient, even after discharge', 'Having a meal with a patient\'s family during a visit', 'Sharing relevant personal information when it helps establish rapport'],
        correct_answer: 1, rationale: 'Sexual relationships with patients are a severe boundary violation that extends beyond discharge — the therapeutic relationship creates lifelong prohibitions.',
      },
      {
        question_id: 'q_m10_05', prompt: 'The Ethics Committee is convened for:',
        choices: ['Only end-of-life decisions', 'Any genuine ethical dilemma where standard protocols do not provide clear guidance', 'Only cases involving legal action', 'Only when patients or families request it'],
        correct_answer: 1, rationale: 'The Ethics Committee can be convened for any genuine ethical dilemma — not just end-of-life or legal situations.',
      },
      {
        question_id: 'q_m10_06', prompt: 'A staff member conscientiously objects to participating in a specific clinical procedure. Under the Agency\'s ethics framework:',
        choices: ['The employee can refuse all assignments involving patients who might require that procedure', 'The employee may decline that specific procedure — the Agency must provide an alternative without penalizing the employee', 'Conscientious objection is not recognized in healthcare employment', 'The employee may be terminated for refusing the procedure'],
        correct_answer: 1, rationale: 'Conscientious objection to specific procedures is recognized, but the employee cannot refuse entire patient categories, and the Agency must arrange an alternative.',
      },
      {
        question_id: 'q_m10_07', prompt: 'Informed consent differs from consent in that:',
        choices: ['There is no difference', 'Informed consent requires disclosure of risks, benefits, alternatives, and the right to refuse BEFORE agreement — not just agreement to proceed', 'Informed consent only applies to surgical procedures', 'Informed consent is a written document; consent is verbal'],
        correct_answer: 1, rationale: 'Informed consent requires comprehensive pre-treatment disclosure — it is not satisfied by a signature alone.',
      },
      {
        question_id: 'q_m10_08', prompt: 'Only which legal authority can determine that an adult patient is legally incompetent?',
        choices: ['The attending physician', 'A court of law', 'Two physicians in writing', 'The patient\'s family members collectively'],
        correct_answer: 1, rationale: 'Legal incompetence is a judicial determination. Clinical assessments inform capacity evaluations but do not establish legal incompetence.',
      },
      {
        question_id: 'q_m10_09', prompt: 'Overriding a valid advance directive constitutes:',
        choices: ['A clinical judgment call', 'Legally assault and battery — regardless of clinical intent', 'A compliance violation only', 'An ethical violation that does not have legal implications'],
        correct_answer: 1, rationale: 'Overriding a valid advance directive constitutes assault and battery regardless of clinical intent.',
      },
      {
        question_id: 'q_m10_10', prompt: 'When personal values conflict with professional duty to a specific patient, the correct approach is:',
        choices: ['Decline the assignment and the supervisor will explain why to the patient', 'Provide professional care without judgment; if a specific procedure genuinely conflicts with beliefs, use proper conscientious objection channels', 'Request only patients who share your values', 'Ask the patient to find a different agency'],
        correct_answer: 1, rationale: 'Professional duty requires non-judgmental care. Value conflicts about procedures — not patients — are addressed through conscientious objection channels.',
      },
    ],
  },

  /* ── M11 TB & Bloodborne Pathogens ── */
  {
    test_id: 'test_achc_m11', topic_id: 'ACHC-ART-M11', passing_score: 80,
    questions: [
      {
        question_id: 'q_m11_01', prompt: 'After a needlestick injury, the FIRST action is:',
        choices: ['Call your supervisor', 'Remove glove and wash the site with soap and water for at least 30 seconds — do not squeeze or suck', 'Seek medical evaluation', 'Complete an incident report'],
        correct_answer: 1, rationale: 'Immediate decontamination (washing) must happen within seconds. All other steps follow.',
      },
      {
        question_id: 'q_m11_02', prompt: 'A surgical mask provides adequate protection for a nurse caring for a patient with suspected active TB:',
        choices: ['True — surgical masks filter respiratory droplets', 'False — TB is airborne and requires an N95 respirator (fit-tested)', 'True if the nurse is vaccinated', 'False only if the patient has confirmed MDR-TB'],
        correct_answer: 1, rationale: 'TB is airborne. Surgical masks do not filter droplet nuclei. Only fit-tested N95 respirators provide adequate protection.',
      },
      {
        question_id: 'q_m11_03', prompt: 'The risk of HIV transmission per needlestick without prophylaxis is approximately:',
        choices: ['30%', '1.8%', '0.3%', '0.01%'],
        correct_answer: 2, rationale: 'HIV transmission risk is approximately 0.3% per needlestick. HBV is 30%; HCV is 1.8%.',
      },
      {
        question_id: 'q_m11_04', prompt: 'Post-Exposure Prophylaxis (PEP) for HIV must begin within:',
        choices: ['48 hours', '72 hours of the exposure for maximum effectiveness', '7 days', '24 hours only'],
        correct_answer: 1, rationale: 'PEP effectiveness decreases significantly after 72 hours. Initiation as soon as possible is critical.',
      },
      {
        question_id: 'q_m11_05', prompt: 'Bloodborne pathogens are NOT transmitted by:',
        choices: ['Needlestick injuries', 'Saliva alone (without visible blood), tears, sweat, urine on intact skin', 'Mucous membrane exposure to blood', 'Blood splash to the eye'],
        correct_answer: 1, rationale: 'Saliva alone, tears, sweat, and urine on intact skin do not transmit BBP. Direct contact with infectious material plus a portal of entry is required.',
      },
      {
        question_id: 'q_m11_06', prompt: 'A classic symptom cluster suggesting active pulmonary TB includes:',
        choices: ['Sudden onset fever and vomiting', 'Productive cough >3 weeks, night sweats, unexplained weight loss, and hemoptysis', 'Rash and joint pain', 'Dry cough and sore throat for 2 weeks'],
        correct_answer: 1, rationale: 'The classic TB symptom cluster: productive cough >3 weeks, night sweats, weight loss, and hemoptysis (blood in sputum).',
      },
      {
        question_id: 'q_m11_07', prompt: 'An N95 respirator must be fit-tested:',
        choices: ['Only once at hire', 'Before first use and annually thereafter, and user seal-checked before every single use', 'Annually only', 'Only when assigned to a known TB patient'],
        correct_answer: 1, rationale: 'N95 requires initial fit-test, annual fit-test, and user seal-check before every use.',
      },
      {
        question_id: 'q_m11_08', prompt: 'HBV vaccination in the workplace:',
        choices: ['Is optional and must be declined in writing to avoid being automatically vaccinated', 'Must be offered by the employer within 10 working days of initial assignment — employee may voluntarily decline', 'Is the employee\'s financial responsibility', 'Only applies to nurses, not other clinical staff'],
        correct_answer: 1, rationale: 'OSHA requires employers to offer HBV vaccination within 10 days at no cost. Employees may decline but may later request it.',
      },
      {
        question_id: 'q_m11_09', prompt: 'The medical evaluation following a bloodborne pathogen exposure must be:',
        choices: ['Scheduled within 2 weeks', 'Sought within 2 hours of the exposure — time-critical for PEP decision', 'Completed before end of the work week', 'Only required if the source patient is known positive'],
        correct_answer: 1, rationale: 'Medical evaluation within 2 hours is critical to determine PEP eligibility while treatment is still maximally effective.',
      },
      {
        question_id: 'q_m11_10', prompt: 'If a patient develops suspected active TB after admission to the Agency\'s service:',
        choices: ['The Agency may continue services normally as long as the nurse wears a surgical mask', 'The Agency continues services with N95 protection, notifies the physician and supervisor, and the local health department (mandatory report)', 'Services are automatically discontinued', 'Only the physician can determine whether to continue services'],
        correct_answer: 1, rationale: 'Continue services with N95 protection. Notify physician, supervisor, and health department — TB is a mandatory communicable disease report.',
      },
    ],
  },

  /* ── M12 Medical Device Act ── */
  {
    test_id: 'test_achc_m12', topic_id: 'ACHC-ART-M12', passing_score: 80,
    questions: [
      {
        question_id: 'q_m12_01', prompt: 'The threshold standard for an MDR reportable event is:',
        choices: ['Confirmed device causation', '"Reasonably suggests the device may have caused or contributed to" death or serious injury', 'High probability that the device caused the event', 'Three or more events with the same device model'],
        correct_answer: 1, rationale: '"May have caused or contributed to" is the low threshold. You do not need confirmed causation to report.',
      },
      {
        question_id: 'q_m12_02', prompt: 'A patient death where a device may have been involved must be reported to:',
        choices: ['The manufacturer only', 'FDA AND the manufacturer within 10 working days of awareness', 'The state health department only', 'ACHC only'],
        correct_answer: 1, rationale: 'Deaths go to both FDA and the manufacturer. Serious injuries go only to the manufacturer (or FDA if manufacturer is unknown).',
      },
      {
        question_id: 'q_m12_03', prompt: 'The 10-working-day FDA reporting clock begins:',
        choices: ['When the investigation concludes', 'When ANY employee of the user facility becomes aware of the event', 'When the patient complains', 'When the physician confirms device causation'],
        correct_answer: 1, rationale: 'The clock starts at employee awareness — not at investigation completion or physician confirmation.',
      },
      {
        question_id: 'q_m12_04', prompt: 'After a device malfunctions and causes patient injury, the device should be:',
        choices: ['Returned to the DME company immediately', 'Preserved in its current state and not returned, repaired, or discarded until released by risk management', 'Repaired and returned to service if the patient is stable', 'Photographed and then discarded to prevent further injury'],
        correct_answer: 1, rationale: 'The device is evidentiary and must be preserved for the MDR investigation per RM-MD-001 (Medical Device Reporting).',
      },
      {
        question_id: 'q_m12_05', prompt: '"Serious injury" in MDR reporting includes which of the following?',
        choices: ['Any injury requiring a bandage', 'Life-threatening injuries, permanent impairment, or injuries requiring intervention to prevent permanent damage', 'Only injuries resulting in hospitalization', 'Injuries the patient considers serious'],
        correct_answer: 1, rationale: 'Three categories of serious injury: life-threatening, permanently impairing, or requiring intervention to prevent permanent damage.',
      },
      {
        question_id: 'q_m12_06', prompt: 'A device malfunctions but no patient injury occurs (near-miss). This should be:',
        choices: ['Ignored since no harm occurred', 'Reported voluntarily via MedWatch — near-miss data informs FDA safety analysis and potential recalls', 'Reported only if the same device model has had three prior malfunctions', 'Reported only internally with no external reporting'],
        correct_answer: 1, rationale: 'Voluntary MedWatch reporting for near-miss device events provides valuable safety data that can prevent future harm.',
      },
      {
        question_id: 'q_m12_07', prompt: 'The user facility (home health agency) is responsible for filing MDR reports with:',
        choices: ['The state health department', 'FDA and/or the manufacturer depending on event type', 'The Joint Commission', 'Their malpractice insurer'],
        correct_answer: 1, rationale: 'User facilities report to FDA (for deaths) and to manufacturers (for serious injuries). State departments are not MDR recipients.',
      },
      {
        question_id: 'q_m12_08', prompt: 'A field nurse\'s role in the MDR process is to:',
        choices: ['File the FDA Form 3500A directly', 'Identify the event, document fully with device details, and report to the Administrator immediately', 'Determine whether the event meets reporting thresholds', 'Contact the device manufacturer directly'],
        correct_answer: 1, rationale: 'Field staff identify, document, and report to the Administrator. The Administrator determines reportability and files the FDA report.',
      },
      {
        question_id: 'q_m12_09', prompt: 'Safety Data Sheets (SDS) in the home health context are relevant because:',
        choices: ['They only apply to industrial workplaces', 'Field workers may encounter chemical hazards in patient homes and office environments requiring SDS access and training', 'SDS are only required for cleaning products in healthcare offices', 'SDS training is only required at hire, not annually'],
        correct_answer: 1, rationale: 'Chemical hazards exist in home environments. SDS training is required at orientation AND annually.',
      },
      {
        question_id: 'q_m12_10', prompt: 'The annual Agency MDR summary report to FDA is due:',
        choices: ['Every July 1', 'Every January 1', 'Every 180 days', 'Only after a reportable event occurs'],
        correct_answer: 1, rationale: 'The annual summary report to FDA is due January 1 each year.',
      },
    ],
  },
];
