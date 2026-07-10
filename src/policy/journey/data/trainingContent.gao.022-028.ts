/* GAO Phase 1 trainings — Modules 022-027 + EXAM (AAA v2 for 022-027; EXAM preserved) */

import type { ModuleTraining } from './trainingContent.types';

const NAV_BULLETS = ["Single-card view","Audio narration on every card","Challenges required to advance","80% to pass final test"];
const NAV_NARRATION = "One card at a time. Audio narration on every card. Challenges must be completed before you continue. The final test requires eighty percent to pass.";
const NAV_BODY = "You will move through one card at a time. Use Next and Previous to navigate. Your progress, time on each card, and challenge responses are tracked for compliance. Skipping cards is not allowed.";

export const GAO_TRAININGS_022_028: ModuleTraining[] = [
  {
  moduleId: "GAO-022",
  policyRefs: [
    "HR-ER-003"
  ],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "Employee Grievance Process",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Welcome to GAO-022, Employee Grievance Process. Every workplace has disagreements. What matters is how they are resolved.",
    narration: "Welcome to GAO-022, Employee Grievance Process. Welcome to GAO-022, Employee Grievance Process. Every workplace has disagreements. What matters is how they are resolved."
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
      id: "GAO-022-L1",
      order: 1,
      title: "Understanding the Grievance Process",
      objectives: [
        "Apply key requirements from Understanding the Grievance Process",
        "Identify correct field actions related to Understanding the Grievance Process"
      ],
      cards: [
        {
          id: "GAO-022-L1-S",
          type: "summary",
          title: "Understanding the Grievance Process",
          body: "Welcome to GAO-022, Employee Grievance Process. Every workplace has disagreements. What matters is how they are resolved. Care Indeed is committed to providing a fair, transparent, and accessible process for employees to raise concerns, challenge decisions, and seek resolution.",
          narration: "In this lesson: Understanding the Grievance Process. Welcome to GAO-022, Employee Grievance Process. Every workplace has disagreements. What matters is how they are resolved. Care Indeed is committed to providing a fair, transparent, and accessible process for employees to raise concerns, challenge decisions, and seek resolution. This module explains the grievance process, your rights within it, and how to use it effectively.",
          estDurationSec: 45
        },
        {
          id: "GAO-022-L1-C1",
          type: "content",
          title: "Understanding the Grievance Process",
          body: "Welcome to GAO-022, Employee Grievance Process. Every workplace has disagreements. What matters is how they are resolved. Care Indeed is committed to providing a fair, transparent, and accessible process for employees to raise concerns, challenge decisions, and seek resolution.",
          narration: "Welcome to GAO-022, Employee Grievance Process. Every workplace has disagreements. What matters is how they are resolved. Care Indeed is committed to providing a fair, transparent, and accessible process for employees to raise concerns, challenge decisions, and seek resolution. This module explains the grievance process, your rights within it, and how to use it effectively. First, let us define what a grievance is. A grievance is a formal complaint by an employee about a workplace issue that the employee believes violates a policy, is unfair, or creates an adverse working condition. Grievances are different from day-to-day feedback conversations. A grievance is a structured process with defined steps, timelines, and review levels. What issues can be grieved? The grievance process covers: disciplinary actions you believe are unjust or disproportionate; inconsistent application of policies — being held to a different standard than colleagues for the same behavior; workplace conditions that affect your",
          estDurationSec: 64
        },
        {
          id: "GAO-022-L1-C2",
          type: "content",
          title: "Understanding the Grievance Process (part 2)",
          body: "ability to do your job safely or effectively; scheduling disputes, assignment concerns, or workload imbalances; interpersonal conflicts with colleagues or supervisors that have not been resolved informally; compensation or benefit disputes; denial of requested accommodations under ADA or FEHA; and any other workplace…",
          narration: "ability to do your job safely or effectively; scheduling disputes, assignment concerns, or workload imbalances; interpersonal conflicts with colleagues or supervisors that have not been resolved informally; compensation or benefit disputes; denial of requested accommodations under ADA or FEHA; and any other workplace concern where you believe you have been treated unfairly. What issues are NOT handled through the grievance process? Harassment and discrimination complaints follow the separate investigation process described in GAO-019. Workplace safety hazards are reported through the safety incident reporting system. Compliance concerns — such as suspected fraud, billing irregularities, or patient care violations — are reported through the compliance hotline and are handled as compliance investigations. Whistleblower protections apply to these reports under separate federal and California law. The distinction matters because each process has different protections, timelines, and review bodies. If you are unsure which process applies to your situation, HR can guide you. Care",
          estDurationSec: 64
        },
        {
          id: "GAO-022-L1-C3",
          type: "content",
          title: "Understanding the Grievance Process (part 3)",
          body: "Indeed encourages informal resolution before formal grievance filing. Many workplace issues can be resolved through direct conversation. If you have a concern with a colleague, consider speaking with them directly first, in a private and professional manner.",
          narration: "Indeed encourages informal resolution before formal grievance filing. Many workplace issues can be resolved through direct conversation. If you have a concern with a colleague, consider speaking with them directly first, in a private and professional manner. If you have a concern with your supervisor's decision, schedule a one-on-one meeting to discuss it. Care Indeed maintains an open-door policy — you may approach any manager, not just your direct supervisor, with workplace concerns. Many issues are resolved at this stage without formal process. However, if informal resolution is not possible, not appropriate, or has been tried without success, the formal grievance process is available. Here are the steps. Step One: File a written grievance with your immediate supervisor within 10 business days of the event or decision you are grieving. The written grievance should include: your name and position; the date of the event or decision; a factual description of",
          estDurationSec: 64
        },
        {
          id: "GAO-022-L1-C4",
          type: "content",
          title: "Understanding the Grievance Process (part 4)",
          body: "what happened; the policy, procedure, or standard you believe was violated or unfairly applied; any witnesses or supporting documentation; and the resolution you are seeking. Be specific about the resolution. 'I want fairness' is not actionable.",
          narration: "what happened; the policy, procedure, or standard you believe was violated or unfairly applied; any witnesses or supporting documentation; and the resolution you are seeking. Be specific about the resolution. 'I want fairness' is not actionable. 'I want the written warning removed from my file because the policy was applied inconsistently' is. Your supervisor must respond in writing within five business days. The response should acknowledge the grievance, summarize any investigation or review conducted, and state the decision with rationale. Step Two: If you are not satisfied with your supervisor's response, you may escalate to HR within five business days of receiving the Step One response. HR will conduct an independent review, which may include interviewing you, your supervisor, witnesses, and reviewing relevant documents. HR will issue a written determination within 10 business days. Step Three: If you are not satisfied with the HR determination, you may appeal to the",
          estDurationSec: 64
        },
        {
          id: "GAO-022-L1-C5",
          type: "content",
          title: "Understanding the Grievance Process (part 5)",
          body: "Administrator or designee within five business days. This is the final internal review level. The Administrator will review the complete grievance file, may conduct additional interviews, and will issue a final written decision within 10 business days.",
          narration: "Administrator or designee within five business days. This is the final internal review level. The Administrator will review the complete grievance file, may conduct additional interviews, and will issue a final written decision within 10 business days. The Administrator's decision is final within the internal grievance process. At any stage, either party may request mediation — a facilitated conversation with a neutral third party to help find a mutually acceptable resolution. Mediation is voluntary and does not replace the formal steps, but it can be an effective alternative. All grievance proceedings are documented and maintained in a confidential grievance file separate from your regular personnel file. Grievance records are retained for the legally required period and are accessible only to HR, the reviewing managers, and you. Knowledge Check 1: What are the three formal steps of the grievance process? (Answer: Step 1 — Written grievance to supervisor, Step 2 —",
          estDurationSec: 64
        },
        {
          id: "GAO-022-L1-C6",
          type: "content",
          title: "Understanding the Grievance Process (part 6)",
          body: "Escalation to HR, Step 3 — Appeal to Administrator.) ---",
          narration: "Escalation to HR, Step 3 — Appeal to Administrator.) ---",
          estDurationSec: 35
        },
        {
          id: "GAO-022-L1-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Understanding the Grievance Process\"?",
          narration: "What is the key takeaway from \"Understanding the Grievance Process\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-022-L1-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Understanding the Grievance Process\"?",
            narration: "What is the key takeaway from \"Understanding the Grievance Process\"?",
            options: [
              {
                id: "a",
                label: "Welcome to GAO-022, Employee Grievance Process. Every workplace has disagreements. What matters is how they are resolved.",
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
            policyRef: "HR-ER-003",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Welcome to GAO-022, Employee Grievance Process. Every workplace has disagreements. What matters is how they are resolved."
          }
        }
      ]
    },
    {
      id: "GAO-022-L2",
      order: 2,
      title: "Your Rights, Anti-Retaliation & External Remedies",
      objectives: [
        "Apply key requirements from Your Rights, Anti-Retaliation & External Remedies",
        "Identify correct field actions related to Your Rights, Anti-Retaliation & External Remedies"
      ],
      cards: [
        {
          id: "GAO-022-L2-S",
          type: "summary",
          title: "Your Rights, Anti-Retaliation & External Remedies",
          body: "Your rights during the grievance process are protected by both Care Indeed policy and California law. Let us walk through each one. You have the right to file a grievance without retaliation. This is perhaps the most important protection. Filing a grievance is a protected activity.",
          narration: "In this lesson: Your Rights, Anti-Retaliation & External Remedies. Your rights during the grievance process are protected by both Care Indeed policy and California law. Let us walk through each one. You have the right to file a grievance without retaliation. This is perhaps the most important protection. Filing a grievance is a protected activity.",
          estDurationSec: 45
        },
        {
          id: "GAO-022-L2-C1",
          type: "content",
          title: "Your Rights, Anti-Retaliation & External Remedies",
          body: "Your rights during the grievance process are protected by both Care Indeed policy and California law. Let us walk through each one. You have the right to file a grievance without retaliation. This is perhaps the most important protection. Filing a grievance is a protected activity.",
          narration: "Your rights during the grievance process are protected by both Care Indeed policy and California law. Let us walk through each one. You have the right to file a grievance without retaliation. This is perhaps the most important protection. Filing a grievance is a protected activity. No supervisor, manager, or colleague may take adverse action against you because you filed a grievance. Adverse actions include: termination, demotion, or reduction in hours; reassignment to less desirable duties or locations; exclusion from training, projects, or advancement; negative performance evaluations that do not reflect actual performance; and hostile or dismissive treatment. If you experience retaliation after filing a grievance, report it immediately through the compliance hotline. Retaliation is treated as a separate, independently disciplinable offense. You have the right to a fair and timely process. The timelines defined in the grievance procedure are binding on both you and the agency. If the agency",
          estDurationSec: 64
        },
        {
          id: "GAO-022-L2-C2",
          type: "content",
          title: "Your Rights, Anti-Retaliation & External Remedies (part 2)",
          body: "fails to respond within the specified timeframe, you may escalate to the next level automatically. This prevents grievances from being ignored or delayed indefinitely. You have the right to representation. At any formal grievance meeting, you may bring a colleague or representative for support.",
          narration: "fails to respond within the specified timeframe, you may escalate to the next level automatically. This prevents grievances from being ignored or delayed indefinitely. You have the right to representation. At any formal grievance meeting, you may bring a colleague or representative for support. If you are covered by a collective bargaining agreement, you have the right to union representation. The representative may observe, take notes, and provide you with advice but may not answer questions on your behalf during the meeting. You have the right to review evidence. You may request copies of any documents used in the decision you are grieving, subject to confidentiality restrictions. If a disciplinary decision was based on a specific incident report, you are entitled to see that report. If a scheduling decision was based on seniority data, you are entitled to see the relevant seniority information. You have the right to submit additional",
          estDurationSec: 64
        },
        {
          id: "GAO-022-L2-C3",
          type: "content",
          title: "Your Rights, Anti-Retaliation & External Remedies (part 3)",
          body: "evidence at any stage. If you discover new information relevant to your grievance after filing, you may submit it. The reviewing authority must consider all submitted evidence. Now let us discuss external remedies. The internal grievance process is not your only option.",
          narration: "evidence at any stage. If you discover new information relevant to your grievance after filing, you may submit it. The reviewing authority must consider all submitted evidence. Now let us discuss external remedies. The internal grievance process is not your only option. You always retain the right to file a complaint with external agencies. The California Division of Labor Standards Enforcement, or DLSE, handles wage and hour disputes, retaliation claims, and labor law violations. The California Civil Rights Department, formerly DFEH, handles discrimination and harassment complaints. The federal Equal Employment Opportunity Commission, or EEOC, handles federal discrimination complaints. The Occupational Safety and Health Administration, or OSHA, handles workplace safety complaints. And the Medicare hotline accepts complaints about quality of care and compliance in Medicare-certified agencies. Filing an internal grievance does not waive your right to file an external complaint, and vice versa. However, some external agencies prefer that you attempt",
          estDurationSec: 64
        },
        {
          id: "GAO-022-L2-C4",
          type: "content",
          title: "Your Rights, Anti-Retaliation & External Remedies (part 4)",
          body: "internal resolution first. Consult with the agency or an attorney if you are unsure about timing. Let us discuss practical tips for effective grievance use. First, document everything contemporaneously. Keep a personal log of events, conversations, and decisions relevant to your concern.",
          narration: "internal resolution first. Consult with the agency or an attorney if you are unsure about timing. Let us discuss practical tips for effective grievance use. First, document everything contemporaneously. Keep a personal log of events, conversations, and decisions relevant to your concern. Note dates, times, exact quotes, and witnesses. Memory fades, but written records do not. Second, be factual and specific in your grievance filing. Emotional language weakens your position; factual language strengthens it. Instead of 'My supervisor has it in for me,' write 'On May 3, I received a written warning for late documentation. My colleague [Name] has the same documentation compliance rate and has not received a warning. I believe the policy is being applied inconsistently.' Third, propose a reasonable resolution. Asking for your supervisor to be fired is unlikely to succeed. Asking for the written warning to be rescinded based on inconsistent application is reasonable. Fourth, follow",
          estDurationSec: 64
        },
        {
          id: "GAO-022-L2-C5",
          type: "content",
          title: "Your Rights, Anti-Retaliation & External Remedies (part 5)",
          body: "the timelines. If you miss the 10-business-day filing deadline, your grievance may be denied on procedural grounds. Mark the dates on your calendar and file promptly. Fifth, remain professional throughout. The grievance process works best when all parties engage in good faith.",
          narration: "the timelines. If you miss the 10-business-day filing deadline, your grievance may be denied on procedural grounds. Mark the dates on your calendar and file promptly. Fifth, remain professional throughout. The grievance process works best when all parties engage in good faith. Being adversarial, threatening, or hostile undermines your case and may create additional issues. Finally, let us acknowledge that the grievance process can feel intimidating. Standing up to a supervisor's decision, putting a complaint in writing, and going through a formal process takes courage. Care Indeed wants you to use this process when you need it. It is not a sign of trouble — it is a sign of a workplace that takes fairness seriously. The vast majority of grievances result in improved communication, clarified expectations, and better working relationships. Use the process. It exists for you. Policy Reference: HR-ER-003 — Employee Grievance Procedure. This policy contains the complete",
          estDurationSec: 64
        },
        {
          id: "GAO-022-L2-C6",
          type: "content",
          title: "Your Rights, Anti-Retaliation & External Remedies (part 6)",
          body: "grievance process, forms, timelines, and appeal rights. You are encouraged to read the full policy as a separate P&P activity. Note: completing this training module does not constitute acknowledgment of the formal policy. Policy acknowledgment is a separate assigned activity.",
          narration: "grievance process, forms, timelines, and appeal rights. You are encouraged to read the full policy as a separate P&P activity. Note: completing this training module does not constitute acknowledgment of the formal policy. Policy acknowledgment is a separate assigned activity. Knowledge Check 2: Within how many business days must you file a formal grievance after the event or decision? (Answer: 10 business days.) Scenario Practice 1: You received a final written warning for three incidents of not completing the patient fall risk assessment on initial visits. You believe you completed the assessment on two of the three visits, but the EHR experienced a system error that lost your entries. Your supervisor does not believe you. What do you do? Expected Response: (1) File a written grievance within 10 business days. (2) In the grievance, state: the dates of the alleged missing assessments, your belief that you completed them, the EHR",
          estDurationSec: 64
        },
        {
          id: "GAO-022-L2-C7",
          type: "content",
          title: "Your Rights, Anti-Retaliation & External Remedies (part 7)",
          body: "system errors you experienced (include help desk ticket numbers if you reported the errors), any screenshots or timestamps showing your login and activity. (3) Request that IT review the EHR audit log for those dates to verify whether entries were created and lost.",
          narration: "system errors you experienced (include help desk ticket numbers if you reported the errors), any screenshots or timestamps showing your login and activity. (3) Request that IT review the EHR audit log for those dates to verify whether entries were created and lost. (4) Specify your requested resolution: removal or downgrade of the final written warning if the system error is confirmed. (5) If your supervisor denies the grievance at Step 1, escalate to HR at Step 2 with the same evidence. Scenario Practice 2: You have been working at Care Indeed for two years. A newer employee with less experience is promoted to a lead position over you. You believe the decision was based on the manager's personal friendship with the newer employee rather than qualifications. What do you do? Expected Response: (1) First, try informal resolution: request a meeting with the hiring manager to understand the selection criteria",
          estDurationSec: 64
        },
        {
          id: "GAO-022-L2-C8",
          type: "content",
          title: "Your Rights, Anti-Retaliation & External Remedies (part 8)",
          body: "and how candidates were evaluated. (2) If the explanation is unsatisfactory and you believe the process was unfair, file a formal grievance. (3) In the grievance: state the position, the selection criteria (if known), your qualifications vs.",
          narration: "and how candidates were evaluated. (2) If the explanation is unsatisfactory and you believe the process was unfair, file a formal grievance. (3) In the grievance: state the position, the selection criteria (if known), your qualifications vs. the selected candidate's qualifications (experience, certifications, performance ratings), and your belief that the selection was not merit-based. (4) Request that HR review the selection process for compliance with the agency's promotion policy. (5) If you believe the decision was based on a protected characteristic (e.g., age, race, gender) rather than favoritism, this may be a discrimination complaint rather than a grievance — consult HR about the appropriate process. Training Module Complete — Scenario Practice Complete --- ## COMPETENCY ASSESSMENT — 10 Questions (80% Pass Score) ### Canonical Questions (Q1–Q5) Q1. A grievance is defined as: - A) Any verbal complaint to a colleague - B) A formal complaint about a workplace issue believed",
          estDurationSec: 64
        },
        {
          id: "GAO-022-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Your Rights, Anti-Retaliation & External Remedies\"?",
          narration: "What is the key takeaway from \"Your Rights, Anti-Retaliation & External Remedies\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-022-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Your Rights, Anti-Retaliation & External Remedies\"?",
            narration: "What is the key takeaway from \"Your Rights, Anti-Retaliation & External Remedies\"?",
            options: [
              {
                id: "a",
                label: "Your rights during the grievance process are protected by both Care Indeed policy and California law. Let us walk through each one.",
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
            policyRef: "HR-ER-003",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Your rights during the grievance process are protected by both Care Indeed policy and California law. Let us walk through each one. You have the right to file a grievance without retaliation."
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-022-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Employee Grievance Process. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Understanding the Grievance Process\"?",
        narration: "Which statement best reflects the teaching in \"Understanding the Grievance Process\"?",
        options: [
          {
            id: "a",
            label: "Welcome to GAO-022, Employee Grievance Process. Every workplace has disagreements.",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Skip documentation if the visit was brief.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Wait until annual survey to report concerns.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only supervisors need to follow this requirement.",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from GAO-022 page: Understanding the Grievance Process",
        policyRef: "HR-ER-003"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Your Rights, Anti-Retaliation & External Remedies\"?",
        narration: "Which statement best reflects the teaching in \"Your Rights, Anti-Retaliation & External Remedies\"?",
        options: [
          {
            id: "a",
            label: "Your rights during the grievance process are protected by both Care Indeed policy and California law.",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Skip documentation if the visit was brief.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Wait until annual survey to report concerns.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only supervisors need to follow this requirement.",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from GAO-022 page: Your Rights, Anti-Retaliation & External Remedies",
        policyRef: "HR-ER-003"
      },
      {
        id: "q3",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Understanding the Grievance Process\".",
        narration: "True or false: staff must apply the requirements taught in \"Understanding the Grievance Process\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content.",
        policyRef: "HR-ER-003"
      },
      {
        id: "q4",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Your Rights, Anti-Retaliation & External Remedies\".",
        narration: "True or false: staff must apply the requirements taught in \"Your Rights, Anti-Retaliation & External Remedies\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content.",
        policyRef: "HR-ER-003"
      },
      {
        id: "q5",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Understanding the Grievance Process\".",
        narration: "True or false: staff must apply the requirements taught in \"Understanding the Grievance Process\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content.",
        policyRef: "HR-ER-003"
      }
    ]
  }
},
  {
  moduleId: "GAO-023",
  policyRefs: [
    "IT-UP-001",
    "IT-UP-002",
    "IT-UP-003"
  ],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "IT Acceptable Use — Email & Social Media",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Welcome to GAO-023, IT Acceptable Use — Email and Social Media. Technology is essential to modern home health care.",
    narration: "Welcome to GAO-023, IT Acceptable Use — Email & Social Media. Welcome to GAO-023, IT Acceptable Use — Email and Social Media. Technology is essential to modern home health care."
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
      id: "GAO-023-L1",
      order: 1,
      title: "Acceptable Use of Agency IT Resources",
      objectives: [
        "Apply key requirements from Acceptable Use of Agency IT Resources",
        "Identify correct field actions related to Acceptable Use of Agency IT Resources"
      ],
      cards: [
        {
          id: "GAO-023-L1-S",
          type: "summary",
          title: "Acceptable Use of Agency IT Resources",
          body: "Welcome to GAO-023, IT Acceptable Use — Email and Social Media. Technology is essential to modern home health care. You use electronic health records to document patient visits, email to communicate with colleagues and physicians, smartphones to coordinate schedules, and possibly tablets or laptops…",
          narration: "In this lesson: Acceptable Use of Agency IT Resources. Welcome to GAO-023, IT Acceptable Use — Email and Social Media. Technology is essential to modern home health care. You use electronic health records to document patient visits, email to communicate with colleagues and physicians, smartphones to coordinate schedules, and possibly tablets or laptops for point-of-care documentation. Each of these tools carries both power and responsibility.",
          estDurationSec: 45
        },
        {
          id: "GAO-023-L1-C1",
          type: "content",
          title: "Acceptable Use of Agency IT Resources",
          body: "Welcome to GAO-023, IT Acceptable Use — Email and Social Media. Technology is essential to modern home health care. You use electronic health records to document patient visits, email to communicate with colleagues and physicians, smartphones to coordinate schedules, and possibly tablets or laptops for point-of-care…",
          narration: "Welcome to GAO-023, IT Acceptable Use — Email and Social Media. Technology is essential to modern home health care. You use electronic health records to document patient visits, email to communicate with colleagues and physicians, smartphones to coordinate schedules, and possibly tablets or laptops for point-of-care documentation. Each of these tools carries both power and responsibility. This module explains what is acceptable and what is prohibited when using agency IT resources and when engaging on social media in ways that may affect your role at Care Indeed. Care Indeed's IT Acceptable Use policies are referenced as Policy Reference: IT-UP-001 (IT Acceptable Use), IT-UP-002 (Email Use Policy), and IT-UP-003 (Social Media Policy). These three policies work together to define the boundaries of technology use in your employment. Let us start with the fundamental principle: agency-provided IT resources are agency property. This includes laptops, tablets, smartphones, email accounts, software licenses, and network",
          estDurationSec: 64
        },
        {
          id: "GAO-023-L1-C2",
          type: "content",
          title: "Acceptable Use of Agency IT Resources (part 2)",
          body: "access. These resources are provided to you for the purpose of performing your job. While limited personal use is permitted, agency IT resources are not private. Care Indeed reserves the right to monitor, access, review, and audit any data on agency-owned devices, agency email accounts, and agency network traffic.",
          narration: "access. These resources are provided to you for the purpose of performing your job. While limited personal use is permitted, agency IT resources are not private. Care Indeed reserves the right to monitor, access, review, and audit any data on agency-owned devices, agency email accounts, and agency network traffic. You have no expectation of privacy on agency IT resources. This includes email sent and received through your agency email address, internet browsing history on agency devices, files stored on agency devices or cloud accounts, and text messages sent through agency phones or messaging platforms. This monitoring is not about surveillance for its own sake. It exists to protect patient privacy under HIPAA, to ensure compliance with regulatory requirements, to protect agency data from security threats, and to investigate incidents when necessary. Acceptable use of agency IT resources includes: all work-related activities including documentation, communication, research, training, and scheduling; limited personal",
          estDurationSec: 64
        },
        {
          id: "GAO-023-L1-C3",
          type: "content",
          title: "Acceptable Use of Agency IT Resources (part 3)",
          body: "use during breaks that does not interfere with work duties, consume excessive bandwidth, or create security risks; and accessing professional development resources, clinical references, and industry publications.",
          narration: "use during breaks that does not interfere with work duties, consume excessive bandwidth, or create security risks; and accessing professional development resources, clinical references, and industry publications. Prohibited use includes: accessing, downloading, or distributing pornographic, offensive, discriminatory, or threatening content; using agency resources for personal commercial activities, side businesses, or freelance work; installing unauthorized software, applications, or browser extensions on agency devices; sharing your login credentials with anyone, including colleagues; using agency email for personal mass mailings, chain letters, or solicitations; accessing patient records for any purpose other than treatment, payment, or healthcare operations as defined by HIPAA; downloading or transmitting patient data to personal devices, personal email accounts, or unauthorized cloud storage; and using agency resources to violate any law or agency policy. Email communication requires particular attention in healthcare. Your agency email address represents Care Indeed. Every email you send reflects on the agency. Follow these guidelines: use",
          estDurationSec: 64
        },
        {
          id: "GAO-023-L1-C4",
          type: "content",
          title: "Acceptable Use of Agency IT Resources (part 4)",
          body: "professional language and formatting in all work emails; include your full name and title in your email signature; never send Protected Health Information via unencrypted email — use the agency's secure messaging system or encrypted email for any communication containing patient names, diagnoses, treatment plans,…",
          narration: "professional language and formatting in all work emails; include your full name and title in your email signature; never send Protected Health Information via unencrypted email — use the agency's secure messaging system or encrypted email for any communication containing patient names, diagnoses, treatment plans, addresses, or any of the 18 HIPAA identifiers; verify the recipient's email address before sending — misdirected emails containing PHI are reportable HIPAA breaches; use the 'Reply All' function judiciously — not everyone on a thread needs every response; and never use email to communicate urgent clinical information — call the physician or supervisor directly for urgent matters. Text messaging is a common communication tool in home health, but it carries significant HIPAA risk. General scheduling messages like 'Can you cover a visit at 3 PM?' are acceptable. Messages containing patient information are not acceptable on standard SMS texting. If you need to communicate patient-specific",
          estDurationSec: 64
        },
        {
          id: "GAO-023-L1-C5",
          type: "content",
          title: "Acceptable Use of Agency IT Resources (part 5)",
          body: "information via text, use only the agency-approved secure messaging platform that provides encryption and audit logging. Never text a patient's name, diagnosis, address, or any identifiable health information on standard SMS, iMessage, WhatsApp, or any non-approved platform.",
          narration: "information via text, use only the agency-approved secure messaging platform that provides encryption and audit logging. Never text a patient's name, diagnosis, address, or any identifiable health information on standard SMS, iMessage, WhatsApp, or any non-approved platform. Bring Your Own Device, or BYOD, is permitted at Care Indeed with conditions. If you use your personal smartphone or tablet for work purposes — such as accessing the EHR app, agency email, or secure messaging — you must: enroll the device in the agency's Mobile Device Management system, which allows remote wipe of agency data if the device is lost or stolen; maintain a device passcode or biometric lock; keep the device's operating system and security patches current; and agree that agency data on your personal device may be remotely wiped if you leave employment or if a security incident occurs. The MDM system accesses only the agency application container — it",
          estDurationSec: 64
        },
        {
          id: "GAO-023-L1-C6",
          type: "content",
          title: "Acceptable Use of Agency IT Resources (part 6)",
          body: "does not access your personal photos, messages, or apps. Knowledge Check 1: Why does Care Indeed state you have no expectation of privacy on agency IT resources? (Answer: Agency devices are agency property provided for work purposes.",
          narration: "does not access your personal photos, messages, or apps. Knowledge Check 1: Why does Care Indeed state you have no expectation of privacy on agency IT resources? (Answer: Agency devices are agency property provided for work purposes. Monitoring protects patient privacy under HIPAA, ensures regulatory compliance, and enables security incident investigation.) ---",
          estDurationSec: 35
        },
        {
          id: "GAO-023-L1-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Acceptable Use of Agency IT Resources\"?",
          narration: "What is the key takeaway from \"Acceptable Use of Agency IT Resources\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-023-L1-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Acceptable Use of Agency IT Resources\"?",
            narration: "What is the key takeaway from \"Acceptable Use of Agency IT Resources\"?",
            options: [
              {
                id: "a",
                label: "Welcome to GAO-023, IT Acceptable Use — Email and Social Media. Technology is essential to modern home health care.",
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
            policyRef: "IT-UP-001",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Welcome to GAO-023, IT Acceptable Use — Email and Social Media. Technology is essential to modern home health care."
          }
        }
      ]
    },
    {
      id: "GAO-023-L2",
      order: 2,
      title: "Social Media Policy & Patient Privacy",
      objectives: [
        "Apply key requirements from Social Media Policy & Patient Privacy",
        "Identify correct field actions related to Social Media Policy & Patient Privacy"
      ],
      cards: [
        {
          id: "GAO-023-L2-S",
          type: "summary",
          title: "Social Media Policy & Patient Privacy",
          body: "Social media has transformed communication. Most of us have personal accounts on platforms like Facebook, Instagram, TikTok, X, LinkedIn, or others. Your personal social media is your business — with critical exceptions related to your role as a healthcare professional.",
          narration: "In this lesson: Social Media Policy & Patient Privacy. Social media has transformed communication. Most of us have personal accounts on platforms like Facebook, Instagram, TikTok, X, LinkedIn, or others. Your personal social media is your business — with critical exceptions related to your role as a healthcare professional. Care Indeed's Social Media Policy establishes clear boundaries.",
          estDurationSec: 45
        },
        {
          id: "GAO-023-L2-C1",
          type: "content",
          title: "Social Media Policy & Patient Privacy",
          body: "Social media has transformed communication. Most of us have personal accounts on platforms like Facebook, Instagram, TikTok, X, LinkedIn, or others. Your personal social media is your business — with critical exceptions related to your role as a healthcare professional.",
          narration: "Social media has transformed communication. Most of us have personal accounts on platforms like Facebook, Instagram, TikTok, X, LinkedIn, or others. Your personal social media is your business — with critical exceptions related to your role as a healthcare professional. Care Indeed's Social Media Policy establishes clear boundaries. On your personal social media, you may not: post any patient information, including names, photos, videos, locations, diagnoses, stories, or any detail that could identify a patient, even without using their name — in a home health context, even saying 'visited a patient today in the Sunset district who has a beautiful garden' could identify the patient to someone who knows the neighborhood; take photos or videos inside patient homes, of patients, of patient medical equipment, or of anything that could reveal patient identity — this prohibition is absolute, regardless of whether you intend to post the image; post photos of yourself",
          estDurationSec: 64
        },
        {
          id: "GAO-023-L2-C2",
          type: "content",
          title: "Social Media Policy & Patient Privacy (part 2)",
          body: "in uniform or with agency branding while describing specific patient situations or clinical scenarios; make statements on behalf of Care Indeed without explicit authorization from agency leadership; post content that harasses, bullies, or threatens colleagues, patients, or community partners; or share confidential…",
          narration: "in uniform or with agency branding while describing specific patient situations or clinical scenarios; make statements on behalf of Care Indeed without explicit authorization from agency leadership; post content that harasses, bullies, or threatens colleagues, patients, or community partners; or share confidential agency business information including financial data, strategic plans, staffing details, or internal communications. What can you do on personal social media? You may identify yourself as a Care Indeed employee in general terms. You may share general industry articles, healthcare news, or professional development content. You may advocate for healthcare causes, nursing profession issues, or community health. You may post about your work life in general terms that do not identify patients or disclose confidential information — for example, 'Had a challenging but rewarding day in home health' is acceptable. The line between acceptable and prohibited can be blurry. When in doubt, apply the newspaper test: Would you",
          estDurationSec: 64
        },
        {
          id: "GAO-023-L2-C3",
          type: "content",
          title: "Social Media Policy & Patient Privacy (part 3)",
          body: "be comfortable if this post appeared on the front page of the newspaper with your name and Care Indeed's name attached? If the answer is no, do not post it. One area that catches many healthcare workers off guard is the apparently innocent patient photo. You may think, 'Mrs.",
          narration: "be comfortable if this post appeared on the front page of the newspaper with your name and Care Indeed's name attached? If the answer is no, do not post it. One area that catches many healthcare workers off guard is the apparently innocent patient photo. You may think, 'Mrs. Garcia is so sweet, she would love if I posted our selfie together.' Even with the patient's verbal permission, do not take or post photos of patients. Verbal consent for a social media photo does not meet HIPAA authorization requirements. A valid HIPAA authorization for use of patient images must be in writing, must describe the specific use, must identify who will see the image, must include an expiration date, and must inform the patient of their right to revoke. No casual selfie meets these requirements. If there is a legitimate clinical or marketing reason to photograph a patient, the agency",
          estDurationSec: 64
        },
        {
          id: "GAO-023-L2-C4",
          type: "content",
          title: "Social Media Policy & Patient Privacy (part 4)",
          body: "marketing or compliance team will manage the proper authorization. Let us discuss another social media risk: online reviews and public complaints. If a patient or family member posts a negative review of Care Indeed on Google, Yelp, or social media, you may be tempted to respond and defend the agency.",
          narration: "marketing or compliance team will manage the proper authorization. Let us discuss another social media risk: online reviews and public complaints. If a patient or family member posts a negative review of Care Indeed on Google, Yelp, or social media, you may be tempted to respond and defend the agency. Do not respond to patient reviews. Even acknowledging that someone is a patient is a HIPAA violation. The appropriate response to online reviews is handled exclusively by authorized agency personnel. LinkedIn and professional networking require the same boundary awareness. Your LinkedIn profile may list Care Indeed as your employer. Your professional posts may discuss home health industry topics, career achievements, and professional development. However, the same patient privacy rules apply. Do not include patient stories, outcomes, or identifiable scenarios in professional posts, presentations, or articles without proper de-identification and agency approval. Monitoring and enforcement: Care Indeed does not routinely monitor",
          estDurationSec: 64
        },
        {
          id: "GAO-023-L2-C5",
          type: "content",
          title: "Social Media Policy & Patient Privacy (part 5)",
          body: "employees' personal social media. However, if a social media post is brought to the agency's attention — by a colleague, patient, family member, or community member — that appears to violate patient privacy, harass colleagues, or damage the agency's reputation, the agency will investigate.",
          narration: "employees' personal social media. However, if a social media post is brought to the agency's attention — by a colleague, patient, family member, or community member — that appears to violate patient privacy, harass colleagues, or damage the agency's reputation, the agency will investigate. Consequences for social media policy violations follow the progressive discipline framework covered in GAO-021, with the exception that HIPAA violations involving patient information may result in immediate termination and regulatory reporting. A final note on professional boundaries and social media: do not accept friend requests or follow requests from current patients on any personal social media platform. The therapeutic relationship requires professional boundaries. Social media connections blur those boundaries. If a patient sends you a friend request, politely explain that agency policy prevents you from accepting. If a patient contacts you through social media about their care, redirect them to the agency phone number. Policy Reference:",
          estDurationSec: 64
        },
        {
          id: "GAO-023-L2-C6",
          type: "content",
          title: "Social Media Policy & Patient Privacy (part 6)",
          body: "IT-UP-001 (IT Acceptable Use), IT-UP-002 (Email Use Policy), IT-UP-003 (Social Media Policy). These policies contain detailed guidelines and examples. You are encouraged to read them as separate P&P activities. Note: completing this training module does not constitute acknowledgment of the formal policies.",
          narration: "IT-UP-001 (IT Acceptable Use), IT-UP-002 (Email Use Policy), IT-UP-003 (Social Media Policy). These policies contain detailed guidelines and examples. You are encouraged to read them as separate P&P activities. Note: completing this training module does not constitute acknowledgment of the formal policies. Policy acknowledgment is a separate assigned activity. Knowledge Check 2: Why should you never take photos of patients in their homes, even if the patient says it is okay? (Answer: Verbal consent does not meet HIPAA authorization requirements. A valid authorization must be in writing with specific required elements.) Scenario Practice 1: You are documenting at a coffee shop between visits using your agency laptop on the coffee shop's public Wi-Fi. You receive an email from a physician with a patient's updated medication list and need to respond with your assessment. What should you consider? Expected Response: (1) Public Wi-Fi is NOT secure — data can be intercepted.",
          estDurationSec: 64
        },
        {
          id: "GAO-023-L2-C7",
          type: "content",
          title: "Social Media Policy & Patient Privacy (part 7)",
          body: "(2) Do not send PHI over public Wi-Fi unless your agency laptop has a VPN (Virtual Private Network) that encrypts all traffic. (3) If VPN is available and active, you may proceed. (4) If VPN is not available, use your phone's cellular hotspot instead, which is more secure than public Wi-Fi.",
          narration: "(2) Do not send PHI over public Wi-Fi unless your agency laptop has a VPN (Virtual Private Network) that encrypts all traffic. (3) If VPN is available and active, you may proceed. (4) If VPN is not available, use your phone's cellular hotspot instead, which is more secure than public Wi-Fi. (5) Ensure no one can see your screen — use a privacy screen filter or position yourself with your back to a wall. (6) Do not leave the laptop unattended. (7) Send the response through the agency's secure email system, not personal email. (8) When finished, log out of all applications and lock your laptop. Scenario Practice 2: After a particularly emotional visit with a terminally ill patient, you post on your personal Instagram: 'Some days this job breaks your heart. Said goodbye to a longtime patient today in her Brentwood home. She was 87 and fought so hard.",
          estDurationSec: 64
        },
        {
          id: "GAO-023-L2-C8",
          type: "content",
          title: "Social Media Policy & Patient Privacy (part 8)",
          body: "💔 #HomehealthNurse #CareIndeed.' Is this acceptable? Expected Response: (1) NO — this post likely violates HIPAA even though no name is used.",
          narration: "💔 #HomehealthNurse #CareIndeed.' Is this acceptable? Expected Response: (1) NO — this post likely violates HIPAA even though no name is used. (2) The combination of: a specific neighborhood (Brentwood), age (87), gender (she), terminal status (said goodbye), and the agency name (#CareIndeed) could identify the patient to anyone who knows an 87-year-old woman in Brentwood receiving Care Indeed services. (3) Delete the post immediately. (4) Self-report to your supervisor or compliance — proactive reporting is treated more favorably than discovery by others. (5) A compliant version would be: 'Some days this job is emotionally challenging. Grateful for the privilege of caring for people during their most vulnerable moments. #HomeHealthNurse.' — No location, age, gender, status, or agency identifier linked to a patient event. Training Module Complete — Scenario Practice Complete --- ## COMPETENCY ASSESSMENT — 10 Questions (80% Pass Score) ### Canonical Questions (Q1–Q5) Q1. On agency-owned devices and",
          estDurationSec: 64
        },
        {
          id: "GAO-023-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Social Media Policy & Patient Privacy\"?",
          narration: "What is the key takeaway from \"Social Media Policy & Patient Privacy\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-023-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Social Media Policy & Patient Privacy\"?",
            narration: "What is the key takeaway from \"Social Media Policy & Patient Privacy\"?",
            options: [
              {
                id: "a",
                label: "Social media has transformed communication. Most of us have personal accounts on platforms like Facebook, Instagram, TikTok, X, LinkedIn, or others.",
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
            policyRef: "IT-UP-001",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Social media has transformed communication. Most of us have personal accounts on platforms like Facebook, Instagram, TikTok, X, LinkedIn, or others."
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-023-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on IT Acceptable Use — Email & Social Media. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Acceptable Use of Agency IT Resources\"?",
        narration: "Which statement best reflects the teaching in \"Acceptable Use of Agency IT Resources\"?",
        options: [
          {
            id: "a",
            label: "Welcome to GAO-023, IT Acceptable Use — Email and Social Media. Technology is essential to modern home health care.",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Skip documentation if the visit was brief.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Wait until annual survey to report concerns.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only supervisors need to follow this requirement.",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from GAO-023 page: Acceptable Use of Agency IT Resources",
        policyRef: "IT-UP-001"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Social Media Policy & Patient Privacy\"?",
        narration: "Which statement best reflects the teaching in \"Social Media Policy & Patient Privacy\"?",
        options: [
          {
            id: "a",
            label: "Social media has transformed communication. Most of us have personal accounts on platforms like Facebook, Instagram,…",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Skip documentation if the visit was brief.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Wait until annual survey to report concerns.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only supervisors need to follow this requirement.",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from GAO-023 page: Social Media Policy & Patient Privacy",
        policyRef: "IT-UP-001"
      },
      {
        id: "q3",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Acceptable Use of Agency IT Resources\".",
        narration: "True or false: staff must apply the requirements taught in \"Acceptable Use of Agency IT Resources\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content.",
        policyRef: "IT-UP-001"
      },
      {
        id: "q4",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Social Media Policy & Patient Privacy\".",
        narration: "True or false: staff must apply the requirements taught in \"Social Media Policy & Patient Privacy\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content.",
        policyRef: "IT-UP-001"
      },
      {
        id: "q5",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Acceptable Use of Agency IT Resources\".",
        narration: "True or false: staff must apply the requirements taught in \"Acceptable Use of Agency IT Resources\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content.",
        policyRef: "IT-UP-001"
      }
    ]
  }
},
  {
  moduleId: "GAO-024",
  policyRefs: [
    "IT-UP-004"
  ],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "Security Awareness — Phishing & Passwords",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Welcome to GAO-024, Security Awareness — Phishing and Passwords. Healthcare is the number one target for cyberattacks in the United States.",
    narration: "Welcome to GAO-024, Security Awareness — Phishing & Passwords. Welcome to GAO-024, Security Awareness — Phishing and Passwords. Healthcare is the number one target for cyberattacks in the United States."
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
      id: "GAO-024-L1",
      order: 1,
      title: "Phishing, Social Engineering & Threat Recognition",
      objectives: [
        "Apply key requirements from Phishing, Social Engineering & Threat Recognition",
        "Identify correct field actions related to Phishing, Social Engineering & Threat Recognition"
      ],
      cards: [
        {
          id: "GAO-024-L1-S",
          type: "summary",
          title: "Phishing, Social Engineering & Threat Recognition",
          body: "Welcome to GAO-024, Security Awareness — Phishing and Passwords. Healthcare is the number one target for cyberattacks in the United States. According to the Department of Health and Human Services, healthcare data breaches affected over 133 million individuals in 2023 alone.",
          narration: "In this lesson: Phishing, Social Engineering & Threat Recognition. Welcome to GAO-024, Security Awareness — Phishing and Passwords. Healthcare is the number one target for cyberattacks in the United States. According to the Department of Health and Human Services, healthcare data breaches affected over 133 million individuals in 2023 alone.",
          estDurationSec: 45
        },
        {
          id: "GAO-024-L1-C1",
          type: "content",
          title: "Phishing, Social Engineering & Threat Recognition",
          body: "Welcome to GAO-024, Security Awareness — Phishing and Passwords. Healthcare is the number one target for cyberattacks in the United States. According to the Department of Health and Human Services, healthcare data breaches affected over 133 million individuals in 2023 alone.",
          narration: "Welcome to GAO-024, Security Awareness — Phishing and Passwords. Healthcare is the number one target for cyberattacks in the United States. According to the Department of Health and Human Services, healthcare data breaches affected over 133 million individuals in 2023 alone. Why is healthcare targeted so heavily? Because healthcare records are extraordinarily valuable on the black market. A stolen healthcare record containing a patient's name, Social Security number, date of birth, diagnosis, and insurance information sells for $250 to $1,000 on the dark web — ten to forty times more than a stolen credit card number. And as a home health professional, you access these records every day. This module focuses on the two most common attack vectors that target individual employees: phishing and weak passwords. Understanding these threats and knowing how to respond can prevent a data breach that could affect thousands of patients, cost the agency millions of",
          estDurationSec: 64
        },
        {
          id: "GAO-024-L1-C2",
          type: "content",
          title: "Phishing, Social Engineering & Threat Recognition (part 2)",
          body: "dollars, and potentially end your career. Phishing is the fraudulent attempt to obtain sensitive information by impersonating a trustworthy source through electronic communication.",
          narration: "dollars, and potentially end your career. Phishing is the fraudulent attempt to obtain sensitive information by impersonating a trustworthy source through electronic communication. The most common form is email phishing, but phishing also occurs through text messages, called smishing, through phone calls, called vishing, and through social media messages. Let us examine how email phishing works in a healthcare context. You receive an email that appears to be from your EHR vendor, your IT department, or even your administrator. The email typically creates urgency: 'Your account will be locked in 24 hours unless you verify your credentials.' 'Unusual login activity detected — click here to secure your account.' 'New policy document requires immediate review and acknowledgment — login to access.' The email includes a link that looks legitimate but actually leads to a fake website designed to capture your username and password. Once the attacker has your credentials, they can",
          estDurationSec: 64
        },
        {
          id: "GAO-024-L1-C3",
          type: "content",
          title: "Phishing, Social Engineering & Threat Recognition (part 3)",
          body: "access patient records, send emails from your account, or move laterally through the agency's network. How do you recognize a phishing email? Look for these red flags.",
          narration: "access patient records, send emails from your account, or move laterally through the agency's network. How do you recognize a phishing email? Look for these red flags. Sender address discrepancies: the display name says 'Care Indeed IT Department' but the actual email address is it-support@care-indeed-secure.com instead of the real agency domain. Hover over the sender's name to see the actual email address. Urgency and threats: legitimate IT departments do not threaten to lock your account via email with a 24-hour deadline. They issue warnings through official channels with reasonable timelines. Grammatical errors and unusual formatting: while phishing has become more sophisticated, many attempts still contain spelling errors, awkward phrasing, or formatting inconsistencies. Suspicious links: hover over any link before clicking. Does the URL match the supposed sender? If the email claims to be from your EHR vendor but the link goes to a generic domain, it is phishing. Unexpected attachments:",
          estDurationSec: 64
        },
        {
          id: "GAO-024-L1-C4",
          type: "content",
          title: "Phishing, Social Engineering & Threat Recognition (part 4)",
          body: "do not open attachments you were not expecting, even from known contacts — their account may be compromised. Requests for credentials: no legitimate IT department, vendor, or government agency will ask you to provide your password via email. Ever.",
          narration: "do not open attachments you were not expecting, even from known contacts — their account may be compromised. Requests for credentials: no legitimate IT department, vendor, or government agency will ask you to provide your password via email. Ever. Spear phishing is a targeted form of phishing directed at specific individuals. Instead of casting a wide net, the attacker researches you personally — your name, title, colleagues' names, recent projects — and crafts a convincing email. For example: 'Hi [Your Name], [Your Supervisor's Name] asked me to share this updated patient census for your territory. Please review the attached file.' The email comes from an address that looks like your supervisor's. The attachment contains malware. Spear phishing is harder to detect because it is personalized. Business Email Compromise, or BEC, is the most financially destructive form of phishing. The attacker gains access to or spoofs an executive's email account and",
          estDurationSec: 64
        },
        {
          id: "GAO-024-L1-C5",
          type: "content",
          title: "Phishing, Social Engineering & Threat Recognition (part 5)",
          body: "sends instructions to employees — typically in finance or administration — to transfer funds, change payment details, or share sensitive data. In healthcare, BEC may also target clinical staff: 'Please send me Mr. Johnson's complete medical record for the insurance review.",
          narration: "sends instructions to employees — typically in finance or administration — to transfer funds, change payment details, or share sensitive data. In healthcare, BEC may also target clinical staff: 'Please send me Mr. Johnson's complete medical record for the insurance review. — [Administrator Name].' If you receive an unusual request for patient data, financial action, or credential sharing from a senior leader, verify through a separate communication channel. Call the person directly using their known phone number — do not reply to the suspicious email. Vishing — voice phishing — uses phone calls. Someone calls claiming to be from IT support, your health insurance provider, or a government agency. They ask you to verify your identity by providing your employee ID, login credentials, or patient information. Legitimate entities do not ask for passwords by phone. If you receive a suspicious call, hang up and call the entity directly using a",
          estDurationSec: 64
        },
        {
          id: "GAO-024-L1-C6",
          type: "content",
          title: "Phishing, Social Engineering & Threat Recognition (part 6)",
          body: "number you know is legitimate. Smishing — SMS phishing — uses text messages. 'URGENT: Your Care Indeed account requires immediate verification. Click here: [link].' Do not click links in unexpected text messages. If it seems legitimate, open a browser and navigate to the site directly rather than clicking the link.",
          narration: "number you know is legitimate. Smishing — SMS phishing — uses text messages. 'URGENT: Your Care Indeed account requires immediate verification. Click here: [link].' Do not click links in unexpected text messages. If it seems legitimate, open a browser and navigate to the site directly rather than clicking the link. Knowledge Check 1: What are four red flags of a phishing email? (Answer: Any four of: sender address discrepancy, urgency/threats, grammatical errors, suspicious links, unexpected attachments, credential requests.) ---",
          estDurationSec: 35
        },
        {
          id: "GAO-024-L1-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Phishing, Social Engineering & Threat Recognition\"?",
          narration: "What is the key takeaway from \"Phishing, Social Engineering & Threat Recognition\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-024-L1-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Phishing, Social Engineering & Threat Recognition\"?",
            narration: "What is the key takeaway from \"Phishing, Social Engineering & Threat Recognition\"?",
            options: [
              {
                id: "a",
                label: "Welcome to GAO-024, Security Awareness — Phishing and Passwords. Healthcare is the number one target for cyberattacks in the United States.",
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
            policyRef: "IT-UP-004",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Welcome to GAO-024, Security Awareness — Phishing and Passwords. Healthcare is the number one target for cyberattacks in the United States."
          }
        }
      ]
    },
    {
      id: "GAO-024-L2",
      order: 2,
      title: "Password Security, MFA & Incident Response",
      objectives: [
        "Apply key requirements from Password Security, MFA & Incident Response",
        "Identify correct field actions related to Password Security, MFA & Incident Response"
      ],
      cards: [
        {
          id: "GAO-024-L2-S",
          type: "summary",
          title: "Password Security, MFA & Incident Response",
          body: "Passwords are the first line of defense for every system you access. In healthcare, your password protects access to electronic health records containing thousands of patients' most sensitive information.",
          narration: "In this lesson: Password Security, MFA & Incident Response. Passwords are the first line of defense for every system you access. In healthcare, your password protects access to electronic health records containing thousands of patients' most sensitive information. A weak or compromised password can lead to a data breach affecting every patient in the agency's care. Let us establish password best practices. Length matters more than complexity.",
          estDurationSec: 45
        },
        {
          id: "GAO-024-L2-C1",
          type: "content",
          title: "Password Security, MFA & Incident Response",
          body: "Passwords are the first line of defense for every system you access. In healthcare, your password protects access to electronic health records containing thousands of patients' most sensitive information. A weak or compromised password can lead to a data breach affecting every patient in the agency's care.",
          narration: "Passwords are the first line of defense for every system you access. In healthcare, your password protects access to electronic health records containing thousands of patients' most sensitive information. A weak or compromised password can lead to a data breach affecting every patient in the agency's care. Let us establish password best practices. Length matters more than complexity. A 16-character passphrase like 'PurpleElephant$Dances2026!' is significantly stronger than a short complex password like 'P@s$w0rd.' Aim for at least 12 characters, but 16 or more is preferred. Use a mix of uppercase letters, lowercase letters, numbers, and special characters. Never use personal information in passwords — your name, birthday, pet's name, address, or phone number are all easily discoverable by attackers. Never reuse passwords across accounts. If your personal email password is compromised in a data breach and you use the same password for your EHR login, both are compromised. Use a",
          estDurationSec: 64
        },
        {
          id: "GAO-024-L2-C2",
          type: "content",
          title: "Password Security, MFA & Incident Response (part 2)",
          body: "unique password for every account. Password managers are strongly recommended. A password manager is a secure application that generates and stores complex, unique passwords for all your accounts. You only need to remember one strong master password.",
          narration: "unique password for every account. Password managers are strongly recommended. A password manager is a secure application that generates and stores complex, unique passwords for all your accounts. You only need to remember one strong master password. Popular password managers include 1Password, Bitwarden, and LastPass. Care Indeed may provide a specific recommendation — check with IT. Never share your password with anyone. Not your supervisor, not IT support, not a colleague who needs to look something up. If someone needs access to a system, they need their own credentials. Sharing passwords violates HIPAA because it eliminates the ability to audit who accessed what. If you receive a call from someone claiming to be IT support asking for your password 'to fix a problem,' it is a social engineering attack. Legitimate IT support can reset your password through administrative tools — they never need you to tell them your current password.",
          estDurationSec: 64
        },
        {
          id: "GAO-024-L2-C3",
          type: "content",
          title: "Password Security, MFA & Incident Response (part 3)",
          body: "Multi-Factor Authentication, or MFA, adds a critical second layer of security. Even if your password is stolen, MFA prevents unauthorized access because the attacker also needs access to your second factor — typically your phone or a hardware security key.",
          narration: "Multi-Factor Authentication, or MFA, adds a critical second layer of security. Even if your password is stolen, MFA prevents unauthorized access because the attacker also needs access to your second factor — typically your phone or a hardware security key. When MFA is enabled, after entering your password, you receive a prompt on your phone to approve the login, or you enter a time-based code from an authenticator app. Care Indeed requires MFA for all EHR access and sensitive systems. Do not disable MFA even if it seems inconvenient — those extra seconds protect thousands of patients. MFA fatigue attacks are an emerging threat. The attacker has your password and repeatedly triggers MFA prompts on your phone, hoping you will eventually approve one to stop the notifications. If you receive unexpected MFA prompts that you did not initiate, do not approve them. Report the activity to IT immediately — your",
          estDurationSec: 64
        },
        {
          id: "GAO-024-L2-C4",
          type: "content",
          title: "Password Security, MFA & Incident Response (part 4)",
          body: "password may be compromised. Now let us discuss what to do if you make a mistake. Clicking a phishing link or entering your credentials on a fake site can happen to anyone. What matters is your response speed.",
          narration: "password may be compromised. Now let us discuss what to do if you make a mistake. Clicking a phishing link or entering your credentials on a fake site can happen to anyone. What matters is your response speed. If you click a suspicious link: immediately disconnect from the network — turn off Wi-Fi and unplug your ethernet cable if on a desktop. Call the IT help desk immediately. Do not attempt to fix the problem yourself. Do not shut down the computer — IT may need to analyze what happened. Change your passwords from a known-safe device, starting with the account that may have been compromised. If you entered your credentials on a suspicious site: change your password immediately from a different, trusted device. Enable MFA if it was not already enabled. Call the IT help desk immediately and report what happened. Provide the URL of the site, the time",
          estDurationSec: 64
        },
        {
          id: "GAO-024-L2-C5",
          type: "content",
          title: "Password Security, MFA & Incident Response (part 5)",
          body: "you entered credentials, and which accounts may be affected. If you opened a suspicious attachment: disconnect from the network immediately. Call the IT help desk. The attachment may have installed malware that is actively spreading. In all cases, report the incident honestly and promptly.",
          narration: "you entered credentials, and which accounts may be affected. If you opened a suspicious attachment: disconnect from the network immediately. Call the IT help desk. The attachment may have installed malware that is actively spreading. In all cases, report the incident honestly and promptly. Care Indeed does not discipline employees for falling victim to phishing attacks if they report promptly. Phishing attacks are designed to fool people — that is the entire point. Delayed or concealed reporting, however, extends the attacker's access window and increases damage. A phishing incident reported within minutes can be contained. The same incident reported days later may result in a reportable data breach. Speaking of data breaches: if patient data is accessed by unauthorized individuals, Care Indeed is required to notify affected patients under HIPAA's Breach Notification Rule, and potentially under California Civil Code Section 1798.82 which requires notification to California residents whose personal information",
          estDurationSec: 64
        },
        {
          id: "GAO-024-L2-C6",
          type: "content",
          title: "Password Security, MFA & Incident Response (part 6)",
          body: "is compromised. Breach notification is costly, damaging to patient trust, and reported to HHS, which maintains a public portal of breaches affecting 500 or more individuals — sometimes called the 'Wall of Shame.' Every employee plays a role in preventing the agency from appearing on that list.",
          narration: "is compromised. Breach notification is costly, damaging to patient trust, and reported to HHS, which maintains a public portal of breaches affecting 500 or more individuals — sometimes called the 'Wall of Shame.' Every employee plays a role in preventing the agency from appearing on that list. Physical security of devices is equally important. Lock your laptop screen when you step away — Windows + L on PC, Command + Control + Q on Mac. Never leave your laptop or tablet unattended in your car, a coffee shop, or a patient's home. If a device is lost or stolen, report it to IT within one hour. A lost device containing unencrypted patient data is a presumed breach under HIPAA. The Clean Desk policy means that when you leave your workstation, no patient information should be visible on your screen or on paper. Close all patient records. Lock your screen. Secure",
          estDurationSec: 64
        },
        {
          id: "GAO-024-L2-C7",
          type: "content",
          title: "Password Security, MFA & Incident Response (part 7)",
          body: "printed documents in a locked drawer or shred them if no longer needed. Policy Reference: IT-UP-004 — Information Security Policy. This policy contains detailed security requirements, incident response procedures, and technical standards. You are encouraged to read the full policy as a separate P&P activity.",
          narration: "printed documents in a locked drawer or shred them if no longer needed. Policy Reference: IT-UP-004 — Information Security Policy. This policy contains detailed security requirements, incident response procedures, and technical standards. You are encouraged to read the full policy as a separate P&P activity. Note: completing this training module does not constitute acknowledgment of the formal policy. Policy acknowledgment is a separate assigned activity. Knowledge Check 2: What should you do FIRST if you click a phishing link? (Answer: Disconnect from the network immediately, then call the IT help desk.) Scenario Practice 1: You receive an email from 'Care Indeed HR ' (note the triple 'e') with the subject line: 'URGENT: Open Enrollment Ends Today — Update Benefits Now.' The email contains a link to update your benefits. You almost click it. What tipped you off and what do you do? Expected Response: (1) Red flag: The domain is",
          estDurationSec: 64
        },
        {
          id: "GAO-024-L2-C8",
          type: "content",
          title: "Password Security, MFA & Incident Response (part 8)",
          body: "'careindeeed.com' (triple 'e') — not the actual Care Indeed domain. This is domain spoofing. (2) Red flag: The urgency tactic ('Ends Today'). (3) Do NOT click the link. (4) Forward the email to the IT security team or the designated phishing report address. (5) Delete the email from your inbox.",
          narration: "'careindeeed.com' (triple 'e') — not the actual Care Indeed domain. This is domain spoofing. (2) Red flag: The urgency tactic ('Ends Today'). (3) Do NOT click the link. (4) Forward the email to the IT security team or the designated phishing report address. (5) Delete the email from your inbox. (6) If open enrollment is actually happening, navigate to the benefits portal directly through a bookmarked URL, not through any email link. Scenario Practice 2: You receive three MFA push notifications on your phone in quick succession at 11 PM on a Sunday. You did not attempt to log in to any work system. What is happening and what do you do? Expected Response: (1) This is likely an MFA fatigue attack — someone has your password and is trying to get you to approve a login. (2) Do NOT approve any of the prompts. (3) Deny or dismiss all",
          estDurationSec: 64
        },
        {
          id: "GAO-024-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Password Security, MFA & Incident Response\"?",
          narration: "What is the key takeaway from \"Password Security, MFA & Incident Response\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-024-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Password Security, MFA & Incident Response\"?",
            narration: "What is the key takeaway from \"Password Security, MFA & Incident Response\"?",
            options: [
              {
                id: "a",
                label: "Passwords are the first line of defense for every system you access. In healthcare, your password protects access to electronic health records containing thousands of patients'…",
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
            policyRef: "IT-UP-004",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Passwords are the first line of defense for every system you access. In healthcare, your password protects access to electronic health records containing thousands of patients' most sensitive information."
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-024-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Security Awareness — Phishing & Passwords. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Phishing, Social Engineering & Threat Recognition\"?",
        narration: "Which statement best reflects the teaching in \"Phishing, Social Engineering & Threat Recognition\"?",
        options: [
          {
            id: "a",
            label: "Welcome to GAO-024, Security Awareness — Phishing and Passwords.",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Skip documentation if the visit was brief.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Wait until annual survey to report concerns.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only supervisors need to follow this requirement.",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from GAO-024 page: Phishing, Social Engineering & Threat Recognition",
        policyRef: "IT-UP-004"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Password Security, MFA & Incident Response\"?",
        narration: "Which statement best reflects the teaching in \"Password Security, MFA & Incident Response\"?",
        options: [
          {
            id: "a",
            label: "Passwords are the first line of defense for every system you access.",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Skip documentation if the visit was brief.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Wait until annual survey to report concerns.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only supervisors need to follow this requirement.",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from GAO-024 page: Password Security, MFA & Incident Response",
        policyRef: "IT-UP-004"
      },
      {
        id: "q3",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Phishing, Social Engineering & Threat Recognition\".",
        narration: "True or false: staff must apply the requirements taught in \"Phishing, Social Engineering & Threat Recognition\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content.",
        policyRef: "IT-UP-004"
      },
      {
        id: "q4",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Password Security, MFA & Incident Response\".",
        narration: "True or false: staff must apply the requirements taught in \"Password Security, MFA & Incident Response\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content.",
        policyRef: "IT-UP-004"
      },
      {
        id: "q5",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Phishing, Social Engineering & Threat Recognition\".",
        narration: "True or false: staff must apply the requirements taught in \"Phishing, Social Engineering & Threat Recognition\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content.",
        policyRef: "IT-UP-004"
      }
    ]
  }
},
  {
  moduleId: "GAO-025",
  policyRefs: [
    "CL-CD-001"
  ],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "Documentation Standards Overview",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Documentation in home health care is not paperwork — it is the legal record of every service you provide, every clinical decision you make, and every patient interaction you conduct. In a surveyor's eyes, if it is not documented, it did not happen.",
    narration: "Welcome to GAO-025, Documentation Standards Overview. Documentation in home health care is not paperwork — it is the legal record of every service you provide, every clinical decision you make, and every patient interaction you conduct. In a surveyor's eyes, if it is not documented, it did not happen."
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
      id: "GAO-025-L1",
      order: 1,
      title: "Documentation as the Legal Record: Standards, Formats & Requirements",
      objectives: [
        "Apply key requirements from Documentation as the Legal Record: Standards, Formats & Requirements",
        "Identify correct field actions related to Documentation as the Legal Record: Standards, Formats & Requirements"
      ],
      cards: [
        {
          id: "GAO-025-L1-S",
          type: "summary",
          title: "Documentation as the Legal Record: Standards, Formats & Requirements",
          body: "Documentation in home health care is not paperwork — it is the legal record of every service you provide, every clinical decision you make, and every patient interaction you conduct. In a surveyor's eyes, if it is not documented, it did not happen.",
          narration: "In this lesson: Documentation as the Legal Record: Standards, Formats & Requirements. Documentation in home health care is not paperwork — it is the legal record of every service you provide, every clinical decision you make, and every patient interaction you conduct. In a surveyor's eyes, if it is not documented, it did not happen.",
          estDurationSec: 45
        },
        {
          id: "GAO-025-L1-C1",
          type: "content",
          title: "Documentation as the Legal Record: Standards, Formats & Requirements",
          body: "Documentation in home health care is not paperwork — it is the legal record of every service you provide, every clinical decision you make, and every patient interaction you conduct. In a surveyor's eyes, if it is not documented, it did not happen.",
          narration: "Documentation in home health care is not paperwork — it is the legal record of every service you provide, every clinical decision you make, and every patient interaction you conduct. In a surveyor's eyes, if it is not documented, it did not happen. This principle governs everything from how you record a blood pressure reading to how you justify the skilled need for continued home health services. The Centers for Medicare and Medicaid Services, under 42 CFR Section 484.110, requires that clinical records be maintained for every patient receiving home health services. These records must be complete, accurate, and contemporaneous — meaning documented at or near the time of the event. The Accreditation Commission for Health Care, ACHC, reinforces these standards and adds specific expectations for documentation timeliness, authentication, and content quality. At Care Indeed, our documentation standards are governed by policy CL-CD-001. This policy establishes the expectations every clinician",
          estDurationSec: 64
        },
        {
          id: "GAO-025-L1-C2",
          type: "content",
          title: "Documentation as the Legal Record: Standards, Formats & Requirements (part 2)",
          body: "must follow regardless of discipline. Whether you are a registered nurse completing a Start of Care assessment, a physical therapist documenting a treatment session, or a home health aide recording vital signs, the same foundational standards apply. Let us begin with why documentation matters beyond compliance.",
          narration: "must follow regardless of discipline. Whether you are a registered nurse completing a Start of Care assessment, a physical therapist documenting a treatment session, or a home health aide recording vital signs, the same foundational standards apply. Let us begin with why documentation matters beyond compliance. First, documentation is a legal document. In any malpractice claim, workers' compensation dispute, or regulatory investigation, your clinical notes are the primary evidence. Courts and administrative law judges rely on what was written, not what you remember saying or doing months later. Second, documentation drives reimbursement. Medicare pays for home health services based on what is documented. If your visit note does not clearly establish skilled need, homebound status, and medical necessity, the claim may be denied or the agency may face recoupment. Third, documentation ensures continuity of care. In home health, multiple clinicians visit the same patient across days and weeks. Your documentation",
          estDurationSec: 64
        },
        {
          id: "GAO-025-L1-C3",
          type: "content",
          title: "Documentation as the Legal Record: Standards, Formats & Requirements (part 3)",
          body: "is how the next clinician knows what happened, what changed, and what the current plan requires. The 24-hour documentation standard is a critical benchmark. At Care Indeed, all visit documentation must be completed within 24 hours of the visit.",
          narration: "is how the next clinician knows what happened, what changed, and what the current plan requires. The 24-hour documentation standard is a critical benchmark. At Care Indeed, all visit documentation must be completed within 24 hours of the visit. This is not merely a suggestion — it is an agency standard enforced through quality audits. Late documentation introduces risk: memory fades, details become inaccurate, and the record loses its contemporaneous reliability. If you cannot complete documentation on the same day as the visit, you must complete it by the end of the following business day and note the reason for the delay. Now let us discuss documentation formats. The two primary narrative formats used in home health are SOAP and DAR. SOAP stands for Subjective, Objective, Assessment, and Plan. The subjective section captures what the patient reports — symptoms, complaints, concerns in their own words. The objective section records your",
          estDurationSec: 64
        },
        {
          id: "GAO-025-L1-C4",
          type: "content",
          title: "Documentation as the Legal Record: Standards, Formats & Requirements (part 4)",
          body: "clinical findings — vital signs, wound measurements, range of motion, functional observations. The assessment section is your professional clinical judgment — what the data means, whether the patient is improving, stable, or declining.",
          narration: "clinical findings — vital signs, wound measurements, range of motion, functional observations. The assessment section is your professional clinical judgment — what the data means, whether the patient is improving, stable, or declining. The plan section documents what you will do next — continue current interventions, modify the care plan, refer to another discipline, or contact the physician. DAR stands for Data, Action, Response. This format is used for focused documentation of specific events or interventions. Data captures the relevant clinical findings. Action records what you did. Response documents how the patient responded to your intervention. Regardless of format, all documentation must be objective and measurable. Instead of writing the patient is doing better, write the patient ambulated 150 feet with a rolling walker, demonstrating improved gait stability compared to 100 feet on the previous visit. Instead of writing wound looks good, write wound bed is 90 percent granulating, no",
          estDurationSec: 64
        },
        {
          id: "GAO-025-L1-C5",
          type: "content",
          title: "Documentation as the Legal Record: Standards, Formats & Requirements (part 5)",
          body: "signs of infection, wound dimensions reduced from 3.2 by 2.1 centimeters to 2.8 by 1.8 centimeters. Measurable documentation supports skilled need, tracks progress toward goals, and withstands survey scrutiny. Avoid prohibited abbreviations.",
          narration: "signs of infection, wound dimensions reduced from 3.2 by 2.1 centimeters to 2.8 by 1.8 centimeters. Measurable documentation supports skilled need, tracks progress toward goals, and withstands survey scrutiny. Avoid prohibited abbreviations. The Joint Commission and ACHC maintain lists of abbreviations that must not be used because they create ambiguity. For example, U for units can be mistaken for zero. QD can be misread as QID. IU for international units can be misread as IV. At Care Indeed, use only approved abbreviations listed in the agency's approved abbreviation reference. Every visit note must justify the skilled need for the service provided. Medicare does not pay for maintenance-only services unless they require the skills of a licensed professional to be performed safely and effectively. Your documentation must clearly articulate why a skilled clinician was needed for this specific visit — what clinical assessment, skilled intervention, patient education, or care coordination occurred",
          estDurationSec: 64
        },
        {
          id: "GAO-025-L1-C6",
          type: "content",
          title: "Documentation as the Legal Record: Standards, Formats & Requirements (part 6)",
          body: "that could not have been performed by a non-skilled individual. Homebound status must be documented at every visit. The patient's homebound status is a fundamental Medicare eligibility criterion.",
          narration: "that could not have been performed by a non-skilled individual. Homebound status must be documented at every visit. The patient's homebound status is a fundamental Medicare eligibility criterion. Your note must describe the specific condition, functional limitation, or medical restriction that confines the patient to the home. Leaving the home requires considerable and taxing effort is the standard — document what makes it taxing for this specific patient.",
          estDurationSec: 35
        },
        {
          id: "GAO-025-L1-CH",
          type: "challenge",
          title: "Knowledge Check 1 Question: A visit note states \"Patient is…",
          body: "Knowledge Check 1 Question: A visit note states \"Patient is doing better.\" Why is this problematic? Answer: The statement is subjective and non-measurable.",
          narration: "Knowledge Check 1 Question: A visit note states \"Patient is doing better.\" Why is this problematic? Answer: The statement is subjective and non-measurable.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-025-L1-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 1 Question: A visit note states \"Patient is doing better.\" Why is this problematic? Answer: The statement is subjective and non-measurable.",
            narration: "Knowledge Check 1 Question: A visit note states \"Patient is doing better.\" Why is this problematic? Answer: The statement is subjective and non-measurable.",
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
            policyRef: "CL-CD-001",
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
      id: "GAO-025-L2",
      order: 2,
      title: "Orders, Corrections, EHR Practices & Documentation Integrity",
      objectives: [
        "Apply key requirements from Orders, Corrections, EHR Practices & Documentation Integrity",
        "Identify correct field actions related to Orders, Corrections, EHR Practices & Documentation Integrity"
      ],
      cards: [
        {
          id: "GAO-025-L2-S",
          type: "summary",
          title: "Orders, Corrections, EHR Practices & Documentation Integrity",
          body: "Physician orders are the legal authority for every service you provide in the patient's home. No service may be initiated, modified, or discontinued without a valid physician order. At Care Indeed, physician orders follow a specific documentation protocol that every clinician must understand.",
          narration: "In this lesson: Orders, Corrections, EHR Practices & Documentation Integrity. Physician orders are the legal authority for every service you provide in the patient's home. No service may be initiated, modified, or discontinued without a valid physician order. At Care Indeed, physician orders follow a specific documentation protocol that every clinician must understand.",
          estDurationSec: 45
        },
        {
          id: "GAO-025-L2-C1",
          type: "content",
          title: "Orders, Corrections, EHR Practices & Documentation Integrity",
          body: "Physician orders are the legal authority for every service you provide in the patient's home. No service may be initiated, modified, or discontinued without a valid physician order. At Care Indeed, physician orders follow a specific documentation protocol that every clinician must understand.",
          narration: "Physician orders are the legal authority for every service you provide in the patient's home. No service may be initiated, modified, or discontinued without a valid physician order. At Care Indeed, physician orders follow a specific documentation protocol that every clinician must understand. When you receive a verbal order — for example, a physician calls to change a medication dose during your visit — you must document the order immediately using the read-back verification method. Write down the order exactly as communicated, read it back to the physician verbatim, and obtain verbal confirmation that you read it back correctly. Document the order in the patient record including the date, time, physician name, the exact order content, and the notation verbal order read back and confirmed. Verbal orders must be authenticated by the physician's signature within the timeframe required by your agency policy and state regulation — typically within 30 days",
          estDurationSec: 64
        },
        {
          id: "GAO-025-L2-C2",
          type: "content",
          title: "Orders, Corrections, EHR Practices & Documentation Integrity (part 2)",
          body: "for Medicare. Standing orders and protocol orders are not permitted in home health. Every order must be patient-specific. You cannot apply a blanket protocol to a patient without an individualized physician order.",
          narration: "for Medicare. Standing orders and protocol orders are not permitted in home health. Every order must be patient-specific. You cannot apply a blanket protocol to a patient without an individualized physician order. If a patient's condition changes and you need new orders, you must contact the physician, obtain the specific order, and document it before implementing the change — except in an emergency where immediate action is needed to prevent harm, in which case you act first and obtain the order as soon as possible afterward. Late entries and addendums are sometimes necessary but must follow strict standards. A late entry is documentation added after the 24-hour window. It must be clearly labeled as a late entry with the current date and time, and must reference the original date of the event being documented. An addendum is additional information added to an existing note. It must be clearly labeled as",
          estDurationSec: 64
        },
        {
          id: "GAO-025-L2-C3",
          type: "content",
          title: "Orders, Corrections, EHR Practices & Documentation Integrity (part 3)",
          body: "an addendum, reference the original note date, and include the current date, time, and your signature. Never alter, backdate, or delete an existing entry. Altering documentation after the fact can constitute fraud.",
          narration: "an addendum, reference the original note date, and include the current date, time, and your signature. Never alter, backdate, or delete an existing entry. Altering documentation after the fact can constitute fraud. Error correction in paper records requires drawing a single line through the error so the original text remains readable, writing the correction above or beside the error, and initialing and dating the correction. Never use white-out, erasure, or heavy black marks that obscure the original text. In electronic records, the EHR system should maintain an audit trail of all changes. If you need to correct an electronic entry, use the amendment or addendum function — never delete the original entry. Electronic health record practices require additional vigilance. When documenting in the EHR, ensure you are in the correct patient chart before entering any data. Verify the patient name, date of birth, and medical record number. Use your own",
          estDurationSec: 64
        },
        {
          id: "GAO-025-L2-C4",
          type: "content",
          title: "Orders, Corrections, EHR Practices & Documentation Integrity (part 4)",
          body: "unique login credentials — never share passwords or document under another user's account. Log out of the system when you step away from the device.",
          narration: "unique login credentials — never share passwords or document under another user's account. Log out of the system when you step away from the device. Do not copy and paste previous notes without carefully reviewing and updating the content — copy-paste errors are a leading cause of documentation inaccuracy and are specifically targeted during surveys. Authentication and co-signature requirements vary by discipline and licensure. All entries must be signed with your full legal name, professional credentials, and the date and time. Students, LVNs documenting certain assessments, and home health aides have specific co-signature requirements where a supervising clinician must review and authenticate the documentation. At Care Indeed, co-signatures must be completed within the timeframe specified in your discipline-specific policy. Documentation integrity is a compliance and legal obligation. Falsifying documentation — including documenting services not provided, inflating time spent, recording inaccurate clinical findings, or backdating entries — constitutes fraud under the",
          estDurationSec: 64
        },
        {
          id: "GAO-025-L2-C5",
          type: "content",
          title: "Orders, Corrections, EHR Practices & Documentation Integrity (part 5)",
          body: "False Claims Act and can result in criminal prosecution, civil penalties, termination, and exclusion from federal healthcare programs. Even unintentional inaccuracies can create liability. Your professional license depends on the integrity of your documentation.",
          narration: "False Claims Act and can result in criminal prosecution, civil penalties, termination, and exclusion from federal healthcare programs. Even unintentional inaccuracies can create liability. Your professional license depends on the integrity of your documentation. Common documentation deficiencies cited in CMS and ACHC surveys include: failure to document homebound status at each visit, missing or incomplete physician orders, lack of skilled need justification, use of prohibited abbreviations, unsigned or unauthenticated entries, copy-paste errors with outdated clinical information, failure to document patient education and response, missing wound measurements or vital sign trends, late documentation beyond the 24-hour standard, and failure to document communication with the physician or interdisciplinary team. Let us apply these standards to a practical home health scenario. You are a registered nurse visiting Mrs. Rodriguez for a skilled nursing assessment. During the visit, you notice her blood pressure is significantly elevated at 178/102, she reports new onset headache and",
          estDurationSec: 64
        },
        {
          id: "GAO-025-L2-C6",
          type: "content",
          title: "Orders, Corrections, EHR Practices & Documentation Integrity (part 6)",
          body: "blurred vision, and her medication bottle shows she has not been taking her antihypertensive medication. Your documentation must include: the objective vital signs with exact readings, the patient's subjective report in her own words, your assessment of the clinical significance, the action you took — which should…",
          narration: "blurred vision, and her medication bottle shows she has not been taking her antihypertensive medication. Your documentation must include: the objective vital signs with exact readings, the patient's subjective report in her own words, your assessment of the clinical significance, the action you took — which should include contacting the physician immediately — the physician's verbal order with read-back verification, the patient education you provided about medication adherence, the patient's response to your teaching, and the plan for follow-up. This complete documentation tells the clinical story, justifies the skilled need, protects the patient, and satisfies every survey standard. Another common scenario involves the home health aide. You are completing a routine personal care visit and notice the patient has a new skin tear on their forearm that was not present at your last visit. Even though you are an aide, not a nurse, you must document what you observed —",
          estDurationSec: 64
        },
        {
          id: "GAO-025-L2-C7",
          type: "content",
          title: "Orders, Corrections, EHR Practices & Documentation Integrity (part 7)",
          body: "the location, approximate size, and appearance of the skin tear — and report it to the supervising RN immediately. Your documentation should read something like: Observed new skin tear on left forearm approximately 2 centimeters in length with minor bleeding. Area cleaned and bandaged per standing wound care supplies.",
          narration: "the location, approximate size, and appearance of the skin tear — and report it to the supervising RN immediately. Your documentation should read something like: Observed new skin tear on left forearm approximately 2 centimeters in length with minor bleeding. Area cleaned and bandaged per standing wound care supplies. RN supervisor notified at 10:45 AM. This documents your observation, your action within scope, and your communication to the appropriate clinical authority. Remember: Documentation is care. If your documentation is incomplete, inaccurate, or late, you have not fully provided the service — because the service includes the record of what you did. Every entry you make becomes part of a legal document that may be reviewed by surveyors, auditors, attorneys, physicians, and other clinicians. Write every note as if a judge will read it — because someday, one might. > PP SEPARATION NOTICE: Policy Reference: CL-CD-001 (needs_review). This training module provides",
          estDurationSec: 64
        },
        {
          id: "GAO-025-L2-C8",
          type: "content",
          title: "Orders, Corrections, EHR Practices & Documentation Integrity (part 8)",
          body: "education on documentation standards. Completion of this module is a Training Module Complete event. Policy acknowledgment is a separate assigned activity in your P&P workflow.",
          narration: "education on documentation standards. Completion of this module is a Training Module Complete event. Policy acknowledgment is a separate assigned activity in your P&P workflow.",
          estDurationSec: 35
        },
        {
          id: "GAO-025-L2-CH",
          type: "challenge",
          title: "Knowledge Check 2 Question: You realize at 9 PM that you…",
          body: "Knowledge Check 2 Question: You realize at 9 PM that you forgot to document a verbal order received during your 2 PM visit.",
          narration: "Knowledge Check 2 Question: You realize at 9 PM that you forgot to document a verbal order received during your 2 PM visit. What is the correct procedure? Answer: Complete a late entry clearly labeled with the current date/time, referencing the original visit date and time of the verbal order.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-025-L2-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 2 Question: You realize at 9 PM that you forgot to document a verbal order received during your 2 PM visit.",
            narration: "Knowledge Check 2 Question: You realize at 9 PM that you forgot to document a verbal order received during your 2 PM visit.",
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
            policyRef: "CL-CD-001",
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
    id: "GAO-025-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Documentation Standards Overview. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Documentation as the Legal Record: Standards, Formats & Requirements\"?",
        narration: "Which statement best reflects the teaching in \"Documentation as the Legal Record: Standards, Formats & Requirements\"?",
        options: [
          {
            id: "a",
            label: "Documentation in home health care is not paperwork — it is the legal record of every service you provide, every…",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Skip documentation if the visit was brief.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Wait until annual survey to report concerns.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only supervisors need to follow this requirement.",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from GAO-025 page: Documentation as the Legal Record: Standards, Formats & Requirements",
        policyRef: "CL-CD-001"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Orders, Corrections, EHR Practices & Documentation Integrity\"?",
        narration: "Which statement best reflects the teaching in \"Orders, Corrections, EHR Practices & Documentation Integrity\"?",
        options: [
          {
            id: "a",
            label: "Physician orders are the legal authority for every service you provide in the patient's home.",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Skip documentation if the visit was brief.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Wait until annual survey to report concerns.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only supervisors need to follow this requirement.",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from GAO-025 page: Orders, Corrections, EHR Practices & Documentation Integrity",
        policyRef: "CL-CD-001"
      },
      {
        id: "q3",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Documentation as the Legal Record: Standards, Formats & Requirements\".",
        narration: "True or false: staff must apply the requirements taught in \"Documentation as the Legal Record: Standards, Formats & Requirements\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content.",
        policyRef: "CL-CD-001"
      },
      {
        id: "q4",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Orders, Corrections, EHR Practices & Documentation Integrity\".",
        narration: "True or false: staff must apply the requirements taught in \"Orders, Corrections, EHR Practices & Documentation Integrity\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content.",
        policyRef: "CL-CD-001"
      },
      {
        id: "q5",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Documentation as the Legal Record: Standards, Formats & Requirements\".",
        narration: "True or false: staff must apply the requirements taught in \"Documentation as the Legal Record: Standards, Formats & Requirements\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content.",
        policyRef: "CL-CD-001"
      }
    ]
  }
},
  {
  moduleId: "GAO-026",
  policyRefs: [],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "Time & Attendance",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Accurate timekeeping in home health care is not an administrative convenience — it is a legal requirement, a compliance obligation, and a direct reflection of your professional integrity.",
    narration: "Welcome to GAO-026, Time & Attendance. Accurate timekeeping in home health care is not an administrative convenience — it is a legal requirement, a compliance obligation, and a direct reflection of your professional integrity."
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
      id: "GAO-026-L1",
      order: 1,
      title: "Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures",
      objectives: [
        "Apply key requirements from Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures",
        "Identify correct field actions related to Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures"
      ],
      cards: [
        {
          id: "GAO-026-L1-S",
          type: "summary",
          title: "Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures",
          body: "Accurate timekeeping in home health care is not an administrative convenience — it is a legal requirement, a compliance obligation, and a direct reflection of your professional integrity.",
          narration: "In this lesson: Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures. Accurate timekeeping in home health care is not an administrative convenience — it is a legal requirement, a compliance obligation, and a direct reflection of your professional integrity. Every minute you record on your timesheet represents a claim that you were performing authorized work during that time.",
          estDurationSec: 45
        },
        {
          id: "GAO-026-L1-C1",
          type: "content",
          title: "Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures",
          body: "Accurate timekeeping in home health care is not an administrative convenience — it is a legal requirement, a compliance obligation, and a direct reflection of your professional integrity. Every minute you record on your timesheet represents a claim that you were performing authorized work during that time.",
          narration: "Accurate timekeeping in home health care is not an administrative convenience — it is a legal requirement, a compliance obligation, and a direct reflection of your professional integrity. Every minute you record on your timesheet represents a claim that you were performing authorized work during that time. Inaccurate timekeeping, whether intentional or careless, can result in legal consequences for both you and the agency. The federal Fair Labor Standards Act, FLSA, establishes the baseline requirements for employee compensation. Under the FLSA, non-exempt employees must be paid for all hours worked, including overtime at one and one-half times the regular rate for hours exceeding 40 in a workweek. The FLSA also requires employers to maintain accurate records of hours worked. As a home health employee, you are responsible for accurately recording your time so the agency can meet its legal obligation to pay you correctly. California labor law adds additional protections",
          estDurationSec: 64
        },
        {
          id: "GAO-026-L1-C2",
          type: "content",
          title: "Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures (part 2)",
          body: "that exceed federal minimums. California requires overtime pay after 8 hours in a single workday, not just after 40 hours in a week. Double-time pay is required after 12 hours in a single day.",
          narration: "that exceed federal minimums. California requires overtime pay after 8 hours in a single workday, not just after 40 hours in a week. Double-time pay is required after 12 hours in a single day. California also mandates meal periods and rest breaks: a 30-minute unpaid meal break before the fifth hour of work, and a 10-minute paid rest break for every four hours worked. These are not optional — they are legal requirements. If you work through a meal break, it must be documented and you must be compensated. The agency cannot waive these breaks, and you should not routinely skip them. Travel time between patient homes during your workday is compensable working time. When you leave one patient's home and drive to the next patient's home, that drive time is paid work time. However, your commute from your home to your first patient and from your last patient back",
          estDurationSec: 64
        },
        {
          id: "GAO-026-L1-C3",
          type: "content",
          title: "Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures (part 3)",
          body: "to your home is generally not compensable unless specific circumstances apply — such as when you are required to report to the office first or carry supplies from the office to the patient. Document your travel time accurately between visits.",
          narration: "to your home is generally not compensable unless specific circumstances apply — such as when you are required to report to the office first or carry supplies from the office to the patient. Document your travel time accurately between visits. Overreporting travel time is timesheet fraud; underreporting it means you are not being paid what you are owed. At Care Indeed, the timekeeping procedure requires you to record the actual time you arrive at a patient's home and the actual time you depart. Do not round your times. If you arrive at 9:07 AM, record 9:07 AM, not 9:00 AM. If you depart at 10:22 AM, record 10:22 AM, not 10:30 AM. Rounding — even by a few minutes — introduces inaccuracy and can constitute falsification when aggregated across visits. Clock-in and clock-out must occur at the actual location of service. If your agency uses a mobile time-tracking application, ensure",
          estDurationSec: 64
        },
        {
          id: "GAO-026-L1-C4",
          type: "content",
          title: "Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures (part 4)",
          body: "GPS verification is enabled and that you clock in when you are at the patient's home, not while sitting in your car down the street or at a coffee shop. If the mobile system malfunctions, document your times manually and report the system issue to your supervisor immediately.",
          narration: "GPS verification is enabled and that you clock in when you are at the patient's home, not while sitting in your car down the street or at a coffee shop. If the mobile system malfunctions, document your times manually and report the system issue to your supervisor immediately. Overtime must be pre-authorized by your supervisor. You may not work overtime without prior approval except in a patient emergency where leaving would endanger the patient. If an emergency requires you to exceed your scheduled hours, notify your supervisor as soon as possible and document the reason. Unauthorized overtime, even if the work was legitimate, will require explanation and may result in corrective action if it becomes a pattern. If you miss a clock-in or clock-out punch, you must submit a missed punch correction form within 24 hours. The form requires the date, the missed punch time, the reason for the miss,",
          estDurationSec: 64
        },
        {
          id: "GAO-026-L1-C5",
          type: "content",
          title: "Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures (part 5)",
          body: "and your supervisor's signature. Do not ask a colleague to clock in or out for you — this is timesheet fraud and is grounds for immediate termination regardless of the circumstances. Timesheet falsification is treated as fraud at Care Indeed.",
          narration: "and your supervisor's signature. Do not ask a colleague to clock in or out for you — this is timesheet fraud and is grounds for immediate termination regardless of the circumstances. Timesheet falsification is treated as fraud at Care Indeed. Examples of falsification include: recording hours you did not work, clocking in at a patient's home when you have not yet arrived, documenting a 60-minute visit when you only spent 35 minutes with the patient, having another employee clock in or out on your behalf, altering time records after submission without following the correction procedure, and recording travel time for trips you did not make. Any of these actions can result in immediate termination, repayment of wages, and referral to law enforcement. In the Medicare context, timesheet fraud can also trigger False Claims Act liability if the falsified time is tied to billing.",
          estDurationSec: 61
        },
        {
          id: "GAO-026-L1-CH",
          type: "challenge",
          title: "Knowledge Check 1 Question: You arrive at a patient's home…",
          body: "Knowledge Check 1 Question: You arrive at a patient's home at 9:07 AM but your next available time slot on the app rounds to 9:00 AM. What should you do? Answer: Record the actual time of 9:07 AM.",
          narration: "Knowledge Check 1 Question: You arrive at a patient's home at 9:07 AM but your next available time slot on the app rounds to 9:00 AM. What should you do? Answer: Record the actual time of 9:07 AM. Do not round to 9:00 AM.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-026-L1-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 1 Question: You arrive at a patient's home at 9:07 AM but your next available time slot on the app rounds to 9:00 AM. What should you do? Answer: Record the actual time of 9:07 AM. Do not round to 9:00 AM.",
            narration: "Knowledge Check 1 Question: You arrive at a patient's home at 9:07 AM but your next available time slot on the app rounds to 9:00 AM. What should you do? Answer: Record the actual time of 9:07 AM. Do not round to 9:00 AM.",
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
      id: "GAO-026-L2",
      order: 2,
      title: "Scheduling, Absences, PTO & Professional Expectations",
      objectives: [
        "Apply key requirements from Scheduling, Absences, PTO & Professional Expectations",
        "Identify correct field actions related to Scheduling, Absences, PTO & Professional Expectations"
      ],
      cards: [
        {
          id: "GAO-026-L2-S",
          type: "summary",
          title: "Scheduling, Absences, PTO & Professional Expectations",
          body: "Your schedule in home health is driven by patient needs, physician orders, and care plan frequency requirements. Unlike a hospital or clinic where patients come to you, in home health you go to the patient — which means your schedule, your reliability, and your attendance directly affect vulnerable…",
          narration: "In this lesson: Scheduling, Absences, PTO & Professional Expectations. Your schedule in home health is driven by patient needs, physician orders, and care plan frequency requirements. Unlike a hospital or clinic where patients come to you, in home health you go to the patient — which means your schedule, your reliability, and your attendance directly affect vulnerable individuals who are counting on you.",
          estDurationSec: 45
        },
        {
          id: "GAO-026-L2-C1",
          type: "content",
          title: "Scheduling, Absences, PTO & Professional Expectations",
          body: "Your schedule in home health is driven by patient needs, physician orders, and care plan frequency requirements. Unlike a hospital or clinic where patients come to you, in home health you go to the patient — which means your schedule, your reliability, and your attendance directly affect vulnerable individuals who are…",
          narration: "Your schedule in home health is driven by patient needs, physician orders, and care plan frequency requirements. Unlike a hospital or clinic where patients come to you, in home health you go to the patient — which means your schedule, your reliability, and your attendance directly affect vulnerable individuals who are counting on you. Pay periods at Care Indeed follow the schedule established by the payroll department. Familiarize yourself with the pay period calendar during your first week. Timesheets must be submitted by the deadline specified for each pay period — late timesheets may delay your pay. Review your pay stub each period to verify that your hours, overtime, mileage reimbursement, and any differentials are correctly reflected. If you identify a discrepancy, report it to payroll within the timeframe specified in the employee handbook. The agency is required to correct payroll errors promptly. Paid time off, or PTO, accrual begins",
          estDurationSec: 64
        },
        {
          id: "GAO-026-L2-C2",
          type: "content",
          title: "Scheduling, Absences, PTO & Professional Expectations (part 2)",
          body: "according to the terms of your offer letter and the agency's PTO policy. PTO requests must be submitted in advance through the scheduling system. The agency will make reasonable efforts to approve PTO requests, but patient coverage requirements may necessitate adjustments.",
          narration: "according to the terms of your offer letter and the agency's PTO policy. PTO requests must be submitted in advance through the scheduling system. The agency will make reasonable efforts to approve PTO requests, but patient coverage requirements may necessitate adjustments. You may not use PTO retroactively to cover an unexcused absence unless your supervisor specifically approves the exception. PTO balances, accrual rates, and usage are visible in the HR portal. When you cannot report for a scheduled shift or visit, you must follow the call-in procedure. Notify your supervisor as early as possible — ideally at least two hours before your first scheduled visit. Provide the reason for your absence and an estimated return date. Texting a colleague is not sufficient notification — you must contact your direct supervisor or the on-call coordinator through the designated communication channel. A no-call, no-show — failing to report for a scheduled shift",
          estDurationSec: 64
        },
        {
          id: "GAO-026-L2-C3",
          type: "content",
          title: "Scheduling, Absences, PTO & Professional Expectations (part 3)",
          body: "without any notification — is a serious offense. In home health, a no-call/no-show means a homebound patient who was expecting care does not receive it. This is not merely an attendance issue; it is a patient safety issue. A first no-call/no-show results in a written warning.",
          narration: "without any notification — is a serious offense. In home health, a no-call/no-show means a homebound patient who was expecting care does not receive it. This is not merely an attendance issue; it is a patient safety issue. A first no-call/no-show results in a written warning. A second occurrence within 12 months may result in final written warning or termination, depending on the circumstances and patient impact. Schedule changes must be coordinated through your supervisor. You may not independently swap visits with another clinician without supervisor approval. Patient-clinician continuity matters for care quality, and unauthorized schedule changes can result in missed visits, documentation gaps, and patient complaints. On-call expectations vary by role and are defined in your position description. If you are assigned to the on-call rotation, you must be available to respond within the timeframe specified — typically within 30 minutes by phone and able to make an in-person",
          estDurationSec: 64
        },
        {
          id: "GAO-026-L2-C4",
          type: "content",
          title: "Scheduling, Absences, PTO & Professional Expectations (part 4)",
          body: "visit within the geographic and time parameters established by your supervisor. On-call compensation follows California labor law requirements for on-call pay. Weekend and holiday scheduling is a shared responsibility.",
          narration: "visit within the geographic and time parameters established by your supervisor. On-call compensation follows California labor law requirements for on-call pay. Weekend and holiday scheduling is a shared responsibility. Home health patients require care seven days a week, and the agency maintains weekend and holiday coverage rotations. Your participation in weekend and holiday rotations is an expectation of employment. The rotation schedule is published in advance, and requests for specific dates off should be submitted early. Productivity expectations define the number of patient visits or billable hours expected per day or per week for your role. These expectations are based on industry standards, geographic service area, and patient acuity. If you are consistently unable to meet productivity expectations, discuss the barriers with your supervisor — common issues include excessive drive time, documentation backlogs, or patient complexity that requires more time per visit. The agency will work with you to address",
          estDurationSec: 64
        },
        {
          id: "GAO-026-L2-C5",
          type: "content",
          title: "Scheduling, Absences, PTO & Professional Expectations (part 5)",
          body: "legitimate barriers, but sustained underperformance without identifiable cause will result in a performance improvement plan. Common timekeeping errors to avoid include: forgetting to clock out after your last visit and having to submit a correction the next day, accidentally recording time in the wrong patient's…",
          narration: "legitimate barriers, but sustained underperformance without identifiable cause will result in a performance improvement plan. Common timekeeping errors to avoid include: forgetting to clock out after your last visit and having to submit a correction the next day, accidentally recording time in the wrong patient's chart, not documenting travel time and therefore being underpaid, failing to record a meal break as unpaid time, and not verifying your timesheet before submission. A best practice is to review your timesheet at the end of each day before submitting, rather than waiting until the end of the pay period when memories have faded. Let us walk through a practical scenario. You are scheduled for five patient visits today. You arrive at your first patient's home at 8:12 AM and complete the visit at 9:25 AM. You drive 18 minutes to your second patient and arrive at 9:43 AM. Your documentation should reflect: Visit",
          estDurationSec: 64
        },
        {
          id: "GAO-026-L2-C6",
          type: "content",
          title: "Scheduling, Absences, PTO & Professional Expectations (part 6)",
          body: "1 start 8:12 AM, Visit 1 end 9:25 AM. Travel time 9:25 AM to 9:43 AM (18 minutes). Visit 2 start 9:43 AM. Each segment is recorded at actual time, travel time is captured as paid work time, and you have not rounded or estimated any entry. Now consider an absence scenario. You wake up with a fever and cannot work.",
          narration: "1 start 8:12 AM, Visit 1 end 9:25 AM. Travel time 9:25 AM to 9:43 AM (18 minutes). Visit 2 start 9:43 AM. Each segment is recorded at actual time, travel time is captured as paid work time, and you have not rounded or estimated any entry. Now consider an absence scenario. You wake up with a fever and cannot work. You call your supervisor at 6:30 AM — one hour before your first visit — explain the situation, and provide your patient list so visits can be reassigned. This is correct procedure. Your patients receive care from a substitute clinician, your supervisor can notify patients of the change, and your absence is documented through the proper channel. Contrast this with simply not showing up: your first patient waits, calls the office, the office scrambles to find coverage, the second patient's medication management visit is delayed, and you receive a",
          estDurationSec: 64
        },
        {
          id: "GAO-026-L2-C7",
          type: "content",
          title: "Scheduling, Absences, PTO & Professional Expectations (part 7)",
          body: "no-call/no-show disciplinary action. > PP SEPARATION NOTICE: This training module provides education on time and attendance standards. Completion of this module is a Training Module Complete event. Policy acknowledgment is a separate assigned activity in your P&P workflow.",
          narration: "no-call/no-show disciplinary action. > PP SEPARATION NOTICE: This training module provides education on time and attendance standards. Completion of this module is a Training Module Complete event. Policy acknowledgment is a separate assigned activity in your P&P workflow.",
          estDurationSec: 35
        },
        {
          id: "GAO-026-L2-CH",
          type: "challenge",
          title: "Knowledge Check 2 Question: Under California law, when is…",
          body: "Knowledge Check 2 Question: Under California law, when is overtime pay triggered for a single workday? Answer: California requires overtime (1.5x) after 8 hours in a single workday, and double-time (2x) after 12 hours.",
          narration: "Knowledge Check 2 Question: Under California law, when is overtime pay triggered for a single workday? Answer: California requires overtime (1.5x) after 8 hours in a single workday, and double-time (2x) after 12 hours.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-026-L2-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 2 Question: Under California law, when is overtime pay triggered for a single workday? Answer: California requires overtime (1.5x) after 8 hours in a single workday, and double-time (2x) after 12 hours.",
            narration: "Knowledge Check 2 Question: Under California law, when is overtime pay triggered for a single workday? Answer: California requires overtime (1.5x) after 8 hours in a single workday, and double-time (2x) after 12 hours.",
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
    id: "GAO-026-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Time & Attendance. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures\"?",
        narration: "Which statement best reflects the teaching in \"Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures\"?",
        options: [
          {
            id: "a",
            label: "Accurate timekeeping in home health care is not an administrative convenience — it is a legal requirement, a compliance…",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Skip documentation if the visit was brief.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Wait until annual survey to report concerns.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only supervisors need to follow this requirement.",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from GAO-026 page: Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Scheduling, Absences, PTO & Professional Expectations\"?",
        narration: "Which statement best reflects the teaching in \"Scheduling, Absences, PTO & Professional Expectations\"?",
        options: [
          {
            id: "a",
            label: "Your schedule in home health is driven by patient needs, physician orders, and care plan frequency requirements.",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Skip documentation if the visit was brief.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Wait until annual survey to report concerns.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only supervisors need to follow this requirement.",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from GAO-026 page: Scheduling, Absences, PTO & Professional Expectations"
      },
      {
        id: "q3",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures\".",
        narration: "True or false: staff must apply the requirements taught in \"Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content."
      },
      {
        id: "q4",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Scheduling, Absences, PTO & Professional Expectations\".",
        narration: "True or false: staff must apply the requirements taught in \"Scheduling, Absences, PTO & Professional Expectations\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content."
      },
      {
        id: "q5",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures\".",
        narration: "True or false: staff must apply the requirements taught in \"Timekeeping Requirements: Legal Framework, Agency Policy & Daily Procedures\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content."
      }
    ]
  }
},
  {
  moduleId: "GAO-027",
  policyRefs: [],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "Benefits Overview & Enrollment",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Understanding your employee benefits is an essential part of onboarding at Care Indeed. As a home health care professional, you face unique occupational demands — from driving to patient homes in varying conditions to providing hands-on clinical care — and…",
    narration: "Welcome to GAO-027, Benefits Overview & Enrollment. Understanding your employee benefits is an essential part of onboarding at Care Indeed. As a home health care professional, you face unique occupational demands — from driving to patient homes in varying conditions to providing hands-on clinical care — and…"
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
      id: "GAO-027-L1",
      order: 1,
      title: "Health Insurance, Enrollment & Qualifying Events",
      objectives: [
        "Apply key requirements from Health Insurance, Enrollment & Qualifying Events",
        "Identify correct field actions related to Health Insurance, Enrollment & Qualifying Events"
      ],
      cards: [
        {
          id: "GAO-027-L1-S",
          type: "summary",
          title: "Health Insurance, Enrollment & Qualifying Events",
          body: "Understanding your employee benefits is an essential part of onboarding at Care Indeed. As a home health care professional, you face unique occupational demands — from driving to patient homes in varying conditions to providing hands-on clinical care — and your benefits package is designed to…",
          narration: "In this lesson: Health Insurance, Enrollment & Qualifying Events. Understanding your employee benefits is an essential part of onboarding at Care Indeed. As a home health care professional, you face unique occupational demands — from driving to patient homes in varying conditions to providing hands-on clinical care — and your benefits package is designed to support your health, financial security, and professional growth.",
          estDurationSec: 45
        },
        {
          id: "GAO-027-L1-C1",
          type: "content",
          title: "Health Insurance, Enrollment & Qualifying Events",
          body: "Understanding your employee benefits is an essential part of onboarding at Care Indeed. As a home health care professional, you face unique occupational demands — from driving to patient homes in varying conditions to providing hands-on clinical care — and your benefits package is designed to support your health,…",
          narration: "Understanding your employee benefits is an essential part of onboarding at Care Indeed. As a home health care professional, you face unique occupational demands — from driving to patient homes in varying conditions to providing hands-on clinical care — and your benefits package is designed to support your health, financial security, and professional growth. This module provides an overview of available benefits and the enrollment process. For detailed plan documents and specific coverage terms, refer to the benefits summary provided by HR or the employee benefits portal. Health insurance is the cornerstone of your benefits package. Care Indeed offers medical, dental, and vision insurance plans to eligible employees. Eligibility typically begins after a waiting period defined in your offer letter — commonly 30, 60, or 90 days from your date of hire, depending on your employment classification. Full-time employees are generally eligible for the full benefits package. Part-time employees working",
          estDurationSec: 64
        },
        {
          id: "GAO-027-L1-C2",
          type: "content",
          title: "Health Insurance, Enrollment & Qualifying Events (part 2)",
          body: "a minimum number of hours per week may be eligible for prorated benefits. Per diem or temporary employees should confirm their eligibility status with HR.",
          narration: "a minimum number of hours per week may be eligible for prorated benefits. Per diem or temporary employees should confirm their eligibility status with HR. Medical insurance plans may include options such as a Preferred Provider Organization, or PPO, which allows you to see any provider but offers lower costs when you use in-network providers, and a Health Maintenance Organization, or HMO, which requires you to select a primary care physician and obtain referrals for specialist care. Each plan has different premium costs, deductibles, copayments, and out-of-pocket maximums. During enrollment, review the plan comparison documents carefully to select the option that best fits your healthcare needs and budget. Dental insurance typically covers preventive services at 100 percent — such as cleanings and exams — with varying coverage levels for basic procedures like fillings and major procedures like crowns and root canals. Vision insurance generally covers annual eye exams and provides",
          estDurationSec: 64
        },
        {
          id: "GAO-027-L1-C3",
          type: "content",
          title: "Health Insurance, Enrollment & Qualifying Events (part 3)",
          body: "an allowance for glasses or contact lenses. Both dental and vision plans have annual maximums that you should review during enrollment. The enrollment period is your window to elect or decline benefits.",
          narration: "an allowance for glasses or contact lenses. Both dental and vision plans have annual maximums that you should review during enrollment. The enrollment period is your window to elect or decline benefits. When you first become eligible, you will receive enrollment materials from HR with a deadline — typically 30 days from your eligibility date. If you miss the enrollment deadline, you will not be able to enroll until the next annual open enrollment period unless you experience a qualifying life event. Qualifying life events are specific changes in your personal circumstances that allow you to modify your benefit elections outside the annual open enrollment window. Examples include: marriage or divorce, birth or adoption of a child, loss of other health coverage such as a spouse losing their employer coverage, a spouse's open enrollment period, or a change in dependent eligibility. When a qualifying life event occurs, you must notify",
          estDurationSec: 64
        },
        {
          id: "GAO-027-L1-C4",
          type: "content",
          title: "Health Insurance, Enrollment & Qualifying Events (part 4)",
          body: "HR and complete the enrollment change within 30 days of the event. Do not wait — the 30-day window is strict, and missing it means waiting until open enrollment. Annual open enrollment typically occurs in the fourth quarter of each year for benefits effective January 1.",
          narration: "HR and complete the enrollment change within 30 days of the event. Do not wait — the 30-day window is strict, and missing it means waiting until open enrollment. Annual open enrollment typically occurs in the fourth quarter of each year for benefits effective January 1. During open enrollment, you can change plans, add or remove dependents, enroll in benefits you previously declined, or adjust your coverage levels. HR will communicate the open enrollment timeline, deadlines, and any plan changes or premium adjustments for the coming year. When enrolling in health insurance, you will need to designate your covered dependents — your spouse and eligible children. You will also select your primary care physician if enrolling in an HMO. Review each plan's provider network to ensure your preferred doctors, specialists, and hospitals are included. Switching plans mid-year outside a qualifying life event is generally not permitted. Premium contributions are deducted",
          estDurationSec: 64
        },
        {
          id: "GAO-027-L1-C5",
          type: "content",
          title: "Health Insurance, Enrollment & Qualifying Events (part 5)",
          body: "from your paycheck on a pre-tax basis, which means the amount you pay for insurance premiums reduces your taxable income. This effectively lowers your cost. Your pay stub will itemize each deduction including medical, dental, and vision premiums. If you have questions about your deductions, contact HR or payroll.",
          narration: "from your paycheck on a pre-tax basis, which means the amount you pay for insurance premiums reduces your taxable income. This effectively lowers your cost. Your pay stub will itemize each deduction including medical, dental, and vision premiums. If you have questions about your deductions, contact HR or payroll. For home health professionals specifically, it is important to understand how your health coverage works when you are in the field. If you are injured during a patient visit or while driving between patients, workers' compensation — not your personal health insurance — covers your medical treatment. We will discuss workers' compensation in more detail shortly. However, if you have a personal health concern unrelated to work, your medical insurance is your primary coverage.",
          estDurationSec: 53
        },
        {
          id: "GAO-027-L1-CH",
          type: "challenge",
          title: "Knowledge Check 1 Question: You got married last month but…",
          body: "Knowledge Check 1 Question: You got married last month but forgot to add your spouse to your health insurance. The annual open enrollment is 8 months away.",
          narration: "Knowledge Check 1 Question: You got married last month but forgot to add your spouse to your health insurance. The annual open enrollment is 8 months away. Can you still add your spouse? Answer: Yes, but only if you are within 30 days of the marriage — which is a qualifying life event. Contact HR immediately.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-027-L1-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 1 Question: You got married last month but forgot to add your spouse to your health insurance. The annual open enrollment is 8 months away.",
            narration: "Knowledge Check 1 Question: You got married last month but forgot to add your spouse to your health insurance. The annual open enrollment is 8 months away.",
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
      id: "GAO-027-L2",
      order: 2,
      title: "PTO, Leave, Retirement, Professional Development & Additional Benefits",
      objectives: [
        "Apply key requirements from PTO, Leave, Retirement, Professional Development & Additional Benefits",
        "Identify correct field actions related to PTO, Leave, Retirement, Professional Development & Additional Benefits"
      ],
      cards: [
        {
          id: "GAO-027-L2-S",
          type: "summary",
          title: "PTO, Leave, Retirement, Professional Development & Additional Benefits",
          body: "Beyond health insurance, Care Indeed provides a comprehensive benefits package that supports your work-life balance, financial future, and professional development. Paid Time Off, or PTO, accrues based on your employment status and length of service.",
          narration: "In this lesson: PTO, Leave, Retirement, Professional Development & Additional Benefits. Beyond health insurance, Care Indeed provides a comprehensive benefits package that supports your work-life balance, financial future, and professional development. Paid Time Off, or PTO, accrues based on your employment status and length of service. The accrual rate, maximum balance, and usage policies are defined in the agency's PTO policy.",
          estDurationSec: 45
        },
        {
          id: "GAO-027-L2-C1",
          type: "content",
          title: "PTO, Leave, Retirement, Professional Development & Additional Benefits",
          body: "Beyond health insurance, Care Indeed provides a comprehensive benefits package that supports your work-life balance, financial future, and professional development. Paid Time Off, or PTO, accrues based on your employment status and length of service.",
          narration: "Beyond health insurance, Care Indeed provides a comprehensive benefits package that supports your work-life balance, financial future, and professional development. Paid Time Off, or PTO, accrues based on your employment status and length of service. The accrual rate, maximum balance, and usage policies are defined in the agency's PTO policy. PTO is used for vacation, personal time, and other non-medical absences. You must request PTO in advance through the scheduling system and obtain supervisor approval. During busy periods or when coverage is limited, the agency may need to adjust PTO approvals to ensure patient care continuity. Plan your time off early to maximize approval chances. Unused PTO may be subject to rollover limits or payout upon separation depending on agency policy and California law. California Paid Sick Leave provides eligible employees with paid sick days for their own health needs, to care for a family member, or for certain purposes",
          estDurationSec: 64
        },
        {
          id: "GAO-027-L2-C2",
          type: "content",
          title: "PTO, Leave, Retirement, Professional Development & Additional Benefits (part 2)",
          body: "related to domestic violence, sexual assault, or stalking. California law requires a minimum accrual rate, and sick leave may be used as it accrues. You do not need to find a substitute to use sick leave — that is the agency's responsibility.",
          narration: "related to domestic violence, sexual assault, or stalking. California law requires a minimum accrual rate, and sick leave may be used as it accrues. You do not need to find a substitute to use sick leave — that is the agency's responsibility. However, you must follow the agency's notification procedures, including calling your supervisor before your first scheduled visit whenever possible. The Family and Medical Leave Act, FMLA, and the California Family Rights Act, CFRA, provide eligible employees with up to 12 weeks of unpaid, job-protected leave per year for qualifying reasons. These include: your own serious health condition, caring for a spouse, child, or parent with a serious health condition, bonding with a new child through birth, adoption, or foster placement, and qualifying military exigencies. To be eligible for FMLA, you must have worked for the employer for at least 12 months and at least 1,250 hours during the",
          estDurationSec: 64
        },
        {
          id: "GAO-027-L2-C3",
          type: "content",
          title: "PTO, Leave, Retirement, Professional Development & Additional Benefits (part 3)",
          body: "preceding 12 months. CFRA in California has slightly different eligibility criteria and covers additional family members. Notify HR as early as possible when you anticipate needing FMLA or CFRA leave — advance notice is required when the leave is foreseeable.",
          narration: "preceding 12 months. CFRA in California has slightly different eligibility criteria and covers additional family members. Notify HR as early as possible when you anticipate needing FMLA or CFRA leave — advance notice is required when the leave is foreseeable. Workers' compensation is a state-mandated insurance program that covers medical treatment, wage replacement, and rehabilitation for work-related injuries and illnesses. If you are injured on the job — whether during a patient visit, while driving between patients, or due to a repetitive strain injury — workers' compensation covers your care regardless of who was at fault. The key requirement is that you report the injury to your supervisor immediately and complete the required documentation. We covered this in detail in GAO-018: Workplace Injury Reporting. The Employee Assistance Program, or EAP, is a confidential resource available to you and your household members at no cost. EAP services typically include short-term counseling",
          estDurationSec: 64
        },
        {
          id: "GAO-027-L2-C4",
          type: "content",
          title: "PTO, Leave, Retirement, Professional Development & Additional Benefits (part 4)",
          body: "for stress, anxiety, depression, substance use concerns, relationship issues, and grief. EAP also provides referrals for legal consultation, financial counseling, and childcare or eldercare resources.",
          narration: "for stress, anxiety, depression, substance use concerns, relationship issues, and grief. EAP also provides referrals for legal consultation, financial counseling, and childcare or eldercare resources. Home health work can be emotionally demanding — caring for seriously ill patients, managing complex family dynamics, and working independently can take a toll. The EAP exists specifically to support your wellbeing. All contacts with the EAP are confidential and are not reported to the agency. Retirement savings are supported through a 401(k) plan. Eligible employees may contribute a percentage of their pre-tax earnings to a 401(k) account, which grows tax-deferred until withdrawal in retirement. Care Indeed may offer an employer match — meaning the agency contributes additional funds to your account based on your contribution level, up to a specified percentage. The employer match is essentially free money that you should maximize if financially possible. Enrollment in the 401(k) plan is available during your",
          estDurationSec: 64
        },
        {
          id: "GAO-027-L2-C5",
          type: "content",
          title: "PTO, Leave, Retirement, Professional Development & Additional Benefits (part 5)",
          body: "initial eligibility window and during open enrollment. You may adjust your contribution percentage at any time through the retirement plan portal. Professional development is a core commitment at Care Indeed. The agency supports your ongoing education and career growth through several mechanisms.",
          narration: "initial eligibility window and during open enrollment. You may adjust your contribution percentage at any time through the retirement plan portal. Professional development is a core commitment at Care Indeed. The agency supports your ongoing education and career growth through several mechanisms. Continuing education benefits may include tuition reimbursement for approved courses, paid time for attending professional conferences or workshops, and access to online learning platforms. Licensure renewal support includes reminders for upcoming renewal deadlines and may include reimbursement for renewal fees depending on your role and agency policy. Professional liability insurance, also known as malpractice insurance, is provided by the agency for covered clinical activities performed within the scope of your employment. This means that when you are performing authorized patient care duties, the agency's liability insurance covers you. However, you may wish to carry your own individual professional liability policy as additional protection — many professional associations offer",
          estDurationSec: 64
        },
        {
          id: "GAO-027-L2-C6",
          type: "content",
          title: "PTO, Leave, Retirement, Professional Development & Additional Benefits (part 6)",
          body: "affordable coverage. COBRA continuation coverage allows you to temporarily continue your group health insurance if you lose coverage due to a qualifying event such as termination of employment, reduction in hours, or certain other life events.",
          narration: "affordable coverage. COBRA continuation coverage allows you to temporarily continue your group health insurance if you lose coverage due to a qualifying event such as termination of employment, reduction in hours, or certain other life events. Under COBRA, you pay the full premium plus an administrative fee, but you maintain the same coverage you had as an active employee. The COBRA election period is 60 days from the date of the qualifying event or the date you receive the COBRA notice, whichever is later. COBRA coverage can last up to 18 months for most qualifying events, and up to 36 months for certain dependent qualifying events. Beneficiary designations are important for your life insurance and retirement accounts. During enrollment, you will designate beneficiaries who will receive these benefits in the event of your death. Review and update your beneficiary designations whenever you experience a life change such as marriage, divorce,",
          estDurationSec: 64
        },
        {
          id: "GAO-027-L2-C7",
          type: "content",
          title: "PTO, Leave, Retirement, Professional Development & Additional Benefits (part 7)",
          body: "or the birth of a child. Outdated beneficiary designations can create significant legal and financial complications for your family.",
          narration: "or the birth of a child. Outdated beneficiary designations can create significant legal and financial complications for your family. All benefit information, plan documents, enrollment forms, and contact information for plan administrators are available through the HR portal and the employee benefits handbook provided during onboarding. If you have questions about any benefit, contact the HR department — they are your primary resource for benefits enrollment, changes, and claims assistance. > PP SEPARATION NOTICE: This training module provides education on employee benefits and enrollment. Completion of this module is a Training Module Complete event. Policy acknowledgment is a separate assigned activity in your P&P workflow.",
          estDurationSec: 45
        },
        {
          id: "GAO-027-L2-CH",
          type: "challenge",
          title: "Knowledge Check 2 Question: What is the COBRA election…",
          body: "Knowledge Check 2 Question: What is the COBRA election period after a qualifying event? Answer: 60 days from the qualifying event date or the date you receive the COBRA notice, whichever is later.",
          narration: "Knowledge Check 2 Question: What is the COBRA election period after a qualifying event? Answer: 60 days from the qualifying event date or the date you receive the COBRA notice, whichever is later. COBRA allows temporary continuation of group health coverage at full premium plus an administrative fee.",
          estDurationSec: 55,
          challenge: {
            id: "GAO-027-L2-CH-Q",
            format: "scenario_decision",
            prompt: "Knowledge Check 2 Question: What is the COBRA election period after a qualifying event? Answer: 60 days from the qualifying event date or the date you receive the COBRA notice, whichever is later.",
            narration: "Knowledge Check 2 Question: What is the COBRA election period after a qualifying event? Answer: 60 days from the qualifying event date or the date you receive the COBRA notice, whichever is later.",
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
    id: "GAO-027-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Benefits Overview & Enrollment. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Health Insurance, Enrollment & Qualifying Events\"?",
        narration: "Which statement best reflects the teaching in \"Health Insurance, Enrollment & Qualifying Events\"?",
        options: [
          {
            id: "a",
            label: "Understanding your employee benefits is an essential part of onboarding at Care Indeed.",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Skip documentation if the visit was brief.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Wait until annual survey to report concerns.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only supervisors need to follow this requirement.",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from GAO-027 page: Health Insurance, Enrollment & Qualifying Events"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"PTO, Leave, Retirement, Professional Development & Additional Benefits\"?",
        narration: "Which statement best reflects the teaching in \"PTO, Leave, Retirement, Professional Development & Additional Benefits\"?",
        options: [
          {
            id: "a",
            label: "Beyond health insurance, Care Indeed provides a comprehensive benefits package that supports your work-life balance,…",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "b",
            label: "Skip documentation if the visit was brief.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "c",
            label: "Wait until annual survey to report concerns.",
            isCorrect: false,
            feedback: "Incorrect."
          },
          {
            id: "d",
            label: "Only supervisors need to follow this requirement.",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from GAO-027 page: PTO, Leave, Retirement, Professional Development & Additional Benefits"
      },
      {
        id: "q3",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Health Insurance, Enrollment & Qualifying Events\".",
        narration: "True or false: staff must apply the requirements taught in \"Health Insurance, Enrollment & Qualifying Events\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content."
      },
      {
        id: "q4",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"PTO, Leave, Retirement, Professional Development & Additional Benefits\".",
        narration: "True or false: staff must apply the requirements taught in \"PTO, Leave, Retirement, Professional Development & Additional Benefits\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content."
      },
      {
        id: "q5",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Health Insurance, Enrollment & Qualifying Events\".",
        narration: "True or false: staff must apply the requirements taught in \"Health Insurance, Enrollment & Qualifying Events\".",
        options: [
          {
            id: "t",
            label: "True",
            isCorrect: true,
            feedback: "Correct."
          },
          {
            id: "f",
            label: "False",
            isCorrect: false,
            feedback: "Incorrect."
          }
        ],
        rationale: "Derived from module source content."
      }
    ]
  }
},
  {
    moduleId: 'GAO-EXAM',
    policyRefs: ['HR-TA-005'],
    cmsRefs: [],
    estimatedDurationMin: 45,
    durationSource: 'PP',
    splash: {
      title: 'General Orientation Competency Exam',
      subtitle: 'Comprehensive assessment of GAO modules 001-027',
      whyItMatters: 'This exam confirms competency across the full general orientation curriculum. A passing score (80%) is required to begin role-specific training and to be cleared for independent work. Results are recorded per HR-TA-005 (Employee Orientation & Onboarding) and signed by your supervisor.',
      narration: 'This is the comprehensive General Orientation competency exam covering modules one through twenty-seven. You must score eighty percent or higher to pass. Results are recorded per HR-TA-005 (Employee Orientation & Onboarding) in your training record and signed by your supervisor.',
    },
    navigation: { title: 'How This Exam Works', body: 'You will receive questions drawn from across the GAO curriculum. Each question is single-card, narrated, and tracked. There are no challenges between questions \u2014 this is the assessment itself. Eighty percent or higher is required to pass. If you score below 80%, you will be assigned remediation and a retake.', bullets: ['Questions across all 27 GAO modules', 'Audio narration on every question', 'No skipping; sequential answering', '80% to pass; remediation if below'], narration: 'You will receive questions drawn from across the General Orientation curriculum. Each question is single-card, narrated, and tracked. Eighty percent or higher is required to pass. If you score below eighty percent, you will be assigned remediation and a retake.' },
    lessons: [
      {
        id: 'GAO-EXAM-L1', order: 1, title: 'Pre-Exam Briefing',
        objectives: ['Confirm readiness', 'Acknowledge exam terms'],
        cards: [
          { id: 'GAO-EXAM-L1-S', type: 'summary', title: 'You Are Ready', body: 'You have completed all 27 GAO modules. The exam draws from each. Read carefully; narration plays on each question; submit when confident.', narration: 'You have completed all twenty-seven modules of General Orientation. This exam draws from each. Read each question carefully; narration plays on each question; submit when you are confident.', estDurationSec: 35 },
          { id: 'GAO-EXAM-L1-C1', type: 'content', title: 'Exam Terms', body: 'Independent work; no notes; no consulting peers; if you encounter material you have not learned, return to the relevant module before retaking.', narration: 'You will complete this exam independently. No notes. No consulting peers. If you encounter material you have not learned, return to the relevant module before retaking the exam.', estDurationSec: 40 },
          { id: 'GAO-EXAM-L1-C2', type: 'content', title: 'After You Pass', body: 'Supervisor signs per HR-TA-005 (Employee Orientation & Onboarding); you are cleared for role-specific training (RNF, LVN, HHA, etc.); CMS-required orientation evidence is generated and stored.', narration: 'When you pass: your supervisor signs per HR-TA-005; you are cleared for role-specific training such as RNF, LVN, or home health aide; and CMS-required orientation evidence is generated and stored in your training record.', estDurationSec: 40 },
          { id: 'GAO-EXAM-L1-CH', type: 'challenge', title: 'Acknowledge', body: 'Confirm you understand the exam terms.', narration: 'Confirm you understand the exam terms before proceeding.', estDurationSec: 30, challenge: { id: 'GAO-EXAM-L1-CH-Q', format: 'scenario_decision', prompt: 'Acknowledge to begin.', narration: 'Acknowledge to begin the exam.',
            options: [
              { id: 'a', label: 'I have completed all 27 GAO modules and will complete this exam independently.', isCorrect: true, feedback: 'Acknowledged. Proceed to the exam.' },
              { id: 'b', label: 'I will use my notes and ask coworkers.', isCorrect: false, feedback: 'Independent work is required for this exam.' },
            ], policyRef: 'HR-TA-005',
            feedbackCorrect: 'Acknowledged. Proceed to the exam.',
            feedbackIncorrect: 'Independent work is the exam standard.',
            complianceImpact: 'Failure to complete independently invalidates the competency.',
            realWorldConsequence: 'Invalid competency requires retake from beginning of orientation.',
            correctBehaviorGuidance: 'Independent work. No notes. Honest answers.',
          } },
        ],
      },
    ],
    finalTest: { id: 'GAO-EXAM-FT', passingScorePct: 0.80, instructionsNarration: 'This is the General Orientation competency exam. Twenty questions cover the full curriculum. Eighty percent required to pass. Independent work only.', failAction: 'remediation', questions: [
      // Compliance / Code of Conduct (GAO-001/002/003/004)
      { id: 'q1', format: 'true_false', prompt: 'You may accept a $200 holiday gift from a referring physician.', narration: 'True or false: you may accept a two-hundred-dollar holiday gift from a referring physician.',
        options: [{ id: 't', label: 'True', isCorrect: false, feedback: 'False \u2014 Anti-Kickback Statute prohibits.' }, { id: 'f', label: 'False', isCorrect: true, feedback: 'Correct.' }],
        rationale: 'AKS prohibits remuneration intended to induce referrals.', policyRef: 'CO-FA-001' },
      { id: 'q2', format: 'matching', prompt: 'Match enforcement statute to focus.', narration: 'Match each enforcement statute to its focus.',
        matches: [
          { left: 'False Claims Act', right: 'False/fraudulent claims to government' },
          { left: 'Anti-Kickback Statute', right: 'Remuneration for referrals' },
          { left: 'Stark Law', right: 'Physician self-referral' },
          { left: 'HIPAA', right: 'PHI privacy and security' },
        ], rationale: 'Statute knowledge drives correct response.', policyRef: 'CO-FA-001' },
      // Privacy basics (GAO-007)
      { id: 'q3', format: 'true_false', prompt: 'Looking up the chart of a relative who is also a patient is acceptable if you are curious.', narration: 'True or false: looking up the chart of a relative who is also a patient is acceptable if you are curious.',
        options: [{ id: 't', label: 'True', isCorrect: false, feedback: 'False \u2014 unauthorized access is a HIPAA breach.' }, { id: 'f', label: 'False', isCorrect: true, feedback: 'Correct.' }],
        rationale: 'Minimum necessary; treatment-only access.', policyRef: 'CO-HP-001' },
      // Security (GAO-008)
      { id: 'q4', format: 'structured_input', prompt: 'State the minimum password length.', narration: 'State the minimum password length under our policy.',
        fields: [{ id: 'len', label: 'Characters', acceptableAnswers: ['12', 'twelve'] }],
        rationale: '12-character standard.', policyRef: 'CO-HP-002' },
      // Breach (GAO-009)
      { id: 'q5', format: 'true_false', prompt: 'The 60-day breach notification clock starts at occurrence, not at discovery.', narration: 'True or false: the 60-day breach notification clock starts at occurrence, not at discovery.',
        options: [{ id: 't', label: 'True', isCorrect: false, feedback: 'False \u2014 starts at discovery.' }, { id: 'f', label: 'False', isCorrect: true, feedback: 'Correct.' }],
        rationale: 'Discovery starts the clock.', policyRef: 'CO-HP-003' },
      // Patient rights (GAO-010)
      { id: 'q6', format: 'matching', prompt: 'Match right to operational practice.', narration: 'Match each right to operational practice.',
        matches: [
          { left: 'Right to refuse', right: 'Honor, educate, document, notify' },
          { left: 'Right to grievance', right: '5-day acknowledge / 14-day resolve' },
          { left: 'Right to be informed', right: 'Written + verbal at admission' },
        ], rationale: 'Each right has observable practice.', policyRef: 'CL-PR-001' },
      // Advance directives (GAO-011)
      { id: 'q7', format: 'scenario_decision', prompt: 'DNR patient has cardiac arrest in your presence.', narration: 'A DNR patient has cardiac arrest in your presence. What is the correct action?',
        options: [
          { id: 'a', label: 'Call 911 and start CPR.', isCorrect: false, feedback: 'CPR violates DNR.' },
          { id: 'b', label: 'Honor DNR; comfort care; notify physician/supervisor; document; remain.', isCorrect: true, feedback: 'Correct.' },
        ], rationale: 'Honor DNR.', policyRef: 'CL-PR-002' },
      // Abuse reporting (GAO-012)
      { id: 'q8', format: 'true_false', prompt: 'You should investigate suspected abuse before reporting.', narration: 'True or false: you should investigate suspected abuse before reporting.',
        options: [{ id: 't', label: 'True', isCorrect: false, feedback: 'False \u2014 mandated reporters report on suspicion.' }, { id: 'f', label: 'False', isCorrect: true, feedback: 'Correct.' }],
        rationale: 'Mandated reporting is on suspicion.', policyRef: 'CL-PR-006' },
      // Infection prevention (GAO-013)
      { id: 'q9', format: 'sequencing', prompt: 'Order the doffing steps.', narration: 'Order the doffing steps.',
        steps: [{ id: 's1', label: 'Gloves' }, { id: 's2', label: 'Gown' }, { id: 's3', label: 'Eye protection' }, { id: 's4', label: 'Mask' }],
        correctOrder: ['s1', 's2', 's3', 's4'], rationale: 'Most-contaminated to least.', policyRef: 'CL-SD-016' },
      // BBP (GAO-014)
      { id: 'q10', format: 'structured_input', prompt: 'Maximum hours to begin HIV PEP.', narration: 'State the maximum window in hours to begin HIV post-exposure prophylaxis.',
        fields: [{ id: 'h', label: 'Hours', acceptableAnswers: ['72', 'seventy-two'] }],
        rationale: '72-hour PEP window.', policyRef: 'RM-OS-001' },
      // Emergency prep (GAO-015)
      { id: 'q11', format: 'matching', prompt: 'Match patient to tier.', narration: 'Match patient to emergency preparedness tier.',
        matches: [
          { left: 'Home ventilator', right: 'Tier 1 (24h)' },
          { left: 'BID dressing, stable', right: 'Tier 2 (48-72h)' },
          { left: 'Monthly visit, self-managed', right: 'Tier 3 (telephonic)' },
        ], rationale: 'Tiering drives prioritization.', policyRef: 'CL-PR-005' },
      // Personal safety (GAO-016)
      { id: 'q12', format: 'true_false', prompt: 'Clinicians have the right to refuse a visit they consider unsafe.', narration: 'True or false: clinicians have the right to refuse a visit they consider unsafe.',
        options: [{ id: 't', label: 'True', isCorrect: true, feedback: 'Correct.' }, { id: 'f', label: 'False', isCorrect: false, feedback: 'False.' }],
        rationale: 'Right to refuse.', policyRef: 'RM-SS-001' },
      // Workplace violence (GAO-017)
      { id: 'q13', format: 'sequencing', prompt: 'Order the CALMER de-escalation acronym.', narration: 'Order the CALMER acronym.',
        steps: [{ id: 's1', label: 'Calm voice' }, { id: 's2', label: 'Acknowledge feelings' }, { id: 's3', label: 'Listen actively' }, { id: 's4', label: 'Maintain space' }, { id: 's5', label: 'Empathize' }, { id: 's6', label: 'Reassure with options' }],
        correctOrder: ['s1', 's2', 's3', 's4', 's5', 's6'], rationale: 'CALMER order.', policyRef: 'RM-SS-002' },
      // Injury reporting (GAO-018)
      { id: 'q14', format: 'structured_input', prompt: 'Days to file workers\' comp claim.', narration: 'How many days do you have to file a workers\' compensation claim?',
        fields: [{ id: 'd', label: 'Days', acceptableAnswers: ['5', 'five'] }],
        rationale: '5-day standard.', policyRef: 'HR-WM-004' },
      // Anti-harassment (GAO-019)
      { id: 'q15', format: 'true_false', prompt: 'Retaliation is illegal even if the underlying harassment claim is not substantiated.', narration: 'True or false: retaliation is illegal even if the underlying harassment claim is not substantiated.',
        options: [{ id: 't', label: 'True', isCorrect: true, feedback: 'Correct.' }, { id: 'f', label: 'False', isCorrect: false, feedback: 'False.' }],
        rationale: 'Protected activity.', policyRef: 'HR-ER-004' },
      // Substance abuse (GAO-020)
      { id: 'q16', format: 'true_false', prompt: 'Refusal to test is treated as a positive result.', narration: 'True or false: refusal to test is treated as a positive result.',
        options: [{ id: 't', label: 'True', isCorrect: true, feedback: 'Correct.' }, { id: 'f', label: 'False', isCorrect: false, feedback: 'False.' }],
        rationale: 'Standard provision.', policyRef: 'HR-ER-005' },
      // Discipline (GAO-021)
      { id: 'q17', format: 'matching', prompt: 'Match conduct to first step.', narration: 'Match each conduct to first disciplinary step.',
        matches: [
          { left: 'First-time late documentation', right: 'Verbal coaching' },
          { left: 'Falsification', right: 'Termination (skip)' },
          { left: 'HIPAA snooping', right: 'Suspension or termination (skip)' },
        ], rationale: 'Severity drives step.', policyRef: 'HR-ER-002' },
      // Phishing (GAO-024)
      { id: 'q18', format: 'true_false', prompt: 'You should approve an unrequested MFA push prompt to make it stop.', narration: 'True or false: you should approve an unrequested MFA push prompt to make it stop.',
        options: [{ id: 't', label: 'True', isCorrect: false, feedback: 'False \u2014 always deny.' }, { id: 'f', label: 'False', isCorrect: true, feedback: 'Correct.' }],
        rationale: 'MFA fatigue defense.', policyRef: 'IT-UP-004' },
      // Documentation (GAO-025)
      { id: 'q19', format: 'true_false', prompt: 'Pre-charting (documenting before completing care) is acceptable to save time.', narration: 'True or false: pre-charting is acceptable to save time.',
        options: [{ id: 't', label: 'True', isCorrect: false, feedback: 'False \u2014 prohibited.' }, { id: 'f', label: 'False', isCorrect: true, feedback: 'Correct.' }],
        rationale: 'Pre-charting is prohibited.', policyRef: 'CL-CD-001' },
      // Time/EVV (GAO-026)
      { id: 'q20', format: 'true_false', prompt: 'Working off-the-clock is acceptable if you volunteer.', narration: 'True or false: working off-the-clock is acceptable if you volunteer.',
        options: [{ id: 't', label: 'True', isCorrect: false, feedback: 'False \u2014 FLSA prohibits.' }, { id: 'f', label: 'False', isCorrect: true, feedback: 'Correct.' }],
        rationale: 'FLSA standard.', policyRef: 'HR-ER-001' },
    ] },
  }
];
