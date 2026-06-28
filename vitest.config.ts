import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// Unit-test runner. The app build (tsconfig.app.json + vite build) is unchanged;
// this config exists only so Threads (and future) logic/components can be tested.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Keep the test surface scoped to opted-in areas; the rest of the repo uses
    // Playwright e2e + tsx verification scripts.
    setupFiles: [],
  },
});
