import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  AdminEnableUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import {
  clients,
  config,
  json,
  jsonError,
  normalizeEmail,
  nowIso,
  parseBearerToken,
  parseBody,
  assertAdminAccessToken,
  getRegistration,
  isProtectedAuthEmail,
  registrationKey,
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
      console.warn(JSON.stringify({ event: 'auth.admin_set_password.blocked_protected_account', actorEmail, targetEmail }));
      return jsonError(403, 'protected_account', 'This account is protected and cannot be reset from the admin password tool.');
    }
    if (!newPassword || newPassword.length < 8) {
      return jsonError(400, 'validation_error', 'Password must be at least 8 characters.');
    }

    try {
      await clients.cognito.send(new AdminGetUserCommand({
        UserPoolId: config.userPoolId,
        Username: targetEmail,
      }));
    } catch (err) {
      const name = (err as { name?: string })?.name;
      if (name === 'UserNotFoundException' || name === 'ResourceNotFoundException') {
        return jsonError(404, 'validation_error', 'Target user was not found.');
      }
      throw err;
    }

    await clients.cognito.send(new AdminSetUserPasswordCommand({
      UserPoolId: config.userPoolId,
      Username: targetEmail,
      Password: newPassword,
      Permanent: true,
    }));
    await clients.cognito.send(new AdminEnableUserCommand({
      UserPoolId: config.userPoolId,
      Username: targetEmail,
    }));

    const registration = await getRegistration(targetEmail);
    if (registration) {
      await clients.ddb.send(new UpdateCommand({
        TableName: config.tableName,
        Key: registrationKey(targetEmail),
        UpdateExpression: 'SET #status = :active, updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':active': 'active',
          ':updatedAt': nowIso(),
        },
      }));
    }

    console.log(JSON.stringify({ event: 'auth.admin_set_password.success', actorEmail, targetEmail }));
    return json(200, { message: 'Password updated successfully.' });
  } catch (err) {
    const message = (err as Error).message || 'Internal error';
    const status = message === 'Not authenticated.' ? 401 : message.includes('permission') ? 403 : 500;
    const code = status === 401 ? 'auth_error' : status === 403 ? 'forbidden' : 'internal_error';
    return jsonError(status, code, message);
  }
}
