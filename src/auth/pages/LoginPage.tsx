import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { AuthCard, useAuthTheme } from '../components/AuthCard';
import type { LoginChallengeResponse } from '../api';
import { isDemoAuthBypassEnabled } from '../bypass';

const AUTH_PAGE_PATHS = new Set(['/', '/login', '/register', '/check-email', '/setup-account', '/forgot-password', '/reset-password']);

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useAuthTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bypassAuth = isDemoAuthBypassEnabled();

  const rawNext = new URLSearchParams(location.search).get('next') || '/dashboard';
  const next = AUTH_PAGE_PATHS.has(rawNext) ? '/dashboard' : rawNext;
  const notice = (location.state as { notice?: string } | null)?.notice;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate(next, { replace: true });
    } catch (err) {
      const typed = err as Error & { challenge?: LoginChallengeResponse };
      if (typed.challenge?.challenge === 'NEW_PASSWORD_REQUIRED') {
        navigate('/set-new-password', {
          replace: true,
          state: { email: typed.challenge.email, session: typed.challenge.session, next },
        });
        return;
      }
      setError('Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Care Indeed Compliance"
      title="Sign In"
      subtitle="Use your approved email and password to enter the dashboard."
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        {notice && <p className={t.isLight ? 'text-sm text-[#2E7D32] bg-green-50 border border-green-200 rounded-xl px-3 py-2' : 'text-sm text-green-300 bg-green-900/20 border border-green-700/40 rounded-xl px-3 py-2'}>{notice}</p>}
        {bypassAuth && (
          <p className={t.isLight ? 'text-sm text-[#0f766e] bg-teal-50 border border-teal-200 rounded-xl px-3 py-2' : 'text-sm text-teal-200 bg-teal-950/30 border border-teal-700/40 rounded-xl px-3 py-2'}>
            Preview mode is active. Click <span className="font-semibold">Sign In</span> to enter without email or password verification.
          </p>
        )}
        <label className={t.labelClass}>
          Email
          <input
            className={t.inputClass}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required={!bypassAuth}
            readOnly={bypassAuth}
            placeholder={bypassAuth ? 'Not required in preview mode' : undefined}
          />
        </label>

        <label className={t.labelClass}>
          Password
          <input
            className={t.inputClass}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required={!bypassAuth}
            readOnly={bypassAuth}
            placeholder={bypassAuth ? 'Not required in preview mode' : undefined}
          />
        </label>

        {error && <p className={t.errorClass}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${t.primaryBtnClass}`}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <Link to="/register" className={t.secondaryLinkClass}>Register</Link>
        <Link to="/forgot-password" className={t.secondaryLinkClass}>Forgot password?</Link>
      </div>
    </AuthCard>
  );
}
