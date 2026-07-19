/**
 * Phase 7 — direct account-setup screen. Proves the two-step flow (verify →
 * password), that the password form unlocks only after server verification, that
 * sensitive fields are cleared, mismatched passwords are blocked client-side,
 * denials are safe, and no credential is written to browser storage.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Classic JSX transform in tests needs React in global scope for source files.
(globalThis as unknown as { React: typeof React }).React = React;

const verifyRegistration = vi.hoisted(() => vi.fn());
const setupAccountDirect = vi.hoisted(() => vi.fn());
vi.mock('@/auth/api', () => ({
  AuthApi: { verifyRegistration, setupAccountDirect },
  AuthApiError: class AuthApiError extends Error { status: number; constructor(m: string, s = 500) { super(m); this.status = s; } },
}));

import { SetupAccountDirectScreen } from './AuthFlowScreens';
import { AuthApiError } from '@/auth/api';

const CODE = 'X7K9Q2W4E1R8T5Y3';
const PW = 'Str0ng!Passw0rd';

function renderScreen() {
  return render(<MemoryRouter initialEntries={['/setup-account-direct']}><SetupAccountDirectScreen /></MemoryRouter>);
}
async function verifyStep() {
  verifyRegistration.mockResolvedValueOnce(undefined);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'robertp+phase7uat@careindeed.com' } });
  fireEvent.change(screen.getByLabelText('Activation code'), { target: { value: CODE } });
  fireEvent.click(screen.getByRole('button', { name: /verify eligibility/i }));
  await waitFor(() => expect(screen.getByLabelText('Confirm password')).toBeTruthy());
}

beforeEach(() => { verifyRegistration.mockReset(); setupAccountDirect.mockReset(); localStorage.clear(); sessionStorage.clear(); });

describe('SetupAccountDirectScreen', () => {
  it('starts on the verify step with no password fields', () => {
    renderScreen();
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Activation code')).toBeTruthy();
    expect(screen.queryByLabelText('Confirm password')).toBeNull();
    // non-admin notice present (text node after the <strong>not</strong>)
    expect(screen.getByText(/grant administrator access/i)).toBeTruthy();
  });

  it('unlocks the password step only after successful server verification', async () => {
    renderScreen();
    await verifyStep();
    expect(verifyRegistration).toHaveBeenCalledWith('robertp+phase7uat@careindeed.com', CODE);
    expect(screen.getByLabelText('Password', { exact: true })).toBeTruthy();
  });

  it('blocks mismatched passwords client-side (server not called)', async () => {
    renderScreen();
    await verifyStep();
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Phase7' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Uat' } });
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), { target: { value: PW } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(screen.getByText(/don’t match/i)).toBeTruthy());
    expect(setupAccountDirect).not.toHaveBeenCalled();
  });

  it('completes setup, submitting the verified email + code + password, then clears sensitive fields', async () => {
    setupAccountDirect.mockResolvedValueOnce({ success: true });
    renderScreen();
    await verifyStep();
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Phase7' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Uat' } });
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), { target: { value: PW } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: PW } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(setupAccountDirect).toHaveBeenCalledWith('robertp+phase7uat@careindeed.com', CODE, 'Phase7', 'Uat', PW));
    // sensitive fields cleared after success
    await waitFor(() => expect((screen.getByLabelText('Password', { exact: true }) as HTMLInputElement).value).toBe(''));
    expect((screen.getByLabelText('Confirm password') as HTMLInputElement).value).toBe('');
  });

  it('shows a safe error and clears the activation code on a not-approved verification', async () => {
    verifyRegistration.mockRejectedValueOnce(new AuthApiError('denied', 403));
    renderScreen();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'robertp+phase7uat@careindeed.com' } });
    fireEvent.change(screen.getByLabelText('Activation code'), { target: { value: CODE } });
    fireEvent.click(screen.getByRole('button', { name: /verify eligibility/i }));
    await waitFor(() => expect(screen.getByText(/couldn’t verify/i)).toBeTruthy());
    // stays on verify step; code cleared; no account enumeration
    expect((screen.getByLabelText('Activation code') as HTMLInputElement).value).toBe('');
    expect(screen.queryByLabelText('Confirm password')).toBeNull();
  });

  it('never writes the activation code or password to browser storage', async () => {
    setupAccountDirect.mockResolvedValueOnce({ success: true });
    renderScreen();
    await verifyStep();
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Phase7' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Uat' } });
    fireEvent.change(screen.getByLabelText('Password', { exact: true }), { target: { value: PW } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: PW } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(setupAccountDirect).toHaveBeenCalled());
    const dump = JSON.stringify(Object.entries(localStorage)) + JSON.stringify(Object.entries(sessionStorage));
    expect(dump).not.toContain(CODE);
    expect(dump).not.toContain(PW);
  });
});
