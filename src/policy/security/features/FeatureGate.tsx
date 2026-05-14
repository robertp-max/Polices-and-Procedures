import type { ReactElement, ReactNode } from 'react';
import type { ResourceRef } from '../identity/types';
import { useFeatureAccess } from './useFeatureAccess';
import type { FeatureId } from './types';

interface FeatureGateProps {
  /** Catalog featureId to check (e.g. 'evidence.view'). */
  featureId: FeatureId;
  /** Optional resource scope to pass through to the authorize engine. */
  resource?: ResourceRef;
  /** Content shown when the feature is allowed. */
  children: ReactNode;
  /**
   * Optional content shown when the feature is denied. Defaults to
   * `null` (i.e. the surface is hidden completely).
   */
  fallback?: ReactNode;
}

/**
 * Render-time gate around a UI surface (page section, nav item,
 * inline component). Hides children unless the current auth user
 * passes the catalog rules for `featureId`.
 *
 * Use FeatureRouteGuard for whole-route protection (it shows an
 * "Access Denied" page instead of hiding silently).
 */
export function FeatureGate({ featureId, resource, children, fallback = null }: FeatureGateProps): ReactElement | null {
  const { canViewFeature } = useFeatureAccess();
  const decision = canViewFeature(featureId, resource);
  if (!decision.allow) {
    return <>{fallback}</> as ReactElement;
  }
  return <>{children}</> as ReactElement;
}
