import crypto from 'node:crypto';
import { scanForPhiEgress } from './PhiEgressGuard.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Agent Audit Logger — separated Brad / Nolan / Relay logs.
   ----------------------------------------------------------------------------
   • Brad logs may carry internal audit references (under approved controls).
   • Nolan logs must NEVER contain PHI (scrubbed + verified).
   • Nothing ever logs OTP values, passwords, secrets, tokens, raw signatures,
     or full patient/client/clinician JSON.
   MVP: in-memory ring buffers + redaction. Optional JSONL persistence is gated
   by BRAD_AUDIT_LOG (not enabled here). Stores are separate (no shared sink).
   ═══════════════════════════════════════════════════════════════════════════ */

export interface BradLogEntry {
  requestId: string; actorId: string; role: string; action: string;
  modelId: string; promptVersion: string; phiMode: boolean;
  internalSourceIds?: string[]; eventWorkflowIds?: string[];
  toolCalls?: string[]; result: string; approvals?: string[]; timestamp: string;
}
export interface NolanLogEntry {
  requestId: string; sanitizedQueryHash: string; sanitizedQuery?: string;
  modelId: string; promptVersion: string; searchQueries?: string[];
  sourceUrls?: string[]; sourceHashes?: string[]; responseHash: string;
  safetyWarnings?: string[]; timestamp: string;
}
export interface RelayLogEntry {
  requestId: string; bradActionId: string; egressAllowed: boolean;
  fieldsRemoved: string[]; egressFindings: string[];
  nolanResponseScan: string; correlationIds: string[]; timestamp: string;
}

const SECRET_PATTERNS: RegExp[] = [
  /\b\d{6}\b/g,                                                            // bare 6-digit (common OTP length)
  /(?:otp|passcode|verification|one[- ]?time|pin|code)\b\D{0,12}\d{3,8}/gi, // keyword-proximate OTP (4–8 digits, spaced)
  /(password|secret|token|api[_-]?key|client[_-]?secret)\b[\s:=]*(?:is\s+)?\S+/gi,
  /\bBearer\s+[A-Za-z0-9._\-]+/gi,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g,            // JWT
  /\bAKIA[0-9A-Z]{16}\b/g,
];

/** Remove secrets/OTP/tokens from any string (all logs). */
function scrubSecrets(s: string): string {
  let out = s;
  for (const re of SECRET_PATTERNS) out = out.replace(re, '[REDACTED]');
  return out;
}

/** Nolan-side: scrub secrets AND any PHI; if PHI remains, drop the field entirely. */
export function scrubForNolanLog(s: string | undefined): string | undefined {
  if (s == null) return s;
  const noSecrets = scrubSecrets(s);
  const scan = scanForPhiEgress(noSecrets);
  return scan.allowed ? noSecrets : '[REDACTED:PHI]';
}

export function sha16(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
}

class AgentAuditLogger {
  private brad: BradLogEntry[] = [];
  private nolan: NolanLogEntry[] = [];
  private relay: RelayLogEntry[] = [];
  private readonly cap = 500;

  logBrad(e: Omit<BradLogEntry, 'timestamp'>): void {
    const entry: BradLogEntry = {
      ...e,
      action: scrubSecrets(e.action),
      result: scrubSecrets(e.result),
      internalSourceIds: e.internalSourceIds?.map(scrubSecrets),
      eventWorkflowIds: e.eventWorkflowIds?.map(scrubSecrets),
      toolCalls: e.toolCalls?.map(scrubSecrets),
      approvals: e.approvals?.map(scrubSecrets),
      timestamp: new Date().toISOString(),
    };
    this.push(this.brad, entry);
  }
  logNolan(e: Omit<NolanLogEntry, 'timestamp'>): void {
    const entry: NolanLogEntry = {
      ...e,
      sanitizedQuery: undefined, // policy: Nolan logs store the query HASH only, never the text
      searchQueries: e.searchQueries?.map(q => scrubForNolanLog(q) ?? '').filter(Boolean),
      timestamp: new Date().toISOString(),
    };
    this.push(this.nolan, entry);
  }
  logRelay(e: Omit<RelayLogEntry, 'timestamp'>): void {
    this.push(this.relay, {
      ...e,
      bradActionId: scrubSecrets(e.bradActionId),
      egressFindings: e.egressFindings.map(scrubSecrets),
      correlationIds: e.correlationIds.map(scrubSecrets),
      timestamp: new Date().toISOString(),
    });
  }

  getBradLog(): readonly BradLogEntry[] { return this.brad; }
  getNolanLog(): readonly NolanLogEntry[] { return this.nolan; }
  getRelayLog(): readonly RelayLogEntry[] { return this.relay; }
  reset(): void { this.brad = []; this.nolan = []; this.relay = []; }

  private push<T>(arr: T[], e: T): void {
    arr.push(e);
    if (arr.length > this.cap) arr.shift();
  }
}

export const agentAuditLog = new AgentAuditLogger();
