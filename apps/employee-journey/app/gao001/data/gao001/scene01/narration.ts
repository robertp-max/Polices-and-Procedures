/**
 * GAO-001 Scene 1 narration catalog.
 *
 * Folder layout (public):
 *   public/training/gao-001/audio/scene-01/
 *     scene-start.wav
 *     scene-complete.wav
 *     overlays/
 *       email.wav
 *       checklist.wav
 *       packet.wav
 *       badge.wav
 *       notebook.wav
 *     generation-results.json
 *
 * Transcript text is authoritative. Audio files are replaceable.
 * No PHI. No attestation wording. Supports the scene; not competency evidence.
 */

export const GAO001_S01_AUDIO_BASE =
  '/training/gao-001/audio/scene-01';

export type Gao001S01ClipId =
  | 'scene-start'
  | 'scene-complete'
  | 'overlay.email'
  | 'overlay.checklist'
  | 'overlay.packet'
  | 'overlay.badge'
  | 'overlay.notebook';

export interface Gao001S01NarrationClip {
  id: Gao001S01ClipId;
  /** Public site-root path to the wav */
  src: string;
  /** Authoritative transcript (Alex / storyboard wording) */
  transcript: string;
  title: string;
}

const overlay = (name: string) => `${GAO001_S01_AUDIO_BASE}/overlays/${name}.wav`;

export const GAO001_S01_CLIPS: Record<Gao001S01ClipId, Gao001S01NarrationClip> = {
  'scene-start': {
    id: 'scene-start',
    src: `${GAO001_S01_AUDIO_BASE}/scene-start.wav`,
    title: 'Scene narration',
    transcript:
      'Welcome to Care Indeed Home Health Care.\n\n' +
      'Today is Alex’s first day — and this is the beginning of your journey, too.\n\n' +
      'Alex sits down at their desk, logs in, and sees a new message waiting in the inbox. The subject line reads: “Welcome to Care Indeed Home Health Care.”\n\n' +
      'But this is more than a welcome message. Alex is joining a Medicare-certified, ACHC-accredited home health agency. That means every person on the team — clinical and non-clinical — carries real responsibility for patient safety, regulatory compliance, and the trust that patients, families, physicians, and surveyors place in us.\n\n' +
      'In this module, you will walk alongside Alex as they begin onboarding. Together, you will see what your week — and Alex’s typical week — might look like at Care Indeed Home Health Care.\n\n' +
      'You will learn what the agency mission means in everyday work, how our vision shows up in patient care, how our core values become real behavior, and how home health is different from working in a facility.\n\n' +
      'You will also learn why accurate documentation matters, when to escalate concerns, how to recognize risks, and why survey readiness starts on day one — not when a surveyor arrives.\n\n' +
      'Before Alex steps into a patient’s home, they need to understand the standards, the expectations, and the reasons behind them. And so do you.\n\n' +
      'What you learn today will shape how you care for patients, how you protect yourself, and how you help protect the agency — every visit, every note, every decision.\n\n' +
      'Let’s begin Alex’s first week at Care Indeed Home Health Care.',
  },
  'scene-complete': {
    id: 'scene-complete',
    src: `${GAO001_S01_AUDIO_BASE}/scene-complete.wav`,
    title: 'Scene complete',
    transcript:
      'Alex closes the folder. Three things are different now than they were ten minutes ago: ' +
      'Alex has read what this agency is and what it expects, has a badge with a face on it, and has a map of the nine things this first week needs to cover. ' +
      "What just happened here gets documented as completed orientation in Alex's personnel file — a record of training; " +
      'the formal policy acknowledgment assignment comes separately, later. Orientation Practice Complete. ' +
      'Later today, Dana is going to sit down with Alex and go through the mission statement itself, line by line, with real examples from the field.',
  },
  'overlay.email': {
    id: 'overlay.email',
    src: overlay('email'),
    title: 'Welcome email',
    transcript:
      'Care Indeed Home Health Care is Medicare-certified and ACHC-accredited, which means the agency operates under federal Conditions of Participation ' +
      'and is reviewed against national home health standards. Every employee — clinical and non-clinical — carries a share of responsibility for patient safety ' +
      'and regulatory compliance, starting today. Two things matter beyond this week: during a survey, a CMS or ACHC reviewer may ask any employee — not just clinicians — ' +
      "to explain what the agency's mission means in their own words, to show it actually shapes real decisions rather than something recited from memory. " +
      "And completing this training is documented in Alex's personnel file as a record of competency orientation — evidence of training completed. " +
      'Formal policy acknowledgment remains a separate assigned activity.',
  },
  'overlay.checklist': {
    id: 'overlay.checklist',
    src: overlay('checklist'),
    title: 'Orientation checklist',
    transcript:
      "This checklist maps the nine things Alex needs to understand before stepping into a patient's home: mission, vision, and values; " +
      "the agency's Medicare-certified and ACHC-accredited status; awareness of the Conditions of Participation; role responsibilities; " +
      'documentation and escalation expectations; and a survey-readiness mindset, plus a look at the training path ahead. ' +
      "Each item becomes its own scene this week — and everything Alex does with this list stays in Alex's personnel file as a record of orientation completed. " +
      'Formal policy acknowledgment is a separate assigned activity that happens later.',
  },
  'overlay.packet': {
    id: 'overlay.packet',
    src: overlay('packet'),
    title: 'Orientation packet',
    transcript:
      'These orientation materials guide your first week. They cover critical reporting protocols and escalation pathways so you know when to call your supervisor, ' +
      'how concerns move up the chain, and how to keep patients safe when something unexpected happens in the home.',
  },
  'overlay.badge': {
    id: 'overlay.badge',
    src: overlay('badge'),
    title: 'ID badge',
    transcript:
      "This badge is the first piece of trust Care Indeed extends to Alex — it's what patients and families will see at the door before they know anything else about Alex's skills. " +
      'Alex will wear this into every home visit this week. Visible identification builds trust and is a basic safety expectation in the field.',
  },
  'overlay.notebook': {
    id: 'overlay.notebook',
    src: overlay('notebook'),
    title: 'Field notebook',
    transcript:
      'Use your field notebook to document facts, not assumptions, during patient visits. ' +
      'Write what you saw, what the patient said, and when it happened — so the record stays clear, objective, and defensible if a surveyor or supervisor reviews it later.',
  },
};

/** Hotspot id → overlay clip */
export const GAO001_S01_OVERLAY_BY_HOTSPOT: Record<string, Gao001S01NarrationClip> = {
  email: GAO001_S01_CLIPS['overlay.email'],
  checklist: GAO001_S01_CLIPS['overlay.checklist'],
  packet: GAO001_S01_CLIPS['overlay.packet'],
  badge: GAO001_S01_CLIPS['overlay.badge'],
  notebook: GAO001_S01_CLIPS['overlay.notebook'],
};

/** Shell / LMS card location for Scene 1 delivery */
export const GAO001_S01_SHELL_LOCATION = 'GAO-001.lesson.l1.delivery';

export const GAO001_S01_NARRATION_LABELS = {
  listen: 'Listen to narration',
  pause: 'Pause narration',
  replay: 'Replay narration',
  transcript: 'Transcript',
  mute: 'Mute',
  unmute: 'Unmute',
  audioUnavailable: 'Audio unavailable. Read the transcript below.',
} as const;

/** Backward-compatible exports used by earlier wiring */
export const GAO001_SCENE01_NARRATION_SRC = GAO001_S01_CLIPS['scene-start'].src;
export const GAO001_SCENE01_NARRATION_TRANSCRIPT = GAO001_S01_CLIPS['scene-start'].transcript;
export const GAO001_SCENE01_NARRATION = {
  src: GAO001_SCENE01_NARRATION_SRC,
  transcript: GAO001_SCENE01_NARRATION_TRANSCRIPT,
  labels: GAO001_S01_NARRATION_LABELS,
} as const;
