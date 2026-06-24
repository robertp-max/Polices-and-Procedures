import { Link } from 'react-router-dom';

export function NotFoundScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-xl text-center">
      <div className="text-6xl font-bold text-brand-teal">404</div>
      <h1 className="mt-md text-h1 font-medium text-ink">Page not found</h1>
      <p className="mt-sm max-w-md text-muted">
        The page you are looking for does not exist or has been moved. Return to the dashboard or use the navigation to find what you need.
      </p>
      <Link
        to="/dashboard"
        className="mt-lg rounded bg-brand-teal px-md py-sm text-on-brand hover:bg-brand-teal-deep"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}

export default NotFoundScreen;
