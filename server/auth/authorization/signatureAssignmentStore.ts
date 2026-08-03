/**
 * ADR-0002 Phase 5B (persistence) — durable SignatureAuthorityAssignment store.
 *
 * Mirrors the page-access persistence pattern (file_local for dev, dynamodb for
 * multi-instance). Carries §B9 capability metadata so callers can gate high-risk
 * mutations on real durability. Pure grant/revoke helpers keep the policy
 * (fail-closed capacity validation, revoke-by-status) out of the I/O layer.
 */
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../../env.js';
import { ApiError } from '../../errors.js';
import { log } from '../../logger.js';
import { resolveSignatureCapacity } from './signatureCatalog.js';
import { setSignatureAssignmentProvider } from './signerResolution.js';
import type {
  AuthorityBasis, SignatureAuthorityAssignment, SignatureAuthorityScope,
} from './signatureAuthority.js';

export interface PersistenceCapabilities {
  singleInstanceDurable: boolean;
  crossProcessSafe: boolean;
  multiInstanceShared: boolean;
  compareAndSet: boolean;
  idempotentMutations: boolean;
  durableMutationIntent: boolean;
  appendOnlyAudit: boolean;
  productionAuditEligible: boolean;
}

export interface SignatureAssignmentPersistence {
  provider: 'file_local' | 'dynamodb_registration';
  capabilities: PersistenceCapabilities;
  getAll(): Promise<SignatureAuthorityAssignment[]>;
  putAll(list: SignatureAuthorityAssignment[]): Promise<SignatureAuthorityAssignment[]>;
}

const FILE_CAPS: PersistenceCapabilities = {
  singleInstanceDurable: true, crossProcessSafe: false, multiInstanceShared: false,
  compareAndSet: false, idempotentMutations: false, durableMutationIntent: false,
  appendOnlyAudit: false, productionAuditEligible: false,
};
const DYNAMO_CAPS: PersistenceCapabilities = {
  singleInstanceDurable: true, crossProcessSafe: true, multiInstanceShared: true,
  compareAndSet: true, idempotentMutations: true, durableMutationIntent: true,
  appendOnlyAudit: false, productionAuditEligible: true,
};

function sanitize(raw: unknown): SignatureAuthorityAssignment[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((a): a is SignatureAuthorityAssignment =>
    !!a && typeof a === 'object'
    && typeof (a as SignatureAuthorityAssignment).assignmentId === 'string'
    && typeof (a as SignatureAuthorityAssignment).userId === 'string'
    && typeof (a as SignatureAuthorityAssignment).signatureRoleId === 'string');
}

class FileSignatureAssignmentStore implements SignatureAssignmentPersistence {
  readonly provider = 'file_local' as const;
  readonly capabilities = FILE_CAPS;
  private dir = path.join(env.repoRoot, '.cache', 'signature-authority');
  private file = path.join(this.dir, 'assignments.json');

  private ensure() { if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true }); }

  async getAll(): Promise<SignatureAuthorityAssignment[]> {
    this.ensure();
    try {
      if (!fs.existsSync(this.file)) return [];
      return sanitize(JSON.parse(fs.readFileSync(this.file, 'utf8')));
    } catch (err) {
      log.warn('signature_authority.file.read_failed', { error: (err as Error).message });
      return [];
    }
  }

  async putAll(list: SignatureAuthorityAssignment[]): Promise<SignatureAuthorityAssignment[]> {
    this.ensure();
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(list, null, 2), 'utf8');
    fs.renameSync(tmp, this.file);
    return list;
  }
}

class DynamoSignatureAssignmentStore implements SignatureAssignmentPersistence {
  readonly provider = 'dynamodb_registration' as const;
  readonly capabilities = DYNAMO_CAPS;
  private table = env.registrationTableName;
  private doc: { send: (cmd: unknown) => Promise<unknown> } | null = null;
  private cmds: Record<string, new (input: unknown) => unknown> | null = null;

  private async client() {
    if (this.doc && this.cmds) return { doc: this.doc, cmds: this.cmds };
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const lib = await import('@aws-sdk/lib-dynamodb');
    const base = new DynamoDBClient({ region: env.awsRegion || 'us-west-1' });
    this.doc = lib.DynamoDBDocumentClient.from(base) as unknown as { send: (cmd: unknown) => Promise<unknown> };
    this.cmds = {
      Get: lib.GetCommand as unknown as new (input: unknown) => unknown,
      Put: lib.PutCommand as unknown as new (input: unknown) => unknown,
    };
    return { doc: this.doc, cmds: this.cmds };
  }

  async getAll(): Promise<SignatureAuthorityAssignment[]> {
    if (!this.table) throw new ApiError('internal_error', 'REGISTRATION_TABLE_NAME is not configured.', 500);
    const { doc, cmds } = await this.client();
    const res = (await doc.send(new cmds.Get({
      TableName: this.table, Key: { pk: 'SIGNATURE_AUTHORITY', sk: 'STATE' },
    }))) as { Item?: { assignments?: unknown } };
    return sanitize(res.Item?.assignments);
  }

  async putAll(list: SignatureAuthorityAssignment[]): Promise<SignatureAuthorityAssignment[]> {
    if (!this.table) throw new ApiError('internal_error', 'REGISTRATION_TABLE_NAME is not configured.', 500);
    const { doc, cmds } = await this.client();
    await doc.send(new cmds.Put({
      TableName: this.table,
      Item: { pk: 'SIGNATURE_AUTHORITY', sk: 'STATE', updatedAt: new Date().toISOString(), assignments: list },
    }));
    return list;
  }
}

let cached: SignatureAssignmentPersistence | null = null;
export function getSignatureAssignmentStore(): SignatureAssignmentPersistence {
  if (cached) return cached;
  cached = env.registrationTableName ? new DynamoSignatureAssignmentStore() : new FileSignatureAssignmentStore();
  log.info('signature_authority.provider.ready', { provider: cached.provider });
  return cached;
}
export function __resetSignatureAssignmentStoreForTests(): void { cached = null; }

/* ── eCIgn provider bridge (sync snapshot) ─────────────────────────────────── */
// resolveVerifiedSigner (eCIgn signing) is synchronous and cannot await the
// store, so it reads this snapshot. It starts EMPTY → fail-closed, and is
// refreshed whenever an admin lists/mutates assignments. A durable multi-instance
// deployment must also prime it at startup (ADR §D release blocker).
let assignmentCache: SignatureAuthorityAssignment[] = [];
export function primeAssignmentCache(list: SignatureAuthorityAssignment[]): void {
  assignmentCache = list;
}
setSignatureAssignmentProvider((userId) => assignmentCache.filter((a) => a.userId === userId));

/* ── pure policy helpers (fail-closed) ─────────────────────────────────────── */

export interface GrantAssignmentInput {
  userId: string;
  signatureRoleId: string;
  authorityBasis: AuthorityBasis;
  scope: SignatureAuthorityScope;
  effectiveFrom: string;
  effectiveUntil?: string;
  grantedBy: string;
  reason: string;
  delegatedFromUserId?: string;
  delegationId?: string;
}

/** Create a new active assignment. Fail-closed: an unresolvable capacity throws. */
export function grantAssignment(
  list: readonly SignatureAuthorityAssignment[],
  input: GrantAssignmentInput,
  newAssignmentId: string,
): { list: SignatureAuthorityAssignment[]; assignment: SignatureAuthorityAssignment } {
  const resolved = resolveSignatureCapacity(input.signatureRoleId);
  if (!resolved.matched || !resolved.capacity) {
    throw new ApiError('validation_error', `Unknown signature capacity: ${input.signatureRoleId}`, 400);
  }
  const assignment: SignatureAuthorityAssignment = {
    assignmentId: newAssignmentId,
    userId: input.userId,
    signatureRoleId: resolved.capacity, // store the canonical capacity, not the raw alias
    authorityBasis: input.authorityBasis,
    scope: input.scope,
    effectiveFrom: input.effectiveFrom,
    effectiveUntil: input.effectiveUntil,
    delegatedFromUserId: input.delegatedFromUserId,
    delegationId: input.delegationId,
    grantedBy: input.grantedBy,
    reason: input.reason,
    status: 'active',
    version: 1,
  };
  return { list: [...list, assignment], assignment };
}

/** Revoke an assignment by id (idempotent). Throws if not found. */
export function revokeAssignment(
  list: readonly SignatureAuthorityAssignment[],
  assignmentId: string,
): SignatureAuthorityAssignment[] {
  if (!list.some((a) => a.assignmentId === assignmentId)) {
    throw new ApiError('user_not_found', `Assignment not found: ${assignmentId}`, 404);
  }
  return list.map((a) => (a.assignmentId === assignmentId
    ? { ...a, status: 'revoked' as const, version: a.version + 1 }
    : a));
}

/** Assignments belonging to a user (all statuses). */
export function assignmentsForUser(
  list: readonly SignatureAuthorityAssignment[],
  userId: string,
): SignatureAuthorityAssignment[] {
  return list.filter((a) => a.userId === userId);
}
