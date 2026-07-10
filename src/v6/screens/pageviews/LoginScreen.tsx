import { type FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { cx } from '../../utils/classNames';
import { safeReturnTo } from '../../utils/safeRedirect';

export function LoginScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    window.setTimeout(() => {
      setLoading(false);
      setToastVisible(true);
      // Honor a safe intended deep link (?returnTo=/legacy ?from=); otherwise
      // default authenticated landing is Brad. SPA navigation preserves routing.
      const dest = safeReturnTo(searchParams.get('returnTo') ?? searchParams.get('from'));
      window.setTimeout(() => {
        navigate(dest, { replace: true });
      }, 400);
    }, 900);
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFAF7] p-6 font-roboto text-[#52404B] selection:bg-[#E5FEFF]"
      data-group="Auth"
      data-hash-id="login-page"
      data-route="/login"
      data-template="login"
    >
      <section className="relative z-10 flex w-full max-w-[420px] flex-col items-center rounded-[32px] border border-[#E5E4E3] bg-white p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] md:p-12">
        <div className="mb-10 flex justify-center">
          <img
            src="/ci-logo-gray.png"
            alt="Care Indeed"
            className="w-32 object-contain"
          />
        </div>

        <h1 className="mb-8 font-montserrat text-2xl font-semibold tracking-tight text-[#007970]">Welcome Back</h1>

        <form className="w-full space-y-5" noValidate onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 ml-1 block font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#747470]">
              Email Address
            </span>
            <span className="relative block">
              <input
                autoComplete="email"
                className="w-full rounded-[12px] border border-[#E5E4E3] bg-white px-4 py-3 text-[14px] text-[#52404B] outline-none transition-colors placeholder:text-[#A0A0A0] focus:border-[#007970] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                placeholder="name@careindeed.com"
                type="email"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 ml-1 block font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#747470]">
              Password
            </span>
            <span className="relative block">
              <input
                autoComplete="current-password"
                className="w-full rounded-[12px] border border-[#E5E4E3] bg-white px-4 py-3 pr-12 text-[14px] text-[#52404B] outline-none transition-colors placeholder:text-[#A0A0A0] focus:border-[#007970] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-[10px] text-[#007970] transition-colors hover:bg-[#F7FEFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007970]/30"
                disabled={loading}
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
              </button>
            </span>
          </label>

          <div className="pt-5">
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#F06923] px-8 py-3.5 font-montserrat text-[12px] font-bold uppercase tracking-widest text-white shadow-[0_4px_12px_rgba(240,105,35,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#D1571A] hover:shadow-[0_6px_16px_rgba(240,105,35,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F06923]/35 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70"
              disabled={loading}
              type="submit"
            >
              <span>{loading ? 'Authenticating' : 'Sign In Securely'}</span>
              {loading ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center font-roboto text-[11px] leading-relaxed text-[#747470] opacity-70">
          Protected by Care Indeed Enterprise Security
          <br />
          Terms of Service &bull; Privacy Policy
        </p>
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
