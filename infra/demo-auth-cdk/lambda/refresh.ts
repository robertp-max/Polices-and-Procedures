import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { json, refreshCognito } from './common.js';

export async function handler(event: APIGatewayProxyEventV2) {
  const body = event.body ? JSON.parse(event.body) as { refreshToken?: string } : {};
  const refreshToken = String(body.refreshToken || '');
  if (!refreshToken) {
    return json(401, { error: { code: 'auth_error', message: 'Missing refresh token.' } });
  }

  try {
    const result = await refreshCognito(refreshToken);
    const auth = result.AuthenticationResult;
    if (!auth?.AccessToken || !auth?.IdToken || !auth?.ExpiresIn || !auth?.TokenType) {
      return json(401, { error: { code: 'auth_error', message: 'Session refresh failed.' } });
    }

    return json(200, {
      session: {
        accessToken: auth.AccessToken,
        idToken: auth.IdToken,
        refreshToken,
        expiresIn: auth.ExpiresIn,
        tokenType: auth.TokenType,
      },
    });
  } catch {
    return json(401, { error: { code: 'auth_error', message: 'Session refresh failed.' } });
  }
}
