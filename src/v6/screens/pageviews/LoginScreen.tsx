import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldAlert } from 'lucide-react';
import { cx } from '../../utils/classNames';
import { BRAD_DEFAULT_ROUTE, safeReturnTo } from '../../utils/safeRedirect';
import { useAuth } from '@/auth/AuthProvider';

/**
 * Phase COG-1: real Cognito-backed sign-in through useAuth(). Handles the
 * NEW_PASSWORD_REQUIRED first-login challenge with a typed internal model —
 * raw Cognito challenge objects never reach this component. Credential errors
 * are generic (no account enumeration).
 */
export function LoginScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, completeNewPassword, challenge, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const displayError = localError ?? error;
  const inChallenge = challenge?.type === 'NEW_PASSWORD_REQUIRED';

  function redirectAfterAuth() {
    setToastVisible(true);
    // Honor a safe intended deep link (?returnTo= / ?from=); otherwise the
    // default authenticated landing is Brad. SPA navigation preserves routing.
    const dest = safeReturnTo(searchParams.get('returnTo') ?? searchParams.get('from'));
    window.setTimeout(() => navigate(dest, { replace: true }), 400);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    clearError();
    if (!email.trim() || !password) {
      setLocalError('Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const outcome = await login(email.trim(), password);
      if (outcome === 'ok') redirectAfterAuth();
      // outcome === 'challenge' → the NEW_PASSWORD_REQUIRED form renders below.
    } catch {
      // useAuth().error already carries the safe message.
    } finally {
      setLoading(false);
    }
  }

  async function handleChallengeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    clearError();
    if (newPassword.length < 8) {
      setLocalError('Choose a password of at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await completeNewPassword(newPassword);
      redirectAfterAuth();
    } catch {
      // useAuth().error carries the safe policy/service message.
    } finally {
      setLoading(false);
    }
  }

  const fieldShell = 'relative flex h-control items-center rounded-2xl border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal shadow-rest transition duration-fast ease-standard focus-within:border-brand-teal';
  const fieldInput = 'min-w-0 flex-1 bg-transparent pl-11 pr-md text-body font-light text-ink placeholder:text-disabled appearance-none border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0';

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-tone-teal-bg p-lg text-ink"
      data-group="Auth"
      data-hash-id="login-page"
      data-route="/login"
      data-template="login"
    >
      {/* Subtle background enhancement matching V6 prototype */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-surface-glass backdrop-blur-md shadow-glass-inset backdrop-blur-3xl" />
      </div>

      <a
        className="absolute right-lg top-lg z-20 inline-flex min-h-tap items-center gap-sm rounded-lg border border-tone-teal-border bg-tone-teal-bg px-md text-sm font-medium text-ink shadow-rest transition duration-fast ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
        href={BRAD_DEFAULT_ROUTE}
      >
        <ArrowLeft aria-hidden="true" className="h-icon-sm w-icon-sm" />
        Back to Dashboard
      </a>

      <section className="relative z-10 w-full max-w-[440px] rounded-[32px] border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset shadow-hover">
        <div className="p-8">
        <div className="mb-2xl flex justify-center">
          <img
            src="/ci-logo-gray.png"
            alt="CareIndeed"
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="mb-2xl text-center">
          <h2 className="text-xl font-medium tracking-wide text-brand-teal-deep">
            {inChallenge ? 'Set Your New Password' : 'Welcome Back'}
          </h2>
          <p className="mt-1.5 text-sm font-light text-secondary">
            {inChallenge
              ? 'Your account requires a new password before continuing.'
              : 'Please enter your credentials to continue'}
          </p>
        </div>

        {displayError ? (
          <div className="mb-lg flex items-start gap-sm rounded-2xl border border-tone-orange-border bg-tone-orange-bg px-md py-sm text-sm text-ink" role="alert">
            <ShieldAlert aria-hidden="true" className="mt-0.5 h-icon-sm w-icon-sm shrink-0 text-brand-orange" />
            <span>{displayError}</span>
          </div>
        ) : null}

        {inChallenge ? (
          <form className="space-y-5" noValidate onSubmit={handleChallengeSubmit}>
            <p className="text-sm font-light text-secondary">
              Signing in as <span className="font-medium text-ink">{challenge.email}</span>
            </p>
            <label className="grid gap-sm">
              <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">New Password</span>
              <span className={fieldShell}>
                <LockKeyhole aria-hidden="true" className="absolute left-md h-icon-sm w-icon-sm" />
                <input
                  autoComplete="new-password"
                  className={fieldInput}
                  disabled={loading}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="••••••••••••"
                  type="password"
                  value={newPassword}
                />
              </span>
            </label>
            <label className="grid gap-sm">
              <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">Confirm Password</span>
              <span className={fieldShell}>
                <LockKeyhole aria-hidden="true" className="absolute left-md h-icon-sm w-icon-sm" />
                <input
                  autoComplete="new-password"
                  className={fieldInput}
                  disabled={loading}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••••••"
                  type="password"
                  value={confirmPassword}
                />
              </span>
            </label>
            <div className="pt-2">
              <button
                className="inline-flex h-[52px] w-full items-center justify-center gap-sm rounded-2xl border border-transparent bg-brand-teal px-lg text-xs font-medium uppercase tracking-tag text-on-brand shadow-none transition duration-fast ease-standard hover:bg-brand-teal-deep focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                type="submit"
              >
                <span>{loading ? 'Updating password' : 'Set password and sign in'}</span>
                {loading ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" /> : null}
              </button>
            </div>
          </form>
        ) : (
        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          <label className="grid gap-sm">
            <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">Email Address</span>
            <span className={fieldShell}>
              <Mail aria-hidden="true" className="absolute left-md h-icon-sm w-icon-sm" />
              <input
                autoComplete="email"
                className={fieldInput}
                disabled={loading}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@careindeed.com"
                type="email"
                value={email}
              />
            </span>
          </label>

          <label className="grid gap-sm">
            <span className="flex items-center justify-between gap-md">
              <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">Password</span>
              <Link className="text-xs font-medium text-muted transition duration-fast ease-standard hover:text-ink" to="/forgot-password">
                Forgot password?
              </Link>
            </span>
            <span className={fieldShell}>
              <LockKeyhole aria-hidden="true" className="absolute left-md h-icon-sm w-icon-sm" />
              <input
                autoComplete="current-password"
                className={cx(fieldInput, 'pr-11')}
                disabled={loading}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-md grid h-tap w-tap place-items-center rounded-md text-brand-teal transition duration-fast ease-standard hover:bg-tone-teal-bg focus-visible:outline-none focus-visible:shadow-focus"
                disabled={loading}
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? <EyeOff aria-hidden="true" className="h-icon-sm w-icon-sm" /> : <Eye aria-hidden="true" className="h-icon-sm w-icon-sm" />}
              </button>
            </span>
          </label>

          <div className="flex items-center justify-between gap-md pt-1 text-[13px] text-muted">
            <label className="flex items-center gap-sm">
              <input
                checked={rememberDevice}
                className="h-icon-sm w-icon-sm accent-brand-teal"
                disabled={loading}
                onChange={(event) => setRememberDevice(event.target.checked)}
                type="checkbox"
              />
              <span>Remember me for 1 day</span>
            </label>
          </div>

          <div className="pt-2">
            <button
              className="inline-flex h-[52px] w-full items-center justify-center gap-sm rounded-2xl border border-transparent bg-brand-teal px-lg text-xs font-medium uppercase tracking-tag text-on-brand shadow-none transition duration-fast ease-standard hover:bg-brand-teal-deep focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
              type="submit"
            >
              <span>{loading ? 'Authenticating' : 'Sign in securely'}</span>
              {loading ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" /> : null}
            </button>
          </div>
        </form>
        )}

        <p className="mt-8 text-center text-xs font-light text-disabled">
          Protected by CareIndeed Enterprise Security.
          <br />
          Terms of Service &bull; Privacy Policy
        </p>
        </div>
      </section>

      <div
        className={cx(
          'fixed right-lg top-lg z-30 flex items-center gap-sm rounded-lg border border-tone-teal-border bg-brand-teal-deep px-lg py-md text-sm font-light text-on-brand shadow-hover transition duration-base ease-standard',
          toastVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none',
        )}
        role="status"
      >
        <CheckCircle2 aria-hidden="true" className="h-icon-sm w-icon-sm text-on-brand" />
        Authentication successful. Redirecting&hellip;
      </div>
    </main>
  );
}
