/* GAO Phase 1 trainings — Modules 015-021 (AAA Record v2.0) */

import type { ModuleTraining } from './trainingContent.types';

const NAV_BULLETS = ["Single-card view","Audio narration on every card","Challenges required to advance","80% to pass final test"];
const NAV_NARRATION = "One card at a time. Audio narration on every card. Challenges must be completed before you continue. The final test requires eighty percent to pass.";
const NAV_BODY = "You will move through one card at a time. Use Next and Previous to navigate. Your progress, time on each card, and challenge responses are tracked for compliance. Skipping cards is not allowed.";

export const GAO_TRAININGS_015_021: ModuleTraining[] = [
  {
  moduleId: "GAO-015",
  policyRefs: [
    "OP-FM-005",
    "CL-PR-005"
  ],
  cmsRefs: [
    "42 CFR §484.102."
  ],
  estimatedDurationMin: 35,
  durationSource: "CMS",
  splash: {
    title: "Emergency Preparedness — Plan, Role & Communications",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Welcome to GAO-015, Emergency Preparedness — Plan, Role and Communications. This module covers one of the most critical responsibilities you will carry as a Care Indeed team member: knowing exactly what to do when an emergency strikes, whether you are in the…",
    narration: "Welcome to GAO-015, Emergency Preparedness — Plan, Role & Communications. Welcome to GAO-015, Emergency Preparedness — Plan, Role and Communications. This module covers one of the most critical responsibilities you will carry as a Care Indeed team member: knowing exactly what to do when an emergency strikes, whether you are in the…"
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
      id: "GAO-015-L1",
      order: 1,
      title: "Understanding the Agency Emergency Preparedness Plan",
      objectives: [
        "Apply key requirements from Understanding the Agency Emergency Preparedness Plan",
        "Identify correct field actions related to Understanding the Agency Emergency Preparedness Plan"
      ],
      cards: [
        {
          id: "GAO-015-L1-S",
          type: "summary",
          title: "Understanding the Agency Emergency Preparedness Plan",
          body: "Welcome to GAO-015, Emergency Preparedness — Plan, Role and Communications. This module covers one of the most critical responsibilities you will carry as a Care Indeed team member: knowing exactly what to do when an emergency strikes, whether you are in the office, in the field, or at a patient's…",
          narration: "In this lesson: Understanding the Agency Emergency Preparedness Plan. Welcome to GAO-015, Emergency Preparedness — Plan, Role and Communications. This module covers one of the most critical responsibilities you will carry as a Care Indeed team member: knowing exactly what to do when an emergency strikes, whether you are in the office, in the field, or at a patient's home. Let us begin with the regulatory foundation.",
          estDurationSec: 45
        },
        {
          id: "GAO-015-L1-C1",
          type: "content",
          title: "Understanding the Agency Emergency Preparedness Plan",
          body: "Welcome to GAO-015, Emergency Preparedness — Plan, Role and Communications. This module covers one of the most critical responsibilities you will carry as a Care Indeed team member: knowing exactly what to do when an emergency strikes, whether you are in the office, in the field, or at a patient's home.",
          narration: "Welcome to GAO-015, Emergency Preparedness — Plan, Role and Communications. This module covers one of the most critical responsibilities you will carry as a Care Indeed team member: knowing exactly what to do when an emergency strikes, whether you are in the office, in the field, or at a patient's home. Let us begin with the regulatory foundation. The Centers for Medicare and Medicaid Services requires every home health agency to maintain a comprehensive emergency preparedness program under 42 CFR §484.102. This is not optional — it is a Condition of Participation. Failure to comply can result in loss of Medicare certification and the inability to serve patients. The CMS Emergency Preparedness Rule has four core elements. First, a risk assessment and emergency plan. Second, policies and procedures. Third, a communication plan. Fourth, training and testing. Care Indeed maintains all four elements as part of our Emergency Preparedness Program. Our",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L1-C2",
          type: "content",
          title: "Understanding the Agency Emergency Preparedness Plan (part 2)",
          body: "agency's Emergency Preparedness Plan — referenced as Policy Reference: OP-FM-005 — is a living document updated annually and after any activation event. The plan addresses natural disasters including earthquakes, wildfires, and floods that are particularly relevant in California.",
          narration: "agency's Emergency Preparedness Plan — referenced as Policy Reference: OP-FM-005 — is a living document updated annually and after any activation event. The plan addresses natural disasters including earthquakes, wildfires, and floods that are particularly relevant in California. It addresses utility failures including power outages, water disruption, and communication system failures. It covers pandemic and infectious disease surges, workplace violence events, and active threat scenarios. As a home health provider, our emergency preparedness challenges are unique. Unlike a hospital where all patients are in one building, our patients are distributed across the community in their homes. This means our plan must account for dozens or hundreds of individual patient locations, each with different vulnerabilities. A patient on a ventilator during a power outage faces an immediate life-threatening situation. A patient in a flood zone may need evacuation assistance. A patient with dementia may not understand emergency instructions. Your first responsibility",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L1-C3",
          type: "content",
          title: "Understanding the Agency Emergency Preparedness Plan (part 3)",
          body: "is to know that this plan exists, where to find it, and who to contact when it activates. Every Care Indeed employee has access to the Emergency Preparedness Plan through the agency intranet and the physical copy maintained at each office location.",
          narration: "is to know that this plan exists, where to find it, and who to contact when it activates. Every Care Indeed employee has access to the Emergency Preparedness Plan through the agency intranet and the physical copy maintained at each office location. The plan includes specific contact trees, resource lists, and role assignments that we will cover in the next pages. Let us discuss the risk assessment component. Care Indeed conducts an annual Hazard Vulnerability Analysis, or HVA, that evaluates the probability and impact of each identified hazard in our service area. For our California locations, earthquake and wildfire score highest on probability. Power outages and pandemic events score highest on impact due to our patient population's medical device dependency and immune vulnerability. The HVA drives our resource allocation. We pre-position emergency supplies, maintain backup communication systems, and establish mutual aid agreements with other home health agencies. You should know",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L1-C4",
          type: "content",
          title: "Understanding the Agency Emergency Preparedness Plan (part 4)",
          body: "that if Care Indeed's primary office is rendered unusable, we have identified alternate care coordination sites and remote work protocols that allow continued patient care coordination.",
          narration: "that if Care Indeed's primary office is rendered unusable, we have identified alternate care coordination sites and remote work protocols that allow continued patient care coordination. Knowledge Check 1: What are the four core elements of the CMS Emergency Preparedness Rule? (Answer: Risk assessment and emergency plan, policies and procedures, communication plan, training and testing.) ---",
          estDurationSec: 35
        },
        {
          id: "GAO-015-L1-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Understanding the Agency Emergency Preparedness Plan\"?",
          narration: "What is the key takeaway from \"Understanding the Agency Emergency Preparedness Plan\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-015-L1-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Understanding the Agency Emergency Preparedness Plan\"?",
            narration: "What is the key takeaway from \"Understanding the Agency Emergency Preparedness Plan\"?",
            options: [
              {
                id: "a",
                label: "Welcome to GAO-015, Emergency Preparedness — Plan, Role and Communications.",
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
            policyRef: "OP-FM-005",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Welcome to GAO-015, Emergency Preparedness — Plan, Role and Communications. This module covers one of the most critical responsibilities you will carry as a Care Indeed team member: knowing exactly what to do when an…"
          }
        }
      ]
    },
    {
      id: "GAO-015-L2",
      order: 2,
      title: "Your Role During an Emergency",
      objectives: [
        "Apply key requirements from Your Role During an Emergency",
        "Identify correct field actions related to Your Role During an Emergency"
      ],
      cards: [
        {
          id: "GAO-015-L2-S",
          type: "summary",
          title: "Your Role During an Emergency",
          body: "Now let us talk specifically about your role. During an emergency, every Care Indeed team member has responsibilities that are defined by your position and your location at the time of the event.",
          narration: "In this lesson: Your Role During an Emergency. Now let us talk specifically about your role. During an emergency, every Care Indeed team member has responsibilities that are defined by your position and your location at the time of the event. If you are a field clinician — a nurse, therapist, or home health aide — and you are with a patient when an emergency occurs, your first priority is always patient safety, followed by your own safety.",
          estDurationSec: 45
        },
        {
          id: "GAO-015-L2-C1",
          type: "content",
          title: "Your Role During an Emergency",
          body: "Now let us talk specifically about your role. During an emergency, every Care Indeed team member has responsibilities that are defined by your position and your location at the time of the event.",
          narration: "Now let us talk specifically about your role. During an emergency, every Care Indeed team member has responsibilities that are defined by your position and your location at the time of the event. If you are a field clinician — a nurse, therapist, or home health aide — and you are with a patient when an emergency occurs, your first priority is always patient safety, followed by your own safety. You are not expected to be a first responder, but you are expected to execute immediate safety measures within your scope. For an earthquake, if you are in a patient's home, you should instruct the patient to drop, cover, and hold on if they are physically able. If the patient is bedbound, protect them by placing pillows or blankets over them to shield from falling objects. After the shaking stops, assess the patient for injuries, check for gas leaks or",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L2-C2",
          type: "content",
          title: "Your Role During an Emergency (part 2)",
          body: "structural damage, and determine if the home is safe to remain in. If you smell gas, do not use light switches or phones inside the home — evacuate the patient if it is safe to do so and call 911 from outside. For a wildfire evacuation order, check whether the patient is in an evacuation zone.",
          narration: "structural damage, and determine if the home is safe to remain in. If you smell gas, do not use light switches or phones inside the home — evacuate the patient if it is safe to do so and call 911 from outside. For a wildfire evacuation order, check whether the patient is in an evacuation zone. If yes, determine their mobility status. Can they self-evacuate? Do they need wheelchair transport? Do they require medical transport with oxygen or IV equipment? Contact the Care Indeed Emergency Coordinator immediately and coordinate with local emergency services. Never attempt to transport a patient in your personal vehicle if they require medical equipment — call 911 for medical transport. For a power outage, immediately assess whether the patient has any electrically powered medical devices. Ventilators, oxygen concentrators, suction machines, and powered hospital beds are the highest priorities. Check if the patient has battery backup for",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L2-C3",
          type: "content",
          title: "Your Role During an Emergency (part 3)",
          body: "their equipment. Most home ventilators have internal batteries lasting two to four hours. Document the time the outage began and the estimated battery life remaining. Contact the Care Indeed office and the patient's physician if the outage is expected to last longer than the battery backup.",
          narration: "their equipment. Most home ventilators have internal batteries lasting two to four hours. Document the time the outage began and the estimated battery life remaining. Contact the Care Indeed office and the patient's physician if the outage is expected to last longer than the battery backup. If you are an office-based employee when an emergency occurs, follow the building evacuation plan for fire or structural emergencies. For an earthquake, drop, cover, and hold on under your desk. After the event, check on colleagues and follow the office incident commander's instructions. Your priority shifts to patient communication — helping to contact patients in affected areas to assess their safety and needs. Regardless of your role, you must understand the concept of shelter-in-place versus evacuation. Shelter-in-place means remaining in your current location because it is safer than attempting to travel. Evacuation means leaving the area because staying poses a greater risk. The",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L2-C4",
          type: "content",
          title: "Your Role During an Emergency (part 4)",
          body: "decision to shelter or evacuate is made by emergency management authorities for the community and by the Care Indeed Emergency Coordinator for agency operations. You should never make this decision independently for patients unless there is an immediate life-threatening situation like a fire in the home.",
          narration: "decision to shelter or evacuate is made by emergency management authorities for the community and by the Care Indeed Emergency Coordinator for agency operations. You should never make this decision independently for patients unless there is an immediate life-threatening situation like a fire in the home. Scenario Practice 1: You are providing wound care to Mrs. Tanaka, a 78-year-old patient on home oxygen, when the ground begins shaking violently. The oxygen concentrator is plugged into the wall. A bookshelf across the room begins tipping. Walk through your immediate actions in sequence. Expected Response: (1) Verbally instruct Mrs. Tanaka to stay still and protect her head — do not attempt to move her during active shaking. (2) If close enough, pull blankets or pillows over her for protection from falling objects. (3) You drop, cover, and hold on. (4) After shaking stops, assess Mrs. Tanaka for injuries. (5) Check if the",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L2-C5",
          type: "content",
          title: "Your Role During an Emergency (part 5)",
          body: "oxygen concentrator is still functioning — if power is out, switch to portable backup tank. (6) Assess the home for gas leaks (smell), structural damage (cracks, broken windows), and blocked exits. (7) If the home is unsafe, assist Mrs. Tanaka to evacuate if she is mobile; if not, call 911.",
          narration: "oxygen concentrator is still functioning — if power is out, switch to portable backup tank. (6) Assess the home for gas leaks (smell), structural damage (cracks, broken windows), and blocked exits. (7) If the home is unsafe, assist Mrs. Tanaka to evacuate if she is mobile; if not, call 911. (8) Contact the Care Indeed Emergency Coordinator to report the situation. Training Module Complete — Scenario Practice Complete ---",
          estDurationSec: 35
        },
        {
          id: "GAO-015-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Your Role During an Emergency\"?",
          narration: "What is the key takeaway from \"Your Role During an Emergency\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-015-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Your Role During an Emergency\"?",
            narration: "What is the key takeaway from \"Your Role During an Emergency\"?",
            options: [
              {
                id: "a",
                label: "Now let us talk specifically about your role. During an emergency, every Care Indeed team member has responsibilities that are defined by your position and your location at the…",
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
            policyRef: "OP-FM-005",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Now let us talk specifically about your role. During an emergency, every Care Indeed team member has responsibilities that are defined by your position and your location at the time of the event."
          }
        }
      ]
    },
    {
      id: "GAO-015-L3",
      order: 3,
      title: "Communication Protocols During Emergencies",
      objectives: [
        "Apply key requirements from Communication Protocols During Emergencies",
        "Identify correct field actions related to Communication Protocols During Emergencies"
      ],
      cards: [
        {
          id: "GAO-015-L3-S",
          type: "summary",
          title: "Communication Protocols During Emergencies",
          body: "Communication is arguably the most critical element of emergency response in home health. When a disaster strikes, the first thing that often fails is normal communication infrastructure. Cell towers become overloaded. Power outages knock out landlines and internet.",
          narration: "In this lesson: Communication Protocols During Emergencies. Communication is arguably the most critical element of emergency response in home health. When a disaster strikes, the first thing that often fails is normal communication infrastructure. Cell towers become overloaded. Power outages knock out landlines and internet. Roads may be blocked, preventing in-person check-ins.",
          estDurationSec: 45
        },
        {
          id: "GAO-015-L3-C1",
          type: "content",
          title: "Communication Protocols During Emergencies",
          body: "Communication is arguably the most critical element of emergency response in home health. When a disaster strikes, the first thing that often fails is normal communication infrastructure. Cell towers become overloaded. Power outages knock out landlines and internet.",
          narration: "Communication is arguably the most critical element of emergency response in home health. When a disaster strikes, the first thing that often fails is normal communication infrastructure. Cell towers become overloaded. Power outages knock out landlines and internet. Roads may be blocked, preventing in-person check-ins. Your ability to communicate effectively during these disruptions can directly impact patient survival. Care Indeed's Emergency Communication Plan — referenced under Policy Reference: CL-PR-005 — establishes a tiered communication protocol. Let me walk you through each tier. Tier One is the internal notification chain. When an emergency is identified, the Administrator or designee activates the emergency communication tree. This is a cascading phone tree where each person in the chain contacts the next two people. The tree is designed so that all employees can be contacted within 30 minutes of activation. You will receive your position in the communication tree during your first week. Save",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L3-C2",
          type: "content",
          title: "Communication Protocols During Emergencies (part 2)",
          body: "these contact numbers in your personal phone — do not rely on having access to the office directory during an emergency. Tier Two is employee status reporting. Once notified, you are expected to report your status within one hour using the designated method.",
          narration: "these contact numbers in your personal phone — do not rely on having access to the office directory during an emergency. Tier Two is employee status reporting. Once notified, you are expected to report your status within one hour using the designated method. The primary method is text message to your supervisor — text messages often get through when voice calls cannot because they use less bandwidth. The secondary method is email to the emergency status inbox. The tertiary method is calling the agency's emergency hotline, which is an out-of-state number specifically chosen because out-of-area lines are less likely to be overloaded during a local disaster. You will report one of three statuses: Available, meaning you are safe and able to work. Unavailable, meaning you are safe but unable to work due to personal circumstances. Unknown or no response, which triggers a welfare check protocol after four hours. Tier Three",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L3-C3",
          type: "content",
          title: "Communication Protocols During Emergencies (part 3)",
          body: "is patient prioritization and outreach. Once staff availability is known, the Clinical Manager coordinates patient outreach based on a pre-established priority matrix. Priority One patients are those with life-sustaining equipment — ventilators, IV infusions, peritoneal dialysis.",
          narration: "is patient prioritization and outreach. Once staff availability is known, the Clinical Manager coordinates patient outreach based on a pre-established priority matrix. Priority One patients are those with life-sustaining equipment — ventilators, IV infusions, peritoneal dialysis. Priority Two are patients with time-sensitive care needs — wound VACs, daily insulin, scheduled infusions. Priority Three are patients with routine care needs that can be safely delayed 24 to 48 hours. Priority Four are patients who are stable and do not require immediate contact. Tier Four is external coordination. Care Indeed maintains contact information for local emergency management agencies, hospitals, durable medical equipment companies, pharmacies, and other home health agencies. During a widespread disaster, we may activate mutual aid agreements where another agency covers our patients in an affected area while we cover theirs in an unaffected area. Let us discuss documentation during emergencies. Even in chaos, documentation matters. You should document every",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L3-C4",
          type: "content",
          title: "Communication Protocols During Emergencies (part 4)",
          body: "patient contact, every clinical decision, and every care modification made during the emergency. If you cannot access the electronic health record, use paper documentation — emergency documentation forms are included in your field bag and in the Emergency Preparedness Plan appendix.",
          narration: "patient contact, every clinical decision, and every care modification made during the emergency. If you cannot access the electronic health record, use paper documentation — emergency documentation forms are included in your field bag and in the Emergency Preparedness Plan appendix. These paper records must be entered into the EHR within 72 hours of normal operations resuming. One critical communication rule: never use social media to communicate patient information during an emergency. Even if phones are down and you are trying to reach colleagues, posting patient locations, conditions, or care needs on social media violates HIPAA and can result in termination and federal penalties. Use only the approved communication channels. Knowledge Check 2: What are the three employee status reporting methods in order of priority? (Answer: Text message to supervisor, email to emergency status inbox, call to out-of-state emergency hotline.) ---",
          estDurationSec: 60
        },
        {
          id: "GAO-015-L3-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Communication Protocols During Emergencies\"?",
          narration: "What is the key takeaway from \"Communication Protocols During Emergencies\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-015-L3-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Communication Protocols During Emergencies\"?",
            narration: "What is the key takeaway from \"Communication Protocols During Emergencies\"?",
            options: [
              {
                id: "a",
                label: "Communication is arguably the most critical element of emergency response in home health.",
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
            policyRef: "OP-FM-005",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Communication is arguably the most critical element of emergency response in home health. When a disaster strikes, the first thing that often fails is normal communication infrastructure. Cell towers become overloaded."
          }
        }
      ]
    },
    {
      id: "GAO-015-L4",
      order: 4,
      title: "Training, Testing & Post-Event Review",
      objectives: [
        "Apply key requirements from Training, Testing & Post-Event Review",
        "Identify correct field actions related to Training, Testing & Post-Event Review"
      ],
      cards: [
        {
          id: "GAO-015-L4-S",
          type: "summary",
          title: "Training, Testing & Post-Event Review",
          body: "The final component of emergency preparedness is training and testing. CMS requires that home health agencies conduct emergency preparedness training for all staff upon hire and annually thereafter. You are completing your initial training right now through this module.",
          narration: "In this lesson: Training, Testing & Post-Event Review. The final component of emergency preparedness is training and testing. CMS requires that home health agencies conduct emergency preparedness training for all staff upon hire and annually thereafter. You are completing your initial training right now through this module. Annual refresher training will be assigned automatically through the LMS.",
          estDurationSec: 45
        },
        {
          id: "GAO-015-L4-C1",
          type: "content",
          title: "Training, Testing & Post-Event Review",
          body: "The final component of emergency preparedness is training and testing. CMS requires that home health agencies conduct emergency preparedness training for all staff upon hire and annually thereafter. You are completing your initial training right now through this module.",
          narration: "The final component of emergency preparedness is training and testing. CMS requires that home health agencies conduct emergency preparedness training for all staff upon hire and annually thereafter. You are completing your initial training right now through this module. Annual refresher training will be assigned automatically through the LMS. Beyond training, CMS requires agencies to conduct exercises. Care Indeed participates in two types of exercises each year. The first is a tabletop exercise, which is a discussion-based session where leaders walk through a simulated emergency scenario and discuss decision points, resource needs, and communication flow. The second is either a full-scale exercise or participation in a community-wide drill coordinated by local emergency management. These exercises test our plan under realistic conditions and reveal gaps that we can address before a real emergency. Your participation in these exercises is mandatory and tracked. You will receive calendar invitations for scheduled drills. During",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L4-C2",
          type: "content",
          title: "Training, Testing & Post-Event Review (part 2)",
          body: "exercises, treat the scenario as real — follow the communication tree, report your status, and execute your assigned role. The lessons learned from exercises are far more valuable when participants fully engage. After any actual emergency activation or exercise, Care Indeed conducts an After Action Review, or AAR.",
          narration: "exercises, treat the scenario as real — follow the communication tree, report your status, and execute your assigned role. The lessons learned from exercises are far more valuable when participants fully engage. After any actual emergency activation or exercise, Care Indeed conducts an After Action Review, or AAR. The AAR follows a structured format: What was planned? What actually happened? Why was there a difference? What will we change? The AAR is not about blame — it is about improvement. Every team member who participated is invited to contribute observations. These observations feed directly into updates to the Emergency Preparedness Plan, ensuring our plan evolves based on real experience. Let us also discuss personal preparedness. While the agency has a comprehensive plan for patient care continuity, your ability to fulfill your role depends on your personal readiness. Care Indeed strongly encourages every employee to maintain a personal emergency kit at",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L4-C3",
          type: "content",
          title: "Training, Testing & Post-Event Review (part 3)",
          body: "home and in their vehicle. The kit should include water, non-perishable food, a flashlight, a battery-powered phone charger, a first aid kit, medications you take regularly, and copies of important documents. If you are personally displaced or injured during a disaster, you cannot help patients.",
          narration: "home and in their vehicle. The kit should include water, non-perishable food, a flashlight, a battery-powered phone charger, a first aid kit, medications you take regularly, and copies of important documents. If you are personally displaced or injured during a disaster, you cannot help patients. Taking care of yourself first is not selfish — it is operational readiness. For field staff, your vehicle emergency kit should also include: a paper map of your service area in case GPS is unavailable, your agency emergency contact card, extra PPE, and a portable phone charger. Keep your gas tank at least half full at all times during high-risk seasons — wildfire season in California runs roughly from May through October. Scenario Practice 2: A major 6.8 earthquake hits your service area at 2:15 PM on a Tuesday. You are driving between patient visits. Your car is shaken but you are uninjured. Cell service",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L4-C4",
          type: "content",
          title: "Training, Testing & Post-Event Review (part 4)",
          body: "is intermittent. You have three more patients scheduled today, including Mr. Rodriguez, a vent-dependent patient. What do you do? Expected Response: (1) Pull over safely and assess yourself and your vehicle for damage.",
          narration: "is intermittent. You have three more patients scheduled today, including Mr. Rodriguez, a vent-dependent patient. What do you do? Expected Response: (1) Pull over safely and assess yourself and your vehicle for damage. (2) Attempt to text your supervisor your status: 'Available — between visits — uninjured.' (3) If text fails, try email to the emergency status inbox. (4) Do NOT attempt to call — voice lines are likely overloaded. (5) Check your patient schedule — identify Mr. Rodriguez as Priority One (vent-dependent). (6) If you can safely reach Mr. Rodriguez's home, proceed there to assess his equipment status and battery backup. (7) If roads are impassable, text this information to your supervisor so another closer clinician can be dispatched. (8) Document your actions on paper if EHR is inaccessible. (9) Do NOT post any patient information on social media. Training Module Complete — Scenario Practice Complete --- ## COMPETENCY",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L4-C5",
          type: "content",
          title: "Training, Testing & Post-Event Review (part 5)",
          body: "ASSESSMENT — 10 Questions (80% Pass Score) ### Canonical Questions (Q1–Q5) Q1. What CMS regulation requires home health agencies to maintain an emergency preparedness program? - A) 42 CFR §484.55 - B) 42 CFR §484.102 ✓ - C) 42 CFR §484.80 - D) 29 CFR 1910.1030 Q2.",
          narration: "ASSESSMENT — 10 Questions (80% Pass Score) ### Canonical Questions (Q1–Q5) Q1. What CMS regulation requires home health agencies to maintain an emergency preparedness program? - A) 42 CFR §484.55 - B) 42 CFR §484.102 ✓ - C) 42 CFR §484.80 - D) 29 CFR 1910.1030 Q2. Which of the following is NOT one of the four core elements of the CMS Emergency Preparedness Rule? - A) Risk assessment and emergency plan - B) Communication plan - C) Staff credentialing verification ✓ - D) Training and testing Q3. During an earthquake, what is your first priority if you are with a bedbound patient? - A) Call the office immediately - B) Evacuate the patient to the yard - C) Protect the patient from falling objects with pillows/blankets ✓ - D) Turn off the gas meter Q4. What is the primary method for reporting your status during an emergency activation? -",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L4-C6",
          type: "content",
          title: "Training, Testing & Post-Event Review (part 6)",
          body: "A) Voice call to the administrator - B) Social media post to the team group - C) Text message to your supervisor ✓ - D) Email to all staff Q5.",
          narration: "A) Voice call to the administrator - B) Social media post to the team group - C) Text message to your supervisor ✓ - D) Email to all staff Q5. A Priority One patient in the emergency outreach matrix is defined as: - A) A patient with routine care needs - B) A patient with life-sustaining equipment ✓ - C) A patient who lives alone - D) A patient scheduled for that day ### Expansion Questions (Q6–Q10) Q6. You smell gas after an earthquake in a patient's home. What should you do? - A) Open windows to ventilate - B) Turn on a fan to disperse the gas - C) Evacuate the patient and call 911 from outside ✓ - D) Call the gas company from inside the home Q7. Why is an out-of-state phone number used for the agency's emergency hotline? - A) It is cheaper for long-distance calls",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L4-C7",
          type: "content",
          title: "Training, Testing & Post-Event Review (part 7)",
          body: "- B) Out-of-area lines are less likely to be overloaded during a local disaster ✓ - C) It routes through a government emergency system - D) It automatically records all calls for documentation Q8.",
          narration: "- B) Out-of-area lines are less likely to be overloaded during a local disaster ✓ - C) It routes through a government emergency system - D) It automatically records all calls for documentation Q8. How often does CMS require home health agencies to conduct emergency preparedness training for all staff? - A) Monthly - B) Quarterly - C) Upon hire and annually ✓ - D) Every two years Q9. A home health aide posts on social media: 'Earthquake! Heading to check on my vent patient on Oak Street.' This is a violation of: - A) OSHA regulations only - B) HIPAA — patient information disclosed on social media ✓ - C) The agency's dress code policy - D) No violation — this is appropriate communication Q10. During an After Action Review, the primary goal is to: - A) Assign blame for failures - B) Identify lessons learned and improve the",
          estDurationSec: 64
        },
        {
          id: "GAO-015-L4-C8",
          type: "content",
          title: "Training, Testing & Post-Event Review (part 8)",
          body: "plan ✓ - C) Calculate the financial cost of the emergency - D) Determine which employees responded fastest --- ## MODULE QA SUMMARY | Metric | Value | |--------|-------| | Narration Words | 4,550 | | Duration @ 130 wpm | 35.0 min | | Declared Duration | 35 min | | Duration PASS | ✅ YES | | Pages | 4 | | Exam Questions…",
          narration: "plan ✓ - C) Calculate the financial cost of the emergency - D) Determine which employees responded fastest --- ## MODULE QA SUMMARY | Metric | Value | |--------|-------| | Narration Words | 4,550 | | Duration @ 130 wpm | 35.0 min | | Declared Duration | 35 min | | Duration PASS | ✅ YES | | Pages | 4 | | Exam Questions | 10 (5+5) | | Scenarios | 2 | | Knowledge Checks | 2 | | Pass Score | 80% | | policyMapped | OP-FM-005, CL-PR-005 | | policyRefStatus | needs_review | | Forbidden Wording | CLEAN | | Batch | 2 |",
          estDurationSec: 47
        },
        {
          id: "GAO-015-L4-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Training, Testing & Post-Event Review\"?",
          narration: "What is the key takeaway from \"Training, Testing & Post-Event Review\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-015-L4-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Training, Testing & Post-Event Review\"?",
            narration: "What is the key takeaway from \"Training, Testing & Post-Event Review\"?",
            options: [
              {
                id: "a",
                label: "The final component of emergency preparedness is training and testing. CMS requires that home health agencies conduct emergency preparedness training for all staff upon hire and…",
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
            policyRef: "OP-FM-005",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "The final component of emergency preparedness is training and testing. CMS requires that home health agencies conduct emergency preparedness training for all staff upon hire and annually thereafter."
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-015-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Emergency Preparedness — Plan, Role & Communications. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Understanding the Agency Emergency Preparedness Plan\"?",
        narration: "Which statement best reflects the teaching in \"Understanding the Agency Emergency Preparedness Plan\"?",
        options: [
          {
            id: "a",
            label: "Welcome to GAO-015, Emergency Preparedness — Plan, Role and Communications.",
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
        rationale: "Derived from GAO-015 page: Understanding the Agency Emergency Preparedness Plan",
        policyRef: "OP-FM-005"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Your Role During an Emergency\"?",
        narration: "Which statement best reflects the teaching in \"Your Role During an Emergency\"?",
        options: [
          {
            id: "a",
            label: "Now let us talk specifically about your role. During an emergency, every Care Indeed team member has responsibilities…",
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
        rationale: "Derived from GAO-015 page: Your Role During an Emergency",
        policyRef: "OP-FM-005"
      },
      {
        id: "q3",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Communication Protocols During Emergencies\"?",
        narration: "Which statement best reflects the teaching in \"Communication Protocols During Emergencies\"?",
        options: [
          {
            id: "a",
            label: "Communication is arguably the most critical element of emergency response in home health.",
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
        rationale: "Derived from GAO-015 page: Communication Protocols During Emergencies",
        policyRef: "OP-FM-005"
      },
      {
        id: "q4",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Training, Testing & Post-Event Review\"?",
        narration: "Which statement best reflects the teaching in \"Training, Testing & Post-Event Review\"?",
        options: [
          {
            id: "a",
            label: "The final component of emergency preparedness is training and testing.",
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
        rationale: "Derived from GAO-015 page: Training, Testing & Post-Event Review",
        policyRef: "OP-FM-005"
      },
      {
        id: "q5",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Understanding the Agency Emergency Preparedness Plan\".",
        narration: "True or false: staff must apply the requirements taught in \"Understanding the Agency Emergency Preparedness Plan\".",
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
        policyRef: "OP-FM-005"
      }
    ]
  }
},
  {
  moduleId: "GAO-016",
  policyRefs: [
    "RM-SS-001"
  ],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "Personal Safety During Home Visits",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Welcome to GAO-016, Personal Safety During Home Visits. As a home health professional, your workplace is your patient's home and the community between visits. This creates safety challenges that are fundamentally different from a hospital or clinic setting.",
    narration: "Welcome to GAO-016, Personal Safety During Home Visits. Welcome to GAO-016, Personal Safety During Home Visits. As a home health professional, your workplace is your patient's home and the community between visits. This creates safety challenges that are fundamentally different from a hospital or clinic setting."
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
      id: "GAO-016-L1",
      order: 1,
      title: "Pre-Visit Safety Planning",
      objectives: [
        "Apply key requirements from Pre-Visit Safety Planning",
        "Identify correct field actions related to Pre-Visit Safety Planning"
      ],
      cards: [
        {
          id: "GAO-016-L1-S",
          type: "summary",
          title: "Pre-Visit Safety Planning",
          body: "Welcome to GAO-016, Personal Safety During Home Visits. As a home health professional, your workplace is your patient's home and the community between visits. This creates safety challenges that are fundamentally different from a hospital or clinic setting.",
          narration: "In this lesson: Pre-Visit Safety Planning. Welcome to GAO-016, Personal Safety During Home Visits. As a home health professional, your workplace is your patient's home and the community between visits. This creates safety challenges that are fundamentally different from a hospital or clinic setting. In a facility, you have security personnel, controlled access, and colleagues nearby.",
          estDurationSec: 45
        },
        {
          id: "GAO-016-L1-C1",
          type: "content",
          title: "Pre-Visit Safety Planning",
          body: "Welcome to GAO-016, Personal Safety During Home Visits. As a home health professional, your workplace is your patient's home and the community between visits. This creates safety challenges that are fundamentally different from a hospital or clinic setting.",
          narration: "Welcome to GAO-016, Personal Safety During Home Visits. As a home health professional, your workplace is your patient's home and the community between visits. This creates safety challenges that are fundamentally different from a hospital or clinic setting. In a facility, you have security personnel, controlled access, and colleagues nearby. In the field, you are often alone, in unfamiliar neighborhoods, entering private homes where you have limited control over the environment. This module will equip you with practical strategies to protect yourself while delivering excellent patient care. Safety begins before you leave the office. Every visit should include a pre-visit safety assessment. Review the patient's chart for any safety alerts. Care Indeed maintains a flagging system in the EHR where safety concerns are documented. These may include aggressive pets, household members with a history of hostility, known substance abuse in the home, weapons in the household, or previous safety incidents",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L1-C2",
          type: "content",
          title: "Pre-Visit Safety Planning (part 2)",
          body: "reported by other clinicians. Never ignore these flags — they exist because a colleague took the time to report a concern. Next, research the visit location. If it is a new patient or a neighborhood you have not visited before, review the address on a map. Identify the main routes in and out.",
          narration: "reported by other clinicians. Never ignore these flags — they exist because a colleague took the time to report a concern. Next, research the visit location. If it is a new patient or a neighborhood you have not visited before, review the address on a map. Identify the main routes in and out. Note whether the area has well-lit streets, whether there is safe parking nearby, and whether the home is in a multi-unit building that may have restricted access. For high-rise buildings, know which floor the patient lives on and whether the elevator is operational. Plan your visit schedule strategically. If possible, schedule visits to unfamiliar or higher-risk areas during daylight hours. Avoid scheduling as the last visit of the day when you may feel rushed and less vigilant. If you have concerns about a particular visit, discuss them with your supervisor before going. You always have the right",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L1-C3",
          type: "content",
          title: "Pre-Visit Safety Planning (part 3)",
          body: "to request a paired visit, where two clinicians attend together, or to request that the visit be relocated to the office. Before leaving for any visit, ensure your phone is fully charged.",
          narration: "to request a paired visit, where two clinicians attend together, or to request that the visit be relocated to the office. Before leaving for any visit, ensure your phone is fully charged. Inform your supervisor or a designated colleague of your visit schedule, including addresses and expected arrival and departure times. Care Indeed uses a check-in system — you are expected to check in when arriving at a patient's home and check out when leaving. If you do not check out within a reasonable time after your expected departure, your supervisor will attempt to contact you. This system only works if you use it consistently. Your vehicle is part of your safety planning. Keep your car in good working condition with at least half a tank of gas. Park in well-lit areas facing outward so you can leave quickly if needed. Do not leave your nursing bag, laptop, or any",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L1-C4",
          type: "content",
          title: "Pre-Visit Safety Planning (part 4)",
          body: "valuables visible in the car. Lock your doors immediately upon entering your vehicle. Knowledge Check 1: What three things should you review before a home visit for safety purposes? (Answer: Patient chart safety alerts, neighborhood/location assessment, visit schedule timing.) ---",
          narration: "valuables visible in the car. Lock your doors immediately upon entering your vehicle. Knowledge Check 1: What three things should you review before a home visit for safety purposes? (Answer: Patient chart safety alerts, neighborhood/location assessment, visit schedule timing.) ---",
          estDurationSec: 35
        },
        {
          id: "GAO-016-L1-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Pre-Visit Safety Planning\"?",
          narration: "What is the key takeaway from \"Pre-Visit Safety Planning\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-016-L1-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Pre-Visit Safety Planning\"?",
            narration: "What is the key takeaway from \"Pre-Visit Safety Planning\"?",
            options: [
              {
                id: "a",
                label: "Welcome to GAO-016, Personal Safety During Home Visits. As a home health professional, your workplace is your patient's home and the community between visits.",
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
            policyRef: "RM-SS-001",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Welcome to GAO-016, Personal Safety During Home Visits. As a home health professional, your workplace is your patient's home and the community between visits."
          }
        }
      ]
    },
    {
      id: "GAO-016-L2",
      order: 2,
      title: "Situational Awareness During Visits",
      objectives: [
        "Apply key requirements from Situational Awareness During Visits",
        "Identify correct field actions related to Situational Awareness During Visits"
      ],
      cards: [
        {
          id: "GAO-016-L2-S",
          type: "summary",
          title: "Situational Awareness During Visits",
          body: "Situational awareness is the practice of being consciously alert to what is happening around you and recognizing when something is not right. In home health, this skill can be the difference between a routine visit and a dangerous situation.",
          narration: "In this lesson: Situational Awareness During Visits. Situational awareness is the practice of being consciously alert to what is happening around you and recognizing when something is not right. In home health, this skill can be the difference between a routine visit and a dangerous situation. When you arrive at a patient's home, pause before entering. Look around the exterior.",
          estDurationSec: 45
        },
        {
          id: "GAO-016-L2-C1",
          type: "content",
          title: "Situational Awareness During Visits",
          body: "Situational awareness is the practice of being consciously alert to what is happening around you and recognizing when something is not right. In home health, this skill can be the difference between a routine visit and a dangerous situation. When you arrive at a patient's home, pause before entering.",
          narration: "Situational awareness is the practice of being consciously alert to what is happening around you and recognizing when something is not right. In home health, this skill can be the difference between a routine visit and a dangerous situation. When you arrive at a patient's home, pause before entering. Look around the exterior. Are there unfamiliar vehicles in the driveway? Are there people loitering near the entrance? Is there evidence of recent disturbance — broken windows, scattered items, loud arguments from inside? Trust your instincts. If something feels wrong, do not enter. Return to your car, lock the doors, and call your supervisor. As you approach the door, stand to the side rather than directly in front of it. This is a basic safety practice that keeps you out of the direct line if the door opens suddenly. When the patient or a household member opens the door, greet them",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L2-C2",
          type: "content",
          title: "Situational Awareness During Visits (part 2)",
          body: "and assess their demeanor before entering. Are they calm and welcoming, or agitated and hostile? If anyone in the home appears intoxicated, under the influence of drugs, or in an escalated emotional state, use your professional judgment about whether it is safe to proceed.",
          narration: "and assess their demeanor before entering. Are they calm and welcoming, or agitated and hostile? If anyone in the home appears intoxicated, under the influence of drugs, or in an escalated emotional state, use your professional judgment about whether it is safe to proceed. Once inside, conduct a quick environmental scan. Identify all exits — the front door you came in, any back door, and accessible windows. Position yourself between the patient and the nearest exit. Never allow yourself to be cornered in a room with only one exit blocked by another person. Keep your nursing bag close to you and your car keys accessible at all times. Be alert to changes in the home environment between visits. A new household member, particularly one who seems hostile to your presence, is a red flag. Visible drug paraphernalia, unsecured weapons, or signs of illegal activity are all reasons to modify your",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L2-C3",
          type: "content",
          title: "Situational Awareness During Visits (part 3)",
          body: "safety approach. You are not law enforcement and you are not there to judge — but you are responsible for your own safety. Watch for escalation cues in verbal and non-verbal communication.",
          narration: "safety approach. You are not law enforcement and you are not there to judge — but you are responsible for your own safety. Watch for escalation cues in verbal and non-verbal communication. A person who is becoming agitated may pace, clench fists, raise their voice, invade your personal space, or make threatening statements. Escalation often follows a pattern: anxiety leads to defensiveness, defensiveness leads to verbal aggression, and verbal aggression can lead to physical aggression. Your goal is to intervene at the earliest possible stage through de-escalation. De-escalation techniques for home health include: speaking in a calm, low tone; using the person's name; acknowledging their feelings without agreeing with aggressive behavior; offering choices to give them a sense of control; creating physical distance; and clearly stating your intention to help. For example: 'Mr. Johnson, I can see you are frustrated. I want to help. Let us talk about what is",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L2-C4",
          type: "content",
          title: "Situational Awareness During Visits (part 4)",
          body: "bothering you so we can work together on a solution.' If de-escalation fails and you feel threatened, leave immediately. You do not need permission to leave. Say clearly, 'I need to step out now. I will contact the office to reschedule.' Walk, do not run, to the nearest exit.",
          narration: "bothering you so we can work together on a solution.' If de-escalation fails and you feel threatened, leave immediately. You do not need permission to leave. Say clearly, 'I need to step out now. I will contact the office to reschedule.' Walk, do not run, to the nearest exit. Once outside, go directly to your car, lock the doors, and drive to a safe location before calling your supervisor. Scenario Practice 1: You arrive at Mr. Chen's apartment for a scheduled wound care visit. As you approach the door, you hear loud shouting from inside. A man you do not recognize opens the door. He smells of alcohol and says aggressively, 'Who are you? We don't need any nurses.' Mr. Chen is visible behind him in a wheelchair. What do you do? Expected Response: (1) Do not enter the apartment. (2) Remain calm and introduce yourself professionally: 'I am [Name]",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L2-C5",
          type: "content",
          title: "Situational Awareness During Visits (part 5)",
          body: "from Care Indeed. I have a scheduled appointment with Mr. Chen.' (3) Assess the man's demeanor — if he remains hostile, do not attempt to push past him. (4) Say: 'I understand. I will step outside and call my office.",
          narration: "from Care Indeed. I have a scheduled appointment with Mr. Chen.' (3) Assess the man's demeanor — if he remains hostile, do not attempt to push past him. (4) Say: 'I understand. I will step outside and call my office. We can reschedule at a better time.' (5) Return to your car, lock the doors, and call your supervisor immediately. (6) Document the incident in the EHR including the description of the unknown individual, the aggressive behavior, and that you were unable to complete the visit. (7) A safety alert should be added to Mr. Chen's chart. (8) Your supervisor will coordinate a paired visit or alternate plan. Training Module Complete — Scenario Practice Complete ---",
          estDurationSec: 50
        },
        {
          id: "GAO-016-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Situational Awareness During Visits\"?",
          narration: "What is the key takeaway from \"Situational Awareness During Visits\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-016-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Situational Awareness During Visits\"?",
            narration: "What is the key takeaway from \"Situational Awareness During Visits\"?",
            options: [
              {
                id: "a",
                label: "Situational awareness is the practice of being consciously alert to what is happening around you and recognizing when something is not right.",
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
            policyRef: "RM-SS-001",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Situational awareness is the practice of being consciously alert to what is happening around you and recognizing when something is not right."
          }
        }
      ]
    },
    {
      id: "GAO-016-L3",
      order: 3,
      title: "High-Risk Visit Protocols & Vehicle Safety",
      objectives: [
        "Apply key requirements from High-Risk Visit Protocols & Vehicle Safety",
        "Identify correct field actions related to High-Risk Visit Protocols & Vehicle Safety"
      ],
      cards: [
        {
          id: "GAO-016-L3-S",
          type: "summary",
          title: "High-Risk Visit Protocols & Vehicle Safety",
          body: "Some visits carry inherently higher risk and require additional precautions. Care Indeed defines a high-risk visit as any visit where documented safety concerns exist, including: prior incidents of aggression or threats, known substance abuse in the home, active domestic violence situations,…",
          narration: "In this lesson: High-Risk Visit Protocols & Vehicle Safety. Some visits carry inherently higher risk and require additional precautions. Care Indeed defines a high-risk visit as any visit where documented safety concerns exist, including: prior incidents of aggression or threats, known substance abuse in the home, active domestic violence situations, patients in neighborhoods with high crime rates, or visits after hours or in darkness.",
          estDurationSec: 45
        },
        {
          id: "GAO-016-L3-C1",
          type: "content",
          title: "High-Risk Visit Protocols & Vehicle Safety",
          body: "Some visits carry inherently higher risk and require additional precautions. Care Indeed defines a high-risk visit as any visit where documented safety concerns exist, including: prior incidents of aggression or threats, known substance abuse in the home, active domestic violence situations, patients in neighborhoods…",
          narration: "Some visits carry inherently higher risk and require additional precautions. Care Indeed defines a high-risk visit as any visit where documented safety concerns exist, including: prior incidents of aggression or threats, known substance abuse in the home, active domestic violence situations, patients in neighborhoods with high crime rates, or visits after hours or in darkness. For high-risk visits, additional protocols apply. First, notify your supervisor before the visit and confirm the plan. Second, request a paired visit if the risk level warrants it. Two clinicians provide a significant safety advantage — one can monitor the environment while the other provides care. Third, use the buddy system check-in with increased frequency — text your supervisor upon arrival, midway through the visit, and upon departure. Fourth, carry only essential equipment. Leave your laptop in the trunk and bring only the supplies needed for that specific visit. If a patient's home has known",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L3-C2",
          type: "content",
          title: "High-Risk Visit Protocols & Vehicle Safety (part 2)",
          body: "weapons, Care Indeed policy requires that weapons be secured out of sight and locked away during your visit. You have the right to ask the patient or family to secure weapons before you begin your assessment.",
          narration: "weapons, Care Indeed policy requires that weapons be secured out of sight and locked away during your visit. You have the right to ask the patient or family to secure weapons before you begin your assessment. If they refuse or if you discover unsecured weapons during a visit, you may choose to leave and report the situation. Your personal safety takes priority. Domestic violence situations require particular sensitivity. If you suspect a patient is experiencing domestic violence, do not confront the abuser. Do not attempt to counsel the patient about leaving the relationship while the abuser is present. Instead, document your observations objectively in the EHR and report to your supervisor. Your supervisor will coordinate with social services. If you are in the home and a domestic violence incident begins, leave immediately and call 911 from a safe location. Vehicle safety is an extension of personal safety. Your car is",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L3-C3",
          type: "content",
          title: "High-Risk Visit Protocols & Vehicle Safety (part 3)",
          body: "your mobile office and your primary means of escape. Follow these rules consistently: always lock your doors while driving; do not stop in unfamiliar areas to check your phone or review charts — pull into a well-lit public area like a gas station or parking lot; do not display your agency badge or nursing bag…",
          narration: "your mobile office and your primary means of escape. Follow these rules consistently: always lock your doors while driving; do not stop in unfamiliar areas to check your phone or review charts — pull into a well-lit public area like a gas station or parking lot; do not display your agency badge or nursing bag prominently through car windows as this identifies you as a healthcare worker carrying medical supplies and potentially medications; if you believe you are being followed, do not drive home — drive to the nearest police station or fire station. Night visits present additional challenges. If you must make a visit after dark, park under a streetlight. Have your car keys ready before you exit the patient's home. Use your phone flashlight to illuminate your path to your car. Scan the area around your car before approaching it. If anyone is loitering near your vehicle, return",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L3-C4",
          type: "content",
          title: "High-Risk Visit Protocols & Vehicle Safety (part 4)",
          body: "to the patient's home and call for assistance. Knowledge Check 2: What are three additional protocols for high-risk visits? (Answer: Any three of: notify supervisor before visit, request paired visit, increased check-in frequency, carry only essential equipment, confirm weapons are secured.) ---",
          narration: "to the patient's home and call for assistance. Knowledge Check 2: What are three additional protocols for high-risk visits? (Answer: Any three of: notify supervisor before visit, request paired visit, increased check-in frequency, carry only essential equipment, confirm weapons are secured.) ---",
          estDurationSec: 35
        },
        {
          id: "GAO-016-L3-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"High-Risk Visit Protocols & Vehicle Safety\"?",
          narration: "What is the key takeaway from \"High-Risk Visit Protocols & Vehicle Safety\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-016-L3-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"High-Risk Visit Protocols & Vehicle Safety\"?",
            narration: "What is the key takeaway from \"High-Risk Visit Protocols & Vehicle Safety\"?",
            options: [
              {
                id: "a",
                label: "Some visits carry inherently higher risk and require additional precautions.",
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
            policyRef: "RM-SS-001",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Some visits carry inherently higher risk and require additional precautions. Care Indeed defines a high-risk visit as any visit where documented safety concerns exist, including: prior incidents of aggression or…"
          }
        }
      ]
    },
    {
      id: "GAO-016-L4",
      order: 4,
      title: "Incident Reporting & Self-Care After Safety Events",
      objectives: [
        "Apply key requirements from Incident Reporting & Self-Care After Safety Events",
        "Identify correct field actions related to Incident Reporting & Self-Care After Safety Events"
      ],
      cards: [
        {
          id: "GAO-016-L4-S",
          type: "summary",
          title: "Incident Reporting & Self-Care After Safety Events",
          body: "When a safety incident occurs — whether it is a verbal threat, an attempted assault, a dog bite, a vehicle break-in, or any event that compromised your safety — reporting is mandatory and immediate.",
          narration: "In this lesson: Incident Reporting & Self-Care After Safety Events. When a safety incident occurs — whether it is a verbal threat, an attempted assault, a dog bite, a vehicle break-in, or any event that compromised your safety — reporting is mandatory and immediate. Care Indeed takes every safety incident seriously, and your report triggers a review process designed to prevent recurrence. The incident reporting process has four steps.",
          estDurationSec: 45
        },
        {
          id: "GAO-016-L4-C1",
          type: "content",
          title: "Incident Reporting & Self-Care After Safety Events",
          body: "When a safety incident occurs — whether it is a verbal threat, an attempted assault, a dog bite, a vehicle break-in, or any event that compromised your safety — reporting is mandatory and immediate.",
          narration: "When a safety incident occurs — whether it is a verbal threat, an attempted assault, a dog bite, a vehicle break-in, or any event that compromised your safety — reporting is mandatory and immediate. Care Indeed takes every safety incident seriously, and your report triggers a review process designed to prevent recurrence. The incident reporting process has four steps. First, ensure your immediate safety. If you are injured, seek medical attention. If you are shaken but uninjured, get to a safe location. Second, call your supervisor within one hour to provide a verbal report. Third, complete the written Safety Incident Report form in the EHR within 24 hours. The report should include: date, time, and location; description of what happened; names and descriptions of all persons involved; any injuries sustained; actions you took; and witnesses. Fourth, participate in the incident review meeting, which your supervisor will schedule within 48 hours.",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L4-C2",
          type: "content",
          title: "Incident Reporting & Self-Care After Safety Events (part 2)",
          body: "Do not minimize incidents. A patient's family member who says, 'If you come back here, I will hurt you,' constitutes a verbal threat and must be reported even if you do not believe the person would act on it. A dog that lunges at you but does not make contact is still an incident.",
          narration: "Do not minimize incidents. A patient's family member who says, 'If you come back here, I will hurt you,' constitutes a verbal threat and must be reported even if you do not believe the person would act on it. A dog that lunges at you but does not make contact is still an incident. A car window broken while you were inside a patient's home is an incident. Under-reporting creates a false sense of safety for the next clinician assigned to that patient. After the incident is reported, Care Indeed will take appropriate action. This may include: adding or updating safety alerts in the patient's chart; requiring paired visits going forward; restricting the visit location to the office; issuing a behavioral contract to the patient or household member; or, in extreme cases, discharging the patient from services. You will be informed of the outcome and any changes to the care",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L4-C3",
          type: "content",
          title: "Incident Reporting & Self-Care After Safety Events (part 3)",
          body: "plan. Let us also address the emotional impact of safety incidents. Experiencing a threatening situation, even if you are not physically harmed, can cause significant stress. You may experience anxiety, sleep disruption, hypervigilance, or reluctance to make home visits. These are normal reactions.",
          narration: "plan. Let us also address the emotional impact of safety incidents. Experiencing a threatening situation, even if you are not physically harmed, can cause significant stress. You may experience anxiety, sleep disruption, hypervigilance, or reluctance to make home visits. These are normal reactions. Care Indeed's Employee Assistance Program, or EAP, provides free confidential counseling. You are encouraged to use it. Speaking with your supervisor or a trusted colleague can also help you process the experience. Finally, remember that safety is a shared responsibility. When you report an incident or add a safety alert to a chart, you are protecting every clinician who visits that patient after you. When a colleague shares a safety concern, take it seriously. When you notice an unsafe condition — an unleashed aggressive dog, a broken stairway, inadequate lighting — document it. Your observations become part of the collective safety intelligence that protects the entire Care",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L4-C4",
          type: "content",
          title: "Incident Reporting & Self-Care After Safety Events (part 4)",
          body: "Indeed team. Policy Reference: RM-SS-001 — Staff Safety and Personal Security. This policy contains detailed protocols for all situations described in this module. You are encouraged to read the full policy as a separate P&P activity.",
          narration: "Indeed team. Policy Reference: RM-SS-001 — Staff Safety and Personal Security. This policy contains detailed protocols for all situations described in this module. You are encouraged to read the full policy as a separate P&P activity. Note: reading this training module does not constitute acknowledgment of the formal policy. Policy acknowledgment is a separate assigned activity. Scenario Practice 2: During a visit to Mrs. Alvarez, her adult son enters the room intoxicated. He begins yelling that you are 'poisoning' his mother and blocks the doorway. Mrs. Alvarez is crying and asking him to stop. What are your immediate actions? Expected Response: (1) Remain calm. Do not argue or engage with the accusation. (2) Use de-escalation: 'I understand you are concerned about your mother's care. I am here to help her.' (3) If he does not move from the doorway, look for an alternate exit. (4) If no alternate exit is",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L4-C5",
          type: "content",
          title: "Incident Reporting & Self-Care After Safety Events (part 5)",
          body: "available and he is escalating, clearly and calmly state: 'I need to leave now. I will contact my office to make sure your mother continues to receive her care.' (5) If he allows you to pass, walk quickly to your car and lock the doors.",
          narration: "available and he is escalating, clearly and calmly state: 'I need to leave now. I will contact my office to make sure your mother continues to receive her care.' (5) If he allows you to pass, walk quickly to your car and lock the doors. (6) If he physically blocks you or makes a physical threat, call 911 from your phone. (7) Once safe, call your supervisor immediately. (8) Complete the Safety Incident Report within 24 hours. (9) A safety alert must be added to Mrs. Alvarez's chart and a paired visit or office-based visit should be arranged going forward. Training Module Complete — Scenario Practice Complete --- ## COMPETENCY ASSESSMENT — 10 Questions (80% Pass Score) ### Canonical Questions (Q1–Q5) Q1. Before entering a patient's home, you should: - A) Knock loudly and enter immediately - B) Stand to the side of the door and assess the situation before",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L4-C6",
          type: "content",
          title: "Incident Reporting & Self-Care After Safety Events (part 6)",
          body: "entering ✓ - C) Call the patient from your car and wait for them to come outside - D) Enter through the back door for safety Q2. Which of the following is the BEST first response when a household member becomes verbally aggressive? - A) Match their volume to show confidence - B) Threaten to call the police - C) Speak…",
          narration: "entering ✓ - C) Call the patient from your car and wait for them to come outside - D) Enter through the back door for safety Q2. Which of the following is the BEST first response when a household member becomes verbally aggressive? - A) Match their volume to show confidence - B) Threaten to call the police - C) Speak in a calm, low tone and acknowledge their feelings ✓ - D) Ignore them and continue treating the patient Q3. How often should you check in with your supervisor during a high-risk visit? - A) Only at the end of the visit - B) At arrival, midway, and departure ✓ - C) Every 10 minutes - D) Only if something goes wrong Q4. You discover an unsecured firearm on the kitchen table during a visit. What should you do? - A) Move the firearm to a safe location yourself",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L4-C7",
          type: "content",
          title: "Incident Reporting & Self-Care After Safety Events (part 7)",
          body: "- B) Ignore it and continue the visit - C) Ask that it be secured; if refused, you may leave and report ✓ - D) Call the police immediately Q5.",
          narration: "- B) Ignore it and continue the visit - C) Ask that it be secured; if refused, you may leave and report ✓ - D) Call the police immediately Q5. What is Care Indeed's check-in system designed to do? - A) Track your productivity - B) Verify you are following the care plan - C) Monitor your location so help can be sent if you do not check out ✓ - D) Calculate your mileage for reimbursement ### Expansion Questions (Q6–Q10) Q6. You believe you are being followed while driving between visits. You should: - A) Speed up and try to lose the vehicle - B) Drive home so you can call from a safe place - C) Drive to the nearest police or fire station ✓ - D) Pull over and confront the driver Q7. A safety alert in a patient's chart is flagged by a previous clinician. You",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L4-C8",
          type: "content",
          title: "Incident Reporting & Self-Care After Safety Events (part 8)",
          body: "should: - A) Ignore it — your experience may be different - B) Review it and take appropriate precautions before your visit ✓ - C) Refuse to see the patient - D) Remove the alert if your visit goes well Q8.",
          narration: "should: - A) Ignore it — your experience may be different - B) Review it and take appropriate precautions before your visit ✓ - C) Refuse to see the patient - D) Remove the alert if your visit goes well Q8. During a night visit, when should you have your car keys ready? - A) When you reach your car - B) Before you exit the patient's home ✓ - C) When you start the car - D) Keys should stay in your nursing bag Q9. After a safety incident where you were verbally threatened but not physically harmed, reporting is: - A) Optional — no physical harm occurred - B) Only required if you feel traumatized - C) Mandatory — verbal threats must be reported ✓ - D) Only required if your supervisor asks Q10. You suspect a patient is experiencing domestic violence. The suspected abuser is in the",
          estDurationSec: 64
        },
        {
          id: "GAO-016-L4-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Incident Reporting & Self-Care After Safety Events\"?",
          narration: "What is the key takeaway from \"Incident Reporting & Self-Care After Safety Events\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-016-L4-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Incident Reporting & Self-Care After Safety Events\"?",
            narration: "What is the key takeaway from \"Incident Reporting & Self-Care After Safety Events\"?",
            options: [
              {
                id: "a",
                label: "When a safety incident occurs — whether it is a verbal threat, an attempted assault, a dog bite, a vehicle break-in, or any event that compromised your safety — reporting is…",
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
            policyRef: "RM-SS-001",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "When a safety incident occurs — whether it is a verbal threat, an attempted assault, a dog bite, a vehicle break-in, or any event that compromised your safety — reporting is mandatory and immediate."
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-016-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Personal Safety During Home Visits. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Pre-Visit Safety Planning\"?",
        narration: "Which statement best reflects the teaching in \"Pre-Visit Safety Planning\"?",
        options: [
          {
            id: "a",
            label: "Welcome to GAO-016, Personal Safety During Home Visits.",
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
        rationale: "Derived from GAO-016 page: Pre-Visit Safety Planning",
        policyRef: "RM-SS-001"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Situational Awareness During Visits\"?",
        narration: "Which statement best reflects the teaching in \"Situational Awareness During Visits\"?",
        options: [
          {
            id: "a",
            label: "Situational awareness is the practice of being consciously alert to what is happening around you and recognizing when…",
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
        rationale: "Derived from GAO-016 page: Situational Awareness During Visits",
        policyRef: "RM-SS-001"
      },
      {
        id: "q3",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"High-Risk Visit Protocols & Vehicle Safety\"?",
        narration: "Which statement best reflects the teaching in \"High-Risk Visit Protocols & Vehicle Safety\"?",
        options: [
          {
            id: "a",
            label: "Some visits carry inherently higher risk and require additional precautions.",
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
        rationale: "Derived from GAO-016 page: High-Risk Visit Protocols & Vehicle Safety",
        policyRef: "RM-SS-001"
      },
      {
        id: "q4",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Incident Reporting & Self-Care After Safety Events\"?",
        narration: "Which statement best reflects the teaching in \"Incident Reporting & Self-Care After Safety Events\"?",
        options: [
          {
            id: "a",
            label: "When a safety incident occurs — whether it is a verbal threat, an attempted assault, a dog bite, a vehicle break-in, or…",
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
        rationale: "Derived from GAO-016 page: Incident Reporting & Self-Care After Safety Events",
        policyRef: "RM-SS-001"
      },
      {
        id: "q5",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Pre-Visit Safety Planning\".",
        narration: "True or false: staff must apply the requirements taught in \"Pre-Visit Safety Planning\".",
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
        policyRef: "RM-SS-001"
      }
    ]
  }
},
  {
  moduleId: "GAO-017",
  policyRefs: [
    "RM-SS-002"
  ],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "Workplace Violence Prevention",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Welcome to GAO-017, Workplace Violence Prevention. Workplace violence is a serious and growing concern in healthcare, and home health workers face disproportionately high risk.",
    narration: "Welcome to GAO-017, Workplace Violence Prevention. Welcome to GAO-017, Workplace Violence Prevention. Workplace violence is a serious and growing concern in healthcare, and home health workers face disproportionately high risk."
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
      id: "GAO-017-L1",
      order: 1,
      title: "Understanding Workplace Violence in Home Health",
      objectives: [
        "Apply key requirements from Understanding Workplace Violence in Home Health",
        "Identify correct field actions related to Understanding Workplace Violence in Home Health"
      ],
      cards: [
        {
          id: "GAO-017-L1-S",
          type: "summary",
          title: "Understanding Workplace Violence in Home Health",
          body: "Welcome to GAO-017, Workplace Violence Prevention. Workplace violence is a serious and growing concern in healthcare, and home health workers face disproportionately high risk.",
          narration: "In this lesson: Understanding Workplace Violence in Home Health. Welcome to GAO-017, Workplace Violence Prevention. Workplace violence is a serious and growing concern in healthcare, and home health workers face disproportionately high risk. According to the Bureau of Labor Statistics, healthcare workers are five times more likely to experience workplace violence than workers in other industries.",
          estDurationSec: 45
        },
        {
          id: "GAO-017-L1-C1",
          type: "content",
          title: "Understanding Workplace Violence in Home Health",
          body: "Welcome to GAO-017, Workplace Violence Prevention. Workplace violence is a serious and growing concern in healthcare, and home health workers face disproportionately high risk.",
          narration: "Welcome to GAO-017, Workplace Violence Prevention. Workplace violence is a serious and growing concern in healthcare, and home health workers face disproportionately high risk. According to the Bureau of Labor Statistics, healthcare workers are five times more likely to experience workplace violence than workers in other industries. Home health workers face even higher risk because they work alone, in environments they do not control, with patients and families who may be experiencing crisis. California has taken a leading role in addressing this issue. Effective July 1, 2024, Senate Bill 553 requires all California employers to establish, implement, and maintain a Workplace Violence Prevention Plan, or WVPP. This is not just a healthcare requirement — it applies to all employers. But for healthcare organizations like Care Indeed, it reinforces protections already required by Cal/OSHA under Title 8, Section 3342, the Healthcare Workplace Violence Prevention standard. Care Indeed maintains a comprehensive WVPP",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L1-C2",
          type: "content",
          title: "Understanding Workplace Violence in Home Health (part 2)",
          body: "as referenced in Policy Reference: RM-SS-002. Let us define what workplace violence means. The National Institute for Occupational Safety and Health, or NIOSH, categorizes workplace violence into four types. Type One is criminal intent, where the perpetrator has no relationship to the business or employees.",
          narration: "as referenced in Policy Reference: RM-SS-002. Let us define what workplace violence means. The National Institute for Occupational Safety and Health, or NIOSH, categorizes workplace violence into four types. Type One is criminal intent, where the perpetrator has no relationship to the business or employees. An example in home health would be a robbery or carjacking while you are traveling between visits. Type Two is client or patient violence, where the perpetrator is a current or former patient. This is the most common type in healthcare. A patient with dementia who strikes a caregiver during personal care is an example. Type Three is worker-on-worker violence, such as bullying, intimidation, or physical assault between colleagues. Type Four is personal relationship violence, where someone with a personal relationship to an employee — such as a domestic partner — comes to the workplace to commit violence. In home health, Type Two violence is",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L1-C3",
          type: "content",
          title: "Understanding Workplace Violence in Home Health (part 3)",
          body: "the most frequent, but Type One and Type Four also occur because you are working in the community rather than behind secured doors. Understanding all four types helps you recognize risk regardless of the source.",
          narration: "the most frequent, but Type One and Type Four also occur because you are working in the community rather than behind secured doors. Understanding all four types helps you recognize risk regardless of the source. Risk factors specific to home health include: working alone without colleagues nearby; entering homes where substance abuse, mental illness, or domestic violence may be present; carrying medications or supplies that have street value; working with patients who have cognitive impairment causing agitation or combative behavior; providing intimate personal care that may trigger resistance; navigating neighborhoods with high crime rates; and working during evenings or early mornings when visibility is reduced. Not all workplace violence involves physical assault. It includes verbal threats — 'I will hurt you if you come back.' It includes intimidation — a household member cleaning a weapon while you provide care. It includes harassment — repeated unwanted comments of a sexual, racial,",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L1-C4",
          type: "content",
          title: "Understanding Workplace Violence in Home Health (part 4)",
          body: "or threatening nature. It includes stalking — a patient or household member following you to your car or appearing at your other patients' homes. All of these constitute workplace violence and require reporting and response.",
          narration: "or threatening nature. It includes stalking — a patient or household member following you to your car or appearing at your other patients' homes. All of these constitute workplace violence and require reporting and response. Knowledge Check 1: What are the four types of workplace violence as categorized by NIOSH? (Answer: Type 1 — Criminal intent, Type 2 — Client/patient, Type 3 — Worker-on-worker, Type 4 — Personal relationship.) ---",
          estDurationSec: 35
        },
        {
          id: "GAO-017-L1-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Understanding Workplace Violence in Home Health\"?",
          narration: "What is the key takeaway from \"Understanding Workplace Violence in Home Health\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-017-L1-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Understanding Workplace Violence in Home Health\"?",
            narration: "What is the key takeaway from \"Understanding Workplace Violence in Home Health\"?",
            options: [
              {
                id: "a",
                label: "Welcome to GAO-017, Workplace Violence Prevention. Workplace violence is a serious and growing concern in healthcare, and home health workers face disproportionately high risk.",
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
            policyRef: "RM-SS-002",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Welcome to GAO-017, Workplace Violence Prevention. Workplace violence is a serious and growing concern in healthcare, and home health workers face disproportionately high risk."
          }
        }
      ]
    },
    {
      id: "GAO-017-L2",
      order: 2,
      title: "Prevention, Recognition & Response",
      objectives: [
        "Apply key requirements from Prevention, Recognition & Response",
        "Identify correct field actions related to Prevention, Recognition & Response"
      ],
      cards: [
        {
          id: "GAO-017-L2-S",
          type: "summary",
          title: "Prevention, Recognition & Response",
          body: "Prevention is always preferable to response. Care Indeed's Workplace Violence Prevention Plan includes multiple layers of prevention that you are expected to participate in actively. The first layer is hazard identification. Every employee has a role in identifying workplace violence hazards.",
          narration: "In this lesson: Prevention, Recognition & Response. Prevention is always preferable to response. Care Indeed's Workplace Violence Prevention Plan includes multiple layers of prevention that you are expected to participate in actively. The first layer is hazard identification. Every employee has a role in identifying workplace violence hazards.",
          estDurationSec: 45
        },
        {
          id: "GAO-017-L2-C1",
          type: "content",
          title: "Prevention, Recognition & Response",
          body: "Prevention is always preferable to response. Care Indeed's Workplace Violence Prevention Plan includes multiple layers of prevention that you are expected to participate in actively. The first layer is hazard identification. Every employee has a role in identifying workplace violence hazards.",
          narration: "Prevention is always preferable to response. Care Indeed's Workplace Violence Prevention Plan includes multiple layers of prevention that you are expected to participate in actively. The first layer is hazard identification. Every employee has a role in identifying workplace violence hazards. If you observe conditions that increase the risk of violence — an aggressive household member, evidence of illegal activity, unsafe environmental conditions, or escalating patient behavior — report them through the incident reporting system. Your observations are incorporated into the agency's violence risk assessment, which is reviewed and updated annually and after any violent incident. The second layer is environmental controls. While Care Indeed cannot control the patient's home environment, we can influence it. During the initial assessment visit, the admitting clinician evaluates the home for safety hazards including violence risk. If significant risks are identified, the care plan is modified — for example, requiring paired visits, restricting visit",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L2-C2",
          type: "content",
          title: "Prevention, Recognition & Response (part 2)",
          body: "hours to daylight, or relocating care to the office. For the agency office, environmental controls include locked entry doors, visitor sign-in, security cameras, panic buttons, and a layout that provides escape routes from all workstations. The third layer is behavioral warning signs recognition.",
          narration: "hours to daylight, or relocating care to the office. For the agency office, environmental controls include locked entry doors, visitor sign-in, security cameras, panic buttons, and a layout that provides escape routes from all workstations. The third layer is behavioral warning signs recognition. Violence rarely erupts without warning. Most perpetrators display escalating behavioral warning signs over days, weeks, or visits. These include: increasing agitation or irritability; verbal abuse that is worsening in severity; fixation on a perceived grievance against you, the agency, or the healthcare system; references to weapons or violent acts; statements of hopelessness or desperation combined with anger; dramatic mood swings; substance abuse that is increasing; and isolation from family or support systems. When you recognize warning signs, do not dismiss them. Document them specifically — not 'patient seemed upset' but 'patient stated: If you people do not fix this, someone is going to get hurt. Patient was",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L2-C3",
          type: "content",
          title: "Prevention, Recognition & Response (part 3)",
          body: "pacing, clenched fists, refused to sit during assessment.' Specific documentation enables proper risk assessment. The fourth layer is your personal response protocol. If you are in a situation where violence is imminent or occurring, follow the Run, Hide, Fight framework adapted for home health.",
          narration: "pacing, clenched fists, refused to sit during assessment.' Specific documentation enables proper risk assessment. The fourth layer is your personal response protocol. If you are in a situation where violence is imminent or occurring, follow the Run, Hide, Fight framework adapted for home health. Run means evacuate if possible. If the path to an exit is clear, leave immediately. Do not gather your belongings — your nursing bag and laptop can be replaced, you cannot. Go to your car, lock the doors, and drive to safety. Call 911 first, then your supervisor. Hide means shelter if you cannot escape. If the aggressor is blocking the exit or the violence is occurring in another part of the home and you are not the target, move to a room with a lockable door. Barricade if possible. Silence your phone. Stay hidden until law enforcement arrives. Fight is the absolute last resort —",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L2-C4",
          type: "content",
          title: "Prevention, Recognition & Response (part 4)",
          body: "only when your life is in immediate danger and you cannot run or hide. Use any available objects to defend yourself. Commit to the action with full force. This is survival, not restraint. After any workplace violence incident, you are not expected to continue working.",
          narration: "only when your life is in immediate danger and you cannot run or hide. Use any available objects to defend yourself. Commit to the action with full force. This is survival, not restraint. After any workplace violence incident, you are not expected to continue working. Care Indeed will arrange coverage for your remaining visits. You will be directed to medical evaluation if there is any possibility of injury, including psychological injury. You have the right to file a police report and the agency will support you in doing so. Scenario Practice 1: You are providing physical therapy to Mr. Davis in his living room. His adult son, who has been increasingly hostile over the past three visits, enters the room carrying a baseball bat. He says, 'I told you people to stop coming here. Get out of my house now.' He raises the bat to shoulder height. What do you",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L2-C5",
          type: "content",
          title: "Prevention, Recognition & Response (part 5)",
          body: "do? Expected Response: (1) This is an imminent threat — Run. (2) Do not attempt de-escalation with an armed, escalated individual. (3) Move toward the nearest exit immediately. Leave your equipment. (4) If he blocks the front door, move toward a back door or window.",
          narration: "do? Expected Response: (1) This is an imminent threat — Run. (2) Do not attempt de-escalation with an armed, escalated individual. (3) Move toward the nearest exit immediately. Leave your equipment. (4) If he blocks the front door, move toward a back door or window. (5) If you can exit, go directly to your car and leave the premises. (6) Call 911 immediately — report the threat and the weapon. (7) Then call your supervisor. (8) Do not return to the home. (9) File a Safety Incident Report. (10) A police report should be filed. The patient's care plan will be reassessed — the son's behavior may constitute grounds for patient discharge. Training Module Complete — Scenario Practice Complete ---",
          estDurationSec: 51
        },
        {
          id: "GAO-017-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Prevention, Recognition & Response\"?",
          narration: "What is the key takeaway from \"Prevention, Recognition & Response\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-017-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Prevention, Recognition & Response\"?",
            narration: "What is the key takeaway from \"Prevention, Recognition & Response\"?",
            options: [
              {
                id: "a",
                label: "Prevention is always preferable to response. Care Indeed's Workplace Violence Prevention Plan includes multiple layers of prevention that you are expected to participate in…",
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
            policyRef: "RM-SS-002",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Prevention is always preferable to response. Care Indeed's Workplace Violence Prevention Plan includes multiple layers of prevention that you are expected to participate in actively."
          }
        }
      ]
    },
    {
      id: "GAO-017-L3",
      order: 3,
      title: "Reporting, Zero Tolerance & Post-Incident Support",
      objectives: [
        "Apply key requirements from Reporting, Zero Tolerance & Post-Incident Support",
        "Identify correct field actions related to Reporting, Zero Tolerance & Post-Incident Support"
      ],
      cards: [
        {
          id: "GAO-017-L3-S",
          type: "summary",
          title: "Reporting, Zero Tolerance & Post-Incident Support",
          body: "Care Indeed maintains a zero-tolerance policy for workplace violence. Zero tolerance means that every incident is taken seriously, investigated, and addressed — regardless of who the perpetrator is. If a patient commits violence, they may be discharged from services.",
          narration: "In this lesson: Reporting, Zero Tolerance & Post-Incident Support. Care Indeed maintains a zero-tolerance policy for workplace violence. Zero tolerance means that every incident is taken seriously, investigated, and addressed — regardless of who the perpetrator is. If a patient commits violence, they may be discharged from services. If a household member commits violence, visits may be restricted or relocated.",
          estDurationSec: 45
        },
        {
          id: "GAO-017-L3-C1",
          type: "content",
          title: "Reporting, Zero Tolerance & Post-Incident Support",
          body: "Care Indeed maintains a zero-tolerance policy for workplace violence. Zero tolerance means that every incident is taken seriously, investigated, and addressed — regardless of who the perpetrator is. If a patient commits violence, they may be discharged from services.",
          narration: "Care Indeed maintains a zero-tolerance policy for workplace violence. Zero tolerance means that every incident is taken seriously, investigated, and addressed — regardless of who the perpetrator is. If a patient commits violence, they may be discharged from services. If a household member commits violence, visits may be restricted or relocated. If an employee commits workplace violence, they face disciplinary action up to and including termination. No one is exempt. Reporting is the foundation of the zero-tolerance policy. Without reports, the agency cannot act. California law under SB 553 requires that employers maintain a violent incident log that records every workplace violence incident. This log is reviewed by Cal/OSHA during inspections. Under-reporting not only endangers colleagues but creates regulatory exposure for the agency. You are required to report workplace violence through two channels. First, immediately notify your supervisor by phone. This enables rapid response — removing other clinicians from the",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L3-C2",
          type: "content",
          title: "Reporting, Zero Tolerance & Post-Incident Support (part 2)",
          body: "area, contacting law enforcement if needed, and arranging coverage. Second, complete the formal Workplace Violence Incident Report within 24 hours.",
          narration: "area, contacting law enforcement if needed, and arranging coverage. Second, complete the formal Workplace Violence Incident Report within 24 hours. This report feeds into the violent incident log, triggers the investigation process, and initiates any needed changes to the care plan, safety alerts, or security measures. You are protected from retaliation for reporting workplace violence. California Labor Code Section 6310 prohibits employers from retaliating against employees who report safety hazards, including workplace violence. Care Indeed reinforces this protection in our policy. If you experience or witness retaliation for a workplace violence report, report the retaliation to HR or the compliance hotline. Post-incident support is essential. Workplace violence, even when it does not result in physical injury, can cause acute stress reactions, post-traumatic stress, anxiety, depression, and fear of returning to work. Care Indeed provides the following support: immediate removal from duty for the remainder of the shift with pay; access",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L3-C3",
          type: "content",
          title: "Reporting, Zero Tolerance & Post-Incident Support (part 3)",
          body: "to the Employee Assistance Program for confidential counseling at no cost; a supervisor check-in within 24 hours; a formal debriefing within one week; modified duty or temporary reassignment if needed; and workers' compensation coverage for any physical or psychological injury resulting from workplace violence.",
          narration: "to the Employee Assistance Program for confidential counseling at no cost; a supervisor check-in within 24 hours; a formal debriefing within one week; modified duty or temporary reassignment if needed; and workers' compensation coverage for any physical or psychological injury resulting from workplace violence. You should not feel pressure to 'tough it out' or return to normal immediately. Everyone processes these events differently. Some people recover quickly; others need weeks of support. Both responses are normal, and both are supported by the agency. Let us also address patient violence related to medical conditions. A patient with advanced dementia who strikes you during a transfer is committing violence, but the root cause is cognitive impairment, not intent. These incidents still must be reported — they still carry risk of injury — but the response focuses on care plan modification rather than discharge. Strategies include: adjusting visit timing to the patient's best",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L3-C4",
          type: "content",
          title: "Reporting, Zero Tolerance & Post-Incident Support (part 4)",
          body: "cognitive hours, modifying approaches to personal care, ensuring adequate staffing for high-risk activities, and using calm, simple verbal cues to reduce agitation. The key distinction is between violence driven by medical conditions and violence driven by intent. Both are reported. Both are addressed.",
          narration: "cognitive hours, modifying approaches to personal care, ensuring adequate staffing for high-risk activities, and using calm, simple verbal cues to reduce agitation. The key distinction is between violence driven by medical conditions and violence driven by intent. Both are reported. Both are addressed. But the interventions differ. A patient with dementia who becomes combative during bathing needs a modified care approach. A cognitively intact household member who threatens you with a weapon needs law enforcement and potential discharge. Policy Reference: RM-SS-002 — Workplace Violence Prevention Plan. This policy contains the full WVPP as required by SB 553 and Cal/OSHA. You are encouraged to read the full policy as a separate P&P activity. Note: completing this training module does not constitute acknowledgment of the formal policy. Policy acknowledgment is a separate assigned activity. Scenario Practice 2: You have been visiting Mrs. Park three times weekly for wound care. Over the past",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L3-C5",
          type: "content",
          title: "Reporting, Zero Tolerance & Post-Incident Support (part 5)",
          body: "two weeks, Mrs. Park's daughter has made increasingly hostile comments: 'You people are worthless,' 'The wound is getting worse because of you,' and today she said, 'If that wound is not better by Friday, there will be consequences.' Mrs. Park is visibly uncomfortable with her daughter's behavior but says nothing.",
          narration: "two weeks, Mrs. Park's daughter has made increasingly hostile comments: 'You people are worthless,' 'The wound is getting worse because of you,' and today she said, 'If that wound is not better by Friday, there will be consequences.' Mrs. Park is visibly uncomfortable with her daughter's behavior but says nothing. What do you do? Expected Response: (1) Recognize the escalation pattern — hostility has worsened over two weeks and today's statement implies a threat. (2) Remain professional. Do not argue or defend. (3) Complete the visit if you feel safe. (4) Document all three statements with dates and exact wording in the EHR. (5) Report to your supervisor immediately after the visit. (6) File a formal Workplace Violence Incident Report. (7) Recommend a safety alert on Mrs. Park's chart. (8) Your supervisor should consider: a conversation with the daughter about expectations and conduct, a paired visit for the next scheduled",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L3-C6",
          type: "content",
          title: "Reporting, Zero Tolerance & Post-Incident Support (part 6)",
          body: "visit, and potentially an interdisciplinary team conference to address the daughter's concerns about wound healing. (9) If the daughter's behavior continues after intervention, escalation may include restricting the daughter's presence during visits or, in extreme cases, discharging the patient.",
          narration: "visit, and potentially an interdisciplinary team conference to address the daughter's concerns about wound healing. (9) If the daughter's behavior continues after intervention, escalation may include restricting the daughter's presence during visits or, in extreme cases, discharging the patient. Training Module Complete — Scenario Practice Complete --- ## COMPETENCY ASSESSMENT — 10 Questions (80% Pass Score) ### Canonical Questions (Q1–Q5) Q1. California SB 553 requires employers to: - A) Hire armed security guards - B) Establish, implement, and maintain a Workplace Violence Prevention Plan ✓ - C) Install metal detectors at all entrances - D) Prohibit home visits in high-crime areas Q2. Type Two workplace violence in home health most commonly involves: - A) A stranger robbing you during transit - B) A coworker bullying you - C) A patient or patient's household member committing violence ✓ - D) A domestic partner following you to a patient's home Q3. When",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L3-C7",
          type: "content",
          title: "Reporting, Zero Tolerance & Post-Incident Support (part 7)",
          body: "workplace violence is imminent and the path to an exit is clear, you should: - A) Attempt to restrain the aggressor - B) Hide in a closet - C) Evacuate immediately — leave belongings behind ✓ - D) Call your supervisor before moving Q4.",
          narration: "workplace violence is imminent and the path to an exit is clear, you should: - A) Attempt to restrain the aggressor - B) Hide in a closet - C) Evacuate immediately — leave belongings behind ✓ - D) Call your supervisor before moving Q4. Zero-tolerance policy means: - A) Any employee involved in violence is automatically fired - B) Every incident is taken seriously, investigated, and addressed regardless of perpetrator ✓ - C) Patients are never discharged for violence - D) Police are called for every verbal disagreement Q5. A patient with dementia who strikes you during a transfer should be: - A) Immediately discharged from services - B) Restrained during all future visits - C) Reported and the care plan modified to reduce agitation triggers ✓ - D) Not reported because the violence was unintentional ### Expansion Questions (Q6–Q10) Q6. Which California regulation specifically addresses workplace violence prevention in",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L3-C8",
          type: "content",
          title: "Reporting, Zero Tolerance & Post-Incident Support (part 8)",
          body: "healthcare settings? - A) Cal/OSHA Title 8 Section 3342 ✓ - B) Cal/OSHA Title 8 Section 5193 - C) California Labor Code Section 2810 - D) California Health & Safety Code Section 1278.5 Q7.",
          narration: "healthcare settings? - A) Cal/OSHA Title 8 Section 3342 ✓ - B) Cal/OSHA Title 8 Section 5193 - C) California Labor Code Section 2810 - D) California Health & Safety Code Section 1278.5 Q7. The 'Run, Hide, Fight' framework in home health means: - A) Run from every difficult patient, hide your identity, fight for better pay - B) Evacuate if possible, shelter if you cannot escape, fight only as absolute last resort ✓ - C) Run to the car, hide the incident from your supervisor, fight the urge to quit - D) Run a risk assessment, hide valuables, fight infection Q8. Behavioral warning signs of potential violence include all of the following EXCEPT: - A) Increasing agitation over multiple visits - B) Verbal references to weapons - C) A patient politely declining a service ✓ - D) Fixation on a perceived grievance combined with anger Q9. After a workplace",
          estDurationSec: 64
        },
        {
          id: "GAO-017-L3-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Reporting, Zero Tolerance & Post-Incident Support\"?",
          narration: "What is the key takeaway from \"Reporting, Zero Tolerance & Post-Incident Support\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-017-L3-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Reporting, Zero Tolerance & Post-Incident Support\"?",
            narration: "What is the key takeaway from \"Reporting, Zero Tolerance & Post-Incident Support\"?",
            options: [
              {
                id: "a",
                label: "Care Indeed maintains a zero-tolerance policy for workplace violence. Zero tolerance means that every incident is taken seriously, investigated, and addressed — regardless of who…",
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
            policyRef: "RM-SS-002",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Care Indeed maintains a zero-tolerance policy for workplace violence. Zero tolerance means that every incident is taken seriously, investigated, and addressed — regardless of who the perpetrator is."
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-017-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Workplace Violence Prevention. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Understanding Workplace Violence in Home Health\"?",
        narration: "Which statement best reflects the teaching in \"Understanding Workplace Violence in Home Health\"?",
        options: [
          {
            id: "a",
            label: "Welcome to GAO-017, Workplace Violence Prevention.",
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
        rationale: "Derived from GAO-017 page: Understanding Workplace Violence in Home Health",
        policyRef: "RM-SS-002"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Prevention, Recognition & Response\"?",
        narration: "Which statement best reflects the teaching in \"Prevention, Recognition & Response\"?",
        options: [
          {
            id: "a",
            label: "Prevention is always preferable to response. Care Indeed's Workplace Violence Prevention Plan includes multiple layers…",
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
        rationale: "Derived from GAO-017 page: Prevention, Recognition & Response",
        policyRef: "RM-SS-002"
      },
      {
        id: "q3",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Reporting, Zero Tolerance & Post-Incident Support\"?",
        narration: "Which statement best reflects the teaching in \"Reporting, Zero Tolerance & Post-Incident Support\"?",
        options: [
          {
            id: "a",
            label: "Care Indeed maintains a zero-tolerance policy for workplace violence.",
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
        rationale: "Derived from GAO-017 page: Reporting, Zero Tolerance & Post-Incident Support",
        policyRef: "RM-SS-002"
      },
      {
        id: "q4",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Understanding Workplace Violence in Home Health\".",
        narration: "True or false: staff must apply the requirements taught in \"Understanding Workplace Violence in Home Health\".",
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
        policyRef: "RM-SS-002"
      },
      {
        id: "q5",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Prevention, Recognition & Response\".",
        narration: "True or false: staff must apply the requirements taught in \"Prevention, Recognition & Response\".",
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
        policyRef: "RM-SS-002"
      }
    ]
  }
},
  {
  moduleId: "GAO-018",
  policyRefs: [
    "HR-WM-004"
  ],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "Workplace Injury Reporting",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Welcome to GAO-018, Workplace Injury Reporting. As a home health professional, you face occupational hazards every day — from lifting patients to driving between visits to potential exposure to infectious diseases.",
    narration: "Welcome to GAO-018, Workplace Injury Reporting. Welcome to GAO-018, Workplace Injury Reporting. As a home health professional, you face occupational hazards every day — from lifting patients to driving between visits to potential exposure to infectious diseases."
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
      id: "GAO-018-L1",
      order: 1,
      title: "Workers' Compensation, Injury Types & Reporting Requirements",
      objectives: [
        "Apply key requirements from Workers' Compensation, Injury Types & Reporting Requirements",
        "Identify correct field actions related to Workers' Compensation, Injury Types & Reporting Requirements"
      ],
      cards: [
        {
          id: "GAO-018-L1-S",
          type: "summary",
          title: "Workers' Compensation, Injury Types & Reporting Requirements",
          body: "Welcome to GAO-018, Workplace Injury Reporting. As a home health professional, you face occupational hazards every day — from lifting patients to driving between visits to potential exposure to infectious diseases.",
          narration: "In this lesson: Workers' Compensation, Injury Types & Reporting Requirements. Welcome to GAO-018, Workplace Injury Reporting. As a home health professional, you face occupational hazards every day — from lifting patients to driving between visits to potential exposure to infectious diseases. When an injury occurs on the job, knowing what to do, how to report it, and what protections you have under the law is essential.",
          estDurationSec: 45
        },
        {
          id: "GAO-018-L1-C1",
          type: "content",
          title: "Workers' Compensation, Injury Types & Reporting Requirements",
          body: "Welcome to GAO-018, Workplace Injury Reporting. As a home health professional, you face occupational hazards every day — from lifting patients to driving between visits to potential exposure to infectious diseases.",
          narration: "Welcome to GAO-018, Workplace Injury Reporting. As a home health professional, you face occupational hazards every day — from lifting patients to driving between visits to potential exposure to infectious diseases. When an injury occurs on the job, knowing what to do, how to report it, and what protections you have under the law is essential. This module covers the complete injury reporting process from the moment an injury occurs through your return to full duty. Let us start with the legal framework. In California, all employers are required to carry workers' compensation insurance. Workers' compensation is a no-fault insurance system, which means you are entitled to benefits regardless of who caused the injury — whether it was your own mistake, a patient's action, a road condition, or equipment failure. In exchange for guaranteed benefits, you generally cannot sue your employer for workplace injuries. This trade-off protects both you and",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L1-C2",
          type: "content",
          title: "Workers' Compensation, Injury Types & Reporting Requirements (part 2)",
          body: "the agency. Workers' compensation benefits in California include: medical treatment for the work-related injury at no cost to you; temporary disability payments if you miss more than three days of work; permanent disability payments if the injury results in lasting impairment; supplemental job displacement benefits if…",
          narration: "the agency. Workers' compensation benefits in California include: medical treatment for the work-related injury at no cost to you; temporary disability payments if you miss more than three days of work; permanent disability payments if the injury results in lasting impairment; supplemental job displacement benefits if you cannot return to your former position; and death benefits for dependents in the event of a fatal workplace injury. Care Indeed's workplace injury reporting process is governed by Policy Reference: HR-WM-004. The process has specific timelines that must be followed. Failure to report promptly can delay your benefits and create regulatory issues for the agency. Here is the reporting timeline. Within the first hour after an injury, you must notify your supervisor verbally. If the injury is severe — involving broken bones, loss of consciousness, hospitalization, amputation, or loss of an eye — call 911 first, then notify your supervisor immediately after. Your",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L1-C3",
          type: "content",
          title: "Workers' Compensation, Injury Types & Reporting Requirements (part 3)",
          body: "supervisor will initiate the Cal/OSHA reporting process for serious injuries, which requires notification to Cal/OSHA within eight hours. Within 24 hours, your supervisor will provide you with a DWC-1 form, which is the official Workers' Compensation Claim Form.",
          narration: "supervisor will initiate the Cal/OSHA reporting process for serious injuries, which requires notification to Cal/OSHA within eight hours. Within 24 hours, your supervisor will provide you with a DWC-1 form, which is the official Workers' Compensation Claim Form. You complete the employee section — your name, the date and time of injury, a description of what happened, the body parts affected, and the location where the injury occurred. Be specific in your description. Do not write 'hurt my back.' Write 'strained lower back while transferring 180-pound patient from wheelchair to bed at patient home at 123 Oak Street at approximately 10:30 AM.' Specificity matters for your claim. Within one working day of receiving your DWC-1 form, Care Indeed will complete the employer section and file it with our workers' compensation insurance carrier. The carrier then has 14 days to accept or deny the claim. During this period, you are entitled",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L1-C4",
          type: "content",
          title: "Workers' Compensation, Injury Types & Reporting Requirements (part 4)",
          body: "to up to $10,000 in medical treatment even before the claim is formally accepted. Let us discuss the types of injuries most common in home health.",
          narration: "to up to $10,000 in medical treatment even before the claim is formally accepted. Let us discuss the types of injuries most common in home health. Musculoskeletal injuries are the most frequent — back strains from patient transfers, shoulder injuries from reaching and lifting, and repetitive strain injuries from documentation work. These often develop gradually, which makes reporting tricky. California law allows you to report a cumulative trauma injury — an injury that develops over time from repetitive activities. The reporting date is the date you first realized the injury was work-related. Needlestick and sharps injuries require immediate action beyond standard reporting. If you sustain a needlestick, immediately wash the wound with soap and water. If a mucous membrane is exposed, flush with water for 15 minutes. Report to your supervisor and proceed to the designated occupational health provider within two hours. Time-sensitive post-exposure prophylaxis, or PEP, may be needed",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L1-C5",
          type: "content",
          title: "Workers' Compensation, Injury Types & Reporting Requirements (part 5)",
          body: "for potential HIV exposure and must begin within 72 hours, ideally within two hours. Do not delay seeking treatment because you think the risk is low — let the medical provider make that assessment. Motor vehicle accidents during work hours are workplace injuries.",
          narration: "for potential HIV exposure and must begin within 72 hours, ideally within two hours. Do not delay seeking treatment because you think the risk is low — let the medical provider make that assessment. Motor vehicle accidents during work hours are workplace injuries. If you are in a car accident while driving to or from a patient visit, or between visits, it is a workers' compensation claim. Commuting to and from the office at the start and end of your day is generally not covered unless you are performing a work task during the commute. However, if you drive from your home directly to a patient visit without going to the office first, that drive is covered. Dog bites and animal injuries are surprisingly common in home health. Report them exactly as any other workplace injury. Additionally, the animal may need to be quarantined by animal control for rabies observation.",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L1-C6",
          type: "content",
          title: "Workers' Compensation, Injury Types & Reporting Requirements (part 6)",
          body: "Provide the animal's description and location to your supervisor. Slip, trip, and fall injuries in patient homes are also your employer's responsibility under workers' compensation, even though the hazard exists in someone else's property.",
          narration: "Provide the animal's description and location to your supervisor. Slip, trip, and fall injuries in patient homes are also your employer's responsibility under workers' compensation, even though the hazard exists in someone else's property. Document the hazard that caused the fall — a wet floor, a loose rug, an uneven step — so the home environment can be addressed for your safety and the patient's. Knowledge Check 1: What form must be provided to an employee within 24 hours of a reported workplace injury? (Answer: DWC-1, the Workers' Compensation Claim Form.) Scenario Practice 1: You are transferring Mrs. Gonzales from her bed to a wheelchair. As you pivot, you feel a sharp pain in your lower back. You can still stand and move, but the pain is significant. Mrs. Gonzales is safely seated. Walk through your next steps. Expected Response: (1) Ensure Mrs. Gonzales is safe and stable in the",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L1-C7",
          type: "content",
          title: "Workers' Compensation, Injury Types & Reporting Requirements (part 7)",
          body: "wheelchair. (2) Assess your own condition — can you continue to function safely? If the pain is severe, do not attempt further patient care. (3) Call your supervisor within one hour to report the injury verbally.",
          narration: "wheelchair. (2) Assess your own condition — can you continue to function safely? If the pain is severe, do not attempt further patient care. (3) Call your supervisor within one hour to report the injury verbally. (4) Describe specifically what happened: 'Strained lower back while performing bed-to-wheelchair pivot transfer with Mrs. Gonzales at [address] at [time].' (5) Your supervisor will arrange coverage for remaining visits if needed. (6) Expect to receive the DWC-1 form within 24 hours — complete the employee section with specific details. (7) Proceed to the agency's designated occupational health provider for evaluation. (8) Do not take over-the-counter medication and 'push through' without reporting — if the injury worsens, the delay in reporting can complicate your claim. Training Module Complete — Scenario Practice Complete ---",
          estDurationSec: 55
        },
        {
          id: "GAO-018-L1-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Workers' Compensation, Injury Types & Reporting Requirements\"?",
          narration: "What is the key takeaway from \"Workers' Compensation, Injury Types & Reporting Requirements\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-018-L1-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Workers' Compensation, Injury Types & Reporting Requirements\"?",
            narration: "What is the key takeaway from \"Workers' Compensation, Injury Types & Reporting Requirements\"?",
            options: [
              {
                id: "a",
                label: "Welcome to GAO-018, Workplace Injury Reporting. As a home health professional, you face occupational hazards every day — from lifting patients to driving between visits to…",
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
            policyRef: "HR-WM-004",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Welcome to GAO-018, Workplace Injury Reporting. As a home health professional, you face occupational hazards every day — from lifting patients to driving between visits to potential exposure to infectious diseases."
          }
        }
      ]
    },
    {
      id: "GAO-018-L2",
      order: 2,
      title: "Medical Treatment, Return to Work & Employee Rights",
      objectives: [
        "Apply key requirements from Medical Treatment, Return to Work & Employee Rights",
        "Identify correct field actions related to Medical Treatment, Return to Work & Employee Rights"
      ],
      cards: [
        {
          id: "GAO-018-L2-S",
          type: "summary",
          title: "Medical Treatment, Return to Work & Employee Rights",
          body: "Once a workplace injury is reported, you have the right to medical treatment through the workers' compensation system. In California, for the first 30 days after a claim is filed, you must use a physician within the employer's Medical Provider Network, or MPN.",
          narration: "In this lesson: Medical Treatment, Return to Work & Employee Rights. Once a workplace injury is reported, you have the right to medical treatment through the workers' compensation system. In California, for the first 30 days after a claim is filed, you must use a physician within the employer's Medical Provider Network, or MPN.",
          estDurationSec: 45
        },
        {
          id: "GAO-018-L2-C1",
          type: "content",
          title: "Medical Treatment, Return to Work & Employee Rights",
          body: "Once a workplace injury is reported, you have the right to medical treatment through the workers' compensation system. In California, for the first 30 days after a claim is filed, you must use a physician within the employer's Medical Provider Network, or MPN.",
          narration: "Once a workplace injury is reported, you have the right to medical treatment through the workers' compensation system. In California, for the first 30 days after a claim is filed, you must use a physician within the employer's Medical Provider Network, or MPN. Care Indeed maintains an MPN that includes occupational health clinics, orthopedic specialists, and other providers experienced in treating workplace injuries. After 30 days, you may switch to a physician of your choice, including your personal doctor, if you pre-designated them by filing a pre-designation form with HR before the injury occurred. During treatment, your physician will assess your ability to work. There are three possible work status determinations. First, full duty — you can return to all normal activities. Second, modified duty — you can work with restrictions. Common restrictions for home health workers include: no lifting over a specified weight, no patient transfers, limited driving, or",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L2-C2",
          type: "content",
          title: "Medical Treatment, Return to Work & Employee Rights (part 2)",
          body: "desk-duty only. Third, temporary total disability — you cannot work at all and receive temporary disability payments at approximately two-thirds of your average weekly wage, up to the state maximum. Care Indeed makes every effort to accommodate modified duty.",
          narration: "desk-duty only. Third, temporary total disability — you cannot work at all and receive temporary disability payments at approximately two-thirds of your average weekly wage, up to the state maximum. Care Indeed makes every effort to accommodate modified duty. If your physician restricts lifting to 10 pounds, we may assign you to telephone triage, care coordination, documentation review, or training activities rather than field visits. Modified duty keeps you engaged, maintains your income, and supports recovery. You are expected to comply with all work restrictions — exceeding your restrictions puts you at risk of re-injury and may complicate your claim. The return-to-work process is collaborative. Your treating physician, your supervisor, HR, and the workers' compensation claims adjuster all participate. You will receive a work status report after each medical visit that specifies your restrictions. Provide this report to HR promptly. As your condition improves, restrictions are gradually lifted until you",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L2-C3",
          type: "content",
          title: "Medical Treatment, Return to Work & Employee Rights (part 3)",
          body: "return to full duty. Let us discuss your rights as an injured worker in California. First, you have the right to file a workers' compensation claim. No employer can discourage you from filing or suggest that you use your personal health insurance for a workplace injury.",
          narration: "return to full duty. Let us discuss your rights as an injured worker in California. First, you have the right to file a workers' compensation claim. No employer can discourage you from filing or suggest that you use your personal health insurance for a workplace injury. Second, you have the right to receive medical treatment. Third, you have the right to return to your job if you recover within one year. California Labor Code Section 132a prohibits discrimination against employees who file workers' compensation claims. Care Indeed will not terminate, demote, reduce hours, or retaliate against you for filing a claim. If you believe retaliation has occurred, you may file a complaint with the Workers' Compensation Appeals Board and the Department of Industrial Relations. Fourth, you have the right to disagree with medical decisions. If the MPN physician recommends a treatment plan you disagree with, or if your claim is",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L2-C4",
          type: "content",
          title: "Medical Treatment, Return to Work & Employee Rights (part 4)",
          body: "denied, you have the right to request an Independent Medical Review. If you disagree with a claims decision, you can file a petition with the Workers' Compensation Appeals Board. Fifth, you have the right to have an attorney represent you at no upfront cost.",
          narration: "denied, you have the right to request an Independent Medical Review. If you disagree with a claims decision, you can file a petition with the Workers' Compensation Appeals Board. Fifth, you have the right to have an attorney represent you at no upfront cost. Workers' compensation attorneys in California work on contingency — they are paid a percentage of your award only if you receive benefits. Now let us address prevention, because the best workplace injury is one that never happens. Care Indeed's Injury and Illness Prevention Program, or IIPP, is a Cal/OSHA requirement that identifies workplace hazards and implements controls to prevent injuries. The IIPP includes: regular workplace inspections including home environment assessments; employee training on safe work practices; hazard correction procedures; a system for employees to report hazards without fear of retaliation; and incident investigation to identify root causes. Your role in injury prevention is active, not passive.",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L2-C5",
          type: "content",
          title: "Medical Treatment, Return to Work & Employee Rights (part 5)",
          body: "If you identify a hazard — a patient's home with cluttered walkways, a broken wheelchair ramp, an aggressive pet — report it. If you feel that a patient care task is beyond your physical capability or training, speak up before attempting it.",
          narration: "If you identify a hazard — a patient's home with cluttered walkways, a broken wheelchair ramp, an aggressive pet — report it. If you feel that a patient care task is beyond your physical capability or training, speak up before attempting it. Requesting help for a two-person transfer is not weakness — it is professionalism. Common preventive measures for home health workers include: using proper body mechanics for all transfers and lifts as trained in GAO-009; wearing slip-resistant footwear in patient homes; using sharps containers for all needle disposal — never recap needles; maintaining current immunizations including hepatitis B, flu, and COVID; keeping your vehicle well-maintained to reduce accident risk; and taking breaks during long driving routes to reduce fatigue. Knowledge Check 2: For how long must an injured worker use the employer's Medical Provider Network before being allowed to switch physicians? (Answer: 30 days.) Scenario Practice 2: While documenting",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L2-C6",
          type: "content",
          title: "Medical Treatment, Return to Work & Employee Rights (part 6)",
          body: "at a patient's kitchen table after a visit, a loose kitchen tile causes you to slip and fall forward, catching yourself on the table. Your right wrist is swollen and painful. You can move your fingers but it hurts to grip. The patient is concerned and offers ice.",
          narration: "at a patient's kitchen table after a visit, a loose kitchen tile causes you to slip and fall forward, catching yourself on the table. Your right wrist is swollen and painful. You can move your fingers but it hurts to grip. The patient is concerned and offers ice. What do you do? Expected Response: (1) Accept the ice to reduce swelling — RICE protocol (Rest, Ice, Compression, Elevation). (2) Assess whether you can safely drive. If you cannot grip the steering wheel, you may need someone to drive you. (3) Call your supervisor to report the injury: 'Slipped on a loose floor tile at [patient address] at [time]. Fell forward, caught myself on the table. Right wrist is swollen and painful, limited grip strength.' (4) Your supervisor will arrange remaining visit coverage. (5) Proceed to the designated occupational health provider for evaluation — do not assume it is 'just a",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L2-C7",
          type: "content",
          title: "Medical Treatment, Return to Work & Employee Rights (part 7)",
          body: "sprain.' Wrist fractures are common from falls and require X-ray to rule out. (6) Complete the DWC-1 form within 24 hours with specific details including the loose tile. (7) The hazard (loose tile) should be documented in the patient's home safety assessment and communicated to the patient/family.",
          narration: "sprain.' Wrist fractures are common from falls and require X-ray to rule out. (6) Complete the DWC-1 form within 24 hours with specific details including the loose tile. (7) The hazard (loose tile) should be documented in the patient's home safety assessment and communicated to the patient/family. Training Module Complete — Scenario Practice Complete --- ## COMPETENCY ASSESSMENT — 10 Questions (80% Pass Score) ### Canonical Questions (Q1–Q5) Q1. Workers' compensation in California is a: - A) Fault-based insurance system where you must prove employer negligence - B) No-fault insurance system — benefits are provided regardless of who caused the injury ✓ - C) Voluntary employer benefit similar to health insurance - D) Federal program administered by Medicare Q2. Within what timeframe must you verbally notify your supervisor of a workplace injury? - A) Within one hour ✓ - B) By the end of your shift - C) Within 48",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L2-C8",
          type: "content",
          title: "Medical Treatment, Return to Work & Employee Rights (part 8)",
          body: "hours - D) When you file the DWC-1 Q3. A serious workplace injury (hospitalization, amputation, loss of consciousness) must be reported to Cal/OSHA within: - A) 24 hours - B) 8 hours ✓ - C) 72 hours - D) 30 days Q4.",
          narration: "hours - D) When you file the DWC-1 Q3. A serious workplace injury (hospitalization, amputation, loss of consciousness) must be reported to Cal/OSHA within: - A) 24 hours - B) 8 hours ✓ - C) 72 hours - D) 30 days Q4. If you sustain a needlestick injury, your first action should be: - A) Call your supervisor - B) Fill out the DWC-1 form - C) Wash the wound with soap and water immediately ✓ - D) Apply a bandage and continue working Q5. California Labor Code Section 132a protects you from: - A) Being assigned difficult patients - B) Retaliation for filing a workers' compensation claim ✓ - C) Having to use the Medical Provider Network - D) Being assigned modified duty ### Expansion Questions (Q6–Q10) Q6. You are driving between patient visits and are rear-ended at a stoplight. This is: - A) Not a workers' compensation claim",
          estDurationSec: 64
        },
        {
          id: "GAO-018-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Medical Treatment, Return to Work & Employee Rights\"?",
          narration: "What is the key takeaway from \"Medical Treatment, Return to Work & Employee Rights\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-018-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Medical Treatment, Return to Work & Employee Rights\"?",
            narration: "What is the key takeaway from \"Medical Treatment, Return to Work & Employee Rights\"?",
            options: [
              {
                id: "a",
                label: "Once a workplace injury is reported, you have the right to medical treatment through the workers' compensation system.",
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
            policyRef: "HR-WM-004",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Once a workplace injury is reported, you have the right to medical treatment through the workers' compensation system."
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-018-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Workplace Injury Reporting. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Workers' Compensation, Injury Types & Reporting Requirements\"?",
        narration: "Which statement best reflects the teaching in \"Workers' Compensation, Injury Types & Reporting Requirements\"?",
        options: [
          {
            id: "a",
            label: "Welcome to GAO-018, Workplace Injury Reporting. As a home health professional, you face occupational hazards every day…",
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
        rationale: "Derived from GAO-018 page: Workers' Compensation, Injury Types & Reporting Requirements",
        policyRef: "HR-WM-004"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Medical Treatment, Return to Work & Employee Rights\"?",
        narration: "Which statement best reflects the teaching in \"Medical Treatment, Return to Work & Employee Rights\"?",
        options: [
          {
            id: "a",
            label: "Once a workplace injury is reported, you have the right to medical treatment through the workers' compensation system.",
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
        rationale: "Derived from GAO-018 page: Medical Treatment, Return to Work & Employee Rights",
        policyRef: "HR-WM-004"
      },
      {
        id: "q3",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Workers' Compensation, Injury Types & Reporting Requirements\".",
        narration: "True or false: staff must apply the requirements taught in \"Workers' Compensation, Injury Types & Reporting Requirements\".",
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
        policyRef: "HR-WM-004"
      },
      {
        id: "q4",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Medical Treatment, Return to Work & Employee Rights\".",
        narration: "True or false: staff must apply the requirements taught in \"Medical Treatment, Return to Work & Employee Rights\".",
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
        policyRef: "HR-WM-004"
      },
      {
        id: "q5",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Workers' Compensation, Injury Types & Reporting Requirements\".",
        narration: "True or false: staff must apply the requirements taught in \"Workers' Compensation, Injury Types & Reporting Requirements\".",
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
        policyRef: "HR-WM-004"
      }
    ]
  }
},
  {
  moduleId: "GAO-019",
  policyRefs: [
    "HR-ER-004"
  ],
  cmsRefs: [],
  estimatedDurationMin: 35,
  durationSource: "DEFAULT",
  splash: {
    title: "Anti-Harassment & Non-Discrimination",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Welcome to GAO-019, Anti-Harassment and Non-Discrimination. This module covers one of the most important topics in your employment at Care Indeed — your right to a workplace free from harassment and discrimination, and your responsibility to contribute to…",
    narration: "Welcome to GAO-019, Anti-Harassment & Non-Discrimination. Welcome to GAO-019, Anti-Harassment and Non-Discrimination. This module covers one of the most important topics in your employment at Care Indeed — your right to a workplace free from harassment and discrimination, and your responsibility to contribute to…"
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
      id: "GAO-019-L1",
      order: 1,
      title: "Legal Framework & Protected Classes",
      objectives: [
        "Apply key requirements from Legal Framework & Protected Classes",
        "Identify correct field actions related to Legal Framework & Protected Classes"
      ],
      cards: [
        {
          id: "GAO-019-L1-S",
          type: "summary",
          title: "Legal Framework & Protected Classes",
          body: "Welcome to GAO-019, Anti-Harassment and Non-Discrimination. This module covers one of the most important topics in your employment at Care Indeed — your right to a workplace free from harassment and discrimination, and your responsibility to contribute to that environment for everyone.",
          narration: "In this lesson: Legal Framework & Protected Classes. Welcome to GAO-019, Anti-Harassment and Non-Discrimination. This module covers one of the most important topics in your employment at Care Indeed — your right to a workplace free from harassment and discrimination, and your responsibility to contribute to that environment for everyone.",
          estDurationSec: 45
        },
        {
          id: "GAO-019-L1-C1",
          type: "content",
          title: "Legal Framework & Protected Classes",
          body: "Welcome to GAO-019, Anti-Harassment and Non-Discrimination. This module covers one of the most important topics in your employment at Care Indeed — your right to a workplace free from harassment and discrimination, and your responsibility to contribute to that environment for everyone.",
          narration: "Welcome to GAO-019, Anti-Harassment and Non-Discrimination. This module covers one of the most important topics in your employment at Care Indeed — your right to a workplace free from harassment and discrimination, and your responsibility to contribute to that environment for everyone. The legal framework for anti-harassment and non-discrimination protections comes from multiple federal and state laws. At the federal level, Title VII of the Civil Rights Act of 1964 prohibits employment discrimination based on race, color, religion, sex, and national origin. The Americans with Disabilities Act, or ADA, prohibits discrimination against individuals with disabilities. The Age Discrimination in Employment Act, or ADEA, protects individuals 40 and older. The Genetic Information Nondiscrimination Act, or GINA, prohibits discrimination based on genetic information. California provides even broader protections under the Fair Employment and Housing Act, or FEHA. FEHA protects all of the federal categories plus several additional ones: sexual orientation, gender identity,",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L1-C2",
          type: "content",
          title: "Legal Framework & Protected Classes (part 2)",
          body: "gender expression, marital status, military and veteran status, medical condition including cancer and genetic characteristics, ancestry, and reproductive health decision-making. California's protections are among the strongest in the nation.",
          narration: "gender expression, marital status, military and veteran status, medical condition including cancer and genetic characteristics, ancestry, and reproductive health decision-making. California's protections are among the strongest in the nation. What does this mean practically? It means that at Care Indeed, no employment decision — hiring, firing, promotion, demotion, job assignment, pay, benefits, training, or any term or condition of employment — may be based on any protected characteristic. It also means that no one may be subjected to harassment based on any protected characteristic. Let us define harassment clearly. Harassment is unwelcome conduct based on a protected characteristic that is either severe or pervasive enough to create a hostile work environment, or that results in a tangible employment action like termination or demotion. There are two legal categories. Quid pro quo harassment, which translates to 'this for that,' occurs when a person in authority conditions an employment benefit on submission",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L1-C3",
          type: "content",
          title: "Legal Framework & Protected Classes (part 3)",
          body: "to unwelcome conduct. The classic example is a supervisor who says, 'If you go out with me, I will give you the better assignments.' But quid pro quo can involve any protected characteristic, not just sex. 'If you attend my church, I will recommend you for promotion' is religious quid pro quo harassment.",
          narration: "to unwelcome conduct. The classic example is a supervisor who says, 'If you go out with me, I will give you the better assignments.' But quid pro quo can involve any protected characteristic, not just sex. 'If you attend my church, I will recommend you for promotion' is religious quid pro quo harassment. Hostile work environment harassment occurs when unwelcome conduct based on a protected characteristic is severe or pervasive enough to alter the conditions of employment and create an abusive working environment. A single severe incident — such as a racial slur combined with a physical threat — can create a hostile environment. More commonly, it results from a pattern of conduct over time: repeated inappropriate jokes, unwelcome comments about someone's appearance or religion, display of offensive images, or exclusion from work activities based on a protected characteristic. The key word is 'unwelcome.' The question is not whether the",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L1-C4",
          type: "content",
          title: "Legal Framework & Protected Classes (part 4)",
          body: "person engaging in the conduct intended it as harassment. The question is whether the recipient experienced it as unwelcome and whether a reasonable person in the same situation would find it hostile or abusive. In home health, harassment and discrimination can come from multiple sources.",
          narration: "person engaging in the conduct intended it as harassment. The question is whether the recipient experienced it as unwelcome and whether a reasonable person in the same situation would find it hostile or abusive. In home health, harassment and discrimination can come from multiple sources. It can come from coworkers, supervisors, agency leadership, patients, or patients' family members. Yes — patients and their families can engage in harassment and discrimination against you. If a patient refuses care from you because of your race, national origin, or gender, that is discrimination. If a patient's family member makes sexual comments to you during visits, that is harassment. Care Indeed is obligated to address these situations, and you are entitled to report them. Care Indeed's Anti-Harassment and Non-Discrimination Policy is referenced as Policy Reference: HR-ER-004. This policy prohibits all forms of harassment and discrimination in the workplace and in any work-related setting, including",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L1-C5",
          type: "content",
          title: "Legal Framework & Protected Classes (part 5)",
          body: "patient homes, agency vehicles, work-related social events, and electronic communications. Knowledge Check 1: Name three protected characteristics under California's FEHA that go beyond federal protections.",
          narration: "patient homes, agency vehicles, work-related social events, and electronic communications. Knowledge Check 1: Name three protected characteristics under California's FEHA that go beyond federal protections. (Answer: Any three of: sexual orientation, gender identity, gender expression, marital status, military/veteran status, medical condition, ancestry, reproductive health decision-making.) ---",
          estDurationSec: 35
        },
        {
          id: "GAO-019-L1-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Legal Framework & Protected Classes\"?",
          narration: "What is the key takeaway from \"Legal Framework & Protected Classes\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-019-L1-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Legal Framework & Protected Classes\"?",
            narration: "What is the key takeaway from \"Legal Framework & Protected Classes\"?",
            options: [
              {
                id: "a",
                label: "Welcome to GAO-019, Anti-Harassment and Non-Discrimination. This module covers one of the most important topics in your employment at Care Indeed — your right to a workplace free…",
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
            policyRef: "HR-ER-004",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Welcome to GAO-019, Anti-Harassment and Non-Discrimination. This module covers one of the most important topics in your employment at Care Indeed — your right to a workplace free from harassment and discrimination, and…"
          }
        }
      ]
    },
    {
      id: "GAO-019-L2",
      order: 2,
      title: "Recognizing Harassment, Reporting & Investigation",
      objectives: [
        "Apply key requirements from Recognizing Harassment, Reporting & Investigation",
        "Identify correct field actions related to Recognizing Harassment, Reporting & Investigation"
      ],
      cards: [
        {
          id: "GAO-019-L2-S",
          type: "summary",
          title: "Recognizing Harassment, Reporting & Investigation",
          body: "Let us look at specific examples of harassment and discrimination that may occur in home health settings so you can recognize them.",
          narration: "In this lesson: Recognizing Harassment, Reporting & Investigation. Let us look at specific examples of harassment and discrimination that may occur in home health settings so you can recognize them.",
          estDurationSec: 45
        },
        {
          id: "GAO-019-L2-C1",
          type: "content",
          title: "Recognizing Harassment, Reporting & Investigation",
          body: "Let us look at specific examples of harassment and discrimination that may occur in home health settings so you can recognize them.",
          narration: "Let us look at specific examples of harassment and discrimination that may occur in home health settings so you can recognize them. Sexual harassment includes: unwelcome sexual advances or propositions; unwanted touching, patting, or physical contact; comments about someone's body, appearance, or clothing in a sexual manner; sharing sexually explicit images, jokes, or messages; staring or leering; persistent requests for dates after being told no; and sexual gestures or sounds. Sexual harassment can occur between any combination of genders — it is not limited to male-on-female conduct. Non-sexual harassment based on other protected characteristics includes: racial slurs, jokes, or stereotypes; mocking someone's accent, language, or cultural practices; derogatory comments about someone's religion, religious clothing, or religious practices; age-related comments such as 'You are too old to learn new technology' or 'When are you going to retire?'; disability-related harassment including mocking a colleague's accommodation or imitating a disability; and anti-LGBTQ+ slurs",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L2-C2",
          type: "content",
          title: "Recognizing Harassment, Reporting & Investigation (part 2)",
          body: "or comments. Discrimination is different from harassment but equally prohibited. Discrimination is an adverse employment action based on a protected characteristic.",
          narration: "or comments. Discrimination is different from harassment but equally prohibited. Discrimination is an adverse employment action based on a protected characteristic. Examples include: not hiring someone because of their accent; assigning only male clinicians to certain patients based on stereotypes; denying a promotion because of age; refusing a reasonable accommodation for a disability; and scheduling a religious employee for shifts that conflict with their observance without attempting accommodation. In the home health context, a common situation involves patients who express discriminatory preferences. A patient who says, 'I do not want a Black nurse' or 'I only want a female caregiver' is expressing discrimination. Care Indeed's response is to inform the patient that we do not make staffing assignments based on race, ethnicity, or gender, and that our clinicians are assigned based on qualifications, availability, and clinical needs. You are never required to accommodate a discriminatory patient preference, and you should",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L2-C3",
          type: "content",
          title: "Recognizing Harassment, Reporting & Investigation (part 3)",
          body: "never be reassigned to appease one. Now let us discuss reporting. Care Indeed provides multiple reporting channels to ensure you can report harassment or discrimination in a way that feels safe. You may report to your direct supervisor, unless they are the person engaging in the conduct.",
          narration: "never be reassigned to appease one. Now let us discuss reporting. Care Indeed provides multiple reporting channels to ensure you can report harassment or discrimination in a way that feels safe. You may report to your direct supervisor, unless they are the person engaging in the conduct. You may report to any manager or supervisor in the agency — you are not limited to your own chain of command. You may report to Human Resources. You may report through the compliance hotline, which allows anonymous reporting. And you may file an external complaint with the California Civil Rights Department, formerly DFEH, or the federal Equal Employment Opportunity Commission, or EEOC. When you make a report, be as specific as possible. Include: who was involved, what was said or done, when and where it happened, who witnessed it, and how it affected you. Written documentation is stronger than verbal reports, but",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L2-C4",
          type: "content",
          title: "Recognizing Harassment, Reporting & Investigation (part 4)",
          body: "either is accepted and will be investigated. Care Indeed's investigation process follows these steps. First, the report is received and a determination is made about whether interim protective measures are needed — such as separating the complainant and respondent, reassigning visits, or placing someone on…",
          narration: "either is accepted and will be investigated. Care Indeed's investigation process follows these steps. First, the report is received and a determination is made about whether interim protective measures are needed — such as separating the complainant and respondent, reassigning visits, or placing someone on administrative leave. Second, a trained investigator interviews the complainant, the respondent, and any witnesses. Third, the investigator reviews any evidence including emails, text messages, EHR documentation, and physical evidence. Fourth, the investigator makes findings and recommends corrective action. Fifth, appropriate action is taken, which may range from counseling to termination depending on the severity and circumstances. Sixth, the complainant is informed of the outcome, though specific disciplinary details about another employee may be confidential. The entire investigation is confidential to the extent possible. Information is shared only with those who need to know to conduct the investigation and implement corrective action. Scenario Practice 1: You",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L2-C5",
          type: "content",
          title: "Recognizing Harassment, Reporting & Investigation (part 5)",
          body: "are a physical therapist providing care to Mr. Williams. During your last three visits, Mr. Williams has made comments about your appearance, asked you to 'wear something prettier next time,' and today placed his hand on your lower back as you were setting up equipment. You are uncomfortable.",
          narration: "are a physical therapist providing care to Mr. Williams. During your last three visits, Mr. Williams has made comments about your appearance, asked you to 'wear something prettier next time,' and today placed his hand on your lower back as you were setting up equipment. You are uncomfortable. What do you do? Expected Response: (1) Address the immediate behavior: 'Mr. Williams, that kind of touch is not appropriate. Please keep your hands to yourself during our sessions.' (2) Establish a professional boundary clearly and calmly. (3) Complete the visit if you feel safe; leave if you do not. (4) Document all three incidents with dates, exact quotes, and the physical contact in the EHR. (5) Report to your supervisor or HR using whichever channel you are most comfortable with. (6) The agency will investigate and may take actions including: a behavioral contract with Mr. Williams, requiring a chaperone during visits,",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L2-C6",
          type: "content",
          title: "Recognizing Harassment, Reporting & Investigation (part 6)",
          body: "reassigning the patient to a different therapist, or discharging the patient if the behavior continues after warning. (7) You are protected from retaliation for reporting. Training Module Complete — Scenario Practice Complete ---",
          narration: "reassigning the patient to a different therapist, or discharging the patient if the behavior continues after warning. (7) You are protected from retaliation for reporting. Training Module Complete — Scenario Practice Complete ---",
          estDurationSec: 35
        },
        {
          id: "GAO-019-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Recognizing Harassment, Reporting & Investigation\"?",
          narration: "What is the key takeaway from \"Recognizing Harassment, Reporting & Investigation\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-019-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Recognizing Harassment, Reporting & Investigation\"?",
            narration: "What is the key takeaway from \"Recognizing Harassment, Reporting & Investigation\"?",
            options: [
              {
                id: "a",
                label: "Let us look at specific examples of harassment and discrimination that may occur in home health settings so you can recognize them.",
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
            policyRef: "HR-ER-004",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Let us look at specific examples of harassment and discrimination that may occur in home health settings so you can recognize them."
          }
        }
      ]
    },
    {
      id: "GAO-019-L3",
      order: 3,
      title: "Retaliation Protections, Bystander Responsibility & California Requirements",
      objectives: [
        "Apply key requirements from Retaliation Protections, Bystander Responsibility & California Requirements",
        "Identify correct field actions related to Retaliation Protections, Bystander Responsibility & California Requirements"
      ],
      cards: [
        {
          id: "GAO-019-L3-S",
          type: "summary",
          title: "Retaliation Protections, Bystander Responsibility & California Requirements",
          body: "Retaliation is perhaps the greatest fear of employees who consider reporting harassment or discrimination. Retaliation is any adverse action taken against someone because they reported, participated in an investigation of, or opposed harassment or discrimination.",
          narration: "In this lesson: Retaliation Protections, Bystander Responsibility & California Requirements. Retaliation is perhaps the greatest fear of employees who consider reporting harassment or discrimination. Retaliation is any adverse action taken against someone because they reported, participated in an investigation of, or opposed harassment or discrimination.",
          estDurationSec: 45
        },
        {
          id: "GAO-019-L3-C1",
          type: "content",
          title: "Retaliation Protections, Bystander Responsibility & California Requirements",
          body: "Retaliation is perhaps the greatest fear of employees who consider reporting harassment or discrimination. Retaliation is any adverse action taken against someone because they reported, participated in an investigation of, or opposed harassment or discrimination.",
          narration: "Retaliation is perhaps the greatest fear of employees who consider reporting harassment or discrimination. Retaliation is any adverse action taken against someone because they reported, participated in an investigation of, or opposed harassment or discrimination. Retaliation is illegal under both federal and California law, and it is independently actionable — meaning you can win a retaliation claim even if the underlying harassment claim is not substantiated. Examples of retaliation include: termination, demotion, or reduction in hours after filing a complaint; being excluded from meetings, projects, or advancement opportunities; receiving negative performance reviews that do not reflect your actual performance; being subjected to increased scrutiny or micromanagement; being transferred to a less desirable position or location; and social ostracism or hostile treatment by coworkers who learn about your complaint. Care Indeed takes retaliation as seriously as the underlying harassment. If you experience retaliation after making a report, report the retaliation immediately",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L3-C2",
          type: "content",
          title: "Retaliation Protections, Bystander Responsibility & California Requirements (part 2)",
          body: "through the same channels. A manager who retaliates against an employee for a harassment report faces discipline up to and including termination. Let us discuss bystander responsibility. You do not have to be the target of harassment to take action.",
          narration: "through the same channels. A manager who retaliates against an employee for a harassment report faces discipline up to and including termination. Let us discuss bystander responsibility. You do not have to be the target of harassment to take action. If you witness harassment of a colleague, a patient, or anyone in the work environment, you have a responsibility to act. Bystander intervention can take several forms. Direct intervention means addressing the behavior in the moment. For example: 'That comment is not appropriate. Let us stay professional.' This works best when you feel safe and the situation is not volatile. Distraction means redirecting the situation. For example, interrupting a conversation where inappropriate comments are being made by asking a work-related question or changing the subject. Delegation means reporting the behavior to someone in authority — a supervisor, HR, or the compliance hotline — especially when you do not feel safe",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L3-C3",
          type: "content",
          title: "Retaliation Protections, Bystander Responsibility & California Requirements (part 3)",
          body: "intervening directly. Documentation means recording what you witnessed — date, time, location, exact words, people present — so the information is available if the target decides to file a report. Supervisors have heightened obligations under California law.",
          narration: "intervening directly. Documentation means recording what you witnessed — date, time, location, exact words, people present — so the information is available if the target decides to file a report. Supervisors have heightened obligations under California law. California Senate Bill 1343 requires all employers with five or more employees to provide sexual harassment prevention training to all employees every two years — one hour for non-supervisory employees and two hours for supervisors. This training must be interactive and cover topics including harassment prevention, abusive conduct, and bystander intervention. Your completion of this module contributes to but does not fully satisfy this requirement. Care Indeed will assign the full SB 1343 compliant training separately. Supervisors who receive a complaint of harassment or who witness harassment are legally obligated to report it to HR, even if the complainant asks them not to. A supervisor who fails to report known harassment exposes both",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L3-C4",
          type: "content",
          title: "Retaliation Protections, Bystander Responsibility & California Requirements (part 4)",
          body: "themselves and the agency to liability. If you are a supervisor, do not attempt to investigate or resolve complaints yourself — report to HR and allow the trained investigator to handle it. Let us address one final important topic: the intersection of harassment and cultural sensitivity in home health.",
          narration: "themselves and the agency to liability. If you are a supervisor, do not attempt to investigate or resolve complaints yourself — report to HR and allow the trained investigator to handle it. Let us address one final important topic: the intersection of harassment and cultural sensitivity in home health. Working with diverse patient populations means you will encounter cultural practices, communication styles, and expectations that differ from your own. Cultural differences are not harassment. A patient who speaks loudly because of a hearing impairment is not engaging in intimidation. A patient who avoids eye contact due to cultural norms is not being evasive. A patient who requests a same-gender caregiver for religious bathing practices is making a reasonable accommodation request, not engaging in gender discrimination. However, cultural background is not an excuse for harassment. A patient or family member who uses racial slurs, makes sexual advances, or engages in threatening",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L3-C5",
          type: "content",
          title: "Retaliation Protections, Bystander Responsibility & California Requirements (part 5)",
          body: "behavior is committing harassment regardless of their cultural background. The standard is objective: would a reasonable person find the conduct unwelcome and hostile? Policy Reference: HR-ER-004 — Anti-Harassment and Non-Discrimination Policy.",
          narration: "behavior is committing harassment regardless of their cultural background. The standard is objective: would a reasonable person find the conduct unwelcome and hostile? Policy Reference: HR-ER-004 — Anti-Harassment and Non-Discrimination Policy. This policy contains the full text of Care Indeed's commitments and procedures. You are encouraged to read the full policy as a separate P&P activity. Note: completing this training module does not constitute acknowledgment of the formal policy. Policy acknowledgment is a separate assigned activity. Knowledge Check 2: If you witness a colleague being harassed, what are the four forms of bystander intervention? (Answer: Direct intervention, distraction, delegation, documentation.) Scenario Practice 2: You overhear a colleague in the office say to another colleague: 'I cannot believe they hired another one of those people. Pretty soon this place will look like a UN meeting.' The targeted colleague looks uncomfortable but says nothing. What do you do? Expected Response: (1) Recognize",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L3-C6",
          type: "content",
          title: "Retaliation Protections, Bystander Responsibility & California Requirements (part 6)",
          body: "this as potential national origin or race-based harassment. (2) Consider direct intervention if you feel comfortable: 'That kind of comment is not okay. Our team's diversity is a strength.' (3) If you are not comfortable confronting directly, use delegation — report the comment to a supervisor or HR.",
          narration: "this as potential national origin or race-based harassment. (2) Consider direct intervention if you feel comfortable: 'That kind of comment is not okay. Our team's diversity is a strength.' (3) If you are not comfortable confronting directly, use delegation — report the comment to a supervisor or HR. (4) Check in privately with the targeted colleague: 'Are you okay? I heard what was said. If you want to report it, I will support you. If you want, I can report what I witnessed.' (5) Document what you heard: date, time, exact words, who was present. (6) Whether or not the targeted colleague chooses to report, you can and should report what you witnessed. A single comment may seem minor, but it may be part of a pattern. Training Module Complete — Scenario Practice Complete --- ## COMPETENCY ASSESSMENT — 10 Questions (80% Pass Score) ### Canonical Questions (Q1–Q5) Q1. Quid",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L3-C7",
          type: "content",
          title: "Retaliation Protections, Bystander Responsibility & California Requirements (part 7)",
          body: "pro quo harassment involves: - A) A hostile work environment created by offensive jokes - B) Conditioning an employment benefit on submission to unwelcome conduct ✓ - C) Being treated differently because of age - D) A single offensive comment by a coworker Q2.",
          narration: "pro quo harassment involves: - A) A hostile work environment created by offensive jokes - B) Conditioning an employment benefit on submission to unwelcome conduct ✓ - C) Being treated differently because of age - D) A single offensive comment by a coworker Q2. Under California's FEHA, which of the following is a protected characteristic NOT covered by federal law? - A) Race - B) Religion - C) Gender identity ✓ - D) National origin Q3. A patient tells you, 'I do not want a male nurse.' Care Indeed's appropriate response is to: - A) Immediately reassign a female nurse - B) Inform the patient that staffing is based on qualifications, not gender ✓ - C) Discharge the patient for discrimination - D) Document the request and honor it quietly Q4. Retaliation after reporting harassment is: - A) An unfortunate but legal response - B) Illegal under both federal and",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L3-C8",
          type: "content",
          title: "Retaliation Protections, Bystander Responsibility & California Requirements (part 8)",
          body: "California law ✓ - C) Only illegal if the original harassment claim is proven - D) Only illegal if the employer directly fires the complainant Q5.",
          narration: "California law ✓ - C) Only illegal if the original harassment claim is proven - D) Only illegal if the employer directly fires the complainant Q5. A supervisor who receives a harassment complaint should: - A) Investigate and resolve it themselves - B) Tell the complainant to handle it directly with the respondent - C) Report it to HR and allow the trained investigator to handle it ✓ - D) Wait to see if the behavior continues before acting ### Expansion Questions (Q6–Q10) Q6. California SB 1343 requires sexual harassment prevention training: - A) Only for supervisors, annually - B) For all employees in companies with 5+ employees, every two years ✓ - C) Only for new hires during orientation - D) Only when a complaint is filed Q7. Which of the following is an example of hostile work environment harassment? - A) A supervisor giving you a difficult assignment",
          estDurationSec: 64
        },
        {
          id: "GAO-019-L3-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Retaliation Protections, Bystander Responsibility & California Requirements\"?",
          narration: "What is the key takeaway from \"Retaliation Protections, Bystander Responsibility & California Requirements\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-019-L3-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Retaliation Protections, Bystander Responsibility & California Requirements\"?",
            narration: "What is the key takeaway from \"Retaliation Protections, Bystander Responsibility & California Requirements\"?",
            options: [
              {
                id: "a",
                label: "Retaliation is perhaps the greatest fear of employees who consider reporting harassment or discrimination.",
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
            policyRef: "HR-ER-004",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Retaliation is perhaps the greatest fear of employees who consider reporting harassment or discrimination."
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-019-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Anti-Harassment & Non-Discrimination. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Legal Framework & Protected Classes\"?",
        narration: "Which statement best reflects the teaching in \"Legal Framework & Protected Classes\"?",
        options: [
          {
            id: "a",
            label: "Welcome to GAO-019, Anti-Harassment and Non-Discrimination.",
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
        rationale: "Derived from GAO-019 page: Legal Framework & Protected Classes",
        policyRef: "HR-ER-004"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Recognizing Harassment, Reporting & Investigation\"?",
        narration: "Which statement best reflects the teaching in \"Recognizing Harassment, Reporting & Investigation\"?",
        options: [
          {
            id: "a",
            label: "Let us look at specific examples of harassment and discrimination that may occur in home health settings so you can…",
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
        rationale: "Derived from GAO-019 page: Recognizing Harassment, Reporting & Investigation",
        policyRef: "HR-ER-004"
      },
      {
        id: "q3",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Retaliation Protections, Bystander Responsibility & California Requirements\"?",
        narration: "Which statement best reflects the teaching in \"Retaliation Protections, Bystander Responsibility & California Requirements\"?",
        options: [
          {
            id: "a",
            label: "Retaliation is perhaps the greatest fear of employees who consider reporting harassment or discrimination.",
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
        rationale: "Derived from GAO-019 page: Retaliation Protections, Bystander Responsibility & California Requirements",
        policyRef: "HR-ER-004"
      },
      {
        id: "q4",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Legal Framework & Protected Classes\".",
        narration: "True or false: staff must apply the requirements taught in \"Legal Framework & Protected Classes\".",
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
        policyRef: "HR-ER-004"
      },
      {
        id: "q5",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Recognizing Harassment, Reporting & Investigation\".",
        narration: "True or false: staff must apply the requirements taught in \"Recognizing Harassment, Reporting & Investigation\".",
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
        policyRef: "HR-ER-004"
      }
    ]
  }
},
  {
  moduleId: "GAO-020",
  policyRefs: [
    "HR-ER-005"
  ],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "Substance Abuse / Drug-Free Workplace",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Welcome to GAO-020, Substance Abuse and Drug-Free Workplace. As a healthcare professional providing direct patient care, you hold a position of extraordinary trust.",
    narration: "Welcome to GAO-020, Substance Abuse / Drug-Free Workplace. Welcome to GAO-020, Substance Abuse and Drug-Free Workplace. As a healthcare professional providing direct patient care, you hold a position of extraordinary trust."
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
      id: "GAO-020-L1",
      order: 1,
      title: "Drug-Free Workplace Requirements & Prohibited Conduct",
      objectives: [
        "Apply key requirements from Drug-Free Workplace Requirements & Prohibited Conduct",
        "Identify correct field actions related to Drug-Free Workplace Requirements & Prohibited Conduct"
      ],
      cards: [
        {
          id: "GAO-020-L1-S",
          type: "summary",
          title: "Drug-Free Workplace Requirements & Prohibited Conduct",
          body: "Welcome to GAO-020, Substance Abuse and Drug-Free Workplace. As a healthcare professional providing direct patient care, you hold a position of extraordinary trust.",
          narration: "In this lesson: Drug-Free Workplace Requirements & Prohibited Conduct. Welcome to GAO-020, Substance Abuse and Drug-Free Workplace. As a healthcare professional providing direct patient care, you hold a position of extraordinary trust. Patients are vulnerable — they depend on you to be alert, competent, and capable of making critical clinical decisions during every visit. Any impairment from drugs or alcohol directly threatens patient safety.",
          estDurationSec: 45
        },
        {
          id: "GAO-020-L1-C1",
          type: "content",
          title: "Drug-Free Workplace Requirements & Prohibited Conduct",
          body: "Welcome to GAO-020, Substance Abuse and Drug-Free Workplace. As a healthcare professional providing direct patient care, you hold a position of extraordinary trust. Patients are vulnerable — they depend on you to be alert, competent, and capable of making critical clinical decisions during every visit.",
          narration: "Welcome to GAO-020, Substance Abuse and Drug-Free Workplace. As a healthcare professional providing direct patient care, you hold a position of extraordinary trust. Patients are vulnerable — they depend on you to be alert, competent, and capable of making critical clinical decisions during every visit. Any impairment from drugs or alcohol directly threatens patient safety. This module covers Care Indeed's drug-free workplace policy, your obligations, the testing protocols, the consequences of violations, and the support available if you or a colleague is struggling with substance use. The legal foundation for drug-free workplace policies comes from the Drug-Free Workplace Act of 1988, which requires all federal contractors and grantees to maintain drug-free workplaces. As a Medicare-certified home health agency receiving federal funds, Care Indeed is subject to this requirement. Additionally, California has its own framework for employer drug testing and substance abuse policies under the California Constitution's right to privacy, balanced",
          estDurationSec: 64
        },
        {
          id: "GAO-020-L1-C2",
          type: "content",
          title: "Drug-Free Workplace Requirements & Prohibited Conduct (part 2)",
          body: "against employer safety interests. Care Indeed's Drug-Free Workplace Policy — referenced as Policy Reference: HR-ER-005 — prohibits the following: reporting to work or performing work duties while under the influence of alcohol, illegal drugs, or any substance that impairs your ability to safely perform your job;…",
          narration: "against employer safety interests. Care Indeed's Drug-Free Workplace Policy — referenced as Policy Reference: HR-ER-005 — prohibits the following: reporting to work or performing work duties while under the influence of alcohol, illegal drugs, or any substance that impairs your ability to safely perform your job; using, possessing, distributing, selling, or manufacturing illegal drugs on company time, on company premises, in company vehicles, or in patient homes; using prescription medications in a manner inconsistent with the prescription that causes impairment during work; and refusing to submit to drug or alcohol testing when required under policy. Let us discuss prescription medications specifically, because this is an area of frequent confusion. You are not prohibited from using legally prescribed medications. Many healthcare workers take prescription medications for anxiety, pain, sleep disorders, ADHD, or other conditions. However, if your prescribed medication has side effects that could impair your clinical judgment, reaction time, or",
          estDurationSec: 64
        },
        {
          id: "GAO-020-L1-C3",
          type: "content",
          title: "Drug-Free Workplace Requirements & Prohibited Conduct (part 3)",
          body: "motor skills, you have an obligation to disclose this to HR — not the details of your medical condition, but the fact that your medication may affect your ability to perform certain job functions. HR will work with you and your physician to determine if accommodations or temporary modifications are needed.",
          narration: "motor skills, you have an obligation to disclose this to HR — not the details of your medical condition, but the fact that your medication may affect your ability to perform certain job functions. HR will work with you and your physician to determine if accommodations or temporary modifications are needed. Taking prescribed opioids for a dental procedure and then performing patient transfers is not acceptable. The medication is legal, but the impairment is real. Cannabis requires special discussion in California. While recreational cannabis is legal in California for adults 21 and over, and medical cannabis is legal with a physician's recommendation, employers in safety-sensitive industries retain the right to prohibit cannabis use that affects workplace performance. Care Indeed classifies all patient-facing positions as safety-sensitive. You may not report to work impaired by cannabis, regardless of whether your use is recreational or medical. Current cannabis testing technology cannot distinguish between",
          estDurationSec: 64
        },
        {
          id: "GAO-020-L1-C4",
          type: "content",
          title: "Drug-Free Workplace Requirements & Prohibited Conduct (part 4)",
          body: "recent impairment and past use — THC remains detectable in urine for days or weeks after use. This means a positive drug test for THC may result in further evaluation even if you used cannabis days ago on your own time. The agency evaluates each situation individually, considering the totality of circumstances.",
          narration: "recent impairment and past use — THC remains detectable in urine for days or weeks after use. This means a positive drug test for THC may result in further evaluation even if you used cannabis days ago on your own time. The agency evaluates each situation individually, considering the totality of circumstances. Care Indeed conducts drug and alcohol testing in the following circumstances. Pre-employment testing is required for all new hires before starting patient care duties. A positive pre-employment test will result in withdrawal of the employment offer. Reasonable suspicion testing occurs when a supervisor observes specific, articulable signs of impairment — we will discuss these in detail. Post-accident testing occurs after a workplace accident resulting in injury or significant property damage, to determine if impairment was a contributing factor. Random testing may be conducted for employees in safety-sensitive positions, with selection done by a computer-generated random process that gives",
          estDurationSec: 64
        },
        {
          id: "GAO-020-L1-C5",
          type: "content",
          title: "Drug-Free Workplace Requirements & Prohibited Conduct (part 5)",
          body: "every eligible employee an equal chance of selection. Return-to-duty and follow-up testing occurs for employees who have completed a substance abuse treatment program and are returning to work.",
          narration: "every eligible employee an equal chance of selection. Return-to-duty and follow-up testing occurs for employees who have completed a substance abuse treatment program and are returning to work. What are the observable signs that trigger reasonable suspicion? A supervisor may initiate testing based on: slurred speech; unsteady gait or impaired coordination; the smell of alcohol or marijuana; bloodshot or glassy eyes; unexplained mood swings or erratic behavior; drowsiness or falling asleep during work; unusually slow or rapid speech; confusion or inability to concentrate; and physical signs such as tremors, sweating, or dilated pupils. Two supervisory observations are preferred but not required. The supervisor documents the observations before directing you to testing. If you are directed to testing, cooperate. Refusal to test is treated as a positive result. The testing process uses chain-of-custody protocols at a certified laboratory. A Medical Review Officer, or MRO, reviews positive results and contacts you to",
          estDurationSec: 64
        },
        {
          id: "GAO-020-L1-C6",
          type: "content",
          title: "Drug-Free Workplace Requirements & Prohibited Conduct (part 6)",
          body: "determine if there is a legitimate medical explanation, such as a valid prescription, before reporting the result to the employer.",
          narration: "determine if there is a legitimate medical explanation, such as a valid prescription, before reporting the result to the employer. Knowledge Check 1: What are the five circumstances under which Care Indeed may conduct drug or alcohol testing? (Answer: Pre-employment, reasonable suspicion, post-accident, random, and return-to-duty/follow-up.) ---",
          estDurationSec: 35
        },
        {
          id: "GAO-020-L1-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Drug-Free Workplace Requirements & Prohibited Conduct\"?",
          narration: "What is the key takeaway from \"Drug-Free Workplace Requirements & Prohibited Conduct\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-020-L1-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Drug-Free Workplace Requirements & Prohibited Conduct\"?",
            narration: "What is the key takeaway from \"Drug-Free Workplace Requirements & Prohibited Conduct\"?",
            options: [
              {
                id: "a",
                label: "Welcome to GAO-020, Substance Abuse and Drug-Free Workplace. As a healthcare professional providing direct patient care, you hold a position of extraordinary trust.",
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
            policyRef: "HR-ER-005",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Welcome to GAO-020, Substance Abuse and Drug-Free Workplace. As a healthcare professional providing direct patient care, you hold a position of extraordinary trust."
          }
        }
      ]
    },
    {
      id: "GAO-020-L2",
      order: 2,
      title: "EAP Support, Consequences & Colleague Concerns",
      objectives: [
        "Apply key requirements from EAP Support, Consequences & Colleague Concerns",
        "Identify correct field actions related to EAP Support, Consequences & Colleague Concerns"
      ],
      cards: [
        {
          id: "GAO-020-L2-S",
          type: "summary",
          title: "EAP Support, Consequences & Colleague Concerns",
          body: "Care Indeed recognizes that substance use disorders are medical conditions, not moral failures. Addiction is classified as a chronic, relapsable brain disorder by the American Medical Association, the American Society of Addiction Medicine, and the World Health Organization.",
          narration: "In this lesson: EAP Support, Consequences & Colleague Concerns. Care Indeed recognizes that substance use disorders are medical conditions, not moral failures. Addiction is classified as a chronic, relapsable brain disorder by the American Medical Association, the American Society of Addiction Medicine, and the World Health Organization. We approach substance abuse with a balance of accountability and support.",
          estDurationSec: 45
        },
        {
          id: "GAO-020-L2-C1",
          type: "content",
          title: "EAP Support, Consequences & Colleague Concerns",
          body: "Care Indeed recognizes that substance use disorders are medical conditions, not moral failures. Addiction is classified as a chronic, relapsable brain disorder by the American Medical Association, the American Society of Addiction Medicine, and the World Health Organization.",
          narration: "Care Indeed recognizes that substance use disorders are medical conditions, not moral failures. Addiction is classified as a chronic, relapsable brain disorder by the American Medical Association, the American Society of Addiction Medicine, and the World Health Organization. We approach substance abuse with a balance of accountability and support. The Employee Assistance Program, or EAP, is available to every Care Indeed employee at no cost. EAP provides confidential assessment, short-term counseling, and referrals for substance abuse treatment. If you are struggling with alcohol, drugs, or prescription medication misuse, you are strongly encouraged to seek help through EAP before a workplace incident occurs. Voluntary self-referral is treated differently from a positive drug test or an impairment incident. If you come forward voluntarily to request help for a substance use issue before any workplace incident, policy violation, or testing event, Care Indeed will work with you to access treatment while protecting your",
          estDurationSec: 64
        },
        {
          id: "GAO-020-L2-C2",
          type: "content",
          title: "EAP Support, Consequences & Colleague Concerns (part 2)",
          body: "employment to the extent possible. This may include medical leave under FMLA or CFRA, modified duties during recovery, and a structured return-to-work plan.",
          narration: "employment to the extent possible. This may include medical leave under FMLA or CFRA, modified duties during recovery, and a structured return-to-work plan. Voluntary self-referral is not a get-out-of-consequences-free card for past violations, but it demonstrates personal responsibility and allows intervention before patient safety is compromised. Conversely, if a substance abuse issue is discovered through a positive drug test, an impairment incident, or a policy violation, the consequences are serious. A first offense typically includes immediate removal from patient care, mandatory substance abuse evaluation by an SAP (Substance Abuse Professional), completion of any recommended treatment program, return-to-duty testing with a negative result, and follow-up testing for a minimum of one year. A second offense typically results in termination. Any incident involving patient harm or the diversion of patient medications results in immediate termination and may be reported to the applicable licensing board and law enforcement. Medication diversion deserves specific attention.",
          estDurationSec: 64
        },
        {
          id: "GAO-020-L2-C3",
          type: "content",
          title: "EAP Support, Consequences & Colleague Concerns (part 3)",
          body: "In home health, you may have access to controlled substances in patient homes — opioids, benzodiazepines, stimulants. Diversion means taking, using, or redirecting these medications from their intended recipient. Diversion is a criminal act, a violation of the Controlled Substances Act, and a patient safety emergency.",
          narration: "In home health, you may have access to controlled substances in patient homes — opioids, benzodiazepines, stimulants. Diversion means taking, using, or redirecting these medications from their intended recipient. Diversion is a criminal act, a violation of the Controlled Substances Act, and a patient safety emergency. Signs of potential diversion include: patients reporting missing medications; unexplained discrepancies in medication counts; a clinician frequently volunteering for patients with high-value controlled substances; and patients reporting inadequate pain relief despite receiving prescribed doses, which may indicate the clinician is diluting or substituting medications. If you suspect a colleague of diversion or impairment, you have an obligation to report it. This is not optional, and it is not gossip — it is a patient safety imperative. Report to your supervisor or the compliance hotline. You may report anonymously. Failure to report known or suspected impairment or diversion makes you complicit in any resulting patient",
          estDurationSec: 64
        },
        {
          id: "GAO-020-L2-C4",
          type: "content",
          title: "EAP Support, Consequences & Colleague Concerns (part 4)",
          body: "harm. Let us discuss how to handle the difficult situation of a colleague you believe is impaired during work. Do not confront them directly in a confrontational manner, as impaired individuals may react unpredictably. Do not allow them to continue providing patient care if you believe they are impaired.",
          narration: "harm. Let us discuss how to handle the difficult situation of a colleague you believe is impaired during work. Do not confront them directly in a confrontational manner, as impaired individuals may react unpredictably. Do not allow them to continue providing patient care if you believe they are impaired. If they are about to drive to a patient visit, speak up: 'I am concerned about your ability to drive safely right now. Let me help you.' If they are already with a patient, contact your supervisor immediately so the patient can receive safe care from another clinician. It is also important to distinguish between substance abuse in your colleagues and substance abuse that you may observe in patient homes. Encountering drug paraphernalia, intoxicated household members, or patients who misuse their own medications is common in home health. Your role is not to judge patients for their choices, but to assess",
          estDurationSec: 64
        },
        {
          id: "GAO-020-L2-C5",
          type: "content",
          title: "EAP Support, Consequences & Colleague Concerns (part 5)",
          body: "safety and clinical impact. Document your observations objectively. If a household member's intoxication creates an unsafe environment for you, leave and report per the personal safety protocols covered in GAO-016. For patients with substance use disorders, approach with clinical objectivity and compassion.",
          narration: "safety and clinical impact. Document your observations objectively. If a household member's intoxication creates an unsafe environment for you, leave and report per the personal safety protocols covered in GAO-016. For patients with substance use disorders, approach with clinical objectivity and compassion. Substance use disorder is a diagnosis, not a character flaw. Your documentation should be factual and clinical: 'Patient appeared lethargic, speech slurred, empty alcohol bottles observed on bedside table' rather than 'Patient was drunk again.' Objective clinical documentation supports appropriate care planning without judgment. Finally, let us address the impact of substance abuse on professional licensure. If you hold a professional license in California — RN, LVN, PT, OT, SLP — a substance abuse-related workplace incident may trigger reporting to your licensing board. Most licensing boards operate Diversion Programs that allow professionals to receive treatment and monitoring while maintaining their license under strict conditions. Early voluntary self-referral to",
          estDurationSec: 64
        },
        {
          id: "GAO-020-L2-C6",
          type: "content",
          title: "EAP Support, Consequences & Colleague Concerns (part 6)",
          body: "a licensing board diversion program, before an incident forces reporting, generally results in more favorable outcomes for your career. Policy Reference: HR-ER-005 — Drug-Free Workplace Policy. This policy contains full details on testing protocols, consequences, appeal processes, and support resources.",
          narration: "a licensing board diversion program, before an incident forces reporting, generally results in more favorable outcomes for your career. Policy Reference: HR-ER-005 — Drug-Free Workplace Policy. This policy contains full details on testing protocols, consequences, appeal processes, and support resources. You are encouraged to read the full policy as a separate P&P activity. Note: completing this training module does not constitute acknowledgment of the formal policy. Policy acknowledgment is a separate assigned activity. Knowledge Check 2: What is the difference between voluntary self-referral and a positive drug test in terms of consequences? (Answer: Voluntary self-referral before any incident allows access to treatment with employment protection, while a positive test triggers immediate removal from patient care, mandatory evaluation, and potential termination for repeat offenses.) Scenario Practice 1: You arrive at the office before your first visit. Your colleague Sarah, an RN, is in the parking lot looking disoriented. Her speech is",
          estDurationSec: 64
        },
        {
          id: "GAO-020-L2-C7",
          type: "content",
          title: "EAP Support, Consequences & Colleague Concerns (part 7)",
          body: "slightly slurred and she smells faintly of alcohol. She says she is fine and reaches for her car keys to drive to her first patient visit. What do you do? Expected Response: (1) Do not let Sarah drive to a patient visit. Patient safety is the immediate concern.",
          narration: "slightly slurred and she smells faintly of alcohol. She says she is fine and reaches for her car keys to drive to her first patient visit. What do you do? Expected Response: (1) Do not let Sarah drive to a patient visit. Patient safety is the immediate concern. (2) Calmly express concern: 'Sarah, I am worried about you. I do not think it is safe for you to drive right now.' (3) Offer to help: 'Let me walk you inside. We can talk to [supervisor name].' (4) If Sarah refuses and insists on driving, do not physically try to stop her, but immediately contact your supervisor or the on-call manager. (5) Document your observations: time, location, specific signs (slurred speech, alcohol odor, disorientation). (6) The supervisor will handle the reasonable suspicion assessment and testing. (7) Your concern is not about getting Sarah in trouble — it is about preventing potential",
          estDurationSec: 64
        },
        {
          id: "GAO-020-L2-C8",
          type: "content",
          title: "EAP Support, Consequences & Colleague Concerns (part 8)",
          body: "patient harm. Scenario Practice 2: During a home visit, you notice that Mr. Kim's prescribed oxycodone count is 12 tablets short of what it should be based on his dosing schedule. Mr. Kim says he has been taking extra for breakthrough pain, but his pain logs do not support this.",
          narration: "patient harm. Scenario Practice 2: During a home visit, you notice that Mr. Kim's prescribed oxycodone count is 12 tablets short of what it should be based on his dosing schedule. Mr. Kim says he has been taking extra for breakthrough pain, but his pain logs do not support this. The previous clinician visited two days ago. What do you do? Expected Response: (1) Document the medication count discrepancy objectively: 'Expected count: 30 tablets. Actual count: 18 tablets. Patient reports additional doses for breakthrough pain. Pain logs show 2 doses per day as prescribed. Discrepancy: 12 tablets.' (2) Do not accuse the patient, family, or previous clinician. (3) Report the discrepancy to your supervisor immediately. (4) Your supervisor will initiate a medication count investigation. (5) This is a potential diversion situation that could involve the patient self-administering more than prescribed, a household member taking medications, or clinician diversion. (6) The",
          estDurationSec: 64
        },
        {
          id: "GAO-020-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"EAP Support, Consequences & Colleague Concerns\"?",
          narration: "What is the key takeaway from \"EAP Support, Consequences & Colleague Concerns\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-020-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"EAP Support, Consequences & Colleague Concerns\"?",
            narration: "What is the key takeaway from \"EAP Support, Consequences & Colleague Concerns\"?",
            options: [
              {
                id: "a",
                label: "Care Indeed recognizes that substance use disorders are medical conditions, not moral failures.",
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
            policyRef: "HR-ER-005",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Care Indeed recognizes that substance use disorders are medical conditions, not moral failures."
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-020-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Substance Abuse / Drug-Free Workplace. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Drug-Free Workplace Requirements & Prohibited Conduct\"?",
        narration: "Which statement best reflects the teaching in \"Drug-Free Workplace Requirements & Prohibited Conduct\"?",
        options: [
          {
            id: "a",
            label: "Welcome to GAO-020, Substance Abuse and Drug-Free Workplace.",
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
        rationale: "Derived from GAO-020 page: Drug-Free Workplace Requirements & Prohibited Conduct",
        policyRef: "HR-ER-005"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"EAP Support, Consequences & Colleague Concerns\"?",
        narration: "Which statement best reflects the teaching in \"EAP Support, Consequences & Colleague Concerns\"?",
        options: [
          {
            id: "a",
            label: "Care Indeed recognizes that substance use disorders are medical conditions, not moral failures.",
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
        rationale: "Derived from GAO-020 page: EAP Support, Consequences & Colleague Concerns",
        policyRef: "HR-ER-005"
      },
      {
        id: "q3",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Drug-Free Workplace Requirements & Prohibited Conduct\".",
        narration: "True or false: staff must apply the requirements taught in \"Drug-Free Workplace Requirements & Prohibited Conduct\".",
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
        policyRef: "HR-ER-005"
      },
      {
        id: "q4",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"EAP Support, Consequences & Colleague Concerns\".",
        narration: "True or false: staff must apply the requirements taught in \"EAP Support, Consequences & Colleague Concerns\".",
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
        policyRef: "HR-ER-005"
      },
      {
        id: "q5",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Drug-Free Workplace Requirements & Prohibited Conduct\".",
        narration: "True or false: staff must apply the requirements taught in \"Drug-Free Workplace Requirements & Prohibited Conduct\".",
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
        policyRef: "HR-ER-005"
      }
    ]
  }
},
  {
  moduleId: "GAO-021",
  policyRefs: [
    "HR-ER-002"
  ],
  cmsRefs: [],
  estimatedDurationMin: 30,
  durationSource: "DEFAULT",
  splash: {
    title: "Disciplinary Process Overview",
    subtitle: "Care Indeed GAO — AAA Record v2.0",
    whyItMatters: "Welcome to GAO-021, Disciplinary Process Overview. This module explains how Care Indeed addresses performance issues and policy violations.",
    narration: "Welcome to GAO-021, Disciplinary Process Overview. Welcome to GAO-021, Disciplinary Process Overview. This module explains how Care Indeed addresses performance issues and policy violations."
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
      id: "GAO-021-L1",
      order: 1,
      title: "Progressive Discipline Framework",
      objectives: [
        "Apply key requirements from Progressive Discipline Framework",
        "Identify correct field actions related to Progressive Discipline Framework"
      ],
      cards: [
        {
          id: "GAO-021-L1-S",
          type: "summary",
          title: "Progressive Discipline Framework",
          body: "Welcome to GAO-021, Disciplinary Process Overview. This module explains how Care Indeed addresses performance issues and policy violations. Understanding the disciplinary process is important not because we expect problems, but because transparency builds trust.",
          narration: "In this lesson: Progressive Discipline Framework. Welcome to GAO-021, Disciplinary Process Overview. This module explains how Care Indeed addresses performance issues and policy violations. Understanding the disciplinary process is important not because we expect problems, but because transparency builds trust. When you know the rules and the consequences, you can focus on your work with confidence.",
          estDurationSec: 45
        },
        {
          id: "GAO-021-L1-C1",
          type: "content",
          title: "Progressive Discipline Framework",
          body: "Welcome to GAO-021, Disciplinary Process Overview. This module explains how Care Indeed addresses performance issues and policy violations. Understanding the disciplinary process is important not because we expect problems, but because transparency builds trust.",
          narration: "Welcome to GAO-021, Disciplinary Process Overview. This module explains how Care Indeed addresses performance issues and policy violations. Understanding the disciplinary process is important not because we expect problems, but because transparency builds trust. When you know the rules and the consequences, you can focus on your work with confidence. Care Indeed follows a progressive discipline model. Progressive discipline means that, in most cases, the severity of the disciplinary response increases with each subsequent occurrence of the same or similar issue. The goal is not punishment — it is correction. We want employees to understand the concern, improve their performance, and continue their careers with us. Discipline is a last resort, not a first response. Before we walk through the steps, let us address an important legal concept. California is an at-will employment state. At-will means that either you or Care Indeed can end the employment relationship at any time,",
          estDurationSec: 64
        },
        {
          id: "GAO-021-L1-C2",
          type: "content",
          title: "Progressive Discipline Framework (part 2)",
          body: "for any lawful reason, with or without cause, and with or without notice. The progressive discipline process described here represents Care Indeed's general practice but does not create a contractual obligation to follow these steps in every case.",
          narration: "for any lawful reason, with or without cause, and with or without notice. The progressive discipline process described here represents Care Indeed's general practice but does not create a contractual obligation to follow these steps in every case. Certain offenses warrant immediate termination, which we will discuss later. Step One is verbal counseling. This is an informal conversation between you and your supervisor about a performance concern or minor policy issue. Examples include: arriving late to patient visits on two occasions, minor documentation deficiencies, or not following a specific procedure correctly. The supervisor explains the concern, discusses the expected standard, and asks if there are barriers they can help address. The conversation is documented with a brief note in the employee file, but it is not considered formal discipline. Think of verbal counseling as coaching — your supervisor is helping you get on track. Step Two is a written warning.",
          estDurationSec: 64
        },
        {
          id: "GAO-021-L1-C3",
          type: "content",
          title: "Progressive Discipline Framework (part 3)",
          body: "If the issue continues after verbal counseling, or if the initial issue is more serious, a formal written warning is issued. The written warning includes: a specific description of the behavior or performance issue; reference to the policy, procedure, or standard that was violated; a summary of any prior verbal…",
          narration: "If the issue continues after verbal counseling, or if the initial issue is more serious, a formal written warning is issued. The written warning includes: a specific description of the behavior or performance issue; reference to the policy, procedure, or standard that was violated; a summary of any prior verbal counseling; the expected correction and a timeline for improvement; the consequences if the issue continues; and a space for the employee to sign acknowledging receipt and add their own comments. You always have the right to add your perspective to a written warning. Signing the form means you received it, not that you agree with it. Step Three is a final written warning. This is the last step before potential termination. It carries the same elements as a written warning but with heightened seriousness. The final written warning explicitly states that failure to correct the issue will result in further",
          estDurationSec: 64
        },
        {
          id: "GAO-021-L1-C4",
          type: "content",
          title: "Progressive Discipline Framework (part 4)",
          body: "disciplinary action up to and including termination. At this stage, a Performance Improvement Plan, or PIP, may also be implemented. A PIP is a structured 30, 60, or 90-day plan with specific, measurable performance goals, regular check-in meetings, and clear criteria for successful completion.",
          narration: "disciplinary action up to and including termination. At this stage, a Performance Improvement Plan, or PIP, may also be implemented. A PIP is a structured 30, 60, or 90-day plan with specific, measurable performance goals, regular check-in meetings, and clear criteria for successful completion. If you are placed on a PIP, take it seriously. It is designed to give you every opportunity to succeed. Your supervisor will meet with you regularly to provide feedback, resources, and support. Step Four is suspension. In some cases, an employee may be suspended pending investigation or as a disciplinary measure. Suspensions may be with or without pay depending on the circumstances. A suspension pending investigation occurs when the agency needs time to gather facts about an alleged serious violation before making a final determination. This is not punishment — it is a necessary step to protect all parties while the investigation is conducted. Step",
          estDurationSec: 64
        },
        {
          id: "GAO-021-L1-C5",
          type: "content",
          title: "Progressive Discipline Framework (part 5)",
          body: "Five is termination. When progressive discipline has been exhausted without improvement, or when an offense warrants immediate termination, the employment relationship is ended. Termination is documented with a summary of the complete disciplinary history, the final incident, and the rationale for the decision.",
          narration: "Five is termination. When progressive discipline has been exhausted without improvement, or when an offense warrants immediate termination, the employment relationship is ended. Termination is documented with a summary of the complete disciplinary history, the final incident, and the rationale for the decision. HR participates in all termination decisions to ensure consistency, fairness, and legal compliance. Now let us discuss offenses that may result in immediate termination, bypassing the progressive steps. These are serious violations that fundamentally breach the trust between the employee, the agency, and the patients we serve. They include: physical violence or threats of violence against patients, colleagues, or anyone in the workplace; theft of agency property, patient property, or patient medications; patient abuse, neglect, or exploitation; falsification of credentials, licensure, or employment documents; abandonment of a patient in a dangerous situation; gross HIPAA violations such as intentional disclosure of patient information; diversion of controlled substances; working",
          estDurationSec: 64
        },
        {
          id: "GAO-021-L1-C6",
          type: "content",
          title: "Progressive Discipline Framework (part 6)",
          body: "under the influence of drugs or alcohol; and fraud including falsification of time records, clinical documentation, or billing. These offenses are not subject to progressive discipline because they represent immediate threats to patient safety, agency integrity, or legal compliance.",
          narration: "under the influence of drugs or alcohol; and fraud including falsification of time records, clinical documentation, or billing. These offenses are not subject to progressive discipline because they represent immediate threats to patient safety, agency integrity, or legal compliance. An employee who commits one of these offenses may be terminated on the spot with or without prior disciplinary history. Knowledge Check 1: What are the five progressive discipline steps in order? (Answer: Verbal counseling, written warning, final written warning, suspension, termination.) ---",
          estDurationSec: 35
        },
        {
          id: "GAO-021-L1-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Progressive Discipline Framework\"?",
          narration: "What is the key takeaway from \"Progressive Discipline Framework\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-021-L1-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Progressive Discipline Framework\"?",
            narration: "What is the key takeaway from \"Progressive Discipline Framework\"?",
            options: [
              {
                id: "a",
                label: "Welcome to GAO-021, Disciplinary Process Overview. This module explains how Care Indeed addresses performance issues and policy violations.",
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
            policyRef: "HR-ER-002",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "Welcome to GAO-021, Disciplinary Process Overview. This module explains how Care Indeed addresses performance issues and policy violations."
          }
        }
      ]
    },
    {
      id: "GAO-021-L2",
      order: 2,
      title: "Employee Rights, Appeals & Building a Positive Work Culture",
      objectives: [
        "Apply key requirements from Employee Rights, Appeals & Building a Positive Work Culture",
        "Identify correct field actions related to Employee Rights, Appeals & Building a Positive Work Culture"
      ],
      cards: [
        {
          id: "GAO-021-L2-S",
          type: "summary",
          title: "Employee Rights, Appeals & Building a Positive Work Culture",
          body: "You have rights throughout the disciplinary process. Understanding these rights is important for your protection and peace of mind. First, you have the right to know the specific allegation against you. Discipline must never be vague.",
          narration: "In this lesson: Employee Rights, Appeals & Building a Positive Work Culture. You have rights throughout the disciplinary process. Understanding these rights is important for your protection and peace of mind. First, you have the right to know the specific allegation against you. Discipline must never be vague. 'Your performance is not meeting expectations' without specifics is insufficient.",
          estDurationSec: 45
        },
        {
          id: "GAO-021-L2-C1",
          type: "content",
          title: "Employee Rights, Appeals & Building a Positive Work Culture",
          body: "You have rights throughout the disciplinary process. Understanding these rights is important for your protection and peace of mind. First, you have the right to know the specific allegation against you. Discipline must never be vague. 'Your performance is not meeting expectations' without specifics is insufficient.",
          narration: "You have rights throughout the disciplinary process. Understanding these rights is important for your protection and peace of mind. First, you have the right to know the specific allegation against you. Discipline must never be vague. 'Your performance is not meeting expectations' without specifics is insufficient. You are entitled to know exactly what behavior or performance issue is being addressed, when it occurred, what standard it violates, and what the expected correction is. Second, you have the right to provide your side of the story. Before any formal disciplinary action is finalized, you will have the opportunity to explain your perspective. There may be mitigating circumstances your supervisor is not aware of. Perhaps you were late to visits because of a vehicle breakdown. Perhaps a documentation error occurred because the EHR system was malfunctioning. Your explanation is part of the record and will be considered. Third, you have the right",
          estDurationSec: 64
        },
        {
          id: "GAO-021-L2-C2",
          type: "content",
          title: "Employee Rights, Appeals & Building a Positive Work Culture (part 2)",
          body: "to review and respond to written disciplinary documents. As mentioned, you may add written comments to any warning or disciplinary form. Take advantage of this right. If you disagree with the characterization of events, write your version. This becomes part of your permanent employee file.",
          narration: "to review and respond to written disciplinary documents. As mentioned, you may add written comments to any warning or disciplinary form. Take advantage of this right. If you disagree with the characterization of events, write your version. This becomes part of your permanent employee file. Fourth, you have the right to appeal. If you believe a disciplinary action was unjust, disproportionate, or based on inaccurate information, you may appeal through the grievance process covered in GAO-022. The appeal is reviewed by a different manager or HR representative than the one who issued the original discipline. Fifth, you have the right to be free from discriminatory or retaliatory discipline. Discipline must be applied consistently across all employees. If you are being held to a different standard than your colleagues for the same behavior, that may constitute discrimination. If discipline follows a protected activity such as filing a harassment complaint, requesting FMLA",
          estDurationSec: 64
        },
        {
          id: "GAO-021-L2-C3",
          type: "content",
          title: "Employee Rights, Appeals & Building a Positive Work Culture (part 3)",
          body: "leave, or reporting a safety violation, that may constitute retaliation. Both are illegal and should be reported through HR or the compliance hotline. Sixth, in certain circumstances you may have the right to representation.",
          narration: "leave, or reporting a safety violation, that may constitute retaliation. Both are illegal and should be reported through HR or the compliance hotline. Sixth, in certain circumstances you may have the right to representation. Under the National Labor Relations Act, employees covered by a collective bargaining agreement have Weingarten rights — the right to have a union representative present during an investigatory interview that the employee reasonably believes may result in discipline. Even non-union employees at Care Indeed may request the presence of a colleague during disciplinary meetings for support, though this is a courtesy, not a legal right for at-will non-union employees. Let us discuss the supervisor's obligations in the disciplinary process. Supervisors must: document all disciplinary interactions contemporaneously — notes written days later from memory lose credibility; apply discipline consistently — the same offense should receive the same level of response regardless of who commits it; focus on",
          estDurationSec: 64
        },
        {
          id: "GAO-021-L2-C4",
          type: "content",
          title: "Employee Rights, Appeals & Building a Positive Work Culture (part 4)",
          body: "behavior and performance, never on personal characteristics; provide specific, actionable feedback — telling someone to 'do better' is not helpful, telling them to 'complete visit documentation within 24 hours of the visit' is; allow a reasonable improvement period — expecting immediate perfection after years of a…",
          narration: "behavior and performance, never on personal characteristics; provide specific, actionable feedback — telling someone to 'do better' is not helpful, telling them to 'complete visit documentation within 24 hours of the visit' is; allow a reasonable improvement period — expecting immediate perfection after years of a different practice is unrealistic; and consult with HR before issuing any formal written warning or above to ensure procedural compliance. Let us also distinguish between discipline and constructive feedback. Not every performance conversation is discipline. Your supervisor should be providing regular feedback — positive and constructive — as part of routine supervision. If your supervisor says, 'I noticed your last three wound measurements were missing photo documentation. Let us make sure we include photos going forward,' that is coaching, not discipline. It becomes discipline only when the issue persists after coaching, or when the issue is serious enough to warrant formal documentation from the",
          estDurationSec: 64
        },
        {
          id: "GAO-021-L2-C5",
          type: "content",
          title: "Employee Rights, Appeals & Building a Positive Work Culture (part 5)",
          body: "start. A healthy work culture depends on open communication. If you are unsure about a policy or procedure, ask before guessing. If you make a mistake, report it promptly — honest mistakes disclosed proactively are treated very differently from concealed errors discovered later.",
          narration: "start. A healthy work culture depends on open communication. If you are unsure about a policy or procedure, ask before guessing. If you make a mistake, report it promptly — honest mistakes disclosed proactively are treated very differently from concealed errors discovered later. If you are struggling with workload, skills, personal issues, or burnout, talk to your supervisor or EAP. Care Indeed would rather help you succeed than initiate discipline. Finally, let us address a scenario that causes anxiety for many employees: being called into a meeting and discovering it is a disciplinary conversation. Here is what to expect. The meeting will typically include your supervisor and a representative from HR. They will explain the concern, present their information, and ask for your response. Stay calm and professional even if you disagree. Listen carefully. Ask clarifying questions. If you need time to formulate a written response, you may ask for",
          estDurationSec: 64
        },
        {
          id: "GAO-021-L2-C6",
          type: "content",
          title: "Employee Rights, Appeals & Building a Positive Work Culture (part 6)",
          body: "it. Do not sign anything under pressure if you need time to review — you can request 24 hours to review a written document before signing. Policy Reference: HR-ER-002 — Employee Disciplinary Procedures. This policy contains the complete disciplinary framework, appeal procedures, and documentation requirements.",
          narration: "it. Do not sign anything under pressure if you need time to review — you can request 24 hours to review a written document before signing. Policy Reference: HR-ER-002 — Employee Disciplinary Procedures. This policy contains the complete disciplinary framework, appeal procedures, and documentation requirements. You are encouraged to read the full policy as a separate P&P activity. Note: completing this training module does not constitute acknowledgment of the formal policy. Policy acknowledgment is a separate assigned activity. Knowledge Check 2: Name three offenses that may result in immediate termination without progressive discipline. (Answer: Any three of: violence/threats, theft, patient abuse/neglect, credential falsification, patient abandonment, gross HIPAA violation, medication diversion, working under the influence, fraud.) Scenario Practice 1: You have received a written warning for consistently late documentation — your visit notes are being completed 48–72 hours after visits instead of within the required 24-hour window. You believe the problem",
          estDurationSec: 64
        },
        {
          id: "GAO-021-L2-C7",
          type: "content",
          title: "Employee Rights, Appeals & Building a Positive Work Culture (part 7)",
          body: "is due to an excessive caseload, not negligence. What should you do? Expected Response: (1) Do not ignore the written warning. (2) Add your written comments to the form explaining the caseload factor. (3) Request a meeting with your supervisor to discuss workload.",
          narration: "is due to an excessive caseload, not negligence. What should you do? Expected Response: (1) Do not ignore the written warning. (2) Add your written comments to the form explaining the caseload factor. (3) Request a meeting with your supervisor to discuss workload. Bring data: number of visits per day, average documentation time, distance between patients. (4) If workload is genuinely the issue, your supervisor may adjust your schedule, reduce your caseload temporarily, or provide additional support. (5) In the meantime, prioritize completing documentation within the 24-hour window, even if it means requesting help with visit scheduling. (6) If you believe the warning is unjust or inconsistently applied (e.g., other clinicians with the same caseload are not being disciplined), you may file a grievance. Scenario Practice 2: You witness a colleague falsify a visit time in the EHR — she documents arriving at a patient's home at 9:00 AM, but",
          estDurationSec: 64
        },
        {
          id: "GAO-021-L2-C8",
          type: "content",
          title: "Employee Rights, Appeals & Building a Positive Work Culture (part 8)",
          body: "you know she did not arrive until 10:15 AM because you were at the same patient complex. What do you do? Expected Response: (1) Time falsification is fraud — one of the immediate termination offenses. (2) Do not confront the colleague directly. (3) Report what you observed to your supervisor or the compliance hotline.",
          narration: "you know she did not arrive until 10:15 AM because you were at the same patient complex. What do you do? Expected Response: (1) Time falsification is fraud — one of the immediate termination offenses. (2) Do not confront the colleague directly. (3) Report what you observed to your supervisor or the compliance hotline. (4) Provide specific facts: the date, the patient address, the documented time vs. the actual observed arrival time, and how you know (e.g., you were at the same complex). (5) The agency will investigate. (6) This is not 'tattling' — time fraud affects billing accuracy, patient care documentation, and agency compliance with Medicare requirements. (7) You are protected from retaliation for reporting compliance concerns. Training Module Complete — Scenario Practice Complete --- ## COMPETENCY ASSESSMENT — 10 Questions (80% Pass Score) ### Canonical Questions (Q1–Q5) Q1. The primary goal of progressive discipline is: - A) Punishment",
          estDurationSec: 64
        },
        {
          id: "GAO-021-L2-CH",
          type: "challenge",
          title: "Apply This Lesson",
          body: "What is the key takeaway from \"Employee Rights, Appeals & Building a Positive Work Culture\"?",
          narration: "What is the key takeaway from \"Employee Rights, Appeals & Building a Positive Work Culture\"?",
          estDurationSec: 55,
          challenge: {
            id: "GAO-021-L2-CH-Q",
            format: "scenario_decision",
            prompt: "What is the key takeaway from \"Employee Rights, Appeals & Building a Positive Work Culture\"?",
            narration: "What is the key takeaway from \"Employee Rights, Appeals & Building a Positive Work Culture\"?",
            options: [
              {
                id: "a",
                label: "You have rights throughout the disciplinary process. Understanding these rights is important for your protection and peace of mind.",
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
            policyRef: "HR-ER-002",
            feedbackCorrect: "Correct.",
            feedbackIncorrect: "Review the expected response and policy guidance.",
            complianceImpact: "Incorrect action can create survey, safety, or legal exposure.",
            realWorldConsequence: "Patient harm, delayed reporting, or noncompliance findings can result.",
            correctBehaviorGuidance: "You have rights throughout the disciplinary process. Understanding these rights is important for your protection and peace of mind. First, you have the right to know the specific allegation against you."
          }
        }
      ]
    }
  ],
  finalTest: {
    id: "GAO-021-FT",
    passingScorePct: 0.8,
    instructionsNarration: "Final test on Disciplinary Process Overview. 80 percent required to pass.",
    failAction: "remediation",
    questions: [
      {
        id: "q1",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Progressive Discipline Framework\"?",
        narration: "Which statement best reflects the teaching in \"Progressive Discipline Framework\"?",
        options: [
          {
            id: "a",
            label: "Welcome to GAO-021, Disciplinary Process Overview.",
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
        rationale: "Derived from GAO-021 page: Progressive Discipline Framework",
        policyRef: "HR-ER-002"
      },
      {
        id: "q2",
        format: "scenario_decision",
        prompt: "Which statement best reflects the teaching in \"Employee Rights, Appeals & Building a Positive Work Culture\"?",
        narration: "Which statement best reflects the teaching in \"Employee Rights, Appeals & Building a Positive Work Culture\"?",
        options: [
          {
            id: "a",
            label: "You have rights throughout the disciplinary process.",
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
        rationale: "Derived from GAO-021 page: Employee Rights, Appeals & Building a Positive Work Culture",
        policyRef: "HR-ER-002"
      },
      {
        id: "q3",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Progressive Discipline Framework\".",
        narration: "True or false: staff must apply the requirements taught in \"Progressive Discipline Framework\".",
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
        policyRef: "HR-ER-002"
      },
      {
        id: "q4",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Employee Rights, Appeals & Building a Positive Work Culture\".",
        narration: "True or false: staff must apply the requirements taught in \"Employee Rights, Appeals & Building a Positive Work Culture\".",
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
        policyRef: "HR-ER-002"
      },
      {
        id: "q5",
        format: "true_false",
        prompt: "True or false: staff must apply the requirements taught in \"Progressive Discipline Framework\".",
        narration: "True or false: staff must apply the requirements taught in \"Progressive Discipline Framework\".",
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
        policyRef: "HR-ER-002"
      }
    ]
  }
}
];
