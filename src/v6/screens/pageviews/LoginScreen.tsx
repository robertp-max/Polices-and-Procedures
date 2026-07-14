import { type FormEvent, type MouseEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LoaderCircle, Lock, Mail, ShieldAlert } from 'lucide-react';
import { cx } from '../../utils/classNames';
import { BRAD_DEFAULT_ROUTE, safeReturnTo } from '../../utils/safeRedirect';
import { useAuth } from '@/auth/AuthProvider';

function BrandLogo({ inChallenge }: { inChallenge: boolean }) {
  return (
    <div className="mb-8 flex flex-col items-center justify-center text-center">
      <img
        src="/assets/navigation/logo-careindeed-orange.png"
        alt="Care Indeed Logo"
        className="mb-4 h-16 w-auto"
      />
      <h1 className="text-2xl font-semibold tracking-tight text-[#007A66]">
        {inChallenge ? 'Set Your New Password' : 'Welcome to Care Indeed'}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {inChallenge
          ? 'Your account requires a new password before continuing.'
          : 'Please enter your credentials to continue'}
      </p>
    </div>
  );
}

/**
 * Phase COG-1: real Cognito-backed sign-in through useAuth(). Handles the
 * NEW_PASSWORD_REQUIRED first-login challenge with a typed internal model.
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
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const displayError = localError ?? error;
  const inChallenge = challenge?.type === 'NEW_PASSWORD_REQUIRED';

  function redirectAfterAuth() {
    setToastVisible(true);
    const dest = safeReturnTo(searchParams.get('returnTo') ?? searchParams.get('from'));
    window.setTimeout(() => navigate(dest, { replace: true }), 400);
  }

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const moveX = (event.clientX - window.innerWidth / 2) / 30;
    const moveY = (event.clientY - window.innerHeight / 2) / 30;
    setMouseOffset({ x: -moveX, y: -moveY });
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

  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-teal-900';
  const fieldShell = 'relative flex items-center rounded-xl border border-white/40 bg-white/60 shadow-inner transition-all focus-within:border-transparent focus-within:ring-2 focus-within:ring-teal-500/50';
  const fieldInput = 'block w-full rounded-xl border-0 bg-transparent py-3 pl-11 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-70';

  return (
    <main
      className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 font-sans text-slate-800"
      data-group="Auth"
      data-hash-id="login-page"
      data-route="/login"
      data-template="login"
      onMouseMove={handleMouseMove}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(0, 122, 102, 0.1005) 0.335px, transparent 0.335px)',
          backgroundSize: '5px 5px',
        }}
      />

      <Link
        className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
        to={BRAD_DEFAULT_ROUTE}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Back to Dashboard</span>
      </Link>

      <img
        src="/watermark-angel.png"
        alt=""
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[998px] max-w-none object-contain opacity-95 transition-transform duration-100 ease-out"
        style={{
          transform: `translate(calc(-30% + ${mouseOffset.x}px), calc(-65% + ${mouseOffset.y}px))`,
        }}
      />

      <div className="relative z-10 flex flex-1 items-center justify-center p-4">
        <section className="login-glass-card w-full max-w-[440px] rounded-[2.5rem] border-[1.5px] border-white/80 bg-white/[0.717] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.20)] sm:p-10">
          <BrandLogo inChallenge={inChallenge} />

          {displayError ? (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50/80 px-4 py-3 text-sm text-slate-800" role="alert">
              <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#F06A33]" />
              <span>{displayError}</span>
            </div>
          ) : null}

          {inChallenge ? (
            <form className="space-y-6" noValidate onSubmit={handleChallengeSubmit}>
              <p className="text-sm text-slate-600">
                Signing in as <span className="font-semibold text-slate-800">{challenge.email}</span>
              </p>
              <label className="grid gap-1.5">
                <span className={labelClass}>New Password</span>
                <span className={fieldShell}>
                  <Lock aria-hidden="true" className="pointer-events-none absolute left-4 h-5 w-5 text-teal-600/50" />
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
              <label className="grid gap-1.5">
                <span className={labelClass}>Confirm Password</span>
                <span className={fieldShell}>
                  <Lock aria-hidden="true" className="pointer-events-none absolute left-4 h-5 w-5 text-teal-600/50" />
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
              <button
                className="flex w-full justify-center rounded-xl border border-transparent bg-[#F06A33] px-4 py-3.5 text-sm font-bold uppercase text-white shadow-md transition-colors hover:bg-[#E05A23] focus:outline-none focus:ring-2 focus:ring-[#F06A33] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                type="submit"
              >
                <span>{loading ? 'Updating password' : 'Set password and sign in'}</span>
                {loading ? <LoaderCircle aria-hidden="true" className="ml-2 h-5 w-5 animate-spin" /> : null}
              </button>
            </form>
          ) : (
            <form className="space-y-6" noValidate onSubmit={handleSubmit}>
              <label className="grid gap-1.5">
                <span className={labelClass}>Email Address</span>
                <span className={fieldShell}>
                  <Mail aria-hidden="true" className="pointer-events-none absolute left-4 h-5 w-5 text-teal-600/50" />
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

              <label className="grid gap-1.5">
                <span className="flex items-center justify-between">
                  <span className={labelClass}>Password</span>
                  <Link className="text-xs font-medium text-slate-500 transition-colors hover:text-teal-700" to="/forgot-password">
                    Forgot password?
                  </Link>
                </span>
                <span className={fieldShell}>
                  <Lock aria-hidden="true" className="pointer-events-none absolute left-4 h-5 w-5 text-teal-600/50" />
                  <input
                    autoComplete="current-password"
                    className={cx(fieldInput, 'pr-12')}
                    disabled={loading}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                  />
                  <button
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-teal-600/50 transition-colors hover:text-teal-700 focus:outline-none"
                    disabled={loading}
                    onClick={() => setShowPassword((value) => !value)}
                    type="button"
                  >
                    {showPassword ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
                  </button>
                </span>
              </label>

              <label className="flex cursor-pointer items-center text-sm text-slate-600">
                <input
                  checked={rememberDevice}
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-[#F06A33] focus:ring-teal-500"
                  disabled={loading}
                  onChange={(event) => setRememberDevice(event.target.checked)}
                  type="checkbox"
                />
                <span className="ml-2">Remember me for 1 day</span>
              </label>

              <button
                className="flex w-full justify-center rounded-xl border border-transparent bg-[#F06A33] px-4 py-3.5 text-sm font-bold uppercase text-white shadow-md transition-colors hover:bg-[#E05A23] focus:outline-none focus:ring-2 focus:ring-[#F06A33] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                type="submit"
              >
                <span>{loading ? 'Authenticating' : 'Sign in securely'}</span>
                {loading ? <LoaderCircle aria-hidden="true" className="ml-2 h-5 w-5 animate-spin" /> : null}
              </button>
            </form>
          )}

          <div className="pt-8 text-center text-xs font-medium text-slate-500">
            <p>Protected by CareIndeed Enterprise Security.</p>
            <div className="mt-2 space-x-2">
              <a href="#" className="transition-colors hover:text-teal-700">Terms of Service</a>
              <span>&bull;</span>
              <a href="#" className="transition-colors hover:text-teal-700">Privacy Policy</a>
            </div>
          </div>
        </section>
      </div>

      <div
        className={cx(
          'fixed right-4 top-4 z-30 flex items-center gap-2 rounded-xl border border-teal-800/10 bg-teal-900 px-5 py-3 text-sm font-medium text-white shadow-xl transition duration-300',
          toastVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none',
        )}
        role="status"
      >
        <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-white" />
        Authentication successful. Redirecting&hellip;
      </div>
    </main>
  );
}
