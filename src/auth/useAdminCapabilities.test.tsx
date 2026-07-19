/**
 * COG remediation — client capability hook. The admin-screen gate is DISPLAY
 * state only, derived from the server /capabilities contract. These tests prove
 * it never grants access from client state, clears on de-auth, and is race-safe:
 * a stale/out-of-order/prior-principal response can never restore privileged UI.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

type AuthShape = {
  status: string;
  getAccessToken: () => string | null;
  isDemo: boolean;
  user: { userId?: string; cognitoSub?: string } | null;
};
const authState = vi.hoisted(() => ({ value: null as unknown as AuthShape }));
vi.mock('./AuthProvider', () => ({ useAuth: () => authState.value }));

const getCapabilities = vi.hoisted(() => vi.fn());
vi.mock('./api', () => ({ AuthApi: { getCapabilities } }));

import { useManageUsersCapability } from './useAdminCapabilities';

const admin = (over: Partial<AuthShape> = {}): AuthShape =>
  ({ status: 'authenticated', getAccessToken: () => 'admintok', isDemo: false, user: { userId: 'admin-1' }, ...over });
const ordinary = (): AuthShape =>
  ({ status: 'authenticated', getAccessToken: () => 'ordtok', isDemo: false, user: { userId: 'ord-1' } });
const loggedOut = (): AuthShape =>
  ({ status: 'unauthenticated', getAccessToken: () => null, isDemo: false, user: null });

const caps = (manageUsers: boolean) => ({ authenticated: true, authorization: { capabilities: { manageUsers } } });
function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

beforeEach(() => { getCapabilities.mockReset(); authState.value = admin(); });

describe('useManageUsersCapability — basic contract', () => {
  it('is allowed when the server grants manageUsers', async () => {
    getCapabilities.mockResolvedValue(caps(true));
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('allowed'));
    expect(result.current.manageUsers).toBe(true);
    expect(getCapabilities).toHaveBeenCalledWith('admintok');
  });

  it('is denied when the server denies manageUsers', async () => {
    getCapabilities.mockResolvedValue(caps(false));
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('denied'));
    expect(result.current.manageUsers).toBe(false);
  });

  it('is error (NOT allowed) when the capability fetch fails', async () => {
    getCapabilities.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('error'));
    expect(result.current.manageUsers).toBe(false);
  });

  it('is denied and performs no fetch when unauthenticated', async () => {
    authState.value = loggedOut();
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('denied'));
    expect(getCapabilities).not.toHaveBeenCalled();
  });

  it('is denied when an authenticated session has no usable token (cannot self-elevate)', async () => {
    authState.value = admin({ getAccessToken: () => null });
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('denied'));
    expect(getCapabilities).not.toHaveBeenCalled();
  });

  it('grants the local demo identity without a server round-trip', async () => {
    authState.value = { status: 'demo', getAccessToken: () => null, isDemo: true, user: null };
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('allowed'));
    expect(getCapabilities).not.toHaveBeenCalled();
  });
});

describe('useManageUsersCapability — race safety', () => {
  it('R1: a delayed admin response arriving AFTER logout cannot restore admin UI', async () => {
    const d = deferred<ReturnType<typeof caps>>();
    getCapabilities.mockReturnValueOnce(d.promise);
    const { result, rerender } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('loading'));

    act(() => { authState.value = loggedOut(); });
    rerender();
    expect(result.current.state).toBe('denied');

    await act(async () => { d.resolve(caps(true)); await Promise.resolve(); });
    expect(result.current.state).toBe('denied'); // stale prior-admin response ignored
  });

  it('R2: an admin response cannot apply after an ordinary user replaces the session', async () => {
    const dAdmin = deferred<ReturnType<typeof caps>>();
    const dOrd = deferred<ReturnType<typeof caps>>();
    getCapabilities.mockReturnValueOnce(dAdmin.promise).mockReturnValueOnce(dOrd.promise);
    const { result, rerender } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('loading'));

    act(() => { authState.value = ordinary(); });
    rerender();
    expect(result.current.state).toBe('loading'); // prior fetched result no longer matches session

    await act(async () => { dAdmin.resolve(caps(true)); await Promise.resolve(); });
    expect(result.current.state).not.toBe('allowed'); // admin's own late response is discarded

    await act(async () => { dOrd.resolve(caps(false)); await Promise.resolve(); });
    await waitFor(() => expect(result.current.state).toBe('denied'));
  });

  it('R3: an out-of-order response (A resolves after B) cannot overwrite the newer result', async () => {
    const dA = deferred<ReturnType<typeof caps>>();
    const dB = deferred<ReturnType<typeof caps>>();
    getCapabilities.mockReturnValueOnce(dA.promise).mockReturnValueOnce(dB.promise);
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('loading'));

    act(() => { result.current.refetch(); });                 // starts request B
    await act(async () => { dB.resolve(caps(true)); await Promise.resolve(); });
    await waitFor(() => expect(result.current.state).toBe('allowed'));

    await act(async () => { dA.resolve(caps(false)); await Promise.resolve(); });
    expect(result.current.state).toBe('allowed');             // stale A ignored
  });

  it('R4: a response arriving after unmount performs no state update and does not throw', async () => {
    const d = deferred<ReturnType<typeof caps>>();
    getCapabilities.mockReturnValueOnce(d.promise);
    const { result, unmount } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('loading'));
    unmount();
    await act(async () => { d.resolve(caps(true)); await Promise.resolve(); });
    expect(getCapabilities).toHaveBeenCalledTimes(1); // resolved safely, no throw
  });

  it('R5: retry after a failure re-resolves the capability', async () => {
    getCapabilities.mockRejectedValueOnce(new Error('net')).mockResolvedValueOnce(caps(true));
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('error'));
    act(() => { result.current.refetch(); });
    await waitFor(() => expect(result.current.state).toBe('allowed'));
  });

  it('R6: session restoration (loading → authenticated) triggers a fresh fetch', async () => {
    authState.value = { status: 'loading', getAccessToken: () => null, isDemo: false, user: null };
    getCapabilities.mockResolvedValue(caps(true));
    const { result, rerender } = renderHook(() => useManageUsersCapability());
    expect(result.current.state).toBe('loading');
    expect(getCapabilities).not.toHaveBeenCalled();

    act(() => { authState.value = admin(); });
    rerender();
    await waitFor(() => expect(result.current.state).toBe('allowed'));
  });
});
