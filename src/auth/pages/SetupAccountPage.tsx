import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthApi } from '../api';
import { AuthCard, useAuthTheme } from '../components/AuthCard';

export function SetupAccountPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const t = useAuthTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = useMemo(() => params.get('token') || '', [params]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid setup link.');
      return;
    }

    setLoading(true);
    try {
      await AuthApi.setupAccount(token, firstName.trim(), lastName.trim(), password);
      navigate('/login', { replace: true });
    } catch {
      setError('This setup link is invalid, expired, or already used.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Set up your account"
      subtitle="Complete your profile and create a password."
    >
      <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <label className={t.labelClass}>
          First name
          <input
            className={t.inputClass}
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
          />
        </label>

        <label className={t.labelClass}>
          Last name
          <input
            className={t.inputClass}
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
          />
        </label>

        <label className={`${t.labelClass} md:col-span-2`}>
          Password
          <input
            className={t.inputClass}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <label className={`${t.labelClass} md:col-span-2`}>
          Confirm password
          <input
            className={t.inputClass}
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        {error && <p className={`md:col-span-2 ${t.errorClass}`}>{error}</p>}

        <div className="md:col-span-2 flex items-center justify-between pt-2">
          <Link to="/login" className={`text-sm ${t.mutedTextClass}`}>Back to sign in</Link>
          <button
            type="submit"
            disabled={loading}
            className={t.primaryBtnClass}
          >
            {loading ? 'Setting up...' : 'Complete setup'}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
