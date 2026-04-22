// Vitest config for the dashboard. Reuses Vite's resolve/TS/JSX pipeline.
// `globals: true` means existing Jest-style tests (`describe`, `it`,
// `expect`, `jest.*`) work without per-file imports.

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules/**',
      'dist/**',
    ],
    // Cap default timeouts — happy-dom is fast; anything slower than 10s
    // indicates a real problem worth surfacing rather than swallowing.
    testTimeout: 10_000,
  },
});
