/* Acceptance tests — Nolan tutor (Nurse Onboarding & Learning Assistant).
   Deterministic Training-module chatbot: catalog-grounded, safety-first,
   compliance questions referred to Brad, honest fallback. */

import { describe, it, expect } from 'vitest';
import {
  composeNolanTutorAnswer,
  NOLAN_IDENTITY_ANSWER,
  NOLAN_TUTOR_FALLBACK,
  NOLAN_TUTOR_SYSTEM_PROMPT,
} from '../../../server/ia/nolan/nolanTutorResponder';
import { moduleById } from './data/modules';

const BANNED_CLAIMS = [/\bclaude\b/i, /\bchatgpt\b/i, /\bgemini\b/i, /\bLLM\b/, /language model/i, /i am (a )?human/i];
const BANNED_COMPLETION_WORDS = /\b(attest\w*|acknowledg\w*|signed.off|sign.off|certif\w*)\b/i;

describe('composeNolanTutorAnswer — routing', () => {
  it('URGENT SAFETY FIRST: danger typed into the tutor gets safety guidance, never catalog search', () => {
    const a = composeNolanTutorAnswer('help my client got shot');
    expect(a.path).toBe('urgent-passthrough');
    expect(a.text).toMatch(/911/);
    expect(a.text.split('\n')[0]).toMatch(/your safety/i);
  });

  it('identity: "who are you" / "what does nolan stand for" answer as Nolan', () => {
    for (const q of ['who are you?', 'what does Nolan stand for?', 'are you Brad?', 'what can you do?']) {
      const a = composeNolanTutorAnswer(q);
      expect(a.path, q).toBe('identity');
      expect(a.text, q).toBe(NOLAN_IDENTITY_ANSWER);
      expect(a.text).toContain('Nurse Onboarding & Learning Assistant');
    }
  });

  it('module by id: GAO-012 answer reflects the LIVE catalog (title, threshold, policy refs)', () => {
    const m = moduleById('GAO-012');
    expect(m).toBeDefined();
    const a = composeNolanTutorAnswer('what is GAO-012 about?');
    expect(a.path).toBe('module');
    expect(a.matched).toBe(true);
    expect(a.moduleIds).toEqual(['GAO-012']);
    expect(a.text).toContain(`GAO-012 — ${m!.title}`);
    if (m!.passThreshold) expect(a.text).toContain(`pass ≥ ${Math.round(m!.passThreshold * 100)}%`);
    for (const ref of m!.policyRefs) expect(a.text).toContain(ref);
  });

  it('unknown module id is honest, with format hints', () => {
    const a = composeNolanTutorAnswer('tell me about GAO-099');
    expect(a.matched).toBe(false);
    expect(a.text).toContain('GAO-099');
    expect(a.text).toMatch(/GAO-001 through GAO-027/);
  });

  it('role map: "what modules does an RN need" summarizes the RN journey', () => {
    const a = composeNolanTutorAnswer('what modules does an RN need?');
    expect(a.path).toBe('role-map');
    expect(a.text).toMatch(/RN journey/);
    expect(a.text).toMatch(/General Agency Orientation: 2\d modules/);
    expect(a.moduleIds.length).toBeGreaterThan(0);
    expect(a.moduleIds[0]).toMatch(/^RN-/);
  });

  it('role map without a role asks which role instead of falling through', () => {
    const a = composeNolanTutorAnswer('what modules do I need to take?');
    expect(a.path).toBe('role-map');
    expect(a.text).toMatch(/Which role are you/);
  });

  it('logistics: quiz failure rules state 80% / 3-business-day retake / 3 attempts', () => {
    const a = composeNolanTutorAnswer('what happens if I fail the quiz?');
    expect(a.path).toBe('logistics');
    expect(a.text).toContain('80%');
    expect(a.text).toMatch(/3-business-day/);
    expect(a.text).toMatch(/3 attempts/);
  });

  it('compliance territory refers warmly to Brad', () => {
    // Note: "how do I file an incident report" deliberately routes urgent-passthrough
    // (Brad's reportable-incident guidance) — tested separately above.
    for (const q of ['where is the HIPAA policy?', 'what forms go in the admission packet?', 'show me workflow QA-WF-03 steps']) {
      const a = composeNolanTutorAnswer(q);
      expect(a.path, q).toBe('brad-referral');
      expect(a.text, q).toMatch(/Brad/);
    }
  });

  it('gibberish gets the honest catalog fallback', () => {
    const a = composeNolanTutorAnswer('zxcv qwerty asdf');
    expect(a.matched).toBe(false);
    expect(a.text).toBe(NOLAN_TUTOR_FALLBACK);
    expect(a.text).toMatch(/\d+ modules/);
  });
});

describe('composeNolanTutorAnswer — lesson context & personalization', () => {
  const LESSON = {
    moduleId: 'GAO-016',
    lessonTitle: 'Personal Safety During Home Visits',
    learnerName: 'Maria Lopez',
    lessonText: [
      'Always park in a well-lit area facing the direction of exit, and keep your phone charged before every visit.',
      'If a visit environment feels unsafe at any point, leave first and call your supervisor from a safe location.',
      'The buddy-visit protocol pairs two clinicians for locations flagged in the safety assessment.',
      'Report every safety concern through the incident process the same day it happens.',
    ].join(' '),
  };

  it('answers a clarifying question by quoting THIS lesson', () => {
    const a = composeNolanTutorAnswer('what does the buddy visit protocol mean?', LESSON);
    expect(a.path).toBe('lesson-clarify');
    expect(a.matched).toBe(true);
    expect(a.text).toContain('Personal Safety During Home Visits');
    expect(a.text).toContain('buddy-visit protocol pairs two clinicians');
    expect(a.moduleIds).toEqual(['GAO-016']);
  });

  it('is honest when the lesson does not cover the question — and never blocks', () => {
    const a = composeNolanTutorAnswer('how do quasars emit radiation?', LESSON);
    expect(a.path).toBe('lesson-clarify');
    expect(a.matched).toBe(false);
    expect(a.text).toMatch(/didn’t find that covered/);
    expect(a.text).toMatch(/won’t block you/);
  });

  it('precise intents still outrank lesson retrieval (module id, urgent safety)', () => {
    const mod = composeNolanTutorAnswer('what is GAO-012 about?', LESSON);
    expect(mod.path).toBe('module');
    const urgent = composeNolanTutorAnswer('help my client got shot', LESSON);
    expect(urgent.path).toBe('urgent-passthrough');
  });

  it('greets the learner by first name; identity text stays canonical', () => {
    const hi = composeNolanTutorAnswer('hi nolan', LESSON);
    expect(hi.text).toMatch(/^Hey Maria!/);
    const who = composeNolanTutorAnswer('who are you?', LESSON);
    expect(who.text).toBe(NOLAN_IDENTITY_ANSWER);
  });

  it('"what\'s next" uses role + completed modules when provided', () => {
    const a = composeNolanTutorAnswer('whats next for me?', {
      role: 'RN',
      completedModuleIds: ['GAO-001', 'GAO-002'],
    });
    expect(a.path).toBe('whats-next');
    expect(a.text).toMatch(/RN journey/);
    expect(a.text).toMatch(/GAO-003/);
  });

  it('"what\'s next" without context asks for the role instead of guessing', () => {
    const a = composeNolanTutorAnswer('what should I do next?');
    expect(a.path).toBe('whats-next');
    expect(a.text).toMatch(/Tell me your role/);
  });
});

describe('composeNolanTutorAnswer — personal plan (deadlines from first day)', () => {
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
  const daysFromNow = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();

  it('new hire on day 2: orientation due by day 5, role track, policies to read', () => {
    const a = composeNolanTutorAnswer('what do I need to complete?', {
      role: 'RN', learnerName: 'Maria Lopez', startDateIso: daysAgo(1), completedModuleIds: ['GAO-001'],
    });
    expect(a.path).toBe('my-plan');
    expect(a.text).toMatch(/day 2 of your journey/);
    expect(a.text).toMatch(/ORIENTATION — due by day 5/);
    expect(a.text).not.toMatch(/past the window/);
    expect(a.text).toMatch(/POLICIES TO READ/);
    expect(a.text).not.toContain('GAO-001 —'); // completed module not listed as due
  });

  it('day 12 with GAO unfinished: overdue orientation flagged, week-2 track due with dates', () => {
    const a = composeNolanTutorAnswer('am I behind on my deadlines?', {
      role: 'RN', startDateIso: daysAgo(11), completedModuleIds: [],
    });
    expect(a.path).toBe('my-plan');
    expect(a.text).toMatch(/past the window/);
    expect(a.text).toMatch(/RN TRACK — due now \(you're in week 2\)/);
    expect(a.text).toMatch(/due \w{3} \d{1,2}, \d{4}/); // real dates rendered
  });

  it('annual requirements section cites HR-TD-001 and Dec 31', () => {
    const a = composeNolanTutorAnswer('what annual training do I need?', {
      role: 'RN', startDateIso: daysAgo(200), completedModuleIds: [],
    });
    expect(a.path).toBe('my-plan');
    expect(a.text).toMatch(/ANNUAL REQUIREMENTS — due Dec 31/);
    expect(a.text).toContain('HR-TD-001');
  });

  it('expiring license and uncleared Appendix F surface as document flags', () => {
    const a = composeNolanTutorAnswer('anything expiring I should know about?', {
      role: 'HHA', startDateIso: daysAgo(30),
      licenseExpiryIso: daysFromNow(45), appendixFCleared: false, completedModuleIds: [],
    });
    expect(a.path).toBe('my-plan');
    expect(a.text).toMatch(/License expires .* 4[45] days out/);
    expect(a.text).toContain('HR-TA-004');
    expect(a.text).toMatch(/Appendix F .*(isn’t|not).*cleared/i);
    expect(a.text).toContain('HR-TA-001');
  });

  it('without role/first-day context it asks instead of guessing', () => {
    const a = composeNolanTutorAnswer('what are my deadlines?');
    expect(a.path).toBe('my-plan');
    expect(a.text).toMatch(/need to know your role/);
  });

  it('"what\'s next" one-liner still wins over the full plan', () => {
    const a = composeNolanTutorAnswer('what should I do next?', { role: 'RN', startDateIso: daysAgo(1) });
    expect(a.path).toBe('whats-next');
  });
});

describe('composeNolanTutorAnswer — wording guardrails', () => {
  const SAMPLES = [
    'who are you?', 'hi nolan', 'thanks!', 'what is GAO-012 about?',
    'what modules does an HHA need?', 'what happens if I fail the quiz?',
    'where is the HIPAA policy?', 'zxcv qwerty asdf',
  ];

  it('never claims to be another model/provider or human; never uses attestation wording', () => {
    for (const q of SAMPLES) {
      const a = composeNolanTutorAnswer(q);
      for (const re of BANNED_CLAIMS) expect(a.text, `${q} :: ${re}`).not.toMatch(re);
      expect(a.text, q).not.toMatch(BANNED_COMPLETION_WORDS);
    }
    expect(NOLAN_TUTOR_SYSTEM_PROMPT).toContain('NEVER say or imply you are Claude');
  });
});
