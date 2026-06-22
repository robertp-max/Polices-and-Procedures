import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Circle,
  CircleDot,
  FileText,
  Info,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Upload,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { type HTMLAttributes } from 'react';
import { resolveStatus, type StatusIndicatorSemantic } from '../statusTone';
import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';

export type ToneBadgeSize = 'sm' | 'md';

export interface ToneBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: ToneBadgeSize;
  status: string | null | undefined;
}

const toneClasses: Record<Tone, string> = {
  amber: 'border-tone-amber-border bg-tone-amber-bg text-tone-amber-text',
  blue: 'border-tone-blue-border bg-tone-blue-bg text-tone-blue-text',
  green: 'border-tone-green-border bg-tone-green-bg text-tone-green-text',
  orange: 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text',
  red: 'border-tone-red-border bg-tone-red-bg text-tone-red-text',
  slate: 'border-tone-slate-border bg-tone-slate-bg text-tone-slate-text',
  teal: 'border-tone-teal-border bg-tone-teal-bg text-tone-teal-text',
  violet: 'border-tone-violet-border bg-tone-violet-bg text-tone-violet-text',
};

const sizeClasses: Record<ToneBadgeSize, string> = {
  sm: 'px-xs py-xs text-xs',
  md: 'px-sm py-xs text-tag uppercase tracking-tag',
};

const iconBySemantic: Partial<Record<StatusIndicatorSemantic, LucideIcon>> = {
  approved: ShieldCheck,
  archived: Archive,
  attention: AlertTriangle,
  blocked: XCircle,
  certified: ShieldCheck,
  complete: CheckCircle2,
  draft: FileText,
  error: XCircle,
  info: Info,
  locked: LockKeyhole,
  'missing-evidence': AlertTriangle,
  passed: CheckCircle2,
  promoted: Upload,
  returned: RotateCcw,
  review: CircleDot,
  'review-required': AlertTriangle,
  signed: ShieldCheck,
  superseded: Archive,
  uploaded: Upload,
  validated: CheckCircle2,
  warning: AlertTriangle,
};

export function ToneBadge({ className, size = 'md', status, ...props }: ToneBadgeProps) {
  const entry = resolveStatus(status);
  const Icon = entry.indicator.kind === 'icon' ? iconBySemantic[entry.indicator.semantic] ?? CircleDot : Circle;
  const label = props.children ?? entry.label;

  return (
    <span
      {...props}
      className={cx(
        'inline-flex items-center gap-xs whitespace-nowrap rounded-sm border font-medium leading-none',
        toneClasses[entry.tone],
        sizeClasses[size],
        className,
      )}
    >
      <Icon aria-hidden="true" className="h-icon-xs w-icon-xs" />
      <span>{label}</span>
    </span>
  );
}
