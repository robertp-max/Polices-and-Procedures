import { Badge } from '../primitives';
import { type V6RouteDefinition } from './routeRegistry';

export interface V6RoutePlaceholderProps {
  route?: V6RouteDefinition;
}

export function V6RoutePlaceholder({ route }: V6RoutePlaceholderProps) {
  return (
    <section className="grid gap-lg rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
      <div className="flex flex-wrap items-center gap-sm">
        <Badge>{route?.template ?? 'not-found'}</Badge>
        <Badge>{route?.hashId ?? 'route-missing'}</Badge>
      </div>
      <div className="grid gap-sm">
        <h2 className="text-h2 font-medium text-ink">V6 Placeholder</h2>
        <p className="max-w-content text-body font-light text-secondary">
          {route
            ? `${route.title} is registered in the V6 router, but no representative screen is mapped for this fallback state.`
            : 'This route is not registered in the canonical V6 route table.'}
        </p>
      </div>
    </section>
  );
}
