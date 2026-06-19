import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { getUser, json, upsertAuthenticatedIdentity, userFromCognitoAttributes } from './common.js';

export async function handler(event: APIGatewayProxyEventV2) {
  const auth = event.headers.authorization || event.headers.Authorization || '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  if (!accessToken) {
    return json(401, { error: { code: 'auth_error', message: 'Not authenticated.' } });
  }

  try {
    const me = await getUser(accessToken);
    const attrs = Object.fromEntries((me.UserAttributes ?? []).map(a => [a.Name ?? '', a.Value ?? '']));
    const user = userFromCognitoAttributes(attrs, me.Username);
    await upsertAuthenticatedIdentity(user).catch(() => undefined);
    return json(200, {
      user,
    });
  } catch {
    return json(401, { error: { code: 'auth_error', message: 'Not authenticated.' } });
  }
}
