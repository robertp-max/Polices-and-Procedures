import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthApi } from '../api';
import { AuthCard, useAuthTheme } from '../components/AuthCard';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = useAuthTheme();

  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await AuthApi.resetPassword(email.trim().toLowerCase(), code.trim(), newPassword);
      navigate('/login', { state: { notice: 'Password reset successfully. Please sign in with your new password.' } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Care Indeed Compliance Demo"
      title="Set New Password"
      subtitle="Enter the code we sent to your email, then choose a new password."
    >
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

        <label className={t.labelClass}>
          Reset Code
          <input
            className={t.inputClass}
            type="text"
            inputMode="numeric"
            value={code}
            onChange={e => setCode(e.target.value)}
            autoComplete="one-time-code"
            placeholder="6-digit code"
            required
          />
        </label>

        <label className={t.labelClass}>
          New Password
          <input
            className={t.inputClass}
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <label className={t.labelClass}>
          Confirm Password
          <input
            className={t.inputClass}
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        {error && <p className={t.errorClass}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${t.primaryBtnClass}`}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className={t.secondaryLinkClass}>Resend code</Link>
        <Link to="/login" className={t.secondaryLinkClass}>Back to Sign In</Link>
      </div>
    </AuthCard>
  );
}
