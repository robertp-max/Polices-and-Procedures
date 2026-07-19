/**
 * COG-2 hotfix — client user-access API. These prove the suspend/reactivate
 * calls hit the authoritative server router (/api/admin/user-access/*), carry
 * the bearer token + userId, parse the server-returned status, and surface
 * server errors (403) as a typed AuthApiError. No localStorage is involved.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthApi, AuthApiError } from './api';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

function ok(body: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response);
}
function err(status: number, code: string, message: string) {
  return Promise.resolve({
    ok: false,
    status,
    text: () => Promise.resolve(JSON.stringify({ error: { code, message } })),
  } as Response);
}

describe('AuthApi.suspendUser', () => {
  it('POSTs to the authoritative user-access router with bearer + userId', async () => {
    fetchMock.mockReturnValueOnce(ok({ ok: true, targetUserId: 'usr-1', after: { status: 'suspended' } }));
    const res = await AuthApi.suspendUser('tok-123', 'usr-1');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/admin/user-access/suspend');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok-123');
    expect(JSON.parse(init.body as string)).toEqual({ userId: 'usr-1' });
    expect(res.after.status).toBe('suspended');
  });

  it('surfaces a 403 as a typed AuthApiError', async () => {
    fetchMock.mockReturnValue(err(403, 'permission_denied', 'You do not have permission to manage user status.'));
    await expect(AuthApi.suspendUser('tok', 'usr-1')).rejects.toMatchObject({ status: 403, code: 'permission_denied' });
    await expect(AuthApi.suspendUser('tok', 'usr-1')).rejects.toBeInstanceOf(AuthApiError);
  });
});

describe('AuthApi.reactivateUser', () => {
  it('POSTs to …/reactivate and returns the server status', async () => {
    fetchMock.mockReturnValueOnce(ok({ ok: true, targetUserId: 'usr-1', after: { status: 'active' } }));
    const res = await AuthApi.reactivateUser('tok', 'usr-1');
    expect(fetchMock.mock.calls[0][0]).toBe('/api/admin/user-access/reactivate');
    expect(res.after.status).toBe('active');
  });
});

describe('AuthApi.listUserAccess', () => {
  it('GETs the server registry projection', async () => {
    fetchMock.mockReturnValueOnce(ok({ users: [{ userId: 'usr-1', email: 'a@b.com', name: 'A', status: 'active', roles: [], privileged: false }] }));
    const res = await AuthApi.listUserAccess('tok');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/admin/user-access/');
    expect(init.method).toBe('GET');
    expect(res.users).toHaveLength(1);
  });
});
