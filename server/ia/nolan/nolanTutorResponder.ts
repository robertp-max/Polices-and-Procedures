import { ALL_MODULES, modulesForRole, moduleById } from '../../../src/policy/journey/data/modules.ts';
import type { JourneyModule, JourneyRole } from '../../../src/policy/journey/types/journey.ts';
import { routeCriticalIncident } from '../brad/criticalIncidentRouter.js';
import { composeInternalBradAnswer } from '../brad/bradInternalResponder.js';

/* ═══════════════════════════════════════════════════════════════════════════
   NOLAN — Nurse Onboarding & Learning Assistant (Training Module tutor).
   ----------------------------------------------------------------------------
   Nolan's USER-FACING side: a deterministic chat tutor for the Training/Journey
   module. Grounded ONLY in the canonical module catalog (modules.ts) and
   training logistics — NO internet, NO PHI, NO policy authority. This surface
   is completely separate from Nolan's research-retriever role (BradNolanRelay →
   NolanRuntime), which remains Brad-only and never user-facing; the two share
   the Nolan identity and model config, never a channel.

   Routing order (hard-learned from Brad):
     1. URGENT SAFETY FIRST — a learner in danger typing into the tutor gets the
        same safety-first incident guidance Brad gives, never a catalog search.
     2. Identity / small-talk (anchored whole-message, like Brad's).
     3. Module-by-ID, role→modules map, training logistics.
     4. Compliance/policy territory → warm referral to Brad.
     5. Honest catalog-search fallback — never "not enough context".

   Wording rules: same guardrails as everywhere else — no attestation/
   acknowledgment/sign-off/certification language, and Nolan never claims to be
   Claude/ChatGPT/Gemini/an LLM/a human.
   ═══════════════════════════════════════════════════════════════════════════ */

export const NOLAN_TUTOR_PROMPT_VERSION = 'nolan-tutor-sys-2026.07.09.1';

/** For a FUTURE live-model mode only — the deterministic responder below never
    calls a model. Mirrors Brad's identity rules. */
export const NOLAN_TUTOR_SYSTEM_PROMPT = [
  'You are Nolan — Care Indeed’s Nurse Onboarding & Learning Assistant. You help',
  'learners navigate their onboarding and competency journey: which training',
  'modules apply to their role, what each module covers, prerequisites, quiz and',
  'remediation rules, and where to pick up next. You are encouraging, clear, and',
  'brief. You are NOT a policy or compliance authority: policy, workflow,',
  'incident, evidence, and packet questions belong to Brad (iAdministrator) —',
  'refer learners there. You have NO internet access on this surface and never',
  'handle PHI. NEVER say or imply you are Claude, Gemini, GPT, an LLM, a language',
  'model, or a human. Never use attestation/acknowledgment/sign-off wording for',
  'training progress.',
].join('\n');

export interface NolanTutorAnswer {
  text: string;
  matched: boolean;
  path: 'urgent-passthrough' | 'identity' | 'persona' | 'module' | 'role-map' | 'logistics' | 'brad-referral' | 'lesson-clarify' | 'whats-next' | 'my-plan' | 'fallback';
  /** Module ids referenced, for UI chips/links. */
  moduleIds: string[];
}

/** Optional per-request context that customizes answers to the learner and the
    lesson they're currently in. All fields client-supplied and non-sensitive
    (module/lesson content is public training material; name is the display
    name already sent as an identity header). */
export interface NolanTutorContext {
  moduleId?: string;
  lessonTitle?: string;
  /** Flattened text of the current lesson's cards (capped by caller & here). */
  lessonText?: string;
  learnerName?: string;
  role?: string;
  completedModuleIds?: string[];
  /** First day (startDate ?? hireDate, ISO) — anchors every journey deadline. */
  startDateIso?: string;
  licenseExpiryIso?: string;
  appendixFCleared?: boolean;
}

/* ─── Identity / persona ────────────────────────────────────────────────────── */

export const NOLAN_IDENTITY_ANSWER =
  'Hi, I’m Nolan — Care Indeed’s Nurse Onboarding & Learning Assistant. I live here in the Training module and I know the whole competency journey: every orientation and role-track module, what each one covers, what order they come in, and the quiz and retake rules.\n\nAsk me things like “what modules does an RN need,” “what is GAO-012 about,” or “what happens if I fail the quiz.” For policy, workflow, incident, or compliance questions, Brad in iAdministrator is your expert — I’ll point you there when a question is his.';

const NOLAN_PERSONA: Array<{ patterns: RegExp[]; text: string }> = [
  {
    patterns: [
      /^who are (you|u)$/, /^what are (you|u)$/, /^who (is|'?s) nolan$/, /^what is nolan$/,
      /^are (you|u) nolan$/, /^(please )?introduce yourself$/, /^tell me about (yourself|you|nolan)$/,
      /^what do (you|u) do$/, /^what can (you|u) (do|help( me)? with)$/, /^how can (you|u) help( me)?$/,
      /^what('?s| is) your (name|role|job)$/, /^what does nolan (stand for|mean)$/,
      /^are (you|u) (brad|claude|chatgpt|gpt|gemini|an? (ai|llm|bot|chatbot|human|person|real person))$/,
    ],
    text: NOLAN_IDENTITY_ANSWER,
  },
  {
    patterns: [/^(hi|hiya|hello|hey|yo|good (morning|afternoon|evening))( there)?( nolan)?$/],
    text: 'Hey! Nolan here — your onboarding and learning guide. Want to know which modules apply to your role, what a specific module covers, or how the quizzes work?',
  },
  {
    patterns: [/^(thanks|thank (you|u)|ty|thx)( so much| a lot| nolan)?$/],
    text: 'Anytime! Keep going — every module you finish is one step closer to being field-ready. I’m here whenever you need the next pointer.',
  },
];

function normalizedForms(userText: string): [string, string] {
  const normalized = userText
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[?!.,;:"()]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const stripped = normalized
    .replace(/^(hey|hi|hello|yo|ok|okay) /, '')
    .replace(/^nolan /, '')
    .replace(/ (please|nolan)$/, '');
  return [normalized, stripped];
}

/* ─── Catalog helpers ───────────────────────────────────────────────────────── */

const ROLE_ALIASES: Array<{ re: RegExp; role: JourneyRole }> = [
  { re: /\b(rn|registered nurse|nurse)\b/i, role: 'RN' },
  { re: /\b(lvn|licensed vocational nurse)\b/i, role: 'LVN' },
  { re: /\b(hha|home health aide|aide|cna)\b/i, role: 'HHA' },
  { re: /\b(pta|physical therapist assistant)\b/i, role: 'PTA' },
  { re: /\b(pt|physical therapist)\b/i, role: 'PT' },
  { re: /\b(cota|occupational therapy assistant)\b/i, role: 'COTA' },
  { re: /\b(ot|occupational therapist)\b/i, role: 'OT' },
  { re: /\b(slp|speech|speech[- ]language pathologist)\b/i, role: 'SLP' },
  { re: /\b(msw|social worker)\b/i, role: 'MSW' },
  { re: /\b(don|director of nursing|clinical manager)\b/i, role: 'DON' },
];

function methodLabel(m: JourneyModule): string {
  const threshold = m.passThreshold ? ` (pass ≥ ${Math.round(m.passThreshold * 100)}%)` : '';
  switch (m.method) {
    case 'None': return 'review-based — no graded check';
    case 'Quiz': return `graded quiz${threshold}`;
    default: return `${m.method}${threshold}`;
  }
}

function describeModule(m: JourneyModule): string {
  const lines = [
    `${m.id} — ${m.title}`,
    `• Who takes it: ${m.roles === 'ALL' ? 'everyone (all roles)' : m.roles.join(', ')}${m.week ? ` · Week ${m.week}` : ''}${m.phase ? ` · ${m.phase} phase` : ''}`,
    `• How it’s checked: ${methodLabel(m)}`,
  ];
  if (m.policyRefs?.length) lines.push(`• Grounded in policy: ${m.policyRefs.join(', ')}`);
  if (m.cmsRefs?.length) lines.push(`• Regulatory context: ${m.cmsRefs.join(', ')} (informational)`);
  if (m.prerequisites?.length) lines.push(`• Prerequisites: ${m.prerequisites.length} module(s) must be done first`);
  return lines.join('\n');
}

/* ─── Training logistics (source: HR-TA-005 / module catalog thresholds) ────── */

const LOGISTICS_RE = /\b(fail(ed|ing)?|pass(ing)? (score|threshold|grade)|retake|re[- ]?take|attempts?|how many (tries|times)|quiz rules?|exam rules?|scor(e|ing)|80%)\b/i;
const LOGISTICS_ANSWER =
  'Here’s how graded checks work in the journey: the passing score is 80%. If you don’t pass, you can retake after a 3-business-day window, up to 3 attempts — after the third attempt, your supervisor/educator steps in with a remediation plan (that’s support, not trouble). Review-based modules have no graded check; competency methods like return-demos and skills check-offs are completed with your preceptor or educator. Your completions are recorded in your training record as documentation of orientation.';

/* ─── Brad referral ─────────────────────────────────────────────────────────── */

const BRAD_TERRITORY_RE = /\b(policy|policies|p&p|workflow|work flow|incident report|packet|evidence|e[- ]?sign|ecign|qapi minutes|audit prep|survey (prep|readiness)|compliance question|hipaa breach|form [A-Z]{2}-|CL-|QA-WF|CO-CP)\b/i;
const BRAD_REFERRAL =
  'That one’s Brad’s territory — he’s Care Indeed’s compliance execution assistant over in iAdministrator, and he knows every policy, workflow, form, and packet in the building. Ask him there and he’ll walk you through it. If it’s about your training modules, quizzes, or what to do next in the journey, I’m your guide!';

/* ─── Lesson-context clarifying answers (deterministic sentence retrieval) ──── */

const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'that', 'this', 'these', 'those', 'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how', 'does', 'did', 'was', 'were', 'are', 'is', 'be', 'been', 'can', 'could', 'should', 'would', 'will', 'shall', 'may', 'might', 'must', 'about', 'mean', 'means', 'meaning', 'explain', 'clarify', 'tell', 'more', 'again', 'please', 'you', 'your', 'from', 'into', 'have', 'has', 'had', 'not', 'they', 'them', 'their', 'there', 'here', 'lesson', 'question']);

function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

/** Find the lesson sentences most relevant to the question (keyword overlap). */
function retrieveFromLesson(question: string, lessonText: string): string[] {
  const qWords = new Set(keywords(question));
  if (qWords.size === 0) return [];
  const sentences = lessonText
    .slice(0, 12000)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 400);
  const scored = sentences
    .map((s) => {
      const sWords = keywords(s);
      let hits = 0;
      for (const w of sWords) if (qWords.has(w) || [...qWords].some((q) => w.startsWith(q) || q.startsWith(w))) hits++;
      return { s, hits };
    })
    .filter((x) => x.hits >= 1)
    .sort((a, b) => b.hits - a.hits);
  // Deduplicate near-identical sentences, keep the top 3.
  const out: string[] = [];
  for (const { s } of scored) {
    if (out.some((o) => o.includes(s) || s.includes(o))) continue;
    out.push(s);
    if (out.length === 3) break;
  }
  return out;
}

const CLARIFY_HINT_RE = /\b(what|why|how|when|who|explain|clarify|confused|understand|mean|difference|again|example)\b/i;

/* ─── "What's next" (progress-aware) ────────────────────────────────────────── */

const WHATS_NEXT_RE = /\b(what('| i)?s next|next (module|lesson|step)|where (do|should) i (go|continue|start)|continue my (journey|training)|what should i (do|take|study) (next|now)|what comes after)\b/i;

function whatsNextAnswer(ctx: NolanTutorContext): string {
  const completed = new Set(ctx.completedModuleIds ?? []);
  const alias = ctx.role ? ROLE_ALIASES.find((a) => a.re.test(ctx.role!)) : undefined;
  if (alias) {
    const next = modulesForRole(alias.role).find((m) => !completed.has(m.id) && m.id !== ctx.moduleId);
    if (next) {
      return `Next up on your ${alias.role} journey: ${next.id} — ${next.title} (${methodLabel(next)}). ${ctx.moduleId ? 'Finish this one first, then head there.' : 'You can start it from the Training Academy.'}`;
    }
    return `Looking at your ${alias.role} journey — you’ve covered everything I track. Nice work! Check the Academy’s certificates tab, and keep an eye out for annual refreshers.`;
  }
  if (ctx.moduleId) {
    const cur = moduleById(ctx.moduleId);
    if (cur) {
      const siblings = ALL_MODULES.filter((m) => m.group === cur.group);
      const idx = siblings.findIndex((m) => m.id === cur.id);
      const next = idx >= 0 ? siblings.slice(idx + 1).find((m) => !completed.has(m.id)) : undefined;
      if (next) return `After ${cur.id}, the next module in this track is ${next.id} — ${next.title} (${methodLabel(next)}).`;
    }
  }
  return 'Tell me your role (RN, LVN, HHA, PT, OT, SLP, MSW, DON, Administrator…) and I’ll point you at exactly what’s next in your journey.';
}

/* ─── Personal training plan (deadlines anchored on the learner's first day) ──
   Speaks the SAME policy rules the escalation engine enforces
   (src/policy/journey/utils/escalation.ts): GAO = days 1–5; role track by
   catalog week; ANN/COMP annual due Dec 31 with the HR-TD-001 §4.6 30/45/60
   overdue ladder; license renewal window per HR-TA-004 (≤120 days); Appendix F
   clearance per HR-TA-001 §6.4. Guidance-only voice — deadlines and next steps,
   never disciplinary framing at the learner. */

const MY_PLAN_RE = /\b(what (do|should) i (need to )?(complete|do|finish|take|read)|my (deadlines?|plan|training plan|to[- ]?do|checklist|requirements)|what('s| is) due|due (dates?|soon|this week)|overdue|policies (do|should) i (need to )?read|what training (do|should) i|am i (behind|on track)|expiring|annual (training|requirements?|deadline))\b/i;

const DAY_MS = 24 * 60 * 60 * 1000;
const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function myPlanAnswer(ctx: NolanTutorContext, firstName: string): NolanTutorAnswer {
  const alias = ctx.role ? ROLE_ALIASES.find((a) => a.re.test(ctx.role!)) : undefined;
  const start = ctx.startDateIso ? new Date(ctx.startDateIso) : null;
  if (!alias || !start || Number.isNaN(start.getTime())) {
    return {
      text: 'I can build your personal plan — I just need to know your role (RN, LVN, HHA, PT, OT, SLP, MSW, DON…) and your first day. Open this from the Training Academy while signed in and I’ll have both automatically.',
      matched: true, path: 'my-plan', moduleIds: [],
    };
  }

  const now = new Date();
  const dayN = Math.max(1, Math.floor((now.getTime() - start.getTime()) / DAY_MS) + 1);
  const completed = new Set(ctx.completedModuleIds ?? []);
  const mods = modulesForRole(alias.role);
  const sections: string[] = [];
  const refIds = new Set<string>();
  const policyRefs = new Set<string>();

  // 1) Orientation (GAO) — due by day 5.
  const gaoDue = new Date(start.getTime() + 4 * DAY_MS);
  const gaoAll = mods.filter((m) => m.phase === 'GAO');
  const gaoOpen = gaoAll.filter((m) => !completed.has(m.id));
  if (gaoOpen.length) {
    const overdue = now > gaoDue;
    const list = gaoOpen.slice(0, 4).map((m) => `• ${m.id} — ${m.title}`).join('\n');
    sections.push(
      `ORIENTATION — due by day 5 (${fmtDate(gaoDue)})${overdue ? ' — past the window, make these your top priority and let your supervisor know' : ''}:\n` +
      `${list}${gaoOpen.length > 4 ? `\n…and ${gaoOpen.length - 4} more` : ''} (${gaoAll.length - gaoOpen.length}/${gaoAll.length} done)`,
    );
    gaoOpen.slice(0, 4).forEach((m) => { refIds.add(m.id); m.policyRefs.forEach((p) => policyRefs.add(p)); });
  }

  // 2) Role track — due by catalog week (end of week N = first day + 7N days).
  const roleOpen = mods.filter((m) => m.phase !== 'GAO' && m.week && !completed.has(m.id));
  const currentWeek = Math.max(1, Math.ceil(dayN / 7));
  const dueNow = roleOpen.filter((m) => (m.week ?? 99) <= currentWeek);
  const upcoming = roleOpen.filter((m) => (m.week ?? 99) === currentWeek + 1);
  if (dueNow.length) {
    const list = dueNow.slice(0, 4).map((m) => {
      const wkDue = new Date(start.getTime() + ((m.week ?? 1) * 7 - 1) * DAY_MS);
      return `• ${m.id} — ${m.title} (week ${m.week}, due ${fmtDate(wkDue)})`;
    }).join('\n');
    sections.push(`${alias.role} TRACK — due now (you're in week ${currentWeek}):\n${list}${dueNow.length > 4 ? `\n…and ${dueNow.length - 4} more` : ''}`);
    dueNow.slice(0, 4).forEach((m) => { refIds.add(m.id); m.policyRefs.forEach((p) => policyRefs.add(p)); });
  }
  if (upcoming.length) {
    sections.push(`COMING UP — week ${currentWeek + 1}: ${upcoming.slice(0, 3).map((m) => m.id).join(', ')}${upcoming.length > 3 ? ` +${upcoming.length - 3}` : ''}`);
  }

  // 3) Annual requirements — due Dec 31 (HR-TD-001 §4.6 escalates 30/45/60 days overdue).
  const annualOpen = mods.filter((m) => ['ANN', 'COMP', 'DRILL'].includes(m.group ?? '') && !completed.has(m.id));
  if (annualOpen.length) {
    sections.push(
      `ANNUAL REQUIREMENTS — due Dec 31, ${now.getFullYear()} (per HR-TD-001, reminders escalate at 30/45/60 days overdue):\n` +
      annualOpen.slice(0, 3).map((m) => `• ${m.id} — ${m.title}`).join('\n') +
      (annualOpen.length > 3 ? `\n…and ${annualOpen.length - 3} more` : ''),
    );
  }

  // 4) Policies to read alongside what's due.
  if (policyRefs.size) {
    sections.push(`POLICIES TO READ alongside what's due: ${[...policyRefs].slice(0, 8).join(', ')} — each module lists its policies, and Brad can open any of them for you.`);
  }

  // 5) Documents & clearances.
  const docs: string[] = [];
  if (ctx.licenseExpiryIso) {
    const exp = new Date(ctx.licenseExpiryIso);
    if (!Number.isNaN(exp.getTime())) {
      const dLeft = Math.floor((exp.getTime() - now.getTime()) / DAY_MS);
      if (dLeft <= 0) docs.push(`• Your license shows EXPIRED (${fmtDate(exp)}) — contact HR today; clinical duties pause until renewal is verified (HR-TA-004).`);
      else if (dLeft <= 120) docs.push(`• License expires ${fmtDate(exp)} — ${dLeft} days out. Start renewal now; HR tracks re-verification per HR-TA-004${dLeft <= 30 ? ' (inside 30 days — treat as urgent)' : ''}.`);
    }
  }
  if (ctx.appendixFCleared === false) {
    docs.push('• Appendix F screening isn’t marked cleared yet — check with HR before independent assignments (HR-TA-001).');
  }
  if (docs.length) sections.push(`DOCUMENTS & CLEARANCES:\n${docs.join('\n')}`);

  if (!sections.length) {
    return {
      text: `You're fully caught up${firstName ? `, ${firstName}` : ''} — nothing due on your journey right now, no annual items open, and no document flags I can see. Keep an eye on annual refreshers toward year-end. Great work!`,
      matched: true, path: 'my-plan', moduleIds: [],
    };
  }

  return {
    text:
      `Here’s your plan${firstName ? `, ${firstName}` : ''} — day ${dayN} of your journey (first day ${fmtDate(start)}):\n\n` +
      sections.join('\n\n') +
      '\n\nOne step at a time — want the details on any module?',
    matched: true, path: 'my-plan', moduleIds: [...refIds].slice(0, 8),
  };
}

/* ─── Fallback ──────────────────────────────────────────────────────────────── */

export const NOLAN_TUTOR_FALLBACK =
  `I searched the training catalog (${ALL_MODULES.length} modules across general orientation and every role track) and couldn’t match that to a module, a role, or the quiz rules. Try a module ID (like GAO-012), a role (“what does an RN need”), or ask about quiz/retake rules. For policy or compliance questions, Brad in iAdministrator is the expert.`;

/* ─── Main composer ─────────────────────────────────────────────────────────── */

export function composeNolanTutorAnswer(userText: string, ctx: NolanTutorContext = {}): NolanTutorAnswer {
  const text = (userText ?? '').trim();
  const firstName = (ctx.learnerName ?? '').trim().split(/\s+/)[0] || '';

  // 1) URGENT SAFETY FIRST — never let a person in danger get a catalog search.
  //    Reuses Brad's deterministic incident routing verbatim (safety doctrine
  //    is agency-wide, not per-assistant).
  const route = routeCriticalIncident(text);
  if (route.urgent) {
    const brad = composeInternalBradAnswer(text);
    return { text: brad.text, matched: true, path: 'urgent-passthrough', moduleIds: [] };
  }

  // 2) Identity / small-talk (anchored whole-message). Greetings get the
  //    learner's first name when we have it — identity text stays canonical.
  const [normalized, stripped] = normalizedForms(text);
  for (const p of NOLAN_PERSONA) {
    if (p.patterns.some((re) => re.test(normalized) || re.test(stripped))) {
      const isIdentity = p.text === NOLAN_IDENTITY_ANSWER;
      const personalized = !isIdentity && firstName && p.text.startsWith('Hey!')
        ? p.text.replace(/^Hey!/, `Hey ${firstName}!`)
        : p.text;
      return { text: personalized, matched: true, path: isIdentity ? 'identity' : 'persona', moduleIds: [] };
    }
  }

  // 2b) "What's next" — progress/role aware when context is supplied.
  //     (Checked before my-plan so a quick "what's next" stays a one-liner.)
  if (WHATS_NEXT_RE.test(text)) {
    return { text: whatsNextAnswer(ctx), matched: true, path: 'whats-next', moduleIds: [] };
  }

  // 2c) Personal plan — deadlines from first day, policies to read, annual
  //     requirements, expiring documents ("what do I need to complete?").
  if (MY_PLAN_RE.test(text)) {
    return myPlanAnswer(ctx, firstName);
  }

  // 3) Module by ID (GAO-012, RN-003, GAO-EXAM, …).
  const idMatch = text.toUpperCase().match(/\b([A-Z]{2,4})-(\d{3}|EXAM|SUP)\b/);
  if (idMatch) {
    const m = moduleById(idMatch[0]);
    if (m) return { text: describeModule(m), matched: true, path: 'module', moduleIds: [m.id] };
    return {
      text: `I don’t have a module called ${idMatch[0]} in the catalog. Module IDs look like GAO-001 through GAO-027 for general orientation, or role-track IDs like RN-001, HHA-003, ADM-005.`,
      matched: false, path: 'module', moduleIds: [],
    };
  }

  // 4) Role → modules map ("what modules does an RN need", "my training as an aide").
  const wantsModules = /\b(modules?|training|courses?|onboarding|journey|competenc\w*|need to (take|do|complete)|assigned)\b/i.test(text);
  if (wantsModules) {
    const alias = ROLE_ALIASES.find((a) => a.re.test(text));
    if (alias) {
      const mods = modulesForRole(alias.role);
      const gao = mods.filter((m) => m.phase === 'GAO');
      const roleTrack = mods.filter((m) => m.phase !== 'GAO');
      const preview = roleTrack.slice(0, 5).map((m) => `• ${m.id} — ${m.title}`).join('\n');
      return {
        text:
          `Here’s the ${alias.role} journey: ${mods.length} modules total.\n\n` +
          `Phase 1 — General Agency Orientation: ${gao.length} modules (GAO-001…), everyone takes these in days 1–5, capped by the orientation quiz.\n\n` +
          `Phase 2 — ${alias.role} role track: ${roleTrack.length} modules across the first weeks, for example:\n${preview}` +
          (roleTrack.length > 5 ? `\n…and ${roleTrack.length - 5} more.` : '') +
          `\n\nAsk me about any module by its ID and I’ll break it down.`,
        matched: true, path: 'role-map', moduleIds: roleTrack.slice(0, 5).map((m) => m.id),
      };
    }
    // Wants their modules but didn't name a role — ask, don't fall through.
    if (/\b(i|my|me|mine)\b/i.test(text)) {
      return {
        text: 'Happy to map your journey! Which role are you — RN, LVN, HHA, PT, PTA, OT, COTA, SLP, MSW, DON, or Administrator? Everyone starts with the same General Agency Orientation (27 GAO modules + the orientation quiz); your role decides the rest.',
        matched: true, path: 'role-map', moduleIds: [],
      };
    }
  }

  // 5) Quiz / retake / scoring logistics.
  if (LOGISTICS_RE.test(text)) {
    return { text: LOGISTICS_ANSWER, matched: true, path: 'logistics', moduleIds: [] };
  }

  // 6) Brad's territory → warm referral, never a cold bounce.
  if (BRAD_TERRITORY_RE.test(text)) {
    return { text: BRAD_REFERRAL, matched: true, path: 'brad-referral', moduleIds: [] };
  }

  // 7) In-lesson clarifying question — deterministic retrieval over THIS
  //    lesson's own text (precise intents above always win; this catches the
  //    "wait, what does that mean?" questions the catalog can't).
  if (ctx.lessonText && (CLARIFY_HINT_RE.test(text) || keywords(text).length >= 1)) {
    const hits = retrieveFromLesson(text, ctx.lessonText);
    const lessonLabel = ctx.lessonTitle ? `“${ctx.lessonTitle}”` : 'this lesson';
    if (hits.length) {
      return {
        text:
          `Good question${firstName ? `, ${firstName}` : ''} — here’s what ${lessonLabel} says about that:\n\n` +
          hits.map((h) => `• ${h}`).join('\n\n') +
          '\n\nWant me to break any of that down further, or are you good to continue?',
        matched: true, path: 'lesson-clarify', moduleIds: ctx.moduleId ? [ctx.moduleId] : [],
      };
    }
    return {
      text:
        `I looked through ${lessonLabel} and didn’t find that covered directly. Try asking with a keyword from the lesson, or if it’s a policy/compliance question, Brad in iAdministrator can dig deeper. You can also just continue — this won’t block you.`,
      matched: false, path: 'lesson-clarify', moduleIds: ctx.moduleId ? [ctx.moduleId] : [],
    };
  }

  // 8) Honest fallback.
  return { text: NOLAN_TUTOR_FALLBACK, matched: false, path: 'fallback', moduleIds: [] };
}
