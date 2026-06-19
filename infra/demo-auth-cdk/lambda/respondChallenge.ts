import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  getRegistration,
  getUser,
  json,
  normalizeEmail,
  parseBody,
  respondToNewPasswordChallenge,
  upsertAuthenticatedIdentity,
  userFromCognitoAttributes,
} from './common.js';

export async function handler(event: APIGatewayProxyEventV2) {
  const body = parseBody(event.body ?? null) as {
    email?: string;
    session?: string;
    newPassword?: string;
  };
  const email = normalizeEmail(body.email || '');
  const session = String(body.session || '');
  const newPassword = String(body.newPassword || '');

  if (!email || !email.includes('@')) {
    return json(400, { error: { code: 'validation_error', message: 'Email is required.' } });
  }
  if (!session) {
    return json(400, { error: { code: 'validation_error', message: 'Challenge session is required.' } });
  }
  if (!newPassword || newPassword.length < 8) {
    return json(400, { error: { code: 'validation_error', message: 'Password must be at least 8 characters.' } });
  }

  const registration = await getRegistration(email);
  if (!registration || registration.status !== 'active') {
    return json(403, { error: { code: 'auth_error', message: 'Account is not active.' } });
  }

  try {
    const response = await respondToNewPasswordChallenge(email, session, newPassword);
    if (response.ChallengeName) {
      return json(401, {
        error: {
          code: 'unsupported_challenge',
          message: 'Password challenge requires an unsupported follow-up challenge.',
        },
      });
    }

    const auth = response.AuthenticationResult;
    if (!auth?.AccessToken || !auth?.IdToken || !auth?.RefreshToken || !auth?.ExpiresIn || !auth?.TokenType) {
      return json(401, { error: { code: 'auth_error', message: 'Unable to complete password challenge.' } });
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
    return json(401, { error: { code: 'auth_error', message: 'Unable to complete password challenge.' } });
  }
}
