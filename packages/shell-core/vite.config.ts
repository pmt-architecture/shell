import { defineConfig } from 'vite';

import { createLibraryConfig } from '@-label-/vite-lib-config';

export default defineConfig(
  createLibraryConfig({
    root: import.meta.dirname,
  }),
);
