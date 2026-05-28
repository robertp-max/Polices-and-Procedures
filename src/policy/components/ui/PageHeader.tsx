import type { ReactNode } from 'react';

export interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * PageHeader — standard page top-strip.
 * Eyebrow (mono) + title (Montserrat) + optional description + right actions.
 * Token-driven; no hardcoded colours.
 */
export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={'flex items-start justify-between gap-6 pb-6 ' + (className ?? '')}>
      <div className="min-w-0">
        {eyebrow && (
          <div
            className="mb-2"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--v3-text-tertiary)',
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          className="font-montserrat"
          style={{
            fontSize: 24,
            lineHeight: '32px',
            fontWeight: 700,
            color: 'var(--v3-text-primary)',
            margin: 0,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mt-2"
            style={{ color: 'var(--v3-text-secondary)', fontSize: 14, lineHeight: '22px' }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
