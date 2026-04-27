// CEU repository + factory.
// See Builder/Security-Execution-Audit/02-Execution-Unit-System.md.

import type {
  ExecutionUnit, CeuId, CeuSourceSystem, CeuState,
  EvidenceRequirement, SignatureRequirement, PolicyVersionRef, GroupId,
} from './types';
import { uuidv7 } from './hash';

export interface CeuRepository {
  get(id: CeuId): ExecutionUnit | undefined;
  put(ceu: ExecutionUnit): void;
  list(filter?: (c: ExecutionUnit) => boolean): ExecutionUnit[];
  byBundle(bundleId: string): ExecutionUnit[];
}

export class InMemoryCeuRepository implements CeuRepository {
  private map = new Map<CeuId, ExecutionUnit>();
  get(id: CeuId) { return this.map.get(id); }
  put(ceu: ExecutionUnit) { this.map.set(ceu.id, ceu); }
  list(filter?: (c: ExecutionUnit) => boolean) {
    const all = [...this.map.values()];
    return filter ? all.filter(filter) : all;
  }
  byBundle(bundleId: string) {
    return this.list(c => c.dependencies.bundleId === bundleId);
  }
}

let _repo: CeuRepository = new InMemoryCeuRepository();
export function getCeuRepo(): CeuRepository { return _repo; }
export function setCeuRepo(r: CeuRepository): void { _repo = r; }

// ---------- Factory inputs ----------

export interface CeuCreateInput {
  source: { system: CeuSourceSystem; sourceId: string; correlationId: string };
  title: string;
  description: string;
  classification: ExecutionUnit['classification'];
  ownership: Partial<ExecutionUnit['ownership']> & { requiredRoles: GroupId[] };
  requiredEvidence?: EvidenceRequirement[];
  requiredSignatures?: SignatureRequirement[];
  policyRef?: PolicyVersionRef;
  parentId?: CeuId;
  bundleId?: string;
  blockedBy?: CeuId[];
  relatedTo?: CeuId[];
  dueAt?: string;
  slaHours?: number;
  metadata?: Record<string, unknown>;
}

let _seq = 0;
function shortCode(): string {
  const d = new Date();
  const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  _seq = (_seq + 1) % 100000;
  return `CEU-${ym}-${String(_seq).padStart(5, '0')}`;
}

export function createCeu(input: CeuCreateInput): ExecutionUnit {
  const now = new Date().toISOString();
  const ownership: ExecutionUnit['ownership'] = {
    assigneeUserId: input.ownership.assigneeUserId,
    assigneeGroupId: input.ownership.assigneeGroupId,
    requiredRoles: input.ownership.requiredRoles,
    reviewerUserId: input.ownership.reviewerUserId,
    requiresReviewer: input.ownership.requiresReviewer ?? false,
  };
  const ceu: ExecutionUnit = {
    id: uuidv7(),
    shortCode: shortCode(),
    title: input.title,
    description: input.description,
    source: input.source,
    policyRef: input.policyRef,
    classification: input.classification,
    ownership,
    evidence: { required: input.requiredEvidence ?? [], submitted: [] },
    signatures: { required: input.requiredSignatures ?? [], collected: [] },
    dependencies: {
      blockedBy: input.blockedBy ?? [],
      relatedTo: input.relatedTo ?? [],
      parentId: input.parentId,
      childIds: [],
      bundleId: input.bundleId,
    },
    schedule: {
      createdAt: now,
      dueAt: input.dueAt,
      slaHours: input.slaHours,
    },
    state: 'NotStarted',
    stateHistory: [],
    metadata: input.metadata ?? {},
    version: 1,
  };

  // Wire parent linkage
  if (input.parentId) {
    const parent = getCeuRepo().get(input.parentId);
    if (parent) {
      parent.dependencies.childIds = [...parent.dependencies.childIds, ceu.id];
      parent.version += 1;
      getCeuRepo().put(parent);
    }
  }

  // Initial state may be Blocked if blockers unmet
  if (ceu.dependencies.blockedBy.length > 0) {
    const repo = getCeuRepo();
    const unmet = ceu.dependencies.blockedBy.filter(id => repo.get(id)?.state !== 'Completed');
    if (unmet.length > 0) {
      ceu.state = 'Blocked';
      ceu.blockReasons = unmet.map(id => ({
        code: 'dep.blocked_by',
        message: `Blocked by ${id}`,
        since: now,
        clearableBy: ['Compliance'],
        blockingCeuId: id,
      }));
    }
  }

  getCeuRepo().put(ceu);
  return ceu;
}

// Cycle detection for dependency edits.
export function wouldCreateCycle(repo: CeuRepository, ceuId: CeuId, addBlockedBy: CeuId): boolean {
  // BFS from addBlockedBy following its blockedBy edges; if we reach ceuId, adding edge creates cycle.
  const seen = new Set<CeuId>();
  const queue: CeuId[] = [addBlockedBy];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === ceuId) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    const c = repo.get(cur);
    if (!c) continue;
    for (const b of c.dependencies.blockedBy) queue.push(b);
  }
  return false;
}

// State derivation for a parent CEU from its children.
export function deriveParentState(repo: CeuRepository, parentId: CeuId): CeuState | null {
  const parent = repo.get(parentId);
  if (!parent || parent.dependencies.childIds.length === 0) return null;
  const children = parent.dependencies.childIds
    .map(id => repo.get(id))
    .filter((c): c is ExecutionUnit => Boolean(c));
  if (children.length === 0) return null;
  if (children.some(c => c.state === 'Failed')) return 'Failed';
  if (children.every(c => c.state === 'Completed')) return 'Completed';
  if (children.some(c => c.state === 'Blocked')) return 'Blocked';
  if (children.some(c => c.state === 'AtRisk')) return 'AtRisk';
  if (children.some(c => c.state === 'AwaitingSignature')) return 'AwaitingSignature';
  if (children.some(c => c.state === 'AwaitingEvidence')) return 'AwaitingEvidence';
  if (children.some(c => c.state === 'InProgress')) return 'InProgress';
  return 'NotStarted';
}
