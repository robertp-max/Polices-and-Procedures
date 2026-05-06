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
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

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

const region = mustEnv('AWS_REGION');
const userPoolId = mustEnv('COGNITO_USER_POOL_ID');
const clientId = mustEnv('COGNITO_CLIENT_ID');
const fromEmail = mustEnv('FROM_EMAIL');
const appBaseUrl = mustEnv('APP_BASE_URL');
const tableName = mustEnv('REGISTRATION_TABLE_NAME');
const setupTokenTtlMinutes = Number(process.env.SETUP_TOKEN_TTL_MINUTES || 60);
const autoApprovedDomain = String(process.env.AUTO_APPROVED_DOMAIN || 'careindeed.com').toLowerCase();
const autoApprovedEmails = String(process.env.AUTO_APPROVED_EMAILS || '')
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

export async function getRegistration(email: string): Promise<RegistrationRecord | null> {
  const result = await clients.ddb.send(new GetCommand({
    TableName: config.tableName,
    Key: registrationKey(email),
  }));
  return (result.Item as RegistrationRecord | undefined) ?? null;
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
