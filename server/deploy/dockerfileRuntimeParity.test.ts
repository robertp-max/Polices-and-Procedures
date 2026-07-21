/**
 * Deployment drift guard.
 *
 * The combined Cloud Run entry (server/cloudrun.ts) imports shared modules from
 * `src` at runtime — e.g. Nolan's canonical module catalog
 * (server/ia/nolan/nolanTutorResponder.ts -> ../../../src/policy/journey/data/modules.ts)
 * — and tsx resolves the "@/*" path alias from tsconfig.json. A runtime image
 * that omits `src` or `tsconfig.json` builds "successfully" yet crashes the
 * assistant routes on load. This test fails the build if ANY Dockerfile that
 * launches cloudrun.ts is missing a required runtime COPY, so the two
 * Dockerfiles (root + deploy/combined) cannot silently drift apart again.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');

const DOCKERFILES = [
  'Dockerfile',
  path.join('deploy', 'combined', 'Dockerfile'),
];

/** Runtime dependencies cloudrun.ts needs present in the final image. */
const REQUIRED_RUNTIME_COPIES = [
  '/app/node_modules',
  '/app/dist',
  '/app/server',
  '/app/src',        // shared modules imported by the server at runtime
  '/app/config',
  '/app/tsconfig.json', // "@/*" alias resolution for tsx
];

describe('Dockerfile runtime parity (deployment drift guard)', () => {
  for (const rel of DOCKERFILES) {
    it(`${rel}: launches cloudrun.ts and copies every required runtime dependency`, () => {
      const text = readFileSync(path.join(REPO_ROOT, rel), 'utf8');

      // Only enforce on images that actually start the combined server entry.
      const launchesCloudrun = /cloudrun\.ts/.test(text);
      expect(launchesCloudrun, `${rel} should launch server/cloudrun.ts`).toBe(true);

      const missing = REQUIRED_RUNTIME_COPIES.filter(
        (dep) => !text.includes(`COPY --from=build ${dep}`),
      );
      expect(missing, `${rel} is missing required runtime COPY targets`).toEqual([]);
    });
  }
});
