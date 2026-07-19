import { type FormEvent, type ReactNode, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, LoaderCircle, LockKeyhole, Mail, ShieldAlert, UserRound } from 'lucide-react';
import { AuthApi, AuthApiError } from '@/auth/api';

/**
 * Phase COG-1 auth-flow screens: forgot password, reset password, and
 * invited-account setup. Same visual language as LoginScreen; all backend
 * calls go through the existing AuthApi client. Errors shown are actionable
 * but safe (no account enumeration, no raw backend internals).
 */

const SERVICE_ERROR = 'The service is temporarily unavailable. Please try again shortly.';

const fieldShell = 'relative flex h-control items-center rounded-2xl border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal shadow-rest transition duration-fast ease-standard focus-within:border-brand-teal';
const fieldInput = 'min-w-0 flex-1 bg-transparent pl-11 pr-md text-body font-light text-ink placeholder:text-disabled appearance-none border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0';
const primaryButton = 'inline-flex h-[52px] w-full items-center justify-center gap-sm rounded-2xl border border-transparent bg-brand-teal px-lg text-xs font-medium uppercase tracking-tag text-on-brand shadow-none transition duration-fast ease-standard hover:bg-brand-teal-deep focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-70';

function AuthCard({ route, hashId, title, subtitle, error, notice, children }: {
  route: string;
  hashId: string;
  title: string;
  subtitle: string;
  error?: string | null;
  notice?: string | null;
  children: ReactNode;
}) {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-tone-teal-bg p-lg text-ink"
      data-group="Auth"
      data-hash-id={hashId}
      data-route={route}
      data-template="login"
    >
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-surface-glass backdrop-blur-md shadow-glass-inset backdrop-blur-3xl" />
      </div>
      <section className="relative z-10 w-full max-w-[440px] rounded-[32px] border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset shadow-hover">
        <div className="p-8">
          <div className="mb-2xl flex justify-center">
            <img src="/ci-logo-gray.png" alt="CareIndeed" className="h-10 w-auto object-contain" />
          </div>
          <div className="mb-2xl text-center">
            <h2 className="text-xl font-medium tracking-wide text-brand-teal-deep">{title}</h2>
            <p className="mt-1.5 text-sm font-light text-secondary">{subtitle}</p>
          </div>
          {error ? (
            <div className="mb-lg flex items-start gap-sm rounded-2xl border border-tone-orange-border bg-tone-orange-bg px-md py-sm text-sm text-ink" role="alert">
              <ShieldAlert aria-hidden="true" className="mt-0.5 h-icon-sm w-icon-sm shrink-0 text-brand-orange" />
              <span>{error}</span>
            </div>
          ) : null}
          {notice ? (
            <div className="mb-lg flex items-start gap-sm rounded-2xl border border-tone-teal-border bg-tone-teal-bg px-md py-sm text-sm text-ink" role="status">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-icon-sm w-icon-sm shrink-0 text-brand-teal" />
              <span>{notice}</span>
            </div>
          ) : null}
          {children}
          <p className="mt-8 text-center text-xs font-light text-disabled">
            <Link className="font-medium text-muted transition duration-fast ease-standard hover:text-ink" to="/login">Back to sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

/* ─── Forgot password ────────────────────────────────────────────────────── */
export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Enter your email address.'); return; }
    setLoading(true);
    try {
      await AuthApi.forgotPassword(email.trim());
      // Same outcome whether or not the account exists — no enumeration.
      setSent(true);
    } catch (e) {
      // The backend responds generically; anything else is a service issue.
      setError(e instanceof AuthApiError && e.status < 500 ? null : SERVICE_ERROR);
      setSent(e instanceof AuthApiError && e.status < 500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      route="/forgot-password" hashId="forgot-password-page"
      title="Reset Your Password"
      subtitle="Enter your email and we will send a reset code if an account exists."
      error={error}
      notice={sent ? 'If an account exists for that email, a reset code is on its way. Continue below once you have it.' : null}
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <label className="grid gap-sm">
          <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">Email Address</span>
          <span className={fieldShell}>
            <Mail aria-hidden="true" className="absolute left-md h-icon-sm w-icon-sm" />
            <input autoComplete="email" className={fieldInput} disabled={loading} onChange={(e) => setEmail(e.target.value)} placeholder="name@careindeed.com" type="email" value={email} />
          </span>
        </label>
        <div className="pt-2">
          <button className={primaryButton} disabled={loading} type="submit">
            <span>{loading ? 'Sending code' : 'Send reset code'}</span>
            {loading ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" /> : null}
          </button>
        </div>
        {sent ? (
          <button
            className="w-full text-center text-sm font-medium text-brand-teal transition duration-fast ease-standard hover:text-brand-teal-deep"
            onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`)}
            type="button"
          >
            I have my reset code →
          </button>
        ) : null}
      </form>
    </AuthCard>
  );
}

/* ─── Reset password (with emailed code) ─────────────────────────────────── */
export function ResetPasswordScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !code.trim() || !newPassword) { setError('Enter your email, the reset code, and a new password.'); return; }
    setLoading(true);
    try {
      await AuthApi.resetPassword(email.trim(), code.trim(), newPassword);
      setDone(true);
      window.setTimeout(() => navigate('/login', { replace: true }), 900);
    } catch (e) {
      if (e instanceof AuthApiError && e.status === 400) {
        setError('That code is invalid or has expired, or the password does not meet the policy. Request a new code and try a stronger password.');
      } else {
        setError(SERVICE_ERROR);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      route="/reset-password" hashId="reset-password-page"
      title="Choose a New Password"
      subtitle="Enter the reset code from your email and your new password."
      error={error}
      notice={done ? 'Password updated. Taking you to sign in…' : null}
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <label className="grid gap-sm">
          <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">Email Address</span>
          <span className={fieldShell}>
            <Mail aria-hidden="true" className="absolute left-md h-icon-sm w-icon-sm" />
            <input autoComplete="email" className={fieldInput} disabled={loading} onChange={(e) => setEmail(e.target.value)} type="email" value={email} />
          </span>
        </label>
        <label className="grid gap-sm">
          <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">Reset Code</span>
          <span className={fieldShell}>
            <ShieldAlert aria-hidden="true" className="absolute left-md h-icon-sm w-icon-sm" />
            <input autoComplete="one-time-code" className={fieldInput} disabled={loading} inputMode="numeric" onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" value={code} />
          </span>
        </label>
        <label className="grid gap-sm">
          <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">New Password</span>
          <span className={fieldShell}>
            <LockKeyhole aria-hidden="true" className="absolute left-md h-icon-sm w-icon-sm" />
            <input autoComplete="new-password" className={fieldInput} disabled={loading} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••••••" type="password" value={newPassword} />
          </span>
        </label>
        <div className="pt-2">
          <button className={primaryButton} disabled={loading || done} type="submit">
            <span>{loading ? 'Updating password' : 'Update password'}</span>
            {loading ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" /> : null}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}

/* ─── Invited-account setup (?token= from the setup email) ───────────────── */
export function SetupAccountScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(!token ? 'This setup link is missing its token. Use the link from your invitation email, or ask an administrator to resend it.' : null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!token) { setError('This setup link is invalid. Ask an administrator to resend your invitation.'); return; }
    if (!firstName.trim() || !lastName.trim()) { setError('Enter your first and last name.'); return; }
    if (password.length < 8) { setError('Choose a password of at least 8 characters (with upper/lower case, a number, and a symbol).'); return; }
    setLoading(true);
    try {
      await AuthApi.setupAccount(token, firstName.trim(), lastName.trim(), password);
      setDone(true);
      window.setTimeout(() => navigate('/login', { replace: true }), 900);
    } catch (e) {
      if (e instanceof AuthApiError && (e.status === 400 || e.status === 410)) {
        setError('This setup link has expired or was already used. Ask an administrator to resend your invitation.');
      } else if (e instanceof AuthApiError && e.status === 422) {
        setError('That password does not meet the password policy. Try a longer password with upper/lower case letters, a number, and a symbol.');
      } else {
        setError(SERVICE_ERROR);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      route="/setup-account" hashId="setup-account-page"
      title="Set Up Your Account"
      subtitle="Complete your CareIndeed account to sign in."
      error={error}
      notice={done ? 'Account ready. Taking you to sign in…' : null}
    >
      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-md">
          <label className="grid gap-sm">
            <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">First Name</span>
            <span className={fieldShell}>
              <UserRound aria-hidden="true" className="absolute left-md h-icon-sm w-icon-sm" />
              <input autoComplete="given-name" className={fieldInput} disabled={loading} onChange={(e) => setFirstName(e.target.value)} value={firstName} />
            </span>
          </label>
          <label className="grid gap-sm">
            <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">Last Name</span>
            <span className={fieldShell}>
              <UserRound aria-hidden="true" className="absolute left-md h-icon-sm w-icon-sm" />
              <input autoComplete="family-name" className={fieldInput} disabled={loading} onChange={(e) => setLastName(e.target.value)} value={lastName} />
            </span>
          </label>
        </div>
        <label className="grid gap-sm">
          <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">Password</span>
          <span className={fieldShell}>
            <LockKeyhole aria-hidden="true" className="absolute left-md h-icon-sm w-icon-sm" />
            <input autoComplete="new-password" className={fieldInput} disabled={loading} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" type="password" value={password} />
          </span>
        </label>
        <div className="pt-2">
          <button className={primaryButton} disabled={loading || done} type="submit">
            <span>{loading ? 'Creating account' : 'Create account'}</span>
            {loading ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" /> : null}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
