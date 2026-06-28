import type { GuidedAssistanceIntent, GuidedDomain, GuidedTourSlot } from './types';

/* ═══════════════════════════════════════════════════════════════════════════
   Guided-assistance intent classifier.
   ----------------------------------------------------------------------------
   Detects when a user wants a guided, UI-driven walkthrough (vs. a normal Brad
   answer), infers the domain, and computes which slots still need to be
   collected before a tour can launch. Pure + deterministic (no network).

   Vertical slice: only `event_packet` is fully wired (required slots: event +
   packet_type). Other domains are detected but return general_navigation until
   their tours are built.
   ═══════════════════════════════════════════════════════════════════════════ */

const GUIDED_TRIGGERS: RegExp[] = [
  /\bshow me how\b/i,
  /\bwalk me through\b/i,
  /\bguide me\b/i,
  /\bhelp me (do|create|generate|complete|upload|export|send|use|find|make)\b/i,
  /\btake me to\b/i,
  /\bteach me (how )?\b/i,
  /\bwhere do i click\b/i,
  /\bhow do i (generate|export|upload|complete|create|send|use|find|make|get)\b/i,
  /\bcan brad guide\b/i,
  /\bstart (a )?guided (tour|walkthrough)\b/i,
  /\bcreate a walkthrough\b/i,
  /\bguided (tour|assistance|walkthrough)\b/i,
];

/** Packet-type choices offered for the event_packet domain. */
export const PACKET_TYPE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'General', value: 'general' },
  { label: 'QAPI', value: 'qapi' },
  { label: 'Governing Body', value: 'governing_body' },
  { label: 'Compliance', value: 'compliance' },
  { label: 'Emergency Drill', value: 'emergency_drill' },
  { label: 'Incident Review', value: 'incident_review' },
];

/** Domains that have a buildable guided tour (kept local to avoid a circular import). */
const TOURABLE_DOMAINS = new Set<GuidedDomain>(['event_packet', 'help_thread', 'community']);

function detectDomain(text: string): GuidedDomain {
  const t = text.toLowerCase();
  if (/\b(event )?packet\b/.test(t) || /\bgenerate .*packet\b/.test(t)) return 'event_packet';
  // "generate/guide/walk … (monthly) qapi / governing body / survey / compliance …" → packet flow.
  if (/\b(qapi|governing body|survey|compliance|emergency drill|incident review)\b/.test(t)
    && /\b(generate|create|build|make|export|guide|walk|show|complete|prepare)\b/.test(t)) return 'event_packet';
  // Community (the team's no-PHI social space) — checked before generic "thread".
  if (/\bcommunit(y|ies)\b/.test(t) || /\b(team feed|community feed|member (profile|directory)|share with (the )?team)\b/.test(t)) return 'community';
  // Help Center discussion threads.
  if (/\b(thread|discussion|ask (a |my )?question|post (a )?question|start (a )?discussion|help center (thread|discussion))\b/.test(t)) return 'help_thread';
  if (/\bupload .*evidence\b|\bevidence (upload|studio)\b/.test(t)) return 'evidence_upload';
  if (/\bsurvey (export|packet)\b|\bexport .*survey\b/.test(t)) return 'survey_export';
  if (/\b(send|route) .*(form|for signature)\b|\becign\b|\bsignature\b/.test(t)) return 'form_signature';
  if (/\baudit (blocker|resolution)\b|\bresolve .*audit\b/.test(t)) return 'audit_resolution';
  if (/\bpolicy\b|\blook ?up\b/.test(t)) return 'policy_lookup';
  if (/\bonboard\w*\b/.test(t)) return 'onboarding';
  return 'general_navigation';
}

/** Event-id pattern (pasted ID) e.g. evt-qapi-2026-q2. */
const EVENT_ID = /\bevt-[a-z0-9-]+\b/i;
const EVENT_TYPE_WORD = /\b(qapi|governing body|compliance|emergency drill|incident review)\b/i;

function extractPacketType(text: string): string | undefined {
  const t = text.toLowerCase();
  // Match longest/most specific first.
  if (/governing body/.test(t)) return 'governing_body';
  if (/emergency drill/.test(t)) return 'emergency_drill';
  if (/incident review/.test(t)) return 'incident_review';
  if (/\bqapi\b/.test(t)) return 'qapi';
  if (/\bcompliance\b/.test(t)) return 'compliance';
  if (/\bgeneral\b/.test(t)) return 'general';
  return undefined;
}

function extractEvent(text: string): string | undefined {
  const id = text.match(EVENT_ID);
  if (id) return id[0];
  // "for the QAPI event" / "for QAPI" style → use the event-type word as the event handle.
  const forMatch = text.match(/\bfor (the )?([a-z0-9 -]{2,40}?)(event|meeting|review|packet|$)/i);
  if (forMatch && forMatch[2] && EVENT_TYPE_WORD.test(forMatch[2])) return forMatch[2].trim();
  return undefined;
}

function requiredSlotsFor(domain: GuidedDomain): GuidedTourSlot[] {
  if (domain === 'event_packet') {
    return [
      { id: 'event', label: 'Event', required: true, type: 'event' },
      { id: 'packet_type', label: 'Packet type', required: true, type: 'choice', options: PACKET_TYPE_OPTIONS },
    ];
  }
  return [];
}

/** True when the prompt is asking for a guided walkthrough. */
export function isGuidedAssistanceRequest(prompt: string): boolean {
  return GUIDED_TRIGGERS.some((re) => re.test(prompt));
}

/**
 * Classify a prompt into a guided-assistance intent, extracting any slots already
 * present. `prior` carries slots already collected across earlier turns.
 * Returns null when the prompt is not a guided-assistance request.
 */
export function classifyGuidedAssistance(
  prompt: string,
  prior: Record<string, unknown> = {},
): GuidedAssistanceIntent | null {
  if (!isGuidedAssistanceRequest(prompt)) return null;

  const domain = detectDomain(prompt);
  const requiredSlots = requiredSlotsFor(domain);

  const collectedSlots: Record<string, unknown> = { ...prior };
  if (domain === 'event_packet') {
    if (collectedSlots.packet_type == null) {
      const pt = extractPacketType(prompt);
      if (pt) collectedSlots.packet_type = pt;
    }
    if (collectedSlots.event == null) {
      const ev = extractEvent(prompt);
      if (ev) collectedSlots.event = ev;
    }
  }

  const missingSlots = requiredSlots.filter((s) => s.required && collectedSlots[s.id] == null);
  const matchCount = GUIDED_TRIGGERS.filter((re) => re.test(prompt)).length;

  return {
    kind: 'guided_assistance',
    taskIntent: prompt.trim(),
    confidence: Math.min(1, 0.6 + matchCount * 0.2 + (domain !== 'general_navigation' ? 0.2 : 0)),
    domain,
    requiredSlots,
    collectedSlots,
    missingSlots,
    shouldAskFollowUp: missingSlots.length > 0,
    // Any tourable domain launches once its required slots (if any) are collected.
    shouldLaunchTour: TOURABLE_DOMAINS.has(domain) && missingSlots.length === 0,
  };
}

/**
 * Apply a free-text answer to the next missing slot of an in-progress intent and
 * recompute. Used for multi-turn slot collection ("which event?" → user replies).
 */
export function applySlotAnswer(intent: GuidedAssistanceIntent, answer: string): GuidedAssistanceIntent {
  const next = intent.missingSlots[0];
  const collectedSlots = { ...intent.collectedSlots };

  if (next) {
    if (next.id === 'packet_type') {
      const pt = extractPacketType(answer) ?? matchOptionValue(answer, next.options);
      collectedSlots.packet_type = pt ?? answer.trim();
    } else if (next.id === 'event') {
      const ev = extractEvent(answer);
      collectedSlots.event = ev ?? answer.trim();
    } else {
      collectedSlots[next.id] = answer.trim();
    }
  }

  const missingSlots = intent.requiredSlots.filter((s) => s.required && collectedSlots[s.id] == null);
  return {
    ...intent,
    collectedSlots,
    missingSlots,
    shouldAskFollowUp: missingSlots.length > 0,
    shouldLaunchTour: !!intent.domain && TOURABLE_DOMAINS.has(intent.domain) && missingSlots.length === 0,
  };
}

function matchOptionValue(answer: string, options?: Array<{ label: string; value: string }>): string | undefined {
  if (!options) return undefined;
  const a = answer.trim().toLowerCase();
  return options.find((o) => o.value === a || o.label.toLowerCase() === a)?.value;
}

/** The conversational follow-up Brad asks for a given missing slot. */
export function followUpQuestion(slot: GuidedTourSlot | undefined): string {
  if (!slot) return 'Which event and packet type should I guide you through?';
  if (slot.id === 'event') {
    return 'I can guide you through that. Which event do you want to generate a packet for? You can paste an event ID (like evt-qapi-2026-q2) or choose an event type — QAPI, Governing Body, Compliance, Emergency Drill, or Incident Review.';
  }
  if (slot.id === 'packet_type') {
    return 'Got it. Which packet type should I generate — General, QAPI, Governing Body, Compliance, Emergency Drill, or Incident Review?';
  }
  return `Which ${slot.label.toLowerCase()} should I use?`;
}
