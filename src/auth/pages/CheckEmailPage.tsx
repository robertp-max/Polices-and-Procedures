import { Link } from 'react-router-dom';
import { AuthCard, useAuthTheme } from '../components/AuthCard';

export function CheckEmailPage() {
  const t = useAuthTheme();

  return (
    <AuthCard
      title="Email Verification Disabled"
      subtitle="The email verification workflow is temporarily blocked until this app is added to the company AWS account."
    >
      <p className={`text-sm ${t.mutedTextClass}`}>
        Use direct registration at <Link to="/register" className={t.secondaryLinkClass}>/register</Link>.
      </p>
      <p className={`mt-3 text-sm ${t.mutedTextClass}`}>
        If your account already exists, use <Link to="/forgot-password" className={t.secondaryLinkClass}>change password</Link>.
      </p>

      <p className={`mt-6 text-sm ${t.mutedTextClass}`}>
        <Link to="/login" className={t.secondaryLinkClass}>Back to sign in</Link>
      </p>
    </AuthCard>
  );
}
