import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ConfirmForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { clients, config, getRegistration, json, normalizeEmail } from './common.js';

export async function handler(event: APIGatewayProxyEventV2) {
  const body = event.body
    ? JSON.parse(event.body) as { email?: string; code?: string; newPassword?: string }
    : {};

  const email = normalizeEmail(body.email || '');
  const code = String(body.code || '').trim();
  const newPassword = String(body.newPassword || '');

  if (!email || !email.includes('@')) {
    return json(400, { error: { code: 'validation_error', message: 'Please enter a valid email address.' } });
  }
  if (!code) {
    return json(400, { error: { code: 'validation_error', message: 'Please enter the reset code from your email.' } });
  }
  if (!newPassword || newPassword.length < 8) {
    return json(400, { error: { code: 'validation_error', message: 'Password must be at least 8 characters.' } });
  }

  const registration = await getRegistration(email);
  if (!registration || registration.status !== 'active') {
    return json(400, { error: { code: 'auth_error', message: 'Invalid or expired reset code.' } });
  }

  try {
    await clients.cognito.send(new ConfirmForgotPasswordCommand({
      ClientId: config.clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    }));
  } catch (err: unknown) {
    const errCode = (err as { name?: string }).name;
    if (errCode === 'CodeMismatchException' || errCode === 'ExpiredCodeException') {
      return json(400, { error: { code: 'auth_error', message: 'The reset code is invalid or has expired. Please request a new one.' } });
    }
    if (errCode === 'InvalidPasswordException') {
      return json(400, { error: { code: 'validation_error', message: 'Password does not meet requirements. Use at least 8 characters with uppercase, lowercase, number, and symbol.' } });
    }
    console.error('ConfirmForgotPassword error', errCode, err);
    return json(500, { error: { code: 'internal_error', message: 'Unable to reset password. Please try again.' } });
  }

  return json(200, { message: 'Password reset successfully. You can now sign in with your new password.' });
}
