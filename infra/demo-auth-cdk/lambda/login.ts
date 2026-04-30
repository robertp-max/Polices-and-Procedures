import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { getRegistration, getUser, json, loginCognito, normalizeEmail } from './common.js';

export async function handler(event: APIGatewayProxyEventV2) {
  const body = event.body ? JSON.parse(event.body) as { email?: string; password?: string } : {};
  const email = normalizeEmail(body.email || '');
  const password = String(body.password || '');

  if (!email || !password) {
    return json(400, { error: { code: 'validation_error', message: 'Email and password are required.' } });
  }

  const registration = await getRegistration(email);
  if (!registration || registration.status !== 'active') {
    return json(403, { error: { code: 'auth_error', message: 'Account is not active.' } });
  }

  try {
    const response = await loginCognito(email, password);
    const auth = response.AuthenticationResult;
    if (!auth?.AccessToken || !auth?.IdToken || !auth?.RefreshToken || !auth?.ExpiresIn || !auth?.TokenType) {
      return json(401, { error: { code: 'auth_error', message: 'Invalid email or password.' } });
    }

    const me = await getUser(auth.AccessToken);
    const attrs = Object.fromEntries((me.UserAttributes ?? []).map(a => [a.Name ?? '', a.Value ?? '']));

    return json(200, {
      session: {
        accessToken: auth.AccessToken,
        idToken: auth.IdToken,
        refreshToken: auth.RefreshToken,
        expiresIn: auth.ExpiresIn,
        tokenType: auth.TokenType,
      },
      user: {
        email: attrs.email ?? email,
        firstName: attrs.given_name,
        lastName: attrs.family_name,
        emailVerified: attrs.email_verified === 'true',
      },
    });
  } catch {
    return json(401, { error: { code: 'auth_error', message: 'Invalid email or password.' } });
  }
}
