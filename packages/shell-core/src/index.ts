// Store
export type { CreateShellStoreOptions, ShellStore } from './shell-store';
export { createShellStore, onSliceChange, onSliceEvent } from './shell-store';

// ShellApi factory
export { createShellApi } from './create-shell-api';

// Slice factories
export type { NavigationSliceState } from './slices/navigation.slice';
export { navigationSlice } from './slices/navigation.slice';
export type { RightBarSliceState } from './slices/right-bar.slice';
export { rightBarSlice } from './slices/right-bar.slice';

// Types
export type { DynamicSlicesState, EventDescriptor, EventEnvelope, SliceDescriptor, SliceFactory } from './types';
