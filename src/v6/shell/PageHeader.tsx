import { type ReactNode } from 'react';

export interface PageHeaderProps {
  badge?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

export function PageHeader({ badge, description, title }: PageHeaderProps) {
  return (
    <header className="grid bg-canvas pb-3xl pt-2xl">
      {badge ? (
        <div className="inline-flex w-fit items-center gap-xs rounded-full border border-tone-teal-border bg-tone-teal-bg px-sm py-xs text-[10px] font-medium uppercase tracking-wider text-brand-teal">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
          {badge}
        </div>
      ) : null}
      <h1 className="mt-3 text-3xl font-medium leading-tight tracking-normal text-brand-teal-deep">{title}</h1>
      {description ? <p className="mt-1 max-w-4xl text-sm font-medium leading-relaxed text-secondary">{description}</p> : null}
    </header>
  );
}
