import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  AdminEnableUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  assertAdminAccessToken,
  clients,
  config,
  ensureCognitoUser,
  getRegistration,
  isProtectedAuthEmail,
  json,
  jsonError,
  normalizeEmail,
  nowIso,
  parseBearerToken,
  parseBody,
  registrationKey,
  writeRegistration,
  type RegistrationRecord,
} from './common.js';

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const accessToken = parseBearerToken(event.headers.authorization);
    const actorEmail = await assertAdminAccessToken(accessToken);
    const body = parseBody(event.body ?? null) as { email?: string; newPassword?: string };
    const targetEmail = normalizeEmail(body.email || '');
    const newPassword = String(body.newPassword || '');

    if (!targetEmail || !targetEmail.includes('@')) {
      return jsonError(400, 'validation_error', 'Please enter a valid user email address.');
    }
    if (isProtectedAuthEmail(targetEmail)) {
      console.warn(JSON.stringify({ event: 'auth.admin_grant_access.blocked_protected_account', actorEmail, targetEmail }));
      return jsonError(403, 'protected_account', 'This account is protected and cannot be changed from the admin grant-access tool.');
    }
    if (!newPassword || newPassword.length < 8) {
      return jsonError(400, 'validation_error', 'Password must be at least 8 characters.');
    }

    await ensureCognitoUser(targetEmail);
    await clients.cognito.send(new AdminSetUserPasswordCommand({
      UserPoolId: config.userPoolId,
      Username: targetEmail,
      Password: newPassword,
      Permanent: true,
    }));
    await clients.cognito.send(new AdminUpdateUserAttributesCommand({
      UserPoolId: config.userPoolId,
      Username: targetEmail,
      UserAttributes: [
        { Name: 'email', Value: targetEmail },
        { Name: 'email_verified', Value: 'true' },
      ],
    }));
    await clients.cognito.send(new AdminEnableUserCommand({
      UserPoolId: config.userPoolId,
      Username: targetEmail,
    }));

    const now = nowIso();
    const existing = await getRegistration(targetEmail);
    const record: RegistrationRecord = {
      ...(existing?.pk ? existing : registrationKey(targetEmail)),
      email: targetEmail,
      emailDomain: targetEmail.split('@')[1] || '',
      cognitoUsername: targetEmail,
      status: 'active',
      setupCompletedAt: existing?.setupCompletedAt ?? now,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      approvedAt: existing?.approvedAt ?? now,
      approvedBy: actorEmail,
    };
    delete (record as Partial<RegistrationRecord>).setupTokenHash;
    delete (record as Partial<RegistrationRecord>).setupTokenExpiresAt;
    await writeRegistration(record);

    console.log(JSON.stringify({ event: 'auth.admin_grant_access.success', actorEmail, targetEmail }));
    return json(200, { message: 'Access granted successfully.' });
  } catch (err) {
    const message = (err as Error).message || 'Internal error';
    const status = message === 'Not authenticated.' ? 401 : message.includes('permission') ? 403 : 500;
    const code = status === 401 ? 'auth_error' : status === 403 ? 'forbidden' : 'internal_error';
    return jsonError(status, code, message);
  }
}
