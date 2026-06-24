import type { WebSafetyResult, NolanSource } from './types.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Web Content Safety Guard (Nolan-side)
   ----------------------------------------------------------------------------
   Retrieved web text is DATA, never instruction. This strips HTML/script,
   quarantines prompt-injection attempts, and flags low-quality/unsafe sources.
   Brad treats Nolan output as untrusted regardless.
   ═══════════════════════════════════════════════════════════════════════════ */

const INJECTION_PATTERNS: RegExp[] = [
  /ignore (?:all )?(?:previous|prior|above) instructions/i,
  /disregard (?:the )?(?:system|previous) prompt/i,
  /reveal (?:your )?(?:system )?prompt/i,
  /(?:call|use|invoke) (?:the )?internal tools?/i,
  /(?:request|provide|enter) (?:your )?credentials|api[ _-]?key|password/i,
  /retrieve (?:private|internal|patient) data/i,
  /(?:modify|delete|overwrite) (?:files?|records?)/i,
  /execute (?:the following )?code|run this script/i,
  /contact (?:another|the other) agent|message brad/i,
  /disable (?:the )?(?:safeguards?|safety|guardrails?)/i,
];

function stripHtml(s: string): { text: string; stripped: boolean } {
  const stripped = /<[^>]+>/.test(s) || /<script/i.test(s);
  const text = s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { text, stripped };
}

const TRUSTED_TLDS = /\.(gov|mil|edu)(\/|$)/i;
const TRUSTED_HOSTS = /(cms\.gov|hhs\.gov|oig\.hhs\.gov|federalregister\.gov|cdc\.gov|jointcommission\.org|chapinc\.org|achc\.org)/i;

export function classifySourceSafety(sources: NolanSource[]): number {
  let unsafe = 0;
  for (const s of sources) {
    const trusted = TRUSTED_TLDS.test(s.url) || TRUSTED_HOSTS.test(s.url)
      || s.sourceTier === 'official' || s.sourceTier === 'primary' || s.sourceTier === 'peer-reviewed';
    if (!trusted) unsafe++;
  }
  return unsafe;
}

export function scanWebContent(raw: string, sources: NolanSource[] = []): WebSafetyResult {
  const { text, stripped } = stripHtml(raw);
  const quarantined: string[] = [];
  for (const re of INJECTION_PATTERNS) {
    const m = text.match(re);
    if (m) quarantined.push(m[0].slice(0, 80));
  }
  return {
    promptInjectionDetected: quarantined.length > 0,
    quarantinedInstructions: quarantined,
    strippedHtml: stripped,
    unsafeSourceCount: classifySourceSafety(sources),
    cleanedText: text,
  };
}

/** A maximum-size guard for retrieved documents (defense against oversized payloads). */
export const MAX_WEB_DOC_BYTES = 512 * 1024;
export function withinSizeLimit(s: string): boolean {
  return Buffer.byteLength(s, 'utf8') <= MAX_WEB_DOC_BYTES;
}
