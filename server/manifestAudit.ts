import { createHash } from 'node:crypto';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { log } from './logger.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Survey-defensible audit trail for Drive CSV manifest writes. Each entry is
   hash-chained (prevHash → chainHash) and appended as JSONL so the manifest
   history is tamper-evident and replayable.
   ═══════════════════════════════════════════════════════════════════════════ */

const AUDIT_PATH = process.env.MANIFEST_AUDIT_PATH || 'data/manifest-audit.jsonl';

export interface ManifestAuditInput {
  actor: string;
  eventId: string;
  workflowId?: string;
  packetType: string;
  fileId: string;
  driveLink: string;
  manifestFileId: string;
  action: 'updated' | 'appended';
  priorHash: string | null;
  newHash: string;
  priorRow: unknown;
  newRow: unknown;
  timestamp: string;
}
export interface ManifestAuditEntry extends ManifestAuditInput {
  sequence: number;
  prevChainHash: string;
  chainHash: string;
}

let _seq = -1;
let _prevChain = '';

async function loadTail(): Promise<void> {
  if (_seq >= 0) return;
  try {
    const text = await readFile(AUDIT_PATH, 'utf8');
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length) {
      const last = JSON.parse(lines[lines.length - 1]) as ManifestAuditEntry;
      _seq = last.sequence; _prevChain = last.chainHash;
      return;
    }
  } catch { /* no prior file */ }
  _seq = 0; _prevChain = '';
}

/** Append a hash-chained manifest-write audit entry. Best-effort; never throws. */
export async function appendManifestAudit(input: ManifestAuditInput): Promise<ManifestAuditEntry | null> {
  try {
    await loadTail();
    const sequence = ++_seq;
    const prevChainHash = _prevChain;
    const payloadHash = createHash('sha256').update(JSON.stringify({ ...input, sequence })).digest('hex');
    const chainHash = createHash('sha256').update(prevChainHash + payloadHash).digest('hex');
    _prevChain = chainHash;
    const entry: ManifestAuditEntry = { ...input, sequence, prevChainHash, chainHash };
    await mkdir(dirname(AUDIT_PATH), { recursive: true });
    await appendFile(AUDIT_PATH, JSON.stringify(entry) + '\n', 'utf8');
    log.info('manifest.audit.appended', {
      sequence, actor: input.actor, eventId: input.eventId, workflowId: input.workflowId,
      packetType: input.packetType, fileId: input.fileId, action: input.action,
      priorHash: input.priorHash, newHash: input.newHash, chainHash,
    });
    return entry;
  } catch (e) {
    log.error('manifest.audit.failed', { error: e instanceof Error ? e.message : String(e), fileId: input.fileId });
    return null;
  }
}
