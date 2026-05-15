import { createContext, use, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';

import type { ShellApi } from '@-label-/shell-contracts';
import type { ShellStore } from '@-label-/shell-core';
import { createShellApi } from '@-label-/shell-core';

import { getShellStoreInstance, setShellStoreInstance, useShellStore } from './use-shell-store';

const ShellApiContext = createContext<ShellApi | null>(null);

interface NavigationSliceState {
  setNavigate: (navigateFunction: (path: string) => void) => void;
}

export const ShellApiProvider = ({ children, store }: { children: React.ReactNode; store: ShellStore }): React.JSX.Element => {
  // Initialise the module-level store reference before any hook reads it.
  // useRef with null-check is the compiler-safe pattern for one-time init
  // during render (see https://react.dev/reference/react/useRef).
  const storeRef = useRef<ShellStore | null>(null);
  if (storeRef.current === null) {
    setShellStoreInstance(store);
    storeRef.current = store;
  }

  const navigate = useNavigate();
  const setNavigate = useShellStore(s => (s as unknown as NavigationSliceState).setNavigate);

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate, setNavigate]);

  const shellApi = useMemo(() => createShellApi(store), [store]);

  return <ShellApiContext value={shellApi}>{children}</ShellApiContext>;
};

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its provider intentionally
export const useShellApi = (): ShellApi => {
  const api = use(ShellApiContext);
  if (!api) throw new Error('useShellApi must be used within ShellApiProvider');
  return api;
};

/**
 * Creates a ShellApi instance scoped to a specific MFE prefix.
 * `navigate` calls are restricted to relative paths — absolute paths are
 * rejected with a console error. The host is the only entity that performs
 * absolute navigation.
 */
// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its provider intentionally
export const useScopedShellApi = (mfePrefix: string): ShellApi => {
  const store = getShellStoreInstance();
  return useMemo(() => createShellApi(store, mfePrefix), [store, mfePrefix]);
};
