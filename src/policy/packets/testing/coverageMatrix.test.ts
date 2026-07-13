/**
 * WP-5.1 — §25 automated-test coverage traceability.
 *
 * Maps each PRD §25.1–25.6 requirement class to the concrete test file(s) that
 * cover it and asserts those files exist, so deleting a required suite fails the
 * build (a coverage regression guard). This is a traceability check — it does
 * not re-run the suites; the wave checkpoint executes them.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// Vitest runs with cwd = repo root (where vitest.config.ts lives).
const repoRoot = process.cwd();

const COVERAGE: Readonly<Record<string, readonly string[]>> = {
  '25.1 parsing & segmentation': ['src/policy/packets/sources/sources.test.ts', 'src/policy/packets/testing/fixture.test.ts'],
  '25.2 metrics': ['src/policy/packets/analysis/kpi/kpi.test.ts'],
  '25.3 workflow resolution': ['src/policy/packets/analysis/triggers/triggers.test.ts'],
  '25.4 forms': ['src/policy/packets/qapi/forms.test.ts', 'src/policy/packets/validation/validation.test.ts'],
  '25.5 rendering': ['src/policy/packets/render/render.test.ts', 'src/policy/packets/render/renderQa.test.ts', 'src/policy/packets/render/charts.test.ts'],
  '25.6 architecture': ['src/policy/packets/architecture/architecture.test.ts'],
  '§13 trends/comparability': ['src/policy/packets/analysis/trends/trends.test.ts'],
  '§14 prior-QAPI retrieval': ['server/packets/qapiPrior.test.ts'],
  '§24 Q1 end-to-end acceptance': ['src/policy/packets/testing/q1EndToEnd.integration.test.ts'],
  'store lifecycle / lock immutability': ['server/packets/store.test.ts', 'server/packets/lifecycle.test.ts'],
  'Drive connector conformance': ['server/packets/drive/connectorConformance.test.ts'],
  'eCIgn envelope + signing': ['server/packets/envelope/envelope.test.ts', 'server/packets/signing.test.ts'],
  'signed package + publish/lock': ['server/packets/signedPackage.test.ts', 'server/packets/publication.test.ts'],
  'registry cross-reference integrity': ['src/policy/packets/registries/crossReferenceIntegrity.test.ts', 'src/policy/packets/registries/eventPacketMap.test.ts'],
} as const;

describe('§25 coverage traceability matrix', () => {
  for (const [requirement, files] of Object.entries(COVERAGE)) {
    it(`${requirement} has covering test file(s) on disk`, () => {
      for (const rel of files) {
        expect(existsSync(path.join(repoRoot, rel)), `missing coverage suite for ${requirement}: ${rel}`).toBe(true);
      }
    });
  }

  it('covers every §25 sub-section (25.1–25.6)', () => {
    const keys = Object.keys(COVERAGE).join('|');
    for (const sub of ['25.1', '25.2', '25.3', '25.4', '25.5', '25.6']) {
      expect(keys).toContain(sub);
    }
  });
});
