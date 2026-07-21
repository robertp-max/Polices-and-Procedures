import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Dedicated Firestore EMULATOR acceptance config. Included ONLY by
 * `npm run test:audit-firestore-emulator`, which starts the emulator and sets
 * AUDIT_EMULATOR_GATE=1 first. Runs only the emulator-backed suites, serially,
 * with no skips permitted (the launcher fails on skip/failure).
 */
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    environment: 'node',
    include: [
      'server/audit/store/firestoreEmulator.test.ts',
      'server/audit/store/firestoreCrossProcess.test.ts',
    ],
    globals: true,
    fileParallelism: false,
    testTimeout: 180_000,
    hookTimeout: 120_000,
  },
});
