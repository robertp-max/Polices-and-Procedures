/**
 * DRIVE_EVIDENCE_LOCK + Drive/Calendar auth separation — deterministic tests.
 *
 * googleapis is fully mocked: no live Drive or Calendar call is possible.
 * Credentials fixtures are FAKE placeholders (no real key material).
 *
 * Proves:
 *  - the lock still passes for approved values and fails closed on drift
 *  - impersonation config is required and validated fail-closed
 *  - the packet-folder resolution still returns the canonical Event Packets id
 *  - Drive impersonation uses ADC while Calendar keeps its key-file client
 *  - Calendar construction/read behavior is unchanged; no write method fires
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import path from 'node:path';

const LOCK_EMAIL = 'careindeed-drive-evidence@orbital-stage-443721-v1.iam.gserviceaccount.com';
const SHARED_DRIVE = '0AMhwVb2RmU-fUk9PVA';
const PACKET_FOLDER = '1oWEQxrPWoy8bBIDG1a-5afQU9vEYWmU0';
const FIXTURES = path.resolve(__dirname, '__fixtures__');
const KEY_MATCHING = path.join(FIXTURES, 'fake-drive-key.matching.json');
const KEY_MISMATCH = path.join(FIXTURES, 'fake-drive-key.mismatch.json');
const KEY_ABSENT = path.join(FIXTURES, 'does-not-exist.json');

/* ─── googleapis mock (hoisted spies) ────────────────────────────────────── */
const h = vi.hoisted(() => {
  const googleAuthCtorCalls: unknown[] = [];
  const impersonatedCtorCalls: Array<Record<string, unknown>> = [];
  const impersonatedInstances: unknown[] = [];
  const driveFactoryCalls: Array<{ auth: unknown }> = [];
  const calendarFactoryCalls: Array<{ auth: unknown }> = [];
  const drive = {
    files: {
      get: vi.fn(async () => ({ data: { id: 'file-1', name: 'ok' } })),
      list: vi.fn(async () => ({ data: { files: [] } })),
      create: vi.fn(),
      update: vi.fn(),
      copy: vi.fn(),
      export: vi.fn(),
      delete: vi.fn(),
    },
  };
  const calendar = {
    calendars: { get: vi.fn(async () => ({ data: { summary: 'CES Evidence Calendar' } })) },
    events: {
      list: vi.fn(async () => ({ data: { items: [] } })),
      get: vi.fn(async () => ({ data: {} })),
      insert: vi.fn(),
      update: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
  return {
    googleAuthCtorCalls, impersonatedCtorCalls, impersonatedInstances,
    driveFactoryCalls, calendarFactoryCalls, drive, calendar,
  };
});

vi.mock('googleapis', () => {
  class GoogleAuth {
    opts: Record<string, unknown>;
    constructor(opts: Record<string, unknown> = {}) {
      h.googleAuthCtorCalls.push(opts);
      this.opts = opts;
    }
    async getClient() { return { __mockAuthClient: true, opts: this.opts }; }
  }
  class Impersonated {
    opts: Record<string, unknown>;
    constructor(opts: Record<string, unknown>) {
      h.impersonatedCtorCalls.push(opts);
      h.impersonatedInstances.push(this);
      this.opts = opts;
    }
  }
  return {
    google: {
      auth: { GoogleAuth },
      drive: vi.fn((opts: { auth: unknown }) => { h.driveFactoryCalls.push(opts); return h.drive; }),
      calendar: vi.fn((opts: { auth: unknown }) => { h.calendarFactoryCalls.push(opts); return h.calendar; }),
    },
    Auth: { Impersonated },
  };
});

/* ─── deterministic env presets (dotenv never overrides set vars) ────────── */
const ENV_KEYS = [
  'GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID', 'GOOGLE_DRIVE_EVIDENCE_ROOT_FOLDER_ID',
  'GOOGLE_CALENDAR_EVIDENCE_ENABLED', 'GOOGLE_DRIVE_PACKET_FOLDER_ID',
  'GOOGLE_DRIVE_AUTH_MODE', 'GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT',
  'GOOGLE_APPLICATION_CREDENTIALS', 'DRIVE_01_CES_READINESS_DATE', 'GOOGLE_CALENDAR_ID',
] as const;
const originalEnv: Record<string, string | undefined> = {};
for (const k of ENV_KEYS) originalEnv[k] = process.env[k];

function presetEnv(overrides: Record<string, string | undefined> = {}) {
  const base: Record<string, string | undefined> = {
    GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID: SHARED_DRIVE,
    GOOGLE_DRIVE_EVIDENCE_ROOT_FOLDER_ID: SHARED_DRIVE,
    GOOGLE_CALENDAR_EVIDENCE_ENABLED: 'true',
    GOOGLE_DRIVE_PACKET_FOLDER_ID: '',
    GOOGLE_DRIVE_AUTH_MODE: '',
    GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT: '',
    GOOGLE_APPLICATION_CREDENTIALS: KEY_MATCHING,
    DRIVE_01_CES_READINESS_DATE: '',
    GOOGLE_CALENDAR_ID: 'test-calendar-id@group.calendar.google.com',
    ...overrides,
  };
  for (const [k, v] of Object.entries(base)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

async function freshEnvModule() {
  vi.resetModules();
  return import('../../../../server/env');
}

beforeEach(() => {
  h.googleAuthCtorCalls.length = 0;
  h.impersonatedCtorCalls.length = 0;
  h.impersonatedInstances.length = 0;
  h.driveFactoryCalls.length = 0;
  h.calendarFactoryCalls.length = 0;
  for (const fn of Object.values(h.drive.files)) fn.mockClear();
  h.calendar.calendars.get.mockClear();
  for (const fn of Object.values(h.calendar.events)) fn.mockClear();
});

afterAll(() => {
  for (const [k, v] of Object.entries(originalEnv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

/* ─── DRIVE_EVIDENCE_LOCK ────────────────────────────────────────────────── */
describe('assertDriveEvidenceLock — approved values and fail-closed drift', () => {
  it('passes and is enforced for the approved key_file (dev) configuration', async () => {
    presetEnv();
    const { assertDriveEvidenceLock } = await freshEnvModule();
    const r = assertDriveEvidenceLock({ throwOnMismatch: true });
    expect(r.ok).toBe(true);
    expect(r.enforced).toBe(true);
    expect(r.problems).toEqual([]);
    expect(r.info.serviceAccountEmail).toBe(LOCK_EMAIL);
  });

  it('fails closed when the credential identity drifts from the lock', async () => {
    presetEnv({ GOOGLE_APPLICATION_CREDENTIALS: KEY_MISMATCH });
    const { assertDriveEvidenceLock } = await freshEnvModule();
    expect(() => assertDriveEvidenceLock({ throwOnMismatch: true })).toThrow(/config drift/);
  });

  it('fails on a Shared Drive id mismatch', async () => {
    presetEnv({ GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID: '0Bwrong-drive-id' });
    const { assertDriveEvidenceLock } = await freshEnvModule();
    const r = assertDriveEvidenceLock({ throwOnMismatch: false });
    expect(r.ok).toBe(false);
    expect(r.problems.join(' ')).toMatch(/sharedDriveId/);
  });

  it('impersonation mode with the approved target passes WITHOUT any key file', async () => {
    presetEnv({
      GOOGLE_DRIVE_AUTH_MODE: 'impersonation',
      GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT: LOCK_EMAIL,
      GOOGLE_APPLICATION_CREDENTIALS: KEY_ABSENT,
    });
    const { assertDriveEvidenceLock } = await freshEnvModule();
    const r = assertDriveEvidenceLock({ throwOnMismatch: true });
    expect(r.ok).toBe(true);
    expect(r.enforced).toBe(true); // keyless mode is still enforced fail-closed
    expect(r.info.driveImpersonationTarget).toBe(LOCK_EMAIL);
  });

  it('impersonation mode without a target fails closed', async () => {
    presetEnv({ GOOGLE_DRIVE_AUTH_MODE: 'impersonation', GOOGLE_APPLICATION_CREDENTIALS: KEY_ABSENT });
    const { assertDriveEvidenceLock } = await freshEnvModule();
    expect(() => assertDriveEvidenceLock({ throwOnMismatch: true }))
      .toThrow(/GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT is not set/);
  });

  it('impersonation mode fails closed when the packet folder id is overridden away from the lock', async () => {
    presetEnv({
      GOOGLE_DRIVE_AUTH_MODE: 'impersonation',
      GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT: LOCK_EMAIL,
      GOOGLE_DRIVE_PACKET_FOLDER_ID: '1WRONG-folder-id-not-event-packets',
      GOOGLE_APPLICATION_CREDENTIALS: KEY_ABSENT,
    });
    const { assertDriveEvidenceLock } = await freshEnvModule();
    expect(() => assertDriveEvidenceLock({ throwOnMismatch: true })).toThrow(/packetFolderId/);
  });

  it('impersonation mode passes when the configured packet folder equals the locked id', async () => {
    presetEnv({
      GOOGLE_DRIVE_AUTH_MODE: 'impersonation',
      GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT: LOCK_EMAIL,
      GOOGLE_DRIVE_PACKET_FOLDER_ID: PACKET_FOLDER,
      GOOGLE_APPLICATION_CREDENTIALS: KEY_ABSENT,
    });
    const { assertDriveEvidenceLock } = await freshEnvModule();
    expect(assertDriveEvidenceLock({ throwOnMismatch: true }).ok).toBe(true);
  });

  it('key_file (dev) mode still allows the development-only packet override', async () => {
    presetEnv({ GOOGLE_DRIVE_PACKET_FOLDER_ID: '1dev-scratch-folder-for-testing' });
    const { env, assertDriveEvidenceLock } = await freshEnvModule();
    expect(env.drivePacketFolderId).toBe('1dev-scratch-folder-for-testing'); // behavior unchanged
    expect(assertDriveEvidenceLock({ throwOnMismatch: false }).ok).toBe(true);
  });

  it('impersonation of a non-approved identity fails closed', async () => {
    presetEnv({
      GOOGLE_DRIVE_AUTH_MODE: 'impersonation',
      GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT: 'other@elsewhere.iam.gserviceaccount.com',
      GOOGLE_APPLICATION_CREDENTIALS: KEY_ABSENT,
    });
    const { assertDriveEvidenceLock } = await freshEnvModule();
    expect(() => assertDriveEvidenceLock({ throwOnMismatch: true })).toThrow(/impersonation target/);
  });

  it('never exposes private-key content in lock results', async () => {
    presetEnv();
    const { assertDriveEvidenceLock } = await freshEnvModule();
    const r = assertDriveEvidenceLock({ throwOnMismatch: false });
    expect(JSON.stringify(r)).not.toContain('FAKE-TEST-PLACEHOLDER');
  });
});

/* ─── packet folder resolution ───────────────────────────────────────────── */
describe('packet folder — externalized, value unchanged', () => {
  it('defaults to the canonical Event Packets folder id', async () => {
    presetEnv();
    const { env } = await freshEnvModule();
    expect(env.drivePacketFolderId).toBe(PACKET_FOLDER);
  });

  it('Shared Drive resolution returns exactly the canonical id', async () => {
    presetEnv();
    const { env } = await freshEnvModule();
    expect(env.driveEvidenceSharedDriveId).toBe(SHARED_DRIVE);
    expect(env.driveEvidenceRootFolderId).toBe(SHARED_DRIVE);
  });

  it('the current .env-style configuration resolves to the same id', async () => {
    presetEnv({ GOOGLE_DRIVE_PACKET_FOLDER_ID: PACKET_FOLDER });
    const { env } = await freshEnvModule();
    expect(env.drivePacketFolderId).toBe(PACKET_FOLDER);
  });

  it('resolvePacketLibraryRoot still returns the canonical id while 01_CES is locked — no Drive call', async () => {
    presetEnv();
    vi.resetModules();
    const ge = await import('../../../../server/googleEvidence');
    await expect(ge.resolvePacketLibraryRoot('mock')).resolves.toBe(PACKET_FOLDER);
    await expect(ge.resolvePacketLibraryRoot('admission')).resolves.toBe(PACKET_FOLDER);
    expect(h.drive.files.list).not.toHaveBeenCalled();
    expect(h.drive.files.create).not.toHaveBeenCalled();
  });
});

/* ─── Drive impersonation vs Calendar key-file — separation ─────────────── */
describe('Drive keyless impersonation and Calendar separation', () => {
  it('Drive uses ADC + Impersonated(target) while Calendar keeps its key-file client', async () => {
    presetEnv({
      GOOGLE_DRIVE_AUTH_MODE: 'impersonation',
      GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT: LOCK_EMAIL,
      GOOGLE_APPLICATION_CREDENTIALS: KEY_MATCHING, // Calendar still needs it locally
    });
    vi.resetModules();

    // Drive: ADC source (no keyFile) + impersonation of the locked identity.
    const gd = await import('../../../../server/googleDrive');
    const ping = await gd.pingDrive();
    expect(ping.reachable).toBe(true);
    expect(h.impersonatedCtorCalls).toHaveLength(1);
    expect(h.impersonatedCtorCalls[0].targetPrincipal).toBe(LOCK_EMAIL);
    expect(h.impersonatedCtorCalls[0].targetScopes).toContain('https://www.googleapis.com/auth/drive.file');
    const adcCall = h.googleAuthCtorCalls.find(
      (c) => !(c as Record<string, unknown>).keyFile,
    ) as Record<string, unknown>;
    expect(adcCall).toBeTruthy(); // Application Default Credentials — keyless

    // The Drive client is constructed with the IMPERSONATED credential — the
    // runtime service account (ADC source) is never the Drive principal, so it
    // can never become the owner of evidence files.
    expect(h.driveFactoryCalls).toHaveLength(1);
    expect(h.driveFactoryCalls[0].auth).toBe(h.impersonatedInstances[0]);

    // Calendar: unchanged construction — its OWN GoogleAuth WITH the key file.
    const gc = await import('../../../../server/googleCalendar');
    const calPing = await gc.pingCalendar();
    expect(calPing.reachable).toBe(true);
    expect(calPing.summary).toBe('CES Evidence Calendar');
    const calendarAuth = h.googleAuthCtorCalls.find(
      (c) => (c as Record<string, unknown>).keyFile === KEY_MATCHING,
    ) as Record<string, unknown>;
    expect(calendarAuth).toBeTruthy();
    expect(calendarAuth.scopes).toEqual(['https://www.googleapis.com/auth/calendar.events']);
    // Calendar never routes through Impersonated — impersonation is limited to
    // the Drive client path only.
    expect(h.impersonatedCtorCalls).toHaveLength(1);
    expect(h.calendarFactoryCalls).toHaveLength(1);
    expect(h.impersonatedInstances).not.toContain(h.calendarFactoryCalls[0].auth);
    expect((h.calendarFactoryCalls[0].auth as Record<string, unknown>).__mockAuthClient).toBe(true);
  });

  it('Calendar read path behaves as before and invokes no write method', async () => {
    presetEnv();
    vi.resetModules();
    const gc = await import('../../../../server/googleCalendar');
    const events = await gc.listEvents({ start: '2026-01-01', end: '2026-01-31' });
    expect(events).toEqual([]);
    expect(h.calendar.events.list).toHaveBeenCalled();
    expect(h.calendar.events.insert).not.toHaveBeenCalled();
    expect(h.calendar.events.update).not.toHaveBeenCalled();
    expect(h.calendar.events.patch).not.toHaveBeenCalled();
    expect(h.calendar.events.delete).not.toHaveBeenCalled();
  });

  it('Drive repository surface is backward compatible and no Drive write fired', async () => {
    presetEnv();
    vi.resetModules();
    const gd = await import('../../../../server/googleDrive');
    for (const fn of [
      'pingDrive', 'findFolder', 'createFolder', 'findOrCreateFolder', 'ensureFolderPath',
      'uploadFile', 'uploadOrReplaceFile', 'copyFile', 'downloadFileBytes', 'downloadSourceFile',
      'updateFileContent', 'findFileByName', 'listFolderTree', 'listFolderChildren',
      'driveFolderUrl', 'driveFileUrl',
    ]) {
      expect(typeof (gd as Record<string, unknown>)[fn], fn).toBe('function');
    }
    expect(h.drive.files.create).not.toHaveBeenCalled();
    expect(h.drive.files.update).not.toHaveBeenCalled();
    expect(h.drive.files.delete).not.toHaveBeenCalled();
  });
});
