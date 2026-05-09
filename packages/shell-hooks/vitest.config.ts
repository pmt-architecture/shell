import { defineConfig } from 'vitest/config';

import { createTestConfig } from '@-label-/vitest-config';

export default defineConfig(
  createTestConfig({
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  }),
);
