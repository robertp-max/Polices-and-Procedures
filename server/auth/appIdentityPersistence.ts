import fs from 'node:fs';
import path from 'node:path';
import { env } from '../env.js';
import { ApiError } from '../errors.js';
import { log } from '../logger.js';
import type { DemoUser, RegistrationRecord } from './types.js';

export interface AppIdentityUser {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'pending' | 'suspended';
  source?: 'manual-provisioned' | 'seed' | 'authenticated';
  authSubject?: string;
  provider?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AppRoleAssignment {
  id: string;
  userId: string;
  groupId: string;
  scope: { organizationId: string; branchId?: string; programId?: string; patientId?: string };
  effectiveFrom: string;
  effectiveTo?: string;
  revokedAt?: string;
}

export interface AppIdentityRegistry {
  users: AppIdentityUser[];
  assignments: AppRoleAssignment[];
  syncedCount?: number;
}

interface AppIdentityPersistence {
  provider: 'file_local' | 'dynamodb_registration';
  getAll(): Promise<AppIdentityRegistry>;
  putAll(registry: AppIdentityRegistry): Promise<AppIdentityRegistry>;
  listActiveRegistrations(): Promise<RegistrationRecord[]>;
}

const STATE_KEY = { pk: 'APP_IDENTITY', sk: 'STATE' };
const DEFAULT_GROUP_ID = 'grp-pending-user';
const DEFAULT_ORG_ID = 'careindeed-demo';
const PRIVILEGED_GROUP_IDS = new Set(['grp-super-admin', 'grp-admin', 'grp-system', 'grp-user-access-admin']);
const IDENTITY_ROLE_UPDATE_EXEMPT_USER_IDS = new Set([
  'demo-user-careindeed',
  'usr-marites',
  'usr-deeb-admin',
]);
const IDENTITY_ROLE_UPDATE_EXEMPT_EMAILS = new Set([
  'robertp@careindeed.com',
  'maritesa@careindeed.com',
  'deeb@careindeed.com',
]);

function normalizeEmail(email: string | null | undefined): string {
  return String(email ?? '').trim().toLowerCase();
}

function providerOf(user: DemoUser | AppIdentityUser): string {
  return String(user.provider ?? '').trim().toLowerCase() || 'cognito';
}

function authSubjectOf(user: DemoUser | AppIdentityUser): string {
  return String(user.authSubject ?? user.id ?? '').trim();
}

function identityIdFor(user: DemoUser): string {
  const subject = authSubjectOf(user);
  if (subject) return `auth:${providerOf(user)}:${encodeURIComponent(subject.toLowerCase())}`;
  const email = normalizeEmail(user.email);
  return email ? `email:${email}` : '';
}

function displayNameFor(user: DemoUser | RegistrationRecord): string {
  if ('name' in user && user.name?.trim()) return user.name.trim();
  if ('firstName' in user || 'lastName' in user) {
    const full = [user.firstName?.trim(), user.lastName?.trim()].filter(Boolean).join(' ').trim();
    if (full) return full;
  }
  const email = normalizeEmail(user.email);
  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[._-]+/).filter(Boolean);
  return parts.length > 0
    ? parts.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ')
    : email;
}

function normalizeUser(user: AppIdentityUser): AppIdentityUser | null {
  const email = normalizeEmail(user.email);
  if (!user.id || !email) return null;
  return {
    ...user,
    email,
    name: user.name?.trim() || displayNameFor({ email } as RegistrationRecord),
    provider: user.provider?.trim().toLowerCase() || undefined,
    authSubject: user.authSubject?.trim() || undefined,
  };
}

function isIdentityRoleUpdateExempt(user: Pick<AppIdentityUser, 'id' | 'email'>): boolean {
  return IDENTITY_ROLE_UPDATE_EXEMPT_USER_IDS.has(user.id)
    || IDENTITY_ROLE_UPDATE_EXEMPT_EMAILS.has(normalizeEmail(user.email));
}

function normalizeRegistry(input: AppIdentityRegistry): AppIdentityRegistry {
  const users = Array.isArray(input.users)
    ? input.users.map(user => normalizeUser(user)).filter((user): user is AppIdentityUser => !!user)
    : [];
  const assignments = Array.isArray(input.assignments)
    ? input.assignments.filter((assignment): assignment is AppRoleAssignment =>
        !!assignment
        && typeof assignment.id === 'string'
        && typeof assignment.userId === 'string'
        && typeof assignment.groupId === 'string'
        && !!assignment.scope
        && typeof assignment.effectiveFrom === 'string',
      )
    : [];
  return { users, assignments };
}

function subjectKey(user: AppIdentityUser): string {
  return user.authSubject ? `${(user.provider || 'cognito').toLowerCase()}:${user.authSubject.trim().toLowerCase()}` : '';
}

function activeAssignmentFor(assignments: AppRoleAssignment[], userId: string): AppRoleAssignment | undefined {
  return assignments.find(assignment => assignment.userId === userId && !assignment.revokedAt);
}

function assignmentId(): string {
  return 'asn-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function downgradeInheritedPrivilegedAssignments(
  assignments: AppRoleAssignment[],
  userId: string,
  nowIso: string,
): AppRoleAssignment[] {
  return assignments.map(assignment =>
    assignment.userId === userId
      && !assignment.revokedAt
      && PRIVILEGED_GROUP_IDS.has(assignment.groupId)
      ? {
          ...assignment,
          groupId: DEFAULT_GROUP_ID,
          scope: { organizationId: DEFAULT_ORG_ID },
          effectiveFrom: nowIso,
        }
      : assignment,
  );
}

function mergeUser(registry: AppIdentityRegistry, incoming: AppIdentityUser): AppIdentityRegistry {
  const normalized = normalizeUser(incoming);
  if (!normalized) return registry;

  const existing = registry.users.find(user => {
    if (user.id === normalized.id) return true;
    if (normalizeEmail(user.email) === normalized.email) return true;
    const key = subjectKey(normalized);
    return !!key && subjectKey(user) === key;
  });

  const targetId = existing?.source === 'seed' ? existing.id : normalized.id;
  const oldIds = new Set<string>([targetId, normalized.id, `email:${normalized.email}`]);
  if (existing) oldIds.add(existing.id);

  const nextUser: AppIdentityUser = {
    ...(existing ?? normalized),
    ...normalized,
    id: targetId,
    email: normalized.email,
    status: existing?.status ?? normalized.status,
    source: existing?.source === 'seed' ? 'seed' : normalized.source,
    createdAt: existing?.createdAt ?? normalized.createdAt,
    lastLoginAt: normalized.lastLoginAt ?? existing?.lastLoginAt,
  };

  return {
    users: registry.users
      .filter(user => !oldIds.has(user.id) && normalizeEmail(user.email) !== normalized.email)
      .concat(nextUser),
    assignments: registry.assignments.map(assignment =>
      oldIds.has(assignment.userId) ? { ...assignment, userId: targetId } : assignment,
    ),
  };
}

class FileAppIdentityPersistence implements AppIdentityPersistence {
  readonly provider = 'file_local' as const;
  private dir = path.join(env.repoRoot, '.cache', 'app-identity');
  private file = path.join(this.dir, 'registry.json');

  private ensure() {
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
  }

  async getAll(): Promise<AppIdentityRegistry> {
    this.ensure();
    try {
      if (!fs.existsSync(this.file)) return { users: [], assignments: [] };
      const raw = fs.readFileSync(this.file, 'utf8');
      return normalizeRegistry(JSON.parse(raw) as AppIdentityRegistry);
    } catch (err) {
      log.warn('app_identity.file.read_failed', { error: (err as Error).message });
      return { users: [], assignments: [] };
    }
  }

  async putAll(registry: AppIdentityRegistry): Promise<AppIdentityRegistry> {
    this.ensure();
    const normalized = normalizeRegistry(registry);
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(normalized, null, 2), 'utf8');
    fs.renameSync(tmp, this.file);
    return normalized;
  }

  async listActiveRegistrations(): Promise<RegistrationRecord[]> {
    return [];
  }
}

class DynamoAppIdentityPersistence implements AppIdentityPersistence {
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
    this.cmds = {
      Get: lib.GetCommand as unknown as new (input: unknown) => unknown,
      Put: lib.PutCommand as unknown as new (input: unknown) => unknown,
      Scan: lib.ScanCommand as unknown as new (input: unknown) => unknown,
    };
    return { doc: this.doc, cmds: this.cmds };
  }

  async getAll(): Promise<AppIdentityRegistry> {
    if (!this.table) {
      throw new ApiError('internal_error', 'REGISTRATION_TABLE_NAME is not configured.', 500);
    }
    const { doc, cmds } = await this.client();
    const res = (await doc.send(new cmds.Get({
      TableName: this.table,
      Key: STATE_KEY,
    }))) as { Item?: { registry?: AppIdentityRegistry } };
    return normalizeRegistry(res.Item?.registry ?? { users: [], assignments: [] });
  }

  async putAll(registry: AppIdentityRegistry): Promise<AppIdentityRegistry> {
    if (!this.table) {
      throw new ApiError('internal_error', 'REGISTRATION_TABLE_NAME is not configured.', 500);
    }
    const normalized = normalizeRegistry(registry);
    const { doc, cmds } = await this.client();
    await doc.send(new cmds.Put({
      TableName: this.table,
      Item: {
        ...STATE_KEY,
        updatedAt: new Date().toISOString(),
        registry: normalized,
      },
    }));
    return normalized;
  }

  async listActiveRegistrations(): Promise<RegistrationRecord[]> {
    if (!this.table) return [];
    const { doc, cmds } = await this.client();
    const records: RegistrationRecord[] = [];
    let ExclusiveStartKey: Record<string, unknown> | undefined;

    do {
      const res = (await doc.send(new cmds.Scan({
        TableName: this.table,
        ExclusiveStartKey,
        FilterExpression: 'begins_with(pk, :emailPrefix) AND sk = :registration AND #status = :active',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':emailPrefix': 'EMAIL#',
          ':registration': 'REGISTRATION',
          ':active': 'active',
        },
      }))) as { Items?: RegistrationRecord[]; LastEvaluatedKey?: Record<string, unknown> };

      records.push(...(res.Items ?? []));
      ExclusiveStartKey = res.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    return records;
  }
}

let cached: AppIdentityPersistence | null = null;

export function getAppIdentityPersistence(): AppIdentityPersistence {
  if (cached) return cached;
  cached = env.registrationTableName
    ? new DynamoAppIdentityPersistence()
    : new FileAppIdentityPersistence();
  log.info('app_identity.provider.ready', { provider: cached.provider });
  return cached;
}

export async function upsertAuthenticatedIdentity(authUser: DemoUser): Promise<AppIdentityRegistry> {
  const email = normalizeEmail(authUser.email);
  const id = identityIdFor(authUser);
  if (!email || !id) return { users: [], assignments: [] };

  const now = new Date().toISOString();
  const persistence = getAppIdentityPersistence();
  const current = await persistence.getAll();
  const next = mergeUser(current, {
    id,
    email,
    name: displayNameFor(authUser),
    status: 'pending',
    source: 'authenticated',
    authSubject: authSubjectOf(authUser) || undefined,
    provider: providerOf(authUser),
    createdAt: now,
    lastLoginAt: now,
  });

  const user = next.users.find(candidate => candidate.id === id || normalizeEmail(candidate.email) === email);
  const targetId = user?.id ?? id;
  let assignments = next.assignments;
  if (!user || !isIdentityRoleUpdateExempt(user)) {
    assignments = downgradeInheritedPrivilegedAssignments(assignments, targetId, now);
    if (!activeAssignmentFor(assignments, targetId)) {
      assignments = [
        ...assignments,
        {
          id: assignmentId(),
          userId: targetId,
          groupId: DEFAULT_GROUP_ID,
          scope: { organizationId: DEFAULT_ORG_ID },
          effectiveFrom: now,
        },
      ];
    }
  }

  const saved = await persistence.putAll({ users: next.users, assignments });
  return {
    users: saved.users.filter(candidate => candidate.id === targetId || normalizeEmail(candidate.email) === email),
    assignments: saved.assignments.filter(assignment => assignment.userId === targetId),
  };
}

export async function syncActiveRegistrationsIntoIdentityRegistry(): Promise<AppIdentityRegistry> {
  const persistence = getAppIdentityPersistence();
  const current = await persistence.getAll();
  const records = await persistence.listActiveRegistrations();
  const now = new Date().toISOString();

  let next = current;
  for (const record of records) {
    const email = normalizeEmail(record.email);
    if (!email) continue;
    next = mergeUser(next, {
      id: `email:${email}`,
      email,
      name: displayNameFor(record),
      status: 'pending',
      source: 'authenticated',
      provider: 'cognito',
      createdAt: record.createdAt ?? now,
      lastLoginAt: record.updatedAt,
    });

    if (!activeAssignmentFor(next.assignments, `email:${email}`)) {
      const user = next.users.find(candidate => normalizeEmail(candidate.email) === email);
      const userId = user?.id ?? `email:${email}`;
      if (!user || isIdentityRoleUpdateExempt(user)) continue;
      next = {
        ...next,
        assignments: downgradeInheritedPrivilegedAssignments(next.assignments, userId, now),
      };
      if (activeAssignmentFor(next.assignments, userId)) continue;
      next = {
        ...next,
        assignments: [
          ...next.assignments,
          {
            id: assignmentId(),
            userId,
            groupId: DEFAULT_GROUP_ID,
            scope: { organizationId: DEFAULT_ORG_ID },
            effectiveFrom: now,
          },
        ],
      };
    }
  }

  const saved = await persistence.putAll(next);
  return { ...saved, syncedCount: records.length };
}
