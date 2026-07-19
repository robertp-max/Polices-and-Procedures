/**
 * COG remediation — server-authoritative admin capabilities + admin-only user
 * invitation. Deterministic unit coverage of the shared admin authority
 * (isAdminEmail), the /capabilities contract (resolveCapabilities), and the
 * authenticated admin invitation (adminInviteUser). No live AWS: the Cognito
 * client and the registration seams are stubbed, mirroring authService.test.ts.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  GetUserCommand, AdminGetUserCommand, AdminCreateUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { buildDemoAuthServiceFromEnv } from './service.js';
import { buildInviteAuditEvent } from './inviteAudit.js';
import type { RegistrationRecord } from './types.js';

const ADMIN = 'admin@careindeed.com';
const ORDINARY = 'nurse@careindeed.com';
const TARGET = 'robertp+phase7uat@careindeed.com';
const BASE = 'robertp@careindeed.com';

/** token string → the email its GetUser call resolves to. */
const TOKEN_EMAIL: Record<string, string> = {
  'admin-token': ADMIN,
  'user-token': ORDINARY,
};

function buildService(opts: { deliverEmail?: boolean; seed?: Array<[string, RegistrationRecord]> } = {}) {
  const svc = buildDemoAuthServiceFromEnv({
    AWS_REGION: 'us-west-1',
    COGNITO_USER_POOL_ID: 'us-west-1_TEST',
    COGNITO_CLIENT_ID: 'test-client',
    FROM_EMAIL: 'no-reply@careindeed.com',
    REGISTRATION_TABLE_NAME: 'test-table',
    ADMIN_MANUAL_PASSWORD_EMAILS: ADMIN,
  } as NodeJS.ProcessEnv);

  const sent: unknown[] = [];
  const send = vi.fn(async (cmd: unknown) => {
    sent.push(cmd);
    if (cmd instanceof GetUserCommand) {
      const token = (cmd as GetUserCommand).input.AccessToken ?? '';
      const email = TOKEN_EMAIL[token];
      if (!email) {
        const err = new Error('Invalid Access Token') as Error & { name: string };
        err.name = 'NotAuthorizedException';
        throw err;
      }
      return { Username: `sub-${email}`, UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'sub', Value: `sub-${email}` },
        { Name: 'email_verified', Value: 'true' },
      ] };
    }
    if (cmd instanceof AdminGetUserCommand) {
      const err = new Error('user not found') as Error & { name: string };
      err.name = 'UserNotFoundException';
      throw err; // force ensureCognitoUser to create
    }
    if (cmd instanceof AdminCreateUserCommand) return {};
    throw new Error(`unexpected command ${(cmd as { constructor: { name: string } })?.constructor?.name}`);
  });

  // Registration store: admins/ordinary users are active so getCurrentUser's
  // active-registration gate passes; targets start absent unless seeded.
  const regs = new Map<string, RegistrationRecord>([
    [ADMIN, { status: 'active', email: ADMIN } as RegistrationRecord],
    [ORDINARY, { status: 'active', email: ORDINARY } as RegistrationRecord],
    ...(opts.seed ?? []),
  ]);
  const setupEmails: Array<{ email: string; token: string }> = [];

  (svc as unknown as { cognito: { send: typeof send } }).cognito = { send } as never;
  (svc as unknown as { getRegistration: (e: string) => Promise<RegistrationRecord | null> })
    .getRegistration = async (e: string) => regs.get(e) ?? null;
  (svc as unknown as { writeRegistration: (r: RegistrationRecord) => Promise<void> })
    .writeRegistration = async (r: RegistrationRecord) => { regs.set(r.email, r); };
  (svc as unknown as { writeTokenRecord: (...a: unknown[]) => Promise<void> })
    .writeTokenRecord = async () => {};
  (svc as unknown as { deleteToken: (...a: unknown[]) => Promise<void> })
    .deleteToken = async () => {};
  (svc as unknown as { sendSetupEmail: (e: string, t: string) => Promise<void> })
    .sendSetupEmail = async (email: string, token: string) => {
      if (opts.deliverEmail === false) {
        const err = new Error('SES not approved') as Error & { name: string };
        err.name = 'MessageRejected';
        throw err;
      }
      setupEmails.push({ email, token });
    };

  return { svc, send, sent, regs, setupEmails };
}

describe('isAdminEmail — shared server authority', () => {
  it('recognizes a configured admin (case-insensitive)', () => {
    const { svc } = buildService();
    expect(svc.isAdminEmail(ADMIN)).toBe(true);
    expect(svc.isAdminEmail('ADMIN@careindeed.com')).toBe(true);
    expect(svc.isAdminEmail(`  ${ADMIN}  `)).toBe(true);
  });
  it('denies an ordinary user and empty/nullish input', () => {
    const { svc } = buildService();
    expect(svc.isAdminEmail(ORDINARY)).toBe(false);
    expect(svc.isAdminEmail('')).toBe(false);
    expect(svc.isAdminEmail(null)).toBe(false);
    expect(svc.isAdminEmail(undefined)).toBe(false);
  });
  it('treats a plus-tagged admin address as a DIFFERENT (non-admin) identity', () => {
    const { svc } = buildService();
    expect(svc.isAdminEmail('admin+alias@careindeed.com')).toBe(false);
  });
});

describe('resolveCapabilities — /capabilities contract', () => {
  it('grants manageUsers for an authenticated admin token', async () => {
    const { svc } = buildService();
    await expect(svc.resolveCapabilities('admin-token')).resolves.toEqual({ manageUsers: true });
  });
  it('denies manageUsers for an authenticated ordinary token', async () => {
    const { svc } = buildService();
    await expect(svc.resolveCapabilities('user-token')).resolves.toEqual({ manageUsers: false });
  });
  it('rejects a missing token with 401', async () => {
    const { svc } = buildService();
    await expect(svc.resolveCapabilities('')).rejects.toMatchObject({ status: 401 });
  });
  it('rejects an invalid/unknown token (getCurrentUser throws)', async () => {
    const { svc } = buildService();
    await expect(svc.resolveCapabilities('forged-token')).rejects.toBeTruthy();
  });
});

describe('adminInviteUser — administrator-only invitation', () => {
  it('lets an admin invite a new user; actor derives from the token, plus-tag preserved', async () => {
    const { svc, send, regs, setupEmails } = buildService();
    const result = await svc.adminInviteUser('admin-token', TARGET);
    expect(result.status).toBe('invited');
    expect(result.actorEmail).toBe(ADMIN);          // from token, not body
    expect(result.targetEmail).toBe(TARGET);        // plus-tag preserved
    expect(result.emailDelivered).toBe(true);
    // NO credential/token/link on the result surface.
    expect(Object.keys(result).sort()).toEqual(['actorEmail', 'emailDelivered', 'status', 'targetEmail']);
    // Cognito user created; registration is pending_setup; base email untouched.
    expect(send.mock.calls.some(([c]) => c instanceof AdminCreateUserCommand)).toBe(true);
    expect(regs.get(TARGET)?.status).toBe('pending_setup');
    expect(regs.get(TARGET)?.approvedBy).toBe(ADMIN);
    expect(regs.has(BASE)).toBe(false);             // no collision with the base admin identity
    expect(setupEmails.map(e => e.email)).toEqual([TARGET]);
  });

  it('denies an ordinary (non-admin) authenticated user with 403', async () => {
    const { svc, regs } = buildService();
    await expect(svc.adminInviteUser('user-token', TARGET)).rejects.toMatchObject({ status: 403 });
    expect(regs.has(TARGET)).toBe(false);           // nothing provisioned
  });

  it('rejects an unauthenticated request with 401', async () => {
    const { svc, regs } = buildService();
    await expect(svc.adminInviteUser('', TARGET)).rejects.toMatchObject({ status: 401 });
    expect(regs.has(TARGET)).toBe(false);
  });

  it('is idempotent for an already-active account (no duplicate, no re-provision)', async () => {
    const { svc, send } = buildService({ seed: [[TARGET, { status: 'active', email: TARGET } as RegistrationRecord]] });
    const result = await svc.adminInviteUser('admin-token', TARGET);
    expect(result.status).toBe('already_active');
    expect(result.emailDelivered).toBe(false);
    expect(send.mock.calls.some(([c]) => c instanceof AdminCreateUserCommand)).toBe(false);
  });

  it('still records the invitation when setup-link delivery fails (no throw, no leak)', async () => {
    const { svc, regs } = buildService({ deliverEmail: false });
    const result = await svc.adminInviteUser('admin-token', TARGET);
    expect(result.status).toBe('invited');
    expect(result.emailDelivered).toBe(false);
    expect(regs.get(TARGET)?.status).toBe('pending_setup');
  });

  it('rejects an invalid target email with 400', async () => {
    const { svc } = buildService();
    await expect(svc.adminInviteUser('admin-token', 'not-an-email')).rejects.toMatchObject({ status: 400 });
  });
});

describe('buildInviteAuditEvent — attribution + no-leak', () => {
  const result = { actorEmail: ADMIN, targetEmail: TARGET, status: 'invited' as const, emailDelivered: true };

  it('attributes the action to the verified admin actor and the target resource', () => {
    const ev = buildInviteAuditEvent(result, 'corr-123');
    expect(ev.actor).toMatchObject({ type: 'user', user_id: ADMIN });
    expect(ev.action).toBe('admin.user.invite');
    expect(ev.resource).toMatchObject({ type: 'user', id: TARGET });
    expect(ev.decision).toBe('permit');
    expect(ev.correlation_id).toBe('corr-123');
    expect(ev.request_id).toBe('corr-123');
  });

  it('carries no credential, setup token, link, or password in the event', () => {
    const serialized = JSON.stringify(buildInviteAuditEvent(result, 'corr-123')).toLowerCase();
    for (const forbidden of ['token', 'password', 'setuplink', 'setup-link', 'secret', 'bearer', 'code']) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});
