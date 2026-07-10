/* GAO Phase 1 trainings — Modules 001-007 (AAA v2 for 003-005; 001/002/006/007 preserved) */

import type { ModuleTraining } from './trainingContent.types';

const NAV_BULLETS = ["Single-card view","Audio narration on every card","Challenges required to advance","80% to pass final test"];
const NAV_NARRATION = "One card at a time. Audio narration on every card. Challenges must be completed before you continue. The final test requires eighty percent to pass.";
const NAV_BODY = "You will move through one card at a time. Use Next and Previous to navigate. Your progress, time on each card, and challenge responses are tracked for compliance. Skipping cards is not allowed.";

export const GAO_TRAININGS_001_007: ModuleTraining[] = [
  {
    moduleId: 'GAO-001',
    policyRefs: ['EN-CM-001'],
    cmsRefs: [],
    estimatedDurationMin: 45,
    durationSource: 'DEFAULT',
    splash: {
      title: 'Agency Mission, Vision, and Values',
      subtitle: 'Why we exist and how we behave',
      whyItMatters:
        'Mission and values are not decoration. CMS surveyors, accreditors, and patients judge us by whether our day-to-day decisions match what we publish. Every patient call, visit note, and reported concern is measured against these standards.',
      narration:
        'Welcome to General Agency Orientation. In this module you will learn the mission, vision, and values that govern every decision the agency makes. These are not slogans. They are the standards a surveyor will hold us to and the promises we make to every patient.',
    },
    navigation: {
      title: 'How This Training Works',
      body: 'You will move through one card at a time. Use Next and Previous to navigate. Your progress, time on each card, and challenge responses are tracked for compliance. Skipping cards is not allowed.',
      bullets: [
        'One card at a time â€” no scrolling',
        'Audio narration is required on every card',
        'Challenges must be answered before you can continue',
        'Final test requires 80% to pass',
        'Your supervisor will be notified of completion or remediation',
      ],
      narration:
        'Before you begin, here is how this training works. You will see one card at a time. Use the Next and Previous buttons to navigate. Audio narration plays on every card. Challenges must be completed before you can continue. The final test requires an eighty percent passing score. Skipping is not permitted, and your activity is recorded as compliance evidence.',
    },
    lessons: [
      {
        id: 'GAO-001-L1',
        order: 1,
        title: 'Mission, Vision, and Core Values',
        objectives: [
          'State the agency mission and vision in your own words',
          'Identify the five core values',
          'Explain how values guide a difficult clinical or administrative decision',
        ],
        cards: [
          {
            id: 'GAO-001-L1-S',
            type: 'summary',
            title: 'What You Will Learn',
            body: 'This lesson covers our mission to deliver safe, dignified, evidence-based care in the home; our vision of being the most trusted home health partner in our service area; and the five values that govern conduct: Patient-First, Integrity, Accountability, Teamwork, and Continuous Improvement.',
            narration:
              'In this lesson you will learn the agency mission to deliver safe, dignified, and evidence-based care in the home. You will learn the vision of being the most trusted home health partner in our service area. You will learn the five core values: patient-first, integrity, accountability, teamwork, and continuous improvement.',
            estDurationSec: 35,
            imageUrl: '/assets/media/onboarding-gao001-vision.jpg',
          },
          {
            id: 'GAO-001-L1-C1',
            type: 'content',
            title: 'Mission Statement',
            body: 'Our mission: to deliver safe, dignified, evidence-based home health care that restores independence and supports patients, families, and caregivers as partners. Every visit, note, and decision must trace back to this mission.',
            narration:
              'Our mission is to deliver safe, dignified, evidence-based home health care that restores independence and supports patients, families, and caregivers as partners. Every visit you make, every note you write, and every decision you take must trace back to that mission. If an action does not serve it, the action does not belong here.',
            estDurationSec: 45,
          },
          {
            id: 'GAO-001-L1-C2',
            type: 'content',
            title: 'Vision Statement',
            body: 'Our vision: to be the most trusted home health partner in our service area, measured by patient outcomes, satisfaction scores, and survey results. Trust is earned visit by visit and lost in a single failure to act on a concern.',
            narration:
              'Our vision is to be the most trusted home health partner in our service area. Trust is measured by patient outcomes, by satisfaction scores, and by survey results. It is earned visit by visit, and it can be lost the moment a single concern goes unreported. You build that vision every day.',
            estDurationSec: 45,
          },
          {
            id: 'GAO-001-L1-C3',
            type: 'content',
            title: 'The Five Core Values',
            body: '**Patient-First** â€” patient safety and dignity outrank schedule, cost, and convenience.\n**Integrity** â€” accurate documentation, no shortcuts, no false attestations.\n**Accountability** â€” own mistakes; report concerns immediately.\n**Teamwork** â€” communicate with colleagues, supervisors, and physicians.\n**Continuous Improvement** â€” participate in QAPI and competency activities.',
            narration:
              'The five values you must apply daily are: Patient-First, meaning patient safety and dignity outrank schedule, cost, or convenience. Integrity, meaning accurate documentation and no shortcuts. Accountability, meaning you own mistakes and report concerns immediately. Teamwork, meaning open communication with colleagues, supervisors, and physicians. And Continuous Improvement, meaning you participate in our quality and competency programs.',
            estDurationSec: 60,
            imageUrl: '/assets/media/onboarding-gao001-values.jpg',
          },
          {
            id: 'GAO-001-L1-C4',
            type: 'content',
            title: 'Field Example: Applying Values Under Time Pressure',
            body: 'At 4:45 PM you finish a complex dressing change on Mrs. Ramirez. Your next patient is 25 minutes away and shift ends at 5:30. The daughter quietly mentions the patient fell getting out of bed yesterday but "did not want to bother anyone." You see new bruising on the forearm. Per EN-CM-001 (Enterprise Compliance Metrics Program), you arrange coverage for the next scheduled visit, complete a focused fall and neuro assessment, notify the physician and DON immediately, and document the observation, actions, and patient statements in objective language before leaving the home. Schedule pressure never overrides safety.',
            narration: 'Here is how it looks in the field. At four forty-five you finish a complex dressing. Next patient is twenty-five minutes away. The daughter mentions a fall yesterday. You see bruising. Per EN-CM-001 (Enterprise Compliance Metrics Program), you arrange coverage, assess for injury, notify the physician and DON right away, and write the note before you leave. Time pressure does not excuse skipping assessment and notification.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-001-L1-C5',
            type: 'content',
            title: 'Values and Survey Readiness',
            body: 'Surveyors will ask you to describe a time you put a value into action. Keep brief, factual examples ready: "I stopped a visit when oxygen saturation dropped, notified the physician per protocol, and documented before moving to the next patient. That was Patient-First." Your examples become evidence that the agency lives its mission.',
            narration: 'Surveyors ask staff to give examples of values in action. Have short factual stories ready, like stopping for a low oxygen reading, calling the physician, and documenting before the next patient. Those real examples prove the mission and values are not just on paper.',
            estDurationSec: 50,
          },
          {
            id: 'GAO-001-L1-CH',
            type: 'challenge',
            title: 'Apply the Values',
            body: 'You arrive at a patient home for a wound dressing change and notice the patient appears sedated and short of breath. You are running thirty minutes behind and have two more visits scheduled.',
            narration:
              'Time for a scenario. You arrive at a patient home for a wound dressing change and notice the patient appears sedated and short of breath. You are running thirty minutes behind and have two more visits scheduled. Choose the action that best applies our values.',
            estDurationSec: 50,
            challenge: {
              id: 'GAO-001-L1-CH-Q',
              format: 'scenario_decision',
              prompt: 'Which action best aligns with our Patient-First value?',
              narration: 'Which of the following actions best aligns with our Patient-First value?',
              options: [
                {
                  id: 'a',
                  label: 'Complete the wound care quickly so you can stay on schedule, and tell the family to call if it gets worse.',
                  isCorrect: false,
                  feedback: 'Schedule never overrides clinical safety. Discharging the concern to the family does not meet your duty of assessment and escalation.',
                },
                {
                  id: 'b',
                  label: 'Stop, complete a focused respiratory and mental status assessment, notify the physician and DON, and document everything before continuing.',
                  isCorrect: true,
                  feedback: 'Correct. Patient-First means clinical assessment and escalation come before schedule. You must assess, notify, and document.',
                },
                {
                  id: 'c',
                  label: 'Skip the wound care entirely so you can finish the next two visits on time.',
                  isCorrect: false,
                  feedback: 'Skipping ordered care violates the plan of care and is fraudulent if billed. It also fails the patient who needs assessment.',
                },
                {
                  id: 'd',
                  label: 'Call your scheduler to push the next visits and leave a voicemail for the family.',
                  isCorrect: false,
                  feedback: 'Rescheduling is part of the response, but it does not address the immediate clinical change. Assessment and physician notification come first.',
                },
              ],
              policyRef: 'EN-CM-001',
              feedbackCorrect: 'Stopping to assess, escalating to the physician and DON, and documenting is the only response that satisfies Patient-First, Integrity, and Accountability simultaneously.',
              feedbackIncorrect: 'Any answer that prioritizes the schedule over an unanticipated clinical change violates our values and 42 CFR 484.60 plan-of-care expectations.',
              complianceImpact:
                'Failure to assess and notify on a clinical change is a deficient practice under 42 CFR 484.60(c) and a values violation that can trigger a serious incident review.',
              realWorldConsequence:
                'A missed respiratory escalation has caused preventable hospitalizations, complaint surveys, and immediate jeopardy citations in published CMS reports.',
              correctBehaviorGuidance:
                'When a clinical change is observed: assess, stabilize, notify the physician and supervisor, document objectively, and only then resume the schedule.',
            },
          },
        ],
      },
      {
        id: 'GAO-001-L2',
        order: 2,
        title: 'Living the Values in the Field',
        objectives: [
          'Translate values into observable visit-level behaviors',
          'Recognize value conflicts and choose patient-first',
        ],
        cards: [
          {
            id: 'GAO-001-L2-S',
            type: 'summary',
            title: 'From Words to Actions',
            body: 'This lesson translates each value into observable behaviors that surveyors and supervisors can verify on a real visit.',
            narration: 'In this lesson you will translate each value into observable behaviors that a surveyor or supervisor can verify on a real visit. Values that cannot be observed are not values.',
            estDurationSec: 35,
          },
          {
            id: 'GAO-001-L2-C1',
            type: 'content',
            title: 'Observable Patient-First Behaviors',
            body: 'Examples: stopping the visit when a clinical change appears; refusing an unsafe environment; advocating for the patient with the physician; documenting in plain language the patient can read.',
            narration: 'Observable Patient-First behaviors include stopping the visit when a clinical change appears, refusing to enter an unsafe environment, advocating for the patient with the physician, and documenting in plain language the patient can read.',
            estDurationSec: 50,
          },
          {
            id: 'GAO-001-L2-C2',
            type: 'content',
            title: 'Observable Integrity Behaviors',
            body: 'Examples: documenting actual visit times; correcting a charting error using the agency amendment workflow; refusing to sign for care you did not deliver; reporting near-misses honestly.',
            narration: 'Observable Integrity behaviors include documenting actual visit times, correcting a charting error through the amendment workflow, refusing to sign for care you did not deliver, and reporting near-misses honestly even when no harm occurred.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-001-L2-C3',
            type: 'content',
            title: 'Field Example: Teamwork on a Missed Medication Dose',
            body: 'You discover during your visit that the HHA did not give the morning insulin because the patient refused. The HHA documented "patient refused" but did not call anyone. Per EN-CM-001, you contact the on-call RN to report the missed dose, confirm the patient\'s current status and glucose, obtain new instructions, and add your note linking to the HHA note. Later you follow up with the HHA\'s supervisor so competency coaching happens. This is Teamwork and Continuous Improvement.',
            narration: 'Real example. The home health aide did not give morning insulin because the patient refused and only wrote "refused." Per EN-CM-001 you call the on-call nurse, get the patient checked, get fresh orders, and link your note. You also loop in the aide supervisor for coaching. That is teamwork plus continuous improvement.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-001-L2-C4',
            type: 'content',
            title: 'Practical Test: Values Under Pressure',
            body: 'A patient\'s adult son offers you a fifty-dollar bill "for all you do." The visit is running long and you still have charting to finish in the car. You thank him, explain you cannot accept gifts, document the offer and your declination, and complete your note before driving. Later you mention the interaction to your supervisor so the family understands boundaries. This protects integrity and prevents any perception of influence.',
            narration: 'Practical test. The son offers cash for your help. Visit is late, charting still due. You politely decline, document the offer and your response, finish the note before leaving, and tell supervisor. This keeps integrity clear for everyone.',
            estDurationSec: 50,
          },
          {
            id: 'GAO-001-L2-CH',
            type: 'challenge',
            title: 'Value Conflict',
            body: 'A family pressures you to omit a fall from the visit note to protect the patient from family criticism.',
            narration: 'A scenario. A family pressures you to omit a documented fall from the visit note to protect the patient from family criticism. What is the correct action?',
            estDurationSec: 45,
            challenge: {
              id: 'GAO-001-L2-CH-Q',
              format: 'scenario_decision',
              prompt: 'What is the correct action?',
              narration: 'What is the correct action?',
              options: [
                { id: 'a', label: 'Omit the fall to keep family peace.', isCorrect: false, feedback: 'Falsified records harm the patient and the agency.' },
                { id: 'b', label: 'Document the fall objectively, notify physician and supervisor, and explain to the family why honest documentation protects the patient.', isCorrect: true, feedback: 'Correct. Patient-First and Integrity require honest documentation and escalation.' },
                { id: 'c', label: 'Document but mark the entry private from the family.', isCorrect: false, feedback: 'Patients control their record; access cannot be hidden from authorized parties.' },
                { id: 'd', label: 'Refer the family to your supervisor without documenting.', isCorrect: false, feedback: 'Documentation is your individual obligation regardless of family discussion.' },
              ],
              policyRef: 'EN-CM-001',
              feedbackCorrect: 'Honest documentation, notification, and patient-and-family communication satisfy values and 42 CFR 484.60.',
              feedbackIncorrect: 'Concealment of clinical events is falsification and a federal documentation violation.',
              complianceImpact: 'Omission of falls is a survey-level deficiency under 42 CFR 484.60(c) and a False Claims risk if billed.',
              realWorldConsequence: 'Concealed falls have led to delayed diagnosis, repeat injury, and litigation against agencies and individual clinicians.',
              correctBehaviorGuidance: 'Document objectively, notify, communicate. Empathy with family does not justify falsification.',
            },
          },
        ],
      },
    ],
    finalTest: {
      id: 'GAO-001-FT',
      passingScorePct: 0.80,
      instructionsNarration:
        'You have completed the lessons. The final test confirms your understanding of the agency mission and values. You need eighty percent to pass. If you do not pass, you will be assigned remediation before retaking.',
      failAction: 'remediation',
      questions: [
        {
          id: 'GAO-001-FT-Q1',
          format: 'matching',
          prompt: 'Match each value to the action that best demonstrates it in the field.',
          narration: 'Match each of our five values to the action that best demonstrates it in the field.',
          matches: [
            { left: 'Patient-First', right: 'Stop scheduled care to assess a sudden clinical change' },
            { left: 'Integrity', right: 'Document the visit time you actually arrived, not when you signed in' },
            { left: 'Accountability', right: 'Report your own medication error to the supervisor immediately' },
            { left: 'Teamwork', right: 'Hand off a complex case to the on-call nurse with a written SBAR' },
            { left: 'Continuous Improvement', right: 'Participate in the quarterly QAPI case review' },
          ],
          rationale: 'Each value translates to a specific observable behavior per EN-CM-001 (Enterprise Compliance Metrics Program). Surveyors and the QAPI committee verify application in the field, not just memorization.',
          policyRef: 'EN-CM-001 (Enterprise Compliance Metrics Program)',
        },
        {
          id: 'GAO-001-FT-Q2',
          format: 'scenario_decision',
          prompt: 'A coworker asks you to back-date a visit note. What do you do?',
          narration: 'A coworker asks you to back-date a visit note. Choose the correct response.',
          options: [
            { id: 'a', label: 'Refuse and report the request to the Compliance Officer.', isCorrect: true, feedback: 'Correct. Falsifying dates is a federal false claim.' },
            { id: 'b', label: 'Do it once as a favor.', isCorrect: false, feedback: 'Falsification is fraud regardless of intent or frequency.' },
            { id: 'c', label: 'Ignore the request and say nothing.', isCorrect: false, feedback: 'You are a mandated reporter for compliance concerns under CO-CP-005.' },
            { id: 'd', label: 'Ask the supervisor to back-date it for the coworker.', isCorrect: false, feedback: 'Asking another person does not change the fraud.' },
          ],
          rationale: 'Integrity under EN-CM-001 (Enterprise Compliance Metrics Program) requires refusal and immediate report. CO-CP-005 (Whistleblower Protection) shields good-faith reporters from retaliation.',
          policyRef: 'EN-CM-001 (Enterprise Compliance Metrics Program)',
        },
        {
          id: 'GAO-001-FT-Q3',
          format: 'structured_input',
          prompt: 'In one sentence, state the agency mission as written in policy EN-CM-001.',
          narration: 'In one sentence, state the agency mission as written in policy EN-CM-001.',
          fields: [
            {
              id: 'mission',
              label: 'Mission statement',
              acceptableAnswers: [
                'deliver safe, dignified, evidence-based home health care that restores independence and supports patients, families, and caregivers as partners',
                'safe dignified evidence-based home health care',
              ],
              hint: 'Include the words safe, dignified, and evidence-based.',
            },
          ],
          rationale: 'The mission per EN-CM-001 (Enterprise Compliance Metrics Program) is the anchor for every operational decision and must be recallable on demand by all staff.',
          policyRef: 'EN-CM-001 (Enterprise Compliance Metrics Program)',
        },
        {
          id: 'GAO-001-FT-Q4',
          format: 'sequencing',
          prompt: 'Order the steps you take when you observe a value violation by a peer.',
          narration: 'Place the steps in the correct order for responding to a value violation by a peer.',
          steps: [
            { id: 's1', label: 'Document what you observed factually' },
            { id: 's2', label: 'Ensure no patient is in immediate harm' },
            { id: 's3', label: 'Report to your supervisor or Compliance Officer' },
            { id: 's4', label: 'Cooperate with any investigation and protect confidentiality' },
          ],
          correctOrder: ['s2', 's1', 's3', 's4'],
          rationale: 'Per EN-CM-001 (Enterprise Compliance Metrics Program) and CO-CP-005 (Whistleblower Protection): patient safety first, then objective documentation, then escalation, then cooperation. Reversing order risks the patient and investigation integrity.',
          policyRef: 'EN-CM-001 (Enterprise Compliance Metrics Program)',
        },
        {
          id: 'GAO-001-FT-Q5',
          format: 'true_false',
          prompt: 'The agency vision is to be the most trusted home health partner in our service area, measured by patient outcomes, satisfaction, and survey results.',
          narration: 'True or false: the agency vision is to be the most trusted home health partner in our service area, measured by patient outcomes, satisfaction, and survey results.',
          options: [
            { id: 't', label: 'True', isCorrect: true, feedback: 'Correct.' },
            { id: 'f', label: 'False', isCorrect: false, feedback: 'False — that is the stated vision per EN-CM-001.' },
          ],
          rationale: 'Directly stated in EN-CM-001 (Enterprise Compliance Metrics Program) lesson content: trust is earned visit by visit and lost in a single failure to act.',
          policyRef: 'EN-CM-001 (Enterprise Compliance Metrics Program)',
        },
        {
          id: 'GAO-001-FT-Q6',
          format: 'scenario_decision',
          prompt: 'A patient\'s adult son offers you a fifty-dollar bill at the end of a long visit "for all you do." What is the correct action?',
          narration: 'A patient\'s adult son offers you a fifty-dollar bill at the end of a long visit for all you do. Choose the correct response.',
          options: [
            { id: 'a', label: 'Accept politely to avoid offending the family and document later.', isCorrect: false, feedback: 'Accepting gifts violates integrity and creates perception of influence or kickback risk.' },
            { id: 'b', label: 'Thank him, explain you cannot accept gifts, document the offer and declination, complete your note, and inform your supervisor.', isCorrect: true, feedback: 'Correct. Maintains clear boundaries per policy.' },
            { id: 'c', label: 'Decline but do not document to avoid making the family feel bad.', isCorrect: false, feedback: 'Documentation of the interaction is required to protect boundaries and the record.' },
            { id: 'd', label: 'Accept and report it only if it exceeds one hundred dollars.', isCorrect: false, feedback: 'Any gift offer must be declined and documented regardless of amount.' },
          ],
          rationale: 'Per EN-CM-001 (Enterprise Compliance Metrics Program) lesson: thank, decline, document the offer and response, finish note before leaving, notify supervisor to maintain integrity and prevent influence perception.',
          policyRef: 'EN-CM-001 (Enterprise Compliance Metrics Program)',
        },
      ],
    },
  },
  {
    moduleId: 'GAO-002',
    policyRefs: ['GV-OG-001'],
    cmsRefs: [],
    estimatedDurationMin: 45,
    durationSource: 'DEFAULT',
    splash: {
      title: 'Organizational Structure and Reporting',
      subtitle: 'Who you report to and who reports to whom',
      whyItMatters:
        'Surveyors will ask any staff member to identify the Administrator, the DON, and the Compliance Officer, and to describe the chain of escalation. Inability to answer is a survey finding under 42 CFR 484.105.',
      narration:
        'In this module you will learn the organizational structure of the agency, the reporting lines, and how to escalate clinical, compliance, and HR concerns. Surveyors will ask any staff member to identify key leaders. Knowing this is not optional.',
      imageUrl: IMG.org,
    },
    navigation: {
      title: 'How This Training Works',
      body: 'One card at a time. Audio narration plays on every card. Challenges must be answered. Final test requires 80%.',
      bullets: ['Single-card view', 'Narration on every card', 'Challenges required', '80% to pass final test'],
      narration:
        'Before you begin: this training is one card at a time. Audio narration plays on every card. You must complete each challenge before continuing. The final test requires eighty percent to pass.',
    },
    lessons: [
      {
        id: 'GAO-002-L1',
        order: 1,
        title: 'Governing Body and Executive Roles',
        objectives: [
          'Identify the Governing Body, Administrator, DON, and Compliance Officer roles',
          'Describe the dual-reporting line of the Compliance Officer',
        ],
        cards: [
          {
            id: 'GAO-002-L1-S',
            type: 'summary',
            title: 'What You Will Learn',
            body: 'You will learn the four governance pillars: Governing Body, Administrator, Director of Nursing, and Compliance Officer â€” and how reporting lines flow.',
            narration:
              'In this lesson you will learn the four governance pillars of the agency: the Governing Body, the Administrator, the Director of Nursing, and the Compliance Officer. You will learn how reporting lines flow between them and to you.',
            estDurationSec: 30,
          },
          {
            id: 'GAO-002-L1-C1',
            type: 'content',
            title: 'Governing Body',
            body: 'The Governing Body holds final authority for agency operations under 42 CFR 484.105(a). It approves the budget, the scope of services, the QAPI program, and the Compliance Officer appointment. It meets at least quarterly and reviews compliance and quality reports.',
            narration:
              'The Governing Body holds final legal authority for agency operations. It approves the budget, the scope of services, the quality program, and the Compliance Officer appointment. It must meet at least quarterly and review compliance and quality reports at every meeting.',
            estDurationSec: 45,
          },
          {
            id: 'GAO-002-L1-C2',
            type: 'content',
            title: 'Administrator and Director of Nursing',
            body: 'The Administrator is responsible for day-to-day agency operations under 42 CFR 484.105(b). The Director of Nursing supervises clinical practice under 42 CFR 484.105(c). Both must be available during operating hours and must designate a qualified alternate during absences.',
            narration:
              'The Administrator is responsible for day-to-day agency operations. The Director of Nursing supervises all clinical practice. Both must be available during operating hours, and both must designate a qualified alternate when they are absent. Surveyors will verify that the alternate is documented.',
            estDurationSec: 50,
          },
          {
            id: 'GAO-002-L1-C3',
            type: 'content',
            title: 'Compliance Officer Dual Reporting',
            body: 'The Compliance Officer reports to BOTH the Administrator AND the Governing Body. This dual line is required by OIG guidance so that compliance issues cannot be suppressed by operations leadership. You may report concerns to the Compliance Officer directly.',
            narration:
              'The Compliance Officer reports to both the Administrator and the Governing Body. This dual reporting line is required by OIG guidance so that a compliance issue cannot be suppressed at the operational level. You may report any concern directly to the Compliance Officer without going through your supervisor.',
            estDurationSec: 50,
          },
          {
            id: 'GAO-002-L1-C4',
            type: 'content',
            title: 'Field Example: Reporting Structure in Action',
            body: 'You are an HHA and observe the RN case manager repeatedly skipping ordered wound measurements. You document your observations objectively. Per GV-OG-001 (Organizational Structure & Reporting), you call the Compliance Officer hotline rather than confronting the RN directly or going only to your HHA supervisor. The dual line ensures the concern reaches the Governing Body level if needed. You receive confirmation the report was received and no retaliation occurs.',
            narration: 'Field example. As an HHA you see the RN skip wound measurements on multiple visits. You document facts. Per GV-OG-001 you use the Compliance Officer hotline instead of only telling your supervisor or confronting the RN. The dual reporting line means the issue can reach the right level. You get confirmation and protection from retaliation.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-002-L1-C5',
            type: 'content',
            title: 'Knowing Your Chain for Surveys',
            body: 'Surveyors may ask you on the spot: "Who is your Administrator? Who is your DON? Who is the Compliance Officer? How do you report a concern if your supervisor is unavailable?" You must answer from memory using names and the hotline number posted in the office and on the employee portal. Practice these answers during orientation.',
            narration: 'Surveyors ask any staff these questions. Name the Administrator, DON, Compliance Officer, and the hotline. The numbers and names are posted in the office and on the portal. Learn them now so you can answer without hesitation.',
            estDurationSec: 45,
          },
          {
            id: 'GAO-002-L1-CH',
            type: 'challenge',
            title: 'Escalation Pathway',
            body: 'You suspect billing for visits that did not occur. Your supervisor seems involved.',
            narration:
              'A scenario. You suspect billing for visits that did not occur, and your direct supervisor appears to be involved. Choose the correct escalation path.',
            estDurationSec: 45,
            challenge: {
              id: 'GAO-002-L1-CH-Q',
              format: 'scenario_decision',
              prompt: 'What is the correct escalation path?',
              narration: 'What is the correct escalation path when a supervisor appears involved in a billing irregularity?',
              options: [
                { id: 'a', label: 'Confront the supervisor.', isCorrect: false, feedback: 'Confrontation can compromise the investigation and put you at risk.' },
                { id: 'b', label: 'Report directly to the Compliance Officer using the hotline.', isCorrect: true, feedback: 'Correct. Dual reporting protects you from retaliation and bypasses the implicated leader.' },
                { id: 'c', label: 'Wait until the next quarterly Governing Body meeting.', isCorrect: false, feedback: 'Delay risks ongoing fraud and Medicare overpayment. Reporting must be prompt.' },
                { id: 'd', label: 'Discuss it with co-workers first.', isCorrect: false, feedback: 'Spreading the concern compromises confidentiality and the investigation.' },
              ],
              policyRef: 'GV-OG-001',
              feedbackCorrect: 'Compliance Officer escalation through the hotline is the correct path. Dual reporting and whistleblower protection apply.',
              feedbackIncorrect: 'Any path that goes through, around, or delays past the implicated supervisor risks ongoing fraud and removes whistleblower protection.',
              complianceImpact: 'Suspected false claims must be reported under CO-CP-005; failure to report is itself a compliance violation.',
              realWorldConsequence: 'False claims expose the agency to treble damages under the False Claims Act and can trigger CMS payment suspension.',
              correctBehaviorGuidance: 'Use the Compliance Hotline. Document what you observed. Cooperate with investigation. Whistleblower retaliation is itself a separate violation.',
            },
          },
        ],
      },
      {
        id: 'GAO-002-L2',
        order: 2,
        title: 'Coverage and Continuity',
        objectives: [
          'Identify required leadership coverage during absences',
          'Describe how to find the on-call hierarchy',
        ],
        cards: [
          {
            id: 'GAO-002-L2-S',
            type: 'summary',
            title: 'Coverage Overview',
            body: 'You will learn the documented coverage hierarchy, the on-call schedule, and how to locate the alternate Administrator/DON in real time.',
            narration: 'In this lesson you will learn the documented coverage hierarchy, the on-call schedule, and how to locate the alternate Administrator and DON in real time.',
            estDurationSec: 35,
          },
          {
            id: 'GAO-002-L2-C1',
            type: 'content',
            title: 'On-Call Hierarchy',
            body: 'On-call hierarchy: primary on-call clinician, on-call DON, on-call Administrator. The roster is posted weekly in the EMR and texted to all field staff. Outdated rosters trigger a survey finding.',
            narration: 'The on-call hierarchy is: primary on-call clinician, on-call DON, on-call Administrator. The roster is posted weekly in the electronic medical record and is texted to every field staff member. An outdated roster is a survey finding.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-002-L2-C2',
            type: 'content',
            title: 'Designated Alternates',
            body: 'When the Administrator or DON is absent more than one business day, a qualified alternate is designated in writing and the workforce is notified. Alternates must meet the qualification standards in HR-JD-001 and HR-JD-002.',
            narration: 'When the Administrator or DON is absent more than one business day, a qualified alternate is designated in writing and the workforce is notified. Alternates must meet the qualification standards specified in their job descriptions.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-002-L2-C3',
            type: 'content',
            title: 'Field Example: Weekend Escalation',
            body: 'You are the on-call LVN and receive a call at 10 PM from an HHA who finds a patient unresponsive. You direct the HHA to call 911 and stay on scene, then you reach the on-call DON. Per GV-OG-001 you document every call attempt and decision in real time in the EMR while coordinating. The next morning the on-call Administrator receives a summary via the compliance log. The chain works because everyone knows their place in it.',
            narration: 'Field example. You are the LVN on call. Ten PM call: patient unresponsive. You tell the HHA to call nine-one-one and stay, you reach the DON. Per GV-OG-001 you log every step in the EMR. Next morning the Administrator gets the summary. The structure prevents dropped balls.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-002-L2-C4',
            type: 'content',
            title: 'Practical Tip: Always Verify the Roster',
            body: 'Before leaving the office on Friday, open the current on-call roster in the EMR and screenshot it to your agency phone. If cell service fails in the field you still have the names and numbers. This small habit prevents the common "I could not reach anyone" finding during survey.',
            narration: 'Practical tip. Friday afternoon, screenshot the on-call roster to your phone. If cell service drops in the field you still have the names and numbers. This habit prevents the common "could not reach anyone" citation.',
            estDurationSec: 40,
          },
          {
            id: 'GAO-002-L2-CH',
            type: 'challenge',
            title: 'Find the On-Call',
            body: 'It is Saturday at 21:00. You need clinical guidance on a possible adverse event. Who do you call first?',
            narration: 'A scenario. It is Saturday evening at twenty-one hundred. You need clinical guidance on a possible adverse drug event. Who do you call first?',
            estDurationSec: 40,
            challenge: {
              id: 'GAO-002-L2-CH-Q',
              format: 'scenario_decision',
              prompt: 'Who do you call first?',
              narration: 'Who do you call first?',
              options: [
                { id: 'a', label: 'The Administrator at home.', isCorrect: false, feedback: 'The Administrator is not the clinical first call.' },
                { id: 'b', label: 'The on-call clinician per the posted roster.', isCorrect: true, feedback: 'Correct. Clinical questions go to the on-call clinician first.' },
                { id: 'c', label: 'Wait until Monday.', isCorrect: false, feedback: 'Delay on a possible adverse event is unacceptable.' },
                { id: 'd', label: 'Call 911 regardless of severity.', isCorrect: false, feedback: 'Escalate clinically first; 911 is for emergencies that exceed home health response.' },
              ],
              policyRef: 'GV-OG-001',
              feedbackCorrect: 'On-call clinician is the first call for clinical guidance; the DON and Administrator escalate from there.',
              feedbackIncorrect: 'Skipping the clinical on-call breaks the chain of supervision required by 42 CFR 484.105.',
              complianceImpact: 'Inability to identify the on-call structure is a workforce-knowledge survey finding.',
              realWorldConsequence: 'Delayed escalation of adverse drug events has caused preventable hospitalizations and complaint surveys.',
              correctBehaviorGuidance: 'Carry the weekly on-call roster on your phone. Escalate in order. Document every call.',
            },
          },
        ],
      },
    ],
    finalTest: {
      id: 'GAO-002-FT',
      passingScorePct: 0.80,
      instructionsNarration: 'The final test confirms you can identify governance roles and escalation paths. Eighty percent is required.',
      failAction: 'remediation',
      questions: [
        {
          id: 'GAO-002-FT-Q1',
          format: 'matching',
          prompt: 'Match each role to its primary responsibility.',
          narration: 'Match each governance role to its primary responsibility.',
          matches: [
            { left: 'Governing Body', right: 'Approve scope of services and Compliance Officer appointment' },
            { left: 'Administrator', right: 'Day-to-day operations under 42 CFR 484.105(b)' },
            { left: 'Director of Nursing', right: 'Supervise all clinical practice' },
            { left: 'Compliance Officer', right: 'Receive and investigate compliance reports; reports to Administrator AND Governing Body' },
          ],
          rationale: 'Each role has a distinct survey-relevant accountability. Confusing them is a common survey finding.',
          policyRef: 'GV-OG-001',
        },
        {
          id: 'GAO-002-FT-Q2',
          format: 'true_false',
          prompt: 'The Compliance Officer reports only to the Administrator.',
          narration: 'True or false: the Compliance Officer reports only to the Administrator.',
          options: [
            { id: 't', label: 'True', isCorrect: false, feedback: 'False â€” the Compliance Officer has dual reporting to both Administrator and Governing Body.' },
            { id: 'f', label: 'False', isCorrect: true, feedback: 'Correct â€” dual reporting is required.' },
          ],
          rationale: 'Dual reporting prevents operational suppression of compliance issues.',
          policyRef: 'GV-OG-001',
        },
        {
          id: 'GAO-002-FT-Q3',
          format: 'sequencing',
          prompt: 'Order the steps for escalating a clinical concern when your supervisor is unavailable.',
          narration: 'Order the steps for escalating a clinical concern when your direct supervisor is unavailable.',
          steps: [
            { id: 's1', label: 'Stabilize the patient and ensure immediate safety' },
            { id: 's2', label: 'Contact the on-call DON or designated alternate' },
            { id: 's3', label: 'Document the action and notification objectively' },
            { id: 's4', label: 'Brief the regular supervisor on return' },
          ],
          correctOrder: ['s1', 's2', 's3', 's4'],
          rationale: 'Patient safety is always first. The DON or designated alternate is reachable 24/7.',
          policyRef: 'GV-OG-001',
        },
        {
          id: 'GAO-002-FT-Q4',
          format: 'structured_input',
          prompt: 'Name the role required to be available during all operating hours and to designate an alternate during absence.',
          narration: 'Name the role that must be available during all operating hours and that must designate a qualified alternate when absent.',
          fields: [
            {
              id: 'role',
              label: 'Role title',
              acceptableAnswers: ['Administrator', 'administrator', 'Director of Nursing', 'DON', 'Administrator and DON', 'both'],
              hint: 'There are two correct answers. Either is acceptable.',
            },
          ],
          rationale: 'Both the Administrator and the DON have this requirement under 42 CFR 484.105.',
          policyRef: 'GV-OG-001',
        },
      ],
    },
  },
  {
  moduleId: "GAO-003",
  policyRefs: [
    "GV-OG-003"
  ],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "Scope of Services",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Home health care is the provision of skilled medical services in a patient's home, ordered by a physician, and covered under Medicare Part A when specific eligibility criteria are met.",
    narration: "Welcome to GAO-003, Scope of Services. Home health care is the provision of skilled medical services in a patient's home, ordered by a physician, and covered under Medicare Part A when specific eligibility criteria are met."
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
      id: "GAO-003-L1",
      order: 1,
      title: "What Home Health Care Is",
      objectives: [
        "Apply key requirements from What Home Health Care Is",
        "Identify correct field actions related to What Home Health Care Is"
      ],
      cards: [
        {
          id: "GAO-003-L1-S",
          type: "summary",
          title: "What Home Health Care Is",
          body: "Home health care is the provision of skilled medical services in a patient's home, ordered by a physician, and covered under Medicare Part A when specific eligibility criteria are met.",
          narration: "In this lesson: What Home Health Care Is. Home health care is the provision of skilled medical services in a patient's home, ordered by a physician, and covered under Medicare Part A when specific eligibility criteria are met.",
          estDurationSec: 45
        },
        {
          id: "GAO-003-L1-C1",
          type: "content",
          title: "What Home Health Care Is",
          body: "Home health care is the provision of skilled medical services in a patient's home, ordered by a physician, and covered under Medicare Part A when specific eligibility criteria are met.",
          narration: "Home health care is the provision of skilled medical services in a patient's home, ordered by a physician, and covered under Medicare Part A when specific eligibility criteria are met. Understanding the scope of services that Care Indeed provides is essential for every employee because it defines the boundaries of what you can and cannot do, what the agency is authorized to deliver, and what patients are entitled to receive. To qualify for Medicare home health services under 42 CFR Section 484.55, five eligibility criteria must be met simultaneously. First, the patient must be homebound, meaning they are confined to their home due to their medical condition. Homebound does not mean the patient can never leave the house. It means that leaving home requires considerable and taxing effort, and absences are infrequent, short in duration, or for medical treatment. A patient who goes to dialysis three times a week can",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L1-C2",
          type: "content",
          title: "What Home Health Care Is (part 2)",
          body: "still be homebound. A patient who drives to the grocery store and attends social events regularly is likely not homebound. Second, the patient must need skilled services.",
          narration: "still be homebound. A patient who drives to the grocery store and attends social events regularly is likely not homebound. Second, the patient must need skilled services. This means the patient requires nursing care, physical therapy, occupational therapy, or speech-language pathology services that can only be performed safely and effectively by a licensed professional or under the supervision of one. Skilled need is the qualifying requirement. Without it, no amount of homebound status or physician orders qualifies a patient for Medicare home health. Third, services must be physician-ordered with an individualized plan of care. The physician or allowed practitioner must certify the patient's eligibility, establish the plan of care, and sign the orders. The plan of care is not a suggestion or a template. It is a legal document that specifies exactly which services will be provided, by which disciplines, at what frequency, for what duration, and with what goals.",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L1-C3",
          type: "content",
          title: "What Home Health Care Is (part 3)",
          body: "Fourth, services must be intermittent, meaning they are not continuous twenty-four-hour care. Medicare home health is designed for periodic skilled visits, typically ranging from daily to a few times per week, with each visit lasting a defined period.",
          narration: "Fourth, services must be intermittent, meaning they are not continuous twenty-four-hour care. Medicare home health is designed for periodic skilled visits, typically ranging from daily to a few times per week, with each visit lasting a defined period. Patients who require around-the-clock nursing care are not appropriate for intermittent home health services. Fifth, the patient must meet the face-to-face encounter requirement. A physician or allowed practitioner must have a face-to-face encounter with the patient within specified timeframes related to the start of care. This ensures a physician has actually seen and evaluated the patient before certifying them for home health. Understanding these five criteria prevents two critical errors in your daily work. The first error is providing services the agency is not authorized to provide, which can result in Medicare fraud allegations, denied claims, and survey deficiencies. The second error is failing to provide services the patient is entitled to",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L1-C4",
          type: "content",
          title: "What Home Health Care Is (part 4)",
          body: "receive, which can result in patient harm, unmet needs, and complaints to CMS.",
          narration: "receive, which can result in patient harm, unmet needs, and complaints to CMS.",
          estDurationSec: 35
        },
        {
          id: "GAO-003-L1-CH",
          type: "challenge",
          title: "Knowledge Check 1 Q: A patient leaves home twice a week for…",
          body: "Knowledge Check 1 Q: A patient leaves home twice a week for dialysis and once a month for a physician appointment. Can they be considered homebound? A: Yes. Homebound status allows absences for medical treatment.",
          narration: "Knowledge Check 1 Q: A patient leaves home twice a week for dialysis and once a month for a physician appointment. Can they be considered homebound? A: Yes. Homebound status allows absences for medical treatment. Dialysis and physician visits are medical purposes.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-003-L1-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 1 Q: A patient leaves home twice a week for dialysis and once a month for a physician appointment. Can they be considered homebound? A: Yes. Homebound status allows absences for medical treatment. Dialysis and physician visits are medical purposes.",
            narration: "Knowledge Check 1 Q: A patient leaves home twice a week for dialysis and once a month for a physician appointment. Can they be considered homebound? A: Yes. Homebound status allows absences for medical treatment. Dialysis and physician visits are medical purposes.",
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
            policyRef: "GV-OG-003",
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
      id: "GAO-003-L2",
      order: 2,
      title: "Services We Provide",
      objectives: [
        "Apply key requirements from Services We Provide",
        "Identify correct field actions related to Services We Provide"
      ],
      cards: [
        {
          id: "GAO-003-L2-S",
          type: "summary",
          title: "Services We Provide",
          body: "Care Indeed provides six categories of skilled home health services, each defined by the CMS Conditions of Participation and delivered by qualified professionals who meet specific personnel requirements.",
          narration: "In this lesson: Services We Provide. Care Indeed provides six categories of skilled home health services, each defined by the CMS Conditions of Participation and delivered by qualified professionals who meet specific personnel requirements. Skilled nursing is provided by registered nurses and licensed vocational nurses under 42 CFR Section 484.115 subsections (a) and (c).",
          estDurationSec: 45
        },
        {
          id: "GAO-003-L2-C1",
          type: "content",
          title: "Services We Provide",
          body: "Care Indeed provides six categories of skilled home health services, each defined by the CMS Conditions of Participation and delivered by qualified professionals who meet specific personnel requirements.",
          narration: "Care Indeed provides six categories of skilled home health services, each defined by the CMS Conditions of Participation and delivered by qualified professionals who meet specific personnel requirements. Skilled nursing is provided by registered nurses and licensed vocational nurses under 42 CFR Section 484.115 subsections (a) and (c). RNs perform comprehensive assessments, develop and update care plans, manage complex wound care, administer medications, provide patient and caregiver education, and coordinate the interdisciplinary team. LVNs provide skilled nursing services under the supervision of an RN or the Director of Nursing, including medication administration, wound care, and patient monitoring within their scope of practice. Physical therapy is provided by physical therapists and physical therapist assistants under Section 484.115 subsections (d) and (e). PTs evaluate functional limitations, develop treatment plans, provide therapeutic exercise and mobility training, assess assistive device needs, and establish home exercise programs. PTAs deliver PT interventions under the direct supervision",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L2-C2",
          type: "content",
          title: "Services We Provide (part 2)",
          body: "of the PT. A PTA cannot evaluate, develop a treatment plan, or discharge a patient from therapy. Occupational therapy is provided by occupational therapists and certified occupational therapy assistants under Section 484.115 subsections (f) and (g).",
          narration: "of the PT. A PTA cannot evaluate, develop a treatment plan, or discharge a patient from therapy. Occupational therapy is provided by occupational therapists and certified occupational therapy assistants under Section 484.115 subsections (f) and (g). OTs evaluate the patient's ability to perform activities of daily living, recommend adaptive equipment, provide upper extremity rehabilitation, and develop strategies for functional independence. COTAs deliver OT interventions under the direct supervision of the OT. Speech-language pathology is provided by speech-language pathologists under Section 484.115 subsection (h). SLPs evaluate and treat speech, language, cognitive, and swallowing disorders. In home health, swallowing evaluation and treatment is a particularly critical service because dysphagia creates aspiration pneumonia risk, which is a leading cause of hospitalization and mortality in the home health population. Medical social services are provided by medical social workers under Section 484.115 subsection (i). MSWs address psychosocial barriers to care, connect patients and families with",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L2-C3",
          type: "content",
          title: "Services We Provide (part 3)",
          body: "community resources, provide counseling for adjustment to illness, assist with advance directive planning, and help resolve financial or insurance barriers that affect the patient's ability to receive care. Home health aide services are provided by home health aides under 42 CFR Section 484.80.",
          narration: "community resources, provide counseling for adjustment to illness, assist with advance directive planning, and help resolve financial or insurance barriers that affect the patient's ability to receive care. Home health aide services are provided by home health aides under 42 CFR Section 484.80. HHAs provide personal care, assistance with activities of daily living, health-related tasks as delegated by the RN, vital signs monitoring, and patient observation. HHA services must be part of the plan of care and supervised by an RN. The RN must make a supervisory visit to the patient's home at least every fourteen days during the first sixty days and every sixty days thereafter to observe the HHA providing care and assess whether the aide services continue to meet the patient's needs. Each of these services must be physician-ordered as part of a comprehensive plan of care, and the clinician providing the service must meet the personnel",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L2-C4",
          type: "content",
          title: "Services We Provide (part 4)",
          body: "qualifications defined in the CMS Conditions of Participation. No service can be added, removed, or modified without a corresponding physician order and care plan update. ---",
          narration: "qualifications defined in the CMS Conditions of Participation. No service can be added, removed, or modified without a corresponding physician order and care plan update. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-003-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Services We Provide\"?",
          narration: "What is the key takeaway from \"Services We Provide\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-003-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Services We Provide\"?",
            narration: "What is the key takeaway from \"Services We Provide\"?",
            options: [
              {
                id: "a",
                label: "Care Indeed provides six categories of skilled home health services, each defined by the CMS Conditions of Participation and delivered by qualified professionals who meet specific…",
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
            policyRef: "GV-OG-003",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Care Indeed provides six categories of skilled home health services, each defined by the CMS Conditions of Participation and delivered by qualified professionals who meet specific personnel requirements."
          }
        }
      ]
    },
    {
      id: "GAO-003-L3",
      order: 3,
      title: "Scope Boundaries",
      objectives: [
        "Apply key requirements from Scope Boundaries",
        "Identify correct field actions related to Scope Boundaries"
      ],
      cards: [
        {
          id: "GAO-003-L3-S",
          type: "summary",
          title: "Scope Boundaries",
          body: "It is equally important to understand what Care Indeed does not provide. Operating outside the agency's authorized scope creates serious legal, financial, and patient safety risks. We do not provide twenty-four-hour continuous care. Medicare home health is designed for intermittent skilled visits.",
          narration: "In this lesson: Scope Boundaries. It is equally important to understand what Care Indeed does not provide. Operating outside the agency's authorized scope creates serious legal, financial, and patient safety risks. We do not provide twenty-four-hour continuous care. Medicare home health is designed for intermittent skilled visits.",
          estDurationSec: 45
        },
        {
          id: "GAO-003-L3-C1",
          type: "content",
          title: "Scope Boundaries",
          body: "It is equally important to understand what Care Indeed does not provide. Operating outside the agency's authorized scope creates serious legal, financial, and patient safety risks. We do not provide twenty-four-hour continuous care. Medicare home health is designed for intermittent skilled visits.",
          narration: "It is equally important to understand what Care Indeed does not provide. Operating outside the agency's authorized scope creates serious legal, financial, and patient safety risks. We do not provide twenty-four-hour continuous care. Medicare home health is designed for intermittent skilled visits. If a patient's condition deteriorates to the point where they need round-the-clock nursing care, the appropriate response is to communicate with the physician, update the care plan, and potentially recommend a higher level of care such as inpatient hospitalization or skilled nursing facility placement. We do not provide custodial care only. Custodial care means assistance with activities of daily living without a skilled need. If a patient's only need is help with bathing and dressing but they do not require nursing, therapy, or other skilled services, they do not qualify for Medicare home health. Home health aide services are only covered when there is a qualifying skilled need",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L3-C2",
          type: "content",
          title: "Scope Boundaries (part 2)",
          body: "that also requires aide support as part of the care plan. We do not provide physician services. Care Indeed clinicians execute physician orders. We do not write orders, prescribe medications, or make medical diagnoses.",
          narration: "that also requires aide support as part of the care plan. We do not provide physician services. Care Indeed clinicians execute physician orders. We do not write orders, prescribe medications, or make medical diagnoses. If a patient's condition changes and new orders are needed, the clinician contacts the physician, provides clinical information, and requests orders. The physician makes the medical decision. We do not dispense durable medical equipment. While Care Indeed clinicians may assess the need for DME, train patients on its use, and coordinate delivery with DME suppliers, we do not supply the equipment itself. This is a separate Medicare benefit category with its own suppliers and billing. We do not provide services outside our California license scope. Care Indeed is licensed to operate in specific geographic areas and provide specific categories of service as defined by the California Department of Public Health. Providing services outside the licensed scope",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L3-C3",
          type: "content",
          title: "Scope Boundaries (part 3)",
          body: "can result in licensure action, fines, or agency closure. And critically, we never provide services that are not on the physician's plan of care. Even if a service seems clinically appropriate, if it is not ordered and documented on the plan of care, we cannot provide it.",
          narration: "can result in licensure action, fines, or agency closure. And critically, we never provide services that are not on the physician's plan of care. Even if a service seems clinically appropriate, if it is not ordered and documented on the plan of care, we cannot provide it. The correct response is to communicate the identified need to the physician, request an order, update the plan of care, and then provide the service once authorized. Why does this matter practically? Because patients and families will sometimes ask you to do things outside the plan of care. A family member might ask you to check on their spouse's blood sugar even though diabetes management is not on the care plan. A patient might ask you to help rearrange furniture. A caregiver might ask for medical advice about their own health condition. In each case, the correct response is to politely explain that",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L3-C4",
          type: "content",
          title: "Scope Boundaries (part 4)",
          body: "you can only provide services that are ordered on the plan of care, and to help them access the appropriate resource for their request.",
          narration: "you can only provide services that are ordered on the plan of care, and to help them access the appropriate resource for their request. Providing out-of-scope services can result in Medicare fraud allegations if the service is billed, survey deficiencies if identified during a review, licensure sanctions if the service is outside your professional scope, malpractice liability if the patient is harmed, and patient harm if the service is provided by someone not qualified to deliver it.",
          estDurationSec: 35
        },
        {
          id: "GAO-003-L3-CH",
          type: "challenge",
          title: "Scenario Challenge 1 Scenario: A patient's daughter asks…",
          body: "Scenario Challenge 1 Scenario: A patient's daughter asks you to check her own blood pressure during your visit with the patient. She says she has been feeling dizzy and her doctor appointment is not for two weeks.",
          narration: "Scenario Challenge 1 Scenario: A patient's daughter asks you to check her own blood pressure during your visit with the patient. She says she has been feeling dizzy and her doctor appointment is not for two weeks.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-003-L3-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 1 Scenario: A patient's daughter asks you to check her own blood pressure during your visit with the patient. She says she has been feeling dizzy and her doctor appointment is not for two weeks.",
            narration: "Scenario Challenge 1 Scenario: A patient's daughter asks you to check her own blood pressure during your visit with the patient. She says she has been feeling dizzy and her doctor appointment is not for two weeks.",
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
            policyRef: "GV-OG-003",
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
      id: "GAO-003-L4",
      order: 4,
      title: "The Interdisciplinary Team",
      objectives: [
        "Apply key requirements from The Interdisciplinary Team",
        "Identify correct field actions related to The Interdisciplinary Team"
      ],
      cards: [
        {
          id: "GAO-003-L4-S",
          type: "summary",
          title: "The Interdisciplinary Team",
          body: "Home health is not siloed. A single patient may receive visits from an RN, PT, OT, SLP, MSW, and HHA, all coordinated through the plan of care.",
          narration: "In this lesson: The Interdisciplinary Team. Home health is not siloed. A single patient may receive visits from an RN, PT, OT, SLP, MSW, and HHA, all coordinated through the plan of care. Understanding how the interdisciplinary team works is essential because most clinical errors in home health are not caused by lack of skill but by lack of communication between disciplines. The plan of care is the central coordination document.",
          estDurationSec: 45
        },
        {
          id: "GAO-003-L4-C1",
          type: "content",
          title: "The Interdisciplinary Team",
          body: "Home health is not siloed. A single patient may receive visits from an RN, PT, OT, SLP, MSW, and HHA, all coordinated through the plan of care.",
          narration: "Home health is not siloed. A single patient may receive visits from an RN, PT, OT, SLP, MSW, and HHA, all coordinated through the plan of care. Understanding how the interdisciplinary team works is essential because most clinical errors in home health are not caused by lack of skill but by lack of communication between disciplines. The plan of care is the central coordination document. Every discipline providing services to a patient references the same plan of care. It specifies each discipline's involvement, visit frequency, goals, and interventions. When you document a visit, you are contributing to the interdisciplinary record that every other team member will reference. All disciplines must communicate findings that affect other disciplines. This is not optional and it is not something that can wait until the next case conference. If a physical therapist notes that a patient has difficulty swallowing during exercises, the PT must communicate",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L4-C2",
          type: "content",
          title: "The Interdisciplinary Team (part 2)",
          body: "this to the RN immediately, who may request a physician order for an SLP evaluation. If a home health aide observes a new skin breakdown during personal care, the aide must report it to the supervising RN the same day so the RN can assess and update the care plan.",
          narration: "this to the RN immediately, who may request a physician order for an SLP evaluation. If a home health aide observes a new skin breakdown during personal care, the aide must report it to the supervising RN the same day so the RN can assess and update the care plan. The RN coordinates overall patient care in home health. While each discipline manages its own interventions, the RN serves as the care coordinator who ensures all disciplines are working toward consistent goals, the plan of care reflects the patient's current status, physician communication is timely, and changes in condition are addressed across all disciplines simultaneously. The Director of Nursing oversees the entire clinical team. The DON is responsible for ensuring that the interdisciplinary process functions effectively, that case conferences occur regularly, that supervision requirements are met, and that clinical quality standards are maintained across all disciplines. Case conferences bring the",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L4-C3",
          type: "content",
          title: "The Interdisciplinary Team (part 3)",
          body: "interdisciplinary team together to review complex patients, address coordination challenges, and align care goals. During case conferences, each discipline reports on the patient's progress, any concerns identified, and recommendations for care plan changes.",
          narration: "interdisciplinary team together to review complex patients, address coordination challenges, and align care goals. During case conferences, each discipline reports on the patient's progress, any concerns identified, and recommendations for care plan changes. These conferences are documented and serve as evidence of interdisciplinary coordination during surveys. Your role in interdisciplinary coordination depends on your discipline, but the core principle applies to everyone: if you see something that affects another discipline, communicate it now, not later. Do not assume someone else will notice. Do not assume the other discipline will read your visit note. Pick up the phone, send a secure message, or speak to the person directly. The patient's safety depends on real-time communication, not assumptions. The most common coordination failures in home health involve delayed communication of falls or near-falls, failure to report changes in skin integrity across disciplines, medication discrepancies identified during visits but not communicated to the",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L4-C4",
          type: "content",
          title: "The Interdisciplinary Team (part 4)",
          body: "prescribing physician, and changes in patient functional status that affect multiple disciplines' treatment plans but are only documented in one discipline's notes.",
          narration: "prescribing physician, and changes in patient functional status that affect multiple disciplines' treatment plans but are only documented in one discipline's notes.",
          estDurationSec: 35
        },
        {
          id: "GAO-003-L4-CH",
          type: "challenge",
          title: "Knowledge Check 2 Q: An HHA notices during personal care…",
          body: "Knowledge Check 2 Q: An HHA notices during personal care that the patient has a new area of redness on their sacrum. The HHA's next visit is in two days.",
          narration: "Knowledge Check 2 Q: An HHA notices during personal care that the patient has a new area of redness on their sacrum. The HHA's next visit is in two days. When should they report this? A: The same day, immediately after the visit. New skin findings must be reported to the supervising RN promptly, not at the next visit.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-003-L4-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 2 Q: An HHA notices during personal care that the patient has a new area of redness on their sacrum. The HHA's next visit is in two days. When should they report this? A: The same day, immediately after the visit.",
            narration: "Knowledge Check 2 Q: An HHA notices during personal care that the patient has a new area of redness on their sacrum. The HHA's next visit is in two days. When should they report this? A: The same day, immediately after the visit.",
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
            policyRef: "GV-OG-003",
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
      id: "GAO-003-L5",
      order: 5,
      title: "Module Summary",
      objectives: [
        "Apply key requirements from Module Summary",
        "Identify correct field actions related to Module Summary"
      ],
      cards: [
        {
          id: "GAO-003-L5-S",
          type: "summary",
          title: "Module Summary",
          body: "Let us summarize the key principles you need to carry forward from this module. Home health care is skilled, intermittent, physician-ordered services provided in the patient's home.",
          narration: "In this lesson: Module Summary. Let us summarize the key principles you need to carry forward from this module. Home health care is skilled, intermittent, physician-ordered services provided in the patient's home. The five Medicare eligibility criteria are homebound status, skilled need, physician orders with a plan of care, intermittent services, and the face-to-face encounter requirement.",
          estDurationSec: 45
        },
        {
          id: "GAO-003-L5-C1",
          type: "content",
          title: "Module Summary",
          body: "Let us summarize the key principles you need to carry forward from this module. Home health care is skilled, intermittent, physician-ordered services provided in the patient's home.",
          narration: "Let us summarize the key principles you need to carry forward from this module. Home health care is skilled, intermittent, physician-ordered services provided in the patient's home. The five Medicare eligibility criteria are homebound status, skilled need, physician orders with a plan of care, intermittent services, and the face-to-face encounter requirement. All five must be met simultaneously for a patient to qualify. If even one criterion is not met, the patient is not eligible for Medicare home health, and services provided would not be reimbursable. Care Indeed provides six service lines: skilled nursing by RNs and LVNs, physical therapy by PTs and PTAs, occupational therapy by OTs and COTAs, speech-language pathology by SLPs, medical social services by MSWs, and home health aide services by HHAs. Each service is governed by specific CMS personnel qualification requirements, and each must be ordered by a physician as part of the plan of care.",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L5-C2",
          type: "content",
          title: "Module Summary (part 2)",
          body: "Out-of-scope services create serious risk. We do not provide continuous care, custodial-only care, physician services, DME dispensing, services outside our license scope, or services not on the plan of care.",
          narration: "Out-of-scope services create serious risk. We do not provide continuous care, custodial-only care, physician services, DME dispensing, services outside our license scope, or services not on the plan of care. When patients or families request something outside scope, the correct response is to explain the limitation politely and help connect them with the appropriate resource. Interdisciplinary coordination through the plan of care is a CMS requirement and a patient safety imperative. The plan of care is the central document. The RN coordinates care across disciplines. The DON oversees the clinical team. Case conferences align goals. And most importantly, when you observe something that affects another discipline, you communicate it immediately. For your daily practice, remember these action items. Before every visit, review the plan of care to confirm what services you are authorized to provide. During every visit, document what you actually did, what you observed, and what you communicated.",
          estDurationSec: 64
        },
        {
          id: "GAO-003-L5-C3",
          type: "content",
          title: "Module Summary (part 3)",
          body: "If a patient or family requests something outside the plan of care, politely redirect and contact your supervisor or the physician if a care plan change may be warranted. If you observe something clinically relevant to another discipline, communicate it the same day by phone, secure message, or in person.",
          narration: "If a patient or family requests something outside the plan of care, politely redirect and contact your supervisor or the physician if a care plan change may be warranted. If you observe something clinically relevant to another discipline, communicate it the same day by phone, secure message, or in person. Know the boundaries. Providing services outside the authorized scope is not going above and beyond. It is a compliance violation that puts you, the patient, and the agency at risk. Stay within your scope, stay within the plan of care, and communicate proactively. That is how you deliver safe, compliant, high-quality care at Care Indeed. You are now ready to proceed to the final exam. The exam contains ten questions. You need eighty percent or higher to pass.",
          estDurationSec: 55
        },
        {
          id: "GAO-003-L5-CH",
          type: "challenge",
          title: "Scenario Challenge 2 Scenario: During a skilled nursing…",
          body: "Scenario Challenge 2 Scenario: During a skilled nursing visit, the patient tells you they feel their physical therapy is not helping and they want to stop PT. They ask you to just cancel it.",
          narration: "Scenario Challenge 2 Scenario: During a skilled nursing visit, the patient tells you they feel their physical therapy is not helping and they want to stop PT. They ask you to just cancel it. Expected Response: Explain that you cannot discontinue another discipline's services.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-003-L5-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 2 Scenario: During a skilled nursing visit, the patient tells you they feel their physical therapy is not helping and they want to stop PT. They ask you to just cancel it. Expected Response: Explain that you cannot discontinue another discipline's services.",
            narration: "Scenario Challenge 2 Scenario: During a skilled nursing visit, the patient tells you they feel their physical therapy is not helping and they want to stop PT. They ask you to just cancel it. Expected Response: Explain that you cannot discontinue another discipline's services.",
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
            policyRef: "GV-OG-003",
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
    id: "GAO-003-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Scope of Services. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which of the following is NOT a Medicare home health eligibility criterion?",
        narration: "Which of the following is NOT a Medicare home health eligibility criterion?",
        options: [
          {
            id: "a",
            label: "Patient is homebound -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Services are physician-ordered -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Patient requires 24-hour continuous care -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Patient needs skilled services",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q1 from AAA Record v2.0 for GAO-003.",
        policyRef: "GV-OG-003"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "A patient's family asks you to help with tasks not on the plan of care. What should you do?",
        narration: "A patient's family asks you to help with tasks not on the plan of care. What should you do?",
        options: [
          {
            id: "a",
            label: "Help them since you are already there -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Politely decline and explain you can only provide services ordered on the plan of care -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Do the tasks but do not document them -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Ask the family to pay out-of-pocket for the extra services",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q2 from AAA Record v2.0 for GAO-003.",
        policyRef: "GV-OG-003"
      },
      {
        id: "q3",
        format: "scenario_decision",
        prompt: "Which document serves as the central coordination tool for the interdisciplinary team?",
        narration: "Which document serves as the central coordination tool for the interdisciplinary team?",
        options: [
          {
            id: "a",
            label: "The employee handbook -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "The OASIS assessment -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "The plan of care -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "The discharge summary",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q3 from AAA Record v2.0 for GAO-003.",
        policyRef: "GV-OG-003"
      },
      {
        id: "q4",
        format: "scenario_decision",
        prompt: "Care Indeed provides which of the following?",
        narration: "Care Indeed provides which of the following?",
        options: [
          {
            id: "a",
            label: "24-hour live-in care -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Intermittent skilled home health services -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Physician diagnostic services -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Durable medical equipment dispensing",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q4 from AAA Record v2.0 for GAO-003.",
        policyRef: "GV-OG-003"
      },
      {
        id: "q5",
        format: "scenario_decision",
        prompt: "If a PT notices a patient has swallowing difficulty during therapy, what should the PT do?",
        narration: "If a PT notices a patient has swallowing difficulty during therapy, what should the PT do?",
        options: [
          {
            id: "a",
            label: "Document it and wait for the next case conference -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Communicate immediately to the RN for possible SLP referral -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Attempt to assess the swallowing themselves -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Ignore it since swallowing is outside PT scope",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q5 from AAA Record v2.0 for GAO-003.",
        policyRef: "GV-OG-003"
      },
      {
        id: "q6",
        format: "scenario_decision",
        prompt: "What does homebound mean under Medicare home health eligibility?",
        narration: "What does homebound mean under Medicare home health eligibility?",
        options: [
          {
            id: "a",
            label: "The patient can never leave their home -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Leaving home requires considerable and taxing effort, and absences are infrequent or for medical treatment -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "The patient lives alone with no transportation -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "The patient has a physician order stating they are homebound",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q6 from AAA Record v2.0 for GAO-003.",
        policyRef: "GV-OG-003"
      },
      {
        id: "q7",
        format: "scenario_decision",
        prompt: "Which role coordinates overall patient care across all disciplines in home health?",
        narration: "Which role coordinates overall patient care across all disciplines in home health?",
        options: [
          {
            id: "a",
            label: "The Administrator -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "The physician -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "The RN -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "The medical social worker",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q7 from AAA Record v2.0 for GAO-003.",
        policyRef: "GV-OG-003"
      },
      {
        id: "q8",
        format: "scenario_decision",
        prompt: "A patient asks you to provide a service that seems clinically appropriate but is not on the plan of care. What is correct?",
        narration: "A patient asks you to provide a service that seems clinically appropriate but is not on the plan of care. What is correct?",
        options: [
          {
            id: "a",
            label: "Provide the service because it benefits the patient -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Provide the service and add it to your documentation -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Contact the physician to request an order and care plan update before providing the service -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Provide the service but do not bill for it",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q8 from AAA Record v2.0 for GAO-003.",
        policyRef: "GV-OG-003"
      },
      {
        id: "q9",
        format: "scenario_decision",
        prompt: "How often must an RN make a supervisory visit to observe an HHA providing care during the first 60 days?",
        narration: "How often must an RN make a supervisory visit to observe an HHA providing care during the first 60 days?",
        options: [
          {
            id: "a",
            label: "Every 7 days -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Every 14 days -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Every 30 days -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Every 60 days",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q9 from AAA Record v2.0 for GAO-003.",
        policyRef: "GV-OG-003"
      },
      {
        id: "q10",
        format: "scenario_decision",
        prompt: "What is the primary risk of providing out-of-scope services?",
        narration: "What is the primary risk of providing out-of-scope services?",
        options: [
          {
            id: "a",
            label: "The patient may be dissatisfied -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "The visit may take longer than scheduled -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Medicare fraud allegations, survey deficiencies, licensure sanctions, and patient harm -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "The agency may need to hire additional staff",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q10 from AAA Record v2.0 for GAO-003.",
        policyRef: "GV-OG-003"
      }
    ]
  }
},
  {
  moduleId: "GAO-004",
  policyRefs: [
    "CO-CP-001",
    "CO-CP-004"
  ],
  cmsRefs: [],
  estimatedDurationMin: 35,
  durationSource: "DEFAULT",
  splash: {
    title: "Corporate Compliance Program",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Care Indeed maintains a Corporate Compliance Program under policy CO-CP-001 to prevent, detect, and correct violations of federal and state laws, regulations, and internal policies.",
    narration: "Welcome to GAO-004, Corporate Compliance Program. Care Indeed maintains a Corporate Compliance Program under policy CO-CP-001 to prevent, detect, and correct violations of federal and state laws, regulations, and internal policies."
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
      id: "GAO-004-L1",
      order: 1,
      title: "Why Compliance Matters",
      objectives: [
        "Apply key requirements from Why Compliance Matters",
        "Identify correct field actions related to Why Compliance Matters"
      ],
      cards: [
        {
          id: "GAO-004-L1-S",
          type: "summary",
          title: "Why Compliance Matters",
          body: "Care Indeed maintains a Corporate Compliance Program under policy CO-CP-001 to prevent, detect, and correct violations of federal and state laws, regulations, and internal policies.",
          narration: "In this lesson: Why Compliance Matters. Care Indeed maintains a Corporate Compliance Program under policy CO-CP-001 to prevent, detect, and correct violations of federal and state laws, regulations, and internal policies. This module is one of the most important in your entire orientation because the consequences of noncompliance in home health care are severe, personal, and real. The stakes are not theoretical.",
          estDurationSec: 45
        },
        {
          id: "GAO-004-L1-C1",
          type: "content",
          title: "Why Compliance Matters",
          body: "Care Indeed maintains a Corporate Compliance Program under policy CO-CP-001 to prevent, detect, and correct violations of federal and state laws, regulations, and internal policies.",
          narration: "Care Indeed maintains a Corporate Compliance Program under policy CO-CP-001 to prevent, detect, and correct violations of federal and state laws, regulations, and internal policies. This module is one of the most important in your entire orientation because the consequences of noncompliance in home health care are severe, personal, and real. The stakes are not theoretical. Medicare and Medicaid fraud carries federal criminal penalties including imprisonment. False Claims Act violations under 31 USC Section 3729 result in treble damages, meaning three times the amount of the false claim, plus civil penalties exceeding eleven thousand dollars per false claim submitted. Exclusion from federal healthcare programs means the agency can no longer bill Medicare or Medicaid, which for most home health agencies means closure. And individual employees can be personally liable — this is not just an agency-level risk. The Office of Inspector General recovers billions of dollars annually from healthcare fraud",
          estDurationSec: 64
        },
        {
          id: "GAO-004-L1-C2",
          type: "content",
          title: "Why Compliance Matters (part 2)",
          body: "cases. Home health care has historically been one of the most targeted sectors for fraud enforcement actions. Cases involve agencies billing for visits that never occurred, falsifying OASIS assessments to increase reimbursement, providing medically unnecessary services to generate revenue, and paying kickbacks for…",
          narration: "cases. Home health care has historically been one of the most targeted sectors for fraud enforcement actions. Cases involve agencies billing for visits that never occurred, falsifying OASIS assessments to increase reimbursement, providing medically unnecessary services to generate revenue, and paying kickbacks for patient referrals. In these cases, individual clinicians who participated in the fraud have been prosecuted, fined, excluded from healthcare programs, and in some cases sentenced to prison. You might think this does not apply to you because you are not involved in billing or coding. That assumption is dangerous. Every clinician who documents a visit creates the foundation for a billing claim. If you document that you provided a service you did not actually provide, that documentation becomes the basis for a false claim. If you falsify visit times, patient assessments, or clinical findings, you are creating the raw material for potential fraud — even if you",
          estDurationSec: 64
        },
        {
          id: "GAO-004-L1-C3",
          type: "content",
          title: "Why Compliance Matters (part 3)",
          body: "never touch the billing system. Care Indeed's Corporate Compliance Program is designed to prevent these situations by establishing clear rules, providing training, creating reporting channels, monitoring for problems, and responding promptly when issues arise.",
          narration: "never touch the billing system. Care Indeed's Corporate Compliance Program is designed to prevent these situations by establishing clear rules, providing training, creating reporting channels, monitoring for problems, and responding promptly when issues arise. Your responsibility as an employee is to understand the compliance program, follow its requirements, and use the reporting channels when you see something that concerns you.",
          estDurationSec: 35
        },
        {
          id: "GAO-004-L1-CH",
          type: "challenge",
          title: "Knowledge Check 1 Q: Can an individual clinician be…",
          body: "Knowledge Check 1 Q: Can an individual clinician be personally liable for Medicare fraud even if they did not submit the billing claim? A: Yes.",
          narration: "Knowledge Check 1 Q: Can an individual clinician be personally liable for Medicare fraud even if they did not submit the billing claim? A: Yes.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-004-L1-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 1 Q: Can an individual clinician be personally liable for Medicare fraud even if they did not submit the billing claim? A: Yes.",
            narration: "Knowledge Check 1 Q: Can an individual clinician be personally liable for Medicare fraud even if they did not submit the billing claim? A: Yes.",
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
            policyRef: "CO-CP-001",
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
      id: "GAO-004-L2",
      order: 2,
      title: "Seven Elements of Compliance",
      objectives: [
        "Apply key requirements from Seven Elements of Compliance",
        "Identify correct field actions related to Seven Elements of Compliance"
      ],
      cards: [
        {
          id: "GAO-004-L2-S",
          type: "summary",
          title: "Seven Elements of Compliance",
          body: "The OIG defines seven elements of an effective compliance program. Care Indeed implements all seven, and you are expected to understand how each one protects you, your patients, and the agency. The first element is written policies and procedures.",
          narration: "In this lesson: Seven Elements of Compliance. The OIG defines seven elements of an effective compliance program. Care Indeed implements all seven, and you are expected to understand how each one protects you, your patients, and the agency. The first element is written policies and procedures.",
          estDurationSec: 45
        },
        {
          id: "GAO-004-L2-C1",
          type: "content",
          title: "Seven Elements of Compliance",
          body: "The OIG defines seven elements of an effective compliance program. Care Indeed implements all seven, and you are expected to understand how each one protects you, your patients, and the agency. The first element is written policies and procedures.",
          narration: "The OIG defines seven elements of an effective compliance program. Care Indeed implements all seven, and you are expected to understand how each one protects you, your patients, and the agency. The first element is written policies and procedures. Care Indeed maintains a comprehensive policy framework starting with CO-CP-001, the Corporate Compliance Plan, which is the master document governing the program. Every policy in the agency's framework supports compliance by defining expected behavior, clinical standards, and documentation requirements. You are responsible for knowing and following the policies that apply to your role. The second element is a designated Compliance Officer and Compliance Committee. Per policy CO-CP-002, Care Indeed has a designated Compliance Officer who is responsible for overseeing the day-to-day operation of the compliance program, investigating reported concerns, recommending corrective actions, and reporting to leadership and the Governing Body. The Compliance Committee includes representatives from clinical, administrative, and quality departments.",
          estDurationSec: 64
        },
        {
          id: "GAO-004-L2-C2",
          type: "content",
          title: "Seven Elements of Compliance (part 2)",
          body: "The third element is training and education. This orientation module is part of that element. Every employee receives compliance training at hire and annually thereafter.",
          narration: "The third element is training and education. This orientation module is part of that element. Every employee receives compliance training at hire and annually thereafter. The training covers fraud, waste, and abuse recognition; reporting obligations; key federal and state laws; the agency's compliance policies; and the consequences of noncompliance. Completion is documented and tracked. The fourth element is effective communication, including a hotline. Per policy CO-CP-006, Care Indeed maintains a confidential compliance hotline and multiple reporting channels so employees can report concerns without fear of retaliation. The hotline is anonymous — you do not have to identify yourself to report a concern. The fifth element is internal auditing and monitoring. Per policy CO-CP-004, Care Indeed conducts regular internal audits of clinical documentation, billing accuracy, personnel files, and policy compliance. These audits are designed to identify problems before they become survey deficiencies, legal violations, or patient safety issues. Audit findings are",
          estDurationSec: 64
        },
        {
          id: "GAO-004-L2-C3",
          type: "content",
          title: "Seven Elements of Compliance (part 3)",
          body: "reported to the Compliance Officer and corrective actions are implemented. The sixth element is enforcement through consistent discipline. When violations are identified, the agency applies consistent discipline per HR-ER-002 regardless of the employee's position or tenure.",
          narration: "reported to the Compliance Officer and corrective actions are implemented. The sixth element is enforcement through consistent discipline. When violations are identified, the agency applies consistent discipline per HR-ER-002 regardless of the employee's position or tenure. Discipline may range from counseling and retraining to termination and referral for legal action, depending on the severity and intentionality of the violation. The seventh element is response and corrective action. When a compliance issue is identified through audit, report, or investigation, the agency responds with a defined process: investigation, root cause analysis, corrective action implementation, monitoring of the corrective action, and documentation of the entire process per CO-CP-001 Section 6.7. ---",
          estDurationSec: 46
        },
        {
          id: "GAO-004-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Seven Elements of Compliance\"?",
          narration: "What is the key takeaway from \"Seven Elements of Compliance\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-004-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Seven Elements of Compliance\"?",
            narration: "What is the key takeaway from \"Seven Elements of Compliance\"?",
            options: [
              {
                id: "a",
                label: "The OIG defines seven elements of an effective compliance program. Care Indeed implements all seven, and you are expected to understand how each one protects you, your patients,…",
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
            policyRef: "CO-CP-001",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "The OIG defines seven elements of an effective compliance program. Care Indeed implements all seven, and you are expected to understand how each one protects you, your patients, and the agency."
          }
        }
      ]
    },
    {
      id: "GAO-004-L3",
      order: 3,
      title: "Your Compliance Obligations",
      objectives: [
        "Apply key requirements from Your Compliance Obligations",
        "Identify correct field actions related to Your Compliance Obligations"
      ],
      cards: [
        {
          id: "GAO-004-L3-S",
          type: "summary",
          title: "Your Compliance Obligations",
          body: "Every employee at Care Indeed has specific compliance obligations that are conditions of employment. These are not guidelines or suggestions. They are requirements. You must follow all federal, state, and agency policies that apply to your role.",
          narration: "In this lesson: Your Compliance Obligations. Every employee at Care Indeed has specific compliance obligations that are conditions of employment. These are not guidelines or suggestions. They are requirements. You must follow all federal, state, and agency policies that apply to your role. This includes clinical protocols, documentation standards, billing rules, patient rights requirements, and workplace conduct standards.",
          estDurationSec: 45
        },
        {
          id: "GAO-004-L3-C1",
          type: "content",
          title: "Your Compliance Obligations",
          body: "Every employee at Care Indeed has specific compliance obligations that are conditions of employment. These are not guidelines or suggestions. They are requirements. You must follow all federal, state, and agency policies that apply to your role.",
          narration: "Every employee at Care Indeed has specific compliance obligations that are conditions of employment. These are not guidelines or suggestions. They are requirements. You must follow all federal, state, and agency policies that apply to your role. This includes clinical protocols, documentation standards, billing rules, patient rights requirements, and workplace conduct standards. Ignorance of a policy is not a defense. It is your responsibility to read, understand, and follow the policies assigned to you during onboarding and throughout your employment. You must document accurately and truthfully. Never falsify records. This means documenting the care you actually provided, the time you actually spent, the findings you actually observed, and the clinical reasoning you actually applied. Documentation must be contemporaneous — completed at the time of service or as close to it as possible. Reconstructing visit notes from memory hours or days later creates accuracy risks and is not acceptable practice. You",
          estDurationSec: 64
        },
        {
          id: "GAO-004-L3-C2",
          type: "content",
          title: "Your Compliance Obligations (part 2)",
          body: "must bill only for services actually provided. If a visit did not occur, it cannot be billed. If you provided a lower level of service than ordered, you document what you actually did, not what was ordered. Upcoding — billing for a higher level of service than provided — is a form of abuse that violates federal law.",
          narration: "must bill only for services actually provided. If a visit did not occur, it cannot be billed. If you provided a lower level of service than ordered, you document what you actually did, not what was ordered. Upcoding — billing for a higher level of service than provided — is a form of abuse that violates federal law. You must report suspected fraud, waste, or abuse immediately through the channels available to you. If you see a colleague falsifying documentation, if you become aware of billing irregularities, if you suspect kickback arrangements, or if you observe any practice that seems inconsistent with legal or ethical standards, you must report it. Silence is complicity. You must cooperate with compliance investigations. If the Compliance Officer or an external investigator asks you questions about your documentation, your clinical practices, or your observations, you must respond honestly and completely. Obstruction or dishonesty during an",
          estDurationSec: 64
        },
        {
          id: "GAO-004-L3-C3",
          type: "content",
          title: "Your Compliance Obligations (part 3)",
          body: "investigation is itself a serious violation. You must complete all required compliance training on time. Training deadlines are tracked, and failure to complete required training is a compliance deficiency that can affect your employment status and the agency's survey readiness.",
          narration: "investigation is itself a serious violation. You must complete all required compliance training on time. Training deadlines are tracked, and failure to complete required training is a compliance deficiency that can affect your employment status and the agency's survey readiness. You must sign the Code of Conduct acknowledgment annually. This acknowledgment confirms that you have read, understood, and agree to comply with the agency's compliance requirements. What you must not do is equally clear. You must not submit false claims or documentation. You must not accept kickbacks or illegal remuneration. You must not refer patients based on financial arrangements, which would violate the Stark Law and Anti-Kickback Statute. You must not retaliate against anyone who reports a compliance concern. And you must not ignore suspected violations.",
          estDurationSec: 54
        },
        {
          id: "GAO-004-L3-CH",
          type: "challenge",
          title: "Scenario Challenge 1 Scenario: You overhear a colleague on…",
          body: "Scenario Challenge 1 Scenario: You overhear a colleague on the phone telling the scheduler to mark a visit as completed even though the patient was not home and no visit occurred.",
          narration: "Scenario Challenge 1 Scenario: You overhear a colleague on the phone telling the scheduler to mark a visit as completed even though the patient was not home and no visit occurred. What do you do? Expected Response: This is suspected fraud — billing for a visit that did not occur.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-004-L3-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 1 Scenario: You overhear a colleague on the phone telling the scheduler to mark a visit as completed even though the patient was not home and no visit occurred.",
            narration: "Scenario Challenge 1 Scenario: You overhear a colleague on the phone telling the scheduler to mark a visit as completed even though the patient was not home and no visit occurred.",
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
            policyRef: "CO-CP-001",
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
      id: "GAO-004-L4",
      order: 4,
      title: "Fraud, Waste, and Abuse",
      objectives: [
        "Apply key requirements from Fraud, Waste, and Abuse",
        "Identify correct field actions related to Fraud, Waste, and Abuse"
      ],
      cards: [
        {
          id: "GAO-004-L4-S",
          type: "summary",
          title: "Fraud, Waste, and Abuse",
          body: "You must understand the differences between fraud, waste, and abuse because each represents a different type of violation with different implications. Fraud is intentional deception or misrepresentation for unauthorized benefit.",
          narration: "In this lesson: Fraud, Waste, and Abuse. You must understand the differences between fraud, waste, and abuse because each represents a different type of violation with different implications. Fraud is intentional deception or misrepresentation for unauthorized benefit.",
          estDurationSec: 45
        },
        {
          id: "GAO-004-L4-C1",
          type: "content",
          title: "Fraud, Waste, and Abuse",
          body: "You must understand the differences between fraud, waste, and abuse because each represents a different type of violation with different implications. Fraud is intentional deception or misrepresentation for unauthorized benefit.",
          narration: "You must understand the differences between fraud, waste, and abuse because each represents a different type of violation with different implications. Fraud is intentional deception or misrepresentation for unauthorized benefit. In home health, examples include billing for visits that never occurred, falsifying OASIS assessments to obtain higher Medicare reimbursement, forging physician signatures on orders, providing services to patients who do not qualify for home health in order to generate revenue, and paying physicians or referral sources for patient referrals. Fraud is a criminal offense. The Department of Justice prosecutes healthcare fraud cases aggressively, and penalties include imprisonment, fines, and permanent exclusion from federal healthcare programs. Waste is the overutilization of services or resources not caused by criminal intent. In home health, examples include continuing skilled nursing visits after the patient's goals have been met and there is no further skilled need, ordering excessive supplies that are not medically necessary, providing",
          estDurationSec: 64
        },
        {
          id: "GAO-004-L4-C2",
          type: "content",
          title: "Fraud, Waste, and Abuse (part 2)",
          body: "visit frequencies higher than the patient's condition warrants, and using higher-cost interventions when equally effective lower-cost alternatives exist. Waste may not be criminal, but it increases healthcare costs, triggers audit scrutiny, and can lead to claim denials and repayment demands.",
          narration: "visit frequencies higher than the patient's condition warrants, and using higher-cost interventions when equally effective lower-cost alternatives exist. Waste may not be criminal, but it increases healthcare costs, triggers audit scrutiny, and can lead to claim denials and repayment demands. Abuse is practices that are inconsistent with sound fiscal, business, or medical practices. The key distinction from fraud is that abuse may not involve intentional deception. Examples include upcoding — billing for a higher level of service than was actually provided, providing services that are not medically necessary but not with fraudulent intent, failing to follow evidence-based protocols resulting in unnecessary services, and poor documentation practices that make it impossible to verify that billed services were appropriate. Three key federal laws govern fraud and abuse in healthcare. The False Claims Act under 31 USC Section 3729 creates civil liability for knowingly submitting false claims to the government. Knowingly includes acting",
          estDurationSec: 64
        },
        {
          id: "GAO-004-L4-C3",
          type: "content",
          title: "Fraud, Waste, and Abuse (part 3)",
          body: "with reckless disregard for the truth — you do not have to intend to defraud. The Anti-Kickback Statute under 42 USC Section 1320a-7b makes it a criminal offense to offer, pay, solicit, or receive anything of value to induce or reward patient referrals for services covered by federal healthcare programs.",
          narration: "with reckless disregard for the truth — you do not have to intend to defraud. The Anti-Kickback Statute under 42 USC Section 1320a-7b makes it a criminal offense to offer, pay, solicit, or receive anything of value to induce or reward patient referrals for services covered by federal healthcare programs. And the Stark Law under 42 USC Section 1395nn prohibits physicians from referring patients to entities with which the physician has a financial relationship, unless a specific exception applies.",
          estDurationSec: 35
        },
        {
          id: "GAO-004-L4-CH",
          type: "challenge",
          title: "Knowledge Check 2 Q: A clinician bills for a…",
          body: "Knowledge Check 2 Q: A clinician bills for a forty-five-minute visit but actually spent only twenty minutes with the patient.",
          narration: "Knowledge Check 2 Q: A clinician bills for a forty-five-minute visit but actually spent only twenty minutes with the patient. Is this fraud, waste, or abuse? A: This is fraud if the clinician intentionally misrepresented the visit duration, or abuse if it resulted from careless documentation practices.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-004-L4-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 2 Q: A clinician bills for a forty-five-minute visit but actually spent only twenty minutes with the patient.",
            narration: "Knowledge Check 2 Q: A clinician bills for a forty-five-minute visit but actually spent only twenty minutes with the patient.",
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
            policyRef: "CO-CP-001",
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
      id: "GAO-004-L5",
      order: 5,
      title: "Reporting & Protections",
      objectives: [
        "Apply key requirements from Reporting & Protections",
        "Identify correct field actions related to Reporting & Protections"
      ],
      cards: [
        {
          id: "GAO-004-L5-S",
          type: "summary",
          title: "Reporting & Protections",
          body: "Care Indeed provides multiple channels for reporting compliance concerns because the agency recognizes that different situations require different reporting options.",
          narration: "In this lesson: Reporting & Protections. Care Indeed provides multiple channels for reporting compliance concerns because the agency recognizes that different situations require different reporting options.",
          estDurationSec: 45
        },
        {
          id: "GAO-004-L5-C1",
          type: "content",
          title: "Reporting & Protections",
          body: "Care Indeed provides multiple channels for reporting compliance concerns because the agency recognizes that different situations require different reporting options.",
          narration: "Care Indeed provides multiple channels for reporting compliance concerns because the agency recognizes that different situations require different reporting options. Per policy CO-CP-006, your reporting channels are, in order of typical use: your direct supervisor, the Compliance Officer, the anonymous compliance hotline, the Administrator, and external channels including the OIG Hotline at 1-800-HHS-TIPS and state regulatory agencies. You may choose any of these channels. You do not have to start with your supervisor. If your concern involves your supervisor, go directly to the Compliance Officer or the hotline. If your concern involves the Compliance Officer, go to the Administrator. If you believe internal channels are compromised, use the external channels. The point is that you always have a way to report. The anonymous compliance hotline deserves special emphasis. It is available to report concerns without identifying yourself. The agency cannot trace anonymous reports to determine the reporter's identity. This channel",
          estDurationSec: 64
        },
        {
          id: "GAO-004-L5-C2",
          type: "content",
          title: "Reporting & Protections (part 2)",
          body: "exists specifically to eliminate the fear that reporting could lead to personal consequences. Use it whenever you prefer anonymity. Whistleblower protection is absolute.",
          narration: "exists specifically to eliminate the fear that reporting could lead to personal consequences. Use it whenever you prefer anonymity. Whistleblower protection is absolute. Per policy CO-CP-005 and federal and California state whistleblower protection laws, no employee may be retaliated against for reporting a compliance concern in good faith. Retaliation includes termination, demotion, reduced hours, unfavorable schedule changes, harassment, intimidation, or any other adverse employment action taken because an employee reported a concern. Retaliation against a reporter is itself a terminable offense and a potential federal violation that exposes the retaliator and the agency to additional liability. Good faith means you honestly believe a violation may have occurred. It does not mean you have to be right. A good-faith report that turns out to be unfounded after investigation is still protected. The agency would rather investigate ten unfounded concerns than miss one real violation because an employee was afraid to report.",
          estDurationSec: 64
        },
        {
          id: "GAO-004-L5-C3",
          type: "content",
          title: "Reporting & Protections (part 3)",
          body: "When in doubt, report. It is always better to report a concern that turns out to be nothing than to stay silent about actual fraud. You will not be punished for good-faith reporting, even if the investigation finds no violation.",
          narration: "When in doubt, report. It is always better to report a concern that turns out to be nothing than to stay silent about actual fraud. You will not be punished for good-faith reporting, even if the investigation finds no violation. But if you know about a violation and fail to report it, you could share liability for the violation itself. Timing matters. Report concerns as soon as you become aware of them. Do not wait to gather more evidence. Do not investigate on your own. And do not discuss the concern with colleagues other than through the proper reporting channels. Early reporting gives the agency the best chance to investigate, correct, and prevent further harm.",
          estDurationSec: 49
        },
        {
          id: "GAO-004-L5-CH",
          type: "challenge",
          title: "Scenario Challenge 2 Scenario: After reporting a billing…",
          body: "Scenario Challenge 2 Scenario: After reporting a billing concern to the Compliance Officer, your supervisor begins assigning you to less desirable shifts and makes negative comments about people who cannot mind their…",
          narration: "Scenario Challenge 2 Scenario: After reporting a billing concern to the Compliance Officer, your supervisor begins assigning you to less desirable shifts and makes negative comments about people who cannot mind their own business.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-004-L5-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 2 Scenario: After reporting a billing concern to the Compliance Officer, your supervisor begins assigning you to less desirable shifts and makes negative comments about people who cannot mind their own business.",
            narration: "Scenario Challenge 2 Scenario: After reporting a billing concern to the Compliance Officer, your supervisor begins assigning you to less desirable shifts and makes negative comments about people who cannot mind their own business.",
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
            policyRef: "CO-CP-001",
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
      id: "GAO-004-L6",
      order: 6,
      title: "Module Summary",
      objectives: [
        "Apply key requirements from Module Summary",
        "Identify correct field actions related to Module Summary"
      ],
      cards: [
        {
          id: "GAO-004-L6-S",
          type: "summary",
          title: "Module Summary",
          body: "Let us consolidate the essential takeaways from this module on corporate compliance. Care Indeed's Corporate Compliance Program implements all seven OIG elements: written policies, a designated Compliance Officer, training and education, communication channels including a hotline, internal…",
          narration: "In this lesson: Module Summary. Let us consolidate the essential takeaways from this module on corporate compliance. Care Indeed's Corporate Compliance Program implements all seven OIG elements: written policies, a designated Compliance Officer, training and education, communication channels including a hotline, internal auditing, consistent enforcement, and response with corrective action.",
          estDurationSec: 45
        },
        {
          id: "GAO-004-L6-C1",
          type: "content",
          title: "Module Summary",
          body: "Let us consolidate the essential takeaways from this module on corporate compliance. Care Indeed's Corporate Compliance Program implements all seven OIG elements: written policies, a designated Compliance Officer, training and education, communication channels including a hotline, internal auditing, consistent…",
          narration: "Let us consolidate the essential takeaways from this module on corporate compliance. Care Indeed's Corporate Compliance Program implements all seven OIG elements: written policies, a designated Compliance Officer, training and education, communication channels including a hotline, internal auditing, consistent enforcement, and response with corrective action. These seven elements are not optional — they are the OIG's framework for what constitutes an effective compliance program, and they reflect the agency's commitment to operating lawfully and ethically. You are personally obligated to follow laws, document truthfully, bill accurately, and report violations. These obligations are not delegable. You cannot say that billing is not your job when your documentation is the foundation of every claim. You cannot say that compliance is the Compliance Officer's problem when you are the one delivering care and creating records in the field. Understand the differences between fraud, waste, and abuse. Fraud is intentional deception. Waste is overutilization",
          estDurationSec: 64
        },
        {
          id: "GAO-004-L6-C2",
          type: "content",
          title: "Module Summary (part 2)",
          body: "without criminal intent. Abuse is practices inconsistent with sound standards. All three create financial, legal, and patient safety risks, but fraud carries the most severe penalties including criminal prosecution. Know the key federal laws.",
          narration: "without criminal intent. Abuse is practices inconsistent with sound standards. All three create financial, legal, and patient safety risks, but fraud carries the most severe penalties including criminal prosecution. Know the key federal laws. The False Claims Act creates civil liability for knowingly submitting false claims — and knowingly includes reckless disregard. The Anti-Kickback Statute criminalizes payments to induce referrals. The Stark Law prohibits physician self-referrals with financial relationships. Use the reporting channels available to you. You have five options: supervisor, Compliance Officer, anonymous hotline, Administrator, and external agencies. You do not have to start with your supervisor. You can go directly to whichever channel you are most comfortable with. Whistleblower protection is absolute. No retaliation for good-faith reporting. Period. This is not just agency policy — it is federal and California state law. If you experience retaliation, report the retaliation itself through a separate channel. For your daily practice,",
          estDurationSec: 64
        },
        {
          id: "GAO-004-L6-C3",
          type: "content",
          title: "Module Summary (part 3)",
          body: "remember three compliance principles that will serve you well throughout your career at Care Indeed. First, document what actually happened, not what should have happened or what was planned. Accuracy is your shield. Second, if something does not look right, report it. Trust your instincts and use the channels.",
          narration: "remember three compliance principles that will serve you well throughout your career at Care Indeed. First, document what actually happened, not what should have happened or what was planned. Accuracy is your shield. Second, if something does not look right, report it. Trust your instincts and use the channels. Third, complete your compliance training on time, every time. Your training completion is tracked and verified during surveys. You are now ready for the final exam. Ten questions, eighty percent to pass. ---",
          estDurationSec: 35
        },
        {
          id: "GAO-004-L6-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Module Summary\"?",
          narration: "What is the key takeaway from \"Module Summary\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-004-L6-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Module Summary\"?",
            narration: "What is the key takeaway from \"Module Summary\"?",
            options: [
              {
                id: "a",
                label: "Let us consolidate the essential takeaways from this module on corporate compliance.",
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
            policyRef: "CO-CP-001",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Let us consolidate the essential takeaways from this module on corporate compliance. Care Indeed's Corporate Compliance Program implements all seven OIG elements: written policies, a designated Compliance Officer,…"
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-004-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Corporate Compliance Program. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Billing for home health visits that were never actually made is an example of: -",
        narration: "Billing for home health visits that were never actually made is an example of: -",
        options: [
          {
            id: "a",
            label: "Waste",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Abuse",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Fraud",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Administrative error",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q1 from AAA Record v2.0 for GAO-004.",
        policyRef: "CO-CP-001"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "How many elements does the OIG identify for an effective compliance program? -",
        narration: "How many elements does the OIG identify for an effective compliance program? -",
        options: [
          {
            id: "a",
            label: "5",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "7",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "10",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "12",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q2 from AAA Record v2.0 for GAO-004.",
        policyRef: "CO-CP-001"
      },
      {
        id: "q3",
        format: "scenario_decision",
        prompt: "An employee reports suspected fraud to the hotline. Their supervisor retaliates by reducing hours. This is:",
        narration: "An employee reports suspected fraud to the hotline. Their supervisor retaliates by reducing hours. This is:",
        options: [
          {
            id: "a",
            label: "Acceptable if the report was unfounded -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "A violation of whistleblower protection — a terminable offense -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "The supervisor's discretion |",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only a problem if the employee proves fraud",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q3 from AAA Record v2.0 for GAO-004.",
        policyRef: "CO-CP-001"
      },
      {
        id: "q4",
        format: "scenario_decision",
        prompt: "The Anti-Kickback Statute prohibits:",
        narration: "The Anti-Kickback Statute prohibits:",
        options: [
          {
            id: "a",
            label: "Providing skilled nursing in the home -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Payments to induce patient referrals -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Hiring without background check |",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Failing to complete annual training",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q4 from AAA Record v2.0 for GAO-004.",
        policyRef: "CO-CP-001"
      },
      {
        id: "q5",
        format: "scenario_decision",
        prompt: "If you suspect a compliance violation but are not sure, you should:",
        narration: "If you suspect a compliance violation but are not sure, you should:",
        options: [
          {
            id: "a",
            label: "Wait until you have concrete proof -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Report the concern — better to report and be wrong than stay silent -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Investigate on your own |",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Discuss with coworkers ### Expansion (Q6–Q10)",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q5 from AAA Record v2.0 for GAO-004.",
        policyRef: "CO-CP-001"
      },
      {
        id: "q6",
        format: "scenario_decision",
        prompt: "Under the False Claims Act, knowingly includes which of the following?",
        narration: "Under the False Claims Act, knowingly includes which of the following?",
        options: [
          {
            id: "a",
            label: "Only intentional fraud with documented proof -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Acting with reckless disregard for the truth -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Honest mistakes in documentation |",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Following supervisor instructions",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q6 from AAA Record v2.0 for GAO-004.",
        policyRef: "CO-CP-001"
      },
      {
        id: "q7",
        format: "scenario_decision",
        prompt: "Which element of the OIG compliance framework does this training module satisfy? -",
        narration: "Which element of the OIG compliance framework does this training module satisfy? -",
        options: [
          {
            id: "a",
            label: "Internal auditing",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Enforcement - C) Training and education",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Response and corrective action",
            isCorrect: true,
            feedback: "Correct."
          }
        ],
        rationale: "Source exam item Q7 from AAA Record v2.0 for GAO-004.",
        policyRef: "CO-CP-001"
      },
      {
        id: "q8",
        format: "scenario_decision",
        prompt: "A clinician documents a forty-five-minute visit but spent only twenty minutes. This is best classified as: -",
        narration: "A clinician documents a forty-five-minute visit but spent only twenty minutes. This is best classified as: -",
        options: [
          {
            id: "a",
            label: "Acceptable practice",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Fraud or abuse depending on intent - C) Waste",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "A scheduling issue",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q8 from AAA Record v2.0 for GAO-004.",
        policyRef: "CO-CP-001"
      },
      {
        id: "q9",
        format: "scenario_decision",
        prompt: "If your compliance concern involves your direct supervisor, what should you do?",
        narration: "If your compliance concern involves your direct supervisor, what should you do?",
        options: [
          {
            id: "a",
            label: "Report to your supervisor anyway per the chain of command -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Skip the supervisor and report directly to the Compliance Officer or hotline -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Wait until the supervisor is no longer your manager |",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Ignore it",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q9 from AAA Record v2.0 for GAO-004.",
        policyRef: "CO-CP-001"
      }
    ]
  }
},
  {
  moduleId: "GAO-005",
  policyRefs: [
    "CO-CP-006"
  ],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "Compliance Hotline & Reporting",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Care Indeed maintains a confidential compliance hotline as part of the agency's Corporate Compliance Program, required under policy CO-CP-006.",
    narration: "Welcome to GAO-005, Compliance Hotline & Reporting. Care Indeed maintains a confidential compliance hotline as part of the agency's Corporate Compliance Program, required under policy CO-CP-006."
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
      id: "GAO-005-L1",
      order: 1,
      title: "The Compliance Hotline",
      objectives: [
        "Apply key requirements from The Compliance Hotline",
        "Identify correct field actions related to The Compliance Hotline"
      ],
      cards: [
        {
          id: "GAO-005-L1-S",
          type: "summary",
          title: "The Compliance Hotline",
          body: "Care Indeed maintains a confidential compliance hotline as part of the agency's Corporate Compliance Program, required under policy CO-CP-006. In the previous module, you learned about the seven elements of compliance and the types of fraud, waste, and abuse that can occur in home health care.",
          narration: "In this lesson: The Compliance Hotline. Care Indeed maintains a confidential compliance hotline as part of the agency's Corporate Compliance Program, required under policy CO-CP-006. In the previous module, you learned about the seven elements of compliance and the types of fraud, waste, and abuse that can occur in home health care.",
          estDurationSec: 45
        },
        {
          id: "GAO-005-L1-C1",
          type: "content",
          title: "The Compliance Hotline",
          body: "Care Indeed maintains a confidential compliance hotline as part of the agency's Corporate Compliance Program, required under policy CO-CP-006. In the previous module, you learned about the seven elements of compliance and the types of fraud, waste, and abuse that can occur in home health care.",
          narration: "Care Indeed maintains a confidential compliance hotline as part of the agency's Corporate Compliance Program, required under policy CO-CP-006. In the previous module, you learned about the seven elements of compliance and the types of fraud, waste, and abuse that can occur in home health care. This module focuses specifically on how to report compliance concerns, what happens after you report, and the protections that ensure you can report safely. The compliance hotline is not a suggestion box. It is a critical safety mechanism that gives every employee a direct, confidential channel to report suspected violations without fear of retaliation. CMS and the OIG expect agencies to have effective communication channels as part of their compliance programs, and the hotline is the centerpiece of that requirement. Why does a dedicated hotline matter? Because the reality of healthcare compliance is that many employees who witness potential violations do not report them.",
          estDurationSec: 64
        },
        {
          id: "GAO-005-L1-C2",
          type: "content",
          title: "The Compliance Hotline (part 2)",
          body: "Research consistently shows that the top reasons for non-reporting are fear of retaliation, belief that nothing will be done, uncertainty about whether the situation is actually a violation, and not knowing how to report. The hotline addresses all four barriers. It is anonymous, eliminating retaliation risk.",
          narration: "Research consistently shows that the top reasons for non-reporting are fear of retaliation, belief that nothing will be done, uncertainty about whether the situation is actually a violation, and not knowing how to report. The hotline addresses all four barriers. It is anonymous, eliminating retaliation risk. It goes directly to the Compliance Officer, ensuring action. It accepts reports even when the reporter is unsure, and it provides a clear, simple mechanism for reporting. You should use the compliance hotline whenever you observe or become aware of any activity that may violate federal or state law, CMS Conditions of Participation, agency policies, the Code of Conduct, billing and documentation standards, patient rights, or professional ethics. You do not need to be certain that a violation occurred. You only need to have a good-faith belief that something may be wrong. The hotline is available at all times. Reports can be made by",
          estDurationSec: 64
        },
        {
          id: "GAO-005-L1-C3",
          type: "content",
          title: "The Compliance Hotline (part 3)",
          body: "phone or through the designated reporting system. You may identify yourself or remain anonymous. If you choose to remain anonymous, the agency will investigate the concern without attempting to identify you.",
          narration: "phone or through the designated reporting system. You may identify yourself or remain anonymous. If you choose to remain anonymous, the agency will investigate the concern without attempting to identify you. However, providing your identity can sometimes help the Compliance Officer gather additional information and conduct a more thorough investigation. The choice is entirely yours. It is important to understand that the compliance hotline is not the only reporting channel. Per CO-CP-006, you have five channels available. Your direct supervisor is the first option for routine concerns. The Compliance Officer is available for any compliance issue, regardless of severity. The anonymous hotline is available when you prefer anonymity. The Administrator is available if other channels are compromised. And external agencies, including the OIG Hotline at 1-800-HHS-TIPS and the California Department of Public Health, are available when you believe internal channels will not adequately address the concern.",
          estDurationSec: 63
        },
        {
          id: "GAO-005-L1-CH",
          type: "challenge",
          title: "Knowledge Check 1 Q: You witness something that might be a…",
          body: "Knowledge Check 1 Q: You witness something that might be a compliance violation but you are not sure. Should you report it or wait until you have more evidence? A: Report it now.",
          narration: "Knowledge Check 1 Q: You witness something that might be a compliance violation but you are not sure. Should you report it or wait until you have more evidence? A: Report it now. You only need a good-faith belief that something may be wrong.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-005-L1-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 1 Q: You witness something that might be a compliance violation but you are not sure. Should you report it or wait until you have more evidence? A: Report it now. You only need a good-faith belief that something may be wrong.",
            narration: "Knowledge Check 1 Q: You witness something that might be a compliance violation but you are not sure. Should you report it or wait until you have more evidence? A: Report it now. You only need a good-faith belief that something may be wrong.",
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
            policyRef: "CO-CP-006",
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
      id: "GAO-005-L2",
      order: 2,
      title: "What to Report and How",
      objectives: [
        "Apply key requirements from What to Report and How",
        "Identify correct field actions related to What to Report and How"
      ],
      cards: [
        {
          id: "GAO-005-L2-S",
          type: "summary",
          title: "What to Report and How",
          body: "Knowing what to report is as important as knowing how to report. In home health care, reportable concerns fall into several categories, and understanding them helps you recognize situations that require action.",
          narration: "In this lesson: What to Report and How. Knowing what to report is as important as knowing how to report. In home health care, reportable concerns fall into several categories, and understanding them helps you recognize situations that require action.",
          estDurationSec: 45
        },
        {
          id: "GAO-005-L2-C1",
          type: "content",
          title: "What to Report and How",
          body: "Knowing what to report is as important as knowing how to report. In home health care, reportable concerns fall into several categories, and understanding them helps you recognize situations that require action.",
          narration: "Knowing what to report is as important as knowing how to report. In home health care, reportable concerns fall into several categories, and understanding them helps you recognize situations that require action. Billing and documentation concerns include visits billed but not provided, documentation that does not reflect actual care delivered, upcoding or billing for higher service levels than provided, patients being kept on service after goals are met and skilled need has ended, and any pattern of documentation that seems designed to inflate reimbursement rather than accurately reflect patient care. Patient care concerns include care provided below accepted professional standards, failure to follow physician orders or the plan of care, failure to report changes in patient condition, medication errors that are not reported, and any situation where patient safety is being compromised by staff action or inaction. Workplace conduct concerns include harassment, discrimination, unsafe working conditions, retaliation against reporters, substance",
          estDurationSec: 64
        },
        {
          id: "GAO-005-L2-C2",
          type: "content",
          title: "What to Report and How (part 2)",
          body: "impairment in the workplace, and violations of professional boundaries with patients or families. Regulatory compliance concerns include failure to maintain required licensure or certifications, failure to complete required training, unauthorized persons providing clinical services, HIPAA violations and unauthorized…",
          narration: "impairment in the workplace, and violations of professional boundaries with patients or families. Regulatory compliance concerns include failure to maintain required licensure or certifications, failure to complete required training, unauthorized persons providing clinical services, HIPAA violations and unauthorized disclosure of patient information, and failure to follow infection control or safety protocols. Financial misconduct includes misuse of agency funds or resources, accepting gifts or payments from vendors or referral sources in violation of the Anti-Kickback Statute, and any financial arrangement that appears to be designed to influence patient referrals. When making a report, include as much detail as possible. What did you observe? When did it happen? Where did it occur? Who was involved? Were there witnesses? What documentation might be relevant? If you do not know all the details, report what you do know. A partial report is infinitely better than no report. The Compliance Officer will follow up to",
          estDurationSec: 64
        },
        {
          id: "GAO-005-L2-C3",
          type: "content",
          title: "What to Report and How (part 3)",
          body: "gather additional information. Do not investigate on your own. Do not confront the person you believe committed the violation. Do not collect evidence. Do not interview colleagues about what they may have seen. Your role is to report. The Compliance Officer's role is to investigate.",
          narration: "gather additional information. Do not investigate on your own. Do not confront the person you believe committed the violation. Do not collect evidence. Do not interview colleagues about what they may have seen. Your role is to report. The Compliance Officer's role is to investigate. Attempting your own investigation can compromise the formal investigation, alert the subject and allow evidence destruction, put you at personal risk, and create legal complications that affect the agency's ability to take corrective action.",
          estDurationSec: 35
        },
        {
          id: "GAO-005-L2-CH",
          type: "challenge",
          title: "Scenario Challenge 1 Scenario: You notice that a colleague…",
          body: "Scenario Challenge 1 Scenario: You notice that a colleague consistently documents arriving at patient homes at the scheduled time, but you have observed them arriving fifteen to twenty minutes late on multiple…",
          narration: "Scenario Challenge 1 Scenario: You notice that a colleague consistently documents arriving at patient homes at the scheduled time, but you have observed them arriving fifteen to twenty minutes late on multiple occasions. You are not sure if this is intentional fraud or just poor time management.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-005-L2-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 1 Scenario: You notice that a colleague consistently documents arriving at patient homes at the scheduled time, but you have observed them arriving fifteen to twenty minutes late on multiple occasions.",
            narration: "Scenario Challenge 1 Scenario: You notice that a colleague consistently documents arriving at patient homes at the scheduled time, but you have observed them arriving fifteen to twenty minutes late on multiple occasions.",
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
            policyRef: "CO-CP-006",
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
      id: "GAO-005-L3",
      order: 3,
      title: "What Happens After You Report",
      objectives: [
        "Apply key requirements from What Happens After You Report",
        "Identify correct field actions related to What Happens After You Report"
      ],
      cards: [
        {
          id: "GAO-005-L3-S",
          type: "summary",
          title: "What Happens After You Report",
          body: "Understanding what happens after you file a report helps you trust the process and reduces anxiety about reporting. The compliance investigation process at Care Indeed follows a defined protocol under CO-CP-001 Section 6.7.",
          narration: "In this lesson: What Happens After You Report. Understanding what happens after you file a report helps you trust the process and reduces anxiety about reporting. The compliance investigation process at Care Indeed follows a defined protocol under CO-CP-001 Section 6.7.",
          estDurationSec: 45
        },
        {
          id: "GAO-005-L3-C1",
          type: "content",
          title: "What Happens After You Report",
          body: "Understanding what happens after you file a report helps you trust the process and reduces anxiety about reporting. The compliance investigation process at Care Indeed follows a defined protocol under CO-CP-001 Section 6.7.",
          narration: "Understanding what happens after you file a report helps you trust the process and reduces anxiety about reporting. The compliance investigation process at Care Indeed follows a defined protocol under CO-CP-001 Section 6.7. When a report is received, the Compliance Officer conducts an initial assessment to determine the nature and severity of the concern, whether immediate action is needed to protect patients or prevent ongoing harm, which investigation resources are required, and whether external reporting obligations apply, such as mandatory reporting to state agencies or law enforcement. For concerns involving immediate patient safety risk, the Compliance Officer will take protective action first and investigate second. Patient safety always takes priority over the investigation process. This might include temporarily reassigning a clinician, notifying the DON for clinical oversight, or contacting the patient's physician. The investigation phase involves gathering relevant documentation including clinical records, billing records, personnel files, and any other evidence.",
          estDurationSec: 64
        },
        {
          id: "GAO-005-L3-C2",
          type: "content",
          title: "What Happens After You Report (part 2)",
          body: "It includes interviewing relevant parties, which may include the reporter if identified, the subject of the concern, supervisors, and witnesses. It includes analyzing the evidence against applicable laws, regulations, and policies.",
          narration: "It includes interviewing relevant parties, which may include the reporter if identified, the subject of the concern, supervisors, and witnesses. It includes analyzing the evidence against applicable laws, regulations, and policies. And it includes consulting with legal counsel if the concern involves potential legal violations. The investigation timeline varies based on complexity. Simple matters may be resolved within days. Complex investigations involving multiple employees, extensive documentation review, or potential legal implications may take weeks. The Compliance Officer will keep the reporter informed of progress if the reporter is identified and wishes to receive updates. Once the investigation is complete, the Compliance Officer determines findings and recommends corrective actions. Corrective actions may include employee counseling and retraining, disciplinary action up to and including termination, process or policy changes to prevent recurrence, refunding overpayments if billing violations are confirmed, self-disclosure to CMS or the OIG if required, and referral to law enforcement",
          estDurationSec: 64
        },
        {
          id: "GAO-005-L3-C3",
          type: "content",
          title: "What Happens After You Report (part 3)",
          body: "if criminal activity is confirmed. All investigations are documented with findings, corrective actions, and follow-up monitoring. These records are maintained by the Compliance Officer and reported to the Governing Body on a regular basis.",
          narration: "if criminal activity is confirmed. All investigations are documented with findings, corrective actions, and follow-up monitoring. These records are maintained by the Compliance Officer and reported to the Governing Body on a regular basis. The Governing Body has ultimate oversight of the compliance program and must be informed of significant findings. One important principle: the outcome of an investigation does not determine whether the report was appropriate. Even if an investigation finds no violation, the report was still the right thing to do if it was made in good faith. The agency values a culture of reporting over a culture of silence.",
          estDurationSec: 44
        },
        {
          id: "GAO-005-L3-CH",
          type: "challenge",
          title: "Knowledge Check 2 Q: If an investigation finds no…",
          body: "Knowledge Check 2 Q: If an investigation finds no violation, does that mean the reporter was wrong to report? A: No. A good-faith report is always appropriate even if the investigation finds no violation.",
          narration: "Knowledge Check 2 Q: If an investigation finds no violation, does that mean the reporter was wrong to report? A: No. A good-faith report is always appropriate even if the investigation finds no violation.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-005-L3-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 2 Q: If an investigation finds no violation, does that mean the reporter was wrong to report? A: No. A good-faith report is always appropriate even if the investigation finds no violation.",
            narration: "Knowledge Check 2 Q: If an investigation finds no violation, does that mean the reporter was wrong to report? A: No. A good-faith report is always appropriate even if the investigation finds no violation.",
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
            policyRef: "CO-CP-006",
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
      id: "GAO-005-L4",
      order: 4,
      title: "Whistleblower Protections",
      objectives: [
        "Apply key requirements from Whistleblower Protections",
        "Identify correct field actions related to Whistleblower Protections"
      ],
      cards: [
        {
          id: "GAO-005-L4-S",
          type: "summary",
          title: "Whistleblower Protections",
          body: "Whistleblower protection is the foundation that makes the entire compliance reporting system work. Without protection, employees will not report, and without reports, violations go undetected. Care Indeed's protections are built on three layers: agency policy, federal law, and California state law.",
          narration: "In this lesson: Whistleblower Protections. Whistleblower protection is the foundation that makes the entire compliance reporting system work. Without protection, employees will not report, and without reports, violations go undetected. Care Indeed's protections are built on three layers: agency policy, federal law, and California state law.",
          estDurationSec: 45
        },
        {
          id: "GAO-005-L4-C1",
          type: "content",
          title: "Whistleblower Protections",
          body: "Whistleblower protection is the foundation that makes the entire compliance reporting system work. Without protection, employees will not report, and without reports, violations go undetected. Care Indeed's protections are built on three layers: agency policy, federal law, and California state law.",
          narration: "Whistleblower protection is the foundation that makes the entire compliance reporting system work. Without protection, employees will not report, and without reports, violations go undetected. Care Indeed's protections are built on three layers: agency policy, federal law, and California state law. At the agency level, policy CO-CP-005 establishes a zero-tolerance policy for retaliation against any employee who reports a compliance concern in good faith. Retaliation is broadly defined to include any adverse employment action motivated by the employee's reporting activity. This includes termination, demotion, suspension, reduction in hours, unfavorable schedule changes, transfer to a less desirable position, negative performance evaluations influenced by the report, verbal or written harassment related to the report, social isolation or exclusion from professional activities, and any other action that would discourage a reasonable employee from reporting. At the federal level, multiple laws protect healthcare whistleblowers. The False Claims Act includes a qui tam provision that",
          estDurationSec: 64
        },
        {
          id: "GAO-005-L4-C2",
          type: "content",
          title: "Whistleblower Protections (part 2)",
          body: "allows employees to file lawsuits on behalf of the government against employers who submit false claims to federal programs. Qui tam relators, as these whistleblowers are called, are entitled to a percentage of any recovery.",
          narration: "allows employees to file lawsuits on behalf of the government against employers who submit false claims to federal programs. Qui tam relators, as these whistleblowers are called, are entitled to a percentage of any recovery. The False Claims Act also prohibits retaliation against qui tam relators and provides for reinstatement, double back pay, and compensation for litigation costs. At the California state level, additional protections apply. California Labor Code Section 1102.5 prohibits employers from retaliating against employees who report suspected violations of state or federal laws. California Health and Safety Code provides additional protections for healthcare workers who report patient safety concerns. These state protections may provide remedies beyond federal law, including emotional distress damages. What constitutes retaliation can sometimes be subtle. It is not always a termination or demotion. It can be a pattern of small adverse actions that collectively create a hostile environment for the reporter. Examples include",
          estDurationSec: 64
        },
        {
          id: "GAO-005-L4-C3",
          type: "content",
          title: "Whistleblower Protections (part 3)",
          body: "consistently receiving the worst shift assignments after filing a report, being excluded from team meetings or professional development opportunities, receiving vague or unjustified negative performance feedback, having previously approved time-off requests suddenly denied, and supervisors making comments about…",
          narration: "consistently receiving the worst shift assignments after filing a report, being excluded from team meetings or professional development opportunities, receiving vague or unjustified negative performance feedback, having previously approved time-off requests suddenly denied, and supervisors making comments about loyalty or trust that are directed at the reporter. If you believe you are experiencing retaliation, document everything with dates, times, specific actions, and witnesses. Report the retaliation through a separate compliance channel — not through the same supervisor who may be retaliating. The agency investigates retaliation claims with the same rigor as other compliance concerns, and confirmed retaliation results in disciplinary action against the retaliator, up to and including termination. Remember: your protection is not conditional on the outcome of the investigation. Whether the original concern is substantiated or not, your right to report without retaliation is absolute as long as you reported in good faith. ---",
          estDurationSec: 63
        },
        {
          id: "GAO-005-L4-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Whistleblower Protections\"?",
          narration: "What is the key takeaway from \"Whistleblower Protections\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-005-L4-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Whistleblower Protections\"?",
            narration: "What is the key takeaway from \"Whistleblower Protections\"?",
            options: [
              {
                id: "a",
                label: "Whistleblower protection is the foundation that makes the entire compliance reporting system work.",
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
            policyRef: "CO-CP-006",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Whistleblower protection is the foundation that makes the entire compliance reporting system work. Without protection, employees will not report, and without reports, violations go undetected."
          }
        }
      ]
    },
    {
      id: "GAO-005-L5",
      order: 5,
      title: "Module Summary",
      objectives: [
        "Apply key requirements from Module Summary",
        "Identify correct field actions related to Module Summary"
      ],
      cards: [
        {
          id: "GAO-005-L5-S",
          type: "summary",
          title: "Module Summary",
          body: "Let us consolidate the essentials of compliance reporting and whistleblower protections. Care Indeed provides five reporting channels: your direct supervisor for routine concerns, the Compliance Officer for any compliance issue, the anonymous hotline for confidential reporting, the Administrator if…",
          narration: "In this lesson: Module Summary. Let us consolidate the essentials of compliance reporting and whistleblower protections. Care Indeed provides five reporting channels: your direct supervisor for routine concerns, the Compliance Officer for any compliance issue, the anonymous hotline for confidential reporting, the Administrator if other channels are compromised, and external agencies including the OIG Hotline and the California Department of…",
          estDurationSec: 45
        },
        {
          id: "GAO-005-L5-C1",
          type: "content",
          title: "Module Summary",
          body: "Let us consolidate the essentials of compliance reporting and whistleblower protections. Care Indeed provides five reporting channels: your direct supervisor for routine concerns, the Compliance Officer for any compliance issue, the anonymous hotline for confidential reporting, the Administrator if other channels are…",
          narration: "Let us consolidate the essentials of compliance reporting and whistleblower protections. Care Indeed provides five reporting channels: your direct supervisor for routine concerns, the Compliance Officer for any compliance issue, the anonymous hotline for confidential reporting, the Administrator if other channels are compromised, and external agencies including the OIG Hotline and the California Department of Public Health for situations where internal channels are insufficient. You do not need certainty to report. A good-faith belief that something may be wrong is sufficient. The Compliance Officer investigates and determines whether a violation occurred. Your job is to report, not to investigate. Reportable concerns include billing irregularities, documentation falsification, patient care quality issues, workplace conduct violations, regulatory noncompliance, HIPAA breaches, and financial misconduct. When reporting, provide as much detail as possible including what you observed, when, where, who was involved, and any supporting documentation. But a partial report is always better than no",
          estDurationSec: 64
        },
        {
          id: "GAO-005-L5-C2",
          type: "content",
          title: "Module Summary (part 2)",
          body: "report. After you report, the Compliance Officer assesses severity, may take immediate protective action for patient safety, investigates by gathering evidence and interviewing parties, determines findings, implements corrective actions, and documents the entire process.",
          narration: "report. After you report, the Compliance Officer assesses severity, may take immediate protective action for patient safety, investigates by gathering evidence and interviewing parties, determines findings, implements corrective actions, and documents the entire process. Significant findings are reported to the Governing Body. Whistleblower protection operates on three levels: agency policy CO-CP-005, federal law including the False Claims Act qui tam provisions, and California state law including Labor Code Section 1102.5. Retaliation is broadly defined and includes any adverse employment action motivated by reporting. Retaliation is a terminable offense. If you experience retaliation, document it and report through a separate channel. Your protection does not depend on the investigation outcome. It depends on your good faith at the time of reporting. For your daily practice, remember these principles. First, see something, say something. Do not rationalize away concerns or assume someone else will handle it. Second, use whichever reporting channel you",
          estDurationSec: 64
        },
        {
          id: "GAO-005-L5-C3",
          type: "content",
          title: "Module Summary (part 3)",
          body: "are most comfortable with. You do not have to follow a specific order. Third, you cannot be punished for good-faith reporting, period. Fourth, timing matters — report as soon as you become aware of a concern. And fifth, do not investigate on your own. Report and let the Compliance Officer handle the investigation.",
          narration: "are most comfortable with. You do not have to follow a specific order. Third, you cannot be punished for good-faith reporting, period. Fourth, timing matters — report as soon as you become aware of a concern. And fifth, do not investigate on your own. Report and let the Compliance Officer handle the investigation. The compliance reporting system works only if employees use it. Every report that is filed, investigated, and resolved strengthens the agency's compliance culture. Every concern that goes unreported weakens it. You are a critical part of this system. You are now ready for the final exam. Ten questions, eighty percent to pass.",
          estDurationSec: 45
        },
        {
          id: "GAO-005-L5-CH",
          type: "challenge",
          title: "Scenario Challenge 2 Scenario: A coworker confides in you…",
          body: "Scenario Challenge 2 Scenario: A coworker confides in you that they reported a HIPAA concern about a supervisor three weeks ago, and since then the supervisor has given them unfavorable performance ratings and excluded…",
          narration: "Scenario Challenge 2 Scenario: A coworker confides in you that they reported a HIPAA concern about a supervisor three weeks ago, and since then the supervisor has given them unfavorable performance ratings and excluded them from team meetings.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-005-L5-CH-Q",
            format: "scenario_decision",
            prompt: "Scenario Challenge 2 Scenario: A coworker confides in you that they reported a HIPAA concern about a supervisor three weeks ago, and since then the supervisor has given them unfavorable performance ratings and excluded them from team meetings.",
            narration: "Scenario Challenge 2 Scenario: A coworker confides in you that they reported a HIPAA concern about a supervisor three weeks ago, and since then the supervisor has given them unfavorable performance ratings and excluded them from team meetings.",
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
            policyRef: "CO-CP-006",
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
    id: "GAO-005-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Compliance Hotline & Reporting. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "The compliance hotline at Care Indeed is:",
        narration: "The compliance hotline at Care Indeed is:",
        options: [
          {
            id: "a",
            label: "Only for use by supervisors and managers -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Available to all employees, including anonymously -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Only for reporting criminal activity |",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Monitored by external law enforcement",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q1 from AAA Record v2.0 for GAO-005.",
        policyRef: "CO-CP-006"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "When should you report a suspected compliance violation? -",
        narration: "When should you report a suspected compliance violation? -",
        options: [
          {
            id: "a",
            label: "After gathering sufficient evidence",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "At the next team meeting - C) As soon as you become aware of the concern",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Only during business hours",
            isCorrect: true,
            feedback: "Correct."
          }
        ],
        rationale: "Source exam item Q2 from AAA Record v2.0 for GAO-005.",
        policyRef: "CO-CP-006"
      },
      {
        id: "q3",
        format: "scenario_decision",
        prompt: "If your direct supervisor is involved in the suspected violation, you should:",
        narration: "If your direct supervisor is involved in the suspected violation, you should:",
        options: [
          {
            id: "a",
            label: "Report to the supervisor anyway per chain of command -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Report directly to the Compliance Officer, hotline, or Administrator -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Wait until the supervisor transfers |",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Discuss it with coworkers first",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q3 from AAA Record v2.0 for GAO-005.",
        policyRef: "CO-CP-006"
      },
      {
        id: "q4",
        format: "scenario_decision",
        prompt: "Whistleblower protection applies:",
        narration: "Whistleblower protection applies:",
        options: [
          {
            id: "a",
            label: "Only when the reported violation is confirmed -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Only for reports made through the anonymous hotline -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "To all good-faith reports regardless of investigation outcome -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Only during the first 90 days of employment",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q4 from AAA Record v2.0 for GAO-005.",
        policyRef: "CO-CP-006"
      },
      {
        id: "q5",
        format: "scenario_decision",
        prompt: "Which of the following is an example of retaliation?",
        narration: "Which of the following is an example of retaliation?",
        options: [
          {
            id: "a",
            label: "Being asked to participate in the investigation as a witness -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Receiving consistently unfavorable shift assignments after filing a compliance report -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "c",
            label: "Attending mandatory retraining |",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Being counseled for an unrelated performance issue ### Expansion (Q6–Q10)",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q5 from AAA Record v2.0 for GAO-005.",
        policyRef: "CO-CP-006"
      },
      {
        id: "q6",
        format: "scenario_decision",
        prompt: "How many reporting channels does Care Indeed provide for compliance concerns? -",
        narration: "How many reporting channels does Care Indeed provide for compliance concerns? -",
        options: [
          {
            id: "a",
            label: "2",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "3",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "4",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "5",
            isCorrect: true,
            feedback: "Correct."
          }
        ],
        rationale: "Source exam item Q6 from AAA Record v2.0 for GAO-005.",
        policyRef: "CO-CP-006"
      },
      {
        id: "q7",
        format: "scenario_decision",
        prompt: "After a compliance report is filed, what is the FIRST thing the Compliance Officer does?",
        narration: "After a compliance report is filed, what is the FIRST thing the Compliance Officer does?",
        options: [
          {
            id: "a",
            label: "Terminates the accused employee |",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "Contacts law enforcement -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Conducts an initial assessment of severity and immediate risk -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Notifies the reporter that the case is closed",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q7 from AAA Record v2.0 for GAO-005.",
        policyRef: "CO-CP-006"
      },
      {
        id: "q8",
        format: "scenario_decision",
        prompt: "The False Claims Act qui tam provision allows:",
        narration: "The False Claims Act qui tam provision allows:",
        options: [
          {
            id: "a",
            label: "Agencies to fire whistleblowers |",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "b",
            label: "The government to eliminate the compliance hotline -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Employees to file lawsuits on behalf of the government against employers who submit false claims -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "d",
            label: "Physicians to self-refer patients",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q8 from AAA Record v2.0 for GAO-005.",
        policyRef: "CO-CP-006"
      },
      {
        id: "q9",
        format: "scenario_decision",
        prompt: "Should you attempt to investigate a suspected violation yourself before reporting?",
        narration: "Should you attempt to investigate a suspected violation yourself before reporting?",
        options: [
          {
            id: "a",
            label: "No — report the concern and let the Compliance Officer investigate -",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Yes, if you can do it discreetly |",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Only if your supervisor approves -",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Yes, to strengthen your report with evidence",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Source exam item Q9 from AAA Record v2.0 for GAO-005.",
        policyRef: "CO-CP-006"
      }
    ]
  }
},
  {
    moduleId: 'GAO-006',
    policyRefs: ['CO-CP-005'],
    cmsRefs: [],
    estimatedDurationMin: 45,
    durationSource: 'DEFAULT',
    splash: {
      title: 'Whistleblower Protection',
      subtitle: 'Your protections when you report in good faith',
      whyItMatters:
        'Whistleblower protection is a federal right under the False Claims Act and reinforced by state law. Knowing your protections increases reporting and reduces undetected fraud, which in turn protects every patient and every paycheck at the agency.',
      narration:
        'In this module you will learn the legal protections that apply when you report a compliance concern in good faith, and what to do if you suspect retaliation.',
      imageUrl: IMG.whistle,
    },
    navigation: {
      title: 'How This Training Works',
      body: 'One card at a time. Narration plays. Challenges required.',
      bullets: ['Card-by-card', 'Narration required', 'Challenges required', '80% pass'],
      narration: 'Card by card. Narration on every card. Challenges required. Eighty percent to pass.',
    },
    lessons: [
      {
        id: 'GAO-006-L1',
        order: 1,
        title: 'Protections and Obligations',
        objectives: [
          'Identify federal and state whistleblower protections',
          'Recognize signs of retaliation',
          'Describe the process for reporting suspected retaliation',
        ],
        cards: [
          {
            id: 'GAO-006-L1-S',
            type: 'summary',
            title: 'What You Will Learn',
            body: 'Federal protection under the False Claims Act qui tam provisions; state-level protections; non-retaliation guarantee in policy CO-CP-005; obligation to report and right to be protected.',
            narration:
              'In this lesson you will learn federal protection under the False Claims Act qui tam provisions, state-level whistleblower protections, the non-retaliation guarantee in our policy, and your obligation to report alongside your right to be protected.',
            estDurationSec: 45,
          },
          {
            id: 'GAO-006-L1-C1',
            type: 'content',
            title: 'Federal Protection â€” False Claims Act',
            body: 'The False Claims Act protects employees who report government fraud and may entitle a successful qui tam relator to a portion of recovered funds. Retaliation is independently actionable in federal court.',
            narration:
              'The False Claims Act protects employees who report government fraud. A successful qui tam relator may receive a portion of recovered funds. Retaliation against a relator is independently actionable in federal court and has resulted in seven-figure judgments.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-006-L1-C2',
            type: 'content',
            title: 'Recognizing Retaliation',
            body: 'Retaliation includes: termination, demotion, schedule manipulation, harassment, written warnings without basis, denial of training, exclusion from meetings, and hostile work environment created after a report.',
            narration:
              'Retaliation can take many forms: termination, demotion, schedule manipulation, harassment, baseless written warnings, denial of training, exclusion from meetings, and hostile work environment after a report. If any of these begin within ninety days of your report, document it and escalate.',
            estDurationSec: 60,
          },
          {
            id: 'GAO-006-L1-C3',
            type: 'content',
            title: 'Reporting Suspected Retaliation',
            body: 'Document dates, actors, actions, and witnesses. Report to the Compliance Officer using the same hotline used for the original report. The retaliation matter is investigated separately by an independent reviewer.',
            narration:
              'If you suspect retaliation, document the dates, the actors involved, the specific actions, and any witnesses. Report it to the Compliance Officer through the same hotline you used for the original concern. The retaliation matter is then investigated separately by an independent reviewer.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-006-L1-CH',
            type: 'challenge',
            title: 'Is It Retaliation?',
            body: 'Three weeks after you reported a billing concern, your supervisor moves you to weekend-only shifts and excludes you from team huddles.',
            narration: 'Three weeks after you reported a billing concern, your supervisor moves you to weekend-only shifts and excludes you from team huddles. Is this retaliation?',
            estDurationSec: 50,
            challenge: {
              id: 'GAO-006-L1-CH-Q',
              format: 'scenario_decision',
              prompt: 'How do you respond?',
              narration: 'How do you respond?',
              options: [
                { id: 'a', label: 'Accept the changes â€” your supervisor has scheduling authority.', isCorrect: false, feedback: 'Authority to schedule does not authorize retaliation. Document and report.' },
                { id: 'b', label: 'Document the changes, the timing, and witnesses; report to the Compliance Officer.', isCorrect: true, feedback: 'Correct. Documentation and timely escalation preserve your protection.' },
                { id: 'c', label: 'Quit and pursue other employment.', isCorrect: false, feedback: 'Resignation can be construed as constructive discharge and complicates the case; report first.' },
                { id: 'd', label: 'Confront the supervisor publicly.', isCorrect: false, feedback: 'Public confrontation creates additional issues and does not preserve evidence.' },
              ],
              policyRef: 'CO-CP-005',
              feedbackCorrect: 'Documentation, timing analysis, and prompt escalation are the elements that build a defensible retaliation case.',
              feedbackIncorrect: 'The supervisor\'s authority to schedule does not include the right to retaliate. Document and report.',
              complianceImpact: 'Retaliation against a reporter is independently actionable under FCA and state law and is a terminable offense under CO-CP-005.',
              realWorldConsequence: 'Documented retaliation cases have resulted in reinstatement plus back pay, attorney fees, and punitive damages.',
              correctBehaviorGuidance: 'Document everything in writing. Use the hotline. Do not resign before reporting; resignation complicates the legal posture.',
            },
          },
        ],
      },
      {
        id: 'GAO-006-L2',
        order: 2,
        title: 'Good-Faith Reporting Standard',
        objectives: [
          'Define good-faith reporting',
          'Distinguish good-faith from malicious reporting',
        ],
        cards: [
          {
            id: 'GAO-006-L2-S',
            type: 'summary',
            title: 'Good-Faith Standard',
            body: 'Good-faith means a reasonable belief based on observed facts. You do not need to prove the case. Malicious or knowingly false reports are not protected and may be subject to discipline.',
            narration: 'In this lesson you will learn the good-faith reporting standard. Good faith means a reasonable belief based on observed facts. You do not need to prove the case. Malicious or knowingly false reports are not protected and may themselves be subject to discipline.',
            estDurationSec: 50,
          },
          {
            id: 'GAO-006-L2-C1',
            type: 'content',
            title: 'Reasonable Belief',
            body: 'Reasonable belief is based on what a similarly trained employee would conclude from the same facts. Speculation is not enough; observation is. When you saw, heard, or were told something, document it factually.',
            narration: 'Reasonable belief is based on what a similarly trained employee would conclude from the same facts. Speculation alone is not enough; observation is. When you saw, heard, or were told something, document it factually and report.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-006-L2-C2',
            type: 'content',
            title: 'Bad-Faith Reporting',
            body: 'A bad-faith report is one made knowing the allegation is false, or made primarily to harm the subject. Bad-faith reporting voids whistleblower protection and is a separate offense.',
            narration: 'A bad-faith report is one made knowing the allegation is false, or made primarily to harm the subject. Bad-faith reporting voids whistleblower protection and is itself a separate offense subject to discipline.',
            estDurationSec: 50,
          },
          {
            id: 'GAO-006-L2-CH',
            type: 'challenge',
            title: 'Good Faith or Bad Faith',
            body: 'Two scenarios. Identify which is protected good-faith reporting.',
            narration: 'Two scenarios. Identify which is protected good-faith reporting.',
            estDurationSec: 45,
            challenge: {
              id: 'GAO-006-L2-CH-Q',
              format: 'matching',
              prompt: 'Match each scenario to its category.',
              narration: 'Match each scenario to good-faith or bad-faith reporting.',
              matches: [
                { left: 'You report a coworker\'s suspicious billing pattern after observing two duplicate entries.', right: 'Good-faith â€” protected' },
                { left: 'You report a coworker for stealing supplies because they got the promotion you wanted, with no observation.', right: 'Bad-faith â€” not protected' },
                { left: 'You report a near-miss medication error you witnessed, even though no harm occurred.', right: 'Good-faith â€” protected' },
                { left: 'You file an anonymous report with fabricated details to settle a personal dispute.', right: 'Bad-faith â€” not protected' },
              ],
              policyRef: 'CO-CP-005',
              feedbackCorrect: 'Good faith requires observation and reasonable belief. Bad faith involves fabrication or improper motive.',
              feedbackIncorrect: 'Personal grudges and fabrication remove protection. Reasonable belief based on observation is always protected.',
              complianceImpact: 'Bad-faith reporting damages program integrity and triggers separate discipline under HR-ER-002.',
              realWorldConsequence: 'Bad-faith reporters have been terminated and, in extreme cases, sued by the falsely accused party.',
              correctBehaviorGuidance: 'Report what you observed. Stick to facts. If your motive is questionable, pause and consult the Compliance Officer first.',
            },
          },
        ],
      },
    ],
    finalTest: {
      id: 'GAO-006-FT',
      passingScorePct: 0.80,
      instructionsNarration: 'Final test on whistleblower protection. Eighty percent required.',
      failAction: 'remediation',
      questions: [
        {
          id: 'GAO-006-FT-Q1',
          format: 'error_id',
          prompt: 'Identify which actions are retaliation.',
          narration: 'Identify which of the following actions constitute retaliation against a reporter.',
          errorTargets: [
            { id: 'r1', description: 'Termination immediately following a hotline report â€” retaliation' },
            { id: 'r2', description: 'Annual performance review with consistent prior ratings â€” NOT retaliation' },
            { id: 'r3', description: 'Sudden assignment to all weekend shifts after a report â€” retaliation' },
            { id: 'r4', description: 'Required attendance at this compliance training â€” NOT retaliation' },
          ],
          rationale: 'Adverse actions tied in time to a report are presumed retaliatory; routine HR actions consistent with prior practice are not.',
          policyRef: 'CO-CP-005',
        },
        {
          id: 'GAO-006-FT-Q2',
          format: 'true_false',
          prompt: 'A successful qui tam relator may receive a portion of recovered funds.',
          narration: 'True or false: a successful qui tam relator may receive a portion of recovered funds.',
          options: [
            { id: 't', label: 'True', isCorrect: true, feedback: 'Correct.' },
            { id: 'f', label: 'False', isCorrect: false, feedback: 'False â€” qui tam relators may receive 15-30% of recovery.' },
          ],
          rationale: 'Qui tam financial reward is part of the federal anti-fraud incentive structure.',
          policyRef: 'CO-CP-005',
        },
        {
          id: 'GAO-006-FT-Q3',
          format: 'sequencing',
          prompt: 'Place the steps for responding to suspected retaliation in correct order.',
          narration: 'Place the steps for responding to suspected retaliation in correct order.',
          steps: [
            { id: 's1', label: 'Document dates, actors, actions, and witnesses' },
            { id: 's2', label: 'Report to the Compliance Officer through the hotline' },
            { id: 's3', label: 'Cooperate with the independent investigation' },
            { id: 's4', label: 'Preserve all written communications and schedules' },
          ],
          correctOrder: ['s4', 's1', 's2', 's3'],
          rationale: 'Preservation comes first to prevent loss of evidence; then documentation, escalation, and cooperation.',
          policyRef: 'CO-CP-005',
        },
        {
          id: 'GAO-006-FT-Q4',
          format: 'structured_input',
          prompt: 'Name the federal statute that includes whistleblower protection for healthcare fraud reporters.',
          narration: 'Name the federal statute that includes whistleblower protection for healthcare fraud reporters.',
          fields: [
            { id: 'fca', label: 'Statute', acceptableAnswers: ['False Claims Act', 'FCA', 'false claims act', '31 USC 3730'] },
          ],
          rationale: 'The False Claims Act qui tam provisions are the dominant federal whistleblower protection in healthcare.',
          policyRef: 'CO-CP-005',
        },
      ],
    },
  },
  {
    moduleId: 'GAO-007',
    policyRefs: ['CO-HP-001', 'CO-HP-004'],
    cmsRefs: ['45 CFR 164'],
    estimatedDurationMin: 45,
    durationSource: 'CMS',
    splash: {
      title: 'HIPAA Privacy â€” PHI Handling and Minimum Necessary',
      subtitle: 'How to use, disclose, and protect Protected Health Information',
      whyItMatters:
        'HIPAA privacy violations are the #1 published OCR enforcement action against home health. Settlements regularly exceed one million dollars per incident, and individual employees can face criminal prosecution under the privacy rule.',
      narration:
        'In this module you will learn the HIPAA privacy rules that govern Protected Health Information, the minimum necessary standard, and your individual obligations when handling patient information.',
      imageUrl: IMG.hipaa,
    },
    navigation: {
      title: 'How This Training Works',
      body: 'One card at a time. Narration plays on every card. Challenges required. 80% pass.',
      bullets: ['Single-card flow', 'Narration on every card', 'Required challenges', '80% pass'],
      narration: 'One card at a time. Narration on every card. Challenges required. Eighty percent to pass.',
    },
    lessons: [
      {
        id: 'GAO-007-L1',
        order: 1,
        title: 'PHI Definitions and Permitted Uses',
        objectives: [
          'Define Protected Health Information',
          'List the 18 HIPAA identifiers',
          'Identify permitted uses without authorization (TPO)',
        ],
        cards: [
          {
            id: 'GAO-007-L1-S',
            type: 'summary',
            title: 'What You Will Learn',
            body: 'PHI definition, the 18 HIPAA identifiers, and the three categories of permitted use without patient authorization: Treatment, Payment, and Health Care Operations (TPO).',
            narration:
              'In this lesson you will learn the definition of Protected Health Information, the eighteen HIPAA identifiers, and the three categories of permitted use without patient authorization: treatment, payment, and health care operations, often abbreviated TPO.',
            estDurationSec: 45,
          },
          {
            id: 'GAO-007-L1-C1',
            type: 'content',
            title: 'What Is PHI',
            body: 'PHI is any individually identifiable health information held or transmitted by a covered entity, in any form: paper, electronic, or oral. A patient name plus a diagnosis is PHI. A patient address plus a visit date is PHI.',
            narration:
              'Protected Health Information, or PHI, is any individually identifiable health information held or transmitted by a covered entity, in any form: paper, electronic, or oral. A patient name combined with a diagnosis is PHI. A patient address combined with a visit date is PHI.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-007-L1-C2',
            type: 'content',
            title: '18 HIPAA Identifiers',
            body: 'Common identifiers: name, address, dates (birth, admission), phone, email, SSN, MRN, account number, license, vehicle, device serial, URL, IP, biometric, full-face photo, and any other unique identifier. De-identification requires all 18 removed.',
            narration:
              'The eighteen HIPAA identifiers include: name, address, dates such as birth or admission, phone, email, social security number, medical record number, account number, license, vehicle, device serial, URL, IP address, biometric, full-face photo, and any other unique identifier. De-identification requires every one of the eighteen to be removed.',
            estDurationSec: 70,
          },
          {
            id: 'GAO-007-L1-C3',
            type: 'content',
            title: 'TPO Permitted Uses',
            body: 'Treatment, Payment, and Health Care Operations are permitted uses without patient authorization. Marketing, research (most), and most disclosures to family beyond directory require authorization. When in doubt, escalate to the Privacy Officer.',
            narration:
              'Treatment, payment, and health care operations are permitted uses without patient authorization. Marketing, most research, and most disclosures to family beyond directory information require written authorization. When you are in doubt, escalate to the Privacy Officer before disclosing.',
            estDurationSec: 60,
          },
          {
            id: 'GAO-007-L1-CH',
            type: 'challenge',
            title: 'PHI or Not',
            body: 'Identify which of the following pieces of information are PHI when held by our agency.',
            narration: 'Identify which of the following pieces of information are PHI when held by our agency.',
            estDurationSec: 60,
            challenge: {
              id: 'GAO-007-L1-CH-Q',
              format: 'matching',
              prompt: 'Match each item to PHI or NOT PHI.',
              narration: 'Match each item to whether it is PHI or not PHI.',
              matches: [
                { left: 'Patient name + diagnosis', right: 'PHI' },
                { left: 'Patient address + visit date', right: 'PHI' },
                { left: 'De-identified aggregate readmission rate (no identifiers)', right: 'NOT PHI' },
                { left: 'Photo of patient wound with chart label visible', right: 'PHI' },
                { left: 'Internal staff schedule with no patient identifiers', right: 'NOT PHI' },
              ],
              policyRef: 'CO-HP-001',
              feedbackCorrect: 'Correct. Combinations of identifiers with health information create PHI; de-identified aggregates do not.',
              feedbackIncorrect: 'Any item that combines an identifier with health context is PHI. Photos with visible chart labels are PHI.',
              complianceImpact: 'Misclassification of PHI is the leading root cause of inadvertent breach in home health.',
              realWorldConsequence: 'OCR has settled cases for unencrypted laptops containing PHI for amounts exceeding three million dollars.',
              correctBehaviorGuidance: 'When in doubt, treat the information as PHI. Encryption, secure transport, minimum necessary apply by default.',
            },
          },
        ],
      },
      {
        id: 'GAO-007-L2',
        order: 2,
        title: 'Minimum Necessary',
        objectives: [
          'Apply the minimum necessary standard',
          'Identify exceptions to minimum necessary',
        ],
        cards: [
          {
            id: 'GAO-007-L2-S',
            type: 'summary',
            title: 'Minimum Necessary Overview',
            body: 'Use, disclose, and request only the minimum PHI needed to accomplish the intended purpose. Treatment by the treating clinician is an exception (full record permitted). Most other uses require minimum necessary.',
            narration:
              'In this lesson you will learn the minimum necessary standard. You must use, disclose, and request only the minimum PHI needed to accomplish the intended purpose. Treatment by the treating clinician is an exception, where the full record is permitted. Most other uses require minimum necessary.',
            estDurationSec: 50,
          },
          {
            id: 'GAO-007-L2-C1',
            type: 'content',
            title: 'Apply Minimum Necessary in Practice',
            body: 'Examples: a billing clerk receives only billing-relevant fields, not full clinical notes. A scheduler sees patient name and visit time, not the diagnosis. An aide sees the care plan summary, not the full physician notes.',
            narration:
              'In practice: a billing clerk receives only billing-relevant fields, not the full clinical notes. A scheduler sees patient name and visit time, not the diagnosis. A home health aide sees the care plan summary needed to deliver care, not the full physician notes. Each role gets only what the role needs.',
            estDurationSec: 60,
          },
          {
            id: 'GAO-007-L2-C2',
            type: 'content',
            title: 'Exceptions to Minimum Necessary',
            body: 'Exceptions: disclosures to the patient, disclosures for treatment by the treating clinician, disclosures required by law, and disclosures pursuant to patient authorization. All other disclosures must follow minimum necessary.',
            narration:
              'Minimum necessary does not apply to: disclosures to the patient themselves, disclosures for treatment by the treating clinician, disclosures required by law, and disclosures pursuant to a valid patient authorization. Every other disclosure must follow the minimum necessary standard.',
            estDurationSec: 55,
          },
          {
            id: 'GAO-007-L2-C3',
            type: 'content',
            title: 'Role-Based Access',
            body: 'Our PHI access matrix in CO-HP-004 maps each role to allowed data fields. Access is provisioned by role at hire and adjusted on role change or termination within 24 hours.',
            narration:
              'Our PHI access matrix maps each role to its allowed data fields. Access is provisioned by role at hire and is adjusted on any role change or termination within twenty-four hours. If your role changes, your access changes.',
            estDurationSec: 50,
          },
          {
            id: 'GAO-007-L2-CH',
            type: 'challenge',
            title: 'Minimum Necessary Decision',
            body: 'A scheduler asks you to forward a patient\'s most recent physician progress note so she "knows what to expect." The patient has not authorized this disclosure.',
            narration: 'A scheduler asks you to forward the patient\'s most recent physician progress note so she knows what to expect. The patient has not authorized this. What do you do?',
            estDurationSec: 50,
            challenge: {
              id: 'GAO-007-L2-CH-Q',
              format: 'scenario_decision',
              prompt: 'What is the correct response?',
              narration: 'What is the correct response?',
              options: [
                { id: 'a', label: 'Forward the note â€” schedulers are part of the agency.', isCorrect: false, feedback: 'Being part of the agency does not bypass minimum necessary.' },
                { id: 'b', label: 'Decline and provide only the appointment-relevant data the scheduler needs.', isCorrect: true, feedback: 'Correct. Schedulers receive only scheduling-relevant fields.' },
                { id: 'c', label: 'Ask the patient by phone for verbal authorization.', isCorrect: false, feedback: 'Authorization is unnecessary for routine scheduling; minimum necessary is the right control.' },
                { id: 'd', label: 'Forward the note and document it.', isCorrect: false, feedback: 'Documenting an over-disclosure does not make it permissible.' },
              ],
              policyRef: 'CO-HP-004',
              feedbackCorrect: 'Schedulers receive only the data needed for scheduling. Curtailing the disclosure to scheduling-relevant fields satisfies minimum necessary.',
              feedbackIncorrect: 'Over-disclosure inside the agency is still a HIPAA breach. Minimum necessary applies to internal use too.',
              complianceImpact: 'Internal over-disclosure has been cited in OCR resolutions and is auditable in any privacy review.',
              realWorldConsequence: 'OCR settlements for internal access violations have included multi-year monitoring and corrective action plans.',
              correctBehaviorGuidance: 'Disclose only the minimum fields the recipient needs. Apply the role-based access matrix.',
            },
          },
        ],
      },
    ],
    finalTest: {
      id: 'GAO-007-FT',
      passingScorePct: 0.80,
      instructionsNarration: 'Final test on HIPAA privacy and minimum necessary. Eighty percent required.',
      failAction: 'remediation',
      questions: [
        {
          id: 'GAO-007-FT-Q1',
          format: 'matching',
          prompt: 'Match each disclosure to whether minimum necessary applies.',
          narration: 'Match each disclosure to whether minimum necessary applies.',
          matches: [
            { left: 'Disclosure to the treating physician', right: 'Minimum necessary does NOT apply' },
            { left: 'Disclosure to the patient about themselves', right: 'Minimum necessary does NOT apply' },
            { left: 'Disclosure to internal billing for claim submission', right: 'Minimum necessary applies' },
            { left: 'Disclosure required by court subpoena', right: 'Minimum necessary does NOT apply (required by law)' },
            { left: 'Disclosure to a marketing vendor', right: 'Authorization required + minimum necessary' },
          ],
          rationale: 'The exceptions are limited and specific; everything else requires minimum necessary per CO-HP-004 (Minimum Necessary Standard).',
          policyRef: 'CO-HP-004 (Minimum Necessary Standard)',
        },
        {
          id: 'GAO-007-FT-Q2',
          format: 'error_id',
          prompt: 'Identify the privacy violations in this scenario.',
          narration: 'Identify each privacy violation in the following scenario.',
          errorTargets: [
            { id: 'e1', description: 'Aide texting patient diagnosis to spouse using personal phone â€” unencrypted PHI transmission' },
            { id: 'e2', description: 'Posting wound photo on personal Instagram with patient face visible â€” public PHI disclosure' },
            { id: 'e3', description: 'Discussing patient case in a public coffee shop â€” verbal disclosure in public area' },
            { id: 'e4', description: 'Encrypted EMR note shared with the treating physician â€” NOT a violation' },
          ],
          rationale: 'Personal-device PHI transmission, social media disclosure, and public verbal discussion are textbook breaches per CO-HP-001 (HIPAA Privacy Program).',
          policyRef: 'CO-HP-001 (HIPAA Privacy Program)',
        },
        {
          id: 'GAO-007-FT-Q3',
          format: 'true_false',
          prompt: 'You may discuss patient details with a colleague in the agency hallway as long as no patient is present.',
          narration: 'True or false: you may discuss patient details with a colleague in the agency hallway as long as no patient is present.',
          options: [
            { id: 't', label: 'True', isCorrect: false, feedback: 'False â€” discussion in common areas where others can overhear violates minimum necessary.' },
            { id: 'f', label: 'False', isCorrect: true, feedback: 'Correct.' },
          ],
          rationale: 'Verbal disclosures in common areas violate minimum necessary per CO-HP-001 (HIPAA Privacy Program); they are a common survey citation source.',
          policyRef: 'CO-HP-001 (HIPAA Privacy Program)',
        },
        {
          id: 'GAO-007-FT-Q4',
          format: 'structured_input',
          prompt: 'Name the standard requiring you to use, disclose, and request only the PHI needed for the purpose.',
          narration: 'Name the HIPAA standard that requires you to use, disclose, and request only the PHI needed for the purpose.',
          fields: [
            { id: 'std', label: 'Standard', acceptableAnswers: ['minimum necessary', 'Minimum Necessary', 'minimum necessary standard', 'Minimum Necessary Standard'] },
          ],
          rationale: 'Minimum necessary per CO-HP-004 (Minimum Necessary Standard) is the foundational HIPAA privacy standard; it must be recallable on demand.',
          policyRef: 'CO-HP-004 (Minimum Necessary Standard)',
        },
        {
          id: 'GAO-007-FT-Q5',
          format: 'scenario_decision',
          prompt: 'A scheduler asks you to forward a patient\'s most recent physician progress note so she "knows what to expect." The patient has not authorized this disclosure. What is correct?',
          narration: 'A scheduler asks for the full physician progress note for a patient. Choose the correct action per policy.',
          options: [
            { id: 'a', label: 'Forward the note — schedulers are internal agency staff.', isCorrect: false, feedback: 'Internal status does not override minimum necessary.' },
            { id: 'b', label: 'Decline and provide only the appointment-relevant scheduling data the scheduler actually needs.', isCorrect: true, feedback: 'Correct. Apply minimum necessary even internally.' },
            { id: 'c', label: 'Forward the note after documenting the request.', isCorrect: false, feedback: 'Documenting does not authorize over-disclosure.' },
            { id: 'd', label: 'Call the patient for verbal OK to send everything.', isCorrect: false, feedback: 'Authorization is not the issue; minimum necessary limits what is shared for the purpose.' },
          ],
          rationale: 'Directly from lesson in CO-HP-004 (Minimum Necessary Standard): schedulers receive only data needed for their role. Over-disclosure inside the agency violates the rule.',
          policyRef: 'CO-HP-004 (Minimum Necessary Standard)',
        },
        {
          id: 'GAO-007-FT-Q6',
          format: 'true_false',
          prompt: 'Minimum necessary applies to internal uses and disclosures within the agency.',
          narration: 'True or false: minimum necessary applies to internal uses and disclosures within the agency.',
          options: [
            { id: 't', label: 'True', isCorrect: true, feedback: 'Correct.' },
            { id: 'f', label: 'False', isCorrect: false, feedback: 'False — the rule applies to all uses and disclosures except narrow exceptions.' },
          ],
          rationale: 'Per CO-HP-004 (Minimum Necessary Standard) lesson and challenge: minimum necessary applies internally (e.g., to schedulers, billing); only specific exceptions (treatment by physician, patient access, required by law) do not require it.',
          policyRef: 'CO-HP-004 (Minimum Necessary Standard)',
        },
      ],
    },
  }
];
