import { Link } from 'react-router-dom';
import { AuthCard, useAuthTheme } from '../components/AuthCard';

export function SetupAccountPage() {
  const t = useAuthTheme();

  return (
    <AuthCard
      title="Email Setup Disabled"
      subtitle="Token-based email setup is temporarily blocked until this app is added to the company AWS account."
    >
      <p className={`text-sm ${t.mutedTextClass}`}>
        Use <Link to="/register" className={t.secondaryLinkClass}>direct registration</Link> for new users.
      </p>
      <p className={`mt-3 text-sm ${t.mutedTextClass}`}>
        Use <Link to="/forgot-password" className={t.secondaryLinkClass}>change password</Link> for existing users.
      </p>
      <div className="mt-6">
        <Link to="/login" className={`text-sm ${t.secondaryLinkClass}`}>Back to sign in</Link>
      </div>
    </AuthCard>
  );
}
