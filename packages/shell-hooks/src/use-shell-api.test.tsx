/**
 * Living example for VITEST_UNIT_TESTING.md
 * Sections demonstrated: 12.3 (renderHook), 12.7 (suppress errors), 4 (toThrow)
 */
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createShellStore } from '@-label-/shell-core';

import { ShellApiProvider, useShellApi } from './use-shell-api.js';

// Inline navigation slice — the ShellApiProvider requires setNavigate in the store
// Cannot import from @-label-/shell-core/slices/* (not exported as sub-path)
const navigationSlice = (set: (function_: (state: Record<string, unknown>) => Record<string, unknown>) => void) => ({
  navigateCallback: null,
  setNavigate: (function_: (path: string) => void) => set(() => ({ navigateCallback: function_ })),
});

const createTestStore = () => createShellStore({ slices: { navigation: navigationSlice } });

describe('useShellApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Section 12.7 — suppress expected error + Section 4.7 toThrow
  it('throws when used outside ShellApiProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useShellApi())).toThrow('useShellApi must be used within ShellApiProvider');

    consoleSpy.mockRestore();
  });

  // Section 12.3 — renderHook with wrapper provider
  it('returns ShellApi when inside ShellApiProvider', () => {
    const store = createTestStore();

    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter>
        <ShellApiProvider store={store}>{children}</ShellApiProvider>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useShellApi(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.navigate).toBeDefined();
    expect(result.current.registerSlice).toBeDefined();
  });
});
