import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  deleteToken,
  generateSetupToken,
  getRegistration,
  json,
  normalizeEmail,
  nowIso,
  sendSetupEmail,
  writeRegistration,
  writeToken,
} from './common.js';

const DEFAULT_MESSAGE = 'If your email is eligible, we sent a setup link. Please check your inbox.';

export async function handler(event: APIGatewayProxyEventV2) {
  const body = event.body ? JSON.parse(event.body) as { email?: string } : {};
  const email = normalizeEmail(body.email || '');
  if (!email || !email.includes('@')) {
    return json(400, { error: { code: 'validation_error', message: 'Please enter a valid email address.' } });
  }

  const registration = await getRegistration(email);
  if (!registration || registration.status !== 'pending_setup') {
    return json(200, { message: DEFAULT_MESSAGE });
  }

  const { token, tokenHash, expiresAt } = generateSetupToken();
  const now = nowIso();

  if (registration.setupTokenHash) {
    await deleteToken(registration.setupTokenHash);
  }

  await writeRegistration({
    ...registration,
    setupTokenHash: tokenHash,
    setupTokenExpiresAt: expiresAt,
    updatedAt: now,
  });
  await writeToken(tokenHash, email, now, expiresAt);
  await sendSetupEmail(email, token);

  return json(200, { message: DEFAULT_MESSAGE });
}
