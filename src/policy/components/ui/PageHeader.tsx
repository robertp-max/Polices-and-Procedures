import type { ReactNode } from 'react';
import { ToneBadge } from './V32DesignSystem';

export interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * PageHeader — standard page top-strip.
 * ToneBadge (teal group per ref V6) + title (Roboto Medium 500) + description (Light) + actions.
 * Matches prototype: teal ToneBadge for group, large heading, desc. Preserves live data/UX.
 */
export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={'flex items-start justify-between gap-6 pb-6 ' + (className ?? '')}>
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2">
            <ToneBadge tone="teal">{eyebrow}</ToneBadge>
          </div>
        )}
        <h1
          className="font-roboto text-[22px] md:text-2xl font-medium tracking-[-0.2px]"
          style={{
            color: 'var(--brand-primary, #00797D)',
            margin: 0,
            lineHeight: '28px',
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mt-1.5 font-roboto font-light text-sm"
            style={{ color: 'var(--v3-text-secondary)', lineHeight: '20px' }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
