import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : 'Route Error';

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-lg text-ink">
      <section className="grid max-w-modal-md gap-md rounded-lg border border-tone-red-border bg-tone-red-bg p-lg text-tone-red-text shadow-rest">
        <h1 className="text-display font-medium">{title}</h1>
        <p className="text-body font-light">
          The V6 route skeleton caught an error. The shell remains isolated from legacy UI.
        </p>
      </section>
    </main>
  );
}
