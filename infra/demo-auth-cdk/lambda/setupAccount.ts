import { GetCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  activateUser,
  config,
  deleteToken,
  getRegistration,
  hashToken,
  json,
  markActive,
  clients,
  tokenKey,
} from './common.js';

export async function handler(event: APIGatewayProxyEventV2) {
  const body = event.body ? JSON.parse(event.body) as {
    token?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
  } : {};

  const tokenRaw = String(body.token || '');
  const firstName = String(body.firstName || '').trim();
  const lastName = String(body.lastName || '').trim();
  const password = String(body.password || '');

  if (!tokenRaw) {
    return json(400, { error: { code: 'validation_error', message: 'Invalid setup token.' } });
  }
  if (!firstName || !lastName) {
    return json(400, { error: { code: 'validation_error', message: 'First name and last name are required.' } });
  }
  if (password.length < 8) {
    return json(400, { error: { code: 'validation_error', message: 'Password must be at least 8 characters.' } });
  }

  const tokenHash = hashToken(tokenRaw);
  const tokenResult = await clients.ddb.send(new GetCommand({
    TableName: config.tableName,
    Key: tokenKey(tokenHash),
  }));

  const tokenRecord = tokenResult.Item as { email: string; expiresAt: number } | undefined;
  if (!tokenRecord) {
    return json(400, { error: { code: 'validation_error', message: 'This setup link is invalid or already used.' } });
  }

  const now = Math.floor(Date.now() / 1000);
  if (tokenRecord.expiresAt <= now) {
    await deleteToken(tokenHash);
    return json(400, { error: { code: 'validation_error', message: 'This setup link has expired.' } });
  }

  const registration = await getRegistration(tokenRecord.email);
  if (!registration || registration.status !== 'pending_setup') {
    await deleteToken(tokenHash);
    return json(400, { error: { code: 'validation_error', message: 'This setup link is no longer valid.' } });
  }

  await activateUser(tokenRecord.email, firstName, lastName, password);
  await markActive(tokenRecord.email);
  await deleteToken(tokenHash);

  return json(200, { success: true });
}
