import type { EventDescriptor, ShellApi, SliceDescriptor } from '@-label-/contracts';

import type { NavigationSliceState } from './slices/navigation.slice';
import type { RightBarSliceState } from './slices/right-bar.slice';
import type { ShellStore } from './shell-store';
import { onSliceChange, onSliceEvent } from './shell-store';
import type { DynamicSlicesState } from './types';

type ShellStoreState = DynamicSlicesState & RightBarSliceState & NavigationSliceState;

const state = (store: ShellStore): ShellStoreState => store.getState() as unknown as ShellStoreState;

/**
 * Creates a ShellApi instance.
 *
 * @param store - The shell store instance.
 * @param mfePrefix - When provided, `navigate` is scoped to relative paths
 *   only. Absolute paths (starting with `/`) are rejected with a console error.
 *   The host is the only entity that should perform absolute navigation.
 */
export const createShellApi = (store: ShellStore, mfePrefix?: string): ShellApi => ({
  // Right-bar
  openPanel: request => state(store).openPanel(request),
  closePanel: () => state(store).closePanel(),
  updatePanelPayload: payload => state(store).updatePanelPayload(payload),

  // Panel lifecycle (ref-counting)
  registerInPanel: panelId => state(store).registerInPanel(panelId),
  unregisterInPanel: panelId => state(store).unregisterInPanel(panelId),

  // Navigation (scoped when mfePrefix is set)
  navigate: path => {
    if (mfePrefix && path.startsWith('/')) {
      console.error(
        `[ShellApi] MFE "${mfePrefix}" attempted absolute navigation: "${path}". ` +
          `MFEs can only navigate within their own routes. ` +
          `Use slices to emit intent for cross-MFE communication.`,
      );
      return;
    }

    const nav = state(store).navigateCallback;
    if (!nav) return;

    if (mfePrefix) {
      const resolved = path === '' ? `/${mfePrefix}` : `/${mfePrefix}/${path}`;
      nav(resolved);
    } else {
      nav(path);
    }
  },

  // Dynamic slice registry — state
  registerSlice: <T>(descriptor: SliceDescriptor<T>) => state(store).registerSlice(descriptor),
  unregisterSlice: (name: string) => state(store).unregisterSlice(name),
  getSliceState: <T>(name: string) => state(store).getSliceState<T>(name),
  setSliceState: <T>(name: string, partial: Partial<T>) => state(store).setSliceState<T>(name, partial),
  onSliceChange: <T>(name: string, listener: (state: T) => void) => onSliceChange<T>(store, name, listener),

  // Dynamic slice registry — events (fire-and-forget)
  emitSliceEvent: <T>(descriptor: EventDescriptor<T>, payload: T) => state(store).emitSliceEvent(descriptor, payload),
  onSliceEvent: <T>(descriptor: EventDescriptor<T>, listener: (payload: T) => void) => onSliceEvent<T>(store, descriptor, listener),
});
