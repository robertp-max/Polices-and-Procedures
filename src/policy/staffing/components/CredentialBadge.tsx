import type { CredentialStatus } from '../types';

interface CredentialBadgeProps {
  status: CredentialStatus;
  className?: string;
}

const STATUS_CONFIG: Record<CredentialStatus, { label: string; style: React.CSSProperties }> = {
  active: {
    label: 'Active',
    style: { background: 'rgba(22,163,74,0.12)', color: '#15803d', border: 'none' },
  },
  expiring_soon: {
    label: 'Expiring Soon',
    style: { background: 'rgba(234,179,8,0.12)', color: '#a16207', border: 'none' },
  },
  expired: {
    label: 'Expired',
    style: { background: 'rgba(220,38,38,0.12)', color: '#b91c1c', border: 'none' },
  },
  pending_verification: {
    label: 'Pending Verification',
    style: { background: 'var(--ci-surface-muted)', color: 'var(--ci-text-muted-2)', border: 'none' },
  },
  revoked: {
    label: 'Revoked',
    style: { background: 'rgba(127,29,29,0.14)', color: '#7f1d1d', border: '1px solid rgba(127,29,29,0.3)' },
  },
};

export function CredentialBadge({ status, className }: CredentialBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${className ?? ''}`}
      style={config.style}
    >
      {config.label}
    </span>
  );
}
