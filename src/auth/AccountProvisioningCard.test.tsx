/**
 * COG remediation — AccountProvisioningCard now invites via the authenticated,
 * admin-only endpoint (AuthApi.adminInviteUser) and NEVER via the unauthenticated
 * legacy register-request path.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// The app build uses the automatic JSX runtime; the unit-test transform emits
// classic React.createElement, so source components that don't import React
// (they don't need to in the real build) require React in global scope here.
(globalThis as unknown as { React: typeof React }).React = React;

const authState = vi.hoisted(() => ({ value: { getAccessToken: () => 'admin-tok', isDemo: false, status: 'authenticated' } }));
vi.mock('./AuthProvider', () => ({ useAuth: () => authState.value }));

const adminInviteUser = vi.hoisted(() => vi.fn());
const registerRequest = vi.hoisted(() => vi.fn());
vi.mock('./api', () => ({
  AuthApi: { adminInviteUser, registerRequest },
  AuthApiError: class AuthApiError extends Error { status?: number; constructor(m: string, s?: number) { super(m); this.status = s; } },
}));

vi.mock('@/policy/security/identity/userAssignmentsStore', () => ({
  useUserAssignmentsStore: (sel: (s: { users: unknown[] }) => unknown) => sel({ users: [] }),
}));

import { AccountProvisioningCard } from './AccountProvisioningCard';

describe('AccountProvisioningCard invite', () => {
  beforeEach(() => { adminInviteUser.mockReset(); registerRequest.mockReset(); });

  it('invites through the authenticated admin endpoint with the access token; never register-request', async () => {
    adminInviteUser.mockResolvedValue({ status: 'invited_and_delivered', email: 'robertp+phase7uat@careindeed.com', emailDelivered: true, provisioned: true, message: 'Invitation sent.' });
    render(<AccountProvisioningCard />);

    fireEvent.change(screen.getByPlaceholderText('name@careindeed.com'), {
      target: { value: 'robertp+phase7uat@careindeed.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /invite/i }));

    await waitFor(() => expect(adminInviteUser).toHaveBeenCalledTimes(1));
    expect(adminInviteUser).toHaveBeenCalledWith('admin-tok', 'robertp+phase7uat@careindeed.com');
    expect(registerRequest).not.toHaveBeenCalled();
  });
});
