import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { clients, config, getRegistration, json, normalizeEmail } from './common.js';

export async function handler(event: APIGatewayProxyEventV2) {
  const body = event.body ? JSON.parse(event.body) as { email?: string } : {};
  const email = normalizeEmail(body.email || '');

  if (!email || !email.includes('@')) {
    return json(400, { error: { code: 'validation_error', message: 'Please enter a valid email address.' } });
  }

  // Check registration exists and is active — use generic message to avoid user enumeration
  const registration = await getRegistration(email);
  if (!registration || registration.status !== 'active') {
    // Return success-like response to prevent user enumeration
    return json(200, { message: 'If an account with that email exists, a reset code has been sent.' });
  }

  try {
    await clients.cognito.send(new ForgotPasswordCommand({
      ClientId: config.clientId,
      Username: email,
    }));
  } catch (err: unknown) {
    const code = (err as { name?: string }).name;
    // Suppress UserNotFoundException to prevent enumeration
    if (code !== 'UserNotFoundException') {
      console.error('ForgotPassword error', code, err);
      return json(500, { error: { code: 'internal_error', message: 'Unable to send reset code. Please try again.' } });
    }
  }

  return json(200, { message: 'If an account with that email exists, a reset code has been sent.' });
}
