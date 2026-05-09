/**
 * Living example for VITEST_UNIT_TESTING.md
 * Sections demonstrated: 12.3 (renderHook), 12.7 (suppress errors), 10 (callback vi.fn)
 */
import { type ReactNode, useState } from 'react';
import { MemoryRouter } from 'react-router';
import { act, render, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { EventDescriptor } from '@-label-/contracts';
import { createShellStore } from '@-label-/shell-core';

import type { SampleEntityRef } from './__test-fixtures__/types.js';
import { ShellApiProvider } from './use-shell-api.js';
import { useSliceEvent } from './use-slice-event.js';

// Inline navigation slice — ShellApiProvider requires setNavigate in the store
const navigationSlice = (set: (function_: (state: Record<string, unknown>) => Record<string, unknown>) => void) => ({
  navigateCallback: null,
  setNavigate: (function_: (path: string) => void) => set(() => ({ navigateCallback: function_ })),
});

const createTestStore = () => createShellStore({ slices: { navigation: navigationSlice } });

const VEHICLE_SELECTED_EVENT: EventDescriptor<SampleEntityRef> = {
  sliceName: 'fleet',
  eventName: 'vehicleSelected',
};

const vehicleFixture: SampleEntityRef = { id: 'v-1', label: 'AA-00-BB', status: 'active' };

const createWrapper = (store: ReturnType<typeof createShellStore>) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <ShellApiProvider store={store}>{children}</ShellApiProvider>
    </MemoryRouter>
  );
  return Wrapper;
};

describe('useSliceEvent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('invokes listener with the unwrapped payload when event is emitted', () => {
    const store = createTestStore();
    store.getState().registerSlice({ name: 'fleet', initialState: { selectedVehicle: null } });

    const listener = vi.fn();
    renderHook(() => useSliceEvent(VEHICLE_SELECTED_EVENT, listener), { wrapper: createWrapper(store) });

    act(() => {
      store.getState().emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);
    });

    expect(listener).toHaveBeenCalledExactlyOnceWith(vehicleFixture);
  });

  it('fires listener every time for repeated emits of the same payload (nonce bypass)', () => {
    const store = createTestStore();
    store.getState().registerSlice({ name: 'fleet', initialState: { selectedVehicle: null } });

    const listener = vi.fn();
    renderHook(() => useSliceEvent(VEHICLE_SELECTED_EVENT, listener), { wrapper: createWrapper(store) });

    act(() => {
      store.getState().emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);
      store.getState().emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);
      store.getState().emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);
    });

    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('unsubscribes on unmount', () => {
    const store = createTestStore();
    store.getState().registerSlice({ name: 'fleet', initialState: { selectedVehicle: null } });

    const listener = vi.fn();
    const { unmount } = renderHook(() => useSliceEvent(VEHICLE_SELECTED_EVENT, listener), {
      wrapper: createWrapper(store),
    });

    unmount();

    act(() => {
      store.getState().emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);
    });

    expect(listener).not.toHaveBeenCalled();
  });

  it('does NOT re-render the host component when event fires (listener-only by design)', () => {
    const store = createTestStore();
    store.getState().registerSlice({ name: 'fleet', initialState: { selectedVehicle: null } });

    let renderCount = 0;
    // oxlint-disable-next-line no-multi-comp -- Test probe scoped to this test only
    const RenderCountProbe = () => {
      renderCount += 1;
      useSliceEvent(VEHICLE_SELECTED_EVENT, () => {
        // Listener intentionally does nothing — no state update, no side effect that forces a render.
      });
      return null;
    };

    render(
      <MemoryRouter>
        <ShellApiProvider store={store}>
          <RenderCountProbe />
        </ShellApiProvider>
      </MemoryRouter>,
    );
    const initialRenders = renderCount;

    act(() => {
      store.getState().emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);
      store.getState().emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);
    });

    expect(renderCount).toBe(initialRenders);
  });

  it('composes with useState to expose the payload as UI state (documented pattern)', () => {
    const store = createTestStore();
    store.getState().registerSlice({ name: 'fleet', initialState: { selectedVehicle: null } });

    // oxlint-disable-next-line no-multi-comp -- Test probe scoped to this test only
    const UseStateProbe = () => {
      const [vehicle, setVehicle] = useState<SampleEntityRef | null>(null);
      useSliceEvent(VEHICLE_SELECTED_EVENT, setVehicle);
      return <div data-testid="label">{vehicle?.label ?? 'none'}</div>;
    };

    const { getByTestId } = render(
      <MemoryRouter>
        <ShellApiProvider store={store}>
          <UseStateProbe />
        </ShellApiProvider>
      </MemoryRouter>,
    );

    expect(getByTestId('label').textContent).toBe('none');

    act(() => {
      store.getState().emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);
    });

    expect(getByTestId('label').textContent).toBe('AA-00-BB');
  });
});
