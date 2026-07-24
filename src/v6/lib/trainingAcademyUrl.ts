// Resolves the Care Indeed Training Academy (Employee Journey) app URL for
// same-tab navigation. Env-aware: production must be configured explicitly;
// dev falls back to the local journey dev server. Never silently sends a
// production user to localhost.
export function trainingAcademyUrl(): string | null {
  const configured = import.meta.env.VITE_TRAINING_ACADEMY_URL as string | undefined;
  if (configured && configured.trim()) return configured.trim();
  if (import.meta.env.DEV) return 'http://localhost:5190/';
  return null;
}
