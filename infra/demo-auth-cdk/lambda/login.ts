import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  getRegistration,
  getUser,
  json,
  loginCognito,
  normalizeEmail,
  upsertAuthenticatedIdentity,
  userFromCognitoAttributes,
} from './common.js';

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
    if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED' && response.Session) {
      return json(200, {
        challenge: 'NEW_PASSWORD_REQUIRED',
        challengeName: 'NEW_PASSWORD_REQUIRED',
        session: response.Session,
        email,
      });
    }

    if (response.ChallengeName) {
      return json(401, {
        error: {
          code: 'unsupported_challenge',
          message: 'Login requires an unsupported authentication challenge.',
        },
      });
    }

    const auth = response.AuthenticationResult;
    if (!auth?.AccessToken || !auth?.IdToken || !auth?.RefreshToken || !auth?.ExpiresIn || !auth?.TokenType) {
      return json(401, { error: { code: 'auth_error', message: 'Invalid email or password.' } });
    }

    const me = await getUser(auth.AccessToken);
    const attrs = Object.fromEntries((me.UserAttributes ?? []).map(a => [a.Name ?? '', a.Value ?? '']));
    const user = userFromCognitoAttributes(attrs, me.Username);
    await upsertAuthenticatedIdentity({ ...user, email: user.email || email }).catch(() => undefined);

    return json(200, {
      session: {
        accessToken: auth.AccessToken,
        idToken: auth.IdToken,
        refreshToken: auth.RefreshToken,
        expiresIn: auth.ExpiresIn,
        tokenType: auth.TokenType,
      },
      user: { ...user, email: user.email || email },
    });
  } catch {
    return json(401, { error: { code: 'auth_error', message: 'Invalid email or password.' } });
  }
}
