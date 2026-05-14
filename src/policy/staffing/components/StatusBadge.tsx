import type { CiBadgeTone } from '@/policy/components/ui/CiStatusBadge';
import { CiStatusBadge } from '@/policy/components/ui/CiStatusBadge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

function toneForStatus(status: string): CiBadgeTone {
  switch (status) {
    case 'active':
    case 'assigned':
    case 'eligible':
      return 'success';
    case 'pending':
    case 'pending_approval':
      return 'warning';
    case 'inactive':
    case 'on_hold':
      return 'neutral';
    case 'on_leave':
      return 'info';
    case 'suspended':
    case 'restricted':
    case 'blocked':
    case 'preferred':
      return 'warning';
    case 'terminated':
    case 'discharged':
      return 'danger';
    default:
      return 'neutral';
  }
}

function labelForStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <CiStatusBadge tone={toneForStatus(status)} className={className}>
      {labelForStatus(status)}
    </CiStatusBadge>
  );
}
