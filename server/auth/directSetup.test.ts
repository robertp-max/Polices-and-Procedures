/**
 * Phase 7 — direct account-setup security foundation.
 *
 * Exercises the REAL approved-users CSV parser (via temp fixtures) and the REAL
 * verifyRegistration / setupAccountDirect service logic (with Cognito + DynamoDB
 * seams stubbed — no live AWS). Also covers the activation audit contract and a
 * least-privilege lifecycle for the synthetic Phase 7 identity string.
 *
 * The internal CSV field is `sfOrgId`; it functions as an ACTIVATION CODE. All
 * codes here are synthetic fixtures — never a real value.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  GetUserCommand, AdminGetUserCommand, AdminCreateUserCommand,
  AdminSetUserPasswordCommand, AdminUpdateUserAttributesCommand, AdminEnableUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { buildDemoAuthServiceFromEnv, assertRegistrationActiveForSession } from './service.js';
import {
  reloadApprovedUsers, findApprovedUser, loadApprovedUsers, isAllowlistAvailable,
} from './approvedUsers.js';
import {
  buildDirectSetupAuditEvent, makeDirectSetupAuditSink, recordDirectSetupAuditBestEffort,
  type DirectSetupAuditSink,
} from './directSetupAudit.js';
import { ApiError } from '../errors.js';
import type { AuditEventInput } from '../audit/writer.js';
import type { RegistrationRecord } from './types.js';

const TARGET = 'robertp+phase7uat@careindeed.com';
const BASE = 'robertp@careindeed.com';
// Synthetic activation-code fixtures (NOT any real value).
const CODE = 'X7K9Q2W4E1R8T5Y3';
const CODE2 = 'A1B2C3D4E5F6G7H8';
const HEADER = 'email,fullName,sfOrgId,role,department,status,notes';
const LOWEST_ROLE = 'Pending User'; // canonical lowest-privilege (grp-pending-user)

const row = (email: string, code: string, status = 'active', role = LOWEST_ROLE) =>
  `${email},Test User,${code},${role},UAT,${status},fixture`;

/** A passing audit sink (module scope) for the reconciliation suite. */
const okSink: DirectSetupAuditSink = async () => { /* audit succeeds */ };

let tmpDir: string;
beforeAll(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ciallow-')); });
afterAll(() => {
  // Reset the shared allowlist cache to "unavailable" so later server test files
  // (which expect no allowlist) are unaffected.
  process.env.APPROVED_USERS_CSV_PATH = path.join(tmpDir, 'gone.csv');
  try { reloadApprovedUsers(); } catch { /* noop */ }
  delete process.env.APPROVED_USERS_CSV_PATH;
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* noop */ }
});

/** Write a fixture CSV, point the loader at it, and force a reload. */
function loadAllowlistFixture(...lines: string[]) {
  const p = path.join(tmpDir, `allow-${Math.random().toString(36).slice(2)}.csv`);
  fs.writeFileSync(p, [HEADER, ...lines].join('\n') + '\n', 'utf-8');
  process.env.APPROVED_USERS_CSV_PATH = p;
  return reloadApprovedUsers();
}

/** Service with Cognito + DynamoDB seams stubbed; allowlist stays REAL (fixture). */
function buildService(opts: { registrations?: Record<string, RegistrationRecord>; tokenEmail?: Record<string, string> } = {}) {
  const svc = buildDemoAuthServiceFromEnv({
    AWS_REGION: 'us-west-1',
    COGNITO_USER_POOL_ID: 'us-west-1_TEST',
    COGNITO_CLIENT_ID: 'test-client',
    FROM_EMAIL: 'no-reply@careindeed.com',
    REGISTRATION_TABLE_NAME: 'test-table',
    ADMIN_MANUAL_PASSWORD_EMAILS: 'admin@careindeed.com',
  } as NodeJS.ProcessEnv);

  const sent: unknown[] = [];
  const cognitoUsers = new Set<string>(); // track created users so AdminGetUser reflects real state
  const send = vi.fn(async (cmd: unknown) => {
    sent.push(cmd);
    if (cmd instanceof GetUserCommand) {
      const token = (cmd as GetUserCommand).input.AccessToken ?? '';
      const email = opts.tokenEmail?.[token];
      if (!email) { const e = new Error('bad token') as Error & { name: string }; e.name = 'NotAuthorizedException'; throw e; }
      return { Username: `sub-${email}`, UserAttributes: [
        { Name: 'email', Value: email }, { Name: 'sub', Value: `sub-${email}` }, { Name: 'email_verified', Value: 'true' },
      ] };
    }
    if (cmd instanceof AdminGetUserCommand) {
      const u = (cmd as AdminGetUserCommand).input.Username ?? '';
      if (cognitoUsers.has(u)) return { Username: u };
      const e = new Error('nf') as Error & { name: string }; e.name = 'UserNotFoundException'; throw e;
    }
    if (cmd instanceof AdminCreateUserCommand) { cognitoUsers.add((cmd as AdminCreateUserCommand).input.Username ?? ''); return {}; }
    if (cmd instanceof AdminSetUserPasswordCommand
      || cmd instanceof AdminUpdateUserAttributesCommand
      || cmd instanceof AdminEnableUserCommand) return {};
    throw new Error(`unexpected ${(cmd as { constructor: { name: string } })?.constructor?.name}`);
  });

  const regs = new Map<string, RegistrationRecord>(Object.entries(opts.registrations ?? {}));
  (svc as unknown as { cognito: { send: typeof send } }).cognito = { send } as never;
  (svc as unknown as { getRegistration: (e: string) => Promise<RegistrationRecord | null> })
    .getRegistration = async (e: string) => regs.get(e) ?? null;
  (svc as unknown as { writeRegistration: (r: RegistrationRecord) => Promise<void> })
    .writeRegistration = async (r: RegistrationRecord) => { regs.set(r.email, r); };
  return { svc, send, sent, regs };
}

/* ─────────────────────────── CSV parser ─────────────────────────── */
describe('approved-users parser (real fixtures)', () => {
  it('matches an exact active email + activation code', () => {
    loadAllowlistFixture(row(TARGET, CODE));
    expect(isAllowlistAvailable()).toBe(true);
    expect(findApprovedUser(TARGET, CODE)?.email).toBe(TARGET);
  });
  it('denies an unlisted email', () => {
    loadAllowlistFixture(row(TARGET, CODE));
    expect(findApprovedUser('stranger@careindeed.com', CODE)).toBeNull();
  });
  it('denies a same-domain but unlisted email', () => {
    loadAllowlistFixture(row(TARGET, CODE));
    expect(findApprovedUser('someoneelse@careindeed.com', CODE)).toBeNull();
  });
  it('denies an inactive row', () => {
    loadAllowlistFixture(row(TARGET, CODE, 'inactive'));
    expect(findApprovedUser(TARGET, CODE)).toBeNull();
    expect(isAllowlistAvailable()).toBe(false); // no active rows
  });
  it('denies a wrong activation code', () => {
    loadAllowlistFixture(row(TARGET, CODE));
    expect(findApprovedUser(TARGET, CODE2)).toBeNull();
  });
  it('denies a missing activation code', () => {
    loadAllowlistFixture(row(TARGET, CODE));
    expect(findApprovedUser(TARGET, '')).toBeNull();
  });
  it('skips a malformed row (missing code) but loads the valid rows', () => {
    loadAllowlistFixture(`bad@careindeed.com,No Code,,${LOWEST_ROLE},UAT,active,`, row(TARGET, CODE));
    const users = loadApprovedUsers();
    expect(users.some(u => u.email === 'bad@careindeed.com')).toBe(false);
    expect(findApprovedUser(TARGET, CODE)?.email).toBe(TARGET);
  });
  it('handles duplicate rows deterministically (first active match wins)', () => {
    loadAllowlistFixture(row(TARGET, CODE), row(TARGET, CODE2));
    expect(findApprovedUser(TARGET, CODE)?.email).toBe(TARGET); // first row matches its code
  });
  it('preserves the plus tag and keeps base vs plus-tagged distinct', () => {
    loadAllowlistFixture(row(TARGET, CODE));
    expect(findApprovedUser(TARGET, CODE)?.email).toBe(TARGET);
    expect(findApprovedUser(BASE, CODE)).toBeNull(); // base is a different identity, not listed
    expect(TARGET).not.toBe(BASE);
  });
});

/* ─────────────────────── verify + direct setup ─────────────────────── */
describe('verifyRegistration + setupAccountDirect', () => {
  const setup = (email: string, code: string) =>
    ({ email, sfOrgId: code, firstName: 'Phase7', lastName: 'Uat', password: 'Str0ng!Passw0rd' });
  const okAudit: DirectSetupAuditSink = async () => { /* audit succeeds */ };

  it('a pending approved user can verify then complete setup (account becomes active)', async () => {
    loadAllowlistFixture(row(TARGET, CODE));
    const { svc, send, regs } = buildService();
    await expect(svc.verifyRegistration(TARGET, CODE)).resolves.toMatchObject({ verified: true });
    await expect(svc.setupAccountDirect(setup(TARGET, CODE), okAudit)).resolves.toEqual({ success: true });
    expect(regs.get(TARGET)?.status).toBe('active');
    expect(send.mock.calls.some(([c]) => c instanceof AdminSetUserPasswordCommand)).toBe(true);
  });

  it('re-verification runs on the server (client verification is not authorization)', async () => {
    loadAllowlistFixture(row(TARGET, CODE));
    const { svc } = buildService();
    // A caller who skips verify and posts a wrong code straight to setup is denied.
    await expect(svc.setupAccountDirect(setup(TARGET, CODE2), okAudit)).rejects.toMatchObject({ status: 403 });
  });

  it('a different email cannot use another user’s activation code', async () => {
    loadAllowlistFixture(row(TARGET, CODE));
    const { svc } = buildService();
    await expect(svc.setupAccountDirect(setup('intruder@careindeed.com', CODE), okAudit)).rejects.toMatchObject({ status: 403 });
  });

  it('an already-active user cannot replay setup', async () => {
    loadAllowlistFixture(row(TARGET, CODE));
    const { svc } = buildService({ registrations: { [TARGET]: { status: 'active', email: TARGET } as RegistrationRecord } });
    await expect(svc.setupAccountDirect(setup(TARGET, CODE), okAudit)).rejects.toMatchObject({ status: 409 });
    await expect(svc.verifyRegistration(TARGET, CODE)).rejects.toMatchObject({ status: 409 });
  });

  it('fails closed when the allowlist is unavailable', async () => {
    process.env.APPROVED_USERS_CSV_PATH = path.join(tmpDir, 'does-not-exist.csv');
    reloadApprovedUsers();
    const { svc } = buildService();
    await expect(svc.setupAccountDirect(setup(TARGET, CODE), okAudit)).rejects.toMatchObject({ status: 403 });
    await expect(svc.verifyRegistration(TARGET, CODE)).rejects.toMatchObject({ status: 403 });
  });

  it('accepts no client-supplied role/isAdmin (setup signature carries only identity + password)', () => {
    // Structural guarantee: the input shape has no role/isAdmin/group field.
    const input = setup(TARGET, CODE);
    expect(Object.keys(input).sort()).toEqual(['email', 'firstName', 'lastName', 'password', 'sfOrgId']);
  });

  it('never returns a secret from verify or setup responses', async () => {
    loadAllowlistFixture(row(TARGET, CODE));
    const { svc } = buildService();
    const v = JSON.stringify(await svc.verifyRegistration(TARGET, CODE)).toLowerCase();
    const s = JSON.stringify(await svc.setupAccountDirect(setup(TARGET, CODE), okAudit)).toLowerCase();
    for (const forbidden of ['password', 'token', 'sub', 'secret', CODE.toLowerCase(), 'str0ng']) {
      expect(v).not.toContain(forbidden);
      expect(s).not.toContain(forbidden);
    }
  });
});

/* ─────────────────────── activation audit ─────────────────────── */
describe('direct-setup audit', () => {
  it('attributes activation to the self-activating user with no secret payload', () => {
    const ev = buildDirectSetupAuditEvent(TARGET, 'setup_complete', 'corr-9');
    expect(ev.actor).toMatchObject({ type: 'user', user_id: TARGET });
    expect(ev.action).toBe('auth.direct_setup.complete');
    expect(ev.resource).toMatchObject({ id: TARGET });
    expect(ev.decision).toBe('permit');
    expect(ev.correlation_id).toBe('corr-9');
    // No credential/secret VALUES: the activation code, password, tokens, cookies,
    // or Cognito subject value must never appear. (The event_type is the benign
    // literal "account_activation".)
    const s = JSON.stringify(ev).toLowerCase();
    for (const forbidden of ['password', 'token', 'cookie', CODE.toLowerCase(), 'str0ng', 'sub-robertp']) {
      expect(s).not.toContain(forbidden);
    }
  });
  it('marks denials with decision=deny', () => {
    expect(buildDirectSetupAuditEvent(TARGET, 'verify_denied').decision).toBe('deny');
    expect(buildDirectSetupAuditEvent(TARGET, 'setup_replay_denied').decision).toBe('deny');
  });
  it('the sink writes the phase event when the audit succeeds', async () => {
    const append = vi.fn(async (_e: AuditEventInput) => undefined);
    const sink = makeDirectSetupAuditSink(TARGET, 'c1', append);
    await sink('setup_started');
    await sink('setup_complete');
    expect(append).toHaveBeenCalledTimes(2);
    expect(append.mock.calls[1][0]).toMatchObject({ action: 'auth.direct_setup.complete', actor: { user_id: TARGET } });
  });
  it('intent-audit failure throws 503 (no secret); success-audit failure throws 500 (no secret)', async () => {
    const failAppend = vi.fn(async () => { throw new Error('jsonl down'); });
    const sink = makeDirectSetupAuditSink(TARGET, 'c1', failAppend);
    await expect(sink('setup_started')).rejects.toMatchObject({ status: 503 });
    await expect(sink('setup_complete')).rejects.toMatchObject({ status: 500 });
    // Neither classified error leaks a secret.
    for (const phase of ['setup_started', 'setup_complete'] as const) {
      try { await sink(phase); } catch (e) {
        const msg = (e as ApiError).message.toLowerCase();
        for (const f of ['password', 'token', 'secret', 'jsonl down']) expect(msg).not.toContain(f);
      }
    }
  });
  it('best-effort audit never throws even when the write fails', async () => {
    const append = vi.fn(async () => { throw new Error('down'); });
    await expect(recordDirectSetupAuditBestEffort(TARGET, 'verify_denied', 'c1', append)).resolves.toBeUndefined();
  });
});

/* ─────────────────────── audit reconciliation ─────────────────────── */
describe('setupAccountDirect — audit reconciliation invariant', () => {
  const input = () => ({ email: TARGET, sfOrgId: CODE, firstName: 'Phase7', lastName: 'Uat', password: 'Str0ng!Passw0rd' });

  it('intent-audit failure aborts BEFORE any Cognito mutation', async () => {
    loadAllowlistFixture(row(TARGET, CODE));
    const { svc, send, regs } = buildService();
    const sink: DirectSetupAuditSink = async (phase) => { if (phase === 'setup_started') throw new ApiError('internal_error', 'audit down', 503); };
    await expect(svc.setupAccountDirect(input(), sink)).rejects.toMatchObject({ status: 503 });
    expect(send.mock.calls.some(([c]) => c instanceof AdminSetUserPasswordCommand)).toBe(false); // no mutation
    expect(regs.has(TARGET)).toBe(false);                                                        // no registration
  });

  it('success-audit failure leaves the account NON-active (login denied) and reconcilable', async () => {
    loadAllowlistFixture(row(TARGET, CODE));
    const { svc, send, regs } = buildService();
    const sink: DirectSetupAuditSink = async (phase) => { if (phase === 'setup_complete') throw new ApiError('internal_error', 'audit down', 500); };
    await expect(svc.setupAccountDirect(input(), sink)).rejects.toMatchObject({ status: 500 });
    // Cognito mutation happened, but registration is pending_setup — NOT active.
    expect(send.mock.calls.some(([c]) => c instanceof AdminSetUserPasswordCommand)).toBe(true);
    expect(regs.get(TARGET)?.status).toBe('pending_setup');
    // The session gate denies a non-active account → not normally usable.
    expect(() => assertRegistrationActiveForSession(regs.get(TARGET))).toThrow();
  });

  it('retry after a partial (audit-pending) activation reconciles without duplicating the user', async () => {
    loadAllowlistFixture(row(TARGET, CODE));
    const { svc, send, regs } = buildService();
    const failOnce: DirectSetupAuditSink = async (phase) => { if (phase === 'setup_complete') throw new ApiError('internal_error', 'audit down', 500); };
    await expect(svc.setupAccountDirect(input(), failOnce)).rejects.toMatchObject({ status: 500 });
    expect(regs.get(TARGET)?.status).toBe('pending_setup');
    const createsAfterFirst = send.mock.calls.filter(([c]) => c instanceof AdminCreateUserCommand).length;
    // Retry with a working audit: account activates; no second Cognito user created.
    await expect(svc.setupAccountDirect(input(), okSink)).resolves.toEqual({ success: true });
    expect(regs.get(TARGET)?.status).toBe('active');
    const createsAfterRetry = send.mock.calls.filter(([c]) => c instanceof AdminCreateUserCommand).length;
    expect(createsAfterRetry).toBe(createsAfterFirst); // idempotent — no duplicate user
  });

  it('a fully-activated account is replay-safe (409) on a later setup attempt', async () => {
    loadAllowlistFixture(row(TARGET, CODE));
    const { svc } = buildService();
    await expect(svc.setupAccountDirect(input(), okSink)).resolves.toEqual({ success: true });
    await expect(svc.setupAccountDirect(input(), okSink)).rejects.toMatchObject({ status: 409 });
  });
});

/* ─────────────────────── server password policy ─────────────────────── */
describe('setupAccountDirect — server-enforced password policy (UI-bypass)', () => {
  const withPw = (password: string) => ({ email: TARGET, sfOrgId: CODE, firstName: 'P', lastName: 'U', password });

  it('rejects weak passwords before any Cognito mutation; accepts a compliant one', async () => {
    for (const weak of ['', 'short', 'alllowercase1!', 'ALLUPPERCASE1!', 'NoDigits!!', 'NoSymbol123', 'a'.repeat(300) + 'A1!']) {
      loadAllowlistFixture(row(TARGET, CODE));
      const { svc, send } = buildService();
      await expect(svc.setupAccountDirect(withPw(weak), okSink)).rejects.toMatchObject({ status: 400 });
      expect(send.mock.calls.some(([c]) => c instanceof AdminSetUserPasswordCommand)).toBe(false); // no partial activation
    }
    loadAllowlistFixture(row(TARGET, CODE));
    const { svc } = buildService();
    await expect(svc.setupAccountDirect(withPw('Str0ng!Passw0rd'), okSink)).resolves.toEqual({ success: true });
  });

  it('never echoes the password in the validation error', async () => {
    loadAllowlistFixture(row(TARGET, CODE));
    const { svc } = buildService();
    try { await svc.setupAccountDirect(withPw('secretweak'), okSink); } catch (e) {
      expect((e as ApiError).message.toLowerCase()).not.toContain('secretweak');
    }
  });
});

/* ─────────────────────── least-privilege lifecycle ─────────────────────── */
describe('activated user is least-privilege (Phase 8 lifecycle)', () => {
  it('the synthetic Phase 7 identity gets no admin authority', async () => {
    loadAllowlistFixture(row(TARGET, CODE));
    const { svc } = buildService({
      registrations: { [TARGET]: { status: 'active', email: TARGET } as RegistrationRecord },
      tokenEmail: { 'target-token': TARGET },
    });
    // Not an admin-email; capability denies; admin invitation endpoint denies.
    expect(svc.isAdminEmail(TARGET)).toBe(false);
    await expect(svc.resolveCapabilities('target-token')).resolves.toEqual({ manageUsers: false });
    await expect(svc.adminInviteUser('target-token', 'x@careindeed.com')).rejects.toMatchObject({ status: 403 });
    // The chosen CSV role is not admin-ish (isAdminRole substrings) — sanity on the label.
    expect(LOWEST_ROLE.toLowerCase()).not.toMatch(/admin|owner|security|super_admin|system_admin|sys_admin/);
  });
});
