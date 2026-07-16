import {
  classifyScenario,
  getPlaybook,
  type ScenarioCategory,
  type ScenarioMapping,
} from '../scenarioClassifier.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Critical-incident intent router.
   ----------------------------------------------------------------------------
   A GENERAL, deterministic urgent-event router that runs BEFORE the normal
   internal-policy retrieval fallback. Brad must never demand perfect retrieval
   before giving immediate, safety-first guidance.

   Two stages:
     1. PRECISE — the scenario classifier (rich playbooks). If it matches a
        high-stakes scenario, use it.
     2. SAFETY NET — a broad, high-recall second-chance scan that catches urgent
        phrasing the precise patterns miss (messy/short/typo'd/stressed wording)
        and maps it to the closest playbook category.

   Every message lands on exactly one of these broad tracks. Tracks 1–7 (+ the
   privacy/security track) are URGENT: they must always get real guidance, never
   the generic "not enough internal context" fallback. NO internet is ever used
   on this path — public research is a separate, PHI-guarded capability.
   ═══════════════════════════════════════════════════════════════════════════ */

export type IncidentTrack =
  | 'IMMEDIATE_DANGER'        // 1 — active threat / violence / weapon
  | 'SERIOUS_INJURY'         // 2 — injury or possible injury
  | 'DEATH_OR_UNRESPONSIVE'  // 3 — death / unresponsive / life-threatening
  | 'UNSAFE_ENVIRONMENT'     // 4 — unsafe visit environment
  | 'SUSPECTED_MISTREATMENT' // 5 — abuse / neglect / exploitation / rights
  | 'REPORTABLE_INCIDENT'    // 6 — incident / adverse / sentinel / compliance
  | 'CLINICAL_EMERGENCY'     // 7 — EMS / urgent clinical escalation
  | 'PRIVACY_SECURITY'       // privacy / security incident
  | 'GENERAL';               // 8 — no immediate danger

const URGENT_TRACKS = new Set<IncidentTrack>([
  'IMMEDIATE_DANGER', 'SERIOUS_INJURY', 'DEATH_OR_UNRESPONSIVE', 'UNSAFE_ENVIRONMENT',
  'SUSPECTED_MISTREATMENT', 'REPORTABLE_INCIDENT', 'CLINICAL_EMERGENCY', 'PRIVACY_SECURITY',
]);

export interface IncidentRoute {
  track: IncidentTrack;
  /** Playbook category to source guidance + references from. */
  category: ScenarioCategory;
  /** True for the urgent tracks — must never receive the generic fallback. */
  urgent: boolean;
  /** Life-safety → lead with 911. */
  lifeSafety: boolean;
  matchedSignals: string[];
  /** How the route was decided. */
  source: 'classifier' | 'router' | 'none';
  /** Playbook used (precise mapping when classifier matched, else category playbook). */
  mapping: ScenarioMapping;
}

/* Map a precise scenario category → broad track (for reporting + UI hinting). */
function categoryToTrack(c: ScenarioCategory): IncidentTrack {
  switch (c) {
    case 'SENTINEL_EVENT_CRITICAL': return 'DEATH_OR_UNRESPONSIVE';
    case 'PATIENT_SAFETY_EMERGENCY': return 'CLINICAL_EMERGENCY';
    case 'CLINICIAN_SAFETY': return 'IMMEDIATE_DANGER';
    case 'ABUSE_NEGLECT': return 'SUSPECTED_MISTREATMENT';
    case 'PRIVACY_BREACH': return 'PRIVACY_SECURITY';
    case 'CYBERSECURITY_INCIDENT': return 'PRIVACY_SECURITY';
    case 'ADVERSE_EVENT': return 'REPORTABLE_INCIDENT';
    case 'COMPLIANCE_VIOLATION': return 'REPORTABLE_INCIDENT';
    case 'BILLING_RISK': return 'REPORTABLE_INCIDENT';
    case 'REGULATORY_INQUIRY': return 'REPORTABLE_INCIDENT';
    case 'EMERGENCY_OPERATIONAL': return 'CLINICAL_EMERGENCY';
    case 'COMPLAINT': return 'GENERAL';
    default: return 'GENERAL';
  }
}

/* Worker-directed vs patient-directed: "me/my/I/myself" implies the field
   worker, which steers injury/assault toward the clinician-safety playbook. */
const WORKER_SELF = /\b(me|my|myself|i['’ ]?m|i was|i am|i feel|on me|at me|hit me|attacked me|i got)\b/i;

/* ─── Second-chance safety net (only runs when the precise classifier returns
   GENERAL_QUERY). High recall by design — order matters; first match wins. ── */
interface SecondChanceRule {
  track: IncidentTrack;
  category: ScenarioCategory | ((text: string) => ScenarioCategory);
  lifeSafety: boolean;
  patterns: RegExp[];
}

const SECOND_CHANCE: SecondChanceRule[] = [
  {
    track: 'DEATH_OR_UNRESPONSIVE',
    category: (t) => (/\b(dead|died|dying|deceased|lifeless|no pulse|not breathing|expired|passed away|gone cold|body)\b/i.test(t)
      ? 'SENTINEL_EVENT_CRITICAL' : 'PATIENT_SAFETY_EMERGENCY'),
    lifeSafety: true,
    patterns: [
      /\b(dead|died|dying|deceased|lifeless|expired|passed away|no pulse|pulseless|flatlin\w*)\b/i,
      /\b(not breathing|stopped breathing|won'?t breathe|isn'?t breathing|no breath)\b/i,
      /\b(unresponsive|unconscious|won'?t wake|can'?t wake|not waking|won'?t respond|not responding|blue lips|turning blue|cold and stiff)\b/i,
      /\bfound (her|him|them|my (patient|client)|the (patient|client))[^.]{0,30}\b(dead|down|on the floor|not breathing|unresponsive)\b/i,
    ],
  },
  {
    track: 'IMMEDIATE_DANGER',
    category: 'CLINICIAN_SAFETY',
    lifeSafety: true,
    patterns: [
      /\b(assault\w*|attack\w*|attacked me|jumped me|beat me|beating me)\b/i,
      /\b(hit me|hitting me|punch\w*|kick\w*|slapp?\w*|shov\w*|push\w*|bit me|biting me|scratch\w*|grab\w*|grabbed me|grop\w*|chok\w*|strangl\w*|spit\w* (on|at) me|threw|throwing)\b/i,
      /\b(threaten\w*|threat\b|menac\w*|stalk\w*|harass\w*|rob\w*|mugg\w*|held me|cornered|chasing|chased|came at me|coming at me|swung at|swinging at|lunged|follow\w* me)\b/i,
      // Inherent weapons (always urgent). Ambiguous objects (bat/scissors/hammer)
      // are handled by the assault/threw/swung verbs above, not by name.
      /\b(gun|firearm|pistol|rifle|handgun|shotgun|knife|machete|blade|weapon|brandish\w*|pointed (a|the) (gun|knife|weapon))\b/i,
      // Weapon VERBS — someone shot or stabbed is a violent scene → clinician
      // safety first, 911, aid only if the scene is safe. Guarded so "flu shot",
      // "shooting pain", and "stabbing pain" never match.
      /\b(gun ?shots?|gunfire|shots? fired|drive[- ]?by|(got|was|were|been|someone|somebody|they) shot\b|shot (him|her|them|me|us)|shooting(?!\s+(pain|sensation|ache|feeling)))\b/i,
      /\b(stabbed|knifed)\b|\bstabbing (him|her|them|me|us|the)\b/i,
      /\b(in danger|my life|kill me|wants? to (hurt|kill)|going to (hurt|kill)|hurt me|trying to hurt|afraid (for|of) my (life|safety))\b/i,
    ],
  },
  {
    track: 'CLINICAL_EMERGENCY',
    category: 'PATIENT_SAFETY_EMERGENCY',
    lifeSafety: true,
    patterns: [
      /\b(chest pain|can'?t breathe|cannot breathe|trouble breathing|difficulty breathing|short(ness)? of breath|gasping)\b/i,
      /\b(stroke|seizure|seizing|convuls\w*|overdos\w*|allergic reaction|anaphylax\w*|choking)\b/i,
      /\b(severe bleed\w*|bleeding (a lot|heavily|badly|out|everywhere)|hemorrhag\w*|won'?t stop bleeding)\b/i,
      /\b(passed out|fainted|collaps\w*|slurred speech|face droop\w*|numb on one side|sudden weakness|sudden confusion)\b/i,
      /\bblood sugar\b[^.]{0,20}\b(low|high|crash\w*|dropp\w*)\b/i,
      /\b((really |very |dangerously )?(low|high) blood sugar|diabetic emergency|insulin shock|sugar (crashed|too low|too high))\b/i,
      /\b(turning blue|blue lips|grey|clammy|cold and sweaty)\b/i,
    ],
  },
  {
    track: 'SUSPECTED_MISTREATMENT',
    category: 'ABUSE_NEGLECT',
    lifeSafety: true,
    patterns: [
      /\babus\w*/i,
      /\bneglect\w*/i,
      /\bexploit\w*/i,
      /\bmistreat\w*|maltreat\w*/i,
      /\babandon\w*/i,
      // Theft / financial exploitation (loose adjacency).
      /\b(steal\w*|stole|stolen|taking|took|pocket\w*|divert\w*|swindl\w*|scamm\w*|coerc\w*)\b[^.]{0,30}\b(money|cash|meds?|medication|belongings?|jewelry|jewellery|checks?|benefits|social security|funds|savings|valuables?|pension|ssi)\b/i,
      /\bfinancial(ly)? (abus\w*|exploit\w*)\b/i,
      // Neglect — withholding/denial of basic care.
      /\b(not|isn'?t|aren'?t|won'?t|wont|never|stopped|refus\w*)\s+(feed\w*|bath\w*|car(e|ing) for|chang\w*|clean\w*|turn\w*|toilet\w*)\b/i,
      /\b(withhold\w*|denied|denying|depriv\w*)\b[^.]{0,20}\b(care|food|water|meds?|medication\w*|treatment|insulin)\b/i,
      /\b(left (alone|in (filth|dirt|squalor))|living in (filth|squalor))\b/i,
      // Third party harming the patient.
      /\b(aide|caregiver|cna|hha|family|relative|son|daughter|husband|wife|spouse|staff|worker|nurse|someone|they)\b[^.]{0,30}\b(hit|hits|hitting|slapp?\w*|beat\w*|hurt\w*|abus\w*|yell\w*|scream\w*|threaten\w*|push\w*|shov\w*|grabb\w*|restrain\w*|tied? up|lock\w* (her|him|them) up)\b[^.]{0,15}\b(her|him|them|the patient|patient|the client|client|mom|dad|mother|father|grandma|grandpa)\b/i,
      // Rights / dignity violations (require a violation verb, not bare "rights").
      /\b(violat\w*|deny\w*|denied|ignor\w*|disregard\w*|trampl\w*|strip\w*)\b[^.]{0,20}\b(rights?|dignity)\b/i,
      /\brights?\b[^.]{0,15}\b(violat\w*|ignored|denied|disregard\w*)\b/i,
      /\b(unexplained|suspicious|inconsistent) (bruise|injury|mark|welt|wound)\b/i,
    ],
  },
  {
    track: 'SERIOUS_INJURY',
    category: (t) => (WORKER_SELF.test(t) && !/\b(patient|client|resident)\b/i.test(t)
      ? 'CLINICIAN_SAFETY' : 'PATIENT_SAFETY_EMERGENCY'),
    lifeSafety: true,
    patterns: [
      /\b(hit (his|her|their|my|the) head|head (injury|wound|strike)|struck (his|her|their|my|the) head|bumped (his|her|their|my) head)\b/i,
      /\b(broke\w*|broken (bone|hip|arm|leg|wrist|ankle)|fracture\w*|dislocat\w*)\b/i,
      /\b(deep (cut|laceration)|laceration|gash|stitches|burn\w*|scald\w*)\b/i,
      /\b(cut|burn\w*|scald\w*|hurt) (himself|herself|themselves|my|his|her|their)\b/i,
      /\b(fell|falling|fallen|took a (fall|tumble)|had a fall|slipped|tripped)\b/i,
      /\b(injur\w*|wound\w*|hurt (himself|herself|themselves|my|his|her)|bleeding|bruis\w*|sprain\w*|twisted (his|her|their|my) (ankle|knee))\b/i,
      /\b(needle[- ]?stick|stuck (myself|me) with (a )?needle|sharps? injur\w*|blood exposure|body fluid exposure)\b/i,
    ],
  },
  {
    track: 'UNSAFE_ENVIRONMENT',
    category: 'CLINICIAN_SAFETY',
    lifeSafety: true,
    patterns: [
      /\b(unsafe|not safe|don'?t feel safe|do not feel safe|feel unsafe|feeling unsafe|scared|afraid|frighten\w*|terrified)\b/i,
      /\b(hostile|aggressive|yelling at me|screaming at me|cursing at me|intimidat\w*|verbally abusive|getting in my face)\b/i,
      /\b(doing drugs|drugs? (in|at|around|on the)|dealing drugs|drug use|using drugs|needles? (around|on the|everywhere)|meth\b|paraphernalia|smoking (meth|crack))\b/i,
      /\b(dog (is|was|won'?t)|aggressive dog|pit bull|animal (loose|aggressive)|infestation|roach\w*|bed bugs?|hoard\w*)\b/i,
      /\b(can'?t leave|cannot leave|blocked (the )?(door|exit|me)|locked in|no way out|won'?t let me leave|wont let me leave|standing in the doorway)\b/i,
    ],
  },
  {
    track: 'PRIVACY_SECURITY',
    category: (t) => (/\b(ransomware|malware|phishing|hacked|cyber|virus|breach (the|our) (system|network))\b/i.test(t)
      ? 'CYBERSECURITY_INCIDENT' : 'PRIVACY_BREACH'),
    lifeSafety: false,
    patterns: [
      /\b(wrong (person|number|recipient|patient|address|fax|email|inbox|chart))\b/i,
      /\b(sent|texted|emailed|faxed|shared|disclosed|gave|forwarded|mailed)\b[^.]{0,50}\b(wrong|someone else|another (patient|person)|unauthorized)\b/i,
      /\b(sent|texted|emailed|faxed|shared|disclosed|forwarded)\b[^.]{0,50}\b(phi|patient (info|information|record|chart|details)|schedule with names|medical (info|record))\b/i,
      /\b(hipaa|phi)\b[^.]{0,30}\b(breach|incident|violation|disclos\w*|leak\w*)\b/i,
      /\b(lost|stole|stolen|misplaced|left behind|can'?t find)\b[^.]{0,20}\b(laptop|phone|device|usb|thumb ?drive|chart|paperwork|records?|binder|ipad|tablet|computer|bag|files?)\b/i,
      /\b(hacked|ransomware|malware|phishing|virus|account (compromis\w*|breach\w*)|data breach|unauthorized (access|login))\b/i,
    ],
  },
  {
    track: 'REPORTABLE_INCIDENT',
    category: 'ADVERSE_EVENT',
    lifeSafety: false,
    patterns: [
      /\b(med(ication)? error|wrong (dose|med|medication|patient)|gave (the )?wrong|missed (dose|med)|double dose)\b/i,
      /\b(missing (med|medication|narcotic|pill|controlled)|count (is )?(off|short)|meds? (are )?(short|missing))\b/i,
      /\b(adverse event|near miss|sentinel event|never event|reportable|occurrence|something went wrong)\b/i,
      /\b(incident (report|happened|occurred)|need to (report|write up)|do i (need to|have to) report|should i report|how do i report|file (a|an) (report|incident))\b/i,
      /\b(hospitaliz\w*|admitted to (the )?hospital|sent to (the )?(er|hospital|emergency room))\b/i,
      /\b(property damage|broke (the|their|a)|damaged (the|their)|spilled|ruined)\b/i,
      /\b(complaint|grievance|unhappy|upset (family|patient)|wants? to (complain|file))\b/i,
    ],
  },
];

function collectSignals(patterns: RegExp[], text: string): string[] {
  const out: string[] = [];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) out.push(m[0].trim().toLowerCase());
  }
  return Array.from(new Set(out)).slice(0, 6);
}

/** Route a free-form message to a broad critical-incident track (deterministic). */
export function routeCriticalIncident(input: string): IncidentRoute {
  const text = (input ?? '').trim();
  const primary = classifyScenario(text);

  // Stage 1 — precise classifier playbook.
  if (primary.category !== 'GENERAL_QUERY' && primary.suppressNoAnswer) {
    const track = categoryToTrack(primary.category);
    return {
      track,
      category: primary.category,
      urgent: URGENT_TRACKS.has(track) || primary.lifeSafetyFlag,
      lifeSafety: primary.lifeSafetyFlag,
      matchedSignals: primary.matchedTriggers,
      source: 'classifier',
      mapping: primary,
    };
  }

  // Stage 2 — broad safety net for urgent phrasing the precise patterns missed.
  if (text) {
    for (const rule of SECOND_CHANCE) {
      const signals = collectSignals(rule.patterns, text);
      if (signals.length) {
        const category = typeof rule.category === 'function' ? rule.category(text) : rule.category;
        const pb = getPlaybook(category);
        return {
          track: rule.track,
          category,
          urgent: true,
          lifeSafety: rule.lifeSafety || pb.lifeSafetyFlag,
          matchedSignals: signals,
          source: 'router',
          mapping: pb,
        };
      }
    }
  }

  // No urgent signal — general (non-urgent) path.
  return {
    track: 'GENERAL',
    category: 'GENERAL_QUERY',
    urgent: false,
    lifeSafety: false,
    matchedSignals: [],
    source: 'none',
    mapping: primary,
  };
}

export function isUrgentTrack(track: IncidentTrack): boolean {
  return URGENT_TRACKS.has(track);
}
