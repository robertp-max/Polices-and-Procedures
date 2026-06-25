// Authored, course-extension remediation overrides keyed by challenge id.
//
// These are drafted teaching extensions, NOT an answer-key reveal. They never
// contain internal scoring language. SME/source review still applies to the
// underlying clinical content (e.g. Module 1 infection control). When an
// override is absent, remediation.ts derives polished copy from the lesson data.

export type OptionOverride = { why?: string; remember?: string };

export type RemediationOverride = {
  safetyPrinciple?: string;
  whySafest?: string;
  cnaScopeNote?: string;
  residentSafetyNote?: string;
  whatToRemember?: string;
  options?: Record<string, OptionOverride>;
  narration?: string;
  transcript?: string;
};

export const remediationOverrides: Record<string, RemediationOverride> = {
  // Module 1 · Lesson 1 — Why Infection Control Matters (hand hygiene).
  // Clinical content remains flagged for SME/source review.
  Q01: {
    safetyPrinciple:
      "Infection prevention starts with the action that breaks the chain of transmission for every resident, not just the ones who look sick. Hand hygiene, done correctly and at the right moments, is that action.",
    whySafest:
      "Hand hygiene performed correctly and at the right times is the single most effective way to prevent the spread of infection in long-term care. Hands are the main way germs travel between residents, surfaces, and you, so clean hands before and after every contact stop transmission at its most common point.",
    cnaScopeNote:
      "Performing hand hygiene at the right moments is squarely within CNA scope. You are expected to clean your hands before and after resident contact, after removing gloves, and after contact with body fluids or contaminated surfaces.",
    residentSafetyNote:
      "Every resident is protected when you clean your hands at the right times. This is also how you protect yourself, your coworkers, and residents who cannot fight infection well.",
    whatToRemember:
      "Gloves, masks, and isolation all have a place, but none of them replace hand hygiene. Clean hands at the right moments are your strongest, most reliable infection-control tool on every shift.",
    options: {
      A: {
        why: "Gloves are useful, but wearing them for all contact does not replace hand hygiene. Germs reach the skin when gloves are removed or reused, and gloves give a false sense of safety if hands are not cleaned before and after.",
        remember: "Always perform hand hygiene before applying and after removing gloves — gloves are an addition to clean hands, not a substitute.",
      },
      B: {
        why: "Hand hygiene performed correctly and at the right times is the single most effective measure for preventing the spread of infection, because hands are the most common way germs move between residents and surfaces.",
        remember: "Make correct, well-timed hand hygiene your automatic first infection-control habit on every shift.",
      },
      C: {
        why: "A surgical mask protects against certain droplet exposures but does nothing about germs carried on the hands, which cause most transmission in long-term care. Routine masking for all care is not the most effective general measure.",
        remember: "Use masks when the situation or precautions call for them — they support, but never replace, hand hygiene.",
      },
      D: {
        why: "Isolating residents with known infections is only part of the picture. Many residents carry germs without obvious signs, so relying on isolation alone misses the everyday transmission that hand hygiene prevents.",
        remember: "Standard precautions and hand hygiene apply to every resident, not only those already known to be infected.",
      },
    },
  },
};
