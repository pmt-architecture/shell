/**
 * Living example for VITEST_UNIT_TESTING.md
 * Sections demonstrated: 3 (beforeEach/afterEach, describe nesting), 4 (matchers), 10 (callback vi.fn)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { EventDescriptor, SliceDescriptor } from '@-label-/shell-contracts';

import type { SampleEntityRef } from './__test-fixtures__/types.js';
import type { NavigationSliceState } from './slices/navigation.slice.js';
import { navigationSlice } from './slices/navigation.slice.js';
import type { RightBarSliceState } from './slices/right-bar.slice.js';
import { rightBarSlice } from './slices/right-bar.slice.js';
import { createShellStore, onSliceChange, onSliceEvent, type ShellStore } from './shell-store.js';
import type { DynamicSlicesState } from './types.js';

type TypedState = DynamicSlicesState & RightBarSliceState & NavigationSliceState;
const getState = (store: ShellStore): TypedState => store.getState() as unknown as TypedState;

// Test slice descriptor for dynamic slice tests
interface FleetState {
  vehicleCount: number;
  selectedId: string | null;
}

const FLEET_SLICE: SliceDescriptor<FleetState> = {
  name: 'fleet',
  initialState: { vehicleCount: 0, selectedId: null },
};

// Test event descriptor for slice-events tests
const VEHICLE_SELECTED_EVENT: EventDescriptor<SampleEntityRef> = {
  sliceName: 'fleet',
  eventName: 'vehicleSelected',
};

const vehicleFixture: SampleEntityRef = { id: 'v-1', label: 'AA-00-BB', status: 'active' };

describe('createShellStore', () => {
  // Section 3.3 — beforeEach: fresh store per test
  let store: ShellStore;

  beforeEach(() => {
    store = createShellStore({
      slices: {
        rightBar: rightBarSlice,
        navigation: navigationSlice,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Section 3.2 — describe nesting: group by feature
  describe('host slices initialisation', () => {
    it('initialises rightBar with empty stack', () => {
      // Section 4.1 — toEqual for deep comparison
      expect(getState(store).rightBar).toEqual({ isOpen: false, stack: [] });
    });

    it('initialises navigation with null callback', () => {
      // Section 4.2 — toBeNull
      expect(getState(store).navigateCallback).toBeNull();
    });

    it('initialises dynamic registries empty', () => {
      expect(getState(store).dynamicSlices).toEqual({});
      expect(getState(store).dynamicEvents).toEqual({});
    });
  });

  describe('dynamic slice registry', () => {
    it('registers a slice with initial state', () => {
      getState(store).registerSlice(FLEET_SLICE);

      expect(getState(store).dynamicSlices['fleet']).toBeDefined();
      expect(getState(store).dynamicSlices['fleet']).toEqual({ vehicleCount: 0, selectedId: null });
    });

    it('initialises an empty events bucket when a slice is registered', () => {
      getState(store).registerSlice(FLEET_SLICE);

      expect(getState(store).dynamicEvents['fleet']).toEqual({});
    });

    it('fail-fast: duplicate registration logs an error and does not overwrite state', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      getState(store).registerSlice(FLEET_SLICE);
      // Mutate the existing slice so we can prove the second register does NOT reset it
      getState(store).setSliceState<FleetState>('fleet', { vehicleCount: 99 });

      getState(store).registerSlice(FLEET_SLICE);

      expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/already registered/));
      // State must still reflect the previous write, not the initialState
      expect(getState(store).dynamicSlices['fleet']).toMatchObject({ vehicleCount: 99 });
    });

    it('returns undefined for unregistered slice via getSliceState', () => {
      expect(getState(store).getSliceState('nonexistent')).toBeUndefined();
    });

    it('retrieves registered slice state via getSliceState', () => {
      getState(store).registerSlice(FLEET_SLICE);

      const state = getState(store).getSliceState<FleetState>('fleet');
      expect(state).toEqual({ vehicleCount: 0, selectedId: null });
    });
  });

  describe('unregisterSlice', () => {
    it('removes the slice and its events bucket', () => {
      getState(store).registerSlice(FLEET_SLICE);
      getState(store).emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);
      expect(getState(store).dynamicSlices['fleet']).toBeDefined();
      expect(getState(store).dynamicEvents['fleet']).toBeDefined();

      getState(store).unregisterSlice('fleet');

      expect(getState(store).dynamicSlices['fleet']).toBeUndefined();
      expect(getState(store).dynamicEvents['fleet']).toBeUndefined();
    });

    it('allows re-registering the same name after unregister', () => {
      getState(store).registerSlice(FLEET_SLICE);
      getState(store).unregisterSlice('fleet');

      // Second register after a proper unregister is expected to succeed
      getState(store).registerSlice(FLEET_SLICE);

      expect(getState(store).dynamicSlices['fleet']).toEqual({ vehicleCount: 0, selectedId: null });
    });

    it('is a no-op for unknown slices', () => {
      const before = { ...getState(store).dynamicSlices };
      getState(store).unregisterSlice('nonexistent');

      expect(getState(store).dynamicSlices).toEqual(before);
    });
  });

  describe('setSliceState (state semantics — Object.is equality)', () => {
    it('merges partial state into existing slice', () => {
      getState(store).registerSlice(FLEET_SLICE);
      getState(store).setSliceState<FleetState>('fleet', { vehicleCount: 42 });

      expect(getState(store).dynamicSlices['fleet']).toMatchObject({ vehicleCount: 42, selectedId: null });
    });

    it('is a no-op when slice does not exist', () => {
      getState(store).setSliceState('nonexistent', { foo: 'bar' });
      expect(getState(store).dynamicSlices['nonexistent']).toBeUndefined();
    });

    it('fan-out: all subscribers receive a state change', () => {
      getState(store).registerSlice(FLEET_SLICE);

      const listenerA = vi.fn();
      const listenerB = vi.fn();
      const listenerC = vi.fn();
      onSliceChange<FleetState>(store, 'fleet', listenerA);
      onSliceChange<FleetState>(store, 'fleet', listenerB);
      onSliceChange<FleetState>(store, 'fleet', listenerC);

      getState(store).setSliceState<FleetState>('fleet', { vehicleCount: 7 });

      expect(listenerA).toHaveBeenCalledTimes(1);
      expect(listenerB).toHaveBeenCalledTimes(1);
      expect(listenerC).toHaveBeenCalledTimes(1);
    });
  });

  describe('onSliceChange', () => {
    it('fires listener when slice state changes', () => {
      getState(store).registerSlice(FLEET_SLICE);

      const listener = vi.fn();
      onSliceChange<FleetState>(store, 'fleet', listener);

      getState(store).setSliceState<FleetState>('fleet', { vehicleCount: 10 });

      expect(listener).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ vehicleCount: 10 }), expect.anything());
    });

    it('returns unsubscribe function', () => {
      getState(store).registerSlice(FLEET_SLICE);
      const listener = vi.fn();
      const unsubscribe = onSliceChange(store, 'fleet', listener);

      unsubscribe();
      getState(store).setSliceState<FleetState>('fleet', { vehicleCount: 99 });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('slice events (emitSliceEvent / onSliceEvent)', () => {
    it('listener receives unwrapped payload (no __nonce)', () => {
      getState(store).registerSlice(FLEET_SLICE);
      const listener = vi.fn();
      onSliceEvent(store, VEHICLE_SELECTED_EVENT, listener);

      getState(store).emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);

      expect(listener).toHaveBeenCalledExactlyOnceWith(vehicleFixture);
    });

    it('same payload reference emitted twice fires listener twice (nonce bypasses Object.is)', () => {
      getState(store).registerSlice(FLEET_SLICE);
      const listener = vi.fn();
      onSliceEvent(store, VEHICLE_SELECTED_EVENT, listener);

      getState(store).emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);
      getState(store).emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);

      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('fan-out: all subscribers receive a single emit', () => {
      getState(store).registerSlice(FLEET_SLICE);

      const listenerA = vi.fn();
      const listenerB = vi.fn();
      const listenerC = vi.fn();
      onSliceEvent(store, VEHICLE_SELECTED_EVENT, listenerA);
      onSliceEvent(store, VEHICLE_SELECTED_EVENT, listenerB);
      onSliceEvent(store, VEHICLE_SELECTED_EVENT, listenerC);

      getState(store).emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);

      expect(listenerA).toHaveBeenCalledExactlyOnceWith(vehicleFixture);
      expect(listenerB).toHaveBeenCalledExactlyOnceWith(vehicleFixture);
      expect(listenerC).toHaveBeenCalledExactlyOnceWith(vehicleFixture);
    });

    it('listener subscribed before slice registration fires after registration + emit', () => {
      const listener = vi.fn();
      onSliceEvent(store, VEHICLE_SELECTED_EVENT, listener);

      expect(listener).not.toHaveBeenCalled();

      getState(store).registerSlice(FLEET_SLICE);
      getState(store).emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);

      expect(listener).toHaveBeenCalledExactlyOnceWith(vehicleFixture);
    });

    it('unsubscribe prevents further listener invocations', () => {
      getState(store).registerSlice(FLEET_SLICE);
      const listener = vi.fn();
      const unsubscribe = onSliceEvent(store, VEHICLE_SELECTED_EVENT, listener);

      unsubscribe();
      getState(store).emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);

      expect(listener).not.toHaveBeenCalled();
    });

    it('emit without prior registration logs an error and drops the event', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const listener = vi.fn();
      onSliceEvent(store, VEHICLE_SELECTED_EVENT, listener);

      getState(store).emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);

      expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/before slice was registered/));
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('rightBar actions', () => {
    it('openPanel pushes to stack', () => {
      getState(store).openPanel({ panelId: 'vehicle-detail', payload: { id: '123' } });

      expect(getState(store).rightBar.isOpen).toBe(true);
      expect(getState(store).rightBar.stack).toHaveLength(1);
      expect(getState(store).rightBar.stack[0]).toEqual({
        panelId: 'vehicle-detail',
        payload: { id: '123' },
      });
    });

    it('closePanel pops from stack', () => {
      getState(store).openPanel({ panelId: 'p1', payload: {} });
      getState(store).openPanel({ panelId: 'p2', payload: {} });
      getState(store).closePanel();

      expect(getState(store).rightBar.stack).toHaveLength(1);
      expect(getState(store).rightBar.stack[0]?.panelId).toBe('p1');
    });

    it('closePanel sets isOpen to false when stack is empty', () => {
      getState(store).openPanel({ panelId: 'p1', payload: {} });
      getState(store).closePanel();

      expect(getState(store).rightBar.isOpen).toBe(false);
      expect(getState(store).rightBar.stack).toHaveLength(0);
    });
  });
});
