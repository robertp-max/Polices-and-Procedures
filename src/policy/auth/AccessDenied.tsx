import { Link } from 'react-router-dom';
import React from 'react';

/**
 * MVP-P1-PERMS-001 — Trainer-flavored access-denied UI.
 *
 * Distinct from src/policy/security/identity/AccessDeniedPage.tsx (which
 * is admin-section specific and minimal). This one:
 *   - Names the user's effective role
 *   - Names where they can go instead (Journey home)
 *   - Provides a navigation link
 */

export interface AccessDeniedProps {
  /** The user's effective role label (or 'unknown'). */
  role?: string;
  /**
   * Optional path to suggest as a fallback. Defaults to '/journey'.
   */
  suggestedPath?: string;
  /** Optional reason text override. */
  reason?: string;
}

export function AccessDenied({
  role = 'unknown',
  suggestedPath = '/journey',
  reason = 'This area is reserved for clinical and administrative staff.',
}: AccessDeniedProps): React.ReactElement {
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
        <h1 className="text-lg font-bold mb-2">Access restricted</h1>
        <p className="text-sm mb-1" style={{ color: 'var(--ci-text-muted-2, #475569)' }}>
          Your role: <span className="font-medium">{role}</span>
        </p>
        <p className="text-sm" style={{ color: 'var(--ci-text-muted-2, #475569)' }}>
          {reason}
        </p>
        <div className="mt-5 flex gap-3">
          <Link
            to={suggestedPath}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium"
            style={{
              background: 'var(--ci-primary, #0f172a)',
              color: '#fff',
            }}
          >
            Go to your Journey
          </Link>
        </div>
      </div>
    </div>
  );
}
