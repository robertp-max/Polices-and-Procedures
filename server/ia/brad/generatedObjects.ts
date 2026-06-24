import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  BradGeneratedObject, BradObjectMetadata, BradObjectType, WriteStatus,
} from './types.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Append-only Brad generated-object store.
   ----------------------------------------------------------------------------
   • Objects are CREATE-only. Content + provenance are sealed at creation with an
     `immutable_audit_hash`; the store NEVER rewrites a committed object.
   • Lifecycle changes (Super Admin approve/deny/apply) are recorded as separate
     append-only `status-transition` records (event-sourced). Reads fold the
     latest status over the original immutable object, so integrity stays
     verifiable: recomputing the hash over the sealed content/provenance must
     still match `immutable_audit_hash`.
   • Persisted as JSON-lines under a configurable dir (runtime data, gitignored).
   ═══════════════════════════════════════════════════════════════════════════ */

export const HARNESS_VERSION = 'brad-harness-2026.06.24.1';

type StoreRecord =
  | { kind: 'object'; object: BradGeneratedObject }
  | {
      kind: 'status-transition';
      object_id: string;
      write_status: WriteStatus;
      approved_by_super_admin_id?: string;
      at: string;
    };

/** Stable, key-sorted serialization so the audit hash is deterministic. */
function canonicalize(value: unknown): string {
  return JSON.stringify(value, (_k, v) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.keys(v as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = (v as Record<string, unknown>)[k];
          return acc;
        }, {});
    }
    return v;
  });
}

export function sha256Hex(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex');
}

/** Hash over provenance (minus the hash field itself + mutable lifecycle fields)
    plus content. Sealed at creation; deterministic and re-verifiable. */
export function computeImmutableHash(
  metaSansHash: Omit<BradObjectMetadata, 'immutable_audit_hash'>,
  content: unknown,
): string {
  // write_status / approver are lifecycle fields excluded from the content seal.
  const { write_status: _ws, approved_by_super_admin_id: _ap, ...sealed } = metaSansHash;
  return sha256Hex(canonicalize({ sealed, content }));
}

export interface CreateObjectParams<T> {
  objectType: BradObjectType;
  requestedByUserId: string;
  content: T;
  runtimeMode: BradObjectMetadata['runtime_mode'];
  modelProvider: BradObjectMetadata['model_provider'];
  modelId: string;
  promptVersion: string;
  sourceSnapshotHash: string;
  initialWriteStatus: WriteStatus;
  approvedBySuperAdminId?: string;
  sourceEventId?: string;
  sourceWorkflowId?: string;
  sourcePolicyIds?: string[];
  sourceFormIds?: string[];
}

export class GeneratedObjectStore {
  private readonly records: StoreRecord[] = [];

  constructor(private readonly filePath: string | null) {
    if (this.filePath && fs.existsSync(this.filePath)) {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      for (const line of raw.split('\n')) {
        const t = line.trim();
        if (t) this.records.push(JSON.parse(t) as StoreRecord);
      }
    }
  }

  private append(rec: StoreRecord): void {
    this.records.push(rec);
    if (this.filePath) {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.appendFileSync(this.filePath, JSON.stringify(rec) + '\n', 'utf8');
    }
  }

  create<T>(params: CreateObjectParams<T>): BradGeneratedObject<T> {
    const metaSansHash: Omit<BradObjectMetadata, 'immutable_audit_hash'> = {
      object_id: `brad-${params.objectType}-${crypto.randomUUID()}`,
      object_type: params.objectType,
      created_by: 'brad',
      requested_by_user_id: params.requestedByUserId,
      approved_by_super_admin_id: params.approvedBySuperAdminId,
      source_event_id: params.sourceEventId,
      source_workflow_id: params.sourceWorkflowId,
      source_policy_ids: params.sourcePolicyIds ?? [],
      source_form_ids: params.sourceFormIds ?? [],
      generated_at: new Date().toISOString(),
      runtime_mode: params.runtimeMode,
      model_provider: params.modelProvider,
      model_id: params.modelId,
      harness_version: HARNESS_VERSION,
      prompt_version: params.promptVersion,
      source_snapshot_hash: params.sourceSnapshotHash,
      write_status: params.initialWriteStatus,
    };
    const immutable_audit_hash = computeImmutableHash(metaSansHash, params.content);
    const object: BradGeneratedObject<T> = {
      metadata: { ...metaSansHash, immutable_audit_hash },
      content: params.content,
    };
    this.append({ kind: 'object', object: object as BradGeneratedObject });
    return object;
  }

  /** Record a lifecycle transition WITHOUT mutating the sealed object. */
  transition(objectId: string, write_status: WriteStatus, approvedBySuperAdminId?: string): void {
    if (!this.findRaw(objectId)) throw new Error(`unknown object: ${objectId}`);
    this.append({
      kind: 'status-transition',
      object_id: objectId,
      write_status,
      approved_by_super_admin_id: approvedBySuperAdminId,
      at: new Date().toISOString(),
    });
  }

  private findRaw(objectId: string): BradGeneratedObject | null {
    for (const r of this.records) {
      if (r.kind === 'object' && r.object.metadata.object_id === objectId) return r.object;
    }
    return null;
  }

  /** Returns the sealed object with the latest folded lifecycle status. */
  get(objectId: string): BradGeneratedObject | null {
    const base = this.findRaw(objectId);
    if (!base) return null;
    let write_status = base.metadata.write_status;
    let approver = base.metadata.approved_by_super_admin_id;
    for (const r of this.records) {
      if (r.kind === 'status-transition' && r.object_id === objectId) {
        write_status = r.write_status;
        if (r.approved_by_super_admin_id) approver = r.approved_by_super_admin_id;
      }
    }
    return {
      content: base.content,
      metadata: { ...base.metadata, write_status, approved_by_super_admin_id: approver },
    };
  }

  list(filter?: { objectType?: BradObjectType; sourceEventId?: string }): BradGeneratedObject[] {
    const ids = this.records
      .filter((r): r is Extract<StoreRecord, { kind: 'object' }> => r.kind === 'object')
      .map((r) => r.object.metadata.object_id);
    return ids
      .map((id) => this.get(id)!)
      .filter((o) => !filter?.objectType || o.metadata.object_type === filter.objectType)
      .filter((o) => !filter?.sourceEventId || o.metadata.source_event_id === filter.sourceEventId);
  }

  /** Recompute the seal and compare to the stored hash — proves immutability. */
  verifyIntegrity(objectId: string): boolean {
    const base = this.findRaw(objectId);
    if (!base) return false;
    const { immutable_audit_hash, ...metaSansHash } = base.metadata;
    return computeImmutableHash(metaSansHash, base.content) === immutable_audit_hash;
  }
}

/** Required-metadata completeness check (used by tests + the action service). */
export function hasRequiredMetadata(m: BradObjectMetadata): boolean {
  return (
    !!m.object_id &&
    !!m.object_type &&
    m.created_by === 'brad' &&
    !!m.requested_by_user_id &&
    Array.isArray(m.source_policy_ids) &&
    Array.isArray(m.source_form_ids) &&
    !!m.generated_at &&
    !!m.runtime_mode &&
    !!m.model_provider &&
    !!m.model_id &&
    !!m.harness_version &&
    !!m.prompt_version &&
    !!m.source_snapshot_hash &&
    !!m.write_status &&
    !!m.immutable_audit_hash
  );
}

function defaultStorePath(): string | null {
  const dir = process.env.BRAD_OBJECT_STORE_DIR || path.join(process.cwd(), 'data', 'brad');
  return path.join(dir, 'generated-objects.jsonl');
}

let singleton: GeneratedObjectStore | null = null;
export function getGeneratedObjectStore(): GeneratedObjectStore {
  if (!singleton) singleton = new GeneratedObjectStore(defaultStorePath());
  return singleton;
}
