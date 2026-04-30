import type { PropsWithChildren, ReactElement } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { evaluateAdminAccess } from './access';
import { AccessDeniedPage } from './AccessDeniedPage';

export function AdminRouteGuard({ children }: PropsWithChildren<{ children: ReactElement }>) {
  const { user } = useAuth();
  const access = evaluateAdminAccess(user);

  if (!access.allowed) {
    return <AccessDeniedPage reason={access.reason} />;
  }

  return children;
}

export default AdminRouteGuard;
