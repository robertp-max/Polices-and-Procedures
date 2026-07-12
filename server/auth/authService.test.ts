/**
 * COG-1 regression: session validation must reject suspended/disabled
 * application users even when their Cognito token is still valid.
 *
 * Pure-logic coverage of the gate wired into DemoAuthService.getCurrentUser
 * (no AWS clients are constructed here).
 */
import { describe, expect, it } from 'vitest';
import { assertRegistrationActiveForSession } from './service.js';
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
