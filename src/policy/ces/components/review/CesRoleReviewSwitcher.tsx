/* ═══════════════════════════════════════════════════════════════
   CesRoleReviewSwitcher — Robert-only CES role simulation control.
   ---------------------------------------------------------------
   AUTHORIZED USER: robertp@careindeed.com ONLY.
   All other users: this component renders null with zero side effects.

   Placement: Profile dropdown, below "My Tasks".
   (The debug overlay RobertCesReviewLayer.tsx was removed as unused dead code.)
   To fully remove review mode: delete this file + cesReviewMode.ts
   ═══════════════════════════════════════════════════════════════ */

import { useCesReviewMode, isRobertUser } from '@/policy/ces/cesReviewMode';
import type { CesRole } from '@/policy/ces/cesRoles';

interface Props {
  /** Current user email — used to gate visibility. */
  userEmail?: string | null;
  userId?:    string | null;
  /** Visual style variant matching the host dropdown. */
  isLight?:   boolean;
}

const ROLE_LABELS: CesRole[] = [
  'Governing Body',
  'Administrator',
  'Admin Designee',
  'DON',
  'DON Assistant',
  'Accounting',
  'Systems',
];

export function CesRoleReviewSwitcher({ userEmail, userId, isLight: _isLight = true }: Props) {
  const allowed = isRobertUser(userEmail, userId);
  const { isEnabled, reviewRole, setReviewRole } = useCesReviewMode(userEmail, userId);

  if (!allowed || !isEnabled) return null;

  const textColor     = 'var(--ces-ink)';
  const mutedColor    = 'var(--ces-muted)';
  const borderColor   = 'var(--ces-border)';
  const selectBg      = 'var(--ces-canvas)';
  const selectBorder  = 'var(--ces-border)';
  const badgeBg       = 'var(--ces-navy-deep)';

  return (
    <div
      style={{
        padding: '10px 14px',
        borderTop: `1px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: mutedColor,
          }}
        >
          CES Review Role
        </span>
        {reviewRole && (
          <button
            type="button"
            onClick={() => setReviewRole(null)}
            title="Clear review role"
            style={{
              fontSize: 9,
              color: 'var(--ces-orange)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontWeight: 600,
              letterSpacing: '0.1em',
            }}
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Dropdown */}
      <select
        aria-label="CES Review Role"
        value={reviewRole ?? ''}
        onChange={e => setReviewRole((e.target.value as CesRole) || null)}
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: textColor,
          background: selectBg,
          border: `1px solid ${selectBorder}`,
          borderRadius: 6,
          padding: '4px 8px',
          width: '100%',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="">— None (real role) —</option>
        {ROLE_LABELS.map(role => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>

      {/* Active badge */}
      {reviewRole && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 8px',
            borderRadius: 6,
            background: badgeBg,
          }}
        >
          {/* Pulsing dot */}
          <span
            style={{
              display: 'inline-flex',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--ces-orange)',
              flexShrink: 0,
              animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--ces-white)',
              letterSpacing: '0.05em',
            }}
          >
            Reviewing as: {reviewRole}
          </span>
        </div>
      )}

      {/* Guardrail notice */}
      <p style={{ fontSize: 9, color: mutedColor, margin: 0, lineHeight: 1.4 }}>
        ROBERT_REVIEW_MODE — simulation only. Real permissions unchanged.
      </p>
    </div>
  );
}
