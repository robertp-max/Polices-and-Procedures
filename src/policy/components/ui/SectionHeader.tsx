import type { ReactNode } from 'react';

export interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeader({ eyebrow, title, actions, className }: SectionHeaderProps) {
  return (
    <div className={'flex items-end justify-between gap-4 mb-3 ' + (className ?? '')}>
      <div>
        {eyebrow && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--ci-text-subtle)',
              marginBottom: 4,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h3
          className="font-montserrat"
          style={{ fontSize: 16, lineHeight: '24px', fontWeight: 600, color: 'var(--ci-text-primary)', margin: 0 }}
        >
          {title}
        </h3>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
