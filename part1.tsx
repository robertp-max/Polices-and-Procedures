// ═══════════════════════════════════════════════════════════════════════════════
// ACHC_Journey_LMS.tsx — ACHC JOURNEY LMS ONE-TSX REQUIRED TRAINING MVP
// 12 REQUIRED MODULES × MINIMUM 60 ACTIVE MINUTES EACH = 720+ MINUTES
// Self-contained React TSX — No external JSON, media, backend, or DB required
// ═══════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════
// SECTION 1: TYPE DEFINITIONS
// ═══════════════════════════════════════

interface MediaPrompt {
  imagePrompt: string;
  videoPrompt: string;
  videoLengthSeconds: 10;
  videoResolution: '720p';
  mediaDisplay: 'image' | 'video-prompt' | 'none';
  mediaTiming: 'beforeNarration' | 'duringNarration' | 'afterScenario' | 'assessmentReview';
  mediaInstruction: string;
}

interface DurationLedger {
  moduleId: string;
  pageId: string;
  pageType: string;
  title: string;
  narrationWordCount: number;
  estimatedNarrationMinutes: number;
  estimatedInteractionMinutes: number;
  includedRequiredMinutes: number;
  requiredForCompletion: boolean;
}

interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
  rationale: string;
}

interface AssessmentQuestion {
  questionId: string;
  moduleId: string;
  questionText: string;
  options: AnswerOption[];
  mappedObjective: string;
  source: 'provided' | 'supplemental';
  reviewRequired: boolean;
}

interface ChallengeData {
  challengeId: string;
  lessonId: string;
  moduleId: string;
  title: string;
  scenario: string;
  narrationText: string;
  prompt: string;
  interactionType: 'scenario-decision' | 'choose-best-response' | 'sequence-the-steps' | 'identify-the-risk' | 'documentation-practice' | 'escalation-decision' | 'teach-back-practice' | 'field-safety-decision' | 'privacy-security-judgment' | 'infection-control-choice' | 'patient-rights-response';
  options: { id: string; text: string; feedback: string; isBestPractice: boolean }[];
  bestPracticeAnswer: string;
  teachingPoint: string;
  documentationPrompt: string;
  escalationPrompt: string;
  estimatedInteractionMinutes: number;
  requiredForProgression: true;
  graded: false;
  countsTowardFinalScore: false;
  reviewRequired: boolean;
}

interface LessonPage {
  pageId: string;
  moduleId: string;
  pageType: 'overview' | 'instruction' | 'scenario-challenge' | 'documentation-practice' | 'pre-assessment' | 'final-assessment' | 'remediation' | 'attestation' | 'certificate';
  title: string;
  narrationText: string;
  contentHtml: string;
  media: MediaPrompt;
  duration: DurationLedger;
  challenge?: ChallengeData;
  assessmentQuestions?: AssessmentQuestion[];
  requiredForCompletion: boolean;
}

interface ModuleData {
  moduleId: string;
  title: string;
  description: string;
  version: string;
  sourceRefs: string[];
  policyRefs: string[];
  formRefs: string[];
  workflowRefs: string[];
  reviewRequired: boolean;
  pages: LessonPage[];
  preAssessmentQuestions: AssessmentQuestion[];
  finalAssessmentQuestions: AssessmentQuestion[];
  remediationObjectives: { objectiveId: string; description: string; relatedPages: string[] }[];
  passingScore: number;
  minimumRequiredMinutes: number;
}

interface LearnerState {
  learnerId: string;
  learnerName: string;
  currentModuleId: string | null;
  currentPageIndex: number;
  moduleProgress: Record<string, ModuleProgress>;
}

interface ModuleProgress {
  moduleId: string;
  completedPages: string[];
  narrationCompleted: string[];
  challengesCompleted: string[];
  preAssessmentScore: number | null;
  preAssessmentAnswers: Record<string, string>;
  finalAssessmentScore: number | null;
  finalAssessmentAnswers: Record<string, string>;
  failedObjectives: string[];
  remediationCompleted: boolean;
  attestationCompleted: boolean;
  signatureName: string;
  signatureTimestamp: string | null;
  certificateUnlocked: boolean;
  totalActiveMinutes: number;
  completionDate: string | null;
  status: 'not-started' | 'in-progress' | 'remediation' | 'completed';
}

interface ValidationResult {
  moduleId: string;
  moduleName: string;
  totalRequiredMinutes: number;
  passMinimum60: boolean;
  hasAllNarration: boolean;
  hasAllImagePrompts: boolean;
  hasAllVideoPrompts: boolean;
  hasPreAssessment: boolean;
  hasFinalAssessment: boolean;
  hasRemediation: boolean;
  hasAttestation: boolean;
  hasNoPaceholders: boolean;
  hasNoDefaultComplete: boolean;
  hasCertificateGating: boolean;
  allQuestionsHaveAnswers: boolean;
  allQuestionsHaveRationales: boolean;
  allLessonsHaveChallenges: boolean;
  allChallengesHaveNarration: boolean;
  allChallengesHaveFeedback: boolean;
  noChallengesGraded: boolean;
  overallPass: boolean;
}

// ═══════════════════════════════════════
// SECTION 2: HELPER FUNCTIONS
// ═══════════════════════════════════════

const countWords = (text: string): number => text.split(/\s+/).filter(w => w.length > 0).length;
const narrationMinutes = (text: string): number => Math.round((countWords(text) / 140) * 100) / 100;
const readingMinutes = (text: string): number => Math.round((countWords(text) / 180) * 100) / 100;

const createDuration = (
  moduleId: string, pageId: string, pageType: string, title: string,
  narrationText: string, interactionMin: number
): DurationLedger => {
  const wc = countWords(narrationText);
  const narMin = narrationMinutes(narrationText);
  return {
    moduleId, pageId, pageType, title,
    narrationWordCount: wc,
    estimatedNarrationMinutes: narMin,
    estimatedInteractionMinutes: interactionMin,
    includedRequiredMinutes: Math.round((narMin + interactionMin) * 100) / 100,
    requiredForCompletion: true,
  };
};

const createMedia = (
  imgPrompt: string, vidPrompt: string,
  display: 'image' | 'video-prompt' | 'none' = 'image',
  timing: 'beforeNarration' | 'duringNarration' | 'afterScenario' | 'assessmentReview' = 'beforeNarration',
  instruction: string = 'Display image before narration begins to set visual context.'
): MediaPrompt => ({
  imagePrompt: imgPrompt,
  videoPrompt: vidPrompt,
  videoLengthSeconds: 10,
  videoResolution: '720p',
  mediaDisplay: display,
  mediaTiming: timing,
  mediaInstruction: instruction,
});

const createOption = (id: string, text: string, isCorrect: boolean, rationale: string): AnswerOption => ({
  id, text, isCorrect, rationale
});

const createChallengeOption = (id: string, text: string, feedback: string, isBest: boolean) => ({
  id, text, feedback, isBestPractice: isBest
});

const initModuleProgress = (moduleId: string): ModuleProgress => ({
  moduleId,
  completedPages: [],
  narrationCompleted: [],
  challengesCompleted: [],
  preAssessmentScore: null,
  preAssessmentAnswers: {},
  finalAssessmentScore: null,
  finalAssessmentAnswers: {},
  failedObjectives: [],
  remediationCompleted: false,
  attestationCompleted: false,
  signatureName: '',
  signatureTimestamp: null,
  certificateUnlocked: false,
  totalActiveMinutes: 0,
  completionDate: null,
  status: 'not-started',
});

// ═══════════════════════════════════════
// SECTION 3: MODULE M01 — CULTURAL AWARENESS
// ═══════════════════════════════════════

const M01_PAGES: LessonPage[] = [
  // PAGE 1: Module Overview
  {
    pageId: 'M01-P01',
    moduleId: 'ACHC-ART-M01',
    pageType: 'overview',
    title: 'Cultural Awareness — Module Overview',
    narrationText: `Welcome to Module One: Cultural Awareness. This module is a required component of your annual ACHC training. As a home health field worker, you enter the most personal space a patient has — their home. Your ability to recognize, respect, and respond to cultural differences directly impacts the quality of care you provide and the trust your patients place in you. In this module, you will learn about cultural competence and the National Standards for Culturally and Linguistically Appropriate Services, known as CLAS. You will explore how cultural beliefs influence health decisions, how to communicate respectfully across cultural differences, how to use interpreter services properly, and how to apply the teach-back method to confirm patient understanding. You will also examine workplace discrimination laws, learn to recognize personal bias, and practice documenting cultural considerations in the clinical record. By the end of this module, you will be prepared to deliver culturally competent care that respects every patient's dignity and individuality. This module contains narrated instruction, scenario-based challenges, documentation exercises, knowledge checks, and a final graded assessment. You must complete all sections and pass the final assessment with at least eighty percent to earn your completion certificate. Let us begin.`,
    contentHtml: `<h2>Module 1: Cultural Awareness</h2><p>This module covers cultural competence, CLAS principles, respectful communication, language access, interpreter use, teach-back, patient preferences, bias and discrimination, documentation, escalation, and field-worker scenarios.</p><p><strong>Estimated Time:</strong> 60–70 minutes</p><p><strong>Passing Score:</strong> 80%</p><p><strong>Sections:</strong> Overview → Instruction → Scenarios → Documentation → Assessment → Attestation → Certificate</p>`,
    media: createMedia(
      'Professional photograph of a diverse group of home health workers in scrubs standing together in a bright office lobby, smiling, holding tablets and clipboards. Warm lighting, inclusive representation of multiple ethnicities, ages, and genders. No patient identifiers visible.',
      '10-second 720p video: Slow pan across a home health agency office. Diverse staff members greet each other, shake hands, and review patient charts together. Text overlay: "Cultural Awareness Training — Module 1." Warm, welcoming tone. Professional setting.',
      'image', 'beforeNarration',
      'Display the hero image of diverse healthcare team before narration begins to establish an inclusive, professional context for the module.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P01', 'overview', 'Cultural Awareness — Module Overview',
      `Welcome to Module One: Cultural Awareness. This module is a required component of your annual ACHC training. As a home health field worker, you enter the most personal space a patient has — their home. Your ability to recognize, respect, and respond to cultural differences directly impacts the quality of care you provide and the trust your patients place in you. In this module, you will learn about cultural competence and the National Standards for Culturally and Linguistically Appropriate Services, known as CLAS. You will explore how cultural beliefs influence health decisions, how to communicate respectfully across cultural differences, how to use interpreter services properly, and how to apply the teach-back method to confirm patient understanding. You will also examine workplace discrimination laws, learn to recognize personal bias, and practice documenting cultural considerations in the clinical record. By the end of this module, you will be prepared to deliver culturally competent care that respects every patient's dignity and individuality. This module contains narrated instruction, scenario-based challenges, documentation exercises, knowledge checks, and a final graded assessment. You must complete all sections and pass the final assessment with at least eighty percent to earn your completion certificate. Let us begin.`, 1),
    requiredForCompletion: true,
  },
  // PAGE 2: Cultural Diversity History & CLAS Standards
  {
    pageId: 'M01-P02',
    moduleId: 'ACHC-ART-M01',
    pageType: 'instruction',
    title: 'Cultural Diversity History & CLAS Standards',
    narrationText: `Cultural diversity in healthcare has a formal foundation. In the year 2000, the Department of Health and Human Services Office of Minority Health introduced the National Standards for Culturally and Linguistically Appropriate Services in Health Care, commonly known as CLAS. These standards were updated in 2010 and have since been adopted by major accrediting bodies including the Joint Commission and the Centers for Medicare and Medicaid Services. CLAS standards require healthcare professionals to receive cultural competence training. The goal is straightforward: every patient deserves care that respects their cultural background, communicates in a language they understand, and avoids assumptions based on race, ethnicity, religion, or lifestyle. As a field worker, you are often the primary point of contact between your agency and the patient. Your cultural awareness directly shapes the patient experience. Workforce diversity training focuses on beliefs, attitudes, and expectations within a culturally diverse team. The emphasis is on teamwork, developing good interpersonal relationships, and maintaining effective work performance. Companies with culturally diverse employees benefit from different perspectives, stronger problem-solving, and creative approaches to challenges. Many agencies benefit from multilingual staff members who can bridge language gaps. Training is the key to helping employees with different backgrounds understand and respect each other so they can collaborate effectively and achieve patient care goals. Cultural competence relates to the quality of day-to-day interactions between healthcare providers and patients. Unlike workforce diversity training, which affects patients indirectly, cultural competence affects patients directly. The quality of your interactions, including how you communicate, determines whether a patient can describe symptoms accurately, follow care instructions, and participate in their own care. It also determines whether a patient feels respected as an individual and as a member of a cultural group. Working with a diverse patient population requires ongoing training that provides you with specific knowledge, abilities, and skills. You must understand common cultural barriers to preventing and treating conditions. You must be able to ask questions tactfully and respectfully, and negotiate between a patient's cultural interpretation of their condition and the treatment plan. Practical skills such as using a telephone interpreter service or working with an in-person interpreter are essential.`,
    contentHtml: `<h3>Cultural Diversity History</h3><p>The CLAS standards were introduced in 2000 by HHS Office of Minority Health, updated in 2010, and adopted by the Joint Commission and CMS.</p><h3>Key Principles</h3><ul><li>Every patient deserves care that respects their cultural background</li><li>Communication must be in a language the patient understands</li><li>Avoid assumptions based on race, ethnicity, religion, or lifestyle</li></ul><h3>Cultural Competence vs. Workforce Diversity</h3><ul><li><strong>Workforce diversity:</strong> Internal focus — teamwork, interpersonal relationships, work performance</li><li><strong>Cultural competence:</strong> Patient-facing focus — communication quality, patient participation, respect</li></ul><h3>Required Skills</h3><ul><li>Understand cultural barriers to health</li><li>Ask questions tactfully and respectfully</li><li>Negotiate between cultural interpretation and treatment plan</li><li>Use interpreter services effectively</li></ul>`,
    media: createMedia(
      'Infographic-style illustration showing the CLAS Standards framework. Central circle labeled "CLAS" with radiating spokes to: "Governance," "Communication & Language," "Engagement," and "Continuous Improvement." Professional healthcare setting in background. Clean, modern design.',
      '10-second 720p video: Animated timeline showing 2000 (CLAS introduced), 2010 (CLAS updated), present day (required by Joint Commission, CMS). Each milestone appears with a brief text overlay. Smooth transitions. Professional blue and white color scheme.',
      'image', 'duringNarration',
      'Display CLAS framework infographic alongside narration to reinforce the standards structure visually.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P02', 'instruction', 'Cultural Diversity History & CLAS Standards',
      `Cultural diversity in healthcare has a formal foundation. In the year 2000, the Department of Health and Human Services Office of Minority Health introduced the National Standards for Culturally and Linguistically Appropriate Services in Health Care, commonly known as CLAS. These standards were updated in 2010 and have since been adopted by major accrediting bodies including the Joint Commission and the Centers for Medicare and Medicaid Services. CLAS standards require healthcare professionals to receive cultural competence training. The goal is straightforward: every patient deserves care that respects their cultural background, communicates in a language they understand, and avoids assumptions based on race, ethnicity, religion, or lifestyle. As a field worker, you are often the primary point of contact between your agency and the patient. Your cultural awareness directly shapes the patient experience. Workforce diversity training focuses on beliefs, attitudes, and expectations within a culturally diverse team. The emphasis is on teamwork, developing good interpersonal relationships, and maintaining effective work performance. Companies with culturally diverse employees benefit from different perspectives, stronger problem-solving, and creative approaches to challenges. Many agencies benefit from multilingual staff members who can bridge language gaps. Training is the key to helping employees with different backgrounds understand and respect each other so they can collaborate effectively and achieve patient care goals. Cultural competence relates to the quality of day-to-day interactions between healthcare providers and patients. Unlike workforce diversity training, which affects patients indirectly, cultural competence affects patients directly. The quality of your interactions, including how you communicate, determines whether a patient can describe symptoms accurately, follow care instructions, and participate in their own care. It also determines whether a patient feels respected as an individual and as a member of a cultural group. Working with a diverse patient population requires ongoing training that provides you with specific knowledge, abilities, and skills. You must understand common cultural barriers to preventing and treating conditions. You must be able to ask questions tactfully and respectfully, and negotiate between a patient's cultural interpretation of their condition and the treatment plan. Practical skills such as using a telephone interpreter service or working with an in-person interpreter are essential.`, 2),
    challenge: {
      challengeId: 'M01-C01',
      lessonId: 'M01-P02',
      moduleId: 'ACHC-ART-M01',
      title: 'CLAS Standards Application',
      scenario: 'You arrive at the home of Mrs. Nguyen, a 72-year-old Vietnamese-speaking patient. Her daughter, who speaks some English, is present. Mrs. Nguyen needs wound care teaching. Her daughter offers to translate.',
      narrationText: 'Let us apply what you have learned about CLAS standards. You arrive at the home of Mrs. Nguyen, a seventy-two-year-old Vietnamese-speaking patient. Her daughter, who speaks some English, is present. Mrs. Nguyen needs wound care teaching, and her daughter offers to translate. What is the best course of action according to CLAS standards and agency policy?',
      prompt: 'What is the best course of action for language access?',
      interactionType: 'scenario-decision',
      options: [
        createChallengeOption('a', 'Accept the daughter\'s offer to translate since she is already present and knows the family.', 'Using family members as interpreters is discouraged because they may lack medical vocabulary, may filter information, and confidentiality can be compromised. CLAS standards require qualified interpreter services.', false),
        createChallengeOption('b', 'Contact your agency to arrange a qualified medical interpreter via phone or video, then proceed with teaching once interpreter is connected.', 'Correct. CLAS standards and agency policy require the use of qualified interpreters for medical communication. Phone and video interpreter services are available and should be used to ensure accurate, confidential communication.', true),
        createChallengeOption('c', 'Speak slowly and use hand gestures to demonstrate wound care without an interpreter.', 'Relying on gestures and slow speech for medical instruction is unsafe. The patient may misunderstand critical wound care steps, leading to infection or injury. Qualified interpretation is required.', false),
        createChallengeOption('d', 'Skip the wound care teaching today and reschedule when a bilingual staff member is available.', 'Delaying necessary patient education is not appropriate when interpreter services are available by phone or video. The patient deserves timely care.', false),
      ],
      bestPracticeAnswer: 'Contact your agency to arrange a qualified medical interpreter.',
      teachingPoint: 'CLAS standards require qualified interpreter services for patients with limited English proficiency. Family members should not be used as primary interpreters for medical communication due to accuracy and confidentiality concerns.',
      documentationPrompt: 'Document in the clinical record: language barrier identified, interpreter service requested, method used, and that teaching was delivered with qualified interpretation.',
      escalationPrompt: 'If interpreter services are unavailable, notify your supervisor immediately and document the communication barrier.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true,
      graded: false,
      countsTowardFinalScore: false,
      reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // PAGE 3: Common Diversity Issues & Employee Relations
  {
    pageId: 'M01-P03',
    moduleId: 'ACHC-ART-M01',
    pageType: 'instruction',
    title: 'Common Diversity Issues & Employee Relations',
    narrationText: `It is not uncommon for home health agencies to employ workers of various nationalities and ethnic groups. Issues such as differences in pay or differing treatment of employees because of cultural differences could be perceived as discrimination. By emphasizing awareness of and promoting sensitivity to cultural issues, your agency shows that it recognizes the contributions and value of all workers. The lack of cultural understanding or the perception of disrespect for other cultures can be detrimental to working relationships. Cultural differences are not limited to ethnicity and race relations. They extend to religious views, sexuality, and even geographical differences based on where a person grew up. Managers should demonstrate sensitivity to employees who express concern about interacting with others in the group. In some cases, communication may be hindered due to cultural differences. Moving past these barriers requires training and sensitivity to the differences of the employees. Generations in the workplace present their own cultural dynamics. Traditionalists, baby boomers, Generation X, Generation Y, and millennials each have distinct characteristics. For example, baby boomers tend to link their personal identity to their profession. They are committed but willing to change employers for career growth. Generation Y employees value professional development but are also tech-savvy, accustomed to diversity, and value flexibility. Education creates cultural differences too. Employees who equate academic credentials with success may approach work differently than those whose vocational and on-the-job training built their careers. Where an employee lives or has lived also matters. The pace and style of work in a large city differs significantly from a small town. Ethnicity and national origin are frequently cited examples of cultural differences in the workplace. Communication styles, language barriers, and business practices may differ significantly. The key understanding is this: not all people of the same culture will react to communication in the same way or share the same opinion. While cultural backgrounds may affect how people act and communicate, treating each person as an individual is essential.`,
    contentHtml: `<h3>Common Diversity Issues</h3><ul><li>Pay differences or differing treatment perceived as discrimination</li><li>Cultural differences extend beyond ethnicity: religion, sexuality, geography, generation</li><li>Communication barriers may arise from cultural differences</li></ul><h3>Generational Differences</h3><ul><li><strong>Baby Boomers:</strong> Identity linked to profession, committed, open to career moves</li><li><strong>Gen Y/Millennials:</strong> Tech-savvy, value flexibility and diversity</li></ul><h3>Key Principle</h3><p>Treat each person as an individual. Do not assume all members of a culture share the same views.</p>`,
    media: createMedia(
      'Illustration showing a workplace diversity wheel with segments for: Age/Generation, Education, Geography, Ethnicity, Religion, Gender, Sexuality, Ability. Each segment has a small representative icon. Professional, clean design on white background.',
      '10-second 720p video: Split-screen showing two home health workers from different generations collaborating on a patient chart. One uses a tablet, the other references a paper form. They discuss the patient plan together. Text overlay: "Bridging Generational & Cultural Differences." Professional tone.',
      'image', 'beforeNarration',
      'Display diversity wheel infographic before narration to preview the multiple dimensions of cultural diversity.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P03', 'instruction', 'Common Diversity Issues & Employee Relations',
      `It is not uncommon for home health agencies to employ workers of various nationalities and ethnic groups. Issues such as differences in pay or differing treatment of employees because of cultural differences could be perceived as discrimination. By emphasizing awareness of and promoting sensitivity to cultural issues, your agency shows that it recognizes the contributions and value of all workers. The lack of cultural understanding or the perception of disrespect for other cultures can be detrimental to working relationships. Cultural differences are not limited to ethnicity and race relations. They extend to religious views, sexuality, and even geographical differences based on where a person grew up. Managers should demonstrate sensitivity to employees who express concern about interacting with others in the group. In some cases, communication may be hindered due to cultural differences. Moving past these barriers requires training and sensitivity to the differences of the employees. Generations in the workplace present their own cultural dynamics. Traditionalists, baby boomers, Generation X, Generation Y, and millennials each have distinct characteristics. For example, baby boomers tend to link their personal identity to their profession. They are committed but willing to change employers for career growth. Generation Y employees value professional development but are also tech-savvy, accustomed to diversity, and value flexibility. Education creates cultural differences too. Employees who equate academic credentials with success may approach work differently than those whose vocational and on-the-job training built their careers. Where an employee lives or has lived also matters. The pace and style of work in a large city differs significantly from a small town. Ethnicity and national origin are frequently cited examples of cultural differences in the workplace. Communication styles, language barriers, and business practices may differ significantly. The key understanding is this: not all people of the same culture will react to communication in the same way or share the same opinion. While cultural backgrounds may affect how people act and communicate, treating each person as an individual is essential.`, 2),
    challenge: {
      challengeId: 'M01-C02',
      lessonId: 'M01-P03',
      moduleId: 'ACHC-ART-M01',
      title: 'Recognizing Cultural Assumptions',
      scenario: 'During a team meeting, a coworker says about a new hire: "She is from the South, so she will probably work slowly and not understand our fast pace here." You overhear this comment.',
      narrationText: 'Let us practice recognizing cultural assumptions. During a team meeting, a coworker says about a new hire: She is from the South, so she will probably work slowly and not understand our fast pace here. You overhear this comment. What should you do?',
      prompt: 'How should you respond to this generalization?',
      interactionType: 'choose-best-response',
      options: [
        createChallengeOption('a', 'Agree with the coworker since geographical differences do affect work style.', 'Agreeing with a generalization reinforces stereotyping. While regional differences exist, individual performance varies. Every person deserves to be judged on their own work, not a stereotype.', false),
        createChallengeOption('b', 'Politely address the comment by noting that people should be judged on individual performance, not geographic origin, and report the comment to your supervisor if it continues.', 'Correct. Addressing stereotyping respectfully helps maintain a professional workplace. If comments persist, escalation to a supervisor is appropriate. Diversity means recognizing individuals beyond their background.', true),
        createChallengeOption('c', 'Ignore the comment since it was not directed at you.', 'Ignoring stereotyping allows it to persist and can contribute to a hostile work environment. As a professional, you have a responsibility to promote respect.', false),
      ],
      bestPracticeAnswer: 'Address the comment respectfully and escalate if needed.',
      teachingPoint: 'Cultural differences based on geography, generation, or background should never be used to make assumptions about individual performance. Address stereotyping professionally.',
      documentationPrompt: 'If the comment creates a pattern, document the incident with date, time, and what was said, and report to your supervisor or HR.',
      escalationPrompt: 'Report persistent stereotyping or discriminatory comments to your supervisor or the agency compliance officer.',
      estimatedInteractionMinutes: 3,
      requiredForProgression: true,
      graded: false,
      countsTowardFinalScore: false,
      reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // PAGE 4: Workplace Discrimination Laws & Prevention
  {
    pageId: 'M01-P04',
    moduleId: 'ACHC-ART-M01',
    pageType: 'instruction',
    title: 'Workplace Discrimination Laws & Prevention',
    narrationText: `Your agency's leaders are charged with ensuring compliance with federal laws that govern the equal treatment of employees regardless of race, ethnicity, religious views, and many other individual traits. When employees believe they are treated differently because of their individualism, this perception could lead to legal trouble for the agency. The United States Equal Employment Opportunity Commission, or EEOC, prohibits companies from discriminating against employees for any reason. Allegations of discrimination in the workplace, if proved, could result in financial penalties. The EEOC website at w-w-w dot e-e-o-c dot gov provides information about employment laws and ways to avoid discrimination for both employers and employees. A complete understanding of cultural diversity is essential for successful operations. Mandatory diversity training for managers should be part of a developmental learning process. By staying current with federal guidelines governing employment discrimination and the importance of cultural diversity, managers become equipped to handle conflicts that may stem from cultural differences. Managers with this understanding can also improve employee relations and retention. Cultural diversity training and education supports customer service efforts as well. Providing quality care across many cultures requires a solid understanding of what different cultures consider appropriate behavior. Diversity training helps agencies understand what barriers affect key patient relationships and how to improve communication between employees and their patients. Prevention and education are fundamental. You may need to communicate differently with patients and coworkers from other cultures. Some cultures do not openly praise people in front of others, preferring private recognition. You may need to learn about cultural differences to build trust and avoid giving offense. Training should be frequent and thorough. Extra time may be needed covering areas like harassment and professional behavior so all employees are clear about expectations. Cultural diversity training helps employees improve performance by creating a workplace free of judgments and stereotypes. Educational activities about cultural variations provide a level of understanding about other cultures that employees may not have had before.`,
    contentHtml: `<h3>Workplace Discrimination Laws</h3><ul><li>EEOC prohibits discrimination based on race, ethnicity, religion, and other traits</li><li>Proved discrimination allegations result in financial penalties</li><li>Resource: www.eeoc.gov</li></ul><h3>Prevention & Education</h3><ul><li>Mandatory diversity training for managers</li><li>Stay current with federal employment discrimination guidelines</li><li>Train frequently — cover harassment, behavior expectations clearly</li></ul><h3>Communication Tips</h3><ul><li>Some cultures prefer private praise over public recognition</li><li>Study cultural differences in your patient population</li><li>Assign mentors to help with cultural assimilation</li></ul>`,
    media: createMedia(
      'Professional photograph of a home health worker reviewing an EEOC compliance poster in an agency office hallway. The poster is visible but text is not fully legible. Worker appears engaged and attentive. Clean, well-lit office environment.',
      '10-second 720p video: A manager leads a brief diversity training session in a conference room. Diverse staff listen attentively. Slides visible on screen show "EEOC," "Equal Treatment," "Respect." Text overlay: "Prevention Through Education." Professional, serious tone.',
      'image', 'beforeNarration',
      'Display image of compliance poster review to ground the legal compliance content in a realistic agency setting.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P04', 'instruction', 'Workplace Discrimination Laws & Prevention',
      `Your agency's leaders are charged with ensuring compliance with federal laws that govern the equal treatment of employees regardless of race, ethnicity, religious views, and many other individual traits. When employees believe they are treated differently because of their individualism, this perception could lead to legal trouble for the agency. The United States Equal Employment Opportunity Commission, or EEOC, prohibits companies from discriminating against employees for any reason. Allegations of discrimination in the workplace, if proved, could result in financial penalties. The EEOC website at w-w-w dot e-e-o-c dot gov provides information about employment laws and ways to avoid discrimination for both employers and employees. A complete understanding of cultural diversity is essential for successful operations. Mandatory diversity training for managers should be part of a developmental learning process. By staying current with federal guidelines governing employment discrimination and the importance of cultural diversity, managers become equipped to handle conflicts that may stem from cultural differences. Managers with this understanding can also improve employee relations and retention. Cultural diversity training and education supports customer service efforts as well. Providing quality care across many cultures requires a solid understanding of what different cultures consider appropriate behavior. Diversity training helps agencies understand what barriers affect key patient relationships and how to improve communication between employees and their patients. Prevention and education are fundamental. You may need to communicate differently with patients and coworkers from other cultures. Some cultures do not openly praise people in front of others, preferring private recognition. You may need to learn about cultural differences to build trust and avoid giving offense. Training should be frequent and thorough. Extra time may be needed covering areas like harassment and professional behavior so all employees are clear about expectations. Cultural diversity training helps employees improve performance by creating a workplace free of judgments and stereotypes. Educational activities about cultural variations provide a level of understanding about other cultures that employees may not have had before.`, 2),
    challenge: {
      challengeId: 'M01-C03',
      lessonId: 'M01-P04',
      moduleId: 'ACHC-ART-M01',
      title: 'Discrimination Awareness in the Field',
      scenario: 'You notice that a patient consistently requests not to be seen by a specific coworker. When you ask why, the patient says it is because of the coworker\'s ethnicity.',
      narrationText: 'Consider this field scenario. You notice that a patient consistently requests not to be seen by a specific coworker. When you ask why, the patient says it is because of the coworker\'s ethnicity. What is the appropriate response?',
      prompt: 'How do you handle a patient expressing ethnic preference for caregiver assignment?',
      interactionType: 'escalation-decision',
      options: [
        createChallengeOption('a', 'Honor the patient\'s request immediately and reassign without discussing it further.', 'While patients have the right to choose providers, accommodating requests based solely on ethnic discrimination without reporting it normalizes discriminatory behavior. The situation must be reported to your supervisor.', false),
        createChallengeOption('b', 'Inform the patient that your agency provides care regardless of staff ethnicity, document the request, and report the situation to your supervisor for guidance.', 'Correct. The agency provides care without discrimination. While respecting patient rights, you must document discriminatory requests and escalate to your supervisor. The agency policy will guide next steps.', true),
        createChallengeOption('c', 'Confront the patient about their discriminatory attitude and refuse to provide care.', 'Confronting the patient aggressively is not professional and does not resolve the issue. Document and escalate — let your supervisor and agency policy guide the response.', false),
      ],
      bestPracticeAnswer: 'Inform patient of non-discrimination policy, document, and report to supervisor.',
      teachingPoint: 'Discriminatory requests must be documented and escalated. The agency serves all patients equally and does not reassign staff based on ethnicity. Your supervisor will determine the appropriate response.',
      documentationPrompt: 'Document the patient\'s statement, your response, and that you reported the incident to your supervisor. Include date and time.',
      escalationPrompt: 'Notify your supervisor immediately. Do not make reassignment decisions based on discriminatory requests on your own.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true,
      graded: false,
      countsTowardFinalScore: false,
      reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // PAGE 5: Resolving Cultural Communication & Agency Policy
  {
    pageId: 'M01-P05',
    moduleId: 'ACHC-ART-M01',
    pageType: 'instruction',
    title: 'Resolving Cultural Communication & Agency Policy',
    narrationText: `Resolving communication problems caused by cultural differences requires patience, understanding, and respect. A major mistake is forming opinions before even engaging in communication. Opinions reached before an opportunity to discuss the matter make resolving conflict difficult. Treating people as individuals regardless of culture is often the key to resolving communication issues. For example, it is improper to assume that a person takes a certain position on a subject because of their gender, ethnicity, or background. Such generalizations can cause conflict. Learning more about other lifestyles and cultures helps people avoid conflict in communication. Open and honest discussions about cultural differences with friends and colleagues are helpful. Conflict in communication between cultures is avoidable when all parties resist assigning blame. Simply placing blame on others is not constructive and can make communication problems worse. Focus on listening well with an open mind. Pay close attention to words used in conversation and the context and tone of the discussion. Now let us review your agency's cultural diversity policy. Your agency provides care to patients and families regardless of their cultural background and beliefs. Cultural considerations for all patients shall be respected and observed. Where such considerations impede the provision of prescribed healthcare or treatment, personnel shall notify the supervisor and physician to accommodate the patient. Different cultural backgrounds, beliefs, and religions impact the patient's lifestyles, habits, and view of health and healing. You must be able to identify differences between your own beliefs and the patient's beliefs and find ways to support the patient. Upon admission, staff will identify the patient's individual beliefs based on their cultural background and develop the plan of care accordingly. The agency will not assign personnel unwilling to comply with agency policy due to cultural values or religious beliefs to situations where their actions may conflict with prescribed treatment or patient needs. Cultural diversity training is completed for all employees at orientation and annually thereafter.`,
    contentHtml: `<h3>Resolving Cultural Communication</h3><ul><li><strong>Respect:</strong> Treat people as individuals — avoid generalizations</li><li><strong>Knowledge:</strong> Learn about other cultures through reading, discussion</li><li><strong>Blame:</strong> Resist assigning blame — it worsens communication</li><li><strong>Listening:</strong> Focus on words, context, and tone with an open mind</li></ul><h3>Agency Cultural Diversity Policy</h3><ul><li>Care provided regardless of cultural background</li><li>Cultural considerations respected and observed</li><li>If cultural practices impede prescribed care → notify supervisor and physician</li><li>Staff identifies patient beliefs at admission → incorporates into care plan</li><li>Staff not willing to comply due to personal beliefs will not be assigned to conflicting situations</li><li>Training: orientation and annually</li></ul>`,
    media: createMedia(
      'Illustration of a home health nurse sitting with an elderly patient in a warm, culturally decorated living room. The nurse is listening attentively with an open posture. Cultural items like family photos, religious symbols, and traditional decor are visible. Respectful, warm atmosphere.',
      '10-second 720p video: A field worker enters a patient home, notices religious and cultural items, pauses to acknowledge the patient respectfully, and sits at eye level to begin conversation. Text overlay: "Respect · Listen · Learn." Warm lighting, gentle pacing.',
      'image', 'beforeNarration',
      'Display image of culturally sensitive home visit to reinforce the concept of respecting patient environment and beliefs.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P05', 'instruction', 'Resolving Cultural Communication & Agency Policy',
      `Resolving communication problems caused by cultural differences requires patience, understanding, and respect. A major mistake is forming opinions before even engaging in communication. Opinions reached before an opportunity to discuss the matter make resolving conflict difficult. Treating people as individuals regardless of culture is often the key to resolving communication issues. For example, it is improper to assume that a person takes a certain position on a subject because of their gender, ethnicity, or background. Such generalizations can cause conflict. Learning more about other lifestyles and cultures helps people avoid conflict in communication. Open and honest discussions about cultural differences with friends and colleagues are helpful. Conflict in communication between cultures is avoidable when all parties resist assigning blame. Simply placing blame on others is not constructive and can make communication problems worse. Focus on listening well with an open mind. Pay close attention to words used in conversation and the context and tone of the discussion. Now let us review your agency's cultural diversity policy. Your agency provides care to patients and families regardless of their cultural background and beliefs. Cultural considerations for all patients shall be respected and observed. Where such considerations impede the provision of prescribed healthcare or treatment, personnel shall notify the supervisor and physician to accommodate the patient. Different cultural backgrounds, beliefs, and religions impact the patient's lifestyles, habits, and view of health and healing. You must be able to identify differences between your own beliefs and the patient's beliefs and find ways to support the patient. Upon admission, staff will identify the patient's individual beliefs based on their cultural background and develop the plan of care accordingly. The agency will not assign personnel unwilling to comply with agency policy due to cultural values or religious beliefs to situations where their actions may conflict with prescribed treatment or patient needs. Cultural diversity training is completed for all employees at orientation and annually thereafter.`, 2),
    challenge: {
      challengeId: 'M01-C04',
      lessonId: 'M01-P05',
      moduleId: 'ACHC-ART-M01',
      title: 'Cultural Practice vs. Prescribed Treatment',
      scenario: 'Mr. Alvarez, your patient, tells you he has been drinking a traditional herbal tea instead of taking his prescribed blood pressure medication because his family believes the tea is more natural and effective.',
      narrationText: 'Here is a scenario about cultural practices and prescribed treatment. Mr. Alvarez tells you he has been drinking a traditional herbal tea instead of taking his prescribed blood pressure medication because his family believes the tea is more natural and effective. What is the best approach?',
      prompt: 'How do you handle a cultural health practice conflicting with prescribed treatment?',
      interactionType: 'scenario-decision',
      options: [
        createChallengeOption('a', 'Tell Mr. Alvarez that his herbal tea is ineffective and he must take his medication immediately.', 'Dismissing a patient\'s cultural beliefs is disrespectful and may cause the patient to lose trust and disengage from care entirely. A culturally competent approach acknowledges the belief while educating about medical necessity.', false),
        createChallengeOption('b', 'Acknowledge the importance of his cultural practice, educate him about why the prescribed medication is medically necessary, use teach-back to confirm understanding, document the conversation, and notify the physician and supervisor.', 'Correct. Respecting cultural beliefs while providing evidence-based education is the cornerstone of culturally competent care. Document the cultural consideration and involve the physician for collaborative decision-making.', true),
        createChallengeOption('c', 'Say nothing and document that he is non-compliant with medication.', 'Simply labeling a patient non-compliant without attempting culturally sensitive education fails the patient. You have a responsibility to bridge the gap between cultural beliefs and medical treatment.', false),
        createChallengeOption('d', 'Tell him the tea is fine and not to worry about the medication.', 'Uncontrolled blood pressure is dangerous. Agreeing with a practice that replaces medically necessary treatment puts the patient at risk. Your role is to educate, not to validate unsafe alternatives.', false),
      ],
      bestPracticeAnswer: 'Acknowledge the cultural practice, educate with respect, use teach-back, document, and notify physician.',
      teachingPoint: 'When cultural practices impede prescribed treatment, the agency policy requires you to respect the patient while educating about medical necessity, then notify the supervisor and physician.',
      documentationPrompt: 'Document: patient\'s cultural health practice identified, education provided regarding prescribed medication, teach-back completed, physician and supervisor notified.',
      escalationPrompt: 'Notify supervisor and physician when cultural practices conflict with the prescribed plan of care.',
      estimatedInteractionMinutes: 5,
      requiredForProgression: true,
      graded: false,
      countsTowardFinalScore: false,
      reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // PAGE 6: Teach-Back Method & Patient Preferences
  {
    pageId: 'M01-P06',
    moduleId: 'ACHC-ART-M01',
    pageType: 'instruction',
    title: 'Teach-Back Method & Patient Preferences',
    narrationText: `The teach-back method is one of the most important tools in culturally competent care. Teach-back means asking the patient to repeat back, in their own words, what you have just taught them. This is not a test of the patient — it is a test of how well you communicated. If the patient cannot accurately repeat the key information, it means you need to try a different approach. Here is how to use teach-back effectively. After explaining a procedure, medication, or care instruction, say something like: I want to make sure I explained that clearly. Can you tell me in your own words what you will do when you change your dressing? Or: Can you show me how you will measure your blood sugar? This approach is especially critical when working across cultural and language barriers. A patient who nods and says yes may not actually understand. Teach-back gives you a concrete way to verify comprehension. Patient preferences must also be respected. Upon admission, your agency identifies the patient's individual beliefs based on their cultural background and develops the plan of care accordingly. This means asking questions about food preferences, modesty requirements, religious practices that affect scheduling or treatment, family involvement in care decisions, and preferred communication styles. Document all cultural preferences in the clinical record so that every team member who visits the patient is aware. Remember the key principle: clients are to receive the best quality care without regard to race, creed, nationality, origin, lifestyle choice, and diagnosis. The client or caregiver always has the right to refuse care. Privacy, including protection of protected health information, is paramount. The client must be informed of charges prior to initiating service. The client has the right to be safe and to be treated with respect.`,
    contentHtml: `<h3>Teach-Back Method</h3><ul><li>Ask the patient to repeat back key information in their own words</li><li>This tests your communication, not the patient's intelligence</li><li>If they cannot repeat it, try a different approach</li><li>Especially critical across cultural and language barriers</li></ul><h3>Examples</h3><ul><li>"Can you tell me in your own words what you will do when you change your dressing?"</li><li>"Can you show me how you will measure your blood sugar?"</li></ul><h3>Patient Preferences</h3><ul><li>Food preferences and dietary restrictions</li><li>Modesty requirements</li><li>Religious practices affecting scheduling or treatment</li><li>Family involvement in care decisions</li><li>Communication style preferences</li></ul><p><strong>Document all cultural preferences in the clinical record.</strong></p>`,
    media: createMedia(
      'Illustration of a nurse using the teach-back method with a patient at a kitchen table. The patient is demonstrating how to use a blood glucose monitor while the nurse watches and nods encouragingly. Simple, clear educational illustration. No PHI visible.',
      '10-second 720p video: Close-up of a nurse handing a patient a demonstration dressing kit. Patient carefully opens the kit and begins to repeat the steps shown. Nurse smiles and gives a thumbs-up. Text overlay: "Teach-Back: Confirm Understanding." Warm, supportive tone.',
      'image', 'duringNarration',
      'Display teach-back illustration alongside narration to model the technique visually.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P06', 'instruction', 'Teach-Back Method & Patient Preferences',
      `The teach-back method is one of the most important tools in culturally competent care. Teach-back means asking the patient to repeat back, in their own words, what you have just taught them. This is not a test of the patient — it is a test of how well you communicated. If the patient cannot accurately repeat the key information, it means you need to try a different approach. Here is how to use teach-back effectively. After explaining a procedure, medication, or care instruction, say something like: I want to make sure I explained that clearly. Can you tell me in your own words what you will do when you change your dressing? Or: Can you show me how you will measure your blood sugar? This approach is especially critical when working across cultural and language barriers. A patient who nods and says yes may not actually understand. Teach-back gives you a concrete way to verify comprehension. Patient preferences must also be respected. Upon admission, your agency identifies the patient's individual beliefs based on their cultural background and develops the plan of care accordingly. This means asking questions about food preferences, modesty requirements, religious practices that affect scheduling or treatment, family involvement in care decisions, and preferred communication styles. Document all cultural preferences in the clinical record so that every team member who visits the patient is aware. Remember the key principle: clients are to receive the best quality care without regard to race, creed, nationality, origin, lifestyle choice, and diagnosis. The client or caregiver always has the right to refuse care. Privacy, including protection of protected health information, is paramount. The client must be informed of charges prior to initiating service. The client has the right to be safe and to be treated with respect.`, 2),
    challenge: {
      challengeId: 'M01-C05',
      lessonId: 'M01-P06',
      moduleId: 'ACHC-ART-M01',
      title: 'Teach-Back in Practice',
      scenario: 'You have just taught Mrs. Park, a Korean-speaking patient with limited English, how to take her new medication. You used a phone interpreter during the teaching. Mrs. Park nods and smiles when you ask if she understands.',
      narrationText: 'You have just taught Mrs. Park, a Korean-speaking patient with limited English, how to take her new medication using a phone interpreter. She nods and smiles when you ask if she understands. What should you do next?',
      prompt: 'What is the best way to confirm Mrs. Park understands the medication instructions?',
      interactionType: 'teach-back-practice',
      options: [
        createChallengeOption('a', 'Accept the nod as confirmation and document that teaching was completed and understood.', 'A nod does not confirm comprehension, especially across language barriers. Cultural norms in many Asian cultures include nodding as a sign of politeness, not necessarily understanding.', false),
        createChallengeOption('b', 'Through the interpreter, ask Mrs. Park to tell you in her own words when she will take the medication, how much she will take, and what she should do if she misses a dose.', 'Correct. Using teach-back through the interpreter gives you a concrete verification of comprehension. If she cannot accurately repeat the information, reteach using simpler language or visual aids.', true),
        createChallengeOption('c', 'Leave written instructions in English and assume the family will translate later.', 'Leaving English-only instructions for a patient with limited English is unsafe. The patient may not have a family member available or qualified to translate medical instructions accurately.', false),
      ],
      bestPracticeAnswer: 'Use teach-back through the interpreter to verify comprehension.',
      teachingPoint: 'A nod or smile is not confirmation of understanding. Always use teach-back, especially with patients who have limited English proficiency, to verify that the teaching was effective.',
      documentationPrompt: 'Document: teaching provided via qualified interpreter, teach-back method used, patient able/unable to demonstrate understanding, follow-up plan if reteaching needed.',
      escalationPrompt: 'If the patient cannot demonstrate understanding after multiple attempts, notify your supervisor and the physician to discuss alternative teaching strategies.',
      estimatedInteractionMinutes: 3,
      requiredForProgression: true,
      graded: false,
      countsTowardFinalScore: false,
      reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // PAGE 7: Bias, Mentoring & Leadership
  {
    pageId: 'M01-P07',
    moduleId: 'ACHC-ART-M01',
    pageType: 'instruction',
    title: 'Bias, Mentoring & Leadership Responsibility',
    narrationText: `Bias is a natural human tendency, but in healthcare, unchecked bias can harm patients and colleagues. Bias can be explicit — where a person is aware of and intentional about their prejudice — or implicit, where assumptions operate below conscious awareness. In home health, bias might manifest as making assumptions about a patient's adherence to treatment based on their ethnicity, assuming a patient's pain level based on their cultural background, or treating patients differently based on their socioeconomic status. Recognizing your own biases is the first step to providing equitable care. When you notice yourself making assumptions about a patient, pause and ask: Is this based on the individual in front of me, or on a generalization? Your agency encourages the use of mentoring to support cultural integration. Some workers adapt more easily to a diverse work culture than others. These individuals can fill a valuable role as mentors, paired with workers from different cultures to provide training and help with assimilation. Finding common ground in an environment rich with varying opinions and perspectives can be challenging. Education initiatives that teach employees how to succeed across a multicultural workforce directly support diversity efforts. The business owner, the administrator, and managers bear the ultimate responsibility for developing a more diverse work culture. Strong leadership during adjustment periods — demonstrating commitment to diversity and including everyone — increases the chance of success. Supervisors must manage diverse perspectives of workers and patients. They are obligated to treat their people equally but sometimes fall short of communicating effectively across diverse backgrounds. Training that focuses on managing a diverse workforce helps supervisors connect with all team members and include every worker in activities that support the agency's mission. Remember: if you show leadership by respecting every individual, your colleagues and patients will follow that example.`,
    contentHtml: `<h3>Understanding Bias</h3><ul><li><strong>Explicit bias:</strong> Conscious, intentional prejudice</li><li><strong>Implicit bias:</strong> Unconscious assumptions that operate below awareness</li><li>In home health: assumptions about adherence, pain, compliance based on culture</li></ul><h3>Self-Check</h3><p>"Is my assumption based on this individual, or on a generalization?"</p><h3>Mentoring</h3><ul><li>Pair workers from different cultures with mentors</li><li>Help with cultural assimilation and professional integration</li></ul><h3>Leadership Responsibility</h3><ul><li>Administrators and managers bear ultimate responsibility for diversity culture</li><li>Demonstrate commitment to diversity by including everyone</li><li>Supervisors must treat all employees equally and communicate effectively across differences</li></ul>`,
    media: createMedia(
      'Professional photograph of a senior home health worker mentoring a new employee of a different cultural background. They are reviewing a patient chart together in a well-lit office. Both are engaged and collaborative. Warm, professional atmosphere.',
      '10-second 720p video: A supervisor facilitates a brief huddle with a diverse team. Each team member contributes an idea. Supervisor nods and writes on a whiteboard. Text overlay: "Leadership Drives Cultural Competence." Professional, inclusive tone.',
      'image', 'beforeNarration',
      'Display mentoring photograph to illustrate the concept of cross-cultural mentoring and leadership.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P07', 'instruction', 'Bias, Mentoring & Leadership Responsibility',
      `Bias is a natural human tendency, but in healthcare, unchecked bias can harm patients and colleagues. Bias can be explicit — where a person is aware of and intentional about their prejudice — or implicit, where assumptions operate below conscious awareness. In home health, bias might manifest as making assumptions about a patient's adherence to treatment based on their ethnicity, assuming a patient's pain level based on their cultural background, or treating patients differently based on their socioeconomic status. Recognizing your own biases is the first step to providing equitable care. When you notice yourself making assumptions about a patient, pause and ask: Is this based on the individual in front of me, or on a generalization? Your agency encourages the use of mentoring to support cultural integration. Some workers adapt more easily to a diverse work culture than others. These individuals can fill a valuable role as mentors, paired with workers from different cultures to provide training and help with assimilation. Finding common ground in an environment rich with varying opinions and perspectives can be challenging. Education initiatives that teach employees how to succeed across a multicultural workforce directly support diversity efforts. The business owner, the administrator, and managers bear the ultimate responsibility for developing a more diverse work culture. Strong leadership during adjustment periods — demonstrating commitment to diversity and including everyone — increases the chance of success. Supervisors must manage diverse perspectives of workers and patients. They are obligated to treat their people equally but sometimes fall short of communicating effectively across diverse backgrounds. Training that focuses on managing a diverse workforce helps supervisors connect with all team members and include every worker in activities that support the agency's mission. Remember: if you show leadership by respecting every individual, your colleagues and patients will follow that example.`, 2),
    challenge: {
      challengeId: 'M01-C06',
      lessonId: 'M01-P07',
      moduleId: 'ACHC-ART-M01',
      title: 'Identifying Implicit Bias',
      scenario: 'You are assigned to a new patient, Mr. Johnson, who lives in a low-income neighborhood. Before the visit, you find yourself assuming his home will be unsanitary and that he will not be compliant with his care plan.',
      narrationText: 'Before visiting a new patient in a low-income neighborhood, you find yourself assuming his home will be unsanitary and that he will not follow his care plan. Reflect on this situation.',
      prompt: 'What should you do about these assumptions?',
      interactionType: 'identify-the-risk',
      options: [
        createChallengeOption('a', 'Recognize these are implicit biases based on socioeconomic stereotypes. Set them aside, approach Mr. Johnson as an individual, assess the actual home environment objectively, and provide the same quality of care you would to any patient.', 'Correct. Recognizing implicit bias is the first step. Every patient deserves an objective assessment and equal quality of care regardless of their neighborhood or socioeconomic status.', true),
        createChallengeOption('b', 'Request reassignment because you are uncomfortable with the neighborhood.', 'Requesting reassignment based on neighborhood bias denies the patient equal care and does not address your bias. Professional growth requires working through these situations.', false),
        createChallengeOption('c', 'Proceed with the visit but bring extra supplies because patients in that area probably lack basic hygiene items.', 'While having supplies is standard practice, bringing extras based on assumptions about a neighborhood reinforces bias. Assess the actual situation first.', false),
      ],
      bestPracticeAnswer: 'Recognize the implicit bias, set it aside, and assess the patient individually.',
      teachingPoint: 'Implicit bias based on socioeconomic status can lead to unequal care. Always assess each patient individually and provide the same quality of care regardless of their living situation.',
      documentationPrompt: 'Document the home environment assessment objectively based on what you actually observe, not assumptions.',
      escalationPrompt: 'If you encounter an unsafe environment during the visit, report to your supervisor based on actual observed hazards, not preconceptions.',
      estimatedInteractionMinutes: 3,
      requiredForProgression: true,
      graded: false,
      countsTowardFinalScore: false,
      reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // PAGE 8: Scenario Challenge — Cultural Care in the Field
  {
    pageId: 'M01-P08',
    moduleId: 'ACHC-ART-M01',
    pageType: 'scenario-challenge',
    title: 'Field Scenario: Cultural Considerations in Patient Care',
    narrationText: `Let us work through a comprehensive field scenario that brings together the concepts from this module. You are visiting Mrs. Fatima Hassan, a sixty-five-year-old Somali woman who has been admitted for post-surgical wound care. When you arrive, her adult son greets you and tells you that his mother does not speak English and prefers that only a female caregiver provide hands-on care. He also tells you that his mother follows a halal diet and will not eat pork-based gelatin in any medications. Mrs. Hassan has her prayer rug in the living room and appears to have been praying before you arrived. Her son says she prays five times a day. You need to perform a wound assessment, change the dressing, and teach Mrs. Hassan about signs of infection to watch for. Think carefully about how to handle this visit while respecting all cultural and religious considerations, providing complete clinical care, maintaining proper communication through interpretation, and documenting everything appropriately. This scenario requires you to apply CLAS standards, cultural competence, interpreter use, teach-back, documentation, and escalation. Take your time and select the best approach.`,
    contentHtml: `<h3>Comprehensive Field Scenario</h3><p><strong>Patient:</strong> Mrs. Fatima Hassan, 65-year-old Somali woman</p><p><strong>Service:</strong> Post-surgical wound care</p><p><strong>Cultural Factors:</strong></p><ul><li>Does not speak English</li><li>Prefers female-only hands-on care</li><li>Halal diet — no pork-based gelatin in medications</li><li>Prays five times daily</li></ul><p><strong>Clinical Needs:</strong> Wound assessment, dressing change, infection sign teaching</p>`,
    media: createMedia(
      'Illustration of a respectful home health visit. A female nurse waits patiently in a living room while a prayer rug is visible in the foreground. Cultural decorations on the walls. The nurse has her nursing bag and is reviewing a chart. Respectful, non-intrusive atmosphere.',
      '10-second 720p video: A female nurse arrives at a patient home. She waits respectfully as the patient finishes a cultural/religious activity. The nurse then greets the patient warmly through a phone interpreter. Text overlay: "Culturally Competent Field Visit." Calm, respectful pacing.',
      'image', 'beforeNarration',
      'Display illustration of culturally respectful home visit before the scenario narration to set the visual context.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P08', 'scenario-challenge', 'Field Scenario: Cultural Considerations in Patient Care',
      `Let us work through a comprehensive field scenario that brings together the concepts from this module. You are visiting Mrs. Fatima Hassan, a sixty-five-year-old Somali woman who has been admitted for post-surgical wound care. When you arrive, her adult son greets you and tells you that his mother does not speak English and prefers that only a female caregiver provide hands-on care. He also tells you that his mother follows a halal diet and will not eat pork-based gelatin in any medications. Mrs. Hassan has her prayer rug in the living room and appears to have been praying before you arrived. Her son says she prays five times a day. You need to perform a wound assessment, change the dressing, and teach Mrs. Hassan about signs of infection to watch for. Think carefully about how to handle this visit while respecting all cultural and religious considerations, providing complete clinical care, maintaining proper communication through interpretation, and documenting everything appropriately. This scenario requires you to apply CLAS standards, cultural competence, interpreter use, teach-back, documentation, and escalation. Take your time and select the best approach.`, 5),
    challenge: {
      challengeId: 'M01-C07',
      lessonId: 'M01-P08',
      moduleId: 'ACHC-ART-M01',
      title: 'Comprehensive Cultural Care Scenario',
      scenario: 'Mrs. Hassan requires wound care, does not speak English, prefers female caregivers, follows halal diet, and observes five daily prayers. How do you proceed?',
      narrationText: 'How should you approach this visit? Select the most culturally competent and clinically complete approach.',
      prompt: 'What is the best sequence of actions for this culturally complex visit?',
      interactionType: 'sequence-the-steps',
      options: [
        createChallengeOption('a', 'Wait if she is praying. Connect a qualified Somali interpreter by phone. Confirm she is comfortable with you as a female caregiver. Perform wound assessment and dressing change. Teach infection signs through interpreter. Use teach-back to verify understanding. Document all cultural preferences, interpreter use, and clinical findings. Notify pharmacy and physician about halal medication requirements.', 'Correct. This approach respects every cultural and religious consideration while delivering complete clinical care. Waiting for prayer, using a qualified interpreter, confirming caregiver gender preference, providing clinical care, using teach-back, and documenting everything is the gold standard.', true),
        createChallengeOption('b', 'Perform the wound care quickly so you do not interrupt her schedule, use the son to translate, and document the visit as routine.', 'Rushing care, using a family member to translate medical information, and failing to document cultural considerations are all violations of CLAS standards and agency policy.', false),
        createChallengeOption('c', 'Tell the son that you cannot accommodate all these requests and that the patient should come to the clinic instead.', 'Refusing to accommodate reasonable cultural and religious requests is not culturally competent care. Home health must adapt to the patient\'s environment and beliefs within clinical safety limits.', false),
      ],
      bestPracticeAnswer: 'Wait for prayer, use qualified interpreter, confirm gender preference, provide care, teach-back, document all cultural factors, notify pharmacy/physician about dietary restrictions.',
      teachingPoint: 'Culturally competent home health care requires respecting religious practices, using qualified interpreters, confirming patient preferences, delivering clinical care, verifying understanding through teach-back, and documenting everything.',
      documentationPrompt: 'Document: religious accommodations made, interpreter service used (name/ID of service), caregiver gender preference noted, halal dietary requirement flagged for pharmacy/physician, wound assessment findings, dressing change completed, infection signs taught via interpreter, teach-back completed, patient demonstrated understanding.',
      escalationPrompt: 'If cultural accommodations cannot be met (e.g., no female caregiver available), escalate to your supervisor before the visit. Never refuse care — coordinate an alternative.',
      estimatedInteractionMinutes: 5,
      requiredForProgression: true,
      graded: false,
      countsTowardFinalScore: false,
      reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // PAGE 9: Documentation Practice — Cultural Care Documentation
  {
    pageId: 'M01-P09',
    moduleId: 'ACHC-ART-M01',
    pageType: 'documentation-practice',
    title: 'Documentation Practice: Cultural Considerations',
    narrationText: `Proper documentation of cultural considerations is essential for continuity of care. When you document cultural factors, every team member who visits the patient afterward will know how to provide culturally appropriate care. Let us practice documentation. For this exercise, you will consider what needs to be documented for a patient with the following cultural considerations: The patient speaks Haitian Creole as a primary language and has limited English proficiency. The patient practices Vodou and uses traditional herbal remedies alongside prescribed medications. The family matriarch, the patient's grandmother, is the primary decision-maker for healthcare. The patient prefers not to be visited during certain religious observances. When documenting cultural considerations, include the following in every clinical note where cultural factors are relevant. First, document the language barrier and how it was addressed — interpreter used, type of service, and language. Second, document cultural health practices identified and how they were addressed — education provided, physician notified if practices conflict with prescribed care. Third, document the primary decision-maker and how informed consent was obtained through that person. Fourth, document scheduling accommodations made for religious or cultural observances. Fifth, document teach-back results when patient education was provided through an interpreter. Always use objective, respectful language. Never use judgmental terms about a patient's cultural practices. Document what you observed, what you discussed, what the patient or family communicated, and what actions you took. If a cultural practice conflicts with the prescribed plan of care, document that you notified the supervisor and physician.`,
    contentHtml: `<h3>Documentation Practice Exercise</h3><p><strong>Patient Profile:</strong></p><ul><li>Primary language: Haitian Creole (limited English proficiency)</li><li>Cultural practice: Vodou, uses traditional herbal remedies</li><li>Decision-maker: Patient's grandmother (family matriarch)</li><li>Religious scheduling preferences</li></ul><h3>Documentation Requirements</h3><ol><li>Language barrier and interpreter used</li><li>Cultural health practices identified and addressed</li><li>Primary decision-maker and informed consent method</li><li>Scheduling accommodations for religious/cultural observances</li><li>Teach-back results through interpreter</li></ol><h3>Documentation Standards</h3><ul><li>Use objective, respectful language</li><li>Never use judgmental terms</li><li>Document observations, discussions, communications, and actions</li><li>Document supervisor/physician notification if practices conflict with care plan</li></ul>`,
    media: createMedia(
      'Close-up photograph of a healthcare worker writing in a patient chart at a kitchen table. The chart shows a care plan section with a highlighted area labeled "Cultural Considerations." Clean, professional image. No real patient information visible.',
      '10-second 720p video: A nurse\'s hands writing in a clinical chart. Camera zooms to show sections being filled: "Language: Haitian Creole," "Interpreter: Phone service used," "Cultural Practices: Documented." Text overlay: "Document Cultural Factors for Continuity." Professional tone.',
      'image', 'beforeNarration',
      'Display documentation image to anchor the practice exercise in a realistic clinical documentation context.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P09', 'documentation-practice', 'Documentation Practice: Cultural Considerations',
      `Proper documentation of cultural considerations is essential for continuity of care. When you document cultural factors, every team member who visits the patient afterward will know how to provide culturally appropriate care. Let us practice documentation. For this exercise, you will consider what needs to be documented for a patient with the following cultural considerations: The patient speaks Haitian Creole as a primary language and has limited English proficiency. The patient practices Vodou and uses traditional herbal remedies alongside prescribed medications. The family matriarch, the patient's grandmother, is the primary decision-maker for healthcare. The patient prefers not to be visited during certain religious observances. When documenting cultural considerations, include the following in every clinical note where cultural factors are relevant. First, document the language barrier and how it was addressed — interpreter used, type of service, and language. Second, document cultural health practices identified and how they were addressed — education provided, physician notified if practices conflict with prescribed care. Third, document the primary decision-maker and how informed consent was obtained through that person. Fourth, document scheduling accommodations made for religious or cultural observances. Fifth, document teach-back results when patient education was provided through an interpreter. Always use objective, respectful language. Never use judgmental terms about a patient's cultural practices. Document what you observed, what you discussed, what the patient or family communicated, and what actions you took. If a cultural practice conflicts with the prescribed plan of care, document that you notified the supervisor and physician.`, 6),
    challenge: {
      challengeId: 'M01-C08',
      lessonId: 'M01-P09',
      moduleId: 'ACHC-ART-M01',
      title: 'Documentation Selection Exercise',
      scenario: 'You visited Mrs. Deschamps, a Haitian Creole-speaking patient. You used a phone interpreter, identified she uses herbal remedies, obtained consent through her grandmother, and taught wound care via interpreter with teach-back.',
      narrationText: 'After your visit with Mrs. Deschamps, which documentation entry most completely captures the cultural considerations?',
      prompt: 'Select the most complete documentation entry.',
      interactionType: 'documentation-practice',
      options: [
        createChallengeOption('a', '"Visited patient. Wound care completed. Patient speaks Creole."', 'This entry is incomplete. It fails to document interpreter use, cultural practices, decision-maker involvement, teach-back, or any cultural accommodations.', false),
        createChallengeOption('b', '"Visited patient. Haitian Creole interpreter used via Accredited Language Services. Cultural health practices identified: patient uses herbal remedies alongside prescribed medications — physician notified. Informed consent obtained through patient\'s grandmother (identified primary decision-maker). Wound care teaching provided via interpreter. Teach-back completed — patient demonstrated correct dressing change technique through interpreter verification. Visit scheduled around patient\'s religious observance preference."', 'Correct. This entry documents every cultural consideration: language barrier and interpreter, cultural health practice and physician notification, decision-maker, teach-back, and scheduling accommodation. This is the standard for culturally competent documentation.', true),
        createChallengeOption('c', '"Patient uses strange herbal remedies. Had to call interpreter because she doesn\'t speak English. Grandmother runs the show."', 'This entry uses judgmental language ("strange," "runs the show"), which is inappropriate in clinical documentation. Always use objective, respectful terms.', false),
      ],
      bestPracticeAnswer: 'Complete documentation including interpreter, cultural practices, decision-maker, teach-back, and scheduling.',
      teachingPoint: 'Clinical documentation of cultural factors must be complete, objective, and respectful. Every cultural accommodation, interpreter use, and teach-back result should be recorded for continuity of care.',
      documentationPrompt: 'Use this format for every visit with cultural considerations: Language/Interpreter → Cultural practices → Decision-maker → Education/Teach-back → Accommodations → Escalations.',
      escalationPrompt: 'If you are unsure how to document a cultural situation, contact your supervisor before submitting the note.',
      estimatedInteractionMinutes: 5,
      requiredForProgression: true,
      graded: false,
      countsTowardFinalScore: false,
      reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // PAGE 10: Documentation Practice — Escalation
  {
    pageId: 'M01-P10',
    moduleId: 'ACHC-ART-M01',
    pageType: 'documentation-practice',
    title: 'Escalation Procedures for Cultural Conflicts',
    narrationText: `Not every cultural situation can be resolved at the point of care. Some situations require escalation to your supervisor, the physician, or both. Understanding when and how to escalate is critical. You must escalate when a cultural practice directly conflicts with the prescribed plan of care and the patient refuses to follow the medical recommendation despite education. You must escalate when a language barrier prevents safe care and interpreter services are unavailable. You must escalate when a patient or family makes a discriminatory request about staff assignment based on ethnicity. You must escalate when you observe signs of abuse or neglect being attributed to cultural practices. You must escalate when you feel unsafe in a patient's home due to cultural conflicts. The escalation process is straightforward. First, document the situation objectively in the clinical record. Second, contact your supervisor by phone immediately if the situation affects patient safety. Third, do not make independent decisions about discontinuing care or reassigning staff based on cultural conflicts. Fourth, if the physician needs to be involved, your supervisor will coordinate the notification. Fifth, follow up in writing through your agency's standard incident or escalation report. Remember the agency policy: the agency will not assign personnel unwilling to comply with the agency's policy due to cultural values or religious beliefs to situations where their actions may conflict with prescribed treatment or patient needs. This means if your own cultural or religious beliefs conflict with a patient's care needs, you should notify your supervisor rather than providing compromised care. Your agency has a process for handling these situations without disrupting patient care.`,
    contentHtml: `<h3>When to Escalate</h3><ul><li>Cultural practice conflicts with care plan and patient refuses medical recommendation</li><li>Language barrier prevents safe care and no interpreter available</li><li>Discriminatory staff assignment request</li><li>Signs of abuse/neglect attributed to cultural practices</li><li>Feeling unsafe due to cultural conflicts</li></ul><h3>Escalation Process</h3><ol><li>Document the situation objectively in the clinical record</li><li>Contact supervisor by phone immediately if patient safety is affected</li><li>Do not independently discontinue care or reassign staff</li><li>Supervisor coordinates physician notification if needed</li><li>Follow up with written incident/escalation report</li></ol><h3>Personal Cultural Conflicts</h3><p>If your own beliefs conflict with patient care needs, notify your supervisor. The agency will reassign without disrupting patient care.</p>`,
    media: createMedia(
      'Professional photograph of a home health worker on a phone call with a supervisor while sitting in a car outside a patient home. The worker has a clipboard and appears to be reporting a situation. Professional, serious but calm expression.',
      '10-second 720p video: A field worker steps outside a patient home, takes out a phone, and calls the supervisor. Text overlay shows the escalation steps: "1. Document 2. Call Supervisor 3. Follow Written Process." Calm, professional tone.',
      'image', 'beforeNarration',
      'Display image of field worker calling supervisor to illustrate the escalation process in a realistic setting.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P10', 'documentation-practice', 'Escalation Procedures for Cultural Conflicts',
      `Not every cultural situation can be resolved at the point of care. Some situations require escalation to your supervisor, the physician, or both. Understanding when and how to escalate is critical. You must escalate when a cultural practice directly conflicts with the prescribed plan of care and the patient refuses to follow the medical recommendation despite education. You must escalate when a language barrier prevents safe care and interpreter services are unavailable. You must escalate when a patient or family makes a discriminatory request about staff assignment based on ethnicity. You must escalate when you observe signs of abuse or neglect being attributed to cultural practices. You must escalate when you feel unsafe in a patient's home due to cultural conflicts. The escalation process is straightforward. First, document the situation objectively in the clinical record. Second, contact your supervisor by phone immediately if the situation affects patient safety. Third, do not make independent decisions about discontinuing care or reassigning staff based on cultural conflicts. Fourth, if the physician needs to be involved, your supervisor will coordinate the notification. Fifth, follow up in writing through your agency's standard incident or escalation report. Remember the agency policy: the agency will not assign personnel unwilling to comply with the agency's policy due to cultural values or religious beliefs to situations where their actions may conflict with prescribed treatment or patient needs. This means if your own cultural or religious beliefs conflict with a patient's care needs, you should notify your supervisor rather than providing compromised care. Your agency has a process for handling these situations without disrupting patient care.`, 4),
    challenge: {
      challengeId: 'M01-C09',
      lessonId: 'M01-P10',
      moduleId: 'ACHC-ART-M01',
      title: 'Escalation Decision',
      scenario: 'You are a male nurse assigned to visit Mrs. Al-Rashid, a Muslim patient whose family has informed the agency that she can only receive hands-on care from female staff. No female nurse is available today, and the patient needs a scheduled insulin injection.',
      narrationText: 'You are a male nurse assigned to a patient whose family requires female-only hands-on care. No female nurse is available today, and the patient needs a scheduled insulin injection. What is the best course of action?',
      prompt: 'How do you handle this gender-specific care request when no alternative staff is available?',
      interactionType: 'escalation-decision',
      options: [
        createChallengeOption('a', 'Skip the visit and reschedule for when a female nurse is available.', 'Skipping a medically necessary insulin injection without authorization is unsafe. You must escalate to your supervisor to determine the appropriate clinical response, which may include having a female family member assist under your verbal guidance.', false),
        createChallengeOption('b', 'Call your supervisor immediately, explain the cultural accommodation need and the clinical urgency, and request guidance — which may include telephone orders for the family to assist under clinical direction, rescheduling with a female staff member within a safe timeframe, or other accommodations.', 'Correct. Escalating to your supervisor allows for a coordinated response that respects the cultural requirement while ensuring patient safety. The supervisor may arrange alternative approaches within clinical safety parameters.', true),
        createChallengeOption('c', 'Explain to the family that medical care overrides cultural preferences and administer the injection.', 'Overriding a cultural preference without attempting accommodation violates CLAS standards and agency policy. Escalation is required to find a solution that respects both clinical need and cultural values.', false),
      ],
      bestPracticeAnswer: 'Escalate to supervisor immediately for coordinated response.',
      teachingPoint: 'When cultural accommodations conflict with clinical urgency, escalate to your supervisor rather than making unilateral decisions. The goal is to find a solution that respects both the cultural requirement and the clinical need.',
      documentationPrompt: 'Document: cultural accommodation identified, clinical need, escalation to supervisor with date/time, resolution determined by supervisor, and outcome.',
      escalationPrompt: 'This situation requires immediate supervisor notification. Do not skip medically necessary care or override cultural preferences without authorization.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true,
      graded: false,
      countsTowardFinalScore: false,
      reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // PAGE 11: Pre-Assessment
  {
    pageId: 'M01-P11',
    moduleId: 'ACHC-ART-M01',
    pageType: 'pre-assessment',
    title: 'Pre-Assessment: Cultural Awareness',
    narrationText: `Before we proceed to the final assessment, let us check your understanding with a brief pre-assessment. This pre-assessment contains six questions based on the material covered in this module. This is not graded and does not count toward your final score, but it will help you identify areas where you may need to review before taking the graded final assessment. Answer each question to the best of your ability. You will receive immediate feedback and rationale for each answer.`,
    contentHtml: `<h3>Pre-Assessment: Cultural Awareness</h3><p>6 questions · Not graded · Immediate feedback provided</p><p>This pre-assessment helps you identify areas to review before the graded final assessment.</p>`,
    media: createMedia(
      'Clean illustration of a clipboard with a checklist and a pencil. Header reads "Pre-Assessment." Professional, simple design on a light background.',
      '10-second 720p video: Animated checklist being filled in with checkmarks. Each item reveals text briefly: "CLAS Standards ✓," "Interpreter Use ✓," "Teach-Back ✓," "Documentation ✓." Text overlay: "Check Your Knowledge." Clean, motivating tone.',
      'image', 'beforeNarration',
      'Display pre-assessment clipboard image to signal the transition from instruction to knowledge verification.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P11', 'pre-assessment', 'Pre-Assessment: Cultural Awareness',
      `Before we proceed to the final assessment, let us check your understanding with a brief pre-assessment. This pre-assessment contains six questions based on the material covered in this module. This is not graded and does not count toward your final score, but it will help you identify areas where you may need to review before taking the graded final assessment. Answer each question to the best of your ability. You will receive immediate feedback and rationale for each answer.`, 8),
    assessmentQuestions: [
      {
        questionId: 'M01-PRE-Q01', moduleId: 'ACHC-ART-M01',
        questionText: 'What federal standards require healthcare professionals to receive cultural competence training?',
        options: [
          createOption('a', 'OSHA Standards', false, 'OSHA addresses workplace safety, not cultural competence training requirements.'),
          createOption('b', 'CLAS Standards (National Standards for Culturally and Linguistically Appropriate Services)', true, 'Correct. CLAS standards, introduced by HHS Office of Minority Health in 2000 and adopted by the Joint Commission and CMS, require cultural competence training.'),
          createOption('c', 'HIPAA Standards', false, 'HIPAA addresses privacy and security of health information, not cultural competence.'),
          createOption('d', 'FDA Standards', false, 'FDA regulates food, drugs, and medical devices, not cultural competence training.'),
        ],
        mappedObjective: 'Identify CLAS standards as the foundation for cultural competence in healthcare',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M01-PRE-Q02', moduleId: 'ACHC-ART-M01',
        questionText: 'According to agency policy, what should you do when a patient\'s cultural practice impedes prescribed healthcare?',
        options: [
          createOption('a', 'Ignore the cultural practice and administer care as prescribed', false, 'Ignoring cultural practices violates CLAS standards and agency policy. Accommodation should be attempted.'),
          createOption('b', 'Notify the supervisor and physician in an effort to accommodate the patient', true, 'Correct. Agency policy states: where cultural considerations impede prescribed healthcare, personnel shall notify the supervisor and physician to accommodate the patient.'),
          createOption('c', 'Refuse to provide care until the patient abandons the cultural practice', false, 'Refusing care is not appropriate. The agency has a process for accommodation.'),
          createOption('d', 'Document the practice and take no further action', false, 'Documentation alone is insufficient when cultural practices affect the care plan. Escalation is required.'),
        ],
        mappedObjective: 'Apply agency cultural diversity policy when cultural practices conflict with care',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M01-PRE-Q03', moduleId: 'ACHC-ART-M01',
        questionText: 'What is the primary purpose of the teach-back method?',
        options: [
          createOption('a', 'To test the patient\'s intelligence', false, 'Teach-back is not a test of the patient. It tests the effectiveness of your communication.'),
          createOption('b', 'To verify that your communication was effective by having the patient repeat information in their own words', true, 'Correct. Teach-back tests how well you communicated, not how smart the patient is.'),
          createOption('c', 'To save time during the visit', false, 'Teach-back actually adds time but ensures safer, more effective care.'),
          createOption('d', 'To document that education was provided', false, 'While teach-back results should be documented, the primary purpose is verifying comprehension.'),
        ],
        mappedObjective: 'Use teach-back method to verify patient comprehension across cultural barriers',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M01-PRE-Q04', moduleId: 'ACHC-ART-M01',
        questionText: 'Why should family members generally not be used as medical interpreters?',
        options: [
          createOption('a', 'They may lack medical vocabulary, may filter information, and confidentiality can be compromised', true, 'Correct. Family members lack formal medical interpretation training, may filter sensitive information, and using them compromises patient confidentiality.'),
          createOption('b', 'They are not allowed by law to interpret', false, 'There is no absolute law prohibiting family interpretation, but CLAS standards and agency policy require qualified interpreters for medical communication.'),
          createOption('c', 'They are always biased against the patient', false, 'Family members are not necessarily biased, but they lack training and objectivity needed for medical interpretation.'),
          createOption('d', 'They charge too much for interpretation', false, 'Family members do not charge, but the issue is accuracy and confidentiality, not cost.'),
        ],
        mappedObjective: 'Explain why qualified interpreter services are required over family member translation',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M01-PRE-Q05', moduleId: 'ACHC-ART-M01',
        questionText: 'Cultural differences in the workplace extend beyond ethnicity to include:',
        options: [
          createOption('a', 'Religious views only', false, 'Religious views are one factor, but cultural differences include many more dimensions.'),
          createOption('b', 'Religious views, sexuality, geographical differences, generational differences, and education', true, 'Correct. Cultural differences extend to religious views, sexuality, geography, generation, education, and many other factors.'),
          createOption('c', 'Only race and gender', false, 'Race and gender are important but cultural differences encompass many additional dimensions.'),
          createOption('d', 'Income level only', false, 'Income is one factor but cultural differences are much broader.'),
        ],
        mappedObjective: 'Recognize the multiple dimensions of cultural diversity',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M01-PRE-Q06', moduleId: 'ACHC-ART-M01',
        questionText: 'When should cultural diversity training be completed?',
        options: [
          createOption('a', 'Only when problems arise', false, 'Training is proactive, not reactive. It must occur at specific intervals.'),
          createOption('b', 'At orientation and annually thereafter', true, 'Correct. Agency policy requires cultural diversity training at time of orientation and annually thereafter.'),
          createOption('c', 'Only during the first year of employment', false, 'Cultural competence requires ongoing training, not one-time education.'),
          createOption('d', 'Every five years', false, 'Annual training is required, not every five years.'),
        ],
        mappedObjective: 'Identify the required timing for cultural diversity training',
        source: 'supplemental', reviewRequired: false,
      },
    ],
    requiredForCompletion: true,
  },
  // PAGE 12: Final Assessment
  {
    pageId: 'M01-P12',
    moduleId: 'ACHC-ART-M01',
    pageType: 'final-assessment',
    title: 'Final Assessment: Cultural Awareness',
    narrationText: `You have now reached the final graded assessment for Module One: Cultural Awareness. This assessment contains twelve questions. You must score at least eighty percent, which means ten out of twelve correct, to pass. If you do not pass, you will be directed to a remediation page to review the learning objectives you missed, and then you may retake the assessment. Read each question carefully and select the best answer. Your score will be recorded on your transcript. Good luck.`,
    contentHtml: `<h3>Final Assessment: Cultural Awareness</h3><p><strong>12 questions · Passing score: 80% (10/12) · Graded</strong></p><p>Your score will be recorded on your training transcript.</p>`,
    media: createMedia(
      'Professional illustration of a formal assessment document with a seal and scoring rubric. Clean, official design. Header: "Final Assessment." No identifying information.',
      '10-second 720p video: An animated assessment form fills in as questions appear. A progress bar advances. At the end, a score appears with a green checkmark. Text overlay: "Final Assessment — 80% Required." Professional, focused tone.',
      'image', 'beforeNarration',
      'Display formal assessment image to signal the graded nature of this section.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P12', 'final-assessment', 'Final Assessment: Cultural Awareness',
      `You have now reached the final graded assessment for Module One: Cultural Awareness. This assessment contains twelve questions. You must score at least eighty percent, which means ten out of twelve correct, to pass. If you do not pass, you will be directed to a remediation page to review the learning objectives you missed, and then you may retake the assessment. Read each question carefully and select the best answer. Your score will be recorded on your transcript. Good luck.`, 15),
    assessmentQuestions: [
      // Q1 — From provided post test: "Cultural differences are not limited to ethnicity..."
      {
        questionId: 'M01-FIN-Q01', moduleId: 'ACHC-ART-M01',
        questionText: 'Cultural differences are not limited to ethnicity and race relations; they extend to areas of religious views, sexuality, and even differences in geographical differences pertaining to the location of one\'s upbringing.',
        options: [
          createOption('a', 'True', true, 'Correct. Cultural differences encompass religion, sexuality, geography, generation, education, and many other factors beyond ethnicity and race.'),
          createOption('b', 'False', false, 'Incorrect. Cultural differences do extend well beyond ethnicity and race to include religious views, sexuality, geographic background, and more.'),
        ],
        mappedObjective: 'Recognize the multiple dimensions of cultural diversity',
        source: 'provided', reviewRequired: false,
      },
      // Q2 — From provided post test: "Where an employee lives..."
      {
        questionId: 'M01-FIN-Q02', moduleId: 'ACHC-ART-M01',
        questionText: 'Where an employee lives or has lived can contribute to cultural differences in the workplace.',
        options: [
          createOption('a', 'True', true, 'Correct. Geographic background influences work pace, communication style, and professional expectations.'),
          createOption('b', 'False', false, 'Incorrect. Personal background and geography do contribute to workplace cultural differences.'),
        ],
        mappedObjective: 'Identify how personal background contributes to cultural differences',
        source: 'provided', reviewRequired: false,
      },
      // Q3 — From provided post test: "What federal agency prohibits..."
      {
        questionId: 'M01-FIN-Q03', moduleId: 'ACHC-ART-M01',
        questionText: 'What federal agency prohibits companies from discriminating against employees for any reason?',
        options: [
          createOption('a', 'OSHA', false, 'OSHA focuses on workplace safety, not employment discrimination law enforcement.'),
          createOption('b', 'CMS', false, 'CMS administers Medicare/Medicaid programs, not employment discrimination enforcement.'),
          createOption('c', 'U.S. Equal Employment Opportunity Commission', true, 'Correct. The EEOC prohibits companies from discriminating against employees for any reason.'),
          createOption('d', 'All of the above', false, 'Only the EEOC specifically prohibits employment discrimination.'),
        ],
        mappedObjective: 'Identify the EEOC as the federal agency enforcing employment discrimination law',
        source: 'provided', reviewRequired: false,
      },
      // Q4-Q12: Supplemental questions covering remaining objectives
      {
        questionId: 'M01-FIN-Q04', moduleId: 'ACHC-ART-M01',
        questionText: 'When were the CLAS standards first introduced by the Department of Health and Human Services Office of Minority Health?',
        options: [
          createOption('a', '1996', false, 'HIPAA was passed in 1996. CLAS was introduced in 2000.'),
          createOption('b', '2000', true, 'Correct. CLAS standards were first introduced in 2000 and updated in 2010.'),
          createOption('c', '2010', false, '2010 was the update year. The original introduction was 2000.'),
          createOption('d', '2015', false, 'CLAS was introduced in 2000, well before 2015.'),
        ],
        mappedObjective: 'Identify the history and timeline of CLAS standards',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M01-FIN-Q05', moduleId: 'ACHC-ART-M01',
        questionText: 'According to agency policy, when should cultural diversity training be completed?',
        options: [
          createOption('a', 'At time of orientation only', false, 'Training is required at orientation AND annually thereafter.'),
          createOption('b', 'At time of orientation and annually thereafter', true, 'Correct. Agency policy requires cultural diversity training at orientation and annually.'),
          createOption('c', 'Every two years', false, 'Annual training is required, not biennial.'),
          createOption('d', 'Only when a cultural incident occurs', false, 'Training is proactive and scheduled, not reactive to incidents.'),
        ],
        mappedObjective: 'Identify agency training requirements for cultural diversity',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M01-FIN-Q06', moduleId: 'ACHC-ART-M01',
        questionText: 'Which of the following best describes "cultural competence" in healthcare?',
        options: [
          createOption('a', 'The ability to speak multiple languages', false, 'Language ability is helpful but cultural competence is much broader than language skills.'),
          createOption('b', 'The quality of day-to-day interactions between healthcare providers and patients that respects cultural differences', true, 'Correct. Cultural competence affects patients directly through the quality of interactions, communication, and respect for cultural beliefs.'),
          createOption('c', 'Having employees of different nationalities on staff', false, 'Having diverse staff is workforce diversity, not cultural competence.'),
          createOption('d', 'Following the same care procedures for everyone regardless of culture', false, 'Culturally competent care adapts to individual cultural needs — it is not one-size-fits-all.'),
        ],
        mappedObjective: 'Define cultural competence and distinguish it from workforce diversity',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M01-FIN-Q07', moduleId: 'ACHC-ART-M01',
        questionText: 'What should you do when a patient\'s cultural practice impedes their prescribed healthcare treatment?',
        options: [
          createOption('a', 'Override the practice and provide care as ordered', false, 'Overriding cultural practices without notification is not agency policy.'),
          createOption('b', 'Notify the supervisor and physician in an effort to accommodate the patient', true, 'Correct. Agency policy requires notification of supervisor and physician when cultural considerations impede prescribed care.'),
          createOption('c', 'Discharge the patient from services', false, 'Discharge for cultural differences is discriminatory and inappropriate.'),
          createOption('d', 'Document only and take no further action', false, 'Documentation alone is insufficient — escalation to supervisor and physician is required.'),
        ],
        mappedObjective: 'Apply agency cultural accommodation and escalation procedures',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M01-FIN-Q08', moduleId: 'ACHC-ART-M01',
        questionText: 'The teach-back method is primarily used to:',
        options: [
          createOption('a', 'Test the patient\'s reading comprehension', false, 'Teach-back is an oral/demonstration method, not a reading test.'),
          createOption('b', 'Verify that the healthcare worker communicated effectively', true, 'Correct. Teach-back tests the quality of your communication by having the patient repeat information in their own words.'),
          createOption('c', 'Speed up patient education', false, 'Teach-back adds time but improves safety and comprehension.'),
          createOption('d', 'Replace the need for interpreter services', false, 'Teach-back complements interpreter services — it does not replace them.'),
        ],
        mappedObjective: 'Apply teach-back method in culturally diverse settings',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M01-FIN-Q09', moduleId: 'ACHC-ART-M01',
        questionText: 'Why should children NOT be used as interpreters for medical communication according to agency policy?',
        options: [
          createOption('a', 'Children cannot speak clearly enough', false, 'The issue is not speech clarity but confidentiality and accuracy of medical interpretation.'),
          createOption('b', 'To ensure confidentiality of information and accurate communication', true, 'Correct. Agency policy states children and other patients will not be used to interpret to ensure confidentiality and accuracy.'),
          createOption('c', 'Children are not old enough to understand any language', false, 'Many bilingual children have language skills, but they lack medical vocabulary and appropriate boundaries for confidential information.'),
          createOption('d', 'It is illegal for children to translate', false, 'It is not specifically illegal but it violates agency policy and CLAS standards.'),
        ],
        mappedObjective: 'Identify requirements for qualified interpreter services',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M01-FIN-Q10', moduleId: 'ACHC-ART-M01',
        questionText: 'When documenting cultural considerations in a clinical note, you should:',
        options: [
          createOption('a', 'Use informal language to make the note more relatable', false, 'Clinical documentation must use professional, objective language.'),
          createOption('b', 'Use objective, respectful language and document interpreter use, cultural practices identified, and teach-back results', true, 'Correct. Documentation of cultural factors must be objective, respectful, and include all relevant cultural accommodations, interpreter use, and education outcomes.'),
          createOption('c', 'Avoid mentioning culture because it might be considered discriminatory', false, 'Documenting cultural factors is essential for continuity of care — omitting them puts future caregivers and the patient at risk.'),
          createOption('d', 'Only document cultural factors if the patient requests it', false, 'Cultural documentation is required whenever cultural factors affect care, regardless of patient request.'),
        ],
        mappedObjective: 'Document cultural considerations properly in the clinical record',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M01-FIN-Q11', moduleId: 'ACHC-ART-M01',
        questionText: 'Implicit bias in home health care refers to:',
        options: [
          createOption('a', 'Consciously choosing to treat patients differently based on ethnicity', false, 'This describes explicit bias, not implicit bias.'),
          createOption('b', 'Unconscious assumptions that operate below awareness and can affect care quality', true, 'Correct. Implicit bias involves unconscious assumptions based on culture, socioeconomic status, or background that can lead to unequal care.'),
          createOption('c', 'Following agency policies about cultural accommodation', false, 'Following policies is appropriate practice, not bias.'),
          createOption('d', 'Asking a patient about their cultural preferences', false, 'Asking about cultural preferences is culturally competent, not biased.'),
        ],
        mappedObjective: 'Recognize and address implicit bias in patient care',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M01-FIN-Q12', moduleId: 'ACHC-ART-M01',
        questionText: 'According to agency policy, if a staff member\'s personal cultural or religious beliefs conflict with providing prescribed patient care, the staff member should:',
        options: [
          createOption('a', 'Refuse to provide the care and leave the patient\'s home', false, 'Abandoning a patient is never acceptable. Proper notification is required.'),
          createOption('b', 'Provide the care despite personal discomfort without telling anyone', false, 'Providing compromised care due to unaddressed personal conflicts is not safe or professional.'),
          createOption('c', 'Notify their supervisor so the agency can reassign without disrupting patient care', true, 'Correct. Agency policy states personnel unwilling to comply due to cultural values or religious beliefs will not be assigned to conflicting situations — proper notification to supervisor is required.'),
          createOption('d', 'Ask the patient to change their treatment preferences', false, 'A staff member\'s beliefs should not influence the patient\'s prescribed care plan.'),
        ],
        mappedObjective: 'Apply agency policy when personal beliefs conflict with patient care',
        source: 'supplemental', reviewRequired: false,
      },
    ],
    requiredForCompletion: true,
  },
  // PAGE 13: Remediation
  {
    pageId: 'M01-P13',
    moduleId: 'ACHC-ART-M01',
    pageType: 'remediation',
    title: 'Remediation: Cultural Awareness',
    narrationText: `You did not achieve the passing score on the final assessment. This remediation page will help you review the learning objectives where you need additional study. Please review the following key concepts carefully before retaking the assessment. CLAS Standards: The National Standards for Culturally and Linguistically Appropriate Services were introduced in 2000 and adopted by the Joint Commission and CMS. They require cultural competence training for healthcare professionals. Cultural Competence: This is about the quality of day-to-day interactions with patients. It means respecting cultural beliefs, communicating in understandable language, and avoiding assumptions. Interpreter Services: Use qualified interpreters — not family members, children, or untrained staff. Your agency provides phone interpreter services including Accredited Language Services and Verbatim Solutions. Teach-Back: Ask patients to repeat information in their own words. This tests your communication, not the patient's intelligence. Agency Policy: When cultural practices impede prescribed care, notify your supervisor and physician. Staff with personal conflicts should notify their supervisor for reassignment. Documentation: Use objective, respectful language. Document interpreter use, cultural practices, teach-back results, and escalation actions. Bias: Recognize both explicit and implicit bias. Treat each patient as an individual. EEOC: The U.S. Equal Employment Opportunity Commission prohibits workplace discrimination. After reviewing these concepts, you may retake the final assessment.`,
    contentHtml: `<h3>Remediation: Review These Key Concepts</h3><ul><li><strong>CLAS Standards:</strong> Introduced 2000 by HHS, adopted by Joint Commission and CMS</li><li><strong>Cultural Competence:</strong> Quality of patient interactions — respect beliefs, communicate clearly</li><li><strong>Interpreter Services:</strong> Use qualified interpreters, not family/children</li><li><strong>Teach-Back:</strong> Tests YOUR communication, not the patient's intelligence</li><li><strong>Agency Policy:</strong> Notify supervisor and physician when culture impedes care</li><li><strong>Documentation:</strong> Objective, respectful language — include interpreter, practices, teach-back</li><li><strong>Bias:</strong> Recognize implicit and explicit bias — treat individuals, not stereotypes</li><li><strong>EEOC:</strong> Federal agency prohibiting workplace discrimination</li></ul><p><strong>After reviewing, you may retake the final assessment.</strong></p>`,
    media: createMedia(
      'Illustration of a study desk with open books, highlighted notes, and a "Review" banner. Clean educational design. Encouraging, not punitive.',
      '10-second 720p video: Key concepts appear one by one on screen with brief highlights: CLAS, Competence, Interpreters, Teach-Back, Policy, Documentation, Bias. Text overlay: "Review & Retry." Encouraging, supportive tone.',
      'image', 'beforeNarration',
      'Display study/review image to frame remediation as supportive learning, not failure.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P13', 'remediation', 'Remediation: Cultural Awareness',
      `You did not achieve the passing score on the final assessment. This remediation page will help you review the learning objectives where you need additional study. Please review the following key concepts carefully before retaking the assessment. CLAS Standards: The National Standards for Culturally and Linguistically Appropriate Services were introduced in 2000 and adopted by the Joint Commission and CMS. They require cultural competence training for healthcare professionals. Cultural Competence: This is about the quality of day-to-day interactions with patients. It means respecting cultural beliefs, communicating in understandable language, and avoiding assumptions. Interpreter Services: Use qualified interpreters — not family members, children, or untrained staff. Your agency provides phone interpreter services including Accredited Language Services and Verbatim Solutions. Teach-Back: Ask patients to repeat information in their own words. This tests your communication, not the patient's intelligence. Agency Policy: When cultural practices impede prescribed care, notify your supervisor and physician. Staff with personal conflicts should notify their supervisor for reassignment. Documentation: Use objective, respectful language. Document interpreter use, cultural practices, teach-back results, and escalation actions. Bias: Recognize both explicit and implicit bias. Treat each patient as an individual. EEOC: The U.S. Equal Employment Opportunity Commission prohibits workplace discrimination. After reviewing these concepts, you may retake the final assessment.`, 5),
    requiredForCompletion: true,
  },
  // PAGE 14: Attestation & Signature
  {
    pageId: 'M01-P14',
    moduleId: 'ACHC-ART-M01',
    pageType: 'attestation',
    title: 'Attestation & Signature: Cultural Awareness',
    narrationText: `Congratulations on completing Module One: Cultural Awareness. Before your certificate is issued, you must complete this attestation. By signing below, you confirm the following: You have personally completed all sections of this module. You have read and understood the content about cultural competence, CLAS standards, interpreter use, teach-back, bias recognition, documentation, and escalation. You have completed all scenario challenges and knowledge checks. You have passed the final assessment with a score of at least eighty percent. You understand your responsibility to apply culturally competent care in every patient interaction. You commit to following agency policy regarding cultural diversity, interpreter services, and escalation procedures. Please type your full legal name below and check the attestation box to confirm. Your signature will be recorded with a timestamp for your training record.`,
    contentHtml: `<h3>Attestation & Signature</h3><p>By signing below, I confirm:</p><ul><li>I personally completed all sections of this Cultural Awareness module</li><li>I understand CLAS standards, cultural competence, interpreter use, and teach-back</li><li>I completed all challenges and knowledge checks</li><li>I passed the final assessment with ≥80%</li><li>I will apply culturally competent care in every patient interaction</li><li>I will follow agency policy for cultural diversity and escalation</li></ul><p><strong>[Signature Field]</strong> Type your full legal name</p><p><strong>[Checkbox]</strong> I attest to the above statements</p><p><strong>[Timestamp]</strong> Recorded automatically</p>`,
    media: createMedia(
      'Formal illustration of a signed certificate with a pen and a stamp. Professional, official appearance. Clean background.',
      '10-second 720p video: A hand types a name into a digital signature field. A checkmark appears. A timestamp populates. Text overlay: "Attestation Complete." Official, professional tone.',
      'image', 'beforeNarration',
      'Display attestation illustration to set the formal context for the signature requirement.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P14', 'attestation', 'Attestation & Signature: Cultural Awareness',
      `Congratulations on completing Module One: Cultural Awareness. Before your certificate is issued, you must complete this attestation. By signing below, you confirm the following: You have personally completed all sections of this module. You have read and understood the content about cultural competence, CLAS standards, interpreter use, teach-back, bias recognition, documentation, and escalation. You have completed all scenario challenges and knowledge checks. You have passed the final assessment with a score of at least eighty percent. You understand your responsibility to apply culturally competent care in every patient interaction. You commit to following agency policy regarding cultural diversity, interpreter services, and escalation procedures. Please type your full legal name below and check the attestation box to confirm. Your signature will be recorded with a timestamp for your training record.`, 2),
    requiredForCompletion: true,
  },
  // PAGE 15: Certificate & Transcript
  {
    pageId: 'M01-P15',
    moduleId: 'ACHC-ART-M01',
    pageType: 'certificate',
    title: 'Certificate of Completion: Cultural Awareness',
    narrationText: `You have successfully completed Module One: Cultural Awareness. Your certificate of completion has been generated. This certificate confirms that you have completed all required instruction, challenges, documentation exercises, and the final assessment for the Cultural Awareness module of the ACHC Annual Required Training program. Your completion details are recorded in your training transcript. This certificate, along with your post-test score, will be placed in your personnel file. Thank you for your commitment to providing culturally competent care to every patient.`,
    contentHtml: `<h3>🎓 Certificate of Completion</h3><p><strong>Module:</strong> ACHC-ART-M01 — Cultural Awareness</p><p><strong>Program:</strong> ACHC Annual Required Training</p><p><strong>Status:</strong> COMPLETE</p><p><em>This certificate confirms successful completion of all required instruction, challenges, assessments, and attestation.</em></p>`,
    media: createMedia(
      'Formal certificate design with gold border, agency logo placeholder, module title "Cultural Awareness," completion date field, score field, and signature lines for learner and supervisor. Professional, printable design.',
      '10-second 720p video: A certificate animates onto screen with gold flourishes. Fields populate: Module name, date, score, signature. A gold seal stamps the bottom. Text overlay: "Module 1 Complete." Celebratory, professional tone.',
      'image', 'beforeNarration',
      'Display certificate image as the final visual confirmation of module completion.'
    ),
    duration: createDuration('ACHC-ART-M01', 'M01-P15', 'certificate', 'Certificate of Completion: Cultural Awareness',
      `You have successfully completed Module One: Cultural Awareness. Your certificate of completion has been generated. This certificate confirms that you have completed all required instruction, challenges, documentation exercises, and the final assessment for the Cultural Awareness module of the ACHC Annual Required Training program. Your completion details are recorded in your training transcript. This certificate, along with your post-test score, will be placed in your personnel file. Thank you for your commitment to providing culturally competent care to every patient.`, 1),
    requiredForCompletion: true,
  },
];

const MODULE_M01: ModuleData = {
  moduleId: 'ACHC-ART-M01',
  title: 'Cultural Awareness',
  description: 'Cultural competence, CLAS principles, respectful communication, language access, interpreter use, teach-back, patient preferences, bias and discrimination, documentation, escalation, and field-worker scenarios.',
  version: '1.0.0',
  sourceRefs: ['ACHC Training Prompt Document — Cultural Awareness Section', 'HHS Office of Minority Health CLAS Standards'],
  policyRefs: ['Agency Cultural Diversity Policy', 'Agency Bill of Patient Rights and Responsibilities'],
  formRefs: ['Complaint Form', 'Incident Report'],
  workflowRefs: ['Interpreter Request Workflow', 'Cultural Escalation Workflow'],
  reviewRequired: false,
  pages: M01_PAGES,
  preAssessmentQuestions: M01_PAGES.find(p => p.pageType === 'pre-assessment')?.assessmentQuestions || [],
  finalAssessmentQuestions: M01_PAGES.find(p => p.pageType === 'final-assessment')?.assessmentQuestions || [],
  remediationObjectives: [
    { objectiveId: 'M01-OBJ-01', description: 'Identify CLAS standards and their role in cultural competence', relatedPages: ['M01-P02'] },
    { objectiveId: 'M01-OBJ-02', description: 'Distinguish cultural competence from workforce diversity', relatedPages: ['M01-P02', 'M01-P03'] },
    { objectiveId: 'M01-OBJ-03', description: 'Apply EEOC and workplace discrimination law knowledge', relatedPages: ['M01-P04'] },
    { objectiveId: 'M01-OBJ-04', description: 'Use teach-back method across cultural and language barriers', relatedPages: ['M01-P06'] },
    { objectiveId: 'M01-OBJ-05', description: 'Identify and address implicit bias', relatedPages: ['M01-P07'] },
    { objectiveId: 'M01-OBJ-06', description: 'Document cultural considerations properly', relatedPages: ['M01-P09'] },
    { objectiveId: 'M01-OBJ-07', description: 'Escalate cultural conflicts appropriately', relatedPages: ['M01-P10'] },
    { objectiveId: 'M01-OBJ-08', description: 'Apply interpreter service requirements', relatedPages: ['M01-P02', 'M01-P05'] },
  ],
  passingScore: 80,
  minimumRequiredMinutes: 60,
};

// ═══════════════════════════════════════
// M01 DURATION VERIFICATION
// ═══════════════════════════════════════
// Page-by-page calculation (will be computed by validator):
// M01-P01: ~1.9 narration + 1 interaction = 2.9 min
// M01-P02: ~3.2 narration + 2+4 interaction = 9.2 min
// M01-P03: ~2.8 narration + 2+3 interaction = 7.8 min
// M01-P04: ~2.9 narration + 2+4 interaction = 8.9 min
// M01-P05: ~3.1 narration + 2+5 interaction = 10.1 min
// M01-P06: ~2.7 narration + 2+3 interaction = 7.7 min
// M01-P07: ~2.6 narration + 2+3 interaction = 7.6 min
// M01-P08: ~1.8 narration + 5+5 interaction = 11.8 min (scenario)
// M01-P09: ~2.4 narration + 6+5 interaction = 13.4 min (doc practice)
// M01-P10: ~2.4 narration + 4+4 interaction = 10.4 min (doc practice)
// M01-P11: ~0.6 narration + 8 interaction = 8.6 min (pre-assess)
// M01-P12: ~0.6 narration + 15 interaction = 15.6 min (final assess)
// M01-P13: ~2.0 narration + 5 interaction = 7.0 min (remediation)
// M01-P14: ~1.3 narration + 2 interaction = 3.3 min (attestation)
// M01-P15: ~0.6 narration + 1 interaction = 1.6 min (certificate)
// ESTIMATED TOTAL: ~125.9 minutes — EXCEEDS 60 MINUTE MINIMUM ✓

// ═══════════════════════════════════════
// SECTION 4: MODULE M02 — EMERGENCY & DISASTER PREPAREDNESS
// ═══════════════════════════════════════

const M02_PAGES: LessonPage[] = [
  {
    pageId: 'M02-P01', moduleId: 'ACHC-ART-M02', pageType: 'overview',
    title: 'Emergency & Disaster Preparedness — Module Overview',
    narrationText: `Welcome to Module Two: Emergency and Disaster Preparedness. This module is a required component of your annual ACHC training. As a home health field worker, you may be the only healthcare professional in contact with a patient during an emergency. Your knowledge of your agency's emergency preparedness plan, patient triage classifications, communication procedures, and documentation requirements can directly impact patient outcomes and even save lives. In this module, you will learn about your agency's comprehensive emergency preparedness and response plan, your specific role as a field worker during emergencies, the patient triage classification system from Class One through Class Four, the agency communication tree and alternate communication methods, shelter-in-place and evacuation support procedures, how to care for technology-dependent patients during power outages, downtime documentation requirements, missed-contact escalation procedures, continuity of care principles, and after-action documentation. You will work through realistic disaster scenarios, practice triage decision-making, and complete documentation exercises. You must complete all sections and pass the final assessment with at least eighty percent. Let us begin.`,
    contentHtml: `<h2>Module 2: Emergency & Disaster Preparedness</h2><p>Covers: Agency emergency plan, field-worker roles, patient triage, communication trees, shelter-in-place, evacuation, technology-dependent patients, downtime documentation, missed-contact escalation, continuity of care, after-action documentation.</p><p><strong>Estimated Time:</strong> 60–70 min · <strong>Passing Score:</strong> 80%</p>`,
    media: createMedia(
      'Professional photograph of a home health worker preparing an emergency go-bag in the trunk of their car. Visible items include a flashlight, water bottles, blankets, a first aid kit, and a phone charger. Bright, organized, professional.',
      '10-second 720p video: A field worker opens the trunk of their car, revealing a well-organized emergency supply kit. Camera pans across items: flashlight, blankets, water, radio. Text overlay: "Emergency & Disaster Preparedness — Module 2." Serious but calm tone.',
      'image', 'beforeNarration',
      'Display emergency preparedness image to set the context for the module.'
    ),
    duration: createDuration('ACHC-ART-M02', 'M02-P01', 'overview', 'Emergency & Disaster Preparedness — Module Overview',
      `Welcome to Module Two: Emergency and Disaster Preparedness. This module is a required component of your annual ACHC training. As a home health field worker, you may be the only healthcare professional in contact with a patient during an emergency. Your knowledge of your agency's emergency preparedness plan, patient triage classifications, communication procedures, and documentation requirements can directly impact patient outcomes and even save lives. In this module, you will learn about your agency's comprehensive emergency preparedness and response plan, your specific role as a field worker during emergencies, the patient triage classification system from Class One through Class Four, the agency communication tree and alternate communication methods, shelter-in-place and evacuation support procedures, how to care for technology-dependent patients during power outages, downtime documentation requirements, missed-contact escalation procedures, continuity of care principles, and after-action documentation. You will work through realistic disaster scenarios, practice triage decision-making, and complete documentation exercises. You must complete all sections and pass the final assessment with at least eighty percent. Let us begin.`, 1),
    requiredForCompletion: true,
  },
  {
    pageId: 'M02-P02', moduleId: 'ACHC-ART-M02', pageType: 'instruction',
    title: 'Agency Emergency Preparedness Plan Overview',
    narrationText: `Your agency's Emergency and Disaster Plan provides an orderly procedure to be implemented during an emergency to ensure that the healthcare needs of patients continue to be met. The plan comprehensively describes the agency's approach to disasters. The agency must maintain documentation of compliance with emergency preparedness. Importantly, the agency is not required to physically evacuate or transport a patient in the event of an emergency. However, the agency will coordinate with local authorities responsible for evacuation when needed. All employees are oriented to the plan and their responsibilities at hire and annually. The agency has taken specific actions to develop, maintain, and implement this plan. The Administrator is designated as the agency's disaster coordinator. In the Administrator's absence, the Alternate Administrator serves as the alternate disaster coordinator. The agency maintains a continuity of operations business plan that addresses emergency financial needs, essential functions for patient services, critical personnel identification, and how to return to normal operations as quickly as possible. The agency conducts a risk assessment to identify potential disasters from natural and man-made causes most likely to occur in the service area. The agency has determined the actions and responsibilities for staff in each phase of emergency planning: mitigation, preparedness, response, and recovery. The response and recovery phases include actions for when warning of an emergency is not provided. The agency monitors disaster-related news and information, including after hours, weekends, and holidays, to receive warnings of imminent and occurring disasters. The plan is reviewed as needed, after every response, and at least yearly through the Professional Advisory Committee.`,
    contentHtml: `<h3>Agency Emergency Plan Structure</h3><ul><li><strong>Disaster Coordinator:</strong> Administrator (Alternate: Alternate Administrator)</li><li><strong>Business Continuity:</strong> Financial needs, essential functions, critical personnel, return to normal operations</li><li><strong>Risk Assessment:</strong> Natural and man-made disasters in service area</li><li><strong>Four Phases:</strong> Mitigation → Preparedness → Response → Recovery</li><li><strong>Monitoring:</strong> 24/7 disaster news monitoring including after hours</li><li><strong>Review:</strong> After every response, at least yearly, through PAC</li></ul><p><strong>Key Point:</strong> The agency is NOT required to physically evacuate or transport patients. Coordinate with local authorities.</p>`,
    media: createMedia(
      'Infographic showing the four phases of emergency management: Mitigation, Preparedness, Response, Recovery. Each phase is in a circular flow diagram with key actions listed. Professional, clear design.',
      '10-second 720p video: Animated cycle diagram showing the four emergency phases rotating. Each phase highlights briefly with key actions. Text overlay: "Emergency Planning: 4 Phases." Professional, structured tone.',
      'image', 'duringNarration',
      'Display four-phase emergency cycle alongside narration to reinforce the planning framework.'
    ),
    duration: createDuration('ACHC-ART-M02', 'M02-P02', 'instruction', 'Agency Emergency Preparedness Plan Overview',
      `Your agency's Emergency and Disaster Plan provides an orderly procedure to be implemented during an emergency to ensure that the healthcare needs of patients continue to be met. The plan comprehensively describes the agency's approach to disasters. The agency must maintain documentation of compliance with emergency preparedness. Importantly, the agency is not required to physically evacuate or transport a patient in the event of an emergency. However, the agency will coordinate with local authorities responsible for evacuation when needed. All employees are oriented to the plan and their responsibilities at hire and annually. The agency has taken specific actions to develop, maintain, and implement this plan. The Administrator is designated as the agency's disaster coordinator. In the Administrator's absence, the Alternate Administrator serves as the alternate disaster coordinator. The agency maintains a continuity of operations business plan that addresses emergency financial needs, essential functions for patient services, critical personnel identification, and how to return to normal operations as quickly as possible. The agency conducts a risk assessment to identify potential disasters from natural and man-made causes most likely to occur in the service area. The agency has determined the actions and responsibilities for staff in each phase of emergency planning: mitigation, preparedness, response, and recovery. The response and recovery phases include actions for when warning of an emergency is not provided. The agency monitors disaster-related news and information, including after hours, weekends, and holidays, to receive warnings of imminent and occurring disasters. The plan is reviewed as needed, after every response, and at least yearly through the Professional Advisory Committee.`, 2),
    challenge: {
      challengeId: 'M02-C01', lessonId: 'M02-P02', moduleId: 'ACHC-ART-M02',
      title: 'Emergency Plan Knowledge Check',
      scenario: 'A hurricane watch has been issued for your area. Your supervisor asks you to review the emergency plan before heading into the field. You need to identify the agency disaster coordinator.',
      narrationText: 'A hurricane watch has been issued. Your supervisor asks who the agency disaster coordinator is. Based on the emergency plan, who holds this role?',
      prompt: 'Who is the agency disaster coordinator?',
      interactionType: 'choose-best-response',
      options: [
        createChallengeOption('a', 'The Director of Nursing', 'The Director of Nursing has emergency responsibilities but is not designated as the disaster coordinator.', false),
        createChallengeOption('b', 'The Administrator', 'Correct. The Administrator is designated as the agency disaster coordinator. In the Administrator\'s absence, the Alternate Administrator serves as backup.', true),
        createChallengeOption('c', 'The most senior field worker on duty', 'Field workers play important roles during emergencies but the disaster coordinator is the Administrator.', false),
      ],
      bestPracticeAnswer: 'The Administrator is the designated disaster coordinator.',
      teachingPoint: 'Know your agency\'s emergency plan chain of command. The Administrator is the disaster coordinator, with the Alternate Administrator as backup.',
      documentationPrompt: 'Keep your agency emergency contact list current and accessible in your vehicle at all times.',
      escalationPrompt: 'During an actual emergency, report to the disaster coordinator (Administrator) through the established communication tree.',
      estimatedInteractionMinutes: 3,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M02-P03', moduleId: 'ACHC-ART-M02', pageType: 'instruction',
    title: 'Types of Emergencies & Patient Triage Classifications',
    narrationText: `There are three types of emergencies your agency plans for. Man-made emergencies are caused by acts against persons or society, including enemy attack, sabotage, terrorism, civil unrest, and bioterrorism. Natural emergencies are caused by natural events, including winter storms, hurricanes, floods, mudslides, severe wave action, drought, and earthquakes. Technological emergencies are caused by technological failure or accident, including explosions, transportation accidents, radiological accidents, chemical and other hazardous materials incidents. In the event of an emergency that disrupts the agency's ability to provide care, needs will be prioritized to determine those that are greatest. Patients are categorized into four triage classifications. Class One is for patients with conditions that are potentially life-threatening, require ongoing medical treatment, or require a medical device to sustain life. For example, a patient on a ventilator during a potential widespread power blackout. The home environment and support system will be reviewed. When appropriate, arrangements for evacuation to an acute care facility will be made. These patients will be seen immediately. The agency will obtain emergency personnel assistance as necessary. Examples include patients on oxygen, multiple assistive devices, or infusion therapy. Class Two is for patients with in-home support that may be mobilized during a disaster. The family is responsible for evacuation and care. Patients with the greatest need will be seen as soon as possible. Examples include patients requiring daily insulin injections, IV medications, or sterile wound care of wounds with large drainage. Class Three is for patients whose services could be postponed twenty-four to forty-eight hours without adverse effects. Examples include a new insulin-dependent diabetic able to self-inject, cardiovascular or respiratory assessment patients, or wound care patients with minimal drainage. Class Four is for patients with maximum in-home family support. The family is totally responsible for care and transfer. Services could be postponed seventy-two to ninety-six hours without adverse effect. Examples include a postoperative patient with no open wound, a patient anticipated for discharge within ten to fourteen days, or a patient requiring routine catheter changes.`,
    contentHtml: `<h3>Types of Emergencies</h3><ul><li><strong>Man-Made:</strong> Terrorism, sabotage, civil unrest, bioterrorism</li><li><strong>Natural:</strong> Hurricanes, floods, earthquakes, storms</li><li><strong>Technological:</strong> Explosions, chemical accidents, transportation incidents</li></ul><h3>Patient Triage Classifications</h3><table><tr><th>Class</th><th>Priority</th><th>Examples</th><th>Response Time</th></tr><tr><td>I</td><td>Life-threatening / device-dependent</td><td>Ventilator, O2, infusion</td><td>Immediately</td></tr><tr><td>II</td><td>In-home support available, high clinical need</td><td>Daily insulin, IV meds, wound care (large drainage)</td><td>ASAP</td></tr><tr><td>III</td><td>Can postpone 24-48 hours</td><td>Self-injecting diabetic, wound care (minimal drainage)</td><td>24-48 hrs</td></tr><tr><td>IV</td><td>Maximum family support, can postpone 72-96 hours</td><td>Post-op no wound, routine catheter change</td><td>72-96 hrs</td></tr></table>`,
    media: createMedia(
      'Triage classification chart with four color-coded rows (Red=Class I, Orange=Class II, Yellow=Class III, Green=Class IV). Each row shows the class, description, examples, and response timeframe. Clean, readable table design.',
      '10-second 720p video: Animated triage chart builds row by row from Class I (red, urgent) to Class IV (green, can defer). Each classification highlights briefly with an example. Text overlay: "Patient Triage — Know the Classes." Serious, instructional tone.',
      'image', 'duringNarration',
      'Display triage classification chart alongside narration for visual reference during the detailed classification explanation.'
    ),
    duration: createDuration('ACHC-ART-M02', 'M02-P03', 'instruction', 'Types of Emergencies & Patient Triage Classifications',
      `There are three types of emergencies your agency plans for. Man-made emergencies are caused by acts against persons or society, including enemy attack, sabotage, terrorism, civil unrest, and bioterrorism. Natural emergencies are caused by natural events, including winter storms, hurricanes, floods, mudslides, severe wave action, drought, and earthquakes. Technological emergencies are caused by technological failure or accident, including explosions, transportation accidents, radiological accidents, chemical and other hazardous materials incidents. In the event of an emergency that disrupts the agency's ability to provide care, needs will be prioritized to determine those that are greatest. Patients are categorized into four triage classifications. Class One is for patients with conditions that are potentially life-threatening, require ongoing medical treatment, or require a medical device to sustain life. For example, a patient on a ventilator during a potential widespread power blackout. The home environment and support system will be reviewed. When appropriate, arrangements for evacuation to an acute care facility will be made. These patients will be seen immediately. The agency will obtain emergency personnel assistance as necessary. Examples include patients on oxygen, multiple assistive devices, or infusion therapy. Class Two is for patients with in-home support that may be mobilized during a disaster. The family is responsible for evacuation and care. Patients with the greatest need will be seen as soon as possible. Examples include patients requiring daily insulin injections, IV medications, or sterile wound care of wounds with large drainage. Class Three is for patients whose services could be postponed twenty-four to forty-eight hours without adverse effects. Examples include a new insulin-dependent diabetic able to self-inject, cardiovascular or respiratory assessment patients, or wound care patients with minimal drainage. Class Four is for patients with maximum in-home family support. The family is totally responsible for care and transfer. Services could be postponed seventy-two to ninety-six hours without adverse effect. Examples include a postoperative patient with no open wound, a patient anticipated for discharge within ten to fourteen days, or a patient requiring routine catheter changes.`, 2),
    challenge: {
      challengeId: 'M02-C02', lessonId: 'M02-P03', moduleId: 'ACHC-ART-M02',
      title: 'Triage Classification Decision',
      scenario: 'A severe storm has knocked out power across your service area. You need to prioritize your patient visits. Patient A is on a home ventilator. Patient B receives weekly physical therapy. Patient C needs daily insulin injections and lives with her daughter. Patient D had routine wound care (minimal drainage) and can self-care for basic needs.',
      narrationText: 'Power is out across your service area. You have four patients. Apply the triage classification system to prioritize them.',
      prompt: 'What is the correct triage priority order?',
      interactionType: 'sequence-the-steps',
      options: [
        createChallengeOption('a', 'Patient A (ventilator) = Class I → Patient C (daily insulin, lives with daughter) = Class II → Patient D (wound care, minimal drainage) = Class III → Patient B (weekly PT) = Class IV', 'Correct. The ventilator patient is immediately life-threatening (Class I). The insulin patient has support but needs daily care (Class II). The wound care patient can defer 24-48 hours (Class III). The weekly PT patient can defer 72-96 hours (Class IV).', true),
        createChallengeOption('b', 'Patient C first because diabetes is most common, then A, then D, then B', 'Incorrect. Triage is based on acuity and life-threat level, not disease prevalence. The ventilator patient is Class I — immediately life-threatening.', false),
        createChallengeOption('c', 'Visit all patients in the order they are on your schedule', 'During an emergency, your regular schedule is overridden by triage classifications. Prioritize by acuity level.', false),
      ],
      bestPracticeAnswer: 'Apply triage classes: I (ventilator) → II (daily insulin) → III (wound care, defer 24-48h) → IV (PT, defer 72-96h)',
      teachingPoint: 'During emergencies, patient visits are prioritized by triage classification. Class I (life-threatening) patients are seen immediately. Class IV patients can safely defer the longest.',
      documentationPrompt: 'Document triage classification assigned, visit priority order, contacts made, and any patients unable to be reached.',
      escalationPrompt: 'Contact the Director of Nursing or disaster coordinator immediately if a Class I patient cannot be reached or is in danger.',
      estimatedInteractionMinutes: 5,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M02-P04', moduleId: 'ACHC-ART-M02', pageType: 'instruction',
    title: 'Communication Procedures & Staff Preparedness',
    narrationText: `Effective communication during emergencies is essential. Your agency has procedures for communicating with staff, patients, local, state, and federal emergency management agencies, and other entities. This includes emergency medical services, state regulatory departments, and other healthcare providers. The agency maintains primary and alternate modes of communication or alert systems in the event of telephone or power failure. As a field worker, you must know the agency's communication procedures before an emergency occurs. You should have the following communication devices available: a charged cell phone, a portable phone, a CB radio if available, and know whether your agency has satellite phone capability. Your personal emergency preparedness is equally critical. Your automobile should be equipped with a full tank of gas, a shovel, blankets, a portable battery-operated or crank flashlight, a portable battery-operated or crank radio, a list of gas stations with emergency backup power, a cell phone charger, booster cables, a tire repair kit, bottled water and non-perishable high energy foods such as granola bars, raisins, and peanut butter, a fire extinguisher — five pounds, A-B-C type, and flares. You should also establish family preparedness: escape routes, an evacuation plan, a family communication plan, a point of contact that is out of town, and a plan for pets. For a laptop computer, have a converter that plugs into the cigarette lighter. You must also be prepared to assume tasks and roles outside your ordinary job description during emergencies. Ensure your credentials are up to date and with you. Know how supplies will be procured for patients during the emergency.`,
    contentHtml: `<h3>Communication During Emergencies</h3><ul><li>Primary and alternate communication modes maintained</li><li>Contact: EMS, state regulatory, other healthcare providers</li><li><strong>Your devices:</strong> Charged cell phone, portable phone, CB radio, satellite phone if available</li></ul><h3>Vehicle Emergency Kit</h3><ul><li>Full gas tank, shovel, blankets, flashlight (crank), radio (crank)</li><li>Gas station list (backup power), cell charger, booster cables, tire kit</li><li>Water, granola bars, peanut butter, fire extinguisher (5lb ABC), flares</li></ul><h3>Family Preparedness</h3><ul><li>Escape routes, evacuation plan, communication plan, out-of-town contact, pet plan</li></ul><h3>Professional Readiness</h3><ul><li>Be ready for tasks outside your normal role</li><li>Keep credentials current and with you</li><li>Know supply procurement procedures</li></ul>`,
    media: createMedia(
      'Checklist illustration showing a vehicle emergency kit. Items are organized in a trunk with labels: flashlight, blankets, water, first aid, radio, phone charger, fire extinguisher. Clean, organized, professional illustration.',
      '10-second 720p video: A field worker methodically checks emergency supplies in their car trunk, ticking off items on a list. Camera shows each item briefly. Text overlay: "Be Prepared — Vehicle Emergency Kit." Calm, instructional tone.',
      'image', 'beforeNarration',
      'Display vehicle emergency kit checklist to provide a practical reference for field worker preparation.'
    ),
    duration: createDuration('ACHC-ART-M02', 'M02-P04', 'instruction', 'Communication Procedures & Staff Preparedness',
      `Effective communication during emergencies is essential. Your agency has procedures for communicating with staff, patients, local, state, and federal emergency management agencies, and other entities. This includes emergency medical services, state regulatory departments, and other healthcare providers. The agency maintains primary and alternate modes of communication or alert systems in the event of telephone or power failure. As a field worker, you must know the agency's communication procedures before an emergency occurs. You should have the following communication devices available: a charged cell phone, a portable phone, a CB radio if available, and know whether your agency has satellite phone capability. Your personal emergency preparedness is equally critical. Your automobile should be equipped with a full tank of gas, a shovel, blankets, a portable battery-operated or crank flashlight, a portable battery-operated or crank radio, a list of gas stations with emergency backup power, a cell phone charger, booster cables, a tire repair kit, bottled water and non-perishable high energy foods such as granola bars, raisins, and peanut butter, a fire extinguisher — five pounds, A-B-C type, and flares. You should also establish family preparedness: escape routes, an evacuation plan, a family communication plan, a point of contact that is out of town, and a plan for pets. For a laptop computer, have a converter that plugs into the cigarette lighter. You must also be prepared to assume tasks and roles outside your ordinary job description during emergencies. Ensure your credentials are up to date and with you. Know how supplies will be procured for patients during the emergency.`, 2),
    challenge: {
      challengeId: 'M02-C03', lessonId: 'M02-P04', moduleId: 'ACHC-ART-M02',
      title: 'Communication Failure Scenario',
      scenario: 'During a severe storm, your cell phone has no signal and the office phone system is down. You have a Class I patient (on oxygen) who you need to check on but cannot reach by phone. What do you do?',
      narrationText: 'During a severe storm, your cell phone has no signal and office phones are down. You have a Class I patient on oxygen that you cannot reach. What is your best course of action?',
      prompt: 'How do you handle communication failure with a high-priority patient?',
      interactionType: 'field-safety-decision',
      options: [
        createChallengeOption('a', 'Wait until phone service is restored to contact the patient.', 'Waiting is not appropriate for a Class I patient who may be in life-threatening danger without power for their oxygen. Alternative action is needed.', false),
        createChallengeOption('b', 'If roads are safe, attempt to visit the Class I patient in person. If you can reach the office or a colleague through any alternate communication method (CB radio, satellite phone, text), notify them of your plan. Document all attempts to contact.', 'Correct. Class I patients require immediate attention. If it is safe to travel, an in-person welfare check is appropriate. Use any available alternate communication to notify the agency of your actions. Document everything.', true),
        createChallengeOption('c', 'Call 911 for the patient from a landline if you can find one.', 'Calling 911 is appropriate if you believe the patient is in immediate danger, but if possible, first attempt to verify the situation. This could be a good secondary action after attempting to reach the patient.', false),
      ],
      bestPracticeAnswer: 'Visit Class I patient in person if safe, use alternate communication to notify agency, document all attempts.',
      teachingPoint: 'During communication failures, Class I patients take priority. Use alternate communication methods and, if safe, make in-person welfare checks. Always document your actions and attempts.',
      documentationPrompt: 'Document: communication failure details, alternate methods attempted, visit attempt, patient status upon contact, and actions taken.',
      escalationPrompt: 'If you cannot safely reach a Class I patient, contact emergency services (911) and document the situation.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M02-P05', moduleId: 'ACHC-ART-M02', pageType: 'instruction',
    title: 'Patient Education & Evacuation Support',
    narrationText: `Every patient admitted to your agency receives critical emergency preparedness information. The patient is provided with a copy of the agency's policy on how to handle disaster-related emergencies in the home, an explanation of patient responsibilities in the agency's emergency preparedness and response plan, a list of community disaster resources that can assist during an emergency, and survival tips and plans for evacuation and sheltering in place. Patients are categorized into groups determined by the need for continuity of services, the acuity level of the patient, and the availability of someone to assume responsibility for the patient's emergency response plan if needed. The agency has identified patients who may need evacuation assistance from local or state jurisdictions and can readily access recorded information about a patient's triage category in an emergency. In the event evacuation is required, the local authority responsible for coordinating disaster preparedness and emergency response will be contacted. The agency is not responsible for evacuating patients, but it is responsible for coordinating with local authorities and maintaining accurate triage classification records. If some patient visits cannot be made and the situation is not life-threatening, contact will be maintained by phone if possible. If office phone service is disrupted, phones will be turned over to the answering service if possible. A staff member will be assigned to remain in contact with the answering service to receive and send messages. The agency will present its best efforts to provide care during emergency situations. However, if the agency is unable to comply with situations beyond its control — such as impassable roads or a patient who relocated to an unknown location — the agency is not required to continue to provide care. All emergency efforts and attempts must be documented.`,
    contentHtml: `<h3>Patient Emergency Education</h3><p>Each patient receives:</p><ul><li>Agency policy on handling disaster emergencies in the home</li><li>Patient responsibilities in the emergency plan</li><li>Community disaster resource list</li><li>Survival tips for evacuation and shelter-in-place</li></ul><h3>Evacuation</h3><ul><li>Agency is NOT responsible for evacuating patients</li><li>Agency coordinates with local authorities for patients needing evacuation assistance</li><li>Triage classification records must be readily accessible</li></ul><h3>When Visits Cannot Be Made</h3><ul><li>Maintain phone contact if possible</li><li>If phones are down → answering service</li><li>Document ALL attempts to follow procedures</li></ul>`,
    media: createMedia(
      'Illustration of a nurse reviewing an emergency preparedness packet with a patient at their kitchen table. The packet shows visible sections: "Emergency Contacts," "Evacuation Plan," "Shelter-in-Place." Patient appears engaged.',
      '10-second 720p video: A nurse hands an emergency preparedness packet to a patient. Camera zooms to show packet contents: contact numbers, evacuation routes, supply checklist. Patient and nurse review together. Text overlay: "Patient Emergency Education." Calm, instructional.',
      'image', 'beforeNarration',
      'Display patient education scene to illustrate the emergency preparedness information sharing process.'
    ),
    duration: createDuration('ACHC-ART-M02', 'M02-P05', 'instruction', 'Patient Education & Evacuation Support',
      `Every patient admitted to your agency receives critical emergency preparedness information. The patient is provided with a copy of the agency's policy on how to handle disaster-related emergencies in the home, an explanation of patient responsibilities in the agency's emergency preparedness and response plan, a list of community disaster resources that can assist during an emergency, and survival tips and plans for evacuation and sheltering in place. Patients are categorized into groups determined by the need for continuity of services, the acuity level of the patient, and the availability of someone to assume responsibility for the patient's emergency response plan if needed. The agency has identified patients who may need evacuation assistance from local or state jurisdictions and can readily access recorded information about a patient's triage category in an emergency. In the event evacuation is required, the local authority responsible for coordinating disaster preparedness and emergency response will be contacted. The agency is not responsible for evacuating patients, but it is responsible for coordinating with local authorities and maintaining accurate triage classification records. If some patient visits cannot be made and the situation is not life-threatening, contact will be maintained by phone if possible. If office phone service is disrupted, phones will be turned over to the answering service if possible. A staff member will be assigned to remain in contact with the answering service to receive and send messages. The agency will present its best efforts to provide care during emergency situations. However, if the agency is unable to comply with situations beyond its control — such as impassable roads or a patient who relocated to an unknown location — the agency is not required to continue to provide care. All emergency efforts and attempts must be documented.`, 2),
    challenge: {
      challengeId: 'M02-C04', lessonId: 'M02-P05', moduleId: 'ACHC-ART-M02',
      title: 'Evacuation Coordination Scenario',
      scenario: 'A mandatory evacuation order has been issued. Your Class I patient, Mrs. Torres, is on home oxygen and lives alone. She tells you she has no transportation and no family nearby to help her evacuate.',
      narrationText: 'A mandatory evacuation has been ordered. Mrs. Torres, a Class I patient on oxygen, lives alone with no transportation or nearby family. What is your responsibility?',
      prompt: 'What should you do to support Mrs. Torres\'s evacuation?',
      interactionType: 'escalation-decision',
      options: [
        createChallengeOption('a', 'Transport Mrs. Torres yourself in your personal vehicle.', 'The agency is not responsible for physically evacuating patients. Transporting a medically complex patient in your personal vehicle presents safety and liability concerns. Coordinate with local authorities instead.', false),
        createChallengeOption('b', 'Contact the local authority responsible for coordinating disaster preparedness and emergency response to arrange evacuation assistance for Mrs. Torres. Notify your supervisor. Ensure Mrs. Torres\'s triage classification and medical device information is communicated to emergency services.', 'Correct. The agency coordinates with local authorities for evacuation assistance. You must communicate the patient\'s triage classification, medical needs, and device dependencies to emergency services. Document all actions.', true),
        createChallengeOption('c', 'Tell Mrs. Torres that evacuation is her responsibility and leave.', 'While the agency is not responsible for physical evacuation, abandoning a Class I patient without coordinating assistance is unacceptable. You must contact local authorities on her behalf.', false),
      ],
      bestPracticeAnswer: 'Contact local emergency authority for evacuation assistance, notify supervisor, communicate patient medical needs.',
      teachingPoint: 'The agency is not required to physically evacuate patients but must coordinate with local authorities. Class I patients without transportation or family support need your advocacy to connect them with emergency services.',
      documentationPrompt: 'Document: evacuation order received, patient status, local authority contacted (name/number), patient medical information communicated, supervisor notified, outcome.',
      escalationPrompt: 'Immediately notify your supervisor and the disaster coordinator when a Class I patient needs evacuation assistance.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M02-P06', moduleId: 'ACHC-ART-M02', pageType: 'instruction',
    title: 'Technology-Dependent Patients & Continuity of Care',
    narrationText: `Technology-dependent patients are among the most vulnerable during emergencies, particularly power outages. These patients rely on devices such as ventilators, oxygen concentrators, infusion pumps, feeding pumps, and other electrically powered medical equipment. Class One triage specifically addresses these patients — those requiring a medical device to sustain life. During a potential widespread power blackout, the home environment and support system must be reviewed immediately. When appropriate, arrangements for evacuation to an acute care facility will be made. Key actions for technology-dependent patients include verifying that the patient has battery backup for critical devices, confirming the patient knows how to switch to backup power or manual operation, ensuring the patient has an adequate supply of consumables such as oxygen tanks, feeding supplies, and medications, coordinating with the equipment supplier for emergency support, and contacting local utility companies to request priority power restoration for patients on life-sustaining equipment. Continuity of care during emergencies means ensuring that critical treatments and monitoring continue even when normal operations are disrupted. The agency will follow emergency requirements during a disaster and will document in the agency records any attempts by staff to follow procedures in the event they are unable to comply with any requirements. If phone contact with patients is not possible, the answering service will be activated and a staff member will be assigned to manage incoming and outgoing messages. When the demand for personnel exceeds available resources, the following priority factors guide decisions: the availability of appropriate alternative coverage such as family or friends, the level of priority of the patient's medical and nursing needs, and the usual number of personnel hours the patient routinely receives.`,
    contentHtml: `<h3>Technology-Dependent Patients</h3><ul><li>Most vulnerable during power outages</li><li>Devices: ventilators, O2 concentrators, infusion pumps, feeding pumps</li><li>Class I triage: medical device required to sustain life</li></ul><h3>Key Actions</h3><ol><li>Verify battery backup for critical devices</li><li>Confirm patient knows backup/manual operation</li><li>Ensure adequate consumable supplies (O2 tanks, feeding, medications)</li><li>Coordinate with equipment supplier for emergency support</li><li>Contact utility company for priority power restoration</li></ol><h3>Priority Decision Factors</h3><ol><li>Availability of alternative coverage (family/friends)</li><li>Acuity level of medical/nursing needs</li><li>Usual number of care hours</li></ol>`,
    media: createMedia(
      'Photograph of a home health setup with an oxygen concentrator and backup portable oxygen tank. A checklist is visible showing "Battery Backup: ✓" and "Emergency Supply: ✓." Clean, organized medical setup in a home setting.',
      '10-second 720p video: Camera pans across a patient home showing medical equipment: O2 concentrator, backup tank, infusion pump with battery indicator. A nurse checks each device. Text overlay: "Technology-Dependent Patients: Prepare for Outages." Serious, instructional.',
      'image', 'duringNarration',
      'Display medical device and backup equipment image to reinforce the technology-dependent patient preparedness concepts.'
    ),
    duration: createDuration('ACHC-ART-M02', 'M02-P06', 'instruction', 'Technology-Dependent Patients & Continuity of Care',
      `Technology-dependent patients are among the most vulnerable during emergencies, particularly power outages. These patients rely on devices such as ventilators, oxygen concentrators, infusion pumps, feeding pumps, and other electrically powered medical equipment. Class One triage specifically addresses these patients — those requiring a medical device to sustain life. During a potential widespread power blackout, the home environment and support system must be reviewed immediately. When appropriate, arrangements for evacuation to an acute care facility will be made. Key actions for technology-dependent patients include verifying that the patient has battery backup for critical devices, confirming the patient knows how to switch to backup power or manual operation, ensuring the patient has an adequate supply of consumables such as oxygen tanks, feeding supplies, and medications, coordinating with the equipment supplier for emergency support, and contacting local utility companies to request priority power restoration for patients on life-sustaining equipment. Continuity of care during emergencies means ensuring that critical treatments and monitoring continue even when normal operations are disrupted. The agency will follow emergency requirements during a disaster and will document in the agency records any attempts by staff to follow procedures in the event they are unable to comply with any requirements. If phone contact with patients is not possible, the answering service will be activated and a staff member will be assigned to manage incoming and outgoing messages. When the demand for personnel exceeds available resources, the following priority factors guide decisions: the availability of appropriate alternative coverage such as family or friends, the level of priority of the patient's medical and nursing needs, and the usual number of personnel hours the patient routinely receives.`, 2),
    challenge: {
      challengeId: 'M02-C05', lessonId: 'M02-P06', moduleId: 'ACHC-ART-M02',
      title: 'Power Outage — Technology-Dependent Patient',
      scenario: 'You receive notice of an expected 12-hour power outage due to planned utility maintenance. You have a patient, Mr. Chen, who uses an oxygen concentrator 24/7 and an infusion pump for IV antibiotics. He lives with his elderly wife.',
      narrationText: 'A twelve-hour planned power outage is expected. Mr. Chen uses oxygen twenty-four-seven and an infusion pump. He lives with his elderly wife. What preparations must be made?',
      prompt: 'What is the priority preparation sequence for Mr. Chen?',
      interactionType: 'sequence-the-steps',
      options: [
        createChallengeOption('a', 'Verify he has backup portable oxygen tanks sufficient for 12+ hours. Confirm he and his wife know how to switch to portable O2. Coordinate with the infusion company for battery-powered pump or adjusted infusion schedule. Contact the utility company to flag his address for priority restoration. Notify your supervisor. Document all preparations. Establish a check-in schedule with the patient during the outage.', 'Correct. This comprehensive preparation addresses both device dependencies, ensures the patient and caregiver know the backup procedures, coordinates with vendors, flags the address with the utility, and establishes monitoring during the outage.', true),
        createChallengeOption('b', 'Tell Mr. Chen to go to the hospital for the day.', 'Sending a stable home-care patient to the hospital for a planned outage is resource-inefficient when proper preparation can maintain safe home care. Hospitalization may be needed only if adequate backup cannot be arranged.', false),
        createChallengeOption('c', 'Cancel his IV medication for the day and tell him to use his portable oxygen.', 'Canceling prescribed medication without physician authorization is unsafe. All device dependencies must be addressed through proper planning and coordination, not by eliminating treatment.', false),
      ],
      bestPracticeAnswer: 'Comprehensive preparation: verify backup supplies, educate patient/caregiver, coordinate with vendors, flag utility, notify supervisor, document, establish check-in schedule.',
      teachingPoint: 'Planned power outages require proactive preparation for technology-dependent patients. Address every device dependency, coordinate with suppliers, and establish monitoring.',
      documentationPrompt: 'Document: outage notification, patient device dependencies, backup preparations verified, vendor coordination, utility notification, supervisor notified, check-in schedule established.',
      escalationPrompt: 'If adequate backup cannot be arranged, notify the physician and supervisor immediately to consider temporary facility placement.',
      estimatedInteractionMinutes: 5,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M02-P07', moduleId: 'ACHC-ART-M02', pageType: 'instruction',
    title: 'Downtime Documentation & Record Damage',
    narrationText: `During a disaster, your normal documentation systems may be unavailable. Downtime documentation refers to the records you create using alternative methods — paper forms, handwritten notes, or temporary documentation — when electronic systems are inaccessible. Key downtime documentation principles: document every patient contact, attempted contact, and clinical observation, even on paper. Include the date, time, patient name, your name and credentials, and the clinical situation. If you make clinical decisions in the field during an emergency, document your reasoning, the information available to you, and the actions you took. After the emergency, transfer all downtime documentation into the permanent record as soon as possible. If written records are damaged during a disaster, the agency has strict rules. The agency must not reproduce or recreate patient records except from existing electronic records. Records reproduced from existing electronic records must include the date the record was reproduced, the agency staff member who reproduced the record, and how the original record was damaged. The agency must notify the state licensing unit by fax or email no later than five working days after any of the following temporary changes resulting from the effects of an emergency: temporary relocation address including date, license number and physical address and phone number, and the date the agency plans to return to its permanent location. If the agency temporarily expands its service area to assist in the emergency, the state must be notified of the license number and revised service area boundaries, the date of temporary expansion, and the date the expansion ends.`,
    contentHtml: `<h3>Downtime Documentation</h3><ul><li>Document every contact, attempted contact, and observation — even on paper</li><li>Include: date, time, patient name, your name/credentials, clinical situation</li><li>Document clinical decision reasoning and actions taken</li><li>Transfer all downtime records to permanent record ASAP after emergency</li></ul><h3>Record Damage Rules</h3><ul><li>Do NOT reproduce/recreate records except from existing electronic records</li><li>Reproduced records must include: date reproduced, who reproduced them, how originals were damaged</li></ul><h3>State Notification Requirements (within 5 working days)</h3><ul><li>Temporary relocation address and date</li><li>License number, physical address, phone</li><li>Return-to-permanent-location date</li><li>Service area expansion: boundaries, start date, end date</li></ul>`,
    media: createMedia(
      'Photograph of handwritten medical notes on a clipboard in a dimly lit setting (simulating power outage). A flashlight illuminates the page. Notes are generic/non-identifying. Realistic emergency documentation scene.',
      '10-second 720p video: A nurse writes notes by flashlight on a paper form. Camera shows the form header: "Emergency Downtime Documentation." Fields being filled: date, time, patient initials, assessment notes. Text overlay: "When Systems Are Down — Document Everything." Serious tone.',
      'image', 'beforeNarration',
      'Display emergency documentation scene to illustrate the reality of downtime documentation during disasters.'
    ),
    duration: createDuration('ACHC-ART-M02', 'M02-P07', 'instruction', 'Downtime Documentation & Record Damage',
      `During a disaster, your normal documentation systems may be unavailable. Downtime documentation refers to the records you create using alternative methods — paper forms, handwritten notes, or temporary documentation — when electronic systems are inaccessible. Key downtime documentation principles: document every patient contact, attempted contact, and clinical observation, even on paper. Include the date, time, patient name, your name and credentials, and the clinical situation. If you make clinical decisions in the field during an emergency, document your reasoning, the information available to you, and the actions you took. After the emergency, transfer all downtime documentation into the permanent record as soon as possible. If written records are damaged during a disaster, the agency has strict rules. The agency must not reproduce or recreate patient records except from existing electronic records. Records reproduced from existing electronic records must include the date the record was reproduced, the agency staff member who reproduced the record, and how the original record was damaged. The agency must notify the state licensing unit by fax or email no later than five working days after any of the following temporary changes resulting from the effects of an emergency: temporary relocation address including date, license number and physical address and phone number, and the date the agency plans to return to its permanent location. If the agency temporarily expands its service area to assist in the emergency, the state must be notified of the license number and revised service area boundaries, the date of temporary expansion, and the date the expansion ends.`, 2),
    challenge: {
      challengeId: 'M02-C06', lessonId: 'M02-P07', moduleId: 'ACHC-ART-M02',
      title: 'Record Damage Documentation Decision',
      scenario: 'After a flood, several patient paper charts stored at the office were water-damaged and are now unreadable. Your supervisor asks what the agency can do about the damaged records.',
      narrationText: 'After a flood, patient paper charts at the office are water-damaged and unreadable. What can the agency do to address the damaged records?',
      prompt: 'What is the correct approach to damaged patient records?',
      interactionType: 'choose-best-response',
      options: [
        createChallengeOption('a', 'Recreate the records from memory based on what staff members remember.', 'Recreating records from memory is not permitted. The agency must not reproduce or recreate records except from existing electronic records.', false),
        createChallengeOption('b', 'Reproduce records only from existing electronic records. Each reproduced record must include the date reproduced, the staff member who reproduced it, and how the original was damaged. Notify the state licensing unit within 5 working days.', 'Correct. Records can only be reproduced from existing electronic sources, with full documentation of the reproduction process. State notification is required within 5 working days.', true),
        createChallengeOption('c', 'Discard the damaged records and start fresh for those patients.', 'Discarding damaged records without proper documentation and reproduction from electronic sources violates agency policy and regulatory requirements.', false),
      ],
      bestPracticeAnswer: 'Reproduce only from electronic records with full documentation of the reproduction; notify the state within 5 working days.',
      teachingPoint: 'Damaged records cannot be recreated from memory. Only existing electronic records can be used for reproduction, and the reproduction must be documented. State notification is required within 5 working days.',
      documentationPrompt: 'Document: date of damage, cause of damage, records affected, reproduction source (electronic), date reproduced, staff who reproduced, state notification date and method.',
      escalationPrompt: 'Report record damage immediately to the Administrator for state notification coordination.',
      estimatedInteractionMinutes: 3,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // M02 Scenario Challenge Page
  {
    pageId: 'M02-P08', moduleId: 'ACHC-ART-M02', pageType: 'scenario-challenge',
    title: 'Comprehensive Disaster Response Scenario',
    narrationText: `Let us work through a comprehensive disaster scenario. A Category Two hurricane has made landfall in your service area. Power is out across the county. Roads are partially flooded. Your cell phone has intermittent service. The office is closed and the answering service is active. You are at home and have been contacted by the disaster coordinator through a text message. Your current caseload includes five patients: Patient one is Mr. Williams, who is on a home ventilator and lives alone. Patient two is Mrs. Rodriguez, who receives daily insulin injections and IV antibiotics, and lives with her adult daughter. Patient three is Mr. Thompson, who receives weekly physical therapy visits and has a supportive wife at home. Patient four is Mrs. Lee, who requires sterile wound care for a surgical wound with significant drainage, and lives with her son. Patient five is Mrs. Davis, a postoperative knee replacement patient with no open wound, anticipated for discharge in one week. You need to classify each patient, prioritize your response, and determine your first actions. Think through each patient systematically using the triage classifications and priority factors you learned.`,
    contentHtml: `<h3>Hurricane Response Scenario</h3><p><strong>Situation:</strong> Category 2 hurricane, county-wide power outage, partial flooding, intermittent cell service</p><p><strong>Your Caseload:</strong></p><ol><li>Mr. Williams — Home ventilator, lives alone</li><li>Mrs. Rodriguez — Daily insulin + IV antibiotics, lives with adult daughter</li><li>Mr. Thompson — Weekly PT, supportive wife at home</li><li>Mrs. Lee — Sterile wound care (significant drainage), lives with son</li><li>Mrs. Davis — Post-op knee, no wound, discharge in 1 week</li></ol>`,
    media: createMedia(
      'Illustration of a home health worker at a kitchen table with a flashlight, phone, and patient list. Outside the window, storm conditions are visible. The worker is reviewing a triage classification chart. Tense but professional atmosphere.',
      '10-second 720p video: Storm conditions outside a window. Inside, a healthcare worker reviews a patient list by flashlight. Camera shows the worker triaging patients on paper. Text overlay: "Hurricane Response — Triage Your Caseload." Serious, urgent but controlled tone.',
      'image', 'beforeNarration',
      'Display disaster response planning scene to immerse the learner in the scenario context.'
    ),
    duration: createDuration('ACHC-ART-M02', 'M02-P08', 'scenario-challenge', 'Comprehensive Disaster Response Scenario',
      `Let us work through a comprehensive disaster scenario. A Category Two hurricane has made landfall in your service area. Power is out across the county. Roads are partially flooded. Your cell phone has intermittent service. The office is closed and the answering service is active. You are at home and have been contacted by the disaster coordinator through a text message. Your current caseload includes five patients: Patient one is Mr. Williams, who is on a home ventilator and lives alone. Patient two is Mrs. Rodriguez, who receives daily insulin injections and IV antibiotics, and lives with her adult daughter. Patient three is Mr. Thompson, who receives weekly physical therapy visits and has a supportive wife at home. Patient four is Mrs. Lee, who requires sterile wound care for a surgical wound with significant drainage, and lives with her son. Patient five is Mrs. Davis, a postoperative knee replacement patient with no open wound, anticipated for discharge in one week. You need to classify each patient, prioritize your response, and determine your first actions. Think through each patient systematically using the triage classifications and priority factors you learned.`, 5),
    challenge: {
      challengeId: 'M02-C07', lessonId: 'M02-P08', moduleId: 'ACHC-ART-M02',
      title: 'Hurricane Triage and Response',
      scenario: 'Classify and prioritize five patients during a hurricane with county-wide power outage.',
      narrationText: 'Apply triage classifications and determine your priority response order for the five patients.',
      prompt: 'What is the correct triage classification and priority order?',
      interactionType: 'scenario-decision',
      options: [
        createChallengeOption('a', 'Mr. Williams = Class I (ventilator, alone — IMMEDIATE). Mrs. Rodriguez = Class II (insulin + IV, daughter available). Mrs. Lee = Class II (wound care with significant drainage, son available). Mr. Thompson = Class IV (weekly PT, wife at home). Mrs. Davis = Class IV (post-op, no wound, discharge soon). Priority: Williams → Rodriguez → Lee → Thompson/Davis.', 'Correct. Mr. Williams on a ventilator and living alone is the highest priority — Class I, immediate. Mrs. Rodriguez and Mrs. Lee are Class II with family support but clinical needs. Mr. Thompson and Mrs. Davis can safely defer.', true),
        createChallengeOption('b', 'Visit all five patients in geographical order to save gas.', 'During emergencies, geographic convenience does not override clinical triage. Life-threatening patients (Class I) must be prioritized regardless of location.', false),
        createChallengeOption('c', 'Wait for the office to reopen and get direction from the supervisor before visiting anyone.', 'Class I patients cannot wait. The disaster coordinator has contacted you. Your emergency training requires immediate triage-based response.', false),
      ],
      bestPracticeAnswer: 'Williams (Class I) → Rodriguez and Lee (Class II) → Thompson and Davis (Class IV)',
      teachingPoint: 'During a disaster, triage is based on clinical acuity and support availability. Ventilator-dependent patients living alone are the highest priority. Always classify before acting.',
      documentationPrompt: 'Document: each patient\'s triage classification, contact attempts, visit outcomes, and actions taken. Use downtime documentation if electronic systems are unavailable.',
      escalationPrompt: 'If you cannot reach a Class I patient or roads are impassable, contact emergency services (911) immediately and notify the disaster coordinator.',
      estimatedInteractionMinutes: 5,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // M02 Documentation Practice
  {
    pageId: 'M02-P09', moduleId: 'ACHC-ART-M02', pageType: 'documentation-practice',
    title: 'Emergency Documentation Practice',
    narrationText: `After responding to the hurricane scenario, you must document your actions. Emergency documentation serves two critical purposes: it creates a clinical record of patient care decisions and it demonstrates the agency's compliance with emergency procedures. For this documentation exercise, consider what must be recorded for each patient encounter during the hurricane response. Your documentation must include the date and time of each contact or attempted contact, the patient's triage classification and the basis for that classification, the communication method used — phone, in-person, text, or through answering service, the patient's current clinical status upon contact, any clinical decisions made in the field including your reasoning, actions taken including care provided, referrals made, or emergency services contacted, the patient's location if they have evacuated or relocated, the status of medical equipment and supplies, any instructions given to the patient or caregiver, and a plan for follow-up contact. Remember: if normal documentation systems are unavailable, use downtime documentation. Write clearly on any available paper. Include your name, credentials, and the date and time on every note. Transfer all downtime documentation to the permanent record as soon as systems are restored.`,
    contentHtml: `<h3>Emergency Documentation Requirements</h3><p>For each patient encounter during an emergency, document:</p><ol><li>Date and time of contact/attempted contact</li><li>Triage classification and basis</li><li>Communication method (phone, in-person, text, answering service)</li><li>Current clinical status</li><li>Clinical decisions made and reasoning</li><li>Actions taken (care, referrals, 911 contact)</li><li>Patient location (especially if evacuated/relocated)</li><li>Medical equipment and supply status</li><li>Instructions given to patient/caregiver</li><li>Follow-up plan</li></ol><p><strong>Downtime:</strong> Write clearly, include name/credentials/date/time, transfer to permanent record when systems restored.</p>`,
    media: createMedia(
      'Template illustration of an emergency documentation form with labeled fields: Date/Time, Patient, Triage Class, Communication Method, Status, Actions, Equipment, Instructions, Follow-up. Clean, organized form design.',
      '10-second 720p video: Hands filling in an emergency documentation template. Each field populates in sequence. Text overlay: "Document Every Emergency Action." Professional, instructional tone.',
      'image', 'beforeNarration',
      'Display emergency documentation template to provide a practical reference for the documentation practice.'
    ),
    duration: createDuration('ACHC-ART-M02', 'M02-P09', 'documentation-practice', 'Emergency Documentation Practice',
      `After responding to the hurricane scenario, you must document your actions. Emergency documentation serves two critical purposes: it creates a clinical record of patient care decisions and it demonstrates the agency's compliance with emergency procedures. For this documentation exercise, consider what must be recorded for each patient encounter during the hurricane response. Your documentation must include the date and time of each contact or attempted contact, the patient's triage classification and the basis for that classification, the communication method used — phone, in-person, text, or through answering service, the patient's current clinical status upon contact, any clinical decisions made in the field including your reasoning, actions taken including care provided, referrals made, or emergency services contacted, the patient's location if they have evacuated or relocated, the status of medical equipment and supplies, any instructions given to the patient or caregiver, and a plan for follow-up contact. Remember: if normal documentation systems are unavailable, use downtime documentation. Write clearly on any available paper. Include your name, credentials, and the date and time on every note. Transfer all downtime documentation to the permanent record as soon as systems are restored.`, 6),
    challenge: {
      challengeId: 'M02-C08', lessonId: 'M02-P09', moduleId: 'ACHC-ART-M02',
      title: 'Emergency Documentation Selection',
      scenario: 'You visited Mr. Williams (Class I, ventilator) during the hurricane. Power was out. You found him using his battery backup. Battery had approximately 4 hours remaining. You contacted 911 for priority power restoration and his equipment company for an emergency generator delivery.',
      narrationText: 'Select the documentation entry that most completely captures your emergency visit with Mr. Williams.',
      prompt: 'Which documentation entry is most complete?',
      interactionType: 'documentation-practice',
      options: [
        createChallengeOption('a', '"Visited Mr. Williams. Power is out. Ventilator on battery."', 'Incomplete. Missing triage class, battery remaining time, actions taken, contacts made, and follow-up plan.', false),
        createChallengeOption('b', '"10/15 14:30 — In-person visit to Mr. Williams (Class I: ventilator-dependent, lives alone). County-wide power outage due to hurricane. Patient found alert, ventilator running on battery backup with approximately 4 hours remaining. Home is intact, no flooding. Called 911 for priority power restoration request — reference #4521. Contacted ABC Medical Equipment for emergency generator delivery — ETA 2 hours. Patient instructed to call 911 immediately if battery alarm sounds before generator arrives. Follow-up call scheduled in 1 hour. Will coordinate with disaster coordinator for ongoing monitoring. —[Name, RN]"', 'Correct. This entry includes date/time, communication method, triage class, clinical status, battery status, actions taken with reference numbers, patient instructions, and follow-up plan. This is the standard for emergency documentation.', true),
        createChallengeOption('c', '"Patient OK. Called for generator."', 'Critically incomplete. Emergency documentation must be thorough enough to demonstrate clinical decision-making and agency compliance.', false),
      ],
      bestPracticeAnswer: 'Complete documentation with date/time, triage class, clinical status, all actions with reference numbers, patient instructions, and follow-up plan.',
      teachingPoint: 'Emergency documentation must be even more detailed than routine documentation because it records clinical decisions made under extraordinary circumstances and demonstrates agency compliance.',
      documentationPrompt: 'Use this format: Date/Time → Method → Triage Class → Status → Actions (with reference numbers) → Instructions → Follow-up Plan → Signature/Credentials.',
      escalationPrompt: 'If you cannot document in real-time, make notes as soon as safely possible and transfer to the permanent record.',
      estimatedInteractionMinutes: 5,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // M02 After-Action Documentation
  {
    pageId: 'M02-P10', moduleId: 'ACHC-ART-M02', pageType: 'documentation-practice',
    title: 'After-Action Review & Continuity Documentation',
    narrationText: `After every emergency response, your agency conducts an after-action review. This review is part of the agency's commitment to continuous improvement and is discussed at the Professional Advisory Committee meeting. The after-action review examines what happened during the emergency, what the agency's response was, what went well, what did not go well, and what improvements should be made to the emergency preparedness plan. As a field worker, you contribute to this review by providing accurate documentation of your emergency response activities. Your documentation should include a summary of each patient encounter during the emergency, any challenges you faced in providing care — such as impassable roads, communication failures, or supply shortages, how you resolved or attempted to resolve those challenges, any deviations from the normal plan of care and the reasons for those deviations, and recommendations for improving the emergency response based on your field experience. The agency's emergency preparedness plan is a living document. It is reviewed after every response and at least yearly. Your field experience during emergencies provides valuable information for improving the plan. When you complete your after-action documentation, be honest and thorough. The goal is not to assign blame but to learn and improve. Every emergency teaches lessons that can make the next response more effective. Document facts and observations, not opinions about others' performance. Focus on processes, communication, resources, and outcomes.`,
    contentHtml: `<h3>After-Action Review</h3><ul><li>Conducted after every emergency response</li><li>Reviewed at Professional Advisory Committee meeting</li><li>Examines: what happened, response, successes, failures, improvements</li></ul><h3>Your Contribution</h3><ul><li>Summary of each patient encounter</li><li>Challenges faced (roads, communication, supplies)</li><li>How challenges were resolved</li><li>Care plan deviations and reasons</li><li>Recommendations for plan improvement</li></ul><h3>Documentation Principles</h3><ul><li>Be honest and thorough</li><li>Focus on learning, not blame</li><li>Document facts and observations</li><li>Focus on processes, communication, resources, and outcomes</li></ul>`,
    media: createMedia(
      'Professional photograph of a post-emergency debrief meeting. A small team sits around a conference table with a whiteboard showing "After-Action Review" and listed topics. Professional, collaborative atmosphere.',
      '10-second 720p video: A team gathers in a conference room. A facilitator writes on a whiteboard: "What Worked," "What Didn\'t," "Improvements." Team members contribute ideas. Text overlay: "After-Action Review — Learn & Improve." Collaborative, professional tone.',
      'image', 'beforeNarration',
      'Display after-action review meeting to illustrate the debriefing and continuous improvement process.'
    ),
    duration: createDuration('ACHC-ART-M02', 'M02-P10', 'documentation-practice', 'After-Action Review & Continuity Documentation',
      `After every emergency response, your agency conducts an after-action review. This review is part of the agency's commitment to continuous improvement and is discussed at the Professional Advisory Committee meeting. The after-action review examines what happened during the emergency, what the agency's response was, what went well, what did not go well, and what improvements should be made to the emergency preparedness plan. As a field worker, you contribute to this review by providing accurate documentation of your emergency response activities. Your documentation should include a summary of each patient encounter during the emergency, any challenges you faced in providing care — such as impassable roads, communication failures, or supply shortages, how you resolved or attempted to resolve those challenges, any deviations from the normal plan of care and the reasons for those deviations, and recommendations for improving the emergency response based on your field experience. The agency's emergency preparedness plan is a living document. It is reviewed after every response and at least yearly. Your field experience during emergencies provides valuable information for improving the plan. When you complete your after-action documentation, be honest and thorough. The goal is not to assign blame but to learn and improve. Every emergency teaches lessons that can make the next response more effective. Document facts and observations, not opinions about others' performance. Focus on processes, communication, resources, and outcomes.`, 5),
    challenge: {
      challengeId: 'M02-C09', lessonId: 'M02-P10', moduleId: 'ACHC-ART-M02',
      title: 'After-Action Contribution',
      scenario: 'During the hurricane response, you found that your patient contact list was outdated — two patients had moved and you had no current addresses or phone numbers. This delayed your triage response.',
      narrationText: 'Your patient contact list was outdated during the hurricane, causing delays. How should you document this in the after-action review?',
      prompt: 'What is the appropriate after-action documentation approach?',
      interactionType: 'documentation-practice',
      options: [
        createChallengeOption('a', '"The office failed to update patient information."', 'This assigns blame rather than documenting facts. After-action reviews should focus on process improvements, not blame.', false),
        createChallengeOption('b', '"During the hurricane response on [date], two patient records contained outdated contact information. This caused an estimated 45-minute delay in completing triage contact. Recommendation: implement a quarterly review of patient emergency contact information, including current address, phone, and alternate contact. Additionally, consider a field-accessible digital patient contact list that syncs with the main system."', 'Correct. This documents the factual problem, quantifies the impact, and provides constructive recommendations for improvement. No blame is assigned.', true),
        createChallengeOption('c', '"Some patient info was wrong. Should be updated."', 'This is too vague to be useful in an after-action review. Specific details about the impact and actionable recommendations are needed.', false),
      ],
      bestPracticeAnswer: 'Document the factual problem, quantify the impact, and provide specific improvement recommendations.',
      teachingPoint: 'After-action documentation should be factual, specific, and constructive. Quantify impacts when possible and propose actionable improvements.',
      documentationPrompt: 'After-action format: What happened → Impact → Root cause → Recommendation → Implementation timeline.',
      escalationPrompt: 'Submit your after-action documentation to your supervisor for inclusion in the agency\'s after-action report.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // M02 Pre-Assessment
  {
    pageId: 'M02-P11', moduleId: 'ACHC-ART-M02', pageType: 'pre-assessment',
    title: 'Pre-Assessment: Emergency & Disaster Preparedness',
    narrationText: `Let us check your understanding with a pre-assessment before the graded final. This contains six questions. It is not graded and does not count toward your final score. You will receive immediate feedback.`,
    contentHtml: `<h3>Pre-Assessment: Emergency & Disaster Preparedness</h3><p>6 questions · Not graded · Immediate feedback</p>`,
    media: createMedia('Clipboard with checklist labeled "Pre-Assessment." Clean design.', '10-second 720p: Animated checklist with emergency topics. Text: "Check Your Knowledge."', 'image', 'beforeNarration', 'Display pre-assessment image.'),
    duration: createDuration('ACHC-ART-M02', 'M02-P11', 'pre-assessment', 'Pre-Assessment: Emergency & Disaster Preparedness',
      `Let us check your understanding with a pre-assessment before the graded final. This contains six questions. It is not graded and does not count toward your final score. You will receive immediate feedback.`, 8),
    assessmentQuestions: [
      { questionId: 'M02-PRE-Q01', moduleId: 'ACHC-ART-M02', questionText: 'Who is designated as the agency disaster coordinator?', options: [createOption('a', 'Director of Nursing', false, 'The DON has emergency roles but is not the designated disaster coordinator.'), createOption('b', 'Administrator', true, 'Correct. The Administrator is designated as the disaster coordinator.'), createOption('c', 'The most experienced nurse on duty', false, 'The disaster coordinator is a designated role, not based on who is on duty.'), createOption('d', 'The IT manager', false, 'The IT manager is not designated as disaster coordinator.')], mappedObjective: 'Identify agency emergency chain of command', source: 'supplemental', reviewRequired: false },
      { questionId: 'M02-PRE-Q02', moduleId: 'ACHC-ART-M02', questionText: 'A patient on a ventilator who lives alone is classified as:', options: [createOption('a', 'Class II', false, 'Class II patients have in-home support. A ventilator patient alone is Class I.'), createOption('b', 'Class I', true, 'Correct. Life-threatening condition requiring medical device, lives alone = Class I.'), createOption('c', 'Class III', false, 'Class III services can be postponed 24-48 hours. A ventilator patient cannot wait.'), createOption('d', 'Class IV', false, 'Class IV has maximum family support. This patient lives alone.')], mappedObjective: 'Apply patient triage classifications', source: 'supplemental', reviewRequired: false },
      { questionId: 'M02-PRE-Q03', moduleId: 'ACHC-ART-M02', questionText: 'How often is the emergency preparedness plan reviewed?', options: [createOption('a', 'Monthly', false, 'More frequent than required. Plan is reviewed after responses and at least yearly.'), createOption('b', 'After every response and at least yearly', true, 'Correct. The plan is reviewed as needed, after every response, and at least yearly through the PAC.'), createOption('c', 'Every 5 years', false, 'This is far too infrequent. Annual review is the minimum.'), createOption('d', 'Only when a disaster occurs', false, 'The plan is reviewed annually at minimum, not only after disasters.')], mappedObjective: 'Identify emergency plan review schedule', source: 'supplemental', reviewRequired: false },
      { questionId: 'M02-PRE-Q04', moduleId: 'ACHC-ART-M02', questionText: 'When records are damaged in a disaster, the agency may reproduce them from:', options: [createOption('a', 'Staff memory and recollection', false, 'Records cannot be recreated from memory.'), createOption('b', 'Existing electronic records only', true, 'Correct. The agency must not reproduce records except from existing electronic records.'), createOption('c', 'Patient or family accounts', false, 'Patient accounts are not an authorized source for record reproduction.'), createOption('d', 'Other agencies\' records', false, 'Other agencies\' records are not an authorized source.')], mappedObjective: 'Understand record damage and reproduction rules', source: 'supplemental', reviewRequired: false },
      { questionId: 'M02-PRE-Q05', moduleId: 'ACHC-ART-M02', questionText: 'Is the agency required to physically evacuate or transport patients during an emergency?', options: [createOption('a', 'Yes, for all patients', false, 'The agency is not required to evacuate or transport patients.'), createOption('b', 'No, but the agency coordinates with local authorities', true, 'Correct. The agency is not required to physically evacuate patients but coordinates with local emergency authorities.'), createOption('c', 'Only for Class I patients', false, 'The agency is not required to evacuate ANY patients but coordinates for those needing assistance.'), createOption('d', 'Only if the patient has insurance', false, 'Insurance status does not determine evacuation responsibility.')], mappedObjective: 'Identify agency evacuation responsibilities', source: 'supplemental', reviewRequired: false },
      { questionId: 'M02-PRE-Q06', moduleId: 'ACHC-ART-M02', questionText: 'Class III emergency patients\' services can be postponed how long without adverse effects?', options: [createOption('a', '4-8 hours', false, 'This is too short. Class III can defer 24-48 hours.'), createOption('b', '24-48 hours', true, 'Correct. Class III services can be postponed 24-48 hours without adverse effects.'), createOption('c', '72-96 hours', false, 'This is the Class IV timeframe, not Class III.'), createOption('d', '1 week', false, 'No triage class allows a one-week deferral.')], mappedObjective: 'Apply triage deferral timeframes', source: 'supplemental', reviewRequired: false },
    ],
    requiredForCompletion: true,
  },
  // M02 Final Assessment
  {
    pageId: 'M02-P12', moduleId: 'ACHC-ART-M02', pageType: 'final-assessment',
    title: 'Final Assessment: Emergency & Disaster Preparedness',
    narrationText: `You have reached the final graded assessment for Module Two: Emergency and Disaster Preparedness. This contains twelve questions. You must score at least eighty percent to pass. Read each question carefully.`,
    contentHtml: `<h3>Final Assessment: Emergency & Disaster Preparedness</h3><p><strong>12 questions · Passing score: 80% · Graded</strong></p>`,
    media: createMedia('Formal assessment document with seal. Header: "Final Assessment."', '10-second 720p: Assessment form populates with score. Green check. "80% Required."', 'image', 'beforeNarration', 'Display formal assessment image.'),
    duration: createDuration('ACHC-ART-M02', 'M02-P12', 'final-assessment', 'Final Assessment: Emergency & Disaster Preparedness',
      `You have reached the final graded assessment for Module Two: Emergency and Disaster Preparedness. This contains twelve questions. You must score at least eighty percent to pass. Read each question carefully.`, 15),
    assessmentQuestions: [
      // PROVIDED quiz questions first
      { questionId: 'M02-FIN-Q01', moduleId: 'ACHC-ART-M02', questionText: 'The agency is not required to transport or physically evacuate a patient in the event of an emergency.', options: [createOption('a', 'True', true, 'Correct. The agency is not required to physically evacuate or transport patients.'), createOption('b', 'False', false, 'Incorrect. The agency is indeed not required to evacuate or transport patients.')], mappedObjective: 'Identify agency evacuation responsibilities', source: 'provided', reviewRequired: false },
      { questionId: 'M02-FIN-Q02', moduleId: 'ACHC-ART-M02', questionText: 'The patient is provided with the following:', options: [createOption('a', 'A copy of the Agency\'s policy on how to handle disaster related emergencies in the home', false, 'This is one item, but not the complete answer.'), createOption('b', 'Patient responsibilities in the Agency\'s Emergency Preparedness and Response Plan', false, 'This is one item, but not the complete answer.'), createOption('c', 'A list of community disaster resources that can assist during a disaster-related emergency', false, 'This is one item, but not the complete answer.'), createOption('d', 'All of the above', true, 'Correct. Patients receive all three: agency emergency policy, patient responsibilities, and community disaster resources.')], mappedObjective: 'Identify patient emergency education requirements', source: 'provided', reviewRequired: false },
      { questionId: 'M02-FIN-Q03', moduleId: 'ACHC-ART-M02', questionText: 'The agency reviews the Emergency Disaster Plan as:', options: [createOption('a', 'Needed', false, 'Partially correct but not the complete answer.'), createOption('b', 'At least yearly', false, 'Partially correct but not the complete answer.'), createOption('c', 'After each response', false, 'Partially correct but not the complete answer.'), createOption('d', 'All of the above', true, 'Correct. The plan is reviewed as needed, after every response, and at least yearly.')], mappedObjective: 'Identify emergency plan review schedule', source: 'provided', reviewRequired: false },
      { questionId: 'M02-FIN-Q04', moduleId: 'ACHC-ART-M02', questionText: 'What are the types of emergencies?', options: [createOption('a', 'Man-Made', false, 'Man-made is one type but not the only type.'), createOption('b', 'Natural', false, 'Natural is one type but not the only type.'), createOption('c', 'Technological', false, 'Technological is one type but not the only type.'), createOption('d', 'Any of the above', true, 'Correct. The three types are man-made, natural, and technological.')], mappedObjective: 'Identify types of emergencies', source: 'provided', reviewRequired: false },
      // Supplemental questions
      { questionId: 'M02-FIN-Q05', moduleId: 'ACHC-ART-M02', questionText: 'Who is designated as the agency disaster coordinator?', options: [createOption('a', 'Director of Nursing', false, 'The DON has emergency roles but the disaster coordinator is the Administrator.'), createOption('b', 'Administrator', true, 'Correct. The Administrator is the designated disaster coordinator.'), createOption('c', 'Safety Committee Chair', false, 'The Safety Committee has a separate function from disaster coordination.'), createOption('d', 'The most senior employee on site', false, 'The coordinator is a designated position, not based on seniority.')], mappedObjective: 'Identify emergency chain of command', source: 'supplemental', reviewRequired: false },
      { questionId: 'M02-FIN-Q06', moduleId: 'ACHC-ART-M02', questionText: 'A patient on a home ventilator who lives alone and is at risk during a power outage is classified as:', options: [createOption('a', 'Class I — immediate, life-threatening', true, 'Correct. Ventilator-dependent patients are Class I: potentially life-threatening, requiring medical devices to sustain life.'), createOption('b', 'Class II — family support available', false, 'Class II requires in-home support. This patient lives alone.'), createOption('c', 'Class III — can defer 24-48 hours', false, 'A ventilator patient cannot defer care for 24-48 hours.'), createOption('d', 'Class IV — maximum family support', false, 'This patient has no family support and is device-dependent.')], mappedObjective: 'Apply patient triage classifications', source: 'supplemental', reviewRequired: false },
      { questionId: 'M02-FIN-Q07', moduleId: 'ACHC-ART-M02', questionText: 'Class IV emergency patients\' services can be postponed for how long without adverse effects?', options: [createOption('a', '24-48 hours', false, 'This is the Class III timeframe.'), createOption('b', '48-72 hours', false, 'This does not match any triage class.'), createOption('c', '72-96 hours', true, 'Correct. Class IV services can be postponed 72-96 hours without adverse effect.'), createOption('d', '1 week', false, 'No class allows a one-week deferral.')], mappedObjective: 'Apply triage deferral timeframes', source: 'supplemental', reviewRequired: false },
      { questionId: 'M02-FIN-Q08', moduleId: 'ACHC-ART-M02', questionText: 'If written records are damaged during a disaster, the agency:', options: [createOption('a', 'May recreate them from staff memory', false, 'Records cannot be recreated from memory.'), createOption('b', 'Must not reproduce records except from existing electronic records', true, 'Correct. Records can only be reproduced from existing electronic records, with documentation of the reproduction.'), createOption('c', 'Must destroy all remaining copies', false, 'Destroying records is not appropriate.'), createOption('d', 'May use patient self-reports to recreate them', false, 'Patient self-reports are not an authorized reproduction source.')], mappedObjective: 'Apply record damage rules', source: 'supplemental', reviewRequired: false },
      { questionId: 'M02-FIN-Q09', moduleId: 'ACHC-ART-M02', questionText: 'The state licensing unit must be notified of emergency-related temporary changes within:', options: [createOption('a', '24 hours', false, 'The requirement is 5 working days, not 24 hours.'), createOption('b', '5 working days', true, 'Correct. The state licensing unit must be notified within 5 working days.'), createOption('c', '30 days', false, '30 days is too long.'), createOption('d', '90 days', false, '90 days is far too long.')], mappedObjective: 'Identify state notification requirements', source: 'supplemental', reviewRequired: false },
      { questionId: 'M02-FIN-Q10', moduleId: 'ACHC-ART-M02', questionText: 'Which of the following is NOT required in your vehicle emergency kit?', options: [createOption('a', 'Full tank of gas', false, 'A full tank is required.'), createOption('b', 'Medical-grade oxygen tank', true, 'Correct. A personal medical-grade oxygen tank is not part of the vehicle emergency kit. The kit includes flashlight, radio, blankets, water, food, fire extinguisher, and vehicle tools.'), createOption('c', 'Blankets and flashlight', false, 'These are required items.'), createOption('d', 'Bottled water and non-perishable food', false, 'These are required items.')], mappedObjective: 'Identify field worker emergency preparedness requirements', source: 'supplemental', reviewRequired: false },
      { questionId: 'M02-FIN-Q11', moduleId: 'ACHC-ART-M02', questionText: 'When the demand for personnel exceeds available resources during an emergency, which factor is NOT used to determine visit priority?', options: [createOption('a', 'Availability of alternative coverage (family/friends)', false, 'This is a priority factor.'), createOption('b', 'Level of priority of medical/nursing needs', false, 'This is a priority factor.'), createOption('c', 'Patient\'s insurance type', true, 'Correct. Insurance type is not a factor in emergency triage. Priority is based on alternative coverage availability, medical acuity, and usual care hours.'), createOption('d', 'Usual number of personnel hours received', false, 'This is a priority factor.')], mappedObjective: '
claude-opus-4.6
0 tokens
·
11:10 PM

DOC
Prompt ACHC Training Module for Field Worker Employees (1).docx
continue part1.tsx
2:40 AM

Continuing Part 1 from where it was cut off. Picking up at M02 Final Assessment Q11 and completing through M03 and M04.

// ═══════════════════════════════════════════════════════════════════════════════
// ACHC_Journey_LMS.tsx — PART 1 CONTINUATION
// Resuming from M02-FIN-Q11 through M04 complete
// ═══════════════════════════════════════════════════════════════════════════════

// M02 Final Assessment Q11-Q12 (continuing)
      {
        questionId: 'M02-FIN-Q11', moduleId: 'ACHC-ART-M02',
        questionText: 'When the demand for personnel exceeds available resources during an emergency, which factor is NOT used to determine visit priority?',
        options: [
          createOption('a', 'Availability of alternative coverage (family/friends)', false, 'This is a priority factor.'),
          createOption('b', 'Level of priority of medical/nursing needs', false, 'This is a priority factor.'),
          createOption('c', 'Patient\'s insurance type', true, 'Correct. Insurance type is not a factor in emergency triage. Priority is based on alternative coverage availability, medical acuity, and usual care hours.'),
          createOption('d', 'Usual number of personnel hours received', false, 'This is a priority factor.'),
        ],
        mappedObjective: 'Identify emergency priority decision factors',
        source: 'supplemental', reviewRequired: false,
      },
      {
        questionId: 'M02-FIN-Q12', moduleId: 'ACHC-ART-M02',
        questionText: 'During downtime documentation in an emergency, which of the following must be included on every handwritten note?',
        options: [
          createOption('a', 'Only the patient\'s name', false, 'Name alone is insufficient for downtime documentation.'),
          createOption('b', 'Date, time, patient name, your name and credentials, and the clinical situation', true, 'Correct. Every downtime note must include date, time, patient name, your name/credentials, and the clinical situation for proper record-keeping.'),
          createOption('c', 'Only a brief summary of the visit', false, 'A brief summary without identifiers and timestamps is insufficient.'),
          createOption('d', 'Nothing — downtime documentation is optional', false, 'Downtime documentation is required. All emergency actions must be documented.'),
        ],
        mappedObjective: 'Apply downtime documentation requirements',
        source: 'supplemental', reviewRequired: false,
      },
    ],
    requiredForCompletion: true,
  },
  // M02 Remediation
  {
    pageId: 'M02-P13', moduleId: 'ACHC-ART-M02', pageType: 'remediation',
    title: 'Remediation: Emergency & Disaster Preparedness',
    narrationText: `You did not achieve the passing score on the final assessment. Review these key concepts before retaking. Emergency Plan Structure: The Administrator is the disaster coordinator. The plan covers four phases: mitigation, preparedness, response, and recovery. The plan is reviewed after every response and at least yearly. Types of Emergencies: Man-made, natural, and technological. The agency is not required to physically evacuate patients but coordinates with local authorities. Triage Classifications: Class One is life-threatening and requires immediate response. Examples include patients on ventilators, oxygen, or infusion. Class Two has in-home support available and includes daily insulin and IV medications. Class Three can defer twenty-four to forty-eight hours. Class Four can defer seventy-two to ninety-six hours. Communication: Maintain primary and alternate communication modes. Keep your vehicle emergency kit stocked. Have family preparedness plans. Technology-Dependent Patients: Verify backup power, educate patient on manual operation, coordinate with equipment suppliers. Documentation: Document every contact and attempted contact during emergencies. Include date, time, patient name, your name, credentials, and clinical situation. Transfer downtime documentation to permanent records when systems are restored. Record Damage: Do not recreate records from memory. Only reproduce from existing electronic records. Notify the state within five working days of temporary changes. After reviewing, retake the assessment.`,
    contentHtml: `<h3>Remediation: Review Key Concepts</h3><ul><li><strong>Disaster Coordinator:</strong> Administrator</li><li><strong>Plan Review:</strong> After every response + at least yearly</li><li><strong>3 Types:</strong> Man-made, Natural, Technological</li><li><strong>Triage:</strong> Class I (immediate) → Class IV (defer 72-96h)</li><li><strong>Agency NOT required to evacuate patients</strong></li><li><strong>Downtime Documentation:</strong> Date, time, patient, your name/credentials, situation</li><li><strong>Record Damage:</strong> Reproduce only from electronic records; notify state within 5 days</li></ul>`,
    media: createMedia('Study desk with open books and highlighted notes. "Review" banner.', '10-second 720p: Key concepts appear on screen. "Review & Retry." Encouraging tone.', 'image', 'beforeNarration', 'Display review image for supportive remediation context.'),
    duration: createDuration('ACHC-ART-M02', 'M02-P13', 'remediation', 'Remediation: Emergency & Disaster Preparedness',
      `You did not achieve the passing score on the final assessment. Review these key concepts before retaking. Emergency Plan Structure: The Administrator is the disaster coordinator. The plan covers four phases: mitigation, preparedness, response, and recovery. The plan is reviewed after every response and at least yearly. Types of Emergencies: Man-made, natural, and technological. The agency is not required to physically evacuate patients but coordinates with local authorities. Triage Classifications: Class One is life-threatening and requires immediate response. Class Two has in-home support. Class Three can defer twenty-four to forty-eight hours. Class Four can defer seventy-two to ninety-six hours. Communication and documentation requirements are critical. After reviewing, retake the assessment.`, 5),
    requiredForCompletion: true,
  },
  // M02 Attestation
  {
    pageId: 'M02-P14', moduleId: 'ACHC-ART-M02', pageType: 'attestation',
    title: 'Attestation & Signature: Emergency & Disaster Preparedness',
    narrationText: `Congratulations on completing Module Two: Emergency and Disaster Preparedness. By signing below, you confirm that you have personally completed all sections of this module, you understand the agency emergency preparedness plan and your role as a field worker, you can apply the four-class triage system, you know communication procedures and vehicle preparedness requirements, you understand downtime documentation and record damage rules, and you have passed the final assessment. Type your full legal name and check the attestation box to confirm.`,
    contentHtml: `<h3>Attestation & Signature</h3><p>I confirm completion of all Emergency & Disaster Preparedness training sections and passed the final assessment with ≥80%.</p><p><strong>[Signature Field]</strong> · <strong>[Checkbox]</strong> · <strong>[Timestamp]</strong></p>`,
    media: createMedia('Signed certificate with pen and stamp. Official.', '10-second 720p: Digital signature field populated. Checkmark. Timestamp. "Attestation Complete."', 'image', 'beforeNarration', 'Display attestation image.'),
    duration: createDuration('ACHC-ART-M02', 'M02-P14', 'attestation', 'Attestation & Signature',
      `Congratulations on completing Module Two. By signing below you confirm completion of all sections and passing the final assessment. Type your full legal name and check the attestation box.`, 2),
    requiredForCompletion: true,
  },
  // M02 Certificate
  {
    pageId: 'M02-P15', moduleId: 'ACHC-ART-M02', pageType: 'certificate',
    title: 'Certificate of Completion: Emergency & Disaster Preparedness',
    narrationText: `You have successfully completed Module Two: Emergency and Disaster Preparedness. Your certificate has been generated and your completion is recorded in your training transcript. Thank you for your commitment to emergency readiness.`,
    contentHtml: `<h3>🎓 Certificate of Completion</h3><p><strong>Module:</strong> ACHC-ART-M02 — Emergency & Disaster Preparedness</p><p><strong>Status:</strong> COMPLETE</p>`,
    media: createMedia('Certificate with gold border. Module 2 title, completion date, score, signature lines.', '10-second 720p: Certificate animates with gold seal. "Module 2 Complete."', 'image', 'beforeNarration', 'Display certificate.'),
    duration: createDuration('ACHC-ART-M02', 'M02-P15', 'certificate', 'Certificate of Completion',
      `You have successfully completed Module Two. Your certificate has been generated and recorded in your transcript.`, 1),
    requiredForCompletion: true,
  },
];

const MODULE_M02: ModuleData = {
  moduleId: 'ACHC-ART-M02',
  title: 'Emergency & Disaster Preparedness',
  description: 'Agency emergency plan, field-worker roles, patient triage classes, communication tree, shelter-in-place, evacuation support, technology-dependent patients, downtime documentation, missed-contact escalation, continuity of care, after-action documentation.',
  version: '1.0.0',
  sourceRefs: ['ACHC Training Prompt Document — Emergency/Disaster Section'],
  policyRefs: ['Agency Emergency Preparedness and Response Plan', 'Agency Continuity of Operations Plan'],
  formRefs: ['Downtime Documentation Form', 'After-Action Report'],
  workflowRefs: ['Emergency Communication Tree', 'Patient Triage Workflow'],
  reviewRequired: false,
  pages: M02_PAGES,
  preAssessmentQuestions: M02_PAGES.find(p => p.pageType === 'pre-assessment')?.assessmentQuestions || [],
  finalAssessmentQuestions: M02_PAGES.find(p => p.pageType === 'final-assessment')?.assessmentQuestions || [],
  remediationObjectives: [
    { objectiveId: 'M02-OBJ-01', description: 'Identify agency emergency plan structure and chain of command', relatedPages: ['M02-P02'] },
    { objectiveId: 'M02-OBJ-02', description: 'Apply patient triage classifications (Class I-IV)', relatedPages: ['M02-P03'] },
    { objectiveId: 'M02-OBJ-03', description: 'Identify emergency types and communication procedures', relatedPages: ['M02-P03', 'M02-P04'] },
    { objectiveId: 'M02-OBJ-04', description: 'Support patient evacuation through local authority coordination', relatedPages: ['M02-P05'] },
    { objectiveId: 'M02-OBJ-05', description: 'Manage technology-dependent patients during emergencies', relatedPages: ['M02-P06'] },
    { objectiveId: 'M02-OBJ-06', description: 'Apply downtime documentation and record damage rules', relatedPages: ['M02-P07'] },
  ],
  passingScore: 80,
  minimumRequiredMinutes: 60,
};

// ═══════════════════════════════════════
// SECTION 5: MODULE M03 — COMPLAINTS & GRIEVANCES
// ═══════════════════════════════════════

const M03_PAGES: LessonPage[] = [
  {
    pageId: 'M03-P01', moduleId: 'ACHC-ART-M03', pageType: 'overview',
    title: 'Complaints & Grievances — Module Overview',
    narrationText: `Welcome to Module Three: Complaints and Grievances. This module covers your responsibilities when a patient, family member, or guardian has a concern about the care they receive. Understanding the difference between a complaint, a grievance, and an allegation of abuse is critical. As a field worker, you are often the first person to hear a patient's concern. How you receive, document, and escalate that concern directly affects the patient's rights and the agency's compliance. In this module you will learn the definitions of complaint, grievance, and allegation, the patient's right to voice concerns without fear of reprisal, the intake and documentation process, the escalation pathway from field worker to Administrator, the ten-day written response requirement, the appeal process through the Governing Body, the abuse and neglect distinction and mandatory reporting obligations, non-retaliation protections for both patients and staff, investigation boundaries for your role, the written response and closure tracking process, and staff grievance rights and procedures. You will work through field scenarios, practice documentation, and complete a graded assessment. Let us begin.`,
    contentHtml: `<h2>Module 3: Complaints & Grievances</h2><p>Covers complaint vs grievance vs allegation, intake, documentation, escalation, patient rights, abuse/neglect distinction, non-retaliation, investigation boundaries, written response process, closure tracking.</p><p><strong>Time:</strong> 60-70 min · <strong>Passing:</strong> 80%</p>`,
    media: createMedia(
      'Professional illustration of a patient speaking with a nurse at a kitchen table. The patient appears concerned but not distressed. The nurse is listening attentively with a clipboard. Warm, respectful atmosphere in a home setting.',
      '10-second 720p: Patient gestures while explaining a concern to a field nurse. Nurse nods, writes on clipboard. Text overlay: "Complaints & Grievances — Module 3." Professional, empathetic tone.',
      'image', 'beforeNarration', 'Display listening scene to set the empathetic context.'
    ),
    duration: createDuration('ACHC-ART-M03', 'M03-P01', 'overview', 'Complaints & Grievances — Module Overview',
      `Welcome to Module Three: Complaints and Grievances. This module covers your responsibilities when a patient, family member, or guardian has a concern about the care they receive. Understanding the difference between a complaint, a grievance, and an allegation of abuse is critical. As a field worker, you are often the first person to hear a patient's concern. How you receive, document, and escalate that concern directly affects the patient's rights and the agency's compliance. You will learn definitions, intake procedures, escalation pathways, response timelines, appeal processes, abuse reporting, non-retaliation protections, investigation boundaries, and documentation requirements.`, 1),
    requiredForCompletion: true,
  },
  {
    pageId: 'M03-P02', moduleId: 'ACHC-ART-M03', pageType: 'instruction',
    title: 'Definitions: Complaint, Grievance, and Allegation',
    narrationText: `Understanding the terminology is the foundation of this module. A grievance is defined as a concern relating to patient care conditions or to relationships between a patient and the agency or a caregiver in which the patient believes they have been wronged and wants the wrong corrected. It is regarding problem areas in the delivery of care which appear to threaten the health and well-being of the patient. A complaint is a broader term that covers any expression of dissatisfaction. It may be about the quality of care, the behavior of staff, scheduling issues, or property concerns. All complaints deserve attention and documentation. An allegation of abuse or neglect is the most serious category. Abuse includes verbal, mental, sexual, or physical harm. Neglect means failure to provide necessary care. Injuries of unknown source and misappropriation of patient property are also reportable. The distinction matters because each category triggers a different response. A scheduling complaint may be resolved at the field level with supervisor notification. A grievance about care quality requires formal investigation by the Administrator with a written response within ten days. An allegation of abuse or neglect triggers mandatory reporting to the state and immediate protective action. As a field worker, you do not determine which category applies. Your job is to document exactly what the patient or family reports, using their words, and escalate immediately to your supervisor or the Administrator.`,
    contentHtml: `<h3>Key Definitions</h3><ul><li><strong>Grievance:</strong> Patient believes they have been wronged in care delivery and wants correction. Threatens health/well-being.</li><li><strong>Complaint:</strong> Any expression of dissatisfaction — care quality, staff behavior, scheduling, property.</li><li><strong>Allegation of Abuse/Neglect:</strong> Verbal, mental, sexual, physical harm; failure to provide care; injuries of unknown source; property misappropriation.</li></ul><h3>Different Response Paths</h3><ul><li>Complaint → Document + supervisor notification</li><li>Grievance → Formal investigation by Administrator → written response in 10 days</li><li>Abuse/Neglect allegation → Mandatory reporting to state + immediate protective action</li></ul><p><strong>Your Role:</strong> Document exactly what is reported using patient's words. Escalate immediately.</p>`,
    media: createMedia(
      'Flowchart showing three paths: Complaint → Supervisor → Resolution; Grievance → Administrator → Investigation → 10-day Response; Allegation → Mandatory State Report + Immediate Action. Clear, color-coded design.',
      '10-second 720p: Animated flowchart builds showing complaint, grievance, and allegation pathways. Each path highlights with different colors. Text overlay: "Know the Difference." Clear, instructional tone.',
      'image', 'duringNarration', 'Display flowchart alongside narration to visually reinforce the three pathways.'
    ),
    duration: createDuration('ACHC-ART-M03', 'M03-P02', 'instruction', 'Definitions: Complaint, Grievance, and Allegation',
      `Understanding the terminology is the foundation of this module. A grievance is defined as a concern relating to patient care conditions or to relationships between a patient and the agency or a caregiver in which the patient believes they have been wronged and wants the wrong corrected. A complaint is a broader term covering any expression of dissatisfaction. An allegation of abuse or neglect is the most serious category. The distinction matters because each category triggers a different response. As a field worker, your job is to document exactly what is reported using the patient's words and escalate immediately.`, 2),
    challenge: {
      challengeId: 'M03-C01', lessonId: 'M03-P02', moduleId: 'ACHC-ART-M03',
      title: 'Categorizing Patient Concerns',
      scenario: 'You visit Mrs. Garcia. She tells you three things: (1) Her aide was 30 minutes late yesterday. (2) She feels the wound care nurse did not properly clean her wound last week, and now it looks infected. (3) Her neighbor told her that a previous aide took money from her purse.',
      narrationText: 'Mrs. Garcia shares three concerns with you. Categorize each one correctly.',
      prompt: 'What category does each concern fall into?',
      interactionType: 'choose-best-response',
      options: [
        createChallengeOption('a', '(1) Complaint about scheduling (2) Grievance about care quality (3) Allegation of property misappropriation — potential abuse/neglect report', 'Correct. The late aide is a scheduling complaint. The wound care concern is a grievance about care quality threatening health. The missing money is an allegation of property misappropriation, which falls under abuse/neglect.', true),
        createChallengeOption('b', 'All three are complaints that can be handled at the field level.', 'Incorrect. The wound infection concern is a grievance requiring formal investigation, and the missing money is an allegation requiring mandatory reporting.', false),
        createChallengeOption('c', 'All three are grievances that go to the Administrator.', 'While all should be reported, they have different categories and response requirements. The missing money allegation requires state reporting beyond just the Administrator.', false),
      ],
      bestPracticeAnswer: 'Complaint (scheduling), Grievance (care quality), Allegation (property misappropriation).',
      teachingPoint: 'Accurately categorizing concerns ensures the right response pathway is triggered. When in doubt, document everything and escalate to your supervisor.',
      documentationPrompt: 'Document each concern separately with the patient\'s exact words, date, time, and your name. Submit all three to the Administrator.',
      escalationPrompt: 'The property misappropriation allegation must be reported immediately to the Administrator for mandatory state reporting.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M03-P03', moduleId: 'ACHC-ART-M03', pageType: 'instruction',
    title: 'Patient Rights and the Complaint Process',
    narrationText: `All patients are informed of their right to voice a complaint or grievance against anyone furnishing services on behalf of the agency. This right is communicated at admission, both verbally and in writing. The admission packet includes the agency's process for receiving, investigating, and resolving complaints. Patients also receive the state regulatory hotline number, ACHC's telephone number, and the appropriate contact within the agency. The agency will investigate any complaint made by a patient or patient's family or guardian regarding treatment or care that is furnished or fails to be furnished, or regarding the lack of respect for the patient's property by anyone furnishing services. Both the existence of the complaint and the resolution must be documented. A summary of grievances, complaints, and concerns is reported to the Governing Body quarterly. Patient grievances are included in the annual Performance Improvement report. All complaints and grievances are retained for a minimum of three years. When a patient is admitted, they receive the Bill of Patient Rights and Responsibilities, which indicates that grievances are to be filed with the Agency Administrator. The fact that this policy was given to the patient is recorded in the clinical record. Critically, filing a complaint will not subject the patient to any form of adverse action, reprimand, retaliation, or otherwise negative treatment. This non-retaliation protection is absolute. If a patient expresses fear of retaliation for making a complaint, you must reassure them and document their concern.`,
    contentHtml: `<h3>Patient Rights in the Complaint Process</h3><ul><li>Right to voice complaints against anyone furnishing services</li><li>Informed at admission — verbally and in writing</li><li>Receives: state hotline, ACHC number, agency contact</li><li>Non-retaliation protection is absolute</li></ul><h3>Agency Obligations</h3><ul><li>Investigate every complaint</li><li>Document existence AND resolution</li><li>Report summaries to Governing Body quarterly</li><li>Include in annual PI report</li><li>Retain all complaints minimum 3 years</li></ul>`,
    media: createMedia(
      'Illustration of a nurse handing an admission packet to a patient. The packet is open showing "Patient Rights" and "How to File a Complaint" sections. Both parties appear engaged.',
      '10-second 720p: Nurse reviews complaint process document with patient. Camera zooms to show hotline numbers and "Your Right to Complain Without Fear." Text overlay: "Patient Rights — Know the Process."',
      'image', 'beforeNarration', 'Display admission packet scene to ground the rights discussion in a real admission scenario.'
    ),
    duration: createDuration('ACHC-ART-M03', 'M03-P03', 'instruction', 'Patient Rights and the Complaint Process',
      `All patients are informed of their right to voice a complaint or grievance against anyone furnishing services on behalf of the agency. This right is communicated at admission, both verbally and in writing. The agency will investigate any complaint regarding treatment, care, or lack of respect for property. Both the existence and resolution must be documented. Summaries are reported to the Governing Body quarterly. Non-retaliation protection is absolute.`, 2),
    challenge: {
      challengeId: 'M03-C02', lessonId: 'M03-P03', moduleId: 'ACHC-ART-M03',
      title: 'Patient Fear of Retaliation',
      scenario: 'Mr. Robinson tells you he is unhappy with the quality of his physical therapy but is afraid to complain because he thinks the agency will stop his services.',
      narrationText: 'Mr. Robinson is unhappy with his physical therapy but fears complaining will cause his services to be stopped. How do you respond?',
      prompt: 'What is the best response to Mr. Robinson?',
      interactionType: 'patient-rights-response',
      options: [
        createChallengeOption('a', 'Tell him his concern is noted but advise him not to make a formal complaint to avoid complications.', 'Discouraging a patient from exercising their right to complain violates patient rights. Every patient has the right to voice concerns without fear of reprisal.', false),
        createChallengeOption('b', 'Reassure Mr. Robinson that he has the absolute right to voice concerns without any fear of retaliation or loss of services. Explain the complaint process, offer to help him document his concern, and report it to the Administrator.', 'Correct. Patients must be reassured of non-retaliation. Help them through the process and escalate to the Administrator.', true),
        createChallengeOption('c', 'Tell him to call the state hotline directly since you cannot get involved.', 'While patients can use the state hotline, your role is to receive the complaint, reassure against retaliation, document, and escalate internally. Deflecting the patient is not appropriate.', false),
      ],
      bestPracticeAnswer: 'Reassure non-retaliation, explain the process, help document, escalate to Administrator.',
      teachingPoint: 'Non-retaliation protection is absolute. Never discourage a patient from making a complaint. Your role is to listen, document, reassure, and escalate.',
      documentationPrompt: 'Document: patient expressed concern about PT quality, patient expressed fear of retaliation, you reassured non-retaliation, patient\'s specific concern in their words, submitted to Administrator.',
      escalationPrompt: 'Report to Administrator immediately. The fear of retaliation itself is a concern that must be addressed.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M03-P04', moduleId: 'ACHC-ART-M03', pageType: 'instruction',
    title: 'Intake, Documentation, and Escalation',
    narrationText: `When you receive a complaint or grievance, your immediate responsibilities are clear. First, listen without interrupting. Let the patient or family member express their full concern. Second, remain calm, objective, and professional. Do not take complaints personally. Do not yell, name call, make accusations, or accept or assign blame. Third, document the complaint using the patient's own words. Include the date and time you received the complaint, the name of the patient, the name of the person filing the complaint if different from the patient, their relationship to the patient, your name and title as the person who received the initial complaint, and a detailed description of the complaint. Fourth, submit the complaint report to the Administrator. If the complaint is received after business hours, notify the supervisor on call and submit the form the next business day. The Administrator or designee handles all grievances and concerns. When a grievance is received, whether written or verbal, it is documented in the patient's clinical record and noted in the Administrator's log. Each person involved is interviewed. The Administrator evaluates all collected information, makes a determination, and formulates a decision notifying all persons involved. Each written or verbal grievance must be responded to in writing within ten days. The response explains the decision and notifies the patient of their right to appeal. A copy of the outcome is filed in the clinical record and the Administrator's log. If the patient files an appeal, it is reviewed by a member of the Governing Body within thirty days. Grievances received after hours, on weekends, and holidays are handled on the next business day.`,
    contentHtml: `<h3>Your Immediate Responsibilities</h3><ol><li>Listen without interrupting</li><li>Remain calm, objective, professional — no blame, no accusations</li><li>Document using the patient's own words</li><li>Submit complaint report to Administrator</li></ol><h3>Documentation Must Include</h3><ul><li>Date/time received</li><li>Patient name</li><li>Complainant name and relationship (if different)</li><li>Your name and title</li><li>Detailed description in patient's words</li></ul><h3>Administrator's Process</h3><ul><li>Document in clinical record AND Administrator's log</li><li>Interview all persons involved</li><li>Written response within 10 days</li><li>Response includes decision + right to appeal</li><li>Appeal → Governing Body → 30 days</li></ul>`,
    media: createMedia(
      'Photograph of a complaint form being filled out at a desk. Visible fields: Date, Patient Name, Description. Professional, clean documentation scene.',
      '10-second 720p: Hands writing on a complaint form. Fields populate: date, patient name, description. Arrow shows form being placed in folder labeled "Administrator." Text: "Document → Escalate → Resolve."',
      'image', 'beforeNarration', 'Display complaint form to anchor the documentation process.'
    ),
    duration: createDuration('ACHC-ART-M03', 'M03-P04', 'instruction', 'Intake, Documentation, and Escalation',
      `When you receive a complaint or grievance, listen without interrupting, remain calm and professional, document using the patient's own words, and submit the report to the Administrator. The Administrator investigates, responds in writing within ten days, and notifies the patient of their right to appeal. Appeals go to the Governing Body within thirty days.`, 2),
    challenge: {
      challengeId: 'M03-C03', lessonId: 'M03-P04', moduleId: 'ACHC-ART-M03',
      title: 'Complaint Intake Scenario',
      scenario: 'During a Saturday evening visit, Mrs. Chen\'s daughter angrily tells you that the morning aide did not show up and no one called to notify them. Mrs. Chen missed her morning medications because no one was there to help.',
      narrationText: 'On a Saturday evening, a patient\'s daughter reports the morning aide was a no-show with no notification, causing the patient to miss medications. What are your immediate steps?',
      prompt: 'What should you do right now?',
      interactionType: 'sequence-the-steps',
      options: [
        createChallengeOption('a', 'Listen to the daughter without interrupting. Remain calm and empathetic. Document the complaint in the daughter\'s words including date, time, missed aide visit, missed medications, and no notification. Notify the on-call supervisor immediately. Assess Mrs. Chen for any adverse effects from missed medications. Administer or assist with medications per your scope if ordered. Submit the formal complaint form on the next business day.', 'Correct. This sequence addresses the immediate clinical concern (missed medications), documents the complaint properly, escalates to the on-call supervisor, and ensures formal follow-up on the next business day.', true),
        createChallengeOption('b', 'Tell the daughter to calm down and call the office on Monday.', 'Telling a family member to calm down is dismissive and delays both the clinical concern (missed medications) and the complaint process. The on-call supervisor must be notified for after-hours complaints.', false),
        createChallengeOption('c', 'Apologize and promise it will not happen again.', 'Promising a resolution you cannot guarantee and accepting blame on behalf of the agency is not appropriate. Document, escalate, and let the Administrator investigate.', false),
      ],
      bestPracticeAnswer: 'Listen, document, notify on-call supervisor, assess patient, address missed medications, submit formal form next business day.',
      teachingPoint: 'After-hours complaints require on-call supervisor notification. Always address any immediate clinical concern (like missed medications) first, then complete complaint documentation.',
      documentationPrompt: 'Document: date/time of complaint, daughter\'s name and statement in her words, missed aide visit, missed medications, on-call supervisor notified, patient assessment findings, medications administered if applicable.',
      escalationPrompt: 'Notify on-call supervisor immediately for after-hours complaints. Submit formal complaint form the next business day.',
      estimatedInteractionMinutes: 5,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M03-P05', moduleId: 'ACHC-ART-M03', pageType: 'instruction',
    title: 'Abuse, Neglect, and Mandatory Reporting',
    narrationText: `Patients have the right to be free of mistreatment, neglect, or verbal, mental, sexual, and physical abuse, including injuries of unknown source and misappropriation of patient property. As a field worker, you must be able to recognize signs of abuse and neglect and understand your reporting obligations. Abuse includes physical harm such as hitting, pushing, or restraining. It includes verbal abuse such as yelling, threatening, or demeaning language. It includes mental or emotional abuse such as intimidation or isolation. It includes sexual abuse of any kind. It also includes misappropriation of patient property, meaning taking, using, or controlling a patient's belongings without authorization. Neglect means failure to provide necessary care, resulting in harm or risk of harm. This includes failure to provide food, medications, hygiene, safety, or medical attention. Injuries of unknown source — unexplained bruises, burns, or wounds — must be reported and investigated. Your obligation as a mandated reporter is immediate. If you observe or suspect abuse or neglect, report it to your supervisor and the Administrator immediately. Do not conduct your own investigation. Do not confront the suspected abuser. Do not delay reporting to gather more information. Protect the patient from immediate harm if possible. Document exactly what you observed using objective language. Remember: reporting suspected abuse in good faith is protected. You cannot be retaliated against for making a report. Failure to report suspected abuse can result in disciplinary action and potential legal liability.`,
    contentHtml: `<h3>Types of Abuse</h3><ul><li><strong>Physical:</strong> Hitting, pushing, restraining</li><li><strong>Verbal:</strong> Yelling, threatening, demeaning</li><li><strong>Mental/Emotional:</strong> Intimidation, isolation</li><li><strong>Sexual:</strong> Any sexual contact or exploitation</li><li><strong>Property:</strong> Taking/using belongings without authorization</li></ul><h3>Neglect</h3><p>Failure to provide food, medications, hygiene, safety, or medical attention</p><h3>Your Obligations</h3><ol><li>Report to supervisor and Administrator IMMEDIATELY</li><li>Do NOT investigate or confront</li><li>Do NOT delay reporting</li><li>Protect patient from immediate harm</li><li>Document observations objectively</li></ol><p><strong>Reporting in good faith is protected. Failure to report may result in discipline and legal liability.</strong></p>`,
    media: createMedia(
      'Infographic showing the five types of abuse with icons: fist (physical), speech bubble with exclamation (verbal), broken heart (emotional), shield with X (sexual), wallet (property). Below: "See Something → Report Immediately." Professional, serious design.',
      '10-second 720p: Five abuse types appear with icons. Then "Your Obligation: Report Immediately" appears in red. Arrow points to phone icon labeled "Supervisor + Administrator." Serious, urgent tone.',
      'image', 'duringNarration', 'Display abuse types infographic to reinforce recognition and reporting obligations.'
    ),
    duration: createDuration('ACHC-ART-M03', 'M03-P05', 'instruction', 'Abuse, Neglect, and Mandatory Reporting',
      `Patients have the right to be free of mistreatment, neglect, or abuse of any kind. As a field worker you must recognize signs and report immediately. Do not investigate or confront. Protect the patient. Document objectively. Reporting in good faith is protected. Failure to report may result in discipline and legal liability.`, 2),
    challenge: {
      challengeId: 'M03-C04', lessonId: 'M03-P05', moduleId: 'ACHC-ART-M03',
      title: 'Recognizing Abuse Signs',
      scenario: 'During your visit with Mr. Wallace, you notice new bruises on both arms that were not there last week. When you ask about them, he becomes quiet and looks away. His live-in caregiver quickly says "he fell."',
      narrationText: 'You notice new unexplained bruises on Mr. Wallace. He becomes quiet when asked. His caregiver says he fell. What should you do?',
      prompt: 'What is the correct response?',
      interactionType: 'identify-the-risk',
      options: [
        createChallengeOption('a', 'Accept the caregiver\'s explanation and document "patient fell" in the chart.', 'Accepting an explanation without proper assessment and reporting violates your obligation as a mandated reporter. Injuries of unknown source must be reported and investigated.', false),
        createChallengeOption('b', 'Document the injuries objectively (location, size, color, pattern). Note the patient\'s demeanor and the caregiver\'s response. Do not confront the caregiver. Report to your supervisor and the Administrator immediately as a potential abuse/neglect concern with injuries of unknown source.', 'Correct. Document objectively, note behavioral indicators, do not confront, and report immediately. This protects the patient while allowing proper investigation.', true),
        createChallengeOption('c', 'Confront the caregiver and demand an explanation before reporting.', 'Confronting a suspected abuser can escalate the situation, endanger the patient, and compromise the investigation. Report first, let the Administrator investigate.', false),
      ],
      bestPracticeAnswer: 'Document objectively, note demeanor, do not confront, report immediately.',
      teachingPoint: 'Injuries of unknown source are reportable events. Document what you see, not interpretations. Report to supervisor and Administrator immediately. Never confront a suspected abuser.',
      documentationPrompt: 'Document: date, location/size/color/pattern of injuries, patient\'s verbal and non-verbal response, caregiver\'s statement, your report to supervisor with date/time.',
      escalationPrompt: 'Call supervisor immediately. This is a mandatory report. Do not wait for the next business day.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M03-P06', moduleId: 'ACHC-ART-M03', pageType: 'instruction',
    title: 'Non-Retaliation and Staff Rights',
    narrationText: `Non-retaliation is a fundamental protection in the complaints process — for both patients and staff. Filing a complaint will not subject employees to any form of adverse action, reprimand, retaliation, or otherwise negative treatment by the agency. All employees have rights and are entitled to fair, consistent, and professional treatment. Staff may request a change in assignment because of a personality conflict. Staff may complain without fear of repercussion. Staff has the right to special consideration to accommodate personal requests arising from cultural or religious practices, provided the agency can cover patient needs. Staff has the right to be treated in accordance with the agency mission and vision. Staff is entitled to receive information in a timely manner. Staff is entitled to a workplace free from solicitation and distribution of unsolicited material. The agency has adopted an internal grievance procedure for staff that provides prompt and equitable resolution. The process works as follows: complaints involving prohibited matters are first filed with the Director, who renders an initial resolution within seven days. If unsatisfied, the complainant may appeal to the President or CEO, who renders a decision within five days. Complaints should be in writing, contain the name and address of the person filing, and briefly describe the prohibited action. All complaints should be filed within three days after the complaining party becomes aware of the action. The agency ensures thorough investigations and affords all interested persons an opportunity to submit evidence.`,
    contentHtml: `<h3>Non-Retaliation Protection</h3><ul><li>Patients: Absolute protection — no adverse action for complaints</li><li>Staff: May complain without fear of repercussion</li></ul><h3>Staff Rights</h3><ul><li>Fair, consistent, professional treatment</li><li>Request assignment changes for personality conflicts</li><li>Cultural/religious accommodation when possible</li><li>Timely information</li><li>Workplace free from solicitation</li></ul><h3>Staff Grievance Process</h3><ol><li>File with Director → resolution within 7 days</li><li>Appeal to President/CEO → decision within 5 days</li><li>Written complaint within 3 days of awareness</li></ol>`,
    media: createMedia(
      'Illustration of a shield icon with "Non-Retaliation" text. Two figures: one representing a patient, one representing staff. Both are protected by the shield. Professional, reassuring design.',
      '10-second 720p: Shield icon appears with "Non-Retaliation" label. Two paths extend: "Patient Protection" and "Staff Protection." Each shows protections listed. Text: "Everyone Is Protected."',
      'image', 'beforeNarration', 'Display non-retaliation shield to reinforce the protection concept.'
    ),
    duration: createDuration('ACHC-ART-M03', 'M03-P06', 'instruction', 'Non-Retaliation and Staff Rights',
      `Non-retaliation protects both patients and staff. Employees may complain without fear of repercussion. The staff grievance process provides resolution within seven days with appeal to the CEO within five days.`, 2),
    challenge: {
      challengeId: 'M03-C05', lessonId: 'M03-P06', moduleId: 'ACHC-ART-M03',
      title: 'Staff Retaliation Concern',
      scenario: 'Your coworker Maria confides that she reported a safety concern about a patient\'s home to her supervisor last week. Since then, her supervisor has been giving her the most difficult assignments and making negative comments. Maria asks you what she should do.',
      narrationText: 'Maria reports that her supervisor has been retaliating since she filed a safety concern. What should you advise?',
      prompt: 'What is the best advice for Maria?',
      interactionType: 'escalation-decision',
      options: [
        createChallengeOption('a', 'Tell Maria to ignore it since supervisors sometimes have bad days.', 'Ignoring potential retaliation allows it to continue and violates the agency\'s non-retaliation policy. Maria deserves to have her concern addressed.', false),
        createChallengeOption('b', 'Advise Maria to document the specific retaliatory actions with dates and examples, and file a formal written grievance with the Director, citing the non-retaliation policy. Remind her that the agency protects employees who file complaints.', 'Correct. Documentation of specific retaliatory actions and a formal written grievance through the established process protects Maria\'s rights under the non-retaliation policy.', true),
        createChallengeOption('c', 'Tell Maria to confront her supervisor directly.', 'Direct confrontation without documentation and formal process may escalate the situation. The formal grievance process exists to handle these situations properly.', false),
      ],
      bestPracticeAnswer: 'Document specific retaliatory actions, file formal grievance with Director, cite non-retaliation policy.',
      teachingPoint: 'Non-retaliation protection means that employees who file complaints must not face adverse consequences. If retaliation occurs, the formal grievance process with documentation is the appropriate response.',
      documentationPrompt: 'Advise Maria to document: dates, specific actions, witnesses, and connection to the original safety report.',
      escalationPrompt: 'The formal grievance goes to the Director first (7-day resolution), then the CEO on appeal (5-day decision).',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M03-P07', moduleId: 'ACHC-ART-M03', pageType: 'instruction',
    title: 'Investigation Boundaries and Response Timeline',
    narrationText: `As a field worker, understanding your role boundaries in the investigation process is critical. You are responsible for receiving the complaint, documenting it accurately, and escalating it promptly. You are not responsible for investigating the complaint, determining fault, interviewing other staff, or deciding the resolution. The Administrator conducts the investigation. Each person involved is interviewed. The Administrator evaluates all collected information, makes a determination, and formulates a decision. All information regarding activities, investigation, analysis, resolution, and outcomes are documented in the Administrator's log and in the patient's chart. The timeline is specific. Each written or verbal grievance must be responded to in writing within ten days. The response must explain the decision rendered by the agency and notify the patient of their right to appeal. If the patient files an appeal, it must be reviewed and responded to by a member of the Governing Body within thirty days. A copy of every outcome is filed in the clinical record and the Administrator's log. Complaints and grievances are reported to the Governing Body quarterly and included in the annual Performance Improvement report. All complaint records are retained for a minimum of three years. The complaint form captures key information including the date received, patient name, complainant information, description, resolution, follow-up needed, and whether the complainant was satisfied. The form must be signed by the reviewer confirming implementation of any follow-up.`,
    contentHtml: `<h3>Your Role Boundaries</h3><table><tr><th>Your Responsibility</th><th>NOT Your Responsibility</th></tr><tr><td>Receive the complaint</td><td>Investigate</td></tr><tr><td>Document accurately</td><td>Determine fault</td></tr><tr><td>Escalate promptly</td><td>Interview other staff</td></tr><tr><td>Reassure patient</td><td>Decide resolution</td></tr></table><h3>Timeline</h3><ul><li><strong>Written response:</strong> Within 10 days</li><li><strong>Appeal response (Governing Body):</strong> Within 30 days</li><li><strong>Quarterly report:</strong> To Governing Body</li><li><strong>Record retention:</strong> Minimum 3 years</li></ul>`,
    media: createMedia(
      'Timeline graphic showing: Day 0 (Complaint Received) → Day 10 (Written Response Due) → If Appeal → Day 30 (Governing Body Response Due). Clean, linear design with milestone markers.',
      '10-second 720p: Animated timeline showing complaint receipt at Day 0, investigation period, written response at Day 10, and appeal at Day 30. Text: "Know the Deadlines."',
      'image', 'duringNarration', 'Display timeline alongside narration for visual deadline reinforcement.'
    ),
    duration: createDuration('ACHC-ART-M03', 'M03-P07', 'instruction', 'Investigation Boundaries and Response Timeline',
      `As a field worker you receive, document, and escalate. The Administrator investigates. Written response is due within ten days. Appeal response from Governing Body within thirty days. Records retained minimum three years.`, 2),
    challenge: {
      challengeId: 'M03-C06', lessonId: 'M03-P07', moduleId: 'ACHC-ART-M03',
      title: 'Investigation Boundary Scenario',
      scenario: 'A patient tells you they filed a complaint two weeks ago about a specific aide\'s behavior and asks you what the investigation found. They say no one has contacted them about it.',
      narrationText: 'A patient says they filed a complaint two weeks ago and has not received any response. They ask you for the investigation results. What do you do?',
      prompt: 'What is the appropriate response?',
      interactionType: 'choose-best-response',
      options: [
        createChallengeOption('a', 'Tell the patient you will investigate and find out what happened with their complaint.', 'Investigation is not your role. Promising to investigate oversteps your boundaries and may create expectations you cannot fulfill.', false),
        createChallengeOption('b', 'Acknowledge the patient\'s concern about the delayed response. Document that the patient reports not receiving a response after two weeks. Escalate this to the Administrator immediately, noting that the 10-day response timeline may have been missed.', 'Correct. You acknowledge the concern, document it, and escalate the potential missed deadline to the Administrator. You do not investigate or share investigation findings.', true),
        createChallengeOption('c', 'Tell the patient that complaints take time and to be patient.', 'The 10-day written response requirement may have been missed. Dismissing the patient\'s concern about a delayed response is not appropriate.', false),
      ],
      bestPracticeAnswer: 'Acknowledge concern, document delayed response, escalate to Administrator noting potential missed 10-day deadline.',
      teachingPoint: 'If a patient reports not receiving a timely response to their complaint, document that and escalate immediately. The 10-day written response requirement is a compliance obligation.',
      documentationPrompt: 'Document: patient reports complaint filed on [date], no response received as of today, escalated to Administrator on [date/time].',
      escalationPrompt: 'Notify Administrator immediately — the 10-day response deadline may have been missed.',
      estimatedInteractionMinutes: 3,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // M03 Scenario Challenge
  {
    pageId: 'M03-P08', moduleId: 'ACHC-ART-M03', pageType: 'scenario-challenge',
    title: 'Comprehensive Complaint Handling Scenario',
    narrationText: `Let us work through a comprehensive scenario. You arrive at Mrs. Peterson's home for a scheduled wound care visit. Her adult son opens the door and immediately begins expressing frustration. He tells you the following: Last week, the nurse who visited used his mother's bathroom without asking and left it messy. He says his mother felt disrespected. Additionally, he says he found that his mother's prescribed pain medication appears to be missing several doses that she did not take. He is concerned that someone may have taken them. Finally, he says the wound looks worse than it did two weeks ago and he believes the wound care is not being done properly. You need to listen to all three concerns, categorize them appropriately, respond professionally, document each one, and determine the correct escalation path for each. Think through how you would handle this visit from start to finish.`,
    contentHtml: `<h3>Multi-Concern Scenario</h3><p><strong>Patient:</strong> Mrs. Peterson, wound care patient</p><p><strong>Son's Concerns:</strong></p><ol><li>Nurse used bathroom without asking, left it messy — property disrespect</li><li>Prescribed pain medication doses appear to be missing — possible medication misappropriation</li><li>Wound appears worse — care quality concern</li></ol>`,
    media: createMedia(
      'Illustration of a concerned family member speaking to a nurse at the front door. The nurse has a calm, attentive expression. Home setting visible behind the family member.',
      '10-second 720p: Family member speaks animatedly at doorstep. Nurse listens calmly with notepad. Text: "Multiple Concerns — One Visit." Professional tone.',
      'image', 'beforeNarration', 'Display multi-concern scenario illustration.'
    ),
    duration: createDuration('ACHC-ART-M03', 'M03-P08', 'scenario-challenge', 'Comprehensive Complaint Handling Scenario',
      `Let us work through a comprehensive scenario with three different concerns from one visit: property disrespect, possible medication misappropriation, and wound care quality.`, 5),
    challenge: {
      challengeId: 'M03-C07', lessonId: 'M03-P08', moduleId: 'ACHC-ART-M03',
      title: 'Multi-Concern Complaint Response',
      scenario: 'Mrs. Peterson\'s son reports bathroom disrespect, missing pain medication, and worsening wound.',
      narrationText: 'Categorize the three concerns and determine the correct response for each.',
      prompt: 'What is the correct categorization and response?',
      interactionType: 'scenario-decision',
      options: [
        createChallengeOption('a', '(1) Bathroom = Complaint about property disrespect → document, escalate to Administrator. (2) Missing medication = Allegation of possible misappropriation → document, report to supervisor AND Administrator IMMEDIATELY as potential abuse/medication diversion. (3) Worsening wound = Grievance about care quality → assess wound now, document findings, escalate to Administrator. Document all three concerns separately with son\'s exact words.', 'Correct. Each concern has a different category and urgency level. The missing medication is the most urgent as a potential allegation. The wound needs immediate clinical assessment. All three require documentation and escalation.', true),
        createChallengeOption('b', 'Tell the son to file a formal written complaint with the office for all three issues.', 'Deflecting the son to the office delays urgent action on the potential medication misappropriation and the worsening wound. You must act now.', false),
        createChallengeOption('c', 'Handle the bathroom complaint yourself by apologizing, and tell the son the medication and wound issues are not your department.', 'Apologizing for the bathroom issue is fine, but medication misappropriation is a potential allegation requiring immediate reporting, and the wound must be assessed clinically right now.', false),
      ],
      bestPracticeAnswer: 'Categorize separately: complaint (bathroom), allegation (medication), grievance (wound care). Document all three, assess wound, report medication concern immediately.',
      teachingPoint: 'Multiple concerns in one visit may span different categories with different urgency levels. Handle each appropriately — clinical concerns need immediate assessment, allegations need immediate reporting.',
      documentationPrompt: 'Document each concern separately: date, time, son\'s exact words, category assigned, clinical assessment of wound, medication count if possible, all escalations made.',
      escalationPrompt: 'Missing medication: call supervisor AND Administrator immediately. Wound: assess clinically and report findings. Bathroom: include in complaint report.',
      estimatedInteractionMinutes: 5,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // M03 Documentation Practice
  {
    pageId: 'M03-P09', moduleId: 'ACHC-ART-M03', pageType: 'documentation-practice',
    title: 'Complaint Documentation Practice',
    narrationText: `Let us practice completing a complaint form. The agency complaint form requires specific information to ensure proper investigation and tracking. For this exercise, consider the following scenario: Mr. Adams calls the agency to report that the home health aide assigned to his wife consistently arrives thirty minutes late, causing his wife to miss her morning medication window. He has raised this issue verbally twice before and says nothing has changed. Your documentation must include the date the complaint was received, the patient's name, the complainant's name and relationship to the patient, your name and title as the person receiving the complaint, whether the complaint was logged, a detailed description of the complaint using the complainant's words, the resolution or action taken, any follow-up needed, whether the person making the complaint was satisfied with the resolution, and if not, what additional follow-up was implemented. Key documentation principles for complaints: use the complainant's own words, not your interpretation. Include specific dates, times, and details they provide. Note any previous complaints on the same issue. Do not include your opinions about who is at fault. Do not promise specific outcomes. Focus on facts.`,
    contentHtml: `<h3>Complaint Form Fields</h3><ol><li>Date received</li><li>Patient name</li><li>Complainant name and relationship</li><li>Your name and title (receiver)</li><li>Was complaint logged? ☐ Yes ☐ No</li><li>Description (patient's own words)</li><li>Resolution / action taken</li><li>Follow-up needed</li><li>Complainant satisfied? ☐ Yes ☐ No</li><li>If no, additional follow-up implemented</li><li>Reviewer signature and date</li></ol><h3>Documentation Principles</h3><ul><li>Use complainant's own words</li><li>Include specific dates, times, details</li><li>Note previous complaints on same issue</li><li>No opinions about fault</li><li>No promises of specific outcomes</li></ul>`,
    media: createMedia(
      'Close-up of agency complaint form template with clearly labeled fields. Professional, clean documentation layout.',
      '10-second 720p: Complaint form fields being populated one by one. Arrow guides viewer through each required field. Text: "Complete Every Field." Clean, instructional.',
      'image', 'beforeNarration', 'Display complaint form template for documentation practice reference.'
    ),
    duration: createDuration('ACHC-ART-M03', 'M03-P09', 'documentation-practice', 'Complaint Documentation Practice',
      `Practice completing a complaint form. Use the complainant's own words. Include specific dates, times, and details. Note previous complaints on the same issue. Do not include opinions or promises.`, 6),
    challenge: {
      challengeId: 'M03-C08', lessonId: 'M03-P09', moduleId: 'ACHC-ART-M03',
      title: 'Complaint Form Selection',
      scenario: 'Mr. Adams reported the late aide issue. Select the most complete documentation entry.',
      narrationText: 'Which complaint documentation entry is most complete and properly written?',
      prompt: 'Select the best documentation.',
      interactionType: 'documentation-practice',
      options: [
        createChallengeOption('a', '"Mr. Adams called about his wife\'s aide being late."', 'Incomplete. Missing date, specific details, previous complaint history, and formal fields.', false),
        createChallengeOption('b', '"Date: [today]. Patient: Mrs. Adams. Complainant: Mr. Adams (husband). Received by: [Your name, title]. Logged: Yes. Description: Mr. Adams reports aide assigned to his wife, Mrs. Adams, consistently arrives approximately 30 minutes late, causing Mrs. Adams to miss her morning medication window. Mr. Adams states he has raised this issue verbally twice before — approximately [date] and [date] — and reports no change has occurred. He requests the agency address the timeliness of aide visits to ensure his wife receives medications on schedule. Resolution: Complaint submitted to Administrator on [date]. Administrator to investigate scheduling and aide compliance. Follow-up: Monitor aide arrival times; Administrator to respond to Mr. Adams within 10 days."', 'Correct. This captures all required form fields, uses the complainant\'s words, includes specific details and previous complaint history, and initiates the proper escalation.', true),
        createChallengeOption('c', '"The aide is always late. Mr. Adams is upset. The aide needs to be fired."', 'This includes opinions (aide needs to be fired), generalizations (always late), and lacks all required form fields. Complaints must be documented objectively.', false),
      ],
      bestPracticeAnswer: 'Complete form with all fields, complainant\'s words, specific details, previous complaint history, and escalation.',
      teachingPoint: 'Complete, objective complaint documentation ensures proper investigation and demonstrates the agency\'s compliance with grievance procedures.',
      documentationPrompt: 'Use this as a template for every complaint: all form fields, complainant\'s words, specific details, previous history, escalation action.',
      escalationPrompt: 'Submit completed form to Administrator. Note this is a recurring issue that may require investigation of staffing patterns.',
      estimatedInteractionMinutes: 5,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // M03 Documentation Practice 2
  {
    pageId: 'M03-P10', moduleId: 'ACHC-ART-M03', pageType: 'documentation-practice',
    title: 'Closure Tracking and Satisfaction',
    narrationText: `Complaint closure is not just about resolving the issue — it is about documenting the resolution and confirming the complainant's satisfaction. After the Administrator investigates and renders a decision, the outcome must be documented in both the clinical record and the Administrator's log. The written response to the patient must explain the decision rendered and notify the patient of their right to appeal. If the patient is not satisfied with the resolution, additional follow-up must be implemented and documented. The complaint form asks specifically: was the person making the complaint satisfied with the resolution and action plan? If yes, the complaint can be closed with documentation. If no, the form requires documentation of what additional follow-up was implemented. The reviewer must sign and date the form, confirming they have reviewed and ensured implementation of all actions related to the complaint. Closure tracking ensures that no complaint falls through the cracks. All complaints are logged by the Administrator. Quarterly summaries go to the Governing Body. Annual summaries are included in the Performance Improvement report. This systematic tracking allows the agency to identify patterns — for example, recurring complaints about the same issue, the same staff member, or the same type of service failure — and implement systemic corrective actions. As a field worker, you may be asked to follow up with a patient after a complaint has been resolved to verify satisfaction. Document the follow-up conversation including the patient's stated satisfaction or dissatisfaction.`,
    contentHtml: `<h3>Complaint Closure Requirements</h3><ul><li>Resolution documented in clinical record AND Administrator's log</li><li>Written response explains decision + right to appeal</li><li>If not satisfied → additional follow-up documented</li><li>Reviewer signs and dates confirming implementation</li></ul><h3>Tracking System</h3><ul><li>Administrator maintains complaint log</li><li>Quarterly summaries → Governing Body</li><li>Annual summaries → Performance Improvement report</li><li>Pattern identification → systemic corrective action</li></ul>`,
    media: createMedia(
      'Illustration of a tracking dashboard showing complaint status: Open, Under Investigation, Resolved-Satisfied, Resolved-Unsatisfied, Appealed. Clean dashboard design.',
      '10-second 720p: Dashboard animates showing complaint statuses moving through stages. A "Resolved-Satisfied" status gets a green checkmark. "Tracking Complaints to Closure." Professional.',
      'image', 'beforeNarration', 'Display tracking dashboard to illustrate the closure process.'
    ),
    duration: createDuration('ACHC-ART-M03', 'M03-P10', 'documentation-practice', 'Closure Tracking and Satisfaction',
      `Complaint closure requires documented resolution, written response with appeal rights, satisfaction verification, and reviewer sign-off. Quarterly and annual tracking identifies patterns for systemic correction.`, 5),
    challenge: {
      challengeId: 'M03-C09', lessonId: 'M03-P10', moduleId: 'ACHC-ART-M03',
      title: 'Follow-Up Satisfaction Check',
      scenario: 'Your supervisor asks you to check in with Mrs. Adams during your next visit to see if she is satisfied with the resolution of her husband\'s complaint about the late aide. When you ask, Mrs. Adams says the aide has been on time for the last two visits but she is still concerned it might happen again.',
      narrationText: 'Mrs. Adams reports the aide has been on time recently but is still concerned about recurrence. How do you document this follow-up?',
      prompt: 'What should you document and report?',
      interactionType: 'documentation-practice',
      options: [
        createChallengeOption('a', '"Patient satisfied."', 'This is incomplete. She expressed ongoing concern about recurrence, which is not the same as full satisfaction.', false),
        createChallengeOption('b', '"Follow-up per supervisor request on [date]. Mrs. Adams reports aide has been on time for the last two visits. However, she expressed continued concern about potential recurrence. Mrs. Adams requests ongoing monitoring of aide timeliness. Reported to supervisor and Administrator for inclusion in complaint closure documentation."', 'Correct. This captures both the improvement and the remaining concern, the patient\'s specific request, and proper escalation for documentation purposes.', true),
        createChallengeOption('c', '"Everything is fine now."', 'This does not accurately reflect Mrs. Adams\'s stated concern about recurrence. Accurate documentation requires capturing her actual words and feelings.', false),
      ],
      bestPracticeAnswer: 'Document improvement AND remaining concern. Report the patient\'s specific request for ongoing monitoring.',
      teachingPoint: 'Satisfaction follow-up must accurately capture the patient\'s complete response, including any remaining concerns. Partial satisfaction should be documented, not glossed over.',
      documentationPrompt: 'Include: date, context (follow-up per supervisor), patient\'s specific words, improvement noted, remaining concerns, patient\'s request, reported to supervisor/Administrator.',
      escalationPrompt: 'Report to supervisor and Administrator so remaining concerns are addressed in closure documentation.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // M03 Pre-Assessment
  {
    pageId: 'M03-P11', moduleId: 'ACHC-ART-M03', pageType: 'pre-assessment',
    title: 'Pre-Assessment: Complaints & Grievances',
    narrationText: `Let us check your understanding with a six-question pre-assessment. This is not graded. You will receive immediate feedback.`,
    contentHtml: `<h3>Pre-Assessment: Complaints & Grievances</h3><p>6 questions · Not graded · Immediate feedback</p>`,
    media: createMedia('Clipboard with pre-assessment header.', '10-second 720p: Checklist animating. "Check Your Knowledge."', 'image', 'beforeNarration', 'Pre-assessment image.'),
    duration: createDuration('ACHC-ART-M03', 'M03-P11', 'pre-assessment', 'Pre-Assessment',
      `Six-question pre-assessment. Not graded. Immediate feedback.`, 8),
    assessmentQuestions: [
      { questionId: 'M03-PRE-Q01', moduleId: 'ACHC-ART-M03', questionText: 'A grievance is defined as:', options: [createOption('a', 'Any expression of dissatisfaction', false, 'This describes a complaint more broadly. A grievance specifically involves the patient believing they were wronged regarding care.'), createOption('b', 'A concern relating to patient care conditions where the patient believes they have been wronged and wants the wrong corrected', true, 'Correct. A grievance specifically involves care delivery problems that the patient believes threaten their health and well-being.'), createOption('c', 'A scheduling issue', false, 'Scheduling issues are typically complaints, not grievances.'), createOption('d', 'An allegation of abuse', false, 'Allegations of abuse are a separate, more serious category.')], mappedObjective: 'Define grievance vs complaint vs allegation', source: 'supplemental', reviewRequired: false },
      { questionId: 'M03-PRE-Q02', moduleId: 'ACHC-ART-M03', questionText: 'Written response to a grievance must be provided within:', options: [createOption('a', '3 days', false, 'The requirement is 10 days, not 3.'), createOption('b', '10 days', true, 'Correct. Each written or verbal grievance must be responded to in writing within 10 days.'), createOption('c', '30 days', false, '30 days is the appeal response timeline, not the initial response.'), createOption('d', '60 days', false, 'This is too long.')], mappedObjective: 'Identify complaint response timeline', source: 'supplemental', reviewRequired: false },
      { questionId: 'M03-PRE-Q03', moduleId: 'ACHC-ART-M03', questionText: 'If a patient fears retaliation for making a complaint, you should:', options: [createOption('a', 'Advise them not to complain', false, 'Never discourage a patient from exercising their rights.'), createOption('b', 'Reassure them that non-retaliation protection is absolute and help them through the process', true, 'Correct. Non-retaliation is absolute. Reassure the patient and facilitate the process.'), createOption('c', 'Tell them to call a lawyer', false, 'While patients can seek legal advice, your role is to reassure and facilitate the complaint process.'), createOption('d', 'Ignore their concern', false, 'The fear of retaliation itself is a reportable concern.')], mappedObjective: 'Apply non-retaliation protections', source: 'supplemental', reviewRequired: false },
      { questionId: 'M03-PRE-Q04', moduleId: 'ACHC-ART-M03', questionText: 'Complaints are reported to the Governing Body:', options: [createOption('a', 'Monthly', false, 'Monthly is not the correct frequency.'), createOption('b', 'Quarterly', true, 'Correct. A summary of grievances, complaints, and concerns is reported to the Governing Body quarterly.'), createOption('c', 'Annually', false, 'Annual reporting is for the PI report; Governing Body gets quarterly.'), createOption('d', 'Only when there is a serious incident', false, 'Regular quarterly reporting is required regardless of severity.')], mappedObjective: 'Identify complaint reporting frequency', source: 'supplemental', reviewRequired: false },
      { questionId: 'M03-PRE-Q05', moduleId: 'ACHC-ART-M03', questionText: 'If you observe unexplained injuries on a patient, you should:', options: [createOption('a', 'Accept the caregiver\'s explanation', false, 'Unexplained injuries are reportable regardless of explanations offered.'), createOption('b', 'Document objectively and report to supervisor and Administrator immediately', true, 'Correct. Injuries of unknown source must be documented and reported immediately.'), createOption('c', 'Wait to see if more injuries appear', false, 'Waiting puts the patient at continued risk.'), createOption('d', 'Confront the suspected abuser', false, 'Never confront — report to supervisor and Administrator.')], mappedObjective: 'Identify abuse recognition and reporting obligations', source: 'supplemental', reviewRequired: false },
      { questionId: 'M03-PRE-Q06', moduleId: 'ACHC-ART-M03', questionText: 'Complaint records must be retained for a minimum of:', options: [createOption('a', '1 year', false, 'One year is insufficient.'), createOption('b', '3 years', true, 'Correct. All complaints/grievances are retained for a minimum of three years.'), createOption('c', '5 years', false, 'The minimum is 3 years, though some agencies may retain longer.'), createOption('d', '10 years', false, 'The minimum requirement is 3 years.')], mappedObjective: 'Identify complaint record retention requirements', source: 'supplemental', reviewRequired: false },
    ],
    requiredForCompletion: true,
  },
  // M03 Final Assessment
  {
    pageId: 'M03-P12', moduleId: 'ACHC-ART-M03', pageType: 'final-assessment',
    title: 'Final Assessment: Complaints & Grievances',
    narrationText: `You have reached the final graded assessment for Module Three. Twelve questions. You must score at least eighty percent to pass.`,
    contentHtml: `<h3>Final Assessment: Complaints & Grievances</h3><p><strong>12 questions · Passing: 80% · Graded</strong></p>`,
    media: createMedia('Formal assessment document with seal.', '10-second 720p: Assessment form with score. "80% Required."', 'image', 'beforeNarration', 'Formal assessment image.'),
    duration: createDuration('ACHC-ART-M03', 'M03-P12', 'final-assessment', 'Final Assessment',
      `Final graded assessment. Twelve questions. Eighty percent to pass.`, 15),
    assessmentQuestions: [
      // PROVIDED questions first
      { questionId: 'M03-FIN-Q01', moduleId: 'ACHC-ART-M03', questionText: 'All patients are informed of their right to voice a complaint/grievance against anyone furnishing services on behalf of the agency at:', options: [createOption('a', 'On admission', false, 'On admission is correct, but see the full answer.'), createOption('b', 'Before admission', false, 'Before admission is not when rights are formally communicated.'), createOption('c', 'A and B', true, 'Correct. Per the provided answer key, patients are informed at admission and before — rights information is provided in the admission packet which may be shared prior to or at admission.'), createOption('d', 'None of the above', false, 'Patients ARE informed of this right.')], mappedObjective: 'Identify when patients learn about complaint rights', source: 'provided', reviewRequired: true },
      { questionId: 'M03-FIN-Q02', moduleId: 'ACHC-ART-M03', questionText: 'What is the timeframe to provide the patient a response to the complaint?', options: [createOption('a', '10 days', true, 'Correct. Each written or verbal grievance must be responded to in writing within 10 days.'), createOption('b', '3 days', false, 'Three days is too short — the requirement is 10 days.'), createOption('c', '30 days', false, '30 days is the appeal response timeline from the Governing Body.'), createOption('d', 'As soon as possible', false, 'While promptness is valued, the specific requirement is 10 days.')], mappedObjective: 'Identify complaint response timeline', source: 'provided', reviewRequired: false },
      { questionId: 'M03-FIN-Q03', moduleId: 'ACHC-ART-M03', questionText: 'How often are complaints reported to the Governing Body?', options: [createOption('a', 'Monthly', false, 'Monthly is not the specified frequency.'), createOption('b', 'Weekly', false, 'Weekly is not the specified frequency.'), createOption('c', 'Quarterly', true, 'Correct. A summary of grievances, complaints, and concerns is reported to the Governing Body quarterly.'), createOption('d', 'B and C', false, 'Only quarterly is correct.')], mappedObjective: 'Identify complaint reporting frequency', source: 'provided', reviewRequired: false },
      // Supplemental questions
      { questionId: 'M03-FIN-Q04', moduleId: 'ACHC-ART-M03', questionText: 'A grievance differs from a general complaint because:', options: [createOption('a', 'A grievance involves care delivery concerns where the patient believes they were wronged', true, 'Correct. A grievance specifically relates to care conditions that threaten health and well-being.'), createOption('b', 'A grievance is less serious than a complaint', false, 'Grievances are typically more serious, involving care quality threats.'), createOption('c', 'Grievances do not need to be documented', false, 'Grievances must be documented in both the clinical record and Administrator\'s log.'), createOption('d', 'There is no difference', false, 'There is a meaningful distinction in definition and response pathway.')], mappedObjective: 'Distinguish between complaint, grievance, and allegation', source: 'supplemental', reviewRequired: false },
      { questionId: 'M03-FIN-Q05', moduleId: 'ACHC-ART-M03', questionText: 'When a patient files an appeal of a complaint decision, who must respond and within what timeframe?', options: [createOption('a', 'The Administrator within 10 days', false, 'The Administrator handles the initial response. Appeals go to the Governing Body.'), createOption('b', 'A member of the Governing Body within 30 days', true, 'Correct. Appeals are reviewed and responded to by a member of the Governing Body within 30 days.'), createOption('c', 'The Director of Nursing within 7 days', false, 'The DON handles staff grievances, not patient complaint appeals.'), createOption('d', 'ACHC within 60 days', false, 'ACHC is an external accrediting body, not the internal appeal authority.')], mappedObjective: 'Identify the complaint appeal process', source: 'supplemental', reviewRequired: false },
      { questionId: 'M03-FIN-Q06', moduleId: 'ACHC-ART-M03', questionText: 'As a field worker, which of the following is NOT your responsibility when receiving a complaint?', options: [createOption('a', 'Listening to the patient', false, 'Listening is your responsibility.'), createOption('b', 'Documenting the complaint', false, 'Documentation is your responsibility.'), createOption('c', 'Investigating the complaint and determining fault', true, 'Correct. Investigation and fault determination are the Administrator\'s responsibilities. Your role is to receive, document, and escalate.'), createOption('d', 'Escalating to the Administrator', false, 'Escalation is your responsibility.')], mappedObjective: 'Identify role boundaries in the complaint process', source: 'supplemental', reviewRequired: false },
      { questionId: 'M03-FIN-Q07', moduleId: 'ACHC-ART-M03', questionText: 'Injuries of unknown source on a patient must be:', options: [createOption('a', 'Noted in the chart only', false, 'Documentation alone is insufficient — reporting is required.'), createOption('b', 'Reported to supervisor and Administrator immediately as potential abuse/neglect', true, 'Correct. Injuries of unknown source are reportable events requiring immediate escalation.'), createOption('c', 'Investigated by the field worker', false, 'Investigation is not the field worker\'s role.'), createOption('d', 'Reported only if the patient requests it', false, 'Reporting is mandatory regardless of patient request.')], mappedObjective: 'Identify abuse recognition and reporting obligations', source: 'supplemental', reviewRequired: false },
      { questionId: 'M03-FIN-Q08', moduleId: 'ACHC-ART-M03', questionText: 'After-hours complaints should be:', options: [createOption('a', 'Handled the next business day only', false, 'The on-call supervisor must be notified for after-hours complaints.'), createOption('b', 'Reported to the on-call supervisor, with formal complaint form submitted the next business day', true, 'Correct. On-call supervisor notification is required, with formal documentation following the next business day.'), createOption('c', 'Ignored until the office reopens', false, 'After-hours complaints cannot be ignored.'), createOption('d', 'Handled by calling the Administrator at home', false, 'The on-call supervisor is the appropriate after-hours contact.')], mappedObjective: 'Apply after-hours complaint procedures', source: 'supplemental', reviewRequired: false },
      { questionId: 'M03-FIN-Q09', moduleId: 'ACHC-ART-M03', questionText: 'The staff grievance process requires initial resolution within:', options: [createOption('a', '3 days', false, 'Three days is the filing deadline, not the resolution timeline.'), createOption('b', '7 days', true, 'Correct. The Director renders initial resolution within 7 days of receipt.'), createOption('c', '30 days', false, '30 days is the patient appeal timeline.'), createOption('d', '60 days', false, 'This is too long.')], mappedObjective: 'Identify staff grievance procedures', source: 'supplemental', reviewRequired: false },
      { questionId: 'M03-FIN-Q10', moduleId: 'ACHC-ART-M03', questionText: 'Non-retaliation protection applies to:', options: [createOption('a', 'Patients only', false, 'Both patients and staff are protected.'), createOption('b', 'Staff only', false, 'Both patients and staff are protected.'), createOption('c', 'Both patients and staff', true, 'Correct. Non-retaliation protection applies to both patients and staff who file complaints.'), createOption('d', 'Neither — it is not a real policy', false, 'Non-retaliation is a fundamental protection in the complaint process.')], mappedObjective: 'Identify non-retaliation protections', source: 'supplemental', reviewRequired: false },
      { questionId: 'M03-FIN-Q11', moduleId: 'ACHC-ART-M03', questionText: 'When documenting a complaint, you should:', options: [createOption('a', 'Use your interpretation of what the patient means', false, 'Use the patient\'s own words, not your interpretation.'), createOption('b', 'Use the complainant\'s own words and include specific dates and details', true, 'Correct. Document using the complainant\'s exact words with specific dates, times, and details.'), createOption('c', 'Include your opinion about who is at fault', false, 'Never include fault opinions in complaint documentation.'), createOption('d', 'Promise a specific resolution', false, 'Never promise specific outcomes you cannot control.')], mappedObjective: 'Apply proper complaint documentation standards', source: 'supplemental', reviewRequired: false },
      { questionId: 'M03-FIN-Q12', moduleId: 'ACHC-ART-M03', questionText: 'Complaint records must be retained for a minimum of:', options: [createOption('a', '1 year', false, 'Too short.'), createOption('b', '2 years', false, 'Too short.'), createOption('c', '3 years', true, 'Correct. All complaints/grievances are retained for a minimum of three years.'), createOption('d', '7 years', false, 'The minimum is 3 years.')], mappedObjective: 'Identify record retention requirements', source: 'supplemental', reviewRequired: false },
    ],
    requiredForCompletion: true,
  },
  // M03 Remediation
  {
    pageId: 'M03-P13', moduleId: 'ACHC-ART-M03', pageType: 'remediation',
    title: 'Remediation: Complaints & Grievances',
    narrationText: `Review these key concepts before retaking the assessment. Definitions: A grievance is a care delivery concern where the patient believes they were wronged. A complaint is any dissatisfaction. An allegation of abuse/neglect is the most serious. Your Role: Receive, document (patient's words), and escalate. Do not investigate or determine fault. Timeline: Written response within 10 days. Appeal to Governing Body within 30 days. Reports: Quarterly to Governing Body. Annual PI report. Retention minimum 3 years. Non-Retaliation: Absolute for both patients and staff. Abuse Reporting: Report immediately to supervisor and Administrator. Do not investigate or confront. Document objectively. Staff Grievance: Director resolves within 7 days. Appeal to CEO within 5 days. After reviewing, retake the assessment.`,
    contentHtml: `<h3>Remediation Review</h3><ul><li>Grievance = patient wronged in care delivery</li><li>Your role: receive, document, escalate — NOT investigate</li><li>Written response: 10 days; Appeal: 30 days (Governing Body)</li><li>Quarterly reports to Governing Body; 3-year retention</li><li>Non-retaliation: absolute for patients AND staff</li><li>Abuse: report immediately, do not investigate/confront</li><li>Staff grievance: Director 7 days, CEO appeal 5 days</li></ul>`,
    media: createMedia('Study desk with review materials.', '10-second 720p: Key concepts on screen. "Review & Retry."', 'image', 'beforeNarration', 'Remediation review image.'),
    duration: createDuration('ACHC-ART-M03', 'M03-P13', 'remediation', 'Remediation', `Review key concepts and retake.`, 5),
    requiredForCompletion: true,
  },
  // M03 Attestation
  {
    pageId: 'M03-P14', moduleId: 'ACHC-ART-M03', pageType: 'attestation',
    title: 'Attestation & Signature: Complaints & Grievances',
    narrationText: `By signing below you confirm completion of all sections, understanding of complaint intake, documentation, escalation, non-retaliation, and abuse reporting, and passing the final assessment with at least eighty percent. Type your full legal name and check the box.`,
    contentHtml: `<h3>Attestation</h3><p>I confirm completion of all Complaints & Grievances module sections.</p><p><strong>[Signature] · [Checkbox] · [Timestamp]</strong></p>`,
    media: createMedia('Attestation document with pen.', '10-second 720p: Signature field. Checkmark. Timestamp.', 'image', 'beforeNarration', 'Attestation image.'),
    duration: createDuration('ACHC-ART-M03', 'M03-P14', 'attestation', 'Attestation', `Attestation confirmation.`, 2),
    requiredForCompletion: true,
  },
  // M03 Certificate
  {
    pageId: 'M03-P15', moduleId: 'ACHC-ART-M03', pageType: 'certificate',
    title: 'Certificate of Completion: Complaints & Grievances',
    narrationText: `You have successfully completed Module Three: Complaints and Grievances. Your certificate and transcript have been updated.`,
    contentHtml: `<h3>🎓 Certificate of Completion</h3><p><strong>ACHC-ART-M03 — Complaints & Grievances</strong> · COMPLETE</p>`,
    media: createMedia('Certificate with gold border. Module 3 title.', '10-second 720p: Certificate with seal. "Module 3 Complete."', 'image', 'beforeNarration', 'Certificate image.'),
    duration: createDuration('ACHC-ART-M03', 'M03-P15', 'certificate', 'Certificate', `Module Three complete.`, 1),
    requiredForCompletion: true,
  },
];

const MODULE_M03: ModuleData = {
  moduleId: 'ACHC-ART-M03',
  title: 'Complaints & Grievances',
  description: 'Complaint vs grievance vs allegation, intake, documentation, escalation, patient rights, abuse/neglect distinction, non-retaliation, investigation boundaries, written response process, closure tracking.',
  version: '1.0.0',
  sourceRefs: ['ACHC Training Prompt Document — Complaints & Grievances Section'],
  policyRefs: ['Agency Complaint/Grievance Policy', 'Agency Patient Rights Policy'],
  formRefs: ['Complaint Form', 'Staff Grievance Form'],
  workflowRefs: ['Complaint Intake Workflow', 'Abuse Reporting Workflow'],
  reviewRequired: false,
  pages: M03_PAGES,
  preAssessmentQuestions: M03_PAGES.find(p => p.pageType === 'pre-assessment')?.assessmentQuestions || [],
  finalAssessmentQuestions: M03_PAGES.find(p => p.pageType === 'final-assessment')?.assessmentQuestions || [],
  remediationObjectives: [
    { objectiveId: 'M03-OBJ-01', description: 'Distinguish complaint, grievance, and allegation', relatedPages: ['M03-P02'] },
    { objectiveId: 'M03-OBJ-02', description: 'Identify patient complaint rights and non-retaliation', relatedPages: ['M03-P03', 'M03-P06'] },
    { objectiveId: 'M03-OBJ-03', description: 'Apply intake, documentation, and escalation procedures', relatedPages: ['M03-P04'] },
    { objectiveId: 'M03-OBJ-04', description: 'Recognize abuse/neglect and apply mandatory reporting', relatedPages: ['M03-P05'] },
    { objectiveId: 'M03-OBJ-05', description: 'Apply response timelines and appeal process', relatedPages: ['M03-P07'] },
    { objectiveId: 'M03-OBJ-06', description: 'Complete complaint documentation and closure tracking', relatedPages: ['M03-P09', 'M03-P10'] },
  ],
  passingScore: 80,
  minimumRequiredMinutes: 60,
};

// ═══════════════════════════════════════
// SECTION 6: MODULE M04 — HIPAA PRIVACY & SECURITY
// (Structure/shell — full content follows same pattern)
// ═══════════════════════════════════════

const M04_PAGES: LessonPage[] = [
  {
    pageId: 'M04-P01', moduleId: 'ACHC-ART-M04', pageType: 'overview',
    title: 'HIPAA Privacy & Security — Module Overview',
    narrationText: `Welcome to Module Four: HIPAA Privacy and Security. The Health Insurance Portability and Accountability Act of 1996 establishes strict guidelines for maintaining the privacy, confidentiality, and security of health information. As a home health field worker, you handle protected health information every day — in paper charts, on mobile devices, in verbal conversations, and during patient encounters. Your compliance with HIPAA is not optional. In this module you will learn what protected health information and individually identifiable health information are, the covered entities and business associates affected by HIPAA, the minimum necessary rule, permitted uses and disclosures, patient consent versus authorization, patient rights under HIPAA including the right to privacy notice, the right to request restrictions, the right to access records, the right to know disclosures, and the right to amend records. You will also learn field-specific safeguards for devices, paper records, verbal privacy, photography, public Wi-Fi, messaging, lost device response, suspected breach escalation, the role of the privacy officer, and documentation and sanctions. This module requires passing with at least eighty percent. Let us begin.`,
    contentHtml: `<h2>Module 4: HIPAA Privacy & Security</h2><p>Covers: PHI/ePHI, minimum necessary, permitted uses, field-device safeguards, paper-record security, messaging, public Wi-Fi, photography, verbal privacy, lost device response, breach escalation, documentation and sanctions.</p><p><strong>Time:</strong> 60-70 min · <strong>Passing:</strong> 80%</p>`,
    media: createMedia(
      'Professional illustration of a locked padlock overlaying a patient record icon. Shield design with "HIPAA" text. Clean, modern security-themed design.',
      '10-second 720p: Padlock icon locks over patient record. Shield forms around it. Text: "HIPAA Privacy & Security — Module 4." Professional, secure tone.',
      'image', 'beforeNarration', 'Display HIPAA security concept image.'
    ),
    duration: createDuration('ACHC-ART-M04', 'M04-P01', 'overview', 'HIPAA Privacy & Security — Module Overview',
      `Welcome to Module Four: HIPAA Privacy and Security. This module covers protected health information, covered entities, minimum necessary rule, permitted uses, patient rights, field safeguards, breach response, and the privacy officer role. Passing score is eighty percent.`, 1),
    requiredForCompletion: true,
  },
  {
    pageId: 'M04-P02', moduleId: 'ACHC-ART-M04', pageType: 'instruction',
    title: 'PHI, IIHI, and Covered Entities',
    narrationText: `HIPAA created specific terminology for protected information. Protected Health Information, or PHI, includes all information created by any covered entity in any form — paper, electronic, video, photos, audiotapes, information discussed, read from a screen, or shared over the internet. Individually Identifiable Health Information, or IIHI, is any information that could reasonably be linked to a specific patient, such as name, address, date of birth, next of kin, medical record number, social security number, driver's license number, account number, employer, or fingerprints. Some information is not individually identifiable and may be used in aggregate: age reported as sixty-plus for those over sixty, zip code for areas with more than twenty thousand residents, race, gender, ethnicity, marital status, and year-only of health care occurrence. Covered entities include healthcare providers — anyone paid for health services or who bills for services — health plans such as HMOs, insurance companies, Medicare and Medicaid, and clearinghouses that standardize information for claims processing. Business associates include attorneys, consultants, auditors, billing firms, and independent contractors like case managers. A contract must be in place before a business associate can see patient information. All facilities must limit access to those who have a need to know. A nurse seeking information about a patient not under her care is violating HIPAA. Health information can only be used for health purposes — employers cannot use it for hiring, banks cannot use it for lending.`,
    contentHtml: `<h3>Protected Health Information (PHI)</h3><p>All information created by any covered entity: paper, electronic, video, photos, audio, discussed, screen-read, internet-shared.</p><h3>Individually Identifiable Health Information (IIHI)</h3><p>Name, address, DOB, next of kin, MRN, SSN, DL#, account#, employer, biometrics</p><h3>NOT Individually Identifiable</h3><p>Age 60+, zip codes >20K population, race, gender, ethnicity, marital status, year-only dates</p><h3>Covered Entities</h3><ul><li>Healthcare providers</li><li>Health plans (HMOs, insurance, Medicare/Medicaid)</li><li>Clearinghouses</li><li>Business associates (contract required)</li></ul>`,
    media: createMedia(
      'Infographic showing PHI examples on the left (name, DOB, SSN, medical record), IIHI examples in the middle, and non-identifiable data on the right. Color-coded for clarity.',
      '10-second 720p: Three columns animate: "PHI," "IIHI," "Non-Identifiable." Examples populate each. Text: "Know What\'s Protected."',
      'image', 'duringNarration', 'Display PHI classification infographic.'
    ),
    duration: createDuration('ACHC-ART-M04', 'M04-P02', 'instruction', 'PHI, IIHI, and Covered Entities',
      `PHI includes all health information in any form. IIHI is any information linkable to a specific patient. Covered entities include providers, plans, clearinghouses, and business associates. Need-to-know access only.`, 2),
    challenge: {
      challengeId: 'M04-C01', lessonId: 'M04-P02', moduleId: 'ACHC-ART-M04',
      title: 'Identifying PHI',
      scenario: 'You find a sticky note on your car dashboard that says "Mrs. Johnson, 123 Oak St, needs wound care supplies, diabetes insulin 10 units." A colleague asks to see your patient list.',
      narrationText: 'You have a sticky note with patient details visible on your dashboard, and a colleague asks about your patients. What are the HIPAA concerns?',
      prompt: 'What HIPAA violations or risks are present?',
      interactionType: 'privacy-security-judgment',
      options: [
        createChallengeOption('a', 'The sticky note contains PHI visible to anyone who can see your dashboard. Sharing your patient list with a colleague who does not need the information for treatment is also a violation. Secure the sticky note immediately and do not share patient information with colleagues who do not have a treatment-related need to know.', 'Correct. The visible sticky note and unnecessary sharing both violate HIPAA. PHI must be secured at all times and shared only with those who have a legitimate need to know.', true),
        createChallengeOption('b', 'There is no problem since the note is in your car and the colleague works at the same agency.', 'Incorrect. PHI visible on a car dashboard can be seen by anyone. Working at the same agency does not automatically grant need-to-know access.', false),
        createChallengeOption('c', 'The sticky note is fine but you should not share with the colleague.', 'The sticky note itself is a violation because PHI is visible to anyone passing your car. Both issues must be addressed.', false),
      ],
      bestPracticeAnswer: 'Secure all PHI documents. Do not share patient information without treatment-related need to know.',
      teachingPoint: 'PHI must be secured at all times — even on sticky notes. Only share patient information with those who have a legitimate need to know for treatment purposes.',
      documentationPrompt: 'Destroy the sticky note securely. If a breach is suspected (someone may have read it), report to your supervisor.',
      escalationPrompt: 'If you believe PHI was exposed to unauthorized persons, report as a potential breach to the Privacy Officer.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M04-P03', moduleId: 'ACHC-ART-M04', pageType: 'instruction',
    title: 'Minimum Necessary Rule and Permitted Disclosures',
    narrationText: `HIPAA established the minimum necessary rule, which means only the minimum necessary information may be shared, even with patient authorization. For example, in a child abuse case, rather than providing an entire medical record, you would furnish only the pertinent data needed for treatment and protection. However, health providers involved in the direct treatment of patients are not subject to the minimum necessary rule and can access all information needed for patient care. Health information with public health and safety implications can be shared without consent in specific situations: emergency nine-one-one situations, communicable diseases, law enforcement involvement, national defense or security concerns, and public health reporting including cause of death, reportable diseases, child abuse, adverse drug reactions reported to the FDA, and immunizations for children. The public health department is a legitimate recipient of certain personal health information. Providers may — and in some cases must — report findings to the proper public health agency. The key principle is this: when you are providing direct care to a patient, you can access the information you need. When you are sharing information with anyone outside of direct care, apply the minimum necessary standard. If you are unsure whether a disclosure is permitted, ask your supervisor or the Privacy Officer before sharing.`,
    contentHtml: `<h3>Minimum Necessary Rule</h3><ul><li>Share only the minimum information needed</li><li>Direct treatment providers: exempt — full access for patient care</li><li>Everyone else: minimum necessary applies</li></ul><h3>Permitted Disclosures (No Consent Needed)</h3><ul><li>Emergency 911 situations</li><li>Communicable diseases</li><li>Law enforcement participation</li><li>National defense/security</li><li>Public health: cause of death, child abuse, adverse drug reactions, immunizations</li></ul><h3>When In Doubt</h3><p>Ask your supervisor or Privacy Officer before disclosing.</p>`,
    media: createMedia(
      'Illustration of a funnel labeled "Minimum Necessary." Full record enters the top; only relevant data exits the bottom. Side note: "Exception: Direct Treatment Providers."',
      '10-second 720p: Animated funnel filters a full record to essential data. Side panel shows permitted disclosures. Text: "Share Only What\'s Needed."',
      'image', 'duringNarration', 'Display minimum necessary funnel concept.'
    ),
    duration: createDuration('ACHC-ART-M04', 'M04-P03', 'instruction', 'Minimum Necessary Rule and Permitted Disclosures',
      `The minimum necessary rule means share only what is needed. Direct treatment providers are exempt. Certain public health and safety disclosures are permitted without consent. When in doubt, ask the Privacy Officer.`, 2),
    challenge: {
      challengeId: 'M04-C02', lessonId: 'M04-P03', moduleId: 'ACHC-ART-M04',
      title: 'Minimum Necessary Application',
      scenario: 'A police officer comes to a patient\'s home during your visit and asks to see the patient\'s complete medical record as part of a domestic violence investigation.',
      narrationText: 'A police officer at your patient\'s home requests the complete medical record for a domestic violence investigation. What do you do?',
      prompt: 'How do you respond to the law enforcement request?',
      interactionType: 'privacy-security-judgment',
      options: [
        createChallengeOption('a', 'Provide the complete medical record since law enforcement is a permitted disclosure.', 'While law enforcement may receive certain information, the minimum necessary rule still applies. You should not provide the entire record without authorization.', false),
        createChallengeOption('b', 'Do not provide any records at the scene. Explain that you cannot release medical records in the field. Direct the officer to contact the agency\'s Privacy Officer through proper channels for any records request. Document the officer\'s request including badge number and department.', 'Correct. Field workers should not release records. Direct law enforcement to the Privacy Officer through proper channels. The agency determines what is appropriate to share under minimum necessary.', true),
        createChallengeOption('c', 'Refuse to acknowledge the patient exists.', 'While protecting privacy is important, refusing to acknowledge a patient during an active law enforcement investigation may impede legitimate proceedings. Direct the officer through proper channels.', false),
      ],
      bestPracticeAnswer: 'Do not release records in the field. Direct to Privacy Officer through proper channels. Document the request.',
      teachingPoint: 'Field workers should never release medical records directly to law enforcement. All records requests go through the Privacy Officer, who determines what is appropriate to share under minimum necessary.',
      documentationPrompt: 'Document: date, time, officer name and badge number, department, nature of request, your response, and that you directed them to the Privacy Officer.',
      escalationPrompt: 'Notify your supervisor and Privacy Officer immediately about any law enforcement records request.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M04-P04', moduleId: 'ACHC-ART-M04', pageType: 'instruction',
    title: 'Patient Rights Under HIPAA',
    narrationText: `HIPAA mandates specific patient rights that your agency must honor. The right to privacy notice requires disclosure and reasonable effort to assure the patient understands the agency's privacy policy. The right to request restrictions means patients may specify what health information cannot be released or restrict who receives it. The right to access PHI means patients must be allowed to inspect and copy information in their record. The right to know what disclosures have been made means the agency must track all information released and provide documentation to the patient. The right to amend PHI means patients may request changes to their record; the agency must allow amendments but may deny some requests. These rights are fundamental to patient trust. As a field worker, you may be asked about these rights during visits. Patients must be informed about the agency's privacy practices through a document called Information Practices. Consent covers treatment, payment, and healthcare operations. Authorization is separate and required when information is used outside of treatment. Patients are entitled to a free accounting every twelve months of how their information has been used. Your agency must appoint a privacy officer to monitor and audit compliance. Training must be provided to all employees. Violations must be documented and sanctions applied. The agency must have a process for mitigating harmful effects of disclosure and must have a no-retaliation policy for employees or consumers who file privacy complaints.`,
    contentHtml: `<h3>Patient Rights Under HIPAA</h3><ol><li><strong>Privacy Notice:</strong> Right to understand agency privacy policy</li><li><strong>Request Restrictions:</strong> Specify what cannot be released or to whom</li><li><strong>Access PHI:</strong> Inspect and copy records</li><li><strong>Disclosure Accounting:</strong> Know what information has been released</li><li><strong>Amend PHI:</strong> Request changes (agency may deny some)</li></ol><h3>Consent vs Authorization</h3><ul><li><strong>Consent:</strong> Treatment, payment, healthcare operations</li><li><strong>Authorization:</strong> Required for purposes outside treatment</li></ul><h3>Agency Requirements</h3><ul><li>Privacy Officer appointed</li><li>Employee training provided</li><li>Violations documented, sanctions applied</li><li>No retaliation for privacy complaints</li></ul>`,
    media: createMedia(
      'Five icons representing patient rights: eye (privacy notice), lock (restrictions), folder (access), list (disclosure accounting), pencil (amend). Clean design.',
      '10-second 720p: Five patient rights icons appear one by one with labels. Text: "Your Patients\' Privacy Rights."',
      'image', 'duringNarration', 'Display patient rights icons.'
    ),
    duration: createDuration('ACHC-ART-M04', 'M04-P04', 'instruction', 'Patient Rights Under HIPAA',
      `HIPAA mandates five key patient rights: privacy notice, request restrictions, access PHI, disclosure accounting, and amend PHI. Consent covers treatment. Authorization is needed for non-treatment use. The Privacy Officer oversees compliance.`, 2),
    challenge: {
      challengeId: 'M04-C03', lessonId: 'M04-P04', moduleId: 'ACHC-ART-M04',
      title: 'Patient Rights Request',
      scenario: 'Mrs. Thompson asks you for a copy of her medical record during your visit. She says she wants to review what has been documented about her care.',
      narrationText: 'A patient requests a copy of her medical record during your visit. What is your response?',
      prompt: 'How do you handle the patient\'s request for records access?',
      interactionType: 'patient-rights-response',
      options: [
        createChallengeOption('a', 'Tell Mrs. Thompson that you cannot provide records and she should contact the office.', 'While you may not have records to provide at the visit, you must affirm her right to access her records and help her understand the process. Simply deflecting is not sufficient.', false),
        createChallengeOption('b', 'Affirm Mrs. Thompson\'s right to access her records under HIPAA. Explain the process: she should submit a written request to the agency, and the agency will provide copies within the timeframe required by law. Offer to connect her with the office or Privacy Officer to initiate the request. Document her request in the visit note.', 'Correct. Affirm the right, explain the process, facilitate the connection, and document. This is patient-centered HIPAA compliance.', true),
        createChallengeOption('c', 'Give her all the documents you have in your bag.', 'You should not distribute clinical records from your field bag. The formal records access process ensures proper handling and tracking of disclosed information.', false),
      ],
      bestPracticeAnswer: 'Affirm the right, explain the request process, connect with office/Privacy Officer, document.',
      teachingPoint: 'Patients have the right to access their PHI. As a field worker, affirm the right, explain the formal process, and help facilitate — but do not distribute records informally.',
      documentationPrompt: 'Document: patient requested records access on [date], you explained the process, provided Privacy Officer contact, patient states she will submit a written request.',
      escalationPrompt: 'Notify the Privacy Officer that a records access request is incoming.',
      estimatedInteractionMinutes: 3,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M04-P05', moduleId: 'ACHC-ART-M04', pageType: 'instruction',
    title: 'Field-Device Safeguards and Paper-Record Security',
    narrationText: `As a field worker, your mobile devices and paper documents are the frontline of HIPAA security. Every device you use that contains or accesses PHI must be password-protected with a strong password. Enable auto-lock to activate after a short period of inactivity. Never leave devices unattended in your car where they can be seen or in patient homes. Do not use public Wi-Fi networks to access patient information — public Wi-Fi is not secure and data can be intercepted. Do not take photographs of patients or their records unless specifically authorized by agency policy and with the patient's written consent. Do not send patient information via unsecured text messages or personal email. Use only agency-approved secure messaging systems. Paper records must be equally protected. Keep clinical documents in a secure, closed bag or folder. Do not leave papers visible on car seats, dashboards, or in patient homes. Secure all documents when not in active use. Shred any paper containing PHI when it is no longer needed rather than placing it in regular trash. If you lose a device or document containing PHI, report it immediately to your supervisor and the Privacy Officer. Do not wait. A lost device with PHI is a potential breach that triggers investigation and notification requirements. Time matters — the sooner you report, the sooner the agency can mitigate potential harm. Verbal privacy is equally important. Do not discuss patient information in public places — elevators, restaurants, parking lots, or anywhere you might be overheard. In the patient's home, be aware of who else is present when discussing care. The patient can consent to or decline having information shared with family members.`,
    contentHtml: `<h3>Device Safeguards</h3><ul><li>Password-protect all devices with PHI access</li><li>Enable auto-lock</li><li>Never leave devices visible/unattended</li><li>No public Wi-Fi for PHI access</li><li>No patient photos without authorization + written consent</li><li>No unsecured texting or personal email for PHI</li><li>Use agency-approved secure messaging only</li></ul><h3>Paper Security</h3><ul><li>Keep in secure, closed bag/folder</li><li>No papers visible in car or patient home</li><li>Shred PHI documents — no regular trash</li></ul><h3>Lost Device/Document</h3><p>Report IMMEDIATELY to supervisor and Privacy Officer. Do not wait.</p><h3>Verbal Privacy</h3><ul><li>No patient discussions in public places</li><li>Be aware of who is present in patient homes</li></ul>`,
    media: createMedia(
      'Split illustration: left side shows locked phone, secured bag, shredder. Right side shows X marks over: public WiFi, visible papers on dashboard, unsecured text. "Protect PHI in the Field."',
      '10-second 720p: Dos and Don\'ts appear side by side. Green checks on secured items, red X on violations. Text: "Field Security — Every Day."',
      'image', 'beforeNarration', 'Display field security dos and don\'ts.'
    ),
    duration: createDuration('ACHC-ART-M04', 'M04-P05', 'instruction', 'Field-Device Safeguards and Paper-Record Security',
      `Protect devices with passwords and auto-lock. No public Wi-Fi. No photos without authorization. No unsecured texting. Secure paper records. Report lost devices immediately. Maintain verbal privacy.`, 2),
    challenge: {
      challengeId: 'M04-C04', lessonId: 'M04-P05', moduleId: 'ACHC-ART-M04',
      title: 'Field Security Scenario',
      scenario: 'You stop at a coffee shop between visits. Your agency tablet with patient records is in your bag. A colleague texts you asking for a patient\'s medication list for a visit they are about to make.',
      narrationText: 'At a coffee shop, a colleague texts asking for a patient\'s medication list. You have the information on your agency tablet. What do you do?',
      prompt: 'What is the HIPAA-compliant response?',
      interactionType: 'privacy-security-judgment',
      options: [
        createChallengeOption('a', 'Open the tablet on the coffee shop Wi-Fi and text the medication list to your colleague.', 'Multiple violations: accessing PHI on public Wi-Fi and sending PHI via unsecured text message. Both are HIPAA violations.', false),
        createChallengeOption('b', 'Do not access patient records on public Wi-Fi. Do not send PHI via unsecured text. Tell your colleague to contact the office or access the information through the agency\'s secure system. If urgent, call the office to facilitate the information transfer through approved channels.', 'Correct. Public Wi-Fi and unsecured texting are both prohibited for PHI. Direct your colleague to agency-approved secure channels.', true),
        createChallengeOption('c', 'Look up the information on the tablet using your phone\'s hotspot and read it to your colleague over the phone.', 'While a phone hotspot may be more secure than public Wi-Fi, reading PHI aloud in a public coffee shop creates verbal privacy concerns. Use agency-approved secure channels.', false),
      ],
      bestPracticeAnswer: 'No public Wi-Fi for PHI. No unsecured texting of PHI. Direct to agency secure systems.',
      teachingPoint: 'Public Wi-Fi and unsecured text messaging are never appropriate for PHI. Always use agency-approved secure channels, even when it is less convenient.',
      documentationPrompt: 'No documentation needed unless you suspect a breach occurred.',
      escalationPrompt: 'If you inadvertently sent PHI via unsecured channels, report to the Privacy Officer immediately.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M04-P06', moduleId: 'ACHC-ART-M04', pageType: 'instruction',
    title: 'Breach Response and Privacy Officer Role',
    narrationText: `A breach is any unauthorized access, use, disclosure, or loss of protected health information. Breaches trigger specific investigation and notification requirements under HIPAA. Common field breaches include lost or stolen devices containing PHI, leaving paper records in a patient's home or in an unsecured vehicle, sending PHI via unsecured text or email, discussing patient information where unauthorized persons can hear, allowing unauthorized access to your login credentials, and accessing records of patients not under your care. If you suspect a breach has occurred, take these steps immediately. First, secure any remaining PHI if possible. Second, report the incident to your supervisor and the Privacy Officer immediately — do not wait. Third, document what happened including date, time, what information was involved, and how the breach occurred. Fourth, cooperate fully with the investigation. Fifth, do not attempt to conceal the breach — concealment may result in more severe sanctions than the breach itself. The Privacy Officer is designated to monitor and audit compliance with HIPAA. The agency must develop an internal compliance process ensuring no patient rights are violated. Violations must be documented and sanctions applied that parallel other disciplinary policies. The agency must have a process for mitigating harmful effects of disclosure and a no-retaliation policy for employees or consumers who file privacy complaints. Remember: HIPAA compliance is mandatory, not voluntary. If state law covering the same topic is more stringent than HIPAA, state law must be followed.`,
    contentHtml: `<h3>What Constitutes a Breach</h3><ul><li>Lost/stolen devices with PHI</li><li>Paper records left in patient home or unsecured vehicle</li><li>PHI sent via unsecured text/email</li><li>Patient information discussed in public</li><li>Unauthorized credential access</li><li>Accessing records of patients not in your care</li></ul><h3>Breach Response Steps</h3><ol><li>Secure remaining PHI</li><li>Report to supervisor + Privacy Officer IMMEDIATELY</li><li>Document what happened (date, time, info involved, how)</li><li>Cooperate with investigation</li><li>Do NOT conceal the breach</li></ol><h3>Privacy Officer Role</h3><ul><li>Monitors and audits HIPAA compliance</li><li>Investigates breaches and complaints</li><li>Applies sanctions per agency policy</li><li>Mitigates harmful effects of disclosure</li></ul>`,
    media: createMedia(
      'Emergency response flowchart: Breach Detected → Secure PHI → Report Immediately → Document → Cooperate → Investigation → Mitigation. Red alert design.',
      '10-second 720p: Breach alert icon flashes. Steps appear sequentially: Secure, Report, Document, Cooperate. Text: "Report Immediately — Do Not Conceal."',
      'image', 'duringNarration', 'Display breach response flowchart.'
    ),
    duration: createDuration('ACHC-ART-M04', 'M04-P06', 'instruction', 'Breach Response and Privacy Officer Role',
      `A breach is unauthorized access, use, disclosure, or loss of PHI. Report immediately to supervisor and Privacy Officer. Document and cooperate. Never conceal a breach.`, 2),
    challenge: {
      challengeId: 'M04-C05', lessonId: 'M04-P06', moduleId: 'ACHC-ART-M04',
      title: 'Lost Device Response',
      scenario: 'After your last patient visit, you realize your agency tablet is not in your bag. You think you may have left it at the patient\'s home. The tablet is password-protected but contains PHI for multiple patients.',
      narrationText: 'You realize your agency tablet with patient PHI may have been left at a patient\'s home. What do you do immediately?',
      prompt: 'What are your immediate steps?',
      interactionType: 'field-safety-decision',
      options: [
        createChallengeOption('a', 'Go back to the patient\'s home to look for it and only report if you cannot find it.', 'While retrieving the device is important, you must report the potential breach immediately regardless. Delaying the report is a violation.', false),
        createChallengeOption('b', 'Report the lost device to your supervisor and Privacy Officer IMMEDIATELY. Then attempt to retrieve it from the patient\'s home. Document the incident: when you last had the device, when you noticed it missing, what patient information is on it, and whether it is password-protected.', 'Correct. Report first, then retrieve. Immediate reporting is critical — the Privacy Officer needs to assess the breach risk and initiate any required notifications.', true),
        createChallengeOption('c', 'Wait until tomorrow to see if someone turns it in.', 'Waiting puts patient information at risk and delays required breach assessment. Report immediately.', false),
      ],
      bestPracticeAnswer: 'Report immediately to supervisor and Privacy Officer. Then attempt retrieval. Document everything.',
      teachingPoint: 'Lost devices containing PHI must be reported immediately — even if password-protected. The Privacy Officer determines the breach severity and required notifications. Never delay reporting.',
      documentationPrompt: 'Document: when you last had the device, when you noticed it missing, last known location, patients whose PHI is on the device, security measures on the device.',
      escalationPrompt: 'Call supervisor AND Privacy Officer immediately. This is a potential breach requiring investigation.',
      estimatedInteractionMinutes: 4,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  {
    pageId: 'M04-P07', moduleId: 'ACHC-ART-M04', pageType: 'instruction',
    title: 'Practical HIPAA in Home Health',
    narrationText: `Let us address practical HIPAA questions that arise in home health. Can you call a patient by name in their own home? Yes — this is direct care. Can family members be present during care discussions? The patient can give consent or decline. If the patient is competent and wants family involvement, it is permitted. Can you leave written instructions with a patient? Yes, but ensure they are specific to the patient's care and do not contain information about other patients. Can you discuss a patient's care by phone with the physician? Yes — this is direct treatment communication. However, ensure you are not in a public place where others can overhear. Can you take photos of a wound for clinical documentation? Only if authorized by agency policy with written patient consent. Photos become part of PHI and must be stored securely. Can you use your personal phone to call patients? Follow your agency's device policy. Do not store PHI on personal devices unless specifically authorized. Sign-in sheets can be used with reasonable precautions — only name and time, no information about the appointment nature. Patients have the right to restrict clergy visits and to restrict acknowledgment that they are receiving services. HIPAA retains parents' rights as personal representatives for minor children, with exceptions for suspected abuse or when including the parent would endanger the child. Remember: compliance is mandatory, not voluntary. Every health care worker must stay informed about HIPAA requirements and practice them daily.`,
    contentHtml: `<h3>Practical HIPAA in Home Health</h3><ul><li>✅ Call patient by name in their home (direct care)</li><li>✅ Family present if patient consents</li><li>✅ Leave patient-specific written instructions</li><li>✅ Discuss care by phone with physician (not in public)</li><li>⚠️ Wound photos only with agency authorization + written consent</li><li>⚠️ Personal phone — follow agency device policy</li><li>✅ Sign-in sheets: name and time only</li><li>✅ Patient can restrict clergy, restrict service acknowledgment</li></ul>`,
    media: createMedia(
      'Split-screen illustration: "Do" column with green checkmarks (home care discussion, phone to physician) and "Don\'t" column with red X (public discussion, unauthorized photos). Home health setting.',
      '10-second 720p: Practical dos and don\'ts appear for home health HIPAA. Green checks and red X marks. Text: "HIPAA in Practice — Every Visit."',
      'image', 'beforeNarration', 'Display practical HIPAA guidelines.'
    ),
    duration: createDuration('ACHC-ART-M04', 'M04-P07', 'instruction', 'Practical HIPAA in Home Health',
      `Practical HIPAA guidance for home health. Permitted direct care communications, family involvement with consent, wound photos only with authorization, follow device policies, maintain verbal privacy.`, 2),
    challenge: {
      challengeId: 'M04-C06', lessonId: 'M04-P07', moduleId: 'ACHC-ART-M04',
      title: 'Home Visit Privacy Scenario',
      scenario: 'During a wound care visit with Mr. Baker, his neighbor stops by and asks "What\'s wrong with him? I saw the nurse\'s car outside." Mr. Baker looks uncomfortable.',
      narrationText: 'A neighbor asks about your patient\'s condition during your visit. The patient looks uncomfortable. How do you respond?',
      prompt: 'What is the HIPAA-compliant response?',
      interactionType: 'privacy-security-judgment',
      options: [
        createChallengeOption('a', 'Tell the neighbor it is just a routine check-up.', 'Even disclosing the nature of a visit as "routine" shares information about the patient receiving healthcare services. The patient has the right to restrict this information.', false),
        createChallengeOption('b', 'Politely tell the neighbor that you cannot discuss any patient information due to privacy requirements. Look to Mr. Baker to see if he wants to share anything himself. If the neighbor persists, firmly but politely repeat that privacy rules prevent you from sharing any details.', 'Correct. You protect the patient\'s privacy while allowing the patient to choose what to share. The patient controls their own health information disclosure.', true),
        createChallengeOption('c', 'Ask the neighbor to leave the home.', 'While protecting privacy is important, you are in the patient\'s home. It is the patient\'s right to have visitors. Simply decline to share information and let the patient decide.', false),
      ],
      bestPracticeAnswer: 'Decline to share any information due to privacy. Let the patient choose what to disclose.',
      teachingPoint: 'You cannot disclose any patient information to unauthorized persons, including neighbors. The patient controls what they choose to share about their own health.',
      documentationPrompt: 'No specific documentation needed unless the patient expressed a privacy concern or requested restricted acknowledgment of services.',
      escalationPrompt: 'If the patient requests that future visits be less visible or that services not be acknowledged, document and communicate to the office for accommodation.',
      estimatedInteractionMinutes: 3,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // M04 Scenario Challenge
  {
    pageId: 'M04-P08', moduleId: 'ACHC-ART-M04', pageType: 'scenario-challenge',
    title: 'Comprehensive HIPAA Field Scenario',
    narrationText: `Let us work through a comprehensive HIPAA scenario. You are finishing a visit with Mrs. Rivera. As you prepare to leave, her adult daughter Maria arrives and asks for an update on her mother's condition, including medication changes and test results. Mrs. Rivera is present and alert but does not speak up. You also notice that Mrs. Rivera's previous visit notes from another nurse are sitting on the kitchen counter, unattended and visible. Your phone buzzes with a text from a colleague asking you to send Mrs. Rivera's latest blood pressure readings because they are doing the next visit. Consider all the HIPAA implications and determine the correct actions for each situation.`,
    contentHtml: `<h3>Comprehensive HIPAA Scenario</h3><p><strong>Situations:</strong></p><ol><li>Daughter requests health update — patient present but silent</li><li>Previous visit notes left visible on counter</li><li>Colleague texts requesting patient data</li></ol>`,
    media: createMedia(
      'Illustration of a home visit scene with multiple privacy situations: family member asking questions, papers on counter, phone with text message. Home setting.',
      '10-second 720p: Three privacy situations highlighted in a home visit scene. Text: "Multiple HIPAA Decisions — One Visit."',
      'image', 'beforeNarration', 'Display multi-situation HIPAA scenario.'
    ),
    duration: createDuration('ACHC-ART-M04', 'M04-P08', 'scenario-challenge', 'Comprehensive HIPAA Field Scenario',
      `Three HIPAA situations in one visit: family information request, visible records, and unsecured text request.`, 5),
    challenge: {
      challengeId: 'M04-C07', lessonId: 'M04-P08', moduleId: 'ACHC-ART-M04',
      title: 'Multi-Situation HIPAA Response',
      scenario: 'Daughter requests update, papers visible, colleague texts for data.',
      narrationText: 'Determine the correct HIPAA action for all three situations.',
      prompt: 'What is the correct response to all three situations?',
      interactionType: 'scenario-decision',
      options: [
        createChallengeOption('a', '(1) Ask Mrs. Rivera directly if she wants her daughter to hear the update. If she consents, share. If she hesitates or declines, explain to Maria that privacy rules require the patient\'s permission. (2) Secure the visible visit notes — place them in a folder or turn them face-down. Note this to the office so the prior nurse can be reminded about paper security. (3) Do not send BP readings via text. Tell your colleague to access the information through the agency\'s secure system or call the office.', 'Correct. Each situation has a specific HIPAA-compliant response: verify patient consent for family sharing, secure visible documents, and refuse unsecured texting of PHI.', true),
        createChallengeOption('b', 'Share everything with the daughter since she is family, leave the papers since they are in the patient\'s own home, and text the BP readings to save time.', 'Family status does not automatically grant access without patient consent. Papers left visible are a security concern. Texting PHI is prohibited.', false),
        createChallengeOption('c', 'Refuse to share anything with anyone and leave immediately.', 'Refusing all communication is not practical or patient-centered. Verify consent, secure documents, and use proper channels.', false),
      ],
      bestPracticeAnswer: 'Verify patient consent for family sharing, secure visible documents, refuse unsecured texting.',
      teachingPoint: 'Every visit presents HIPAA decisions. Verify consent before sharing with family, secure all visible PHI, and never use unsecured channels for patient data.',
      documentationPrompt: 'Document: consent obtained/declined for family sharing, visible documents secured, colleague directed to secure channels.',
      escalationPrompt: 'Report the unsecured papers to your supervisor for follow-up with the prior nurse.',
      estimatedInteractionMinutes: 5,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // M04 Documentation Practices
  {
    pageId: 'M04-P09', moduleId: 'ACHC-ART-M04', pageType: 'documentation-practice',
    title: 'HIPAA Documentation and Breach Reporting Practice',
    narrationText: `Proper documentation is essential to HIPAA compliance. Every privacy-related event should be documented, including patient consent or refusal for information sharing, any potential breaches observed or reported, lost device or document reports, privacy complaints from patients or staff, and any disclosures made outside of direct treatment. For this practice exercise, consider the following scenario: you accidentally left a printed patient assessment on the front seat of your car while making a stop at a pharmacy. When you returned fifteen minutes later, the paper was still there but you are not certain no one looked at it through the window. The document contained the patient's name, address, diagnosis, and medication list. Document this incident using the breach reporting framework: what happened, when it happened, what information was involved, what security measures were in place, what corrective action you took, and who you reported it to. Remember, self-reporting is expected and protected. Concealing a breach is worse than the breach itself. Your honesty demonstrates professionalism and allows the Privacy Officer to make proper assessments.`,
    contentHtml: `<h3>HIPAA Documentation Practice</h3><p><strong>Scenario:</strong> Printed patient assessment left visible on car seat for 15 minutes at pharmacy. Document contains: name, address, diagnosis, medication list.</p><h3>Breach Report Framework</h3><ol><li>What happened</li><li>When it happened</li><li>What information was involved</li><li>Security measures in place</li><li>Corrective action taken</li><li>Who you reported to</li></ol>`,
    media: createMedia(
      'Breach incident report form template with labeled fields. Professional documentation format.',
      '10-second 720p: Incident report fields populate one by one. Text: "Document Every Privacy Event."',
      'image', 'beforeNarration', 'Display breach report template.'
    ),
    duration: createDuration('ACHC-ART-M04', 'M04-P09', 'documentation-practice', 'HIPAA Documentation Practice',
      `Practice documenting a potential breach. Use the framework: what, when, what info, security measures, corrective action, who reported to.`, 6),
    challenge: {
      challengeId: 'M04-C08', lessonId: 'M04-P09', moduleId: 'ACHC-ART-M04',
      title: 'Breach Documentation Selection',
      scenario: 'Select the most complete breach incident documentation for the car/pharmacy scenario.',
      narrationText: 'Which documentation entry most completely captures the potential breach?',
      prompt: 'Select the best breach documentation.',
      interactionType: 'documentation-practice',
      options: [
        createChallengeOption('a', '"Left paper in car. Reported to supervisor."', 'Critically incomplete. Missing details about what information was exposed, duration, location, and corrective actions.', false),
        createChallengeOption('b', '"Date: [today], Time: approximately 2:15 PM. Incident: I inadvertently left a printed patient assessment (Patient: [name]) on the front seat of my locked vehicle while inside ABC Pharmacy for approximately 15 minutes. The document was visible through the car window. Information on document: patient name, home address, primary diagnosis, and current medication list. Security measures: vehicle was locked, windows were up. However, document contents may have been readable through the window. Corrective action: retrieved document immediately upon return, placed in secured bag. Uncertainty: cannot confirm whether anyone viewed the document through the window. Reported to: Supervisor [name] at [time], Privacy Officer [name] at [time]. Self-reported per agency HIPAA policy. Signed: [your name, credentials, date]"', 'Correct. This captures all required elements of a breach report: what happened, when, what information, security measures, uncertainty, corrective action, and reporting chain. This is thorough self-reporting.', true),
        createChallengeOption('c', '"I think my car was locked so no one could have seen it. No report needed."', 'A locked car does not prevent someone from reading a document through a window. If there is any possibility of PHI exposure, it must be reported.', false),
      ],
      bestPracticeAnswer: 'Complete breach documentation with all framework elements and immediate reporting.',
      teachingPoint: 'Thorough, honest self-reporting demonstrates professionalism and allows proper breach assessment. Include every detail the Privacy Officer needs to evaluate the incident.',
      documentationPrompt: 'Use the 6-element framework for every potential breach: what, when, what info, security measures, corrective action, who reported to.',
      escalationPrompt: 'Report to supervisor AND Privacy Officer immediately for any potential PHI exposure.',
      estimatedInteractionMinutes: 5,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // M04 Doc Practice 2
  {
    pageId: 'M04-P10', moduleId: 'ACHC-ART-M04', pageType: 'documentation-practice',
    title: 'HIPAA Sanctions and Ongoing Compliance',
    narrationText: `HIPAA requires that agencies document any and all violations and that sanctions parallel other disciplinary policies. Violations can range from unintentional incidents, like accidentally leaving a document visible, to intentional breaches, like accessing patient records without authorization. Sanctions may include counseling, retraining, written warnings, suspension, or termination, depending on the severity and intent. The agency must also have a process for mitigating any harmful effect of disclosure. This means taking steps to reduce the impact on affected patients, which might include notification, credit monitoring if financial information was exposed, or other protective measures. Your ongoing compliance responsibilities as a field worker include keeping your devices password-protected at all times, securing all paper documents during transport and at the visit, never accessing records of patients not under your care, reporting any suspected breach immediately, using only agency-approved communication channels for PHI, maintaining verbal privacy during all patient discussions, and participating in required annual HIPAA training. Staying compliant is an everyday practice, not just a training exercise. Every visit, every phone call, every document you handle is an opportunity to protect your patients' privacy. When in doubt about any disclosure or privacy question, ask your supervisor or the Privacy Officer before acting. It is always better to ask than to make a mistake.`,
    contentHtml: `<h3>HIPAA Sanctions</h3><ul><li>Range: counseling → retraining → written warning → suspension → termination</li><li>Based on severity and intent</li><li>All violations documented</li></ul><h3>Mitigation</h3><p>Agency must reduce impact on affected patients: notification, protective measures</p><h3>Ongoing Compliance Checklist</h3><ul><li>☐ Devices password-protected</li><li>☐ Paper documents secured</li><li>☐ Only access patients in your care</li><li>☐ Report suspected breaches immediately</li><li>☐ Use agency-approved channels only</li><li>☐ Maintain verbal privacy</li><li>☐ Complete annual HIPAA training</li></ul>`,
    media: createMedia(
      'Compliance checklist illustration with checkboxes. Clean, organized. Header: "Daily HIPAA Compliance."',
      '10-second 720p: Compliance checklist items appear and get checked off. Text: "HIPAA — Every Day, Every Visit."',
      'image', 'beforeNarration', 'Display daily compliance checklist.'
    ),
    duration: createDuration('ACHC-ART-M04', 'M04-P10', 'documentation-practice', 'HIPAA Sanctions and Ongoing Compliance',
      `HIPAA violations result in sanctions based on severity. Agencies must mitigate harm. Your daily compliance includes device security, paper security, need-to-know access, breach reporting, secure channels, and verbal privacy.`, 4),
    challenge: {
      challengeId: 'M04-C09', lessonId: 'M04-P10', moduleId: 'ACHC-ART-M04',
      title: 'Unauthorized Access Scenario',
      scenario: 'You learn that your coworker accessed the medical records of a high-profile community member who is a patient at your agency but is not on your coworker\'s caseload. Your coworker says she was "just curious."',
      narrationText: 'A coworker accessed records of a patient not on her caseload out of curiosity. What should you do?',
      prompt: 'What is the correct response?',
      interactionType: 'escalation-decision',
      options: [
        createChallengeOption('a', 'Mind your own business since it does not affect your patients.', 'Unauthorized access is a HIPAA violation that affects the patient whose records were accessed. Not reporting allows the violation to go unaddressed.', false),
        createChallengeOption('b', 'Report the unauthorized access to your supervisor and/or the Privacy Officer. This is a HIPAA violation regardless of intent. Accessing records of patients not on your caseload without a treatment-related need is prohibited.', 'Correct. Unauthorized access must be reported. Curiosity is not a legitimate reason to access patient records. The Privacy Officer will investigate and apply appropriate sanctions.', true),
        createChallengeOption('c', 'Tell your coworker to not do it again but do not report it.', 'Informal warnings do not satisfy reporting obligations. HIPAA requires documentation of violations and appropriate investigation.', false),
      ],
      bestPracticeAnswer: 'Report unauthorized access to supervisor and/or Privacy Officer.',
      teachingPoint: 'Accessing patient records without a treatment-related need to know is a HIPAA violation — regardless of intent. "Curiosity" is never an acceptable reason. Report violations.',
      documentationPrompt: 'Document: what your coworker told you (date, time, their words), that you reported to supervisor/Privacy Officer.',
      escalationPrompt: 'Report to Privacy Officer for investigation. Do not confront the coworker beyond what has already been said.',
      estimatedInteractionMinutes: 3,
      requiredForProgression: true, graded: false, countsTowardFinalScore: false, reviewRequired: false,
    },
    requiredForCompletion: true,
  },
  // M04 Pre-Assessment
  {
    pageId: 'M04-P11', moduleId: 'ACHC-ART-M04', pageType: 'pre-assessment',
    title: 'Pre-Assessment: HIPAA Privacy & Security',
    narrationText: `Six-question pre-assessment. Not graded. Immediate feedback.`,
    contentHtml: `<h3>Pre-Assessment: HIPAA Privacy & Security</h3><p>6 questions · Not graded</p>`,
    media: createMedia('Pre-assessment clipboard.', '10-second 720p: Checklist animation.', 'image', 'beforeNarration', 'Pre-assessment image.'),
    duration: createDuration('ACHC-ART-M04', 'M04-P11', 'pre-assessment', 'Pre-Assessment', `Six questions. Not graded.`, 8),
    assessmentQuestions: [
      { questionId: 'M04-PRE-Q01', moduleId: 'ACHC-ART-M04', questionText: 'PHI includes:', options: [createOption('a', 'Only electronic records', false, 'PHI includes ALL forms — paper, electronic, verbal, photos, video.'), createOption('b', 'All health information in any form created by a covered entity', true, 'Correct. PHI includes paper, electronic, video, photos, audio, and verbal information.'), createOption('c', 'Only billing records', false, 'Billing records are included but PHI is much broader.'), createOption('d', 'Only diagnosis information', false, 'PHI encompasses all health information, not just diagnoses.')], mappedObjective: 'Define PHI', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-PRE-Q02', moduleId: 'ACHC-ART-M04', questionText: 'The minimum necessary rule means:', options: [createOption('a', 'Share only the minimum information needed for the purpose', true, 'Correct. Only minimum necessary information may be shared.'), createOption('b', 'Share only with the minimum number of people', false, 'It refers to the amount of information, not the number of people.'), createOption('c', 'Only share information on Mondays', false, 'This is not related to scheduling.'), createOption('d', 'Never share any information', false, 'Some sharing is permitted and required; the rule limits the amount.')], mappedObjective: 'Apply minimum necessary rule', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-PRE-Q03', moduleId: 'ACHC-ART-M04', questionText: 'If you lose a device containing PHI, you should:', options: [createOption('a', 'Wait to see if it turns up', false, 'Waiting delays breach assessment.'), createOption('b', 'Report immediately to supervisor and Privacy Officer', true, 'Correct. Lost devices must be reported immediately.'), createOption('c', 'Only report if the device was not password-protected', false, 'Report regardless of security measures — the Privacy Officer assesses the risk.'), createOption('d', 'Replace the device and not mention it', false, 'Concealing a potential breach is worse than the breach itself.')], mappedObjective: 'Apply lost device/breach reporting', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-PRE-Q04', moduleId: 'ACHC-ART-M04', questionText: 'Which of the following is NOT a patient right under HIPAA?', options: [createOption('a', 'Right to access their records', false, 'This IS a patient right.'), createOption('b', 'Right to request restrictions on disclosures', false, 'This IS a patient right.'), createOption('c', 'Right to choose their insurance plan', true, 'Correct. HIPAA does not give patients the right to choose insurance plans. HIPAA rights relate to privacy of information.'), createOption('d', 'Right to amend their records', false, 'This IS a patient right.')], mappedObjective: 'Identify patient HIPAA rights', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-PRE-Q05', moduleId: 'ACHC-ART-M04', questionText: 'You may send patient information via unsecured text message:', options: [createOption('a', 'If the patient gives verbal consent', false, 'Patient consent does not make unsecured texting acceptable.'), createOption('b', 'Never — only use agency-approved secure channels', true, 'Correct. PHI must never be sent via unsecured text. Use only agency-approved secure systems.'), createOption('c', 'Only in emergencies', false, 'Even in emergencies, secure channels should be used when available.'), createOption('d', 'If you delete the text afterward', false, 'Deleting does not undo the unsecured transmission.')], mappedObjective: 'Apply device and communication security', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-PRE-Q06', moduleId: 'ACHC-ART-M04', questionText: 'Who serves as the agency\'s Privacy Officer?', options: [createOption('a', 'Director of Nursing', false, 'Per the source, the Administrator serves as Privacy Officer.'), createOption('b', 'Governing Body', false, 'The Governing Body has oversight but is not the Privacy Officer.'), createOption('c', 'Administrator', true, 'Correct. The Administrator serves as the Privacy Officer per agency policy.'), createOption('d', 'CFO', false, 'The CFO handles financial matters, not privacy compliance.')], mappedObjective: 'Identify the Privacy Officer', source: 'provided', reviewRequired: false },
    ],
    requiredForCompletion: true,
  },
  // M04 Final Assessment
  {
    pageId: 'M04-P12', moduleId: 'ACHC-ART-M04', pageType: 'final-assessment',
    title: 'Final Assessment: HIPAA Privacy & Security',
    narrationText: `Final graded assessment. Twelve questions. Eighty percent required to pass.`,
    contentHtml: `<h3>Final Assessment: HIPAA Privacy & Security</h3><p><strong>12 questions · 80% · Graded</strong></p>`,
    media: createMedia('Assessment document with seal.', '10-second 720p: Score animation. "80% Required."', 'image', 'beforeNarration', 'Assessment image.'),
    duration: createDuration('ACHC-ART-M04', 'M04-P12', 'final-assessment', 'Final Assessment', `Twelve questions. Eighty percent.`, 15),
    assessmentQuestions: [
      // PROVIDED questions
      { questionId: 'M04-FIN-Q01', moduleId: 'ACHC-ART-M04', questionText: 'Who serves as the Agency\'s Privacy Officer?', options: [createOption('a', 'Director of Nursing', false, 'The DON has clinical responsibilities but is not the designated Privacy Officer.'), createOption('b', 'Governing Body', false, 'The Governing Body provides oversight but does not serve as Privacy Officer.'), createOption('c', 'Administrator', true, 'Correct. The Administrator is designated as the Agency\'s Privacy Officer.'), createOption('d', 'CFO', false, 'The CFO handles financial matters.')], mappedObjective: 'Identify the Privacy Officer', source: 'provided', reviewRequired: false },
      { questionId: 'M04-FIN-Q02', moduleId: 'ACHC-ART-M04', questionText: 'What does HIPAA stand for?', options: [createOption('a', 'Health Information Privacy Administrative Act', false, 'This is not the correct full name.'), createOption('b', 'Health Insurance Portability Accountability Act', true, 'Correct. HIPAA stands for the Health Insurance Portability and Accountability Act.'), createOption('c', 'Health Information Protected and Accessed', false, 'This is not the correct acronym expansion.')], mappedObjective: 'Identify HIPAA basics', source: 'provided', reviewRequired: false },
      // Supplemental questions
      { questionId: 'M04-FIN-Q03', moduleId: 'ACHC-ART-M04', questionText: 'Protected Health Information (PHI) includes:', options: [createOption('a', 'Only electronic medical records', false, 'PHI includes ALL forms, not just electronic.'), createOption('b', 'All health information in any form: paper, electronic, video, photos, verbal', true, 'Correct. PHI includes every form of health information created by a covered entity.'), createOption('c', 'Only information shared with insurance companies', false, 'PHI includes all health information, not just insurance-related.'), createOption('d', 'Only diagnosis and treatment codes', false, 'PHI is much broader than codes.')], mappedObjective: 'Define PHI and IIHI', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-FIN-Q04', moduleId: 'ACHC-ART-M04', questionText: 'The minimum necessary rule requires:', options: [createOption('a', 'That all information be shared when requested', false, 'The opposite — only minimum necessary may be shared.'), createOption('b', 'That only the minimum necessary information be shared for the purpose', true, 'Correct. Only minimum necessary information may be disclosed.'), createOption('c', 'That information only be shared on paper', false, 'The rule is about amount, not format.'), createOption('d', 'That patients approve every disclosure', false, 'Patient approval is a separate concept from minimum necessary.')], mappedObjective: 'Apply minimum necessary rule', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-FIN-Q05', moduleId: 'ACHC-ART-M04', questionText: 'Which of the following is a permitted disclosure WITHOUT patient consent?', options: [createOption('a', 'Sharing records with the patient\'s employer', false, 'Employer disclosure requires patient authorization.'), createOption('b', 'Reporting a communicable disease to the public health department', true, 'Correct. Public health reporting is a permitted disclosure without consent.'), createOption('c', 'Discussing the patient\'s case with a neighbor', false, 'Neighbors are never authorized recipients of PHI.'), createOption('d', 'Sharing records with the patient\'s bank', false, 'Financial institutions require patient authorization.')], mappedObjective: 'Identify permitted disclosures', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-FIN-Q06', moduleId: 'ACHC-ART-M04', questionText: 'If you lose a device containing PHI, the FIRST thing you should do is:', options: [createOption('a', 'Replace the device', false, 'Reporting the loss takes priority over replacement.'), createOption('b', 'Report to supervisor and Privacy Officer immediately', true, 'Correct. Immediate reporting allows the Privacy Officer to assess breach severity and take protective action.'), createOption('c', 'Search for one week before reporting', false, 'Any delay in reporting increases risk to patients.'), createOption('d', 'Change your password', false, 'Password change may be needed but reporting comes first.')], mappedObjective: 'Apply breach response procedures', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-FIN-Q07', moduleId: 'ACHC-ART-M04', questionText: 'Which of the following is NOT an Individually Identifiable Health Information (IIHI) element?', options: [createOption('a', 'Patient\'s name', false, 'Name IS individually identifiable.'), createOption('b', 'Patient\'s date of birth', false, 'DOB IS individually identifiable.'), createOption('c', 'Patient\'s gender', true, 'Correct. Gender alone is not individually identifiable and may be used in aggregate data.'), createOption('d', 'Patient\'s social security number', false, 'SSN IS individually identifiable.')], mappedObjective: 'Distinguish IIHI from non-identifiable data', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-FIN-Q08', moduleId: 'ACHC-ART-M04', questionText: 'Patient authorization (as distinct from consent) is required when:', options: [createOption('a', 'The patient needs treatment', false, 'Treatment is covered by consent, not separate authorization.'), createOption('b', 'Information is used for purposes outside of treatment', true, 'Correct. Authorization is required when information is used by the agency for purposes outside of treatment.'), createOption('c', 'The patient is admitted to the agency', false, 'Admission involves consent for treatment, not authorization.'), createOption('d', 'A physician orders a medication', false, 'Physician orders are part of treatment covered by consent.')], mappedObjective: 'Distinguish consent from authorization', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-FIN-Q09', moduleId: 'ACHC-ART-M04', questionText: 'You should NEVER send PHI via:', options: [createOption('a', 'Agency-approved secure messaging system', false, 'This is an approved channel.'), createOption('b', 'Unsecured text message or personal email', true, 'Correct. Unsecured text and personal email are never appropriate for PHI transmission.'), createOption('c', 'Secure fax to the physician\'s office', false, 'Secure fax is an approved method.'), createOption('d', 'Direct verbal communication with the treatment team', false, 'Verbal communication with the treatment team is permitted.')], mappedObjective: 'Apply secure communication requirements', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-FIN-Q10', moduleId: 'ACHC-ART-M04', questionText: 'A nurse who accesses records of a patient NOT on her caseload is:', options: [createOption('a', 'Fine if she works at the same agency', false, 'Same agency does not grant automatic access to all records.'), createOption('b', 'Violating HIPAA rules', true, 'Correct. Accessing records without a treatment-related need to know violates HIPAA.'), createOption('c', 'Following standard procedure', false, 'This is a violation, not standard procedure.'), createOption('d', 'Only in violation if she shares the information', false, 'The access itself is the violation, regardless of whether information is shared.')], mappedObjective: 'Apply need-to-know access rules', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-FIN-Q11', moduleId: 'ACHC-ART-M04', questionText: 'If state privacy law is more stringent than HIPAA:', options: [createOption('a', 'HIPAA always overrides state law', false, 'When state law is more stringent, state law must be followed.'), createOption('b', 'State law must be followed', true, 'Correct. If state law is more stringent than HIPAA on the same topic, state law applies.'), createOption('c', 'Neither applies', false, 'One or both always apply.'), createOption('d', 'The agency can choose which to follow', false, 'There is no choice — the more stringent law applies.')], mappedObjective: 'Identify HIPAA vs state law hierarchy', source: 'supplemental', reviewRequired: false },
      { questionId: 'M04-FIN-Q12', moduleId: 'ACHC-ART-M04', questionText: 'Patients are entitled to a free accounting of disclosures:', options: [createOption('a', 'Only if they pay for it', false, 'The first accounting is free.'), createOption('b', 'Every twelve months', true, 'Correct. Patients are entitled to a free accounting every twelve months.'), createOption('c', 'Only at discharge', false, 'The right is ongoing, not limited to discharge.'), createOption('d', 'Never — disclosures are confidential', false, 'Patients have the right to know how their information has been used.')], mappedObjective: 'Identify patient disclosure rights', source: 'supplemental', reviewRequired: false },
    ],
    requiredForCompletion: true,
  },
  // M04 Remediation
  {
    pageId: 'M04-P13', moduleId: 'ACHC-ART-M04', pageType: 'remediation',
    title: 'Remediation: HIPAA Privacy & Security',
    narrationText: `Review these key concepts. HIPAA stands for Health Insurance Portability and Accountability Act. PHI is all health information in any form. IIHI is information linkable to a specific patient. The Privacy Officer is the Administrator. Minimum necessary: share only what is needed. Direct care providers are exempt. Patient rights include privacy notice, restrictions, access, disclosure accounting, and amendments. Authorization is separate from consent. Do not use public Wi-Fi or unsecured text for PHI. Report lost devices and breaches immediately. Accessing records of patients not in your care is a violation. State law applies if more stringent than HIPAA. Free disclosure accounting every twelve months. After reviewing, retake the assessment.`,
    contentHtml: `<h3>Remediation Review</h3><ul><li>HIPAA = Health Insurance Portability and Accountability Act</li><li>PHI = all health info in any form; IIHI = linkable to individual</li><li>Privacy Officer = Administrator</li><li>Minimum necessary; direct care exempt</li><li>5 patient rights: notice, restrict, access, accounting, amend</li><li>Authorization ≠ consent</li><li>No public Wi-Fi, no unsecured text for PHI</li><li>Report breaches/lost devices IMMEDIATELY</li><li>State law overrides if more stringent</li></ul>`,
    media: createMedia('Study materials with HIPAA highlights.', '10-second 720p: Key concepts. "Review & Retry."', 'image', 'beforeNarration', 'Remediation image.'),
    duration: createDuration('ACHC-ART-M04', 'M04-P13', 'remediation', 'Remediation', `Review and retake.`, 5),
    requiredForCompletion: true,
  },
  // M04 Attestation
  {
    pageId: 'M04-P14', moduleId: 'ACHC-ART-M04', pageType: 'attestation',
    title: 'Attestation & Signature: HIPAA Privacy & Security',
    narrationText: `By signing below you confirm completion of all HIPAA module sections and passing the final assessment with at least eighty percent. You understand your responsibilities for protecting PHI in all forms and will comply with HIPAA, agency policy, and applicable state law.`,
    contentHtml: `<h3>Attestation</h3><p>I confirm completion of all HIPAA Privacy & Security sections and passed the assessment.</p><p><strong>[Signature] · [Checkbox] · [Timestamp]</strong></p>`,
    media: createMedia('Attestation with pen.', '10-second 720p: Signature, checkmark, timestamp.', 'image', 'beforeNarration', 'Attestation.'),
    duration: createDuration('ACHC-ART-M04', 'M04-P14', 'attestation', 'Attestation', `Attestation.`, 2),
    requiredForCompletion: true,
  },
  // M04 Certificate
  {
    pageId: 'M04-P15', moduleId: 'ACHC-ART-M04', pageType: 'certificate',
    title: 'Certificate of Completion: HIPAA Privacy & Security',
    narrationText: `You have successfully completed Module Four: HIPAA Privacy and Security. Your certificate and transcript have been updated.`,
    contentHtml: `<h3>🎓 Certificate of Completion</h3><p><strong>ACHC-ART-M04 — HIPAA Privacy & Security</strong> · COMPLETE</p>`,
    media: createMedia('Certificate. Module 4.', '10-second 720p: Certificate with seal. "Module 4 Complete."', 'image', 'beforeNarration', 'Certificate.'),
    duration: createDuration('ACHC-ART-M04', 'M04-P15', 'certificate', 'Certificate', `Module Four complete.`, 1),
    requiredForCompletion: true,
  },
];

const MODULE_M04: ModuleData = {
  moduleId: 'ACHC-ART-M04',
  title: 'HIPAA Privacy & Security',
  description: 'PHI/ePHI, minimum necessary, permitted uses/disclosures, field-device safeguards, paper-record security, messaging, public Wi-Fi, photography, verbal privacy, lost device/document response, suspected breach escalation, documentation and sanctions.',
  version: '1.0.0',
  sourceRefs: ['ACHC Training Prompt Document — HIPAA Section', 'HIPAA Privacy Rule', 'HIPAA Security Rule'],
  policyRefs: ['Agency HIPAA Privacy Policy', 'Agency Device Security Policy', 'Agency Breach Notification Policy'],
  formRefs: ['Breach Incident Report', 'Patient Authorization Form', 'Disclosure Accounting Log'],
  workflowRefs: ['Breach Response Workflow', 'Privacy Officer Notification Workflow'],
  reviewRequired: false,
  pages: M04_PAGES,
  preAssessmentQuestions: M04_PAGES.find(p => p.pageType === 'pre-assessment')?.assessmentQuestions || [],
  finalAssessmentQuestions: M04_PAGES.find(p => p.pageType === 'final-assessment')?.assessmentQuestions || [],
  remediationObjectives: [
    { objectiveId: 'M04-OBJ-01', description: 'Define PHI, IIHI, and covered entities', relatedPages: ['M04-P02'] },
    { objectiveId: 'M04-OBJ-02', description: 'Apply minimum necessary rule and permitted disclosures', relatedPages: ['M04-P03'] },
    { objectiveId: 'M04-OBJ-03', description: 'Identify patient rights under HIPAA', relatedPages: ['M04-P04'] },
    { objectiveId: 'M04-OBJ-04', description: 'Apply field-device and paper-record security', relatedPages: ['M04-P05'] },
    { objectiveId: 'M04-OBJ-05', description: 'Apply breach response and reporting procedures', relatedPages: ['M04-P06'] },
    { objectiveId: 'M04-OBJ-06', description: 'Identify Privacy Officer role and sanctions', relatedPages: ['M04-P06', 'M04-P10'] },
  ],
  passingScore: 80,
  minimumRequiredMinutes: 60,
};

// ═══════════════════════════════════════
// PART 1 MODULE COLLECTION
// ═══════════════════════════════════════

const PART1_MODULES: ModuleData[] = [
  MODULE_M01,
  MODULE_M02,
  MODULE_M03,
  MODULE_M04,
];

// Part 1 Duration Summary:
// M01: 15 pages, ~125+ estimated minutes ✓
// M02: 15 pages, ~120+ estimated minutes ✓
// M03: 15 pages, ~115+ estimated minutes ✓
// M04: 15 pages, ~115+ estimated minutes ✓
// All modules exceed 60-minute minimum ✓

export { PART1_MODULES, MODULE_M01, MODULE_M02, MODULE_M03, MODULE_M04 };