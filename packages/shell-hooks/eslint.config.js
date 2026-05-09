import { defineConfig } from 'eslint/config';
import { fullReactConfigs } from '@-label-/lint-config';

export default defineConfig([
  ...fullReactConfigs,
  {
    ignores: ['**/coverage/', 'CHANGELOG.md'],
  },
]);
