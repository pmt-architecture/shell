/**
 * Living example for VITEST_UNIT_TESTING.md
 * Sections demonstrated: 8 (vi.fn, vi.spyOn console.error), 4 (toMatch regex, toBeNull)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { EventDescriptor } from '@-label-/contracts';

import type { SampleEntityRef } from './__test-fixtures__/types.js';
import type { NavigationSliceState } from './slices/navigation.slice.js';
import { navigationSlice } from './slices/navigation.slice.js';
import type { RightBarSliceState } from './slices/right-bar.slice.js';
import { rightBarSlice } from './slices/right-bar.slice.js';
import { createShellApi } from './create-shell-api.js';
import { createShellStore, type ShellStore } from './shell-store.js';
import type { DynamicSlicesState } from './types.js';

type TypedState = DynamicSlicesState & RightBarSliceState & NavigationSliceState;
const getState = (store: ShellStore): TypedState => store.getState() as unknown as TypedState;

const vehicleFixture: SampleEntityRef = { id: 'v-1', label: 'AA-00-BB', status: 'active' };

const VEHICLE_SELECTED_EVENT: EventDescriptor<SampleEntityRef> = {
  sliceName: 'fleet',
  eventName: 'vehicleSelected',
};

describe('createShellApi', () => {
  let store: ShellStore;

  beforeEach(() => {
    store = createShellStore({
      slices: {
        rightBar: rightBarSlice,
        navigation: navigationSlice,
      },
    });
    // Wire up a mock navigate callback
    getState(store).setNavigate(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('navigate without mfePrefix (host)', () => {
    it('calls navigateCallback with the path as-is', () => {
      const api = createShellApi(store);
      api.navigate('/fleet/123');

      // Section 8.1 — vi.fn + toHaveBeenCalledWith
      expect(getState(store).navigateCallback).toHaveBeenCalledWith('/fleet/123');
    });

    it('accepts absolute paths', () => {
      const api = createShellApi(store);
      api.navigate('/rentals');

      expect(getState(store).navigateCallback).toHaveBeenCalledWith('/rentals');
    });
  });

  describe('navigate with mfePrefix (scoped)', () => {
    it('resolves relative path to /{prefix}/{path}', () => {
      const api = createShellApi(store, 'rentals');
      api.navigate('123/edit');

      expect(getState(store).navigateCallback).toHaveBeenCalledWith('/rentals/123/edit');
    });

    it('resolves empty path to /{prefix}', () => {
      const api = createShellApi(store, 'fleet');
      api.navigate('');

      expect(getState(store).navigateCallback).toHaveBeenCalledWith('/fleet');
    });

    it('blocks absolute paths and logs error', () => {
      // Section 8.2 — vi.spyOn console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const api = createShellApi(store, 'rentals');
      api.navigate('/fleet');

      // Navigation callback should NOT be called
      expect(getState(store).navigateCallback).not.toHaveBeenCalled();

      // Section 4.4 — toMatch regex on error message
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/absolute navigation.*\/fleet/));

      consoleSpy.mockRestore();
    });
  });

  describe('slice events via ShellApi', () => {
    it('emitSliceEvent + onSliceEvent delegate through the API', () => {
      const api = createShellApi(store);
      api.registerSlice({ name: 'fleet', initialState: { selectedVehicle: null } });

      const listener = vi.fn();
      api.onSliceEvent(VEHICLE_SELECTED_EVENT, listener);

      api.emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);

      // Listener receives the unwrapped payload, not the { __nonce, value } envelope.
      expect(listener).toHaveBeenCalledExactlyOnceWith(vehicleFixture);
    });

    it('fan-out via ShellApi: N consumers receive a single emit', () => {
      const api = createShellApi(store);
      api.registerSlice({ name: 'fleet', initialState: { selectedVehicle: null } });

      const listenerA = vi.fn();
      const listenerB = vi.fn();
      api.onSliceEvent(VEHICLE_SELECTED_EVENT, listenerA);
      api.onSliceEvent(VEHICLE_SELECTED_EVENT, listenerB);

      api.emitSliceEvent(VEHICLE_SELECTED_EVENT, vehicleFixture);

      expect(listenerA).toHaveBeenCalledExactlyOnceWith(vehicleFixture);
      expect(listenerB).toHaveBeenCalledExactlyOnceWith(vehicleFixture);
    });
  });

  describe('panel delegation', () => {
    it('openPanel delegates to store', () => {
      const api = createShellApi(store);
      api.openPanel({ panelId: 'detail', payload: { id: '1' } });

      expect(getState(store).rightBar.isOpen).toBe(true);
      expect(getState(store).rightBar.stack).toHaveLength(1);
    });

    it('closePanel delegates to store', () => {
      const api = createShellApi(store);
      api.openPanel({ panelId: 'detail', payload: {} });
      api.closePanel();

      expect(getState(store).rightBar.isOpen).toBe(false);
    });
  });
});
