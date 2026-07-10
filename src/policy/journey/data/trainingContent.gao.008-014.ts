/* GAO Phase 1 trainings — Modules 008-014 (AAA v2 for 010-014; 008/009 preserved) */

import type { ModuleTraining } from './trainingContent.types';

const NAV_BULLETS = ["Single-card view","Audio narration on every card","Challenges required to advance","80% to pass final test"];
const NAV_NARRATION = "One card at a time. Audio narration on every card. Challenges must be completed before you continue. The final test requires eighty percent to pass.";
const NAV_BODY = "You will move through one card at a time. Use Next and Previous to navigate. Your progress, time on each card, and challenge responses are tracked for compliance. Skipping cards is not allowed.";

export const GAO_TRAININGS_008_014: ModuleTraining[] = [
  {
    moduleId: 'GAO-008',
    policyRefs: ['CO-HP-002'],
    cmsRefs: ['45 CFR 164'],
    estimatedDurationMin: 45,
    durationSource: 'CMS',
    splash: {
      title: 'HIPAA Security â€” Passwords, Devices, and Data',
      subtitle: 'Administrative, physical, and technical safeguards',
      whyItMatters: 'Lost or unencrypted devices are the #1 source of HIPAA breach settlements in home health, with published OCR resolutions exceeding three million dollars. Your laptop, phone, and badge access are the front line of the security program.',
      narration: 'In this module you will learn the HIPAA Security Rule safeguards that apply to every device you use, every password you create, and every transmission you make. Lost devices and weak passwords are the leading cause of breach in home health.',
    },
    navigation: { title: 'How This Training Works', body: NAV_BODY, bullets: NAV_BULLETS, narration: NAV_NARRATION },
    lessons: [
      {
        id: 'GAO-008-L1', order: 1, title: 'Administrative and Technical Safeguards',
        objectives: ['Identify the three safeguard categories', 'Apply password and access standards', 'Recognize encryption requirements'],
        cards: [
          { id: 'GAO-008-L1-S', type: 'summary', title: 'Three Safeguard Categories', body: 'HIPAA Security Rule defines administrative, physical, and technical safeguards. Each category has required and addressable specifications under 45 CFR 164.', narration: 'In this lesson you will learn the three safeguard categories defined by the HIPAA Security Rule: administrative, physical, and technical. Each category has both required and addressable specifications.', estDurationSec: 40 },
          { id: 'GAO-008-L1-C1', type: 'content', title: 'Administrative Safeguards', body: 'Workforce training, access management, audit controls, sanction policy, contingency plans, and Business Associate Agreements. Most program documentation falls in this category.', narration: 'Administrative safeguards include workforce training, access management, audit controls, sanction policy, contingency plans, and Business Associate Agreements. Most program documentation falls in this category.', estDurationSec: 50 },
          { id: 'GAO-008-L1-C2', type: 'content', title: 'Technical Safeguards', body: 'Unique user IDs, automatic logoff, encryption at rest and in transit, integrity controls, and authentication. ePHI on a laptop must be encrypted; weak passwords are not acceptable.', narration: 'Technical safeguards include unique user IDs, automatic logoff, encryption at rest and in transit, integrity controls, and authentication. Electronic PHI on any laptop or phone must be encrypted, and weak passwords are not acceptable.', estDurationSec: 55 },
          { id: 'GAO-008-L1-C3', type: 'content', title: 'Password Standards', body: 'Minimum 12 characters, mix of upper, lower, number, symbol; no reuse across systems; multi-factor authentication on EMR; never shared, never written, never reused.', narration: 'Our password standard is twelve characters minimum with a mix of upper case, lower case, number, and symbol. No reuse across systems. Multi-factor authentication on the electronic medical record. Never shared, never written down, never reused.', estDurationSec: 50 },
          { id: 'GAO-008-L1-CH', type: 'challenge', title: 'Spot the Security Failure', body: 'Identify the security violations in the situations.', narration: 'Identify the security violations in the following situations.', estDurationSec: 55, challenge: { id: 'GAO-008-L1-CH-Q', format: 'error_id', prompt: 'Identify the violations.', narration: 'Identify the security violations.', errorTargets: [
            { id: 'e1', description: 'Sticky note with EMR password under the keyboard \u2014 violation' },
            { id: 'e2', description: 'Sharing login with a coworker who forgot theirs \u2014 violation' },
            { id: 'e3', description: 'Encrypted phone with auto-lock at 5 minutes \u2014 NOT a violation' },
            { id: 'e4', description: 'Sending PHI in plain email to family \u2014 violation' },
          ], policyRef: 'CO-HP-002',
            feedbackCorrect: 'Written passwords, shared logins, and unencrypted PHI transmission are all violations.',
            feedbackIncorrect: 'An encrypted device with auto-lock is compliant; the others are textbook breaches.',
            complianceImpact: 'Each violation is independently citable under 45 CFR 164.308 and 164.312.',
            realWorldConsequence: 'Shared logins have invalidated audit trails and forced agencies to assume breach across all access during the period.',
            correctBehaviorGuidance: 'Memorize your password. Lock your screen. Encrypt every device. Never email PHI in plain text.',
          } },
          {
            id: 'GAO-008-L1-C4',
            type: 'content',
            title: 'Field Example: Password and Device Hygiene on a Home Visit',
            body: 'You finish a visit in a patient\'s living room and step outside to chart. You notice your laptop screen is still unlocked from the last note. Per CO-HP-002 (HIPAA Security Program) you immediately lock the screen, move to your car, and enable the screen lock timer to 1 minute for future sessions. You also verify the device is still encrypted. This prevents shoulder-surfing or theft while the device is in your vehicle.',
            narration: 'Field example. After a visit you see your laptop screen is unlocked outside. Per CO-HP-002 you lock it, move to the car, and set the lock timer to one minute. You confirm encryption. Shoulder surfing and theft are prevented.',
            estDurationSec: 50,
          },
          {
            id: 'GAO-008-L1-C5',
            type: 'content',
            title: 'Practical BYOD and Encryption Rules',
            body: 'If you use a personal phone for agency MFA or secure messaging, it must be enrolled in the device management program. PHI must never be stored locally on the personal device. If you lose a personal phone that was enrolled, report it the same as an agency device. Encryption and remote wipe still apply.',
            narration: 'If your personal phone is enrolled for agency multi-factor or secure messaging, it must stay in the management program. Never store patient information locally on it. Losing an enrolled personal device is reported the same as a company device.',
            estDurationSec: 45,
          },
        ],
      },
      {
        id: 'GAO-008-L2', order: 2, title: 'Device Loss, Theft, and Remote Wipe',
        objectives: ['Describe immediate response to lost device', 'Identify devices subject to remote wipe'],
        cards: [
          { id: 'GAO-008-L2-S', type: 'summary', title: 'Lost Device Response', body: 'You will learn the immediate steps when a device is lost or stolen, and how remote wipe and incident reporting trigger the breach assessment.', narration: 'In this lesson you will learn the immediate steps when a device is lost or stolen, and how remote wipe and incident reporting trigger the breach assessment process.', estDurationSec: 35 },
          { id: 'GAO-008-L2-C1', type: 'content', title: 'Immediate Steps', body: 'Within one hour: report to IT, request remote wipe, change all passwords used on that device, file a security incident in the EMR. The clock for breach notification starts at discovery.', narration: 'Within one hour of discovering a lost or stolen device: report to IT, request remote wipe, change every password used on that device, and file a security incident in the electronic medical record. The breach notification clock starts at discovery, not at report.', estDurationSec: 60 },
          { id: 'GAO-008-L2-C2', type: 'content', title: 'Remote Wipe Coverage', body: 'All agency-issued laptops, tablets, and phones. BYOD devices in the mobile management program. Personal devices outside the program may not be wiped \u2014 which is why PHI must never reside on them.', narration: 'Remote wipe covers all agency-issued laptops, tablets, and phones, plus any BYOD device enrolled in the mobile device management program. Personal devices outside the program cannot be wiped, which is exactly why PHI must never reside on them.', estDurationSec: 55 },
          { id: 'GAO-008-L2-CH', type: 'challenge', title: 'Lost Laptop Sequence', body: 'You realize at 14:00 your encrypted laptop is missing from your car. Order the response.', narration: 'You realize at fourteen hundred your encrypted laptop is missing from your car. Place the response steps in correct order.', estDurationSec: 50, challenge: { id: 'GAO-008-L2-CH-Q', format: 'sequencing', prompt: 'Order the response.', narration: 'Place the response steps in correct order.',
            steps: [
              { id: 's1', label: 'Notify IT and request remote wipe' },
              { id: 's2', label: 'File a security incident in the EMR' },
              { id: 's3', label: 'Change all passwords used on the device' },
              { id: 's4', label: 'Notify supervisor and Privacy Officer' },
              { id: 's5', label: 'File a police report if theft suspected' },
            ], correctOrder: ['s1', 's3', 's2', 's4', 's5'],
            policyRef: 'CO-HP-002',
            feedbackCorrect: 'Wipe and password rotation come first to prevent unauthorized access; then incident filing and notification.',
            feedbackIncorrect: 'Delay in wipe or password rotation widens the breach window and increases notification scope.',
            complianceImpact: 'Failure to wipe within reasonable time has been cited as willful neglect under HITECH.',
            realWorldConsequence: 'Lost laptop incidents have generated million-dollar settlements and individual disciplinary action.',
            correctBehaviorGuidance: 'Wipe first. Notify second. Document third. The breach clock is running.',
          } },
          {
            id: 'GAO-008-L2-C3',
            type: 'content',
            title: 'Field Example: Lost Phone at a Patient Home',
            body: 'You finish a late visit, set your agency phone on the patient\'s kitchen counter while helping with a transfer, and drive away without it. When you realize it at the next stop, you immediately call the office from a landline, request remote wipe, change your EMR password from the patient\'s family tablet (with permission and logged), and file the incident before driving back to retrieve the phone. Per CO-HP-002 the device was wiped within forty minutes.',
            narration: 'Field example. You left the agency phone on the kitchen counter. You call from the next stop, request wipe, change passwords using family tablet with permission, and log the incident before going back. Per CO-HP-002 the device is wiped quickly.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-008-L2-C4',
            type: 'content',
            title: 'Prevention Habits That Survive Real Life',
            body: 'Never set a device down and walk away. Use a lanyard or belt clip for phones. When leaving a home, do a "phone, keys, bag" check at the door. Park so you can see your vehicle. These habits reduce loss incidents by more than half according to our internal safety data.',
            narration: 'Prevention that works: never set the device down and leave the room. Use a clip or lanyard. At the door do a quick phone-keys-bag check. Park where you can see the car. These habits cut losses dramatically.',
            estDurationSec: 45,
          },
        ],
      },
    ],
    finalTest: { id: 'GAO-008-FT', passingScorePct: 0.80, instructionsNarration: 'Final test on HIPAA security. Eighty percent required.', failAction: 'remediation', questions: [
      { id: 'q1', format: 'matching', prompt: 'Match the safeguard to its category.', narration: 'Match each safeguard to its HIPAA Security Rule category.',
        matches: [
          { left: 'Workforce training', right: 'Administrative' },
          { left: 'Encryption of ePHI on laptops', right: 'Technical' },
          { left: 'Locked file cabinet', right: 'Physical' },
          { left: 'Multi-factor authentication', right: 'Technical' },
          { left: 'Sanction policy', right: 'Administrative' },
        ], rationale: 'Knowing the category drives correct control implementation.', policyRef: 'CO-HP-002' },
      { id: 'q2', format: 'true_false', prompt: 'Sharing your EMR login with a coworker for one shift is acceptable in an emergency.', narration: 'True or false: sharing your EMR login with a coworker for one shift is acceptable in an emergency.',
        options: [{ id: 't', label: 'True', isCorrect: false, feedback: 'False \u2014 shared logins invalidate audit trails.' }, { id: 'f', label: 'False', isCorrect: true, feedback: 'Correct.' }],
        rationale: 'Unique user ID is a required technical safeguard.', policyRef: 'CO-HP-002' },
      { id: 'q3', format: 'sequencing', prompt: 'Order the lost-device response.', narration: 'Place the lost-device response steps in correct order.',
        steps: [{ id: 's1', label: 'Notify IT and request remote wipe' }, { id: 's2', label: 'Change passwords' }, { id: 's3', label: 'File incident' }, { id: 's4', label: 'Notify Privacy Officer' }],
        correctOrder: ['s1', 's2', 's3', 's4'], rationale: 'Time-critical response prevents breach expansion.', policyRef: 'CO-HP-002' },
      { id: 'q4', format: 'structured_input', prompt: 'State the minimum password length under our policy.', narration: 'State the minimum password length required by our policy.',
        fields: [{ id: 'len', label: 'Characters', acceptableAnswers: ['12', 'twelve', '12 characters'] }], rationale: 'Twelve-character minimum is the agency standard exceeding NIST 800-63B baseline.', policyRef: 'CO-HP-002' },
    ] },
  },
  {
    moduleId: 'GAO-009',
    policyRefs: ['CO-HP-003'],
    cmsRefs: [],
    estimatedDurationMin: 45,
    durationSource: 'PP',
    splash: {
      title: 'HIPAA Breach Reporting',
      subtitle: 'Recognize, escalate, and document a breach',
      whyItMatters: 'A missed breach notification triggers HITECH penalties up to $1.9M per category per year and individual liability for willful neglect. Speed and accuracy in the first 24 hours determine the entire outcome.',
      narration: 'In this module you will learn how to recognize a HIPAA breach, the four-factor risk assessment, and the notification timeline you must follow.',
    },
    navigation: { title: 'How This Training Works', body: NAV_BODY, bullets: NAV_BULLETS, narration: NAV_NARRATION },
    lessons: [
      {
        id: 'GAO-009-L1', order: 1, title: 'Recognizing a Breach',
        objectives: ['Define breach under HITECH', 'Apply the four-factor risk assessment'],
        cards: [
          { id: 'GAO-009-L1-S', type: 'summary', title: 'Definition of Breach', body: 'A breach is the unauthorized acquisition, access, use, or disclosure of unsecured PHI that compromises the security or privacy of the information. Encrypted PHI is generally not a breach.', narration: 'A breach is the unauthorized acquisition, access, use, or disclosure of unsecured PHI that compromises the security or privacy of the information. Encrypted PHI is generally not a breach because it remains unreadable.', estDurationSec: 45 },
          { id: 'GAO-009-L1-C1', type: 'content', title: 'Four-Factor Risk Assessment', body: '1. Nature and extent of PHI involved.\n2. Unauthorized person who used or received PHI.\n3. Whether PHI was actually acquired or viewed.\n4. Extent to which risk has been mitigated.', narration: 'When a possible breach occurs, the Privacy Officer applies a four-factor risk assessment: first, the nature and extent of PHI involved; second, the unauthorized person who used or received PHI; third, whether PHI was actually acquired or viewed; and fourth, the extent to which the risk has been mitigated.', estDurationSec: 60 },
          { id: 'GAO-009-L1-C2', type: 'content', title: 'Examples of Breach', body: 'Lost unencrypted laptop with PHI. Email with PHI sent to wrong recipient. Faxed PHI to wrong number. Social media post with patient photo. Employee snooping in records of a public figure.', narration: 'Examples of breach include: a lost unencrypted laptop with PHI; an email with PHI sent to the wrong recipient; a fax sent to the wrong number; a social media post with a patient photo; and an employee snooping in records of a public figure or a relative.', estDurationSec: 60 },
          { id: 'GAO-009-L1-CH', type: 'challenge', title: 'Breach or Not', body: 'Classify each event as breach, possible breach (assessment needed), or not a breach.', narration: 'Classify each event as breach, possible breach requiring assessment, or not a breach.', estDurationSec: 55, challenge: { id: 'GAO-009-L1-CH-Q', format: 'matching', prompt: 'Match each event.', narration: 'Match each event.',
            matches: [
              { left: 'Encrypted laptop lost in airport', right: 'Not a breach (encrypted)' },
              { left: 'Email with patient SSN to wrong recipient', right: 'Breach' },
              { left: 'Aide briefly looked at unrelated patient chart out of curiosity', right: 'Possible breach (assessment)' },
              { left: 'Disclosure to authorized treating physician', right: 'Not a breach (permitted)' },
            ], policyRef: 'CO-HP-003',
            feedbackCorrect: 'Each scenario maps to the correct category. The four-factor test resolves ambiguous cases.',
            feedbackIncorrect: 'Encryption removes most loss events from breach status. Snooping is always at minimum a possible breach.',
            complianceImpact: 'Misclassification of breach has resulted in published OCR settlements for failure to notify.',
            realWorldConsequence: 'Failure to notify within 60 days has triggered seven-figure fines and corrective action plans.',
            correctBehaviorGuidance: 'Report any possible breach to the Privacy Officer within 24 hours; let the four-factor assessment determine the rest.',
          } },
          {
            id: 'GAO-009-L1-C3',
            type: 'content',
            title: 'Field Example: Wrong-Number Fax Discovery',
            body: 'You find a confirmation sheet showing a 12-page fax with lab results was sent to a number that belongs to a local auto shop. You immediately secure the remaining faxes, notify the Privacy Officer, and complete the four-factor assessment with her. The shop owner confirms receipt and agrees to shred. Per CO-HP-003 (HIPAA Breach Notification) the twelve patients are notified within sixty days of discovery and the incident is logged.',
            narration: 'Field example. You find a fax confirmation for lab results sent to an auto shop. You secure remaining faxes, notify Privacy Officer, run the four-factor assessment. Shop agrees to shred. Per CO-HP-003 the twelve patients get notified within sixty days.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-009-L1-C4',
            type: 'content',
            title: 'Snooping vs. Mistake: Why Assessment Matters',
            body: 'An HHA looked at her neighbor\'s chart "just to see how she was doing." This is not a mistake; it is intentional unauthorized access. Even if no harm occurred, the four-factor test will almost always classify it as a breach because the person was not authorized. Report snooping the same day.',
            narration: 'Snooping is different from a mistake. An aide looking at a neighbor\'s chart is unauthorized access. The four-factor test will likely call it a breach even without harm. Report snooping the same day.',
            estDurationSec: 45,
          },
        ],
      },
      {
        id: 'GAO-009-L2', order: 2, title: 'Notification Timeline',
        objectives: ['State the notification timeline', 'Identify required notification recipients'],
        cards: [
          { id: 'GAO-009-L2-S', type: 'summary', title: 'Timeline Overview', body: 'Notification within 60 days of discovery to affected individuals; HHS within 60 days; media if 500+ residents of a state/jurisdiction; CA AG also when CA residents involved.', narration: 'Notification timelines: within sixty days of discovery to affected individuals; within sixty days to HHS; to the media if five hundred or more residents of a state or jurisdiction are affected; and to the California Attorney General when California residents are involved.', estDurationSec: 50 },
          { id: 'GAO-009-L2-C1', type: 'content', title: 'Individual Notification Content', body: 'Plain-language description; types of PHI involved; steps individuals can take; what the agency is doing to investigate, mitigate, and prevent recurrence; contact information for questions.', narration: 'Individual notification must contain a plain-language description of the breach, the types of PHI involved, steps individuals can take to protect themselves, what the agency is doing to investigate and mitigate, and contact information for questions.', estDurationSec: 55 },
          { id: 'GAO-009-L2-C2', type: 'content', title: 'Documentation in Breach Log', body: 'Every breach is documented in the breach log: date discovered, date occurred, individuals affected, PHI types, root cause, notifications sent, corrective actions. The breach log is reviewed quarterly by the Compliance Committee.', narration: 'Every breach is documented in the breach log with date discovered, date occurred, individuals affected, PHI types, root cause, notifications sent, and corrective actions. The breach log is reviewed quarterly by the Compliance Committee.', estDurationSec: 55 },
          { id: 'GAO-009-L2-CH', type: 'challenge', title: 'Notification Decision', body: 'You discover on March 1 that a fax with PHI for 12 patients was sent to a wrong number on February 15.', narration: 'You discover on March 1 that a fax containing PHI for twelve patients was sent to a wrong number on February 15. Choose the notification approach.', estDurationSec: 55, challenge: { id: 'GAO-009-L2-CH-Q', format: 'scenario_decision', prompt: 'What is required?', narration: 'What is required?',
            options: [
              { id: 'a', label: 'Notify only the recipient and ask them to destroy.', isCorrect: false, feedback: 'You may request destruction but you still must complete the four-factor assessment and notify if required.' },
              { id: 'b', label: 'Complete four-factor assessment, notify Privacy Officer; if breach, notify the 12 patients within 60 days of discovery (by April 30) and HHS within 60 days.', isCorrect: true, feedback: 'Correct.' },
              { id: 'c', label: 'Wait until annual HHS report.', isCorrect: false, feedback: 'Annual HHS report is for breaches under 500 individuals; individual notice still required within 60 days.' },
              { id: 'd', label: 'No action because under 500 individuals affected.', isCorrect: false, feedback: 'Individual notice is required regardless of count.' },
            ], policyRef: 'CO-HP-003',
            feedbackCorrect: 'Correct path: assess, notify Privacy Officer, notify individuals within 60 days of discovery, notify HHS.',
            feedbackIncorrect: 'Individual notification is required for any unauthorized disclosure once the four-factor test confirms breach.',
            complianceImpact: 'Late individual notification is a citable HITECH violation regardless of breach size.',
            realWorldConsequence: 'Late notification has led to media coverage, patient complaints, and OCR investigation.',
            correctBehaviorGuidance: 'Discovery starts the clock. Sixty days. Document everything. Use templates from CO-HP-003.',
          } },
        ],
      },
    ],
    finalTest: { id: 'GAO-009-FT', passingScorePct: 0.80, instructionsNarration: 'Final test on HIPAA breach reporting. Eighty percent required.', failAction: 'remediation', questions: [
      { id: 'q1', format: 'sequencing', prompt: 'Order the four-factor risk assessment factors.', narration: 'Order the four-factor risk assessment factors.',
        steps: [
          { id: 's1', label: 'Nature and extent of PHI involved' },
          { id: 's2', label: 'Unauthorized person who used or received PHI' },
          { id: 's3', label: 'Whether PHI was actually acquired or viewed' },
          { id: 's4', label: 'Extent of risk mitigation' },
        ], correctOrder: ['s1', 's2', 's3', 's4'], rationale: 'Canonical order required by 45 CFR 164.402.', policyRef: 'CO-HP-003' },
      { id: 'q2', format: 'matching', prompt: 'Match scenario to notification requirement.', narration: 'Match each scenario to the correct notification requirement.',
        matches: [
          { left: 'Breach affecting 12 patients', right: 'Individuals + HHS within 60 days; HHS via annual log' },
          { left: 'Breach affecting 750 California residents', right: 'Individuals + HHS within 60 days + media + CA AG' },
          { left: 'Encrypted device lost (no PHI exposure)', right: 'No notification required' },
        ], rationale: 'Threshold of 500 triggers media; CA AG required when CA residents involved.', policyRef: 'CO-HP-003' },
      { id: 'q3', format: 'true_false', prompt: 'The 60-day clock starts at discovery, not at occurrence.', narration: 'True or false: the 60-day notification clock starts at discovery, not at occurrence.',
        options: [{ id: 't', label: 'True', isCorrect: true, feedback: 'Correct.' }, { id: 'f', label: 'False', isCorrect: false, feedback: 'False \u2014 discovery starts the clock.' }],
        rationale: 'Discovery is the regulatory trigger; agencies must have processes to detect breach.', policyRef: 'CO-HP-003' },
      { id: 'q4', format: 'structured_input', prompt: 'Name the federal agency that must be notified of all breaches.', narration: 'Name the federal agency that must be notified of all HIPAA breaches.',
        fields: [{ id: 'agency', label: 'Agency', acceptableAnswers: ['HHS', 'OCR', 'HHS OCR', 'Department of Health and Human Services', 'Office for Civil Rights'] }],
        rationale: 'HHS Office for Civil Rights enforces HIPAA breach notification.', policyRef: 'CO-HP-003' },
    ] },
  },
  {
  moduleId: "GAO-010",
  policyRefs: [],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "Vital Signs & Health Monitoring",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Vital signs are the most fundamental clinical measurements in home health care. They provide objective data about a patient's cardiovascular, respiratory, and metabolic status.",
    narration: "Welcome to GAO-010, Vital Signs & Health Monitoring. Vital signs are the most fundamental clinical measurements in home health care. They provide objective data about a patient's cardiovascular, respiratory, and metabolic status."
  },
  navigation: {
    title: "How This Training Works",
    body: "You will move through one card at a time. Use Next and Previous to navigate. Your progress, time on each card, and challenge responses are tracked for compliance. Skipping cards is not allowed.",
    bullets: [
      "Single-card view",
      "Audio narration on every card",
      "Challenges required to advance",
      "80% to pass final test"
    ],
    narration: "One card at a time. Audio narration on every card. Challenges must be completed before you continue. The final test requires eighty percent to pass."
  },
  lessons: [
    {
      id: "GAO-010-L1",
      order: 1,
      title: "Introduction to Vital Signs in Home Health",
      objectives: [
        "Apply key requirements from Introduction to Vital Signs in Home Health",
        "Identify correct field actions related to Introduction to Vital Signs in Home Health"
      ],
      cards: [
        {
          id: "GAO-010-L1-S",
          type: "summary",
          title: "Introduction to Vital Signs in Home Health",
          body: "Vital signs are the most fundamental clinical measurements in home health care. They provide objective data about a patient's cardiovascular, respiratory, and metabolic status.",
          narration: "In this lesson: Introduction to Vital Signs in Home Health. Vital signs are the most fundamental clinical measurements in home health care. They provide objective data about a patient's cardiovascular, respiratory, and metabolic status. For every discipline at Care Indeed, understanding how to accurately measure, interpret, and report vital signs is a core competency that directly affects patient safety and clinical outcomes.",
          estDurationSec: 45
        },
        {
          id: "GAO-010-L1-C1",
          type: "content",
          title: "Introduction to Vital Signs in Home Health",
          body: "Vital signs are the most fundamental clinical measurements in home health care. They provide objective data about a patient's cardiovascular, respiratory, and metabolic status.",
          narration: "Vital signs are the most fundamental clinical measurements in home health care. They provide objective data about a patient's cardiovascular, respiratory, and metabolic status. For every discipline at Care Indeed, understanding how to accurately measure, interpret, and report vital signs is a core competency that directly affects patient safety and clinical outcomes. In home health, vital signs monitoring carries unique challenges compared to hospital or clinic settings. You are working in the patient's home, often without the backup of colleagues or advanced monitoring equipment. The vital signs you measure may be the only objective clinical data collected between visits. This means your measurements must be accurate, your documentation must be precise, and your ability to recognize abnormal values must be reliable. Vital signs serve four critical functions in home health. First, they establish a baseline for each patient at start of care. This baseline becomes the reference point against which",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L1-C2",
          type: "content",
          title: "Introduction to Vital Signs in Home Health (part 2)",
          body: "all subsequent measurements are compared. A blood pressure of 150 over 90 may be concerning in one patient but may be the well-controlled baseline for another patient with chronic hypertension. Without an accurate baseline, clinical decision-making is compromised.",
          narration: "all subsequent measurements are compared. A blood pressure of 150 over 90 may be concerning in one patient but may be the well-controlled baseline for another patient with chronic hypertension. Without an accurate baseline, clinical decision-making is compromised. Second, vital signs detect changes in patient condition. A rising heart rate, a dropping blood pressure, a new fever, or a declining oxygen saturation may be the first objective indicator of a clinical deterioration that requires physician notification, care plan modification, or emergency intervention. Third, vital signs support clinical documentation and billing defensibility. CMS surveyors and auditors review vital signs documentation to verify that skilled assessment was actually performed during visits. Incomplete or missing vital signs documentation raises questions about whether the visit met the requirements for skilled care. Fourth, vital signs are required elements of specific CMS assessments, including the OASIS comprehensive assessment at start of care, resumption of care, and",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L1-C3",
          type: "content",
          title: "Introduction to Vital Signs in Home Health (part 3)",
          body: "recertification. Accurate vital signs are essential for accurate OASIS scoring, which affects quality reporting, payment, and the patient's care trajectory.",
          narration: "recertification. Accurate vital signs are essential for accurate OASIS scoring, which affects quality reporting, payment, and the patient's care trajectory. This module covers the six core vital sign parameters you must be competent in: blood pressure, heart rate, respiratory rate, temperature, oxygen saturation, and pain assessment. For each parameter, you will learn the correct measurement technique, normal ranges, common errors, critical values requiring immediate action, and documentation requirements.",
          estDurationSec: 35
        },
        {
          id: "GAO-010-L1-CH",
          type: "challenge",
          title: "Knowledge Check 1 Q: Why is establishing a baseline vital…",
          body: "Knowledge Check 1 Q: Why is establishing a baseline vital signs measurement at start of care critically important? A: The baseline serves as the reference point for all subsequent comparisons.",
          narration: "Knowledge Check 1 Q: Why is establishing a baseline vital signs measurement at start of care critically important? A: The baseline serves as the reference point for all subsequent comparisons. Without it, clinicians cannot determine whether current values represent a change in condition or are the patient's normal.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-010-L1-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 1 Q: Why is establishing a baseline vital signs measurement at start of care critically important? A: The baseline serves as the reference point for all subsequent comparisons.",
            narration: "Knowledge Check 1 Q: Why is establishing a baseline vital signs measurement at start of care critically important? A: The baseline serves as the reference point for all subsequent comparisons.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    },
    {
      id: "GAO-010-L2",
      order: 2,
      title: "Blood Pressure",
      objectives: [
        "Apply key requirements from Blood Pressure",
        "Identify correct field actions related to Blood Pressure"
      ],
      cards: [
        {
          id: "GAO-010-L2-S",
          type: "summary",
          title: "Blood Pressure",
          body: "Blood pressure measurement is the most commonly assessed vital sign and one of the most commonly performed incorrectly. Accurate blood pressure measurement in the home requires proper technique, appropriate equipment, correct patient positioning, and awareness of factors that can produce false…",
          narration: "In this lesson: Blood Pressure. Blood pressure measurement is the most commonly assessed vital sign and one of the most commonly performed incorrectly. Accurate blood pressure measurement in the home requires proper technique, appropriate equipment, correct patient positioning, and awareness of factors that can produce false readings. The correct technique begins with patient preparation.",
          estDurationSec: 45
        },
        {
          id: "GAO-010-L2-C1",
          type: "content",
          title: "Blood Pressure",
          body: "Blood pressure measurement is the most commonly assessed vital sign and one of the most commonly performed incorrectly. Accurate blood pressure measurement in the home requires proper technique, appropriate equipment, correct patient positioning, and awareness of factors that can produce false readings.",
          narration: "Blood pressure measurement is the most commonly assessed vital sign and one of the most commonly performed incorrectly. Accurate blood pressure measurement in the home requires proper technique, appropriate equipment, correct patient positioning, and awareness of factors that can produce false readings. The correct technique begins with patient preparation. The patient should be seated comfortably with their back supported, feet flat on the floor, and legs uncrossed for at least five minutes before measurement. The arm should be supported at heart level. The patient should not have consumed caffeine, exercised, or smoked within thirty minutes of the measurement. In home health, these ideal conditions are not always achievable, so document any deviations that may affect the reading. Select the correct cuff size. An undersized cuff will produce falsely high readings and an oversized cuff will produce falsely low readings. The bladder of the cuff should encircle at least eighty percent",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L2-C2",
          type: "content",
          title: "Blood Pressure (part 2)",
          body: "of the patient's upper arm circumference. This is one of the most common sources of measurement error in home health because clinicians often carry only one cuff size. Apply the cuff snugly with the lower edge approximately two centimeters above the antecubital fossa.",
          narration: "of the patient's upper arm circumference. This is one of the most common sources of measurement error in home health because clinicians often carry only one cuff size. Apply the cuff snugly with the lower edge approximately two centimeters above the antecubital fossa. Palpate the brachial artery to confirm cuff placement. Inflate the cuff to approximately thirty millimeters of mercury above the point at which the radial pulse disappears, then deflate slowly at a rate of two to three millimeters per second while auscultating with the stethoscope. Normal adult blood pressure is defined as systolic below 120 and diastolic below 80 millimeters of mercury. Elevated blood pressure is systolic 120 to 129 with diastolic below 80. Stage 1 hypertension is systolic 130 to 139 or diastolic 80 to 89. Stage 2 hypertension is systolic 140 or higher or diastolic 90 or higher. Hypertensive crisis requiring immediate physician notification is systolic",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L2-C3",
          type: "content",
          title: "Blood Pressure (part 3)",
          body: "above 180 or diastolic above 120. Document blood pressure with the patient position, arm used, cuff size if non-standard, any factors affecting measurement, and comparison to the patient's baseline. If the reading is significantly different from the patient's baseline, repeat the measurement after two minutes of rest.",
          narration: "above 180 or diastolic above 120. Document blood pressure with the patient position, arm used, cuff size if non-standard, any factors affecting measurement, and comparison to the patient's baseline. If the reading is significantly different from the patient's baseline, repeat the measurement after two minutes of rest. If the second reading confirms the change, assess the patient for related symptoms and notify the physician per Care Indeed's critical value reporting protocol. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-010-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Blood Pressure\"?",
          narration: "What is the key takeaway from \"Blood Pressure\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-010-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Blood Pressure\"?",
            narration: "What is the key takeaway from \"Blood Pressure\"?",
            options: [
              {
                id: "a",
                label: "Blood pressure measurement is the most commonly assessed vital sign and one of the most commonly performed incorrectly.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Blood pressure measurement is the most commonly assessed vital sign and one of the most commonly performed incorrectly."
          }
        }
      ]
    },
    {
      id: "GAO-010-L3",
      order: 3,
      title: "Heart Rate & Respiratory Rate",
      objectives: [
        "Apply key requirements from Heart Rate & Respiratory Rate",
        "Identify correct field actions related to Heart Rate & Respiratory Rate"
      ],
      cards: [
        {
          id: "GAO-010-L3-S",
          type: "summary",
          title: "Heart Rate & Respiratory Rate",
          body: "Heart rate assessment in home health is performed by palpating a peripheral pulse, most commonly the radial artery at the wrist. Count the pulse for a full sixty seconds, not fifteen seconds multiplied by four.",
          narration: "In this lesson: Heart Rate & Respiratory Rate. Heart rate assessment in home health is performed by palpating a peripheral pulse, most commonly the radial artery at the wrist. Count the pulse for a full sixty seconds, not fifteen seconds multiplied by four. The full sixty-second count is essential in home health because it allows you to detect irregular rhythms that would be missed in a shorter count.",
          estDurationSec: 45
        },
        {
          id: "GAO-010-L3-C1",
          type: "content",
          title: "Heart Rate & Respiratory Rate",
          body: "Heart rate assessment in home health is performed by palpating a peripheral pulse, most commonly the radial artery at the wrist. Count the pulse for a full sixty seconds, not fifteen seconds multiplied by four.",
          narration: "Heart rate assessment in home health is performed by palpating a peripheral pulse, most commonly the radial artery at the wrist. Count the pulse for a full sixty seconds, not fifteen seconds multiplied by four. The full sixty-second count is essential in home health because it allows you to detect irregular rhythms that would be missed in a shorter count. Normal resting adult heart rate is 60 to 100 beats per minute. Bradycardia is a rate below 60. Tachycardia is a rate above 100. While assessing rate, also evaluate rhythm, noting whether it is regular or irregular, and strength, noting whether the pulse is bounding, normal, weak, or thready. Critical values requiring immediate physician notification include heart rate below 50 or above 120, new irregular rhythm not previously documented, pulse deficit where the apical rate differs significantly from the peripheral rate, and absent or barely palpable peripheral pulses in a",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L3-C2",
          type: "content",
          title: "Heart Rate & Respiratory Rate (part 2)",
          body: "patient not previously documented to have this finding. Respiratory rate is the vital sign most commonly estimated rather than actually counted. This is clinically dangerous.",
          narration: "patient not previously documented to have this finding. Respiratory rate is the vital sign most commonly estimated rather than actually counted. This is clinically dangerous. Respiratory rate changes are often the earliest indicator of clinical deterioration, sometimes preceding changes in heart rate or blood pressure by hours. To measure respiratory rate accurately, count the patient's breaths for a full sixty seconds without the patient knowing you are counting. Patients who know their breathing is being observed may unconsciously alter their respiratory pattern. One effective technique is to count respirations immediately after completing the pulse assessment while still holding the patient's wrist. Normal adult respiratory rate at rest is 12 to 20 breaths per minute. A rate below 12 is bradypnea. A rate above 20 is tachypnea. Critical findings include respiratory rate below 10 or above 28, use of accessory muscles, nasal flaring, pursed-lip breathing not previously observed, audible wheezing or",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L3-C3",
          type: "content",
          title: "Heart Rate & Respiratory Rate (part 3)",
          body: "stridor, and any change from the patient's baseline pattern. Document heart rate with rhythm regularity and pulse strength. Document respiratory rate with effort, pattern, and any adventitious sounds observed without a stethoscope. Compare all findings to the patient's baseline. ---",
          narration: "stridor, and any change from the patient's baseline pattern. Document heart rate with rhythm regularity and pulse strength. Document respiratory rate with effort, pattern, and any adventitious sounds observed without a stethoscope. Compare all findings to the patient's baseline. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-010-L3-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Heart Rate & Respiratory Rate\"?",
          narration: "What is the key takeaway from \"Heart Rate & Respiratory Rate\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-010-L3-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Heart Rate & Respiratory Rate\"?",
            narration: "What is the key takeaway from \"Heart Rate & Respiratory Rate\"?",
            options: [
              {
                id: "a",
                label: "Heart rate assessment in home health is performed by palpating a peripheral pulse, most commonly the radial artery at the wrist.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Heart rate assessment in home health is performed by palpating a peripheral pulse, most commonly the radial artery at the wrist. Count the pulse for a full sixty seconds, not fifteen seconds multiplied by four."
          }
        }
      ]
    },
    {
      id: "GAO-010-L4",
      order: 4,
      title: "Temperature & Oxygen Saturation",
      objectives: [
        "Apply key requirements from Temperature & Oxygen Saturation",
        "Identify correct field actions related to Temperature & Oxygen Saturation"
      ],
      cards: [
        {
          id: "GAO-010-L4-S",
          type: "summary",
          title: "Temperature & Oxygen Saturation",
          body: "Temperature measurement in home health most commonly uses oral, tympanic, or temporal artery methods. Rectal and axillary methods are used in specific clinical situations. Regardless of method, use the same method consistently for each patient to allow accurate trending.",
          narration: "In this lesson: Temperature & Oxygen Saturation. Temperature measurement in home health most commonly uses oral, tympanic, or temporal artery methods. Rectal and axillary methods are used in specific clinical situations. Regardless of method, use the same method consistently for each patient to allow accurate trending. Normal oral temperature is 97.8 to 99.1 degrees Fahrenheit or 36.5 to 37.3 degrees Celsius.",
          estDurationSec: 45
        },
        {
          id: "GAO-010-L4-C1",
          type: "content",
          title: "Temperature & Oxygen Saturation",
          body: "Temperature measurement in home health most commonly uses oral, tympanic, or temporal artery methods. Rectal and axillary methods are used in specific clinical situations. Regardless of method, use the same method consistently for each patient to allow accurate trending.",
          narration: "Temperature measurement in home health most commonly uses oral, tympanic, or temporal artery methods. Rectal and axillary methods are used in specific clinical situations. Regardless of method, use the same method consistently for each patient to allow accurate trending. Normal oral temperature is 97.8 to 99.1 degrees Fahrenheit or 36.5 to 37.3 degrees Celsius. Fever is defined as temperature at or above 100.4 degrees Fahrenheit or 38.0 degrees Celsius. Hypothermia is temperature below 95.0 degrees Fahrenheit or 35.0 degrees Celsius. In the elderly home health population, fever thresholds may be lower because older adults often have lower baseline temperatures and may not mount robust febrile responses to infection. Fever in a home health patient is a critical finding that requires immediate clinical assessment. Assess for signs of infection: examine any wounds, indwelling devices such as catheters, new respiratory symptoms, urinary symptoms, and skin changes. Notify the physician of any new",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L4-C2",
          type: "content",
          title: "Temperature & Oxygen Saturation (part 2)",
          body: "fever, as this may indicate infection requiring antibiotic therapy, medication adjustments, or emergency evaluation. Oxygen saturation is measured using pulse oximetry, a non-invasive sensor that measures the percentage of hemoglobin saturated with oxygen. Normal oxygen saturation is 95 percent or higher on room air.",
          narration: "fever, as this may indicate infection requiring antibiotic therapy, medication adjustments, or emergency evaluation. Oxygen saturation is measured using pulse oximetry, a non-invasive sensor that measures the percentage of hemoglobin saturated with oxygen. Normal oxygen saturation is 95 percent or higher on room air. Saturation below 90 percent is clinically significant and may indicate respiratory failure. Saturation below 88 percent in a patient not on supplemental oxygen requires immediate intervention. Pulse oximetry has known limitations. Dark nail polish, artificial nails, cold extremities, poor peripheral perfusion, patient movement, and certain medical conditions can produce inaccurate readings. If the reading does not correlate with the patient's clinical presentation, troubleshoot the device, try a different finger, warm the extremity, and reassess. Never rely solely on pulse oximetry — correlate with respiratory rate, breathing effort, skin color, and patient-reported symptoms. Document temperature with the method used and the time of measurement. Document oxygen saturation",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L4-C3",
          type: "content",
          title: "Temperature & Oxygen Saturation (part 3)",
          body: "with the sensor location, whether the patient was on room air or supplemental oxygen and at what flow rate, and the patient's position and activity level at the time of measurement. ---",
          narration: "with the sensor location, whether the patient was on room air or supplemental oxygen and at what flow rate, and the patient's position and activity level at the time of measurement. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-010-L4-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Temperature & Oxygen Saturation\"?",
          narration: "What is the key takeaway from \"Temperature & Oxygen Saturation\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-010-L4-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Temperature & Oxygen Saturation\"?",
            narration: "What is the key takeaway from \"Temperature & Oxygen Saturation\"?",
            options: [
              {
                id: "a",
                label: "Temperature measurement in home health most commonly uses oral, tympanic, or temporal artery methods. Rectal and axillary methods are used in specific clinical situations.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Temperature measurement in home health most commonly uses oral, tympanic, or temporal artery methods. Rectal and axillary methods are used in specific clinical situations."
          }
        }
      ]
    },
    {
      id: "GAO-010-L5",
      order: 5,
      title: "Pain Assessment",
      objectives: [
        "Apply key requirements from Pain Assessment",
        "Identify correct field actions related to Pain Assessment"
      ],
      cards: [
        {
          id: "GAO-010-L5-S",
          type: "summary",
          title: "Pain Assessment",
          body: "Pain assessment is both a vital sign and a patient right. CMS requires that agencies assess and manage pain as part of comprehensive patient care under the plan of care. Pain assessment in home health uses standardized scales appropriate to the patient's cognitive and communication abilities.",
          narration: "In this lesson: Pain Assessment. Pain assessment is both a vital sign and a patient right. CMS requires that agencies assess and manage pain as part of comprehensive patient care under the plan of care. Pain assessment in home health uses standardized scales appropriate to the patient's cognitive and communication abilities.",
          estDurationSec: 45
        },
        {
          id: "GAO-010-L5-C1",
          type: "content",
          title: "Pain Assessment",
          body: "Pain assessment is both a vital sign and a patient right. CMS requires that agencies assess and manage pain as part of comprehensive patient care under the plan of care. Pain assessment in home health uses standardized scales appropriate to the patient's cognitive and communication abilities.",
          narration: "Pain assessment is both a vital sign and a patient right. CMS requires that agencies assess and manage pain as part of comprehensive patient care under the plan of care. Pain assessment in home health uses standardized scales appropriate to the patient's cognitive and communication abilities. The Numeric Rating Scale asks patients to rate their pain from zero to ten, where zero is no pain and ten is the worst pain imaginable. This is the most commonly used scale for cognitively intact adults. The Wong-Baker FACES scale uses facial expressions to represent pain levels and is appropriate for patients with limited English proficiency, cognitive impairment, or communication barriers. The FLACC scale assesses pain behaviorally using five categories: Face, Legs, Activity, Cry, and Consolability. This is used for patients who cannot self-report, including non-verbal patients. When assessing pain, document the following components using the PQRST framework. P is for Provocation and",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L5-C2",
          type: "content",
          title: "Pain Assessment (part 2)",
          body: "Palliation — what makes the pain worse and what makes it better. Q is for Quality — how the patient describes the pain: sharp, dull, burning, aching, throbbing. R is for Region and Radiation — where the pain is located and whether it spreads. S is for Severity — the numeric rating.",
          narration: "Palliation — what makes the pain worse and what makes it better. Q is for Quality — how the patient describes the pain: sharp, dull, burning, aching, throbbing. R is for Region and Radiation — where the pain is located and whether it spreads. S is for Severity — the numeric rating. T is for Timing — when the pain started, how long it lasts, whether it is constant or intermittent. Compare the current pain assessment to the patient's baseline and to the pain documented on the plan of care. New onset pain, significantly worsened pain, pain not responding to prescribed interventions, and pain that interferes with the patient's functional goals all require physician notification and potential care plan modification. Never dismiss a patient's pain report. Pain is subjective, and the patient's self-report is the gold standard for pain assessment in cognitively intact individuals. If you believe a patient's pain",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L5-C3",
          type: "content",
          title: "Pain Assessment (part 3)",
          body: "report is inconsistent with your clinical observations, document both the patient's report and your objective findings, and communicate the discrepancy to the physician. ---",
          narration: "report is inconsistent with your clinical observations, document both the patient's report and your objective findings, and communicate the discrepancy to the physician. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-010-L5-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Pain Assessment\"?",
          narration: "What is the key takeaway from \"Pain Assessment\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-010-L5-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Pain Assessment\"?",
            narration: "What is the key takeaway from \"Pain Assessment\"?",
            options: [
              {
                id: "a",
                label: "Pain assessment is both a vital sign and a patient right. CMS requires that agencies assess and manage pain as part of comprehensive patient care under the plan of care.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Pain assessment is both a vital sign and a patient right. CMS requires that agencies assess and manage pain as part of comprehensive patient care under the plan of care."
          }
        }
      ]
    },
    {
      id: "GAO-010-L6",
      order: 6,
      title: "Critical Value Reporting & Scenarios (490 + 490 words) #",
      objectives: [
        "Apply key requirements from Critical Value Reporting & Scenarios (490 + 490 words) #",
        "Identify correct field actions related to Critical Value Reporting & Scenarios (490 + 490 words) #"
      ],
      cards: [
        {
          id: "GAO-010-L6-S",
          type: "summary",
          title: "Critical Value Reporting & Scenarios (490 + 490 words) #",
          body: "Critical Value Reporting & Scenarios (490 + 490 words) #",
          narration: "In this lesson: Critical Value Reporting & Scenarios (490 + 490 words) #. Critical Value Reporting & Scenarios (490 + 490 words) #",
          estDurationSec: 45
        },
        {
          id: "GAO-010-L6-C1",
          type: "content",
          title: "Critical Value Reporting & Scenarios (490 + 490 words) #",
          body: "Critical Value Reporting & Scenarios (490 + 490 words) #",
          narration: "Critical Value Reporting & Scenarios (490 + 490 words) #",
          estDurationSec: 35
        },
        {
          id: "GAO-010-L6-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Critical Value Reporting & Scenarios (490 + 490 words) #\"?",
          narration: "What is the key takeaway from \"Critical Value Reporting & Scenarios (490 + 490 words) #\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-010-L6-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Critical Value Reporting & Scenarios (490 + 490 words) #\"?",
            narration: "What is the key takeaway from \"Critical Value Reporting & Scenarios (490 + 490 words) #\"?",
            options: [
              {
                id: "a",
                label: "Critical Value Reporting & Scenarios (490 + 490 words) #",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Critical Value Reporting & Scenarios (490 + 490 words) #"
          }
        }
      ]
    },
    {
      id: "GAO-010-L7",
      order: 7,
      title: "Critical Value Reporting Protocol",
      objectives: [
        "Apply key requirements from Critical Value Reporting Protocol",
        "Identify correct field actions related to Critical Value Reporting Protocol"
      ],
      cards: [
        {
          id: "GAO-010-L7-S",
          type: "summary",
          title: "Critical Value Reporting Protocol",
          body: "Care Indeed maintains a critical value reporting protocol that defines which vital sign findings require immediate physician notification. This protocol ensures that clinically significant findings are communicated promptly, not left in documentation to be discovered later.",
          narration: "In this lesson: Critical Value Reporting Protocol. Care Indeed maintains a critical value reporting protocol that defines which vital sign findings require immediate physician notification. This protocol ensures that clinically significant findings are communicated promptly, not left in documentation to be discovered later. Critical blood pressure values: systolic above 180 or below 90, diastolic above 120 or below 60.",
          estDurationSec: 45
        },
        {
          id: "GAO-010-L7-C1",
          type: "content",
          title: "Critical Value Reporting Protocol",
          body: "Care Indeed maintains a critical value reporting protocol that defines which vital sign findings require immediate physician notification. This protocol ensures that clinically significant findings are communicated promptly, not left in documentation to be discovered later.",
          narration: "Care Indeed maintains a critical value reporting protocol that defines which vital sign findings require immediate physician notification. This protocol ensures that clinically significant findings are communicated promptly, not left in documentation to be discovered later. Critical blood pressure values: systolic above 180 or below 90, diastolic above 120 or below 60. Critical heart rate: above 120 or below 50, new irregular rhythm. Critical respiratory rate: above 28 or below 10, new respiratory distress. Critical temperature: above 101.5 degrees Fahrenheit or below 95.0 degrees Fahrenheit. Critical oxygen saturation: below 90 percent on room air or below prescribed target for patients on supplemental oxygen. Critical pain: new onset severe pain rated 8 or above, pain suggesting acute event such as chest pain or sudden severe headache. When you encounter a critical value, take the following steps in order. First, stay with the patient and assess their overall condition. A single abnormal",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L7-C2",
          type: "content",
          title: "Critical Value Reporting Protocol (part 2)",
          body: "vital sign in an otherwise stable-appearing patient may have a different clinical urgency than the same value in a patient who appears acutely ill. Second, repeat the measurement to confirm accuracy, correcting any technique issues identified. Third, if confirmed, notify the physician immediately by phone.",
          narration: "vital sign in an otherwise stable-appearing patient may have a different clinical urgency than the same value in a patient who appears acutely ill. Second, repeat the measurement to confirm accuracy, correcting any technique issues identified. Third, if confirmed, notify the physician immediately by phone. Do not send a fax, leave a message with the answering service and wait, or document the finding and assume someone else will see it. Immediate means you make direct verbal contact with the physician or their covering provider. Fourth, document the vital sign, the time you obtained it, the time you notified the physician, the physician's name, and the orders received. Fifth, implement any verbal orders received and document them. Sixth, if you cannot reach the physician and the patient's condition suggests a medical emergency, activate 911 per Care Indeed's emergency protocol. The critical value protocol exists because vital signs are time-sensitive clinical data.",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L7-C3",
          type: "content",
          title: "Critical Value Reporting Protocol (part 3)",
          body: "A blood pressure of 190 over 115 documented in a visit note but not communicated to the physician until the note is reviewed days later represents a patient safety failure. Timely reporting is not optional.",
          narration: "A blood pressure of 190 over 115 documented in a visit note but not communicated to the physician until the note is reviewed days later represents a patient safety failure. Timely reporting is not optional.",
          estDurationSec: 35
        },
        {
          id: "GAO-010-L7-CH",
          type: "challenge",
          title: "Scenario Challenge 1 Scenario: During a routine visit, you…",
          body: "Scenario Challenge 1 Scenario: During a routine visit, you measure the patient's blood pressure at 185/118. The patient reports a mild headache but denies chest pain, vision changes, or shortness of breath.",
          narration: "Scenario Challenge 1 Scenario: During a routine visit, you measure the patient's blood pressure at 185/118. The patient reports a mild headache but denies chest pain, vision changes, or shortness of breath. The patient's baseline is 138/82.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-010-L7-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 1 Scenario: During a routine visit, you measure the patient's blood pressure at 185/118. The patient reports a mild headache but denies chest pain, vision changes, or shortness of breath. The patient's baseline is 138/82.",
            narration: "Scenario Challenge 1 Scenario: During a routine visit, you measure the patient's blood pressure at 185/118. The patient reports a mild headache but denies chest pain, vision changes, or shortness of breath. The patient's baseline is 138/82.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    },
    {
      id: "GAO-010-L8",
      order: 8,
      title: "Common Errors and Documentation",
      objectives: [
        "Apply key requirements from Common Errors and Documentation",
        "Identify correct field actions related to Common Errors and Documentation"
      ],
      cards: [
        {
          id: "GAO-010-L8-S",
          type: "summary",
          title: "Common Errors and Documentation",
          body: "The most common vital signs errors in home health are avoidable with proper technique and awareness. Estimating rather than counting respiratory rate leads to inaccurate data. Using the wrong cuff size leads to false blood pressure readings.",
          narration: "In this lesson: Common Errors and Documentation. The most common vital signs errors in home health are avoidable with proper technique and awareness. Estimating rather than counting respiratory rate leads to inaccurate data. Using the wrong cuff size leads to false blood pressure readings. Measuring vital signs immediately upon arrival before the patient has rested leads to artificially elevated readings.",
          estDurationSec: 45
        },
        {
          id: "GAO-010-L8-C1",
          type: "content",
          title: "Common Errors and Documentation",
          body: "The most common vital signs errors in home health are avoidable with proper technique and awareness. Estimating rather than counting respiratory rate leads to inaccurate data. Using the wrong cuff size leads to false blood pressure readings.",
          narration: "The most common vital signs errors in home health are avoidable with proper technique and awareness. Estimating rather than counting respiratory rate leads to inaccurate data. Using the wrong cuff size leads to false blood pressure readings. Measuring vital signs immediately upon arrival before the patient has rested leads to artificially elevated readings. Failing to compare current readings to the patient's documented baseline means changes go unrecognized. Documenting vital signs without noting position, activity level, or relevant factors makes the data less useful for trending. Documentation standards for vital signs at Care Indeed require recording the measurement value, the method used, the patient's position, any factors affecting accuracy, comparison to baseline with notation of significant changes, and any actions taken in response to abnormal findings including physician notification. Vital signs documentation is reviewed during CMS surveys to verify that skilled assessment was actually performed and that clinicians responded appropriately to",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L8-C2",
          type: "content",
          title: "Common Errors and Documentation (part 2)",
          body: "abnormal findings. A visit note that contains vital signs without any clinical interpretation, comparison to baseline, or action taken for abnormal values suggests the clinician measured the vitals but did not actually assess the patient's status.",
          narration: "abnormal findings. A visit note that contains vital signs without any clinical interpretation, comparison to baseline, or action taken for abnormal values suggests the clinician measured the vitals but did not actually assess the patient's status.",
          estDurationSec: 35
        },
        {
          id: "GAO-010-L8-CH",
          type: "challenge",
          title: "Scenario Challenge 2 Scenario: An HHA reports to you that…",
          body: "Scenario Challenge 2 Scenario: An HHA reports to you that the patient's blood pressure was \"normal\" during the last visit.",
          narration: "Scenario Challenge 2 Scenario: An HHA reports to you that the patient's blood pressure was \"normal\" during the last visit. When you ask for the specific numbers, the HHA cannot provide them and admits they did not actually take the blood pressure but assumed it was fine because the patient \"looked okay.\" Expected…",
          estDurationSec: 55,
          challenge: {
            id: "GAO-010-L8-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 2 Scenario: An HHA reports to you that the patient's blood pressure was \"normal\" during the last visit.",
            narration: "Scenario Challenge 2 Scenario: An HHA reports to you that the patient's blood pressure was \"normal\" during the last visit.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    },
    {
      id: "GAO-010-L9",
      order: 9,
      title: "Module Summary",
      objectives: [
        "Apply key requirements from Module Summary",
        "Identify correct field actions related to Module Summary"
      ],
      cards: [
        {
          id: "GAO-010-L9-S",
          type: "summary",
          title: "Module Summary",
          body: "Vital signs in home health are your most fundamental clinical assessment tool. Accuracy matters because your measurements may be the only objective clinical data between visits.",
          narration: "In this lesson: Module Summary. Vital signs in home health are your most fundamental clinical assessment tool. Accuracy matters because your measurements may be the only objective clinical data between visits. Technique matters because common errors like wrong cuff size, rushed counts, and estimated respiratory rates produce unreliable data.",
          estDurationSec: 45
        },
        {
          id: "GAO-010-L9-C1",
          type: "content",
          title: "Module Summary",
          body: "Vital signs in home health are your most fundamental clinical assessment tool. Accuracy matters because your measurements may be the only objective clinical data between visits. Technique matters because common errors like wrong cuff size, rushed counts, and estimated respiratory rates produce unreliable data.",
          narration: "Vital signs in home health are your most fundamental clinical assessment tool. Accuracy matters because your measurements may be the only objective clinical data between visits. Technique matters because common errors like wrong cuff size, rushed counts, and estimated respiratory rates produce unreliable data. Comparison to baseline matters because a vital sign value is only meaningful in the context of what is normal for that specific patient. The six parameters covered in this module are blood pressure, heart rate, respiratory rate, temperature, oxygen saturation, and pain. Each has specific normal ranges, critical values, measurement techniques, and documentation requirements. Know the critical values that require immediate physician notification and follow the agency's critical value reporting protocol without exception. Document vital signs completely: value, method, position, relevant factors, baseline comparison, and actions taken. Vital signs documentation is not just a clinical requirement — it is a billing defensibility requirement that CMS surveyors",
          estDurationSec: 64
        },
        {
          id: "GAO-010-L9-C2",
          type: "content",
          title: "Module Summary (part 2)",
          body: "specifically review. Proceed to the final exam. Ten questions, eighty percent to pass. ---",
          narration: "specifically review. Proceed to the final exam. Ten questions, eighty percent to pass. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-010-L9-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Module Summary\"?",
          narration: "What is the key takeaway from \"Module Summary\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-010-L9-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Module Summary\"?",
            narration: "What is the key takeaway from \"Module Summary\"?",
            options: [
              {
                id: "a",
                label: "Vital signs in home health are your most fundamental clinical assessment tool. Accuracy matters because your measurements may be the only objective clinical data between visits.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Vital signs in home health are your most fundamental clinical assessment tool. Accuracy matters because your measurements may be the only objective clinical data between visits."
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-010-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Vital Signs & Health Monitoring. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Normal adult resting heart rate range is",
        narration: "Normal adult resting heart rate range is",
        options: [
          {
            id: "a",
            label: "40-80",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "60-100",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "80-120",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "50-90",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q1 from AAA Record v2.0 for GAO-010."
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "An undersized BP cuff produces: A) Falsely high readings ✓",
        narration: "An undersized BP cuff produces: A) Falsely high readings ✓",
        options: [
          {
            id: "a",
            label: "Falsely low",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Accurate",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "No effect",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q2 from AAA Record v2.0 for GAO-010."
      },
      {
        id: "q3",
        format: "scenario_decision",
        prompt: "Normal SpO2 on room air",
        narration: "Normal SpO2 on room air",
        options: [
          {
            id: "a",
            label: ">85%",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: ">88%",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "≥95%",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: ">98%",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q3 from AAA Record v2.0 for GAO-010."
      },
      {
        id: "q4",
        format: "scenario_decision",
        prompt: "Respiratory rate should be counted for",
        narration: "Respiratory rate should be counted for",
        options: [
          {
            id: "a",
            label: "15 sec ×4",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "30 sec ×2",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Full 60 seconds",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "10 sec ×6",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q4 from AAA Record v2.0 for GAO-010."
      },
      {
        id: "q5",
        format: "scenario_decision",
        prompt: "Pain assessment gold standard for cognitively intact patients",
        narration: "Pain assessment gold standard for cognitively intact patients",
        options: [
          {
            id: "a",
            label: "FLACC",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Behavioral observation",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Patient self-report",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Family report",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q5 from AAA Record v2.0 for GAO-010."
      },
      {
        id: "q6",
        format: "scenario_decision",
        prompt: "Critical systolic BP requiring immediate physician notification",
        narration: "Critical systolic BP requiring immediate physician notification",
        options: [
          {
            id: "a",
            label: ">140",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: ">160",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: ">180",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: ">200",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q6 from AAA Record v2.0 for GAO-010."
      },
      {
        id: "q7",
        format: "scenario_decision",
        prompt: "PQRST framework — what does the R stand for?",
        narration: "PQRST framework — what does the R stand for?",
        options: [
          {
            id: "a",
            label: "Rate",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Region and Radiation",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Recovery",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Respiration",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q7 from AAA Record v2.0 for GAO-010."
      },
      {
        id: "q8",
        format: "scenario_decision",
        prompt: "Pulse oximetry limitation: A) Dark nail polish can cause inaccurate readings ✓",
        narration: "Pulse oximetry limitation: A) Dark nail polish can cause inaccurate readings ✓",
        options: [
          {
            id: "a",
            label: "Always accurate",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Works better in cold",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Only for hospital use",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q8 from AAA Record v2.0 for GAO-010."
      },
      {
        id: "q9",
        format: "scenario_decision",
        prompt: "New fever in a home health patient requires",
        narration: "New fever in a home health patient requires",
        options: [
          {
            id: "a",
            label: "Only documentation",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Assessment for infection and physician notification",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Wait for next visit",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Reduce medications",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q9 from AAA Record v2.0 for GAO-010."
      },
      {
        id: "q10",
        format: "scenario_decision",
        prompt: "An HHA admits to documenting vital signs without actually measuring them. This is",
        narration: "An HHA admits to documenting vital signs without actually measuring them. This is",
        options: [
          {
            id: "a",
            label: "Acceptable if patient appears stable",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "A minor issue",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Documentation falsification requiring reporting and competency reassessment",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Normal practice --- ## QA VALIDATION SUMMARY",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q10 from AAA Record v2.0 for GAO-010."
      }
    ]
  }
},
  {
  moduleId: "GAO-011",
  policyRefs: [],
  cmsRefs: [],
  estimatedDurationMin: 25,
  durationSource: "DEFAULT",
  splash: {
    title: "Communication Skills",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Communication is the single most important non-clinical skill in home health care. Research consistently shows that communication failures — not clinical incompetence — are the leading root cause of adverse events, sentinel events, and patient complaints in…",
    narration: "Welcome to GAO-011, Communication Skills. Communication is the single most important non-clinical skill in home health care. Research consistently shows that communication failures — not clinical incompetence — are the leading root cause of adverse events, sentinel events, and patient complaints in…"
  },
  navigation: {
    title: "How This Training Works",
    body: "You will move through one card at a time. Use Next and Previous to navigate. Your progress, time on each card, and challenge responses are tracked for compliance. Skipping cards is not allowed.",
    bullets: [
      "Single-card view",
      "Audio narration on every card",
      "Challenges required to advance",
      "80% to pass final test"
    ],
    narration: "One card at a time. Audio narration on every card. Challenges must be completed before you continue. The final test requires eighty percent to pass."
  },
  lessons: [
    {
      id: "GAO-011-L1",
      order: 1,
      title: "Why Communication Matters in Home Health",
      objectives: [
        "Apply key requirements from Why Communication Matters in Home Health",
        "Identify correct field actions related to Why Communication Matters in Home Health"
      ],
      cards: [
        {
          id: "GAO-011-L1-S",
          type: "summary",
          title: "Why Communication Matters in Home Health",
          body: "Communication is the single most important non-clinical skill in home health care. Research consistently shows that communication failures — not clinical incompetence — are the leading root cause of adverse events, sentinel events, and patient complaints in healthcare.",
          narration: "In this lesson: Why Communication Matters in Home Health. Communication is the single most important non-clinical skill in home health care. Research consistently shows that communication failures — not clinical incompetence — are the leading root cause of adverse events, sentinel events, and patient complaints in healthcare.",
          estDurationSec: 45
        },
        {
          id: "GAO-011-L1-C1",
          type: "content",
          title: "Why Communication Matters in Home Health",
          body: "Communication is the single most important non-clinical skill in home health care. Research consistently shows that communication failures — not clinical incompetence — are the leading root cause of adverse events, sentinel events, and patient complaints in healthcare.",
          narration: "Communication is the single most important non-clinical skill in home health care. Research consistently shows that communication failures — not clinical incompetence — are the leading root cause of adverse events, sentinel events, and patient complaints in healthcare. In home health, where you work independently in patient homes without the safety net of nearby colleagues, your communication skills directly determine patient safety outcomes. Effective communication in home health operates across multiple channels simultaneously. You communicate with patients during every visit — explaining procedures, providing education, assessing understanding, and building the therapeutic relationship. You communicate with families and caregivers who may be performing care between your visits and need clear, accurate instructions. You communicate with physicians when reporting changes in condition, requesting orders, and clarifying care plans. You communicate with other members of the interdisciplinary team through documentation, phone calls, secure messages, and case conferences. And you communicate with your supervisors",
          estDurationSec: 64
        },
        {
          id: "GAO-011-L1-C2",
          type: "content",
          title: "Why Communication Matters in Home Health (part 2)",
          body: "about scheduling, clinical concerns, and administrative matters. A breakdown in any of these communication channels can produce patient harm. A patient who does not understand their medication instructions may take the wrong dose. A caregiver who receives unclear wound care directions may cause infection.",
          narration: "about scheduling, clinical concerns, and administrative matters. A breakdown in any of these communication channels can produce patient harm. A patient who does not understand their medication instructions may take the wrong dose. A caregiver who receives unclear wound care directions may cause infection. A physician who does not receive timely notification of a deteriorating patient may miss the window for effective intervention. A team member who does not read your critical documentation note may fail to follow up on an urgent finding. This module covers the core communication competencies that every Care Indeed employee must demonstrate: active listening, clear verbal communication, professional non-verbal communication, the SBAR communication framework for clinical reporting, communication with cognitively impaired patients, communication with families and caregivers, and documentation as communication.",
          estDurationSec: 54
        },
        {
          id: "GAO-011-L1-CH",
          type: "challenge",
          title: "Knowledge Check 1 Q: What is the leading root cause of…",
          body: "Knowledge Check 1 Q: What is the leading root cause of adverse events in healthcare? A: Communication failures, not clinical incompetence.",
          narration: "Knowledge Check 1 Q: What is the leading root cause of adverse events in healthcare? A: Communication failures, not clinical incompetence. Research across healthcare settings consistently identifies breakdowns in communication as the primary contributor to patient safety events. ---",
          estDurationSec: 55,
          challenge: {
            id: "GAO-011-L1-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 1 Q: What is the leading root cause of adverse events in healthcare? A: Communication failures, not clinical incompetence. Research across healthcare settings consistently identifies breakdowns in communication as the primary contributor to patient safety events.",
            narration: "Knowledge Check 1 Q: What is the leading root cause of adverse events in healthcare? A: Communication failures, not clinical incompetence. Research across healthcare settings consistently identifies breakdowns in communication as the primary contributor to patient safety events.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    },
    {
      id: "GAO-011-L2",
      order: 2,
      title: "Active Listening",
      objectives: [
        "Apply key requirements from Active Listening",
        "Identify correct field actions related to Active Listening"
      ],
      cards: [
        {
          id: "GAO-011-L2-S",
          type: "summary",
          title: "Active Listening",
          body: "Active listening is the foundation of all effective communication. In home health, active listening means fully concentrating on what the patient is saying, understanding their message, responding thoughtfully, and remembering what was communicated. It is not the same as hearing.",
          narration: "In this lesson: Active Listening. Active listening is the foundation of all effective communication. In home health, active listening means fully concentrating on what the patient is saying, understanding their message, responding thoughtfully, and remembering what was communicated. It is not the same as hearing. Hearing is passive. Listening is an active clinical skill that requires intention and practice.",
          estDurationSec: 45
        },
        {
          id: "GAO-011-L2-C1",
          type: "content",
          title: "Active Listening",
          body: "Active listening is the foundation of all effective communication. In home health, active listening means fully concentrating on what the patient is saying, understanding their message, responding thoughtfully, and remembering what was communicated. It is not the same as hearing. Hearing is passive.",
          narration: "Active listening is the foundation of all effective communication. In home health, active listening means fully concentrating on what the patient is saying, understanding their message, responding thoughtfully, and remembering what was communicated. It is not the same as hearing. Hearing is passive. Listening is an active clinical skill that requires intention and practice. The components of active listening include giving full attention by making eye contact, facing the speaker, and putting away distractions. In a patient's home, this means not looking at your phone, not rifling through your bag for supplies while the patient is talking, and not mentally planning your documentation while the patient describes their symptoms. Patients know when you are truly listening and when you are going through the motions. Reflective listening involves restating or paraphrasing what the patient said to confirm your understanding. For example, if a patient says they have been having trouble sleeping",
          estDurationSec: 64
        },
        {
          id: "GAO-011-L2-C2",
          type: "content",
          title: "Active Listening (part 2)",
          body: "because their leg hurts at night, an active listening response would be: So the pain in your leg is worse at night and it is affecting your sleep. Is that correct? This technique serves two purposes: it confirms you understood correctly, and it makes the patient feel heard.",
          narration: "because their leg hurts at night, an active listening response would be: So the pain in your leg is worse at night and it is affecting your sleep. Is that correct? This technique serves two purposes: it confirms you understood correctly, and it makes the patient feel heard. Open-ended questions encourage patients to provide more detailed information than yes or no responses. Instead of asking Are you in pain, ask Tell me about any pain or discomfort you have been experiencing. Instead of Did you take your medications, ask Walk me through how you have been taking your medications this week. Open-ended questions reveal adherence issues, misunderstandings, and concerns that closed questions miss. Silence is a communication tool. After asking a question, allow the patient time to think and respond. Do not rush to fill silence. Many patients, especially elderly patients and those with cognitive or language processing challenges, need",
          estDurationSec: 64
        },
        {
          id: "GAO-011-L2-C3",
          type: "content",
          title: "Active Listening (part 3)",
          body: "additional time to formulate their responses. Rushing them produces incomplete answers and makes them feel pressured. ---",
          narration: "additional time to formulate their responses. Rushing them produces incomplete answers and makes them feel pressured. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-011-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Active Listening\"?",
          narration: "What is the key takeaway from \"Active Listening\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-011-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Active Listening\"?",
            narration: "What is the key takeaway from \"Active Listening\"?",
            options: [
              {
                id: "a",
                label: "Active listening is the foundation of all effective communication. In home health, active listening means fully concentrating on what the patient is saying, understanding their…",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Active listening is the foundation of all effective communication. In home health, active listening means fully concentrating on what the patient is saying, understanding their message, responding thoughtfully, and…"
          }
        }
      ]
    },
    {
      id: "GAO-011-L3",
      order: 3,
      title: "SBAR Communication Framework",
      objectives: [
        "Apply key requirements from SBAR Communication Framework",
        "Identify correct field actions related to SBAR Communication Framework"
      ],
      cards: [
        {
          id: "GAO-011-L3-S",
          type: "summary",
          title: "SBAR Communication Framework",
          body: "SBAR is the standardized communication framework used at Care Indeed for all clinical communications with physicians, supervisors, and team members. SBAR stands for Situation, Background, Assessment, and Recommendation.",
          narration: "In this lesson: SBAR Communication Framework. SBAR is the standardized communication framework used at Care Indeed for all clinical communications with physicians, supervisors, and team members. SBAR stands for Situation, Background, Assessment, and Recommendation. Using SBAR ensures that your communication is organized, concise, and clinically actionable. Situation is a brief statement of the current issue.",
          estDurationSec: 45
        },
        {
          id: "GAO-011-L3-C1",
          type: "content",
          title: "SBAR Communication Framework",
          body: "SBAR is the standardized communication framework used at Care Indeed for all clinical communications with physicians, supervisors, and team members. SBAR stands for Situation, Background, Assessment, and Recommendation. Using SBAR ensures that your communication is organized, concise, and clinically actionable.",
          narration: "SBAR is the standardized communication framework used at Care Indeed for all clinical communications with physicians, supervisors, and team members. SBAR stands for Situation, Background, Assessment, and Recommendation. Using SBAR ensures that your communication is organized, concise, and clinically actionable. Situation is a brief statement of the current issue. State who you are, your role, which patient you are calling about, and what is happening right now. For example: This is Maria, RN with Care Indeed. I am calling about Mr. Johnson. He has a new temperature of 101.8 and increased confusion since my last visit two days ago. Background provides the relevant clinical context. Include the patient's admitting diagnosis, relevant medical history, current medications, baseline status, and any recent changes. For example: Mr. Johnson is a 78-year-old with a primary diagnosis of CHF. He has a Foley catheter placed two weeks ago. His baseline temperature is 97.6 and he",
          estDurationSec: 64
        },
        {
          id: "GAO-011-L3-C2",
          type: "content",
          title: "SBAR Communication Framework (part 2)",
          body: "is normally alert and oriented times three. Assessment is your clinical interpretation of what you believe is happening. This is where your clinical judgment matters. For example: I am concerned about a possible urinary tract infection given the new fever, increased confusion, and the presence of a Foley catheter.",
          narration: "is normally alert and oriented times three. Assessment is your clinical interpretation of what you believe is happening. This is where your clinical judgment matters. For example: I am concerned about a possible urinary tract infection given the new fever, increased confusion, and the presence of a Foley catheter. Recommendation is what you are requesting from the physician. Be specific. For example: I would like to request orders for a urinalysis and urine culture, and guidance on whether to initiate empiric antibiotics or send the patient to the emergency department for evaluation. SBAR works because it gives the physician the information they need in the order they need it, without requiring them to extract the relevant details from a rambling narrative. Physicians respond more quickly and more accurately to SBAR-formatted communications because the structure eliminates ambiguity. Practice SBAR before making calls. Write down the four components before you pick up",
          estDurationSec: 64
        },
        {
          id: "GAO-011-L3-C3",
          type: "content",
          title: "SBAR Communication Framework (part 3)",
          body: "the phone. This is especially important for new employees who may feel nervous calling physicians. Having your SBAR prepared ensures you communicate clearly even under stress.",
          narration: "the phone. This is especially important for new employees who may feel nervous calling physicians. Having your SBAR prepared ensures you communicate clearly even under stress.",
          estDurationSec: 35
        },
        {
          id: "GAO-011-L3-CH",
          type: "challenge",
          title: "Scenario Challenge 1 Scenario: You are an LVN visiting a…",
          body: "Scenario Challenge 1 Scenario: You are an LVN visiting a patient who was discharged from the hospital three days ago after pneumonia treatment.",
          narration: "Scenario Challenge 1 Scenario: You are an LVN visiting a patient who was discharged from the hospital three days ago after pneumonia treatment. The patient's respiratory rate is 26, SpO2 is 91% on room air, and they have a productive cough with yellow-green sputum.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-011-L3-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 1 Scenario: You are an LVN visiting a patient who was discharged from the hospital three days ago after pneumonia treatment. The patient's respiratory rate is 26, SpO2 is 91% on room air, and they have a productive cough with yellow-green sputum.",
            narration: "Scenario Challenge 1 Scenario: You are an LVN visiting a patient who was discharged from the hospital three days ago after pneumonia treatment. The patient's respiratory rate is 26, SpO2 is 91% on room air, and they have a productive cough with yellow-green sputum.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    },
    {
      id: "GAO-011-L4",
      order: 4,
      title: "Communicating with Cognitively Impaired Patients",
      objectives: [
        "Apply key requirements from Communicating with Cognitively Impaired Patients",
        "Identify correct field actions related to Communicating with Cognitively Impaired Patients"
      ],
      cards: [
        {
          id: "GAO-011-L4-S",
          type: "summary",
          title: "Communicating with Cognitively Impaired Patients",
          body: "Home health clinicians frequently work with patients who have cognitive impairment from dementia, stroke, traumatic brain injury, medication effects, or delirium. Communicating effectively with these patients requires specific techniques that differ from standard communication.",
          narration: "In this lesson: Communicating with Cognitively Impaired Patients. Home health clinicians frequently work with patients who have cognitive impairment from dementia, stroke, traumatic brain injury, medication effects, or delirium. Communicating effectively with these patients requires specific techniques that differ from standard communication. Approach the patient calmly and from the front.",
          estDurationSec: 45
        },
        {
          id: "GAO-011-L4-C1",
          type: "content",
          title: "Communicating with Cognitively Impaired Patients",
          body: "Home health clinicians frequently work with patients who have cognitive impairment from dementia, stroke, traumatic brain injury, medication effects, or delirium. Communicating effectively with these patients requires specific techniques that differ from standard communication.",
          narration: "Home health clinicians frequently work with patients who have cognitive impairment from dementia, stroke, traumatic brain injury, medication effects, or delirium. Communicating effectively with these patients requires specific techniques that differ from standard communication. Approach the patient calmly and from the front. Patients with cognitive impairment may be startled or confused by someone approaching from behind or from the side. Make eye contact before speaking. Introduce yourself by name and role at every visit, even if you have visited many times before. Do not assume the patient remembers you. Use simple, short sentences with concrete language. Instead of saying We need to assess your peripheral vascular status and check for dependent edema, say I am going to look at your feet and legs to see if there is any swelling. Break complex instructions into single steps. Instead of After you eat breakfast, take the white pill with a full glass",
          estDurationSec: 64
        },
        {
          id: "GAO-011-L4-C2",
          type: "content",
          title: "Communicating with Cognitively Impaired Patients (part 2)",
          body: "of water, and then wait thirty minutes before taking the blue pill, separate each instruction and confirm understanding before moving to the next one. Avoid arguing, correcting, or reasoning with a patient who is confused.",
          narration: "of water, and then wait thirty minutes before taking the blue pill, separate each instruction and confirm understanding before moving to the next one. Avoid arguing, correcting, or reasoning with a patient who is confused. If a patient with dementia believes their deceased spouse is coming to visit, do not say Your spouse passed away three years ago. Instead, redirect gently: Tell me about your spouse. What was their favorite thing about this home? Correcting a confused patient causes distress and agitation without improving their cognition. Use non-verbal cues to support your verbal communication. Point to objects you are discussing. Demonstrate tasks rather than only describing them. Use a calm, steady tone of voice. Facial expressions and body language communicate more than words for patients with language processing deficits. Allow extra time. Cognitive processing takes longer in impaired patients. Ask one question at a time and wait for a response.",
          estDurationSec: 64
        },
        {
          id: "GAO-011-L4-C3",
          type: "content",
          title: "Communicating with Cognitively Impaired Patients (part 3)",
          body: "Do not repeat the question immediately if the patient does not respond. Count silently to ten before rephrasing. ---",
          narration: "Do not repeat the question immediately if the patient does not respond. Count silently to ten before rephrasing. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-011-L4-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Communicating with Cognitively Impaired Patients\"?",
          narration: "What is the key takeaway from \"Communicating with Cognitively Impaired Patients\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-011-L4-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Communicating with Cognitively Impaired Patients\"?",
            narration: "What is the key takeaway from \"Communicating with Cognitively Impaired Patients\"?",
            options: [
              {
                id: "a",
                label: "Home health clinicians frequently work with patients who have cognitive impairment from dementia, stroke, traumatic brain injury, medication effects, or delirium.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Home health clinicians frequently work with patients who have cognitive impairment from dementia, stroke, traumatic brain injury, medication effects, or delirium."
          }
        }
      ]
    },
    {
      id: "GAO-011-L5",
      order: 5,
      title: "Family Communication & Documentation as Communication (470 + 470 words) #",
      objectives: [
        "Apply key requirements from Family Communication & Documentation as Communication (470 + 470 words) #",
        "Identify correct field actions related to Family Communication & Documentation as Communication (470 + 470 words) #"
      ],
      cards: [
        {
          id: "GAO-011-L5-S",
          type: "summary",
          title: "Family Communication & Documentation as Communication (470 + 470 words) #",
          body: "Family Communication & Documentation as Communication (470 + 470 words) #",
          narration: "In this lesson: Family Communication & Documentation as Communication (470 + 470 words) #. Family Communication & Documentation as Communication (470 + 470 words) #",
          estDurationSec: 45
        },
        {
          id: "GAO-011-L5-C1",
          type: "content",
          title: "Family Communication & Documentation as Communication (470 + 470 words) #",
          body: "Family Communication & Documentation as Communication (470 + 470 words) #",
          narration: "Family Communication & Documentation as Communication (470 + 470 words) #",
          estDurationSec: 35
        },
        {
          id: "GAO-011-L5-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Family Communication & Documentation as Communication (470 + 470 words) #\"?",
          narration: "What is the key takeaway from \"Family Communication & Documentation as Communication (470 + 470 words) #\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-011-L5-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Family Communication & Documentation as Communication (470 + 470 words) #\"?",
            narration: "What is the key takeaway from \"Family Communication & Documentation as Communication (470 + 470 words) #\"?",
            options: [
              {
                id: "a",
                label: "Family Communication & Documentation as Communication (470 + 470 words) #",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Family Communication & Documentation as Communication (470 + 470 words) #"
          }
        }
      ]
    },
    {
      id: "GAO-011-L6",
      order: 6,
      title: "Family & Caregiver Communication",
      objectives: [
        "Apply key requirements from Family & Caregiver Communication",
        "Identify correct field actions related to Family & Caregiver Communication"
      ],
      cards: [
        {
          id: "GAO-011-L6-S",
          type: "summary",
          title: "Family & Caregiver Communication",
          body: "Families and caregivers are essential partners in home health care. Between your visits, they are the ones providing care, monitoring for changes, and making decisions about when to call for help. The quality of your communication with families directly affects patient outcomes between visits.",
          narration: "In this lesson: Family & Caregiver Communication. Families and caregivers are essential partners in home health care. Between your visits, they are the ones providing care, monitoring for changes, and making decisions about when to call for help. The quality of your communication with families directly affects patient outcomes between visits. When providing caregiver education, use the teach-back method.",
          estDurationSec: 45
        },
        {
          id: "GAO-011-L6-C1",
          type: "content",
          title: "Family & Caregiver Communication",
          body: "Families and caregivers are essential partners in home health care. Between your visits, they are the ones providing care, monitoring for changes, and making decisions about when to call for help. The quality of your communication with families directly affects patient outcomes between visits.",
          narration: "Families and caregivers are essential partners in home health care. Between your visits, they are the ones providing care, monitoring for changes, and making decisions about when to call for help. The quality of your communication with families directly affects patient outcomes between visits. When providing caregiver education, use the teach-back method. After explaining a procedure or instruction, ask the caregiver to repeat it back in their own words or demonstrate the technique. Do not ask Do you understand because most people will say yes regardless of actual comprehension. Instead say Show me how you would change the wound dressing or Tell me in your own words when you should call the agency. Document caregiver education and the teach-back response in your visit notes. This documentation serves as evidence that education was provided and understood, which CMS requires and surveyors verify. Manage family expectations proactively. Families may have unrealistic expectations",
          estDurationSec: 64
        },
        {
          id: "GAO-011-L6-C2",
          type: "content",
          title: "Family & Caregiver Communication (part 2)",
          body: "about recovery timelines, service frequency, or what home health can provide. Address these expectations early with honest, compassionate communication.",
          narration: "about recovery timelines, service frequency, or what home health can provide. Address these expectations early with honest, compassionate communication. If a family expects daily nursing visits but the plan of care authorizes three times per week, explain the rationale and help them understand what to do between visits. When families express concerns or complaints, listen fully before responding. Acknowledge their feelings. Do not become defensive. If the concern is valid, acknowledge it and take action. If it requires escalation, explain that you will communicate their concern to your supervisor or the care coordinator. #",
          estDurationSec: 40
        },
        {
          id: "GAO-011-L6-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Family & Caregiver Communication\"?",
          narration: "What is the key takeaway from \"Family & Caregiver Communication\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-011-L6-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Family & Caregiver Communication\"?",
            narration: "What is the key takeaway from \"Family & Caregiver Communication\"?",
            options: [
              {
                id: "a",
                label: "Families and caregivers are essential partners in home health care. Between your visits, they are the ones providing care, monitoring for changes, and making decisions about when…",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Families and caregivers are essential partners in home health care. Between your visits, they are the ones providing care, monitoring for changes, and making decisions about when to call for help."
          }
        }
      ]
    },
    {
      id: "GAO-011-L7",
      order: 7,
      title: "Documentation as Communication",
      objectives: [
        "Apply key requirements from Documentation as Communication",
        "Identify correct field actions related to Documentation as Communication"
      ],
      cards: [
        {
          id: "GAO-011-L7-S",
          type: "summary",
          title: "Documentation as Communication",
          body: "In home health, your documentation is your primary communication tool with the rest of the care team. Unlike a hospital where you can speak to the next nurse at shift change, your home health colleagues may not see or talk to you for days.",
          narration: "In this lesson: Documentation as Communication. In home health, your documentation is your primary communication tool with the rest of the care team. Unlike a hospital where you can speak to the next nurse at shift change, your home health colleagues may not see or talk to you for days. Your visit notes are how they learn what happened during your visit.",
          estDurationSec: 45
        },
        {
          id: "GAO-011-L7-C1",
          type: "content",
          title: "Documentation as Communication",
          body: "In home health, your documentation is your primary communication tool with the rest of the care team. Unlike a hospital where you can speak to the next nurse at shift change, your home health colleagues may not see or talk to you for days. Your visit notes are how they learn what happened during your visit.",
          narration: "In home health, your documentation is your primary communication tool with the rest of the care team. Unlike a hospital where you can speak to the next nurse at shift change, your home health colleagues may not see or talk to you for days. Your visit notes are how they learn what happened during your visit. Write your documentation as if the next reader is a clinician who has never met this patient and needs to understand the patient's current status, what happened during the visit, and what needs to happen next. Avoid vague language like patient doing well without objective data to support the assessment. Instead write: Patient ambulated 50 feet with rolling walker independently, demonstrating improved endurance from 30 feet on last visit. Denies pain. Steady gait observed. No assistive device modifications needed. Use standard medical terminology consistently. Avoid abbreviations that could be misinterpreted. Follow Care Indeed's documentation",
          estDurationSec: 64
        },
        {
          id: "GAO-011-L7-C2",
          type: "content",
          title: "Documentation as Communication (part 2)",
          body: "standards for format, content, and timeliness. Complete your visit notes before leaving the patient's home whenever possible. Documentation completed later relies on memory and is more likely to contain errors or omissions.",
          narration: "standards for format, content, and timeliness. Complete your visit notes before leaving the patient's home whenever possible. Documentation completed later relies on memory and is more likely to contain errors or omissions.",
          estDurationSec: 35
        },
        {
          id: "GAO-011-L7-CH",
          type: "challenge",
          title: "Knowledge Check 2 Q: What is the teach-back method and why…",
          body: "Knowledge Check 2 Q: What is the teach-back method and why is it superior to asking Do you understand? A: Teach-back asks the patient or caregiver to explain or demonstrate the instruction in their own words.",
          narration: "Knowledge Check 2 Q: What is the teach-back method and why is it superior to asking Do you understand? A: Teach-back asks the patient or caregiver to explain or demonstrate the instruction in their own words.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-011-L7-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 2 Q: What is the teach-back method and why is it superior to asking Do you understand? A: Teach-back asks the patient or caregiver to explain or demonstrate the instruction in their own words.",
            narration: "Knowledge Check 2 Q: What is the teach-back method and why is it superior to asking Do you understand? A: Teach-back asks the patient or caregiver to explain or demonstrate the instruction in their own words.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    },
    {
      id: "GAO-011-L8",
      order: 8,
      title: "Module Summary",
      objectives: [
        "Apply key requirements from Module Summary",
        "Identify correct field actions related to Module Summary"
      ],
      cards: [
        {
          id: "GAO-011-L8-S",
          type: "summary",
          title: "Module Summary",
          body: "Communication is your most important non-clinical skill. In home health, where you work independently, communication failures are the leading cause of adverse events. Active listening, SBAR, teach-back, and clear documentation are your core tools.",
          narration: "In this lesson: Module Summary. Communication is your most important non-clinical skill. In home health, where you work independently, communication failures are the leading cause of adverse events. Active listening, SBAR, teach-back, and clear documentation are your core tools. Use active listening with every patient: full attention, reflective responses, open-ended questions, and comfortable silence.",
          estDurationSec: 45
        },
        {
          id: "GAO-011-L8-C1",
          type: "content",
          title: "Module Summary",
          body: "Communication is your most important non-clinical skill. In home health, where you work independently, communication failures are the leading cause of adverse events. Active listening, SBAR, teach-back, and clear documentation are your core tools.",
          narration: "Communication is your most important non-clinical skill. In home health, where you work independently, communication failures are the leading cause of adverse events. Active listening, SBAR, teach-back, and clear documentation are your core tools. Use active listening with every patient: full attention, reflective responses, open-ended questions, and comfortable silence. Use SBAR for every clinical communication with physicians and supervisors: Situation, Background, Assessment, Recommendation. Prepare your SBAR before calling. Adapt your communication for cognitively impaired patients: approach from the front, use simple language, avoid arguing, allow extra processing time. Communicate with families using teach-back to verify understanding. Manage expectations proactively. Document caregiver education and the response. Document as if the next reader has never met the patient. Be specific, objective, and timely. Your notes are how the care team communicates across time and distance. Proceed to the final exam. Ten questions, eighty percent to pass.",
          estDurationSec: 62
        },
        {
          id: "GAO-011-L8-CH",
          type: "challenge",
          title: "Scenario Challenge 2 Scenario: You visit a patient whose…",
          body: "Scenario Challenge 2 Scenario: You visit a patient whose daughter speaks limited English. The daughter is the primary caregiver and needs to perform daily wound care between your visits.",
          narration: "Scenario Challenge 2 Scenario: You visit a patient whose daughter speaks limited English. The daughter is the primary caregiver and needs to perform daily wound care between your visits.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-011-L8-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 2 Scenario: You visit a patient whose daughter speaks limited English. The daughter is the primary caregiver and needs to perform daily wound care between your visits.",
            narration: "Scenario Challenge 2 Scenario: You visit a patient whose daughter speaks limited English. The daughter is the primary caregiver and needs to perform daily wound care between your visits.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-011-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Communication Skills. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Leading root cause of adverse events in healthcare",
        narration: "Leading root cause of adverse events in healthcare",
        options: [
          {
            id: "a",
            label: "Clinical incompetence",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Communication failures",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Equipment malfunction",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Staffing shortages",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q1 from AAA Record v2.0 for GAO-011."
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "SBAR — S stands for: A) Situation ✓",
        narration: "SBAR — S stands for: A) Situation ✓",
        options: [
          {
            id: "a",
            label: "Summary",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Safety",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Standard",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q2 from AAA Record v2.0 for GAO-011."
      },
      {
        id: "q3",
        format: "scenario_decision",
        prompt: "Teach-back is superior to \"Do you understand?\" because",
        narration: "Teach-back is superior to \"Do you understand?\" because",
        options: [
          {
            id: "a",
            label: "It saves time",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "It verifies actual comprehension",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "It's required by OSHA",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Patients prefer it",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q3 from AAA Record v2.0 for GAO-011."
      },
      {
        id: "q4",
        format: "scenario_decision",
        prompt: "With a cognitively impaired patient, you should",
        narration: "With a cognitively impaired patient, you should",
        options: [
          {
            id: "a",
            label: "Speak loudly",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Use simple, short sentences and allow extra processing time",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Skip the assessment",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only talk to the caregiver",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q4 from AAA Record v2.0 for GAO-011."
      },
      {
        id: "q5",
        format: "scenario_decision",
        prompt: "Visit documentation should be completed",
        narration: "Visit documentation should be completed",
        options: [
          {
            id: "a",
            label: "At the end of the day",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Within 48 hours",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Before leaving the patient's home whenever possible",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Weekly",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q5 from AAA Record v2.0 for GAO-011."
      },
      {
        id: "q6",
        format: "scenario_decision",
        prompt: "Active listening includes",
        narration: "Active listening includes",
        options: [
          {
            id: "a",
            label: "Planning your next question while the patient talks",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Reflective listening and paraphrasing",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Interrupting to save time",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Avoiding eye contact",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q6 from AAA Record v2.0 for GAO-011."
      },
      {
        id: "q7",
        format: "scenario_decision",
        prompt: "SBAR R (Recommendation) should include: A) What you are specifically requesting from the physician ✓",
        narration: "SBAR R (Recommendation) should include: A) What you are specifically requesting from the physician ✓",
        options: [
          {
            id: "a",
            label: "The patient's insurance information",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Your personal opinion",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Nothing — let the physician decide",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q7 from AAA Record v2.0 for GAO-011."
      },
      {
        id: "q8",
        format: "scenario_decision",
        prompt: "When a family member expresses a complaint, your first response should be",
        narration: "When a family member expresses a complaint, your first response should be",
        options: [
          {
            id: "a",
            label: "Defend the agency",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Redirect to the office",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Listen fully and acknowledge their feelings",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Document and leave",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q8 from AAA Record v2.0 for GAO-011."
      },
      {
        id: "q9",
        format: "scenario_decision",
        prompt: "A patient with dementia insists their deceased spouse is visiting today. You should",
        narration: "A patient with dementia insists their deceased spouse is visiting today. You should",
        options: [
          {
            id: "a",
            label: "Correct them firmly",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Redirect gently without arguing",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Call the physician",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Contact the family to correct the patient",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q9 from AAA Record v2.0 for GAO-011."
      },
      {
        id: "q10",
        format: "scenario_decision",
        prompt: "If a caregiver cannot demonstrate proper technique during teach-back, you should",
        narration: "If a caregiver cannot demonstrate proper technique during teach-back, you should",
        options: [
          {
            id: "a",
            label: "Assume they'll figure it out",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Re-educate using a different approach and repeat teach-back",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Document \"education provided\" and leave",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Ask a family member to learn instead --- ## QA VALIDATION SUMMARY",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q10 from AAA Record v2.0 for GAO-011."
      }
    ]
  }
},
  {
  moduleId: "GAO-012",
  policyRefs: [],
  cmsRefs: [],
  estimatedDurationMin: 25,
  durationSource: "DEFAULT",
  splash: {
    title: "Cultural Competency & Sensitivity",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Cultural competency in home health care means providing services that are respectful of and responsive to the cultural and linguistic needs of patients and families. This is not optional.",
    narration: "Welcome to GAO-012, Cultural Competency & Sensitivity. Cultural competency in home health care means providing services that are respectful of and responsive to the cultural and linguistic needs of patients and families. This is not optional."
  },
  navigation: {
    title: "How This Training Works",
    body: "You will move through one card at a time. Use Next and Previous to navigate. Your progress, time on each card, and challenge responses are tracked for compliance. Skipping cards is not allowed.",
    bullets: [
      "Single-card view",
      "Audio narration on every card",
      "Challenges required to advance",
      "80% to pass final test"
    ],
    narration: "One card at a time. Audio narration on every card. Challenges must be completed before you continue. The final test requires eighty percent to pass."
  },
  lessons: [
    {
      id: "GAO-012-L1",
      order: 1,
      title: "Cultural Competency in Home Health",
      objectives: [
        "Apply key requirements from Cultural Competency in Home Health",
        "Identify correct field actions related to Cultural Competency in Home Health"
      ],
      cards: [
        {
          id: "GAO-012-L1-S",
          type: "summary",
          title: "Cultural Competency in Home Health",
          body: "Cultural competency in home health care means providing services that are respectful of and responsive to the cultural and linguistic needs of patients and families. This is not optional.",
          narration: "In this lesson: Cultural Competency in Home Health. Cultural competency in home health care means providing services that are respectful of and responsive to the cultural and linguistic needs of patients and families. This is not optional. CMS requires that home health agencies address cultural and language needs as part of patient-centered care under the Conditions of Participation.",
          estDurationSec: 45
        },
        {
          id: "GAO-012-L1-C1",
          type: "content",
          title: "Cultural Competency in Home Health",
          body: "Cultural competency in home health care means providing services that are respectful of and responsive to the cultural and linguistic needs of patients and families. This is not optional.",
          narration: "Cultural competency in home health care means providing services that are respectful of and responsive to the cultural and linguistic needs of patients and families. This is not optional. CMS requires that home health agencies address cultural and language needs as part of patient-centered care under the Conditions of Participation. In home health, cultural competency has a unique dimension because you are entering the patient's home — their most personal space. The home reflects the patient's culture, values, beliefs, and life experience in ways that a hospital room never can. You may encounter religious items, dietary practices, family structures, communication styles, and health beliefs that differ from your own. Your ability to provide competent, respectful care in this environment directly affects the therapeutic relationship, patient cooperation, treatment adherence, and clinical outcomes. Cultural competency is not about memorizing facts about different cultures. It is about developing cultural humility — the recognition",
          estDurationSec: 64
        },
        {
          id: "GAO-012-L1-C2",
          type: "content",
          title: "Cultural Competency in Home Health (part 2)",
          body: "that your own cultural perspective is one of many, that you cannot fully understand another person's cultural experience, and that you must approach each patient with genuine curiosity and respect rather than assumptions.",
          narration: "that your own cultural perspective is one of many, that you cannot fully understand another person's cultural experience, and that you must approach each patient with genuine curiosity and respect rather than assumptions. Patient rights under 42 CFR Section 484.50 include the right to be treated with dignity and respect, which encompasses respect for cultural practices, religious beliefs, personal values, and preferences. ACHC accreditation standards similarly require agencies to demonstrate that staff are trained in cultural sensitivity and that care delivery is culturally responsive. This module covers cultural humility, health beliefs and practices across cultures, effective use of interpreter services, religious and spiritual care considerations, LGBTQ+ inclusive care, and recognizing and managing implicit bias.",
          estDurationSec: 49
        },
        {
          id: "GAO-012-L1-CH",
          type: "challenge",
          title: "Knowledge Check 1 Q: What is the difference between…",
          body: "Knowledge Check 1 Q: What is the difference between cultural competency and cultural humility? A: Cultural competency implies mastering knowledge about cultures, which is impossible given cultural diversity.",
          narration: "Knowledge Check 1 Q: What is the difference between cultural competency and cultural humility? A: Cultural competency implies mastering knowledge about cultures, which is impossible given cultural diversity.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-012-L1-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 1 Q: What is the difference between cultural competency and cultural humility? A: Cultural competency implies mastering knowledge about cultures, which is impossible given cultural diversity.",
            narration: "Knowledge Check 1 Q: What is the difference between cultural competency and cultural humility? A: Cultural competency implies mastering knowledge about cultures, which is impossible given cultural diversity.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    },
    {
      id: "GAO-012-L2",
      order: 2,
      title: "Health Beliefs & Practices",
      objectives: [
        "Apply key requirements from Health Beliefs & Practices",
        "Identify correct field actions related to Health Beliefs & Practices"
      ],
      cards: [
        {
          id: "GAO-012-L2-S",
          type: "summary",
          title: "Health Beliefs & Practices",
          body: "Patients from different cultural backgrounds may hold health beliefs that influence how they understand illness, whether they accept treatment, how they communicate symptoms, and what role they expect healthcare providers to play.",
          narration: "In this lesson: Health Beliefs & Practices. Patients from different cultural backgrounds may hold health beliefs that influence how they understand illness, whether they accept treatment, how they communicate symptoms, and what role they expect healthcare providers to play. Understanding these variations helps you provide effective, respectful care.",
          estDurationSec: 45
        },
        {
          id: "GAO-012-L2-C1",
          type: "content",
          title: "Health Beliefs & Practices",
          body: "Patients from different cultural backgrounds may hold health beliefs that influence how they understand illness, whether they accept treatment, how they communicate symptoms, and what role they expect healthcare providers to play. Understanding these variations helps you provide effective, respectful care.",
          narration: "Patients from different cultural backgrounds may hold health beliefs that influence how they understand illness, whether they accept treatment, how they communicate symptoms, and what role they expect healthcare providers to play. Understanding these variations helps you provide effective, respectful care. Some patients view illness through a biomedical model consistent with Western medicine — illness has physical causes and physical treatments. Others may view illness through spiritual or supernatural frameworks, believing that illness results from spiritual imbalance, punishment, or the evil eye. Still others may integrate traditional healing practices with biomedical care, using herbal remedies, acupuncture, cupping, or other traditional treatments alongside prescribed medications. Your role is not to judge these beliefs but to understand them so you can provide safe care. If a patient is using herbal remedies alongside prescribed medications, you need to know about it because of potential drug-herb interactions. If a patient believes their illness is",
          estDurationSec: 64
        },
        {
          id: "GAO-012-L2-C2",
          type: "content",
          title: "Health Beliefs & Practices (part 2)",
          body: "spiritual in nature, understanding this belief helps you provide compassionate care while ensuring they also receive necessary medical treatment. Ask about health beliefs respectfully. Questions like Many people use remedies or practices they learned from their family or culture alongside their medical treatment.",
          narration: "spiritual in nature, understanding this belief helps you provide compassionate care while ensuring they also receive necessary medical treatment. Ask about health beliefs respectfully. Questions like Many people use remedies or practices they learned from their family or culture alongside their medical treatment. Are you using any herbal remedies, teas, supplements, or other treatments? are non-judgmental and produce honest answers. Questions that imply the patient's practices are wrong will produce dishonesty or patient disengagement. Dietary practices may be culturally or religiously determined. Patients who observe halal, kosher, vegetarian, or other dietary requirements need meal preparation guidance that respects these practices. If you are an HHA providing meal preparation, understanding the patient's dietary requirements is a clinical and cultural competency requirement. Pain expression varies culturally. Some cultures value stoicism and patients may underreport pain. Others are more expressive. Neither is right or wrong. Your role is to assess pain using standardized",
          estDurationSec: 64
        },
        {
          id: "GAO-012-L2-C3",
          type: "content",
          title: "Health Beliefs & Practices (part 3)",
          body: "tools while being aware that cultural norms may influence how the patient communicates their experience. ---",
          narration: "tools while being aware that cultural norms may influence how the patient communicates their experience. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-012-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Health Beliefs & Practices\"?",
          narration: "What is the key takeaway from \"Health Beliefs & Practices\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-012-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Health Beliefs & Practices\"?",
            narration: "What is the key takeaway from \"Health Beliefs & Practices\"?",
            options: [
              {
                id: "a",
                label: "Patients from different cultural backgrounds may hold health beliefs that influence how they understand illness, whether they accept treatment, how they communicate symptoms, and…",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Patients from different cultural backgrounds may hold health beliefs that influence how they understand illness, whether they accept treatment, how they communicate symptoms, and what role they expect healthcare…"
          }
        }
      ]
    },
    {
      id: "GAO-012-L3",
      order: 3,
      title: "Language Access & Interpreter Services",
      objectives: [
        "Apply key requirements from Language Access & Interpreter Services",
        "Identify correct field actions related to Language Access & Interpreter Services"
      ],
      cards: [
        {
          id: "GAO-012-L3-S",
          type: "summary",
          title: "Language Access & Interpreter Services",
          body: "Language barriers are one of the most significant patient safety risks in home health. A patient who cannot understand your instructions may take medications incorrectly, fail to follow wound care protocols, or not know when to call for help.",
          narration: "In this lesson: Language Access & Interpreter Services. Language barriers are one of the most significant patient safety risks in home health. A patient who cannot understand your instructions may take medications incorrectly, fail to follow wound care protocols, or not know when to call for help.",
          estDurationSec: 45
        },
        {
          id: "GAO-012-L3-C1",
          type: "content",
          title: "Language Access & Interpreter Services",
          body: "Language barriers are one of the most significant patient safety risks in home health. A patient who cannot understand your instructions may take medications incorrectly, fail to follow wound care protocols, or not know when to call for help.",
          narration: "Language barriers are one of the most significant patient safety risks in home health. A patient who cannot understand your instructions may take medications incorrectly, fail to follow wound care protocols, or not know when to call for help. Title VI of the Civil Rights Act requires agencies receiving federal funds to provide meaningful access to services for patients with limited English proficiency. Care Indeed provides interpreter services for patients who need them. When a patient has limited English proficiency, you must use qualified interpreter services rather than relying on family members, especially children, to interpret. Family members may lack medical vocabulary, may filter information to protect the patient from distressing news, may have their own agenda about treatment decisions, or may not accurately convey clinical nuances. Qualified interpreters are trained in medical terminology, confidentiality, impartiality, and the ethics of interpretation. They do not add, omit, or modify what either",
          estDurationSec: 64
        },
        {
          id: "GAO-012-L3-C2",
          type: "content",
          title: "Language Access & Interpreter Services (part 2)",
          body: "party says. They understand HIPAA requirements and maintain patient confidentiality. When working with an interpreter, speak directly to the patient, not to the interpreter. Use short sentences. Pause after each concept to allow interpretation. Avoid medical jargon and idioms that may not translate.",
          narration: "party says. They understand HIPAA requirements and maintain patient confidentiality. When working with an interpreter, speak directly to the patient, not to the interpreter. Use short sentences. Pause after each concept to allow interpretation. Avoid medical jargon and idioms that may not translate. Use teach-back through the interpreter to verify patient understanding. Document any language barriers encountered, the type of interpreter service used, and the patient's demonstrated understanding. This documentation is evidence of language access compliance and is reviewed during surveys. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-012-L3-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Language Access & Interpreter Services\"?",
          narration: "What is the key takeaway from \"Language Access & Interpreter Services\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-012-L3-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Language Access & Interpreter Services\"?",
            narration: "What is the key takeaway from \"Language Access & Interpreter Services\"?",
            options: [
              {
                id: "a",
                label: "Language barriers are one of the most significant patient safety risks in home health.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Language barriers are one of the most significant patient safety risks in home health. A patient who cannot understand your instructions may take medications incorrectly, fail to follow wound care protocols, or not know…"
          }
        }
      ]
    },
    {
      id: "GAO-012-L4",
      order: 4,
      title: "Religious & Spiritual Care",
      objectives: [
        "Apply key requirements from Religious & Spiritual Care",
        "Identify correct field actions related to Religious & Spiritual Care"
      ],
      cards: [
        {
          id: "GAO-012-L4-S",
          type: "summary",
          title: "Religious & Spiritual Care",
          body: "Religious and spiritual beliefs influence many aspects of patient care in the home. Patients may have preferences about prayer times, dietary restrictions, modesty requirements, gender of caregivers, end-of-life decisions, and the role of religious leaders in healthcare decision-making.",
          narration: "In this lesson: Religious & Spiritual Care. Religious and spiritual beliefs influence many aspects of patient care in the home. Patients may have preferences about prayer times, dietary restrictions, modesty requirements, gender of caregivers, end-of-life decisions, and the role of religious leaders in healthcare decision-making. Respect the patient's spiritual practices even if they differ from your own or from what you consider mainstream.",
          estDurationSec: 45
        },
        {
          id: "GAO-012-L4-C1",
          type: "content",
          title: "Religious & Spiritual Care",
          body: "Religious and spiritual beliefs influence many aspects of patient care in the home. Patients may have preferences about prayer times, dietary restrictions, modesty requirements, gender of caregivers, end-of-life decisions, and the role of religious leaders in healthcare decision-making.",
          narration: "Religious and spiritual beliefs influence many aspects of patient care in the home. Patients may have preferences about prayer times, dietary restrictions, modesty requirements, gender of caregivers, end-of-life decisions, and the role of religious leaders in healthcare decision-making. Respect the patient's spiritual practices even if they differ from your own or from what you consider mainstream. If a patient prays at specific times, schedule your care activities around those times when possible. If a patient's religious practices include dietary requirements, incorporate them into your nutritional planning. If a patient requests a specific gender for their caregiver due to religious modesty requirements, communicate this preference to the scheduling team. Do not impose your own religious or spiritual beliefs on patients. This includes not proselytizing, not leaving religious materials, not commenting negatively on the patient's beliefs, and not expressing judgment about spiritual practices that differ from your own. Your role is clinical",
          estDurationSec: 64
        },
        {
          id: "GAO-012-L4-C2",
          type: "content",
          title: "Religious & Spiritual Care (part 2)",
          body: "care, not spiritual guidance, unless the patient specifically requests spiritual support and the agency has appropriate resources. Advance directives and end-of-life decisions are often influenced by religious beliefs. Some faiths prohibit withdrawal of life-sustaining treatment. Others view suffering as redemptive.",
          narration: "care, not spiritual guidance, unless the patient specifically requests spiritual support and the agency has appropriate resources. Advance directives and end-of-life decisions are often influenced by religious beliefs. Some faiths prohibit withdrawal of life-sustaining treatment. Others view suffering as redemptive. Understanding the religious context of these decisions helps you provide respectful care during sensitive conversations. Always involve the patient's designated religious leader or spiritual advisor when the patient requests it. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-012-L4-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Religious & Spiritual Care\"?",
          narration: "What is the key takeaway from \"Religious & Spiritual Care\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-012-L4-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Religious & Spiritual Care\"?",
            narration: "What is the key takeaway from \"Religious & Spiritual Care\"?",
            options: [
              {
                id: "a",
                label: "Religious and spiritual beliefs influence many aspects of patient care in the home.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Religious and spiritual beliefs influence many aspects of patient care in the home. Patients may have preferences about prayer times, dietary restrictions, modesty requirements, gender of caregivers, end-of-life…"
          }
        }
      ]
    },
    {
      id: "GAO-012-L5",
      order: 5,
      title: "LGBTQ+ Inclusive Care",
      objectives: [
        "Apply key requirements from LGBTQ+ Inclusive Care",
        "Identify correct field actions related to LGBTQ+ Inclusive Care"
      ],
      cards: [
        {
          id: "GAO-012-L5-S",
          type: "summary",
          title: "LGBTQ+ Inclusive Care",
          body: "LGBTQ+ patients may face unique barriers to healthcare including past experiences of discrimination, fear of judgment, reluctance to disclose relevant health information, and lack of culturally competent providers.",
          narration: "In this lesson: LGBTQ+ Inclusive Care. LGBTQ+ patients may face unique barriers to healthcare including past experiences of discrimination, fear of judgment, reluctance to disclose relevant health information, and lack of culturally competent providers. Creating an inclusive, affirming environment is both a patient rights requirement and a clinical quality imperative.",
          estDurationSec: 45
        },
        {
          id: "GAO-012-L5-C1",
          type: "content",
          title: "LGBTQ+ Inclusive Care",
          body: "LGBTQ+ patients may face unique barriers to healthcare including past experiences of discrimination, fear of judgment, reluctance to disclose relevant health information, and lack of culturally competent providers.",
          narration: "LGBTQ+ patients may face unique barriers to healthcare including past experiences of discrimination, fear of judgment, reluctance to disclose relevant health information, and lack of culturally competent providers. Creating an inclusive, affirming environment is both a patient rights requirement and a clinical quality imperative. Use the name and pronouns the patient identifies with, regardless of what appears in legal documents. Ask respectfully: What name would you like me to use? What pronouns do you prefer? Document the patient's preferred name and pronouns and ensure all team members use them consistently. Do not make assumptions about family structure. The patient's partner, spouse, or chosen family may not fit traditional family definitions. Treat designated visitors, decision-makers, and support persons with the same respect regardless of their relationship to the patient. Same-sex partners may have experienced healthcare settings where their relationship was not recognized or respected. Affirming their role as a primary caregiver,",
          estDurationSec: 64
        },
        {
          id: "GAO-012-L5-C2",
          type: "content",
          title: "LGBTQ+ Inclusive Care (part 2)",
          body: "emergency contact, or healthcare decision-maker builds trust and improves the therapeutic relationship. Be aware that some LGBTQ+ patients, particularly older adults, may have experienced historical trauma from healthcare systems, including forced institutionalization, conversion therapy, or denial of care.",
          narration: "emergency contact, or healthcare decision-maker builds trust and improves the therapeutic relationship. Be aware that some LGBTQ+ patients, particularly older adults, may have experienced historical trauma from healthcare systems, including forced institutionalization, conversion therapy, or denial of care. Approach these patients with particular sensitivity and allow them to set the pace for disclosure. Never express personal judgment about a patient's identity or relationships. If you have personal beliefs that conflict with providing affirming care, discuss this with your supervisor. Care Indeed's commitment to non-discrimination means all patients receive respectful, equitable care regardless of sexual orientation or gender identity. ---",
          estDurationSec: 42
        },
        {
          id: "GAO-012-L5-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"LGBTQ+ Inclusive Care\"?",
          narration: "What is the key takeaway from \"LGBTQ+ Inclusive Care\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-012-L5-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"LGBTQ+ Inclusive Care\"?",
            narration: "What is the key takeaway from \"LGBTQ+ Inclusive Care\"?",
            options: [
              {
                id: "a",
                label: "LGBTQ+ patients may face unique barriers to healthcare including past experiences of discrimination, fear of judgment, reluctance to disclose relevant health information, and lack…",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "LGBTQ+ patients may face unique barriers to healthcare including past experiences of discrimination, fear of judgment, reluctance to disclose relevant health information, and lack of culturally competent providers."
          }
        }
      ]
    },
    {
      id: "GAO-012-L6",
      order: 6,
      title: "Implicit Bias",
      objectives: [
        "Apply key requirements from Implicit Bias",
        "Identify correct field actions related to Implicit Bias"
      ],
      cards: [
        {
          id: "GAO-012-L6-S",
          type: "summary",
          title: "Implicit Bias",
          body: "Implicit bias refers to unconscious attitudes or stereotypes that affect our understanding, actions, and decisions. Everyone has implicit biases. The goal is not to eliminate bias, which may not be possible, but to recognize it and prevent it from affecting clinical care and patient interactions.",
          narration: "In this lesson: Implicit Bias. Implicit bias refers to unconscious attitudes or stereotypes that affect our understanding, actions, and decisions. Everyone has implicit biases. The goal is not to eliminate bias, which may not be possible, but to recognize it and prevent it from affecting clinical care and patient interactions.",
          estDurationSec: 45
        },
        {
          id: "GAO-012-L6-C1",
          type: "content",
          title: "Implicit Bias",
          body: "Implicit bias refers to unconscious attitudes or stereotypes that affect our understanding, actions, and decisions. Everyone has implicit biases. The goal is not to eliminate bias, which may not be possible, but to recognize it and prevent it from affecting clinical care and patient interactions.",
          narration: "Implicit bias refers to unconscious attitudes or stereotypes that affect our understanding, actions, and decisions. Everyone has implicit biases. The goal is not to eliminate bias, which may not be possible, but to recognize it and prevent it from affecting clinical care and patient interactions. In healthcare, implicit bias can lead to disparities in pain management, where studies show certain racial groups receive less pain medication; differences in the quality and duration of clinical interactions; assumptions about patient intelligence, compliance, or socioeconomic status based on appearance; and unequal application of clinical protocols based on patient characteristics. Strategies for managing implicit bias include perspective-taking, which means actively imagining the patient's experience from their point of view. Individuation means focusing on the specific individual rather than their group membership. Counter-stereotypic imaging means consciously calling to mind examples that contradict stereotypes. And structured clinical decision-making means using standardized assessment tools and protocols that",
          estDurationSec: 64
        },
        {
          id: "GAO-012-L6-C2",
          type: "content",
          title: "Implicit Bias (part 2)",
          body: "reduce the influence of subjective judgment. If you catch yourself making an assumption about a patient based on their appearance, language, or background, pause. Ask yourself whether you would make the same clinical decision for a patient who looked or sounded different. If the answer is no, adjust your approach. ---",
          narration: "reduce the influence of subjective judgment. If you catch yourself making an assumption about a patient based on their appearance, language, or background, pause. Ask yourself whether you would make the same clinical decision for a patient who looked or sounded different. If the answer is no, adjust your approach. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-012-L6-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Implicit Bias\"?",
          narration: "What is the key takeaway from \"Implicit Bias\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-012-L6-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Implicit Bias\"?",
            narration: "What is the key takeaway from \"Implicit Bias\"?",
            options: [
              {
                id: "a",
                label: "Implicit bias refers to unconscious attitudes or stereotypes that affect our understanding, actions, and decisions. Everyone has implicit biases.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Implicit bias refers to unconscious attitudes or stereotypes that affect our understanding, actions, and decisions. Everyone has implicit biases."
          }
        }
      ]
    },
    {
      id: "GAO-012-L7",
      order: 7,
      title: "Module Summary",
      objectives: [
        "Apply key requirements from Module Summary",
        "Identify correct field actions related to Module Summary"
      ],
      cards: [
        {
          id: "GAO-012-L7-S",
          type: "summary",
          title: "Module Summary",
          body: "Cultural competency is a clinical skill that directly affects patient outcomes, satisfaction, and safety. In home health, where you enter the patient's most personal space, cultural sensitivity is especially critical. Practice cultural humility rather than assuming cultural expertise.",
          narration: "In this lesson: Module Summary. Cultural competency is a clinical skill that directly affects patient outcomes, satisfaction, and safety. In home health, where you enter the patient's most personal space, cultural sensitivity is especially critical. Practice cultural humility rather than assuming cultural expertise. Approach each patient as the expert on their own experience.",
          estDurationSec: 45
        },
        {
          id: "GAO-012-L7-C1",
          type: "content",
          title: "Module Summary",
          body: "Cultural competency is a clinical skill that directly affects patient outcomes, satisfaction, and safety. In home health, where you enter the patient's most personal space, cultural sensitivity is especially critical. Practice cultural humility rather than assuming cultural expertise.",
          narration: "Cultural competency is a clinical skill that directly affects patient outcomes, satisfaction, and safety. In home health, where you enter the patient's most personal space, cultural sensitivity is especially critical. Practice cultural humility rather than assuming cultural expertise. Approach each patient as the expert on their own experience. Ask about health beliefs, dietary practices, spiritual needs, and cultural preferences respectfully and without judgment. Use qualified interpreter services for patients with limited English proficiency. Do not rely on family members to interpret clinical information. Speak to the patient, use short sentences, and verify understanding through teach-back. Respect religious and spiritual practices. Accommodate prayer times, dietary requirements, modesty preferences, and gender preferences for caregivers when possible. Never impose your own beliefs. Provide LGBTQ+ affirming care. Use preferred names and pronouns. Respect chosen family. Acknowledge potential historical trauma from healthcare systems. Manage implicit bias by using structured clinical tools, perspective-taking, and self-awareness. Recognize",
          estDurationSec: 64
        },
        {
          id: "GAO-012-L7-C2",
          type: "content",
          title: "Module Summary (part 2)",
          body: "that bias exists and actively work to prevent it from affecting care. Document cultural preferences, language needs, interpreter use, and caregiver education in every applicable visit note. This documentation demonstrates compliance with patient rights requirements and cultural competency standards.",
          narration: "that bias exists and actively work to prevent it from affecting care. Document cultural preferences, language needs, interpreter use, and caregiver education in every applicable visit note. This documentation demonstrates compliance with patient rights requirements and cultural competency standards. Proceed to the final exam. Ten questions, eighty percent to pass.",
          estDurationSec: 35
        },
        {
          id: "GAO-012-L7-CH",
          type: "challenge",
          title: "Scenario Challenge 1 Scenario: A patient's family insists…",
          body: "Scenario Challenge 1 Scenario: A patient's family insists on using traditional herbal remedies alongside prescribed medications. The patient drinks a specific herbal tea three times daily that you are not familiar with.",
          narration: "Scenario Challenge 1 Scenario: A patient's family insists on using traditional herbal remedies alongside prescribed medications. The patient drinks a specific herbal tea three times daily that you are not familiar with. Expected Response: Do not dismiss or criticize the practice.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-012-L7-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 1 Scenario: A patient's family insists on using traditional herbal remedies alongside prescribed medications. The patient drinks a specific herbal tea three times daily that you are not familiar with.",
            narration: "Scenario Challenge 1 Scenario: A patient's family insists on using traditional herbal remedies alongside prescribed medications. The patient drinks a specific herbal tea three times daily that you are not familiar with.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-012-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Cultural Competency & Sensitivity. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Cultural humility means",
        narration: "Cultural humility means",
        options: [
          {
            id: "a",
            label: "Memorizing facts about cultures",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Recognizing your perspective is limited and approaching each patient with curiosity and respect",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Avoiding discussing culture",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Treating all patients identically",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q1 from AAA Record v2.0 for GAO-012."
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "A patient uses herbal remedies alongside medications. You should",
        narration: "A patient uses herbal remedies alongside medications. You should",
        options: [
          {
            id: "a",
            label: "Tell them to stop immediately",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Ask about the herbs, document, and report to the physician to assess interactions",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Ignore it",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Confiscate the herbs",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q2 from AAA Record v2.0 for GAO-012."
      },
      {
        id: "q3",
        format: "scenario_decision",
        prompt: "For patients with limited English, you should",
        narration: "For patients with limited English, you should",
        options: [
          {
            id: "a",
            label: "Speak louder",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Use the patient's child to interpret",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Use qualified interpreter services",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Simplify care to avoid communication",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q3 from AAA Record v2.0 for GAO-012."
      },
      {
        id: "q4",
        format: "scenario_decision",
        prompt: "A patient requests a same-gender caregiver for religious reasons. This is",
        narration: "A patient requests a same-gender caregiver for religious reasons. This is",
        options: [
          {
            id: "a",
            label: "Unreasonable",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "A legitimate preference the agency should accommodate when possible",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Discrimination",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only applicable in hospitals",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q4 from AAA Record v2.0 for GAO-012."
      },
      {
        id: "q5",
        format: "scenario_decision",
        prompt: "Implicit bias in healthcare can lead to",
        narration: "Implicit bias in healthcare can lead to",
        options: [
          {
            id: "a",
            label: "Better outcomes",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Disparities in pain management, communication quality, and clinical decisions",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Improved efficiency",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "No measurable effect",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q5 from AAA Record v2.0 for GAO-012."
      },
      {
        id: "q6",
        format: "scenario_decision",
        prompt: "When working with an interpreter, speak to",
        narration: "When working with an interpreter, speak to",
        options: [
          {
            id: "a",
            label: "The interpreter",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "The family",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "The patient directly",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Your supervisor",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q6 from AAA Record v2.0 for GAO-012."
      },
      {
        id: "q7",
        format: "scenario_decision",
        prompt: "LGBTQ+ affirming care includes",
        narration: "LGBTQ+ affirming care includes",
        options: [
          {
            id: "a",
            label: "Ignoring the patient's identity",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Using preferred names/pronouns and respecting chosen family",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Asking intrusive personal questions",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only treating physical conditions",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q7 from AAA Record v2.0 for GAO-012."
      },
      {
        id: "q8",
        format: "scenario_decision",
        prompt: "A patient's pain expression seems minimal despite a condition typically associated with significant pain. This may reflect",
        narration: "A patient's pain expression seems minimal despite a condition typically associated with significant pain. This may reflect",
        options: [
          {
            id: "a",
            label: "That the patient is faking",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Cultural norms about pain expression and stoicism",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "That the condition is resolved",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "That the patient doesn't feel pain",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q8 from AAA Record v2.0 for GAO-012."
      },
      {
        id: "q9",
        format: "scenario_decision",
        prompt: "Title VI of the Civil Rights Act requires: A) Meaningful language access for patients with limited English proficiency ✓",
        narration: "Title VI of the Civil Rights Act requires: A) Meaningful language access for patients with limited English proficiency ✓",
        options: [
          {
            id: "a",
            label: "Free housing",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Employment protections",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Cultural training for all Americans",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q9 from AAA Record v2.0 for GAO-012."
      },
      {
        id: "q10",
        format: "scenario_decision",
        prompt: "To manage implicit bias, you should",
        narration: "To manage implicit bias, you should",
        options: [
          {
            id: "a",
            label: "Deny having any bias",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Avoid diverse patients",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Use structured clinical tools and consciously challenge assumptions",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Let others make clinical decisions --- ## QA VALIDATION SUMMARY",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q10 from AAA Record v2.0 for GAO-012."
      }
    ]
  }
},
  {
  moduleId: "GAO-013",
  policyRefs: [],
  cmsRefs: [],
  estimatedDurationMin: 25,
  durationSource: "DEFAULT",
  splash: {
    title: "Documentation & Reporting",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Documentation in home health care is not paperwork. It is a legal medical record, a clinical communication tool, a billing foundation, and survey evidence — all in one.",
    narration: "Welcome to GAO-013, Documentation & Reporting. Documentation in home health care is not paperwork. It is a legal medical record, a clinical communication tool, a billing foundation, and survey evidence — all in one."
  },
  navigation: {
    title: "How This Training Works",
    body: "You will move through one card at a time. Use Next and Previous to navigate. Your progress, time on each card, and challenge responses are tracked for compliance. Skipping cards is not allowed.",
    bullets: [
      "Single-card view",
      "Audio narration on every card",
      "Challenges required to advance",
      "80% to pass final test"
    ],
    narration: "One card at a time. Audio narration on every card. Challenges must be completed before you continue. The final test requires eighty percent to pass."
  },
  lessons: [
    {
      id: "GAO-013-L1",
      order: 1,
      title: "Why Documentation Matters",
      objectives: [
        "Apply key requirements from Why Documentation Matters",
        "Identify correct field actions related to Why Documentation Matters"
      ],
      cards: [
        {
          id: "GAO-013-L1-S",
          type: "summary",
          title: "Why Documentation Matters",
          body: "Documentation in home health care is not paperwork. It is a legal medical record, a clinical communication tool, a billing foundation, and survey evidence — all in one.",
          narration: "In this lesson: Why Documentation Matters. Documentation in home health care is not paperwork. It is a legal medical record, a clinical communication tool, a billing foundation, and survey evidence — all in one. Under 42 CFR Section 484.110, CMS requires that home health agencies maintain clinical records that are accurate, complete, and timely for every patient.",
          estDurationSec: 45
        },
        {
          id: "GAO-013-L1-C1",
          type: "content",
          title: "Why Documentation Matters",
          body: "Documentation in home health care is not paperwork. It is a legal medical record, a clinical communication tool, a billing foundation, and survey evidence — all in one.",
          narration: "Documentation in home health care is not paperwork. It is a legal medical record, a clinical communication tool, a billing foundation, and survey evidence — all in one. Under 42 CFR Section 484.110, CMS requires that home health agencies maintain clinical records that are accurate, complete, and timely for every patient. The phrase if it is not documented, it did not happen is the operational reality of home health. When a CMS surveyor reviews a patient's record, they evaluate care based entirely on what is written. If you performed an exemplary wound assessment but did not document it, the surveyor will find a deficiency — no documentation of wound assessment. If you educated the patient on medication management but did not document the education and the patient's response, there is no evidence that education occurred. Documentation serves five critical functions. First, it communicates clinical information to every member of the",
          estDurationSec: 64
        },
        {
          id: "GAO-013-L1-C2",
          type: "content",
          title: "Why Documentation Matters (part 2)",
          body: "interdisciplinary team. Your visit note is how the next clinician learns what happened during your visit, what changes you observed, and what actions you took. Second, it provides the legal record of care delivered. In a malpractice claim, your documentation is the primary evidence of what you did and why.",
          narration: "interdisciplinary team. Your visit note is how the next clinician learns what happened during your visit, what changes you observed, and what actions you took. Second, it provides the legal record of care delivered. In a malpractice claim, your documentation is the primary evidence of what you did and why. Third, it supports billing by demonstrating that skilled services were provided as ordered. Fourth, it satisfies CMS survey requirements by providing evidence that care meets regulatory standards. Fifth, it contributes to quality measurement and OASIS accuracy, which affects the agency's quality scores and payment. Poor documentation creates cascading problems: clinical errors from inadequate handoff information, denied billing claims from insufficient documentation of skilled need, survey deficiencies from missing required elements, legal liability from inadequate records, and quality reporting inaccuracies from poorly documented assessments.",
          estDurationSec: 57
        },
        {
          id: "GAO-013-L1-CH",
          type: "challenge",
          title: "Knowledge Check 1 Q: A CMS surveyor asks to see…",
          body: "Knowledge Check 1 Q: A CMS surveyor asks to see documentation of patient education during skilled nursing visits. Your notes say \"patient education provided.\" Is this sufficient? A: No.",
          narration: "Knowledge Check 1 Q: A CMS surveyor asks to see documentation of patient education during skilled nursing visits. Your notes say \"patient education provided.\" Is this sufficient? A: No.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-013-L1-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 1 Q: A CMS surveyor asks to see documentation of patient education during skilled nursing visits. Your notes say \"patient education provided.\" Is this sufficient? A: No.",
            narration: "Knowledge Check 1 Q: A CMS surveyor asks to see documentation of patient education during skilled nursing visits. Your notes say \"patient education provided.\" Is this sufficient? A: No.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    },
    {
      id: "GAO-013-L2",
      order: 2,
      title: "Documentation Standards",
      objectives: [
        "Apply key requirements from Documentation Standards",
        "Identify correct field actions related to Documentation Standards"
      ],
      cards: [
        {
          id: "GAO-013-L2-S",
          type: "summary",
          title: "Documentation Standards",
          body: "Care Indeed's documentation standards require that all clinical records meet specific criteria for content, format, and timeliness. These standards are based on CMS requirements, ACHC accreditation standards, and professional practice guidelines.",
          narration: "In this lesson: Documentation Standards. Care Indeed's documentation standards require that all clinical records meet specific criteria for content, format, and timeliness. These standards are based on CMS requirements, ACHC accreditation standards, and professional practice guidelines.",
          estDurationSec: 45
        },
        {
          id: "GAO-013-L2-C1",
          type: "content",
          title: "Documentation Standards",
          body: "Care Indeed's documentation standards require that all clinical records meet specific criteria for content, format, and timeliness. These standards are based on CMS requirements, ACHC accreditation standards, and professional practice guidelines.",
          narration: "Care Indeed's documentation standards require that all clinical records meet specific criteria for content, format, and timeliness. These standards are based on CMS requirements, ACHC accreditation standards, and professional practice guidelines. Content standards require that every visit note includes the date and time of the visit, the patient's current status and any changes since the last visit, vital signs and clinical assessments performed, interventions provided and the patient's response, patient and caregiver education with teach-back outcomes, communication with physicians and other team members, changes to the plan of care, and the clinician's plan for the next visit. Objectivity is paramount. Document what you observed, measured, and did — not what you assumed, interpreted without evidence, or believed. Use clinical language: \"patient's right lower leg exhibits 3 cm x 2 cm area of erythema with warmth to touch\" rather than \"patient's leg looks red and might be infected.\" The first is",
          estDurationSec: 64
        },
        {
          id: "GAO-013-L2-C2",
          type: "content",
          title: "Documentation Standards (part 2)",
          body: "objective documentation. The second is subjective interpretation without supporting evidence. Timeliness means completing documentation at the point of care or as close to it as possible. Care Indeed's standard is to complete visit notes before leaving the patient's home.",
          narration: "objective documentation. The second is subjective interpretation without supporting evidence. Timeliness means completing documentation at the point of care or as close to it as possible. Care Indeed's standard is to complete visit notes before leaving the patient's home. Documentation completed hours or days later relies on memory, is more likely to contain errors, and is viewed skeptically by surveyors and legal reviewers. If point-of-care documentation is not possible, complete the note the same day. Never pre-chart or copy-paste from previous visits. Each visit note must reflect that specific visit. Pre-charting — writing the note before the visit occurs — is documentation fraud. Copy-pasting from previous notes creates inaccurate records and suggests the clinician is not actually assessing the patient at each visit. ---",
          estDurationSec: 53
        },
        {
          id: "GAO-013-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Documentation Standards\"?",
          narration: "What is the key takeaway from \"Documentation Standards\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-013-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Documentation Standards\"?",
            narration: "What is the key takeaway from \"Documentation Standards\"?",
            options: [
              {
                id: "a",
                label: "Care Indeed's documentation standards require that all clinical records meet specific criteria for content, format, and timeliness.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Care Indeed's documentation standards require that all clinical records meet specific criteria for content, format, and timeliness."
          }
        }
      ]
    },
    {
      id: "GAO-013-L3",
      order: 3,
      title: "SOAP & DAR Formats",
      objectives: [
        "Apply key requirements from SOAP & DAR Formats",
        "Identify correct field actions related to SOAP & DAR Formats"
      ],
      cards: [
        {
          id: "GAO-013-L3-S",
          type: "summary",
          title: "SOAP & DAR Formats",
          body: "Care Indeed uses structured documentation formats to ensure consistency and completeness. The two primary formats are SOAP and DAR. SOAP stands for Subjective, Objective, Assessment, and Plan.",
          narration: "In this lesson: SOAP & DAR Formats. Care Indeed uses structured documentation formats to ensure consistency and completeness. The two primary formats are SOAP and DAR. SOAP stands for Subjective, Objective, Assessment, and Plan. Subjective documents what the patient reports: symptoms, concerns, pain levels, and functional status in their own words.",
          estDurationSec: 45
        },
        {
          id: "GAO-013-L3-C1",
          type: "content",
          title: "SOAP & DAR Formats",
          body: "Care Indeed uses structured documentation formats to ensure consistency and completeness. The two primary formats are SOAP and DAR. SOAP stands for Subjective, Objective, Assessment, and Plan. Subjective documents what the patient reports: symptoms, concerns, pain levels, and functional status in their own words.",
          narration: "Care Indeed uses structured documentation formats to ensure consistency and completeness. The two primary formats are SOAP and DAR. SOAP stands for Subjective, Objective, Assessment, and Plan. Subjective documents what the patient reports: symptoms, concerns, pain levels, and functional status in their own words. Objective documents what you measured and observed: vital signs, wound measurements, physical exam findings, and functional assessments. Assessment is your clinical interpretation of the subjective and objective data: what is improving, what is worsening, what requires attention. Plan documents what you will do next: scheduled follow-up, physician notifications, care plan modifications, and patient goals. DAR stands for Data, Action, and Response. Data documents the relevant clinical information. Action documents the interventions you performed. Response documents the patient's reaction to the interventions. DAR is particularly useful for documenting specific interventions or events within a visit. Regardless of format, every note must tell a complete clinical story. A",
          estDurationSec: 64
        },
        {
          id: "GAO-013-L3-C2",
          type: "content",
          title: "SOAP & DAR Formats (part 2)",
          body: "reader who was not present should be able to understand: What was the patient's condition? What did the clinician do? What was the outcome? What happens next? Avoid documentation pitfalls: do not use vague terms like \"tolerated well\" without defining what was tolerated and what \"well\" means.",
          narration: "reader who was not present should be able to understand: What was the patient's condition? What did the clinician do? What was the outcome? What happens next? Avoid documentation pitfalls: do not use vague terms like \"tolerated well\" without defining what was tolerated and what \"well\" means. Do not leave blanks in required fields. Do not use unauthorized abbreviations. Do not document by exception only — document both normal and abnormal findings. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-013-L3-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"SOAP & DAR Formats\"?",
          narration: "What is the key takeaway from \"SOAP & DAR Formats\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-013-L3-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"SOAP & DAR Formats\"?",
            narration: "What is the key takeaway from \"SOAP & DAR Formats\"?",
            options: [
              {
                id: "a",
                label: "Care Indeed uses structured documentation formats to ensure consistency and completeness. The two primary formats are SOAP and DAR.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Care Indeed uses structured documentation formats to ensure consistency and completeness. The two primary formats are SOAP and DAR. SOAP stands for Subjective, Objective, Assessment, and Plan."
          }
        }
      ]
    },
    {
      id: "GAO-013-L4",
      order: 4,
      title: "Incident Reporting",
      objectives: [
        "Apply key requirements from Incident Reporting",
        "Identify correct field actions related to Incident Reporting"
      ],
      cards: [
        {
          id: "GAO-013-L4-S",
          type: "summary",
          title: "Incident Reporting",
          body: "Incident reporting is a separate documentation process from clinical visit documentation. An incident is any event that causes or could cause harm to a patient, visitor, or staff member.",
          narration: "In this lesson: Incident Reporting. Incident reporting is a separate documentation process from clinical visit documentation. An incident is any event that causes or could cause harm to a patient, visitor, or staff member. At Care Indeed, incidents must be reported through the agency's incident reporting system in addition to being documented in the clinical record.",
          estDurationSec: 45
        },
        {
          id: "GAO-013-L4-C1",
          type: "content",
          title: "Incident Reporting",
          body: "Incident reporting is a separate documentation process from clinical visit documentation. An incident is any event that causes or could cause harm to a patient, visitor, or staff member.",
          narration: "Incident reporting is a separate documentation process from clinical visit documentation. An incident is any event that causes or could cause harm to a patient, visitor, or staff member. At Care Indeed, incidents must be reported through the agency's incident reporting system in addition to being documented in the clinical record. Reportable incidents include patient falls during visits or between visits when reported to you, medication errors or near-misses, adverse reactions to treatments, injuries to patients, staff, or visitors, equipment failures that affect patient safety, patient complaints about care quality, and any event that results in an unplanned hospitalization, emergency department visit, or change in condition. The incident report is an internal quality document — it is not part of the clinical record and is not shared with the patient. Its purpose is to support the agency's quality improvement and risk management processes. The clinical record should contain the factual",
          estDurationSec: 64
        },
        {
          id: "GAO-013-L4-C2",
          type: "content",
          title: "Incident Reporting (part 2)",
          body: "documentation of what happened, but the incident report captures additional analysis including contributing factors, immediate actions taken, and recommendations for prevention. When documenting an incident in the clinical record, document facts only.",
          narration: "documentation of what happened, but the incident report captures additional analysis including contributing factors, immediate actions taken, and recommendations for prevention. When documenting an incident in the clinical record, document facts only. Do not include blame, conclusions about fault, or references to the incident report itself. For example, if a patient falls during your visit, document: \"Patient was ambulating from bedroom to bathroom with rolling walker when right foot caught on area rug edge. Patient fell to left side. Assessed immediately: patient alert, denies head injury, denies pain. No visible injury. Vital signs stable. Physician notified at [time]. Orders received: [specific orders]. Patient instructed to remain seated until further assessment.\" Timely reporting matters. Report incidents within 24 hours through the agency's system. For incidents involving serious harm, report immediately to your supervisor and the DON.",
          estDurationSec: 58
        },
        {
          id: "GAO-013-L4-CH",
          type: "challenge",
          title: "Scenario Challenge 1 Scenario: During a visit, the patient…",
          body: "Scenario Challenge 1 Scenario: During a visit, the patient reports falling yesterday while walking to the mailbox. No one was home and the patient managed to get back up without assistance.",
          narration: "Scenario Challenge 1 Scenario: During a visit, the patient reports falling yesterday while walking to the mailbox. No one was home and the patient managed to get back up without assistance. The patient has a small bruise on the left hip but denies significant pain.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-013-L4-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 1 Scenario: During a visit, the patient reports falling yesterday while walking to the mailbox. No one was home and the patient managed to get back up without assistance. The patient has a small bruise on the left hip but denies significant pain.",
            narration: "Scenario Challenge 1 Scenario: During a visit, the patient reports falling yesterday while walking to the mailbox. No one was home and the patient managed to get back up without assistance. The patient has a small bruise on the left hip but denies significant pain.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    },
    {
      id: "GAO-013-L5",
      order: 5,
      title: "EHR Best Practices",
      objectives: [
        "Apply key requirements from EHR Best Practices",
        "Identify correct field actions related to EHR Best Practices"
      ],
      cards: [
        {
          id: "GAO-013-L5-S",
          type: "summary",
          title: "EHR Best Practices",
          body: "Care Indeed uses an Electronic Health Record system for clinical documentation. EHR documentation carries the same standards as paper documentation but introduces additional considerations for data entry, system navigation, and electronic signature requirements.",
          narration: "In this lesson: EHR Best Practices. Care Indeed uses an Electronic Health Record system for clinical documentation. EHR documentation carries the same standards as paper documentation but introduces additional considerations for data entry, system navigation, and electronic signature requirements. Authenticate every entry with your electronic signature.",
          estDurationSec: 45
        },
        {
          id: "GAO-013-L5-C1",
          type: "content",
          title: "EHR Best Practices",
          body: "Care Indeed uses an Electronic Health Record system for clinical documentation. EHR documentation carries the same standards as paper documentation but introduces additional considerations for data entry, system navigation, and electronic signature requirements. Authenticate every entry with your electronic signature.",
          narration: "Care Indeed uses an Electronic Health Record system for clinical documentation. EHR documentation carries the same standards as paper documentation but introduces additional considerations for data entry, system navigation, and electronic signature requirements. Authenticate every entry with your electronic signature. Your signature attests that you personally performed the documented care and that the documentation is accurate. Never share your login credentials with anyone. Never document under another clinician's credentials. Never allow someone else to document under your credentials. These actions constitute fraud and are grounds for immediate termination. Use the system's structured fields appropriately. Structured fields like dropdown menus, checkboxes, and assessment scales are designed to capture standardized data that supports quality reporting and care plan generation. When free-text narrative is needed, add it in the appropriate sections — do not bypass structured fields. If you make an error in the EHR, follow the agency's amendment policy. Do not delete,",
          estDurationSec: 64
        },
        {
          id: "GAO-013-L5-C2",
          type: "content",
          title: "EHR Best Practices (part 2)",
          body: "overwrite, or backdate entries. The correct process is to add an addendum or amendment that identifies the error, states the correct information, and includes the date and time of the correction. The original entry must remain visible. This audit trail is a legal requirement and a CMS expectation.",
          narration: "overwrite, or backdate entries. The correct process is to add an addendum or amendment that identifies the error, states the correct information, and includes the date and time of the correction. The original entry must remain visible. This audit trail is a legal requirement and a CMS expectation. Downtime procedures exist for situations when the EHR is unavailable. Know where paper forms are stored, how to complete paper documentation, and how to transfer paper documentation to the EHR when the system is restored. Do not skip documentation because the system is down. ---",
          estDurationSec: 40
        },
        {
          id: "GAO-013-L5-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"EHR Best Practices\"?",
          narration: "What is the key takeaway from \"EHR Best Practices\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-013-L5-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"EHR Best Practices\"?",
            narration: "What is the key takeaway from \"EHR Best Practices\"?",
            options: [
              {
                id: "a",
                label: "Care Indeed uses an Electronic Health Record system for clinical documentation.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Care Indeed uses an Electronic Health Record system for clinical documentation. EHR documentation carries the same standards as paper documentation but introduces additional considerations for data entry, system…"
          }
        }
      ]
    },
    {
      id: "GAO-013-L6",
      order: 6,
      title: "Survey Defensibility & Summary (470 + 460 words) #",
      objectives: [
        "Apply key requirements from Survey Defensibility & Summary (470 + 460 words) #",
        "Identify correct field actions related to Survey Defensibility & Summary (470 + 460 words) #"
      ],
      cards: [
        {
          id: "GAO-013-L6-S",
          type: "summary",
          title: "Survey Defensibility & Summary (470 + 460 words) #",
          body: "Survey Defensibility & Summary (470 + 460 words) #",
          narration: "In this lesson: Survey Defensibility & Summary (470 + 460 words) #. Survey Defensibility & Summary (470 + 460 words) #",
          estDurationSec: 45
        },
        {
          id: "GAO-013-L6-C1",
          type: "content",
          title: "Survey Defensibility & Summary (470 + 460 words) #",
          body: "Survey Defensibility & Summary (470 + 460 words) #",
          narration: "Survey Defensibility & Summary (470 + 460 words) #",
          estDurationSec: 35
        },
        {
          id: "GAO-013-L6-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Survey Defensibility & Summary (470 + 460 words) #\"?",
          narration: "What is the key takeaway from \"Survey Defensibility & Summary (470 + 460 words) #\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-013-L6-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Survey Defensibility & Summary (470 + 460 words) #\"?",
            narration: "What is the key takeaway from \"Survey Defensibility & Summary (470 + 460 words) #\"?",
            options: [
              {
                id: "a",
                label: "Survey Defensibility & Summary (470 + 460 words) #",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Survey Defensibility & Summary (470 + 460 words) #"
          }
        }
      ]
    },
    {
      id: "GAO-013-L7",
      order: 7,
      title: "Survey-Defensible Documentation",
      objectives: [
        "Apply key requirements from Survey-Defensible Documentation",
        "Identify correct field actions related to Survey-Defensible Documentation"
      ],
      cards: [
        {
          id: "GAO-013-L7-S",
          type: "summary",
          title: "Survey-Defensible Documentation",
          body: "Survey-defensible documentation means your records can withstand scrutiny from CMS surveyors, ACHC accreditation reviewers, insurance auditors, and legal professionals. This requires that documentation is contemporaneous, meaning created at or near the time of care.",
          narration: "In this lesson: Survey-Defensible Documentation. Survey-defensible documentation means your records can withstand scrutiny from CMS surveyors, ACHC accreditation reviewers, insurance auditors, and legal professionals. This requires that documentation is contemporaneous, meaning created at or near the time of care. Documentation is specific, meaning it uses measurable, observable terms rather than vague language.",
          estDurationSec: 45
        },
        {
          id: "GAO-013-L7-C1",
          type: "content",
          title: "Survey-Defensible Documentation",
          body: "Survey-defensible documentation means your records can withstand scrutiny from CMS surveyors, ACHC accreditation reviewers, insurance auditors, and legal professionals. This requires that documentation is contemporaneous, meaning created at or near the time of care.",
          narration: "Survey-defensible documentation means your records can withstand scrutiny from CMS surveyors, ACHC accreditation reviewers, insurance auditors, and legal professionals. This requires that documentation is contemporaneous, meaning created at or near the time of care. Documentation is specific, meaning it uses measurable, observable terms rather than vague language. Documentation is complete, meaning all required elements are present for every visit. Documentation is consistent, meaning it does not contain contradictions between the narrative, vital signs, assessments, and care plan. And documentation is actionable, meaning abnormal findings are followed by documented actions. Common documentation deficiencies found during surveys include missing skilled intervention documentation, which raises questions about whether the visit justified skilled care billing. Missing baseline comparisons, which prevent assessment of patient progress. Missing physician notification for abnormal findings, which suggests the clinician did not escalate concerns. Missing patient education documentation, which fails to demonstrate the teaching component of skilled care. And inconsistencies",
          estDurationSec: 64
        },
        {
          id: "GAO-013-L7-C2",
          type: "content",
          title: "Survey-Defensible Documentation (part 2)",
          body: "between the visit note and the plan of care, which suggest the clinician is not following or updating the physician's orders.",
          narration: "between the visit note and the plan of care, which suggest the clinician is not following or updating the physician's orders.",
          estDurationSec: 35
        },
        {
          id: "GAO-013-L7-CH",
          type: "challenge",
          title: "Knowledge Check 2 Q: Your visit note documents stable vital…",
          body: "Knowledge Check 2 Q: Your visit note documents stable vital signs, but the OASIS assessment coded on the same date shows significant functional decline. Is this a problem? A: Yes.",
          narration: "Knowledge Check 2 Q: Your visit note documents stable vital signs, but the OASIS assessment coded on the same date shows significant functional decline. Is this a problem? A: Yes. Inconsistencies between documentation sources raise red flags during surveys and audits.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-013-L7-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 2 Q: Your visit note documents stable vital signs, but the OASIS assessment coded on the same date shows significant functional decline. Is this a problem? A: Yes. Inconsistencies between documentation sources raise red flags during surveys and audits.",
            narration: "Knowledge Check 2 Q: Your visit note documents stable vital signs, but the OASIS assessment coded on the same date shows significant functional decline. Is this a problem? A: Yes. Inconsistencies between documentation sources raise red flags during surveys and audits.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    },
    {
      id: "GAO-013-L8",
      order: 8,
      title: "Module Summary",
      objectives: [
        "Apply key requirements from Module Summary",
        "Identify correct field actions related to Module Summary"
      ],
      cards: [
        {
          id: "GAO-013-L8-S",
          type: "summary",
          title: "Module Summary",
          body: "Documentation is your clinical voice, your legal shield, your billing proof, and your survey evidence. Every visit note you write serves all four purposes simultaneously. Follow the agency's documentation standards for content, format, and timeliness. Use SOAP or DAR structure.",
          narration: "In this lesson: Module Summary. Documentation is your clinical voice, your legal shield, your billing proof, and your survey evidence. Every visit note you write serves all four purposes simultaneously. Follow the agency's documentation standards for content, format, and timeliness. Use SOAP or DAR structure. Be objective, specific, and complete. Document at point of care whenever possible. Never pre-chart, copy-paste, or backdate.",
          estDurationSec: 45
        },
        {
          id: "GAO-013-L8-C1",
          type: "content",
          title: "Module Summary",
          body: "Documentation is your clinical voice, your legal shield, your billing proof, and your survey evidence. Every visit note you write serves all four purposes simultaneously. Follow the agency's documentation standards for content, format, and timeliness. Use SOAP or DAR structure. Be objective, specific, and complete.",
          narration: "Documentation is your clinical voice, your legal shield, your billing proof, and your survey evidence. Every visit note you write serves all four purposes simultaneously. Follow the agency's documentation standards for content, format, and timeliness. Use SOAP or DAR structure. Be objective, specific, and complete. Document at point of care whenever possible. Never pre-chart, copy-paste, or backdate. Incident reporting is separate from clinical documentation. Report incidents within 24 hours. Document facts in the clinical record without blame or conclusions. Use the EHR as designed. Protect your credentials. Follow the amendment policy for corrections. Know the downtime procedures. Write documentation that is survey-defensible: contemporaneous, specific, complete, consistent, and actionable. A well-documented visit protects you, the patient, and the agency. Proceed to the final exam. Ten questions, eighty percent to pass.",
          estDurationSec: 55
        },
        {
          id: "GAO-013-L8-CH",
          type: "challenge",
          title: "Scenario Challenge 2 Scenario: You realize two hours after…",
          body: "Scenario Challenge 2 Scenario: You realize two hours after leaving a patient's home that you forgot to document the wound measurement. You remember the measurement clearly.",
          narration: "Scenario Challenge 2 Scenario: You realize two hours after leaving a patient's home that you forgot to document the wound measurement. You remember the measurement clearly. What do you do? Expected Response: Add a late entry or addendum to the visit note.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-013-L8-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 2 Scenario: You realize two hours after leaving a patient's home that you forgot to document the wound measurement. You remember the measurement clearly. What do you do? Expected Response: Add a late entry or addendum to the visit note.",
            narration: "Scenario Challenge 2 Scenario: You realize two hours after leaving a patient's home that you forgot to document the wound measurement. You remember the measurement clearly. What do you do? Expected Response: Add a late entry or addendum to the visit note.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-013-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Documentation & Reporting. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Per CMS, if it is not documented",
        narration: "Per CMS, if it is not documented",
        options: [
          {
            id: "a",
            label: "It can be assumed",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "It did not happen",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "It will be inferred",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "It's covered by policy",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q1 from AAA Record v2.0 for GAO-013."
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "SOAP — A stands for",
        narration: "SOAP — A stands for",
        options: [
          {
            id: "a",
            label: "Action",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Assessment",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Adjustment",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Appendix",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q2 from AAA Record v2.0 for GAO-013."
      },
      {
        id: "q3",
        format: "scenario_decision",
        prompt: "Visit notes should be completed",
        narration: "Visit notes should be completed",
        options: [
          {
            id: "a",
            label: "Weekly",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "At point of care or same day",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Within 72 hours",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Before the visit",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q3 from AAA Record v2.0 for GAO-013."
      },
      {
        id: "q4",
        format: "scenario_decision",
        prompt: "Copy-pasting from previous visit notes is",
        narration: "Copy-pasting from previous visit notes is",
        options: [
          {
            id: "a",
            label: "Efficient",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Acceptable",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "A documentation deficiency that creates inaccurate records",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Required",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q4 from AAA Record v2.0 for GAO-013."
      },
      {
        id: "q5",
        format: "scenario_decision",
        prompt: "An incident report is",
        narration: "An incident report is",
        options: [
          {
            id: "a",
            label: "Part of the patient's clinical record",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "An internal quality document separate from the clinical record",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Shared with the patient",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Optional",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q5 from AAA Record v2.0 for GAO-013."
      },
      {
        id: "q6",
        format: "scenario_decision",
        prompt: "You discover an error in an EHR entry. You should",
        narration: "You discover an error in an EHR entry. You should",
        options: [
          {
            id: "a",
            label: "Delete it",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Overwrite it",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Add an amendment with the correction, date, and time",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Ignore it",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q6 from AAA Record v2.0 for GAO-013."
      },
      {
        id: "q7",
        format: "scenario_decision",
        prompt: "\"Patient tolerated well\" without further detail is",
        narration: "\"Patient tolerated well\" without further detail is",
        options: [
          {
            id: "a",
            label: "Sufficient",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Insufficient — lacks specificity about what was tolerated and what 'well' means",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Best practice",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only a minor issue",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q7 from AAA Record v2.0 for GAO-013."
      },
      {
        id: "q8",
        format: "scenario_decision",
        prompt: "Survey-defensible documentation must be",
        narration: "Survey-defensible documentation must be",
        options: [
          {
            id: "a",
            label: "Brief",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Contemporaneous, specific, complete, consistent, and actionable",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Templated",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Unsigned",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q8 from AAA Record v2.0 for GAO-013."
      },
      {
        id: "q9",
        format: "scenario_decision",
        prompt: "Sharing your EHR login credentials is",
        narration: "Sharing your EHR login credentials is",
        options: [
          {
            id: "a",
            label: "Acceptable in emergencies",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Grounds for termination and potential fraud",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Common practice",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only wrong for supervisors",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q9 from AAA Record v2.0 for GAO-013."
      },
      {
        id: "q10",
        format: "scenario_decision",
        prompt: "A patient reports a fall that occurred yesterday. You should",
        narration: "A patient reports a fall that occurred yesterday. You should",
        options: [
          {
            id: "a",
            label: "Document it only",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Ignore it since you weren't there",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Document, assess, notify physician, complete incident report, and address fall prevention",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Call 911 --- ## QA VALIDATION SUMMARY",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q10 from AAA Record v2.0 for GAO-013."
      }
    ]
  }
},
  {
  moduleId: "GAO-014",
  policyRefs: [],
  cmsRefs: [],
  estimatedDurationMin: 20,
  durationSource: "DEFAULT",
  splash: {
    title: "Time Management & Professional Boundaries",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Time management in home health care is fundamentally different from time management in a hospital or clinic. In a facility, patients come to you.",
    narration: "Welcome to GAO-014, Time Management & Professional Boundaries. Time management in home health care is fundamentally different from time management in a hospital or clinic. In a facility, patients come to you."
  },
  navigation: {
    title: "How This Training Works",
    body: "You will move through one card at a time. Use Next and Previous to navigate. Your progress, time on each card, and challenge responses are tracked for compliance. Skipping cards is not allowed.",
    bullets: [
      "Single-card view",
      "Audio narration on every card",
      "Challenges required to advance",
      "80% to pass final test"
    ],
    narration: "One card at a time. Audio narration on every card. Challenges must be completed before you continue. The final test requires eighty percent to pass."
  },
  lessons: [
    {
      id: "GAO-014-L1",
      order: 1,
      title: "Time Management in Home Health",
      objectives: [
        "Apply key requirements from Time Management in Home Health",
        "Identify correct field actions related to Time Management in Home Health"
      ],
      cards: [
        {
          id: "GAO-014-L1-S",
          type: "summary",
          title: "Time Management in Home Health",
          body: "Time management in home health care is fundamentally different from time management in a hospital or clinic. In a facility, patients come to you.",
          narration: "In this lesson: Time Management in Home Health. Time management in home health care is fundamentally different from time management in a hospital or clinic. In a facility, patients come to you. In home health, you go to patients — across a geographic service area, through traffic, into homes with unpredictable conditions, on a schedule that must accommodate clinical needs, travel time, documentation, and communication.",
          estDurationSec: 45
        },
        {
          id: "GAO-014-L1-C1",
          type: "content",
          title: "Time Management in Home Health",
          body: "Time management in home health care is fundamentally different from time management in a hospital or clinic. In a facility, patients come to you.",
          narration: "Time management in home health care is fundamentally different from time management in a hospital or clinic. In a facility, patients come to you. In home health, you go to patients — across a geographic service area, through traffic, into homes with unpredictable conditions, on a schedule that must accommodate clinical needs, travel time, documentation, and communication. Effective time management in home health means planning your day before you leave home, optimizing your route to minimize driving between patients, arriving at scheduled times within the agency's acceptable window, completing all required care activities during each visit, documenting at point of care to avoid after-hours catch-up, communicating with the office about schedule changes or delays, and ending your day with all documentation completed and all critical findings reported. Poor time management in home health creates real patient safety risks. Running behind schedule means rushing through assessments, skipping documentation, cutting patient education",
          estDurationSec: 64
        },
        {
          id: "GAO-014-L1-C2",
          type: "content",
          title: "Time Management in Home Health (part 2)",
          body: "short, or missing visits entirely. Each of these shortcuts affects care quality and creates regulatory risk. Route planning is your first time management tool. Group patients geographically when possible.",
          narration: "short, or missing visits entirely. Each of these shortcuts affects care quality and creates regulatory risk. Route planning is your first time management tool. Group patients geographically when possible. Schedule patients with time-sensitive needs, such as insulin-dependent diabetics who need timed assessments, at appropriate times. Build in buffer time between visits for unexpected situations, phone calls, and documentation. Communicate with the scheduling team if your assigned route is not feasible within the time available. Task prioritization during visits requires clinical judgment. Perform the highest-priority assessments and interventions first. If you are running short on time, do not skip the critical elements: vital signs, wound assessment, medication reconciliation, and patient education. Instead, communicate with your supervisor about whether the visit duration needs adjustment or whether a follow-up visit is needed.",
          estDurationSec: 55
        },
        {
          id: "GAO-014-L1-CH",
          type: "challenge",
          title: "Knowledge Check 1 Q: You are running 30 minutes behind…",
          body: "Knowledge Check 1 Q: You are running 30 minutes behind schedule and have 3 more patients to see. What is the correct approach? A: Notify the office and affected patients of the delay.",
          narration: "Knowledge Check 1 Q: You are running 30 minutes behind schedule and have 3 more patients to see. What is the correct approach? A: Notify the office and affected patients of the delay. Prioritize patients by clinical acuity — the most clinically complex or time-sensitive patients should not have their visits shortened.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-014-L1-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 1 Q: You are running 30 minutes behind schedule and have 3 more patients to see. What is the correct approach? A: Notify the office and affected patients of the delay.",
            narration: "Knowledge Check 1 Q: You are running 30 minutes behind schedule and have 3 more patients to see. What is the correct approach? A: Notify the office and affected patients of the delay.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    },
    {
      id: "GAO-014-L2",
      order: 2,
      title: "Professional Boundaries Defined",
      objectives: [
        "Apply key requirements from Professional Boundaries Defined",
        "Identify correct field actions related to Professional Boundaries Defined"
      ],
      cards: [
        {
          id: "GAO-014-L2-S",
          type: "summary",
          title: "Professional Boundaries Defined",
          body: "Professional boundaries define the limits of the therapeutic relationship between healthcare providers and patients. In home health, boundary management is uniquely challenging because you work in the patient's personal space, often develop long-term relationships with patients and families, and…",
          narration: "In this lesson: Professional Boundaries Defined. Professional boundaries define the limits of the therapeutic relationship between healthcare providers and patients. In home health, boundary management is uniquely challenging because you work in the patient's personal space, often develop long-term relationships with patients and families, and may feel emotionally connected to people you care for over weeks or months.",
          estDurationSec: 45
        },
        {
          id: "GAO-014-L2-C1",
          type: "content",
          title: "Professional Boundaries Defined",
          body: "Professional boundaries define the limits of the therapeutic relationship between healthcare providers and patients. In home health, boundary management is uniquely challenging because you work in the patient's personal space, often develop long-term relationships with patients and families, and may feel emotionally…",
          narration: "Professional boundaries define the limits of the therapeutic relationship between healthcare providers and patients. In home health, boundary management is uniquely challenging because you work in the patient's personal space, often develop long-term relationships with patients and families, and may feel emotionally connected to people you care for over weeks or months. The therapeutic relationship is professional, not personal. It exists for the patient's benefit, not yours. It is bounded by your clinical role, the plan of care, and agency policies. When the relationship crosses from professional to personal, it becomes a boundary violation that can harm the patient, compromise care, and create legal and ethical liability. Boundary violations can be categorized as over-involvement or under-involvement. Over-involvement includes becoming personally or emotionally enmeshed with the patient or family, sharing personal problems, accepting or giving gifts beyond token value, providing personal contact information, visiting the patient outside scheduled work visits, performing",
          estDurationSec: 64
        },
        {
          id: "GAO-014-L2-C2",
          type: "content",
          title: "Professional Boundaries Defined (part 2)",
          body: "tasks outside the plan of care for personal rather than clinical reasons, and developing romantic or sexual feelings that influence professional behavior.",
          narration: "tasks outside the plan of care for personal rather than clinical reasons, and developing romantic or sexual feelings that influence professional behavior. Under-involvement includes emotional withdrawal, providing minimal care to avoid connection, being dismissive of patient concerns, and failing to advocate for the patient because of burnout or disengagement. Under-involvement is a boundary issue because it violates the patient's right to compassionate, attentive care. The zone of helpfulness is the professional sweet spot between over-involvement and under-involvement. In this zone, you are warm, empathetic, and engaged, but you maintain the professional distance necessary to make objective clinical decisions, treat all patients equitably, and protect both the patient and yourself. ---",
          estDurationSec: 47
        },
        {
          id: "GAO-014-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Professional Boundaries Defined\"?",
          narration: "What is the key takeaway from \"Professional Boundaries Defined\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-014-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Professional Boundaries Defined\"?",
            narration: "What is the key takeaway from \"Professional Boundaries Defined\"?",
            options: [
              {
                id: "a",
                label: "Professional boundaries define the limits of the therapeutic relationship between healthcare providers and patients.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Professional boundaries define the limits of the therapeutic relationship between healthcare providers and patients."
          }
        }
      ]
    },
    {
      id: "GAO-014-L3",
      order: 3,
      title: "Common Boundary Challenges",
      objectives: [
        "Apply key requirements from Common Boundary Challenges",
        "Identify correct field actions related to Common Boundary Challenges"
      ],
      cards: [
        {
          id: "GAO-014-L3-S",
          type: "summary",
          title: "Common Boundary Challenges",
          body: "Home health presents boundary challenges that do not exist in other healthcare settings. You enter the patient's home, see their family photos, meet their pets, share their kitchen table. The intimacy of the home environment naturally creates a sense of familiarity that can blur professional lines.",
          narration: "In this lesson: Common Boundary Challenges. Home health presents boundary challenges that do not exist in other healthcare settings. You enter the patient's home, see their family photos, meet their pets, share their kitchen table. The intimacy of the home environment naturally creates a sense of familiarity that can blur professional lines. Gift-giving is one of the most common boundary dilemmas.",
          estDurationSec: 45
        },
        {
          id: "GAO-014-L3-C1",
          type: "content",
          title: "Common Boundary Challenges",
          body: "Home health presents boundary challenges that do not exist in other healthcare settings. You enter the patient's home, see their family photos, meet their pets, share their kitchen table. The intimacy of the home environment naturally creates a sense of familiarity that can blur professional lines.",
          narration: "Home health presents boundary challenges that do not exist in other healthcare settings. You enter the patient's home, see their family photos, meet their pets, share their kitchen table. The intimacy of the home environment naturally creates a sense of familiarity that can blur professional lines. Gift-giving is one of the most common boundary dilemmas. Patients and families often want to express gratitude through gifts, food, or money. Care Indeed's policy on gifts aligns with professional ethics: you may accept small, inexpensive tokens such as homemade cookies or a holiday card. You may not accept cash, gift cards, or items of significant value. You may not accept gifts that create an obligation or expectation of special treatment. If you are unsure whether a gift is appropriate, ask your supervisor. Personal disclosure is another common challenge. Patients may ask about your personal life, your family, your health problems, or your opinions",
          estDurationSec: 64
        },
        {
          id: "GAO-014-L3-C2",
          type: "content",
          title: "Common Boundary Challenges (part 2)",
          body: "on non-clinical topics. Appropriate self-disclosure is limited: you might share that you enjoy cooking if it supports rapport during a meal preparation activity, but you should not share details about your marriage, financial problems, or personal health issues.",
          narration: "on non-clinical topics. Appropriate self-disclosure is limited: you might share that you enjoy cooking if it supports rapport during a meal preparation activity, but you should not share details about your marriage, financial problems, or personal health issues. The conversation should always center on the patient, not on you. Social media creates modern boundary risks. Do not connect with patients or their families on social media. Do not post about patient visits, even without identifying information. Do not share photos taken in patient homes. Social media interactions blur the professional boundary and create HIPAA risks. Dual relationships occur when you serve as both a clinician and have another relationship with the patient — for example, if a friend, neighbor, or family member becomes your patient. If this occurs, notify your supervisor immediately. The agency may need to reassign the patient to another clinician to maintain professional objectivity.",
          estDurationSec: 63
        },
        {
          id: "GAO-014-L3-CH",
          type: "challenge",
          title: "Scenario Challenge 1 Scenario: A patient you have been…",
          body: "Scenario Challenge 1 Scenario: A patient you have been visiting for six weeks gives you a $100 gift card and says, You have been so wonderful, I want you to have this.",
          narration: "Scenario Challenge 1 Scenario: A patient you have been visiting for six weeks gives you a $100 gift card and says, You have been so wonderful, I want you to have this. The patient is sincere and you do not want to hurt their feelings.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-014-L3-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 1 Scenario: A patient you have been visiting for six weeks gives you a $100 gift card and says, You have been so wonderful, I want you to have this. The patient is sincere and you do not want to hurt their feelings.",
            narration: "Scenario Challenge 1 Scenario: A patient you have been visiting for six weeks gives you a $100 gift card and says, You have been so wonderful, I want you to have this. The patient is sincere and you do not want to hurt their feelings.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    },
    {
      id: "GAO-014-L4",
      order: 4,
      title: "Boundary Violations — Warning Signs",
      objectives: [
        "Apply key requirements from Boundary Violations — Warning Signs",
        "Identify correct field actions related to Boundary Violations — Warning Signs"
      ],
      cards: [
        {
          id: "GAO-014-L4-S",
          type: "summary",
          title: "Boundary Violations — Warning Signs",
          body: "Recognizing early warning signs of boundary drift helps you correct course before a violation occurs. Warning signs in yourself include thinking about a particular patient outside of work more than others, feeling that you are the only one who truly understands this patient, sharing more personal…",
          narration: "In this lesson: Boundary Violations — Warning Signs. Recognizing early warning signs of boundary drift helps you correct course before a violation occurs. Warning signs in yourself include thinking about a particular patient outside of work more than others, feeling that you are the only one who truly understands this patient, sharing more personal information than you would with other patients, doing extra tasks or spending extra time with one…",
          estDurationSec: 45
        },
        {
          id: "GAO-014-L4-C1",
          type: "content",
          title: "Boundary Violations — Warning Signs",
          body: "Recognizing early warning signs of boundary drift helps you correct course before a violation occurs. Warning signs in yourself include thinking about a particular patient outside of work more than others, feeling that you are the only one who truly understands this patient, sharing more personal information than you…",
          narration: "Recognizing early warning signs of boundary drift helps you correct course before a violation occurs. Warning signs in yourself include thinking about a particular patient outside of work more than others, feeling that you are the only one who truly understands this patient, sharing more personal information than you would with other patients, doing extra tasks or spending extra time with one patient while shortcutting others, feeling jealous or possessive when another clinician covers your patient, keeping secrets about the patient relationship from your supervisor, and dreading the eventual discharge because of the personal connection. Warning signs from patients or families include requests for your personal phone number or to see you outside of work, expectations that you will do things outside the plan of care, expressions of romantic interest or excessive emotional dependency, attempts to involve you in family conflicts or decision-making that is not within your clinical role,",
          estDurationSec: 64
        },
        {
          id: "GAO-014-L4-C2",
          type: "content",
          title: "Boundary Violations — Warning Signs (part 2)",
          body: "and offering increasingly valuable gifts. When you notice these signs, take action early. Discuss the situation with your supervisor. They can help you re-establish appropriate boundaries, modify the visit schedule, involve additional team members, or reassign the patient if necessary.",
          narration: "and offering increasingly valuable gifts. When you notice these signs, take action early. Discuss the situation with your supervisor. They can help you re-establish appropriate boundaries, modify the visit schedule, involve additional team members, or reassign the patient if necessary. Seeking supervision is not a sign of weakness — it is a professional competency. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-014-L4-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Boundary Violations — Warning Signs\"?",
          narration: "What is the key takeaway from \"Boundary Violations — Warning Signs\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-014-L4-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Boundary Violations — Warning Signs\"?",
            narration: "What is the key takeaway from \"Boundary Violations — Warning Signs\"?",
            options: [
              {
                id: "a",
                label: "Recognizing early warning signs of boundary drift helps you correct course before a violation occurs.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Recognizing early warning signs of boundary drift helps you correct course before a violation occurs."
          }
        }
      ]
    },
    {
      id: "GAO-014-L5",
      order: 5,
      title: "Impact of Violations & Summary (430 + 440 words) #",
      objectives: [
        "Apply key requirements from Impact of Violations & Summary (430 + 440 words) #",
        "Identify correct field actions related to Impact of Violations & Summary (430 + 440 words) #"
      ],
      cards: [
        {
          id: "GAO-014-L5-S",
          type: "summary",
          title: "Impact of Violations & Summary (430 + 440 words) #",
          body: "Impact of Violations & Summary (430 + 440 words) #",
          narration: "In this lesson: Impact of Violations & Summary (430 + 440 words) #. Impact of Violations & Summary (430 + 440 words) #",
          estDurationSec: 45
        },
        {
          id: "GAO-014-L5-C1",
          type: "content",
          title: "Impact of Violations & Summary (430 + 440 words) #",
          body: "Impact of Violations & Summary (430 + 440 words) #",
          narration: "Impact of Violations & Summary (430 + 440 words) #",
          estDurationSec: 35
        },
        {
          id: "GAO-014-L5-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Impact of Violations & Summary (430 + 440 words) #\"?",
          narration: "What is the key takeaway from \"Impact of Violations & Summary (430 + 440 words) #\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-014-L5-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Impact of Violations & Summary (430 + 440 words) #\"?",
            narration: "What is the key takeaway from \"Impact of Violations & Summary (430 + 440 words) #\"?",
            options: [
              {
                id: "a",
                label: "Impact of Violations & Summary (430 + 440 words) #",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Impact of Violations & Summary (430 + 440 words) #"
          }
        }
      ]
    },
    {
      id: "GAO-014-L6",
      order: 6,
      title: "Consequences of Boundary Violations",
      objectives: [
        "Apply key requirements from Consequences of Boundary Violations",
        "Identify correct field actions related to Consequences of Boundary Violations"
      ],
      cards: [
        {
          id: "GAO-014-L6-S",
          type: "summary",
          title: "Consequences of Boundary Violations",
          body: "Boundary violations harm patients, clinicians, and the agency. Patients are harmed because the therapeutic relationship is compromised.",
          narration: "In this lesson: Consequences of Boundary Violations. Boundary violations harm patients, clinicians, and the agency. Patients are harmed because the therapeutic relationship is compromised. A patient who views you as a friend rather than a clinician may not follow clinical recommendations, may resist transfer to another provider, or may experience emotional harm when the professional relationship ends.",
          estDurationSec: 45
        },
        {
          id: "GAO-014-L6-C1",
          type: "content",
          title: "Consequences of Boundary Violations",
          body: "Boundary violations harm patients, clinicians, and the agency. Patients are harmed because the therapeutic relationship is compromised.",
          narration: "Boundary violations harm patients, clinicians, and the agency. Patients are harmed because the therapeutic relationship is compromised. A patient who views you as a friend rather than a clinician may not follow clinical recommendations, may resist transfer to another provider, or may experience emotional harm when the professional relationship ends. Clinicians are harmed because boundary violations create burnout, emotional exhaustion, ethical liability, and potential disciplinary action. In extreme cases, boundary violations involving financial exploitation or sexual misconduct result in licensure revocation, criminal prosecution, and civil lawsuits. The agency is harmed because boundary violations create survey deficiencies, legal liability, reputation damage, and patient complaints. CMS surveyors assess whether agencies have policies addressing professional boundaries and whether staff are trained on maintaining them.",
          estDurationSec: 52
        },
        {
          id: "GAO-014-L6-CH",
          type: "challenge",
          title: "Knowledge Check 2 Q: You realize you have been sharing…",
          body: "Knowledge Check 2 Q: You realize you have been sharing increasingly personal information with a patient over the past several visits.",
          narration: "Knowledge Check 2 Q: You realize you have been sharing increasingly personal information with a patient over the past several visits. What should you do? A: Recognize this as boundary drift and take immediate corrective action. Stop sharing personal information. Re-center conversations on the patient's clinical needs.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-014-L6-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 2 Q: You realize you have been sharing increasingly personal information with a patient over the past several visits. What should you do? A: Recognize this as boundary drift and take immediate corrective action. Stop sharing personal information.",
            narration: "Knowledge Check 2 Q: You realize you have been sharing increasingly personal information with a patient over the past several visits. What should you do? A: Recognize this as boundary drift and take immediate corrective action. Stop sharing personal information.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    },
    {
      id: "GAO-014-L7",
      order: 7,
      title: "Module Summary",
      objectives: [
        "Apply key requirements from Module Summary",
        "Identify correct field actions related to Module Summary"
      ],
      cards: [
        {
          id: "GAO-014-L7-S",
          type: "summary",
          title: "Module Summary",
          body: "Time management and professional boundaries are interconnected skills in home health. Poor time management leads to rushed visits, which can lead to boundary shortcuts. And boundary violations consume emotional energy that undermines time management and clinical performance.",
          narration: "In this lesson: Module Summary. Time management and professional boundaries are interconnected skills in home health. Poor time management leads to rushed visits, which can lead to boundary shortcuts. And boundary violations consume emotional energy that undermines time management and clinical performance.",
          estDurationSec: 45
        },
        {
          id: "GAO-014-L7-C1",
          type: "content",
          title: "Module Summary",
          body: "Time management and professional boundaries are interconnected skills in home health. Poor time management leads to rushed visits, which can lead to boundary shortcuts. And boundary violations consume emotional energy that undermines time management and clinical performance.",
          narration: "Time management and professional boundaries are interconnected skills in home health. Poor time management leads to rushed visits, which can lead to boundary shortcuts. And boundary violations consume emotional energy that undermines time management and clinical performance. Manage your time proactively: plan your route, prioritize by acuity, document at point of care, and communicate schedule challenges to the office. Never sacrifice clinical quality to make up time. Maintain professional boundaries by staying in the zone of helpfulness. Be warm, empathetic, and engaged, but maintain the professional distance that protects both you and the patient. Know the agency's gift policy. Limit self-disclosure. Avoid social media connections with patients. Report dual relationships immediately. Recognize warning signs of boundary drift early and seek supervisory support. The earlier you address boundary concerns, the easier they are to resolve. Proceed to the final exam. Ten questions, eighty percent to pass.",
          estDurationSec: 62
        },
        {
          id: "GAO-014-L7-CH",
          type: "challenge",
          title: "Scenario Challenge 2 Scenario: A patient who lives alone…",
          body: "Scenario Challenge 2 Scenario: A patient who lives alone and has no family nearby asks for your personal cell phone number so they can reach you when they feel scared at night.",
          narration: "Scenario Challenge 2 Scenario: A patient who lives alone and has no family nearby asks for your personal cell phone number so they can reach you when they feel scared at night. What do you do? Expected Response: Acknowledge the patient's feelings and validate that being alone can feel frightening.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-014-L7-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 2 Scenario: A patient who lives alone and has no family nearby asks for your personal cell phone number so they can reach you when they feel scared at night.",
            narration: "Scenario Challenge 2 Scenario: A patient who lives alone and has no family nearby asks for your personal cell phone number so they can reach you when they feel scared at night.",
            options: [
              {
                id: "a",
                label: "Apply the policy-based correct action.",
                isCorrect: true,
                feedback: "Correct — this matches the module guidance."
              },
              {
                id: "b",
                label: "Document only and take no further action until the next scheduled visit.",
                isCorrect: false,
                feedback: "Documentation alone is not enough when action or notification is required."
              },
              {
                id: "c",
                label: "Ask a coworker informally and wait for them to decide.",
                isCorrect: false,
                feedback: "You must follow the formal policy pathway yourself."
              },
              {
                id: "d",
                label: "Ignore the issue if the patient appears comfortable.",
                isCorrect: false,
                feedback: "Patient comfort does not override required clinical or compliance actions."
              }
            ],
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: ""
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-014-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Time Management & Professional Boundaries. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "The \"zone of helpfulness\" in professional boundaries means",
        narration: "The \"zone of helpfulness\" in professional boundaries means",
        options: [
          {
            id: "a",
            label: "Maximum personal involvement",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Warm and empathetic but professionally bounded",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Emotional distance",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only clinical tasks",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q1 from AAA Record v2.0 for GAO-014."
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "A patient gives you a $50 gift card. You should",
        narration: "A patient gives you a $50 gift card. You should",
        options: [
          {
            id: "a",
            label: "Accept it",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Decline politely and explain the agency's gift policy",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Accept but don't tell anyone",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Return it to the store",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q2 from AAA Record v2.0 for GAO-014."
      },
      {
        id: "q3",
        format: "scenario_decision",
        prompt: "Connecting with patients on social media is",
        narration: "Connecting with patients on social media is",
        options: [
          {
            id: "a",
            label: "Recommended",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "A boundary violation and HIPAA risk",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Only wrong if supervisors find out",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Acceptable after discharge",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q3 from AAA Record v2.0 for GAO-014."
      },
      {
        id: "q4",
        format: "scenario_decision",
        prompt: "Running behind schedule, you should",
        narration: "Running behind schedule, you should",
        options: [
          {
            id: "a",
            label: "Skip documentation",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Rush assessments",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Notify the office, prioritize by acuity, and request support",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Cancel remaining visits",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q4 from AAA Record v2.0 for GAO-014."
      },
      {
        id: "q5",
        format: "scenario_decision",
        prompt: "Sharing personal problems with patients is",
        narration: "Sharing personal problems with patients is",
        options: [
          {
            id: "a",
            label: "Good rapport building",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Inappropriate self-disclosure that shifts focus from the patient",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Required for trust",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only wrong with new patients",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q5 from AAA Record v2.0 for GAO-014."
      },
      {
        id: "q6",
        format: "scenario_decision",
        prompt: "You notice you think about one patient more than others outside work. This is",
        narration: "You notice you think about one patient more than others outside work. This is",
        options: [
          {
            id: "a",
            label: "Normal",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "A warning sign of boundary drift requiring supervisory discussion",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "A sign you're a good clinician",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Irrelevant",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q6 from AAA Record v2.0 for GAO-014."
      },
      {
        id: "q7",
        format: "scenario_decision",
        prompt: "A patient's family asks you to do tasks not on the care plan because \"you're already here.\" You should",
        narration: "A patient's family asks you to do tasks not on the care plan because \"you're already here.\" You should",
        options: [
          {
            id: "a",
            label: "Do the tasks",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Explain you can only provide services on the plan of care and redirect",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Do the tasks but don't document",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Complain to the office",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q7 from AAA Record v2.0 for GAO-014."
      },
      {
        id: "q8",
        format: "scenario_decision",
        prompt: "Point-of-care documentation means",
        narration: "Point-of-care documentation means",
        options: [
          {
            id: "a",
            label: "Documenting before the visit",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Completing documentation during or immediately after the visit, before leaving the home",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Weekly documentation",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Verbal-only reporting",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q8 from AAA Record v2.0 for GAO-014."
      },
      {
        id: "q9",
        format: "scenario_decision",
        prompt: "A friend becomes your patient. You should",
        narration: "A friend becomes your patient. You should",
        options: [
          {
            id: "a",
            label: "Keep it secret",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Enjoy the familiarity",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Notify your supervisor immediately for possible reassignment",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Refuse to treat them",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q9 from AAA Record v2.0 for GAO-014."
      },
      {
        id: "q10",
        format: "scenario_decision",
        prompt: "Time management failures in home health most directly risk",
        narration: "Time management failures in home health most directly risk",
        options: [
          {
            id: "a",
            label: "Employee satisfaction",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Rushed assessments, missed documentation, and compromised patient safety",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Budget overruns",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Nothing significant --- ## QA VALIDATION SUMMARY",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q10 from AAA Record v2.0 for GAO-014."
      }
    ]
  }
}
];
