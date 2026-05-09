import { useStore } from 'zustand';

import type { DynamicSlicesState, ShellStore } from '@-label-/shell-core';

// Module-level reference to the store instance, set by ShellApiProvider
let storeInstance: ShellStore | null = null;

export const setShellStoreInstance = (store: ShellStore): void => {
  storeInstance = store;
};

export const getShellStoreInstance = (): ShellStore => {
  if (!storeInstance) throw new Error('Shell store not initialised. Wrap your app with ShellApiProvider.');
  return storeInstance;
};

export const useShellStore = <T>(selector: (state: DynamicSlicesState & Record<string, unknown>) => T): T => {
  return useStore(getShellStoreInstance(), selector);
};
