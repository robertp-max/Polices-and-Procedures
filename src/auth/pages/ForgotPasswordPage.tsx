import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthApi } from '../api';
import { AuthCard, useAuthTheme } from '../components/AuthCard';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useAuthTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const notice = (location.state as { notice?: string } | null)?.notice;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await AuthApi.forgotPassword(email.trim().toLowerCase());
      navigate(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Care Indeed Compliance"
      title="Reset Password"
      subtitle="Enter your email and we'll send a reset code to your inbox."
    >
      {notice && <p className={`mb-3 text-sm ${t.accentClass}`}>{notice}</p>}
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className={t.labelClass}>
          Email
          <input
            className={t.inputClass}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        {error && <p className={t.errorClass}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${t.primaryBtnClass}`}
        >
          {loading ? 'Sending code...' : 'Send Reset Code'}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-center text-sm">
        <Link to="/login" className={t.secondaryLinkClass}>Back to Sign In</Link>
      </div>
    </AuthCard>
  );
}
