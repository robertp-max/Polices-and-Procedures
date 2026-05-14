import { readFileSync } from 'node:fs';
import path from 'node:path';

type Method = 'GET' | 'POST' | 'PATCH';

const expectedRoutes: Array<{ method: Method; path: string }> = [
  { method: 'GET', path: '/disclosures/current' },
  { method: 'GET', path: '/network-info' },
  { method: 'POST', path: '/consents' },
  { method: 'POST', path: '/identity/step-up' },
  { method: 'GET', path: '/identity/me' },
  { method: 'POST', path: '/instances' },
  { method: 'GET', path: '/instances/:id' },
  { method: 'GET', path: '/instances' },
  { method: 'PATCH', path: '/instances/:id/fields' },
  { method: 'POST', path: '/instances/:id/disclose' },
  { method: 'POST', path: '/instances/:id/verify' },
  { method: 'POST', path: '/instances/:id/review-ack' },
  { method: 'POST', path: '/instances/:id/signatures' },
  { method: 'POST', path: '/instances/:id/lock' },
  { method: 'POST', path: '/instances/:id/second-signature' },
  { method: 'POST', path: '/instances/:id/void' },
  { method: 'GET', path: '/instances/:id/bundle' },
  { method: 'POST', path: '/versions' },
];

function normalizeRoutePath(value: string): string {
  return value.replace(/:([A-Za-z0-9_]+)/g, ':id');
}

function main(): void {
  const routesFile = path.resolve(process.cwd(), 'server/routes/ecign.ts');
  const source = readFileSync(routesFile, 'utf8');

  const actual = new Set<string>();
  const routeRegex = /ecignRouter\.(get|post|patch)\('([^']+)'/gi;
  let match: RegExpExecArray | null;
  while ((match = routeRegex.exec(source)) !== null) {
    const method = String(match[1] ?? '').toUpperCase() as Method;
    const routePath = normalizeRoutePath(match[2] ?? '');
    actual.add(`${method} ${routePath}`);
  }

  const missing = expectedRoutes
    .map(route => `${route.method} ${normalizeRoutePath(route.path)}`)
    .filter(routeKey => !actual.has(routeKey));

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error('[ecign-route-health] Missing backend routes required by frontend eCIgn client:');
    missing.forEach(route => {
      // eslint-disable-next-line no-console
      console.error(`  - ${route}`);
    });
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log(`[ecign-route-health] OK (${expectedRoutes.length} routes verified).`);
}

main();
