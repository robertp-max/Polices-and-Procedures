import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { getUser, json } from './common.js';

export async function handler(event: APIGatewayProxyEventV2) {
  const auth = event.headers.authorization || event.headers.Authorization || '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  if (!accessToken) {
    return json(401, { error: { code: 'auth_error', message: 'Not authenticated.' } });
  }

  try {
    const me = await getUser(accessToken);
    const attrs = Object.fromEntries((me.UserAttributes ?? []).map(a => [a.Name ?? '', a.Value ?? '']));
    return json(200, {
      user: {
        email: attrs.email ?? '',
        firstName: attrs.given_name,
        lastName: attrs.family_name,
        emailVerified: attrs.email_verified === 'true',
      },
    });
  } catch {
    return json(401, { error: { code: 'auth_error', message: 'Not authenticated.' } });
  }
}
