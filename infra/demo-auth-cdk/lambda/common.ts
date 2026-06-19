import crypto from 'node:crypto';
import {
  AdminCreateUserCommand,
  AdminEnableUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  GetUserCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export type RegistrationStatus = 'pending_setup' | 'active' | 'pending_admin_approval' | 'disabled';

export interface RegistrationRecord {
  pk: string;
  sk: 'REGISTRATION';
  email: string;
  emailDomain: string;
  cognitoUsername?: string;
  status: RegistrationStatus;
  setupTokenHash?: string;
  setupTokenExpiresAt?: number;
  setupCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface TokenRecord {
  pk: string;
  sk: 'SETUP';
  email: string;
  status: 'pending_setup';
  createdAt: string;
  expiresAt: number;
}

export interface DemoUser {
  id?: string;
  authSubject?: string;
  provider?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
}

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

const region = mustEnv('AWS_REGION');
const userPoolId = mustEnv('COGNITO_USER_POOL_ID');
const clientId = mustEnv('COGNITO_CLIENT_ID');
const fromEmail = mustEnv('FROM_EMAIL');
const appBaseUrl = mustEnv('APP_BASE_URL');
const tableName = mustEnv('REGISTRATION_TABLE_NAME');
const setupTokenTtlMinutes = Number(process.env.SETUP_TOKEN_TTL_MINUTES || 60);
const defaultIdentityGroupId = 'grp-pending-user';
const privilegedIdentityGroupIds = new Set(['grp-super-admin', 'grp-admin', 'grp-system', 'grp-user-access-admin']);
const identityRoleUpdateExemptUserIds = new Set([
  'demo-user-careindeed',
  'usr-marites',
  'usr-deeb-admin',
]);
const identityRoleUpdateExemptEmails = new Set([
  'robertp@careindeed.com',
  'maritesa@careindeed.com',
  'deeb@careindeed.com',
]);
const autoApprovedDomain = String(process.env.AUTO_APPROVED_DOMAIN || 'careindeed.com').toLowerCase();
const autoApprovedEmails = String(process.env.AUTO_APPROVED_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);
const defaultProtectedAuthEmails = [
  'robertp@careindeed.com',
  'tjpadilla@careindeed.com',
  'tj@careindeed.com',
  'maritesa@careindeed.com',
  'marites@careindeed.com',
  'deeb@careindeed.com',
  'dee@careindeed.com',
].join(',');
const protectedAuthEmails = String(process.env.PROTECTED_AUTH_EMAILS || defaultProtectedAuthEmails)
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);
const adminManualPasswordEmails = String(
  process.env.ADMIN_MANUAL_PASSWORD_EMAILS || 'robertp@careindeed.com,maritesa@careindeed.com,marites@careindeed.com',
)
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);
const demoAuthDebug = /^(1|true|yes|on)$/i.test(String(process.env.DEMO_AUTH_DEBUG || 'false'));

export const clients = {
  cognito: new CognitoIdentityProviderClient({ region }),
  ses: new SESClient({ region }),
  ddb: DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
    marshallOptions: { removeUndefinedValues: true },
  }),
};

export const config = {
  userPoolId,
  clientId,
  fromEmail,
  appBaseUrl,
  tableName,
  setupTokenTtlMinutes,
  autoApprovedDomain,
  autoApprovedEmails,
  protectedAuthEmails,
  adminManualPasswordEmails,
  demoAuthDebug,
};

export function mustEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

export function jsonError(
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
) {
  const payload: Record<string, unknown> = {
    error: {
      code,
      message,
    },
  };

  if (config.demoAuthDebug && details && Object.keys(details).length > 0) {
    payload.error = {
      ...(payload.error as Record<string, unknown>),
      details,
    };
  }

  return json(statusCode, payload);
}

export function logRegistrationAttempt(stage: string, data: Record<string, unknown>) {
  console.log(JSON.stringify({
    event: 'register_request',
    stage,
    debugMode: config.demoAuthDebug,
    timestamp: nowIso(),
    ...data,
  }));
}

export function normalizeEmail(emailRaw: string): string {
  return String(emailRaw || '').trim().toLowerCase();
}

export function emailDomain(email: string): string {
  const idx = email.lastIndexOf('@');
  return idx >= 0 ? email.slice(idx + 1) : '';
}

export function isProtectedAuthEmail(emailRaw: string): boolean {
  return config.protectedAuthEmails.includes(normalizeEmail(emailRaw));
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function nowEpochSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function registrationKey(email: string) {
  return { pk: `EMAIL#${email}`, sk: 'REGISTRATION' as const };
}

export function tokenKey(tokenHash: string) {
  return { pk: `TOKEN#${tokenHash}`, sk: 'SETUP' as const };
}

export function appIdentityStateKey() {
  return { pk: 'APP_IDENTITY', sk: 'STATE' as const };
}

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function generateSetupToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = nowEpochSeconds() + setupTokenTtlMinutes * 60;
  return { token, tokenHash, expiresAt };
}

export function parseBody(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function parseBearerToken(rawAuthHeader: string | undefined): string {
  const auth = String(rawAuthHeader || '');
  return auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : '';
}

export async function getRegistration(email: string): Promise<RegistrationRecord | null> {
  const result = await clients.ddb.send(new GetCommand({
    TableName: config.tableName,
    Key: registrationKey(email),
  }));
  return (result.Item as RegistrationRecord | undefined) ?? null;
}

export async function getCurrentUser(accessToken: string) {
  return clients.cognito.send(new GetUserCommand({ AccessToken: accessToken }));
}

export async function assertAdminAccessToken(accessToken: string): Promise<string> {
  if (!accessToken) {
    throw new Error('Not authenticated.');
  }

  const me = await getCurrentUser(accessToken);
  const email = normalizeEmail(
    (me.UserAttributes ?? []).find(attr => attr.Name === 'email')?.Value || '',
  );
  if (!config.adminManualPasswordEmails.includes(email)) {
    throw new Error('You do not have permission to manage user access.');
  }
  return email;
}

export async function writeRegistration(record: RegistrationRecord): Promise<void> {
  await clients.ddb.send(new PutCommand({
    TableName: config.tableName,
    Item: record,
  }));
}

export async function writeToken(tokenHash: string, email: string, createdAt: string, expiresAt: number): Promise<void> {
  const item: TokenRecord = {
    ...tokenKey(tokenHash),
    email,
    status: 'pending_setup',
    createdAt,
    expiresAt,
  };
  await clients.ddb.send(new PutCommand({
    TableName: config.tableName,
    Item: item,
  }));
}

export async function deleteToken(tokenHash: string): Promise<void> {
  await clients.ddb.send(new DeleteCommand({
    TableName: config.tableName,
    Key: tokenKey(tokenHash),
  }));
}

export async function ensureCognitoUser(email: string): Promise<void> {
  try {
    await clients.cognito.send(new AdminGetUserCommand({
      UserPoolId: config.userPoolId,
      Username: email,
    }));
  } catch {
    await clients.cognito.send(new AdminCreateUserCommand({
      UserPoolId: config.userPoolId,
      Username: email,
      MessageAction: 'SUPPRESS',
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'false' },
      ],
    }));
  }
}

export async function sendSetupEmail(email: string, token: string): Promise<string | undefined> {
  const setupLink = `${config.appBaseUrl.replace(/\/$/, '')}/setup-account?token=${encodeURIComponent(token)}`;
  const response = await clients.ses.send(new SendEmailCommand({
    Source: config.fromEmail,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Set up your Care Indeed account' },
      Body: {
        Text: {
          Data: [
            'Hello,',
            '',
            'Your access request has been accepted.',
            '',
            `Please complete setup using this secure link: ${setupLink}`,
            '',
            `This link expires in ${config.setupTokenTtlMinutes} minutes and can only be used once.`,
          ].join('\n'),
        },
      },
    },
  }));
  return response.MessageId;
}

export async function activateUser(email: string, firstName: string, lastName: string, password: string): Promise<void> {
  await ensureCognitoUser(email);
  await clients.cognito.send(new AdminSetUserPasswordCommand({
    UserPoolId: config.userPoolId,
    Username: email,
    Password: password,
    Permanent: true,
  }));
  await clients.cognito.send(new AdminUpdateUserAttributesCommand({
    UserPoolId: config.userPoolId,
    Username: email,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
      { Name: 'given_name', Value: firstName },
      { Name: 'family_name', Value: lastName },
    ],
  }));
  await clients.cognito.send(new AdminEnableUserCommand({
    UserPoolId: config.userPoolId,
    Username: email,
  }));
}

export async function loginCognito(email: string, password: string) {
  return clients.cognito.send(new InitiateAuthCommand({
    ClientId: config.clientId,
    AuthFlow: 'USER_PASSWORD_AUTH',
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  }));
}

export async function respondToNewPasswordChallenge(email: string, session: string, newPassword: string) {
  return clients.cognito.send(new RespondToAuthChallengeCommand({
    ClientId: config.clientId,
    ChallengeName: 'NEW_PASSWORD_REQUIRED',
    Session: session,
    ChallengeResponses: {
      USERNAME: email,
      NEW_PASSWORD: newPassword,
    },
  }));
}

export async function refreshCognito(refreshToken: string) {
  return clients.cognito.send(new InitiateAuthCommand({
    ClientId: config.clientId,
    AuthFlow: 'REFRESH_TOKEN_AUTH',
    AuthParameters: {
      REFRESH_TOKEN: refreshToken,
    },
  }));
}

export async function getUser(accessToken: string) {
  return clients.cognito.send(new GetUserCommand({ AccessToken: accessToken }));
}

export async function logout(accessToken: string) {
  if (!accessToken) return;
  await clients.cognito.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
}

export async function markActive(email: string): Promise<void> {
  const now = nowIso();
  await clients.ddb.send(new UpdateCommand({
    TableName: config.tableName,
    Key: registrationKey(email),
    UpdateExpression: 'SET #status = :active, setupCompletedAt = :setupCompletedAt, updatedAt = :updatedAt REMOVE setupTokenHash, setupTokenExpiresAt',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':active': 'active',
      ':setupCompletedAt': now,
      ':updatedAt': now,
    },
  }));
}

export interface PageAccessStateRecord {
  pk: 'PAGE_ACCESS';
  sk: 'STATE';
  updatedAt: string;
  access: Record<string, unknown>;
}

export async function getPageAccessState(): Promise<Record<string, unknown>> {
  const result = await clients.ddb.send(new GetCommand({
    TableName: config.tableName,
    Key: { pk: 'PAGE_ACCESS', sk: 'STATE' },
  }));
  const item = result.Item as PageAccessStateRecord | undefined;
  return item?.access && typeof item.access === 'object' ? item.access : {};
}

export async function putPageAccessState(access: Record<string, unknown>): Promise<Record<string, unknown>> {
  await clients.ddb.send(new PutCommand({
    TableName: config.tableName,
    Item: {
      pk: 'PAGE_ACCESS',
      sk: 'STATE',
      updatedAt: nowIso(),
      access,
    } satisfies PageAccessStateRecord,
  }));
  return access;
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
  const parts = (email.split('@')[0] ?? '').split(/[._-]+/).filter(Boolean);
  return parts.length > 0
    ? parts.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ')
    : email;
}

function normalizeIdentityUser(user: AppIdentityUser): AppIdentityUser | null {
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
  return identityRoleUpdateExemptUserIds.has(user.id)
    || identityRoleUpdateExemptEmails.has(normalizeEmail(user.email));
}

export function normalizeIdentityRegistry(input: AppIdentityRegistry): AppIdentityRegistry {
  const users = Array.isArray(input.users)
    ? input.users.map(user => normalizeIdentityUser(user)).filter((user): user is AppIdentityUser => !!user)
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
      && privilegedIdentityGroupIds.has(assignment.groupId)
      ? {
          ...assignment,
          groupId: defaultIdentityGroupId,
          scope: { organizationId: 'careindeed-demo' },
          effectiveFrom: nowIso,
        }
      : assignment,
  );
}

function mergeIdentityUser(registry: AppIdentityRegistry, incoming: AppIdentityUser): AppIdentityRegistry {
  const normalized = normalizeIdentityUser(incoming);
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

export function userFromCognitoAttributes(attrs: Record<string, string>, username?: string): DemoUser {
  const firstName = attrs.given_name;
  const lastName = attrs.family_name;
  const name = attrs.name || [firstName, lastName].filter(Boolean).join(' ').trim() || undefined;
  const authSubject = attrs.sub || username;
  return {
    id: authSubject,
    authSubject,
    provider: 'cognito',
    email: attrs.email ?? '',
    name,
    firstName,
    lastName,
    emailVerified: attrs.email_verified === 'true',
  };
}

export async function getAppIdentityRegistry(): Promise<AppIdentityRegistry> {
  const result = await clients.ddb.send(new GetCommand({
    TableName: config.tableName,
    Key: appIdentityStateKey(),
  }));
  const item = result.Item as { registry?: AppIdentityRegistry } | undefined;
  return normalizeIdentityRegistry(item?.registry ?? { users: [], assignments: [] });
}

export async function putAppIdentityRegistry(registry: AppIdentityRegistry): Promise<AppIdentityRegistry> {
  const normalized = normalizeIdentityRegistry(registry);
  await clients.ddb.send(new PutCommand({
    TableName: config.tableName,
    Item: {
      ...appIdentityStateKey(),
      updatedAt: nowIso(),
      registry: normalized,
    },
  }));
  return normalized;
}

export async function upsertAuthenticatedIdentity(authUser: DemoUser): Promise<AppIdentityRegistry> {
  const email = normalizeEmail(authUser.email);
  const id = identityIdFor(authUser);
  if (!email || !id) return { users: [], assignments: [] };

  const now = nowIso();
  const current = await getAppIdentityRegistry();
  const next = mergeIdentityUser(current, {
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
          groupId: defaultIdentityGroupId,
          scope: { organizationId: 'careindeed-demo' },
          effectiveFrom: now,
        },
      ];
    }
  }

  const saved = await putAppIdentityRegistry({ users: next.users, assignments });
  return {
    users: saved.users.filter(candidate => candidate.id === targetId || normalizeEmail(candidate.email) === email),
    assignments: saved.assignments.filter(assignment => assignment.userId === targetId),
  };
}

export async function listActiveRegistrations(): Promise<RegistrationRecord[]> {
  const records: RegistrationRecord[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const result = await clients.ddb.send(new ScanCommand({
      TableName: config.tableName,
      ExclusiveStartKey,
      FilterExpression: 'begins_with(pk, :emailPrefix) AND sk = :registration AND #status = :active',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':emailPrefix': 'EMAIL#',
        ':registration': 'REGISTRATION',
        ':active': 'active',
      },
    }));
    records.push(...((result.Items ?? []) as RegistrationRecord[]));
    ExclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (ExclusiveStartKey);

  return records;
}

export async function syncActiveRegistrationsIntoIdentityRegistry(): Promise<AppIdentityRegistry> {
  const current = await getAppIdentityRegistry();
  const records = await listActiveRegistrations();
  const now = nowIso();
  let next = current;

  for (const record of records) {
    const email = normalizeEmail(record.email);
    if (!email) continue;
    next = mergeIdentityUser(next, {
      id: `email:${email}`,
      email,
      name: displayNameFor(record),
      status: 'pending',
      source: 'authenticated',
      provider: 'cognito',
      createdAt: record.createdAt ?? now,
      lastLoginAt: record.updatedAt,
    });

    const user = next.users.find(candidate => normalizeEmail(candidate.email) === email);
    const userId = user?.id ?? `email:${email}`;
    if (!user || isIdentityRoleUpdateExempt(user)) continue;
    next = {
      ...next,
      assignments: downgradeInheritedPrivilegedAssignments(next.assignments, userId, now),
    };
    if (activeAssignmentFor(next.assignments, userId)) continue;
    if (!activeAssignmentFor(next.assignments, userId)) {
      next = {
        ...next,
        assignments: [
          ...next.assignments,
          {
            id: assignmentId(),
            userId,
            groupId: defaultIdentityGroupId,
            scope: { organizationId: 'careindeed-demo' },
            effectiveFrom: now,
          },
        ],
      };
    }
  }

  const saved = await putAppIdentityRegistry(next);
  return { ...saved, syncedCount: records.length };
}
