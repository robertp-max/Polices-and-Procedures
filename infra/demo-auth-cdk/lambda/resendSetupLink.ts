import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  config,
  deleteToken,
  generateSetupToken,
  getRegistration,
  json,
  jsonError,
  logRegistrationAttempt,
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
  const requestId = event.requestContext.requestId;

  if (!email || !email.includes('@')) {
    return json(400, { error: { code: 'validation_error', message: 'Please enter a valid email address.' } });
  }

  const registration = await getRegistration(email);
  if (!registration || registration.status !== 'pending_setup') {
    // Do not leak whether the email is registered.
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

  try {
    const messageId = await sendSetupEmail(email, token);
    logRegistrationAttempt('resend_email_sent', { requestId, email, messageId });
    return json(200, { message: DEFAULT_MESSAGE });
  } catch (err) {
    const errCode = String((err as { name?: string; code?: string })?.name || (err as { code?: string })?.code || 'unknown');
    const errMessage = (err as Error)?.message || 'Unknown email delivery failure';
    logRegistrationAttempt('resend_email_send_failed', { requestId, email, errCode, errMessage });

    if (config.demoAuthDebug) {
      const setupLink = `${config.appBaseUrl.replace(/\/$/, '')}/setup-account?token=${encodeURIComponent(token)}`;
      return json(200, {
        message: 'Setup email delivery is currently unavailable. Please contact your administrator.',
        debug: {
          setupLink,
          emailDelivery: { ok: false, errCode, errMessage },
        },
      });
    }

    return jsonError(
      502,
      'upstream_error',
      'Setup email delivery is currently unavailable. Please contact your administrator.',
      { errCode, errMessage },
    );
  }
}
