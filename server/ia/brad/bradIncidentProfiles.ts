import type { IncidentRoute } from './criticalIncidentRouter.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad incident profiles — situation-specific, trauma-informed writer.
   ----------------------------------------------------------------------------
   The scenario playbooks are broad on purpose (they list every branch of a
   category). Dumping a whole playbook into a chat reply makes Brad robotic and
   contaminates a specific crisis with irrelevant branches (car accidents,
   needle sticks, impaired staff, missed visits…).

   This module composes a FOCUSED answer from only the procedures relevant to
   the detected situation, and — for traumatic events (sexual assault, violence,
   death, serious injury) — leads with empathy and an immediate safety check
   before any administrative steps (progressive disclosure).

   Rules honored here:
     • Acknowledge what the person said first; establish safety.
     • Never say a notification was performed (it wasn't) — instruct the user to
       contact their supervisor. See bradNotification.ts for truthful automation.
     • Exactly one immediate follow-up safety question.
     • No "don't worry", no cold policy preamble, no promises the system can't keep.
     • No unrelated route fragments.
   ═══════════════════════════════════════════════════════════════════════════ */

export type IncidentProfileId =
  | 'sexual_assault'
  | 'violence_threat'
  | 'unsafe_environment'
  | 'patient_death'
  | 'patient_clinical'
  | 'patient_injury'
  | 'worker_injury'
  | 'suspected_abuse'
  | 'privacy_incident'
  | 'reportable_incident';

const SEXUAL_ASSAULT =
  /\b(sexual(ly)?\s+assault\w*|sexually\s+assaulted|raped?\b|\brape\b|molest\w*|grop\w*|fondl\w*|forced\s+(him|her|them)self\s+on\s+me|inappropriate(ly)?\s+touch\w*|touched\s+me\s+(inappropriately|sexually))\b/i;

const WORKER_INJURY_SELF =
  /\b(needle[- ]?stick|stuck\s+(myself|me)\s+with|sharps?\s+injur\w*|blood\s+exposure|body\s+fluid\s+exposure|i\s+(cut|burned|hurt|injured)\s+(myself|my)\b)/i;

const DEATH_WORDS = /\b(dead|died|deceased|passed away|lifeless|no pulse|pulseless)\b/i;
const PREGNANCY = /\b(pregnan\w*|i (might|may) be pregnant|keeping the baby|the baby)\b/i;

/** Decide the specific incident profile for an urgent route (null → use playbook). */
export function detectIncidentProfile(text: string, route: IncidentRoute): IncidentProfileId | null {
  const t = text ?? '';
  if (SEXUAL_ASSAULT.test(t)) return 'sexual_assault';

  switch (route.track) {
    case 'DEATH_OR_UNRESPONSIVE':
      return DEATH_WORDS.test(t) ? 'patient_death' : 'patient_clinical';
    case 'CLINICAL_EMERGENCY':
      return 'patient_clinical';
    case 'IMMEDIATE_DANGER':
      return 'violence_threat';
    case 'UNSAFE_ENVIRONMENT':
      return 'unsafe_environment';
    case 'SERIOUS_INJURY':
      return WORKER_INJURY_SELF.test(t) || route.category === 'CLINICIAN_SAFETY' ? 'worker_injury' : 'patient_injury';
    case 'SUSPECTED_MISTREATMENT':
      return 'suspected_abuse';
    case 'PRIVACY_SECURITY':
      return 'privacy_incident';
    case 'REPORTABLE_INCIDENT':
      return 'reportable_incident';
    default:
      return null;
  }
}

/** Compose the focused, situation-specific answer body (references attached by caller). */
export function composeIncidentAnswer(profile: IncidentProfileId, text: string): string {
  switch (profile) {
    case 'sexual_assault': {
      const pregnant = PREGNANCY.test(text);
      const ack = pregnant
        ? 'You’re telling me you were sexually assaulted during a visit and may be pregnant. I’m so sorry this happened, and I’m here to help you. First, are you somewhere safe right now?'
        : 'You’re telling me you were sexually assaulted during a visit. I’m so sorry this happened, and I’m here to help you. First, are you somewhere safe right now?';
      const safety =
        'If you aren’t safe, move away from the client and call 911 as soon as you can. Do not return to the home or continue the visit.';
      const care = pregnant
        ? 'Please seek urgent medical care today, and tell the clinician that you were sexually assaulted and may be pregnant so they can discuss your care and the options available to you.'
        : 'Please seek urgent medical care today, and tell the clinician that you were sexually assaulted so they can give you the right care.';
      const report =
        'Contact your supervisor immediately and complete the workplace-violence or incident report. Preserve clothing, messages, photographs, or anything else that could be evidence if you can do so safely — but your safety and medical care come first.';
      const close =
        'Do not contact or confront the client yourself, and do not return to the home unless leadership confirms it’s safe. You did the right thing by reaching out, and you don’t have to handle this alone.';
      return [ack, safety, `${care} ${report}`, close].join('\n\n');
    }

    case 'violence_threat':
      return [
        'It sounds like you’re in danger, and your safety is what matters most right now.',
        'If there’s an active threat, a weapon, or you’ve been hurt, call 911 now. Get out of the home and to a safe place — don’t stay to argue with or try to calm the person down.',
        'Once you’re safe, contact your supervisor or Administrator immediately. If you were injured, get medical care and report it as a workplace injury, and complete the workplace-violence or incident report with the objective facts — what happened, when, where, and who was involved.',
        'Don’t go back into the home or continue the visit until leadership confirms it’s safe. Are you somewhere safe right now?',
      ].join('\n\n');

    case 'unsafe_environment':
      return [
        'Trust your instincts — if a visit doesn’t feel safe, your safety comes first.',
        'Leave now and get to a safe place. If anyone threatens you, there’s a weapon, or you can’t leave safely, call 911.',
        'Once you’re clear, contact your supervisor right away and tell them what made the visit unsafe. Complete an incident/safety report with the objective details so the home can be reassessed before anyone returns.',
        'Don’t go back in or continue the visit until it’s been reassessed and you’re cleared. Are you safe and away from the home right now?',
      ].join('\n\n');

    case 'patient_death':
      return [
        'I’m sorry — that’s a lot to walk into. Let’s take the right steps together.',
        'Call 911 now if you haven’t already, and make sure the scene is safe. Don’t move the patient or disturb anything unless 911 directs you to for life-saving care — you can’t pronounce death, EMS or law enforcement does that.',
        'Notify your supervisor/DON/Administrator right away, stay available for EMS, and write down the objective facts — when you arrived, what you found, who you contacted, and the times. This will be reviewed as a serious event.',
        'Don’t speculate about the cause or write conclusions in your notes. Are you safe, and have you called 911?',
      ].join('\n\n');

    case 'patient_clinical':
      return [
        'Let’s get help to your patient right now.',
        'Call 911 immediately and stay on the line. If the patient is unresponsive or not breathing, begin CPR/BLS within your scope. You can’t pronounce death — EMS handles that.',
        'Notify the physician and your supervisor/DON as soon as you can, and note the exact times. Document what you saw, what you did, and who you notified, in real time. If the patient refuses care, urge them, don’t force it, and document the refusal.',
        'Don’t delay calling 911 to make other calls first. Have you called 911 and is help on the way?',
      ].join('\n\n');

    case 'patient_injury':
      return [
        'Let’s make sure your patient is okay.',
        'If they hit their head, are on blood thinners, have severe pain or bleeding, or any major change, call 911. Don’t move them if a serious injury is possible unless they’re in immediate danger.',
        'Assess for injury, notify the physician and your supervisor, and document the objective facts in real time — what happened, the time, what you observed, and who you notified. Open an incident report.',
        'Don’t guess at a diagnosis or write conclusions — record what you actually observed. Is the patient stable right now, or do you need to call 911?',
      ].join('\n\n');

    case 'worker_injury':
      return [
        'Let’s take care of you first — your health comes before the paperwork.',
        'If this is serious or you can’t safely continue, call 911 or get to urgent care. For a needle stick or blood/body-fluid exposure, wash the area right away and start the exposure protocol.',
        'Notify your supervisor immediately and get the medical evaluation your exposure/injury protocol requires. Complete the employee injury / workplace incident report and note the time and what happened; workers’ comp and OSHA recording may apply.',
        'Don’t just finish the visit and deal with it later — report it and get evaluated now. Are you okay, or do you need urgent medical care right now?',
      ].join('\n\n');

    case 'suspected_abuse':
      return [
        'A patient who may be experiencing abuse is an urgent, mandatory-reporting situation — we report it, we don’t investigate it ourselves.',
        'If the patient is in immediate danger, call 911 first and make sure they’re safe.',
        'Notify your supervisor, the Administrator/DON, and the Compliance Officer immediately, and report to Adult Protective Services (APS) within your state’s required window. Document only what you objectively saw or heard — facts and direct quotes, no conclusions about fault — and open an incident report. Don’t question the patient or the person involved; that isn’t your investigation to run, and preserve anything relevant.',
        'Is the patient safe right now?',
      ].join('\n\n');

    case 'privacy_incident':
      return [
        'Let’s contain this right away — we can handle it.',
        'Stop the disclosure if it’s still happening and secure the device or account. Don’t delete or alter anything — those records are part of the review.',
        'Notify your supervisor and the Privacy/Compliance Officer immediately and open a privacy incident report. Write down exactly what was shared, with whom, when, and what you’ve done to contain it.',
        'Don’t try to “fix” it by deleting messages or files, and don’t keep using a compromised device. Have you been able to contain it, and have you told your Privacy/Compliance Officer?',
      ].join('\n\n');

    case 'reportable_incident':
      return [
        'Thanks for flagging this — reporting it is the right call, and catching it early matters.',
        'First, make sure the patient is safe. If there’s any sign of harm, assess them, call 911 if needed, and notify the physician.',
        'Contact your supervisor right away and document the objective facts in real time — what happened, the time, and what you did. Complete the incident / adverse-event report, and don’t conceal or delay it; it will be reviewed through QAPI for any corrective action.',
        'Don’t alter or back-date any records. Is the patient okay right now?',
      ].join('\n\n');
  }
}
