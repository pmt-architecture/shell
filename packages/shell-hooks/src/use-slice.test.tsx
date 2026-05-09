/**
 * Living example for VITEST_UNIT_TESTING.md
 * Sections demonstrated: 12.3 (renderHook), 4 (toBeUndefined, toEqual)
 */
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { SliceDescriptor } from '@-label-/contracts';
import { createShellStore } from '@-label-/shell-core';

import { ShellApiProvider } from './use-shell-api.js';
import { useSlice } from './use-slice.js';

interface FleetState {
  vehicleCount: number;
}

const FLEET_DESCRIPTOR: SliceDescriptor<FleetState> = {
  name: 'fleet',
  initialState: { vehicleCount: 0 },
};

// Inline navigation slice — ShellApiProvider requires setNavigate
const navigationSlice = (set: (function_: (state: Record<string, unknown>) => Record<string, unknown>) => void) => ({
  navigateCallback: null,
  setNavigate: (function_: (path: string) => void) => set(() => ({ navigateCallback: function_ })),
});

const createTestStore = () => createShellStore({ slices: { navigation: navigationSlice } });

describe('useSlice', () => {
  const createWrapper = (store: ReturnType<typeof createShellStore>) => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter>
        <ShellApiProvider store={store}>{children}</ShellApiProvider>
      </MemoryRouter>
    );
    return Wrapper;
  };

  // Section 4.2 — toBeUndefined for missing slice
  it('returns undefined when slice is not registered', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useSlice<FleetState>(FLEET_DESCRIPTOR), { wrapper: createWrapper(store) });
    expect(result.current).toBeUndefined();
  });

  // Section 4.1 — toEqual for registered slice state
  it('returns slice state after registration', () => {
    const store = createTestStore();
    store.getState().registerSlice(FLEET_DESCRIPTOR);

    const { result } = renderHook(() => useSlice<FleetState>(FLEET_DESCRIPTOR), { wrapper: createWrapper(store) });
    expect(result.current).toEqual({ vehicleCount: 0 });
  });
});
