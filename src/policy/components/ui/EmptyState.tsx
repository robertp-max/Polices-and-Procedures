import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={
        'flex flex-col items-center justify-center text-center ' + (className ?? '')
      }
      style={{ padding: 32, color: 'var(--ci-text-muted-2)' }}
    >
      {icon && (
        <div style={{ color: 'var(--ci-text-subtle)', marginBottom: 12 }}>{icon}</div>
      )}
      <div
        className="font-montserrat"
        style={{ color: 'var(--ci-text-primary)', fontSize: 16, fontWeight: 600 }}
      >
        {title}
      </div>
      {description && (
        <div className="mt-1" style={{ fontSize: 13, maxWidth: 360 }}>
          {description}
        </div>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
