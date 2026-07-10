import type { IncidentTrack } from '../criticalIncidentRouter.js';

/* 100-question situational QA set for Brad's critical-incident routing.
   Deliberately messy: human phrasing, typos, short/vague messages, and
   emotionally stressed wording. `accept` lists the tracks that are a correct
   route for the prompt (overlap is allowed). `urgent:true` means Brad must give
   safety-first guidance and never the generic fallback. */

export interface QaPrompt {
  id: number;
  prompt: string;
  accept: IncidentTrack[];
  urgent: boolean;
}

export const BRAD_QA_PROMPTS: QaPrompt[] = [
  // ── Immediate danger / active threat ──────────────────────────────────────
  { id: 1, prompt: 'help my patient assaulted me', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 2, prompt: 'my patient assaulted me with a baseball bat', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 3, prompt: 'a patient hit me', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 4, prompt: 'family member threatened me during visit', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 5, prompt: 'the son is screaming he will kill me', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 6, prompt: 'client threw a chair at me', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 7, prompt: 'patient grabbed me and wont let go', accept: ['IMMEDIATE_DANGER', 'UNSAFE_ENVIRONMENT'], urgent: true },
  { id: 8, prompt: 'theres a guy with a knife in the house', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 9, prompt: 'patient is trying to hit me with his cane', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 10, prompt: 'drunk family member is getting aggressive with me', accept: ['IMMEDIATE_DANGER', 'UNSAFE_ENVIRONMENT'], urgent: true },
  { id: 11, prompt: 'someone is following me from the patients home', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 12, prompt: 'patient pulled a gun on me', accept: ['IMMEDIATE_DANGER'], urgent: true },

  // ── Serious injury or possible injury ─────────────────────────────────────
  { id: 13, prompt: 'patient fell and hit their head', accept: ['SERIOUS_INJURY', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 14, prompt: 'my patient slipped in the bathroom', accept: ['SERIOUS_INJURY', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 15, prompt: 'she broke her hip', accept: ['SERIOUS_INJURY', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 16, prompt: 'patient has a deep cut on her arm', accept: ['SERIOUS_INJURY', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 17, prompt: 'i think my patient broke something when she fell', accept: ['SERIOUS_INJURY', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 18, prompt: 'burn on patients hand from the stove', accept: ['SERIOUS_INJURY', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 19, prompt: 'i stuck myself with a needle', accept: ['SERIOUS_INJURY', 'IMMEDIATE_DANGER'], urgent: true },
  { id: 20, prompt: 'patient cut herself with scissors', accept: ['SERIOUS_INJURY', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 21, prompt: 'patient twisted her ankle on the stairs', accept: ['SERIOUS_INJURY', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 22, prompt: 'my client has a bad bruise i didnt see before', accept: ['SERIOUS_INJURY', 'SUSPECTED_MISTREATMENT'], urgent: true },

  // ── Patient death / unresponsive / life-threatening ───────────────────────
  { id: 23, prompt: 'i found my patient dead in the bathroom', accept: ['DEATH_OR_UNRESPONSIVE'], urgent: true },
  { id: 24, prompt: 'patient is unresponsive and family is yelling at me', accept: ['DEATH_OR_UNRESPONSIVE', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 25, prompt: "she's not breathing", accept: ['DEATH_OR_UNRESPONSIVE', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 26, prompt: 'my patient has no pulse', accept: ['DEATH_OR_UNRESPONSIVE', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 27, prompt: 'i think my patient passed away', accept: ['DEATH_OR_UNRESPONSIVE'], urgent: true },
  { id: 28, prompt: "patient collapsed and won't wake up", accept: ['DEATH_OR_UNRESPONSIVE', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 29, prompt: 'client unconscious on the floor', accept: ['DEATH_OR_UNRESPONSIVE', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 30, prompt: 'found her on the floor not breathing', accept: ['DEATH_OR_UNRESPONSIVE', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 31, prompt: 'patient died during my visit', accept: ['DEATH_OR_UNRESPONSIVE'], urgent: true },
  { id: 32, prompt: 'my patient stopped breathing', accept: ['DEATH_OR_UNRESPONSIVE', 'CLINICAL_EMERGENCY'], urgent: true },

  // ── Unsafe visit environment ──────────────────────────────────────────────
  { id: 33, prompt: 'i feel unsafe during a visit', accept: ['UNSAFE_ENVIRONMENT', 'IMMEDIATE_DANGER'], urgent: true },
  { id: 34, prompt: 'theres a big aggressive dog at this house', accept: ['UNSAFE_ENVIRONMENT', 'IMMEDIATE_DANGER'], urgent: true },
  { id: 35, prompt: 'the home is full of roaches and i dont feel safe', accept: ['UNSAFE_ENVIRONMENT', 'IMMEDIATE_DANGER'], urgent: true },
  { id: 36, prompt: 'people are doing drugs in the patients house', accept: ['UNSAFE_ENVIRONMENT', 'IMMEDIATE_DANGER'], urgent: true },
  { id: 37, prompt: 'family is hostile and i want to leave', accept: ['UNSAFE_ENVIRONMENT', 'IMMEDIATE_DANGER'], urgent: true },
  { id: 38, prompt: 'i dont feel safe in this neighborhood at night', accept: ['UNSAFE_ENVIRONMENT', 'IMMEDIATE_DANGER'], urgent: true },
  { id: 39, prompt: 'the patients husband keeps yelling at me', accept: ['UNSAFE_ENVIRONMENT', 'IMMEDIATE_DANGER'], urgent: true },
  { id: 40, prompt: "i'm scared to go back to this house", accept: ['UNSAFE_ENVIRONMENT', 'IMMEDIATE_DANGER'], urgent: true },
  { id: 41, prompt: 'client keeps a gun on the table during visits', accept: ['IMMEDIATE_DANGER', 'UNSAFE_ENVIRONMENT'], urgent: true },
  { id: 42, prompt: 'they wont let me leave the house', accept: ['UNSAFE_ENVIRONMENT', 'IMMEDIATE_DANGER'], urgent: true },

  // ── Suspected mistreatment / neglect / exploitation / rights ──────────────
  { id: 43, prompt: 'caregiver reported seeing son abusing her patient', accept: ['SUSPECTED_MISTREATMENT'], urgent: true },
  { id: 44, prompt: 'what do i do if i see my patient being abused?', accept: ['SUSPECTED_MISTREATMENT'], urgent: true },
  { id: 45, prompt: 'i think the daughter is stealing her moms money', accept: ['SUSPECTED_MISTREATMENT'], urgent: true },
  { id: 46, prompt: 'patient says her aide hits her', accept: ['SUSPECTED_MISTREATMENT', 'IMMEDIATE_DANGER'], urgent: true },
  { id: 47, prompt: 'the family isnt feeding him properly', accept: ['SUSPECTED_MISTREATMENT'], urgent: true },
  { id: 48, prompt: 'patient is being left alone for days', accept: ['SUSPECTED_MISTREATMENT'], urgent: true },
  { id: 49, prompt: 'i suspect elder abuse', accept: ['SUSPECTED_MISTREATMENT'], urgent: true },
  { id: 50, prompt: 'someone is exploiting my patient financially', accept: ['SUSPECTED_MISTREATMENT'], urgent: true },
  { id: 51, prompt: 'the son took all her jewelry and cash', accept: ['SUSPECTED_MISTREATMENT'], urgent: true },
  { id: 52, prompt: 'patient is always dirty and neglected', accept: ['SUSPECTED_MISTREATMENT'], urgent: true },
  { id: 53, prompt: 'they are violating my patients rights', accept: ['SUSPECTED_MISTREATMENT'], urgent: true },
  { id: 54, prompt: 'the family is withholding her medications', accept: ['SUSPECTED_MISTREATMENT', 'REPORTABLE_INCIDENT'], urgent: true },

  // ── Reportable incident / adverse / sentinel ──────────────────────────────
  { id: 55, prompt: 'i gave the wrong dose of insulin', accept: ['REPORTABLE_INCIDENT'], urgent: true },
  { id: 56, prompt: 'med error during my visit', accept: ['REPORTABLE_INCIDENT'], urgent: true },
  { id: 57, prompt: 'i think i made a medication mistake', accept: ['REPORTABLE_INCIDENT'], urgent: true },
  { id: 58, prompt: 'patient fell but seems ok', accept: ['SERIOUS_INJURY', 'REPORTABLE_INCIDENT', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 59, prompt: 'narcotic count is short', accept: ['REPORTABLE_INCIDENT'], urgent: true },
  { id: 60, prompt: 'do i need to report this incident', accept: ['REPORTABLE_INCIDENT'], urgent: true },
  { id: 61, prompt: 'how do i file an incident report', accept: ['REPORTABLE_INCIDENT'], urgent: true },
  { id: 62, prompt: 'i accidentally broke the patients lamp', accept: ['REPORTABLE_INCIDENT'], urgent: true },
  { id: 63, prompt: 'near miss with a medication today', accept: ['REPORTABLE_INCIDENT'], urgent: true },
  { id: 64, prompt: 'patient was hospitalized after my visit', accept: ['REPORTABLE_INCIDENT', 'CLINICAL_EMERGENCY'], urgent: true },

  // ── Clinical emergency requiring EMS / supervisor escalation ──────────────
  { id: 65, prompt: 'patient is having chest pain', accept: ['CLINICAL_EMERGENCY'], urgent: true },
  { id: 66, prompt: 'my patient cant breathe', accept: ['CLINICAL_EMERGENCY', 'DEATH_OR_UNRESPONSIVE'], urgent: true },
  { id: 67, prompt: 'i think shes having a stroke', accept: ['CLINICAL_EMERGENCY'], urgent: true },
  { id: 68, prompt: 'patient is having a seizure', accept: ['CLINICAL_EMERGENCY'], urgent: true },
  { id: 69, prompt: 'possible overdose', accept: ['CLINICAL_EMERGENCY'], urgent: true },
  { id: 70, prompt: 'patient is bleeding a lot', accept: ['CLINICAL_EMERGENCY'], urgent: true },
  { id: 71, prompt: "she's having an allergic reaction", accept: ['CLINICAL_EMERGENCY'], urgent: true },
  { id: 72, prompt: 'patient blood sugar is really low and shes confused', accept: ['CLINICAL_EMERGENCY'], urgent: true },
  { id: 73, prompt: 'patient fell and is unconscious', accept: ['DEATH_OR_UNRESPONSIVE', 'CLINICAL_EMERGENCY'], urgent: true },
  { id: 74, prompt: 'my patient is choking', accept: ['CLINICAL_EMERGENCY'], urgent: true },

  // ── Privacy / security incident ───────────────────────────────────────────
  { id: 75, prompt: 'i sent patient information to the wrong person', accept: ['PRIVACY_SECURITY'], urgent: true },
  { id: 76, prompt: 'i texted phi to the wrong number', accept: ['PRIVACY_SECURITY'], urgent: true },
  { id: 77, prompt: 'i lost my work laptop', accept: ['PRIVACY_SECURITY'], urgent: true },
  { id: 78, prompt: 'someone stole my phone with patient data', accept: ['PRIVACY_SECURITY'], urgent: true },
  { id: 79, prompt: 'i emailed the wrong patient chart', accept: ['PRIVACY_SECURITY'], urgent: true },
  { id: 80, prompt: 'i think we got hacked', accept: ['PRIVACY_SECURITY'], urgent: true },
  { id: 81, prompt: 'ransomware message on my screen', accept: ['PRIVACY_SECURITY'], urgent: true },
  { id: 82, prompt: 'i faxed records to the wrong office', accept: ['PRIVACY_SECURITY'], urgent: true },

  // ── Documentation / reporting uncertainty (non-urgent) ────────────────────
  { id: 83, prompt: 'how do i document a late entry', accept: ['GENERAL'], urgent: false },
  { id: 84, prompt: 'what should i write in my note after a fall', accept: ['GENERAL', 'SERIOUS_INJURY', 'REPORTABLE_INCIDENT'], urgent: false },
  { id: 85, prompt: 'i forgot to chart a visit yesterday', accept: ['GENERAL'], urgent: false },
  { id: 86, prompt: 'is a verbal order ok to document later', accept: ['GENERAL'], urgent: false },
  { id: 87, prompt: 'do i need a physician signature on this', accept: ['GENERAL'], urgent: false },
  { id: 88, prompt: 'how long do we keep records', accept: ['GENERAL'], urgent: false },
  { id: 89, prompt: 'whats the timeframe to finish my notes', accept: ['GENERAL'], urgent: false },
  { id: 90, prompt: 'can i fix a charting mistake', accept: ['GENERAL'], urgent: false },

  // ── General policy questions, no immediate danger ─────────────────────────
  { id: 91, prompt: 'what is our qapi schedule', accept: ['GENERAL'], urgent: false },
  { id: 92, prompt: 'how does onboarding work', accept: ['GENERAL'], urgent: false },
  { id: 93, prompt: 'where do i find the forms library', accept: ['GENERAL'], urgent: false },
  { id: 94, prompt: 'what training is required for new aides', accept: ['GENERAL'], urgent: false },
  { id: 95, prompt: 'how do i request time off', accept: ['GENERAL'], urgent: false },
  { id: 96, prompt: 'whats the policy on patient rights', accept: ['GENERAL', 'SUSPECTED_MISTREATMENT'], urgent: false },
  { id: 97, prompt: 'how often is the emergency plan reviewed', accept: ['GENERAL'], urgent: false },
  { id: 98, prompt: 'who do i call for scheduling questions', accept: ['GENERAL'], urgent: false },
  { id: 99, prompt: 'what forms do i need for admission', accept: ['GENERAL'], urgent: false },
  { id: 100, prompt: 'can you explain the complaint process', accept: ['GENERAL', 'REPORTABLE_INCIDENT'], urgent: false },

  // ── Worker as VICTIM (patient named as attacker must not flip to patient-injury) ──
  { id: 101, prompt: 'help my patient stabbed me in the eye, i am bleeding and about to faint.', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 102, prompt: 'my patient stabbed me with a fork', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 103, prompt: 'the clients son slashed my arm with a boxcutter', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 104, prompt: 'patient bit me and now im bleeding', accept: ['IMMEDIATE_DANGER', 'SERIOUS_INJURY'], urgent: true },
  { id: 105, prompt: 'i am bleeding badly and about to pass out', accept: ['SERIOUS_INJURY', 'CLINICAL_EMERGENCY', 'IMMEDIATE_DANGER'], urgent: true },
  { id: 106, prompt: 'my patient hit me in the face and my eye is swelling', accept: ['IMMEDIATE_DANGER'], urgent: true },
  // Non-regression: "stabbing pain" is clinical, never violence.
  { id: 107, prompt: 'my patient has stabbing chest pain', accept: ['CLINICAL_EMERGENCY'], urgent: true },

  // ── Violent scene, patient as victim: scene safety FIRST (CMS/BLS doctrine) ──
  { id: 108, prompt: 'help my client got shot', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 109, prompt: 'my patient was stabbed by an intruder', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 110, prompt: 'i hear gunshots outside the patients house', accept: ['IMMEDIATE_DANGER'], urgent: true },
  { id: 111, prompt: 'there was a drive by at my clients home', accept: ['IMMEDIATE_DANGER'], urgent: true },
  // Non-regression: vaccinations and radiating pain are never violence.
  { id: 112, prompt: 'i gave the patient his flu shot today, where do i document it', accept: ['GENERAL'], urgent: false },
  { id: 113, prompt: 'patient reports shooting pain down her left leg', accept: ['GENERAL', 'CLINICAL_EMERGENCY'], urgent: false },
];
