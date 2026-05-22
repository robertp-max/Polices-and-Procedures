import type { PropsWithChildren, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { useUserAssignmentsStore } from './userAssignmentsStore';
import { usePageAccessStore } from './pageAccessStore';
import { canViewPage } from './pageAccess';
import { PAGE_BY_ID } from './pageRegistry';
import type { PageId } from './pageAccessTypes';

interface PageAccessRouteGuardProps {
  pageId: PageId;
}

/**
 * Wraps a route in the Page View Access guard.
 *
 * Direct URL access is blocked the same way nav is hidden: if the
 * current user has no `read` (or stronger) access to the given page,
 * a clean "Access restricted" screen is rendered instead of the
 * underlying component.
 *
 * Subscribes to both the user-assignments store and the page-access
 * store so live admin edits (e.g. toggling a component off, setting
 * a page to `none`) take effect without a page reload.
 */
export function PageAccessRouteGuard({
  pageId,
  children,
}: PropsWithChildren<PageAccessRouteGuardProps & { children: ReactElement }>) {
  const { user } = useAuth();
  // Re-render when admin mutates store.
  useUserAssignmentsStore(s => s.assignments);
  useUserAssignmentsStore(s => s.users);
  usePageAccessStore(s => s.access);

  if (canViewPage(user, pageId)) {
    return children;
  }

  const page = PAGE_BY_ID[pageId];
  const label = page?.label ?? pageId;

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
          {label} is not available for your account.
        </h1>
        <p className="text-sm" style={{ color: 'var(--ci-text-muted-2, #475569)' }}>
          Your page-view access has not been granted for this page. Contact an
          administrator (Robert or Marites) to request access.
        </p>
        <p className="text-xs mt-3" style={{ color: 'var(--ci-text-subtle, #94a3b8)' }}>
          Page: <code>{pageId}</code>
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

export default PageAccessRouteGuard;
