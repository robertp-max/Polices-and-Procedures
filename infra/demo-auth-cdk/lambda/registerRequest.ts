import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  config,
  deleteToken,
  emailDomain,
  ensureCognitoUser,
  generateSetupToken,
  getRegistration,
  json,
  jsonError,
  logRegistrationAttempt,
  normalizeEmail,
  nowIso,
  parseBody,
  sendSetupEmail,
  writeRegistration,
  writeToken,
} from './common.js';

const DEFAULT_MESSAGE = 'If your email is eligible, we sent a setup link. Please check your inbox.';

export async function handler(event: APIGatewayProxyEventV2) {
  const body = parseBody(event.body ?? null) as { email?: string };
  const email = normalizeEmail(body.email || '');
  const requestId = event.requestContext.requestId;

  logRegistrationAttempt('incoming', {
    requestId,
    emailRaw: body.email || '',
    email,
  });

  if (!email || !email.includes('@')) {
    logRegistrationAttempt('validation_failed', {
      requestId,
      reason: 'invalid_email',
      email,
    });
    return jsonError(400, 'validation_error', 'Please enter a valid email address.');
  }

  const domain = emailDomain(email);
  logRegistrationAttempt('validated', {
    requestId,
    email,
    domain,
    allowedDomain: config.autoApprovedDomain,
  });

  if (domain !== config.autoApprovedDomain && !config.autoApprovedEmails.includes(email)) {
    logRegistrationAttempt('domain_rejected', {
      requestId,
      email,
      domain,
      allowedDomain: config.autoApprovedDomain,
    });
    return jsonError(403, 'validation_error', `Only @${config.autoApprovedDomain} email addresses are allowed.`);
  }

  const now = nowIso();
  const existing = await getRegistration(email);

  try {
    const { token, tokenHash, expiresAt } = generateSetupToken();
    if (existing?.setupTokenHash) {
      await deleteToken(existing.setupTokenHash);
    }

    await ensureCognitoUser(email);
    logRegistrationAttempt('cognito_ok', { requestId, email });

    await writeRegistration({
      ...(existing?.pk ? existing : { pk: `EMAIL#${email}`, sk: 'REGISTRATION' as const }),
      email,
      emailDomain: domain,
      cognitoUsername: email,
      status: 'pending_setup',
      setupTokenHash: tokenHash,
      setupTokenExpiresAt: expiresAt,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    await writeToken(tokenHash, email, now, expiresAt);

    try {
      const messageId = await sendSetupEmail(email, token);
      logRegistrationAttempt('email_sent', { requestId, email, messageId });
      return json(200, { requiresApproval: false, message: DEFAULT_MESSAGE });
    } catch (err) {
      const errCode = String((err as { name?: string; code?: string })?.name || (err as { code?: string })?.code || 'unknown');
      const errMessage = (err as Error)?.message || 'Unknown email delivery failure';
      logRegistrationAttempt('email_send_failed', {
        requestId,
        email,
        errCode,
        errMessage,
      });

      if (config.demoAuthDebug) {
        const setupLink = `${config.appBaseUrl.replace(/\/$/, '')}/setup-account?token=${encodeURIComponent(token)}`;
        return json(200, {
          requiresApproval: false,
          message: 'Registration accepted, but setup email delivery is pending. Contact administrator.',
          debug: {
            setupLink,
            emailDelivery: {
              ok: false,
              errCode,
              errMessage,
            },
          },
        });
      }

      return jsonError(
        502,
        'upstream_error',
        'Registration accepted, but setup email delivery is pending. Contact administrator.',
        { errCode, errMessage },
      );
    }
  } catch (err) {
    const errCode = String((err as { name?: string; code?: string })?.name || (err as { code?: string })?.code || 'unknown');
    const errMessage = (err as Error)?.message || 'Unknown registration failure';
    logRegistrationAttempt('failed', {
      requestId,
      email,
      errCode,
      errMessage,
    });
    return jsonError(500, 'internal_error', 'Registration failed due to a system error. Please try again shortly.', {
      errCode,
      errMessage,
    });
  }
}
