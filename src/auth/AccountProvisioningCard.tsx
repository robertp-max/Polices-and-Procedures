/**
 * Account provisioning — Phase COG-1 admin card.
 *
 * Connects the existing /admin/users workflow to the existing Cognito auth
 * backend. All operations reuse the deployed API (AuthApi): invite via setup
 * link, resend setup link, grant access (temporary password), and manual
 * password reset. The canonical CIHHC `User` stays the application record;
 * the Cognito binding shows up as authSubject/provider on that record (via
 * /me identity sync and the registry sync endpoints).
 *
 * Server authority: every admin endpoint re-validates the caller's access
 * token server-side (assertAdminAccessToken) — this card is convenience UI,
 * not the security boundary. In local demo mode the actions are disabled
 * because there is no real access token to act with.
 */
import { type FormEvent, useMemo, useState } from 'react';
import { KeyRound, LoaderCircle, MailPlus, RefreshCcw, ShieldCheck, UserPlus } from 'lucide-react';
import { AuthApi, AuthApiError } from './api';
import { useAuth } from './AuthProvider';
import { useUserAssignmentsStore } from '@/policy/security/identity/userAssignmentsStore';

type Busy = 'invite' | 'resend' | 'grant' | 'reset' | null;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function AccountProvisioningCard() {
  const { getAccessToken, isDemo, status } = useAuth();
  const users = useUserAssignmentsStore((s) => s.users);
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalized = normalizeEmail(email);
  const boundUser = useMemo(
    () => users.find((u) => normalizeEmail(u.email) === normalized) ?? null,
    [users, normalized],
  );
  const canOperate = status === 'authenticated' && !isDemo;

  function report(kind: 'ok' | 'err', text: string) {
    if (kind === 'ok') { setMessage(text); setError(null); } else { setError(text); setMessage(null); }
  }

  function safeError(e: unknown, fallback: string): string {
    if (e instanceof AuthApiError) {
      if (e.status === 401 || e.status === 403) return 'You do not have permission to manage account access.';
      if (e.status === 409) return 'An account for that email already exists.';
      if (e.message && !/token|secret|password/i.test(e.message)) return e.message;
    }
    return fallback;
  }

  async function run(kind: Exclude<Busy, null>, action: () => Promise<string>) {
    if (!normalized) { report('err', 'Enter the user’s email address first.'); return; }
    setBusy(kind);
    try {
      report('ok', await action());
    } catch (e) {
      report('err', safeError(e, 'The account service is temporarily unavailable. Please try again.'));
    } finally {
      setBusy(null);
    }
  }

  async function handleInvite(event: FormEvent) {
    event.preventDefault();
    // Administrator-only invitation. Uses the authenticated /admin/users/invite
    // endpoint (verified admin actor, audited) — NOT the unauthenticated,
    // domain-gated /register-request self-service path.
    await run('invite', async () => {
      const result = await AuthApi.adminInviteUser(requireToken(), normalized);
      return result.message || 'Invitation processed. The user will receive a setup link.';
    });
  }

  const requireToken = (): string => {
    const token = getAccessToken();
    if (!token) throw new AuthApiError('Sign in with an administrator account to manage access.', 401);
    return token;
  };

  return (
    <section
      aria-labelledby="account-provisioning-title"
      className="rounded-lg border border-tone-teal-border bg-surface-glass p-xl shadow-rest backdrop-blur-md shadow-glass-inset"
      data-testid="account-provisioning-card"
    >
      <div className="mb-md flex items-center gap-sm">
        <ShieldCheck aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
        <h2 className="text-h2 font-medium text-ink" id="account-provisioning-title">Account access (Cognito)</h2>
      </div>
      <p className="mb-lg text-sm font-light text-secondary">
        Provision real login accounts through the deployed authentication backend. The CIHHC user record stays
        canonical; the login account is bound to it by email and Cognito subject.
      </p>

      {!canOperate ? (
        <p className="mb-lg rounded-2xl border border-tone-orange-border bg-tone-orange-bg px-md py-sm text-sm text-ink" role="note">
          {isDemo
            ? 'Local demo session — account provisioning needs a real administrator sign-in.'
            : 'Sign in as an administrator to manage account access.'}
        </p>
      ) : null}

      <form className="grid gap-md" onSubmit={handleInvite}>
        <label className="grid gap-sm">
          <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">User email</span>
          <input
            autoComplete="off"
            className="h-control rounded-2xl border border-card bg-surface-glass px-md text-body font-light text-ink shadow-glass-inset outline-none placeholder:text-disabled focus:border-brand-teal"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@careindeed.com"
            type="email"
            value={email}
          />
        </label>

        {normalized ? (
          <p className="text-xs font-light text-secondary" data-testid="binding-state">
            {boundUser
              ? boundUser.authSubject
                ? <>Bound to CIHHC user <span className="font-medium">{boundUser.name}</span> ({boundUser.id}) · provider {boundUser.provider ?? 'cognito'} · sub {boundUser.authSubject.slice(0, 8)}… · status {boundUser.status}</>
                : <>Matches CIHHC user <span className="font-medium">{boundUser.name}</span> ({boundUser.id}) — no login account bound yet ({boundUser.status}).</>
              : 'No CIHHC user record with this email yet — it will be created and bound on first sign-in.'}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-sm">
          <button
            className="inline-flex min-h-tap items-center gap-sm rounded-2xl bg-brand-teal px-lg text-xs font-medium uppercase tracking-tag text-on-brand transition duration-fast ease-standard hover:bg-brand-teal-deep disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canOperate || busy !== null}
            type="submit"
          >
            {busy === 'invite' ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" /> : <UserPlus aria-hidden="true" className="h-icon-sm w-icon-sm" />}
            Invite (send setup link)
          </button>
          <button
            className="inline-flex min-h-tap items-center gap-sm rounded-2xl border border-tone-teal-border bg-tone-teal-bg px-lg text-xs font-medium uppercase tracking-tag text-ink transition duration-fast ease-standard hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canOperate || busy !== null}
            onClick={() => run('resend', async () => (await AuthApi.resendSetupLink(normalized)).message || 'Setup link resent (if a pending invitation exists).')}
            type="button"
          >
            {busy === 'resend' ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" /> : <MailPlus aria-hidden="true" className="h-icon-sm w-icon-sm" />}
            Resend setup link
          </button>
          <button
            className="inline-flex min-h-tap items-center gap-sm rounded-2xl border border-tone-teal-border bg-tone-teal-bg px-lg text-xs font-medium uppercase tracking-tag text-ink transition duration-fast ease-standard hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canOperate || busy !== null || tempPassword.length < 8}
            onClick={() => run('grant', async () => (await AuthApi.adminGrantAccess(requireToken(), normalized, tempPassword)).message || 'Access granted with a temporary password. The user must change it at first sign-in.')}
            type="button"
          >
            {busy === 'grant' ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" /> : <KeyRound aria-hidden="true" className="h-icon-sm w-icon-sm" />}
            Grant access (temp password)
          </button>
          <button
            className="inline-flex min-h-tap items-center gap-sm rounded-2xl border border-tone-teal-border bg-tone-teal-bg px-lg text-xs font-medium uppercase tracking-tag text-ink transition duration-fast ease-standard hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canOperate || busy !== null || tempPassword.length < 8}
            onClick={() => run('reset', async () => (await AuthApi.adminManualPasswordReset(requireToken(), normalized, tempPassword)).message || 'Password reset. Share the temporary password securely; the user must change it at sign-in.')}
            type="button"
          >
            {busy === 'reset' ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" /> : <RefreshCcw aria-hidden="true" className="h-icon-sm w-icon-sm" />}
            Manual password reset
          </button>
        </div>

        <label className="grid max-w-[360px] gap-sm">
          <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">Temporary password (for grant/reset)</span>
          <input
            autoComplete="new-password"
            className="h-control rounded-2xl border border-card bg-surface-glass px-md text-body font-light text-ink shadow-glass-inset outline-none placeholder:text-disabled focus:border-brand-teal"
            onChange={(e) => setTempPassword(e.target.value)}
            placeholder="Min 8 chars, mixed case, digit, symbol"
            type="password"
            value={tempPassword}
          />
        </label>

        {message ? <p className="rounded-2xl border border-tone-teal-border bg-tone-teal-bg px-md py-sm text-sm text-ink" role="status">{message}</p> : null}
        {error ? <p className="rounded-2xl border border-tone-orange-border bg-tone-orange-bg px-md py-sm text-sm text-ink" role="alert">{error}</p> : null}

        <p className="text-xs font-light text-disabled">
          Disable/enable remains the CIHHC user status (suspend) above; Cognito-side disable ships with a later
          server extension. Invitations honor the approved-domain and explicit allowlist policy. MFA is deliberately
          deferred (see docs/COG1_COGNITO_LOGIN.md) and is not enforced in this phase.
        </p>
      </form>
    </section>
  );
}
