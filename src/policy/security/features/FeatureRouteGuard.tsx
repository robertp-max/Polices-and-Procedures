import { Link } from 'react-router-dom';
import type { ReactElement } from 'react';
import type { ResourceRef } from '../identity/types';
import { useFeatureAccess } from './useFeatureAccess';
import type { FeatureId } from './types';

interface FeatureRouteGuardProps {
  featureId: FeatureId;
  resource?: ResourceRef;
  children: ReactElement;
}

/**
 * Whole-route protection. Unlike <FeatureGate> (which silently hides
 * children), this renders a clean "Not available for your role"
 * screen so direct URL access never produces a blank page.
 *
 * For admin-only routes you can keep the existing <AdminRouteGuard>;
 * this is the general-purpose route guard for everything else.
 */
export function FeatureRouteGuard({ featureId, resource, children }: FeatureRouteGuardProps) {
  const { canAccessRoute } = useFeatureAccess();
  const decision = canAccessRoute(featureId, resource);
  if (decision.allow) return children;

  const featureLabel = decision.feature?.label ?? featureId;
  return (
    <div className="h-full w-full min-h-[60vh] flex items-center justify-center px-6 py-10">
      <div
        className="max-w-xl w-full rounded-xl border p-6"
        style={{
          background: 'var(--ci-info-bg, #f1f5f9)',
          borderColor: 'var(--ci-border, #cbd5e1)',
          color: 'var(--ci-text-primary, #0f172a)',
        }}
      >
        <div
          className="text-[10.5px] font-semibold uppercase tracking-[0.18em] mb-1.5"
          style={{ color: 'var(--ci-text-muted-2, #64748b)' }}
        >
          Access restricted
        </div>
        <h1 className="text-lg font-bold mb-2">
          {featureLabel} is not available for your role or rollout phase.
        </h1>
        <p className="text-sm" style={{ color: 'var(--ci-text-muted-2, #475569)' }}>
          If you believe this is a mistake, contact your administrator. Your role assignment determines which modules are visible.
        </p>
        <p className="text-xs mt-3" style={{ color: 'var(--ci-text-subtle, #94a3b8)' }}>
          Reason: <code>{decision.reasonCode}</code>
        </p>
        <div className="mt-5 flex gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium"
            style={{
              background: 'var(--ci-primary, #0f172a)',
              color: '#fff',
            }}
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
