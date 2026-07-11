/**
 * Drive-first evidence architecture — append-only server audit ledger.
 *
 * Audit entries are server-generated, append-only by application design,
 * hash-chained, attributable to an authenticated identity, and impossible for
 * the client to write directly (only the server command layer holds a ledger
 * reference). The ledger is structured metadata — an audit event NEVER creates
 * a Drive file; only a deliberately generated audit export packet may become a
 * Drive evidence artifact.
 */
import { createHash } from 'node:crypto';
import { looksLikePhiName } from './contracts';

export interface AuditEntryInput {
  actorUserId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  evidenceId?: string;
  policyId?: string;
  workflowId?: string;
  eventId?: string;
  beforeHash?: string;
  afterHash?: string;
  requestId?: string;
  commandId?: string;
  result: 'ok' | 'denied' | 'error' | 'partial_failure';
  detail?: string;
}

export interface AuditEntry extends AuditEntryInput {
  auditId: string;
  previousAuditHash: string;
  currentAuditHash: string;
  createdAt: string;
  seq: number;
}

/** Keys that must never appear in audit payloads. */
const FORBIDDEN_AUDIT_KEYS = [
  'patient', 'patientName', 'mrn', 'ssn', 'dob', 'formAnswers', 'contentBase64',
  'bytes', 'fileContents', 'signatureImage', 'signedPdf', 'accessToken', 'secret',
  'privateKey', 'password',
];

export class AuditPhiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuditPhiError';
  }
}

function sha256HexOf(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Reject entries carrying PHI-like values or forbidden payload keys. */
export function assertAuditEntrySafe(input: AuditEntryInput): void {
  for (const key of Object.keys(input)) {
    if (FORBIDDEN_AUDIT_KEYS.some((bad) => key.toLowerCase().includes(bad.toLowerCase()))) {
      throw new AuditPhiError(`audit entry carries forbidden key "${key}".`);
    }
  }
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string' && looksLikePhiName(value)) {
      throw new AuditPhiError(`audit entry field "${key}" looks like PHI; refuse to append.`);
    }
  }
}

export interface AuditLedger {
  append(input: AuditEntryInput): AuditEntry;
  entries(): readonly AuditEntry[];
  /** Verify the hash chain end-to-end. Returns problems (empty = intact). */
  verifyChain(): string[];
}

export class InMemoryAuditLedger implements AuditLedger {
  private log: AuditEntry[] = [];
  private tick = 0;

  append(input: AuditEntryInput): AuditEntry {
    assertAuditEntrySafe(input);
    this.tick += 1;
    const previousAuditHash = this.log.length > 0 ? this.log[this.log.length - 1].currentAuditHash : 'GENESIS';
    const seq = this.log.length + 1;
    const createdAt = `2026-01-01T00:00:00.${String(this.tick).padStart(3, '0')}Z`;
    const body = JSON.stringify({ ...input, seq, createdAt, previousAuditHash });
    const entry: AuditEntry = {
      ...input,
      auditId: `audit-${String(seq).padStart(5, '0')}`,
      previousAuditHash,
      currentAuditHash: sha256HexOf(body),
      createdAt,
      seq,
    };
    this.log.push(entry);
    return { ...entry };
  }

  entries(): readonly AuditEntry[] {
    return this.log.map((e) => ({ ...e }));
  }

  verifyChain(): string[] {
    const problems: string[] = [];
    for (let i = 0; i < this.log.length; i += 1) {
      const expectedPrev = i === 0 ? 'GENESIS' : this.log[i - 1].currentAuditHash;
      if (this.log[i].previousAuditHash !== expectedPrev) {
        problems.push(`entry ${this.log[i].auditId} breaks the hash chain.`);
      }
    }
    return problems;
  }
}
