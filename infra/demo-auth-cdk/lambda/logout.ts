import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { json, logout } from './common.js';

export async function handler(event: APIGatewayProxyEventV2) {
  const auth = event.headers.authorization || event.headers.Authorization || '';
  const accessToken = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  if (!accessToken) {
    return { statusCode: 204, body: '' };
  }

  try {
    await logout(accessToken);
  } catch {
    // best effort
  }

  return { statusCode: 204, body: '' };
}
