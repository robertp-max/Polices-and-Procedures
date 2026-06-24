import { type FormEvent, useState } from 'react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cx } from '../../utils/classNames';

export function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    window.setTimeout(() => {
      setLoading(false);
      setToastVisible(true);
      window.setTimeout(() => {
        window.location.assign('/dashboard');
      }, 400);
    }, 900);
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-tone-teal-bg p-lg text-ink"
      data-group="Auth"
      data-hash-id="login-page"
      data-route="/login"
      data-template="login"
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-surface/60" />

      <Link
        className="absolute right-lg top-lg z-20 inline-flex min-h-tap items-center gap-sm rounded-lg border border-tone-teal-border bg-tone-teal-bg px-md text-sm font-medium text-ink shadow-rest transition duration-fast ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
        to="/dashboard"
      >
        <ArrowLeft aria-hidden="true" className="h-icon-sm w-icon-sm" />
        Back to Dashboard
      </Link>

      <section className="relative z-10 w-full max-w-[440px] rounded-[32px] border border-card bg-surface shadow-hover">
        <div className="p-8">
        <div className="mb-8 flex justify-center">
          <img
            src="/ci-logo-gray.png"
            alt="Care Indeed"
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-xl font-medium tracking-normal text-brand-teal-deep">Welcome Back</h1>
          <p className="text-sm font-light text-secondary">Please enter your credentials to continue</p>
        </div>

        <form className="space-y-5" noValidate onSubmit={handleSubmit}>
          <label className="grid gap-sm">
            <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">Email Address</span>
            <span className="flex h-control items-center gap-md rounded-xl border border-card bg-surface px-md text-brand-teal shadow-rest transition duration-fast ease-standard focus-within:shadow-focus">
              <Mail aria-hidden="true" className="h-icon-sm w-icon-sm" />
              <input
                autoComplete="email"
                className="min-w-0 flex-1 bg-transparent text-body font-light text-ink placeholder:text-disabled focus:outline-none"
                disabled={loading}
                placeholder="name@careindeed.com"
                type="email"
              />
            </span>
          </label>

          <label className="grid gap-sm">
            <span className="flex items-center justify-between gap-md">
              <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">Password</span>
              <a className="text-xs font-medium text-muted transition duration-fast ease-standard hover:text-ink" href="#forgot-password">
                Forgot password?
              </a>
            </span>
            <span className="flex h-control items-center gap-md rounded-xl border border-card bg-surface px-md text-brand-teal shadow-rest transition duration-fast ease-standard focus-within:shadow-focus">
              <LockKeyhole aria-hidden="true" className="h-icon-sm w-icon-sm" />
              <input
                autoComplete="current-password"
                className="min-w-0 flex-1 bg-transparent text-body font-light text-ink placeholder:text-disabled focus:outline-none"
                disabled={loading}
                placeholder="••••••••••••"
                type={showPassword ? 'text' : 'password'}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="grid h-tap w-tap place-items-center rounded-md text-brand-teal transition duration-fast ease-standard hover:bg-tone-teal-bg focus-visible:outline-none focus-visible:shadow-focus"
                disabled={loading}
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? <EyeOff aria-hidden="true" className="h-icon-sm w-icon-sm" /> : <Eye aria-hidden="true" className="h-icon-sm w-icon-sm" />}
              </button>
            </span>
          </label>

          <div className="flex items-center justify-between gap-md text-sm text-muted">
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
              <span>{loading ? 'Authenticating' : 'Sign In Securely'}</span>
              {loading ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" /> : null}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs font-light text-disabled">
          Protected by CareIndeed Enterprise Security.
          <br />
          Terms of Service &bull; Privacy Policy
        </p>
        </div>
      </section>

      <div
        className={cx(
          'fixed right-lg top-3xl z-30 flex items-center gap-sm rounded-lg border border-tone-teal-border bg-brand-teal-deep px-lg py-md text-sm font-light text-on-brand shadow-hover transition duration-base ease-standard',
          toastVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none',
        )}
        role="status"
      >
        <CheckCircle2 aria-hidden="true" className="h-icon-sm w-icon-sm text-on-brand" />
        Authentication preview complete. Opening dashboard.
      </div>
    </main>
  );
}
