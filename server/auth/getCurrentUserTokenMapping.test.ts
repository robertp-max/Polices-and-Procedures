/**
 * COG-2 hotfix — token-error mapping + capability projection.
 *
 * getCurrentUser must map a *rejected token* (Cognito client faults) to a 401
 * with a generic, non-leaking message, while a genuine provider/network failure
 * must surface unchanged (a 5xx path), never masquerading as a 401. And
 * resolveCapabilities must project manageUserStatus alongside manageUsers from
 * the SAME server-authoritative admin-email predicate.
 *
 * No AWS clients are contacted — cognito.send and getRegistration are stubbed.
 */
import { describe, expect, it, vi } from 'vitest';
import { GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { buildDemoAuthServiceFromEnv } from './service.js';
import { ApiError } from '../errors.js';
import type { RegistrationRecord } from './types.js';

const ADMIN_EMAIL = 'boss@careindeed.com';

function buildService(adminEmails = ADMIN_EMAIL) {
  const svc = buildDemoAuthServiceFromEnv({
    AWS_REGION: 'us-west-1',
    COGNITO_USER_POOL_ID: 'us-west-1_TEST',
    COGNITO_CLIENT_ID: 'test-client',
    FROM_EMAIL: 'no-reply@careindeed.com',
    REGISTRATION_TABLE_NAME: 'test-table',
    ADMIN_MANUAL_PASSWORD_EMAILS: adminEmails,
  } as NodeJS.ProcessEnv);
  return svc;
}

/** Wire a GetUser response for `email`; other commands throw `getUserError` if set. */
function stubCognito(svc: ReturnType<typeof buildService>, opts: { email?: string; getUserError?: unknown; registry?: unknown }) {
  const send = vi.fn(async (cmd: unknown) => {
    if (cmd instanceof GetUserCommand) {
      if (opts.getUserError) throw opts.getUserError;
      return {
        Username: 'sub-1',
        UserAttributes: [
          { Name: 'email', Value: opts.email ?? ADMIN_EMAIL },
          { Name: 'sub', Value: 'sub-1' },
          { Name: 'email_verified', Value: 'true' },
        ],
      };
    }
    throw new Error(`unexpected command`);
  });
  (svc as unknown as { cognito: { send: typeof send } }).cognito = { send } as never;
  (svc as unknown as { getRegistration: (email: string) => Promise<RegistrationRecord | null> })
    .getRegistration = async () => ({ status: 'active' } as RegistrationRecord);
  // Canonical registry seam: default empty; opts.registry overrides.
  (svc as unknown as { loadIdentityRegistry: () => Promise<unknown> })
    .loadIdentityRegistry = async () => opts.registry ?? { users: [], assignments: [] };
  return send;
}

describe('getCurrentUser — token-error mapping', () => {
  it.each([
    'NotAuthorizedException',
    'UserNotFoundException',
    'TokenExpiredException',
    'InvalidParameterException',
    'ExpiredTokenException',
  ])('maps Cognito %s (rejected token) to a generic 401', async (name) => {
    const svc = buildService();
    stubCognito(svc, { getUserError: Object.assign(new Error('cognito detail'), { name }) });
    try {
      await svc.getCurrentUser('some-token');
      throw new Error('expected rejection');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(401);
      // No token / stack / provider detail leaked.
      expect((e as ApiError).message).toBe('Not authenticated.');
    }
  });

  it('rethrows a genuine provider/network failure unchanged (5xx path, not a 401)', async () => {
    const svc = buildService();
    const providerErr = Object.assign(new Error('Cognito is down'), { name: 'InternalErrorException' });
    stubCognito(svc, { getUserError: providerErr });
    await expect(svc.getCurrentUser('some-token')).rejects.toBe(providerErr);
  });
});

describe('resolveCapabilities — manageUserStatus projection', () => {
  it('grants manageUsers AND manageUserStatus to an approved-admin email', async () => {
    const svc = buildService();
    stubCognito(svc, { email: ADMIN_EMAIL });
    const caps = await svc.resolveCapabilities('admin-token');
    expect(caps).toEqual({ manageUsers: true, manageUserStatus: true });
  });

  it('denies both to a non-admin email', async () => {
    const svc = buildService();
    stubCognito(svc, { email: 'nurse@careindeed.com' });
    const caps = await svc.resolveCapabilities('nurse-token');
    expect(caps).toEqual({ manageUsers: false, manageUserStatus: false });
  });

  it('rejects a blank access token with 401 before any provider call', async () => {
    const svc = buildService();
    const send = stubCognito(svc, { email: ADMIN_EMAIL });
    await expect(svc.resolveCapabilities('   ')).rejects.toMatchObject({ status: 401 });
    expect(send).not.toHaveBeenCalled();
  });

  it('DENIES an approved-admin email whose canonical record is SUSPENDED', async () => {
    const svc = buildService();
    stubCognito(svc, {
      email: ADMIN_EMAIL,
      registry: {
        users: [{ id: 'u1', email: ADMIN_EMAIL, name: 'A', status: 'suspended', authSubject: 'sub-1' }],
        assignments: [],
      },
    });
    const caps = await svc.resolveCapabilities('admin-token');
    expect(caps).toEqual({ manageUsers: false, manageUserStatus: false });
  });

  it('grants an approved-admin email whose canonical record is PENDING', async () => {
    const svc = buildService();
    stubCognito(svc, {
      email: ADMIN_EMAIL,
      registry: {
        users: [{ id: 'u1', email: ADMIN_EMAIL, name: 'A', status: 'pending', authSubject: 'sub-1' }],
        assignments: [],
      },
    });
    const caps = await svc.resolveCapabilities('admin-token');
    expect(caps).toEqual({ manageUsers: true, manageUserStatus: true });
  });
});
