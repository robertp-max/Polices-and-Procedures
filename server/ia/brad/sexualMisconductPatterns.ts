/* ═══════════════════════════════════════════════════════════════════════════
   Patient-originated sexual misconduct — shared detection (single source).
   ----------------------------------------------------------------------------
   A staff member asking how to handle sexual advances, comments, harassment,
   inappropriate touching, exposure, or boundary violations from a PATIENT is a
   staff-safety / workplace-violence question. Brad must answer it with practical,
   protective, policy-grounded guidance — never the generic "not enough internal
   policy context" fallback.

   Two tiers, so Brad answers at the right altitude:
     • SEXUAL_ASSAULT_RE     — physical sexual contact / assault → trauma-informed
                               `sexual_assault` incident profile (immediate safety).
     • SEXUAL_HARASSMENT_RE  — non-contact advances / comments / harassment /
                               exposure / boundary issues → `sexual_harassment`
                               profile (calm boundary script + escalation).

   Consumers:
     • scenarioClassifier.ts  — PATIENT_SEXUAL_MISCONDUCT_RE routes EITHER tier to
                                CLINICIAN_SAFETY so the message is treated as urgent
                                (suppressNoAnswer → never the cold fallback).
     • bradIncidentProfiles.ts — detectIncidentProfile() splits the two tiers.

   Keep this module dependency-free (no imports) so it can be shared by both the
   classifier and the brad/ writers without an import cycle.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Physical sexual contact / assault by a patient → trauma-informed response. */
export const SEXUAL_ASSAULT_RE =
  /\b(sexual(ly)?\s+assault\w*|sexually\s+assaulted|raped?\b|\brape\b|molest\w*|grop\w*|fondl\w*|forced\s+(him|her|them)self\s+on\s+me|inappropriate(ly)?\s+touch\w*|touch(ed|ing)?\s+me\s+(inappropriately|sexually)|grabbed\s+(my|me\s+by\s+the)\s+(breast\w*|chest|butt|behind|crotch|groin|genital\w*|privates?))\b/i;

/** Non-contact sexual advances / comments / harassment / exposure / boundary. */
export const SEXUAL_HARASSMENT_RE =
  /\b(sexual\s+(advance\w*|comment\w*|remark\w*|joke\w*|gesture\w*|innuendo\w*|favor\w*|propos\w*|harass\w*|content|text\w*|message\w*|pressure)|sexually\s+(harass\w*|suggestive|explicit|inappropriate)|sexual\s+harassment|(make|makes|making|made)\s+(sexual\s+)?advances?|hit(ting)?\s+on\s+me|came?\s+on(to)?\s+me|coming\s+on(to)?\s+me|flirt\w*|proposition\w*|ask\w*\s+me\s+(out|for\s+sex|to\s+have\s+sex|for\s+a\s+date)|wants?\s+(to\s+have\s+)?sex\s+with\s+me|expose[sd]?\s+(him|her|them)self|exposed\s+themselves|indecent\s+expos\w*|flash\w*\s+me|inappropriate(ly)?\s+(sexual|comment\w*|remark\w*|advance\w*|behavior|conduct|propos\w*|joke\w*)|crossed?\s+(a\s+|the\s+)?(professional\s+)?(line|boundar\w*)|(professional|sexual)\s+boundar\w*|say\s+no\s+to[^.]{0,30}(sexual|advance))\b/i;

/** Either tier — used by the classifier to route to CLINICIAN_SAFETY (urgent). */
export const PATIENT_SEXUAL_MISCONDUCT_RE = new RegExp(
  `${SEXUAL_ASSAULT_RE.source}|${SEXUAL_HARASSMENT_RE.source}`,
  'i',
);

/** Capture words surfaced as matched signals in diagnostics. */
export const SEXUAL_MISCONDUCT_CAPTURE_RE =
  /\b(sexual\w*|advances?|harass\w*|inappropriate\w*|flirt\w*|propos\w*|expose\w*|exposed|boundar\w*|touched|grop\w*|fondl\w*|molest\w*|assault\w*)\b/gi;
