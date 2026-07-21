/**
 * ADR-0002 §B11 — access-review campaigns (policy-owned, configurable cadence).
 *
 * The platform does NOT hard-code "quarterly". A campaign may only be scheduled
 * with a named `policyBasis` (e.g. CO-DG-101 §4.2 = annual PHI-access review).
 * Pure model + fail-closed create + durable store (file_local / dynamodb),
 * mirroring the signature-assignment store.
 */
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../../env.js';
import { ApiError } from '../../errors.js';
import { log } from '../../logger.js';

export type AccessReviewType =
  | 'phi_access_profile' | 'security_access' | 'page_access'
  | 'signature_authority' | 'delegation' | 'privileged_access';

export type AccessReviewTrigger =
  | 'scheduled' | 'role_change' | 'supervisor_change' | 'organizational_change'
  | 'license_or_competency_change' | 'suspension_or_reactivation'
  | 'termination' | 'incident' | 'audit_finding';

export interface AccessReviewCampaign {
  campaignId: string;
  scope: string;
  reviewType: AccessReviewType;
  startsAt: string;
  dueAt: string;
  requiredReviewers: string[];
  /** REQUIRED — no campaign may be scheduled without a named policy basis. */
  policyBasis: string;
  trigger: AccessReviewTrigger;
  createdAt: string;
  createdBy: string;
}

const REVIEW_TYPES = new Set<AccessReviewType>([
  'phi_access_profile', 'security_access', 'page_access', 'signature_authority', 'delegation', 'privileged_access',
]);
const TRIGGERS = new Set<AccessReviewTrigger>([
  'scheduled', 'role_change', 'supervisor_change', 'organizational_change',
  'license_or_competency_change', 'suspension_or_reactivation', 'termination', 'incident', 'audit_finding',
]);

export interface CreateCampaignInput {
  scope: string;
  reviewType: string;
  startsAt: string;
  dueAt: string;
  requiredReviewers: string[];
  policyBasis: string;
  trigger: string;
  createdBy: string;
}

/** Create a campaign. Fail-closed: unknown reviewType/trigger or a missing
 *  policyBasis throws — the cadence must be policy-owned, never invented. */
export function createCampaign(
  list: readonly AccessReviewCampaign[],
  input: CreateCampaignInput,
  campaignId: string,
  nowIso: string,
): { list: AccessReviewCampaign[]; campaign: AccessReviewCampaign } {
  const policyBasis = String(input.policyBasis ?? '').trim();
  if (!policyBasis) throw new ApiError('validation_error', 'policyBasis is required — cadence must be policy-owned.', 400);
  if (!REVIEW_TYPES.has(input.reviewType as AccessReviewType)) throw new ApiError('validation_error', `Unknown reviewType: ${input.reviewType}`, 400);
  if (!TRIGGERS.has(input.trigger as AccessReviewTrigger)) throw new ApiError('validation_error', `Unknown trigger: ${input.trigger}`, 400);
  const scope = String(input.scope ?? '').trim();
  if (!scope) throw new ApiError('validation_error', 'scope is required.', 400);
  const campaign: AccessReviewCampaign = {
    campaignId,
    scope,
    reviewType: input.reviewType as AccessReviewType,
    startsAt: input.startsAt || nowIso,
    dueAt: input.dueAt || nowIso,
    requiredReviewers: Array.isArray(input.requiredReviewers) ? input.requiredReviewers.filter((r) => typeof r === 'string') : [],
    policyBasis,
    trigger: input.trigger as AccessReviewTrigger,
    createdAt: nowIso,
    createdBy: input.createdBy,
  };
  return { list: [...list, campaign], campaign };
}

function sanitize(raw: unknown): AccessReviewCampaign[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((c): c is AccessReviewCampaign =>
    !!c && typeof c === 'object'
    && typeof (c as AccessReviewCampaign).campaignId === 'string'
    && typeof (c as AccessReviewCampaign).policyBasis === 'string'
    && REVIEW_TYPES.has((c as AccessReviewCampaign).reviewType));
}

export interface AccessReviewStore {
  provider: 'file_local' | 'dynamodb_registration';
  getAll(): Promise<AccessReviewCampaign[]>;
  putAll(list: AccessReviewCampaign[]): Promise<AccessReviewCampaign[]>;
}

class FileAccessReviewStore implements AccessReviewStore {
  readonly provider = 'file_local' as const;
  private dir = path.join(env.repoRoot, '.cache', 'access-review');
  private file = path.join(this.dir, 'campaigns.json');
  private ensure() { if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true }); }
  async getAll(): Promise<AccessReviewCampaign[]> {
    this.ensure();
    try { return fs.existsSync(this.file) ? sanitize(JSON.parse(fs.readFileSync(this.file, 'utf8'))) : []; }
    catch (err) { log.warn('access_review.file.read_failed', { error: (err as Error).message }); return []; }
  }
  async putAll(list: AccessReviewCampaign[]): Promise<AccessReviewCampaign[]> {
    this.ensure();
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(list, null, 2), 'utf8');
    fs.renameSync(tmp, this.file);
    return list;
  }
}

class DynamoAccessReviewStore implements AccessReviewStore {
  readonly provider = 'dynamodb_registration' as const;
  private table = env.registrationTableName;
  private doc: { send: (cmd: unknown) => Promise<unknown> } | null = null;
  private cmds: Record<string, new (input: unknown) => unknown> | null = null;
  private async client() {
    if (this.doc && this.cmds) return { doc: this.doc, cmds: this.cmds };
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const lib = await import('@aws-sdk/lib-dynamodb');
    const base = new DynamoDBClient({ region: env.awsRegion || 'us-west-1' });
    this.doc = lib.DynamoDBDocumentClient.from(base) as unknown as { send: (cmd: unknown) => Promise<unknown> };
    this.cmds = { Get: lib.GetCommand as unknown as new (i: unknown) => unknown, Put: lib.PutCommand as unknown as new (i: unknown) => unknown };
    return { doc: this.doc, cmds: this.cmds };
  }
  async getAll(): Promise<AccessReviewCampaign[]> {
    if (!this.table) throw new ApiError('internal_error', 'REGISTRATION_TABLE_NAME is not configured.', 500);
    const { doc, cmds } = await this.client();
    const res = (await doc.send(new cmds.Get({ TableName: this.table, Key: { pk: 'ACCESS_REVIEW', sk: 'STATE' } }))) as { Item?: { campaigns?: unknown } };
    return sanitize(res.Item?.campaigns);
  }
  async putAll(list: AccessReviewCampaign[]): Promise<AccessReviewCampaign[]> {
    if (!this.table) throw new ApiError('internal_error', 'REGISTRATION_TABLE_NAME is not configured.', 500);
    const { doc, cmds } = await this.client();
    await doc.send(new cmds.Put({ TableName: this.table, Item: { pk: 'ACCESS_REVIEW', sk: 'STATE', updatedAt: new Date().toISOString(), campaigns: list } }));
    return list;
  }
}

let cached: AccessReviewStore | null = null;
export function getAccessReviewStore(): AccessReviewStore {
  if (cached) return cached;
  cached = env.registrationTableName ? new DynamoAccessReviewStore() : new FileAccessReviewStore();
  log.info('access_review.provider.ready', { provider: cached.provider });
  return cached;
}
export function __resetAccessReviewStoreForTests(): void { cached = null; }
