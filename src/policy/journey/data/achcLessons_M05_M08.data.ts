import type { Lesson } from './achcContentTypes';

const IMG = {
  M05: '/assets/media/infection-ppe.jpg',
  M06: '/assets/media/patient-rights.jpg',
  M07: '/assets/media/abuse-reporting.jpg',
  M08: '/assets/media/emergency-prep.jpg',
};

export const achcLessons_M05_M08: Lesson[] = [

  /* ══════════════════════ M05 Infection Control ══════════════════════ */

  {
    lesson_id: 'achc_m05_l0', topic_id: 'ACHC-ART-M05', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m05_l0_hook', type: 'challenge', title: 'Pre-Assessment: Test Yourself First',
        content: 'You arrive for wound care. The home has no running water — the pipes froze overnight. The dressing is saturated and malodorous. You have your nursing bag, hand sanitizer, and gloves. The patient says: "Just change it quick — I know you\'re busy."\n\nWhat is your CORRECT action?',
        narration_script: 'Pre-assessment. You arrive for wound care. The pipes froze — no running water. The dressing is saturated. You have your nursing bag, hand sanitizer, and gloves. The patient says to change it quickly. What is your correct action?',
        audio_path: '/training-audio/ACHC-ART-M05/l0/hook.wav', image_url: IMG.M05, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'Use hand sanitizer, don gloves, and proceed — no water isn\'t ideal but the wound needs attention', isCorrect: false, rationale: 'Insufficient — you must also document the environmental limitation and assess urgency before proceeding.' },
          { id: 'B', label: 'Assess wound urgency, use alcohol-based sanitizer (acceptable when hands not visibly soiled), don gloves, proceed with aseptic technique, and document the limitation', isCorrect: true, rationale: 'Correct — CDC guidelines permit alcohol sanitizer when hands are not visibly soiled. Document environmental limitations.' },
          { id: 'C', label: 'Refuse to provide care until running water is restored — infection control requires soap and water', isCorrect: false, rationale: 'Care cannot be abandoned due to environmental limitations. Alcohol sanitizer is an approved alternative.' },
          { id: 'D', label: 'Use the patient\'s bottled drinking water to wash hands and proceed', isCorrect: false, rationale: 'Bottled drinking water without soap is not an approved hand hygiene method for clinical care.' },
        ],
      },
      {
        card_id: 'achc_m05_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Apply Standard Precautions for all patient encounters regardless of diagnosis.\n2. Demonstrate correct hand hygiene technique including when alcohol-based sanitizer is and is not acceptable.\n3. Select appropriate PPE based on anticipated exposure risk.\n4. Execute proper bag technique to minimize cross-contamination between patients.\n5. Handle sharps safely and describe the Agency\'s Exposure Control Plan.\n6. Identify reportable diseases and the notification process.',
        narration_script: 'Learning objectives. One: apply Standard Precautions for all patient encounters regardless of diagnosis. Two: demonstrate correct hand hygiene, including when alcohol sanitizer is and is not acceptable. Three: select appropriate PPE based on anticipated exposure. Four: execute proper bag technique. Five: handle sharps safely and describe the Exposure Control Plan. Six: identify reportable diseases and the notification process.',
        audio_path: '/training-audio/ACHC-ART-M05/l0/objectives.wav', image_url: IMG.M05, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m05_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Standard Precautions — Treat ALL blood and body fluids as infectious for ALL patients. Based on EXPOSURE, not diagnosis.\n\nAlcohol-Based Hand Rub — Preferred for routine decontamination when hands not visibly soiled. NOT effective for C-Diff.\n\nBag Technique — Bag never on floor; barrier always used; hands clean before accessing; monthly deep clean.\n\nExposure Control Plan — OSHA-required written program defining employee protection and post-exposure response.\n\nReportable Disease — Infections requiring notification to the health department by state law.\n\nSharps Container — Fill to 3/4 only; never recap needles; puncture-resistant.\n\nAseptic Technique — Methods preventing contamination during sterile procedures (wound care, IV, catheter).',
        narration_script: 'Seven key terms. Standard Precautions: treat all blood and body fluids as infectious for all patients — based on exposure, not diagnosis. Alcohol-Based Hand Rub: preferred for routine decontamination — NOT effective for C-Diff. Bag Technique: never on the floor, barrier always required, hands clean before accessing. Exposure Control Plan: OSHA-required program defining protection and post-exposure response. Reportable Disease: infections requiring health department notification by state law. Sharps Container: fill to three-quarters only, never recap. Aseptic Technique: methods preventing contamination during sterile procedures.',
        audio_path: '/training-audio/ACHC-ART-M05/l0/concepts.wav', image_url: IMG.M05, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m05_l1', topic_id: 'ACHC-ART-M05', title: 'Lesson 1: Standard Precautions in the Home', order: 1,
    cards: [
      {
        card_id: 'achc_m05_l1_s', type: 'summary', title: 'Every Patient. Every Visit. No Exceptions.',
        content: 'Standard Precautions apply to EVERY patient regardless of diagnosis, known infection status, or the patient\'s own statements. The reason: many infectious patients are asymptomatic. A patient who looks healthy can transmit HBV, HCV, or HIV through a single needlestick.',
        narration_script: 'Standard Precautions apply to every patient at every visit, with no exceptions. The reason: many infectious patients have no symptoms. A patient who looks and feels completely healthy can transmit Hepatitis B, Hepatitis C, or HIV through a single exposure.',
        audio_path: '/training-audio/ACHC-ART-M05/l1/summary.wav', image_url: IMG.M05, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m05_l1_c1', type: 'content', title: 'Standard Precautions: What They Cover',
        content: 'Treat as potentially infectious: blood, ALL body fluids (except sweat), non-intact skin, mucous membranes.\n\nPPE requirements by exposure:\n• Gloves: any body fluid contact, non-intact skin, mucous membranes\n• Gown: when body fluid splash or contact with patient environment is likely\n• Mask (surgical): droplet precautions, respiratory symptoms\n• N95: airborne precautions (TB, COVID isolation)\n• Eye protection: splash risk during procedures (venipuncture, suctioning, irrigation)\n\nKey rules:\n• Gloves do NOT replace hand washing — wash AFTER removing gloves\n• Change gloves between EACH patient contact\n• Never touch clean surfaces with contaminated gloves',
        narration_script: 'Standard Precautions cover blood, all body fluids except sweat, non-intact skin, and mucous membranes. PPE by exposure: gloves for any body fluid contact. Gown when splash or environmental contamination is likely. Surgical mask for droplet precautions. N95 for airborne precautions including TB and COVID isolation. Eye protection for any splash risk during procedures. Key rules: gloves do not replace hand washing — always wash after removal. Change gloves between every patient contact. Never touch clean surfaces with contaminated gloves.',
        audio_path: '/training-audio/ACHC-ART-M05/l1/content1.wav', image_url: IMG.M05, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m05_l1_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Assume ALL blood and body fluids are infectious — for EVERY patient\n• Standard Precautions are based on EXPOSURE RISK, not patient diagnosis or isolation status\n• Change gloves between EACH patient\n• Healthcare workers with exudative lesions or weeping dermatitis must refrain from direct patient care\n• Contamination of skin: immediate soap and water wash\n• "No isolation precautions" does NOT mean "no precautions"',
        narration_script: 'Takeaways. Assume all blood and body fluids are infectious for every patient. Standard Precautions are based on exposure risk, not diagnosis or isolation status. Change gloves between every patient. Healthcare workers with open skin lesions or weeping dermatitis must refrain from direct patient care. For skin contamination: immediate soap and water wash. And remember: no isolation precautions does not mean no precautions.',
        audio_path: '/training-audio/ACHC-ART-M05/l1/takeaways.wav', image_url: IMG.M05, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m05_l1_c2', type: 'content', title: 'Field Scenario: Bag Technique Failure in Multi-Patient Home',
        content: 'Field scenario: You arrive at a home with two patients (spouses). After caring for the first (wound care), you set your bag on the floor in the kitchen before washing hands. You then move to the second patient without re-bagging or full hand hygiene reset.\n\nPer CL-SD-016 (Infection Prevention & Control):\n• Re-bag supplies between patients\n• Perform hand hygiene at 5 moments including between household patients\n• Never place bag on potentially contaminated surfaces\n• If breach occurs, document, notify, and use remediation supplies\n\nThis scenario commonly leads to cross-contamination citations.',
        narration_script: 'Field scenario in multi-patient home. Bag on kitchen floor after first patient without reset violates CL-SD-016 (Infection Prevention & Control). Always re-bag, full hand hygiene between patients even in same home, and never place bag on floor or contaminated areas.',
        audio_path: '/training-audio/ACHC-ART-M05/l1/content2.wav', image_url: IMG.M05, estimated_duration: '1:20', completion_required: true,
      },
      {
        card_id: 'achc_m05_l1_ch', type: 'challenge', title: 'Challenge: Tracheostomy Suctioning PPE',
        content: 'You are about to perform tracheostomy suctioning. The patient has a productive cough and blood-tinged sputum. Their TB test from last month was negative.\n\nWhat PPE is required for this procedure?',
        narration_script: 'Challenge scenario. You are about to perform tracheostomy suctioning. The patient has a productive cough with blood-tinged sputum. TB test from last month was negative. What PPE is required?',
        audio_path: '/training-audio/ACHC-ART-M05/l1/challenge.wav', image_url: IMG.M05, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'Gloves only — TB is negative so respiratory protection isn\'t needed', isCorrect: false, rationale: 'Standard Precautions are based on exposure risk, not diagnosis. Blood-tinged aerosol requires face and eye protection regardless of TB status.' },
          { id: 'B', label: 'Gloves and gown only', isCorrect: false, rationale: 'Gown protects clothing but not eyes, nose, or mouth from blood-tinged aerosol exposure.' },
          { id: 'C', label: 'Gloves, gown, goggles/face shield, and mask — suctioning produces aerosol with blood-tinged secretions', isCorrect: true, rationale: 'Correct — suctioning is an aerosol-generating procedure. Blood-tinged secretions require full face protection per Standard Precautions.' },
          { id: 'D', label: 'No PPE needed — the patient isn\'t on isolation precautions', isCorrect: false, rationale: '"No isolation precautions" does not mean no precautions. Standard Precautions apply to all patients, always.' },
        ],
      },
      {
        card_id: 'achc_m05_l1_deb', type: 'content', title: 'Operational Debrief: Exposure-Based PPE',
        content: 'PPE selection is based on WHAT YOU WILL BE EXPOSED TO — not the patient\'s diagnosis.\n\nWhy the others fail:\n• A: Negative TB test eliminates one pathogen but not others. Blood-tinged aerosol from suctioning = face/eye protection required\n• B: A gown alone protects clothing but leaves your face, eyes, nose, and mouth exposed to aerosol\n• D: This is a fundamental misunderstanding. "No isolation precautions" means no additional isolation beyond Standard Precautions — Standard Precautions always apply\n\nACHC observes PPE practices during surveys. Incorrect selection = immediate finding.\nClinician infection → missed visits → patient care gaps.',
        narration_script: 'Debrief. PPE selection is based on what you will be exposed to, not the patient\'s diagnosis. Option A fails because negative TB does not eliminate all respiratory pathogens — blood-tinged aerosol requires face and eye protection. Option B is incomplete because a gown alone leaves your face exposed. Option D is a fundamental misunderstanding — Standard Precautions always apply. ACHC observes PPE practices during surveys. Incorrect selection is an immediate finding.',
        audio_path: '/training-audio/ACHC-ART-M05/l1/debrief.wav', image_url: IMG.M05, estimated_duration: '0:55', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m05_l2', topic_id: 'ACHC-ART-M05', title: 'Lesson 2: Hand Hygiene & Bag Technique', order: 2,
    cards: [
      {
        card_id: 'achc_m05_l2_s', type: 'summary', title: 'C-Diff Is the Critical Exception',
        content: 'Alcohol-based hand rub is the PREFERRED method for routine decontamination. The critical exception: Clostridioides difficile (C-Diff). Alcohol does NOT kill C-Diff spores. After C-Diff patient care, soap and water is REQUIRED — even when hands appear clean.',
        narration_script: 'Alcohol-based hand rub is the preferred method for routine decontamination. The critical exception you must memorize: Clostridioides difficile, or C-Diff. Alcohol does not kill C-Diff spores. After caring for a C-Diff patient, soap and water is required — even when your hands appear clean.',
        audio_path: '/training-audio/ACHC-ART-M05/l2/summary.wav', image_url: IMG.M05, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m05_l2_c1', type: 'content', title: 'Hand Hygiene and Bag Technique Rules',
        content: 'Hand hygiene:\n• Alcohol-based hand rub: 20–30 seconds until dry (preferred for routine)\n• Soap and water: 15–20 seconds; REQUIRED for C-Diff, norovirus, visibly soiled hands\n• 5 Moments: before patient contact, before aseptic procedure, after fluid exposure, after patient contact, after touching patient surroundings\n• Nails < 1/4 inch; no artificial nails; rings discouraged\n\nBag technique:\n• NEVER place bag on floor — use shoulder until barrier placed\n• Use disposable barrier (paper towel/pad) before placing on any surface\n• Clean hands BEFORE and AFTER accessing bag\n• Monthly deep-clean required\n• Double plastic bags for virulent organism or vermin environment',
        narration_script: 'Hand hygiene rules. Alcohol-based hand rub: 20 to 30 seconds until dry — preferred for routine decontamination. Soap and water: 15 to 20 seconds — required for C-Diff, norovirus, and visibly soiled hands. Five moments: before patient contact, before aseptic procedures, after fluid exposure, after patient contact, and after touching patient surroundings. Nail length under one-quarter inch. No artificial nails. Rings discouraged. Bag technique: never place on the floor, use a barrier on every surface, clean hands before and after accessing, monthly deep-clean required. Double plastic bags in virulent organism or vermin environments.',
        audio_path: '/training-audio/ACHC-ART-M05/l2/content1.wav', image_url: IMG.M05, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m05_l2_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• C-Diff = soap and water specifically, every time\n• Bag on shoulder until barrier is placed — never directly on any unprotected surface\n• Clean hands BEFORE entering bag, every time\n• After C-Diff care: locate soap/water source BEFORE touching anything else in the home\n• Cross-contaminating your bag = transferring organisms to every subsequent patient\n• Thermometer covers always used; disinfect between patients',
        narration_script: 'Takeaways. C-Diff requires soap and water specifically, every time. Carry your bag on your shoulder until a barrier is placed — never on any unprotected surface. Clean your hands before entering the bag, every time. After C-Diff care: locate a soap and water source before touching anything else in the home. Cross-contaminating your bag transfers organisms to every patient you see next. Always use thermometer covers and disinfect between patients.',
        audio_path: '/training-audio/ACHC-ART-M05/l2/takeaways.wav', image_url: IMG.M05, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m05_l2_ch', type: 'challenge', title: 'Challenge: C-Diff Hand Hygiene Decision',
        content: 'You\'ve just removed gloves after perineal care on a patient with known C-Diff. Your hands are not visibly soiled. You need to get your stethoscope from your nursing bag.\n\nWhat hand hygiene method is required BEFORE accessing your bag?',
        narration_script: 'Challenge scenario. You have just removed your gloves after providing perineal care to a patient with known C-Diff. Your hands are not visibly soiled. You need to retrieve your stethoscope from your nursing bag. What hand hygiene method is required before accessing the bag?',
        audio_path: '/training-audio/ACHC-ART-M05/l2/challenge.wav', image_url: IMG.M05, estimated_duration: '0:35', completion_required: true,
        options: [
          { id: 'A', label: 'Alcohol-based hand sanitizer — hands aren\'t visibly soiled and it\'s faster', isCorrect: false, rationale: 'C-Diff is specifically the exception to alcohol sanitizer preference. Spores survive alcohol.' },
          { id: 'B', label: 'Soap and water — C-Diff specifically requires this even when hands appear clean', isCorrect: true, rationale: 'Correct — CDC recommends soap and water for C-Diff. Alcohol does not effectively kill C-Diff spores.' },
          { id: 'C', label: 'Just change to new gloves — that\'s sufficient barrier protection', isCorrect: false, rationale: 'Gloves do not replace hand washing. You must decontaminate your hands before accessing clean supplies.' },
          { id: 'D', label: 'Antimicrobial wipes — acceptable alternative', isCorrect: false, rationale: 'Antimicrobial wipes are not as effective as alcohol products, which themselves are insufficient for C-Diff.' },
        ],
      },
      {
        card_id: 'achc_m05_l2_deb', type: 'content', title: 'Operational Debrief: The C-Diff Exception',
        content: 'C-Diff forms spores that alcohol cannot kill. This is the most clinically significant exception to the alcohol preference rule.\n\nWhy the others fail:\n• A: This is the exact wrong answer for C-Diff. Normally alcohol is preferred — but NOT for C-Diff\n• C: Gloves are a barrier, not a replacement for hand decontamination before accessing clean supplies\n• D: Antimicrobial wipes are specifically "not as effective" as even alcohol products — and alcohol products are insufficient for C-Diff\n\nWorkflow insight: After C-Diff care, plan your hand hygiene BEFORE you need supplies. Locate the soap/water source first.\nPatient safety impact: Bag contamination with C-Diff spores = transmission to every subsequent patient.',
        narration_script: 'Debrief. C-Diff forms spores that alcohol cannot kill — this is the most important exception to memorize. Option A is normally correct for routine care but is specifically wrong for C-Diff. Option C fails because gloves are a barrier, not a replacement for hand decontamination. Option D fails because antimicrobial wipes are insufficient for C-Diff. Workflow insight: after C-Diff care, locate the soap and water source before you need to access your supplies. Bag contamination with C-Diff spores spreads to every subsequent patient.',
        audio_path: '/training-audio/ACHC-ART-M05/l2/debrief.wav', image_url: IMG.M05, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m05_l3', topic_id: 'ACHC-ART-M05', title: 'Lesson 3: Sharps, Specimens & Reportable Diseases', order: 3,
    cards: [
      {
        card_id: 'achc_m05_l3_s', type: 'summary', title: 'Never Recap — Never Delay',
        content: 'The two cardinal sharps rules: NEVER recap a needle (it is the #1 cause of needlestick injuries), and NEVER delay reporting an exposure. Post-exposure prophylaxis effectiveness decreases with every hour of delay. Report immediately — not at end of shift.',
        narration_script: 'Two cardinal sharps rules. Never recap a needle — recapping is the number one cause of needlestick injuries. And never delay reporting a needlestick. Post-exposure prophylaxis effectiveness decreases with every hour of delay. Report immediately — not at end of shift.',
        audio_path: '/training-audio/ACHC-ART-M05/l3/summary.wav', image_url: IMG.M05, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m05_l3_c1', type: 'content', title: 'Sharps, Specimens, and Reportable Disease Rules',
        content: 'Sharps:\n• Dispose immediately into puncture-resistant container\n• Return container at 3/4 full — NEVER overfill\n• Never recap, bend, or break needles\n\nSpecimen handling: treat ALL specimens as contaminated; sealable bags, secured transport containers.\n\nBlood spill cleanup: gloves, disinfectant-detergent, physical scrubbing. Blood = 1:10 bleach solution.\n\nReportable diseases:\n• Staff identifies → reports to DON/QI Director → form submitted to local health department\n• Log maintained; physician notified\n• Compliance with current state regulations required',
        narration_script: 'Sharps rules: dispose immediately into puncture-resistant containers, return at three-quarters full, never recap or bend. Specimen handling: treat all specimens as contaminated, use sealable bags and secured transport. Blood spills: use gloves, disinfectant-detergent, physical scrubbing, and a 1-to-10 bleach solution for blood. Reportable diseases: you identify, report to the DON or QI Director, form submitted to the health department, log maintained, physician notified. State regulations apply.',
        audio_path: '/training-audio/ACHC-ART-M05/l3/content1.wav', image_url: IMG.M05, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m05_l3_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• NEVER recap a needle — this is non-negotiable\n• Sharps container at 3/4 = get a new one immediately\n• Post-exposure protocol: WASH → REPORT → MEDICAL EVALUATION → DOCUMENT\n• The time between exposure and medical evaluation is a therapeutic window — delay = reduced effectiveness\n• Reportable diseases are LEGAL obligations — not optional\n• Employees must NOT eat or drink where patient care is delivered',
        narration_script: 'Takeaways. Never recap a needle — this is non-negotiable. Sharps container at three-quarters full means get a new one. Post-exposure protocol: wash, report, seek medical evaluation, then document. The time between exposure and evaluation is a therapeutic window — every hour of delay reduces effectiveness. Reporting communicable diseases is a legal obligation, not optional. Employees must not eat or drink anywhere patient care is delivered.',
        audio_path: '/training-audio/ACHC-ART-M05/l3/takeaways.wav', image_url: IMG.M05, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m05_l3_ch', type: 'challenge', title: 'Challenge: Needlestick During IV Removal',
        content: 'While removing an IV catheter, the needle slips and punctures your glove and finger. You see blood. The patient\'s HIV and Hepatitis status is unknown.\n\nWhat are your IMMEDIATE actions in the correct order?',
        narration_script: 'Challenge scenario. While removing an IV catheter, the needle slips and punctures your glove and finger. You see blood. The patient\'s HIV and Hepatitis status is unknown. What are your immediate actions in the correct order?',
        audio_path: '/training-audio/ACHC-ART-M05/l3/challenge.wav', image_url: IMG.M05, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Finish the procedure, bandage your finger, note it in your planner to report tomorrow', isCorrect: false, rationale: 'Delayed reporting reduces prophylaxis effectiveness. Hepatitis B PEP must begin within hours, not days.' },
          { id: 'B', label: 'Stop safely, wash injury with soap and water immediately, report to supervisor, seek medical evaluation, document', isCorrect: true, rationale: 'Correct — follows the OSHA Exposure Control Plan sequence exactly. Time is critical.' },
          { id: 'C', label: 'Squeeze the wound to push out contaminated blood, apply alcohol, and continue the visit', isCorrect: false, rationale: 'Squeezing is NOT recommended and may increase tissue penetration. Continuing without reporting violates the Exposure Control Plan.' },
          { id: 'D', label: 'Ask the patient about their bloodborne disease status and decide whether to report based on their answer', isCorrect: false, rationale: 'Patient status does not determine whether to report. Universal precautions assume ALL exposures are potentially infectious.' },
        ],
      },
      {
        card_id: 'achc_m05_l3_deb', type: 'content', title: 'Operational Debrief: Post-Exposure Protocol',
        content: 'Immediate action is critical. Every minute matters for prophylaxis effectiveness.\n\nWhy the others fail:\n• A: Delayed reporting reduces prophylaxis effectiveness. For HBV, PEP window is hours — not days\n• C: Squeezing the wound may increase depth of contamination. Alcohol alone is insufficient decontamination for a wound\n• D: Patient status is irrelevant to the reporting requirement. ALL exposures are treated as potentially infectious per Standard Precautions\n\nDocumentation must include: date, time, circumstances, actions taken, source patient information.\nLegal protection: HBV vaccination must be offered within 10 working days of initial assignment.',
        narration_script: 'Debrief. Every minute matters for prophylaxis effectiveness. Option A is dangerous because the HBV PEP window is measured in hours, not days. Option C is wrong — squeezing may increase contamination depth, and alcohol alone is insufficient for wound decontamination. Option D is irrelevant to the reporting requirement — all exposures are potentially infectious. Documentation must include date, time, circumstances, actions taken, and source patient information. HBV vaccination must be offered within 10 working days of initial assignment.',
        audio_path: '/training-audio/ACHC-ART-M05/l3/debrief.wav', image_url: IMG.M05, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m05_l4', topic_id: 'ACHC-ART-M05', title: 'Module Wrap-Up & Completion', order: 4,
    cards: [
      {
        card_id: 'achc_m05_l4_syn', type: 'summary', title: 'Summary & Synthesis',
        content: '6 things you must take from this module:\n\n1. Standard Precautions = based on EXPOSURE, not diagnosis. Apply to ALL patients, ALL encounters\n2. Alcohol-based sanitizer is PREFERRED for routine use — EXCEPT C-Diff (soap + water required)\n3. Bag technique: never on floor, barrier always, clean hands before entering, monthly deep clean\n4. NEVER recap needles. Sharps container at 3/4 full = get a new one\n5. Needlestick exposure: wash → report immediately → medical evaluation → document\n6. Reportable diseases are legal obligations — report through DON to health department\n\nOperational bridge: Your field preceptor will observe hand hygiene technique, PPE selection, bag technique, and sharps handling.',
        narration_script: 'Six takeaways. One: Standard Precautions are based on exposure, not diagnosis — all patients, all encounters. Two: alcohol sanitizer is preferred except for C-Diff, which requires soap and water. Three: bag technique — never on floor, barrier always, clean hands before accessing, monthly deep clean. Four: never recap needles, and replace the sharps container at three-quarters full. Five: needlestick protocol is wash, report, medical evaluation, document. Six: reportable diseases are legal obligations. Your preceptor will observe your hand hygiene, PPE selection, bag technique, and sharps handling.',
        audio_path: '/training-audio/ACHC-ART-M05/l4/synthesis.wav', image_url: IMG.M05, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m05_l4_fdeb', type: 'content', title: 'Mandatory Final Debrief',
        content: 'A correct answer does NOT guarantee correct reasoning. Reflect:\n\n1. Standard Precautions are NON-NEGOTIABLE and diagnosis-INDEPENDENT — no exceptions\n2. The home environment creates unique infection risks — your bag technique is your primary cross-patient defense\n3. C-Diff is the critical exception to alcohol sanitizer — memorize this distinction\n4. Needlestick response is TIME-SENSITIVE — delayed reporting reduces prophylaxis effectiveness\n5. Cross-contamination between patients via your supplies/hands is YOUR personal responsibility\n\nConfidence check: How confident are you in executing proper infection control in challenging home environments?',
        narration_script: 'A correct answer does not guarantee correct reasoning. Five principles. One: Standard Precautions are non-negotiable and diagnosis-independent. Two: the home environment creates unique risks — bag technique is your primary cross-patient defense. Three: C-Diff is the critical exception to alcohol sanitizer. Four: needlestick response is time-sensitive. Five: cross-contamination between patients via your supplies and hands is your personal responsibility. How confident are you in executing proper infection control in challenging home environments?',
        audio_path: '/training-audio/ACHC-ART-M05/l4/finaldebrief.wav', image_url: IMG.M05, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m05_l4_nxt', type: 'content', title: 'Operational Next Steps',
        content: 'Your field preceptor will evaluate:\n• Hand hygiene technique and timing (observed during actual patient care)\n• Correct PPE selection for the planned procedure\n• Bag technique execution (barrier, placement, hand hygiene before entry)\n• Sharps handling and container status\n• Equipment cleaning between patients\n• Knowledge of post-exposure response protocol\n\nResources:\n• CL-SD-016 (Infection Prevention & Control)\n• Hand Hygiene Quick Reference Card\n• Exposure Control Plan\n• Reportable Diseases list (state-specific)\n• Bag Technique checklist',
        narration_script: 'Operational next steps. Your preceptor will observe: hand hygiene technique and timing, correct PPE selection for each procedure, bag technique execution, sharps handling and container status, equipment cleaning between patients, and your knowledge of the post-exposure protocol. Resources: CL-SD-016 (Infection Prevention & Control), Hand Hygiene Quick Reference, Exposure Control Plan, state Reportable Diseases list, and Bag Technique checklist.',
        audio_path: '/training-audio/ACHC-ART-M05/l4/nextsteps.wav', image_url: IMG.M05, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m05_l4_surv', type: 'content', title: 'Module Evaluation',
        content: 'Please evaluate this module:\n\n1. The content was relevant to my daily infection control challenges. (1–5)\n2. The distinction between sanitizer and soap/water situations was clear. (1–5)\n3. The scenarios reflected realistic field conditions. (1–5)\n4. I feel more confident in my infection control practices. (1–5)\n5. What infection control topic would you like more depth on? (Share with your supervisor)\n\nCompletion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer triggered.',
        narration_script: 'Thank you for completing this module. Please evaluate: the relevance to your infection control challenges, the clarity of when to use sanitizer versus soap and water, the realism of the scenarios, and your confidence level. Also share what infection control topic you want more depth on. Completion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer are now triggered.',
        audio_path: '/training-audio/ACHC-ART-M05/l4/survey.wav', image_url: IMG.M05, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  /* ══════════════════════ M06 Communication Barriers ══════════════════════ */

  {
    lesson_id: 'achc_m06_l0', topic_id: 'ACHC-ART-M06', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m06_l0_hook', type: 'challenge', title: 'Pre-Assessment: Test Yourself First',
        content: 'You arrive for medication education after a new heart failure diagnosis. The patient is an 82-year-old Korean-speaking woman. Her 14-year-old granddaughter is present and offers to interpret. The patient nods and smiles at everything. You have 10 medications to review including a new diuretic with complex timing.\n\nWhat is the MOST significant communication barrier?',
        narration_script: 'Pre-assessment. You arrive for medication education for a new heart failure patient — an 82-year-old Korean-speaking woman. Her 14-year-old granddaughter offers to interpret. The patient nods and smiles at everything. You have ten medications to review. What is the most significant communication barrier?',
        audio_path: '/training-audio/ACHC-ART-M06/l0/hook.wav', image_url: IMG.M06, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'Language barrier only — just get a better interpreter', isCorrect: false, rationale: 'Language is one barrier, but multiple compounding barriers are present that this option misses entirely.' },
          { id: 'B', label: 'Multiple compounding barriers: language, generational, medical literacy (granddaughter lacks clinical vocab), and interpersonal (nodding may be cultural politeness, not comprehension)', isCorrect: true, rationale: 'Correct — barriers rarely exist in isolation. Multiple simultaneous barriers exponentially increase communication failure risk.' },
          { id: 'C', label: 'The patient\'s age — elderly patients can\'t learn new information', isCorrect: false, rationale: 'Age alone does not determine learning capacity. This is a harmful generalization.' },
          { id: 'D', label: 'The number of medications — simplify to 3 and skip the rest', isCorrect: false, rationale: 'All medications must be educated. Simplifying for convenience is a clinical and documentation failure.' },
        ],
      },
      {
        card_id: 'achc_m06_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Identify the 7 categories of communication barriers (physical, language, gender, interpersonal, perceptual, cultural, emotional).\n2. Distinguish between verbal, written, and non-verbal communication and their limitations.\n3. Apply specific techniques for communicating with deaf/hard-of-hearing patients.\n4. Demonstrate strategies to overcome language barriers using qualified interpretation services.\n5. Recognize when a patient\'s apparent agreement may mask comprehension failure.\n6. Document communication barriers and adaptations in the clinical record.',
        narration_script: 'Learning objectives. One: identify the seven categories of communication barriers. Two: distinguish between verbal, written, and non-verbal communication and their limitations. Three: apply techniques for communicating with deaf or hard-of-hearing patients. Four: overcome language barriers using qualified interpretation. Five: recognize when apparent agreement masks comprehension failure. Six: document communication barriers and your adaptations in the clinical record.',
        audio_path: '/training-audio/ACHC-ART-M06/l0/objectives.wav', image_url: IMG.M06, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m06_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Communication Barrier — Any disturbance blocking message encoding, transmission, or decoding. Root cause of most adverse events in home health.\n\nTeach-Back Method — Asking the patient to explain instructions in their own words. Only reliable way to confirm understanding. "Do you understand?" is NOT teach-back.\n\nQualified Interpreter — Trained professional used for clinical communication. Children and untrained family are NOT qualified.\n\nNon-Verbal Communication — Body language, facial expressions, gestures. May contradict verbal messages — a nod doesn\'t always mean "yes."\n\nHealth Literacy — Patient\'s ability to understand health information. Does NOT equal intelligence.\n\nActive Listening — Fully concentrating on what is said. Patients who feel unheard become non-adherent.\n\nWritten Communication — Must be at 6th grade reading level or below; in patient\'s primary language.',
        narration_script: 'Seven key terms. Communication Barrier: any disturbance that blocks message understanding — the root cause of most adverse events. Teach-Back Method: asking patients to explain instructions back — the only reliable way to confirm comprehension. "Do you understand?" is not teach-back. Qualified Interpreter: trained professional for clinical communication — children and untrained family are not qualified. Non-Verbal Communication: body language and facial expressions — a nod doesn\'t always mean yes. Health Literacy: ability to understand health information — does not equal intelligence. Active Listening: fully concentrating on what is said. Written Communication: must be at sixth-grade reading level or below, in the patient\'s primary language.',
        audio_path: '/training-audio/ACHC-ART-M06/l0/concepts.wav', image_url: IMG.M06, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m06_l1', topic_id: 'ACHC-ART-M06', title: 'Lesson 1: The 7 Communication Barriers', order: 1,
    cards: [
      {
        card_id: 'achc_m06_l1_s', type: 'summary', title: 'Barriers Compound — Address All of Them',
        content: 'Communication barriers rarely exist alone. In home health, a patient typically has at least two active barriers per visit. Addressing only the most obvious one (language) while missing the others (emotional, perceptual, cultural) still results in communication failure.',
        narration_script: 'Communication barriers rarely exist in isolation. In home health, the average patient has at least two active barriers per visit. Addressing only the most obvious barrier — like language — while missing emotional, perceptual, or cultural barriers still results in communication failure.',
        audio_path: '/training-audio/ACHC-ART-M06/l1/summary.wav', image_url: IMG.M06, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m06_l1_c1', type: 'content', title: 'The 7 Barrier Categories',
        content: '1. Language — different primary language, limited English, medical jargon\n2. Physical — hearing loss, vision impairment, speech difficulties, masks muffling\n3. Gender — communication style differences, care taboos related to gender roles\n4. Cultural — different beliefs about illness, authority, appropriate disclosure\n5. Emotional — fear, grief, denial, anxiety blocking reception of information\n6. Perceptual — patient and clinician interpret the same event differently\n7. Interpersonal — distrust, past negative healthcare experiences, power dynamics\n\nKey principle: a message is only successful when the receiver interprets it with the SAME meaning as intended.',
        narration_script: 'The seven categories. One: language — different primary language, limited English, medical jargon. Two: physical — hearing loss, vision impairment, speech difficulties. Three: gender — communication style differences and care taboos. Four: cultural — different beliefs about illness, authority, and disclosure. Five: emotional — fear, grief, denial, anxiety blocking reception. Six: perceptual — different interpretations of the same event. Seven: interpersonal — distrust, past negative healthcare experiences, power dynamics. Key principle: a message is only successful when the receiver interprets it with the same meaning as intended.',
        audio_path: '/training-audio/ACHC-ART-M06/l1/content1.wav', image_url: IMG.M06, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m06_l1_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Multiple barriers compound exponentially — address them systematically, not just the obvious one\n• Your perception of what was communicated ≠ what the patient received\n• Awareness of your own communication style is the first step to adaptation\n• "I got it" combined with avoidance behaviors = multiple barriers operating simultaneously\n• ALWAYS verify comprehension — never assume understanding based on verbal agreement\n• Document what barriers were identified AND what adaptations you made',
        narration_script: 'Takeaways. Multiple barriers compound — address them systematically, not just the obvious one. Your perception of what was communicated does not equal what the patient received. Awareness of your own communication style is the first adaptation step. "I got it" combined with avoidance behaviors means multiple barriers are operating. Always verify comprehension — never assume based on verbal agreement. Document both the barriers identified and the adaptations made.',
        audio_path: '/training-audio/ACHC-ART-M06/l1/takeaways.wav', image_url: IMG.M06, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m06_l1_ch', type: 'challenge', title: 'Challenge: Insulin Education Avoidance',
        content: 'You are teaching insulin injection technique to a newly diagnosed diabetic patient — a 55-year-old construction worker. He hasn\'t made eye contact during your explanation, keeps glancing at the clock, and gives one-word responses. When you ask if he has questions, he says: "Nope, I got it."\n\nWhich barriers are MOST likely at play?',
        narration_script: 'Challenge scenario. You are teaching insulin injection technique to a newly diagnosed 55-year-old construction worker. He hasn\'t made eye contact, keeps glancing at the clock, gives one-word responses, and says "Nope, I got it" when asked if he has questions. Which barriers are most likely at play?',
        audio_path: '/training-audio/ACHC-ART-M06/l1/challenge.wav', image_url: IMG.M06, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Emotional barrier — denial/fear about a new diagnosis', isCorrect: true, rationale: 'Correct — new diabetes diagnosis carries real fear and denial. Avoidance behaviors support this.' },
          { id: 'B', label: 'Gender barrier — male communication style (avoiding showing vulnerability)', isCorrect: true, rationale: 'Correct — male communication patterns often involve minimizing vulnerability and avoiding questions.' },
          { id: 'C', label: 'No barrier — he said he understands', isCorrect: false, rationale: '"I got it" from a patient showing multiple avoidance behaviors is almost certainly masking incomplete understanding.' },
          { id: 'D', label: 'Perceptual barrier — may view the nurse as an authority figure he shouldn\'t question', isCorrect: true, rationale: 'Correct — deference to medical authority without engaging is a perceptual barrier common in this context.' },
        ],
      },
      {
        card_id: 'achc_m06_l1_deb', type: 'content', title: 'Operational Debrief: Multiple Active Barriers',
        content: 'A, B, and D are all correct. Multiple barriers operate simultaneously in this scenario.\n\nWhy C is dangerous:\nAccepting "I got it" at face value = documentation that education was provided without verification. If the patient misuses insulin → hypoglycemia → emergency → hospitalization → YOU documented "patient verbalized understanding."\n\nCorrect response:\n• Do NOT accept verbal confirmation\n• Use teach-back: "Show me how you would prepare and inject your insulin"\n• If he can\'t demonstrate correctly: simplify, use visuals, re-explain without blame\n• Document the teach-back result, not just "patient verbalized understanding"',
        narration_script: 'Debrief. Options A, B, and D are all correct — multiple barriers operate simultaneously. Option C is dangerous because accepting "I got it" at face value means documenting education was provided without verifying comprehension. If the patient misuses insulin and ends up hospitalized, your documentation says he verbalized understanding. The correct response: do not accept verbal confirmation. Use teach-back — show me how you would prepare the injection. If he can\'t demonstrate correctly, simplify and re-explain without blame. Document the teach-back outcome.',
        audio_path: '/training-audio/ACHC-ART-M06/l1/debrief.wav', image_url: IMG.M06, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m06_l2', topic_id: 'ACHC-ART-M06', title: 'Lesson 2: Non-Verbal Communication & Documentation', order: 2,
    cards: [
      {
        card_id: 'achc_m06_l2_s', type: 'summary', title: 'When Verbal and Non-Verbal Conflict — Trust the Non-Verbal',
        content: 'Patients often underreport pain, distress, or confusion due to cultural stoicism, fear of medication addiction, desire to appear strong, or fear of hospitalization. Non-verbal cues are often more honest than verbal responses. When the two conflict, investigate — do not dismiss.',
        narration_script: 'Patients often underreport pain, distress, or confusion for cultural, emotional, or practical reasons. Non-verbal cues are frequently more honest than verbal responses. When verbal and non-verbal signals conflict, your job is to investigate — not dismiss the non-verbal.',
        audio_path: '/training-audio/ACHC-ART-M06/l2/summary.wav', image_url: IMG.M06, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m06_l2_c1', type: 'content', title: 'Non-Verbal Communication and Health Literacy',
        content: 'Non-verbal channels: facial expressions, body language, gestures, tone, proximity, eye contact.\n\nCultural variations in non-verbal meaning:\n• Eye contact: sign of respect in some cultures, disrespectful in others\n• Nodding: may mean "I hear you," not "I agree"\n• Touch: acceptable in some contexts, taboo in others\n• Personal space: varies by culture\n\nHealth literacy:\n• Written materials should be at or below 6th grade reading level\n• Provide materials in patient\'s primary language when available\n• Low health literacy ≠ low intelligence\n• Patients rarely tell you they don\'t understand the materials',
        narration_script: 'Non-verbal channels include facial expressions, body language, gestures, tone, and proximity. Cultural variations: eye contact may be respectful in some cultures and disrespectful in others. Nodding may mean "I hear you" rather than "I agree." Touch and personal space expectations vary by culture. Health literacy: written materials should be at or below sixth-grade reading level, provided in the patient\'s primary language. Low health literacy does not equal low intelligence. Patients rarely tell you they don\'t understand the materials.',
        audio_path: '/training-audio/ACHC-ART-M06/l2/content1.wav', image_url: IMG.M06, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m06_l2_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Written materials must be appropriate in content, vocabulary, AND language for the specific patient\n• Non-verbal cues are often MORE honest than verbal responses — attend to both\n• When verbal and non-verbal conflict → investigate the discrepancy, don\'t dismiss either\n• Document both the subjective report AND your objective observations when they conflict\n• A quiet, agreeable patient may be your HIGHEST communication risk — compliance masks confusion\n• Schedule pressure is NEVER justification for communication shortcuts',
        narration_script: 'Takeaways. Written materials must be appropriate in content, vocabulary, and language for the specific patient. Non-verbal cues are often more honest than verbal responses. When they conflict, investigate — document both. A quiet, agreeable patient may be your highest communication risk because compliance masks confusion. And schedule pressure is never justification for communication shortcuts — adverse events take far more time to address.',
        audio_path: '/training-audio/ACHC-ART-M06/l2/takeaways.wav', image_url: IMG.M06, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m06_l2_ch', type: 'challenge', title: 'Challenge: Documenting a Non-Verbal/Verbal Conflict',
        content: 'During wound assessment, the patient rates their pain as "about a 3/10." However, they are gripping the armrest tightly, sweating at the temples, holding their breath during your exam. Vital signs: BP 168/94, HR 96.\n\nHow should you document this encounter?',
        narration_script: 'Challenge scenario. During wound assessment, the patient rates pain at 3 out of 10. However, they are gripping the armrest tightly, sweating at the temples, and holding their breath during your exam. Vital signs show BP 168 over 94 and heart rate 96. How should you document this encounter?',
        audio_path: '/training-audio/ACHC-ART-M06/l2/challenge.wav', image_url: IMG.M06, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: '"Patient reports pain 3/10" — they\'re the expert on their own pain', isCorrect: false, rationale: 'Ignoring objective findings that contradict the verbal report is negligent. Vital signs are objective evidence.' },
          { id: 'B', label: '"Patient reports pain 3/10. Objective findings inconsistent with reported pain: diaphoresis, grip tension, guarding, VS elevated BP 168/94, HR 96. Further pain assessment warranted."', isCorrect: true, rationale: 'Correct — document both data points objectively without judgment. The discrepancy itself is clinically significant.' },
          { id: 'C', label: '"Patient is lying about their pain level — actually appears to be an 8"', isCorrect: false, rationale: '"Lying" is a judgment. "Inconsistent" is an observation. Clinical documentation must be objective.' },
          { id: 'D', label: '"Pain assessment deferred due to unreliable patient reporting"', isCorrect: false, rationale: 'You have a pain assessment to complete. Discrepancy requires more assessment, not deferral.' },
        ],
      },
      {
        card_id: 'achc_m06_l2_deb', type: 'content', title: 'Operational Debrief: Objective Documentation',
        content: 'Professional documentation captures both data points without judgment. The discrepancy itself is clinically significant and must trigger further assessment.\n\nWhy the others fail:\n• A: Ignoring objective vital signs evidence when they contradict the verbal report is negligent\n• C: "Lying" is a conclusion, not an observation. Charting "lying" is both inappropriate and potentially actionable\n• D: A subjective-objective discrepancy demands MORE assessment, not less\n\nCommunication insight: Patients underreport pain for many reasons — cultural stoicism, fear of addiction, desire to be "strong." Non-verbal signals reveal what words conceal.\n\nSurvey implication: ACHC reviews documentation quality. Objective-subjective discrepancies should be addressed, not ignored.',
        narration_script: 'Debrief. Professional documentation captures both data points without judgment. The discrepancy itself is clinically significant. Option A is negligent — vital signs are objective evidence that cannot be ignored. Option C uses judgment language that is inappropriate and potentially actionable. Option D abandons the assessment responsibility. Communication insight: patients underreport pain for many reasons — cultural stoicism, fear of addiction, desire to appear strong. Non-verbal signals reveal what words conceal. ACHC reviews documentation quality, and discrepancies that are not addressed are deficiencies.',
        audio_path: '/training-audio/ACHC-ART-M06/l2/debrief.wav', image_url: IMG.M06, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m06_l3', topic_id: 'ACHC-ART-M06', title: 'Lesson 3: Interpreter Services & Hearing Impairment', order: 3,
    cards: [
      {
        card_id: 'achc_m06_l3_s', type: 'summary', title: 'Children Are Never Appropriate Clinical Interpreters',
        content: 'Children — regardless of bilingual ability — lack medical vocabulary, cannot reliably translate clinical content, and may omit or modify information they find distressing. Using a child as a clinical interpreter is a patient safety risk, a potential HIPAA violation, and an inappropriate burden on the child.',
        narration_script: 'Children — regardless of how well they speak two languages — are never appropriate clinical interpreters. They lack medical vocabulary, may omit or modify content they find distressing, and cannot be held to the same standard as a qualified interpreter. Using a child is a patient safety risk and an inappropriate burden.',
        audio_path: '/training-audio/ACHC-ART-M06/l3/summary.wav', image_url: IMG.M06, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m06_l3_c1', type: 'content', title: 'Interpreter Services and Deaf Patient Communication',
        content: 'Language interpreter requirements:\n• Qualified interpreters for ALL clinical education, informed consent, medication instructions\n• Telephone interpretation available and must be used when needed\n• Document: who interpreted, method, and patient teach-back confirmation through interpreter\n• Children may assist with GENERAL conversation/greetings only — NOT clinical content\n\nCommunicating with deaf/hard-of-hearing patients:\n• Get their attention BEFORE speaking (gentle tap, visual signal)\n• Face them directly; do NOT cover your mouth\n• Speak clearly at NORMAL pace — exaggerated lip movements are HARDER to lip-read\n• Ensure adequate lighting for lip reading\n• Use visual aids, written notes, demonstrations\n• Not all deaf patients lip-read; some use ASL — ask',
        narration_script: 'Interpreter requirements: qualified interpreters for all clinical education, informed consent, and medication instructions. Telephone interpretation must be available and used. Document who interpreted, the method, and the patient\'s teach-back through the interpreter. Children may assist with general greetings only — never clinical content. For deaf or hard-of-hearing patients: get their attention before speaking. Face them directly. Speak at normal pace — exaggerated lip movements are harder to lip-read, not easier. Ensure adequate lighting. Use visual aids and written notes. Not all deaf patients lip-read — always ask.',
        audio_path: '/training-audio/ACHC-ART-M06/l3/content1.wav', image_url: IMG.M06, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m06_l3_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Schedule pressure NEVER justifies using an unqualified interpreter for clinical content\n• Speak at normal pace with deaf patients — exaggerated speech is harder to lip-read\n• Reduce background noise; ensure adequate lighting for lip reading\n• Written notes are effective for brief exchanges; not for complex clinical education\n• Always verify comprehension through qualified interpreter — teach-back applies here too\n• Document interpreter identity, method, and confirmation of understanding',
        narration_script: 'Takeaways. Schedule pressure never justifies using an unqualified interpreter for clinical content. Speak at normal pace with deaf patients — exaggerated speech is harder to lip-read. Reduce background noise and ensure adequate lighting. Written notes work for brief exchanges but not complex clinical education. Always verify comprehension through a qualified interpreter using teach-back. Document interpreter identity, the interpretation method, and the patient\'s demonstrated understanding.',
        audio_path: '/training-audio/ACHC-ART-M06/l3/takeaways.wav', image_url: IMG.M06, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m06_l3_ch', type: 'challenge', title: 'Challenge: Discharge Instructions, Tight Schedule',
        content: 'You need to explain discharge instructions — medication changes, wound care schedule, and ER warning signs — to a Spanish-speaking patient. The patient\'s bilingual 12-year-old son is present and eager to help. Your agency has telephone interpretation but it takes 15 minutes to arrange. Your visit window is tight.\n\nWhat is the CORRECT decision?',
        narration_script: 'Challenge scenario. You need to explain complex discharge instructions to a Spanish-speaking patient — medication changes, wound care schedule, and ER warning signs. The patient\'s bilingual 12-year-old son is eager to help. Telephone interpretation is available but takes 15 minutes to arrange. Your visit window is tight. What is the correct decision?',
        audio_path: '/training-audio/ACHC-ART-M06/l3/challenge.wav', image_url: IMG.M06, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'Use the son — he\'s bilingual and willing, and your schedule is tight', isCorrect: false, rationale: 'A 12-year-old lacks medical vocabulary and the maturity to interpret medication changes and ER warning signs. If an error occurs, liability falls on you.' },
          { id: 'B', label: 'Use the son for basic information and save complex medication discussion for when an interpreter is available', isCorrect: false, rationale: 'There is no "non-complex" portion of discharge instructions. Even scheduling involves clinically consequential medication timing.' },
          { id: 'C', label: 'Use telephone interpretation regardless of time required — discharge instructions are complex clinical content requiring qualified interpretation', isCorrect: true, rationale: 'Correct — patient safety trumps schedule convenience. Complex discharge instructions require qualified interpretation.' },
          { id: 'D', label: 'Write everything down in English and give it to the patient to figure out later', isCorrect: false, rationale: 'English-only materials for a Spanish-speaking patient = no education was provided. Legally indefensible.' },
        ],
      },
      {
        card_id: 'achc_m06_l3_deb', type: 'content', title: 'Operational Debrief: Qualified Interpretation Required',
        content: 'Complex clinical education requires qualified interpretation. Patient safety always supersedes schedule pressure.\n\nWhy the others fail:\n• A: Liability falls on YOU when a child interpreter leads to a medication error. If the patient misunderstands a ER warning sign and doesn\'t call 911 → adverse outcome → your documentation shows you used a 12-year-old as interpreter\n• B: Discharge instructions have no "non-complex" section. Medication timing is clinically consequential\n• D: English-only materials = no education provided. This is legally indefensible\n\nDocumentation standard: document WHO interpreted, HOW it was arranged, and CONFIRMATION of patient understanding through the interpreter via teach-back.',
        narration_script: 'Debrief. Complex clinical education requires qualified interpretation. Patient safety always supersedes schedule pressure. Option A shifts liability to you — if a medication error occurs because the child misinterpreted, your documentation shows you chose a 12-year-old interpreter. Option B is wrong because there is no non-complex section of discharge instructions. Option D is legally indefensible. Documentation standard: document who interpreted, how it was arranged, and the patient\'s demonstrated understanding through the interpreter via teach-back.',
        audio_path: '/training-audio/ACHC-ART-M06/l3/debrief.wav', image_url: IMG.M06, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m06_l4', topic_id: 'ACHC-ART-M06', title: 'Module Wrap-Up & Completion', order: 4,
    cards: [
      {
        card_id: 'achc_m06_l4_syn', type: 'summary', title: 'Summary & Synthesis',
        content: '6 things you must take from this module:\n\n1. Communication barriers compound — address ALL of them, not just the obvious one\n2. "Patient verbalized understanding" is NOT verification. Use teach-back\n3. Non-verbal cues often tell the truth when words don\'t — document discrepancies objectively\n4. Children are NEVER appropriate interpreters for clinical content\n5. Deaf patients: face them, adequate lighting, normal pace, visual aids, verify comprehension\n6. Your schedule pressure is NEVER justification for compromising communication quality\n\nOperational bridge: Your preceptor will evaluate teach-back use, non-verbal attention, appropriate interpreter use, and documentation of communication adaptations.',
        narration_script: 'Six takeaways. One: communication barriers compound — address all of them. Two: "patient verbalized understanding" is not verification — use teach-back. Three: non-verbal cues often tell the truth — document discrepancies objectively. Four: children are never appropriate clinical interpreters. Five: with deaf patients — face them, ensure adequate lighting, speak at normal pace, verify comprehension. Six: schedule pressure never justifies communication shortcuts. Your preceptor will evaluate your teach-back use, non-verbal attention, interpreter decisions, and communication documentation.',
        audio_path: '/training-audio/ACHC-ART-M06/l4/synthesis.wav', image_url: IMG.M06, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m06_l4_fdeb', type: 'content', title: 'Mandatory Final Debrief',
        content: 'A correct answer does NOT guarantee correct reasoning. Reflect:\n\n1. "Patient verbalized understanding" in your documentation does NOT protect you if the patient demonstrates otherwise\n2. Time pressure is never an excuse for communication shortcuts — adverse events take much more time\n3. A quiet, agreeable patient may be your HIGHEST communication risk\n4. YOUR communication style is the variable you control — adapt to the patient, not the reverse\n5. Document WHAT you did to overcome barriers, not just that barriers existed\n\nConfidence check: How confident are you in identifying and overcoming communication barriers in the field?',
        narration_script: 'A correct answer does not guarantee correct reasoning. Five principles. One: "patient verbalized understanding" does not protect you if the patient demonstrates otherwise. Two: time pressure never justifies shortcuts. Three: a quiet, agreeable patient may be your highest communication risk. Four: YOUR communication style is the variable you control — adapt to the patient. Five: document what you did to overcome barriers, not just that they existed. How confident are you in identifying and overcoming communication barriers in the field?',
        audio_path: '/training-audio/ACHC-ART-M06/l4/finaldebrief.wav', image_url: IMG.M06, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m06_l4_nxt', type: 'content', title: 'Operational Next Steps',
        content: 'Your field preceptor will evaluate:\n• Use of teach-back method during patient education\n• Attention to and documentation of non-verbal cues\n• Appropriate interpreter utilization decisions\n• Communication adaptation for hearing impairment, language, or literacy barriers\n• Documentation of communication strategies employed\n\nResources:\n• Agency Interpreter Services contact and access instructions\n• Patient Education Materials library (multi-language)\n• Teach-Back Method quick reference card\n• Communication with Deaf/Hard-of-Hearing patients guide\n• Health Literacy assessment tools',
        narration_script: 'Operational next steps. Your preceptor will evaluate: teach-back use during education, attention to and documentation of non-verbal cues, interpreter decisions, communication adaptations for various barriers, and documentation of strategies. Resources: Agency Interpreter Services instructions, multi-language patient education library, teach-back quick reference, communication guide for deaf patients, and health literacy assessment tools.',
        audio_path: '/training-audio/ACHC-ART-M06/l4/nextsteps.wav', image_url: IMG.M06, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m06_l4_surv', type: 'content', title: 'Module Evaluation',
        content: 'Please evaluate this module:\n\n1. The content was relevant to communication challenges I face. (1–5)\n2. The teach-back method was clearly explained and demonstrated. (1–5)\n3. The scenarios reflected realistic multi-barrier situations. (1–5)\n4. I feel more prepared to adapt my communication to diverse patients. (1–5)\n5. What communication situation would you like more training on? (Share with your supervisor)\n\nCompletion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer triggered.',
        narration_script: 'Thank you for completing this module. Please evaluate: the relevance to your communication challenges, the clarity of the teach-back method, the realism of the multi-barrier scenarios, and your preparedness to adapt your communication. Also share what situation you\'d like more training on. Completion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer are now triggered.',
        audio_path: '/training-audio/ACHC-ART-M06/l4/survey.wav', image_url: IMG.M06, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  /* ══════════════════════ M07 Workplace/Patient Safety (OSHA) ══════════════════════ */

  {
    lesson_id: 'achc_m07_l0', topic_id: 'ACHC-ART-M07', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m07_l0_hook', type: 'challenge', title: 'Pre-Assessment: Test Yourself First',
        content: 'You arrive at a patient\'s home and notice a strong chemical smell. The caregiver explains: "I mixed bleach and ammonia to clean the bathroom — wanted it to be nice for you." You feel slight burning in your eyes and throat. The patient is in the next room waiting for wound care.\n\nWhat is your IMMEDIATE action?',
        narration_script: 'Pre-assessment. You arrive and notice a strong chemical smell. The caregiver says she mixed bleach and ammonia to clean the bathroom. You feel slight burning in your eyes and throat. The patient is waiting for wound care in the next room. What is your immediate action?',
        audio_path: '/training-audio/ACHC-ART-M07/l0/hook.wav', image_url: IMG.M07, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'Open windows, wait a few minutes for it to dissipate, then proceed', isCorrect: false, rationale: 'Bleach + ammonia = chloramine gas (toxic). Waiting does not make it safe. Patient and clinician must evacuate the area.' },
          { id: 'B', label: 'Evacuate yourself and the patient from the area immediately; do NOT provide care in a hazardous environment; report per Agency safety protocol', isCorrect: true, rationale: 'Correct — a hazardous environment must be made safe BEFORE care can occur. Bleach + ammonia = chloramine gas.' },
          { id: 'C', label: 'Put on your mask and gloves and proceed — you have PPE', isCorrect: false, rationale: 'A surgical mask does not filter toxic gases. PPE does not make a chloramine gas exposure safe.' },
          { id: 'D', label: 'Proceed in the next room since the chemicals are in the bathroom', isCorrect: false, rationale: 'Airborne toxic gases are not confined to the room of origin. The hazard affects the entire home.' },
        ],
      },
      {
        card_id: 'achc_m07_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Describe workers\' rights under the OSH Act including the right to a safe workplace.\n2. Identify the Agency\'s safety program elements and personal safety responsibilities.\n3. Interpret Safety Data Sheets (SDS) using the standardized 16-section format.\n4. Recognize OSHA Hazard Communication Standard pictograms and signal words.\n5. Describe incident reporting requirements including FDA medical device reporting timelines.\n6. Explain the Safety Committee\'s function and how to submit safety concerns.',
        narration_script: 'Learning objectives. One: describe workers\' rights under the OSH Act. Two: identify the Agency\'s safety program elements and your responsibilities. Three: interpret Safety Data Sheets using the 16-section format. Four: recognize OSHA pictograms and signal words. Five: describe incident reporting requirements including FDA medical device timelines. Six: explain the Safety Committee and how to submit concerns.',
        audio_path: '/training-audio/ACHC-ART-M07/l0/objectives.wav', image_url: IMG.M07, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m07_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'OSH Act (1970) — Federal law requiring workplaces free of known dangers. Your right to refuse dangerous work.\n\nSafety Data Sheet (SDS) — Standardized 16-section chemical hazard document. Section 8 = PPE and exposure controls.\n\nSignal Word — "Danger" (severe hazard) or "Warning" (less severe). Only two signal words exist.\n\nPictogram — Red-bordered diamond shape with black hazard symbol on white background. 8 OSHA pictograms.\n\nOSHA 300 Log — Log of Work-Related Injuries and Illnesses. Annual posting required.\n\nSafety Committee — Monitors compliance; any employee can submit concerns. Reports to Professional Advisory Committee and Governing Body.\n\nIncident Report — Documentation of any accident, injury, or hazard. Equipment + serious injury/death → FDA within 10 days.',
        narration_script: 'Seven key terms. OSH Act: federal law requiring workplaces free of known dangers — your right to refuse immediately dangerous work. Safety Data Sheet: 16-section chemical hazard document. Section 8 always contains PPE and exposure control information. Signal Words: Danger means severe hazard, Warning means less severe — only two signal words exist. Pictogram: red-bordered diamond shape with black symbol on white background — eight types. OSHA 300 Log: work-related injuries and illnesses, annual posting required. Safety Committee: any employee can submit concerns; reports to the Professional Advisory Committee and Governing Body. Incident Report: required for all accidents; device malfunction plus serious injury means FDA reporting within 10 days.',
        audio_path: '/training-audio/ACHC-ART-M07/l0/concepts.wav', image_url: IMG.M07, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m07_l1', topic_id: 'ACHC-ART-M07', title: 'Lesson 1: OSHA Rights & Agency Safety Program', order: 1,
    cards: [
      {
        card_id: 'achc_m07_l1_s', type: 'summary', title: '"Be Careful" Is Not a Safety Plan',
        content: 'OSHA requires employers to ELIMINATE or REDUCE hazards, not just warn about them. Telling a field worker to "be careful" when returning to a home with an unrestrained aggressive dog is NOT a hazard mitigation plan. You have the RIGHT to a safe workplace and the right to refuse immediately dangerous conditions.',
        narration_script: 'OSHA requires employers to eliminate or reduce hazards — not just warn about them. Telling a field worker to "be careful" when returning to a home with a dangerous dog is not a hazard mitigation plan. You have the right to a safe workplace and the right to refuse immediately dangerous conditions.',
        audio_path: '/training-audio/ACHC-ART-M07/l1/summary.wav', image_url: IMG.M07, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m07_l1_c1', type: 'content', title: 'Your OSHA Rights',
        content: 'Under the OSH Act, workers have the right to:\n• A safe workplace free of known serious hazards\n• Information about hazards through training, labels, SDS\n• Request an OSHA inspection\n• See test results for exposure monitoring\n• Review records of work-related injuries and illnesses\n• Protection from retaliation for reporting safety concerns\n\nReporting timelines:\n• Work-related fatality: within 8 hours\n• Hospitalization, amputation, eye loss: within 24 hours\n• OSHA hotline: 1-800-321-6742\n\nRetaliation for safety reporting = separate federal violation.',
        narration_script: 'Your OSHA rights. You have the right to a safe workplace, information about hazards, the ability to request an OSHA inspection, access to exposure monitoring results, records of work-related injuries, and protection from retaliation for safety reporting. Reporting timelines: work-related fatalities within 8 hours, hospitalizations and amputations within 24 hours. OSHA hotline: 1-800-321-OSHA. Retaliation for safety reporting is a separate federal violation.',
        audio_path: '/training-audio/ACHC-ART-M07/l1/content1.wav', image_url: IMG.M07, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m07_l1_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• You have the RIGHT to refuse work in immediately dangerous conditions\n• Employer must ELIMINATE hazards, not just acknowledge them\n• Home IS your workplace — OSHA protections apply in patient homes\n• Safety hazards in patient homes are patient safety findings too — document and report\n• Retaliation for reporting safety concerns is a federal violation\n• The Safety Committee meets yearly and accepts concerns from ANY employee through their supervisor',
        narration_script: 'Takeaways. You have the right to refuse work in immediately dangerous conditions. Employers must eliminate hazards — not just acknowledge them. The patient\'s home is your workplace and OSHA protections apply there. Safety hazards in patient homes are patient safety findings — document and report them. Retaliation for safety reporting is a federal violation. The Safety Committee meets annually and accepts concerns from any employee through their supervisor.',
        audio_path: '/training-audio/ACHC-ART-M07/l1/takeaways.wav', image_url: IMG.M07, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m07_l1_ch', type: 'challenge', title: 'Challenge: Dog Bite Safety Dispute',
        content: 'Your supervisor assigns you back to a patient\'s home where you were previously bitten by the patient\'s dog. The dog was not restrained and the caregiver refuses to confine it. Your supervisor responds: "Just be careful this time — we can\'t refuse service."\n\nWhat is the CORRECT understanding of your rights?',
        narration_script: 'Challenge scenario. Your supervisor assigns you back to a home where you were previously bitten by the patient\'s dog. The dog was not restrained and the caregiver refuses to confine it. Your supervisor says: just be careful this time — we can\'t refuse service. What is the correct understanding of your rights?',
        audio_path: '/training-audio/ACHC-ART-M07/l1/challenge.wav', image_url: IMG.M07, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Your supervisor is correct — you must go; patient care comes first', isCorrect: false, rationale: '"Patient care comes first" does not override your right to a workplace free of known serious hazards.' },
          { id: 'B', label: 'You have the right under OSHA to report the unsafe condition and request a safe resolution before entering; the Agency must address the hazard, not just say "be careful"', isCorrect: true, rationale: 'Correct — OSHA requires employers to eliminate or reduce hazards. "Be careful" is not a mitigation plan.' },
          { id: 'C', label: 'You should quit if you feel unsafe — that\'s your only option', isCorrect: false, rationale: 'Resignation is not required. Federal law provides protection for employees who report safety concerns.' },
          { id: 'D', label: 'Call the police about the dog before your visit', isCorrect: false, rationale: 'This is disproportionate and does not address the organizational safety issue. The Agency must implement a safety plan.' },
        ],
      },
      {
        card_id: 'achc_m07_l1_deb', type: 'content', title: 'Operational Debrief: Hazard Mitigation Required',
        content: 'OSHA requires engineering/administrative controls — not just worker caution.\n\nWhy the others fail:\n• A: Patient care priority does not override worker safety rights. The Agency must find a way to deliver care safely (require confinement, provide a safety plan, consider reassignment)\n• C: Resignation is the last resort. The law protects you — use it\n• D: Police involvement is disproportionate; the systemic solution is an organizational safety plan\n\nEscalation path: Report to Safety Committee → document the hazard → Agency communicates with patient/caregiver → safety plan or assignment modification.\nACHC reviews safety programs — known unaddressed hazards = survey deficiency.',
        narration_script: 'Debrief. OSHA requires engineering and administrative controls, not just worker caution. Option A is wrong because patient care priority does not override your right to workplace safety. Option C is wrong because the law protects you — use it, don\'t resign. Option D is disproportionate and bypasses the organizational solution. Escalation: report to the Safety Committee, document the hazard, have the Agency develop a safety plan for the visit, or modify the assignment. ACHC reviews safety programs, and known unaddressed hazards are a survey deficiency.',
        audio_path: '/training-audio/ACHC-ART-M07/l1/debrief.wav', image_url: IMG.M07, estimated_duration: '0:55', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m07_l2', topic_id: 'ACHC-ART-M07', title: 'Lesson 2: Hazard Communication Standard (GHS/SDS)', order: 2,
    cards: [
      {
        card_id: 'achc_m07_l2_s', type: 'summary', title: 'Two Signal Words. Eight Pictograms. Section 8 Always.',
        content: 'The OSHA Hazard Communication Standard uses exactly TWO signal words: "Danger" (more severe) and "Warning" (less severe). Eight pictograms identify hazard categories. SDS Section 8 ALWAYS contains PPE and exposure control information — memorize this.',
        narration_script: 'The OSHA Hazard Communication Standard uses exactly two signal words: Danger for more severe hazards, Warning for less severe. Eight pictograms identify hazard categories. And Section 8 of a Safety Data Sheet always contains PPE and exposure control information. Memorize Section 8.',
        audio_path: '/training-audio/ACHC-ART-M07/l2/summary.wav', image_url: IMG.M07, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m07_l2_c1', type: 'content', title: 'GHS Labels and SDS Structure',
        content: 'Six required GHS label elements: Product Identifier, Signal Word, Pictogram, Hazard Statement, Precautionary Statement, Manufacturer information.\n\nSignal words (only 2): "Danger" = more severe / "Warning" = less severe.\n\n8 OSHA pictograms (red diamond frames with black symbols): Flame, Exclamation Mark, Health Hazard, Corrosion, Exploding Bomb, Skull/Crossbones, Gas Cylinder, Environment.\n\nSDS 16-section format:\n• Section 4: First-Aid measures\n• Section 8: Exposure controls and PPE ← most important for field staff\n\nSDS must be READILY ACCESSIBLE to all employees — not locked up.',
        narration_script: 'Six required GHS label elements: product identifier, signal word, pictogram, hazard statement, precautionary statement, and manufacturer information. Only two signal words: Danger and Warning. Eight OSHA pictograms in red diamond frames: flame, exclamation mark, health hazard, corrosion, exploding bomb, skull and crossbones, gas cylinder, and environment. SDS 16-section format — Section 4 is first-aid measures, Section 8 is exposure controls and PPE. SDS must be readily accessible to all employees, not locked away.',
        audio_path: '/training-audio/ACHC-ART-M07/l2/content1.wav', image_url: IMG.M07, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m07_l2_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• SDS MUST be readily accessible — not locked in a file cabinet\n• Section 8 ALWAYS contains exposure limits, engineering controls, and PPE requirements\n• Multiple pictograms on one product = multiple hazard categories\n• Training must be in a language the employee understands — no exceptions\n• Precautionary statements on labels match those on the SDS\n• When you encounter an unknown chemical in a patient\'s home: check for label, check SDS, educate caregiver about proper storage and use',
        narration_script: 'Takeaways. SDS must be readily accessible to all employees — never locked away. Section 8 always has exposure limits, engineering controls, and PPE requirements. Multiple pictograms mean multiple hazard categories. Training must be in a language the employee understands — no exceptions. Precautionary statements on labels match the SDS. When you encounter an unknown chemical in a patient\'s home: check for a label, find the SDS, and educate the caregiver about proper storage and use.',
        audio_path: '/training-audio/ACHC-ART-M07/l2/takeaways.wav', image_url: IMG.M07, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m07_l2_ch', type: 'challenge', title: 'Challenge: Unlabeled Chemical in Patient Home',
        content: 'You notice the patient\'s caregiver has an unlabeled spray bottle stored under the kitchen sink next to food items. The caregiver uses it to "sanitize" the patient\'s wheelchair tray before meals. The bottle has a strong chemical odor. No label. No SDS available.\n\nWhat action is required?',
        narration_script: 'Challenge scenario. You notice an unlabeled spray bottle under the kitchen sink next to food. The caregiver uses it to sanitize the patient\'s wheelchair tray before meals. Strong chemical odor, no label, no SDS available. What action is required?',
        audio_path: '/training-audio/ACHC-ART-M07/l2/challenge.wav', image_url: IMG.M07, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'It\'s the patient\'s home — their chemical storage is not your concern', isCorrect: false, rationale: 'Patient safety in the home IS your clinical concern. An unlabeled chemical on an eating surface poses a direct ingestion risk.' },
          { id: 'B', label: 'Tell the caregiver it\'s dangerous and leave it at that', isCorrect: false, rationale: 'Verbal warning without documentation creates no follow-up mechanism and no audit trail.' },
          { id: 'C', label: 'Advise the caregiver about the hazard, document the safety concern in your visit note, and report to supervisor for follow-up education', isCorrect: true, rationale: 'Correct — patient safety includes environmental hazards. Document, educate, and report for follow-up.' },
          { id: 'D', label: 'Take the bottle with you and dispose of it properly', isCorrect: false, rationale: 'Removing a patient\'s property without consent is not within your authority. Educate and document; do not confiscate.' },
        ],
      },
      {
        card_id: 'achc_m07_l2_deb', type: 'content', title: 'Operational Debrief: Home Environmental Safety',
        content: 'Patient safety in the home includes environmental hazard assessment. Unlabeled chemicals near food and used on eating surfaces = patient safety finding.\n\nWhy the others fail:\n• A: "It\'s their home" does not relieve your clinical obligation to identify and document patient safety hazards\n• B: Verbal warnings without documentation leave no follow-up mechanism and no proof education occurred\n• D: Confiscating a patient\'s property is not within your authority regardless of the safety concern\n\nDocumentation: environmental safety hazards documented in the clinical record trigger care plan interventions.\nPatient safety: chemical ingestion from improperly used household chemicals is a common home health safety finding.',
        narration_script: 'Debrief. Patient safety includes environmental hazard assessment. Option A is wrong — your clinical obligation to identify and document patient safety hazards applies regardless of setting. Option B is incomplete — verbal warning without documentation leaves no follow-up and no audit trail. Option D is inappropriate — you cannot confiscate a patient\'s property. Environmental safety hazards documented in the clinical record trigger care plan interventions. Chemical ingestion from improperly used household chemicals is a common home health safety finding.',
        audio_path: '/training-audio/ACHC-ART-M07/l2/debrief.wav', image_url: IMG.M07, estimated_duration: '0:55', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m07_l3', topic_id: 'ACHC-ART-M07', title: 'Lesson 3: Incident Reporting & Safety Committee', order: 3,
    cards: [
      {
        card_id: 'achc_m07_l3_s', type: 'summary', title: 'Report First — Assess Severity Later',
        content: 'Incident reporting is not conditional on severity. Any accident, injury, or safety hazard must be reported immediately. The patient saying "I\'m fine" or "don\'t make a big deal" does NOT eliminate your reporting obligation. The FDA timeline (10 working days) starts from AWARENESS — not from investigation completion.',
        narration_script: 'Incident reporting is not conditional on severity. Any accident, injury, or safety hazard must be reported immediately. A patient saying they are fine does not eliminate your reporting obligation. The FDA timeline of ten working days starts from your awareness of the event — not from when the investigation concludes.',
        audio_path: '/training-audio/ACHC-ART-M07/l3/summary.wav', image_url: IMG.M07, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m07_l3_c1', type: 'content', title: 'Incident Reporting Requirements',
        content: 'For ALL accidents or injuries:\n• Immediate incident report + supervising nurse notification\n• Physician notification for patient-involved accidents\n• Document in clinical record AND report to supervisor\n\nFDA medical device reporting:\n• Device malfunction + serious injury/death → FDA Form 3500A within 10 working days\n• Serious injury = life-threatening, permanent impairment, OR requiring intervention to prevent permanent damage\n• Annual summary to FDA every January 1\n• Records retained minimum 5 years\n\nSafety Committee:\n• Any employee can submit suggestions/complaints through supervisor\n• Meets annually minimum\n• Reports to Professional Advisory Committee AND Governing Body',
        narration_script: 'For all accidents: immediate incident report and supervising nurse notification. Physician notification for patient-involved accidents. Document in the clinical record and report to supervisor. FDA medical device reporting: device malfunction plus serious injury or death requires FDA Form 3500A within 10 working days. Serious injury means life-threatening, permanent impairment, or requiring intervention to prevent permanent damage. Annual FDA summary due January 1. Records retained five years. The Safety Committee accepts concerns from any employee through their supervisor, meets annually, and reports to the Professional Advisory Committee and Governing Body.',
        audio_path: '/training-audio/ACHC-ART-M07/l3/content1.wav', image_url: IMG.M07, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m07_l3_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• ANY employee may submit safety concerns to the Safety Committee via supervisor\n• ALL accidents → incident report + supervising nurse notification immediately\n• Equipment malfunction + serious injury/death → FDA within 10 working days\n• Patient minimization ("I\'m fine") NEVER eliminates reporting obligation\n• Safety records retained minimum 5 years\n• Patient/caregiver safety instruction requires written acknowledgment of receipt',
        narration_script: 'Takeaways. Any employee may submit safety concerns to the Safety Committee through their supervisor. All accidents require an immediate incident report and supervising nurse notification. Equipment malfunction plus serious injury or death means FDA reporting within 10 working days. A patient saying they are fine never eliminates your reporting obligation. Safety records are retained a minimum of 5 years. Patient and caregiver safety instruction requires a written acknowledgment of receipt.',
        audio_path: '/training-audio/ACHC-ART-M07/l3/takeaways.wav', image_url: IMG.M07, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m07_l3_ch', type: 'challenge', title: 'Challenge: Hydraulic Lift Malfunction',
        content: 'During a patient transfer using a hydraulic lift, the lift drops suddenly. The patient falls approximately 6 inches and sustains a skin tear and bruising. The patient says: "I\'m fine — please don\'t make a big deal."\n\nWhat is REQUIRED in this situation?',
        narration_script: 'Challenge scenario. During a patient transfer, the hydraulic lift malfunctions and drops suddenly. The patient falls about six inches and sustains a skin tear and bruising. The patient says they are fine and not to make a big deal. What is required?',
        audio_path: '/training-audio/ACHC-ART-M07/l3/challenge.wav', image_url: IMG.M07, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Complete an incident report documenting the equipment malfunction and patient injury', isCorrect: true, rationale: 'Correct — all accidents involving equipment require an incident report regardless of patient minimization.' },
          { id: 'B', label: 'Notify the supervising nurse immediately', isCorrect: true, rationale: 'Correct — supervising nurse notification is required for ALL patient-involved accidents.' },
          { id: 'C', label: 'Notify the physician to obtain follow-up orders', isCorrect: true, rationale: 'Correct — physician notification is required for patient-involved accidents to obtain assessment and follow-up orders.' },
          { id: 'D', label: 'Respect the patient\'s wishes and just document it in your regular visit note', isCorrect: false, rationale: 'Patient preference to minimize the incident does not eliminate regulatory reporting obligations for a medical device malfunction causing injury.' },
        ],
      },
      {
        card_id: 'achc_m07_l3_deb', type: 'content', title: 'Operational Debrief: Full Reporting Required',
        content: 'A, B, and C are all required. Patient saying "I\'m fine" creates no exemption from regulatory reporting.\n\nWhy D fails:\nA skin tear from equipment malfunction is a medical device adverse event. The reporting obligation is not determined by the patient\'s emotional preference — it\'s determined by the event type.\n\nFDA note: 10 working days start from the moment any employee becomes aware that the device may have caused or contributed to the injury.\n\nDevice preservation: do NOT return, repair, or discard the device until released by risk management. It is evidentiary.\n\nACHC surveys incident reporting practices. Failure to document device-related patient injuries is a deficiency.',
        narration_script: 'Debrief. Options A, B, and C are all required. Patient minimization creates no exemption from regulatory reporting. Option D fails because the reporting obligation is determined by the event type, not the patient\'s preference. The FDA 10-working-day clock starts when any employee becomes aware. Device preservation: do not return, repair, or discard the device until risk management releases it — it is evidentiary. ACHC surveys incident reporting practices. Failure to document device-related patient injuries is a deficiency.',
        audio_path: '/training-audio/ACHC-ART-M07/l3/debrief.wav', image_url: IMG.M07, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m07_l4', topic_id: 'ACHC-ART-M07', title: 'Module Wrap-Up & Completion', order: 4,
    cards: [
      {
        card_id: 'achc_m07_l4_syn', type: 'summary', title: 'Summary & Synthesis',
        content: '6 things you must take from this module:\n\n1. You have the RIGHT to a safe workplace and to report hazards without retaliation\n2. OSHA requires employers to ELIMINATE hazards — not just warn about them ("be careful" ≠ safety plan)\n3. SDS Section 8 ALWAYS has PPE/exposure control information\n4. Only two signal words: "Danger" (severe) and "Warning" (less severe)\n5. All incidents → immediate report. Device malfunction + injury → FDA within 10 working days\n6. Patient saying "I\'m fine" NEVER eliminates your reporting obligation\n\nOperational bridge: Your preceptor will evaluate your ability to identify hazards, locate SDS information, complete incident reports, and understand the reporting chain.',
        narration_script: 'Six takeaways. One: you have the right to a safe workplace and to report hazards without retaliation. Two: OSHA requires employers to eliminate hazards — "be careful" is not a safety plan. Three: SDS Section 8 always has PPE and exposure control information. Four: only two signal words — Danger and Warning. Five: all incidents require immediate reporting; device malfunction plus injury means FDA reporting within 10 working days. Six: patient minimization never eliminates your reporting obligation. Your preceptor will evaluate your hazard identification, SDS knowledge, incident reporting, and understanding of the reporting chain.',
        audio_path: '/training-audio/ACHC-ART-M07/l4/synthesis.wav', image_url: IMG.M07, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m07_l4_fdeb', type: 'content', title: 'Mandatory Final Debrief',
        content: 'A correct answer does NOT guarantee correct reasoning. Reflect:\n\n1. "Be careful" is NOT a safety plan — hazards require engineering/administrative controls\n2. Patient minimization ("I\'m fine") NEVER eliminates your reporting obligation\n3. The home IS your workplace — OSHA protections apply there too\n4. Chemical hazards in patient homes are patient safety findings that require clinical documentation\n5. Report FIRST, assess severity LATER — the timeline clock starts at awareness\n\nConfidence check: How confident are you in identifying and reporting safety hazards in the field without supervisor prompting?',
        narration_script: 'A correct answer does not guarantee correct reasoning. Five principles. One: "be careful" is not a safety plan. Two: patient minimization never eliminates reporting. Three: the home is your workplace — OSHA protections apply. Four: chemical hazards in patient homes are clinical findings that require documentation. Five: report first, assess severity later — the timeline clock starts at awareness. How confident are you in identifying and reporting safety hazards without supervisor prompting?',
        audio_path: '/training-audio/ACHC-ART-M07/l4/finaldebrief.wav', image_url: IMG.M07, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m07_l4_nxt', type: 'content', title: 'Operational Next Steps',
        content: 'Your field preceptor will evaluate:\n• Can you identify common home safety hazards during a visit?\n• Do you know where to find SDS information for chemicals you may encounter?\n• Can you complete an incident report with all required elements?\n• Do you understand the reporting chain (supervisor → Safety Committee → Advisory Committee → Governing Body)?\n• Can you articulate your OSHA rights without hesitation?\n\nResources:\n• Agency Safety Manual\n• SDS access location (physical and electronic)\n• Incident Report form\n• OSHA QuickCards (English/Spanish)\n• OSHA hotline: 1-800-321-6742',
        narration_script: 'Operational next steps. Your preceptor will evaluate: whether you can identify home safety hazards, where you access SDS information, whether you can complete an incident report with all required elements, your understanding of the full reporting chain, and whether you can articulate your OSHA rights without hesitation. Resources: Agency Safety Manual, SDS access location, incident report form, OSHA QuickCards, and OSHA hotline 1-800-321-6742.',
        audio_path: '/training-audio/ACHC-ART-M07/l4/nextsteps.wav', image_url: IMG.M07, estimated_duration: '0:55', completion_required: true,
      },
      {
        card_id: 'achc_m07_l4_surv', type: 'content', title: 'Module Evaluation',
        content: 'Please evaluate this module:\n\n1. The content was relevant to safety challenges I face in the field. (1–5)\n2. The Hazard Communication Standard was clearly explained. (1–5)\n3. The reporting requirements were clearly defined. (1–5)\n4. I feel more prepared to identify and report safety hazards. (1–5)\n5. What safety topic would you like more training on? (Share with your supervisor)\n\nCompletion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer triggered.',
        narration_script: 'Thank you for completing this module. Please evaluate: the relevance to safety challenges in the field, the clarity of the Hazard Communication Standard, the clarity of reporting requirements, and your preparedness level. Also share what safety topic you want more training on. Completion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer are now triggered.',
        audio_path: '/training-audio/ACHC-ART-M07/l4/survey.wav', image_url: IMG.M07, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  /* ══════════════════════ M08 Patient Rights & Responsibilities ══════════════════════ */

  {
    lesson_id: 'achc_m08_l0', topic_id: 'ACHC-ART-M08', title: 'Module Introduction', order: 0,
    cards: [
      {
        card_id: 'achc_m08_l0_hook', type: 'challenge', title: 'Pre-Assessment: Test Yourself First',
        content: 'You arrive for your scheduled visit. The patient is visibly upset and crying: "The aide who was here yesterday went through my medicine cabinet and told my neighbor that I\'m taking antidepressants. Now the whole building knows. I feel violated." She wants to stop services entirely.\n\nHow many patient rights have potentially been violated?',
        narration_script: 'Pre-assessment. You arrive and find the patient visibly upset and crying. She says the aide went through her medicine cabinet and told her neighbor she is taking antidepressants. She feels violated and wants to stop services. How many patient rights have potentially been violated?',
        audio_path: '/training-audio/ACHC-ART-M08/l0/hook.wav', image_url: IMG.M08, estimated_duration: '0:45', completion_required: true,
        options: [
          { id: 'A', label: 'One — privacy/confidentiality only', isCorrect: false, rationale: 'Privacy was violated, but the medicine cabinet search and resulting distress indicate additional violations.' },
          { id: 'B', label: 'Two — privacy/confidentiality and respect for property', isCorrect: false, rationale: 'Both are violated, but there is a third violation present in this scenario.' },
          { id: 'C', label: 'Three — privacy/confidentiality, respect for property/person, and freedom from mistreatment', isCorrect: true, rationale: 'Correct — a single incident can violate multiple rights simultaneously. Searching belongings and disclosing information = multiple violations.' },
          { id: 'D', label: 'This isn\'t a rights violation — it\'s just unprofessional behavior', isCorrect: false, rationale: 'Patient rights violations have regulatory and legal consequences. Unprofessional behavior that violates rights is a regulatory matter.' },
        ],
      },
      {
        card_id: 'achc_m08_l0_obj', type: 'content', title: 'Learning Objectives',
        content: 'After completing this module, you will be able to:\n\n1. Enumerate the core patient rights established in the Patient Bill of Rights.\n2. Describe how patient rights must be communicated (timing, format, documentation).\n3. Demonstrate professional patient interaction techniques that respect dignity and autonomy.\n4. Explain the patient\'s right to refuse care and the required documentation.\n5. Identify patient responsibilities as they relate to safe care delivery.\n6. Distinguish between rights violations and service complaints.',
        narration_script: 'Learning objectives. One: enumerate the core patient rights in the Bill of Rights. Two: describe how rights must be communicated — timing, format, documentation. Three: demonstrate professional interaction techniques respecting dignity and autonomy. Four: explain the right to refuse care and required documentation. Five: identify patient responsibilities for safe care delivery. Six: distinguish between rights violations and service complaints.',
        audio_path: '/training-audio/ACHC-ART-M08/l0/objectives.wav', image_url: IMG.M08, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m08_l0_concepts', type: 'content', title: 'Key Terms to Know',
        content: 'Patient Bill of Rights — Given at or before admission; posted in office; receipt documented. Must be explained, not just handed over.\n\nInformed Consent — Patient fully informed before care begins: procedures, charges, alternatives, consequences of refusal.\n\nRight to Refuse Care — Absolute right after consequences are explained. Refusal is a RIGHT, not "non-compliance."\n\nAdvance Directive — Legal document for end-of-life care. Agency must honor. (42 CFR 489)\n\nDignity & Individuality — Right to have person and property treated with respect. Affects how you address patients.\n\nFreedom from Mistreatment — Right to be free from verbal, mental, physical abuse, neglect, and property misappropriation.\n\n24/7 Access — Right to access professional services 24 hours/day, 7 days/week.',
        narration_script: 'Seven key terms. Patient Bill of Rights: given at or before admission, posted in office, receipt documented — must be explained, not just handed over. Informed Consent: patient fully informed before care — procedures, charges, alternatives, refusal consequences. Right to Refuse Care: absolute right after consequences are explained — refusal is a right, not non-compliance. Advance Directive: legal end-of-life document the Agency must honor per 42 CFR 489. Dignity and Individuality: right to have person and property treated with respect. Freedom from Mistreatment: free from verbal, mental, physical abuse, neglect, and property misappropriation. 24/7 Access: professional services available around the clock.',
        audio_path: '/training-audio/ACHC-ART-M08/l0/concepts.wav', image_url: IMG.M08, estimated_duration: '1:05', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m08_l1', topic_id: 'ACHC-ART-M08', title: 'Lesson 1: The Patient Bill of Rights', order: 1,
    cards: [
      {
        card_id: 'achc_m08_l1_s', type: 'summary', title: 'Rights Must Be Explained — Not Just Handed Over',
        content: 'The Patient Bill of Rights must be EXPLAINED with opportunity for questions — not just handed to a patient to sign. If a patient cannot read it (visual impairment, literacy barrier, non-English speaker), it must be READ TO THEM. Documentation must reflect the explanation occurred.',
        narration_script: 'The Patient Bill of Rights must be explained with the opportunity for questions — not just handed to a patient to sign. If a patient cannot read it due to visual impairment, literacy barrier, or language, it must be read to them. Your documentation must reflect that the explanation actually occurred.',
        audio_path: '/training-audio/ACHC-ART-M08/l1/summary.wav', image_url: IMG.M08, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m08_l1_c1', type: 'content', title: 'Communicating the Bill of Rights',
        content: 'Required at or BEFORE admission:\n• Explained verbally with opportunity for questions\n• Provided in written form (in understood language)\n• If patient cannot read → read to them aloud\n• If non-English speaker → in patient\'s primary language\n• If legally incompetent → rights exercised by legal representative\n\nDocumentation must include:\n• That rights were explained\n• Patient given opportunity for questions\n• Patient/representative acknowledgment\n\nKey rights overview: right to privacy, right to refuse, right to be informed, right to respectful care, right to non-discrimination, right to complaint/grievance, right to know charges, advance directives.',
        narration_script: 'At or before admission: explain verbally with opportunity for questions, provide in written form in the understood language. If the patient cannot read, read it to them aloud. For non-English speakers, provide it in their primary language. For legally incompetent patients, rights are exercised by the legal representative. Documentation must include that rights were explained, that the patient had opportunity for questions, and acknowledgment. Key rights: privacy, refusal of care, informed about care, respectful treatment, non-discrimination, complaint access, charge transparency, and advance directives.',
        audio_path: '/training-audio/ACHC-ART-M08/l1/content1.wav', image_url: IMG.M08, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m08_l1_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Bill of Rights must be EXPLAINED, not just handed over — questions must be invited\n• Rights don\'t expire or diminish during the course of service\n• Patient can exercise ANY right at ANY time — no waiting period\n• If patient cannot read → read it TO them\n• If patient declines to sign → document "rights explained, patient declined to sign," and continue services\n• Non-English speakers must receive rights in their primary language',
        narration_script: 'Takeaways. The Bill of Rights must be explained, not just handed over — questions must be invited. Rights do not expire or diminish during service. A patient can exercise any right at any time — there is no waiting period. If the patient cannot read, read it to them. If the patient declines to sign, document that rights were explained, the patient declined to sign, and continue services. Non-English speakers receive rights in their primary language.',
        audio_path: '/training-audio/ACHC-ART-M08/l1/takeaways.wav', image_url: IMG.M08, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m08_l1_ch', type: 'challenge', title: 'Challenge: Legally Blind Admission',
        content: 'You are admitting a new patient who is legally blind. Standard practice is to hand the Patient Bill of Rights document and have them sign acknowledgment. The patient asks: "What am I signing?"\n\nWhat is the CORRECT approach?',
        narration_script: 'Challenge scenario. You are admitting a new patient who is legally blind. Standard practice is to hand the Bill of Rights and have them sign. The patient asks: what am I signing? What is the correct approach?',
        audio_path: '/training-audio/ACHC-ART-M08/l1/challenge.wav', image_url: IMG.M08, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Summarize the key points briefly and have them sign — detailed review isn\'t practical for a blind patient', isCorrect: false, rationale: 'A summary of "key points" is not the standard. ALL rights must be communicated.' },
          { id: 'B', label: 'Read the entire Bill of Rights aloud, explain each section, invite questions, and document that rights were read and discussed', isCorrect: true, rationale: 'Correct — CL-PR-001 (Patient Rights & Responsibilities) states: if a patient cannot read the Bill of Rights, it will be read to them.' },
          { id: 'C', label: 'Have a family member sign on behalf of the patient since they can\'t read it', isCorrect: false, rationale: 'Family acknowledgment does not replace patient education. The patient has the right to hear and understand their own rights.' },
          { id: 'D', label: 'Note "patient unable to review Bill of Rights due to visual impairment" and move on', isCorrect: false, rationale: 'Documenting inability to comply rather than adapting the approach violates the fundamental purpose of rights education.' },
        ],
      },
      {
        card_id: 'achc_m08_l1_deb', type: 'content', title: 'Operational Debrief: Adaptive Rights Communication',
        content: 'Visual impairment does not eliminate the patient\'s right to be informed. It triggers an adaptation: read it aloud.\n\nWhy the others fail:\n• A: You don\'t get to decide which rights are important enough to mention. ALL rights must be communicated\n• C: Family acknowledgment is not a substitute for the patient\'s own education\n• D: Documenting "unable to review" instead of adapting the approach is negligent\n\nDocumentation standard: "Bill of Rights read aloud to patient, each section explained, patient given opportunity for questions, patient acknowledged understanding."\n\nACHC will verify rights were communicated appropriately regardless of patient limitations.',
        narration_script: 'Debrief. Visual impairment does not eliminate the right to be informed — it triggers an adaptation. Option A is wrong because you cannot select which rights to mention. All rights must be communicated. Option C is wrong because family acknowledgment does not replace patient education. Option D documents failure to comply rather than adapting the approach. Documentation standard: note that the Bill of Rights was read aloud, sections were explained, the patient had opportunity for questions, and acknowledged understanding. ACHC verifies appropriate rights communication regardless of patient limitations.',
        audio_path: '/training-audio/ACHC-ART-M08/l1/debrief.wav', image_url: IMG.M08, estimated_duration: '0:55', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m08_l2', topic_id: 'ACHC-ART-M08', title: 'Lesson 2: Professional Interaction & Dignity', order: 2,
    cards: [
      {
        card_id: 'achc_m08_l2_s', type: 'summary', title: 'You Are a Guest in Their Home',
        content: 'You are delivering care in someone\'s personal space. Professional interaction requires addressing patients by name and title (not nicknames unless patient-directed), explaining procedures before performing them, answering questions honestly, and treating their property with respect. Violations of these standards are rights violations — not just etiquette lapses.',
        narration_script: 'You are delivering care in someone\'s personal space. Professional interaction requires addressing patients by name and title — not nicknames unless the patient specifically directs you to. Explain procedures before performing them. Answer questions honestly. Treat their property with respect. Violations of these standards are patient rights violations, not just etiquette lapses.',
        audio_path: '/training-audio/ACHC-ART-M08/l2/summary.wav', image_url: IMG.M08, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m08_l2_c1', type: 'content', title: 'Professional Interaction Standards',
        content: 'Address patients:\n• By name + appropriate title (Mr., Mrs., Ms.) — NOT by first name unless invited\n• "Sweetie," "honey," "dear" = demeaning regardless of intent — never use\n• Nicknames ONLY if patient specifically gives permission\n\nOther standards:\n• Always introduce yourself and wear your ID badge\n• Explain procedures BEFORE starting them\n• Answer questions honestly; redirect to office if you don\'t know\n• You are a GUEST — observe cultural norms, don\'t slam doors, respect property\n• Patient\'s right to choose their healthcare provider — acknowledge preferences\n• Right to refuse is absolute — explain consequences and document',
        narration_script: 'Address patients by name and title — Mr., Mrs., or Ms. — not by first name unless invited. Terms like sweetie, honey, or dear are demeaning regardless of intent. Nicknames only with explicit patient permission. Always introduce yourself and wear your ID badge. Explain procedures before starting them. Answer honestly, and redirect to the office if you don\'t know. You are a guest — respect cultural norms, handle property carefully. The patient has the right to choose their provider and to refuse care — your job is to explain consequences and document.',
        audio_path: '/training-audio/ACHC-ART-M08/l2/content1.wav', image_url: IMG.M08, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m08_l2_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• Calling a patient "sweetie" or "honey" = rights violation regardless of your intent\n• Explain WHAT you are doing BEFORE you do it — always\n• If you don\'t know the answer → "I don\'t know, let me find out" → redirect to office\n• Right to refuse is ABSOLUTE — you cannot force care on a patient who has declined\n• Document refusal + consequences explained + physician notification\n• Perform care in the manner you would want a loved one to be treated',
        narration_script: 'Takeaways. Calling a patient sweetie or honey is a rights violation regardless of intent. Always explain what you are going to do before you do it. If you don\'t know the answer, say so and redirect to the office. The right to refuse is absolute — you cannot force care on a patient who has declined. Document the refusal, the consequences you explained, and physician notification. And in all your care: perform it the way you would want a loved one to be treated.',
        audio_path: '/training-audio/ACHC-ART-M08/l2/takeaways.wav', image_url: IMG.M08, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m08_l2_ch', type: 'challenge', title: 'Challenge: Wound Care Refusal',
        content: 'A patient with a diabetic foot ulcer tells you: "I don\'t want wound care today. My foot feels fine. I have company coming." The ulcer showed early signs of infection at your last visit.\n\nWhat is the CORRECT response?',
        narration_script: 'Challenge scenario. A patient with a diabetic foot ulcer says she doesn\'t want wound care today. Her foot feels fine and she has company coming. The ulcer showed early infection signs at your last visit. What is the correct response?',
        audio_path: '/training-audio/ACHC-ART-M08/l2/challenge.wav', image_url: IMG.M08, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Insist on performing wound care — infection risk is too high to skip', isCorrect: false, rationale: 'You CANNOT perform care on a patient who has refused. This is legally assault. The right to refuse is unconditional.' },
          { id: 'B', label: 'Respect the refusal, clearly explain potential consequences (worsening infection, hospitalization, possible amputation), document refusal and education, notify physician', isCorrect: true, rationale: 'Correct — right to refuse plus duty to inform = both must happen and both must be documented.' },
          { id: 'C', label: 'Leave without comment — they said no', isCorrect: false, rationale: 'Leaving without explaining consequences fails your duty to inform. The patient cannot make an informed refusal without understanding the risks.' },
          { id: 'D', label: 'Reschedule for later today without documenting the refusal', isCorrect: false, rationale: 'Refusal is a clinical event that must be documented in real-time. Rescheduling without documentation creates a clinical record gap.' },
        ],
      },
      {
        card_id: 'achc_m08_l2_deb', type: 'content', title: 'Operational Debrief: Right to Refuse',
        content: 'Right to refuse + duty to inform = both must happen AND both must be documented.\n\nWhy the others fail:\n• A: Performing care over a patient\'s explicit refusal is legally assault. The right is unconditional — period\n• C: Leaving without explaining consequences fails your duty to inform. An informed refusal requires understanding the risks\n• D: Real-time documentation is required. A rescheduled visit does not address the undocumented refusal event\n\nRequired documentation: patient\'s statement of refusal, consequences explained, patient\'s response, physician notification time and outcome.\n\nSurvey implication: ACHC reviews evidence that patient refusals are respected AND that informed decision-making was supported.',
        narration_script: 'Debrief. Right to refuse plus duty to inform — both must happen and both must be documented. Option A is assault — the right to refuse is unconditional. Option C fails the duty to inform — the patient cannot make an informed refusal without understanding the risks. Option D fails because refusal must be documented in real-time. Required documentation: patient\'s statement, consequences explained, patient\'s response, and physician notification. ACHC reviews that refusals are respected and that informed decision-making was supported.',
        audio_path: '/training-audio/ACHC-ART-M08/l2/debrief.wav', image_url: IMG.M08, estimated_duration: '0:55', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m08_l3', topic_id: 'ACHC-ART-M08', title: 'Lesson 3: Abuse Recognition & Mandatory Reporting', order: 3,
    cards: [
      {
        card_id: 'achc_m08_l3_s', type: 'summary', title: 'Mandatory Reporting Requires Suspicion — Not Proof',
        content: 'You are a mandatory reporter. Your obligation is triggered by SUSPICION of abuse or neglect, not by confirmed evidence. "Injuries of unknown source" on a dependent, non-verbal patient are an automatic investigation trigger. Your job is to observe, document objectively, and report — NOT to investigate.',
        narration_script: 'You are a mandatory reporter. Your obligation is triggered by suspicion — not confirmed evidence. Injuries of unknown source on a dependent, non-verbal patient are an automatic investigation trigger. Your job is to observe, document objectively, and report. Not to investigate.',
        audio_path: '/training-audio/ACHC-ART-M08/l3/summary.wav', image_url: IMG.M08, estimated_duration: '0:40', completion_required: true,
      },
      {
        card_id: 'achc_m08_l3_c1', type: 'content', title: 'Abuse Categories and Reporting Obligations',
        content: 'Freedom from mistreatment includes protection from:\n• Physical abuse (hitting, restraining, rough handling)\n• Verbal/mental abuse (threats, humiliation, intimidation)\n• Sexual abuse\n• Neglect (failure to provide needed care)\n• Misappropriation of patient property\n\nMandatory reporting triggers: suspicion of any of the above\n\nDocumentation standard:\n• Objective only: describe what you SEE (size, shape, location, color, pattern of injuries)\n• NEVER document conclusions ("abuse," "victim")\n• NEVER document your explanation of the injury ("patient says caregiver did it")\n\nReporting chain: notify supervisor immediately → Adult Protective Services/appropriate authority → document in clinical record',
        narration_script: 'Freedom from mistreatment protects patients from physical abuse, verbal and mental abuse, sexual abuse, neglect, and misappropriation of property. Mandatory reporting is triggered by suspicion of any of these. Documentation standard: objective only — describe what you see in terms of size, shape, location, color, and pattern. Never document conclusions like "abuse" or "victim." Never document your explanation. Reporting chain: notify supervisor immediately, contact Adult Protective Services or the appropriate authority, and document in the clinical record.',
        audio_path: '/training-audio/ACHC-ART-M08/l3/content1.wav', image_url: IMG.M08, estimated_duration: '1:05', completion_required: true,
      },
      {
        card_id: 'achc_m08_l3_tkwy', type: 'content', title: 'Key Operational Takeaways',
        content: '• You are a MANDATORY reporter — "not wanting to get involved" is negligence\n• Report based on SUSPICION, not certainty\n• Do NOT confront the suspected abuser — this may endanger the patient and contaminate investigation\n• Document injuries OBJECTIVELY: location, size, color, pattern. NEVER conclusions or "patient says..."\n• Legal protection: mandatory reporters who act in good faith are protected from liability\n• Encourage patient independence — do NOT create dependence\n• NEVER discuss patients in public spaces (elevators, parking lots, restaurants)',
        narration_script: 'Takeaways. You are a mandatory reporter — not wanting to get involved is negligence. Report based on suspicion, not certainty. Do not confront the suspected abuser — this may endanger the patient and contaminate the investigation. Document injuries objectively: location, size, color, and pattern — never conclusions. Legal protection: mandatory reporters acting in good faith are protected from liability. Encourage patient independence — do not create dependence. Never discuss patients in public spaces.',
        audio_path: '/training-audio/ACHC-ART-M08/l3/takeaways.wav', image_url: IMG.M08, estimated_duration: '0:55', completion_required: true,
      },
      {
        card_id: 'achc_m08_l3_ch', type: 'challenge', title: 'Challenge: Suspicious Burns on Non-Verbal Patient',
        content: 'During your visit, you notice circular burns on the forearms of a non-ambulatory, non-verbal patient. They were not present at your last visit three days ago. The caregiver explains: "She grabbed the curling iron when I wasn\'t looking."\n\nWhat is REQUIRED?',
        narration_script: 'Challenge scenario. You notice circular burns on the forearms of a non-ambulatory, non-verbal patient. They were not present three days ago. The caregiver explains she grabbed the curling iron when he wasn\'t looking. What is required?',
        audio_path: '/training-audio/ACHC-ART-M08/l3/challenge.wav', image_url: IMG.M08, estimated_duration: '0:40', completion_required: true,
        options: [
          { id: 'A', label: 'Accept the caregiver\'s explanation — you weren\'t there and can\'t judge', isCorrect: false, rationale: 'Circular burns on the FOREARMS of a non-ambulatory patient who cannot explain them are suspicious. You are a mandatory reporter — suspicion is sufficient.' },
          { id: 'B', label: 'Document injuries objectively, note the explanation given, report to supervisor immediately as potential abuse requiring mandatory reporting', isCorrect: true, rationale: 'Correct — mandatory reporting is triggered by suspicion. Document objectively, report immediately, do not investigate yourself.' },
          { id: 'C', label: 'Confront the caregiver about the suspicious injuries', isCorrect: false, rationale: 'Confronting the suspected abuser may endanger the patient, contaminate the investigation, and escalate violence.' },
          { id: 'D', label: 'Wait to see if new injuries appear at the next visit before reporting', isCorrect: false, rationale: 'Every day of delay = continued risk to the patient. Mandatory reporting has no "wait and see" provision.' },
        ],
      },
      {
        card_id: 'achc_m08_l3_deb', type: 'content', title: 'Operational Debrief: Mandatory Reporting in Action',
        content: 'Circular burns on FOREARMS of a NON-AMBULATORY patient = suspicious injuries requiring mandatory reporting.\n\nWhy the others fail:\n• A: Accepting caregiver explanations for suspicious injuries on a non-verbal, dependent patient violates your mandatory reporting obligation\n• C: Confronting the caregiver may endanger the patient and contaminate the APS investigation\n• D: There is no "wait and see" provision in mandatory reporting. Delay = continued risk\n\nObjective documentation: "Two (2) circular burns, approximately 1 cm diameter, on bilateral forearms, noted at position X. Not present at previous visit 3 days ago. Caregiver stated [quote]. Supervisor notified at [time]."\nNEVER write: "patient appears to be a victim of abuse."',
        narration_script: 'Debrief. Circular burns on forearms of a non-ambulatory patient are suspicious injuries requiring mandatory reporting. Option A violates your reporting obligation. Option C may endanger the patient and contaminate the APS investigation. Option D has no legal basis — there is no wait-and-see provision in mandatory reporting. Objective documentation example: "Two circular burns, approximately one centimeter diameter, on bilateral forearms, not present at previous visit three days ago. Caregiver stated [quote]. Supervisor notified at [time]." Never write that the patient appears to be a victim of abuse.',
        audio_path: '/training-audio/ACHC-ART-M08/l3/debrief.wav', image_url: IMG.M08, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },

  {
    lesson_id: 'achc_m08_l4', topic_id: 'ACHC-ART-M08', title: 'Module Wrap-Up & Completion', order: 4,
    cards: [
      {
        card_id: 'achc_m08_l4_syn', type: 'summary', title: 'Summary & Synthesis',
        content: '6 things you must take from this module:\n\n1. Patient rights are LEGAL protections — violations have regulatory and legal consequences\n2. Rights must be communicated in a way the patient can understand (read aloud, translated, explained)\n3. Right to refuse is ABSOLUTE — inform about consequences, but never override\n4. Professional interaction: name + title, ID badge, explain before doing, be honest\n5. Injuries of unknown source = automatic investigation trigger. Mandatory reporting = no exceptions\n6. Documentation of rights education, refusals, and suspicious findings protects everyone\n\nOperational bridge: Your preceptor will evaluate how you address patients, explain procedures, handle refusal situations, and identify potential rights violations.',
        narration_script: 'Six takeaways. One: patient rights are legal protections. Two: communicate rights in a way the patient can understand — read aloud, translate, explain. Three: right to refuse is absolute — explain consequences, never override. Four: professional interaction means name and title, ID badge, explain before doing, answer honestly. Five: injuries of unknown source trigger mandatory reporting with no exceptions. Six: documentation of rights education, refusals, and suspicious findings protects everyone. Your preceptor will evaluate how you address patients, explain procedures, handle refusals, and identify potential violations.',
        audio_path: '/training-audio/ACHC-ART-M08/l4/synthesis.wav', image_url: IMG.M08, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m08_l4_fdeb', type: 'content', title: 'Mandatory Final Debrief',
        content: 'A correct answer does NOT guarantee correct reasoning. Reflect:\n\n1. Patient rights are not diminished by cognitive status, behavior, or "difficulty" — they are unconditional\n2. Right to refuse ≠ non-compliance. Language matters: document as "patient declined" not "refused to cooperate"\n3. Abuse recognition is your LEGAL obligation — "not wanting to get involved" is negligence\n4. Every interaction teaches the patient whether their rights are respected here\n5. How you document rights-related events determines the Agency\'s defensibility in investigations\n\nConfidence check: How confident are you in protecting patient rights during challenging field encounters?',
        narration_script: 'A correct answer does not guarantee correct reasoning. Five principles. One: patient rights are unconditional regardless of cognitive status, behavior, or difficulty. Two: right to refuse does not equal non-compliance — document as "patient declined," not "refused to cooperate." Three: abuse recognition is your legal obligation. Four: every interaction teaches the patient whether their rights are respected here. Five: your documentation of rights-related events determines the Agency\'s defensibility in investigations. How confident are you in protecting patient rights during challenging encounters?',
        audio_path: '/training-audio/ACHC-ART-M08/l4/finaldebrief.wav', image_url: IMG.M08, estimated_duration: '1:10', completion_required: true,
      },
      {
        card_id: 'achc_m08_l4_nxt', type: 'content', title: 'Operational Next Steps',
        content: 'Your field preceptor will evaluate:\n• How you introduce yourself and address the patient\n• Whether you explain procedures before performing them\n• Your response to a patient refusal scenario\n• Your documentation of rights-related events\n• Your ability to identify potential abuse/neglect indicators\n\nResources:\n• Patient Bill of Rights (full document, multi-language)\n• Advance Directive information and forms\n• Mandatory Reporting procedures and contacts\n• Refusal of Care documentation template\n• Professional Interaction quick reference card',
        narration_script: 'Operational next steps. Your preceptor will evaluate: how you introduce yourself and address patients, whether you explain procedures before performing them, your response to refusal scenarios, your documentation of rights-related events, and your ability to identify abuse and neglect indicators. Resources: Patient Bill of Rights in multiple languages, advance directive forms, mandatory reporting procedures, refusal documentation template, and professional interaction quick reference.',
        audio_path: '/training-audio/ACHC-ART-M08/l4/nextsteps.wav', image_url: IMG.M08, estimated_duration: '0:55', completion_required: true,
      },
      {
        card_id: 'achc_m08_l4_surv', type: 'content', title: 'Module Evaluation',
        content: 'Please evaluate this module:\n\n1. The content was relevant to my daily patient interactions. (1–5)\n2. The right to refuse scenario was clearly explained. (1–5)\n3. The abuse recognition content was helpful and actionable. (1–5)\n4. I feel more prepared to protect patient rights in the field. (1–5)\n5. What patient rights scenario would you like more training on? (Share with your supervisor)\n\nCompletion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer triggered.',
        narration_script: 'Thank you for completing this module. Please evaluate: the relevance to daily patient interactions, the clarity of the right to refuse, the actionability of the abuse recognition content, and your preparedness level. Also share what rights scenario you\'d like more training on. Completion validates knowledge reasoning only. Certificate, evidence attachment, and 365-day retraining timer are now triggered.',
        audio_path: '/training-audio/ACHC-ART-M08/l4/survey.wav', image_url: IMG.M08, estimated_duration: '1:10', completion_required: true,
      },
    ],
  },
];
