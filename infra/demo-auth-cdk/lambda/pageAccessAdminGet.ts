import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import {
  assertAdminAccessToken,
  getPageAccessState,
  json,
  jsonError,
  parseBearerToken,
} from './common.js';

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const accessToken = parseBearerToken(event.headers.authorization);
    await assertAdminAccessToken(accessToken);
    const access = await getPageAccessState();
    return json(200, { access });
  } catch (err) {
    const message = (err as Error).message || 'Internal error';
    const status = message === 'Not authenticated.' ? 401 : message.includes('permission') ? 403 : 500;
    const code = status === 401 ? 'auth_error' : status === 403 ? 'forbidden' : 'internal_error';
    return jsonError(status, code, message);
  }
}
