/**
 * Drive-first evidence architecture — evidence metadata store contract.
 *
 * Firestore (DynamoDB/file-local today) is the durable home of evidence
 * METADATA: pointers, state, IDs, hashes, and Drive references — never file
 * bytes. The in-memory implementation supports failure injection so the
 * partial-failure recovery path (Drive file created → metadata write fails →
 * retry reconciles, no duplicate file) can be proven in tests.
 */
import type { DriveFirstEvidenceRecord } from './contracts';
import { validateEvidenceRecord } from './contracts';

export class MetadataStoreError extends Error {
  readonly code: 'validation_error' | 'accepted_evidence_locked' | 'not_found' | 'injected_failure';
  constructor(code: MetadataStoreError['code'], message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'MetadataStoreError';
  }
}

export interface EvidenceMetadataStore {
  put(record: DriveFirstEvidenceRecord): Promise<void>;
  get(evidenceId: string): Promise<DriveFirstEvidenceRecord | null>;
  update(evidenceId: string, patch: Partial<DriveFirstEvidenceRecord>): Promise<DriveFirstEvidenceRecord>;
  listByEvent(eventId: string): Promise<DriveFirstEvidenceRecord[]>;
  listAll(): Promise<DriveFirstEvidenceRecord[]>;
  recordCount(): Promise<number>;
}

/** Fields that identify the accepted artifact and may never change in place. */
const ACCEPTED_LOCKED_FIELDS: readonly (keyof DriveFirstEvidenceRecord)[] = [
  'driveFileId', 'sha256', 'fileName', 'mimeType', 'sizeBytes', 'evidenceId',
  'signedBy', 'signedAt',
];

/** Status changes allowed on an accepted record (correction versions forward). */
const ACCEPTED_ALLOWED_STATUS: readonly string[] = ['accepted', 'superseded'];

export class InMemoryEvidenceMetadataStore implements EvidenceMetadataStore {
  private records = new Map<string, DriveFirstEvidenceRecord>();
  private failNextPutFlag = false;

  /** Test control: make the next put() throw (simulates a Firestore outage). */
  failNextPut(): void {
    this.failNextPutFlag = true;
  }

  async put(record: DriveFirstEvidenceRecord): Promise<void> {
    if (this.failNextPutFlag) {
      this.failNextPutFlag = false;
      throw new MetadataStoreError('injected_failure', 'simulated metadata write failure.');
    }
    const problems = validateEvidenceRecord(record);
    if (problems.length > 0) {
      throw new MetadataStoreError('validation_error', `invalid evidence record: ${problems.join(' ')}`);
    }
    const existing = this.records.get(record.evidenceId);
    if (existing && existing.status === 'accepted') {
      throw new MetadataStoreError('accepted_evidence_locked', 'accepted evidence cannot be overwritten in place; supersede instead.');
    }
    this.records.set(record.evidenceId, { ...record });
  }

  async get(evidenceId: string): Promise<DriveFirstEvidenceRecord | null> {
    const r = this.records.get(evidenceId);
    return r ? { ...r } : null;
  }

  async update(evidenceId: string, patch: Partial<DriveFirstEvidenceRecord>): Promise<DriveFirstEvidenceRecord> {
    const existing = this.records.get(evidenceId);
    if (!existing) throw new MetadataStoreError('not_found', `evidence ${evidenceId} not found.`);
    if (existing.status === 'accepted') {
      for (const field of ACCEPTED_LOCKED_FIELDS) {
        if (field in patch && patch[field] !== existing[field]) {
          throw new MetadataStoreError(
            'accepted_evidence_locked',
            `accepted evidence field "${String(field)}" cannot be changed in place; supersede instead.`,
          );
        }
      }
      if (patch.status && !ACCEPTED_ALLOWED_STATUS.includes(patch.status)) {
        throw new MetadataStoreError(
          'accepted_evidence_locked',
          `accepted evidence cannot transition to "${patch.status}"; supersede instead.`,
        );
      }
    }
    const updated = { ...existing, ...patch };
    this.records.set(evidenceId, updated);
    return { ...updated };
  }

  async listByEvent(eventId: string): Promise<DriveFirstEvidenceRecord[]> {
    return [...this.records.values()].filter((r) => r.eventId === eventId).map((r) => ({ ...r }));
  }

  async listAll(): Promise<DriveFirstEvidenceRecord[]> {
    return [...this.records.values()].map((r) => ({ ...r }));
  }

  async recordCount(): Promise<number> {
    return this.records.size;
  }
}
