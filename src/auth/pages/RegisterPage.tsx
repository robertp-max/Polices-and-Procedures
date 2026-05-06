import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthApi } from '../api';
import { AuthCard, useAuthTheme } from '../components/AuthCard';

export function RegisterPage() {
  const navigate = useNavigate();
  const t = useAuthTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [approvalMessage, setApprovalMessage] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setApprovalMessage('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const result = await AuthApi.registerRequest(normalizedEmail);
      if (result.requiresApproval) {
        setApprovalMessage('Registration request received. Administrator approval is required.');
      } else if (result.autoActivated) {
        navigate('/login', { replace: true, state: { notice: result.message } });
      } else {
        const search = new URLSearchParams({ email: normalizedEmail });
        const deliveryOk = result.debug?.emailDelivery?.ok !== false;
        if (!deliveryOk) {
          search.set('emailDelivery', 'failed');
          if (result.debug?.emailDelivery?.errMessage) {
            search.set('emailErr', result.debug.emailDelivery.errMessage);
          }
        }
        if (result.debug?.setupLink) {
          search.set('debugSetupLink', result.debug.setupLink);
          search.set('debug', '1');
        }
        navigate(`/check-email?${search.toString()}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Stakeholder Demo Registration"
      title="Register"
      subtitle="Enter your email to request access."
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

        {error && <p className={t.errorClass}>{error}</p>}
        {approvalMessage && <p className={`text-sm ${t.accentClass}`}>{approvalMessage}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${t.primaryBtnClass}`}
        >
          {loading ? 'Submitting...' : 'Request Access'}
        </button>
      </form>

      <p className={`mt-5 text-sm ${t.mutedTextClass}`}>
        Already have an account?{' '}
        <Link to="/login" className={t.secondaryLinkClass}>Sign in</Link>
      </p>
    </AuthCard>
  );
}
