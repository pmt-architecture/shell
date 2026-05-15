import type { EventDescriptor, SliceDescriptor } from '@-label-/shell-contracts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Slice factories receive zustand's set/get which operate on the composed store type, unknown at compile time
export type SliceFactory<T = Record<string, unknown>> = (set: (function_: (state: any) => any) => void, get: () => any) => T;

/**
 * Wrapped value stored in `dynamicEvents`. The `__nonce` is generated fresh on
 * every emit (via `crypto.randomUUID()`) so Zustand's `Object.is` equality
 * check always sees a different reference — guaranteeing listeners fire even
 * when the same payload is emitted repeatedly.
 */
export interface EventEnvelope<T = unknown> {
  __nonce: string;
  value: T;
}

export interface DynamicSlicesState {
  dynamicSlices: Record<string, unknown>;
  dynamicEvents: Record<string, Record<string, EventEnvelope>>;
  registerSlice: <T>(descriptor: SliceDescriptor<T>) => void;
  unregisterSlice: (name: string) => void;
  getSliceState: <T>(name: string) => T | undefined;
  setSliceState: <T>(name: string, partial: Partial<T>) => void;
  emitSliceEvent: <T>(descriptor: EventDescriptor<T>, payload: T) => void;
}

export { type EventDescriptor, type SliceDescriptor } from '@-label-/shell-contracts';
