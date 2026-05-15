import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import type { EventDescriptor, SliceDescriptor } from '@-label-/shell-contracts';

import type { DynamicSlicesState, EventEnvelope, SliceFactory } from './types';

export interface CreateShellStoreOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Accepts any slice factory regardless of state shape
  slices?: Record<string, SliceFactory<any>>;
  devtools?: { enabled: boolean; name: string };
}

export type ShellStore = ReturnType<typeof createShellStore>;

export const createShellStore = (options: CreateShellStoreOptions = {}) => {
  const { slices: sliceFactories = {}, devtools: devtoolsOptions } = options;

  return createStore<DynamicSlicesState & Record<string, unknown>>()(
    devtools(
      subscribeWithSelector((set, get) => {
        // Build host slices from factories
        const hostSliceState: Record<string, unknown> = {};
        for (const factory of Object.values(sliceFactories)) {
          Object.assign(hostSliceState, factory(set, get));
        }

        return {
          // Dynamic slice registry — state
          dynamicSlices: {} as Record<string, unknown>,
          dynamicEvents: {} as Record<string, Record<string, EventEnvelope>>,

          /**
           * Register a dynamic slice. Fail-fast: registering a name that already
           * exists logs an error and leaves the existing slice untouched. Each
           * mount site must own a unique slice — the descriptor name is the
           * identity. If two places could legitimately "own" the same data they
           * should have their own slices and consumers subscribe to both.
           */
          registerSlice: <T>(descriptor: SliceDescriptor<T>) => {
            const { name, initialState } = descriptor;
            if (get().dynamicSlices[name] !== undefined) {
              console.error(
                `[shell-store] registerSlice("${name}") called but the slice is already registered. ` +
                  `Each mount site must own a unique slice — pick a different name for this owner.`,
              );
              return;
            }
            set(
              (state: DynamicSlicesState) => ({
                dynamicSlices: {
                  ...state.dynamicSlices,
                  [name]: initialState,
                },
                dynamicEvents: {
                  ...state.dynamicEvents,
                  [name]: {},
                },
              }),
              undefined,
              `slices/register:${name}`,
            );
          },

          unregisterSlice: (name: string) => {
            set(
              (state: DynamicSlicesState) => {
                if (state.dynamicSlices[name] === undefined) return {};
                const { [name]: removedSlice, ...remainingSlices } = state.dynamicSlices;
                const { [name]: removedEvents, ...remainingEvents } = state.dynamicEvents;
                void removedSlice;
                void removedEvents;
                return {
                  dynamicSlices: remainingSlices,
                  dynamicEvents: remainingEvents,
                };
              },
              undefined,
              `slices/unregister:${name}`,
            );
          },

          getSliceState: <T>(name: string): T | undefined => {
            return get().dynamicSlices[name] as T | undefined;
          },

          setSliceState: <T>(name: string, partial: Partial<T>) => {
            set(
              (state: DynamicSlicesState) => {
                const current = state.dynamicSlices[name];
                if (current === undefined) return {};
                return {
                  dynamicSlices: {
                    ...state.dynamicSlices,
                    [name]: { ...(current as Record<string, unknown>), ...partial },
                  },
                };
              },
              undefined,
              `slices/setState:${name}`,
            );
          },

          emitSliceEvent: <T>(descriptor: EventDescriptor<T>, payload: T) => {
            const { sliceName, eventName } = descriptor;
            const currentBucket = get().dynamicEvents[sliceName];
            if (currentBucket === undefined) {
              console.error(
                `[shell-store] emitSliceEvent("${sliceName}.${eventName}") called before slice was registered. ` +
                  `The owner MFE must call registerSlice() before emitting events. Event dropped.`,
              );
              return;
            }
            set(
              (state: DynamicSlicesState) => ({
                dynamicEvents: {
                  ...state.dynamicEvents,
                  [sliceName]: {
                    ...state.dynamicEvents[sliceName],
                    [eventName]: { __nonce: crypto.randomUUID(), value: payload },
                  },
                },
              }),
              undefined,
              `events/emit:${sliceName}.${eventName}`,
            );
          },

          // Host slices
          ...hostSliceState,
        };
      }),
      {
        name: devtoolsOptions?.name ?? 'shell-store',
        enabled: devtoolsOptions?.enabled ?? false,
      },
    ),
  );
};

/**
 * Subscribe to changes in a specific dynamic slice (state semantics).
 * Returns an unsubscribe function.
 * Uses Zustand's subscribeWithSelector with Object.is equality — only fires
 * when the slice reference changes.
 */
export const onSliceChange = <T>(store: ShellStore, name: string, listener: (state: T) => void): (() => void) => {
  return store.subscribe((state: DynamicSlicesState) => state.dynamicSlices[name] as T, listener);
};

/**
 * Subscribe to events of a specific slice (fire-and-forget semantics).
 * Returns an unsubscribe function. The listener is called with the unwrapped
 * payload — the internal `__nonce` is hidden.
 *
 * A fresh nonce on every emit guarantees the selector sees a new reference,
 * so listeners fire even when the same payload is emitted repeatedly.
 */
export const onSliceEvent = <T>(store: ShellStore, descriptor: EventDescriptor<T>, listener: (payload: T) => void): (() => void) => {
  return store.subscribe(
    (state: DynamicSlicesState) => state.dynamicEvents[descriptor.sliceName]?.[descriptor.eventName],
    wrapped => {
      if (wrapped !== undefined) listener((wrapped as EventEnvelope<T>).value);
    },
  );
};
