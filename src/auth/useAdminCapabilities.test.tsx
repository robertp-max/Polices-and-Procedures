/**
 * COG remediation — client capability hook. The admin-screen gate is DISPLAY
 * state only, derived from the server /capabilities contract. These tests prove
 * it never grants access from client state and clears on de-auth.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

type AuthShape = { status: string; getAccessToken: () => string | null; isDemo: boolean };
const authState = vi.hoisted(() => ({ value: null as unknown as AuthShape }));
vi.mock('./AuthProvider', () => ({ useAuth: () => authState.value }));

const getCapabilities = vi.hoisted(() => vi.fn());
vi.mock('./api', () => ({ AuthApi: { getCapabilities } }));

import { useManageUsersCapability } from './useAdminCapabilities';

function setAuth(over: Partial<AuthShape> = {}) {
  authState.value = { status: 'authenticated', getAccessToken: () => 'tok', isDemo: false, ...over };
}

describe('useManageUsersCapability', () => {
  beforeEach(() => { getCapabilities.mockReset(); });

  it('is allowed when the server grants manageUsers', async () => {
    setAuth();
    getCapabilities.mockResolvedValue({ authenticated: true, authorization: { capabilities: { manageUsers: true } } });
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('allowed'));
    expect(result.current.manageUsers).toBe(true);
    expect(getCapabilities).toHaveBeenCalledWith('tok');
  });

  it('is denied when the server denies manageUsers', async () => {
    setAuth();
    getCapabilities.mockResolvedValue({ authenticated: true, authorization: { capabilities: { manageUsers: false } } });
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('denied'));
    expect(result.current.manageUsers).toBe(false);
  });

  it('is error (NOT allowed) when the capability fetch fails', async () => {
    setAuth();
    getCapabilities.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('error'));
    expect(result.current.manageUsers).toBe(false);
  });

  it('is denied and performs no fetch when unauthenticated', async () => {
    setAuth({ status: 'unauthenticated', getAccessToken: () => null });
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('denied'));
    expect(getCapabilities).not.toHaveBeenCalled();
  });

  it('is denied when an authenticated session has no usable token (cannot self-elevate)', async () => {
    setAuth({ status: 'authenticated', getAccessToken: () => null });
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('denied'));
    expect(getCapabilities).not.toHaveBeenCalled();
  });

  it('grants the local demo identity without a server round-trip', async () => {
    setAuth({ status: 'demo', isDemo: true, getAccessToken: () => null });
    const { result } = renderHook(() => useManageUsersCapability());
    await waitFor(() => expect(result.current.state).toBe('allowed'));
    expect(getCapabilities).not.toHaveBeenCalled();
  });
});
