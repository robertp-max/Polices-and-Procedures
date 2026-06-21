import { LockKeyhole } from 'lucide-react';
import { Badge } from '../primitives';
import { type V6RouteDefinition } from './routeRegistry';

export interface LoginPlaceholderProps {
  route: Omit<V6RouteDefinition, 'phase'>;
}

export function LoginPlaceholder({ route }: LoginPlaceholderProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-lg text-ink">
      <section className="grid w-full max-w-modal-sm gap-lg rounded-xl border border-card bg-surface p-2xl shadow-rest">
        <div className="flex items-center gap-sm text-brand-teal">
          <LockKeyhole aria-hidden="true" className="h-icon-md w-icon-md" />
          <Badge>{route.hashId}</Badge>
        </div>
        <div className="grid gap-sm">
          <h1 className="text-display font-medium text-ink">{route.title}</h1>
          <p className="text-body font-light text-secondary">
            Auth remains outside the V6 shell and will be implemented in the approved auth phase.
          </p>
        </div>
      </section>
    </main>
  );
}
