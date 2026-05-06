import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthApi } from '../api';
import { AuthCard, useAuthTheme } from '../components/AuthCard';

export function CheckEmailPage() {
  const [params] = useSearchParams();
  const t = useAuthTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const email = useMemo(() => (params.get('email') || '').trim().toLowerCase(), [params]);
  const debugSetupLink = useMemo(() => {
    const raw = (params.get('debugSetupLink') || '').trim();
    return /^https?:\/\//i.test(raw) ? raw : '';
  }, [params]);
  const isDebugMode = useMemo(() => params.get('debug') === '1' && Boolean(debugSetupLink), [params, debugSetupLink]);
  const emailDeliveryFailed = useMemo(() => params.get('emailDelivery') === 'failed', [params]);
  const emailDeliveryErr = useMemo(() => (params.get('emailErr') || '').trim(), [params]);

  const onResend = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await AuthApi.resendSetupLink(email);
      setMessage(response.message || 'If your email is eligible, we sent a new setup link.');
    } catch {
      setError('Unable to resend setup link right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={emailDeliveryFailed ? 'Setup email pending' : 'Check your email'}
      subtitle={emailDeliveryFailed
        ? 'Your registration was accepted, but setup email delivery is pending. Please contact your administrator to complete account setup.'
        : 'If your email is eligible, we sent a secure setup link.'}
    >
      {email && <p className={`text-sm font-medium ${t.accentClass}`}>{email}</p>}

      {emailDeliveryFailed && (
        <div className={`mt-4 rounded-md border p-3 text-sm ${t.isLight ? 'border-[#E5E4E3] bg-[#FFF8F2]' : 'border-amber-200 bg-amber-50'}`}>
          <p className={t.errorClass}>
            Email delivery is not yet available for this address.
          </p>
          {emailDeliveryErr && (
            <p className={`mt-1 text-xs ${t.mutedTextClass}`}>{emailDeliveryErr}</p>
          )}
        </div>
      )}

      <form onSubmit={onResend} className="mt-5">
        <button
          type="submit"
          disabled={!email || loading}
          className={t.primaryBtnClass}
        >
          {loading ? 'Resending...' : 'Resend setup link'}
        </button>
      </form>

      {message && <p className={`mt-4 text-sm ${t.accentClass}`}>{message}</p>}
      {error && <p className={`mt-4 ${t.errorClass}`}>{error}</p>}

      {isDebugMode && (
        <div className={`mt-4 rounded-md border p-3 text-sm ${t.isLight ? 'border-[#E5E4E3] bg-[#FFF8F2]' : 'border-slate-200 bg-slate-50'}`}>
          <p className={t.mutedTextClass}>
            Email delivery is currently unavailable. Use the direct setup link below.
          </p>
          <a
            href={debugSetupLink}
            className={`mt-2 inline-block break-all ${t.secondaryLinkClass}`}
          >
            Open setup link
          </a>
        </div>
      )}

      <p className={`mt-6 text-sm ${t.mutedTextClass}`}>
        <Link to="/login" className={t.secondaryLinkClass}>Back to sign in</Link>
      </p>
    </AuthCard>
  );
}
