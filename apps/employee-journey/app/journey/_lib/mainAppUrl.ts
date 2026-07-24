/* ═══════════════════════════════════════════════════════════════
 * Main-app URL resolver — build/request-time AND client-time safe.
 *
 * The Employee Journey app is a separate Next.js/Vinext app and cannot
 * import the main app's router. Real module players, the canonical
 * policy source, and Governance all live in the main app (a Vite/React
 * SPA) at routes recorded verbatim in app/journey/_generated/*
 * (e.g. modulePlayerMap.generated.ts launchRef = "/journey/module/GAO-001").
 *
 * This resolver turns a main-app-relative path into an absolute,
 * same-tab, cross-origin URL using NEXT_PUBLIC_MAIN_APP_URL.
 *
 * - Development: falls back to http://localhost:5190 when the env var
 *   is not set, matching the main app's known local dev port.
 * - Production: NEVER falls back to localhost. If the env var is
 *   missing in production, resolution fails closed (returns null) so
 *   callers can render an honest "not configured" state instead of
 *   silently sending a real employee to a dead localhost link.
 *
 * Never use target="_blank" / window.open / rel="noopener" for these
 * links — same-tab navigation only, per the journey app's hard
 * guardrails.
 * ═══════════════════════════════════════════════════════════════ */

const DEV_FALLBACK = "http://localhost:5190";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

/**
 * Returns the configured main-app origin (no trailing slash), or null
 * when it cannot be resolved safely (production with no env var set).
 */
export function getMainAppOrigin(): string | null {
  const configured = process.env.NEXT_PUBLIC_MAIN_APP_URL;
  if (configured && configured.trim().length > 0) {
    return trimTrailingSlash(configured.trim());
  }
  if (process.env.NODE_ENV !== "production") {
    return DEV_FALLBACK;
  }
  return null;
}

export type MainAppHrefResult =
  | { ok: true; href: string }
  | { ok: false; reason: string };

/**
 * Resolves a main-app-relative path (e.g. "/journey/module/GAO-001" or
 * "/governance") into an absolute same-tab URL. Returns ok:false with a
 * human-readable reason when the main app origin is not configured —
 * callers must render that reason, never guess a URL.
 */
export function resolveMainAppHref(path: string): MainAppHrefResult {
  const origin = getMainAppOrigin();
  if (!origin) {
    return {
      ok: false,
      reason:
        "NEXT_PUBLIC_MAIN_APP_URL is not configured for this environment. This link cannot be resolved safely.",
    };
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return { ok: true, href: `${origin}${normalizedPath}` };
}

/** Known main-app routes referenced from the journey app. */
export const MAIN_APP_ROUTES = {
  governance: "/governance",
} as const;
