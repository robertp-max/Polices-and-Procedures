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
      style={{ padding: 32, color: 'var(--v3-text-secondary)' }}
    >
      {icon && (
        <div style={{ color: 'var(--v3-text-tertiary)', marginBottom: 12 }}>{icon}</div>
      )}
      <div
        className="font-roboto"
        style={{ color: 'var(--v3-text-primary)', fontSize: 16, fontWeight: 600 }}
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
