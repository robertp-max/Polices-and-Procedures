/**
 * Contextual link to a Help Center article. Use from signing pages, audit
 * pages, dashboards, or anywhere a workflow needs an inline help reference.
 */
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

interface Props {
  slug: string;
  label?: string;
  variant?: 'inline' | 'pill';
}

export function HelpContextLink({ slug, label, variant = 'inline' }: Props) {
  const text = label ?? 'Help';
  if (variant === 'pill') {
    return (
      <Link
        to={`/help/${slug}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--ci-info-bg)] text-[var(--v3-text-primary)] text-[11px] font-medium border border-[var(--v3-border-subtle)] hover:bg-[var(--ci-surface-muted)] hover:text-[var(--v3-teal-light)]"
      >
        <HelpCircle size={12} />
        {text}
      </Link>
    );
  }
  return (
    <Link
      to={`/help/${slug}`}
      className="inline-flex items-center gap-1 text-[12px] text-[var(--v3-text-secondary)] hover:text-[var(--v3-teal-light)] hover:underline"
    >
      <HelpCircle size={12} />
      {text}
    </Link>
  );
}
