import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  getUser,
  json,
  jsonError,
  parseBearerToken,
  upsertAuthenticatedIdentity,
  userFromCognitoAttributes,
} from './common.js';

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const accessToken = parseBearerToken(event.headers.authorization);
    if (!accessToken) return jsonError(401, 'auth_error', 'Not authenticated.');

    const me = await getUser(accessToken);
    const attrs = Object.fromEntries((me.UserAttributes ?? []).map(a => [a.Name ?? '', a.Value ?? '']));
    const registry = await upsertAuthenticatedIdentity(userFromCognitoAttributes(attrs, me.Username));
    return json(200, registry);
  } catch (err) {
    return jsonError(500, 'internal_error', (err as Error).message || 'Internal error');
  }
}
