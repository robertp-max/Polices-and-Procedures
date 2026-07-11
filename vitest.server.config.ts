import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Server-side vitest config (node environment).
 * The app vitest.config.ts only includes src/** — do not modify it.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['server/**/*.test.ts'],
    globals: true,
    // Avoid cross-file races on the shared audit JSONL hash-chain writer.
    fileParallelism: false,
  },
});
