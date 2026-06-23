import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  getCurrentUser,
  getPageAccessState,
  json,
  jsonError,
  normalizeEmail,
  parseBearerToken,
} from './common.js';

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const accessToken = parseBearerToken(event.headers.authorization);
    if (!accessToken) {
      return jsonError(401, 'auth_error', 'Not authenticated.');
    }

    const me = await getCurrentUser(accessToken);
    const actorEmail = normalizeEmail(
      (me.UserAttributes ?? []).find(attr => attr.Name === 'email')?.Value || '',
    );
    const access = await getPageAccessState();
    return json(200, {
      actorEmail,
      record: actorEmail ? (access[actorEmail] ?? null) : null,
    });
  } catch (err) {
    return jsonError(500, 'internal_error', (err as Error).message || 'Internal error');
  }
}
