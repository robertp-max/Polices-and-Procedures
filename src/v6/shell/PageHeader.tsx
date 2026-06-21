import { type ReactNode } from 'react';

export interface PageHeaderProps {
  badge?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

export function PageHeader({ badge, description, title }: PageHeaderProps) {
  return (
    <header className="grid gap-xs border-b border-hairline bg-canvas px-2xl py-lg">
      {badge ? <div className="text-xs font-light text-muted">{badge}</div> : null}
      <h1 className="text-display font-medium text-ink">{title}</h1>
      {description ? <p className="max-w-content text-body font-light text-secondary">{description}</p> : null}
    </header>
  );
}
