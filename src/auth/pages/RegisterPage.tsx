import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthApi, AuthApiError, type VerifyRegistrationResponse } from '../api';
import { AuthCard, useAuthTheme } from '../components/AuthCard';

type AvailabilityState = 'checking' | 'available' | 'unavailable';
type Phase = 'verify' | 'setup';

const GENERIC_VERIFY_FAILURE = 'Registration verification failed. Please contact your administrator.';
const GENERIC_SETUP_FAILURE  = 'Registration verification failed. Please contact your administrator.';
const UNAVAILABLE_MESSAGE    = 'Registration is temporarily unavailable. Please contact your administrator.';
const ALREADY_REGISTERED_NOTICE = 'Account already registered. Please change your password to continue.';

export function RegisterPage() {
  const navigate = useNavigate();
  const t = useAuthTheme();

  const [availability, setAvailability] = useState<AvailabilityState>('checking');
  const [phase, setPhase]               = useState<Phase>('verify');
  const [email, setEmail]               = useState('');
  const [sfOrgId, setSfOrgId]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const [approvedData, setApprovedData] = useState<VerifyRegistrationResponse['approvedUser'] | null>(null);
  const [firstName, setFirstName]       = useState('');
  const [lastName, setLastName]         = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check allowlist availability on mount. Show unavailable state if not ready.
  // Internal error details are never surfaced — only the public boolean.
  useEffect(() => {
    let cancelled = false;
    AuthApi.getAllowlistStatus()
      .then(res => { if (!cancelled) setAvailability(res.available ? 'available' : 'unavailable'); })
      .catch(() => { if (!cancelled) setAvailability('unavailable'); });
    return () => { cancelled = true; };
  }, []);

  const onVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await AuthApi.verifyRegistration(normalizedEmail, sfOrgId.trim());

      setApprovedData(result.approvedUser);
      const nameParts = result.approvedUser.fullName.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setPhase('setup');
    } catch (err) {
      if (err instanceof AuthApiError && err.code === 'duplicate') {
        navigate(`/forgot-password?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
          replace: true,
          state: { notice: ALREADY_REGISTERED_NOTICE },
        });
        return;
      }
      // Always show the generic message — never echo internal error details.
      setError(GENERIC_VERIFY_FAILURE);
    } finally {
      setLoading(false);
    }
  };

  const onSetup = async (e: FormEvent) => {
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

    setLoading(true);
    try {
      await AuthApi.setupAccountDirect(
        email.trim().toLowerCase(),
        sfOrgId.trim(),
        firstName.trim(),
        lastName.trim(),
        password,
      );
      navigate('/login', { replace: true, state: { notice: 'Account created successfully. Please sign in.' } });
    } catch (err) {
      if (err instanceof AuthApiError && err.code === 'duplicate') {
        navigate(`/forgot-password?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
          replace: true,
          state: { notice: ALREADY_REGISTERED_NOTICE },
        });
        return;
      }
      setError(GENERIC_SETUP_FAILURE);
    } finally {
      setLoading(false);
    }
  };

  // ── Availability check in progress ──────────────────────────────────────────
  if (availability === 'checking') {
    return (
      <AuthCard title="Register">
        <p className={`text-sm ${t.mutedTextClass}`}>Checking registration availability…</p>
      </AuthCard>
    );
  }

  // ── Allowlist not loaded — show generic unavailable state ────────────────────
  if (availability === 'unavailable') {
    return (
      <AuthCard title="Registration Unavailable">
        <p className={`text-sm ${t.mutedTextClass}`}>{UNAVAILABLE_MESSAGE}</p>
        <p className={`mt-5 text-sm ${t.mutedTextClass}`}>
          Already have an account?{' '}
          <Link to="/login" className={t.secondaryLinkClass}>Sign in</Link>
        </p>
      </AuthCard>
    );
  }

  // ── Phase 2: account setup ───────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <AuthCard
        title="Set up your account"
        subtitle="Complete your profile and create a password."
      >
        {approvedData && (
          <div className={`mb-4 rounded-lg border p-3 text-sm ${t.isLight ? 'border-[#E5E4E3] bg-[#FAFAF9]' : 'border-slate-200 bg-slate-50'}`}>
            <p className={t.mutedTextClass}>
              Verified: <span className="font-medium">{approvedData.fullName}</span> — {approvedData.department}
            </p>
          </div>
        )}

        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSetup}>
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
            <button
              type="button"
              onClick={() => { setPhase('verify'); setError(''); }}
              className={`text-sm ${t.mutedTextClass}`}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className={t.primaryBtnClass}
            >
              {loading ? 'Setting up…' : 'Complete setup'}
            </button>
          </div>
        </form>
      </AuthCard>
    );
  }

  // ── Phase 1: identity verification ──────────────────────────────────────────
  return (
    <AuthCard
      eyebrow="Stakeholder Registration"
      title="Register"
      subtitle="Verify your identity to create an account."
    >
      <form className="space-y-4" onSubmit={onVerify}>
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
          Salesforce Org ID
          <input
            className={t.inputClass}
            type="text"
            value={sfOrgId}
            onChange={e => setSfOrgId(e.target.value)}
            placeholder="e.g. 00D8A0000001XYZ"
            required
          />
          <span className={`mt-1 block text-xs ${t.mutedTextClass}`}>
            If you are a Care Indeed or TBBB employee, please enter your Salesforce Org ID. Reach out to Marites if you need assistance.
          </span>
        </label>

        {error && <p className={t.errorClass}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${t.primaryBtnClass}`}
        >
          {loading ? 'Verifying…' : 'Verify & Continue'}
        </button>
      </form>

      <p className={`mt-5 text-sm ${t.mutedTextClass}`}>
        Already have an account?{' '}
        <Link to="/login" className={t.secondaryLinkClass}>Sign in</Link>
      </p>
    </AuthCard>
  );
}
