import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthApi } from '../api';
import { AuthCard, useAuthTheme } from '../components/AuthCard';

interface LocationState {
  email?: string;
  session?: string;
  next?: string;
}

export function SetNewPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useAuthTheme();

  const state = (location.state ?? {}) as LocationState;
  const email = state.email ?? '';
  const session = state.session ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!email || !session) {
    navigate('/login', { replace: true });
    return null;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await AuthApi.respondChallenge(email, session, password);
      // After setting new password, redirect to login to re-authenticate cleanly
      navigate('/login', {
        replace: true,
        state: { notice: 'Password updated. Please sign in with your new password.' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Care Indeed Compliance Demo"
      title="Set New Password"
      subtitle={`Welcome${email ? `, ${email}` : ''}. Please set a permanent password to continue.`}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className={t.labelClass}>
          New Password
          <input
            className={t.inputClass}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
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
            minLength={8}
          />
        </label>

        {error && <p className={t.errorClass}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${t.primaryBtnClass}`}
        >
          {loading ? 'Saving...' : 'Set Password & Continue'}
        </button>
      </form>
    </AuthCard>
  );
}
