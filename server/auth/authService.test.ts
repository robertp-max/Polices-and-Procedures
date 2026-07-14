/**
 * COG-1 regression: session validation must reject suspended/disabled
 * application users even when their Cognito token is still valid.
 *
 * Pure-logic coverage of the gate wired into DemoAuthService.getCurrentUser
 * (no AWS clients are constructed here).
 */
import { describe, expect, it, vi } from 'vitest';
import { InitiateAuthCommand, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { assertRegistrationActiveForSession, buildDemoAuthServiceFromEnv } from './service.js';
import { ApiError } from '../errors.js';
import type { RegistrationRecord, RegistrationStatus } from './types.js';

function reg(status: RegistrationStatus): Pick<RegistrationRecord, 'status'> {
  return { status };
}

describe('assertRegistrationActiveForSession', () => {
  it('allows an active application account', () => {
    expect(() => assertRegistrationActiveForSession(reg('active'))).not.toThrow();
  });

  it.each<RegistrationStatus>(['disabled', 'pending_setup', 'pending_admin_approval'])(
    'rejects a %s account with a 403 (fail closed)',
    (status) => {
      try {
        assertRegistrationActiveForSession(reg(status));
        throw new Error('expected rejection');
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError);
        expect((e as ApiError).status).toBe(403);
      }
    },
  );

  it('rejects a missing registration (no active account bound to the token)', () => {
    for (const value of [null, undefined]) {
      try {
        assertRegistrationActiveForSession(value);
        throw new Error('expected rejection');
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError);
        expect((e as ApiError).status).toBe(403);
      }
    }
  });
});

/**
 * Gap-2 regression: refresh must validate the refreshed access token through
 * getCurrentUser, so a suspended/disabled registration cannot obtain a
 * successful refreshed session even when Cognito issues fresh tokens.
 *
 * The AWS clients are never contacted — cognito.send is stubbed and the
 * private getRegistration seam is overridden. Constructing the service builds
 * (but never calls) the SDK clients.
 */
describe('DemoAuthService.refresh — active-registration gate', () => {
  const EMAIL = 'nurse@careindeed.com';

  function buildServiceWithRegistration(status: RegistrationStatus) {
    const svc = buildDemoAuthServiceFromEnv({
      AWS_REGION: 'us-west-1',
      COGNITO_USER_POOL_ID: 'us-west-1_TEST',
      COGNITO_CLIENT_ID: 'test-client',
      FROM_EMAIL: 'no-reply@careindeed.com',
      REGISTRATION_TABLE_NAME: 'test-table',
    } as NodeJS.ProcessEnv);

    const send = vi.fn(async (cmd: unknown) => {
      if (cmd instanceof InitiateAuthCommand) {
        return {
          AuthenticationResult: {
            AccessToken: 'refreshed-access-token',
            IdToken: 'refreshed-id-token',
            ExpiresIn: 3600,
            TokenType: 'Bearer',
          },
        };
      }
      if (cmd instanceof GetUserCommand) {
        return {
          Username: 'sub-1',
          UserAttributes: [
            { Name: 'email', Value: EMAIL },
            { Name: 'sub', Value: 'sub-1' },
            { Name: 'email_verified', Value: 'true' },
          ],
        };
      }
      throw new Error(`unexpected command ${(cmd as { constructor: { name: string } })?.constructor?.name}`);
    });

    // Stub the two impure seams the refresh path touches.
    (svc as unknown as { cognito: { send: typeof send } }).cognito = { send } as never;
    (svc as unknown as { getRegistration: (email: string) => Promise<RegistrationRecord | null> })
      .getRegistration = async () => ({ status } as RegistrationRecord);
    return { svc, send };
  }

  it('rejects the refresh with 403 when the bound registration is suspended/disabled', async () => {
    const { svc, send } = buildServiceWithRegistration('disabled');
    await expect(svc.refresh('valid-refresh-token')).rejects.toMatchObject({ status: 403 });
    // Cognito issued tokens (InitiateAuth) AND the gate ran (GetUser) — both fired.
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('returns a refreshed session when the bound registration is active', async () => {
    const { svc } = buildServiceWithRegistration('active');
    const session = await svc.refresh('valid-refresh-token');
    expect(session.accessToken).toBe('refreshed-access-token');
    expect(session.refreshToken).toBe('valid-refresh-token');
  });
});
